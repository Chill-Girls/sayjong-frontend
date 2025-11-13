import type { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MusicCard from '../components/MusicCard';
import { useSongs } from '../hooks/useSongs';
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS } from '../styles/theme';
import { containerFullscreen, flexColumn, scaled } from '../styles/mixins';

type SelectMusicProps = Record<string, never>;

const SelectMusic: FunctionComponent<SelectMusicProps> = () => {
  const navigate = useNavigate();
  const { songs, loading, error } = useSongs();

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
    <>
      <style>
        {`
          .music-grid-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .music-grid-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .music-grid-scroll::-webkit-scrollbar-thumb {
            background: transparent;
          }
          .music-grid-scroll {
            scrollbar-width: thin;
            scrollbar-color: darkgray transparent;
          }
        `}
      </style>
      <div style={{ ...containerFullscreen, paddingTop: scaled(55.5) }}>
        <Header />

      <div
        style={{
          width: '100%',
          ...flexColumn,
          alignItems: 'center',
          gap: scaled(48),
          padding: `${scaled(48)} ${scaled(18)}`,
          paddingBottom: scaled(100),
          boxSizing: 'border-box',
          minHeight: 'calc(100vh - 55.5px)',
          overflowY: 'auto',
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
          className="music-grid-scroll"
          style={{
            width: '100%',
            maxWidth: '1200px',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: scaled(24),
            padding: `0 ${scaled(24)}`,
            boxSizing: 'border-box',
            maxHeight: 'calc(227px * 2 + 18px)',
            overflowY: 'auto',
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
    </>
  );
};

export default SelectMusic;
