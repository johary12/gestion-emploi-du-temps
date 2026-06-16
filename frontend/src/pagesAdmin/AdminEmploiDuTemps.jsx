// src/pagesAdmin/AdminEmploiDuTemps.jsx - Version complète corrigée

import { useState, useEffect } from 'react';
import { edtService, profService, salleService, etudiantService, emailService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { 
  Plus, Calendar, Clock, User, MapPin, ChevronLeft, ChevronRight, 
  Search, Filter, X, Download, Mail, FileText, CheckCircle, AlertCircle,
  Edit2, Trash2, AlertTriangle, Send, Printer, RefreshCw, Users,
  BookOpen, DoorOpen, GraduationCap, Clock as ClockIcon, Save,
  Sparkles, Check, Info, Loader2, Moon, Sun, Eye, EyeOff, Table
} from 'lucide-react';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const NIVEAUX = ['L1', 'L2', 'L3', 'M1', 'M2'];
const PARCOURS = ['Génie Logiciel', 'Réseaux & Télécoms', "Systèmes d'Information", 'Sécurité Informatique'];

function toLocalDateString(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function extractDateFromISO(isoDate) {
  if (!isoDate) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;
  return isoDate.split('T')[0];
}

function getWeekStartDate(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0) ? 6 : (day - 1);
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function AdminEmploitudtemps() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [profs, setProfs] = useState([]);
  const [salles, setSalles] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    return getWeekStartDate(today);
  });
  const [weekDays, setWeekDays] = useState([]);
  const [showWeekSearch, setShowWeekSearch] = useState(false);
  const [searchDate, setSearchDate] = useState('');
  const [filters, setFilters] = useState({
    niveau: '',
    parcours: '',
    prof: '',
    salle: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    recipients: []
  });
  const [availableEtudiants, setAvailableEtudiants] = useState([]);
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

  const generatePDFHTML = () => {
    const weekRange = getWeekRange();
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Emploi du temps - Semaine du ${weekRange}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', 'Poppins', 'Roboto', Arial, sans-serif;
            padding: 40px;
            background: #ffffff;
            color: #1e293b;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 30px;
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            border-radius: 16px;
            color: white;
          }
          .header h1 {
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .header p {
            font-size: 14px;
            opacity: 0.9;
            margin-top: 8px;
          }
          .header .badge {
            display: inline-block;
            padding: 4px 12px;
            background: rgba(255,255,255,0.2);
            border-radius: 20px;
            font-size: 12px;
            margin-top: 8px;
          }
          .stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-bottom: 30px;
            padding: 16px;
            background: #f8fafc;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
          }
          .stats-item {
            text-align: center;
          }
          .stats-item .number {
            font-size: 20px;
            font-weight: 700;
            color: #2563eb;
          }
          .stats-item .label {
            font-size: 12px;
            color: #64748b;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          thead {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          }
          th {
            color: white;
            padding: 14px 16px;
            text-align: left;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          td {
            padding: 14px 16px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 13px;
            vertical-align: top;
          }
          tr:last-child td {
            border-bottom: none;
          }
          tr:hover td {
            background-color: #f8fafc;
          }
          .jour-cell {
            font-weight: 600;
            color: #1e293b;
          }
          .date-cell {
            color: #64748b;
            font-size: 12px;
          }
          .course-title {
            font-weight: 600;
            color: #2563eb;
          }
          .course-details {
            font-size: 12px;
            color: #64748b;
            margin-top: 4px;
          }
          .course-details span {
            display: inline-block;
            margin-right: 12px;
          }
          .badge-niveau {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            margin-right: 6px;
          }
          .badge-niveau.L1 { background: #dbeafe; color: #2563eb; }
          .badge-niveau.L2 { background: #d1fae5; color: #059669; }
          .badge-niveau.L3 { background: #fef3c7; color: #d97706; }
          .badge-niveau.M1 { background: #fce7f3; color: #db2777; }
          .badge-niveau.M2 { background: #ede9fe; color: #7c3aed; }
          .badge-parcours {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 500;
            background: #f3e8ff;
            color: #7c3aed;
          }
          .empty-cell {
            text-align: center;
            color: #94a3b8;
            padding: 20px;
            font-style: italic;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            padding: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 11px;
            color: #94a3b8;
          }
          .footer .logo {
            font-weight: 700;
            color: #2563eb;
          }
          @media print {
            body { padding: 20px; }
            .header { background: #2563eb !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            thead { background: #2563eb !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .badge-niveau { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📅 Emploi du temps</h1>
          <p>Semaine du ${weekRange}</p>
          <span class="badge">${filteredCourses.length} cours programmés</span>
        </div>
        
        <div class="stats">
          <div class="stats-item">
            <div class="number">${profs.filter(p => filteredCourses.some(c => c.user_id === p.id)).length}</div>
            <div class="label">👨‍🏫 Professeurs</div>
          </div>
          <div class="stats-item">
            <div class="number">${salles.filter(s => filteredCourses.some(c => c.salle_id === s.id)).length}</div>
            <div class="label">🚪 Salles</div>
          </div>
          <div class="stats-item">
            <div class="number">${filteredCourses.length}</div>
            <div class="label">📚 Cours</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 12%;">Jour</th>
              <th style="width: 12%;">Date</th>
              <th style="width: 76%;">Cours</th>
            </tr>
          </thead>
          <tbody>`;

    weekDays.forEach(day => {
      const dayCourses = filteredCourses.filter(c => c.jour === day.dayName);
      html += `<tr>
        <td class="jour-cell">${day.dayName}</td>
        <td class="date-cell">${day.formattedDate}</td>
        <td>`;
      
      if (dayCourses.length === 0) {
        html += `<div class="empty-cell">Aucun cours</div>`;
      } else {
        dayCourses.forEach((course, idx) => {
          const niveauClass = course.niveau || 'L1';
          html += `<div style="${idx > 0 ? 'margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e2e8f0;' : ''}">
            <div class="course-title">${course.matiere}</div>
            <div class="course-details">
              <span>⏰ ${course.heure_debut?.substring(0,5) || ''} - ${course.heure_fin?.substring(0,5) || ''}</span>
              <span>👨‍🏫 ${getProfName(course.user_id)}</span>
              <span>📍 ${getSalleName(course.salle_id)}</span>
            </div>
            <div style="margin-top: 4px;">
              <span class="badge-niveau ${niveauClass}">${course.niveau}</span>
              <span class="badge-parcours">${course.parcours}</span>
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
          <p>Document généré le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p>© <span class="logo">ENI Fianarantsoa</span> - Emploi du temps</p>
        </div>
      </body>
      </html>`;

    return html;
  };

  const generateEmailHTML = () => {
    const weekRange = getWeekRange();
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Inter', 'Poppins', 'Roboto', Arial, sans-serif; color: #1e293b; line-height: 1.6; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; border-radius: 16px; color: white; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 8px 0 0; opacity: 0.9; }
          .message { padding: 20px 0; }
          table { width: 100%; border-collapse: collapse; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          thead { background: #2563eb; }
          th { color: white; padding: 12px 16px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          tr:last-child td { border-bottom: none; }
          .jour-cell { font-weight: 600; }
          .date-cell { color: #64748b; font-size: 12px; }
          .course-title { font-weight: 600; color: #2563eb; }
          .course-details { font-size: 12px; color: #64748b; margin-top: 4px; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; margin-right: 4px; }
          .badge-L1 { background: #dbeafe; color: #2563eb; }
          .badge-L2 { background: #d1fae5; color: #059669; }
          .badge-L3 { background: #fef3c7; color: #d97706; }
          .badge-M1 { background: #fce7f3; color: #db2777; }
          .badge-M2 { background: #ede9fe; color: #7c3aed; }
          .badge-parcours { background: #f3e8ff; color: #7c3aed; }
          .empty-cell { text-align: center; color: #94a3b8; padding: 20px; font-style: italic; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
          .footer .logo { color: #2563eb; font-weight: 700; }
          @media (max-width: 600px) {
            table { font-size: 12px; }
            th, td { padding: 8px 10px; }
            .course-details { font-size: 11px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Emploi du temps</h1>
            <p>Semaine du ${weekRange}</p>
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
        <td class="date-cell">${day.formattedDate}</td>
        <td>`;
      
      if (dayCourses.length === 0) {
        html += `<div class="empty-cell">Aucun cours</div>`;
      } else {
        dayCourses.forEach((course, idx) => {
          const niveauClass = course.niveau || 'L1';
          html += `<div style="${idx > 0 ? 'margin-top: 10px; padding-top: 10px; border-top: 1px dashed #e2e8f0;' : ''}">
            <div class="course-title">${course.matiere}</div>
            <div class="course-details">
              ⏰ ${course.heure_debut?.substring(0,5) || ''} - ${course.heure_fin?.substring(0,5) || ''}
              &nbsp;|&nbsp; 👨‍🏫 ${getProfName(course.user_id)}
              &nbsp;|&nbsp; 📍 ${getSalleName(course.salle_id)}
            </div>
            <div style="margin-top: 4px;">
              <span class="badge badge-${niveauClass}">${course.niveau}</span>
              <span class="badge badge-parcours">${course.parcours}</span>
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
            <p><span class="logo">ENI Fianarantsoa</span> - Service Scolarité</p>
            <p style="font-size: 11px;">Ce message a été généré automatiquement. Merci de ne pas y répondre directement.</p>
          </div>
        </div>
      </body>
      </html>`;

    return html;
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const html = generatePDFHTML();
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        showToastNotification('PDF généré avec succès !', 'success');
      } else {
        showToastNotification('Veuillez autoriser les popups pour générer le PDF', 'error');
      }
    } catch (error) {
      console.error('Erreur export PDF:', error);
      showToastNotification('Erreur lors de la génération du PDF', 'error');
    } finally {
      setExporting(false);
    }
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
      message: generateEmailHTML(),
      recipients: filteredEtudiants.map(e => e.id)
    });
    setShowEmailModal(true);
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

      const defaultNiveau = filters.niveau || (coursesData.length > 0 ? coursesData[0].niveau : 'L1');
      const defaultParcours = filters.parcours || (coursesData.length > 0 ? coursesData[0].parcours : 'Génie Logiciel');

      const payload = {
        subject: emailData.subject || `Emploi du temps - Semaine du ${getWeekRange()}`,
        htmlContent: emailData.message || generateEmailHTML(),
        recipients: emailData.recipients.map(id => parseInt(id)),
        weekRange: getWeekRange(),
        weekStart: toLocalDateString(currentWeekStart),
        niveau: defaultNiveau,
        parcours: defaultParcours,
        courses: coursesData,
        sendAsPdf: true,
        pdfFilename: `emploi-du-temps-${toLocalDateString(currentWeekStart)}.pdf`
      };

      console.log('📤 Envoi des emails avec tableau HTML:', JSON.stringify(payload, null, 2));

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

  // ✅ Styles avec notification comme OBJET (PAS une fonction)
  const getStyles = () => ({
    container: {
      padding: '24px 32px',
      maxWidth: '1400px',
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
      color: isDark ? '#f1f5f9' : '#1e293b',
      fontFamily: '"Inter", "Poppins", "Roboto", -apple-system, sans-serif',
      transition: 'all 0.3s ease',
    },
    headerSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '28px',
      flexWrap: 'wrap',
      gap: '16px',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    pageTitle: {
      fontSize: '28px',
      fontWeight: 800,
      background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '4px',
    },
    pageSubtitle: {
      color: isDark ? '#94a3b8' : '#64748b',
      fontSize: '14px',
      WebkitTextFillColor: isDark ? '#94a3b8' : '#64748b',
    },
    headerActions: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    themeToggle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      borderRadius: '40px',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      background: isDark ? '#1e293b' : '#ffffff',
      color: isDark ? '#f1f5f9' : '#1e293b',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontWeight: 500,
      fontSize: '13px',
    },
    addButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '40px',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '14px',
      boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
      transition: 'all 0.3s ease',
    },
    navigationCard: {
      background: isDark ? '#1e293b' : '#ffffff',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '24px',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
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
    },
    navButton: {
      padding: '10px 14px',
      background: isDark ? '#334155' : '#f1f5f9',
      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      color: isDark ? '#f1f5f9' : '#1e293b',
      transition: 'all 0.2s ease',
    },
    currentWeekButton: {
      padding: '10px 18px',
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
      transition: 'all 0.2s ease',
    },
    weekInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 18px',
      background: isDark ? '#334155' : '#f8fafc',
      borderRadius: '10px',
      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
      color: isDark ? '#f1f5f9' : '#1e293b',
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
      padding: '10px 16px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 500,
      fontSize: '13px',
      border: 'none',
      transition: 'all 0.2s ease',
    },
    filterButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      background: isDark ? '#334155' : '#f1f5f9',
      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '13px',
      color: isDark ? '#f1f5f9' : '#475569',
      transition: 'all 0.2s ease',
    },
    exportButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 18px',
      background: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '13px',
      transition: 'all 0.2s ease',
    },
    emailButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 18px',
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '13px',
      transition: 'all 0.2s ease',
    },
    filtersPanel: {
      marginTop: '20px',
      paddingTop: '20px',
      borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    },
    filtersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '12px',
      marginBottom: '16px',
    },
    filterSelect: {
      padding: '10px 12px',
      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
      borderRadius: '10px',
      background: isDark ? '#1e293b' : '#ffffff',
      color: isDark ? '#f1f5f9' : '#1e293b',
      fontSize: '14px',
      transition: 'all 0.2s ease',
    },
    filterActions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px',
    },
    resetButton: {
      padding: '8px 16px',
      background: isDark ? '#334155' : '#f1f5f9',
      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '13px',
      color: isDark ? '#f1f5f9' : '#475569',
      transition: 'all 0.2s ease',
    },
    filterResult: {
      fontSize: '13px',
      color: isDark ? '#94a3b8' : '#64748b',
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: '20px',
    },
    dayCard: {
      background: isDark ? '#1e293b' : '#ffffff',
      borderRadius: '16px',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: 'auto',
      minHeight: '450px',
      boxShadow: isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease',
    },
    dayCardHeader: {
      padding: '14px 16px',
      background: isDark ? '#0f172a' : '#f8fafc',
      borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dayName: {
      fontWeight: 700,
      fontSize: '16px',
      color: isDark ? '#f1f5f9' : '#1e293b',
    },
    dayDate: {
      fontSize: '11px',
      color: isDark ? '#94a3b8' : '#94a3b8',
      marginTop: '2px',
    },
    courseCount: {
      padding: '4px 10px',
      borderRadius: '20px',
      background: isDark ? '#334155' : '#e2e8f0',
      fontSize: '12px',
      fontWeight: 600,
      color: isDark ? '#f1f5f9' : '#1e293b',
    },
    courseList: {
      padding: '12px',
      flex: 1,
      overflowY: 'auto',
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: isDark ? '#64748b' : '#94a3b8',
      fontSize: '13px',
    },
    courseCard: {
      padding: '12px',
      marginBottom: '10px',
      background: isDark ? '#0f172a' : '#f8fafc',
      borderRadius: '12px',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      transition: 'all 0.2s ease',
    },
    courseTitle: {
      fontWeight: 700,
      marginBottom: '8px',
      fontSize: '14px',
      color: isDark ? '#f1f5f9' : '#1e293b',
    },
    courseInfo: {
      fontSize: '11px',
      color: isDark ? '#94a3b8' : '#64748b',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      marginBottom: '4px',
    },
    courseMeta: {
      display: 'flex',
      gap: '6px',
      marginTop: '8px',
      marginBottom: '10px',
    },
    courseBadge: {
      fontSize: '10px',
      padding: '3px 8px',
      background: isDark ? '#334155' : '#e2e8f0',
      borderRadius: '6px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '3px',
      color: isDark ? '#f1f5f9' : '#1e293b',
    },
    actionButtons: {
      display: 'flex',
      gap: '8px',
      marginTop: '12px',
      paddingTop: '10px',
      borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    },
    editBtn: {
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
    },
    deleteBtn: {
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
    },
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    },
    modalContent: {
      background: isDark ? '#1e293b' : '#ffffff',
      borderRadius: '20px',
      width: '560px',
      maxWidth: '100%',
      maxHeight: '90vh',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
      animation: 'scaleIn 0.25s ease-out',
    },
    modalHeader: {
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      padding: '20px 24px',
      position: 'relative',
    },
    modalClose: {
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
      transition: 'all 0.2s',
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: 700,
      color: 'white',
      margin: 0,
    },
    modalSubtitle: {
      fontSize: '12px',
      color: 'rgba(255,255,255,0.8)',
      margin: '4px 0 0 0',
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
      padding: '16px 24px 20px 24px',
      borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      background: isDark ? '#0f172a' : '#fafbfc',
    },
    formGroup: {
      marginBottom: '16px',
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: 600,
      color: isDark ? '#f1f5f9' : '#1e293b',
      marginBottom: '6px',
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
      borderRadius: '10px',
      fontSize: '14px',
      background: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#f1f5f9' : '#1e293b',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
      borderRadius: '10px',
      fontSize: '14px',
      background: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#f1f5f9' : '#1e293b',
      transition: 'all 0.2s ease',
    },
    grid2: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '14px',
      marginBottom: '16px',
    },
    cancelBtn: {
      padding: '10px 24px',
      borderRadius: '10px',
      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
      background: isDark ? '#1e293b' : '#ffffff',
      color: isDark ? '#f1f5f9' : '#1e293b',
      cursor: 'pointer',
      fontWeight: 500,
      fontSize: '13px',
      transition: 'all 0.2s ease',
    },
    saveBtn: {
      padding: '10px 24px',
      borderRadius: '10px',
      border: 'none',
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease',
    },
    // ✅ CORRIGÉ: notification comme OBJET (PAS une fonction)
    notification: {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 24px',
      borderRadius: '12px',
      color: 'white',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      animation: 'slideIn 0.3s ease-out',
    },
    emailModalContent: {
      background: isDark ? '#1e293b' : '#ffffff',
      borderRadius: '20px',
      width: '700px',
      maxWidth: '100%',
      maxHeight: '90vh',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    },
    emailInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px',
      background: isDark ? '#0f172a' : '#f0fdf4',
      borderRadius: '12px',
      marginBottom: '20px',
      fontSize: '13px',
      color: isDark ? '#a7f3d0' : '#166534',
    },
    studentsList: {
      maxHeight: '280px',
      overflowY: 'auto',
      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
      borderRadius: '12px',
      padding: '8px',
    },
    studentCheckbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px',
      cursor: 'pointer',
      borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
      color: isDark ? '#f1f5f9' : '#1e293b',
    },
    smallButton: {
      padding: '5px 12px',
      fontSize: '11px',
      background: isDark ? '#334155' : '#f1f5f9',
      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      color: isDark ? '#f1f5f9' : '#1e293b',
    },
    confirmationModalContent: {
      background: isDark ? '#1e293b' : '#ffffff',
      borderRadius: '24px',
      padding: '32px',
      width: '420px',
      maxWidth: '90%',
    },
  });

  const styles = getStyles();

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <div style={{ textAlign: 'center' }}>
            <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: '#2563eb', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: isDark ? '#f1f5f9' : '#1e293b' }}>Chargement de l'emploi du temps...</h3>
            <p style={{ fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>Veuillez patienter</p>
          </div>
        </div>
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
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      
      {/* ✅ CORRIGÉ: Notification avec backgroundColor conditionnel */}
      {notification.show && (
        <div style={{
          ...styles.notification,
          backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444'
        }}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span style={{ fontWeight: 500 }}>{notification.message}</span>
        </div>
      )}

      {/* En-tête */}
      <div style={styles.headerSection}>
        <div style={styles.headerLeft}>
          <div>
            <h1 style={styles.pageTitle}>📅 Emploi du temps</h1>
            <p style={styles.pageSubtitle}>Gestion des cours et planning hebdomadaire</p>
          </div>
        </div>
        <div style={styles.headerActions}>
          <button onClick={toggleTheme} style={styles.themeToggle}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {isDark ? 'Mode Clair' : 'Mode Sombre'}
          </button>
          <button onClick={() => { resetForm(); setShowModal(true); }} style={styles.addButton}>
            <Plus size={18} /> Ajouter un cours
          </button>
        </div>
      </div>

      {/* Navigation semaine */}
      <div style={styles.navigationCard}>
        <div style={styles.navRow}>
          <div style={styles.navLeft}>
            <button onClick={previousWeek} style={styles.navButton}>
              <ChevronLeft size={20} />
            </button>
            <button onClick={goToCurrentWeek} style={styles.currentWeekButton}>
              <RefreshCw size={16} style={{ marginRight: '8px' }} /> Semaine actuelle
            </button>
            <button onClick={nextWeek} style={styles.navButton}>
              <ChevronRight size={20} />
            </button>
            <div style={styles.weekInfo}>
              <Calendar size={16} />
              <span>{getWeekRange()}</span>
            </div>
          </div>
          <div style={styles.navRight}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowWeekSearch(!showWeekSearch)} style={styles.actionButton}>
                <Search size={18} /> Rechercher
              </button>
              {showWeekSearch && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: isDark ? '#1e293b' : 'white',
                  border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  gap: '8px',
                  zIndex: 100,
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                }}>
                  <input 
                    type="date" 
                    value={searchDate} 
                    onChange={(e) => setSearchDate(e.target.value)} 
                    style={{
                      padding: '8px',
                      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      background: isDark ? '#0f172a' : '#ffffff',
                      color: isDark ? '#f1f5f9' : '#1e293b',
                    }} 
                  />
                  <button onClick={handleSearchWeek} style={{
                    padding: '8px 16px',
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}>OK</button>
                  <button onClick={() => setShowWeekSearch(false)} style={{
                    padding: '8px',
                    background: isDark ? '#334155' : '#f1f5f9',
                    border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: isDark ? '#f1f5f9' : '#1e293b',
                  }}><X size={18} /></button>
                </div>
              )}
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              style={{
                ...styles.filterButton,
                background: showFilters ? '#2563eb' : (isDark ? '#334155' : '#f1f5f9'),
                color: showFilters ? 'white' : (isDark ? '#f1f5f9' : '#475569'),
              }}
            >
              <Filter size={18} /> Filtres
            </button>
            <button onClick={handleExportPDF} disabled={exporting} style={{
              ...styles.exportButton,
              opacity: exporting ? 0.6 : 1,
            }}>
              <Printer size={18} /> {exporting ? 'Génération...' : 'PDF'}
            </button>
            <button onClick={openEmailModal} disabled={filteredCourses.length === 0} style={{
              ...styles.emailButton,
              opacity: filteredCourses.length === 0 ? 0.5 : 1,
            }}>
              <Mail size={18} /> Envoyer
            </button>
          </div>
        </div>

        {showFilters && (
          <div style={styles.filtersPanel}>
            <div style={styles.filtersGrid}>
              <select 
                value={filters.niveau} 
                onChange={(e) => setFilters({...filters, niveau: e.target.value})} 
                style={styles.filterSelect}
              >
                <option value="">📚 Tous niveaux</option>
                {NIVEAUX.map(n => <option key={n}>{n}</option>)}
              </select>
              <select 
                value={filters.parcours} 
                onChange={(e) => setFilters({...filters, parcours: e.target.value})} 
                style={styles.filterSelect}
              >
                <option value="">🎓 Tous parcours</option>
                {PARCOURS.map(p => <option key={p}>{p}</option>)}
              </select>
              <select 
                value={filters.prof} 
                onChange={(e) => setFilters({...filters, prof: e.target.value})} 
                style={styles.filterSelect}
              >
                <option value="">👨‍🏫 Tous professeurs</option>
                {profs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select 
                value={filters.salle} 
                onChange={(e) => setFilters({...filters, salle: e.target.value})} 
                style={styles.filterSelect}
              >
                <option value="">🚪 Toutes salles</option>
                {salles.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
            </div>
            <div style={styles.filterActions}>
              <button onClick={resetFilters} style={styles.resetButton}>
                Réinitialiser les filtres
              </button>
              <span style={styles.filterResult}>{filteredCourses.length} cours trouvés</span>
            </div>
          </div>
        )}
      </div>

      {/* Grille des cours */}
      <div style={styles.gridContainer}>
        {weekDays.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: isDark ? '#1e293b' : 'white', borderRadius: '16px' }}>
            <p style={{ color: isDark ? '#94a3b8' : '#94a3b8' }}>Aucune semaine sélectionnée</p>
          </div>
        ) : (
          weekDays.map((day, index) => {
            const dayCourses = getCoursesByDayAndDate(day.dayName);
            const passed = isDayPassed(day.date);
            
            return (
              <div key={index} style={{
                ...styles.dayCard,
                opacity: passed ? 0.6 : 1,
              }}>
                <div style={styles.dayCardHeader}>
                  <div>
                    <div style={styles.dayName}>{day.dayName}</div>
                    <div style={styles.dayDate}>{day.formattedDate}</div>
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
                        <div style={styles.courseInfo}>
                          <ClockIcon size={12} /> {c.heure_debut?.substring(0,5) || ''} - {c.heure_fin?.substring(0,5) || ''}
                        </div>
                        <div style={styles.courseInfo}>
                          <User size={12} /> {getProfName(c.user_id)}
                        </div>
                        <div style={styles.courseInfo}>
                          <DoorOpen size={12} /> {getSalleName(c.salle_id)}
                        </div>
                        <div style={styles.courseMeta}>
                          <span style={styles.courseBadge}>
                            <GraduationCap size={10} style={{ marginRight: '2px' }} /> {c.niveau}
                          </span>
                          <span style={styles.courseBadge}>
                            <BookOpen size={10} style={{ marginRight: '2px' }} /> {c.parcours?.substring(0,12)}
                          </span>
                        </div>
                        
                        <div style={styles.actionButtons}>
                          <button onClick={() => handleEdit(c)} style={styles.editBtn} title="Modifier le cours">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(c.id, c.matiere)} style={styles.deleteBtn} title="Supprimer le cours">
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

      {/* Modal de confirmation */}
      {confirmationModal.show && (
        <div style={styles.modalOverlay} onClick={closeConfirmationModal}>
          <div style={styles.confirmationModalContent} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: confirmationModal.action === 'delete' ? '#fee2e2' : '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                {confirmationModal.action === 'delete' 
                  ? <Trash2 size={30} color="#dc2626" />
                  : <Edit2 size={30} color="#3b82f6" />
                }
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                {confirmationModal.action === 'delete' ? 'Confirmer la suppression' : 'Confirmer la modification'}
              </h3>
              <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '15px', lineHeight: '1.6' }}>
                {confirmationModal.action === 'delete' 
                  ? `Êtes-vous sûr de vouloir supprimer le cours "${confirmationModal.courseName}" ?`
                  : `Êtes-vous sûr de vouloir modifier le cours "${confirmationModal.courseName}" ?`
                }
              </p>
              <p style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: '13px', marginTop: '8px' }}>
                Cette action est {confirmationModal.action === 'delete' ? 'irréversible' : 'permanente'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={closeConfirmationModal} style={styles.cancelBtn}>
                <X size={18} /> Non, annuler
              </button>
              <button 
                onClick={confirmationModal.action === 'delete' ? executeDelete : executeUpdate} 
                style={{
                  ...styles.saveBtn,
                  background: confirmationModal.action === 'delete' 
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
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
              <button onClick={closeModal} style={styles.modalClose}>
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
                  {editId ? <Edit2 size={22} color="white" /> : <Plus size={22} color="white" />}
                </div>
                <div>
                  <h3 style={styles.modalTitle}>{editId ? 'Modifier le cours' : 'Ajouter un cours'}</h3>
                  <p style={styles.modalSubtitle}>Semaine du {getWeekRange()}</p>
                </div>
              </div>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>📚 Matière *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Algorithmique avancée" 
                  value={form.matiere} 
                  onChange={e => setForm({ ...form, matiere: e.target.value })} 
                  style={styles.input} 
                />
              </div>

              <div style={styles.grid2}>
                <div>
                  <label style={styles.label}>🎓 Niveau *</label>
                  <select value={form.niveau} onChange={e => setForm({ ...form, niveau: e.target.value })} style={styles.select}>
                    {NIVEAUX.map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.label}>📖 Parcours *</label>
                  <select value={form.parcours} onChange={e => setForm({ ...form, parcours: e.target.value })} style={styles.select}>
                    {PARCOURS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>📅 Jour *</label>
                <select value={form.jour} onChange={e => setForm({ ...form, jour: e.target.value })} style={styles.select}>
                  {JOURS.map(j => {
                    const dayData = weekDays.find(d => d.dayName === j);
                    const isPassed = dayData ? isDayPassed(dayData.date) : false;
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
                  <label style={styles.label}>⏰ Heure début *</label>
                  <input type="time" value={form.heure_debut} onChange={e => setForm({ ...form, heure_debut: e.target.value })} style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>⏰ Heure fin *</label>
                  <input type="time" value={form.heure_fin} onChange={e => setForm({ ...form, heure_fin: e.target.value })} style={styles.input} />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>👨‍🏫 Professeur *</label>
                <select value={form.user_id} onChange={e => setForm({ ...form, user_id: parseInt(e.target.value) })} style={styles.select}>
                  <option value="">Sélectionner un professeur</option>
                  {profs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>🚪 Salle *</label>
                <select value={form.salle_id} onChange={e => setForm({ ...form, salle_id: parseInt(e.target.value) })} style={styles.select}>
                  <option value="">Sélectionner une salle</option>
                  {salles.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={closeModal} style={styles.cancelBtn}>Annuler</button>
              <button 
                onClick={handleSave} 
                disabled={!form.matiere || !form.user_id || !form.salle_id}
                style={{
                  ...styles.saveBtn,
                  opacity: (!form.matiere || !form.user_id || !form.salle_id) ? 0.5 : 1,
                  cursor: (!form.matiere || !form.user_id || !form.salle_id) ? 'not-allowed' : 'pointer'
                }}
              >
                <Save size={16} /> {editId ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'envoi d'email */}
      {showEmailModal && (
        <div style={styles.modalOverlay} onClick={() => setShowEmailModal(false)}>
          <div style={styles.emailModalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <button onClick={() => setShowEmailModal(false)} style={styles.modalClose}>
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
                  <Mail size={22} color="white" />
                </div>
                <div>
                  <h3 style={styles.modalTitle}>Envoi de l'emploi du temps</h3>
                  <p style={styles.modalSubtitle}>Envoyer par email aux étudiants</p>
                </div>
              </div>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.emailInfo}>
                <FileText size={16} />
                <span>Semaine du {getWeekRange()} - {filteredCourses.length} cours programmés</span>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>📧 Objet</label>
                <input 
                  type="text" 
                  value={emailData.subject} 
                  onChange={(e) => setEmailData({...emailData, subject: e.target.value})} 
                  style={styles.input} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>📝 Aperçu du message</label>
                <div style={{
                  padding: '12px',
                  border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                  borderRadius: '10px',
                  background: isDark ? '#0f172a' : '#f8fafc',
                  maxHeight: '120px',
                  overflow: 'auto',
                  fontSize: '12px',
                  color: isDark ? '#94a3b8' : '#64748b',
                }}>
                  {emailData.message.replace(/<[^>]*>/g, '').substring(0, 300)}...
                </div>
              </div>

              <div style={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={styles.label}>👥 Destinataires ({emailData.recipients.length})</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={selectAllStudents} style={styles.smallButton}>
                      <Users size={12} /> Tous
                    </button>
                    <button onClick={deselectAllStudents} style={styles.smallButton}>Aucun</button>
                  </div>
                </div>
                <div style={styles.studentsList}>
                  {availableEtudiants.length === 0 ? (
                    <div style={styles.emptyState}>Aucun étudiant trouvé</div>
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
                        />
                        <div>
                          <div style={{ fontWeight: 500 }}>{etudiant.nom}</div>
                          <div style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>{etudiant.email}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>
                          {etudiant.niveau} - {etudiant.parcours}
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setShowEmailModal(false)} style={styles.cancelBtn}>Annuler</button>
              <button 
                onClick={handleSendEmails} 
                disabled={sendingEmail || emailData.recipients.length === 0} 
                style={{
                  ...styles.saveBtn,
                  background: '#10b981',
                  opacity: (sendingEmail || emailData.recipients.length === 0) ? 0.5 : 1,
                }}
              >
                <Send size={16} /> {sendingEmail ? 'Envoi...' : `Envoyer (${emailData.recipients.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

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
        
        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
        }
        .nav-btn:hover {
          background: ${isDark ? '#475569' : '#e2e8f0'};
        }
        .current-week-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
        }
        .export-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
        }
        .email-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
        }
        .filter-btn:hover {
          transform: translateY(-2px);
        }
        .reset-btn:hover {
          background: ${isDark ? '#475569' : '#e2e8f0'};
        }
        .edit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
        }
        .delete-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
        }
        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
        }
        .cancel-btn:hover {
          background: ${isDark ? '#334155' : '#f1f5f9'};
        }
        .modal-close:hover {
          background: rgba(255,255,255,0.3);
        }
        .theme-btn:hover {
          transform: translateY(-2px);
        }
        .course-card:hover {
          transform: translateY(-2px);
          box-shadow: ${isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)'};
        }
        .day-card:hover {
          transform: translateY(-2px);
          box-shadow: ${isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)'};
        }
        .student-checkbox:hover {
          background: ${isDark ? '#0f172a' : '#f8fafc'};
        }
        
        .modal-body::-webkit-scrollbar,
        .course-list::-webkit-scrollbar,
        .students-list::-webkit-scrollbar {
          width: 4px;
        }
        .modal-body::-webkit-scrollbar-track,
        .course-list::-webkit-scrollbar-track,
        .students-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .modal-body::-webkit-scrollbar-thumb,
        .course-list::-webkit-scrollbar-thumb,
        .students-list::-webkit-scrollbar-thumb {
          background: ${isDark ? '#475569' : '#cbd5e1'};
          border-radius: 4px;
        }
        .modal-body::-webkit-scrollbar-thumb:hover,
        .course-list::-webkit-scrollbar-thumb:hover,
        .students-list::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? '#64748b' : '#94a3b8'};
        }

        @media (max-width: 1200px) {
          .grid-container {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          .container { padding: 16px; }
          .header-section { flex-direction: column; align-items: stretch; }
          .header-actions { flex-direction: column; }
          .nav-row { flex-direction: column; align-items: stretch; }
          .nav-left { flex-wrap: wrap; }
          .nav-right { flex-wrap: wrap; }
          .grid-container { grid-template-columns: repeat(2, 1fr); }
          .grid2 { grid-template-columns: 1fr; }
          .filters-grid { grid-template-columns: 1fr; }
          .modal-content { width: 95%; }
          .email-modal-content { width: 95%; }
        }
        @media (max-width: 480px) {
          .grid-container { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}