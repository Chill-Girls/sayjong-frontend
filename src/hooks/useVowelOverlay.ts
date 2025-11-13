import { useRef, useEffect, useState, useCallback } from 'react';
import { TargetLandmarksComputer } from '../utils/targetLandmarksComputer';
import { drawTargetMouthContours, drawLiveMouthContours } from '../utils/Draw';

import {
  filterTargetBlendshapes,
  calculateBlendshapeSimilarity,
} from '../utils/blendshapeProcessor';

import type { LandmarkPoint } from '../constants/landmarks';

interface UseVowelOverlayProps {
  currentVowel: string | null;
  /** 목표 블렌드쉐이프를 가져오는 함수 */
  getTargetBlendshapes?: (vowel: string | null) => Record<string, number> | null;
  /** 현재 블렌드쉐이프 데이터 */
  currentBlendshapes?: Record<string, number> | null;
}

export function useVowelOverlay({
  currentVowel,
  getTargetBlendshapes,
  currentBlendshapes,
}: UseVowelOverlayProps) {
  const targetVowelRef = useRef<(string | null)[]>([]);
  const targetLandmarksComputer = useRef<TargetLandmarksComputer | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null); // 카운트다운
  const [showAROverlay, setShowAROverlay] = useState(false); // AR 오버레이 표시 여부
  const [arVowel, setArVowel] = useState<string | null>(null); // AR에 표시할 모음
  const isCountdownCancelledRef = useRef<boolean>(false); // 카운트다운 취소 플래그
  const similarityScoreRef = useRef<number | null>(null); // 유사도 점수 ref
  const lastBlendshapeCalcTimeRef = useRef<number>(0); // 블렌드쉐이프 계산 throttling용 ref

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

  useEffect(() => {
    // 현재 모음이 변경되면 AR 오버레이 모음도 업데이트
    if (showAROverlay && currentVowel) {
      setArVowel(currentVowel);
    }
  }, [showAROverlay, currentVowel]);

  // AR 오버레이 시작/멈춤 토글 (카운트다운 포함)
  const startAROverlay = useCallback(
    async (vowel: string | null) => {
      // 이미 AR 오버레이가 표시 중이면 멈춤
      if (showAROverlay) {
        setShowAROverlay(false);
        setArVowel(null);
        setCountdown(null);
        isCountdownCancelledRef.current = false;
        return;
      }

      // 카운트다운 중이면 취소
      if (countdown !== null) {
        isCountdownCancelledRef.current = true;
        setCountdown(null);
        setShowAROverlay(false);
        setArVowel(null);
        return;
      }

      // AR 오버레이가 꺼져있으면 카운트다운 후 시작
      setShowAROverlay(false);
      setArVowel(null);
      isCountdownCancelledRef.current = false;

      // 카운트다운
      for (let i = 3; i > 0; i--) {
        // 취소되었는지 확인
        if (isCountdownCancelledRef.current) {
          setCountdown(null);
          return;
        }

        setCountdown(i);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 취소되었는지 확인
        if (isCountdownCancelledRef.current) {
          setCountdown(null);
          return;
        }
      }

      // 취소되었는지 확인
      if (isCountdownCancelledRef.current) {
        setCountdown(null);
        return;
      }

      setCountdown(null);
      // AR 오버레이 표시 시작
      setArVowel(vowel);
      setShowAROverlay(true);
    },
    [showAROverlay, countdown],
  );

  /**
   * 오버레이를 캔버스에 그리는 함수
   */
  const renderOverlay = useCallback(
    (
      canvasCtx: CanvasRenderingContext2D,
      toCanvas: (p: LandmarkPoint) => { x: number; y: number },
      allLandmarks: LandmarkPoint[],
      cachedResultsRef: React.MutableRefObject<any>,
      timeSinceLastDetection: number,
    ) => {
      const now = performance.now();
      // AR 오버레이가 활성화되어 있어도, TTS 재생 중이면 currentVowel을 우선 사용
      const currentTargetVowel = showAROverlay && arVowel ? arVowel : currentVowel;

      // 블렌드쉐이프 유사도 계산 및 실시간 입술 윤곽선 그리기
      if (currentBlendshapes && getTargetBlendshapes && currentTargetVowel) {
        let similarity: number | null = null;

        // throttling: 33ms마다 계산 (약 30fps)
        if (now - lastBlendshapeCalcTimeRef.current >= 33) {
          lastBlendshapeCalcTimeRef.current = now;

          const filteredBlendshapes = filterTargetBlendshapes(currentBlendshapes);
          const targetBlendshapes = getTargetBlendshapes(currentTargetVowel);

          if (targetBlendshapes) {
            similarity = calculateBlendshapeSimilarity(filteredBlendshapes, targetBlendshapes);
            similarityScoreRef.current = similarity;
          }
        } else {
          // 이전 계산 결과 재사용 (throttling 중)
          similarity = similarityScoreRef.current;
        }

        // 유사도에 따라 입술 윤곽선 색상 결정 및 그리기
      }
      if (showAROverlay) {
        drawLiveMouthContours(canvasCtx, allLandmarks, toCanvas);
      }

      // 목표 모음 오버레이 그리기
      // currentTargetVowel이 없으면 오버레이를 그리지 않음 (하지만 실시간 입술 윤곽선은 그려야 함)
      if (!currentTargetVowel) {
        return;
      }

      // targetLandmarksComputer가 없으면 초기화
      if (!targetLandmarksComputer.current) {
        targetLandmarksComputer.current = new TargetLandmarksComputer(currentTargetVowel);
      }

      // AR 오버레이가 활성화되어 있어도, TTS 재생 중이면 currentVowel을 우선 사용
      // (TTS 재생 중 모음이 실시간으로 업데이트되도록)
      const targetVowel = showAROverlay && arVowel ? arVowel : currentVowel;
      if (targetVowel && targetLandmarksComputer.current) {
        targetLandmarksComputer.current.setTargetVowel(targetVowel);
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
        if (similarityScoreRef.current  && similarityScoreRef.current >= 0.75) {
          drawTargetMouthContours(canvasCtx, targetLandmarks, toCanvas, '#00FF00'); // 초록
        } else {
          drawTargetMouthContours(canvasCtx, targetLandmarks, toCanvas, '#FF8800'); // 주황
        }
        // drawTargetMouthContours(canvasCtx, targetLandmarks, toCanvas); // 정답 입술 윤곽선 그리기
        //drawVowelLabel(canvasCtx, targetLandmarks, currentTargetVowel, toCanvas); // 정답 모음 라벨 그리기
      }
    },
    [showAROverlay, arVowel, currentVowel, currentBlendshapes, getTargetBlendshapes],
  );

  return {
    renderOverlay,
    currentVowel: showAROverlay ? arVowel : currentVowel, // AR 오버레이가 활성화되면 arVowel 사용
    startAROverlay, // AR 오버레이 시작 함수 (카운트다운 포함)
    countdown, // 카운트다운 상태
    showAROverlay, // AR 오버레이 표시 여부 (flag)
  };
}
