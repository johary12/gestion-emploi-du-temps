// src/pagesProf/ProfParametre.jsx
import { useState, useEffect } from 'react';
import {
  Save, Lock, Palette, Sun, Moon,
  User, Eye, EyeOff, CheckCircle, AlertCircle,
  Database, Download, Upload, Trash2, X,
  Clock, Wifi, Server, HardDrive
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ProfParametre() {
  const { user, changePassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [settings, setSettings] = useState({
    theme: theme || 'light',
    autoSave: true
  });

  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings.theme !== theme) {
      toggleTheme(settings.theme);
    }
  }, [settings.theme]);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('profSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ 
          ...prev, 
          ...parsed,
          theme: theme || parsed.theme || 'light'
        }));
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    }
  };

  const saveSettingsToStorage = (newSettings) => {
    try {
      localStorage.setItem('profSettings', JSON.stringify(newSettings));
      return true;
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
      return false;
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Mot de passe actuel requis';
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'Nouveau mot de passe requis';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Minimum 6 caractères';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setSaved(false);
    setSaveError(false);
    
    if (key === 'theme') {
      toggleTheme(value);
    }
    
    if (settings.autoSave) {
      saveSettingsToStorage(newSettings);
      setSaved(true);
      setSaveMessage('Paramètres sauvegardés automatiquement');
      setTimeout(() => {
        setSaved(false);
        setSaveMessage('');
      }, 2000);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const success = saveSettingsToStorage(settings);
      if (success) {
        setSaved(true);
        setSaveMessage('Paramètres sauvegardés avec succès !');
        setTimeout(() => {
          setSaved(false);
          setSaveMessage('');
        }, 3000);
      } else {
        throw new Error('Erreur de sauvegarde');
      }
    } catch (error) {
      setSaveError(true);
      setSaveMessage('Erreur lors de la sauvegarde des paramètres');
      setTimeout(() => {
        setSaveError(false);
        setSaveMessage('');
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;
    
    setPasswordLoading(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors({});
      
      setSaved(true);
      setSaveMessage('Mot de passe changé avec succès !');
      setTimeout(() => {
        setSaved(false);
        setSaveMessage('');
      }, 3000);
    } catch (error) {
      setPasswordErrors({ 
        currentPassword: error.response?.data?.message || 'Mot de passe actuel incorrect' 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDataAction = (action) => {
    setShowConfirmModal(true);
    window.pendingAction = action;
  };

  const confirmDataAction = () => {
    const action = window.pendingAction;
    setShowConfirmModal(false);
    
    switch(action) {
      case 'export':
        exportData();
        break;
      case 'import':
        importData();
        break;
      case 'delete':
        deleteData();
        break;
      default:
        break;
    }
  };

  const exportData = () => {
    try {
      const data = {
        settings: settings,
        user: { name: user?.name, email: user?.email },
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `parametres_prof_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSaved(true);
      setSaveMessage('Données exportées avec succès !');
      setTimeout(() => {
        setSaved(false);
        setSaveMessage('');
      }, 3000);
    } catch (error) {
      setSaveError(true);
      setSaveMessage('Erreur lors de l\'export');
      setTimeout(() => {
        setSaveError(false);
        setSaveMessage('');
      }, 3000);
    }
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.settings) {
            setSettings(data.settings);
            saveSettingsToStorage(data.settings);
            if (data.settings.theme) {
              toggleTheme(data.settings.theme);
            }
            setSaved(true);
            setSaveMessage('Données importées avec succès !');
            setTimeout(() => {
              setSaved(false);
              setSaveMessage('');
            }, 3000);
          }
        } catch (error) {
          setSaveError(true);
          setSaveMessage('Erreur lors de l\'import');
          setTimeout(() => {
            setSaveError(false);
            setSaveMessage('');
          }, 3000);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const deleteData = () => {
    try {
      localStorage.removeItem('profSettings');
      const defaultSettings = {
        theme: 'light',
        autoSave: true
      };
      setSettings(defaultSettings);
      saveSettingsToStorage(defaultSettings);
      toggleTheme('light');
      
      setSaved(true);
      setSaveMessage('Données supprimées avec succès !');
      setTimeout(() => {
        setSaved(false);
        setSaveMessage('');
      }, 3000);
    } catch (error) {
      setSaveError(true);
      setSaveMessage('Erreur lors de la suppression');
      setTimeout(() => {
        setSaveError(false);
        setSaveMessage('');
      }, 3000);
    }
  };

  return (
    <div style={{
      ...styles.container,
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
      color: isDark ? '#f1f5f9' : '#1e293b',
    }}>
      {/* En-tête */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>⚙️ Paramètres</h1>
          <p style={styles.pageSubtitle}>Gérez vos préférences et configurations</p>
        </div>
        <button onClick={handleSave} style={styles.saveHeaderButton} disabled={isLoading}>
          <Save size={18} />
          {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      {/* Feedback: Notification de sauvegarde */}
      {saved && (
        <div style={styles.successNotification}>
          <CheckCircle size={20} />
          <span>{saveMessage}</span>
        </div>
      )}
      {saveError && (
        <div style={styles.errorNotification}>
          <AlertCircle size={20} />
          <span>{saveMessage}</span>
        </div>
      )}

      <div style={styles.content}>
        {/* Section Apparence */}
        <div style={{
          ...styles.section,
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e2e8f0',
          boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={styles.sectionHeader}>
            <Palette size={24} style={styles.sectionIcon} />
            <div>
              <h2 style={styles.sectionTitle}>Apparence</h2>
              <p style={styles.sectionDesc}>Personnalisez l'apparence de l'application</p>
            </div>
          </div>

          <div style={styles.options}>
            <div style={styles.optionGroup}>
              <div style={styles.labelTitle}>Thème</div>
              <div style={styles.themeButtons}>
                <button
                  onClick={() => handleChange("theme", "light")}
                  style={{
                    ...styles.themeButton,
                    backgroundColor: settings.theme === "light" ? '#059669' : (isDark ? '#1e293b' : '#f8fafc'),
                    color: settings.theme === "light" ? 'white' : (isDark ? '#94a3b8' : '#475569'),
                    borderColor: settings.theme === "light" ? '#059669' : (isDark ? '#334155' : '#e2e8f0')
                  }}
                >
                  <Sun size={18} />
                  Clair
                </button>
                <button
                  onClick={() => handleChange("theme", "dark")}
                  style={{
                    ...styles.themeButton,
                    backgroundColor: settings.theme === "dark" ? '#059669' : (isDark ? '#1e293b' : '#f8fafc'),
                    color: settings.theme === "dark" ? 'white' : (isDark ? '#94a3b8' : '#475569'),
                    borderColor: settings.theme === "dark" ? '#059669' : (isDark ? '#334155' : '#e2e8f0')
                  }}
                >
                  <Moon size={18} />
                  Sombre
                </button>
              </div>
            </div>

            <label style={styles.switchLabel}>
              <div>
                <div style={styles.labelTitle}>Sauvegarde automatique</div>
                <div style={styles.labelDesc}>Sauvegarder automatiquement vos paramètres</div>
              </div>
              <div style={styles.switchContainer}>
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => handleChange("autoSave", e.target.checked)}
                  style={styles.switch}
                />
                <div style={{
                  ...styles.switchSlider,
                  backgroundColor: settings.autoSave ? '#059669' : (isDark ? '#475569' : '#cbd5e1')
                }}>
                  <div style={{
                    ...styles.switchCircle,
                    transform: settings.autoSave ? 'translateX(22px)' : 'translateX(2px)',
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  }} />
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Section Sécurité */}
        <div style={{
          ...styles.section,
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e2e8f0',
          boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={styles.sectionHeader}>
            <Lock size={24} style={styles.sectionIcon} />
            <div>
              <h2 style={styles.sectionTitle}>Sécurité</h2>
              <p style={styles.sectionDesc}>Protégez votre compte</p>
            </div>
          </div>

          <div style={styles.options}>
            <button
              onClick={() => setShowPasswordModal(true)}
              style={{
                ...styles.passwordButton,
                backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                color: isDark ? '#f1f5f9' : '#475569',
              }}
            >
              <Lock size={18} />
              Changer le mot de passe
            </button>
          </div>
        </div>

        {/* Section Données */}
        <div style={{
          ...styles.section,
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e2e8f0',
          boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={styles.sectionHeader}>
            <Database size={24} style={styles.sectionIcon} />
            <div>
              <h2 style={styles.sectionTitle}>Données</h2>
              <p style={styles.sectionDesc}>Gérez vos données</p>
            </div>
          </div>

          <div style={styles.options}>
            <div style={styles.buttonGroup}>
              <button 
                onClick={() => handleDataAction('export')} 
                style={{
                  ...styles.dataButton,
                  backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                  color: isDark ? '#f1f5f9' : '#475569',
                }}
              >
                <Download size={16} />
                Exporter les données
              </button>
              <button 
                onClick={() => handleDataAction('import')} 
                style={{
                  ...styles.dataButton,
                  backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                  color: isDark ? '#f1f5f9' : '#475569',
                }}
              >
                <Upload size={16} />
                Importer les données
              </button>
              <button 
                onClick={() => handleDataAction('delete')} 
                style={{
                  ...styles.dataButton,
                  backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                  color: '#dc2626',
                }}
              >
                <Trash2 size={16} />
                Supprimer les données
              </button>
            </div>
          </div>
        </div>

        {/* Section Système */}
        <div style={{
          ...styles.section,
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e2e8f0',
          boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={styles.sectionHeader}>
            <Server size={24} style={styles.sectionIcon} />
            <div>
              <h2 style={styles.sectionTitle}>Système</h2>
              <p style={styles.sectionDesc}>Informations sur le système</p>
            </div>
          </div>

          <div style={styles.systemInfo}>
            <div style={{
              ...styles.systemItem,
              backgroundColor: isDark ? '#0f172a' : '#f8fafc',
            }}>
              <HardDrive size={16} style={styles.systemIcon} />
              <span style={styles.systemLabel}>Version:</span>
              <span style={styles.systemValue}>1.0.0</span>
            </div>
            <div style={{
              ...styles.systemItem,
              backgroundColor: isDark ? '#0f172a' : '#f8fafc',
            }}>
              <Clock size={16} style={styles.systemIcon} />
              <span style={styles.systemLabel}>Dernière mise à jour:</span>
              <span style={styles.systemValue}>{new Date().toLocaleDateString('fr-FR')}</span>
            </div>
            <div style={{
              ...styles.systemItem,
              backgroundColor: isDark ? '#0f172a' : '#f8fafc',
            }}>
              <Wifi size={16} style={styles.systemIcon} />
              <span style={styles.systemLabel}>Statut:</span>
              <span style={{...styles.systemValue, color: '#10b981'}}>Connecté</span>
            </div>
            <div style={{
              ...styles.systemItem,
              backgroundColor: isDark ? '#0f172a' : '#f8fafc',
            }}>
              <User size={16} style={styles.systemIcon} />
              <span style={styles.systemLabel}>Utilisateur:</span>
              <span style={styles.systemValue}>{user?.name || user?.nom || 'Professeur'}</span>
            </div>
          </div>
        </div>

        {/* Bouton Sauvegarder */}
        <button 
          onClick={handleSave} 
          style={{
            ...styles.saveButton,
            backgroundColor: '#059669',
            color: 'white',
            boxShadow: '0 4px 6px rgba(5, 150, 105, 0.2)',
          }}
          disabled={isLoading}
        >
          <Save size={20} />
          {isLoading ? 'Sauvegarde en cours...' : 'Sauvegarder tous les paramètres'}
        </button>
      </div>

      {/* Modal Changer mot de passe */}
      {showPasswordModal && (
        <div style={styles.modalOverlay} onClick={() => setShowPasswordModal(false)}>
          <div style={{
            ...styles.modalContent,
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            boxShadow: `0 20px 60px ${isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0, 0, 0, 0.2)'}`,
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              ...styles.modalHeader,
              borderColor: isDark ? '#334155' : '#e2e8f0',
            }}>
              <h3 style={styles.modalTitle}>🔒 Changer le mot de passe</h3>
              <button style={styles.modalClose} onClick={() => setShowPasswordModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handlePasswordChange}>
              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Mot de passe actuel</label>
                  <div style={styles.passwordInputWrapper}>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      style={{
                        ...styles.input,
                        borderColor: passwordErrors.currentPassword ? '#ef4444' : (isDark ? '#475569' : '#e2e8f0'),
                        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                        color: isDark ? '#f1f5f9' : '#1e293b',
                      }}
                      placeholder="Entrez votre mot de passe actuel"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={styles.passwordToggle}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <div style={styles.fieldError}>{passwordErrors.currentPassword}</div>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Nouveau mot de passe</label>
                  <div style={styles.passwordInputWrapper}>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      style={{
                        ...styles.input,
                        borderColor: passwordErrors.newPassword ? '#ef4444' : (isDark ? '#475569' : '#e2e8f0'),
                        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                        color: isDark ? '#f1f5f9' : '#1e293b',
                      }}
                      placeholder="Minimum 6 caractères"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={styles.passwordToggle}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <div style={styles.fieldError}>{passwordErrors.newPassword}</div>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Confirmer le nouveau mot de passe</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    style={{
                      ...styles.input,
                      borderColor: passwordErrors.confirmPassword ? '#ef4444' : (isDark ? '#475569' : '#e2e8f0'),
                      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                      color: isDark ? '#f1f5f9' : '#1e293b',
                    }}
                    placeholder="Confirmez votre nouveau mot de passe"
                    required
                  />
                  {passwordErrors.confirmPassword && (
                    <div style={styles.fieldError}>{passwordErrors.confirmPassword}</div>
                  )}
                </div>
              </div>

              <div style={{
                ...styles.modalFooter,
                borderColor: isDark ? '#334155' : '#e2e8f0',
              }}>
                <button type="button" onClick={() => setShowPasswordModal(false)} style={{
                  ...styles.cancelButton,
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  borderColor: isDark ? '#475569' : '#e2e8f0',
                  color: isDark ? '#f1f5f9' : '#475569',
                }}>
                  Annuler
                </button>
                <button type="submit" style={{
                  ...styles.confirmButton,
                  backgroundColor: '#059669',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
                }} disabled={passwordLoading}>
                  {passwordLoading ? 'Changement...' : 'Changer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation */}
      {showConfirmModal && (
        <div style={styles.modalOverlay} onClick={() => setShowConfirmModal(false)}>
          <div style={{
            ...styles.modalContent,
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            boxShadow: `0 20px 60px ${isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0, 0, 0, 0.2)'}`,
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              ...styles.modalHeader,
              borderColor: isDark ? '#334155' : '#e2e8f0',
            }}>
              <h3 style={styles.modalTitle}>⚠️ Confirmation</h3>
              <button style={styles.modalClose} onClick={() => setShowConfirmModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <p style={styles.confirmText}>Êtes-vous sûr de vouloir effectuer cette action ?</p>
              <p style={styles.confirmSubtext}>Cette action est irréversible.</p>
            </div>
            <div style={{
              ...styles.modalFooter,
              borderColor: isDark ? '#334155' : '#e2e8f0',
            }}>
              <button onClick={() => setShowConfirmModal(false)} style={{
                ...styles.cancelButton,
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderColor: isDark ? '#475569' : '#e2e8f0',
                color: isDark ? '#f1f5f9' : '#475569',
              }}>
                Annuler
              </button>
              <button onClick={confirmDataAction} style={{
                ...styles.confirmButton,
                backgroundColor: '#dc2626',
                color: 'white',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
              }}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px 32px',
    maxWidth: '900px',
    margin: '0 auto',
    fontFamily: '"Inter", "Poppins", "Roboto", -apple-system, sans-serif',
    minHeight: '100vh',
    transition: 'all 0.3s ease',
  },

  header: {
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
    color: '#64748b',
  },
  saveHeaderButton: {
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

  successNotification: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    backgroundColor: '#10b981',
    color: 'white',
    borderRadius: '12px',
    marginBottom: '20px',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    animation: 'slideDown 0.3s ease-out',
  },
  errorNotification: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '12px',
    marginBottom: '20px',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
    animation: 'slideDown 0.3s ease-out',
  },

  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },

  section: {
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '2px solid #f1f5f9',
  },
  sectionIcon: {
    color: '#059669',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    margin: 0,
  },
  sectionDesc: {
    fontSize: '13px',
    color: '#64748b',
    margin: '2px 0 0 0',
  },

  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  switchLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    padding: '8px 0',
    borderRadius: '8px',
    transition: 'background 0.2s ease',
  },
  labelTitle: {
    fontWeight: 500,
    fontSize: '14px',
  },
  labelDesc: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },
  switchContainer: {
    position: 'relative',
    width: '48px',
    height: '26px',
    flexShrink: 0,
  },
  switch: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
    zIndex: 2,
  },
  switchSlider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '26px',
    transition: '0.3s ease',
  },
  switchCircle: {
    position: 'absolute',
    top: '2px',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    transition: '0.3s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },

  optionGroup: {
    padding: '4px 0',
  },
  themeButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
    flexWrap: 'wrap',
  },
  themeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: 500,
    fontSize: '14px',
  },

  passwordButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 20px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    width: 'fit-content',
  },

  buttonGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  dataButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },

  systemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  systemItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  systemIcon: {
    color: '#059669',
  },
  systemLabel: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: 500,
  },
  systemValue: {
    fontSize: '13px',
    fontWeight: 500,
  },

  saveButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px 28px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '8px',
  },

  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px',
  },
  modalContent: {
    borderRadius: '16px',
    width: '100%',
    maxWidth: '480px',
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
  modalTitle: {
    fontSize: '18px',
    fontWeight: 600,
    margin: 0,
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

  formGroup: {
    marginBottom: '16px',
  },
  formLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '6px',
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
  passwordInputWrapper: {
    position: 'relative',
  },
  passwordToggle: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '4px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  fieldError: {
    fontSize: '12px',
    color: '#ef4444',
    marginTop: '4px',
  },

  confirmText: {
    fontSize: '16px',
    margin: 0,
  },
  confirmSubtext: {
    fontSize: '14px',
    color: '#64748b',
    margin: '8px 0 0',
  },

  cancelButton: {
    padding: '10px 24px',
    border: '1px solid #e2e8f0',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  confirmButton: {
    padding: '10px 24px',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  },
};

// Animations
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95) translateY(-10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .save-header-button:hover:not(:disabled) {
      background-color: #047857;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(5, 150, 105, 0.3);
    }

    .save-button:hover:not(:disabled) {
      background-color: #047857;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(5, 150, 105, 0.3);
    }

    .theme-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .password-button:hover {
      background-color: var(--hover-bg, #f1f5f9);
      transform: translateX(4px);
    }

    .data-button:hover {
      background-color: var(--hover-bg, #f1f5f9);
      transform: translateY(-2px);
    }

    .cancel-button:hover {
      background-color: var(--hover-bg, #f8fafc);
    }

    .confirm-button:hover:not(:disabled) {
      background-color: #047857;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
    }

    .modal-close:hover {
      background-color: var(--hover-bg, #f1f5f9);
    }

    .password-toggle:hover {
      background-color: var(--hover-bg, #f1f5f9);
    }

    .input:focus {
      border-color: #059669;
      box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
    }

    .system-item:hover {
      background-color: var(--hover-bg, #f1f5f9);
      transition: background 0.2s ease;
    }

    .switch-label:hover .switch-circle {
      transform: scale(1.1);
    }

    .switch:focus + .switch-slider {
      box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.3);
    }

    @media (max-width: 768px) {
      .container {
        padding: 16px;
      }
      
      .header {
        flex-direction: column;
        align-items: stretch;
      }
      
      .theme-buttons {
        flex-direction: column;
      }
      
      .button-group {
        flex-direction: column;
      }
      
      .password-button {
        width: 100%;
        justify-content: center;
      }
      
      .data-button {
        width: 100%;
        justify-content: center;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}