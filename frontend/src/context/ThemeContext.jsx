import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [accent, setAccent] = useState([124, 58, 237]); // rgb array (purple-600 brand)
  const [fontScale, setFontScale] = useState(1);

  useEffect(() => {
    const saved = typeof window !== 'undefined' && window.localStorage.getItem('lc_theme');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Respect saved theme but prefer green accent unless explicitly set
        setTheme(parsed.theme || 'light');
        if (parsed.accent) setAccent(parsed.accent);
        if (parsed.fontScale) setFontScale(parsed.fontScale);
      } catch(e) { /* ignore parse error */ }
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
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
    <ThemeContext.Provider value={{ theme, toggleTheme, setAccent, accent, fontScale, setFontScale }}>
      {children}
    </ThemeContext.Provider>
  );
}
