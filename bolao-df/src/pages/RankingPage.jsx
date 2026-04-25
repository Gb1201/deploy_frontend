import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { participantesApi } from "../api";
import Podium from "../components/Podium";
import { Avatar } from "../components/UI";
import { Spinner, EmptyState } from "../components/UI";

const POS_CLS = { 1: "gold", 2: "silver", 3: "bronze" };

export default function RankingPage() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    participantesApi.classificacao()
      .then((data) => {
        // Garantir ordenação decrescente de pontos no frontend também
        const sorted = [...data].sort(
          (a, b) => b.totalPontos - a.totalPontos || b.totalVitorias - a.totalVitorias
        );
        setRanking(sorted.map((item, i) => ({ ...item, posicao: i + 1 })));
      })
      .finally(() => setLoading(false));
  }, []);

  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  if (loading) return <Spinner />;

  return (
    <div className="container page">
      <h2 className="section-title bebas" style={{ marginBottom: 24 }}>Classificação</h2>

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

          {/* Tabela completa */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <table className="rank-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Jogador</th>
                  <th>Pts</th>
                  <th>Jogos</th>
                  <th>Exatos</th>
                  <th>% Acerto</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((p) => (
                  <tr key={p.participanteId}>
                    <td>
                      <span className={`rank-pos ${POS_CLS[p.posicao] || ""}`}>
                        {p.posicao}°
                      </span>
                    </td>
                    <td>
                      <div className="rank-player">
                        <Avatar nome={p.nomeCompleto} />
                        <span style={{ fontWeight: 500 }}>{p.nomeCompleto}</span>
                      </div>
                    </td>
                    <td><span className="rank-pts">{p.totalPontos}</span></td>
                    <td style={{ color: "var(--text-2)" }}>{p.totalJogos}</td>
                    <td style={{ color: "var(--text-2)" }}>{p.totalVitorias}</td>
                    <td>
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
                  </tr>
                ))}
              </tbody>
            </table>
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