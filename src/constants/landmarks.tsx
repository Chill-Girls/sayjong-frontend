/**
 * MediaPipe 얼굴 랜드마크 상수 및 타입 정의
 *
 * 이 파일은 얼굴 추적 및 입 오버레이에 사용되는 모든 랜드마크 인덱스를 포함합니다.
 * MediaPipe의 478개 포인트 얼굴 메시 모델을 기반으로 합니다.
 */

/**
 * 3D 랜드마크 포인트
 * MediaPipe에서 반환하는 얼굴 랜드마크의 정규화된 좌표
 */
export interface LandmarkPoint {
  x: number; // 정규화된 X 좌표 (0~1)
  y: number; // 정규화된 Y 좌표 (0~1)
  z: number; // 깊이 (상대적 거리)
}

/**
 * 머리 자세 추정을 위한 얼굴 앵커 포인트
 * - 1: 코끝
 * - 10: 이마 중앙점
 * - 133: 왼쪽 눈 안쪽 모서리
 * - 362: 오른쪽 눈 안쪽 모서리
 */
export const FACE_ANCHORS = [1, 10, 133, 362];

/**
 * 외부 입술 윤곽 랜드마크 (20개 포인트)
 * 입의 외부 경계를 형성
 */
export const OUTER_LIP_LANDMARKS = [
  61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146,
];

/**
 * 내부 입술 윤곽 랜드마크 (20개 포인트)
 * 입의 내부 경계 형성 (치아 라인)
 */
export const INNER_LIP_LANDMARKS = [
  78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95,
];

/**
 * 전체 입 랜드마크 (총 40개 포인트)
 * 외부 및 내부 입술 랜드마크 결합
 */
export const MOUTH_LANDMARKS = [...OUTER_LIP_LANDMARKS, ...INNER_LIP_LANDMARKS];

/**
 * 전체 추적 랜드마크 (총 44개 포인트)
 * 얼굴 앵커(4개)와 입 랜드마크(40개) 결합
 */
export const ALL_TRACKED_LANDMARKS = [...FACE_ANCHORS, ...MOUTH_LANDMARKS];
