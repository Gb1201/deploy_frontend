import { createContext, useContext, useState, useCallback } from "react";
import { loginAdmin, logoutAdmin, isAdminAuthenticated } from "./adminAuth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(isAdminAuthenticated);

  const login = useCallback(async (password) => {
    const result = await loginAdmin(password);
    if (result.ok) setIsAdmin(true);
    return result;
  }, []);

  const logout = useCallback(() => {
    logoutAdmin();
    setIsAdmin(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}