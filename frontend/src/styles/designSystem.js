/**
 * Design System - Tema Verde Leidy Cleaner
 * Paleta de cores, tipografia, componentes base
 */

export const colors = {
  // Verdes principais (Leidy Brand)
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Verde principal
    600: '#16a34a', // Verde escuro
    700: '#15803d',
    800: '#166534',
    900: '#145231' },

  // Secundários (para destaque e ações)
  accent: {
    emerald: '#10b981',
    teal: '#14b8a6',
    lime: '#84cc16' },

  // Neutros
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827' },

  // Estados
  status: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6' },

  // Backgrounds
  bg: {
    light: '#ffffff',
    lighter: '#f9fafb',
    lightest: '#f3f4f6',
    dark: '#1f2937' },

  // Gradientes
  gradients: {
    greenGlow: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
    greenFade: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
    greenLight: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)' } };

export const typography = {
  // Fontes
  fonts: {
    sans: "'Inter', 'Segoe UI', system-ui, sans-serif",
    heading: "'Poppins', 'Inter', sans-serif",
    mono: "'Fira Code', 'Courier New', monospace" },

  // Tamanhos
  sizes: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px' },

  // Pesos
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800 } };

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px' };

export const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
  green: '0 10px 25px rgba(34, 197, 94, 0.15)' };

export const borderRadius = {
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px' };

export const transitions = {
  fast: '150ms ease-in-out',
  base: '250ms ease-in-out',
  slow: '350ms ease-in-out' };
