import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // GitHub Pages deployment base path
  // Update this to match your repo name when deploying
  base: '/man-at-arms/',
  
  // Source directory
  root: 'src',
  
  // Public assets directory (relative to root)
  publicDir: '../public',
  
  // Build configuration
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
      },
    },
  },
  
  // Development server
  server: {
    port: 3000,
    open: true,
  },
  
  // Resolve aliases for cleaner imports
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/core'),
      '@systems': resolve(__dirname, 'src/systems'),
      '@scenes': resolve(__dirname, 'src/scenes'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@ink': resolve(__dirname, 'src/ink'),
    },
  },
});
