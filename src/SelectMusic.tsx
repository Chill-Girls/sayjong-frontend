import type { CSSProperties, FunctionComponent } from 'react';
import Header from './Components/Header';
import MusicCard from './Components/MusicCard';

const SelectMusic: FunctionComponent = () => {
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

  // 임시 데이터
  const musicList = [
    { id: 1, title: 'Lovers who hesitate', artist: 'Jannabi' },
    { id: 2, title: 'How You Like That', artist: 'BLACK PINK' },
    { id: 3, title: 'Dynamite', artist: 'BTS' },
    { id: 4, title: 'INVU', artist: '태연' },
    { id: 5, title: 'Next Level', artist: 'aespa' },
    { id: 6, title: 'STAY', artist: 'The Kid LAROI & Justin Bieber' },
    { id: 7, title: 'Permission to Dance', artist: 'BTS' },
    { id: 8, title: 'Celebrity', artist: 'IU' },
  ];

  return (
    <div style={styles.container}>
      <Header />
      
      <div style={styles.content}>
        <div style={styles.titleSection}>
          <div style={styles.mainTitle}>Practice Your Favorite Song</div>
          <div style={styles.subTitle}>Songs</div>
        </div>

        <div style={styles.cardsGrid}>
          {musicList.map((music) => (
            <div 
              key={music.id} 
              style={styles.cardWrapper}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <MusicCard
                title={music.title}
                artist={music.artist}
                albumId={music.id}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectMusic;
