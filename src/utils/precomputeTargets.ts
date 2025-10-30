/**
 * precomputeTargets.ts
 * 캘리브레이션 데이터로부터 모든 모음의 목표 좌표를 미리 계산
 *
 * 실시간 계산 대신 캘리브레이션 시점에 한 번만 계산하여
 * 성능 향상 및 백엔드 저장을 위한 데이터 생성
 */

import { buildTargetVowelShape } from './vowelBuilder';
import axios from 'axios';

/**
 * 미리 계산된 목표 좌표 데이터 구조
 */
export interface PrecomputedTargets {
  // 메타데이터
  calibratedAt: string; // ISO 8601 타임스탬프
  version: string; // 데이터 포맷 버전

  // 각 모음별 목표 랜드마크 좌표
  vowels: {
    [vowel: string]: {
      landmarks: {
        [landmarkId: string]: { x: number; y: number; z: number };
      };
      blendshapes?: { [key: string]: number }; // 선택적: 블렌드쉐이프도 저장 가능
    };
  };
}

/**
 * 캘리브레이션 데이터로부터 모든 모음의 목표 좌표를 미리 계산
 * @param calibrationData - 캘리브레이션 데이터 (neutral, a, u, i)
 * @returns 미리 계산된 모든 모음의 목표 좌표
 */
export function precomputeAllTargetVowels(calibrationData: any): PrecomputedTargets {
  console.log('목표 좌표 사전 계산 시작...');
  console.log('캘리브레이션 데이터 구조:', Object.keys(calibrationData));

  // 필수 데이터 검증
  if (!calibrationData.neutral || !calibrationData.a || !calibrationData.u || !calibrationData.i) {
    throw new Error('캘리브레이션 데이터가 불완전합니다. neutral, a, u, i가 모두 필요합니다.');
  }

  // 모든 한국어 모음 리스트 (단모음 + 이중모음)
  const allVowels = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ'];

  // 각 모음에 대한 목표 좌표 계산
  const vowelTargets: PrecomputedTargets['vowels'] = {};

  allVowels.forEach(vowel => {
    try {
      // buildTargetVowelShape는 캘리브레이션 데이터를 기반으로 목표 형태 생성
      const targetShape = buildTargetVowelShape(vowel, calibrationData);

      // Point3D를 확정된 z값을 가진 객체로 변환
      const landmarks: { [landmarkId: string]: { x: number; y: number; z: number } } = {};
      Object.entries(targetShape).forEach(([id, point]) => {
        landmarks[id] = {
          x: point.x,
          y: point.y,
          z: point.z ?? 0, // z가 undefined면 0으로
        };
      });

      vowelTargets[vowel] = {
        landmarks,
        blendshapes: calibrationData[vowel]?.blendshapes || {}, // 있으면 포함
      };

      console.log(`${vowel} 목표 좌표 계산 완료 (${Object.keys(targetShape).length}개 랜드마크)`);
    } catch (error) {
      console.error(`${vowel} 계산 실패:`, error);
      // 실패한 경우 빈 객체로 설정
      vowelTargets[vowel] = { landmarks: {} };
    }
  });

  // 최종 데이터 구조 생성
  const precomputedData: PrecomputedTargets = {
    calibratedAt: new Date().toISOString(),
    version: '1.0.0',
    vowels: vowelTargets,
  };

  console.log('모든 모음 좌표 사전 계산 완료!');
  console.log(`  - 총 ${allVowels.length}개 모음 처리`);

  return precomputedData;
}

/**
 * 미리 계산된 데이터를 JSON 파일로 다운로드
 * @param precomputedData - 미리 계산된 목표 좌표 데이터
 * @param filename - 저장할 파일명 (기본값: 'target_vowels.json')
 */
/*export function downloadPrecomputedTargets(
  precomputedData: PrecomputedTargets,
  filename: string = 'target_vowels.json',
) {
  const json = JSON.stringify(precomputedData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  console.log(`${filename} 다운로드 완료`);*/

// CalibrationCapture.tsx에 있던 타입을 가져옴
interface CapturedFrame {
  landmarks: Record<string, [number, number, number]>;
  blendshapes: Record<string, number>;
}
interface CalibrationData {
  neutral?: CapturedFrame;
  a?: CapturedFrame;
  u?: CapturedFrame;
  i?: CapturedFrame;
}

/**
 * 미리 계산된 데이터와 원본 데이터를 백엔드 서버에 저장
 * @param precomputedData - 정답 좌표 (ㅏ, ㅑ, ㅓ...)
 * @param rawData - calibration 캡처 데이터 (neutral, a, u, i)
 * @param authToken - 사용자 인증 JWT 토큰
 */
export async function saveTargetsToBackend(
  precomputedData: PrecomputedTargets,
  rawData: CalibrationData,
  authToken: string,
): Promise<void> {
  const API_ENDPOINT = '/api/calibration/targets'; // 백엔드 api 호출

  console.log('백엔드로 캘리브레이션 데이터(최종+원본) 전송 시작...');

  const payload = {
    precomputedData: precomputedData,
    rawData: rawData,
  };

  return axios.post(API_ENDPOINT, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });
}
