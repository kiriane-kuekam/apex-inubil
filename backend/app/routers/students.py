import io

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_user, require_role
from app.ml.predict import (
    FILIERE_CATEGORIES,
    FREQ_MAP,
    INTER_MAP,
    LOGEMENT_CATEGORIES,
    NIVEAU_CATEGORIES,
    predict_risk,
)
from app.models.student import Student
from app.models.user import ResponsableFiliere, Role, User
from app.schemas.student import ImportResult, ImportRowError, StudentDetail, StudentOut
from app.services.students import scoped_students_query

router = APIRouter(prefix="/students", tags=["students"])

REQUIRED_COLUMNS = [
    "matricule", "nom", "prenom", "filiere", "niveau", "logement",
    "presence_pct", "study_min", "bibliotheque_acces", "interaction_enseignant", "implication",
]


def _cell(row: pd.Series, col: str) -> str:
    val = row.get(col)
    if pd.isna(val):
        return ""
    return str(val).strip()


@router.get("", response_model=list[StudentOut])
def list_students(
    filiere: str | None = Query(default=None),
    niveau: str | None = Query(default=None),
    risque_label: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = scoped_students_query(db, current_user)
    if filiere:
        query = query.filter(Student.filiere == filiere)
    if niveau:
        query = query.filter(Student.niveau == niveau)
    if risque_label:
        query = query.filter(Student.risque_label == risque_label)
    return query.order_by(Student.risque_score.desc()).all()


@router.get("/{student_id}", response_model=StudentDetail)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = scoped_students_query(db, current_user).filter(Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Etudiant introuvable")
    return student


@router.post("/import", response_model=ImportResult)
def import_students(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(Role.RESPONSABLE_PEDAGOGIQUE)),
):
    """Import CSV (';') ou Excel des etudiants, reserve au responsable
    pedagogique. Upsert par matricule, validation stricte des categories
    connues du modele, et garde-fou : seules les lignes de sa/ses filiere(s)
    assignee(s) sont acceptees."""
    filieres_autorisees = {
        f.filiere
        for f in db.query(ResponsableFiliere).filter(ResponsableFiliere.user_id == current_user.id).all()
    }

    content = file.file.read()
    try:
        if file.filename and file.filename.lower().endswith(".xlsx"):
            df = pd.read_excel(io.BytesIO(content), dtype=str)
        else:
            df = pd.read_csv(io.BytesIO(content), sep=";", dtype=str)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Fichier illisible - verifiez le format (CSV avec separateur ';' ou .xlsx)",
        )

    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Colonnes manquantes dans le fichier : {', '.join(missing)}",
        )

    crees = 0
    mis_a_jour = 0
    erreurs: list[ImportRowError] = []

    for idx, row in df.iterrows():
        ligne = int(idx) + 2  # +1 index base 0, +1 ligne d'en-tete
        matricule = _cell(row, "matricule")

        def erreur(msg: str) -> None:
            erreurs.append(ImportRowError(ligne=ligne, matricule=matricule or None, message=msg))

        if not matricule:
            erreur("Matricule manquant")
            continue

        nom = _cell(row, "nom")
        prenom = _cell(row, "prenom")
        filiere = _cell(row, "filiere")
        niveau = _cell(row, "niveau")
        logement = _cell(row, "logement")
        bibliotheque_acces = _cell(row, "bibliotheque_acces")
        interaction_enseignant = _cell(row, "interaction_enseignant")

        if not nom or not prenom:
            erreur("Nom ou prenom manquant")
            continue
        if filiere not in FILIERE_CATEGORIES:
            erreur(f"Filiere inconnue : '{filiere}'")
            continue
        if niveau not in NIVEAU_CATEGORIES:
            erreur(f"Niveau inconnu : '{niveau}'")
            continue
        if logement not in LOGEMENT_CATEGORIES:
            erreur(f"Statut de logement inconnu : '{logement}'")
            continue
        if bibliotheque_acces not in FREQ_MAP:
            erreur(f"Valeur d'acces a la bibliotheque inconnue : '{bibliotheque_acces}'")
            continue
        if interaction_enseignant not in INTER_MAP:
            erreur(f"Valeur d'interaction enseignant inconnue : '{interaction_enseignant}'")
            continue

        try:
            presence_pct = float(_cell(row, "presence_pct"))
            study_min = int(float(_cell(row, "study_min")))
            implication = int(float(_cell(row, "implication")))
        except (TypeError, ValueError):
            erreur("presence_pct / study_min / implication doivent etre numeriques")
            continue

        if not (0 <= presence_pct <= 100):
            erreur("presence_pct doit etre compris entre 0 et 100")
            continue
        if study_min < 0:
            erreur("study_min doit etre positif")
            continue

        if filiere not in filieres_autorisees:
            erreur(f"Filiere '{filiere}' hors de votre perimetre assigne")
            continue

        existant = db.query(Student).filter(Student.matricule == matricule).first()
        if existant and existant.filiere not in filieres_autorisees:
            erreur("Cet etudiant appartient a une filiere hors de votre perimetre")
            continue

        prediction = predict_risk(
            presence_pct=presence_pct,
            study_min=study_min,
            bibliotheque_acces=bibliotheque_acces,
            interaction_enseignant=interaction_enseignant,
            implication=implication,
            filiere=filiere,
            niveau=niveau,
            logement=logement,
        )

        if existant:
            existant.nom = nom
            existant.prenom = prenom
            existant.filiere = filiere
            existant.niveau = niveau
            existant.logement = logement
            existant.presence_pct = presence_pct
            existant.study_min = study_min
            existant.bibliotheque_acces = bibliotheque_acces
            existant.interaction_enseignant = interaction_enseignant
            existant.implication = implication
            existant.risque_score = round(prediction["risque_score"], 4)
            existant.risque_label = prediction["risque_label"]
            existant.recommandation = prediction["recommandation"]
            mis_a_jour += 1
        else:
            db.add(
                Student(
                    matricule=matricule,
                    nom=nom,
                    prenom=prenom,
                    filiere=filiere,
                    niveau=niveau,
                    logement=logement,
                    presence_pct=presence_pct,
                    study_min=study_min,
                    bibliotheque_acces=bibliotheque_acces,
                    interaction_enseignant=interaction_enseignant,
                    implication=implication,
                    risque_score=round(prediction["risque_score"], 4),
                    risque_label=prediction["risque_label"],
                    recommandation=prediction["recommandation"],
                )
            )
            crees += 1

    db.commit()
    return ImportResult(crees=crees, mis_a_jour=mis_a_jour, erreurs=erreurs)
