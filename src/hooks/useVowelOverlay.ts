import { useRef, useEffect, useMemo } from 'react';
import { TargetLandmarksComputer } from '../utils/targetLandmarksComputer';
import { drawTargetMouthContours, drawVowelLabel } from '../utils/Draw';
import { extractVowels } from '../utils/hangul';
import type { LandmarkPoint } from '../constants/landmarks';

/*
 * @param text - 모음을 추출할 문장. 단어,문장, 노래방 등 
어차피 모음 추출해서 배열로 만들어야 하므로
이hook에다가 넣겠습니다.
 */
export function useVowelOverlay(text: string | null) {
  /*모음배열추출*/
  const vowels = useMemo(() => {
    if (!text) return [];
    return extractVowels(text); // 문장에서 모음 추출
  }, [text]);

  /*현재 목표 모음 배열 (ref) */
  const targetVowelRef = useRef<(string | null)[]>([]);
  /*목표 랜드마크 계산 클래스 */
  const targetLandmarksComputer = useRef<TargetLandmarksComputer | null>(null);

  // 모음 업데이트
  useEffect(() => {
    const currentVowel = vowels.length > 0 ? vowels[0] : null;
    targetVowelRef.current = vowels;
    
    if (!targetLandmarksComputer.current) {
      targetVowelRef.current = vowels;
      targetLandmarksComputer.current = new TargetLandmarksComputer(currentVowel);
    } else {
      // 기존 인스턴스가 있으면 모음만 업데이트
      targetLandmarksComputer.current.setTargetVowel(currentVowel);
    }
  }, [vowels]);

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
    const currentTargetVowel = targetVowelRef.current.length > 0 ? targetVowelRef.current[0] : null;
    if (!currentTargetVowel || !targetLandmarksComputer.current) {
      return;
    }

    let targetLandmarks = cachedResultsRef.current?.lastTargetLandmarks;
    
    if (timeSinceLastDetection >= 8 || !targetLandmarks) { // 마지막 감지 이후 8ms 이상이거나 목표 랜드마크가 없으면 계산
      targetLandmarks =
        targetLandmarksComputer.current.computeTargetLandmarks(allLandmarks);

      if (!cachedResultsRef.current) cachedResultsRef.current = {}; // 캐시된 결과가 없으면 초기화
      cachedResultsRef.current.lastTargetLandmarks = targetLandmarks; // 캐시된 결과에 목표 랜드마크 저장
    }

    if (targetLandmarks) { // 목표 랜드마크가 있으면 그림
      drawTargetMouthContours(canvasCtx, targetLandmarks, toCanvas); // 정답 입술 윤곽선 그리기
      drawVowelLabel(canvasCtx, targetLandmarks, currentTargetVowel, toCanvas); // 정답 모음 라벨 그리기
    }
  };

  /** 현재 모음 (첫 번째 모음) */
  const currentVowel = vowels.length > 0 ? vowels[0] : null;

  return {
    renderOverlay, // 모음 오버레이 렌더링 함수
    targetVowel: targetVowelRef.current, // 목표 모음 배열
    currentVowel, // 현재 모음 (첫 번째 모음)
    vowels, // 전체 모음 배열
  };
}

