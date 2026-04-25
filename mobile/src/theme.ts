export const COLORS = {
  bg: '#FFFFFF',
  bgCard: '#FAF8F5',
  bgElevated: '#F5F0E8',
  primary: '#C9A84C',
  primaryLight: '#E8C97A',
  primaryDim: '#FDF6E8',
  text: '#111111',
  textSecondary: '#5C4033',
  textMuted: '#9C8878',
  border: '#E8DDD4',
  borderLight: '#F0EBE4',
  white: '#FFFFFF',
  success: '#2E7D32',
  successBg: '#E8F5E9',
  warning: '#E65100',
  warningBg: '#FFF3E0',
  error: '#C62828',
  errorBg: '#FFEBEE',
  grey: '#9C8878',
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
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
};
