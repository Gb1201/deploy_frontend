import { useEffect, useState } from "react";
import {
  Plus, Play, X, CheckSquare, Calendar, LogOut, ShieldCheck,
  Trophy, Clock, Radio, Flag, Home as HomeIcon, Plane,
} from "lucide-react";
import { partidasApi } from "../api";
import PartidaCard from "../components/PartidaCard";
import { Modal, ScoreStepper, Spinner, EmptyState } from "../components/UI";
import { useAuth } from "../auth/AuthContext";

// ── Estilos locais (apenas layout/animação, nenhuma cor nova) ──
function PartidasPageStyles() {
  return (
    <style>{`
      .pp-header {
        position: relative;
        padding-bottom: 4px;
        align-items: flex-start;
      }
      .pp-header-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--gold) 16%, transparent);
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--gold) 30%, transparent);
        margin-right: 12px;
        flex-shrink: 0;
      }
      .pp-title-row {
        display: flex;
        align-items: center;
      }
      .pp-subtitle {
        opacity: 0.6;
        font-size: 13px;
        margin-top: 2px;
        margin-left: 52px;
      }

      /* ── Stats strip ── */
      .pp-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin: 18px 0 20px;
      }
      .pp-stat {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        border-radius: 14px;
        background: rgba(255,255,255,0.04);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        cursor: pointer;
        animation: pp-fade-up 0.35s ease both;
      }
      .pp-stat:hover {
        transform: translateY(-2px);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.12), 0 8px 18px -10px rgba(0,0,0,0.5);
      }
      .pp-stat.active-agendada { box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--gold) 55%, transparent); }
      .pp-stat.active-ativa   { box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--green-text) 55%, transparent); }
      .pp-stat-icon {
        width: 32px;
        height: 32px;
        border-radius: 9px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: rgba(255,255,255,0.06);
      }
      .pp-stat-icon.gold  { color: var(--gold); background: color-mix(in srgb, var(--gold) 18%, transparent); }
      .pp-stat-icon.green { color: var(--green-text); background: color-mix(in srgb, var(--green-text) 18%, transparent); }
      .pp-stat-num {
        font-size: 18px;
        font-weight: 700;
        line-height: 1.1;
      }
      .pp-stat-label {
        font-size: 11px;
        opacity: 0.6;
        line-height: 1.2;
      }

      /* ── Tabs ── */
      .pp-tabs-wrap {
        position: sticky;
        top: 0;
        z-index: 5;
        margin: 0 -2px 14px;
        padding: 6px 2px;
        backdrop-filter: blur(6px);
      }
      .pp-tabs {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding-bottom: 2px;
        scrollbar-width: none;
      }
      .pp-tabs::-webkit-scrollbar { display: none; }
      .pp-tab-pill {
        white-space: nowrap;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        display: inline-flex;
        align-items: center;
      }
      .pp-tab-pill:active { transform: scale(0.96); }
      .pp-tab-count {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        margin-left: 6px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 600;
        background: rgba(255,255,255,0.14);
      }
      .pp-tab-pill.active .pp-tab-count { background: rgba(0,0,0,0.18); }

      /* ── List / cards ── */
      .pp-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .pp-card-wrap {
        position: relative;
        animation: pp-fade-up 0.35s ease both;
        transition: transform 0.18s ease, box-shadow 0.18s ease;
        border-radius: 14px;
        overflow: hidden;
      }
      .pp-card-wrap:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 26px -14px rgba(0,0,0,0.5);
      }
      .pp-card-accent {
        position: absolute;
        left: 0; top: 0; bottom: 0;
        width: 3px;
        border-radius: 3px;
        opacity: 0.9;
      }
      .pp-card-accent.agendada { background: color-mix(in srgb, var(--gold) 70%, transparent); }
      .pp-card-accent.ativa    { background: var(--green-text); }
      .pp-card-accent.ativa::after {
        content: "";
        position: absolute;
        inset: 0;
        background: inherit;
        animation: pp-pulse 1.8s ease-in-out infinite;
      }
      .pp-card-accent.encerrada { background: rgba(255,255,255,0.18); }
      .pp-live-tag {
        position: absolute;
        top: 10px;
        right: 10px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.04em;
        padding: 3px 8px;
        border-radius: 999px;
        color: var(--green-text);
        background: color-mix(in srgb, var(--green-text) 16%, transparent);
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--green-text) 35%, transparent);
        z-index: 2;
      }
      .pp-live-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--green-text);
        animation: pp-pulse-dot 1.4s ease-in-out infinite;
      }

      @keyframes pp-fade-up {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes pp-pulse {
        0%, 100% { opacity: 0.9; }
        50% { opacity: 0.35; }
      }
      @keyframes pp-pulse-dot {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.5); opacity: 0.5; }
      }

      .pp-actions-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      /* ── Skeleton loading ── */
      .pp-skeleton {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .pp-skel-card {
        height: 84px;
        border-radius: 14px;
        background: linear-gradient(90deg,
          rgba(255,255,255,0.03) 25%,
          rgba(255,255,255,0.07) 37%,
          rgba(255,255,255,0.03) 63%);
        background-size: 400% 100%;
        animation: pp-shimmer 1.4s ease infinite;
      }
      @keyframes pp-shimmer {
        0% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      /* ── Modal extras ── */
      .pp-field-label {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .pp-info-box {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        line-height: 1.5;
        border-radius: 12px;
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--gold) 25%, transparent);
      }
      .pp-info-box svg { color: var(--gold); }
      .pp-modal-type-toggle {
        display: flex;
        gap: 8px;
      }
      .pp-modal-type-opt {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        background: rgba(255,255,255,0.04);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);
        transition: box-shadow 0.15s ease, transform 0.15s ease;
        user-select: none;
      }
      .pp-modal-type-opt:hover { transform: translateY(-1px); }
      .pp-modal-type-opt.selected {
        box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--gold) 60%, transparent);
        color: var(--gold);
      }

      .pp-empty { animation: pp-fade-up 0.4s ease both; }

      /* ── FAB mobile ── */
      .pp-fab {
        position: fixed;
        right: 18px;
        bottom: 22px;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        display: none;
        align-items: center;
        justify-content: center;
        background: var(--gold);
        color: #111;
        box-shadow: 0 10px 24px -6px rgba(0,0,0,0.55);
        z-index: 20;
        transition: transform 0.15s ease;
      }
      .pp-fab:active { transform: scale(0.92); }
      @media (max-width: 640px) {
        .pp-fab { display: inline-flex; }
        .pp-header-new-btn { display: none; }
        .pp-stats { grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .pp-stat-label { display: none; }
        .pp-stat { justify-content: center; }
      }
    `}</style>
  );
}

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
          <label className="field-label pp-field-label">Flamengo joga</label>
          <div className="pp-modal-type-toggle">
            <div
              className={`pp-modal-type-opt ${form.tipo === "Casa" ? "selected" : ""}`}
              onClick={() => set("tipo", "Casa")}
            >
              <HomeIcon size={15} /> Em casa
            </div>
            <div
              className={`pp-modal-type-opt ${form.tipo === "Fora" ? "selected" : ""}`}
              onClick={() => set("tipo", "Fora")}
            >
              <Plane size={15} /> Fora
            </div>
          </div>
        </div>

        <div className="field">
          <label className="field-label pp-field-label">Adversário</label>
          <input
            className="input"
            placeholder="Ex: Vasco"
            value={form.adversario}
            onChange={(e) => set("adversario", e.target.value)}
          />
        </div>

        <div className="grid-2">
          <div className="field">
            <label className="field-label pp-field-label">
              <Calendar size={13} /> Data
            </label>
            <input type="date" className="input" value={form.data} onChange={(e) => set("data", e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label pp-field-label">
              <Clock size={13} /> Horário
            </label>
            <input type="time" className="input" value={form.horario} onChange={(e) => set("horario", e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label className="field-label pp-field-label">
            <Flag size={13} /> Estádio
          </label>
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
      <div className="info-box pp-info-box" style={{ marginTop: 12, padding: 12 }}>
        <Trophy size={16} style={{ marginTop: 2, flexShrink: 0 }} />
        <span>
          Ao confirmar, os palpites serão calculados automaticamente:{" "}
          <strong style={{ color: "var(--gold)" }}>3pts</strong> placar exato ·{" "}
          <strong style={{ color: "var(--green-text)" }}>1pt</strong> gols do Flamengo
        </span>
      </div>
    </Modal>
  );
}

// ── Skeleton (estado de carregamento) ───────────────────────────
function PartidasSkeleton() {
  return (
    <div className="pp-skeleton">
      {[0, 1, 2].map((i) => (
        <div key={i} className="pp-skel-card" style={{ animationDelay: `${i * 80}ms` }} />
      ))}
    </div>
  );
}

// ── Partidas Page ─────────────────────────────────────────────
const TABS = ["Todas", "Agendada", "Ativa", "Encerrada"];

export default function PartidasPage({ toast }) {
  const { isAdmin, logout } = useAuth();
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

  const countFor = (t) =>
    t === "Todas" ? partidas.length : partidas.filter((p) => p.status === t.toUpperCase()).length;

  const nAgendadas = countFor("Agendada");
  const nAtivas    = countFor("Ativa");
  const nEncerradas = countFor("Encerrada");

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

  // Build action buttons per partida (somente admin)
  const getActions = (p) => {
    if (!isAdmin) return null;
    if (p.status === "AGENDADA") return (
      <div className="pp-actions-row">
        <button className="btn btn-success btn-sm" onClick={() => handleAtivar(p.id)}>
          <Play size={13} /> Ativar bolão
        </button>
      </div>
    );
    if (p.status === "ATIVA") return (
      <div className="pp-actions-row">
        <button className="btn btn-ghost btn-sm" onClick={() => setResultado(p)}>
          <CheckSquare size={13} /> Registrar resultado
        </button>
        <button className="btn btn-danger btn-sm" onClick={handleCancelar}>
          <X size={13} /> Cancelar
        </button>
      </div>
    );
    return null;
  };

  const accentFor = (status) => {
    if (status === "AGENDADA") return "agendada";
    if (status === "ATIVA") return "ativa";
    return "encerrada";
  };

  return (
    <div className="container page">
      <PartidasPageStyles />

      <div className="section-header pp-header">
        <div>
          <div className="pp-title-row">
            <span className="pp-header-icon">
              <Calendar size={19} />
            </span>
            <h2 className="section-title bebas">Partidas</h2>
          </div>
          <div className="pp-subtitle">
            {partidas.length} {partidas.length === 1 ? "partida cadastrada" : "partidas cadastradas"}
          </div>
        </div>

        {isAdmin ? (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary btn-sm pp-header-new-btn" onClick={() => setShowNova(true)}>
              <Plus size={15} /> Nova partida
            </button>
            <button className="btn btn-ghost btn-sm" onClick={logout} title="Sair do modo admin">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <span
            className="pp-tab-count"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, opacity: 0.6, height: "auto", padding: "5px 10px" }}
          >
            <ShieldCheck size={13} /> modo visitante
          </span>
        )}
      </div>

      {!loading && partidas.length > 0 && (
        <div className="pp-stats">
          <div
            className={`pp-stat ${tab === "Agendada" ? "active-agendada" : ""}`}
            onClick={() => setTab("Agendada")}
          >
            <span className="pp-stat-icon gold"><Clock size={15} /></span>
            <div>
              <div className="pp-stat-num">{nAgendadas}</div>
              <div className="pp-stat-label">Agendadas</div>
            </div>
          </div>
          <div
            className={`pp-stat ${tab === "Ativa" ? "active-ativa" : ""}`}
            onClick={() => setTab("Ativa")}
            style={{ animationDelay: "60ms" }}
          >
            <span className="pp-stat-icon green"><Radio size={15} /></span>
            <div>
              <div className="pp-stat-num">{nAtivas}</div>
              <div className="pp-stat-label">Ativas agora</div>
            </div>
          </div>
          <div
            className="pp-stat"
            onClick={() => setTab("Encerrada")}
            style={{ animationDelay: "120ms" }}
          >
            <span className="pp-stat-icon"><Flag size={15} /></span>
            <div>
              <div className="pp-stat-num">{nEncerradas}</div>
              <div className="pp-stat-label">Encerradas</div>
            </div>
          </div>
        </div>
      )}

      <div className="pp-tabs-wrap">
        <div className="tab-pills pp-tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`tab-pill pp-tab-pill ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
              <span className="pp-tab-count">{countFor(t)}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <PartidasSkeleton />
      ) : filtered.length === 0 ? (
        <div className="pp-empty">
          <EmptyState icon={Calendar} message="Nenhuma partida encontrada." />
        </div>
      ) : (
        <div className="pp-list">
          {filtered.map((p, i) => (
            <div
              key={p.id}
              className="pp-card-wrap"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className={`pp-card-accent ${accentFor(p.status)}`} />
              {p.status === "ATIVA" && (
                <span className="pp-live-tag">
                  <span className="pp-live-dot" /> AO VIVO
                </span>
              )}
              <PartidaCard partida={p} actions={getActions(p)} />
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <button className="pp-fab" onClick={() => setShowNova(true)} aria-label="Nova partida">
          <Plus size={24} />
        </button>
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