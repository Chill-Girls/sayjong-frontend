import { useMemo } from 'react';
import { useSong } from './useSongs';
import { useTts } from './useTts';
import type { TtsMark, TimingLine } from '../api/songs/types';

interface KaraokeLineData {
  textOriginal: string;
  startTime: number;
  endTime: number;
  syllables: {
    text: string;
    start: number;
    end: number;
  }[];
}

export function useKaraoke(songId: number | null) {
  const { song, loading, error } = useSong(songId);
  // 받아온 노래 정보에서 타이밍 데이터만 꺼내 캐싱한다
  const lyricLines = useMemo(() => song?.timings ?? [], [song?.timings]);

  const ttsTimeline = useMemo(() => {
    // 마크 정보와 각 마크가 속한 행/음절 인덱스를 따로 저장한다
    const marks: TtsMark[] = [];
    const meta: { lineIndex: number; syllableIndex: number }[] = [];

    lyricLines.forEach((line: TimingLine, lineIndex: number) => {
      line.timings.forEach((mark: TtsMark, syllableIndex: number) => {
        marks.push(mark);
        meta.push({ lineIndex, syllableIndex });
      });
    });

    return { marks, meta };
  }, [lyricLines]);

  const {
    currentSyllable,
    currentVowel,
    currentIndex,
    isPlaying,
    isPaused,
    playTts,
    playOverlayOnly,
    pause,
    stop,
  } = useTts({
    // TTS 훅에 전체 음절 타임라인과 음원 주소를 전달한다
    syllableTimings: ttsTimeline.marks,
    audioUrl: song?.songUrl ?? null,
  });

  // 현재 활성 라인 및 음절 계산
  const activeMeta = typeof currentIndex === 'number' ? ttsTimeline.meta[currentIndex] : null;

  const activeLineIndex =
    typeof activeMeta?.lineIndex === 'number'
      ? activeMeta.lineIndex
      : lyricLines.length > 0
        ? 0
        : null;

  const activeSyllableIndex = activeMeta?.syllableIndex ?? null;

  // LyricsCanvasOverlay에 전달할 최종 가사 라인 데이터
  const karaokeLine: KaraokeLineData | null = useMemo(() => {
    if (activeLineIndex === null) {
      return null;
    }
    const targetLine = lyricLines[activeLineIndex];
    if (!targetLine) {
      return null;
    }

    // 한 음절의 종료 시점은 다음 음절 시작 시점까지로 간주한다
    const syllables = targetLine.timings.map((mark, index, arr) => ({
      text: (mark.markName ?? '').trim(),
      start: mark.timeSeconds,
      end: index < arr.length - 1 ? arr[index + 1].timeSeconds : mark.timeSeconds + 0.6,
    }));

    return {
      textOriginal: targetLine.originalText,
      startTime: syllables[0]?.start ?? 0,
      endTime: syllables[syllables.length - 1]?.end ?? 0,
      syllables,
    };
  }, [activeLineIndex, lyricLines]);

  return {
    isLoading: loading,
    error,
    songInfo: {
      title: song?.titleEng,
      singer: song?.singer,
    },

    // 재생 제어
    playback: {
      isPlaying,
      isPaused,
      play: playTts,
      playOverlayOnly,
      pause,
      stop,
    },

    // 가사 오버레이 정보
    lyrics: {
      currentLine: karaokeLine,
      activeSyllableIndex,
    },

    overlay: {
      currentSyllable,
      currentVowel,
      currentIndex,
    },
  };
}

export type UseKaraokeResult = ReturnType<typeof useKaraoke>;
export type UseKaraokeLyrics = UseKaraokeResult['lyrics'];
