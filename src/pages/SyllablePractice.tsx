import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CameraComponent from '../components/CameraComponent';
import BtnPrev from '../components/Btn_prev';
import BtnNext from '../components/Btn_next';
import BtnMic from '../components/Btn_Mic';
import { COLORS, FONTS, FONT_WEIGHTS, BORDER_RADIUS } from '../styles/theme';
import { containerFullscreen, flexColumn, scaled } from '../styles/mixins';
import { useMode } from '../constants/ModeContext';
import { useRecording } from '../constants/RecordingContext';
import { extractVowel } from '../utils/hangul';
import { useSongLyricLines } from '../hooks/useSongs';
import { useSyllablePractice, type PracticeSyllable } from '../hooks/useSyllablePractice';
import type { LyricLine } from '../api/songs/types';

const SyllablePractice: React.FC = () => {
  const { setMode } = useMode();
  const { isRecording, setIsRecording, setRecordedAudioBlob } = useRecording();
  const navigate = useNavigate();
  const { songId: songIdParam, page: pageParam } = useParams<{ songId: string; page?: string }>();
  const initialIndex = useMemo(() => {
    if (!pageParam) return 0;
    const maybeNum = Number(pageParam);
    return Number.isNaN(maybeNum) ? 0 : Math.max(maybeNum, 0);
  }, [pageParam]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const songId = useMemo(
    () => (songIdParam ? (Number.isNaN(Number(songIdParam)) ? null : Number(songIdParam)) : null),
    [songIdParam],
  );

  const DEFAULT_TITLE = 'soda pop';
  const DEFAULT_SINGER = 'sjajboys';

  const { lyricData, loading: lyricLoading, error: lyricError } = useSongLyricLines(songId);
  const [songTitle, setSongTitle] = useState<string>(DEFAULT_TITLE);
  const [singer, setSinger] = useState<string>(DEFAULT_SINGER);
  const [lyricLines, setLyricLines] = useState<LyricLine[]>([]);
  const [activeLine, setActiveLine] = useState<LyricLine | null>(null);
  const { syllables, loading: syllableLoading, error: syllableError } = useSyllablePractice(songId);
  const loading = lyricLoading || syllableLoading;
  const error = lyricError || syllableError;
  const currentData = useMemo<PracticeSyllable | null>(
    () => (syllables.length > 0 ? syllables[currentIndex % syllables.length] : null),
    [currentIndex, syllables],
  );
  const currentSyllable = currentData?.textKor ?? '';
  const currentRomaja = currentData?.textRomaja ?? '';
  const currentVowel = useMemo(() => extractVowel(currentSyllable), [currentSyllable]);
  const practiceLineText = useMemo(() => {
    if (!currentData) return '';
    const sameLine = syllables.filter(syllable => syllable.lineNo === currentData.lineNo);
    if (sameLine.length === 0) return '';
    return sameLine.map(syllable => syllable.textKor).join('');
  }, [currentData, syllables]);
  const activeLineText = useMemo(() => {
    if (activeLine) return activeLine.originalText ?? '';
    if (lyricLines.length > 0) return lyricLines[0].originalText ?? '';
    return '';
  }, [activeLine, lyricLines]);
  const cameraContainerRef = useRef<HTMLDivElement>(null);
  const [cameraWidth, setCameraWidth] = useState<string>(scaled(600));

  useEffect(() => {
    setMode('syllable');
    return () => setMode(null);
  }, [setMode]);

  useEffect(() => {
    if (lyricData) {
      setSongTitle(lyricData.title ?? DEFAULT_TITLE);
      setSinger(lyricData.singer ?? DEFAULT_SINGER);
      setLyricLines(lyricData.lyrics ?? []);
    } else if (lyricError || !songId) {
      setSongTitle(DEFAULT_TITLE);
      setSinger(DEFAULT_SINGER);
      setLyricLines([]);
    }
  }, [lyricData, lyricError, songId]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (!currentData) {
      setActiveLine(null);
      return;
    }
    const matchedLine =
      lyricLines.find(line => line.lineNo === currentData.lineNo) ??
      lyricLines.find(line => line.lyricLineId === currentData.lineNo) ??
      null;
    setActiveLine(matchedLine);
  }, [currentData, lyricLines]);

  useEffect(() => {
    const updateCameraWidth = () => {
      if (cameraContainerRef.current) {
        const rect = cameraContainerRef.current.getBoundingClientRect();
        const width = rect.width;
        setCameraWidth(`${width}px`);
      }
    };

    updateCameraWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateCameraWidth();
    });

    if (cameraContainerRef.current) {
      resizeObserver.observe(cameraContainerRef.current);
    }

    window.addEventListener('resize', updateCameraWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateCameraWidth);
    };
  }, []);

  const updateIndex = useCallback(
    (nextIndex: number) => {
      if (!songIdParam || syllables.length === 0) return;
      const bounded = ((nextIndex % syllables.length) + syllables.length) % syllables.length;
      setCurrentIndex(bounded);
      navigate(`/lesson/${songIdParam}/syllable/${bounded}`, { replace: true });
      setRecordedAudioBlob(null);
    },
    [navigate, setRecordedAudioBlob, songIdParam, syllables.length],
  );

  useEffect(() => {
    if (!songIdParam || syllables.length === 0) return;
    if (currentIndex >= syllables.length) {
      updateIndex(0);
    }
  }, [currentIndex, syllables.length, songIdParam, updateIndex]);

  const handlePrev = useCallback(() => {
    updateIndex(currentIndex - 1);
  }, [currentIndex, updateIndex]);

  const handleNext = useCallback(() => {
    updateIndex(currentIndex + 1);
  }, [currentIndex, updateIndex]);

  const handleMicClick = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      setRecordedAudioBlob(null);
    } else {
      setIsRecording(true);
    }
  }, [isRecording, setIsRecording, setRecordedAudioBlob]);

  const headerTitle = songTitle;
  const headerSinger = singer;

  const displayLyric =
    activeLineText ||
    practiceLineText ||
    (lyricLines.length === 0 ? '연습할 가사를 불러오는 중입니다.' : '');

  return (
    <div
      style={{
        ...containerFullscreen,
        minHeight: '100vh',
        position: 'relative',
        paddingTop: scaled(96),
        paddingBottom: scaled(80),
        color: COLORS.dark,
        fontFamily: FONTS.primary,
        gap: scaled(48),
      }}
    >
      <Header />

      <div
        style={{
          alignSelf: 'stretch',
          ...flexColumn,
          alignItems: 'center',
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: 'relative',
            fontSize: scaled(40),
            fontWeight: FONT_WEIGHTS.light,
          }}
        >
          {headerTitle} {headerSinger ? `- ${headerSinger}` : null}
        </div>

        <div
          style={{
            marginTop: scaled(8),
            fontSize: scaled(14),
            color: COLORS.textSecondary,
            fontWeight: FONT_WEIGHTS.light,
          }}
        >
          {syllables.length > 0
            ? `Syllable ${currentIndex + 1} / ${syllables.length}`
            : error
              ? error
              : '연습 데이터를 불러오는 중입니다.'}
        </div>
      </div>

      <div
        style={{
          width: '100%',
          flex: 1,
          ...flexColumn,
          alignItems: 'center',
          gap: scaled(32),
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: scaled(1280),
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: scaled(80),
          }}
        >
          <div
            style={{
              flex: '0 0 auto',
              width: scaled(600),
              ...flexColumn,
              alignItems: 'center',
              gap: scaled(16),
            }}
          >
            <div
              ref={cameraContainerRef}
              style={{
                width: '100%',
                aspectRatio: '1 / 1.58',
                position: 'relative',
                backgroundColor: 'transparent',
                borderRadius: BORDER_RADIUS.lg,
                overflow: 'hidden',
              }}
            >
              <CameraComponent
                width={cameraWidth}
                activeSyllable={isRecording ? currentSyllable : null}
                activeVowel={isRecording ? currentVowel : null}
                shouldStartOverlay={isRecording}
              />
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              gap: scaled(27),
              minWidth: scaled(540),
              maxWidth: scaled(800),
              height: '100%',
              overflowY: 'auto',
              overflowX: 'hidden',
              position: 'relative',
            }}
          >
            <button
              onClick={handlePrev}
              style={{
                width: scaled(100),
                height: scaled(100),
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 0,
                marginTop: scaled(40),
                flexShrink: 0,
              }}
              aria-label="Previous syllable"
            >
              <BtnPrev
                style={{
                  width: '100%',
                  height: '100%',
                  filter: 'brightness(0.5)',
                }}
              />
            </button>

            <div
              style={{
                ...flexColumn,
                alignItems: 'center',
                gap: scaled(18),
                flex: 1,
                maxWidth: scaled(540),
                paddingBottom: scaled(20),
                paddingTop: scaled(20),
              }}
            >
              <div
                style={{
                  fontSize: scaled(112),
                  fontWeight: FONT_WEIGHTS.bold,
                  letterSpacing: '0.05em',
                  color: COLORS.dark,
                  textAlign: 'center',
                }}
              >
                {currentSyllable}
              </div>

              <div
                style={{
                  fontSize: scaled(32),
                  fontWeight: FONT_WEIGHTS.light,
                  color: COLORS.textSecondary,
                  textAlign: 'center',
                }}
              >
                {currentRomaja ? currentRomaja.toLowerCase() : '\u00A0'}
              </div>

              <div
                style={{
                  fontSize: scaled(24),
                  fontWeight: FONT_WEIGHTS.light,
                  color: COLORS.textSecondary,
                  textAlign: 'center',
                  minHeight: scaled(48),
                }}
              >
                {displayLyric}
              </div>

              <div
                style={{
                  fontSize: scaled(20),
                  fontWeight: FONT_WEIGHTS.semibold,
                  color: COLORS.textSecondary,
                  textAlign: 'center',
                }}
              >
                {loading
                  ? '연습 데이터를 불러오는 중입니다.'
                  : error
                    ? '연습 데이터를 불러오지 못했습니다.'
                    : '입술 모양과 턱의 움직임을 확인하며 연습해 보세요.'}
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: scaled(32),
                  marginTop: scaled(24),
                }}
              >
                <button
                  onClick={handleMicClick}
                  style={{
                    width: scaled(96),
                    height: scaled(96),
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label="Toggle recording"
                >
                  <BtnMic
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      filter: isRecording ? 'none' : 'grayscale(70%)',
                    }}
                  />
                </button>
              </div>
            </div>

            <button
              onClick={handleNext}
              style={{
                width: scaled(100),
                height: scaled(100),
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 0,
                marginTop: scaled(40),
                flexShrink: 0,
              }}
              aria-label="Next syllable"
            >
              <BtnNext
                style={{
                  width: '100%',
                  height: '100%',
                  filter: 'brightness(0.5)',
                }}
              />
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SyllablePractice;
