import { useEffect, useState } from "react";
import { ChartColumnBig, TriangleAlert, Users } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { StudentsTable } from "../components/StudentsTable";
import { StatTile } from "../components/StatTile";
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
          <StatTile label="Étudiants suivis" value={summary.nb_etudiants} icon={Users} />

          <StatTile
            label="Score de risque moyen"
            value={`${Math.round(summary.score_moyen * 100)}%`}
            icon={ChartColumnBig}
            variant="primary"
            progressPct={Math.round(summary.score_moyen * 100)}
          />

          <StatTile
            label="Étudiants à risque élevé"
            value={summary.nb_a_risque_eleve}
            icon={TriangleAlert}
            variant="accent"
            caption="étudiants critiques"
          />
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
