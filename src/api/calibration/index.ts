import axios from 'axios';
import type { CalibrationDataResponse } from './types';

/**
 * (GET /api/calibration/my-data)
 * 서버에서 현재 로그인한 사용자의 캘리브레이션 데이터를 불러옵니다.
 *
 * @param token - 사용자 인증 JWT 토큰
 * @returns {Promise<CalibrationDataResponse>} 캘리브레이션 데이터 (JSON 문자열 2개)
 */
export async function loadMyCalibrationData(token: string): Promise<CalibrationDataResponse> {
  const API_ENDPOINT = '/api/calibration/my-data';

  try {
    const response = await axios.get<CalibrationDataResponse>(API_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // 성공 시 { vowelTargetsJson, rawCalibrationJson } 객체 반환
    return response.data;
  } catch (error) {
    console.error('캘리브레이션 데이터 로드 API 호출 실패:', error);
    // 에러를 그대로 상위로 전달하여 컴포넌트가 처리하도록 함
    throw error;
  }
}
