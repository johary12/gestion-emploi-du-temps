// src/pages/PublicEmploiDuTemps.jsx - Version avec export PDF et envoi email
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { publicService } from '../services/api';
import { 
  Calendar, Clock, User, MapPin, Filter, ChevronLeft, ChevronRight,
  School, GraduationCap, AlertCircle, LogIn, FileText, Mail, X
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const NIVEAUX = ['L1', 'L2', 'L3', 'M1', 'M2'];
const PARCOURS = ['Génie Logiciel', 'Réseaux & Télécoms', "Systèmes d'Information", 'Sécurité Informatique'];

export default function PublicEmploiDuTemps() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStartDate(new Date()));
  const [filters, setFilters] = useState({ niveau: '', parcours: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  
  const edtRef = useRef(null);

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
        date, 
        dayName: JOURS[i], 
        formattedDate: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      });
    }
    return week;
  }

  const weekDays = getWeekDates(currentWeekStart);

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
  
  function getWeekRange() { 
    return weekDays.length ? `${weekDays[0].formattedDate} - ${weekDays[5].formattedDate}` : ''; 
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await publicService.getEmploi(filters.niveau, filters.parcours);
      const data = Array.isArray(response.data) ? response.data : [];
      setCourses(data);
      setFilteredCourses(data);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les données.');
      setCourses([]);
      setFilteredCourses([]);
    } finally {
      setLoading(false);
    }
  }, [filters.niveau, filters.parcours]);

  const applyFilters = useCallback(() => {
    const coursesArray = Array.isArray(courses) ? courses : [];
    let filtered = [...coursesArray];
    if (filters.niveau) {
      filtered = filtered.filter(c => c && c.niveau === filters.niveau);
    }
    if (filters.parcours) {
      filtered = filtered.filter(c => c && c.parcours === filters.parcours);
    }
    setFilteredCourses(filtered);
  }, [courses, filters.niveau, filters.parcours]);

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  useEffect(() => { 
    applyFilters(); 
  }, [applyFilters]);

  const groupByDay = () => {
    const coursesArray = Array.isArray(filteredCourses) ? filteredCourses : [];
    const grouped = {};
    const weekStartStr = currentWeekStart.toISOString().split('T')[0];
    JOURS.forEach(day => { 
      grouped[day] = coursesArray.filter(c => 
        c && c.jour === day && (!c.date_debut_semaine || c.date_debut_semaine === weekStartStr)
      );
    });
    return grouped;
  };

  // Fonction pour exporter en PDF
  const exportPDF = async () => {
    if (!edtRef.current) return;
    
    try {
      setLoading(true);
      const element = edtRef.current;
      
      // Configuration pour une meilleure qualité
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width * 0.75, canvas.height * 0.75]
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Emploi_du_temps_${getWeekRange().replace(/ /g, '_')}.pdf`);
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      setError('Erreur lors de l\'export du PDF');
      setLoading(false);
    }
  };

  // Fonction pour valider l'email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Fonction pour envoyer par email
  const sendEmail = async () => {
    if (!email) {
      setEmailError('Veuillez saisir votre adresse email');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Veuillez saisir une adresse email valide');
      return;
    }
    
    setEmailSending(true);
    setEmailError('');
    
    try {
      // Récupérer les données de l'emploi du temps
      const groupedCourses = groupByDay();
      const weekRange = getWeekRange();
      
      // Construire le contenu de l'email
      let emailContent = `
        <h2>Emploi du temps - ENI Fianarantsoa</h2>
        <p><strong>Période :</strong> ${weekRange}</p>
        ${filters.niveau ? `<p><strong>Niveau :</strong> ${filters.niveau}</p>` : ''}
        ${filters.parcours ? `<p><strong>Parcours :</strong> ${filters.parcours}</p>` : ''}
        <hr/>
      `;
      
      let hasCourses = false;
      JOURS.forEach(day => {
        const dayCourses = groupedCourses[day] || [];
        if (dayCourses.length > 0) {
          hasCourses = true;
          emailContent += `<h3>${day}</h3><ul>`;
          dayCourses.forEach(course => {
            emailContent += `
              <li>
                <strong>${course.matiere || 'Sans titre'}</strong><br/>
                ⏰ ${course.heure_debut?.substring(0,5) || '--:--'} - ${course.heure_fin?.substring(0,5) || '--:--'}<br/>
                👨‍🏫 ${course.prof || 'À confirmer'}<br/>
                📍 ${course.salle || 'À confirmer'}<br/>
                🏷️ ${course.niveau || 'N/A'} - ${course.parcours || 'N/A'}
              </li>
            `;
          });
          emailContent += `</ul>`;
        }
      });
      
      if (!hasCourses) {
        emailContent += `<p><em>Aucun cours programmé pour cette semaine.</em></p>`;
      }
      
      // Envoyer l'email via l'API
      const response = await publicService.sendEmail({
        to: email,
        subject: `Emploi du temps - ENI Fianarantsoa (${weekRange})`,
        html: emailContent
      });
      
      setEmailSent(true);
      setEmailSending(false);
      
      // Fermer le modal après 3 secondes
      setTimeout(() => {
        setShowEmailModal(false);
        setEmail('');
        setEmailSent(false);
      }, 3000);
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      setEmailError('Erreur lors de l\'envoi de l\'email. Veuillez réessayer.');
      setEmailSending(false);
    }
  };

  const groupedCourses = groupByDay();

  if (loading && !emailSending) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Chargement de l'emploi du temps...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <AlertCircle size={48} style={styles.errorIcon} />
        <h2 style={styles.errorTitle}>Erreur</h2>
        <p style={styles.errorMessage}>{error}</p>
        <button onClick={() => loadData()} style={styles.retryButton}>Réessayer</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Bannière */}
      <div style={styles.heroBanner}>
        <div style={styles.heroOverlay}>
          <div style={styles.heroContent}>
            <div style={styles.heroText}>
              <School size={48} style={styles.heroIcon} />
              <div>
                <h1 style={styles.heroTitle}>ENI Fianarantsoa</h1>
                <p style={styles.heroSubtitle}>École Nationale d'Ingénieurs</p>
              </div>
            </div>
            <Link to="/login" style={styles.loginLink}>
              <button style={styles.loginButton}>
                <LogIn size={18} />
                Espace personnel
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Section EDT */}
      <div style={styles.edtSection}>
        <div style={styles.header}>
          <GraduationCap size={32} style={styles.headerIcon} />
          <div>
            <h2 style={styles.title}>Emploi du temps public</h2>
            <p style={styles.subtitle}>Consultez les emplois du temps par niveau et parcours</p>
          </div>
        </div>

        <div style={styles.navigationBar}>
          <button onClick={previousWeek} style={styles.navButton}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={goToCurrentWeek} style={styles.currentWeekButton}>
            Semaine actuelle
          </button>
          <button onClick={nextWeek} style={styles.navButton}>
            <ChevronRight size={20} />
          </button>
          <div style={styles.weekInfo}>
            <Calendar size={16} />
            <span>{getWeekRange()}</span>
          </div>
          
          {/* Nouveaux boutons */}
          <button onClick={exportPDF} style={styles.exportButton}>
            <FileText size={18} />
            Exporter PDF
          </button>
          
          <button onClick={() => setShowEmailModal(true)} style={styles.emailButton}>
            <Mail size={18} />
            Envoyer par email
          </button>
          
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            style={{
              ...styles.filterButton,
              backgroundColor: showFilters ? '#2563eb' : 'white',
              color: showFilters ? 'white' : '#475569'
            }}
          >
            <Filter size={18} />
            Filtres
          </button>
        </div>

        {showFilters && (
          <div style={styles.filtersPanel}>
            <select 
              value={filters.niveau} 
              onChange={(e) => setFilters({...filters, niveau: e.target.value})} 
              style={styles.select}
            >
              <option value="">Tous niveaux</option>
              {NIVEAUX.map(n => <option key={n}>{n}</option>)}
            </select>
            <select 
              value={filters.parcours} 
              onChange={(e) => setFilters({...filters, parcours: e.target.value})} 
              style={styles.select}
            >
              <option value="">Tous parcours</option>
              {PARCOURS.map(p => <option key={p}>{p}</option>)}
            </select>
            <button 
              onClick={() => setFilters({ niveau: '', parcours: '' })} 
              style={styles.resetButton}
            >
              Réinitialiser
            </button>
          </div>
        )}

        {/* Contenu à exporter en PDF */}
        <div ref={edtRef} style={styles.edtContent}>
          <div style={styles.daysHeader}>
            {weekDays.map((day, idx) => (
              <div key={idx} style={styles.dayHeader}>
                <div style={styles.dayName}>{day.dayName}</div>
                <div style={styles.dayDate}>{day.formattedDate}</div>
              </div>
            ))}
          </div>

          <div style={styles.coursesGrid}>
            {weekDays.map((day, idx) => {
              const dayCourses = groupedCourses[day.dayName] || [];
              return (
                <div key={idx} style={styles.dayCard}>
                  <div style={styles.dayCardHeader}>
                    <span style={styles.dayCardTitle}>{day.dayName}</span>
                    <span style={styles.courseCount}>{dayCourses.length}</span>
                  </div>
                  <div style={styles.courseList}>
                    {dayCourses.length === 0 ? (
                      <div style={styles.emptyState}>Aucun cours</div>
                    ) : (
                      dayCourses.map((course, i) => (
                        <div key={i} style={styles.courseCard}>
                          <div style={styles.courseTitle}>{course.matiere || 'Sans titre'}</div>
                          <div style={styles.courseInfo}>
                            <Clock size={12} /> 
                            {course.heure_debut?.substring(0,5) || '--:--'} - {course.heure_fin?.substring(0,5) || '--:--'}
                          </div>
                          <div style={styles.courseInfo}>
                            <User size={12} /> {course.prof || 'À confirmer'}
                          </div>
                          <div style={styles.courseInfo}>
                            <MapPin size={12} /> {course.salle || 'À confirmer'}
                          </div>
                          <div style={styles.badgeContainer}>
                            <span style={styles.badge}>{course.niveau || 'N/A'}</span>
                            <span style={styles.badge}>{course.parcours || 'N/A'}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal d'envoi par email */}
      {showEmailModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Envoyer l'emploi du temps par email</h3>
              <button 
                onClick={() => {
                  setShowEmailModal(false);
                  setEmail('');
                  setEmailError('');
                  setEmailSent(false);
                }} 
                style={styles.modalClose}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={styles.modalBody}>
              {emailSent ? (
                <div style={styles.emailSuccess}>
                  <Mail size={48} style={styles.successIcon} />
                  <h4>Email envoyé avec succès !</h4>
                  <p>L'emploi du temps a été envoyé à {email}</p>
                </div>
              ) : (
                <>
                  <p style={styles.modalDescription}>
                    Entrez votre adresse email pour recevoir l'emploi du temps de la semaine 
                    <strong> {getWeekRange()}</strong>
                  </p>
                  
                  <div style={styles.emailInputGroup}>
                    <label style={styles.emailLabel}>Adresse email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="exemple@email.com"
                      style={styles.emailInput}
                      disabled={emailSending}
                    />
                    {emailError && (
                      <p style={styles.emailErrorText}>{emailError}</p>
                    )}
                  </div>
                  
                  <div style={styles.modalActions}>
                    <button
                      onClick={() => {
                        setShowEmailModal(false);
                        setEmail('');
                        setEmailError('');
                        setEmailSent(false);
                      }}
                      style={styles.modalCancelButton}
                      disabled={emailSending}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={sendEmail}
                      style={styles.modalSendButton}
                      disabled={emailSending}
                    >
                      {emailSending ? 'Envoi en cours...' : 'Envoyer'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div>
            <h3 style={styles.footerTitle}>ENI Fianarantsoa</h3>
            <p style={styles.footerText}>© 2024 Tous droits réservés</p>
          </div>
          <div>
            <p style={styles.footerText}>📍 Campus Universitaire Ambondro</p>
            <p style={styles.footerText}>📞 +261 34 00 000 00</p>
            <p style={styles.footerText}>✉️ contact@eni-fianarantsoa.mg</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Styles avec la charte graphique
const styles = {
  // ... (gardez tous vos styles existants)
  container: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    fontFamily: '"Inter", "Poppins", "Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  
  // Loading
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '16px',
    backgroundColor: '#f1f5f9',
  },
  loadingText: {
    color: '#475569',
    fontSize: '16px',
    fontWeight: 500,
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#2563eb',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  
  // Error
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '16px',
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f1f5f9',
  },
  errorIcon: {
    color: '#ef4444',
  },
  errorTitle: {
    color: '#1e293b',
    fontSize: '24px',
    fontWeight: 600,
    margin: 0,
  },
  errorMessage: {
    color: '#475569',
    fontSize: '16px',
    margin: 0,
  },
  retryButton: {
    padding: '10px 24px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  
  // Hero Banner
  heroBanner: {
    background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  heroOverlay: {
    padding: '32px 24px',
  },
  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  heroText: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  heroIcon: {
    color: 'white',
  },
  heroTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: 'white',
    margin: 0,
    fontFamily: '"Poppins", "Inter", sans-serif',
  },
  heroSubtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
    fontWeight: 400,
  },
  
  // Login Button
  loginLink: {
    textDecoration: 'none',
  },
  loginButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    backgroundColor: 'white',
    color: '#2563eb',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  
  // EDT Section
  edtSection: {
    padding: '32px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  edtContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
  },
  
  // Header
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  headerIcon: {
    color: '#2563eb',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1e293b',
    margin: 0,
    fontFamily: '"Poppins", "Inter", sans-serif',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '4px 0 0',
    fontWeight: 400,
  },
  
  // Navigation
  navigationBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    backgroundColor: 'white',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  navButton: {
    padding: '8px 12px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#475569',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentWeekButton: {
    padding: '8px 20px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  weekInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    color: '#475569',
    fontSize: '14px',
    fontWeight: 500,
  },
  
  // Nouveaux boutons
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 20px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  emailButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 20px',
    backgroundColor: '#7c3aed',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 20px',
    border: '1px solid #e2e8f0',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'all 0.2s ease',
    backgroundColor: 'white',
    color: '#475569',
  },
  
  // Filters Panel
  filtersPanel: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap',
    padding: '16px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  select: {
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#1e293b',
    fontSize: '14px',
    minWidth: '180px',
    cursor: 'pointer',
    fontFamily: '"Inter", sans-serif',
  },
  resetButton: {
    padding: '10px 20px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#475569',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
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
    backgroundColor: '#f8fafc',
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
    height: '550px',
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
    fontWeight: 600,
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
  badgeContainer: {
    display: 'flex',
    gap: '6px',
    marginTop: '8px',
    flexWrap: 'wrap',
  },
  badge: {
    fontSize: '10px',
    padding: '2px 10px',
    backgroundColor: '#e2e8f0',
    borderRadius: '12px',
    color: '#475569',
    fontWeight: 500,
  },
  
  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
    backdropFilter: 'blur(4px)',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    animation: 'slideIn 0.3s ease-out',
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#1e293b',
  },
  modalClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '4px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  modalBody: {
    padding: '24px',
  },
  modalDescription: {
    color: '#475569',
    fontSize: '14px',
    marginBottom: '20px',
    lineHeight: '1.6',
  },
  emailInputGroup: {
    marginBottom: '20px',
  },
  emailLabel: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#1e293b',
  },
  emailInput: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e293b',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  },
  emailErrorText: {
    color: '#ef4444',
    fontSize: '13px',
    marginTop: '6px',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  modalCancelButton: {
    padding: '10px 24px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  modalSendButton: {
    padding: '10px 24px',
    backgroundColor: '#7c3aed',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  emailSuccess: {
    textAlign: 'center',
    padding: '20px 0',
  },
  successIcon: {
    color: '#059669',
    marginBottom: '16px',
  },
  
  // Footer
  footer: {
    backgroundColor: '#1e293b',
    color: '#94a3b8',
    padding: '32px 24px',
    marginTop: '40px',
    borderTop: '4px solid #2563eb',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '20px',
  },
  footerTitle: {
    color: 'white',
    fontSize: '18px',
    fontWeight: 600,
    margin: '0 0 8px 0',
    fontFamily: '"Poppins", "Inter", sans-serif',
  },
  footerText: {
    margin: '4px 0',
    fontSize: '14px',
    color: '#94a3b8',
  },
};

// Animation keyframes
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    button:active {
      transform: translateY(0px);
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
    
    .modal-close:hover {
      background-color: #f1f5f9;
    }
    
    .email-input:focus {
      outline: none;
      border-color: #7c3aed;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
    }
    
    @media (max-width: 1024px) {
      .days-header, .courses-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    
    @media (max-width: 640px) {
      .days-header, .courses-grid {
        grid-template-columns: 1fr;
      }
      
      .day-card {
        height: auto;
        max-height: 400px;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}