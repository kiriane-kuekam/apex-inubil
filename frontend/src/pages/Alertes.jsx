import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { fetchAlerts, toggleAlertTraitee } from "../api/students";

export default function Alertes() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  function load() {
    setLoading(true);
    fetchAlerts()
      .then(setAlerts)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleToggle(id, e) {
    e.stopPropagation();
    const updated = await toggleAlertTraitee(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }

  const aTraiter = alerts.filter((a) => !a.alerte_traitee);
  const traitees = alerts.filter((a) => a.alerte_traitee);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <p className="page-header__eyebrow">Suivi des cas urgents</p>
          <h1>Alertes</h1>
          <p className="page-header__subtitle">
            Étudiants identifiés à risque élevé d'échec — nécessitent une prise de contact.
          </p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <div className="stat-tile__label">À traiter</div>
          <div className="stat-tile__value stat-tile__value--accent">{aTraiter.length}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile__label">Traitées</div>
          <div className="stat-tile__value">{traitees.length}</div>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <h2>Étudiants à risque élevé</h2>
        </div>
        <div className="card__body">
          {loading ? (
            <p className="cell-muted">Chargement…</p>
          ) : alerts.length === 0 ? (
            <div className="empty-state">Aucune alerte active — tous les étudiants suivis sont sous contrôle.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th>Matricule</th>
                  <th>Filière</th>
                  <th>Score de risque</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => (
                  <tr key={a.id} onClick={() => navigate(`/etudiants/${a.id}`)}>
                    <td className="cell-name">{a.prenom} {a.nom}</td>
                    <td className="cell-muted">{a.matricule}</td>
                    <td>{a.filiere}</td>
                    <td className="cell-score">{Math.round(a.risque_score * 100)}%</td>
                    <td>
                      <button
                        className={"btn " + (a.alerte_traitee ? "btn-outline" : "btn-primary")}
                        onClick={(e) => handleToggle(a.id, e)}
                      >
                        {a.alerte_traitee ? "Traitée ✓" : "Marquer traitée"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppShell>
  );
}
