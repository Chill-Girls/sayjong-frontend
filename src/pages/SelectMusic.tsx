import type { FunctionComponent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MusicCard from '../components/MusicCard';
import FooterCopyright from '../components/FooterCopyright';
import { useSongs } from '../hooks/useSongs';
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from '../styles/theme';
import { containerFullscreen, flexColumn, scaled } from '../styles/mixins';

type SelectMusicProps = Record<string, never>;

const SelectMusic: FunctionComponent<SelectMusicProps> = () => {
  const navigate = useNavigate();
  const { songs, loading, error } = useSongs();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter songs based on search query
  const filteredSongs = songs.filter(song => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return song.title.toLowerCase().includes(query) || song.singer.toLowerCase().includes(query);
  });

  if (loading) {
    return (
      <>
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
        <FooterCopyright />
      </>
    );
  }

  if (error) {
    return (
      <>
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
        <FooterCopyright />
      </>
    );
  }

  return (
    <>
      <style>
        {`
          html, body {
            overflow-y: hidden !important;
            height: 100%;
          }
          .music-grid-scroll::-webkit-scrollbar {
            width: 0.5rem;
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
            minHeight: `calc(100vh - ${scaled(55.5)})`,
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
              paddingBottom: scaled(48),
            }}
          >
            <div
              style={{
                fontSize: FONT_SIZES.xxl,
                fontWeight: FONT_WEIGHTS.bold,
                color: COLORS.primary,
                margin: 0,
              }}
            >
              Practice Your Favorite Song
            </div>
          </div>

          {/* 음악 카드 그리드 */}
          <div
            className="music-grid-scroll"
            style={{
              width: '100%',
              maxWidth: '75rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: scaled(24),
              padding: `0 ${scaled(24)}`,
              boxSizing: 'border-box',
              maxHeight: 'calc(14.1875rem * 2 + 1.125rem)',
              overflowY: 'auto',
            }}
          >
            {filteredSongs.map(music => (
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
                  e.currentTarget.style.transform = 'translateY(-0.25rem)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <MusicCard
                  title={music.titleEng}
                  artist={music.singer}
                  albumId={music.songId}
                  coverUrl={music.coverUrl}
                />
              </div>
            ))}
          </div>

          {/* 검색 바 */}
          <div
            style={{
              width: '100%',
              maxWidth: '75rem',
              padding: `0 ${scaled(24)}`,
              boxSizing: 'border-box',
              marginTop: scaled(10),
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '14.0625rem',
                borderRadius: BORDER_RADIUS.md,
                backgroundColor: 'transparent',
                border: `0.0625rem solid ${COLORS.textSecondary}`,
                display: 'flex',
                alignItems: 'center',
                gap: scaled(12),
                padding: `${scaled(12)} ${scaled(16)}`,
                boxSizing: 'border-box',
              }}
            >
              <svg
                width={scaled(20)}
                height={scaled(20)}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  flexShrink: 0,
                  color: COLORS.textSecondary,
                }}
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="m20 20-4-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for a song or artist"
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontFamily: FONTS.primary,
                  fontSize: FONT_SIZES.base,
                  color: COLORS.dark,
                  padding: 0,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <FooterCopyright />
    </>
  );
};

export default SelectMusic;
