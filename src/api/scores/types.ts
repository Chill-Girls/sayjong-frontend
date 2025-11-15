import { z } from 'zod';

export const scoreRecordSchema = z.object({
  id: z.number(),
  score: z.number(),
  scoredAt: z.string(),
  userId: z.number(),
  songId: z.number(),
  sessionId: z.number(),
}); // 점수 기록 스키마

export const scoreRecordListSchema = z.array(scoreRecordSchema); // 점수 기록 목록 스키마

export const createScoreRequestSchema = z.object({
  score: z.number(),
  songId: z.number(),
  sessionId: z.number().optional(),
}); // 점수 기록 생성 요청 스키마

export type ScoreRecord = z.infer<typeof scoreRecordSchema>; // 점수 기록 타입
export type ScoreRecordList = z.infer<typeof scoreRecordListSchema>; // 점수 기록 목록 타입
export type CreateScoreRequest = z.infer<typeof createScoreRequestSchema>; // 점수 기록 생성 요청 타입
