import { useEffect, useMemo, useState } from "react";
import {
  Trophy, Search, X, ChevronUp, ChevronDown,
  ArrowUp, ArrowDown, Minus, Star, Crown,
} from "lucide-react";
import { participantesApi } from "../api";
import Podium from "../components/Podium";
import { Avatar, Spinner, EmptyState, CountUp } from "../components/UI";

const POS_CLS = { 1: "gold", 2: "silver", 3: "bronze" };
const ME_KEY = "dfFlaMeuParticipanteId";
const SNAPSHOT_KEY = "dfFlaRankingSnapshot";

// A partir dessa posição, a linha entra na "zona de rebaixamento".
// Ajuste esse número conforme o tamanho do seu bolão.
const RELEGATION_FROM = 26;

// numeric: false → alinhado à esquerda / ordenação padrão ascendente
// numeric: true  → alinhado à direita / ordenação padrão descendente
const COLUMNS = [
  { key: "posicao",       label: "#",        numeric: false },
  { key: "nomeCompleto",  label: "Jogador",  numeric: false },
  { key: "totalPontos",   label: "Pts",      numeric: true  },
  { key: "totalJogos",    label: "Jogos",    numeric: true  },
  { key: "totalVitorias", label: "Exatos",   numeric: true  },
  { key: "taxaVitoria",   label: "% Acerto", numeric: true  },
];

// Zona da tabela: pódio (verde), neutra, ou rebaixamento (vermelha) — like tabela de campeonato.
function getZone(posicao) {
  if (posicao <= 3) return "top";
  if (posicao >= RELEGATION_FROM) return "relegation";
  return null;
}

export default function RankingPage() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deltas, setDeltas] = useState({});

  const [search, setSearch] = useState("");
  const [scope, setScope]   = useState("todos"); // "todos" | "top10"
  const [sort, setSort]     = useState({ key: "posicao", dir: "asc" });

  const [meuId, setMeuId] = useState(() => {
    try { return localStorage.getItem(ME_KEY) || ""; } catch { return ""; }
  });

  useEffect(() => {
    participantesApi.classificacao()
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => b.totalPontos - a.totalPontos || b.totalVitorias - a.totalVitorias
        );
        const withPos = sorted.map((item, i) => ({ ...item, posicao: i + 1 }));
        setRanking(withPos);

        // Compara com a última visita salva no navegador p/ mostrar quem subiu/desceu
        try {
          const raw = localStorage.getItem(SNAPSHOT_KEY);
          const prev = raw ? JSON.parse(raw) : {};
          const d = {};
          withPos.forEach((p) => {
            const before = prev[p.participanteId];
            if (before != null) d[p.participanteId] = before - p.posicao;
          });
          setDeltas(d);
          const next = Object.fromEntries(withPos.map((p) => [p.participanteId, p.posicao]));
          localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(next));
        } catch { /* localStorage indisponível — segue sem comparação */ }
      })
      .finally(() => setLoading(false));
  }, []);

  const top3 = ranking.slice(0, 3);

  const displayList = useMemo(() => {
    let list = scope === "top10" ? ranking.slice(0, 10) : ranking;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.nomeCompleto.toLowerCase().includes(q));
    }
    const { key, dir } = sort;
    const mult = dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      if (key === "nomeCompleto") return a.nomeCompleto.localeCompare(b.nomeCompleto) * mult;
      return (a[key] - b[key]) * mult;
    });
  }, [ranking, search, scope, sort]);

  const toggleSort = (col) => {
    setSort((prev) => {
      if (prev.key === col.key) return { key: col.key, dir: prev.dir === "asc" ? "desc" : "asc" };
      return { key: col.key, dir: col.numeric ? "desc" : "asc" };
    });
  };

  const toggleMe = (id) => {
    const next = String(meuId) === String(id) ? "" : String(id);
    setMeuId(next);
    try {
      if (next) localStorage.setItem(ME_KEY, next);
      else localStorage.removeItem(ME_KEY);
    } catch { /* ignora se localStorage bloqueado */ }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container page">
      <div className="section-header" style={{ marginBottom: 18 }}>
        <h2 className="section-title bebas">Classificação</h2>
        {ranking.length > 0 && (
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>{ranking.length} jogadores</span>
        )}
      </div>

      {ranking.length === 0 ? (
        <EmptyState icon={Trophy} message="Nenhum participante na classificação ainda." />
      ) : (
        <>
          {/* Pódio Top 3 */}
          {top3.length >= 1 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <Podium top3={top3} />
            </div>
          )}

          {/* Busca + escopo */}
          <div className="ranking-controls">
            <div className="search-field">
              <Search size={15} className="search-icon" />
              <input
                className="input"
                style={{ paddingLeft: 34, paddingRight: search ? 32 : 14 }}
                placeholder="Buscar jogador…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch("")} aria-label="Limpar busca">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="tab-pills" style={{ margin: 0 }}>
              <button
                className={`tab-pill ${scope === "todos" ? "active" : ""}`}
                onClick={() => setScope("todos")}
              >
                Todos
              </button>
              <button
                className={`tab-pill ${scope === "top10" ? "active" : ""}`}
                onClick={() => setScope("top10")}
              >
                Top 10
              </button>
            </div>
          </div>

          {/* Legenda das zonas */}
          <div
            style={{
              display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap",
              marginBottom: 12, fontSize: 12, color: "var(--text-3)",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
              Pódio (Top 3)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#F87171", display: "inline-block" }} />
              Zona de rebaixamento (a partir da {RELEGATION_FROM}ª posição)
            </span>
          </div>

          {/* Tabela completa */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table className="rank-table">
                <thead>
                  <tr>
                    {COLUMNS.map((c) => (
                      <th
                        key={c.key}
                        className={`sortable-th ${c.numeric ? "col-num" : ""}`}
                        onClick={() => toggleSort(c)}
                      >
                        <span className="sortable-th-inner">
                          {c.label}
                          {sort.key === c.key && (
                            sort.dir === "asc"
                              ? <ChevronUp size={12} />
                              : <ChevronDown size={12} />
                          )}
                        </span>
                      </th>
                    ))}
                    <th className="rank-th-pin" aria-hidden="true"></th>
                  </tr>
                </thead>
                <tbody>
                  {displayList.length === 0 ? (
                    <tr>
                      <td colSpan={COLUMNS.length + 1}>
                        <EmptyState icon={Search} message="Nenhum jogador encontrado." />
                      </td>
                    </tr>
                  ) : displayList.map((p) => {
                    const isMe = String(meuId) === String(p.participanteId);
                    const delta = deltas[p.participanteId];
                    const zone = getZone(p.posicao);

                    const stripeColor =
                      zone === "top" ? "var(--green)" :
                      zone === "relegation" ? "#F87171" : "transparent";

                    const rowBg = isMe
                      ? undefined // a classe rank-row-me já cuida do fundo
                      : zone === "top" ? "rgba(34,197,94,0.045)"
                      : zone === "relegation" ? "rgba(248,113,113,0.045)"
                      : undefined;

                    return (
                      <tr
                        key={p.participanteId}
                        className={`rank-row ${isMe ? "rank-row-me" : ""}`}
                        style={{ background: rowBg, cursor: "default" }}
                      >
                        <td style={{ borderLeft: `3px solid ${stripeColor}` }}>
                          <span className={`rank-pos ${POS_CLS[p.posicao] || ""}`}>
                            {p.posicao === 1 && <Crown size={13} style={{ marginRight: 3, verticalAlign: -2 }} />}
                            {p.posicao}°
                          </span>
                          {delta > 0 && <span className="delta delta-up"><ArrowUp size={11} />{delta}</span>}
                          {delta < 0 && <span className="delta delta-down"><ArrowDown size={11} />{Math.abs(delta)}</span>}
                          {delta === 0 && <span className="delta delta-same"><Minus size={11} /></span>}
                        </td>
                        <td>
                          <div className="rank-player">
                            <Avatar nome={p.nomeCompleto} />
                            <span style={{ fontWeight: 500 }}>{p.nomeCompleto}</span>
                            {isMe && <span className="badge badge-ativa">Você</span>}
                          </div>
                        </td>
                        <td className="col-num">
                          <span className="rank-pts"><CountUp value={p.totalPontos} /></span>
                        </td>
                        <td className="col-num" style={{ color: "var(--text-2)" }}>{p.totalJogos}</td>
                        <td className="col-num" style={{ color: "var(--text-2)" }}>{p.totalVitorias}</td>
                        <td className="col-num">
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "3px 9px",
                              borderRadius: 100,
                              background: p.taxaVitoria >= 50
                                ? "var(--green-dim)"
                                : "rgba(255,255,255,0.06)",
                              color: p.taxaVitoria >= 50
                                ? "var(--green-text)"
                                : "var(--text-3)",
                            }}
                          >
                            {p.taxaVitoria}%
                          </span>
                        </td>
                        <td className="rank-pin-cell">
                          <button
                            className="pin-btn"
                            onClick={() => toggleMe(p.participanteId)}
                            title={isMe ? "Deixar de me destacar" : "Esse sou eu"}
                            aria-label={isMe ? "Deixar de me destacar" : "Esse sou eu"}
                          >
                            <Star
                              size={15}
                              fill={isMe ? "var(--gold)" : "none"}
                              color={isMe ? "var(--gold)" : "var(--text-3)"}
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legenda pontuação */}
          <div className="card" style={{ marginTop: 16 }}>
            <div
              className="section-title bebas"
              style={{ fontSize: 16, marginBottom: 14 }}
            >
              Sistema de pontuação
            </div>
            <div className="scoring-row">
              <span className="pts-badge pts-3">3pts</span>
              <span style={{ color: "var(--text-2)", fontSize: 14 }}>Acertou o placar exato</span>
            </div>
            <div className="scoring-row">
              <span className="pts-badge pts-1">1pt</span>
              <span style={{ color: "var(--text-2)", fontSize: 14 }}>Acertou apenas os gols do Flamengo</span>
            </div>
            <div className="scoring-row">
              <span className="pts-badge pts-0">0pts</span>
              <span style={{ color: "var(--text-2)", fontSize: 14 }}>Não acertou nenhum critério</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}