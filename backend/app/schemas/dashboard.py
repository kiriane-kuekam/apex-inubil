from pydantic import BaseModel


class FiliereSummary(BaseModel):
    filiere: str
    nb_etudiants: int
    score_moyen: float
    nb_faible: int
    nb_moyen: int
    nb_eleve: int


class DashboardSummary(BaseModel):
    nb_etudiants: int
    score_moyen: float
    nb_a_risque_eleve: int
    par_filiere: list[FiliereSummary]
