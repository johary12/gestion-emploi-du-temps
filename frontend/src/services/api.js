import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  withCredentials: false,
});

// Attacher le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gérer les erreurs 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth Service
export const authService = {
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
};

// Public Service
export const publicService = {
  getEmploi: (niveau, parcours) =>
    api.get('/emploi-du-temps/public', { params: { niveau, parcours } }),
};

// Admin Services
export const profService = {
  getAll: () => api.get('/profs'),
  getOne: (id) => api.get(`/profs/${id}`),
  create: (data) => api.post('/profs', data),
  update: (id, data) => api.put(`/profs/${id}`, data),
  delete: (id) => api.delete(`/profs/${id}`),
};

export const salleService = {
  getAll: () => api.get('/salles'),
  getOne: (id) => api.get(`/salles/${id}`),
  create: (data) => api.post('/salles', data),
  update: (id, data) => api.put(`/salles/${id}`, data),
  delete: (id) => api.delete(`/salles/${id}`),
};

export const etudiantService = {
  getAll: (filters) => api.get('/etudiants', { params: filters }),
  getOne: (id) => api.get(`/etudiants/${id}`),
  create: (data) => api.post('/etudiants', data),
  update: (id, data) => api.put(`/etudiants/${id}`, data),
  delete: (id) => api.delete(`/etudiants/${id}`),
};

export const edtService = {
  getAll: () => api.get('/emploi-du-temps'),
  getOne: (id) => api.get(`/emploi-du-temps/${id}`),
  create: (data) => api.post('/emploi-du-temps', data),
  update: (id, data) => api.put(`/emploi-du-temps/${id}`, data),
  delete: (id) => api.delete(`/emploi-du-temps/${id}`),
  envoyerEtudiants: (data) => api.post('/emploi-du-temps/envoyer-etudiants', data),
  envoyerProfs: (data) => api.post('/emploi-du-temps/envoyer-profs', data),
};

export const disponibiliteService = {
  getAll: () => api.get('/disponibilites'),
  getByProf: (profId) => api.get(`/disponibilites/prof/${profId}`),
  create: (data) => api.post('/disponibilites', data),
  delete: (id) => api.delete(`/disponibilites/${id}`),
};

export const emailService = {
  sendEmploiDuTemps: async (data) => {
    const response = await api.post('/emploi-du-temps/envoyer-etudiants', data);
    return response.data;
  },
  sendEmploiDuTempsToProfs: async (data) => {
    const response = await api.post('/emploi-du-temps/envoyer-profs', data);
    return response.data;
  },
};

// Prof Services
export const dispoService = {
  getMyDispos: () => api.get('/mes-disponibilites'),
  create: (data) => api.post('/mes-disponibilites', data),
  delete: (id) => api.delete(`/mes-disponibilites/${id}`),
  getByProf: (profId) => api.get(`/disponibilites/prof/${profId}`),
};