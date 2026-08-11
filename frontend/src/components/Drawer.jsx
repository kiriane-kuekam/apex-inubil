import { X } from "lucide-react";

export function Drawer({ open, onClose, title, children }) {
  return (
    <div className={"drawer-backdrop" + (open ? " is-open" : "")} onClick={onClose}>
      <aside
        className={"drawer" + (open ? " is-open" : "")}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="drawer__header">
          <h2>{title}</h2>
          <button className="drawer__close" onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        <div className="drawer__body">{children}</div>
      </aside>
    </div>
  );
}
