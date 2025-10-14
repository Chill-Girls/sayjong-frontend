export interface Point3D {
  x: number;
  y: number;
  z?: number;
} // 찾을 좌표

export interface RelativePosition {
  //비율(길이를 통해 비율을 찾음 -> 이걸 활용해서 어느정도 변화에 따라 좌표 찍을 수 있을 거 같음)
  alongRatio: number;
  //AB에 수직인 거리의 비율 (perpDist / |AB|)
  perpRatio: number;
  //수직 방향의 단위 벡터
  perpUnit: { x: number; y: number; z: number };
}

const withZ = (p: Point3D) => ({ x: p.x, y: p.y, z: p.z ?? 0 });

//빼기
const sub = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) => ({
  x: a.x - b.x,
  y: a.y - b.y,
  z: a.z - b.z,
});
//더하기
const add = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) => ({
  x: a.x + b.x,
  y: a.y + b.y,
  z: a.z + b.z,
});
//내적
const dot = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) =>
  a.x * b.x + a.y * b.y + a.z * b.z;
//스칼라 곱
const scale = (v: { x: number; y: number; z: number }, s: number) => ({
  x: v.x * s,
  y: v.y * s,
  z: v.z * s,
});
//벡터 길이
const len = (v: { x: number; y: number; z: number }) => Math.hypot(v.x, v.y, v.z);
//벡터 정규화 (단위벡터, norm)
const normalize = (v: { x: number; y: number; z: number }) => {
  const L = len(v);
  return L > 0 ? { x: v.x / L, y: v.y / L, z: v.z / L } : { x: 0, y: 0, z: 0 };
};

/**
 * 기준 좌표 A, B에 대해 목표 좌표(targetPoint)의 상대 위치(비율)를 계산 -> 여기서 비율은 AB길이 -> 입술 기준 비율에서 곱하면서 비율 찾을 수 있을 거 같음
 * - alongRatio: AB 방향으로의 투영 거리 / |AB|
 * - perpRatio : AB에 수직인 거리 / |AB|
 * - perpUnit  : 수직 성분의 단위 벡터  -> 벡터 분해라 생각
 * 내적 이용해서 벡터 분해 수직, 수평 성분 찾아 분해하는거!
 */
export function calculateRelativePosition(
  targetPoint: Point3D,
  pointA: Point3D,
  pointB: Point3D,
): RelativePosition {
  const A = withZ(pointA);
  const B = withZ(pointB);
  const T = withZ(targetPoint);

  const AB = sub(B, A);
  const distAB = len(AB); // 비율이라 생각

  if (distAB === 0) {
    throw new Error('calculateRelativePosition: pointA와 pointB가 동일합니다 (|AB| = 0).');
  }

  const unitAB = normalize(AB);
  const AT = sub(T, A);

  // AB 방향 성분의 스칼라(투영 길이)
  const alongAB = dot(AT, unitAB);

  // 평행 성분 벡터
  const alongVec = scale(unitAB, alongAB);

  // 수직 성분 벡터 및 단위 벡터
  const perpVec = sub(AT, alongVec);
  const perpDist = len(perpVec);
  const perpUnit = perpDist > 0 ? scale(perpVec, 1 / perpDist) : { x: 0, y: 0, z: 0 };

  return {
    alongRatio: alongAB / distAB,
    perpRatio: perpDist / distAB,
    perpUnit,
  };
}

/**
 * 상대 위치(비율)와 기준 좌표 A, B로부터 목표 좌표를 복원
 * distAB(비율)을 통해 복원
 */
export function restoreFromRelativePosition(
  relativePos: RelativePosition,
  pointA: Point3D,
  pointB: Point3D,
): { x: number; y: number; z: number } {
  const A = withZ(pointA);
  const B = withZ(pointB);

  const AB = sub(B, A);
  const distAB = len(AB);
  if (distAB === 0) {
    throw new Error('restoreFromRelativePosition: pointA와 pointB가 동일합니다 (|AB| = 0).');
  }

  const unitAB = normalize(AB);

  // AB 방향 성분 복원
  const alongComponent = scale(unitAB, relativePos.alongRatio * distAB);

  // 수직 성분 복원 (저장된 단위벡터 사용)
  const perpComponent = scale(relativePos.perpUnit, relativePos.perpRatio * distAB);

  // 최종 좌표 = A + 평행 성분 + 수직 성분
  const result = add(A, add(alongComponent, perpComponent));
  return result; // z는 항상 number로 반환
}
