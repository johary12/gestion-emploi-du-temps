// src/pagesAdmin/AdminSalles.jsx - Version avec charte graphique
import { useState, useEffect } from 'react';
import { salleService } from '../services/api';
import { 
  Plus, Edit2, Trash2, Search, MapPin, Users, AlertCircle, CheckCircle,
  DoorOpen, X, Filter, Building, Grid, Layers
} from 'lucide-react';

export default function AdminSalles() {
  const [salles, setSalles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [form, setForm] = useState({ nom: '', capacite: '', type: '', localisation: '' });
  const [errors, setErrors] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => { loadSalles(); }, []);

  const loadSalles = async () => {
    setLoading(true);
    try { 
      const response = await salleService.getAll(); 
      setSalles(response.data || []); 
    } catch (error) { 
      console.error('Erreur:', error); 
      showNotification('error', 'Erreur de chargement des salles'); 
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
    if (!form.nom?.trim()) newErrors.nom = 'Le nom de la salle est requis';
    if (!form.capacite) newErrors.capacite = 'La capacité est requise';
    else if (parseInt(form.capacite) < 1) newErrors.capacite = 'La capacité doit être supérieure à 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const salleData = {
        nom: form.nom,
        capacite: parseInt(form.capacite),
        type: form.type || '',
        localisation: form.localisation || ''
      };
      
      if (editId) {
        await salleService.update(editId, salleData);
        showNotification('success', '✅ Salle modifiée avec succès');
      } else {
        await salleService.create(salleData);
        showNotification('success', '✅ Salle ajoutée avec succès');
      }
      await loadSalles();
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
    if (window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer cette salle ?')) {
      setLoading(true);
      try { 
        await salleService.delete(id); 
        await loadSalles(); 
        showNotification('success', '✅ Salle supprimée avec succès'); 
      } catch (error) { 
        showNotification('error', 'Erreur lors de la suppression'); 
      } finally { 
        setLoading(false); 
      }
    }
  };

  const handleEdit = (salle) => { 
    setEditId(salle.id); 
    setForm({ 
      nom: salle.nom, 
      capacite: salle.capacite, 
      type: salle.type || '', 
      localisation: salle.localisation || '' 
    }); 
    setShowModal(true); 
  };
  
  const resetForm = () => { 
    setEditId(null); 
    setForm({ nom: '', capacite: '', type: '', localisation: '' }); 
    setErrors({}); 
  };

  // Obtenir les types uniques
  const getUniqueTypes = () => {
    const types = salles.map(s => s.type).filter(Boolean);
    return [...new Set(types)];
  };

  // Filtrer les salles
  const filteredSalles = salles.filter(s => {
    const matchSearch = s.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        s.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.localisation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType ? s.type === filterType : true;
    return matchSearch && matchType;
  });

  // Statistiques
  const totalSalles = salles.length;
  const totalCapacite = salles.reduce((sum, s) => sum + (parseInt(s.capacite) || 0), 0);
  const totalTypes = getUniqueTypes().length;

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
          <h1 style={styles.pageTitle}>🚪 Gestion des salles</h1>
          <p style={styles.pageSubtitle}>Gérez les salles et leurs capacités</p>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.viewToggle}>
            <button 
              onClick={() => setViewMode('grid')} 
              style={{
                ...styles.viewButton,
                backgroundColor: viewMode === 'grid' ? '#2563eb' : 'transparent',
                color: viewMode === 'grid' ? 'white' : '#475569',
              }}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              style={{
                ...styles.viewButton,
                backgroundColor: viewMode === 'list' ? '#2563eb' : 'transparent',
                color: viewMode === 'list' ? 'white' : '#475569',
              }}
            >
              <Layers size={18} />
            </button>
          </div>
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
          <DoorOpen size={24} style={styles.statIcon} />
          <div>
            <div style={styles.statValue}>{totalSalles}</div>
            <div style={styles.statLabel}>Salles</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <Users size={24} style={styles.statIcon} />
          <div>
            <div style={styles.statValue}>{totalCapacite}</div>
            <div style={styles.statLabel}>Places totales</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <Building size={24} style={styles.statIcon} />
          <div>
            <div style={styles.statValue}>{totalTypes}</div>
            <div style={styles.statLabel}>Types de salles</div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div style={styles.searchSection}>
        <div style={styles.searchBar}>
          <Search size={18} style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Rechercher par nom, type ou localisation..." 
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
              <label style={styles.filterLabel}>Type de salle</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)} 
                style={styles.filterSelect}
              >
                <option value="">Tous les types</option>
                {getUniqueTypes().map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => { setFilterType(''); setSearchTerm(''); }} 
              style={styles.resetFiltersButton}
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Liste des salles */}
      {loading && filteredSalles.length === 0 ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p>Chargement des salles...</p>
        </div>
      ) : filteredSalles.length === 0 ? (
        <div style={styles.emptyState}>
          <DoorOpen size={48} style={styles.emptyIcon} />
          <p style={styles.emptyText}>Aucune salle trouvée</p>
          <p style={styles.emptySubtext}>Ajoutez votre première salle en cliquant sur "Ajouter"</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={styles.grid}>
          {filteredSalles.map(salle => (
            <div key={salle.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitleContainer}>
                  <DoorOpen size={20} style={styles.cardIcon} />
                  <h3 style={styles.cardTitle}>{salle.nom}</h3>
                </div>
                <div style={styles.cardActions}>
                  <button onClick={() => handleEdit(salle)} style={styles.editBtn} title="Modifier">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(salle.id)} style={styles.deleteBtn} title="Supprimer">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.cardInfo}>
                  <Users size={16} style={styles.infoIcon} />
                  <span><strong>Capacité:</strong> {salle.capacite} places</span>
                </div>
                <div style={styles.cardInfo}>
                  <Building size={16} style={styles.infoIcon} />
                  <span><strong>Type:</strong> {salle.type || '—'}</span>
                </div>
                <div style={styles.cardInfo}>
                  <MapPin size={16} style={styles.infoIcon} />
                  <span><strong>Localisation:</strong> {salle.localisation || '—'}</span>
                </div>
              </div>
              <div style={styles.cardFooter}>
                <span style={styles.cardStatus}>
                  {parseInt(salle.capacite) > 50 ? '🟢 Grande' : 
                   parseInt(salle.capacite) > 20 ? '🟡 Moyenne' : '🔵 Petite'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Salle</th>
                <th style={styles.th}>Capacité</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Localisation</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSalles.map(salle => (
                <tr key={salle.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.salleNameContainer}>
                      <DoorOpen size={16} style={styles.salleIcon} />
                      <span style={styles.salleName}>{salle.nom}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.capaciteBadge}>
                      <Users size={12} /> {salle.capacite}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {salle.type ? (
                      <span style={styles.typeBadge}>{salle.type}</span>
                    ) : (
                      <span style={styles.emptyBadge}>—</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {salle.localisation || '—'}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionsContainer}>
                      <button onClick={() => handleEdit(salle)} style={styles.editBtn} title="Modifier">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(salle.id)} style={styles.deleteBtn} title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal d'ajout/modification */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editId ? '✏️ Modifier la salle' : '➕ Ajouter une salle'}
              </h3>
              <button onClick={() => setShowModal(false)} style={styles.modalClose}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  <DoorOpen size={16} style={styles.formIcon} />
                  Nom de la salle *
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: Salle A101" 
                  value={form.nom} 
                  onChange={e => setForm({...form, nom: e.target.value})} 
                  style={{
                    ...styles.input,
                    borderColor: errors.nom ? '#ef4444' : '#e2e8f0'
                  }} 
                />
                {errors.nom && <div style={styles.fieldError}>{errors.nom}</div>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  <Users size={16} style={styles.formIcon} />
                  Capacité *
                </label>
                <input 
                  type="number" 
                  placeholder="Ex: 30" 
                  value={form.capacite} 
                  onChange={e => setForm({...form, capacite: e.target.value})} 
                  style={{
                    ...styles.input,
                    borderColor: errors.capacite ? '#ef4444' : '#e2e8f0'
                  }} 
                  min="1"
                />
                {errors.capacite && <div style={styles.fieldError}>{errors.capacite}</div>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  <Building size={16} style={styles.formIcon} />
                  Type de salle
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: Amphithéâtre, Laboratoire, Salle de cours" 
                  value={form.type} 
                  onChange={e => setForm({...form, type: e.target.value})} 
                  style={styles.input} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  <MapPin size={16} style={styles.formIcon} />
                  Localisation
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: Bâtiment A, 2ème étage" 
                  value={form.localisation} 
                  onChange={e => setForm({...form, localisation: e.target.value})} 
                  style={styles.input} 
                />
              </div>
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
    alignItems: 'center',
  },
  viewToggle: {
    display: 'flex',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
  },
  viewButton: {
    padding: '8px 12px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'transparent',
    color: '#475569',
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

  // Grid View
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s ease',
  },
  cardHeader: {
    padding: '16px 20px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  cardIcon: {
    color: '#2563eb',
  },
  cardTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
  },
  cardBody: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  cardInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: '#475569',
  },
  infoIcon: {
    color: '#94a3b8',
  },
  cardFooter: {
    padding: '12px 20px',
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
  },
  cardStatus: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#64748b',
  },

  // List View
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
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
  salleNameContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  salleIcon: {
    color: '#2563eb',
  },
  salleName: {
    fontWeight: 500,
  },
  capaciteBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500,
  },
  typeBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#f3e8ff',
    color: '#7c3aed',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500,
  },
  emptyBadge: {
    color: '#94a3b8',
    fontSize: '13px',
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
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
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
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
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

    .view-button:hover {
      background-color: #f1f5f9;
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

    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
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
      
      .grid {
        grid-template-columns: 1fr;
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