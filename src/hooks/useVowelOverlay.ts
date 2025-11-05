import { useRef, useEffect } from 'react';
import { TargetLandmarksComputer } from '../utils/targetLandmarksComputer';
import { drawTargetMouthContours, drawVowelLabel } from '../utils/Draw';
import type { LandmarkPoint } from '../constants/landmarks';

/*
 * @param text - 모음을 추출할 문장. 단어,문장, 노래방 등 
어차피 모음 추출해서 배열로 만들어야 하므로
이hook에다가 넣겠습니다.

배열 -> 타이머 -> 모음 오버레이

 */

export function useVowelOverlay(currentVowel: string | null) {
  const targetVowelRef = useRef<(string | null)[]>([]);
  const targetLandmarksComputer = useRef<TargetLandmarksComputer | null>(null);

  // 모음 업데이트
  useEffect(() => {
    targetVowelRef.current = [currentVowel]; // 현재 모음만 배열에 담음

    if (!targetLandmarksComputer.current) {
      targetLandmarksComputer.current = new TargetLandmarksComputer(currentVowel);
    } else {
      // 기존 인스턴스가 있으면 모음만 업데이트
      targetLandmarksComputer.current.setTargetVowel(currentVowel);
    }
  }, [currentVowel]);

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
    const currentTargetVowel = currentVowel;
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

  return {
    renderOverlay,
    currentVowel,
  };
}
