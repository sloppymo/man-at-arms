# Man-at-Arms Refactoring Plan
## Complete File Structure Reorganization

**Date Created:** 2025-02-05  
**Backup Location:** `man-at-arms-backup-20260205-223410/`  
**Current File:** `man-at-arms.html` (20,324 lines)  
**Target:** Modular, maintainable codebase

---

## Executive Summary

This plan outlines a comprehensive refactoring of the monolithic `man-at-arms.html` file into a well-organized, modular structure. The refactoring will improve maintainability, enable collaboration, and make the codebase significantly easier to work with.

**Estimated Time:** 2-3 days  
**Risk Level:** Medium (with proper testing)  
**Benefits:** Very High (10x productivity improvement)

---

## Current Structure Analysis

### File Breakdown
- **Total Lines:** 20,324
- **CSS:** ~900 lines (lines 7-919)
- **HTML Structure:** ~100 lines (lines 920-1020)
- **JavaScript:** ~19,200 lines (lines 1020-20324)
  - Game State & Constants: ~500 lines
  - Core Systems: ~3,000 lines
  - Scene Definitions: ~15,000 lines
  - UI Functions: ~700 lines

### Major Components Identified

1. **CSS Styles** (lines 7-919)
   - Global styles, layout, components
   - Animations and responsive design

2. **Game State** (lines 1040-1119)
   - `gameState` object initialization
   - Default values and configuration

3. **Chapter System** (lines 1120-1168)
   - `CHAPTERS` constant
   - Chapter transition functions

4. **Patron System** (lines 1250-1298)
   - `PATRONS` constant
   - Patron definitions

5. **Currency System** (lines 1315-1417)
   - Historical currency conversion
   - Formatting functions

6. **Campfire System** (lines 1418-1625)
   - Relationship management
   - Campfire insertion logic
   - Vignette system

7. **Skirmish System** (lines 1626-2078)
   - Combat calculations
   - Modifier computation
   - Cost calculations

8. **Roguelike Mechanics** (lines 2079-2470)
   - Death mechanics
   - Psychological disorders
   - Condition effects

9. **Campfire Vignettes** (lines 2472-4620)
   - ~20+ vignette definitions

10. **Scene Definitions** (lines 4622-14439)
    - ~237 scene objects
    - Character creation
    - Training scenes
    - Battle scenes
    - Campaign scenes
    - Random encounters

11. **UI & Rendering** (lines 14440-20324)
    - Scene rendering
    - Choice handling
    - Stat display
    - Modal functions

---

## Target Structure

```
man-at-arms/
├── index.html                    # Minimal HTML structure
├── css/
│   └── styles.css               # All CSS (extracted from <style> tag)
├── js/
│   ├── core/
│   │   ├── gameState.js         # Game state initialization
│   │   ├── constants.js          # Shared constants (PATRONS, CHAPTERS, etc.)
│   │   └── utils.js              # Utility functions (escapeHTML, clampStat, etc.)
│   ├── systems/
│   │   ├── chapter-system.js     # Chapter management
│   │   ├── currency-system.js     # Currency formatting/conversion
│   │   ├── campfire-system.js    # Campfire logic & vignettes
│   │   ├── skirmish-system.js    # Combat/skirmish calculations
│   │   ├── roguelike-system.js   # Death mechanics, disorders
│   │   └── condition-system.js   # Condition management
│   ├── scenes/
│   │   ├── index.js              # Scene registry & loader
│   │   ├── character-creation.js # Character creation scenes
│   │   ├── training/
│   │   │   ├── index.js          # Training scene exports
│   │   │   ├── training-rural-peasant.js
│   │   │   ├── training-weapons.js
│   │   │   ├── training-formation.js
│   │   │   └── ... (all training scenes)
│   │   ├── battles/
│   │   │   ├── index.js
│   │   │   ├── first-battle.js
│   │   │   ├── crecy.js
│   │   │   └── ... (all battle scenes)
│   │   ├── campaigns/
│   │   │   ├── index.js
│   │   │   ├── 1346-campaign.js  # Spring campaign, indenture, etc.
│   │   │   ├── calais-siege.js
│   │   │   └── ... (campaign scenes)
│   │   ├── transitions/
│   │   │   ├── index.js
│   │   │   ├── between-years.js  # All between_years_* scenes
│   │   │   └── ... (transition scenes)
│   │   ├── encounters/
│   │   │   ├── index.js
│   │   │   ├── random-encounters.js
│   │   │   └── ... (random encounter scenes)
│   │   └── campfire/
│   │       ├── index.js
│   │       └── vignettes.js       # All campfire vignettes
│   ├── ui/
│   │   ├── renderer.js           # Scene rendering
│   │   ├── sidebar.js             # Sidebar management
│   │   ├── choices.js             # Choice handling
│   │   └── modals.js              # Modal dialogs
│   └── main.js                    # Main game loop & initialization
├── equipment/                     # Already separated
│   ├── man-at-arms-equipment-system.js
│   └── man-at-arms-equipment-ui.js
├── artwork/                       # Already exists
└── man-at-arms-enemy-profiles.js  # Already separated
```

---

## Phase-by-Phase Refactoring Plan

### Phase 1: Preparation & Setup (30 minutes)

#### Step 1.1: Create Directory Structure
```bash
mkdir -p css
mkdir -p js/core js/systems js/scenes/training js/scenes/battles js/scenes/campaigns js/scenes/transitions js/scenes/encounters js/scenes/campfire js/ui
```

#### Step 1.2: Verify Backup
- Confirm backup exists: `man-at-arms-backup-20260205-223410/`
- Test that backup is complete and functional

#### Step 1.3: Create New index.html Skeleton
- Copy basic HTML structure
- Add script tags in correct order
- Add CSS link

**Files to Create:**
- `index.html` (new minimal version)

---

### Phase 2: Extract CSS (1-2 hours)

#### Step 2.1: Extract Styles
- Copy lines 7-919 from `man-at-arms.html`
- Remove `<style>` tags
- Save to `css/styles.css`

#### Step 2.2: Update HTML
- Remove `<style>` block from `index.html`
- Add `<link rel="stylesheet" href="css/styles.css">` in `<head>`

#### Step 2.3: Test
- Open `index.html` in browser
- Verify styles load correctly
- Check for any missing styles

**Files to Create:**
- `css/styles.css`

**Files to Modify:**
- `index.html`

---

### Phase 3: Extract Core Systems (3-4 hours)

#### Step 3.1: Extract Game State
**Source:** Lines 1040-1119  
**Target:** `js/core/gameState.js`

```javascript
// js/core/gameState.js
function makeDefaultGameState() {
    return {
        stats: { /* ... */ },
        faction: "English",
        age: 27,
        // ... all gameState properties
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { makeDefaultGameState };
}
```

#### Step 3.2: Extract Constants
**Source:** Lines 1122-1298, 1242-1249  
**Target:** `js/core/constants.js`

```javascript
// js/core/constants.js
const CHAPTERS = { /* ... */ };
const PATRONS = { /* ... */ };
const KIT_TIER_MAP = { /* ... */ };
const statLimits = { /* ... */ };

// Make available globally
window.CHAPTERS = CHAPTERS;
window.PATRONS = PATRONS;
window.KIT_TIER_MAP = KIT_TIER_MAP;
window.statLimits = statLimits;
```

#### Step 3.3: Extract Utilities
**Source:** Lines 1378-1417, 1406  
**Target:** `js/core/utils.js`

Functions to extract:
- `clampStat(key, value)`
- `applyStatChange(key, delta, opts)`
- `escapeHTML(text)`
- `formatCurrency(pence)` (or move to currency-system.js)
- `parseCurrency(str)`
- `getFormattedWealth()`
- `rollDice(modifier)`
- `resolveAction(stat, difficulty, bonus)`

**Files to Create:**
- `js/core/gameState.js`
- `js/core/constants.js`
- `js/core/utils.js`

**Files to Modify:**
- `index.html` (add script tags)

---

### Phase 4: Extract Game Systems (4-6 hours)

#### Step 4.1: Chapter System
**Source:** Lines 1120-1168, 1170-1241  
**Target:** `js/systems/chapter-system.js`

Functions:
- `checkChapterTransition()`
- `getCurrentChapter()`
- `getChapterDeathModifier()`

#### Step 4.2: Currency System
**Source:** Lines 1315-1417  
**Target:** `js/systems/currency-system.js`

Functions:
- `formatCurrency(pence)`
- `parseCurrency(str)`
- `getFormattedWealth()`

#### Step 4.3: Campfire System
**Source:** Lines 1418-1625, 2472-4620  
**Target:** `js/systems/campfire-system.js` and `js/scenes/campfire/vignettes.js`

Functions:
- `clampRel(n)`
- `changeRel(who, delta)`
- `getSceneIntensity(sceneKey)`
- `shouldInsertCampfire(nextSceneKey)`
- `maybeInsertCampfire(nextSceneKey)`

Constants:
- `CAMPFIRE_VIGNETTES` array → `js/scenes/campfire/vignettes.js`

#### Step 4.4: Skirmish System
**Source:** Lines 1626-2078  
**Target:** `js/systems/skirmish-system.js`

Functions:
- `computeSkirmishModifiers(choiceId)`
- `computeSkirmishCosts(result, choiceId, mods)`
- `applySkirmishDeltas(deltas)`
- `buildFormulaText(...)`
- `buildCostList(...)`
- `buildGearCallouts(...)`
- `getPostSkirmishNextScene()`

#### Step 4.5: Condition System
**Source:** Lines 2051-2078, 2386-2469  
**Target:** `js/systems/condition-system.js`

Functions:
- `addCondition(name, type, duration)`
- `removeCondition(name)`
- `hasCondition(name)`
- `updateConditions()`
- `getConditionEffects()`

#### Step 4.6: Roguelike System
**Source:** Lines 2079-2470  
**Target:** `js/systems/roguelike-system.js`

Functions:
- `calculateArmorProtection()`
- `calculateBadOutcomeChance(...)`
- `selectBadOutcome(...)`
- `applyBadOutcome(outcome)`
- `shouldCheckArbitraryDeathOnEnter(sceneKey)`
- `checkArbitraryDeath()`
- `checkStressCapDisorders()`

Constants:
- `ARBITRARY_DEATH_EVENTS`
- `PSYCHOLOGICAL_DISORDERS`

**Files to Create:**
- `js/systems/chapter-system.js`
- `js/systems/currency-system.js`
- `js/systems/campfire-system.js`
- `js/systems/skirmish-system.js`
- `js/systems/condition-system.js`
- `js/systems/roguelike-system.js`
- `js/scenes/campfire/vignettes.js`

---

### Phase 5: Extract Scene Definitions (8-12 hours)

#### Step 5.1: Create Scene Registry
**Target:** `js/scenes/index.js`

This file will:
- Import all scene modules
- Combine them into a single `scenes` object
- Export for use in main.js

```javascript
// js/scenes/index.js
import { characterCreation } from './character-creation.js';
import * as training from './training/index.js';
import * as battles from './battles/index.js';
// ... etc

const scenes = {
    ...characterCreation,
    ...training,
    ...battles,
    // ... combine all scenes
};

window.scenes = scenes; // Make globally available
```

#### Step 5.2: Extract Character Creation
**Source:** Lines 4623-4733  
**Target:** `js/scenes/character-creation.js`

Scenes:
- `character_creation`
- `quick_start_review`

#### Step 5.3: Extract Training Scenes
**Source:** Lines 4981-5807  
**Target:** `js/scenes/training/` (multiple files)

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

**File Structure:**
```
js/scenes/training/
├── index.js (exports all training scenes)
├── training-rural-peasant.js
├── training-weapons.js
├── training-formation.js
└── ... (one file per scene or logical group)
```

#### Step 5.4: Extract Battle Scenes
**Source:** Lines 5588-5807, 6188-6861  
**Target:** `js/scenes/battles/`

Scenes:
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

#### Step 5.5: Extract Campaign Scenes
**Source:** Lines 5808-6187, 6960-9167  
**Target:** `js/scenes/campaigns/`

Scenes:
- `winter_quarters`
- `marriage_joke`
- `equipment_upgrade_1340`
- `between_years_1341` through `between_years_1345`
- `campaign_delayed_1345`
- `spring_campaign`
- `indenture_table`
- `indenture_negotiate`
- `indenture_prisoners`
- `indenture_sign`
- `portsmouth_muster`
- `purveyance`
- `channel_crossing`
- `saint_vaast_landing`
- All 1346 campaign scenes (Caen, Crécy, Calais, etc.)

#### Step 5.6: Extract Transition Scenes
**Source:** Lines 5903-6151  
**Target:** `js/scenes/transitions/`

Scenes:
- `between_years_1341`
- `between_years_1342`
- `between_years_1343`
- `between_years_1344`
- `between_years_1345`
- `return_to_england_1344`

#### Step 5.7: Extract Random Encounter Scenes
**Source:** Lines 10728-11180 (and scattered throughout)  
**Target:** `js/scenes/encounters/`

Scenes:
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
- All resolution scenes for encounters

#### Step 5.8: Extract Campfire Vignettes
**Source:** Lines 2472-4620  
**Target:** `js/scenes/campfire/vignettes.js`

All `CAMPFIRE_VIGNETTES` array entries.

**Files to Create:**
- `js/scenes/index.js`
- `js/scenes/character-creation.js`
- `js/scenes/training/index.js` + individual training scene files
- `js/scenes/battles/index.js` + individual battle scene files
- `js/scenes/campaigns/index.js` + campaign scene files
- `js/scenes/transitions/index.js` + transition scene files
- `js/scenes/encounters/index.js` + encounter scene files
- `js/scenes/campfire/vignettes.js`

---

### Phase 6: Extract UI & Rendering (3-4 hours)

#### Step 6.1: Scene Renderer
**Source:** Lines 15992-16225 (approximately)  
**Target:** `js/ui/renderer.js`

Functions:
- Main scene rendering logic
- Text rendering
- Artwork display

#### Step 6.2: Choice Handler
**Source:** Lines 16226-16500 (approximately)  
**Target:** `js/ui/choices.js`

Functions:
- Choice button creation
- Choice selection handling
- Resolution processing

#### Step 6.3: Sidebar Manager
**Source:** Lines 16501-17000 (approximately)  
**Target:** `js/ui/sidebar.js`

Functions:
- Stat display updates
- Relationship display
- Equipment display

#### Step 6.4: Modal Functions
**Source:** Lines 19900-20043 (approximately)  
**Target:** `js/ui/modals.js`

Functions:
- `showStats()`
- `showNotification()`
- Other modal dialogs

**Files to Create:**
- `js/ui/renderer.js`
- `js/ui/choices.js`
- `js/ui/sidebar.js`
- `js/ui/modals.js`

---

### Phase 7: Create Main Game Loop (2-3 hours)

#### Step 7.1: Main Initialization
**Target:** `js/main.js`

This file will:
- Initialize game state
- Set up event listeners
- Handle scene transitions
- Coordinate all systems

**Key Functions:**
- `initGame()`
- `loadScene(sceneKey)`
- `handleChoice(choice)`
- `updateUI()`

**Files to Create:**
- `js/main.js`

---

### Phase 8: Update HTML & Script Loading (1 hour)

#### Step 8.1: Create New index.html
**Target:** `index.html`

Structure:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>A Man-at-Arms' Life - 100 Years War</title>
    <link rel="stylesheet" href="css/styles.css">
    
    <!-- External modules (already separated) -->
    <script src="man-at-arms-enemy-profiles.js"></script>
    <script src="man-at-arms-equipment-system.js"></script>
    <script src="man-at-arms-equipment-ui.js"></script>
</head>
<body>
    <div class="game-container">
        <!-- HTML structure only -->
    </div>
    
    <!-- Core systems (load first) -->
    <script src="js/core/utils.js"></script>
    <script src="js/core/constants.js"></script>
    <script src="js/core/gameState.js"></script>
    
    <!-- Game systems -->
    <script src="js/systems/condition-system.js"></script>
    <script src="js/systems/currency-system.js"></script>
    <script src="js/systems/chapter-system.js"></script>
    <script src="js/systems/campfire-system.js"></script>
    <script src="js/systems/skirmish-system.js"></script>
    <script src="js/systems/roguelike-system.js"></script>
    
    <!-- Scenes -->
    <script src="js/scenes/campfire/vignettes.js"></script>
    <script src="js/scenes/character-creation.js"></script>
    <script src="js/scenes/training/index.js"></script>
    <script src="js/scenes/battles/index.js"></script>
    <script src="js/scenes/campaigns/index.js"></script>
    <script src="js/scenes/transitions/index.js"></script>
    <script src="js/scenes/encounters/index.js"></script>
    <script src="js/scenes/index.js"></script>
    
    <!-- UI -->
    <script src="js/ui/modals.js"></script>
    <script src="js/ui/sidebar.js"></script>
    <script src="js/ui/choices.js"></script>
    <script src="js/ui/renderer.js"></script>
    
    <!-- Main game loop (load last) -->
    <script src="js/main.js"></script>
</body>
</html>
```

**Files to Modify:**
- `index.html` (complete rewrite)

---

## Detailed Extraction Guide

### Scene Extraction Pattern

For each scene file, use this pattern:

```javascript
// js/scenes/training/training-weapons.js
(function() {
    'use strict';
    
    // Ensure scenes object exists
    if (typeof window.scenes === 'undefined') {
        window.scenes = {};
    }
    
    // Add scenes to global scenes object
    Object.assign(window.scenes, {
        training_weapons: {
            title: "Weapon Training",
            year: 1337,
            age: function() { return gameState.age; },
            location: "England",
            // ... rest of scene definition
        },
        training_weapons_resolve: {
            // ... scene definition
        }
    });
})();
```

### System Extraction Pattern

For system files:

```javascript
// js/systems/chapter-system.js
(function() {
    'use strict';
    
    // Constants
    const CHAPTERS = {
        // ... chapter definitions
    };
    
    // Functions
    function checkChapterTransition() {
        // ... function body
    }
    
    // Make available globally
    window.CHAPTERS = CHAPTERS;
    window.checkChapterTransition = checkChapterTransition;
})();
```

---

## Script Loading Order

**Critical:** Scripts must load in this order:

1. **Utilities** (no dependencies)
   - `js/core/utils.js`

2. **Constants** (may use utilities)
   - `js/core/constants.js`

3. **Game State** (uses constants)
   - `js/core/gameState.js`

4. **Systems** (use gameState, constants, utils)
   - `js/systems/condition-system.js`
   - `js/systems/currency-system.js`
   - `js/systems/chapter-system.js`
   - `js/systems/campfire-system.js`
   - `js/systems/skirmish-system.js`
   - `js/systems/roguelike-system.js`

5. **Scenes** (use all systems)
   - Campfire vignettes first
   - Then all scene modules
   - Finally scene index

6. **UI** (use scenes, systems)
   - `js/ui/modals.js`
   - `js/ui/sidebar.js`
   - `js/ui/choices.js`
   - `js/ui/renderer.js`

7. **Main** (uses everything)
   - `js/main.js`

---

## Testing Checklist

After each phase, test:

### Phase 2 (CSS Extraction)
- [ ] Page loads without errors
- [ ] All styles render correctly
- [ ] Responsive design works
- [ ] Animations function

### Phase 3 (Core Systems)
- [ ] Game state initializes
- [ ] Constants are accessible
- [ ] Utility functions work
- [ ] No console errors

### Phase 4 (Game Systems)
- [ ] Chapter transitions work
- [ ] Currency formatting works
- [ ] Campfire system functions
- [ ] Skirmish calculations correct
- [ ] Conditions apply/remove correctly
- [ ] Death mechanics trigger appropriately

### Phase 5 (Scenes)
- [ ] All scenes load
- [ ] Scene transitions work
- [ ] Choices function correctly
- [ ] Resolution scenes work
- [ ] No missing scene errors

### Phase 6 (UI)
- [ ] Scenes render correctly
- [ ] Choices display properly
- [ ] Sidebar updates
- [ ] Modals open/close
- [ ] Stats display correctly

### Phase 7 (Main Loop)
- [ ] Game starts correctly
- [ ] Character creation works
- [ ] Scene navigation works
- [ ] Save/load functions (if applicable)
- [ ] All game mechanics function

### Full Integration Test
- [ ] Complete playthrough from start to first battle
- [ ] Test all major systems
- [ ] Verify no console errors
- [ ] Check performance (should be same or better)
- [ ] Test in multiple browsers

---

## Rollback Plan

If refactoring fails:

1. **Stop immediately**
2. **Restore from backup:**
   ```bash
   cp -r man-at-arms-backup-20260205-223410/* man-at-arms/
   ```
3. **Verify original file works**
4. **Document what went wrong**
5. **Fix issues and retry**

---

## Migration Strategy

### Option A: Big Bang (Recommended for Small Team)
- Complete all phases
- Test thoroughly
- Deploy all at once
- **Pros:** Clean break, no intermediate states
- **Cons:** Higher risk, longer testing period

### Option B: Incremental (Recommended for Large Team)
- Complete one phase at a time
- Test after each phase
- Deploy incrementally
- **Pros:** Lower risk, easier debugging
- **Cons:** Longer timeline, intermediate states

**Recommendation:** Use Option A (Big Bang) since this is a single-file project.

---

## Post-Refactoring Improvements

After refactoring is complete, consider:

1. **Add Build Process**
   - Webpack or Vite for bundling
   - Minification for production
   - Source maps for debugging

2. **Add Type Safety**
   - TypeScript conversion
   - JSDoc comments
   - Type definitions

3. **Add Testing**
   - Unit tests for systems
   - Integration tests for scenes
   - E2E tests for gameplay

4. **Add Documentation**
   - README for each module
   - API documentation
   - Architecture diagrams

---

## Estimated Timeline

| Phase | Task | Time | Cumulative |
|-------|------|------|------------|
| 1 | Setup & Preparation | 30 min | 30 min |
| 2 | Extract CSS | 1-2 hours | 2.5 hours |
| 3 | Extract Core Systems | 3-4 hours | 6.5 hours |
| 4 | Extract Game Systems | 4-6 hours | 12.5 hours |
| 5 | Extract Scenes | 8-12 hours | 24.5 hours |
| 6 | Extract UI | 3-4 hours | 28.5 hours |
| 7 | Create Main Loop | 2-3 hours | 31.5 hours |
| 8 | Update HTML | 1 hour | 32.5 hours |
| 9 | Testing & Debugging | 4-6 hours | 38.5 hours |
| **Total** | | **~40 hours** | **~5 days** |

**Realistic Estimate:** 2-3 days of focused work (accounting for breaks, debugging, etc.)

---

## Success Criteria

Refactoring is successful when:

1. ✅ All functionality works identically to original
2. ✅ No console errors
3. ✅ File structure is logical and navigable
4. ✅ Code is easier to maintain
5. ✅ New features can be added easily
6. ✅ Multiple developers can work simultaneously
7. ✅ Performance is same or better

---

## Notes & Considerations

### Global Variables
Many functions rely on global `gameState` and `scenes` objects. Ensure these are:
- Initialized before use
- Accessible to all modules
- Properly scoped

### Function Dependencies
Some functions call others. Document dependencies:
- `applyStatChange` → `clampStat`
- `changeRel` → `clampRel`
- Scene rendering → many utility functions

### Testing Strategy
- Test each extracted module in isolation
- Test integration between modules
- Test full game flow
- Compare behavior to original

### Performance
- Monitor load times
- Check for memory leaks
- Verify no performance regressions
- Consider lazy loading for scenes

---

## Next Steps

1. **Review this plan** - Ensure it makes sense
2. **Create backup** - ✅ Already done
3. **Start with Phase 1** - Create directory structure
4. **Work through phases sequentially** - Don't skip ahead
5. **Test after each phase** - Catch issues early
6. **Document any deviations** - Update plan as needed

---

## Questions to Resolve Before Starting

1. **Module System:** Use ES6 modules or global scope?
   - **Recommendation:** Start with global scope (simpler), migrate to ES6 later

2. **Scene Organization:** One file per scene or group related scenes?
   - **Recommendation:** Group related scenes (e.g., all training scenes in one file)

3. **Build Process:** Add now or later?
   - **Recommendation:** Later - keep it simple for now

4. **Testing Framework:** Add unit tests?
   - **Recommendation:** Manual testing first, add automated tests later

---

**Ready to begin? Start with Phase 1!**

---

*End of Refactoring Plan*
