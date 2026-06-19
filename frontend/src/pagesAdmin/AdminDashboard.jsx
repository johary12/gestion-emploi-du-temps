// src/pagesAdmin/AdminDashboard.jsx - Version sans section Distribution
import { useState, useEffect, useCallback } from 'react';
import { 
  Users, BookOpen, DoorOpen, Calendar, ChevronRight, 
  TrendingUp, TrendingDown, BarChart3, Activity, 
  Clock, CheckCircle, AlertCircle, Zap, Award, Star,
  UserPlus, UserCheck, School, GraduationCap, RefreshCw,
  Target, Briefcase, FileText, Settings,
  ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { profService, etudiantService, salleService, edtService } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function AdminDashboard() {
  const { theme } = useTheme();
  const [stats, setStats] = useState({ profs: 0, etudiants: 0, salles: 0, cours: 0 });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [trends, setTrends] = useState({});
  const [currentPage, setCurrentPage] = useState(0);

  // Générer des activités récentes à partir des données réelles
  const generateRecentActivity = async () => {
    try {
      const [profsRes, etudiantsRes, sallesRes, coursRes] = await Promise.all([
        profService.getAll(),
        etudiantService.getAll(),
        salleService.getAll(),
        edtService.getAll()
      ]);

      const activities = [];

      if (profsRes.data && profsRes.data.length > 0) {
        const recentProfs = profsRes.data.slice(-3);
        recentProfs.forEach(prof => {
          activities.push({
            action: `A ajouté un nouveau professeur: ${prof.nom || prof.name || 'Sans nom'}`,
            user: 'Administrateur',
            time: prof.createdAt || 'Récemment',
            type: 'success',
            icon: 'user-plus'
          });
        });
      }

      if (etudiantsRes.data && etudiantsRes.data.length > 0) {
        const recentEtudiants = etudiantsRes.data.slice(-3);
        recentEtudiants.forEach(etudiant => {
          activities.push({
            action: `A inscrit un nouvel étudiant: ${etudiant.nom || etudiant.name || 'Sans nom'}`,
            user: 'Administrateur',
            time: etudiant.createdAt || 'Récemment',
            type: 'success',
            icon: 'user-check'
          });
        });
      }

      if (sallesRes.data && sallesRes.data.length > 0) {
        const recentSalles = sallesRes.data.slice(-3);
        recentSalles.forEach(salle => {
          const nomSalle = salle.nom || salle.numero || salle.name || 'Sans nom';
          activities.push({
            action: `A ajouté une nouvelle salle: ${nomSalle}`,
            user: 'Administrateur',
            time: salle.createdAt || 'Récemment',
            type: 'info',
            icon: 'door-open'
          });
        });
      }

      if (coursRes.data && coursRes.data.length > 0) {
        const recentCours = coursRes.data.slice(-3);
        recentCours.forEach(cours => {
          const nomCours = cours.nom || cours.matiere || cours.name || cours.titre || 'Sans nom';
          activities.push({
            action: `A planifié un nouveau cours: ${nomCours}`,
            user: 'Administrateur',
            time: cours.createdAt || 'Récemment',
            type: 'info',
            icon: 'calendar'
          });
        });
      }

      if (activities.length === 0) {
        activities.push({
          action: 'Bienvenue sur le tableau de bord',
          user: 'Système',
          time: 'Maintenant',
          type: 'info',
          icon: 'activity'
        });
        activities.push({
          action: 'Commencez à ajouter des données',
          user: 'Système',
          time: 'Maintenant',
          type: 'info',
          icon: 'activity'
        });
      }

      activities.sort((a, b) => {
        if (a.time === 'Récemment' && b.time !== 'Récemment') return -1;
        if (b.time === 'Récemment' && a.time !== 'Récemment') return 1;
        return 0;
      });

      return activities.slice(0, 20);
      
    } catch (error) {
      console.error('Erreur lors de la génération des activités:', error);
      return getFallbackActivities();
    }
  };

  const getFallbackActivities = () => {
    return [
      { action: 'Bienvenue sur le tableau de bord', user: 'Système', time: 'Maintenant', type: 'info', icon: 'activity' },
      { action: 'Ajoutez des professeurs, étudiants ou salles', user: 'Système', time: 'Maintenant', type: 'info', icon: 'activity' },
    ];
  };

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
      
      setTrends({
        profs: { change: 12, direction: 'up' },
        etudiants: { change: 8, direction: 'up' },
        salles: { change: 2, direction: 'up' },
        cours: { change: 5, direction: 'down' }
      });

      const activities = await generateRecentActivity();
      setRecentActivity(activities);
      
    } catch (error) {
      console.error('Erreur:', error);
      setRecentActivity(getFallbackActivities());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleRefresh = () => {
    setLoading(true);
    loadStats();
  };

  const getActivityIcon = (type, iconName) => {
    switch(iconName) {
      case 'user-plus': return <UserPlus size={16} color="#2563eb" />;
      case 'user-check': return <UserCheck size={16} color="#10b981" />;
      case 'door-open': return <DoorOpen size={16} color="#d97706" />;
      case 'calendar': return <Calendar size={16} color="#3b82f6" />;
      default:
        switch(type) {
          case 'success': return <CheckCircle size={16} color="#10b981" />;
          case 'warning': return <AlertCircle size={16} color="#f59e0b" />;
          case 'info': return <Clock size={16} color="#3b82f6" />;
          default: return <Activity size={16} color="var(--text-muted, #64748b)" />;
        }
    }
  };

  const itemsPerPage = 5;
  const totalPages = Math.ceil(recentActivity.length / itemsPerPage);
  const currentActivities = recentActivity.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

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
      subInfo: `+${trends.profs?.change || 0}% ce mois-ci`,
      trend: trends.profs?.direction || 'up'
    },
    { 
      title: 'Étudiants', 
      value: stats.etudiants, 
      icon: GraduationCap, 
      color: '#059669', 
      bg: '#d1fae5',
      link: '/admin/etudiants',
      gradient: 'linear-gradient(135deg, #059669, #10b981)',
      subInfo: `+${trends.etudiants?.change || 0}% ce mois-ci`,
      trend: trends.etudiants?.direction || 'up'
    },
    { 
      title: 'Salles', 
      value: stats.salles, 
      icon: DoorOpen, 
      color: '#d97706', 
      bg: '#fef3c7',
      link: '/admin/salles',
      gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
      subInfo: `+${trends.salles?.change || 0} nouvelles`,
      trend: trends.salles?.direction || 'up'
    },
    { 
      title: 'Cours planifiés', 
      value: stats.cours, 
      icon: Calendar, 
      color: '#dc2626', 
      bg: '#fee2e2',
      link: '/admin/edt',
      gradient: 'linear-gradient(135deg, #dc2626, #ef4444)',
      subInfo: `${trends.cours?.change || 0}% ce mois-ci`,
      trend: trends.cours?.direction || 'down'
    }
  ];

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
          }}>Tableau de bord</h1>
          <p style={{
            ...styles.subtitle,
            color: "var(--text-secondary, #64748b)",
          }}>Bienvenue sur votre espace d'administration</p>
        </div>
        <div style={styles.headerActions}>
          <button 
            onClick={handleRefresh}
            style={{
              ...styles.refreshButton,
              backgroundColor: "var(--bg-card, #ffffff)",
              borderColor: "var(--border-color, #e2e8f0)",
              color: "var(--text-secondary, #475569)",
            }}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>Actualiser</span>
          </button>
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
        <div style={{
          ...styles.totalCard,
          backgroundColor: "var(--bg-card, #ffffff)",
          borderColor: "var(--border-color, #e2e8f0)",
          boxShadow: "0 1px 3px var(--shadow-color, rgba(0, 0, 0, 0.05))",
        }}>
          <div style={{...styles.totalIcon, background: '#fce7f3', color: '#db2777'}}>
            <Target size={24} />
          </div>
          <div>
            <div style={{
              ...styles.totalValue,
              color: "var(--text-primary, #1e293b)",
            }}>85%</div>
            <div style={{
              ...styles.totalLabel,
              color: "var(--text-secondary, #64748b)",
            }}>Objectifs atteints</div>
          </div>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div style={styles.statsGrid}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isTrendingUp = stat.trend === 'up';
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

      {/* Activités récentes et actions rapides */}
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
              <Clock size={20} style={styles.sectionIcon} />
              <h2 style={{
                ...styles.sectionTitle,
                color: "var(--text-primary, #1e293b)",
              }}>Activités récentes</h2>
            </div>
            <span style={{
              ...styles.sectionBadge,
              backgroundColor: "var(--bg-input, #eff6ff)",
              color: "#2563eb",
            }}>{recentActivity.length} activités</span>
          </div>

          <div style={styles.activityList}>
            {currentActivities.length > 0 ? (
              currentActivities.map((activity, index) => (
                <div key={index} style={{
                  ...styles.activityItem,
                  backgroundColor: "var(--bg-input, #f8fafc)",
                }}>
                  <div style={{
                    ...styles.activityIcon,
                    backgroundColor: "var(--bg-card, #ffffff)",
                  }}>
                    {getActivityIcon(activity.type, activity.icon)}
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
              ))
            ) : (
              <div style={styles.noActivity}>
                <Activity size={32} style={styles.noActivityIcon} />
                <p style={{
                  ...styles.noActivityText,
                  color: "var(--text-secondary, #64748b)",
                }}>Aucune activité récente</p>
                <p style={{
                  ...styles.noActivitySubtext,
                  color: "var(--text-muted, #94a3b8)",
                }}>Les actions que vous effectuez apparaîtront ici</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button 
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                style={{
                  ...styles.paginationButton,
                  backgroundColor: "var(--bg-input, #f8fafc)",
                  borderColor: "var(--border-color, #e2e8f0)",
                  color: "var(--text-secondary, #475569)",
                  opacity: currentPage === 0 ? 0.5 : 1,
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{
                ...styles.paginationInfo,
                color: "var(--text-secondary, #64748b)",
              }}>
                {currentPage + 1} / {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                style={{
                  ...styles.paginationButton,
                  backgroundColor: "var(--bg-input, #f8fafc)",
                  borderColor: "var(--border-color, #e2e8f0)",
                  color: "var(--text-secondary, #475569)",
                  opacity: currentPage === totalPages - 1 ? 0.5 : 1,
                }}
              >
                <ChevronRightIcon size={16} />
              </button>
            </div>
          )}
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
            <div style={styles.sectionHeaderLeft}>
              <Zap size={20} style={styles.sectionIcon} />
              <h2 style={{
                ...styles.sectionTitle,
                color: "var(--text-primary, #1e293b)",
              }}>Actions rapides</h2>
            </div>
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
            <button style={{
              ...styles.quickAction,
              backgroundColor: "var(--bg-input, #f8fafc)",
              borderColor: "var(--border-color, #e2e8f0)",
            }} onClick={() => window.location.href = '/admin/parametres'}>
              <Settings size={20} style={styles.quickActionIcon} />
              <span style={{
                ...styles.quickActionText,
                color: "var(--text-primary, #1e293b)",
              }}>Paramètres</span>
            </button>
            <button style={{
              ...styles.quickAction,
              backgroundColor: "var(--bg-input, #f8fafc)",
              borderColor: "var(--border-color, #e2e8f0)",
            }} onClick={() => window.location.href = '/admin/aide'}>
              <FileText size={20} style={styles.quickActionIcon} />
              <span style={{
                ...styles.quickActionText,
                color: "var(--text-primary, #1e293b)",
              }}>Centre d'aide</span>
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

// Styles
const styles = {
  container: {
    padding: '24px 32px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '"Inter", "Poppins", "Roboto", -apple-system, sans-serif',
    minHeight: '100vh',
  },

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
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: 500,
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

  bottomSection: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
    marginBottom: '32px',
  },

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
    gap: '10px',
    minHeight: '200px',
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

  noActivity: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 20px',
    gap: '8px',
  },
  noActivityIcon: {
    color: 'var(--text-muted, #94a3b8)',
    opacity: 0.5,
  },
  noActivityText: {
    fontSize: '16px',
    fontWeight: 500,
    margin: 0,
  },
  noActivitySubtext: {
    fontSize: '13px',
    margin: 0,
  },

  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid var(--border-color, #f1f5f9)',
  },
  paginationButton: {
    padding: '4px 10px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    background: 'none',
  },
  paginationInfo: {
    fontSize: '13px',
    fontWeight: 500,
  },

  quickActions: {
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  quickAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
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
    fontSize: '13px',
    fontWeight: 500,
  },

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

// Animations
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .spin {
      animation: spin 0.8s linear infinite;
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

    .refresh-button:hover:not(:disabled) {
      background-color: var(--bg-input, #f1f5f9) !important;
      border-color: #2563eb !important;
      color: #2563eb !important;
    }

    .refresh-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .pagination-button:hover:not(:disabled) {
      background-color: var(--bg-input, #f1f5f9) !important;
      border-color: #2563eb !important;
      color: #2563eb !important;
    }

    .pagination-button:disabled {
      cursor: not-allowed;
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
        flex-wrap: wrap;
      }
      
      .stats-overview {
        grid-template-columns: 1fr 1fr;
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
      
      .quick-actions-grid {
        grid-template-columns: 1fr;
      }
      
      .dashboard-footer {
        flex-direction: column;
        text-align: center;
      }
    }

    @media (max-width: 480px) {
      .stats-overview {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}