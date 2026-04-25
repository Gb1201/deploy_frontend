import { useState } from "react";
import { initials } from "../utils";

const PLACE_ORDER = [2, 1, 3]; // visual order: silver, gold, bronze

function PodiumPlace({ player, place, isExpanded, onClick }) {
  if (!player) return <div style={{ flex: 1 }} />;

  return (
    <div className="podium-place" onClick={onClick} title={player.nomeCompleto}>
      <div className="podium-player-info">
        <div style={{ position: "relative" }}>
          {place === 1 && <span className="podium-crown">👑</span>}
          <div className={`podium-avatar place-${place}`}>
            {initials(player.nomeCompleto)}
          </div>
        </div>
        <span className="podium-name">{player.nomeCompleto.split(" ")[0]}</span>
        <span className={`podium-pts place-${place}`}>{player.totalPontos}pts</span>

        {/* Expanded stats */}
        {isExpanded && (
          <div
            style={{
              background: "var(--dark-3)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "8px 12px",
              marginTop: 4,
              fontSize: 11,
              color: "var(--text-2)",
              textAlign: "center",
              lineHeight: 1.9,
              minWidth: 90,
            }}
          >
            <div><strong style={{ color: "var(--text)" }}>{player.totalJogos}</strong> palpites</div>
            <div><strong style={{ color: "var(--green-text)" }}>{player.totalVitorias}</strong> exatos</div>
            <div><strong style={{ color: "var(--text)" }}>{player.taxaVitoria}%</strong> acerto</div>
          </div>
        )}
      </div>

      <div className={`podium-block place-${place}`}>
        <span className={`podium-num place-${place}`}>{place}°</span>
      </div>
    </div>
  );
}

export default function Podium({ top3 }) {
  const [expanded, setExpanded] = useState(null);

  if (!top3 || top3.length === 0) return null;

  // Map position numbers to players
  const byPos = Object.fromEntries(top3.map((p) => [p.posicao, p]));

  const toggle = (pos) => setExpanded((prev) => (prev === pos ? null : pos));

  return (
    <div>
      <div className="podium-wrap">
        {PLACE_ORDER.map((place) => (
          <PodiumPlace
            key={place}
            place={place}
            player={byPos[place]}
            isExpanded={expanded === place}
            onClick={() => toggle(place)}
          />
        ))}
      </div>
      <p
        style={{
          textAlign: "center",
          fontSize: 11,
          color: "var(--text-3)",
          marginTop: 10,
        }}
      >
        Clique em um jogador para ver detalhes
      </p>
    </div>
  );
}