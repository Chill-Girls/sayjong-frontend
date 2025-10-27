/**
 * vector3d.ts
 * 3D 벡터 연산 유틸리티
 *
 * 이 모듈은 3D 공간에서의 벡터 연산을 위한 공통 함수들을 제공합니다.
 * Anchor.tsx, FindPoint.tsx 등 여러 모듈에서 사용됩니다.
 */

/**
 * 3D 벡터 인터페이스
 */
export interface Vector3D {
  x: number;
  y: number;
  z?: number;
}

/**
 * z 값이 없는 경우 0으로 보장
 * @param v - 벡터
 * @returns z 값이 보장된 벡터
 */
export const withZ = (v: Vector3D): { x: number; y: number; z: number } => ({
  x: v.x,
  y: v.y,
  z: v.z ?? 0,
});

/**
 * 벡터 빼기 연산
 * @param a - 벡터 a
 * @param b - 벡터 b
 * @returns a - b
 */
export const sub = (a: Vector3D, b: Vector3D): Vector3D => ({
  x: a.x - b.x,
  y: a.y - b.y,
  z: (a.z || 0) - (b.z || 0),
});

/**
 * 벡터 더하기 연산
 * @param a - 벡터 a
 * @param b - 벡터 b
 * @returns a + b
 */
export const add = (a: Vector3D, b: Vector3D): Vector3D => ({
  x: a.x + b.x,
  y: a.y + b.y,
  z: (a.z || 0) + (b.z || 0),
});

/**
 * 벡터 내적 (Dot Product)
 * @param a - 벡터 a
 * @param b - 벡터 b
 * @returns a · b
 */
export const dot = (a: Vector3D, b: Vector3D): number =>
  a.x * b.x + a.y * b.y + (a.z || 0) * (b.z || 0);

/**
 * 스칼라 곱
 * @param v - 벡터
 * @param s - 스칼라 값
 * @returns v * s
 */
export const scale = (v: Vector3D, s: number): Vector3D => ({
  x: v.x * s,
  y: v.y * s,
  z: (v.z || 0) * s,
});

/**
 * 벡터 길이 계산
 * @param v - 벡터
 * @returns 벡터의 길이 (크기)
 */
export const len = (v: Vector3D): number =>
  Math.sqrt(v.x * v.x + v.y * v.y + (v.z || 0) * (v.z || 0));

/**
 * 벡터 정규화 (단위 벡터로 변환)
 * @param v - 벡터
 * @returns 정규화된 벡터 (길이가 1인 벡터)
 */
export const normalize = (v: Vector3D): Vector3D => {
  const length = len(v);
  if (length === 0) return { x: 0, y: 0, z: 0 };
  return {
    x: v.x / length,
    y: v.y / length,
    z: (v.z || 0) / length,
  };
};

/**
 * 벡터 외적 (Cross Product)
 * @param a - 벡터 a
 * @param b - 벡터 b
 * @returns a × b (두 벡터에 수직인 벡터)
 */
export const cross = (a: Vector3D, b: Vector3D): Vector3D => ({
  x: (a.y || 0) * (b.z || 0) - (a.z || 0) * (b.y || 0),
  y: (a.z || 0) * (b.x || 0) - (a.x || 0) * (b.z || 0),
  z: (a.x || 0) * (b.y || 0) - (a.y || 0) * (b.x || 0),
});
