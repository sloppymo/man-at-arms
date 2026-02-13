import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  base: './', // Use relative paths for static server
  
  server: {
    port: 3005,
    open: false,
    watch: null
  },
  
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/index.html'),
    },
  },
  
  preview: {
    port: 4174,
    host: true,
  }
});
