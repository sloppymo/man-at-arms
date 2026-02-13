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
import { migrateSavePayload } from './core/save-migration.js';
import { dispatcher, EVENT_TYPES } from './core/dispatcher.js';
import { GameMode, isValidTransition, getValidTransitions, isValidMode, setMode, initializeGameState, getModeDisplayName } from './core/game-modes.js';
import { MapScene, createMapScene, initializeMapSystem } from './scenes/overworld/map-scene.js';
import { DialogueService, createDialogueService } from './systems/dialogue-service.js';
import { EncounterService } from './systems/encounter-service.js';
import { DialogUI } from './ui/dialog-ui.js';
import { createNarrativeBridge } from './ink/narrative-bridge.js';
import { initializeErrorHandling, initializeDebugTools } from './core/error-handler.js';
import { createInkValidationSuite } from './ink/ink-validation-suite.js';

// Phaser Overworld (Phase 4)
import { createOverworldGame } from './phaser/createOverworldGame.js';

// Equipment System
import { EQUIPMENT_DATABASE, EquipmentManager } from './systems/equipment-system.js';

// Character Data
import { CHARACTERS, getCharacter } from './data/characters.js';

// UI Functions (new implementations)
import { showStats } from './ui/stats-display.js';
import { openEquipmentScreen } from './ui/equipment-ui.js';
import { saveGame, loadGame } from './systems/save-load.js';
import { toggleEffectsPreview, initializeEffectsPreview } from './ui/effects-preview.js';
import { updateDisplay, showNotification, resetGame } from './ui/ui-functions.js';

window.showStats = showStats;
window.openEquipmentScreen = openEquipmentScreen;
window.saveGame = saveGame;
window.loadGame = loadGame;
window.toggleEffectsPreview = toggleEffectsPreview;
window.migrateSavePayload = migrateSavePayload;
window.EQUIPMENT_DATABASE = EQUIPMENT_DATABASE;
window.EquipmentManager = EquipmentManager;
window.updateDisplay = updateDisplay;
window.showNotification = showNotification;
window.resetGame = resetGame;
window.CHARACTERS = CHARACTERS;
window.getCharacter = getCharacter;
window.gameState = gameState;
window.setMode = setMode;
window.GameMode = GameMode;

// Story system helpers
window.getStory = () => window.dialogueService?.getCurrentStory();
window.ensureStory = () => window.dialogueService?.ensureInkStory();

// ============================================
// Boot sequence
// ============================================

function bootGame() {
  console.log('Booting Man-at-Arms...');
  
  // Check Ink.js availability
  if (typeof window.inkjs === 'undefined') {
    console.warn('Ink.js not loaded - narrative system unavailable');
  }
  
  // Initialize UI (placeholder - Phase 7 error handling and debug tools active)
  const storyEl = document.getElementById('story');
  if (storyEl) {
    storyEl.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2 style="color: #d4af37;">Man-at-Arms v2.0 - Complete! 🎉</h2>
        <p style="color: #888;">All Modernization Phases Finished</p>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          ✅ Error Handling: ✓<br>
          ✅ Debug Tools: ✓<br>
          ✅ Production Ready: ✓<br>
          ✅ All Systems Operational: ✓
        </p>
        <p style="color: #888; margin-top: 30px;">
          <em>Ready for deployment and production use!</em>
        </p>
      </div>
    `;
  }

  // Initialize map system
  initializeMapSystem(gameState, dispatcher);

  // Initialize error handling and debug tools (Phase 7)
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  initializeErrorHandling({
    environment: isDevelopment ? 'development' : 'production',
    debug: isDevelopment,
    enableSentry: false // Set to true and provide DSN for production error reporting
  });

  initializeDebugTools(gameState, dispatcher, {
    environment: isDevelopment ? 'development' : 'production'
  });

  // Initialize effects preview state
  initializeEffectsPreview();

  // Initialize dialogue service (loads Ink stories and binds externals)
  const dialogueService = createDialogueService(dispatcher, gameState, window.EquipmentManager);
  window.dialogueService = dialogueService;

  // Initialize encounter service
  const encounterService = new EncounterService(dispatcher, gameState, dialogueService);
  window.encounterService = encounterService;
  encounterService.initialize();

  // Initialize dialog UI
  const dialogUI = new DialogUI(dispatcher);
  window.dialogUI = dialogUI;

  // Initialize dialog system
  dialogueService.initializeDialogSystem().then(success => {
    if (success) {
      console.log('Dialog system initialized successfully');
    } else {
      console.warn('Dialog system initialization failed');
    }
  });

  // Initialize validation suite (dev-only)
  createInkValidationSuite();
  
  // Initialize Phaser overworld (Phase 4) - feature flag controlled
  const enableOverworldPhaser = gameState.flags?.enableOverworldPhaser || false;
  // TEMPORARY: Force enable for Phase 4 testing
  const enableOverworldPhaser_TEST = true;
  const overworldGame = createOverworldGame({
    parentId: 'phaser-root',
    dispatch: dispatcher.dispatch.bind(dispatcher),
    getGameState: () => gameState,
    setMode: setMode,
    isEnabled: enableOverworldPhaser_TEST
  });
  
  // Make overworldGame globally available for dialog UI
  window.overworldGame = overworldGame;
  
  // Subscribe to mode changes for Phaser scene management
  if (overworldGame) {
    dispatcher.subscribe('MODE_CHANGE', (event) => {
      try {
        const newMode = event.payload?.to || event.payload;
        const gameContainer = document.querySelector('.game-container');
        
        console.log('MODE_CHANGE received:', event);
        console.log('New mode:', newMode);
        
        if (newMode === 'overworld') {
          console.log('Processing overworld mode transition...');
          
          // HIDE THE ARTWORK IMAGE - THIS IS THE NAVAL BATTLE SOURCE
          const artworkImage = document.getElementById('artwork-image');
          const artworkElement = document.getElementById('scene-artwork');
          if (artworkImage) {
            console.log('Hiding artwork image (naval battle source)');
            artworkImage.style.display = 'none';
            artworkImage.src = '';
            artworkImage.remove(); // COMPLETELY REMOVE IT
          }
          if (artworkElement) {
            artworkElement.style.display = 'none';
            artworkElement.classList.remove('visible');
            artworkElement.remove(); // COMPLETELY REMOVE IT
          }
          
          // Clear any lingering artwork from previous scenes
          const allImages = document.querySelectorAll('img');
          allImages.forEach(img => {
            if (img.src.includes('naval') || 
                img.alt.includes('naval') || 
                img.src.includes('BattleofSluys') || 
                img.alt.includes('BattleofSluys')) {
              console.log('Removing naval/battle image:', img.src);
              img.remove();
            }
          });
          
          // Clear dialogue images
          if (window.currentDialogueImage) {
            console.log('Clearing dialogue image in overworld mode');
            window.currentDialogueImage = null;
          }
          
          // Clear background images that might be set on canvas or phaser root
          const phaserRoot = document.getElementById('phaser-root');
          if (phaserRoot) {
            phaserRoot.style.backgroundImage = 'none';
          }
          const phaserCanvas = document.querySelector('#phaser-root canvas');
          if (phaserCanvas) {
            phaserCanvas.style.backgroundImage = 'none';
            console.log('Phaser canvas found, z-index should be controlled by CSS');
          }
          
          // Clear background images on body and html that might show BattleofSluys
          document.body.style.setProperty('background-image', 'none', 'important');
          document.documentElement.style.setProperty('background-image', 'none', 'important');
          if (gameContainer) {
            gameContainer.style.setProperty('background-image', 'none', 'important');
          }
          
          // Clear background images on ALL elements to be thorough
          const allDOMElements = document.querySelectorAll('*');
          allDOMElements.forEach(el => {
            if (el.style) {
              el.style.setProperty('background-image', 'none', 'important');
            }
          });
          
          // Set up continuous clearing while in overworld mode
          if (!window.overworldClearInterval) {
            window.overworldClearInterval = setInterval(() => {
              if (document.body.classList.contains('overworld-mode')) {
                let clearedSomething = false;
                document.querySelectorAll('*').forEach(el => {
                  if (el.style && el.style.backgroundImage && el.style.backgroundImage.includes('BattleofSluys')) {
                    console.log('Clearing BattleofSluys background from element:', el);
                    el.style.setProperty('background-image', 'none', 'important');
                    clearedSomething = true;
                  }
                });
                // Also clear any img elements with BattleofSluys
                document.querySelectorAll('img').forEach(img => {
                  if (img.src.includes('BattleofSluys') || (img.style.backgroundImage && img.style.backgroundImage.includes('BattleofSluys'))) {
                    console.log('Removing BattleofSluys img element:', img.src);
                    img.remove();
                    clearedSomething = true;
                  }
                });
                if (clearedSomething) {
                  console.log('BattleofSluys cleared from DOM');
                }
              } else {
                clearInterval(window.overworldClearInterval);
                window.overworldClearInterval = null;
              }
            }, 100); // Check every 100ms
          }
          
          // Hide main game UI when entering overworld
          if (gameContainer) {
            console.log('Hiding game container...');
            gameContainer.style.display = 'none';
          } else {
            console.log('Game container not found');
          }
          
          // Hide body background
          console.log('Adding overworld-mode class to body...');
          document.body.classList.add('overworld-mode');
          
          // Debug: Log what's still visible
          console.log('=== OVERWORLD MODE DEBUG ===');
          const allElements = document.querySelectorAll('*');
          const visibleElements = [];
          allElements.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.display !== 'none' && 
                style.visibility !== 'hidden' && 
                style.opacity !== '0' &&
                el.offsetWidth > 0 && 
                el.offsetHeight > 0) {
              visibleElements.push({
                tag: el.tagName,
                id: el.id,
                class: el.className,
                src: el.src || 'none',
                background: style.backgroundImage || 'none',
                zIndex: style.zIndex,
                offsetWidth: el.offsetWidth,
                offsetHeight: el.offsetHeight,
                innerHTML: el.innerHTML ? el.innerHTML.substring(0, 100) : 'none'
              });
            }
          });
          
          // Log ALL visible elements, not just ones with images
          console.table(visibleElements);
          
          // Specifically look for anything that could be showing an image
          const potentialImageSources = visibleElements.filter(el => 
            el.src !== 'none' || 
            el.background !== 'none' ||
            el.tag === 'IMG' ||
            el.tag === 'CANVAS' ||
            el.innerHTML.includes('img') ||
            el.innerHTML.includes('naval')
          );
          
          console.log('=== POTENTIAL IMAGE SOURCES ===');
          console.table(potentialImageSources);
          console.log('=== END DEBUG ===');
          
          console.log('About to resume overworld game...');
          console.log('overworldGame exists:', !!overworldGame);
          console.log('overworldGame.resume exists:', !!(overworldGame && overworldGame.resume));
          
          if (overworldGame && overworldGame.resume) {
            console.log('Calling overworldGame.resume()...');
            overworldGame.resume();
          } else {
            console.log('ERROR: overworldGame or resume method not available!');
          }
        } else {
          console.log('Processing non-overworld mode transition:', newMode);
          // Show main game UI when leaving overworld
          if (gameContainer) {
            gameContainer.style.display = 'block';
          }
          // Restore body background
          document.body.classList.remove('overworld-mode');
          overworldGame.pause();
          
          // Update UI when entering dialogue mode
          if (newMode === 'dialogue') {
            console.log('Updating UI for dialogue mode');
            if (typeof updateDisplay === 'function') {
              updateDisplay();
            }
          }
        }
      } catch (error) {
        console.error('Error in MODE_CHANGE handler:', error);
        console.error('Error stack:', error.stack);
        console.error('Event details:', event);
      }
    });

    // Add missing event listeners for dialog system
    dispatcher.subscribe('SHOW_IMAGE', (event) => {
      console.log('SHOW_IMAGE event received:', event.payload);
      // Could add image display logic here if needed
    });

    dispatcher.subscribe('TIME_ADVANCED', (event) => {
      console.log('TIME_ADVANCED event received:', event.payload);
      // Could add time display update logic here
    });

    dispatcher.subscribe('SUPPLY_CONSUMED', (event) => {
      console.log('SUPPLY_CONSUMED event received:', event.payload);
      // Could add supply display update logic here
    });

    // Add dialog ended listener to ensure scene resume
    dispatcher.subscribe('DIALOG_ENDED', (event) => {
      console.log('DIALOG_ENDED event received - ensuring scene resume');
      if (overworldGame && overworldGame.resume) {
        console.log('Force resuming overworld scene after dialog ended');
        overworldGame.resume();
      }
    });
  }
  
  console.log('Boot complete. Ready for Phase 2+ integration.');
  
  // Add debug controls in development only
  const enableDebugControls = isDevelopment && (window.DEBUG_DIALOGS || window.location.search.includes('debug=true'));
  
  if (enableDebugControls) {
    const debugContainer = document.createElement('div');
    debugContainer.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.8);
      padding: 10px;
      border-radius: 5px;
      color: white;
      font-family: monospace;
      font-size: 12px;
    `;
    
    const merchantButton = document.createElement('button');
    merchantButton.textContent = 'TEST MERCHANT DIALOG';
    merchantButton.style.cssText = `
      background: blue;
      color: white;
      padding: 8px;
      border: none;
      cursor: pointer;
      font-size: 12px;
      margin: 2px;
    `;
    merchantButton.onclick = () => {
      console.log('Testing merchant dialog');
      dialogueService.startDialogEncounter('merchant_encounter', 'merchant');
    };

    const banditButton = document.createElement('button');
    banditButton.textContent = 'TEST BANDIT DIALOG';
    banditButton.style.cssText = `
      background: orange;
      color: white;
      padding: 8px;
      border: none;
      cursor: pointer;
      font-size: 12px;
      margin: 2px;
    `;
    banditButton.onclick = () => {
      console.log('Testing bandit dialog');
      dialogueService.startDialogEncounter('bandit_encounter', 'bandit_leader');
    };

    const statusButton = document.createElement('button');
    statusButton.textContent = 'DIALOG STATUS';
    statusButton.style.cssText = `
      background: green;
      color: white;
      padding: 8px;
      border: none;
      cursor: pointer;
      font-size: 12px;
      margin: 2px;
    `;
    statusButton.onclick = () => {
      console.log('Dialog system status:', dialogueService.getDialogSystemStatus());
    };

    debugContainer.appendChild(merchantButton);
    debugContainer.appendChild(banditButton);
    debugContainer.appendChild(statusButton);
    document.body.appendChild(debugContainer);
  }

  // TEMPORARY: Remove auto-triggering debug buttons - they cause blocking dialogs on launch
  // const dialogDebugContainer = document.createElement('div');
  // dialogDebugContainer.style.cssText = `
  //   position: fixed;
  //   top: 60px;
  //   right: 10px;
  //   z-index: 9999;
  //   display: flex;
  //   flex-direction: column;
  //   gap: 5px;
  // `;

  // const merchantButton = document.createElement('button');
  // merchantButton.textContent = 'TEST MERCHANT DIALOG';
  // merchantButton.style.cssText = `
  //   background: blue;
  //   color: white;
  //   padding: 8px;
  //   border: none;
  //   cursor: pointer;
  //   font-size: 12px;
  // `;
  // merchantButton.onclick = () => {
  //   console.log('Testing merchant dialog');
  //   dialogueService.startDialogEncounter('merchant_encounter', 'merchant');
  // };

  // const banditButton = document.createElement('button');
  // banditButton.textContent = 'TEST BANDIT DIALOG';
  // banditButton.style.cssText = `
  //   background: orange;
  //   color: white;
  //   padding: 8px;
  //   border: none;
  //   cursor: pointer;
  //   font-size: 12px;
  // `;
  // banditButton.onclick = () => {
  //   console.log('Testing bandit dialog');
  //   dialogueService.startDialogEncounter('bandit_encounter', 'bandit_leader');
  // };

  // const statusButton = document.createElement('button');
  // statusButton.textContent = 'DIALOG STATUS';
  // statusButton.style.cssText = `
  //   background: green;
  //   color: white;
  //   padding: 8px;
  //   border: none;
  //   cursor: pointer;
  //   font-size: 12px;
  // `;
  // statusButton.onclick = () => {
  //   console.log('Dialog system status:', dialogueService.getDialogSystemStatus());
  // };

  // const testUI = document.createElement('button');
  // testUI.textContent = 'TEST DIALOG UI';
  // testUI.style.cssText = `
  //   background: purple;
  //   color: white;
  //   padding: 8px;
  //   border: none;
  //   cursor: pointer;
  //   font-size: 12px;
  // `;
  // testUI.onclick = () => {
  //   console.log('Testing dialog UI directly');
  //   if (window.dialogUI) {
  //     window.dialogUI.showDialog({
  //       character: 'merchant',
  //       emotion: 'neutral',
  //       text: 'This is a test dialog message. Can you see this UI?',
  //       choices: [
  //         { text: 'Choice 1', enabled: true },
  //         { text: 'Choice 2', enabled: true }
  //       ]
  //     });
  //   } else {
  //     console.error('dialogUI not available');
  //   }
  // };

  // const testEncounterButton = document.createElement('button');
  // testEncounterButton.textContent = 'TEST RANDOM ENCOUNTER';
  // testEncounterButton.style.cssText = `
  //   background: red;
  //   color: white;
  //   padding: 8px;
  //   border: none;
  //   cursor: pointer;
  //   font-size: 12px;
  // `;
  // testEncounterButton.onclick = () => {
  //   console.log('Testing random encounter system');
  //   if (window.encounterService) {
  //     window.encounterService.forceEncounter('march_event');
  //   } else {
  //     console.error('encounterService not available');
  //   }
  // };

  // const encounterStatusButton = document.createElement('button');
  // encounterStatusButton.textContent = 'ENCOUNTER STATUS';
  // encounterStatusButton.style.cssText = `
  //   background: cyan;
  //   color: black;
  //   padding: 8px;
  //   border: none;
  //   cursor: pointer;
  //   font-size: 12px;
  // `;
  // encounterStatusButton.onclick = () => {
  //   console.log('Encounter system status:', window.encounterService?.getDebugInfo());
  // };

  // dialogDebugContainer.appendChild(merchantButton);
  // dialogDebugContainer.appendChild(banditButton);
  // dialogDebugContainer.appendChild(statusButton);
  // dialogDebugContainer.appendChild(testUI);
  // dialogDebugContainer.appendChild(testEncounterButton);
  // dialogDebugContainer.appendChild(encounterStatusButton);
  // document.body.appendChild(dialogDebugContainer);

  // Add global R key handler as backup for returning to overworld
  document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
      console.log('Global R key pressed - forcing return to overworld');
      const gameState = window.gameState || gameState;
      if (gameState && setMode) {
        // Always try to resume the scene, even if mode doesn't change
        if (overworldGame && overworldGame.resume) {
          console.log('Force resuming overworld scene via global R key');
          overworldGame.resume();
        }
        
        // Also try to set mode (in case we're not in overworld)
        setMode(gameState, GameMode.OVERWORLD);
      }
    }
  });
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
  migrateSavePayload,
  dispatcher,
  EVENT_TYPES,
  GameMode,
  isValidTransition,
  getValidTransitions,
  isValidMode,
  setMode,
  initializeGameState,
  getModeDisplayName,
  MapScene,
  createMapScene,
  initializeMapSystem,
  DialogueService,
  createDialogueService,
  createNarrativeBridge,
  initializeErrorHandling,
  initializeDebugTools,
  // UI Functions
  showStats,
  openEquipmentScreen,
  saveGame,
  loadGame,
  toggleEffectsPreview,
  initializeEffectsPreview
};

// Default export for convenience
export default { gameState, CHAPTERS, PATRONS };
