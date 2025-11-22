import React from 'react';
import { COLORS, FONTS, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS, Z_INDEX } from '../styles/theme';
import { flexColumn, scaled } from '../styles/mixins';
import type { SongTrainingHistoryCardProps } from '../hooks/useSongTrainingHistory';

const SongTrainingHistoryCard: React.FC<SongTrainingHistoryCardProps> = ({
  isClick,
  onClose,
  songTitle,
  songArtist,
  sessions,
}) => {
  if (!isClick) return null;

  // 날짜 형식 변환 함수
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // 날짜 순 정렬
  const sortedSessions = [...sessions].sort((a, b) => {
    return new Date(b.lastPlayedAt).getTime() - new Date(a.lastPlayedAt).getTime();
  });

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: Z_INDEX.modal,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* 카드 크기 */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: scaled(800),
            maxHeight: '80vh',
            backgroundColor: COLORS.white,
            borderRadius: BORDER_RADIUS.xl,
            boxShadow: SHADOWS.card,
            padding: `${scaled(40)} ${scaled(45)}`,
            display: 'flex',
            flexDirection: 'column',
            gap: scaled(30),
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* 헤더 */}
          <div style={{ ...flexColumn, gap: scaled(8) }}>
            <div
              style={{
                fontSize: scaled(32),
                fontWeight: FONT_WEIGHTS.semibold,
                color: COLORS.dark,
                letterSpacing: scaled(-0.02),
                fontFamily: FONTS.primary,
              }}
            >
              {songTitle}
            </div>
            {songArtist && (
              <div
                style={{
                  fontSize: scaled(24),
                  fontWeight: FONT_WEIGHTS.semibold,
                  color: COLORS.textSecondary,
                  letterSpacing: scaled(-0.02),
                  fontFamily: FONTS.primary,
                }}
              >
                {songArtist}
              </div>
            )}
            <div
              style={{
                fontSize: scaled(20),
                fontWeight: FONT_WEIGHTS.normal,
                color: COLORS.textSecondary,
                marginTop: scaled(4),
                fontFamily: FONTS.primary,
              }}
            >
              Total {sessions.length} sessions
            </div>
          </div>

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: scaled(20),
              right: scaled(20),
              width: scaled(40),
              height: scaled(40),
              borderRadius: '50%',
              border: 'none',
              backgroundColor: COLORS.background,
              color: COLORS.dark,
              fontSize: scaled(24),
              fontWeight: FONT_WEIGHTS.semibold,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONTS.primary,
            }}
          >
            ×
          </button>

          {/* Training records list */}
          <div
            style={{
              ...flexColumn,
              gap: scaled(16),
              overflowY: 'auto',
              paddingRight: scaled(10),
              maxHeight: '60vh',
            }}
          >
            {sortedSessions.length === 0 ? (
              <div
                style={{
                  padding: scaled(40),
                  textAlign: 'center',
                  fontSize: scaled(20),
                  color: COLORS.textSecondary,
                  fontFamily: FONTS.primary,
                }}
              >
                No training records found.
              </div>
            ) : (
              sortedSessions.map(session => (
                <div
                  key={session.sessionId}
                  style={{
                    width: '100%',
                    padding: `${scaled(20)} ${scaled(24)}`,
                    borderRadius: BORDER_RADIUS.md,
                    backgroundColor: COLORS.background,
                    border: `1px solid ${COLORS.gray}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ ...flexColumn, gap: scaled(6) }}>
                    <div
                      style={{
                        fontSize: scaled(22),
                        fontWeight: FONT_WEIGHTS.semibold,
                        color: COLORS.dark,
                        fontFamily: FONTS.primary,
                      }}
                    >
                      {formatDate(session.lastPlayedAt)}
                    </div>
                    <div
                      style={{
                        fontSize: scaled(18),
                        fontWeight: FONT_WEIGHTS.normal,
                        color: COLORS.textSecondary,
                        fontFamily: FONTS.primary,
                      }}
                    >
                      Training Date
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: scaled(30),
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ ...flexColumn, alignItems: 'flex-end', gap: scaled(4) }}>
                      <div
                        style={{
                          fontSize: scaled(20),
                          fontWeight: FONT_WEIGHTS.semibold,
                          color: COLORS.dark,
                          fontFamily: FONTS.primary,
                        }}
                        >
                          Average Score
                        </div>
                      <div
                        style={{
                          fontSize: scaled(28),
                          fontWeight: FONT_WEIGHTS.extrabold,
                          color: COLORS.primary,
                          fontFamily: FONTS.primary,
                        }}
                      >
                        {session.averageScore}%
                      </div>
                    </div>
                    <div style={{ ...flexColumn, alignItems: 'flex-end', gap: scaled(4) }}>
                      <div
                        style={{
                          fontSize: scaled(20),
                          fontWeight: FONT_WEIGHTS.semibold,
                          color: COLORS.dark,
                          fontFamily: FONTS.primary,
                        }}
                        >
                          Best Score
                        </div>
                      <div
                        style={{
                          fontSize: scaled(28),
                          fontWeight: FONT_WEIGHTS.extrabold,
                          color: COLORS.primary,
                          fontFamily: FONTS.primary,
                        }}
                      >
                        {session.bestScore}%
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SongTrainingHistoryCard;

