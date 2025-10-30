import { StrictMode } from 'react';
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
import { ModeProvider } from './context/ModeContext';

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
        <AppRouter />
        <Toaster position="top-right" reverseOrder={false} />
      </ModeProvider>
    </BrowserRouter>
  </StrictMode>,
);
