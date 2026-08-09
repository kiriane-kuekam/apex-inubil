const LABELS = {
  faible: "Risque faible",
  moyen: "Risque modéré",
  eleve: "Risque élevé",
};

export function RiskBadge({ label, compact = false }) {
  const text = compact ? label : LABELS[label] || label;
  return (
    <span className={`risk-badge risk-badge--${label}`}>
      <span className="risk-badge__dot" />
      {text}
    </span>
  );
}
