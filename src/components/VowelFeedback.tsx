import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Feedback from './Feedback';
import {
  calculateBlendshapeSimilarity,
  filterTargetBlendshapes,
  TARGET_BLENDSHAPES,
} from '../utils/blendshapeProcessor';

interface VowelFeedbackProps {
  activeVowel: string | null;
  /** 현재 프레임의 블렌드쉐이프 스냅샷 (필터링된 키 권장) */
  currentBlendshapes: Record<string, number> | null;
  /** 새로운 가사 줄로 이동할 때 이 키를 변경하여 누적된 피드백을 초기화 */
  resetKey?: string | number;
}

interface FeedbackItem {
  id: number;
  text: string; // 짧은 제목
  message: string; // 상세한 안내
}

/** 휴리스틱을 위한 단순 모음 그룹 */
const ROUNDED_VOWELS = new Set(['ㅜ', 'ㅠ', 'ㅗ', 'ㅛ']);
const OPEN_VOWELS = new Set(['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ']);

export const VowelFeedback: React.FC<VowelFeedbackProps> = ({
  activeVowel,
  currentBlendshapes,
  resetKey,
}) => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);

  // 세그먼트 추적
  const prevVowelRef = useRef<string | null>(null);
  const segmentSamplesRef = useRef<Record<string, number>[]>([]); // 프레임별 필터링된 블렌드쉐이프
  const segmentSimilaritiesRef = useRef<number[]>([]);
  const nextFeedbackIdRef = useRef<number>(1);

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
    setFeedbackList([]);
    segmentSamplesRef.current = [];
    segmentSimilaritiesRef.current = [];
    prevVowelRef.current = null;
  }, [resetKey]);

  // 모음이 같은 동안 샘플 누적; 변경 시 이전 세그먼트 평가
  useEffect(() => {
    const prevVowel = prevVowelRef.current;

    // 모음이 변경된 경우, 이전 세그먼트 완료
    if (prevVowel && activeVowel !== prevVowel) {
      const prevTarget = getTargetBlendshapes(prevVowel);
      if (prevTarget && segmentSamplesRef.current.length > 0) {
        const similarities = segmentSimilaritiesRef.current;
        const avgSimilarity = similarities.length
          ? similarities.reduce((a, b) => a + b, 0) / similarities.length
          : 0;

        // 임계값: 0.90 기준값, 다음 모음이 둥글게/열리게 하면 0.05 완화
        let threshold = 0.9;
        const nextVowel = activeVowel; // 새로운 현재가 완료할 세그먼트의 "다음" 모음
        if (nextVowel && (ROUNDED_VOWELS.has(nextVowel) || OPEN_VOWELS.has(nextVowel))) {
          threshold -= 0.05;
        }

        const flag = avgSimilarity >= threshold ? 1 : 0;

        if (flag === 0) {
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

          const fb = buildFeedbackForVowel(prevVowel, averaged, prevTarget);
          setFeedbackList(list => [
            ...list,
            {
              id: nextFeedbackIdRef.current++,
              text: prevVowel, // 모음만 표시
              message: fb.message,
            },
          ]);
        }
      }

      // 새 세그먼트를 위한 초기화
      segmentSamplesRef.current = [];
      segmentSimilaritiesRef.current = [];
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

    prevVowelRef.current = activeVowel;
  }, [activeVowel, currentBlendshapes, getTargetBlendshapes]);

  return (
    <div>
      {feedbackList.map(item => (
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

  // 주요 오류를 결정하기 위해 목표값과 비율 비교
  const ratio = (v: number, t: number) => (t > 0 ? v / t : 1);
  const openRatio = ratio(jawOpen, jawOpenTarget);
  const puckerRatio = ratio(pucker, puckerTarget);
  const funnelRatio = ratio(funnel, funnelTarget);

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
