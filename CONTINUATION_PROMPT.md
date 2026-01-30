# Continuation Prompt for "A Man-at-Arms' Life" Game Development

## Project Overview

You are continuing development of **"A Man-at-Arms' Life"**, a text-based interactive fiction RPG set during the Hundred Years' War (1337-1453). The game is inspired by "A Legionary's Life" and focuses on career simulation, historical authenticity, and player choice with persistent consequences.

**Current Version:** v1.2.1  
**Primary File:** `man-at-arms.html` (single-file HTML/CSS/JavaScript game)  
**Deployment:** GitHub Pages at `https://sloppymo.github.io/man-at-arms/`

## Project Structure

```
man-at-arms/
├── man-at-arms.html              # Main game file (all code in one file)
├── man-at-arms-equipment-system.js   # Equipment management system
├── man-at-arms-equipment-ui.js       # Paper-doll inventory UI
├── man-at-arms-enemy-profiles.js     # Enemy combat profiles
├── man-at-arms-combat-demo.html      # Combat system reference (separate demo)
├── artwork/                           # Image assets
│   ├── uk-map.png                     # UK map for region selection
│   ├── character-creation.jpg
│   ├── battle-scene-1.jpg
│   ├── battle-scene-2.jpg
│   ├── naval-battle-1.jpg
│   ├── naval-battle-2.png
│   ├── naval-battle-3.png
│   └── battle-aftermath.jpg
└── README.md
```

## Core Systems

### 1. Character Creation System (Step-by-Step)

**Location:** `man-at-arms.html`, functions starting around line 5900

**Steps:**
1. **Name & Region** - Name input with default "William Thatcher", interactive UK map with clickable region markers
2. **Age Range** - 5 age ranges (Youth, Young Adult, Prime, Veteran, Old Hand) with stat modifiers
3. **Origin Story** - 5 origins (Rural Peasant, Manor Retainer, Craftsman's Apprentice, Squire, Minor Noble)
4. **Background Questions** - 5 questions that provide 1-point net stat swings
5. **Priority System** - Shadowrun-style A-E priority allocation across 5 categories:
   - Might (Strength + Endurance)
   - Finesse (Agility)
   - Wits (Wits)
   - Presence (Charisma)
   - Fortune (Luck + starting resources + kit quality)
6. **Summary & Confirmation** - Final review before starting the game

**Key Functions:**
- `renderCharacterCreationStep1()` - Name and region selection with UK map
- `renderCharacterCreationStep2()` - Age range selection
- `renderCharacterCreationStep3()` - Origin story selection
- `renderCharacterCreationStep4()` - Background questions
- `renderCharacterCreationStep5()` - Priority allocation
- `renderCharacterCreationStep6()` - Summary screen
- `nextCharacterCreationStep()`, `prevCharacterCreationStep()`, `completeCharacterCreation()`
- `selectCulture(regionName)` - Region selection handler
- `showRegionTooltip(event, regionName)`, `hideRegionTooltip()` - Map tooltips
- `updateRegionMapHighlight()` - Updates marker appearance based on selection

**Region Markers (UK Map):**
- Yorkshire: 60% left, 38% top
- Lancashire: 46% left, 38% top
- Norfolk: 66% left, 52% top
- Essex: 58% left, 54% top
- London: 54% left, 60% top (larger marker with sword icon)
- Kent: 64% left, 68% top
- Somerset: 44% left, 72% top
- Cornwall: 32% left, 82% top

### 2. Game State Management

**Location:** `man-at-arms.html`, around line 6670

**Key Functions:**
- `makeDefaultGameState()` - Creates fresh game state with all defaults
- `saveGame()` - Saves to localStorage with versioning
- `loadGame()` - Loads from localStorage with migration support
- `hydrateLoadedState(loaded)` - Deep merges loaded data with defaults
- `resetGame()` - Resets to default state

**State Structure:**
```javascript
{
  stats: { strength, agility, endurance, charisma, luck, wits, wealth, reputation, morale, stress, experience, patronFavor, initiative },
  faction: "English",
  age: 18,
  year: 1337,
  location: "England",
  region: "England", // Normalized tag for equipment availability
  currentScene: "character_creation",
  characterName: "William Thatcher",
  culture: "", // Selected region
  origin: null,
  ageRange: null,
  priorities: {}, // A-E assignments
  kitTier: "Standard", // Based on Fortune priority
  startingKitGranted: false,
  characterCreationStep: 1,
  backgroundQuestionsAnswered: [],
  enteredScenes: Set(), // Tracks which scenes have run onEnter
  inventory: [], // Array of {id, condition, fit} objects
  equipment: {}, // Layered equipment slots
  conditions: [], // Active conditions (wounds, fatigue, etc.)
  flags: {}, // Story flags
  rank: "Common Soldier",
  relationships: {},
  career: { battles: 0, wounds: 0, promotions: 0 }
}
```

### 3. Equipment System

**Files:** `man-at-arms-equipment-system.js`, `man-at-arms-equipment-ui.js`

**Key Features:**
- Layered armor system (padding, mail, plate, surcoat)
- Body-region coverage (head, torso, arms, legs, gaps)
- Protection matrix by damage type (cut, thrust, blunt, missile)
- Condition and fit affect protection
- Region/year/rank gating for availability
- Degradation system
- Paper-doll UI with drag-and-drop
- Primitives-only persistence (only `{id, condition, fit}` in gameState)

**EquipmentManager Methods:**
- `equipItem(itemId, slot, layer)` - Equip an item
- `unequipItem(slot, layer)` - Remove an item
- `getKitProfile()` - Returns protection matrix, mobility, gap exposure
- `getStatModifiers()` - Returns stat bonuses from equipment
- `getEffectiveProtection(region, damageType)` - Calculates protection with condition/fit
- `isAvailable(itemId)` - Checks region/year/rank availability

### 4. Combat System

**File:** `man-at-arms-combat-demo.html` (reference), integrated into main file

**Features:**
- QTE-based combat with difficulty scaling
- Stance system (Aggressive, Balanced, Guarded)
- Fatigue meter (0-100) affecting QTE zone size
- Telegraphed enemy intents
- Action economy (2 actions per round)
- Attack styles (Measured Strike, Press, Flurry)
- Enemy archetypes (Cautious, Aggressive, Skilled)

**Integration:**
- Combat triggered via `triggerCombat(enemyProfile, winScene, loseScene)`
- Enemy profiles in `man-at-arms-enemy-profiles.js`
- Combat state mapped from main gameState
- Results update gameState (wounds, stress, conditions)

### 5. Scene System

**Location:** `man-at-arms.html`, `scenes` object

**Scene Structure:**
```javascript
sceneName: {
  title: "Scene Title",
  year: 1337,
  age: 18,
  location: "England",
  artwork: "artwork/image.jpg", // Optional
  artworkCaption: "Caption text", // Optional
  text: function() { return "Scene text HTML"; },
  choices: [
    {
      text: "Choice text",
      requiresResolution: true, // Optional: triggers dice roll
      resolutionStat: "strength", // Stat to check
      resolutionDifficulty: 7, // Target number
      effects: { strength: 1 }, // Stat changes
      nextScene: "next_scene" // Or function that returns scene name
    }
  ],
  onEnter: function() { 
    // Runs once per scene entry (guarded by enteredScenes Set)
    // Use for state changes, equipment grants, notifications
  }
}
```

**Key Functions:**
- `updateStory()` - Renders current scene
- `makeChoice(choice)` - Handles choice selection and resolution
- `resolveAction(stat, difficulty)` - Dice roll resolution
- `updateDisplay()` - Refreshes all UI elements

### 6. Resolution System

**Location:** `man-at-arms.html`, around line 4200

**Mechanics:**
- 1d10 + effective stat vs difficulty
- Effective stat = base stat + equipment modifiers + condition modifiers
- Success margin determines outcome quality
- Can trigger interactive minigames (QTE, Trivia, Pattern Memory, Typing)

**Functions:**
- `getEffectiveStat(statName)` - Calculates stat with all modifiers
- `resolveAction(stat, difficulty)` - Performs resolution check
- `showMinigame(type, difficulty, onSuccess, onFailure)` - Interactive resolution

### 7. UI Systems

**Status Bar:**
- Displays: Year, Age, Location, Rank, Wealth, Reputation, Morale, Stress
- Dynamic condition badges with durations
- Updates automatically on state changes

**Artwork Display:**
- Shows scene artwork if `scene.artwork` is defined
- Fade-in animation
- Caption support

**Notifications:**
- Toast-style notifications for important events
- `showNotification(title, message, type)` function

**Equipment UI:**
- Paper-doll interface
- Drag-and-drop equipment
- Inventory panel with filtering
- Kit stats panel showing protection matrix

## Recent Work Completed

1. **Character Creation Overhaul:**
   - Step-by-step creation process (6 steps)
   - UK map integration with positioned markers
   - Shadowrun-style priority system
   - Age range selection with stat modifiers
   - Background questions system
   - Default name set to "William Thatcher"

2. **Map Integration:**
   - Replaced SVG with actual UK map image
   - Positioned clickable markers over regions
   - Tooltip system for region information
   - Marker highlighting on hover/selection

3. **Bug Fixes:**
   - Fixed `showRegionTooltip()` to work with button markers instead of SVG
   - Removed Quick Stats section from character creation
   - Fixed save/load system to preserve character creation state
   - Updated version number tracking

4. **Artwork System:**
   - Added artwork display for scenes
   - Integrated 7 artwork images
   - Fade-in animations

## Known Issues & Areas for Improvement

### Immediate Issues

1. **Region Marker Positioning:**
   - Markers may still need fine-tuning based on actual map image
   - Current positions are approximate and may need pixel-perfect adjustment
   - Consider making positions configurable or adding a visual editor

2. **Combat Integration:**
   - Combat system exists but may need more scene integration
   - Enemy profiles need to be used in actual game scenes
   - Combat resolution needs to properly update game state

3. **Equipment System:**
   - Starter equipment may not be properly granted
   - Equipment UI may need more polish
   - Degradation system may need testing

### Future Enhancements

1. **Content Expansion:**
   - More scenes for the 1337-1346 timeline
   - Additional story arcs beyond Crécy
   - More equipment items
   - More enemy profiles

2. **Gameplay Systems:**
   - More interactive resolution minigames
   - Expanded relationship system
   - Patron favor system implementation
   - Rank progression system

3. **UI/UX Improvements:**
   - Mobile responsiveness improvements
   - Better visual feedback for choices
   - More tooltips and help text
   - Settings menu

4. **Historical Accuracy:**
   - More period-accurate equipment descriptions
   - Historical event integration
   - Regional flavor text expansion

## Development Guidelines

### Code Style

- **Single-file architecture:** Main game logic in `man-at-arms.html`
- **Modular systems:** Equipment, combat, enemies in separate files but integrated
- **Function naming:** camelCase for functions, descriptive names
- **State management:** All state changes through dedicated functions
- **Error handling:** Try/catch blocks around critical operations
- **Console logging:** Debug logs for troubleshooting (can be removed in production)

### State Mutation Rules

1. **Never mutate state in `scene.text()` functions** - These are read-only
2. **Use `onEnter()` for scene-specific state changes** - Guarded by `enteredScenes` Set
3. **Use `makeChoice()` for choice-specific state changes**
4. **Always use `applyStatChange()` for stat modifications** - Ensures clamping
5. **Equipment changes must go through `EquipmentManager`** - Single source of truth

### Testing Checklist

When adding new features:
- [ ] Test save/load functionality
- [ ] Test character creation flow
- [ ] Test equipment system integration
- [ ] Test combat triggers
- [ ] Test scene transitions
- [ ] Test stat modifications
- [ ] Test condition system
- [ ] Test on mobile devices (if applicable)

## Key Functions Reference

### Character Creation
- `renderCharacterCreationStep1()` through `renderCharacterCreationStep6()`
- `nextCharacterCreationStep()`, `prevCharacterCreationStep()`
- `completeCharacterCreation()`
- `selectCulture(regionName)`
- `selectAgeRange(rangeId)`
- `selectOrigin(originId)`
- `answerBackgroundQuestion(questionId, answerId)`
- `setPriority(categoryId, priority)`
- `recalculateFromPriorities()`
- `validatePrioritiesCompleteAndUnique()`
- `grantStartingKit(origin, kitTier)`

### Game State
- `makeDefaultGameState()`
- `saveGame()`
- `loadGame()`
- `hydrateLoadedState(loaded)`
- `resetGame()`

### Scene Management
- `updateStory()`
- `updateDisplay()`
- `makeChoice(choice)`
- `transitionToScene(sceneName)`

### Resolution
- `getEffectiveStat(statName)`
- `resolveAction(stat, difficulty)`
- `showMinigame(type, difficulty, onSuccess, onFailure)`

### Equipment
- `EquipmentManager` class (in separate file)
- `equipmentManager.getStatModifiers()`
- `equipmentManager.getKitProfile()`
- `equipmentManager.getEffectiveProtection(region, damageType)`

### UI
- `updateStatusBar()`
- `updateStats()`
- `showNotification(title, message, type)`
- `showStats()` - Full stats modal

## Next Steps Suggestions

1. **Fine-tune region markers** - Get exact pixel positions from user or add visual editor
2. **Add more scenes** - Expand the narrative content
3. **Integrate combat** - Add combat triggers to more scenes
4. **Test and balance** - Playtest the game and adjust difficulty
5. **Polish UI** - Improve visual design and responsiveness
6. **Add features** - Implement requested gameplay systems

## Important Notes

- **Version numbers:** Always update `#version-display` when making changes
- **Save compatibility:** Be careful with state structure changes - update `hydrateLoadedState()` if needed
- **Equipment persistence:** Only store primitives `{id, condition, fit}` in gameState
- **Scene entry guards:** Always check `enteredScenes` Set before running `onEnter()` logic
- **Stat clamping:** Always use `applyStatChange()` to ensure stats stay within limits
- **Git workflow:** Commit and push changes regularly with descriptive messages

## Contact & Context

This project is being developed for a user who values:
- Historical accuracy and authenticity
- Deep gameplay systems with meaningful choices
- Polish and attention to detail
- Clear communication about changes

When making changes:
1. Explain what you're doing and why
2. Test thoroughly before committing
3. Update version numbers
4. Provide clear commit messages
5. Ask for clarification if requirements are unclear

---

**You are now ready to continue development. Start by understanding the current state, then proceed with the requested improvements or new features.**
