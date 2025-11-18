import { useState, useCallback } from 'react';
import { createScoreRecord } from '../api/scores';
import type { ScoreRecord, CreateScoreRequest } from '../api/scores/types';

interface UseScoreRecordsResult {
  latestRecord: ScoreRecord | null; 
  loading: boolean;
  error: string | null;
  saveScore: (data: CreateScoreRequest) => Promise<ScoreRecord | null>;
}

//점수기록 가져오기 & 저장
export function useScoreRecords(): UseScoreRecordsResult {
  const [latestRecord, setLatestRecord] = useState<ScoreRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 점수 저장 함수
  const saveScore = useCallback(async (data: CreateScoreRequest): Promise<ScoreRecord | null> => {
    try {
      setLoading(true);
      setError(null);
      const newRecord = await createScoreRecord(data);
      setLatestRecord(newRecord);
      
      return newRecord;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '점수 기록을 저장하는 데 실패했습니다.';
      setError(errorMessage);
      console.error('Failed to save score:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    latestRecord,
    loading,
    error,
    saveScore,
  };
}