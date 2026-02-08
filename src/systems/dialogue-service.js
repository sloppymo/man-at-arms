// ============================================
// Dialogue Service
// Centralized external function bindings for Ink.js integration
// Uses dispatcher exclusively for clean service boundaries
// ============================================

import { Story } from 'inkjs';
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
    
    // TODO: Implement encounter table lookup based on region/time
    // For now, return skeleton result
    const encounters = [
      'bandits',
      'merchants',
      'peasants',
      'patrol',
      'nothing'
    ];
    
    const encounterIndex = Math.floor(rng * encounters.length);
    return {
      type: encounters[encounterIndex],
      rng: rng,
      region: region,
      timeOfDay: timeOfDay
    };
  }

  /**
   * Initialize stories by loading JSON files
   */
  async initializeStories() {
    const storyFiles = [
      'character-creation.json',
      'main.json',
      'training.json',
      'overworld/forest_test.json'
    ];

    try {
      console.log('DialogueService: Loading Ink stories...');

      for (const fileName of storyFiles) {
        const response = await fetch(`./stories/${fileName}`);
        if (!response.ok) {
          throw new Error(`Failed to load ${fileName}: ${response.status}`);
        }

        const storyData = await response.json();
        const story = new Story(storyData);

        // Store story instance
        const storyName = fileName.replace('.json', '');
        this.stories[storyName] = story;

        console.log(`DialogueService: Loaded story "${storyName}"`);
      }

      // Set default story (character creation if no current scene)
      if (!this.currentStory) {
        this.currentStory = this.stories['character-creation'] || Object.values(this.stories)[0];
      }

      // Bind external functions to all stories
      for (const [name, story] of Object.entries(this.stories)) {
        this.bindExternals(story);
        console.log(`DialogueService: Bound externals for story "${name}"`);
      }

      // Make current story available globally for compatibility
      if (typeof window !== 'undefined') {
        window.inkStory = this.currentStory;
        window.inkjs = { Story }; // Provide inkjs reference
      }

      console.log('DialogueService: All stories loaded and ready');
      return true;

    } catch (error) {
      console.error('DialogueService: Failed to initialize stories:', error);
      throw error;
    }
  }

  /**
   * Switch to a specific story
   */
  switchStory(storyName) {
    if (this.stories[storyName]) {
      this.currentStory = this.stories[storyName];
      if (typeof window !== 'undefined') {
        window.inkStory = this.currentStory;
      }
      console.log(`DialogueService: Switched to story "${storyName}"`);
      return true;
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
    this.dispatcher.subscribe('TRIGGER_ENCOUNTER', (event) => {
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
   * Bind all external functions to a story instance
   * @param {Object} story - Ink.js story instance
   */
  bindExternals(story) {
    if (!story || !story.BindExternalFunction) {
      console.error('DialogueService: Invalid story instance');
      return;
    }

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
    story.BindExternalFunction('advanceTime', (minutes) => {
      const state = this.gameState.overworld;
      state.time = (state.time + minutes) % 1440; // Wrap to 24 hours

      // Decay heat over time (1 heat per hour)
      const oldHeat = state.heat;
      state.heat = Math.max(0, state.heat - Math.floor(minutes / 60));

      // Trigger events: hunger check, fatigue recovery, etc.
      this.dispatcher.dispatch('OV_TIME_PASSED', {
        minutes,
        newTime: state.time,
        timeOfDay: this.getTimeOfDay(state.time)
      }, 'dialogue-service');

      return state.time; // Return for Ink display
    });

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

    story.BindExternalFunction('getSupplies', () => {
      return JSON.stringify(this.gameState.overworld.supplies);
    });

    story.BindExternalFunction('consumeSupply', (type, amount) => {
      const supplies = this.gameState.overworld.supplies;
      const current = supplies[type] || 0;
      const canConsume = current >= amount;

      // Update supplies if possible
      if (canConsume) {
        supplies[type] = current - amount;
      }

      // Return detailed result for Ink compatibility
      return JSON.stringify({
        success: canConsume,
        consumed: canConsume ? amount : 0,
        remaining: canConsume ? current - amount : current
      });
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
      window.setMode(this.gameState, 'equipment');
    }
  }

  /**
   * Handle dialogue start requests
   */
  handleStartDialogue(event) {
    const { scene } = event.payload || {};

    // Set mode and prepare scene
    if (window.setMode) {
      window.setMode(this.gameState, 'dialogue');
    }

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
      window.setMode(this.gameState, 'combat');
    }

    // Additional combat initialization can be added here
    console.log(`DialogueService: Combat triggered with enemy: ${enemyId}`);
  }

  /**
   * Handle skirmish trigger requests
   */
  handleTriggerSkirmish(event) {
    const { skirmishType } = event.payload || {};

    // Trigger skirmish through proper channels
    if (typeof window.runSkirmish === 'function') {
      window.runSkirmish(skirmishType);
    }

    console.log(`DialogueService: Skirmish triggered: ${skirmishType}`);
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
