import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_BY_ROLE = {
  responsable_pedagogique: [
    { to: "/", label: "Tableau de bord" },
    { to: "/alertes", label: "Alertes" },
    { to: "/statistiques", label: "Statistiques" },
  ],
  enseignant: [
    { to: "/", label: "Mes étudiants" },
    { to: "/alertes", label: "Alertes" },
  ],
};

export function AppShell({ children }) {
  const { user, logout } = useAuth();
  const links = NAV_BY_ROLE[user?.role] || [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__brand-mark">AI</div>
          <div className="sidebar__brand-text">
            APEX INUBIL
            <small>Suivi de la réussite académique</small>
          </div>
        </div>

        <nav className="sidebar__nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                "sidebar__link" + (isActive ? " is-active" : "")
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <strong>{user?.fullName}</strong>
            {user?.role === "enseignant" ? "Enseignant" : "Responsable pédagogique"}
          </div>
          <button className="sidebar__logout" onClick={logout}>
            Se déconnecter
          </button>
        </div>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}
