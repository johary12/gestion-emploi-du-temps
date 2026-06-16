// src/pages/Login.jsx - Version avec charte graphique
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailStrength, setEmailStrength] = useState(0);
  const [emailValid, setEmailValid] = useState(false);
  const [isEmailTouched, setIsEmailTouched] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Fonction pour valider l'email et calculer le pourcentage
  const validateAndCalculateStrength = (emailValue) => {
    let strength = 0;
    let valid = false;

    // Vérifier la présence de @
    const hasAt = emailValue.includes('@');
    // Vérifier la présence de .
    const hasDot = emailValue.includes('.');
    // Vérifier que le . est après le @
    const hasDotAfterAt = hasAt && emailValue.indexOf('.') > emailValue.indexOf('@');
    // Vérifier qu'il y a au moins 2 caractères après le .
    const hasValidDomain = hasDotAfterAt && emailValue.split('.').pop().length >= 2;
    // Vérifier qu'il y a au moins 1 caractère avant le @
    const hasValidLocal = hasAt && emailValue.split('@')[0].length >= 1;

    // Calcul du pourcentage
    if (emailValue.length > 0) {
      strength += 10; // Base pour avoir commencé à taper
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

    // L'email est valide si toutes les conditions sont remplies
    valid = hasAt && hasDot && hasDotAfterAt && hasValidDomain && hasValidLocal;

    return { strength: Math.min(strength, 100), valid };
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

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setIsEmailTouched(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation avant soumission
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

      console.log('loggedUser complet:', loggedUser);
      console.log('loggedUser.role:', loggedUser?.role);

      if (loggedUser?.role === 'admin') {
        console.log('→ navigate admin');
        navigate('/admin/dashboard', { replace: true });
      } else if (loggedUser?.role === 'prof') {
        console.log('→ navigate prof');
        navigate('/prof/dashboard', { replace: true });
      } else {
        console.log('→ navigate public, role reçu:', loggedUser?.role);
        navigate('/emploi-du-temps-public', { replace: true });
      }
    } catch (err) {
      console.error('Erreur connexion:', err);
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  // Couleur de la barre de progression selon charte graphique
  const getStrengthColor = () => {
    if (emailStrength <= 30) return '#ef4444';
    if (emailStrength <= 60) return '#f59e0b';
    if (emailStrength <= 85) return '#3b82f6';
    return '#10b981';
  };

  // Message de validation
  const getValidationMessage = () => {
    if (!isEmailTouched) return '';
    if (emailValid) return { text: 'Email valide ✓', color: '#10b981' };
    if (email.length === 0) return { text: 'Veuillez saisir un email', color: '#94a3b8' };
    return { text: 'Format invalide: nom@domaine.com', color: '#ef4444' };
  };

  const validationMessage = getValidationMessage();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <BookOpen size={48} style={styles.logoIcon} />
          </div>
          <h1 style={styles.title}>ENI Fianarantsoa</h1>
          <p style={styles.subtitle}>Plateforme de gestion des emplois du temps</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          {error && (
            <div style={styles.errorMessage}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>
              <Mail size={16} style={styles.labelIcon} />
              Email
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
                              '#e2e8f0',
                  backgroundColor: '#f8fafc',
                }}
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
            </div>
            
            {/* Barre de progression du pourcentage */}
            {isEmailTouched && email && (
              <div style={styles.strengthContainer}>
                <div style={styles.strengthBarBackground}>
                  <div 
                    style={{
                      ...styles.strengthBarFill,
                      width: `${emailStrength}%`,
                      backgroundColor: getStrengthColor(),
                      transition: 'width 0.4s ease-in-out, background-color 0.3s ease'
                    }}
                  />
                </div>
                <div style={styles.strengthInfo}>
                  <span style={{ 
                    fontSize: '12px', 
                    color: getStrengthColor(),
                    fontWeight: 600,
                    fontFamily: '"Inter", "Poppins", sans-serif',
                  }}>
                    {emailStrength}%
                  </span>
                  {validationMessage && (
                    <span style={{
                      fontSize: '12px',
                      color: validationMessage.color,
                      marginLeft: '8px',
                      fontWeight: 500,
                      fontFamily: '"Inter", "Poppins", sans-serif',
                    }}>
                      {validationMessage.text}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>
              <Lock size={16} style={styles.labelIcon} />
              Mot de passe
            </label>
            <div style={styles.inputWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  ...styles.input,
                  backgroundColor: '#f8fafc',
                }}
                required
                minLength="6"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
                title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {password && password.length < 6 && (
              <div style={styles.passwordHint}>
                <AlertCircle size={14} color="#ef4444" />
                <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 500 }}>
                  Minimum 6 caractères requis
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !emailValid}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : (!emailValid && email) ? 0.5 : 1,
              cursor: loading || (!emailValid && email) ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <>
                <div style={styles.spinner} />
                Connexion en cours...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Se connecter
              </>
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <Link to="/emploi-du-temps-public" style={styles.publicLink}>
            📅 Voir l'emploi du temps public
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
    padding: '20px',
    fontFamily: '"Inter", "Poppins", "Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  card: {
    background: 'white',
    borderRadius: '24px',
    padding: '40px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
    animation: 'fadeIn 0.5s ease-out',
  },
  header: { 
    textAlign: 'center', 
    marginBottom: '32px' 
  },
  logo: { 
    display: 'flex', 
    justifyContent: 'center', 
    marginBottom: '16px' 
  },
  logoIcon: { 
    color: '#2563eb' 
  },
  title: { 
    fontSize: '24px', 
    fontWeight: 700, 
    color: '#1e293b', 
    margin: '0 0 8px 0',
    fontFamily: '"Poppins", "Inter", sans-serif',
  },
  subtitle: { 
    fontSize: '14px', 
    color: '#64748b', 
    margin: 0,
    fontWeight: 400,
  },
  form: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px' 
  },
  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: '#fef2f2',
    borderRadius: '12px',
    color: '#ef4444',
    fontSize: '14px',
    border: '1px solid #fecaca',
    fontWeight: 500,
  },
  inputGroup: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '6px' 
  },
  label: { 
    fontSize: '14px', 
    fontWeight: 600, 
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: '"Inter", "Poppins", sans-serif',
  },
  labelIcon: {
    color: '#2563eb',
  },
  inputWrapper: { 
    position: 'relative' 
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#f8fafc',
    color: '#1e293b',
    fontFamily: '"Inter", sans-serif',
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
  passwordToggle: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '4px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
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
    backgroundColor: '#f1f5f9',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.4s ease-in-out',
    position: 'relative',
  },
  strengthInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '4px',
  },
  passwordHint: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '4px',
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
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '8px',
    boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
    fontFamily: '"Inter", "Poppins", sans-serif',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid white',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  footer: { 
    marginTop: '24px', 
    textAlign: 'center' 
  },
  publicLink: { 
    fontSize: '14px', 
    color: '#2563eb', 
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '40px',
    fontWeight: 500,
    fontFamily: '"Inter", "Poppins", sans-serif',
  },
};

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin { 
      to { transform: rotate(360deg); } 
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
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
      background-color: white !important;
    }
    
    .password-toggle:hover {
      background-color: #f1f5f9;
      color: #475569;
    }
    
    .public-link:hover {
      background-color: #eff6ff;
      color: #1d4ed8;
      text-decoration: none;
      transform: translateY(-1px);
    }
    
    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(37, 99, 235, 0.3);
    }
    
    button:active:not(:disabled) {
      transform: translateY(0px);
    }
    
    @media (max-width: 480px) {
      .card {
        padding: 24px;
      }
      
      .title {
        font-size: 20px;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}