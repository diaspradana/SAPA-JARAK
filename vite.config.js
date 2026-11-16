import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // public/ is Laravel's web root (index.php + built assets), not a Vite static dir.
  // Leaving the default made every build copy stale bundles from public/assets back into dist/.
  publicDir: false,
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    open: false,
    watch: {
      usePolling: true
    },
    proxy: {
      '/api': process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
      '/storage': process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000'
    }
  }
})