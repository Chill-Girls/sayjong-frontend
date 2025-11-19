import { useMemo } from 'react';
import type { TrainingSession } from '../api/scores/types';

type FilterPeriod = 'ALL' | 'LAST_7_DAYS' | 'LAST_30_DAYS';

export interface TrainingRecord {
  songId: number;
  title: string;
  titleEng: string;
  artist: string;
  imageUrl?: string;
  bestScore: number;
  recentScore: number;
  averageScore: number;
  lastPlayedAt: string;
}

interface UseTrainingRecordsParams {
  sessions: TrainingSession[];
  filterPeriod: FilterPeriod;
}

interface UseTrainingRecordsResult {
  filteredSessions: TrainingSession[];
  trainingRecords: TrainingRecord[];
}

export function useTrainingRecords({
  sessions,
  filterPeriod,
}: UseTrainingRecordsParams): UseTrainingRecordsResult {
  // 날짜 필터링
  const filteredSessions = useMemo(() => {
    if (!sessions || !Array.isArray(sessions)) return [];
    if (filterPeriod === 'ALL') return sessions;

    const now = new Date();
    const cutoffDate = new Date();

    if (filterPeriod === 'LAST_7_DAYS') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (filterPeriod === 'LAST_30_DAYS') {
      cutoffDate.setDate(now.getDate() - 30);
    }

    // 시, 분, 초를 00:00:00으로 설정하여 날짜만 비교
    cutoffDate.setHours(0, 0, 0, 0);

    return sessions.filter(session => {
      const playedDate = new Date(session.lastPlayedAt);
      playedDate.setHours(0, 0, 0, 0);
      return playedDate >= cutoffDate;
    });
  }, [sessions, filterPeriod]);

  const trainingRecords = useMemo<TrainingRecord[]>(() => {
    if (!filteredSessions) return [];

    return filteredSessions.map(session => ({
      songId: session.songId,

      title: session.titleEng,
      titleEng: session.titleEng,

      artist: session.singer,
      imageUrl: session.coverUrl,
      bestScore: session.bestScore,
      recentScore: session.recentScore,
      averageScore: session.averageScore,
      lastPlayedAt: session.lastPlayedAt,
    }));
  }, [filteredSessions]);

  return {
    filteredSessions,
    trainingRecords,
  };
}
