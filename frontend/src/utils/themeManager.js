/**
 * Theme Manager - Gerencia temas da aplicação
 */

const THEME_KEY = 'vamos_theme';
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  HIGH_CONTRAST: 'high-contrast',
  GREEN: 'green',
  AUTO: 'auto'
};

class ThemeManager {
  constructor() {
    // Apenas executar no browser
    if (typeof window === 'undefined') {
      this.currentTheme = THEMES.AUTO;
      return;
    }
    
    this.currentTheme = this.getStoredTheme();
    this.element = document.documentElement;
    this.applyTheme(this.currentTheme);
    this.[REDACTED_TOKEN]();
  }

  /**
   * Obter tema armazenado no localStorage (com check de disponibilidade)
   */
  getStoredTheme() {
    // Verificar se localStorage está disponível
    if (typeof window === 'undefined' || !window.localStorage) {
      return THEMES.AUTO;
    }
    
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored && Object.values(THEMES).includes(stored)) {
        return stored;
      }
    } catch (_e) {
      // Silently continue on error
      // Local storage not available, use default
    }
    return THEMES.AUTO;
  }

  /**
   * Obter tema do sistema (light ou dark)
   */
  getSystemTheme() {
    if (typeof window === 'undefined') return THEMES.LIGHT;
    if (window.matchMedia && window.matchMedia('([REDACTED_TOKEN]: dark)').matches) {
      return THEMES.DARK;
    }
    return THEMES.LIGHT;
  }

  /**
   * Obter tema efetivo (se auto, usa sistema)
   */
  getEffectiveTheme() {
    if (this.currentTheme === THEMES.AUTO) {
      return this.getSystemTheme();
    }
    return this.currentTheme;
  }

  /**
   * Aplicar tema ao HTML
   */
  applyTheme(theme) {
    if (typeof window === 'undefined') return;
    
    const effectiveTheme = theme === THEMES.AUTO ? this.getSystemTheme() : theme;
    
    // Remover todas as classes de tema e atributo data-theme
    Object.values(THEMES).forEach(t => {
      if (t !== THEMES.AUTO) {
        this.element.classList.remove(`theme-${t}`);
      }
    });
    this.element.removeAttribute('data-theme');

    // Aplicar novo tema (somente se não for light)
    if (effectiveTheme && effectiveTheme !== THEMES.LIGHT) {
      this.element.setAttribute('data-theme', effectiveTheme);
      this.element.classList.add(`theme-${effectiveTheme}`);
    }
    
    // Atualizar meta tag
    this.[REDACTED_TOKEN](effectiveTheme);
    
    this.currentTheme = theme;
    
    // Salvar no localStorage com proteção
    if (window.localStorage) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (_e) {
      // Silently continue on error
        // Storage quota exceeded or disabled, continue silently
      }
    }

    // Persistir em cookie para SSR poder ler o tema
    try {
      document.cookie = `${THEME_KEY}=${encodeURIComponent(theme)}; path=/; max-age=${60 * 60 * 24 * 365}`;
    } catch (e) {
      // Silently continue on error
      // ignore
    }
    
    // Disparar evento customizado
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('themechange', {
        detail: { theme, effectiveTheme }
      }));
    }
  }

  /**
   * Alternar para um tema específico
   */
  setTheme(theme) {
    if (Object.values(THEMES).includes(theme)) {
      this.applyTheme(theme);
    }
  }

  /**
   * Ciclar entre temas
   */
  cycleTheme() {
    const themes = [THEMES.LIGHT, THEMES.DARK, THEMES.GREEN, THEMES.HIGH_CONTRAST];
    const currentIndex = themes.indexOf(
      this.currentTheme === THEMES.AUTO ? this.getSystemTheme() : this.currentTheme
    );
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex]);
  }

  /**
   * Observar mudanças de preferência do sistema
   */
  [REDACTED_TOKEN]() {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    
    const darkModeQuery = window.matchMedia('([REDACTED_TOKEN]: dark)');
    
    // Compatibilidade com navegadores antigos
    if (darkModeQuery.addListener) {
      darkModeQuery.addListener(() => {
        if (this.currentTheme === THEMES.AUTO) {
          this.applyTheme(THEMES.AUTO);
        }
      });
    } else if (darkModeQuery.addEventListener) {
      darkModeQuery.addEventListener('change', () => {
        if (this.currentTheme === THEMES.AUTO) {
          this.applyTheme(THEMES.AUTO);
        }
      });
    }
  }

  /**
   * Atualizar cor do tema nas meta tags
   */
  [REDACTED_TOKEN](theme) {
    if (typeof window === 'undefined' || !document) return;
    
    let color = '#22c55e'; // Verde padrão (light)

    if (theme === THEMES.DARK) {
      color = '#0f172a'; // Navy dark
    } else if (theme === THEMES.HIGH_CONTRAST) {
      color = '#ffffff'; // Branco
    } else if (theme === THEMES.GREEN) {
      color = '#16a34a'; // Verde mais escuro para meta
    }
    
    let metaTag = document.querySelector('meta[name="theme-color"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'theme-color';
      document.head.appendChild(metaTag);
    }
    metaTag.content = color;
  }

  /**
   * Obter tema atual
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Verificar se está em dark mode
   */
  isDarkMode() {
    return this.getEffectiveTheme() === THEMES.DARK;
  }

  /**
   * Obter objeto com todos os temas disponíveis
   */
  getAvailableThemes() {
    return THEMES;
  }
}

// Criar instância apenas no cliente
let [REDACTED_TOKEN] = null;

export const getThemeManager = () => {
  if (typeof window === 'undefined') return null;
  if (![REDACTED_TOKEN]) {
    [REDACTED_TOKEN] = new ThemeManager();
  }
  return [REDACTED_TOKEN];
};

// Alias para compatibilidade
export const themeManager = typeof window !== 'undefined' ? getThemeManager() : null;

export default ThemeManager;