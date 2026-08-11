export function RiskDistributionChart({ data }) {
  return (
    <div className="risk-bars">
      {data.map((f) => {
        const total = f.nb_etudiants || 1;
        const pctFaible = (f.nb_faible / total) * 100;
        const pctMoyen = (f.nb_moyen / total) * 100;
        const pctEleve = (f.nb_eleve / total) * 100;
        return (
          <div key={f.filiere} className="risk-bars__row">
            <div className="risk-bars__label">
              <span>{f.filiere}</span>
              <span className="cell-muted">{f.nb_etudiants} étudiant{f.nb_etudiants > 1 ? "s" : ""}</span>
            </div>
            <div className="risk-bars__track">
              {pctFaible > 0 && (
                <div className="risk-bars__segment risk-bars__segment--faible" style={{ width: `${pctFaible}%` }} />
              )}
              {pctMoyen > 0 && (
                <div className="risk-bars__segment risk-bars__segment--moyen" style={{ width: `${pctMoyen}%` }} />
              )}
              {pctEleve > 0 && (
                <div className="risk-bars__segment risk-bars__segment--eleve" style={{ width: `${pctEleve}%` }} />
              )}
            </div>
          </div>
        );
      })}

      <div className="stat-legend" style={{ justifyContent: "flex-start", marginTop: 20 }}>
        <div className="stat-legend__item">
          <span className="stat-legend__dot" style={{ background: "#1b8a6b" }} />
          Faible
        </div>
        <div className="stat-legend__item">
          <span className="stat-legend__dot" style={{ background: "#ab5a00" }} />
          Modéré
        </div>
        <div className="stat-legend__item">
          <span className="stat-legend__dot" style={{ background: "#93000a" }} />
          Élevé
        </div>
      </div>
    </div>
  );
}
