from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_user
from app.models.student import Student
from app.models.user import User
from app.schemas.student import StudentDetail, StudentOut
from app.services.students import scoped_students_query

router = APIRouter(prefix="/students", tags=["students"])


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
