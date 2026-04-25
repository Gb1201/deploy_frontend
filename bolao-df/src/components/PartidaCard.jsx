import { Calendar, Clock, MapPin } from "lucide-react";
import { StatusBadge } from "./UI";
import { fmtDate, fmtTime } from "../utils";

export default function PartidaCard({ partida, actions, children }) {
  const isActive = partida.status === "ATIVA";

  return (
    <div className={`partida-card ${isActive ? "is-active" : ""}`}>
      {/* Top row: badge + meta */}
      <div className="partida-top">
        <StatusBadge status={partida.status} />
        <div className="partida-meta">
          {partida.data && (
            <span className="meta-item">
              <Calendar size={12} strokeWidth={2} />
              {fmtDate(partida.data)}
            </span>
          )}
          {partida.horario && (
            <span className="meta-item">
              <Clock size={12} strokeWidth={2} />
              {fmtTime(partida.horario)}
            </span>
          )}
        </div>
      </div>

      {/* Matchup */}
      <div className="partida-matchup">
        <span className="partida-team">{partida.timeCasa}</span>
        <div className="partida-score">
          <span>{partida.golsTimeCasa ?? "—"}</span>
          <span className="partida-score-sep">×</span>
          <span>{partida.golsTimeFora ?? "—"}</span>
        </div>
        <span className="partida-team">{partida.timeFora}</span>
      </div>

      {/* Stadium */}
      {partida.estadio && (
        <div className="partida-meta">
          <span className="meta-item">
            <MapPin size={12} strokeWidth={2} />
            {partida.estadio}
          </span>
        </div>
      )}

      {/* Slot for action buttons */}
      {actions && <div className="partida-actions">{actions}</div>}

      {/* Arbitrary children */}
      {children}
    </div>
  );
}