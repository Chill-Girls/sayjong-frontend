import type { FunctionComponent } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CameraComponent from '../components/CameraComponent';
import KaraokeLine from '../components/KaraokeLine';
import { useKaraoke } from '../hooks/useKaraoke';
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS } from '../styles/theme';
import { useMode } from '../constants/ModeContext';
import { containerFullscreen, flexColumn, scaled } from '../styles/mixins';

type SingAlongProps = object;

const SingAlong: FunctionComponent<SingAlongProps> = () => {
  const { setMode } = useMode();
  useEffect(() => {
    setMode('singalong');
    return () => setMode(null);
  }, [setMode]);

  const { songId } = useParams();
  const songIdNum = songId ? (Number.isNaN(Number(songId)) ? null : Number(songId)) : null;
  const { songInfo, playback, lyrics, overlay, isLoading, error } = useKaraoke(songIdNum);
  const { isPlaying: isPlaybackPlaying, isPaused: isPlaybackPaused, playOverlayOnly } = playback;

  const activeSyllableFromIndex = useMemo(() => {
    if (!lyrics.currentLine || lyrics.activeSyllableIndex === null) {
      return null;
    }
    return lyrics.currentLine.syllables[lyrics.activeSyllableIndex]?.text ?? null;
  }, [lyrics.activeSyllableIndex, lyrics.currentLine]);

  const activeSyllable = overlay.currentSyllable ?? activeSyllableFromIndex;
  const activeVowel = overlay.currentVowel ?? null;
  const isOverlayActive = isPlaybackPlaying;

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
        <Footer />
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
            fontSize: FONT_SIZES.lg,
            fontWeight: FONT_WEIGHTS.light,
            textAlign: 'left',
            margin: 0,
          }}
        >
          "{songInfo.title || 'Song Not Found'} - {songInfo.singer || '...'}"
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
          />
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
              fontWeight: FONT_WEIGHTS.medium,
              cursor: 'pointer',
            }}
          >
            {isPlaybackPlaying ? 'restart' : isPlaybackPaused ? 'resume' : 'start'}
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
              fontWeight: FONT_WEIGHTS.medium,
              cursor: 'pointer',
            }}
          >
            pause
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SingAlong;
