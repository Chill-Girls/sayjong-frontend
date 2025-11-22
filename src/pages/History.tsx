import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { COLORS, FONTS, FONT_WEIGHTS, BORDER_RADIUS } from '../styles/theme';
import { containerFullscreen, flexColumn, scaled } from '../styles/mixins';
import { useTrainingSessions } from '../hooks/useTrainingSessions';
import { useTrainingRecords } from '../hooks/useTrainingRecords';
import { useUser } from '../hooks/useUser';
import TrainingLogChart from '../components/Graph';
import FooterCopyright from '../components/FooterCopyright';
import TrainingRecordCard from '../components/TrainingRecordCard';
import SongTrainingHistoryCard from '../components/SongTrainingHistoryCard';
import avatarImage from '../assets/avatar.png';

type FilterPeriod = 'ALL' | 'LAST_7_DAYS' | 'LAST_30_DAYS';

const History: React.FC = () => {
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('ALL');
  const [selectedSongId, setSelectedSongId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { userInfo, loading: userInfoLoading, error: userInfoError } = useUser();

  // 학습 세션 목록 조회 (API 호출)
  const { sessions, loading: sessionsLoading, error: sessionsError } = useTrainingSessions();

  // API로 받은 sessions 데이터와 필터 상태를 넘겨줌
  const { trainingRecords, filteredSessions } = useTrainingRecords({
    sessions,
    filterPeriod,
  });

  // 선택된 노래의 세션 필터링 (전체 세션에서 필터링하여 모든 기록 표시)
  const selectedSongSessions = useMemo(() => {
    if (!selectedSongId) return [];
    const filtered = sessions.filter(session => session.songId === selectedSongId);
    console.log(`Selected song ID: ${selectedSongId}, Total sessions for this song: ${filtered.length}`);
    return filtered;
  }, [sessions, selectedSongId]);

  // 선택된 노래 정보
  const selectedRecord = useMemo(() => {
    if (!selectedSongId) return null;
    return trainingRecords.find(record => record.songId === selectedSongId);
  }, [trainingRecords, selectedSongId]);

  // 카드 클릭 핸들러
  const handleCardClick = (songId: number) => {
    setSelectedSongId(songId);
    setIsModalOpen(true);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSongId(null);
  };

  // 차트 표시용 전체 평균 점수 계산
  const overallAverageScore = useMemo(() => {
    if (filteredSessions.length === 0) return 0;
    const total = filteredSessions.reduce((sum, s) => sum + s.averageScore, 0);
    return Math.round(total / filteredSessions.length);
  }, [filteredSessions]);

  const loading = sessionsLoading || userInfoLoading;
  const error = sessionsError || userInfoError;

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
          <img
            src={avatarImage}
            alt="User avatar"
            style={{
              width: scaled(170),
              height: scaled(170),
              borderRadius: '50%',
              objectFit: 'cover',
              marginBottom: scaled(35),
            }}
          />
          <div
            style={{
              fontSize: scaled(36),
              fontWeight: FONT_WEIGHTS.semibold,
              color: COLORS.dark,
              marginTop: scaled(10),
              fontFamily: FONTS.primary,
            }}
          >
            {userInfo?.nickname}
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
                {period.replace(/_/g, ' ').replace('LAST', 'Last').replace('DAYS', 'Days')}
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
              No records found.
            </div>
          ) : (
            trainingRecords.map((record, index) => (
              <TrainingRecordCard
                key={record.songId}
                record={record}
                index={index}
                onClick={() => handleCardClick(record.songId)}
              />
            ))
          )}
        </div>

        {/* Chart Title */}
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
          {/* filteredSessions와 계산된 overallAverageScore 전달 */}
          <TrainingLogChart scoreRecords={filteredSessions} averageScore={overallAverageScore} />
        </div>
      </div>
      <FooterCopyright />

      {/* 학습 기록 모달 */}
      {selectedRecord && (
        <SongTrainingHistoryCard
          isClick={isModalOpen}
          onClose={handleCloseModal}
          songTitle={selectedRecord.titleEng}
          songArtist={selectedRecord.artist}
          sessions={selectedSongSessions}
        />
      )}
    </div>
  );
};

export default History;
