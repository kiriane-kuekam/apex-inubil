import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { RiskBadge } from "../components/RiskBadge";
import { fetchStudent } from "../api/students";
import "./FicheEtudiant.css";

const RISK_COLOR = { faible: "#1b8a6b", moyen: "#b3791a", eleve: "#cf4520" };

const ETUDE_LABELS = {
  15: "< 30 min / jour",
  45: "30 min - 1h / jour",
  60: "1h / jour",
  90: "1h - 2h / jour",
  120: "2h / jour",
  180: "3h / jour",
  240: "4h / jour",
};

export default function FicheEtudiant() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchStudent(id)
      .then(setStudent)
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <AppShell>
        <div className="empty-state">
          Cet étudiant est introuvable ou ne fait pas partie de vos classes.
        </div>
      </AppShell>
    );
  }

  if (!student) {
    return (
      <AppShell>
        <p className="cell-muted">Chargement…</p>
      </AppShell>
    );
  }

  const pct = Math.round(student.risque_score * 100);
  const color = RISK_COLOR[student.risque_label];

  return (
    <AppShell>
      <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        ← Retour
      </button>

      <div className="page-header">
        <div>
          <p className="page-header__eyebrow">{student.matricule}</p>
          <h1>{student.prenom} {student.nom}</h1>
          <p className="page-header__subtitle">
            {student.filiere} · {student.niveau} · {student.logement}
          </p>
        </div>
        <RiskBadge label={student.risque_label} />
      </div>

      <div className="fiche-grid">
        <div className="card fiche-gauge-card">
          <div className="card__body fiche-gauge-body">
            <div
              className="fiche-gauge"
              style={{ "--gauge-pct": pct, "--gauge-color": color }}
            >
              <div className="fiche-gauge__inner">
                <span className="fiche-gauge__value">{pct}%</span>
                <span className="fiche-gauge__label">score de risque</span>
              </div>
            </div>
            <div className="fiche-recommendation">
              <p className="fiche-recommendation__label">Recommandation</p>
              <p>{student.recommandation}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <h2>Profil académique</h2>
          </div>
          <div className="card__body fiche-profile-grid">
            <div className="fiche-profile-item">
              <span>Taux de présence</span>
              <strong>{student.presence_pct}%</strong>
            </div>
            <div className="fiche-profile-item">
              <span>Étude personnelle</span>
              <strong>{ETUDE_LABELS[student.study_min] || `${student.study_min} min`}</strong>
            </div>
            <div className="fiche-profile-item">
              <span>Accès à la bibliothèque</span>
              <strong>{student.bibliotheque_acces}</strong>
            </div>
            <div className="fiche-profile-item">
              <span>Interaction avec les enseignants</span>
              <strong>{student.interaction_enseignant}</strong>
            </div>
            <div className="fiche-profile-item">
              <span>Implication en travaux de groupe</span>
              <strong>{student.implication} / 5</strong>
            </div>
            <div className="fiche-profile-item">
              <span>Statut de logement</span>
              <strong>{student.logement}</strong>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
