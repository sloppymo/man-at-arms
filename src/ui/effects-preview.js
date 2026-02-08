// ============================================
// Man-at-Arms Effects Preview Toggle
// ES module implementation for equipment effects preview
// ============================================

import { gameState } from '../core/gameState.js';
import { dispatcher } from '../core/dispatcher.js';
import { getErrorHandler } from '../core/error-handler.js';

/**
 * Toggle display of equipment stat effects
 * Tracks toggle state and updates UI accordingly
 */
export function toggleEffectsPreview() {
  try {
    // Initialize effects preview state if not exists
    if (typeof gameState.effectsPreviewEnabled === 'undefined') {
      gameState.effectsPreviewEnabled = false;
    }

    // Toggle the state
    gameState.effectsPreviewEnabled = !gameState.effectsPreviewEnabled;

    // Store in localStorage for persistence
    localStorage.setItem('manAtArmsEffectsPreview', gameState.effectsPreviewEnabled.toString());

    // Update UI elements if they exist
    const effectsToggle = document.getElementById('effects-toggle');
    if (effectsToggle) {
      effectsToggle.textContent = gameState.effectsPreviewEnabled ? 'Hide Effects' : 'Show Effects';
      effectsToggle.classList.toggle('active', gameState.effectsPreviewEnabled);
    }

    // Add/remove CSS class to body for global effects styling
    document.body.classList.toggle('effects-preview-enabled', gameState.effectsPreviewEnabled);

    // Dispatch event
    dispatcher.dispatch(EVENT_TYPES.EFFECTS_PREVIEW_TOGGLED, {
      enabled: gameState.effectsPreviewEnabled,
      timestamp: new Date().toISOString()
    });

    // Show notification
    dispatcher.dispatch('SHOW_NOTIFICATION', {
      type: 'info',
      title: 'Effects Preview',
      message: gameState.effectsPreviewEnabled
        ? 'Equipment effects preview enabled'
        : 'Equipment effects preview disabled'
    });

    console.log(`Effects preview ${gameState.effectsPreviewEnabled ? 'enabled' : 'disabled'}`);
    return gameState.effectsPreviewEnabled;

  } catch (error) {
    console.error('Error in toggleEffectsPreview:', error);

    // Report error
    const errorHandler = getErrorHandler();
    if (errorHandler) {
      errorHandler.reportError(error, {
        source: 'ui',
        operation: 'toggleEffectsPreview'
      });
    }

    return false;
  }
}

/**
 * Initialize effects preview state from localStorage
 * Should be called during game initialization
 */
export function initializeEffectsPreview() {
  try {
    // Load from localStorage
    const stored = localStorage.getItem('manAtArmsEffectsPreview');
    if (stored !== null) {
      gameState.effectsPreviewEnabled = stored === 'true';
    } else {
      gameState.effectsPreviewEnabled = false;
    }

    // Apply initial state to UI
    document.body.classList.toggle('effects-preview-enabled', gameState.effectsPreviewEnabled);

    const effectsToggle = document.getElementById('effects-toggle');
    if (effectsToggle) {
      effectsToggle.textContent = gameState.effectsPreviewEnabled ? 'Hide Effects' : 'Show Effects';
      effectsToggle.classList.toggle('active', gameState.effectsPreviewEnabled);
    }

    console.log(`Effects preview initialized: ${gameState.effectsPreviewEnabled ? 'enabled' : 'disabled'}`);
    return gameState.effectsPreviewEnabled;

  } catch (error) {
    console.warn('Error initializing effects preview:', error);
    gameState.effectsPreviewEnabled = false;
    return false;
  }
}
