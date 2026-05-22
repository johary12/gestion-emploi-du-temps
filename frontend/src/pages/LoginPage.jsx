/* eslint-disable no-undef */
// src/pages/LoginPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  LogIn, 
  Calendar, 
  Users, 
  DoorOpen, 
  Bell,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  BookOpen,
  Clock,
  Shield,
  Sparkles
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [locationText, setLocationText] = useState('Fianarantsoa');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setLocationText(prev => prev === 'Fianarantsoa' ? 'Madagascar' : 'Fianarantsoa');
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const validateEmail = (email) => {
    const hasAtSymbol = email.includes('@');
    const hasDot = email.includes('.');
    
    if (!email) {
      setEmailError('');
      return false;
    }
    if (!hasAtSymbol) {
      setEmailError('L\'email doit contenir le symbole @');
      return false;
    }
    if (!hasDot) {
      setEmailError('L\'email doit contenir un point (.)');
      return false;
    }
    if (email.indexOf('@') > email.lastIndexOf('.')) {
      setEmailError('Le point doit être après le @');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    validateEmail(newEmail);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(email)) {
      setError('Veuillez entrer une adresse email valide (ex: nom@domaine.com)');
      return;
    }
    
    if (!password) {
      setError('Veuillez entrer votre mot de passe');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      else navigate('/prof');
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Calendar, title: 'Planning intelligent', desc: 'Visualisation claire des cours', color: '#667eea' },
    { icon: Users, title: 'Gestion des salles', desc: 'Réservation optimisée', color: '#f093fb' },
    { icon: Bell, title: 'Notifications', desc: 'Alertes et rappels', color: '#4facfe' },
    { icon: Clock, title: 'Suivi en temps réel', desc: 'Mises à jour instantanées', color: '#43e97b' },
  ];

  const stats = [
    { value: '500+', label: 'Étudiants', icon: Users },
    { value: '50+', label: 'Enseignants', icon: BookOpen },
    { value: '30+', label: 'Salles', icon: DoorOpen },
  ];

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden',
      background: '#fff',
    }}>
      {/* Left Side - Modern Banner */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        overflow: 'hidden',
      }}>
        {/* Animated Background Elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'rgba(255,255,255,0.1)\' d=\'M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E")',
          backgroundSize: 'cover',
          opacity: 0.3,
          animation: 'slide 20s linear infinite',
        }} />
        
        <div style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 15s ease-in-out infinite',
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 250,
          height: 250,
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 12s ease-in-out infinite reverse',
        }} />

        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 500,
          color: 'white',
          animation: 'fadeInLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {/* Logo Section */}
          <div style={{ marginBottom: 48 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 24,
            }}>
              <div style={{
                width: 60,
                height: 60,
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                borderRadius: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.3)',
              }}>
                <GraduationCap size={32} color="white" />
              </div>
              <div>
                <div style={{
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: '-0.5px',
                }}>
                  ENI
                </div>
                <div style={{
                  fontSize: 14,
                  opacity: 0.9,
                }}>
                  {locationText}
                </div>
              </div>
            </div>
          </div>

          {/* Main Description */}
          <div style={{ marginBottom: 40 }}>
            <h1 style={{
              fontSize: 42,
              fontWeight: 800,
              marginBottom: 20,
              lineHeight: 1.2,
              letterSpacing: '-1px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              Gestion d'Emploi du Temps
              <Sparkles size={32} style={{ opacity: 0.8 }} />
            </h1>
            <p style={{
              fontSize: 18,
              lineHeight: 1.6,
              opacity: 0.95,
              marginBottom: 30,
            }}>
              Plateforme centralisée pour la gestion des emplois du temps à l'ENI Fianarantsoa
            </p>
          </div>

          {/* Features Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
            marginTop: 40,
          }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} style={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 16,
                  padding: 16,
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'transform 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <Icon size={28} style={{ marginBottom: 8, color: 'white' }} />
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{feature.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{feature.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Statistics */}
          <div style={{
            display: 'flex',
            gap: 30,
            marginTop: 50,
            paddingTop: 30,
            borderTop: '1px solid rgba(255,255,255,0.2)',
          }}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon size={28} style={{ opacity: 0.8 }} />
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>{stat.value}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        background: '#fff',
        position: 'relative',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 460,
          animation: 'fadeInRight 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {/* Form Header */}
          <div style={{ marginBottom: 40 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 16,
            }}>
              <Shield size={32} style={{ color: '#667eea' }} />
              <h2 style={{
                fontSize: 32,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
              }}>
                Bienvenue
              </h2>
            </div>
            <p style={{ color: '#64748b', fontSize: 14 }}>
              Connectez-vous pour accéder à votre espace
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              color: '#dc2626',
              padding: '14px 18px',
              borderRadius: 16,
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 24,
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              animation: 'shake 0.5s ease',
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block',
                fontWeight: 600,
                fontSize: 13,
                color: focusedField === 'email' ? '#667eea' : '#475569',
                marginBottom: 8,
                transition: 'color 0.2s ease',
              }}>
                <Mail size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Adresse email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="exemple@domaine.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingRight: email ? '40px' : '16px',
                    border: `2px solid ${focusedField === 'email' ? '#667eea' : (emailError ? '#ef4444' : '#e2e8f0')}`,
                    borderRadius: 12,
                    fontSize: 14,
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    background: '#fafbfc',
                  }}
                />
                {email && !emailError && (
                  <CheckCircle size={18} style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#10b981',
                  }} />
                )}
                {emailError && (
                  <AlertCircle size={18} style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#ef4444',
                  }} />
                )}
              </div>
              {emailError && (
                <p style={{
                  marginTop: 6,
                  fontSize: 11,
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <AlertCircle size={12} /> {emailError}
                </p>
              )}
              <p style={{
                marginTop: 6,
                fontSize: 11,
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                💡 L'email doit contenir @ et un point (.)
              </p>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: 28 }}>
              <label style={{
                display: 'block',
                fontWeight: 600,
                fontSize: 13,
                color: focusedField === 'password' ? '#667eea' : '#475569',
                marginBottom: 8,
                transition: 'color 0.2s ease',
              }}>
                <Lock size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingRight: '40px',
                    border: `2px solid ${focusedField === 'password' ? '#667eea' : '#e2e8f0'}`,
                    borderRadius: 12,
                    fontSize: 14,
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    background: '#fafbfc',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                color: '#64748b',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                Se souvenir de moi
              </label>
              <a href="#" style={{
                fontSize: 13,
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                Mot de passe oublié ?
                <ChevronRight size={14} />
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || loading}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 5px 15px -3px rgba(102,126,234,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => {
                if (!isLoading && !loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(102,126,234,0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && !loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 5px 15px -3px rgba(102,126,234,0.4)';
                }
              }}
            >
              {(isLoading || loading) ? (
                <>
                  <div className="spinner" style={{
                    width: 18,
                    height: 18,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.6s linear infinite',
                  }} />
                  Connexion...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Se connecter
                </>
              )}
            </button>
          </form>

        
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes slide {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}