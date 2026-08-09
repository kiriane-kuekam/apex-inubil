import { useEffect, useMemo, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { AppShell } from "../components/AppShell";
import { fetchDashboardSummary } from "../api/students";

const RISK_COLORS = { faible: "#1b8a6b", moyen: "#b3791a", eleve: "#cf4520" };

export default function Statistiques() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchDashboardSummary().then(setSummary);
  }, []);

  const repartition = useMemo(() => {
    if (!summary) return [];
    const totals = summary.par_filiere.reduce(
      (acc, f) => {
        acc.faible += f.nb_faible;
        acc.moyen += f.nb_moyen;
        acc.eleve += f.nb_eleve;
        return acc;
      },
      { faible: 0, moyen: 0, eleve: 0 }
    );
    return [
      { name: "Faible", key: "faible", value: totals.faible },
      { name: "Modéré", key: "moyen", value: totals.moyen },
      { name: "Élevé", key: "eleve", value: totals.eleve },
    ];
  }, [summary]);

  const filieresRanked = useMemo(() => {
    if (!summary) return [];
    return [...summary.par_filiere].sort((a, b) => b.score_moyen - a.score_moyen);
  }, [summary]);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <p className="page-header__eyebrow">Synthèse</p>
          <h1>Statistiques</h1>
          <p className="page-header__subtitle">
            Répartition globale du risque et classement des filières.
          </p>
        </div>
      </div>

      <div className="fiche-grid">
        <div className="card">
          <div className="card__header">
            <h2>Répartition globale du risque</h2>
          </div>
          <div className="card__body" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {summary && (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={repartition}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {repartition.map((entry) => (
                      <Cell key={entry.key} fill={RISK_COLORS[entry.key]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="stat-legend">
              {repartition.map((r) => (
                <div key={r.key} className="stat-legend__item">
                  <span className="stat-legend__dot" style={{ background: RISK_COLORS[r.key] }} />
                  {r.name} — {r.value}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <h2>Classement des filières par risque moyen</h2>
          </div>
          <div className="card__body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Filière</th>
                  <th>Étudiants</th>
                  <th>Score moyen</th>
                  <th>À risque élevé</th>
                </tr>
              </thead>
              <tbody>
                {filieresRanked.map((f) => (
                  <tr key={f.filiere} style={{ cursor: "default" }}>
                    <td className="cell-name">{f.filiere}</td>
                    <td className="cell-muted">{f.nb_etudiants}</td>
                    <td className="cell-score">{Math.round(f.score_moyen * 100)}%</td>
                    <td className="cell-muted">{f.nb_eleve}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
