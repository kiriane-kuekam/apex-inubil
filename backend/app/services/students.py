from sqlalchemy import and_, or_
from sqlalchemy.orm import Query, Session

from app.models.student import Student
from app.models.user import EnseignantAffectation, ResponsableFiliere, Role, User


def scoped_students_query(db: Session, current_user: User) -> Query:
    """Restreint la liste des etudiants selon les affectations de l'utilisateur.

    - Enseignant : union de ses affectations (filiere, niveau) - un etudiant peut
      etre suivi par plusieurs enseignants (plusieurs matieres).
    - Responsable pedagogique : union de ses filieres assignees (plusieurs
      possibles).
    - Administrateur : n'appelle jamais cette fonction (aucun acces aux
      donnees de risque).
    """
    query = db.query(Student)

    if current_user.role == Role.ENSEIGNANT:
        combos = (
            db.query(EnseignantAffectation)
            .filter(EnseignantAffectation.user_id == current_user.id)
            .all()
        )
        if not combos:
            return query.filter(False)
        conditions = [
            and_(Student.filiere == c.filiere, Student.niveau == c.niveau) for c in combos
        ]
        query = query.filter(or_(*conditions))

    elif current_user.role == Role.RESPONSABLE_PEDAGOGIQUE:
        filieres = [
            f.filiere
            for f in db.query(ResponsableFiliere)
            .filter(ResponsableFiliere.user_id == current_user.id)
            .all()
        ]
        query = query.filter(Student.filiere.in_(filieres)) if filieres else query.filter(False)

    return query
