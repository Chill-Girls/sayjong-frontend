import type { CSSProperties, FunctionComponent } from 'react';
import { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CameraComponent from './components/CameraComponent';
import type { Song } from './api/songs/types';
import { useParams } from 'react-router-dom';
import { getSong } from './api/songs';

type SingAlongProps = object;

const SingAlong: FunctionComponent<SingAlongProps> = () => {
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
      paddingBottom: '80px', // Footer 높이만큼 여백 (버튼 크기 증가로 조정)
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

      <Footer />
    </div>
  );
};

export default SingAlong;
