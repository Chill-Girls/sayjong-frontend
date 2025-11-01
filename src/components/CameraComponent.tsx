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

import { useRef, useEffect, useState } from 'react';
import { TargetLandmarksComputer } from '../utils/targetLandmarksComputer';
import { BlendshapeSmoother } from '../utils/blendshapeProcessor';
import { updateLandmarksDisplay } from '../utils/landmarksDisplay';
import {
  createCanvasCoordConverter,
  drawLiveMouthContours,
  drawLandmarkPoints,
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
  vowels: (string | null)[];
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

  // 목표 모음 오버레이 설정
  const TARGET_VOWEL = vowels.length > 0 ? vowels[0] : null;

  // 처리 유틸리티 초기화
  const targetLandmarksComputer = useRef(new TargetLandmarksComputer(TARGET_VOWEL));
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

        // FaceLandmarker 생성
        const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: 'GPU',
          },
          outputFaceBlendshapes: true,
          runningMode: 'VIDEO',
          numFaces: 1,
          minFaceDetectionConfidence: 0.5,
          minFacePresenceConfidence: 0.5,
        });

        // 비디오 스트림 관리를 위한 Camera 클래스
        class Camera {
          video: HTMLVideoElement;
          options: any;
          isProcessing: boolean = false;

          constructor(video: HTMLVideoElement, options: any) {
            this.video = video;
            this.options = options;
          }

          async start() {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.video.srcObject = stream;
            this.video.play();

            // 비디오 메타데이터 대기
            await new Promise(resolve => {
              this.video.onloadedmetadata = () => resolve(void 0);
            });

            // 프레임 처리 시작
            const onFrame = () => {
              if (this.options.onFrame && !this.isProcessing) {
                this.isProcessing = true;
                this.options.onFrame().finally(() => {
                  this.isProcessing = false;
                });
              }
              requestAnimationFrame(onFrame);
            };
            onFrame();
          }
        }

        // 카메라 초기화
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && canvasRef.current) {
              // 비디오가 준비되지 않았으면 건너뛰기
              if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
                return;
              }

              try {
                const results = faceLandmarker.detectForVideo(videoRef.current, performance.now());

                // 캔버스에 그리기
                if (canvasRef.current) {
                  const canvasCtx = canvasRef.current.getContext('2d');
                  if (canvasCtx) {
                    canvasCtx.save();
                    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    canvasCtx.drawImage(
                      videoRef.current,
                      0,
                      0,
                      canvasRef.current.width,
                      canvasRef.current.height,
                    );

                    // 추적된 랜드마크 및 입 오버레이 그리기
                    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                      const allLandmarks = results.faceLandmarks[0];

                      const w = canvasRef.current!.width;
                      const h = canvasRef.current!.height;

                      const toCanvas = createCanvasCoordConverter(w, h);

                      // 실시간 입 윤곽선 그리기 (분홍색)
                      drawLiveMouthContours(canvasCtx, allLandmarks, toCanvas);

                      // 랜드마크 포인트 그리기
                      drawLandmarkPoints(canvasCtx, allLandmarks, toCanvas);

                      // 적절한 변환을 통한 목표 오버레이 랜드마크 계산
                      const targetLandmarks =
                        targetLandmarksComputer.current.computeTargetLandmarks(allLandmarks);

                      // 목표 입 윤곽선 그리기 (녹색)
                      drawTargetMouthContours(canvasCtx, targetLandmarks, toCanvas);

                      // 모음 라벨 그리기
                      drawVowelLabel(canvasCtx, targetLandmarks, TARGET_VOWEL, toCanvas);
                    }

                    canvasCtx.restore();
                  }
                }

                if (onResults) {
                  const processedResults = {
                    landmarks: results.faceLandmarks?.[0]?.map(lm => ({
                      x: lm.x,
                      y: lm.y,
                      z: lm.z,
                    })),
                    blendshapes: results.faceBlendshapes?.[0]?.categories?.reduce(
                      (acc, category) => {
                        acc[category.categoryName] = category.score;
                        return acc;
                      },
                      {} as Record<string, number>,
                    ),
                  };
                  onResults(processedResults);
                }

                updateLandmarksDisplay(results, 'landmarks-display', blendshapeSmoother.current);
              } catch (error) {
                console.error('Error processing frame:', error);
              }
            }
          },
          width: 563,
          height: 357,
        });

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
