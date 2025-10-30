import type { FunctionComponent } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import LessonCard from '../components/LessonCard';
import WordIcon from '../assets/Word.svg';
import LyricLinesIcon from '../assets/Lyric Lines.svg';
import ArtistIcon from '../assets/artist.svg';
import ArrowLeftIcon from '../assets/arrow_left.svg';
import type { Song } from '../api/songs/types';
import { getSong } from '../api/songs';
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS } from '../styles/theme';
import { containerFullscreen, flexColumn, flexCenter, cardLesson, scaled } from '../styles/mixins';

type SelectModeProps = Record<string, never>;

const SelectMode: FunctionComponent<SelectModeProps> = () => {
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
  const [hoverButton, setHoverButton] = useState(false);

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
      <div style={{ ...containerFullscreen, paddingTop: scaled(55.5) }}>
        <Header />
        <div
          style={{
            width: '100%',
            ...flexColumn,
            alignItems: 'center',
            gap: scaled(60),
            padding: `${scaled(48)} ${scaled(18)}`,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              ...flexColumn,
              alignItems: 'center',
              gap: scaled(12),
              textAlign: 'center',
              fontFamily: FONTS.primary,
            }}
          >
            <div
              style={{
                fontSize: FONT_SIZES.xl,
                fontWeight: FONT_WEIGHTS.semibold,
                color: COLORS.dark,
                margin: 0,
              }}
            >
              Loading song...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...containerFullscreen, paddingTop: scaled(55.5) }}>
      <Header />

      <div
        style={{
          width: '100%',
          ...flexColumn,
          alignItems: 'center',
          gap: scaled(60),
          padding: `${scaled(48)} ${scaled(18)}`,
          boxSizing: 'border-box',
        }}
      >
        {/* 곡 정보 */}
        <div
          style={{
            ...flexColumn,
            alignItems: 'center',
            gap: scaled(12),
            textAlign: 'center',
            fontFamily: FONTS.primary,
          }}
        >
          <div
            style={{
              fontSize: FONT_SIZES.xl,
              fontWeight: FONT_WEIGHTS.semibold,
              color: COLORS.dark,
              margin: 0,
            }}
          >
            "{song?.title || 'Song Not Found'}"
          </div>
          <div
            style={{
              fontSize: FONT_SIZES.lg,
              color: COLORS.dark,
              margin: 0,
            }}
          >
            {song?.singer || '...'}
          </div>
        </div>

        {/* 레슨 컨테이너 */}
        <div
          style={{
            ...cardLesson,
            width: '100%',
            maxWidth: scaled(1000),
            minWidth: scaled(850),
            height: 'auto',
            minHeight: scaled(380),
            ...flexColumn,
            alignItems: 'center',
            padding: `${scaled(40)} ${scaled(32)} ${scaled(40)}`,
            position: 'relative',
            gap: scaled(24),
          }}
        >
          <div
            style={{
              fontSize: FONT_SIZES.xl,
              fontWeight: FONT_WEIGHTS.semibold,
              color: COLORS.dark,
              margin: 0,
              zIndex: 0,
            }}
          >
            Choose your lesson
          </div>

          {/* 레슨 카드들 */}
          <div
            style={{
              width: '100%',
              ...flexCenter,
              justifyContent: 'space-evenly',
              flexWrap: 'nowrap',
              padding: `${scaled(10)} 0`,
              boxSizing: 'border-box',
              gap: scaled(24),
              zIndex: 1,
            }}
          >
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

          {/* 곡 변경 버튼 */}
          <div
            style={{
              ...flexCenter,
              gap: scaled(14.25),
              zIndex: 2,
              fontSize: FONT_SIZES.md,
              color: COLORS.dark,
              cursor: 'pointer',
              transition: 'opacity 0.2s ease',
              whiteSpace: 'nowrap',
              opacity: hoverButton ? 0.7 : 1,
              marginTop: scaled(16),
            }}
            onClick={() => navigate('/home')}
            onMouseEnter={() => setHoverButton(true)}
            onMouseLeave={() => setHoverButton(false)}
          >
            <img
              style={{
                width: scaled(37.5),
                height: scaled(37.5),
                objectFit: 'contain',
              }}
              src={ArrowLeftIcon}
              alt="arrow"
            />
            <div>Change Song</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectMode;
