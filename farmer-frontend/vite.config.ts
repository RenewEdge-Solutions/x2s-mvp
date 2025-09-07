import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const hmrPort = Number(process.env.VITE_HMR_PORT || env.VITE_HMR_PORT || '24679');
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
        host: 'localhost'
      },
  proxy: {}
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
