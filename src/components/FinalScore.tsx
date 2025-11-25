import React from 'react';
import { FONTS, FONT_WEIGHTS } from '../styles/theme';
import { scaled } from '../styles/mixins';
import SejongGreat from '../assets/Sejong_Great.png';
import SejongSoso from '../assets/Sejong_Soso.png';
import SejongBad from '../assets/Sejong_Bad.png';

interface FinalScoreProps {
  score: number | null;
  show?: boolean;
}

// 별 컴포넌트
const Star: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div
    style={{
      position: 'absolute',
      width: '4px',
      height: '4px',
      backgroundColor: '#FFFFFF',
      borderRadius: '50%',
      boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
      animation: 'twinkle 2s ease-in-out infinite',
      ...style,
    }}
  />
);

const FinalScore: React.FC<FinalScoreProps> = ({ score, show = true }) => {
  if (!show || score === null) {
    return null;
  }

  // 점수에 따른 이미지와 색상 결정
  let sejongImage: string;
  let scoreColor: string;
  let gradientColors: string;
  if (score >= 80) {
    sejongImage = SejongGreat;
    scoreColor = '#4CAF50'; // 초록
    gradientColors =
      'radial-gradient(circle at center, rgba(255, 192, 203, 0.9), rgba(138, 43, 226, 0.8), rgba(30, 144, 255, 0.9))';
  } else if (score >= 60) {
    sejongImage = SejongSoso;
    scoreColor = '#FFC107'; // 노란
    gradientColors =
      'radial-gradient(circle at center, rgba(255, 192, 203, 0.7), rgba(255, 165, 0, 0.7), rgba(138, 43, 226, 0.7))';
  } else {
    sejongImage = SejongBad;
    scoreColor = '#F44336'; // 빨강
    gradientColors =
      'radial-gradient(circle at center, rgba(255, 0, 0, 0.6), rgba(139, 0, 0, 0.7), rgba(75, 0, 0, 0.8))';
  }

  // 별 위치 생성 (랜덤하게 배치)
  const stars = Array.from({ length: 50 }, () => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 2}s`,
  }));

  return (
    <>
      <style>
        {`
          @keyframes fadeInScale {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.5);
            }
            50% {
              transform: translate(-50%, -50%) scale(1.05);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }

          @keyframes twinkle {
            0%, 100% {
              opacity: 0.3;
              transform: scale(0.8);
            }
            50% {
              opacity: 1;
              transform: scale(1.2);
            }
          }

          @keyframes glow {
            0%, 100% {
              filter: brightness(1);
            }
            50% {
              filter: brightness(1.3);
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
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
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          pointerEvents: 'none',
          textAlign: 'center',
          animation: 'fadeInScale 0.8s ease-out',
          width: '90vw',
          maxWidth: '803.25px', // 카메라 너비와 동일
        }}
      >
        {/* 화려한 배경 박스 */}
        <div
          style={{
            position: 'relative',
            background: gradientColors,
            padding: `${scaled(50)} ${scaled(70)}`,
            borderRadius: scaled(30),
            width: '100%',
            minHeight: scaled(400),
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `
              0 0 ${scaled(40)} rgba(255, 192, 203, 0.6),
              0 0 ${scaled(80)} rgba(138, 43, 226, 0.4),
              0 ${scaled(20)} ${scaled(60)} rgba(0, 0, 0, 0.6)
            `,
            gap: scaled(50),
            overflow: 'hidden',
            border: `${scaled(3)} solid rgba(255, 255, 255, 0.3)`,
          }}
        >
          {/* 별 배경 */}
          {stars.map((star, index) => (
            <Star
              key={index}
              style={{
                top: star.top,
                left: star.left,
                animationDelay: star.animationDelay,
              }}
            />
          ))}

          {/* 세종대왕 이미지 (왼쪽) */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              animation: 'float 3s ease-in-out infinite',
            }}
          >
            <img
              src={sejongImage}
              alt="Sejong"
              style={{
                width: scaled(380), //배경 크기
                height: 'auto',
                objectFit: 'contain',
                flexShrink: 0,
                filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))',
                animation: 'glow 2s ease-in-out infinite',
                transform: 'scale(1.25) translate(0, 10%)', // 세종대왕 크기 배수로 키울 수 있음
                transformOrigin: 'bottom center',
              }}
            />
          </div>

          {/* 점수 영역 (오른쪽) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: scaled(15),
              position: 'relative',
              zIndex: 2,
              textAlign: 'center',
              minWidth: scaled(280),
            }}
          >
            {/* SCORE 라벨 */}
            <div
              style={{
                fontSize: scaled(32),
                fontWeight: FONT_WEIGHTS.extrabold,
                color: '#FFFFFF',
                fontFamily: FONTS.primary,
                textShadow: `
                  0 0 ${scaled(10)} rgba(255, 255, 255, 0.8),
                  0 0 ${scaled(20)} rgba(255, 255, 255, 0.5),
                  2px 2px 4px rgba(0, 0, 0, 0.5)
                `,
                letterSpacing: scaled(4),
              }}
            >
              SCORE
            </div>

            {/* 점수 텍스트 (큰 글씨) */}
            <div
              style={{
                fontSize: scaled(120),
                fontWeight: FONT_WEIGHTS.extrabold,
                color: scoreColor,
                fontFamily: FONTS.primary,
                textShadow: `
                  0 0 ${scaled(20)} ${scoreColor},
                  0 0 ${scaled(40)} ${scoreColor},
                  0 0 ${scaled(60)} ${scoreColor},
                  0 0 ${scaled(80)} ${scoreColor},
                  3px 3px 6px rgba(0, 0, 0, 0.8)
                `,
                lineHeight: 1.1,
                animation: 'pulse 1.5s ease-in-out infinite',
                WebkitTextStroke: `${scaled(4)} #FFFFFF`,
                WebkitTextFillColor: scoreColor,
                letterSpacing: scaled(2),
              }}
            >
              {Math.round(score)}
            </div>

            {/* Points 라벨 */}
            <div
              style={{
                fontSize: scaled(28),
                fontWeight: FONT_WEIGHTS.bold,
                color: '#FFFFFF',
                fontFamily: FONTS.primary,
                textShadow: `
                  0 0 ${scaled(8)} rgba(255, 255, 255, 0.8),
                  0 0 ${scaled(16)} rgba(255, 255, 255, 0.5),
                  2px 2px 4px rgba(0, 0, 0, 0.5)
                `,
                letterSpacing: scaled(2),
              }}
            >
              Points
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FinalScore;
