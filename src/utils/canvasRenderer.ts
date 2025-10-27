/**
 * canvasRenderer.ts
 * 캔버스 렌더링 유틸리티
 * 카메라에 직접 그리는 것이 아니라 별도 캔버스에 렌더링
 * 향후 Good, Excellent 등 노래방 스타일 피드백 로직 추가 가능
 */

import {
  FACE_ANCHORS,
  MOUTH_LANDMARKS,
  OUTER_LIP_LANDMARKS,
  INNER_LIP_LANDMARKS,
  type LandmarkPoint,
} from '../constants/landmarks';

/**
 * 캔버스 좌표로 변환하는 헬퍼 함수
 * @param width - 캔버스 너비
 * @param height - 캔버스 높이
 * @returns 정규화된 좌표를 캔버스 좌표로 변환하는 함수
 */
export function createCanvasCoordConverter(width: number, height: number) {
  return (p: LandmarkPoint) => ({ x: p.x * width, y: p.y * height });
}

/**
 * 실시간 입술 윤곽선 그리기 (분홍색)
 * @param ctx - 캔버스 렌더링 컨텍스트
 * @param landmarks - 얼굴 랜드마크 배열
 * @param toCanvas - 캔버스 좌표 변환 함수
 */
export function drawLiveMouthContours(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarkPoint[],
  toCanvas: (p: LandmarkPoint) => { x: number; y: number },
) {
  // 외부 입술 윤곽선 - 부드럽고 자연스러운 형태
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

  // 내부 입술 윤곽선 - 입술 내부 경계 표현
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
 * @param ctx - 캔버스 렌더링 컨텍스트
 * @param landmarks - 얼굴 랜드마크 배열
 * @param toCanvas - 캔버스 좌표 변환 함수
 */
export function drawLandmarkPoints(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarkPoint[],
  toCanvas: (p: LandmarkPoint) => { x: number; y: number },
) {
  // 얼굴 앵커 포인트 (파란색)
  ctx.fillStyle = '#4299f0';
  FACE_ANCHORS.forEach(index => {
    const p = toCanvas(landmarks[index]);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
    ctx.fill();
  });

  // 입 랜드마크 (주황색)
  ctx.fillStyle = '#ff8800';
  MOUTH_LANDMARKS.forEach(index => {
    const p = toCanvas(landmarks[index]);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
    ctx.fill();
  });
}

/**
 * 목표 입술 윤곽선 그리기 (녹색)
 * @param ctx - 캔버스 렌더링 컨텍스트
 * @param targetLandmarks - 목표 랜드마크 좌표 맵
 * @param toCanvas - 캔버스 좌표 변환 함수
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

  // 목표 외부 입술 윤곽선 그리기
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

  // 목표 내부 입술 윤곽선 그리기
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
 * 모음 라벨 텍스트 그리기
 * @param ctx - 캔버스 렌더링 컨텍스트
 * @param targetLandmarks - 목표 랜드마크 좌표 맵
 * @param vowel - 표시할 모음 문자
 * @param toCanvas - 캔버스 좌표 변환 함수
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
