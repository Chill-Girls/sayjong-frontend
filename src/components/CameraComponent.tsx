/**
 * CameraComponent - 실시간 입 모양 추적 및 모음 오버레이
 *
 * 주요 기능:
 * - 43개 랜드마크 추적 (얼굴 앵커 3개 + 입 포인트 40개)
 * - 3D 머리 자세 추적 (피치, 요, 롤 회전 지원)
 * - 발음 훈련을 위한 실시간 블렌드쉐이프 분석
 * - 보정 기반 목표 모음 오버레이 (정적 형태)
 * - EMA 필터링을 통한 부드러운 모션 추적
 * - 전체 40개 입 디테일 포인트 (외부 입술 20개 + 내부 입술 20개)
 *
 * 아키텍처:
 * - 각 관심사별로 분리된 유틸리티를 사용한 모듈러 디자인
 * - vowelShapeBuilder: 목표 모음 형태 생성
 * - targetLandmarksComputer: 3D 좌표 변환
 * - blendshapeProcessor: 블렌드쉐이프 평활화 및 표시
 * - landmarksDisplay: 랜드마크 정보 표시
 * - canvasRenderer: 캔버스 렌더링 유틸리티
 */

import React, { useRef, useEffect, useState } from 'react';
import { TargetLandmarksComputer } from '../utils/targetLandmarksComputer';
import { BlendshapeSmoother, TARGET_BLENDSHAPES } from '../utils/blendshapeProcessor';
import { updateLandmarksDisplay } from '../utils/landmarksDisplay';
import {
  createCanvasCoordConverter,
  drawLiveMouthContours,
  drawTargetMouthContours,
  drawVowelLabel,
} from '../utils/canvasRenderer';
import type { LandmarkPoint } from '../constants/landmarks';

interface CameraComponentProps {
  onResults?: (results: {
    landmarks?: LandmarkPoint[];
    blendshapes?: Record<string, number>;
  }) => void;
  width?: string;
  height?: string;
  vowels?: (string | null)[];
}

const CameraComponent: React.FC<CameraComponentProps> = ({
  onResults,
  width = '563px',
  height = '357px',
  vowels = [],
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastRenderTimeRef = useRef<number>(0);
  const lastDetectionTimeRef = useRef<number>(0);
  const shouldUpdateDisplayRef = useRef<boolean>(false);
  const lastVideoTimeRef = useRef<number>(0);
  const canvasContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const toCanvasConverterRef = useRef<((p: LandmarkPoint) => { x: number; y: number }) | null>(
    null,
  );
  const processedResultsRef = useRef<{
    landmarks?: LandmarkPoint[];
    blendshapes?: Record<string, number>;
  }>({});
  const cachedResultsRef = useRef<any>(null);

  // 목표 모음 오버레이 설정
  const targetVowelRef = useRef<string | null>(null);
  const faceLandmarkerRef = useRef<any>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  // 처리 유틸리티 초기화
  const targetLandmarksComputer = useRef<TargetLandmarksComputer | null>(null);
  const blendshapeSmoother = useRef(new BlendshapeSmoother(0.7));

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        if (!videoRef.current || !canvasRef.current) {
          console.error('Video or canvas ref not available');
          return;
        }

        // MediaPipe 라이브러리 가져오기
        const vision = await import('@mediapipe/tasks-vision');
        const { FaceLandmarker, FilesetResolver } = vision;

        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm',
        );

        const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: 'GPU',
          },
          outputFaceBlendshapes: true,
          runningMode: 'VIDEO',
          numFaces: 1,
          minFaceDetectionConfidence: 0.2,
          minFacePresenceConfidence: 0.2,
          minTrackingConfidence: 0.2,
        });
        faceLandmarkerRef.current = faceLandmarker;

        // 비디오 스트림 관리를 위한 Camera 클래스
        class Camera {
          video: HTMLVideoElement;
          options: any;

          constructor(video: HTMLVideoElement, options: any) {
            this.video = video;
            this.options = options;
          }

          async start() {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user',
                frameRate: { ideal: 60, max: 60 },
              },
            });
            videoStreamRef.current = stream;
            this.video.srcObject = stream;
            await this.video.play();

            await new Promise(resolve => {
              if (this.video.readyState >= 2) {
                resolve(void 0);
              } else {
                this.video.onloadedmetadata = () => resolve(void 0);
              }
            });

            if (this.options.onFrame) {
              this.options.onFrame();
            }
          }
        }

        if (canvasRef.current) {
          canvasContextRef.current = canvasRef.current.getContext('2d', {
            willReadFrequently: false,
            alpha: false,
          });
          toCanvasConverterRef.current = createCanvasCoordConverter(
            canvasRef.current.width,
            canvasRef.current.height,
          );
        }
        const renderFrame = () => {
          if (!videoRef.current || !canvasRef.current || !canvasContextRef.current) {
            animationFrameRef.current = requestAnimationFrame(renderFrame);
            return;
          }

          if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
            animationFrameRef.current = requestAnimationFrame(renderFrame);
            return;
          }

          try {
            const now = performance.now();
            let results = cachedResultsRef.current;
            const timeSinceLastDetection = now - lastDetectionTimeRef.current;

            if (timeSinceLastDetection >= 8) {
              const videoTime = videoRef.current.currentTime;
              if (videoTime !== lastVideoTimeRef.current) {
                lastVideoTimeRef.current = videoTime;
                if (faceLandmarkerRef.current) {
                  results = faceLandmarkerRef.current.detectForVideo(videoRef.current, now);
                  cachedResultsRef.current = results;
                  lastDetectionTimeRef.current = now;
                }
              }
            }

            if (!results) {
              animationFrameRef.current = requestAnimationFrame(renderFrame);
              return;
            }

            const hasFace = results.faceLandmarks && results.faceLandmarks.length > 0;

            if (now - lastRenderTimeRef.current >= 8) {
              lastRenderTimeRef.current = now;

              const canvasCtx = canvasContextRef.current;
              const canvas = canvasRef.current;

              if (!toCanvasConverterRef.current) {
                toCanvasConverterRef.current = createCanvasCoordConverter(
                  canvas.width,
                  canvas.height,
                );
              }
              const toCanvas = toCanvasConverterRef.current;

              canvasCtx.imageSmoothingEnabled = false;
              canvasCtx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

              if (hasFace) {
                const allLandmarks = results.faceLandmarks![0];
                drawLiveMouthContours(canvasCtx, allLandmarks, toCanvas);

                const currentTargetVowel = targetVowelRef.current;
                if (currentTargetVowel && targetLandmarksComputer.current) {
                  let targetLandmarks = cachedResultsRef.current?.lastTargetLandmarks;

                  if (timeSinceLastDetection >= 8 || !targetLandmarks) {
                    targetLandmarks =
                      targetLandmarksComputer.current.computeTargetLandmarks(allLandmarks);

                    if (!cachedResultsRef.current) cachedResultsRef.current = {};
                    cachedResultsRef.current.lastTargetLandmarks = targetLandmarks;
                  }

                  if (targetLandmarks) {
                    drawTargetMouthContours(canvasCtx, targetLandmarks, toCanvas);
                    drawVowelLabel(canvasCtx, targetLandmarks, currentTargetVowel, toCanvas);
                  }
                }
              }

              if (onResults) {
                const processedResults = processedResultsRef.current;

                if (hasFace) {
                  const landmarks = results.faceLandmarks![0];
                  if (
                    !processedResults.landmarks ||
                    processedResults.landmarks.length !== landmarks.length
                  ) {
                    processedResults.landmarks = landmarks.map((lm: LandmarkPoint) => ({
                      x: lm.x,
                      y: lm.y,
                      z: lm.z,
                    }));
                  } else {
                    for (let i = 0; i < landmarks.length; i++) {
                      const lm = landmarks[i];
                      processedResults.landmarks![i].x = lm.x;
                      processedResults.landmarks![i].y = lm.y;
                      processedResults.landmarks![i].z = lm.z;
                    }
                  }
                } else {
                  processedResults.landmarks = undefined;
                }

                if (!processedResults.blendshapes) {
                  processedResults.blendshapes = {};
                }

                const blendshapeCategories = results.faceBlendshapes?.[0]?.categories;
                if (blendshapeCategories && Array.isArray(blendshapeCategories)) {
                  const blendshapeMap = new Map<string, number>();
                  const catCount = blendshapeCategories.length;
                  for (let i = 0; i < catCount; i++) {
                    const cat = blendshapeCategories[i];
                    blendshapeMap.set(cat.categoryName, cat.score);
                  }

                  const targetCount = TARGET_BLENDSHAPES.length;
                  for (let i = 0; i < targetCount; i++) {
                    const key = TARGET_BLENDSHAPES[i];
                    processedResults.blendshapes![key] = blendshapeMap.get(key) ?? 0;
                  }
                }

                onResults(processedResults);
              }

              const landmarksDisplayEl = shouldUpdateDisplayRef.current
                ? document.getElementById('landmarks-display')
                : null;
              if (landmarksDisplayEl) {
                updateLandmarksDisplay(results, 'landmarks-display', blendshapeSmoother.current);
                shouldUpdateDisplayRef.current = false;
                setTimeout(() => {
                  shouldUpdateDisplayRef.current = true;
                }, 500);
              }
            }
          } catch (error) {
            console.error('Error processing frame:', error);
          }

          animationFrameRef.current = requestAnimationFrame(renderFrame);
        };

        const camera = new Camera(videoRef.current, {
          onFrame: () => {
            if (!animationFrameRef.current) {
              animationFrameRef.current = requestAnimationFrame(renderFrame);
              shouldUpdateDisplayRef.current = true;
            }
          },
          width: 563,
          height: 357,
        });

        // TARGET_VOWEL 업데이트
        const currentTargetVowel = vowels.length > 0 ? vowels[0] : null;
        targetVowelRef.current = currentTargetVowel;
        
        // TargetLandmarksComputer 초기화 또는 업데이트
        if (!targetLandmarksComputer.current) {
          targetLandmarksComputer.current = new TargetLandmarksComputer(currentTargetVowel);
        } else {
          // 기존 인스턴스가 있으면 targetVowel만 업데이트
          targetLandmarksComputer.current.setTargetVowel(currentTargetVowel);
        }

        await camera.start();
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        console.error('Camera initialization failed:', err);
        setError(
          `Camera initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        );
      }
    };

    initializeCamera();

    return () => {
      // 애니메이션 프레임 정리
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // 비디오 스트림 정리
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        videoStreamRef.current = null;
      }
      
      // 비디오 요소 정리
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.pause();
      }
      
      // FaceLandmarker 정리
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
        faceLandmarkerRef.current = null;
      }
    };
  }, [onResults, vowels]);

  const canvasWidth = parseInt(width);
  const canvasHeight = parseInt(height);

  return (
    <div style={{ position: 'relative', width, height }}>
      <video
        ref={videoRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)',
        }}
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transform: 'scaleX(-1)',
        }}
        width={canvasWidth}
        height={canvasHeight}
      />
      {!isInitialized && !error && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#666',
            fontSize: '16px',
          }}
        >
          Initializing camera...
        </div>
      )}
      {error && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#ff4444',
            fontSize: '14px',
            textAlign: 'center',
            padding: '20px',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default CameraComponent;
