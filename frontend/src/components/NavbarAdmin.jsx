// src/components/NavbarAdmin.jsx - Version avec charte graphique
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Calendar, Users, DoorOpen, GraduationCap,
  LogOut, Menu, X, Clock, Settings, HelpCircle, Bell,
  ChevronLeft, ChevronRight, User, Mail, Shield
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function NavbarAdmin({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, message: "Nouveau professeur inscrit", date: "2024-01-15", read: false, type: "success" },
    { id: 2, message: "Emploi du temps modifié", date: "2024-01-14", read: false, type: "info" },
    { id: 3, message: "Nouvel étudiant inscrit", date: "2024-01-13", read: true, type: "success" }
  ]);

  const menu = [
    { path: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { path: "/admin/edt", label: "Emploi du temps", icon: Calendar },
    { path: "/admin/profs", label: "Professeurs", icon: Users },
    { path: "/admin/salles", label: "Salles", icon: DoorOpen },
    { path: "/admin/etudiants", label: "Étudiants", icon: GraduationCap },
    { path: "/admin/dispos", label: "Disponibilités", icon: Clock }
  ];

  useEffect(() => {
    const handleEscape = (e) => { 
      if (e.key === 'Escape' && showConfirmModal) setShowConfirmModal(false); 
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showConfirmModal]);

  // Fermer les notifications en cliquant en dehors
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
  
  const unreadCount = notifications.filter(n => !n.read).length;

  // Obtenir l'icône de notification
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'success': return <div style={styles.notifDotSuccess} />;
      case 'info': return <div style={styles.notifDotInfo} />;
      default: return <div style={styles.notifDotDefault} />;
    }
  };

  return (
    <div style={styles.page}>
      {/* SIDEBAR */}
      <div style={{ 
        ...styles.sidebar, 
        width: sidebarOpen ? 280 : 80,
        boxShadow: sidebarOpen 
          ? '2px 0 20px rgba(0, 0, 0, 0.08)' 
          : '2px 0 10px rgba(0, 0, 0, 0.05)'
      }}>
        <button 
          style={styles.toggle} 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Réduire le menu" : "Agrandir le menu"}
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>

        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <GraduationCap size={sidebarOpen ? 35 : 28} color="#2563eb" />
          </div>
          {sidebarOpen && (
            <div style={styles.logoText}>
              <b style={styles.logoTitle}>ENI Admin</b>
              <small style={styles.logoSubtitle}>Panel de contrôle</small>
            </div>
          )}
        </div>

        <div style={styles.user}>
          <div style={styles.avatar}>
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          {sidebarOpen && (
            <div style={styles.userInfo}>
              <b style={styles.userName}>{user?.name || "Administrateur"}</b>
              <small style={styles.userRole}>Administrateur</small>
            </div>
          )}
        </div>

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
                  backgroundColor: isActive ? '#2563eb' : 'transparent',
                  color: isActive ? 'white' : '#475569',
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

        <div style={styles.bottom}>
          <div style={{ position: 'relative', width: '100%' }} className="notifications-container">
            <button 
              style={styles.button} 
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {sidebarOpen && <span>Notifications</span>}
              {unreadCount > 0 && (
                <span style={styles.badge} aria-label={`${unreadCount} notifications non lues`}>
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div style={styles.notificationsDropdown} role="dialog" aria-label="Notifications">
                <div style={styles.notificationsHeader}>
                  <span style={styles.notificationsTitle}>Notifications</span>
                  <button 
                    onClick={() => setShowNotifications(false)} 
                    style={styles.closeDropdown}
                    aria-label="Fermer les notifications"
                  >
                    ×
                  </button>
                </div>
                <div style={styles.notificationsList}>
                  {notifications.length === 0 ? (
                    <div style={styles.noNotifications}>Aucune notification</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} style={styles.notificationItem}>
                        {getNotificationIcon(n.type)}
                        <div style={styles.notificationContent}>
                          <div style={styles.notificationMessage}>{n.message}</div>
                          <small style={styles.notificationDate}>{n.date}</small>
                        </div>
                        {!n.read && <div style={styles.notificationUnread} />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          <button 
            style={styles.button} 
            onClick={() => navigate("/admin/parametres")}
            aria-label="Paramètres"
          >
            <Settings size={20} />
            {sidebarOpen && <span>Paramètres</span>}
          </button>
          
          <button 
            style={styles.button} 
            onClick={() => navigate("/admin/aide")}
            aria-label="Aide"
          >
            <HelpCircle size={20} />
            {sidebarOpen && <span>Aide</span>}
          </button>
          
          <button 
            style={{ ...styles.button, color: '#dc2626' }} 
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
          backgroundColor: "#f8fafc",
        }}
      >
        {children}
      </main>

      {/* MODAL DE CONFIRMATION */}
      {showConfirmModal && (
        <div 
          style={styles.modalOverlay} 
          className="modal-overlay"
          role="dialog" 
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 id="modal-title" style={styles.modalTitle}>Confirmation de déconnexion</h3>
              <button 
                style={styles.closeButton} 
                onClick={() => setShowConfirmModal(false)}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              <p style={styles.modalText}>Êtes-vous sûr de vouloir vous déconnecter ?</p>
              <p style={styles.modalSubText}>Vous devrez vous reconnecter pour accéder à votre espace.</p>
            </div>
            <div style={styles.modalFooter}>
              <button 
                onClick={() => setShowConfirmModal(false)} 
                style={styles.cancelButton}
                aria-label="Annuler la déconnexion"
              >
                Annuler
              </button>
              <button 
                onClick={handleLogout} 
                style={styles.confirmButton}
                aria-label="Confirmer la déconnexion"
              >
                Oui, me déconnecter
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
    backgroundColor: "#f8fafc",
    fontFamily: '"Inter", "Poppins", "Roboto", -apple-system, sans-serif',
  },
  
  // Sidebar - Charte graphique
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: "white",
    boxShadow: "2px 0 20px rgba(0, 0, 0, 0.08)",
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
    backgroundColor: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1001,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    color: "#475569",
    transition: "all 0.2s ease",
    padding: 0,
  },
  
  logo: {
    padding: "24px 20px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderBottom: "1px solid #f1f5f9",
    minHeight: "80px",
  },
  logoIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "35px",
  },
  logoText: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  logoTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1e293b",
    fontFamily: '"Poppins", "Inter", sans-serif',
  },
  logoSubtitle: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: 400,
  },
  
  user: {
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderBottom: "1px solid #f1f5f9",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    fontSize: "18px",
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
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
    color: "#1e293b",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userRole: {
    fontSize: "11px",
    color: "#64748b",
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
    borderTop: "1px solid #f1f5f9",
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
    color: "#475569",
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
    width: "20px",
    height: "20px",
    fontSize: "10px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  
  // Notifications
  notificationsDropdown: {
    position: "absolute",
    bottom: "calc(100% + 8px)",
    left: 0,
    width: "320px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.12)",
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
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  notificationsTitle: {
    fontWeight: 600,
    color: "#1e293b",
    fontSize: "14px",
  },
  closeDropdown: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#94a3b8",
    padding: "0 4px",
    transition: "color 0.2s ease",
  },
  notificationsList: {
    maxHeight: "300px",
    overflowY: "auto",
  },
  notificationItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "12px 16px",
    borderBottom: "1px solid #f1f5f9",
    transition: "background 0.2s ease",
    position: "relative",
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: "13px",
    color: "#1e293b",
    marginBottom: "4px",
  },
  notificationDate: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  notificationUnread: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    flexShrink: 0,
    marginTop: "6px",
  },
  noNotifications: {
    padding: "24px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "14px",
  },
  notifDotSuccess: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#10b981",
    flexShrink: 0,
    marginTop: "4px",
  },
  notifDotInfo: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#3b82f6",
    flexShrink: 0,
    marginTop: "4px",
  },
  notifDotDefault: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#94a3b8",
    flexShrink: 0,
    marginTop: "4px",
  },
  
  // Modal de confirmation
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
    backgroundColor: "white",
    borderRadius: "16px",
    width: "440px",
    maxWidth: "100%",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
    animation: "scaleIn 0.25s ease-out",
  },
  modalHeader: {
    padding: "16px 24px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 600,
    color: "#1e293b",
    fontFamily: '"Poppins", "Inter", sans-serif',
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#94a3b8",
    padding: "0 4px",
    transition: "color 0.2s ease",
  },
  modalBody: {
    padding: "24px",
  },
  modalText: {
    margin: "0 0 8px 0",
    fontSize: "15px",
    color: "#1e293b",
    lineHeight: 1.5,
  },
  modalSubText: {
    margin: 0,
    fontSize: "13px",
    color: "#64748b",
  },
  modalFooter: {
    padding: "16px 24px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  },
  cancelButton: {
    padding: "10px 24px",
    backgroundColor: "white",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: "40px",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: "14px",
    transition: "all 0.2s ease",
  },
  confirmButton: {
    padding: "10px 24px",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "40px",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: "14px",
    transition: "all 0.2s ease",
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
    
    /* Hover effects */
    .link:hover {
      background-color: #f1f5f9 !important;
      transform: translateX(4px);
    }
    
    .link[aria-current="page"]:hover {
      background-color: #2563eb !important;
      opacity: 0.9;
    }
    
    .button:hover {
      background-color: #f1f5f9 !important;
      color: #1e293b !important;
    }
    
    .toggle:hover {
      background-color: #f1f5f9 !important;
      transform: scale(1.1);
    }
    
    .cancel-button:hover {
      background-color: #f8fafc !important;
    }
    
    .confirm-button:hover {
      background-color: #b91c1c !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
    }
    
    .notification-item:hover {
      background-color: #f8fafc;
    }
    
    .close-button:hover {
      color: #475569 !important;
    }
    
    .close-dropdown:hover {
      color: #475569 !important;
    }
    
    /* Scrollbar personnalisée */
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
    
    /* Responsive */
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
      
      .mobile-toggle {
        display: flex !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}