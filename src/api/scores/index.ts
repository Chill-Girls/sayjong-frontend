import { apiClient } from '../client';
import {
  trainingSessionListSchema,
  scoreRecordSchema,
  createScoreRequestSchema,
  scoreHistoryListSchema,
  type TrainingSession,
  type ScoreRecord,
  type CreateScoreRequest,
  type ScoreHistory
} from './types';

// 학습 세션 목록 조회
export async function getTrainingSessions(): Promise<TrainingSession[]> {
  try {
    const response = await apiClient.get('/users/me/training-sessions');
    const validatedData = trainingSessionListSchema.parse(response.data);
    return validatedData;
  } catch (error) {
    console.error('API Error (getTrainingSessions):', error);
    throw new Error('학습 기록을 가져오는 데 실패했습니다.');
  }
}

// 점수 기록 생성
export async function createScoreRecord(data: CreateScoreRequest): Promise<ScoreRecord> {
  try {
    const validatedRequest = createScoreRequestSchema.parse(data);
    const { songId, score } = validatedRequest;
    const response = await apiClient.post(`/users/me/songs/${songId}/scores`, { score });
    const validatedData = scoreRecordSchema.parse(response.data);
    return validatedData;
  } catch (error) {
    console.error('API Error (createScoreRecord):', error);
    throw new Error('점수 기록을 저장하는 데 실패했습니다.');
  }
}

// 특정 노래에 대한 점수 기록 조회
export async function getScoreHistoryBySessionId(sessionId: number): Promise<ScoreHistory[]> {
  try {
    const response = await apiClient.get(`/users/me/session/${sessionId}/scoreHistory`);
    console.debug('[API] getScoreHistoryBySessionId response:', response.status, response.data);
    const validatedData = scoreHistoryListSchema.parse(response.data);
    return validatedData;
  } catch (error: any) {
    console.error(`API Error (getScoreHistoryBySessionId - Session ID: ${sessionId}):`, error);
    if (error?.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
    }
    return [];
  }
}