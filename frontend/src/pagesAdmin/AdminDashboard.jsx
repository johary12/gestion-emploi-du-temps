// src/pagesAdmin/AdminDashboard.jsx - Version avec prise en charge du mode sombre
import { useState, useEffect, useCallback } from 'react';
import { 
  Users, BookOpen, DoorOpen, Calendar, ChevronRight, 
  TrendingUp, TrendingDown, BarChart3, Activity, 
  Clock, CheckCircle, AlertCircle, Zap, Award, Star,
  UserPlus, UserCheck, School, GraduationCap
} from 'lucide-react';
import { profService, etudiantService, salleService, edtService } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function AdminDashboard() {
  const { theme } = useTheme();
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
      default: return <Activity size={16} color="var(--text-muted, #64748b)" />;
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={{
          ...styles.loadingText,
          color: "var(--text-secondary, #64748b)",
        }}>Chargement du tableau de bord...</p>
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
    <div style={{
      ...styles.container,
      backgroundColor: "var(--bg-primary, #f8fafc)",
      color: "var(--text-primary, #1e293b)",
    }}>
      {/* En-tête */}
      <div style={styles.header}>
        <div>
          <h1 style={{
            ...styles.title,
            color: "var(--text-primary, #1e293b)",
          }}>📊 Tableau de bord</h1>
          <p style={{
            ...styles.subtitle,
            color: "var(--text-secondary, #64748b)",
          }}>Bienvenue sur votre espace d'administration</p>
        </div>
        <div style={styles.headerActions}>
          <div style={{
            ...styles.headerBadge,
            backgroundColor: "var(--bg-input, #d1fae5)",
            color: "var(--text-primary, #065f46)",
          }}>
            <Activity size={16} />
            <span>En ligne</span>
          </div>
          <div style={{
            ...styles.headerDate,
            backgroundColor: "var(--bg-card, #ffffff)",
            borderColor: "var(--border-color, #e2e8f0)",
            color: "var(--text-secondary, #475569)",
          }}>
            <Clock size={16} />
            <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Statistiques générales */}
      <div style={styles.statsOverview}>
        <div style={{
          ...styles.totalCard,
          backgroundColor: "var(--bg-card, #ffffff)",
          borderColor: "var(--border-color, #e2e8f0)",
          boxShadow: "0 1px 3px var(--shadow-color, rgba(0, 0, 0, 0.05))",
        }}>
          <div style={{
            ...styles.totalIcon,
            backgroundColor: "var(--bg-input, #f1f5f9)",
            color: "#2563eb",
          }}>
            <BarChart3 size={24} />
          </div>
          <div>
            <div style={{
              ...styles.totalValue,
              color: "var(--text-primary, #1e293b)",
            }}>{total}</div>
            <div style={{
              ...styles.totalLabel,
              color: "var(--text-secondary, #64748b)",
            }}>Total des entrées</div>
          </div>
        </div>
        <div style={{
          ...styles.totalCard,
          backgroundColor: "var(--bg-card, #ffffff)",
          borderColor: "var(--border-color, #e2e8f0)",
          boxShadow: "0 1px 3px var(--shadow-color, rgba(0, 0, 0, 0.05))",
        }}>
          <div style={{...styles.totalIcon, background: '#eff6ff', color: '#2563eb'}}>
            <Zap size={24} />
          </div>
          <div>
            <div style={{
              ...styles.totalValue,
              color: "var(--text-primary, #1e293b)",
            }}>98%</div>
            <div style={{
              ...styles.totalLabel,
              color: "var(--text-secondary, #64748b)",
            }}>Taux de disponibilité</div>
          </div>
        </div>
        <div style={{
          ...styles.totalCard,
          backgroundColor: "var(--bg-card, #ffffff)",
          borderColor: "var(--border-color, #e2e8f0)",
          boxShadow: "0 1px 3px var(--shadow-color, rgba(0, 0, 0, 0.05))",
        }}>
          <div style={{...styles.totalIcon, background: '#fef3c7', color: '#d97706'}}>
            <Award size={24} />
          </div>
          <div>
            <div style={{
              ...styles.totalValue,
              color: "var(--text-primary, #1e293b)",
            }}>24</div>
            <div style={{
              ...styles.totalLabel,
              color: "var(--text-secondary, #64748b)",
            }}>Cours ce mois-ci</div>
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
              style={{
                ...styles.statCard,
                backgroundColor: "var(--bg-card, #ffffff)",
                borderColor: "var(--border-color, #e2e8f0)",
                boxShadow: "0 1px 3px var(--shadow-color, rgba(0, 0, 0, 0.05))",
              }}
              onClick={() => window.location.href = stat.link}
            >
              <div style={styles.statCardContent}>
                <div style={styles.statCardLeft}>
                  <div style={{ ...styles.statIcon, background: stat.bg, color: stat.color }}>
                    <Icon size={24} />
                  </div>
                  <div style={styles.statInfo}>
                    <h3 style={{
                      ...styles.statValue,
                      color: "var(--text-primary, #1e293b)",
                    }}>{stat.value}</h3>
                    <p style={{
                      ...styles.statTitle,
                      color: "var(--text-secondary, #64748b)",
                    }}>{stat.title}</p>
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
                  <div style={{
                    ...styles.statProgress,
                    backgroundColor: "var(--bg-input, #e2e8f0)",
                  }}>
                    <div style={{
                      ...styles.statProgressFill,
                      width: `${Math.min((stat.value / Math.max(...Object.values(stats))) * 100, 100)}%`,
                      background: stat.gradient
                    }} />
                  </div>
                  <ChevronRight size={18} style={{
                    ...styles.arrow,
                    color: "var(--text-muted, #cbd5e1)",
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activités récentes et rapides */}
      <div style={styles.bottomSection}>
        {/* Activités récentes */}
        <div style={{
          ...styles.activitySection,
          backgroundColor: "var(--bg-card, #ffffff)",
          borderColor: "var(--border-color, #e2e8f0)",
          boxShadow: "0 1px 3px var(--shadow-color, rgba(0, 0, 0, 0.05))",
        }}>
          <div style={{
            ...styles.sectionHeader,
            borderBottom: "2px solid var(--border-color, #f1f5f9)",
          }}>
            <div style={styles.sectionHeaderLeft}>
              <Activity size={20} style={styles.sectionIcon} />
              <h2 style={{
                ...styles.sectionTitle,
                color: "var(--text-primary, #1e293b)",
              }}>Activités récentes</h2>
            </div>
            <span style={{
              ...styles.sectionBadge,
              backgroundColor: "var(--bg-input, #f1f5f9)",
              color: "var(--text-secondary, #64748b)",
            }}>Dernières 24h</span>
          </div>
          <div style={styles.activityList}>
            {recentActivity.map((activity, index) => (
              <div key={index} style={{
                ...styles.activityItem,
                backgroundColor: "var(--bg-input, #f8fafc)",
              }}>
                <div style={{
                  ...styles.activityIcon,
                  backgroundColor: "var(--bg-card, #ffffff)",
                }}>
                  {getActivityIcon(activity.type)}
                </div>
                <div style={styles.activityContent}>
                  <div style={{
                    ...styles.activityAction,
                    color: "var(--text-primary, #1e293b)",
                  }}>{activity.action}</div>
                  <div style={{
                    ...styles.activityUser,
                    color: "var(--text-secondary, #64748b)",
                  }}>{activity.user}</div>
                </div>
                <div style={{
                  ...styles.activityTime,
                  color: "var(--text-muted, #94a3b8)",
                }}>{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions rapides */}
        <div style={{
          ...styles.quickActions,
          backgroundColor: "var(--bg-card, #ffffff)",
          borderColor: "var(--border-color, #e2e8f0)",
          boxShadow: "0 1px 3px var(--shadow-color, rgba(0, 0, 0, 0.05))",
        }}>
          <div style={{
            ...styles.sectionHeader,
            borderBottom: "2px solid var(--border-color, #f1f5f9)",
          }}>
            <Zap size={20} style={styles.sectionIcon} />
            <h2 style={{
              ...styles.sectionTitle,
              color: "var(--text-primary, #1e293b)",
            }}>Actions rapides</h2>
          </div>
          <div style={styles.quickActionsGrid}>
            <button style={{
              ...styles.quickAction,
              backgroundColor: "var(--bg-input, #f8fafc)",
              borderColor: "var(--border-color, #e2e8f0)",
            }} onClick={() => window.location.href = '/admin/profs'}>
              <UserPlus size={20} style={styles.quickActionIcon} />
              <span style={{
                ...styles.quickActionText,
                color: "var(--text-primary, #1e293b)",
              }}>Ajouter un professeur</span>
            </button>
            <button style={{
              ...styles.quickAction,
              backgroundColor: "var(--bg-input, #f8fafc)",
              borderColor: "var(--border-color, #e2e8f0)",
            }} onClick={() => window.location.href = '/admin/etudiants'}>
              <UserCheck size={20} style={styles.quickActionIcon} />
              <span style={{
                ...styles.quickActionText,
                color: "var(--text-primary, #1e293b)",
              }}>Ajouter un étudiant</span>
            </button>
            <button style={{
              ...styles.quickAction,
              backgroundColor: "var(--bg-input, #f8fafc)",
              borderColor: "var(--border-color, #e2e8f0)",
            }} onClick={() => window.location.href = '/admin/salles'}>
              <School size={20} style={styles.quickActionIcon} />
              <span style={{
                ...styles.quickActionText,
                color: "var(--text-primary, #1e293b)",
              }}>Gérer les salles</span>
            </button>
            <button style={{
              ...styles.quickAction,
              backgroundColor: "var(--bg-input, #f8fafc)",
              borderColor: "var(--border-color, #e2e8f0)",
            }} onClick={() => window.location.href = '/admin/edt'}>
              <Calendar size={20} style={styles.quickActionIcon} />
              <span style={{
                ...styles.quickActionText,
                color: "var(--text-primary, #1e293b)",
              }}>Planifier un cours</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer du dashboard */}
      <div style={{
        ...styles.dashboardFooter,
        borderTop: "1px solid var(--border-color, #e2e8f0)",
      }}>
        <p style={{
          ...styles.footerText,
          color: "var(--text-muted, #94a3b8)",
        }}>
          <Star size={14} style={styles.footerIcon} />
          Système de gestion d'emploi du temps - ENI Fianarantsoa
        </p>
        <p style={{
          ...styles.footerText,
          color: "var(--text-muted, #94a3b8)",
        }}>
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
    margin: '0 0 4px 0',
    fontFamily: '"Poppins", "Inter", sans-serif',
  },
  subtitle: {
    fontSize: '14px',
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
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500,
  },
  headerDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    fontSize: '12px',
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
  },
  totalLabel: {
    fontSize: '12px',
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
    margin: 0,
  },
  statTitle: {
    fontSize: '14px',
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
    borderRadius: '2px',
    overflow: 'hidden',
  },
  statProgressFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.6s ease',
  },
  arrow: {
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
    margin: 0,
  },
  sectionBadge: {
    fontSize: '11px',
    padding: '4px 12px',
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
    flexShrink: 0,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: '14px',
    fontWeight: 500,
  },
  activityUser: {
    fontSize: '12px',
  },
  activityTime: {
    fontSize: '11px',
    fontWeight: 500,
  },

  // Quick Actions
  quickActions: {
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
      box-shadow: 0 8px 25px var(--shadow-color, rgba(0, 0, 0, 0.08));
    }

    .stat-card:hover .arrow {
      color: #2563eb;
      transform: translateX(4px);
    }

    .total-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px var(--shadow-color, rgba(0, 0, 0, 0.08));
      transition: all 0.2s ease;
    }

    .activity-item:hover {
      background-color: var(--bg-card, #ffffff) !important;
      box-shadow: 0 2px 8px var(--shadow-color, rgba(0, 0, 0, 0.05));
      transform: translateX(4px);
    }

    .quick-action:hover {
      background-color: var(--bg-card, #ffffff) !important;
      border-color: #2563eb !important;
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