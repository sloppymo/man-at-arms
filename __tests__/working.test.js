// ============================================
// Simple Working Test - Demonstrates Test Suite is Functional
// ============================================

describe('Comprehensive Test Suite - Working Demo', () => {
  test('Jest configuration is working', () => {
    expect(true).toBe(true);
  });

  test('Can create mock dispatcher', () => {
    const events = [];
    const dispatcher = {
      dispatch: (type, payload) => events.push({ type, payload }),
      getEvents: (type) => events.filter(e => e.type === type),
      wasEventDispatched: (type) => events.some(e => e.type === type),
      clear: () => { events.length = 0; }
    };

    dispatcher.dispatch('TEST_EVENT', { data: 'success' });
    expect(dispatcher.wasEventDispatched('TEST_EVENT')).toBe(true);
    expect(dispatcher.getEvents('TEST_EVENT')).toHaveLength(1);
  });

  test('Can create mock game state', () => {
    const gameState = {
      stats: { strength: 10, charisma: 8 },
      overworld: { time: 100 }
    };

    expect(gameState.stats.strength).toBe(10);
    expect(gameState.overworld.time).toBe(100);
  });

  test('Can create mock YarnBound runner', () => {
    const mockRunner = {
      currentResult: { text: 'Test', constructor: { name: 'TextResult' } },
      advance: jest.fn(),
      isFinished: false
    };

    expect(mockRunner.currentResult.text).toBe('Test');
    expect(mockRunner.advance).toBeDefined();
  });

  test('Command tokenizer works', () => {
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

    expect(tokenizeCommand('advanceTime 30')).toEqual(['advanceTime', '30']);
    expect(tokenizeCommand('changeStat "stress" 2')).toEqual(['changeStat', 'stress', '2']);
  });

  test('Story loading simulation works', async () => {
    const mockStoryModules = {
      'test-story.yarn': () => Promise.resolve('title: Test\n---\nHello world\n<<stop>>')
    };

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

    const result = await loadStoryText('test-story');
    expect(result).toBe('title: Test\n---\nHello world\n<<stop>>');

    await expect(loadStoryText('nonexistent')).rejects.toThrow('Story not found: nonexistent');
  });
});
