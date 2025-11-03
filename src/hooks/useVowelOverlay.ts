import { useRef, useEffect, useMemo, useState } from 'react';
import { TargetLandmarksComputer } from '../utils/targetLandmarksComputer';
import { drawTargetMouthContours, drawVowelLabel } from '../utils/Draw';
import { extractVowels } from '../utils/hangul';
import type { LandmarkPoint } from '../constants/landmarks';

/*
 * @param text - 모음을 추출할 문장. 단어,문장, 노래방 등 
어차피 모음 추출해서 배열로 만들어야 하므로
이hook에다가 넣겠습니다.

배열 -> 타이머 -> 모음 오버레이

 */

const intervalTime = 800;
export function useVowelOverlay(text: string | null) {
  /*모음배열만들기*/
  const vowels = useMemo(() => {
    if (!text) return [];
    return extractVowels(text); // 문장에서 모음 추출
  }, [text]);

  const [currentVowelIndex, setCurrentVowelIndex] = useState<number>(0);
  /*모음 전환 타이머 ref */
  const intervalRef = useRef<number | null>(null);
  const targetVowelRef = useRef<(string | null)[]>([]);
  const targetLandmarksComputer = useRef<TargetLandmarksComputer | null>(null);

  // 모음 배열이 변경되면 타이머 초기화 및 시작
  useEffect(() => {
    // 타이머 초기화
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // 모음이 있으면 첫 번째 모음부터 시작
    if (vowels.length > 0) {
      setCurrentVowelIndex(0);

      // 1초마다 다음 모음으로 전환
      intervalRef.current = setInterval(() => {
        setCurrentVowelIndex(prev => {
          const next = prev + 1;
          // 모든 모음을 표시했으면 타이머 정지
          if (next >= vowels.length) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            console.log('[타이머 종료] 모든 모음 표시 완료');
            return prev; // 마지막 모음 유지
          }
          return next;
        });
      }, intervalTime);
    }

    // cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [vowels]);

  // 현재 표시할 모음 (인덱스 기반)
  const currentDisplayVowel = useMemo(() => {
    if (vowels.length === 0) return null;
    if (currentVowelIndex >= vowels.length) return vowels[vowels.length - 1];
    return vowels[currentVowelIndex];
  }, [vowels, currentVowelIndex]);

  // 모음 업데이트
  useEffect(() => {
    targetVowelRef.current = vowels;

    if (!targetLandmarksComputer.current) {
      targetVowelRef.current = vowels;
      targetLandmarksComputer.current = new TargetLandmarksComputer(currentDisplayVowel);
    } else {
      // 기존 인스턴스가 있으면 모음만 업데이트
      targetLandmarksComputer.current.setTargetVowel(currentDisplayVowel);
    }
  }, [vowels, currentDisplayVowel]);

  /**
   * 오버레이를 캔버스에 그리는 함수
   */
  const renderOverlay = (
    canvasCtx: CanvasRenderingContext2D,
    toCanvas: (p: LandmarkPoint) => { x: number; y: number },
    allLandmarks: LandmarkPoint[],
    cachedResultsRef: React.MutableRefObject<any>,
    timeSinceLastDetection: number,
  ) => {
    // 현재 표시할 모음 사용
    const currentTargetVowel = currentDisplayVowel;
    if (!currentTargetVowel || !targetLandmarksComputer.current) {
      return;
    }

    let targetLandmarks = cachedResultsRef.current?.lastTargetLandmarks;

    if (timeSinceLastDetection >= 8 || !targetLandmarks) {
      // 마지막 감지 이후 8ms 이상이거나 목표 랜드마크가 없으면 계산
      targetLandmarks = targetLandmarksComputer.current.computeTargetLandmarks(allLandmarks);

      if (!cachedResultsRef.current) cachedResultsRef.current = {}; // 캐시된 결과가 없으면 초기화
      cachedResultsRef.current.lastTargetLandmarks = targetLandmarks; // 캐시된 결과에 목표 랜드마크 저장
    }

    if (targetLandmarks) {
      // 목표 랜드마크가 있으면 그림
      drawTargetMouthContours(canvasCtx, targetLandmarks, toCanvas); // 정답 입술 윤곽선 그리기
      drawVowelLabel(canvasCtx, targetLandmarks, currentTargetVowel, toCanvas); // 정답 모음 라벨 그리기
    }
  };

  /** 현재 표시 중인 모음 (타이머로 변경되는 모음) */
  const currentVowel = currentDisplayVowel;

  return {
    renderOverlay, // 모음 오버레이 렌더링 함수
    targetVowel: targetVowelRef.current, // 목표 모음 배열
    currentVowel, // 현재 표시 중인 모음
    vowels, // 전체 모음 배열
  };
}
