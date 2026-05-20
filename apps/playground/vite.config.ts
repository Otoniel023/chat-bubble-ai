import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        // Use the "source" export condition so Vite resolves
        // the library's raw TypeScript source (no build needed)
        conditions: ['source'],
        alias: {
            // Ensure the playground uses the same React instance as the library
            'react': path.resolve(__dirname, '../../node_modules/react'),
            'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
        },
    },
    server: {
        port: 3000,
        open: true,
        proxy: {
            '/api/ml': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
});
