export const COLORS = {
  bg: '#0D0D0D',
  bgCard: '#1A1A1A',
  bgElevated: '#222222',
  primary: '#C9A84C',
  primaryLight: '#E8C97A',
  primaryDim: '#2A2216',
  text: '#F5F0E8',
  textSecondary: '#A89880',
  textMuted: '#6B6055',
  border: '#2A2A2A',
  borderLight: '#333333',
  white: '#FFFFFF',
  success: '#2E7D32',
  successBg: '#0A1F0A',
  warning: '#F57F17',
  warningBg: '#1F1500',
  error: '#C62828',
  errorBg: '#1F0808',
  grey: '#333333',
};

export const FONTS = {
  h1: { fontSize: 28, fontWeight: '800' as const, color: COLORS.text },
  h2: { fontSize: 22, fontWeight: '700' as const, color: COLORS.text },
  h3: { fontSize: 18, fontWeight: '700' as const, color: COLORS.text },
  h4: { fontSize: 16, fontWeight: '600' as const, color: COLORS.text },
  body: { fontSize: 14, fontWeight: '400' as const, color: COLORS.text },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, color: COLORS.textSecondary },
  caption: { fontSize: 12, fontWeight: '400' as const, color: COLORS.textMuted },
  gold: { color: COLORS.primary },
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const SHADOW = {
  card: {
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
};
