import React from 'react';
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from '../styles/theme';
import { scaled } from '../styles/mixins';

interface FeedbackProps {
  text: string;
  message: string;
}
const Feedback: React.FC<FeedbackProps> = ({ text, message }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaled(20),
        padding: `${scaled(16)} ${scaled(20)}`,
        backgroundColor: COLORS.lightPink,
        borderRadius: BORDER_RADIUS.lg,
        width: '100%',
        marginBottom: scaled(12),
      }}
    >
      {/* 왼쪽: 큰 빨간색 글자 */}
      <div
        style={{
          fontSize: scaled(64),
          fontWeight: FONT_WEIGHTS.bold,
          color: '#F44336', // 빨간색
          fontFamily: FONTS.primary,
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        {text}
      </div>
      {/* 오른쪽: 영어 피드백 텍스트 */}
      <div
        style={{
          fontSize: FONT_SIZES.md,
          fontWeight: FONT_WEIGHTS.normal,
          color: COLORS.dark,
          fontFamily: FONTS.primary,
          flex: 1,
        }}
      >
        {message}
      </div>
    </div>
  );
};

export default Feedback;
