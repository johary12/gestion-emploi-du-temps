// src/pagesAdmin/AdminParametre.jsx
import { useState, useEffect } from 'react';
import {
  Save, Bell, Lock, Palette, Globe, Moon, Sun, Monitor,
  Mail, Shield, User, Eye, EyeOff, CheckCircle, AlertCircle,
  Database, RefreshCw, Download, Upload, Trash2
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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  // Validation en temps réel
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
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
    setSaveError(false);
  };

  const handleSave = async () => {
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Paramètres sauvegardés:', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      setSaveError(true);
      setTimeout(() => setSaveError(false), 3000);
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
    // Feedback de succès
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={styles.container}>
      {/* En-tête avec guidage */}
      <div style={styles.header}>
        <h1 style={styles.title}>⚙️ Paramètres</h1>
        <p style={styles.subtitle}>Gérez vos préférences et configurations</p>
      </div>

      {/* Feedback: Notification de sauvegarde */}
      {saved && (
        <div style={styles.successNotification}>
          <CheckCircle size={20} />
          <span>Paramètres sauvegardés avec succès !</span>
        </div>
      )}
      {saveError && (
        <div style={styles.errorNotification}>
          <AlertCircle size={20} />
          <span>Erreur lors de la sauvegarde</span>
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
                <span style={styles.switchSlider} />
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
                <span style={styles.switchSlider} />
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
                    background: settings.theme === "light" ? "#667eea" : "#f1f5f9",
                    color: settings.theme === "light" ? "white" : "#475569"
                  }}
                >
                  <Sun size={18} />
                  Clair
                </button>
                <button
                  onClick={() => handleChange("theme", "dark")}
                  style={{
                    ...styles.themeButton,
                    background: settings.theme === "dark" ? "#667eea" : "#f1f5f9",
                    color: settings.theme === "dark" ? "white" : "#475569"
                  }}
                >
                  <Moon size={18} />
                  Sombre
                </button>
                <button
                  onClick={() => handleChange("theme", "system")}
                  style={{
                    ...styles.themeButton,
                    background: settings.theme === "system" ? "#667eea" : "#f1f5f9",
                    color: settings.theme === "system" ? "white" : "#475569"
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
                <span style={styles.switchSlider} />
              </div>
            </label>
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
                <span style={styles.switchSlider} />
              </div>
            </label>

            <div style={styles.selectGroup}>
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
              <button style={styles.dataButton}>
                <Download size={16} />
                Exporter les données
              </button>
              <button style={styles.dataButton}>
                <Upload size={16} />
                Importer les données
              </button>
              <button style={{...styles.dataButton, color: '#ef4444'}}>
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
                <span style={styles.switchSlider} />
              </div>
            </label>
          </div>
        </div>

        {/* Bouton Sauvegarder avec feedback */}
        <button onClick={handleSave} style={styles.saveButton}>
          <Save size={20} />
          Sauvegarder les paramètres
        </button>
      </div>

      {/* Modal Changer mot de passe */}
      {showPasswordModal && (
        <div style={styles.modalOverlay} onClick={() => setShowPasswordModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Changer le mot de passe</h3>
              <button style={styles.modalClose} onClick={() => setShowPasswordModal(false)}>×</button>
            </div>
            
            <form onSubmit={handlePasswordChange}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Mot de passe actuel</label>
                <div style={styles.passwordInputWrapper}>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    style={{
                      ...styles.passwordInput,
                      borderColor: passwordErrors.currentPassword ? '#ef4444' : '#e2e8f0'
                    }}
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

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Nouveau mot de passe</label>
                <div style={styles.passwordInputWrapper}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    style={{
                      ...styles.passwordInput,
                      borderColor: passwordErrors.newPassword ? '#ef4444' : '#e2e8f0'
                    }}
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

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  style={{
                    ...styles.input,
                    borderColor: passwordErrors.confirmPassword ? '#ef4444' : '#e2e8f0'
                  }}
                  required
                />
                {passwordErrors.confirmPassword && (
                  <div style={styles.fieldError}>{passwordErrors.confirmPassword}</div>
                )}
              </div>

              <div style={styles.modalButtons}>
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
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px 32px'
  },
  header: {
    marginBottom: '30px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },
  successNotification: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: '#10b981',
    color: 'white',
    borderRadius: '8px',
    marginBottom: '20px',
    animation: 'slideDown 0.3s ease-out'
  },
  errorNotification: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: '#ef4444',
    color: 'white',
    borderRadius: '8px',
    marginBottom: '20px',
    animation: 'slideDown 0.3s ease-out'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  section: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '2px solid #f1f5f9'
  },
  sectionIcon: {
    color: '#667eea'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },
  sectionDesc: {
    fontSize: '13px',
    color: '#64748b',
    margin: '4px 0 0 0'
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  switchLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    padding: '8px 0'
  },
  labelTitle: {
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: '4px'
  },
  labelDesc: {
    fontSize: '12px',
    color: '#64748b'
  },
  switchContainer: {
    position: 'relative',
    width: '50px',
    height: '24px'
  },
  switch: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
    zIndex: 2
  },
  switchSlider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: '#cbd5e1',
    borderRadius: '24px',
    transition: '0.2s'
  },
  optionGroup: {
    padding: '8px 0'
  },
  themeButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px'
  },
  themeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: '0.2s',
    fontWeight: '500'
  },
  selectGroup: {
    padding: '8px 0'
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    marginTop: '8px',
    cursor: 'pointer'
  },
  passwordButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#475569',
    width: 'fit-content'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  dataButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#475569'
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: '0.2s',
    marginTop: '8px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000
  },
  modalContent: {
    background: 'white',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '450px',
    overflow: 'hidden'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0'
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#64748b'
  },
  inputGroup: {
    padding: '16px 24px',
    borderBottom: '1px solid #e2e8f0'
  },
  inputLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#475569',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  passwordInputWrapper: {
    position: 'relative'
  },
  passwordInput: {
    width: '100%',
    padding: '10px 40px 10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  passwordToggle: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b'
  },
  fieldError: {
    fontSize: '12px',
    color: '#ef4444',
    marginTop: '4px'
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    padding: '16px 24px'
  },
  cancelButton: {
    padding: '8px 16px',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  confirmButton: {
    padding: '8px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  }
};