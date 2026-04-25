import { useEffect, useState } from "react";
import { Plus, Play, X, CheckSquare, Calendar } from "lucide-react";
import { partidasApi } from "../api";
import PartidaCard from "../components/PartidaCard";
import { Modal, ScoreStepper, Spinner, EmptyState } from "../components/UI";

// ── Modal: Nova Partida ───────────────────────────────────────
function NovaPartidaModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    tipo: "Casa", adversario: "", data: "", horario: "", estadio: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(form); }
    finally { setSaving(false); }
  };

  const valid = form.adversario.trim() && form.data;

  return (
    <Modal
      title="Nova Partida"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!valid || saving}>
            {saving ? "Salvando…" : "Cadastrar"}
          </button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="field">
          <label className="field-label">Flamengo joga</label>
          <select className="select" value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
            <option value="Casa">Em Casa (mandante)</option>
            <option value="Fora">Fora (visitante)</option>
          </select>
        </div>

        <div className="field">
          <label className="field-label">Adversário</label>
          <input
            className="input"
            placeholder="Ex: Vasco"
            value={form.adversario}
            onChange={(e) => set("adversario", e.target.value)}
          />
        </div>

        <div className="grid-2">
          <div className="field">
            <label className="field-label">Data</label>
            <input type="date" className="input" value={form.data} onChange={(e) => set("data", e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Horário</label>
            <input type="time" className="input" value={form.horario} onChange={(e) => set("horario", e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label className="field-label">Estádio</label>
          <input
            className="input"
            placeholder="Ex: Maracanã"
            value={form.estadio}
            onChange={(e) => set("estadio", e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

// ── Modal: Registrar Resultado ────────────────────────────────
function ResultadoModal({ partida, onClose, onSave }) {
  const [score, setScore] = useState({
    home: partida.golsTimeCasa ?? 0,
    away: partida.golsTimeFora ?? 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ golsTimeCasa: score.home, golsTimeFora: score.away });
    } finally { setSaving(false); }
  };

  return (
    <Modal
      title="Registrar Resultado"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Confirmando…" : "Confirmar resultado"}
          </button>
        </>
      }
    >
      <ScoreStepper
        homeTeam={partida.timeCasa}
        awayTeam={partida.timeFora}
        home={score.home}
        away={score.away}
        onChange={setScore}
      />
      <div className="info-box" style={{ marginTop: 4 }}>
        Ao confirmar, os palpites serão calculados automaticamente:
        <strong style={{ color: "var(--gold)" }}> 3pts</strong> placar exato ·
        <strong style={{ color: "var(--green-text)" }}> 1pt</strong> gols do Flamengo
      </div>
    </Modal>
  );
}

// ── Partidas Page ─────────────────────────────────────────────
const TABS = ["Todas", "Agendada", "Ativa", "Encerrada"];

export default function PartidasPage({ toast }) {
  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState("Todas");
  const [showNova, setShowNova] = useState(false);
  const [resultado, setResultado] = useState(null);

  const load = () => {
    setLoading(true);
    partidasApi.listar().then(setPartidas).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = tab === "Todas"
    ? partidas
    : partidas.filter((p) => p.status === tab.toUpperCase());

  // Handlers
  const handleCadastrar = async (form) => {
    try {
      await partidasApi.cadastrar(form);
      toast("Partida cadastrada!", "success");
      setShowNova(false);
      load();
    } catch (e) {
      toast(e.message || "Erro ao cadastrar", "error");
    }
  };

  const handleAtivar = async (id) => {
    try {
      await partidasApi.ativar(id);
      toast("Bolão ativado!", "success");
      load();
    } catch (e) {
      toast(e.message || "Erro", "error");
    }
  };

  const handleCancelar = async () => {
    try {
      await partidasApi.cancelar();
      toast("Bolão cancelado", "success");
      load();
    } catch (e) {
      toast(e.message || "Erro", "error");
    }
  };

  const handleResultado = async (body) => {
    try {
      await partidasApi.resultado(resultado.id, body);
      toast("Resultado registrado! Pontos calculados.", "success");
      setResultado(null);
      load();
    } catch (e) {
      toast(e.message || "Erro ao registrar resultado", "error");
    }
  };

  // Build action buttons per partida
  const getActions = (p) => {
    if (p.status === "AGENDADA") return (
      <button className="btn btn-success btn-sm" onClick={() => handleAtivar(p.id)}>
        <Play size={13} /> Ativar bolão
      </button>
    );
    if (p.status === "ATIVA") return (
      <>
        <button className="btn btn-ghost btn-sm" onClick={() => setResultado(p)}>
          <CheckSquare size={13} /> Registrar resultado
        </button>
        <button className="btn btn-danger btn-sm" onClick={handleCancelar}>
          <X size={13} /> Cancelar
        </button>
      </>
    );
    return null;
  };

  return (
    <div className="container page">
      <div className="section-header">
        <h2 className="section-title bebas">Partidas</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowNova(true)}>
          <Plus size={15} /> Nova partida
        </button>
      </div>

      <div className="tab-pills">
        {TABS.map((t) => (
          <button
            key={t}
            className={`tab-pill ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Calendar} message="Nenhuma partida encontrada." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((p) => (
            <PartidaCard key={p.id} partida={p} actions={getActions(p)} />
          ))}
        </div>
      )}

      {showNova && (
        <NovaPartidaModal onClose={() => setShowNova(false)} onSave={handleCadastrar} />
      )}
      {resultado && (
        <ResultadoModal
          partida={resultado}
          onClose={() => setResultado(null)}
          onSave={handleResultado}
        />
      )}
    </div>
  );
}