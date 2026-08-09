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
    enseignant_id: int | None

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

    class Config:
        from_attributes = True
