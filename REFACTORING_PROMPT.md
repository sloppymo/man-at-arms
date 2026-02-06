# Comprehensive Refactoring Prompt
## Man-at-Arms: Single-Agent Refactoring Plan A

**Objective:** Refactor the monolithic `man-at-arms.html` (20,324 lines) into a modular, maintainable codebase structure.

**Backup Location:** `../man-at-arms-backup-20260205-223410/`  
**Reference Plan:** See `REFACTORING_PLAN.md` for detailed structure

---

## Your Mission

You are tasked with systematically extracting code from `man-at-arms.html` and reorganizing it into a clean, modular structure. This is a **single-agent operation** - you will work through all phases sequentially, ensuring consistency and quality throughout.

**Critical Rules:**
1. **Never break functionality** - The game must work identically after each phase
2. **Test after each phase** - Verify before moving to next phase
3. **Maintain code style** - Match existing JavaScript patterns
4. **Preserve all functionality** - Every function, every scene, every feature
5. **Use global scope** - Make functions/objects available via `window` object (no ES6 modules yet)

---

## Phase 1: Preparation & Setup

### Task 1.1: Create Directory Structure
Create the following directories:
```
css/
js/
js/core/
js/systems/
js/scenes/
js/scenes/training/
js/scenes/battles/
js/scenes/campaigns/
js/scenes/transitions/
js/scenes/encounters/
js/scenes/campfire/
js/ui/
```

### Task 1.2: Create New index.html Skeleton
Create `index.html` with:
- Basic HTML5 structure
- Head section with meta tags and title
- Link to `css/styles.css` (to be created)
- Script tags for external modules (already exist):
  - `man-at-arms-enemy-profiles.js`
  - `man-at-arms-equipment-system.js`
  - `man-at-arms-equipment-ui.js`
- Body with game container structure (copy from original, lines 925-1020)
- Placeholder script tags (will be filled in later phases)

**Verification:** File structure exists, `index.html` loads without errors

---

## Phase 2: Extract CSS

### Task 2.1: Extract Styles
- Read lines 7-919 from `man-at-arms.html`
- Remove `<style>` opening and closing tags
- Save content to `css/styles.css`
- Ensure no CSS is lost in translation

### Task 2.2: Update index.html
- Remove `<style>` block (if any remains)
- Verify `<link rel="stylesheet" href="css/styles.css">` exists in `<head>`

### Task 2.3: Test
- Open `index.html` in browser
- Verify all styles load
- Check console for CSS errors
- Visually verify layout matches original

**Success Criteria:**
- ✅ `css/styles.css` contains all styles
- ✅ Page renders with correct styling
- ✅ No broken layouts or missing styles

---

## Phase 3: Extract Core Systems

### Task 3.1: Extract Utilities (`js/core/utils.js`)

**Source Lines:** 1378-1417, 1406, 1592-1625

Extract these functions:
```javascript
function clampStat(key, value)
function applyStatChange(key, delta, opts = {})
function escapeHTML(text)
function rollDice(modifier = 0)
function resolveAction(stat, difficulty = 7, bonus = 0)
```

**Pattern:**
```javascript
(function() {
    'use strict';
    
    function clampStat(key, value) {
        // ... function body from original
    }
    
    // Make available globally
    window.clampStat = clampStat;
    window.applyStatChange = applyStatChange;
    window.escapeHTML = escapeHTML;
    window.rollDice = rollDice;
    window.resolveAction = resolveAction;
})();
```

### Task 3.2: Extract Constants (`js/core/constants.js`)

**Source Lines:** 1122-1298, 1242-1249

Extract:
- `CHAPTERS` object (lines 1122-1168)
- `PATRONS` object (lines 1250-1298)
- `KIT_TIER_MAP` (lines 1242-1249)
- `statLimits` (lines 1299-1314)

**Pattern:**
```javascript
(function() {
    'use strict';
    
    const CHAPTERS = {
        // ... copy from original
    };
    
    const PATRONS = {
        // ... copy from original
    };
    
    // Make available globally
    window.CHAPTERS = CHAPTERS;
    window.PATRONS = PATRONS;
    window.KIT_TIER_MAP = KIT_TIER_MAP;
    window.statLimits = statLimits;
})();
```

### Task 3.3: Extract Game State (`js/core/gameState.js`)

**Source Lines:** 1040-1119

Extract:
- `makeDefaultGameState()` function (if it exists)
- Or create it from `gameState` initialization (lines 1040-1118)

**Pattern:**
```javascript
(function() {
    'use strict';
    
    function makeDefaultGameState() {
        return {
            stats: {
                strength: 5,
                agility: 5,
                // ... all default values
            },
            faction: "English",
            age: 27,
            // ... copy entire gameState structure
        };
    }
    
    // Initialize gameState globally
    window.gameState = makeDefaultGameState();
    window.makeDefaultGameState = makeDefaultGameState;
})();
```

### Task 3.4: Update index.html Script Tags
Add to `<head>` or before `</body>`:
```html
<script src="js/core/utils.js"></script>
<script src="js/core/constants.js"></script>
<script src="js/core/gameState.js"></script>
```

**Verification:**
- ✅ All utility functions work
- ✅ Constants are accessible via `window`
- ✅ `gameState` initializes correctly
- ✅ No console errors

---

## Phase 4: Extract Game Systems

### Task 4.1: Currency System (`js/systems/currency-system.js`)

**Source Lines:** 1315-1417

Extract:
- `formatCurrency(pence)`
- `parseCurrency(str)`
- `getFormattedWealth()`

**Pattern:** Wrap in IIFE, expose via `window`

### Task 4.2: Condition System (`js/systems/condition-system.js`)

**Source Lines:** 2051-2078, 2386-2469

Extract:
- `addCondition(name, type, duration)`
- `removeCondition(name)`
- `hasCondition(name)`
- `updateConditions()`
- `getConditionEffects()`

### Task 4.3: Chapter System (`js/systems/chapter-system.js`)

**Source Lines:** 1120-1168, 1170-1241

Extract:
- `CHAPTERS` constant (if not already in constants.js - check first)
- `checkChapterTransition()`
- `getCurrentChapter()`
- `getChapterDeathModifier()`

**Note:** If `CHAPTERS` is already in `constants.js`, only extract functions here.

### Task 4.4: Campfire System (`js/systems/campfire-system.js`)

**Source Lines:** 1418-1625

Extract:
- `clampRel(n)`
- `changeRel(who, delta)`
- `getSceneIntensity(sceneKey)`
- `shouldInsertCampfire(nextSceneKey)`
- `maybeInsertCampfire(nextSceneKey)`
- Helper functions for campfire logic

### Task 4.5: Skirmish System (`js/systems/skirmish-system.js`)

**Source Lines:** 1626-2078

Extract:
- `computeSkirmishModifiers(choiceId)`
- `computeSkirmishCosts(result, choiceId, mods)`
- `applySkirmishDeltas(deltas)`
- `buildFormulaText(...)`
- `buildCostList(...)`
- `buildGearCallouts(...)`
- `getPostSkirmishNextScene()`

### Task 4.6: Roguelike System (`js/systems/roguelike-system.js`)

**Source Lines:** 2079-2470

Extract:
- `calculateArmorProtection()`
- `calculateBadOutcomeChance(...)`
- `selectBadOutcome(...)`
- `applyBadOutcome(outcome)`
- `shouldCheckArbitraryDeathOnEnter(sceneKey)`
- `checkArbitraryDeath()`
- `checkStressCapDisorders()`
- `ARBITRARY_DEATH_EVENTS` array
- `PSYCHOLOGICAL_DISORDERS` array

### Task 4.7: Update index.html
Add script tags in order:
```html
<script src="js/systems/condition-system.js"></script>
<script src="js/systems/currency-system.js"></script>
<script src="js/systems/chapter-system.js"></script>
<script src="js/systems/campfire-system.js"></script>
<script src="js/systems/skirmish-system.js"></script>
<script src="js/systems/roguelike-system.js"></script>
```

**Verification:**
- ✅ All system functions accessible
- ✅ Functions can call each other
- ✅ No dependency errors
- ✅ Test each system independently

---

## Phase 5: Extract Scene Definitions

### Task 5.1: Extract Campfire Vignettes (`js/scenes/campfire/vignettes.js`)

**Source Lines:** 2472-4620

Extract the entire `CAMPFIRE_VIGNETTES` array.

**Pattern:**
```javascript
(function() {
    'use strict';
    
    const CAMPFIRE_VIGNETTES = [
        // ... copy entire array from original
    ];
    
    window.CAMPFIRE_VIGNETTES = CAMPFIRE_VIGNETTES;
})();
```

### Task 5.2: Extract Character Creation (`js/scenes/character-creation.js`)

**Source Lines:** 4623-4846

Extract scenes:
- `character_creation`
- `quick_start_review`

**Pattern:**
```javascript
(function() {
    'use strict';
    
    if (typeof window.scenes === 'undefined') {
        window.scenes = {};
    }
    
    Object.assign(window.scenes, {
        character_creation: {
            // ... copy scene definition
        },
        quick_start_review: {
            // ... copy scene definition
        }
    });
})();
```

### Task 5.3: Extract Training Scenes (`js/scenes/training/`)

**Source Lines:** 4847-5807

Create files:
- `js/scenes/training/training-scenes.js` (all training scenes in one file)

Scenes to extract:
- `start`
- `training_rural_peasant`
- `training_weapons`
- `training_formation`
- `training_conditioning`
- `training_comrades`
- `training_final_assessment`
- `training_weapons_resolve`
- `training_formation_resolve`
- `training_conditioning_resolve`
- `training_comrades_resolve`
- `training_manor_retainer`
- `training_craftsman_apprentice`
- `training_squire`
- `training_minor_noble`
- `training_peasant`
- `training_merchant`
- `training_noble`

**Pattern:** Use same pattern as character-creation.js, add all scenes to `window.scenes`

### Task 5.4: Extract Battle Scenes (`js/scenes/battles/battle-scenes.js`)

**Source Lines:** 5588-5807, 6188-6861, 6670-6955

Extract all battle-related scenes:
- `first_battle_brave`
- `first_battle_cautious`
- `first_battle_tactical`
- `first_battle_leader`
- `first_battle_brave_resolve`
- `first_battle_leader_resolve`
- `forest_ambush_1340`
- `forest_ambush_1340_resolve`
- `siege_defense_1345`
- `siege_defense_1345_resolve`
- `cavalry_skirmish_1342`
- `cavalry_skirmish_1342_resolve`
- `night_raid_1347`
- `night_raid_1347_resolve`
- `town_fighting_1348`
- `town_fighting_1348_resolve`
- `archery_duel_1339`
- `archery_duel_1339_resolve`
- `river_crossing_1344`
- `river_crossing_1344_resolve`
- `last_stand_1350`
- `last_stand_1350_resolve`

### Task 5.5: Extract Campaign Scenes (`js/scenes/campaigns/campaign-scenes.js`)

**Source Lines:** 5808-6187, 6960-9167, 9169-14439

Extract all campaign scenes:
- `winter_quarters`
- `marriage_joke`
- `equipment_upgrade_1340`
- `between_years_1341` through `between_years_1345`
- `campaign_delayed_1345`
- `spring_campaign`
- All 1346 campaign scenes (indenture, portsmouth, purveyance, channel_crossing, saint_vaast_landing, chevauchée scenes, caen scenes, denuded_country, blanchetaque_ford, crecy scenes, calais scenes, etc.)
- All 1347 scenes (winter_flux, calais scenes)

**Note:** This is a large section. Extract carefully, maintaining all scene definitions.

### Task 5.6: Extract Transition Scenes (`js/scenes/transitions/transition-scenes.js`)

**Source Lines:** 5903-6151

Extract:
- `between_years_1341`
- `between_years_1342`
- `between_years_1343`
- `between_years_1344`
- `between_years_1345`
- `return_to_england_1344`

### Task 5.7: Extract Encounter Scenes (`js/scenes/encounters/encounter-scenes.js`)

**Source Lines:** 10728-11180, and any other random encounter scenes

Extract:
- `marsh_crossing`
- `night_march`
- `supply_shortage`
- `river_crossing`
- `enemy_scouts`
- `march_continues`
- `dawn_arrival`
- `marsh_exit`
- `better_route`
- `scout_discovery`
- `successful_crossing`
- `safer_crossing`
- `organized_crossing`
- `alternate_ford`
- `hunting_expedition`
- `village_raid`
- `supply_arrives`
- `gambling_outcome`
- All other encounter/resolution scenes

### Task 5.8: Update index.html Script Tags
Add scene scripts in order:
```html
<script src="js/scenes/campfire/vignettes.js"></script>
<script src="js/scenes/character-creation.js"></script>
<script src="js/scenes/training/training-scenes.js"></script>
<script src="js/scenes/battles/battle-scenes.js"></script>
<script src="js/scenes/campaigns/campaign-scenes.js"></script>
<script src="js/scenes/transitions/transition-scenes.js"></script>
<script src="js/scenes/encounters/encounter-scenes.js"></script>
```

**Verification:**
- ✅ All scenes accessible via `window.scenes`
- ✅ Scene count matches original (~237 scenes)
- ✅ No missing scene errors
- ✅ Scene structure identical to original

---

## Phase 6: Extract UI Components

### Task 6.1: Extract Modals (`js/ui/modals.js`)

**Source Lines:** ~19900-20043, and any other modal functions

Extract:
- `showStats()`
- `showNotification(title, message, type)`
- Any other modal/dialog functions

**Pattern:**
```javascript
(function() {
    'use strict';
    
    function showStats() {
        // ... function body
    }
    
    window.showStats = showStats;
    window.showNotification = showNotification;
})();
```

### Task 6.2: Extract Sidebar (`js/ui/sidebar.js`)

**Source Lines:** Find sidebar update functions (search for "sidebar", "status-bar", "relationships-container")

Extract:
- Functions that update sidebar stats
- Functions that update relationships display
- Functions that update equipment display

### Task 6.3: Extract Choices Handler (`js/ui/choices.js`)

**Source Lines:** Find choice rendering/handling functions

Extract:
- Functions that create choice buttons
- Functions that handle choice selection
- Functions that process choice effects
- Resolution handling functions

### Task 6.4: Extract Renderer (`js/ui/renderer.js`)

**Source Lines:** Find main scene rendering function (likely `loadScene` or similar)

Extract:
- Main scene rendering function
- Text rendering logic
- Artwork display logic
- Scene transition logic

**Note:** This is likely the most complex extraction. Find the main function that:
- Takes a scene key
- Renders the scene text
- Displays artwork
- Creates choice buttons
- Updates UI

### Task 6.5: Update index.html
Add UI scripts:
```html
<script src="js/ui/modals.js"></script>
<script src="js/ui/sidebar.js"></script>
<script src="js/ui/choices.js"></script>
<script src="js/ui/renderer.js"></script>
```

**Verification:**
- ✅ UI functions accessible
- ✅ Can render a scene
- ✅ Choices display correctly
- ✅ Sidebar updates

---

## Phase 7: Create Main Game Loop

### Task 7.1: Extract Main Initialization (`js/main.js`)

**Source Lines:** Find initialization code (likely near end of file, lines 20000+)

Extract:
- Game initialization function
- Event listeners setup
- Initial scene loading
- Any startup logic

**Pattern:**
```javascript
(function() {
    'use strict';
    
    function initGame() {
        // Initialize game state
        // Set up event listeners
        // Load initial scene
    }
    
    // Auto-initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGame);
    } else {
        initGame();
    }
})();
```

### Task 7.2: Extract Scene Management
Extract functions that:
- Handle scene transitions
- Process scene choices
- Update game state between scenes
- Handle scene callbacks (onEnter, etc.)

### Task 7.3: Update index.html
Add main script last:
```html
<script src="js/main.js"></script>
```

**Verification:**
- ✅ Game initializes
- ✅ First scene loads
- ✅ Can make choices
- ✅ Scene transitions work

---

## Phase 8: Final Integration & Testing

### Task 8.1: Verify Script Loading Order
Ensure scripts load in correct dependency order:
1. Utils (no dependencies)
2. Constants (may use utils)
3. Game State (uses constants)
4. Systems (use gameState, constants, utils)
5. Scenes (use systems)
6. UI (use scenes, systems)
7. Main (uses everything)

### Task 8.2: Test Complete Game Flow
1. **Character Creation:**
   - [ ] Can create character
   - [ ] Stats initialize correctly
   - [ ] Can proceed to start scene

2. **Training:**
   - [ ] Training scenes load
   - [ ] Can make training choices
   - [ ] Stats update correctly
   - [ ] Can proceed to first battle

3. **First Battle:**
   - [ ] Battle scenes load
   - [ ] Combat mechanics work
   - [ ] Resolution scenes work
   - [ ] Can proceed to winter quarters

4. **Campaign:**
   - [ ] Year transition scenes work
   - [ ] 1346 campaign loads
   - [ ] All campaign scenes accessible
   - [ ] Scene transitions work

5. **Systems:**
   - [ ] Campfire system triggers
   - [ ] Currency displays correctly
   - [ ] Conditions apply/remove
   - [ ] Death mechanics work
   - [ ] Skirmish system functions

### Task 8.3: Fix Any Issues
- Debug console errors
- Fix missing dependencies
- Correct function references
- Verify all scenes accessible

### Task 8.4: Performance Check
- [ ] Page loads in reasonable time
- [ ] No memory leaks
- [ ] Scene transitions are smooth
- [ ] Performance matches or exceeds original

---

## Code Patterns & Standards

### IIFE Pattern (Use for all modules)
```javascript
(function() {
    'use strict';
    
    // Your code here
    
    // Expose to global scope
    window.functionName = functionName;
    window.constantName = constantName;
})();
```

### Scene Extraction Pattern
```javascript
(function() {
    'use strict';
    
    // Ensure scenes object exists
    if (typeof window.scenes === 'undefined') {
        window.scenes = {};
    }
    
    // Add scenes
    Object.assign(window.scenes, {
        scene_name: {
            title: "Scene Title",
            year: function() { return gameState.year; },
            age: function() { return gameState.age; },
            location: function() { return gameState.location; },
            text: function() {
                // Scene text
            },
            choices: [
                // Choices
            ]
        }
    });
})();
```

### Function Extraction Pattern
```javascript
(function() {
    'use strict';
    
    function myFunction(param1, param2) {
        // Function body - copy exactly from original
        // Maintain all logic, comments, error handling
    }
    
    // Make available globally
    window.myFunction = myFunction;
})();
```

---

## Critical Rules

1. **Never modify logic** - Copy functions exactly, don't "improve" them
2. **Preserve comments** - Keep all original comments
3. **Maintain formatting** - Keep original code style
4. **Test incrementally** - Test after each phase
5. **Handle dependencies** - Ensure functions can access what they need
6. **Global scope** - Use `window` object for all exports
7. **No ES6 modules** - Use IIFE pattern, not import/export
8. **Script order matters** - Load dependencies before dependents

---

## Testing Checklist

After each phase, verify:

### Phase 2 (CSS)
- [ ] Page styles correctly
- [ ] No broken layouts
- [ ] Responsive design works

### Phase 3 (Core)
- [ ] `window.utils` functions work
- [ ] `window.CHAPTERS` accessible
- [ ] `window.gameState` initializes
- [ ] No console errors

### Phase 4 (Systems)
- [ ] All system functions accessible
- [ ] Systems can call each other
- [ ] No dependency errors

### Phase 5 (Scenes)
- [ ] `window.scenes` contains all scenes
- [ ] Scene count matches original
- [ ] Can access scenes by key

### Phase 6 (UI)
- [ ] Can render scenes
- [ ] Choices display
- [ ] Sidebar updates
- [ ] Modals work

### Phase 7 (Main)
- [ ] Game initializes
- [ ] First scene loads
- [ ] Can interact with game

### Phase 8 (Integration)
- [ ] Complete game flow works
- [ ] All features functional
- [ ] Performance acceptable
- [ ] No console errors

---

## Error Handling

If you encounter errors:

1. **Missing function:** Check if function is in correct module and loaded
2. **Undefined variable:** Verify it's exposed via `window`
3. **Script order:** Check loading order matches dependencies
4. **Scope issues:** Ensure functions are in global scope via `window`

**Debugging Tips:**
- Use `console.log(window.functionName)` to verify function exists
- Check browser console for specific error messages
- Verify script tags are in correct order
- Check that all dependencies are loaded before use

---

## Success Criteria

Refactoring is complete when:

1. ✅ All code extracted from `man-at-arms.html`
2. ✅ `index.html` is minimal (just structure + script tags)
3. ✅ All functionality works identically to original
4. ✅ No console errors
5. ✅ File structure is logical and navigable
6. ✅ Code is easier to maintain
7. ✅ Performance is same or better

---

## Rollback Instructions

If refactoring fails:

1. Stop immediately
2. Restore from backup:
   ```bash
   cp -r ../man-at-arms-backup-20260205-223410/* .
   ```
3. Verify original works
4. Document what went wrong
5. Fix issues and retry

---

## Final Notes

- **Take your time** - This is a large refactoring, accuracy is more important than speed
- **Test frequently** - Don't wait until the end to test
- **Document issues** - Note any problems you encounter
- **Ask for help** - If stuck, document the issue clearly

**Ready to begin? Start with Phase 1!**

---

*End of Refactoring Prompt*
