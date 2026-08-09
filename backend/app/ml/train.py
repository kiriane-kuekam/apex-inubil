"""
Entraine le modele de prediction du risque d'echec et sauvegarde le
modele + les parametres de pretraitement necessaires a l'inference.

A executer depuis le dossier backend/, dans le venv:
    .venv\\Scripts\\python.exe -m app.ml.train
(le -m garantit que la classe LogisticRegression est picklee avec le bon
chemin de module app.ml.logistic_model, importable ensuite par l'API)
"""
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from app.ml.logistic_model import LogisticRegression

ML_DIR = Path(__file__).resolve().parent
DATASET_PATH = ML_DIR / "dataset_final.csv"
MODEL_PATH = ML_DIR / "model.pkl"
PREPROCESSING_PATH = ML_DIR / "preprocessing.pkl"
METRICS_PATH = ML_DIR / "metrics.json"


def parse_minutes(s):
    s = str(s).strip()
    if s in ["nan", ""]:
        return np.nan
    if "< 30 min" in s:
        return 15
    if "30min-1h" in s:
        return 45
    if "1h-2h" in s:
        return 90
    if "1h" in s:
        return 60
    if "2h" in s:
        return 120
    if "3h" in s:
        return 180
    if "4h" in s:
        return 240
    return np.nan


def confusion_matrix_manual(y_true, y_pred):
    TP = np.sum((y_true == 1) & (y_pred == 1))
    TN = np.sum((y_true == 0) & (y_pred == 0))
    FP = np.sum((y_true == 0) & (y_pred == 1))
    FN = np.sum((y_true == 1) & (y_pred == 0))
    return np.array([[TN, FP], [FN, TP]])


def precision_manual(y_true, y_pred):
    TP = np.sum((y_true == 1) & (y_pred == 1))
    FP = np.sum((y_true == 0) & (y_pred == 1))
    return TP / (TP + FP + 1e-8)


def recall_manual(y_true, y_pred):
    TP = np.sum((y_true == 1) & (y_pred == 1))
    FN = np.sum((y_true == 1) & (y_pred == 0))
    return TP / (TP + FN + 1e-8)


def f1_score_manual(y_true, y_pred):
    prec = precision_manual(y_true, y_pred)
    rec = recall_manual(y_true, y_pred)
    return 2 * (prec * rec) / (prec + rec + 1e-8)


def main():
    red = pd.read_csv(DATASET_PATH, sep=";")
    red.drop("Moyenne", axis=1, inplace=True)
    red = red.drop_duplicates()

    red["presence_pct"] = (
        red["Taux de presence moyen aux cours (%)"].str.replace("%", "").astype(float)
    )
    red["study_min"] = red["Heures d'etude personnelle par jour"].map(parse_minutes)
    red["commute_min"] = red["Temps de trajet quotidien vers l'ecole"].map(parse_minutes)

    freq_map = {"Jamais": 0, "Rarement": 1, "Souvent": 2, "Toujours": 3}
    inter_map = {"faible": 0, "moyenne": 1, "excellente": 2}
    bool_map = {"NON": 0, "OUI": 1}

    for col in [
        "Acces au Wi-Fi de l'ecole",
        "Acces aux equipements de labo",
        "Acces a la bibliotheque",
    ]:
        red[col + "_ord"] = red[col].map(freq_map)

    red["salle_travail"] = red["une salle pour travailler ?"].map(bool_map)
    red["ordi_perso"] = red["ordinateur personnel ?"].map(bool_map)
    red["interaction_ord"] = red["Interaction avec les enseignant"].map(inter_map)
    red["implication"] = red["Niveau d'implication dans les travaux de groupe"].astype(float)

    filiere_categories = sorted(red["Filiere"].dropna().unique().tolist())
    niveau_categories = sorted(red["Niveau d'etude"].dropna().unique().tolist())
    logement_categories = sorted(red["Statut de logement"].dropna().unique().tolist())

    red = pd.get_dummies(
        red, columns=["Filiere", "Niveau d'etude", "Statut de logement"], drop_first=True
    )

    num_cols = [
        "presence_pct",
        "study_min",
        "commute_min",
        "implication",
        "interaction_ord",
        "Acces au Wi-Fi de l'ecole_ord",
        "Acces aux equipements de labo_ord",
        "Acces a la bibliotheque_ord",
    ]

    mean = red[num_cols].mean(axis=0)
    std = red[num_cols].std(axis=0)
    epsilon = np.exp(-8)
    red[num_cols] = (red[num_cols] - mean) / (std + epsilon)

    cols_to_drop = [
        "Avez-vous deja redouble ?",
        "Taux de presence moyen aux cours (%)",
        "Niveau d'implication dans les travaux de groupe",
        "Heures d'etude personnelle par jour",
        "une salle pour travailler ?",
        "Acces au Wi-Fi de l'ecole",
        "Acces aux equipements de labo",
        "Acces a la bibliotheque",
        "Interaction avec les enseignant",
        "Temps de trajet quotidien vers l'ecole",
        "ordinateur personnel ?",
    ]
    red = red.drop(columns=cols_to_drop, errors="ignore")

    cols_to_drop_2 = [
        "commute_min",
        "ordi_perso",
        "salle_travail",
        "Acces au Wi-Fi de l'ecole_ord",
        "Acces aux equipements de labo_ord",
    ]
    red = red.drop(columns=cols_to_drop_2, errors="ignore")

    feature_columns = [c for c in red.columns if c != "Reussite"]

    X = red[feature_columns].values.astype(float)
    Y = red["Reussite"].values.astype(float)

    np.random.seed(42)
    n = len(X)
    indices = np.random.permutation(n)
    split = int(0.8 * n)
    X_train, X_test = X[indices[:split]], X[indices[split:]]
    Y_train, Y_test = Y[indices[:split]], Y[indices[split:]]

    X_train = np.hstack([np.ones((X_train.shape[0], 1)), X_train])
    X_test = np.hstack([np.ones((X_test.shape[0], 1)), X_test])

    model = LogisticRegression(learningrate=0.01, iterations=1000)
    model.fit(X_train, Y_train)

    y_pred = model.predict(X_test)
    accuracy = float((y_pred == Y_test).mean())
    cm = confusion_matrix_manual(Y_test, y_pred)
    precision = float(precision_manual(Y_test, y_pred))
    recall = float(recall_manual(Y_test, y_pred))
    f1 = float(f1_score_manual(Y_test, y_pred))

    print("Accuracy:", accuracy)
    print("Confusion matrix:\n", cm)
    print("Precision:", precision)
    print("Recall:", recall)
    print("F1-score:", f1)

    joblib.dump(model, MODEL_PATH)

    preprocessing = {
        "feature_columns": feature_columns,
        "mean": mean.to_dict(),
        "std": std.to_dict(),
        "epsilon": float(epsilon),
        "freq_map": freq_map,
        "inter_map": inter_map,
        "filiere_categories": filiere_categories,
        "niveau_categories": niveau_categories,
        "logement_categories": logement_categories,
    }
    joblib.dump(preprocessing, PREPROCESSING_PATH)

    metrics = {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1_score": f1,
        "confusion_matrix": cm.tolist(),
        "n_train": int(len(X_train)),
        "n_test": int(len(X_test)),
    }
    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2, ensure_ascii=False)

    print(f"Modele -> {MODEL_PATH}")
    print(f"Pretraitement -> {PREPROCESSING_PATH}")


if __name__ == "__main__":
    main()
