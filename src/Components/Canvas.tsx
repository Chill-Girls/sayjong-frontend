import { useRef, useEffect } from 'react';

interface LipCanvasProps {
  landmarks: any[] | null;
  width: number;
  height: number;
}

interface LipRatio{
    ratioTopRight: number;
    ratioTopLeft: number;
    
    ratioBottomTop: number;
    ratioLeftRight: number;

    ratioBottomLeft: number;
    ratioBottomRight: number;
}

const lipRatio: LipRatio = {
    ratioTopRight: 0.5,
    ratioTopLeft: 0.5,
    ratioBottomTop: 0.5,
    ratioLeftRight: 0.5,
    ratioBottomLeft: 0.5,
    ratioBottomRight: 0.5,
}

const LipCanvas: React.FC<LipCanvasProps> = ({ landmarks, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !landmarks || landmarks.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 초기화
    ctx.clearRect(0, 0, width, height);

    // 입술 랜드마크 추출 (61-79번 인덱스)
    const lipLandmarks = landmarks.slice(61, 80);

    if (lipLandmarks.length > 0) {
      // 입술 윤곽선 그리기
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();

      lipLandmarks.forEach((landmark: any, index: number) => {
        const x = landmark.x * width;
        const y = landmark.y * height;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      // 입술 윤곽선 닫기
      ctx.closePath();
      ctx.stroke();

      // 입술 점들 그리기
      ctx.fillStyle = '#00ff00';
      lipLandmarks.forEach((landmark: any) => {
        const x = landmark.x * width;
        const y = landmark.y * height;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  }, [landmarks, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 10
      }}
    />
  );
};

export default LipCanvas;
