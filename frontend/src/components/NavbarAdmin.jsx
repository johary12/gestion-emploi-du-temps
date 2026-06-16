// src/components/NavbarAdmin.jsx - Version sans notifications
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Calendar, Users, DoorOpen, GraduationCap,
  LogOut, Menu, X, Clock, Settings, HelpCircle, Bell,
  ChevronLeft, ChevronRight, User, Mail, Shield, AlertTriangle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function NavbarAdmin({ children }) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

  const handleLogout = async () => { 
    await logout(); 
    navigate("/"); 
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg-primary, #f8fafc)",
      fontFamily: '"Inter", "Poppins", "Roboto", -apple-system, sans-serif',
      color: "var(--text-primary, #1e293b)",
    }}>
      {/* SIDEBAR */}
      <div style={{ 
        ...styles.sidebar,
        backgroundColor: "var(--bg-card, #ffffff)",
        borderRight: "1px solid var(--border-color, #e2e8f0)",
        width: sidebarOpen ? 280 : 80,
        boxShadow: sidebarOpen 
          ? '2px 0 20px var(--shadow-color, rgba(0, 0, 0, 0.08))' 
          : '2px 0 10px var(--shadow-color, rgba(0, 0, 0, 0.05))'
      }}>
        <button 
          style={{
            ...styles.toggle,
            backgroundColor: "var(--bg-card, #ffffff)",
            borderColor: "var(--border-color, #e2e8f0)",
            color: "var(--text-secondary, #475569)",
          }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Réduire le menu" : "Agrandir le menu"}
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>

        <div style={{
          ...styles.logo,
          borderBottom: "1px solid var(--border-color, #f1f5f9)",
        }}>
          <div style={styles.logoIcon}>
            <GraduationCap size={sidebarOpen ? 35 : 28} color="#2563eb" />
          </div>
          {sidebarOpen && (
            <div style={styles.logoText}>
              <b style={{
                ...styles.logoTitle,
                color: "var(--text-primary, #1e293b)",
              }}>ENI Admin</b>
              <small style={{
                ...styles.logoSubtitle,
                color: "var(--text-secondary, #64748b)",
              }}>Panel de contrôle</small>
            </div>
          )}
        </div>

        <div style={{
          ...styles.user,
          borderBottom: "1px solid var(--border-color, #f1f5f9)",
        }}>
          <div style={styles.avatar}>
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          {sidebarOpen && (
            <div style={styles.userInfo}>
              <b style={{
                ...styles.userName,
                color: "var(--text-primary, #1e293b)",
              }}>{user?.name || "Administrateur"}</b>
              <small style={{
                ...styles.userRole,
                color: "var(--text-secondary, #64748b)",
              }}>Administrateur</small>
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
                  color: isActive ? 'white' : "var(--text-secondary, #475569)",
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

        <div style={{
          ...styles.bottom,
          borderTop: "1px solid var(--border-color, #f1f5f9)",
        }}>
          <button 
            style={{
              ...styles.button,
              color: "var(--text-secondary, #475569)",
            }}
            onClick={() => navigate("/admin/parametres")}
            aria-label="Paramètres"
          >
            <Settings size={20} />
            {sidebarOpen && <span style={{ color: "var(--text-secondary, #475569)" }}>Paramètres</span>}
          </button>
          
          <button 
            style={{
              ...styles.button,
              color: "var(--text-secondary, #475569)",
            }}
            onClick={() => navigate("/admin/aide")}
            aria-label="Aide"
          >
            <HelpCircle size={20} />
            {sidebarOpen && <span style={{ color: "var(--text-secondary, #475569)" }}>Aide</span>}
          </button>
          
          <button 
            style={{ 
              ...styles.button, 
              color: '#dc2626'
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
          backgroundColor: "var(--bg-primary, #f8fafc)",
          color: "var(--text-primary, #1e293b)",
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
          onClick={() => setShowConfirmModal(false)}
        >
          <div style={{
            ...styles.modalContent,
            backgroundColor: "var(--bg-card, #ffffff)",
            boxShadow: "0 20px 60px var(--shadow-color, rgba(0, 0, 0, 0.2))",
            maxWidth: "420px",
          }} onClick={e => e.stopPropagation()}>
            {/* Header avec icône d'avertissement */}
            <div style={styles.deleteModalHeader}>
              <div style={styles.deleteIconContainer}>
                <AlertTriangle size={32} style={styles.deleteIcon} />
              </div>
              <button 
                onClick={() => setShowConfirmModal(false)} 
                style={{
                  ...styles.modalClose,
                  color: "var(--text-muted, #94a3b8)",
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
                color: "var(--text-primary, #1e293b)",
              }}>Confirmation de déconnexion</h3>
              <p style={{
                ...styles.deleteModalText,
                color: "var(--text-secondary, #475569)",
              }}>
                Êtes-vous sûr de vouloir vous déconnecter ?
              </p>
              <p style={{
                ...styles.deleteModalSubtext,
                color: "var(--text-muted, #94a3b8)",
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
                  backgroundColor: "var(--bg-card, #ffffff)",
                  borderColor: "var(--border-color, #e2e8f0)",
                  color: "var(--text-secondary, #475569)",
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
  // Sidebar
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
    borderRadius: "16px",
    width: "440px",
    maxWidth: "100%",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
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
  
  // Delete Modal styles
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
    
    /* Hover effects */
    .link:hover {
      background-color: var(--hover-bg, #f1f5f9) !important;
      transform: translateX(4px);
    }
    
    .link[aria-current="page"]:hover {
      background-color: #2563eb !important;
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
    
    /* Scrollbar personnalisée */
    ::-webkit-scrollbar {
      width: 4px;
    }
    
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    
    ::-webkit-scrollbar-thumb {
      background: var(--text-muted, #cbd5e1);
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: var(--text-secondary, #94a3b8);
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