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
    port: 3005,
    open: true,
    watch: {
      usePolling: true
    },
    fs: {
      // Restrict file watching to only necessary directories to avoid EMFILE errors
      allow: [
        resolve(__dirname, 'src'),
        resolve(__dirname, 'public'),
        resolve(__dirname, 'package.json'),
        resolve(__dirname, 'vite.config.js')
      ],
      // Ignore directories with many files that don't need watching
      deny: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.md',
        '**/INK_SYSTEM_OPTIMIZATION_PROMPT.md',
        '**/ARTWORK_ASSIGNMENT_PROMPT.md',
        '**/ARTWORK_EVALUATION_PROMPT.md',
        '**/ARTWORK_EVALUATION_REPORT.md',
        '**/DALLE_ART_STYLE_PROMPT.md',
        '**/DALLE_PROMPTS_SCENES.md',
        '**/DALLE_PROMPT_BURN_LINE.md',
        '**/NEW_ARTWORK_PROMPTS.md',
        '**/PHASE0-INSTRUCTIONS.md',
        '**/PHASE6_VERIFICATION.md',
        '**/README.md',
        '**/REFACTORING_BENEFITS.md',
        '**/REFACTORING_PLAN.md',
        '**/REFACTORING_PROMPT.md',
        '**/REFACTORING_VERIFICATION_PROMPT.md',
        '**/REFINED_GPT5_PROMPT.md',
        '**/TESTING_REPORT.md',
        '**/UPGRADE_COMPLETE.md',
        '**/VERIFICATION_PROMPT.md',
        '**/VERIFICATION_REPORT.md',
        '**/VERIFICATION_REPORT_COMPREHENSIVE.md',
        '**/GITHUB_COMPARISON.md',
        '**/INK_STRUCTURE_FIX_COMPLETE.md',
        '**/INK_SYSTEM_OPTIMIZATION_PROMPT.md',
        '**/INK_TEST_SUITE_README.md',
        '**/INK_VALIDATION_REPORT.md',
        '**/NARRATIVE_CONTINUITY_ANALYSIS_PROMPT.md',
        '**/NARRATIVE_CONTINUITY_ANALYSIS_REPORT.md'
      ]
    }
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
