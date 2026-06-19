// src/pagesAdmin/AdminSalles.jsx - Version avec mode sombre
import { useState, useEffect } from 'react';
import { salleService } from '../services/api';
import { 
  Plus, Edit2, Trash2, Search, MapPin, Users, AlertCircle, CheckCircle,
  DoorOpen, X, Filter, Building, Grid, Layers, AlertTriangle,
  Trash2 as TrashIcon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function AdminSalles() {
  const { theme } = useTheme();
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

  // États pour le modal de suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');

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

  // Ouvrir le modal de suppression
  const openDeleteModal = (id, nom) => {
    setDeleteId(id);
    setDeleteName(nom);
    setShowDeleteModal(true);
  };

  // Confirmer la suppression
  const confirmDelete = async () => {
    setLoading(true);
    try { 
      await salleService.delete(deleteId); 
      await loadSalles(); 
      showNotification('success', '✅ Salle supprimée avec succès'); 
      setShowDeleteModal(false);
      setDeleteId(null);
      setDeleteName('');
    } catch (error) { 
      showNotification('error', 'Erreur lors de la suppression'); 
    } finally { 
      setLoading(false); 
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
    <div style={{
      ...styles.container,
      backgroundColor: 'var(--bg-primary, #f8fafc)',
      color: 'var(--text-primary, #1e293b)',
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
      <div style={styles.headerSection}>
        <div>
          <h1 style={{
            ...styles.pageTitle,
            color: 'var(--text-primary, #1e293b)',
          }}>Gestion des salles</h1>
          <p style={{
            ...styles.pageSubtitle,
            color: 'var(--text-secondary, #64748b)',
          }}>Gérez les salles et leurs capacités</p>
        </div>
        <div style={styles.headerActions}>
          <div style={{
            ...styles.viewToggle,
            borderColor: 'var(--border-color, #e2e8f0)',
          }}>
            <button 
              onClick={() => setViewMode('grid')} 
              style={{
                ...styles.viewButton,
                backgroundColor: viewMode === 'grid' ? '#2563eb' : 'transparent',
                color: viewMode === 'grid' ? 'white' : 'var(--text-secondary, #475569)',
              }}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              style={{
                ...styles.viewButton,
                backgroundColor: viewMode === 'list' ? '#2563eb' : 'transparent',
                color: viewMode === 'list' ? 'white' : 'var(--text-secondary, #475569)',
              }}
            >
              <Layers size={18} />
            </button>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            style={{
              ...styles.filterToggle,
              backgroundColor: showFilters ? '#2563eb' : 'var(--bg-card, #ffffff)',
              color: showFilters ? 'white' : 'var(--text-secondary, #475569)',
              borderColor: showFilters ? '#2563eb' : 'var(--border-color, #e2e8f0)'
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
        <div style={{
          ...styles.statCard,
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderColor: 'var(--border-color, #e2e8f0)',
          boxShadow: '0 1px 3px var(--shadow-color, rgba(0,0,0,0.05))',
        }}>
          <DoorOpen size={24} style={styles.statIcon} />
          <div>
            <div style={{
              ...styles.statValue,
              color: 'var(--text-primary, #1e293b)',
            }}>{totalSalles}</div>
            <div style={{
              ...styles.statLabel,
              color: 'var(--text-secondary, #64748b)',
            }}>Salles</div>
          </div>
        </div>
        <div style={{
          ...styles.statCard,
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderColor: 'var(--border-color, #e2e8f0)',
          boxShadow: '0 1px 3px var(--shadow-color, rgba(0,0,0,0.05))',
        }}>
          <Users size={24} style={styles.statIcon} />
          <div>
            <div style={{
              ...styles.statValue,
              color: 'var(--text-primary, #1e293b)',
            }}>{totalCapacite}</div>
            <div style={{
              ...styles.statLabel,
              color: 'var(--text-secondary, #64748b)',
            }}>Places totales</div>
          </div>
        </div>
        <div style={{
          ...styles.statCard,
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderColor: 'var(--border-color, #e2e8f0)',
          boxShadow: '0 1px 3px var(--shadow-color, rgba(0,0,0,0.05))',
        }}>
          <Building size={24} style={styles.statIcon} />
          <div>
            <div style={{
              ...styles.statValue,
              color: 'var(--text-primary, #1e293b)',
            }}>{totalTypes}</div>
            <div style={{
              ...styles.statLabel,
              color: 'var(--text-secondary, #64748b)',
            }}>Types de salles</div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div style={styles.searchSection}>
        <div style={{
          ...styles.searchBar,
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderColor: 'var(--border-color, #e2e8f0)',
          boxShadow: '0 1px 3px var(--shadow-color, rgba(0,0,0,0.05))',
        }}>
          <Search size={18} style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Rechercher par nom, type ou localisation..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            style={{
              ...styles.searchInput,
              backgroundColor: 'transparent',
              color: 'var(--text-primary, #1e293b)',
            }} 
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{
              ...styles.clearSearch,
              color: 'var(--text-muted, #94a3b8)',
            }}>
              <X size={16} />
            </button>
          )}
        </div>

        {showFilters && (
          <div style={{
            ...styles.filtersPanel,
            backgroundColor: 'var(--bg-card, #ffffff)',
            borderColor: 'var(--border-color, #e2e8f0)',
          }}>
            <div style={styles.filterGroup}>
              <label style={{
                ...styles.filterLabel,
                color: 'var(--text-primary, #1e293b)',
              }}>Type de salle</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)} 
                style={{
                  ...styles.filterSelect,
                  backgroundColor: 'var(--bg-input, #ffffff)',
                  borderColor: 'var(--border-color, #e2e8f0)',
                  color: 'var(--text-primary, #1e293b)',
                }}
              >
                <option value="">Tous les types</option>
                {getUniqueTypes().map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => { setFilterType(''); setSearchTerm(''); }} 
              style={{
                ...styles.resetFiltersButton,
                backgroundColor: 'var(--bg-input, #f8fafc)',
                borderColor: 'var(--border-color, #e2e8f0)',
                color: 'var(--text-secondary, #475569)',
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Liste des salles */}
      {loading && filteredSalles.length === 0 ? (
        <div style={{
          ...styles.loadingContainer,
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderColor: 'var(--border-color, #e2e8f0)',
        }}>
          <div style={styles.spinner} />
          <p style={{ color: 'var(--text-secondary, #64748b)' }}>Chargement des salles...</p>
        </div>
      ) : filteredSalles.length === 0 ? (
        <div style={{
          ...styles.emptyState,
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderColor: 'var(--border-color, #e2e8f0)',
        }}>
          <DoorOpen size={48} style={styles.emptyIcon} />
          <p style={{
            ...styles.emptyText,
            color: 'var(--text-primary, #1e293b)',
          }}>Aucune salle trouvée</p>
          <p style={{
            ...styles.emptySubtext,
            color: 'var(--text-muted, #94a3b8)',
          }}>Ajoutez votre première salle en cliquant sur "Ajouter"</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={styles.grid}>
          {filteredSalles.map(salle => (
            <div key={salle.id} style={{
              ...styles.card,
              backgroundColor: 'var(--bg-card, #ffffff)',
              borderColor: 'var(--border-color, #e2e8f0)',
              boxShadow: '0 1px 3px var(--shadow-color, rgba(0,0,0,0.05))',
            }}>
              <div style={{
                ...styles.cardHeader,
                backgroundColor: 'var(--bg-input, #f8fafc)',
                borderBottom: '1px solid var(--border-color, #e2e8f0)',
              }}>
                <div style={styles.cardTitleContainer}>
                  <DoorOpen size={20} style={styles.cardIcon} />
                  <h3 style={{
                    ...styles.cardTitle,
                    color: 'var(--text-primary, #1e293b)',
                  }}>{salle.nom}</h3>
                </div>
                <div style={styles.cardActions}>
                  <button onClick={() => handleEdit(salle)} style={{
                    ...styles.editBtn,
                    backgroundColor: 'var(--bg-input, #eff6ff)',
                    color: '#2563eb',
                  }} title="Modifier">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => openDeleteModal(salle.id, salle.nom)} style={{
                    ...styles.deleteBtn,
                    backgroundColor: 'var(--bg-input, #fef2f2)',
                    color: '#dc2626',
                  }} title="Supprimer">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div style={styles.cardBody}>
                <div style={{
                  ...styles.cardInfo,
                  color: 'var(--text-secondary, #475569)',
                }}>
                  <Users size={16} style={styles.infoIcon} />
                  <span><strong style={{ color: 'var(--text-primary, #1e293b)' }}>Capacité:</strong> {salle.capacite} places</span>
                </div>
                <div style={{
                  ...styles.cardInfo,
                  color: 'var(--text-secondary, #475569)',
                }}>
                  <Building size={16} style={styles.infoIcon} />
                  <span><strong style={{ color: 'var(--text-primary, #1e293b)' }}>Type:</strong> {salle.type || '—'}</span>
                </div>
                <div style={{
                  ...styles.cardInfo,
                  color: 'var(--text-secondary, #475569)',
                }}>
                  <MapPin size={16} style={styles.infoIcon} />
                  <span><strong style={{ color: 'var(--text-primary, #1e293b)' }}>Localisation:</strong> {salle.localisation || '—'}</span>
                </div>
              </div>
              <div style={{
                ...styles.cardFooter,
                backgroundColor: 'var(--bg-input, #f8fafc)',
                borderTop: '1px solid var(--border-color, #e2e8f0)',
              }}>
                <span style={{
                  ...styles.cardStatus,
                  color: 'var(--text-secondary, #64748b)',
                }}>
                  {parseInt(salle.capacite) > 50 ? '🟢 Grande' : 
                   parseInt(salle.capacite) > 20 ? '🟡 Moyenne' : '🔵 Petite'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          ...styles.tableContainer,
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderColor: 'var(--border-color, #e2e8f0)',
          boxShadow: '0 1px 3px var(--shadow-color, rgba(0,0,0,0.05))',
        }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{
                  ...styles.th,
                  color: 'var(--text-secondary, #64748b)',
                  borderBottom: '1px solid var(--border-color, #e2e8f0)',
                  backgroundColor: 'var(--bg-input, #fafafa)',
                }}>Salle</th>
                <th style={{
                  ...styles.th,
                  color: 'var(--text-secondary, #64748b)',
                  borderBottom: '1px solid var(--border-color, #e2e8f0)',
                  backgroundColor: 'var(--bg-input, #fafafa)',
                }}>Capacité</th>
                <th style={{
                  ...styles.th,
                  color: 'var(--text-secondary, #64748b)',
                  borderBottom: '1px solid var(--border-color, #e2e8f0)',
                  backgroundColor: 'var(--bg-input, #fafafa)',
                }}>Type</th>
                <th style={{
                  ...styles.th,
                  color: 'var(--text-secondary, #64748b)',
                  borderBottom: '1px solid var(--border-color, #e2e8f0)',
                  backgroundColor: 'var(--bg-input, #fafafa)',
                }}>Localisation</th>
                <th style={{
                  ...styles.th,
                  color: 'var(--text-secondary, #64748b)',
                  borderBottom: '1px solid var(--border-color, #e2e8f0)',
                  backgroundColor: 'var(--bg-input, #fafafa)',
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSalles.map(salle => (
                <tr key={salle.id} style={{
                  ...styles.tr,
                  borderBottom: '1px solid var(--border-color, #f1f5f9)',
                }}>
                  <td style={{
                    ...styles.td,
                    color: 'var(--text-primary, #1e293b)',
                  }}>
                    <div style={styles.salleNameContainer}>
                      <DoorOpen size={16} style={styles.salleIcon} />
                      <span style={styles.salleName}>{salle.nom}</span>
                    </div>
                  </td>
                  <td style={{
                    ...styles.td,
                    color: 'var(--text-primary, #1e293b)',
                  }}>
                    <span style={{
                      ...styles.capaciteBadge,
                      backgroundColor: 'var(--bg-input, #eff6ff)',
                      color: '#2563eb',
                    }}>
                      <Users size={12} /> {salle.capacite}
                    </span>
                  </td>
                  <td style={{
                    ...styles.td,
                    color: 'var(--text-primary, #1e293b)',
                  }}>
                    {salle.type ? (
                      <span style={{
                        ...styles.typeBadge,
                        backgroundColor: 'var(--bg-input, #f3e8ff)',
                        color: '#7c3aed',
                      }}>{salle.type}</span>
                    ) : (
                      <span style={{
                        ...styles.emptyBadge,
                        color: 'var(--text-muted, #94a3b8)',
                      }}>—</span>
                    )}
                  </td>
                  <td style={{
                    ...styles.td,
                    color: 'var(--text-primary, #1e293b)',
                  }}>
                    {salle.localisation || '—'}
                  </td>
                  <td style={{
                    ...styles.td,
                    color: 'var(--text-primary, #1e293b)',
                  }}>
                    <div style={styles.actionsContainer}>
                      <button onClick={() => handleEdit(salle)} style={{
                        ...styles.editBtn,
                        backgroundColor: 'var(--bg-input, #eff6ff)',
                        color: '#2563eb',
                      }} title="Modifier">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => openDeleteModal(salle.id, salle.nom)} style={{
                        ...styles.deleteBtn,
                        backgroundColor: 'var(--bg-input, #fef2f2)',
                        color: '#dc2626',
                      }} title="Supprimer">
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

      {/* Modal d'ajout/modification avec étoiles rouges */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={{
            ...styles.modalContent,
            backgroundColor: 'var(--bg-card, #ffffff)',
            boxShadow: '0 20px 60px var(--shadow-color, rgba(0,0,0,0.2))',
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              ...styles.modalHeader,
              borderBottom: '1px solid var(--border-color, #e2e8f0)',
            }}>
              <h3 style={{
                ...styles.modalTitle,
                color: 'var(--text-primary, #1e293b)',
              }}>
                {editId ? '✏️ Modifier la salle' : '➕ Ajouter une salle'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{
                ...styles.modalClose,
                color: 'var(--text-muted, #94a3b8)',
              }}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={{
                  ...styles.formLabel,
                  color: 'var(--text-primary, #1e293b)',
                }}>
                  <DoorOpen size={16} style={styles.formIcon} />
                  Nom de la salle <span style={styles.requiredStar}>*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: Salle A101" 
                  value={form.nom} 
                  onChange={e => setForm({...form, nom: e.target.value})} 
                  style={{
                    ...styles.input,
                    backgroundColor: 'var(--bg-input, #f8fafc)',
                    borderColor: errors.nom ? '#ef4444' : 'var(--border-color, #e2e8f0)',
                    color: 'var(--text-primary, #1e293b)',
                  }} 
                />
                {errors.nom && <div style={styles.fieldError}>{errors.nom}</div>}
              </div>

              <div style={styles.formGroup}>
                <label style={{
                  ...styles.formLabel,
                  color: 'var(--text-primary, #1e293b)',
                }}>
                  <Users size={16} style={styles.formIcon} />
                  Capacité <span style={styles.requiredStar}>*</span>
                </label>
                <input 
                  type="number" 
                  placeholder="Ex: 30" 
                  value={form.capacite} 
                  onChange={e => setForm({...form, capacite: e.target.value})} 
                  style={{
                    ...styles.input,
                    backgroundColor: 'var(--bg-input, #f8fafc)',
                    borderColor: errors.capacite ? '#ef4444' : 'var(--border-color, #e2e8f0)',
                    color: 'var(--text-primary, #1e293b)',
                  }} 
                  min="1"
                />
                {errors.capacite && <div style={styles.fieldError}>{errors.capacite}</div>}
              </div>

              <div style={styles.formGroup}>
                <label style={{
                  ...styles.formLabel,
                  color: 'var(--text-primary, #1e293b)',
                }}>
                  <Building size={16} style={styles.formIcon} />
                  Type de salle
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: Amphithéâtre, Laboratoire, Salle de cours" 
                  value={form.type} 
                  onChange={e => setForm({...form, type: e.target.value})} 
                  style={{
                    ...styles.input,
                    backgroundColor: 'var(--bg-input, #f8fafc)',
                    borderColor: 'var(--border-color, #e2e8f0)',
                    color: 'var(--text-primary, #1e293b)',
                  }} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={{
                  ...styles.formLabel,
                  color: 'var(--text-primary, #1e293b)',
                }}>
                  <MapPin size={16} style={styles.formIcon} />
                  Localisation
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: Bâtiment A, 2ème étage" 
                  value={form.localisation} 
                  onChange={e => setForm({...form, localisation: e.target.value})} 
                  style={{
                    ...styles.input,
                    backgroundColor: 'var(--bg-input, #f8fafc)',
                    borderColor: 'var(--border-color, #e2e8f0)',
                    color: 'var(--text-primary, #1e293b)',
                  }} 
                />
              </div>
            </div>

            <div style={{
              ...styles.modalFooter,
              borderTop: '1px solid var(--border-color, #e2e8f0)',
            }}>
              <button onClick={() => setShowModal(false)} style={{
                ...styles.cancelBtn,
                backgroundColor: 'var(--bg-card, #ffffff)',
                borderColor: 'var(--border-color, #e2e8f0)',
                color: 'var(--text-secondary, #475569)',
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
                  'Enregistrer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression personnalisé */}
      {showDeleteModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div style={{
            ...styles.modalContent,
            backgroundColor: 'var(--bg-card, #ffffff)',
            boxShadow: '0 20px 60px var(--shadow-color, rgba(0,0,0,0.2))',
            maxWidth: '420px',
          }} onClick={e => e.stopPropagation()}>
            <div style={styles.deleteModalHeader}>
              <div style={styles.deleteIconContainer}>
                <AlertTriangle size={32} style={styles.deleteIcon} />
              </div>
              <button onClick={() => setShowDeleteModal(false)} style={{
                ...styles.modalClose,
                color: 'var(--text-muted, #94a3b8)',
              }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={styles.deleteModalBody}>
              <h3 style={{
                ...styles.deleteModalTitle,
                color: 'var(--text-primary, #1e293b)',
              }}>Confirmer la suppression</h3>
              <p style={{
                ...styles.deleteModalText,
                color: 'var(--text-secondary, #475569)',
              }}>
                Êtes-vous sûr de vouloir supprimer la salle <strong style={{ color: 'var(--text-primary, #1e293b)' }}>"{deleteName}"</strong> ?
              </p>
              <p style={{
                ...styles.deleteModalSubtext,
                color: 'var(--text-muted, #94a3b8)',
              }}>
                Cette action est irréversible et supprimera définitivement toutes les données associées.
              </p>
            </div>

            <div style={styles.deleteModalFooter}>
              <button 
                onClick={() => setShowDeleteModal(false)} 
                style={{
                  ...styles.deleteCancelBtn,
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  borderColor: 'var(--border-color, #e2e8f0)',
                  color: 'var(--text-secondary, #475569)',
                }}
              >
                Annuler
              </button>
              <button 
                onClick={confirmDelete} 
                style={styles.deleteConfirmBtn}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div style={styles.spinnerSmall} />
                    Suppression...
                  </>
                ) : (
                  <>
                    <TrashIcon size={16} />
                    Supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles avec charte graphique et variables CSS
const styles = {
  container: {
    padding: '24px 32px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '"Inter", "Poppins", "Roboto", -apple-system, sans-serif',
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
    margin: 0,
    fontFamily: '"Poppins", "Inter", sans-serif',
  },
  pageSubtitle: {
    fontSize: '14px',
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
  },
  statLabel: {
    fontSize: '13px',
    fontWeight: 500,
  },

  // Search
  searchSection: {
    marginBottom: '24px',
  },
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

  // Filters
  filtersPanel: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '16px',
    marginTop: '16px',
    padding: '16px',
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
    marginBottom: '6px',
  },
  filterSelect: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  resetFiltersButton: {
    padding: '10px 20px',
    border: '1px solid #e2e8f0',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
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
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s ease',
  },
  cardHeader: {
    padding: '16px 20px',
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
  },
  infoIcon: {
    color: '#94a3b8',
  },
  cardFooter: {
    padding: '12px 20px',
    borderTop: '1px solid #e2e8f0',
  },
  cardStatus: {
    fontSize: '12px',
    fontWeight: 500,
  },

  // List View
  tableContainer: {
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
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #e2e8f0',
  },
  tr: {
    transition: 'all 0.2s ease',
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '12px 20px',
    fontSize: '14px',
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
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500,
  },
  typeBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500,
  },
  emptyBadge: {
    fontSize: '13px',
  },

  // Actions
  actionsContainer: {
    display: 'flex',
    gap: '8px',
  },
  editBtn: {
    padding: '6px 10px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
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

  // Empty state
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
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
    marginBottom: '8px',
  },
  emptySubtext: {
    fontSize: '14px',
  },

  // Loading
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '16px',
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

  // Modal principal
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
    margin: 0,
    fontFamily: '"Poppins", "Inter", sans-serif',
  },
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
    marginBottom: '6px',
  },
  requiredStar: {
    color: '#ef4444',
    fontWeight: 700,
    fontSize: '16px',
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
    borderRadius: '40px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  saveBtn: {
    padding: '10px 24px',
    borderRadius: '40px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  // Delete Modal
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
      background-color: var(--hover-bg, #f1f5f9) !important;
    }

    .reset-filters-button:hover {
      background-color: var(--hover-bg, #e2e8f0) !important;
    }

    .edit-btn:hover {
      background-color: #dbeafe !important;
      transform: scale(1.05);
    }

    .delete-btn:hover {
      background-color: #fecaca !important;
      transform: scale(1.05);
    }

    .save-btn:hover:not(:disabled) {
      background-color: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    .cancel-btn:hover {
      background-color: var(--hover-bg, #f8fafc) !important;
    }

    .modal-close:hover {
      background-color: var(--hover-bg, #f1f5f9) !important;
    }

    .clear-search:hover {
      background-color: var(--hover-bg, #f1f5f9) !important;
    }

    .input:focus {
      border-color: #2563eb !important;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .filter-select:focus {
      border-color: #2563eb !important;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px var(--shadow-color, rgba(0, 0, 0, 0.08));
    }

    .tr:hover {
      background-color: var(--hover-bg, #f8fafc) !important;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px var(--shadow-color, rgba(0, 0, 0, 0.08));
      transition: all 0.2s ease;
    }

    .delete-cancel-btn:hover {
      background-color: var(--hover-bg, #f8fafc) !important;
    }

    .delete-confirm-btn:hover:not(:disabled) {
      background-color: #b91c1c !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
    }

    /* Scrollbar */
    .modal-body::-webkit-scrollbar {
      width: 4px;
    }
    
    .modal-body::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .modal-body::-webkit-scrollbar-thumb {
      background: var(--text-muted, #cbd5e1);
      border-radius: 4px;
    }
    
    .modal-body::-webkit-scrollbar-thumb:hover {
      background: var(--text-secondary, #94a3b8);
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