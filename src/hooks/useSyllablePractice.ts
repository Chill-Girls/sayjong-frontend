import { useEffect, useState } from 'react';
import type { LyricLine } from '../api/songs/types';

export interface PracticeSyllable {
  sylNo: number;
  textKor: string;
  textRomaja: string;
  nativeAudioUrl: string;
  lineNo: number;
  line?: LyricLine | null;
}

interface UseSyllablePracticeResult {
  syllables: PracticeSyllable[];
  loading: boolean;
  error: string | null;
}

// 예시 데이터 (API 연동 시 삭제)
const EXAMPLE_LINES: LyricLine[] = [
  {
    lyricLineId: 1,
    lineNo: 1,
    originalText: '오늘은',
    textRomaja: 'oneureun',
    textEng: 'today is',
    nativeAudioUrl: 'https://example.com/audio/lines/1.mp3',
    startTime: 7540,
    syllableTimings: [],
  },
  {
    lyricLineId: 2,
    lineNo: 2,
    originalText: '날씨가',
    textRomaja: 'nalssiga',
    textEng: 'the weather',
    nativeAudioUrl: 'https://example.com/audio/lines/2.mp3',
    startTime: 8200,
    syllableTimings: [],
  },
  {
    lyricLineId: 3,
    lineNo: 3,
    originalText: '좋아요',
    textRomaja: 'joayo',
    textEng: 'is nice',
    nativeAudioUrl: 'https://example.com/audio/lines/3.mp3',
    startTime: 9000,
    syllableTimings: [],
  },
];

const EXAMPLE_SYLLABLES: PracticeSyllable[] = [
  {
    sylNo: 1,
    textKor: '오',
    textRomaja: 'o',
    nativeAudioUrl: 'https://example.com/audio/1/line1/syl1.mp3',
    lineNo: EXAMPLE_LINES[0].lineNo,
    line: EXAMPLE_LINES[0],
  },
  {
    sylNo: 2,
    textKor: '늘',
    textRomaja: 'nuel',
    nativeAudioUrl: 'https://example.com/audio/1/line1/syl2.mp3',
    lineNo: EXAMPLE_LINES[0].lineNo,
    line: EXAMPLE_LINES[0],
  },
  {
    sylNo: 3,
    textKor: '은',
    textRomaja: 'eun',
    nativeAudioUrl: 'https://example.com/audio/1/line1/syl3.mp3',
    lineNo: EXAMPLE_LINES[0].lineNo,
    line: EXAMPLE_LINES[0],
  },
  {
    sylNo: 4,
    textKor: '날',
    textRomaja: 'nal',
    nativeAudioUrl: 'https://example.com/audio/1/line2/syl1.mp3',
    lineNo: EXAMPLE_LINES[1].lineNo,
    line: EXAMPLE_LINES[1],
  },
  {
    sylNo: 5,
    textKor: '씨',
    textRomaja: 'ssi',
    nativeAudioUrl: 'https://example.com/audio/1/line2/syl2.mp3',
    lineNo: EXAMPLE_LINES[1].lineNo,
    line: EXAMPLE_LINES[1],
  },
  {
    sylNo: 6,
    textKor: '가',
    textRomaja: 'ga',
    nativeAudioUrl: 'https://example.com/audio/1/line2/syl3.mp3',
    lineNo: EXAMPLE_LINES[1].lineNo,
    line: EXAMPLE_LINES[1],
  },
  {
    sylNo: 7,
    textKor: '좋',
    textRomaja: 'jo',
    nativeAudioUrl: 'https://example.com/audio/1/line3/syl1.mp3',
    lineNo: EXAMPLE_LINES[2].lineNo,
    line: EXAMPLE_LINES[2],
  },
  {
    sylNo: 8,
    textKor: '아',
    textRomaja: 'a',
    nativeAudioUrl: 'https://example.com/audio/1/line3/syl2.mp3',
    lineNo: EXAMPLE_LINES[2].lineNo,
    line: EXAMPLE_LINES[2],
  },
  {
    sylNo: 9,
    textKor: '요',
    textRomaja: 'yo',
    nativeAudioUrl: 'https://example.com/audio/1/line3/syl3.mp3',
    lineNo: EXAMPLE_LINES[2].lineNo,
    line: EXAMPLE_LINES[2],
  },
];

// TODO: API 연동 시 아래 로직을 실제 fetch 로 교체, 마음대로 수정해도 됩니다.
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
