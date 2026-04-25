import { useState, useCallback } from "react";

// ── useToast ──────────────────────────────────────────────────
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((msg, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3600);
  }, []);

  return { toasts, toast: push };
}

// ── useAsync ──────────────────────────────────────────────────
export function useAsync(asyncFn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const execute = useCallback(async (...args) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await asyncFn(...args);
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err }));
      throw err;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, execute, setData: (d) => setState((s) => ({ ...s, data: d })) };
}