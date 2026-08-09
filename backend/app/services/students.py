from sqlalchemy.orm import Query, Session

from app.models.student import Student
from app.models.user import Role, User


def scoped_students_query(db: Session, current_user: User) -> Query:
    """Restreint la liste des etudiants a ceux de l'enseignant courant.
    Le responsable pedagogique voit tous les etudiants."""
    query = db.query(Student)
    if current_user.role == Role.ENSEIGNANT:
        query = query.filter(Student.enseignant_id == current_user.id)
    return query
