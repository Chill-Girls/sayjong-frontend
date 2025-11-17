import type { FunctionComponent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import FooterCopyright from '../components/FooterCopyright';
import CameraComponent from '../components/CameraComponent';
import KaraokeLine from '../components/KaraokeLine';
import VowelFeedback from '../components/VowelFeedback';
import { useKaraoke } from '../hooks/useKaraoke';
import { useScoreRecords } from '../hooks/useScoreRecords';
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from '../styles/theme';
import { useMode } from '../constants/ModeContext';
import { containerFullscreen, flexColumn, scaled } from '../styles/mixins';

type SingAlongProps = object;

const SingAlong: FunctionComponent<SingAlongProps> = () => {
  const { setMode } = useMode();
  const navigate = useNavigate();
  useEffect(() => {
    setMode('singalong');
    return () => setMode(null);
  }, [setMode]);

  const { songId } = useParams();
  const songIdNum = songId ? (Number.isNaN(Number(songId)) ? null : Number(songId)) : null;
  const { songInfo, playback, lyrics, overlay, isLoading, error } = useKaraoke(songIdNum);
  const { isPlaying: isPlaybackPlaying, isPaused: isPlaybackPaused, playOverlayOnly } = playback;
  const { saveScore } = useScoreRecords();

  const activeSyllableFromIndex = useMemo(() => {
    if (!lyrics.currentLine || lyrics.activeSyllableIndex === null) {
      return null;
    }
    return lyrics.currentLine.syllables[lyrics.activeSyllableIndex]?.text ?? null;
  }, [lyrics.activeSyllableIndex, lyrics.currentLine]);

  const activeSyllable = overlay.currentSyllable ?? activeSyllableFromIndex;
  const activeVowel = overlay.currentVowel ?? null;
  const isOverlayActive = isPlaybackPlaying;

  const flagAccumulatorRef = useRef<number>(0);
  const mouthScoreRef = useRef<number | null>(null);
  const totalVowelCountRef = useRef<number>(0);

  // currentBlendshapes 상태
  const [currentBlendshapes, setCurrentBlendshapes] = useState<Record<string, number> | null>(null);
  // lyricChars (가사 글자 배열)
  const lyricChars = useMemo(() => {
    if (!lyrics.currentLine) return [];
    return lyrics.currentLine.textOriginal.split('');
  }, [lyrics.currentLine]);
  // CameraComponent에서 blendshapes 받기
  const handleCameraResults = useCallback(
    (results: { landmarks?: any[]; blendshapes?: Record<string, number> }) => {
      if (results.blendshapes) {
        setCurrentBlendshapes(results.blendshapes);
      }
    },
    [],
  );

  // 최종 점수 표시 상태
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const scoreSavedRef = useRef<boolean>(false); // 점수 저장 여부 추적

  // 노래가 끝났을 때 점수 계산 및 표시
  const prevIsPlayingRef = useRef<boolean>(false);
  useEffect(() => {
    const wasPlaying = prevIsPlayingRef.current;
    const isNowPlaying = isPlaybackPlaying;

    // 재생이 멈췄을 때 (노래가 끝났을 때)
    if (wasPlaying && !isNowPlaying && mouthScoreRef.current !== null) {
      const scorePercentage = mouthScoreRef.current * 100;
      const roundedScore = Math.round(scorePercentage);
      // 점수 표시
      setFinalScore(roundedScore);

      // 점수를 데이터베이스에 저장
      if (songIdNum && !scoreSavedRef.current) {
        scoreSavedRef.current = true;
        saveScore({
          score: roundedScore,
          songId: songIdNum,
        }).catch(err => {
          console.error('Failed to save score:', err);
        });
      }
    }

    // 재생이 시작될 때 점수 숨기기 및 저장 플래그 리셋
    if (!wasPlaying && isNowPlaying) {
      setFinalScore(null);
      scoreSavedRef.current = false;
    }

    prevIsPlayingRef.current = isNowPlaying;
  }, [isPlaybackPlaying, songIdNum, saveScore]);

  const handleCountdownComplete = useCallback(() => {
    if (!isPlaybackPlaying) {
      playOverlayOnly();
    }
  }, [isPlaybackPlaying, playOverlayOnly]);

  if (isLoading) {
    return (
      <div
        style={{
          ...containerFullscreen,
          padding: `${scaled(12)} 0`,
          paddingTop: scaled(55.5),
          paddingBottom: scaled(80),
          gap: scaled(24.75),
          textAlign: 'left',
          fontSize: FONT_SIZES.lg,
          color: COLORS.dark,
          fontFamily: FONTS.primary,
        }}
      >
        <Header />
        <div
          style={{
            ...flexColumn,
            alignItems: 'center',
            gap: scaled(6),
            fontSize: FONT_SIZES.xl,
          }}
        >
          <div
            style={{
              position: 'relative',
              fontWeight: FONT_WEIGHTS.medium,
              margin: 0,
            }}
          >
            Loading song...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          ...containerFullscreen,
          padding: `${scaled(12)} 0`,
          paddingTop: scaled(55.5),
          paddingBottom: scaled(80),
          gap: scaled(24.75),
          textAlign: 'left',
          fontSize: FONT_SIZES.lg,
          color: COLORS.dark,
          fontFamily: FONTS.primary,
        }}
      >
        <Header />
        <div
          style={{
            ...flexColumn,
            alignItems: 'center',
            gap: scaled(6),
            fontSize: FONT_SIZES.xl,
          }}
        >
          <div
            style={{
              position: 'relative',
              fontWeight: FONT_WEIGHTS.medium,
              margin: 0,
            }}
          >
            {error}
          </div>
        </div>
        <FooterCopyright />
      </div>
    );
  }

  return (
    <div
      style={{
        ...containerFullscreen,
        overflow: 'hidden',
        padding: `${scaled(12)} 0`,
        paddingTop: scaled(55.5),
        paddingBottom: scaled(80),
        gap: scaled(24.75),
        textAlign: 'left',
        fontSize: FONT_SIZES.lg,
        color: COLORS.dark,
        fontFamily: FONTS.primary,
      }}
    >
      <Header />

      {/* 간격 div */}
      <div
        style={{
          width: scaled(15),
          height: scaled(15),
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          zIndex: 1,
        }}
      />

      {/* 타이틀 섹션 */}
      <div
        style={{
          width: '100%',
          ...flexColumn,
          alignItems: 'center',
          gap: scaled(6),
          zIndex: 2,
          textAlign: 'center',
          fontSize: FONT_SIZES.xl,
        }}
      >
        <div
          style={{
            position: 'relative',
            fontSize: FONT_SIZES.xxl,
            fontWeight: FONT_WEIGHTS.bold,
            color: COLORS.primary,
            textAlign: 'left',
            margin: 0,
          }}
        >
          {songInfo.title || 'Song Not Found'} - {songInfo.singer || '...'}
        </div>
      </div>

      {/* 가사 & 카메라 */}
      <div
        style={{
          ...flexColumn,
          alignItems: 'center',
          gap: scaled(12),
          zIndex: 3,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '803.25px',
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <CameraComponent // 오버레이 설정도 여기서
            width="803.25px"
            activeSyllable={isOverlayActive ? activeSyllable : null}
            activeVowel={isOverlayActive ? activeVowel : null}
            shouldStartOverlay={isOverlayActive}
            onCountdownComplete={handleCountdownComplete}
            skipCountdown={true}
            onResults={handleCameraResults}
          />
          {/* 최종 점수 표시 UI */}
          {finalScore !== null && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                pointerEvents: 'none',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  backgroundColor: 'transparent',
                  padding: `${scaled(40)} ${scaled(60)}`,
                  borderRadius: scaled(20),
                  minWidth: scaled(300),
                }}
              >
                <div
                  style={{
                    fontSize: scaled(96),
                    fontWeight: FONT_WEIGHTS.bold,
                    color: finalScore >= 80 ? '#4CAF50' : finalScore >= 60 ? '#FFC107' : '#F44336',
                    textShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
                    marginBottom: scaled(10),
                  }}
                >
                  {finalScore} Points
                </div>
                <div
                  style={{
                    fontSize: scaled(32),
                    fontWeight: FONT_WEIGHTS.bold,
                    color: COLORS.primary,
                    textShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  Final Score
                </div>
              </div>
            </div>
          )}
          {/* VowelFeedback (숨김 처리) */}
          <div style={{ display: 'none' }}>
            <VowelFeedback
              activeVowel={isOverlayActive ? activeVowel : null}
              currentBlendshapes={currentBlendshapes}
              currentIndex={lyrics.activeSyllableIndex}
              lyricChars={lyricChars}
              feedbackItems={[]}
              shouldDisplay={false}
              resetKey={songIdNum ?? undefined}
              flagAccumulatorRef={flagAccumulatorRef}
              mouthScoreRef={mouthScoreRef}
              totalVowelCountRef={totalVowelCountRef}
              isActive={isOverlayActive}
            />
          </div>
          <div // 가사 오버레이 위치
            style={{
              position: 'absolute',
              left: '50%',
              bottom: scaled(36),
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: '760px',
              pointerEvents: 'none',
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <KaraokeLine lyrics={lyrics} />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: scaled(8),
          }}
        >
          <button
            type="button"
            onClick={playback.play}
            style={{
              padding: `${scaled(4)} ${scaled(10)}`,
              borderRadius: scaled(6),
              border: 'none',
              background: COLORS.primary,
              color: COLORS.white,
              fontSize: scaled(20),
              fontWeight: FONT_WEIGHTS.semibold,
              fontFamily: FONTS.primary,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {isPlaybackPlaying ? 'RESTART' : isPlaybackPaused ? 'RESUME' : 'START'}
          </button>
          <button
            type="button"
            onClick={playback.pause}
            style={{
              padding: `${scaled(4)} ${scaled(10)}`,
              borderRadius: scaled(6),
              border: `1px solid ${COLORS.primary}`,
              background: 'transparent',
              color: COLORS.primary,
              fontSize: scaled(20),
              fontWeight: FONT_WEIGHTS.semibold,
              fontFamily: FONTS.primary,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            PAUSE
          </button>
        </div>
      </div>

      {/* 종료 버튼 - 우측 하단 */}
      <button
        onClick={() => {
          if (songIdNum) {
            navigate(`/lesson/${songIdNum}`);
          }
        }}
        style={{
          position: 'fixed',
          bottom: scaled(100),
          right: scaled(50),
          zIndex: 1000,
          padding: `${scaled(12)} ${scaled(24)}`,
          backgroundColor: COLORS.primary,
          color: COLORS.white,
          border: 'none',
          borderRadius: BORDER_RADIUS.md,
          cursor: 'pointer',
          fontSize: scaled(16),
          fontWeight: FONT_WEIGHTS.semibold,
          fontFamily: FONTS.primary,
          outline: 'none',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = COLORS.primary;
          e.currentTarget.style.opacity = '0.9';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = COLORS.primary;
          e.currentTarget.style.opacity = '1';
        }}
        aria-label="연습 종료 및 레슨 모드로 돌아가기"
      >
        END
      </button>

      <FooterCopyright />
    </div>
  );
};
export default SingAlong;
