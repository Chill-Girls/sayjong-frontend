import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { COLORS, FONTS, FONT_WEIGHTS, BORDER_RADIUS } from '../styles/theme';
import { containerFullscreen, flexColumn, scaled } from '../styles/mixins';
import { useScoreRecords } from '../hooks/useScoreRecords';
import { useSongs } from '../hooks/useSongs';
import { useTrainingRecords } from '../hooks/useTrainingRecords';
import TrainingLogChart from '../components/Graph';
import FooterCopyright from '../components/FooterCopyright';
import TrainingRecordCard from '../components/TrainingRecordCard';

type FilterPeriod = 'ALL' | 'LAST_7_DAYS' | 'LAST_30_DAYS';

const History: React.FC = () => {
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('ALL');
  const {
    scoreRecords,
    loading: scoreRecordsLoading,
    error: scoreRecordsError,
  } = useScoreRecords();
  const { songs: allSongs, loading: songsLoading, error: songsError } = useSongs();

  const loading = scoreRecordsLoading || songsLoading;
  const error = scoreRecordsError || songsError;

  // 트레이닝 기록 계산 (필터링, 그룹화, 평균 계산 등)
  const { filteredRecords, trainingRecords, averageScore } = useTrainingRecords({
    scoreRecords,
    songs: allSongs,
    filterPeriod,
  });

  if (loading) {
    return (
      <div
        style={{
          ...containerFullscreen,
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONTS.primary,
          fontSize: scaled(28),
        }}
      >
        <Header />
        <div style={{ marginTop: scaled(80) }}>데이터를 불러오는 중입니다...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          ...containerFullscreen,
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONTS.primary,
          fontSize: scaled(24),
          color: COLORS.primary,
        }}
      >
        <Header />
        <div style={{ marginTop: scaled(80) }}>오류: {error}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div
      style={{
        ...containerFullscreen,
        height: '100vh',
        position: 'relative',
        paddingTop: '55.5px', // Header 높이 (fixed)
        paddingBottom: '28px', // FooterCopyright 높이 (padding 8px * 2 + 텍스트 높이)
        fontFamily: FONTS.primary,
        color: COLORS.primary,
        overflow: 'hidden', // 외부 스크롤 방지
      }}
    >
      <Header />

      <div
        style={{
          width: '100%',
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: scaled(35),
          paddingTop: scaled(35),
          paddingBottom: scaled(35),
        }}
      >
        {/* User Profile Section */}
        <div
          style={{
            width: scaled(571),
            height: scaled(337),
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: scaled(120),
              height: scaled(120),
              borderRadius: '50%',
              backgroundColor: COLORS.gray,
              marginBottom: scaled(35),
            }}
          />
          <div
            style={{
              fontSize: scaled(36),
              fontWeight: FONT_WEIGHTS.semibold,
              color: COLORS.dark,
              marginTop: scaled(61),
              fontFamily: FONTS.primary,
            }}
          >
            userNickname
          </div>
          <div
            style={{
              fontSize: scaled(24),
              color: COLORS.textSecondary,
              marginTop: scaled(8),
              fontFamily: FONTS.primary,
            }}
          >
            @userID
          </div>
        </div>

        {/* Training Log Section */}
        <div
          style={{
            width: '100%',
            maxWidth: scaled(1200),
            minWidth: scaled(1100),
            padding: `${scaled(45)} ${scaled(45)} ${scaled(0)}`,
          }}
        >
          <div
            style={{
              fontSize: scaled(30),
              fontWeight: FONT_WEIGHTS.semibold,
              color: COLORS.dark,
              letterSpacing: scaled(1),
              marginBottom: scaled(27),
              fontFamily: FONTS.primary,
            }}
          >
            My Training Log
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: scaled(10),
            }}
          >
            {(['ALL', 'LAST_7_DAYS', 'LAST_30_DAYS'] as FilterPeriod[]).map(period => (
              <button
                key={period}
                type="button"
                onClick={() => setFilterPeriod(period)}
                style={{
                  borderRadius: BORDER_RADIUS.xl,
                  backgroundColor: filterPeriod === period ? COLORS.primary : COLORS.background,
                  color: filterPeriod === period ? COLORS.white : COLORS.dark,
                  border: 'none',
                  padding: `${scaled(11)} ${scaled(39)}`,
                  fontSize: scaled(15),
                  fontWeight: FONT_WEIGHTS.semibold,
                  letterSpacing: scaled(1),
                  cursor: 'pointer',
                  fontFamily: FONTS.primary,
                }}
              >
                {period.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Training Records Grid */}
        <div
          style={{
            width: '100%',
            maxWidth: scaled(1200),
            minWidth: scaled(1100),
            ...flexColumn,
            gap: scaled(22),
            padding: `0 ${scaled(32)}`,
          }}
        >
          {trainingRecords.length === 0 ? (
            <div
              style={{
                width: '100%',
                padding: scaled(40),
                textAlign: 'center',
                fontSize: scaled(24),
                color: COLORS.textSecondary,
                fontFamily: FONTS.primary,
              }}
            >
              기록이 없습니다.
            </div>
          ) : (
            trainingRecords.map((record, index) => (
              <TrainingRecordCard key={record.songId} record={record} index={index} />
            ))
          )}
        </div>

        <div
          style={{
            width: '100%',
            maxWidth: scaled(1200),
            minWidth: scaled(1100),
            padding: `${scaled(45)} ${scaled(45)} ${scaled(0)}`,
          }}
        >
          <div
            style={{
              fontSize: scaled(30),
              fontWeight: FONT_WEIGHTS.semibold,
              color: COLORS.dark,
              letterSpacing: scaled(1),
              marginBottom: scaled(27),
              fontFamily: FONTS.primary,
            }}
          >
            Pronunciation Improvement Trend
          </div>
        </div>

        {/*Graph*/}
        <div
          style={{
            width: '100%',
            maxWidth: scaled(1200),
            minWidth: scaled(1100),
            padding: `0 ${scaled(45)}`,
          }}
        >
          <TrainingLogChart scoreRecords={filteredRecords} averageScore={averageScore} />
        </div>
      </div>
      <FooterCopyright />
    </div>
  );
};

export default History;
