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

    this.setupEventListeners();
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
  return new DialogueService(dispatcher, gameState, equipmentManager);
}

// ============================================
// Backward Compatibility
// ============================================

if (typeof window !== 'undefined') {
  window.DialogueService = DialogueService;
  window.createDialogueService = createDialogueService;
}
