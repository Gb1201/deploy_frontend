// ── Admin Auth (FRONTEND-ONLY) ──────────────────────────────────
//
// IMPORTANTE: esta é uma proteção de INTERFACE, não de dados.
// O backend não valida nenhum token vindo daqui — qualquer chamada
// direta à API (fora deste site) ignora completamente este arquivo.
// Isso apenas esconde os controles de admin de usuários comuns.

const SESSION_KEY   = "bolao_admin_session";
const ATTEMPTS_KEY   = "bolao_admin_attempts";
const SESSION_TTL_MS = 1000 * 60 * 60 * 4; // sessão expira em 4h
const MAX_ATTEMPTS   = 5;
const LOCKOUT_MS     = 1000 * 60; // 1 minuto de bloqueio a cada estouro

// Hash SHA-256 da senha de admin (nunca colocar a senha em texto puro aqui).
// Configurada via variável de ambiente VITE_ADMIN_PASSWORD_HASH.
const STORED_HASH = import.meta.env.VITE_ADMIN_PASSWORD_HASH || "";

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getAttempts() {
  try {
    return JSON.parse(sessionStorage.getItem(ATTEMPTS_KEY)) || { count: 0, lockedUntil: 0 };
  } catch {
    return { count: 0, lockedUntil: 0 };
  }
}

function setAttempts(data) {
  sessionStorage.setItem(ATTEMPTS_KEY, JSON.stringify(data));
}

export function getLockoutRemaining() {
  const { lockedUntil } = getAttempts();
  const remaining = lockedUntil - Date.now();
  return remaining > 0 ? remaining : 0;
}

export async function loginAdmin(password) {
  const remaining = getLockoutRemaining();
  if (remaining > 0) {
    const secs = Math.ceil(remaining / 1000);
    return { ok: false, error: `Muitas tentativas. Aguarde ${secs}s.` };
  }

  if (!STORED_HASH) {
    return { ok: false, error: "Login de admin não configurado (falta VITE_ADMIN_PASSWORD_HASH)." };
  }

  const hash = await sha256Hex(password);
  const attempts = getAttempts();

  if (hash === STORED_HASH) {
    setAttempts({ count: 0, lockedUntil: 0 });
    const session = { authenticated: true, expires: Date.now() + SESSION_TTL_MS };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true };
  }

  const count = attempts.count + 1;
  const lockedUntil = count >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0;
  setAttempts({ count: lockedUntil ? 0 : count, lockedUntil });

  return {
    ok: false,
    error: lockedUntil
      ? `Muitas tentativas erradas. Aguarde 1 minuto.`
      : "Senha incorreta.",
  };
}

export function logoutAdmin() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function isAdminAuthenticated() {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    if (!session?.authenticated) return false;
    if (Date.now() > session.expires) {
      sessionStorage.removeItem(SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}