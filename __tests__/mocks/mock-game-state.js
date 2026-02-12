// ============================================
// Mock Game State for Testing
// Provides realistic gameState with stats and overworld
// ============================================

export class MockGameState {
  constructor(initialState = {}) {
    this.stats = {
      strength: 10,
      charisma: 8,
      agility: 12,
      perception: 9,
      health: 10,
      morale: 5,
      reputation: 0,
      wealth: 50,
      ...initialState.stats
    };

    this.overworld = {
      time: 100,
      heat: 5,
      position: { x: 100, y: 100 },
      region: 'normandy',
      ...initialState.overworld
    };

    this.inventory = {
      food: 10,
      water: 5,
      coins: 25,
      ...initialState.inventory
    };

    this.conditions = [],
    this.flags = {},
    ...initialState
  }

  // Helper methods for testing
  getStat(statName) {
    return this.stats[statName] || 0;
  }

  setStat(statName, value) {
    this.stats[statName] = value;
  }

  changeStat(statName, delta) {
    const current = this.getStat(statName);
    this.stats[statName] = current + delta;
    return this.stats[statName];
  }

  getOverworld(prop) {
    return this.overworld[prop] || 0;
  }

  setOverworld(prop, value) {
    this.overworld[prop] = value;
  }

  addItem(itemId, quantity = 1) {
    if (!this.inventory[itemId]) {
      this.inventory[itemId] = 0;
    }
    this.inventory[itemId] += quantity;
  }

  hasItem(itemId) {
    return this.inventory[itemId] && this.inventory[itemId] > 0;
  }

  consumeItem(itemId, quantity = 1) {
    if (this.hasItem(itemId)) {
      this.inventory[itemId] -= quantity;
      if (this.inventory[itemId] <= 0) {
        delete this.inventory[itemId];
      }
      return true;
    }
    return false;
  }

  addCondition(condition, type = 'neutral', duration = 0) {
    this.conditions.push({
      name: condition,
      type,
      duration,
      remaining: duration
    });
  }

  hasCondition(condition) {
    return this.conditions.some(c => c.name === condition);
  }

  removeCondition(condition) {
    this.conditions = this.conditions.filter(c => c.name !== condition);
  }

  reset() {
    this.stats = {
      strength: 10,
      charisma: 8,
      agility: 12,
      perception: 9,
      health: 10,
      morale: 5,
      reputation: 0,
      wealth: 50
    };
    this.overworld = {
      time: 100,
      heat: 5,
      position: { x: 100, y: 100 },
      region: 'normandy'
    };
    this.inventory = {
      food: 10,
      water: 5,
      coins: 25
    };
    this.conditions = [];
    this.flags = {};
  }

  clone() {
    return new MockGameState(JSON.parse(JSON.stringify(this)));
  }
}

export function createMockGameState(initialState = {}) {
  return new MockGameState(initialState);
}
