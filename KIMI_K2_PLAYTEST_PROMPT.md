# Extensive Playtest Prompt for Kimi K2 Autonomous Agent
## "A Man-at-Arms' Life" - Comprehensive Testing Protocol

**Game URL:** https://sloppymo.github.io/man-at-arms/man-at-arms.html  
**Current Version:** v1.2.2  
**Game Type:** Browser-based text RPG / Historical career simulation  
**Testing Duration:** Complete playthrough + systematic regression testing  
**Expected Completion Time:** 2-4 hours of comprehensive testing

---

## MISSION OVERVIEW

You are an autonomous testing agent tasked with conducting a comprehensive playtest of "A Man-at-Arms' Life," a text-based interactive fiction RPG set during the Hundred Years' War (1337-1453). Your objective is to:

1. **Systematically test all game systems** for functionality, bugs, and edge cases
2. **Evaluate gameplay balance** and player experience
3. **Identify technical issues** including JavaScript errors, UI bugs, and state management problems
4. **Assess narrative quality** and historical authenticity
5. **Document all findings** in a structured, actionable format

---

## TESTING METHODOLOGY

### Phase 1: Initial Setup & Environment Check
**Duration:** 5-10 minutes

1. **Browser Environment:**
   - Open the game URL in a modern browser (Chrome/Edge recommended)
   - Open Developer Tools (F12) and monitor Console for errors
   - Check Network tab for failed resource loads
   - Verify localStorage is accessible (for save/load testing)

2. **Initial Load Test:**
   - Does the page load without errors?
   - Does the game initialize correctly?
   - Is the version number displayed? (Should show v1.2.2)
   - Are all CSS styles applied correctly?
   - Do images load (map, artwork)?

3. **Pre-Play State:**
   - Check if there's existing save data (clear if needed for fresh test)
   - Verify default game state is correct
   - Check that character creation is the starting scene

---

## Phase 2: Character Creation System - Comprehensive Testing
**Duration:** 30-45 minutes

### Step 1: Name & Region Selection

**Test Cases:**

1. **Default Name Field:**
   - [ ] Does the name field default to "William Thatcher"?
   - [ ] When you click the field, does it clear automatically?
   - [ ] If you click away without entering a name, does it restore "William Thatcher"?
   - [ ] If you enter a name and delete it, does it restore "William Thatcher" on blur?
   - [ ] Can you enter a custom name successfully?
   - [ ] Does the name persist when navigating between steps?

2. **Region Map Selection:**
   - [ ] Does the UK map image load correctly?
   - [ ] Are all 8 region markers visible and clickable?
   - [ ] Test each region marker individually:
     - Yorkshire (60% left, 38% top)
     - Lancashire (46% left, 38% top)
     - Norfolk (66% left, 52% top)
     - Essex (58% left, 54% top)
     - London (54% left, 60% top) - should be larger with sword icon
     - Kent (64% left, 68% top)
     - Somerset (44% left, 72% top)
     - Cornwall (32% left, 82% top)
   - [ ] Do markers highlight on hover?
   - [ ] Do markers change appearance when selected?
   - [ ] Do tooltips appear on hover?
   - [ ] Does region flavor text display when selected?
   - [ ] Can you change region selection?
   - [ ] Are marker positions accurate on the map? (Note any misalignments)

3. **Navigation:**
   - [ ] Can you proceed to Step 2 without selecting a region? (Should be blocked)
   - [ ] Can you proceed to Step 2 without entering a name? (Should use "William Thatcher")
   - [ ] Does the "Next" button work?
   - [ ] Does the "Back" button work (if applicable)?

### Step 2: Age Range Selection

**Test Cases:**

1. **Age Range Options:**
   - [ ] Are all 5 age ranges displayed?
     - Youth (16-19)
     - Young Adult (20-24)
     - Prime (25-30)
     - Veteran (31-35)
     - Old Hand (36-40)
   - [ ] Do descriptions display correctly?
   - [ ] Are advantages and drawbacks listed?
   - [ ] Are stat modifiers shown?

2. **Selection Mechanics:**
   - [ ] Can you select each age range?
   - [ ] Does selection highlight correctly?
   - [ ] Can you change your selection?
   - [ ] Do stat modifiers apply when selected? (Check if stats update)

3. **Edge Cases:**
   - [ ] What happens if you try to proceed without selecting an age range?
   - [ ] Does the selection persist when going back and forth?

### Step 3: Origin Story Selection

**Test Cases:**

1. **Origin Options:**
   - [ ] Are all 5 origins displayed?
     - Rural Peasant
     - Manor Retainer
     - Craftsman's Apprentice
     - Squire
     - Minor Noble
   - [ ] Do descriptions display correctly?
   - [ ] Are stat bonuses/penalties shown?

2. **Selection & Effects:**
   - [ ] Can you select each origin?
   - [ ] Does selection highlight correctly?
   - [ ] Do stat changes apply immediately?
   - [ ] Can you change selection?

### Step 4: Background Questions

**Test Cases:**

1. **Question System:**
   - [ ] Are all 5 background questions displayed?
   - [ ] Do questions have multiple answer options?
   - [ ] Can you select answers?
   - [ ] Do answers show stat effects?

2. **Answer Tracking:**
   - [ ] Are your answers tracked?
   - [ ] Can you change answers?
   - [ ] Do stat modifications apply correctly?
   - [ ] Do net stat swings equal 1 point as documented?

3. **Completion:**
   - [ ] Can you proceed without answering all questions?
   - [ ] What happens if you skip questions?

### Step 5: Priority System (Shadowrun-style)

**Test Cases:**

1. **Priority Allocation:**
   - [ ] Are all 5 priority categories displayed?
     - Might (Strength + Endurance)
     - Finesse (Agility)
     - Wits (Wits)
     - Presence (Charisma)
     - Fortune (Luck + starting resources + kit quality)
   - [ ] Can you assign priorities A-E?
   - [ ] Does each priority have unique stat/resource allocations?
   - [ ] Are priorities mutually exclusive? (Can you assign A to multiple categories?)

2. **Validation:**
   - [ ] Can you proceed without assigning all priorities?
   - [ ] Can you assign duplicate priorities? (Should be blocked)
   - [ ] Does the system validate complete and unique assignments?

3. **Stat Calculation:**
   - [ ] Do stats update correctly based on priority assignments?
   - [ ] Does Fortune priority affect starting kit tier?
   - [ ] Are starting resources calculated correctly?

### Step 6: Summary & Confirmation

**Test Cases:**

1. **Summary Display:**
   - [ ] Does the summary show all character details?
     - Name
     - Region
     - Age Range
     - Origin
     - Final stats
     - Priority assignments
   - [ ] Are all values correct?

2. **Confirmation:**
   - [ ] Can you go back to edit choices?
   - [ ] Does "Confirm" complete character creation?
   - [ ] Does character creation transition to the first game scene?

---

## Phase 3: Game State Management Testing
**Duration:** 20-30 minutes

### Save/Load System

**Test Cases:**

1. **Save Functionality:**
   - [ ] Can you save the game at any point?
   - [ ] Does save work during character creation?
   - [ ] Does save work during gameplay?
   - [ ] Is save data stored in localStorage?
   - [ ] Does save include all game state?
     - Stats
     - Character details
     - Current scene
     - Inventory
     - Equipment
     - Conditions
     - Flags
     - Year/Age

2. **Load Functionality:**
   - [ ] Can you load a saved game?
   - [ ] Does load restore all state correctly?
   - [ ] Does load work after page refresh?
   - [ ] Does load work after closing and reopening browser?
   - [ ] Are stats restored correctly?
   - [ ] Is the current scene restored?
   - [ ] Is inventory/equipment restored?

3. **Version Migration:**
   - [ ] Does the system handle version mismatches?
   - [ ] Does migration preserve data correctly?
   - [ ] Are missing fields filled with defaults?

4. **Edge Cases:**
   - [ ] What happens if localStorage is full?
   - [ ] What happens if save data is corrupted?
   - [ ] Can you have multiple save slots? (If implemented)

### State Persistence

**Test Cases:**

1. **Stat Persistence:**
   - [ ] Do stat changes persist across scenes?
   - [ ] Do stat changes persist after save/load?
   - [ ] Are stat modifiers from equipment applied correctly?
   - [ ] Are stat modifiers from conditions applied correctly?

2. **Scene State:**
   - [ ] Does `enteredScenes` Set prevent duplicate `onEnter` calls?
   - [ ] Do scene flags persist?
   - [ ] Does year/age progression work correctly?

---

## Phase 4: Scene System & Narrative Testing
**Duration:** 45-60 minutes

### Scene Transitions

**Test Cases:**

1. **Initial Scene:**
   - [ ] After character creation, does the game transition to the first story scene?
   - [ ] Is the correct scene loaded based on origin?
   - [ ] Does scene text display correctly?

2. **Choice-Based Transitions:**
   - [ ] Do choices lead to correct next scenes?
   - [ ] Do function-based `nextScene` values work?
   - [ ] Do conditional scene transitions work?

3. **Scene Loading:**
   - [ ] Do all scenes load without errors?
   - [ ] Are there any "Scene not found" errors?
   - [ ] Do scenes display artwork if available?
   - [ ] Do artwork captions display?

### Narrative Content

**Test Cases:**

1. **Text Quality:**
   - [ ] Is the writing engaging?
   - [ ] Is it historically accurate?
   - [ ] Does it create immersion?
   - [ ] Are there typos or grammatical errors?

2. **Dynamic Text:**
   - [ ] Does character name appear in scenes?
   - [ ] Do stat values affect narrative text?
   - [ ] Do conditions affect descriptions?

3. **Branching:**
   - [ ] Do choices create meaningful narrative divergence?
   - [ ] Are there multiple paths through the game?
   - [ ] Do earlier choices affect later scenes?

### Choice System

**Test Cases:**

1. **Choice Display:**
   - [ ] Are all choices displayed correctly?
   - [ ] Are choice texts clear and understandable?
   - [ ] Do choices show stat requirements? (If applicable)

2. **Choice Resolution:**
   - [ ] Do choices with `requiresResolution` trigger dice rolls?
   - [ ] Are resolution difficulties appropriate?
   - [ ] Do stat modifiers affect resolution?
   - [ ] Are success/failure outcomes different?

3. **Choice Effects:**
   - [ ] Do stat changes apply correctly?
   - [ ] Do condition changes apply?
   - [ ] Do flag changes apply?
   - [ ] Are effects visible to the player?

### Resolution System

**Test Cases:**

1. **Dice Rolls:**
   - [ ] Does `resolveAction(stat, difficulty)` work?
   - [ ] Are rolls 1d10 + effective stat?
   - [ ] Is effective stat calculated correctly? (base + equipment + conditions)
   - [ ] Are success margins calculated?

2. **Minigames:**
   - [ ] Do minigames trigger when appropriate?
   - [ ] Test each minigame type:
     - QTE (Quick Time Event)
     - Trivia
     - Pattern Memory
     - Typing
   - [ ] Do minigames have appropriate difficulty?
   - [ ] Do success/failure callbacks work?

---

## Phase 5: Equipment System Testing
**Duration:** 30-45 minutes

### Equipment UI

**Test Cases:**

1. **Access:**
   - [ ] Can you open the equipment UI?
   - [ ] Does the paper-doll interface display?
   - [ ] Is the inventory panel visible?

2. **Paper-Doll:**
   - [ ] Are all body slots visible?
     - Head
     - Torso (padding, mail, plate, surcoat layers)
     - Arms
     - Legs
   - [ ] Can you drag items onto slots?
   - [ ] Can you drag items off slots?
   - [ ] Do items snap to correct slots?

3. **Inventory:**
   - [ ] Are starter items visible?
   - [ ] Can you filter inventory?
   - [ ] Do items show condition and fit?
   - [ ] Are unavailable items grayed out?

### Equipment Mechanics

**Test Cases:**

1. **Equipping:**
   - [ ] Can you equip items?
   - [ ] Do equipped items appear on paper-doll?
   - [ ] Do stat modifiers apply?
   - [ ] Does protection matrix update?

2. **Unequipping:**
   - [ ] Can you unequip items?
   - [ ] Do items return to inventory?
   - [ ] Do stat modifiers remove correctly?

3. **Layered Armor:**
   - [ ] Can you equip multiple layers (padding + mail + plate)?
   - [ ] Do layers stack protection correctly?
   - [ ] Can you equip surcoat over plate?

4. **Availability:**
   - [ ] Are items gated by region?
   - [ ] Are items gated by year?
   - [ ] Are items gated by rank?
   - [ ] Does `isAvailable()` work correctly?

5. **Protection Calculation:**
   - [ ] Does `getEffectiveProtection(region, damageType)` work?
   - [ ] Does condition affect protection?
   - [ ] Does fit affect protection?
   - [ ] Is the protection matrix correct?

6. **Starter Kit:**
   - [ ] Is starter kit granted after character creation?
   - [ ] Does kit tier match Fortune priority?
   - [ ] Are items added to inventory?
   - [ ] Can you equip starter items?

---

## Phase 6: Combat System Testing
**Duration:** 30-45 minutes

### Combat Triggers

**Test Cases:**

1. **Combat Initiation:**
   - [ ] Does combat trigger from narrative choices?
   - [ ] Does `triggerCombat(enemyProfile, winScene, loseScene)` work?
   - [ ] Does combat overlay appear?
   - [ ] Does it hide the story correctly?

2. **Combat State:**
   - [ ] Is combat state mapped from gameState correctly?
   - [ ] Are player stats loaded?
   - [ ] Is equipment protection applied?

### Combat Mechanics

**Test Cases:**

1. **QTE System:**
   - [ ] Do QTE zones appear?
   - [ ] Does difficulty affect zone size?
   - [ ] Does fatigue affect zone size?
   - [ ] Can you hit QTE zones?

2. **Stance System:**
   - [ ] Can you change stances?
     - Aggressive
     - Balanced
     - Guarded
   - [ ] Do stances affect combat?
   - [ ] Do stances affect QTE zones?

3. **Fatigue Meter:**
   - [ ] Does fatigue start at 0?
   - [ ] Does fatigue increase with actions?
   - [ ] Does fatigue affect QTE zones?
   - [ ] Can fatigue reach 100?

4. **Action Economy:**
   - [ ] Do you get 2 actions per round?
   - [ ] Do actions consume action points?
   - [ ] Do actions reset each round?

5. **Attack Styles:**
   - [ ] Can you use Measured Strike?
   - [ ] Can you use Press?
   - [ ] Can you use Flurry?
   - [ ] Do styles have different effects?

6. **Enemy Behavior:**
   - [ ] Do enemies telegraph intents?
   - [ ] Do different enemy archetypes behave differently?
     - Cautious
     - Aggressive
     - Skilled
   - [ ] Do enemies attack?
   - [ ] Can enemies damage you?

### Combat Resolution

**Test Cases:**

1. **Victory:**
   - [ ] Can you win combat?
   - [ ] Does victory transition to winScene?
   - [ ] Are victory rewards applied?
   - [ ] Do stat changes apply?

2. **Defeat:**
   - [ ] Can you lose combat?
   - [ ] Does defeat transition to loseScene?
   - [ ] Are defeat penalties applied?
   - [ ] Do wounds apply?

3. **State Updates:**
   - [ ] Are wounds added to conditions?
   - [ ] Does stress increase?
   - [ ] Do other conditions apply?
   - [ ] Is experience awarded?

---

## Phase 7: UI/UX Testing
**Duration:** 20-30 minutes

### Status Bar

**Test Cases:**

1. **Display:**
   - [ ] Are all status items visible?
     - Year
     - Age
     - Location
     - Rank
     - Wealth
     - Reputation
     - Morale
     - Stress
   - [ ] Are values updating correctly?
   - [ ] Are condition badges displayed?
   - [ ] Do condition badges show durations?

2. **Updates:**
   - [ ] Does status bar update on state changes?
   - [ ] Are stat changes reflected immediately?

### Notifications

**Test Cases:**

1. **Notification System:**
   - [ ] Do notifications appear for important events?
   - [ ] Are notifications styled correctly?
   - [ ] Do notifications auto-dismiss?
   - [ ] Can multiple notifications stack?

2. **Notification Types:**
   - [ ] Test success notifications
   - [ ] Test error notifications
   - [ ] Test warning notifications
   - [ ] Test info notifications

### Artwork Display

**Test Cases:**

1. **Artwork Loading:**
   - [ ] Do scene artworks load?
   - [ ] Do artworks have fade-in animations?
   - [ ] Do captions display?

2. **Artwork List:**
   - [ ] Verify all artwork files exist:
     - character-creation.jpg
     - battle-scene-1.jpg
     - battle-scene-2.jpg
     - naval-battle-1.jpg
     - naval-battle-2.png
     - naval-battle-3.png
     - battle-aftermath.jpg

### Responsive Design

**Test Cases:**

1. **Screen Sizes:**
   - [ ] Does the game work on desktop (1920x1080)?
   - [ ] Does it work on tablet (768x1024)?
   - [ ] Does it work on mobile (375x667)?
   - [ ] Is text readable at all sizes?
   - [ ] Are buttons clickable at all sizes?

2. **Layout:**
   - [ ] Does layout adapt to screen size?
   - [ ] Do elements overflow correctly?
   - [ ] Is the map usable on mobile?

---

## Phase 8: Balance & Gameplay Testing
**Duration:** 30-45 minutes

### Stat Balance

**Test Cases:**

1. **Stat Ranges:**
   - [ ] Are stats clamped to valid ranges?
   - [ ] Can stats go below minimum?
   - [ ] Can stats go above maximum?
   - [ ] Do stat modifiers respect limits?

2. **Stat Effectiveness:**
   - [ ] Do high stats provide noticeable advantages?
   - [ ] Do low stats provide noticeable disadvantages?
   - [ ] Are stat differences meaningful?

3. **Stat Progression:**
   - [ ] Can you improve stats through gameplay?
   - [ ] Is progression balanced?
   - [ ] Is progression rewarding?

### Difficulty Balance

**Test Cases:**

1. **Resolution Difficulties:**
   - [ ] Are difficulty values appropriate?
   - [ ] Can you succeed with average stats?
   - [ ] Are high difficulties achievable?
   - [ ] Are low difficulties trivial?

2. **Combat Difficulty:**
   - [ ] Is combat challenging but fair?
   - [ ] Can you win with average stats?
   - [ ] Are enemy stats balanced?

3. **Choice Consequences:**
   - [ ] Do choices have meaningful consequences?
   - [ ] Are consequences proportional?
   - [ ] Can you recover from bad choices?

### Progression

**Test Cases:**

1. **Character Development:**
   - [ ] Does the character feel like they're developing?
   - [ ] Are improvements noticeable?
   - [ ] Is progression satisfying?

2. **Career Progression:**
   - [ ] Does rank progression work?
   - [ ] Are promotions meaningful?
   - [ ] Do relationships develop?

---

## Phase 9: Edge Cases & Stress Testing
**Duration:** 30-45 minutes

### Input Validation

**Test Cases:**

1. **Name Input:**
   - [ ] What happens with very long names? (100+ characters)
   - [ ] What happens with special characters?
   - [ ] What happens with empty string?
   - [ ] What happens with only spaces?

2. **Stat Input:**
   - [ ] What happens if you try to exceed point limits?
   - [ ] What happens with negative values?
   - [ ] What happens with non-numeric input?

3. **Choice Selection:**
   - [ ] What happens if you click rapidly?
   - [ ] What happens if you click during transitions?
   - [ ] What happens with invalid choice IDs?

### State Corruption

**Test Cases:**

1. **Invalid State:**
   - [ ] What happens with missing required fields?
   - [ ] What happens with invalid scene names?
   - [ ] What happens with corrupted save data?

2. **State Recovery:**
   - [ ] Does the game recover from errors?
   - [ ] Are default values applied correctly?
   - [ ] Does `hydrateLoadedState()` work?

### Performance

**Test Cases:**

1. **Load Times:**
   - [ ] Does the game load quickly?
   - [ ] Are images optimized?
   - [ ] Is JavaScript execution fast?

2. **Memory:**
   - [ ] Does the game have memory leaks?
   - [ ] Does long playthrough cause slowdown?
   - [ ] Is localStorage usage reasonable?

3. **Rendering:**
   - [ ] Are there frame drops?
   - [ ] Do animations run smoothly?
   - [ ] Is UI responsive?

---

## Phase 10: Browser Console Monitoring
**Duration:** Throughout all phases

### Error Monitoring

**Test Cases:**

1. **JavaScript Errors:**
   - [ ] Monitor console for errors throughout testing
   - [ ] Document all errors with:
     - Error message
     - Stack trace
     - When it occurred
     - Steps to reproduce

2. **Warnings:**
   - [ ] Document all warnings
   - [ ] Assess if warnings are critical

3. **Network Errors:**
   - [ ] Check Network tab for failed requests
   - [ ] Document missing resources
   - [ ] Check image load failures

---

## BUG REPORTING FORMAT

For each bug found, document:

### Critical Bugs (Game-Breaking)
```
**Bug ID:** CRIT-001
**Title:** [Brief description]
**Severity:** Critical
**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]
**Expected Behavior:** [What should happen]
**Actual Behavior:** [What actually happens]
**Console Errors:** [Any JavaScript errors]
**Screenshots:** [If applicable]
**Frequency:** [Always/Sometimes/Rare]
**Workaround:** [If any]
```

### Major Bugs (Significant Impact)
```
**Bug ID:** MAJ-001
**Title:** [Brief description]
**Severity:** Major
[Same format as above]
```

### Minor Bugs (Small Issues)
```
**Bug ID:** MIN-001
**Title:** [Brief description]
**Severity:** Minor
[Same format as above]
```

### Suggestions/Improvements
```
**Suggestion ID:** SUG-001
**Title:** [Brief description]
**Category:** [UI/UX/Gameplay/Narrative/Technical]
**Description:** [Detailed explanation]
**Rationale:** [Why this would improve the game]
**Priority:** [High/Medium/Low]
```

---

## FEEDBACK REPORT STRUCTURE

### Executive Summary
- Overall assessment (2-3 paragraphs)
- Overall rating (1-10 scale)
- Would you recommend this game? Why or why not?
- Top 3 strengths
- Top 3 weaknesses

### Detailed Findings

#### 1. Character Creation System
- Functionality assessment
- UI/UX evaluation
- Balance evaluation
- Bugs found
- Suggestions for improvement

#### 2. Gameplay Systems
- Scene system evaluation
- Choice system evaluation
- Resolution system evaluation
- Equipment system evaluation
- Combat system evaluation

#### 3. Narrative & Content
- Writing quality
- Historical accuracy
- Immersion level
- Branching quality
- Content completeness

#### 4. Technical Quality
- Code quality (based on console errors)
- Performance
- Browser compatibility
- Save/Load reliability
- State management

#### 5. Balance & Design
- Stat balance
- Difficulty curve
- Progression pacing
- Choice consequences
- Overall game balance

#### 6. UI/UX
- Visual design
- Information architecture
- User feedback
- Accessibility
- Responsive design

### Comprehensive Bug List
- All bugs organized by severity
- With full reproduction steps

### Suggestions for Improvement
- Prioritized list of recommendations
- With rationale and implementation difficulty

### Playthrough Log
- Document your complete playthrough
- Choices made
- Outcomes observed
- Interesting moments
- Unexpected behaviors

---

## TESTING CHECKLIST SUMMARY

Before completing your report, verify you've tested:

### Character Creation
- [ ] All 6 steps of character creation
- [ ] Name field default behavior
- [ ] All 8 region markers
- [ ] All 5 age ranges
- [ ] All 5 origins
- [ ] All 5 background questions
- [ ] Priority system (all combinations)
- [ ] Summary screen accuracy

### Core Systems
- [ ] Save/Load functionality
- [ ] State persistence
- [ ] Scene transitions (minimum 10 scenes)
- [ ] Choice system
- [ ] Resolution system
- [ ] Stat calculations
- [ ] Condition system

### Advanced Systems
- [ ] Equipment system (if accessible)
- [ ] Combat system (if triggered)
- [ ] Artwork display
- [ ] Notifications
- [ ] Status bar updates

### Edge Cases
- [ ] Input validation
- [ ] State corruption recovery
- [ ] Performance under stress
- [ ] Browser compatibility

### Quality Assurance
- [ ] No JavaScript errors in console
- [ ] All images load
- [ ] All scenes accessible
- [ ] No broken links
- [ ] No missing content

---

## DELIVERABLES

After completing testing, provide:

1. **Comprehensive Test Report** (10-20 pages)
   - Executive summary
   - Detailed findings by category
   - Complete bug list
   - Suggestions for improvement
   - Playthrough log

2. **Bug Database** (Spreadsheet or structured document)
   - All bugs with IDs, severity, reproduction steps
   - Organized by system/component

3. **Screenshots** (If possible)
   - Visual bugs
   - UI issues
   - Error messages
   - Interesting moments

4. **Console Log** (If possible)
   - All JavaScript errors
   - All warnings
   - Performance metrics

5. **Testing Metrics**
   - Total testing time
   - Number of bugs found
   - Number of scenes tested
   - Coverage percentage

---

## TESTING PRIORITIES

### Must Test (Critical Path)
1. Character creation (all steps)
2. Save/Load system
3. Scene transitions
4. Choice system
5. Stat calculations
6. JavaScript errors

### Should Test (Important)
1. Equipment system
2. Combat system
3. Resolution system
4. UI responsiveness
5. State persistence

### Nice to Test (If Time Permits)
1. Extended playthrough (20+ scenes)
2. Multiple character builds
3. All narrative branches
4. Performance optimization
5. Accessibility features

---

## NOTES FOR AUTONOMOUS AGENT

- **Be Systematic:** Follow the test cases in order, but adapt if you discover issues
- **Be Thorough:** Don't skip test cases - each one is important
- **Be Detailed:** Document everything, even if it seems minor
- **Be Objective:** Report what you observe, not what you expect
- **Be Constructive:** Provide actionable feedback, not just criticism
- **Be Patient:** Some bugs may require multiple attempts to reproduce
- **Be Curious:** Explore edge cases and unexpected interactions
- **Be Honest:** If something is broken, say so clearly

---

## EXPECTED TESTING OUTCOMES

After completing this comprehensive playtest, you should be able to provide:

1. **Complete assessment** of game functionality
2. **Comprehensive bug list** with reproduction steps
3. **Balanced feedback** on gameplay, narrative, and technical quality
4. **Actionable recommendations** for improvements
5. **Confidence assessment** of game readiness for players

---

**Remember:** The goal is to help make "A Man-at-Arms' Life" the best game it can be. Your thorough, systematic testing and detailed feedback will be invaluable for improving the player experience.

**Good luck, and happy testing!**
