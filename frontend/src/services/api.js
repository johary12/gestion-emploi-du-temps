// src/services/api.js
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

// ─── Auth Service ──────────────────────────────────────────────────────────────
export const authService = {
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
  changePassword: (data) => api.post('/change-password', data),
};

// ─── Public Service ────────────────────────────────────────────────────────────
export const publicService = {
  getEmploi: (niveau, parcours, date_debut_semaine) =>
    api.get('/emploi-du-temps/public', { 
      params: { 
        niveau, 
        parcours,
        date_debut_semaine 
      } 
    }),
};

// ─── Admin Services ────────────────────────────────────────────────────────────

// Professeurs
export const profService = {
  getAll: () => api.get('/profs'),
  getOne: (id) => api.get(`/profs/${id}`),
  create: (data) => api.post('/profs', data),
  update: (id, data) => api.put(`/profs/${id}`, data),
  delete: (id) => api.delete(`/profs/${id}`),
};

// Salles
export const salleService = {
  getAll: () => api.get('/salles'),
  getOne: (id) => api.get(`/salles/${id}`),
  create: (data) => api.post('/salles', data),
  update: (id, data) => api.put(`/salles/${id}`, data),
  delete: (id) => api.delete(`/salles/${id}`),
};

// Étudiants
export const etudiantService = {
  getAll: (filters) => api.get('/etudiants', { params: filters }),
  getOne: (id) => api.get(`/etudiants/${id}`),
  create: (data) => api.post('/etudiants', data),
  update: (id, data) => api.put(`/etudiants/${id}`, data),
  delete: (id) => api.delete(`/etudiants/${id}`),
};

// ─── Emploi du temps ───────────────────────────────────────────────────────────
export const edtService = {
  // Admin endpoints
  getAll: () => api.get('/emploi-du-temps'),
  getOne: (id) => api.get(`/emploi-du-temps/${id}`),
  create: (data) => api.post('/emploi-du-temps', data),
  update: (id, data) => api.put(`/emploi-du-temps/${id}`, data),
  delete: (id) => api.delete(`/emploi-du-temps/${id}`),
  getByWeek: (date) => api.get(`/emploi-du-temps/semaine/${date}`),
  getByProfAndWeek: (profId, weekStart) => 
    api.get(`/emploi-du-temps/prof/${profId}/semaine/${weekStart}`),
  filter: (params) => api.get('/emploi-du-temps/filter', { params }),
  
  // Professor endpoints
  getMySchedule: () => api.get('/prof/mon-emploi-du-temps'),
  getMyScheduleByWeek: (date) => 
    api.get(`/prof/mon-emploi-du-temps/semaine/${date}`),
};

// ─── Disponibilités ────────────────────────────────────────────────────────────
export const disponibiliteService = {
  // Admin endpoints
  getAll: () => api.get('/disponibilites'),
  getByProf: (profId) => api.get(`/disponibilites/prof/${profId}`),
  create: (data) => api.post('/disponibilites', data),
  update: (id, data) => api.put(`/disponibilites/${id}`, data),
  delete: (id) => api.delete(`/disponibilites/${id}`),
  
  // Professor endpoints
  getMyDispos: () => api.get('/mes-disponibilites'),
};

// ─── Email Service ─────────────────────────────────────────────────────────────
export const emailService = {
  /**
   * Envoyer l'emploi du temps aux étudiants
   */
  sendEmploiDuTemps: async (data) => {
    try {
      const payload = {
        niveau: data.niveau || 'L1',
        parcours: data.parcours || 'GL',
      };
      
      if (data.weekStart) {
        payload.week_start = data.weekStart;
      }
      
      if (data.recipients && data.recipients.length > 0) {
        payload.recipients = data.recipients;
      }
      
      if (data.subject) {
        payload.subject = data.subject;
      }
      
      // ✅ Convertir htmlContent en html_content
      if (data.htmlContent) {
        payload.html_content = data.htmlContent;
      }

      console.log('📧 Envoi d\'emails - Payload final:', payload);

      const response = await api.post('/emploi-du-temps/envoyer-etudiants', payload);
      
      return { 
        success: true, 
        message: response.data.message || 'Emails envoyés avec succès',
        data: response.data
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des emails:', error);
      
      if (error.response) {
        console.error('📝 Réponse du serveur:', error.response.data);
        console.error('🔢 Status:', error.response.status);
      }
      
      throw error;
    }
  },
  
  sendEmploiDuTempsToProfs: async (data) => {
    try {
      const payload = {
        week_start: data.weekStart || null,
      };
      
      if (data.professeur_ids && data.professeur_ids.length > 0) {
        payload.professeur_ids = data.professeur_ids;
      }
      
      if (data.subject) {
        payload.subject = data.subject;
      }
      
      const response = await api.post('/emploi-du-temps/envoyer-profs', payload);
      
      return { 
        success: true, 
        message: response.data.message || 'Emails envoyés avec succès' 
      };
    } catch (error) {
      console.error('❌ Erreur envoi email profs:', error);
      
      throw error;
    }
  },
};
// ─── Matières ─────────────────────────────────────────────────────────────────
export const matiereService = {
  getAll: (params) => api.get('/matieres', { params }),
  getList: () => api.get('/matieres/list'),
  getOne: (id) => api.get(`/matieres/${id}`),
  create: (data) => api.post('/matieres', data),
  update: (id, data) => api.put(`/matieres/${id}`, data),
  delete: (id) => api.delete(`/matieres/${id}`),
};
// ─── Prof Services (alias pour clarté) ──────────────────────────────────────
export const dispoService = {
  getMyDispos: () => api.get('/mes-disponibilites'),
  create: (data) => api.post('/mes-disponibilites', data),
  update: (id, data) => api.put(`/mes-disponibilites/${id}`, data),
  delete: (id) => api.delete(`/mes-disponibilites/${id}`),
  getByProf: (profId) => api.get(`/disponibilites/prof/${profId}`),
};