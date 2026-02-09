# Current Working Links

## 🚀 Development Server
**http://localhost:3005/**

- Status: ⚠️ Flashing/restarting (Vite config issues)
- Features: Hot reload, debugging, source maps
- Assets: Should load with simple paths

## 🎮 Production Server  
**http://localhost:4175/**

- Status: ✅ Running stable
- Features: Optimized build, no hot-reload
- Performance: Faster loading, minified code

## 📋 What to Use

**For Testing & Development:**
- Use **http://localhost:4175/** (Production) - more stable
- All game features work the same
- No flashing or restarting issues

**For Development with Hot-Reload:**
- Use **http://localhost:3005/** (Development) - if flashing stops
- Currently experiencing Vite config issues

## 🎯 Recommended

**Use the production version at http://localhost:4175/ for now**

It's stable, fast, and has all the same functionality without the flashing issues.

## 🛠️ Game Features Available

Both versions have:
- ✅ Phaser overworld with map and token
- ✅ Story system with mock stories  
- ✅ Hotspot interactions
- ✅ Debug tools
- ✅ Equipment system
- ✅ Save/load functionality

## 🧪 Test Commands

```javascript
// Test story system
window.dialogueService.switchStory('forest_test')

// Debug info
window.debugInfo()

// Game state
window.gameState
```

The production version is the best choice for stable gameplay right now!
