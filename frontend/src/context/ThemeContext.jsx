// src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Charger le thème depuis localStorage
    const saved = localStorage.getItem('adminSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.theme || 'light';
      } catch {
        return 'light';
      }
    }
    return 'light';
  });

  useEffect(() => {
    applyTheme(theme);
    // Sauvegarder le thème dans les paramètres
    const saved = localStorage.getItem('adminSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.theme = theme;
        localStorage.setItem('adminSettings', JSON.stringify(parsed));
      } catch {
        // Ignorer
      }
    }
  }, [theme]);

  const applyTheme = (themeMode) => {
    const root = document.documentElement;
    
    if (themeMode === 'dark') {
      root.style.setProperty('--bg-primary', '#0f172a');
      root.style.setProperty('--bg-secondary', '#1e293b');
      root.style.setProperty('--bg-card', '#1e293b');
      root.style.setProperty('--bg-input', '#0f172a');
      root.style.setProperty('--text-primary', '#f1f5f9');
      root.style.setProperty('--text-secondary', '#94a3b8');
      root.style.setProperty('--text-muted', '#64748b');
      root.style.setProperty('--border-color', '#334155');
      root.style.setProperty('--shadow-color', 'rgba(0,0,0,0.3)');
      root.style.setProperty('--hover-bg', '#334155');
      document.body.style.backgroundColor = '#0f172a';
      document.body.style.color = '#f1f5f9';
    } else if (themeMode === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.style.setProperty('--bg-primary', '#0f172a');
        root.style.setProperty('--bg-secondary', '#1e293b');
        root.style.setProperty('--bg-card', '#1e293b');
        root.style.setProperty('--bg-input', '#0f172a');
        root.style.setProperty('--text-primary', '#f1f5f9');
        root.style.setProperty('--text-secondary', '#94a3b8');
        root.style.setProperty('--text-muted', '#64748b');
        root.style.setProperty('--border-color', '#334155');
        root.style.setProperty('--shadow-color', 'rgba(0,0,0,0.3)');
        root.style.setProperty('--hover-bg', '#334155');
        document.body.style.backgroundColor = '#0f172a';
        document.body.style.color = '#f1f5f9';
      } else {
        root.style.setProperty('--bg-primary', '#f8fafc');
        root.style.setProperty('--bg-secondary', '#ffffff');
        root.style.setProperty('--bg-card', '#ffffff');
        root.style.setProperty('--bg-input', '#f8fafc');
        root.style.setProperty('--text-primary', '#1e293b');
        root.style.setProperty('--text-secondary', '#64748b');
        root.style.setProperty('--text-muted', '#94a3b8');
        root.style.setProperty('--border-color', '#e2e8f0');
        root.style.setProperty('--shadow-color', 'rgba(0,0,0,0.05)');
        root.style.setProperty('--hover-bg', '#f1f5f9');
        document.body.style.backgroundColor = '#f8fafc';
        document.body.style.color = '#1e293b';
      }
    } else {
      // Mode clair
      root.style.setProperty('--bg-primary', '#f8fafc');
      root.style.setProperty('--bg-secondary', '#ffffff');
      root.style.setProperty('--bg-card', '#ffffff');
      root.style.setProperty('--bg-input', '#f8fafc');
      root.style.setProperty('--text-primary', '#1e293b');
      root.style.setProperty('--text-secondary', '#64748b');
      root.style.setProperty('--text-muted', '#94a3b8');
      root.style.setProperty('--border-color', '#e2e8f0');
      root.style.setProperty('--shadow-color', 'rgba(0,0,0,0.05)');
      root.style.setProperty('--hover-bg', '#f1f5f9');
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#1e293b';
    }
  };

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};