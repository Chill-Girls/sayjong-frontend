import type { FunctionComponent } from 'react';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CameraComponent from '../components/CameraComponent';
import LyricsCanvasOverlay from '../components/LyricsCanvasOverlay';
import { useSong, useSongLyricLines } from '../hooks/useSongs';
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS } from '../styles/theme';
import { useMode } from '../constants/ModeContext';
import { containerFullscreen, flexColumn, scaled } from '../styles/mixins';
import { useTts } from '../hooks/useTts';
import type { TtsMark } from '../api/songs/types';

type SingAlongProps = object;

const SingAlong: FunctionComponent<SingAlongProps> = () => {
  const { setMode } = useMode();
  useEffect(() => {
    setMode('singalong');
    return () => setMode(null);
  }, [setMode]);

  const { songId } = useParams();
  const songIdNum = songId ? (Number.isNaN(Number(songId)) ? null : Number(songId)) : null;
  const { song, loading } = useSong(songIdNum);
  const { lyricData, loading: lyricLoading, error: lyricError } = useSongLyricLines(songIdNum);

  const lyricLines = useMemo(() => lyricData?.lyrics ?? [], [lyricData]);

  const ttsTimeline = useMemo(() => {
    const marks: TtsMark[] = [];
    const meta: { lineIndex: number; syllableIndex: number }[] = [];

    lyricLines.forEach((line, lineIndex) => {
      line.syllableTimings.forEach((mark, syllableIndex) => {
        marks.push(mark);
        meta.push({ lineIndex, syllableIndex });
      });
    });

    return { marks, meta };
  }, [lyricLines]);

  const { currentIndex, isPlaying, playOverlayOnly, stop } = useTts({
    syllableTimings: ttsTimeline.marks,
    audioUrl: null,
  });

  const activeMeta = typeof currentIndex === 'number' ? ttsTimeline.meta[currentIndex] : null;
  const activeLineIndex =
    typeof activeMeta?.lineIndex === 'number'
      ? activeMeta.lineIndex
      : lyricLines.length > 0
        ? 0
        : null;
  const activeSyllableIndex = activeMeta?.syllableIndex ?? null;

  const karaokeLine = useMemo(() => {
    if (activeLineIndex === null) {
      return null;
    }

    const targetLine = lyricLines[activeLineIndex];
    if (!targetLine) {
      return null;
    }

    const syllables = targetLine.syllableTimings.map((mark, index, arr) => ({
      text: (mark.markName ?? '').trim(),
      start: mark.timeSeconds,
      end: index < arr.length - 1 ? arr[index + 1].timeSeconds : mark.timeSeconds + 0.6,
    }));

    return {
      textOriginal: targetLine.originalText,
      startTime: syllables[0]?.start ?? 0,
      endTime: syllables[syllables.length - 1]?.end ?? 0,
      syllables,
    };
  }, [activeLineIndex, lyricLines]);

  if (loading || lyricLoading) {
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

  if (lyricError) {
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
            {lyricError}
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
          "{song?.title || 'Song Not Found'} - {song?.singer || '...'}"
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
          <LyricsCanvasOverlay line={karaokeLine} activeIndex={activeSyllableIndex} />
          <CameraComponent width="803.25px" />
        </div>

        <div
          style={{
            display: 'flex',
            gap: scaled(8),
          }}
        >
          <button
            type="button"
            onClick={playOverlayOnly}
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
            {isPlaying ? '다시 재생' : '오버레이 재생'}
          </button>
          <button
            type="button"
            onClick={stop}
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
            정지
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SingAlong;
