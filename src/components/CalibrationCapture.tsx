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
import { precomputeAllTargetVowels, saveTargetsToBackend } from '../utils/precomputeTargets';
import axios from 'axios';

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
  const [isSaving, setIsSaving] = useState(false); // 서버 전송을 위한 로딩 state 추가

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
              ctx.fillStyle = '#FF0000'; // 빨간색
              ctx.beginPath();
              ctx.arc(x, y, 6, 0, 2 * Math.PI);
              ctx.fill();
              // 이마점 라벨
              ctx.fillStyle = '#FFFFFF';
              ctx.font = '14px Arial';
              ctx.fillText('이마', x + 8, y - 8);
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

  const handleSaveClick = async () => {
    const calibJson = JSON.stringify(calibrationData, null, 2);
    const calibBlob = new Blob([calibJson], { type: 'application/json' });
    const calibUrl = URL.createObjectURL(calibBlob);
    const calibLink = document.createElement('a');
    calibLink.href = calibUrl;
    calibLink.download = 'vowel_calibration.json';
    calibLink.click();
    URL.revokeObjectURL(calibUrl);
    console.log('캘리브레이션 백업 데이터 다운로드 완료');

    setIsSaving(true);

    try {
      console.log('모든 모음의 목표 좌표 계산 중...');
      const precomputedTargets = precomputeAllTargetVowels(calibrationData);

      // 임시 토큰
      const TEMP_AUTH_TOKEN =
        'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0SmVvbmd5ZXVuIiwiYXV0aCI6IlJPTEVfVVNFUiIsImV4cCI6MTc2MTcxNzU3MX0.1UkZWE9nwXx5lThtk0Mz0PAP5fpQ43F3ly2uQZsBd2E';

      // saveTargetsToBackend 호출
      await saveTargetsToBackend(precomputedTargets, calibrationData, TEMP_AUTH_TOKEN);

      // 저장 성공
      alert(
        'Save Complete!\n\n' + 'Your calibration data has been successfully saved to the backend.',
      );
    } catch (error) {
      // axios 에러 처리
      console.error('서버 전송 또는 계산 실패:', error);

      let errorMessage = '알 수 없는 오류가 발생했습니다.';

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // 백엔드(GlobalExceptionHandler)가 보낸 응답이 있는 경우
          errorMessage = error.response.data.message || `서버 오류: ${error.response.status}`;
        } else if (error.request) {
          // 요청은 보냈으나 응답을 받지 못한 경우
          errorMessage = '서버로부터 응답을 받지 못했습니다. 네트워크를 확인해주세요.';
        } else {
          // 요청을 설정하는 중에 발생한 오류
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      alert('서버 저장에 실패했습니다.\n\n' + errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const vowelInstructions = {
    neutral: '😐 Neutral face - Relax your mouth\n📍 이마점(빨간 점)이 잘 보이는지 확인하세요',
    a: '😮 Say "ㅏ" (ah) - Open mouth wide\n📍 이마점(빨간 점)이 잘 보이는지 확인하세요',
    u: '😗 Say "ㅜ" (oo) - Round and pucker lips\n📍 이마점(빨간 점)이 잘 보이는지 확인하세요',
    i: '😁 Say "ㅣ" (ee) - Spread lips wide\n📍 이마점(빨간 점)이 잘 보이는지 확인하세요',
  };

  return (
    <div
      style={{
        padding: '20px',
        width: '100vw',
        backgroundColor: '#ffffff',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <h1
        style={{ textAlign: 'center', color: '#f04299', fontSize: '2.5rem', marginBottom: '2rem' }}
      >
        Vowel Calibration Tool
      </h1>

      <div
        style={{
          display: 'flex',
          gap: '30px',
          marginTop: '20px',
          maxWidth: '1400px',
          margin: '20px auto 0',
        }}
      >
        {/* 비디오/캔버스 */}
        <div style={{ flex: '2', minWidth: '600px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/9',
              backgroundColor: '#000',
              borderRadius: '10px',
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
                  fontSize: '120px',
                  fontWeight: 'bold',
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
        <div style={{ width: '450px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '1px solid #e9ecef',
            }}
          >
            <h3 style={{ margin: '0 0 15px 0', color: '#f04299', fontSize: '1.2rem' }}>
              Current Vowel
            </h3>
            <select
              value={currentVowel}
              onChange={e => setCurrentVowel(e.target.value as any)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '2px solid #f04299',
                marginBottom: '10px',
              }}
            >
              <option value="neutral">Neutral (중립)</option>
              <option value="a">ㅏ (ah)</option>
              <option value="u">ㅜ (oo)</option>
              <option value="i">ㅣ (ee)</option>
            </select>
            <div
              style={{
                padding: '15px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                fontSize: '14px',
                border: '1px solid #dee2e6',
                color: '#495057',
                whiteSpace: 'pre-line',
              }}
            >
              {vowelInstructions[currentVowel]}
            </div>
          </div>

          <button
            onClick={captureFrame}
            disabled={!isInitialized || isCapturing}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: isCapturing ? '#ccc' : '#f04299',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              cursor: isCapturing ? 'not-allowed' : 'pointer',
            }}
          >
            {isCapturing ? 'Capturing...' : `Capture ${currentVowel.toUpperCase()}`}
          </button>

          <div
            style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '1px solid #e9ecef',
            }}
          >
            <h3 style={{ margin: '0 0 15px 0', color: '#f04299', fontSize: '1.2rem' }}>
              Captured Data
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(['neutral', 'a', 'u', 'i'] as const).map(vowel => (
                <div
                  key={vowel}
                  style={{
                    padding: '12px',
                    backgroundColor: calibrationData[vowel] ? '#e8f5e8' : '#fff3cd',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: `1px solid ${calibrationData[vowel] ? '#c3e6c3' : '#ffeaa7'}`,
                  }}
                >
                  <span style={{ fontWeight: '600', color: '#495057' }}>{vowel}</span>
                  <span style={{ fontSize: '16px' }}>{calibrationData[vowel] ? '✅' : '⏳'}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveClick}
            disabled={Object.keys(calibrationData).length < 4 || isSaving}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              fontWeight: '600',
              backgroundColor: Object.keys(calibrationData).length < 4 ? '#e9ecef' : '#28a745',
              color: Object.keys(calibrationData).length < 4 ? '#6c757d' : '#fff',
              border: 'none',
              borderRadius: '12px',
              cursor: Object.keys(calibrationData).length < 4 ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
            }}
          >
            Download Calibration
          </button>

          <div style={{ fontSize: '12px', color: '#6c757d', textAlign: 'center' }}>
            Tracking: {ALL_TRACKED_LANDMARKS.length} landmarks
            <br />
            (4 face + 40 mouth)
            <br />
            <span style={{ color: '#FF0000', fontWeight: 'bold' }}>● 이마점(10번) 포함</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalibrationCapture;
