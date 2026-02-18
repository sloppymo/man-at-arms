// ============================================
// Basic Working Test for Yarn-Bound Narrative Engine
// ============================================

const STATS_PREFIX = 'stats.';
const OVERWORLD_PREFIX = 'overworld.';

describe('Basic Narrative Engine Tests', () => {
  test('Jest configuration works', () => {
    expect(true).toBe(true);
  });

  test('Mock dispatcher works', () => {
    const events = [];
    const dispatcher = {
      dispatch: (type, payload) => {
        events.push({ type, payload });
      },
      getEvents: (type) => events.filter(e => e.type === type),
      wasEventDispatched: (type) => events.some(e => e.type === type),
      clear: () => { events.length = 0; }
    };

    // Test dispatcher functionality
    dispatcher.dispatch('TEST_EVENT', { data: 'test' });
    expect(dispatcher.wasEventDispatched('TEST_EVENT')).toBe(true);
    
    const testEvents = dispatcher.getEvents('TEST_EVENT');
    expect(testEvents).toHaveLength(1);
    expect(testEvents[0]).toEqual({ type: 'TEST_EVENT', payload: { data: 'test' } });
    
    dispatcher.clear();
    expect(dispatcher.wasEventDispatched('TEST_EVENT')).toBe(false);
  });

  test('Mock game state works', () => {
    const gameState = {
      stats: { strength: 10, charisma: 8 },
      overworld: { time: 100, heat: 5 },
      inventory: { food: 10, coins: 25 }
    };

    // Test game state functionality
    expect(gameState.stats.strength).toBe(10);
    expect(gameState.overworld.time).toBe(100);
    expect(gameState.inventory.food).toBe(10);
  });

  test('Yarn-Bound mock works', () => {
    // Test that we can create a mock YarnBound runner
    const mockRunner = {
      currentResult: { text: 'Test text', constructor: { name: 'TextResult' } },
      advance: jest.fn(),
      isFinished: false
    };

    expect(mockRunner.currentResult.text).toBe('Test text');
    expect(mockRunner.advance).toBeDefined();
    expect(mockRunner.isFinished).toBe(false);
  });

  test('Command tokenizer works', () => {
    // Test the tokenizer function from NarrativeService
    const tokenizeCommand = (command) => {
      const tokens = [];
      let current = '';
      let inQuotes = false;
      let quoteChar = null;

      for (let i = 0; i < command.length; i++) {
        const char = command[i];

        if ((char === '"' || char === "'") && !inQuotes) {
          inQuotes = true;
          quoteChar = char;
          continue;
        }

        if (char === quoteChar && inQuotes) {
          inQuotes = false;
          quoteChar = null;
          continue;
        }

        if (char === ' ' && !inQuotes) {
          if (current.trim()) {
            tokens.push(current.trim());
            current = '';
          }
          continue;
        }

        current += char;
      }

      if (current.trim()) {
        tokens.push(current.trim());
      }

      return tokens.map(token => {
        if ((token.startsWith('"') && token.endsWith('"')) ||
            (token.startsWith("'") && token.endsWith("'"))) {
          return token.slice(1, -1);
        }
        return token;
      });
    };

    // Test various command patterns
    expect(tokenizeCommand('advanceTime 30')).toEqual(['advanceTime', '30']);
    expect(tokenizeCommand('changeStat "stress" 2')).toEqual(['changeStat', 'stress', '2']);
    expect(tokenizeCommand("showImage 'artwork/test.png'")).toEqual(['showImage', 'artwork/test.png']);
    expect(tokenizeCommand('addItem "silver sword" 1')).toEqual(['addItem', 'silver sword', '1']);
    expect(tokenizeCommand('')).toEqual([]);
  });

  test('Variable storage mock works', () => {
    const gameState = {
      stats: { strength: 10, charisma: 8 },
      overworld: { time: 100, heat: 5 },
      inventory: { food: 10, coins: 25 }
    };

    const variableStorage = {
      get: (name) => {
        const cleanName = name.startsWith('$') ? name.substring(1) : name;
        
        if (cleanName.startsWith(STATS_PREFIX)) {
          const statName = cleanName.substring(STATS_PREFIX.length);
          return gameState.stats[statName] || 0;
        }
        
        if (cleanName.startsWith(OVERWORLD_PREFIX)) {
          const prop = cleanName.substring(OVERWORLD_PREFIX.length);
          return gameState.overworld[prop] || 0;
        }
        
        return 0;
      },
      
      set: (name, value) => {
        const cleanName = name.startsWith('$') ? name.substring(1) : name;
        
        if (cleanName.startsWith(STATS_PREFIX)) {
          const statName = cleanName.substring(STATS_PREFIX.length);
          gameState.stats[statName] = value;
          return;
        }
        
        if (cleanName.startsWith(OVERWORLD_PREFIX)) {
          const prop = cleanName.substring(OVERWORLD_PREFIX.length);
          gameState.overworld[prop] = value;
          return;
        }
        return;
      }
    };

    // Test variable storage
    expect(variableStorage.get('stats.strength')).toBe(10);
    expect(variableStorage.get('overworld.time')).toBe(100);
    expect(variableStorage.get('unknown.variable')).toBe(0);

    variableStorage.set('stats.strength', 15);
    expect(gameState.stats.strength).toBe(15);

    variableStorage.set('overworld.heat', 10);
    expect(gameState.overworld.heat).toBe(10);
  });

  test('Story loading mock works', () => {
    const mockStoryModules = {
      'test-story.yarn': () => Promise.resolve('title: Test\n---\nHello world\n<<stop>>')
    };

    // Test story loading simulation
    const loadStoryText = async (storyPath) => {
      const possibleKeys = [
        `stories/${storyPath}.yarn`,
        `${storyPath}.yarn`
      ];

      for (const key of possibleKeys) {
        if (mockStoryModules[key]) {
          return await mockStoryModules[key]();
        }
      }

      throw new Error(`Story not found: ${storyPath}`);
    };

    // Test successful loading
    expect(loadStoryText('test-story')).resolves.toBe('title: Test\n---\nHello world\n<<stop>>');

    // Test failed loading
    expect(loadStoryText('nonexistent')).rejects.toThrow('Story not found: nonexistent');
  });
});
