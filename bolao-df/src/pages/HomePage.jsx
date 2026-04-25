import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Calendar, Trophy } from "lucide-react";
import { partidasApi, participantesApi } from "../api";
import PartidaCard from "../components/PartidaCard";
import Podium from "../components/Podium";
import { Spinner, EmptyState } from "../components/UI";

export default function HomePage() {
  const navigate = useNavigate();
  const [partidas, setPartidas] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([partidasApi.listar(), participantesApi.classificacao()])
      .then(([p, r]) => {
        setPartidas(p);
        // Garantir ordem decrescente de pontos
        const sorted = [...r].sort((a, b) => b.totalPontos - a.totalPontos || b.totalVitorias - a.totalVitorias);
        setRanking(sorted.map((item, i) => ({ ...item, posicao: i + 1 })));
      })
      .finally(() => setLoading(false));
  }, []);

  const ativa   = partidas.find((p) => p.status === "ATIVA");
  const proximas = partidas.filter((p) => p.status === "AGENDADA").slice(0, 3);
  const top3    = ranking.slice(0, 3);

  const encerradas = partidas.filter((p) => p.status === "ENCERRADA").length;

  if (loading) return <Spinner />;

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <div className="container">
          <h1 className="hero-title">
            BOLÃO DO <span>DF NEWS</span>
          </h1>
          <p className="hero-sub">Sistema de Bolão do DF News</p>
          <div className="hero-stats">
            <div>
              <div className="hero-stat-val">{partidas.length}</div>
              <div className="hero-stat-label">Partidas</div>
            </div>
            <div>
              <div className="hero-stat-val">{encerradas}</div>
              <div className="hero-stat-label">Encerradas</div>
            </div>
            <div>
              <div className="hero-stat-val">{ranking.length}</div>
              <div className="hero-stat-label">Jogadores</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container page">
        {/* Bolão ativo */}
        {ativa && (
          <section style={{ marginBottom: 32 }}>
            <div className="section-header">
              <h2 className="section-title bebas">Bolão aberto</h2>
            </div>
            <PartidaCard partida={ativa}>
              <button
                className="btn btn-primary btn-full"
                onClick={() => navigate("/palpites", { state: { partidaId: ativa.id, partida: ativa } })}
              >
                <ArrowRight size={16} />
                Fazer palpite
              </button>
            </PartidaCard>
          </section>
        )}

        {/* Pódio */}
        {top3.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <div className="section-header">
              <h2 className="section-title bebas">Classificação</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/ranking")}>
                Ver tudo <ArrowRight size={13} />
              </button>
            </div>
            <div className="card">
              <Podium top3={top3} />
            </div>
          </section>
        )}

        {/* Próximas partidas */}
        {proximas.length > 0 && (
          <section>
            <div className="section-header">
              <h2 className="section-title bebas">Próximas partidas</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/partidas")}>
                Ver todas <ArrowRight size={13} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {proximas.map((p) => (
                <PartidaCard key={p.id} partida={p} />
              ))}
            </div>
          </section>
        )}

        {partidas.length === 0 && (
          <EmptyState icon={Calendar} message="Nenhuma partida cadastrada ainda." />
        )}

        {partidas.length > 0 && !ativa && proximas.length === 0 && top3.length === 0 && (
          <EmptyState icon={Trophy} message="Aguardando dados do bolão..." />
        )}
      </div>
    </div>
  );
}