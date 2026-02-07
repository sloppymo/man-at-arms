// ============================================
// Equipment Migration System
// Converts legacy v1 equipment to canonical v2 layered format
// ============================================

import { createEmptyEquipment, isValidItemSpec, EQUIPMENT_SLOTS } from './equipment-schema.js';

/**
 * Migrate legacy equipment format to canonical v2 layered format
 * @param {Object} legacyEquipment - Legacy equipment object
 * @returns {Object} Canonical v2 equipment structure
 */
export function migrateEquipment(legacyEquipment) {
  if (!legacyEquipment || typeof legacyEquipment !== 'object') {
    console.warn('migrateEquipment: Invalid legacy equipment, using empty structure');
    return createEmptyEquipment();
  }

  // Start with empty canonical structure
  const canonical = createEmptyEquipment();

  // Migrate each legacy slot
  for (const [slotName, slotData] of Object.entries(legacyEquipment)) {
    if (!(slotName in EQUIPMENT_SLOTS)) {
      console.warn(`migrateEquipment: Unknown slot '${slotName}', skipping`);
      continue;
    }

    // Special handling for bag (already an array in legacy)
    if (slotName === 'bag') {
      if (Array.isArray(slotData)) {
        canonical.bag = slotData.filter(item => {
          if (!item || !item.id) return false;
          // Validate and sanitize bag items
          return {
            id: String(item.id),
            name: item.name || 'Unknown Item',
            condition: Math.max(0, Math.min(100, Number(item.condition) || 100)),
            fit: item.fit || 'off-the-rack'
          };
        });
      }
      continue;
    }

    // Handle other slots (convert from various legacy formats)
    migrateSlot(slotName, slotData, canonical);
  }

  return canonical;
}

/**
 * Migrate a single equipment slot from legacy to canonical format
 * @param {string} slotName - Slot name (head, torso, etc.)
 * @param {*} slotData - Legacy slot data
 * @param {Object} canonical - Canonical equipment structure to update
 */
function migrateSlot(slotName, slotData, canonical) {
  const slotDef = EQUIPMENT_SLOTS[slotName];

  // Handle different legacy formats
  if (!slotData || typeof slotData !== 'object') {
    // Empty or invalid slot - leave as null
    return;
  }

  // Check if it's already layered format (v2)
  if (slotDef.layers.some(layer => layer in slotData)) {
    // Already v2 format, copy as-is but validate
    for (const layer of slotDef.layers) {
      const layerItem = slotData[layer];
      if (layerItem && layerItem.id) {
        canonical[slotName][layer] = sanitizeItemSpec(layerItem);
      }
    }
    return;
  }

  // Legacy flat format - need to infer layer
  // This is the complex part: map legacy items to appropriate layers

  if (slotName === 'weapon') {
    migrateWeaponSlot(slotData, canonical);
  } else if (slotName === 'accessory') {
    migrateAccessorySlot(slotData, canonical);
  } else {
    // Armor slots: head, torso, arms, legs
    migrateArmorSlot(slotName, slotData, canonical);
  }
}

/**
 * Migrate weapon slot (special handling for main/offhand)
 */
function migrateWeaponSlot(slotData, canonical) {
  // Legacy weapon slot might have: primary, secondary, or direct item
  if (slotData.primary || slotData.main) {
    const item = slotData.primary || slotData.main;
    if (item && item.id) {
      canonical.weapon.main = sanitizeItemSpec(item);
    }
  }

  if (slotData.secondary || slotData.offhand) {
    const item = slotData.secondary || slotData.offhand;
    if (item && item.id) {
      canonical.weapon.offhand = sanitizeItemSpec(item);
    }
  }

  // Handle direct item assignment (legacy)
  if (slotData.id && !canonical.weapon.main) {
    canonical.weapon.main = sanitizeItemSpec(slotData);
  }
}

/**
 * Migrate accessory slot
 */
function migrateAccessorySlot(slotData, canonical) {
  // Accessory typically goes to primary layer
  if (slotData.id || slotData.item) {
    const item = slotData.item || slotData;
    if (item && item.id) {
      canonical.accessory.primary = sanitizeItemSpec(item);
    }
  }
}

/**
 * Migrate armor slot (head, torso, arms, legs)
 * This requires some heuristics to determine appropriate layer
 */
function migrateArmorSlot(slotName, slotData, canonical) {
  if (!slotData.id && !slotData.item) {
    return; // Empty slot
  }

  const item = slotData.item || slotData;
  if (!item || !item.id) {
    return;
  }

  // Heuristic: determine layer based on item type
  // This is a simplified version - in practice, you'd need item database lookup
  const layer = inferArmorLayer(slotName, item.id);

  if (layer) {
    canonical[slotName][layer] = sanitizeItemSpec(item);
  } else {
    // Default to base layer if can't determine
    console.warn(`migrateEquipment: Could not determine layer for ${slotName}:${item.id}, using 'base'`);
    canonical[slotName].base = sanitizeItemSpec(item);
  }
}

/**
 * Infer appropriate armor layer from item ID
 * This is a heuristic - production version should use item database
 */
function inferArmorLayer(slotName, itemId) {
  if (!itemId || typeof itemId !== 'string') return null;

  const id = itemId.toLowerCase();

  // Mail items
  if (id.includes('mail') || id.includes('haubergeon') || id.includes('chain')) {
    return 'mail';
  }

  // Plate items
  if (id.includes('plate') || id.includes('cuirass') || id.includes('breastplate')) {
    return 'plate';
  }

  // Padding items
  if (id.includes('gambeson') || id.includes('aketon') || id.includes('padded')) {
    return 'padding';
  }

  // Surcoat (torso only)
  if (slotName === 'torso' && (id.includes('surcoat') || id.includes('tunic') || id.includes('tabard'))) {
    return 'surcoat';
  }

  // Default to base for clothing
  if (id.includes('shirt') || id.includes('hose') || id.includes('tunic') || id.includes('cloth')) {
    return 'base';
  }

  // Unknown - let caller decide
  return null;
}

/**
 * Sanitize and validate item specification
 * @param {*} item - Raw item data
 * @returns {Object|null} Sanitized item spec or null
 */
function sanitizeItemSpec(item) {
  if (!item || !item.id) return null;

  return {
    id: String(item.id),
    name: item.name ? String(item.name) : 'Unknown Item',
    condition: Math.max(0, Math.min(100, Number(item.condition) || 100)),
    fit: ['off-the-rack', 'tailored', 'custom'].includes(item.fit) ? item.fit : 'off-the-rack'
  };
}

/**
 * Dry-run migration (for testing without modifying data)
 * @param {Object} legacyEquipment - Legacy equipment to test
 * @returns {Object} Migration result with validation
 */
export function dryRunMigration(legacyEquipment) {
  const migrated = migrateEquipment(legacyEquipment);

  return {
    migrated,
    isValid: isValidEquipmentStructure(migrated),
    itemCount: countEquipmentItems(migrated),
    legacyItemCount: countEquipmentItems(legacyEquipment)
  };
}

/**
 * Count total equipped items
 * @param {Object} equipment - Equipment structure
 * @returns {number} Item count
 */
function countEquipmentItems(equipment) {
  if (!equipment) return 0;

  let count = 0;

  for (const [slotName, slot] of Object.entries(equipment)) {
    if (slotName === 'bag') {
      count += Array.isArray(slot) ? slot.length : 0;
      continue;
    }

    if (typeof slot === 'object' && slot !== null) {
      for (const layerItem of Object.values(slot)) {
        if (layerItem && layerItem.id) count++;
      }
    }
  }

  return count;
}

/**
 * Validate migration preserves all items
 * @param {Object} legacy - Legacy equipment
 * @param {Object} migrated - Migrated equipment
 * @returns {Object} Validation result
 */
export function validateMigration(legacy, migrated) {
  const legacyCount = countEquipmentItems(legacy);
  const migratedCount = countEquipmentItems(migrated);

  return {
    itemCountPreserved: legacyCount === migratedCount,
    legacyCount,
    migratedCount,
    isValidStructure: isValidEquipmentStructure(migrated)
  };
}
