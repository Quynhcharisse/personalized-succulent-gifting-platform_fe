import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Get backend URL from environment variable, default to localhost:8080
const BACKEND_URL = 'http://localhost:8080';

console.log('Vite config: Using backend at', BACKEND_URL);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/ws-endpoint': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('WebSocket proxy error', err);
          });
          proxy.on('open', () => {
            console.log('WebSocket connection opened');
          });
          proxy.on('close', () => {
            console.log('WebSocket connection closed');
          });
        },
      }
    }
  }
})
