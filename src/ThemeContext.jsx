import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

// Paleta de colores para cada modo. Los componentes deben leer estos valores
// (via useTheme()) en vez de escribir colores fijos como '#fff' o '#111827'.
const palettes = {
  light: {
    bg: '#F7F9FC',
    bgAlt: '#FFFFFF',
    card: '#FFFFFF',
    border: '#F0F2F5',
    borderStrong: '#E8ECF0',
    text: '#111827',
    textSecondary: '#374151',
    textMuted: '#6B7280',
    textFaint: '#9CA3AF',
    inputBg: '#F7F9FC',
  },
  dark: {
    bg: '#0F1115',
    bgAlt: '#181B21',
    card: '#1B1F26',
    border: '#262B33',
    borderStrong: '#2E333D',
    text: '#F3F4F6',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    textFaint: '#6B7280',
    inputBg: '#12151A',
  },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('sena_theme') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sena_theme', theme);
    } catch {
      // ignorar si localStorage no está disponible
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const colors = palettes[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, colors }}>
      <div style={{ background: colors.bg, minHeight: '100vh', transition: 'background .2s' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}