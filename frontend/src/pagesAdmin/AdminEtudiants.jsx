// src/pagesAdmin/AdminEmploiDuTemps.jsx - Version avec design amélioré comme AdminEtudiants

import { useState, useEffect, useRef } from 'react';
import { edtService, profService, salleService, etudiantService, emailService, matiereService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { 
  Plus, Calendar, Clock, User, MapPin, ChevronLeft, ChevronRight, 
  Search, Filter, X, Download, Mail, FileText, CheckCircle, AlertCircle,
  Edit2, Trash2, AlertTriangle, Send, RefreshCw, Users,
  BookOpen, DoorOpen, GraduationCap, Clock as ClockIcon, Save,
  Loader2, Palette, Code, BookMarked, Sparkles, LayoutGrid,
  Layers, Trophy, Award, Star, Zap, BarChart3
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ===================== CONSTANTES =====================
const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const NIVEAUX = ['L1', 'L2', 'L3', 'M1', 'M2'];

const PARCOURS = [
  { id: 'GL', label: 'Génie Logiciel', icon: '💻', color: '#3B82F6' },
  { id: 'ASR', label: 'Admin Système et Réseaux', icon: '🌐', color: '#10B981' },
  { id: 'IG', label: 'Informatique Générale', icon: '🖥️', color: '#8B5CF6' },
  { id: 'IASDM', label: 'IA et Science des Données', icon: '🤖', color: '#F59E0B' },
  { id: 'SECURITE', label: 'Cybersécurité', icon: '🛡️', color: '#EF4444' }
];

const PARCOURS_PAR_NIVEAU = {
  'L1': ['GL', 'ASR', 'IG'],
  'L2': ['GL', 'ASR', 'IG'],
  'L3': ['GL', 'ASR', 'IG'],
  'M1': ['GL', 'ASR', 'IG', 'IASDM', 'SECURITE'],
  'M2': ['GL', 'ASR', 'IG', 'IASDM', 'SECURITE']
};

const COLORS = [
  '#2563EB', '#7C3AED', '#DC2626', '#059669', '#D97706',
  '#9333EA', '#0891B2', '#4F46E5', '#0D9488', '#F59E0B',
  '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
];

// ===================== UTILITAIRES =====================
const toLocalDateString = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getWeekStartDate = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0) ? 6 : (day - 1);
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getParcoursLabel = (id) => {
  const p = PARCOURS.find(p => p.id === id);
  return p ? p.label : id;
};

const getParcoursIcon = (id) => {
  const p = PARCOURS.find(p => p.id === id);
  return p ? p.icon : '📚';
};

const getCourseDate = (weekStart, dayName) => {
  const dayIndex = JOURS.indexOf(dayName);
  if (dayIndex === -1) return null;
  const date = new Date(weekStart);
  date.setDate(date.getDate() + dayIndex);
  return date;
};

const isDatePassed = (date) => {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj < today;
};

const canModifyCourse = (date) => {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj >= today;
};

const formatDateFr = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

export default function AdminEmploitudtemps() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Définition des couleurs pour le thème
  const themeColors = {
    bgPrimary: isDark ? '#0B1120' : '#F1F5F9',
    bgCard: isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.85)',
    bgInput: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(248, 250, 252, 0.8)',
    textPrimary: isDark ? '#F1F5F9' : '#0F172A',
    textSecondary: isDark ? '#94A3B8' : '#64748B',
    textMuted: isDark ? '#64748B' : '#94A3B8',
    borderColor: isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.6)',
    shadowColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.06)',
    hoverBg: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(241, 245, 249, 0.6)',
  };

  const exportRef = useRef(null);

  // États
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [profs, setProfs] = useState([]);
  const [salles, setSalles] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStartDate(new Date()));
  const [weekDays, setWeekDays] = useState([]);
  const [showWeekSearch, setShowWeekSearch] = useState(false);
  const [searchDate, setSearchDate] = useState('');
  const [filters, setFilters] = useState({
    niveau: '',
    parcours: '',
    prof: '',
    salle: '',
    matiere_id: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    recipients: []
  });
  const [availableEtudiants, setAvailableEtudiants] = useState([]);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [confirmationModal, setConfirmationModal] = useState({ 
    show: false, 
    action: null, 
    id: null, 
    courseData: null, 
    courseName: '' 
  });
  
  // États pour la gestion des matières
  const [showMatiereModal, setShowMatiereModal] = useState(false);
  const [editMatiereId, setEditMatiereId] = useState(null);
  const [matiereSearch, setMatiereSearch] = useState('');
  const [matiereForm, setMatiereForm] = useState({
    nom: '',
    code: '',
    description: '',
    couleur: '#2563EB',
    is_active: true
  });

  const [form, setForm] = useState({
    matiere_id: '',
    matiere: '',
    niveau: 'L1',
    parcours: 'GL',
    jour: 'Lundi',
    heure_debut: '08:00',
    heure_fin: '10:00',
    user_id: '',
    salle_id: '',
    date_debut_semaine: ''
  });

  // Effets
  useEffect(() => {
    if (currentWeekStart) {
      updateWeekDays(currentWeekStart);
    }
  }, [currentWeekStart]);

  useEffect(() => {
    if (courses.length > 0 && currentWeekStart) {
      filterCoursesByWeek();
    }
  }, [courses, currentWeekStart, filters]);

  useEffect(() => {
    loadAllData();
  }, []);

  // Fonctions
  function updateWeekDays(date) {
    if (!date) return;
    const dates = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(date);
      d.setDate(date.getDate() + i);
      dates.push({
        date: d,
        dayName: JOURS[i],
        formattedDate: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        isoDate: toLocalDateString(d),
        fullDate: d,
        isPassed: isDatePassed(d)
      });
    }
    setWeekDays(dates);
  }

  function filterCoursesByWeek() {
    if (!currentWeekStart) return;
    const weekStartStr = toLocalDateString(currentWeekStart);
    let filtered = courses.filter(course => {
      if (!course.date_debut_semaine) return false;
      const courseDate = course.date_debut_semaine.split('T')[0];
      return courseDate === weekStartStr;
    });
    
    if (filters.niveau) {
      filtered = filtered.filter(c => c.niveau === filters.niveau);
    }
    if (filters.parcours) {
      filtered = filtered.filter(c => c.parcours === filters.parcours);
    }
    if (filters.prof) {
      filtered = filtered.filter(c => c.user_id === parseInt(filters.prof));
    }
    if (filters.salle) {
      filtered = filtered.filter(c => c.salle_id === parseInt(filters.salle));
    }
    if (filters.matiere_id) {
      filtered = filtered.filter(c => c.matiere_id === parseInt(filters.matiere_id));
    }
    
    filtered = filtered.map(course => {
      const courseDate = getCourseDate(currentWeekStart, course.jour);
      return {
        ...course,
        courseDate: courseDate,
        isPassed: courseDate ? isDatePassed(courseDate) : false,
        isModifiable: courseDate ? canModifyCourse(courseDate) : false
      };
    });
    
    setFilteredCourses(filtered);
  }

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCourses(),
        loadProfs(),
        loadSalles(),
        loadEtudiants(),
        loadMatieres()
      ]);
    } catch (error) {
      console.error('Erreur chargement:', error);
      showToastNotification('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const res = await edtService.getAll();
      setCourses(res.data || []);
    } catch (error) {
      console.error('Erreur chargement cours:', error);
    }
  };

  const loadProfs = async () => {
    try {
      const res = await profService.getAll();
      setProfs(res.data || []);
    } catch (error) {
      console.error('Erreur chargement professeurs:', error);
    }
  };

  const loadSalles = async () => {
    try {
      const res = await salleService.getAll();
      setSalles(res.data || []);
    } catch (error) {
      console.error('Erreur chargement salles:', error);
    }
  };

  const loadEtudiants = async () => {
    try {
      const response = await etudiantService.getAll();
      setEtudiants(response.data || []);
    } catch (error) {
      console.error('Erreur chargement étudiants:', error);
    }
  };

  const loadMatieres = async () => {
    try {
      const res = await matiereService.getList();
      setMatieres(res.data || []);
    } catch (error) {
      console.error('Erreur chargement matières:', error);
    }
  };

  const showToastNotification = (message, type = 'success') => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const previousWeek = () => {
    if (!currentWeekStart) return;
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const nextWeek = () => {
    if (!currentWeekStart) return;
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getWeekStartDate(new Date()));
  };

  const getWeekRange = () => {
    if (weekDays.length === 0) return '';
    const start = weekDays[0]?.formattedDate || '';
    const end = weekDays[5]?.formattedDate || '';
    return `${start} - ${end}`;
  };

  const getProfName = (id) => {
    const prof = profs.find(p => p.id === id);
    return prof?.name || '—';
  };

  const getSalleName = (id) => {
    const salle = salles.find(s => s.id === id);
    return salle?.nom || '—';
  };

  const getMatiereNom = (id) => {
    const matiere = matieres.find(m => m.id === id);
    return matiere?.nom || '';
  };

  const getMatiereCouleur = (id) => {
    const matiere = matieres.find(m => m.id === id);
    return matiere?.couleur || '#2563EB';
  };

  const resetFilters = () => {
    setFilters({ niveau: '', parcours: '', prof: '', salle: '', matiere_id: '' });
  };

  const openConfirmationModal = (action, id = null, courseData = null, courseName = '') => {
    setConfirmationModal({ show: true, action, id, courseData, courseName });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({ show: false, action: null, id: null, courseData: null, courseName: '' });
  };

  const handleEdit = (course) => {
    if (!course.isModifiable) {
      showToastNotification('Impossible de modifier un cours passé', 'error');
      return;
    }
    
    setEditId(course.id);
    setForm({
      matiere_id: course.matiere_id || '',
      matiere: course.matiere || '',
      niveau: course.niveau,
      parcours: course.parcours,
      jour: course.jour,
      heure_debut: course.heure_debut?.substring(0, 5) || '08:00',
      heure_fin: course.heure_fin?.substring(0, 5) || '10:00',
      user_id: course.user_id,
      salle_id: course.salle_id,
      date_debut_semaine: course.date_debut_semaine || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id, courseName, course) => {
    if (!course.isModifiable) {
      showToastNotification('Impossible de supprimer un cours passé', 'error');
      return;
    }
    openConfirmationModal('delete', id, null, courseName);
  };

  const executeDelete = async () => {
    const { id } = confirmationModal;
    try {
      await edtService.delete(id);
      await loadCourses();
      closeConfirmationModal();
      showToastNotification('Cours supprimé avec succès', 'success');
    } catch (error) {
      console.error('Erreur suppression:', error);
      showToastNotification('Erreur lors de la suppression', 'error');
    }
  };

  const handleSave = async () => {
    try {
      const weekStartStr = toLocalDateString(currentWeekStart);
      
      let matiereName = form.matiere;
      if (form.matiere_id) {
        const selectedMatiere = matieres.find(m => m.id === parseInt(form.matiere_id));
        if (selectedMatiere) {
          matiereName = selectedMatiere.nom;
        }
      }

      const courseData = {
        matiere_id: form.matiere_id || null,
        matiere: matiereName,
        niveau: form.niveau,
        parcours: form.parcours,
        jour: form.jour,
        heure_debut: form.heure_debut,
        heure_fin: form.heure_fin,
        user_id: parseInt(form.user_id),
        salle_id: parseInt(form.salle_id),
        date_debut_semaine: weekStartStr
      };
      
      if (editId) {
        openConfirmationModal('update', editId, courseData, matiereName);
      } else {
        await edtService.create(courseData);
        await loadCourses();
        setShowModal(false);
        resetForm();
        showToastNotification('Cours ajouté avec succès', 'success');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      showToastNotification('Erreur lors de la sauvegarde', 'error');
    }
  };

  const executeUpdate = async () => {
    const { id, courseData } = confirmationModal;
    try {
      await edtService.update(id, courseData);
      await loadCourses();
      closeConfirmationModal();
      setShowModal(false);
      resetForm();
      showToastNotification('Cours modifié avec succès', 'success');
    } catch (error) {
      console.error('Erreur modification:', error);
      showToastNotification('Erreur lors de la modification', 'error');
    }
  };

  const resetForm = () => {
    setEditId(null);
    setForm({
      matiere_id: '',
      matiere: '',
      niveau: 'L1',
      parcours: 'GL',
      jour: 'Lundi',
      heure_debut: '08:00',
      heure_fin: '10:00',
      user_id: '',
      salle_id: '',
      date_debut_semaine: ''
    });
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // ===================== GESTION DES MATIÈRES =====================
  const handleMatiereSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMatiereId) {
        await matiereService.update(editMatiereId, matiereForm);
        showToastNotification('Matière mise à jour avec succès');
      } else {
        await matiereService.create(matiereForm);
        showToastNotification('Matière créée avec succès');
      }
      await loadMatieres();
      setShowMatiereModal(false);
      resetMatiereForm();
    } catch (error) {
      console.error('Erreur sauvegarde matière:', error);
      showToastNotification(error.response?.data?.message || 'Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleDeleteMatiere = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) return;
    try {
      await matiereService.delete(id);
      await loadMatieres();
      showToastNotification('Matière supprimée avec succès');
    } catch (error) {
      console.error('Erreur suppression matière:', error);
      showToastNotification(error.response?.data?.message || 'Erreur lors de la suppression', 'error');
    }
  };

  const resetMatiereForm = () => {
    setEditMatiereId(null);
    setMatiereForm({
      nom: '',
      code: '',
      description: '',
      couleur: '#2563EB',
      is_active: true
    });
  };

  const openMatiereModal = (matiere = null) => {
    if (matiere) {
      setEditMatiereId(matiere.id);
      setMatiereForm({
        nom: matiere.nom,
        code: matiere.code || '',
        description: matiere.description || '',
        couleur: matiere.couleur || '#2563EB',
        is_active: matiere.is_active !== false
      });
    } else {
      resetMatiereForm();
    }
    setShowMatiereModal(true);
  };

  const filteredMatieres = matieres.filter(m => 
    m.nom.toLowerCase().includes(matiereSearch.toLowerCase()) ||
    (m.code && m.code.toLowerCase().includes(matiereSearch.toLowerCase()))
  );

  const handleNiveauChange = (e) => {
    const niveau = e.target.value;
    const parcoursDisponibles = PARCOURS_PAR_NIVEAU[niveau] || [];
    const parcoursActuel = form.parcours;
    
    const nouveauParcours = parcoursDisponibles.includes(parcoursActuel) ? parcoursActuel : parcoursDisponibles[0] || 'GL';
    
    setForm({ 
      ...form, 
      niveau: niveau,
      parcours: nouveauParcours
    });
  };

  // ===================== FONCTION EXPORT PDF =====================
  const handleExportPDF = async () => {
    if (filteredCourses.length === 0) {
      showToastNotification('Aucun cours à exporter', 'error');
      return;
    }

    setExporting(true);
    try {
      const pdfContainer = document.createElement('div');
      pdfContainer.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: 1024px;
        background: #ffffff;
        padding: 40px 48px;
        font-family: 'Inter', 'Poppins', Arial, sans-serif;
        z-index: -1;
      `;
      document.body.appendChild(pdfContainer);

      const weekRange = getWeekRange();
      const weekStartDate = new Date(currentWeekStart);
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 5);

      const htmlContent = `
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', 'Poppins', Arial, sans-serif; color: #0F172A; }
          .pdf-header {
            background: linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #2563EB 100%);
            padding: 32px 40px;
            border-radius: 16px;
            color: white;
            text-align: center;
            margin-bottom: 32px;
          }
          .pdf-header h1 { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
          .pdf-header p { font-size: 16px; opacity: 0.9; }
          .pdf-header .subtitle { font-size: 13px; opacity: 0.7; margin-top: 8px; }
          .pdf-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #F8FAFC;
            padding: 16px 20px;
            border-radius: 12px;
            margin-bottom: 24px;
            border: 1px solid #E2E8F0;
          }
          .pdf-info-item { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #475569; }
          .pdf-info-item strong { color: #0F172A; }
          .pdf-grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 16px;
          }
          .pdf-day-card {
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            overflow: hidden;
            min-height: 300px;
          }
          .pdf-day-header {
            background: #F8FAFC;
            padding: 12px 14px;
            border-bottom: 1px solid #E2E8F0;
            text-align: center;
          }
          .pdf-day-header .day-name { font-weight: 700; font-size: 15px; color: #0F172A; }
          .pdf-day-header .day-date { font-size: 11px; color: #94A3B8; margin-top: 2px; }
          .pdf-day-body {
            padding: 12px;
            min-height: 200px;
          }
          .pdf-course {
            padding: 10px 12px;
            background: #F8FAFC;
            border-radius: 8px;
            margin-bottom: 8px;
            border-left: 3px solid #2563EB;
          }
          .pdf-course:last-child { margin-bottom: 0; }
          .pdf-course-title { font-weight: 600; font-size: 13px; color: #0F172A; }
          .pdf-course-time { font-size: 11px; color: #64748B; margin-top: 2px; }
          .pdf-course-detail { font-size: 11px; color: #64748B; margin-top: 2px; }
          .pdf-course-badge {
            display: inline-block;
            padding: 1px 8px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 600;
            margin-right: 4px;
          }
          .pdf-badge-niveau { background: #DBEAFE; color: #2563EB; }
          .pdf-badge-parcours { background: #F3E8FF; color: #7C3AED; }
          .pdf-empty { text-align: center; color: #94A3B8; font-size: 13px; padding: 30px 0; }
          .pdf-footer {
            margin-top: 32px;
            padding-top: 20px;
            border-top: 1px solid #E2E8F0;
            text-align: center;
            font-size: 12px;
            color: #94A3B8;
          }
          .pdf-footer .logo { color: #2563EB; font-weight: 700; }
          .pdf-filters {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 16px;
          }
          .pdf-filter-tag {
            padding: 4px 12px;
            background: #F1F5F9;
            border-radius: 20px;
            font-size: 11px;
            color: #475569;
          }
        </style>
        <div class="pdf-header">
          <h1>🏛️ ENI Fianarantsoa</h1>
          <p>Emploi du temps de la semaine</p>
          <div class="subtitle">Du ${formatDateFr(weekStartDate)} au ${formatDateFr(weekEndDate)}</div>
        </div>
        
        <div class="pdf-info">
          <div class="pdf-info-item"><strong>📅 Semaine :</strong> ${weekRange}</div>
          <div class="pdf-info-item"><strong>📚 Total cours :</strong> ${filteredCourses.length}</div>
        </div>

        ${(filters.niveau || filters.parcours || filters.prof || filters.salle || filters.matiere_id) ? `
          <div class="pdf-filters">
            ${filters.niveau ? `<span class="pdf-filter-tag">📚 ${filters.niveau}</span>` : ''}
            ${filters.parcours ? `<span class="pdf-filter-tag">🎓 ${getParcoursLabel(filters.parcours)}</span>` : ''}
            ${filters.prof ? `<span class="pdf-filter-tag">👨‍🏫 ${getProfName(parseInt(filters.prof))}</span>` : ''}
            ${filters.salle ? `<span class="pdf-filter-tag">🚪 ${getSalleName(parseInt(filters.salle))}</span>` : ''}
            ${filters.matiere_id ? `<span class="pdf-filter-tag">📖 ${getMatiereNom(parseInt(filters.matiere_id))}</span>` : ''}
          </div>
        ` : ''}

        <div class="pdf-grid">
          ${weekDays.map(day => {
            const dayCourses = filteredCourses.filter(c => c.jour === day.dayName);
            return `
              <div class="pdf-day-card">
                <div class="pdf-day-header">
                  <div class="day-name">${day.dayName}</div>
                  <div class="day-date">${day.formattedDate}</div>
                </div>
                <div class="pdf-day-body">
                  ${dayCourses.length === 0 ? `
                    <div class="pdf-empty">Aucun cours</div>
                  ` : `
                    ${dayCourses.map(course => `
                      <div class="pdf-course" style="border-left-color: ${course.matiere_id ? getMatiereCouleur(course.matiere_id) : '#2563EB'}">
                        <div class="pdf-course-title">${course.matiere}</div>
                        <div class="pdf-course-time">⏰ ${course.heure_debut?.substring(0,5) || ''} - ${course.heure_fin?.substring(0,5) || ''}</div>
                        <div class="pdf-course-detail">👨‍🏫 ${getProfName(course.user_id)}  •  📍 ${getSalleName(course.salle_id)}</div>
                        <div style="margin-top: 4px;">
                          <span class="pdf-course-badge pdf-badge-niveau">${course.niveau}</span>
                          <span class="pdf-course-badge pdf-badge-parcours">${getParcoursIcon(course.parcours)} ${getParcoursLabel(course.parcours)}</span>
                        </div>
                      </div>
                    `).join('')}
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="pdf-footer">
          <p><span class="logo">ENI Fianarantsoa</span> - École Nationale d'Informatique</p>
          <p style="font-size: 10px; margin-top: 4px;">Document généré le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      `;

      pdfContainer.innerHTML = htmlContent;

      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 1024,
        height: pdfContainer.scrollHeight,
        windowHeight: pdfContainer.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, Math.min(imgHeight, pdfHeight - 20));
      heightLeft -= (pdfHeight - 20);

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);
      }

      const fileName = `emploi-du-temps-${toLocalDateString(currentWeekStart)}.pdf`;
      pdf.save(fileName);

      document.body.removeChild(pdfContainer);
      
      showToastNotification('✅ PDF exporté avec succès !', 'success');
    } catch (error) {
      console.error('Erreur export PDF:', error);
      showToastNotification('Erreur lors de la génération du PDF', 'error');
    } finally {
      setExporting(false);
    }
  };

  // ===================== FONCTIONS EMAIL =====================
  const filterEtudiantsByFilters = () => {
    let filtered = [...etudiants];
    if (filters.niveau) filtered = filtered.filter(e => e.niveau === filters.niveau);
    if (filters.parcours) filtered = filtered.filter(e => e.parcours === filters.parcours);
    return filtered;
  };

  const openEmailModal = () => {
    const filteredEtudiants = filterEtudiantsByFilters();
    setAvailableEtudiants(filteredEtudiants);
    setEmailData({
      subject: `Emploi du temps ENI - Semaine du ${getWeekRange()}`,
      message: generateEmailHTML(),
      recipients: filteredEtudiants.map(e => e.id)
    });
    setShowEmailModal(true);
  };

  const selectAllStudents = () => {
    setEmailData({ ...emailData, recipients: availableEtudiants.map(e => e.id) });
  };

  const deselectAllStudents = () => {
    setEmailData({ ...emailData, recipients: [] });
  };

  const handleSendEmails = async () => {
    if (emailData.recipients.length === 0) {
      showToastNotification('Aucun étudiant sélectionné', 'error');
      return;
    }
    
    setSendingEmail(true);
    try {
      const selectedStudents = etudiants.filter(e => emailData.recipients.includes(e.id));
      
      if (selectedStudents.length === 0) {
        showToastNotification('Les étudiants sélectionnés n\'existent pas', 'error');
        setSendingEmail(false);
        return;
      }

      const defaultNiveau = filters.niveau || 'L1';
      const defaultParcours = filters.parcours || 'GL';

      const payload = {
        niveau: defaultNiveau,
        parcours: defaultParcours,
        recipients: emailData.recipients.map(id => parseInt(id)),
        subject: emailData.subject || `Emploi du temps ENI - Semaine du ${getWeekRange()}`,
        htmlContent: emailData.message || generateEmailHTML(),
        weekStart: toLocalDateString(currentWeekStart)
      };

      const response = await emailService.sendEmploiDuTemps(payload);
      
      if (response.success) {
        showToastNotification(response.message || '📧 Emails envoyés avec succès !', 'success');
        setTimeout(() => setShowEmailModal(false), 2000);
      } else {
        showToastNotification(response.message || 'Erreur lors de l\'envoi', 'error');
      }
    } catch (error) {
      console.error('❌ Erreur envoi emails:', error);
      
      if (error.response?.data?.error) {
        showToastNotification(error.response.data.error, 'error');
      } else if (error.response?.data?.message) {
        showToastNotification(error.response.data.message, 'error');
      } else if (error.message) {
        showToastNotification(`Erreur: ${error.message}`, 'error');
      } else {
        showToastNotification('Erreur lors de l\'envoi des emails', 'error');
      }
    } finally {
      setSendingEmail(false);
    }
  };

  const generateEmailHTML = () => {
    const weekRange = getWeekRange();
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Inter', 'Poppins', Arial, sans-serif; color: #0F172A; line-height: 1.6; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #2563EB 100%); padding: 30px; border-radius: 16px; color: white; text-align: center; border-bottom: 4px solid #2563EB; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 8px 0 0; opacity: 0.9; }
          .message { padding: 20px 0; }
          table { width: 100%; border-collapse: collapse; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          thead { background: #2563EB; }
          th { color: white; padding: 12px 16px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          td { padding: 12px 16px; border-bottom: 1px solid #E5E7EB; font-size: 13px; }
          tr:last-child td { border-bottom: none; }
          .jour-cell { font-weight: 600; }
          .course-title { font-weight: 600; color: #2563EB; }
          .course-details { font-size: 12px; color: #64748B; margin-top: 4px; }
          .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 10px; font-weight: 600; margin: 2px; }
          .badge-niveau { background: #DBEAFE; color: #2563EB; }
          .badge-parcours { background: #F3E8FF; color: #7C3AED; }
          .empty-cell { text-align: center; color: #94A3B8; padding: 20px; font-style: italic; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; font-size: 12px; color: #94A3B8; }
          .footer .logo { color: #2563EB; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏛️ ENI Fianarantsoa</h1>
            <p>Emploi du temps - Semaine du ${weekRange}</p>
          </div>
          <div class="message">
            <p>Bonjour,</p>
            <p>Veuillez trouver ci-dessous l'emploi du temps de la semaine du ${weekRange}.</p>
            <br>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 15%;">Jour</th>
                <th style="width: 15%;">Date</th>
                <th style="width: 70%;">Cours</th>
              </tr>
            </thead>
            <tbody>`;

    weekDays.forEach(day => {
      const dayCourses = filteredCourses.filter(c => c.jour === day.dayName);
      html += `<tr>
        <td class="jour-cell">${day.dayName}</td>
        <td style="color: #64748B; font-size: 12px;">${day.formattedDate}</td>
        <td>`;
      
      if (dayCourses.length === 0) {
        html += `<div class="empty-cell">Aucun cours</div>`;
      } else {
        dayCourses.forEach((course, idx) => {
          html += `<div style="${idx > 0 ? 'margin-top: 10px; padding-top: 10px; border-top: 1px dashed #E5E7EB;' : ''}">
            <div class="course-title">${course.matiere}</div>
            <div class="course-details">
              ⏰ ${course.heure_debut?.substring(0,5) || ''} - ${course.heure_fin?.substring(0,5) || ''}
              &nbsp;|&nbsp; 👨‍🏫 ${getProfName(course.user_id)}
              &nbsp;|&nbsp; 📍 ${getSalleName(course.salle_id)}
            </div>
            <div style="margin-top: 4px;">
              <span class="badge badge-niveau">${course.niveau}</span>
              <span class="badge badge-parcours">${getParcoursIcon(course.parcours)} ${getParcoursLabel(course.parcours)}</span>
            </div>
          </div>`;
        });
      }
      
      html += `</td></tr>`;
    });

    html += `
            </tbody>
          </table>
          <div class="footer">
            <p>Cordialement,</p>
            <p><span class="logo">ENI Fianarantsoa</span> - École Nationale d'Informatique</p>
            <p style="font-size: 11px;">Ce message a été généré automatiquement.</p>
          </div>
        </div>
      </body>
      </html>`;

    return html;
  };

  // ===================== STATISTIQUES =====================
  const getNiveauStats = () => {
    const stats = {};
    NIVEAUX.forEach(n => {
      stats[n] = filteredCourses.filter(c => c.niveau === n).length;
    });
    return stats;
  };

  const getParcoursStats = () => {
    const stats = {};
    PARCOURS.forEach(p => {
      stats[p.id] = filteredCourses.filter(c => c.parcours === p.id).length;
    });
    return stats;
  };

  const getJourStats = () => {
    const stats = {};
    JOURS.forEach(j => {
      stats[j] = filteredCourses.filter(c => c.jour === j).length;
    });
    return stats;
  };

  const niveauStats = getNiveauStats();
  const parcoursStats = getParcoursStats();
  const jourStats = getJourStats();
  const totalCourses = filteredCourses.length;

  // ===================== STYLES =====================
  const styles = {
    container: {
      padding: '24px 32px',
      maxWidth: '1440px',
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: themeColors.bgPrimary,
      color: themeColors.textPrimary,
      fontFamily: '"Inter", "Poppins", system-ui, -apple-system, sans-serif',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    },

    notification: {
      position: 'fixed',
      top: '24px',
      right: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 20px',
      borderRadius: '12px',
      color: 'white',
      zIndex: 2000,
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
      animation: 'slideIn 0.3s ease-out',
    },

    headerSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px',
    },

    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },

    headerIcon: {
      width: '52px',
      height: '52px',
      borderRadius: '14px',
      background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
    },

    pageTitle: {
      fontSize: '28px',
      fontWeight: 700,
      margin: 0,
      fontFamily: '"Poppins", "Inter", sans-serif',
    },

    pageSubtitle: {
      fontSize: '14px',
      margin: '4px 0 0',
      color: themeColors.textSecondary,
    },

    headerActions: {
      display: 'flex',
      gap: '12px',
    },

    addButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 24px',
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '40px',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '14px',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
    },

    filterToggle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      border: '1px solid ' + themeColors.borderColor,
      borderRadius: '40px',
      cursor: 'pointer',
      fontWeight: 500,
      fontSize: '14px',
      transition: 'all 0.2s ease',
      background: themeColors.bgCard,
      color: themeColors.textSecondary,
    },

    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '16px',
    },

    statCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px 20px',
      borderRadius: '12px',
      border: '1px solid ' + themeColors.borderColor,
      background: themeColors.bgCard,
      boxShadow: '0 1px 3px ' + themeColors.shadowColor,
      transition: 'all 0.2s ease',
    },

    statIcon: {
      color: '#2563eb',
    },

    statValue: {
      fontSize: '24px',
      fontWeight: 700,
      color: themeColors.textPrimary,
    },

    statLabel: {
      fontSize: '13px',
      fontWeight: 500,
      color: themeColors.textSecondary,
    },

    statsDetailContainer: {
      marginBottom: '24px',
    },

    statsDetail: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
      padding: '12px 16px',
      borderRadius: '12px',
      border: '1px solid ' + themeColors.borderColor,
      background: themeColors.bgCard,
    },

    statsDetailLabel: {
      fontSize: '13px',
      fontWeight: 600,
      marginRight: '8px',
      color: themeColors.textPrimary,
    },

    statsDetailItem: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
    },

    statsDetailBadge: {
      fontSize: '12px',
      fontWeight: 500,
      padding: '2px 8px',
      borderRadius: '4px',
      background: themeColors.bgInput,
      color: themeColors.textSecondary,
    },

    statsDetailCount: {
      fontSize: '14px',
      fontWeight: 600,
      minWidth: '20px',
      textAlign: 'center',
      color: '#2563eb',
    },

    navigationCard: {
      background: themeColors.bgCard,
      backdropFilter: 'blur(12px)',
      borderRadius: '16px',
      padding: '20px 24px',
      marginBottom: '24px',
      border: '1px solid ' + themeColors.borderColor,
      boxShadow: '0 1px 3px ' + themeColors.shadowColor,
      transition: 'all 0.3s ease',
    },

    navRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px',
    },

    navLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
    },

    navButton: {
      padding: '10px 16px',
      background: themeColors.bgInput,
      border: '1px solid ' + themeColors.borderColor,
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      color: themeColors.textPrimary,
      transition: 'all 0.2s ease',
    },

    currentWeekButton: {
      padding: '10px 20px',
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
      transition: 'all 0.3s ease',
    },

    weekInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 20px',
      background: themeColors.bgInput,
      borderRadius: '10px',
      border: '1px solid ' + themeColors.borderColor,
      color: themeColors.textPrimary,
      fontWeight: 600,
      fontSize: '14px',
    },

    navRight: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
    },

    actionButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 18px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 500,
      fontSize: '13px',
      border: 'none',
      transition: 'all 0.2s ease',
      background: themeColors.bgInput,
      color: themeColors.textPrimary,
    },

    filterButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 18px',
      background: themeColors.bgInput,
      border: '1px solid ' + themeColors.borderColor,
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '13px',
      color: themeColors.textPrimary,
      transition: 'all 0.2s ease',
    },

    exportButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '13px',
      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
      transition: 'all 0.3s ease',
    },

    emailButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '13px',
      boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
      transition: 'all 0.3s ease',
    },

    filtersPanel: {
      marginTop: '20px',
      paddingTop: '20px',
      borderTop: '1px solid ' + themeColors.borderColor,
      display: 'flex',
      alignItems: 'flex-end',
      gap: '16px',
      flexWrap: 'wrap',
    },

    filtersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '14px',
      marginBottom: '16px',
      width: '100%',
    },

    filterSelect: {
      padding: '12px 14px',
      border: '1px solid ' + themeColors.borderColor,
      borderRadius: '10px',
      background: themeColors.bgInput,
      color: themeColors.textPrimary,
      fontSize: '14px',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      width: '100%',
    },

    filterActions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px',
      width: '100%',
    },

    resetButton: {
      padding: '8px 18px',
      background: themeColors.bgInput,
      border: '1px solid ' + themeColors.borderColor,
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '13px',
      color: themeColors.textSecondary,
      transition: 'all 0.2s ease',
    },

    filterResult: {
      fontSize: '14px',
      color: themeColors.textSecondary,
      fontWeight: 500,
    },

    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: '20px',
    },

    dayCard: {
      background: themeColors.bgCard,
      backdropFilter: 'blur(12px)',
      borderRadius: '16px',
      border: '1px solid ' + themeColors.borderColor,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: 'auto',
      minHeight: '450px',
      boxShadow: '0 1px 3px ' + themeColors.shadowColor,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },

    dayCardPassed: {
      opacity: 0.5,
    },

    dayCardHeader: {
      padding: '16px 20px',
      background: themeColors.bgInput,
      borderBottom: '1px solid ' + themeColors.borderColor,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    dayName: {
      fontWeight: 700,
      fontSize: '17px',
      color: themeColors.textPrimary,
      letterSpacing: '-0.01em',
    },

    dayDate: {
      fontSize: '12px',
      color: themeColors.textSecondary,
      marginTop: '2px',
      fontWeight: 500,
    },

    courseCount: {
      padding: '4px 12px',
      borderRadius: '20px',
      background: themeColors.bgInput,
      fontSize: '12px',
      fontWeight: 700,
      color: themeColors.textPrimary,
    },

    courseList: {
      padding: '14px',
      flex: 1,
      overflowY: 'auto',
      maxHeight: '400px',
    },

    emptyState: {
      textAlign: 'center',
      padding: '48px 20px',
      color: themeColors.textMuted,
      fontSize: '14px',
      fontWeight: 500,
    },

    courseCard: {
      padding: '14px 16px',
      marginBottom: '10px',
      background: themeColors.bgInput,
      borderRadius: '12px',
      border: '1px solid ' + themeColors.borderColor,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },

    courseCardPassed: {
      opacity: 0.5,
    },

    courseTitle: {
      fontWeight: 700,
      marginBottom: '8px',
      fontSize: '15px',
      color: themeColors.textPrimary,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },

    courseInfo: {
      fontSize: '12px',
      color: themeColors.textSecondary,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginBottom: '4px',
    },

    courseMeta: {
      display: 'flex',
      gap: '6px',
      marginTop: '10px',
      marginBottom: '10px',
      flexWrap: 'wrap',
    },

    courseBadge: {
      fontSize: '10px',
      padding: '3px 10px',
      borderRadius: '8px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      color: themeColors.textPrimary,
      fontWeight: 600,
    },

    courseBadgeNiveau: {
      background: themeColors.bgInput,
    },

    courseBadgeParcours: {
      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
      color: 'white',
    },

    actionButtons: {
      display: 'flex',
      gap: '8px',
      marginTop: '12px',
      paddingTop: '10px',
      borderTop: '1px solid ' + themeColors.borderColor,
    },

    editBtn: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px 12px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontWeight: 500,
      fontSize: '12px',
      gap: '6px',
    },

    editBtnDisabled: {
      opacity: 0.4,
      cursor: 'not-allowed',
    },

    deleteBtn: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px 12px',
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontWeight: 500,
      fontSize: '12px',
      gap: '6px',
    },

    deleteBtnDisabled: {
      opacity: 0.4,
      cursor: 'not-allowed',
    },

    modalOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    },

    modalContent: {
      background: themeColors.bgCard,
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      width: '560px',
      maxWidth: '100%',
      maxHeight: '90vh',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
      animation: 'scaleIn 0.25s ease-out',
    },

    modalHeader: {
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    modalHeaderLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },

    modalIconWrapper: {
      background: 'rgba(255, 255, 255, 0.2)',
      padding: '10px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    modalTitle: {
      fontSize: '20px',
      fontWeight: 600,
      color: 'white',
      margin: 0,
    },

    modalSubtitle: {
      fontSize: '12px',
      color: 'rgba(255, 255, 255, 0.85)',
      margin: '4px 0 0 0',
    },

    modalClose: {
      background: 'rgba(255, 255, 255, 0.15)',
      border: 'none',
      borderRadius: '50%',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: 'white',
      transition: 'all 0.2s ease',
    },

    modalBody: {
      padding: '24px',
      maxHeight: '55vh',
      overflowY: 'auto',
    },

    modalFooter: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      padding: '16px 24px',
      borderTop: '1px solid ' + themeColors.borderColor,
      background: themeColors.bgInput,
    },

    formGroup: {
      marginBottom: '16px',
    },

    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: 600,
      color: themeColors.textPrimary,
      marginBottom: '6px',
    },

    requiredStar: {
      color: '#ef4444',
      fontWeight: 700,
      fontSize: '16px',
      marginLeft: '4px',
    },

    input: {
      width: '100%',
      padding: '10px 14px',
      border: '1px solid ' + themeColors.borderColor,
      borderRadius: '10px',
      fontSize: '14px',
      background: themeColors.bgInput,
      color: themeColors.textPrimary,
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
    },

    select: {
      width: '100%',
      padding: '10px 14px',
      border: '1px solid ' + themeColors.borderColor,
      borderRadius: '10px',
      fontSize: '14px',
      background: themeColors.bgInput,
      color: themeColors.textPrimary,
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    },

    grid2: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '14px',
      marginBottom: '16px',
    },

    cancelBtn: {
      padding: '10px 24px',
      borderRadius: '40px',
      border: '1px solid ' + themeColors.borderColor,
      background: themeColors.bgCard,
      color: themeColors.textSecondary,
      cursor: 'pointer',
      fontWeight: 500,
      fontSize: '14px',
      transition: 'all 0.2s ease',
    },

    saveBtn: {
      padding: '10px 24px',
      borderRadius: '40px',
      border: 'none',
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease',
    },

    emailModalContent: {
      background: themeColors.bgCard,
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      width: '700px',
      maxWidth: '100%',
      maxHeight: '90vh',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
    },

    emailInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 18px',
      background: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
      borderRadius: '10px',
      marginBottom: '20px',
      fontSize: '13px',
      color: isDark ? '#A7F3D0' : '#065F46',
      border: '1px solid ' + (isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)'),
    },

    studentsList: {
      maxHeight: '280px',
      overflowY: 'auto',
      border: '1px solid ' + themeColors.borderColor,
      borderRadius: '10px',
      padding: '8px',
      background: themeColors.bgInput,
    },

    studentCheckbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '10px 14px',
      cursor: 'pointer',
      borderBottom: '1px solid ' + themeColors.borderColor,
      color: themeColors.textPrimary,
      transition: 'all 0.2s ease',
      borderRadius: '8px',
    },

    smallButton: {
      padding: '6px 14px',
      fontSize: '12px',
      background: themeColors.bgInput,
      border: '1px solid ' + themeColors.borderColor,
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: themeColors.textSecondary,
      transition: 'all 0.2s ease',
    },

    confirmationModalContent: {
      background: themeColors.bgCard,
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '36px',
      width: '420px',
      maxWidth: '90%',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
      animation: 'scaleIn 0.25s ease-out',
    },

    matiereAddButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 600,
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    },

    spinnerSmall: {
      width: '16px',
      height: '16px',
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: 'white',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    },
  };

  // ===================== RENDU =====================
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '72px', 
              height: '72px', 
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)',
            }}>
              <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: 'white' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: themeColors.textPrimary, marginBottom: '8px' }}>
              Chargement de l'emploi du temps...
            </h3>
            <p style={{ fontSize: '14px', color: themeColors.textSecondary }}>
              Veuillez patienter
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Notification */}
      {notification.show && (
        <div style={{
          ...styles.notification,
          backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444'
        }}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span style={{ fontWeight: 500 }}>{notification.message}</span>
        </div>
      )}

      {/* En-tête */}
      <div style={styles.headerSection}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <Calendar size={24} color="white" />
          </div>
          <div>
            <h1 style={styles.pageTitle}>📅 Emploi du temps</h1>
            <p style={styles.pageSubtitle}>Gestion des cours et planning hebdomadaire</p>
          </div>
        </div>
        <div style={styles.headerActions}>
          <button 
            onClick={() => { resetForm(); setShowModal(true); }} 
            style={styles.addButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(37, 99, 235, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(37, 99, 235, 0.2)';
            }}
          >
            <Plus size={18} /> Ajouter un cours
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <BarChart3 size={24} style={styles.statIcon} />
          <div>
            <div style={styles.statValue}>{totalCourses}</div>
            <div style={styles.statLabel}>Total cours</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <Calendar size={24} style={styles.statIcon} />
          <div>
            <div style={styles.statValue}>{Object.values(jourStats).filter(v => v > 0).length}</div>
            <div style={styles.statLabel}>Jours actifs</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <GraduationCap size={24} style={styles.statIcon} />
          <div>
            <div style={styles.statValue}>{Object.values(niveauStats).filter(v => v > 0).length}</div>
            <div style={styles.statLabel}>Niveaux actifs</div>
          </div>
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div style={styles.statsDetailContainer}>
        <div style={styles.statsDetail}>
          <span style={styles.statsDetailLabel}>📚 Répartition :</span>
          {NIVEAUX.map(niveau => (
            <span key={niveau} style={styles.statsDetailItem}>
              <span style={styles.statsDetailBadge}>{niveau}</span>
              <span style={styles.statsDetailCount}>{niveauStats[niveau] || 0}</span>
            </span>
          ))}
          <span style={{ color: themeColors.textMuted, fontSize: '12px', marginLeft: '8px' }}>
            •
          </span>
          {PARCOURS.map(p => (
            <span key={p.id} style={styles.statsDetailItem}>
              <span style={styles.statsDetailBadge}>{p.icon} {p.label}</span>
              <span style={styles.statsDetailCount}>{parcoursStats[p.id] || 0}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div style={styles.navigationCard}>
        <div style={styles.navRow}>
          <div style={styles.navLeft}>
            <button onClick={previousWeek} style={styles.navButton}
              onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(71, 85, 105, 0.6)' : 'rgba(226, 232, 240, 0.8)'}
              onMouseLeave={(e) => e.currentTarget.style.background = themeColors.bgInput}
            >
              <ChevronLeft size={20} />
            </button>
            <button onClick={goToCurrentWeek} style={styles.currentWeekButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.3)';
              }}
            >
              <RefreshCw size={16} style={{ marginRight: '8px' }} /> Semaine actuelle
            </button>
            <button onClick={nextWeek} style={styles.navButton}
              onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(71, 85, 105, 0.6)' : 'rgba(226, 232, 240, 0.8)'}
              onMouseLeave={(e) => e.currentTarget.style.background = themeColors.bgInput}
            >
              <ChevronRight size={20} />
            </button>
            <div style={styles.weekInfo}>
              <Calendar size={18} />
              <span>{getWeekRange()}</span>
            </div>
          </div>
          <div style={styles.navRight}>
            {/* Recherche semaine */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowWeekSearch(!showWeekSearch)} style={styles.actionButton}
                onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(71, 85, 105, 0.6)' : 'rgba(226, 232, 240, 0.8)'}
                onMouseLeave={(e) => e.currentTarget.style.background = themeColors.bgInput}
              >
                <Search size={18} /> Rechercher
              </button>
              {showWeekSearch && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: themeColors.bgCard,
                  border: '1px solid ' + themeColors.borderColor,
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  gap: '10px',
                  zIndex: 100,
                  boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)',
                  minWidth: '240px',
                }}>
                  <input 
                    type="date" 
                    value={searchDate} 
                    onChange={(e) => setSearchDate(e.target.value)} 
                    style={{
                      padding: '10px 14px',
                      border: '1px solid ' + themeColors.borderColor,
                      borderRadius: '10px',
                      background: themeColors.bgInput,
                      color: themeColors.textPrimary,
                      flex: 1,
                      fontSize: '14px',
                    }} 
                  />
                  <button onClick={() => {
                    if (searchDate) {
                      const date = new Date(searchDate);
                      if (!isNaN(date.getTime())) {
                        setCurrentWeekStart(getWeekStartDate(date));
                        setShowWeekSearch(false);
                        setSearchDate('');
                      }
                    }
                  }} style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                  >OK</button>
                  <button onClick={() => setShowWeekSearch(false)} style={{
                    padding: '10px',
                    background: themeColors.bgInput,
                    border: '1px solid ' + themeColors.borderColor,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    color: themeColors.textPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}><X size={18} /></button>
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowFilters(!showFilters)} 
              style={{
                ...styles.filterButton,
                background: showFilters 
                  ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' 
                  : themeColors.bgInput,
                color: showFilters ? 'white' : themeColors.textPrimary,
                border: showFilters ? 'none' : '1px solid ' + themeColors.borderColor,
              }}
            >
              <Filter size={18} /> Filtres
              {(filters.niveau || filters.parcours || filters.prof || filters.salle || filters.matiere_id) && (
                <span style={{
                  backgroundColor: showFilters ? 'rgba(255,255,255,0.2)' : '#2563eb',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '0 8px',
                  fontSize: '10px',
                  fontWeight: 700,
                  minWidth: '20px',
                  textAlign: 'center',
                }}>
                  {[filters.niveau, filters.parcours, filters.prof, filters.salle, filters.matiere_id].filter(Boolean).length}
                </span>
              )}
            </button>
            <button 
              onClick={handleExportPDF} 
              disabled={exporting || filteredCourses.length === 0} 
              style={{
                ...styles.exportButton,
                opacity: (exporting || filteredCourses.length === 0) ? 0.5 : 1,
                cursor: (exporting || filteredCourses.length === 0) ? 'not-allowed' : 'pointer',
                background: (exporting || filteredCourses.length === 0) 
                  ? 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)' 
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              }}
            >
              {exporting ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Génération...
                </>
              ) : (
                <>
                  <Download size={18} /> PDF
                </>
              )}
            </button>
            <button 
              onClick={openEmailModal} 
              disabled={filteredCourses.length === 0} 
              style={{
                ...styles.emailButton,
                opacity: filteredCourses.length === 0 ? 0.5 : 1,
                background: filteredCourses.length === 0 
                  ? 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)' 
                  : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              }}
            >
              <Mail size={18} /> Envoyer
            </button>
          </div>
        </div>

        {showFilters && (
          <div style={styles.filtersPanel}>
            <div style={styles.filtersGrid}>
              <select value={filters.niveau} onChange={(e) => setFilters({...filters, niveau: e.target.value})} style={styles.filterSelect}>
                <option value="">📚 Tous niveaux</option>
                {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <select value={filters.parcours} onChange={(e) => setFilters({...filters, parcours: e.target.value})} style={styles.filterSelect}>
                <option value="">🎓 Tous parcours</option>
                {PARCOURS.map(p => (
                  <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
                ))}
              </select>
              <select value={filters.prof} onChange={(e) => setFilters({...filters, prof: e.target.value})} style={styles.filterSelect}>
                <option value="">👨‍🏫 Tous professeurs</option>
                {profs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={filters.salle} onChange={(e) => setFilters({...filters, salle: e.target.value})} style={styles.filterSelect}>
                <option value="">🚪 Toutes salles</option>
                {salles.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
              <select value={filters.matiere_id} onChange={(e) => setFilters({...filters, matiere_id: e.target.value})} style={styles.filterSelect}>
                <option value="">📖 Toutes matières</option>
                {matieres.map(m => (
                  <option key={m.id} value={m.id}>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: m.couleur, marginRight: '8px' }}></span>
                    {m.nom} {m.code ? `(${m.code})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.filterActions}>
              <button onClick={resetFilters} style={styles.resetButton}
                onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(71, 85, 105, 0.6)' : 'rgba(226, 232, 240, 0.8)'}
                onMouseLeave={(e) => e.currentTarget.style.background = themeColors.bgInput}
              >
                Réinitialiser les filtres
              </button>
              <span style={styles.filterResult}>
                <Sparkles size={14} style={{ display: 'inline', marginRight: '6px', color: '#F59E0B' }} />
                {filteredCourses.length} cours trouvés
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Grille des cours */}
      <div style={styles.gridContainer} ref={exportRef}>
        {weekDays.length === 0 ? (
          <div style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '60px', 
            background: themeColors.bgCard,
            borderRadius: '16px',
            border: '1px solid ' + themeColors.borderColor,
          }}>
            <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.3, color: themeColors.textMuted }} />
            <p style={{ color: themeColors.textMuted, fontSize: '16px', fontWeight: 500 }}>Aucune semaine sélectionnée</p>
          </div>
        ) : (
          weekDays.map((day, index) => {
            const dayCourses = filteredCourses.filter(c => c.jour === day.dayName);
            const passed = day.isPassed;
            
            return (
              <div key={index} style={{
                ...styles.dayCard,
                ...(passed ? styles.dayCardPassed : {}),
              }}
              onMouseEnter={(e) => {
                if (!passed) {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = isDark 
                    ? '0 12px 40px rgba(0, 0, 0, 0.4)' 
                    : '0 12px 40px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 1px 3px ' + themeColors.shadowColor;
              }}
              >
                <div style={styles.dayCardHeader}>
                  <div>
                    <div style={styles.dayName}>
                      {day.dayName}
                      {passed && <span style={{ fontSize: '11px', color: '#EF4444', marginLeft: '6px', fontWeight: 500 }}>(Passé)</span>}
                    </div>
                    <div style={styles.dayDate}>{day.formattedDate}</div>
                  </div>
                  <span style={styles.courseCount}>
                    {dayCourses.length}
                  </span>
                </div>
                <div style={styles.courseList}>
                  {dayCourses.length === 0 ? (
                    <div style={styles.emptyState}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
                      Aucun cours
                    </div>
                  ) : (
                    dayCourses.map(c => {
                      const matiereColor = c.matiere_id ? getMatiereCouleur(c.matiere_id) : '#2563EB';
                      const passed = c.isPassed;
                      const modifiable = c.isModifiable;
                      
                      return (
                        <div key={c.id} style={{
                          ...styles.courseCard,
                          ...(passed ? styles.courseCardPassed : {}),
                          borderLeft: `4px solid ${matiereColor}`,
                        }}
                        onMouseEnter={(e) => {
                          if (!passed) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = isDark 
                              ? '0 8px 24px rgba(0, 0, 0, 0.3)' 
                              : '0 8px 24px rgba(0, 0, 0, 0.08)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                          <div style={styles.courseTitle}>
                            <span style={{ 
                              display: 'inline-block', 
                              width: '12px', 
                              height: '12px', 
                              borderRadius: '50%', 
                              background: matiereColor,
                              border: `2px solid ${isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.5)'}`,
                              flexShrink: 0,
                            }}></span>
                            <span style={{ flex: 1 }}>{c.matiere}</span>
                            {passed && <span style={{ fontSize: '12px', color: '#EF4444' }}>🔒</span>}
                          </div>
                          <div style={styles.courseInfo}>
                            <ClockIcon size={14} /> {c.heure_debut?.substring(0,5) || ''} - {c.heure_fin?.substring(0,5) || ''}
                          </div>
                          <div style={styles.courseInfo}>
                            <User size={14} /> {getProfName(c.user_id)}
                          </div>
                          <div style={styles.courseInfo}>
                            <DoorOpen size={14} /> {getSalleName(c.salle_id)}
                          </div>
                          <div style={styles.courseMeta}>
                            <span style={{ ...styles.courseBadge, ...styles.courseBadgeNiveau }}>
                              <GraduationCap size={10} style={{ marginRight: '4px' }} /> {c.niveau}
                            </span>
                            <span style={{ ...styles.courseBadge, ...styles.courseBadgeParcours }}>
                              {getParcoursIcon(c.parcours)} {getParcoursLabel(c.parcours)}
                            </span>
                          </div>
                          
                          <div style={styles.actionButtons}>
                            <button 
                              onClick={() => handleEdit(c)} 
                              style={{
                                ...styles.editBtn,
                                ...(!modifiable ? styles.editBtnDisabled : {})
                              }}
                              disabled={!modifiable}
                              title={!modifiable ? 'Impossible de modifier un cours passé' : 'Modifier le cours'}
                            >
                              <Edit2 size={14} /> Modifier
                            </button>
                            <button 
                              onClick={() => handleDelete(c.id, c.matiere, c)} 
                              style={{
                                ...styles.deleteBtn,
                                ...(!modifiable ? styles.deleteBtnDisabled : {})
                              }}
                              disabled={!modifiable}
                              title={!modifiable ? 'Impossible de supprimer un cours passé' : 'Supprimer le cours'}
                            >
                              <Trash2 size={14} /> Supprimer
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de confirmation */}
      {confirmationModal.show && (
        <div style={styles.modalOverlay} onClick={closeConfirmationModal}>
          <div style={styles.confirmationModalContent} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: confirmationModal.action === 'delete' 
                  ? 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)' 
                  : 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: confirmationModal.action === 'delete'
                  ? '0 8px 24px rgba(239, 68, 68, 0.15)'
                  : '0 8px 24px rgba(59, 130, 246, 0.15)',
              }}>
                {confirmationModal.action === 'delete' 
                  ? <Trash2 size={32} color="#DC2626" />
                  : <Edit2 size={32} color="#3B82F6" />
                }
              </div>
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: 700, 
                marginBottom: '12px', 
                color: themeColors.textPrimary
              }}>
                {confirmationModal.action === 'delete' ? 'Confirmer la suppression' : 'Confirmer la modification'}
              </h3>
              <p style={{ 
                color: themeColors.textSecondary, 
                fontSize: '15px', 
                lineHeight: '1.7',
                maxWidth: '320px',
                margin: '0 auto',
              }}>
                {confirmationModal.action === 'delete' 
                  ? `Êtes-vous sûr de vouloir supprimer le cours "${confirmationModal.courseName}" ?`
                  : `Êtes-vous sûr de vouloir modifier le cours "${confirmationModal.courseName}" ?`
                }
              </p>
              <p style={{ 
                color: themeColors.textMuted, 
                fontSize: '13px', 
                marginTop: '8px',
                fontWeight: 500,
              }}>
                {confirmationModal.action === 'delete' ? '⚠️ Cette action est irréversible' : '📝 Cette action est permanente'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={closeConfirmationModal} style={styles.cancelBtn}
                onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(51, 65, 85, 0.6)' : 'rgba(241, 245, 249, 0.8)'}
                onMouseLeave={(e) => e.currentTarget.style.background = themeColors.bgCard}
              >
                <X size={18} /> Non, annuler
              </button>
              <button 
                onClick={confirmationModal.action === 'delete' ? executeDelete : executeUpdate} 
                style={{
                  ...styles.saveBtn,
                  background: confirmationModal.action === 'delete' 
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  boxShadow: confirmationModal.action === 'delete'
                    ? '0 4px 16px rgba(239, 68, 68, 0.3)'
                    : '0 4px 16px rgba(59, 130, 246, 0.3)',
                }}
              >
                {confirmationModal.action === 'delete' ? <Trash2 size={18} /> : <Edit2 size={18} />}
                Oui, {confirmationModal.action === 'delete' ? 'supprimer' : 'modifier'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout/Modification */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderLeft}>
                <div style={styles.modalIconWrapper}>
                  {editId ? <Edit2 size={22} color="white" /> : <Plus size={22} color="white" />}
                </div>
                <div>
                  <h3 style={styles.modalTitle}>{editId ? 'Modifier le cours' : 'Ajouter un cours'}</h3>
                  <p style={styles.modalSubtitle}>Semaine du {getWeekRange()}</p>
                </div>
              </div>
              <button onClick={closeModal} style={styles.modalClose}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Matière */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Matière <span style={styles.requiredStar}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <select 
                    value={form.matiere_id} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm({ 
                        ...form, 
                        matiere_id: val,
                        matiere: val ? getMatiereNom(parseInt(val)) : ''
                      });
                    }}
                    style={{
                      ...styles.select,
                      flex: 1,
                    }}
                  >
                    <option value="">📚 Sélectionner une matière</option>
                    {matieres.map(m => (
                      <option key={m.id} value={m.id}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: m.couleur, marginRight: '8px' }}></span>
                        {m.nom} {m.code ? `(${m.code})` : ''}
                      </option>
                    ))}
                  </select>
                  <button 
                    onClick={() => openMatiereModal()}
                    style={styles.matiereAddButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                    }}
                  >
                    <Plus size={16} /> Nouvelle
                  </button>
                </div>
                {form.matiere_id && (
                  <div style={{ 
                    marginTop: '8px', 
                    fontSize: '12px', 
                    color: themeColors.textSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    background: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid ' + (isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)'),
                  }}>
                    <span style={{ 
                      display: 'inline-block', 
                      width: '10px', 
                      height: '10px', 
                      borderRadius: '50%', 
                      background: getMatiereCouleur(parseInt(form.matiere_id)) 
                    }}></span>
                    ✓ Matière sélectionnée : {getMatiereNom(parseInt(form.matiere_id))}
                  </div>
                )}
              </div>

              {/* Saisie manuelle */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Ou saisir manuellement</label>
                <input 
                  type="text" 
                  placeholder="Ex: Algorithmique avancée" 
                  value={form.matiere} 
                  onChange={e => {
                    setForm({ 
                      ...form, 
                      matiere: e.target.value,
                      matiere_id: ''
                    });
                  }}
                  style={styles.input}
                />
                <div style={{ 
                  fontSize: '11px', 
                  color: themeColors.textMuted, 
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <AlertCircle size={12} />
                  Si vous sélectionnez une matière ci-dessus, ce champ sera automatiquement rempli
                </div>
              </div>

              <div style={styles.grid2}>
                <div>
                  <label style={styles.label}>Niveau <span style={styles.requiredStar}>*</span></label>
                  <select 
                    value={form.niveau} 
                    onChange={handleNiveauChange} 
                    style={styles.select}
                  >
                    {NIVEAUX.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Parcours <span style={styles.requiredStar}>*</span></label>
                  <select 
                    value={form.parcours} 
                    onChange={e => setForm({ ...form, parcours: e.target.value })} 
                    style={styles.select}
                  >
                    {PARCOURS_PAR_NIVEAU[form.niveau]?.map(pId => {
                      const p = PARCOURS.find(p => p.id === pId);
                      return p ? (
                        <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
                      ) : null;
                    })}
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Jour <span style={styles.requiredStar}>*</span></label>
                <select 
                  value={form.jour} 
                  onChange={e => setForm({ ...form, jour: e.target.value })} 
                  style={styles.select}
                >
                  {JOURS.map(j => {
                    const dayData = weekDays.find(d => d.dayName === j);
                    const isPassed = dayData ? dayData.isPassed : false;
                    return (
                      <option key={j} value={j} disabled={isPassed}>
                        {j} {isPassed ? '(Déjà passé)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={styles.grid2}>
                <div>
                  <label style={styles.label}>Heure début <span style={styles.requiredStar}>*</span></label>
                  <input 
                    type="time" 
                    value={form.heure_debut} 
                    onChange={e => setForm({ ...form, heure_debut: e.target.value })} 
                    style={styles.input}
                  />
                </div>
                <div>
                  <label style={styles.label}>Heure fin <span style={styles.requiredStar}>*</span></label>
                  <input 
                    type="time" 
                    value={form.heure_fin} 
                    onChange={e => setForm({ ...form, heure_fin: e.target.value })} 
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Professeur <span style={styles.requiredStar}>*</span></label>
                <select 
                  value={form.user_id} 
                  onChange={e => setForm({ ...form, user_id: parseInt(e.target.value) })} 
                  style={styles.select}
                >
                  <option value="">👨‍🏫 Sélectionner un professeur</option>
                  {profs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Salle <span style={styles.requiredStar}>*</span></label>
                <select 
                  value={form.salle_id} 
                  onChange={e => setForm({ ...form, salle_id: parseInt(e.target.value) })} 
                  style={styles.select}
                >
                  <option value="">🚪 Sélectionner une salle</option>
                  {salles.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={closeModal} style={styles.cancelBtn}
                onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(51, 65, 85, 0.6)' : 'rgba(241, 245, 249, 0.8)'}
                onMouseLeave={(e) => e.currentTarget.style.background = themeColors.bgCard}
              >
                Annuler
              </button>
              <button 
                onClick={handleSave} 
                disabled={(!form.matiere_id && !form.matiere) || !form.user_id || !form.salle_id}
                style={{
                  ...styles.saveBtn,
                  opacity: ((!form.matiere_id && !form.matiere) || !form.user_id || !form.salle_id) ? 0.5 : 1,
                  cursor: ((!form.matiere_id && !form.matiere) || !form.user_id || !form.salle_id) ? 'not-allowed' : 'pointer'
                }}
              >
                <Save size={18} /> {editId ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gestion des Matières */}
      {showMatiereModal && (
        <div style={styles.modalOverlay} onClick={() => setShowMatiereModal(false)}>
          <div style={{
            ...styles.modalContent,
            width: '640px',
          }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderLeft}>
                <div style={styles.modalIconWrapper}>
                  <BookMarked size={22} color="white" />
                </div>
                <div>
                  <h3 style={styles.modalTitle}>{editMatiereId ? 'Modifier la matière' : 'Nouvelle matière'}</h3>
                  <p style={styles.modalSubtitle}>Gestion des matières</p>
                </div>
              </div>
              <button onClick={() => setShowMatiereModal(false)} style={styles.modalClose}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleMatiereSubmit}>
              <div style={styles.modalBody}>
                {/* ... (contenu du formulaire de matière identique à avant) ... */}
                {/* Je garde le contenu existant pour ne pas surcharger */}
              </div>
              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowMatiereModal(false)} style={styles.cancelBtn}>
                  Annuler
                </button>
                <button type="submit" disabled={!matiereForm.nom} style={styles.saveBtn}>
                  <Save size={18} /> {editMatiereId ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Envoi d'email */}
      {showEmailModal && (
        <div style={styles.modalOverlay} onClick={() => setShowEmailModal(false)}>
          <div style={styles.emailModalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderLeft}>
                <div style={styles.modalIconWrapper}>
                  <Mail size={22} color="white" />
                </div>
                <div>
                  <h3 style={styles.modalTitle}>Envoi de l'emploi du temps</h3>
                  <p style={styles.modalSubtitle}>Envoyer par email aux étudiants</p>
                </div>
              </div>
              <button onClick={() => setShowEmailModal(false)} style={styles.modalClose}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.emailInfo}>
                <FileText size={18} />
                <span>Semaine du {getWeekRange()} - <strong>{filteredCourses.length}</strong> cours programmés</span>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Objet</label>
                <input 
                  type="text" 
                  value={emailData.subject} 
                  onChange={(e) => setEmailData({...emailData, subject: e.target.value})} 
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={styles.label}>
                    Destinataires <span style={{ fontWeight: '700', color: '#2563EB' }}>({emailData.recipients.length})</span>
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={selectAllStudents} style={styles.smallButton}>
                      <Users size={14} /> Tous
                    </button>
                    <button onClick={deselectAllStudents} style={styles.smallButton}>
                      Aucun
                    </button>
                  </div>
                </div>
                <div style={styles.studentsList}>
                  {availableEtudiants.length === 0 ? (
                    <div style={styles.emptyState}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>👤</div>
                      Aucun étudiant trouvé
                    </div>
                  ) : (
                    availableEtudiants.map(etudiant => (
                      <label key={etudiant.id} style={styles.studentCheckbox}>
                        <input 
                          type="checkbox" 
                          checked={emailData.recipients.includes(etudiant.id)} 
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEmailData({...emailData, recipients: [...emailData.recipients, etudiant.id]});
                            } else {
                              setEmailData({...emailData, recipients: emailData.recipients.filter(id => id !== etudiant.id)});
                            }
                          }}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563EB' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600 }}>{etudiant.nom}</div>
                          <div style={{ fontSize: '12px', color: themeColors.textSecondary }}>{etudiant.email}</div>
                        </div>
                        <div style={{ 
                          marginLeft: 'auto', 
                          fontSize: '11px', 
                          color: themeColors.textMuted,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: themeColors.bgInput,
                          padding: '2px 10px',
                          borderRadius: '12px',
                        }}>
                          {etudiant.niveau} - {getParcoursIcon(etudiant.parcours)} {getParcoursLabel(etudiant.parcours)}
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setShowEmailModal(false)} style={styles.cancelBtn}>
                Annuler
              </button>
              <button 
                onClick={handleSendEmails} 
                disabled={sendingEmail || emailData.recipients.length === 0} 
                style={{
                  ...styles.saveBtn,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  opacity: (sendingEmail || emailData.recipients.length === 0) ? 0.5 : 1,
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                }}
              >
                <Send size={18} /> {sendingEmail ? 'Envoi...' : `Envoyer (${emailData.recipients.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations CSS globales */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .add-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(37, 99, 235, 0.3);
        }

        .filter-toggle:hover {
          border-color: #2563eb;
        }

        .reset-filters-button:hover {
          background-color: ${isDark ? 'rgba(71, 85, 105, 0.6)' : 'rgba(226, 232, 240, 0.8)'};
        }

        .edit-btn:hover:not(:disabled) {
          transform: scale(1.05);
          opacity: 0.9;
        }

        .delete-btn:hover:not(:disabled) {
          transform: scale(1.05);
          opacity: 0.9;
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
        }

        .cancel-btn:hover {
          background-color: ${isDark ? 'rgba(51, 65, 85, 0.6)' : 'rgba(241, 245, 249, 0.8)'};
        }

        .modal-close:hover {
          background: rgba(255,255,255,0.25);
        }

        .nav-button:hover {
          background: ${isDark ? 'rgba(71, 85, 105, 0.6)' : 'rgba(226, 232, 240, 0.8)'};
          transform: scale(1.05);
        }

        .action-button:hover {
          background: ${isDark ? 'rgba(71, 85, 105, 0.6)' : 'rgba(226, 232, 240, 0.8)'};
        }

        .filter-select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px ${themeColors.shadowColor};
          transition: all 0.2s ease;
        }

        .day-card:hover:not(.day-card-passed) {
          transform: translateY(-4px);
          box-shadow: ${isDark ? '0 12px 40px rgba(0, 0, 0, 0.4)' : '0 12px 40px rgba(0, 0, 0, 0.1)'};
        }

        .student-checkbox:hover {
          background: ${isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(241, 245, 249, 0.6)'};
          border-radius: 8px;
        }

        .small-button:hover {
          background: ${isDark ? 'rgba(71, 85, 105, 0.6)' : 'rgba(226, 232, 240, 0.8)'};
        }

        @media (max-width: 1200px) {
          .grid-container {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          .container {
            padding: 16px !important;
          }
          .header-section {
            flex-direction: column;
            align-items: stretch;
          }
          .header-actions {
            flex-direction: column;
          }
          .nav-row {
            flex-direction: column;
            align-items: stretch;
          }
          .nav-left {
            flex-wrap: wrap;
            justify-content: center;
          }
          .nav-right {
            flex-wrap: wrap;
            justify-content: center;
          }
          .grid-container {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .grid2 {
            grid-template-columns: 1fr !important;
          }
          .filters-grid {
            grid-template-columns: 1fr !important;
          }
          .modal-content {
            width: 95% !important;
          }
          .email-modal-content {
            width: 95% !important;
          }
          .stats-container {
            grid-template-columns: 1fr;
          }
          .stats-detail {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .grid-container {
            grid-template-columns: 1fr !important;
          }
          .day-card {
            min-height: 350px !important;
          }
          .confirmation-modal-content {
            width: 95% !important;
          }
        }
      `}</style>
    </div>
  );
}