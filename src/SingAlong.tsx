import type { CSSProperties, FunctionComponent } from 'react';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CameraComponent from './components/CameraComponent';
import type { Song } from './api/songs/types';
import { useParams } from 'react-router-dom';
import { getSong } from './api/songs';
import KaraokeLine from './components/KaraokeLine';

type SingAlongProps = object;

const SingAlong: FunctionComponent<SingAlongProps> = () => {
  const [currentTime, setCurrentTime] = useState(0);

  const line = {
    textOriginal: '읽기쉬운맘',
    startTime: 0,
    endTime: 4.5,
    syllables: [
      { text: '읽', start: 0.0, end: 1.0 },
      { text: '기', start: 1.0, end: 2.0 },
      { text: '쉬', start: 2.0, end: 3.0 },
      { text: '운', start: 3.0, end: 3.5 },
      { text: '맘', start: 3.5, end: 4.5 },
    ],
  };

  useEffect(() => {
    const startTime = Date.now();

    const update = () => {
      const elapsed = (Date.now() - startTime) / 1000; // 초 단위로 변환
      setCurrentTime(elapsed);
      requestAnimationFrame(update);
    };

    const animationId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animationId);
  }, []);

  const styles: { [key: string]: CSSProperties } = {
    container: {
      width: '100vw',
      minHeight: '100vh',
      backgroundColor: '#f8f6f7',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '12px 0', // 16px × 0.75
      paddingTop: '55.5px', // Header 높이만큼
      paddingBottom: '80px',
      boxSizing: 'border-box',
      gap: '24.75px', // 33px × 0.75
      textAlign: 'left',
      fontSize: '24px', // 32px × 0.75
      color: '#000',
      fontFamily: 'Pretendard',
    },
    frame: {
      width: '15px', // 20px × 0.75
      height: '15px', // 20px × 0.75
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
      zIndex: 1,
    },
    titleSection: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px', // 8px × 0.75
      zIndex: 2,
      textAlign: 'center',
      fontSize: '30px', // 40px × 0.75
    },
    singAlong: {
      position: 'relative',
      fontWeight: 500,
      margin: 0,
    },
    songTitle: {
      position: 'relative',
      fontSize: '27px', // 36px × 0.75
      fontWeight: 300,
      textAlign: 'left',
      margin: 0,
    },
    cameraWrapper: {
      position: 'relative',
      zIndex: 3,
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center',
    },
  };
  const { songId } = useParams();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (songId) {
      setLoading(true);
      getSong(Number(songId))
        .then(data => {
          setSong(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch song:', err);
          setLoading(false);
        });
    }
  }, [songId]);

  if (loading) {
    return (
      <div style={styles.container}>
        <Header />
        <div style={styles.content}>
          <div style={styles.songInfo}>
            <div style={styles.songTitle}>Loading song...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Header />

      <div style={styles.frame} />

      <div style={styles.titleSection}>
        <div style={styles.singAlong}>Sing Along</div>
        <div style={styles.songTitle}>
          "{song?.title || 'Song Not Found'} - {song?.singer || '...'}"
        </div>
      </div>

      <div style={styles.cameraWrapper}>
        <CameraComponent width="803.25px" height="307.5px" />
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          marginTop: '20px',
        }}
      >
        <KaraokeLine line={line} currentTime={currentTime} />
      </div>

      <Footer />
    </div>
  );
};

export default SingAlong;
