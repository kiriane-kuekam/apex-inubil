from datetime import datetime

from pydantic import BaseModel


class StudentOut(BaseModel):
    id: int
    matricule: str
    nom: str
    prenom: str
    filiere: str
    niveau: str
    risque_score: float
    risque_label: str

    class Config:
        from_attributes = True


class StudentDetail(StudentOut):
    logement: str
    presence_pct: float
    study_min: int
    bibliotheque_acces: str
    interaction_enseignant: str
    implication: int
    recommandation: str
    alerte_traitee: bool
    alerte_note: str | None
    alerte_traitee_le: datetime | None

    class Config:
        from_attributes = True


class AlertOut(BaseModel):
    id: int
    matricule: str
    nom: str
    prenom: str
    filiere: str
    risque_score: float
    alerte_traitee: bool
    alerte_note: str | None
    alerte_traitee_le: datetime | None

    class Config:
        from_attributes = True


class TraiterAlerteIn(BaseModel):
    note: str | None = None


class ImportRowError(BaseModel):
    ligne: int
    matricule: str | None
    message: str


class ImportResult(BaseModel):
    crees: int
    mis_a_jour: int
    erreurs: list[ImportRowError]
