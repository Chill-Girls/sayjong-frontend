import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSongLyricLines } from '../hooks/useSongs';
import type { LyricLine } from '../api/songs/types';
import { useMode } from '../constants/ModeContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
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
import { mapCharsWithMask } from '../utils/highlight';

const HIGHLIGHT_COLOR = '#F04455';

const LinePractice: React.FC = () => {
  const { songId: songIdParam } = useParams<{ songId: string }>();
  const { setMode } = useMode();
  const { isRecording, setRecordedAudioBlob, setIsRecording } = useRecording();

  // songId를 number로 변환
  const songId = songIdParam
    ? Number.isNaN(Number(songIdParam))
      ? null
      : Number(songIdParam)
    : null;

  // useSongLyricLines 훅 사용
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
  const [cameraWidth, setCameraWidth] = useState<string>(scaled(600)); // 초기값을 600으로 변경

  // 카메라 컨테이너 크기에 맞춰 CameraComponent 너비 업데이트
  useEffect(() => {
    const updateCameraWidth = () => {
      if (cameraContainerRef.current) {
        const rect = cameraContainerRef.current.getBoundingClientRect();
        const width = rect.width;
        // px 단위로 변환하여 CameraComponent에 전달
        setCameraWidth(`${width}px`);
      }
    };

    // 초기 크기 설정
    updateCameraWidth();

    // ResizeObserver로 크기 변경 감지
    const resizeObserver = new ResizeObserver(() => {
      updateCameraWidth();
    });

    if (cameraContainerRef.current) {
      resizeObserver.observe(cameraContainerRef.current);
    }

    // window resize 이벤트도 감지 (브라우저 zoom 포함)
    window.addEventListener('resize', updateCameraWidth);

    return () => {
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
        // console.error('LinePractice: localStorage 데이터 파싱 실패', e);
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
      setSongTitle(lyricData.title ?? '');
      setSinger(lyricData.singer ?? '');
      setSelected(lyricData.lyrics && lyricData.lyrics.length > 0 ? lyricData.lyrics[0] : null);
    } else if (lyricError || !songId) {
      setSelected(null);
      setLines([]);
      setSongTitle('');
      setSinger('');
    }
  }, [lyricData, lyricError, songId]);

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

  const { isLoading, score, error } = usePronunciationCheck(displayLine.originalText);

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
    } else {
      // 녹음 시작
      setIsRecording(true);
      setShowFeedback(false);
      setFailedMask(prev => prev.map(() => 0));
      handleResetSegmentFeedbacks();
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
        <Footer />
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
            fontWeight: FONT_WEIGHTS.light,
          }}
        >
          {songTitle} {singer ? `- ${singer}` : null}
        </div>

        {/* 현재 소절 위치 표시: "3 / 12" */}
        <div
          style={{
            marginTop: scaled(8),
            fontSize: scaled(14),
            color: COLORS.textSecondary,
            fontWeight: FONT_WEIGHTS.light,
          }}
        >
          {totalLines > 0 ? `Line ${displayIndex} / ${totalLines}` : 'No lyric lines'}
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
          gap: scaled(20),
          paddingLeft: scaled(50), // 좌측 마진
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
            maxWidth: scaled(1600), // 전체를 감싸는 컨테이너에 maxWidth를 주어 중앙 정렬 명확히
            display: 'flex',
            alignItems: 'flex-start', // 상단 정렬로 일관성 유지
            justifyContent: 'center', // 가운데 정렬
            gap: scaled(200), // 카메라와 가사 사이 간격 증가
            flex: 1,
            minHeight: 0,
            margin: '0 auto', // 양쪽 마진 균등
          }}
        >
          {/* 카메라 영역 */}
          <div
            style={{
              flex: '0 0 auto', // 고정 크기로 비율 유지
              ...flexColumn,
              alignItems: 'center',
              justifyContent: 'center',
              width: scaled(600), // 고정 너비
            }}
          >
            <div
              ref={cameraContainerRef}
              style={{
                width: '100%',
                aspectRatio: '1 / 1.58', // 가로:세로 비율 1:1.58
                position: 'relative',
                backgroundColor: 'transparent', // 회색 배경 제거
                borderRadius: BORDER_RADIUS.lg, // 더 둥근 모서리
                overflow: 'hidden', // 넘치는 부분 숨김
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
              flex: 1, // 남은 공간을 차지하도록
              display: 'flex',
              alignItems: 'flex-start', // 상단 정렬로 카메라와 일치
              justifyContent: 'center',
              gap: scaled(27), // 30 * 0.9
              minWidth: scaled(540), // 최소 너비
              maxWidth: scaled(800), // 최대 너비
              height: '100%', // 전체 높이 사용
              overflowY: 'auto', // 스크롤바를 가사 영역 외부에 표시
              overflowX: 'hidden',
              position: 'relative',
            }}
          >
            {/* 이전 버튼 */}

            <button
              onClick={handlePrevLine}
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
              aria-label="Previous line"
            >
              <BtnPrev
                style={{
                  width: '100%',
                  height: '100%',
                  filter: 'brightness(0.5)',
                }}
              />
            </button>

            {/* 가사 콘텐츠 */}
            <div
              style={{
                ...flexColumn,
                alignItems: 'center',
                gap: scaled(18), // 20 * 0.9
                flex: 1,
                maxWidth: scaled(540), // 600 * 0.9
                paddingBottom: scaled(20),
                paddingTop: scaled(20),
              }}
            >
              {/* 한글 가사 */}
              <div
                style={{
                  fontSize: scaled(getAdaptiveFontSize(displayLine.originalText ?? '', 56, 56, 40)),
                  fontWeight: FONT_WEIGHTS.semibold,
                  letterSpacing: '0.05em',
                  color: COLORS.dark,
                  textAlign: 'center',
                }}
              >
                {highlightedLyric}
              </div>

              {/* 영어 가사 */}
              <div
                style={{
                  fontSize: scaled(getAdaptiveFontSize(displayLine.textEng ?? '', 32, 32, 24)),
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
                  fontSize: scaled(getAdaptiveFontSize(displayLine.textRomaja ?? '', 40, 40, 28)),
                  fontWeight: FONT_WEIGHTS.semibold,
                  color: COLORS.textSecondary,
                  textAlign: 'center',
                }}
              >
                {displayLine.textRomaja}
              </div>

              {/* 모음 피드백 - 가사 아래에 여백과 함께 배치 */}
              <div style={{ marginTop: scaled(24), width: '100%' }}>
                <VowelFeedback
                  activeVowel={displayVowel}
                  currentBlendshapes={displayBlendshapes}
                  currentIndex={
                    isRecording && isTtsPlaying && currentTtsIndex !== null ? currentTtsIndex : null
                  }
                  lyricChars={lyricChars}
                  feedbackItems={segmentFeedbacks}
                  shouldDisplay={showFeedback}
                  onSegmentFeedback={handleSegmentFeedback}
                  onReset={handleResetSegmentFeedbacks}
                  resetKey={selected?.lyricLineId}
                />
              </div>
            </div>

            {/* 다음 버튼 */}

            <button
              onClick={handleNextLine}
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
              aria-label="Next line"
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

        {/* 임시: 발음 점수 표기 UI (TODO: 나중에 합쳐서 최종 점수로 나와야함, UI도 figma대로 변경해야함) */}
        <div
          style={{
            width: '100%',
            height: scaled(60), // 예시 높이
            ...flexColumn,
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: scaled(24),
            zIndex: 3,
            padding: '0', // 패딩 제거
          }}
        >
          {isLoading && <p>채점 중...</p>}
          {error && <p style={{ color: 'red' }}>오류: {error}</p>}
          {!isLoading && !error && score !== null && (
            <p style={{ color: COLORS.dark }}>🎉 발음 점수: {score}점</p>
          )}
        </div>

        {/* 버튼 영역 */}
        <div
          style={{
            width: '100%',
            overflow: 'visible',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `${scaled(20)} 0 ${scaled(32)}`, // 좌우 패딩 제거, 아래쪽 패딩 추가
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

      <Footer />
    </div>
  );
};

export default LinePractice;
