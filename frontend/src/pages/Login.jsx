// src/pages/Login.jsx - Version avec mode sombre/clair et améliorations
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  BookOpen, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, 
  CheckCircle, XCircle, Shield, User, Sparkles, 
  ArrowRight, Globe, School, GraduationCap,
  Calendar, Moon, Sun, Monitor
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailStrength, setEmailStrength] = useState(0);
  const [emailValid, setEmailValid] = useState(false);
  const [isEmailTouched, setIsEmailTouched] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const isDark = theme === 'dark';

  // Fonction pour valider l'email et calculer le pourcentage
  const validateAndCalculateStrength = (emailValue) => {
    let strength = 0;
    let valid = false;

    const hasAt = emailValue.includes('@');
    const hasDot = emailValue.includes('.');
    const hasDotAfterAt = hasAt && emailValue.indexOf('.') > emailValue.indexOf('@');
    const hasValidDomain = hasDotAfterAt && emailValue.split('.').pop().length >= 2;
    const hasValidLocal = hasAt && emailValue.split('@')[0].length >= 1;

    if (emailValue.length > 0) strength += 10;
    if (hasAt) strength += 25;
    if (hasDot) strength += 15;
    if (hasDotAfterAt) strength += 25;
    if (hasValidDomain) strength += 15;
    if (hasValidLocal) strength += 10;

    valid = hasAt && hasDot && hasDotAfterAt && hasValidDomain && hasValidLocal;

    return { strength: Math.min(strength, 100), valid };
  };

  // Fonction pour calculer la force du mot de passe
  const calculatePasswordStrength = (pwd) => {
    let strength = 0;
    
    if (pwd.length >= 6) strength += 20;
    if (pwd.length >= 10) strength += 20;
    if (/[a-z]/.test(pwd)) strength += 15;
    if (/[A-Z]/.test(pwd)) strength += 15;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 15;
    
    return Math.min(strength, 100);
  };

  // Mettre à jour la force de l'email à chaque changement
  useEffect(() => {
    if (email) {
      const result = validateAndCalculateStrength(email);
      setEmailStrength(result.strength);
      setEmailValid(result.valid);
    } else {
      setEmailStrength(0);
      setEmailValid(false);
    }
  }, [email]);

  // Mettre à jour la force du mot de passe
  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password));
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  // Gestion du verrouillage après plusieurs tentatives
  useEffect(() => {
    if (loginAttempts >= 5 && !isLocked) {
      setIsLocked(true);
      setLockTimer(60);
      const interval = setInterval(() => {
        setLockTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsLocked(false);
            setLoginAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [loginAttempts, isLocked]);

  // Fermer le menu thème au clic en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showThemeMenu && !e.target.closest('.theme-menu-container')) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showThemeMenu]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setIsEmailTouched(true);
    setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setIsPasswordTouched(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLocked) {
      setError(`Compte verrouillé. Réessayez dans ${lockTimer} secondes.`);
      return;
    }

    if (!emailValid) {
      setError('Veuillez saisir une adresse email valide (ex: nom@domaine.com)');
      return;
    }

    if (!password || password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      setLoginAttempts(0);

      if (loggedUser?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (loggedUser?.role === 'prof') {
        navigate('/prof/dashboard', { replace: true });
      } else {
        navigate('/emploi-du-temps-public', { replace: true });
      }
    } catch (err) {
      console.error('Erreur connexion:', err);
      setLoginAttempts(prev => prev + 1);
      const remainingAttempts = 5 - (loginAttempts + 1);
      
      if (remainingAttempts > 0) {
        setError(
          err.response?.data?.message || 
          `Email ou mot de passe incorrect. ${remainingAttempts} tentative(s) restante(s).`
        );
      } else {
        setError('Trop de tentatives. Compte verrouillé pour 60 secondes.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (strength) => {
    if (strength <= 30) return '#ef4444';
    if (strength <= 60) return '#f59e0b';
    if (strength <= 85) return '#3b82f6';
    return '#10b981';
  };

  const getStrengthLabel = (strength) => {
    if (strength <= 30) return 'Faible';
    if (strength <= 60) return 'Moyen';
    if (strength <= 85) return 'Fort';
    return 'Excellent';
  };

  const getValidationMessage = () => {
    if (!isEmailTouched) return '';
    if (emailValid) return { text: 'Email valide ✓', color: '#10b981' };
    if (email.length === 0) return { text: 'Veuillez saisir un email', color: '#94a3b8' };
    return { text: 'Format invalide: nom@domaine.com', color: '#ef4444' };
  };

  const validationMessage = getValidationMessage();

  const fillDemoEmail = () => {
    setEmail('admin@eni-fianarantsoa.mg');
    setIsEmailTouched(true);
  };

  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon size={18} />;
    if (theme === 'light') return <Sun size={18} />;
    return <Monitor size={18} />;
  };

  const getThemeLabel = () => {
    if (theme === 'dark') return 'Sombre';
    if (theme === 'light') return 'Clair';
    return 'Système';
  };

  const handleThemeChange = (newTheme) => {
    toggleTheme(newTheme);
    setShowThemeMenu(false);
  };

  return (
    <div style={{
      ...styles.container,
      background: isDark 
        ? 'linear-gradient(135deg, #020617 0%, #0f172a 30%, #1e1b4b 60%, #1e40af 100%)'
        : 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #1e40af 60%, #2563eb 100%)',
    }}>
      {/* Arrière-plan animé */}
      <div style={styles.backgroundDecoration}>
        <div style={{
          ...styles.circle1,
          background: isDark 
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        }} />
        <div style={{
          ...styles.circle2,
          background: isDark 
            ? 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 70%)',
        }} />
        <div style={{
          ...styles.circle3,
          background: isDark 
            ? 'radial-gradient(circle, rgba(37, 99, 235, 0.03) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%)',
        }} />
      </div>

      <div style={{
        ...styles.card,
        background: isDark 
          ? 'rgba(15, 23, 42, 0.95)'
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        boxShadow: isDark
          ? '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)'
          : '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
      }}>
        {/* Sélecteur de thème */}
        <div style={styles.themeSelectorContainer} className="theme-menu-container">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            style={{
              ...styles.themeToggleButton,
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
              color: isDark ? '#94a3b8' : '#64748b',
            }}
            aria-label="Changer le thème"
          >
            {getThemeIcon()}
            <span style={styles.themeToggleLabel}>{getThemeLabel()}</span>
          </button>
          
          {showThemeMenu && (
            <div style={{
              ...styles.themeMenu,
              background: isDark ? '#1e293b' : '#ffffff',
              border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
              boxShadow: isDark 
                ? '0 10px 40px rgba(0,0,0,0.5)'
                : '0 10px 40px rgba(0,0,0,0.15)',
            }}>
              <button
                onClick={() => handleThemeChange('light')}
                style={{
                  ...styles.themeMenuItem,
                  background: theme === 'light' ? (isDark ? '#334155' : '#eff6ff') : 'transparent',
                  color: theme === 'light' ? '#2563eb' : (isDark ? '#f1f5f9' : '#1e293b'),
                }}
              >
                <Sun size={16} />
                Clair
                {theme === 'light' && <CheckCircle size={14} style={styles.themeMenuCheck} />}
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                style={{
                  ...styles.themeMenuItem,
                  background: theme === 'dark' ? (isDark ? '#334155' : '#eff6ff') : 'transparent',
                  color: theme === 'dark' ? '#2563eb' : (isDark ? '#f1f5f9' : '#1e293b'),
                }}
              >
                <Moon size={16} />
                Sombre
                {theme === 'dark' && <CheckCircle size={14} style={styles.themeMenuCheck} />}
              </button>
              <button
                onClick={() => handleThemeChange('system')}
                style={{
                  ...styles.themeMenuItem,
                  background: theme === 'system' ? (isDark ? '#334155' : '#eff6ff') : 'transparent',
                  color: theme === 'system' ? '#2563eb' : (isDark ? '#f1f5f9' : '#1e293b'),
                  borderBottom: 'none',
                }}
              >
                <Monitor size={16} />
                Système
                {theme === 'system' && <CheckCircle size={14} style={styles.themeMenuCheck} />}
              </button>
            </div>
          )}
        </div>

        {/* Logo et en-tête */}
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <div style={styles.logoWrapper}>
              <BookOpen size={48} style={{
                ...styles.logoIcon,
                background: isDark ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
              }} />
              <span style={styles.logoBadge}>v3.0</span>
            </div>
          </div>
          <h1 style={{
            ...styles.title,
            color: isDark ? '#f1f5f9' : '#0f172a',
          }}>
            <span style={styles.titleHighlight}>ENI</span> Fianarantsoa
          </h1>
          <p style={{
            ...styles.subtitle,
            color: isDark ? '#94a3b8' : '#64748b',
          }}>
            <Sparkles size={14} style={styles.subtitleIcon} />
            Plateforme de gestion des emplois du temps
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          {error && (
            <div style={{
              ...styles.errorMessage,
              background: isDark ? '#450a0a' : '#fef2f2',
              border: isDark ? '1px solid #7f1d1d' : '1px solid #fecaca',
              color: isDark ? '#fca5a5' : '#ef4444',
            }}>
              <AlertCircle size={18} style={styles.errorIcon} />
              <span>{error}</span>
              {isLocked && lockTimer > 0 && (
                <span style={styles.lockTimer}>{lockTimer}s</span>
              )}
            </div>
          )}

          {/* Champ Email */}
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={{
              ...styles.label,
              color: isDark ? '#e2e8f0' : '#1e293b',
            }}>
              <Mail size={16} style={styles.labelIcon} />
              Adresse email
            </label>
            <div style={styles.inputWrapper}>
              <input
                id="email"
                type="email"
                placeholder="exemple@eni-fianarantsoa.mg"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => setIsEmailTouched(true)}
                style={{
                  ...styles.input,
                  borderColor: emailValid && isEmailTouched && email ? '#10b981' : 
                              !emailValid && isEmailTouched && email ? '#ef4444' : 
                              (isDark ? '#475569' : '#e2e8f0'),
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#f8fafc',
                  color: isDark ? '#f1f5f9' : '#1e293b',
                }}
                disabled={isLocked}
                required
              />
              {isEmailTouched && email && (
                <div style={styles.validationIcon}>
                  {emailValid ? (
                    <CheckCircle size={18} color="#10b981" />
                  ) : (
                    <XCircle size={18} color="#ef4444" />
                  )}
                </div>
              )}
              {!email && (
                <button
                  type="button"
                  onClick={fillDemoEmail}
                  style={{
                    ...styles.demoButton,
                    color: isDark ? '#64748b' : '#94a3b8',
                  }}
                  title="Remplir avec un email de démonstration"
                >
                  <User size={14} />
                </button>
              )}
            </div>
            
            {isEmailTouched && email && (
              <div style={styles.strengthContainer}>
                <div style={{
                  ...styles.strengthBarBackground,
                  backgroundColor: isDark ? '#334155' : '#f1f5f9',
                }}>
                  <div 
                    style={{
                      ...styles.strengthBarFill,
                      width: `${emailStrength}%`,
                      backgroundColor: getStrengthColor(emailStrength),
                      transition: 'width 0.4s ease-in-out, background-color 0.3s ease'
                    }}
                  />
                </div>
                <div style={styles.strengthInfo}>
                  <span style={{ 
                    fontSize: '11px', 
                    color: getStrengthColor(emailStrength),
                    fontWeight: 600,
                  }}>
                    {emailStrength}%
                  </span>
                  {validationMessage && (
                    <span style={{
                      fontSize: '11px',
                      color: validationMessage.color,
                      marginLeft: '8px',
                      fontWeight: 500,
                    }}>
                      {validationMessage.text}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Champ Mot de passe */}
          <div style={styles.inputGroup}>
            <label htmlFor="password" style={{
              ...styles.label,
              color: isDark ? '#e2e8f0' : '#1e293b',
            }}>
              <Lock size={16} style={styles.labelIcon} />
              Mot de passe
            </label>
            <div style={styles.inputWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => setIsPasswordTouched(true)}
                style={{
                  ...styles.input,
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#f8fafc',
                  color: isDark ? '#f1f5f9' : '#1e293b',
                  borderColor: isDark ? '#475569' : '#e2e8f0',
                }}
                disabled={isLocked}
                required
                minLength="6"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  ...styles.passwordToggle,
                  color: isDark ? '#64748b' : '#94a3b8',
                }}
                title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {isPasswordTouched && password && (
              <div style={styles.strengthContainer}>
                <div style={{
                  ...styles.strengthBarBackground,
                  backgroundColor: isDark ? '#334155' : '#f1f5f9',
                }}>
                  <div 
                    style={{
                      ...styles.strengthBarFill,
                      width: `${passwordStrength}%`,
                      backgroundColor: getStrengthColor(passwordStrength),
                      transition: 'width 0.4s ease-in-out, background-color 0.3s ease'
                    }}
                  />
                </div>
                <div style={styles.strengthInfo}>
                  <span style={{ 
                    fontSize: '11px', 
                    color: getStrengthColor(passwordStrength),
                    fontWeight: 600,
                  }}>
                    {getStrengthLabel(passwordStrength)}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    color: isDark ? '#64748b' : '#94a3b8',
                    fontWeight: 400,
                  }}>
                    {passwordStrength}%
                  </span>
                </div>
              </div>
            )}

            {password && password.length < 6 && (
              <div style={styles.passwordHint}>
                <AlertCircle size={14} color="#ef4444" />
                <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 500 }}>
                  Minimum 6 caractères requis
                </span>
              </div>
            )}
          </div>

          {/* Options supplémentaires */}
          <div style={styles.optionsRow}>
            <label style={{
              ...styles.rememberLabel,
              color: isDark ? '#94a3b8' : '#475569',
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={styles.rememberCheckbox}
              />
              <span style={styles.rememberText}>Se souvenir de moi</span>
            </label>
            <button type="button" style={{
              ...styles.forgotLink,
              color: isDark ? '#60a5fa' : '#2563eb',
            }}>
              Mot de passe oublié ?
            </button>
          </div>

          {/* Bouton de connexion */}
          <button
            type="submit"
            disabled={loading || isLocked || !emailValid}
            style={{
              ...styles.button,
              opacity: loading || isLocked ? 0.7 : (!emailValid && email) ? 0.5 : 1,
              cursor: loading || isLocked || (!emailValid && email) ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <>
                <div style={{
                  ...styles.spinner,
                  borderColor: 'white',
                  borderTopColor: 'transparent',
                }} />
                Connexion en cours...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Se connecter
                <ArrowRight size={16} style={styles.buttonArrow} />
              </>
            )}
          </button>

          {loginAttempts > 0 && !isLocked && (
            <div style={{
              ...styles.attemptsIndicator,
              background: isDark ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.05)',
              color: isDark ? '#94a3b8' : '#64748b',
            }}>
              <Shield size={14} />
              <span>
                Tentatives restantes : {5 - loginAttempts}
              </span>
            </div>
          )}
        </form>

        {/* Pied de page */}
        <div style={{
          ...styles.footer,
          borderTop: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
        }}>
          <div style={styles.footerLinks}>
            <Link to="/emploi-du-temps-public" style={{
              ...styles.publicLink,
              color: isDark ? '#60a5fa' : '#2563eb',
            }}>
              <Calendar size={14} />
              Voir l'emploi du temps public
            </Link>
            <span style={{
              ...styles.footerDivider,
              color: isDark ? '#334155' : '#e2e8f0',
            }}>|</span>
            <div style={{
              ...styles.schoolInfo,
              color: isDark ? '#64748b' : '#94a3b8',
            }}>
              <School size={12} />
              <span>ENI Fianarantsoa</span>
            </div>
          </div>
          <div style={{
            ...styles.footerVersion,
            color: isDark ? '#64748b' : '#94a3b8',
          }}>
            <Globe size={12} />
            <span>Version 3.0.1</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 30px) scale(1.1); }
        }

        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.3; }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        *:focus { 
          outline: 2px solid #2563eb; 
          outline-offset: 2px; 
        }
        
        input:focus { 
          border-color: #2563eb !important; 
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); 
          background-color: ${isDark ? '#1e293b' : 'white'} !important;
        }
        
        .password-toggle:hover {
          background-color: ${isDark ? '#334155' : '#f1f5f9'};
          color: ${isDark ? '#f1f5f9' : '#475569'};
        }
        
        .demo-button:hover {
          background-color: ${isDark ? '#334155' : '#f1f5f9'};
          color: ${isDark ? '#f1f5f9' : '#475569'};
        }
        
        .public-link:hover {
          background-color: ${isDark ? 'rgba(37, 99, 235, 0.15)' : '#eff6ff'};
          color: ${isDark ? '#93bbfc' : '#1d4ed8'};
          text-decoration: none;
          transform: translateY(-1px);
        }
        
        .forgot-link:hover {
          background-color: ${isDark ? 'rgba(37, 99, 235, 0.15)' : '#eff6ff'};
          color: ${isDark ? '#93bbfc' : '#1d4ed8'};
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
        }
        
        button:hover:not(:disabled) .button-arrow {
          transform: translateX(4px);
        }
        
        button:active:not(:disabled) {
          transform: translateY(0px);
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .remember-checkbox:checked {
          accent-color: #2563eb;
        }
        
        .theme-menu-item:hover {
          background-color: ${isDark ? '#334155' : '#f1f5f9'} !important;
        }
        
        @media (max-width: 480px) {
          .card {
            padding: 28px 20px 24px;
            border-radius: 20px;
          }
          
          .title {
            font-size: 22px;
          }

          .options-row {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }

          .footer-links {
            flex-direction: column;
            gap: 8px;
          }

          .footer-divider {
            display: none;
          }
          
          .theme-selector-container {
            top: 12px;
            right: 12px;
          }
          
          .theme-toggle-button {
            padding: 6px 10px;
            font-size: 11px;
          }
          
          .theme-toggle-label {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

// Styles avec charte graphique modernisée
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '"Inter", "Poppins", "Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
    position: 'relative',
    overflow: 'hidden',
    transition: 'background 0.5s ease',
  },
  backgroundDecoration: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  circle1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    animation: 'float 20s ease-in-out infinite',
    transition: 'background 0.5s ease',
  },
  circle2: {
    position: 'absolute',
    bottom: '-15%',
    left: '-10%',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    animation: 'float 25s ease-in-out infinite reverse',
    transition: 'background 0.5s ease',
  },
  circle3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    animation: 'pulse 15s ease-in-out infinite',
    transition: 'background 0.5s ease',
  },
  card: {
    borderRadius: '28px',
    padding: '44px 40px 32px',
    width: '100%',
    maxWidth: '460px',
    animation: 'fadeIn 0.6s ease-out',
    position: 'relative',
    zIndex: 1,
    transition: 'all 0.4s ease',
  },
  themeSelectorContainer: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    zIndex: 10,
  },
  themeToggleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500,
    transition: 'all 0.3s ease',
    fontFamily: '"Inter", sans-serif',
  },
  themeToggleLabel: {
    fontSize: '11px',
    fontWeight: 500,
  },
  themeMenu: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    borderRadius: '12px',
    padding: '6px',
    minWidth: '160px',
    animation: 'slideDown 0.2s ease-out',
    overflow: 'hidden',
  },
  themeMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '10px 14px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    fontFamily: '"Inter", sans-serif',
    borderBottom: '1px solid transparent',
  },
  themeMenuCheck: {
    marginLeft: 'auto',
    color: '#2563eb',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  logoWrapper: {
    position: 'relative',
    display: 'inline-flex',
  },
  logoIcon: {
    color: '#2563eb',
    padding: '12px',
    borderRadius: '16px',
    boxShadow: '0 8px 16px rgba(37, 99, 235, 0.15)',
    transition: 'background 0.3s ease',
  },
  logoBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-8px',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    color: 'white',
    fontSize: '8px',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '10px',
    letterSpacing: '0.5px',
  },
  title: {
    fontSize: '26px',
    fontWeight: 700,
    margin: '0 0 6px 0',
    fontFamily: '"Poppins", "Inter", sans-serif',
    transition: 'color 0.3s ease',
  },
  titleHighlight: {
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '14px',
    margin: 0,
    fontWeight: 400,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'color 0.3s ease',
  },
  subtitleIcon: {
    color: '#2563eb',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 500,
    animation: 'shake 0.4s ease-out',
  },
  errorIcon: {
    flexShrink: 0,
  },
  lockTimer: {
    marginLeft: 'auto',
    background: '#ef4444',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 700,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: '"Inter", "Poppins", sans-serif',
    transition: 'color 0.3s ease',
  },
  labelIcon: {
    color: '#2563eb',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: '"Inter", sans-serif',
    paddingRight: '48px',
  },
  validationIcon: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoButton: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passwordToggle: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  strengthContainer: {
    marginTop: '6px',
  },
  strengthBarBackground: {
    width: '100%',
    height: '4px',
    borderRadius: '4px',
    overflow: 'hidden',
    transition: 'background 0.3s ease',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: '4px',
    position: 'relative',
  },
  strengthInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '3px',
  },
  passwordHint: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '4px',
  },
  optionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px',
  },
  rememberLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'color 0.3s ease',
  },
  rememberCheckbox: {
    width: '16px',
    height: '16px',
    accentColor: '#2563eb',
    cursor: 'pointer',
  },
  rememberText: {
    userSelect: 'none',
  },
  forgotLink: {
    background: 'none',
    border: 'none',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    padding: '4px 8px',
    borderRadius: '8px',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '4px',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
    fontFamily: '"Inter", "Poppins", sans-serif',
    position: 'relative',
    overflow: 'hidden',
  },
  buttonArrow: {
    transition: 'transform 0.3s ease',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid white',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  attemptsIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '12px',
    padding: '6px',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
  },
  footer: {
    marginTop: '28px',
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'border-color 0.3s ease',
  },
  footerLinks: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  publicLink: {
    fontSize: '13px',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: 500,
    padding: '4px 12px',
    borderRadius: '40px',
  },
  footerDivider: {
    transition: 'color 0.3s ease',
  },
  schoolInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    fontWeight: 500,
    transition: 'color 0.3s ease',
  },
  footerVersion: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    justifyContent: 'center',
    transition: 'color 0.3s ease',
  },
};