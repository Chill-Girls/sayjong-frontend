import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import FooterCopyright from '../components/FooterCopyright';
import CameraComponent from '../components/CameraComponent';
import BtnPrev from '../components/Btn_prev';
import BtnNext from '../components/Btn_next';
import LyricsCard from '../components/LyricsCard';
import CoordsButton from '../components/Btn_Coords';
import { COLORS, FONTS, FONT_WEIGHTS, BORDER_RADIUS } from '../styles/theme';
import { containerFullscreen, flexColumn, scaled } from '../styles/mixins';
import { useMode } from '../constants/ModeContext';
import { useRecording } from '../constants/RecordingContext';
import { extractVowel } from '../utils/hangul';
import { useSong, useSongLyricLines } from '../hooks/useSongs';
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
  const { song } = useSong(songId);
  const { lyricData, loading: lyricLoading, error: lyricError } = useSongLyricLines(songId);
  const {
    syllables,
    loading: syllableLoading,
    error: syllableError,
    songTitle: apiSongTitle,
    singer: apiSinger,
  } = useSyllablePractice(songId);

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
  const [cameraWidth, setCameraWidth] = useState<string>(scaled(700));
  const [showLandmarkCoordinates, setShowLandmarkCoordinates] = useState<boolean>(false);

  useEffect(() => {
    setMode('syllable');
    return () => setMode(null);
  }, [setMode]); // 모드

  useEffect(() => {
    if (lyricData) {
      setSongTitle(song?.titleEng ?? '');
      setSinger(lyricData.singer ?? '');
    } else if (apiSongTitle) {
      setSongTitle(apiSongTitle ?? '');
      setSinger(apiSinger ?? '');
    } else if (lyricError || !songId) {
      setSongTitle('');
      setSinger('');
    }
  }, [lyricData, lyricError, apiSongTitle, apiSinger, songId, song]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]); // 현재 인덱스 설정

  useEffect(() => {
    setCyclingIndex(0);
  }, [currentData?.lineNo]); // 라인 변경 시 첫 번째 음절 선택

  useEffect(() => {
    if (!isRecording) {
      setCyclingIndex(0);
      setIsOverlayActive(false);
    } // 녹음 중지 시 오버레이 비활성화
  }, [isRecording]);

  /*
  useEffect(() => {
    if (!isOverlayActive) return;
    if (activeLineSyllables.length <= 1) return;
    const id = window.setInterval(() => {
      setCyclingIndex(prev => (prev + 1) % activeLineSyllables.length);
    }, 1500);
    return () => window.clearInterval(id);
  }, [activeLineSyllables, isOverlayActive]);
*/

  useEffect(() => {
    const updateCameraWidth = () => {
      if (!cameraContainerRef.current) return;
      // Use requestAnimationFrame to ensure layout has updated
      requestAnimationFrame(() => {
        if (!cameraContainerRef.current) return;
        const rect = cameraContainerRef.current.getBoundingClientRect();
        setCameraWidth(`${rect.width}px`);
      });
    };

    // Initial update after render
    const timeoutId = setTimeout(updateCameraWidth, 0);

    const resizeObserver = new ResizeObserver(() => {
      updateCameraWidth();
    });

    if (cameraContainerRef.current) {
      resizeObserver.observe(cameraContainerRef.current);
    }

    window.addEventListener('resize', updateCameraWidth);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateCameraWidth);
    };
  }, []); // 카메라 너비 업데이트

  const updateIndex = useCallback(
    (nextIndex: number) => {
      if (!songIdParam || syllables.length === 0) return;
      const bounded = ((nextIndex % syllables.length) + syllables.length) % syllables.length;
      setCurrentIndex(bounded);
      navigate(`/lesson/${songIdParam}/syllable`, { replace: true });
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
  }, [currentData, currentIndex, syllables, updateIndex]); // 이전 음절 이동

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
  }, [currentData, currentIndex, syllables, updateIndex]); // 다음 음절 이동

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

  // 같은 라인 내에서 다음 음절로 이동
  const handleNextSyllableInLine = useCallback(() => {
    if (activeLineSyllables.length === 0) return;

    const currentSyllable = selectedSyllable || currentData;
    const currentIndexInLine = activeLineSyllables.findIndex(
      s =>
        s.sylNo === currentSyllable?.sylNo &&
        (s.line?.lyricLineId === currentSyllable?.line?.lyricLineId ||
          s.lineNo === currentSyllable?.lineNo),
    );

    const nextIndex = (currentIndexInLine + 1) % activeLineSyllables.length;
    const nextSyllable = activeLineSyllables[nextIndex];

    if (nextSyllable) {
      handleSyllableClick(nextSyllable);
    }
  }, [activeLineSyllables, selectedSyllable, currentData, handleSyllableClick]);

  // 같은 라인 내에서 이전 음절로 이동
  const handlePrevSyllableInLine = useCallback(() => {
    if (activeLineSyllables.length === 0) return;

    const currentSyllable = selectedSyllable || currentData; // 선택된 음절 또는 현재 페이지의 기본 음절
    const currentIndexInLine = activeLineSyllables.findIndex(
      s =>
        s.sylNo === currentSyllable?.sylNo &&
        (s.line?.lyricLineId === currentSyllable?.line?.lyricLineId ||
          s.lineNo === currentSyllable?.lineNo),
    );

    let prevIndex;
    if (currentIndexInLine === -1) {
      prevIndex = activeLineSyllables.length - 1;
    } else {
      prevIndex =
        (currentIndexInLine - 1 + activeLineSyllables.length) % activeLineSyllables.length;
    }
    const prevSyllable = activeLineSyllables[prevIndex];

    if (prevSyllable) {
      handleSyllableClick(prevSyllable);
    }
  }, [activeLineSyllables, selectedSyllable, currentData, handleSyllableClick]);

  useEffect(() => {
    if (activeLineSyllables.length > 0) {
      const firstSyllable = activeLineSyllables[0];
      if (firstSyllable) {
        // 첫번 째 음절이면 바로 라인 바뀌어도 ar 바로 뜨도록
        handleSyllableClick(firstSyllable);
      }
    }
  }, [currentData?.lineNo, activeLineSyllables, handleSyllableClick]);

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
  // selectedSyllable이 있거나 isOverlayActive일 때 AR 표시
  const shouldShowAR = selectedSyllable !== null || isOverlayActive;
  const displayVowel = shouldShowAR ? extractVowel(currentDisplaySyllable) : null;

  const totalSyllables = syllables.length;

  // displayIndex: 현재 포커스된 음절이 전체에서 몇 번째인지
  const displayIndex = useMemo(() => {
    if (!displayTarget || syllables.length === 0) return 0;

    let foundIndex = syllables.indexOf(displayTarget);

    if (foundIndex === -1) {
      const targetId = displayTarget.line?.lyricLineId;
      const targetSylNo = displayTarget.sylNo;
      foundIndex = syllables.findIndex(
        s => s.line?.lyricLineId === targetId && s.sylNo === targetSylNo,
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
        <FooterCopyright />
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
        <FooterCopyright />
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
        <FooterCopyright />
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
        <div
          style={{
            position: 'relative',
            fontSize: scaled(40),
            fontWeight: FONT_WEIGHTS.bold,
            color: COLORS.dark,
          }}
        >
          {songTitle} {displaySinger}
        </div>
        <div
          style={{
            marginTop: scaled(8),
            fontSize: scaled(20),
            color: COLORS.textSecondary,
            fontWeight: FONT_WEIGHTS.semibold,
          }}
        >
          {totalSyllables > 0 ? `${Math.round((displayIndex / totalSyllables) * 100)}%` : ''}
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
            gap: scaled(100),
            flex: 1,
            minHeight: 0,
            margin: `auto 0`,
          }}
        >
          <div
            style={{
              flex: '0 0 auto',
              ...flexColumn,
              alignItems: 'center',
              justifyContent: 'center',
              width: scaled(700),
              position: 'relative',
            }}
          >
            {/* 랜드마크 좌표 토글 버튼 */}
            <CoordsButton
              isActive={showLandmarkCoordinates}
              onClick={() => setShowLandmarkCoordinates(!showLandmarkCoordinates)}
              top={60}
            />
            <div
              ref={cameraContainerRef}
              style={{
                width: '100%',
                aspectRatio: '1 / 1.4',
                position: 'relative',
                backgroundColor: 'transparent',
                borderRadius: BORDER_RADIUS.lg,
                overflow: 'hidden',
                margin: `${scaled(50)} auto 0`,
              }}
            >
              <CameraComponent
                width={cameraWidth}
                onResults={handleCameraResults}
                activeSyllable={shouldShowAR ? currentDisplaySyllable : null}
                activeVowel={displayVowel}
                shouldStartOverlay={isRecording}
                showLandmarkCoordinates={showLandmarkCoordinates}
              />
            </div>
          </div>

          {/* 가사 영역 */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: scaled(30),
              minWidth: scaled(600),
              maxWidth: scaled(900),
              height: '100%',
              overflow: 'visible',
              position: 'relative',
              margin: `${scaled(50)} auto 0`,
            }}
          >
            {/* 화살표 버튼 - 왼쪽 */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: '35%',
                transform: 'translateY(-50%)',
                pointerEvents: 'auto',
                zIndex: 10,
              }}
            >
              <BtnPrev
                onClick={handlePrev}
                ariaLabel="Previous syllable"
                buttonStyle={{
                  width: scaled(60),
                  height: scaled(60),
                }}
              />
            </div>

            {/* 가사 콘텐츠 */}
            <div
              style={{
                ...flexColumn,
                alignItems: 'center',
                flex: 1,
                maxWidth: scaled(600),
                paddingBottom: scaled(20),
                paddingTop: scaled(20),
                paddingLeft: scaled(50),
                paddingRight: scaled(50),
                minHeight: 0,
                overflow: 'visible',
                height: '100%',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <LyricsCard>
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
                        <span key={wordIndex} style={{ marginRight: '0.25em' }}>
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
                                      padding: '0 0.03em',
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
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: scaled(20),
                    }}
                  >
                    <BtnPrev
                      onClick={handlePrevSyllableInLine}
                      disabled={activeLineSyllables.length <= 1}
                      ariaLabel="Previous syllable in line"
                      buttonStyle={{
                        width: scaled(60),
                        height: scaled(60),
                      }}
                    />
                    <b
                      style={{
                        fontSize: scaled(72),
                        fontWeight: FONT_WEIGHTS.bold,
                        letterSpacing: '0.12em',
                        color: COLORS.primary,
                        textAlign: 'center',
                        minWidth: scaled(100),
                      }}
                    >
                      {cyclingHangul || '-'}
                    </b>
                    <BtnNext
                      onClick={handleNextSyllableInLine}
                      disabled={activeLineSyllables.length <= 1}
                      ariaLabel="Next syllable in line"
                      buttonStyle={{
                        width: scaled(60),
                        height: scaled(60),
                      }}
                    />
                  </div>
                  <div
                    style={{
                      padding: `${scaled(6)} ${scaled(16)}`,
                      borderRadius: BORDER_RADIUS.lg,
                      backgroundColor: 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
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
              </LyricsCard>
            </div>

            {/* 화살표 버튼 - 오른쪽 */}
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '35%',
                transform: 'translateY(-50%)',
                pointerEvents: 'auto',
                zIndex: 10,
              }}
            >
              <BtnNext
                onClick={handleNext}
                ariaLabel="Next syllable"
                buttonStyle={{
                  width: scaled(60),
                  height: scaled(60),
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* End Button - Bottom Right */}
      <button
        onClick={() => {
          if (songIdParam) {
            navigate(`/lesson/${songIdParam}`);
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
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = COLORS.primary;
          e.currentTarget.style.opacity = '0.9';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = COLORS.primary;
          e.currentTarget.style.opacity = '1';
        }}
        aria-label="End practice and return to lesson mode"
      >
        End
      </button>

      <FooterCopyright />
    </div>
  );
};

export default SyllablePractice;
