import { apiClient } from '../client';
import { songResponseSchema, songListResponseSchema, type SongList, type Song } from './types';
import { songWithLyricsSchema, type SongWithLyrics } from './types';

// 노래 목록 조회
export async function getSongs(): Promise<SongList> {
  try {
    const response = await apiClient.get('/songs');
    const validatedData = songListResponseSchema.parse(response.data);
    return validatedData;
  } catch (error) {
    console.error('API Error (getSongs):', error);
    throw new Error('노래 목록을 가져오는 데 실패했습니다.');
  }
}

// 특정 노래 정보 조회
export async function getSong(id: number): Promise<Song> {
  try {
    const response = await apiClient.get(`/songs/${id}`);
    const validatedData = songResponseSchema.parse(response.data);
    return validatedData;
  } catch (error) {
    console.error(`API Error (getSongById) for ID ${id}:`, error);
    throw new Error(`${id}번 노래 정보를 가져오는 데 실패했습니다.`);
  }
}

// 특정 노래의 전체 소절(lyric lines) 조회
export async function getSongLyricLines(songId: number): Promise<SongWithLyrics> {
  try {
    const response = await apiClient.get(`/songs/${songId}/lyriclines`);
    const validatedData = songWithLyricsSchema.parse(response.data);
    return validatedData;
  } catch (error) {
    console.error(`API Error (getSongLyricLines) for ID ${songId}:`, error);
    throw new Error(`${songId}번 노래의 가사 소절을 가져오는 데 실패했습니다.`);
  }
}

// 특정 노래의 전체 음절(lyric syllables) 조회
export async function getSongLyricSyllables(songId: number): Promise<any> {
  try {
    const response = await apiClient.get(`/songs/${songId}/lyricSyllables`);
    return response.data;
  } catch (error) {
    console.error(`API Error (getSongLyricSyllables) for ID ${songId}:`, error);
    throw new Error(`${songId}번 노래의 음절 정보를 가져오는 데 실패했습니다.`);
  }
}
