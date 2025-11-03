import { apiClient } from '../client';
import type { PronunciationAccuracyRequest } from './types';
import { pronunciationAccuracyRequestSchema, pronunciationAccuracyResponseSchema } from './types';
import { isAxiosError } from 'axios';

const AI_SERVER_TIMEOUT = 15000;

export async function getPronunciationAccuracy(data: PronunciationAccuracyRequest) {
  try {
    const validatedData = pronunciationAccuracyRequestSchema.parse(data);
    const response = await apiClient.post<unknown>('/GetAccuracyFromRecordedAudio', validatedData, {
      timeout: AI_SERVER_TIMEOUT,
    });
    const validatedResponse = pronunciationAccuracyResponseSchema.parse(response.data);
    return validatedResponse.pronunciation_accuracy;
  } catch (error) {
    console.error('API Error (getPronunciationAccuracy):', error);
    if (isAxiosError(error) && error.code === 'ECONNABORTED') {
      console.error('Request timed out!');
    }
    throw new Error('Failed to evaluate pronunciation accuracy.');
  }
}
