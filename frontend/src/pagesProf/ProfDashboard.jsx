// src/pagesProf/ProfDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, User, BookOpen, Bell, Activity, ChevronRight } from 'lucide-react';
import { edtService, disponibiliteService } from '../services/api';

export default function ProfDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ cours: 0, disponibilites: 0 });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayCourses, setTodayCourses] = useState([]);

  useEffect(() => {
    loadStats();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadStats = async () => {
    try {
      const [coursRes, disposRes] = await Promise.all([edtService.getAll(), disponibiliteService.getMyDispos()]);
      const userCourses = coursRes.data?.filter(c => c.user_id === user?.id) || [];
      setStats({ cours: userCourses.length, disponibilites: disposRes.data?.length || 0 });
      const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
      setTodayCourses(userCourses.filter(c => c.jour === today));
    } catch (error) { console.error('Erreur:', error); }
    finally { setLoading(false); }
  };

  if (loading) return <div style={styles.loading}>Chargement...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}><div><h1 style={styles.title}>Tableau de bord</h1><p style={styles.subtitle}>{currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p></div><div style={styles.welcomeCard}><User size={20} /><span>Bienvenue, {user?.name || user?.nom}</span></div></div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}><div style={{ ...styles.statIcon, background: '#eef2ff', color: '#667eea' }}><BookOpen size={24} /></div><div><h3 style={styles.statValue}>{stats.cours}</h3><p style={styles.statTitle}>Cours cette semaine</p></div></div>
        <div style={styles.statCard}><div style={{ ...styles.statIcon, background: '#d1fae5', color: '#10b981' }}><Clock size={24} /></div><div><h3 style={styles.statValue}>{stats.disponibilites}</h3><p style={styles.statTitle}>Disponibilités</p></div></div>
      </div>

      <div style={styles.section}><h2 style={styles.sectionTitle}>📅 Cours du jour</h2>
        {todayCourses.length === 0 ? <div style={styles.noCourses}>Aucun cours aujourd'hui</div> :
          todayCourses.map(course => <div key={course.id} style={styles.courseCard}><div><div style={styles.courseTitle}>{course.matiere}</div><div style={styles.courseInfo}><Clock size={14} /> {course.heure_debut?.substring(0,5)} - {course.heure_fin?.substring(0,5)}</div><div style={styles.courseInfo}><User size={14} /> Salle: {course.salle?.nom || 'N/A'}</div></div><ChevronRight size={20} style={styles.arrow} /></div>)}
      </div>

      <div style={styles.section}><h2 style={styles.sectionTitle}>⚡ Actions rapides</h2>
        <div style={styles.actionsGrid}><button style={styles.actionButton} onClick={() => window.location.href = '/prof/disponibilites'}>⏰ Gérer mes disponibilités</button><button style={styles.actionButton} onClick={() => window.location.href = '/prof/emploi'}>📅 Voir mon emploi du temps</button></div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '24px 32px', maxWidth: '1200px', margin: '0 auto' }, loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '28px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }, subtitle: { fontSize: '14px', color: '#64748b' },
  welcomeCard: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#f1f5f9', borderRadius: '40px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' },
  statCard: { display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  statIcon: { width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: '28px', fontWeight: 700, color: '#1e293b', margin: 0 }, statTitle: { fontSize: '14px', color: '#64748b', margin: '4px 0 0' },
  section: { marginBottom: '32px' }, sectionTitle: { fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' },
  noCourses: { padding: '32px', textAlign: 'center', background: 'white', borderRadius: '12px', color: '#64748b' },
  courseCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'white', borderRadius: '12px', marginBottom: '10px', border: '1px solid #e2e8f0' },
  courseTitle: { fontWeight: 600, marginBottom: '4px' }, courseInfo: { fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }, arrow: { color: '#cbd5e1' },
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' },
  actionButton: { padding: '14px 20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', fontSize: '14px', fontWeight: 500 }
};