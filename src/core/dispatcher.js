// ============================================
// Man-at-Arms Event Dispatcher
// Tiny pub/sub system for centralized game flow control
// ============================================

/**
 * Simple event dispatcher for decoupling game systems
 * Based on pub/sub pattern with type-safe event handling
 */
class EventDispatcher {
  constructor() {
    this._listeners = new Map();
    this._debug = false; // Set to true for development logging
  }

  /**
   * Subscribe to an event type
   * @param {string} type - Event type to listen for
   * @param {Function} fn - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(type, fn) {
    if (!this._listeners.has(type)) {
      this._listeners.set(type, new Set());
    }

    const listeners = this._listeners.get(type);
    listeners.add(fn);

    // Return unsubscribe function
    return () => {
      listeners.delete(fn);
      if (listeners.size === 0) {
        this._listeners.delete(type);
      }
    };
  }

  /**
   * Dispatch an event to all subscribers
   * @param {Object|string} event - Event object or string
   * @param {*} payload - Event payload (if event is string)
   * @param {string} source - Source identifier for debugging
   */
  dispatch(event, payload = null, source = null) {
    // Normalize event format
    let eventObj;
    if (typeof event === 'string') {
      eventObj = { type: event, payload, source };
    } else if (typeof event === 'object' && event.type) {
      eventObj = { ...event, source: event.source || source };
    } else {
      console.warn('EventDispatcher: Invalid event format', event);
      return;
    }

    const { type } = eventObj;

    if (this._debug) {
      console.log(`📡 Event: ${type}`, eventObj);
    }

    const listeners = this._listeners.get(type);
    if (!listeners || listeners.size === 0) {
      if (this._debug) {
        console.log(`📡 No listeners for: ${type}`);
      }
      return;
    }

    // Create snapshot to avoid modification during iteration
    const snapshot = Array.from(listeners);

    // Dispatch to all listeners
    for (const listener of snapshot) {
      try {
        listener(eventObj);
      } catch (error) {
        console.error(`EventDispatcher: Error in listener for ${type}:`, error);
      }
    }
  }

  /**
   * Get listener count for a specific event type
   * @param {string} type - Event type
   * @returns {number} Number of listeners
   */
  listenerCount(type) {
    const listeners = this._listeners.get(type);
    return listeners ? listeners.size : 0;
  }

  /**
   * Get all event types with listeners
   * @returns {string[]} Array of event types
   */
  getEventTypes() {
    return Array.from(this._listeners.keys());
  }

  /**
   * Clear all listeners (useful for testing/reset)
   */
  clear() {
    this._listeners.clear();
  }

  /**
   * Enable/disable debug logging
   * @param {boolean} enabled
   */
  setDebug(enabled) {
    this._debug = enabled;
  }
}

// ============================================
// Singleton Instance
// ============================================

export const dispatcher = new EventDispatcher();

// ============================================
// Common Event Types (for consistency)
// ============================================

export const EVENT_TYPES = {
  // Game flow
  GAME_START: 'GAME_START',
  GAME_LOAD: 'GAME_LOAD',
  GAME_SAVE: 'GAME_SAVE',
  GAME_RESET: 'GAME_RESET',

  // Mode changes
  MODE_CHANGE: 'MODE_CHANGE',

  // Screen/UI changes
  OPEN_EQUIPMENT: 'OPEN_EQUIPMENT',
  CLOSE_EQUIPMENT: 'CLOSE_EQUIPMENT',
  OPEN_CHARACTER_CREATION: 'OPEN_CHARACTER_CREATION',
  START_DIALOGUE: 'START_DIALOGUE',
  END_DIALOGUE: 'END_DIALOGUE',

  // Character/Stat changes
  STAT_CHANGE: 'STAT_CHANGE',
  LEVEL_UP: 'LEVEL_UP',
  EXPERIENCE_CHANGE: 'EXPERIENCE_CHANGE',

  // Equipment changes
  EQUIPMENT_CHANGE: 'EQUIPMENT_CHANGE',
  INVENTORY_CHANGE: 'INVENTORY_CHANGE',

  // Combat events
  COMBAT_START: 'COMBAT_START',
  COMBAT_END: 'COMBAT_END',

  // Narrative events
  SCENE_CHANGE: 'SCENE_CHANGE',
  CHOICE_MADE: 'CHOICE_MADE',

  // System events
  ERROR: 'ERROR',
  DEBUG: 'DEBUG'
};

// ============================================
// Backward Compatibility
// ============================================

if (typeof window !== 'undefined') {
  window.dispatcher = dispatcher;
  window.EVENT_TYPES = EVENT_TYPES;
}
