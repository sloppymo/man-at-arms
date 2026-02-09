# Story System Test Helper

## 🧪 Quick Test Commands

After the page reloads, try these commands in the browser console:

### **Basic Story Test**
```javascript
// Switch to story (this should work now)
window.dialogueService.switchStory('forest_test')

// Check if story is available
window.inkStory

// Test story continuation
window.inkStory.Continue()

// Check if story can continue
window.inkStory.canContinue
```

### **Helper Functions**
```javascript
// Ensure story is set (if it gets lost)
window.ensureStory()

// Get current story object
window.getStory()

// Check story name
window.inkStory?._storyName
```

### **Debug Info**
```javascript
// Check available stories
Object.keys(window.dialogueService.stories)

// Check dialogue service status
window.dialogueService.getStatus()

// Full game debug
window.debugInfo()
```

## 🔧 What Was Fixed

1. **Enhanced switchStory()**: Now sets a story name property
2. **Added ensureInkStory()**: Restores window.inkStory if lost
3. **Added helper functions**: Easy access to story system
4. **Better error handling**: More detailed logging

## 📋 Expected Results

After the fix, you should see:
- ✅ `window.inkStory` persists after page reloads
- ✅ `window.inkStory.Continue()` function available
- ✅ `window.inkStory.canContinue` property available
- ✅ Story content loads correctly

## 🎯 If Issues Persist

If `window.inkStory` is still undefined:
1. Run `window.ensureStory()` to restore it
2. Run `window.dialogueService.switchStory('forest_test')` to switch again
3. Check the console for any error messages

The story system should now be more robust and reliable!
