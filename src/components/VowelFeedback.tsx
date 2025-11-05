import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Feedback from './Feedback';
import {
  calculateBlendshapeSimilarity,
  filterTargetBlendshapes,
  TARGET_BLENDSHAPES,
} from '../utils/blendshapeProcessor';

interface VowelFeedbackProps {
  activeVowel: string | null;
  /** Blendshape snapshot for current frame (filtered keys preferred) */
  currentBlendshapes: Record<string, number> | null;
  /** Change this key when moving to a new lyric line to clear accumulated feedback */
  resetKey?: string | number;
}

interface FeedbackItem {
  id: number;
  text: string; // short heading
  message: string; // detailed guidance
}

/** Simple vowel groups for heuristics */
const ROUNDED_VOWELS = new Set(['ㅜ', 'ㅠ', 'ㅗ', 'ㅛ']);
const OPEN_VOWELS = new Set(['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ']);

export const VowelFeedback: React.FC<VowelFeedbackProps> = ({
  activeVowel,
  currentBlendshapes,
  resetKey,
}) => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [totalSegments, setTotalSegments] = useState<number>(0);
  const [correctSegments, setCorrectSegments] = useState<number>(0);

  // segment tracking
  const prevVowelRef = useRef<string | null>(null);
  const segmentSamplesRef = useRef<Record<string, number>[]>([]); // per-frame filtered blendshapes
  const segmentSimilaritiesRef = useRef<number[]>([]);
  const nextFeedbackIdRef = useRef<number>(1);

  // load target vowels once
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

  // Reset feedback on lyric line change
  useEffect(() => {
    setFeedbackList([]);
    setTotalSegments(0);
    setCorrectSegments(0);
    segmentSamplesRef.current = [];
    segmentSimilaritiesRef.current = [];
    prevVowelRef.current = null;
  }, [resetKey]);

  // Accumulate samples while vowel stays the same; on change, evaluate previous
  useEffect(() => {
    const prevVowel = prevVowelRef.current;

    // If vowel changed, finalize previous segment
    if (prevVowel && activeVowel !== prevVowel) {
      const prevTarget = getTargetBlendshapes(prevVowel);
      if (prevTarget && segmentSamplesRef.current.length > 0) {
        const similarities = segmentSimilaritiesRef.current;
        const avgSimilarity = similarities.length
          ? similarities.reduce((a, b) => a + b, 0) / similarities.length
          : 0;

        // threshold: 0.90 baseline, relaxed by 0.05 if next vowel induces rounding/opening
        let threshold = 0.9;
        const nextVowel = activeVowel; // new current is the "next" for the segment we finalize
        if (nextVowel && (ROUNDED_VOWELS.has(nextVowel) || OPEN_VOWELS.has(nextVowel))) {
          threshold -= 0.05;
        }

        const flag = avgSimilarity >= threshold ? 1 : 0;

        // scoring counters
        setTotalSegments(x => x + 1);
        if (flag === 1) {
          setCorrectSegments(x => x + 1);
        }

        if (flag === 0) {
          // derive feedback based on averaged blendshapes vs target
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
              text: fb.title,
              message: fb.message,
            },
          ]);
        }
      }

      // reset for new segment
      segmentSamplesRef.current = [];
      segmentSimilaritiesRef.current = [];
    }

    // Update current segment accumulation if we have a vowel and a blendshape snapshot
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
      <div style={{ marginBottom: 8 }}>
        {totalSegments > 0 ? (
          <Feedback
            text={`Vowel accuracy`}
            message={`${Math.round((correctSegments / totalSegments) * 100)}% (${correctSegments}/${totalSegments})`}
          />
        ) : null}
      </div>
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
  // Heuristic mappings
  const needOpen = OPEN_VOWELS.has(vowel);
  const needRound = ROUNDED_VOWELS.has(vowel);

  const jawOpen = avg['jawOpen'] ?? 0;
  const jawOpenTarget = target['jawOpen'] ?? 0;
  const pucker = avg['mouthPucker'] ?? 0;
  const puckerTarget = target['mouthPucker'] ?? 0;
  const funnel = avg['mouthFunnel'] ?? 0;
  const funnelTarget = target['mouthFunnel'] ?? 0;

  // Compare ratios to target to decide primary error
  const ratio = (v: number, t: number) => (t > 0 ? v / t : 1);
  const openRatio = ratio(jawOpen, jawOpenTarget);
  const puckerRatio = ratio(pucker, puckerTarget);
  const funnelRatio = ratio(funnel, funnelTarget);

  // Priority: if vowel needs openness -> check jawOpen; if needs rounding -> check pucker/funnel
  if (needOpen && openRatio < 0.9) {
    return { title: `${vowel} pronunciation`, message: 'Open your mouth more.' };
  }
  if (needRound && puckerRatio < 0.9) {
    return { title: `${vowel} pronunciation`, message: 'Round your lips more.' };
  }
  if (needRound && funnelRatio < 0.9) {
    return { title: `${vowel} pronunciation`, message: 'Purse your lips a bit more.' };
  }

  // Over-opening when rounding is needed
  if (needRound && openRatio > 1.15) {
    return {
      title: `${vowel} pronunciation`,
      message: 'Your mouth is too open. Reduce opening slightly.',
    };
  }

  // Generic guidance
  return {
    title: `${vowel} pronunciation`,
    message: 'Keep the mouth shape more consistent and defined.',
  };
}

export default VowelFeedback;
