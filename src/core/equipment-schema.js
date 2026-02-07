// ============================================
// Man-at-Arms Equipment Schema v2
// Canonical layered equipment format
// ============================================

/**
 * Canonical Equipment Schema v2
 * Layered format supporting multiple armor layers per slot
 */

// Equipment slot definitions
export const EQUIPMENT_SLOTS = {
  head: {
    layers: ['base', 'padding', 'mail', 'plate'],
    displayName: 'Head'
  },
  torso: {
    layers: ['base', 'padding', 'mail', 'plate', 'surcoat'],
    displayName: 'Torso'
  },
  arms: {
    layers: ['base', 'padding', 'mail', 'plate'],
    displayName: 'Arms'
  },
  legs: {
    layers: ['base', 'padding', 'mail', 'plate'],
    displayName: 'Legs'
  },
  weapon: {
    layers: ['main', 'offhand'],
    displayName: 'Weapons'
  },
  missile: {
    layers: ['main'],
    displayName: 'Missile Weapon'
  },
  accessory: {
    layers: ['primary'],
    displayName: 'Accessory'
  },
  bag: {
    layers: [], // Special case: array of items
    displayName: 'Bag'
  }
};

// Layer definitions
export const LAYER_TYPES = {
  base: {
    displayName: 'Base Layer',
    description: 'Underwear, shirts, or base clothing'
  },
  padding: {
    displayName: 'Padding',
    description: 'Aketon, gambeson, or padded armor'
  },
  mail: {
    displayName: 'Mail',
    description: 'Chainmail, haubergeon, or mail armor'
  },
  plate: {
    displayName: 'Plate',
    description: 'Metal plates or full plate armor'
  },
  surcoat: {
    displayName: 'Surcoat',
    description: 'Outer garment for display/identification'
  },
  main: {
    displayName: 'Main Weapon',
    description: 'Primary weapon or tool'
  },
  offhand: {
    displayName: 'Offhand',
    description: 'Shield, secondary weapon, or accessory'
  },
  primary: {
    displayName: 'Accessory',
    description: 'Belts, pouches, jewelry, etc.'
  }
};

// Item specification structure
export const ITEM_SPEC = {
  id: 'string',           // Unique item identifier
  name: 'string',         // Display name
  condition: 'number',    // 0-100 (wear/damage state)
  fit: 'string'          // 'off-the-rack' | 'tailored' | 'custom'
};

// Layer specification structure
export const LAYER_SPEC = {
  id: 'string',           // Item ID in this layer
  condition: 'number',    // 0-100
  fit: 'string'          // fit quality
};

// Canonical equipment structure validator
export function isValidEquipmentStructure(equipment) {
  if (!equipment || typeof equipment !== 'object') return false;

  // Check all required slots exist
  for (const slot of Object.keys(EQUIPMENT_SLOTS)) {
    if (!(slot in equipment)) return false;

    const slotDef = EQUIPMENT_SLOTS[slot];

    // Special handling for bag (array)
    if (slot === 'bag') {
      if (!Array.isArray(equipment[slot])) return false;
      continue;
    }

    // Check slot is object
    if (typeof equipment[slot] !== 'object' || equipment[slot] === null) return false;

    // Check all defined layers exist (even if empty)
    for (const layer of slotDef.layers) {
      if (!(layer in equipment[slot])) return false;
    }
  }

  return true;
}

// Create empty canonical equipment structure
export function createEmptyEquipment() {
  const equipment = {};

  for (const [slot, slotDef] of Object.entries(EQUIPMENT_SLOTS)) {
    if (slot === 'bag') {
      equipment[slot] = [];
      continue;
    }

    equipment[slot] = {};
    for (const layer of slotDef.layers) {
      equipment[slot][layer] = null; // Empty layer
    }
  }

  return equipment;
}

// Validate individual item specification
export function isValidItemSpec(item) {
  if (!item || typeof item !== 'object') return false;

  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    typeof item.name === 'string' &&
    typeof item.condition === 'number' &&
    item.condition >= 0 &&
    item.condition <= 100 &&
    ['off-the-rack', 'tailored', 'custom'].includes(item.fit)
  );
}

// Get all equipped items across all layers
export function getAllEquippedItems(equipment) {
  const items = [];

  for (const [slotName, slot] of Object.entries(equipment)) {
    if (slotName === 'bag') {
      // Bag is special: array of items
      for (const bagItem of slot) {
        if (bagItem && bagItem.id) {
          items.push({
            ...bagItem,
            slot: 'bag',
            layer: 'bag'
          });
        }
      }
      continue;
    }

    for (const [layerName, layerItem] of Object.entries(slot)) {
      if (layerItem && layerItem.id) {
        items.push({
          ...layerItem,
          slot: slotName,
          layer: layerName
        });
      }
    }
  }

  return items;
}

// Calculate derived stats from equipment (placeholder for Phase 2+)
export function calculateEquipmentStats(equipment) {
  // This will be implemented when we have the equipment database
  return {
    armorClass: 0,
    mobilityPenalty: 0,
    stealthPenalty: 0,
    heatPenalty: 0,
    totalWeight: 0
  };
}
