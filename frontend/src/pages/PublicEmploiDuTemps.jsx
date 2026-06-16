// src/pages/PublicEmploiDuTemps.jsx - Version avec affichage fusionné
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { edtService, profService, salleService } from '../services/api';
import { 
  Calendar, Clock, User, MapPin, Filter, ChevronLeft, ChevronRight,
  School, GraduationCap, AlertCircle, LogIn, FileText, Loader2,
  DoorOpen, BookOpen
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const NIVEAUX = ['L1', 'L2', 'L3', 'M1', 'M2'];
const PARCOURS = ['Génie Logiciel', 'Réseaux & Télécoms', "Systèmes d'Information", 'Sécurité Informatique'];

// ✅ Fonction pour formater en date locale
function toLocalDateString(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ✅ Fonction pour extraire la date d'une chaîne ISO
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

export default function PublicEmploiDuTemps() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [profs, setProfs] = useState([]);
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStartDate(new Date()));
  const [weekDays, setWeekDays] = useState([]);
  const [filters, setFilters] = useState({ niveau: '', parcours: '' });
  const [showFilters, setShowFilters] = useState(false);
  
  const edtRef = useRef(null);

  // ✅ Mettre à jour les jours de la semaine
  useEffect(() => {
    if (currentWeekStart) {
      updateWeekDays(currentWeekStart);
    }
  }, [currentWeekStart]);

  // ✅ Filtrer les cours quand les données changent
  useEffect(() => {
    if (courses.length > 0 && currentWeekStart) {
      filterCoursesByWeek();
    }
  }, [courses, currentWeekStart, filters]);

  // ✅ Charger les données au démarrage
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
        fullDate: d,
        dayNumber: d.getDate(),
        monthName: d.toLocaleDateString('fr-FR', { month: 'short' })
      });
    }
    setWeekDays(dates);
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
    setCurrentWeekStart(getWeekStartDate(new Date())); 
  }
  
  function getWeekRange() { 
    return weekDays.length ? `${weekDays[0].formattedDate} - ${weekDays[5].formattedDate}` : ''; 
  }

  // ✅ Fonction pour filtrer les cours par semaine (comme l'Admin)
  function filterCoursesByWeek() {
    if (!currentWeekStart) {
      console.log('⚠️ currentWeekStart est null');
      return;
    }
    
    const weekStartStr = toLocalDateString(currentWeekStart);
    
    console.log('=== DEBUG PUBLIC EDT ===');
    console.log('📅 Début de semaine:', weekStartStr);
    console.log('📚 Nombre total de cours:', courses.length);
    
    // ✅ Filtrer par semaine en extrayant la date
    let filtered = courses.filter(course => {
      if (!course) return false;
      if (!course.date_debut_semaine) return false;
      
      const courseDate = extractDateFromISO(course.date_debut_semaine);
      const match = courseDate === weekStartStr;
      
      if (match) {
        console.log('✅ Cours trouvé:', course.matiere, course.jour);
      }
      return match;
    });
    
    console.log('📊 Cours filtrés pour cette semaine:', filtered.length);
    
    // Appliquer les filtres niveau et parcours
    if (filters.niveau) {
      filtered = filtered.filter(c => c.niveau === filters.niveau);
    }
    if (filters.parcours) {
      filtered = filtered.filter(c => c.parcours === filters.parcours);
    }
    
    console.log('📊 Cours après filtres:', filtered.length);
    setFilteredCourses(filtered);
  }

  // ✅ Charger toutes les données (comme l'Admin)
  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadCourses(),
        loadProfs(),
        loadSalles()
      ]);
      
      console.log('✅ Toutes les données chargées');
    } catch (error) {
      console.error('Erreur chargement:', error);
      setError('Impossible de charger les données.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Charger les cours depuis l'API (comme l'Admin)
  const loadCourses = async () => {
    try {
      const res = await edtService.getAll();
      console.log('📦 Cours chargés depuis API:', res.data?.length || 0, 'cours');
      if (res.data && res.data.length > 0) {
        console.log('📋 Exemple de cours:', res.data[0]);
        const dates = res.data.map(c => extractDateFromISO(c.date_debut_semaine));
        console.log('📋 Dates début semaine des cours (extraites):', [...new Set(dates)]);
      }
      setCourses(res.data || []);
    } catch (error) {
      console.error('Erreur chargement cours:', error);
      throw error;
    }
  };

  // ✅ Charger les professeurs
  const loadProfs = async () => {
    try {
      const res = await profService.getAll();
      setProfs(res.data || []);
    } catch (error) {
      console.error('Erreur chargement professeurs:', error);
    }
  };

  // ✅ Charger les salles
  const loadSalles = async () => {
    try {
      const res = await salleService.getAll();
      setSalles(res.data || []);
    } catch (error) {
      console.error('Erreur chargement salles:', error);
    }
  };

  const getProfName = (id) => {
    const prof = profs.find(p => p.id === id);
    return prof?.name || 'À confirmer';
  };

  const getSalleName = (id) => {
    const salle = salles.find(s => s.id === id);
    return salle?.nom || 'À confirmer';
  };

  const getCoursesByDay = (dayName) => {
    return filteredCourses.filter(c => c.jour === dayName);
  };

  // Exporter en PDF
  const exportPDF = async () => {
    if (!edtRef.current) return;
    
    try {
      setLoading(true);
      const element = edtRef.current;
      
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

  const resetFilters = () => {
    setFilters({ niveau: '', parcours: '' });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
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
        <button onClick={() => loadAllData()} style={styles.retryButton}>Réessayer</button>
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
            <p style={styles.subtitle}>Semaine du {getWeekRange()}</p>
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
          
          <button onClick={exportPDF} style={styles.exportButton}>
            <FileText size={18} />
            Exporter PDF
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
              <option value="">📚 Tous niveaux</option>
              {NIVEAUX.map(n => <option key={n}>{n}</option>)}
            </select>
            <select 
              value={filters.parcours} 
              onChange={(e) => setFilters({...filters, parcours: e.target.value})} 
              style={styles.select}
            >
              <option value="">🎓 Tous parcours</option>
              {PARCOURS.map(p => <option key={p}>{p}</option>)}
            </select>
            <button 
              onClick={resetFilters} 
              style={styles.resetButton}
            >
              Réinitialiser
            </button>
          </div>
        )}

        {/* ✅ Affichage de l'emploi du temps - Version fusionnée */}
        <div ref={edtRef} style={styles.edtContent}>
          {/* Grille des cours avec en-tête intégré */}
          <div style={styles.coursesGrid}>
            {weekDays.map((day, idx) => {
              const dayCourses = getCoursesByDay(day.dayName);
              const isToday = new Date().toDateString() === day.date.toDateString();
              return (
                <div key={idx} style={styles.dayCard}>
                  {/* En-tête du jour intégré */}
                  <div style={{
                    ...styles.dayHeader,
                    backgroundColor: isToday ? '#dbeafe' : '#f8fafc',
                    borderBottom: isToday ? '2px solid #2563eb' : '1px solid #e2e8f0'
                  }}>
                    <div style={styles.dayName}>{day.dayName}</div>
                    <div style={styles.dayDate}>{day.dayNumber} {day.monthName}</div>
                    <div style={styles.dayCountBadge}>
                      <span style={styles.dayCountNumber}>{dayCourses.length}</span>
                      <span style={styles.dayCountLabel}>cours</span>
                    </div>
                  </div>
                  
                  {/* Liste des cours */}
                  <div style={styles.courseList}>
                    {dayCourses.length === 0 ? (
                      <div style={styles.emptyState}>Aucun cours</div>
                    ) : (
                      dayCourses.map((course, i) => (
                        <div key={i} style={styles.courseCard}>
                          <div style={styles.courseTitle}>{course.matiere || 'Sans titre'}</div>
                          
                          <div style={styles.courseInfoRow}>
                            <Clock size={12} style={styles.infoIcon} />
                            <span style={styles.courseInfoText}>
                              {course.heure_debut?.substring(0,5) || '--:--'} - {course.heure_fin?.substring(0,5) || '--:--'}
                            </span>
                          </div>
                          
                          <div style={styles.courseInfoRow}>
                            <User size={12} style={styles.infoIcon} />
                            <span style={styles.courseInfoText}>{getProfName(course.user_id)}</span>
                          </div>
                          
                          <div style={styles.courseInfoRow}>
                            <DoorOpen size={12} style={styles.infoIcon} />
                            <span style={styles.courseInfoText}>{getSalleName(course.salle_id)}</span>
                          </div>
                          
                          <div style={styles.badgeContainer}>
                            <span style={styles.badge}>
                              {course.niveau || 'N/A'}
                            </span>
                            <span style={styles.badge}>
                              {course.parcours || 'N/A'}
                            </span>
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

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Styles fusionnés
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    fontFamily: '"Inter", "Poppins", "Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  
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
  
  edtSection: {
    padding: '32px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  edtContent: {
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  
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
  
  // ✅ Grille fusionnée - une seule structure
  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '8px',
  },
  
  // ✅ Jour entier (en-tête + cours)
  dayCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '480px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
  },
  
  // ✅ En-tête du jour
  dayHeader: {
    padding: '10px 8px',
    textAlign: 'center',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  dayName: {
    fontWeight: 600,
    fontSize: '13px',
    color: '#1e293b',
  },
  dayDate: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '2px',
  },
  dayCountBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    marginTop: '4px',
    padding: '2px 10px',
    borderRadius: '16px',
    backgroundColor: '#2563eb',
    color: 'white',
    fontSize: '10px',
    fontWeight: 500,
  },
  dayCountNumber: {
    fontWeight: 700,
  },
  dayCountLabel: {
    fontWeight: 400,
  },
  
  // ✅ Liste des cours
  courseList: {
    padding: '8px',
    flex: 1,
    overflowY: 'auto',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#94a3b8',
    fontSize: '12px',
  },
  
  // ✅ Course card
  courseCard: {
    padding: '8px 10px',
    marginBottom: '6px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  courseTitle: {
    fontWeight: 600,
    marginBottom: '4px',
    fontSize: '12px',
    color: '#1e293b',
  },
  courseInfoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '2px',
  },
  infoIcon: {
    color: '#64748b',
    flexShrink: 0,
  },
  courseInfoText: {
    fontSize: '10px',
    color: '#64748b',
  },
  badgeContainer: {
    display: 'flex',
    gap: '4px',
    marginTop: '4px',
    flexWrap: 'wrap',
  },
  badge: {
    fontSize: '9px',
    padding: '1px 6px',
    backgroundColor: '#e2e8f0',
    borderRadius: '8px',
    color: '#475569',
    fontWeight: 500,
  },
  
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