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
/**
 * 빨간색 입술 윤곽선 그리기
 * @param ctx - 캔버스 렌더링 컨텍스트
 * @param landmarks - 얼굴 랜드마크 배열
 * @param toCanvas - 캔버스 좌표 변환 함수
 */
export function drawLiveMouthContours_red(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarkPoint[],
  toCanvas: (p: LandmarkPoint) => { x: number; y: number },
) {
  const color = '#FF0000';

  // 외부 입술 윤곽선
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i < OUTER_LIP_LANDMARKS.length; i++) {
    const index = OUTER_LIP_LANDMARKS[i];
    const point = toCanvas(landmarks[index]);
    if (i === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  }
  ctx.closePath();
  ctx.stroke();

  // 내부 입술 윤곽선
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < INNER_LIP_LANDMARKS.length; i++) {
    const index = INNER_LIP_LANDMARKS[i];
    const point = toCanvas(landmarks[index]);
    if (i === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  }
  ctx.closePath();
  ctx.stroke();
}

/**
 * 초록색 입술 윤곽선 그리기
 * @param ctx - 캔버스 렌더링 컨텍스트
 * @param landmarks - 얼굴 랜드마크 배열
 * @param toCanvas - 캔버스 좌표 변환 함수
 */
export function drawLiveMouthContours_green(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarkPoint[],
  toCanvas: (p: LandmarkPoint) => { x: number; y: number },
) {
  const color = '#00FF00';

  // 외부 입술 윤곽선
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i < OUTER_LIP_LANDMARKS.length; i++) {
    const index = OUTER_LIP_LANDMARKS[i];
    const point = toCanvas(landmarks[index]);
    if (i === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  }
  ctx.closePath();
  ctx.stroke();

  // 내부 입술 윤곽선
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < INNER_LIP_LANDMARKS.length; i++) {
    const index = INNER_LIP_LANDMARKS[i];
    const point = toCanvas(landmarks[index]);
    if (i === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  }
  ctx.closePath();
  ctx.stroke();
}

/**
 * 주황색(오렌지색) 입술 윤곽선 그리기
 * @param ctx - 캔버스 렌더링 컨텍스트
 * @param landmarks - 얼굴 랜드마크 배열
 * @param toCanvas - 캔버스 좌표 변환 함수
 */
export function drawLiveMouthContours_orange(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarkPoint[],
  toCanvas: (p: LandmarkPoint) => { x: number; y: number },
) {
  const color = '#FF8C00';

  // 외부 입술 윤곽선
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i < OUTER_LIP_LANDMARKS.length; i++) {
    const index = OUTER_LIP_LANDMARKS[i];
    const point = toCanvas(landmarks[index]);
    if (i === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  }
  ctx.closePath();
  ctx.stroke();

  // 내부 입술 윤곽선
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < INNER_LIP_LANDMARKS.length; i++) {
    const index = INNER_LIP_LANDMARKS[i];
    const point = toCanvas(landmarks[index]);
    if (i === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  }
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
  // 얼굴 앵커 포인트 (파란색) - 배치 렌더링으로 최적화
  ctx.fillStyle = '#4299f0';
  ctx.beginPath(); // 하나의 path로 배치
  FACE_ANCHORS.forEach(index => {
    const p = toCanvas(landmarks[index]);
    ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
  });
  ctx.fill(); // 한 번에 그리기

  // 입 랜드마크 (주황색) - 배치 렌더링으로 최적화
  ctx.fillStyle = '#ff8800';
  ctx.beginPath(); // 하나의 path로 배치
  MOUTH_LANDMARKS.forEach(index => {
    const p = toCanvas(landmarks[index]);
    ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
  });
  ctx.fill(); // 한 번에 그리기
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
  for (let i = 0; i < OUTER_LIP_LANDMARKS.length; i++) {
    const index = OUTER_LIP_LANDMARKS[i];
    const landmark = targetLandmarks[index];
    if (landmark) {
      const point = toCanvas(landmark);
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }
  }
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < INNER_LIP_LANDMARKS.length; i++) {
    const index = INNER_LIP_LANDMARKS[i];
    const landmark = targetLandmarks[index];
    if (landmark) {
      const point = toCanvas(landmark);
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }
  }
  ctx.closePath();
  ctx.stroke();
}

/**
 * 모음 라벨 텍스트 그리기
 * @param ctx - 캔버스 렌더링 컨텍스트
 * @param targetLandmarks - 목표 랜드마크 좌표 맵
 * @param vowel - 표시할 모음 문자 (null일 수 있음)
 * @param toCanvas - 캔버스 좌표 변환 함수
 */
export function drawVowelLabel(
  ctx: CanvasRenderingContext2D,
  targetLandmarks: Record<number, LandmarkPoint>,
  vowel: string | null,
  toCanvas: (p: LandmarkPoint) => { x: number; y: number },
) {
  ctx.save();
  const labelLandmark = targetLandmarks[0];

  if (labelLandmark && vowel) {
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

/**
 * 카운트다운을 캔버스에 그리기
 * @param ctx - 캔버스 렌더링 컨텍스트
 * @param countdown - 카운트다운 숫자 (3, 2, 1)
 */
export function drawCountdown(ctx: CanvasRenderingContext2D, countdown: number) {
  const canvas = ctx.canvas;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // 배경 반투명 처리
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 카운트다운 숫자 그리기
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(-1, 1); // 비디오와 동일하게 좌우 반전

  // 큰 초록색 글자
  ctx.font = 'bold 120px Arial';
  ctx.fillStyle = '#00FF00';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.lineWidth = 8;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 텍스트 그림자 효과
  ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
  ctx.shadowBlur = 20;

  const countdownText = countdown.toString();
  ctx.strokeText(countdownText, 0, 0);
  ctx.fillText(countdownText, 0, 0);

  ctx.restore();
}

/**
 * 블렌드쉐이프 유사도 점수를 캔버스에 그리기
 * @param ctx - 캔버스 렌더링 컨텍스트
 * @param similarity - 유사도 점수 (0.0 ~ 1.0)
 * @param width - 캔버스 너비
 * @param height - 캔버스 높이
 * @param vowel - 현재 모음 (선택적)
 */
export function drawSimilarityScore(
  ctx: CanvasRenderingContext2D,
  similarity: number | null,
  width: number,
  _height: number,
  vowel: string | null = null,
) {
  if (similarity === null || similarity === undefined) return;

  ctx.save();
  ctx.scale(-1, 1); // 좌우 반전 (비디오와 맞추기 위해)

  // 점수 위치 (좌상단, 반전된 좌표계에서)
  const x = -width + 20;
  const y = 20;

  // 배경 박스
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(x, y - 30, 180, vowel ? 80 : 50);

  // 모음 표시 (있는 경우)
  if (vowel) {
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText(`모음: ${vowel}`, x + 10, y - 10);
  }

  // 점수 색상 결정
  let scoreColor: string;
  if (similarity > 0.7) {
    scoreColor = '#4CAF50'; // 초록색 (좋음)
  } else if (similarity > 0.5) {
    scoreColor = '#FFC107'; // 노란색 (보통)
  } else {
    scoreColor = '#F44336'; // 빨간색 (나쁨)
  }

  // 점수 텍스트
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = scoreColor;
  ctx.textAlign = 'left';
  const scoreText = `${(similarity * 100).toFixed(1)}%`;
  ctx.fillText(scoreText, x + 10, vowel ? y + 20 : y + 10);

  // 점수 라벨
  ctx.font = '14px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Similarity', x + 10, vowel ? y + 40 : y + 30);

  ctx.restore();
}
