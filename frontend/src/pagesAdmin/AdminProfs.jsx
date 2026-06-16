// src/pagesAdmin/AdminProfs.jsx - Version avec mode sombre
import { useState, useEffect } from 'react';
import { profService } from '../services/api';
import { 
  Plus, Edit2, Trash2, Search, Mail, User, AlertCircle, CheckCircle, 
  GraduationCap, X, Filter, Users, Phone, BookOpen, Lock,
  Eye, EyeOff, CheckCircle as CheckCircleIcon, XCircle, AlertTriangle,
  Trash2 as TrashIcon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function AdminProfs() {
  const { theme } = useTheme();
  const [profs, setProfs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [form, setForm] = useState({ name: '', email: '', specialite: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterSpecialite, setFilterSpecialite] = useState('');
  
  // États pour la validation de l'email
  const [emailStrength, setEmailStrength] = useState(0);
  const [emailValid, setEmailValid] = useState(false);
  const [isEmailTouched, setIsEmailTouched] = useState(false);

  // États pour le modal de suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');

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

  // Fonction pour valider l'email et calculer le pourcentage
  const validateAndCalculateStrength = (emailValue) => {
    let strength = 0;
    let valid = false;

    const hasAt = emailValue.includes('@');
    const hasDot = emailValue.includes('.');
    const hasDotAfterAt = hasAt && emailValue.indexOf('.') > emailValue.indexOf('@');
    const hasValidDomain = hasDotAfterAt && emailValue.split('.').pop().length >= 2;
    const hasValidLocal = hasAt && emailValue.split('@')[0].length >= 1;

    if (emailValue.length > 0) {
      strength += 10;
    }
    if (hasAt) {
      strength += 25;
    }
    if (hasDot) {
      strength += 15;
    }
    if (hasDotAfterAt) {
      strength += 25;
    }
    if (hasValidDomain) {
      strength += 15;
    }
    if (hasValidLocal) {
      strength += 10;
    }

    valid = hasAt && hasDot && hasDotAfterAt && hasValidDomain && hasValidLocal;

    return { strength: Math.min(strength, 100), valid };
  };

  useEffect(() => {
    if (form.email) {
      const result = validateAndCalculateStrength(form.email);
      setEmailStrength(result.strength);
      setEmailValid(result.valid);
    } else {
      setEmailStrength(0);
      setEmailValid(false);
    }
  }, [form.email]);

  const handleEmailChange = (e) => {
    setForm({...form, email: e.target.value});
    setIsEmailTouched(true);
  };

  const getStrengthColor = () => {
    if (emailStrength <= 30) return '#ef4444';
    if (emailStrength <= 60) return '#f59e0b';
    if (emailStrength <= 85) return '#3b82f6';
    return '#10b981';
  };

  const getValidationMessage = () => {
    if (!isEmailTouched || !form.email) return '';
    if (emailValid) return { text: '✅ Email valide', color: '#10b981' };
    if (form.email.length === 0) return { text: 'Veuillez saisir un email', color: '#94a3b8' };
    return { text: '⚠️ Email invalide (ex: nom@domaine.com)', color: '#ef4444' };
  };

  const validationMessage = getValidationMessage();

  const validateForm = () => {
    const newErrors = {};
    if (!form.name?.trim()) newErrors.name = 'Le nom est requis';
    if (!form.email?.trim()) newErrors.email = 'L\'email est requis';
    else if (!emailValid) newErrors.email = 'Email invalide (ex: nom@domaine.com)';
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
        const updateData = { name: form.name, email: form.email, specialite: form.specialite };
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

  // Ouvrir le modal de suppression
  const openDeleteModal = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setShowDeleteModal(true);
  };

  // Confirmer la suppression
  const confirmDelete = async () => {
    setLoading(true);
    try { 
      await profService.delete(deleteId); 
      await loadProfs(); 
      showNotification('success', '✅ Professeur supprimé avec succès'); 
      setShowDeleteModal(false);
      setDeleteId(null);
      setDeleteName('');
    } catch (error) { 
      showNotification('error', 'Erreur lors de la suppression'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleEdit = (prof) => { 
    setEditId(prof.id); 
    setForm({ 
      name: prof.name, 
      email: prof.email, 
      specialite: prof.specialite || '',
      password: '' 
    }); 
    setIsEmailTouched(true);
    setShowModal(true); 
  };
  
  const resetForm = () => { 
    setEditId(null); 
    setForm({ name: '', email: '', specialite: '', password: '' }); 
    setErrors({});
    setIsEmailTouched(false);
    setEmailStrength(0);
    setEmailValid(false);
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
          }}>👨‍🏫 Gestion des professeurs</h1>
          <p style={{
            ...styles.pageSubtitle,
            color: 'var(--text-secondary, #64748b)',
          }}>Gérez les professeurs et leurs spécialités</p>
        </div>
        <div style={styles.headerActions}>
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
          <Users size={24} style={styles.statIcon} />
          <div>
            <div style={{
              ...styles.statValue,
              color: 'var(--text-primary, #1e293b)',
            }}>{totalProfs}</div>
            <div style={{
              ...styles.statLabel,
              color: 'var(--text-secondary, #64748b)',
            }}>Professeurs</div>
          </div>
        </div>
        <div style={{
          ...styles.statCard,
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderColor: 'var(--border-color, #e2e8f0)',
          boxShadow: '0 1px 3px var(--shadow-color, rgba(0,0,0,0.05))',
        }}>
          <BookOpen size={24} style={styles.statIcon} />
          <div>
            <div style={{
              ...styles.statValue,
              color: 'var(--text-primary, #1e293b)',
            }}>{totalSpecialites}</div>
            <div style={{
              ...styles.statLabel,
              color: 'var(--text-secondary, #64748b)',
            }}>Spécialités</div>
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
            placeholder="Rechercher par nom ou email..." 
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
              }}>Spécialité</label>
              <select 
                value={filterSpecialite} 
                onChange={(e) => setFilterSpecialite(e.target.value)} 
                style={{
                  ...styles.filterSelect,
                  backgroundColor: 'var(--bg-input, #ffffff)',
                  borderColor: 'var(--border-color, #e2e8f0)',
                  color: 'var(--text-primary, #1e293b)',
                }}
              >
                <option value="">Toutes les spécialités</option>
                {getUniqueSpecialites().map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => { setFilterSpecialite(''); setSearchTerm(''); }} 
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

      {/* Tableau des professeurs */}
      <div style={{
        ...styles.tableContainer,
        backgroundColor: 'var(--bg-card, #ffffff)',
        borderColor: 'var(--border-color, #e2e8f0)',
        boxShadow: '0 1px 3px var(--shadow-color, rgba(0,0,0,0.05))',
      }}>
        <div style={{
          ...styles.tableHeader,
          backgroundColor: 'var(--bg-input, #f8fafc)',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
        }}>
          <span style={{
            ...styles.tableTitle,
            color: 'var(--text-primary, #1e293b)',
          }}>Liste des professeurs</span>
          <span style={{
            ...styles.tableCount,
            backgroundColor: 'var(--bg-card, #ffffff)',
            borderColor: 'var(--border-color, #e2e8f0)',
            color: 'var(--text-secondary, #64748b)',
          }}>{filteredProfs.length} professeur(s)</span>
        </div>
        
        {loading && filteredProfs.length === 0 ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner} />
            <p style={{ color: 'var(--text-secondary, #64748b)' }}>Chargement des professeurs...</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{
                  ...styles.th,
                  color: 'var(--text-secondary, #64748b)',
                  borderBottom: '1px solid var(--border-color, #e2e8f0)',
                  backgroundColor: 'var(--bg-input, #fafafa)',
                }}>Professeur</th>
                <th style={{
                  ...styles.th,
                  color: 'var(--text-secondary, #64748b)',
                  borderBottom: '1px solid var(--border-color, #e2e8f0)',
                  backgroundColor: 'var(--bg-input, #fafafa)',
                }}>Email</th>
                <th style={{
                  ...styles.th,
                  color: 'var(--text-secondary, #64748b)',
                  borderBottom: '1px solid var(--border-color, #e2e8f0)',
                  backgroundColor: 'var(--bg-input, #fafafa)',
                }}>Spécialité</th>
                <th style={{
                  ...styles.th,
                  color: 'var(--text-secondary, #64748b)',
                  borderBottom: '1px solid var(--border-color, #e2e8f0)',
                  backgroundColor: 'var(--bg-input, #fafafa)',
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfs.length === 0 ? (
                <tr>
                  <td colSpan="4" style={styles.emptyRow}>
                    <div style={styles.emptyState}>
                      <Users size={48} style={styles.emptyIcon} />
                      <p style={{
                        ...styles.emptyText,
                        color: 'var(--text-primary, #1e293b)',
                      }}>Aucun professeur trouvé</p>
                      <p style={{
                        ...styles.emptySubtext,
                        color: 'var(--text-muted, #94a3b8)',
                      }}>Ajoutez votre premier professeur en cliquant sur "Ajouter"</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProfs.map(p => (
                  <tr key={p.id} style={{
                    ...styles.tr,
                    borderBottom: '1px solid var(--border-color, #f1f5f9)',
                  }}>
                    <td style={{
                      ...styles.td,
                      color: 'var(--text-primary, #1e293b)',
                    }}>
                      <div style={styles.profNameContainer}>
                        <div style={styles.avatar}>
                          {p.name?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <span style={styles.profName}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{
                      ...styles.td,
                      color: 'var(--text-primary, #1e293b)',
                    }}>
                      <div style={styles.emailContainer}>
                        <Mail size={14} style={styles.emailIcon} />
                        <span>{p.email}</span>
                      </div>
                    </td>
                    <td style={{
                      ...styles.td,
                      color: 'var(--text-primary, #1e293b)',
                    }}>
                      {p.specialite ? (
                        <span style={{
                          ...styles.specialiteBadge,
                          backgroundColor: 'var(--bg-input, #eff6ff)',
                          color: '#2563eb',
                        }}>{p.specialite}</span>
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
                      <div style={styles.actionsContainer}>
                        <button 
                          onClick={() => handleEdit(p)} 
                          style={{
                            ...styles.editBtn,
                            backgroundColor: 'var(--bg-input, #eff6ff)',
                            color: '#2563eb',
                          }}
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(p.id, p.name)} 
                          style={{
                            ...styles.deleteBtn,
                            backgroundColor: 'var(--bg-input, #fef2f2)',
                            color: '#dc2626',
                          }}
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
                {editId ? '✏️ Modifier le professeur' : '➕ Ajouter un professeur'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{
                ...styles.modalClose,
                color: 'var(--text-muted, #94a3b8)',
              }}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Champ Nom */}
              <div style={styles.formGroup}>
                <label style={{
                  ...styles.formLabel,
                  color: 'var(--text-primary, #1e293b)',
                }}>
                  <User size={16} style={styles.formIcon} />
                  Nom complet <span style={styles.requiredStar}>*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: Jean Dupont" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  style={{
                    ...styles.input,
                    backgroundColor: 'var(--bg-input, #f8fafc)',
                    borderColor: errors.name ? '#ef4444' : 'var(--border-color, #e2e8f0)',
                    color: 'var(--text-primary, #1e293b)',
                  }} 
                />
                {errors.name && <div style={styles.fieldError}>{errors.name}</div>}
              </div>

              {/* Champ Email avec validation en temps réel */}
              <div style={styles.formGroup}>
                <label style={{
                  ...styles.formLabel,
                  color: 'var(--text-primary, #1e293b)',
                }}>
                  <Mail size={16} style={styles.formIcon} />
                  Email <span style={styles.requiredStar}>*</span>
                </label>
                <div style={styles.inputWrapper}>
                  <input 
                    type="email" 
                    placeholder="Ex: jean.dupont@eni.mg" 
                    value={form.email} 
                    onChange={handleEmailChange}
                    onBlur={() => setIsEmailTouched(true)}
                    style={{
                      ...styles.input,
                      backgroundColor: 'var(--bg-input, #f8fafc)',
                      borderColor: emailValid && isEmailTouched && form.email ? '#10b981' : 
                                  !emailValid && isEmailTouched && form.email ? '#ef4444' : 
                                  'var(--border-color, #e2e8f0)',
                      color: 'var(--text-primary, #1e293b)',
                    }} 
                  />
                  {isEmailTouched && form.email && (
                    <div style={styles.validationIcon}>
                      {emailValid ? (
                        <CheckCircleIcon size={18} color="#10b981" />
                      ) : (
                        <XCircle size={18} color="#ef4444" />
                      )}
                    </div>
                  )}
                </div>
                {errors.email && <div style={styles.fieldError}>{errors.email}</div>}
                
                {/* Barre de progression du pourcentage */}
                {isEmailTouched && form.email && (
                  <div style={styles.strengthContainer}>
                    <div style={{
                      ...styles.strengthBarBackground,
                      backgroundColor: 'var(--bg-input, #f1f5f9)',
                    }}>
                      <div 
                        style={{
                          ...styles.strengthBarFill,
                          width: `${emailStrength}%`,
                          backgroundColor: getStrengthColor(),
                          transition: 'width 0.3s ease-in-out, background-color 0.3s ease'
                        }}
                      />
                    </div>
                    <div style={styles.strengthInfo}>
                      <span style={{ 
                        fontSize: '12px', 
                        color: getStrengthColor(),
                        fontWeight: 600
                      }}>
                        {emailStrength}%
                      </span>
                      {validationMessage && (
                        <span style={{
                          fontSize: '12px',
                          color: validationMessage.color,
                          marginLeft: '8px',
                          fontWeight: 500
                        }}>
                          {validationMessage.text}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Champ Spécialité */}
              <div style={styles.formGroup}>
                <label style={{
                  ...styles.formLabel,
                  color: 'var(--text-primary, #1e293b)',
                }}>
                  <BookOpen size={16} style={styles.formIcon} />
                  Spécialité
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: Génie Logiciel" 
                  value={form.specialite} 
                  onChange={e => setForm({...form, specialite: e.target.value})} 
                  style={{
                    ...styles.input,
                    backgroundColor: 'var(--bg-input, #f8fafc)',
                    borderColor: 'var(--border-color, #e2e8f0)',
                    color: 'var(--text-primary, #1e293b)',
                  }} 
                />
              </div>

              {/* Champ Mot de passe (uniquement pour ajout) */}
              {!editId && (
                <div style={styles.formGroup}>
                  <label style={{
                    ...styles.formLabel,
                    color: 'var(--text-primary, #1e293b)',
                  }}>
                    <Lock size={16} style={styles.formIcon} />
                    Mot de passe <span style={styles.requiredStar}>*</span>
                  </label>
                  <input 
                    type="password" 
                    placeholder="Minimum 6 caractères" 
                    value={form.password} 
                    onChange={e => setForm({...form, password: e.target.value})} 
                    style={{
                      ...styles.input,
                      backgroundColor: 'var(--bg-input, #f8fafc)',
                      borderColor: errors.password ? '#ef4444' : 'var(--border-color, #e2e8f0)',
                      color: 'var(--text-primary, #1e293b)',
                    }} 
                  />
                  {errors.password && <div style={styles.fieldError}>{errors.password}</div>}
                </div>
              )}
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
                  '💾 Enregistrer'
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
                Êtes-vous sûr de vouloir supprimer le professeur <strong style={{ color: 'var(--text-primary, #1e293b)' }}>"{deleteName}"</strong> ?
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

  // Table
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
  tableTitle: {
    fontSize: '16px',
    fontWeight: 600,
  },
  tableCount: {
    fontSize: '13px',
    padding: '4px 12px',
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
  inputWrapper: {
    position: 'relative',
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
  validationIcon: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  strengthContainer: {
    marginTop: '8px',
  },
  strengthBarBackground: {
    width: '100%',
    height: '6px',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease-in-out',
    position: 'relative',
  },
  strengthInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '4px',
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
      
      .table-container {
        overflow-x: auto;
      }
      
      .table {
        min-width: 500px;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}