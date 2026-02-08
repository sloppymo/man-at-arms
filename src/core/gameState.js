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
    schemaVersion: 2,
    
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
    
    // Game flow mode (Phase 3)
    mode: "title", // Current UI/game mode
    
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
    
    // Equipment and inventory (canonical v2 layered format)
    inventory: [],
    equipment: {
      head: {
        base: null,
        padding: null,
        mail: null,
        plate: null
      },
      torso: {
        base: null,
        padding: null,
        mail: null,
        plate: null,
        surcoat: null
      },
      arms: {
        base: null,
        padding: null,
        mail: null,
        plate: null
      },
      legs: {
        base: null,
        padding: null,
        mail: null,
        plate: null
      },
      weapon: {
        main: null,
        offhand: null
      },
      missile: {
        main: null
      },
      accessory: {
        primary: null
      },
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

// ============================================
// Save/Load Migration System
// ============================================

/**
 * Hydrate loaded game state with defaults and migrations
 * @param {Object} loaded - Raw loaded state from save file
 * @returns {Object} Hydrated and migrated state
 */
export function hydrateLoadedState(loaded) {
  const base = makeDefaultGameState();

  if (!loaded || typeof loaded !== "object") return base;

  // Top-level primitives/arrays/objects (shallow)
  Object.assign(base, loaded);

  // Deep-merge nested objects you rely on
  base.stats = { ...base.stats, ...(loaded.stats || {}) };
  base.flags = { ...base.flags, ...(loaded.flags || {}) };
  base.chapterProgress = { ...base.chapterProgress, ...(loaded.chapterProgress || {}) };
  base.relationships = { ...base.relationships, ...(loaded.relationships || {}) };
  base.career = { ...base.career, ...(loaded.career || {}) };

  // Handle equipment (always canonical layered format after migration)
  if (loaded.equipment) {
    base.equipment = mergeEquipment(base.equipment, loaded.equipment);
  }

  // Initialize level system if not present
  if (typeof base.level !== 'number') {
    base.level = calculateLevel(base);
  }
  if (typeof base.levelUpPoints !== 'number') {
    base.levelUpPoints = 0;
  }
  // Recalculate level from experience to ensure consistency
  base.level = calculateLevel(base);

  // Restore Set from array
  base.enteredScenes = new Set(Array.isArray(loaded.enteredScenes) ? loaded.enteredScenes : []);

  // Sanitize arrays
  base.scenesVisited = Array.isArray(loaded.scenesVisited) ? loaded.scenesVisited : [];

  // Sanitize inventory: validate all items exist in database
  if (Array.isArray(loaded.inventory)) {
    base.inventory = loaded.inventory
        .filter(invItem => invItem && invItem.id &&
            (typeof window.EQUIPMENT_DATABASE === 'undefined' || window.EQUIPMENT_DATABASE[invItem.id]))
        .map(invItem => ({
            id: String(invItem.id),
            condition: Math.max(0, Math.min(100, invItem.condition ?? 100)),
            fit: invItem.fit || 'off-the-rack',
            stackCount: Math.max(1, Math.floor(invItem.stackCount ?? 1))
        }));
  } else {
    base.inventory = [];
  }

  base.conditions = Array.isArray(loaded.conditions) ? loaded.conditions : [];
  base.selectedBackground = loaded.selectedBackground || null;

  // Priorities system
  base.priorities = base.priorities || { might: null, finesse: null, wits: null, presence: null, fortune: null };
  if (typeof base.priorities !== "object") {
    base.priorities = { might: null, finesse: null, wits: null, presence: null, fortune: null };
  }
  // Ensure all priority keys exist
  ['might', 'finesse', 'wits', 'presence', 'fortune'].forEach(function(key) {
    if (!(key in base.priorities)) {
      base.priorities[key] = null;
    }
  });

  base.kitTier = typeof base.kitTier === "string" ? base.kitTier : "Standard";
  base.startingKitGranted = typeof base.startingKitGranted === "boolean" ? base.startingKitGranted : false;

  // Patron fields hydration
  base.patronId = (typeof base.patronId === "string") ? base.patronId : null;
  // Backward compatibility: if old 'patron' field exists but patronId doesn't, migrate it
  if (!base.patronId && base.patron && typeof base.patron === "string") {
    base.patronId = base.patron;
  }
  base.patronEventPath = (typeof base.patronEventPath === "string") ? base.patronEventPath : null;
  base.startingKitTier = (typeof base.startingKitTier === "string") ? base.startingKitTier : null;

  // Relationships hydration
  base.relationships = base.relationships && typeof base.relationships === "object"
    ? {
        wat: Math.max(-5, Math.min(5, Number(base.relationships.wat) || 0)),
        cook: Math.max(-5, Math.min(5, Number(base.relationships.cook) || 0))
      }
    : { wat: 0, cook: 0 };

  // Campfire hydration
  base.campfire = base.campfire && typeof base.campfire === "object" ? base.campfire : {};
  base.campfire.cooldownScenes = Number(base.campfire.cooldownScenes) || 5; // Updated default
  base.campfire.chance = Number(base.campfire.chance) || 0.18; // Updated default
  base.campfire.lastInsertedAtIndex = Number(base.campfire.lastInsertedAtIndex) || 0;
  base.campfire.seenIds = Array.isArray(base.campfire.seenIds) ? base.campfire.seenIds : [];
  base.campfire.returnScene = (typeof base.campfire.returnScene === "string") ? base.campfire.returnScene : null;
  base.campfire.currentVignetteId = (typeof base.campfire.currentVignetteId === "string") ? base.campfire.currentVignetteId : null;
  base.campfire.mode = (typeof base.campfire.mode === "string" && (base.campfire.mode === 'micro' || base.campfire.mode === 'full')) ? base.campfire.mode : null;
  base.campfire.microSeenIds = Array.isArray(base.campfire.microSeenIds) ? base.campfire.microSeenIds : [];
  base.campfire.lastMode = (typeof base.campfire.lastMode === "string" && (base.campfire.lastMode === 'micro' || base.campfire.lastMode === 'full')) ? base.campfire.lastMode : null;

  // Skirmish system hydration (exertion, wear, lastSkirmish)
  // Ensure exertion and wear exist (backward compatibility)
  base.exertion = Number(base.exertion) || 0;
  base.wear = Number(base.wear) || 0;
  // Clamp to 0-10
  base.exertion = Math.max(0, Math.min(10, base.exertion));
  base.wear = Math.max(0, Math.min(10, base.wear));
  // Initialize lastSkirmish if missing
  base.lastSkirmish = base.lastSkirmish || null;

  // Recalculate stats from priorities if priorities are set (for loaded saves)
  if (base.priorities && Object.values(base.priorities).some(function(p) { return p !== null && p !== ''; })) {
    // Preserve accumulated wealth and reputation before recalculation
    // (recalculateFromPriorities resets these to base values, which is correct for character creation
    //  but we want to preserve accumulated values during load)
    const preservedWealth = base.stats && base.stats.wealth !== undefined ? base.stats.wealth : null;
    const preservedReputation = base.stats && base.stats.reputation !== undefined ? base.stats.reputation : null;

    // Recalculate directly on base without reassigning gameState
    recalculateFromPriorities(base);

    // Restore preserved wealth and reputation if they were present
    if (preservedWealth !== null && base.stats) {
      base.stats.wealth = preservedWealth;
    }
    if (preservedReputation !== null && base.stats) {
      base.stats.reputation = preservedReputation;
    }
    // Stats are now updated in base
  }

  // Clamp + coerce numeric stats
  for (const key of Object.keys(base.stats)) {
    base.stats[key] = clampStat(key, Number(base.stats[key]) || base.stats[key]);
  }

  // Coerce other numeric fields that matter
  base.age = Number(base.age) || 18;
  base.year = Number(base.year) || 1337;

  // Ensure mode is set and valid
  if (!base.mode || (typeof window !== 'undefined' && window.isValidMode && !window.isValidMode(base.mode))) {
    base.mode = "title"; // Default fallback
  }

  // Ensure strings
  base.location = typeof base.location === "string" ? base.location : "England";
  base.region = typeof base.region === "string" ? base.region : (base.location ? normalizeRegion(base.location) : "England");
  // Don't reset currentScene to character_creation if we have a valid saved scene
  base.currentScene = typeof base.currentScene === "string" && base.currentScene !== "" ? base.currentScene : "character_creation";
  base.characterName = typeof base.characterName === "string" && base.characterName !== "" ? base.characterName : "William Thatcher";
  base.culture = typeof base.culture === "string" ? base.culture : "";
  base.origin = base.origin || null;
  // Preserve background if it exists (don't reset to null) - backward compatibility
  base.background = base.background || null;
  base.rank = typeof base.rank === "string" ? base.rank : "Common Soldier";
  base.faction = typeof base.faction === "string" ? base.faction : "English";

  // Overworld state hydration
  base.overworld = base.overworld && typeof base.overworld === "object" ? base.overworld : {};
  base.overworld.time = Number(base.overworld.time) || 480;
  base.overworld.heat = Math.max(0, Math.min(100, Number(base.overworld.heat) || 0));
  base.overworld.fatigue = Math.max(0, Math.min(100, Number(base.overworld.fatigue) || 0));
  base.overworld.position = base.overworld.position && typeof base.overworld.position === "object" ? base.overworld.position : { q: 0, r: 0 };
  base.overworld.discovered = base.overworld.discovered instanceof Set ? base.overworld.discovered : new Set(Array.isArray(base.overworld.discovered) ? base.overworld.discovered : []);
  base.overworld.encounterSeed = typeof base.overworld.encounterSeed === "string" ? base.overworld.encounterSeed : Math.random().toString(36).substring(2);
  base.overworld.supplies = base.overworld.supplies && typeof base.overworld.supplies === "object" ? {
    food: Math.max(0, Number(base.overworld.supplies.food) || 0),
    arrows: Math.max(0, Number(base.overworld.supplies.arrows) || 0),
    coin: Math.max(0, Number(base.overworld.supplies.coin) || 0)
  } : { food: 3, arrows: 20, coin: 0 };

  return base;
}

// ============================================
// Equipment Migration Helpers
// ============================================

/**
 * Deep merge equipment objects (for v2+)
 * @param {Object} base - Base equipment
 * @param {Object} loaded - Loaded equipment
 * @returns {Object} Merged equipment
 */
function mergeEquipment(base, loaded) {
  const result = JSON.parse(JSON.stringify(base)); // Deep clone

  for (const [slotName, slot] of Object.entries(loaded || {})) {
    if (!(slotName in result)) continue;

    if (slotName === 'bag') {
      result.bag = Array.isArray(slot) ? slot : result.bag;
    } else if (typeof slot === 'object' && slot !== null) {
      for (const [layerName, layerItem] of Object.entries(slot)) {
        if (layerItem && layerItem.id && result[slotName] && result[slotName][layerName] !== undefined) {
          result[slotName][layerName] = { ...layerItem };
        }
      }
    }
  }

  return result;
}

// ============================================
// Placeholder functions (to be implemented)
// ============================================

function calculateLevel(state) {
  // Placeholder - will be implemented in Phase 2+
  return Math.max(1, Math.floor((state.stats?.experience || 0) / 100) + 1);
}

function recalculateFromPriorities(state) {
  // Placeholder - will be implemented in Phase 2+
  // For now, just reset stats to base values
}

function clampStat(key, value) {
  // Import from utils if available
  if (typeof window !== 'undefined' && window.clampStat) {
    return window.clampStat(key, value);
  }
  return value;
}

function normalizeRegion(location) {
  // Import from utils if available
  if (typeof window !== 'undefined' && window.normalizeRegion) {
    return window.normalizeRegion(location);
  }
  return 'England';
}

function createEmptyEquipment() {
  // Import from schema if available
  if (typeof window !== 'undefined' && window.createEmptyEquipment) {
    return window.createEmptyEquipment();
  }

  // Fallback empty structure
  return {
    head: { base: null, padding: null, mail: null, plate: null },
    torso: { base: null, padding: null, mail: null, plate: null, surcoat: null },
    arms: { base: null, padding: null, mail: null, plate: null },
    legs: { base: null, padding: null, mail: null, plate: null },
    weapon: { main: null, offhand: null },
    missile: { main: null },
    accessory: { primary: null },
    bag: []
  };
}

// Export default for convenience
export default gameState;
