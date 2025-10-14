import { type FunctionComponent, useState } from 'react';
import styles from './Calibration.module.css';
import CameraComponent from './Components/CameraComponent';
import Header from './Components/Header';
import Footer from './Components/Footer';
import MicIcon from './assets/mic.svg';
import { calculateRelativePosition, type Point3D } from './Components/FindPoint';

// 전역 변수로 상대 좌표와 거리 피처 저장
let globalRelativePositions: any = {};
let globalDistanceFeatures: any = {};
let isInitialCalculationDone = false; // 초기 계산 완료 여부

const Calibration: FunctionComponent = () => {
  const [relativePositions, setRelativePositions] = useState<any[]>([]);
  const [cameraReady, setCameraReady] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationCountdown, setCalibrationCountdown] = useState(0);

  // 입술 랜드마크 인덱스
  const lipIndices = [61, 78, 13, 291, 308, 14];
  // 기준점 인덱스
  const noseIndex = 0; // 코점
  const leftEyeCornerIndex = 33; // 왼쪽 눈꼬리
  const rightEyeCornerIndex = 263; // 오른쪽 눈꼬리

  // 두 점 사이의 거리 계산 함수
  const calculateDistance = (point1: Point3D, point2: Point3D): number => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    const dz = (point1.z || 0) - (point2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };

  // 캘리브레이션 시작 함수
  const startCalibration = () => {
    console.log('🎤 마이크 버튼 클릭됨 - 캘리브레이션 시작!');
    if (isCalibrating) {
      console.log('이미 캘리브레이션 중');
      return;
    }
    
    setIsCalibrating(true);
    setCalibrationCountdown(5);
    isInitialCalculationDone = false; // 재계산 가능하도록 리셋
    
    // 5초 카운트다운
    const countdownInterval = setInterval(() => {
      setCalibrationCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setIsCalibrating(false);
          setCalibrationCountdown(0);
          console.log('캘리브레이션 완료');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLandmarkResults = (results: any) => {
    // 카메라가 준비되지 않았으면 대기
    if (!cameraReady) {
      setCameraReady(true);
      return;
    }

    // 캘리브레이션 중이 아니면 처리하지 않음
    if (!isCalibrating) {
      return;
    }

    // 결과가 없거나 얼굴이 감지되지 않은 경우
    if (!results || !results.faceLandmarks || results.faceLandmarks.length === 0) {
      return;
    }

    console.log('얼굴 감지됨! 캘리브레이션 진행 중...');
    console.log('isInitialCalculationDone:', isInitialCalculationDone);

    if (!isInitialCalculationDone) {
      console.log('거리 계산 시작!');
      const landmarks = results.faceLandmarks[0];
      
      // 얼굴이 제대로 감지되었는지 확인 (랜드마크 개수 확인)
      if (landmarks.length < 468) { // MediaPipe 얼굴 랜드마크는 468개
        return;
      }
        
        // 기준점들 추출
        const nosePoint = landmarks[noseIndex]; // 코점
        const leftEyeCorner = landmarks[leftEyeCornerIndex]; // 왼쪽 눈꼬리
        const rightEyeCorner = landmarks[rightEyeCornerIndex]; // 오른쪽 눈꼬리

        if (nosePoint && leftEyeCorner && rightEyeCorner) {
          try {
            // 1. 상대 좌표 계산
            const relativePositions: any = {};
            
            // 61, 78, 13번은 코와 왼쪽 눈꼬리 기준
            [61, 78, 13].forEach(lipIndex => {
              const lipPoint = landmarks[lipIndex];
              if (lipPoint) {
                try {
                  const relativePos = calculateRelativePosition(
                    { x: lipPoint.x, y: lipPoint.y, z: lipPoint.z || 0 },
                    { x: nosePoint.x, y: nosePoint.y, z: nosePoint.z || 0 },
                    { x: leftEyeCorner.x, y: leftEyeCorner.y, z: leftEyeCorner.z || 0 }
                  );
                  relativePositions[lipIndex] = relativePos;
                     } catch (error) {
                       // 계산 실패 시 무시
                     }
              }
            });

            // 291, 308, 14번은 코와 오른쪽 눈꼬리 기준
            [291, 308, 14].forEach(lipIndex => {
              const lipPoint = landmarks[lipIndex];
              if (lipPoint) {
                try {
                  const relativePos = calculateRelativePosition(
                    { x: lipPoint.x, y: lipPoint.y, z: lipPoint.z || 0 },
                    { x: nosePoint.x, y: nosePoint.y, z: nosePoint.z || 0 },
                    { x: rightEyeCorner.x, y: rightEyeCorner.y, z: rightEyeCorner.z || 0 }
                  );
                  relativePositions[lipIndex] = relativePos;
                     } catch (error) {
                       // 계산 실패 시 무시
                     }
              }
            });

            // 전역 변수에 상대 좌표 저장
            globalRelativePositions = relativePositions;

            // 2. 거리 피처 계산
            const distanceFeatures: any = {};
            
            // d1: 61 ↔ 291 거리 (윗입술 좌우 코너 간 거리)
            const point61 = landmarks[61];
            const point291 = landmarks[291];
            if (point61 && point291) {
              distanceFeatures.d1 = calculateDistance(
                { x: point61.x, y: point61.y, z: point61.z || 0 },
                { x: point291.x, y: point291.y, z: point291.z || 0 }
              );
            }

            // d2: 입 전체 바운딩박스 가로 길이 (좌우 외곽 폭)
            const leftmostPoint = landmarks[61]; // 왼쪽 끝
            const rightmostPoint = landmarks[291]; // 오른쪽 끝
            if (leftmostPoint && rightmostPoint) {
              distanceFeatures.d2 = calculateDistance(
                { x: leftmostPoint.x, y: leftmostPoint.y, z: leftmostPoint.z || 0 },
                { x: rightmostPoint.x, y: rightmostPoint.y, z: rightmostPoint.z || 0 }
              );
            }

            // d3: 78 ↔ 308 거리 (아랫입술 좌우 코너 간 거리)
            const point78 = landmarks[78];
            const point308 = landmarks[308];
            if (point78 && point308) {
              distanceFeatures.d3 = calculateDistance(
                { x: point78.x, y: point78.y, z: point78.z || 0 },
                { x: point308.x, y: point308.y, z: point308.z || 0 }
              );
            }

            // d4: 윗입술 상하 높이 (윗입술 두께 또는 세로 길이)
            const upperLipTop = landmarks[13]; // 윗입술 위쪽
            const upperLipBottom = landmarks[14]; // 윗입술 아래쪽
            if (upperLipTop && upperLipBottom) {
              distanceFeatures.d4 = calculateDistance(
                { x: upperLipTop.x, y: upperLipTop.y, z: upperLipTop.z || 0 },
                { x: upperLipBottom.x, y: upperLipBottom.y, z: upperLipBottom.z || 0 }
              );
            }

            // d6: 13 ↔ 14 거리 (입 내부 세로 높이, 입 열림 정도)
            if (upperLipTop && upperLipBottom) {
              distanceFeatures.d6 = calculateDistance(
                { x: upperLipTop.x, y: upperLipTop.y, z: upperLipTop.z || 0 },
                { x: upperLipBottom.x, y: upperLipBottom.y, z: upperLipBottom.z || 0 }
              );
            }

            // 전역 변수에 거리 피처 저장
            globalDistanceFeatures = distanceFeatures;

            // 콘솔로 거리 피처 출력
            console.log('🎯 거리 피처 계산 완료!');
            console.log('📏 d1 (윗입술 좌우):', distanceFeatures.d1?.toFixed(3) || 'N/A');
            console.log('📏 d2 (입 전체 가로):', distanceFeatures.d2?.toFixed(3) || 'N/A');
            console.log('📏 d3 (아랫입술 좌우):', distanceFeatures.d3?.toFixed(3) || 'N/A');
            console.log('📏 d4 (윗입술 세로):', distanceFeatures.d4?.toFixed(3) || 'N/A');
            console.log('📏 d6 (입 내부 세로):', distanceFeatures.d6?.toFixed(3) || 'N/A');

            // 초기 계산 완료 표시
            isInitialCalculationDone = true;

            // 디버그용 상태 업데이트 (화면 표시용)
            const debugPositions = Object.keys(relativePositions).map(lipIndex => ({
              lipIndex: parseInt(lipIndex),
              relativePosition: relativePositions[lipIndex]
            }));
            setRelativePositions(debugPositions);
               } catch (error) {
                 isInitialCalculationDone = false; // 재시도 가능하도록
               }
        }
    }
  };

  return (
    <div className={styles.calibration}>
      <Header />

      <div className={styles.title}>
        <div className={styles.watchTheCamera}>Watch the camera</div>
        <div className={styles.pleasePronouceThese}>Please pronouce these vowels</div>
      </div>

      <div className={styles.container}>
        <div className={styles.rectangleParent}>
          <CameraComponent onResults={handleLandmarkResults} />
          <button 
            className={styles.micIcon} 
            onClick={startCalibration}
            disabled={isCalibrating}
            style={{
              background: 'none',
              border: 'none',
              cursor: isCalibrating ? 'not-allowed' : 'pointer',
              opacity: isCalibrating ? 0.5 : 1
            }}
          >
            <img src={MicIcon} alt="Start Calibration" />
          </button>
          
          {/* 캘리브레이션 상태 표시 */}
          {isCalibrating && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '20px',
              borderRadius: '10px',
              fontSize: '24px',
              fontWeight: 'bold',
              zIndex: 1000
            }}>
              <div>얼굴을 카메라에 맞춰주세요</div>
              <div style={{ fontSize: '48px', marginTop: '10px' }}>
                {calibrationCountdown}
              </div>
            </div>
          )}
        </div>
        <div className={styles.frameParent}>
          <div className={styles.wordParent}>
            <div className={styles.word}>
              <img className={styles.frameIcon} alt="" />
              <div className={styles.div}>아</div>
              <img className={styles.frameIcon} alt="" />
            </div>
            <div className={styles.brandAwarenessParent}>
              <img className={styles.brandAwarenessIcon} alt="" />
              <div className={styles.home}>[a:]</div>
            </div>
          </div>
          
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Calibration;
