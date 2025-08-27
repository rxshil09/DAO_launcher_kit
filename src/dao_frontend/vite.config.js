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
    define: {
      global: 'window',
      'process.env': process.env
    },
    server: {
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
