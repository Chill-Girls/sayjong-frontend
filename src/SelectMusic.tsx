import type { CSSProperties, FunctionComponent } from 'react';
import { useState, useEffect } from 'react';
import Header from './Components/Header';
import MusicCard from './Components/MusicCard';
import { getSongs } from './api/songs';
import type { Song } from './api/songs/types';

interface SelectMusicProps {
  currentPage: 'home' | 'lesson' | 'history';
  onNavigate: (page: 'home' | 'lesson' | 'history') => void;
  onSelectMusic: (song: { title: string; artist: string }) => void;
}

const SelectMusic: FunctionComponent<SelectMusicProps> = ({
  currentPage,
  onNavigate,
  onSelectMusic,
}) => {
  const styles: { [key: string]: CSSProperties } = {
    container: {
      width: '100vw',
      minHeight: '100vh',
      backgroundColor: '#f8f6f7',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '55.5px', // 74px × 0.75
    },
    content: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '48px', // 64px × 0.75
      padding: '48px 18px', // 64px × 0.75, 24px × 0.75
      boxSizing: 'border-box',
    },
    titleSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '18px', // 24px × 0.75
      textAlign: 'center',
      fontFamily: 'Pretendard',
    },
    mainTitle: {
      fontSize: '36px', // 48px × 0.75
      fontWeight: 'bold',
      color: '#000',
      margin: 0,
    },
    subTitle: {
      fontSize: '24px', // 32px × 0.75
      color: '#000',
      margin: 0,
    },
    cardsGrid: {
      width: '85%', // 양 끝 마진 추가
      maxWidth: '1200px', // 줄임
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', // 240px × 0.75
      gap: '18px', // 24px × 0.75
      padding: '0 18px', // 24px × 0.75
      boxSizing: 'border-box',
    },
    cardWrapper: {
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
    },
  };

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        const data = await getSongs();
        setSongs(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []); // 컴포넌트 마운트 시 1회 실행

  if (loading) {
    return (
      <div style={styles.container}>
        <Header currentPage={currentPage} onNavigate={onNavigate} />
        <div style={styles.content}>
          <div style={styles.titleSection}>
            <div style={styles.mainTitle}>Loading Songs...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <Header currentPage={currentPage} onNavigate={onNavigate} />
        <div style={styles.content}>
          <div style={styles.titleSection}>
            <div style={styles.mainTitle}>Error: {error}</div>
            <div style={styles.subTitle}>노래를 불러오는 데 실패했습니다.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Header currentPage={currentPage} onNavigate={onNavigate} />

      <div style={styles.content}>
        <div style={styles.titleSection}>
          <div style={styles.mainTitle}>Practice Your Favorite Song</div>
          <div style={styles.subTitle}>Songs</div>
        </div>

        <div style={styles.cardsGrid}>
          {songs.map(music => (
            <div
              key={music.songId}
              style={styles.cardWrapper}
              onClick={() => onSelectMusic({ title: music.title, artist: music.singer })}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <MusicCard
                title={music.title}
                artist={music.singer}
                albumId={music.songId}
                coverUrl={music.coverUrl}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectMusic;
