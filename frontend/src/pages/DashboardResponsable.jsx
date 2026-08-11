import { useEffect, useMemo, useState } from "react";
import { ChartColumnBig, Network, Search, TriangleAlert, Users } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { StudentsTable } from "../components/StudentsTable";
import { RiskDistributionChart } from "../components/RiskDistributionChart";
import { StatTile } from "../components/StatTile";
import { fetchDashboardSummary, fetchStudents } from "../api/students";

export default function DashboardResponsable() {
  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);
  const [filiere, setFiliere] = useState("");
  const [risque, setRisque] = useState("");
  const [search, setSearch] = useState("");
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

  const visibleStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.nom.toLowerCase().includes(q) ||
        s.prenom.toLowerCase().includes(q) ||
        s.matricule.toLowerCase().includes(q)
    );
  }, [students, search]);

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

          <StatTile
            label="Filières couvertes"
            value={summary.par_filiere.length}
            icon={Network}
            pills={filieres}
          />
        </div>
      )}

      <div className="dashboard-grid">
        {summary && (
          <div className="card">
            <div className="card__header">
              <h2>Répartition du risque</h2>
            </div>
            <div className="card__body">
              <p className="cell-muted" style={{ marginBottom: 16 }}>
                Vue par filière des niveaux de risque d'échec estimé par le modèle.
              </p>
              <RiskDistributionChart data={summary.par_filiere} />
            </div>
          </div>
        )}

        <div className="card">
          <div className="card__header card__header--wrap">
            <div>
              <h2>Étudiants suivis</h2>
              <p className="cell-muted" style={{ marginTop: 2 }}>
                Liste détaillée triée par score de risque décroissant.
              </p>
            </div>
            <div className="search-field">
              <Search size={15} className="search-field__icon" />
              <input
                type="text"
                placeholder="Rechercher matricule, nom..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
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
            {loading ? <p className="cell-muted">Chargement…</p> : <StudentsTable students={visibleStudents} />}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
