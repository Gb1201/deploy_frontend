const BASE_URL = "http://localhost:8080/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Erro inesperado." }));
    return Promise.reject(err);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  get:    (path)        => request(path),
  post:   (path, body)  => request(path, { method: "POST",  body: JSON.stringify(body) }),
  put:    (path, body)  => request(path, { method: "PUT",   body: JSON.stringify(body) }),
  patch:  (path, body)  => request(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: (path)        => request(path, { method: "DELETE" }),
};

// ── Participantes ─────────────────────────────────────────────
export const participantesApi = {
  listar:        ()       => api.get("/participantes"),
  buscar:        (id)     => api.get(`/participantes/${id}`),
  classificacao: ()       => api.get("/participantes/classificacao"),
  cadastrar:     (body)   => api.post("/participantes", body),
  atualizar:     (id, b)  => api.put(`/participantes/${id}`, b),
  desativar:     (id)     => api.delete(`/participantes/${id}`),
};

// ── Partidas ──────────────────────────────────────────────────
export const partidasApi = {
  listar:       ()       => api.get("/partidas"),
  disponiveis:  ()       => api.get("/partidas/disponiveis"),
  buscar:       (id)     => api.get(`/partidas/${id}`),
  cadastrar:    (body)   => api.post("/partidas", body),
  ativar:       (id)     => api.patch(`/partidas/${id}/ativar`),
  cancelar:     ()       => api.patch("/partidas/cancelar-ativo"),
  resultado:    (id, b)  => api.patch(`/partidas/${id}/resultado`, b),
};

// ── Palpites ──────────────────────────────────────────────────
export const palpitesApi = {
  registrar:        (body) => api.post("/palpites", body),
  porPartida:       (id)   => api.get(`/palpites/partida/${id}`),
  porParticipante:  (id)   => api.get(`/palpites/participante/${id}`),
};