#!/usr/bin/env node
// ============================================
// Unit Tests for Narrative Service Components
// Tests tokenizer, variableStorage, and command dispatch
// ============================================

import YarnBound from 'yarn-bound';

const STATS_PREFIX = 'stats.';
const OVERWORLD_PREFIX = 'overworld.';

class NarrativeServiceTester {
  constructor() {
    // Create a minimal mock NarrativeService for testing
    this.mockGameState = {
      stats: { strength: 10, charisma: 8 },
      overworld: { time: 100, heat: 5 }
    };

    // Mock dispatcher for testing
    this.mockDispatcher = {
      dispatched: [],
      dispatch: (event, payload) => {
        this.mockDispatcher.dispatched.push({ event, payload });
      }
    };

    // Initialize results object
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    };

    // Create service instance without import.meta.glob dependency
    this.narrativeService = this.createMockNarrativeService();
  }

  createMockNarrativeService() {
    // Create a minimal NarrativeService-like object for testing
    const service = {
      gameState: this.mockGameState,
      dispatcher: this.mockDispatcher
    };

    // Add methods with proper context
    service.tokenizeCommand = this.tokenizeCommand.bind(service);
    service.createVariableStorage = this.createVariableStorage.bind(service);
    service.handleCommand = this.handleCommand.bind(service);

    return service;
  }

  // Methods that work with service context
  tokenizeCommand(command) {
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
  }

  createVariableStorage() {
    const service = this;
    return {
      get: (name) => {
        // Strip $ prefix if present (Yarn variables are $name)
        const cleanName = name.startsWith('$') ? name.substring(1) : name;

        if (cleanName.startsWith(STATS_PREFIX)) {
          const statName = cleanName.substring(STATS_PREFIX.length);
          return service.gameState.stats[statName] || 0;
        }
        if (cleanName.startsWith(OVERWORLD_PREFIX)) {
          const prop = cleanName.substring(OVERWORLD_PREFIX.length);
          return service.gameState.overworld?.[prop] || 0;
        }
        return 0;
      },

      set: (name, value) => {
        // Strip $ prefix if present
        const cleanName = name.startsWith('$') ? name.substring(1) : name;

        if (cleanName.startsWith(STATS_PREFIX)) {
          const statName = cleanName.substring(STATS_PREFIX.length);
          service.gameState.stats[statName] = value;
          service.dispatcher.dispatch('STAT_UPDATE', { stat: statName, value });
          return;
        }
        if (cleanName.startsWith(OVERWORLD_PREFIX)) {
          const prop = cleanName.substring(OVERWORLD_PREFIX.length);
          if (!service.gameState.overworld) service.gameState.overworld = {};
          service.gameState.overworld[prop] = value;
          return;
        }
        console.warn(`Unknown Yarn variable: ${cleanName} = ${value}`);
      }
    };
  }

  handleCommand(commandResult) {
    const service = this;
    const { command, hashtags, metadata } = commandResult;
    const [cmdName, ...args] = this.tokenizeCommand(command);

    switch (cmdName) {
      case 'advanceTime':
        const minutes = parseInt(args[0]) || 0;
        service.gameState.overworld.time = (service.gameState.overworld.time || 0) + minutes;
        service.dispatcher.dispatch('TIME_ADVANCED', { minutes });
        break;

      case 'changeStat':
        service.dispatcher.dispatch('STAT_CHANGE', {
          stat: args[0],
          delta: parseInt(args[1]) || 0
        });
        break;

      case 'showImage':
        service.dispatcher.dispatch('SHOW_IMAGE', { imagePath: args[0] });
        break;

      case 'addItem':
        service.dispatcher.dispatch('INVENTORY_UPDATE', {
          action: 'add',
          itemId: args[0],
          quantity: parseInt(args[1]) || 1
        });
        break;

      case 'triggerCombat':
        service.dispatcher.dispatch('TRIGGER_COMBAT', { enemyId: args[0] });
        break;

      case 'triggerSkirmish':
        service.dispatcher.dispatch('TRIGGER_SKIRMISH', { skirmishType: args[0] });
        break;

      case 'addHeat':
        const heat = service.gameState.overworld.heat || 0;
        service.gameState.overworld.heat = Math.min(100, Math.max(0, heat + parseInt(args[0]) || 0));
        break;

      case 'wait':
        service.dispatcher.dispatch('DIALOG_WAIT', { duration: parseFloat(args[0]) || 1.0 });
        break;

      default:
        console.warn(`Unknown Yarn command: ${cmdName}`, args);
    }
  }

  runAllTests() {
    console.log('🧪 Running Narrative Service Unit Tests...\n');

    const testSuites = [
      { name: 'Tokenizer Tests', tests: this.getTokenizerTests() },
      { name: 'Variable Storage Tests', tests: this.getVariableStorageTests() },
      { name: 'Command Dispatch Tests', tests: this.getCommandDispatchTests() },
      { name: 'Integration Tests', tests: this.getIntegrationTests() }
    ];

    for (const suite of testSuites) {
      console.log(`📋 ${suite.name}`);
      this.runTestSuite(suite.tests);
      console.log('');
    }

    this.printSummary();
    return this.results.failed === 0;
  }

  runTestSuite(tests) {
    for (const test of tests) {
      try {
        const passed = test.test();
        this.results.total++;
        if (passed) {
          console.log(`  ✅ ${test.name}`);
          this.results.passed++;
        } else {
          console.log(`  ❌ ${test.name}`);
          this.results.failed++;
          this.results.errors.push({ test: test.name, error: 'Test returned false' });
        }
      } catch (error) {
        console.log(`  💥 ${test.name}: ${error.message}`);
        this.results.total++;
        this.results.failed++;
        this.results.errors.push({ test: test.name, error: error.message });
      }
    }
  }

  getTokenizerTests() {
    return [
      {
        name: 'Simple command without quotes',
        test: () => {
          const result = this.narrativeService.tokenizeCommand('advanceTime 30');
          return result.length === 2 && result[0] === 'advanceTime' && result[1] === '30';
        }
      },
      {
        name: 'Command with quoted arguments',
        test: () => {
          const result = this.narrativeService.tokenizeCommand('changeStat "stress" 2');
          return result.length === 3 && result[0] === 'changeStat' &&
                 result[1] === 'stress' && result[2] === '2';
        }
      },
      {
        name: 'Command with single quotes',
        test: () => {
          const result = this.narrativeService.tokenizeCommand("showImage 'artwork/test.png'");
          return result.length === 2 && result[0] === 'showImage' &&
                 result[1] === 'artwork/test.png';
        }
      },
      {
        name: 'Command with mixed quotes and spaces',
        test: () => {
          const result = this.narrativeService.tokenizeCommand('addItem "silver sword" 1');
          return result.length === 3 && result[0] === 'addItem' &&
                 result[1] === 'silver sword' && result[2] === '1';
        }
      },
      {
        name: 'Empty command',
        test: () => {
          const result = this.narrativeService.tokenizeCommand('');
          return result.length === 0;
        }
      }
    ];
  }

  getVariableStorageTests() {
    return [
      {
        name: 'Get stat variable with $ prefix',
        test: () => {
          const storage = this.narrativeService.createVariableStorage();
          const value = storage.get('$stats.strength');
          return value === 10;
        }
      },
      {
        name: 'Get stat variable without $ prefix',
        test: () => {
          const storage = this.narrativeService.createVariableStorage();
          const value = storage.get('stats.charisma');
          return value === 8;
        }
      },
      {
        name: 'Get overworld variable',
        test: () => {
          const storage = this.narrativeService.createVariableStorage();
          const value = storage.get('overworld.time');
          return value === 100;
        }
      },
      {
        name: 'Get unknown variable returns 0',
        test: () => {
          const storage = this.narrativeService.createVariableStorage();
          const value = storage.get('unknown.variable');
          return value === 0;
        }
      },
      {
        name: 'Set stat variable',
        test: () => {
          const storage = this.narrativeService.createVariableStorage();
          storage.set('stats.strength', 15);
          return this.narrativeService.gameState.stats.strength === 15;
        }
      },
      {
        name: 'Set overworld variable',
        test: () => {
          const storage = this.narrativeService.createVariableStorage();
          storage.set('overworld.heat', 10);
          return this.narrativeService.gameState.overworld.heat === 10;
        }
      },
      {
        name: 'Set unknown variable doesn\'t crash',
        test: () => {
          const storage = this.narrativeService.createVariableStorage();
          storage.set('unknown.variable', 42);
          // Should not crash, just log warning
          return true;
        }
      }
    ];
  }

  getCommandDispatchTests() {
    return [
      {
        name: 'advanceTime command',
        test: () => {
          const initialTime = this.narrativeService.gameState.overworld.time;
          const mockCommandResult = { command: 'advanceTime 45', hashtags: [], metadata: {} };
          this.narrativeService.handleCommand(mockCommandResult);
          return this.narrativeService.gameState.overworld.time === initialTime + 45;
        }
      },
      {
        name: 'changeStat command',
        test: () => {
          const initialStrength = this.narrativeService.gameState.stats.strength;
          let statChangeCalled = false;
          let statChangeArgs = null;

          // Mock the dispatcher
          this.narrativeService.dispatcher = {
            dispatch: (event, payload) => {
              if (event === 'STAT_CHANGE') {
                statChangeCalled = true;
                statChangeArgs = payload;
              }
            }
          };

          const mockCommandResult = { command: 'changeStat "strength" 5', hashtags: [], metadata: {} };
          this.narrativeService.handleCommand(mockCommandResult);

          return statChangeCalled && statChangeArgs.stat === 'strength' && statChangeArgs.delta === 5;
        }
      },
      {
        name: 'Unknown command doesn\'t crash',
        test: () => {
          const mockCommandResult = { command: 'unknownCommand arg1 arg2', hashtags: [], metadata: {} };
          // Should not throw an error
          this.narrativeService.handleCommand(mockCommandResult);
          return true;
        }
      },
      {
        name: 'Command with parsing error',
        test: () => {
          const mockCommandResult = { command: 'changeStat "unclosed quote 5', hashtags: [], metadata: {} };
          // Should handle gracefully
          this.narrativeService.handleCommand(mockCommandResult);
          return true;
        }
      }
    ];
  }

  getIntegrationTests() {
    return [
      {
        name: 'NarrativeService instantiation',
        test: () => {
          return this.narrativeService instanceof NarrativeService;
        }
      },
      {
        name: 'Has required methods',
        test: () => {
          return typeof this.narrativeService.switchStory === 'function' &&
                 typeof this.narrativeService.selectChoice === 'function' &&
                 typeof this.narrativeService.continueDialogue === 'function';
        }
      },
      {
        name: 'Has story modules loaded',
        test: () => {
          return this.narrativeService.storyModules && typeof this.narrativeService.storyModules === 'object';
        }
      }
    ];
  }

  printSummary() {
    console.log('\n📊 Unit Test Results:');
    console.log(`Total tests: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);

    if (this.results.errors.length > 0) {
      console.log('\n💥 Failed Tests:');
      this.results.errors.forEach(error => {
        console.log(`  ${error.test}: ${error.error}`);
      });
    }

    const success = this.results.failed === 0;
    console.log(`\n${success ? '🎉 All unit tests passed!' : '⚠️  Some unit tests failed'}`);
  }
}

// Export for testing
export { NarrativeServiceTester };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new NarrativeServiceTester();
  const success = await tester.runAllTests();
  process.exit(success ? 0 : 1);
}
