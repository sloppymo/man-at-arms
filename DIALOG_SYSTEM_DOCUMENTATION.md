# Dialog System Implementation Documentation

## Overview

This document describes the comprehensive dialog system implemented for Man-at-Arms, featuring character portraits, branching choices, and consequence tracking.

## System Architecture

### Core Components

1. **DialogSystem** (`src/systems/dialog-system.js`)
   - Manages dialog trees and conversation flow
   - Handles conditional logic and branching
   - Tracks dialog history and consequences

2. **PortraitService** (`src/systems/portrait-service.js`)
   - Manages character portrait loading and display
   - Handles emotion-based portrait variations
   - Provides preloading and caching

3. **DialogUI** (`src/ui/dialog-ui.js`)
   - Renders dialog interface with portrait support
   - Manages choice selection and keyboard shortcuts
   - Provides smooth animations and transitions

4. **Character Definitions** (`src/data/characters.js`)
   - Contains character data and personality traits
   - Defines portrait configurations
   - Manages relationship levels

5. **Enhanced DialogueService** (`src/systems/dialogue-service.js`)
   - Integrates dialog system with existing Ink.js narrative
   - Provides unified interface for all dialog functionality
   - Handles initialization and cleanup

## Features

### 1. Dialog Tree Structure

Dialog trees are composed of nodes with the following structure:

```javascript
{
  id: 'node_id',
  character: 'character_id',
  text: 'Dialog text to display',
  portrait: 'character_id',
  emotion: 'neutral',
  choices: [
    {
      text: 'Choice text',
      nextNode: 'target_node_id',
      conditions: [...],
      consequences: [...]
    }
  ],
  conditions: [...],
  consequences: [...]
}
```

### 2. Character Portraits

- **Dynamic Loading**: Portraits are loaded on demand with automatic fallbacks
- **Emotion Support**: Each character can have multiple emotion states
- **CSS Effects**: Emotion-based visual filters enhance portrait display
- **Responsive Design**: Portraits scale appropriately on different screen sizes

### 3. Player Choice and Consequence System

#### Condition Types
- `stat`: Check player stats (strength, wealth, etc.)
- `relationship`: Check relationship levels with characters
- `flag`: Check game state flags
- `item`: Check inventory for specific items

#### Consequence Types
- `stat_change`: Modify player stats
- `relationship_change`: Modify character relationships
- `flag`: Set game state flags
- `add_item`/`remove_item`: Modify inventory
- `trigger_event`: Dispatch game events

### 4. Dialog UI Features

- **Portrait Display**: Shows character portraits with emotion states
- **Choice Highlighting**: Visual feedback for available choices
- **Keyboard Shortcuts**: Number keys 1-9 for quick choice selection
- **Responsive Design**: Adapts to mobile and desktop screens
- **Smooth Animations**: Fade transitions and hover effects

## Integration with Existing Systems

### Game State Integration

The dialog system integrates seamlessly with existing game state:

```javascript
// Stats are automatically synchronized
gameState.stats.strength
gameState.stats.wealth
gameState.stats.reputation

// Relationships are tracked
gameState.relationships.merchant = 25
gameState.relationships.bandit_leader = -50

// Flags can be set for complex logic
gameState.flags.knows_about_bandits = true
```

### Event System Integration

Uses the existing dispatcher pattern:

```javascript
// Dialog events
'DIALOG_STARTED'
'DIALOG_UPDATED' 
'DIALOG_ENDED'
'DIALOG_CHOICE'

// Portrait events
'PORTRAIT_UPDATED'
'PORTRAIT_HIDDEN'
'SHOW_PORTRAIT'
'HIDE_PORTRAIT'
```

### Ink.js Compatibility

The dialog system works alongside the existing Ink.js narrative system:

- External functions continue to work as before
- Dialog system provides additional functionality
- Both systems can be used simultaneously

## Usage Examples

### Starting a Dialog

```javascript
// Simple dialog start
dialogueService.startDialogEncounter('merchant_encounter', 'merchant');

// With custom character data
dialogueService.startDialogEncounter('bandit_encounter', 'bandit_leader');
```

### Creating Custom Dialogs

```javascript
const customDialog = {
  nodes: {
    entry: {
      isEntry: true,
      character: 'custom_npc',
      text: 'Welcome, traveler!',
      choices: [
        {
          text: 'Who are you?',
          nextNode: 'introduction'
        }
      ]
    },
    introduction: {
      character: 'custom_npc',
      text: 'I am a humble merchant.',
      choices: []
    }
  }
};

dialogSystem.loadDialog('custom_encounter', customDialog);
```

### Adding New Characters

```javascript
// In characters.js
const newCharacter = {
  id: 'new_npc',
  name: 'New NPC',
  portrait: {
    basePath: 'portraits/new_npc',
    emotions: {
      neutral: 'neutral.png',
      happy: 'happy.png'
    },
    defaultEmotion: 'neutral'
  },
  relationships: { default: 0, max: 100, min: -100 }
};
```

## File Structure

```
src/
├── systems/
│   ├── dialog-system.js      # Core dialog tree management
│   ├── portrait-service.js   # Portrait handling
│   └── dialogue-service.js  # Enhanced service (modified)
├── ui/
│   └── dialog-ui.js         # Dialog interface
└── data/
    └── characters.js        # Character definitions

public/
└── portraits/
    ├── merchant/
    │   ├── neutral.png
    │   ├── happy.png
    │   └── ...
    ├── bandit_leader/
    │   ├── neutral.png
    │   ├── cruel_smile.png
    │   └── ...
    └── README.md            # Portrait guidelines
```

## Testing

The implementation includes debug buttons for testing:

1. **TEST MERCHANT DIALOG**: Tests a friendly merchant encounter
2. **TEST BANDIT DIALOG**: Tests a hostile bandit encounter
3. **DIALOG STATUS**: Shows current dialog system status

These buttons are temporarily added to the main game interface for development testing.

## Sample Dialogs Included

### Merchant Encounter
- Trade interactions with wealth checks
- News and rumors
- Multiple purchase options
- Relationship building

### Bandit Encounter
- Combat vs compliance choices
- Intimidation options based on stats
- Wealth-based consequences
- Patron reputation effects

## Performance Considerations

- **Lazy Loading**: Portraits are loaded only when needed
- **Caching**: Loaded portraits are cached for reuse
- **Event-Driven**: Uses efficient event system for updates
- **Memory Management**: Proper cleanup of resources

## Future Enhancements

Potential areas for expansion:

1. **Voice Acting**: Audio support for character voices
2. **Advanced Animations**: Portrait lip-sync and gestures
3. **Relationship Trees**: Complex relationship networks
4. **Dynamic Dialog Generation**: Procedural dialog creation
5. **Save/Load Integration**: Persistent dialog history

## Troubleshooting

### Common Issues

1. **Portraits Not Loading**: Check file paths and formats
2. **Dialog Not Starting**: Verify character registration
3. **Choices Not Appearing**: Check condition logic
4. **Consequences Not Applying**: Verify event dispatching

### Debug Tools

```javascript
// Check dialog system status
dialogueService.getDialogSystemStatus();

// Check character data
getCharacter('merchant');

// Check relationship levels
getRelationshipLevel(25);
```

## Conclusion

The dialog system provides a robust foundation for engaging NPC interactions with the following benefits:

- **Modular Design**: Clean separation of concerns
- **Extensible**: Easy to add new characters and dialogs
- **Performant**: Optimized loading and caching
- **Integrated**: Seamless integration with existing systems
- **User-Friendly**: Intuitive interface with keyboard support

This implementation significantly enhances the narrative capabilities of Man-at-Arms while maintaining compatibility with the existing codebase architecture.
