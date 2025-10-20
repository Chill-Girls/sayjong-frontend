/**
 * canvasRenderer.ts
 * 캔버스 렌더링 유틸리티
 * 카메라에 직접 그리는것이 아님
 * 나중에 Good, Excellent 이러한 노래방  로직도 활용가능 할것으로 보임
 */

import {
  FACE_ANCHORS,
  MOUTH_LANDMARKS,
  OUTER_LIP_LANDMARKS,
  INNER_LIP_LANDMARKS,
} from '../constants/landmarks';

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

/**
 * 캔버스 좌표로 변환하는 헬퍼 함수
 */
export function createCanvasCoordConverter(width: number, height: number) {
  return (p: LandmarkPoint) => ({ x: p.x * width, y: p.y * height });
}

/**
 * 실시간 입술 윤곽선을 (빨강)
 */
export function drawLiveMouthContours(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarkPoint[],
  toCanvas: (p: LandmarkPoint) => { x: number; y: number },
) {
  // Outer lip contour - smooth, natural shape
  ctx.strokeStyle = '#f04299';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  OUTER_LIP_LANDMARKS.forEach((index, i) => {
    const point = toCanvas(landmarks[index]);
    if (i === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.closePath();
  ctx.stroke();

  // Inner lip contour - adds depth
  ctx.strokeStyle = '#f04299';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  INNER_LIP_LANDMARKS.forEach((index, i) => {
    const point = toCanvas(landmarks[index]);
    if (i === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.closePath();
  ctx.stroke();
}

/**
 * 얼굴 및 입 랜드마크 점들을 그립니다
 */
export function drawLandmarkPoints(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarkPoint[],
  toCanvas: (p: LandmarkPoint) => { x: number; y: number },
) {
  // Face anchors (blue)
  ctx.fillStyle = '#4299f0';
  FACE_ANCHORS.forEach(index => {
    const p = toCanvas(landmarks[index]);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
    ctx.fill();
  });

  // Mouth landmarks (orange)
  ctx.fillStyle = '#ff8800';
  MOUTH_LANDMARKS.forEach(index => {
    const p = toCanvas(landmarks[index]);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
    ctx.fill();
  });
}

/**
 * 정답 입술 좌표 그리기
 */
export function drawTargetMouthContours(
  ctx: CanvasRenderingContext2D,
  targetLandmarks: Record<number, LandmarkPoint>,
  toCanvas: (p: LandmarkPoint) => { x: number; y: number },
) {
  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 3;
  ctx.setLineDash([]);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Draw target outer lip contour
  ctx.beginPath();
  OUTER_LIP_LANDMARKS.forEach((index, i) => {
    const landmark = targetLandmarks[index];
    if (landmark) {
      const point = toCanvas(landmark);
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }
  });
  ctx.closePath();
  ctx.stroke();

  // Draw target inner lip contour
  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 2;
  ctx.beginPath();
  INNER_LIP_LANDMARKS.forEach((index, i) => {
    const landmark = targetLandmarks[index];
    if (landmark) {
      const point = toCanvas(landmark);
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }
  });
  ctx.closePath();
  ctx.stroke();
}

/**
 * 모음 라벨을 그립니다
 */
export function drawVowelLabel(
  ctx: CanvasRenderingContext2D,
  targetLandmarks: Record<number, LandmarkPoint>,
  vowel: string,
  toCanvas: (p: LandmarkPoint) => { x: number; y: number },
) {
  ctx.save();
  const labelLandmark = targetLandmarks[0];
  if (labelLandmark) {
    const labelPos = toCanvas(labelLandmark);
    ctx.translate(labelPos.x - 40, labelPos.y);
    ctx.scale(-1, 1);

    ctx.font = 'bold 28px Arial';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 4;
    ctx.strokeText(vowel, 0, 0);

    ctx.fillStyle = 'rgba(0, 255, 100, 1)';
    ctx.fillText(vowel, 0, 0);
  }
  ctx.restore();
}
