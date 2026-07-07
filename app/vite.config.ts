import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // 빌드 결과물을 어느 폴더에 놓아도 동작하게 상대 경로 사용
  base: './',
  plugins: [react()],
})
