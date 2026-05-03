// FitPro Design Tokens — dark athletic theme
export const COLORS = {
  // Brand
  primary:      '#00E5A0',   // electric teal — primary CTA
  primaryDark:  '#00B87A',
  primaryLight: '#E6FFF8',
  secondary:    '#FF6B35',   // energetic orange — accent
  secondaryDark:'#D94F1D',

  // Backgrounds (dark layered)
  bg:           '#0F2027',   // deepest bg
  surface:      '#162530',   // card surface
  surface2:     '#1E3040',   // elevated surface
  surface3:     '#243848',   // highest elevation

  // Text
  textPrimary:  '#F0F4F8',
  textSecondary:'#8FA8BE',
  textMuted:    '#4D6A80',

  // Status
  success:      '#00E5A0',
  warning:      '#FFB547',
  danger:       '#FF5252',
  info:         '#4DB6FF',

  // Border
  border:       '#1E3345',
  borderStrong: '#2A4460',

  // Chart colors
  chart:        ['#00E5A0','#FF6B35','#4DB6FF','#FFB547','#FF5252'],

  // White / utility
  white:        '#FFFFFF',
  black:        '#000000',
  overlay:      'rgba(0,0,0,0.55)',
};

export const FONTS = {
  // Loaded via expo-font from Google Fonts
  light:      'Nunito_300Light',
  regular:    'Nunito_400Regular',
  medium:     'Nunito_500Medium',
  semiBold:   'Nunito_600SemiBold',
  bold:       'Nunito_700Bold',
  extraBold:  'Nunito_800ExtraBold',
  black:      'Nunito_900Black',
};

export const SIZES = {
  xs:   10,
  sm:   12,
  md:   14,
  base: 16,
  lg:   18,
  xl:   22,
  xxl:  28,
  xxxl: 36,
  h1:   42,
};

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   18,
  xl:   24,
  full: 999,
};

export const SPACING = {
  xs:   4,
  sm:   8,
  md:   12,
  base: 16,
  lg:   20,
  xl:   24,
  xxl:  32,
  xxxl: 48,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#00E5A0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
};
