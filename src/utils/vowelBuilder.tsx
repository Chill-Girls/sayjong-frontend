/**
 * vowelBuilder.tsx
 * 모음 형태 생성 로직
 * 보정 데이터와 보간 계수를 이용하여 한국어 모음의 입술 형태 생성
 */

import calibrationData from '../vowel_calibration.json';
import type { Point3D } from './FindPoint';
import { OUTER_LIP_LANDMARKS, INNER_LIP_LANDMARKS } from '../constants/landmarks';

/**
 * 모음 합성을 위한 계수 인터페이스
 */
export interface VowelCoeffs {
  open: number; // ㅏ 방향 기여도 (턱 벌림)
  round: number; // ㅜ 방향 기여도 (입술 둥글게)
  spread: number; // ㅣ 방향 기여도 (입술 펴기)
}

/**
 * 한국어 모음을 위한 경험적 도출 계수
 *
 * 각 모음은 세 가지 기본 동작의 선형 조합으로 표현됩니다:
 *   - open:   턱 벌림 (ㅏ 방향)
 *   - round:  입술 둥글게 (ㅜ 방향)
 *   - spread: 입술 펴기 (ㅣ 방향)
 *
 * 보정 데이터를 직접 사용하는 모음 (보간하지 않음):
 *   ㅏ, ㅜ, ㅣ (기본 모음), ㅑ, ㅠ (y-활음 끝점)
 *
 * 계수는 시각 음성학 및 조음 연구로부터 도출되었습니다.
 */
const VOWEL_COEFFS_MONO: Record<string, VowelCoeffs> = {
  // 보간된 모음들
  ㅓ: { open: 0.75, spread: 0.15, round: 0.5 }, // [ʌ] 중저 후설 비원순
  ㅔ: { open: 0.4, spread: 0.7, round: 0.0 }, // [e̞] 중 전설 비원순
  ㅐ: { open: 0.4, spread: 0.7, round: 0.0 }, // [ɛ] → [e̞] (대부분 화자에서 ㅔ와 병합)
  ㅗ: { open: 0.35, spread: -0.15, round: 0.85 }, // [o] 중고 후설 원순
  ㅛ: { open: 0.35, spread: -0.15, round: 0.85 }, // [jo] 정적 끝점 ≈ ㅗ
  ㅡ: { open: 0.2, spread: 0.8, round: 0.0 }, // [ɯ] 고 후설 비원순
  ㅕ: { open: 0.75, spread: 0.15, round: 0.5 }, // [jʌ] 정적 끝점 ≈ 더 펼쳐진 ㅓ
};

/**
 * 목표 모음의 입술 형태 생성
 * 보정된 기본 모음(ㅏ, ㅜ, ㅣ)을 기반으로 다른 모음 형태를 선형 보간하여 생성
 * @param vowel - 생성할 모음 (예: 'ㅏ', 'ㅜ', 'ㅣ', 'ㅔ' 등)
 * @param customCalibrationData - 선택적으로 제공할 캘리브레이션 데이터 (없으면 기본 import 사용)
 * @returns 각 랜드마크 ID별 3D 좌표 맵
 */
export function buildTargetVowelShape(
  vowel: string,
  customCalibrationData?: any,
): Record<number, Point3D> {
  // 커스텀 데이터가 제공되면 그것을 사용, 아니면 기본 import 사용
  const calibData = customCalibrationData || calibrationData;

  const allLipIds = [...OUTER_LIP_LANDMARKS, ...INNER_LIP_LANDMARKS];

  const targetShape: Record<number, Point3D> = {};
  const isCalibratedVowel =
    vowel === 'ㅏ' || vowel === 'ㅜ' || vowel === 'ㅣ' || vowel === 'ㅑ' || vowel === 'ㅠ';

  allLipIds.forEach(id => {
    if (isCalibratedVowel) {
      // 보정된 데이터 직접 사용
      const calibratedKey =
        vowel === 'ㅏ' || vowel === 'ㅑ' ? 'a' : vowel === 'ㅜ' || vowel === 'ㅠ' ? 'u' : 'i';
      const coords = (calibData[calibratedKey].landmarks as any)[id.toString()];
      targetShape[id] = { x: coords[0], y: coords[1], z: coords[2] };
    } else {
      // 계수를 이용한 보간
      if (!(vowel in VOWEL_COEFFS_MONO)) {
        throw new Error(`Unknown vowel: ${vowel}`);
      }

      const coeffs = VOWEL_COEFFS_MONO[vowel];
      const idStr = id.toString();
      const neutral = (calibData.neutral.landmarks as any)[idStr];
      const a = (calibData.a.landmarks as any)[idStr];
      const u = (calibData.u.landmarks as any)[idStr];
      const i = (calibData.i.landmarks as any)[idStr];

      if (!neutral || !a || !u || !i) {
        console.warn(`Missing calibration data for landmark ${id}`);
        return;
      }

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
