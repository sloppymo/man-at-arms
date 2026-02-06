---
name: Fix Remaining Narrative Continuity Issues
overview: "Address remaining aspects of Issues #1-4 that weren't fully resolved, plus new Issue #5 about missing Crécy-to-Calais transition."
todos:
  - id: fix-campfire-before-transition
    content: Add noCampfire flag to between_years_1343 choice or scene to prevent campfire insertion before location transition
    status: completed
  - id: fix-tomorrow-sail-text
    content: Update between_years_1345 text to remove 'Soon, you'll sail to France' and make timing uncertain
    status: completed
  - id: fix-indenture-campfire-flag
    content: Add noCampfire flag to indenture_table scene to prevent campfire insertion during contract signing
    status: completed
  - id: create-march-to-calais
    content: Create march_to_calais transition scene describing the march from Crécy to Calais and update all Crécy night scenes to use it
    status: completed
---

# Fix Remaining Narrative Continuity Issues

## Overview

Address remaining aspects of the first four issues that still appear in playtesting, plus the new Issue #5 about the missing transition from Crécy to Calais.

## Issues to Fix

### Issue #1 (Remaining) — Campfire Before Location Transition

**Problem**: Campfire scene can still be inserted between `between_years_1343` (Northern France) and `return_to_england_1344`, causing abrupt location jump.

**Root Cause**: While `return_to_england_1344` has `noCampfire: true`, the campfire insertion happens BEFORE that scene, so it can still trigger between `between_years_1343` and the transition.

**Fix**:

- Add `noCampfire: true` to the choice in `between_years_1343` that leads to `return_to_england_1344`
- OR add `noCampfire: true` to `between_years_1343` scene itself to prevent any campfire insertion before location transitions

**Files**: `man-at-arms.html` (lines ~5394-5408)

### Issue #2 (Remaining) — "Tomorrow You Sail" Text

**Problem**: `between_years_1345` still says "Soon, you'll sail to France" which creates the timeline inconsistency.

**Root Cause**: Fixed `spring_campaign` but didn't fix the source text in `between_years_1345`.

**Fix**:

- Change "Soon, you'll sail to France" to "Preparations are underway for a major campaign. The king's plans are taking shape, but timing remains uncertain."

**Files**: `man-at-arms.html` (lines ~5444-5458)

### Issue #3 (Remaining) — Campfire After Indenture Table

**Problem**: `indenture_table` doesn't have `noCampfire: true`, so campfire can be inserted between contract signing and `portsmouth_muster`.

**Root Cause**: Only `portsmouth_muster` has the flag, but campfire insertion happens before that scene.

**Fix**:

- Add `noCampfire: true` to `indenture_table` scene to prevent campfire insertion during the contract signing sequence

**Files**: `man-at-arms.html` (lines ~6271-6303)

### Issue #4 — Already Enhanced

The previous fixes should address this, but verify the transition feels natural.

### Issue #5 (NEW) — Missing Crécy to Calais Transition

**Problem**: Abrupt jump from "Out Past the Lines" (Crécy, sentry encounter) directly to "Calais: The Siege Town" (September 4, 1346). Missing:

- The march from Crécy to Calais (historically ~8 days, late August to early September)
- Resolution of the sentry encounter
- French pursuit/retreat context

**Root Cause**: All Crécy night scenes (`crecy_night_wounded`, `crecy_night_gear`, `crecy_night_ransom`) go directly to `calais_siege` with no transition scene.

**Fix**:

- Create new transition scene `march_to_calais` that:
- Acknowledges the aftermath of Crécy
- Describes the march north to Calais (historically King Edward marched to Calais after Crécy)
- Explains the decision to besiege Calais
- Sets up arrival at Calais
- Insert this scene between Crécy night scenes and `calais_siege`
- Update all three Crécy night scene choices to go to `march_to_calais` instead of `calais_siege`
- Ensure `march_to_calais` transitions to `calais_siege`

**Files**: `man-at-arms.html` (lines ~7779-7913)

## Implementation Steps

1. **Fix Issue #1**: Add `noCampfire: true` to `between_years_1343` choice or scene
2. **Fix Issue #2**: Update `between_years_1345` text to remove "Soon, you'll sail"
3. **Fix Issue #3**: Add `noCampfire: true` to `indenture_table`
4. **Fix Issue #5**: Create `march_to_calais` transition scene and update Crécy night scene transitions

## Historical Context for Issue #5

After Crécy (26 August 1346), King Edward III marched his army north to Calais, arriving around 4 September 1346. The march took approximately 8-9 days. This was a strategic decision to capture Calais, which would give England a permanent foothold in France. The transition should acknowledge this historical movement.