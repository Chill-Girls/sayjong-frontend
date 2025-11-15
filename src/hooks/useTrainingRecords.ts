import { useMemo } from 'react';
import type { ScoreRecord } from '../api/scores/types';
import type { Song } from '../api/songs/types';

type FilterPeriod = 'ALL' | 'LAST_7_DAYS' | 'LAST_30_DAYS';

export interface TrainingRecord {
  songId: number;
  title: string;
  artist: string;
  imageUrl?: string;
  bestScore: number;
  recentScore: number;
  score?: number; // 단일 점수 (최신 기록만 있을 때)
}

interface UseTrainingRecordsParams {
  scoreRecords: ScoreRecord[];
  songs: Song[];
  filterPeriod: FilterPeriod;
}

interface UseTrainingRecordsResult {
  filteredRecords: ScoreRecord[];
  trainingRecords: TrainingRecord[];
  averageScore: number;
}

/**
 * 점수 기록을 필터링하고 노래별로 그룹화하여 트레이닝 기록을 계산하는 훅
 */
export function useTrainingRecords({
  scoreRecords,
  songs,
  filterPeriod,
}: UseTrainingRecordsParams): UseTrainingRecordsResult {
  // 노래 정보를 Map으로 변환 (songId를 키로 사용)
  const songsMap = useMemo(() => {
    const songMap = new Map<number, Song>();
    songs.forEach(song => {
      songMap.set(song.songId, song);
    });
    return songMap;
  }, [songs]);

  // 필터링된 점수 기록
  const filteredRecords = useMemo(() => {
    if (filterPeriod === 'ALL') return scoreRecords;

    const now = new Date();
    const cutoffDate = new Date();

    if (filterPeriod === 'LAST_7_DAYS') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (filterPeriod === 'LAST_30_DAYS') {
      cutoffDate.setDate(now.getDate() - 30);
    }

    // 시, 분, 초를 00:00:00으로 설정하여 날짜만 비교
    cutoffDate.setHours(0, 0, 0, 0);

    return scoreRecords.filter(record => {
      const scoredDate = new Date(record.scoredAt);
      // 시, 분, 초를 00:00:00으로 설정하여 날짜만 비교
      scoredDate.setHours(0, 0, 0, 0);
      return scoredDate >= cutoffDate;
    });
  }, [scoreRecords, filterPeriod]);

  // 노래별로 그룹화하고 bestScore, recentScore 계산
  const trainingRecords = useMemo<TrainingRecord[]>(() => {
    const groupedBySong = new Map<number, ScoreRecord[]>();

    filteredRecords.forEach(record => {
      const existing = groupedBySong.get(record.songId) || [];
      existing.push(record);
      groupedBySong.set(record.songId, existing);
    });

    const records: TrainingRecord[] = [];

    groupedBySong.forEach((recordsForSong, songId) => {
      const song = songsMap.get(songId);
      if (!song) return;

      // 점수로 정렬 (최신순)
      const sortedRecords = [...recordsForSong].sort((a, b) => {
        const dateA = new Date(a.scoredAt).getTime();
        const dateB = new Date(b.scoredAt).getTime();
        return dateB - dateA;
      });

      const scores = sortedRecords.map(r => r.score);
      const bestScore = Math.max(...scores);
      const recentScore = scores[0]; // 가장 최근 점수

      records.push({
        songId,
        title: song.title,
        artist: song.singer,
        imageUrl: song.coverUrl || undefined,
        bestScore,
        recentScore,
        score: recordsForSong.length === 1 ? recentScore : undefined, // 단일 기록일 때만 score 표시
      });
    });

    // 최신 기록순으로 정렬
    return records.sort((a, b) => {
      const aRecords = filteredRecords.filter(r => r.songId === a.songId);
      const bRecords = filteredRecords.filter(r => r.songId === b.songId);
      const aLatest = Math.max(...aRecords.map(r => new Date(r.scoredAt).getTime()));
      const bLatest = Math.max(...bRecords.map(r => new Date(r.scoredAt).getTime()));
      return bLatest - aLatest;
    });
  }, [filteredRecords, songsMap]);

  // 그래프 데이터 계산 (최근 6개월 평균 - 모든 노래 점수의 평균)
  const averageScore = useMemo(() => {
    if (filteredRecords.length === 0) return 0;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    // 시, 분, 초를 00:00:00으로 설정하여 날짜만 비교
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const recentRecords = filteredRecords.filter(record => {
      const scoredDate = new Date(record.scoredAt);
      // 시, 분, 초를 00:00:00으로 설정하여 날짜만 비교
      scoredDate.setHours(0, 0, 0, 0);
      return scoredDate >= sixMonthsAgo;
    });

    if (recentRecords.length === 0) return 0;

    // 노래별로 그룹화
    const groupedBySong = new Map<number, number[]>();
    recentRecords.forEach(record => {
      const existing = groupedBySong.get(record.songId) || [];
      existing.push(record.score);
      groupedBySong.set(record.songId, existing);
    });

    // 각 노래의 평균 점수 계산
    const songAverages: number[] = [];
    groupedBySong.forEach(scores => {
      const songAverage = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      songAverages.push(songAverage);
    });

    if (songAverages.length === 0) return 0;

    // 모든 노래 평균 점수의 평균
    const totalAverage = songAverages.reduce((sum, avg) => sum + avg, 0) / songAverages.length;
    return Math.round(totalAverage);
  }, [filteredRecords]);

  return {
    filteredRecords,
    trainingRecords,
    averageScore,
  };
}
