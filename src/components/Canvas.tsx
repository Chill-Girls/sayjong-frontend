/**
 * Canvas Component
 *
 * 비디오 프레임을 캔버스에 그리는 컴포넌트
 * video 엘리먼트의 프레임을 canvas에 렌더링하고 추가 오버레이를 그릴 수 있도록 함
 */

import React, { useRef, useEffect } from 'react';
import { createCanvasCoordConverter } from '../utils/Draw';
import type { LandmarkPoint } from '../constants/landmarks';

interface CanvasProps {
  /** 비디오 엘리먼트 참조 */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** 프레임 그리기 콜백 함수 */
  onDrawFrame?: (
    ctx: CanvasRenderingContext2D,
    toCanvas: (p: LandmarkPoint) => { x: number; y: number },
  ) => void;
}

const Canvas: React.FC<CanvasProps> = ({ videoRef, onDrawFrame }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const toCanvasConverterRef = useRef<((p: LandmarkPoint) => { x: number; y: number }) | null>(
    null,
  );
  const animationFrameRef = useRef<number | null>(null);
  const lastRenderTimeRef = useRef<number>(0);

  /** 캔버스 컨텍스트 초기화 */
  useEffect(() => {
    if (canvasRef.current) {
      canvasContextRef.current = canvasRef.current.getContext('2d', {
        willReadFrequently: false,
        alpha: false,
      });
    }
  }, []);

  /** 프레임 렌더링 함수 */
  useEffect(() => {
    const renderFrame = () => {
      if (!videoRef.current || !canvasRef.current || !canvasContextRef.current) {
        animationFrameRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      // 비디오 준비 상태 확인
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;

      if (videoWidth === 0 || videoHeight === 0) {
        animationFrameRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      // 캔버스 크기를 비디오 크기에 맞춤
      const canvas = canvasRef.current;
      if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        // 좌표 변환 함수 재생성
        toCanvasConverterRef.current = createCanvasCoordConverter(videoWidth, videoHeight);
      }

      const now = performance.now();

      // 8ms마다 캔버스 렌더링 (최적화)
      if (now - lastRenderTimeRef.current >= 8) {
        lastRenderTimeRef.current = now;

        const canvasCtx = canvasContextRef.current;

        // 좌표 변환 함수 확인
        if (!toCanvasConverterRef.current) {
          toCanvasConverterRef.current = createCanvasCoordConverter(canvas.width, canvas.height);
        }
        const toCanvas = toCanvasConverterRef.current;

        // 비디오 프레임을 캔버스에 그리기 (비디오 크기에 맞춰 그리기)
        canvasCtx.imageSmoothingEnabled = false;
        canvasCtx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // 추가 오버레이 그리기 (입 모양, 목표 모음 등)
        if (onDrawFrame && toCanvas) {
          onDrawFrame(canvasCtx, toCanvas);
        }
      }

      // 다음 프레임 요청
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    // 렌더링 시작
    animationFrameRef.current = requestAnimationFrame(renderFrame);

    // cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [videoRef, onDrawFrame]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        transform: 'scaleX(-1)',
        borderRadius: 'inherit', // 부모의 borderRadius 상속
      }}
    />
  );
};

export default Canvas;
