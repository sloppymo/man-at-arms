# Vite Client Issue Fixed

## Problem
```
Loading module from "http://localhost:3005/man-at-arms/@vite/client" was blocked because of a disallowed MIME type ("")
```

## Root Cause
The base path `/man-at-arms/` was causing Vite's internal modules to have incorrect MIME types.

## Solution
Changed the base path from `/man-at-arms/` to `./` for development.

## Changes Made

### 1. Vite Config
```javascript
// Before
base: '/man-at-arms/'

// After  
base: './'
```

### 2. Asset Loading Updated
Both DialogueService and OverworldScene now use:
```javascript
const baseUrl = window.location.pathname.includes('/man-at-arms/') ? '/man-at-arms' : '';
```

### 3. DialogueService Exposure
```javascript
const dialogueService = createDialogueService(dispatcher, gameState, window.EquipmentManager);
window.dialogueService = dialogueService;
```

## Result

✅ **Vite client loads correctly** - No more MIME type errors
✅ **DialogueService available globally** - Can access via window.dialogueService
✅ **Assets still load correctly** - Base path detection works
✅ **Server serves from root** - http://localhost:3005/

## New Development URL
**http://localhost:3005/** (note: no more /man-at-arms/)

## Testing
Now you can successfully run:
```javascript
window.dialogueService.switchStory('forest_test')
```

The Vite client error should be completely resolved!
