import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import SelectMusic from './pages/SelectMusic.tsx';
import SelectMode from './pages/SelectMode.tsx';
import LinePractice from './pages/LinePractice.tsx';
import SingAlong from './pages/SingAlong.tsx';
import CalibrationCapture from './pages/CalibrationCapture.tsx';
import Login from './pages/Login.tsx';
import { Toaster } from 'react-hot-toast';
import { ModeProvider } from './constants/ModeContext.tsx';
import { RecordingProvider } from './constants/RecordingContext.tsx';
import { loadMyCalibrationData } from './api/calibration';

// 임시 History 페이지
// eslint-disable-next-line react-refresh/only-export-components
function HistoryPage() {
  return (
    <div style={{ padding: '80px', textAlign: 'center' }}>
      <h2>History Page (구현 예정)</h2>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
function AppRouter() {
  // 사용자 데이터 로딩 state 추가
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);

  // AppRouter가 마운트될 때 (앱 실행 시)
  useEffect(() => {
    const fetchUserData = async () => {
      // 토큰 가져오기
      const token = localStorage.getItem('accessToken');

      if (token) {
        // 토큰이 있으면 캘리브레이션 데이터 로드 시도
        try {
          console.log('App loading: 캘리브레이션 데이터 로드 시도...');
          const data = await loadMyCalibrationData(token);

          // [성공]localStorage에 저장
          localStorage.setItem('target_vowels', data.vowelTargetsJson);
          localStorage.setItem('vowel_calibration', data.rawCalibrationJson);
          console.log('캘리브레이션 데이터를 서버에서 localStorage로 로드했습니다.');
        } catch (error: any) {
          // [실패] 에러 처리
          if (error.response && error.response.status === 404) {
            console.log('저장된 캘리브레이션 데이터가 없습니다. (404)');
            localStorage.removeItem('target_vowels');
            localStorage.removeItem('vowel_calibration');
          } else if (error.response && error.response.status === 401) {
            console.log('인증 만료(401).');
          } else {
            console.error('캘리브레이션 데이터 로드 중 알 수 없는 오류:', error);
          }
        }
      } else {
        console.log('로그인되지 않음. 캘리브레이션 데이터를 로드하지 않습니다.');
      }
      setIsUserDataLoading(false); //데이터 로드 시도 완료
    };

    fetchUserData();
  }, []); // [] = 앱 실행 시 딱 한 번만 실행

  // 캘리브레이션 데이터 로드 완료 전까지 로딩 화면 표시
  if (isUserDataLoading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <h2>Loading user data...</h2>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/home" />} />
      <Route path="/home" element={<SelectMusic />} />
      <Route path="/lesson" element={<Navigate replace to="/home" />} />
      <Route path="/lesson/:songId" element={<SelectMode />} />

      <Route path="/lesson/:songId/syllable/:page" element={<App />} />
      <Route path="/lesson/:songId/line/:page" element={<LinePractice />} />
      <Route path="/lesson/:songId/sing" element={<SingAlong />} />

      <Route path="/history" element={<HistoryPage />} />
      <Route path="/calibration" element={<CalibrationCapture />} />

      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ModeProvider>
        <RecordingProvider>
          <AppRouter />
          <Toaster position="top-right" reverseOrder={false} />
        </RecordingProvider>
      </ModeProvider>
    </BrowserRouter>
  </StrictMode>,
);
