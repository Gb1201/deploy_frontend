import { NavLink } from "react-router-dom";
import {
  Home, Calendar, PenLine, BarChart2, Users, ShieldHalf,
} from "lucide-react";

const LINKS = [
  { to: "/",             label: "Início",      Icon: Home      },
  { to: "/partidas",     label: "Partidas",    Icon: Calendar  },
  { to: "/palpites",     label: "Palpites",    Icon: PenLine   },
  { to: "/ranking",      label: "Ranking",     Icon: BarChart2 },
  { to: "/participantes",label: "Jogadores",   Icon: Users     },
];

export default function Navbar() {
  return (
    <>
      {/* Desktop */}
      <nav className="navbar">
        <div className="navbar-inner">
          <NavLink to="/" className="navbar-logo">
            <div className="navbar-logo-icon">
              <ShieldHalf size={18} color="#fff" />
            </div>
            DF NEWS
          </NavLink>

          <div className="navbar-links">
            {LINKS.map(({ to, label, Icon }) => (
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
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        {LINKS.map(({ to, label, Icon }) => (
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
      </nav>
    </>
  );
}