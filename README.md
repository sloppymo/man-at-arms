# A Man-at-Arms' Life

*A Man-at-Arms' Life* is an interactive narrative game set during the Hundred Years' War (1337-1453), following the journey of an English soldier through the brutal campaigns of Edward III's invasion of France.

## 🎮 Game Features

- **Historical Accuracy**: Based on real events from the Crécy-Calais campaign (1346-1347)
- **Interactive Narrative**: Choose-your-own-adventure style gameplay powered by Ink.js
- **Equipment System**: Manage armor, weapons, and gear with historical tradeoffs
- **Character Development**: Stats, skills, and relationships that evolve over time
- **Multiple Endings**: Different paths through the story based on choices
- **Save/Load System**: Persistent game state with automatic migration

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── core/                 # Core game systems
│   ├── constants.js      # Game constants and data
│   ├── gameState.js      # Game state management
│   ├── utils.js          # Utility functions
│   ├── dispatcher.js     # Event system
│   ├── game-modes.js     # Mode state management
│   ├── equipment-schema.js    # Equipment v2 schema
│   └── equipment-migration.js # Legacy migration
├── systems/              # Game systems
│   └── dialogue-service.js    # Ink.js integration
├── scenes/               # Scene management
│   ├── overworld/        # Map system
│   └── character-creation.js
├── ink/                  # Narrative engine
│   ├── external-functions.js  # Function registry
│   └── narrative-bridge.js    # State synchronization
└── ui/                   # User interface components
```

## 🛠️ Architecture

This project uses a modern JavaScript architecture:

- **ES Modules**: Clean module system with tree-shaking
- **Event-Driven**: Centralized dispatcher for loose coupling
- **Schema Versioning**: Automatic migration between game versions
- **Backward Compatibility**: Legacy API support during transition
- **Build System**: Vite for fast development and optimized production builds

## 📦 Deployment

### GitHub Pages (Automated)

The project includes automated deployment to GitHub Pages:

1. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Set source to "GitHub Actions"

2. **Automatic Deployment**:
   - Push to `main` branch triggers deployment
   - Built files are deployed to `gh-pages` branch
   - Available at `https://[username].github.io/man-at-arms/`

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy dist/ folder to your hosting service
# The build output is in the dist/ directory
```

## 🎯 Development Scripts

```bash
# Testing
npm run test:smoke        # Run smoke tests (in browser console)
npm run test:validation   # Run validation suite (in browser console)
npm run baseline          # Phase 0 baseline validation

# Development
npm run dev               # Start development server
npm run build             # Production build
npm run preview           # Preview production build
```

## 🔧 Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📚 Technical Details

### Game State Schema

The game uses a versioned schema system:

```javascript
{
  schemaVersion: 2,        // Current schema version
  mode: "title",           // Current game mode
  stats: { /* player stats */ },
  equipment: { /* v2 layered format */ },
  // ... other game state
}
```

### Event System

All game systems communicate through a centralized dispatcher:

```javascript
import { dispatcher, EVENT_TYPES } from './core/dispatcher.js';

// Subscribe to events
dispatcher.subscribe(EVENT_TYPES.STAT_CHANGE, handleStatChange);

// Dispatch events
dispatcher.dispatch(EVENT_TYPES.STAT_CHANGE, { stat: 'strength', delta: 1 });
```

### Equipment System

Uses a layered format supporting multiple armor layers:

```javascript
equipment: {
  head: {
    base: { id: 'linen_cap', condition: 100, fit: 'off-the-rack' },
    padding: { id: 'aketon_cap', condition: 95, fit: 'tailored' },
    mail: null,
    plate: null
  },
  // ... other slots
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **Ink.js**: The narrative scripting language by Inkle
- **Phaser**: Game framework (planned for future map system)
- **Historical Research**: Based on primary sources from the Hundred Years' War
- **Community**: Beta testers and feedback contributors

## 🎮 Playing the Game

1. Start a new game through character creation
2. Make choices that affect your stats and relationships
3. Manage equipment and prepare for battles
4. Experience multiple story branches and endings
5. Save your progress anytime

The game features historical accuracy, meaningful choices, and replayability through different character builds and decision paths.
