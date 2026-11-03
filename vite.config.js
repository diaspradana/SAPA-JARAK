import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // public/ is Laravel's web root (index.php + built assets), not a Vite static dir.
  // Leaving the default made every build copy stale bundles from public/assets back into dist/.
  publicDir: false,
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api': 'http://localhost:8000',
      '/storage': 'http://localhost:8000'
    }
  }
})