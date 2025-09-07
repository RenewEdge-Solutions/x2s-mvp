import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = process.env.VITE_API_URL || env.VITE_API_URL || '';
  const hmrPort = Number(process.env.VITE_HMR_PORT || env.VITE_HMR_PORT || '24678');
  return {
    base: './',
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
      port: 9000,
      strictPort: true,
      hmr: {
        overlay: true,
  port: hmrPort,
  clientPort: hmrPort,
  host: 'localhost',
  protocol: 'ws'
      },
      proxy: {},
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        's2s-mvp.renewedge-solutions.com',
        // internal container / upstream names that may appear as Host via nginx
        'welcome_app',
        'welcome-frontend'
      ]
    },
    preview: {
      host: '0.0.0.0',
      port: 9000,
      // allow the container/service hostname plus expected public hostnames
      allowedHosts: [
        'welcome-frontend',
        'localhost',
        '127.0.0.1',
        's2s-mvp.renewedge-solutions.com',
        'auth.renewedge-solutions.com'
      ]
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
