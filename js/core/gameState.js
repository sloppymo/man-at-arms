(function() {
    'use strict';
    
    function makeDefaultGameState() {
        return {
            stats: {
                strength: 5,
                agility: 5,
                endurance: 5,
                charisma: 5,
                luck: 5,
                wits: 5, // Intelligence, tactical thinking
                wealth: 120, // 10 shillings = 120 pence (typical starting wealth for a man-at-arms)
                reputation: 0,
                morale: 5,
                stress: 0, // Stress/fatigue meter (separate from conditions)
                experience: 0,
                patronFavor: 0
            },
            faction: "English", // Player faction
            age: 27, // Default to prime age (will be set by ageRange)
            ageRange: null,
            year: 1337,
            location: "England",
            level: 1, // Character level
            levelUpPoints: 0, // Unspent stat points from leveling
            currentScene: "character_creation",
            chapter: null, // Current chapter: "chevauchée", "calais", "plague", "poitiers"
            chapterProgress: {
                chevauchée: { started: false, completed: false },
                calais: { started: false, completed: false },
                plague: { started: false, completed: false },
                poitiers: { started: false, completed: false }
            },
            characterCreationStep: 1, // Track which step of character creation (1-6)
            characterName: "",
            patronId: null, // Patron selection ID (james_olooney, lord_david, duke_caley, count_charles, ashkhan)
            patron: null, // Legacy field for backward compatibility
            patronEventPath: null, // Convenience copy of PATRONS[patronId].eventPath
            startingKitTier: null, // Resolved after priorities + patron
            background: null,
            scenesVisited: [],
            enteredScenes: new Set(), // Track scenes that have had onEnter called
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
            region: "England", // Normalized region for equipment availability
            conditions: [], // wounds, fatigue, etc.
            flags: {}, // story flags: Resentment, Dishonor, Shaken, etc.
            rank: "Common Soldier",
            relationships: { wat: 0, cook: 0, oana: 0 }, // NPC relationships (clamped -5..+5)
            campfire: {
                cooldownScenes: 2, // Must pass at least N scenes before another campfire
                chance: 0.35, // After cooldown, chance to insert
                lastInsertedAtIndex: 0,
                seenIds: [], // Vignette IDs seen
                returnScene: null, // Where to go after campfire
                currentVignetteId: null, // Currently active vignette
                currentStep: 0, // Current step in multi-step exchange (0 = opening, 1+ = follow-ups)
                stepHistory: [] // Track choices made in this exchange
            },
            randomEncounter: { active: false, returnScene: null, cooldown: 0 },
            career: {
                battles: 0,
                wounds: 0,
                promotions: 0
            }
        };
    }
    
    // Initialize gameState globally
    window.gameState = makeDefaultGameState();
    window.makeDefaultGameState = makeDefaultGameState;
})();
