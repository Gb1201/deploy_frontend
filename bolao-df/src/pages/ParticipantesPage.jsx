import { useEffect, useState } from "react";
import { Plus, BarChart2, Pencil, UserX, Users } from "lucide-react";
import { participantesApi, palpitesApi } from "../api";
import { Avatar, Modal, Spinner, PtsBadge, EmptyState } from "../components/UI";

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
          <label className="field-label">Telefone</label>
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
          { label: "Pontos",   val: participante.totalPontos,   color: "var(--red-light)" },
          { label: "Palpites", val: participante.totalJogos,    color: "var(--text)" },
          { label: "Exatos",   val: participante.totalVitorias, color: "var(--green-text)" },
        ].map(({ label, val, color }) => (
          <div
            key={label}
            style={{
              background: "var(--dark-3)",
              borderRadius: "var(--radius-sm)",
              padding: "12px",
              textAlign: "center",
            }}
          >
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
        palpites.map((p) => (
          <div key={p.id} className="palpite-row">
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

// ── Page ──────────────────────────────────────────────────────
export default function ParticipantesPage({ toast }) {
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

  return (
    <div className="container page">
      <div className="section-header">
        <h2 className="section-title bebas">Jogadores</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setFormModal("novo")}>
          <Plus size={15} /> Cadastrar
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : participantes.length === 0 ? (
        <EmptyState icon={Users} message="Nenhum jogador cadastrado." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {participantes.map((p) => (
            <div
              key={p.id}
              className="card card-hover"
              style={{ display: "flex", alignItems: "center", gap: 14 }}
            >
              <Avatar nome={p.nomeCompleto} size="lg" />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{p.nomeCompleto}</div>
                <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>
                  {p.telefone}
                  <span style={{ margin: "0 6px", color: "var(--text-3)" }}>·</span>
                  <span style={{ color: "var(--red-light)", fontWeight: 600 }}>{p.totalPontos}pts</span>
                  <span style={{ margin: "0 6px", color: "var(--text-3)" }}>·</span>
                  {p.totalJogos} palpites
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => setPalpitesModal(p)}
                  title="Ver palpites"
                >
                  <BarChart2 size={15} />
                </button>
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
              </div>
            </div>
          ))}
        </div>
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