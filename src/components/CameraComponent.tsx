/**
 * CameraComponent
 *
 * 실시간 카메라 스트림을 받아 얼굴 랜드마크를 추적하고 모음 오버레이를 표시하는 컴포넌트
 *
 * @features
 * - MediaPipe FaceLandmarker를 사용한 실시간 얼굴 추적
 * - 입 모양 랜드마크 추출 (40개 입 포인트)
 * - 블렌드쉐이프 분석 및 전달
 * - 모음 오버레이 표시 (useVowelOverlay 훅 사용)
 *
 * @dependencies
 * - @mediapipe/tasks-vision: 얼굴 랜드마크 추출
 * - useVowelOverlay: 모음 오버레이 관리
 * - canvasRenderer: 캔버스 렌더링 유틸리티
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  drawLiveMouthContours_red,
  drawLiveMouthContours_green,
  drawLiveMouthContours_orange,
} from '../utils/Draw';
import { useVowelOverlay } from '../hooks/useVowelOverlay';
import {
  filterTargetBlendshapes,
  calculateBlendshapeSimilarity,
  TARGET_BLENDSHAPES,
} from '../utils/blendshapeProcessor';
import targetVowelsData from '../target_vowels.json';
import Canvas from './Canvas';
import type { LandmarkPoint } from '../constants/landmarks';

/**
 * CameraComponent Props
 */
interface CameraComponentProps {
  /** 랜드마크와 블렌드쉐이프 결과를 받는 콜백 함수 */
  onResults?: (results: {
    landmarks?: LandmarkPoint[];
    blendshapes?: Record<string, number>;
  }) => void;
  /** 카메라 영역 너비 (기본값: '563px') */
  width?: string;
  /** 카메라 영역 높이 (기본값: '357px') */
  height?: string;
  /** 모음을 추출할 문장 */
  text?: string | null;
}

const CameraComponent: React.FC<CameraComponentProps> = ({
  onResults,
  width = '563px',
  height = '357px',
  text = null,
}) => {
  /** 비디오 엘리먼트 참조 */
  const videoRef = useRef<HTMLVideoElement>(null);

  /** 카메라 초기화 상태 */
  const [isInitialized, setIsInitialized] = useState(false);
  /** 에러 메시지 */
  const [error, setError] = useState<string | null>(null);

  /** 애니메이션 프레임 ID */
  const animationFrameRef = useRef<number | null>(null);
  /** 마지막 얼굴 감지 시간 (최적화용) */
  const lastDetectionTimeRef = useRef<number>(0);
  /** 랜드마크 디스플레이 업데이트 플래그 */
  const shouldUpdateDisplayRef = useRef<boolean>(false);
  /** 마지막 비디오 시간 (중복 감지 방지) */
  const lastVideoTimeRef = useRef<number>(0);

  /** 처리된 결과 데이터 (onResults 콜백용) */
  const processedResultsRef = useRef<{
    landmarks?: LandmarkPoint[];
    blendshapes?: Record<string, number>;
  }>({});
  /** 캐시된 감지 결과 */
  const cachedResultsRef = useRef<any>(null);

  /** MediaPipe FaceLandmarker 인스턴스 */
  const faceLandmarkerRef = useRef<any>(null);
  /** 비디오 스트림 참조 */
  const videoStreamRef = useRef<MediaStream | null>(null);

  /** 모음 오버레이 렌더링 함수 */
  const { renderOverlay, currentVowel } = useVowelOverlay(text);

  /** 유사도 점수 ref */
  const similarityScoreRef = useRef<number | null>(null);
  /** 목표 블렌드쉐이프 캐시 */
  const targetBlendshapesCacheRef = useRef<Record<string, Record<string, number>>>({});

  /** 목표 블렌드쉐이프 가져오기 */
  const getTargetBlendshapes = useCallback(
    (vowel: string | null): Record<string, number> | null => {
      if (!vowel) return null;
      if (targetBlendshapesCacheRef.current[vowel]) {
        return targetBlendshapesCacheRef.current[vowel];
      }
      const target = (targetVowelsData.vowels as any)[vowel]?.blendshapes;
      if (target) {
        targetBlendshapesCacheRef.current[vowel] = target;
        return target;
      }
      return null;
    },
    [],
  );

  /** 캔버스에 오버레이를 그리는 함수 */
  const handleDrawFrame = useCallback(
    (
      canvasCtx: CanvasRenderingContext2D,
      toCanvas: (p: LandmarkPoint) => { x: number; y: number },
    ) => {
      const results = cachedResultsRef.current;
      if (!results) return;

      const hasFace = results.faceLandmarks && results.faceLandmarks.length > 0;
      if (hasFace) {
        const allLandmarks = results.faceLandmarks![0];
        const now = performance.now();
        const timeSinceLastDetection = now - lastDetectionTimeRef.current;

        // 블렌드쉐이프 유사도 계산
        let similarity: number | null = null;
        if (results.faceBlendshapes?.[0]?.categories && currentVowel) {
          const blendshapeCategories = results.faceBlendshapes[0].categories;
          const currentBlendshapes: Record<string, number> = {};

          // 블렌드쉐이프를 맵으로 변환
          blendshapeCategories.forEach((cat: any) => {
            if (TARGET_BLENDSHAPES.includes(cat.categoryName)) {
              currentBlendshapes[cat.categoryName] = cat.score || 0;
            }
          });

          const filteredBlendshapes = filterTargetBlendshapes(currentBlendshapes);
          const targetBlendshapes = getTargetBlendshapes(currentVowel);

          if (targetBlendshapes) {
            similarity = calculateBlendshapeSimilarity(filteredBlendshapes, targetBlendshapes);
            similarityScoreRef.current = similarity;
          }
        }

        // 유사도에 따라 입술 윤곽선 색상 결정 및 그리기
        if (similarity !== null) {
          if (similarity >= 0.8) {
            // 유사도 >= 80%: 초록색
            drawLiveMouthContours_green(canvasCtx, allLandmarks, toCanvas);
          } else if (similarity >= 0.5) {
            // 유사도 >= 50%: 주황색
            drawLiveMouthContours_orange(canvasCtx, allLandmarks, toCanvas);
          } else {
            // 유사도 < 50%: 빨간색
            drawLiveMouthContours_red(canvasCtx, allLandmarks, toCanvas);
          }
        } else {
          // 유사도 계산 불가 시 기본 색상 (빨간색)
          drawLiveMouthContours_red(canvasCtx, allLandmarks, toCanvas);
        }

        // 모음 정답 오버레이
        renderOverlay(canvasCtx, toCanvas, allLandmarks, cachedResultsRef, timeSinceLastDetection);
      }
    },
    [renderOverlay, currentVowel, getTargetBlendshapes],
  );

  /** 카메라 초기화 및 렌더링 설정 */
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        if (!videoRef.current) {
          console.error('Video ref not available');
          return;
        }

        // MediaPipe FaceLandmarker 초기화
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

        /** 비디오 스트림 관리 클래스 */
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

        /** 얼굴 감지 및 결과 처리 함수 */
        const detectFace = () => {
          if (!videoRef.current) {
            animationFrameRef.current = requestAnimationFrame(detectFace);
            return;
          }

          try {
            const now = performance.now();
            let results = cachedResultsRef.current;
            const timeSinceLastDetection = now - lastDetectionTimeRef.current;

            // 8ms마다 얼굴 감지 수행 (최적화)
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

            // 외부로 결과 전달
            if (onResults && results) {
              const processedResults = processedResultsRef.current;
              const hasFace = results.faceLandmarks && results.faceLandmarks.length > 0;

              // 랜드마크 데이터 처리
              if (hasFace) {
                const landmarks = results.faceLandmarks![0];
                // 배열 크기가 변경된 경우 새로 생성
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
                  // 기존 배열 재사용 (성능 최적화)
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

              // 블렌드쉐이프 데이터 처리
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

                // 타겟 블렌드쉐이프만 추출
                const targetCount = TARGET_BLENDSHAPES.length;
                for (let i = 0; i < targetCount; i++) {
                  const key = TARGET_BLENDSHAPES[i];
                  processedResults.blendshapes![key] = blendshapeMap.get(key) ?? 0;
                }
              }

              onResults(processedResults);
            }
          } catch (error) {
            console.error('Error detecting face:', error);
          }

          // 다음 프레임 요청
          animationFrameRef.current = requestAnimationFrame(detectFace);
        };

        const camera = new Camera(videoRef.current, {
          onFrame: () => {
            if (!animationFrameRef.current) {
              animationFrameRef.current = requestAnimationFrame(detectFace);
              shouldUpdateDisplayRef.current = true;
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

    // cleanup에서 사용할 현재 값 저장 (ref는 cleanup 시점에 변경될 수 있음)
    const currentVideo = videoRef.current;
    const currentVideoStream = videoStreamRef.current;
    const currentFaceLandmarker = faceLandmarkerRef.current;

    initializeCamera();

    /** 컴포넌트 언마운트 시 리소스 정리 */
    return () => {
      // 애니메이션 프레임 취소
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // 비디오 스트림 트랙 정지 및 해제
      if (currentVideoStream) {
        currentVideoStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        videoStreamRef.current = null;
      }

      // 비디오 요소 정리
      if (currentVideo) {
        currentVideo.srcObject = null;
        currentVideo.pause();
      }

      // FaceLandmarker 리소스 해제
      if (currentFaceLandmarker) {
        currentFaceLandmarker.close();
        faceLandmarkerRef.current = null;
      }
    };
  }, [onResults, text]);

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
      <Canvas videoRef={videoRef} onDrawFrame={handleDrawFrame} />
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
