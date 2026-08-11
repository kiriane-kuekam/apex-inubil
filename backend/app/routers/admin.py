import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import require_role
from app.ml.predict import FILIERE_CATEGORIES
from app.ml.train import METRICS_PATH
from app.models.student import Student
from app.models.user import Role, User
from app.schemas.admin import AdminSummary, ModelMetrics

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_role(Role.ADMINISTRATEUR))],
)


@router.get("/summary", response_model=AdminSummary)
def admin_summary(db: Session = Depends(get_db)):
    with open(METRICS_PATH, encoding="utf-8") as f:
        metrics = json.load(f)

    return AdminSummary(
        nb_administrateurs=db.query(User).filter(User.role == Role.ADMINISTRATEUR).count(),
        nb_enseignants=db.query(User).filter(User.role == Role.ENSEIGNANT).count(),
        nb_responsables=db.query(User).filter(User.role == Role.RESPONSABLE_PEDAGOGIQUE).count(),
        nb_etudiants=db.query(Student).count(),
        nb_filieres=len(FILIERE_CATEGORIES),
        model_metrics=ModelMetrics(
            accuracy=metrics["accuracy"],
            precision=metrics["precision"],
            recall=metrics["recall"],
            f1_score=metrics["f1_score"],
        ),
    )
