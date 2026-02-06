# OpenClaw Autonomous Play Prompt: A Man-at-Arms' Life

## Mission Overview

You are an autonomous AI agent tasked with playing through "A Man-at-Arms' Life" - a browser-based historical narrative game set during the Hundred Years' War (1346-1347). Your goal is to play the game systematically, test all major systems, identify bugs, and document your findings.

**Game Version:** 1.4.0+ (Post-Narrative Flow Patches v2)  
**Testing Focus:** All 19 implemented changes (BLOCKER, HIGH, PATCH, MEDIUM priority fixes)

---

## Setup Instructions

### 1. Environment Setup

```bash
# Navigate to game directory
cd /home/sloppymo/Documents/man-at-arms/man-at-arms

# Start local HTTP server (if not already running)
python3 -m http.server 8000

# Or use Node.js if available:
# npx http-server -p 8000
```

### 2. Browser Access

- **URL:** `http://localhost:8000/man-at-arms.html`
- **Browser:** Use a headless browser or automated browser control (Puppeteer, Playwright, Selenium)
- **Console Access:** Must be able to execute JavaScript in browser console

### 3. Initial State Check

Before starting, verify the game loads:
```javascript
// In browser console
console.log('Game loaded:', typeof gameState !== 'undefined');
console.log('Scenes available:', Object.keys(scenes).length);
console.log('Current scene:', gameState?.currentScene);
```

---

## Autonomous Play Strategy

### Phase 1: Character Creation & Initial Setup (5 minutes)

**Objective:** Create a character and reach the first gameplay scene.

**Steps:**
1. **Load the game** and wait for initialization
2. **Verify initial state:**
   - Check that `gameState.currentScene === 'character_creation'`
   - Verify UI elements are visible (story text, choices container)
   - Check that stats panel is hidden during character creation

3. **Complete character creation:**
   - If "Quick Start" button exists, click it
   - Otherwise, manually select:
     - Origin class (e.g., `rural_peasant`, `manor_retainer`)
     - Home region (e.g., `Yorkshire`, `Lancashire`, `Norfolk`)
     - Age range (if prompted)
   - Set character name (use a test name like "TestPlayer")

4. **Verify post-creation state:**
   ```javascript
   // After character creation
   console.log('Post-creation state:', {
       scene: gameState.currentScene,
       name: gameState.characterName,
       origin: gameState.background,
       region: gameState.culture,
       stats: gameState.stats
   });
   ```

**Success Criteria:**
- ✅ Character created successfully
- ✅ Game transitions from `character_creation` to first gameplay scene
- ✅ Stats panel becomes visible
- ✅ No JavaScript errors in console

---

### Phase 2: Core Gameplay Loop - Scene Navigation (15 minutes)

**Objective:** Play through multiple scenes, testing scene transitions, choices, and state management.

**Strategy:**
1. **Play naturally** - make choices that seem narratively appropriate
2. **Track scene transitions** - log every scene change
3. **Test choice functionality** - verify all choices are clickable and functional
4. **Monitor for errors** - watch console for JavaScript errors

**Automated Tracking:**
```javascript
// Set up scene transition tracking
const originalMakeChoice = window.makeChoice;
let sceneHistory = [];
let errorLog = [];

window.makeChoice = function(...args) {
    const beforeScene = gameState.currentScene;
    const result = originalMakeChoice.apply(this, args);
    setTimeout(() => {
        const afterScene = gameState.currentScene;
        sceneHistory.push({
            from: beforeScene,
            to: afterScene,
            timestamp: Date.now()
        });
        console.log(`[TRACK] Scene transition: ${beforeScene} → ${afterScene}`);
    }, 100);
    return result;
};

// Monitor for errors
window.addEventListener('error', (e) => {
    errorLog.push({
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        timestamp: Date.now()
    });
    console.error('[ERROR]', e.message);
});
```

**Test Scenarios:**
1. **Normal scene progression** - play through 10-15 scenes
2. **Choice effects** - verify stat changes are applied
3. **Scene routing** - ensure no undefined scene references
4. **Flag setting** - check that flags are set correctly

**Key Scenes to Test:**
- `between_years_1341`, `1342`, `1343`, `1344` (P1, P9)
- `return_to_england_1344` (P3, P11)
- `winter_march` (P4)
- `village_pillage` (P8)
- Any combat/battle scenes (H1)

---

### Phase 3: BLOCKER Fixes Testing (10 minutes)

#### B1: Arc-Aware Fallback System

**Test:** Trigger undefined scene references

**Method:**
```javascript
// Force an undefined scene transition
function testFallbackSystem() {
    const testScenes = ['undefined_scene_1', 'missing_scene_2', 'invalid_scene_3'];
    const originalScene = gameState.currentScene;
    
    testScenes.forEach(sceneName => {
        console.log(`[TEST] Testing fallback for: ${sceneName}`);
        // Try to navigate to undefined scene
        // This should trigger fallback logic
    });
}
```

**Expected Behavior:**
- Game should route to fallback scene (e.g., `march_through_normandy_1` for chevauchée chapter)
- Console should show: `[FALLBACK] Scene not found: <scene> — using arc-aware fallback`
- Game should not crash

**Verify:**
- Check console for fallback messages
- Verify game continues playing after fallback
- Test in different chapters (chevauchée, calais, plague, poitiers)

#### B2: Crécy Battle References

**Test:** Play through Crécy battle sequence

**Method:**
1. Navigate to Crécy battle scenes
2. Complete battle sequence
3. Verify all transitions work

**Expected Behavior:**
- No console errors about `crecy_battle` not found
- All Crécy scenes transition correctly
- `survivedCrecy` flag is set (P10)

---

### Phase 4: HIGH Priority Fixes Testing (15 minutes)

#### H1: Campfire Exclusion

**Test:** Verify campfire doesn't appear after combat/death scenes

**Method:**
```javascript
// Track campfire appearances
let campfireLog = [];

function trackCampfire() {
    const observer = new MutationObserver((mutations) => {
        if (gameState.currentScene === 'campfire_interlude') {
            const previousScene = sceneHistory[sceneHistory.length - 2]?.from;
            campfireLog.push({
                scene: 'campfire_interlude',
                previousScene: previousScene,
                timestamp: Date.now()
            });
            console.log(`[CAMPFIRE] Appeared after: ${previousScene}`);
        }
    });
    
    observer.observe(document.getElementById('story'), { childList: true });
}

// After combat scenes, verify no campfire
function verifyNoCampfireAfterCombat() {
    const combatScenes = ['battle_crecy', 'skirmish_roadside', 'death_combat'];
    combatScenes.forEach(scene => {
        // Navigate to scene, then check next transition
        // Campfire should NOT appear
    });
}
```

**Expected Behavior:**
- No campfire immediately after combat scenes
- No campfire after death scenes
- Campfire can appear after normal travel scenes

#### H2: Chapter Transition

**Test:** Play through year 1346 transition

**Method:**
1. Play to year 1346
2. Verify chapter transition logic
3. Check `gameState.chapter` and `gameState.chapterProgress`

**Expected Behavior:**
- Chapter 1 (chevauchée) completes before Chapter 2 (calais) starts
- No overlap where both chapters are active
- Clean transition in `gameState.chapter`

#### H4: Mutual Exclusion in Insertion Pipeline

**Test:** Verify only one interlude per transition

**Method:**
```javascript
// Track interlude insertions
let interludeLog = [];

function trackInterludes() {
    const scenes = ['campfire_interlude', 'skirmish_roadside', 'random_encounter'];
    scenes.forEach(scene => {
        if (gameState.currentScene === scene) {
            interludeLog.push({
                type: scene,
                timestamp: Date.now(),
                previousScene: sceneHistory[sceneHistory.length - 1]?.from
            });
        }
    });
}

// Verify no double-insertion
function verifySingleInterlude() {
    // Check that never see: skirmish → campfire → random encounter in one transition
    // Check console for: [QA] Running global insertion pipeline
}
```

**Expected Behavior:**
- Only one interlude type per transition
- Console shows insertion pipeline logs
- No double-insertion

---

### Phase 5: PATCH Items Testing (20 minutes)

#### P1: Between Years Choices

**Test:** Verify meaningful choices in `between_years` scenes

**Method:**
1. Navigate to `between_years_1341`
2. Verify 3+ activity choices (not just "Continue")
3. Test each choice
4. Repeat for 1342, 1343, 1344

**Expected Behavior:**
- Each year has unique, meaningful choices
- Choices have different effects
- Choices route to appropriate next scenes

#### P2: Heartbroken Flags

**Test:** Marie romance path and conditional text

**Method:**
1. Play through Marie romance scene (`marriage_joke`)
2. Choose different responses
3. Verify flags are set
4. Navigate to `between_years_1341`
5. Check conditional text

**Expected Behavior:**
- `Heartbroken` flag is set
- `MarieResponse` flag matches choice
- Conditional text appears in `between_years_1341`

#### P3: Return to England Choices

**Test:** Verify meaningful choices in `return_to_england_1344`

**Expected Behavior:**
- 3 distinct choices
- Region-aware flavor text
- Each choice routes correctly

#### P4: Equipment Checks in Winter March

**Test:** Equipment-dependent text and effects

**Method:**
```javascript
// Test with and without equipment
function testWinterMarch() {
    // Test 1: Without equipment
    gameState.equipment = {};
    // Navigate to winter_march
    // Verify harsh cold text
    
    // Test 2: With cloak only
    gameState.equipment = { cloak: { id: 'cloak' } };
    // Navigate to winter_march
    // Verify partial protection text
    
    // Test 3: With both
    gameState.equipment = { cloak: { id: 'cloak' }, wool_hose: { id: 'wool_hose' } };
    // Navigate to winter_march
    // Verify full protection text
}
```

#### P5: Dynamic End Game Epilogue

**Test:** Complete game and verify personalized epilogue

**Method:**
1. Play through entire game (or use debug to reach `end_game`)
2. Verify epilogue includes:
   - Character name
   - Origin class
   - Home region
   - Crécy flag check
   - Marie romance reflection (if applicable)
   - Companion relationships
   - Patron summary
   - Career assessment
   - Wealth summary
   - Wound/stress assessment
   - Morale-based outlook

**Expected Behavior:**
- All variables interpolated correctly
- No `${name}` literals appearing
- Epilogue reflects actual game state

#### P6-P11: Additional Patch Tests

Follow similar pattern:
- **P6:** Test vignette prereq filtering
- **P7:** Test Oana vignette location guards
- **P8:** Test patron-gated choices
- **P9:** Test upkeep costs
- **P10:** Test `survivedCrecy` flag
- **P11:** Test region-aware flavor

---

### Phase 6: MEDIUM Priority Testing (10 minutes)

#### M4: Dynamic Campfire Titles

**Test:** Verify campfire titles match selected vignette

**Method:**
```javascript
// Track campfire titles
function trackCampfireTitles() {
    if (gameState.currentScene === 'campfire_interlude') {
        const title = document.querySelector('.header h1')?.textContent;
        const vignetteId = gameState.campfire?.selectedVignette?.id;
        console.log(`[CAMPFIRE] Title: ${title}, Vignette: ${vignetteId}`);
    }
}
```

#### M5: Intensity Cooldown System

**Test:** Verify cooldown prevents inappropriate interludes

**Method:**
```javascript
// Track intensity cooldown
function trackIntensityCooldown() {
    console.log('Intensity cooldown:', gameState.intensityCooldown);
    console.log('Last intense scene:', gameState.lastIntenseScene);
    
    // After battle, verify cooldown is set
    // Verify campfire/encounter suppressed during cooldown
}
```

#### M6: Save/Load Validation

**Test:** Save and load with invalid scene

**Method:**
```javascript
// Test save/load
function testSaveLoad() {
    // Save game
    saveGame();
    
    // Corrupt save data
    const saveData = localStorage.getItem('manAtArmsSave');
    const corrupted = JSON.parse(saveData);
    corrupted.currentScene = 'invalid_scene_name';
    localStorage.setItem('manAtArmsSave', JSON.stringify(corrupted));
    
    // Try to load
    loadGame();
    
    // Verify fallback to safe scene
    console.log('After load, scene:', gameState.currentScene);
}
```

---

### Phase 7: Integration Testing (10 minutes)

**Test multi-system interactions:**

1. **Campfire + Intensity Cooldown**
   - After battle, verify campfire suppressed
   - After 3 scenes, verify campfire can appear

2. **Prereq + Condition Guards**
   - Test vignette with both prereq and condition
   - Verify both must be met

3. **Upkeep + Wealth Display**
   - Apply upkeep, verify wealth updated
   - Check in epilogue

4. **Flag Persistence**
   - Set flags, save, load
   - Verify flags persist

---

## Automated Test Execution

### Browser Automation Script Structure

```javascript
// Example using Puppeteer
const puppeteer = require('puppeteer');

async function autonomousPlay() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    // Navigate to game
    await page.goto('http://localhost:8000/man-at-arms.html');
    
    // Wait for game to load
    await page.waitForFunction(() => typeof gameState !== 'undefined');
    
    // Inject tracking code
    await page.evaluate(() => {
        // Add tracking functions here
    });
    
    // Execute test phases
    await phase1_CharacterCreation(page);
    await phase2_CoreGameplay(page);
    await phase3_BlockerFixes(page);
    // ... etc
    
    // Collect results
    const results = await page.evaluate(() => {
        return {
            sceneHistory: window.sceneHistory,
            errorLog: window.errorLog,
            campfireLog: window.campfireLog,
            // ... other logs
        };
    });
    
    await browser.close();
    return results;
}
```

---

## Reporting Requirements

### Test Report Structure

```markdown
# Autonomous Play Test Report

## Executive Summary
- Total scenes played: X
- Errors encountered: X
- Bugs found: X
- Test duration: X minutes

## Phase Results

### Phase 1: Character Creation
- ✅ Passed / ❌ Failed
- Issues found: [list]

### Phase 2: Core Gameplay
- Scenes played: [list]
- Errors: [list]
- Issues: [list]

### Phase 3: BLOCKER Fixes
- B1 (Fallback): ✅ / ❌
- B2 (Crécy): ✅ / ❌

### Phase 4: HIGH Priority
- H1 (Campfire): ✅ / ❌
- H2 (Chapter): ✅ / ❌
- H4 (Mutual Exclusion): ✅ / ❌

### Phase 5: PATCH Items
- P1-P11: [status for each]

### Phase 6: MEDIUM Priority
- M4, M5, M6: [status]

### Phase 7: Integration
- [results]

## Bugs Found

### Bug #1: [Title]
- **Severity:** BLOCKER / HIGH / MEDIUM / LOW
- **Category:** [Narrative / Mechanics / UI / Performance]
- **Description:** [detailed description]
- **Steps to Reproduce:**
  1. [step]
  2. [step]
- **Expected:** [expected behavior]
- **Actual:** [actual behavior]
- **Console Errors:** [if any]
- **Game State:** [relevant state]

## Recommendations

1. [recommendation]
2. [recommendation]

## Console Logs

[Relevant console output]
```

---

## Success Criteria

**Test is successful if:**
- ✅ All BLOCKER fixes work correctly
- ✅ All HIGH priority fixes work correctly
- ✅ At least 80% of PATCH items work correctly
- ✅ No game-breaking bugs found
- ✅ Scene transitions work smoothly
- ✅ Save/load functions correctly
- ✅ No undefined scene references cause crashes

**Test should identify:**
- JavaScript errors
- Undefined scene references
- Broken choice routing
- Flag persistence issues
- State management problems
- UI/UX issues

---

## Troubleshooting

### Game Won't Load
- Check HTTP server is running
- Verify all JS files are accessible
- Check browser console for errors
- Verify file paths are correct

### Scenes Not Transitioning
- Check `makeChoice()` function
- Verify scene exists in `scenes` object
- Check for JavaScript errors
- Verify gameState is not corrupted

### Choices Not Working
- Verify choice buttons are rendered
- Check `updateChoices()` function
- Verify choice handlers are attached
- Check for JavaScript errors

### Save/Load Issues
- Check localStorage is available
- Verify save data format
- Check scene validation logic
- Verify gameState hydration

---

## Advanced Testing

### Stress Testing
- Play through 100+ scenes
- Rapid choice clicking
- Multiple save/load cycles
- Long play sessions

### Edge Case Testing
- Zero wealth scenarios
- Maximum stat values
- Missing game state properties
- Corrupted save data

### Performance Testing
- Scene transition speed
- Save/load performance
- Memory usage over time
- Large game state handling

---

## Notes for OpenClaw Model

1. **Be systematic** - Follow phases in order
2. **Document everything** - Log all findings
3. **Test edge cases** - Don't just happy path
4. **Verify fixes** - Confirm reported issues are actually fixed
5. **Report clearly** - Use structured format
6. **Be thorough** - Don't skip test cases
7. **Adapt** - If game structure differs, adjust approach

---

## End of Prompt

**Remember:** Your goal is to thoroughly test the game and identify any issues. Be methodical, document everything, and provide actionable feedback.

Good luck, and may your testing be thorough!
