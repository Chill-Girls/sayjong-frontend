import type { FunctionComponent } from 'react';
import { useEffect } from 'react';
import { useMode } from '../constants/ModeContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CameraComponent from '../components/CameraComponent';
import BtnMic from '../components/Btn_Mic';
import BtnListenRecording from '../components/Btn_ListenRecording';
import BtnTts from '../components/Btn_Tts';
import BtnPrev from '../components/Btn_prev';
import BtnNext from '../components/Btn_next';
import { exampleLinePracticeData } from '../temp/examplelyricsdata';
import { COLORS, FONTS, FONT_WEIGHTS, BORDER_RADIUS } from '../styles/theme';
import { containerFullscreen, flexColumn, scaled } from '../styles/mixins';
import { extractVowels } from '../utils/hangul';

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

const LinePractice: FunctionComponent<LinePracticeProps> = () => {
  const { setMode } = useMode();

  useEffect(() => {
    setMode('line');
    return () => setMode(null);
  }, [setMode]);

  // 예시 데이터
  const songTitle = 'Soda Pop';
  const singer = 'Saja Boys';
  const currentLine = exampleLinePracticeData[0];
  const vowels = extractVowels(currentLine.originalText);

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
            <CameraComponent width={scaled(700)} height={scaled(449)} vowels={vowels} />
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

          <BtnPrev
            style={{
              width: scaled(100),
              height: scaled(100),
              filter: 'brightness(0.5)',
              marginTop: scaled(40),
            }}
          />

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
                fontSize: scaled(getAdaptiveFontSize(currentLine.originalText, 56, 56, 40)),
                fontWeight: FONT_WEIGHTS.semibold,
                letterSpacing: '0.05em',
                color: COLORS.dark,
                textAlign: 'center',
              }}
            >
              {currentLine.originalText}
            </div>

            {/* 영어 가사 */}
            <div
              style={{
                fontSize: scaled(getAdaptiveFontSize(currentLine.textEng, 32, 32, 24)),
                fontWeight: FONT_WEIGHTS.light,
                color: COLORS.textSecondary,
                textAlign: 'center',
              }}
            >
              {currentLine.textEng}
            </div>

            {/* 로마자 가사 */}
            <div
              style={{
                fontSize: scaled(getAdaptiveFontSize(currentLine.tesxRomaja, 40, 40, 28)),
                fontWeight: FONT_WEIGHTS.semibold,
                color: COLORS.textSecondary,
                textAlign: 'center',
              }}
            >
              {currentLine.tesxRomaja}
            </div>
          </div>

          {/* 다음 버튼 */}

          <BtnNext
            style={{
              width: scaled(100),
              height: scaled(100),
              filter: 'brightness(0.5)',
              marginTop: scaled(40),
            }}
          />
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
