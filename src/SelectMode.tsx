import type { CSSProperties, FunctionComponent } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './components/Header';
import LessonCard from './components/LessonCard';
import WordIcon from './assets/Word.svg';
import LyricLinesIcon from './assets/Lyric Lines.svg';
import ArtistIcon from './assets/artist.svg';
import ArrowLeftIcon from './assets/arrow_left.svg';
import type { Song } from './api/songs/types';
import { getSong } from './api/songs';

type SelectModeProps = Record<string, never>;

const SelectMode: FunctionComponent<SelectModeProps> = () => {
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
      gap: '60px', // 80px × 0.75
      padding: '48px 18px', // 64px × 0.75, 24px × 0.75
      boxSizing: 'border-box',
    },
    songInfo: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px', // 16px × 0.75
      textAlign: 'center',
      fontFamily: 'Pretendard',
    },
    songTitle: {
      fontSize: '36px', // 48px × 0.75
      fontWeight: 600,
      color: '#000',
      margin: 0,
    },
    artistName: {
      fontSize: '24px', // 32px × 0.75
      color: '#000',
      margin: 0,
    },
    lessonContainer: {
      width: '100%',
      maxWidth: '900px', // 1200px × 0.75
      minWidth: '720px', // 960px × 0.75
      height: '421.5px', // 562px × 0.75
      boxShadow: '0px 3px 3px rgba(0, 0, 0, 0.25)', // 4px × 0.75
      borderRadius: '22.5px', // 30px × 0.75
      backgroundColor: '#ffe9f4',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '27px 24px 19.5px', // 36px × 0.75, 32px × 0.75, 26px × 0.75
      boxSizing: 'border-box',
      position: 'relative',
      gap: '18px', // 24px × 0.75
    },
    lessonTitle: {
      fontSize: '30px', // 40px × 0.75
      fontWeight: 600,
      color: '#000',
      margin: 0,
      zIndex: 0,
    },
    cardsWrapper: {
      width: '100%',
      height: '276px', // 368px × 0.75
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-evenly', // 균등하게 분배
      flexWrap: 'nowrap', // 한 줄로 고정
      padding: '7.5px 24px', // 좌우 패딩 추가
      boxSizing: 'border-box',
      gap: '18px', // 간격 조정
      zIndex: 1,
    },
    changeSongButton: {
      position: 'absolute',
      bottom: '27px', // 36px × 0.75
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: '14.25px', // 19px × 0.75
      zIndex: 2,
      fontSize: '18px', // 24px × 0.75
      color: '#313131',
      cursor: 'pointer',
      transition: 'opacity 0.2s ease',
      whiteSpace: 'nowrap', // 한 줄로 표시
    },
    arrowIcon: {
      width: '37.5px', // 50px × 0.75
      height: '37.5px', // 50px × 0.75
      objectFit: 'contain',
    },
  };

  // 레슨 데이터
  const lessonList = [
    {
      id: 1,
      title: 'Syllable',
      subtitle: 'Lesson',
      description: 'Master each sound',
      iconSrc: WordIcon,
      lessonType: 'syllable' as const,
    },
    {
      id: 2,
      title: 'Line',
      subtitle: 'Lesson',
      description: 'Sing phrase by phrase',
      iconSrc: LyricLinesIcon,
      lessonType: 'line' as const,
    },
    {
      id: 3,
      title: 'Sing',
      subtitle: 'Along',
      description: "Let's Sing",
      iconSrc: ArtistIcon,
      lessonType: 'singalong' as const,
    },
  ];

  const navigate = useNavigate();
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

  const handleStartLesson = (lessonType: 'syllable' | 'line' | 'singalong') => {
    if (!songId) return;

    if (lessonType === 'syllable') {
      navigate(`/lesson/${songId}/syllable/1`);
    } else if (lessonType === 'line') {
      navigate(`/lesson/${songId}/line/1`);
    } else if (lessonType === 'singalong') {
      navigate(`/lesson/${songId}/sing`);
    }
  };

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

      <div style={styles.content}>
        <div style={styles.songInfo}>
          <div style={styles.songTitle}>"{song?.title || 'Song Not Found'}"</div>
          <div style={styles.artistName}>{song?.singer || '...'}</div>
        </div>

        <div style={styles.lessonContainer}>
          <div style={styles.lessonTitle}>Choose your lesson</div>

          <div style={styles.cardsWrapper}>
            {lessonList.map(lesson => (
              <div
                key={lesson.id}
                onClick={() => handleStartLesson(lesson.lessonType)}
                style={{
                  flex: '1',
                  display: 'flex',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <LessonCard
                  title={lesson.title}
                  subtitle={lesson.subtitle}
                  description={lesson.description}
                  iconSrc={lesson.iconSrc}
                />
              </div>
            ))}
          </div>

          <div
            style={styles.changeSongButton}
            onClick={() => navigate('/home')}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = '0.7';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <img style={styles.arrowIcon} src={ArrowLeftIcon} alt="arrow" />
            <div>Change Song</div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SelectMode;
