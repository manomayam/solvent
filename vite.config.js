import { resolve } from 'path';

/** @type {import('vite').UserConfig} */
export default {
  root: 'src-www',
  publicDir: '../public-www',
  resolve: {
    preserveSymlinks: true,
  },

  // 1. prevent vite from obscuring rust errors
  clearScreen: false,

  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    open: false,
  },

  // 3. to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ['VITE_', 'TAURI_'],

  build: {
    target: 'esnext',
    outDir: '../dist-www',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src-www/index.html'),
        solidos: resolve(__dirname, 'src-www/solidos/index.html'),
      },
    },
  },
};
