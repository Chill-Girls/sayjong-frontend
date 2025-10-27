/**
 * vowelBuilder.tsx
 * 모음 형태 생성 로직
 * 보정 데이터와 보간 계수를 이용하여 한국어 모음의 입술 형태 생성
 */

import calibrationData from '../vowel_calibration.json';
import { VOWEL_COEFFS_MONO } from './vowelModel_mono';
import type { Point3D } from './FindPoint';
import { OUTER_LIP_LANDMARKS, INNER_LIP_LANDMARKS } from '../constants/landmarks';

/**
 * 목표 모음의 입술 형태 생성
 * 보정된 기본 모음(ㅏ, ㅜ, ㅣ)을 기반으로 다른 모음 형태를 선형 보간하여 생성
 * @param vowel - 생성할 모음 (예: 'ㅏ', 'ㅜ', 'ㅣ', 'ㅔ' 등)
 * @returns 각 랜드마크 ID별 3D 좌표 맵
 */
export function buildTargetVowelShape(vowel: string): Record<number, Point3D> {
  const allLipIds = [...OUTER_LIP_LANDMARKS, ...INNER_LIP_LANDMARKS];

  const targetShape: Record<number, Point3D> = {};
  const isCalibratedVowel =
    vowel === 'ㅏ' || vowel === 'ㅜ' || vowel === 'ㅣ' || vowel === 'ㅑ' || vowel === 'ㅠ';

  allLipIds.forEach(id => {
    if (isCalibratedVowel) {
      // 보정된 데이터 직접 사용
      const calibratedKey =
        vowel === 'ㅏ' || vowel === 'ㅑ' ? 'a' : vowel === 'ㅜ' || vowel === 'ㅠ' ? 'u' : 'i';
      const coords = (calibrationData[calibratedKey].landmarks as any)[id.toString()];
      targetShape[id] = { x: coords[0], y: coords[1], z: coords[2] };
    } else {
      // 계수를 이용한 보간
      if (!(vowel in VOWEL_COEFFS_MONO)) {
        throw new Error(`Unknown vowel: ${vowel}`);
      }

      const coeffs = VOWEL_COEFFS_MONO[vowel];
      const idStr = id.toString();
      const neutral = (calibrationData.neutral.landmarks as any)[idStr];
      const a = (calibrationData.a.landmarks as any)[idStr];
      const u = (calibrationData.u.landmarks as any)[idStr];
      const i = (calibrationData.i.landmarks as any)[idStr];

      // 중립 상태로부터의 변화량 계산
      const deltaA = [a[0] - neutral[0], a[1] - neutral[1], a[2] - neutral[2]];
      const deltaU = [u[0] - neutral[0], u[1] - neutral[1], u[2] - neutral[2]];
      const deltaI = [i[0] - neutral[0], i[1] - neutral[1], i[2] - neutral[2]];

      // 선형 보간을 통한 목표 형태 생성
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
 * 목표 형태에서 입술 중앙점 계산
 * 상입술과 하입술 중앙 랜드마크의 평균값으로 계산
 * @param targetShape - 목표 모음 형태
 * @returns 입술 중앙점 좌표
 */
export function getMouthCenterFromShape(targetShape: Record<number, Point3D>): Point3D {
  const upperLip = targetShape[13]; // 상입술 중앙
  const lowerLip = targetShape[14]; // 하입술 중앙
  return {
    x: (upperLip.x + lowerLip.x) / 2,
    y: (upperLip.y + lowerLip.y) / 2,
    z: ((upperLip.z || 0) + (lowerLip.z || 0)) / 2,
  };
}
