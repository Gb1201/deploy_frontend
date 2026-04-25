export const initials = (nome = "") =>
  nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

export const fmtDate = (d) => {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

export const fmtTime = (t) => (t ? t.slice(0, 5) : "");

export const STATUS_META = {
  AGENDADA:  { cls: "badge-agendada",  label: "Agendada"  },
  ATIVA:     { cls: "badge-ativa",     label: "Ao vivo"   },
  ENCERRADA: { cls: "badge-encerrada", label: "Encerrada" },
  CANCELADA: { cls: "badge-cancelada", label: "Cancelada" },
};