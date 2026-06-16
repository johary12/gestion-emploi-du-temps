// src/components/NavbarAdmin.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Calendar, Users, DoorOpen, GraduationCap,
  LogOut, Menu, X, Clock, Settings, HelpCircle, Bell
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function NavbarAdmin({ children }) {  // IMPORTANT: Ajoutez children ici
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, message: "Nouveau professeur inscrit", date: "2024-01-15", read: false },
    { id: 2, message: "Emploi du temps modifié", date: "2024-01-14", read: false }
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
    const handleEscape = (e) => { if (e.key === 'Escape' && showConfirmModal) setShowConfirmModal(false); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showConfirmModal]);

  const handleLogout = async () => { await logout(); navigate("/"); };
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={styles.page}>
      {/* SIDEBAR */}
      <div style={{ ...styles.sidebar, width: sidebarOpen ? 260 : 80 }}>
        <button style={styles.toggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div style={styles.logo}>
          <GraduationCap size={35} />
          {sidebarOpen && <div><b>ENI Admin</b><br /><small>Panel contrôle</small></div>}
        </div>

        <div style={styles.user}>
          <div style={styles.avatar}>{user?.name?.charAt(0) || "A"}</div>
          {sidebarOpen && <div><b>{user?.name}</b><br /><small>Administrateur</small></div>}
        </div>

        <div style={styles.menu}>
          {menu.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.link,
                  background: isActive ? "#667eea" : "transparent",
                  color: isActive ? "white" : "#475569",
                  justifyContent: sidebarOpen ? "flex-start" : "center"
                }}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        <div style={styles.bottom}>
          <div style={{ position: 'relative' }}>
            <button style={styles.button} onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={20} />
              {sidebarOpen && <span>Notifications</span>}
              {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
            </button>
            {showNotifications && (
              <div style={styles.notificationsDropdown}>
                <div style={styles.notificationsHeader}>
                  <span>Notifications</span>
                  <button onClick={() => setShowNotifications(false)} style={styles.closeDropdown}>×</button>
                </div>
                {notifications.map(n => (
                  <div key={n.id} style={styles.notificationItem}>
                    <div>{n.message}</div>
                    <small>{n.date}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button style={styles.button} onClick={() => navigate("/admin/parametres")}>
            <Settings size={20} />
            {sidebarOpen && "Paramètres"}
          </button>
          <button style={styles.button} onClick={() => navigate("/admin/aide")}>
            <HelpCircle size={20} />
            {sidebarOpen && "Aide"}
          </button>
          <button style={{ ...styles.button, color: "#ef4444" }} onClick={() => setShowConfirmModal(true)}>
            <LogOut size={20} />
            {sidebarOpen && "Déconnexion"}
          </button>
        </div>
      </div>

      {/* CONTENU PRINCIPAL - ICI ON AFFICHE children */}
      <div style={{
        marginLeft: sidebarOpen ? 260 : 80,
        width: `calc(100% - ${sidebarOpen ? 260 : 80}px)`,
        minHeight: "100vh",
        padding: "30px",
        boxSizing: "border-box",
        transition: "0.3s",
        background: "#f8fafc"
      }}>
        {children}  {/* <-- Très important: afficher les children */}
      </div>

      {/* MODAL DE CONFIRMATION */}
      {showConfirmModal && (
        <div style={styles.modalOverlay} onClick={() => setShowConfirmModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Confirmation de déconnexion</h3>
              <button style={styles.closeButton} onClick={() => setShowConfirmModal(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowConfirmModal(false)} style={styles.cancelButton}>Annuler</button>
              <button onClick={handleLogout} style={styles.confirmButton}>Oui, me déconnecter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f8fafc" },
  sidebar: { position: "fixed", top: 0, left: 0, bottom: 0, background: "white", boxShadow: "2px 0 15px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", transition: "0.3s", zIndex: 1000 },
  toggle: { position: "absolute", right: -15, top: 20, width: 30, height: 30, borderRadius: "50%", border: "1px solid #e2e8f0", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  logo: { padding: "25px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #f1f5f9" },
  user: { padding: 20, display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #f1f5f9" },
  avatar: { width: 45, height: 45, borderRadius: "50%", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px" },
  menu: { flex: 1, padding: 15 },
  link: { display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 10, textDecoration: "none", marginBottom: 5, transition: "0.2s", fontWeight: "500" },
  bottom: { padding: 15, borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "8px" },
  button: { width: "100%", padding: 12, border: "none", background: "transparent", display: "flex", gap: 12, cursor: "pointer", alignItems: "center", borderRadius: 10, transition: "0.2s", fontWeight: "500", position: "relative" },
  badge: { position: "absolute", right: 10, top: 8, background: "#ef4444", color: "white", borderRadius: "50%", width: "18px", height: "18px", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
  notificationsDropdown: { position: "absolute", bottom: "100%", left: 0, marginBottom: "10px", width: "280px", background: "white", borderRadius: "12px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0", zIndex: 1002, overflow: "hidden" },
  notificationsHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: 600 },
  closeDropdown: { background: "none", border: "none", fontSize: "20px", cursor: "pointer" },
  notificationItem: { padding: "12px 16px", borderBottom: "1px solid #f1f5f9" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 },
  modalContent: { background: "white", borderRadius: "16px", width: "450px", maxWidth: "90%", overflow: "hidden" },
  modalHeader: { padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" },
  closeButton: { background: "none", border: "none", fontSize: "24px", cursor: "pointer" },
  modalBody: { padding: "20px" },
  modalFooter: { padding: "16px 20px", borderTop: "1px solid #e2e8f0", display: "flex", gap: "12px", justifyContent: "flex-end" },
  cancelButton: { padding: "8px 16px", background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer" },
  confirmButton: { padding: "8px 16px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }
};