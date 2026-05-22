import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout, isAdmin, isProf } = useAuth();
  const navigate = useNavigate();
  const [locationText, setLocationText] = useState('Fianarantsoa');
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLocationText(prev => prev === 'Fianarantsoa' ? 'Madagascar' : 'Fianarantsoa');
    }, 2000);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: scrolled ? '16px 40px' : '24px 40px',
        background: scrolled 
          ? 'rgba(255, 255, 255, 0.98)' 
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled 
          ? '1px solid rgba(0, 0, 0, 0.08)' 
          : '1px solid rgba(0, 0, 0, 0.04)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: scrolled 
          ? '0 4px 20px rgba(0, 0, 0, 0.05)' 
          : 'none',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo Section */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 12,
              cursor: 'pointer',
              position: 'relative',
            }}>
              <div style={{
                fontSize: 28,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}>
                ENI
              </div>
              <div style={{
                fontSize: 28,
                fontWeight: 300,
                color: '#cbd5e1',
              }}>
                /
              </div>
              <div style={{
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  fontSize: 24,
                  fontWeight: 500,
                  background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: 'slideText 0.6s ease-out',
                  whiteSpace: 'nowrap',
                }}>
                  {locationText}
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: -2,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'linear-gradient(90deg, #3b82f6, #06b6d4, #3b82f6)',
                  transform: 'scaleX(0)',
                  transition: 'transform 0.3s ease',
                }} />
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
          }}>
            {!user ? (
              <Link to="/login">
                <button style={{
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                  padding: '10px 28px',
                  borderRadius: '40px',
                  fontWeight: 600,
                  fontSize: 14,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(59,130,246,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.3)';
                }}>
                  
                  <span>Connexion</span>
                </button>
              </Link>
            ) : (
              <>
                {/* User Info */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '6px 20px 6px 16px',
                  background: '#f8fafc',
                  borderRadius: '40px',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.3s ease',
                }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${isAdmin ? '#f59e0b' : isProf ? '#10b981' : '#3b82f6'}, ${isAdmin ? '#ef4444' : isProf ? '#059669' : '#2563eb'})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}>
                    {isAdmin ? '👑' : isProf ? '👨‍🏫' : '👤'}
                  </div>
                  <div>
                    <div style={{ 
                      color: '#1e293b', 
                      fontSize: 14,
                      fontWeight: 600,
                    }}>
                      {user.name.split(' ')[0]}
                    </div>
                    <div style={{
                      color: '#64748b',
                      fontSize: 11,
                      fontWeight: 500,
                    }}>
                      {isAdmin ? 'Administrateur' : isProf ? 'Professeur' : 'Utilisateur'}
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                {isAdmin && (
                  <Link to="/admin" style={{ textDecoration: 'none' }}>
                    <div 
                      style={{
                        ...navLinkStyle,
                        background: hoveredLink === 'admin' ? '#eff6ff' : 'transparent',
                        transform: hoveredLink === 'admin' ? 'translateY(-2px)' : 'translateY(0)',
                      }}
                      onMouseEnter={() => setHoveredLink('admin')}
                      onMouseLeave={() => setHoveredLink(null)}
                    >
                      <span style={{ fontSize: 16 }}>📊</span>
                      <span>Dashboard</span>
                    </div>
                  </Link>
                )}
                
                {isProf && (
                  <Link to="/prof" style={{ textDecoration: 'none' }}>
                    <div 
                      style={{
                        ...navLinkStyle,
                        background: hoveredLink === 'prof' ? '#eff6ff' : 'transparent',
                        transform: hoveredLink === 'prof' ? 'translateY(-2px)' : 'translateY(0)',
                      }}
                      onMouseEnter={() => setHoveredLink('prof')}
                      onMouseLeave={() => setHoveredLink(null)}
                    >
                      <span style={{ fontSize: 16 }}>📚</span>
                      <span>Espace prof</span>
                    </div>
                  </Link>
                )}
                
                {/* Logout Button */}
                <button onClick={handleLogout} style={{
                  background: 'white',
                  color: '#ef4444',
                  border: '1px solid #fecaca',
                  padding: '8px 20px',
                  borderRadius: '40px',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fef2f2';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = '#fca5a5';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#fecaca';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <span>🚪</span>
                  <span>Déconnexion</span>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Add keyframe animations */}
      <style>{`
        @keyframes slideText {
          0% {
            opacity: 0;
            transform: translateX(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes glowPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
          }
        }
        
        @keyframes underlineGlow {
          0% {
            transform: scaleX(0);
            opacity: 0;
          }
          100% {
            transform: scaleX(1);
            opacity: 1;
          }
        }
        
        .nav-link {
          position: relative;
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #3b82f6, #06b6d4);
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        
        .nav-link:hover::after {
          width: 80%;
        }
      `}</style>
    </>
  );
}

const navLinkStyle = {
  color: '#475569',
  textDecoration: 'none',
  fontSize: 14,
  fontWeight: 600,
  padding: '8px 20px',
  borderRadius: '40px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  cursor: 'pointer',
  border: '1px solid transparent',
};