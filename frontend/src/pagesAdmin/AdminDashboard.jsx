// src/pagesAdmin/AdminDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { Users, BookOpen, DoorOpen, Calendar, ChevronRight } from 'lucide-react';
import { profService, etudiantService, salleService, edtService } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ profs: 0, etudiants: 0, salles: 0, cours: 0 });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const [profsRes, etudiantsRes, sallesRes, coursRes] = await Promise.all([
        profService.getAll(),
        etudiantService.getAll(),
        salleService.getAll(),
        edtService.getAll()
      ]);
      setStats({
        profs: profsRes.data?.length || 0,
        etudiants: etudiantsRes.data?.length || 0,
        salles: sallesRes.data?.length || 0,
        cours: coursRes.data?.length || 0
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return <div style={styles.loading}>Chargement...</div>;
  }

  const statCards = [
    { title: 'Professeurs', value: stats.profs, icon: Users, color: '#667eea', bg: '#eef2ff', link: '/admin/profs' },
    { title: 'Étudiants', value: stats.etudiants, icon: BookOpen, color: '#10b981', bg: '#d1fae5', link: '/admin/etudiants' },
    { title: 'Salles', value: stats.salles, icon: DoorOpen, color: '#f59e0b', bg: '#fed7aa', link: '/admin/salles' },
    { title: 'Cours', value: stats.cours, icon: Calendar, color: '#ef4444', bg: '#fee2e2', link: '/admin/edt' }
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Tableau de bord</h1>
      <p style={styles.subtitle}>Bienvenue sur votre espace d'administration</p>
      <div style={styles.statsGrid}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} style={styles.statCard} onClick={() => window.location.href = stat.link}>
              <div style={{ ...styles.statIcon, background: stat.bg, color: stat.color }}><Icon size={24} /></div>
              <div><h3 style={styles.statValue}>{stat.value}</h3><p style={styles.statTitle}>{stat.title}</p></div>
              <ChevronRight size={18} style={styles.arrow} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', fontSize: '18px' },
  title: { fontSize: '28px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#64748b', marginBottom: '32px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
  statCard: { display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer' },
  statIcon: { width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: '28px', fontWeight: 700, color: '#1e293b', margin: 0 },
  statTitle: { fontSize: '14px', color: '#64748b', margin: '4px 0 0' },
  arrow: { marginLeft: 'auto', color: '#cbd5e1' }
};