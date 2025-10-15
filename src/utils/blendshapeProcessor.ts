/**
 * blendshapeProcessor.ts
 * Blendshape 데이터 처리 및 표시 로직
 * Blendshape -> 입술 어느정도 열리고 닫히는지 등의 정보
 */

export const BLENDSHAPE_NAMES = [
  'neutral',
  'browDownLeft',
  'browDownRight',
  'browInnerUp',
  'browOuterUpLeft',
  'browOuterUpRight',
  'eyeLookDownLeft',
  'eyeLookDownRight',
  'eyeLookInLeft',
  'eyeLookInRight',
  'eyeLookOutLeft',
  'eyeLookOutRight',
  'eyeLookUpLeft',
  'eyeLookUpRight',
  'eyeSquintLeft',
  'eyeSquintRight',
  'eyeWideLeft',
  'eyeWideRight',
  'jawForward',
  'jawLeft',
  'jawOpen',
  'jawRight',
  'mouthClose',
  'mouthDimpleLeft',
  'mouthDimpleRight',
  'mouthFrownLeft',
  'mouthFrownRight',
  'mouthFunnel',
  'mouthLeft',
  'mouthLowerDownLeft',
  'mouthLowerDownRight',
  'mouthPressLeft',
  'mouthPressRight',
  'mouthPucker',
  'mouthRight',
  'mouthRollLower',
  'mouthRollUpper',
  'mouthShrugLower',
  'mouthShrugUpper',
  'mouthSmileLeft',
  'mouthSmileRight',
  'mouthStretchLeft',
  'mouthStretchRight',
  'mouthUpperUpLeft',
  'mouthUpperUpRight',
  'noseSneerLeft',
  'noseSneerRight',
];

// Target blendshapes for pronunciation training
export const TARGET_BLENDSHAPES = [
  'jawOpen',
  'mouthPucker',
  'mouthSmileLeft',
  'mouthSmileRight',
  'mouthFunnel',
];
export const ADDITIONAL_BLENDSHAPES = [
  'mouthClose',
  'mouthStretchLeft',
  'mouthStretchRight',
  'browInnerUp',
];

/**
 * Blendshape 평활화를 위한 클래스
 */
export class BlendshapeSmoother {
  private history: number[][] = [];
  private smoothingFactor: number;

  constructor(smoothingFactor: number = 0.7) {
    this.smoothingFactor = smoothingFactor;
  }

  /**
   * Blendshape 데이터를 평활화합니다.
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
   * 히스토리를 초기화합니다.
   */
  reset() {
    this.history = [];
  }
}

/**
 * MediaPipe 결과에서 blendshape 데이터를 추출합니다.
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
 * Blendshape를 객체 형태로 표시합니다.
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

  html += '<br/><strong>Additional Pronunciation Blendshapes:</strong><br/>';
  const additionalData = blendshapes.filter((bs: any) => {
    const name = bs.categoryName || bs.category || bs.name || '';
    return ADDITIONAL_BLENDSHAPES.includes(name);
  });

  if (additionalData.length > 0) {
    additionalData.forEach((bs: any) => {
      const name = bs.categoryName || bs.category || bs.name;
      const score = bs.score || bs.value || 0;
      html += `<span class="blendshapeValue">${name}:</span> ${score.toFixed(3)}<br/>`;
    });
  }

  return html;
}

/**
 * Blendshape를 숫자 배열 형태로 표시합니다.
 */
export function displayBlendshapesAsNumbers(blendshapes: number[]): string {
  let html = '';

  TARGET_BLENDSHAPES.forEach(targetName => {
    const index = BLENDSHAPE_NAMES.indexOf(targetName);
    if (index !== -1 && index < blendshapes.length) {
      const score = blendshapes[index];
      html += `<span class="blendshapeValue">${targetName}:</span> ${score.toFixed(3)}<br/>`;
    }
  });

  html += '<br/><strong>Additional Pronunciation Blendshapes:</strong><br/>';
  ADDITIONAL_BLENDSHAPES.forEach(targetName => {
    const index = BLENDSHAPE_NAMES.indexOf(targetName);
    if (index !== -1 && index < blendshapes.length) {
      const score = blendshapes[index];
      html += `<span class="blendshapeValue">${targetName}:</span> ${score.toFixed(3)}<br/>`;
    }
  });

  return html;
}
