from pydantic import BaseModel


class FiliereOut(BaseModel):
    nom: str
    nb_etudiants: int
