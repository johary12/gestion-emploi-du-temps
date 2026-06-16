// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

// ✅ Création du contexte
const AuthContext = createContext(null);

// ✅ Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fonction utilitaire pour extraire le JSON
  const parseResponse = useCallback((data) => {
    if (typeof data === 'object' && data !== null) return data;
    if (typeof data === 'string') {
      const jsonMatch = data.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Réponse API invalide');
  }, []);

  // ✅ Chargement initial de l'utilisateur
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
  }, [parseResponse]);

  // ✅ Fonction de connexion
  const login = useCallback(async (email, password) => {
    const response = await authService.login({ email, password });
    console.log('raw response.data:', response.data);

    const data = parseResponse(response.data);
    console.log('data parsé:', data);

    const { token, user } = data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return user;
  }, [parseResponse]);

  // ✅ Fonction de déconnexion
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erreur logout:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // ✅ Fonction pour changer le mot de passe
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const response = await authService.changePassword({
        currentPassword,
        newPassword
      });
      
      // Mettre à jour l'utilisateur dans le localStorage
      if (user) {
        const updatedUser = { ...user };
        updatedUser.passwordChangedAt = new Date().toISOString();
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }, [user]);

  // ✅ Fonction pour mettre à jour les données utilisateur
  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  // ✅ Valeur du contexte
  const value = {
    user,
    login,
    logout,
    loading,
    changePassword,
    updateUser,
    isAdmin: user?.role === 'admin',
    isProf: user?.role === 'prof',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ✅ Hook personnalisé
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ✅ Export par défaut pour compatibilité avec Vite Fast Refresh
const AuthContextExport = {
  AuthProvider,
  useAuth,
  AuthContext
};

export default AuthContextExport;