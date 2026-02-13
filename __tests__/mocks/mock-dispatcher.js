// ============================================
// Mock Event Dispatcher for Testing
// Captures all dispatched events for validation
// ============================================

export class MockDispatcher {
  constructor() {
    this.dispatched = [];
    this.listeners = new Map();
    this.debug = false;
  }

  dispatch(event, payload = null, source = null) {
    // Normalize event format
    let eventObj;
    if (typeof event === 'string') {
      eventObj = { type: event, payload, source };
    } else if (typeof event === 'object' && event.type) {
      eventObj = { ...event, source: event.source || source };
    } else {
      console.warn('MockDispatcher: Invalid event format', event);
      return;
    }

    const { type } = eventObj;

    if (this.debug) {
      console.log(`📡 Mock Event: ${type}`, eventObj);
    }

    // Capture event for testing
    this.dispatched.push(eventObj);

    // Notify listeners if any
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(eventObj);
        } catch (error) {
          console.error(`MockDispatcher: Error in listener for ${type}:`, error);
        }
      });
    }
  }

  subscribe(type, fn) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(fn);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(type);
      if (listeners) {
        listeners.delete(fn);
        if (listeners.size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }

  clear() {
    this.dispatched = [];
    this.listeners.clear();
  }

  getLastEvent(type) {
    const events = this.dispatched.filter(e => e.type === type);
    return events.length > 0 ? events[events.length - 1] : null;
  }

  getEvents(type) {
    return this.dispatched.filter(e => e.type === type);
  }

  eventCount(type) {
    return this.getEvents(type).length;
  }

  wasEventDispatched(type) {
    return this.eventCount(type) > 0;
  }

  setDebug(enabled) {
    this.debug = enabled;
  }
}

export function createMockDispatcher() {
  return new MockDispatcher();
}
