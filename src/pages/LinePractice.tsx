import type { FunctionComponent } from 'react';
import { useEffect, useState } from 'react';
import { useMode } from '../context/ModeContext';
import CameraComponent from '../components/CameraComponent';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MicIcon from '../assets/mic.svg';
import { COLORS, FONTS, FONT_WEIGHTS } from '../styles/theme';
import { containerFullscreen, flexColumn, card, scaled } from '../styles/mixins';



interface LinePracticeProps {
  modeButtons?: React.ReactNode;
}

interface LinePracticeData {
  lineId: number;
  textKor: string;
  textRomaja: string;
  textEng: string;
  nativeAudioUrl: string;
  songId: number;
}

export const exampleLinePracticeData: LinePracticeData = {
    lineId: 1,
    textKor:
      '나는 읽기 쉬운 마음이야\n\n' +
      '당신도 쓱 훑고 가셔요\n\n' +
      '달랠 길 없는 외로운 마음 있지\n\n' +
      '머물다 가셔요\n\n' +
      '내게 긴 여운을 남겨줘요\n\n' +
      '사랑을, 사랑을 해줘요\n\n' +
      '할 수 있다면 그럴 수만 있다면\n\n' +
      '새하얀 빛으로 그댈 비춰 줄게요',
    textRomaja:
      'Naneun ilggi swiun maeumiya\n\n' +
      'Dangsin-do sseuk hulgo gasyeoyo\n\n' +
      'Dallael gil eomneun oeroun maeum itji\n\n' +
      'Meomulda gasyeoyo\n\n' +
      'Naege gin yeouneul namgyeojwoyo\n\n' +
      'Sarangeul, sarangeul haejwoyo\n\n' +
      'Hal su ittamyeon geureol suman ittamyeon\n\n' +
      'Saehayan bich-euro geudael bichwo julgeyo',
    textEng:
      "I'm a heart easy to read\n\n" +
      'You may just glance and pass by\n\n' +
      'There lies a lonely heart with no way to be soothed\n\n' +
      'Stay for a while\n\n' +
      'Leave a lingering trace in me\n\n' +
      'Love me, just love me\n\n' +
      'If I could, if only I could\n\n' +
      'I’ll shine upon you with pure white light',
    nativeAudioUrl: '',
    songId: 1,
  };
  


const LinePractice: FunctionComponent<LinePracticeProps> = ({ modeButtons }) => {
  const [showCamera, setShowCamera] = useState(false);
  const { setMode } = useMode();
  useEffect(() => {
    setMode('line');
    return () => setMode(null);
  }, [setMode]);
  return (
    <div
      style={{
        ...containerFullscreen,
        height: '100vh',
        justifyContent: 'center',
        gap: scaled(64),
        textAlign: 'left',
        fontSize: scaled(32),
        color: COLORS.primary,
        fontFamily: FONTS.primary,
        paddingTop: scaled(74),
        paddingBottom: scaled(100),
      }}
    >
      <Header />

      {/* 타이틀 */}
      <div
        style={{
          alignSelf: 'stretch',
          ...flexColumn,
          alignItems: 'center',
          gap: scaled(8),
          zIndex: 1,
          textAlign: 'center',
          fontSize: scaled(35),
          color: COLORS.dark,
        }}
      >
        <div
          style={{
            position: 'relative',
            fontWeight: FONT_WEIGHTS.medium,
          }}
        >
          Line Practice
        </div>
        <div
          style={{
            position: 'relative',
            fontSize: scaled(30),
            fontWeight: FONT_WEIGHTS.light,
            textAlign: 'left',
          }}
        >
          Please pronouce these vowels
        </div>
      </div>

      {/* 메인 컨테이너 */}
      <div
        style={{
          width: '100%',
          backgroundColor: COLORS.background,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: scaled(32),
          minWidth: scaled(1100),
          maxWidth: scaled(1400),
          zIndex: 2,
          fontSize: scaled(128),
        }}
      >
        {/* 왼쪽: 카메라 & 마이크 */}
        <div
          style={{
            flex: 1,
            ...flexColumn,
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: scaled(82),
            minWidth: scaled(520),
            maxWidth: scaled(592),
          }}
        >
          <div
            style={{
              width: scaled(750),
              height: scaled(475),
              borderRadius: scaled(12),
              backgroundColor: '#000',
              overflow: 'hidden',
              boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {showCamera ? (
              <CameraComponent />
            ) : (
              <div
                style={{
                  color: '#999',
                  fontSize: '16px',
                  textAlign: 'center',
                }}
              >
                Click the mic to start camera
              </div>
            )}
          </div>
          <div
            style={{
              ...flexColumn,
              alignItems: 'center',
              gap: scaled(12),
              width: scaled(750),
            }}
          >
            <img
              style={{
                width: scaled(50),
                position: 'relative',
                maxHeight: '100%',
                cursor: 'pointer',
              }}
              src={MicIcon}
              alt="Microphone"
              onClick={() => setShowCamera(prev => !prev)}
            />
            {modeButtons}
          </div>
        </div>

        {/* 오른쪽: 가사 표시 */}
        <div
          style={{
            flex: 1,
            ...card,
            ...flexColumn,
            alignItems: 'center',
            justifyContent: 'center',
            gap: scaled(16),
            minWidth: scaled(400),
            padding: scaled(24),
            marginLeft: scaled(32),
          }}
        >
          <div style={{ ...flexColumn, alignItems: 'right', justifyContent: 'center', gap: scaled(10), width: '100%' }}>
            <div
              style={{
                fontSize: scaled(24),
                fontWeight: FONT_WEIGHTS.semibold,
                color: COLORS.dark,
                textAlign: 'center',
              }}
            >
              {exampleLinePracticeData.textKor.split('\n').find(l => l.trim().length > 0) || ''}
            </div>
            <div
              style={{
                fontSize: scaled(18),
                color: COLORS.primary,
                textAlign: 'center',
              }}
            >
              {exampleLinePracticeData.textEng.split('\n').find(l => l.trim().length > 0) || ''}
            </div>
            <div
              style={{
                fontSize: scaled(18),
                color: '#666',
                textAlign: 'center',
              }}
            >
              {exampleLinePracticeData.textRomaja.split('\n').find(l => l.trim().length > 0) || ''}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LinePractice;
