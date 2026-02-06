# Narrative Continuity Analysis Prompt for Man-at-Arms

## Your Task

You are an advanced narrative analysis AI (Kimi-K-2.5) tasked with analyzing the codebase of **Man-at-Arms**, a browser-based roguelike game set during the Hundred Years' War (1337-1453). Your goal is to identify narrative continuity issues, abrupt scene transitions, chronological inconsistencies, and structural problems that could disrupt the player's immersion and story experience.

---

## Codebase Structure

### Primary File
- **`man-at-arms.html`** - Contains all game scenes, narrative text, and game logic

### Scene Structure
Each scene follows this JavaScript object structure:
```javascript
scene_name: {
    title: "Scene Title",
    year: 1338,  // or function() { return gameState.year; }
    age: 19,     // or function() { return gameState.age; }
    location: "Northern France",  // or function() { return gameState.location; }
    artwork: "artwork/filename.jpg",  // optional
    artworkCaption: "Caption text",   // optional
    text: `<p>Narrative content...</p>`,  // or function() { return ... }
    choices: [
        {
            text: "Choice text",
            nextScene: "next_scene_name",
            effects: { /* game state changes */ }
        }
    ]
}
```

### Key Game State Variables
- `gameState.year` - Current year (1337-1453)
- `gameState.age` - Character age
- `gameState.location` - Current geographic location
- `gameState.relationships` - Character relationship values
- `gameState.equipment` - Character equipment
- `gameState.stats` - Character statistics

---

## Analysis Objectives

### 1. **Temporal Continuity**

**Check for:**
- **Year progression**: Scenes should progress chronologically (or with clear flashback/forward indicators)
  - Identify scenes where `year` jumps backward unexpectedly
  - Flag scenes where year decreases without narrative justification
  - Note if year progression is inconsistent (e.g., 1338 → 1340 → 1339)
  
- **Age progression**: Character age should align with year progression
  - Verify age increases appropriately with time passage
  - Check if age/year relationship is consistent (e.g., if character starts at age 18 in 1337, they should be 19 in 1338)
  - Flag scenes where age doesn't match year progression

- **Time gaps**: Identify unexplained time jumps
  - Large gaps (e.g., 1338 → 1346) should have narrative justification
  - Small gaps should feel natural (e.g., days/weeks between scenes)
  - Note if time passage is mentioned in text but doesn't match year changes

**Output format:**
```
TEMPORAL CONTINUITY ISSUES:
- [Scene Name] (year: X, age: Y) → [Next Scene] (year: Z, age: W)
  Issue: [Description of problem]
  Severity: [Critical/Moderate/Minor]
```

---

### 2. **Geographic Continuity**

**Check for:**
- **Location jumps**: Character should move logically between locations
  - Flag impossible geographic transitions (e.g., "Northern France" → "Calais" → "Northern France" in same day)
  - Note if location changes without travel narrative
  - Check if location matches historical context (e.g., battles should occur at correct historical locations)

- **Travel time**: Movement between distant locations should account for time
  - Long-distance travel (e.g., England to France) should take appropriate time
  - Verify year/age progression matches travel distance

- **Location consistency**: Same location should be referenced consistently
  - Check for spelling variations (e.g., "Caen" vs "Caen, Normandy")
  - Verify location names match historical accuracy

**Output format:**
```
GEOGRAPHIC CONTINUITY ISSUES:
- [Scene Name] (location: X) → [Next Scene] (location: Y)
  Issue: [Description of problem]
  Historical context: [If applicable]
  Severity: [Critical/Moderate/Minor]
```

---

### 3. **Narrative Flow and Transitions**

**Check for:**
- **Abrupt scene changes**: Identify jarring transitions
  - Scenes that end mid-action and next scene starts in different context
  - Sudden shifts in tone (e.g., battle → peaceful camp with no transition)
  - Missing connective tissue between scenes
  
- **Tone consistency**: Verify mood/tone flows naturally
  - Flag sudden shifts from serious to lighthearted (or vice versa) without justification
  - Check if emotional beats are properly built up
  - Note if scenes feel disconnected from previous context

- **Plot thread continuity**: Track narrative threads
  - Identify unresolved plot points that are never addressed
  - Flag scenes that reference events not yet shown
  - Check if character motivations remain consistent
  - Note if relationships/conflicts are established but never resolved

- **Scene transitions**: Evaluate how scenes connect
  - Check if `nextScene` choices lead logically from current scene
  - Verify that choice consequences match narrative expectations
  - Flag "dead ends" or scenes that don't connect to main narrative

**Output format:**
```
NARRATIVE FLOW ISSUES:
- [Scene Name] → [Next Scene]
  Issue: [Description of abrupt change or discontinuity]
  Missing context: [What connective tissue is needed]
  Severity: [Critical/Moderate/Minor]
```

---

### 4. **Chronological Ordering**

**Check for:**
- **Out-of-order scenes**: Identify scenes that occur in wrong sequence
  - Scenes referencing events that haven't happened yet
  - Flashbacks that aren't clearly marked
  - Scenes that should occur earlier/later in narrative

- **Historical event ordering**: Verify historical events occur in correct order
  - Major battles should occur in historical sequence (e.g., Crécy 1346, Poitiers 1356)
  - Character should not experience events out of historical order
  - Check if historical context matches year

- **Character development order**: Verify character growth is logical
  - Skills/experience should increase over time
  - Relationships should develop consistently
  - Equipment should be acquired before use

**Output format:**
```
CHRONOLOGICAL ORDERING ISSUES:
- [Scene Name] (year: X)
  Issue: [Description of ordering problem]
  Should occur: [When it should happen]
  References: [What it incorrectly references]
  Severity: [Critical/Moderate/Minor]
```

---

### 5. **Character and Relationship Continuity**

**Check for:**
- **Character consistency**: Verify characters behave consistently
  - Same character should have consistent personality across scenes
  - Relationships should develop logically
  - Character knowledge should match what they've experienced

- **Relationship tracking**: Verify relationship values make sense
  - Relationships should change based on player choices
  - Check if relationship changes are reflected in subsequent scenes
  - Flag relationships that change without narrative justification

- **Character presence**: Verify characters appear/disappear logically
  - Characters shouldn't appear in scenes where they shouldn't be present
  - Check if characters are introduced before being referenced
  - Verify character deaths/absences are handled consistently

**Output format:**
```
CHARACTER CONTINUITY ISSUES:
- [Character Name] in [Scene Name]
  Issue: [Description of inconsistency]
  Expected behavior: [What should happen]
  Severity: [Critical/Moderate/Minor]
```

---

### 6. **Equipment and State Continuity**

**Check for:**
- **Equipment consistency**: Verify equipment changes are tracked
  - Equipment acquired in one scene should be available in later scenes
  - Equipment lost/damaged should be reflected
  - Check if equipment is used before being acquired

- **Game state consistency**: Verify state changes are preserved
  - Stats changes should persist
  - Choices should have lasting consequences
  - Verify state resets don't occur unexpectedly

**Output format:**
```
EQUIPMENT/STATE CONTINUITY ISSUES:
- [Scene Name]
  Issue: [Description of state inconsistency]
  Expected state: [What should be true]
  Actual state: [What is shown]
  Severity: [Critical/Moderate/Minor]
```

---

### 7. **Structural Issues**

**Check for:**
- **Orphaned scenes**: Scenes that are never reachable
  - Scenes with no incoming connections
  - Scenes that can only be reached through broken paths
  - Dead-end scenes with no continuation

- **Circular references**: Scenes that loop without progress
  - Infinite loops that don't advance narrative
  - Scenes that return to previous state without change

- **Missing scenes**: Referenced but non-existent scenes
  - `nextScene` values that don't exist
  - Choices that lead to undefined scenes

**Output format:**
```
STRUCTURAL ISSUES:
- [Scene Name or Reference]
  Issue: [Description of structural problem]
  Impact: [How this affects gameplay]
  Severity: [Critical/Moderate/Minor]
```

---

## Analysis Methodology

### Step 1: Scene Mapping
1. Extract all scene definitions from `man-at-arms.html`
2. Create a scene graph showing connections via `choices[].nextScene`
3. Map each scene's temporal data (year, age) and location
4. Identify all character references and relationship changes

### Step 2: Temporal Analysis
1. Trace chronological paths through the game
2. Build a timeline of all scenes ordered by year
3. Identify temporal inconsistencies and jumps
4. Verify age progression matches year progression

### Step 3: Geographic Analysis
1. Map location changes across scenes
2. Verify travel distances match time passage
3. Check historical location accuracy

### Step 4: Narrative Flow Analysis
1. Read scene text sequentially along each path
2. Identify abrupt transitions and missing context
3. Track plot threads and character arcs
4. Note unresolved narrative elements

### Step 5: Cross-Reference Check
1. Verify all scene references exist
2. Check character consistency across scenes
3. Verify equipment/state persistence
4. Validate historical event ordering

---

## Output Format

Provide a comprehensive report with the following structure:

```markdown
# Narrative Continuity Analysis Report

## Executive Summary
[2-3 paragraph overview of major issues found, overall narrative health]

## Critical Issues (Must Fix)
[Issues that break narrative or gameplay]

## Moderate Issues (Should Fix)
[Issues that disrupt immersion but don't break functionality]

## Minor Issues (Consider Fixing)
[Small inconsistencies and polish issues]

## Detailed Findings

### 1. Temporal Continuity
[All temporal issues with scene references]

### 2. Geographic Continuity
[All location issues with scene references]

### 3. Narrative Flow
[All abrupt transitions and flow issues]

### 4. Chronological Ordering
[All out-of-order scenes]

### 5. Character Continuity
[All character consistency issues]

### 6. Equipment/State Continuity
[All state tracking issues]

### 7. Structural Issues
[All orphaned/missing/circular reference issues]

## Recommendations
[Prioritized list of fixes with suggested solutions]
```

---

## Special Considerations

### Historical Accuracy
- Verify all historical events occur in correct years
- Check if battle locations match historical records
- Ensure character ages align with historical context

### Narrative Style
- The game uses a McCarthy-esque, sparse, atmospheric style
- Flag scenes that break this tone without justification
- Note if transitions feel too abrupt for the intended style

### Player Agency
- Consider that players make choices, so multiple paths exist
- Analyze each major narrative path separately
- Note if some paths have better continuity than others

### Dynamic Content
- Some scenes use functions for year/age/location
- Verify these functions return appropriate values
- Check if dynamic content creates inconsistencies

---

## Tools and Techniques

1. **Pattern Matching**: Search for scene definitions, nextScene references, year/age values
2. **Graph Analysis**: Build scene connection graph to find orphaned/missing scenes
3. **Timeline Construction**: Create chronological timeline to spot ordering issues
4. **Text Analysis**: Read narrative text to identify abrupt transitions and missing context
5. **Cross-Reference**: Verify all references (scenes, characters, equipment) exist and are consistent

---

## Success Criteria

A successful analysis should:
- Identify all critical continuity breaks
- Provide actionable recommendations for fixes
- Prioritize issues by severity and impact
- Reference specific scenes and line numbers where possible
- Consider both individual scene quality and overall narrative coherence

---

## Files to Analyze

- **Primary**: `man-at-arms.html` (main game file with all scenes)
- **Reference**: `DALLE_PROMPTS_SCENES.md` (scene descriptions for context)
- **Optional**: Any other documentation files that provide narrative context

Begin your analysis by reading `man-at-arms.html` completely, then systematically check each category of continuity issue listed above.
