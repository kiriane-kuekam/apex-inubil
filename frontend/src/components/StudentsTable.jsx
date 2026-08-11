import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiskBadge } from "./RiskBadge";
import { StudentAvatar } from "./StudentAvatar";

const LIMIT = 10;

export function StudentsTable({ students }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [students]);

  if (!students.length) {
    return <div className="empty-state">Aucun étudiant ne correspond à ces filtres.</div>;
  }

  const visible = expanded ? students : students.slice(0, LIMIT);
  const hidden = students.length - visible.length;

  return (
    <>
      <table className="data-table">
        <thead>
          <tr>
            <th>Étudiant</th>
            <th>Matricule</th>
            <th>Filière</th>
            <th>Niveau</th>
            <th>Score de risque</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((s) => (
            <tr key={s.id} onClick={() => navigate(`/etudiants/${s.id}`)}>
              <td className="cell-name cell-student">
                <StudentAvatar nom={s.nom} prenom={s.prenom} />
                {s.prenom} {s.nom}
              </td>
              <td className="cell-muted">{s.matricule}</td>
              <td>{s.filiere}</td>
              <td className="cell-muted">{s.niveau}</td>
              <td className="cell-score">{Math.round(s.risque_score * 100)}%</td>
              <td><RiskBadge label={s.risque_label} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      {students.length > LIMIT && (
        <div className="table-more">
          <button className="btn btn-outline" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Voir moins" : `Voir tout (${students.length})`}
          </button>
          {!expanded && <span className="cell-muted">{hidden} étudiant{hidden > 1 ? "s" : ""} de plus</span>}
        </div>
      )}
    </>
  );
}
