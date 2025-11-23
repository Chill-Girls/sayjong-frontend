import React, { useState, useCallback } from 'react';
import { COLORS, FONTS, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS, Z_INDEX } from '../styles/theme';
import { flexColumn, scaled } from '../styles/mixins';
import type { SongTrainingHistoryCardProps } from '../hooks/useSongTrainingHistory';
import { formatDate } from '../utils/dateUtils';
import { getScoreHistoryBySessionId } from '../api/scores'; 
import type { ScoreHistory } from '../api/scores/types'; 

const DATE_ONLY_FORMAT = 'YYYY.MM.DD';

const SongTrainingHistoryCard: React.FC<SongTrainingHistoryCardProps> = ({
  isClick,
  onClose,
  songTitle,
  songArtist,
  sessions,
}) => {
  if (!isClick) return null;

  const [detailsMap, setDetailsMap] = useState<Record<number, ScoreHistory[]>>({});
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  // 모든 세션의 상세 기록을 로드하는 함수
  const loadAllSessionDetails = useCallback(async () => {
    if (isDataLoaded) return;
    setIsDataLoaded(true);

    const newDetails: Record<number, ScoreHistory[]> = {};
    const newLoading: Record<number, boolean> = {};
    const uniqueIds = Array.from(
      new Set(
        sessions.map(s => {
          if (typeof (s as any).sessionId === 'number' && (s as any).sessionId > 0) return (s as any).sessionId;
          const anyS = s as any;
          if (typeof anyS.id === 'number' && anyS.id > 0) return anyS.id;
          if (typeof anyS.sessionNo === 'number' && anyS.sessionNo > 0) return anyS.sessionNo;
          return null;
        })
      )
    ).filter((v): v is number => v !== null && v !== undefined);

    const requests = uniqueIds.map(async (sessionId) => {
      if (typeof sessionId !== 'number' || sessionId <= 0) {
        console.warn('Skipping invalid sessionId:', sessionId);
        return;
      }
      newLoading[sessionId] = true;
      try {
        const details = await getScoreHistoryBySessionId(sessionId);
        newDetails[sessionId] = details || [];
      } catch (err) {
        console.error(`🚨 Failed to load score history for session ${sessionId}:`, err);
        newDetails[sessionId] = [];
      } finally {
        newLoading[sessionId] = false;
      }
     });

     await Promise.all(requests);
     
     setDetailsMap(newDetails);
     setLoadingMap(newLoading);
     
   }, [sessions, isDataLoaded]);

  // sessions가 있을 때 상세 기록 로드 시작
  React.useEffect(() => {
    if (sessions.length > 0 && isClick) {
      loadAllSessionDetails();
    }
  }, [sessions, isClick, loadAllSessionDetails]);
  
  const isAnyLoading = Object.values(loadingMap).some(loading => loading);

  let allScoreDetails: ScoreHistory[] = [];

  allScoreDetails = Object.values(detailsMap)
    .flatMap(details => {
      return (details && Array.isArray(details)) ? details : [];
    });
  
  // 통합된 상세 기록을 날짜 기준(DATE_ONLY_FORMAT)으로 그룹화
  const finalGroupedRecords: Record<string, ScoreHistory[]> = allScoreDetails.reduce((acc, record) => {
    const dateKey = formatDate(record.scoredAt, DATE_ONLY_FORMAT);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(record);
    return acc;
  }, {} as Record<string, ScoreHistory[]>);

  // 날짜를 내림차순으로 정렬
  const finalSortedDates = Object.keys(finalGroupedRecords).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
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
              <div style={{ /* ... */ }}>No training records found.</div>
            ) : isAnyLoading && sessions.length === 0 ? (
              <div style={{ padding: scaled(40), textAlign: 'center', fontSize: scaled(20), color: COLORS.dark }}>
                <span role="img" aria-label="loading">⏳</span> Loading session data...
              </div>
            ) : (
              finalSortedDates.map(dateKey => {
                const combinedDetails = finalGroupedRecords[dateKey]; 
                const isDateGroupLoading = isAnyLoading; 

                combinedDetails.sort((a, b) => new Date(b.scoredAt).getTime() - new Date(a.scoredAt).getTime());


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
                      <div style={{ fontSize: scaled(22), fontWeight: FONT_WEIGHTS.bold, color: COLORS.dark, fontFamily: FONTS.primary }}>
                        {dateKey}
                      </div>
                       <div style={{ fontSize: scaled(18), fontWeight: FONT_WEIGHTS.semibold, color: COLORS.textSecondary }}>
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
                          <div style={{ color: COLORS.textSecondary, textAlign: 'center', padding: scaled(10) }}>
                            Loading records...
                          </div>
                        ) : combinedDetails.length > 0 ? (
                          combinedDetails.map((d) => (
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
                              <div style={{ fontWeight: FONT_WEIGHTS.bold, color: COLORS.primary, fontSize: scaled(20) }}>
                                {Number(d.score).toFixed(0)}%
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: COLORS.textSecondary, textAlign: 'center', padding: scaled(10) }}>No detailed records found for {dateKey}.</div>
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