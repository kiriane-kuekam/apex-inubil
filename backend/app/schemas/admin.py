from pydantic import BaseModel


class ModelMetrics(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float


class AdminSummary(BaseModel):
    nb_administrateurs: int
    nb_enseignants: int
    nb_responsables: int
    nb_etudiants: int
    nb_filieres: int
    model_metrics: ModelMetrics
