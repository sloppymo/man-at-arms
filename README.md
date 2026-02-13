# Man-at-Arms: A Medieval RPG

*A Man-at-Arms' Life* is an interactive historical RPG set during the Hundred Years' War (1337-1453). Experience the brutal reality of medieval warfare as an English soldier in Edward III's invasion of France, making choices that shape your fate, equipment, and legacy.

## 🎮 Game Overview

Follow the journey of a common soldier through the Crécy-Calais campaign (1346-1347). Your decisions affect character development, equipment choices, relationships, and ultimately determine multiple possible endings. The game combines turn-based strategy, equipment management, and branching narrative in a historically accurate setting.

### Key Features

- **Historical Authenticity**: Based on primary sources from the Hundred Years' War
- **Interactive Narrative**: Branching storylines powered by Yarn scripting
- **Equipment System**: Layered armor system with historical tradeoffs and progression
- **Character Development**: Stats, skills, and relationships that evolve based on choices
- **Overworld Exploration**: Hex-based movement system with random encounters
- **Combat System**: Timing-based combat minigames
- **Multiple Endings**: Different paths through history based on your decisions
- **Save/Load System**: Persistent game state with automatic migration support
- **Responsive Design**: Optimized for both desktop and mobile browsers

## 🚀 Technology Stack

### Core Technologies
- **Frontend**: HTML5, CSS3, ES6+ JavaScript with ES Modules
- **Game Engine**: Phaser.js 3.75.1 (2D overworld scenes)
- **Narrative Engine**: Custom Yarn parser with Yarn Spinner syntax
- **Build System**: Vite 4.4.9 with fast HMR and optimized bundling
- **Testing**: Jest with jsdom, Playwright for E2E testing

### Architecture Patterns
- **Event-Driven**: Centralized dispatcher system for loose coupling
- **Modular Design**: Clean ES6 module separation
- **Dual Rendering**: Traditional DOM UI + Phaser.js game canvas
- **State Management**: Versioned schema with automatic migration
- **Backward Compatibility**: Legacy API support during transitions

## 📦 Installation & Setup

### Prerequisites
- Node.js 16.0.0 or higher
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/man-at-arms.git
cd man-at-arms

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## 🎯 Game Mechanics

### Character System
- **Stats**: Strength, Agility, Charisma, Endurance, Intelligence
- **Equipment**: Layered armor system (base → padding → mail → plate)
- **Kit Tiers**: Apprentice → Journeyman → Master progression
- **Relationships**: Dynamic NPC relationships based on choices

### Overworld Exploration
- **Hex-Based Movement**: Strategic positioning on the medieval French landscape
- **Zone System**: Different regions with varying encounter rates
- **Time Progression**: Actions advance game time, affecting events and NPC schedules
- **Random Encounters**: Context-sensitive events triggered by movement

### Narrative System
- **Yarn Scripting**: Powerful branching dialogue system
- **External Functions**: Game state integration (show images, advance time, modify stats)
- **Character Portraits**: Dynamic expressions and emotions
- **Choice Consequences**: Meaningful decisions that affect story and character

### Combat System
- **Timing-Based Mechanics**: Precision combat minigames
- **Equipment Impact**: Armor and weapons affect combat outcomes
- **Health Management**: Wounds and fatigue systems
- **Multiple Combat Types**: Skirmishes, battles, duels

## 📁 Project Structure

```
man-at-arms/
├── src/
│   ├── core/                    # Core game systems
│   │   ├── constants.js         # Game constants and configuration
│   │   ├── gameState.js         # Centralized state management
│   │   ├── dispatcher.js        # Event system
│   │   ├── game-modes.js        # Mode state management
│   │   ├── utils.js             # Utility functions
│   │   ├── equipment-schema.js  # Equipment system schema
│   │   ├── equipment-migration.js # Legacy data migration
│   │   └── error-handler.js     # Error handling and debugging
│   ├── systems/                 # Game systems
│   │   ├── narrative-service.js # Yarn narrative system
│   │   ├── encounter-service.js # Random encounter management
│   │   ├── equipment-system.js  # Equipment management
│   │   └── save-load.js         # Persistence system
│   ├── phaser/                  # Phaser.js game engine
│   │   ├── OverworldScene.js    # Main overworld scene
│   │   ├── OverworldHUD.js      # UI overlay
│   │   └── createOverworldGame.js # Phaser initialization
│   ├── scenes/                  # Scene management
│   │   └── overworld/           # Overworld-related scenes
│   ├── ui/                      # User interface components
│   │   ├── dialog-ui.js         # Dialog interface
│   │   ├── equipment-ui.js      # Equipment management UI
│   │   ├── stats-display.js     # Character stats UI
│   │   └── effects-preview.js   # Visual effects system
│   ├── narrative/               # Narrative engine
│   │   ├── simple-yarn-parser.js # Custom Yarn parser
│   │   └── narrative-service.js # Narrative coordination
│   └── data/                    # Game data
│       └── characters.js        # Character definitions
├── stories-yarn/                # Yarn narrative scripts
│   ├── overworld/               # Location-based stories
│   └── chevauchee/              # Campaign stories
├── public/                      # Static assets
│   ├── artwork/                 # Game images
│   ├── portraits/               # Character portraits
│   └── js/ink/ink-stories/      # Compiled narratives
├── __tests__/                   # Test suites
├── scripts/                     # Build utilities
└── dist/                       # Production build output
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server with HMR
npm run build            # Production build with optimization
npm run preview          # Preview production build

# Testing
npm run test             # Run Jest unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm test:basic           # Run basic functionality tests
npm test:smoke           # Run smoke tests for story validation

# Legacy/compatibility
npm run unit-tests       # Legacy unit test runner
```

### Development Workflow

1. **Local Development**: Use `npm run dev` for hot module replacement
2. **Story Development**: Edit `.yarn` files in `stories-yarn/` directory
3. **Asset Management**: Place images in `public/artwork/` and `public/portraits/`
4. **Testing**: Run `npm run test` to validate changes
5. **Build Verification**: Use `npm run build && npm run preview` to test production

### Code Style & Standards

- **ES6 Modules**: Strict use of import/export syntax
- **Async/Await**: Preferred over Promise chains
- **Event-Driven**: Use dispatcher for inter-system communication
- **Error Handling**: Comprehensive try/catch with user-friendly messages
- **Documentation**: JSDoc comments for public APIs

## 🎮 Game Systems Deep Dive

### Event System Architecture

The game uses a centralized event dispatcher for decoupled communication:

```javascript
import { dispatcher, EVENT_TYPES } from './core/dispatcher.js';

// Subscribe to events
dispatcher.subscribe(EVENT_TYPES.MODE_CHANGE, (event) => {
  console.log('Mode changed to:', event.payload);
});

// Dispatch events
dispatcher.dispatch(EVENT_TYPES.STAT_CHANGE, {
  stat: 'strength',
  delta: 1
});
```

### Equipment System

Advanced layered equipment with historical accuracy:

```javascript
// Equipment structure
equipment: {
  head: {
    base: { id: 'linen_cap', condition: 100 },
    padding: { id: 'aketon_cap', condition: 95 },
    mail: null,
    plate: null
  },
  body: {
    // Similar layered structure
  }
}
```

### Narrative Integration

Yarn scripts integrate with game state through external functions:

```yarn
<<showImage artwork/battlefield.jpg>>
<<advanceTime 60>>
<<changeStat health, -1>>
<<addItem sword, 1>>
```

### Save System

Versioned save format with automatic migration:

```javascript
gameState: {
  schemaVersion: 2,
  character: { /* player data */ },
  equipment: { /* layered equipment */ },
  overworld: { /* world state */ },
  flags: { /* game flags */ }
}
```

## 🚀 Deployment

### GitHub Pages (Automated)

1. **Enable GitHub Pages** in repository settings:
   - Go to Settings → Pages
   - Set source to "GitHub Actions"

2. **Automatic Deployment**:
   - Push to `main` branch triggers deployment
   - Built files deployed to `gh-pages` branch
   - Available at `https://[username].github.io/man-at-arms/`

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy dist/ folder to your hosting service
```

## 🤝 Contributing

### Development Setup

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/yourusername/man-at-arms.git`
3. **Create** feature branch: `git checkout -b feature/your-feature-name`
4. **Install** dependencies: `npm install`
5. **Start** development: `npm run dev`

### Contribution Guidelines

- **Code Style**: Follow existing ES6 module patterns
- **Testing**: Add tests for new features
- **Documentation**: Update README and code comments
- **Commits**: Use clear, descriptive commit messages
- **Pull Requests**: Provide detailed description of changes

### Story Development

- Edit `.yarn` files in `stories-yarn/` directory
- Use Yarn Spinner syntax with custom commands
- Test stories with `npm run test:smoke`
- Ensure choices end appropriately (no hanging narratives)

### Asset Guidelines

- **Images**: Place in `public/artwork/` or `public/portraits/`
- **Formats**: PNG/JPG preferred, optimize for web
- **Naming**: Descriptive filenames (e.g., `battlefield.jpg`, `merchant_neutral.png`)

## 🐛 Troubleshooting

### Common Issues

**Game won't start:**
- Check browser console for errors
- Ensure Node.js 16+ is installed
- Verify all dependencies are installed

**Stories not loading:**
- Run `npm run test:smoke` to validate Yarn files
- Check console for parsing errors
- Ensure `.yarn` files are in correct directory

**Phaser scenes not working:**
- Check browser compatibility (Chrome 90+ recommended)
- Verify Phaser.js is loading correctly
- Check console for WebGL/canvas errors

**Equipment not saving:**
- Check browser localStorage support
- Verify migration system is working
- Clear browser cache if issues persist

## 📊 Performance & Optimization

### Bundle Analysis
- **Vite**: Tree-shaking and code splitting
- **Assets**: Optimized images and lazy loading
- **Caching**: Efficient browser caching strategies

### Browser Compatibility
- **Chrome**: 90+ (recommended)
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Mobile Optimization
- **Touch Controls**: Click-to-move works on touch devices
- **Responsive Design**: Adapts to different screen sizes
- **Performance**: Optimized for mobile GPUs

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **Yarn Spinner**: Narrative scripting framework
- **Phaser.js**: 2D game engine
- **Historical Research**: Primary sources from the Hundred Years' War
- **Community**: Beta testers, historians, and contributors

## � Game Experience

1. **Start**: Begin with character creation and initial briefing
2. **Explore**: Navigate the French countryside using hex-based movement
3. **Encounter**: Experience random events and make meaningful choices
4. **Manage**: Handle equipment, supplies, and character development
5. **Combat**: Engage in timing-based combat encounters
6. **Progress**: Advance through the campaign with branching narratives
7. **Legacy**: Achieve different endings based on your decisions

The game emphasizes historical accuracy, strategic decision-making, and the brutal realities of medieval warfare. Each playthrough offers unique experiences through different character builds and choice combinations.

---

*Built with modern web technologies for an authentic historical gaming experience.*
