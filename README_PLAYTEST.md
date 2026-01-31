# Automated Playtesting Script

This directory contains an automated playtesting script for "A Man-at-Arms' Life" that uses Puppeteer to test the game in a real browser environment.

## Setup

1. **Install Node.js** (if not already installed)
   - Download from https://nodejs.org/
   - Version 16+ recommended

2. **Install dependencies:**
   ```bash
   npm install
   ```

   This will install Puppeteer, which includes Chromium.

## Usage

### Basic Usage

Run the playtest script:
```bash
node playtest.js
```

Or use npm:
```bash
npm test
```

### Configuration

Edit `playtest.js` to configure:
- `headless`: Set to `true` for headless mode (no browser window)
- `slowMo`: Milliseconds to slow down actions (for visibility)
- `timeout`: Timeout for operations (default: 30000ms)
- `testRuns`: Number of full playthrough attempts
- `maxScenes`: Maximum scenes to test per run

## What It Tests

The script automatically tests:

1. **Character Creation**
   - Default name field behavior
   - UI element visibility (stats, status bar, controls)
   - Quick Start button functionality

2. **Core Mechanics**
   - Bad outcome system calculations
   - Stress system functions
   - Chapter system and transitions
   - Arbitrary death events

3. **Save/Load System**
   - Save to localStorage
   - Load from localStorage
   - Verify all new fields are persisted

4. **Console Errors**
   - Monitors browser console for JavaScript errors

## Output

The script generates:
- **Console output**: Real-time test progress and results
- **playtest-report.json**: Detailed test report with:
  - All tests run (passed/failed)
  - Bugs found (with severity, steps to reproduce)
  - Statistics (pass rate, duration, etc.)

## Example Output

```
[2025-01-30T12:00:00.000Z] ℹ️ Starting automated playtesting...
[2025-01-30T12:00:01.000Z] ✅ Test passed: Character Creation - Initial Scene
[2025-01-30T12:00:02.000Z] ✅ Test passed: Character Creation - Stats Panel Hidden
[2025-01-30T12:00:03.000Z] ❌ Bug found: Stats panel visible on character creation

================================================================================
PLAYTEST SUMMARY
================================================================================
Total Tests: 15
Passed: 12 (80%)
Failed: 3 (20%)
Bugs Found: 5
Duration: 45s
Report saved to: playtest-report.json
================================================================================
```

## Limitations

- **Interactive Testing**: Some features require manual interaction (e.g., completing character creation steps)
- **Visual Testing**: Cannot verify visual appearance (colors, layout, etc.)
- **Performance**: Limited performance testing (load times, memory usage)
- **Combat**: Combat minigame testing is limited

## Extending the Script

To add new tests:

1. Create a new test function:
   ```javascript
   async function testMyFeature(page) {
       // Your test code
   }
   ```

2. Call it in `runPlaytests()`:
   ```javascript
   await testMyFeature(page);
   ```

3. Use helper functions:
   - `addTest(name, passed, details)` - Record test result
   - `addBug(severity, category, description, steps, expected, actual)` - Record bug
   - `getGameState(page)` - Get current game state
   - `makeChoice(page, index)` - Make a choice
   - `getCurrentScene(page)` - Get current scene

## Troubleshooting

**"Puppeteer not found"**
- Run `npm install` to install dependencies

**"Game not loading"**
- Verify `man-at-arms.html` exists in the same directory
- Check file path in script (line with `file://`)

**"Tests timing out"**
- Increase `timeout` in CONFIG
- Check browser console for errors

**"Cannot find gameState"**
- Game may not be initializing correctly
- Check browser console for JavaScript errors

## Next Steps

For more comprehensive testing, consider:
1. Adding more test cases for specific mechanics
2. Testing different choice paths
3. Stress testing (many scenes, save/load cycles)
4. Performance profiling
5. Visual regression testing (screenshots)
