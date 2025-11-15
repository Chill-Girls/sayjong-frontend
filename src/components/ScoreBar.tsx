import React from 'react';
import { COLORS, FONT_WEIGHTS, BORDER_RADIUS } from '../styles/theme';
import { flexColumn, scaled } from '../styles/mixins';

interface ScoreBarProps {
  isLoading: boolean;
  score: number | null;
  mouthScore: number | null;
}

const ScoreBar: React.FC<ScoreBarProps> = ({ isLoading, score, mouthScore }) => {
  // Calculate score to display
  let displayScore: number | null = null;
  let showCalculating = false;

  if (isLoading) {
    showCalculating = true;
  } else if (score !== null && mouthScore !== null) {
    // 최종 점수 계산: (입모양 점수 * 100 * 0.4) + (소리 AI 서버 점수 * 0.6)
    const mouthScorePercentage = mouthScore * 100;
    const finalScore = mouthScorePercentage * 0.4 + score * 0.6;
    displayScore = Math.round(finalScore);
  } else if (score !== null) {
    displayScore = score;
  }

  const scorePercentage = displayScore !== null ? Math.min(100, Math.max(0, displayScore)) : 0;

  return (
    <div
      style={{
        width: '100%',
        ...flexColumn,
        alignItems: 'flex-end',
        gap: scaled(8),
        marginTop: scaled(12),
        paddingTop: scaled(12),
      }}
    >
      <div
        style={{
          width: '100%',
          height: scaled(24),
          backgroundColor: COLORS.background,
          borderRadius: BORDER_RADIUS.lg,
          overflow: 'hidden',
          position: 'relative',
          outline: `${scaled(1)} solid ${COLORS.primary}`,
          outlineColor: COLORS.primary,
        }}
      >
        {scorePercentage > 0 && !showCalculating && (
          <div
            style={{
              width: `${scorePercentage}%`,
              height: '100%',
              backgroundColor:
                scorePercentage >= 80
                  ? '#4CAF50'
                  : scorePercentage >= 60
                    ? '#FFC107'
                    : '#F44336',
              borderRadius: BORDER_RADIUS.lg,
              transition: 'width 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: scaled(8),
            }}
          >
            {scorePercentage > 15 && (
              <span
                style={{
                  fontSize: scaled(14),
                  fontWeight: FONT_WEIGHTS.semibold,
                  color: COLORS.white,
                }}
              >
                {scorePercentage}%
              </span>
            )}
          </div>
        )}
        {scorePercentage <= 15 && displayScore !== null && !showCalculating && (
          <div
            style={{
              position: 'absolute',
              left: scaled(8),
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: scaled(14),
              fontWeight: FONT_WEIGHTS.semibold,
              color: COLORS.primary,
            }}
          >
            {scorePercentage}%
          </div>
        )}
        {showCalculating && (
          <div
            style={{
              position: 'absolute',
              left: scaled(8),
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: scaled(14),
              fontWeight: FONT_WEIGHTS.semibold,
              color: COLORS.primary,
            }}
          >
            Calculating...
          </div>
        )}
        {displayScore === null && !showCalculating && (
          <div
            style={{
              position: 'absolute',
              left: scaled(8),
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: scaled(14),
              fontWeight: FONT_WEIGHTS.semibold,
              color: COLORS.primary,
            }}
          >
            0%
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreBar;

