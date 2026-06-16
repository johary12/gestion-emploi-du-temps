// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        try {
          setUser(JSON.parse(storedUser));
          const response = await authService.me();
          const userData = parseResponse(response.data);
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error('Session expirée:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  // ✅ Fonction utilitaire pour extraire le JSON même avec du texte parasite
  const parseResponse = (data) => {
    if (typeof data === 'object' && data !== null) return data;
    if (typeof data === 'string') {
      const jsonMatch = data.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Réponse API invalide');
  };

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    console.log('raw response.data:', response.data);

    const data = parseResponse(response.data);
    console.log('data parsé:', data);

    const { token, user } = data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return user; // ✅ return obligatoire
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erreur logout:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAdmin: user?.role === 'admin',
    isProf: user?.role === 'prof',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};