import { z } from 'zod';

export const pronunciationAccuracyRequestSchema = z.object({
  title: z.string(),
  base64Audio: z.string(),
  language: z.string(),
});

export const pronunciationAccuracyResponseSchema = z.object({
  pronunciation_accuracy: z.string().transform(Number),
});

export type PronunciationAccuracyRequest = z.infer<typeof pronunciationAccuracyRequestSchema>;
export type PronunciationAccuracyResponse = z.infer<typeof pronunciationAccuracyResponseSchema>;
