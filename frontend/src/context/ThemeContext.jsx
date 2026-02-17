import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  HIGH_CONTRAST: 'high-contrast',
  PASTEL: 'pastel',
  CYBERPUNK: 'cyberpunk',
  FOREST: 'forest'
};

const THEME_CONFIGS = {
  light: {
    name: 'Claro ☀️',
    icon: '☀️' },
  dark: {
    name: 'Escuro 🌙',
    icon: '🌙' },
  'high-contrast': {
    name: 'Alto Contraste ◆',
    icon: '◆' },
  pastel: {
    name: 'Pastel 🎨',
    icon: '🎨' },
  cyberpunk: {
    name: 'Cyberpunk 🤖',
    icon: '🤖' },
  forest: {
    name: 'Floresta 🌲',
    icon: '🌲' }
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('light');
  const [accent, setAccent] = useState([22, 163, 74]); // green-600 brand
  const [fontScale, setFontScale] = useState(1);
  const [systemTheme, setSystemTheme] = useState('light');

  // Detectar preferência de tema do sistema
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const systemIsDark = mediaQuery.matches;
      setSystemTheme(systemIsDark ? 'dark' : 'light');

      const handler = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      }

      // Fallback for older browsers
      if (typeof mediaQuery.addListener === 'function') {
        mediaQuery.addListener(handler);
        return () => mediaQuery.removeListener(handler);
      }
    }
  }, []);

  // Carregar tema salvo do localStorage
  useEffect(() => {
    const saved = typeof window !== 'undefined' && window.localStorage.getItem('lc_theme');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setThemeState(parsed.theme || systemTheme);
        if (parsed.accent) setAccent(parsed.accent);
        if (parsed.fontScale) setFontScale(parsed.fontScale);
      } catch (e) {
        setThemeState(systemTheme);
      }
    } else {
      setThemeState(systemTheme);
    }
  }, [systemTheme]);

  // Aplicar tema ao documento
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      
      // Aplicar classe dark se tema é dark
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Aplicar classe de tema customizado
      document.documentElement.classList.remove('light', 'dark', 'high-contrast', 'pastel');
      document.documentElement.classList.add(theme);

      // Aplicar CSS custom properties
      const rgb = accent.join(',');
      document.documentElement.style.setProperty('--accent-rgb', rgb);
      document.documentElement.style.setProperty('--accent', `rgb(${rgb})`);
      document.documentElement.style.setProperty('--font-scale', fontScale.toString());
      
      // Salvar no localStorage
      window.localStorage.setItem('lc_theme', JSON.stringify({ theme, accent, fontScale }));
    }
  }, [theme, accent, fontScale]);

  const setTheme = (newTheme) => {
    if (!newTheme) return;

    // Accept both keys (e.g. 'LIGHT') and values (e.g. 'light')
    if (THEME_MODES[newTheme]) {
      // called with key name
      setThemeState(THEME_MODES[newTheme]);
      return;
    }

    const values = Object.values(THEME_MODES);
    if (values.includes(newTheme)) {
      setThemeState(newTheme);
      return;
    }
  };

  const toggleTheme = () => {
    setThemeState(t => t === 'dark' ? 'light' : 'dark');
  };

  const cycleTheme = () => {
    const themes = Object.values(THEME_MODES);
    const currentIdx = themes.indexOf(theme);
    const nextIdx = (currentIdx + 1) % themes.length;
    setThemeState(themes[nextIdx]);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      toggleTheme,
      cycleTheme,
      setAccent,
      accent,
      fontScale,
      setFontScale,
      systemTheme,
      isDark: theme === THEME_MODES.DARK,
      isHighContrast: theme === THEME_MODES.HIGH_CONTRAST,
      isPastel: theme === THEME_MODES.PASTEL,
      themeConfig: THEME_CONFIGS[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;

