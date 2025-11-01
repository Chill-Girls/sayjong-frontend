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
  applyDistanceScale,
  validateCoordinateSystem,
  validateNormalization,
  findMouthCenterWithAnchor,
  type PersonalCoordinateSystem,
} from './Anchor';
import type { Point3D } from './FindPoint';
import { buildTargetVowelShape, getMouthCenterFromShape } from './vowelBuilder';
import type { LandmarkPoint } from '../constants/landmarks';
// 초반 PersonalCoordinateSystem 만들 때 기준이 되는 json 데이터
import { neutral } from '../vowel_calibration.json';
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

    // 현재 랜드마크를 Point3D 형식으로 변환
    const currentLandmarks = allLandmarks.map(lm => ({ x: lm.x, y: lm.y, z: lm.z }));
    //*여기 무조건 vowel_calibration.json 기준으로 좌표계 만들어져야함.
    if (!this.personalCoordinateSystem) {
      // vowel_calibration.json의 neutral 데이터를 Point3D 배열로 변환
      // calibration 데이터도 인덱스 기반 배열로 변환해야 함
      const neutralLandmarks: Point3D[] = new Array(478);
      Object.entries(neutral.landmarks).forEach(([id, coords]) => {
        const index = parseInt(id);
        if (index >= 0 && index < 478) {
          neutralLandmarks[index] = {
            x: coords[0],
            y: coords[1],
            z: coords[2],
          };
        }
      });

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

    // 각 목표 랜드마크에 대해 좌표 변환 수행
    Object.entries(targetShape).forEach(([id, targetPoint]) => {
      // 목표 형태 입술 중앙점으로부터의 상대 위치 계산
      const relativePoint = {
        x: targetPoint.x - jsonMouthCenter.x,
        y: targetPoint.y - jsonMouthCenter.y,
        z: (targetPoint.z || 0) - (jsonMouthCenter.z || 0),
      };

      // 거리 스케일 적용
      const scaledRelativePoint = applyDistanceScale(relativePoint, distanceScale);

      // 개인화 좌표계 기준으로 로컬 좌표 계산
      const localX =
        scaledRelativePoint.x * personalSystem.xAxis.x +
        scaledRelativePoint.y * personalSystem.xAxis.y +
        scaledRelativePoint.z * (personalSystem.xAxis.z || 0);
      const localY =
        scaledRelativePoint.x * personalSystem.yAxis.x +
        scaledRelativePoint.y * personalSystem.yAxis.y +
        scaledRelativePoint.z * (personalSystem.yAxis.z || 0);
      const localZ =
        scaledRelativePoint.x * personalSystem.zAxis.x +
        scaledRelativePoint.y * personalSystem.zAxis.y +
        scaledRelativePoint.z * (personalSystem.zAxis.z || 0);

      // 동적 좌표계로 월드 좌표 변환
      const transformedX =
        currentMouthCenter.x +
        localX * dynamicSystem.xAxis.x +
        localY * dynamicSystem.yAxis.x +
        localZ * dynamicSystem.zAxis.x;
      const transformedY =
        currentMouthCenter.y +
        localX * dynamicSystem.xAxis.y +
        localY * dynamicSystem.yAxis.y +
        localZ * dynamicSystem.zAxis.y;
      const transformedZ =
        (currentMouthCenter.z || 0) +
        localX * (dynamicSystem.xAxis.z || 0) +
        localY * (dynamicSystem.yAxis.z || 0) +
        localZ * (dynamicSystem.zAxis.z || 0);

      targetLandmarks[parseInt(id)] = {
        x: transformedX,
        y: transformedY,
        z: transformedZ + depthCorrection,
      };
    });

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
