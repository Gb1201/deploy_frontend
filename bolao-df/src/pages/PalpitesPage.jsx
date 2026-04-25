import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Send, PenLine } from "lucide-react";
import { palpitesApi, partidasApi, participantesApi } from "../api";
import { ScoreStepper, Spinner, PtsBadge, EmptyState } from "../components/UI";
import { Avatar } from "../components/UI";
import { fmtDate } from "../utils";

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
      <h2 className="section-title bebas" style={{ marginBottom: 22 }}>Palpites</h2>

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

        {/* Form de palpite (apenas se partida selecionada) */}
        {partida && (
          <>
            <div className="divider" />

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
          </>
        )}
      </div>

      {/* Lista de palpites */}
      {selectedId && (
        <div className="card">
          <div className="section-header" style={{ marginBottom: 4 }}>
            <span className="field-label">Palpites registrados</span>
            <span style={{ fontSize: 12, color: "var(--text-3)" }}>{palpites.length} total</span>
          </div>

          {loadingP ? (
            <Spinner />
          ) : palpites.length === 0 ? (
            <EmptyState icon={PenLine} message="Nenhum palpite ainda." />
          ) : (
            palpites.map((p) => (
              <div key={p.id} className="palpite-row">
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
            ))
          )}
        </div>
      )}
    </div>
  );
}