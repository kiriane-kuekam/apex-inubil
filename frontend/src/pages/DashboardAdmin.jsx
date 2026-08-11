import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { GraduationCap, Network, UserCog, Users, ArrowRight } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { StatTile } from "../components/StatTile";
import { fetchAdminSummary } from "../api/admin";

const METRIC_LABELS = {
  accuracy: "Exactitude",
  precision: "Précision",
  recall: "Rappel",
  f1_score: "F1-score",
};

const ROLE_COLORS = {
  administrateur: "#5b3aa8",
  enseignant: "#1a4fa0",
  responsable_pedagogique: "#e15a28",
};

export default function DashboardAdmin() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchAdminSummary().then(setSummary);
  }, []);

  const roleBreakdown = useMemo(() => {
    if (!summary) return [];
    return [
      { key: "administrateur", name: "Administrateurs", value: summary.nb_administrateurs },
      { key: "enseignant", name: "Enseignants", value: summary.nb_enseignants },
      { key: "responsable_pedagogique", name: "Responsables pédagogiques", value: summary.nb_responsables },
    ].filter((r) => r.value > 0);
  }, [summary]);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <p className="page-header__eyebrow">Vue d'ensemble système</p>
          <h1>Tableau de bord administrateur</h1>
          <p className="page-header__subtitle">
            État des comptes, du référentiel des filières et du modèle de prédiction.
          </p>
        </div>
      </div>

      {!summary ? (
        <p className="cell-muted">Chargement…</p>
      ) : (
        <>
          <div className="stat-grid">
            <StatTile label="Enseignants" value={summary.nb_enseignants} icon={Users} />
            <StatTile label="Responsables pédagogiques" value={summary.nb_responsables} icon={UserCog} />
            <StatTile label="Étudiants suivis" value={summary.nb_etudiants} icon={GraduationCap} />
            <StatTile label="Filières couvertes" value={summary.nb_filieres} icon={Network} />
          </div>

          <div className="dashboard-grid">
            <div className="card">
              <div className="card__header">
                <h2>Comptes par rôle</h2>
              </div>
              <div className="card__body" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={roleBreakdown}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {roleBreakdown.map((r) => (
                        <Cell key={r.key} fill={ROLE_COLORS[r.key]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="stat-legend">
                  {roleBreakdown.map((r) => (
                    <div key={r.key} className="stat-legend__item">
                      <span className="stat-legend__dot" style={{ background: ROLE_COLORS[r.key] }} />
                      {r.name} - {r.value}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card__header">
                <h2>Accès rapides</h2>
              </div>
              <div className="card__body quick-links">
                <Link to="/utilisateurs" className="quick-link">
                  <span className="quick-link__icon"><UserCog size={18} /></span>
                  <span className="quick-link__text">
                    <strong>Gérer les utilisateurs</strong>
                    <span className="cell-muted">Créer, modifier ou désactiver un compte</span>
                  </span>
                  <ArrowRight size={16} className="quick-link__arrow" />
                </Link>
                <Link to="/filieres" className="quick-link">
                  <span className="quick-link__icon"><Network size={18} /></span>
                  <span className="quick-link__text">
                    <strong>Consulter les filières</strong>
                    <span className="cell-muted">Référentiel utilisé par le modèle de prédiction</span>
                  </span>
                  <ArrowRight size={16} className="quick-link__arrow" />
                </Link>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <h2>Performance du modèle de prédiction</h2>
            </div>
            <div className="card__body">
              <p className="cell-muted" style={{ marginBottom: 16 }}>
                Métriques mesurées sur le jeu de test lors du dernier entraînement.
              </p>
              <div className="stat-grid" style={{ marginBottom: 0 }}>
                {Object.entries(METRIC_LABELS).map(([key, label]) => (
                  <StatTile
                    key={key}
                    label={label}
                    value={`${Math.round(summary.model_metrics[key] * 100)}%`}
                    variant="primary"
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
