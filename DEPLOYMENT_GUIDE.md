# Man-at-Arms Deployment Guide

## Overview

The Man-at-Arms game is now fully modernized and ready for deployment! This guide covers both local development and production deployment.

## Quick Start

### Development Server
```bash
npm run dev
# → http://localhost:3005/man-at-arms/
```

### Local Production Preview
```bash
npm run preview-dev
# → http://localhost:4174/
```

### Production Build (GitHub Pages)
```bash
npm run build
# → Creates ./dist/ folder for deployment
```

## Deployment Options

### 1. GitHub Pages (Recommended)

The production build is configured for GitHub Pages deployment:

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages:**
   - Push changes to your repository
   - Enable GitHub Pages in repository settings
   - Select "Deploy from a branch" and choose `main` branch with `/ (root)` folder
   - OR use GitHub Actions for automatic deployment

3. **Access URL:**
   ```
   https://[username].github.io/man-at-arms/
   ```

### 2. Static Hosting (Netlify, Vercel, etc.)

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder** to your hosting provider

3. **Configure base path** if needed (update `vite.config.js`)

### 3. Local Testing

For local testing of the production build:

```bash
npm run preview-dev
```

This creates a development build with root base path for local preview.

## File Structure

```
man-at-arms/
├── src/                    # Modern ES6 source code
├── public/                 # Static assets (stories, images)
├── dist/                   # Production build (GitHub Pages)
├── dist-dev/               # Development build (local preview)
├── js/                     # Legacy compatibility (read-only)
└── package.json            # Dependencies and scripts
```

## Build Configurations

### Production Build (`npm run build`)
- **Base path:** `/man-at-arms/` (for GitHub Pages)
- **Output:** `./dist/`
- **Optimization:** Minified, source maps included
- **Asset paths:** Absolute paths for subdirectory deployment

### Development Build (`npm run build-dev`)
- **Base path:** `/` (for local preview)
- **Output:** `./dist-dev/`
- **Optimization:** Same as production but different base path
- **Asset paths:** Root-relative paths

## Environment Variables

The build system automatically handles different environments:

- **Development:** Uses root base path for local testing
- **Production:** Uses `/man-at-arms/` base path for GitHub Pages

## Asset Loading

All assets are properly configured:

- **Stories:** `/public/stories/` → `/stories/` in production
- **Overworld images:** `/public/overworld/` → `/overworld/` in production
- **UI assets:** `/public/` → `/` in production

## Troubleshooting

### 404 Errors on Assets
- Check that the `base` path in `vite.config.js` matches your deployment URL
- For GitHub Pages, ensure repository name matches the base path

### Phaser Not Loading
- Verify that `/overworld/map.png` and `/overworld/token.png` are accessible
- Check browser console for asset loading errors

### Story System Not Working
- Ensure `/stories/forest_test.json` and `/stories/overworld/forest_test.json` are accessible
- Check that Ink.js CDN loads correctly

### White Screen on Load
- Check browser console for JavaScript errors
- Verify that the main bundle loads correctly
- Ensure all dependencies are available

## Performance Notes

- **Bundle size:** ~1.6MB (includes Phaser.js and Ink.js)
- **Load time:** Optimized with code splitting
- **Source maps:** Included for debugging
- **Asset compression:** Gzip compression reduces size to ~380KB

## Testing Before Deployment

Always test locally before deploying:

```bash
# Test development server
npm run dev

# Test production preview
npm run preview-dev

# Test story loading
# Open browser console and run:
window.dialogueService.switchStory('forest_test')

# Test Phaser integration
window.testPhaserIntegration && window.testPhaserIntegration()
```

## Deployment Checklist

- [ ] Run `npm run build` successfully
- [ ] Test local preview with `npm run preview-dev`
- [ ] Verify all assets load without 404 errors
- [ ] Test story system functionality
- [ ] Test Phaser overworld integration
- [ ] Check browser console for errors
- [ ] Deploy `dist/` folder to hosting
- [ ] Test live deployment

## Success Criteria

✅ Game loads without errors
✅ All assets (images, stories) load correctly
✅ Story system works (can switch between stories)
✅ Phaser overworld functions (movement, hotspots)
✅ Equipment system accessible
✅ Save/load functionality works
✅ No console errors
✅ Responsive design works on mobile/desktop

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify asset paths match your deployment URL
3. Ensure all dependencies are loaded (Ink.js CDN)
4. Test with the development server first

The game is fully functional and ready for production deployment! 🎉
