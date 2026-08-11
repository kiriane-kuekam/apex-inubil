from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import require_role
from app.ml.predict import FILIERE_CATEGORIES
from app.models.student import Student
from app.models.user import Role
from app.schemas.filiere import FiliereOut

router = APIRouter(
    prefix="/filieres",
    tags=["filieres"],
    dependencies=[Depends(require_role(Role.ADMINISTRATEUR))],
)


@router.get("", response_model=list[FiliereOut])
def list_filieres(db: Session = Depends(get_db)):
    counts = Counter(f for (f,) in db.query(Student.filiere).all())
    return [
        FiliereOut(nom=filiere, nb_etudiants=counts.get(filiere, 0))
        for filiere in FILIERE_CATEGORIES
    ]
