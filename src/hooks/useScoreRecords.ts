import { useState, useEffect, useCallback } from 'react';
import { getScoreRecords, createScoreRecord } from '../api/scores';
import type { ScoreRecord, CreateScoreRequest } from '../api/scores/types';

interface UseScoreRecordsResult {
  scoreRecords: ScoreRecord[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  saveScore: (data: CreateScoreRequest) => Promise<ScoreRecord | null>;
}

// 예시 데이터
const mockData: ScoreRecord[] = [
  {
    id: 1,
    score: 63,
    scoredAt: '2025-09-28:00:00:00',
    userId: 1,
    songId: 1,
    sessionId: 1,
  },
];

//점수기록 가져오기 & 저장
export function useScoreRecords(): UseScoreRecordsResult {
  const [scoreRecords, setScoreRecords] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScoreRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const records = await getScoreRecords();
      setScoreRecords(records);
    } catch (err) {
      // API 호출 실패 시 예시 데이터 사용
      console.warn('API 호출 실패, 예시 데이터 사용:', err);
      setScoreRecords(mockData);
      setError(null); // 예시 데이터를 사용하므로 에러로 표시하지 않음
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScoreRecords();
  }, [fetchScoreRecords]);

  const saveScore = useCallback(async (data: CreateScoreRequest): Promise<ScoreRecord | null> => {
    try {
      setError(null);
      const newRecord = await createScoreRecord(data);
      // 새 기록을 목록에 추가
      setScoreRecords(prev => [newRecord, ...prev]);
      return newRecord;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '점수 기록을 저장하는 데 실패했습니다.';
      setError(errorMessage);
      console.error('Failed to save score:', err);
      return null;
    }
  }, []);

  return {
    scoreRecords,
    loading,
    error,
    refetch: fetchScoreRecords,
    saveScore,
  };
}
