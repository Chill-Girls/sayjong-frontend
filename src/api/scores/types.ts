import { z } from 'zod';

export const scoreRecordSchema = z.object({
  id: z.number(),
  score: z.number(),
  scoredAt: z.string(),
}); // 점수 저장 후 백엔드가 돌려주는 응답

export const scoreRecordListSchema = z.array(scoreRecordSchema); // 점수 기록 목록 스키마

export const createScoreRequestSchema = z.object({
  songId: z.number(),
  score: z.number(),
}); // 점수 기록 생성 요청 스키마

export const trainingSessionSchema = z.object({
  sessionId: z.number(),
  averageScore: z.number(),
  bestScore: z.number(),
  recentScore: z.number(),
  lastPlayedAt: z.string(),

  songId: z.number(),
  titleEng: z.string(),
  singer: z.string(),
  coverUrl: z.string(),
}); // 학습 기록 조회

export type TrainingSession = z.infer<typeof trainingSessionSchema>;
export type ScoreRecord = z.infer<typeof scoreRecordSchema>; // 점수 기록 타입
export type ScoreRecordList = z.infer<typeof scoreRecordListSchema>; // 점수 기록 목록 타입
export type CreateScoreRequest = z.infer<typeof createScoreRequestSchema>; // 점수 기록 생성 요청 타입
export const trainingSessionListSchema = z.array(trainingSessionSchema);
export type TrainingSessionList = z.infer<typeof trainingSessionListSchema>;
