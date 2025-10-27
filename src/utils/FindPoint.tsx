import { withZ, sub, add, dot, scale, len, normalize } from './vector3d';

/**
 * 3D 점 인터페이스
 */
export interface Point3D {
  x: number;
  y: number;
  z?: number;
}

/**
 * 상대 위치 인터페이스
 * 두 기준점(A, B)에 대한 목표점의 상대적 위치 정보
 */
export interface RelativePosition {
  alongRatio: number; // AB 방향 투영 비율
  perpRatio: number; // AB에 수직인 거리 비율 (perpDist / |AB|)
  perpUnit: { x: number; y: number; z: number }; // 수직 방향 단위 벡터
}

type Vec3 = { x: number; y: number; z: number };

/**
 * 상대 위치 계산
 * 기준 좌표 A, B에 대해 목표 좌표의 상대적 위치를 비율로 계산
 * 내적을 이용한 벡터 분해를 통해 평행 성분과 수직 성분으로 분리
 *
 * @param targetPoint - 목표 좌표
 * @param pointA - 기준점 A
 * @param pointB - 기준점 B
 * @returns 상대 위치 정보 (alongRatio: AB 방향 비율, perpRatio: 수직 방향 비율, perpUnit: 수직 단위 벡터)
 */
export function calculateRelativePosition(
  targetPoint: Point3D,
  pointA: Point3D,
  pointB: Point3D,
): RelativePosition {
  const A: Vec3 = withZ(pointA);
  const B: Vec3 = withZ(pointB);
  const T: Vec3 = withZ(targetPoint);

  const AB = sub(B, A);
  const distAB = len(AB);

  if (distAB === 0) {
    throw new Error('calculateRelativePosition: pointA와 pointB가 동일합니다 (|AB| = 0).');
  }

  const unitAB = normalize(AB);
  const AT = sub(T, A);

  // AB 방향 성분의 투영 길이
  const alongAB = dot(AT, unitAB);

  // 평행 성분 벡터
  const alongVec = scale(unitAB, alongAB);

  // 수직 성분 벡터 및 단위 벡터
  const perpVec = sub(AT, alongVec);
  const perpDist = len(perpVec);
  const perpUnitCalc = perpDist > 0 ? scale(perpVec, 1 / perpDist) : { x: 0, y: 0, z: 0 };
  const perpUnit: Vec3 = { x: perpUnitCalc.x, y: perpUnitCalc.y, z: perpUnitCalc.z || 0 };

  return {
    alongRatio: alongAB / distAB,
    perpRatio: perpDist / distAB,
    perpUnit,
  };
}

/**
 * 상대 위치로부터 좌표 복원
 * 저장된 상대 위치 정보와 현재 기준점 A, B로부터 목표 좌표를 복원
 *
 * @param relativePos - 상대 위치 정보
 * @param pointA - 현재 기준점 A
 * @param pointB - 현재 기준점 B
 * @returns 복원된 목표 좌표
 */
export function restoreFromRelativePosition(
  relativePos: RelativePosition,
  pointA: Point3D,
  pointB: Point3D,
): { x: number; y: number; z: number } {
  const A: Vec3 = withZ(pointA);
  const B: Vec3 = withZ(pointB);

  const AB = sub(B, A);
  const distAB = len(AB);
  if (distAB === 0) {
    throw new Error('restoreFromRelativePosition: pointA와 pointB가 동일합니다 (|AB| = 0).');
  }

  const unitAB = normalize(AB);

  // AB 방향 성분 복원
  const alongComponent = scale(unitAB, relativePos.alongRatio * distAB);

  // 수직 성분 복원
  const perpComponent = scale(relativePos.perpUnit, relativePos.perpRatio * distAB);

  // 최종 좌표 = A + 평행 성분 + 수직 성분
  const resultCalc = add(A, add(alongComponent, perpComponent));
  const result: Vec3 = { x: resultCalc.x, y: resultCalc.y, z: resultCalc.z || 0 };
  return result;
}
