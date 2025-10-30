import type { FunctionComponent } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MusicCard from '../components/MusicCard';
import { getSongs } from '../api/songs';
import type { Song } from '../api/songs/types';
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS } from '../styles/theme';
import { containerFullscreen, flexColumn, scaled } from '../styles/mixins';

type SelectMusicProps = Record<string, never>;

const SelectMusic: FunctionComponent<SelectMusicProps> = () => {
  const navigate = useNavigate();
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
  }, []);

  if (loading) {
    return (
      <div style={{ ...containerFullscreen, paddingTop: scaled(55.5) }}>
        <Header />
        <div
          style={{
            width: '100%',
            ...flexColumn,
            alignItems: 'center',
            gap: scaled(48),
            padding: `${scaled(48)} ${scaled(18)}`,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              ...flexColumn,
              alignItems: 'center',
              gap: scaled(18),
              textAlign: 'center',
              fontFamily: FONTS.primary,
            }}
          >
            <div
              style={{
                fontSize: FONT_SIZES.xl,
                fontWeight: FONT_WEIGHTS.bold,
                color: COLORS.dark,
                margin: 0,
              }}
            >
              Loading Songs...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...containerFullscreen, paddingTop: scaled(55.5) }}>
        <Header />
        <div
          style={{
            width: '100%',
            ...flexColumn,
            alignItems: 'center',
            gap: scaled(48),
            padding: `${scaled(48)} ${scaled(18)}`,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              ...flexColumn,
              alignItems: 'center',
              gap: scaled(18),
              textAlign: 'center',
              fontFamily: FONTS.primary,
            }}
          >
            <div
              style={{
                fontSize: FONT_SIZES.xl,
                fontWeight: FONT_WEIGHTS.bold,
                color: COLORS.dark,
                margin: 0,
              }}
            >
              Error: {error}
            </div>
            <div
              style={{
                fontSize: FONT_SIZES.lg,
                color: COLORS.dark,
                margin: 0,
              }}
            >
              노래를 불러오는 데 실패했습니다.
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
          gap: scaled(48),
          padding: `${scaled(48)} ${scaled(18)}`,
          boxSizing: 'border-box',
        }}
      >
        {/* 타이틀 섹션 */}
        <div
          style={{
            ...flexColumn,
            alignItems: 'center',
            gap: scaled(18),
            textAlign: 'center',
            fontFamily: FONTS.primary,
          }}
        >
          <div
            style={{
              fontSize: FONT_SIZES.xl,
              fontWeight: FONT_WEIGHTS.bold,
              color: COLORS.dark,
              margin: 0,
            }}
          >
            Practice Your Favorite Song
          </div>
          <div
            style={{
              fontSize: FONT_SIZES.lg,
              color: COLORS.dark,
              margin: 0,
            }}
          >
            Songs
          </div>
        </div>

        {/* 음악 카드 그리드 */}
        <div
          style={{
            width: '85%',
            maxWidth: '1200px',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: scaled(18),
            padding: `0 ${scaled(18)}`,
            boxSizing: 'border-box',
          }}
        >
          {songs.map(music => (
            <div
              key={music.songId}
              style={{
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }}
              onClick={() => {
                navigate(`/lesson/${music.songId}`);
              }}
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
