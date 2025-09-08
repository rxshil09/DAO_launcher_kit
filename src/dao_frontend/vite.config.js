import { fileURLToPath, URL } from 'url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import environment from 'vite-plugin-environment';
import path from 'path';

export default defineConfig(({ command, mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, path.resolve(__dirname), '');
  
  return {
    plugins: [
      react(),
      environment('all', { prefix: 'VITE_' }),
    ],
    optimizeDeps: {
      force: mode === 'development', // Force optimization in dev mode
      esbuildOptions: {
        define: {
          global: 'globalThis'
        },
        plugins: [
          {
            name: 'did-loader',
            setup(build) {
              build.onLoad({ filter: /\.did$/ }, async (args) => ({
                contents: '',
                loader: 'js'
              }))
            }
          }
        ]
      }
    },
    cacheDir: process.platform === 'win32' && process.env.WSL_DISTRO_NAME 
      ? path.resolve(__dirname, '.vite-cache')  // Use custom cache dir for WSL
      : 'node_modules/.vite',
    define: {
      global: 'window',
      'process.env': process.env
    },
    server: {
      port: 5173,
      host: '0.0.0.0', // Allow external connections
      watch: {
        usePolling: true, // Enable polling for WSL file watching
        interval: 1000,
      },
      proxy: {
        '/api': {
          target: 'http://localhost:4943',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            agent: ['@dfinity/agent', '@dfinity/auth-client'],
          },
        },
      },
      minify: mode === 'production' ? 'esbuild' : false,
      sourcemap: mode !== 'production',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@declarations': path.resolve(__dirname, '../../src/declarations'),
      },
    },
    test: {
      environment: 'jsdom',
    },
  };
});
