from collections import defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_user
from app.models.student import Student
from app.models.user import User
from app.schemas.dashboard import DashboardSummary, FiliereSummary
from app.services.students import scoped_students_query

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    students: list[Student] = scoped_students_query(db, current_user).all()

    par_filiere: dict[str, list[Student]] = defaultdict(list)
    for s in students:
        par_filiere[s.filiere].append(s)

    filiere_summaries = []
    for filiere, group in sorted(par_filiere.items()):
        nb = len(group)
        score_moyen = sum(s.risque_score for s in group) / nb if nb else 0.0
        filiere_summaries.append(
            FiliereSummary(
                filiere=filiere,
                nb_etudiants=nb,
                score_moyen=round(score_moyen, 3),
                nb_faible=sum(1 for s in group if s.risque_label == "faible"),
                nb_moyen=sum(1 for s in group if s.risque_label == "moyen"),
                nb_eleve=sum(1 for s in group if s.risque_label == "eleve"),
            )
        )

    nb_total = len(students)
    score_moyen_total = sum(s.risque_score for s in students) / nb_total if nb_total else 0.0
    nb_eleve_total = sum(1 for s in students if s.risque_label == "eleve")

    return DashboardSummary(
        nb_etudiants=nb_total,
        score_moyen=round(score_moyen_total, 3),
        nb_a_risque_eleve=nb_eleve_total,
        par_filiere=filiere_summaries,
    )
