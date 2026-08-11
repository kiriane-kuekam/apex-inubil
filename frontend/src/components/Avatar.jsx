import { getAvatarColor, getInitials } from "../utils/avatar";

export function Avatar({ name, className = "student-avatar" }) {
  const { bg, text } = getAvatarColor(name || "");
  return (
    <span className={className} style={{ background: bg, color: text }}>
      {getInitials(name)}
    </span>
  );
}
