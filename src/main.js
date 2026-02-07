// ============================================
// Man-at-Arms Main Entry Point
// Vite-bundled ES Module with backward compatibility
// ============================================

// Core modules (ES module exports + window globals for compatibility)
import { CHAPTERS, PATRONS, KIT_TIER_MAP, statLimits } from './core/constants.js';
import { gameState, makeDefaultGameState } from './core/gameState.js';
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
  
  // Initialize UI (placeholder - Phase 1 just validates module loading)
  const storyEl = document.getElementById('story');
  if (storyEl) {
    storyEl.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2 style="color: #d4af37;">Man-at-Arms v2.0 Initialized</h2>
        <p style="color: #888;">Vite build pipeline active</p>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Core modules loaded: ✓<br>
          Game state: ✓<br>
          Utilities: ✓
        </p>
        <p style="color: #888; margin-top: 30px;">
          <em>Full game integration coming in subsequent phases.</em>
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
};

// Default export for convenience
export default { gameState, CHAPTERS, PATRONS };
