# Narrative Continuity Audit & Fixes

**Date:** 2024  
**Scope:** Story flow and scene transition issues in `man-at-arms.html`

---

## Issues Found

### Issue #1 — Sudden Location Change (Northern France → England)

**Location:** `between_years_1343` → `between_years_1344`

**Current Flow:**
- **From:** `between_years_1343` (Year 1343, Age 24, Location: "Northern France")
  - Text: "Raids. Skirmishes. Patrols. The French come. You respond..."
- **To:** `between_years_1344` (Year 1344, Age 25, Location: "England")
  - Text: "Rumors. Always rumors. But these feel different..."

**Problem:** No narrative explanation of how/why the character traveled from Northern France back to England. The geography changes abruptly without transition.

**Root Cause:** Missing bridging narrative explaining the return to England (end of campaign, rotation home, etc.)

---

### Issue #2 — Timeline Inconsistency ("Tomorrow" Never Happens)

**Location:** `between_years_1345` → `spring_campaign`

**Current Flow:**
- **From:** `between_years_1345` (Year 1345, Age 26, Location: "England")
  - Text: "Tomorrow, you sail to France. The biggest campaign of your life awaits."
  - Choice: "March to battle" → `nextScene: "spring_campaign"`
- **To:** `spring_campaign` (Year 1346, Age 27, Location: "England")
  - Text: "Spring arrives, and with it, the call to arms. King Edward III prepares to invade France with a large army."

**Problem:** A full year elapsed between "tomorrow you sail" and the invasion still being in preparation. No explanation for the year-long delay or what happened to the planned departure.

**Root Cause:** 
1. `between_years_1345` promises immediate departure ("Tomorrow")
2. But `nextScene` goes to `spring_campaign` which is set in 1346 (next year)
3. The "tomorrow" promise is never fulfilled narratively

---

### Issue #3 — Abrupt Scene Transition (Indoor → Outdoor)

**Location:** `indenture_table` → (campfire insertion) → `purveyance`

**Current Flow:**
- **From:** `indenture_table` (Year 1346, June, Location: "Portsmouth, England")
  - Setting: Indoor, docks, signing contracts
  - Text: "A clerk reads the contract terms aloud while your captain watches faces for hesitation..."
- **To:** `purveyance` (Year 1346, Late June, Location: "Southern England")
  - Setting: Outdoor, countryside, supply gathering
  - Text: "Wagons arrive with hard bread and salted meat..."

**Problem:** No narrative bridge between contract signing at the docks and suddenly being at an evening campfire (if campfire inserts) or in the countryside. The transition from indoor document signing to outdoor campsite feels abrupt.

**Root Cause:** 
1. Campfire system (`maybeInsertCampfire()`) can insert between `indenture_table` resolution scenes and `purveyance`
2. No bridging scene explaining movement from docks to camp/muster area
3. Time jump from "June" to "Late June" without explanation

---

## Proposed Fixes

### Fix #1: Add Travel Bridge Scene

**Add new scene:** `return_to_england_1344`

**Insert between:** `between_years_1343` → `between_years_1344`

**Implementation:**
```javascript
return_to_england_1344: {
    title: "The Journey Home",
    year: 1344,
    age: 25,
    location: "At Sea / England",
    text: `<p>The campaign in Northern France ends. Not with victory. Not with defeat. Just... done. Orders come down. Your unit is being rotated home. Back to England. Back to waiting.</p>
           <p>The crossing is rough. Cold. Wet. Men huddle below decks. Above, the sea churns. You've seen worse. But that doesn't make it easier. Just familiar. Just another thing to endure.</p>
           <p>When land appears—the white cliffs of Dover—you feel something. Relief? Maybe. Or just the weight of what comes next. Because you know. This isn't peace. This is preparation. Something bigger is coming. You can feel it in the air. In the way officers talk. In the way men look at maps.</p>
           <p>You're home. But not for long.</p>`,
    choices: [
        {
            text: "Continue",
            effects: {},
            nextScene: "between_years_1344"
        }
    ]
}
```

**Update `between_years_1343`:**
```javascript
// Change line 5406 from:
nextScene: "between_years_1344"
// To:
nextScene: "return_to_england_1344"
```

---

### Fix #2: Fix Timeline Promise

**Option A: Change "Tomorrow" to "Soon" (Minimal Fix)**

**Update `between_years_1345` text:**
```javascript
// Change line 5432 from:
<p>Tomorrow, you sail to France. The biggest campaign of your life awaits.</p>
// To:
<p>Preparations intensify. The king's plans are taking shape. Soon, you'll sail to France. The biggest campaign of your life awaits.</p>
```

**Option B: Add Delay Explanation Scene (Better Fix)**

**Add new scene:** `campaign_delayed_1345`

**Insert between:** `between_years_1345` → `spring_campaign`

**Implementation:**
```javascript
campaign_delayed_1345: {
    title: "Waiting",
    year: 1345,
    age: 26,
    location: "England",
    text: `<p>Tomorrow never comes.</p>
           <p>Orders change. Plans shift. The king's attention turns elsewhere. A diplomatic mission. A border dispute. Something always comes up. Something that matters more than your unit. More than your plans.</p>
           <p>You wait. Train. Drill. Check your gear again. And again. Because you know. When it comes, it will come fast. No warning. No time to prepare. Just orders. Just movement. Just war.</p>
           <p>Months pass. Seasons change. The promise of France hangs in the air. Unfulfilled. Unforgotten. Just... waiting.</p>
           <p>Then spring arrives. And with it, new orders. Real orders. This time, it's different. This time, it's real.</p>`,
    choices: [
        {
            text: "The call comes",
            effects: {},
            nextScene: "spring_campaign"
        }
    ]
}
```

**Update `between_years_1345`:**
```javascript
// Change line 5437 from:
nextScene: "spring_campaign"
// To:
nextScene: "campaign_delayed_1345"
```

**Recommendation:** Use Option B for better narrative flow.

---

### Fix #3: Add Muster/Camp Bridge Scene

**Add new scene:** `portsmouth_muster`

**Insert between:** `indenture_table` resolution scenes → `purveyance`

**Implementation:**
```javascript
portsmouth_muster: {
    title: "The Muster",
    year: 1346,
    age: 27,
    location: "Portsmouth, England",
    text: `<p><strong>Mid-June 1346 — Portsmouth</strong></p>
           <p>After signing, you're directed to the muster field. Tents stretch across the hillside. Men from a dozen lords. Archers. Men-at-arms. Sergeants. All waiting. All preparing.</p>
           <p>You find your unit's section. Set up your tent. Check your gear. The routine is familiar. But the scale is different. This isn't a raid. This isn't a skirmish. This is an army.</p>
           <p>Days pass. More men arrive. More ships. The harbor fills. The camp grows. You drill. You wait. You watch the horizon. Because you know. Soon, the order will come. Soon, you'll board those ships. Soon, you'll sail to France.</p>
           <p>But first, there's the matter of supplies. The army must eat. And that means purveyance.</p>`,
    choices: [
        {
            text: "Continue",
            effects: {},
            nextScene: "purveyance"
        }
    ]
}
```

**Update all indenture resolution scenes:**
```javascript
// In indenture_negotiate, indenture_prisoners, indenture_sign
// Change lines 6298, 6329, 6361 from:
nextScene: "purveyance"
// To:
nextScene: "portsmouth_muster"
```

**Additional Fix: Prevent Campfire Between Indenture and Muster**

**Update campfire insertion logic** (or add `noCampfire` flag):

```javascript
portsmouth_muster: {
    // ... existing fields ...
    noCampfire: true, // Prevent campfire insertion here
    // OR ensure campfire can only insert AFTER purveyance
}
```

**Alternative:** Update `maybeInsertCampfire()` to skip insertion between `indenture_*` scenes and `purveyance`:

```javascript
// In maybeInsertCampfire(), add check:
const noCampfireScenes = ['indenture_table', 'indenture_negotiate', 'indenture_prisoners', 'indenture_sign', 'portsmouth_muster'];
if (noCampfireScenes.includes(nextSceneKey) || noCampfireScenes.includes(gameState.currentScene)) {
    return nextSceneKey; // Skip campfire insertion
}
```

---

## Additional Narrative Issues to Check

### Potential Issue #4: Year Progression Inconsistency

**Check:** Are there other scenes where year/age jumps without explanation?

**Recommendation:** Audit all `between_years_*` scenes for smooth transitions.

### Potential Issue #5: Location State vs Scene Text Mismatch

**Check:** Does `gameState.location` always match scene `location` field?

**Example:** Scene says "Portsmouth, England" but `gameState.location` might still say "England"

**Recommendation:** Ensure `onEnter` functions update `gameState.location` to match scene location.

---

## Implementation Priority

1. **High Priority:** Fix #3 (Muster bridge) - Most jarring transition, affects main campaign flow
2. **Medium Priority:** Fix #2 (Timeline promise) - Breaks player expectation
3. **Low Priority:** Fix #1 (Travel bridge) - Less critical, but improves immersion

---

## Testing Checklist

After implementing fixes:

- [ ] Play through `between_years_1343` → verify travel bridge appears
- [ ] Play through `between_years_1345` → verify delay explanation or "soon" text
- [ ] Play through `indenture_table` → verify muster scene appears before purveyance
- [ ] Verify campfire doesn't insert between indenture and muster
- [ ] Check that `gameState.location` updates correctly at each transition
- [ ] Verify year/age progression is consistent throughout

---

## Code Locations Reference

| Issue | Scene ID | Line Range | Fix Location |
|-------|----------|------------|--------------|
| #1 | `between_years_1343` | 5394-5409 | Line 5406: Change nextScene |
| #1 | `between_years_1344` | 5410-5425 | Add new scene before this |
| #2 | `between_years_1345` | 5426-5440 | Line 5432: Change text, line 5437: Change nextScene |
| #2 | `spring_campaign` | 6220-6234 | Add new scene before this (if Option B) |
| #3 | `indenture_table` | 6235-6268 | N/A (resolved by new scene) |
| #3 | `indenture_*` scenes | 6269-6364 | Lines 6298, 6329, 6361: Change nextScene |
| #3 | `purveyance` | 6365-6398 | Add new scene before this |

---

## Notes

- All new scenes should follow the existing scene structure format
- Ensure `year`, `age`, and `location` fields are set correctly
- Test that campfire insertion logic doesn't break with new scenes
- Consider adding `noCampfire: true` flag to bridge scenes if they're meant to be quick transitions
