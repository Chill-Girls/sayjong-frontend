import { useState, useEffect } from 'react';
import { loadMyCalibrationData } from '../api/calibration';
import type { CalibrationDataResponse } from '../api/calibration/types';

/**
 * 사용자의 캘리브레이션 데이터를 로드하는 훅
 */
export function useCalibrationData() {
  const [data, setData] = useState<CalibrationDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState<boolean>(false);

  useEffect(() => {
    const fetchCalibrationData = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        // console.log('로그인되지 않음. 캘리브레이션 데이터를 로드하지 않습니다.');
        setLoading(false);
        return;
      }

      try {
        // console.log('App loading: 캘리브레이션 데이터 로드 시도...');
        const calibrationData = await loadMyCalibrationData(token);

        // localStorage에 저장
        localStorage.setItem('target_vowels', calibrationData.vowelTargetsJson);
        localStorage.setItem('vowel_calibration', calibrationData.rawCalibrationJson);
        // console.log('캘리브레이션 데이터를 서버에서 localStorage로 로드했습니다.');

        setData(calibrationData);
        setError(null);
      } catch (error: any) {
        setIsAuthError(false);
        // 에러 처리
        if (error.response && error.response.status === 404) {
          // console.log('저장된 캘리브레이션 데이터가 없습니다. (404)');
          localStorage.removeItem('target_vowels');
          localStorage.removeItem('vowel_calibration');
          setError(null); // 404는 에러로 처리하지 않음
        } else if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          setError('인증이 만료되었습니다.');
          setIsAuthError(true);
        } else {
          setError('캘리브레이션 데이터를 로드하는 데 실패했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCalibrationData();
  }, []);

  return { data, loading, error, isAuthError };
}
