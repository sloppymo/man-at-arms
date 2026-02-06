# Comprehensive Refactoring Verification Prompt

## Context

A monolithic HTML game file (`man-at-arms.html`, ~20,000 lines) has been refactored into a modular codebase structure. The original file contained all HTML, CSS, and JavaScript in a single file. The refactored version separates concerns into:

- `index.html` - Entry point with script/link tags
- `css/styles.css` - All CSS rules
- `js/core/` - Core game systems (constants, gameState, utils)
- `js/systems/` - Game systems (condition, currency, chapter, campfire, skirmish, roguelike)
- `js/scenes/` - Scene definitions organized by category
- `js/ui/` - UI components (modals, sidebar, choices, renderer)
- `js/main.js` - Main game loop and initialization

The refactoring maintains the same global scope architecture using IIFEs (Immediately Invoked Function Expressions) and explicit `window.*` exports, as ES6 modules are not used.

## Verification Objectives

Your task is to verify that the refactored codebase is **functionally equivalent** to the original monolithic file. This means:

1. **All functions are accessible** - Every function that was globally available in the original must be accessible in the refactored version
2. **All variables are accessible** - Global state variables (gameState, scenes, etc.) must be properly exposed
3. **Dependencies are correct** - Scripts load in the correct order based on dependencies
4. **No missing code** - All code from the original file has been extracted and placed in appropriate modules
5. **Scope is correct** - Functions use `window.*` for global access, not direct references
6. **Scene definitions are complete** - All scenes exist and have correct structure
7. **Error handling works** - Error messages and fallbacks function correctly

## Verification Checklist

### Phase 1: File Structure Verification

1. **Check that all expected files exist:**
   - `index.html` - Entry point
   - `css/styles.css` - All CSS
   - `js/core/constants.js` - Game constants
   - `js/core/gameState.js` - Game state initialization
   - `js/core/utils.js` - Utility functions
   - `js/systems/condition-system.js` - Condition management
   - `js/systems/currency-system.js` - Currency management
   - `js/systems/chapter-system.js` - Chapter progression
   - `js/systems/campfire-system.js` - Campfire scenes
   - `js/systems/skirmish-system.js` - Skirmish combat
   - `js/systems/roguelike-system.js` - Roguelike mechanics
   - `js/scenes/character-creation.js` - Character creation
   - `js/scenes/training/training-scenes.js` - Training scenes
   - `js/scenes/battles/battle-scenes.js` - Battle scenes
   - `js/scenes/campaigns/campaign-scenes.js` - Campaign scenes
   - `js/scenes/transitions/transition-scenes.js` - Transition scenes
   - `js/scenes/encounters/encounter-scenes.js` - Encounter scenes
   - `js/scenes/campfire/vignettes.js` - Campfire vignettes
   - `js/ui/modals.js` - Modal dialogs
   - `js/ui/sidebar.js` - Sidebar UI
   - `js/ui/choices.js` - Choice handling
   - `js/ui/renderer.js` - Scene rendering
   - `js/main.js` - Main game loop

2. **Verify script loading order in `index.html`:**
   - External dependencies load first (enemy-profiles, equipment-system, equipment-ui)
   - Core systems load before game systems
   - Game systems load before scenes
   - Scenes load before UI components
   - UI components load before main.js
   - All scripts use relative paths and are in correct order

### Phase 2: Global Scope Verification

3. **Check that all global functions are exported:**
   - Search for `window.functionName = functionName;` patterns
   - Verify every function that was globally accessible in the original is exported
   - Check that functions are exported at the END of their IIFE, not at definition
   - Common functions to verify:
     - `initGame`, `updateDisplay`, `updateChoices`, `makeChoice`
     - `saveGame`, `loadGame`, `resetGame`
     - `applyStatChange`, `clampStat`, `resolveAction`, `rollDice`
     - `addCondition`, `removeCondition`, `hasCondition`
     - `setFlag`, `getFlag`, `hasFlag`
     - `triggerCombat`, `maybeInsertSkirmish`, `maybeInsertCampfire`
     - `showNotification`, `showModal`, `closeModal`
     - All `renderCharacterCreationStep*` functions (1-6)
     - All character creation helper functions

4. **Check that all global variables are accessible:**
   - `window.gameState` - Must be initialized in `gameState.js` and accessible everywhere
   - `window.scenes` - Must contain all scene definitions
   - `window.statLimits` - Must be defined in `constants.js`
   - `window.PATRONS` - Must be accessible (from external file)
   - `window.enemyProfiles` - Must be accessible (from external file)

5. **Verify scope usage patterns:**
   - Functions should use `window.gameState.*` not `gameState.*`
   - Functions should use `window.scenes.*` not `scenes.*`
   - Functions should use `window.functionName()` not `functionName()` when calling other modules
   - Within the same IIFE, functions can call each other directly
   - Check for any remaining direct references that should be `window.*`

### Phase 3: Function Extraction Verification

6. **Verify all functions from original are present:**
   - Character creation functions (all 6 render steps + helpers)
   - Combat system functions
   - Skirmish system functions (runSkirmish, computeSkirmishModifiers, etc.)
   - Campfire system functions (maybeInsertCampfire, shouldInsertCampfire)
   - Condition system functions
   - Currency system functions
   - Chapter system functions
   - UI functions (updateChoices, makeChoice, showNotification, etc.)
   - Save/load functions
   - Equipment system functions
   - All utility functions

7. **Check for missing function implementations:**
   - Search for `window.functionName = functionName;` where `functionName` is never defined
   - Check for function calls that reference undefined functions
   - Verify async functions (like `startTempoStrike`, `runSkirmish`) are properly defined

8. **Verify function signatures match:**
   - Parameter counts match original
   - Return values match original
   - Async/Promise patterns are preserved

### Phase 4: Scene Definition Verification

9. **Verify all scenes are defined:**
   - Count scenes in original file
   - Count scenes in refactored files
   - Ensure counts match
   - Check that scene keys are consistent (no typos in scene names)

10. **Check scene structure:**
    - Each scene has: `title`, `year`, `age`, `location`, `text`, `choices`
    - Optional properties: `artwork`, `artworkCaption`, `onEnter`, `noCampfire`
    - Scene text can be string or function
    - Scene choices can be array or function
    - Verify all scene properties are preserved

11. **Check scene-specific issues:**
    - Character creation scenes use `renderCharacterCreationStep*` functions
    - Skirmish scenes use `runSkirmish` function
    - Campfire scenes are properly structured
    - Transition scenes have correct nextScene references
    - Battle scenes have proper combat triggers

### Phase 5: Dependency Verification

12. **Verify script dependencies:**
    - `constants.js` loads before anything that uses `statLimits`
    - `gameState.js` loads before anything that uses `gameState`
    - `utils.js` loads before anything that uses utility functions
    - Systems load before scenes that use them
    - Scenes load before UI that renders them
    - UI loads before main.js that uses it

13. **Check for circular dependencies:**
    - No file should depend on something that depends on it
    - Verify the dependency chain is linear

14. **Verify external dependencies:**
    - `man-at-arms-enemy-profiles.js` exists and is loaded
    - `man-at-arms-equipment-system.js` exists and is loaded
    - `man-at-arms-equipment-ui.js` exists and is loaded
    - These files export to `window.*` properly

### Phase 6: Runtime Behavior Verification

15. **Check initialization:**
    - `window.initGame()` is called on page load
    - `checkRequiredModules()` verifies all dependencies
    - Game state is properly initialized
    - All systems are initialized in correct order

16. **Verify error handling:**
    - Missing modules show appropriate errors
    - Missing scenes show fallback behavior
    - Invalid choices show error messages
    - Save/load errors are handled gracefully

17. **Check scene transitions:**
    - Choices properly determine next scenes
    - Scene insertion (skirmish, campfire, random encounters) works
    - Return scenes are properly set and used
    - No infinite loops or invalid scene references

### Phase 7: Specific Known Issues to Check

18. **Verify fixes for previously reported issues:**
    - Character creation render functions are all defined and exported
    - Skirmish system uses `window.*` for all references
    - Campfire system doesn't interrupt early game scenes
    - Flag functions (`setFlag`, `getFlag`, `hasFlag`) are all defined
    - `startTempoStrike` function is defined and exported
    - All `gameState.*` references use `window.gameState.*`
    - All `scenes.*` references use `window.scenes.*`
    - All function calls to other modules use `window.functionName()`

19. **Check for common refactoring errors:**
    - Functions defined as `function window.functionName()` (should be `function functionName()` then export)
    - Missing commas in object/array literals
    - Missing closing braces
    - Incorrect IIFE structure
    - Functions called before they're defined
    - Variables accessed before initialization

### Phase 8: Edge Cases and Special Scenarios

20. **Verify special scene types:**
    - Scenes with `text: function()` - verify functions work
    - Scenes with `choices: function()` - verify functions work
    - Scenes with `onEnter: function()` - verify functions are called
    - Scenes with `noCampfire: true` - verify campfire insertion is blocked
    - Scenes with async `nextScene: async function()` - verify promises resolve

21. **Check conditional logic:**
    - Flag checks (`hasFlag`, `getFlag`) work correctly
    - Stat checks work correctly
    - Equipment checks work correctly
    - Relationship checks work correctly

22. **Verify state persistence:**
    - Save game captures all necessary state
    - Load game restores all state correctly
    - State changes persist across scene transitions

### Phase 9: Code Quality Checks

23. **Check for code smells:**
    - Duplicate code that should be extracted
    - Magic numbers that should be constants
    - Long functions that should be split
    - Inconsistent naming conventions

24. **Verify code organization:**
    - Related functions are grouped together
    - Files have logical boundaries
    - No file is excessively large (>2000 lines)
    - Comments are preserved where helpful

### Phase 10: Testing Recommendations

25. **Manual testing scenarios:**
    - Start new game → complete character creation → verify progression
    - Load saved game → verify state is correct
    - Play through first 10 scenes → verify no campfire interruptions
    - Trigger a skirmish → verify it works end-to-end
    - Trigger a campfire scene → verify it works
    - Make choices that set flags → verify flags are set
    - Check scenes that read flags → verify they work
    - Test combat system → verify it works
    - Test equipment system → verify it works
    - Test save/load → verify persistence

26. **Browser console checks:**
    - Open browser console
    - Check for any JavaScript errors on page load
    - Check for any undefined function errors
    - Check for any undefined variable errors
    - Verify `window.gameState` exists
    - Verify `window.scenes` exists
    - Verify key functions exist (e.g., `window.initGame`, `window.updateDisplay`)

## Verification Methodology

1. **Automated Checks:**
   - Use `grep` to search for patterns (e.g., `window\.functionName = functionName`)
   - Use `grep` to find all function definitions
   - Use `grep` to find all function calls
   - Compare counts between original and refactored
   - Use syntax checkers (`node -c filename.js`)

2. **Manual Code Review:**
   - Read through each module file
   - Check exports at the end of each IIFE
   - Verify function definitions match usage
   - Check for missing dependencies

3. **Runtime Testing:**
   - Load the game in a browser
   - Test key user flows
   - Check browser console for errors
   - Verify game state changes correctly

4. **Comparison Testing:**
   - Compare behavior between original and refactored
   - Test same scenarios in both versions
   - Verify outputs match

## Expected Output Format

For each verification phase, provide:

1. **Status**: ✅ Pass / ⚠️ Warning / ❌ Fail
2. **Details**: Specific findings
3. **Issues Found**: List of any problems
4. **Recommendations**: Suggestions for fixes

## Critical Areas to Focus On

Based on previous issues encountered, pay special attention to:

1. **Function exports** - Many functions were missing `window.*` exports
2. **Scope references** - Many `gameState.*` should be `window.gameState.*`
3. **Missing functions** - Some functions were referenced but not defined
4. **Async functions** - `startTempoStrike`, `runSkirmish` must be properly defined
5. **Flag functions** - `setFlag`, `getFlag`, `hasFlag` must all exist
6. **Character creation** - All 6 render step functions must exist
7. **Campfire insertion** - Should not interrupt early game scenes
8. **Scene transitions** - All `nextScene` values must be valid scene keys

## Success Criteria

The refactoring is successful if:

1. ✅ All files exist and are properly structured
2. ✅ All functions are accessible via `window.*`
3. ✅ All global variables are accessible via `window.*`
4. ✅ Scripts load in correct dependency order
5. ✅ No JavaScript errors in browser console
6. ✅ Game initializes and runs correctly
7. ✅ All scenes are accessible and render correctly
8. ✅ All game systems function correctly
9. ✅ Save/load works correctly
10. ✅ User can complete a full playthrough without errors

## Additional Notes

- The original file is `man-at-arms.html` (if available for comparison)
- The refactored entry point is `index.html`
- All JavaScript uses IIFE pattern: `(function() { 'use strict'; ... })();`
- No ES6 modules are used - everything is global scope via `window.*`
- The game is a browser-based roguelike with no build step required
- All paths are relative to the project root

---

**Begin verification and provide a comprehensive report covering all phases above.**
