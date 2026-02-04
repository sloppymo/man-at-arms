# Pre-Test Code Review

## Potential Issues Found

### 1. ⚠️ ReturnScene Fallback Could Be 'start' (Line 1889)

**Location:** `runSkirmish()` function, line 1889

**Issue:**
```javascript
returnScene: gameState.randomEncounter.returnScene || (typeof scenes !== 'undefined' && scenes['march_through_normandy_1'] ? 'march_through_normandy_1' : 'start')
```

If `randomEncounter.returnScene` is not set AND `march_through_normandy_1` doesn't exist, this falls back to `'start'`, which is an invalid returnScene according to Test A2.

**Mitigation:** 
- `getPostSkirmishNextScene()` will catch this and use its own fallback
- But it's better to fix the source

**Recommendation:** Use the same fallback logic as `getPostSkirmishNextScene()`:
```javascript
const fallback = (typeof scenes !== 'undefined' && scenes['march_through_normandy_1'] ? 'march_through_normandy_1' : 'start');
returnScene: gameState.randomEncounter?.returnScene || fallback
```

### 2. ✅ Guard Logic Looks Correct

**Location:** Line 16920

The guard `if (gameState.currentScene !== 'skirmish_roadside_resolve')` is in place and should prevent double-insertion.

**Expected Console Output:**
- When exiting resolve: `[QA] SKIPPED global insertion pipeline (exiting skirmish_roadside_resolve)`
- When exiting other scenes: `[QA] Running global insertion pipeline from: <scene> → <nextScene>`

### 3. ✅ ReturnScene Validation Logic

**Location:** `getPostSkirmishNextScene()`, line 1905

The function correctly filters out:
- `skirmish_roadside_resolve`
- `skirmish_roadside`
- `start`
- `character_creation`
- `quick_start_review`

**Note:** It doesn't check for `skirmish_roadside_mud` or `skirmish_roadside_lane` in the invalid list, but those should never be in `returnScene` anyway since they're entry scenes, not return targets.

### 4. ⚠️ Missing Variant Scenes in Invalid List

**Location:** `getPostSkirmishNextScene()`, line 1905

The invalid list should also include the variant skirmish entry scenes for completeness:
- `skirmish_roadside_mud`
- `skirmish_roadside_lane`

**Recommendation:** Add them to the invalid check (defensive programming).

---

## Test Execution Checklist

### Before Running Tests:

1. **Open browser console** (F12)
2. **Load the game** (man-at-arms.html)
3. **Enable debug mode:**
   ```javascript
   qaEnableDebug()
   ```

### Test 1: Automated Routing Suite (2 min)

**Run:**
```javascript
qaRunRoutingTests()
```

**Expected Output:**
- ✅ All validations pass
- ✅ No warnings about invalid returnScene
- ✅ No warnings about resolve bouncing

**If you see errors, note:**
- Which validation failed
- The exact console output
- Current scene when test was run

### Test 2: Manual Save/Load Matrix

**Follow QA_TESTING_GUIDE.md Test B1**

**Key things to watch for:**
- After reload, are you on the expected scene?
- Do all buttons/choices still work?
- Is `lastSkirmish` data preserved correctly?
- Does Tempo Strike overlay handle reload gracefully?

### Test 3: 5 Skirmishes Play Pass

**Play naturally, mix strategies:**
- Some Press, some Hold, some Drive
- Sometimes Skip timing, sometimes try for +2
- Let campfires appear naturally

**Watch for:**
- Any routing loops (bouncing between scenes)
- Campfire frequency (shouldn't feel like every other scene)
- Tempo Strike feeling optional vs mandatory
- Meter economy (wear/exertion should be manageable)

---

## Quick Fixes to Apply Before Testing

If you want to fix the potential issues before testing:

1. **Fix returnScene fallback** (line 1889)
2. **Add variant scenes to invalid list** (line 1905)

Or test first and see if these actually cause problems in practice.
