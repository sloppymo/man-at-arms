// ============================================
// Refactored Narrative Bridge
// Updated to use DialogueService and dispatcher for clean service boundaries
// ============================================

import { createDialogueService } from '../systems/dialogue-service.js';

/**
 * Refactored Narrative Bridge class for bidirectional state synchronization
 * Now uses DialogueService for external functions and dispatcher for events
 */
class NarrativeBridge {
  constructor(inkStory, gameState, dispatcher, equipmentManager = null) {
    this.inkStory = inkStory;
    this.gameState = gameState;
    this.dispatcher = dispatcher;
    this.equipmentManager = equipmentManager;

    // Create dialogue service for external functions
    this.dialogueService = createDialogueService(dispatcher, gameState, equipmentManager);

    this.eventTarget = new EventTarget();
    this.observers = [];
    this.isDestroyed = false;

    // Initialize
    this.setupVariableObservers();
    this.setupExternalFunctions();
    this.syncFromGameState();

    console.log('NarrativeBridge: Initialized with DialogueService and dispatcher');
  }

  /**
   * Set up variable observers for Ink → gameState sync
   * Updated to use dispatcher for UI updates instead of direct DOM manipulation
   */
  setupVariableObservers() {
    const criticalStats = ['strength', 'agility', 'endurance', 'charisma', 'luck', 'wits', 'wealth', 'reputation', 'morale', 'stress', 'experience', 'patronFavor'];

    criticalStats.forEach(stat => {
      try {
        const testValue = this.inkStory.variablesState[stat];
        if (testValue !== undefined) {
          const observer = (value) => {
            if (this.isDestroyed) return;

            // Prevent feedback loops and unnecessary updates
            if (this.gameState.stats[stat] !== value) {
              // Validate stat change
              if (this.validateStatChange(stat, this.gameState.stats[stat], value)) {
                this.gameState.stats[stat] = value;

                // Dispatch stat update event instead of direct UI call
                if (this.dispatcher) {
                  this.dispatcher.dispatch('STAT_UPDATE', {
                    stat,
                    value,
                    source: 'ink'
                  }, 'narrative-bridge');
                }

                // Dispatch legacy event for backward compatibility
                this.eventTarget.dispatchEvent(new CustomEvent('statChange', {
                  detail: { stat, value, source: 'ink' }
                }));
              }
            }
          };

          this.inkStory.ObserveVariable(stat, observer);
          this.observers.push({ stat, observer });
        } else {
          console.warn(`Variable '${stat}' not found in Ink story, skipping observation`);
        }
      } catch (error) {
        console.warn(`Cannot observe variable '${stat}': ${error.message}`);
      }
    });

    // Game state properties - also use dispatcher for UI updates
    const gameStateProps = ['faction', 'age', 'ageRange', 'year', 'location', 'level', 'currentScene', 'characterName', 'patronId', 'background'];

    gameStateProps.forEach(prop => {
      try {
        const testValue = this.inkStory.variablesState[prop];
        if (testValue !== undefined) {
          const observer = (value) => {
            if (this.isDestroyed) return;

            if (this.gameState[prop] !== value) {
              this.gameState[prop] = value;

              // Dispatch property update event instead of direct UI manipulation
              if (this.dispatcher) {
                this.dispatcher.dispatch('GAMESTATE_UPDATE', {
                  property: prop,
                  value,
                  source: 'ink'
                }, 'narrative-bridge');
              }

              // Dispatch legacy event for backward compatibility
              this.eventTarget.dispatchEvent(new CustomEvent('gameStateChange', {
                detail: { property: prop, value, source: 'ink' }
              }));
            }
          };

          this.inkStory.ObserveVariable(prop, observer);
          this.observers.push({ prop, observer });
        } else {
          console.warn(`Variable '${prop}' not found in Ink story, skipping observation`);
        }
      } catch (error) {
        console.warn(`Cannot observe variable '${prop}': ${error.message}`);
      }
    });
  }

  /**
   * Set up external functions using DialogueService
   * No longer directly binds functions - delegates to DialogueService
   */
  setupExternalFunctions() {
    // All external function binding is now handled by DialogueService
    this.dialogueService.bindExternals(this.inkStory);

    console.log('NarrativeBridge: External functions bound via DialogueService');
  }

  /**
   * Sync gameState → Ink (initial sync)
   */
  syncFromGameState() {
    if (this.isDestroyed) return;

    try {
      // Ensure all gameState stats variables exist in the Ink story
      const statsToSync = ['strength', 'agility', 'endurance', 'charisma', 'luck', 'wits', 'wealth', 'reputation', 'morale', 'stress', 'experience', 'patronFavor'];

      statsToSync.forEach(stat => {
        if (this.inkStory.variablesState[stat] === undefined) {
          try {
            this.inkStory.variablesState[stat] = this.gameState.stats[stat] || 0;
            console.log(`Declared variable '${stat}' in Ink story`);
          } catch (e) {
            console.warn(`Could not declare variable '${stat}' in Ink story:`, e.message);
          }
        }
      });

      // Sync stats
      Object.keys(this.gameState.stats).forEach(stat => {
        if (this.inkStory.variablesState[stat] !== undefined) {
          try {
            this.inkStory.variablesState[stat] = this.gameState.stats[stat];
          } catch (e) {
            console.warn(`Could not sync stat '${stat}' to Ink:`, e.message);
          }
        }
      });

      // Ensure gameState properties exist in Ink
      const propsToSync = ['faction', 'age', 'ageRange', 'year', 'location', 'level', 'currentScene', 'characterName', 'patronId', 'background'];

      propsToSync.forEach(prop => {
        if (this.inkStory.variablesState[prop] === undefined) {
          try {
            this.inkStory.variablesState[prop] = this.gameState[prop] || '';
          } catch (e) {
            console.warn(`Could not declare property '${prop}' in Ink story:`, e.message);
          }
        }
      });

      // Sync game state properties
      propsToSync.forEach(prop => {
        if (this.inkStory.variablesState[prop] !== undefined) {
          try {
            this.inkStory.variablesState[prop] = this.gameState[prop];
          } catch (e) {
            console.warn(`Could not sync property '${prop}' to Ink:`, e.message);
          }
        }
      });

      // Sync chapter progress and conditions
      this.syncChapterProgressToInk();
      this.syncConditionsToInk();

      console.log('Game state synced to Ink');
    } catch (error) {
      console.error('Failed to sync gameState to Ink:', error);
    }
  }

  /**
   * Sync chapter progress to Ink variables
   */
  syncChapterProgressToInk() {
    if (this.isDestroyed) return;

    Object.keys(this.gameState.chapterProgress || {}).forEach(chapterId => {
      const progress = this.gameState.chapterProgress[chapterId];
      const startedVar = `chapter_${chapterId}_started`;
      const completedVar = `chapter_${chapterId}_completed`;

      if (this.inkStory.variablesState[startedVar] !== undefined) {
        try {
          this.inkStory.variablesState[startedVar] = progress.started;
        } catch (e) {
          console.warn(`Could not sync chapter '${chapterId}' started to Ink:`, e.message);
        }
      }

      if (this.inkStory.variablesState[completedVar] !== undefined) {
        try {
          this.inkStory.variablesState[completedVar] = progress.completed;
        } catch (e) {
          console.warn(`Could not sync chapter '${chapterId}' completed to Ink:`, e.message);
        }
      }
    });
  }

  /**
   * Sync conditions to Ink variables
   */
  syncConditionsToInk() {
    if (this.isDestroyed || !this.gameState.conditions) return;

    // Clear existing condition variables
    Object.keys(this.inkStory.variablesState).forEach(varName => {
      if (varName.startsWith('condition_')) {
        try {
          delete this.inkStory.variablesState[varName];
        } catch (e) {
          // Silently ignore deletion errors
        }
      }
    });

    // Set current conditions
    this.gameState.conditions.forEach(condition => {
      const varName = `condition_${condition.name.replace(/\s+/g, '_').toLowerCase()}`;
      if (this.inkStory.variablesState[varName] !== undefined) {
        try {
          this.inkStory.variablesState[varName] = true;
        } catch (e) {
          console.warn(`Could not sync condition '${condition.name}' to Ink:`, e.message);
        }
      }
    });
  }

  /**
   * Validate stat change against limits
   */
  validateStatChange(stat, oldValue, newValue) {
    // Use dispatcher to get stat limits instead of direct window access
    if (this.dispatcher) {
      this.dispatcher.dispatch('VALIDATE_STAT_CHANGE', {
        stat,
        oldValue,
        newValue
      }, 'narrative-bridge');
    }

    // Fallback to direct validation
    const limits = (typeof window !== 'undefined' && window.statLimits) ? window.statLimits[stat] : null;
    if (!limits) {
      console.warn(`No limits defined for stat: ${stat}`);
      return true;
    }

    const isValid = newValue >= limits.min && newValue <= limits.max;
    if (!isValid) {
      console.error(`Invalid stat change: ${stat} from ${oldValue} to ${newValue} (limits: ${limits.min}-${limits.max})`);
      return false;
    }

    return true;
  }

  /**
   * Validate state integrity between gameState and Ink
   */
  validateStateIntegrity() {
    if (this.isDestroyed) return true;

    const issues = [];

    // Check for critical stat drift
    ['strength', 'agility', 'wealth', 'reputation', 'morale'].forEach(stat => {
      const gameValue = this.gameState.stats[stat];
      const inkValue = this.inkStory?.variablesState[stat];

      if (inkValue !== undefined && Math.abs(gameValue - inkValue) > 0.01) {
        issues.push(`Stat drift: ${stat} game=${gameValue} ink=${inkValue}`);
      }
    });

    if (issues.length > 0) {
      console.error("State integrity issues:", issues);
      return false;
    }

    return true;
  }

  /**
   * Get event target for external listeners
   */
  getEventTarget() {
    return this.eventTarget;
  }

  /**
   * Get dialogue service for advanced operations
   */
  getDialogueService() {
    return this.dialogueService;
  }

  /**
   * Clean up all observers and external functions
   */
  destroy() {
    if (this.isDestroyed) return;

    this.isDestroyed = true;

    // Remove all variable observers
    this.observers.forEach(({ stat, prop, observer }) => {
      if (stat && this.inkStory) {
        try {
          this.inkStory.RemoveVariableObserver(stat, observer);
        } catch (e) {
          console.warn(`Failed to remove observer for ${stat}:`, e);
        }
      } else if (prop && this.inkStory) {
        try {
          this.inkStory.RemoveVariableObserver(prop, observer);
        } catch (e) {
          console.warn(`Failed to remove observer for ${prop}:`, e);
        }
      }
    });

    // Destroy dialogue service
    if (this.dialogueService) {
      this.dialogueService.destroy();
    }

    // Clear references
    this.observers = [];
    this.inkStory = null;
    this.gameState = null;
    this.dispatcher = null;
    this.equipmentManager = null;
    this.dialogueService = null;

    console.log('NarrativeBridge: Destroyed');
  }
}

// ============================================
// Factory function
// ============================================

/**
 * Create narrative bridge with dispatcher integration
 */
export function createNarrativeBridge(inkStory, gameState, dispatcher, equipmentManager = null) {
  return new NarrativeBridge(inkStory, gameState, dispatcher, equipmentManager);
}

// ============================================
// Backward Compatibility
// ============================================

if (typeof window !== 'undefined') {
  window.NarrativeBridge = NarrativeBridge;
  window.createNarrativeBridge = createNarrativeBridge;
}

export default NarrativeBridge;
