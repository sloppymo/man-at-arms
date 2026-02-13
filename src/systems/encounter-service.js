// ============================================
// Encounter Service
// Handles random encounters based on hex movement
// Bridges gap between player movement and narrative encounters
// ============================================

import { EVENT_TYPES } from '../core/dispatcher.js';

/**
 * Encounter rates by zone type
 */
const ENCOUNTER_RATES = {
  'chevauchee': 0.30,       // 30% in chevauchée zones
  'normandy_raids': 0.30,   // 30% in Normandy raid zones
  'forest': 0.15,           // 15% in forests
  'road': 0.05,            // 5% on roads
  null: 0                  // Safe zones
};

/**
 * Minimum time between encounters (milliseconds)
 */
const ENCOUNTER_COOLDOWN = 30000; // 30 seconds real time

/**
 * Cooldown after combat (prevents immediate next encounter)
 */
const POST_COMBAT_COOLDOWN = 60000; // 60 seconds

/**
 * Story mapping for encounter types
 */
const ENCOUNTER_STORIES = {
  'march_event': 'chevauchee/01_march_events',
  'raid_village': 'chevauchee/02_raid_encounters',
  'patrol_spotted': 'chevauchee/02_raid_encounters',
  'forage': 'chevauchee/01_march_events',
  'camp_event': 'chevauchee/01_march_events',
  'sentry_duty': 'chevauchee/01_march_events',
  'ambush': 'chevauchee/02_raid_encounters',
  'march_depart': 'chevauchee/01_march_events',
  'french_scouts': 'chevauchee/02_raid_encounters',
  'make_camp': 'chevauchee/01_march_events',
  'late_raid': 'chevauchee/02_raid_encounters',
  'default': 'chevauchee/01_march_events'
};

/**
 * Encounter Service class that handles random encounters based on hex movement
 */
export class EncounterService {
  constructor(dispatcher, gameState, narrativeService) {
    this.dispatcher = dispatcher;
    this.gameState = gameState;
    this.narrativeService = narrativeService;
    
    // Track subscriptions for cleanup
    this._unsubscribeHandles = [];
    
    // Cooldown tracking
    this.lastEncounterTime = 0;
    this.lastCombatTime = 0;
    
    // Skip encounters on first hex entry to allow welcome dialog
    this.skipFirstHex = true;
    
    // Debug mode flag
    this.debugMode = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.search.includes('debug=true'));
  }

  /**
   * Initialize the encounter service
   */
  initialize() {
    console.log('EncounterService: Initializing...');
    
    // Subscribe to ENTER_HEX events
    const hexHandle = this.dispatcher.subscribe(EVENT_TYPES.ENTER_HEX, (event) => {
      this.onEnterHex(event);
    });
    if (hexHandle) this._unsubscribeHandles.push(hexHandle);

    // Subscribe to MODE_CHANGE to know when player returns to overworld
    const modeHandle = this.dispatcher.subscribe(EVENT_TYPES.MODE_CHANGE, (event) => {
      this.onModeChange(event);
    });
    if (modeHandle) this._unsubscribeHandles.push(modeHandle);

    // Subscribe to COMBAT_END to track combat cooldown
    const combatHandle = this.dispatcher.subscribe(EVENT_TYPES.COMBAT_END, (event) => {
      this.onCombatEnd(event);
    });
    if (combatHandle) this._unsubscribeHandles.push(combatHandle);

    // Add debug functions to window
    if (typeof window !== 'undefined') {
      window.forceEncounter = (type) => this.forceEncounter(type);
      window.getEncounterDebugInfo = () => this.getDebugInfo();
    }

    console.log('EncounterService: Initialized successfully');
  }

  /**
   * Handle ENTER_HEX events
   */
  onEnterHex(event) {
    const { q, r, zone, x, y } = event;
    
    console.log(`EncounterService: Entering hex (${q}, ${r}) in zone: ${zone || 'null'}`);
    
    // Check if we should trigger an encounter
    if (this.shouldTriggerEncounter(event)) {
      this.triggerRandomEncounter(event);
    }
  }

  /**
   * Handle mode changes to reset cooldowns when appropriate
   */
  onModeChange(event) {
    const newMode = event.payload?.to || event.payload;
    
    if (newMode === 'overworld') {
      console.log('EncounterService: Returned to overworld mode');
      // Could add logic here for special cooldown resets
    }
  }

  /**
   * Handle combat end to set combat cooldown
   */
  onCombatEnd(event) {
    console.log('EncounterService: Combat ended, setting combat cooldown');
    this.lastCombatTime = Date.now();
  }

  /**
   * Determine if an encounter should trigger based on various factors
   */
  shouldTriggerEncounter(event) {
    const { zone } = event;
    
    // Skip encounters on first hex entry to allow welcome dialog
    if (this.skipFirstHex) {
      console.log('EncounterService: Skipping encounter on first hex entry');
      this.skipFirstHex = false;
      return false;
    }
    
    // Check if zone has encounters
    const encounterRate = ENCOUNTER_RATES[zone] || ENCOUNTER_RATES[null];
    if (encounterRate === 0) {
      console.log('EncounterService: Zone has no encounters');
      return false;
    }

    // Check cooldowns
    const now = Date.now();
    const timeSinceLastEncounter = now - this.lastEncounterTime;
    const timeSinceLastCombat = now - this.lastCombatTime;

    if (timeSinceLastEncounter < ENCOUNTER_COOLDOWN) {
      const remainingCooldown = (ENCOUNTER_COOLDOWN - timeSinceLastEncounter) / 1000;
      console.log(`EncounterService: Blocked by cooldown: ${remainingCooldown.toFixed(1)}s remaining`);
      return false;
    }

    if (timeSinceLastCombat < POST_COMBAT_COOLDOWN) {
      const remainingCombatCooldown = (POST_COMBAT_COOLDOWN - timeSinceLastCombat) / 1000;
      console.log(`EncounterService: Blocked by combat cooldown: ${remainingCombatCooldown.toFixed(1)}s remaining`);
      return false;
    }

    // Roll for encounter
    const roll = Math.random();
    const shouldTrigger = roll < encounterRate;
    
    console.log(`EncounterService: Roll: ${roll.toFixed(3)}, threshold: ${encounterRate}, should trigger: ${shouldTrigger}`);
    
    return shouldTrigger;
  }

  /**
   * Trigger a random encounter
   */
  triggerRandomEncounter(event) {
    const { zone, q, r } = event;
    
    console.log(`EncounterService: Triggering random encounter in zone: ${zone}`);
    
    // Get time of day from game state
    const timeOfDay = this.getTimeOfDay();
    
    // Create seed for deterministic encounter (based on position and game time)
    const gameTime = this.gameState.overworld?.time || 0;
    const seed = `${q}_${r}_${gameTime}`;
    
    // Roll encounter using narrative service
    const encounterResult = this.narrativeService.rollEncounter(seed, zone || 'default', timeOfDay.period);
    
    console.log('EncounterService: Rolled encounter:', encounterResult);
    
    // Map encounter type to story
    const storyName = ENCOUNTER_STORIES[encounterResult.type] || ENCOUNTER_STORIES.default;
    
    console.log(`EncounterService: Dispatching TRIGGER_ENCOUNTER with story: ${storyName}`);
    
    // Set cooldown immediately to prevent rapid-fire loops
    this.lastEncounterTime = Date.now();
    
    // Dispatch encounter trigger
    this.dispatcher.dispatch(EVENT_TYPES.TRIGGER_ENCOUNTER, {
      story: storyName,
      encounterType: encounterResult.type,
      zone: zone,
      hex: { q, r }
    }, 'encounter-service');
  }

  /**
   * Get time of day from game state
   */
  getTimeOfDay() {
    const time = this.gameState.overworld?.time || 0;
    // Simple time of day calculation based on 24-hour cycle
    if (time >= 6 && time < 12) return 'morning';
    if (time >= 12 && time < 18) return 'afternoon';
    if (time >= 18 && time < 22) return 'evening';
    return 'night';
  }

  /**
   * Force a specific encounter type (for testing)
   */
  forceEncounter(type) {
    console.log(`EncounterService: Force triggering encounter type: ${type}`);
    
    const storyName = ENCOUNTER_STORIES[type] || ENCOUNTER_STORIES.default;
    
    this.dispatcher.dispatch(EVENT_TYPES.TRIGGER_ENCOUNTER, {
      payload: {
        story: storyName,
        encounterType: type,
        forced: true
      },
      source: 'encounter-service-debug'
    });
  }

  /**
   * Get debug information about the encounter service
   */
  getDebugInfo() {
    const now = Date.now();
    return {
      lastEncounterTime: this.lastEncounterTime,
      lastCombatTime: this.lastCombatTime,
      timeSinceLastEncounter: now - this.lastEncounterTime,
      timeSinceLastCombat: now - this.lastCombatTime,
      encounterRates: ENCOUNTER_RATES,
      storyMapping: ENCOUNTER_STORIES,
      cooldownRemaining: Math.max(0, ENCOUNTER_COOLDOWN - (now - this.lastEncounterTime)),
      combatCooldownRemaining: Math.max(0, POST_COMBAT_COOLDOWN - (now - this.lastCombatTime))
    };
  }

  /**
   * Clean up resources and unsubscribe from events
   */
  destroy() {
    console.log('EncounterService: Cleaning up...');
    
    // Unsubscribe all dispatcher handlers
    if (this._unsubscribeHandles) {
      this._unsubscribeHandles.forEach(unsub => {
        if (typeof unsub === 'function') unsub();
      });
      this._unsubscribeHandles = [];
    }

    // Remove debug functions from window
    if (typeof window !== 'undefined') {
      delete window.forceEncounter;
      delete window.getEncounterDebugInfo;
    }

    // Null out references
    this.dispatcher = null;
    this.gameState = null;
    this.narrativeService = null;
    
    console.log('EncounterService: Cleanup complete');
  }
}
