// ============================================
// Narrative Service - Yarn-Bound Implementation
// Replaces DialogueService with yarn-bound runtime
// ============================================

// import YarnBound from '../vendor/yarn-bound.js';

export class NarrativeService {
  constructor(dispatcher, gameState) {
    this.dispatcher = dispatcher;
    this.gameState = gameState;
    this.runner = null;
    this.currentStory = null;

    // Vite glob for story loading - supports hot reload
    this.storyModules = import.meta.glob('../../stories-yarn/**/*.yarn', { as: 'raw' });

    // Set up event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for dialog continue events
    this.dispatcher.subscribe('DIALOG_CONTINUE', () => {
      this.continueDialogue();
    });

    // Listen for dialog choice events
    this.dispatcher.subscribe('DIALOG_CHOICE', (event) => {
      const { choiceIndex } = event.payload || {};
      if (typeof choiceIndex === 'number') {
        this.selectChoice(choiceIndex);
      }
    });

    // Listen for encounter trigger events (from hotspots)
    this.dispatcher.subscribe('TRIGGER_ENCOUNTER', (event) => {
      const { story, payload } = event;
      const storyName = story || (payload && payload.story);
      if (storyName) {
        console.log(`NarrativeService: Starting story from TRIGGER_ENCOUNTER: ${storyName}`);
        this.dispatcher.dispatch('MODE_CHANGE', 'dialogue');
        this.switchStory(storyName);
      } else {
        console.warn('NarrativeService: TRIGGER_ENCOUNTER received but no story specified', event);
      }
    });
  }

  // Core methods (preserve existing interface)
  async switchStory(storyName) {
    try {
      const yarnText = await this.loadStoryText(storyName);

      this.runner = new YarnBound({
        dialogue: yarnText,
        startAt: 'Start',
        handleCommand: this.handleCommand.bind(this),
        variableStorage: this.createVariableStorage(),
        combineTextAndOptionsResults: true
      });

      this.currentStory = storyName;
      this.updateUIFromCurrentResult();
      return true;
    } catch (error) {
      console.error(`Failed to load story ${storyName}:`, error);
      return false;
    }
  }

  continueDialogue() {
    if (!this.runner) return;
    this.runner.advance();
    this.updateUIFromCurrentResult();
  }

  selectChoice(choiceIndex) {
    if (!this.runner) return;
    this.runner.advance(choiceIndex);
    this.updateUIFromCurrentResult();
  }

  // Helper methods
  async loadStoryText(storyPath) {
    const possibleKeys = [
      `../../stories-yarn/${storyPath}.yarn`,
      `stories-yarn/${storyPath}.yarn`,
      `${storyPath}.yarn`
    ];

    for (const key of possibleKeys) {
      if (this.storyModules[key]) {
        return await this.storyModules[key]();
      }
    }

    const suffixKey = Object.keys(this.storyModules).find(k => k.endsWith(`/${storyPath}.yarn`));
    if (suffixKey) {
      return await this.storyModules[suffixKey]();
    }

    throw new Error(`Story not found: ${storyPath}`);
  }

  createVariableStorage() {
    return {
      get: (name) => {
        // Strip $ prefix if present (Yarn variables are $name)
        const cleanName = name.startsWith('$') ? name.substring(1) : name;

        if (cleanName.startsWith('stats.')) {
          const statName = cleanName.substring(6);
          return this.gameState.stats[statName] || 0;
        }
        if (cleanName.startsWith('overworld.')) {
          const prop = cleanName.substring(9);
          return this.gameState.overworld?.[prop] || 0;
        }
        return 0;
      },

      set: (name, value) => {
        // Strip $ prefix if present
        const cleanName = name.startsWith('$') ? name.substring(1) : name;

        if (cleanName.startsWith('stats.')) {
          const statName = cleanName.substring(6);
          this.gameState.stats[statName] = value;
          this.dispatcher.dispatch('STAT_UPDATE', { stat: statName, value });
          return;
        }
        if (cleanName.startsWith('overworld.')) {
          const prop = cleanName.substring(9);
          if (!this.gameState.overworld) this.gameState.overworld = {};
          this.gameState.overworld[prop] = value;
          return;
        }
        console.warn(`Unknown Yarn variable: ${cleanName} = ${value}`);
      }
    };
  }

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

  handleCommand(commandResult) {
    const { command, hashtags, metadata } = commandResult;
    const [cmdName, ...args] = this.tokenizeCommand(command);

    switch (cmdName) {
      case 'advanceTime':
        const minutes = parseInt(args[0]) || 0;
        this.gameState.overworld.time = (this.gameState.overworld.time || 0) + minutes;
        this.dispatcher.dispatch('TIME_ADVANCED', { minutes });
        break;

      case 'changeStat':
        this.dispatcher.dispatch('STAT_CHANGE', {
          stat: args[0],
          delta: parseInt(args[1]) || 0
        });
        break;

      case 'showImage':
        this.dispatcher.dispatch('SHOW_IMAGE', { imagePath: args[0] });
        break;

      case 'addItem':
        this.dispatcher.dispatch('INVENTORY_UPDATE', {
          action: 'add',
          itemId: args[0],
          quantity: parseInt(args[1]) || 1
        });
        break;

      case 'triggerCombat':
        this.dispatcher.dispatch('TRIGGER_COMBAT', { enemyId: args[0] });
        break;

      case 'triggerSkirmish':
        this.dispatcher.dispatch('TRIGGER_SKIRMISH', { skirmishType: args[0] });
        break;

      case 'addHeat':
        const heat = this.gameState.overworld.heat || 0;
        this.gameState.overworld.heat = Math.min(100, Math.max(0, heat + parseInt(args[0]) || 0));
        break;

      case 'wait':
        this.dispatcher.dispatch('DIALOG_WAIT', { duration: parseFloat(args[0]) || 1.0 });
        break;

      case 'pause':
        // Pause command requires explicit user advancement
        // UI should show continue button after pause
        this.dispatcher.dispatch('DIALOG_PAUSED');
        break;

      default:
        console.warn(`Unknown Yarn command: ${cmdName}`, args);
    }
  }

  updateUIFromCurrentResult() {
    if (!this.runner) return;

    const result = this.runner.currentResult;

    if (result instanceof YarnBound.TextResult) {
      this.dispatcher.dispatch('DIALOG_UPDATED', {
        text: result.text,
        choices: [],
        canContinue: true
      });
    } else if (result instanceof YarnBound.OptionsResult) {
      // Filter out unavailable options (design choice: hide rather than disable)
      const availableOptions = result.options.filter(opt => opt.isAvailable);
      
      // If no options are available, allow skipping past the options group
      const hasAvailableOptions = availableOptions.length > 0;
      
      this.dispatcher.dispatch('DIALOG_UPDATED', {
        text: result.text || '',
        choices: availableOptions.map((opt, originalIndex) => ({
          text: opt.text,
          index: result.options.indexOf(opt), // Use original index for advance()
          enabled: true // All remaining options are available
        })),
        canContinue: !hasAvailableOptions // Show continue button if no options available
      });
    }
    // CommandResult handled automatically by handleCommand
  }

  // Preserve existing interface methods
  startDialogEncounter(encounterType, characterId) {
    const storyMap = {
      'merchant_encounter': 'overworld/town_square_quest',
      'bandit_encounter': 'chevauchee/02_raid_encounters',
      'forest_encounter': 'overworld/forest_test'
    };

    const storyName = storyMap[encounterType] || 'overworld/forest_test';
    this.dispatcher.dispatch('MODE_CHANGE', 'dialogue');
    return this.switchStory(storyName);
  }

  getDialogSystemStatus() {
    return {
      initialized: !!this.runner,
      currentStory: this.currentStory,
      hasGameState: !!this.gameState,
      hasDispatcher: !!this.dispatcher,
      availableStories: Object.keys(this.storyModules),
      timestamp: new Date().toISOString()
    };
  }

  // Compatibility method for main.js
  async initializeDialogSystem() {
    console.log('NarrativeService: Initializing dialog system...');
    
    try {
      // Try to load our test story as a basic validation
      const testResult = await this.getStory('test_story');
      if (testResult) {
        console.log('NarrativeService: Test story loaded successfully');
        return true;
      } else {
        console.warn('NarrativeService: Test story failed to load');
        return true; // Don't fail initialization for missing test story
      }
    } catch (error) {
      console.error('NarrativeService: Error during initialization:', error);
      return false;
    }
  }

  // Compatibility method for story access
  async getStory(storyName) {
    try {
      await this.loadStoryText(storyName);
      return true;
    } catch (error) {
      console.warn(`NarrativeService: Story ${storyName} not available:`, error.message);
      return false;
    }
  }
}

// Factory function (preserve existing interface)
export function createNarrativeService(dispatcher, gameState) {
  return new NarrativeService(dispatcher, gameState);
}
