import { NavLink } from "react-router-dom";
import { LayoutGrid, LogOut, Network, TriangleAlert, ChartColumnBig, UsersRound, Upload } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getInitials } from "../utils/avatar";
import { ROLE_LABELS } from "../utils/roles";
import logo from "../assets/logo.jpg";

const NAV_BY_ROLE = {
  administrateur: [
    { to: "/", label: "Tableau de bord", icon: LayoutGrid },
    { to: "/utilisateurs", label: "Utilisateurs", icon: UsersRound },
    { to: "/filieres", label: "Filières", icon: Network },
  ],
  responsable_pedagogique: [
    { to: "/", label: "Tableau de bord", icon: LayoutGrid },
    { to: "/alertes", label: "Alertes", icon: TriangleAlert },
    { to: "/statistiques", label: "Statistiques", icon: ChartColumnBig },
    { to: "/importer", label: "Importer des étudiants", icon: Upload },
  ],
  enseignant: [
    { to: "/", label: "Mes étudiants", icon: LayoutGrid },
    { to: "/alertes", label: "Alertes", icon: TriangleAlert },
  ],
};

export function AppShell({ children }) {
  const { user, logout } = useAuth();
  const links = NAV_BY_ROLE[user?.role] || [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__brand-plate">
            <img src={logo} alt="APEX INUBIL" />
          </div>
          <small>Suivi de la réussite académique</small>
        </div>

        <nav className="sidebar__nav">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  "sidebar__link" + (isActive ? " is-active" : "")
                }
              >
                <Icon size={18} strokeWidth={2} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__avatar">{getInitials(user?.fullName)}</div>
            <div>
              <strong>{user?.fullName}</strong>
              {ROLE_LABELS[user?.role] || user?.role}
            </div>
          </div>
          <button className="sidebar__logout" onClick={logout}>
            <LogOut size={15} strokeWidth={2} />
            Se déconnecter
          </button>
        </div>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}
