import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { Drawer } from "../components/Drawer";
import { fetchAlerts, toggleAlertTraitee } from "../api/students";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function Alertes() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerAlert, setDrawerAlert] = useState(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function load() {
    setLoading(true);
    fetchAlerts()
      .then(setAlerts)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openTreat(alert, e) {
    e.stopPropagation();
    setDrawerAlert(alert);
    setNote("");
  }

  async function confirmTreat(e) {
    e.preventDefault();
    if (!drawerAlert || !note.trim()) return;
    setSubmitting(true);
    try {
      const updated = await toggleAlertTraitee(drawerAlert.id, note.trim());
      setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setDrawerAlert(null);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUndo(id, e) {
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
            Étudiants identifiés à risque élevé d'échec - nécessitent une prise de contact.
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
            <div className="empty-state">Aucune alerte active - tous les étudiants suivis sont sous contrôle.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th>Matricule</th>
                  <th>Filière</th>
                  <th>Score de risque</th>
                  <th>Traitement</th>
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
                    <td className="cell-muted" style={{ maxWidth: 260 }}>
                      {a.alerte_traitee && a.alerte_note ? (
                        <>
                          <div>{a.alerte_note}</div>
                          <small>{formatDate(a.alerte_traitee_le)}</small>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {a.alerte_traitee ? (
                        <button className="btn btn-outline" onClick={(e) => handleUndo(a.id, e)}>
                          Traitée ✓
                        </button>
                      ) : (
                        <button className="btn btn-primary" onClick={(e) => openTreat(a, e)}>
                          Marquer traitée
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Drawer
        open={!!drawerAlert}
        onClose={() => setDrawerAlert(null)}
        title="Marquer l'alerte comme traitée"
      >
        {drawerAlert && (
          <form onSubmit={confirmTreat}>
            <p className="cell-muted" style={{ marginBottom: 16 }}>
              {drawerAlert.prenom} {drawerAlert.nom} — {drawerAlert.matricule}
            </p>
            <label className="field">
              <span>Action réalisée</span>
              <textarea
                className="text-field"
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex : Entretien individuel le 12/08, orientation vers le tutorat."
                required
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
            </label>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => setDrawerAlert(null)}
              >
                Annuler
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                type="submit"
                disabled={submitting || !note.trim()}
              >
                {submitting ? "Enregistrement..." : "Confirmer"}
              </button>
            </div>
          </form>
        )}
      </Drawer>
    </AppShell>
  );
}
