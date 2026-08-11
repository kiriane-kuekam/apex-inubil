const VALUE_CLASS = {
  primary: "stat-tile__value stat-tile__value--primary",
  accent: "stat-tile__value stat-tile__value--accent",
};

const ICON_CLASS = {
  primary: "stat-tile__icon stat-tile__icon--primary",
  accent: "stat-tile__icon stat-tile__icon--accent",
};

export function StatTile({ label, value, icon: Icon, variant, progressPct, caption, pills }) {
  return (
    <div className="stat-tile">
      <div className="stat-tile__top">
        <div className="stat-tile__label">{label}</div>
        {Icon && (
          <span className={ICON_CLASS[variant] || ICON_CLASS.primary}>
            <Icon size={17} />
          </span>
        )}
      </div>

      <div className={VALUE_CLASS[variant] || "stat-tile__value"}>{value}</div>

      {progressPct !== undefined && (
        <div className="stat-tile__progress">
          <div className="stat-tile__progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      )}

      {caption && <div className="stat-tile__caption">{caption}</div>}

      {pills && pills.length > 0 && (
        <div className="stat-tile__pills">
          {pills.slice(0, 3).map((p) => (
            <span key={p} className="pill-chip">{p}</span>
          ))}
          {pills.length > 3 && <span className="pill-chip">+{pills.length - 3}</span>}
        </div>
      )}
    </div>
  );
}
