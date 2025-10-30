/**
 * CalibrationCapture - 모음 보정 데이터 캡처 도구
 *
 * 이 컴포넌트는 사용자가 네 가지 기본 모음(중립, ㅏ, ㅜ, ㅣ)의
 * 얼굴 랜드마크와 블렌드쉐이프를 캡처하여 vowel_calibration.json에 저장할 수 있도록 합니다.
 */

import { useRef, useEffect, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { ALL_TRACKED_LANDMARKS } from '../constants/landmarks';
import { TARGET_BLENDSHAPES } from '../utils/blendshapeProcessor';
import { precomputeAllTargetVowels, downloadPrecomputedTargets } from '../utils/precomputeTargets';
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS } from '../styles/theme';
import { containerFullscreen, flexColumn, buttonPrimary, buttonDisabled, scaled } from '../styles/mixins';

interface CalibrationData {
  neutral?: CapturedFrame;
  a?: CapturedFrame;
  u?: CapturedFrame;
  i?: CapturedFrame;
}

interface CapturedFrame {
  landmarks: Record<string, [number, number, number]>;
  blendshapes: Record<string, number>;
}

const CalibrationCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  const [isInitialized, setIsInitialized] = useState(false);
  const [currentVowel, setCurrentVowel] = useState<'neutral' | 'a' | 'u' | 'i'>('neutral');
  const [calibrationData, setCalibrationData] = useState<CalibrationData>({});
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    initializeMediaPipe();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeMediaPipe = async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm',
      );

      const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        outputFaceBlendshapes: true,
        runningMode: 'VIDEO',
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
      });

      faceLandmarkerRef.current = faceLandmarker;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsInitialized(true);
        startProcessing();
      }
    } catch (error) {
      console.error('Failed to initialize:', error);
    }
  };

  const startProcessing = () => {
    const processFrame = () => {
      if (videoRef.current && canvasRef.current && faceLandmarkerRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // 비디오 좌우 반전
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        // MediaPipe로 처리
        const results = faceLandmarkerRef.current.detectForVideo(video, performance.now());

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];

          // 랜드마크 그리기
          ALL_TRACKED_LANDMARKS.forEach(index => {
            const landmark = landmarks[index];
            const x = (1 - landmark.x) * canvas.width;
            const y = landmark.y * canvas.height;

            // 이마점(10번)은 더 크고 다른 색으로 표시
            if (index === 10) {
              ctx.fillStyle = '#00FF00'; // 초록색
              ctx.beginPath();
              ctx.arc(x, y, 3, 0, 2 * Math.PI);
              ctx.fill();
            } else {
              ctx.fillStyle = '#00FF00'; // 초록색
              ctx.beginPath();
              ctx.arc(x, y, 3, 0, 2 * Math.PI);
              ctx.fill();
            }
          });
        }
      }

      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    processFrame();
  };

  const captureFrame = async () => {
    if (!faceLandmarkerRef.current || !videoRef.current) return;

    setIsCapturing(true);

    // 카운트다운
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setCountdown(null);

    // 캡처
    const results = faceLandmarkerRef.current.detectForVideo(videoRef.current, performance.now());

    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      const landmarks = results.faceLandmarks[0];
      const blendshapes = results.faceBlendshapes?.[0]?.categories || [];

      // 랜드마크 추출
      const capturedLandmarks: Record<string, [number, number, number]> = {};
      ALL_TRACKED_LANDMARKS.forEach(index => {
        const lm = landmarks[index];
        capturedLandmarks[index.toString()] = [lm.x, lm.y, lm.z];
      });

      // 블렌드쉐이프 추출
      const capturedBlendshapes: Record<string, number> = {};
      blendshapes.forEach((bs: any) => {
        const name = bs.categoryName || bs.displayName || '';
        if (TARGET_BLENDSHAPES.includes(name)) {
          capturedBlendshapes[name] = bs.score || 0;
        }
      });

      const frame: CapturedFrame = {
        landmarks: capturedLandmarks,
        blendshapes: capturedBlendshapes,
      };

      setCalibrationData(prev => ({
        ...prev,
        [currentVowel]: frame,
      }));

      alert(`✅ Captured ${currentVowel}!`);
    }

    setIsCapturing(false);
  };

  const downloadCalibration = () => {
    // 1. 원본 캘리브레이션 데이터 다운로드
    const calibJson = JSON.stringify(calibrationData, null, 2);
    const calibBlob = new Blob([calibJson], { type: 'application/json' });
    const calibUrl = URL.createObjectURL(calibBlob);
    const calibLink = document.createElement('a');
    calibLink.href = calibUrl;
    calibLink.download = 'vowel_calibration.json';
    calibLink.click();
    URL.revokeObjectURL(calibUrl);

    console.log('캘리브레이션 데이터 다운로드 완료');

    // 2. 모든 모음의 목표 좌표 미리 계산
    try {
      console.log('모든 모음의 목표 좌표 계산 중...');
      const precomputedTargets = precomputeAllTargetVowels(calibrationData);

      // 3. 미리 계산된 목표 좌표 다운로드
      downloadPrecomputedTargets(precomputedTargets, 'target_vowels.json');

      alert(
        'Download Complete!\n\n' +
          '1. vowel_calibration.json - Original calibration data\n' +
          '2. target_vowels.json - Precomputed target coordinates for all vowels\n\n' +
          'You can now upload these to your backend!',
      );
    } catch (error) {
      console.error('목표 좌표 계산 실패:', error);
      alert(
        'Calibration data downloaded, but target precomputation failed.\n' +
          'Please check the console for details.',
      );
    }
  };

  const vowelInstructions = {
    neutral: '😐 Neutral face - Relax your mouth\n  ',
    a: '😮 Say "ㅏ" (ah) - Open mouth wide\n  ',
    u: '😗 Say "ㅜ" (oo) - Round and pucker lips\n  ',
    i: '😁 Say "ㅣ" (ee) - Spread lips wide\n  ',
  };

  return (
    <div
      style={{
        ...containerFullscreen,
        padding: scaled(20),
        backgroundColor: COLORS.white,
        minHeight: '100vh',
      }}
    >
      <h1
        style={{
          textAlign: 'center',
          color: COLORS.primary,
          fontSize: '2.5rem',
          marginBottom: '2rem',
          fontFamily: FONTS.primary,
          fontWeight: FONT_WEIGHTS.bold,
        }}
      >
        Vowel Calibration Tool
      </h1>

      <div
        style={{
          display: 'flex',
          gap: scaled(30),
          marginTop: scaled(20),
          maxWidth: scaled(1400),
          margin: `${scaled(20)} auto 0`,
          alignItems: 'flex-start',
        }}
      >
        {/* 비디오/캔버스 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: scaled(700),
            maxWidth: scaled(900),
          }}
        >
          <div
            style={{
              position: 'relative',
              width: scaled(800),
              height: scaled(600),
              backgroundColor: COLORS.gray,
              borderRadius: scaled(10),
              overflow: 'hidden',
            }}
          >
            <video
              ref={videoRef}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'none',
              }}
            />
            <canvas
              ref={canvasRef}
              style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {countdown !== null && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: scaled(120),
                  fontWeight: FONT_WEIGHTS.bold,
                  color: '#00FF00',
                  textShadow: '0 0 20px rgba(0,255,0,0.8)',
                }}
              >
                {countdown}
              </div>
            )}
          </div>
        </div>

        {/* 컨트롤 */}
        <div
          style={{ width: scaled(450), ...flexColumn, gap: scaled(20), fontFamily: FONTS.primary }}
        >
          {/* 현재 모음 선택 */}
          <div
            style={{
              backgroundColor: '#f8f9fa',
              padding: scaled(20),
              borderRadius: scaled(12),
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '1px solid #e9ecef',
            }}
          >
            <h3
              style={{
                margin: `0 0 ${scaled(15)} 0`,
                color: COLORS.primary,
                fontSize: '1.2rem',
                fontWeight: FONT_WEIGHTS.semibold,
              }}
            >
              Current Vowel
            </h3>
            <select
              value={currentVowel}
              onChange={e => setCurrentVowel(e.target.value as any)}
              style={{
                width: '100%',
                padding: scaled(12),
                fontSize: FONT_SIZES.base,
                borderRadius: scaled(8),
                border: `2px solid ${COLORS.primary}`,
                marginBottom: scaled(10),
                fontFamily: FONTS.primary,
              }}
            >
              <option value="neutral">Neutral (중립)</option>
              <option value="a">ㅏ (ah)</option>
              <option value="u">ㅜ (oo)</option>
              <option value="i">ㅣ (ee)</option>
            </select>
            <div
              style={{
                padding: scaled(15),
                backgroundColor: COLORS.white,
                borderRadius: scaled(8),
                fontSize: FONT_SIZES.sm,
                border: '1px solid #dee2e6',
                color: '#495057',
                whiteSpace: 'pre-line',
              }}
            >
              {vowelInstructions[currentVowel]}
            </div>
          </div>

          {/* 캡처 버튼 */}
          <button
            onClick={captureFrame}
            disabled={!isInitialized || isCapturing}
            style={{
              ...(isCapturing ? buttonDisabled : buttonPrimary),
              padding: `${scaled(15)} ${scaled(30)}`,
              fontSize: FONT_SIZES.md,
              fontWeight: FONT_WEIGHTS.bold,
              borderRadius: scaled(10),
            }}
          >
            {isCapturing ? 'Capturing...' : `Capture ${currentVowel.toUpperCase()}`}
          </button>

          {/* 캡처된 데이터 표시 */}
          <div
            style={{
              backgroundColor: '#f8f9fa',
              padding: scaled(20),
              borderRadius: scaled(12),
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '1px solid #e9ecef',
            }}
          >
            <h3
              style={{
                margin: `0 0 ${scaled(15)} 0`,
                color: COLORS.primary,
                fontSize: '1.2rem',
                fontWeight: FONT_WEIGHTS.semibold,
              }}
            >
              Captured Data
            </h3>
            <div style={{ ...flexColumn, gap: scaled(8) }}>
              {(['neutral', 'a', 'u', 'i'] as const).map(vowel => (
                <div
                  key={vowel}
                  style={{
                    padding: scaled(12),
                    backgroundColor: calibrationData[vowel] ? '#e8f5e8' : '#fff3cd',
                    borderRadius: scaled(8),
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: `1px solid ${calibrationData[vowel] ? '#c3e6c3' : '#ffeaa7'}`,
                  }}
                >
                  <span style={{ fontWeight: FONT_WEIGHTS.semibold, color: '#495057' }}>
                    {vowel}
                  </span>
                  <span style={{ fontSize: FONT_SIZES.base }}>{calibrationData[vowel] ? '✅' : '⏳'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 다운로드 버튼 */}
          <button
            onClick={downloadCalibration}
            disabled={Object.keys(calibrationData).length < 4}
            style={{
              padding: `${scaled(15)} ${scaled(30)}`,
              fontSize: FONT_SIZES.md,
              fontWeight: FONT_WEIGHTS.semibold,
              backgroundColor: Object.keys(calibrationData).length < 4 ? '#e9ecef' : '#28a745',
              color: Object.keys(calibrationData).length < 4 ? '#6c757d' : COLORS.white,
              border: 'none',
              borderRadius: scaled(12),
              cursor: Object.keys(calibrationData).length < 4 ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              fontFamily: FONTS.primary,
            }}
          >
            Download Calibration
          </button>

          {/* 정보 텍스트 */}
          <div
            style={{
              fontSize: FONT_SIZES.xs,
              color: '#6c757d',
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            Tracking: {ALL_TRACKED_LANDMARKS.length} landmarks
            <br />
            (4 face + 40 mouth)
            <br />
            <span style={{ color: '#FF0000', fontWeight: FONT_WEIGHTS.bold }}></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalibrationCapture;
