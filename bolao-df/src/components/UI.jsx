import { X, CheckCircle2, XCircle } from "lucide-react";
import { initials, STATUS_META } from "../utils";

// ── ToastContainer ────────────────────────────────────────────
export function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === "success"
            ? <CheckCircle2 size={16} color="var(--green-text)" />
            : <XCircle     size={16} color="#F87171" />
          }
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
    </div>
  );
}

// ── StatusBadge ───────────────────────────────────────────────
export function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.AGENDADA;
  return <span className={`badge ${meta.cls}`}>{meta.label}</span>;
}

// ── Avatar ────────────────────────────────────────────────────
export function Avatar({ nome, size = "md" }) {
  return (
    <div className={`avatar ${size === "lg" ? "avatar-lg" : ""}`}>
      {initials(nome)}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────
export function Modal({ title, onClose, footer, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title bebas">{title}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── ScoreStepper ──────────────────────────────────────────────
export function ScoreStepper({ homeTeam, awayTeam, home, away, onChange }) {
  const change = (side, delta) => {
    const next = side === "home"
      ? { home: Math.max(0, home + delta), away }
      : { home, away: Math.max(0, away + delta) };
    onChange(next);
  };

  return (
    <div className="score-area">
      <div className="score-team">
        <span className="score-team-name">{homeTeam}</span>
        <div className="score-stepper">
          <button className="score-btn" onClick={() => change("home", -1)}>−</button>
          <span className="score-value">{home}</span>
          <button className="score-btn" onClick={() => change("home", +1)}>+</button>
        </div>
      </div>
      <span className="score-divider">×</span>
      <div className="score-team">
        <span className="score-team-name">{awayTeam}</span>
        <div className="score-stepper">
          <button className="score-btn" onClick={() => change("away", -1)}>−</button>
          <span className="score-value">{away}</span>
          <button className="score-btn" onClick={() => change("away", +1)}>+</button>
        </div>
      </div>
    </div>
  );
}

// ── PtsBadge ──────────────────────────────────────────────────
export function PtsBadge({ pts }) {
  if (pts == null) return null;
  const cls = pts === 3 ? "pts-3" : pts === 1 ? "pts-1" : "pts-0";
  return <span className={`pts-badge ${cls}`}>{pts}pts</span>;
}

// ── EmptyState ────────────────────────────────────────────────
export function EmptyState({ icon: Icon, message }) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={40} />}
      <p>{message}</p>
    </div>
  );
}