/**
 * blendshapeProcessor.ts
 * 블렌드쉐이프 데이터 처리 및 표시 로직
 * 블렌드쉐이프 -> 입술이 얼마나 열리고 닫히는지 등의 정보
 */

/** 발음 훈련을 위한 목표 블렌드쉐이프 */
export const TARGET_BLENDSHAPES = [
  'jawOpen',
  'mouthPucker',
  'mouthSmileLeft',
  'mouthSmileRight',
  'mouthFunnel',
];

/** 유사도 계산 시 사용하는 블렌드쉐이프별 가중치 */
export const BLENDSHAPE_WEIGHTS: Record<string, number> = {
  jawOpen: 2.0,
  mouthPucker: 1.5,
  mouthSmileLeft: 1.2,
  mouthSmileRight: 1.2,
  mouthFunnel: 1.0,
};

/**
 * 블렌드쉐이프 평활화를 위한 클래스
 * EMA(지수 이동 평균) 필터링을 사용하여 블렌드쉐이프 데이터를 부드럽게 만듭니다
 */
export class BlendshapeSmoother {
  private history: number[][] = [];
  private smoothingFactor: number;

  constructor(smoothingFactor: number = 0.7) {
    this.smoothingFactor = smoothingFactor;
  }

  /**
   * 블렌드쉐이프 데이터를 평활화합니다
   * @param newBlendshapes - 새로운 블렌드쉐이프 데이터 배열
   * @returns 평활화된 블렌드쉐이프 데이터 배열
   */
  smooth(newBlendshapes: number[]): number[] {
    if (this.history.length === 0) {
      this.history.push([...newBlendshapes]);
      return [...newBlendshapes];
    }

    const lastBlendshapes = this.history[this.history.length - 1];
    const smoothed = newBlendshapes.map((newVal, index) => {
      const lastVal = lastBlendshapes[index] || 0;
      return lastVal * this.smoothingFactor + newVal * (1 - this.smoothingFactor);
    });

    this.history.push(smoothed);
    if (this.history.length > 5) this.history.shift();

    return smoothed;
  }

  /**
   * 히스토리를 초기화합니다
   */
  reset() {
    this.history = [];
  }
}

/**
 * MediaPipe 결과에서 블렌드쉐이프 데이터를 추출합니다
 * @param results - MediaPipe 감지 결과
 * @returns 블렌드쉐이프 배열
 */
export function extractBlendshapes(results: any): any[] {
  if (
    !results.faceBlendshapes ||
    !Array.isArray(results.faceBlendshapes) ||
    results.faceBlendshapes.length === 0
  ) {
    return [];
  }

  const firstFace = results.faceBlendshapes[0];

  if (Array.isArray(firstFace)) {
    return firstFace;
  }

  if (firstFace?.categories) {
    return firstFace.categories;
  }

  return results.faceBlendshapes;
}

/**
 * 블렌드쉐이프를 객체 형태로 표시합니다
 * @param blendshapes - 블렌드쉐이프 객체 배열
 * @returns HTML 문자열
 */
export function displayBlendshapesAsObjects(blendshapes: any[]): string {
  let html = '<strong>Target Blendshapes:</strong><br/>';

  const targetData = blendshapes.filter((bs: any) => {
    const name = bs.categoryName || bs.category || bs.name || '';
    return TARGET_BLENDSHAPES.includes(name);
  });

  if (targetData.length > 0) {
    targetData.forEach((bs: any) => {
      const name = bs.categoryName || bs.category || bs.name;
      const score = bs.score || bs.value || 0;
      html += `<span class="blendshapeValue">${name}:</span> ${score.toFixed(3)}<br/>`;
    });
  } else {
    html += 'No target blendshapes found<br/>';
  }

  return html;
}

/**
 * 블렌드쉐이프를 숫자 배열 형태로 표시합니다
 * @param blendshapes - 블렌드쉐이프 숫자 배열 (MediaPipe 표준 순서)
 * @returns HTML 문자열
 *
 * 참고: MediaPipe의 기본 blendshape 순서를 사용합니다
 * 실제 사용 시에는 displayBlendshapesAsObjects를 사용하는 것이 더 안정적입니다.
 */
export function displayBlendshapesAsNumbers(blendshapes: number[]): string {
  let html = '';
  const targetIndices: Record<string, number> = {
    jawOpen: 20,
    mouthPucker: 41,
    mouthSmileLeft: 47,
    mouthSmileRight: 48,
    mouthFunnel: 35,
  };

  for (let i = 0; i < TARGET_BLENDSHAPES.length; i++) {
    const targetName = TARGET_BLENDSHAPES[i];
    const index = targetIndices[targetName];
    if (index !== undefined && index < blendshapes.length) {
      const score = blendshapes[index];
      html += `<span class="blendshapeValue">${targetName}:</span> ${score.toFixed(3)}<br/>`;
    }
  }

  return html;
}

/**
 * TARGET_BLENDSHAPES만 필터링합니다
 */
export function filterTargetBlendshapes(
  allBlendshapes: Record<string, number>,
): Record<string, number> {
  const filtered: Record<string, number> = {};
  TARGET_BLENDSHAPES.forEach(name => {
    if (allBlendshapes[name] !== undefined) {
      filtered[name] = allBlendshapes[name];
    }
  });
  return filtered;
}

/**
 * 현재 블렌드쉐이프와 목표 블렌드쉐이프의 유사도를 계산합니다
 * @param currentBlendshapes - 현재 프레임의 블렌드쉐이프
 * @param targetBlendshapes - 목표 모음의 블렌드쉐이프
 * @param weights - 블렌드쉐이프별 가중치 (선택, 기본값: BLENDSHAPE_WEIGHTS)
 * @returns 유사도 점수 (0.0 ~ 1.0, 1.0 = 완벽한 일치)
 */
export function calculateBlendshapeSimilarity(
  currentBlendshapes: Record<string, number>,
  targetBlendshapes: Record<string, number>,
  weights: Record<string, number> = BLENDSHAPE_WEIGHTS,
): number {
  let totalWeightedSquaredError = 0;
  let totalWeight = 0;

  for (let i = 0; i < TARGET_BLENDSHAPES.length; i++) {
    const blendshapeName = TARGET_BLENDSHAPES[i];
    const currentValue = currentBlendshapes[blendshapeName] ?? 0;
    const targetValue = targetBlendshapes[blendshapeName] ?? 0;
    const difference = Math.abs(currentValue - targetValue);
    const squaredError = difference * difference;
    const weight = weights[blendshapeName] || 1.0;
    totalWeightedSquaredError += squaredError * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) {
    return 0.0;
  }

  const averageSquaredError = totalWeightedSquaredError / totalWeight;
  const rmse = Math.sqrt(averageSquaredError);

  // Check individual blendshape requirements to catch cases where specific movements are needed
  // This is especially important for compound vowels that might have low overall magnitude
  // but require specific blendshape values
  let individualPenalty = 0;
  const MIN_ACTIVE_THRESHOLD = 0.12; // Minimum value to consider a blendshape "active" (lowered to catch more cases)
  const MAX_INACTIVE_VALUE = 0.06; // Maximum value to consider a blendshape "inactive" (raised slightly)

  for (let i = 0; i < TARGET_BLENDSHAPES.length; i++) {
    const blendshapeName = TARGET_BLENDSHAPES[i];
    const targetValue = targetBlendshapes[blendshapeName] ?? 0;
    const currentValue = currentBlendshapes[blendshapeName] ?? 0;

    // If target requires this blendshape to be active but current is inactive, add penalty
    if (targetValue >= MIN_ACTIVE_THRESHOLD && currentValue <= MAX_INACTIVE_VALUE) {
      // Weight the penalty by how important this blendshape is
      // Increased multiplier from 0.5 to 0.8 for more aggressive penalties
      const weight = BLENDSHAPE_WEIGHTS[blendshapeName] || 1.0;
      individualPenalty += (targetValue - currentValue) * weight * 0.8;
    }
    // If target is inactive but current is active, also add penalty
    else if (targetValue <= MAX_INACTIVE_VALUE && currentValue >= MIN_ACTIVE_THRESHOLD) {
      const weight = BLENDSHAPE_WEIGHTS[blendshapeName] || 1.0;
      individualPenalty += (currentValue - targetValue) * weight * 0.8;
    }
  }

  // Calculate total target magnitude to detect if mouth should be active
  const targetMagnitude = Object.values(targetBlendshapes).reduce(
    (sum, val) => sum + Math.abs(val),
    0,
  );
  const currentMagnitude = Object.values(currentBlendshapes).reduce(
    (sum, val) => sum + Math.abs(val),
    0,
  );

  // Penalty if target requires significant movement but current is inactive (or vice versa)
  // This prevents high similarity when both are near zero
  let magnitudePenalty = 0;
  if (targetMagnitude > 0.25 && currentMagnitude < 0.12) {
    // Target requires movement but current is inactive (lowered thresholds for stricter detection)
    magnitudePenalty = 0.4; // Increased penalty
  } else if (targetMagnitude < 0.12 && currentMagnitude > 0.25) {
    // Target is inactive but current is active
    magnitudePenalty = 0.4; // Increased penalty
  }

  // Combine penalties - individual penalty is more important as it catches specific requirements
  const totalPenalty = Math.max(individualPenalty, magnitudePenalty);

  // Make the error calculation stricter - increased power from 1.5 to 1.8
  const strictError = Math.pow(rmse + totalPenalty, 1.8);
  const similarity = Math.max(0, Math.min(1, 1 - strictError));

  return similarity;
}
