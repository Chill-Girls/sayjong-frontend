// 프로젝트 전체에서 사용하는 테마 상수

export const COLORS = {
  // 브랜드 컬러
  primary: '#f04299',
  
  // 텍스트 컬러
  dark: '#313131',
  textSecondary: '#505050',
  textLight: '#1c1b1f',
  
  // 배경 컬러
  background: '#f8f6f7',
  white: '#fff',
  lightPink: '#ffe9f4',
  
  // 기타
  border: '#79747e',
  gray: '#d9d9d9',
  
  // 카라오케
  karaokePink: '#ec4899',
  karaokePurple: '#a855f7',
  karaokeGray: '#9ca3af',
} as const;

export const FONTS = {
  primary: 'Pretendard',
  secondary: 'Poppins',
} as const;

// 75% 스케일 적용
export const SCALE = 0.75;

// 스케일 적용된 간격
export const SPACING = {
  xs: `${8 * SCALE}px`,      // 6px
  sm: `${16 * SCALE}px`,     // 12px
  md: `${24 * SCALE}px`,     // 18px
  lg: `${40 * SCALE}px`,     // 30px
  xl: `${70 * SCALE}px`,     // 52.5px
  xxl: `${141 * SCALE}px`,   // 105.75px
} as const;

// 원본 간격 (스케일 미적용)
export const SPACING_RAW = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 40,
  xl: 70,
  xxl: 141,
} as const;

// 폰트 크기 (스케일 적용)
export const FONT_SIZES = {
  xs: `${12 * SCALE}px`,     // 9px
  sm: `${14 * SCALE}px`,     // 10.5px
  base: `${16 * SCALE}px`,   // 12px
  md: `${20 * SCALE}px`,     // 15px
  lg: `${24 * SCALE}px`,     // 18px
  xl: `${30 * SCALE}px`,     // 22.5px
  xxl: `${40 * SCALE}px`,    // 30px
  xxxl: `${64 * SCALE}px`,   // 48px
  huge: `${128 * SCALE}px`,  // 96px
} as const;

// 폰트 두께
export const FONT_WEIGHTS = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

// Border Radius
export const BORDER_RADIUS = {
  sm: '4px',
  md: `${12 * SCALE}px`,     // 9px
  lg: `${22.5 * SCALE}px`,   // ~17px
  xl: `${30 * SCALE}px`,     // 22.5px
} as const;

// Box Shadow
export const SHADOWS = {
  card: '0px 3px 3px rgba(0, 0, 0, 0.25)',
  light: '0 4px 8px rgba(0, 0, 0, 0.1)',
} as const;

// Z-Index
export const Z_INDEX = {
  base: 0,
  dropdown: 1,
  overlay: 2,
  modal: 3,
  tooltip: 4,
} as const;

// 스케일 적용 헬퍼 함수
export const scale = (value: number): string => `${value * SCALE}px`;

