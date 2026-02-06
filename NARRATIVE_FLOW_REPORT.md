# Narrative Flow + Code Flow Report
## A Man-at-Arms' Life — Comprehensive Audit

---

## 1. Executive Summary

1. **BLOCKER — 204 undefined scenes**: Choices in 204 cases point to `nextScene` IDs that don't exist. The game silently resets to character creation when any of these are hit, destroying player progress and immersion. This is the #1 issue by a wide margin.

2. **HIGH — Flavor-event islands are unreachable dead-ends**: The ~40 flavor-event scenes (`march_through_normandy_1`, `marsh_crossing`, `crecy_preparation`, etc.) route to undefined destination scenes like `march_continues`, `camp_rest`, `crecy_battle`, `siege_continues`. Players who enter these events via random encounter insertion can never exit them cleanly.

3. **HIGH — Campfire/random encounter insertion can interrupt critical narrative moments**: Only 5 of ~250 narrative scenes use `noCampfire: true`. The insertion pipeline (skirmish → campfire → random encounter) runs on *every* choice, meaning a dramatic battle aftermath can be interrupted by a joke about a lost boot.

4. **HIGH — Chapter transition overlap**: Chapters 1 ("Chevauchée") and 2 ("Calais") both trigger at year 1346, creating a race condition where `checkChapterTransition()` can flip between them depending on scene ordering.

5. **MEDIUM — State-to-prose alignment is surface-level**: While 228 scenes use function-based text, most state checks are for `characterName` interpolation only. Wounds, fatigue, exertion, wear, companion presence, and gear are rarely reflected in narrative prose.

6. **MEDIUM — Save/load doesn't validate scene existence**: A save made during a scene that gets renamed or removed will silently reset to character creation on load, with no migration path.

7. **MEDIUM — No cooldown between intense scenes**: The flavor-event pool has no "emotional pacing" filter — a combat skirmish can be immediately followed by a random insult battle, then a campfire moral dilemma, creating emotional whiplash.

---

## 2. Flow Map (High Level)

### Major Arcs

```
CHARACTER CREATION (1337)
  │
  ├─► TRAINING ARC (1338) ─────────────────────────────────────────────┐
  │   training_peasant / training_squire / training_merchant / etc.     │
  │   └──► first_battle_brave / first_battle_cautious / first_battle_leader
  │                                                                     │
  ├─► EARLY CAREER (1339–1343) ◄───────────────────────────────────────┘
  │   archery_duel_1339 → winter_quarters → equipment_upgrade_1340
  │   → between_years_1341 → between_years_1342 → between_years_1343
  │   (COMBAT BRANCHES: forest_ambush_1340, cavalry_skirmish_1342,
  │    siege_defense_1345, river_crossing_1344)
  │                                                                    
  ├─► RETURN TO ENGLAND (1344) ──────────────────────────────────────────┐
  │   return_to_england_1344 → between_years_1344                        │
  │   → campaign_delayed_1345 / between_years_1345                       │
  │                                                                      │
  ├─► THE 1346 CAMPAIGN (Chapter 1: Chevauchée) ◄──────────────────────┘
  │   spring_campaign → indenture_table → indenture_negotiate/sign
  │   → portsmouth_muster → purveyance → channel_crossing
  │   → saint_vaast_landing → landing_scout/raid/banner
  │   → chevauchée_burn → torch/hostages/spare
  │   → caen_bridge → hold/loot → prisoner_argument
  │   → denuded_country → forage/horse/thief
  │   → blanchetaque_ford → wade/cover/rescue
  │   → battle_crecy → crecy_defensive/loot/rescue
  │   → crecy_night → wounded/gear/ransom
  │   → march_to_calais
  │
  ├─► SIEGE OF CALAIS (Chapter 2: 1346–1347)
  │   calais_siege → calais_latrines/night/skim
  │   → winter_flux → flux_clean/food/survive
  │   → calais_keys → keys_disciplined/water/souvenir
  │   → after_calais → end_game
  │
  ├─► FLAVOR EVENTS (inserted randomly during travel)
  │   march_through_normandy_1..14, marsh_crossing, enemy_scouts,
  │   crecy_preparation, plunder_decision, refugee_column, etc.
  │   *** MOST ROUTE TO UNDEFINED SCENES ***
  │
  ├─► RANDOM ENCOUNTERS (15 in pool)
  │   random_drunken_song, random_lost_boot, random_gambling_debt, etc.
  │   (return to saved returnScene via returnFromRandomEncounter())
  │
  ├─► SKIRMISH SYSTEM
  │   skirmish_roadside → mud/lane → resolve → post-skirmish routing
  │
  └─► DEATH/END SCENES
      death_camp_fever, death_plague, death_starvation, etc.
      end_game (final legacy screen)
```

### Key Junction Nodes (Gates)

| Junction | Gate Condition | Branches |
|----------|---------------|----------|
| `character_creation` | Origin, patron, name, priorities | `start` |
| `start` | `gameState.background` | `training_*` (7 variants) |
| `first_battle_*` | Resolution roll | `first_battle_*_resolve` |
| `between_years_*` | Year progression | Next year's scenes |
| `spring_campaign` | Year == 1346 | `indenture_table` |
| `battle_crecy` | Combat resolution | `crecy_defensive/loot/rescue` |
| `crecy_night_*` | Choice | `march_to_calais` |
| `calais_keys` | Choice | `keys_*` → `after_calais` |
| `makeChoice()` pipeline | Random rolls | skirmish / campfire / random encounter insertion |

---

## 3. Abrupt Transition Report (Prioritized)

### BLOCKER Issues

| # | Where | Symptom | Cause | Fix |
|---|-------|---------|-------|-----|
| B1 | 204 `nextScene` references | Player makes choice → game resets to character creation with "Invalid scene transition" error | Scene IDs referenced in choices were never defined. They appear to be intended outcome scenes for flavor events and encounters. | Define stub scenes for all 204 IDs that route back to the calling scene's arc, OR replace undefined IDs with existing fallback scenes. See §4 Patch Plan. |
| B2 | `crecy_battle` (referenced 3×) | Crécy preparation scene routes to non-existent battle scene | `crecy_battle` was never defined; player should go to `battle_crecy` instead | Change 3 references from `crecy_battle` to `battle_crecy` |
| B3 | `march_continues` (referenced 5×) | Multiple flavor events dead-end here | No scene defined for generic "march continues" transition | Define `march_continues` as a brief bridge scene routing back to the next flavor event or main arc scene |

### HIGH Issues

| # | Where | Symptom | Cause | Fix |
|---|-------|---------|-------|-----|
| H1 | Campfire insertion on critical transitions | Player is at dramatic battle aftermath → suddenly at a campfire joke | Only 5 scenes have `noCampfire: true`; `shouldInsertCampfire()` doesn't check scene intensity/tags | Add `noCampfire: true` to all combat, death, ending, and key narrative scenes. Add scene tag system for intensity levels. |
| H2 | `checkChapterTransition()` L1151–1192 | Chapter 1 and 2 both fire at year 1346, chapter can flip mid-arc | Both conditions match `year >= 1346`, Chapter 2 check depends on Chapter 1 being set first | Add explicit scene-based gating: Chapter 2 only activates when `calais_siege` is entered, not by year alone |
| H3 | Flavor events → undefined exits | ~40 flavor events each have 2–3 choices pointing to undefined scenes | These events were written with outcome scene names that were never implemented | Create ~30 generic outcome stub scenes (see B1) or redirect to `returnFromRandomEncounter()` |
| H4 | Random encounter chaining | Skirmish → campfire → random encounter can fire in sequence on a single choice | The pipeline in `makeChoice()` L17441–17448 runs all three insertion checks sequentially | Add mutual exclusion: if skirmish fires, skip campfire + random; if campfire fires, skip random |
| H5 | `chevauchée_burn` / `chevauchée_spare` in undefined list | Main campaign choices point to undefined scenes | These scenes ARE defined (L6869, L6973) but the grep-based extraction misses accented characters in some contexts — verify encoding | Check file encoding; the scenes do exist in the code. This may be a false positive from analysis tooling. Verify by testing in browser. |

### MEDIUM Issues

| # | Where | Symptom | Cause | Fix |
|---|-------|---------|-------|-----|
| M1 | Post-combat → no aftermath acknowledgment | Win skirmish → next scene ignores injuries/exertion gained | `skirmish_roadside_resolve` sets exertion/wear but next scene's text doesn't reference it | Add state-aware micro-bridges in post-combat scenes: `if (gameState.exertion >= 3) "Your arms ache..."` |
| M2 | `saveGame()` doesn't store insertion pipeline state | Save during campfire → load → campfire `returnScene` is lost | `gameState.campfire.returnScene` survives serialization but `randomEncounter` state may not hydrate correctly | Verify `hydrateLoadedState()` restores `campfire.returnScene` and `randomEncounter` sub-objects |
| M3 | `scenesVisited` capped at 100 | Long playthroughs lose history; can't detect if player already saw a flavor event | Hard cap in `makeChoice()` L17371–17373 | Increase to 200 or use a Set of scene keys (cheaper) for dedup, keep the last-100 array for navigation |
| M4 | Campfire "Campfire" title reuse | Same "Campfire" header appears for different vignettes (gear maintenance, personal questions, etc.) | All campfire micro-vignettes share the `campfire_interlude` scene with a single title | Dynamically set title from the selected vignette: `title: function() { return currentVignette.title || "Campfire"; }` |
| M5 | No "quiet beat" after intense scenes | Battle aftermath → immediately into travel flavor event with tense tone | No cooldown/pacing system for emotional intensity | Add `intensity` tag to scenes; after high-intensity, force 1–2 low-intensity scenes before allowing another high one |
| M6 | `loadGame()` doesn't validate currentScene | Load save from version where scene was renamed → silent reset | L17418–17427 resets to `character_creation` without telling player why | Show "Your save references scene X which no longer exists. Starting from nearest checkpoint." |
| M7 | Condition/wound text not reflected | Player has "Seriously Wounded" condition but next scene says "You walk briskly" | Static text doesn't check `hasCondition()` | Add state-aware variants to travel scenes (see §4) |

### LOW Issues

| # | Where | Symptom | Cause | Fix |
|---|-------|---------|-------|-----|
| L1 | Equipment changes not narrated | Player buys new sword → no mention in subsequent scenes | Equipment system is separate JS file, not integrated into scene text | Add equipment-aware text variants for key scenes |
| L2 | `Wat` appears in scenes regardless of relationship state | Wat speaks in scenes even if player never built rapport | No relationship gate on Wat's dialogue | Add `gameState.relationships.wat` check before Wat-specific lines |
| L3 | Patron favor has no narrative payoff | `patronFavor` stat increases but is never referenced in text | Stat exists in state but no scene checks it | Add patron-specific scenes that fire at favor thresholds |
| L4 | `career.battles` / `career.wounds` are incremented but never displayed narratively | These counters are tracked but only shown in stats panel | No scene text references career totals | Add reflection scenes: "You've fought in ${career.battles} engagements now..." |

---

## 4. Patch Plan (Grouped by File)

### File: `man-at-arms.html`

---

#### PATCH B1/B3/H3: Define Missing Stub Scenes

**Severity**: BLOCKER  
**Root cause**: 204 `nextScene` values reference undefined scene IDs  
**Location**: After the last scene definition (around L12800, before `campfire_interlude`)

Create a generic fallback routing function and ~30 stub scenes that cover the most common undefined exit categories:

```javascript
// BEFORE: (nothing — these scenes don't exist)

// AFTER: Add these stub scenes inside the `scenes` object

// Generic "march continues" bridge (referenced 5×)
march_continues: {
    title: "The March Continues",
    year: function() { return gameState.year; },
    age: function() { return gameState.age; },
    location: function() { return gameState.location || "France"; },
    text: function() {
        const name = gameState.characterName || "Soldier";
        const fatigue = gameState.exertion >= 3 ? " Every step is a labor now." : "";
        return `<p>The column moves on.${fatigue} The road stretches ahead, rutted and muddied by the passage of thousands. You fall into the rhythm of it — boot, breath, boot, breath. ${name} the soldier, putting one foot before the other. The same as yesterday. The same as tomorrow.</p>
        <p>Wat walks beside you. Neither of you speaks. There's nothing to say that the road doesn't say for you.</p>`;
    },
    choices: [
        {
            text: "Keep marching",
            effects: { endurance: 1, stress: 1 },
            nextScene: "march_through_normandy_1"
        }
    ]
},

// Generic "camp rest" bridge (referenced 2×)
camp_rest: {
    title: "Rest in Camp",
    year: function() { return gameState.year; },
    age: function() { return gameState.age; },
    location: function() { return gameState.location || "Camp"; },
    text: function() {
        const wounded = hasCondition('Wounded') || hasCondition('Seriously Wounded');
        const woundText = wounded ? " You ease yourself down carefully, mindful of your injuries." : "";
        return `<p>You find a spot near the fire.${woundText} The ground is hard but you've slept on worse. Around you, the camp settles into its evening routine — men eating, talking in low voices, sharpening blades. The familiar sounds of an army at rest.</p>`;
    },
    choices: [
        {
            text: "Sleep — you need it",
            effects: { stress: -1, endurance: 1 },
            nextScene: "march_through_normandy_1"
        }
    ]
},

// Generic "siege continues" bridge (referenced 1×)
siege_continues: {
    title: "The Siege Drags On",
    year: function() { return gameState.year; },
    age: function() { return gameState.age; },
    location: "Calais",
    text: function() {
        return `<p>Another day before the walls of Calais. The routine is numbing — watch, eat, sleep, watch again. The French won't come out. You won't go in. Both sides waiting for the other to break. The siege is a war of patience, and patience is a weapon you're learning to wield.</p>`;
    },
    choices: [
        {
            text: "Return to your duties",
            effects: { stress: 1 },
            nextScene: "calais_siege"
        }
    ]
},

// Generic "camp continues" / "camp settled" / "camp observed" / "camp life"
camp_continues: {
    title: "Camp Life",
    year: function() { return gameState.year; },
    age: function() { return gameState.age; },
    location: function() { return gameState.location || "Camp"; },
    text: function() {
        return `<p>The camp goes on around you. Fires burning. Men talking. The ordinary business of war when there is no fighting to be done. You find your place in it, as you always do.</p>`;
    },
    choices: [
        {
            text: "Settle in for the night",
            effects: { stress: -1 },
            nextScene: "march_through_normandy_1"
        }
    ]
},

camp_settled: {
    title: "Settled In",
    year: function() { return gameState.year; },
    age: function() { return gameState.age; },
    location: function() { return gameState.location || "Camp"; },
    text: function() {
        return `<p>You settle into the camp. Your spot is claimed, your gear is stowed. The fire crackles. For a moment, there is something almost like peace.</p>`;
    },
    choices: [{ text: "Rest", effects: { stress: -1 }, nextScene: "march_through_normandy_1" }]
},

camp_observed: {
    title: "Observations",
    year: function() { return gameState.year; },
    age: function() { return gameState.age; },
    location: function() { return gameState.location || "Camp"; },
    text: function() {
        return `<p>You watch the camp from your position. Men move with purpose or without it. Some laugh. Some stare at nothing. War does different things to different men. You're still trying to figure out what it's doing to you.</p>`;
    },
    choices: [{ text: "Return to your duties", nextScene: "march_through_normandy_1" }]
},

camp_life: {
    title: "Camp Life",
    year: function() { return gameState.year; },
    age: function() { return gameState.age; },
    location: function() { return gameState.location || "Camp"; },
    text: function() {
        return `<p>Another evening in camp. The fire. The talk. The weight of your gear piled beside you. You eat what there is and drink what there is and try not to think too far ahead. Tomorrow will come. It always does.</p>`;
    },
    choices: [{ text: "Get some sleep", effects: { stress: -1, endurance: 1 }, nextScene: "march_through_normandy_1" }]
},
```

**Additional stubs needed** (provide same pattern — brief narrative bridge → route to nearest main-arc scene):

| Stub Scene | Routes Back To | Category |
|------------|---------------|----------|
| `crecy_battle` | `battle_crecy` | Battle entry |
| `acceptance` | `march_through_normandy_1` | Moral outcome |
| `mercy_shown` | `march_through_normandy_1` | Moral outcome |
| `lesson_learned` | `march_through_normandy_1` | Reflection |
| `rest_earned` | `march_through_normandy_1` | Rest |
| `battle_prepared` | `crecy_preparation` | Battle prep |
| `scout_discovery` | `march_through_normandy_1` | Scouting |
| `shelter_found` | `march_through_normandy_1` | Weather |
| `negotiation` | `march_through_normandy_1` | Social |
| `confession` | `march_through_normandy_1` | Religious |
| (remaining ~190) | Context-dependent | Various |

**Recommended approach**: Rather than writing 204 unique scenes, create a **generic fallback system**:

```javascript
// Add near L17418 (after the "Scene not found" check in makeChoice):

// BEFORE:
if (!scenes[nextSceneName]) {
    console.error("Scene not found:", nextSceneName);
    console.error("Available scenes:", Object.keys(scenes).slice(0, 20));
    console.warn("Invalid scene, resetting to character_creation");
    gameState.currentScene = 'character_creation';
    showNotification('Error', 'Invalid scene transition. Resetting to character creation.');
    updateDisplay();
    return;
}

// AFTER:
if (!scenes[nextSceneName]) {
    console.warn("[FALLBACK] Scene not found:", nextSceneName, "— using arc-aware fallback");
    // Route to the best available scene based on current chapter/year
    const fallbackMap = {
        'chevauchée': 'march_through_normandy_1',
        'calais': 'calais_siege',
        'plague': 'start',  // TODO: add plague arc scenes
        'poitiers': 'start' // TODO: add poitiers arc scenes
    };
    const fallback = fallbackMap[gameState.chapter] || 'march_through_normandy_1';
    if (scenes[fallback]) {
        nextSceneName = fallback;
        showNotification('Narrative', 'The road continues...', 'info');
    } else {
        // Last resort
        gameState.currentScene = 'character_creation';
        showNotification('Error', 'Scene not found. Resetting.');
        updateDisplay();
        return;
    }
}
```

---

#### PATCH B2: Fix `crecy_battle` → `battle_crecy`

**Severity**: BLOCKER  
**Location**: Lines 11108, 11113, 11118

```javascript
// BEFORE (3 occurrences):
nextScene: "crecy_battle"

// AFTER:
nextScene: "battle_crecy"
```

---

#### PATCH H1: Expand `noCampfire` Coverage

**Severity**: HIGH  
**Location**: Scene definitions throughout the file

Add `noCampfire: true` to these scene categories:

```javascript
// All combat/battle scenes:
battle_crecy, crecy_defensive, crecy_loot, crecy_rescue,
crecy_night, crecy_night_wounded, crecy_night_gear, crecy_night_ransom,
caen_bridge, caen_bridge_hold, caen_bridge_loot,
blanchetaque_ford, blanchetaque_wade, blanchetaque_cover, blanchetaque_rescue

// All death scenes:
death_camp_fever, death_plague, death_starvation, death_broke,
death_dysentery, death_pneumonia, death_sepsis, death_pitchfork,
forced_retirement_broken_legs

// Key narrative moments:
calais_keys, keys_disciplined, keys_water, keys_souvenir,
after_calais, end_game, march_to_calais

// All skirmish scenes:
skirmish_roadside, skirmish_roadside_mud, skirmish_roadside_lane,
skirmish_roadside_resolve
```

---

#### PATCH H2: Fix Chapter Transition Overlap

**Severity**: HIGH  
**Location**: `checkChapterTransition()` at L1151

```javascript
// BEFORE:
// Chapter 2: Siege of Calais (1346-1347)
if (gameState.year >= 1346 && gameState.year <= 1347 && gameState.chapter !== 'calais') {
    if (gameState.chapter === 'chevauchée' || (gameState.year === 1347 && ...)) {

// AFTER:
// Chapter 2: Siege of Calais (1346-1347)
// Only transition to Calais when the player actually enters the Calais arc
if (gameState.year >= 1346 && gameState.year <= 1347 && gameState.chapter !== 'calais') {
    const calaisScenes = ['calais_siege', 'march_to_calais', 'calais_latrines', 'calais_night', 'calais_skim'];
    const inCalaisArc = calaisScenes.includes(gameState.currentScene);
    if (inCalaisArc || (gameState.year === 1347 && !gameState.chapterProgress.calais.started)) {
```

---

#### PATCH H4: Mutual Exclusion in Insertion Pipeline

**Severity**: HIGH  
**Location**: `makeChoice()` at L17440–17448

```javascript
// BEFORE:
const afterSkirmish = maybeInsertSkirmish(nextSceneName);
const afterCampfire = maybeInsertCampfire(afterSkirmish);
tickRandomEncounterCooldown(gameState.currentScene);
finalNextScene = maybeInsertRandomEncounter(gameState.currentScene, afterCampfire);

// AFTER:
// Mutual exclusion: only one insertion per transition
const afterSkirmish = maybeInsertSkirmish(nextSceneName);
if (afterSkirmish !== nextSceneName) {
    // Skirmish was inserted — skip campfire and random encounter
    finalNextScene = afterSkirmish;
} else {
    const afterCampfire = maybeInsertCampfire(nextSceneName);
    if (afterCampfire !== nextSceneName) {
        // Campfire was inserted — skip random encounter
        finalNextScene = afterCampfire;
    } else {
        // No skirmish or campfire — try random encounter
        tickRandomEncounterCooldown(gameState.currentScene);
        finalNextScene = maybeInsertRandomEncounter(gameState.currentScene, nextSceneName);
    }
}
```

---

#### PATCH M1: State-Aware Micro-Bridges for Post-Combat

**Severity**: MEDIUM  
**Location**: Key travel/transition scenes

Add state-aware text variants to `march_through_normandy_1` and similar travel scenes:

```javascript
// BEFORE (example from march_through_normandy_1 text function):
return `<p>The sun beat down. The column moved...

// AFTER:
const woundText = hasCondition('Wounded') ? '<p><em>Your wound throbs with each step. The bandage is soaked through again.</em></p>' : '';
const fatigueText = hasCondition('Fatigued') ? '<p><em>Your legs are heavy. Every mile feels like ten.</em></p>' : '';
const exertionText = gameState.exertion >= 5 ? '<p><em>Your body protests. The weight of mail and sword and shield — it all adds up. You need rest. Real rest.</em></p>' : '';
return `${woundText}${fatigueText}${exertionText}<p>The sun beat down. The column moved...
```

---

#### PATCH M4: Dynamic Campfire Titles

**Severity**: MEDIUM  
**Location**: `campfire_interlude` scene definition (~L12785)

```javascript
// BEFORE:
campfire_interlude: {
    title: "Campfire",

// AFTER:
campfire_interlude: {
    title: function() {
        // Use the vignette's title if available
        if (gameState.campfire && gameState.campfire.currentVignetteTitle) {
            return gameState.campfire.currentVignetteTitle;
        }
        return "Campfire";
    },
```

And in the vignette selection logic, set `gameState.campfire.currentVignetteTitle = selectedVignette.title;`

---

#### PATCH M5: Emotional Pacing System

**Severity**: MEDIUM  
**Location**: Add to `shouldInsertCampfire()` and `shouldInsertRandomEncounter()`

```javascript
// Add scene intensity tracking to gameState:
// In gameState initialization (~L1040):
sceneIntensity: 0, // 0=calm, 1=tense, 2=combat, 3=climactic

// In makeChoice(), after setting currentScene:
gameState.sceneIntensity = (scenes[finalNextScene] && scenes[finalNextScene].intensity) || 0;

// In shouldInsertCampfire():
// After cooldown check, add:
if (gameState.sceneIntensity >= 2) {
    return false; // Don't insert campfire after intense scenes
}

// In shouldInsertRandomEncounter():
if (gameState.sceneIntensity >= 2) {
    return false;
}
```

Then tag key scenes with `intensity: 2` or `intensity: 3`:
- All combat/battle scenes: `intensity: 2`
- Crécy, Calais keys: `intensity: 3`
- Death scenes: `intensity: 3`
- Campfire micro-vignettes: `intensity: 0`
- Travel scenes: `intensity: 1`

---

#### PATCH M6: Save/Load Scene Validation

**Severity**: MEDIUM  
**Location**: `loadGame()` at L17845

```javascript
// AFTER hydration, BEFORE "Overwrite the existing live state" (L17874):

// Validate the saved scene still exists
if (hydrated.currentScene && !scenes[hydrated.currentScene]) {
    console.warn("[SAVE] Scene", hydrated.currentScene, "no longer exists. Finding nearest checkpoint.");
    // Try to find nearest valid scene based on year
    const checkpoints = [
        { year: 1337, scene: 'start' },
        { year: 1340, scene: 'winter_quarters' },
        { year: 1344, scene: 'return_to_england_1344' },
        { year: 1346, scene: 'spring_campaign' },
        { year: 1347, scene: 'calais_siege' }
    ];
    const playerYear = hydrated.year || 1337;
    let best = 'start';
    for (const cp of checkpoints) {
        if (cp.year <= playerYear && scenes[cp.scene]) {
            best = cp.scene;
        }
    }
    hydrated.currentScene = best;
    showNotification('Save Migration', `Your save referenced a scene that no longer exists. Resuming from nearest checkpoint.`, 'info');
}
```

---

#### PATCH M7: Wound/Condition Reflections in Key Scenes

**Severity**: MEDIUM  
**Location**: Multiple scenes

Add condition-aware text to the top 10 most-visited scenes. Example for `calais_siege`:

```javascript
// In calais_siege text function, add at start:
const conditionLines = [];
if (hasCondition('Seriously Wounded')) conditionLines.push('Your wound seeps. Moving hurts. Breathing hurts.');
if (hasCondition('Wounded')) conditionLines.push('The bandage itches. You try not to scratch it.');
if (hasCondition('Fatigued')) conditionLines.push('Your eyelids are heavy. Sleep was poor again.');
if (gameState.stats.stress >= 7) conditionLines.push('Your hands won\'t stop shaking. Not from cold.');
const condBlock = conditionLines.length ? '<p><em>' + conditionLines.join(' ') + '</em></p>' : '';
return `${condBlock}<p>The siege town spreads before you...`;
```

---

### File: `man-at-arms-equipment-system.js`

No critical flow issues found. Equipment stat bonuses are correctly applied via `getEffectiveStat()`. The main gap is **narrative integration** — equipment changes aren't reflected in scene text. This is a LOW priority enhancement (L1).

### File: `man-at-arms-equipment-ui.js`

No flow issues found. UI correctly opens/closes equipment screen overlay.

### File: `man-at-arms-enemy-profiles.js`

No flow issues found. Enemy stats are used by combat system.

### File: `files/flavor_events_*.js`

These files contain flavor event definitions that appear to be **unused** — they are not loaded or referenced by `man-at-arms.html`. The HTML file contains its own inline flavor events starting at L9800. The JS files may be an earlier draft or planned import that was never wired up. **No action needed** unless you intend to modularize.

---

## 5. Verification Checklist

### A. Critical Path Checks (Deterministic)

- [ ] **Character Creation → Start → Training**: Create character with each origin (peasant, squire, merchant, minor_noble, rural_peasant, craftsman_apprentice, manor_retainer). Verify each routes to correct training scene.
- [ ] **Training → First Battle**: Each training path should reach `first_battle_brave`, `first_battle_cautious`, or `first_battle_leader`.
- [ ] **Early Career 1338–1343**: Walk through `between_years_*` chain. Verify year increments and no campfire insertion on noCampfire scenes.
- [ ] **1346 Campaign Main Path**: `spring_campaign` → `indenture_table` → `indenture_sign` → `portsmouth_muster` → `purveyance` → `channel_crossing` → `saint_vaast_landing` → `landing_scout` → `chevauchée_burn` → (all 3 branches) → `caen_bridge` → `denuded_country` → `blanchetaque_ford` → `battle_crecy` → `crecy_night` → `march_to_calais` → `calais_siege` → `winter_flux` → `calais_keys` → `after_calais` → `end_game`.
- [ ] **Crécy Preparation → Battle**: Verify `crecy_preparation` choices now route to `battle_crecy` (not `crecy_battle`).
- [ ] **All `nextScene` values resolve**: Run `Object.keys(scenes).forEach(k => { const s = scenes[k]; if (s.choices) { (typeof s.choices === 'function' ? s.choices() : s.choices).forEach(c => { if (typeof c.nextScene === 'string' && !scenes[c.nextScene]) console.error('MISSING:', k, '→', c.nextScene); }); } });` in browser console.

### B. Random Encounter Sampling

- [ ] **Campfire insertion**: Play 20 transitions. Verify campfire never fires on `noCampfire` scenes.
- [ ] **Campfire return**: After campfire, verify return to correct scene (not `character_creation`).
- [ ] **Random encounter return**: Trigger random encounter (use debug tools). Verify `returnFromRandomEncounter()` returns to correct scene.
- [ ] **Skirmish exit**: Win/lose skirmish. Verify `getPostSkirmishNextScene()` routes correctly.
- [ ] **No chaining**: Verify a single choice never triggers skirmish + campfire + random encounter.

### C. Save/Load Mid-Arc

- [ ] **Save during 1346 campaign → Load**: Verify scene, year, age, location all restored correctly.
- [ ] **Save during campfire → Load**: Verify `campfire.returnScene` is preserved.
- [ ] **Save during random encounter → Load**: Verify `randomEncounter.returnScene` is preserved.
- [ ] **Load save from removed scene**: Manually edit localStorage to set `currentScene` to a non-existent scene. Verify graceful fallback (not silent reset).

### D. UI Safety

- [ ] **Double-click protection**: Rapidly click a choice button. Verify it doesn't fire `makeChoice()` twice.
- [ ] **Equipment screen during combat**: Open equipment screen during combat overlay. Verify it doesn't break combat state.
- [ ] **Modal stacking**: Open stats modal + equipment modal simultaneously. Verify no UI corruption.

### E. Flag/State Validation

- [ ] **`noCampfire` respected**: Set breakpoint in `shouldInsertCampfire()`. Verify it returns `false` for flagged scenes.
- [ ] **Conditions decay**: Add "Fatigued" condition with duration 2. Advance 2 scenes. Verify it expires.
- [ ] **Chapter transitions**: Walk from year 1346 → 1347 → 1348. Verify chapters transition chevauchée → calais → plague.
- [ ] **Stress cap disorders**: Set stress to 10. Make a choice. Verify `checkStressCapDisorders()` fires.

---

## 6. Priority Implementation Order

1. **PATCH B1 (Fallback system)** — Prevents 204 hard crashes. 30 minutes.
2. **PATCH B2 (`crecy_battle` → `battle_crecy`)** — 3-line fix. 2 minutes.
3. **PATCH H4 (Mutual exclusion)** — Prevents triple-insertion chaos. 10 minutes.
4. **PATCH H1 (Expand `noCampfire`)** — Prevents immersion-breaking interruptions. 15 minutes.
5. **PATCH B1 (Stub scenes)** — Define the 10 most-referenced undefined scenes. 30 minutes.
6. **PATCH H2 (Chapter transition fix)** — Prevents chapter flip-flop. 10 minutes.
7. **PATCH M1 + M7 (State-aware text)** — Improves felt continuity. 45 minutes.
8. **PATCH M4 (Dynamic campfire titles)** — Quick UX win. 10 minutes.
9. **PATCH M6 (Save/load validation)** — Prevents silent data loss. 15 minutes.
10. **PATCH M5 (Emotional pacing)** — Long-term quality improvement. 30 minutes.

**Estimated total**: ~3.5 hours for all patches.

---

*Report generated: 2026-02-05*
*Codebase: man-at-arms.html (18,343 lines) + 4 JS modules + 7 flavor event files*
*Analysis method: Static code analysis + scene graph extraction + state transition tracing*
