import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [accent, setAccent] = useState([124, 58, 237]); // rgb array (purple-600 brand)
  const [fontScale, setFontScale] = useState(1);
  const [systemTheme, setSystemTheme] = useState('light');

  // Detectar preferência de tema do sistema
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('([REDACTED_TOKEN]: dark)');
      const systemIsDark = mediaQuery.matches;
      setSystemTheme(systemIsDark ? 'dark' : 'light');

      // Listen para mudanças de preferência do sistema
      const handler = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
      mediaQuery.addListener(handler);

      return () => mediaQuery.removeListener(handler);
    }
  }, []);

  useEffect(() => {
    const saved = typeof window !== 'undefined' && window.localStorage.getItem('lc_theme');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTheme(parsed.theme || systemTheme);
        if (parsed.accent) setAccent(parsed.accent);
        if (parsed.fontScale) setFontScale(parsed.fontScale);
      } catch (e) {
        // ignore parse error
        // Se não conseguir fazer parse, usar tema do sistema
        setTheme(systemTheme);
      }
    } else {
      // Sem preferência salva - usar tema do sistema
      setTheme(systemTheme);
    }
  }, [systemTheme]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
      
      // Aplicar classe dark se necessário (para Tailwind)
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Expor tanto o RGB puro quanto a string rgb(...) para uso no CSS
      const rgb = accent.join(',');
      document.documentElement.style.setProperty('--accent-rgb', rgb);
      document.documentElement.style.setProperty('--accent', `rgb(${rgb})`);
      document.documentElement.style.setProperty('--font-scale', fontScale.toString());
      window.localStorage.setItem('lc_theme', JSON.stringify({ theme, accent, fontScale }));
    }
  }, [theme, accent, fontScale]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setAccent, accent, fontScale, setFontScale, systemTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
