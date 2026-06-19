// src/pagesProf/ProfDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Calendar, Clock, User, BookOpen, Bell, Activity, ChevronRight } from 'lucide-react';
import { edtService, dispoService } from '../services/api';

export default function ProfDashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [stats, setStats] = useState({ cours: 0, disponibilites: 0 });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayCourses, setTodayCourses] = useState([]);
  const [error, setError] = useState(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    loadStats();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursRes, disposRes] = await Promise.all([
        edtService.getMySchedule(),
        dispoService.getMyDispos()
      ]);
      
      const userCourses = coursRes.data || [];
      setStats({ 
        cours: userCourses.length, 
        disponibilites: disposRes.data?.length || 0 
      });
      
      const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
      const todayName = today.charAt(0).toUpperCase() + today.slice(1);
      const filteredTodayCourses = userCourses.filter(c => c.jour === todayName);
      setTodayCourses(filteredTodayCourses);
      
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      setError('Impossible de charger les données du tableau de bord');
      setStats({ cours: 0, disponibilites: 0 });
      setTodayCourses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        ...styles.loading,
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        color: isDark ? '#f1f5f9' : '#1e293b',
      }}>
        <div style={{
          ...styles.spinner,
          borderColor: isDark ? '#334155' : '#e2e8f0',
          borderTopColor: '#059669',
        }} />
        <p>Chargement de votre tableau de bord...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        ...styles.errorContainer,
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        color: isDark ? '#f1f5f9' : '#1e293b',
      }}>
        <div style={styles.errorIcon}>⚠️</div>
        <p style={styles.errorText}>{error}</p>
        <button onClick={loadStats} style={styles.retryButton}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{
      ...styles.container,
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
      color: isDark ? '#f1f5f9' : '#1e293b',
    }}>
      {/* En-tête */}
      <div style={styles.header}>
        <div>
          <h1 style={{
            ...styles.title,
            color: isDark ? '#f1f5f9' : '#1e293b',
          }}>Tableau de bord</h1>
          <p style={{
            ...styles.subtitle,
            color: isDark ? '#94a3b8' : '#64748b',
          }}>
            {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{
          ...styles.welcomeCard,
          backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
          color: isDark ? '#f1f5f9' : '#1e293b',
        }}>
          <User size={20} />
          <span>Bienvenue, {user?.name || user?.nom}</span>
        </div>
      </div>

      {/* Statistiques */}
      <div style={styles.statsGrid}>
        <div style={{
          ...styles.statCard,
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e2e8f0',
        }}>
          <div style={{ ...styles.statIcon, background: isDark ? '#0f172a' : '#eef2ff', color: '#667eea' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <h3 style={{
              ...styles.statValue,
              color: isDark ? '#f1f5f9' : '#1e293b',
            }}>{stats.cours}</h3>
            <p style={{
              ...styles.statTitle,
              color: isDark ? '#94a3b8' : '#64748b',
            }}>Cours cette semaine</p>
          </div>
        </div>
        <div style={{
          ...styles.statCard,
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e2e8f0',
        }}>
          <div style={{ ...styles.statIcon, background: isDark ? '#0f172a' : '#d1fae5', color: '#10b981' }}>
            <Clock size={24} />
          </div>
          <div>
            <h3 style={{
              ...styles.statValue,
              color: isDark ? '#f1f5f9' : '#1e293b',
            }}>{stats.disponibilites}</h3>
            <p style={{
              ...styles.statTitle,
              color: isDark ? '#94a3b8' : '#64748b',
            }}>Disponibilités</p>
          </div>
        </div>
      </div>

      {/* Cours du jour */}
      <div style={styles.section}>
        <h2 style={{
          ...styles.sectionTitle,
          color: isDark ? '#f1f5f9' : '#1e293b',
        }}>Cours du jour</h2>
        {todayCourses.length === 0 ? (
          <div style={{
            ...styles.noCourses,
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderColor: isDark ? '#334155' : '#e2e8f0',
            color: isDark ? '#94a3b8' : '#64748b',
          }}>Aucun cours aujourd'hui</div>
        ) : (
          todayCourses.map(course => (
            <div key={course.id} style={{
              ...styles.courseCard,
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderColor: isDark ? '#334155' : '#e2e8f0',
            }}>
              <div>
                <div style={{
                  ...styles.courseTitle,
                  color: isDark ? '#f1f5f9' : '#1e293b',
                }}>{course.matiere}</div>
                <div style={{
                  ...styles.courseInfo,
                  color: isDark ? '#94a3b8' : '#64748b',
                }}>
                  <Clock size={14} /> {course.heure_debut?.substring(0,5)} - {course.heure_fin?.substring(0,5)}
                </div>
                <div style={{
                  ...styles.courseInfo,
                  color: isDark ? '#94a3b8' : '#64748b',
                }}>
                  <User size={14} /> Salle: {course.salle?.nom || course.salle_id || 'N/A'}
                </div>
              </div>
              <ChevronRight size={20} style={styles.arrow} />
            </div>
          ))
        )}
      </div>

      {/* Actions rapides */}
      <div style={styles.section}>
        <h2 style={{
          ...styles.sectionTitle,
          color: isDark ? '#f1f5f9' : '#1e293b',
        }}>⚡ Actions rapides</h2>
        <div style={styles.actionsGrid}>
          <button 
            style={{
              ...styles.actionButton,
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderColor: isDark ? '#334155' : '#e2e8f0',
              color: isDark ? '#f1f5f9' : '#1e293b',
            }}
            onClick={() => window.location.href = '/prof/disponibilites'}
          >
            Gérer mes disponibilités
          </button>
          <button 
            style={{
              ...styles.actionButton,
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderColor: isDark ? '#334155' : '#e2e8f0',
              color: isDark ? '#f1f5f9' : '#1e293b',
            }}
            onClick={() => window.location.href = '/prof/emploi'}
          >
             Voir mon emploi du temps
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .course-card:hover {
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border-color: #059669;
        }
        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-color: #059669;
        }
        .retry-button:hover {
          background-color: #047857;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: { 
    padding: '24px 32px', 
    maxWidth: '1200px', 
    margin: '0 auto',
    fontFamily: '"Inter", "Poppins", "Roboto", -apple-system, sans-serif',
    minHeight: '100vh',
    transition: 'all 0.3s ease',
  },
  loading: { 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center', 
    height: '400px',
    gap: '16px',
    transition: 'all 0.3s ease',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#059669',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    gap: '16px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  errorIcon: { fontSize: '48px' },
  errorText: { color: '#ef4444', fontSize: '16px', maxWidth: '400px' },
  retryButton: {
    padding: '10px 24px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '32px', 
    flexWrap: 'wrap', 
    gap: '16px' 
  },
  title: { fontSize: '28px', fontWeight: 700, marginBottom: '8px' },
  subtitle: { fontSize: '14px' },
  welcomeCard: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '8px 16px', 
    borderRadius: '40px',
    fontSize: '14px',
    fontWeight: 500,
  },
  statsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
    gap: '20px', 
    marginBottom: '32px' 
  },
  statCard: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px', 
    padding: '20px', 
    borderRadius: '16px', 
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
  },
  statIcon: { 
    width: '56px', 
    height: '56px', 
    borderRadius: '14px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  statValue: { fontSize: '28px', fontWeight: 700, margin: 0 },
  statTitle: { fontSize: '14px', margin: '4px 0 0' },
  section: { marginBottom: '32px' },
  sectionTitle: { fontSize: '18px', fontWeight: 600, marginBottom: '16px' },
  noCourses: { 
    padding: '32px', 
    textAlign: 'center', 
    borderRadius: '12px', 
    border: '1px solid #e2e8f0',
  },
  courseCard: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '16px', 
    borderRadius: '12px', 
    marginBottom: '10px', 
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease',
  },
  courseTitle: { fontWeight: 600, marginBottom: '4px' },
  courseInfo: { fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' },
  arrow: { color: '#cbd5e1' },
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' },
  actionButton: { 
    padding: '14px 20px', 
    border: '1px solid #e2e8f0', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    textAlign: 'left', 
    fontSize: '14px', 
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
};