import { getSongLyricSyllables } from '../api/songs';
import { useEffect, useState } from 'react';
import type {
  SongSyllablesResponse,
  LyricSyllableLine,
  Syllable as ApiSyllable,
} from '../api/songs/types';

export interface PracticeSyllable {
  sylNo: number;
  textKor: string;
  textRomaja?: string | null;
  nativeAudioUrl?: string | null;
  lineNo: number;
  line?: LyricSyllableLine | null;
}

interface UseSyllablePracticeResult {
  syllables: PracticeSyllable[];
  loading: boolean;
  error: string | null;
  songTitle: string | null;
  singer: string | null;
}

export function useSyllablePractice(songId: number | null): UseSyllablePracticeResult {
  const [syllables, setSyllables] = useState<PracticeSyllable[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [songTitle, setSongTitle] = useState<string | null>(null);
  const [singer, setSinger] = useState<string | null>(null);

  useEffect(() => {
    if (songId === null) {
      setSyllables([]);
      setSongTitle(null);
      setSinger(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res: SongSyllablesResponse = await getSongLyricSyllables(songId);
        if (cancelled) return;

        setSongTitle(res.title ?? null);
        setSinger(res.singer ?? null);

        const flattened: PracticeSyllable[] = [];
        if (Array.isArray(res.lyrics)) {
          for (const line of res.lyrics) {
            const lineNo = line.lineNo ?? 0;
            for (const s of line.syllables ?? []) {
              const apiSyl = s as ApiSyllable;
              flattened.push({
                sylNo: apiSyl.sylNo,
                textKor: apiSyl.textKor,
                textRomaja: apiSyl.textRomaja ?? null,
                nativeAudioUrl: apiSyl.nativeAudioUrl ?? null,
                lineNo,
                line,
              });
            }
          }
        }

        setSyllables(flattened);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [songId]);

  return { syllables, loading, error, songTitle, singer };
}
