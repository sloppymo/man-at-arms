export function createMockDispatcher() {
  const events = [];
  return {
    dispatch(type, payload) {
      events.push({ type, payload });
    },
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
