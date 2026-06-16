// src/pagesAdmin/AdminParametre.jsx - Version avec charte graphique
import { useState, useEffect } from 'react';
import {
  Save, Bell, Lock, Palette, Globe, Moon, Sun, Monitor,
  Mail, Shield, User, Eye, EyeOff, CheckCircle, AlertCircle,
  Database, RefreshCw, Download, Upload, Trash2, X,
  Settings, LogOut, Clock, Wifi, Server, HardDrive
} from 'lucide-react';

export default function AdminParametre() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    dailyDigest: true,
    theme: 'light',
    compactMode: false,
    twoFactorAuth: false,
    sessionTimeout: 30,
    language: 'fr',
    autoSave: true,
    showTips: true
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

  // Charger les paramètres sauvegardés
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('adminSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    }
  };

  const saveSettingsToStorage = (newSettings) => {
    try {
      localStorage.setItem('adminSettings', JSON.stringify(newSettings));
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
    
    // Sauvegarde automatique si activée
    if (settings.autoSave) {
      saveSettingsToStorage(newSettings);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simuler un appel API
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

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;
    
    // Simuler changement de mot de passe
    console.log('Mot de passe changé');
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
    
    // Feedback de succès
    setSaved(true);
    setSaveMessage('Mot de passe changé avec succès !');
    setTimeout(() => {
      setSaved(false);
      setSaveMessage('');
    }, 3000);
  };

  const handleDataAction = (action) => {
    setShowConfirmModal(true);
    // Stocker l'action pour la confirmation
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
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `parametres_export_${new Date().toISOString().split('T')[0]}.json`;
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
      localStorage.removeItem('adminSettings');
      // Réinitialiser aux valeurs par défaut
      setSettings({
        emailNotifications: true,
        pushNotifications: false,
        dailyDigest: true,
        theme: 'light',
        compactMode: false,
        twoFactorAuth: false,
        sessionTimeout: 30,
        language: 'fr',
        autoSave: true,
        showTips: true
      });
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
    <div style={styles.container}>
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
        {/* Section Notifications */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Bell size={24} style={styles.sectionIcon} />
            <div>
              <h2 style={styles.sectionTitle}>Notifications</h2>
              <p style={styles.sectionDesc}>Gérez vos préférences de notification</p>
            </div>
          </div>

          <div style={styles.options}>
            <label style={styles.switchLabel}>
              <div>
                <div style={styles.labelTitle}>Notifications par email</div>
                <div style={styles.labelDesc}>Recevoir des alertes par email</div>
              </div>
              <div style={styles.switchContainer}>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange("emailNotifications", e.target.checked)}
                  style={styles.switch}
                />
                <span style={{
                  ...styles.switchSlider,
                  backgroundColor: settings.emailNotifications ? '#2563eb' : '#cbd5e1'
                }} />
              </div>
            </label>

            <label style={styles.switchLabel}>
              <div>
                <div style={styles.labelTitle}>Notifications push</div>
                <div style={styles.labelDesc}>Recevoir des notifications dans le navigateur</div>
              </div>
              <div style={styles.switchContainer}>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => handleChange("pushNotifications", e.target.checked)}
                  style={styles.switch}
                />
                <span style={{
                  ...styles.switchSlider,
                  backgroundColor: settings.pushNotifications ? '#2563eb' : '#cbd5e1'
                }} />
              </div>
            </label>

            <label style={styles.switchLabel}>
              <div>
                <div style={styles.labelTitle}>Résumé quotidien</div>
                <div style={styles.labelDesc}>Recevoir un résumé des activités du jour</div>
              </div>
              <div style={styles.switchContainer}>
                <input
                  type="checkbox"
                  checked={settings.dailyDigest}
                  onChange={(e) => handleChange("dailyDigest", e.target.checked)}
                  style={styles.switch}
                />
                <span style={{
                  ...styles.switchSlider,
                  backgroundColor: settings.dailyDigest ? '#2563eb' : '#cbd5e1'
                }} />
              </div>
            </label>
          </div>
        </div>

        {/* Section Apparence */}
        <div style={styles.section}>
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
                    backgroundColor: settings.theme === "light" ? '#2563eb' : '#f8fafc',
                    color: settings.theme === "light" ? 'white' : '#475569',
                    borderColor: settings.theme === "light" ? '#2563eb' : '#e2e8f0'
                  }}
                >
                  <Sun size={18} />
                  Clair
                </button>
                <button
                  onClick={() => handleChange("theme", "dark")}
                  style={{
                    ...styles.themeButton,
                    backgroundColor: settings.theme === "dark" ? '#2563eb' : '#f8fafc',
                    color: settings.theme === "dark" ? 'white' : '#475569',
                    borderColor: settings.theme === "dark" ? '#2563eb' : '#e2e8f0'
                  }}
                >
                  <Moon size={18} />
                  Sombre
                </button>
                <button
                  onClick={() => handleChange("theme", "system")}
                  style={{
                    ...styles.themeButton,
                    backgroundColor: settings.theme === "system" ? '#2563eb' : '#f8fafc',
                    color: settings.theme === "system" ? 'white' : '#475569',
                    borderColor: settings.theme === "system" ? '#2563eb' : '#e2e8f0'
                  }}
                >
                  <Monitor size={18} />
                  Système
                </button>
              </div>
            </div>

            <label style={styles.switchLabel}>
              <div>
                <div style={styles.labelTitle}>Mode compact</div>
                <div style={styles.labelDesc}>Réduire l'espacement pour plus de contenu</div>
              </div>
              <div style={styles.switchContainer}>
                <input
                  type="checkbox"
                  checked={settings.compactMode}
                  onChange={(e) => handleChange("compactMode", e.target.checked)}
                  style={styles.switch}
                />
                <span style={{
                  ...styles.switchSlider,
                  backgroundColor: settings.compactMode ? '#2563eb' : '#cbd5e1'
                }} />
              </div>
            </label>

            <div style={styles.optionGroup}>
              <div style={styles.labelTitle}>Langue</div>
              <select
                value={settings.language}
                onChange={(e) => handleChange("language", e.target.value)}
                style={styles.select}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section Sécurité */}
        <div style={styles.section}>
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
              style={styles.passwordButton}
            >
              <Lock size={18} />
              Changer le mot de passe
            </button>

            <label style={styles.switchLabel}>
              <div>
                <div style={styles.labelTitle}>Authentification à deux facteurs</div>
                <div style={styles.labelDesc}>Ajouter une couche de sécurité supplémentaire</div>
              </div>
              <div style={styles.switchContainer}>
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => handleChange("twoFactorAuth", e.target.checked)}
                  style={styles.switch}
                />
                <span style={{
                  ...styles.switchSlider,
                  backgroundColor: settings.twoFactorAuth ? '#2563eb' : '#cbd5e1'
                }} />
              </div>
            </label>

            <div style={styles.optionGroup}>
              <div style={styles.labelTitle}>Délai d'expiration de session</div>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => handleChange("sessionTimeout", parseInt(e.target.value))}
                style={styles.select}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 heure</option>
                <option value={120}>2 heures</option>
                <option value={240}>4 heures</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section Données */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Database size={24} style={styles.sectionIcon} />
            <div>
              <h2 style={styles.sectionTitle}>Données</h2>
              <p style={styles.sectionDesc}>Gérez vos données et sauvegardes</p>
            </div>
          </div>

          <div style={styles.options}>
            <div style={styles.buttonGroup}>
              <button onClick={() => handleDataAction('export')} style={styles.dataButton}>
                <Download size={16} />
                Exporter les données
              </button>
              <button onClick={() => handleDataAction('import')} style={styles.dataButton}>
                <Upload size={16} />
                Importer les données
              </button>
              <button onClick={() => handleDataAction('delete')} style={{...styles.dataButton, color: '#dc2626', borderColor: '#fecaca'}}>
                <Trash2 size={16} />
                Supprimer les données
              </button>
            </div>

            <label style={styles.switchLabel}>
              <div>
                <div style={styles.labelTitle}>Sauvegarde automatique</div>
                <div style={styles.labelDesc}>Sauvegarder automatiquement les modifications</div>
              </div>
              <div style={styles.switchContainer}>
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => handleChange("autoSave", e.target.checked)}
                  style={styles.switch}
                />
                <span style={{
                  ...styles.switchSlider,
                  backgroundColor: settings.autoSave ? '#2563eb' : '#cbd5e1'
                }} />
              </div>
            </label>

            <label style={styles.switchLabel}>
              <div>
                <div style={styles.labelTitle}>Afficher les astuces</div>
                <div style={styles.labelDesc}>Afficher des conseils d'utilisation</div>
              </div>
              <div style={styles.switchContainer}>
                <input
                  type="checkbox"
                  checked={settings.showTips}
                  onChange={(e) => handleChange("showTips", e.target.checked)}
                  style={styles.switch}
                />
                <span style={{
                  ...styles.switchSlider,
                  backgroundColor: settings.showTips ? '#2563eb' : '#cbd5e1'
                }} />
              </div>
            </label>
          </div>
        </div>

        {/* Section Système */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Server size={24} style={styles.sectionIcon} />
            <div>
              <h2 style={styles.sectionTitle}>Système</h2>
              <p style={styles.sectionDesc}>Informations sur le système</p>
            </div>
          </div>

          <div style={styles.systemInfo}>
            <div style={styles.systemItem}>
              <HardDrive size={16} style={styles.systemIcon} />
              <span style={styles.systemLabel}>Version:</span>
              <span style={styles.systemValue}>1.0.0</span>
            </div>
            <div style={styles.systemItem}>
              <Clock size={16} style={styles.systemIcon} />
              <span style={styles.systemLabel}>Dernière mise à jour:</span>
              <span style={styles.systemValue}>{new Date().toLocaleDateString('fr-FR')}</span>
            </div>
            <div style={styles.systemItem}>
              <Wifi size={16} style={styles.systemIcon} />
              <span style={styles.systemLabel}>Statut:</span>
              <span style={{...styles.systemValue, color: '#10b981'}}>Connecté</span>
            </div>
          </div>
        </div>

        {/* Bouton Sauvegarder */}
        <button onClick={handleSave} style={styles.saveButton} disabled={isLoading}>
          <Save size={20} />
          {isLoading ? 'Sauvegarde en cours...' : 'Sauvegarder tous les paramètres'}
        </button>
      </div>

      {/* Modal Changer mot de passe */}
      {showPasswordModal && (
        <div style={styles.modalOverlay} onClick={() => setShowPasswordModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
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
                        borderColor: passwordErrors.currentPassword ? '#ef4444' : '#e2e8f0'
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
                        borderColor: passwordErrors.newPassword ? '#ef4444' : '#e2e8f0'
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
                      borderColor: passwordErrors.confirmPassword ? '#ef4444' : '#e2e8f0'
                    }}
                    placeholder="Confirmez votre nouveau mot de passe"
                    required
                  />
                  {passwordErrors.confirmPassword && (
                    <div style={styles.fieldError}>{passwordErrors.confirmPassword}</div>
                  )}
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowPasswordModal(false)} style={styles.cancelButton}>
                  Annuler
                </button>
                <button type="submit" style={styles.confirmButton}>
                  Changer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation */}
      {showConfirmModal && (
        <div style={styles.modalOverlay} onClick={() => setShowConfirmModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>⚠️ Confirmation</h3>
              <button style={styles.modalClose} onClick={() => setShowConfirmModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <p style={styles.confirmText}>Êtes-vous sûr de vouloir effectuer cette action ?</p>
              <p style={styles.confirmSubtext}>Cette action est irréversible.</p>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowConfirmModal(false)} style={styles.cancelButton}>
                Annuler
              </button>
              <button onClick={confirmDataAction} style={{...styles.confirmButton, backgroundColor: '#dc2626'}}>
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
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
  },

  // Header
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
    color: '#1e293b',
    margin: 0,
    fontFamily: '"Poppins", "Inter", sans-serif',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '4px 0 0',
  },
  saveHeaderButton: {
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

  // Notifications
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

  // Content
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },

  // Section
  section: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
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
    color: '#2563eb',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
  },
  sectionDesc: {
    fontSize: '13px',
    color: '#64748b',
    margin: '2px 0 0 0',
  },

  // Options
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  // Switch
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
    color: '#1e293b',
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
    backgroundColor: '#cbd5e1',
    '&:before': {
      content: '""',
      position: 'absolute',
      height: '20px',
      width: '20px',
      left: '3px',
      bottom: '3px',
      backgroundColor: 'white',
      borderRadius: '50%',
      transition: '0.3s ease',
    }
  },

  // Theme
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
    backgroundColor: '#f8fafc',
    color: '#475569',
  },

  // Select
  select: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    marginTop: '8px',
    cursor: 'pointer',
    backgroundColor: 'white',
    color: '#1e293b',
    outline: 'none',
    transition: 'all 0.2s ease',
  },

  // Password
  passwordButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 20px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    color: '#475569',
    transition: 'all 0.2s ease',
    width: 'fit-content',
  },

  // Data buttons
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
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    color: '#475569',
    transition: 'all 0.2s ease',
  },

  // System info
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
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
  },
  systemIcon: {
    color: '#2563eb',
  },
  systemLabel: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: 500,
  },
  systemValue: {
    fontSize: '13px',
    color: '#1e293b',
    fontWeight: 500,
  },

  // Save button
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px 28px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
    marginTop: '8px',
  },

  // Modal
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
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '480px',
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
    fontSize: '18px',
    fontWeight: 600,
    color: '#1e293b',
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

  // Form
  formGroup: {
    marginBottom: '16px',
  },
  formLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#1e293b',
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
    backgroundColor: '#f8fafc',
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

  // Confirm
  confirmText: {
    fontSize: '16px',
    color: '#1e293b',
    margin: 0,
  },
  confirmSubtext: {
    fontSize: '14px',
    color: '#64748b',
    margin: '8px 0 0',
  },

  // Buttons
  cancelButton: {
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
  confirmButton: {
    padding: '10px 24px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  },
};

// Animations et styles globaux
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
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

    .save-header-button:hover:not(:disabled) {
      background-color: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(37, 99, 235, 0.3);
    }

    .save-button:hover:not(:disabled) {
      background-color: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(37, 99, 235, 0.3);
    }

    .theme-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .password-button:hover {
      background-color: #f1f5f9;
      transform: translateX(4px);
    }

    .data-button:hover {
      background-color: #f1f5f9;
      transform: translateY(-2px);
    }

    .cancel-button:hover {
      background-color: #f8fafc;
    }

    .confirm-button:hover:not(:disabled) {
      background-color: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    .modal-close:hover {
      background-color: #f1f5f9;
    }

    .password-toggle:hover {
      background-color: #f1f5f9;
    }

    .switch-label:hover {
      background-color: #f8fafc;
    }

    .input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      background-color: white;
    }

    .select:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .system-item:hover {
      background-color: #f1f5f9;
      transition: background 0.2s ease;
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