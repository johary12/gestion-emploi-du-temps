// src/pagesAdmin/AdminDisponibilites.jsx - Version avec charte graphique
import { useState, useEffect } from 'react';
import { disponibiliteService, profService } from '../services/api';
import { 
  Plus, Trash2, Search, User, Clock, AlertCircle, CheckCircle,
  Calendar, X, Filter, Users, Edit2, ChevronLeft, ChevronRight,
  Info
} from 'lucide-react';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function AdminDisponibilites() {
  const [dispos, setDispos] = useState([]);
  const [profs, setProfs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProf, setSelectedProf] = useState('');
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [form, setForm] = useState({ user_id: '', jour: 'Lundi', heure_debut: '08:00', heure_fin: '12:00' });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => { loadProfs(); }, []);

  const loadProfs = async () => {
    try { 
      const response = await profService.getAll(); 
      setProfs(response.data || []); 
    } catch (error) { 
      console.error('Erreur:', error); 
      showNotification('error', 'Erreur de chargement des professeurs'); 
    }
  };

  const loadDispos = async (profId) => {
    if (!profId) return;
    setLoading(true);
    try { 
      const response = await disponibiliteService.getByProf(profId); 
      setDispos(response.data || []); 
    } catch (error) { 
      console.error('Erreur:', error); 
      showNotification('error', 'Erreur de chargement des disponibilités'); 
    } finally { 
      setLoading(false); 
    }
  };

  const showNotification = (type, message) => { 
    setNotification({ show: true, type, message }); 
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 4000); 
  };

  const handleProfChange = (profId) => { 
    setSelectedProf(profId); 
    setCurrentPage(1);
    if (profId) loadDispos(profId); 
    else setDispos([]); 
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.user_id) newErrors.user_id = 'Veuillez sélectionner un professeur';
    if (!form.jour) newErrors.jour = 'Veuillez sélectionner un jour';
    if (!form.heure_debut) newErrors.heure_debut = 'Heure de début requise';
    if (!form.heure_fin) newErrors.heure_fin = 'Heure de fin requise';
    if (form.heure_debut && form.heure_fin && form.heure_debut >= form.heure_fin) {
      newErrors.heure_fin = 'L\'heure de fin doit être après l\'heure de début';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await disponibiliteService.create(form);
      await loadDispos(form.user_id);
      setShowModal(false);
      resetForm();
      showNotification('success', '✅ Disponibilité ajoutée avec succès');
    } catch (error) { 
      console.error('Erreur:', error); 
      showNotification('error', 'Erreur lors de la sauvegarde'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer cette disponibilité ?')) {
      setLoading(true);
      try { 
        await disponibiliteService.delete(id); 
        await loadDispos(selectedProf); 
        showNotification('success', '✅ Disponibilité supprimée avec succès'); 
      } catch (error) { 
        showNotification('error', 'Erreur lors de la suppression'); 
      } finally { 
        setLoading(false); 
      }
    }
  };

  const resetForm = () => {
    setForm({ user_id: selectedProf || '', jour: 'Lundi', heure_debut: '08:00', heure_fin: '12:00' });
    setErrors({});
  };

  const openModal = () => {
    setForm({ ...form, user_id: selectedProf || '' });
    setShowModal(true);
  };

  // Filtrer les disponibilités
  const filteredDispos = dispos.filter(d => 
    d.jour?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.heure_debut?.includes(searchTerm) ||
    d.heure_fin?.includes(searchTerm)
  );

  // Pagination
  const totalPages = Math.ceil(filteredDispos.length / itemsPerPage);
  const paginatedDispos = filteredDispos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistiques
  const getJourStats = () => {
    const stats = {};
    JOURS.forEach(j => {
      stats[j] = dispos.filter(d => d.jour === j).length;
    });
    return stats;
  };

  const jourStats = getJourStats();
  const totalDispos = dispos.length;
  const selectedProfName = profs.find(p => p.id === parseInt(selectedProf))?.name || '';

  // Obtenir l'icône du jour
  const getJourIcon = (jour) => {
    const icons = {
      'Lundi': '📅',
      'Mardi': '📆',
      'Mercredi': '📅',
      'Jeudi': '📆',
      'Vendredi': '📅',
      'Samedi': '📆'
    };
    return icons[jour] || '📅';
  };

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
          <h1 style={styles.pageTitle}>⏰ Gestion des disponibilités</h1>
          <p style={styles.pageSubtitle}>Gérez les disponibilités des professeurs</p>
        </div>
        <button 
          onClick={openModal} 
          style={{
            ...styles.addButton,
            opacity: selectedProf ? 1 : 0.5,
            cursor: selectedProf ? 'pointer' : 'not-allowed'
          }}
          disabled={!selectedProf}
          title={!selectedProf ? 'Veuillez d\'abord sélectionner un professeur' : ''}
        >
          <Plus size={18} />
          Ajouter
        </button>
      </div>

      {/* Sélection du professeur */}
      <div style={styles.filterBar}>
        <div style={styles.filterBarContent}>
          <User size={18} style={styles.filterIcon} />
          <select 
            value={selectedProf} 
            onChange={(e) => handleProfChange(e.target.value)} 
            style={styles.select}
          >
            <option value="">Sélectionner un professeur</option>
            {profs.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} {p.specialite ? `- ${p.specialite}` : ''}
              </option>
            ))}
          </select>
          {selectedProf && (
            <span style={styles.selectedProfName}>
              <User size={14} />
              {selectedProfName}
            </span>
          )}
        </div>
      </div>

      {selectedProf && (
        <>
          {/* Statistiques */}
          <div style={styles.statsContainer}>
            <div style={styles.statCard}>
              <Clock size={24} style={styles.statIcon} />
              <div>
                <div style={styles.statValue}>{totalDispos}</div>
                <div style={styles.statLabel}>Disponibilités totales</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <Calendar size={24} style={styles.statIcon} />
              <div>
                <div style={styles.statValue}>
                  {Object.values(jourStats).filter(v => v > 0).length}
                </div>
                <div style={styles.statLabel}>Jours couverts</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <Users size={24} style={styles.statIcon} />
              <div>
                <div style={styles.statValue}>
                  {profs.find(p => p.id === parseInt(selectedProf))?.name || '—'}
                </div>
                <div style={styles.statLabel}>Professeur sélectionné</div>
              </div>
            </div>
          </div>

          {/* Distribution par jour */}
          <div style={styles.distributionContainer}>
            <div style={styles.distributionHeader}>
              <span style={styles.distributionTitle}>Distribution par jour</span>
            </div>
            <div style={styles.distributionGrid}>
              {JOURS.map(jour => (
                <div key={jour} style={styles.distributionItem}>
                  <span style={styles.distributionDay}>
                    {getJourIcon(jour)} {jour}
                  </span>
                  <span style={styles.distributionCount}>{jourStats[jour] || 0}</span>
                  <div style={styles.distributionBar}>
                    <div style={{
                      ...styles.distributionBarFill,
                      width: `${totalDispos > 0 ? (jourStats[jour] / totalDispos) * 100 : 0}%`,
                      backgroundColor: '#2563eb'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Barre de recherche */}
          <div style={styles.searchSection}>
            <div style={styles.searchBar}>
              <Search size={18} style={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Rechercher par jour..." 
                value={searchTerm} 
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }} 
                style={styles.searchInput} 
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} style={styles.clearSearch}>
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Tableau des disponibilités */}
          <div style={styles.tableContainer}>
            <div style={styles.tableHeader}>
              <span style={styles.tableTitle}>Liste des disponibilités</span>
              <span style={styles.tableCount}>{filteredDispos.length} disponibilité(s)</span>
            </div>
            
            {loading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner} />
                <p>Chargement des disponibilités...</p>
              </div>
            ) : (
              <>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Jour</th>
                      <th style={styles.th}>Heure début</th>
                      <th style={styles.th}>Heure fin</th>
                      <th style={styles.th}>Durée</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDispos.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={styles.emptyRow}>
                          <div style={styles.emptyState}>
                            <Clock size={48} style={styles.emptyIcon} />
                            <p style={styles.emptyText}>Aucune disponibilité trouvée</p>
                            <p style={styles.emptySubtext}>
                              {searchTerm ? 'Aucune disponibilité ne correspond à votre recherche' : 'Ajoutez une disponibilité en cliquant sur "Ajouter"'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedDispos.map(d => {
                        const start = d.heure_debut?.substring(0,5) || '--:--';
                        const end = d.heure_fin?.substring(0,5) || '--:--';
                        // Calculer la durée en heures
                        const startMinutes = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]);
                        const endMinutes = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]);
                        const duration = endMinutes - startMinutes;
                        const durationHours = Math.floor(duration / 60);
                        const durationMinutes = duration % 60;
                        const durationText = durationHours > 0 
                          ? `${durationHours}h${durationMinutes > 0 ? durationMinutes : ''}`
                          : `${durationMinutes}min`;

                        return (
                          <tr key={d.id} style={styles.tr}>
                            <td style={styles.td}>
                              <div style={styles.jourContainer}>
                                <span style={styles.jourEmoji}>{getJourIcon(d.jour)}</span>
                                <span style={styles.jourName}>{d.jour}</span>
                              </div>
                            </td>
                            <td style={styles.td}>
                              <span style={styles.heureBadge}>{start}</span>
                            </td>
                            <td style={styles.td}>
                              <span style={styles.heureBadge}>{end}</span>
                            </td>
                            <td style={styles.td}>
                              <span style={styles.dureeBadge}>
                                <Clock size={12} />
                                {durationText}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <button 
                                onClick={() => handleDelete(d.id)} 
                                style={styles.deleteBtn}
                                title="Supprimer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={styles.pagination}>
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={styles.paginationButton}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span style={styles.paginationInfo}>
                      Page {currentPage} sur {totalPages}
                    </span>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      style={styles.paginationButton}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Modal d'ajout */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>➕ Ajouter une disponibilité</h3>
              <button onClick={() => setShowModal(false)} style={styles.modalClose}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  <User size={16} style={styles.formIcon} />
                  Professeur *
                </label>
                <select 
                  value={form.user_id} 
                  onChange={e => setForm({...form, user_id: e.target.value})} 
                  style={{
                    ...styles.input,
                    borderColor: errors.user_id ? '#ef4444' : '#e2e8f0'
                  }}
                >
                  <option value="">Choisir un professeur</option>
                  {profs.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {errors.user_id && <div style={styles.fieldError}>{errors.user_id}</div>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  <Calendar size={16} style={styles.formIcon} />
                  Jour *
                </label>
                <select 
                  value={form.jour} 
                  onChange={e => setForm({...form, jour: e.target.value})} 
                  style={{
                    ...styles.input,
                    borderColor: errors.jour ? '#ef4444' : '#e2e8f0'
                  }}
                >
                  {JOURS.map(j => (
                    <option key={j}>{j}</option>
                  ))}
                </select>
                {errors.jour && <div style={styles.fieldError}>{errors.jour}</div>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  <Clock size={16} style={styles.formIcon} />
                  Horaires *
                </label>
                <div style={styles.timeContainer}>
                  <div style={styles.timeField}>
                    <span style={styles.timeLabel}>Début</span>
                    <input 
                      type="time" 
                      value={form.heure_debut} 
                      onChange={e => setForm({...form, heure_debut: e.target.value})} 
                      style={{
                        ...styles.input,
                        borderColor: errors.heure_debut ? '#ef4444' : '#e2e8f0'
                      }} 
                    />
                  </div>
                  <span style={styles.timeSeparator}>à</span>
                  <div style={styles.timeField}>
                    <span style={styles.timeLabel}>Fin</span>
                    <input 
                      type="time" 
                      value={form.heure_fin} 
                      onChange={e => setForm({...form, heure_fin: e.target.value})} 
                      style={{
                        ...styles.input,
                        borderColor: errors.heure_fin ? '#ef4444' : '#e2e8f0'
                      }} 
                    />
                  </div>
                </div>
                {errors.heure_debut && <div style={styles.fieldError}>{errors.heure_debut}</div>}
                {errors.heure_fin && <div style={styles.fieldError}>{errors.heure_fin}</div>}
              </div>

              <div style={styles.infoBox}>
                <Info size={16} />
                <span>La disponibilité sera active pour le professeur sélectionné</span>
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

  // Filter Bar
  filterBar: {
    marginBottom: '24px',
  },
  filterBarContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    flexWrap: 'wrap',
  },
  filterIcon: {
    color: '#94a3b8',
  },
  select: {
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    color: '#1e293b',
    minWidth: '280px',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  selectedProfName: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 500,
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

  // Distribution
  distributionContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '16px 20px',
    marginBottom: '24px',
  },
  distributionHeader: {
    marginBottom: '12px',
  },
  distributionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b',
  },
  distributionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '8px',
  },
  distributionItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  distributionDay: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#475569',
  },
  distributionCount: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#2563eb',
  },
  distributionBar: {
    width: '100%',
    height: '4px',
    backgroundColor: '#e2e8f0',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  distributionBarFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
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

  // Jour
  jourContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  jourEmoji: {
    fontSize: '16px',
  },
  jourName: {
    fontWeight: 500,
  },

  // Badges
  heureBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#f1f5f9',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#475569',
  },
  dureeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500,
  },

  // Actions
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

  // Pagination
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '16px 20px',
    borderTop: '1px solid #e2e8f0',
  },
  paginationButton: {
    padding: '6px 12px',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    color: '#475569',
  },
  paginationInfo: {
    fontSize: '14px',
    color: '#64748b',
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
  timeContainer: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  timeField: {
    flex: 1,
  },
  timeLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '4px',
  },
  timeSeparator: {
    color: '#64748b',
    fontSize: '14px',
    fontWeight: 500,
    paddingBottom: '20px',
  },
  infoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: '#f0fdf4',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#166534',
    border: '1px solid #bbf7d0',
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

    .add-button:hover:not(:disabled) {
      background-color: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(37, 99, 235, 0.3);
    }

    .select:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
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

    .search-input:focus {
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

    .pagination-button:hover:not(:disabled) {
      background-color: #f1f5f9;
    }

    .pagination-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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
      
      .filter-bar-content {
        flex-direction: column;
        align-items: stretch;
      }
      
      .select {
        min-width: 100%;
      }
      
      .stats-container {
        grid-template-columns: 1fr;
      }
      
      .distribution-grid {
        grid-template-columns: 1fr 1fr;
      }
      
      .table-container {
        overflow-x: auto;
      }
      
      .table {
        min-width: 500px;
      }
      
      .time-container {
        flex-direction: column;
        align-items: stretch;
      }
      
      .time-separator {
        padding-bottom: 0;
        text-align: center;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}