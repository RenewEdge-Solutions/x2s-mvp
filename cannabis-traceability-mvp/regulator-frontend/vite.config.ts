import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Backend should always be on port 3001 as per README
  const target = process.env.VITE_API_URL || env.VITE_API_URL || 'http://localhost:3001';
  return {
    plugins: [
      react({
        jsxRuntime: 'automatic'
      })
    ],
    resolve: {
      alias: {
        'react': 'react',
        'react-dom': 'react-dom'
      }
    },
    optimizeDeps: {
      include: [
        'react', 
        'react-dom', 
        'react/jsx-runtime'
      ],
      exclude: ['lucide-react']
    },
    server: {
      host: true,
      port: 5000,
      strictPort: true,
      hmr: {
        overlay: true,
        port: 24678
      },
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: false,
          // Don't rewrite the path since backend now has global /api prefix
        }
      }
    },
    build: {
      sourcemap: mode === 'development',
      minify: mode === 'production',
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    },
    clearScreen: false,
    logLevel: 'info'
  };
});
