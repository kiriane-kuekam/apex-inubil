from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(primary_key=True)
    matricule: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    nom: Mapped[str] = mapped_column(String(100))
    prenom: Mapped[str] = mapped_column(String(100))

    filiere: Mapped[str] = mapped_column(String(50))
    niveau: Mapped[str] = mapped_column(String(50))
    logement: Mapped[str] = mapped_column(String(50))

    # Features utilisees par le modele de prediction
    presence_pct: Mapped[float] = mapped_column(Float)
    study_min: Mapped[int] = mapped_column(Integer)
    bibliotheque_acces: Mapped[str] = mapped_column(String(20))  # Jamais/Rarement/Souvent/Toujours
    interaction_enseignant: Mapped[str] = mapped_column(String(20))  # faible/moyenne/excellente
    implication: Mapped[int] = mapped_column(Integer)  # 1-5

    # Resultat de la prediction
    risque_score: Mapped[float] = mapped_column(Float, default=0.0)  # 0 = aucun risque, 1 = risque maximal
    risque_label: Mapped[str] = mapped_column(String(20), default="faible")  # faible/moyen/eleve
    recommandation: Mapped[str] = mapped_column(Text, default="")

    # L'acces enseignant/responsable est derive des affectations (voir
    # app/services/students.py::scoped_students_query), pas d'un FK direct :
    # un etudiant peut etre suivi par plusieurs enseignants (plusieurs matieres).
    alerte_traitee: Mapped[bool] = mapped_column(default=False)
    alerte_note: Mapped[str | None] = mapped_column(String(500), nullable=True)
    alerte_traitee_le: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
