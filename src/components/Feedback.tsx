import React from 'react';
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS } from '../styles/theme';
import { flexColumn, scaled } from '../styles/mixins';

interface FeedbackProps {
  text: string;
  message: string;
} // 시아가 만들어줘야 할 것

const Feedback: React.FC<FeedbackProps> = ({ text, message }) => {
  return (
    <div
      style={{
        ...flexColumn,
        gap: scaled(16),
        alignItems: 'center',
        justifyContent: 'center',
        padding: scaled(20),
      }}
    >
      <div
        style={{
          fontSize: FONT_SIZES.lg,
          fontWeight: FONT_WEIGHTS.semibold,
          color: COLORS.dark,
          fontFamily: FONTS.primary,
        }}
      >
        {text}
      </div>
      <div
        style={{
          fontSize: FONT_SIZES.base,
          fontWeight: FONT_WEIGHTS.normal,
          color: COLORS.textSecondary,
          fontFamily: FONTS.primary,
          textAlign: 'center',
        }}
      >
        {message}
      </div>
    </div>
  );
};

export default Feedback;
