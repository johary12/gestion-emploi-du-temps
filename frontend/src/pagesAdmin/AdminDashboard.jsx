// src/pagesAdmin/AdminDashboard.jsx - Version avec charte graphique
import { useState, useEffect, useCallback } from 'react';
import { 
  Users, BookOpen, DoorOpen, Calendar, ChevronRight, 
  TrendingUp, TrendingDown, BarChart3, Activity, 
  Clock, CheckCircle, AlertCircle, Zap, Award, Star,
  UserPlus, UserCheck, School, GraduationCap
} from 'lucide-react';
import { profService, etudiantService, salleService, edtService } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ profs: 0, etudiants: 0, salles: 0, cours: 0 });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [trends, setTrends] = useState({});

  const loadStats = useCallback(async () => {
    try {
      const [profsRes, etudiantsRes, sallesRes, coursRes] = await Promise.all([
        profService.getAll(),
        etudiantService.getAll(),
        salleService.getAll(),
        edtService.getAll()
      ]);
      
      const statsData = {
        profs: profsRes.data?.length || 0,
        etudiants: etudiantsRes.data?.length || 0,
        salles: sallesRes.data?.length || 0,
        cours: coursRes.data?.length || 0
      };
      
      setStats(statsData);
      
      // Simuler des données de tendance
      setTrends({
        profs: { change: 12, direction: 'up' },
        etudiants: { change: 8, direction: 'up' },
        salles: { change: 2, direction: 'up' },
        cours: { change: 5, direction: 'down' }
      });

      // Simuler des activités récentes
      setRecentActivity([
        { action: 'Nouveau professeur ajouté', user: 'Dr. Jean Rakoto', time: 'Il y a 5 min', type: 'success' },
        { action: 'Emploi du temps publié', user: 'Semaine du 15-21 Mars', time: 'Il y a 25 min', type: 'info' },
        { action: 'Nouvel étudiant inscrit', user: 'Marie Rasoanaivo', time: 'Il y a 1h', type: 'success' },
        { action: 'Salle modifiée', user: 'Salle A101', time: 'Il y a 2h', type: 'warning' },
        { action: 'Disponibilité mise à jour', user: 'Prof. Andrianarivo', time: 'Il y a 3h', type: 'info' }
      ]);
      
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const getActivityIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle size={16} color="#10b981" />;
      case 'warning': return <AlertCircle size={16} color="#f59e0b" />;
      case 'info': return <Clock size={16} color="#3b82f6" />;
      default: return <Activity size={16} color="#64748b" />;
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Chargement du tableau de bord...</p>
      </div>
    );
  }

  const statCards = [
    { 
      title: 'Professeurs', 
      value: stats.profs, 
      icon: Users, 
      color: '#2563eb', 
      bg: '#eff6ff',
      link: '/admin/profs',
      gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)',
      subInfo: `${trends.profs?.change || 0}% ce mois-ci`
    },
    { 
      title: 'Étudiants', 
      value: stats.etudiants, 
      icon: GraduationCap, 
      color: '#059669', 
      bg: '#d1fae5',
      link: '/admin/etudiants',
      gradient: 'linear-gradient(135deg, #059669, #10b981)',
      subInfo: `${trends.etudiants?.change || 0}% ce mois-ci`
    },
    { 
      title: 'Salles', 
      value: stats.salles, 
      icon: DoorOpen, 
      color: '#d97706', 
      bg: '#fef3c7',
      link: '/admin/salles',
      gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
      subInfo: `${trends.salles?.change || 0} nouvelles`
    },
    { 
      title: 'Cours planifiés', 
      value: stats.cours, 
      icon: Calendar, 
      color: '#dc2626', 
      bg: '#fee2e2',
      link: '/admin/edt',
      gradient: 'linear-gradient(135deg, #dc2626, #ef4444)',
      subInfo: `${trends.cours?.change || 0}% ce mois-ci`
    }
  ];

  // Calculer le total
  const total = stats.profs + stats.etudiants + stats.salles + stats.cours;

  return (
    <div style={styles.container}>
      {/* En-tête */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📊 Tableau de bord</h1>
          <p style={styles.subtitle}>Bienvenue sur votre espace d'administration</p>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.headerBadge}>
            <Activity size={16} />
            <span>En ligne</span>
          </div>
          <div style={styles.headerDate}>
            <Clock size={16} />
            <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Statistiques générales */}
      <div style={styles.statsOverview}>
        <div style={styles.totalCard}>
          <div style={styles.totalIcon}>
            <BarChart3 size={24} />
          </div>
          <div>
            <div style={styles.totalValue}>{total}</div>
            <div style={styles.totalLabel}>Total des entrées</div>
          </div>
        </div>
        <div style={styles.totalCard}>
          <div style={{...styles.totalIcon, background: '#eff6ff', color: '#2563eb'}}>
            <Zap size={24} />
          </div>
          <div>
            <div style={styles.totalValue}>98%</div>
            <div style={styles.totalLabel}>Taux de disponibilité</div>
          </div>
        </div>
        <div style={styles.totalCard}>
          <div style={{...styles.totalIcon, background: '#fef3c7', color: '#d97706'}}>
            <Award size={24} />
          </div>
          <div>
            <div style={styles.totalValue}>24</div>
            <div style={styles.totalLabel}>Cours ce mois-ci</div>
          </div>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div style={styles.statsGrid}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isTrendingUp = trends[stat.title.toLowerCase()]?.direction === 'up';
          return (
            <div 
              key={index} 
              style={styles.statCard}
              onClick={() => window.location.href = stat.link}
            >
              <div style={styles.statCardContent}>
                <div style={styles.statCardLeft}>
                  <div style={{ ...styles.statIcon, background: stat.bg, color: stat.color }}>
                    <Icon size={24} />
                  </div>
                  <div style={styles.statInfo}>
                    <h3 style={styles.statValue}>{stat.value}</h3>
                    <p style={styles.statTitle}>{stat.title}</p>
                    <div style={styles.statSubInfo}>
                      {isTrendingUp ? 
                        <TrendingUp size={12} color="#10b981" /> : 
                        <TrendingDown size={12} color="#ef4444" />
                      }
                      <span style={{ 
                        color: isTrendingUp ? '#10b981' : '#ef4444',
                        fontSize: '11px',
                        fontWeight: 500
                      }}>
                        {stat.subInfo}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={styles.statCardRight}>
                  <div style={styles.statProgress}>
                    <div style={{
                      ...styles.statProgressFill,
                      width: `${Math.min((stat.value / Math.max(...Object.values(stats))) * 100, 100)}%`,
                      background: stat.gradient
                    }} />
                  </div>
                  <ChevronRight size={18} style={styles.arrow} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activités récentes et rapides */}
      <div style={styles.bottomSection}>
        {/* Activités récentes */}
        <div style={styles.activitySection}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionHeaderLeft}>
              <Activity size={20} style={styles.sectionIcon} />
              <h2 style={styles.sectionTitle}>Activités récentes</h2>
            </div>
            <span style={styles.sectionBadge}>Dernières 24h</span>
          </div>
          <div style={styles.activityList}>
            {recentActivity.map((activity, index) => (
              <div key={index} style={styles.activityItem}>
                <div style={styles.activityIcon}>
                  {getActivityIcon(activity.type)}
                </div>
                <div style={styles.activityContent}>
                  <div style={styles.activityAction}>{activity.action}</div>
                  <div style={styles.activityUser}>{activity.user}</div>
                </div>
                <div style={styles.activityTime}>{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions rapides */}
        <div style={styles.quickActions}>
          <div style={styles.sectionHeader}>
            <Zap size={20} style={styles.sectionIcon} />
            <h2 style={styles.sectionTitle}>Actions rapides</h2>
          </div>
          <div style={styles.quickActionsGrid}>
            <button style={styles.quickAction} onClick={() => window.location.href = '/admin/profs'}>
              <UserPlus size={20} style={styles.quickActionIcon} />
              <span style={styles.quickActionText}>Ajouter un professeur</span>
            </button>
            <button style={styles.quickAction} onClick={() => window.location.href = '/admin/etudiants'}>
              <UserCheck size={20} style={styles.quickActionIcon} />
              <span style={styles.quickActionText}>Ajouter un étudiant</span>
            </button>
            <button style={styles.quickAction} onClick={() => window.location.href = '/admin/salles'}>
              <School size={20} style={styles.quickActionIcon} />
              <span style={styles.quickActionText}>Gérer les salles</span>
            </button>
            <button style={styles.quickAction} onClick={() => window.location.href = '/admin/edt'}>
              <Calendar size={20} style={styles.quickActionIcon} />
              <span style={styles.quickActionText}>Planifier un cours</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer du dashboard */}
      <div style={styles.dashboardFooter}>
        <p style={styles.footerText}>
          <Star size={14} style={styles.footerIcon} />
          Système de gestion d'emploi du temps - ENI Fianarantsoa
        </p>
        <p style={styles.footerText}>
          Dernière mise à jour : {new Date().toLocaleString('fr-FR')}
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px 32px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '"Inter", "Poppins", "Roboto", -apple-system, sans-serif',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
  },

  // Loading
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#2563eb',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    fontSize: '16px',
    color: '#64748b',
    fontWeight: 500,
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1e293b',
    margin: '0 0 4px 0',
    fontFamily: '"Poppins", "Inter", sans-serif',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  headerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500,
  },
  headerDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#475569',
  },

  // Stats Overview
  statsOverview: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  totalCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  totalIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    color: '#2563eb',
  },
  totalValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1e293b',
  },
  totalLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 500,
  },

  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  statCardContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },
  statCardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1,
  },
  statIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1e293b',
    margin: 0,
  },
  statTitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '2px 0 4px 0',
    fontWeight: 500,
  },
  statSubInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  statCardRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
    marginLeft: '12px',
  },
  statProgress: {
    width: '60px',
    height: '4px',
    backgroundColor: '#e2e8f0',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  statProgressFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.6s ease',
  },
  arrow: {
    color: '#cbd5e1',
    transition: 'all 0.2s ease',
  },

  // Bottom Section
  bottomSection: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
    marginBottom: '32px',
  },

  // Activity Section
  activitySection: {
    backgroundColor: 'white',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '2px solid #f1f5f9',
  },
  sectionHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sectionIcon: {
    color: '#2563eb',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
  },
  sectionBadge: {
    fontSize: '11px',
    padding: '4px 12px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    borderRadius: '20px',
    fontWeight: 500,
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
  },
  activityIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    flexShrink: 0,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1e293b',
  },
  activityUser: {
    fontSize: '12px',
    color: '#64748b',
  },
  activityTime: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: 500,
  },

  // Quick Actions
  quickActions: {
    backgroundColor: 'white',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  quickActionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  quickAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%',
    textAlign: 'left',
  },
  quickActionIcon: {
    color: '#2563eb',
    flexShrink: 0,
  },
  quickActionText: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1e293b',
  },

  // Footer
  dashboardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0',
    flexWrap: 'wrap',
    gap: '12px',
  },
  footerText: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#94a3b8',
    margin: 0,
  },
  footerIcon: {
    color: '#f59e0b',
  },
};

// Animations et styles globaux
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    }

    .stat-card:hover .arrow {
      color: #2563eb;
      transform: translateX(4px);
    }

    .total-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transition: all 0.2s ease;
    }

    .activity-item:hover {
      background-color: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      transform: translateX(4px);
    }

    .quick-action:hover {
      background-color: white;
      border-color: #2563eb;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
      transform: translateX(4px);
    }

    .quick-action:hover .quick-action-icon {
      color: #1d4ed8;
    }

    .stat-progress-fill {
      animation: progressGrow 0.8s ease-out;
    }

    @keyframes progressGrow {
      from { width: 0; }
      to { width: var(--progress-width); }
    }

    @media (max-width: 1024px) {
      .bottom-section {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .container {
        padding: 16px;
      }
      
      .header {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .header-actions {
        width: 100%;
        justify-content: flex-start;
      }
      
      .stats-overview {
        grid-template-columns: 1fr;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .stat-card-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
      
      .stat-card-right {
        width: 100%;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
      
      .stat-progress {
        flex: 1;
        width: auto;
      }
      
      .dashboard-footer {
        flex-direction: column;
        text-align: center;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}