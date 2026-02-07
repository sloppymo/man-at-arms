(function() {
    'use strict';
    
    // ============================================
    // Narrative Bridge - gameState ↔ Ink Synchronization
    // ============================================
    
    /**
     * Narrative Bridge class for bidirectional state synchronization
     */
    class NarrativeBridge {
        constructor(inkStory, gameState) {
            this.inkStory = inkStory;
            this.gameState = gameState;
            this.eventTarget = new EventTarget();
            this.observers = [];
            this.externalFunctions = [];
            
            this.setupVariableObservers();
            this.setupExternalFunctions();
            this.syncFromGameState();
        }
        
        /**
         * Set up variable observers for Ink → gameState sync
         */
        setupVariableObservers() {
            const criticalStats = ['strength', 'agility', 'endurance', 'charisma', 'luck', 'wits', 'wealth', 'reputation', 'morale', 'stress', 'experience', 'patronFavor'];
            
            criticalStats.forEach(stat => {
                try {
                    // Check if the variable exists in the story before trying to observe it
                    const testValue = this.inkStory.variablesState[stat];
                    if (testValue !== undefined) {
                        const observer = (value) => {
                            // Prevent feedback loops and unnecessary updates
                            if (this.gameState.stats[stat] !== value) {
                                // Validate stat change
                                if (this.validateStatChange(stat, this.gameState.stats[stat], value)) {
                                    this.gameState.stats[stat] = value;
                                    
                                    // Trigger UI update
                                    if (window.updateStats) {
                                        window.updateStats();
                                    }
                                    
                                    // Dispatch event
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
            
            // Game state properties
            const gameStateProps = ['faction', 'age', 'ageRange', 'year', 'location', 'level', 'currentScene', 'characterName', 'patronId', 'background'];
            
            gameStateProps.forEach(prop => {
                try {
                    // Check if the variable exists in the story before trying to observe it
                    const testValue = this.inkStory.variablesState[prop];
                    if (testValue !== undefined) {
                        const observer = (value) => {
                            if (this.gameState[prop] !== value) {
                                this.gameState[prop] = value;
                                
                                // Trigger specific updates
                                if (prop === 'location' || prop === 'year') {
                                    if (window.updateStatusBar) {
                                        window.updateStatusBar();
                                    }
                                }
                                
                                // Dispatch event
                                this.eventTarget.dispatchEvent(new CustomEvent('gameStateChange', {
                                    detail: { property: prop, value, source: 'ink' }
                                }));
                            }
                        };
                        
                        try {
                            this.inkStory.ObserveVariable(prop, observer);
                            this.observers.push({ prop, observer });
                        } catch (error) {
                            console.warn(`Cannot observe variable '${prop}': ${error.message}`);
                        }
                    } else {
                        console.warn(`Variable '${prop}' not found in Ink story, skipping observation`);
                    }
                } catch (error) {
                    console.warn(`Cannot observe variable '${prop}': ${error.message}`);
                }
            });
        }
        
        /**
         * Set up external functions for gameState → Ink sync
         */
        setupExternalFunctions() {
            // Stat modifications
            this.inkStory.BindExternalFunction("applyStatChange", (stat, amount, opts = {}) => {
                if (window.applyStatChange) {
                    const actualChange = window.applyStatChange(stat, amount, opts);
                    
                    // Sync back to Ink
                    if (this.inkStory.variablesState[stat] !== this.gameState.stats[stat]) {
                        this.inkStory.variablesState[stat] = this.gameState.stats[stat];
                    }
                    
                    return actualChange;
                }
                return 0;
            });
            
            // Currency operations
            this.inkStory.BindExternalFunction("formatCurrency", (pence) => {
                return window.formatCurrency ? window.formatCurrency(pence) : `${pence}d`;
            });
            
            // Condition operations
            this.inkStory.BindExternalFunction("addCondition", (name, type = 'negative', duration = -1) => {
                if (window.addCondition) {
                    window.addCondition(name, type, duration);
                    
                    // Sync conditions to Ink
                    this.syncConditionsToInk();
                }
            });
            
            this.inkStory.BindExternalFunction("removeCondition", (name) => {
                if (window.removeCondition) {
                    window.removeCondition(name);
                    this.syncConditionsToInk();
                }
            });
            
            this.inkStory.BindExternalFunction("hasCondition", (name) => {
                return window.hasCondition ? window.hasCondition(name) : false;
            });
            
            // Combat system
            this.inkStory.BindExternalFunction("triggerCombat", (enemyId) => {
                if (window.triggerCombat) {
                    return window.triggerCombat(enemyId);
                }
                return Promise.resolve();
            });
            
            this.inkStory.BindExternalFunction("triggerSkirmish", (skirmishType) => {
                if (window.runSkirmish) {
                    return window.runSkirmish(skirmishType);
                }
                return Promise.resolve();
            });
            
            // UI operations
            this.inkStory.BindExternalFunction("showNotification", (title, message, type = 'info') => {
                if (window.showNotification) {
                    window.showNotification(title, message, type);
                }
            });
            
            // Stat calculations
            this.inkStory.BindExternalFunction("getEffectiveStat", (stat) => {
                return window.getEffectiveStat ? window.getEffectiveStat(stat) : (this.gameState.stats[stat] || 0);
            });
            
            this.inkStory.BindExternalFunction("rollDice", (modifier = 0) => {
                return window.rollDice ? window.rollDice(modifier) : Math.floor(Math.random() * 10) + 1 + modifier;
            });
            
            this.inkStory.BindExternalFunction("resolveAction", (stat, difficulty = 7, bonus = 0) => {
                return window.resolveAction ? window.resolveAction(stat, difficulty, bonus) : { roll: 0, success: false };
            });
            
            // Narrative authoring helper: boolean check wrapper
            this.inkStory.BindExternalFunction("doCheck", (stat, difficulty = 7, bonus = 0) => {
                const result = window.resolveAction ? window.resolveAction(stat, difficulty, bonus) : { roll: 0, success: false };
                // Optional debugging hook for UI/logging
                window.lastCheckResult = result;
                return !!result.success;
            });
            
            // Equipment checks (read-only)
            this.inkStory.BindExternalFunction("hasShieldEquipped", () => {
                return window.hasShieldEquipped ? window.hasShieldEquipped() : false;
            });
            
            // Chapter progress
            this.inkStory.BindExternalFunction("markChapterStarted", (chapterId) => {
                if (this.gameState.chapterProgress[chapterId]) {
                    this.gameState.chapterProgress[chapterId].started = true;
                    this.syncChapterProgressToInk();
                }
            });
            
            this.inkStory.BindExternalFunction("markChapterCompleted", (chapterId) => {
                if (this.gameState.chapterProgress[chapterId]) {
                    this.gameState.chapterProgress[chapterId].completed = true;
                    this.syncChapterProgressToInk();
                }
            });
        }
        
        /**
         * Sync gameState → Ink (initial sync)
         */
        syncFromGameState() {
            try {
                // First, ensure all gameState stats variables exist in the Ink story
                const statsToSync = ['strength', 'agility', 'endurance', 'charisma', 'luck', 'wits', 'wealth', 'reputation', 'morale', 'stress', 'experience', 'patronFavor'];
                
                statsToSync.forEach(stat => {
                    if (this.inkStory.variablesState[stat] === undefined) {
                        // Try to declare the variable by setting it
                        try {
                            this.inkStory.variablesState[stat] = this.gameState.stats[stat] || 0;
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
                
                // Sync chapter progress
                this.syncChapterProgressToInk();
                
                // Sync conditions
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
            Object.keys(this.gameState.chapterProgress).forEach(chapterId => {
                const progress = this.gameState.chapterProgress[chapterId];
                const startedVar = `chapter_${chapterId}_started`;
                const completedVar = `chapter_${chapterId}_completed`;
                
                // Only assign if variables exist in the story
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
            if (!this.gameState.conditions) return;
            
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
            
            // Set current conditions - only if variable exists in story
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
            const limits = window.statLimits && window.statLimits[stat];
            if (!limits) {
                console.warn(`No limits defined for stat: ${stat}`);
                return true; // Allow change if no limits defined
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
         * Clean up all observers and external functions
         */
        destroy() {
            // Remove all variable observers
            this.observers.forEach(({ stat, prop, observer }) => {
                if (stat) {
                    this.inkStory.RemoveVariableObserver(stat, observer);
                } else if (prop) {
                    this.inkStory.RemoveVariableObserver(prop, observer);
                }
            });
            
            // Clear references
            this.observers = [];
            this.externalFunctions = [];
            this.inkStory = null;
            this.gameState = null;
            
            console.log('Narrative bridge destroyed');
        }
    }
    
    // ============================================
    // State Validator
    // ============================================
    
    const StateValidator = {
        validateStatChange(stat, oldValue, newValue) {
            const limits = window.statLimits && window.statLimits[stat];
            if (!limits) {
                console.warn(`No limits defined for stat: ${stat}`);
                return false;
            }
            
            const isValid = newValue >= limits.min && newValue <= limits.max;
            if (!isValid) {
                console.error(`Invalid stat change: ${stat} from ${oldValue} to ${newValue} (limits: ${limits.min}-${limits.max})`);
            }
            return isValid;
        },
        
        validateStateIntegrity() {
            const issues = [];
            
            // Check for critical stat drift
            ['strength', 'agility', 'wealth', 'reputation', 'morale'].forEach(stat => {
                const gameValue = window.gameState?.stats[stat];
                const inkValue = window.inkStory?.variablesState[stat];
                
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
    };
    
    // ============================================
    // Public API
    // ============================================
    
    // Make available globally
    window.NarrativeBridge = NarrativeBridge;
    window.StateValidator = StateValidator;
    
    console.log('Narrative bridge module loaded');
    
})();
