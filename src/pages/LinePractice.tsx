import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSong, useSongLyricLines } from '../hooks/useSongs';
import type { LyricLine } from '../api/songs/types';
import { useMode } from '../constants/ModeContext';
import Header from '../components/Header';
import FooterCopyright from '../components/FooterCopyright';
import CameraComponent from '../components/CameraComponent';
import BtnMic from '../components/Btn_Mic';
import BtnListenRecording from '../components/Btn_ListenRecording';
import BtnTts from '../components/Btn_Tts';
import BtnPrev from '../components/Btn_prev';
import BtnNext from '../components/Btn_next';
import { COLORS, FONTS, FONT_WEIGHTS, BORDER_RADIUS } from '../styles/theme';
import { containerFullscreen, flexColumn, scaled } from '../styles/mixins';
import { getAdaptiveFontSize } from '../utils/fontUtils';
import { useRecording } from '../constants/RecordingContext';
import { filterTargetBlendshapes } from '../utils/blendshapeProcessor';
import { usePronunciationCheck } from '../hooks/usePronunciationCheck';
import { useTts, PLAYBACK_RATES } from '../hooks/useTts';
import VowelFeedback, { type SegmentFeedbackItem } from '../components/VowelFeedback';
import ScoreBar from '../components/ScoreBar';
import LyricsCard from '../components/LyricsCard';
import CoordsButton from '../components/Btn_Coords';
import { mapCharsWithMask } from '../utils/highlight';

const HIGHLIGHT_COLOR = '#F04455';

const LinePractice: React.FC = () => {
  const { songId: songIdParam } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  const { setMode } = useMode();
  const { isRecording, setRecordedAudioBlob, setIsRecording } = useRecording();

  // songId를 number로 변환
  const songId = songIdParam
    ? Number.isNaN(Number(songIdParam))
      ? null
      : Number(songIdParam)
    : null;

  // useSongLyricLines 훅 사용
  const { song } = useSong(songId);
  const { lyricData, error: lyricError } = useSongLyricLines(songId);

  const [lines, setLines] = useState<LyricLine[]>([]);
  const [songTitle, setSongTitle] = useState<string>('');
  const [singer, setSinger] = useState<string>('');
  const [selected, setSelected] = useState<LyricLine | null>(null);

  // localStorage에서 로드한 캘리브레이션 데이터를 저장할 state
  const [loadedTargetVowels, setLoadedTargetVowels] = useState<any>(null);
  // 데이터 로딩 상태
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 마지막(빈) 소절을 제외한 실제 사용 가능한 소절 배열
  const usableLines = React.useMemo(() => {
    if (!lines || lines.length === 0) return [] as LyricLine[];
    // 마지막 항목이 빈 소절(또는 sentinel)이라면 제외
    return lines.length > 1 ? lines.slice(0, lines.length - 1) : lines;
  }, [lines]);

  const lastUpdateTimeRef = useRef<number>(0);
  const [displayBlendshapes, setDisplayBlendshapes] = useState<Record<string, number>>({});
  const [failedMask, setFailedMask] = useState<number[]>([]);
  const [lyricChars, setLyricChars] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [segmentFeedbacks, setSegmentFeedbacks] = useState<SegmentFeedbackItem[]>([]);
  const cameraContainerRef = useRef<HTMLDivElement>(null);
  const [cameraWidth, setCameraWidth] = useState<string>(scaled(700));
  const [showLandmarkCoordinates, setShowLandmarkCoordinates] = useState<boolean>(false);

  // 카메라 컨테이너 크기에 맞춰 CameraComponent 너비 업데이트
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
  }, []);

  useEffect(() => {
    setMode('line');
    return () => setMode(null);
  }, [setMode]);

  // localStorage에서 캘리브레이션 데이터 로드
  useEffect(() => {
    const dataString = localStorage.getItem('target_vowels');
    if (dataString) {
      try {
        const parsedData = JSON.parse(dataString);
        setLoadedTargetVowels(parsedData);
        // console.log("LinePractice: 'target_vowels'를 localStorage에서 로드했습니다.");
      } catch {
        // console.error('LinePractice: localStorage 데이터 파싱 실패');
      }
    } else {
      // console.warn("LinePractice: 'target_vowels' 데이터가 없습니다. 캘리브레이션이 필요합니다.");
    }
    setIsLoadingData(false); // 데이터 로드 시도 완료
  }, []); // [] : 컴포넌트 마운트 시 한 번만 실행

  // lyricData가 변경되면 상태 업데이트
  useEffect(() => {
    if (lyricData) {
      setLines(lyricData.lyrics ?? []);
      setSongTitle(song?.titleEng ?? '');
      setSinger(lyricData.singer ?? '');
      setSelected(lyricData.lyrics && lyricData.lyrics.length > 0 ? lyricData.lyrics[0] : null);
    } else if (lyricError || !songId) {
      setSelected(null);
      setLines([]);
      setSongTitle('');
      setSinger('');
    }
  }, [lyricData, lyricError, songId, song]);

  // 화면에 보여줄 소절 선택
  const displayLine = selected ??
    usableLines[0] ?? {
      lyricLineId: 0,
      lineNo: 0,
      originalText: '',
      textRomaja: '',
      textEng: '',
      startTime: 0,
    };

  // TTS hook 사용
  const {
    currentSyllable: currentTtsSyllable,
    currentVowel: currentTtsVowel,
    currentIndex: currentTtsIndex,
    isPlaying: isTtsPlaying,
    playTts,
    playOverlayOnly,
    stop: stopTts,
    playbackRate,
    setPlaybackRate,
  } = useTts({
    syllableTimings: displayLine.syllableTimings || [],
    audioUrl: displayLine.nativeAudioUrl,
    initialPlaybackRate: 0.5,
  });

  // 오버레이 모음은 녹음 중(버튼 누름)이고 TTS 진행 중일 때만 활성
  const displayVowel = isRecording && isTtsPlaying ? currentTtsVowel : null;

  const handleResetSegmentFeedbacks = useCallback(() => {
    setSegmentFeedbacks([]);
  }, []);

  useEffect(() => {
    const chars = Array.from(displayLine.originalText ?? '');
    setLyricChars(chars);
    setFailedMask(chars.map(() => 0));
    setShowFeedback(false);
    handleResetSegmentFeedbacks();
  }, [displayLine.lyricLineId, displayLine.originalText, handleResetSegmentFeedbacks]);

  const highlightMap = useMemo(
    () => mapCharsWithMask(lyricChars, failedMask),
    [lyricChars, failedMask],
  );

  const highlightedLyric = useMemo(
    () =>
      highlightMap.map(({ char, isHighlighted }, index) => (
        <span
          key={`${char}-${index}`}
          style={{
            color: showFeedback && isHighlighted ? HIGHLIGHT_COLOR : COLORS.dark,
            fontSize: showFeedback && isHighlighted ? scaled(50) : 'inherit',
            fontWeight: showFeedback && isHighlighted ? FONT_WEIGHTS.bold : 'inherit',
            transition: 'all 0.2s ease',
          }}
        >
          {char}
        </span>
      )),
    [highlightMap, showFeedback],
  );

  const handleSegmentFeedback = useCallback((feedback: SegmentFeedbackItem) => {
    setFailedMask(prev => {
      const next = [...prev];
      feedback.indices.forEach(index => {
        if (index >= 0 && index < next.length) {
          next[index] = 1;
        }
      });
      return next;
    });
    setSegmentFeedbacks(prev => {
      const exists = prev.some(item => item.id === feedback.id);
      if (exists) return prev;
      return [...prev, feedback];
    });
  }, []);

  const handleCameraResults = useCallback(
    (results: { landmarks?: any[]; blendshapes?: Record<string, number> }) => {
      if (!results.blendshapes) return;

      const filteredBlendshapes = filterTargetBlendshapes(results.blendshapes!);

      const now = performance.now();
      if (now - lastUpdateTimeRef.current >= 33) {
        lastUpdateTimeRef.current = now;
        setDisplayBlendshapes({ ...filteredBlendshapes });
      }
    },
    [],
  );

  // 현재 표시 중인 소절 인덱스(1-based) 및 전체 개수 — usableLines 기준
  const totalLines = usableLines.length;
  const currentIndex = usableLines.findIndex(l => l.lyricLineId === displayLine.lyricLineId);
  const displayIndex = currentIndex >= 0 ? currentIndex + 1 : 0;
  const { isLoading, score } = usePronunciationCheck(displayLine.originalText);
  //노래 점수
  const flagAccumulatorRef = useRef<number>(0);
  const mouthScoreRef = useRef<number | null>(null);
  const totalVowelCountRef = useRef<number>(0);

  // 모든 버튼 상태 리셋 함수
  const resetAllButtons = useCallback(() => {
    stopTts(); // TTS 및 오버레이 정지
    setIsRecording(false); // 마이크 녹음 정지
    setRecordedAudioBlob(null); // 녹음된 오디오 초기화
    setShowFeedback(false);
    setFailedMask(prev => prev.map(() => 0));
    handleResetSegmentFeedbacks();
  }, [handleResetSegmentFeedbacks, stopTts, setIsRecording, setRecordedAudioBlob]);

  // 이전/다음 소절 이동 핸들러
  const handlePrevLine = () => {
    resetAllButtons(); // 모든 버튼 상태 리셋
    if (!usableLines || usableLines.length === 0) return;
    const idx = usableLines.findIndex(
      l => l.lyricLineId === (selected?.lyricLineId ?? usableLines[0].lyricLineId),
    );
    if (idx > 0) setSelected(usableLines[idx - 1]);
  };

  const handleNextLine = () => {
    resetAllButtons(); // 모든 버튼 상태 리셋
    if (!usableLines || usableLines.length === 0) return;
    const idx = usableLines.findIndex(
      l => l.lyricLineId === (selected?.lyricLineId ?? usableLines[0].lyricLineId),
    );
    if (idx >= 0 && idx < usableLines.length - 1) setSelected(usableLines[idx + 1]);
  };

  // 마이크 버튼 클릭 & 녹음과 오버레이 연동
  const handleMicClick = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      stopTts();
      setShowFeedback(true);
      if (mouthScoreRef.current !== null) {
        console.log('녹음 종료 - 입모양 점수:', {
          mouthScore: mouthScoreRef.current,
          totalVowelCount: totalVowelCountRef.current,
          flagAccumulator: flagAccumulatorRef.current,
          percentage: (mouthScoreRef.current * 100).toFixed(1) + '%',
        });
      }
    } else {
      setShowFeedback(false);
      setFailedMask(prev => prev.map(() => 0));
      handleResetSegmentFeedbacks();
      flagAccumulatorRef.current = 0;
      mouthScoreRef.current = null;
      totalVowelCountRef.current = 0;
      setIsRecording(true);
    }
  }, [handleResetSegmentFeedbacks, isRecording, setIsRecording, stopTts]);

  const handleCountdownComplete = useCallback(() => {
    playOverlayOnly();
  }, [playOverlayOnly]);

  if (!songId) {
    return <div>노래 ID가 제공되지 않았습니다.</div>;
  }

  // 캘리브레이션 데이터 로딩 중 UI
  if (isLoadingData) {
    return (
      <div
        style={{
          ...containerFullscreen,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Header />
        <div>캘리브레이션 데이터를 불러오는 중입니다...</div>
        <FooterCopyright />
      </div>
    );
  }

  // 캘리브레이션 데이터가 없는 경우 UI
  if (!loadedTargetVowels) {
    return (
      <div
        style={{
          ...containerFullscreen,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: scaled(20),
        }}
      >
        <Header />
        <div style={{ textAlign: 'center', fontSize: scaled(24), color: COLORS.dark }}>
          <p>캘리브레이션 데이터가 없습니다.</p>
          <p>먼저 캘리브레이션 페이지에서 보정을 완료해주세요.</p>
          {/* (선택) 캘리브레이션 페이지로 가는 버튼을 추가할 수 있습니다. */}
        </div>
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

      {/* 노래 제목 */}
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
            fontWeight: FONT_WEIGHTS.bold,
            color: COLORS.dark,
          }}
        >
          {songTitle} {singer ? `- ${singer}` : null}
        </div>

        {/* 현재 소절 위치 표시: percentage */}
        <div
          style={{
            marginTop: scaled(8),
            fontSize: scaled(20),
            color: COLORS.textSecondary,
            fontWeight: FONT_WEIGHTS.semibold,
          }}
        >
          {totalLines > 0 ? `${Math.round((displayIndex / totalLines) * 100)}%` : ''}
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div
        style={{
          width: '100%',
          backgroundColor: COLORS.background,
          overflow: 'hidden',
          ...flexColumn,
          alignItems: 'center',
          justifyContent: 'center', // 세로 중앙 정렬
          gap: scaled(10),
          paddingLeft: scaled(150), // 좌측 마진
          paddingRight: scaled(50), // 우측 마진
          paddingTop: 0,
          paddingBottom: 0,
          zIndex: 2,
          flex: 1,
          minHeight: 0,
          height: 'calc(100vh - 380px)', // 버튼 영역 근처까지 확장
        }}
      >
        {/* 카메라와 가사 영역 */}
        <div
          style={{
            width: '100%',
            maxWidth: scaled(1800), // 전체를 감싸는 컨테이너에 maxWidth를 주어 중앙 정렬 명확히
            display: 'flex',
            alignItems: 'flex-start', // 상단 정렬로 일관성 유지
            justifyContent: 'center', // 가운데 정렬
            gap: scaled(0), // 카메라와 가사 사이 간격
            flex: 1,
            minHeight: 0,
            margin: 'auto 0',
            paddingLeft: scaled(50), // 카메라를 오른쪽으로 이동
          }}
        >
          {/* 카메라 영역 */}
          <div
            style={{
              flex: '0 0 auto', // 고정 크기로 비율 유지
              ...flexColumn,
              alignItems: 'center',
              justifyContent: 'center',
              width: scaled(700), // 고정 너비
              position: 'relative',
            }}
          >
            {/* 랜드마크 좌표 토글 버튼 */}
            <CoordsButton
              isActive={showLandmarkCoordinates}
              onClick={() => setShowLandmarkCoordinates(!showLandmarkCoordinates)}
              top={30}
            />
            <div
              ref={cameraContainerRef}
              style={{
                width: '100%',
                aspectRatio: '1 / 1.4', // 가로:세로 비율 1:1.4
                position: 'relative',
                backgroundColor: 'transparent', // 회색 배경 제거
                borderRadius: BORDER_RADIUS.lg, // 더 둥근 모서리
                overflow: 'hidden', // 넘치는 부분 숨김
                margin: `${scaled(20)} auto 0`,
              }}
            >
              <CameraComponent
                width={cameraWidth}
                onResults={handleCameraResults}
                // 녹음 중 AND TTS 진행 중일 때만 오버레이 표시
                activeSyllable={isRecording && isTtsPlaying ? currentTtsSyllable : null}
                activeVowel={isRecording && isTtsPlaying ? currentTtsVowel : null}
                shouldStartOverlay={isRecording}
                onCountdownComplete={handleCountdownComplete}
                showLandmarkCoordinates={showLandmarkCoordinates}
              />
              {/* {isRecording && isTtsPlaying && displaySimilarity !== null && displayVowel && (
                <div
                  style={{
                    position: 'absolute',
                    top: scaled(10),
                    right: scaled(10),
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: COLORS.white,
                    padding: `${scaled(12)} ${scaled(16)}`,
                    borderRadius: scaled(8),
                    fontSize: scaled(16),
                    fontFamily: FONTS.primary,
                    zIndex: 10,
                    minWidth: scaled(200),
                  }}
                >
                  <div style={{ fontWeight: FONT_WEIGHTS.semibold, marginBottom: scaled(4) }}>
                    Similarity Score (임시)
                  </div>
                  <div style={{ fontSize: scaled(14), marginBottom: scaled(8) }}>
                    모음: {displayVowel}
                  </div>
                  <div
                    style={{
                      fontSize: scaled(24),
                      fontWeight: FONT_WEIGHTS.bold,
                      color:
                        displaySimilarity > 0.7
                          ? '#4CAF50'
                          : displaySimilarity > 0.5
                            ? '#FFC107'
                            : '#F44336',
                    }}
                  >
                    {(displaySimilarity * 100).toFixed(1)}%
                  </div>
                  <div style={{ fontSize: scaled(12), marginTop: scaled(8), opacity: 0.8 }}>
                    {TARGET_BLENDSHAPES.map(name => (
                      <div key={name} style={{ marginTop: scaled(2) }}>
                        {name}: {displayBlendshapes[name]?.toFixed(3) ?? 'N/A'}
                      </div>
                    ))}
                  </div>
                </div>
              )} */}
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
              margin: `${scaled(20)} auto 0`,
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
                onClick={handlePrevLine}
                ariaLabel="Previous line"
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
                height: '100%',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* 스크롤 가능한 가사 영역 */}
              <div
                style={{
                  width: '100%',
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  // Custom scrollbar styling
                  scrollbarWidth: 'thin', // Firefox
                  scrollbarColor: `${COLORS.textSecondary}40 transparent`, // Firefox: thumb and track
                  marginBottom: scaled(16),
                }}
                className="transparent-scrollbar"
              >
                <LyricsCard>
                  {/* 고정된 가사 영역 */}
                  <div
                    style={{
                      ...flexColumn,
                      alignItems: 'center',
                      gap: scaled(18),
                      flexShrink: 0, // Prevent lyrics from shrinking
                      marginBottom: scaled(24),
                    }}
                  >
                    {/* 한글 가사 */}
                    <div
                      style={{
                        fontSize: scaled(
                          getAdaptiveFontSize(displayLine.originalText ?? '', 42, 42, 36),
                        ),
                        fontWeight: FONT_WEIGHTS.semibold,
                        letterSpacing: '0.03em',
                        color: COLORS.dark,
                        textAlign: 'center',
                      }}
                    >
                      {highlightedLyric}
                    </div>

                    {/* 영어 가사 */}
                    <div
                      style={{
                        fontSize: scaled(
                          getAdaptiveFontSize(displayLine.textEng ?? '', 24, 24, 20),
                        ),
                        fontWeight: FONT_WEIGHTS.light,
                        color: COLORS.textSecondary,
                        textAlign: 'center',
                      }}
                    >
                      {displayLine.textEng}
                    </div>

                    {/* 로마자 가사 */}
                    <div
                      style={{
                        fontSize: scaled(
                          getAdaptiveFontSize(displayLine.textRomaja ?? '', 32, 32, 24),
                        ),
                        fontWeight: FONT_WEIGHTS.semibold,
                        color: COLORS.textSecondary,
                        textAlign: 'center',
                      }}
                    >
                      {displayLine.textRomaja}
                    </div>
                  </div>
                </LyricsCard>

                {/* 피드백 영역 (스크롤 가능) */}
                <div
                  style={{
                    width: '100%',
                    position: 'relative',
                    marginTop: scaled(16),
                  }}
                >
                  <VowelFeedback
                    activeVowel={displayVowel}
                    currentBlendshapes={displayBlendshapes}
                    currentIndex={
                      isRecording && isTtsPlaying && currentTtsIndex !== null
                        ? currentTtsIndex
                        : null
                    }
                    lyricChars={lyricChars}
                    feedbackItems={segmentFeedbacks}
                    shouldDisplay={showFeedback}
                    onSegmentFeedback={handleSegmentFeedback}
                    onReset={handleResetSegmentFeedbacks}
                    resetKey={selected?.lyricLineId}
                    flagAccumulatorRef={flagAccumulatorRef}
                    mouthScoreRef={mouthScoreRef}
                    totalVowelCountRef={totalVowelCountRef}
                    isActive={isRecording}
                  />
                </div>
              </div>

              <div
                style={{
                  width: '100%',
                  flexShrink: 0,
                }}
              >
                <ScoreBar isLoading={isLoading} score={score} mouthScore={mouthScoreRef.current} />
              </div>
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
                onClick={handleNextLine}
                ariaLabel="Next line"
                buttonStyle={{
                  width: scaled(60),
                  height: scaled(60),
                }}
              />
            </div>
          </div>
        </div>
        {/* 버튼 영역 */}
        <div
          style={{
            width: '100%',
            overflow: 'visible',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `${scaled(60)} 0 ${scaled(32)}`, // 상단 패딩 증가
            gap: scaled(80),
            minHeight: scaled(120),
            zIndex: 3,
          }}
        >
          <button
            onClick={handleMicClick}
            style={{
              width: scaled(80),
              height: scaled(80),
              border: 'none',
              outline: 'none',
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
            style={{
              width: scaled(80),
              height: scaled(80),
              border: 'none',
              outline: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BtnListenRecording
              key={displayLine.lyricLineId}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </button>

          <div
            style={{
              position: 'relative',
              width: scaled(80),
              height: scaled(80),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* TTS 재생 버튼 */}
            <button
              onClick={() => {
                setIsRecording(false);
                stopTts();
                playTts();
              }}
              disabled={!displayLine.nativeAudioUrl}
              style={{
                width: scaled(80),
                height: scaled(80),
                border: 'none',
                outline: 'none',
                background: 'transparent',
                cursor: 'pointer',
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

            {/* 배속 선택 버튼 (작은 텍스트) */}
            <button
              onClick={() => {
                const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
                const nextIndex = (currentIndex + 1) % PLAYBACK_RATES.length;
                setPlaybackRate(PLAYBACK_RATES[nextIndex]);
              }}
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: `${scaled(4)} ${scaled(8)}`,
                fontSize: scaled(16),
                fontWeight: FONT_WEIGHTS.semibold,
                color: COLORS.primary,
                marginTop: scaled(4),
                whiteSpace: 'nowrap',
              }}
            >
              {playbackRate}x
            </button>
          </div>
        </div>
      </div>

      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${scaled(8)} ${scaled(27)}`,
          boxSizing: 'border-box',
          backgroundColor: '#f8f6f7',
          zIndex: 1000,
        }}
      >
        <div
          style={{ opacity: 0.8, color: '#313131', fontFamily: FONTS.primary, fontSize: '12px' }}
        >
          © {new Date().getFullYear()} SayJong. All rights reserved.
        </div>
        <button
          onClick={() => {
            if (songIdParam) {
              navigate(`/lesson/${songIdParam}`);
            }
          }}
          style={{
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
          END
        </button>
      </footer>
    </div>
  );
};

export default LinePractice;
