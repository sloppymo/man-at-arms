# Fix Narrative Issues - Playtest 2 Findings

## Overview
Address five major narrative issues identified in playtesting: choppy prose, missing scene transitions, campfire scene recycling, historical event placement, and critical timeline error.

## Issues to Fix

### Issue #1: Severely Choppy Prose
**Problem**: Multiple scenes use repetitive staccato sentence fragments that break immersion:
- "You buy it. Better food. At ruinous prices. Three times what it should cost. Four times. Five."
- "You grab it. A souvenir. Keys. Cloth. Coin. Something. Anything."
- "You've done right. Done well. That's something. That's enough." (repeated many times)

**Root Cause**: Overuse of McCarthy-style short sentences creates choppy, repetitive reading experience.

**Fix**: 
- Smooth out the most egregious examples into flowing narrative while maintaining the sparse style
- Replace repetitive fragments with varied sentence structures
- Keep the style but reduce the choppiness

**Files**: 
- `man-at-arms.html` (lines ~8179, ~8354, and multiple instances of "You've done right. Done well.")

### Issue #2: Sudden Scene Transitions Without Narrative Bridges
**Problem**: Multiple abrupt jumps between scenes:
- Campfire "Share Words" → Night Duty (no explanation of how/why we started night watch)
- "Words as Weapons" (insult battle) → jumped immediately to "Winter 1346–47" (no resolution)
- Campfire conversation about childhood → suddenly "The Keys of Calais" (massive historical event with zero build-up)
- Calais surrender → "Narrow Lane" combat (who are we fighting? why? when did we leave Calais?)

**Root Cause**: Missing transition paragraphs that establish time/place/motivation between scenes.

**Fix**:
- Add transition text to `calais_night` scene explaining how we got from campfire to night duty
- Add resolution text to "Words as Weapons" scene or create transition to Winter scene
- Add build-up scene before "The Keys of Calais" that acknowledges the siege is ending
- Add transition scene between Calais surrender and Narrow Lane combat explaining context

**Files**: 
- `man-at-arms.html` (lines ~8033, ~9355, ~8241, ~9597)

### Issue #3: Scene Header Recycling
**Problem**: The "Campfire" heading appears multiple times with completely different content:
- First: Gear maintenance/rest scene
- Second: The Cook asking intimate questions about childhood

**Root Cause**: Campfire system reuses the same title for different vignette types.

**Fix**:
- Differentiate campfire scene titles based on content type
- Use more specific titles like "Campfire: Gear Maintenance" vs "Campfire: Conversation with the Cook"
- Or use unique titles for each vignette type

**Files**: 
- `man-at-arms.html` (campfire interlude system, lines ~1076-1538)

### Issue #4: Historical Event Placement
**Problem**: The surrender of Calais (August 1347) appears after a quiet nighttime conversation. A major siege conclusion should have build-up.

**Root Cause**: "The Keys of Calais" scene appears without proper narrative lead-in.

**Fix**:
- Add a scene before "The Keys of Calais" that acknowledges the siege is reaching its conclusion
- Add context about the months of siege, the starvation, the approaching end
- Create proper build-up to the historical moment

**Files**: 
- `man-at-arms.html` (lines ~8241)

### Issue #5: Critical Timeline Error - "After Crécy" Label
**Problem**: After winning the "Narrow Lane" skirmish (1347), the scene is labeled "After Crécy" — but Crécy happened a year earlier (August 1346). The game conflates two different battles.

**Root Cause**: All three Calais surrender outcome scenes (`keys_disciplined`, `keys_water`, `keys_souvenir`) incorrectly lead to `after_crecy` scene, which references Crécy (1346) when the player is in 1347 after Calais surrender.

**Fix**:
- Rename `after_crecy` scene to something appropriate for post-Calais (1347) context, OR
- Create a new scene `after_calais` for post-surrender content
- Update all three `keys_*` scenes to point to the correct post-Calais scene
- Ensure the scene text reflects the correct historical context (post-Calais, not post-Crécy)

**Files**: 
- `man-at-arms.html` (lines ~8304, ~8340, ~8374, ~8378)

## Implementation Steps

1. **Fix Issue #5 (Critical)**: Rename/update `after_crecy` scene and fix all references to point to correct post-Calais scene
2. **Fix Issue #1**: Smooth out choppy prose in key scenes
3. **Fix Issue #2**: Add transition paragraphs to bridge abrupt scene changes
4. **Fix Issue #4**: Add build-up scene before "The Keys of Calais"
5. **Fix Issue #3**: Differentiate campfire scene titles

## Historical Context
- Crécy: August 26, 1346
- Calais surrender: August 3-4, 1347 (nearly a year later)
- The "After Crécy" scene incorrectly appears after Calais events in 1347
