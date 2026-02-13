# Comprehensive Playwright Automation Prompt for Man-at-Arms RPG

## Primary Objective
Create a comprehensive Playwright automation system for autonomous playtesting and content generation of the Man-at-Arms medieval RPG game.

## Game Context
The Man-at-Arms RPG is a browser-based medieval adventure game featuring:
- **Overworld Exploration**: Hex-based map movement using WASD/arrows/click
- **Random Encounters**: 30% chance per hex in raid zones with narrative events
- **Dialog System**: Ink.js-powered interactive stories with choices
- **Hotspot System**: 7 interactive locations (town-square, castle-gate, blacksmith, etc.)
- **Game States**: Overworld mode, dialog mode, encounter cooldowns
- **Technical Stack**: HTML5, Phaser.js, Ink.js, Vite dev server

## Technical Requirements

### 1. Environment Setup
```bash
# Install Playwright
npm install --save-dev @playwright/test

# Create test structure
mkdir -p tests/{playtesting,content-generation,utils}
touch tests/playwright.config.js
```

### 2. Game Modifications Needed
Add debug hooks to the game for state inspection:
- `window.gameState` - Current game state object
- `window.currentStory` - Active narrative information
- `window.playerPosition` - Player coordinates
- `window.encounterHistory` - Log of encounters
- Test mode with seeded randomness

### 3. Core Automation Capabilities

#### A. Playtesting Engine
```javascript
// Autonomous player agent that can:
- Navigate the overworld map intelligently
- Trigger and complete encounters
- Make dialog choices (random, weighted, or strategic)
- Handle different game states and transitions
- Recover from errors and edge cases
- Log comprehensive gameplay data
```

#### B. Content Analysis System
```javascript
// Content mapping and analysis:
- Track all visited story branches and choices
- Record encounter types and frequency
- Map hotspot interactions and outcomes
- Identify unreachable content or dead ends
- Generate content coverage reports
```

#### C. Balance Testing Framework
```javascript
// Statistical analysis tools:
- Encounter rate validation (target: 30% in raid zones)
- Cooldown system testing (30s encounter, 2s hotspot)
- Difficulty progression measurement
- Resource consumption tracking
- Player journey analysis
```

## Implementation Plan

### Phase 1: Foundation Setup
1. **Playwright Configuration**
   - Set up browser contexts (headed/headless)
   - Configure test data directories
   - Implement screenshot/video capture
   - Set up logging and reporting

2. **Game Interface Layer**
   - Create game state inspection utilities
   - Implement input simulation (movement, choices)
   - Build wait conditions for game states
   - Add error detection and recovery

3. **Base Test Framework**
   - Autonomous player agent class
   - Game state manager
   - Data collection system
   - Report generation utilities

### Phase 2: Autonomous Playtesting
1. **Exploration Algorithms**
   ```javascript
   // Movement strategies:
   - Random walk exploration
   - Systematic grid coverage
   - Hotspot targeting
   - Zone-based exploration (Normandy raids, etc.)
   ```

2. **Encounter Handling**
   ```javascript
   // Encounter automation:
   - Detect encounter triggers
   - Navigate dialog choices
   - Handle external function calls
   - Track encounter completion
   ```

3. **State Management**
   ```javascript
   // Game state tracking:
   - Monitor mode transitions (overworld ↔ dialog)
   - Track cooldown timers
   - Validate game state consistency
   - Handle unexpected states
   ```

### Phase 3: Content Generation & Analysis
1. **Content Mapping**
   ```javascript
   // Story branch discovery:
   - Track all visited narrative paths
   - Record choice outcomes and consequences
   - Map conditional content access
   - Identify unused or unreachable content
   ```

2. **Statistical Analysis**
   ```javascript
   // Balance metrics collection:
   - Encounter frequency by zone
   - Choice distribution and patterns
   - Player journey diversity
   - Time spent in different activities
   ```

3. **Report Generation**
   ```javascript
   // Comprehensive reporting:
   - Content coverage percentages
   - Encounter rate validation
   - Bug and edge case discovery
   - Performance metrics
   - Recommendations for improvements
   ```

## Detailed Test Scenarios

### 1. Complete Playthrough Test
```javascript
// Objective: Play entire game from start to completion
// Duration: 30-60 minutes per run
// Data collected: Full journey, all encounters, choices made
```

### 2. Exploration Coverage Test
```javascript
// Objective: Visit every hex and hotspot
// Duration: Systematic exploration
// Data collected: Map coverage, encounter distribution
```

### 3. Encounter Stress Test
```javascript
// Objective: Trigger 100+ encounters
// Duration: Focused encounter farming
// Data collected: Encounter variety, dialog branch coverage
```

### 4. Choice Exhaustion Test
```javascript
// Objective: Try every dialog choice across all stories
// Duration: Targeted content exploration
// Data collected: Choice matrix, outcome mapping
```

### 5. Edge Case Discovery Test
```javascript
// Objective: Find bugs and unexpected behaviors
// Duration: Randomized stress testing
// Data collected: Error logs, crash reports, unusual states
```

## Data Collection Requirements

### 1. Gameplay Metrics
- Player movement patterns and coordinates
- Encounter triggers, types, and outcomes
- Dialog choices selected and results
- Time spent in different game modes
- Resource usage and changes

### 2. Technical Metrics
- Page load times and responsiveness
- JavaScript errors and console logs
- Memory usage patterns
- Network request performance
- Screenshot captures at key moments

### 3. Content Metrics
- Story branches visited vs total available
- Hotspot interactions and completion
- External function calls and effects
- Conditional content access patterns
- Unreachable or unused content identification

## Success Criteria

### 1. Autonomous Operation
- Run 24+ hours without human intervention
- Handle all game states and transitions
- Recover from errors and continue testing
- Generate meaningful data and insights

### 2. Comprehensive Coverage
- Visit all map regions and hotspots
- Trigger 90%+ of available encounters
- Explore 80%+ of dialog branches
- Identify content gaps and balance issues

### 3. Actionable Insights
- Generate detailed content coverage reports
- Provide statistical balance analysis
- Discover bugs and edge cases
- Recommend specific improvements

## Technical Implementation Details

### 1. File Structure
```
tests/
├── playwright.config.js
├── utils/
│   ├── game-interface.js      # Game state inspection and control
│   ├── player-agent.js        # Autonomous decision making
│   ├── data-collector.js      # Metrics and logging
│   └── report-generator.js    # Analysis and reporting
├── playtesting/
│   ├── complete-playthrough.spec.js
│   ├── exploration-coverage.spec.js
│   ├── encounter-stress.spec.js
│   └── edge-case-discovery.spec.js
├── content-generation/
│   ├── content-mapping.spec.js
│   ├── choice-exhaustion.spec.js
│   └── balance-analysis.spec.js
└── data/
    ├── screenshots/
    ├── videos/
    ├── logs/
    └── reports/
```

### 2. Key Classes and Interfaces
```javascript
class GameInterface {
  async getGameState()
  async getPlayerPosition()
  async getCurrentStory()
  async getEncounterHistory()
  async simulateInput(action, params)
  async waitForState(state, timeout)
}

class PlayerAgent {
  decideMovement(gameState)
  selectChoice(choices, context)
  handleEncounter(encounterData)
  exploreStrategy(currentPosition)
}

class DataCollector {
  recordMovement(position, action)
  logEncounter(encounterType, outcome)
  trackChoice(storyId, choice, result)
  captureScreenshot(label)
  generateReport()
}
```

### 3. Configuration Options
```javascript
const config = {
  // Test parameters
  testDuration: 24 * 60 * 60 * 1000, // 24 hours
  screenshotInterval: 30000, // 30 seconds
  encounterTarget: 1000,
  explorationStrategy: 'systematic',
  
  // Game settings
  baseUrl: 'http://localhost:5173',
  headless: false,
  slowMo: 100,
  
  // Data collection
  enableScreenshots: true,
  enableVideo: true,
  logLevel: 'info',
  reportFormat: 'html'
};
```

## Expected Deliverables

### 1. Automation System
- Complete Playwright test suite
- Autonomous player agent
- Game interface utilities
- Data collection framework

### 2. Analysis Reports
- Content coverage analysis
- Encounter rate validation
- Balance metrics and recommendations
- Bug discovery and edge case reports

### 3. Continuous Integration
- Automated test execution pipeline
- Daily content coverage reports
- Regression detection system
- Performance monitoring dashboard

## Advanced Features (Future Enhancement)

### 1. Machine Learning Integration
- Pattern recognition in player behavior
- Predictive analysis for balance tuning
- Automated content generation suggestions

### 2. Visual Testing
- UI consistency validation
- Screenshot comparison testing
- Visual regression detection

### 3. Multiplayer Simulation
- Multiple autonomous players interacting
- Social dynamics testing
- Competitive scenario simulation

This comprehensive automation system will provide invaluable insights into game balance, content completeness, and technical robustness while significantly reducing manual testing requirements.
