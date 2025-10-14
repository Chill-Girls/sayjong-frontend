import React, { useState, /* useRef, */ useEffect } from 'react';
import { App as CameraApp } from './Components/CameraComponent';
import { calculateRelativePosition, restoreFromRelativePosition, type Point3D } from './utils/FindPoint';

// 디버깅을 위한 로그 추가
console.log('🚀 TestCalibration.tsx 로드됨');

// 전역 변수
// let globalRelativePositions: any = {};
// let globalDistanceFeatures: any = {};
// let isInitialCalculationDone = false;

const TestCalibration: React.FC = () => {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationCountdown, setCalibrationCountdown] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [landmarks, setLandmarks] = useState<any[] | null>(null);
  const [calibratedLips, setCalibratedLips] = useState<any[]>([]);
  const [showAnchoredPoints, setShowAnchoredPoints] = useState(false);
  const [currentAnchoredPoints, setCurrentAnchoredPoints] = useState<any[]>([]);

  // 키보드 이벤트 추가
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        console.log('🎤 키보드로 캘리브레이션 시작!');
        startCalibration();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // 두 점 사이의 거리 계산 함수
  const calculateDistance = (point1: Point3D, point2: Point3D): number => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    const dz = (point1.z || 0) - (point2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };

  // 고정점의 현재 위치 계산
  const calculateCurrentAnchoredPoints = (detectedLandmarks: any[]) => {
    try {
      // 기준점들
      const noseIndex = 0; // 코점
      const leftEyeCornerIndex = 33; // 왼쪽 눈꼬리
      const rightEyeCornerIndex = 263; // 오른쪽 눈꼬리

      const nosePoint = detectedLandmarks[noseIndex];
      const leftEyeCorner = detectedLandmarks[leftEyeCornerIndex];
      const rightEyeCorner = detectedLandmarks[rightEyeCornerIndex];

      if (nosePoint && leftEyeCorner && rightEyeCorner) {
        const currentPoints: any[] = [];

        calibratedLips.forEach(calibratedLip => {
          const { index, relativePos } = calibratedLip;
          
          try {
            let restoredPoint;
            
            // 61번은 코와 왼쪽 눈꼬리 기준으로 복원
            if (index === 61) {
              restoredPoint = restoreFromRelativePosition(
                relativePos,
                { x: nosePoint.x, y: nosePoint.y, z: nosePoint.z || 0 },
                { x: leftEyeCorner.x, y: leftEyeCorner.y, z: leftEyeCorner.z || 0 }
              );
            }
            // 291번은 코와 오른쪽 눈꼬리 기준으로 복원
            else if (index === 291) {
              restoredPoint = restoreFromRelativePosition(
                relativePos,
                { x: nosePoint.x, y: nosePoint.y, z: nosePoint.z || 0 },
                { x: rightEyeCorner.x, y: rightEyeCorner.y, z: rightEyeCorner.z || 0 }
              );
            }

            if (restoredPoint) {
              currentPoints.push({
                index,
                x: restoredPoint.x,
                y: restoredPoint.y,
                z: restoredPoint.z
              });
            }
          } catch (error) {
            console.error(`고정점 ${index} 계산 실패:`, error);
          }
        });

        setCurrentAnchoredPoints(currentPoints);
      }
    } catch (error) {
      console.error('고정점 위치 계산 오류:', error);
    }
  };

  // 캘리브레이션 시작
  const startCalibration = () => {
    console.log('🎤 캘리브레이션 시작!');
    console.log('📊 현재 상태:', { 
      isCalibrating, 
      cameraReady, 
      landmarks: landmarks?.length || 0,
      calibratedLips: calibratedLips.length 
    });
    
    setIsCalibrating(true);
    setCalibrationCountdown(1);
    // isInitialCalculationDone = false; // 리셋
    setCalibratedLips([]); // 캘리브레이션 시작 시 기존 데이터 초기화
    
    // 1초 카운트다운
    const countdownInterval = setInterval(() => {
      setCalibrationCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setIsCalibrating(false);
          setCalibrationCountdown(0);
          console.log('✅ 캘리브레이션 완료');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 얼굴 랜드마크 처리
  const handleLandmarksDetected = (detectedLandmarks: any[] | null) => {
    console.log('🔍 랜드마크 감지됨:', detectedLandmarks ? detectedLandmarks.length : 'null');
    
    // 카메라 준비 확인
    if (!cameraReady) {
      setCameraReady(true);
      console.log('📹 카메라 준비 완료');
    }

    // 랜드마크 저장 (468개)
    if (detectedLandmarks && detectedLandmarks.length >= 468) {
      setLandmarks(detectedLandmarks);
      console.log('✅ 얼굴 감지됨! 랜드마크 개수:', detectedLandmarks.length);
      
      // 고정점이 있고 표시가 활성화된 경우, 현재 위치 계산
      if (calibratedLips.length > 0 && showAnchoredPoints) {
        calculateCurrentAnchoredPoints(detectedLandmarks);
      }
    } else {
      setLandmarks(null);
      console.log('❌ 얼굴 감지 안됨');
    }

    // 캘리브레이션 중이 아니면 무시
    if (!isCalibrating) {
      return;
    }

    if (!detectedLandmarks || detectedLandmarks.length < 468) {
      return;
    }

    console.log('얼굴 감지됨! 캘리브레이션 진행 중...');

    // if (!isInitialCalculationDone) {
      // 얼굴 랜드마크 개수 확인
      if (detectedLandmarks.length < 468) {
        return;
      }

      // 기준점들
      const noseIndex = 0; // 코점
      const leftEyeCornerIndex = 33; // 왼쪽 눈꼬리
      const rightEyeCornerIndex = 263; // 오른쪽 눈꼬리

      const nosePoint = detectedLandmarks[noseIndex];
      const leftEyeCorner = detectedLandmarks[leftEyeCornerIndex];
      const rightEyeCorner = detectedLandmarks[rightEyeCornerIndex];

      if (nosePoint && leftEyeCorner && rightEyeCorner) {
        try {
          console.log('거리 계산 시작!');
          
          // 1. 상대 좌표 계산
          const relativePositions: any = {};
          
          // 입술 끝점만 캘리브레이션 (61, 291번)
          // const lipCornerIndices = [61, 291]; // 입술 끝점

          // 61번은 코와 왼쪽 눈꼬리 기준
          const point61 = detectedLandmarks[61];
          if (point61) {
            try {
              const relativePos = calculateRelativePosition(
                { x: point61.x, y: point61.y, z: point61.z || 0 },
                { x: nosePoint.x, y: nosePoint.y, z: nosePoint.z || 0 },
                { x: leftEyeCorner.x, y: leftEyeCorner.y, z: leftEyeCorner.z || 0 }
              );
              relativePositions[61] = relativePos;
            } catch (error) {
              console.error('61번 랜드마크 계산 실패:', error);
            }
          }

          // 291번은 코와 오른쪽 눈꼬리 기준
          const point291 = detectedLandmarks[291];
          if (point291) {
            try {
              const relativePos = calculateRelativePosition(
                { x: point291.x, y: point291.y, z: point291.z || 0 },
                { x: nosePoint.x, y: nosePoint.y, z: nosePoint.z || 0 },
                { x: rightEyeCorner.x, y: rightEyeCorner.y, z: rightEyeCorner.z || 0 }
              );
              relativePositions[291] = relativePos;
            } catch (error) {
              console.error('291번 랜드마크 계산 실패:', error);
            }
          }

          // 전역 변수에 상대 좌표 저장
          // globalRelativePositions = relativePositions;

          // 2. 거리 피처 계산 (입술 끝점 간 거리만)
          const distanceFeatures: any = {};
          
          // 입술 끝점 간 거리 (61 ↔ 291)
          if (point61 && point291) {
            distanceFeatures.lipCornerDistance = calculateDistance(
              { x: point61.x, y: point61.y, z: point61.z || 0 },
              { x: point291.x, y: point291.y, z: point291.z || 0 }
            );
          }

          // 전역 변수에 거리 피처 저장
          // globalDistanceFeatures = distanceFeatures;

          // 콘솔로 거리 피처 출력
          console.log('🎯 입술 끝점 캘리브레이션 완료!');
          console.log('📏 입술 끝점 간 거리:', distanceFeatures.lipCornerDistance?.toFixed(3) || 'N/A');
          console.log('📍 캘리브레이션된 상대 위치:', relativePositions);

          // 캘리브레이션된 입술 포인트 저장
          const calibratedLipPoints = Object.keys(relativePositions).map(lipIndex => ({
            index: parseInt(lipIndex),
            relativePos: relativePositions[lipIndex]
          }));
          setCalibratedLips(calibratedLipPoints);
          setShowAnchoredPoints(true); // 고정점 표시 활성화

          // isInitialCalculationDone = true;
        } catch (error) {
          console.error('계산 오류:', error);
          // isInitialCalculationDone = false;
        }
      }
    // }
  };

  return (
    <div style={{ 
      fontFamily: 'helvetica, arial, sans-serif',
      margin: '2em',
      color: '#3d3d3d'
    }}>
      <h1 style={{ 
        fontStyle: 'italic',
        color: '#007f8b'
      }}>
        Face landmark detection using the MediaPipe FaceLandmarker task
      </h1>
      
      <section style={{ 
        opacity: 1,
        transition: 'opacity 500ms ease-in-out'
      }}>
        <h2>Demo: Webcam continuous face landmarks detection</h2>
        <p>
          Hold your face in front of your webcam to get real-time face landmarker detection.<br/>
          Click <b>enable webcam</b> below and grant access to the webcam if prompted.
        </p>

        <div style={{ 
          position: 'relative',
          float: 'left',
          width: '48%',
          margin: '2% 1%',
          cursor: 'pointer'
        }}>
          <div style={{ 
            position: 'relative',
            width: '1280px',
            height: '720px',
            border: '2px solid #333'
          }}>
            <CameraApp 
              onLandmarksDetected={handleLandmarksDetected} 
              anchoredPoints={showAnchoredPoints ? currentAnchoredPoints : undefined}
              width={640}
              height={480}
            />
          </div>
        </div>

               {/* 캘리브레이션 버튼 */}
               <button
                 onClick={startCalibration}
                 disabled={isCalibrating}
                 style={{
                   margin: '10px',
                   padding: '10px 20px',
                   background: isCalibrating ? '#ccc' : '#007f8b',
                   color: 'white',
                   border: 'none',
                   borderRadius: '4px',
                   cursor: isCalibrating ? 'not-allowed' : 'pointer',
                   opacity: isCalibrating ? 0.5 : 1,
                   fontSize: '16px',
                   fontWeight: 'bold'
                 }}
               >
                 {isCalibrating ? '캘리브레이션 중...' : '입 꼬리 캘리브레이션'}
               </button>

               {/* 고정점 표시 토글 버튼 */}
               {calibratedLips.length > 0 && (
                 <button
                   onClick={() => setShowAnchoredPoints(!showAnchoredPoints)}
                   style={{
                     margin: '10px',
                     padding: '10px 20px',
                     background: showAnchoredPoints ? '#28a745' : '#6c757d',
                     color: 'white',
                     border: 'none',
                     borderRadius: '4px',
                     cursor: 'pointer',
                     fontSize: '16px',
                     fontWeight: 'bold'
                   }}
                 >
                   {showAnchoredPoints ? '고정점 숨기기' : '고정점 표시'}
                 </button>
               )}

               {/* 캘리브레이션 상태 정보 */}
               {calibratedLips.length > 0 && (
                 <div style={{
                   margin: '10px',
                   padding: '15px',
                   background: '#f8f9fa',
                   border: '1px solid #dee2e6',
                   borderRadius: '4px',
                   fontSize: '14px'
                 }}>
                   <h3 style={{ margin: '0 0 10px 0', color: '#007f8b' }}>캘리브레이션 완료!</h3>
                   <p style={{ margin: '5px 0' }}>✅ 입술 끝점 {calibratedLips.length}개 캘리브레이션됨</p>
                   <p style={{ margin: '5px 0' }}>📍 고정점 표시: {showAnchoredPoints ? '활성화' : '비활성화'}</p>
                   <p style={{ margin: '5px 0', fontSize: '12px', color: '#6c757d' }}>
                     캘리브레이션된 점들은 얼굴이 움직여도 상대적 위치가 유지됩니다.
                   </p>
                 </div>
               )}

        {/* 캘리브레이션 상태 표시 */}
        {isCalibrating && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '30px',
            borderRadius: '15px',
            fontSize: '24px',
            fontWeight: 'bold',
            zIndex: 1000,
            textAlign: 'center'
          }}>
            <div>얼굴을 카메라에 맞춰주세요</div>
            <div style={{ fontSize: '48px', marginTop: '10px' }}>
              {calibrationCountdown}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default TestCalibration;