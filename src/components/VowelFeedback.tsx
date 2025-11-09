import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import Feedback from './Feedback';
import {
  calculateBlendshapeSimilarity,
  filterTargetBlendshapes,
  TARGET_BLENDSHAPES,
} from '../utils/blendshapeProcessor';

interface VowelFeedbackProps {
  activeVowel: string | null;
  /* 현재 프레임에서 잡힌 블렌드쉐이프 값 - 이게 음절단위가 아닌거 같아요*/
  currentBlendshapes: Record<string, number> | null;
  /* 현재 평가 중인 음절의 위치 (없으면 null) */
  currentIndex: number | null;
  /* 현재 소절을 글자 단위로 나눈 배열 */
  lyricChars: string[];

  feedbackItems: SegmentFeedbackItem[];
  /* 세그먼트가 실패했을 때 호출되는 콜백 */
  onSegmentFeedback?: (payload: SegmentFeedbackItem) => void;
  /* 줄 이동 등으로 피드백을 초기화할 때 호출되는 콜백 */
  onReset?: () => void /* 피드백을 초기화할 때 호출되는 call back function */;
  shouldDisplay?: boolean;
  /* 새로운 가사 줄로 이동할 때 이 키를 변경하여 누적된 피드백을 초기화 */
  resetKey?: string | number;
}

export interface SegmentFeedbackItem {
  id: number;
  text: string;
  message: string;
  indices: number[];
}

/** 휴리스틱을 위한 단순 모음 그룹 */
const ROUNDED_VOWELS = new Set(['ㅜ', 'ㅠ', 'ㅗ', 'ㅛ']);
const OPEN_VOWELS = new Set(['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅘ', 'ㅝ']);
const SPREAD_VOWELS = new Set(['ㅣ', 'ㅒ', 'ㅖ', 'ㅛ', 'ㅚ', 'ㅙ', 'ㅚ', 'ㅟ', 'ㅞ', 'ㅢ']);

export const VowelFeedback: React.FC<VowelFeedbackProps> = ({
  activeVowel,
  currentBlendshapes,
  currentIndex,
  lyricChars,
  feedbackItems,
  onSegmentFeedback,
  onReset,
  shouldDisplay = true,
  resetKey,
}) => {
  // 세그먼트 추적
  const prevVowelRef = useRef<string | null>(null);
  const segmentSamplesRef = useRef<Record<string, number>[]>([]); // 프레임별 필터링된 블렌드쉐이프
  const segmentSimilaritiesRef = useRef<number[]>([]);
  const segmentIndicesRef = useRef<number[]>([]);
  const nextFeedbackIdRef = useRef<number>(1);
  const prevIndexRef = useRef<number | null>(null); 

  // 목표 모음을 한 번만 로드
  const targetVowels = useMemo(() => {
    try {
      const raw = localStorage.getItem('target_vowels');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const getTargetBlendshapes = useCallback(
    (vowel: string | null): Record<string, number> | null => {
      if (!vowel || !targetVowels) return null;
      return targetVowels[vowel]?.blendshapes ?? null;
    },
    [targetVowels],
  );

  // 가사 줄 변경 시 피드백 초기화
  useEffect(() => {
    onReset?.();
    segmentSamplesRef.current = [];
    segmentSimilaritiesRef.current = [];
    segmentIndicesRef.current = [];
    prevVowelRef.current = null;
  }, [onReset, resetKey]);

  const finalizeSegment = useCallback(
    (nextVowel: string | null) => {
      const prevVowel = prevVowelRef.current;
      if (!prevVowel) {
        segmentSamplesRef.current = [];
        segmentSimilaritiesRef.current = [];
        segmentIndicesRef.current = [];
        return;
      }

      const prevTarget = getTargetBlendshapes(prevVowel);
      if (prevTarget && segmentSamplesRef.current.length > 0) {
        const similarities = segmentSimilaritiesRef.current;
        const avgSimilarity = similarities.length
          ? similarities.reduce((a, b) => a + b, 0) / similarities.length
          : 0;

        // 임계값: 0.80 기준값, 다음 모음이 둥글게/열리게 하면 0.05 완화
        let threshold = 0.8;
        if (nextVowel && (ROUNDED_VOWELS.has(nextVowel) || OPEN_VOWELS.has(nextVowel))) {
          threshold -= 0.05;
        }

        const flag = avgSimilarity >= threshold ? 1 : 0;

        if (flag === 0 && segmentIndicesRef.current.length > 0) {
          // 평균 블렌드쉐이프와 목표값 비교를 기반으로 피드백 생성
          const averaged: Record<string, number> = {};
          for (const name of TARGET_BLENDSHAPES) {
            let sum = 0;
            let count = 0;
            for (const sample of segmentSamplesRef.current) {
              if (sample[name] !== undefined) {
                sum += sample[name];
                count++;
              }
            }
            averaged[name] = count ? sum / count : 0;
          }

          const uniqueIndices = Array.from(new Set(segmentIndicesRef.current)).sort(
            (a, b) => a - b,
          );
          const segmentText = uniqueIndices
            .map(index => lyricChars[index] ?? '')
            .join('')
            .trim();

          if (segmentText.length > 0) {
            const fb = buildFeedbackForVowel(prevVowel, averaged, prevTarget);
            onSegmentFeedback?.({
              id: nextFeedbackIdRef.current++,
              text: segmentText,
              message: fb.message,
              indices: uniqueIndices,
            });
          }
        }
      }

      segmentSamplesRef.current = [];
      segmentSimilaritiesRef.current = [];
      segmentIndicesRef.current = [];
    },
    [getTargetBlendshapes, lyricChars, onSegmentFeedback],
  );

  // 모음/가사 인덱스가 유지되는 동안 샘플을 누적하고, 변동이 생기면 이전 세그먼트를 평가
  useEffect(() => {
    const prevVowel = prevVowelRef.current;
    const prevIndex = prevIndexRef.current;
    const hasPrevIndex = typeof prevIndex === 'number';
    const hasCurrentIndex = typeof currentIndex === 'number';

    // currentIndex(음절 위치) 변화 여부 추적 -> 음절이 변경된 경우 찾기
    const indexChanged = hasPrevIndex && hasCurrentIndex && currentIndex !== prevIndex;
    const indexReset = hasPrevIndex && !hasCurrentIndex;

    // 모음이 변경된 경우, 이전 세그먼트 강제 종료 -> 이전 세그먼트 평가
    if ((prevVowel && activeVowel !== prevVowel) || indexChanged || indexReset) {
      finalizeSegment(activeVowel ?? null);
    }

    // 모음과 블렌드쉐이프 스냅샷이 있으면 현재 세그먼트 누적 업데이트
    if (activeVowel && currentBlendshapes) {
      const target = getTargetBlendshapes(activeVowel);
      if (target) {
        const filtered = filterTargetBlendshapes(currentBlendshapes);
        segmentSamplesRef.current.push(filtered);
        const sim = calculateBlendshapeSimilarity(filtered, target);
        segmentSimilaritiesRef.current.push(sim);
      }
    }

    if (typeof currentIndex === 'number') {
      const indices = segmentIndicesRef.current;
      const lastIndex = indices.length > 0 ? indices[indices.length - 1] : null;
      if (lastIndex !== currentIndex) {
        indices.push(currentIndex);
      }
    }

    prevVowelRef.current = activeVowel;
    prevIndexRef.current = typeof currentIndex === 'number' ? currentIndex : null;
  }, [
    activeVowel,
    currentBlendshapes,
    currentIndex,
    finalizeSegment,
  ]);

  if (!shouldDisplay) {
    return null;
  }

  return (
    <div>
      {feedbackItems.map(item => (
        <Feedback key={item.id} text={item.text} message={item.message} />
      ))}
    </div>
  );
};

function buildFeedbackForVowel(
  vowel: string,
  avg: Record<string, number>,
  target: Record<string, number>,
): { title: string; message: string } {
  // 휴리스틱 매핑
  const needOpen = OPEN_VOWELS.has(vowel);
  const needRound = ROUNDED_VOWELS.has(vowel);

  const jawOpen = avg['jawOpen'] ?? 0;
  const jawOpenTarget = target['jawOpen'] ?? 0;
  const pucker = avg['mouthPucker'] ?? 0;
  const puckerTarget = target['mouthPucker'] ?? 0;
  const funnel = avg['mouthFunnel'] ?? 0;
  const funnelTarget = target['mouthFunnel'] ?? 0;
  const smileLeft = avg['mouthSmileLeft'] ?? 0;
  const smileRight = avg['mouthSmileRight'] ?? 0;
  const smileLeftTarget = target['mouthSmileLeft'] ?? 0;
  const smileRightTarget = target['mouthSmileRight'] ?? 0;

  // 주요 오류를 결정하기 위해 목표값과 비율 비교
  const ratio = (v: number, t: number) => (t > 0 ? v / t : 1);
  const openRatio = ratio(jawOpen, jawOpenTarget);
  const puckerRatio = ratio(pucker, puckerTarget);
  const funnelRatio = ratio(funnel, funnelTarget);
  const smileLeftRatio = ratio(smileLeft, smileLeftTarget);
  const smileRightRatio = ratio(smileRight, smileRightTarget);
  const smileRatio = Math.min(smileLeftRatio, smileRightRatio);

  // 우선순위: 모음이 열림이 필요하면 -> jawOpen 확인; 둥글림이 필요하면 -> pucker/funnel 확인
  if (needOpen && openRatio < 0.9) {
    return { title: `${vowel} pronunciation`, message: 'Open your mouth more.' };
  }
  if (needRound && puckerRatio < 0.9) {
    return { title: `${vowel} pronunciation`, message: 'Round your lips more.' };
  }
  if (needRound && funnelRatio < 0.9) {
    return { title: `${vowel} pronunciation`, message: 'Purse your lips a bit more.' };
  }
  if (SPREAD_VOWELS.has(vowel) && smileRatio < 0.9) {
    return { title: `${vowel} pronunciation`, message: 'Spread your lips a bit more.' };
  }
  if (SPREAD_VOWELS.has(vowel) && puckerRatio > 1.1) {
    return { title: `${vowel} pronunciation`, message: 'Relax and reduce lip rounding slightly.' };
  }

  // 둥글림이 필요한데 입을 너무 벌린 경우
  if (needRound && openRatio > 1.15) {
    return {
      title: `${vowel} pronunciation`,
      message: 'Your mouth is too open. Reduce opening slightly.',
    };
  }

  // 일반적인 안내
  return {
    title: `${vowel} pronunciation`,
    message: 'Keep the mouth shape more consistent and defined.',
  };
}

export default VowelFeedback;
