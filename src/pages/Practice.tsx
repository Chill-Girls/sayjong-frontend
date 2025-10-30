import type { FunctionComponent } from 'react';
import CameraComponent from '../components/CameraComponent';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MicIcon from '../assets/mic.svg';
import { COLORS, FONTS, FONT_WEIGHTS } from '../styles/theme';
import { containerFullscreen, flexColumn, card, scaled } from '../styles/mixins';

/**
 * 좌표 & 블렌드 shape 확인
 */
interface CalibrationProps {
  modeButtons?: React.ReactNode;
}

const Calibration: FunctionComponent<CalibrationProps> = ({ modeButtons }) => {
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
          Watch the camera
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
          maxWidth: scaled(1200),
          zIndex: 2,
          fontSize: scaled(128),
        }}
      >
        {/* 왼쪽: 카메라 & 마이크 */}
        <div
          style={{
            flex: 1,
            ...flexColumn,
            alignItems: 'center',
            justifyContent: 'center',
            gap: scaled(82),
            minWidth: scaled(520),
            maxWidth: scaled(592),
          }}
        >
          <CameraComponent />
          <div
            style={{
              ...flexColumn,
              alignItems: 'center',
              gap: scaled(12),
            }}
          >
            <img
              style={{
                width: scaled(50),
                position: 'relative',
                maxHeight: '100%',
              }}
              src={MicIcon}
              alt="Microphone"
            />
            {modeButtons}
          </div>
        </div>

        {/* 오른쪽: Landmarks 표시 */}
        <div
          style={{
            flex: 1,
            ...card,
            ...flexColumn,
            alignItems: 'center',
            justifyContent: 'center',
            gap: scaled(20),
            minWidth: scaled(480),
          }}
        >
          <div
            style={{
              width: '100%',
              ...flexColumn,
              gap: scaled(16),
              maxHeight: scaled(600),
              overflowY: 'auto',
            }}
          >
            <h3
              style={{
                fontSize: scaled(20),
                fontWeight: FONT_WEIGHTS.semibold,
                color: COLORS.primary,
                margin: 0,
                textAlign: 'center',
              }}
            >
              Face Landmarks & Blendshapes
            </h3>
            <div
              id="landmarks-display"
              style={{
                backgroundColor: '#f8f9fa',
                borderRadius: scaled(12),
                padding: scaled(16),
                fontFamily: "'Courier New', monospace",
                fontSize: scaled(12),
                lineHeight: 1.4,
                maxHeight: scaled(500),
                overflowY: 'auto',
                border: '1px solid #e9ecef',
              }}
            >
              {/* 랜드마크와 블렌드쉐이프가 여기에 표시됩니다 */}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Calibration;
