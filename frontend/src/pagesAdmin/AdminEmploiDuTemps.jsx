// src/pagesAdmin/AdminEmploitudtemps.jsx
// ✅ CORRECTION FINALE : Envoi d'emails avec tous les champs requis

import { useState, useEffect } from 'react';
import { edtService, profService, salleService, etudiantService, emailService } from '../services/api';
import { 
  Plus, Calendar, Clock, User, MapPin, ChevronLeft, ChevronRight, 
  Search, Filter, X, Download, Mail, FileText, CheckCircle, AlertCircle,
  Edit2, Trash2, AlertTriangle, Send, Printer, RefreshCw, Users,
  BookOpen, DoorOpen, GraduationCap, Clock as ClockIcon, Save,
  Sparkles, Check, Info, Loader2
} from 'lucide-react';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const NIVEAUX = ['L1', 'L2', 'L3', 'M1', 'M2'];
const PARCOURS = ['Génie Logiciel', 'Réseaux & Télécoms', "Systèmes d'Information", 'Sécurité Informatique'];

// ✅ Fonction pour formater en date locale (évite les problèmes de fuseau horaire)
function toLocalDateString(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ✅ Fonction pour extraire la date d'une chaîne ISO (2026-06-15T00:00:00.000000Z -> 2026-06-15)
function extractDateFromISO(isoDate) {
  if (!isoDate) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;
  return isoDate.split('T')[0];
}

// ✅ Fonction pour obtenir le lundi de la semaine
function getWeekStartDate(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0) ? 6 : (day - 1);
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function AdminEmploitudtemps() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [profs, setProfs] = useState([]);
  const [salles, setSalles] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Gestion de la semaine
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    return getWeekStartDate(today);
  });
  
  const [weekDays, setWeekDays] = useState([]);
  const [showWeekSearch, setShowWeekSearch] = useState(false);
  const [searchDate, setSearchDate] = useState('');
  
  // Filtres
  const [filters, setFilters] = useState({
    niveau: '',
    parcours: '',
    prof: '',
    salle: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // États pour l'export et l'envoi email
  const [exporting, setExporting] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    recipients: []
  });
  const [availableEtudiants, setAvailableEtudiants] = useState([]);

  // États pour les notifications et le modal de confirmation
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [confirmationModal, setConfirmationModal] = useState({ show: false, action: null, id: null, courseData: null, courseName: '' });

  const [form, setForm] = useState({
    matiere: '',
    niveau: 'L1',
    parcours: 'Génie Logiciel',
    jour: 'Lundi',
    heure_debut: '08:00',
    heure_fin: '10:00',
    user_id: '',
    salle_id: '',
    date_debut_semaine: ''
  });

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
        fullDate: d
      });
    }
    setWeekDays(dates);
  }

  function filterCoursesByWeek() {
    if (!currentWeekStart) return;
    
    const weekStartStr = toLocalDateString(currentWeekStart);
    
    let filtered = courses.filter(course => {
      if (!course.date_debut_semaine) return false;
      const courseDate = extractDateFromISO(course.date_debut_semaine);
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
    
    setFilteredCourses(filtered);
  }

  function previousWeek() {
    if (!currentWeekStart) return;
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  }

  function nextWeek() {
    if (!currentWeekStart) return;
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  }

  function goToCurrentWeek() {
    const today = new Date();
    const newDate = getWeekStartDate(today);
    setCurrentWeekStart(newDate);
  }

  function handleSearchWeek() {
    if (!searchDate) return;
    const date = new Date(searchDate);
    if (!isNaN(date.getTime())) {
      const newDate = getWeekStartDate(date);
      setCurrentWeekStart(newDate);
      setShowWeekSearch(false);
      setSearchDate('');
    }
  }

  function getWeekRange() {
    if (weekDays.length === 0) return '';
    const start = weekDays[0]?.formattedDate || '';
    const end = weekDays[5]?.formattedDate || '';
    return `${start} - ${end}`;
  }

  const isDayPassed = (dayDate) => {
    if (!dayDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayDateObj = new Date(dayDate);
    dayDateObj.setHours(0, 0, 0, 0);
    return dayDateObj < today;
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCourses(),
        loadProfs(),
        loadSalles(),
        loadEtudiants()
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

  const showToastNotification = (message, type = 'success') => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const openConfirmationModal = (action, id = null, courseData = null, courseName = '') => {
    setConfirmationModal({ show: true, action, id, courseData, courseName });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({ show: false, action: null, id: null, courseData: null, courseName: '' });
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const html = generatePDFHTML();
      const printWindow = window.open('', '_blank');
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
      showToastNotification('PDF généré avec succès !', 'success');
    } catch (error) {
      console.error('Erreur export PDF:', error);
      showToastNotification('Erreur lors de la génération du PDF', 'error');
    } finally {
      setExporting(false);
    }
  };

  const generatePDFHTML = () => {
    const weekRange = getWeekRange();
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Emploi du temps - Semaine du ${weekRange}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #667eea; }
          .header h1 { color: #667eea; margin: 0; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #667eea; color: white; padding: 12px; text-align: left; }
          td { border: 1px solid #ddd; padding: 12px; vertical-align: top; }
          .course-title { font-weight: bold; color: #667eea; }
          .course-info { font-size: 11px; color: #666; margin-top: 4px; }
          .badge { display: inline-block; padding: 2px 6px; background: #e0e7ff; border-radius: 4px; font-size: 10px; margin-right: 5px; }
          .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header"><h1>📅 Emploi du temps</h1><p>Semaine du ${weekRange}</p></div>
        <table><thead><tr><th>Jour</th><th>Date</th><th>Cours</th></tr></thead><tbody>`;
    weekDays.forEach(day => {
      const dayCourses = filteredCourses.filter(c => c.jour === day.dayName);
      html += `<tr><td style="width: 100px;"><strong>${day.dayName}</strong></td><td style="width: 100px;">${day.formattedDate}</td><td>`;
      if (dayCourses.length === 0) html += `<em>Aucun cours</em>`;
      else {
        dayCourses.forEach(course => {
          html += `<div class="course"><div class="course-title">${course.matiere}</div>
            <div class="course-info">⏰ ${course.heure_debut.substring(0,5)} - ${course.heure_fin.substring(0,5)}<br>
            👨‍🏫 ${getProfName(course.user_id)}<br>📍 ${getSalleName(course.salle_id)}<br>
            <span class="badge">${course.niveau}</span><span class="badge">${course.parcours}</span></div></div>`;
        });
      }
      html += `</td></tr>`;
    });
    html += `</tbody></table>
        <div class="footer"><p>Document généré le ${new Date().toLocaleDateString('fr-FR')}</p></div>
      </body>
      </html>`;
    return html;
  };

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
      subject: `Emploi du temps - Semaine du ${getWeekRange()}`,
      message: generateEmailMessage(),
      recipients: filteredEtudiants.map(e => e.id)
    });
    setShowEmailModal(true);
  };

  const generateEmailMessage = () => {
    const weekRange = getWeekRange();
    let message = `Bonjour,\n\nVeuillez trouver ci-joint l'emploi du temps de la semaine du ${weekRange}.\n\n`;
    weekDays.forEach(day => {
      const dayCourses = filteredCourses.filter(c => c.jour === day.dayName);
      message += `📅 ${day.dayName} (${day.formattedDate}):\n`;
      dayCourses.forEach(course => {
        message += `   • ${course.matiere} - ${course.heure_debut.substring(0,5)} à ${course.heure_fin.substring(0,5)}\n`;
        message += `     Professeur: ${getProfName(course.user_id)}\n     Salle: ${getSalleName(course.salle_id)}\n`;
      });
      message += `\n`;
    });
    message += `Cordialement,\nL'administration ENI Fianarantsoa`;
    return message;
  };

  // ✅ FONCTION CORRIGÉE : Envoi d'emails avec TOUS les champs requis
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

      // ✅ Préparer les données des cours avec TOUS les champs
      const coursesData = filteredCourses.map(course => ({
        id: course.id || 0,
        matiere: course.matiere || '',
        niveau: course.niveau || 'L1',
        parcours: course.parcours || 'Génie Logiciel',
        jour: course.jour || 'Lundi',
        heure_debut: course.heure_debut ? course.heure_debut.substring(0, 5) : '08:00',
        heure_fin: course.heure_fin ? course.heure_fin.substring(0, 5) : '10:00',
        prof_name: getProfName(course.user_id),
        salle_name: getSalleName(course.salle_id),
        user_id: course.user_id || 1,
        salle_id: course.salle_id || 1,
        date_debut_semaine: course.date_debut_semaine || toLocalDateString(currentWeekStart)
      }));

      // ✅ Déterminer le niveau et parcours à partir des filtres ou du premier cours
      const defaultNiveau = filters.niveau || (coursesData.length > 0 ? coursesData[0].niveau : 'L1');
      const defaultParcours = filters.parcours || (coursesData.length > 0 ? coursesData[0].parcours : 'Génie Logiciel');

      // ✅ Préparer le payload avec TOUS les champs requis
      const payload = {
        subject: emailData.subject || `Emploi du temps - Semaine du ${getWeekRange()}`,
        message: emailData.message || generateEmailMessage(),
        recipients: emailData.recipients.map(id => parseInt(id)),
        weekRange: getWeekRange(),
        weekStart: toLocalDateString(currentWeekStart),
        niveau: defaultNiveau,
        parcours: defaultParcours,
        courses: coursesData,
        sendAsPdf: true,
        pdfFilename: `emploi-du-temps-${toLocalDateString(currentWeekStart)}.pdf`
      };

      console.log('📤 Envoi des emails avec payload:', JSON.stringify(payload, null, 2));

      const response = await emailService.sendEmploiDuTemps(payload);
      
      if (response.success) {
        showToastNotification(response.message || '📧 Emails envoyés avec succès !', 'success');
        setTimeout(() => setShowEmailModal(false), 2000);
      } else {
        showToastNotification(response.message || 'Erreur lors de l\'envoi', 'error');
      }
    } catch (error) {
      console.error('Erreur envoi emails:', error);
      if (error.response) {
        console.error('Détails de l\'erreur:', error.response.data);
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Erreur lors de l\'envoi des emails';
        showToastNotification(errorMessage, 'error');
      } else {
        showToastNotification('Erreur lors de l\'envoi des emails', 'error');
      }
    } finally {
      setSendingEmail(false);
    }
  };

  const selectAllStudents = () => {
    setEmailData({ ...emailData, recipients: availableEtudiants.map(e => e.id) });
  };

  const deselectAllStudents = () => {
    setEmailData({ ...emailData, recipients: [] });
  };

  const getProfName = (id) => {
    const prof = profs.find(p => p.id === id);
    return prof?.name || '—';
  };

  const getSalleName = (id) => {
    const salle = salles.find(s => s.id === id);
    return salle?.nom || '—';
  };

  const getCoursesByDayAndDate = (dayName) => {
    return filteredCourses.filter(c => c.jour === dayName);
  };

  const resetFilters = () => {
    setFilters({ niveau: '', parcours: '', prof: '', salle: '' });
  };

  const handleSave = async () => {
    try {
      const weekStartStr = toLocalDateString(currentWeekStart);
      
      const courseData = {
        matiere: form.matiere,
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
        openConfirmationModal('update', editId, courseData, form.matiere);
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
      setShowModal(false);
      resetForm();
      showToastNotification('Cours modifié avec succès', 'success');
    } catch (error) {
      console.error('Erreur modification:', error);
      showToastNotification('Erreur lors de la modification', 'error');
    } finally {
      closeConfirmationModal();
    }
  };

  const handleDelete = (id, courseName) => {
    openConfirmationModal('delete', id, null, courseName);
  };

  const executeDelete = async () => {
    const { id } = confirmationModal;
    try {
      await edtService.delete(id);
      await loadCourses();
      showToastNotification('Cours supprimé avec succès', 'success');
    } catch (error) {
      console.error('Erreur suppression:', error);
      showToastNotification('Erreur lors de la suppression', 'error');
    } finally {
      closeConfirmationModal();
    }
  };

  const handleEdit = (course) => {
    setEditId(course.id);
    setForm({
      matiere: course.matiere,
      niveau: course.niveau,
      parcours: course.parcours,
      jour: course.jour,
      heure_debut: course.heure_debut.substring(0, 5),
      heure_fin: course.heure_fin.substring(0, 5),
      user_id: course.user_id,
      salle_id: course.salle_id,
      date_debut_semaine: course.date_debut_semaine || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditId(null);
    setForm({
      matiere: '', niveau: 'L1', parcours: 'Génie Logiciel', jour: 'Lundi',
      heure_debut: '08:00', heure_fin: '10:00', user_id: '', salle_id: '',
      date_debut_semaine: ''
    });
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Composant de chargement
  if (loading) {
    return (
      <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: '#667eea', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>Chargement de l'emploi du temps...</h3>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Veuillez patienter</p>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Notification */}
      {notification.show && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 2000,
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 24px', borderRadius: '12px',
          backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white', boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span style={{ fontWeight: 500 }}>{notification.message}</span>
        </div>
      )}

      {/* Modal de confirmation */}
      {confirmationModal.show && (
        <div style={styles.modalOverlay} onClick={closeConfirmationModal}>
          <div style={styles.confirmationModalContent} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                background: confirmationModal.action === 'delete' ? '#fee2e2' : '#dbeafe',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                {confirmationModal.action === 'delete' 
                  ? <Trash2 size={30} color="#dc2626" />
                  : <Edit2 size={30} color="#3b82f6" />
                }
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px', color: '#1e293b' }}>
                {confirmationModal.action === 'delete' ? 'Confirmer la suppression' : 'Confirmer la modification'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6' }}>
                {confirmationModal.action === 'delete' 
                  ? `Êtes-vous sûr de vouloir supprimer le cours "${confirmationModal.courseName}" ?`
                  : `Êtes-vous sûr de vouloir modifier le cours "${confirmationModal.courseName}" ?`
                }
              </p>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '8px' }}>
                Cette action est {confirmationModal.action === 'delete' ? 'irréversible' : 'permanente'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={closeConfirmationModal} style={{
                padding: '12px 24px', borderRadius: '10px', border: '1px solid #e2e8f0',
                background: 'white', cursor: 'pointer', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <X size={18} /> Non, annuler
              </button>
              <button onClick={confirmationModal.action === 'delete' ? executeDelete : executeUpdate} style={{
                padding: '12px 28px', borderRadius: '10px', border: 'none',
                background: confirmationModal.action === 'delete' ? '#dc2626' : '#3b82f6',
                color: 'white', cursor: 'pointer', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                {confirmationModal.action === 'delete' ? <Trash2 size={18} /> : <Edit2 size={18} />}
                Oui, {confirmationModal.action === 'delete' ? 'supprimer' : 'modifier'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '4px' }}>
            📅 Emploi du temps
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Gestion des cours et planning hebdomadaire</p>
        </div>
        <button onClick={() => {
          resetForm();
          setShowModal(true);
        }} style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer',
          fontWeight: 600, fontSize: '14px', boxShadow: '0 4px 15px rgba(102,126,234,0.4)'
        }}>
          <Plus size={18} /> Ajouter un cours
        </button>
      </div>

      {/* Navigation semaine */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={previousWeek} style={styles.navButton}><ChevronLeft size={20} /></button>
            <button onClick={goToCurrentWeek} style={styles.currentWeekButton}><RefreshCw size={16} style={{ marginRight: '8px' }} /> Semaine actuelle</button>
            <button onClick={nextWeek} style={styles.navButton}><ChevronRight size={20} /></button>
            <div style={styles.weekInfo}><Calendar size={16} /><span style={{ fontWeight: 600 }}>{getWeekRange()}</span></div>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowWeekSearch(!showWeekSearch)} style={styles.searchButton}><Search size={18} /> Rechercher semaine</button>
              {showWeekSearch && (
                <div style={styles.searchDropdown}>
                  <input 
                    type="date" 
                    value={searchDate} 
                    onChange={(e) => setSearchDate(e.target.value)} 
                    style={styles.searchInput} 
                  />
                  <button onClick={handleSearchWeek} style={styles.searchSubmit}>OK</button>
                  <button onClick={() => setShowWeekSearch(false)} style={styles.searchClose}><X size={18} /></button>
                </div>
              )}
            </div>
            <button onClick={() => setShowFilters(!showFilters)} style={{ ...styles.filterButton, background: showFilters ? '#667eea' : '#f1f5f9', color: showFilters ? 'white' : '#475569' }}>
              <Filter size={18} /> Filtres
            </button>
            <button onClick={handleExportPDF} disabled={exporting} style={styles.exportButton}>
              <Printer size={18} /> {exporting ? 'Génération...' : 'PDF'}
            </button>
            <button onClick={openEmailModal} disabled={filteredCourses.length === 0} style={{ ...styles.emailButton, opacity: filteredCourses.length === 0 ? 0.5 : 1 }}>
              <Mail size={18} /> Envoyer
            </button>
          </div>
        </div>

        {showFilters && (
          <div style={styles.filtersPanel}>
            <div style={styles.filtersGrid}>
              <select value={filters.niveau} onChange={(e) => setFilters({...filters, niveau: e.target.value})} style={styles.filterSelect}>
                <option value="">📚 Tous niveaux</option>
                {NIVEAUX.map(n => <option key={n}>{n}</option>)}
              </select>
              <select value={filters.parcours} onChange={(e) => setFilters({...filters, parcours: e.target.value})} style={styles.filterSelect}>
                <option value="">🎓 Tous parcours</option>
                {PARCOURS.map(p => <option key={p}>{p}</option>)}
              </select>
              <select value={filters.prof} onChange={(e) => setFilters({...filters, prof: e.target.value})} style={styles.filterSelect}>
                <option value="">👨‍🏫 Tous professeurs</option>
                {profs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={filters.salle} onChange={(e) => setFilters({...filters, salle: e.target.value})} style={styles.filterSelect}>
                <option value="">🚪 Toutes salles</option>
                {salles.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
            </div>
            <div style={styles.filterActions}>
              <button onClick={resetFilters} style={styles.resetButton}>Réinitialiser les filtres</button>
              <span style={styles.filterResult}>{filteredCourses.length} cours trouvés</span>
            </div>
          </div>
        )}
      </div>

      {/* Grille des cours */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '20px' }}>
        {weekDays.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px' }}>
            <p style={{ color: '#94a3b8' }}>Aucune semaine sélectionnée</p>
          </div>
        ) : (
          weekDays.map((day, index) => {
            const dayCourses = getCoursesByDayAndDate(day.dayName);
            const passed = isDayPassed(day.date);
            
            return (
              <div key={index} style={{
                ...styles.dayCard,
                opacity: passed ? 0.6 : 1,
                backgroundColor: passed ? '#f8fafc' : 'white'
              }}>
                <div style={{
                  ...styles.dayCardHeader,
                  backgroundColor: passed ? '#f1f5f9' : '#f8fafc'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px' }}>{day.dayName}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{day.formattedDate}</div>
                  </div>
                  <span style={styles.courseCount}>{dayCourses.length}</span>
                </div>
                <div style={styles.courseList}>
                  {dayCourses.length === 0 ? (
                    <div style={styles.emptyState}>Aucun cours</div>
                  ) : (
                    dayCourses.map(c => (
                      <div key={c.id} style={styles.courseCard}>
                        <div style={styles.courseTitle}>{c.matiere}</div>
                        <div style={styles.courseInfo}><ClockIcon size={12} /> {c.heure_debut.substring(0,5)} - {c.heure_fin.substring(0,5)}</div>
                        <div style={styles.courseInfo}><User size={12} /> {getProfName(c.user_id)}</div>
                        <div style={styles.courseInfo}><DoorOpen size={12} /> {getSalleName(c.salle_id)}</div>
                        <div style={styles.courseMeta}>
                          <span style={styles.courseBadge}><GraduationCap size={10} style={{ marginRight: '2px' }} /> {c.niveau}</span>
                          <span style={styles.courseBadge}><BookOpen size={10} style={{ marginRight: '2px' }} /> {c.parcours?.substring(0,12)}</span>
                        </div>
                        
                        <div style={{ 
                          display: 'flex', 
                          gap: '8px', 
                          marginTop: '12px',
                          paddingTop: '10px',
                          borderTop: '1px solid #e2e8f0'
                        }}>
                          <button
                            onClick={() => handleEdit(c)}
                            title="Modifier le cours"
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '8px',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                            }}
                          >
                            <Edit2 size={16} />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(c.id, c.matiere)}
                            title="Supprimer le cours"
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '8px',
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal d'envoi d'email */}
      {showEmailModal && (
        <div style={styles.modalOverlay} onClick={() => setShowEmailModal(false)}>
          <div style={{...styles.modalContent, maxWidth: '700px'}} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}><Mail size={20} style={{ marginRight: '8px' }} /> Envoyer l'emploi du temps</h3>
            <div style={styles.emailInfo}><FileText size={16} /><span>Semaine du {getWeekRange()} - {filteredCourses.length} cours</span></div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Objet</label>
              <input type="text" value={emailData.subject} onChange={(e) => setEmailData({...emailData, subject: e.target.value})} style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Message</label>
              <textarea value={emailData.message} onChange={(e) => setEmailData({...emailData, message: e.target.value})} style={{...styles.input, minHeight: '120px', resize: 'vertical'}} />
            </div>
            <div style={styles.formGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={styles.label}>Destinataires ({emailData.recipients.length})</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={selectAllStudents} style={styles.smallButton}><Users size={12} /> Tous</button>
                  <button onClick={deselectAllStudents} style={styles.smallButton}>Aucun</button>
                </div>
              </div>
              <div style={styles.studentsList}>
                {availableEtudiants.length === 0 ? (
                  <div style={styles.emptyState}>Aucun étudiant trouvé</div>
                ) : (
                  availableEtudiants.map(etudiant => (
                    <label key={etudiant.id} style={styles.studentCheckbox}>
                      <input type="checkbox" checked={emailData.recipients.includes(etudiant.id)} onChange={(e) => {
                        if (e.target.checked) setEmailData({...emailData, recipients: [...emailData.recipients, etudiant.id]});
                        else setEmailData({...emailData, recipients: emailData.recipients.filter(id => id !== etudiant.id)});
                      }} />
                      <div><div style={{ fontWeight: 500 }}>{etudiant.nom}</div><div style={{ fontSize: '12px', color: '#64748b' }}>{etudiant.email}</div></div>
                    </label>
                  ))
                )}
              </div>
            </div>
            <div style={styles.modalActions}>
              <button onClick={() => setShowEmailModal(false)} style={styles.cancelButton}>Annuler</button>
              <button onClick={handleSendEmails} disabled={sendingEmail || emailData.recipients.length === 0} style={{...styles.saveButton, background: '#10b981'}}>
                <Send size={16} /> {sendingEmail ? 'Envoi...' : `Envoyer (${emailData.recipients.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout/Modification */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContentAdvanced} onClick={e => e.stopPropagation()}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '20px 24px',
              borderRadius: '20px 20px 0 0',
              position: 'relative'
            }}>
              <button
                onClick={closeModal}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '16px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              >
                <X size={18} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '10px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {editId ? <Edit2 size="22" color="white" /> : <Sparkles size="22" color="white" />}
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', margin: 0 }}>
                    {editId ? 'Modifier le cours' : 'Ajouter un cours'}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: '4px 0 0 0' }}>
                    Semaine du {getWeekRange()}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ padding: '20px 24px', maxHeight: '55vh', overflowY: 'auto' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.labelAdvanced}>📚 Matière *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Algorithmique avancée" 
                  value={form.matiere} 
                  onChange={e => setForm({ ...form, matiere: e.target.value })} 
                  style={styles.inputAdvanced} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={styles.labelAdvanced}>🎓 Niveau *</label>
                  <select value={form.niveau} onChange={e => setForm({ ...form, niveau: e.target.value })} style={styles.inputAdvanced}>
                    {NIVEAUX.map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.labelAdvanced}>📖 Parcours *</label>
                  <select value={form.parcours} onChange={e => setForm({ ...form, parcours: e.target.value })} style={styles.inputAdvanced}>
                    {PARCOURS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.labelAdvanced}>📅 Jour *</label>
                <select 
                  value={form.jour} 
                  onChange={e => setForm({ ...form, jour: e.target.value })} 
                  style={styles.inputAdvanced}
                >
                  {JOURS.map(j => {
                    const dayData = weekDays.find(d => d.dayName === j);
                    const isPassed = dayData ? isDayPassed(dayData.date) : false;
                    return (
                      <option 
                        key={j} 
                        value={j}
                        disabled={isPassed}
                      >
                        {j} {isPassed ? '(Déjà passé)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={styles.labelAdvanced}>⏰ Heure début *</label>
                  <input type="time" value={form.heure_debut} onChange={e => setForm({ ...form, heure_debut: e.target.value })} style={styles.inputAdvanced} />
                </div>
                <div>
                  <label style={styles.labelAdvanced}>⏰ Heure fin *</label>
                  <input type="time" value={form.heure_fin} onChange={e => setForm({ ...form, heure_fin: e.target.value })} style={styles.inputAdvanced} />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.labelAdvanced}>👨‍🏫 Professeur *</label>
                <select value={form.user_id} onChange={e => setForm({ ...form, user_id: parseInt(e.target.value) })} style={styles.inputAdvanced}>
                  <option value="">Sélectionner un professeur</option>
                  {profs.map(p => <option key={p.id} value={p.id}>{p.name} - {p.specialite}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '0' }}>
                <label style={styles.labelAdvanced}>🚪 Salle *</label>
                <select value={form.salle_id} onChange={e => setForm({ ...form, salle_id: parseInt(e.target.value) })} style={styles.inputAdvanced}>
                  <option value="">Sélectionner une salle</option>
                  {salles.map(s => <option key={s.id} value={s.id}>{s.nom} (Capacité: {s.capacite})</option>)}
                </select>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end', 
              padding: '16px 24px 20px 24px',
              borderTop: '1px solid #e2e8f0',
              background: '#fafbfc',
              borderRadius: '0 0 20px 20px'
            }}>
              <button 
                onClick={closeModal} 
                style={styles.cancelButtonAdvanced}
              >
                Annuler
              </button>
              <button 
                onClick={handleSave} 
                disabled={!form.matiere || !form.user_id || !form.salle_id}
                style={{
                  ...styles.saveButtonAdvanced,
                  opacity: (!form.matiere || !form.user_id || !form.salle_id) ? 0.5 : 1,
                  cursor: (!form.matiere || !form.user_id || !form.salle_id) ? 'not-allowed' : 'pointer'
                }}
              >
                <Save size="16" />
                {editId ? 'Modifier le cours' : 'Ajouter le cours'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  navButton: {
    padding: '10px 14px', background: '#f1f5f9', border: '1px solid #e2e8f0',
    borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center'
  },
  currentWeekButton: {
    padding: '10px 18px', background: '#667eea', color: 'white', border: 'none',
    borderRadius: '10px', cursor: 'pointer', fontWeight: 600, display: 'flex',
    alignItems: 'center', fontSize: '13px'
  },
  weekInfo: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
    background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0'
  },
  searchButton: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
    background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '10px',
    cursor: 'pointer', fontSize: '13px'
  },
  searchDropdown: {
    position: 'absolute', top: '100%', right: 0, marginTop: '8px',
    background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px',
    padding: '12px', display: 'flex', gap: '8px', zIndex: 100,
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
  },
  searchInput: { padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px' },
  searchSubmit: { padding: '8px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  searchClose: { padding: '8px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' },
  filterButton: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
    border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontSize: '13px'
  },
  exportButton: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
    background: '#10b981', color: 'white', border: 'none', borderRadius: '10px',
    cursor: 'pointer', fontWeight: 600, fontSize: '13px'
  },
  emailButton: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
    background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px',
    cursor: 'pointer', fontWeight: 600, fontSize: '13px'
  },
  filtersPanel: { marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' },
  filtersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' },
  filterSelect: { padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '10px', background: 'white', fontSize: '14px' },
  filterActions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  resetButton: { padding: '8px 16px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  filterResult: { fontSize: '13px', color: '#64748b' },
  dayCard: { background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'auto', minHeight: '500px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  dayCardHeader: { padding: '14px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  courseCount: { padding: '4px 10px', borderRadius: '20px', background: '#e2e8f0', fontSize: '12px', fontWeight: 600 },
  courseList: { padding: '12px', flex: 1, overflowY: 'auto' },
  emptyState: { textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: '13px' },
  courseCard: { padding: '12px', marginBottom: '10px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' },
  courseTitle: { fontWeight: 700, marginBottom: '8px', fontSize: '14px', color: '#1e293b' },
  courseInfo: { fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' },
  courseMeta: { display: 'flex', gap: '6px', marginTop: '8px', marginBottom: '10px' },
  courseBadge: { fontSize: '10px', padding: '3px 8px', background: '#e2e8f0', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '3px' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modalContentAdvanced: { background: 'white', borderRadius: '20px', width: '560px', maxWidth: '90%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
  confirmationModalContent: { background: 'white', borderRadius: '24px', padding: '32px', width: '420px', maxWidth: '90%' },
  modalTitle: { marginBottom: '20px', fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center', color: '#1e293b' },
  modalContent: { background: 'white', borderRadius: '20px', padding: '32px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' },
  weekInfoText: { fontSize: '12px', color: '#667eea', marginBottom: '20px', fontWeight: 500 },
  input: { width: '100%', padding: '12px', marginBottom: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', boxSizing: 'border-box', fontSize: '14px' },
  inputAdvanced: { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', transition: 'all 0.2s', boxSizing: 'border-box' },
  labelAdvanced: { display: 'block', fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' },
  modalActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' },
  cancelButton: { padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 500 },
  cancelButtonAdvanced: { padding: '8px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 500, fontSize: '13px', transition: 'all 0.2s' },
  saveButton: { padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#667eea', color: 'white', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' },
  saveButtonAdvanced: { padding: '8px 24px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' },
  emailInfo: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#f0fdf4', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', color: '#166534' },
  studentsList: { maxHeight: '280px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '8px' },
  studentCheckbox: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' },
  smallButton: { padding: '5px 12px', fontSize: '11px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }
};