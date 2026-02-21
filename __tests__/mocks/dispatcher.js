export function createMockDispatcher() {
  const events = [];
  const listeners = new Map();

  const subscribe = (type, handler) => {
    if (!listeners.has(type)) {
      listeners.set(type, []);
    }
    listeners.get(type).push(handler);
    return () => {
      const typeListeners = listeners.get(type) || [];
      listeners.set(type, typeListeners.filter(fn => fn !== handler));
    };
  };

  return {
    dispatch(type, payload) {
      events.push({ type, payload });
      const typeListeners = listeners.get(type) || [];
      for (const listener of typeListeners) {
        listener({ type, payload });
      }
    },
    subscribe,
    get events() {
      return events;
    },
    get lastEvent() {
      return events[events.length - 1];
    },
    getEvents() {
      return events;
    },
    clear() {
      events.length = 0;
      listeners.clear();
    },
    getLastEvent(type) {
      const typeEvents = events.filter(e => e.type === type);
      return typeEvents.length > 0 ? typeEvents[typeEvents.length - 1] : null;
    },
    getEvents(type) {
      return events.filter(e => e.type === type);
    },
    wasEventDispatched(type) {
      return events.some(e => e.type === type);
    }
  };
}
