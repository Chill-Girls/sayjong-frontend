/**
 * CameraComponent - Real-time Mouth Tracking with Vowel Overlay
 *
 * Features:
 * - 43 landmark tracking (3 face anchors + 40 mouth points)
 * - 3D head pose tracking with full rotation support (pitch, yaw, roll)
 * - Real-time blendshape analysis for pronunciation training
 * - Target vowel overlay with calibration-based positioning (static shape)
 * - Smooth motion tracking with EMA filtering
 * - Full 40-point mouth detail (20 outer lip + 20 inner lip)
 *
 * Architecture:
 * - Modular design with separate utilities for each concern
 * - vowelShapeBuilder: Target vowel shape generation
 * - targetLandmarksComputer: 3D coordinate transformation
 * - blendshapeProcessor: Blendshape smoothing and display
 * - landmarksDisplay: Landmark information display
 * - canvasRenderer: Canvas rendering utilities
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

interface CameraComponentProps {
  onResults?: (results: {
    landmarks?: LandmarkPoint[];
    blendshapes?: Record<string, number>;
  }) => void;
}

interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onResults }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Target vowel overlay configuration
  const TARGET_VOWEL = 'ㅓ';

  // Initialize processing utilities
  const targetLandmarksComputer = useRef(new TargetLandmarksComputer(TARGET_VOWEL));
  const blendshapeSmoother = useRef(new BlendshapeSmoother(0.7));

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        if (!videoRef.current || !canvasRef.current) {
          console.error('Video or canvas ref not available');
          return;
        }

        // Import MediaPipe
        const vision = await import('@mediapipe/tasks-vision');
        const { FaceLandmarker, FilesetResolver } = vision;

        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm',
        );

        // Create FaceLandmarker
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

        // Camera class for managing video stream
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

            // Wait for video metadata
            await new Promise(resolve => {
              this.video.onloadedmetadata = () => resolve(void 0);
            });

            // Start frame processing
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

        // Initialize camera
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && canvasRef.current) {
              // Skip if video not ready
              if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
                return;
              }

              try {
                const results = faceLandmarker.detectForVideo(videoRef.current, performance.now());

                // Draw on canvas
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

                    // Draw tracked landmarks and mouth overlay
                    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                      const allLandmarks = results.faceLandmarks[0];

                      const w = canvasRef.current!.width;
                      const h = canvasRef.current!.height;

                      const toCanvas = createCanvasCoordConverter(w, h);

                      // Draw live mouth contours (pink/red)
                      drawLiveMouthContours(canvasCtx, allLandmarks, toCanvas);

                      // Draw landmarks
                      drawLandmarkPoints(canvasCtx, allLandmarks, toCanvas);

                      // Compute target overlay landmarks with proper transformation
                      const targetLandmarks =
                        targetLandmarksComputer.current.computeTargetLandmarks(allLandmarks);

                      // Draw target mouth contours (green)
                      drawTargetMouthContours(canvasCtx, targetLandmarks, toCanvas);

                      // Draw vowel label
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
  }, [onResults]);

  return (
    <div style={{ position: 'relative', width: '563px', height: '357px' }}>
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
        width={563}
        height={357}
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
