import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: 'localhost',
        port: 5173,
        strictPort: true,
        headers: {
            'Cross-Origin-Embedder-Policy': 'unsafe-none',
            'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        },
        proxy: {
            '/ws-endpoint': 'http://localhost:8080', // Change to your backend port
            '/api': 'http://localhost:8080'
        }
    },
})
