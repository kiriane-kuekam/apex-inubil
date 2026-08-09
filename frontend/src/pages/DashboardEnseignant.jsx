import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { StudentsTable } from "../components/StudentsTable";
import { fetchDashboardSummary, fetchStudents } from "../api/students";
import { useAuth } from "../context/AuthContext";

export default function DashboardEnseignant() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);
  const [risque, setRisque] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardSummary().then(setSummary);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (risque) params.risque_label = risque;
    fetchStudents(params)
      .then(setStudents)
      .finally(() => setLoading(false));
  }, [risque]);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <p className="page-header__eyebrow">Bonjour {user?.fullName?.split(" ").pop()}</p>
          <h1>Mes étudiants</h1>
          <p className="page-header__subtitle">
            Suivi du risque d'échec pour les étudiants de vos classes.
          </p>
        </div>
      </div>

      {summary && (
        <div className="stat-grid">
          <div className="stat-tile">
            <div className="stat-tile__label">Étudiants suivis</div>
            <div className="stat-tile__value">{summary.nb_etudiants}</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile__label">Score de risque moyen</div>
            <div className="stat-tile__value stat-tile__value--primary">
              {Math.round(summary.score_moyen * 100)}%
            </div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile__label">À risque élevé</div>
            <div className="stat-tile__value stat-tile__value--accent">
              {summary.nb_a_risque_eleve}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card__header">
          <h2>Liste des étudiants</h2>
        </div>
        <div className="card__body">
          <div className="filters-row">
            <select className="select-field" value={risque} onChange={(e) => setRisque(e.target.value)}>
              <option value="">Tous les niveaux de risque</option>
              <option value="faible">Faible</option>
              <option value="moyen">Modéré</option>
              <option value="eleve">Élevé</option>
            </select>
          </div>
          {loading ? <p className="cell-muted">Chargement…</p> : <StudentsTable students={students} />}
        </div>
      </div>
    </AppShell>
  );
}
