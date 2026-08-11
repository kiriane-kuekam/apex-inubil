import { useEffect, useState } from "react";
import { GraduationCap, Info } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { fetchFilieres } from "../api/filieres";

export default function GestionFilieres() {
  const [filieres, setFilieres] = useState(null);

  useEffect(() => {
    fetchFilieres().then(setFilieres);
  }, []);

  const maxCount = filieres ? Math.max(1, ...filieres.map((f) => f.nb_etudiants)) : 1;

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <p className="page-header__eyebrow">Référentiel</p>
          <h1>Gestion des filières</h1>
          <p className="page-header__subtitle">
            Filières suivies par l'application et nombre d'étudiants associés.
          </p>
        </div>
      </div>

      <div className="info-banner">
        <Info size={18} />
        <p>
          Cette liste est fixée par le modèle de prédiction du risque, entraîné sur ces
          filières précises. L'ajout d'une nouvelle filière nécessiterait un réentraînement
          du modèle pour que ses prédictions restent fiables - cette page est donc en
          lecture seule.
        </p>
      </div>

      <div className="card">
        <div className="card__header">
          <h2>Filières ({filieres?.length ?? "…"})</h2>
        </div>
        <div className="card__body">
          {!filieres ? (
            <p className="cell-muted">Chargement…</p>
          ) : (
            <div className="filiere-list">
              {filieres.map((f) => (
                <div className="filiere-row" key={f.nom}>
                  <div className="filiere-row__info">
                    <GraduationCap size={16} className="filiere-row__icon" />
                    <span>{f.nom}</span>
                  </div>
                  <div className="filiere-row__bar">
                    <div
                      className="filiere-row__bar-fill"
                      style={{ width: `${(f.nb_etudiants / maxCount) * 100}%` }}
                    />
                  </div>
                  <div className="filiere-row__count cell-muted">
                    {f.nb_etudiants} étudiant{f.nb_etudiants > 1 ? "s" : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
