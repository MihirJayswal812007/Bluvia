import { defineConfig } from 'vite';

export default defineConfig({
    // SPA fallback: serve index.html for all routes (history mode)
    appType: 'spa',
    server: {
        port: 5173,
        strictPort: false,
    },
    build: {
        target: 'esnext',
        outDir: 'dist',
        sourcemap: false,
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    },
});
