import { NarrativeService } from '../../src/narrative/narrative-service.js';
import { createMockDispatcher } from '../mocks/dispatcher.js';
import { createFakeGameState } from '../mocks/game-state.js';

// Mock import.meta.glob for testing
const mockStoryModules = {
  '../../stories/yarn-stories/simple-story.yarn': () => Promise.resolve(`title: simple-story
---
Hello world.
<<stop>>`),
  '../../stories/yarn-stories/choice-story.yarn': () => Promise.resolve(`title: choice-story
---
Choose your path:
-> "Option 1"
    You chose option 1.
    <<jump END>>
-> "Option 2"
    You chose option 2.
    <<jump END>>

===

title: END
---
Story complete.
<<stop>>`),
  '../../stories/yarn-stories/pause-story.yarn': () => Promise.resolve(`title: pause-story
---
This is a pause test.
<<pause>>
After pause, continue.
<<stop>>`),
  '../../stories/yarn-stories/command-story.yarn': () => Promise.resolve(`title: command-story
---
Testing commands:
<<advanceTime 30>>
<<changeStat "strength" 5>>
<<showImage "test.png">>
<<addItem "sword" 1>>
Commands executed.
<<stop>>`),
  'yarn-stories/simple-story': () => Promise.resolve(`title: simple-story
---
Hello world.
<<stop>>`),
  'yarn-stories/choice-story': () => Promise.resolve(`title: choice-story
---
Choose your path:
-> "Option 1"
    You chose option 1.
    <<jump END>>
-> "Option 2"
    You chose option 2.
    <<jump END>>

===

title: END
---
Story complete.
<<stop>>`)
};

// Mock import.meta.glob globally
global.import = {
  meta: {
    glob: () => mockStoryModules
  }
};

describe('NarrativeService Unit Tests', () => {
  let service, dispatcher, gameState;

  beforeEach(() => {
    dispatcher = createMockDispatcher();
    gameState = createFakeGameState();
    service = new NarrativeService(dispatcher, gameState);
    
    // Override storyModules with our mock
    service.storyModules = mockStoryModules;
  });

  afterEach(() => {
    dispatcher.clear();
  });

  test('loads story text via Vite glob fallback', async () => {
    const result = await service.switchStory('yarn-stories/simple-story');
    expect(result).toBe(true);
    expect(service.currentStory).toBe('yarn-stories/simple-story');
    expect(service.runner).toBeDefined();
  });

  test('throws if story not found', async () => {
    const result = await service.switchStory('nonexistent');
    expect(result).toBe(false);
  });

  test('text advancement until end for simple text story', async () => {
    await service.switchStory('yarn-stories/simple-story');
    
    let result = service.runner.currentResult;
    let iterations = 0;
    const maxIterations = 10; // Prevent infinite loops
    
    do {
      service.continueDialogue();
      result = service.runner.currentResult;
      iterations++;
    } while (result && iterations < maxIterations);
    
    expect(dispatcher.wasEventDispatched('DIALOG_UPDATED')).toBe(true);
    expect(iterations).toBeGreaterThan(0);
  });

  test('choice selection navigates to correct node', async () => {
    await service.switchStory('yarn-stories/choice-story');
    
    // Should start with options
    expect(service.runner.currentResult.constructor.name).toContain('Options');
    
    // Select first choice
    service.selectChoice(0);
    
    expect(dispatcher.getEvents()).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'DIALOG_UPDATED' })
    ]));
  });

  test('pause dispatches DIALOG_PAUSED then continue', async () => {
    await service.switchStory('yarn-stories/pause-story');
    
    // Should trigger pause
    expect(dispatcher.wasEventDispatched('DIALOG_PAUSED')).toBe(true);
    
    // Continue after pause
    service.continueDialogue();
    expect(dispatcher.wasEventDispatched('DIALOG_UPDATED')).toBe(true);
  });

  test('command processing - advanceTime', async () => {
    await service.switchStory('yarn-stories/command-story');
    
    const timeEvents = dispatcher.getEvents('TIME_ADVANCED');
    expect(timeEvents.length).toBeGreaterThan(0);
    expect(timeEvents[0]).toEqual(expect.objectContaining({
      type: 'TIME_ADVANCED',
      payload: expect.objectContaining({ minutes: 30 })
    }));
  });

  test('command processing - changeStat', async () => {
    await service.switchStory('yarn-stories/command-story');
    
    const statEvents = dispatcher.getEvents('STAT_CHANGE');
    expect(statEvents.length).toBeGreaterThan(0);
    expect(statEvents[0]).toEqual(expect.objectContaining({
      type: 'STAT_CHANGE',
      payload: expect.objectContaining({
        stat: 'strength',
        delta: 5
      })
    }));
  });

  test('command processing - showImage', async () => {
    await service.switchStory('yarn-stories/command-story');
    
    const imageEvents = dispatcher.getEvents('SHOW_IMAGE');
    expect(imageEvents.length).toBeGreaterThan(0);
    expect(imageEvents[0]).toEqual(expect.objectContaining({
      type: 'SHOW_IMAGE',
      payload: expect.objectContaining({
        imagePath: 'test.png'
      })
    }));
  });

  test('command processing - addItem', async () => {
    await service.switchStory('yarn-stories/command-story');
    
    const inventoryEvents = dispatcher.getEvents('INVENTORY_UPDATE');
    expect(inventoryEvents.length).toBeGreaterThan(0);
    expect(inventoryEvents[0]).toEqual(expect.objectContaining({
      type: 'INVENTORY_UPDATE',
      payload: expect.objectContaining({
        action: 'add',
        itemId: 'sword',
        quantity: 1
      })
    }));
  });

  test('variable storage get/set works for stats and overworld', () => {
    const storage = service.createVariableStorage();
    
    // Test setting and getting stats
    storage.set('stats.strength', 42);
    expect(storage.get('stats.strength')).toBe(42);
    
    // Test setting and getting overworld
    storage.set('overworld.time', 100);
    expect(storage.get('overworld.time')).toBe(100);
    
    // Test with $ prefix
    storage.set('$stats.charisma', 15);
    expect(storage.get('$stats.charisma')).toBe(15);
  });

  test('variable storage handles unknown variables gracefully', () => {
    const storage = service.createVariableStorage();
    
    // Unknown variables should return 0
    expect(storage.get('unknown.variable')).toBe(0);
    expect(storage.get('stats.unknown')).toBe(0);
    expect(storage.get('overworld.unknown')).toBe(0);
  });

  test('tokenizer handles quoted args', () => {
    const tokens = service.tokenizeCommand('changeStat "stress" 2');
    expect(tokens).toEqual(['changeStat', 'stress', '2']);
  });

  test('tokenizer handles single quotes', () => {
    const tokens = service.tokenizeCommand("showImage 'artwork/test.png'");
    expect(tokens).toEqual(['showImage', 'artwork/test.png']);
  });

  test('tokenizer handles mixed quotes and spaces', () => {
    const tokens = service.tokenizeCommand('addItem "silver sword" 1');
    expect(tokens).toEqual(['addItem', 'silver sword', '1']);
  });

  test('tokenizer handles empty command', () => {
    const tokens = service.tokenizeCommand('');
    expect(tokens).toEqual([]);
  });

  test('tokenizer handles command without quotes', () => {
    const tokens = service.tokenizeCommand('advanceTime 30');
    expect(tokens).toEqual(['advanceTime', '30']);
  });

  test('getDialogSystemStatus returns correct status', () => {
    const status = service.getDialogSystemStatus();
    
    expect(status).toEqual(expect.objectContaining({
      initialized: false, // No runner yet
      currentStory: null,
      hasGameState: true,
      hasDispatcher: true,
      availableStories: expect.any(Array),
      timestamp: expect.any(String)
    }));
  });

  test('startDialogEncounter maps to correct stories', async () => {
    const result = await service.startDialogEncounter('merchant_encounter', 'merchant');
    expect(result).toBe(true);
    expect(service.currentStory).toBe('overworld/town_square_quest');
  });

  test('startDialogEncounter defaults to forest_test for unknown encounters', async () => {
    const result = await service.startDialogEncounter('unknown_encounter', 'unknown');
    expect(result).toBe(true);
    expect(service.currentStory).toBe('overworld/forest_test');
  });

  test('initializeDialogSystem returns true for successful test', async () => {
    const result = await service.initializeDialogSystem();
    expect(result).toBe(true);
  });
});
