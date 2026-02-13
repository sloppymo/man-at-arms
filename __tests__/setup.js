// ============================================
// Jest Setup File
// Global test configuration and mocks
// ============================================

// Mock Web APIs
global.TextEncoder = global.TextEncoder || require('util').TextEncoder;
global.TextDecoder = global.TextDecoder || require('util').TextDecoder;

// Mock import.meta.glob for all tests
global.import = {
  meta: {
    glob: jest.fn(() => ({}))
  }
};

// Mock YarnBound import
jest.mock('yarn-bound', () => {
  return class MockYarnBound {
    constructor(options) {
      this.options = options;
      this.currentResult = this.createMockResult();
      this.isFinished = false;
    }

    createMockResult() {
      return {
        text: 'Mock text',
        options: [
          { text: 'Option 1', isAvailable: true },
          { text: 'Option 2', isAvailable: true }
        ],
        constructor: { name: 'MockResult' }
      };
    }

    advance(choiceIndex) {
      if (this.isFinished) return;
      
      // Simulate story advancement
      if (choiceIndex !== undefined) {
        this.currentResult = {
          text: `Selected option ${choiceIndex}`,
          options: [],
          constructor: { name: 'TextResult' }
        };
      } else {
        this.currentResult = {
          text: 'Advanced text',
          options: [],
          constructor: { name: 'TextResult' }
        };
      }
      
      // Simulate command execution
      if (this.options.handleCommand) {
        this.options.handleCommand({
          command: 'advanceTime 10',
          hashtags: [],
          metadata: {}
        });
      }
    }

    static get TextResult() {
      return { name: 'TextResult' };
    }

    static get OptionsResult() {
      return { name: 'OptionsResult' };
    }

    static get CommandResult() {
      return { name: 'CommandResult' };
    }
  };
});

// Mock console methods for cleaner test output
const originalConsole = { ...console };
global.console = {
  ...console,
  // Suppress expected warnings in tests
  warn: jest.fn((message, ...args) => {
    if (message.includes('Unknown Yarn command') || 
        message.includes('Unknown Yarn variable') ||
        message.includes('Story not found')) {
      return; // Suppress expected warnings
    }
    originalConsole.warn(message, ...args);
  })
};

// Global test utilities
global.createMockYarnContent = (title, content) => {
  return `title: ${title}
---
${content}
<<stop>>`;
};

global.createMockChoiceContent = (title, choices) => {
  const choiceText = choices.map((choice, index) => 
    `-> "${choice}"\n    <<jump END>>`
  ).join('\n');
  
  return `title: ${title}
---
Choose:
${choiceText}

===

title: END
---
Story complete.
<<stop>>`;
};

// Reset global state before each test
beforeEach(() => {
  // Clear import.meta.glob mock
  global.import.meta.glob.mockClear();
});

// Cleanup after each test
afterEach(() => {
  // Restore console
  global.console = originalConsole;
});
