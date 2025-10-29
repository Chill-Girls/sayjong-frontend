import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // '/api'로 시작하는 모든 요청을
      '/api': {
        // 백엔드 서버 'http://localhost:8080'으로 대신 보내줌
        target: 'http://localhost:8080',

        // CORS 오류를 피하기 위해 'origin' 헤더를 변경
        changeOrigin: true,
      },
    },
  },
});
