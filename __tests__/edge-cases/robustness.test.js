import { NarrativeService } from '../../src/narrative/narrative-service.js';
import { createMockDispatcher } from '../mocks/dispatcher.js';
import { createFakeGameState } from '../mocks/game-state.js';

// Mock import.meta.glob for testing
const mockStoryModules = {
  '../../stories/yarn-stories/malformed-commands.yarn': () => Promise.resolve(`title: malformed-commands
---
Testing malformed commands:
<<advanceTime "unclosed quote>>
<<changeStat stress 2>>
<<showImage 'artwork/test.png'>>
<<addItem "silver sword>>
End of malformed test.
<<stop>>`),
  '../../stories/yarn-stories/unknown-cmds.yarn': () => Promise.resolve(`title: unknown-cmds
---
Testing unknown commands:
<<unknownCommand arg1 arg2>>
<<anotherUnknownCmd "quoted arg">>
<<yetAnotherCmd>>

Back to normal commands:
<<advanceTime 10>>
Unknown commands test complete.
<<stop>>`),
  '../../stories/yarn-stories/chained-conditions.yarn': () => Promise.resolve(`title: chained-conditions
---
Testing chained conditions:
<<set $stats.strength 8>>
<<set $stats.charisma 12>>
<<set $overworld.heat 50>>

-> "Test strength and charisma" <<if $stats.strength >= 5 && $stats.charisma >= 10>>
    Both conditions met!
    <<jump END>>
-> "Test strength or heat" <<if $stats.strength >= 10 || $overworld.heat >= 40>>
    One condition met!
    <<jump END>>
-> "Test complex chain" <<if $stats.strength >= 5 && $stats.charisma >= 8 && $overworld.heat <= 60>>
    Complex chain satisfied!
    <<jump END>>
-> "No conditions met"
    Default path.
    <<jump END>>

===

title: END
---
Conditions test complete.
<<stop>>`),
  '../../stories/yarn-stories/non-existent-vars.yarn': () => Promise.resolve(`title: non-existent-vars
---
Testing non-existent variables:
Your unknown stat is: {stats.nonexistent}
Your unknown overworld value is: {overworld.unknown}
Your completely unknown var is: {unknown_var}

Continue anyway.
<<stop>>`),
  '../../stories/yarn-stories/end-story.yarn': () => Promise.resolve(`title: end-story
---
This story will end.
<<stop>>`),
  'yarn-stories/malformed-commands': () => Promise.resolve(`title: malformed-commands
---
Testing malformed commands:
<<advanceTime "unclosed quote>>
<<changeStat stress 2>>
<<showImage 'artwork/test.png'>>
<<addItem "silver sword>>
End of malformed test.
<<stop>>`),
  'yarn-stories/unknown-cmds': () => Promise.resolve(`title: unknown-cmds
---
Testing unknown commands:
<<unknownCommand arg1 arg2>>
<<anotherUnknownCmd "quoted arg">>
<<yetAnotherCmd>>

Back to normal commands:
<<advanceTime 10>>
Unknown commands test complete.
<<stop>>`),
  'yarn-stories/chained-conditions': () => Promise.resolve(`title: chained-conditions
---
Testing chained conditions:
<<set $stats.strength 8>>
<<set $stats.charisma 12>>
<<set $overworld.heat 50>>

-> "Test strength and charisma" <<if $stats.strength >= 5 && $stats.charisma >= 10>>
    Both conditions met!
    <<jump END>>
-> "Test strength or heat" <<if $stats.strength >= 10 || $overworld.heat >= 40>>
    One condition met!
    <<jump END>>
-> "Test complex chain" <<if $stats.strength >= 5 && $stats.charisma >= 8 && $overworld.heat <= 60>>
    Complex chain satisfied!
    <<jump END>>
-> "No conditions met"
    Default path.
    <<jump END>>

===

title: END
---
Conditions test complete.
<<stop>>`),
  'yarn-stories/non-existent-vars': () => Promise.resolve(`title: non-existent-vars
---
Testing non-existent variables:
Your unknown stat is: {stats.nonexistent}
Your unknown overworld value is: {overworld.unknown}
Your completely unknown var is: {unknown_var}

Continue anyway.
<<stop>>`),
  'yarn-stories/end-story': () => Promise.resolve(`title: end-story
---
This story will end.
<<stop>>`)
};

// Mock import.meta.glob globally
global.import = {
  meta: {
    glob: () => mockStoryModules
  }
};

describe('Edge Case Robustness', () => {
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

  test('malformed command string with unclosed quotes', async () => {
    await expect(service.switchStory('yarn-stories/malformed-commands')).resolves.toBe(true);
    
    // Should not throw when advancing through malformed commands
    expect(() => service.continueDialogue()).not.toThrow();
    expect(() => service.selectChoice(0)).not.toThrow();
  });

  test('unknown commands do not crash', async () => {
    await expect(service.switchStory('yarn-stories/unknown-cmds')).resolves.toBe(true);
    
    // Should handle unknown commands gracefully
    expect(() => service.continueDialogue()).not.toThrow();
    
    // Should still dispatch valid events
    expect(dispatcher.wasEventDispatched('DIALOG_UPDATED')).toBe(true);
  });

  test('condition syntax with chained expressions', async () => {
    await expect(service.switchStory('yarn-stories/chained-conditions')).resolves.toBe(true);
    
    // Should load and parse chained conditions
    expect(service.runner.currentResult).toBeDefined();
    
    // Should be able to advance through conditions
    expect(() => service.continueDialogue()).not.toThrow();
    expect(() => service.selectChoice(0)).not.toThrow();
  });

  test('non-existent variable references revert to default', async () => {
    await expect(service.switchStory('yarn-stories/non-existent-vars')).resolves.toBe(true);
    
    // Should handle non-existent variables gracefully
    const storage = service.createVariableStorage();
    expect(storage.get('stats.nonexistent')).toBe(0);
    expect(storage.get('overworld.unknown')).toBe(0);
    expect(storage.get('unknown_var')).toBe(0);
    
    // Should still be able to advance story
    expect(() => service.continueDialogue()).not.toThrow();
  });

  test('end of story calling continueDialogue again does not throw', async () => {
    await expect(service.switchStory('yarn-stories/end-story')).resolves.toBe(true);
    
    // Continue to end
    service.continueDialogue();
    
    // Calling continue again should not throw
    expect(() => service.continueDialogue()).not.toThrow();
    expect(() => service.selectChoice(0)).not.toThrow();
  });

  test('tokenizer handles various malformed inputs', () => {
    // Test with different types of malformed input
    const testCases = [
      { input: 'command "unclosed quote', expected: ['command', 'unclosed quote'] },
      { input: 'command \'single quote\'', expected: ['command', 'single quote'] },
      { input: 'command "mixed" quotes\'', expected: ['command', 'mixed', 'quotes\''] },
      { input: '   command   with   spaces   ', expected: ['command', 'with', 'spaces'] },
      { input: '', expected: [] },
      { input: '   ', expected: [] }
    ];
    
    testCases.forEach(({ input, expected }) => {
      const result = service.tokenizeCommand(input);
      expect(result).toEqual(expected);
    });
  });

  test('command parsing with extra whitespace', async () => {
    await service.switchStory('yarn-stories/unknown-cmds');
    
    // Should handle commands with various whitespace patterns
    expect(() => service.continueDialogue()).not.toThrow();
    
    // Should still process valid commands despite malformed ones
    const timeEvents = dispatcher.getEvents('TIME_ADVANCED');
    expect(timeEvents.length).toBeGreaterThan(0);
  });

  test('story loading with non-existent story', async () => {
    const result = await service.switchStory('completely-nonexistent-story');
    expect(result).toBe(false);
    expect(service.currentStory).toBe(null);
  });

  test('variable storage edge cases', () => {
    const storage = service.createVariableStorage();
    
    // Test setting various types of values
    storage.set('stats.test', 42);
    expect(storage.get('stats.test')).toBe(42);
    
    storage.set('stats.test', 'string');
    expect(storage.get('stats.test')).toBe('string');
    
    storage.set('stats.test', true);
    expect(storage.get('stats.test')).toBe(true);
    
    storage.set('stats.test', null);
    expect(storage.get('stats.test')).toBe(null);
    
    // Test overworld variables
    storage.set('overworld.test', 100);
    expect(storage.get('overworld.test')).toBe(100);
  });

  test('dispatcher event handling robustness', () => {
    // Test that dispatcher can handle various event types
    expect(() => dispatcher.dispatch('TEST_EVENT', { data: 'test' })).not.toThrow();
    expect(() => dispatcher.dispatch('ANOTHER_EVENT', null)).not.toThrow();
    expect(() => dispatcher.dispatch('EVENT_WITHOUT_PAYLOAD')).not.toThrow();
    
    // Should capture events correctly
    expect(dispatcher.wasEventDispatched('TEST_EVENT')).toBe(true);
    expect(dispatcher.wasEventDispatched('ANOTHER_EVENT')).toBe(true);
    expect(dispatcher.wasEventDispatched('EVENT_WITHOUT_PAYLOAD')).toBe(true);
  });

  test('story runner state consistency', async () => {
    await service.switchStory('yarn-stories/end-story');
    
    // Runner should be properly initialized
    expect(service.runner).toBeDefined();
    expect(service.currentStory).toBe('yarn-stories/end-story');
    
    // Should be able to get current result
    expect(service.runner.currentResult).toBeDefined();
  });

  test('error recovery during command execution', async () => {
    await service.switchStory('yarn-stories/malformed-commands');
    
    // Should handle command execution errors gracefully
    expect(() => service.continueDialogue()).not.toThrow();
    
    // Should continue to dispatch events even after malformed commands
    expect(dispatcher.getEvents().length).toBeGreaterThan(0);
  });
});
