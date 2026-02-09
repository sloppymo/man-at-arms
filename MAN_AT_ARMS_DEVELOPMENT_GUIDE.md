# Man-at-Arms Development Architecture Guide

## Executive Summary

**Current Architecture Overview**
Man-at-Arms is a medieval RPG built with a modern JavaScript stack combining HTML5, Phaser 3, Vite, and Ink.js. The architecture follows an event-driven, modular design with clear separation between game logic, narrative systems, and UI components.

**Key Strengths**
- Clean modular architecture with ES6 modules
- Event-driven system enabling loose coupling
- Sophisticated narrative integration via Ink.js
- Historical equipment system with layered armor mechanics
- Automated deployment pipeline via GitHub Actions
- Comprehensive state management with schema versioning

**Primary Pain Points**
- Complex state synchronization between Ink.js and game state
- Debugging challenges with multiple system interactions
- Performance considerations for large-scale content
- Limited testing infrastructure
- Mixed responsibilities in some core modules

**Recommended Strategic Direction**
Focus on consolidating the event-driven architecture, improving state management patterns, and establishing comprehensive testing. The current foundation is solid but requires refinement for scalability.

## Architecture Analysis

### System Diagram and Component Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    UI Layer (HTML/CSS)                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                Game Mode Controller                     │ │
│  │  - Mode validation and transitions                     │ │
│  │  - UI state management                                 │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 Event Dispatcher                            │
│  - Centralized event routing                               │
│  - Service communication                                   │
│  - State synchronization                                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
           ┌──────────┴──────────┐
           ▼                     ▼
┌─────────────────────┐ ┌─────────────────────┐
│   Dialogue Service  │ │   Equipment System  │
│  - Ink.js integration│ │  - Item management  │
│  - Story management  │ │  - Equipment layers │
│  - External functions│ │  - Inventory        │
└─────────────────────┘ └─────────────────────┘
           ▲                     ▲
           │                     │
           └──────────┬──────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                Game State (Singleton)                       │
│  - Character stats, equipment, progression                 │
│  - Scene history, relationships, flags                     │
│  - Overworld position, supplies, time                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                Phaser Overworld Engine                      │
│  - Scene management (OverworldScene)                       │
│  - Player movement and collision                           │
│  - Hotspot detection and event triggers                    │
│  - HUD overlay system                                      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Documentation

**Primary Data Flow Pattern:**
1. **User Input** → UI Layer → Event Dispatcher
2. **Dispatcher** → Service Layer (Dialogue/Equipment/Overworld)
3. **Services** → Game State mutations (via direct access or events)
4. **State Changes** → UI updates via direct DOM manipulation or event callbacks
5. **Phaser Integration** → Direct game state access for rendering

**Event Flow:**
- Hotspot entry triggers `TRIGGER_ENCOUNTER` → Dialogue Service
- Dialogue choices trigger `STORY_CHOICE` → State updates
- Mode changes via `MODE_CHANGE` → UI transitions

### Event System Architecture

**Dispatcher Pattern:** Centralized event router with typed event constants:
```javascript
// Example: Hotspot triggers encounter
dispatch({
  type: 'TRIGGER_ENCOUNTER',
  story: 'overworld/forest_test'
});
```

**Event Types:**
- `TRIGGER_ENCOUNTER`: Load story
- `STORY_CHOICE`: Process player choice
- `ENTER_HEX`: Update overworld position
- `MODE_CHANGE`: Transition game modes

**Service Communication:** Services register event listeners with dispatcher for clean decoupling.

### State Management Patterns

**Singleton Game State:** Global `gameState` object with backward compatibility:
```javascript
// Modern access
import { gameState } from './core/gameState.js';

// Legacy access (being phased out)
window.gameState
```

**State Mutation Patterns:**
- Direct property updates for simple changes
- Structured object updates for complex state
- Migration system for schema evolution

## Code Quality Assessment

### Current Patterns and Practices

**Strengths:**
- ES6 module imports/exports
- JSDoc documentation in core files
- Typed event constants
- Service-oriented architecture for complex systems

**Weaknesses:**
- Mixed coding styles (HTML inline vs modules)
- Extensive console.log debugging left in production
- Global variable pollution (window.* fallbacks)
- Inconsistent error handling (some try/catch, some not)
- Direct DOM manipulation mixed with framework patterns

### Areas for Improvement

**Immediate Refactoring Priorities:**
1. Remove all console.log statements from production code
2. Consolidate HTML inline JavaScript into modules
3. Standardize error handling with try/catch and proper error reporting
4. Eliminate window.* globals in favor of ES6 imports

**Technical Debt Areas:**
- `index-with-map.html`: 475 lines with embedded Phaser scene - migrate to modules
- Global state access patterns need service layer abstraction
- Mixed async patterns (Promises vs callbacks)

### Refactoring Priorities

**Phase 1 (Next 2 weeks):**
- Extract inline JavaScript from HTML files to ES6 modules
- Remove debugging console.log statements
- Standardize error handling patterns

**Phase 2 (Next month):**
- Implement proper service layer for state management
- Consolidate event system usage across all components
- Add input validation and error boundaries

**Phase 3 (Next quarter):**
- Migrate to React/Vue for UI layer
- Implement proper state immutability
- Add comprehensive testing framework

### Best Practices Recommendations

**Code Organization:**
- One responsibility per module
- Clear separation: UI ↔ Logic ↔ Data
- Consistent naming conventions (camelCase for variables, PascalCase for classes)

**Error Handling:**
```javascript
try {
  // Operation
} catch (error) {
  console.error('Operation failed:', error);
  // Graceful fallback or user notification
}
```

**Event Communication:**
- Use dispatcher for cross-service communication
- Avoid direct service coupling
- Document event contracts

## Technology Evaluation

### Current Stack Effectiveness

**Phaser 3 (Rendering Engine):**
- ✅ Responsive scaling with Scale.RESIZE
- ✅ Physics integration for movement
- ✅ Scene management for mode transitions
- ❌ Canvas positioning issues with CSS integration
- ❌ Complex configuration for simple 2D movement

**Ink.js (Narrative Engine):**
- ✅ External function binding for game integration
- ✅ JSON compilation for web deployment
- ✅ Branching dialogue support
- ❌ Limited debugging tools
- ❌ Complex compilation workflow

**Vite (Build System):**
- ✅ Fast development server
- ✅ ES6 module support
- ✅ GitHub Pages deployment
- ❌ Asset optimization needs improvement
- ❌ No production build optimization

**ES6 Modules:**
- ✅ Clean import/export patterns
- ✅ Tree shaking potential
- ✅ Modern JavaScript features
- ❌ Backward compatibility requirements slow migration

### Alternative Technologies to Consider

**Short Term (3-6 months):**
- **React/Vue:** Replace HTML inline JavaScript for better component management
- **Webpack/Rollup:** Enhanced asset bundling over Vite
- **TypeScript:** Add type safety to prevent runtime errors

**Long Term (6-12 months):**
- **Three.js:** 3D rendering for enhanced visuals
- **Yarn:** Better dependency management
- **Electron:** Desktop application support

### Migration Strategies

**Phaser Enhancement:**
- Simplify configuration by creating presets
- Abstract canvas positioning into utility functions
- Add proper cleanup on scene destruction

**Build System Upgrade:**
```javascript
// vite.config.js improvements
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
          ink: ['inkjs']
        }
      }
    }
  }
}
```

**Module Consolidation:**
- Create barrel exports for clean imports
- Implement lazy loading for large modules
- Add module federation for micro-frontend architecture

### Performance Optimization Opportunities

**Rendering:**
- Implement object pooling for Phaser sprites
- Add culling for off-screen objects
- Optimize texture atlas usage

**Memory Management:**
- Proper cleanup of Phaser scenes
- Event listener removal on component destruction
- Avoid memory leaks in long-running sessions

**Asset Loading:**
- Implement progressive asset loading
- Add loading screens for better UX
- Cache compiled Ink stories

## Development Guidelines

### Coding Standards and Conventions

**File Organization:**
```
src/
├── core/          # Game state, utilities, constants
├── systems/       # Game systems (dialogue, equipment)
├── phaser/        # Rendering and game scenes
├── ui/            # UI components and layouts
├── scenes/        # Game scenes and encounters
└── data/          # Static data and configurations
```

**Naming Conventions:**
- Files: kebab-case (e.g., `game-state.js`)
- Classes: PascalCase (e.g., `DialogueService`)
- Functions/Variables: camelCase (e.g., `getGameState`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `EVENT_TYPES`)

**Import Order:**
```javascript
// 1. External libraries
import Phaser from 'phaser';
// 2. Internal modules (alphabetical)
import { gameState } from '../core/gameState.js';
import { DialogueService } from '../systems/dialogue-service.js';
```

### Architectural Decision Framework

**When to use Dispatcher:**
- Cross-service communication
- UI state synchronization
- Complex state mutations requiring coordination

**When to use Direct State Access:**
- Simple state updates within same service
- Performance-critical operations
- Local component state

**Service Creation Guidelines:**
1. Accept dispatcher in constructor
2. Register event listeners
3. Provide clean public API
4. Handle errors gracefully

### Component Design Patterns

**Service Pattern:**
```javascript
export class ExampleService {
  constructor(dispatcher, gameState) {
    this.dispatcher = dispatcher;
    this.gameState = gameState;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.dispatcher.on('EXAMPLE_EVENT', this.handleEvent.bind(this));
  }

  handleEvent(data) {
    // Process event
  }
}
```

**Scene Pattern (Phaser):**
- Extend Phaser.Scene
- Implement preload(), create(), update()
- Use event dispatcher for game state communication
- Clean up resources in destroy()

**State Management:**
- Prefer immutable updates for complex state
- Use migration system for schema changes
- Validate state integrity on load

### Testing and Quality Assurance

**Testing Strategy:**
- Unit tests for services and utilities
- Integration tests for system interactions
- E2E tests for critical user flows

**Quality Gates:**
- ESLint configuration for code standards
- Pre-commit hooks for formatting
- Build verification before deployment

**Debugging Tools:**
- Centralized logging service
- Development mode flags
- Performance monitoring

## Future Development Roadmap

### Immediate Improvements (Next 2 weeks)

**Priority 1: Code Cleanup**
- Remove all console.log statements
- Extract HTML inline JavaScript to modules
- Add error boundaries to critical functions

**Priority 2: Architecture Consolidation**
- Standardize event usage across services
- Implement proper error handling
- Add input validation

**Priority 3: Documentation**
- Update README with architecture overview
- Add code comments for complex logic
- Create developer onboarding guide

### Medium-term Enhancements (Next 2 months)

**System Integration:**
- Complete dispatcher adoption across all services
- Implement proper state immutability
- Add comprehensive error recovery

**Performance Optimization:**
- Implement asset lazy loading
- Add Phaser object pooling
- Optimize bundle size

**Developer Experience:**
- Add TypeScript support
- Implement hot reload for better development
- Add automated testing framework

### Long-term Architectural Evolution

**Technology Migration:**
- Migrate to React for UI components
- Implement GraphQL for data management
- Add server-side rendering support

**Scalability Improvements:**
- Microservice architecture for large features
- Database integration for persistent storage
- Multiplayer support foundation

**Advanced Features:**
- Procedural content generation
- AI companion system
- Modding API

### Risk Mitigation Strategies

**Technical Debt:**
- Regular refactoring sprints
- Code review requirements
- Technical debt tracking system

**Performance Risks:**
- Regular performance audits
- Memory leak detection
- Scalability testing

**Development Velocity:**
- Automated testing pipeline
- CI/CD implementation
- Developer tooling improvements

## Specific Recommendations

### Core Architecture (Immediate Action)

**1. Dispatcher Consolidation**
```javascript
// Standardize all service communication through dispatcher
const dispatcher = new Dispatcher();
const dialogueService = new DialogueService(dispatcher, gameState);
const equipmentSystem = new EquipmentSystem(dispatcher, gameState);
```

**2. State Management Service**
```javascript
// Create StateService to abstract game state mutations
class StateService {
  static updateCharacterStat(stat, value) {
    gameState.stats[stat] = Math.max(0, value);
    dispatcher.dispatch('STATE_UPDATED', { stat, value });
  }
}
```

**3. Error Handling Framework**
```javascript
// Centralized error handling
class ErrorHandler {
  static handle(error, context) {
    console.error(`Error in ${context}:`, error);
    // Log to service, show user notification, etc.
  }
}
```

### Game Systems Enhancements

**Dialogue System:**
- Implement story caching for performance
- Add dialogue state persistence
- Support for dynamic story injection

**Equipment System:**
- Complete layered equipment implementation
- Add equipment validation
- Implement durability mechanics

**Overworld System:**
- Improve hotspot detection accuracy
- Add smooth camera following
- Implement hex-based exploration rewards

### Development Workflow Improvements

**Build Process:**
```javascript
// Enhanced vite.config.js
export default {
  build: {
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['phaser'],
          ui: ['dialogue', 'equipment']
        }
      }
    }
  }
}
```

**Development Tools:**
- Add ESLint and Prettier configuration
- Implement pre-commit hooks
- Add development mode debugging panels

**Testing Infrastructure:**
- Unit tests for core utilities
- Integration tests for service interactions
- E2E tests for critical game flows

### Deployment and Production

**GitHub Pages Optimization:**
- Implement service worker for caching
- Add proper asset optimization
- Configure proper MIME types

**Monitoring and Analytics:**
- Add error tracking service
- Implement user analytics
- Monitor performance metrics

### Success Metrics and Validation

**Code Quality Metrics:**
- 0 console.log statements in production
- 100% ES6 module usage
- Consistent error handling coverage

**Performance Metrics:**
- < 3MB initial bundle size
- < 100ms scene transition times
- 60 FPS consistent rendering

**Development Velocity:**
- < 30 minutes build time
- > 95% test coverage
- Automated deployment success rate

This guide serves as the definitive reference for all future Man-at-Arms development, ensuring architectural consistency, code quality, and scalable growth as the medieval RPG evolves from its current working prototype to a full-featured game.
