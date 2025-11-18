import { useState, useEffect, useCallback } from 'react';
import { getTrainingSessions } from '../api/scores';
import type { TrainingSession } from '../api/scores/types';

interface UseTrainingSessionsResult {
  sessions: TrainingSession[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// 학습 세션 목록을 가져오는 훅
export function useTrainingSessions(): UseTrainingSessionsResult {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getTrainingSessions();
      
      setSessions(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '학습 기록을 불러오는 데 실패했습니다.';
      console.error('Failed to fetch sessions:', err);
      setError(errorMessage);
      setSessions([]); 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    refetch: fetchSessions,
  };
}