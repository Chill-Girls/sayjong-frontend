/**
 * vowelModel_mono.ts
 *
 * 한국어 단모음 모델 - 보간 계수 정의
 *
 * 이 모듈은 한국어 모음의 보간 계수를 제공합니다.
 * 이 계수들은 vowelBuilder.tsx에서 기본 모음(ㅏ, ㅜ, ㅣ) 간의
 * 선형 보간을 통해 입 모양을 생성하는 데 사용됩니다.
 *
 * 기본 벡터 (보정 데이터에서 유래):
 *   open   - ㅏ 동작 (턱 벌림)
 *   round  - ㅜ 동작 (입술 둥글게)
 *   spread - ㅣ 동작 (입술 펴기)
 *
 * 사용법:
 *   import { VOWEL_COEFFS_MONO } from './vowelModel_mono';
 *
 *   const coeffs = VOWEL_COEFFS_MONO['ㅔ'];
 *   // 반환값: { open: 0.4, spread: 0.7, round: 0.0 }
 */

/**
 * 모음 합성을 위한 계수 인터페이스
 */
export interface Coeffs {
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
export const VOWEL_COEFFS_MONO: Record<string, Coeffs> = {
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
 * 이 모듈은 다음을 내보냅니다:
 * - VOWEL_COEFFS_MONO: 모음 보간을 위한 계수 정의
 * - Coeffs: 계수 구조를 위한 TypeScript 인터페이스
 *
 * 이 계수들은 vowelBuilder.tsx에서 보정 데이터의 기본 모음(ㅏ, ㅜ, ㅣ)을
 * 선형 보간하여 입 모양을 생성하는 데 사용됩니다.
 */
