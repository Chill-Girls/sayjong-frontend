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
import { useVowelOverlay } from '../hooks/useVowelOverlay';
import { TARGET_BLENDSHAPES } from '../utils/blendshapeProcessor';
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
  /** 카메라 영역 너비 (기본값: '563px') - 높이는 자동으로 1.56:1 비율로 계산됨 */
  width?: string;
  /** 현재 발음할 음절 (예: "사", "랑") */
  activeSyllable?: string | null;
  /** LinePractice에서 전달받는, 현재 활성화된 모음 */
  activeVowel?: string | null;
}

const CameraComponent: React.FC<CameraComponentProps> = ({
  onResults,
  width = '563px',
  activeSyllable = null,
  activeVowel = null,
}) => {
  // 카메라 비율 563:357 (가로:세로) 고정
  const widthValue = parseFloat(width.replace('px', ''));
  const heightValue = (widthValue * 357) / 563;
  const height = `${heightValue}px`;
  /** 비디오 엘리먼트 참조 */
  const videoRef = useRef<HTMLVideoElement>(null);

  /** 카메라 초기화 상태 */
  const [isInitialized, setIsInitialized] = useState(false);
  /** 에러 메시지 */
  const [error, setError] = useState<string | null>(null);

  // localStorage에서 로드한 데이터를 저장할 state
  const [loadedTargetVowels, setLoadedTargetVowels] = useState<any>(null);
  // 데이터 로딩 상태
  const [isLoadingData, setIsLoadingData] = useState(true);

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
  /** onResults 콜백을 ref로 관리 (의존성 변경 최소화) */
  const onResultsRef = useRef(onResults);
  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  /** 목표 블렌드쉐이프 가져오기 */
  const getTargetBlendshapes = useCallback(
    (vowel: string | null): Record<string, number> | null => {
      // 데이터가 로드되지 않았거나 모음이 없으면 null 반환
      if (!vowel || !loadedTargetVowels) return null;

      // 캐시 확인
      if (targetBlendshapesCacheRef.current[vowel]) {
        return targetBlendshapesCacheRef.current[vowel];
      }

      const target = loadedTargetVowels[vowel]?.blendshapes;

      if (target) {
        targetBlendshapesCacheRef.current[vowel] = target;
        return target;
      }
      return null;
    },
    [loadedTargetVowels], // loadedTargetVowels에 의존
  );

  /** 현재 블렌드쉐이프 상태 */
  const [currentBlendshapes, setCurrentBlendshapes] = useState<Record<string, number> | null>(null);

  /** 모음 오버레이 렌더링 함수 */
  const { renderOverlay, currentVowel, countdown, startAROverlay, showAROverlay } = useVowelOverlay({
    currentVowel: activeVowel,
    getTargetBlendshapes,
    currentBlendshapes,
  });

  /** 현재 모음을 ref로 관리 (의존성 변경 최소화) */
  const currentVowelRef = useRef<string | null>(null);
  useEffect(() => {
    currentVowelRef.current = currentVowel;
  }, [currentVowel]);

  /** 목표 블렌드쉐이프 캐시 */
  const targetBlendshapesCacheRef = useRef<Record<string, Record<string, number>>>({});

  // localStorage에서 캘리브레이션 데이터 로드
  useEffect(() => {
    const dataString = localStorage.getItem('target_vowels');
    if (dataString) {
      try {
        const parsedData = JSON.parse(dataString);
        setLoadedTargetVowels(parsedData);
        console.log("CameraComponent: 'target_vowels'를 localStorage에서 로드했습니다.");
      } catch (e) {
        console.error('CameraComponent: localStorage 데이터 파싱 실패', e);
        setError('캘리브레이션 데이터를 불러오는 데 실패했습니다.');
      }
    } else {
      // 캘리브레이션을 아직 안 한 사용자
      console.warn("CameraComponent: 'target_vowels' 데이터가 없습니다.");
      setError('캘리브레이션이 필요합니다. 캘리브레이션 페이지로 이동해주세요.');
    }
    setIsLoadingData(false); // 데이터 로드 시도 완료
  }, []); // [] : 컴포넌트 마운트 시 한 번만 실행

  /** 캔버스에 오버레이를 그리는 함수 */
  const handleDrawFrame = useCallback(
    (
      canvasCtx: CanvasRenderingContext2D,
      toCanvas: (p: LandmarkPoint) => { x: number; y: number },
    ) => {
      if (countdown !== null) {
        return;
      }

      const results = cachedResultsRef.current;
      if (!results) return;

      const hasFace = results.faceLandmarks && results.faceLandmarks.length > 0;
      if (hasFace) {
        const allLandmarks = results.faceLandmarks![0];
        const now = performance.now();
        const timeSinceLastDetection = now - lastDetectionTimeRef.current;

        renderOverlay(canvasCtx, toCanvas, allLandmarks, cachedResultsRef, timeSinceLastDetection);

        // 음절 표시 (입모양 오버레이 오른쪽, 사용자 움직임과 같이 움직이도록)
        if (activeSyllable) {
          // 입 중심 좌표 계산 (landmark 13: 입 중심)
          const mouthCenter = allLandmarks[13];
          const mouthCanvasPos = toCanvas(mouthCenter);

          canvasCtx.save();
          // 텍스트만 좌우 반전해서 정상으로 보이게 함
          canvasCtx.translate(mouthCanvasPos.x + 80, mouthCanvasPos.y);
          canvasCtx.scale(-1, 1);
          
          canvasCtx.font = 'bold 48px sans-serif';
          canvasCtx.fillStyle = '#FF69B4'; // 분홍색
          canvasCtx.strokeStyle = '#000000';
          canvasCtx.lineWidth = 3;
          canvasCtx.textAlign = 'center';
          canvasCtx.textBaseline = 'middle';
          const text = activeSyllable;
          // 변환 기준점이 이미 (mouthCanvasPos.x + 80, mouthCanvasPos.y)이므로 (0, 0)에 그림
          canvasCtx.strokeText(text, 0, 0);
          canvasCtx.fillText(text, 0, 0);
          canvasCtx.restore();
        }
      }
    },
    [renderOverlay, countdown, activeSyllable],
  );

  useEffect(() => {
    if (activeVowel && countdown === null && !showAROverlay) {
      startAROverlay(activeVowel);
    } else if (!activeVowel && countdown === null && showAROverlay) {
      startAROverlay(null);
    }
  }, [activeVowel, countdown, showAROverlay, startAROverlay]);

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
            if (onResultsRef.current && results) {
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
                const currentBlendshapeMap: Record<string, number> = {};
                for (let i = 0; i < targetCount; i++) {
                  const key = TARGET_BLENDSHAPES[i];
                  const value = blendshapeMap.get(key) ?? 0;
                  processedResults.blendshapes![key] = value;
                  currentBlendshapeMap[key] = value;
                }
                // 현재 블렌드쉐이프 상태 업데이트
                setCurrentBlendshapes(currentBlendshapeMap);
              }

              onResultsRef.current(processedResults);
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
  }, []); // 마운트 시 한 번만 실행

  return (
    <div
      style={{ position: 'relative', width, height, borderRadius: 'inherit', overflow: 'hidden' }}
    >
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
          borderRadius: 'inherit',
        }}
        playsInline
        muted
      />
      <Canvas videoRef={videoRef} onDrawFrame={handleDrawFrame} />
      {countdown !== null && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '6rem',
            fontWeight: 700,
            color: '#00FF00',
            textShadow: '0 0 20px rgba(207, 65, 164, 0.8)',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          {countdown}
        </div>
      )}
      {(!isInitialized || isLoadingData) && !error && (
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
          {isLoadingData ? 'Loading calibration data...' : 'Initializing camera...'}
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
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // 칼리브레이션이 필요하다는 경고 포함
            borderRadius: '10px',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default CameraComponent;
