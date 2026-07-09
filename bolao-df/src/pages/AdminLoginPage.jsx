import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError("");
    const result = await login(password);
    setLoading(false);
    if (result.ok) {
      navigate("/partidas");
    } else {
      setError(result.error);
      setPassword("");
    }
  };

  return (
    <div className="container page" style={{ maxWidth: 380, marginTop: 40 }}>
      <div
        className="card"
        style={{ display: "flex", flexDirection: "column", gap: 20, padding: 28 }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <img
            src="/logo.png"
            alt="DF FLA News"
            style={{
              width: 56, height: 56, borderRadius: "50%", objectFit: "cover",
              border: "2px solid rgba(204,0,0,0.45)",
              boxShadow: "0 0 0 5px rgba(204,0,0,0.08)",
            }}
          />
          <h2 className="section-title bebas" style={{ margin: 0 }}>Área do Administrador</h2>
          <p style={{ color: "var(--text-2)", fontSize: 13, textAlign: "center", margin: 0 }}>
            Acesso restrito. Informe a senha para gerenciar partidas e jogadores.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="field">
            <label className="field-label">Senha</label>
            <div style={{ position: "relative" }}>
              <Lock
                size={15}
                color="var(--text-3)"
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type={show ? "text" : "password"}
                className="input"
                style={{ paddingLeft: 36, paddingRight: 36 }}
                placeholder="••••••••"
                value={password}
                autoFocus
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "var(--text-3)", cursor: "pointer",
                  display: "flex",
                }}
                tabIndex={-1}
                aria-label={show ? "Ocultar senha" : "Mostrar senha"}
              >
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="info-box" style={{ borderColor: "var(--red)", color: "var(--red-light)" }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={!password || loading}>
            {loading ? "Verificando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}