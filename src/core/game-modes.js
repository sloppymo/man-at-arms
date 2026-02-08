// ============================================
// Man-at-Arms Game Modes
// Centralized mode state management and validation
// ============================================

/**
 * Game mode constants - represents current UI/game state
 */
export const GameMode = {
  // Core modes
  TITLE: 'title',
  CHARACTER_CREATION: 'character_creation',
  DIALOGUE: 'dialogue',
  CAMP: 'camp',
  EQUIPMENT: 'equipment',
  ENCOUNTER: 'encounter',
  OVERWORLD: 'overworld',

  // Special modes
  COMBAT: 'combat',
  DEATH: 'death',
  ENDING: 'ending',
  LOADING: 'loading'
};

/**
 * Mode transitions that are allowed
 * Prevents invalid state changes
 */
const ALLOWED_TRANSITIONS = {
  [GameMode.TITLE]: [GameMode.CHARACTER_CREATION, GameMode.DIALOGUE, GameMode.EQUIPMENT],
  [GameMode.CHARACTER_CREATION]: [GameMode.DIALOGUE, GameMode.CAMP],
  [GameMode.DIALOGUE]: [
    GameMode.CAMP,
    GameMode.EQUIPMENT,
    GameMode.ENCOUNTER,
    GameMode.OVERWORLD,
    GameMode.COMBAT,
    GameMode.DEATH,
    GameMode.ENDING
  ],
  [GameMode.CAMP]: [GameMode.DIALOGUE, GameMode.EQUIPMENT],
  [GameMode.EQUIPMENT]: [GameMode.CAMP, GameMode.DIALOGUE],
  [GameMode.ENCOUNTER]: [GameMode.DIALOGUE, GameMode.COMBAT, GameMode.DEATH],
  [GameMode.OVERWORLD]: [GameMode.ENCOUNTER, GameMode.DIALOGUE],
  [GameMode.COMBAT]: [GameMode.DIALOGUE, GameMode.DEATH, GameMode.CAMP],
  [GameMode.DEATH]: [GameMode.TITLE],
  [GameMode.ENDING]: [GameMode.TITLE],
  [GameMode.LOADING]: Object.values(GameMode) // Loading can transition to anything
};

/**
 * Check if a mode transition is valid
 * @param {string} fromMode - Current mode
 * @param {string} toMode - Target mode
 * @returns {boolean} True if transition is allowed
 */
export function isValidTransition(fromMode, toMode) {
  if (!fromMode || !toMode) return false;

  const allowed = ALLOWED_TRANSITIONS[fromMode];
  return allowed && allowed.includes(toMode);
}

/**
 * Get all valid transitions from a mode
 * @param {string} fromMode - Current mode
 * @returns {string[]} Array of valid target modes
 */
export function getValidTransitions(fromMode) {
  return ALLOWED_TRANSITIONS[fromMode] || [];
}

/**
 * Check if a mode is valid
 * @param {string} mode - Mode to validate
 * @returns {boolean} True if mode exists
 */
export function isValidMode(mode) {
  return Object.values(GameMode).includes(mode);
}

/**
 * Set the current game mode with validation
 * @param {Object} gameState - Game state object
 * @param {string} newMode - New mode to set
 * @param {Object} options - Options
 * @returns {boolean} True if mode was changed
 */
export function setMode(gameState, newMode, options = {}) {
  if (!gameState) {
    console.error('setMode: gameState is required');
    return false;
  }

  if (!isValidMode(newMode)) {
    console.error(`setMode: Invalid mode '${newMode}'`);
    return false;
  }

  const currentMode = gameState.mode || GameMode.TITLE;

  if (currentMode === newMode) {
    // Already in this mode
    return true;
  }

  if (!isValidTransition(currentMode, newMode)) {
    console.warn(`setMode: Invalid transition from '${currentMode}' to '${newMode}'`);

    // Allow anyway if force option is set (for debugging/emergencies)
    if (!options.force) {
      return false;
    }
  }

  const oldMode = gameState.mode;
  gameState.mode = newMode;

  // Dispatch mode change event if dispatcher is available
  if (typeof window !== 'undefined' && window.dispatcher) {
    window.dispatcher.dispatch('MODE_CHANGE', {
      from: oldMode,
      to: newMode,
      forced: options.force || false
    }, 'game-modes');
  }

  if (options.debug || (typeof window !== 'undefined' && window.dispatcher && window.dispatcher._debug)) {
    console.log(`🎮 Mode changed: ${oldMode} → ${newMode}`);
  }

  return true;
}

/**
 * Initialize game state with default mode
 * @param {Object} gameState - Game state to initialize
 * @returns {Object} Updated game state
 */
export function initializeGameState(gameState) {
  if (!gameState) return gameState;

  // Set initial mode if not set
  if (!gameState.mode) {
    gameState.mode = GameMode.TITLE;
  }

  return gameState;
}

/**
 * Get mode display name for UI
 * @param {string} mode - Mode constant
 * @returns {string} Human-readable name
 */
export function getModeDisplayName(mode) {
  const names = {
    [GameMode.TITLE]: 'Title Screen',
    [GameMode.CHARACTER_CREATION]: 'Character Creation',
    [GameMode.DIALOGUE]: 'Story Dialogue',
    [GameMode.CAMP]: 'Campfire',
    [GameMode.EQUIPMENT]: 'Equipment',
    [GameMode.ENCOUNTER]: 'Encounter',
    [GameMode.OVERWORLD]: 'Overworld',
    [GameMode.COMBAT]: 'Combat',
    [GameMode.DEATH]: 'Death',
    [GameMode.ENDING]: 'Ending',
    [GameMode.LOADING]: 'Loading'
  };

  return names[mode] || mode;
}

// ============================================
// Backward Compatibility
// ============================================

if (typeof window !== 'undefined') {
  window.GameMode = GameMode;
  window.isValidTransition = isValidTransition;
  window.getValidTransitions = getValidTransitions;
  window.isValidMode = isValidMode;
  window.setMode = setMode;
  window.initializeGameState = initializeGameState;
  window.getModeDisplayName = getModeDisplayName;
}
