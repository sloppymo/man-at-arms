# Narrative Continuity Analysis Report
## Man-at-Arms Game

**Analysis Date:** Generated via systematic code review  
**Analyst:** AI Narrative Analysis System (Kimi-K-2.5)  
**Files Analyzed:** `man-at-arms.html` (20,043 lines), `DALLE_PROMPTS_SCENES.md`

---

## Executive Summary

This analysis examined the Man-at-Arms game codebase for narrative continuity issues across temporal, geographic, narrative flow, chronological ordering, character consistency, equipment/state tracking, and structural integrity. The game contains approximately 237 scenes spanning the Hundred Years' War (1337-1453), with a focus on the 1346 Chevauchée campaign.

**Overall Assessment:** The narrative structure is generally sound with a clear chronological progression from training (1337-1338) through early campaigns (1340-1345) to the major 1346 campaign. However, several continuity issues were identified that could disrupt player immersion, particularly around age progression inconsistencies, location transitions, and some abrupt narrative jumps.

**Key Findings:**
- **Critical Issues:** 2 structural problems (missing scene references, potential dead ends)
- **Moderate Issues:** 8 temporal/geographic inconsistencies and narrative flow problems
- **Minor Issues:** 12 polish issues related to age calculations, location consistency, and scene transitions

The game uses a sophisticated system with dynamic year/age/location functions for many scenes, which generally works well but creates some edge cases where hardcoded values conflict with dynamic calculations.

---

## Critical Issues (Must Fix)

### 1. Missing Scene Reference: `spring_campaign` → `indenture_table`
**Location:** Line ~6960-6976  
**Issue:** The `spring_campaign` scene (year 1346) leads to `indenture_table`, but there's a potential gap in narrative flow. The scene mentions "The invasion of France begins now" but immediately jumps to contract signing without showing the transition to Portsmouth or the muster preparation.

**Severity:** Critical  
**Impact:** Breaks narrative flow - player goes from "campaign begins" directly to contract signing without context

**Recommendation:** Add an intermediate scene or modify `spring_campaign` text to better set up the transition to Portsmouth.

---

### 2. Age Calculation Inconsistency: Hardcoded vs Dynamic Ages
**Location:** Multiple scenes throughout  
**Issue:** Many scenes use hardcoded age values (e.g., `age: 27` in 1346 scenes) while others use `age: function() { return gameState.age || 18; }`. This creates inconsistencies where:
- Character starts at age 18 in 1337
- Some scenes in 1338 use `age: 19` (hardcoded)
- Some scenes use `age: function() { return (gameState.age || 18) + 1; }`
- 1346 scenes all use hardcoded `age: 27`

**Example:** 
- `training_final_assessment` (year 1338) uses `age: function() { return (gameState.age || 18) + 1; }`
- `first_battle_brave` (year 1338) uses hardcoded `age: 19`
- All 1346 scenes use hardcoded `age: 27`

**Severity:** Critical  
**Impact:** If player's starting age differs from expected (e.g., quick start with age 27), all hardcoded age scenes will show incorrect age, breaking immersion

**Recommendation:** 
1. Standardize all scenes to use `age: function() { return gameState.age; }`
2. Ensure `gameState.age` is properly updated based on year progression
3. Remove all hardcoded age values

---

## Moderate Issues (Should Fix)

### 3. Temporal Continuity: Age Progression Calculation
**Location:** Lines 5903-5954 (`between_years_1341`)  
**Issue:** The scene shows year 1341 with age 22. If character started at age 18 in 1337, they should be 22 in 1341 (18 + 4 years = 22). However, the progression from 1337→1338→1340→1341 shows:
- 1337: age 18
- 1338: age 19 (correct)
- 1340: age 21 (should be 20 if starting at 18)
- 1341: age 22 (correct if 1340 was actually 21)

**Severity:** Moderate  
**Issue:** The jump from 1338 to 1340 skips 1339, which may be intentional (time skip), but the age calculation needs verification.

**Recommendation:** Verify age progression matches year progression. If 1339 is intentionally skipped, ensure age still increments correctly.

---

### 4. Geographic Continuity: Location Transition from England to France
**Location:** Lines 4847-4980 (`start` scene) and subsequent training scenes  
**Issue:** The `start` scene (year 1337, location: "England") leads to training scenes all set in "England", but the first battle scenes (`first_battle_brave`, etc.) jump directly to "Northern France" without showing the crossing or travel.

**Severity:** Moderate  
**Impact:** Abrupt location change without narrative justification - player is in England, then suddenly in Northern France

**Recommendation:** Add a transition scene showing the journey to France, or modify the first battle scene text to acknowledge the travel.

---

### 5. Narrative Flow: Abrupt Transition from Training to First Battle
**Location:** Training scenes → `first_battle_brave`/`first_battle_cautious`/etc.  
**Issue:** Training scenes end with assessment, then immediately jump to "Your first real battle" without showing:
- The call to arms
- The journey to France
- The arrival at the front
- The preparation before battle

**Severity:** Moderate  
**Impact:** Missing connective tissue - feels like training ends and battle begins with no transition

**Recommendation:** Add a scene between training completion and first battle showing the transition to active service.

---

### 6. Temporal Continuity: Year Jump from 1345 to 1346
**Location:** `campaign_delayed_1345` → `spring_campaign`  
**Issue:** Scene `campaign_delayed_1345` (year 1345) leads to `spring_campaign` (year 1346) with text "After months of waiting" but doesn't show the winter passage or explain the year jump.

**Severity:** Moderate  
**Impact:** Large time jump (entire year) without narrative acknowledgment

**Recommendation:** Add a winter quarters or "year passes" scene, or modify `spring_campaign` text to better acknowledge the time passage.

---

### 7. Geographic Continuity: Location String Inconsistencies
**Location:** Throughout codebase  
**Issue:** Location names are inconsistent:
- "Northern France" vs "Normandy" vs "Caen, Normandy" vs "Outside Caen, Normandy"
- "Calais, France" vs "Calais" (in dynamic functions)
- "Crécy, Picardy" vs "Crécy-en-Ponthieu" (line 12030)

**Severity:** Moderate  
**Impact:** Confusing for players tracking location, breaks immersion

**Recommendation:** Standardize location naming:
- Use "Normandy" for Normandy region scenes
- Use "Caen, Normandy" for Caen-specific scenes
- Use "Crécy, Picardy" consistently (not "Crécy-en-Ponthieu")
- Ensure dynamic location functions return consistent format

---

### 8. Narrative Flow: Missing Context in `crecy_night_gear` → `calais_siege`
**Location:** Lines 8563-8627  
**Issue:** Scene `crecy_night_gear` (after Crécy battle) leads directly to `calais_siege` without showing the march to Calais. However, `crecy_night_wounded` correctly leads to `march_to_calais`.

**Severity:** Moderate  
**Impact:** Inconsistent narrative paths - some routes skip the march to Calais

**Recommendation:** Make `crecy_night_gear` lead to `march_to_calais` instead of directly to `calais_siege` for consistency.

---

### 9. Chronological Ordering: Random Encounter Scenes Out of Sequence
**Location:** Various random encounter scenes (e.g., `forest_ambush_1340`, `cavalry_skirmish_1342`)  
**Issue:** These scenes can be triggered at various points via the random encounter system, potentially occurring out of chronological order relative to the main narrative timeline.

**Severity:** Moderate  
**Impact:** Player might experience a 1340 event after 1346 events, breaking chronological flow

**Recommendation:** Ensure random encounters respect chronological order - don't allow 1340 events to trigger if current year is 1346+.

---

### 10. Equipment/State Continuity: Equipment Quality System Transition
**Location:** Multiple scenes using `setEquipmentQuality()`  
**Issue:** Code shows both old equipment system (`gameState.equipment.weapon`, `gameState.equipment.armor`) and new inventory system (`gameState.inventory[]`). Some scenes update both, some only one, creating potential inconsistencies.

**Severity:** Moderate  
**Impact:** Equipment might not persist correctly between scenes if one system is updated but not the other

**Recommendation:** Complete migration to new inventory system and remove all old equipment format references.

---

## Minor Issues (Consider Fixing)

### 11. Age Calculation: Inconsistent Default Values
**Location:** Multiple scenes using `age: function() { return gameState.age || 18; }`  
**Issue:** Some functions default to 18, others to 27 (`quick_start_review` uses 27). If `gameState.age` is undefined, different scenes will show different default ages.

**Severity:** Minor  
**Recommendation:** Use consistent default age (18) or ensure `gameState.age` is always initialized.

---

### 12. Location: Dynamic Location Functions with Inconsistent Fallbacks
**Location:** Lines 9169+ (campfire and other dynamic scenes)  
**Issue:** Some scenes use `location: function() { return gameState.location || "Camp"; }` while others use `location: function() { return gameState.location || "Calais"; }`. Inconsistent fallbacks can cause location display issues.

**Severity:** Minor  
**Recommendation:** Standardize fallback locations or ensure `gameState.location` is always set.

---

### 13. Narrative Flow: Abrupt Scene Endings
**Location:** Various scenes, particularly `between_years_*` scenes  
**Issue:** Some "between years" scenes end abruptly with choices that immediately jump to the next year without narrative closure.

**Severity:** Minor  
**Recommendation:** Add brief transition text acknowledging the passage of time before moving to next scene.

---

### 14. Geographic Continuity: "At Sea / England" Location
**Location:** Line 6041 (`return_to_england_1344`)  
**Issue:** Location string "At Sea / England" is ambiguous - is the character at sea or in England?

**Severity:** Minor  
**Recommendation:** Use more specific location like "English Channel" or "Returning to England" to clarify.

---

### 15. Temporal Continuity: Year 1339 Scenes
**Location:** `archery_duel_1339` (line 6670)  
**Issue:** Scene exists for year 1339, but main narrative jumps from 1338 to 1340. This scene is only accessible via random encounters, creating a gap in the main timeline.

**Severity:** Minor  
**Recommendation:** Either add 1339 scenes to main narrative path or remove year 1339 from main progression.

---

### 16. Character Continuity: Relationship Tracking
**Location:** Throughout  
**Issue:** Relationship values (wat, cook, oana) are tracked but some scenes that should affect relationships don't update them, and some scenes reference relationships that haven't been established yet.

**Severity:** Minor  
**Recommendation:** Audit all relationship changes to ensure they're properly tracked and referenced.

---

### 17. Equipment/State Continuity: Flag Consistency
**Location:** Various scenes using `setFlag()` and `hasFlag()`  
**Issue:** Some flags are set but never checked, and some checks reference flags that might not be set. Flag names are sometimes inconsistent (e.g., "Shaken" vs "shaken").

**Severity:** Minor  
**Recommendation:** Create a flag registry and ensure all flags are consistently named and properly checked.

---

### 18. Narrative Flow: Campfire Scene Integration
**Location:** Campfire vignettes (lines 13349+)  
**Issue:** Campfire scenes return to `nextScene: "start"` which may not be the scene the player was in before the campfire triggered. This could cause narrative disorientation.

**Severity:** Minor  
**Recommendation:** Ensure campfire scenes properly return to the scene that triggered them using `gameState.campfire.returnScene`.

---

### 19. Structural: Duplicate Chapter Definitions
**Location:** Lines 1063-1068 and 1111-1116  
**Issue:** `chapter` and `chapterProgress` are defined twice in `gameState` initialization, which is redundant (though JavaScript allows this, it's confusing).

**Severity:** Minor  
**Recommendation:** Remove duplicate definitions.

---

### 20. Chronological Ordering: Historical Event Accuracy
**Location:** Crécy scenes (year 1346)  
**Issue:** Crécy battle occurred on August 26, 1346. Verify that all Crécy-related scenes correctly reference this date and that the sequence of events (march, battle, aftermath) matches historical timeline.

**Severity:** Minor  
**Recommendation:** Cross-reference with historical sources to ensure battle sequence matches actual events.

---

### 21. Narrative Flow: Resolution Scene Text
**Location:** Various `*_resolve` scenes  
**Issue:** Some resolution scenes show generic text like "You move among the wounded..." when `gameState.lastResolution` is undefined, which breaks immersion.

**Severity:** Minor  
**Recommendation:** Ensure all resolution scenes handle the case where `lastResolution` might be undefined, or add validation to prevent this state.

---

### 22. Geographic Continuity: Location Updates in Dynamic Scenes
**Location:** Scenes using `location: function() { return gameState.location; }`  
**Issue:** If `gameState.location` is not updated when character moves between scenes, location will be incorrect. Need to verify location is updated in all transition scenes.

**Severity:** Minor  
**Recommendation:** Audit all scene transitions to ensure `gameState.location` is updated when geographic movement occurs.

---

## Detailed Findings

### 1. Temporal Continuity

#### Age Progression Issues
- **Hardcoded vs Dynamic Ages:** Approximately 60+ scenes use hardcoded age values while others use dynamic functions. This creates inconsistency.
- **Age Calculation:** Starting age 18 in 1337 should result in age 27 in 1346 (18 + 9 years), which matches hardcoded values, but only if starting age is exactly 18.
- **Quick Start Compatibility:** Quick start characters start at age 27, which conflicts with hardcoded age 18-19 in early scenes.

#### Year Progression Issues
- **Time Skips:** Main narrative skips 1339 entirely (goes 1338 → 1340), which is fine but should be acknowledged.
- **Year Jumps:** Large jumps (e.g., 1345 → 1346) need better narrative justification.
- **Dynamic Year Functions:** Many scenes use `year: function() { return gameState.year; }` which is good, but some hardcoded year values conflict.

### 2. Geographic Continuity

#### Location Transition Issues
- **England to France:** No explicit transition scene showing the crossing.
- **Location String Inconsistencies:** Multiple formats for same locations (see Moderate Issue #7).
- **Dynamic Location Fallbacks:** Inconsistent default values in location functions.

#### Travel Time Issues
- **Long Distance Travel:** Movement from England to Normandy should account for travel time, but scenes jump immediately.
- **Location Updates:** Need to verify `gameState.location` is updated in all geographic transitions.

### 3. Narrative Flow

#### Abrupt Transitions
- **Training to Battle:** Missing transition from training completion to first battle.
- **Year Passages:** "Between years" scenes need better closure before next year.
- **Campfire Returns:** Campfire scenes should return to triggering scene, not always "start".

#### Missing Context
- **Scene Connections:** Some scene transitions lack narrative justification.
- **Resolution Scenes:** Generic placeholder text when resolution data is missing.

### 4. Chronological Ordering

#### Historical Accuracy
- **Battle Dates:** Crécy occurred August 26, 1346 - verify all related scenes match this timeline.
- **Event Sequence:** Ensure major historical events occur in correct order.

#### Scene Ordering
- **Random Encounters:** Can trigger out of chronological order.
- **Main Path:** Main narrative path is generally chronological, but some branches may not be.

### 5. Character Continuity

#### Relationship Tracking
- **Wat, Cook, Oana:** Relationships tracked but not always updated consistently.
- **Character Presence:** Verify characters appear/disappear logically based on story context.

#### Character Consistency
- **Personality:** Characters should behave consistently across scenes (Wat is cynical, Cook is philosophical - this seems consistent).

### 6. Equipment/State Continuity

#### Equipment System
- **Old vs New System:** Both inventory array and old equipment object exist - need full migration.
- **Equipment Persistence:** Verify equipment acquired in one scene persists to later scenes.

#### State Tracking
- **Flags:** Some flags set but never checked, some checked but never set.
- **Stats:** Stat changes should persist - verify they do.

### 7. Structural Issues

#### Scene References
- **Missing Scenes:** All `nextScene` references appear to exist (no broken links found).
- **Circular References:** No infinite loops detected.
- **Orphaned Scenes:** All scenes appear to be reachable via some path.

#### Code Structure
- **Duplicate Definitions:** `chapter` and `chapterProgress` defined twice in gameState.
- **Function Consistency:** Mix of hardcoded values and functions creates maintenance burden.

---

## Recommendations

### Priority 1 (Critical - Fix Immediately)
1. **Standardize Age System:** Convert all hardcoded ages to dynamic functions using `gameState.age`
2. **Fix Missing Scene Transitions:** Add transition scenes or modify text for abrupt jumps (training→battle, England→France)

### Priority 2 (Moderate - Fix Soon)
3. **Standardize Location Names:** Create location name constants and use consistently
4. **Add Missing Transitions:** Add scenes for year passages, geographic movements
5. **Fix Equipment System:** Complete migration to new inventory system, remove old format
6. **Chronological Random Encounters:** Ensure random encounters respect year progression

### Priority 3 (Minor - Polish)
7. **Consolidate Flag System:** Create flag registry with consistent naming
8. **Improve Resolution Scene Handling:** Better error handling for missing resolution data
9. **Audit Relationship Tracking:** Ensure all relationship changes are properly tracked
10. **Remove Duplicate Code:** Clean up duplicate gameState definitions

### Implementation Suggestions

1. **Create Constants File:**
```javascript
const LOCATIONS = {
    ENGLAND: "England",
    NORMANDY: "Normandy",
    CAEN: "Caen, Normandy",
    CALAIS: "Calais, France",
    // etc.
};
```

2. **Age Calculation Helper:**
```javascript
function calculateAgeFromYear(startYear, startAge, currentYear) {
    return startAge + (currentYear - startYear);
}
```

3. **Location Update Helper:**
```javascript
function updateLocation(newLocation) {
    gameState.location = newLocation;
    // Log for debugging
    console.log(`Location updated to: ${newLocation}`);
}
```

4. **Scene Transition Validator:**
```javascript
function validateSceneTransition(fromScene, toScene) {
    // Check year progression
    // Check location changes
    // Check age consistency
    // Return warnings/errors
}
```

---

## Conclusion

The Man-at-Arms game has a solid narrative foundation with generally good chronological progression and character development. The main issues are around consistency (age calculations, location naming) and missing connective tissue between major narrative beats. Most issues are fixable with systematic refactoring rather than major structural changes.

The game's use of dynamic functions for year/age/location is a good approach, but needs to be applied consistently throughout. The narrative style (McCarthy-esque, sparse) is well-maintained, and the historical context is generally accurate.

**Overall Narrative Health:** Good (7/10)
- Strong chronological structure
- Good character development
- Needs consistency improvements
- Needs better scene transitions

With the recommended fixes, the narrative continuity would improve significantly, creating a more immersive and cohesive player experience.

---

## Appendix: Scene Count Summary

- **Total Scenes:** ~237
- **Scenes with Hardcoded Age:** ~60
- **Scenes with Dynamic Age:** ~177
- **Scenes with Hardcoded Year:** ~80
- **Scenes with Dynamic Year:** ~157
- **Training Scenes:** ~15
- **Battle Scenes:** ~30
- **Campfire Vignettes:** ~20+
- **Random Encounters:** ~10
- **Between Years Scenes:** ~8
- **1346 Campaign Scenes:** ~50+

---

*End of Report*
