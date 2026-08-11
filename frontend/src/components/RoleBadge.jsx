import { ROLE_LABELS } from "../utils/roles";

const COLOR = {
  administrateur: "#5b3aa8",
  enseignant: "var(--color-primary)",
  responsable_pedagogique: "var(--color-accent-text)",
};

export function RoleBadge({ role }) {
  return (
    <span className="role-label">
      <span className="role-label__dot" style={{ background: COLOR[role] || "var(--color-text-muted)" }} />
      {ROLE_LABELS[role] || role}
    </span>
  );
}
