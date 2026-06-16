// src/pagesProf/ProfEmploiDuTemps.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { edtService } from '../services/api';
import { Calendar, Clock, User, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function ProfEmploiDuTemps() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStartDate(new Date()));

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
      week.push({ date, dayName: JOURS[i], formattedDate: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) });
    }
    return week;
  }

  const weekDays = getWeekDates(currentWeekStart);
  function previousWeek() { const newDate = new Date(currentWeekStart); newDate.setDate(newDate.getDate() - 7); setCurrentWeekStart(newDate); }
  function nextWeek() { const newDate = new Date(currentWeekStart); newDate.setDate(newDate.getDate() + 7); setCurrentWeekStart(newDate); }
  function goToCurrentWeek() { setCurrentWeekStart(getWeekStartDate(new Date())); }
  function getWeekRange() { return `${weekDays[0].formattedDate} - ${weekDays[5].formattedDate}`; }

  useEffect(() => { loadCourses(); }, [currentWeekStart]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const response = await edtService.getAll();
      const allCourses = response.data || [];
      const weekStartStr = currentWeekStart.toISOString().split('T')[0];
      const userCourses = allCourses.filter(c => c.user_id === user?.id && c.date_debut_semaine === weekStartStr);
      setCourses(userCourses);
    } catch (error) { console.error('Erreur:', error); }
    finally { setLoading(false); }
  };

  const getCoursesByDay = (dayName) => courses.filter(c => c.jour === dayName);

  if (loading) return <div style={styles.loading}>Chargement...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}><h1 style={styles.title}>📅 Mon emploi du temps</h1><p style={styles.subtitle}>Semaine du {getWeekRange()}</p></div>

      <div style={styles.navigationBar}>
        <button onClick={previousWeek} style={styles.navButton}><ChevronLeft size={20} /></button>
        <button onClick={goToCurrentWeek} style={styles.currentWeekButton}>Semaine actuelle</button>
        <button onClick={nextWeek} style={styles.navButton}><ChevronRight size={20} /></button>
        <div style={styles.weekInfo}><Calendar size={16} /><span>{getWeekRange()}</span></div>
      </div>

      <div style={styles.grid}>
        {weekDays.map((day, idx) => {
          const dayCourses = getCoursesByDay(day.dayName);
          return (
            <div key={idx} style={styles.dayCard}>
              <div style={styles.dayHeader}><span>{day.dayName}</span><span style={styles.courseCount}>{dayCourses.length}</span></div>
              <div style={styles.courseList}>
                {dayCourses.length === 0 ? <div style={styles.emptyState}>Aucun cours</div> :
                  dayCourses.map(course => (
                    <div key={course.id} style={styles.courseCard}>
                      <div style={styles.courseTitle}>{course.matiere}</div>
                      <div style={styles.courseInfo}><Clock size={12} /> {course.heure_debut?.substring(0,5)} - {course.heure_fin?.substring(0,5)}</div>
                      <div style={styles.courseInfo}><User size={12} /> Niveau: {course.niveau}</div>
                      <div style={styles.courseInfo}><MapPin size={12} /> Salle: {course.salle?.nom || 'N/A'}</div>
                      <div style={styles.badge}>{course.parcours}</div>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }, loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' },
  header: { marginBottom: '24px' }, title: { fontSize: '28px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }, subtitle: { fontSize: '14px', color: '#64748b' },
  navigationBar: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', background: 'white', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' },
  navButton: { padding: '8px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' },
  currentWeekButton: { padding: '8px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 },
  weekInfo: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#f8fafc', borderRadius: '8px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '20px' },
  dayCard: { background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '600px' },
  dayHeader: { padding: '12px 16px', background: '#667eea', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 },
  courseCount: { padding: '2px 8px', borderRadius: '20px', background: 'rgba(255,255,255,0.2)', fontSize: '12px' },
  courseList: { padding: '12px', flex: 1, overflowY: 'auto' }, emptyState: { textAlign: 'center', padding: '30px', color: '#94a3b8' },
  courseCard: { padding: '12px', marginBottom: '10px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' },
  courseTitle: { fontWeight: 600, marginBottom: '8px' }, courseInfo: { fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' },
  badge: { display: 'inline-block', padding: '2px 8px', background: '#e2e8f0', borderRadius: '12px', fontSize: '10px', marginTop: '6px' }
};