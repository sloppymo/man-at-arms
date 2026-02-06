# Comprehensive Testing Guide: Narrative Flow Patches v2

**Version:** 1.4.0+ (Post-Patch)
**Date:** Testing Guide
**Scope:** All 19 implemented changes (BLOCKER, HIGH, PATCH, MEDIUM)

---

## 🚨 BLOCKER FIXES (Critical Path)

### B1: Arc-Aware Fallback System + Stub Scenes
**What Changed:** `makeChoice()` now has fallback logic for undefined `nextScene` references. ~30 stub scenes added as safe landing spots.

**Test Cases:**
1. **Undefined Scene Transition**
   - Play through the game normally
   - Trigger any scene that might have an undefined `nextScene`
   - **Expected:** Game should route to a fallback scene (e.g., `march_through_normandy_1` for chevauchée chapter) instead of crashing
   - **Check Console:** Should see `[FALLBACK] Scene not found: <scene> — using arc-aware fallback`

2. **Stub Scene Functionality**
   - Navigate to any stub scene (e.g., `frost_survival`, `compassion_shown`, `shelter_found`)
   - **Expected:** Scene should display with basic text and a "Continue" choice that routes to a valid next scene
   - **Verify:** No JavaScript errors, scene transitions work smoothly

3. **Chapter-Based Fallback**
   - Test fallback routing in different chapters:
     - `chevauchée` → should fallback to `march_through_normandy_1`
     - `calais` → should fallback to `calais_siege`
     - `plague` or `poitiers` → should fallback to `start`
   - **Expected:** Fallback matches current chapter context

### B2: Fix `crecy_battle` → `battle_crecy` References
**What Changed:** Fixed 3 incorrect scene references from `crecy_battle` to `battle_crecy`.

**Test Cases:**
1. **Crécy Battle Flow**
   - Play through to the Battle of Crécy
   - **Expected:** All transitions to Crécy scenes should work without errors
   - **Check:** No console errors about `crecy_battle` not found
   - **Verify:** Player can complete the Crécy battle sequence

2. **Scene Chain Validation**
   - After Crécy, check that `survivedCrecy` flag is set (see P10)
   - **Expected:** Flag should be set in `crecy_defensive`, `crecy_loot`, or `crecy_resolve` scenes

---

## 🔴 HIGH PRIORITY FIXES (Game-Breaking)

### H1: Expand `noCampfire` Coverage
**What Changed:** Added `noCampfire: true` to 37 combat, death, and key narrative scenes.

**Test Cases:**
1. **Combat Scene Exclusion**
   - Play through any combat scene (e.g., `battle_crecy`, `skirmish_roadside`)
   - **Expected:** No campfire interlude should appear immediately after combat
   - **Verify:** Campfire should only appear after 2+ non-combat scenes

2. **Death Scene Exclusion**
   - Trigger a death scene (e.g., `death_combat`, `death_disease`)
   - **Expected:** No campfire insertion after death scenes
   - **Note:** Death scenes should route to `end_game` or restart, not campfire

3. **Key Narrative Scene Exclusion**
   - Play through critical story moments (e.g., `calais_siege`, `village_pillage`)
   - **Expected:** Campfire should not interrupt these key moments
   - **Verify:** Narrative flow remains uninterrupted

4. **Normal Travel Scenes**
   - Play through normal travel/march scenes
   - **Expected:** Campfire can still appear after non-flagged scenes
   - **Verify:** Campfire insertion still works for appropriate scenes

### H2: Fix Chapter 1/2 Transition Overlap
**What Changed:** Fixed logic in `checkChapterTransition()` to ensure 'chevauchée' completes before 'calais' starts at year 1346.

**Test Cases:**
1. **Year 1346 Transition**
   - Play through to year 1346
   - **Expected:** Chapter 1 (chevauchée) should complete before Chapter 2 (calais) begins
   - **Verify:** No overlap where both chapters are active simultaneously
   - **Check:** `gameState.chapter` should transition cleanly from `'chevauchée'` to `'calais'`

2. **Chapter Progress Flags**
   - Check `gameState.chapterProgress` after transition
   - **Expected:** 
     - `chevauchée.completed` should be `true`
     - `calais.started` should be `true`
   - **Verify:** No conflicting chapter states

### H4: Mutual Exclusion in Insertion Pipeline
**What Changed:** Modified `makeChoice()` to ensure only one interlude (skirmish, campfire, or random encounter) is inserted per transition.

**Test Cases:**
1. **Single Interlude Per Transition**
   - Play through multiple scene transitions
   - **Expected:** Only one interlude type should appear per transition
   - **Verify:** Never see skirmish → campfire → random encounter all in one transition
   - **Check Console:** Should see `[QA] Running global insertion pipeline` logs

2. **Skirmish Priority**
   - If skirmish is inserted, campfire and random encounter should be skipped
   - **Expected:** After skirmish resolves, next transition can insert campfire/encounter
   - **Verify:** Skirmish doesn't chain into another interlude immediately

3. **Campfire Priority Over Random Encounter**
   - If campfire is inserted, random encounter should be skipped
   - **Expected:** Random encounter only appears if neither skirmish nor campfire is inserted
   - **Verify:** No double-insertion

4. **Skirmish Resolve Exit Flow**
   - Complete a skirmish and exit via `skirmish_roadside_resolve`
   - **Expected:** Global insertion pipeline should be skipped (see console log: `[QA] SKIPPED global insertion pipeline`)
   - **Verify:** Skirmish resolve has its own controlled exit flow

---

## 🔧 PATCH ITEMS (Narrative & Mechanics)

### P1: Replace "Continue" Buttons in `between_years` Scenes
**What Changed:** `between_years_1341`, `1342`, `1343`, `1344` now have meaningful activity choices instead of single "Continue" button.

**Test Cases:**
1. **Between Years 1341**
   - Reach year 1341
   - **Expected:** Should see 3+ activity choices (e.g., "Train with your comrades," "Seek out local entertainment," "Curry favour with your lord")
   - **Verify:** Each choice has different effects and routes to appropriate next scenes
   - **Test:** All choices are clickable and functional

2. **Between Years 1342-1344**
   - Test each year's between_years scene
   - **Expected:** Each should have unique, meaningful choices
   - **Verify:** Choices reflect the narrative context of that year

3. **Choice Effects**
   - Select different activity choices
   - **Expected:** Each choice should modify stats (morale, stress, reputation, etc.)
   - **Verify:** Stat changes are applied correctly and displayed in notifications

### P2: Heartbroken Flags + Conditional Text in `between_years_1341`
**What Changed:** Added `Heartbroken` flag tracking and conditional text based on Marie romance outcome.

**Test Cases:**
1. **Marie Romance Path**
   - Play through the Marie romance scene (`marriage_joke`)
   - Choose different responses (silence, confrontation, laughed)
   - **Expected:** `Heartbroken` flag should be set, `MarieResponse` flag should match choice
   - **Verify:** Flag is set via `onChoose` callback

2. **Conditional Text in `between_years_1341`**
   - After Marie romance, reach `between_years_1341`
   - **Expected:** Text should mention Marie/heartbreak if `Heartbroken` flag is set
   - **Verify:** Text changes based on `MarieResponse` flag value
   - **Test:** Play without Marie romance → text should not mention heartbreak

3. **Flag Persistence**
   - Save game after Marie romance
   - Load game
   - **Expected:** `Heartbroken` and `MarieResponse` flags should persist
   - **Verify:** Conditional text still appears correctly after load

### P3: Meaningful Choices in `return_to_england_1344`
**What Changed:** Replaced generic text with 3 meaningful choices reflecting on service, seeking news, or preparing for next campaign.

**Test Cases:**
1. **Three Choice Options**
   - Reach `return_to_england_1344` scene
   - **Expected:** Should see 3 distinct choices (e.g., "Reflect on your service," "Seek out news of home," "Prepare for the next campaign")
   - **Verify:** Each choice has different narrative text and effects

2. **Region-Aware Flavor**
   - Test with different `gameState.culture` values
   - **Expected:** Scene text should include region-specific flavor (e.g., "Yorkshire," "Cornwall")
   - **Verify:** Text acknowledges player's home region

3. **Choice Routing**
   - Select each choice
   - **Expected:** Each should route to appropriate next scene
   - **Verify:** No undefined scene errors

### P4: Equipment Checks in `winter_march`
**What Changed:** `winter_march` text and choices now check for `cloak` and `wool_hose` equipment.

**Test Cases:**
1. **With Equipment**
   - Equip `cloak` and/or `wool_hose`
   - Reach `winter_march` scene
   - **Expected:** Text should mention how equipment helps against the cold
   - **Verify:** Choice effects should reflect equipment benefits (less stress, less endurance loss)

2. **Without Equipment**
   - Play `winter_march` without cloak/wool_hose
   - **Expected:** Text should describe harsh cold, choices should have more severe effects
   - **Verify:** Higher stress/endurance penalties without equipment

3. **Partial Equipment**
   - Equip only `cloak` (not `wool_hose`)
   - **Expected:** Text should reflect partial protection
   - **Verify:** Effects are intermediate between full equipment and no equipment

### P5: Dynamic `end_game` Epilogue
**What Changed:** `end_game` scene now uses a function to generate personalized epilogue based on all game state.

**Test Cases:**
1. **Basic Epilogue Generation**
   - Complete the game and reach `end_game`
   - **Expected:** Epilogue should include:
     - Player name (`gameState.characterName`)
     - Origin class (rural_peasant, manor_retainer, etc.)
     - Home region (`gameState.culture`)
   - **Verify:** All variables are interpolated correctly (no `${name}` literals)

2. **Crécy Flag Check**
   - Complete game WITH `survivedCrecy` flag set
   - **Expected:** Epilogue should say "You stood at Crécy..."
   - Complete game WITHOUT `survivedCrecy` flag
   - **Expected:** Epilogue should say "You were not at Crécy..."
   - **Verify:** Only claims Crécy if player actually fought there

3. **Marie Romance Reflection**
   - Complete game with `Heartbroken` flag set
   - **Expected:** Epilogue should include Marie reflection paragraph
   - **Verify:** Text changes based on `MarieResponse` flag (silence, confrontation, laughed)
   - Test without Marie romance → no Marie paragraph

4. **Companion Relationships**
   - Test with different relationship values:
     - Wat ≥ 3: "brother in all but blood"
     - Wat 0-2: "respects you well enough"
     - Wat < 0: "keeps his distance"
   - **Expected:** Each companion (Wat, Cook, Oana) should have relationship-appropriate text
   - **Verify:** Oana only mentioned if relationship > 0

5. **Patron-Specific Summary**
   - Test with each patron:
     - `james_olooney`: "coin flows fastest to those willing to get blood on their hands"
     - `lord_david`: "kept you alive through caution"
     - `duke_caley`: "never learned your name"
     - `count_charles`: "taught you that survival is its own reward"
     - `ashkhan`: "showed you a different way of war"
   - **Expected:** Each patron has unique narrative summary
   - **Verify:** Patron name is correctly retrieved from `PATRONS` object

6. **Career Assessment**
   - Test with different battle counts:
     - ≥10 battles + rep ≥10: "Renowned Veteran"
     - ≥7 battles: "Hardened Veteran"
     - ≥4 battles: "Experienced Soldier"
     - ≥1 battle: "Blooded Soldier"
     - 0 battles: "Soldier"
   - **Expected:** Career title should match battle count and reputation
   - **Verify:** Battle/wound/promotion counts are displayed correctly with proper pluralization

7. **Wealth Summary**
   - Test with different wealth levels:
     - ≥2400 pence: "small fortune" message
     - ≥480 pence: "saved" message
     - ≥60 pence: "barely enough" message
     - <60 pence: "purse is empty" message
   - **Expected:** Wealth text should match financial status
   - **Verify:** `formatCurrency()` is used correctly

8. **Wound/Stress Assessment**
   - Test with different wound counts:
     - ≥5 wounds: "map of scars"
     - ≥2 wounds: "wounds like badges"
     - ≥1 wound: "one notable scar"
     - 0 wounds: "largely unscathed"
   - Test with different stress levels:
     - ≥8 stress: "war lives behind your eyes"
     - ≥5 stress: "weight of what you've seen"
     - <5 stress: "spirit endures"
   - **Expected:** Body and stress text should reflect player's physical/mental state
   - **Verify:** Both assessments appear in epilogue

9. **Morale-Based Outlook**
   - Test with different morale levels:
     - ≥8 morale: "face the future with hope"
     - ≥5 morale: "still standing"
     - <5 morale: "fire in you has dimmed"
   - **Expected:** Outlook should reflect player's morale
   - **Verify:** Low morale text includes region interpolation

10. **Template Literal Validation**
    - Check browser console for JavaScript errors
    - **Expected:** No "Unexpected token" or template literal errors
    - **Verify:** All `${variable}` interpolations work correctly
    - **Check:** No `${name}` or `${region}` appearing as literal text

### P6: Prereq Field in `CAMPFIRE_VIGNETTES`
**What Changed:** Added `prereq` function field to vignettes and updated `campfire_interlude` filter to check prerequisites.

**Test Cases:**
1. **Prereq Filtering**
   - Play through early game (year < 1343)
   - **Expected:** Vignettes with `prereq: function(gs) { return gs.year >= 1343; }` should NOT appear
   - **Verify:** Only vignettes without prereqs or with met prereqs appear

2. **Year-Based Prereqs**
   - Test vignettes with year-based prereqs:
     - `wat_fury_06`: requires year ≥ 1343
     - `wat_mercy_08`: requires year ≥ 1344
     - `cook_rations_04`: requires year ≥ 1342
     - `cook_names_06`: requires year ≥ 1344
   - **Expected:** Each should only appear after its prerequisite year
   - **Verify:** Prereq functions are called correctly

3. **Flag-Based Prereqs**
   - Test vignettes that require flags (if any)
   - **Expected:** Vignettes should only appear if required flags are set
   - **Verify:** `hasFlag()` is called correctly in prereq functions

4. **Campfire Filter Logic**
   - Trigger multiple campfire interludes
   - **Expected:** Filter should check both `prereq` and `condition` functions
   - **Verify:** No vignettes appear that don't meet prerequisites
   - **Check Console:** No errors about undefined `prereq` functions

### P7: Condition Guard on ALL 6 Oana Vignettes
**What Changed:** Added `condition: function(gs) { return gs.location && gs.location !== 'England'; }` to all 6 Oana vignettes.

**Test Cases:**
1. **Oana Vignette Location Check**
   - Play in England (`gameState.location === 'England'`)
   - **Expected:** NO Oana vignettes should appear
   - **Verify:** Only Wat and Cook vignettes appear in England

2. **Oana Vignette in France/Brittany**
   - Play in France or Brittany
   - **Expected:** Oana vignettes CAN appear if location is not England
   - **Verify:** All 6 Oana vignettes (`oana_carving_01`, `oana_breton_02`, `oana_trade_03`, `oana_wounds_04`, `oana_camp_life_05`, `oana_memory_06`) have condition guards

3. **Recruitment Check (if applicable)**
   - Test if Oana vignettes also require recruitment flag
   - **Expected:** Oana vignettes should only appear if Oana is recruited OR player is in France/Brittany
   - **Verify:** Condition function checks both location and recruitment status

4. **Campfire Filter Integration**
   - Trigger campfire interludes in different locations
   - **Expected:** Filter should check `condition` function before selecting vignette
   - **Verify:** No Oana vignettes appear in England, even if selected by random chance

### P8: Patron-Gated Choices in `village_pillage`
**What Changed:** Added "Consult your patron's guidance" choice that only appears if `gameState.patronId` is set. Fixed `updateChoices()` to handle `choice.requires.custom` functions.

**Test Cases:**
1. **Patron Choice Visibility**
   - Play `village_pillage` WITH a patron selected
   - **Expected:** Should see "Consult your patron's guidance (if applicable)" choice
   - Play `village_pillage` WITHOUT a patron
   - **Expected:** Patron choice should NOT appear
   - **Verify:** Choice visibility is controlled by `requires.custom` function

2. **Custom Requires Function**
   - Test `updateChoices()` with choices that have `requires: { custom: function() { ... } }`
   - **Expected:** Custom function should be evaluated correctly
   - **Verify:** Choices appear/disappear based on custom logic
   - **Check Console:** No errors about `requires.custom` being undefined

3. **Patron Choice Effects**
   - Select "Consult your patron's guidance" choice
   - **Expected:** Choice should have appropriate effects (patron favor, reputation, etc.)
   - **Verify:** Choice routes to appropriate next scene

4. **Multiple Conditional Choices**
   - Test scenes with multiple `requires.custom` choices
   - **Expected:** All custom functions should be evaluated independently
   - **Verify:** No conflicts between different conditional choices

### P9: Upkeep Costs in `between_years` Scenes
**What Changed:** Added `onEnter` functions to `between_years_1341`, `1342`, `1343`, `1344` that apply upkeep costs.

**Test Cases:**
1. **Upkeep Deduction**
   - Reach any `between_years` scene
   - **Expected:** Wealth should be deducted on scene entry (via `onEnter`)
   - **Verify:** Upkeep cost is reasonable (e.g., 60-120 pence per year)
   - **Check:** Notification should appear showing wealth deduction

2. **Upkeep Calculation**
   - Test with different wealth levels
   - **Expected:** Upkeep should be a fixed amount or percentage
   - **Verify:** Upkeep doesn't reduce wealth below 0 (clamped)
   - **Test:** Upkeep is applied BEFORE choices are displayed

3. **All Four Years**
   - Test upkeep in `between_years_1341`, `1342`, `1343`, `1344`
   - **Expected:** Each year should apply upkeep
   - **Verify:** Upkeep costs are consistent or scale appropriately

4. **Upkeep + Choice Effects**
   - Select a choice that also modifies wealth
   - **Expected:** Upkeep is applied first, then choice effects
   - **Verify:** Total wealth change = upkeep + choice effect

### P10: `survivedCrecy` Flag in Crécy Resolve Scenes
**What Changed:** Added `setFlag('survivedCrecy', true)` to `onEnter` functions in `crecy_defensive`, `crecy_loot`, `crecy_rescue`.

**Test Cases:**
1. **Flag Setting**
   - Play through Crécy battle and reach any resolve scene
   - **Expected:** `survivedCrecy` flag should be set to `true`
   - **Verify:** Flag is set in `onEnter` before scene text is displayed
   - **Check:** `gameState.flags.survivedCrecy === true`

2. **All Three Resolve Scenes**
   - Test each Crécy resolve scene:
     - `crecy_defensive`
     - `crecy_loot`
     - `crecy_rescue`
   - **Expected:** All three should set the flag
   - **Verify:** Flag is set regardless of which path player takes

3. **Flag Persistence**
   - Set flag, save game, load game
   - **Expected:** Flag should persist in save data
   - **Verify:** `end_game` epilogue correctly checks flag (see P5)

4. **Flag Not Set Without Crécy**
   - Play through game without reaching Crécy
   - **Expected:** `survivedCrecy` flag should be `false` or undefined
   - **Verify:** `end_game` epilogue says "You were not at Crécy" (see P5)

### P11: Region-Aware Flavor in Vignettes + Key Scenes
**What Changed:** Added region-aware flavor text to `wat_knife_humor`, `cook_salt_01` vignettes and `return_to_england_1344` scene.

**Test Cases:**
1. **Vignette Region References**
   - Play with different `gameState.culture` values (Yorkshire, Lancashire, Norfolk, etc.)
   - Trigger `wat_knife_humor` or `cook_salt_01` vignettes
   - **Expected:** Vignette text should reference player's region
   - **Verify:** Region name is correctly interpolated from `gameState.culture`

2. **Return to England Scene**
   - Play `return_to_england_1344` with different regions
   - **Expected:** Scene text should include region-specific flavor
   - **Verify:** Text acknowledges player's home region (e.g., "Yorkshire," "Cornwall")

3. **Region Name Display**
   - Test with all 8 regions:
     - Yorkshire, Lancashire, Norfolk, Essex
     - Welsh Marches, Kent, Somerset, Cornwall
   - **Expected:** Each region should be correctly referenced in text
   - **Verify:** No "undefined" or "null" appearing in text

4. **Default Region Handling**
   - Test with `gameState.culture` undefined or empty
   - **Expected:** Should fallback to "England" or generic text
   - **Verify:** No errors when region is missing

---

## 🎨 MEDIUM PRIORITY (Polish & Quality)

### M4: Dynamic Campfire Titles from Vignette Data
**What Changed:** `campfire_interlude` scene now uses selected vignette's title dynamically. `displayStory()` correctly handles function-based scene titles.

**Test Cases:**
1. **Dynamic Title Display**
   - Trigger a campfire interlude
   - **Expected:** Campfire title should match the selected vignette's title
   - **Verify:** Title changes based on which vignette is selected
   - **Check:** No generic "Campfire" title appearing

2. **Function-Based Title Evaluation**
   - Test with vignettes that have function-based titles (if any)
   - **Expected:** `displayStory()` should evaluate title as function if it's a function
   - **Verify:** Function titles are called with `gameState` context

3. **Title Consistency**
   - Trigger multiple campfire interludes
   - **Expected:** Each should show correct vignette title
   - **Verify:** Title matches vignette content (e.g., "Wat's Knife" for `wat_knife_humor`)

4. **Artwork Alt Text**
   - Check `artworkImage.alt` attribute
   - **Expected:** Alt text should also use dynamic title if title is a function
   - **Verify:** Accessibility is maintained with correct alt text

### M5: Emotional Pacing / Intensity System
**What Changed:** Added `intensityCooldown` system to prevent low-intensity interludes (campfire, random encounters) from immediately following high-intensity scenes (battles, deaths).

**Test Cases:**
1. **Intensity Cooldown Setting**
   - Complete a high-intensity scene (battle, death, combat)
   - **Expected:** `gameState.intensityCooldown` should be set to 3
   - **Verify:** `setIntensityCooldown(3)` is called in `makeChoice()`
   - **Check:** `gameState.lastIntenseScene` is set to current scene

2. **Medium Intensity Cooldown**
   - Complete a medium-intensity scene (siege, resolution, village_pillage)
   - **Expected:** `gameState.intensityCooldown` should be set to 2
   - **Verify:** Cooldown is shorter for medium-intensity scenes

3. **Campfire Suppression**
   - After a battle, try to trigger campfire
   - **Expected:** Campfire should NOT appear for 3 scenes after battle
   - **Verify:** `shouldInsertCampfire()` checks `gameState.intensityCooldown`
   - **Test:** After 3 scenes, campfire can appear again

4. **Random Encounter Suppression**
   - After a battle, try to trigger random encounter
   - **Expected:** Random encounter should NOT appear during cooldown
   - **Verify:** `shouldInsertRandomEncounter()` checks both intensity and cooldown
   - **Test:** Random encounter respects cooldown period

5. **Cooldown Ticking**
   - After setting cooldown, make 3 scene transitions
   - **Expected:** `gameState.intensityCooldown` should decrease by 1 each transition
   - **Verify:** `tickIntensityCooldown()` is called in `makeChoice()`
   - **Check:** Cooldown reaches 0 after appropriate number of scenes

6. **Intensity Classification**
   - Test `getSceneIntensity()` with different scene types:
     - Battle scenes: should return 3
     - Siege/resolution: should return 2
     - Travel/camp: should return 0
   - **Expected:** Intensity values match scene type
   - **Verify:** Intensity is correctly calculated for all scene prefixes

7. **Cooldown Override**
   - If cooldown is 2, then enter another high-intensity scene
   - **Expected:** Cooldown should be reset to 3 (not added)
   - **Verify:** `setIntensityCooldown()` uses `Math.max()` to prevent reduction

8. **Normal Scene Flow**
   - Play through normal travel/march scenes
   - **Expected:** Campfire and random encounters can appear normally
   - **Verify:** Cooldown doesn't interfere with normal pacing

### M6: Save/Load Scene Existence Validation
**What Changed:** `loadGame()` now validates that `gameState.currentScene` exists in `scenes` object before overwriting live state.

**Test Cases:**
1. **Valid Scene Load**
   - Save game at a valid scene
   - Load game
   - **Expected:** Game should load normally, scene should exist
   - **Verify:** No errors, game continues from saved scene

2. **Invalid Scene Load**
   - Manually edit save data to have invalid `currentScene` (e.g., `"invalid_scene_name"`)
   - Load game
   - **Expected:** Game should detect invalid scene and fallback to safe scene (e.g., `'start'` or `'character_creation'`)
   - **Verify:** No JavaScript errors, game doesn't crash
   - **Check Console:** Should see warning about invalid scene

3. **Scene Validation Logic**
   - Check `loadGame()` function
   - **Expected:** Validation happens AFTER hydration but BEFORE overwriting live state
   - **Verify:** `scenes[gameState.currentScene]` check is performed
   - **Test:** Invalid scene triggers fallback without corrupting game state

4. **Corrupted Save Data**
   - Test with save data that has:
     - `currentScene: null`
     - `currentScene: undefined`
     - `currentScene: ""`
   - **Expected:** All should trigger validation and fallback
   - **Verify:** Game handles edge cases gracefully

5. **Scene Name Changes**
   - If a scene was renamed in code but save data has old name
   - **Expected:** Validation should catch this and fallback
   - **Verify:** Game doesn't break from outdated scene references

---

## 🔍 INTEGRATION TESTING

### Multi-System Interactions
1. **Campfire + Intensity Cooldown**
   - After battle, campfire should be suppressed
   - After 3 scenes, campfire can appear
   - **Expected:** Both systems work together correctly

2. **Prereq + Condition Guards**
   - Test vignette with both `prereq` and `condition` functions
   - **Expected:** Vignette should only appear if BOTH are met
   - **Verify:** Filter checks both functions

3. **Upkeep + Wealth Display**
   - Apply upkeep, then check wealth in `end_game` epilogue
   - **Expected:** Wealth should reflect all deductions
   - **Verify:** `formatCurrency()` displays correct final wealth

4. **Flag Persistence Across Systems**
   - Set `survivedCrecy` flag, save, load, reach `end_game`
   - **Expected:** Flag should persist and be checked in epilogue
   - **Verify:** All flag checks work across save/load cycle

### Edge Cases
1. **Zero Wealth After Upkeep**
   - Start with minimal wealth, apply upkeep
   - **Expected:** Wealth should not go below 0
   - **Verify:** `applyStatChange()` clamps wealth correctly

2. **Maximum Relationship Values**
   - Test with relationships at +5 (max) and -5 (min)
   - **Expected:** Relationships should be clamped, epilogue should reflect extremes
   - **Verify:** No overflow or underflow in relationship calculations

3. **Missing Game State**
   - Test with `gameState.career` undefined
   - **Expected:** Epilogue should handle missing data gracefully (default to 0)
   - **Verify:** No "Cannot read property 'battles' of undefined" errors

4. **Rapid Scene Transitions**
   - Trigger multiple scene transitions quickly
   - **Expected:** Intensity cooldown should tick correctly
   - **Verify:** No race conditions or state corruption

---

## 🐛 BUG REGRESSION TESTS

### Previously Fixed Issues
1. **Crécy False Claim (P10)**
   - Play game WITHOUT reaching Crécy
   - **Expected:** `end_game` should NOT claim player survived Crécy
   - **Verify:** Only claims Crécy if `survivedCrecy` flag is set

2. **Undefined Scene Crashes (B1)**
   - Play through entire game
   - **Expected:** No "Scene not found" crashes
   - **Verify:** Fallback system handles all undefined references

3. **Campfire Interrupting Combat (H1)**
   - Play combat scenes
   - **Expected:** No campfire immediately after combat
   - **Verify:** `noCampfire` flags prevent interruptions

4. **Chapter Overlap (H2)**
   - Play through year 1346
   - **Expected:** Clean chapter transition, no overlap
   - **Verify:** Only one chapter active at a time

---

## 📊 PERFORMANCE TESTING

1. **Scene Transition Speed**
   - Measure time for scene transitions
   - **Expected:** Transitions should be < 100ms
   - **Verify:** No lag from intensity cooldown checks or validation

2. **Save/Load Performance**
   - Save and load game multiple times
   - **Expected:** Save/load should be < 500ms
   - **Verify:** Scene validation doesn't slow down load

3. **Epilogue Generation**
   - Generate `end_game` epilogue
   - **Expected:** Epilogue should generate in < 50ms
   - **Verify:** No performance issues from multiple state checks

---

## ✅ ACCEPTANCE CRITERIA

**All tests should pass:**
- ✅ No JavaScript console errors
- ✅ No undefined scene references
- ✅ All flags persist across save/load
- ✅ All conditional text displays correctly
- ✅ All choices are functional and route correctly
- ✅ Epilogue reflects actual game state
- ✅ Intensity cooldown prevents inappropriate interludes
- ✅ Scene validation prevents crashes from corrupted saves
- ✅ All vignettes respect prereqs and conditions
- ✅ All region/origin references display correctly

---

## 🚀 QUICK SMOKE TEST

**5-Minute Test:**
1. Start new game, select origin and region
2. Play through to first `between_years` scene → verify meaningful choices
3. Trigger campfire interlude → verify dynamic title
4. Complete a battle → verify no campfire immediately after
5. Save game → load game → verify scene validation
6. Reach `end_game` → verify epilogue includes name, origin, region, and state checks

**If all 6 steps pass, proceed with full test suite above.**

---

**End of Testing Guide**
