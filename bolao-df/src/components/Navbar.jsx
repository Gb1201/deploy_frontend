import { NavLink } from "react-router-dom";
import {
  Home, Calendar, PenLine, BarChart2, Users, ShieldCheck, LogOut,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";

const LINKS = [
  { to: "/",             label: "Início",      Icon: Home      },
  { to: "/partidas",     label: "Partidas",    Icon: Calendar  },
  { to: "/palpites",     label: "Palpites",    Icon: PenLine, adminOnly: true },
  { to: "/ranking",      label: "Ranking",     Icon: BarChart2 },
  { to: "/participantes",label: "Jogadores",   Icon: Users, adminOnly: true },
];

export default function Navbar() {
  const { isAdmin, logout } = useAuth();
  const links = LINKS.filter((l) => !l.adminOnly || isAdmin);

  return (
    <>
      {/* Desktop */}
      <nav className="navbar">
        <div className="navbar-inner">
          <NavLink to="/" className="navbar-logo">
            <img src="/logo.png" alt="DF FLA News" className="navbar-logo-icon" />
            <span className="navbar-logo-text">
              DF FLA <span>NEWS</span>
            </span>
          </NavLink>

          <div className="navbar-links">
            {links.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `navbar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={15} strokeWidth={2} />
                {label}
              </NavLink>
            ))}

            {isAdmin ? (
              <button
                onClick={logout}
                className="navbar-link"
                style={{ background: "none", border: "none", cursor: "pointer" }}
                title="Sair do modo admin"
              >
                <LogOut size={15} strokeWidth={2} />
                Sair
              </button>
            ) : (
              <NavLink
                to="/admin-login"
                className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
                title="Área do administrador"
                style={{ opacity: 0.6 }}
              >
                <ShieldCheck size={15} strokeWidth={2} />
              </NavLink>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        {links.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `bottom-nav-btn ${isActive ? "active" : ""}`
            }
          >
            <Icon size={20} strokeWidth={2} />
            {label}
          </NavLink>
        ))}

        {isAdmin ? (
          <button onClick={logout} className="bottom-nav-btn">
            <LogOut size={20} strokeWidth={2} />
            Sair
          </button>
        ) : (
          <NavLink
            to="/admin-login"
            className={({ isActive }) => `bottom-nav-btn ${isActive ? "active" : ""}`}
          >
            <ShieldCheck size={20} strokeWidth={2} />
            Admin
          </NavLink>
        )}
      </nav>
    </>
  );
}