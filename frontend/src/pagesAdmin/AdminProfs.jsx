// src/pagesAdmin/AdminProfs.jsx - Version avec charte graphique
import { useState, useEffect } from 'react';
import { profService } from '../services/api';
import { 
  Plus, Edit2, Trash2, Search, Mail, User, AlertCircle, CheckCircle, 
  GraduationCap, X, Filter, Users, Phone, BookOpen
} from 'lucide-react';

export default function AdminProfs() {
  const [profs, setProfs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [form, setForm] = useState({ name: '', email: '', specialite: '', password: '', telephone: '' });
  const [errors, setErrors] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterSpecialite, setFilterSpecialite] = useState('');

  useEffect(() => { loadProfs(); }, []);

  const loadProfs = async () => {
    setLoading(true);
    try { 
      const response = await profService.getAll(); 
      setProfs(response.data || []); 
    } catch (error) { 
      console.error('Erreur:', error); 
      showNotification('error', 'Erreur de chargement des professeurs'); 
    } finally { 
      setLoading(false); 
    }
  };

  const showNotification = (type, message) => { 
    setNotification({ show: true, type, message }); 
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 4000); 
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name?.trim()) newErrors.name = 'Le nom est requis';
    if (!form.email?.trim()) newErrors.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email invalide (ex: nom@domaine.com)';
    if (!editId && !form.password) newErrors.password = 'Mot de passe requis';
    else if (!editId && form.password.length < 6) newErrors.password = 'Minimum 6 caractères';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (editId) {
        const updateData = { name: form.name, email: form.email, specialite: form.specialite, telephone: form.telephone };
        await profService.update(editId, updateData);
        showNotification('success', '✅ Professeur modifié avec succès');
      } else {
        await profService.create(form);
        showNotification('success', '✅ Professeur ajouté avec succès');
      }
      await loadProfs();
      setShowModal(false);
      resetForm();
    } catch (error) { 
      console.error('Erreur:', error); 
      showNotification('error', 'Erreur lors de la sauvegarde'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer ce professeur ?')) {
      setLoading(true);
      try { 
        await profService.delete(id); 
        await loadProfs(); 
        showNotification('success', '✅ Professeur supprimé avec succès'); 
      } catch (error) { 
        showNotification('error', 'Erreur lors de la suppression'); 
      } finally { 
        setLoading(false); 
      }
    }
  };

  const handleEdit = (prof) => { 
    setEditId(prof.id); 
    setForm({ 
      name: prof.name, 
      email: prof.email, 
      specialite: prof.specialite || '', 
      telephone: prof.telephone || '',
      password: '' 
    }); 
    setShowModal(true); 
  };
  
  const resetForm = () => { 
    setEditId(null); 
    setForm({ name: '', email: '', specialite: '', password: '', telephone: '' }); 
    setErrors({}); 
  };

  // Filtrer les professeurs
  const getUniqueSpecialites = () => {
    const specialites = profs.map(p => p.specialite).filter(Boolean);
    return [...new Set(specialites)];
  };

  const filteredProfs = profs.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        p.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSpecialite = filterSpecialite ? p.specialite === filterSpecialite : true;
    return matchSearch && matchSpecialite;
  });

  // Statistiques
  const totalProfs = profs.length;
  const totalSpecialites = getUniqueSpecialites().length;

  return (
    <div style={styles.container}>
      {/* Notification */}
      {notification.show && (
        <div style={{
          ...styles.notification,
          backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444'
        }}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span style={styles.notificationMessage}>{notification.message}</span>
        </div>
      )}

      {/* En-tête */}
      <div style={styles.headerSection}>
        <div>
          <h1 style={styles.pageTitle}>👨‍🏫 Gestion des professeurs</h1>
          <p style={styles.pageSubtitle}>Gérez les professeurs et leurs spécialités</p>
        </div>
        <div style={styles.headerActions}>
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            style={{
              ...styles.filterToggle,
              backgroundColor: showFilters ? '#2563eb' : 'white',
              color: showFilters ? 'white' : '#475569',
              borderColor: showFilters ? '#2563eb' : '#e2e8f0'
            }}
          >
            <Filter size={18} />
            Filtres
          </button>
          <button onClick={() => setShowModal(true)} style={styles.addButton}>
            <Plus size={18} />
            Ajouter
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <Users size={24} style={styles.statIcon} />
          <div>
            <div style={styles.statValue}>{totalProfs}</div>
            <div style={styles.statLabel}>Professeurs</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <BookOpen size={24} style={styles.statIcon} />
          <div>
            <div style={styles.statValue}>{totalSpecialites}</div>
            <div style={styles.statLabel}>Spécialités</div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div style={styles.searchSection}>
        <div style={styles.searchBar}>
          <Search size={18} style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou email..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            style={styles.searchInput} 
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={styles.clearSearch}>
              <X size={16} />
            </button>
          )}
        </div>

        {showFilters && (
          <div style={styles.filtersPanel}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Spécialité</label>
              <select 
                value={filterSpecialite} 
                onChange={(e) => setFilterSpecialite(e.target.value)} 
                style={styles.filterSelect}
              >
                <option value="">Toutes les spécialités</option>
                {getUniqueSpecialites().map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => { setFilterSpecialite(''); setSearchTerm(''); }} 
              style={styles.resetFiltersButton}
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Tableau des professeurs */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <span style={styles.tableTitle}>Liste des professeurs</span>
          <span style={styles.tableCount}>{filteredProfs.length} professeur(s)</span>
        </div>
        
        {loading && filteredProfs.length === 0 ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner} />
            <p>Chargement des professeurs...</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Professeur</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Spécialité</th>
                <th style={styles.th}>Téléphone</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={styles.emptyRow}>
                    <div style={styles.emptyState}>
                      <Users size={48} style={styles.emptyIcon} />
                      <p style={styles.emptyText}>Aucun professeur trouvé</p>
                      <p style={styles.emptySubtext}>Ajoutez votre premier professeur en cliquant sur "Ajouter"</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProfs.map(p => (
                  <tr key={p.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.profNameContainer}>
                        <div style={styles.avatar}>
                          {p.name?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <span style={styles.profName}>{p.name}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.emailContainer}>
                        <Mail size={14} style={styles.emailIcon} />
                        <span>{p.email}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      {p.specialite ? (
                        <span style={styles.specialiteBadge}>{p.specialite}</span>
                      ) : (
                        <span style={styles.emptyBadge}>—</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {p.telephone ? (
                        <span style={styles.phoneText}>{p.telephone}</span>
                      ) : (
                        <span style={styles.emptyBadge}>—</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionsContainer}>
                        <button 
                          onClick={() => handleEdit(p)} 
                          style={styles.editBtn}
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)} 
                          style={styles.deleteBtn}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal d'ajout/modification */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editId ? '✏️ Modifier le professeur' : '➕ Ajouter un professeur'}
              </h3>
              <button onClick={() => setShowModal(false)} style={styles.modalClose}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  <User size={16} style={styles.formIcon} />
                  Nom complet *
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: Jean Dupont" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  style={{
                    ...styles.input,
                    borderColor: errors.name ? '#ef4444' : '#e2e8f0'
                  }} 
                />
                {errors.name && <div style={styles.fieldError}>{errors.name}</div>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  <Mail size={16} style={styles.formIcon} />
                  Email *
                </label>
                <input 
                  type="email" 
                  placeholder="Ex: jean.dupont@eni.mg" 
                  value={form.email} 
                  onChange={e => setForm({...form, email: e.target.value})} 
                  style={{
                    ...styles.input,
                    borderColor: errors.email ? '#ef4444' : '#e2e8f0'
                  }} 
                />
                {errors.email && <div style={styles.fieldError}>{errors.email}</div>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  <BookOpen size={16} style={styles.formIcon} />
                  Spécialité
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: Génie Logiciel" 
                  value={form.specialite} 
                  onChange={e => setForm({...form, specialite: e.target.value})} 
                  style={styles.input} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  <Phone size={16} style={styles.formIcon} />
                  Téléphone
                </label>
                <input 
                  type="tel" 
                  placeholder="Ex: 034 00 000 00" 
                  value={form.telephone} 
                  onChange={e => setForm({...form, telephone: e.target.value})} 
                  style={styles.input} 
                />
              </div>

              {!editId && (
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    <Lock size={16} style={styles.formIcon} />
                    Mot de passe *
                  </label>
                  <input 
                    type="password" 
                    placeholder="Minimum 6 caractères" 
                    value={form.password} 
                    onChange={e => setForm({...form, password: e.target.value})} 
                    style={{
                      ...styles.input,
                      borderColor: errors.password ? '#ef4444' : '#e2e8f0'
                    }} 
                  />
                  {errors.password && <div style={styles.fieldError}>{errors.password}</div>}
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setShowModal(false)} style={styles.cancelBtn}>
                Annuler
              </button>
              <button onClick={handleSave} style={styles.saveBtn} disabled={loading}>
                {loading ? (
                  <>
                    <div style={styles.spinnerSmall} />
                    Chargement...
                  </>
                ) : (
                  '💾 Enregistrer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles avec charte graphique
const styles = {
  container: {
    padding: '24px 32px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '"Inter", "Poppins", "Roboto", -apple-system, sans-serif',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
  },

  // Notification
  notification: {
    position: 'fixed',
    top: '24px',
    right: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    borderRadius: '12px',
    color: 'white',
    zIndex: 2000,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
    animation: 'slideIn 0.3s ease-out',
  },
  notificationMessage: {
    fontSize: '14px',
    fontWeight: 500,
  },

  // Header
  headerSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1e293b',
    margin: 0,
    fontFamily: '"Poppins", "Inter", sans-serif',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '4px 0 0',
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
  },
  filterToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    border: '1px solid #e2e8f0',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'all 0.2s ease',
    backgroundColor: 'white',
    color: '#475569',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
  },

  // Stats
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  statIcon: {
    color: '#2563eb',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1e293b',
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: 500,
  },

  // Search
  searchSection: {
    marginBottom: '24px',
  },
  searchBar: {
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
  },
  searchInput: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: 'transparent',
    color: '#1e293b',
  },
  clearSearch: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '4px',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
  },

  // Filters
  filtersPanel: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '16px',
    marginTop: '16px',
    padding: '16px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    flexWrap: 'wrap',
  },
  filterGroup: {
    flex: 1,
    minWidth: '200px',
  },
  filterLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: '#1e293b',
    marginBottom: '6px',
  },
  filterSelect: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    color: '#1e293b',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  resetFiltersButton: {
    padding: '10px 20px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    color: '#475569',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },

  // Table
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  tableTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b',
  },
  tableCount: {
    fontSize: '13px',
    color: '#64748b',
    padding: '4px 12px',
    backgroundColor: 'white',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px 20px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#fafafa',
  },
  tr: {
    transition: 'all 0.2s ease',
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '12px 20px',
    fontSize: '14px',
    color: '#1e293b',
    verticalAlign: 'middle',
  },

  // Prof name
  profNameContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: '14px',
    flexShrink: 0,
  },
  profName: {
    fontWeight: 500,
  },

  // Email
  emailContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#475569',
  },
  emailIcon: {
    color: '#94a3b8',
  },

  // Badges
  specialiteBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500,
  },
  emptyBadge: {
    color: '#94a3b8',
    fontSize: '13px',
  },
  phoneText: {
    color: '#475569',
  },

  // Actions
  actionsContainer: {
    display: 'flex',
    gap: '8px',
  },
  editBtn: {
    padding: '6px 10px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
  },
  deleteBtn: {
    padding: '6px 10px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
  },

  // Empty state
  emptyRow: {
    padding: '40px 20px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyIcon: {
    color: '#cbd5e1',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '8px',
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#94a3b8',
  },

  // Loading
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
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
  spinnerSmall: {
    width: '16px',
    height: '16px',
    border: '2px solid white',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '520px',
    maxWidth: '100%',
    maxHeight: '90vh',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
    animation: 'scaleIn 0.25s ease-out',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
    fontFamily: '"Poppins", "Inter", sans-serif',
  },
  modalClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '4px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
  },
  modalBody: {
    padding: '24px',
    overflowY: 'auto',
  },
  modalFooter: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    padding: '16px 24px',
    borderTop: '1px solid #e2e8f0',
  },

  // Form
  formGroup: {
    marginBottom: '16px',
  },
  formLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#1e293b',
    marginBottom: '6px',
  },
  formIcon: {
    color: '#2563eb',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    outline: 'none',
    backgroundColor: '#f8fafc',
  },
  fieldError: {
    fontSize: '12px',
    color: '#ef4444',
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  // Buttons
  cancelBtn: {
    padding: '10px 24px',
    backgroundColor: 'white',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  saveBtn: {
    padding: '10px 24px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
};

// Animations et styles globaux
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
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

    .add-button:hover {
      background-color: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(37, 99, 235, 0.3);
    }

    .filter-toggle:hover {
      border-color: #2563eb;
    }

    .reset-filters-button:hover {
      background-color: #e2e8f0;
    }

    .edit-btn:hover {
      background-color: #dbeafe;
      transform: scale(1.05);
    }

    .delete-btn:hover {
      background-color: #fecaca;
      transform: scale(1.05);
    }

    .save-btn:hover:not(:disabled) {
      background-color: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    .cancel-btn:hover {
      background-color: #f8fafc;
    }

    .modal-close:hover {
      background-color: #f1f5f9;
    }

    .clear-search:hover {
      background-color: #f1f5f9;
    }

    .input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      background-color: white;
    }

    .filter-select:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .tr:hover {
      background-color: #f8fafc;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transition: all 0.2s ease;
    }

    /* Scrollbar */
    .modal-body::-webkit-scrollbar {
      width: 4px;
    }
    
    .modal-body::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .modal-body::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
    
    .modal-body::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    @media (max-width: 768px) {
      .container {
        padding: 16px;
      }
      
      .header-section {
        flex-direction: column;
        align-items: stretch;
      }
      
      .header-actions {
        flex-direction: column;
      }
      
      .stats-container {
        grid-template-columns: 1fr;
      }
      
      .filters-panel {
        flex-direction: column;
        align-items: stretch;
      }
      
      .filter-group {
        min-width: 100%;
      }
      
      .table-container {
        overflow-x: auto;
      }
      
      .table {
        min-width: 600px;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}