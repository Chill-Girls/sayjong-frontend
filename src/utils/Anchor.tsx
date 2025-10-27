import type { Point3D } from './FindPoint';
import { calculateRelativePosition, restoreFromRelativePosition } from './FindPoint';
import { sub, dot, len, normalize, cross } from './vector3d';

/**
 * 개인화된 좌표계 인터페이스
 * x, y, z 축을 만들어 회전에도 자연스럽게 대응
 */
export interface PersonalCoordinateSystem {
  origin: Point3D; // 원점 (입술 중앙)
  xAxis: Point3D; // X축 방향 (왼쪽 눈 → 오른쪽 눈)
  yAxis: Point3D; // Y축 방향 (아래 → 위)
  zAxis: Point3D; // Z축 방향 (얼굴 전면)
  eyeDistance: number; // 기준 눈 사이 거리
  noseToEyeDistance: number; // 기준 입술-눈 거리
}

/**
 * 동적 좌표계 인터페이스
 * 실시간으로 업데이트되는 좌표계
 */
export interface DynamicCoordinateSystem {
  origin: Point3D;
  xAxis: Point3D;
  yAxis: Point3D;
  zAxis: Point3D;
  eyeDistance: number;
  noseToEyeDistance: number;
}

/**
 * 앵커 기반 입술 중앙점 찾기
 * @param landmarks - 얼굴 랜드마크 배열
 * @returns 입술 중앙점 좌표
 */
export function findMouthCenterWithAnchor(landmarks: Point3D[]): Point3D {
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
 * 입술 중앙점의 상대 위치 계산
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
 * 상대 위치로부터 입술 중앙점 복원
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
 * 개인화된 좌표계 생성 (정면 얼굴 기준)
 * 입술 중앙점을 원점으로 하는 직교 좌표계 생성
 * @param landmarks - 정면 얼굴 랜드마크
 * @returns 개인화된 좌표계
 */
export function createPersonalCoordinateSystem(landmarks: Point3D[]): PersonalCoordinateSystem {
  const nose = landmarks[1]; // 코끝점
  const leftEye = landmarks[133]; // 왼쪽 눈
  const rightEye = landmarks[362]; // 오른쪽 눈
  const forehead = landmarks[10]; // 이마 중앙점

  // 입술 중앙점 찾기
  const mouthCenter = findMouthCenterWithAnchor(landmarks);

  // 원점 = 입술 중앙
  const origin = mouthCenter;

  // X축 정의 (오른쪽 눈 - 왼쪽 눈) - 각 축은 서로 수직이어야 정확한 좌표계 생성 가능
  const xAxis = normalize(sub(rightEye, leftEye));

  // Z축 정의 (X축과 코→이마 벡터의 외적) - X축에 수직
  const noseToForehead = sub(forehead, nose);
  const zAxis = normalize(cross(xAxis, noseToForehead));

  // Y축 정의 (Z축과 X축의 외적) - X축과 Z축에 모두 수직
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
 * 동적 좌표계 생성 (실시간 얼굴 랜드마크 기준)
 * 현재 프레임의 얼굴 위치와 회전에 맞는 좌표계 생성
 * @param landmarks - 현재 얼굴 랜드마크
 * @returns 동적 좌표계
 */
export function createDynamicCoordinateSystem(landmarks: Point3D[]): DynamicCoordinateSystem {
  const nose = landmarks[1]; // 코끝점
  const leftEye = landmarks[133]; // 왼쪽 눈
  const rightEye = landmarks[362]; // 오른쪽 눈
  const forehead = landmarks[10]; // 이마 중앙점

  // 입술 중앙점 찾기
  const mouthCenter = findMouthCenterWithAnchor(landmarks);

  // 원점 = 입술 중앙
  const origin = mouthCenter;

  // X축 정의 (오른쪽 눈 - 왼쪽 눈)
  const xAxis = normalize(sub(rightEye, leftEye));

  // Z축 정의 (X축과 코→이마 벡터의 외적) - X축에 수직 보장
  const noseToForehead = sub(forehead, nose);
  const zAxis = normalize(cross(xAxis, noseToForehead));

  // Y축 정의 (Z축과 X축의 외적) - X축과 Z축에 수직 보장
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

/**
 * 회전 각도 인터페이스
 */
export interface RotationAngles {
  yaw: number; // 요 (좌우 회전, Y축 기준)
  pitch: number; // 피치 (상하 회전, X축 기준)
  roll: number; // 롤 (좌우 기울기, Z축 기준)
}

/**
 * 회전 각도 계산 (벡터 기반)
 * 기준 좌표계와 동적 좌표계의 축 벡터를 비교하여 회전 각도 계산
 * @param personal - 개인화된 기준 좌표계
 * @param dynamic - 동적 좌표계
 * @returns 회전 각도 (도 단위)
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
 * 두 벡터 사이의 각도 계산
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
  const clampedCos = Math.max(-1, Math.min(1, cosAngle)); // -1 ~ 1 범위로 제한
  const angleRad = Math.acos(clampedCos);
  const angleDeg = (angleRad * 180) / Math.PI;

  return angleDeg;
}

/**
 * 거리 기반 회전 각도 계산
 * 눈 사이 거리와 입술-눈 거리의 변화를 이용한 각도 추정
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
 * 하이브리드 회전 각도 계산
 * 벡터 기반과 거리 기반 방법을 가중 평균으로 결합
 * @param personal - 개인화된 기준 좌표계
 * @param dynamic - 동적 좌표계
 * @returns 하이브리드 회전 각도
 */
export function calculateHybridRotationAngles(
  personal: PersonalCoordinateSystem,
  dynamic: DynamicCoordinateSystem,
): RotationAngles {
  const vectorAngles = calculateRotationAngles(personal, dynamic);
  const distanceAngles = calculateRotationAnglesFromDistance(personal, dynamic);

  // 가중 평균 계산
  return {
    yaw: vectorAngles.yaw * 0.6 + distanceAngles.yaw * 0.4,
    pitch: vectorAngles.pitch * 0.6 + distanceAngles.pitch * 0.4,
    roll: vectorAngles.roll * 0.8 + distanceAngles.roll * 0.2,
  };
}

/**
 * 회전 각도로부터 깊이 추정
 * 얼굴 회전에 따른 입술의 깊이 변화 계산
 * @param rotationAngles - 회전 각도
 * @param baseDepth - 기본 깊이 값
 * @returns 추정된 깊이
 */
export function estimateDepthFromRotation(
  rotationAngles: RotationAngles,
  baseDepth: number = 0.1,
): number {
  const yawRad = (rotationAngles.yaw * Math.PI) / 180;
  const pitchRad = (rotationAngles.pitch * Math.PI) / 180;

  const yawDepth = baseDepth * Math.sin(Math.abs(yawRad));
  const pitchDepth = baseDepth * Math.sin(Math.abs(pitchRad));

  const totalDepth = Math.sqrt(yawDepth * yawDepth + pitchDepth * pitchDepth);

  return totalDepth;
}

/**
 * 거리 스케일 계산
 * 눈 사이 거리 비율을 이용한 스케일링 계수
 * @param personal - 개인화된 기준 좌표계
 * @param dynamic - 동적 좌표계
 * @returns 스케일 계수
 */
export function calculateDistanceScale(
  personal: PersonalCoordinateSystem,
  dynamic: DynamicCoordinateSystem,
): number {
  return dynamic.eyeDistance / personal.eyeDistance;
}

/**
 * 거리 스케일 적용
 * 점에 스케일 계수를 적용
 * @param point - 원본 점
 * @param scale - 스케일 계수
 * @returns 스케일이 적용된 점
 */
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

/**
 * 좌표계 수직성 검증
 * 각 축이 서로 수직인지 확인
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
 * 좌표계 정규화 검증
 * 각 축의 길이가 1인지 확인 (단위 벡터 검증)
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

// 벡터 연산 함수들은 ./vector3d.ts에서 import하여 사용
