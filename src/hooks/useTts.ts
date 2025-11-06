import { useRef, useState, useCallback, useEffect } from 'react';
import type { TtsMark } from '../api/songs/types';
import { extractVowel } from '../utils/hangul';

interface UseTtsOptions {
  /** TTS 타임스탬프 배열 */
  syllableTimings: TtsMark[];
  /** TTS 오디오 URL (선택적) */
  audioUrl?: string | null;
}

interface UseTtsReturn {
  /** 현재 활성 모음 */
  currentVowel: string | null;
  /** TTS 재생 중 여부 */
  isPlaying: boolean;
  /** TTS 재생 (오디오 + 오버레이) */
  playTts: () => void;
  /** 타임스탬프만 사용한 오버레이 시작 (오디오 재생 없음) */
  playOverlayOnly: () => void;
  /** TTS 및 오버레이 정지 */
  stop: () => void;
}

/**
 * TTS 재생 및 타임스탬프 기반 오버레이를 관리하는 hook
 */
export function useTts({ syllableTimings, audioUrl }: UseTtsOptions): UseTtsReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [currentVowel, setCurrentVowel] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playAudio, setPlayAudio] = useState(false); // 오디오 재생 여부

  // 타임스탬프 기반 오버레이 업데이트 루프
  const updateOverlay = useCallback(() => {
    let currentTime: number;

    if (playAudio && audioRef.current) {
      // 오디오 재생 중이면 오디오의 currentTime 사용
      currentTime = audioRef.current.currentTime;
    } else if (startTimeRef.current !== null) {
      // 오버레이만 재생 중이면 경과 시간 계산
      currentTime = (performance.now() - startTimeRef.current) / 1000;
    } else {
      // 둘 다 아니면 정지
      setCurrentVowel(null);
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    // 타임스탬프에서 현재 활성 모음 찾기
    let activeMark: TtsMark | null = null;
    for (let i = syllableTimings.length - 1; i >= 0; i--) {
      if (currentTime >= syllableTimings[i].timeSeconds) {
        activeMark = syllableTimings[i];
        break;
      }
    }

    const vowel = activeMark ? extractVowel(activeMark.markName) : null;
    setCurrentVowel(prevVowel => (prevVowel !== vowel ? vowel : prevVowel));

    // 오버레이만 재생 중이고 타임스탬프가 끝났는지 확인
    if (!playAudio && startTimeRef.current !== null) {
      const lastMark = syllableTimings[syllableTimings.length - 1];
      if (lastMark && currentTime >= lastMark.timeSeconds) {
        // 마지막 타임스탬프를 지나면 정지
        stop();
        return;
      }
    }

    // 다음 프레임에 이 함수를 다시 실행
    animationFrameRef.current = requestAnimationFrame(updateOverlay);
  }, [syllableTimings, playAudio]);

  // 정지 함수
  const stop = useCallback(() => {
    // 애니메이션 프레임 루프 중지
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // 오디오 정지
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current = null;
    }

    // 상태 초기화
    setCurrentVowel(null);
    setIsPlaying(false);
    setPlayAudio(false);
    startTimeRef.current = null;
  }, []);

  // TTS 재생 (오디오 + 오버레이)
  const playTts = useCallback(() => {
    stop();

    if (!audioUrl) {
      console.warn('TTS 오디오 URL이 없습니다.');
      return;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const onEnded = () => {
      stop();
    };
    audio.addEventListener('ended', onEnded);

    audio
      .play()
      .then(() => {
        setPlayAudio(true);
        setIsPlaying(true);
        startTimeRef.current = null; // 오디오 재생 중이면 startTimeRef 사용 안 함
        animationFrameRef.current = requestAnimationFrame(updateOverlay);
      })
      .catch(e => {
        console.error('TTS 재생 오류:', e);
        stop();
      });
  }, [audioUrl, stop, updateOverlay]);

  // 타임스탬프만 사용한 오버레이 시작 (오디오 재생 없음)
  const playOverlayOnly = useCallback(() => {
    stop();

    if (!syllableTimings || syllableTimings.length === 0) {
      console.warn('타임스탬프 데이터가 없습니다.');
      return;
    }

    setPlayAudio(false);
    setIsPlaying(true);
    startTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(updateOverlay);
  }, [syllableTimings, stop, updateOverlay]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    currentVowel,
    isPlaying,
    playTts,
    playOverlayOnly,
    stop,
  };
}

