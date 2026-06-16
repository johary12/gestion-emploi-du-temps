// src/pages/PublicEmploiDuTemps.jsx - Version corrigée avec route publique

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { publicService } from '../services/api';
import { 
  Calendar, Clock, User, MapPin, Filter, ChevronLeft, ChevronRight,
  School, GraduationCap, AlertCircle, LogIn, FileText, Loader2,
  DoorOpen, BookOpen
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStartDate(new Date()));
  const [weekDays, setWeekDays] = useState([]);
  const [filters, setFilters] = useState({ niveau: '', parcours: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  const edtRef = useRef(null);

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
    loadCourses();
  }, [currentWeekStart]);

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

  function filterCoursesByWeek() {
    if (!currentWeekStart) {
      return;
    }
    
    const weekStartStr = toLocalDateString(currentWeekStart);
    
    let filtered = courses.filter(course => {
      if (!course) return false;
      // Vérifier si le cours correspond à la semaine
      if (course.date_debut_semaine) {
        const courseDate = course.date_debut_semaine.split('T')[0];
        return courseDate === weekStartStr;
      }
      return false;
    });
    
    if (filters.niveau) {
      filtered = filtered.filter(c => c.niveau === filters.niveau);
    }
    if (filters.parcours) {
      filtered = filtered.filter(c => c.parcours === filters.parcours);
    }
    
    setFilteredCourses(filtered);
  }

  // ✅ Utiliser la route publique au lieu des routes protégées
  const loadCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const weekStartStr = toLocalDateString(currentWeekStart);
      
      // Appel à la route publique avec les filtres
      const response = await publicService.getEmploi(
        filters.niveau || '',
        filters.parcours || '',
        weekStartStr
      );
      
      console.log('📦 Cours publics chargés:', response.data?.length || 0);
      
      if (response.data && Array.isArray(response.data)) {
        setCourses(response.data);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error('Erreur chargement cours publics:', error);
      if (error.response?.status === 401) {
        setError('Vous devez être connecté pour accéder à cette page. Veuillez vous connecter.');
      } else {
        setError('Impossible de charger l\'emploi du temps. Veuillez réessayer.');
      }
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Recharger quand les filtres changent
  useEffect(() => {
    if (!loading) {
      loadCourses();
    }
  }, [filters]);

  const resetFilters = () => {
    setFilters({ niveau: '', parcours: '' });
  };

  // Exporter en PDF simplifié
  const exportPDF = async () => {
    if (!edtRef.current) return;
    
    setExporting(true);
    try {
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      if (printWindow) {
        const content = edtRef.current.innerHTML;
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Emploi du temps - ${getWeekRange()}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .day-card { border: 1px solid #ccc; margin-bottom: 10px; padding: 10px; }
              .day-header { background: #f0f0f0; padding: 10px; font-weight: bold; }
              .course-card { border: 1px solid #eee; margin: 5px 0; padding: 8px; }
              .course-title { font-weight: bold; }
              .course-info { font-size: 12px; color: #666; }
              .badge { background: #e0e0e0; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-right: 4px; }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>Emploi du temps - ${getWeekRange()}</h1>
            <div id="print-content">${content}</div>
            <script>
              window.onload = function() { window.print(); }
            <\/script>
          </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (error) {
      console.error('Erreur export PDF:', error);
      setError('Erreur lors de l\'export du PDF');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
        <p style={styles.loadingText}>Chargement de l'emploi du temps...</p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <AlertCircle size={48} style={styles.errorIcon} />
        <h2 style={styles.errorTitle}>Erreur</h2>
        <p style={styles.errorMessage}>{error}</p>
        {error.includes('connecté') ? (
          <Link to="/login" style={styles.loginLink}>
            <button style={styles.retryButton}>
              <LogIn size={18} style={{ marginRight: '8px' }} />
              Se connecter
            </button>
          </Link>
        ) : (
          <button onClick={() => loadCourses()} style={styles.retryButton}>
            Réessayer
          </button>
        )}
      </div>
    );
  }

  const hasCourses = filteredCourses.length > 0;

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
          
          <button onClick={exportPDF} style={styles.exportButton} disabled={exporting || !hasCourses}>
            <FileText size={18} />
            {exporting ? 'Export...' : 'Exporter PDF'}
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
              {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <select 
              value={filters.parcours} 
              onChange={(e) => setFilters({...filters, parcours: e.target.value})} 
              style={styles.select}
            >
              <option value="">🎓 Tous parcours</option>
              {PARCOURS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button 
              onClick={resetFilters} 
              style={styles.resetButton}
            >
              Réinitialiser
            </button>
          </div>
        )}

        {/* Affichage de l'emploi du temps */}
        <div ref={edtRef} style={styles.edtContent}>
          {!hasCourses && !loading ? (
            <div style={styles.noCoursesContainer}>
              <BookOpen size={48} style={styles.noCoursesIcon} />
              <p style={styles.noCoursesText}>Aucun cours programmé pour cette semaine</p>
              <p style={styles.noCoursesSubtext}>Vérifiez les filtres ou changez de semaine</p>
            </div>
          ) : (
            <div style={styles.coursesGrid}>
              {weekDays.map((day, idx) => {
                const dayCourses = filteredCourses.filter(c => c.jour === day.dayName);
                const isToday = new Date().toDateString() === day.date.toDateString();
                return (
                  <div key={idx} style={styles.dayCard}>
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
                              <span style={styles.courseInfoText}>{course.prof || 'À confirmer'}</span>
                            </div>
                            
                            <div style={styles.courseInfoRow}>
                              <DoorOpen size={12} style={styles.infoIcon} />
                              <span style={styles.courseInfoText}>{course.salle || 'À confirmer'}</span>
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
          )}
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
        @media (max-width: 1200px) {
          .courses-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .courses-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .hero-content {
            flex-direction: column;
            text-align: center;
          }
          .hero-text {
            flex-direction: column;
          }
          .navigation-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .filters-panel {
            flex-direction: column;
          }
          .select {
            min-width: 100%;
          }
        }
        @media (max-width: 480px) {
          .courses-grid {
            grid-template-columns: 1fr !important;
          }
          .day-card {
            height: auto !important;
            min-height: 200px;
          }
        }
      `}</style>
    </div>
  );
}

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
    display: 'inline-flex',
    alignItems: 'center',
  },
  
  loginLink: {
    textDecoration: 'none',
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
    minHeight: '200px',
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
  
  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '8px',
  },
  
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

  noCoursesContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '12px',
  },
  noCoursesIcon: {
    color: '#cbd5e1',
  },
  noCoursesText: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1e293b',
  },
  noCoursesSubtext: {
    fontSize: '14px',
    color: '#94a3b8',
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