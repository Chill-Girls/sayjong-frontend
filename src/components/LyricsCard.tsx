import React, { type ReactNode } from 'react';
import { COLORS, BORDER_RADIUS } from '../styles/theme';
import { flexColumn, scaled } from '../styles/mixins';

interface LyricsCardProps {
  children: ReactNode;
}

const LyricsCard: React.FC<LyricsCardProps> = ({ children }) => {
  return (
    <div
      style={{
        ...flexColumn,
        alignItems: 'stretch',
        gap: scaled(16),
        padding: scaled(32),
        borderRadius: BORDER_RADIUS.lg,
        boxShadow: '0 16px 32px rgba(0,0,0,0.06)',
        background: COLORS.white,
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        minHeight: 0,
        maxHeight: scaled(480),
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
};

export default LyricsCard;

