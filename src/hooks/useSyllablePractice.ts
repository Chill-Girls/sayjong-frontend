import { useEffect, useState } from 'react';

export interface PracticeSyllable {
  sylNo: number;
  textKor: string;
  textRomaja: string;
  nativeAudioUrl: string;
  lineNo: number;
}

interface UseSyllablePracticeResult {
  syllables: PracticeSyllable[];
  loading: boolean;
  error: string | null;
}

// 예시 데이터 (API 연동 시 삭제)
const EXAMPLE_SYLLABLES: PracticeSyllable[] = [
  {
    sylNo: 1,
    textKor: '안',
    textRomaja: 'an',
    nativeAudioUrl: 'https://example.com/audio/1/line3/syl1.mp3',
    lineNo: 3,
  },
  {
    sylNo: 2,
    textKor: '녕',
    textRomaja: 'nyeong',
    nativeAudioUrl: 'https://example.com/audio/1/line3/syl2.mp3',
    lineNo: 3,
  },
  {
    sylNo: 3,
    textKor: '하',
    textRomaja: 'ha',
    nativeAudioUrl: 'https://example.com/audio/1/line4/syl1.mp3',
    lineNo: 4,
  },
  {
    sylNo: 4,
    textKor: '세',
    textRomaja: 'se',
    nativeAudioUrl: 'https://example.com/audio/1/line4/syl2.mp3',
    lineNo: 4,
  },
  {
    sylNo: 5,
    textKor: '요',
    textRomaja: 'yo',
    nativeAudioUrl: 'https://example.com/audio/1/line4/syl3.mp3',
    lineNo: 4,
  },
];

export function useSyllablePractice(songId: number | null): UseSyllablePracticeResult {
  const [syllables, setSyllables] = useState<PracticeSyllable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: number | undefined;
    async function fetchSyllables() {
      try {
        setLoading(true);
        setError(null);

        // TODO: API 연동 시 아래 로직을 실제 fetch 로 교체
        timeoutId = window.setTimeout(() => {
          setSyllables(EXAMPLE_SYLLABLES);
          setLoading(false);
        }, 200);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        setLoading(false);
      }
    }

    fetchSyllables();

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [songId]);

  return { syllables, loading, error };
}
