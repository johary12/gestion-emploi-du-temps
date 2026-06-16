// src/pagesProf/ProfEmploiDuTemps.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { edtService } from '../services/api';
import { Calendar, Clock, User, MapPin, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

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

export default function ProfEmploiDuTemps() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStartDate(new Date()));
  const [weekDays, setWeekDays] = useState([]);

  useEffect(() => {
    if (currentWeekStart) {
      updateWeekDays(currentWeekStart);
    }
  }, [currentWeekStart]);

  useEffect(() => {
    if (user?.id) {
      loadCourses();
    }
  }, [currentWeekStart, user]);

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
    if (weekDays.length === 0) return '';
    return `${weekDays[0].formattedDate} - ${weekDays[5].formattedDate}`;
  }

  const loadCourses = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const weekStartStr = toLocalDateString(currentWeekStart);
      
      // ✅ Use the professor-specific endpoint
      console.log('📅 Chargement des cours du professeur pour la semaine:', weekStartStr);
      const response = await edtService.getMyScheduleByWeek(weekStartStr);
      
      let data = response.data || [];
      console.log('📚 Cours chargés:', data.length);
      
      setCourses(data);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des cours:', error);
      setError('Impossible de charger votre emploi du temps. Veuillez réessayer.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const getCoursesByDay = (dayName) => {
    return courses.filter(c => c.jour === dayName);
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: '#667eea' }} />
        <p>Chargement de votre emploi du temps...</p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error && courses.length === 0) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>📅</div>
        <p style={styles.errorText}>{error}</p>
        <button onClick={loadCourses} style={styles.retryButton}>
          <Loader2 size={16} style={{ marginRight: '8px' }} />
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📅 Mon emploi du temps</h1>
        <p style={styles.subtitle}>
          {user?.name} - Semaine du {getWeekRange()}
        </p>
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
        <span style={styles.courseCountBadge}>
          {courses.length} cours
        </span>
      </div>

      <div style={styles.grid}>
        {weekDays.map((day, idx) => {
          const dayCourses = getCoursesByDay(day.dayName);
          const isToday = new Date().toDateString() === day.date.toDateString();
          
          return (
            <div key={idx} style={{
              ...styles.dayCard,
              border: isToday ? '2px solid #667eea' : '1px solid #e2e8f0'
            }}>
              <div style={{
                ...styles.dayHeader,
                background: isToday ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#667eea'
              }}>
                <span>{day.dayName}</span>
                <span style={styles.courseCount}>{dayCourses.length}</span>
              </div>
              <div style={styles.courseList}>
                {dayCourses.length === 0 ? (
                  <div style={styles.emptyState}>Aucun cours</div>
                ) : (
                  dayCourses.map(course => (
                    <div key={course.id} style={styles.courseCard}>
                      <div style={styles.courseTitle}>{course.matiere}</div>
                      <div style={styles.courseInfo}>
                        <Clock size={12} />
                        {course.heure_debut?.substring(0,5)} - {course.heure_fin?.substring(0,5)}
                      </div>
                      <div style={styles.courseInfo}>
                        <User size={12} />
                        Niveau: {course.niveau}
                      </div>
                      <div style={styles.courseInfo}>
                        <MapPin size={12} />
                        Salle: {course.salle?.nom || course.salle_id || 'N/A'}
                      </div>
                      <div style={styles.badgeContainer}>
                        <span style={styles.badge}>{course.parcours}</span>
                        <span style={styles.badge}>{course.niveau}</span>
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
  );
}

const styles = {
  container: {
    padding: '24px 32px',
    maxWidth: '1400px',
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '"Inter", "Poppins", "Roboto", -apple-system, sans-serif',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    gap: '16px',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    gap: '16px',
  },
  errorIcon: {
    fontSize: '48px',
  },
  errorText: {
    color: '#ef4444',
    fontSize: '16px',
    textAlign: 'center',
    maxWidth: '400px',
  },
  retryButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 24px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
  },
  navigationBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    background: 'white',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '1px solid #e2e8f0',
  },
  navButton: {
    padding: '8px 12px',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  currentWeekButton: {
    padding: '8px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  weekInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#f8fafc',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e293b',
  },
  courseCountBadge: {
    marginLeft: 'auto',
    padding: '4px 12px',
    backgroundColor: '#eef2ff',
    color: '#667eea',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '16px',
  },
  dayCard: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '550px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease',
  },
  dayHeader: {
    padding: '12px 16px',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 600,
    fontSize: '14px',
  },
  courseCount: {
    padding: '2px 10px',
    borderRadius: '20px',
    background: 'rgba(255,255,255,0.2)',
    fontSize: '12px',
  },
  courseList: {
    padding: '12px',
    flex: 1,
    overflowY: 'auto',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 10px',
    color: '#94a3b8',
    fontSize: '13px',
  },
  courseCard: {
    padding: '12px',
    marginBottom: '10px',
    background: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease',
  },
  courseTitle: {
    fontWeight: 600,
    marginBottom: '8px',
    fontSize: '14px',
    color: '#1e293b',
  },
  courseInfo: {
    fontSize: '11px',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '4px',
  },
  badgeContainer: {
    display: 'flex',
    gap: '4px',
    marginTop: '6px',
    flexWrap: 'wrap',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    background: '#e2e8f0',
    borderRadius: '12px',
    fontSize: '10px',
    color: '#475569',
    fontWeight: 500,
  },
};