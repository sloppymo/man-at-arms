# QA Testing Guide - Roguelike Tension Loop

## Quick Start

1. **Enable debug mode for diagnostic logs:**
   ```javascript
   qaEnableDebug()
   ```

2. **Run quick routing validation:**
   ```javascript
   qaRunRoutingTests()
   ```

3. **Individual test helpers:**
   - `qaValidateReturnScene()` - Check returnScene validity
   - `qaValidateResolveRouting()` - Check resolve exit routing
   - `qaCheckDoubleInsertionGuard()` - Verify guard is active

---

## Test A1: Skirmish Resolve Exit Routing

### Steps:
1. Enable debug: `qaEnableDebug()`
2. Start new game → Quick Start
3. Force skirmish (debug button or natural)
4. Choose any action → Complete Tempo Strike → Resolve screen
5. **Before clicking Continue**, run: `qaValidateResolveRouting()`
6. Click "Continue"
7. **Check console** for next scene value
8. **Expected:** Next scene is travel/campfire/encounter, NOT `skirmish_roadside_resolve`

### Test Matrix:
- [ ] Roadside variant → Continue
- [ ] Mud variant → Continue  
- [ ] Lane variant → Continue
- [ ] With campfire inserted → Exit campfire → Should go to travel
- [ ] With random encounter inserted → Exit encounter → Should go to travel

---

## Test A2: ReturnScene Sanity Check

### Steps:
1. Play through 5 skirmishes naturally
2. After each resolve, run: `qaValidateReturnScene()`
3. **Expected:** All returnScenes are valid (not intro/skirmish scenes, exist in scenes object)

### Validation:
The helper checks:
- ✅ Not in invalid list: `start`, `character_creation`, `quick_start_review`, `skirmish_*`
- ✅ Scene exists in `scenes[...]` object
- ✅ Can be any valid travel scene (march_*, marsh_*, siege_*, etc.)

---

## Test A4: Double-Insertion Regression Guard

### Steps:
1. Enable debug: `qaEnableDebug()`
2. Force skirmish → Complete → Resolve screen
3. **Before clicking Continue**, run: `qaCheckDoubleInsertionGuard()`
4. Click "Continue"
5. **Check console** for:
   - `[QA] SKIPPED global insertion pipeline (exiting skirmish_roadside_resolve)`
   - Should NOT see: `[QA] Running global insertion pipeline from: skirmish_roadside_resolve`
6. **If campfire appears:**
   - Complete campfire
   - **Expected:** End at travel scene
   - **Verify:** No immediate skirmish after campfire
7. **Check for stale returnScene:**
   - Run: `qaCheckDoubleInsertionGuard()`
   - **Expected:** No warnings about stale skirmish scenes

### What to Look For:
- ✅ Guard message appears when exiting resolve
- ✅ No immediate skirmish after resolve exit
- ✅ No stale returnScene references pointing to skirmish scenes

---

## Test B1: Save/Load Matrix

### Save Point 1: Skirmish Entry
```
1. Force skirmish → See entry scene
2. Save game
3. Reload
4. Expected: Still on skirmish entry, choices visible
5. Click choice → Should proceed normally
```

### Save Point 2: Tempo Strike Overlay
```
1. Force skirmish → Choose action → Overlay opens
2. Save game (use browser dev tools or localStorage)
3. Reload
4. Expected: Overlay closed, back at entry OR at resolve
5. If at resolve, verify: gameState.lastSkirmish.timing exists
```

### Save Point 3: Skirmish Resolve
```
1. Complete skirmish → Resolve screen
2. Note: formulaText, timing bonus, costs, margin
3. Save game
4. Reload
5. Expected: All values identical (deterministic)
6. Verify: gameState.lastSkirmish.timing.bonus matches
7. Click Continue → Should route correctly
```

### Save Point 4: Micro Campfire
```
1. Trigger micro campfire
2. Save game
3. Reload
4. Expected: Still in campfire, mode='micro', 4 choices visible
5. Click choice → Should apply effects and route correctly
```

### Save Point 5: Post-Skirmish Travel
```
1. Complete skirmish → Continue → Travel scene
2. Save game
3. Reload
4. Expected: On travel scene, lastSkirmish === null
5. Continue playing → Should work normally
```

---

## Test C2: Tempo Strike Skip/Esc

### Steps:
1. Force skirmish → Choose action → Tempo overlay
2. Click "Skip" button
3. **Expected:** 
   - Overlay closes
   - `gameState.lastSkirmish.timing.bonus === 0`
   - `gameState.lastSkirmish.timing.label === 'SKIP'`
4. Repeat with Esc key
5. **Expected:** Same behavior
6. **Verify:** No console errors, no stuck handlers

---

## Quick Test Checklist (30 minutes)

### Critical Tests (15 min):
1. ✅ Test A4 (Double-Insertion Guard) - Most important
2. ✅ Test A1 (Routing) - 3 variants
3. ✅ Test B1 (Save Matrix) - At least resolve screen

### Balance Check (10 min):
- Play 5 skirmishes with mail, track wear/exertion
- Verify recovery is possible via micro campfires

### Mobile Check (5 min):
- Test Tempo overlay on actual device
- Verify buttons are tappable, no jank

---

## Console Commands Reference

```javascript
// Enable/disable debug mode
qaEnableDebug()
qaDisableDebug()

// Run all routing tests
qaRunRoutingTests()

// Individual validations
qaValidateReturnScene()
qaValidateResolveRouting()
qaCheckDoubleInsertionGuard()

// Check current state
gameState.currentScene
gameState.lastSkirmish
gameState.campfire
gameState.randomEncounter

// Force skirmish (if debug enabled)
forceSkirmishUI()
```

---

## Expected Console Output

### When Guard Works (Good):
```
[QA] SKIPPED global insertion pipeline (exiting skirmish_roadside_resolve)
```

### When Guard Fails (Bad):
```
[QA] Running global insertion pipeline from: skirmish_roadside_resolve → ...
```

If you see the second message when exiting resolve, the guard has failed!
