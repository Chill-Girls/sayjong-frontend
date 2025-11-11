import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CameraComponent from '../components/CameraComponent';
import BtnPrev from '../components/Btn_prev';
import BtnNext from '../components/Btn_next';
import BtnMic from '../components/Btn_Mic';
import BtnListenRecording from '../components/Btn_ListenRecording';
import BtnTts from '../components/Btn_Tts';
import { COLORS, FONTS, FONT_WEIGHTS, BORDER_RADIUS } from '../styles/theme';
import { containerFullscreen, flexColumn, scaled } from '../styles/mixins';
import { useMode } from '../constants/ModeContext';
import { useRecording } from '../constants/RecordingContext';
import { extractVowel } from '../utils/hangul';
import { useSongLyricLines } from '../hooks/useSongs';
import { useSyllablePractice, type PracticeSyllable } from '../hooks/useSyllablePractice';

const SyllablePractice: React.FC = () => {
  const { songId: songIdParam, page: pageParam } = useParams<{ songId: string; page?: string }>();
  const navigate = useNavigate();
  const { setMode } = useMode();
  const { isRecording, setIsRecording, setRecordedAudioBlob } = useRecording();

  const songId = useMemo(
    () => (songIdParam ? (Number.isNaN(Number(songIdParam)) ? null : Number(songIdParam)) : null),
    [songIdParam],
  );

  const initialIndex = useMemo(() => {
    if (!pageParam) return 0;
    const maybeNum = Number(pageParam);
    return Number.isNaN(maybeNum) ? 0 : Math.max(maybeNum - 1, 0);
  }, [pageParam]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const { lyricData, loading: lyricLoading, error: lyricError } = useSongLyricLines(songId);
  const { syllables, loading: syllableLoading, error: syllableError, songTitle: apiSongTitle, singer: apiSinger } =
    useSyllablePractice(songId);

  // 클릭된 음절을 저장 (null이면 현재 연습 중인 음절을 의미)
  const [selectedSyllable, setSelectedSyllable] = useState<PracticeSyllable | null>(null);

  const [songTitle, setSongTitle] = useState<string>('');
  const [singer, setSinger] = useState<string>('');

  const loadingState = lyricLoading || syllableLoading;
  const errorState = lyricError || syllableError;

  const currentData = useMemo<PracticeSyllable | null>(() => {
    if (syllables.length === 0) return null;
    return syllables[((currentIndex % syllables.length) + syllables.length) % syllables.length];
  }, [currentIndex, syllables]);

  const activeLineSyllables = useMemo(() => {
    if (!currentData) return [];
    return syllables.filter(s => s.lineNo === currentData.lineNo);
  }, [currentData, syllables]);
  const [cyclingIndex, setCyclingIndex] = useState(0);
  const [isOverlayActive, setIsOverlayActive] = useState(false);

  const lastUpdateTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cameraContainerRef = useRef<HTMLDivElement>(null);
  const [cameraWidth, setCameraWidth] = useState<string>(scaled(600));

  useEffect(() => {
    setMode('syllable');
    return () => setMode(null);
  }, [setMode]);

  useEffect(() => {
    if (lyricData) {
      setSongTitle(lyricData.title ?? '');
      setSinger(lyricData.singer ?? '');
    } else if (apiSongTitle) {
      setSongTitle(apiSongTitle ?? '');
      setSinger(apiSinger ?? '');
    } else if (lyricError || !songId) {
      setSongTitle('');
      setSinger('');
    }
  }, [lyricData, lyricError, apiSongTitle, apiSinger, songId]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    setCyclingIndex(0);
  }, [currentData?.lineNo]);

  useEffect(() => {
    if (!isRecording) {
      setCyclingIndex(0);
      setIsOverlayActive(false);
    }
  }, [isRecording]);

  useEffect(() => {
    if (!isOverlayActive) return;
    if (activeLineSyllables.length <= 1) return;
    const id = window.setInterval(() => {
      setCyclingIndex(prev => (prev + 1) % activeLineSyllables.length);
    }, 1500);
    return () => window.clearInterval(id);
  }, [activeLineSyllables, isOverlayActive]);

  useEffect(() => {
    const updateCameraWidth = () => {
      if (!cameraContainerRef.current) return;
      const rect = cameraContainerRef.current.getBoundingClientRect();
      setCameraWidth(`${rect.width}px`);
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
      navigate(`/lesson/${songIdParam}/syllable/${bounded + 1}`, { replace: true });
      setRecordedAudioBlob(null);
      setIsRecording(false);
      setSelectedSyllable(null);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    },
    [navigate, setRecordedAudioBlob, setIsRecording, songIdParam, syllables.length],
  );

  const handlePrev = useCallback(() => {
    if (syllables.length === 0) return;
    const currentLineId = currentData?.line?.lyricLineId ?? currentData?.lineNo ?? null;
    let targetIndex = currentIndex;
    let steps = 0;

    while (steps < syllables.length) {
      const candidateIndex =
        (((targetIndex - 1) % syllables.length) + syllables.length) % syllables.length;
      if (candidateIndex === currentIndex) break;
      const candidate = syllables[candidateIndex];
      const candidateLineId = candidate.line?.lyricLineId ?? candidate.lineNo;
      if (currentLineId === null || candidateLineId !== currentLineId) {
        targetIndex = candidateIndex;
        break;
      }
      targetIndex = candidateIndex;
      steps += 1;
    }

    updateIndex(targetIndex === currentIndex ? currentIndex - 1 : targetIndex);
  }, [currentData, currentIndex, syllables, updateIndex]);

  const handleNext = useCallback(() => {
    if (syllables.length === 0) return;
    const currentLineId = currentData?.line?.lyricLineId ?? currentData?.lineNo ?? null;
    let targetIndex = currentIndex;
    let steps = 0;

    while (steps < syllables.length) {
      const candidateIndex = (targetIndex + 1) % syllables.length;
      if (candidateIndex === currentIndex) break;
      const candidate = syllables[candidateIndex];
      const candidateLineId = candidate.line?.lyricLineId ?? candidate.lineNo;
      if (currentLineId === null || candidateLineId !== currentLineId) {
        targetIndex = candidateIndex;
        break;
      }
      targetIndex = candidateIndex;
      steps += 1;
    }

    updateIndex(targetIndex === currentIndex ? currentIndex + 1 : targetIndex);
  }, [currentData, currentIndex, syllables, updateIndex]);

  const handleOverlayCountdownComplete = useCallback(() => {
    setCyclingIndex(0);
    setIsOverlayActive(true);
  }, []);

  const handleMicClick = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      setRecordedAudioBlob(null);
      setIsOverlayActive(false);
    } else {
      setIsRecording(true);
      setIsOverlayActive(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }
  }, [isRecording, setIsRecording, setRecordedAudioBlob]);

  const handlePlayNative = useCallback(() => {
    const url = currentData?.nativeAudioUrl;
    if (!url) return;

    setSelectedSyllable(null);

    setIsRecording(false);
    setIsOverlayActive(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(err => {
      console.error('native audio play error', err);
      audioRef.current = null;
    });
    audio.onended = () => {
      audioRef.current = null;
    };
    audio.onerror = () => {
      audioRef.current = null;
    };
  }, [currentData?.nativeAudioUrl, setIsRecording]);

  useEffect(
    () => () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    },
    [],
  );

  const handleCameraResults = useCallback((results: { blendshapes?: Record<string, number> }) => {
    if (!results?.blendshapes) return;
    const now = performance.now();
    if (now - lastUpdateTimeRef.current < 33) return;
    lastUpdateTimeRef.current = now;
  }, []);

  // 소절 내의 음절을 클릭했을 때 호출
  const handleSyllableClick = useCallback((syllable: PracticeSyllable) => {
    // 선택된 음절을 state에 저장
    setSelectedSyllable(syllable);

    // 해당 음절의 TTS 재생
    const url = syllable.nativeAudioUrl;
    if (!url) return;

    // 기존 오디오가 있으면 정지
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(err => {
      console.error('Clicked syllable audio play error', err);
      audioRef.current = null;
    });
    audio.onended = () => {
      audioRef.current = null;
    };
    audio.onerror = () => {
      audioRef.current = null;
    };
  }, []); 

  const effectiveIndex =
    activeLineSyllables.length > 0
      ? isOverlayActive
        ? cyclingIndex % activeLineSyllables.length
        : 0
      : 0;
  const cyclingTarget =
    activeLineSyllables.length > 0 ? activeLineSyllables[effectiveIndex] : (currentData ?? null);

  // 유저가 클릭한 음절(selectedSyllable)이 있으면 그것을, 없다면 현재 페이지의 기본 음절을 표시
  const displayTarget = selectedSyllable || (isOverlayActive ? cyclingTarget : currentData);
  const cyclingHangul = displayTarget?.textKor ?? '';
  const cyclingRomaja = displayTarget?.textRomaja ?? '';

  const displayLine = displayTarget?.line ?? null;
  const displayLineText = displayLine?.originalText ?? '';
  const displaySinger = singer ? `- ${singer}` : '';

  const currentDisplaySyllable = displayTarget?.textKor ?? '';
  const displayVowel = isOverlayActive ? extractVowel(currentDisplaySyllable) : null;

  const totalSyllables = syllables.length;

  // displayIndex: 현재 포커스된 음절이 전체에서 몇 번째인지
  const displayIndex = useMemo(() => {
    if (!displayTarget || syllables.length === 0) return 0;

    let foundIndex = syllables.indexOf(displayTarget);

    if (foundIndex === -1) {
      const targetId = displayTarget.line?.lyricLineId;
      const targetSylNo = displayTarget.sylNo;
      foundIndex = syllables.findIndex(s => 
          s.line?.lyricLineId === targetId && s.sylNo === targetSylNo
      );
    }

    if (foundIndex === -1) {
      foundIndex = currentIndex;
    }

    return foundIndex + 1;

  }, [displayTarget, syllables, currentIndex]);

  if (loadingState) {
    return (
      <div
        style={{
          ...containerFullscreen,
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONTS.primary,
          fontSize: scaled(28),
        }}
      >
        <Header />
        <div style={{ marginTop: scaled(80) }}>가사와 음절 데이터를 불러오는 중입니다...</div>
        <Footer />
      </div>
    );
  }

  if (errorState) {
    return (
      <div
        style={{
          ...containerFullscreen,
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONTS.primary,
          fontSize: scaled(24),
          color: COLORS.primary,
        }}
      >
        <Header />
        <div style={{ marginTop: scaled(80) }}>
          가사 데이터를 불러오는 중 오류가 발생했습니다: {errorState}
        </div>
        <Footer />
      </div>
    );
  }

  if (!currentData) {
    return (
      <div
        style={{
          ...containerFullscreen,
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONTS.primary,
          fontSize: scaled(24),
        }}
      >
        <Header />
        <div style={{ marginTop: scaled(80) }}>연습 가능한 음절이 없습니다.</div>
        <Footer />
      </div>
    );
  }

  return (
    <div
      style={{
        ...containerFullscreen,
        height: '100vh',
        position: 'relative',
        gap: scaled(64),
        textAlign: 'left',
        fontSize: scaled(40),
        color: COLORS.dark,
        fontFamily: FONTS.primary,
        paddingTop: scaled(119.5),
        paddingBottom: scaled(100),
      }}
    >
      <Header />

      <div style={{ alignSelf: 'stretch', ...flexColumn, alignItems: 'center', zIndex: 1 }}>
        <div style={{ position: 'relative', fontSize: scaled(40), fontWeight: FONT_WEIGHTS.light }}>
          {songTitle} {displaySinger}
        </div>

        <div
          style={{
            marginTop: scaled(8),
            fontSize: scaled(14),
            color: COLORS.textSecondary,
            fontWeight: FONT_WEIGHTS.light,
          }}
        >
          {totalSyllables > 0 ? `Syllable ${displayIndex} / ${totalSyllables}` : ''}
        </div>
      </div>

      <div
        style={{
          width: '100%',
          backgroundColor: COLORS.background,
          overflow: 'hidden',
          ...flexColumn,
          alignItems: 'center',
          justifyContent: 'center',
          gap: scaled(20),
          paddingLeft: scaled(50),
          paddingRight: scaled(50),
          paddingTop: 0,
          paddingBottom: 0,
          zIndex: 2,
          flex: 1,
          minHeight: 0,
          height: 'calc(100vh - 380px)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: scaled(1600),
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: scaled(200),
            flex: 1,
            minHeight: 0,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              flex: '0 0 auto',
              ...flexColumn,
              alignItems: 'center',
              justifyContent: 'center',
              width: scaled(600),
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
                onResults={handleCameraResults}
                activeSyllable={isOverlayActive ? currentDisplaySyllable : null}
                activeVowel={displayVowel}
                shouldStartOverlay={isRecording}
                onCountdownComplete={handleOverlayCountdownComplete}
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
              type="button"
              onClick={handlePrev}
              style={{
                width: scaled(100),
                height: scaled(100),
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 0,
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
                gap: scaled(32),
                flex: 1,
                maxWidth: scaled(540),
                paddingBottom: scaled(20),
                paddingTop: scaled(20),
              }}
            >
              <div
                style={{
                  ...flexColumn,
                  alignItems: 'stretch',
                  gap: scaled(16),
                  padding: scaled(32),
                  borderRadius: BORDER_RADIUS.lg,
                  boxShadow: '0 16px 32px rgba(0,0,0,0.06)',
                  background: COLORS.white,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: scaled(12),
                  }}
                >
                  <div
                    style={{
                      fontSize: scaled(40),
                      fontWeight: FONT_WEIGHTS.semibold,
                      letterSpacing: '0.08em',
                      color: COLORS.dark,
                      textAlign: 'center',
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      alignItems: 'center',
                      lineHeight: 1.4,
                    }}
                  >
                    {(() => {
                      let syllableLineIndex = 0;
                      const lineWords = (displayLineText || '').split(' ');

                      return lineWords.map((word, wordIndex) => (
                        <span
                          key={wordIndex}
                          style={{ marginRight: '0.25em' }}
                        >
                          <span style={{ whiteSpace: 'nowrap' }}>
                            {word.split('').map((char, charIndex) => {
                              const syllable = activeLineSyllables[syllableLineIndex];

                              if (syllable && syllable.textKor === char) {
                                syllableLineIndex++;
                                return (
                                  <span
                                    key={`${wordIndex}-${charIndex}`}
                                    onClick={() => handleSyllableClick(syllable)}
                                    style={{
                                      cursor: 'pointer',
                                      padding: '0 0.05em',
                                      color:
                                        displayTarget?.sylNo === syllable.sylNo
                                          ? COLORS.primary
                                          : COLORS.dark,
                                      fontWeight:
                                        displayTarget?.sylNo === syllable.sylNo
                                          ? FONT_WEIGHTS.bold
                                          : FONT_WEIGHTS.semibold,
                                      transition: 'color 0.2s',
                                    }}
                                  >
                                    {char}
                                  </span>
                                );
                              }
                              return <span key={`${wordIndex}-${charIndex}`}>{char}</span>;
                            })}
                          </span>
                        </span>
                      ));
                    })()}
                  </div>
                </div>

                {/* textEng not used */}

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: scaled(12),
                    marginTop: scaled(12),
                  }}
                >
                  <b
                    style={{
                      fontSize: scaled(72),
                      fontWeight: FONT_WEIGHTS.bold,
                      letterSpacing: '0.12em',
                      color: COLORS.primary,
                      textAlign: 'center',
                    }}
                  >
                    {cyclingHangul || '-'}
                  </b>
                  <div
                    style={{
                      padding: `${scaled(6)} ${scaled(16)}`,
                      borderRadius: BORDER_RADIUS.lg,
                      backgroundColor: 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `${scaled(1)} solid ${COLORS.primary}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: scaled(24),
                        fontWeight: FONT_WEIGHTS.semibold,
                        letterSpacing: '0.06em',
                        color: COLORS.dark,
                        textTransform: 'lowercase',
                      }}
                    >
                      {cyclingRomaja || '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              style={{
                width: scaled(100),
                height: scaled(100),
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 0,
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

        <div
          style={{
            width: '100%',
            overflow: 'visible',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `${scaled(20)} 0`,
            gap: scaled(80),
            minHeight: scaled(120),
            zIndex: 3,
          }}
        >
          <button
            type="button"
            onClick={handleMicClick}
            style={{
              width: scaled(80),
              height: scaled(80),
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BtnMic
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </button>

          <button
            type="button"
            style={{
              width: scaled(80),
              height: scaled(80),
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-label="Listen recording"
          >
            <BtnListenRecording
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </button>

          <button
            type="button"
            onClick={handlePlayNative}
            disabled={!currentData.nativeAudioUrl}
            style={{
              width: scaled(80),
              height: scaled(80),
              border: 'none',
              background: 'transparent',
              cursor: currentData.nativeAudioUrl ? 'pointer' : 'not-allowed',
              opacity: currentData.nativeAudioUrl ? 1 : 0.5,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BtnTts
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SyllablePractice;
