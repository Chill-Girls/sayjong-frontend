import React from 'react';
import { COLORS, FONTS, FONT_WEIGHTS, BORDER_RADIUS } from '../styles/theme';
import { scaled } from '../styles/mixins';

interface CoordsButtonProps {
  isActive: boolean;
  onClick: () => void;
  top?: number;
}

const CoordsButton: React.FC<CoordsButtonProps> = ({ isActive, onClick, top = 30 }) => {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        top: scaled(top),
        right: scaled(10),
        zIndex: 1000,
        padding: `${scaled(8)} ${scaled(12)}`,
        backgroundColor: isActive ? COLORS.primary : COLORS.background,
        color: isActive ? COLORS.white : COLORS.dark,
        border: `1px solid ${COLORS.primary}`,
        borderRadius: BORDER_RADIUS.md,
        cursor: 'pointer',
        fontSize: scaled(12),
        fontWeight: FONT_WEIGHTS.semibold,
        fontFamily: FONTS.primary,
        outline: 'none',
        transition: 'all 0.2s ease',
      }}
      aria-label="Toggle landmark coordinates"
    >
      COORDS
    </button>
  );
};

export default CoordsButton;
