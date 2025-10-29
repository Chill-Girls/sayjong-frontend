import { apiClient } from '../client';
import { songListResponseSchema, type SongList } from './types';

export async function getSongs(): Promise<SongList> {
  try {
    const response = await apiClient.get('/songs');
    console.log(response);
    const validatedData = songListResponseSchema.parse(response.data);
    return validatedData;
  } catch (error) {
    console.error('API Error (getSongs):', error);
    throw new Error('노래 목록을 가져오는 데 실패했습니다.');
  }
}
