/**
 * vowelShapeBuilder.ts
 * 모음 shape 생성 로직
 */

import calibrationData from '../vowel_calibration.json';
import { VOWEL_COEFFS_MONO } from './vowelModel_mono';
import type { Point3D } from './FindPoint';

/**
 * 모음에 해당하는 입술 형태를 생성
 * @param vowel - 생성할 모음 (예: 'ㅏ', 'ㅜ', 'ㅣ', 'ㅔ' 등)
 * @returns 각 랜드마크 ID별 3D 좌표 맵
 */
export function buildTargetVowelShape(vowel: string): Record<number, Point3D> {
  const outerLipIds = [
    61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146,
  ];
  const innerLipIds = [
    78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95,
  ];
  const allLipIds = [...outerLipIds, ...innerLipIds];

  const targetShape: Record<number, Point3D> = {};
  const isCalibratedVowel = vowel === 'ㅏ' || vowel === 'ㅜ' || vowel === 'ㅣ';

  allLipIds.forEach(id => {
    if (isCalibratedVowel) {
      // Use calibrated data directly
      const calibratedKey = vowel === 'ㅏ' ? 'a' : vowel === 'ㅜ' ? 'u' : 'i';
      const coords = (calibrationData[calibratedKey].landmarks as any)[id.toString()];
      targetShape[id] = { x: coords[0], y: coords[1], z: coords[2] };
    } else {
      // Use coefficients to interpolate
      if (!(vowel in VOWEL_COEFFS_MONO)) {
        throw new Error(`Unknown vowel: ${vowel}`);
      }

      const coeffs = VOWEL_COEFFS_MONO[vowel];
      const idStr = id.toString();
      const neutral = (calibrationData.neutral.landmarks as any)[idStr];
      const a = (calibrationData.a.landmarks as any)[idStr];
      const u = (calibrationData.u.landmarks as any)[idStr];
      const i = (calibrationData.i.landmarks as any)[idStr];

      // Compute deltas from neutral
      const deltaA = [a[0] - neutral[0], a[1] - neutral[1], a[2] - neutral[2]];
      const deltaU = [u[0] - neutral[0], u[1] - neutral[1], u[2] - neutral[2]];
      const deltaI = [i[0] - neutral[0], i[1] - neutral[1], i[2] - neutral[2]];

      // Interpolate to get target shape
      targetShape[id] = {
        x:
          neutral[0] +
          coeffs.open * deltaA[0] +
          coeffs.round * deltaU[0] +
          coeffs.spread * deltaI[0],
        y:
          neutral[1] +
          coeffs.open * deltaA[1] +
          coeffs.round * deltaU[1] +
          coeffs.spread * deltaI[1],
        z:
          neutral[2] +
          coeffs.open * deltaA[2] +
          coeffs.round * deltaU[2] +
          coeffs.spread * deltaI[2],
      };
    }
  });

  return targetShape;
}

/**
 * target shape에서 입술 중앙점을 계산합니다.
 * @param targetShape - 타겟 모음 shape
 * @returns 입술 중앙점
 */
export function getMouthCenterFromShape(targetShape: Record<number, Point3D>): Point3D {
  const upperLip = targetShape[13];
  const lowerLip = targetShape[14];
  return {
    x: (upperLip.x + lowerLip.x) / 2,
    y: (upperLip.y + lowerLip.y) / 2,
    z: ((upperLip.z || 0) + (lowerLip.z || 0)) / 2,
  };
}
