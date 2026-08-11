"""
Peuple la base avec des comptes de demonstration et un jeu d'etudiants
nommes, aux profils varies, avec leur score de risque calcule par le
modele reel.

A executer depuis backend/, dans le venv:
    .venv\\Scripts\\python.exe -m app.seed
"""
import random

from app.core.database import Base, SessionLocal, engine
from app.core.security import get_password_hash
from app.ml.predict import predict_risk
from app.models.student import Student
from app.models.user import EnseignantAffectation, ResponsableFiliere, Role, User

random.seed(7)

FILIERES_DEMO = ["GIT", "GCI", "GE", "Genie logiciel", "GP"]
NIVEAUX = ["Niveau3", "Niveau4", "Niveau5"]
LOGEMENTS = ["Cite universitaire", "Colocation", "Famille", "Seul en studio"]
STUDY_OPTIONS = [15, 45, 60, 90, 120, 180, 240]
FREQ_OPTIONS = ["Jamais", "Rarement", "Souvent", "Toujours"]
INTER_OPTIONS = ["faible", "moyenne", "excellente"]

NOMS = [
    "Mballa", "Ngono", "Fotso", "Kamga", "Ateba", "Nguemo", "Talla", "Biya",
    "Onana", "Eyenga", "Nkeng", "Djoko", "Manga", "Tchoua", "Essomba",
    "Ndongo", "Kenfack", "Mbarga", "Sonkeng", "Abena", "Yomba", "Wandji",
    "Ekani", "Fouda",
]
PRENOMS_F = [
    "Aicha", "Carine", "Divine", "Estelle", "Flore", "Grace", "Huguette",
    "Ines", "Josiane", "Larissa", "Merveille", "Nadege",
]
PRENOMS_M = [
    "Arnaud", "Brice", "Cedric", "Dorian", "Emmanuel", "Franck", "Giresse",
    "Herve", "Ivan", "Junior", "Kevin", "Landry",
]


def profil(archetype: str):
    """Genere des attributs plausibles selon un profil d'engagement."""
    if archetype == "fort":
        return dict(
            presence_pct=round(random.uniform(85, 98), 1),
            study_min=random.choice([120, 180, 240]),
            bibliotheque_acces=random.choice(["Souvent", "Toujours"]),
            interaction_enseignant=random.choice(["moyenne", "excellente"]),
            implication=random.choice([4, 5]),
        )
    if archetype == "moyen":
        return dict(
            presence_pct=round(random.uniform(55, 80), 1),
            study_min=random.choice([45, 60, 90]),
            bibliotheque_acces=random.choice(["Rarement", "Souvent"]),
            interaction_enseignant=random.choice(["faible", "moyenne"]),
            implication=random.choice([2, 3]),
        )
    return dict(  # "faible"
        presence_pct=round(random.uniform(15, 45), 1),
        study_min=random.choice([15, 45]),
        bibliotheque_acces=random.choice(["Jamais", "Rarement"]),
        interaction_enseignant="faible",
        implication=random.choice([1, 2]),
    )


def build_students(names):
    students = []
    archetypes = ["fort"] * 8 + ["moyen"] * 9 + ["faible"] * 8
    random.shuffle(archetypes)

    for i, (nom, prenom) in enumerate(names):
        filiere = FILIERES_DEMO[i % len(FILIERES_DEMO)]
        niveau = random.choice(NIVEAUX)
        logement = random.choice(LOGEMENTS)
        attrs = profil(archetypes[i])

        prediction = predict_risk(
            presence_pct=attrs["presence_pct"],
            study_min=attrs["study_min"],
            bibliotheque_acces=attrs["bibliotheque_acces"],
            interaction_enseignant=attrs["interaction_enseignant"],
            implication=attrs["implication"],
            filiere=filiere,
            niveau=niveau,
            logement=logement,
        )

        students.append(
            Student(
                matricule=f"ISM{2026}{i + 1:03d}",
                nom=nom,
                prenom=prenom,
                filiere=filiere,
                niveau=niveau,
                logement=logement,
                presence_pct=attrs["presence_pct"],
                study_min=attrs["study_min"],
                bibliotheque_acces=attrs["bibliotheque_acces"],
                interaction_enseignant=attrs["interaction_enseignant"],
                implication=attrs["implication"],
                risque_score=round(prediction["risque_score"], 4),
                risque_label=prediction["risque_label"],
                recommandation=prediction["recommandation"],
            )
        )
    return students


def main():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        admin = User(
            email="admin@apexinubil.cm",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin APEX INUBIL",
            role=Role.ADMINISTRATEUR,
            is_active=True,
        )
        enseignant = User(
            email="enseignant@apexinubil.cm",
            hashed_password=get_password_hash("enseignant123"),
            full_name="M. Herve Kenfack",
            role=Role.ENSEIGNANT,
            is_active=True,
        )
        responsable = User(
            email="responsable@apexinubil.cm",
            hashed_password=get_password_hash("responsable123"),
            full_name="Mme Larissa Ateba",
            role=Role.RESPONSABLE_PEDAGOGIQUE,
            is_active=True,
        )
        db.add_all([admin, enseignant, responsable])
        db.commit()
        db.refresh(enseignant)
        db.refresh(responsable)

        db.add_all([
            ResponsableFiliere(user_id=responsable.id, filiere="GCI"),
            ResponsableFiliere(user_id=responsable.id, filiere="GE"),
            EnseignantAffectation(user_id=enseignant.id, filiere="GIT", niveau="Niveau4"),
            EnseignantAffectation(user_id=enseignant.id, filiere="GIT", niveau="Niveau5"),
        ])
        db.commit()

        names = []
        for i in range(25):
            prenoms = PRENOMS_F if i % 2 == 0 else PRENOMS_M
            names.append((random.choice(NOMS), random.choice(prenoms)))

        students = build_students(names)
        for s in students:
            db.add(s)
        db.commit()

        nb_eleve = sum(1 for s in students if s.risque_label == "eleve")
        nb_moyen = sum(1 for s in students if s.risque_label == "moyen")
        nb_faible = sum(1 for s in students if s.risque_label == "faible")
        print(f"{len(students)} etudiants crees (faible={nb_faible}, moyen={nb_moyen}, eleve={nb_eleve})")
        print("Comptes de demo:")
        print("  admin@apexinubil.cm / admin123")
        print("  enseignant@apexinubil.cm / enseignant123")
        print("  responsable@apexinubil.cm / responsable123")
    finally:
        db.close()


if __name__ == "__main__":
    main()
