import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Send, PenLine, Users, ListChecks } from "lucide-react";
import { palpitesApi, partidasApi, participantesApi } from "../api";
import {
  ScoreStepper, Spinner, PtsBadge, EmptyState, Avatar, StatusBadge,
} from "../components/UI";
import { fmtDate, fmtTime } from "../utils";

export default function PalpitesPage({ toast }) {
  const location = useLocation();
  const initialPartidaId = location.state?.partidaId ?? null;

  const [partidas,      setPartidas]      = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [loading,       setLoading]       = useState(true);

  const [selectedId,    setSelectedId]    = useState(initialPartidaId);
  const [palpites,      setPalpites]      = useState([]);
  const [loadingP,      setLoadingP]      = useState(false);

  const [participanteId, setParticipanteId] = useState("");
  const [score, setScore]                   = useState({ home: 0, away: 0 });
  const [saving, setSaving]                 = useState(false);

  useEffect(() => {
    Promise.all([partidasApi.disponiveis(), participantesApi.listar()])
      .then(([p, part]) => { setPartidas(p); setParticipantes(part); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) { setPalpites([]); return; }
    setLoadingP(true);
    palpitesApi.porPartida(selectedId).then(setPalpites).finally(() => setLoadingP(false));
  }, [selectedId]);

  const partida = partidas.find((p) => p.id === selectedId) ?? location.state?.partida ?? null;

  const selectedParticipante = participantes.find(
    (p) => String(p.id) === String(participanteId)
  );

  const respondentCount   = palpites.length;
  const totalParticipants = participantes.length;
  const respondPct = totalParticipants
    ? Math.round((respondentCount / totalParticipants) * 100)
    : 0;

  // Quando a partida já foi encerrada (resultado conhecido), mostra os melhores palpites primeiro.
  const sortedPalpites = useMemo(() => {
    if (partida?.status !== "ENCERRADA") return palpites;
    return [...palpites].sort((a, b) => (b.pontos ?? -1) - (a.pontos ?? -1));
  }, [palpites, partida]);

  const handleRegistrar = async () => {
    if (!participanteId || !selectedId) {
      toast("Selecione participante e partida", "error"); return;
    }
    setSaving(true);
    try {
      await palpitesApi.registrar({
        participanteId: Number(participanteId),
        partidaId: selectedId,
        palpiteGolsCasa: score.home,
        palpiteGolsFora: score.away,
      });
      toast("Palpite registrado!", "success");
      setParticipanteId("");
      setScore({ home: 0, away: 0 });
      const fresh = await palpitesApi.porPartida(selectedId);
      setPalpites(fresh);
    } catch (e) {
      toast(e.message || "Erro ao registrar palpite", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container page">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <div
          style={{
            width: 40, height: 40, borderRadius: "var(--radius)",
            background: "var(--red-glow)", display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          <PenLine size={19} color="var(--red-light)" />
        </div>
        <div>
          <h2 className="section-title bebas" style={{ margin: 0 }}>Palpites</h2>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>
            Registre e acompanhe os palpites de cada partida
          </p>
        </div>
      </div>

      {/* Selecionar partida */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="field">
          <label className="field-label">Partida</label>
          <select
            className="select"
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(Number(e.target.value) || null)}
          >
            <option value="">Selecione uma partida…</option>
            {partidas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.timeCasa} × {p.timeFora} — {fmtDate(p.data)} [{p.status}]
              </option>
            ))}
          </select>
        </div>

        {/* Preview da partida selecionada */}
        {partida && (
          <div
            style={{
              marginTop: 14, padding: "14px 16px",
              background: "var(--dark-3)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <StatusBadge status={partida.status} />
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                {fmtDate(partida.data)}{partida.horario && ` · ${fmtTime(partida.horario)}`}
              </span>
            </div>
            <div className="partida-matchup">
              <span className="partida-team">{partida.timeCasa}</span>
              <span className="bebas" style={{ fontSize: 22, color: "var(--text-3)" }}>×</span>
              <span className="partida-team">{partida.timeFora}</span>
            </div>
          </div>
        )}

        {/* Form de palpite (apenas se partida selecionada) */}
        {partida && (
          <>
            <div className="divider" />

            <div
              style={{
                padding: 16, borderRadius: "var(--radius)",
                background: "rgba(204,0,0,0.04)", border: "1px solid rgba(204,0,0,0.15)",
              }}
            >
              <div className="field" style={{ marginBottom: 4 }}>
                <label className="field-label">Participante</label>
                <select
                  className="select"
                  value={participanteId}
                  onChange={(e) => setParticipanteId(e.target.value)}
                >
                  <option value="">Selecione…</option>
                  {participantes.map((p) => (
                    <option key={p.id} value={p.id}>{p.nomeCompleto}</option>
                  ))}
                </select>
              </div>

              {selectedParticipante && (
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: 8, marginTop: 10,
                    padding: "7px 10px", background: "var(--dark-3)", borderRadius: "var(--radius-sm)",
                  }}
                >
                  <Avatar nome={selectedParticipante.nomeCompleto} />
                  <span style={{ fontSize: 13, color: "var(--text-2)" }}>
                    Palpite de <strong style={{ color: "var(--text)" }}>{selectedParticipante.nomeCompleto}</strong>
                  </span>
                </div>
              )}

              <ScoreStepper
                homeTeam={partida.timeCasa}
                awayTeam={partida.timeFora}
                home={score.home}
                away={score.away}
                onChange={setScore}
              />

              <button
                className="btn btn-primary btn-full"
                onClick={handleRegistrar}
                disabled={!participanteId || saving}
              >
                <Send size={15} />
                {saving ? "Registrando…" : "Registrar palpite"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Lista de palpites */}
      {selectedId && (
        <div className="card">
          <div className="section-header" style={{ marginBottom: 4 }}>
            <span className="field-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <ListChecks size={14} />
              Palpites registrados
            </span>
            <span style={{ fontSize: 12, color: "var(--text-3)" }}>{palpites.length} total</span>
          </div>

          {/* Barra de progresso: quantos já palpitaram */}
          {totalParticipants > 0 && (
            <div style={{ margin: "12px 0 4px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-2)" }}>
                  <Users size={13} />
                  {respondentCount} de {totalParticipants} já palpitaram
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--red-light)" }}>{respondPct}%</span>
              </div>
              <div style={{ height: 6, background: "var(--dark-3)", borderRadius: 100, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%", width: `${respondPct}%`,
                    background: "linear-gradient(90deg, var(--red-dark), var(--red-light))",
                    borderRadius: 100, transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          )}

          <div className="divider" style={{ margin: "16px 0 2px" }} />

          {loadingP ? (
            <Spinner />
          ) : sortedPalpites.length === 0 ? (
            <EmptyState icon={PenLine} message="Nenhum palpite ainda." />
          ) : (
            sortedPalpites.map((p) => {
              const accent = p.pontos === 3 ? "var(--gold)" : p.pontos === 1 ? "var(--green-text)" : "transparent";
              return (
                <div
                  key={p.id}
                  className="palpite-row"
                  style={{ borderLeft: `3px solid ${accent}`, paddingLeft: 10 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar nome={p.participanteNome} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.participanteNome}</div>
                      <div style={{ fontSize: 12, color: "var(--text-2)" }}>
                        {p.palpiteGolsCasa} × {p.palpiteGolsFora}
                      </div>
                    </div>
                  </div>
                  <PtsBadge pts={p.pontos} />
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}