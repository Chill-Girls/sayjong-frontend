import React from 'react';
import { COLORS, FONTS, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS, Z_INDEX } from '../styles/theme';
import { flexColumn, scaled } from '../styles/mixins';
import {
  useSongTrainingHistory,
  type SongTrainingHistoryCardProps,
} from '../hooks/useSongTrainingHistory';
import { formatDate } from '../utils/dateUtils';

const SongTrainingHistoryCard: React.FC<SongTrainingHistoryCardProps> = ({
  isClick,
  onClose,
  songTitle,
  songArtist,
  sessions,
}) => {
  const { groupedRecords, sortedDates, isAnyLoading } = useSongTrainingHistory({
    sessions,
    isEnabled: isClick,
  });

  if (!isClick) return null;

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
                  marginTop: scaled(-10),
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
                marginTop: scaled(-10),
                fontFamily: FONTS.primary,
              }}
            >
              {/* Score History 추가 */}
              Score History
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
            {sessions.length === 0 && !isAnyLoading ? (
              <div
                style={
                  {
                    /* ... */
                  }
                }
              >
                No training records found.
              </div>
            ) : isAnyLoading && sessions.length === 0 ? (
              <div
                style={{
                  padding: scaled(40),
                  textAlign: 'center',
                  fontSize: scaled(20),
                  color: COLORS.dark,
                }}
              >
                <span role="img" aria-label="loading">
                  ⏳
                </span>{' '}
                Loading session data...
              </div>
            ) : (
              sortedDates.map(dateKey => {
                const combinedDetails = groupedRecords[dateKey];
                const isDateGroupLoading = isAnyLoading;

                combinedDetails.sort(
                  (a, b) => new Date(b.scoredAt).getTime() - new Date(a.scoredAt).getTime(),
                );

                return (
                  // 날짜별 그룹 컨테이너
                  <div key={dateKey} style={{ ...flexColumn, gap: scaled(1) }}>
                    {/* 날짜 헤더 (YYYY.MM.DD) */}
                    <div
                      style={{
                        padding: `${scaled(16)} ${scaled(24)}`,
                        backgroundColor: COLORS.background,
                        borderRadius: BORDER_RADIUS.md,
                        marginBottom: scaled(8),
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: `1px solid ${COLORS.gray}`,
                        boxShadow: SHADOWS.card,
                      }}
                    >
                      <div
                        style={{
                          fontSize: scaled(22),
                          fontWeight: FONT_WEIGHTS.bold,
                          color: COLORS.dark,
                          fontFamily: FONTS.primary,
                        }}
                      >
                        {dateKey}
                      </div>
                      <div
                        style={{
                          fontSize: scaled(18),
                          fontWeight: FONT_WEIGHTS.semibold,
                          color: COLORS.textSecondary,
                        }}
                      >
                        Records: {combinedDetails.length}
                      </div>
                    </div>

                    {/* 상세 점수 목록 영역 */}
                    <div
                      style={{
                        width: '100%',
                        padding: `${scaled(0)} ${scaled(16)}`,
                        backgroundColor: COLORS.white,
                      }}
                    >
                      <div
                        style={{
                          maxHeight: scaled(250),
                          overflowY: 'auto',
                          paddingRight: scaled(10),
                          ...flexColumn,
                          gap: scaled(8),
                          fontFamily: FONTS.primary,
                        }}
                      >
                        {isDateGroupLoading ? (
                          <div
                            style={{
                              color: COLORS.textSecondary,
                              textAlign: 'center',
                              padding: scaled(10),
                            }}
                          >
                            Loading records...
                          </div>
                        ) : combinedDetails.length > 0 ? (
                          combinedDetails.map(d => (
                            // 상세 점수 항목 - 개별 박스 스타일 적용
                            <div
                              key={d.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: `${scaled(8)} ${scaled(10)}`,
                                backgroundColor: COLORS.white,
                                borderRadius: BORDER_RADIUS.sm,
                                border: `1px solid ${COLORS.gray}`,
                                boxShadow: SHADOWS.light,
                              }}
                            >
                              {/* Training Time: HH:mm 형식 */}
                              <div style={{ color: COLORS.textSecondary, fontSize: scaled(16) }}>
                                Training Time: {formatDate(d.scoredAt, 'HH:mm')}
                              </div>
                              {/* 점수 */}
                              <div
                                style={{
                                  fontWeight: FONT_WEIGHTS.bold,
                                  color: COLORS.primary,
                                  fontSize: scaled(20),
                                }}
                              >
                                {Number(d.score).toFixed(0)}%
                              </div>
                            </div>
                          ))
                        ) : (
                          <div
                            style={{
                              color: COLORS.textSecondary,
                              textAlign: 'center',
                              padding: scaled(10),
                            }}
                          >
                            No detailed records found for {dateKey}.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SongTrainingHistoryCard;
