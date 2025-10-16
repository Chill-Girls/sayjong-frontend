import type { Point3D } from './FindPoint';
import { calculateRelativePosition, restoreFromRelativePosition } from './FindPoint';

// x,y,z 축을 만들어 회전을 하더라도 자연스럽게 함.

export interface PersonalCoordinateSystem {
  origin: Point3D; // 기준점 (코끝)
  xAxis: Point3D; // 오른쪽 방향 (왼쪽 눈 → 오른쪽 눈)
  yAxis: Point3D; // 위쪽 방향 (코 → 이마)
  zAxis: Point3D; // 앞쪽 방향 (얼굴 전면)
  eyeDistance: number; // 기준 눈 사이 거리
  noseToEyeDistance: number; // 기준 코-눈 거리
}

export interface DynamicCoordinateSystem {
  origin: Point3D;
  xAxis: Point3D;
  yAxis: Point3D;
  zAxis: Point3D;
  eyeDistance: number;
  noseToEyeDistance: number;
}

// 입술 중앙점 -> 상대좌표 복원으로 실시간으로 찾기, Anchor 기준점이 될것임.

/**
 *
 * @param landmarks - 얼굴 랜드마크
 * @param nosePoint - 코끝점 (기준점 A)
 * @param eyePoint - 눈 위 점 (기준점 B)
 * @returns 입술 중앙점
 */
export function findMouthCenterWithAnchor(landmarks: Point3D[]): Point3D {
  // 입술 중앙점 계산 (상하 입술이 만나는 지점)
  const upperLipCenter = landmarks[13]; // 상입술 중앙
  const lowerLipCenter = landmarks[14]; // 하입술 중앙
  const mouthCenter = {
    x: (upperLipCenter.x + lowerLipCenter.x) / 2,
    y: (upperLipCenter.y + lowerLipCenter.y) / 2,
    z: ((upperLipCenter.z || 0) + (lowerLipCenter.z || 0)) / 2,
  };

  return mouthCenter;
}

/**
 *
 * @param mouthCenter - 입술 중앙점
 * @param nosePoint - 코끝점 (기준점 A)
 * @param eyePoint - 눈 위 점 (기준점 B)
 * @returns 상대 위치 정보
 */
export function calculateMouthCenterRelativePosition(
  mouthCenter: Point3D,
  nosePoint: Point3D,
  eyePoint: Point3D,
) {
  return calculateRelativePosition(mouthCenter, nosePoint, eyePoint);
}

/**
 *
 * @param relativePosition - 상대 위치 정보
 * @param nosePoint - 현재 코끝점 (기준점 A)
 * @param eyePoint - 현재 눈 위 점 (기준점 B)
 * @returns 복원된 입술 중앙점
 */
export function restoreMouthCenterFromRelativePosition(
  relativePosition: any,
  nosePoint: Point3D,
  eyePoint: Point3D,
): Point3D {
  return restoreFromRelativePosition(relativePosition, nosePoint, eyePoint);
}

/**
 * 사용자의 정면 얼굴을 기준
 * Anchor.tsx 방식을 사용하여 입술 중앙점을 찾고, 이를 기준으로 좌표계(x,y,z 축) 생성
 * @param landmarks - 정면 얼굴 랜드마크
 * @returns
 */
export function createPersonalCoordinateSystem(landmarks: Point3D[]): PersonalCoordinateSystem {
  const nose = landmarks[1]; // 코끝점
  const leftEye = landmarks[133]; // 왼쪽 눈
  const rightEye = landmarks[362]; // 오른쪽 눈
  const forehead = landmarks[10]; // 이마 중앙점

  // Anchor.tsx 방식으로 입술 중앙점 찾기
  const mouthCenter = findMouthCenterWithAnchor(landmarks);

  // 원점 = 입술 중앙
  const origin = mouthCenter;

  // 1단계: X축 정의 (오른쪽눈 - 왼쪽눈)  -> 각 축들은 수직이 되야 정확한 좌표계 만들기 가능
  const xAxis = normalize(sub(rightEye, leftEye));
  // 2단계: Z축 정의 (X축과 코→이마 벡터의 외적)
  const noseToForehead = sub(forehead, nose);
  const zAxis = normalize(cross(xAxis, noseToForehead));
  // 3단계: Y축 정의 (Z축과 X축의 외적)
  const yAxis = normalize(cross(zAxis, xAxis));
  // 기준 거리들 계산
  const eyeDistance = len(sub(rightEye, leftEye));
  const mouthToEyeDistance = len(sub(leftEye, mouthCenter));

  return {
    origin,
    xAxis,
    yAxis,
    zAxis,
    eyeDistance,
    noseToEyeDistance: mouthToEyeDistance,
  };
}

/**
 * 실시간 얼굴 랜드마크
 * Anchor.tsx 방식을 사용하여 입술 중앙점을 찾고, 이를 기준으로 좌표계를 생성
 * @param landmarks - 현재 얼굴 랜드마크
 * @returns 동적 좌표계
 */
export function createDynamicCoordinateSystem(landmarks: Point3D[]): DynamicCoordinateSystem {
  const nose = landmarks[1]; // 코끝점
  const leftEye = landmarks[133]; // 왼쪽 눈
  const rightEye = landmarks[362]; // 오른쪽 눈
  const forehead = landmarks[10]; // 이마 중앙점

  // Anchor.tsx 방식으로 입술 중앙점 찾기
  const mouthCenter = findMouthCenterWithAnchor(landmarks);

  // 원점 = 입술 중앙
  const origin = mouthCenter;

  // 1단계: X축 정의 (오른쪽눈 - 왼쪽눈) - 수직 보장의 기준
  const xAxis = normalize(sub(rightEye, leftEye));

  // 2단계: Z축 정의 (X축과 코→이마 벡터의 외적) - X축에 100% 수직 보장
  const noseToForehead = sub(forehead, nose);
  const zAxis = normalize(cross(xAxis, noseToForehead));

  // 3단계: Y축 정의 (Z축과 X축의 외적) - Z축과 X축에 100% 수직 보장
  const yAxis = normalize(cross(zAxis, xAxis));

  // 현재 거리들 계산
  const eyeDistance = len(sub(rightEye, leftEye));
  const mouthToEyeDistance = len(sub(leftEye, mouthCenter));

  return {
    origin,
    xAxis,
    yAxis,
    zAxis,
    eyeDistance,
    noseToEyeDistance: mouthToEyeDistance,
  };
}

export interface RotationAngles {
  yaw: number; // 좌우 회전 (Y축)
  pitch: number; // 상하 회전 (X축)
  roll: number; // 좌우 기울기 (Z축)
}

/**
 * 기준 좌표계와 동적 좌표계를 비교하여 회전 각도를 계산
 * @param personal - 개인화된 기준 좌표계
 * @param dynamic - 동적 좌표계
 * @returns 회전 각도들
 */
export function calculateRotationAngles(
  personal: PersonalCoordinateSystem,
  dynamic: DynamicCoordinateSystem,
): RotationAngles {
  // 1. Yaw (좌우 회전) - X축 벡터 비교
  const yawAngle = calculateAngleBetweenVectors(personal.xAxis, dynamic.xAxis);

  // 2. Pitch (상하 회전) - Y축 벡터 비교
  const pitchAngle = calculateAngleBetweenVectors(personal.yAxis, dynamic.yAxis);

  // 3. Roll (좌우 기울기) - Z축 벡터 비교
  const rollAngle = calculateAngleBetweenVectors(personal.zAxis, dynamic.zAxis);

  return {
    yaw: yawAngle,
    pitch: pitchAngle,
    roll: rollAngle,
  };
}

/**
 * 두 벡터 사이의 각도를 계산.
 * @param v1 - 첫 번째 벡터
 * @param v2 - 두 번째 벡터
 * @returns 각도 (도 단위)
 */
function calculateAngleBetweenVectors(v1: Point3D, v2: Point3D): number {
  const dotProduct = dot(v1, v2);
  const magnitude1 = len(v1);
  const magnitude2 = len(v2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  const cosAngle = dotProduct / (magnitude1 * magnitude2);
  const clampedCos = Math.max(-1, Math.min(1, cosAngle)); // -1 ~ 1 범위로 제한(정규화)
  const angleRad = Math.acos(clampedCos);
  const angleDeg = (angleRad * 180) / Math.PI;

  return angleDeg;
}

/**
 * 눈 사이 거리와 코-눈 거리를 이용한 회전 각도 계산 -> 필요할 때만 씀 -> 그냥 벡터 기반 계산으로 대체
 * @param personal - 개인화된 기준 좌표계
 * @param dynamic - 동적 좌표계
 * @returns 거리 기반 회전 각도
 */
export function calculateRotationAnglesFromDistance(
  personal: PersonalCoordinateSystem,
  dynamic: DynamicCoordinateSystem,
): RotationAngles {
  // 1. Yaw (좌우 회전) - 눈 사이 거리 변화
  const eyeDistanceRatio = dynamic.eyeDistance / personal.eyeDistance;
  const yawAngle = (Math.acos(Math.min(eyeDistanceRatio, 1)) * 180) / Math.PI;

  // 2. Pitch (상하 회전) - 코-눈 거리 변화
  const noseToEyeRatio = dynamic.noseToEyeDistance / personal.noseToEyeDistance;
  const pitchAngle = (Math.acos(Math.min(noseToEyeRatio, 1)) * 180) / Math.PI;

  // 3. Roll (좌우 기울기) - 벡터 기반 계산
  const rollAngle = calculateAngleBetweenVectors(personal.zAxis, dynamic.zAxis);

  return {
    yaw: yawAngle,
    pitch: pitchAngle,
    roll: rollAngle,
  };
}

/**
 * 벡터 기반과 거리 기반 방법을 결합
 * @param personal - 개인화된 기준 좌표계
 * @param dynamic - 동적 좌표계
 * @returns 하이브리드 회전 각도
 */
export function calculateHybridRotationAngles(
  personal: PersonalCoordinateSystem,
  dynamic: DynamicCoordinateSystem,
): RotationAngles {
  // 벡터 기반 각도
  const vectorAngles = calculateRotationAngles(personal, dynamic);

  // 거리 기반 각도
  const distanceAngles = calculateRotationAnglesFromDistance(personal, dynamic);

  // 하이브리드 계산 (가중 평균)
  return {
    yaw: vectorAngles.yaw * 0.6 + distanceAngles.yaw * 0.4,
    pitch: vectorAngles.pitch * 0.6 + distanceAngles.pitch * 0.4,
    roll: vectorAngles.roll * 0.8 + distanceAngles.roll * 0.2,
  };
}

/**
 * 회전 각도로부터 입술의 깊이를 추정
 * @param rotationAngles - 회전 각도들
 * @param baseDepth - 기본 깊이
 * @returns 추정
 */
export function estimateDepthFromRotation(
  rotationAngles: RotationAngles,
  baseDepth: number = 0.1,
): number {
  const yawRad = (rotationAngles.yaw * Math.PI) / 180;
  const pitchRad = (rotationAngles.pitch * Math.PI) / 180;

  // Yaw와 Pitch를 고려한 깊이 추정
  const yawDepth = baseDepth * Math.sin(Math.abs(yawRad));
  const pitchDepth = baseDepth * Math.sin(Math.abs(pitchRad));

  // 두 깊이의 합성
  const totalDepth = Math.sqrt(yawDepth * yawDepth + pitchDepth * pitchDepth);

  return totalDepth;
}

//눈사이 거리에 반비례하는 스케일링
export function calculateDistanceScale(
  personal: PersonalCoordinateSystem,
  dynamic: DynamicCoordinateSystem,
): number {
  return dynamic.eyeDistance / personal.eyeDistance;
}
export function applyDistanceScale(
  point: Point3D,
  scale: number,
): { x: number; y: number; z: number } {
  return {
    x: point.x * scale,
    y: point.y * scale,
    z: (point.z || 0) * scale,
  };
}

// === 8. 좌표계 검증 함수 ===

/**
 * 좌표계의 수직성을 검증합니다.
 * @param coordinateSystem - 검증할 좌표계
 * @returns 수직성 검증 결과
 */
export function validateCoordinateSystem(
  coordinateSystem: PersonalCoordinateSystem | DynamicCoordinateSystem,
): {
  isValid: boolean;
  xDotY: number;
  xDotZ: number;
  yDotZ: number;
  errors: string[];
} {
  const { xAxis, yAxis, zAxis } = coordinateSystem;

  // 각 축 간의 내적 계산 (수직이면 0이어야 함)
  const xDotY = Math.abs(dot(xAxis, yAxis));
  const xDotZ = Math.abs(dot(xAxis, zAxis));
  const yDotZ = Math.abs(dot(yAxis, zAxis));

  const tolerance = 0.01; // 허용 오차
  const errors: string[] = [];

  if (xDotY > tolerance) {
    errors.push(`X축과 Y축이 수직이 아님: ${xDotY.toFixed(4)}`);
  }
  if (xDotZ > tolerance) {
    errors.push(`X축과 Z축이 수직이 아님: ${xDotZ.toFixed(4)}`);
  }
  if (yDotZ > tolerance) {
    errors.push(`Y축과 Z축이 수직이 아님: ${yDotZ.toFixed(4)}`);
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    xDotY,
    xDotZ,
    yDotZ,
    errors,
  };
}

/**
 * 좌표계의 정규화를 검증합니다.
 * @param coordinateSystem - 검증할 좌표계
 * @returns 정규화 검증 결과
 */
export function validateNormalization(
  coordinateSystem: PersonalCoordinateSystem | DynamicCoordinateSystem,
): {
  isValid: boolean;
  xLength: number;
  yLength: number;
  zLength: number;
  errors: string[];
} {
  const { xAxis, yAxis, zAxis } = coordinateSystem;

  const xLength = len(xAxis);
  const yLength = len(yAxis);
  const zLength = len(zAxis);

  const tolerance = 0.01; // 허용 오차
  const errors: string[] = [];

  if (Math.abs(xLength - 1) > tolerance) {
    errors.push(`X축이 정규화되지 않음: ${xLength.toFixed(4)}`);
  }
  if (Math.abs(yLength - 1) > tolerance) {
    errors.push(`Y축이 정규화되지 않음: ${yLength.toFixed(4)}`);
  }
  if (Math.abs(zLength - 1) > tolerance) {
    errors.push(`Z축이 정규화되지 않음: ${zLength.toFixed(4)}`);
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    xLength,
    yLength,
    zLength,
    errors,
  };
}

// === 9. 유틸리티 함수들 ===

function sub(a: Point3D, b: Point3D): Point3D {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: (a.z || 0) - (b.z || 0),
  };
}

function dot(a: Point3D, b: Point3D): number {
  return a.x * b.x + a.y * b.y + (a.z || 0) * (b.z || 0);
}

function len(v: Point3D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + (v.z || 0) * (v.z || 0));
}

function normalize(v: Point3D): Point3D {
  const length = len(v);
  if (length === 0) return { x: 0, y: 0, z: 0 };
  return {
    x: v.x / length,
    y: v.y / length,
    z: (v.z || 0) / length,
  };
}

function cross(a: Point3D, b: Point3D): Point3D {
  return {
    x: (a.y || 0) * (b.z || 0) - (a.z || 0) * (b.y || 0),
    y: (a.z || 0) * (b.x || 0) - (a.x || 0) * (b.z || 0),
    z: (a.x || 0) * (b.y || 0) - (a.y || 0) * (b.x || 0),
  };
}
