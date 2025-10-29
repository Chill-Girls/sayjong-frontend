import type { CSSProperties, FunctionComponent } from 'react';
import defaultImage from '../assets/Lovers who hesitate.png';
interface MusicCardProps {
  title?: string;
  artist?: string;
  imageUrl?: string; //개인적으로 imageurl 필요함... 현재 디폴트 이미지 사용중
  albumId?: string | number;
} // 데베에서 받아오는 데이터

const MusicCard: FunctionComponent<MusicCardProps> = ({
  title = 'Lovers who hesitate',
  artist = 'Jannabi',
  imageUrl = defaultImage,
  albumId: _albumId, // eslint-disable-line @typescript-eslint/no-unused-vars
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
  };

  return (
    <div style={styles.container}>
      <div style={styles.infoContainer}>
        <div style={styles.title}>{title}</div>
        <div style={styles.artist}>{artist}</div>
      </div>
      <img style={styles.image} src={imageUrl} alt={`${title} - ${artist}`} />
    </div>
  );
};

export default MusicCard;
