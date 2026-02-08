// ============================================
// Save Migration System
// Handles save payload versioning and migration
// ============================================

import { SAVE_SCHEMA_VERSION } from './constants.js';
import { migrateEquipment } from './equipment-migration.js';

/**
 * Migrate save payload from old schema versions to current
 * @param {Object} payload - Raw save payload from localStorage
 * @returns {Object} Migrated payload with current schema version
 */
export function migrateSavePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid save payload: must be an object');
  }

  try {
    // Determine starting version
    let currentVersion = Number(payload.schemaVersion) || 0;

    // Apply migrations sequentially
    while (currentVersion < SAVE_SCHEMA_VERSION) {
      const migration = migrations[currentVersion];
      if (!migration) {
        console.warn(`No migration found for version ${currentVersion}, skipping to ${SAVE_SCHEMA_VERSION}`);
        break;
      }

      console.log(`Migrating save from schema v${currentVersion} to v${currentVersion + 1}`);
      payload = migration(payload);
      currentVersion = Number(payload.schemaVersion);
    }

    // Ensure final version is set
    payload.schemaVersion = SAVE_SCHEMA_VERSION;

    return payload;

  } catch (error) {
    console.error('Save migration failed:', error);
    // Return original payload if migration fails
    return payload;
  }
}

/**
 * Migration functions: each transforms payload from vN to v{N+1}
 * Array indexed by starting version number
 */
const migrations = [
  // migrations[0]: v0 -> v1 (wrap unwrapped gameState)
  function migrateV0ToV1(payload) {
    // If payload already has schemaVersion, it's not v0
    if ('schemaVersion' in payload) {
      return payload;
    }

    // Assume payload is the old unwrapped gameState
    return {
      schemaVersion: 1,
      savedAt: new Date().toISOString(),
      gameState: payload
    };
  },

  // migrations[1]: v1 -> v2 (equipment already migrated in hydrateLoadedState)
  function migrateV1ToV2(payload) {
    // Migrate equipment to canonical layered format
    if (payload.gameState && payload.gameState.equipment) {
      payload.gameState.equipment = migrateEquipment(payload.gameState.equipment);
    }
    // Update schema version
    payload.schemaVersion = 2;
    return payload;
  },

  // migrations[2]: v2 -> v3 (add overworld state)
  function migrateV2ToV3(payload) {
    if (payload.gameState && !payload.gameState.overworld) {
      payload.gameState.overworld = {
        time: 480,          // minutes since start (8:00 AM)
        heat: 0,            // 0-100 pursuit level
        fatigue: 0,         // 0-100 fatigue level
        position: { q: 0, r: 0 },  // axial hex coordinates
        discovered: [],     // discovered hexes as array for serialization
        encounterSeed: Math.random().toString(36).substring(2), // random seed string
        supplies: {
          food: 3,          // days worth
          arrows: 20,
          coin: 0
        }
      };
    }
    // Update schema version
    payload.schemaVersion = 3;
    return payload;
  }
];
