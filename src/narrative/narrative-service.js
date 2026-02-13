// ============================================
// Narrative Service - Yarn-Bound Implementation
// Replaces DialogueService with yarn-bound runtime
// ============================================

// Import YarnBound runtime
// import { YarnBound } from 'yarn-bound';
// import SimpleYarnParser from './simple-yarn-parser.js';

/**
 * Simple Yarn Parser - Alternative to YarnBound
 * Handles basic Yarn syntax for choice-based narratives
 */
class SimpleYarnParser {
  constructor(dialogueText) {
    this.dialogueText = dialogueText;
    this.nodes = {};
    this.currentNode = null;
    this.currentResult = null; // Add currentResult property like YarnBound
    this.variables = {};
    this.commandHistory = [];
    this.currentLineIndex = 0; // Track current position in node content

    this.parse();
  }

  parse() {
    const lines = this.dialogueText.split('\n');
    let currentNode = null;
    let currentContent = [];

    console.log('SimpleYarnParser: Parsing', lines.length, 'lines');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('title:')) {
        // Skip title
        continue;
      } else if (line === '---') {
        // Start of node content
        continue;
      } else if (line.startsWith('== ')) {
        // Save previous node
        if (currentNode && currentContent.length > 0) {
          this.nodes[currentNode] = currentContent.join('\n');
          console.log('SimpleYarnParser: Saved node', currentNode, 'with content length', this.nodes[currentNode].length);
        }

        // Start new node
        currentNode = line.substring(3).trim();
        currentContent = [];
        console.log('SimpleYarnParser: Starting node', currentNode);
      } else if (line === '===') {
        // End of node
        if (currentNode && currentContent.length > 0) {
          this.nodes[currentNode] = currentContent.join('\n');
          console.log('SimpleYarnParser: Ended node', currentNode, 'with content length', this.nodes[currentNode].length);
        }
        currentNode = null;
        currentContent = [];
      } else if (currentNode) {
        // Add content to current node
        currentContent.push(line);
      }
    }

    // Save last node
    if (currentNode && currentContent.length > 0) {
      this.nodes[currentNode] = currentContent.join('\n');
      console.log('SimpleYarnParser: Saved final node', currentNode);
    }

    console.log('SimpleYarnParser: Parsed nodes:', Object.keys(this.nodes));
  }

  startAt(nodeName) {
    if (this.nodes[nodeName]) {
      this.currentNode = nodeName;
      this.currentLineIndex = 0; // Reset line index when starting new node
      return this.getCurrentResult();
    }
    throw new Error(`Node "${nodeName}" not found`);
  }

  advance(choiceIndex = 0) {
    console.log('SimpleYarnParser: advance called with choiceIndex:', choiceIndex);
    console.log('SimpleYarnParser: currentNode:', this.currentNode);
    console.log('SimpleYarnParser: currentLineIndex:', this.currentLineIndex);
    console.log('SimpleYarnParser: available nodes:', Object.keys(this.nodes));
    
    const content = this.nodes[this.currentNode];
    console.log('SimpleYarnParser: content for current node:', !!content, content ? content.length : 'no content');
    
    if (!content) {
      console.log('SimpleYarnParser: No content found for node, returning null');
      return null;
    }

    // Process conditional blocks first
    let processedContent = content;
    processedContent = this.processConditionals(processedContent);

    const lines = processedContent.split('\n');
    const choices = [];
    let text = '';

    console.log('SimpleYarnParser: Processing', lines.length, 'lines starting from line', this.currentLineIndex);

    // Parse content for text and choices starting from currentLineIndex
    for (let i = this.currentLineIndex; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('-> ') || line.startsWith('* ')) {
        // Found a choice (support both -> and * syntax)
        const choiceText = line.startsWith('-> ') ? line.substring(3).trim() : line.substring(2).trim();
        let jumpTarget = null;

        // Check if next line is a jump
        if (i + 1 < lines.length && lines[i + 1].trim().startsWith('<<jump ')) {
          const jumpLine = lines[i + 1].trim();
          jumpTarget = jumpLine.match(/<<jump (.+?)>>/)?.[1];
          i++; // Skip the jump line
        }

        choices.push({
          text: choiceText,
          jumpTarget: jumpTarget,
          isAvailable: true,
          lineIndex: i // Store the actual line index where this choice was found
        });
        console.log('SimpleYarnParser: Found choice:', choiceText, '->', jumpTarget, 'at line', i);
      } else if (!line.startsWith('<<') && line.length > 0) {
        // Regular text
        if (text) text += '\n';
        text += line;
      }
    }

    console.log('SimpleYarnParser: Final text length:', text.length);
    console.log('SimpleYarnParser: Found', choices.length, 'choices');

    if (choices.length > 0) {
      // Has choices - return options result
      const result = {
        text: text,
        options: choices.map((choice, index) => ({
          text: choice.text,
          isAvailable: choice.isAvailable,
          jumpTarget: choice.jumpTarget,
          lineIndex: choice.lineIndex
        })),
        hasChoices: true
      };
      console.log('SimpleYarnParser: Returning choices result:', result);
      this.currentResult = result; // Store result
      return result;
    } else {
      // No choices - story continues or ends
      const hasMoreContent = lines.slice(this.currentLineIndex).some(line => line.trim() && !line.startsWith('<<'));
      const result = {
        text: text,
        hasChoices: false,
        isEnd: !hasMoreContent
      };
      console.log('SimpleYarnParser: Returning text-only result:', result);
      this.currentResult = result; // Store result
      
      // If no more content, reset for next node
      if (result.isEnd) {
        this.currentLineIndex = 0;
      }
      
      return result;
    }
  }

  processConditionals(content) {
    // Simple conditional processing - for now, just extract content from else blocks
    // This is a basic implementation that assumes the else branch is what we want
    let result = content;

    // Look for {if condition: content else: content} patterns
    const conditionalRegex = /\{if\s+([^:]+):\s*([^}]+)\s*else:\s*([^}]+)\}/g;
    result = result.replace(conditionalRegex, (match, condition, ifContent, elseContent) => {
      // For simplicity, always use the else content (assuming the condition is false)
      // In a real implementation, you'd evaluate the condition
      console.log('SimpleYarnParser: Processing conditional, using else branch:', elseContent.trim());
      return elseContent.trim();
    });

    return result;
  }

  advanceWithChoice(choiceIndex) {
    console.log('SimpleYarnParser: advanceWithChoice called with choiceIndex:', choiceIndex);
    console.log('SimpleYarnParser: currentNode:', this.currentNode);
    console.log('SimpleYarnParser: currentLineIndex:', this.currentLineIndex);
    
    const result = this.advance();
    console.log('SimpleYarnParser: advance() result:', result);
    
    if (result && result.options && result.options[choiceIndex]) {
      const choice = result.options[choiceIndex];
      console.log('SimpleYarnParser: selected choice:', choice);
      
      if (choice.jumpTarget) {
        // Jump to different node
        console.log('SimpleYarnParser: jumping to node:', choice.jumpTarget);
        this.currentNode = choice.jumpTarget;
        this.currentLineIndex = 0;
      } else {
        // Inline choice - continue from after this choice
        console.log('SimpleYarnParser: inline choice, continuing from line', choice.lineIndex + 1);
        this.currentLineIndex = choice.lineIndex + 1;
      }
    } else {
      console.warn('SimpleYarnParser: invalid choiceIndex', choiceIndex, 'or no result');
    }
    
    // Continue processing
    return this.advance();
  }

  getChoicesFromCurrentNode() {
    const content = this.nodes[this.currentNode];
    if (!content) return [];

    const lines = content.split('\n');
    const choices = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('-> ')) {
        const choiceText = line.substring(3).trim();
        let jumpTarget = null;

        if (i + 1 < lines.length && lines[i + 1].trim().startsWith('<<jump ')) {
          const jumpLine = lines[i + 1].trim();
          jumpTarget = jumpLine.match(/<<jump (.+?)>>/)?.[1];
          i++;
        }

        choices.push({
          text: choiceText,
          jumpTarget: jumpTarget,
          isAvailable: true
        });
      }
    }

    return choices;
  }

  getCurrentResult() {
    return this.advance();
  }

  canContinue() {
    return !this.getCurrentResult()?.isEnd;
  }
}

export class NarrativeService {
  constructor(dispatcher, gameState) {
    this.dispatcher = dispatcher;
    this.gameState = gameState;
    this.runner = null;
    this.currentStory = null;
    this.currentResult = null; // Add result caching property

    // Vite glob for story loading - supports hot reload
    this.storyModules = import.meta.glob('../../stories-yarn/**/*.yarn', { as: 'raw' });

    // Set up event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for Yarn-specific dialog continue events
    this.dispatcher.subscribe('YARN_CONTINUE', () => {
      this.continueDialogue();
    });

    // Listen for Yarn-specific dialog choice events
    this.dispatcher.subscribe('YARN_CHOICE', (event) => {
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

    // Listen for START_DIALOG events (from hotspots - compatibility)
    this.dispatcher.subscribe('START_DIALOG', (event) => {
      const { dialogId, character } = event.payload || {};
      if (dialogId) {
        // Store the character for this dialog session
        this.currentCharacter = character;
        
        // Map dialog IDs to story paths
        const storyMap = {
          'town_square_quest': 'overworld/town_square_quest',
          'castle_gate_delivery': 'overworld/castle_gate_delivery',
          'forest_encounter': 'overworld/forest_test',
          'raid_encounter': 'chevauchee/02_raid_encounters'
        };
        
        const storyName = storyMap[dialogId] || `overworld/${dialogId}`;
        console.log(`NarrativeService: Starting story from START_DIALOG: ${storyName} (character: ${character})`);
        this.dispatcher.dispatch('MODE_CHANGE', 'dialogue');
        this.switchStory(storyName);
      } else {
        console.warn('NarrativeService: START_DIALOG received but no dialogId specified', event);
      }
    });
  }

  // Core methods (preserve existing interface)
  async switchStory(storyName) {
    try {
      const yarnText = await this.loadStoryText(storyName);
      console.log(`NarrativeService: Loaded story text for ${storyName}, length: ${yarnText.length}`);

      this.runner = new SimpleYarnParser(yarnText);

      console.log(`NarrativeService: Created SimpleYarnParser runner for ${storyName}`);
      this.currentStory = storyName;

      // Initialize the story at the start node
      console.log(`NarrativeService: Starting story at 'start' node`);
      this.runner.startAt('start');

      // Auto-advance once to skip node headers and get to actual content
      console.log(`NarrativeService: Auto-advancing story ${storyName}`);
      this.continueDialogue();

      return true;
    } catch (error) {
      console.error(`Failed to load story ${storyName}:`, error);
      return false;
    }
  }

  continueDialogue() {
    if (!this.runner) return;
    const result = this.runner.advance();
    this.currentResult = result; // Cache the result
    this.updateUIFromCurrentResult();
  }

  selectChoice(choiceIndex) {
    if (!this.runner) return;
    const result = this.runner.advanceWithChoice(choiceIndex);
    this.currentResult = result; // Cache the result
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
    console.log('NarrativeService: updateUIFromCurrentResult called');
    console.log('NarrativeService: runner exists:', !!this.runner);
    
    if (!this.runner) {
      console.log('NarrativeService: No runner available');
      return;
    }

    const result = this.currentResult;
    console.log('NarrativeService: Got result from cached currentResult:', result);
    if (!result) {
      console.error('NarrativeService: No result available from cache');
      return;
    }

    // Use duck typing instead of instanceof to avoid YarnBound global dependency
    const hasText = result && typeof result.text === 'string';
    const hasOptions = result && result.options && Array.isArray(result.options);

    console.log(`NarrativeService: Result analysis - hasText: ${hasText}, hasOptions: ${hasOptions}`);
    console.log(`NarrativeService: Result text: ${result?.text}`);
    console.log(`NarrativeService: Result options:`, result?.options);

    if (hasText && !hasOptions) {
      // Text result - show dialog text with continue option
      console.log('NarrativeService: Sending text-only result to UI');
      this.dispatcher.dispatch('DIALOG_UPDATED', {
        text: result.text,
        choices: [],
        canContinue: true,
        source: 'yarn', // Indicate this is from Yarn system
        character: this.currentCharacter // Include character for portrait display
      });
    } else if (hasOptions) {
      // Options result - show choices
      console.log('NarrativeService: Found options, processing choices');
      // Filter out unavailable options (design choice: hide rather than disable)
      const availableOptions = result.options.filter(opt => opt.isAvailable);
      console.log(`NarrativeService: Available options: ${availableOptions.length} out of ${result.options.length}`);

      // If no options are available, allow skipping past the options group
      const hasAvailableOptions = availableOptions.length > 0;

      console.log('NarrativeService: Sending choices result to UI');
      this.dispatcher.dispatch('DIALOG_UPDATED', {
        text: result.text || '',
        choices: availableOptions.map((opt, originalIndex) => ({
          text: opt.text,
          index: result.options.indexOf(opt), // Use original index for advance()
          enabled: true // All remaining options are available
        })),
        canContinue: !hasAvailableOptions, // Show continue button if no options available
        source: 'yarn', // Indicate this is from Yarn system
        character: this.currentCharacter // Include character for portrait display
      });
    } else {
      console.log('NarrativeService: Result has neither text nor options');
      console.log('NarrativeService: Full result object:', result);
    }
    
    // Check if story has ended and automatically return to overworld
    if (result && result.isEnd) {
      console.log('NarrativeService: Story ended, dispatching MODE_CHANGE to overworld');
      this.dispatcher.dispatch('MODE_CHANGE', 'overworld');
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

  // Encounter rolling method for compatibility with EncounterService
  rollEncounter(seed, zone, timeOfDay) {
    // Simple encounter rolling based on seed and zone
    const encounterTypes = {
      'chevauchee': ['march_event', 'raid_village', 'patrol_spotted', 'forage', 'camp_event'],
      'normandy_raids': ['ambush', 'french_scouts', 'late_raid'],
      'forest': ['forest_encounter'],
      'default': ['march_event']
    };
    
    const types = encounterTypes[zone] || encounterTypes.default;
    const index = this.hashCode(seed) % types.length;
    
    return {
      type: types[index],
      zone: zone,
      timeOfDay: timeOfDay
    };
  }
  
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

// Factory function (preserve existing interface)
export function createNarrativeService(dispatcher, gameState) {
  return new NarrativeService(dispatcher, gameState);
}
