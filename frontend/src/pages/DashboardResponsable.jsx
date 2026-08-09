import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "../components/AppShell";
import { StudentsTable } from "../components/StudentsTable";
import { fetchDashboardSummary, fetchStudents } from "../api/students";

export default function DashboardResponsable() {
  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);
  const [filiere, setFiliere] = useState("");
  const [risque, setRisque] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardSummary().then(setSummary);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filiere) params.filiere = filiere;
    if (risque) params.risque_label = risque;
    fetchStudents(params)
      .then(setStudents)
      .finally(() => setLoading(false));
  }, [filiere, risque]);

  const filieres = summary?.par_filiere.map((f) => f.filiere) || [];

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <p className="page-header__eyebrow">Vue d'ensemble</p>
          <h1>Tableau de bord décisionnel</h1>
          <p className="page-header__subtitle">
            Indicateurs de risque d'échec académique, toutes filières confondues.
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
            <div className="stat-tile__label">Étudiants à risque élevé</div>
            <div className="stat-tile__value stat-tile__value--accent">
              {summary.nb_a_risque_eleve}
            </div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile__label">Filières couvertes</div>
            <div className="stat-tile__value">{summary.par_filiere.length}</div>
          </div>
        </div>
      )}

      {summary && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card__header">
            <h2>Répartition du risque par filière</h2>
          </div>
          <div className="card__body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={summary.par_filiere}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e6ee" vertical={false} />
                <XAxis dataKey="filiere" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="nb_faible" stackId="a" name="Faible" fill="#1b8a6b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="nb_moyen" stackId="a" name="Modéré" fill="#b3791a" />
                <Bar dataKey="nb_eleve" stackId="a" name="Élevé" fill="#cf4520" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card__header">
          <h2>Étudiants</h2>
        </div>
        <div className="card__body">
          <div className="filters-row">
            <select className="select-field" value={filiere} onChange={(e) => setFiliere(e.target.value)}>
              <option value="">Toutes les filières</option>
              {filieres.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
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
