import { useCallback, useEffect, useMemo, useState } from 'react';
import { getScoreHistoryBySessionId } from '../api/scores';
import type { TrainingSession, ScoreHistory } from '../api/scores/types';
import { formatDate } from '../utils/dateUtils';

// SongTrainingHistoryCard 컴포넌트의 Props 타입
export interface SongTrainingHistoryCardProps {
  isClick: boolean;
  onClose: () => void;
  songTitle: string;
  songArtist: string;
  sessions: TrainingSession[];
}

interface UseSongTrainingHistoryOptions {
  sessions: TrainingSession[];
  isEnabled: boolean;
}

export interface UseSongTrainingHistoryReturn {
  groupedRecords: Record<string, ScoreHistory[]>;
  sortedDates: string[];
  isAnyLoading: boolean;
}

const DATE_ONLY_FORMAT = 'YYYY.MM.DD';

// SongTrainingHistoryCard에서 사용하는 데이터 처리 로직을 담당하는 훅
export function useSongTrainingHistory({
  sessions,
  isEnabled,
}: UseSongTrainingHistoryOptions): UseSongTrainingHistoryReturn {
  const [detailsMap, setDetailsMap] = useState<Record<number, ScoreHistory[]>>({});
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // 세션이 변경되면 기존 상태 초기화
  useEffect(() => {
    setDetailsMap({});
    setLoadingMap({});
    setIsDataLoaded(false);
  }, [sessions]);

  const loadAllSessionDetails = useCallback(async () => {
    if (isDataLoaded) return;
    if (!sessions || sessions.length === 0) return;

    setIsDataLoaded(true);

    const newDetails: Record<number, ScoreHistory[]> = {};
    const newLoading: Record<number, boolean> = {};

    const uniqueIds = Array.from(
      new Set(
        sessions.map(s => {
          if (typeof (s as any).sessionId === 'number' && (s as any).sessionId > 0)
            return (s as any).sessionId;
          const anyS = s as any;
          if (typeof anyS.id === 'number' && anyS.id > 0) return anyS.id;
          if (typeof anyS.sessionNo === 'number' && anyS.sessionNo > 0) return anyS.sessionNo;
          return null;
        }),
      ),
    ).filter((v): v is number => v !== null && v !== undefined);

    await Promise.all(
      uniqueIds.map(async sessionId => {
        if (typeof sessionId !== 'number' || sessionId <= 0) {
          console.warn('Skipping invalid sessionId:', sessionId);
          return;
        }
        newLoading[sessionId] = true;
        try {
          const details = await getScoreHistoryBySessionId(sessionId);
          newDetails[sessionId] = details || [];
        } catch (err) {
          console.error(`🚨 Failed to load score history for session ${sessionId}:`, err);
          newDetails[sessionId] = [];
        } finally {
          newLoading[sessionId] = false;
        }
      }),
    );

    setDetailsMap(newDetails);
    setLoadingMap(newLoading);
  }, [sessions, isDataLoaded]);

  // 모달이 열리면 데이터 로드
  useEffect(() => {
    if (isEnabled && sessions.length > 0) {
      loadAllSessionDetails();
    }
  }, [isEnabled, sessions.length, loadAllSessionDetails]);

  const isAnyLoading = useMemo(() => Object.values(loadingMap).some(Boolean), [loadingMap]);

  const allScoreDetails = useMemo(
    () =>
      Object.values(detailsMap).flatMap(details =>
        details && Array.isArray(details) ? details : [],
      ),
    [detailsMap],
  );

  const groupedRecords = useMemo(() => {
    return allScoreDetails.reduce(
      (acc, record) => {
        const dateKey = formatDate(record.scoredAt, DATE_ONLY_FORMAT);
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(record);
        return acc;
      },
      {} as Record<string, ScoreHistory[]>,
    );
  }, [allScoreDetails]);

  const sortedDates = useMemo(
    () => Object.keys(groupedRecords).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()),
    [groupedRecords],
  );

  return {
    groupedRecords,
    sortedDates,
    isAnyLoading,
  };
}
