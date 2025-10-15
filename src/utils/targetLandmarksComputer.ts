/**
 * targetLandmarksComputer.ts
 * 타겟 랜드마크 3D 좌표 변환 로직
 */

// import type { Point3D } from './FindPoint';
import {
  createPersonalCoordinateSystem,
  createDynamicCoordinateSystem,
  calculateHybridRotationAngles,
  estimateDepthFromRotation,
  validateCoordinateSystem,
  validateNormalization,
  findMouthCenterWithAnchor,
  // calculateMouthCenterRelativePosition,
  type PersonalCoordinateSystem,
} from './Anchor';
import { buildTargetVowelShape, getMouthCenterFromShape } from './vowelBuilder';

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

/**
 * 타겟 랜드마크 계산을 위한 상태 관리 클래스
 */
export class TargetLandmarksComputer {
  private personalCoordinateSystem: PersonalCoordinateSystem | null = null;
  // private calibrationLandmarks: Point3D[] | null = null;
  // private mouthCenterRelativePosition: any = null;
  private targetVowel: string;

  constructor(targetVowel: string) {
    this.targetVowel = targetVowel;
  }

  /**
   * 타겟 모음을 변경합니다.
   */
  setTargetVowel(vowel: string) {
    this.targetVowel = vowel;
  }

  /**
   * 좌표계를 초기화합니다 (재보정용)
   */
  resetCalibration() {
    this.personalCoordinateSystem = null;
    // this.calibrationLandmarks = null;
    // this.mouthCenterRelativePosition = null;
  }

  /**
   * 현재 얼굴 랜드마크를 기반으로 타겟 랜드마크를 계산 -> Anchor.tsx 방식
   */
  computeTargetLandmarks(allLandmarks: LandmarkPoint[]): Record<number, LandmarkPoint> {
    // Convert current landmarks to Point3D format
    const currentLandmarks = allLandmarks.map(lm => ({ x: lm.x, y: lm.y, z: lm.z }));

    // If not calibrated yet, create personal coordinate system from first frame
    if (!this.personalCoordinateSystem) {
      this.personalCoordinateSystem = createPersonalCoordinateSystem(currentLandmarks);
      // this.calibrationLandmarks = currentLandmarks;

      // Anchor.tsx 방식으로 입술 중앙점 상대 위치 저장
      // const nose = currentLandmarks[1]; // 코끝점
      // const leftEye = currentLandmarks[133]; // 왼쪽 눈
      // const mouthCenter = findMouthCenterWithAnchor(currentLandmarks);
      // this.mouthCenterRelativePosition = calculateMouthCenterRelativePosition(
      //   mouthCenter,
      //   nose,
      //   leftEye,
      // );

      // 좌표계 검증
      const orthogonalityCheck = validateCoordinateSystem(this.personalCoordinateSystem);
      const normalizationCheck = validateNormalization(this.personalCoordinateSystem);

      console.log('Personal coordinate system calibrated with Anchor.tsx mouth center');
      console.log('Orthogonality check:', orthogonalityCheck);
      console.log('Normalization check:', normalizationCheck);

      if (!orthogonalityCheck.isValid || !normalizationCheck.isValid) {
        console.warn('Coordinate system validation failed!');
      }
    }

    // Anchor.tsx 방식으로 동적 좌표계 생성
    const dynamicCoordinateSystem = createDynamicCoordinateSystem(currentLandmarks);

    // Anchor.tsx 방식으로 회전 각도 계산
    const rotationAngles = calculateHybridRotationAngles(
      this.personalCoordinateSystem,
      dynamicCoordinateSystem,
    );

    // vowelBuilder.tsx 방식으로 타겟 모음 입술 형태 생성
    const targetShape = buildTargetVowelShape(this.targetVowel);

    // Anchor.tsx 방식으로 타겟 랜드마크 계산
    const targetLandmarks: Record<number, LandmarkPoint> = {};

    // Anchor.tsx 방식으로 깊이 추정
    const depthCorrection = estimateDepthFromRotation(rotationAngles);

    // Anchor.tsx 방식으로 현재 입술 중앙점 찾기
    const currentMouthCenter = findMouthCenterWithAnchor(currentLandmarks);

    // vowelBuilder.tsx 방식으로 현재 입술 중앙점 찾기
    const jsonMouthCenter = getMouthCenterFromShape(targetShape);

    // Anchor.tsx 방식으로 타겟 랜드마크 계산
    Object.entries(targetShape).forEach(([id, targetPoint]) => {
      // Calculate relative position from JSON mouth center (vowel_calibration.json)
      const relativePoint = {
        x: targetPoint.x - jsonMouthCenter.x,
        y: targetPoint.y - jsonMouthCenter.y,
        z: (targetPoint.z || 0) - (jsonMouthCenter.z || 0),
      };

      // Anchor.tsx 방식으로 타겟 랜드마크 계산
      const personalSystem = this.personalCoordinateSystem!;
      const dynamicSystem = dynamicCoordinateSystem;

      // Anchor.tsx 방식으로 타겟 랜드마크 계산
      const localX =
        relativePoint.x * personalSystem.xAxis.x +
        relativePoint.y * personalSystem.xAxis.y +
        relativePoint.z * (personalSystem.xAxis.z || 0);
      const localY =
        relativePoint.x * personalSystem.yAxis.x +
        relativePoint.y * personalSystem.yAxis.y +
        relativePoint.z * (personalSystem.yAxis.z || 0);
      const localZ =
        relativePoint.x * personalSystem.zAxis.x +
        relativePoint.y * personalSystem.zAxis.y +
        relativePoint.z * (personalSystem.zAxis.z || 0);

      // Anchor.tsx 방식으로 타겟 랜드마크 계산
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

    // 디버깅 로그
    if (Math.random() < 0.01) {
      console.log('Rotate.tsx Mouth Center System:', {
        currentMouthCenter: {
          x: currentMouthCenter.x.toFixed(3),
          y: currentMouthCenter.y.toFixed(3),
          z: (currentMouthCenter.z || 0).toFixed(3),
        },
        yaw: rotationAngles.yaw.toFixed(1),
        pitch: rotationAngles.pitch.toFixed(1),
        roll: rotationAngles.roll.toFixed(1),
        depthCorrection: depthCorrection.toFixed(3),
      });
    }

    return targetLandmarks;
  }
}
