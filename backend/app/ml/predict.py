"""
Service de prediction du risque d'echec pour un etudiant.

Reproduit exactement le feature engineering de app/ml/train.py pour un
seul etudiant (standardisation + encodage one-hot), a partir des
parametres sauvegardes dans preprocessing.pkl, puis appelle le modele
(app/ml/model.pkl) pour obtenir une probabilite de reussite.
"""
from pathlib import Path

import joblib
import numpy as np

from app.ml.logistic_model import LogisticRegression  # noqa: F401  (necessaire pour unpickle)

ML_DIR = Path(__file__).resolve().parent

_model = joblib.load(ML_DIR / "model.pkl")
_prep = joblib.load(ML_DIR / "preprocessing.pkl")

FEATURE_COLUMNS: list[str] = _prep["feature_columns"]
MEAN: dict = _prep["mean"]
STD: dict = _prep["std"]
EPSILON: float = _prep["epsilon"]
FREQ_MAP: dict = _prep["freq_map"]
INTER_MAP: dict = _prep["inter_map"]

FILIERE_CATEGORIES: list[str] = _prep["filiere_categories"]
NIVEAU_CATEGORIES: list[str] = _prep["niveau_categories"]
LOGEMENT_CATEGORIES: list[str] = _prep["logement_categories"]


def _standardize(value: float, column: str) -> float:
    return (value - MEAN[column]) / (STD[column] + EPSILON)


def build_feature_vector(
    presence_pct: float,
    study_min: int,
    bibliotheque_acces: str,
    interaction_enseignant: str,
    implication: int,
    filiere: str,
    niveau: str,
    logement: str,
) -> np.ndarray:
    bibliotheque_ord = FREQ_MAP[bibliotheque_acces]
    interaction_ord = INTER_MAP[interaction_enseignant]

    numeric = {
        "presence_pct": _standardize(presence_pct, "presence_pct"),
        "study_min": _standardize(study_min, "study_min"),
        "Acces a la bibliotheque_ord": _standardize(bibliotheque_ord, "Acces a la bibliotheque_ord"),
        "interaction_ord": _standardize(interaction_ord, "interaction_ord"),
        "implication": _standardize(implication, "implication"),
    }

    row = []
    for col in FEATURE_COLUMNS:
        if col in numeric:
            row.append(numeric[col])
        elif col.startswith("Filiere_"):
            row.append(1.0 if col == f"Filiere_{filiere}" else 0.0)
        elif col.startswith("Niveau d'etude_"):
            row.append(1.0 if col == f"Niveau d'etude_{niveau}" else 0.0)
        elif col.startswith("Statut de logement_"):
            row.append(1.0 if col == f"Statut de logement_{logement}" else 0.0)
        else:
            raise ValueError(f"Colonne de feature inconnue: {col}")

    return np.array([1.0] + row)  # 1.0 = biais, comme a l'entrainement


def risk_label_for(risk_score: float) -> str:
    if risk_score >= 0.6:
        return "eleve"
    if risk_score >= 0.3:
        return "moyen"
    return "faible"


def recommendation_for(risk_label: str) -> str:
    return {
        "eleve": (
            "Risque eleve : prendre contact rapidement avec l'etudiant et "
            "mettre en place un tutorat cible."
        ),
        "moyen": (
            "Risque modere : renforcer le suivi (assiduite, entretien "
            "individuel) dans les prochaines semaines."
        ),
        "faible": "Risque faible : poursuivre le suivi standard.",
    }[risk_label]


def predict_risk(
    presence_pct: float,
    study_min: int,
    bibliotheque_acces: str,
    interaction_enseignant: str,
    implication: int,
    filiere: str,
    niveau: str,
    logement: str,
) -> dict:
    x = build_feature_vector(
        presence_pct=presence_pct,
        study_min=study_min,
        bibliotheque_acces=bibliotheque_acces,
        interaction_enseignant=interaction_enseignant,
        implication=implication,
        filiere=filiere,
        niveau=niveau,
        logement=logement,
    )
    proba_reussite = float(_model.predict_proba(x.reshape(1, -1))[0])
    risk_score = 1.0 - proba_reussite
    label = risk_label_for(risk_score)
    return {
        "proba_reussite": proba_reussite,
        "risque_score": risk_score,
        "risque_label": label,
        "recommandation": recommendation_for(label),
    }
