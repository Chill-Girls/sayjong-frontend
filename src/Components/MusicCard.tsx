import type { CSSProperties, FunctionComponent } from 'react';

interface MusicCardProps {
  title?: string;
  artist?: string;
  coverUrl?: string | null;
  albumId?: string | number;
}

const MusicCard: FunctionComponent<MusicCardProps> = ({
  title = 'Unknown',
  artist = 'Unknown',
  coverUrl,
}) => {
  const styles: { [key: string]: CSSProperties } = {
    container: {
      height: '227px', // 303px × 0.75
      width: '100%',
      position: 'relative',
      backgroundColor: '#f8f6f7',
      overflow: 'hidden',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 4.5px 2.25px', // 32px × 0.75, 6px × 0.75, 3px × 0.75
      boxSizing: 'border-box',
      gap: '12.75px', // 17px × 0.75
      minWidth: '180px', // 240px × 0.75
      textAlign: 'left',
      fontSize: '12px', // 16px × 0.75
      color: '#000',
      fontFamily: 'Pretendard',
    },
    infoContainer: {
      width: '140px', // 앨범 커버와 같은 너비
      margin: 0,
      position: 'absolute',
      bottom: '6.75px', // 9px × 0.75
      left: '50%', // 중앙 기준
      transform: 'translateX(-50%)', // 앨범과 동일하게 중앙 정렬
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-end',
      gap: '6px', // 8px × 0.75
      zIndex: 2,
    },
    title: {
      alignSelf: 'stretch',
      position: 'relative',
      letterSpacing: '-0.02em',
    },
    artist: {
      alignSelf: 'stretch',
      position: 'relative',
      fontSize: '10.5px', // 14px × 0.75
      letterSpacing: '-0.02em',
      fontWeight: 300,
      color: '#505050',
    },
    image: {
      width: '140px', // 정사각형 크기
      height: '140px', // 정사각형 크기
      position: 'absolute',
      margin: 0,
      top: '24px',
      left: '50%', // 중앙 정렬
      transform: 'translateX(-50%)', // 중앙 정렬
      borderRadius: '22.5px',
      overflow: 'hidden',
      objectFit: 'cover',
      zIndex: 1,
    },
    // 회색 플레이스홀더를 위한 스타일 추가
    imagePlaceholder: {
      backgroundColor: '#e0e0e0', // 회색 배경
      width: '140px',
      height: '140px',
      position: 'absolute',
      margin: 0,
      top: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      borderRadius: '22.5px',
      overflow: 'hidden',
      zIndex: 1,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.infoContainer}>
        <div style={styles.title}>{title}</div>
        <div style={styles.artist}>{artist}</div>
      </div>
      {coverUrl ? (
        <img style={styles.image} src={coverUrl} alt={`${title} - ${artist}`} />
      ) : (
        <div style={styles.imagePlaceholder} />
      )}
    </div>
  );
};

export default MusicCard;
