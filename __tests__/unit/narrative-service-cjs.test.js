const { NarrativeService } = require('../../src/narrative/narrative-service.js');
const { createMockDispatcher } = require('../mocks/dispatcher.js');
const { createFakeGameState } = require('../mocks/game-state.js');
const { __mockedStories } = require('../mocks/vite-glob.js');

describe('NarrativeService Working Tests', () => {
  let service, dispatcher, gameState;

  beforeEach(() => {
    dispatcher = createMockDispatcher();
    gameState = createFakeGameState();
    service = new NarrativeService(dispatcher, gameState);
    
    // Override storyModules with our mock
    service.storyModules = __mockedStories;
  });

  afterEach(() => {
    dispatcher.clear();
  });

  test('loads story text via mock glob', async () => {
    const result = await service.switchStory('simple-story');
    expect(result).toBe(true);
    expect(service.currentStory).toBe('simple-story');
    expect(service.runner).toBeDefined();
  });

  test('text advancement works', async () => {
    await service.switchStory('simple-story');
    
    let result = service.runner.currentResult;
    expect(result).toBeDefined();
    
    // Continue through story
    service.continueDialogue();
    
    // Should have dispatched events
    expect(dispatcher.wasEventDispatched('DIALOG_UPDATED')).toBe(true);
  });

  test('choice selection works', async () => {
    await service.switchStory('choice-story');
    
    // Should start with options
    expect(service.runner.currentResult.constructor.name).toContain('Options');
    
    // Select first choice
    service.selectChoice(0);
    
    expect(dispatcher.wasEventDispatched('DIALOG_UPDATED')).toBe(true);
  });

  test('pause command works', async () => {
    await service.switchStory('pause-story');
    
    // Should trigger pause
    expect(dispatcher.wasEventDispatched('DIALOG_PAUSED')).toBe(true);
    
    // Continue after pause
    service.continueDialogue();
    expect(dispatcher.wasEventDispatched('DIALOG_UPDATED')).toBe(true);
  });

  test('command processing works', async () => {
    await service.switchStory('command-story');
    
    // Should process commands
    expect(dispatcher.wasEventDispatched('TIME_ADVANCED')).toBe(true);
    expect(dispatcher.wasEventDispatched('STAT_CHANGE')).toBe(true);
    expect(dispatcher.wasEventDispatched('SHOW_IMAGE')).toBe(true);
    expect(dispatcher.wasEventDispatched('INVENTORY_UPDATE')).toBe(true);
  });

  test('variable storage works', () => {
    const storage = service.createVariableStorage();
    
    // Test setting and getting
    storage.set('stats.strength', 42);
    expect(storage.get('stats.strength')).toBe(42);
    
    storage.set('overworld.time', 100);
    expect(storage.get('overworld.time')).toBe(100);
  });

  test('tokenizer works', () => {
    const tokens = service.tokenizeCommand('changeStat "stress" 2');
    expect(tokens).toEqual(['changeStat', 'stress', '2']);
  });

  test('getDialogSystemStatus works', () => {
    const status = service.getDialogSystemStatus();
    
    expect(status).toEqual(expect.objectContaining({
      initialized: false,
      currentStory: null,
      hasGameState: true,
      hasDispatcher: true,
      availableStories: expect.any(Array),
      timestamp: expect.any(String)
    }));
  });
});
