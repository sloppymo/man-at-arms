// ============================================
// Dialogue Service
// Centralized external function bindings for Ink.js integration
// Uses dispatcher exclusively for clean service boundaries
// ============================================

import { EVENT_TYPES } from '../core/dispatcher.js';

/**
 * Dialogue Service class that handles all Ink.js external function bindings
 * Uses dispatcher for clean separation of concerns
 */
export class DialogueService {
  constructor(dispatcher, gameState, equipmentManager) {
    this.dispatcher = dispatcher;
    this.gameState = gameState;
    this.equipmentManager = equipmentManager;
    this.stories = {};
    this.currentStory = null;

    // Initialize inkReady promise
    this.readyPromise = this.initializeStories();

    this.setupEventListeners();
  }

  /**
   * Calculate time of day from game minutes
   * @param {number} minutes - Total minutes since start
   * @returns {Object} - { period: string, visibility: number }
   */
  getTimeOfDay(minutes) {
    const hour = (Math.floor(minutes / 60) % 24);

    if (hour >= 5 && hour < 8) return { period: 'dawn', visibility: 0.8 };
    if (hour >= 8 && hour < 17) return { period: 'day', visibility: 1.0 };
    if (hour >= 17 && hour < 20) return { period: 'dusk', visibility: 0.7 };
    return { period: 'night', visibility: 0.4 }; // Harder to spot/be spotted
  }

  /**
   * Seeded random number generator for deterministic encounters
   * @param {string|number} seed - Seed value
   * @returns {number} - Random number between 0 and 1
   */
  seededRandom(seed) {
    let x = seed;
    x ^= x >> 12;
    x ^= x << 25;
    x ^= x >> 27;
    return ((x * 0x2545F4914F6CDD1D) >>> 0) / 4294967296; // 0-1
  }

  /**
   * Roll encounter using seeded RNG
   * @param {string} seed - Encounter seed from game state
   * @param {string} region - Region identifier
   * @param {string} timeOfDay - Time period
   * @returns {Object} - Encounter result
   */
  rollEncounter(seed, region, timeOfDay) {
    const rng = this.seededRandom(seed + region + timeOfDay);
    
    // Encounter tables by region and time
    const encounterTables = {
      forest: {
        day: ['bandits', 'merchants', 'peasants'],
        night: ['bandits', 'patrol'],
        dawn: ['patrol', 'nothing'],
        dusk: ['bandits', 'merchants']
      },
      town: {
        day: ['merchants', 'peasants', 'patrol'],
        night: ['patrol', 'nothing'],
        dawn: ['patrol', 'peasants'],
        dusk: ['merchants', 'peasants']
      },
      castle: {
        day: ['patrol', 'merchants'],
        night: ['patrol', 'nothing'],
        dawn: ['patrol'],
        dusk: ['patrol']
      },
      default: {
        day: ['bandits', 'merchants', 'peasants', 'patrol'],
        night: ['bandits', 'patrol', 'nothing'],
        dawn: ['patrol', 'nothing'],
        dusk: ['bandits', 'merchants']
      }
    };
    
    // Get appropriate table
    const regionTable = encounterTables[region] || encounterTables.default;
    const timeTable = regionTable[timeOfDay] || regionTable.day;
    
    // Select encounter
    const encounterIndex = Math.floor(rng * timeTable.length);
    return {
      type: timeTable[encounterIndex],
      rng: rng,
      region: region,
      timeOfDay: timeOfDay
    };
  }

  /**
   * Initialize stories by loading JSON files
   */
  async initializeStories() {
    console.log('DialogueService: Loading stories...');
    
    try {
      // List of story files to load
      const storyFiles = [
        'overworld/forest_test',
        'overworld/town_square_quest',
        'overworld/castle_gate_delivery',
        'overworld/town_square_complete'
      ];
      
      let loadedCount = 0;
      
      for (const storyPath of storyFiles) {
        try {
          const response = await fetch(`/stories/${storyPath}.json`);
          if (response.ok) {
            const storyData = await response.json();
            this.stories[storyPath] = storyData;
            console.log(`DialogueService: Loaded story "${storyPath}"`);
            loadedCount++;
          } else {
            console.warn(`DialogueService: Failed to load story ${storyPath}:`, response.status);
          }
        } catch (error) {
          console.warn(`DialogueService: Error loading story ${storyPath}:`, error.message);
        }
      }
      
      console.log(`DialogueService: Stories loaded successfully (${loadedCount}/${storyFiles.length} stories)`);
      return loadedCount > 0;
    } catch (error) {
      console.error('DialogueService: Error loading stories:', error);
      return false;
    }
  }

  /**
   * Switch to a specific story
   */
  switchStory(storyName) {
    if (this.stories[storyName]) {
      try {
        // Create Ink.js story from JSON data
        const Story = window.inkjs?.Story;
        if (!Story) {
          console.error('DialogueService: Ink.js Story not available - window.inkjs.Story is undefined');
          console.error('Available window properties:', Object.keys(window).filter(k => k.toLowerCase().includes('ink')).join(', '));
          return false;
        }
        
        console.log('DialogueService: Creating story with data:', {
          storyName,
          dataType: typeof this.stories[storyName],
          hasInkVersion: !!this.stories[storyName].inkVersion,
          hasRoot: !!this.stories[storyName].root,
          inkVersion: this.stories[storyName].inkVersion
        });
        
        this.currentStory = new Story(this.stories[storyName]);
        
        console.log('DialogueService: Story created successfully:', {
          hasCurrentStory: !!this.currentStory,
          hasVariablesState: !!this.currentStory.variablesState,
          hasChoosePathString: !!this.currentStory.ChoosePathString,
          hasCanContinue: !!this.currentStory.canContinue
        });
        
        // Bind external functions
        this.bindExternals(this.currentStory);
        
        if (typeof window !== 'undefined') {
          window.inkStory = this.currentStory;
        }
        console.log(`DialogueService: Switched to story "${storyName}"`);
        
        // Update DialogUI with the new story content
        this.updateDialogUI();
        
        return true;
      } catch (error) {
        console.error(`DialogueService: Error creating story "${storyName}":`, error);
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
          toString: error.toString()
        });
        console.error('Story data:', this.stories[storyName]);
        return false;
      }
    }
    console.warn(`DialogueService: Story "${storyName}" not found`);
    return false;
  }

  /**
   * Set up event listeners for dispatcher events
   */
  setupEventListeners() {
    if (!this.dispatcher) return;

    // Listen for stat changes from Ink
    this.dispatcher.subscribe(EVENT_TYPES.STAT_CHANGE, (event) => {
      this.handleStatChange(event);
    });

    // Listen for UI requests from Ink
    this.dispatcher.subscribe('OPEN_EQUIPMENT', (event) => {
      this.handleOpenEquipment(event);
    });

    this.dispatcher.subscribe('START_DIALOGUE', (event) => {
      this.handleStartDialogue(event);
    });

    // Listen for combat requests from Ink
    this.dispatcher.subscribe('TRIGGER_ENCOUNTER', async (event) => {
      console.log('DialogueService: TRIGGER_ENCOUNTER received:', event);
      
      // Wait for stories to load if needed
      if (!this.readyPromise) {
        await this.readyPromise;
      }
      
      // Retry if story not found yet (shouldn't happen with async wait, but just in case)
      let retryCount = 0;
      const maxRetries = 5;
      
      while (!this.stories[event.story] && retryCount < maxRetries) {
        console.log(`DialogueService: Story not loaded yet, retry ${retryCount + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        retryCount++;
      }
      
      if (!this.stories[event.story]) {
        console.error('DialogueService: Story still not found after retries:', event.story);
        return;
      }
      
      console.log('DialogueService: About to switchStory:', event.story);
      this.switchStory(event.story);
      this.dispatcher.dispatch(EVENT_TYPES.MODE_CHANGE, 'dialogue');
    });

    this.dispatcher.subscribe('TRIGGER_COMBAT', (event) => {
      this.handleTriggerCombat(event);
    });

    this.dispatcher.subscribe('TRIGGER_SKIRMISH', (event) => {
      this.handleTriggerSkirmish(event);
    });
  }

  /**
   * Initialize dialog system (called by main.js)
   * @returns {Promise<boolean>} - Success status
   */
  async initializeDialogSystem() {
    console.log('DialogueService: Initializing dialog system...');
    
    try {
      const success = await this.initializeStories();
      if (success) {
        console.log('DialogueService: Dialog system initialized successfully');
        return true;
      } else {
        console.warn('DialogueService: Dialog system initialization failed');
        return false;
      }
    } catch (error) {
      console.error('DialogueService: Critical error during initialization:', error);
      return false;
    }
  }

  /**
   * Start a dialog encounter (called by debug buttons)
   * @param {string} encounterType - Type of encounter
   * @param {string} characterId - Character ID for the encounter
   * @returns {boolean} - Success status
   */
  startDialogEncounter(encounterType, characterId) {
    console.log(`DialogueService: Starting ${encounterType} with ${characterId}`);
    
    try {
      // For now, try to switch to a story based on encounter type
      const storyName = 'overworld/forest_test'; // Default story
      
      if (this.switchStory(storyName)) {
        // Dispatch mode change to dialogue
        if (this.dispatcher && this.dispatcher.dispatch) {
          this.dispatcher.dispatch('MODE_CHANGE', 'dialogue', 'dialogue-service');
        }
        
        // Set up character context if available
        if (characterId && this.gameState) {
          this.gameState.currentCharacter = characterId;
        }
        
        console.log(`DialogueService: Successfully started ${encounterType}`);
        return true;
      } else {
        console.warn(`DialogueService: Failed to switch to story ${storyName}`);
        return false;
      }
    } catch (error) {
      console.error(`DialogueService: Error starting ${encounterType}:`, error);
      return false;
    }
  }

  /**
   * Get dialog system status (called by debug buttons)
   * @returns {Object} - Status information
   */
  getDialogSystemStatus() {
    return {
      initialized: !!this.stories,
      storyCount: Object.keys(this.stories || {}).length,
      currentStory: this.currentStory ? 'loaded' : 'none',
      hasGameState: !!this.gameState,
      hasDispatcher: !!this.dispatcher,
      availableStories: Object.keys(this.stories || {}),
      lastError: this.lastError || null,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Bind all external functions to a story instance with comprehensive debuggingject} story - Ink.js story instance
   */
  bindExternals(story) {
    if (!story || !story.BindExternalFunction) {
      console.error('DialogueService: Invalid story instance for external binding');
      return;
    }

    console.log('DialogueService: Starting external function binding...');
    console.log('DialogueService: Story inkVersion:', story.inkVersion || 'unknown');
    console.log('DialogueService: Story root type:', typeof story.root);

    // Add comprehensive error handling to the story
    story.onError = (error) => {
      console.error('DialogueService: Ink story error:', error);
      console.error('DialogueService: Error details:', {
        message: error.message,
        useEndLineNumber: error.useEndLineNumber,
        name: error.name
      });
      
      // Dispatch error notification
      this.dispatcher.dispatch('SHOW_NOTIFICATION', {
        title: 'Story Error',
        message: `Story execution error: ${error.message}`,
        type: 'error',
        source: 'ink'
      }, 'dialogue-service');
    };

    // Helper function for safe binding with error wrapping and debugging
    const safeBind = (name, fn) => {
      try {
        const wrappedFn = (...args) => {
          try {
            console.log(`DialogueService: External function "${name}" called with args:`, args);
            const result = fn(...args);
            console.log(`DialogueService: External function "${name}" executed successfully, result:`, result);
            return result;
          } catch (error) {
            console.error(`DialogueService: Error in external function "${name}":`, error);
            return null;
          }
        };
        
        story.BindExternalFunction(name, wrappedFn);
        console.log(`DialogueService: Bound external function: ${name}`);
        
      } catch (bindingError) {
        console.error(`DialogueService: Failed to bind external function "${name}":`, bindingError);
      }
    };

    // Core game functions with enhanced safety
    safeBind('advanceTime', (minutes) => {
      const timeMinutes = parseInt(minutes) || 0;
      if (timeMinutes < 0) {
        console.warn('DialogueService: advanceTime called with negative value:', minutes);
        return 0;
      }
      
      if (this.gameState.overworld) {
        this.gameState.overworld.time = (this.gameState.overworld.time || 0) + timeMinutes;
        console.log(`DialogueService: Advanced time by ${timeMinutes} minutes, new time: ${this.gameState.overworld.time}`);
      }
      
      this.dispatcher.dispatch('TIME_ADVANCED', {
        minutes: timeMinutes,
        newTime: this.gameState.overworld.time,
        source: 'ink'
      }, 'dialogue-service');
      
      return timeMinutes;
    });

    safeBind('getSupplies', () => {
      try {
        const supplies = this.gameState.overworld?.supplies || {};
        const suppliesStr = JSON.stringify(supplies);
        console.log(`DialogueService: getSupplies called, returning:`, suppliesStr);
        return suppliesStr;
      } catch (error) {
        console.error('DialogueService: Error in getSupplies:', error);
        return '{}';
      }
    });

    safeBind('consumeSupply', (type, amount) => {
      const supplyType = String(type || '').trim();
      const consumeAmount = parseInt(amount) || 0;
      
      if (!supplyType || consumeAmount <= 0) {
        console.warn('DialogueService: consumeSupply called with invalid args:', { type, amount });
        return false;
      }
      
      try {
        const supplies = this.gameState.overworld?.supplies || {};
        if (!supplies[supplyType] || supplies[supplyType] < consumeAmount) {
          console.log(`DialogueService: Not enough ${supplyType} (have: ${supplies[supplyType]}, need: ${consumeAmount})`);
          return false;
        }
        
        supplies[supplyType] -= consumeAmount;
        console.log(`DialogueService: Consumed ${consumeAmount} ${supplyType}, remaining: ${supplies[supplyType]}`);
        
        this.dispatcher.dispatch('SUPPLY_CONSUMED', {
          type: supplyType,
          amount: consumeAmount,
          remaining: supplies[supplyType],
          source: 'ink'
        }, 'dialogue-service');
        
        return true;
        
      } catch (error) {
        console.error('DialogueService: Error in consumeSupply:', error);
        return false;
      }
    });

    safeBind('showImage', (imagePath) => {
      if (!imagePath || typeof imagePath !== 'string') {
        console.warn('DialogueService: Invalid image path provided to showImage:', imagePath);
        this.dispatcher.dispatch('SHOW_NOTIFICATION', {
          title: 'Image Error',
          message: 'Invalid image path',
          type: 'warning',
          source: 'ink'
        }, 'dialogue-service');
        return;
      }

      this.dispatcher.dispatch('SHOW_IMAGE', {
        imagePath,
        source: 'ink',
        onError: (error) => {
          console.warn(`DialogueService: Failed to load image "${imagePath}":`, error);
          this.dispatcher.dispatch('SHOW_NOTIFICATION', {
            title: 'Image Not Found',
            message: `Could not load image: ${imagePath}`,
            type: 'warning',
            source: 'ink'
          }, 'dialogue-service');
        }
      }, 'dialogue-service');
    });

    console.log(`DialogueService: External function binding complete. Bound functions:`, [
      'advanceTime', 'getSupplies', 'consumeSupply', 'showImage'
    ]);

    // Stat modifications - dispatch events instead of direct calls
    story.BindExternalFunction('changeStat', (stat, delta) => {
      this.dispatcher.dispatch(EVENT_TYPES.STAT_CHANGE, {
        stat,
        delta,
        source: 'ink'
      }, 'dialogue-service');
      return true;
    });

    story.BindExternalFunction('applyStatChange', (stat, amount, opts = {}) => {
      this.dispatcher.dispatch(EVENT_TYPES.STAT_CHANGE, {
        stat,
        delta: amount,
        options: opts,
        source: 'ink'
      }, 'dialogue-service');

      // Return mock value for Ink compatibility
      return amount;
    });

    // Currency operations
    story.BindExternalFunction('formatCurrency', (pence) => {
      // For now, simple formatting - could be enhanced
      if (pence >= 240) {
        const pounds = Math.floor(pence / 240);
        const remainingPence = pence % 240;
        return `${pounds}£ ${remainingPence}d`;
      }
      return `${pence}d`;
    });

    // Condition operations
    story.BindExternalFunction('addCondition', (name, type = 'negative', duration = -1) => {
      this.dispatcher.dispatch('ADD_CONDITION', {
        name,
        type,
        duration,
        source: 'ink'
      }, 'dialogue-service');
    });

    story.BindExternalFunction('removeCondition', (name) => {
      this.dispatcher.dispatch('REMOVE_CONDITION', {
        name,
        source: 'ink'
      }, 'dialogue-service');
    });

    story.BindExternalFunction('hasCondition', (name) => {
      return this.gameState.conditions?.some(c => c.name === name) || false;
    });

    // Combat system
    story.BindExternalFunction('triggerCombat', (enemyId) => {
      this.dispatcher.dispatch('TRIGGER_COMBAT', {
        enemyId,
        source: 'ink'
      }, 'dialogue-service');
      return Promise.resolve();
    });

    story.BindExternalFunction('triggerSkirmish', (skirmishType) => {
      this.dispatcher.dispatch('TRIGGER_SKIRMISH', {
        skirmishType,
        source: 'ink'
      }, 'dialogue-service');
      return Promise.resolve();
    });

    // UI operations - dispatch events instead of direct DOM manipulation
    story.BindExternalFunction('showNotification', (title, message, type = 'info') => {
      this.dispatcher.dispatch('SHOW_NOTIFICATION', {
        title,
        message,
        type,
        source: 'ink'
      }, 'dialogue-service');
    });

    story.BindExternalFunction('openEquipment', () => {
      this.dispatcher.dispatch(EVENT_TYPES.OPEN_EQUIPMENT, {}, 'dialogue-service');
    });

    // Stat calculations
    story.BindExternalFunction('getEffectiveStat', (stat) => {
      // Use equipment manager if available, otherwise fallback
      if (this.equipmentManager && this.equipmentManager.getEffectiveStat) {
        return this.equipmentManager.getEffectiveStat(stat);
      }
      return this.gameState.stats?.[stat] || 0;
    });

    story.BindExternalFunction('rollDice', (modifier = 0) => {
      // Simple dice roll - could be enhanced with proper randomization
      const roll = Math.floor(Math.random() * 10) + 1;
      return roll + modifier;
    });

    story.BindExternalFunction('resolveAction', (stat, difficulty = 12, bonus = 0) => {
      // Dispatch resolution event instead of direct calculation
      const event = {
        stat,
        difficulty,
        bonus,
        source: 'ink'
      };

      this.dispatcher.dispatch('RESOLVE_ACTION', event, 'dialogue-service');

      // Return mock result for Ink compatibility
      // Real resolution will be handled by subscribers
      const effectiveStat = this.getEffectiveStat(stat);
      const roll = Math.floor(Math.random() * 10) + 1 + effectiveStat + bonus;
      return {
        roll,
        success: roll >= difficulty,
        margin: roll - difficulty,
        effectiveStat,
        baseStat: this.gameState.stats?.[stat] || 0,
        difficulty,
        baseDifficulty: difficulty
      };
    });

    // Narrative authoring helper
    story.BindExternalFunction('doCheck', (stat, difficulty = 12, bonus = 0) => {
      const result = story.BindExternalFunction('resolveAction')(stat, difficulty, bonus);
      return result.success;
    });

    // Equipment checks
    story.BindExternalFunction('hasShieldEquipped', () => {
      // Use equipment manager if available
      if (this.equipmentManager && this.equipmentManager.hasShieldEquipped) {
        return this.equipmentManager.hasShieldEquipped();
      }

      // Fallback to global function
      return typeof window.hasShieldEquipped === 'function' ? window.hasShieldEquipped() : false;
    });

    // Chapter progress
    story.BindExternalFunction('markChapterStarted', (chapterId) => {
      this.dispatcher.dispatch('CHAPTER_START', {
        chapterId,
        source: 'ink'
      }, 'dialogue-service');
    });

    story.BindExternalFunction('markChapterCompleted', (chapterId) => {
      this.dispatcher.dispatch('CHAPTER_COMPLETE', {
        chapterId,
        source: 'ink'
      }, 'dialogue-service');
    });

    // Chevauchée externals
    story.BindExternalFunction('addHeat', (amount) => {
      const state = this.gameState.overworld;
      const oldHeat = state.heat;
      state.heat = Math.min(100, Math.max(0, state.heat + amount));

      // Alert on thresholds
      const thresholds = [
        { at: 25, msg: "The locals are whispering..." },
        { at: 50, msg: "Patrols have been spotted nearby." },
        { at: 75, msg: "You hear horns in the distance!" },
        { at: 90, msg: "The garrison is hunting you!" }
      ];

      thresholds.forEach(t => {
        if (oldHeat < t.at && state.heat >= t.at) {
          this.dispatcher.dispatch('SHOW_NOTIFICATION', {
            title: 'Heat Rising',
            message: t.msg,
            type: 'warning'
          }, 'dialogue-service');
        }
      });

      return state.heat;
    });

    story.BindExternalFunction('discoverHex', (q, r) => {
      const key = `${q},${r}`;
      const wasNew = !this.gameState.overworld.discovered.has(key);
      this.gameState.overworld.discovered.add(key);

      // Return if this was new discovery (for Ink conditional text)
      return wasNew;
    });

    // Inventory management for quest items
    story.BindExternalFunction('addItem', (itemId, quantity = 1) => {
      const existingItem = this.gameState.inventory.find(item => item.id === itemId);
      if (existingItem) {
        existingItem.stackCount = (existingItem.stackCount || 1) + quantity;
      } else {
        this.gameState.inventory.push({
          id: itemId,
          stackCount: quantity,
          condition: 100
        });
      }
      this.dispatcher.dispatch('INVENTORY_UPDATE', {
        action: 'add',
        itemId,
        quantity
      }, 'dialogue-service');
      return true;
    });

    story.BindExternalFunction('removeItem', (itemId, quantity = 1) => {
      const itemIndex = this.gameState.inventory.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        const item = this.gameState.inventory[itemIndex];
        if (item.stackCount <= quantity) {
          this.gameState.inventory.splice(itemIndex, 1);
        } else {
          item.stackCount -= quantity;
        }
        this.dispatcher.dispatch('INVENTORY_UPDATE', {
          action: 'remove',
          itemId,
          quantity
        }, 'dialogue-service');
        return true;
      }
      return false;
    });

    story.BindExternalFunction('hasItem', (itemId) => {
      return this.gameState.inventory.some(item => item.id === itemId);
    });

    story.BindExternalFunction('getItemCount', (itemId) => {
      const item = this.gameState.inventory.find(item => item.id === itemId);
      return item ? (item.stackCount || 1) : 0;
    });

    console.log('DialogueService: All external functions bound to dispatcher');
  }

  /**
   * Handle stat change events
   */
  handleStatChange(event) {
    const { stat, delta, options = {}, source } = event.payload || event;

    if (source === 'ink') {
      // This came from Ink, don't echo back
      return;
    }

    // Apply stat change through proper channels
    if (typeof window.applyStatChange === 'function') {
      window.applyStatChange(stat, delta, options);
    }

    // Sync back to Ink story if available
    if (window.inkStory && window.inkStory.variablesState) {
      try {
        window.inkStory.variablesState[stat] = this.gameState.stats[stat];
      } catch (error) {
        console.warn(`Failed to sync stat ${stat} to Ink:`, error);
      }
    }
  }

  /**
   * Handle equipment open requests
   */
  handleOpenEquipment(event) {
    // Dispatch mode change instead of direct UI manipulation
    if (window.setMode) {
      window.setMode(window.gameState, 'equipment');
    }
  }

  /**
   * Update DialogUI with current story content
   */
  updateDialogUI() {
    console.log('updateDialogUI called');
    console.log('currentStory exists:', !!this.currentStory);
    console.log('window.dialogUI exists:', !!window.dialogUI);
    
    if (!this.currentStory || !window.dialogUI) {
      console.log('Cannot update DialogUI: no story or UI available');
      return;
    }

    try {
      // Get current story text
      const currentText = this.currentStory.currentText || this.currentStory.Continue() || "The story begins...";
      console.log('Story text:', currentText);
      
      // Get choices if available
      const choices = [];
      if (this.currentStory.currentChoices) {
        for (let i = 0; i < this.currentStory.currentChoices.length; i++) {
          const choice = this.currentStory.currentChoices[i];
          choices.push({
            text: choice.text,
            index: i,
            enabled: true
          });
        }
      }
      console.log('Choices:', choices);

      // Send to DialogUI
      this.dispatcher.dispatch('DIALOG_UPDATED', {
        character: 'Storyteller',
        emotion: 'neutral',
        text: currentText,
        choices: choices
      });

      console.log('Updated DialogUI with story content');
    } catch (error) {
      console.error('Error updating DialogUI:', error);
    }
  }

  /**
   * Handle dialogue start requests
   */
  handleStartDialogue(event) {
    const { scene } = event.payload || {};

    // Set mode and prepare scene
    if (window.setMode) {
      window.setMode(window.gameState, 'dialogue');
    }

    // Update DialogUI with story content
    this.updateDialogUI();

    if (scene && window.loadScene) {
      window.loadScene(scene);
    }
  }

  /**
   * Handle combat trigger requests
   */
  handleTriggerCombat(event) {
    const { enemyId } = event.payload || {};

    // Set combat mode and initialize
    if (window.setMode) {
      window.setMode(window.gameState, 'combat');
    }

    // Additional combat initialization can be added here
    console.log(`DialogueService: Combat triggered with enemy: ${enemyId}`);
  }

  /**
   * Handle show image requests
   */
  handleShowImage(event) {
    const { imagePath } = event.payload || {};

    // For now, log and dispatch a notification; UI can handle displaying
    console.log(`DialogueService: Showing image: ${imagePath}`);
    this.dispatcher.dispatch('SHOW_NOTIFICATION', {
      title: 'Scene Image',
      message: `Displaying: ${imagePath}`,
      type: 'info',
      imagePath, // Include image path for UI to use
      source: 'ink'
    }, 'dialogue-service');
  }

  /**
   * Get service status for debugging
   */
  getStatus() {
    return {
      hasDispatcher: !!this.dispatcher,
      hasGameState: !!this.gameState,
      hasEquipmentManager: !!this.equipmentManager,
      dispatcherListeners: this.dispatcher ? this.dispatcher.listenerCount() : 0
    };
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Dispatcher listeners are managed by dispatcher itself
    this.dispatcher = null;
    this.gameState = null;
    this.equipmentManager = null;
  }
}

// ============================================
// Factory function
// ============================================

/**
 * Create and initialize dialogue service
 */
export function createDialogueService(dispatcher, gameState, equipmentManager) {
  const service = new DialogueService(dispatcher, gameState, equipmentManager);

  // Make inkReady promise available globally
  if (typeof window !== 'undefined') {
    window.inkReady = service.readyPromise;
  }

  return service;
}

// ============================================
// Backward Compatibility
// ============================================

if (typeof window !== 'undefined') {
  window.DialogueService = DialogueService;
  window.createDialogueService = createDialogueService;
}
