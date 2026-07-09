import { useEffect, useState } from "react";
import { Plus, BarChart2, Pencil, UserX, Users, Crown, Medal, Phone, Target } from "lucide-react";
import { participantesApi, palpitesApi } from "../api";
import { Avatar, Modal, Spinner, PtsBadge, EmptyState } from "../components/UI";
import { useAuth } from "../auth/AuthContext";

// ── Estilos locais (apenas layout/animação, paleta original) ──
function ParticipantesPageStyles() {
  return (
    <style>{`
      .pj-header { align-items: flex-start; }
      .pj-header-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--red-light) 16%, transparent);
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--red-light) 30%, transparent);
        margin-right: 12px;
        flex-shrink: 0;
      }
      .pj-title-row { display: flex; align-items: center; }
      .pj-subtitle {
        opacity: 0.6;
        font-size: 13px;
        margin-top: 2px;
        margin-left: 52px;
        color: var(--text-2);
      }

      .pj-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .pj-row {
        position: relative;
        animation: pj-fade-up 0.35s ease both;
        transition: transform 0.16s ease, box-shadow 0.16s ease;
      }
      .pj-row:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 24px -14px rgba(0,0,0,0.55);
      }
      @keyframes pj-fade-up {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .pj-rank {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        font-size: 11px;
        font-weight: 700;
        flex-shrink: 0;
        color: var(--text-3);
        background: var(--dark-3);
      }
      .pj-rank.gold   { color: #3a2a06; background: linear-gradient(135deg, #ffe082, #d4a017); }
      .pj-rank.silver { color: #2c2c2c; background: linear-gradient(135deg, #eaeaea, #b7b7b7); }
      .pj-rank.bronze { color: #3a1f0f; background: linear-gradient(135deg, #d8a172, #a9622f); }

      .pj-avatar-wrap { position: relative; flex-shrink: 0; }
      .pj-avatar-wrap.gold {
        box-shadow: 0 0 0 2px color-mix(in srgb, #d4a017 70%, transparent);
        border-radius: 50%;
      }

      .pj-meta {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 5px;
        font-size: 12px;
        color: var(--text-2);
        margin-top: 3px;
      }
      .pj-dot { color: var(--text-3); }
      .pj-pts { color: var(--red-light); font-weight: 700; }

      .pj-actions {
        display: flex;
        gap: 6px;
        flex-shrink: 0;
        opacity: 0.85;
        transition: opacity 0.15s ease;
      }
      .pj-row:hover .pj-actions { opacity: 1; }

      /* ── Skeleton ── */
      .pj-skeleton { display: flex; flex-direction: column; gap: 10px; }
      .pj-skel-row {
        height: 68px;
        border-radius: var(--radius-sm, 12px);
        background: linear-gradient(90deg,
          rgba(255,255,255,0.03) 25%,
          rgba(255,255,255,0.07) 37%,
          rgba(255,255,255,0.03) 63%);
        background-size: 400% 100%;
        animation: pj-shimmer 1.4s ease infinite;
      }
      @keyframes pj-shimmer {
        0% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      /* ── Palpites modal ── */
      .pj-stat-card {
        background: var(--dark-3);
        border-radius: var(--radius-sm, 12px);
        padding: 14px 12px;
        text-align: center;
        transition: transform 0.15s ease;
        animation: pj-fade-up 0.3s ease both;
      }
      .pj-stat-card:hover { transform: translateY(-2px); }
      .pj-stat-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border-radius: 7px;
        margin-bottom: 4px;
      }
      .pj-palpite-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 4px;
        border-radius: 8px;
        transition: background 0.15s ease;
        animation: pj-fade-up 0.3s ease both;
      }
      .pj-palpite-row:hover { background: rgba(255,255,255,0.03); }
      .pj-palpite-row + .pj-palpite-row { border-top: 1px solid rgba(255,255,255,0.05); }

      .pj-empty { animation: pj-fade-up 0.4s ease both; }

      .pj-fab {
        position: fixed;
        right: 18px;
        bottom: 22px;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        display: none;
        align-items: center;
        justify-content: center;
        background: var(--red-light);
        color: #fff;
        box-shadow: 0 10px 24px -6px rgba(0,0,0,0.55);
        z-index: 20;
        transition: transform 0.15s ease;
      }
      .pj-fab:active { transform: scale(0.92); }
      @media (max-width: 640px) {
        .pj-fab { display: inline-flex; }
        .pj-header-new-btn { display: none; }
      }
    `}</style>
  );
}

// ── Modal Formulário ─────────────────────────────────────────
function ParticipanteModal({ editando, onClose, onSave }) {
  const [form, setForm] = useState({
    nome:      editando?.nome      ?? "",
    sobrenome: editando?.sobrenome ?? "",
    telefone:  editando?.telefone  ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const maskTelefone = (v) => {
    const digits = v.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2)  return `(${digits}`;
    if (digits.length <= 6)  return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  };

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(form); }
    finally { setSaving(false); }
  };

  const valid = form.nome.trim() && form.telefone.trim();

  return (
    <Modal
      title={editando ? "Editar Jogador" : "Novo Jogador"}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!valid || saving}>
            {saving ? "Salvando…" : editando ? "Salvar" : "Cadastrar"}
          </button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {editando && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 2 }}>
            <Avatar nome={`${form.nome} ${form.sobrenome}`.trim()} size="lg" />
          </div>
        )}
        <div className="grid-2">
          <div className="field">
            <label className="field-label">Nome</label>
            <input className="input" placeholder="Nome" value={form.nome} onChange={(e) => set("nome", e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Sobrenome</label>
            <input className="input" placeholder="Sobrenome" value={form.sobrenome} onChange={(e) => set("sobrenome", e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Phone size={13} /> Telefone
          </label>
          <input
            className="input"
            placeholder="(21) 99999-0000"
            value={form.telefone}
            onChange={(e) => set("telefone", maskTelefone(e.target.value))}
          />
        </div>
      </div>
    </Modal>
  );
}

// ── Modal Palpites ────────────────────────────────────────────
function PalpitesModal({ participante, onClose }) {
  const [palpites, setPalpites] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    palpitesApi.porParticipante(participante.id)
      .then(setPalpites)
      .finally(() => setLoading(false));
  }, [participante.id]);

  return (
    <Modal
      title={`Palpites — ${participante.nomeCompleto.split(" ")[0]}`}
      onClose={onClose}
      footer={<button className="btn btn-ghost" onClick={onClose}>Fechar</button>}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <Avatar nome={participante.nomeCompleto} size="lg" />
      </div>

      {/* Stats rápidas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {[
          { label: "Pontos",   val: participante.totalPontos,   color: "var(--red-light)",   Icon: Crown },
          { label: "Palpites", val: participante.totalJogos,    color: "var(--text)",        Icon: Target },
          { label: "Exatos",   val: participante.totalVitorias, color: "var(--green-text)",  Icon: Medal },
        ].map(({ label, val, color, Icon }, i) => (
          <div key={label} className="pj-stat-card" style={{ animationDelay: `${i * 60}ms` }}>
            <span
              className="pj-stat-icon"
              style={{ color, background: `color-mix(in srgb, ${color} 18%, transparent)` }}
            >
              <Icon size={13} />
            </span>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 26, color }}>{val}</div>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <Spinner />
      ) : palpites.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--text-3)", padding: "20px 0", fontSize: 14 }}>
          Sem palpites ainda.
        </div>
      ) : (
        palpites.map((p, i) => (
          <div key={p.id} className="palpite-row pj-palpite-row" style={{ animationDelay: `${i * 30}ms` }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{p.partidaNome}</div>
              <div style={{ fontSize: 12, color: "var(--text-2)" }}>
                Palpite: {p.palpiteGolsCasa} × {p.palpiteGolsFora}
              </div>
            </div>
            <PtsBadge pts={p.pontos} />
          </div>
        ))
      )}
    </Modal>
  );
}

// ── Skeleton ─────────────────────────────────────────────────
function ParticipantesSkeleton() {
  return (
    <div className="pj-skeleton">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="pj-skel-row" style={{ animationDelay: `${i * 70}ms` }} />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function ParticipantesPage({ toast }) {
  const { isAdmin } = useAuth();
  const [participantes, setParticipantes] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [formModal,     setFormModal]     = useState(null); // null | "novo" | participante
  const [palpitesModal, setPalpitesModal] = useState(null);

  const load = () => {
    setLoading(true);
    participantesApi.listar().then(setParticipantes).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    try {
      if (formModal === "novo") {
        await participantesApi.cadastrar(form);
        toast("Jogador cadastrado!", "success");
      } else {
        await participantesApi.atualizar(formModal.id, form);
        toast("Jogador atualizado!", "success");
      }
      setFormModal(null);
      load();
    } catch (e) {
      toast(e.message || "Erro", "error");
    }
  };

  const handleDesativar = async (p) => {
    if (!window.confirm(`Desativar ${p.nomeCompleto}?`)) return;
    try {
      await participantesApi.desativar(p.id);
      toast("Jogador desativado", "success");
      load();
    } catch (e) {
      toast(e.message || "Erro", "error");
    }
  };

  // Ranking pelos pontos (somente visual — não altera a ordem vinda da API além do necessário)
  const ranked = [...participantes].sort((a, b) => (b.totalPontos ?? 0) - (a.totalPontos ?? 0));
  const rankOf = (p) => ranked.findIndex((r) => r.id === p.id);
  const rankClass = (i) => (i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "");

  return (
    <div className="container page">
      <ParticipantesPageStyles />

      <div className="section-header pj-header">
        <div>
          <div className="pj-title-row">
            <span className="pj-header-icon">
              <Users size={19} />
            </span>
            <h2 className="section-title bebas">Jogadores</h2>
          </div>
          <div className="pj-subtitle">
            {participantes.length} {participantes.length === 1 ? "jogador cadastrado" : "jogadores cadastrados"}
          </div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary btn-sm pj-header-new-btn" onClick={() => setFormModal("novo")}>
            <Plus size={15} /> Cadastrar
          </button>
        )}
      </div>

      {loading ? (
        <ParticipantesSkeleton />
      ) : participantes.length === 0 ? (
        <div className="pj-empty">
          <EmptyState icon={Users} message="Nenhum jogador cadastrado." />
        </div>
      ) : (
        <div className="pj-list">
          {participantes.map((p) => {
            const i = rankOf(p);
            const rc = rankClass(i);
            return (
              <div
                key={p.id}
                className="card card-hover pj-row"
                style={{ display: "flex", alignItems: "center", gap: 12, animationDelay: `${Math.min(i, 8) * 35}ms` }}
              >
                <span className={`pj-rank ${rc}`}>
                  {rc === "gold" ? <Crown size={12} /> : i + 1}
                </span>

                <div className={`pj-avatar-wrap ${rc === "gold" ? "gold" : ""}`}>
                  <Avatar nome={p.nomeCompleto} size="lg" />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{p.nomeCompleto}</div>
                  <div className="pj-meta">
                    <span>{p.telefone}</span>
                    <span className="pj-dot">·</span>
                    <span className="pj-pts">{p.totalPontos}pts</span>
                    <span className="pj-dot">·</span>
                    <span>{p.totalJogos} palpites</span>
                  </div>
                </div>

                <div className="pj-actions">
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => setPalpitesModal(p)}
                    title="Ver palpites"
                  >
                    <BarChart2 size={15} />
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => setFormModal(p)}
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="btn btn-danger btn-icon btn-sm"
                        onClick={() => handleDesativar(p)}
                        title="Desativar"
                      >
                        <UserX size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isAdmin && (
        <button className="pj-fab" onClick={() => setFormModal("novo")} aria-label="Cadastrar jogador">
          <Plus size={24} />
        </button>
      )}

      {formModal && (
        <ParticipanteModal
          editando={formModal === "novo" ? null : formModal}
          onClose={() => setFormModal(null)}
          onSave={handleSave}
        />
      )}

      {palpitesModal && (
        <PalpitesModal
          participante={palpitesModal}
          onClose={() => setPalpitesModal(null)}
        />
      )}
    </div>
  );
}