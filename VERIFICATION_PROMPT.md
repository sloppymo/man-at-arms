# Refactoring Verification Prompt

## Objective
Verify that the refactored modular codebase (`index.html` + extracted JS/CSS files) is functionally equivalent to the original monolithic `man-at-arms.html` file. Ensure no functionality was lost, no bugs were introduced, and all dependencies are correctly wired.

## Original File
- **Source**: `man-at-arms.html` (20,613 lines)
- **Structure**: Single HTML file with embedded `<style>` and `<script>` blocks

## Refactored Structure
- **Entry Point**: `index.html`
- **CSS**: `css/styles.css`
- **Core Systems**: `js/core/constants.js`, `js/core/gameState.js`, `js/core/utils.js`
- **Game Systems**: `js/systems/*.js` (6 files)
- **Scenes**: `js/scenes/**/*.js` (7 files)
- **UI Components**: `js/ui/*.js` (4 files)
- **Main Loop**: `js/main.js`

## Verification Checklist

### Phase 1: File Structure Verification

1. **Directory Structure**
   - [ ] Verify all directories exist: `css/`, `js/core/`, `js/systems/`, `js/scenes/`, `js/ui/`
   - [ ] Verify all expected files exist (use `find js/ css/ -type f | sort`)
   - [ ] Count total files and verify against expected count

2. **index.html Structure**
   - [ ] Verify HTML5 structure with proper DOCTYPE
   - [ ] Verify all `<link>` tags for CSS (should be 1: `css/styles.css`)
   - [ ] Verify all `<script>` tags are present and in correct order:
     - External modules (enemy-profiles, equipment-system, equipment-ui)
     - Core systems (constants, gameState, utils)
     - Game systems (condition, currency, chapter, campfire, skirmish, roguelike)
     - Scene definitions (campfire/vignettes, character-creation, training, battles, campaigns, transitions, encounters)
     - UI components (modals, sidebar, choices, renderer)
     - Main game loop (main.js)
   - [ ] Verify body structure matches original (game container, story, choices, sidebar, etc.)

### Phase 2: Code Extraction Verification

3. **CSS Extraction**
   - [ ] Extract CSS from `man-at-arms.html` (lines 7-919, excluding `<style>` tags)
   - [ ] Compare with `css/styles.css` line-by-line
   - [ ] Verify no CSS rules were lost or modified
   - [ ] Check for any CSS that might still be in the HTML file

4. **JavaScript Function Extraction**
   For each extracted file, verify:
   - [ ] All functions from the original are present
   - [ ] Functions are wrapped in IIFE: `(function() { 'use strict'; ... })();`
   - [ ] Functions are exposed globally via `window.functionName = functionName;`
   - [ ] No duplicate function definitions exist across files

5. **Constants Extraction**
   - [ ] Verify `CHAPTERS`, `PATRONS`, `KIT_TIER_MAP`, `statLimits` in `js/core/constants.js`
   - [ ] Verify `SAVE_KEY`, `SAVE_VERSION`, `RANDOM_ENCOUNTER_*` constants in `js/main.js`
   - [ ] Verify all constants are exposed via `window.CONSTANT_NAME`

6. **Game State Extraction**
   - [ ] Verify `gameState` initialization in `js/core/gameState.js`
   - [ ] Verify `makeDefaultGameState()` function exists and matches original
   - [ ] Verify `gameState` is exposed as `window.gameState`

7. **Scene Definitions**
   - [ ] Count scenes in original: `grep -c "^\s*[a-z_]*:" man-at-arms.html` (or similar)
   - [ ] Count scenes in refactored files: `grep -c "^\s*[a-z_]*:" js/scenes/**/*.js`
   - [ ] Verify all scenes use `Object.assign(window.scenes, { sceneName: {...} })`
   - [ ] Verify campfire vignettes are in `js/scenes/campfire/vignettes.js` as `window.CAMPFIRE_VIGNETTES`

### Phase 3: Dependency Verification

8. **Function Dependencies**
   For each extracted file, verify:
   - [ ] All function calls use `window.functionName()` or `window.variableName`
   - [ ] No direct references to `gameState` (should be `window.gameState`)
   - [ ] No direct references to `scenes` (should be `window.scenes`)
   - [ ] Stub functions are present for dependencies not yet extracted (if any)

9. **Script Loading Order**
   - [ ] Verify scripts load in dependency order:
     1. Constants (no dependencies)
     2. Game State (depends on constants)
     3. Utils (depends on constants, gameState)
     4. Systems (depend on core)
     5. Scenes (depend on systems)
     6. UI (depends on scenes, systems)
     7. Main (depends on everything)

10. **Global Exports**
    - [ ] Verify all public functions are exposed via `window`
    - [ ] Verify no private functions are exposed (check naming conventions)
    - [ ] Create a list of all `window.*` exports and verify completeness

### Phase 4: Code Equivalence Verification

11. **Function-by-Function Comparison**
    For critical functions, extract from both versions and compare:
    - [ ] `clampStat()` - verify logic matches
    - [ ] `applyStatChange()` - verify logic matches
    - [ ] `escapeHTML()` - verify XSS protection
    - [ ] `saveGame()` / `loadGame()` - verify save/load logic
    - [ ] `updateDisplay()` - verify display update logic
    - [ ] `makeChoice()` - verify choice handling logic

12. **Scene Content Verification**
    - [ ] Pick 5-10 random scenes from original
    - [ ] Find same scenes in refactored files
    - [ ] Compare scene objects field-by-field (text, choices, effects, etc.)
    - [ ] Verify no scene properties were lost

13. **Edge Cases**
    - [ ] Verify error handling is preserved
    - [ ] Verify XSS protection (`escapeHTML`) is still applied
    - [ ] Verify null/undefined checks are preserved
    - [ ] Verify Set/Array conversions (e.g., `enteredScenes`) are handled

### Phase 5: Integration Testing

14. **Browser Loading Test**
    - [ ] Open `index.html` in browser
    - [ ] Check browser console for errors
    - [ ] Verify all scripts load without errors
    - [ ] Verify no "undefined is not a function" errors
    - [ ] Verify no "Cannot read property of undefined" errors

15. **Function Availability Test**
    Create a test script that checks:
    ```javascript
    const requiredFunctions = [
        'clampStat', 'applyStatChange', 'escapeHTML', 'rollDice',
        'saveGame', 'loadGame', 'resetGame',
        'updateDisplay', 'updateStory', 'updateChoices', 'updateStats',
        'makeChoice', 'showNotification', 'showStats',
        // ... add all critical functions
    ];
    // Check each function exists and is callable
    ```

16. **Game Initialization Test**
    - [ ] Verify game initializes on page load
    - [ ] Verify character creation screen appears
    - [ ] Verify no errors during initialization
    - [ ] Verify `gameState` is properly initialized

17. **Basic Functionality Test**
    - [ ] Create a character (if possible)
    - [ ] Make a choice
    - [ ] Verify scene transitions work
    - [ ] Verify stats update correctly
    - [ ] Verify save/load works (if accessible)

### Phase 6: Code Quality Verification

18. **Syntax Validation**
    - [ ] Run `node -c` on each JS file to check syntax
    - [ ] Verify no linter errors (if linter available)
    - [ ] Check for common issues: missing semicolons, unclosed braces, etc.

19. **Pattern Consistency**
    - [ ] Verify all files use IIFE pattern
    - [ ] Verify consistent indentation (4 spaces or tabs)
    - [ ] Verify consistent function declaration style
    - [ ] Verify consistent comment style

20. **Dead Code Check**
    - [ ] Verify no unused functions were extracted
    - [ ] Verify no duplicate code exists
    - [ ] Check for commented-out code that should be removed

### Phase 7: Comparison Tools

21. **Automated Comparison**
    Use these commands to help verify:
    ```bash
    # Count functions in original
    grep -E "^\s+function [a-zA-Z_]" man-at-arms.html | wc -l
    
    # Count functions in refactored
    grep -E "^\s+function [a-zA-Z_]|^function [a-zA-Z_]" js/**/*.js | wc -l
    
    # List all window exports
    grep "window\.[a-zA-Z_]* = " js/**/*.js | sort | uniq
    
    # Check for direct gameState references (should be window.gameState)
    grep -r "\bgameState\." js/ | grep -v "window.gameState" | grep -v "//"
    
    # Check for direct scenes references
    grep -r "\bscenes\[" js/ | grep -v "window.scenes" | grep -v "//"
    ```

22. **Manual Spot Checks**
    - [ ] Open original `man-at-arms.html` in browser, note behavior
    - [ ] Open refactored `index.html` in browser, compare behavior
    - [ ] Test same user flows in both versions
    - [ ] Compare console output (if any)

### Phase 8: Documentation Verification

23. **Documentation Check**
    - [ ] Verify `REFACTORING_PROMPT.md` exists and documents the process
    - [ ] Verify any test results files are present
    - [ ] Check for any TODO comments in code
    - [ ] Verify comments explain complex logic

### Phase 9: Final Report

24. **Create Verification Report**
    Document:
    - [ ] Files verified
    - [ ] Functions verified
    - [ ] Issues found (if any)
    - [ ] Recommendations
    - [ ] Overall assessment: PASS / FAIL / NEEDS WORK

## Critical Functions to Verify

These functions are critical to game operation - verify they exist and work:

**Core Utilities:**
- `clampStat(stat, value)`
- `applyStatChange(key, delta)`
- `escapeHTML(text)`
- `rollDice(count, sides)`
- `resolveAction(stat, difficulty, bonus)`
- `getEffectiveStat(stat)`

**Game State:**
- `makeDefaultGameState()`
- `saveGame()`
- `loadGame()`
- `resetGame()`

**UI Updates:**
- `updateDisplay()`
- `updateStory()`
- `updateChoices()`
- `updateStats()`
- `updateStatusBar()`
- `updateRelationshipDisplay()`

**User Interaction:**
- `makeChoice(choiceIndex)`
- `showNotification(title, message, type)`
- `showStats()`

**Character Creation:**
- `validatePrioritiesCompleteAndUnique()`
- `recalculateFromPriorities()`
- `grantStartingKit()`
- `completeCharacterCreation()`

**Game Systems:**
- `checkChapterTransition()`
- `maybeInsertCampfire()`
- `maybeInsertSkirmish()`
- `maybeInsertRandomEncounter()`
- `checkArbitraryDeath()`

## Expected File Counts

- Core files: 3 (`constants.js`, `gameState.js`, `utils.js`)
- System files: 6 (`condition-system.js`, `currency-system.js`, `chapter-system.js`, `campfire-system.js`, `skirmish-system.js`, `roguelike-system.js`)
- Scene files: 7 (vignettes, character-creation, training, battles, campaigns, transitions, encounters)
- UI files: 4 (`modals.js`, `sidebar.js`, `choices.js`, `renderer.js`)
- Main file: 1 (`main.js`)
- **Total JS files: 21**

## Success Criteria

✅ **PASS** if:
- All files exist and are properly structured
- All functions are extracted and accessible
- No syntax errors
- Game loads and initializes
- All critical functions work
- No functionality lost

❌ **FAIL** if:
- Missing files or functions
- Syntax errors prevent loading
- Game doesn't initialize
- Critical functions missing or broken
- Significant functionality lost

⚠️ **NEEDS WORK** if:
- Minor issues found (e.g., missing stubs, minor bugs)
- Some functions need adjustment
- Documentation incomplete
- Code quality issues

## Notes

- The original file is `man-at-arms.html` (20,613 lines)
- The refactored entry point is `index.html`
- All JavaScript should use IIFE pattern: `(function() { 'use strict'; ... })();`
- All exports should use `window.functionName = functionName;`
- All dependencies should use `window.dependencyName`
- No ES6 modules - everything uses global `window` object

## Tools Available

- `grep` / `ripgrep` for searching
- `node -c` for syntax checking
- Browser console for runtime testing
- File comparison tools (diff, etc.)

---

**Start with Phase 1 and work through systematically. Document all findings. If issues are found, note the specific file, line number, and problem description.**
