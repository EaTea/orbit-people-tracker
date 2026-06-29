import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/orbit-people-tracker/',
  plugins: [react()],
})
