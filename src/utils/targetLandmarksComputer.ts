/**
 * targetLandmarksComputer.ts
 * 목표 랜드마크 3D 좌표 변환 로직
 * 실시간 얼굴 추적과 목표 모음 형태를 매칭하기 위한 좌표 변환 처리
 */

import {
  createPersonalCoordinateSystem,
  createDynamicCoordinateSystem,
  calculateHybridRotationAngles,
  estimateDepthFromRotation,
  calculateDistanceScale,
  validateCoordinateSystem,
  validateNormalization,
  findMouthCenterWithAnchor,
  type PersonalCoordinateSystem,
} from './Anchor';
import type { Point3D } from './FindPoint';
import { buildTargetVowelShape, getMouthCenterFromShape } from './vowelBuilder';
import type { LandmarkPoint } from '../constants/landmarks';
// Point3D 타입 정의

/**
 * 목표 랜드마크 계산 클래스
 * 실시간 얼굴 랜드마크와 목표 모음 형태를 매칭하기 위한 상태 관리 및 좌표 변환
 */
export class TargetLandmarksComputer {
  private personalCoordinateSystem: PersonalCoordinateSystem | null = null;
  private targetVowel: string | null;

  constructor(targetVowel: string | null) {
    this.targetVowel = targetVowel;
  }

  /**
   * 목표 모음 변경
   * @param vowel - 새로운 목표 모음
   */
  setTargetVowel(vowel: string | null) {
    this.targetVowel = vowel;
  }

  /**
   * 좌표계 초기화 (재보정용)
   * 새로운 사용자나 카메라 위치 변경 시 호출
   */
  resetCalibration() {
    this.personalCoordinateSystem = null;
  }

  /**
   * 목표 랜드마크 계산
   * 현재 얼굴 랜드마크를 기반으로 목표 모음 형태의 3D 좌표를 계산
   * @param allLandmarks - 현재 프레임의 전체 얼굴 랜드마크
   * @returns 목표 랜드마크 좌표 맵
   */
  computeTargetLandmarks(allLandmarks: LandmarkPoint[]): Record<number, LandmarkPoint> {
    if (!this.targetVowel) return {};

    // 현재 랜드마크를 Point3D 형식으로 변환 (최적화: 직접 배열 생성)
    const currentLandmarks: Point3D[] = new Array(allLandmarks.length);
    for (let i = 0; i < allLandmarks.length; i++) {
      const lm = allLandmarks[i];
      currentLandmarks[i] = { x: lm.x, y: lm.y, z: lm.z };
    }
    //*여기 무조건 vowel_calibration.json 기준으로 좌표계 만들어져야함.
    if (!this.personalCoordinateSystem) {
      // localStorage에서 'vowel_calibration' 데이터 로드
      const rawString = localStorage.getItem('vowel_calibration');
      if (!rawString) {
        console.error(
          'TargetLandmarksComputer: "vowel_calibration" 데이터가 localStorage에 없습니다. 캘이 필요합니다.',
        );
        return {}; // 보정 데이터 없이는 좌표계 생성 불가
      }

      let calibData;
      try {
        calibData = JSON.parse(rawString);
      } catch (e) {
        console.error('TargetLandmarksComputer: "vowel_calibration" 데이터 파싱 실패.', e);
        return {}; // 데이터 손상
      }

      const neutral = calibData.neutral; // calibData에서 neutral 추출

      if (!neutral || !neutral.landmarks) {
        console.error(
          'TargetLandmarksComputer: "neutral" 데이터가 캘리브레이션 데이터에 없습니다.',
        );
        return {}; // neutral 데이터는 필수
      }

      // vowel_calibration.json의 neutral 데이터를 Point3D 배열로 변환
      // calibration 데이터도 인덱스 기반 배열로 변환해야 함
      const neutralLandmarks: Point3D[] = new Array(478);
      const neutralEntries = Object.entries(neutral.landmarks);
      for (let i = 0; i < neutralEntries.length; i++) {
        const [id, coords] = neutralEntries[i] as [string, [number, number, number]];
        const index = parseInt(id);
        if (index >= 0 && index < 478) {
          neutralLandmarks[index] = {
            x: coords[0],
            y: coords[1],
            z: coords[2],
          };
        }
      }

      // 필요한 랜드마크가 모두 있는지 확인
      const requiredLandmarks = [1, 10, 13, 14, 133, 362];
      const missingLandmarks = requiredLandmarks.filter(idx => !neutralLandmarks[idx]);

      if (missingLandmarks.length > 0) {
        console.error('필수 랜드마크가 calibration 데이터에 없습니다!');
        console.log('Missing landmark indices:', missingLandmarks);
        console.log('Available landmark indices:', Object.keys(neutral.landmarks));
      }

      this.personalCoordinateSystem = createPersonalCoordinateSystem(neutralLandmarks);
      // 좌표계 검증
      const orthogonalityCheck = validateCoordinateSystem(this.personalCoordinateSystem);
      const normalizationCheck = validateNormalization(this.personalCoordinateSystem);

      console.log('개인화 좌표계 보정 완료 (입술 중앙 기준)');
      console.log('직교성 검증:', orthogonalityCheck);
      console.log('정규화 검증:', normalizationCheck);

      if (!orthogonalityCheck.isValid || !normalizationCheck.isValid) {
        console.warn('좌표계 검증 실패!');
      }
    }

    // 동적 좌표계 생성 (현재 프레임)
    const dynamicCoordinateSystem = createDynamicCoordinateSystem(currentLandmarks);

    // 회전 각도 계산 (하이브리드 방식)
    const rotationAngles = calculateHybridRotationAngles(
      this.personalCoordinateSystem,
      dynamicCoordinateSystem,
    );

    // 목표 모음 입술 형태 생성
    const targetShape = buildTargetVowelShape(this.targetVowel);

    // 목표 랜드마크 좌표 맵 초기화
    const targetLandmarks: Record<number, LandmarkPoint> = {};

    // 회전에 따른 깊이 보정 계산
    const depthCorrection = estimateDepthFromRotation(rotationAngles);

    // 현재 입술 중앙점 계산
    const currentMouthCenter = findMouthCenterWithAnchor(currentLandmarks);

    // 목표 형태의 입술 중앙점 계산
    const jsonMouthCenter = getMouthCenterFromShape(targetShape);

    // 거리 스케일 계산 (눈 사이 거리 비율)
    const personalSystem = this.personalCoordinateSystem!;
    const dynamicSystem = dynamicCoordinateSystem;
    const distanceScale = calculateDistanceScale(personalSystem, dynamicSystem);

    // 각 목표 랜드마크에 대해 좌표 변환 수행 (최적화: for loop, 빠른 계산을 위해 변수 캐싱)
    const targetEntries = Object.entries(targetShape);
    const entryCount = targetEntries.length;
    const personalXAxis = personalSystem.xAxis;
    const personalYAxis = personalSystem.yAxis;
    const personalZAxis = personalSystem.zAxis;
    const dynamicXAxis = dynamicSystem.xAxis;
    const dynamicYAxis = dynamicSystem.yAxis;
    const dynamicZAxis = dynamicSystem.zAxis;
    const mouthCenterX = currentMouthCenter.x;
    const mouthCenterY = currentMouthCenter.y;
    const mouthCenterZ = currentMouthCenter.z || 0;
    const jsonMouthCenterX = jsonMouthCenter.x;
    const jsonMouthCenterY = jsonMouthCenter.y;
    const jsonMouthCenterZ = jsonMouthCenter.z || 0;

    for (let i = 0; i < entryCount; i++) {
      const [id, targetPoint] = targetEntries[i];
      // 목표 형태 입술 중앙점으로부터의 상대 위치 계산 (인라인 최적화)
      const relX = targetPoint.x - jsonMouthCenterX;
      const relY = targetPoint.y - jsonMouthCenterY;
      const relZ = (targetPoint.z || 0) - jsonMouthCenterZ;

      // 거리 스케일 적용 (인라인, 함수 호출 제거)
      const scaledRelX = relX * distanceScale;
      const scaledRelY = relY * distanceScale;
      const scaledRelZ = relZ * distanceScale;

      // 개인화 좌표계 기준으로 로컬 좌표 계산 (인라인, 변수 재사용)
      const localX =
        scaledRelX * personalXAxis.x +
        scaledRelY * personalXAxis.y +
        scaledRelZ * (personalXAxis.z || 0);
      const localY =
        scaledRelX * personalYAxis.x +
        scaledRelY * personalYAxis.y +
        scaledRelZ * (personalYAxis.z || 0);
      const localZ =
        scaledRelX * personalZAxis.x +
        scaledRelY * personalZAxis.y +
        scaledRelZ * (personalZAxis.z || 0);

      // 동적 좌표계로 월드 좌표 변환 (인라인)
      const transformedX =
        mouthCenterX + localX * dynamicXAxis.x + localY * dynamicYAxis.x + localZ * dynamicZAxis.x;
      const transformedY =
        mouthCenterY + localX * dynamicXAxis.y + localY * dynamicYAxis.y + localZ * dynamicZAxis.y;
      const transformedZ =
        mouthCenterZ +
        localX * (dynamicXAxis.z || 0) +
        localY * (dynamicYAxis.z || 0) +
        localZ * (dynamicZAxis.z || 0);

      targetLandmarks[parseInt(id)] = {
        x: transformedX,
        y: transformedY,
        z: transformedZ + depthCorrection,
      };
    }

    // 디버깅 로그 (1% 확률로 출력)
    if (Math.random() < 0.01) {
      console.log('입술 중앙 기준 좌표계:', {
        currentMouthCenter: {
          x: currentMouthCenter.x.toFixed(3),
          y: currentMouthCenter.y.toFixed(3),
          z: (currentMouthCenter.z || 0).toFixed(3),
        },
        yaw: rotationAngles.yaw.toFixed(1),
        pitch: rotationAngles.pitch.toFixed(1),
        roll: rotationAngles.roll.toFixed(1),
        depthCorrection: depthCorrection.toFixed(3),
        distanceScale: distanceScale.toFixed(3),
        personalEyeDistance: personalSystem.eyeDistance.toFixed(3),
        dynamicEyeDistance: dynamicSystem.eyeDistance.toFixed(3),
      });
    }

    return targetLandmarks;
  }
}
