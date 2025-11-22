import React, { useEffect, useState } from 'react';
import { FONTS, FONT_WEIGHTS } from '../styles/theme';
import { scaled } from '../styles/mixins';

interface CandyCrushProps {
  score: number | null;
  show?: boolean;
}

type ScoreGrade = 'bad' | 'good' | 'great' | 'divine' | null;

const CandyCrush: React.FC<CandyCrushProps> = ({ score, show = true }) => {
  const [grade, setGrade] = useState<ScoreGrade>(null);
  const [isVisible, setIsVisible] = useState(false);

  // 점수에 따른 등급 결정
  useEffect(() => {
    if (score === null || !show) {
      setGrade(null);
      setIsVisible(false);
      return;
    }

    let newGrade: ScoreGrade = null;
    if (score >= 90) {
      newGrade = 'divine';
    } else if (score >= 75) {
      newGrade = 'great';
    } else if (score >= 50) {
      newGrade = 'good';
    } else {
      newGrade = 'bad';
    }

    setGrade(newGrade);
    setIsVisible(true);

    // 3초 후 사라지기
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [score, show]);

  if (!grade || !isVisible) return null;

  const gradeConfig = {
    bad: {
      text: 'BAD',
      color: '#F44336', // 빨강
      shadowColor: 'rgba(244, 67, 54, 0.5)',
    },
    good: {
      text: 'GOOD',
      color: '#FF9800', // 주황
      shadowColor: 'rgba(255, 152, 0, 0.5)',
    },
    great: {
      text: 'GREAT',
      color: '#4CAF50', // 초록
      shadowColor: 'rgba(76, 175, 80, 0.5)',
    },
    divine: {
      text: 'DIVINE',
      color: '#FFD700', // 황금
      shadowColor: 'rgba(255, 215, 0, 0.5)',
    },
  };

  const config = gradeConfig[grade];

  return (
    <div
      style={{
        position: 'fixed',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        pointerEvents: 'none',
        animation: 'fadeInScale 0.5s ease-out',
      }}
    >
      <div
        style={{
          fontSize: scaled(100),
          fontWeight: FONT_WEIGHTS.extrabold,
          fontFamily: FONTS.primary,
          color: config.color,
          textShadow: `
            0 0 ${scaled(20)} ${config.shadowColor},
            0 0 ${scaled(40)} ${config.shadowColor},
            0 0 ${scaled(60)} ${config.shadowColor}
          `,
          letterSpacing: scaled(8),
          textAlign: 'center',
          whiteSpace: 'nowrap',
          animation: 'pulse 1s ease-in-out infinite',
        }}
      >
        {config.text}
      </div>
      <style>
        {`
          @keyframes fadeInScale {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.5);
            }
            50% {
              transform: translate(-50%, -50%) scale(1.1);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
        `}
      </style>
    </div>
  );
};

export default CandyCrush;
