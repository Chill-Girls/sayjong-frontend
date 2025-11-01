import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSongLyricLines } from '../api/songs';
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

interface LinePracticeProps {
  modeButtons?: React.ReactNode;
}

export interface LinePracticeData {
  songId: number;
  lyricLineId: number;
  originalText: string;
  tesxRomaja: string;
  textEng: string;
  startTime: number;
} // 노래 제목, 가수도 받아와야 할 거 같음. constansg/exampleLinePracticeData 참고

const LinePractice: React.FC<LinePracticeProps> = () => {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  const { setMode } = useMode();
  const [lines, setLines] = useState<LyricLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<LyricLine | null>(null);

  // 마지막(빈) 소절을 제외한 실제 사용 가능한 소절 배열
  const usableLines = React.useMemo(() => {
    if (!lines || lines.length === 0) return [] as LyricLine[];
    // 마지막 항목이 빈 소절(또는 sentinel)이라면 제외
    return lines.length > 1 ? lines.slice(0, lines.length - 1) : lines;
  }, [lines]);

  useEffect(() => {
    setMode('line');
    return () => setMode(null);
  }, [setMode]);

  useEffect(() => {
    if (!songId) return;
    const id = Number(songId);
    if (Number.isNaN(id)) {
      setError('유효하지 않은 노래 ID입니다.');
      return;
    }

    const fetchLines = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getSongLyricLines(id);
        setLines(res);
        // 선택은 usableLines의 첫 번째로 설정 (마지막 빈 항목 제외)
        const first = res.length > 1 ? res[0] : res[0];
        setSelected(first ?? null);
      } catch (err) {
        console.error('getSongLyricLines error', err);
        setError('가사 소절을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchLines();
  }, [songId]);

  // 화면에 보여줄 소절 선택(선택된 소절 또는 usableLines의 첫 소절 또는 빈값)
  const displayLine = selected ?? usableLines[0] ?? {
    lyricLineId: 0,
    lineNo: 0,
    originalText: '',
    textRomaja: '',
    textEng: '',
    startTime: 0,
  };

  // 현재 표시 중인 소절 인덱스(1-based) 및 전체 개수 — usableLines 기준
  const totalLines = usableLines.length;
  const currentIndex = usableLines.findIndex((l) => l.lyricLineId === displayLine.lyricLineId);
  const displayIndex = currentIndex >= 0 ? currentIndex + 1 : 0;

  // 예시 데이터
  const songTitle = 'Soda Pop';
  const singer = 'Saja Boys';

  // 글자 수에 따라 폰트 크기를 조정하는 함수
  const getAdaptiveFontSize = (
    text: string,
    baseSize: number,
    maxSize: number,
    minSize: number,
  ) => {
    // 한글은 2바이트, 영문은 1바이트로 계산
    // 대략적인 비율: 한글 1자 ≈ 영문 1.5자
    const approxChars =
      text.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '').length * 1 +
      (text.match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g) || []).length * 1.5;

    // 글자 수가 많을수록 폰트 크기를 줄임
    if (approxChars > 20) {
      const adjustedSize = Math.max(minSize, baseSize * (20 / approxChars));
      return Math.min(maxSize, adjustedSize);
    }
    return Math.min(maxSize, baseSize);
  };

  const handleMicClick = () => {
    console.log('마이크 버튼 클릭');
  };

  const handleMyRecordingClick = () => {
    console.log('내 녹음 듣기 버튼 클릭');
  };

  // 이전/다음 소절 이동 핸들러
  const handlePrevLine = () => {
    if (!usableLines || usableLines.length === 0) return;
    const idx = usableLines.findIndex((l) => l.lyricLineId === (selected?.lyricLineId ?? usableLines[0].lyricLineId));
    if (idx > 0) setSelected(usableLines[idx - 1]);
  };

  const handleNextLine = () => {
    if (!usableLines || usableLines.length === 0) return;
    const idx = usableLines.findIndex((l) => l.lyricLineId === (selected?.lyricLineId ?? usableLines[0].lyricLineId));
    if (idx >= 0 && idx < usableLines.length - 1) setSelected(usableLines[idx + 1]);
  };

  if (!songId) {
    return <div>노래 ID가 제공되지 않았습니다.</div>;
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
          {songTitle} - {singer}
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: scaled(40),
          padding: `0 ${scaled(50)}`,
          zIndex: 2,
        }}
      >
        {/* 카메라 영역 */}
        <div
          style={{
            flex: 1,
            ...flexColumn,
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: scaled(550),
          }}
        >
          <div
            style={{
              width: scaled(700),
              height: scaled(449),
              position: 'relative',
              backgroundColor: COLORS.gray,
              borderRadius: BORDER_RADIUS.md,
            }}
          >
            <CameraComponent width={scaled(700)} height={scaled(449)} />
          </div>
        </div>

        {/* 가사 영역 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: scaled(30),
            minWidth: scaled(400),
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
              gap: scaled(20),
              flex: 1,
              maxWidth: scaled(600),
            }}
          >
            {/* 한글 가사 */}
            <div
              style={{
                fontSize: scaled(
                  getAdaptiveFontSize(displayLine.originalText ?? '', 56, 56, 40),
                ),
                fontWeight: FONT_WEIGHTS.semibold,
                letterSpacing: '0.05em',
                color: COLORS.dark,
                textAlign: 'center',
              }}
            >
              {displayLine.originalText}
            </div>

            {/* 영어 가사 */}
            <div
              style={{
                fontSize: scaled(
                  getAdaptiveFontSize(displayLine.textEng ?? '', 32, 32, 24),
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
                  getAdaptiveFontSize(displayLine.textRomaja ?? '', 40, 40, 28),
                ),
                fontWeight: FONT_WEIGHTS.semibold,
                color: COLORS.textSecondary,
                textAlign: 'center',
              }}
            >
              {displayLine.textRomaja}
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

      {/* 버튼 영역 */}
      <div
        style={{
          alignSelf: 'stretch',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `0 ${scaled(193)}`,
          gap: scaled(80),
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
          }}
        >
          <BtnMic
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
            }}
          />
        </button>

        <button
          onClick={handleMyRecordingClick}
          style={{
            width: scaled(80),
            height: scaled(80),
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <BtnListenRecording
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
            }}
          />
        </button>

        <BtnTts
          style={{
            width: scaled(80),
            height: scaled(80),
            objectFit: 'cover',
            borderRadius: '50%',
          }}
        />
      </div>

      <Footer />
    </div>
  );
};

export default LinePractice;
