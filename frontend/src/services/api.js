// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

// Attacher le token Sanctum automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Rediriger vers login si 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authService = {
  login:  (data)    => api.post('/login', data),
  logout: ()        => api.post('/logout'),
  me:     ()        => api.get('/me'),
};

// ── Emploi du temps public ────────────────────────────────────────────────────
export const publicService = {
  getEmploi: (niveau, parcours) =>
    api.get('/emploi-du-temps/public', { params: { niveau, parcours } }),
};

// ── Admin: Profs ──────────────────────────────────────────────────────────────
export const profService = {
  getAll:  ()            => api.get('/profs'),
  getOne:  (id)          => api.get(`/profs/${id}`),
  create:  (data)        => api.post('/profs', data),
  update:  (id, data)    => api.put(`/profs/${id}`, data),
  delete:  (id)          => api.delete(`/profs/${id}`),
};

// ── Admin: Salles ─────────────────────────────────────────────────────────────
export const salleService = {
  getAll:  ()            => api.get('/salles'),
  create:  (data)        => api.post('/salles', data),
  update:  (id, data)    => api.put(`/salles/${id}`, data),
  delete:  (id)          => api.delete(`/salles/${id}`),
};

// ── Admin: Étudiants ──────────────────────────────────────────────────────────
export const etudiantService = {
  getAll:  (filters)     => api.get('/etudiants', { params: filters }),
  create:  (data)        => api.post('/etudiants', data),
  update:  (id, data)    => api.put(`/etudiants/${id}`, data),
  delete:  (id)          => api.delete(`/etudiants/${id}`),
};

// ── Admin: Emploi du temps (CRUD) ─────────────────────────────────────────────
export const edtService = {
  getAll:          ()         => api.get('/emploi-du-temps'),
  create:          (data)     => api.post('/emploi-du-temps', data),
  update:          (id, data) => api.put(`/emploi-du-temps/${id}`, data),
  delete:          (id)       => api.delete(`/emploi-du-temps/${id}`),
  envoyerEtudiants:(data)     => api.post('/emploi-du-temps/envoyer-etudiants', data),
  envoyerProfs:    ()         => api.post('/emploi-du-temps/envoyer-profs'),
};

// ── Prof: Disponibilités ──────────────────────────────────────────────────────
export const dispoService = {
  getMyDispos: ()       => api.get('/mes-disponibilites'),
  create:      (data)   => api.post('/mes-disponibilites', data),
  delete:      (id)     => api.delete(`/mes-disponibilites/${id}`),
  getByProf:   (profId) => api.get(`/disponibilites/prof/${profId}`),
};
