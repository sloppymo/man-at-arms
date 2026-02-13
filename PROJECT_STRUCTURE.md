# Man-at-Arms Project Structure Document

## Overview
**Man-at-Arms** is a medieval RPG set during the 100 Years War, built as a web-based interactive story game with multiple rendering systems. The project uses modern JavaScript with ES6 modules, Phaser.js for game rendering, and Yarn for narrative scripting.

## Project Architecture

### Technology Stack
- **Frontend**: HTML5, CSS3, ES6+ JavaScript
- **Game Engine**: Phaser.js 3.75.1 (overworld scenes)
- **Narrative**: Yarn Bound (yarn-bound) for interactive storytelling
- **Build System**: Vite 4.4.9 with ES module bundling
- **Testing**: Jest with jsdom, Playwright for E2E
- **Version**: 2.0.0 (Vite migration)

### Core Architecture Patterns
- **Event-Driven**: Custom dispatcher pattern for system communication
- **Modular ES6**: Clean module separation with clear imports/exports
- **Dual Rendering**: Traditional DOM UI + Phaser.js game canvas
- **State Management**: Centralized game state with migration support

## Directory Structure

### Root Level (`/`)
```
/home/sloppymo/Documents/man-at-arms/man-at-arms/
├── src/                    # Source code
├── public/                 # Static assets served by web server
├── dist/                   # Built application (generated)
├── stories-yarn/           # Yarn narrative scripts
├── portraits/              # Character portrait images
├── artwork/                # Game artwork and images
├── __tests__/              # Test suites
├── scripts/                # Build and utility scripts
├── assets/                 # Built asset bundles
├── maps/                   # Map-related files
├── css/                    # Legacy CSS files
├── js/                     # Legacy JavaScript files (Phase 1)
├── playwright-tests/       # End-to-end tests
└── [config files]          # package.json, vite.config.js, jest configs
```

## Core Systems

### 1. Game State Management (`src/core/gameState.js`)
- **Purpose**: Centralized state management for player progress, stats, and world state
- **Features**:
  - Player character stats (strength, agility, etc.)
  - Equipment and inventory
  - Location and time tracking
  - Game flags and variables
  - Save/load functionality with migration support
- **Key Functions**: `makeDefaultGameState()`, `hydrateLoadedState()`

### 2. Event System (`src/core/dispatcher.js`)
- **Purpose**: Decoupled communication between game systems
- **Architecture**: Publish/subscribe pattern with typed events
- **Key Events**:
  - `MODE_CHANGE`: Game mode transitions (overworld/dialogue/combat)
  - `DIALOG_STARTED/ENDED`: Dialog system lifecycle
  - `SHOW_IMAGE`: Scene image display
  - `TIME_ADVANCED`: Time progression
  - `SUPPLY_CONSUMED`: Resource management

### 3. Narrative System (`src/narrative/`)
- **Main Component**: `NarrativeService` class
- **Technology**: Yarn Bound for parsing and executing interactive stories
- **Features**:
  - Yarn script compilation and execution
  - External function integration (showImage, advanceTime, etc.)
  - Character-based dialog routing
  - Variable binding to game state

### 4. Dialog UI System (`src/ui/dialog-ui.js`)
- **Purpose**: Rich dialog interface with character portraits and typewriter effects
- **Features**:
  - Character portrait display with emotion states
  - Typewriter text animation
  - Choice selection UI
  - Scene image support
  - Keyboard/controller navigation
- **Integration**: Event-driven with dispatcher system

### 5. Overworld System (`src/phaser/`, `src/scenes/`)
- **Technology**: Phaser.js 3 for 2D game rendering
- **Components**:
  - `createOverworldGame()`: Main Phaser game initialization
  - Hex-based movement system
  - Random encounter triggers (30% chance per hex)
  - Scene transitions between overworld and dialog modes

### 6. Equipment System (`src/systems/equipment-system.js`)
- **Purpose**: Complex equipment management with tiered progression
- **Features**:
  - Equipment slots and layers
  - Kit tier system (Apprentice → Master)
  - Stat calculations and modifiers
  - Equipment migration between versions
  - Visual equipment display (paper doll)

### 7. Encounter System (`src/systems/encounter-service.js`)
- **Purpose**: Random encounter management and narrative triggers
- **Features**:
  - Location-based encounter chances
  - Cooldown systems to prevent spam
  - Integration with narrative service
  - Debug tools for encounter testing

## Data Layer

### Character System (`src/data/characters.js`)
- **Structure**: Character definitions with portraits, personality, relationships
- **Portrait System**:
  - Base path + emotion filename mapping
  - Multiple emotion states (neutral, happy, angry, sad, etc.)
  - Role icons and character metadata
- **Example Structure**:
```javascript
{
  id: 'james_olooney',
  name: 'Sir James "The Reaver" de Looney',
  portrait: {
    basePath: 'portraits/james',
    emotions: {
      neutral: 'neutral.png',
      happy: 'smirk.png',
      angry: 'furious.png'
    }
  }
}
```

### Constants & Configuration (`src/core/constants.js`)
- **Game Constants**: Stat limits, chapter definitions, patron characters
- **Equipment**: Slot definitions, layer types, kit tiers
- **World Data**: Regions, social classes, time periods

## UI Components

### Main UI (`index.html`)
- **Layout**: Header, main content area, sidebar with stats
- **Features**:
  - Story text display area
  - Choice selection interface
  - Status bar (year, age, location)
  - Control buttons (save/load/equipment/stats)

### Specialized UIs
- **Equipment Screen**: Paper doll interface with inventory management
- **Dialog Overlay**: Character portraits, typewriter text, choice buttons
- **Combat Minigames**: Health bars, timing-based mechanics
- **Stats Display**: Character progression and attribute visualization

## File Organization

### Import Hierarchy
```
main.js (entry point)
├── Core Systems (gameState, dispatcher, constants)
├── Services (narrative, encounter, equipment)
├── UI Components (dialog-ui, equipment-ui, stats-display)
├── Data (characters, equipment database)
└── Utilities (utils, error handling)
```

### Legacy vs Modern Code
- **Legacy**: `js/` directory contains Phase 1 implementation
- **Modern**: `src/` directory contains Phase 2+ ES6 module architecture
- **Migration**: Equipment and save systems include backward compatibility

## Development Workflow

### Build Process
1. **Development**: `npm run dev` (Vite dev server)
2. **Production**: `npm run build` (Vite bundler)
3. **Testing**: Jest unit tests + Playwright E2E tests

### Key Scripts
- `compile-stories`: Compile Yarn narrative files
- `unit-tests`: Run Jest test suite
- `smoke-test`: Validate story compilation
- `test`: Run full test pipeline

## Game Modes

### Overworld Mode
- **Rendering**: Phaser.js canvas-based 2D world
- **Mechanics**: Hex-based movement, encounter triggers
- **UI**: Minimal overlay, focus on exploration

### Dialogue Mode
- **Rendering**: DOM-based rich interface
- **Mechanics**: Choice-driven narrative progression
- **UI**: Character portraits, typewriter text, choice buttons

### Combat Mode
- **Rendering**: Overlay minigame interface
- **Mechanics**: Timing-based combat mechanics
- **UI**: Health bars, action buttons, combat log

## Data Flow

### Player Actions → System Response
1. **Input** (keyboard/mouse/choice selection)
2. **Event Dispatch** (dispatcher system)
3. **System Processing** (narrative/encounter/equipment)
4. **State Update** (gameState modification)
5. **UI Refresh** (display updates)
6. **Persistence** (automatic saving)

### Example: Dialog Choice Flow
```
User clicks choice → dispatcher.dispatch('DIALOG_CHOICE') →
narrativeService.processChoice() → gameState update →
dialogUI.updateDisplay() → UI refresh
```

## Technical Challenges & Solutions

### Dual Rendering Systems
- **Challenge**: Coordinating DOM UI with Phaser canvas
- **Solution**: Event-driven mode switching with z-index management

### Legacy Migration
- **Challenge**: Phase 1 → Phase 2 transition with data compatibility
- **Solution**: Migration systems for equipment and save files

### Portrait System
- **Challenge**: Dynamic character portraits with emotion states
- **Solution**: Path-based image loading with error handling

### Narrative Integration
- **Challenge**: Yarn script execution with game state binding
- **Solution**: NarrativeService with external function registration

## Development Status

### Completed Phases
- **Phase 1**: Basic DOM-based RPG with Yarn integration
- **Phase 2**: ES6 module migration with improved architecture
- **Phase 3**: Equipment system with tier progression
- **Phase 4**: Phaser.js overworld implementation

### Current Features
- ✅ Complete narrative system with Yarn scripting
- ✅ Rich dialog UI with character portraits
- ✅ Equipment management with stat calculations
- ✅ Save/load system with migration support
- ✅ Overworld exploration with encounter system
- ✅ Combat minigames and timing mechanics

### Known Issues
- Audio system requires user interaction (browser security)
- Some legacy code paths still present
- Debug controls conditionally enabled

This document provides a comprehensive overview of the Man-at-Arms codebase structure, from high-level architecture down to specific file relationships and system interactions.
