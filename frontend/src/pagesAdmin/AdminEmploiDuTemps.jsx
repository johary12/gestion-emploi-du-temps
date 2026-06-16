// src/pagesAdmin/AdminEmploitudtemps.jsx - Version avec charte graphique
import { useState, useEffect } from 'react';
import { edtService, profService, salleService, etudiantService, emailService } from '../services/api';
import { 
  Plus, Calendar, Clock, User, MapPin, ChevronLeft, ChevronRight, 
  Search, Filter, X, Download, Mail, FileText, CheckCircle, AlertCircle,
  GraduationCap, Users, BookOpen, Settings
} from 'lucide-react';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const NIVEAUX = ['L1', 'L2', 'L3', 'M1', 'M2'];
const PARCOURS = ['Génie Logiciel', 'Réseaux & Télécoms', "Systèmes d'Information", 'Sécurité Informatique'];

export default function AdminEmploitudtemps() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [profs, setProfs] = useState([]);
  const [salles, setSalles] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Gestion de la semaine
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStartDate(new Date()));
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
  const [emailStatus, setEmailStatus] = useState({ show: false, type: '', message: '' });
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    recipients: []
  });
  const [availableEtudiants, setAvailableEtudiants] = useState([]);

  const [form, setForm] = useState({
    matiere: '',
    niveau: 'L1',
    parcours: 'Génie Logiciel',
    jour: 'Lundi',
    heure_debut: '08:00',
    heure_fin: '10:00',
    user_id: '',
    salle_id: '',
    date_debut_semaine: getWeekStartDate(new Date()).toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
    loadEtudiants();
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      updateWeekDays(currentWeekStart);
      filterCoursesByWeek();
    }
  }, [courses, currentWeekStart, filters]);

  function getWeekStartDate(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function getWeekDates(startDate) {
    const week = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      week.push({
        date: date,
        dayName: JOURS[i],
        formattedDate: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        isoDate: date.toISOString().split('T')[0]
      });
    }
    return week;
  }

  function updateWeekDays(date) {
    const dates = getWeekDates(date);
    setWeekDays(dates);
  }

  function filterCoursesByWeek() {
    const weekStartDate = currentWeekStart.toISOString().split('T')[0];
    
    let filtered = courses.filter(course => {
      if (!course.date_debut_semaine) return false;
      return course.date_debut_semaine === weekStartDate;
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
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  }

  function nextWeek() {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  }

  function goToCurrentWeek() {
    setCurrentWeekStart(getWeekStartDate(new Date()));
  }

  function handleSearchWeek() {
    if (!searchDate) return;
    const date = new Date(searchDate);
    if (!isNaN(date.getTime())) {
      setCurrentWeekStart(getWeekStartDate(date));
      setShowWeekSearch(false);
      setSearchDate('');
    }
  }

  function getWeekRange() {
    if (weekDays.length === 0) return '';
    const start = weekDays[0].formattedDate;
    const end = weekDays[5].formattedDate;
    return `${start} - ${end}`;
  }

  const loadData = async () => {
    try {
      const [coursesRes, profsRes, sallesRes] = await Promise.all([
        edtService.getAll(),
        profService.getAll(),
        salleService.getAll(),
      ]);
      setCourses(coursesRes.data || []);
      setProfs(profsRes.data || []);
      setSalles(sallesRes.data || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
      showNotification('Erreur lors du chargement des données', 'error');
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

  const generatePDFHTML = () => {
    const weekRange = getWeekRange();
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Emploi du temps - Semaine du ${weekRange}</title>
        <style>
          body {
            font-family: 'Inter', Arial, sans-serif;
            margin: 40px;
            color: #1e293b;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2563eb;
          }
          .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 24px;
          }
          .header p {
            color: #64748b;
            margin: 10px 0 0;
          }
          .filters-info {
            background: #f8fafc;
            padding: 12px 16px;
            margin-bottom: 20px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
            font-size: 13px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            background: #2563eb;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          td {
            border: 1px solid #e2e8f0;
            padding: 12px;
            vertical-align: top;
          }
          .course {
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid #f1f5f9;
          }
          .course:last-child {
            border-bottom: none;
          }
          .course-title {
            font-weight: 600;
            color: #2563eb;
          }
          .course-info {
            font-size: 12px;
            color: #64748b;
            margin-top: 4px;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            background: #eff6ff;
            color: #2563eb;
            border-radius: 12px;
            font-size: 10px;
            margin-right: 4px;
            font-weight: 500;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📅 Emploi du temps - ENI Fianarantsoa</h1>
          <p>Semaine du ${weekRange}</p>
        </div>
    `;

    if (filters.niveau || filters.parcours || filters.prof || filters.salle) {
      html += `<div class="filters-info">
        <strong>Filtres appliqués:</strong> `;
      if (filters.niveau) html += `Niveau: ${filters.niveau} | `;
      if (filters.parcours) html += `Parcours: ${filters.parcours} | `;
      if (filters.prof) {
        const prof = profs.find(p => p.id === parseInt(filters.prof));
        html += `Professeur: ${prof?.name || ''} | `;
      }
      if (filters.salle) {
        const salle = salles.find(s => s.id === parseInt(filters.salle));
        html += `Salle: ${salle?.nom || ''}`;
      }
      html += `</div>`;
    }

    html += `<table>
      <thead>
        <tr><th style="width: 120px;">Jour</th><th style="width: 100px;">Date</th><th>Cours</th></tr>
      </thead>
      <tbody>`;

    weekDays.forEach(day => {
      const dayCourses = filteredCourses.filter(c => c.jour === day.dayName);
      html += `<tr>
        <td><strong>${day.dayName}</strong></td>
        <td>${day.formattedDate}</td>
        <td>`;
      
      if (dayCourses.length === 0) {
        html += `<em style="color: #94a3b8;">Aucun cours</em>`;
      } else {
        dayCourses.forEach(course => {
          html += `<div class="course">
            <div class="course-title">${course.matiere}</div>
            <div class="course-info">
              ⏰ ${course.heure_debut.substring(0,5)} - ${course.heure_fin.substring(0,5)}<br>
              👨‍🏫 ${getProfName(course.user_id)}<br>
              📍 ${getSalleName(course.salle_id)}
            </div>
            <div style="margin-top: 4px;">
              <span class="badge">${course.niveau}</span>
              <span class="badge">${course.parcours}</span>
            </div>
          </div>`;
        });
      }
      
      html += `</td></tr>`;
    });

    html += `</tbody>
        </table>
        <div class="footer">
          <p>Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          <p>ENI Fianarantsoa - Plateforme de gestion des emplois du temps</p>
        </div>
      </body>
      </html>
    `;

    return html;
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const html = generatePDFHTML();
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
      
      showNotification('📄 PDF généré avec succès !', 'success');
    } catch (error) {
      console.error('Erreur export PDF:', error);
      showNotification('Erreur lors de la génération du PDF', 'error');
    } finally {
      setExporting(false);
    }
  };

  const filterEtudiantsByFilters = () => {
    let filtered = [...etudiants];
    if (filters.niveau) {
      filtered = filtered.filter(e => e.niveau === filters.niveau);
    }
    if (filters.parcours) {
      filtered = filtered.filter(e => e.parcours === filters.parcours);
    }
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
    let message = `Bonjour,\n\n`;
    message += `Veuillez trouver ci-dessous l'emploi du temps de la semaine du ${weekRange}.\n\n`;
    message += `--- Récapitulatif des cours ---\n\n`;

    weekDays.forEach(day => {
      const dayCourses = filteredCourses.filter(c => c.jour === day.dayName);
      message += `📅 ${day.dayName} (${day.formattedDate}):\n`;
      if (dayCourses.length === 0) {
        message += `   Aucun cours\n`;
      } else {
        dayCourses.forEach(course => {
          message += `   • ${course.matiere} - ${course.heure_debut.substring(0,5)} à ${course.heure_fin.substring(0,5)}\n`;
          message += `     Professeur: ${getProfName(course.user_id)}\n`;
          message += `     Salle: ${getSalleName(course.salle_id)}\n`;
        });
      }
      message += `\n`;
    });

    message += `---\n`;
    message += `Cordialement,\n`;
    message += `L'administration ENI Fianarantsoa\n\n`;
    message += `*Ce message est un envoi automatique, merci de ne pas y répondre.*`;

    return message;
  };

  const handleSendEmails = async () => {
    if (emailData.recipients.length === 0) {
      showNotification('Aucun étudiant sélectionné', 'error');
      return;
    }

    setSendingEmail(true);
    try {
      const selectedStudents = etudiants.filter(e => emailData.recipients.includes(e.id));
      
      if (selectedStudents.length === 0) {
        showNotification('Les étudiants sélectionnés n\'existent pas', 'error');
        setSendingEmail(false);
        return;
      }

      const coursesData = filteredCourses.map(course => ({
        matiere: course.matiere,
        niveau: course.niveau,
        parcours: course.parcours,
        jour: course.jour,
        heure_debut: course.heure_debut.substring(0, 5),
        heure_fin: course.heure_fin.substring(0, 5),
        prof_name: getProfName(course.user_id),
        salle_name: getSalleName(course.salle_id),
        user_id: course.user_id
      }));

      const response = await emailService.sendEmploiDuTemps({
        subject: emailData.subject,
        message: emailData.message,
        recipients: emailData.recipients,
        weekRange: getWeekRange(),
        courses: coursesData,
        weekStart: currentWeekStart.toISOString().split('T')[0]
      });

      if (response.success) {
        showNotification(response.message || '📧 Emails envoyés avec succès !', 'success');
        setTimeout(() => {
          setShowEmailModal(false);
        }, 2000);
      } else {
        showNotification(response.message || 'Erreur lors de l\'envoi', 'error');
      }
      
    } catch (error) {
      console.error('Erreur envoi emails:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'envoi des emails';
      showNotification(errorMessage, 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  const showNotification = (message, type) => {
    setEmailStatus({ show: true, type, message });
    setTimeout(() => {
      setEmailStatus({ show: false, type: '', message: '' });
    }, 4000);
  };

  const selectAllStudents = () => {
    setEmailData({
      ...emailData,
      recipients: availableEtudiants.map(e => e.id)
    });
  };

  const deselectAllStudents = () => {
    setEmailData({
      ...emailData,
      recipients: []
    });
  };

  const getProfName = (id) => {
    const prof = profs.find(p => p.id === id);
    return prof?.name || '—';
  };

  const getSalleName = (id) => {
    const salle = salles.find(s => s.id === id);
    return salle?.nom || '—';
  };

  const getCoursesByDayAndDate = (dayName, date) => {
    return filteredCourses.filter(c => c.jour === dayName);
  };

  const resetFilters = () => {
    setFilters({
      niveau: '',
      parcours: '',
      prof: '',
      salle: ''
    });
  };

  const handleSave = async () => {
    try {
      if (!form.matiere || !form.user_id || !form.salle_id) {
        showNotification('Veuillez remplir tous les champs obligatoires', 'error');
        return;
      }

      const courseData = {
        matiere: form.matiere,
        niveau: form.niveau,
        parcours: form.parcours,
        jour: form.jour,
        heure_debut: form.heure_debut,
        heure_fin: form.heure_fin,
        user_id: parseInt(form.user_id),
        salle_id: parseInt(form.salle_id),
        date_debut_semaine: form.date_debut_semaine
      };
      
      if (editId) {
        await edtService.update(editId, courseData);
        showNotification('✅ Cours modifié avec succès', 'success');
      } else {
        await edtService.create(courseData);
        showNotification('✅ Cours ajouté avec succès', 'success');
      }
      await loadData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      showNotification('Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('⚠️ Supprimer ce cours ?')) {
      try {
        await edtService.delete(id);
        await loadData();
        showNotification('✅ Cours supprimé avec succès', 'success');
      } catch (error) {
        console.error('Erreur suppression:', error);
        showNotification('Erreur lors de la suppression', 'error');
      }
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
      date_debut_semaine: course.date_debut_semaine
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditId(null);
    setForm({
      matiere: '',
      niveau: 'L1',
      parcours: 'Génie Logiciel',
      jour: 'Lundi',
      heure_debut: '08:00',
      heure_fin: '10:00',
      user_id: '',
      salle_id: '',
      date_debut_semaine: currentWeekStart.toISOString().split('T')[0]
    });
  };

  return (
    <div style={styles.container}>
      {/* Notification de statut */}
      {emailStatus.show && (
        <div style={{
          ...styles.statusNotification,
          backgroundColor: emailStatus.type === 'success' ? '#10b981' : '#ef4444',
        }}>
          {emailStatus.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span style={styles.statusMessage}>{emailStatus.message}</span>
        </div>
      )}

      {/* En-tête */}
      <div style={styles.headerSection}>
        <div>
          <h1 style={styles.pageTitle}>📅 Emploi du temps</h1>
          <p style={styles.pageSubtitle}>Gestion des cours et planning hebdomadaire</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={styles.addButton}
        >
          <Plus size={18} />
          Ajouter un cours
        </button>
      </div>

      {/* Navigation semaine */}
      <div style={styles.navigationCard}>
        <div style={styles.navigationContainer}>
          <div style={styles.navigationControls}>
            <button onClick={previousWeek} style={styles.navButton}>
              <ChevronLeft size={20} />
            </button>
            <button onClick={goToCurrentWeek} style={styles.currentWeekButton}>
              Aujourd'hui
            </button>
            <button onClick={nextWeek} style={styles.navButton}>
              <ChevronRight size={20} />
            </button>
            <div style={styles.weekInfo}>
              <Calendar size={16} />
              <span style={styles.weekRange}>{getWeekRange()}</span>
            </div>
          </div>
          
          <div style={styles.actionsContainer}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowWeekSearch(!showWeekSearch)} style={styles.searchButton}>
                <Search size={18} />
                Rechercher
              </button>
              {showWeekSearch && (
                <div style={styles.searchDropdown}>
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    style={styles.searchInput}
                    placeholder="Sélectionner une date"
                  />
                  <button onClick={handleSearchWeek} style={styles.searchSubmit}>OK</button>
                  <button onClick={() => setShowWeekSearch(false)} style={styles.searchClose}>
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              style={{
                ...styles.filterButton,
                backgroundColor: showFilters ? '#2563eb' : '#f8fafc',
                color: showFilters ? 'white' : '#475569',
                borderColor: showFilters ? '#2563eb' : '#e2e8f0'
              }}
            >
              <Filter size={18} />
              Filtres
            </button>

            <button onClick={handleExportPDF} disabled={exporting} style={styles.exportButton}>
              <Download size={18} />
              {exporting ? 'Génération...' : 'PDF'}
            </button>

            <button 
              onClick={openEmailModal} 
              disabled={filteredCourses.length === 0} 
              style={{
                ...styles.emailButton,
                opacity: filteredCourses.length === 0 ? 0.5 : 1,
                cursor: filteredCourses.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <Mail size={18} />
              Envoyer
            </button>
          </div>
        </div>

        {/* Filtres */}
        {showFilters && (
          <div style={styles.filtersPanel}>
            <div style={styles.filtersGrid}>
              <select value={filters.niveau} onChange={(e) => setFilters({...filters, niveau: e.target.value})} style={styles.filterSelect}>
                <option value="">Tous niveaux</option>
                {NIVEAUX.map(n => <option key={n}>{n}</option>)}
              </select>
              
              <select value={filters.parcours} onChange={(e) => setFilters({...filters, parcours: e.target.value})} style={styles.filterSelect}>
                <option value="">Tous parcours</option>
                {PARCOURS.map(p => <option key={p}>{p}</option>)}
              </select>
              
              <select value={filters.prof} onChange={(e) => setFilters({...filters, prof: e.target.value})} style={styles.filterSelect}>
                <option value="">Tous professeurs</option>
                {profs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              
              <select value={filters.salle} onChange={(e) => setFilters({...filters, salle: e.target.value})} style={styles.filterSelect}>
                <option value="">Toutes salles</option>
                {salles.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
            </div>
            <div style={styles.filterActions}>
              <button onClick={resetFilters} style={styles.resetButton}>
                Réinitialiser
              </button>
              <span style={styles.filterResult}>
                <strong>{filteredCourses.length}</strong> cours trouvés
              </span>
            </div>
          </div>
        )}
      </div>

      {/* En-tête des jours */}
      <div style={styles.daysHeader}>
        {weekDays.map((day, index) => (
          <div key={index} style={styles.dayHeader}>
            <div style={styles.dayName}>{day.dayName}</div>
            <div style={styles.dayDate}>{day.formattedDate}</div>
          </div>
        ))}
      </div>

      {/* Grille des cours */}
      <div style={styles.coursesGrid}>
        {weekDays.map((day, index) => {
          const dayCourses = getCoursesByDayAndDate(day.dayName, day.date);
          return (
            <div key={index} style={styles.dayCard}>
              <div style={styles.dayCardHeader}>
                <span style={styles.dayCardTitle}>{day.dayName}</span>
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
                        <Clock size={12} /> {c.heure_debut.substring(0,5)} - {c.heure_fin.substring(0,5)}
                      </div>
                      <div style={styles.courseInfo}>
                        <User size={12} /> {getProfName(c.user_id)}
                      </div>
                      <div style={styles.courseInfo}>
                        <MapPin size={12} /> {getSalleName(c.salle_id)}
                      </div>
                      <div style={styles.courseMeta}>
                        <span style={styles.courseBadge}>{c.niveau}</span>
                        <span style={styles.courseBadge}>{c.parcours?.substring(0,15)}</span>
                      </div>
                      <div style={styles.courseActions}>
                        <button onClick={() => handleEdit(c)} style={styles.editButton}>
                          ✏️ Modifier
                        </button>
                        <button onClick={() => handleDelete(c.id)} style={styles.deleteButton}>
                          🗑️ Supprimer
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal d'ajout/modification */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editId ? '✏️ Modifier le cours' : '➕ Ajouter un cours'}
              </h3>
              <button onClick={() => setShowModal(false)} style={styles.modalClose}>
                <X size={20} />
              </button>
            </div>
            <p style={styles.weekInfoText}>📅 Semaine du {getWeekRange()}</p>
            
            <input 
              type="text" 
              placeholder="Matière *" 
              value={form.matiere} 
              onChange={e => setForm({ ...form, matiere: e.target.value })} 
              style={styles.input} 
              required 
            />
            
            <select value={form.niveau} onChange={e => setForm({ ...form, niveau: e.target.value })} style={styles.input}>
              {NIVEAUX.map(n => <option key={n}>{n}</option>)}
            </select>
            
            <select value={form.parcours} onChange={e => setForm({ ...form, parcours: e.target.value })} style={styles.input}>
              {PARCOURS.map(p => <option key={p}>{p}</option>)}
            </select>
            
            <select value={form.jour} onChange={e => setForm({ ...form, jour: e.target.value })} style={styles.input}>
              {JOURS.map(j => <option key={j}>{j}</option>)}
            </select>
            
            <div style={styles.timeContainer}>
              <input type="time" value={form.heure_debut} onChange={e => setForm({ ...form, heure_debut: e.target.value })} style={{ ...styles.input, flex: 1 }} />
              <span style={styles.timeSeparator}>à</span>
              <input type="time" value={form.heure_fin} onChange={e => setForm({ ...form, heure_fin: e.target.value })} style={{ ...styles.input, flex: 1 }} />
            </div>
            
            <select value={form.user_id} onChange={e => setForm({ ...form, user_id: parseInt(e.target.value) })} style={styles.input}>
              <option value="">Choisir un professeur *</option>
              {profs.map(p => <option key={p.id} value={p.id}>{p.name} - {p.specialite}</option>)}
            </select>
            
            <select value={form.salle_id} onChange={e => setForm({ ...form, salle_id: parseInt(e.target.value) })} style={styles.input}>
              <option value="">Choisir une salle *</option>
              {salles.map(s => <option key={s.id} value={s.id}>{s.nom} (Cap: {s.capacite})</option>)}
            </select>
            
            <div style={styles.modalActions}>
              <button onClick={() => setShowModal(false)} style={styles.cancelButton}>
                Annuler
              </button>
              <button onClick={handleSave} style={styles.saveButton}>
                {editId ? '💾 Modifier' : '💾 Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'envoi d'email */}
      {showEmailModal && (
        <div style={styles.modalOverlay} onClick={() => setShowEmailModal(false)}>
          <div style={{...styles.modalContent, maxWidth: '700px'}} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>📧 Envoyer l'emploi du temps</h3>
              <button onClick={() => setShowEmailModal(false)} style={styles.modalClose}>
                <X size={20} />
              </button>
            </div>
            
            <div style={styles.emailInfo}>
              <FileText size={16} />
              <span>Semaine du {getWeekRange()} - <strong>{filteredCourses.length}</strong> cours</span>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Objet de l'email</label>
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Message personnalisé</label>
              <textarea
                value={emailData.message}
                onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                style={{...styles.input, minHeight: '150px', resize: 'vertical'}}
              />
            </div>

            <div style={styles.formGroup}>
              <div style={styles.recipientsHeader}>
                <label style={styles.label}>Destinataires</label>
                <span style={styles.recipientsCount}>
                  {emailData.recipients.length} sélectionné(s)
                </span>
                <div style={styles.recipientsActions}>
                  <button onClick={selectAllStudents} style={styles.smallButton}>Tous</button>
                  <button onClick={deselectAllStudents} style={styles.smallButton}>Aucun</button>
                </div>
              </div>
              
              <div style={styles.studentsList}>
                {availableEtudiants.length === 0 ? (
                  <div style={styles.emptyState}>
                    Aucun étudiant trouvé avec les filtres actuels
                  </div>
                ) : (
                  availableEtudiants.map(etudiant => (
                    <label key={etudiant.id} style={styles.studentCheckbox}>
                      <input
                        type="checkbox"
                        checked={emailData.recipients.includes(etudiant.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEmailData({
                              ...emailData,
                              recipients: [...emailData.recipients, etudiant.id]
                            });
                          } else {
                            setEmailData({
                              ...emailData,
                              recipients: emailData.recipients.filter(id => id !== etudiant.id)
                            });
                          }
                        }}
                      />
                      <div style={styles.studentInfo}>
                        <div style={styles.studentName}>{etudiant.nom}</div>
                        <div style={styles.studentEmail}>{etudiant.email}</div>
                        <div style={styles.studentMeta}>
                          {etudiant.niveau} - {etudiant.parcours}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div style={styles.modalActions}>
              <button onClick={() => setShowEmailModal(false)} style={styles.cancelButton}>
                Annuler              </button>
              <button 
                onClick={handleSendEmails} 
                disabled={sendingEmail || emailData.recipients.length === 0}
                style={{
                  ...styles.saveButton,
                  backgroundColor: '#10b981',
                  opacity: (sendingEmail || emailData.recipients.length === 0) ? 0.5 : 1,
                  cursor: (sendingEmail || emailData.recipients.length === 0) ? 'not-allowed' : 'pointer'
                }}
              >
                <Mail size={16} />
                {sendingEmail ? 'Envoi en cours...' : `Envoyer à ${emailData.recipients.length} étudiant(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles avec charte graphique
const styles = {
  container: {
    padding: '24px 32px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: '"Inter", "Poppins", "Roboto", -apple-system, sans-serif',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
  },
  
  // Header
  headerSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1e293b',
    margin: 0,
    fontFamily: '"Poppins", "Inter", sans-serif',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '4px 0 0',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
  },
  
  // Navigation
  navigationCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  navigationContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  navigationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  navButton: {
    padding: '8px 12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    color: '#475569',
  },
  currentWeekButton: {
    padding: '8px 20px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '13px',
    transition: 'all 0.2s ease',
  },
  weekInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  weekRange: {
    fontWeight: 500,
    color: '#1e293b',
    fontSize: '14px',
  },
  actionsContainer: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  searchButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    color: '#475569',
    transition: 'all 0.2s ease',
  },
  searchDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '12px',
    display: 'flex',
    gap: '8px',
    zIndex: 100,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
  },
  searchInput: {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none',
  },
  searchSubmit: {
    padding: '8px 16px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  searchClose: {
    padding: '8px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '13px',
    transition: 'all 0.2s ease',
  },
  emailButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#7c3aed',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '13px',
    transition: 'all 0.2s ease',
  },
  
  // Filters
  filtersPanel: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e2e8f0',
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '12px',
  },
  filterSelect: {
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: 'white',
    fontSize: '13px',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  filterActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resetButton: {
    padding: '6px 16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500,
    color: '#475569',
    transition: 'all 0.2s ease',
  },
  filterResult: {
    fontSize: '14px',
    color: '#64748b',
  },
  
  // Days Header
  daysHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '16px',
    marginBottom: '16px',
  },
  dayHeader: {
    textAlign: 'center',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
  },
  dayName: {
    fontWeight: 600,
    color: '#1e293b',
    fontSize: '14px',
  },
  dayDate: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px',
  },
  
  // Courses Grid
  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '16px',
  },
  dayCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '580px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s ease',
  },
  dayCardHeader: {
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 600,
    color: '#1e293b',
  },
  dayCardTitle: {
    fontSize: '14px',
  },
  courseCount: {
    padding: '2px 10px',
    borderRadius: '20px',
    backgroundColor: '#e2e8f0',
    fontSize: '12px',
    fontWeight: 600,
    color: '#475569',
  },
  courseList: {
    padding: '12px',
    flex: 1,
    overflowY: 'auto',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#94a3b8',
    fontSize: '14px',
  },
  
  // Course Card
  courseCard: {
    padding: '12px',
    marginBottom: '10px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease',
  },
  courseTitle: {
    fontWeight: 600,
    marginBottom: '6px',
    fontSize: '14px',
    color: '#1e293b',
  },
  courseInfo: {
    fontSize: '12px',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '4px',
  },
  courseMeta: {
    display: 'flex',
    gap: '6px',
    marginTop: '8px',
    marginBottom: '8px',
    flexWrap: 'wrap',
  },
  courseBadge: {
    fontSize: '10px',
    padding: '2px 10px',
    backgroundColor: '#e2e8f0',
    borderRadius: '12px',
    color: '#475569',
    fontWeight: 500,
  },
  courseActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
  editButton: {
    padding: '4px 12px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  deleteButton: {
    padding: '4px 12px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  
  // Modal
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    width: '500px',
    maxWidth: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
    animation: 'scaleIn 0.25s ease-out',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
    fontFamily: '"Poppins", "Inter", sans-serif',
  },
  modalClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '4px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
  },
  weekInfoText: {
    fontSize: '13px',
    color: '#2563eb',
    marginBottom: '16px',
    padding: '8px 12px',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    marginBottom: '10px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  timeContainer: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '10px',
  },
  timeSeparator: {
    color: '#64748b',
    fontSize: '14px',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '16px',
  },
  cancelButton: {
    padding: '10px 24px',
    borderRadius: '40px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    color: '#475569',
    transition: 'all 0.2s ease',
  },
  saveButton: {
    padding: '10px 24px',
    borderRadius: '40px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  
  // Email Modal
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#1e293b',
    marginBottom: '8px',
  },
  emailInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: '#f0fdf4',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    color: '#166534',
    border: '1px solid #bbf7d0',
  },
  recipientsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
    flexWrap: 'wrap',
  },
  recipientsCount: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#2563eb',
    padding: '2px 10px',
    backgroundColor: '#eff6ff',
    borderRadius: '12px',
  },
  recipientsActions: {
    display: 'flex',
    gap: '6px',
    marginLeft: 'auto',
  },
  smallButton: {
    padding: '4px 12px',
    fontSize: '12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: '#475569',
    fontWeight: 500,
  },
  studentsList: {
    maxHeight: '250px',
    overflowY: 'auto',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '4px',
  },
  studentCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9',
    transition: 'all 0.2s ease',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontWeight: 500,
    color: '#1e293b',
    fontSize: '14px',
  },
  studentEmail: {
    fontSize: '12px',
    color: '#64748b',
  },
  studentMeta: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '2px',
  },
  
  // Notification
  statusNotification: {
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
  statusMessage: {
    fontSize: '14px',
    fontWeight: 500,
  },
};

// Animations
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(-10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    .add-button:hover {
      background-color: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(37, 99, 235, 0.3);
    }
    
    .nav-button:hover {
      background-color: #e2e8f0;
    }
    
    .current-week-button:hover {
      background-color: #1d4ed8;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
    }
    
    .search-button:hover {
      background-color: #e2e8f0;
    }
    
    .filter-button:hover {
      border-color: #2563eb;
    }
    
    .export-button:hover {
      background-color: #047857;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);
    }
    
    .email-button:hover:not(:disabled) {
      background-color: #6d28d9;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(124, 58, 237, 0.3);
    }
    
    .day-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }
    
    .course-card:hover {
      background-color: white;
      border-color: #2563eb;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
    }
    
    .edit-button:hover {
      background-color: #dbeafe;
    }
    
    .delete-button:hover {
      background-color: #fecaca;
    }
    
    .input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    
    .filter-select:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    
    .cancel-button:hover {
      background-color: #f8fafc;
    }
    
    .save-button:hover {
      background-color: #1d4ed8;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
    }
    
    .reset-button:hover {
      background-color: #e2e8f0;
    }
    
    .small-button:hover {
      background-color: #e2e8f0;
    }
    
    .student-checkbox:hover {
      background-color: #f8fafc;
    }
    
    .modal-close:hover {
      background-color: #f1f5f9;
    }
    
    .search-close:hover {
      background-color: #e2e8f0;
    }
    
    /* Scrollbar */
    .course-list::-webkit-scrollbar,
    .students-list::-webkit-scrollbar {
      width: 4px;
    }
    
    .course-list::-webkit-scrollbar-track,
    .students-list::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .course-list::-webkit-scrollbar-thumb,
    .students-list::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
    
    .course-list::-webkit-scrollbar-thumb:hover,
    .students-list::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    
    @media (max-width: 1024px) {
      .days-header, .courses-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    
    @media (max-width: 640px) {
      .container {
        padding: 16px;
      }
      
      .days-header, .courses-grid {
        grid-template-columns: 1fr;
      }
      
      .day-card {
        height: auto;
        max-height: 400px;
      }
      
      .header-section {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .navigation-container {
        flex-direction: column;
        align-items: stretch;
      }
      
      .navigation-controls {
        flex-wrap: wrap;
        justify-content: center;
      }
      
      .actions-container {
        justify-content: center;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}