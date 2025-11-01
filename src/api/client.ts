import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

// 요청에 accessToken 자동 부착
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config?.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// 401 시 토큰 삭제 후 로그인으로 리다이렉트
apiClient.interceptors.response.use(
  res => res,
  (error) => {
    const originalRequest = error?.config;
    if (error?.response?.status === 401) {
      // 클라이언트에 저장된 토큰 제거
      localStorage.removeItem('accessToken');
      
      // 간단하게 로그인 페이지로 이동
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);