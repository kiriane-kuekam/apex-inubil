import enum

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Role(str, enum.Enum):
    ADMINISTRATEUR = "administrateur"
    ENSEIGNANT = "enseignant"
    RESPONSABLE_PEDAGOGIQUE = "responsable_pedagogique"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255))
    role: Mapped[Role] = mapped_column(Enum(Role))
    is_active: Mapped[bool] = mapped_column(default=True)

    filieres_assignees: Mapped[list["ResponsableFiliere"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    affectations: Mapped[list["EnseignantAffectation"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    @property
    def filieres(self) -> list[str]:
        return [f.filiere for f in self.filieres_assignees]


class ResponsableFiliere(Base):
    """Filiere(s) assignee(s) a un responsable pedagogique (plusieurs possibles)."""

    __tablename__ = "responsable_filieres"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    filiere: Mapped[str] = mapped_column(String(50))

    user: Mapped["User"] = relationship(back_populates="filieres_assignees")


class EnseignantAffectation(Base):
    """Combinaison (filiere, niveau) donnant a un enseignant l'acces aux etudiants
    correspondants. Un enseignant peut avoir plusieurs affectations, et un
    etudiant peut donc etre suivi par plusieurs enseignants (plusieurs matieres)."""

    __tablename__ = "enseignant_affectations"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    filiere: Mapped[str] = mapped_column(String(50))
    niveau: Mapped[str] = mapped_column(String(50))

    user: Mapped["User"] = relationship(back_populates="affectations")
