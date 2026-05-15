import { defineConfig } from 'vite';

export default defineConfig({
  base: '/trade-adventure-web/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  publicDir: 'assets'
});
