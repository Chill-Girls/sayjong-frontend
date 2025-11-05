import { useState, useEffect } from 'react';
import { getSongs, getSong, getSongLyricLines } from '../api/songs';
import type { Song, /* SongList, */ SongWithLyrics } from '../api/songs/types';

/**
 * 노래 목록을 가져오는 훅
 */
export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        const data = await getSongs();
        setSongs(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  return { songs, loading, error };
}

/**
 * 특정 노래 정보를 가져오는 훅
 */
export function useSong(songId: number | null) {
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!songId) {
      setSong(null);
      return;
    }

    const fetchSong = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSong(songId);
        setSong(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '노래 정보를 가져오는 데 실패했습니다.');
        setSong(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSong();
  }, [songId]);

  return { song, loading, error };
}

/**
 * 특정 노래의 가사 소절을 가져오는 훅
 */
export function useSongLyricLines(songId: number | null) {
  const [lyricData, setLyricData] = useState<SongWithLyrics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!songId) {
      setLyricData(null);
      return;
    }

    const fetchLyricLines = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSongLyricLines(songId);
        setLyricData(data);
      } catch (err) {
        console.error('getSongLyricLines error', err);
        setError(err instanceof Error ? err.message : '가사 소절을 가져오는 데 실패했습니다.');
        setLyricData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLyricLines();
  }, [songId]);

  return { lyricData, loading, error };
}
