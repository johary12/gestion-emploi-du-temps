// src/pagesProf/ProfDisponibilites.jsx
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { dispoService } from '../services/api';
import { 
  Plus, Trash2, Clock, AlertCircle, CheckCircle, 
  Calendar, X, Filter, Edit2, ChevronLeft, ChevronRight,
  Info, Users, Search, AlertTriangle, LogOut
} from 'lucide-react';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function ProfDisponibilites() {
  const { theme } = useTheme();
  const [dispos, setDispos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [form, setForm] = useState({ jour: 'Lundi', heure_debut: '08:00', heure_fin: '12:00' });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isDark = theme === 'dark';

  useEffect(() => { loadDispos(); }, []);

  const loadDispos = async () => {
    setLoading(true);
    try { 
      const response = await dispoService.getMyDispos(); 
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

  const validateForm = () => {
    const newErrors = {};
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
      await dispoService.create(form);
      await loadDispos();
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

  const handleDeleteClick = (id) => {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try { 
      await dispoService.delete(deleteTarget); 
      await loadDispos(); 
      showNotification('success', '✅ Disponibilité supprimée avec succès'); 
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (error) { 
      showNotification('error', 'Erreur lors de la suppression'); 
    } finally { 
      setLoading(false); 
    }
  };

  const resetForm = () => {
    setForm({ jour: 'Lundi', heure_debut: '08:00', heure_fin: '12:00' });
    setErrors({});
  };

  const filteredDispos = dispos.filter(d => 
    d.jour?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDispos.length / itemsPerPage);
  const paginatedDispos = filteredDispos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getJourStats = () => {
    const stats = {};
    JOURS.forEach(j => {
      stats[j] = dispos.filter(d => d.jour === j).length;
    });
    return stats;
  };

  const jourStats = getJourStats();
  const totalDispos = dispos.length;

  const getJourIcon = (jour) => {
    const icons = {
      'Lundi': '📅', 'Mardi': '📆', 'Mercredi': '📅',
      'Jeudi': '📆', 'Vendredi': '📅', 'Samedi': '📆'
    };
    return icons[jour] || '📅';
  };

  const getDispoDetails = (id) => {
    return dispos.find(d => d.id === id);
  };

  return (
    <div style={{
      ...styles.container,
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
      color: isDark ? '#f1f5f9' : '#1e293b',
    }}>
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
      <div style={styles.header}>
        <div>
          <h1 style={{
            ...styles.pageTitle,
            color: isDark ? '#f1f5f9' : '#1e293b',
          }}>Mes disponibilités</h1>
          <p style={{
            ...styles.pageSubtitle,
            color: isDark ? '#94a3b8' : '#64748b',
          }}>Gérez vos disponibilités hebdomadaires</p>
        </div>
        <button onClick={() => setShowModal(true)} style={styles.addButton}>
          <Plus size={18} />
          Ajouter
        </button>
      </div>

      {/* Statistiques */}
      <div style={styles.statsContainer}>
        <div style={{
          ...styles.statCard,
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e2e8f0',
        }}>
          <Clock size={24} style={styles.statIcon} />
          <div>
            <div style={{
              ...styles.statValue,
              color: isDark ? '#f1f5f9' : '#1e293b',
            }}>{totalDispos}</div>
            <div style={{
              ...styles.statLabel,
              color: isDark ? '#94a3b8' : '#64748b',
            }}>Disponibilités totales</div>
          </div>
        </div>
        <div style={{
          ...styles.statCard,
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e2e8f0',
        }}>
          <Calendar size={24} style={styles.statIcon} />
          <div>
            <div style={{
              ...styles.statValue,
              color: isDark ? '#f1f5f9' : '#1e293b',
            }}>
              {Object.values(jourStats).filter(v => v > 0).length}
            </div>
            <div style={{
              ...styles.statLabel,
              color: isDark ? '#94a3b8' : '#64748b',
            }}>Jours couverts</div>
          </div>
        </div>
        <div style={{
          ...styles.statCard,
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e2e8f0',
        }}>
          <Users size={24} style={styles.statIcon} />
          <div>
            <div style={{
              ...styles.statValue,
              color: isDark ? '#f1f5f9' : '#1e293b',
            }}>
              {dispos.length > 0 ? Math.round((Object.values(jourStats).filter(v => v > 0).length / JOURS.length) * 100) : 0}%
            </div>
            <div style={{
              ...styles.statLabel,
              color: isDark ? '#94a3b8' : '#64748b',
            }}>Taux de couverture</div>
          </div>
        </div>
      </div>

      {/* Distribution par jour */}
      <div style={{
        ...styles.distributionContainer,
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e2e8f0',
      }}>
        <div style={styles.distributionHeader}>
          <span style={{
            ...styles.distributionTitle,
            color: isDark ? '#f1f5f9' : '#1e293b',
          }}>Distribution par jour</span>
          <span style={{
            ...styles.distributionSubtitle,
            color: isDark ? '#94a3b8' : '#64748b',
          }}>Vos disponibilités</span>
        </div>
        <div style={styles.distributionGrid}>
          {JOURS.map(jour => (
            <div key={jour} style={styles.distributionItem}>
              <span style={{
                ...styles.distributionDay,
                color: isDark ? '#94a3b8' : '#475569',
              }}>
                {getJourIcon(jour)} {jour}
              </span>
              <span style={{
                ...styles.distributionCount,
                color: '#059669',
              }}>{jourStats[jour] || 0}</span>
              <div style={{
                ...styles.distributionBar,
                backgroundColor: isDark ? '#334155' : '#e2e8f0',
              }}>
                <div style={{
                  ...styles.distributionBarFill,
                  width: `${totalDispos > 0 ? (jourStats[jour] / totalDispos) * 100 : 0}%`,
                  backgroundColor: '#059669'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Barre de recherche */}
      <div style={styles.searchSection}>
        <div style={{
          ...styles.searchBar,
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e2e8f0',
        }}>
          <Search size={18} style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Rechercher par jour..." 
            value={searchTerm} 
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }} 
            style={{
              ...styles.searchInput,
              backgroundColor: 'transparent',
              color: isDark ? '#f1f5f9' : '#1e293b',
            }} 
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={styles.clearSearch}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Tableau des disponibilités */}
      <div style={{
        ...styles.tableContainer,
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e2e8f0',
      }}>
        <div style={{
          ...styles.tableHeader,
          backgroundColor: isDark ? '#0f172a' : '#f8fafc',
          borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        }}>
          <span style={{
            ...styles.tableTitle,
            color: isDark ? '#f1f5f9' : '#1e293b',
          }}>Liste de vos disponibilités</span>
          <span style={{
            ...styles.tableCount,
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderColor: isDark ? '#334155' : '#e2e8f0',
            color: isDark ? '#94a3b8' : '#64748b',
          }}>{filteredDispos.length} disponibilité(s)</span>
        </div>
        
        {loading && filteredDispos.length === 0 ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner} />
            <p>Chargement de vos disponibilités...</p>
          </div>
        ) : (
          <>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{
                    ...styles.th,
                    color: isDark ? '#94a3b8' : '#64748b',
                    borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    backgroundColor: isDark ? '#0f172a' : '#fafafa',
                  }}>Jour</th>
                  <th style={{
                    ...styles.th,
                    color: isDark ? '#94a3b8' : '#64748b',
                    borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    backgroundColor: isDark ? '#0f172a' : '#fafafa',
                  }}>Heure début</th>
                  <th style={{
                    ...styles.th,
                    color: isDark ? '#94a3b8' : '#64748b',
                    borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    backgroundColor: isDark ? '#0f172a' : '#fafafa',
                  }}>Heure fin</th>
                  <th style={{
                    ...styles.th,
                    color: isDark ? '#94a3b8' : '#64748b',
                    borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    backgroundColor: isDark ? '#0f172a' : '#fafafa',
                  }}>Durée</th>
                  <th style={{
                    ...styles.th,
                    color: isDark ? '#94a3b8' : '#64748b',
                    borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    backgroundColor: isDark ? '#0f172a' : '#fafafa',
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDispos.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={styles.emptyRow}>
                      <div style={styles.emptyState}>
                        <Clock size={48} style={styles.emptyIcon} />
                        <p style={{
                          ...styles.emptyText,
                          color: isDark ? '#f1f5f9' : '#1e293b',
                        }}>Aucune disponibilité trouvée</p>
                        <p style={{
                          ...styles.emptySubtext,
                          color: isDark ? '#94a3b8' : '#94a3b8',
                        }}>
                          {searchTerm ? 'Aucune disponibilité ne correspond à votre recherche' : 'Ajoutez votre première disponibilité en cliquant sur "Ajouter"'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedDispos.map(d => {
                    const start = d.heure_debut?.substring(0,5) || '--:--';
                    const end = d.heure_fin?.substring(0,5) || '--:--';
                    const startMinutes = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]);
                    const endMinutes = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]);
                    const duration = endMinutes - startMinutes;
                    const durationHours = Math.floor(duration / 60);
                    const durationMinutes = duration % 60;
                    const durationText = durationHours > 0 
                      ? `${durationHours}h${durationMinutes > 0 ? durationMinutes : ''}`
                      : `${durationMinutes}min`;

                    return (
                      <tr key={d.id} style={{
                        ...styles.tr,
                        borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
                      }}>
                        <td style={{
                          ...styles.td,
                          color: isDark ? '#f1f5f9' : '#1e293b',
                        }}>
                          <div style={styles.jourContainer}>
                            <span style={styles.jourEmoji}>{getJourIcon(d.jour)}</span>
                            <span style={styles.jourName}>{d.jour}</span>
                          </div>
                        </td>
                        <td style={{
                          ...styles.td,
                          color: isDark ? '#f1f5f9' : '#1e293b',
                        }}>
                          <span style={{
                            ...styles.heureBadge,
                            backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                            color: isDark ? '#94a3b8' : '#475569',
                          }}>{start}</span>
                        </td>
                        <td style={{
                          ...styles.td,
                          color: isDark ? '#f1f5f9' : '#1e293b',
                        }}>
                          <span style={{
                            ...styles.heureBadge,
                            backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                            color: isDark ? '#94a3b8' : '#475569',
                          }}>{end}</span>
                        </td>
                        <td style={{
                          ...styles.td,
                          color: isDark ? '#f1f5f9' : '#1e293b',
                        }}>
                          <span style={{
                            ...styles.dureeBadge,
                            backgroundColor: isDark ? '#0f172a' : '#ecfdf5',
                            color: '#059669',
                          }}>
                            <Clock size={12} />
                            {durationText}
                          </span>
                        </td>
                        <td style={{
                          ...styles.td,
                          color: isDark ? '#f1f5f9' : '#1e293b',
                        }}>
                          <button 
                            onClick={() => handleDeleteClick(d.id)} 
                            style={{
                              ...styles.deleteBtn,
                              backgroundColor: isDark ? '#0f172a' : '#fef2f2',
                              color: '#dc2626',
                            }}
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
              <div style={{
                ...styles.pagination,
                borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              }}>
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    ...styles.paginationButton,
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    color: isDark ? '#94a3b8' : '#475569',
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{
                  ...styles.paginationInfo,
                  color: isDark ? '#94a3b8' : '#64748b',
                }}>
                  Page {currentPage} sur {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    ...styles.paginationButton,
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    color: isDark ? '#94a3b8' : '#475569',
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal d'ajout */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={{
            ...styles.modalContent,
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            boxShadow: `0 20px 60px ${isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0, 0, 0, 0.2)'}`,
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              ...styles.modalHeader,
              borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            }}>
              <h3 style={{
                ...styles.modalTitle,
                color: isDark ? '#f1f5f9' : '#1e293b',
              }}>➕ Ajouter une disponibilité</h3>
              <button onClick={() => setShowModal(false)} style={styles.modalClose}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={{
                  ...styles.formLabel,
                  color: isDark ? '#f1f5f9' : '#1e293b',
                }}>
                  <Calendar size={16} style={styles.formIcon} />
                  Jour *
                </label>
                <select 
                  value={form.jour} 
                  onChange={e => setForm({...form, jour: e.target.value})} 
                  style={{
                    ...styles.input,
                    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                    borderColor: errors.jour ? '#ef4444' : (isDark ? '#475569' : '#e2e8f0'),
                    color: isDark ? '#f1f5f9' : '#1e293b',
                  }}
                >
                  {JOURS.map(j => (
                    <option key={j}>{j}</option>
                  ))}
                </select>
                {errors.jour && <div style={styles.fieldError}>{errors.jour}</div>}
              </div>

              <div style={styles.formGroup}>
                <label style={{
                  ...styles.formLabel,
                  color: isDark ? '#f1f5f9' : '#1e293b',
                }}>
                  <Clock size={16} style={styles.formIcon} />
                  Horaires *
                </label>
                <div style={styles.timeContainer}>
                  <div style={styles.timeField}>
                    <span style={{
                      ...styles.timeLabel,
                      color: isDark ? '#94a3b8' : '#64748b',
                    }}>Début</span>
                    <input 
                      type="time" 
                      value={form.heure_debut} 
                      onChange={e => setForm({...form, heure_debut: e.target.value})} 
                      style={{
                        ...styles.input,
                        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                        borderColor: errors.heure_debut ? '#ef4444' : (isDark ? '#475569' : '#e2e8f0'),
                        color: isDark ? '#f1f5f9' : '#1e293b',
                      }} 
                    />
                  </div>
                  <span style={{
                    ...styles.timeSeparator,
                    color: isDark ? '#94a3b8' : '#64748b',
                  }}>à</span>
                  <div style={styles.timeField}>
                    <span style={{
                      ...styles.timeLabel,
                      color: isDark ? '#94a3b8' : '#64748b',
                    }}>Fin</span>
                    <input 
                      type="time" 
                      value={form.heure_fin} 
                      onChange={e => setForm({...form, heure_fin: e.target.value})} 
                      style={{
                        ...styles.input,
                        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                        borderColor: errors.heure_fin ? '#ef4444' : (isDark ? '#475569' : '#e2e8f0'),
                        color: isDark ? '#f1f5f9' : '#1e293b',
                      }} 
                    />
                  </div>
                </div>
                {errors.heure_debut && <div style={styles.fieldError}>{errors.heure_debut}</div>}
                {errors.heure_fin && <div style={styles.fieldError}>{errors.heure_fin}</div>}
              </div>

              <div style={{
                ...styles.infoBox,
                backgroundColor: isDark ? '#0f172a' : '#f0fdf4',
                borderColor: isDark ? '#334155' : '#bbf7d0',
                color: isDark ? '#a7f3d0' : '#065f46',
              }}>
                <Info size={16} />
                <span>Vos disponibilités seront visibles par l'administration pour la planification des cours</span>
              </div>
            </div>

            <div style={{
              ...styles.modalFooter,
              borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            }}>
              <button onClick={() => setShowModal(false)} style={{
                ...styles.cancelBtn,
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderColor: isDark ? '#475569' : '#e2e8f0',
                color: isDark ? '#f1f5f9' : '#475569',
              }}>
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

      {/* MODAL DE CONFIRMATION DE SUPPRESSION - Version moderne */}
      {showDeleteModal && (
        <div 
          style={styles.modalOverlay} 
          className="modal-overlay"
          role="dialog" 
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          onClick={() => setShowDeleteModal(false)}
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
                onClick={() => setShowDeleteModal(false)} 
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
              }}>Confirmation de suppression</h3>
              <p style={{
                ...styles.deleteModalText,
                color: isDark ? '#94a3b8' : '#475569',
              }}>
                Êtes-vous sûr de vouloir supprimer cette disponibilité ?
              </p>
              {deleteTarget && (
                <p style={{
                  ...styles.deleteModalSubtext,
                  color: isDark ? '#64748b' : '#94a3b8',
                }}>
                  {getDispoDetails(deleteTarget)?.jour} • {getDispoDetails(deleteTarget)?.heure_debut?.substring(0,5)} - {getDispoDetails(deleteTarget)?.heure_fin?.substring(0,5)}
                </p>
              )}
            </div>

            {/* Footer avec boutons */}
            <div style={styles.deleteModalFooter}>
              <button 
                onClick={() => setShowDeleteModal(false)} 
                style={{
                  ...styles.deleteCancelBtn,
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  borderColor: isDark ? '#475569' : '#e2e8f0',
                  color: isDark ? '#f1f5f9' : '#475569',
                }}
                aria-label="Annuler la suppression"
              >
                Annuler
              </button>
              <button 
                onClick={confirmDelete} 
                style={styles.deleteConfirmBtn}
                aria-label="Confirmer la suppression"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div style={styles.spinnerSmall} />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .add-button:hover:not(:disabled) {
          background-color: #047857;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(5, 150, 105, 0.3);
        }
        .delete-btn:hover {
          background-color: #fecaca;
          transform: scale(1.05);
        }
        .save-btn:hover:not(:disabled) {
          background-color: #047857;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }
        .cancel-btn:hover { background-color: var(--hover-bg, #f8fafc); }
        .modal-close:hover { background-color: var(--hover-bg, #f1f5f9); }
        .clear-search:hover { background-color: var(--hover-bg, #f1f5f9); }
        .input:focus {
          border-color: #059669;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }
        .search-input:focus {
          border-color: #059669;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }
        .tr:hover { background-color: var(--hover-bg, #f8fafc); }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.2s ease;
        }
        .pagination-button:hover:not(:disabled) { background-color: var(--hover-bg, #f1f5f9); }
        .pagination-button:disabled { opacity: 0.5; cursor: not-allowed; }
        
        /* Styles du modal de suppression */
        .delete-cancel-btn:hover {
          background-color: var(--hover-bg, #f8fafc) !important;
        }
        .delete-confirm-btn:hover:not(:disabled) {
          background-color: #b91c1c !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
        }
        
        @media (max-width: 768px) {
          .container { padding: 16px; }
          .header { flex-direction: column; align-items: flex-start; }
          .add-button { width: 100%; justify-content: center; }
          .stats-container { grid-template-columns: 1fr; }
          .distribution-grid { grid-template-columns: 1fr 1fr; }
          .table-container { overflow-x: auto; }
          .table { min-width: 500px; }
          .time-container { flex-direction: column; align-items: stretch; }
          .time-separator { padding-bottom: 0; text-align: center; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px 32px',
    maxWidth: '1000px',
    margin: '0 auto',
    fontFamily: '"Inter", "Poppins", "Roboto", -apple-system, sans-serif',
    minHeight: '100vh',
    transition: 'all 0.3s ease',
  },
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
  notificationMessage: { fontSize: '14px', fontWeight: 500 },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: { fontSize: '28px', fontWeight: 700, margin: 0, fontFamily: '"Poppins", "Inter", sans-serif' },
  pageSubtitle: { fontSize: '14px', margin: '4px 0 0' },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px rgba(5, 150, 105, 0.2)',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
  },
  statIcon: { color: '#059669' },
  statValue: { fontSize: '24px', fontWeight: 700 },
  statLabel: { fontSize: '13px', fontWeight: 500 },
  distributionContainer: {
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '16px 20px',
    marginBottom: '24px',
  },
  distributionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  distributionTitle: { fontSize: '14px', fontWeight: 600 },
  distributionSubtitle: { fontSize: '12px' },
  distributionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '8px',
  },
  distributionItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  distributionDay: { fontSize: '13px', fontWeight: 500 },
  distributionCount: { fontSize: '12px', fontWeight: 600, color: '#059669' },
  distributionBar: {
    width: '100%',
    height: '4px',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  distributionBarFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  searchSection: { marginBottom: '24px' },
  searchBar: {
    position: 'relative',
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
  },
  clearSearch: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
  },
  tableContainer: {
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
    borderBottom: '1px solid #e2e8f0',
  },
  tableTitle: { fontSize: '16px', fontWeight: 600 },
  tableCount: {
    fontSize: '13px',
    padding: '4px 12px',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '12px 20px',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #e2e8f0',
  },
  tr: { transition: 'all 0.2s ease', borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 20px', fontSize: '14px', verticalAlign: 'middle' },
  jourContainer: { display: 'flex', alignItems: 'center', gap: '8px' },
  jourEmoji: { fontSize: '16px' },
  jourName: { fontWeight: 500 },
  heureBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
  },
  dureeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500,
  },
  deleteBtn: {
    padding: '6px 10px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
  },
  emptyRow: { padding: '40px 20px' },
  emptyState: { textAlign: 'center', padding: '40px 20px' },
  emptyIcon: { color: '#cbd5e1', marginBottom: '16px' },
  emptyText: { fontSize: '18px', fontWeight: 600, marginBottom: '8px' },
  emptySubtext: { fontSize: '14px' },
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
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
  },
  paginationInfo: { fontSize: '14px' },
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
    borderTopColor: '#059669',
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
    borderRadius: '16px',
    width: '480px',
    maxWidth: '100%',
    maxHeight: '90vh',
    overflow: 'hidden',
    animation: 'scaleIn 0.25s ease-out',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
  },
  modalTitle: { fontSize: '20px', fontWeight: 600, margin: 0, fontFamily: '"Poppins", "Inter", sans-serif' },
  modalClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
  },
  modalBody: { padding: '24px', overflowY: 'auto' },
  modalFooter: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    padding: '16px 24px',
    borderTop: '1px solid #e2e8f0',
  },
  formGroup: { marginBottom: '16px' },
  formLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '6px',
  },
  formIcon: { color: '#059669' },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  fieldError: { fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' },
  timeContainer: { display: 'flex', gap: '12px', alignItems: 'center' },
  timeField: { flex: 1 },
  timeLabel: { display: 'block', fontSize: '12px', marginBottom: '4px' },
  timeSeparator: { fontSize: '14px', fontWeight: 500, paddingBottom: '20px' },
  infoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    border: '1px solid #bbf7d0',
  },
  cancelBtn: {
    padding: '10px 24px',
    border: '1px solid #e2e8f0',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  saveBtn: {
    padding: '10px 24px',
    backgroundColor: '#059669',
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

  // Styles du modal de suppression (copiés de NavbarAdmin)
  deleteModalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px 0 24px',
  },
  deleteIconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#fef2f2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    color: '#dc2626',
  },
  deleteModalBody: {
    padding: '16px 24px 24px 24px',
    textAlign: 'center',
  },
  deleteModalTitle: {
    fontSize: '18px',
    fontWeight: 600,
    margin: '0 0 12px 0',
  },
  deleteModalText: {
    fontSize: '15px',
    margin: '0 0 8px 0',
    lineHeight: '1.6',
  },
  deleteModalSubtext: {
    fontSize: '13px',
    margin: 0,
  },
  deleteModalFooter: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    padding: '16px 24px 24px 24px',
  },
  deleteCancelBtn: {
    padding: '10px 24px',
    border: '1px solid #e2e8f0',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    minWidth: '100px',
  },
  deleteConfirmBtn: {
    padding: '10px 24px',
    backgroundColor: '#dc2626',
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
    minWidth: '100px',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
  },
};