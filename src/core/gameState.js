// ============================================
// Man-at-Arms Game State Management
// ES Module with backward compatibility for globals
// ============================================

/**
 * Creates the default game state object
 * This is the canonical schema for new games (v2 equipment format coming in Phase 2)
 * @returns {GameState} Default game state
 */
export function makeDefaultGameState() {
  return {
    // Schema version for migration tracking
    schemaVersion: 1,
    
    // Core character stats
    stats: {
      strength: 5,
      agility: 5,
      endurance: 5,
      charisma: 5,
      luck: 5,
      wits: 5, // Intelligence, tactical thinking
      wealth: 120, // 10 shillings = 120 pence
      reputation: 0,
      morale: 5,
      stress: 0, // Stress/fatigue meter
      experience: 0,
      patronFavor: 0
    },
    
    // Character identity
    faction: "English",
    age: 27,
    ageRange: null,
    year: 1337,
    location: "England",
    region: "England", // Normalized region for equipment availability
    
    // Progression
    level: 1,
    levelUpPoints: 0,
    rank: "Common Soldier",
    
    // Scene navigation
    currentScene: "character_creation",
    chapter: null,
    chapterProgress: {
      chevauchée: { started: false, completed: false },
      calais: { started: false, completed: false },
      plague: { started: false, completed: false },
      poitiers: { started: false, completed: false }
    },
    
    // Character creation tracking
    characterCreationStep: 1,
    characterName: "",
    patronId: null,
    patron: null, // Legacy field
    patronEventPath: null,
    startingKitTier: null,
    background: null,
    selectedBackground: null,
    culture: "", // Character culture/region
    origin: null, // Specific origin location
    
    // Scene history
    scenesVisited: [],
    enteredScenes: new Set(),
    
    // Equipment and inventory
    // NOTE: This is the current v1 format. v2 canonical layered format coming in Phase 2
    inventory: [],
    equipment: {
      head: {},
      torso: {},
      arms: {},
      legs: {},
      weapon: {},
      missile: {},
      accessory: {},
      bag: []
    },
    kitTier: "Standard",
    startingKitGranted: false,
    
    // Character priorities for background
    priorities: {
      might: null,
      finesse: null,
      wits: null,
      presence: null,
      fortune: null
    },
    
    // Conditions and status
    conditions: [], // wounds, fatigue, etc.
    flags: {}, // story flags
    
    // Relationships
    relationships: {
      wat: 0,
      cook: 0,
      oana: 0
    },
    
    // Campfire system
    campfire: {
      cooldownScenes: 2,
      chance: 0.35,
      lastInsertedAtIndex: 0,
      seenIds: [],
      returnScene: null,
      currentVignetteId: null,
      currentStep: 0,
      stepHistory: [],
      mode: null, // 'micro' | 'full' | null
      microSeenIds: [],
      lastMode: null
    },
    
    // Random encounters
    randomEncounter: {
      active: false,
      returnScene: null,
      cooldown: 0
    },
    
    // Career statistics
    career: {
      battles: 0,
      wounds: 0,
      promotions: 0
    },
    
    // Skirmish system state
    exertion: 0,
    wear: 0,
    lastSkirmish: null
  };
}

// Singleton game state instance
export const gameState = makeDefaultGameState();

// ============================================
// Backward Compatibility
// Maintain window.* globals for existing code
// ============================================
if (typeof window !== 'undefined') {
  window.gameState = gameState;
  window.makeDefaultGameState = makeDefaultGameState;
}

// Export default for convenience
export default gameState;
