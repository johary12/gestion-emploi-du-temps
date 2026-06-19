// src/components/NavbarProf.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Calendar, Clock, LogOut, BookOpen, Bell,
  ChevronLeft, ChevronRight, User, Settings, HelpCircle, CheckCircle,
  AlertCircle, Info, RefreshCw, X, AlertTriangle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { edtService } from "../services/api";

export default function NavbarProf({ children }) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  const isDark = theme === 'dark';

  const menu = [
    { path: "/prof/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { path: "/prof/disponibilites", label: "Mes disponibilités", icon: Clock },
    { path: "/prof/emploi", label: "Emploi du temps", icon: Calendar }
  ];

  // Charger les notifications au montage
  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user]);

  // Vérifier les nouvelles notifications périodiquement
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.id) {
        loadNotifications();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const loadNotifications = async () => {
    if (!user?.id) return;

    setLoadingNotifications(true);
    try {
      const storageKey = `profNotifications_${user.id}`;
      let storedNotifications = [];
      
      try {
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
          storedNotifications = JSON.parse(storedData);
        }
      } catch (e) {
        storedNotifications = [];
      }

      let globalNotifications = [];
      try {
        const globalData = localStorage.getItem('profNotifications');
        if (globalData) {
          globalNotifications = JSON.parse(globalData);
        }
      } catch (e) {
        globalNotifications = [];
      }

      let allNotifications = [...storedNotifications];
      
      globalNotifications.forEach(globalNotif => {
        const exists = allNotifications.some(n => 
          n.id === globalNotif.id || 
          (n.courseId === globalNotif.courseId && n.type === globalNotif.type)
        );
        if (!exists) {
          if (!globalNotif.profId || globalNotif.profId === user.id) {
            allNotifications.push(globalNotif);
          }
        }
      });

      try {
        const response = await edtService.getMySchedule();
        const courses = response.data || [];
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        courses.forEach(course => {
          const courseDate = new Date(course.date || course.createdAt || Date.now());
          
          if (courseDate > weekAgo && courseDate <= today) {
            const isNew = !allNotifications.some(n => 
              n.type === 'new_course' && n.courseId === course.id
            );
            if (isNew) {
              const newNotif = {
                id: `course_${course.id}_${Date.now()}`,
                type: 'new_course',
                message: `📚 Nouveau cours ajouté: ${course.matiere || course.nom || 'Cours'}`,
                date: courseDate.toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }),
                read: false,
                icon: 'check-circle',
                color: '#10b981',
                courseId: course.id,
                profId: user.id,
                courseName: course.matiere || course.nom || 'Cours'
              };
              allNotifications.unshift(newNotif);
            }
          }
        });
      } catch (apiError) {
        console.error('Erreur récupération cours API:', apiError);
      }

      const edtModified = localStorage.getItem('edtLastModified');
      if (edtModified) {
        const lastModified = new Date(edtModified);
        const isRecent = (today - lastModified) < 24 * 60 * 60 * 1000;
        
        if (isRecent) {
          const hasModifNotification = allNotifications.some(n => 
            n.type === 'edt_modification' && 
            new Date(n.timestamp || 0) > lastModified
          );
          if (!hasModifNotification) {
            const modifNotif = {
              id: `edt_modif_${Date.now()}`,
              type: 'edt_modification',
              message: '🔄 Modification de l\'emploi du temps',
              date: lastModified.toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              read: false,
              icon: 'alert-circle',
              color: '#f59e0b',
              profId: user.id,
              timestamp: lastModified.toISOString()
            };
            allNotifications.unshift(modifNotif);
          }
        }
      }

      const seenIds = new Set();
      const uniqueNotifications = allNotifications.filter(n => {
        const key = n.courseId ? `${n.type}_${n.courseId}` : `${n.type}_${n.id}`;
        if (seenIds.has(key)) return false;
        seenIds.add(key);
        return true;
      });

      uniqueNotifications.sort((a, b) => {
        const dateA = new Date(a.date || a.timestamp || 0);
        const dateB = new Date(b.date || b.timestamp || 0);
        return dateB - dateA;
      });

      const limitedNotifications = uniqueNotifications.slice(0, 50);
      
      setNotifications(limitedNotifications);
      
      const unread = limitedNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
      setNotificationCount(limitedNotifications.length);

      try {
        localStorage.setItem(storageKey, JSON.stringify(limitedNotifications));
      } catch (e) {
        console.error('Erreur sauvegarde localStorage:', e);
      }

    } catch (error) {
      console.error('❌ Erreur lors du chargement des notifications:', error);
      try {
        const storageKey = `profNotifications_${user.id}`;
        const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
        setNotifications(stored);
        setUnreadCount(stored.filter(n => !n.read).length);
        setNotificationCount(stored.length);
      } catch (e) {
        setNotifications([]);
        setUnreadCount(0);
        setNotificationCount(0);
      }
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markAsRead = (notificationId) => {
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
    if (user?.id) {
      localStorage.setItem(`profNotifications_${user.id}`, JSON.stringify(updated));
    }
    localStorage.setItem('profNotifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    setUnreadCount(0);
    if (user?.id) {
      localStorage.setItem(`profNotifications_${user.id}`, JSON.stringify(updated));
    }
    localStorage.setItem('profNotifications', JSON.stringify(updated));
  };

  const deleteNotification = (notificationId) => {
    const updated = notifications.filter(n => n.id !== notificationId);
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
    if (user?.id) {
      localStorage.setItem(`profNotifications_${user.id}`, JSON.stringify(updated));
    }
    localStorage.setItem('profNotifications', JSON.stringify(updated));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    if (user?.id) {
      localStorage.setItem(`profNotifications_${user.id}`, JSON.stringify([]));
    }
    localStorage.removeItem('profNotifications');
  };

  const refreshNotifications = () => {
    loadNotifications();
  };

  useEffect(() => {
    const handleEscape = (e) => { 
      if (e.key === 'Escape' && showConfirmModal) setShowConfirmModal(false); 
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showConfirmModal]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showNotifications && !e.target.closest('.notifications-container')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications]);

  const handleLogout = async () => { 
    await logout(); 
    navigate("/"); 
  };

  const getNotificationIcon = (notification) => {
    switch(notification.icon || notification.type) {
      case 'check-circle':
      case 'new_course':
        return <CheckCircle size={16} color="#10b981" />;
      case 'alert-circle':
      case 'edt_modification':
        return <AlertCircle size={16} color="#f59e0b" />;
      case 'info':
        return <Info size={16} color="#3b82f6" />;
      default:
        return <Bell size={16} color="#64748b" />;
    }
  };

  const getNotificationBg = (notification) => {
    if (notification.read) return 'transparent';
    switch(notification.icon || notification.type) {
      case 'check-circle':
      case 'new_course':
        return '#f0fdf4';
      case 'alert-circle':
      case 'edt_modification':
        return '#fffbeb';
      case 'info':
        return '#eff6ff';
      default:
        return 'transparent';
    }
  };

  const isCourseNotification = (notification) => {
    return notification.type === 'new_course' || notification.courseId;
  };

  return (
    <div style={{
      ...styles.page,
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
      color: isDark ? '#f1f5f9' : '#1e293b',
    }}>
      {/* SIDEBAR */}
      <div style={{ 
        ...styles.sidebar,
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderRight: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        width: sidebarOpen ? 280 : 80,
        boxShadow: sidebarOpen 
          ? `2px 0 20px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0, 0, 0, 0.08)'}` 
          : `2px 0 10px ${isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0, 0, 0, 0.05)'}`
      }}>
        <button 
          style={{
            ...styles.toggle,
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderColor: isDark ? '#475569' : '#e2e8f0',
            color: isDark ? '#94a3b8' : '#475569',
          }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Réduire le menu" : "Agrandir le menu"}
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>

        {/* LOGO */}
        <div style={{
          ...styles.logo,
          borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
        }}>
          <div style={styles.logoIcon}>
            <BookOpen size={sidebarOpen ? 32 : 28} color="#059669" />
          </div>
          {sidebarOpen && (
            <div style={styles.logoText}>
              <b style={{
                ...styles.logoTitle,
                color: isDark ? '#f1f5f9' : '#1e293b',
              }}>ENI Prof</b>
              <small style={{
                ...styles.logoSubtitle,
                color: isDark ? '#94a3b8' : '#64748b',
              }}>Espace enseignant</small>
            </div>
          )}
        </div>

        {/* USER INFO */}
        <div style={{
          ...styles.user,
          borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
        }}>
          <div style={styles.avatar}>
            {user?.name?.charAt(0) || user?.nom?.charAt(0) || "P"}
          </div>
          {sidebarOpen && (
            <div style={styles.userInfo}>
              <b style={{
                ...styles.userName,
                color: isDark ? '#f1f5f9' : '#1e293b',
              }}>{user?.name || user?.nom || "Professeur"}</b>
              <small style={{
                ...styles.userRole,
                color: isDark ? '#94a3b8' : '#64748b',
              }}>Professeur</small>
            </div>
          )}
        </div>

        {/* MENU */}
        <nav style={styles.menu} role="navigation" aria-label="Menu principal">
          {menu.map(item => { 
            const Icon = item.icon; 
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                style={{ 
                  ...styles.link, 
                  backgroundColor: isActive ? '#059669' : 'transparent', 
                  color: isActive ? 'white' : (isDark ? '#94a3b8' : '#475569'),
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  padding: sidebarOpen ? '12px 16px' : '12px',
                  borderRadius: sidebarOpen ? '12px' : '10px',
                  marginBottom: '4px',
                }}
                aria-current={isActive ? 'page' : undefined}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon size={20} />
                {sidebarOpen && <span style={styles.linkLabel}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM ACTIONS */}
        <div style={{
          ...styles.bottom,
          borderTop: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
        }}>
          <div style={{ position: 'relative', width: '100%' }} className="notifications-container">
            <button 
              style={{
                ...styles.button,
                position: 'relative',
                color: isDark ? '#94a3b8' : '#475569',
              }}
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Bell size={20} />
                {sidebarOpen && <span>Notifications</span>}
              </div>
              {unreadCount > 0 && (
                <span style={styles.badge} aria-label={`${unreadCount} notifications non lues`}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div style={{
                ...styles.notificationsDropdown,
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                boxShadow: `0 10px 40px ${isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0, 0, 0, 0.15)'}`,
              }} role="dialog" aria-label="Notifications">
                <div style={{
                  ...styles.notificationsHeader,
                  backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                  borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                }}>
                  <div style={styles.notificationsHeaderLeft}>
                    <span style={{
                      ...styles.notificationsTitle,
                      color: isDark ? '#f1f5f9' : '#1e293b',
                    }}>🔔 Notifications</span>
                    {unreadCount > 0 && (
                      <span style={styles.unreadBadge}>{unreadCount} non lue(s)</span>
                    )}
                    <span style={styles.totalBadge}>{notificationCount} total</span>
                  </div>
                  <div style={styles.notificationsHeaderRight}>
                    <button 
                      onClick={refreshNotifications} 
                      style={styles.refreshBtn}
                      aria-label="Rafraîchir"
                      disabled={loadingNotifications}
                    >
                      <RefreshCw size={14} className={loadingNotifications ? 'spin' : ''} />
                    </button>
                    {notifications.length > 0 && (
                      <>
                        <button 
                          onClick={markAllAsRead} 
                          style={styles.markAllRead}
                          aria-label="Marquer toutes comme lues"
                        >
                          Tout lire
                        </button>
                        <button 
                          onClick={clearAllNotifications} 
                          style={styles.clearAll}
                          aria-label="Effacer toutes les notifications"
                        >
                          ×
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => setShowNotifications(false)} 
                      style={styles.closeDropdown}
                      aria-label="Fermer les notifications"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div style={styles.notificationsList}>
                  {loadingNotifications ? (
                    <div style={styles.loadingNotifications}>
                      <div style={styles.spinnerSmall} />
                      <span>Chargement des notifications...</span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div style={styles.noNotifications}>
                      <Bell size={32} color="#cbd5e1" />
                      <p style={{ fontWeight: 500, color: isDark ? '#94a3b8' : '#475569' }}>Aucune notification</p>
                      <small style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                        Vous serez informé des nouveaux cours et modifications
                      </small>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        style={{
                          ...styles.notificationItem,
                          backgroundColor: getNotificationBg(n),
                          opacity: n.read ? 0.7 : 1,
                          borderLeft: !n.read ? `3px solid ${n.color || '#059669'}` : '3px solid transparent',
                          borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
                        }}
                        onClick={() => markAsRead(n.id)}
                      >
                        <div style={styles.notificationIconWrapper}>
                          {getNotificationIcon(n)}
                        </div>
                        <div style={styles.notificationContent}>
                          <div style={{
                            ...styles.notificationMessage,
                            color: isDark ? '#f1f5f9' : '#1e293b',
                          }}>{n.message}</div>
                          <div style={styles.notificationMeta}>
                            <span style={styles.notificationDate}>
                              {n.date || n.timestamp || 'Récemment'}
                            </span>
                            {isCourseNotification(n) && (
                              <span style={styles.notificationTag}>📚 Cours</span>
                            )}
                            {n.type === 'edt_modification' && (
                              <span style={{...styles.notificationTag, backgroundColor: '#fffbeb', color: '#d97706'}}>
                                🔄 Modification
                              </span>
                            )}
                          </div>
                        </div>
                        {!n.read && <div style={styles.notificationUnread} />}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(n.id);
                          }}
                          style={styles.deleteNotification}
                          aria-label="Supprimer la notification"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div style={{
                    ...styles.notificationsFooter,
                    borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  }}>
                    <button 
                      onClick={clearAllNotifications} 
                      style={styles.clearAllBtn}
                    >
                      Effacer toutes les notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lien vers Paramètres */}
          <Link to="/prof/parametres" style={{ textDecoration: 'none', width: '100%' }}>
            <button 
              style={{
                ...styles.button,
                backgroundColor: location.pathname === '/prof/parametres' ? (isDark ? '#334155' : '#f1f5f9') : 'transparent',
                color: location.pathname === '/prof/parametres' ? '#059669' : (isDark ? '#94a3b8' : '#475569'),
              }}
              aria-label="Paramètres"
            >
              <Settings size={20} />
              {sidebarOpen && <span>Paramètres</span>}
            </button>
          </Link>
          
          {/* Lien vers Aide */}
          <Link to="/prof/aide" style={{ textDecoration: 'none', width: '100%' }}>
            <button 
              style={{
                ...styles.button,
                backgroundColor: location.pathname === '/prof/aide' ? (isDark ? '#334155' : '#f1f5f9') : 'transparent',
                color: location.pathname === '/prof/aide' ? '#059669' : (isDark ? '#94a3b8' : '#475569'),
              }}
              aria-label="Aide"
            >
              <HelpCircle size={20} />
              {sidebarOpen && <span>Aide</span>}
            </button>
          </Link>

          {/* Bouton Déconnexion */}
          <button 
            style={{ 
              ...styles.button, 
              color: '#dc2626',
              backgroundColor: location.pathname === '/prof/logout' ? (isDark ? '#334155' : '#f1f5f9') : 'transparent',
            }}
            onClick={() => setShowConfirmModal(true)}
            aria-label="Déconnexion"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <main 
        style={{ 
          marginLeft: sidebarOpen ? 280 : 80, 
          width: `calc(100% - ${sidebarOpen ? 280 : 80}px)`, 
          minHeight: "100vh", 
          padding: "30px", 
          boxSizing: "border-box", 
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", 
          backgroundColor: isDark ? '#0f172a' : '#f8fafc',
          color: isDark ? '#f1f5f9' : '#1e293b',
        }}
      >
        {children}
      </main>

      {/* MODAL DE CONFIRMATION - Version moderne identique à NavbarAdmin */}
      {showConfirmModal && (
        <div 
          style={styles.modalOverlay} 
          className="modal-overlay"
          role="dialog" 
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={() => setShowConfirmModal(false)}
        >
          <div style={{
            ...styles.modalContent,
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            boxShadow: `0 20px 60px ${isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0, 0, 0, 0.2)'}`,
            maxWidth: "420px",
          }} onClick={e => e.stopPropagation()}>
            {/* Header avec icône d'avertissement */}
            <div style={styles.deleteModalHeader}>
              <div style={{
                ...styles.deleteIconContainer,
                backgroundColor: isDark ? '#2d1b1b' : '#fef2f2',
              }}>
                <AlertTriangle size={32} style={styles.deleteIcon} />
              </div>
              <button 
                onClick={() => setShowConfirmModal(false)} 
                style={{
                  ...styles.modalClose,
                  color: isDark ? '#94a3b8' : '#94a3b8',
                }}
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Corps du modal */}
            <div style={styles.deleteModalBody}>
              <h3 style={{
                ...styles.deleteModalTitle,
                color: isDark ? '#f1f5f9' : '#1e293b',
              }}>Confirmation de déconnexion</h3>
              <p style={{
                ...styles.deleteModalText,
                color: isDark ? '#94a3b8' : '#475569',
              }}>
                Êtes-vous sûr de vouloir vous déconnecter ?
              </p>
              <p style={{
                ...styles.deleteModalSubtext,
                color: isDark ? '#64748b' : '#94a3b8',
              }}>
                Vous devrez vous reconnecter pour accéder à votre espace.
              </p>
            </div>

            {/* Footer avec boutons */}
            <div style={styles.deleteModalFooter}>
              <button 
                onClick={() => setShowConfirmModal(false)} 
                style={{
                  ...styles.deleteCancelBtn,
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  borderColor: isDark ? '#475569' : '#e2e8f0',
                  color: isDark ? '#f1f5f9' : '#475569',
                }}
                aria-label="Annuler la déconnexion"
              >
                Annuler
              </button>
              <button 
                onClick={handleLogout} 
                style={styles.deleteConfirmBtn}
                aria-label="Confirmer la déconnexion"
              >
                <LogOut size={16} />
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { 
    minHeight: "100vh", 
    fontFamily: '"Inter", "Poppins", "Roboto", -apple-system, sans-serif',
    transition: 'all 0.3s ease',
  },
  
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 1000,
    overflowX: "hidden",
  },
  
  toggle: {
    position: "absolute",
    right: -14,
    top: 24,
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "2px solid #e2e8f0",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1001,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    transition: "all 0.2s ease",
    padding: 0,
  },
  
  logo: {
    padding: "24px 20px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    minHeight: "80px",
  },
  logoIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "32px",
  },
  logoText: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  logoTitle: {
    fontSize: "18px",
    fontWeight: 700,
    fontFamily: '"Poppins", "Inter", sans-serif',
  },
  logoSubtitle: {
    fontSize: "11px",
    fontWeight: 400,
  },
  
  user: {
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    fontSize: "18px",
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(5, 150, 105, 0.3)",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    overflow: "hidden",
  },
  userName: {
    fontSize: "14px",
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userRole: {
    fontSize: "11px",
    fontWeight: 400,
  },
  
  menu: {
    flex: 1,
    padding: "16px 12px",
    overflowY: "auto",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    textDecoration: "none",
    transition: "all 0.2s ease",
    fontWeight: 500,
    fontSize: "14px",
    padding: "12px 16px",
    borderRadius: "12px",
    marginBottom: "4px",
    position: "relative",
  },
  linkLabel: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  
  bottom: {
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  button: {
    width: "100%",
    padding: "10px 12px",
    border: "none",
    backgroundColor: "transparent",
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
    borderRadius: "10px",
    transition: "all 0.2s ease",
    fontWeight: 500,
    fontSize: "14px",
    position: "relative",
    textAlign: "left",
  },
  
  badge: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "#dc2626",
    color: "white",
    borderRadius: "50%",
    minWidth: "20px",
    height: "20px",
    fontSize: "10px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 4px",
  },
  
  notificationsDropdown: {
    position: "absolute",
    bottom: "calc(100% + 8px)",
    left: 0,
    width: "400px",
    maxWidth: "calc(100vw - 20px)",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    zIndex: 1002,
    overflow: "hidden",
    animation: "slideUp 0.2s ease-out",
  },
  notificationsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #e2e8f0",
  },
  notificationsHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  notificationsHeaderRight: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  notificationsTitle: {
    fontWeight: 600,
    fontSize: "14px",
  },
  unreadBadge: {
    fontSize: "11px",
    color: "#059669",
    fontWeight: 500,
    backgroundColor: "#d1fae5",
    padding: "2px 8px",
    borderRadius: "12px",
  },
  totalBadge: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: 400,
    backgroundColor: "#f1f5f9",
    padding: "2px 8px",
    borderRadius: "12px",
  },
  refreshBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#94a3b8",
    padding: "4px",
    borderRadius: "4px",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  markAllRead: {
    background: "none",
    border: "none",
    fontSize: "11px",
    cursor: "pointer",
    color: "#2563eb",
    padding: "2px 8px",
    borderRadius: "4px",
    transition: "all 0.2s ease",
    fontWeight: 500,
  },
  clearAll: {
    background: "none",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    color: "#94a3b8",
    padding: "0 4px",
    transition: "color 0.2s ease",
  },
  closeDropdown: {
    background: "none",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    color: "#94a3b8",
    padding: "0 4px",
    transition: "color 0.2s ease",
  },
  notificationsList: {
    maxHeight: "350px",
    overflowY: "auto",
  },
  notificationItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "12px 16px",
    transition: "all 0.2s ease",
    position: "relative",
    cursor: "pointer",
  },
  notificationIconWrapper: {
    marginTop: "2px",
    flexShrink: 0,
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
  },
  notificationMessage: {
    fontSize: "13px",
    marginBottom: "4px",
    lineHeight: 1.4,
  },
  notificationMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  notificationDate: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  notificationTag: {
    fontSize: "10px",
    color: "#2563eb",
    backgroundColor: "#eff6ff",
    padding: "1px 6px",
    borderRadius: "4px",
    fontWeight: 500,
  },
  notificationUnread: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#059669",
    flexShrink: 0,
    marginTop: "6px",
  },
  deleteNotification: {
    background: "none",
    border: "none",
    fontSize: "14px",
    cursor: "pointer",
    color: "#94a3b8",
    padding: "0 4px",
    transition: "color 0.2s ease",
    flexShrink: 0,
    opacity: 0,
  },
  notificationsFooter: {
    padding: "8px 16px",
    borderTop: "1px solid #e2e8f0",
    textAlign: "center",
  },
  clearAllBtn: {
    background: "none",
    border: "none",
    fontSize: "12px",
    cursor: "pointer",
    color: "#94a3b8",
    transition: "all 0.2s ease",
    fontWeight: 500,
  },
  noNotifications: {
    padding: "32px 20px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  loadingNotifications: {
    padding: "24px",
    textAlign: "center",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  spinnerSmall: {
    width: "16px",
    height: "16px",
    border: "2px solid #e2e8f0",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  
  // Modal Overlay
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    animation: "fadeIn 0.2s ease-out",
    padding: "20px",
  },
  modalContent: {
    borderRadius: "16px",
    width: "440px",
    maxWidth: "100%",
    overflow: "hidden",
    animation: "scaleIn 0.25s ease-out",
  },
  modalClose: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
  },
  
  // Delete Modal styles (copié de NavbarAdmin)
  deleteModalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px 0 24px",
  },
  deleteIconContainer: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    backgroundColor: "#fef2f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIcon: {
    color: "#dc2626",
  },
  deleteModalBody: {
    padding: "16px 24px 24px 24px",
    textAlign: "center",
  },
  deleteModalTitle: {
    fontSize: "18px",
    fontWeight: 600,
    margin: "0 0 12px 0",
  },
  deleteModalText: {
    fontSize: "15px",
    margin: "0 0 8px 0",
    lineHeight: "1.6",
  },
  deleteModalSubtext: {
    fontSize: "13px",
    margin: 0,
  },
  deleteModalFooter: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    padding: "16px 24px 24px 24px",
  },
  deleteCancelBtn: {
    padding: "10px 24px",
    border: "1px solid #e2e8f0",
    borderRadius: "40px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    transition: "all 0.2s ease",
    minWidth: "100px",
  },
  deleteConfirmBtn: {
    padding: "10px 24px",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "40px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: "100px",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(220, 38, 38, 0.3)",
  },
};

// Animations et styles globaux
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(-10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .spin {
      animation: spin 0.8s linear infinite;
    }
    
    .link:hover {
      background-color: var(--hover-bg, #f1f5f9) !important;
      transform: translateX(4px);
    }
    
    .link[aria-current="page"]:hover {
      background-color: #059669 !important;
      opacity: 0.9;
    }
    
    .button:hover {
      background-color: var(--hover-bg, #f1f5f9) !important;
      color: var(--text-primary, #1e293b) !important;
    }
    
    .toggle:hover {
      background-color: var(--hover-bg, #f1f5f9) !important;
      transform: scale(1.1);
    }
    
    .delete-cancel-btn:hover {
      background-color: var(--hover-bg, #f8fafc) !important;
    }
    
    .delete-confirm-btn:hover:not(:disabled) {
      background-color: #b91c1c !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
    }
    
    .modal-close:hover {
      background-color: var(--hover-bg, #f1f5f9) !important;
    }
    
    .notification-item:hover {
      background-color: var(--hover-bg, #f8fafc) !important;
    }
    
    .notification-item:hover .delete-notification {
      opacity: 1;
    }
    
    .close-dropdown:hover {
      color: var(--text-primary, #475569) !important;
    }

    .clear-all:hover {
      color: var(--text-primary, #475569) !important;
    }

    .mark-all-read:hover {
      background-color: #eff6ff !important;
    }

    .clear-all-btn:hover {
      color: var(--text-primary, #475569) !important;
    }

    .delete-notification:hover {
      color: #dc2626 !important;
    }

    .refresh-btn:hover {
      background-color: var(--hover-bg, #f1f5f9) !important;
      color: #2563eb !important;
    }
    
    ::-webkit-scrollbar {
      width: 4px;
    }
    
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    
    @media (max-width: 768px) {
      .sidebar {
        width: 0 !important;
        transform: translateX(-100%);
      }
      
      .sidebar.open {
        width: 280px !important;
        transform: translateX(0);
      }
      
      .main-content {
        margin-left: 0 !important;
        width: 100% !important;
        padding: 16px !important;
      }
      
      .toggle {
        display: none !important;
      }
      
      .notifications-dropdown {
        width: 340px !important;
        left: -120px !important;
      }
    }

    @media (max-width: 480px) {
      .notifications-dropdown {
        width: 300px !important;
        left: -140px !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}