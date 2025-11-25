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

const MOUTH_CENTER_LANDMARK = 13;

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
  color = '#FFFFFF',
) {
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
 * 반짝이는 실시간 입술 윤곽선 그리기
 * @param ctx - 캔버스 렌더링 컨텍스트
 * @param landmarks - 얼굴 랜드마크 배열
 * @param toCanvas - 캔버스 좌표 변환 함수
 * @param time - 현재 시간 (밀리초) - 애니메이션을 위한 시간값
 * @param baseColor - 기본 색상 (기본값: '#FFD700' - 황금색)
 * @param speed - 반짝임 속도 (기본값: 500ms)
 */
export function drawLiveMouthContoursTwinkling(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarkPoint[],
  toCanvas: (p: LandmarkPoint) => { x: number; y: number },
  time: number,
  baseColor = '#FFD700',
  speed = 500,
) {
  // 시간에 따른 밝기 계산 (0.4 ~ 1.0 사이)
  const intensity = (Math.sin((time / speed) * Math.PI * 2) + 1) / 2;
  const minBrightness = 0.4;
  const maxBrightness = 1.0;
  const brightness = minBrightness + intensity * (maxBrightness - minBrightness);

  // 색상을 RGB로 파싱하여 밝기 조절
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const newR = Math.round(r * brightness);
  const newG = Math.round(g * brightness);
  const newB = Math.round(b * brightness);

  const twinklingColor = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;

  // 외부 입술 윤곽선
  ctx.strokeStyle = twinklingColor;
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
  ctx.strokeStyle = twinklingColor;
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
 * 랜드마크 좌표 값을 캔버스에 그립니다 (그리드 형식)
 * @param ctx - 캔버스 렌더링 컨텍스트
 * @param landmarks - 얼굴 랜드마크 배열
 * @param _toCanvas - 캔버스 좌표 변환 함수 (현재 사용되지 않음, 그리드 레이아웃 사용)
 */
export function drawLandmarkCoordinates(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarkPoint[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _toCanvas: (p: LandmarkPoint) => { x: number; y: number },
) {
  ctx.save();
  ctx.scale(-1, 1); // 좌우 반전 (비디오와 맞추기 위해)
  ctx.font = '13px monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // 그리드 설정
  const startX = -600; // 왼쪽 여백 (반전된 좌표계)
  const startY = 40; // 상단 여백
  const colWidth = 200; // 컬럼 너비
  const rowHeight = 30; // 행 높이
  const colsPerRow = 3; // 한 행에 표시할 컬럼 수
  const sortedLandmarks = [...MOUTH_LANDMARKS].sort((a, b) => a - b); // 인덱스 순서대로 정렬

  // 그리드 형식으로 좌표 표시
  sortedLandmarks.forEach((index, i) => {
    const landmark = landmarks[index];
    const row = Math.floor(i / colsPerRow);
    const col = i % colsPerRow;

    const x = startX + col * colWidth;
    const y = startY + row * rowHeight;

    const text = `${index}: (${landmark.x.toFixed(2)}, ${landmark.y.toFixed(2)}, ${landmark.z.toFixed(2)})`;

    // 흰색 텍스트만 표시 (투명 배경)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(text, x, y);
  });

  ctx.restore();
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
  color = '#00FF00',
) {
  // 투명색일 때는 globalAlpha를 0으로 설정하여 투명하게 그림
  if (color === 'transparent') {
    ctx.save();
    ctx.globalAlpha = 0;
  }

  ctx.strokeStyle = color === 'transparent' ? 'rgba(0,0,0,0)' : color;
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

  ctx.strokeStyle = color === 'transparent' ? 'rgba(0,0,0,0)' : color;
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

  // 투명색이었으면 globalAlpha 복원
  if (color === 'transparent') {
    ctx.restore();
  }
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

/**
 * 활성 음절을 입 위치 기준으로 화면에 그리기 핑크색으로 입 옆에 가사 그리는거
 */
export function drawActiveSyllable(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarkPoint[],
  toCanvas: (p: LandmarkPoint) => { x: number; y: number },
  syllable: string,
) {
  const mouthCenter = landmarks[MOUTH_CENTER_LANDMARK];
  if (!mouthCenter) {
    return;
  }

  const mouthCanvasPos = toCanvas(mouthCenter);

  ctx.save();
  ctx.translate(mouthCanvasPos.x + 80, mouthCanvasPos.y);
  ctx.scale(-1, 1);

  ctx.font = 'bold 48px sans-serif';
  ctx.fillStyle = '#FF69B4';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.strokeText(syllable, 0, 0);
  ctx.fillText(syllable, 0, 0);
  ctx.restore();
}

