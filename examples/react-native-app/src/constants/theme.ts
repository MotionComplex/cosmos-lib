/**
 * Cosmos Mobile — Dark astronomy-inspired theme
 */
export const colors = {
  // Backgrounds
  bg: '#07070f',
  bgCard: '#0f1024',
  bgCardHover: '#161836',
  bgSurface: '#0b0b1e',

  // Accents
  accent: '#6c63ff',
  accentSoft: 'rgba(108, 99, 255, 0.15)',
  accentGlow: 'rgba(108, 99, 255, 0.4)',
  gold: '#f5c842',
  goldSoft: 'rgba(245, 200, 66, 0.15)',
  cyan: '#00d4ff',
  cyanSoft: 'rgba(0, 212, 255, 0.1)',
  rose: '#ff6b8a',
  roseSoft: 'rgba(255, 107, 138, 0.12)',
  emerald: '#34d399',

  // Text
  text: '#e8e6f0',
  textSecondary: '#8b88a8',
  textMuted: '#5a577a',

  // Borders
  border: 'rgba(255, 255, 255, 0.06)',
  borderLight: 'rgba(255, 255, 255, 0.12)',

  // Gradients
  gradientTop: '#0a0a2e',
  gradientBottom: '#07070f',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const fonts = {
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 24,
    xxl: 32,
    hero: 42,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};
