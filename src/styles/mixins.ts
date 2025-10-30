// 자주 사용하는 인라인 스타일 믹스인
import type { CSSProperties } from 'react';
import { COLORS, FONTS, SCALE, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from './theme';

/**
 * 컨테이너 스타일 믹스인
 */
export const containerFullscreen: CSSProperties = {
  width: '100vw',
  minHeight: '100vh',
  backgroundColor: COLORS.background,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxSizing: 'border-box',
};

export const containerCentered: CSSProperties = {
  width: '100vw',
  height: '100vh',
  position: 'relative',
  backgroundColor: COLORS.white,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
};

/**
 * Flex 레이아웃 믹스인
 */
export const flexCenter: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const flexColumn: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

export const flexColumnCenter: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

/**
 * 텍스트 스타일 믹스인
 */
export const textPrimary: CSSProperties = {
  fontFamily: FONTS.primary,
  color: COLORS.dark,
};

export const textSecondary: CSSProperties = {
  fontFamily: FONTS.secondary,
  color: COLORS.textLight,
};

/**
 * 브랜드 로고 스타일
 */
export const logoSayJong: CSSProperties = {
  fontSize: FONT_SIZES.xxxl,
  letterSpacing: '-0.01em',
  lineHeight: '150%',
  fontWeight: FONT_WEIGHTS.extrabold,
  color: COLORS.primary,
  fontFamily: FONTS.primary,
};

/**
 * 버튼 스타일 믹스인
 */
export const buttonPrimary: CSSProperties = {
  backgroundColor: COLORS.primary,
  color: '#f3f3f3',
  border: 'none',
  borderRadius: BORDER_RADIUS.sm,
  cursor: 'pointer',
  fontFamily: FONTS.primary,
  fontWeight: FONT_WEIGHTS.semibold,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
};

export const buttonDisabled: CSSProperties = {
  ...buttonPrimary,
  backgroundColor: '#ccc',
  cursor: 'not-allowed',
};

/**
 * 입력 필드 스타일 믹스인
 */
export const inputField: CSSProperties = {
  width: '100%',
  border: 'none',
  outline: 'none',
  backgroundColor: 'transparent',
  fontFamily: FONTS.secondary,
  color: COLORS.textLight,
  padding: 0,
};

export const inputContainer: CSSProperties = {
  borderRadius: BORDER_RADIUS.sm,
  backgroundColor: COLORS.white,
  border: `1px solid ${COLORS.border}`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
};

export const inputLabel: CSSProperties = {
  position: 'absolute',
  backgroundColor: COLORS.white,
  fontFamily: FONTS.primary,
  pointerEvents: 'none',
  zIndex: 1,
};

/**
 * 카드 스타일 믹스인
 */
export const card: CSSProperties = {
  borderRadius: BORDER_RADIUS.xl,
  backgroundColor: COLORS.white,
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  padding: '20px',
};

export const cardLesson: CSSProperties = {
  boxShadow: '0px 3px 3px rgba(0, 0, 0, 0.25)',
  borderRadius: BORDER_RADIUS.lg,
  backgroundColor: COLORS.lightPink,
};

/**
 * 카라오케 텍스트 스타일
 */
export const karaokeText: CSSProperties = {
  fontSize: '64px',
  letterSpacing: '0.3em',
  fontWeight: FONT_WEIGHTS.medium,
  fontFamily: FONTS.primary,
  textShadow: '2px 0 0 #000, 0 2px 0 #000, -2px 0 0 #000, 0 -2px 0 #000',
};

/**
 * 헬퍼 함수: 스케일 적용
 */
export const scaled = (value: number): string => `${value * SCALE}px`;

/**
 * 헬퍼 함수: 여러 값에 스케일 적용
 */
export const scaledValues = (...values: number[]): string => {
  return values.map(v => `${v * SCALE}px`).join(' ');
};
