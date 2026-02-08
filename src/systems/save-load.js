// ============================================
// Man-at-Arms Save/Load System
// ES module implementation with event integration
// ============================================

import { gameState, hydrateLoadedState } from '../core/gameState.js';
import { dispatcher, EVENT_TYPES } from '../core/dispatcher.js';
import { getErrorHandler } from '../core/error-handler.js';
import { SAVE_SCHEMA_VERSION } from '../core/constants.js';
import { migrateSavePayload } from '../core/save-migration.js';

/**
 * Save current game state to localStorage
 * Uses hydrateLoadedState for data sanitization before saving
 */
export function saveGame() {
  try {
    // Prepare data using hydrateLoadedState for consistency
    const gameStateData = hydrateLoadedState(gameState);

    // Wrap with schema versioning
    const dataToSave = {
      schemaVersion: SAVE_SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      gameState: gameStateData
    };

    // Convert to JSON string
    const saveData = JSON.stringify(dataToSave);

    // Save to localStorage
    localStorage.setItem('manAtArmsGame', saveData);

    // Dispatch success event
    dispatcher.dispatch(EVENT_TYPES.GAME_SAVE, {
      success: true,
      timestamp: new Date().toISOString(),
      dataSize: saveData.length
    });

    // Show success notification via dispatcher
    dispatcher.dispatch('SHOW_NOTIFICATION', {
      type: 'success',
      title: 'Game Saved',
      message: 'Your progress has been saved successfully.'
    });

    console.log('Game saved successfully');
    return true;

  } catch (error) {
    console.error('Error saving game:', error);

    // Report error via error handler
    const errorHandler = getErrorHandler();
    if (errorHandler) {
      errorHandler.reportError(error, {
        source: 'save',
        operation: 'saveGame',
        gameState: gameState.mode
      });
    }

    // Dispatch error event
    dispatcher.dispatch(EVENT_TYPES.ERROR, {
      type: 'SAVE_ERROR',
      error: error.message,
      recoverable: true
    });

    // Show error notification
    dispatcher.dispatch('SHOW_NOTIFICATION', {
      type: 'error',
      title: 'Save Failed',
      message: `Unable to save game: ${error.message}`
    });

    return false;
  }
}

/**
 * Load game state from localStorage
 * Uses hydrateLoadedState for migration and validation
 */
export function loadGame() {
  try {
    // Get data from localStorage
    const saveData = localStorage.getItem('manAtArmsGame');

    if (!saveData) {
      throw new Error('No saved game found');
    }

    // Parse JSON
    const loadedData = JSON.parse(saveData);

    // Migrate save payload to current schema
    const migratedPayload = migrateSavePayload(loadedData);

    // Extract gameState from migrated payload
    const gameStateData = migratedPayload.gameState;

    // Validate and migrate data using hydrateLoadedState
    const hydratedState = hydrateLoadedState(gameStateData);

    // Update game state
    Object.assign(gameState, hydratedState);

    // Dispatch success event
    dispatcher.dispatch(EVENT_TYPES.GAME_LOAD, {
      success: true,
      timestamp: new Date().toISOString(),
      schemaVersion: migratedPayload.schemaVersion
    });

    // Show success notification
    dispatcher.dispatch('SHOW_NOTIFICATION', {
      type: 'success',
      title: 'Game Loaded',
      message: 'Your saved game has been loaded successfully.'
    });

    // Dispatch state update event to refresh UI
    dispatcher.dispatch('STATE_UPDATE', {
      source: 'loadGame',
      fullUpdate: true
    });

    console.log('Game loaded successfully');
    return true;

  } catch (error) {
    console.error('Error loading game:', error);

    // Report error via error handler
    const errorHandler = getErrorHandler();
    if (errorHandler) {
      errorHandler.reportError(error, {
        source: 'load',
        operation: 'loadGame',
        gameState: gameState.mode
      });
    }

    // Dispatch error event
    dispatcher.dispatch(EVENT_TYPES.ERROR, {
      type: 'LOAD_ERROR',
      error: error.message,
      recoverable: true
    });

    // Show error notification
    dispatcher.dispatch('SHOW_NOTIFICATION', {
      type: 'error',
      title: 'Load Failed',
      message: `Unable to load saved game: ${error.message}`
    });

    return false;
  }
}
