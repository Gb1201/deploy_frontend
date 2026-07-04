import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

// Protege rotas inteiras que só fazem sentido para o admin.
// Lembrete: isso só esconde a TELA. As chamadas de API por trás
// dela continuam sem checagem no backend.
export default function RequireAdmin({ children }) {
  const { isAdmin } = useAuth();
  const location = useLocation();

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace state={{ from: location }} />;
  }

  return children;
}