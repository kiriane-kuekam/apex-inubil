"""
Regression logistique codee a la main (descente de gradient), reprise telle
quelle du notebook d'entrainement. Doit rester dans ce module: joblib
serialise les objets de cette classe par reference a son chemin d'import
(app.ml.logistic_model.LogisticRegression), donc le train et l'API doivent
tous les deux importer la classe depuis ici.
"""
import numpy as np


class LogisticRegression:
    def __init__(self, learningrate=0.01, iterations=500):
        self.lr = learningrate
        self.iterations = iterations
        self.weights = None
        self.bias = None
        self.costhistory = []

    def sigmoid(self, z):
        return 1 / (1 + np.exp(-z))

    def fit(self, X, y):
        n_samples, n_features = X.shape
        self.weights = np.zeros(n_features)
        self.bias = 0

        for i in range(self.iterations):
            linear_model = np.dot(X, self.weights) + self.bias
            y_pred = self.sigmoid(linear_model)

            cost = -(1 / n_samples) * np.sum(
                y * np.log(y_pred + 1e-8) + (1 - y) * np.log(1 - y_pred + 1e-8)
            )
            self.costhistory.append(cost)

            dw = (1 / n_samples) * np.dot(X.T, (y_pred - y))
            db = (1 / n_samples) * np.sum(y_pred - y)

            self.weights -= self.lr * dw
            self.bias -= self.lr * db

        return self

    def predict_proba(self, X):
        linear_model = np.dot(X, self.weights) + self.bias
        return self.sigmoid(linear_model)

    def predict(self, X, threshold=0.5):
        proba = self.predict_proba(X)
        return (proba >= threshold).astype(int)
