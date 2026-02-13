import { NarrativeService } from '../../src/narrative/narrative-service.js';
import { createMockDispatcher } from '../mocks/dispatcher.js';
import { createFakeGameState } from '../mocks/game-state.js';

// Mock import.meta.glob for testing
const mockStoryModules = {
  '../../stories/yarn-stories/complex-story.yarn': () => Promise.resolve(`title: complex-story
---
Welcome to the complex story test.
<<set $stats.strength 10>>
<<set $stats.charisma 5>>

Your strength is {stats.strength} and charisma is {stats.charisma}.

-> "Fight your way through"
    <<jump fight_path>>
-> "Talk your way through"
    <<jump talk_path>>
-> "Sneak past"
    <<jump sneak_path>>

===

title: fight_path
---
You use your strength to break through!
<<changeStat "strength" 1>>
<<advanceTime 15>>
Success!
<<jump END>>

===

title: talk_path
---
You try to negotiate.
<<resolveAction "charisma" 12 0>>
{
<<if $success>>
Your charisma works!
<<jump END>>
<<if $failure>>
You fail to convince them.
<<jump END>>
}

===

title: sneak_path
---
You sneak past quietly.
<<advanceTime 20>>
<<jump END>>

===

title: END
---
Story complete.
<<stop>>`),
  '../../stories/yarn-stories/complex-state-story.yarn': () => Promise.resolve(`title: complex-state-story
---
Testing state persistence:
<<set $stats.someStat 25>>
<<set $overworld.someValue 100>>

Your stat is now {stats.someStat}.
Your overworld value is {stats.someValue}.

-> "Change values"
    <<set $stats.someStat 50>>
    <<set $overworld.someValue 200>>
    Values changed!
    <<jump END>>
-> "Keep values"
    Values unchanged.
    <<jump END>>

===

title: END
---
State test complete.
<<stop>>`),
  'yarn-stories/complex-story': () => Promise.resolve(`title: complex-story
---
Welcome to the complex story test.
<<set $stats.strength 10>>
<<set $stats.charisma 5>>

Your strength is {stats.strength} and charisma is {stats.charisma}.

-> "Fight your way through"
    <<jump fight_path>>
-> "Talk your way through"
    <<jump talk_path>>
-> "Sneak past"
    <<jump sneak_path>>

===

title: fight_path
---
You use your strength to break through!
<<changeStat "strength" 1>>
<<advanceTime 15>>
Success!
<<jump END>>

===

title: talk_path
---
You try to negotiate.
<<resolveAction "charisma" 12 0>>
{
<<if $success>>
Your charisma works!
<<jump END>>
<<if $failure>>
You fail to convince them.
<<jump END>>
}

===

title: sneak_path
---
You sneak past quietly.
<<advanceTime 20>>
<<jump END>>

===

title: END
---
Story complete.
<<stop>>`),
  'yarn-stories/complex-state-story': () => Promise.resolve(`title: complex-state-story
---
Testing state persistence:
<<set $stats.someStat 25>>
<<set $overworld.someValue 100>>

Your stat is now {stats.someStat}.
Your overworld value is {stats.someValue}.

-> "Change values"
    <<set $stats.someStat 50>>
    <<set $overworld.someValue 200>>
    Values changed!
    <<jump END>>
-> "Keep values"
    Values unchanged.
    <<jump END>>

===

title: END
---
State test complete.
<<stop>>`)
};

// Mock import.meta.glob globally
global.import = {
  meta: {
    glob: () => mockStoryModules
  }
};

describe('Narrative Flow Integration', () => {
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

  test('full story traversal from start to end', async () => {
    await service.switchStory('yarn-stories/complex-story');
    
    let result = service.runner.currentResult;
    let iterations = 0;
    const maxIterations = 20; // Prevent infinite loops
    
    while (result && iterations < maxIterations) {
      if (result.constructor.name.includes('Options')) {
        // Pick first available choice
        service.selectChoice(0);
      } else {
        service.continueDialogue();
      }
      result = service.runner.currentResult;
      iterations++;
    }
    
    expect(dispatcher.getEvents().length).toBeGreaterThan(0);
    expect(iterations).toBeGreaterThan(0);
  });

  test('mock dispatcher captures UI events', async () => {
    await service.switchStory('yarn-stories/complex-story');
    
    // Should have dispatched DIALOG_UPDATED events
    expect(dispatcher.wasEventDispatched('DIALOG_UPDATED')).toBe(true);
    
    const dialogEvents = dispatcher.getEvents('DIALOG_UPDATED');
    expect(dialogEvents.length).toBeGreaterThan(0);
    
    // Events should have correct structure
    dialogEvents.forEach(event => {
      expect(event).toEqual(expect.objectContaining({
        type: 'DIALOG_UPDATED',
        payload: expect.any(Object)
      }));
    });
  });

  test('story persists state across sessions', async () => {
    await service.switchStory('yarn-stories/complex-state-story');
    
    // Make a choice that changes state
    service.selectChoice(0); // "Change values"
    
    // Check that gameState was modified
    expect(gameState.stats.someStat).toBe(50);
    expect(gameState.overworld.someValue).toBe(200);
  });

  test('variable storage integration with gameState', async () => {
    await service.switchStory('yarn-stories/complex-story');
    
    // Initial values should be set
    expect(gameState.stats.strength).toBe(10);
    expect(gameState.stats.charisma).toBe(5);
  });

  test('command events are dispatched correctly', async () => {
    await service.switchStory('yarn-stories/complex-story');
    
    // Traverse story to trigger commands
    let result = service.runner.currentResult;
    let iterations = 0;
    const maxIterations = 10;
    
    while (result && iterations < maxIterations) {
      if (result.constructor.name.includes('Options')) {
        service.selectChoice(0); // Fight path
      } else {
        service.continueDialogue();
      }
      result = service.runner.currentResult;
      iterations++;
    }
    
    // Should have triggered changeStat and advanceTime commands
    expect(dispatcher.wasEventDispatched('STAT_CHANGE')).toBe(true);
    expect(dispatcher.wasEventDispatched('TIME_ADVANCED')).toBe(true);
  });

  test('story loading with different paths works', async () => {
    // Test with different path formats
    const result1 = await service.switchStory('yarn-stories/complex-story');
    expect(result1).toBe(true);
    
    const result2 = await service.switchStory('complex-story');
    expect(result2).toBe(true);
  });

  test('UI event payloads have correct structure', async () => {
    await service.switchStory('yarn-stories/complex-story');
    
    const dialogEvents = dispatcher.getEvents('DIALOG_UPDATED');
    expect(dialogEvents.length).toBeGreaterThan(0);
    
    // Check payload structure
    dialogEvents.forEach(event => {
      const payload = event.payload;
      expect(payload).toEqual(expect.objectContaining({
        text: expect.any(String),
        choices: expect.any(Array),
        canContinue: expect.any(Boolean)
      }));
    });
  });

  test('choice filtering works correctly', async () => {
    await service.switchStory('yarn-stories/complex-story');
    
    // Get to options
    let result = service.runner.currentResult;
    if (result.constructor.name.includes('Options')) {
      const options = result.options;
      expect(options).toEqual(expect.any(Array));
      expect(options.length).toBeGreaterThan(0);
      
      // Each option should have expected properties
      options.forEach(option => {
        expect(option).toEqual(expect.objectContaining({
          text: expect.any(String),
          isAvailable: expect.any(Boolean)
        }));
      });
    }
  });

  test('error handling during story traversal', async () => {
    // Test that errors don't crash the system
    await expect(service.switchStory('yarn-stories/complex-story')).resolves.toBe(true);
    
    // Try to continue without proper state
    expect(() => service.continueDialogue()).not.toThrow();
    expect(() => service.selectChoice(0)).not.toThrow();
  });
});
