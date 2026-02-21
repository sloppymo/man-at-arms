# Comprehensive Test Suite for Yarn-Bound Narrative Engine

This test suite provides comprehensive coverage for the Man-at-Arms Yarn-Bound narrative engine replacement, ensuring all technical contracts, edge cases, UI integration points, and story validation are thoroughly tested.

## 📁 Test Structure

```
__tests__/
├── unit/
│   └── narrative-service.test.js     # Core NarrativeService functionality
├── integration/
│   └── narrative-flow.test.js        # End-to-end story flow testing
├── edge-cases/
│   └── robustness.test.js           # Error handling and edge cases
├── validation/
│   └── story-smoke.test.js          # All .yarn file validation
├── ui/
│   └── dialog-ui.test.js             # DialogUI behavior and interaction
├── mocks/
│   ├── dispatcher.js                 # Mock event dispatcher
│   ├── game-state.js                # Mock game state
│   └── yarn-stories/               # Test story files
├── setup.js                        # Jest global setup
└── README.md                       # This file
```

## 🧪 Test Categories

### 1. Unit Tests (`unit/narrative-service.test.js`)

**Coverage:**
- ✅ Story loading with Vite glob fallback paths
- ✅ Text advancement through story nodes
- ✅ Choice selection with availability filtering
- ✅ Pause command handling and DIALOG_PAUSED events
- ✅ Command processing (advanceTime, changeStat, showImage, addItem, triggerCombat)
- ✅ Variable storage get/set operations for stats.* and overworld.* namespaces
- ✅ Tokenizer edge cases with malformed commands
- ✅ Dialog system status reporting

### 2. Integration Tests (`integration/narrative-flow.test.js`)

**Coverage:**
- ✅ Complete story traversal from start to end
- ✅ UI event dispatching and validation
- ✅ Story state persistence across dialogue sessions
- ✅ Variable storage integration with gameState
- ✅ Command event dispatching
- ✅ Choice filtering and availability
- ✅ Error handling during story traversal

### 3. Edge Case Tests (`edge-cases/robustness.test.js`)

**Coverage:**
- ✅ Malformed command strings with unclosed quotes
- ✅ Unknown command names and extra whitespace
- ✅ Condition syntax with chained expressions (>=, <=, &&, ||)
- ✅ Non-existent variable references
- ✅ End of story behavior with <<stop>> commands
- ✅ Tokenizer robustness with various input patterns
- ✅ Command parsing with whitespace issues
- ✅ Error recovery during command execution

### 4. Story Validation Tests (`validation/story-smoke.test.js`)

**Coverage:**
- ⚠️ Deprecated in default Jest run
- ✅ Active runtime story smoke validation is now handled by `scripts/smoke-test-yarn.js`
- ✅ Smoke harness enforces parser-shape contract (`title:`, `---`, `== start`, `===`)
- ✅ Runtime-derived story set is sourced from encounter mappings and dialog IDs

### 5. UI Behavior Tests (`ui/dialog-ui.test.js`)

**Coverage:**
- ✅ DialogUI instantiation and event listener setup
- ✅ DIALOG_UPDATED event handling
- ✅ Choice rendering and selection
- ✅ Continue button visibility logic
- ✅ Keyboard navigation (Enter, Space, Numbers, Escape, Arrows)
- ✅ Typewriter effect simulation and skip functionality
- ✅ Dialog history tracking
- ✅ Portrait updates and emotion changes
- ✅ Show/hide dialog functionality

## 🛠️ Mock Infrastructure

### Mock Dispatcher (`mocks/dispatcher.js`)
- Captures all dispatched events for validation
- Provides event querying methods (getLastEvent, getEvents, wasEventDispatched)
- Supports event clearing between tests

### Mock Game State (`mocks/game-state.js`)
- Provides realistic gameState with stats and overworld properties
- Supports variable get/set operations
- Includes helper methods for state manipulation

### Mock Yarn Stories (`mocks/yarn-stories/`)
- **simple-story.yarn**: Basic text-only story
- **choice-story.yarn**: Story with multiple choice paths
- **pause-story.yarn**: Tests pause command handling
- **command-story.yarn**: Tests all command types
- **malformed-commands.yarn**: Tests error handling
- **unknown-cmds.yarn**: Tests unknown command handling
- **chained-conditions.yarn**: Tests complex condition logic
- **non-existent-vars.yarn**: Tests variable fallbacks
- **end-story.yarn**: Tests story termination
- **complex-story.yarn**: Full integration test story
- **complex-state-story.yarn**: Tests state persistence

## 🚀 Running Tests

### Prerequisites
```bash
# Install test dependencies
npm install
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run smoke tests for active runtime story IDs
npm run test:smoke

# Run canonical Jest suite serially (compat alias)
npm run unit-tests

# Run full web CI gate
npm run ci:web
```

### Test Output

- **Standard Output**: Jest test results with pass/fail status
- **Coverage Report**: HTML report in `coverage/lcov-report/index.html`
- **Smoke Test**: Validates active runtime `.yarn` stories (skiplist-aware)

## 📊 Coverage Goals

The test suite aims for:
- **>=90% line coverage** for NarrativeService
- **>=85% branch coverage** for conditional logic
- **>=95% function coverage** for public APIs
- **100% coverage** for critical paths (story loading, command processing)

## 🔧 Configuration

### Jest Configuration (`jest.config.cjs`)
- ES modules support
- jsdom environment for DOM testing
- Coverage thresholds and reporting
- Global mocks and setup
- Verbose output for debugging

Deprecated suites excluded from default Jest run:
- `__tests__/validation/story-smoke.test.js`
- `__tests__/unit/narrative-service-cjs.test.js`

### Global Setup (`setup.js`)
- Web API mocks (TextEncoder, TextDecoder)
- YarnBound mocking for isolated testing
- Console warning suppression for expected messages
- Test utilities and helpers

## 🐛 Debugging

### Common Issues

1. **Import Errors**: Ensure `import.meta.glob` is properly mocked
2. **DOM Issues**: jsdom environment may not support all DOM APIs
3. **Async Issues**: Use `await` for story loading operations
4. **Event Timing**: Use `jest.advanceTimersByTime()` for timeout testing

### Debug Commands

```bash
# Run specific test file
npm test -- narrative-service.test.js

# Run with verbose output
npm test -- --verbose

# Run tests matching pattern
npm test -- --testNamePattern="choice"
```

## 📝 Writing New Tests

### Test Structure
```javascript
import { NarrativeService } from '../../src/narrative/narrative-service.js';
import { createMockDispatcher } from '../mocks/dispatcher.js';
import { createFakeGameState } from '../mocks/game-state.js';

describe('Test Category', () => {
  let service, dispatcher, gameState;

  beforeEach(() => {
    dispatcher = createMockDispatcher();
    gameState = createFakeGameState();
    service = new NarrativeService(dispatcher, gameState);
  });

  afterEach(() => {
    dispatcher.clear();
  });

  test('specific test case', async () => {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

### Best Practices

1. **Arrange-Act-Assert**: Set up conditions, execute actions, verify results
2. **Descriptive Names**: Test names should clearly describe what's being tested
3. **Isolation**: Each test should be independent of others
4. **Mocking**: Use provided mocks for external dependencies
5. **Edge Cases**: Test both happy paths and error conditions
6. **Async Handling**: Use proper async/await for story operations

## 🎯 Test Validation

This test suite validates:

### ✅ Technical Contracts
- NarrativeService API compliance
- Yarn-Bound integration correctness
- Event dispatcher integration
- Variable storage behavior

### ✅ User Experience
- Dialog flow correctness
- Choice availability logic
- Pause/continue functionality
- Keyboard navigation

### ✅ Robustness
- Error handling and recovery
- Malformed input processing
- Edge case behavior
- Resource cleanup

### ✅ Content Validation
- All story files load correctly
- Yarn syntax compliance
- Node connectivity
- Command validity

## 📈 Continuous Integration

### GitHub Actions (Recommended)
```yaml
- name: Run Tests
  run: |
    npm install
    npm run test:coverage
    npm run test:smoke
```

### Coverage Reporting
- Upload coverage to Codecov or similar service
- Track coverage trends over time
- Set coverage gates for PR validation

---

This comprehensive test suite ensures the Yarn-Bound narrative engine is production-ready with thorough validation of all functionality, edge cases, and integration points.
