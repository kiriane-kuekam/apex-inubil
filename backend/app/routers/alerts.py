from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_user
from app.models.student import Student
from app.models.user import User
from app.schemas.student import AlertOut, TraiterAlerteIn
from app.services.students import scoped_students_query

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertOut])
def list_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = scoped_students_query(db, current_user).filter(Student.risque_label == "eleve")
    return query.order_by(Student.alerte_traitee.asc(), Student.risque_score.desc()).all()


@router.patch("/{student_id}/traiter", response_model=AlertOut)
def marquer_traitee(
    student_id: int,
    payload: TraiterAlerteIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = scoped_students_query(db, current_user).filter(Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Etudiant introuvable")

    if not student.alerte_traitee:
        if not payload.note or not payload.note.strip():
            raise HTTPException(
                status_code=400,
                detail="Une note est requise pour marquer une alerte comme traitee",
            )
        student.alerte_traitee = True
        student.alerte_note = payload.note.strip()
        student.alerte_traitee_le = datetime.utcnow()
    else:
        student.alerte_traitee = False

    db.commit()
    db.refresh(student)
    return student
