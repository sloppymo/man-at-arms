// ============================================
// Man-at-Arms Main Entry Point
// Vite-bundled ES Module with backward compatibility
// ============================================

// Core modules (ES module exports + window globals for compatibility)
import { CHAPTERS, PATRONS, KIT_TIER_MAP, statLimits } from './core/constants.js';
import { gameState, makeDefaultGameState, hydrateLoadedState } from './core/gameState.js';
import {
  clampStat,
  applyStatChange,
  escapeHTML,
  rollDice,
  resolveAction,
  normalizeRegion,
  normalizeSocialClass,
  normalizeSlot,
  hasShieldEquipped,
  checkLevelUp,
  getEffectiveStat
} from './core/utils.js';
import {
  EQUIPMENT_SLOTS,
  LAYER_TYPES,
  isValidEquipmentStructure,
  createEmptyEquipment,
  getAllEquippedItems,
  calculateEquipmentStats
} from './core/equipment-schema.js';
import { migrateEquipment, dryRunMigration, validateMigration } from './core/equipment-migration.js';
import { dispatcher, EVENT_TYPES } from './core/dispatcher.js';
import { GameMode, isValidTransition, getValidTransitions, isValidMode, setMode, initializeGameState, getModeDisplayName } from './core/game-modes.js';

console.log('=== Man-at-Arms v2.0.0 (Vite Build) ===');
console.log('Core modules loaded successfully');

// Verify globals are set (backward compatibility)
console.log('Window globals:', {
  gameState: !!window.gameState,
  CHAPTERS: !!window.CHAPTERS,
  PATRONS: !!window.PATRONS,
  clampStat: !!window.clampStat
});

// ============================================
// Placeholder for future phase imports
// These will be uncommented as phases progress
// ============================================

// Phase 2: Equipment modules
// import { EquipmentManager } from './core/equipment-manager.js';
// import { migrateEquipment } from './core/equipment-migration.js';

// Phase 3: Event system
// import { dispatcher } from './core/dispatcher.js';
// import { GameMode, setMode } from './core/game-modes.js';

// Phase 4: Map system
// import { MapRenderer } from './scenes/overworld/map-renderer.js';

// Phase 5: Ink integration
// import { initializeInk, bindExternals } from './ink/ink-integration.js';

// UI modules (will convert later)
// For now, we depend on the original files being loaded as globals

// ============================================
// Backward Compatibility - Attach to Window
// Maintain all existing global functions for legacy code
// ============================================

if (typeof window !== 'undefined') {
  // Core constants
  window.CHAPTERS = CHAPTERS;
  window.PATRONS = PATRONS;
  window.KIT_TIER_MAP = KIT_TIER_MAP;
  window.statLimits = statLimits;

  // Game state
  window.gameState = gameState;
  window.makeDefaultGameState = makeDefaultGameState;
  window.hydrateLoadedState = hydrateLoadedState;

  // Utility functions
  window.clampStat = clampStat;
  window.applyStatChange = applyStatChange;
  window.escapeHTML = escapeHTML;
  window.rollDice = rollDice;
  window.resolveAction = resolveAction;
  window.normalizeRegion = normalizeRegion;
  window.normalizeSocialClass = normalizeSocialClass;
  window.normalizeSlot = normalizeSlot;
  window.hasShieldEquipped = hasShieldEquipped;
  window.checkLevelUp = checkLevelUp;
  window.getEffectiveStat = getEffectiveStat;

  // Equipment functions
  window.EQUIPMENT_SLOTS = EQUIPMENT_SLOTS;
  window.LAYER_TYPES = LAYER_TYPES;
  window.isValidEquipmentStructure = isValidEquipmentStructure;
  window.createEmptyEquipment = createEmptyEquipment;
  window.getAllEquippedItems = getAllEquippedItems;
  window.calculateEquipmentStats = calculateEquipmentStats;
  window.migrateEquipment = migrateEquipment;
  window.dryRunMigration = dryRunMigration;
  window.validateMigration = validateMigration;

  // Event dispatcher (Phase 3)
  window.dispatcher = dispatcher;
  window.EVENT_TYPES = EVENT_TYPES;

  // Game modes (Phase 3)
  window.GameMode = GameMode;
  window.isValidTransition = isValidTransition;
  window.getValidTransitions = getValidTransitions;
  window.isValidMode = isValidMode;
  window.setMode = setMode;
  window.initializeGameState = initializeGameState;
  window.getModeDisplayName = getModeDisplayName;
}

// ============================================
// Boot sequence
// ============================================

function bootGame() {
  console.log('Booting Man-at-Arms...');
  
  // Check Ink.js availability
  if (typeof window.inkjs === 'undefined') {
    console.warn('Ink.js not loaded - narrative system unavailable');
  } else {
    console.log('Ink.js detected:', window.inkjs.Story ? 'v2.0+' : 'legacy');
  }
  
  // Initialize UI (placeholder - Phase 3 event-driven flow active)
  const storyEl = document.getElementById('story');
  if (storyEl) {
    storyEl.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2 style="color: #d4af37;">Man-at-Arms v2.0 - Phase 3</h2>
        <p style="color: #888;">Event-Driven Flow System Active</p>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Dispatcher: ✓<br>
          Game Modes: ✓<br>
          Mode State: ✓<br>
          Event System: ✓
        </p>
        <p style="color: #888; margin-top: 30px;">
          <em>Phase 4: Map system next.</em>
        </p>
      </div>
    `;
  }
  
  console.log('Boot complete. Ready for Phase 2+ integration.');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootGame);
} else {
  bootGame();
}

// ============================================
// Re-export for internal use
// ============================================

export {
  CHAPTERS,
  PATRONS,
  KIT_TIER_MAP,
  statLimits,
  gameState,
  makeDefaultGameState,
  hydrateLoadedState,
  clampStat,
  applyStatChange,
  escapeHTML,
  rollDice,
  resolveAction,
  normalizeRegion,
  normalizeSocialClass,
  normalizeSlot,
  hasShieldEquipped,
  checkLevelUp,
  getEffectiveStat,
  EQUIPMENT_SLOTS,
  LAYER_TYPES,
  isValidEquipmentStructure,
  createEmptyEquipment,
  getAllEquippedItems,
  calculateEquipmentStats,
  migrateEquipment,
  dryRunMigration,
  validateMigration,
  dispatcher,
  EVENT_TYPES,
  GameMode,
  isValidTransition,
  getValidTransitions,
  isValidMode,
  setMode,
  initializeGameState,
  getModeDisplayName
};

// Default export for convenience
export default { gameState, CHAPTERS, PATRONS };
