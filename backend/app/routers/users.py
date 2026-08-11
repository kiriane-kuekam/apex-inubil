from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_password_hash
from app.deps import get_current_user, require_role
from app.ml.predict import FILIERE_CATEGORIES, NIVEAU_CATEGORIES
from app.models.user import EnseignantAffectation, ResponsableFiliere, Role, User
from app.schemas.user import UserCreate, UserOut, UserUpdate

router = APIRouter(
    prefix="/users",
    tags=["users"],
    dependencies=[Depends(require_role(Role.ADMINISTRATEUR))],
)


def _apply_assignments(db: Session, user: User, role: Role, filieres: list[str], affectations: list) -> None:
    """Valide et remplace les affectations d'un utilisateur selon son role.
    Delete + recreate : simple, pas d'etat a reconcilier."""
    db.query(ResponsableFiliere).filter(ResponsableFiliere.user_id == user.id).delete()
    db.query(EnseignantAffectation).filter(EnseignantAffectation.user_id == user.id).delete()

    if role == Role.RESPONSABLE_PEDAGOGIQUE:
        if not filieres:
            raise HTTPException(status_code=400, detail="Au moins une filiere doit etre assignee")
        for f in filieres:
            if f not in FILIERE_CATEGORIES:
                raise HTTPException(status_code=400, detail=f"Filiere inconnue : {f}")
            db.add(ResponsableFiliere(user_id=user.id, filiere=f))

    elif role == Role.ENSEIGNANT:
        if not affectations:
            raise HTTPException(status_code=400, detail="Au moins une affectation (filiere + niveau) doit etre assignee")
        for a in affectations:
            if a.filiere not in FILIERE_CATEGORIES:
                raise HTTPException(status_code=400, detail=f"Filiere inconnue : {a.filiere}")
            if a.niveau not in NIVEAU_CATEGORIES:
                raise HTTPException(status_code=400, detail=f"Niveau inconnu : {a.niveau}")
            db.add(EnseignantAffectation(user_id=user.id, filiere=a.filiere, niveau=a.niveau))


@router.get("", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.full_name).all()


@router.post("", response_model=UserOut, status_code=201)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Un compte existe deja avec cet email")

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        role=payload.role,
        hashed_password=get_password_hash(payload.password),
        is_active=True,
    )
    db.add(user)
    db.flush()  # attribue user.id sans committer, necessaire pour les FK des affectations

    _apply_assignments(db, user, payload.role, payload.filieres, payload.affectations)

    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}", response_model=UserOut)
def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    email_owner = db.query(User).filter(User.email == payload.email).first()
    if email_owner and email_owner.id != user.id:
        raise HTTPException(status_code=400, detail="Un compte existe deja avec cet email")

    user.email = payload.email
    user.full_name = payload.full_name
    user.role = payload.role

    _apply_assignments(db, user, payload.role, payload.filieres, payload.affectations)

    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}/toggle-active", response_model=UserOut)
def toggle_active(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Impossible de desactiver son propre compte")

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user
