import type { FunctionComponent } from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CameraComponent from '../components/CameraComponent';
import KaraokeLine from '../components/KaraokeLine';
import type { Song } from '../api/songs/types';
import { getSong } from '../api/songs';
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS } from '../styles/theme';
import { containerFullscreen, flexColumn, flexCenter, scaled } from '../styles/mixins';

type SingAlongProps = object;

const SingAlong: FunctionComponent<SingAlongProps> = () => {
  const { songId } = useParams();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);

  // 테스트용 가사 데이터
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

  // 곡 정보 로드
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

  // 자동 타이머
  useEffect(() => {
    const startTime = Date.now();

    const update = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      setCurrentTime(elapsed);
      requestAnimationFrame(update);
    };

    const animationId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animationId);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          ...containerFullscreen,
          padding: `${scaled(12)} 0`,
          paddingTop: scaled(55.5),
          paddingBottom: scaled(80),
          gap: scaled(24.75),
          textAlign: 'left',
          fontSize: FONT_SIZES.lg,
          color: COLORS.dark,
          fontFamily: FONTS.primary,
        }}
      >
        <Header />
        <div
          style={{
            ...flexColumn,
            alignItems: 'center',
            gap: scaled(6),
            fontSize: FONT_SIZES.xl,
          }}
        >
          <div
            style={{
              position: 'relative',
              fontWeight: FONT_WEIGHTS.medium,
              margin: 0,
            }}
          >
            Loading song...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...containerFullscreen,
        overflow: 'hidden',
        padding: `${scaled(12)} 0`,
        paddingTop: scaled(55.5),
        paddingBottom: scaled(80),
        gap: scaled(24.75),
        textAlign: 'left',
        fontSize: FONT_SIZES.lg,
        color: COLORS.dark,
        fontFamily: FONTS.primary,
      }}
    >
      <Header />

      {/* 간격 div */}
      <div
        style={{
          width: scaled(15),
          height: scaled(15),
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          zIndex: 1,
        }}
      />

      {/* 타이틀 섹션 */}
      <div
        style={{
          width: '100%',
          ...flexColumn,
          alignItems: 'center',
          gap: scaled(6),
          zIndex: 2,
          textAlign: 'center',
          fontSize: FONT_SIZES.xl,
        }}
      >
        <div
          style={{
            position: 'relative',
            fontWeight: FONT_WEIGHTS.medium,
            margin: 0,
          }}
        >
          Sing Along
        </div>
        <div
          style={{
            position: 'relative',
            fontSize: FONT_SIZES.lg,
            fontWeight: FONT_WEIGHTS.light,
            textAlign: 'left',
            margin: 0,
          }}
        >
          "{song?.title || 'Song Not Found'} - {song?.singer || '...'}"
        </div>
      </div>

      {/* 카메라 */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          borderRadius: '12px',
          overflow: 'hidden',
          ...flexCenter,
        }}
      >
        <CameraComponent width="803.25px" height="307.5px" />
      </div>

      {/* 카라오케 가사 */}
      <div
        style={{
          ...flexColumn,
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
