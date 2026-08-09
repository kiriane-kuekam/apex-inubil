import { useNavigate } from "react-router-dom";
import { RiskBadge } from "./RiskBadge";

export function StudentsTable({ students }) {
  const navigate = useNavigate();

  if (!students.length) {
    return <div className="empty-state">Aucun étudiant ne correspond à ces filtres.</div>;
  }

  return (
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
        {students.map((s) => (
          <tr key={s.id} onClick={() => navigate(`/etudiants/${s.id}`)}>
            <td className="cell-name">{s.prenom} {s.nom}</td>
            <td className="cell-muted">{s.matricule}</td>
            <td>{s.filiere}</td>
            <td className="cell-muted">{s.niveau}</td>
            <td className="cell-score">{Math.round(s.risque_score * 100)}%</td>
            <td><RiskBadge label={s.risque_label} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
