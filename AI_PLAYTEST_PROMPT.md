# AI Agent Playtest Prompt - Man-at-Arms Roguelike Tension Loop

## Context

You are playtesting a browser-based roguelike game called "Man-at-Arms" that simulates medieval military campaigns. The game has recently implemented a new "Roguelike Tension Loop" system with:

- **Micro/Full Campfires**: Maintenance pit stops (micro) vs narrative vignettes (full)
- **Tempo Strike**: A timing minigame that adds deterministic bonuses to skirmish rolls
- **Skirmish Variants**: Three types of combat encounters (Roadside, Mud & Ruts, Narrow Lane)
- **Meter Economy**: Exertion (0-10) and Wear (0-10) that must be managed through campfires

## Your Mission

Play through the game systematically, focusing on the new systems. Your goal is to identify:
1. **Balance issues** (meters spiraling, systems feeling mandatory vs optional)
2. **UX problems** (confusing UI, unclear feedback, annoying interactions)
3. **Bugs** (routing loops, save/load failures, broken mechanics)
4. **Feel assessment** (fun vs tedious, engaging vs repetitive)

---

## Phase 1: Setup & Initial State (5 minutes)

### Steps:
1. Open `man-at-arms.html` in a browser
2. Open browser console (F12) - you'll need this for tracking
3. Start a new game
4. Complete character creation (use Quick Start if available)
5. Note your starting state:
   ```javascript
   console.log('Starting state:', {
     exertion: gameState.exertion,
     wear: gameState.wear,
     morale: gameState.stats.morale,
     equipment: gameState.equipment
   });
   ```

### Test Builds (Choose One):

**Build A: No Armor / Cautious**
- No mail equipped
- Prefer Hold/Drive choices (avoid Press)
- Goal: Test if no-armor is viable

**Build B: Mail / Aggressive**
- Mail equipped (torso slot)
- Prefer Press choices
- Goal: Test if mail wear spirals too fast

**Build C: Mail / Controlled**
- Mail equipped
- Prefer Hold choices
- Goal: Test if mail is viable with careful play

**Recommendation:** Start with Build B (Mail/Aggressive) as it's most likely to reveal balance issues.

---

## Phase 2: Core Loop Playtest - 5 Skirmishes (15-20 minutes)

### Instructions:

Play **5 skirmishes in a row** naturally. Do NOT:
- Force skirmishes (unless using debug button for first one)
- Auto-skip Tempo Strike every time
- Save-scum to avoid failures

DO:
- Mix your strategies (some Press, some Hold, some Drive)
- Vary Tempo Strike usage (Skip sometimes, try for +2 sometimes)
- Let campfires appear naturally (don't force them)
- Make choices as if you're actually playing (not optimizing for testing)

### For Each Skirmish, Record:

**Skirmish #X:**
- **Variant:** Roadside / Mud & Ruts / Narrow Lane
- **Choice:** Press / Hold / Drive
- **Tempo Strike:** Skip / +0 / +1 / +2 (and how you got it)
- **Outcome:** Success / Partial Failure / Full Failure
- **Margin:** +X or -X
- **Costs Applied:**
  - Exertion: +X (from choice + timing cost if +2)
  - Wear: +X (from margin + mail + variant modifiers)
  - Morale: +X or -X
- **State After:**
  - Exertion: X/10
  - Wear: X/10
  - Morale: X/10
- **Campfire After?** Yes / No
  - If yes: Micro / Full
  - What choice did you make? (Sleep / Tend Kit / Share Words / Keep Watch)
  - Did it help? (reduced meters as expected?)

### Console Tracking Commands:

After each skirmish, run:
```javascript
console.log(`After Skirmish #X:`, {
  exertion: gameState.exertion,
  wear: gameState.wear,
  morale: gameState.stats.morale,
  lastSkirmish: gameState.lastSkirmish?.key,
  timing: gameState.lastSkirmish?.timing
});
```

After each campfire:
```javascript
console.log(`After Campfire:`, {
  exertion: gameState.exertion,
  wear: gameState.wear,
  morale: gameState.stats.morale,
  campfireMode: gameState.campfire?.mode
});
```

---

## Phase 3: Specific System Tests (10 minutes)

### Test 3.1: Tempo Strike Feel

**Scenario:** Play 3 skirmishes with different Tempo Strike strategies

1. **Always Skip:**
   - Skip timing on all 3 skirmishes
   - Note: Do you feel disadvantaged? Is success rate noticeably lower?
   - Record: Success rate, average margin

2. **Always Try for +2:**
   - Try to hit perfect timing on all 3 skirmishes
   - Note: Does +1 exertion cost feel worth it? Is it annoying to always do?
   - Record: Success rate, average margin, exertion cost

3. **Mixed Strategy:**
   - Use timing when you think you need it, skip otherwise
   - Note: Does this feel like meaningful agency or arbitrary optimization?
   - Record: When did you use it? Why?

**Assessment Questions:**
- Does Tempo Strike feel like a **clutch tool** (use when needed) or **mandatory** (always need +2)?
- Is the timing window fair? (too easy = free bonus, too hard = frustrating)
- Does the +1 exertion cost for +2 bonus feel balanced?

### Test 3.2: Campfire Cadence

**Scenario:** Play through 10 scene transitions (not just skirmishes)

**Track:**
- How many campfires appeared? (Expected: ~2-3 with 18% chance, 5-scene cooldown)
- Ratio of Micro vs Full? (Expected: ~70% micro, 30% full)
- Did campfires feel:
  - Too frequent (interrupting flow)?
  - Too rare (meters spiraling)?
  - Just right (maintenance when needed)?

**Micro Campfire Assessment:**
- Are the 4 choices clear and useful?
- Do meter reductions feel meaningful?
- Is the text too long/short?

**Full Campfire Assessment:**
- Do vignettes still feel special?
- Is the narrative engaging?
- Does it feel like a break or an interruption?

### Test 3.3: Meter Economy Deep Dive

**Scenario:** Play 5 skirmishes with Mail equipped, using Press choices

**Track Wear Trend:**
- Skirmish 1: Wear = X
- Skirmish 2: Wear = X (+Y from skirmish)
- Skirmish 3: Wear = X (+Y from skirmish)
- Skirmish 4: Wear = X (+Y from skirmish)
- Skirmish 5: Wear = X (+Y from skirmish)

**Questions:**
- Does wear spiral out of control? (reaching 8-10 quickly)
- Can you recover via "Tend Kit" in micro campfires?
- How often do you need to choose "Tend Kit"? (Every campfire = too frequent)

**Track Exertion Trend:**
- Same tracking as wear
- Does "Sleep" in micro campfires help enough?
- Is exertion manageable or does it stack too fast?

**Critical Question:** 
If you play optimally (always Tend Kit when wear > 3, always Sleep when exertion > 3), do meters stay manageable, or do they still spiral?

---

## Phase 4: Edge Cases & Stress Tests (10 minutes)

### Test 4.1: Save/Load at Critical Points

**Test Points:**
1. Save on skirmish entry screen → Reload → Continue
2. Save during Tempo Strike overlay → Reload → What happens?
3. Save on resolve screen → Reload → Verify deterministic rendering
4. Save in micro campfire → Reload → Continue
5. Save after skirmish (travel scene) → Reload → Verify lastSkirmish cleared

**For Each:**
- Does the game load correctly?
- Is UI state correct?
- Can you continue playing normally?
- Is data preserved correctly?

### Test 4.2: Routing Stress Test

**Scenario:** Force 3 skirmishes in quick succession (use debug button if available)

**Check:**
- After each resolve → Continue → Does it route correctly?
- Do you ever bounce back to `skirmish_roadside_resolve`?
- Do campfires/encounters chain correctly?
- Are there any routing loops?

**Console Check:**
```javascript
// After exiting resolve, check:
console.log('Current scene:', gameState.currentScene);
console.log('Last skirmish returnScene:', gameState.lastSkirmish?.returnScene);
qaRunRoutingTests(); // Should pass
```

### Test 4.3: Variant Distribution

**Scenario:** Force 10 skirmishes (use debug if available)

**Track:**
- How many of each variant?
  - Roadside: X
  - Mud & Ruts: X
  - Narrow Lane: X

**Expected:** Roughly 60% Roadside, 20% Mud, 20% Lane (but RNG can vary)

**Check:**
- Do variants feel meaningfully different?
- Are modifiers clearly shown in formula text?
- Do variant-specific costs (mud wear, lane spear penalty) feel fair?

---

## Phase 5: Mobile/UX Assessment (5 minutes)

### Test 5.1: Tempo Strike Overlay

**On Mobile Device (or resize browser to mobile size):**
1. Open Tempo Strike overlay
2. **Check:**
   - Are Stop/Skip buttons large enough? (min 44x44px touch target)
   - Can you tap the bar reliably?
   - Does overlay prevent scrolling/jank?
   - Is text readable?

### Test 5.2: Resolve Screen Clarity

**After a skirmish:**
1. **Check resolve screen displays:**
   - Timing result visible? ("Tempo: +2 (PERFECT)")
   - Variant info if present?
   - Formula shows all modifiers?
   - Costs explained clearly? ("Wear +1 (mail heat)")

2. **Is it clear:**
   - Why you succeeded/failed?
   - What each cost means?
   - What the margin represents?

### Test 5.3: Micro Campfire Speed

**When micro campfire appears:**
- Is text 1-2 sentences? (no scroll needed)
- Do 4 choices fit on screen?
- Are choices clear and actionable?
- Any unnecessary delay/animations?

---

## Phase 6: Final Assessment (5 minutes)

### Overall Feel Questions:

1. **Fun Factor:**
   - Is the loop engaging or repetitive?
   - Would you want to play more skirmishes?
   - Does it feel like meaningful choices or busywork?

2. **Balance:**
   - Are meters manageable with optimal play?
   - Is mail viable or a trap?
   - Is Tempo Strike optional or mandatory?

3. **Pacing:**
   - Do campfires appear at a good rate?
   - Is the skirmish → resolve → travel flow smooth?
   - Any jarring transitions?

4. **Clarity:**
   - Do you understand why things happen?
   - Is feedback clear?
   - Are costs explained well?

### Critical Issues to Flag:

**Must Fix (Blocks Release):**
- Routing loops (bouncing between scenes)
- Save/load breaking game state
- Meters spiraling uncontrollably
- Tempo Strike feeling mandatory (no skip option)

**Should Fix (Balance/UX):**
- Campfires too frequent/rare
- Mail wear spiraling too fast
- Unclear cost explanations
- Mobile UI issues

**Nice to Have (Polish):**
- Variant prose could be more distinct
- Micro campfire descriptions could rotate
- Timing window could be slightly easier/harder

---

## Reporting Format

### Summary Section:
```
PLAYTEST SUMMARY
================
Build Tested: [A/B/C]
Total Skirmishes: X
Total Campfires: X (Y micro, Z full)
Final Meters: Exertion=X/10, Wear=X/10, Morale=X/10

CRITICAL ISSUES: [List any blocking bugs]
BALANCE CONCERNS: [List meter economy, Tempo Strike feel, etc.]
UX ISSUES: [List clarity, mobile, feedback problems]
POLISH SUGGESTIONS: [List nice-to-haves]
```

### Detailed Data:
- Skirmish-by-skirmish log (from Phase 2)
- Meter trend graphs (if possible)
- Campfire frequency data
- Tempo Strike usage patterns

### Recommendations:
- What should be tuned? (specific numbers)
- What should be fixed? (specific bugs)
- What should be added? (missing features)

---

## Console Helper Commands

```javascript
// Enable debug mode for diagnostic logs
qaEnableDebug()

// Run routing validation
qaRunRoutingTests()

// Check current state
console.log('State:', {
  scene: gameState.currentScene,
  exertion: gameState.exertion,
  wear: gameState.wear,
  morale: gameState.stats.morale,
  lastSkirmish: gameState.lastSkirmish?.key,
  campfireMode: gameState.campfire?.mode
});

// Force skirmish (if debug enabled)
forceSkirmishUI()
```

---

## Success Criteria

The game passes playtesting if:

✅ **Stability:**
- No routing loops
- Save/load works at all points
- No crashes or broken states

✅ **Balance:**
- Meters stay manageable with optimal play
- Mail is viable (not a trap, not mandatory)
- Tempo Strike feels optional (useful but not required)

✅ **Feel:**
- Loop is engaging (not tedious)
- Campfires appear at good cadence
- Choices feel meaningful

✅ **Clarity:**
- Costs are explained
- Feedback is clear
- UI is functional on mobile

---

## Notes for AI Agent

- **Be systematic:** Follow the phases in order
- **Be thorough:** Don't skip steps, record everything
- **Be honest:** If something feels bad, say so (don't optimize for "passing")
- **Be specific:** "Wear spirals too fast" is better than "balance feels off"
- **Test edge cases:** Don't just play optimally, test failure cases too
- **Use console:** The QA helpers are there for a reason

**Remember:** You're not trying to "win" the game—you're trying to find what breaks, what feels bad, and what needs tuning. Play like a real player would, but document like a tester should.
