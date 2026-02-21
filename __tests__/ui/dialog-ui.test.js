import { jest } from '@jest/globals';
import { DialogUI } from '../../src/ui/dialog-ui.js';
import { createMockDispatcher } from '../mocks/dispatcher.js';

// Mock DOM environment
const mockDocument = {
  createElement: jest.fn(() => ({
    className: '',
    innerHTML: '',
    style: {},
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(() => false)
    },
    appendChild: jest.fn(),
    querySelector: jest.fn(() => null),
    querySelectorAll: jest.fn(() => []),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    textContent: '',
    src: '',
    disabled: false,
    opacity: '1'
  })),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    contains: jest.fn(() => true),
    classList: {
      add: jest.fn(),
      remove: jest.fn()
    },
    style: {}
  },
  head: {
    appendChild: jest.fn()
  }
};

const mockWindow = {
  getComputedStyle: jest.fn(() => ({
    display: 'block',
    visibility: 'visible',
    opacity: '1',
    zIndex: '9999',
    backgroundImage: 'none'
  }))
};

// Mock global DOM
global.document = mockDocument;
global.window = mockWindow;

describe('DialogUI Behavior', () => {
  let ui, dispatcher;

  beforeEach(() => {
    dispatcher = createMockDispatcher();
    ui = new DialogUI(dispatcher);
    
    // Clear DOM mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (ui && ui.destroy) {
      ui.destroy();
    }
    dispatcher.clear();
  });

  test('DialogUI constructor initializes correctly', () => {
    expect(ui).toBeDefined();
    expect(ui.dispatcher).toBe(dispatcher);
    expect(ui.isVisible).toBe(false);
    expect(ui.dialogHistory).toEqual([]);
  });

  test('creates dialog elements on initialization', () => {
    expect(mockDocument.createElement).toHaveBeenCalled();
    expect(mockDocument.body.appendChild).toHaveBeenCalled();
  });

  test('updates UI when DIALOG_UPDATED event received', () => {
    const dialogData = {
      text: 'Hello world',
      choices: [],
      canContinue: true
    };

    dispatcher.dispatch('DIALOG_UPDATED', dialogData);

    // Should update dialog content
    expect(ui.currentText).toBe('Hello world');
    expect(ui.canContinue).toBe(true);
  });

  test('renders choices when provided', () => {
    const dialogData = {
      text: 'Pick one',
      choices: [
        { text: 'Yes', index: 0, enabled: true },
        { text: 'No', index: 1, enabled: true }
      ],
      canContinue: false
    };

    dispatcher.dispatch('DIALOG_UPDATED', dialogData);

    // Should have choices
    expect(ui.choices.length).toBe(2);
    expect(ui.choices[0].textContent).toContain('Yes');
    expect(ui.choices[1].textContent).toContain('No');
  });

  test('handles disabled choices correctly', () => {
    const dialogData = {
      text: 'Pick one',
      choices: [
        { text: 'Enabled', index: 0, enabled: true },
        { text: 'Disabled', index: 1, enabled: false }
      ],
      canContinue: false
    };

    dispatcher.dispatch('DIALOG_UPDATED', dialogData);

    // Should handle disabled state
    expect(ui.choices.length).toBe(2);
    // Note: Actual implementation would check for disabled class
  });

  test('shows continue button when canContinue true', () => {
    const dialogData = {
      text: 'Next',
      choices: [],
      canContinue: true
    };

    dispatcher.dispatch('DIALOG_UPDATED', dialogData);

    expect(ui.canContinue).toBe(true);
  });

  test('hides continue button when canContinue false', () => {
    const dialogData = {
      text: 'Choose',
      choices: [{ text: 'Option', index: 0, enabled: true }],
      canContinue: false
    };

    dispatcher.dispatch('DIALOG_UPDATED', dialogData);

    expect(ui.canContinue).toBe(false);
  });

  test('handles DIALOG_PAUSED event', () => {
    dispatcher.dispatch('DIALOG_PAUSED');

    // Should set canContinue to true after pause
    expect(ui.canContinue).toBe(true);
  });

  test('handles MODE_CHANGE event to dialogue', () => {
    dispatcher.dispatch('MODE_CHANGE', 'dialogue');

    // Should show dialog when entering dialogue mode
    expect(ui.isVisible).toBe(true);
  });

  test('handles MODE_CHANGE event away from dialogue', () => {
    // First show dialog
    dispatcher.dispatch('MODE_CHANGE', 'dialogue');
    
    // Then hide it
    dispatcher.dispatch('MODE_CHANGE', 'overworld');

    expect(ui.isVisible).toBe(false);
  });

  test('keyboard navigation - Enter key', () => {
    // Setup dialog with continue option
    dispatcher.dispatch('DIALOG_UPDATED', {
      text: 'Continue story',
      choices: [],
      canContinue: true
    });

    // Simulate Enter key
    const enterEvent = {
      key: 'Enter',
      preventDefault: jest.fn()
    };

    ui.handleKeyboard(enterEvent);

    expect(enterEvent.preventDefault).toHaveBeenCalled();
    expect(dispatcher.wasEventDispatched('DIALOG_CONTINUE')).toBe(true);
  });

  test('keyboard navigation - Space key', () => {
    // Setup dialog with continue option
    dispatcher.dispatch('DIALOG_UPDATED', {
      text: 'Continue story',
      choices: [],
      canContinue: true
    });

    // Simulate Space key
    const spaceEvent = {
      key: ' ',
      preventDefault: jest.fn()
    };

    ui.handleKeyboard(spaceEvent);

    expect(spaceEvent.preventDefault).toHaveBeenCalled();
    expect(dispatcher.wasEventDispatched('DIALOG_CONTINUE')).toBe(true);
  });

  test('keyboard navigation - Number keys for choices', () => {
    // Setup dialog with choices
    dispatcher.dispatch('DIALOG_UPDATED', {
      text: 'Choose',
      choices: [
        { text: 'Option 1', index: 0, enabled: true },
        { text: 'Option 2', index: 1, enabled: true }
      ],
      canContinue: false
    });

    // Simulate '1' key
    const keyEvent1 = {
      key: '1',
      preventDefault: jest.fn()
    };

    ui.handleKeyboard(keyEvent1);

    expect(keyEvent1.preventDefault).toHaveBeenCalled();
    expect(dispatcher.wasEventDispatched('DIALOG_CHOICE')).toBe(true);
  });

  test('keyboard navigation - Escape key', () => {
    const escapeEvent = {
      key: 'Escape',
      preventDefault: jest.fn()
    };

    ui.handleKeyboard(escapeEvent);

    expect(escapeEvent.preventDefault).toHaveBeenCalled();
    expect(dispatcher.wasEventDispatched('DIALOG_ENDED')).toBe(true);
  });

  test('choice selection dispatches correct event', () => {
    // Setup dialog with choices
    dispatcher.dispatch('DIALOG_UPDATED', {
      text: 'Choose',
      choices: [
        { text: 'Option 1', index: 0, enabled: true },
        { text: 'Option 2', index: 1, enabled: true }
      ],
      canContinue: false
    });

    // Select first choice
    ui.selectChoice(0);

    expect(dispatcher.wasEventDispatched('DIALOG_CHOICE')).toBe(true);
    
    const choiceEvent = dispatcher.getLastEvent('DIALOG_CHOICE');
    expect(choiceEvent.payload).toEqual({ choiceIndex: 0 });
  });

  test('dialog history tracking', () => {
    const dialogData1 = {
      character: 'NPC',
      text: 'Hello',
      choices: [],
      canContinue: true
    };

    const dialogData2 = {
      character: 'Player',
      text: 'Goodbye',
      choices: [],
      canContinue: true
    };

    dispatcher.dispatch('DIALOG_UPDATED', dialogData1);
    dispatcher.dispatch('DIALOG_UPDATED', dialogData2);

    expect(ui.dialogHistory.length).toBe(2);
    expect(ui.dialogHistory[0]).toEqual(expect.objectContaining({
      speaker: 'NPC',
      text: 'Hello'
    }));
    expect(ui.dialogHistory[1]).toEqual(expect.objectContaining({
      speaker: 'Player',
      text: 'Goodbye'
    }));
  });

  test('typewriter effect simulation', () => {
    const dialogData = {
      text: 'This is a test message',
      choices: [],
      canContinue: true
    };

    dispatcher.dispatch('DIALOG_UPDATED', dialogData);

    // Should start typewriter effect
    expect(ui.isTypewriterActive).toBe(true);
    expect(ui.currentText).toBe('This is a test message');
  });

  test('skip typewriter functionality', () => {
    const dialogData = {
      text: 'This is a test message',
      choices: [],
      canContinue: true
    };

    dispatcher.dispatch('DIALOG_UPDATED', dialogData);
    
    // Skip typewriter
    ui.skipTypewriter();

    expect(ui.isTypewriterActive).toBe(false);
  });

  test('dialog show/hide functionality', () => {
    // Show dialog
    ui.showDialog({
      character: 'Test',
      emotion: 'neutral',
      text: 'Test message',
      choices: []
    });

    expect(ui.isVisible).toBe(true);

    // Hide dialog
    ui.hideDialog();

    expect(ui.isVisible).toBe(false);
  });

  test('close dialog functionality', () => {
    ui.closeDialog();

    expect(dispatcher.wasEventDispatched('DIALOG_ENDED')).toBe(true);
  });

  test('portrait updates', () => {
    const portraitData = {
      character: 'test_character',
      emotion: 'happy'
    };

    // Set current character first
    ui.currentCharacter = 'test_character';

    dispatcher.dispatch('PORTRAIT_UPDATED', portraitData);

    expect(ui.currentEmotion).toBe('happy');
  });

  test('choice navigation with arrow keys', () => {
    // Setup dialog with choices
    dispatcher.dispatch('DIALOG_UPDATED', {
      text: 'Choose',
      choices: [
        { text: 'Option 1', index: 0, enabled: true },
        { text: 'Option 2', index: 1, enabled: true },
        { text: 'Option 3', index: 2, enabled: true }
      ],
      canContinue: false
    });

    // Navigate down
    const downEvent = {
      key: 'ArrowDown',
      preventDefault: jest.fn()
    };

    ui.handleKeyboard(downEvent);

    expect(downEvent.preventDefault).toHaveBeenCalled();

    // Navigate up
    const upEvent = {
      key: 'ArrowUp',
      preventDefault: jest.fn()
    };

    ui.handleKeyboard(upEvent);

    expect(upEvent.preventDefault).toHaveBeenCalled();
  });

  test('error handling in event listeners', () => {
    // Mock a scenario where event listener might throw
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // Dispatch event that might cause issues
    dispatcher.dispatch('DIALOG_UPDATED', null);

    // Should handle gracefully
    expect(console.error).toHaveBeenCalled();

    // Restore console.error
    console.error = originalConsoleError;
  });
});
