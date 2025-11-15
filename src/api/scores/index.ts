import { apiClient } from '../client';
import {
  scoreRecordListSchema,
  scoreRecordSchema,
  createScoreRequestSchema,
  type ScoreRecordList,
  type ScoreRecord,
  type CreateScoreRequest,
} from './types';

// 점수 기록 목록 조회
export async function getScoreRecords(): Promise<ScoreRecordList> {
  try {
    const response = await apiClient.get('/scores');
    const validatedData = scoreRecordListSchema.parse(response.data);
    return validatedData;
  } catch (error) {
    console.error('API Error (getScoreRecords):', error);
    throw new Error('점수 기록을 가져오는 데 실패했습니다.');
  }
}

// 점수 기록 생성
export async function createScoreRecord(data: CreateScoreRequest): Promise<ScoreRecord> {
  try {
    const validatedRequest = createScoreRequestSchema.parse(data);
    const response = await apiClient.post('/scores', validatedRequest);
    const validatedData = scoreRecordSchema.parse(response.data);
    return validatedData;
  } catch (error) {
    console.error('API Error (createScoreRecord):', error);
    throw new Error('점수 기록을 저장하는 데 실패했습니다.');
  }
}
