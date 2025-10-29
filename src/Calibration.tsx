import { type FunctionComponent } from 'react';
import styles from './Calibration.module.css';
import CameraComponent from './components/CameraComponent';
import Header from './components/Header';
import Footer from './components/Footer';
import MicIcon from './assets/mic.svg';

/**
 * Calibration 컴포넌트
 * 발음 연습 메인 화면
 */
interface CalibrationProps {
  modeButtons?: React.ReactNode;
}

const Calibration: FunctionComponent<CalibrationProps> = ({ modeButtons }) => {
  return (
    <div className={styles.calibration}>
      <Header />

      <div className={styles.title}>
        <div className={styles.watchTheCamera}>Watch the camera</div>
        <div className={styles.pleasePronouceThese}>Please pronouce these vowels</div>
      </div>

      <div className={styles.container}>
        <div className={styles.rectangleParent}>
          <CameraComponent />
          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
          >
            <img className={styles.micIcon} src={MicIcon} alt="Microphone" />
            {modeButtons}
          </div>
        </div>
        <div className={styles.frameParent}>
          <div className={styles.landmarksContainer}>
            <h3 className={styles.landmarksTitle}>Face Landmarks & Blendshapes</h3>
            <div className={styles.landmarksDisplay} id="landmarks-display">
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
