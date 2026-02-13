(function() {
    'use strict';

    // ============================================
    // Constants
    // ============================================
    const SAVE_KEY = "manAtArmsGame";
    const SAVE_VERSION = 1;
    const RANDOM_ENCOUNTER_CHANCE = 0.12; // 12% per eligible transition
    const RANDOM_ENCOUNTER_COOLDOWN_SCENES = 3;
    const RANDOM_ENCOUNTERS = [
        'random_drunken_song',
        'random_lost_boot',
        'random_gambling_debt',
        'random_campfire_tale',
        'random_broken_sword',
        'random_stolen_horse',
        'random_food_poisoning',
        'random_weather_complaint',
        'random_insult_battle',
        'random_misplaced_gear',
        'random_dice_game',
        'random_cooking_disaster',
        'random_sleepwalking',
        'random_animal_encounter',
        'random_betrayal_joke'
    ];

    // ============================================
    // Save/Load System
    // ============================================
    function asNumber(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}

/** Merge loaded data into defaults without losing nested defaults */
function hydrateLoadedState(loaded) {
    const base = window.makeDefaultGameState();
    
    if (!loaded || typeof loaded !== "object") return base;
    
    // Top-level primitives/arrays/objects (shallow)
    Object.assign(base, loaded);
    
    // Deep-merge nested objects you rely on
    base.stats = { ...base.stats, ...(loaded.stats || {}) };
    base.flags = { ...base.flags, ...(loaded.flags || {}) };
    base.chapterProgress = { ...base.chapterProgress, ...(loaded.chapterProgress || {}) };
    base.relationships = { ...base.relationships, ...(loaded.relationships || {}) };
    base.career = { ...base.career, ...(loaded.career || {}) };
    
    // Initialize level system if not present
    if (typeof base.level !== 'number') {
        base.level = window.calculateLevel();
    }
    if (typeof base.levelUpPoints !== 'number') {
        base.levelUpPoints = 0;
    }
    // Recalculate level from experience to ensure consistency
    base.level = window.calculateLevel();
    
    // Equipment (handle both old and new format)
    if (loaded.equipment) {
        // New layered format
        if (loaded.equipment.head && typeof loaded.equipment.head === 'object' && !loaded.equipment.head.id) {
            base.equipment = {
                head: { ...base.equipment.head, ...(loaded.equipment.head || {}) },
                torso: { ...base.equipment.torso, ...(loaded.equipment.torso || {}) },
                arms: { ...base.equipment.arms, ...(loaded.equipment.arms || {}) },
                legs: { ...base.equipment.legs, ...(loaded.equipment.legs || {}) },
                weapon: { ...base.equipment.weapon, ...(loaded.equipment.weapon || {}) },
                missile: { ...base.equipment.missile, ...(loaded.equipment.missile || {}) },
                accessory: { ...base.equipment.accessory, ...(loaded.equipment.accessory || {}) },
                bag: Array.isArray(loaded.equipment.bag) ? loaded.equipment.bag : []
            };
        } else {
            // Old format - will be migrated by EquipmentManager
            base.equipment = { ...base.equipment, ...loaded.equipment };
        }
    }
    
    // Restore Set from array
    base.enteredScenes = new Set(Array.isArray(loaded.enteredScenes) ? loaded.enteredScenes : []);
    
    // Sanitize arrays
    base.scenesVisited = Array.isArray(loaded.scenesVisited) ? loaded.scenesVisited : [];
    
    // Sanitize inventory: validate all items exist in database
    if (Array.isArray(loaded.inventory)) {
        base.inventory = loaded.inventory
            .filter(invItem => invItem && invItem.id && 
                (typeof EQUIPMENT_DATABASE === 'undefined' || window.EQUIPMENT_DATABASE[invItem.id]))
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
    base.exertion = asNumber(base.exertion, 0);
    base.wear = asNumber(base.wear, 0);
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
        window.recalculateFromPriorities(base);
        
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
        base.stats[key] = window.clampStat(key, asNumber(base.stats[key], window.makeDefaultGameState().stats[key]));
    }
    
    // Coerce other numeric fields that matter
    base.age = asNumber(base.age, 18);
    base.year = asNumber(base.year, 1337);
    
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
    
    // Ensure inventory is an array
    if (!Array.isArray(base.inventory)) {
        base.inventory = [];
    }
    
    return base;
}

/** Normalize location to region (helper for migration) */
function normalizeRegion(location) {
    if (!location) return 'England';
    const loc = location.toLowerCase();
    if (loc.includes('england') || loc.includes('portsmouth') || loc.includes('london')) return 'England';
    if (loc.includes('france') || loc.includes('normandy') || loc.includes('caen') || loc.includes('calais')) return 'France';
    if (loc.includes('flanders')) return 'Flanders';
    if (loc.includes('italy') || loc.includes('milan')) return 'Northern Italy';
    return 'England';
}
// Save game
function saveGame() {
    try {
        // Check if combat is active
        if (window.isCombatActive) {
            window.showNotification("Cannot Save", "Cannot save during combat. Please wait.", "warning");
            return;
        }
        
        // Build a JSON-safe payload (no Sets)
        const saveData = {
            saveVersion: SAVE_VERSION,
            ...gameState,
            enteredScenes: Array.from(window.gameState.enteredScenes)
        };
        
        // Ink state preservation removed - Ink system no longer available
        
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        window.showNotification("Game Saved", "Your progress has been saved!", "success");
    } catch (err) {
        console.error("Save failed:", err);
        window.showNotification("Save Failed", "Could not save (storage full or blocked).", "error");
    }
}

// Load game
function loadGame() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
        window.showNotification("No Save Found", "No saved game found.", "error");
        return;
    }
    
    let loaded;
    try {
        loaded = JSON.parse(raw);
    } catch (err) {
        console.error("Corrupt save:", err);
        window.showNotification("Load Failed", "Save data is corrupted.", "error");
        return;
    }
    
    // Optional: handle future migrations here
    const version = asNumber(loaded.saveVersion, 0);
    if (version > SAVE_VERSION) {
        window.showNotification("Load Failed", "Save was made by a newer version of the game.", "error");
        return;
    }
    
    const hydrated = hydrateLoadedState(loaded);
    
    console.log("Loaded state hydrated:", hydrated);
    console.log("Current scene:", hydrated.currentScene);
    console.log("Background:", hydrated.background);
    
    // M6: Validate the saved scene still exists
    if (hydrated.currentScene && !window.scenes[hydrated.currentScene]) {
        console.warn("[SAVE] Scene", hydrated.currentScene, "no longer exists. Finding nearest checkpoint.");
        const checkpoints = [
            { year: 1337, scene: 'start' },
            { year: 1340, scene: 'winter_quarters' },
            { year: 1344, scene: 'return_to_england_1344' },
            { year: 1346, scene: 'spring_campaign' },
            { year: 1347, scene: 'calais_siege' }
        ];
        const playerYear = hydrated.year || 1337;
        let best = 'start';
        for (const cp of checkpoints) {
            if (cp.year <= playerYear && window.scenes[cp.scene]) {
                best = cp.scene;
            }
        }
        hydrated.currentScene = best;
        window.showNotification('Save Migration', 'Your save referenced a scene that no longer exists. Resuming from nearest checkpoint.', 'info');
    }
    
    // Overwrite the existing live state safely
    Object.keys(gameState).forEach(k => delete gameState[k]);
    Object.assign(gameState, hydrated);
    
    // Ensure enteredScenes is a Set (hydrateLoadedState should handle this, but double-check)
    if (!(window.gameState.enteredScenes instanceof Set)) {
        window.gameState.enteredScenes = new Set(Array.isArray(window.gameState.enteredScenes) ? window.gameState.enteredScenes : []);
    }
    
    // Sanitize user-controlled fields from save data to prevent XSS
    if (window.gameState.characterName) {
        window.gameState.characterName = window.escapeHTML(String(window.gameState.characterName));
    }
    
    // Ink state restoration removed - Ink system no longer available
    
    // Reinitialize equipment manager if it exists (will migrate old format)
    if (typeof EquipmentManager !== 'undefined') {
        try {
            window.equipmentManager = new EquipmentManager(gameState);
        } catch (e) {
            console.error("Error reinitializing equipment manager:", e);
        }
    }
    
    // Force update display to ensure UI reflects loaded state
    window.updateDisplay();
    window.showNotification("Game Loaded", "Your progress has been restored!", "success");
}
function resetGame() {
    const fresh = window.makeDefaultGameState();
    Object.keys(window.gameState).forEach(k => delete window.gameState[k]);
    Object.assign(window.gameState, fresh);
    window.updateDisplay();
}

    // ============================================
    // Random Encounter System
    // ============================================
    function returnFromRandomEncounter(fallback = 'start') {
        const rs = (window.gameState && window.gameState.randomEncounter && window.gameState.randomEncounter.returnScene) ? window.gameState.randomEncounter.returnScene : null;
    const target = (typeof rs === 'string' && rs.length) ? rs : fallback;
    if (window.gameState.randomEncounter) {
        window.gameState.randomEncounter.active = false;
        window.gameState.randomEncounter.returnScene = null;
    }
    return target;
}
    
function isCriticalSceneKey(sceneKey) {
    if (!sceneKey || typeof sceneKey !== 'string') return true;

    const criticalPrefixes = [
        'character_creation',
        'first_battle',
        'tutorial',
        'campfire',
        'death',
        'ending',
        'restart',
        'reset'
    ];

    for (const p of criticalPrefixes) {
        if (sceneKey.startsWith(p)) return true;
    }

    // Avoid interrupting resolution / combat plumbing.
    if (sceneKey.endsWith('_resolve')) return true;

    // Allow scenes to opt out explicitly.
    if (window.scenes[sceneKey] && window.scenes[sceneKey].noRandomEncounter) return true;

    return false;
}

function shouldInsertRandomEncounter(fromSceneKey, nextSceneKey) {
    // Never chain random encounters or interrupt a random return.
    if ((fromSceneKey || '').startsWith('random_')) return false;
    if ((nextSceneKey || '').startsWith('random_')) return false;

    // Cooldown
    if (window.gameState.randomEncounter && window.gameState.randomEncounter.cooldown > 0) return false;

    // Exclusions (important scenes / transitions)
    if (window.isCriticalSceneKey(fromSceneKey) || window.isCriticalSceneKey(nextSceneKey)) return false;

    return true;
}

function tickRandomEncounterCooldown(fromSceneKey) {
    if (!window.gameState.randomEncounter) return;
    if ((fromSceneKey || '').startsWith('random_')) return;
    if (window.gameState.randomEncounter.cooldown > 0) {
        window.gameState.randomEncounter.cooldown -= 1;
    }
}

function maybeInsertRandomEncounter(fromSceneKey, nextSceneKey) {
    // Fix D: Guard - randomEncounter should never return to resolve scene
    const invalidReturnScenes = ['skirmish_roadside_resolve', 'skirmish_roadside',
                                'skirmish_roadside_mud', 'skirmish_roadside_lane', 'campfire_interlude'];

    if (invalidReturnScenes.includes(nextSceneKey)) {
        console.warn('[QA ROUTING GUARD] Random encounter blocked - would return to:', nextSceneKey);
        return nextSceneKey; // Don't insert encounter
    }

    if (!window.shouldInsertRandomEncounter(fromSceneKey, nextSceneKey)) return nextSceneKey;
    if (Math.random() >= RANDOM_ENCOUNTER_CHANCE) return nextSceneKey;

    const encounterId = RANDOM_ENCOUNTERS[Math.floor(Math.random() * RANDOM_ENCOUNTERS.length)];

    if (!window.gameState.randomEncounter) {
        window.gameState.randomEncounter = { active: false, returnScene: null, cooldown: 0 };
    }

    let safeReturnScene = nextSceneKey;

    // Fix D: Double-check return scene is valid (redundant guard)
    if (invalidReturnScenes.includes(nextSceneKey)) {
        // Fallback to a safe travel scene
        safeReturnScene = (typeof window.scenes !== 'undefined' && window.scenes['march_through_normandy_1'] ? 'march_through_normandy_1' : 'start');
        console.warn('[QA] Random encounter returnScene was invalid:', nextSceneKey, 'using fallback:', safeReturnScene);
    }

    // Fix D: Assertion - verify we're not in a loop
    if (safeReturnScene === fromSceneKey && fromSceneKey && fromSceneKey.startsWith('random_')) {
        console.error('[QA ASSERTION FAILED] Random encounter would return to random scene! Using fallback.');
        safeReturnScene = (typeof window.scenes !== 'undefined' && window.scenes['march_through_normandy_1'] ? 'march_through_normandy_1' : 'start');
    }

    window.gameState.randomEncounter.active = true;
    window.gameState.randomEncounter.returnScene = safeReturnScene;
    window.gameState.randomEncounter.cooldown = RANDOM_ENCOUNTER_COOLDOWN_SCENES;

    return encounterId;
}

function maybeInsertSkirmish(nextSceneKey) {
    // Respect shared cooldown (skirmishes and random encounters share the same bucket)
    if (window.gameState.randomEncounter && window.gameState.randomEncounter.cooldown > 0) {
        return nextSceneKey;
    }
    
    // Check debug flag for forced skirmish
    if (window.gameState.debug && window.gameState.debug.forceSkirmish) {
        window.gameState.debug.forceSkirmish = false; // Reset after use
        // Set return scene and cooldown
        if (!window.gameState.randomEncounter) {
            window.gameState.randomEncounter = { active: false, returnScene: null, cooldown: 0 };
        }
        window.gameState.randomEncounter.returnScene = nextSceneKey;
        // Default to roadside for debug
        window.gameState.randomEncounter.lastKey = 'skirmish_roadside';
        window.gameState.randomEncounter.cooldown = 5;
        return 'skirmish_roadside';
    }
    
    // Avoid critical scenes (reuse isCriticalSceneKey logic)
    if (isCriticalSceneKey(nextSceneKey)) {
        return nextSceneKey;
    }
    
    // Avoid character creation, campfires
    if (nextSceneKey.startsWith('character_creation') || 
        nextSceneKey.startsWith('campfire')) {
        return nextSceneKey;
    }
    
    // Probability keyed to region/chapter/wealth/exertion
    // Base chance: 8% (lower than random encounters to avoid spam)
    let chance = 0.08;
    
    // Adjust by exertion (higher exertion = more likely, but cap at 15%)
    const exertion = window.gameState.exertion || 0;
    if (exertion >= 3) {
        chance += 0.03;
    }
    if (exertion >= 6) {
        chance += 0.02;
    }
    chance = Math.min(0.15, chance);
    
    // Adjust by wealth (poorer = more desperate = more likely)
    if (window.gameState.stats.wealth < 50) {
        chance += 0.02;
    }
    
    if (Math.random() >= chance) {
        return nextSceneKey;
    }
    
    // Set return scene and cooldown (shares randomEncounter object)
    if (!window.gameState.randomEncounter) {
        window.gameState.randomEncounter = { active: false, returnScene: null, cooldown: 0 };
    }
    
    window.gameState.randomEncounter.returnScene = nextSceneKey;
    
    // Randomly pick skirmish variant: 60% roadside, 20% mud, 20% lane
    const roll = Math.random();
    let variantKey;
    if (roll < 0.6) {
        variantKey = 'skirmish_roadside';
    } else if (roll < 0.8) {
        variantKey = 'skirmish_roadside_mud';
    } else {
        variantKey = 'skirmish_roadside_lane';
    }
    
    window.gameState.randomEncounter.lastKey = variantKey;
    window.gameState.randomEncounter.cooldown = 5; // 5 scenes cooldown (shared with random encounters)
    
    return variantKey;
}

    // ============================================
    // Character Creation System
    // ============================================
function getPriorityBonuses(category, letter) {
    const bonuses = {
        might: { A: { strength: 4, endurance: 4 }, B: { strength: 3, endurance: 3 }, C: { strength: 2, endurance: 2 }, D: { strength: 1, endurance: 1 }, E: { strength: 0, endurance: 0 } },
        finesse: { A: { agility: 5 }, B: { agility: 4 }, C: { agility: 3 }, D: { agility: 2 }, E: { agility: 1 } },
        wits: { A: { wits: 5 }, B: { wits: 4 }, C: { wits: 3 }, D: { wits: 2 }, E: { wits: 1 } },
        presence: { A: { charisma: 5 }, B: { charisma: 4 }, C: { charisma: 3 }, D: { charisma: 2 }, E: { charisma: 1 } },
        fortune: { 
            A: { luck: 4, wealth: 12, reputation: 2, kitTier: "Superior" },
            B: { luck: 3, wealth: 8, reputation: 1, kitTier: "Fine" },
            C: { luck: 2, wealth: 5, reputation: 0, kitTier: "Good" },
            D: { luck: 1, wealth: 2, reputation: 0, kitTier: "Standard" },
            E: { luck: 0, wealth: 0, reputation: 0, kitTier: "Ragged" }
        }
    };
    return bonuses[category] && bonuses[category][letter] ? bonuses[category][letter] : {};
}

/** Set priority for a category */
function setPriority(category, letter) {
    if (!window.gameState.priorities) {
        window.gameState.priorities = { might: null, finesse: null, wits: null, presence: null, fortune: null };
    }
    
    // Clear previous assignment of this letter
    if (letter) {
        Object.keys(window.gameState.priorities).forEach(function(key) {
            if (window.gameState.priorities[key] === letter && key !== category) {
                window.gameState.priorities[key] = null;
            }
        });
    }
    
    window.gameState.priorities[category] = letter || null;
    window.recalculateCharacterCreationDerivedStats();
    window.updateDisplay();
}

/** Select age range for character creation */
function selectAgeRange(ageId) {
    window.gameState.ageRange = ageId;
    window.recalculateCharacterCreationDerivedStats();
    window.updateDisplay();
}

// Make selectAgeRange globally available
window.selectAgeRange = selectAgeRange;

/** Select origin for character creation */
function selectOrigin(originId) {
    window.gameState.origin = originId;
    window.recalculateCharacterCreationDerivedStats();
    window.updateDisplay();
}

// Make selectOrigin globally available
window.selectOrigin = selectOrigin;

/** Select background for character creation */
function selectCharacterBackground(backgroundId) {
    console.log('selectCharacterBackground called with:', backgroundId);
    window.gameState.selectedBackground = backgroundId;
    console.log('selectedBackground set to:', window.gameState.selectedBackground);
    window.recalculateCharacterCreationDerivedStats();
    window.updateDisplay();
}

// Make selectCharacterBackground globally available
window.selectCharacterBackground = selectCharacterBackground;

/** Set patron for character creation */
function setPatron(patronId) {
    window.gameState.patronId = patronId;
    window.gameState.patron = patronId; // Legacy compatibility
    if (window.PATRONS && window.PATRONS[patronId]) {
        window.gameState.patronEventPath = window.PATRONS[patronId].eventPath;
    }
    window.recalculateCharacterCreationDerivedStats();
    window.updateDisplay();
}

// Make setPatron globally available
window.setPatron = setPatron;

/** Recalculate all character creation derived stats from scratch (anti-stacking fix) */
function recalculateCharacterCreationDerivedStats() {
    // Step 1: Start with base stats and apply priorities
    window.recalculateFromPriorities();
    
    // Step 2: Apply age range stat mods (silent)
    if (window.gameState.ageRange) {
        const ageStatMods = {
            'youth': { initiative: 2, agility: 1, endurance: -1, wits: -1 },
            'young_adult': { strength: 1, agility: 1, wits: -1 },
            'prime': { strength: 1, wits: 1 },
            'veteran': { wits: 2, endurance: 1, agility: -1 },
            'old_hand': { wits: 2, endurance: 1, charisma: 1, agility: -2, strength: -1 }
        };
        const ageMods = ageStatMods[window.gameState.ageRange];
        if (ageMods) {
            Object.keys(ageMods).forEach(function(stat) {
                window.applyStatChange(stat, ageMods[stat], {silent: true});
            });
        }
    }
    
    // Step 3: Apply origin stat mods (silent)
    if (window.gameState.origin) {
        switch(window.gameState.origin) {
            case 'rural_peasant':
                window.applyStatChange('endurance', 2, {silent: true});
                window.applyStatChange('wealth', -5, {silent: true});
                break;
            case 'manor_retainer':
                window.applyStatChange('strength', 1, {silent: true});
                window.applyStatChange('charisma', 1, {silent: true});
                break;
            case 'craftsman_apprentice':
                window.applyStatChange('wits', 1, {silent: true});
                window.applyStatChange('agility', 1, {silent: true});
                break;
            case 'squire':
                window.applyStatChange('strength', 1, {silent: true});
                window.applyStatChange('wits', 1, {silent: true});
                break;
            case 'minor_noble':
                window.applyStatChange('charisma', 1, {silent: true});
                window.applyStatChange('wits', 1, {silent: true});
                window.applyStatChange('reputation', 5, {silent: true});
                break;
        }
    }
    
    // Step 4: Apply background question mods (silent)
    if (window.gameState.selectedBackground) {
        const backgroundEffects = {
            hard_father: { strength: 1, endurance: 1, charisma: -1 },
            mangled_hand: { agility: -1, endurance: -1, wits: 3 },
            lost_sibling: { wits: 1, endurance: 1, morale: -1 },
            village_hero: { charisma: 1, reputation: 2, strength: -1 },
            apprentice_master: { wits: 2, agility: 1, stress: 1 },
            first_love: { charisma: -1, wits: 1, morale: 1 }
        };
        const effects = backgroundEffects[window.gameState.selectedBackground];
        if (effects) {
            Object.keys(effects).forEach(function(stat) {
                if (typeof applyStatChange === 'function') {
                    applyStatChange(stat, effects[stat], { silent: true });
                }
            });
        }
    }
    
    // Step 5: Apply patron stat mods (silent)
    if (window.gameState.patronId && window.PATRONS[window.gameState.patronId]) {
        const patron = window.PATRONS[window.gameState.patronId];
        if (patron.statMods) {
            Object.entries(patron.statMods).forEach(([stat, mod]) => {
                window.applyStatChange(stat, mod, {silent: true});
            });
        }
    }
    
    // Step 6: Resolve starting kit tier
    resolveStartingKitTier();
}

/** Resolve final starting kit tier from fortune priority + patron */
function resolveStartingKitTier() {
    const tierOrder = ["Ragged", "Standard", "Good", "Fine", "Superior"];
    
    // Get kit tier from fortune priority (already set by recalculateFromPriorities)
    const fortuneTier = window.gameState.kitTier || "Standard";
    const fortuneIdx = tierOrder.indexOf(fortuneTier);
    
    // Get kit tier from patron
    let patronTier = "Standard";
    if (window.gameState.patronId && window.PATRONS[window.gameState.patronId]) {
        const patronKitTier = window.PATRONS[window.gameState.patronId].kitTier || "standard";
        const mappedTier = KIT_TIER_MAP[patronKitTier] || "Standard";
        patronTier = mappedTier;
    }
    const patronIdx = tierOrder.indexOf(patronTier);
    
    // Use the better (higher) tier
    const finalIdx = Math.max(fortuneIdx >= 0 ? fortuneIdx : 1, patronIdx >= 0 ? patronIdx : 1);
    window.gameState.startingKitTier = tierOrder[finalIdx];
}

/** Recalculate stats from priorities */
function recalculateFromPriorities(targetState = null) {
    // Use provided state or default to global gameState
    const state = targetState || gameState;
    
    // Safety check: ensure state and stats exist
    if (!state) {
        console.error("recalculateFromPriorities: state is not defined");
        return;
    }
    if (!state.stats) {
        console.error("recalculateFromPriorities: state.stats is not defined");
        return;
    }
    
    if (!state.priorities) {
        state.priorities = { might: null, finesse: null, wits: null, presence: null, fortune: null };
    }
    
    // Start with base stats (all 5)
    state.stats.strength = 5;
    state.stats.agility = 5;
    state.stats.endurance = 5;
    state.stats.charisma = 5;
    state.stats.wits = 5;
    state.stats.luck = 5;
    state.stats.wealth = 10; // Base wealth
    state.stats.reputation = 0; // Base reputation
    
    // Apply priority bonuses
    Object.keys(state.priorities).forEach(function(category) {
        const letter = state.priorities[category];
        if (letter) {
            const bonuses = getPriorityBonuses(category, letter);
            Object.keys(bonuses).forEach(function(stat) {
                if (stat === 'kitTier') {
                    state.kitTier = bonuses[stat];
                } else if (state.stats.hasOwnProperty(stat)) {
                    state.stats[stat] += bonuses[stat];
                }
            });
        }
    });
    
    // Clamp all stats
    Object.keys(state.stats).forEach(function(stat) {
        state.stats[stat] = window.clampStat(stat, state.stats[stat]);
    });
    
    // Ensure kitTier is set
    if (!state.kitTier) {
        state.kitTier = "Standard";
    }
}

/** Validate priorities are complete and unique */
function validatePrioritiesCompleteAndUnique() {
    if (!window.gameState.priorities) {
        return { ok: false, message: "Please assign all priorities (A-E)." };
    }
    
    const priorities = window.gameState.priorities;
    const categories = ['might', 'finesse', 'wits', 'presence', 'fortune'];
    const assigned = [];
    const missing = [];
    
    categories.forEach(function(cat) {
        if (!priorities[cat] || priorities[cat] === '') {
            missing.push(cat);
        } else {
            if (assigned.includes(priorities[cat])) {
                return { ok: false, message: "Each priority (A-E) must be assigned exactly once." };
            }
            assigned.push(priorities[cat]);
        }
    });
    
    if (missing.length > 0) {
        return { ok: false, message: "Please assign all priorities (A-E). Missing: " + missing.length + " category(ies)." };
    }
    
    if (assigned.length !== 5) {
        return { ok: false, message: "Please assign exactly one priority (A-E) to each category." };
    }
    
    return { ok: true, message: "All priorities assigned correctly." };
}
/** Apply priority preset */
function applyPriorityPreset(presetId) {
    if (!window.gameState.priorities) {
        window.gameState.priorities = { might: null, finesse: null, wits: null, presence: null, fortune: null };
    }
    
    const presets = {
        brawny: { might: 'A', finesse: 'C', wits: 'D', presence: 'E', fortune: 'B' },
        cunning: { might: 'D', finesse: 'A', wits: 'B', presence: 'C', fortune: 'E' },
        court: { might: 'C', finesse: 'D', wits: 'B', presence: 'A', fortune: 'E' },
        lucky: { might: 'C', finesse: 'C', wits: 'C', presence: 'C', fortune: 'A' }
    };
    
    if (presets[presetId]) {
        Object.assign(window.gameState.priorities, presets[presetId]);
        window.recalculateFromPriorities();
        window.updateDisplay();
    }
}

/** Grant starting kit based on origin and fortune tier */
function grantStartingKit(origin, kitTier) {
    if (window.gameState.startingKitGranted) {
        return; // Already granted
    }
    
    if (!window.gameState.inventory) {
        window.gameState.inventory = [];
    }
    
    // Use resolved startingKitTier if available, otherwise fall back to parameter or default
    const tier = window.gameState.startingKitTier || kitTier || "Standard";
    
    // Kit shapes by origin
    const originKits = {
        rural_peasant: {
            Ragged: [{ id: "cudgel", name: "Cudgel", type: "weapon" }],
            Standard: [{ id: "cudgel", name: "Cudgel", type: "weapon" }, { id: "padded_jack", name: "Padded Jack", type: "armor" }],
            Good: [{ id: "knife", name: "Knife", type: "weapon" }, { id: "padded_jack", name: "Padded Jack", type: "armor" }, { id: "cap", name: "Leather Cap", type: "armor" }],
            Fine: [{ id: "arming_sword", name: "Arming Sword", type: "weapon" }, { id: "padded_jack", name: "Padded Jack", type: "armor" }, { id: "kettle_hat", name: "Kettle Hat", type: "armor" }],
            Superior: [{ id: "arming_sword", name: "Fine Arming Sword", type: "weapon" }, { id: "gambeson", name: "Gambeson", type: "armor" }, { id: "kettle_hat", name: "Kettle Hat", type: "armor" }, { id: "buckler", name: "Buckler", type: "shield" }]
        },
        manor_retainer: {
            Ragged: [{ id: "spear", name: "Spear", type: "weapon" }],
            Standard: [{ id: "spear", name: "Spear", type: "weapon" }, { id: "padded_jack", name: "Padded Jack", type: "armor" }],
            Good: [{ id: "bill", name: "Bill", type: "weapon" }, { id: "padded_jack", name: "Padded Jack", type: "armor" }, { id: "buckler", name: "Buckler", type: "shield" }],
            Fine: [{ id: "bill", name: "Bill", type: "weapon" }, { id: "gambeson", name: "Gambeson", type: "armor" }, { id: "kettle_hat", name: "Kettle Hat", type: "armor" }, { id: "buckler", name: "Buckler", type: "shield" }],
            Superior: [{ id: "bill", name: "Bill", type: "weapon" }, { id: "gambeson", name: "Gambeson", type: "armor" }, { id: "mail_coif", name: "Mail Coif", type: "armor" }, { id: "kettle_hat", name: "Kettle Hat", type: "armor" }, { id: "buckler", name: "Buckler", type: "shield" }]
        },
        craftsman_apprentice: {
            Ragged: [{ id: "knife", name: "Knife", type: "weapon" }],
            Standard: [{ id: "knife", name: "Knife", type: "weapon" }, { id: "leather_jerkin", name: "Leather Jerkin", type: "armor" }],
            Good: [{ id: "short_sword", name: "Short Sword", type: "weapon" }, { id: "leather_jerkin", name: "Leather Jerkin", type: "armor" }, { id: "cap", name: "Cap", type: "armor" }],
            Fine: [{ id: "arming_sword", name: "Arming Sword", type: "weapon" }, { id: "padded_jack", name: "Padded Jack", type: "armor" }, { id: "kettle_hat", name: "Kettle Hat", type: "armor" }],
            Superior: [{ id: "arming_sword", name: "Fine Arming Sword", type: "weapon" }, { id: "gambeson", name: "Gambeson", type: "armor" }, { id: "kettle_hat", name: "Kettle Hat", type: "armor" }, { id: "buckler", name: "Buckler", type: "shield" }]
        },
        squire: {
            Ragged: [{ id: "arming_sword", name: "Arming Sword", type: "weapon" }],
            Standard: [{ id: "arming_sword", name: "Arming Sword", type: "weapon" }, { id: "padded_jack", name: "Padded Jack", type: "armor" }],
            Good: [{ id: "arming_sword", name: "Arming Sword", type: "weapon" }, { id: "gambeson", name: "Gambeson", type: "armor" }, { id: "buckler", name: "Buckler", type: "shield" }],
            Fine: [{ id: "arming_sword", name: "Arming Sword", type: "weapon" }, { id: "gambeson", name: "Gambeson", type: "armor" }, { id: "mail_shirt", name: "Mail Shirt", type: "armor" }, { id: "kettle_hat", name: "Kettle Hat", type: "armor" }, { id: "buckler", name: "Buckler", type: "shield" }],
            Superior: [{ id: "arming_sword", name: "Fine Arming Sword", type: "weapon" }, { id: "gambeson", name: "Gambeson", type: "armor" }, { id: "mail_shirt", name: "Mail Shirt", type: "armor" }, { id: "bascinet", name: "Bascinet", type: "armor" }, { id: "buckler", name: "Buckler", type: "shield" }]
        },
        minor_noble: {
            Ragged: [{ id: "arming_sword", name: "Arming Sword", type: "weapon" }],
            Standard: [{ id: "arming_sword", name: "Arming Sword", type: "weapon" }, { id: "gambeson", name: "Gambeson", type: "armor" }],
            Good: [{ id: "arming_sword", name: "Arming Sword", type: "weapon" }, { id: "gambeson", name: "Gambeson", type: "armor" }, { id: "mail_shirt", name: "Mail Shirt", type: "armor" }, { id: "buckler", name: "Buckler", type: "shield" }],
            Fine: [{ id: "arming_sword", name: "Arming Sword", type: "weapon" }, { id: "gambeson", name: "Gambeson", type: "armor" }, { id: "mail_shirt", name: "Mail Shirt", type: "armor" }, { id: "bascinet", name: "Bascinet", type: "armor" }, { id: "buckler", name: "Buckler", type: "shield" }],
            Superior: [{ id: "arming_sword", name: "Fine Arming Sword", type: "weapon" }, { id: "gambeson", name: "Gambeson", type: "armor" }, { id: "mail_shirt", name: "Mail Shirt", type: "armor" }, { id: "bascinet", name: "Visored Bascinet", type: "armor" }, { id: "buckler", name: "Buckler", type: "shield" }, { id: "rondel_dagger", name: "Rondel Dagger", type: "weapon" }]
        }
    };
    
    const selectedOrigin = origin || 'rural_peasant';
    const kit = originKits[selectedOrigin] && originKits[selectedOrigin][tier] ? originKits[selectedOrigin][tier] : originKits.rural_peasant[tier] || originKits.rural_peasant.Standard;
    
    // Add items to inventory
    kit.forEach(function(item) {
        window.gameState.inventory.push({
            id: item.id,
            name: item.name,
            type: item.type,
            condition: tier === "Ragged" ? 0.5 : tier === "Standard" ? 0.7 : tier === "Good" ? 0.8 : tier === "Fine" ? 0.9 : 1.0,
            fit: "standard"
        });
    });
    
    // Auto-equip basic items if equipment manager exists
    if (typeof EquipmentManager !== 'undefined' && window.equipmentManager) {
        kit.forEach(function(item) {
            try {
                if (item.type === "weapon") {
                    // Check if weapon already equipped using adapter
                    const currentWeapon = window.getEquippedItem('weapon', 'primary');
                    if (!currentWeapon || !currentWeapon.id) {
                        const invItem = window.gameState.inventory.find(function(i) { return i.id === item.id; });
                        if (invItem) {
                            const equipSuccess = window.equipmentManager.equipItem(invItem.id, 'weapon', 'primary');
                            // Verify equipment actually changed
                            const afterEquip = window.getEquippedItem('weapon', 'primary');
                            if (equipSuccess === false || !afterEquip || afterEquip.id !== invItem.id) {
                                console.warn('[QA] Auto-equip failed for:', invItem.id, 'slot: weapon');
                            }
                        }
                    }
                } else if (item.type === "armor" && item.id.includes("hat")) {
                    // Check if head already equipped using adapter
                    const currentHead = window.getEquippedItem('head', 'plate');
                    if (!currentHead || !currentHead.id) {
                        const invItem = window.gameState.inventory.find(function(i) { return i.id === item.id; });
                        if (invItem) {
                            const equipSuccess = window.equipmentManager.equipItem(invItem.id, 'head', 'plate');
                            // Verify equipment actually changed
                            const afterEquip = window.getEquippedItem('head', 'plate');
                            if (equipSuccess === false || !afterEquip || afterEquip.id !== invItem.id) {
                                console.warn('[QA] Auto-equip failed for:', invItem.id, 'slot: head');
                            }
                        }
                    }
                } else if (item.type === "armor") {
                    // Check if torso already equipped using adapter
                    const currentTorso = window.getEquippedItem('torso', 'plate');
                    if (!currentTorso || !currentTorso.id) {
                        const invItem = window.gameState.inventory.find(function(i) { return i.id === item.id && i.type === "armor"; });
                        if (invItem) {
                            const equipSuccess = window.equipmentManager.equipItem(invItem.id, 'torso', 'plate');
                            // Verify equipment actually changed
                            const afterEquip = window.getEquippedItem('torso', 'plate');
                            if (equipSuccess === false || !afterEquip || afterEquip.id !== invItem.id) {
                                console.warn('[QA] Auto-equip failed for:', invItem.id, 'slot: torso');
                            }
                        }
                    }
                } else if (item.type === "shield") {
                    // Use canonical 'offhand' slot for shields
                    const normalizedSlot = (typeof window.normalizeSlot === 'function') 
                        ? window.normalizeSlot('offhand') 
                        : 'offhand';
                    // Check if offhand already equipped (check both canonical and legacy slots for compatibility)
                    const currentOffhand = window.getEquippedItem('offhand', 'item') || window.getEquippedItem('accessory', 'item');
                    if (!currentOffhand || !currentOffhand.id) {
                        const invItem = window.gameState.inventory.find(function(i) { return i.id === item.id; });
                        if (invItem) {
                            // Use canonical slot name
                            const equipSuccess = window.equipmentManager.equipItem(invItem.id, normalizedSlot);
                            if (equipSuccess === false || (equipSuccess !== true && !window.gameState.equipment[normalizedSlot]?.item)) {
                                console.warn('[QA] Auto-equip failed for:', invItem.id, 'slot:', normalizedSlot);
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn("Could not auto-equip " + item.name + ":", e);
            }
        });
    }
    
    window.gameState.startingKitGranted = true;
}
function selectBackground(bg) {
    window.gameState.background = bg;
    // Update button styles
    ['peasant', 'merchant', 'noble'].forEach(b => {
        const btn = document.getElementById(`bg-${b}`);
        if (btn) {
            if (b === bg) {
                btn.style.background = '#d4af37';
                btn.style.color = '#1a0f08';
            } else {
                btn.style.background = '#2a2a2a';
                btn.style.color = '#d4af37';
            }
        }
    });
    window.updateDisplay();
}

// Character Creation Step Navigation
function nextCharacterCreationStep() {
    const currentStep = window.gameState.characterCreationStep || 1;
    const maxStep = 6;
    if (currentStep < maxStep) {
        window.gameState.characterCreationStep = currentStep + 1;
        window.updateDisplay();
    } else if (currentStep === maxStep) {
        // On step 6, clicking Next creates the character
        window.completeCharacterCreation();
    }
}

// Make completeCharacterCreation globally accessible
window.completeCharacterCreation = function() {
    console.log('completeCharacterCreation called');
    console.log('Current patronId:', window.gameState.patronId);
    console.log('Current patron:', window.gameState.patron);
    
    // Validate required fields
    if (!window.gameState.characterName || window.gameState.characterName.trim() === '') {
        window.gameState.characterName = "William Thatcher";
    }
    if (!window.gameState.culture) {
        window.showNotification('Character Creation', 'Please select your region.');
        return;
    }
    if (!window.gameState.ageRange) {
        window.showNotification('Character Creation', 'Please select your age range.');
        return;
    }
    if (!window.gameState.origin) {
        window.showNotification('Character Creation', 'Please select your origin.');
        return;
    }
    
    // Validate patron is selected
    if (!window.gameState.patronId && !window.gameState.patron) {
        window.showNotification('Character Creation', 'Please select a patron before continuing.');
        return;
    }
    
    // Validate background is selected
    if (!window.gameState.selectedBackground) {
        window.showNotification('Character Creation', 'Please select a background before continuing.');
        return;
    }
    
    // Resolve final starting kit tier and grant kit if not already granted
    if (!window.gameState.startingKitGranted) {
        // Ensure all stats are recalculated (includes kit tier resolution)
        window.recalculateCharacterCreationDerivedStats();
        const origin = window.gameState.origin || 'rural_peasant';
        window.grantStartingKit(origin, window.gameState.startingKitTier);
    }
    
    // Transition to start scene
    window.gameState.currentScene = "start";
    window.updateDisplay();
};
function prevCharacterCreationStep() {
    const currentStep = window.gameState.characterCreationStep || 1;
    if (currentStep > 1) {
        window.gameState.characterCreationStep = currentStep - 1;
        window.updateDisplay();
    }
}

function goToCharacterCreationStep(step) {
    if (step >= 1 && step <= 6) {
        window.gameState.characterCreationStep = step;
        window.updateDisplay();
    }
}

// Render step navigation buttons
function renderStepNavigation(currentStep, maxStep) {
    const canGoBack = currentStep > 1;
    const isLastStep = currentStep === maxStep;
    
    let navHtml = '<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #8b6914;">';
    
    // Step indicator
    navHtml += '<div style="color: #d4af37; font-size: 14px;">Step ' + currentStep + ' of ' + maxStep + '</div>';
    
    // Navigation buttons
    navHtml += '<div style="display: flex; gap: 10px;">';
    
    if (canGoBack) {
        navHtml += '<button onclick="window.prevCharacterCreationStep()" style="padding: 10px 20px; background: #2a2a2a; border: 2px solid #d4af37; color: #d4af37; border-radius: 5px; cursor: pointer; font-size: 14px; font-family: \'Crimson Text\', serif;">← Previous</button>';
    } else {
        navHtml += '<button disabled style="padding: 10px 20px; background: #1a1a1a; border: 2px solid #555; color: #666; border-radius: 5px; font-size: 14px; font-family: \'Crimson Text\', serif; cursor: not-allowed;">← Previous</button>';
    }
    
    if (isLastStep) {
        // On last step, show "Begin Journey" button
        navHtml += '<button onclick="window.completeCharacterCreation()" style="padding: 10px 20px; background: #d4af37; border: 2px solid #f4d03f; color: #1a0f08; border-radius: 5px; cursor: pointer; font-size: 14px; font-family: \'Crimson Text\', serif; font-weight: bold;">Begin Your Journey →</button>';
    } else {
        navHtml += '<button onclick="window.nextCharacterCreationStep()" style="padding: 10px 20px; background: #2a2a2a; border: 2px solid #d4af37; color: #d4af37; border-radius: 5px; cursor: pointer; font-size: 14px; font-family: \'Crimson Text\', serif;">Next →</button>';
    }
    
    navHtml += '</div>';
    navHtml += '</div>';
    
    return navHtml;
}

// Character Creation Step Render Functions
function renderCharacterCreationStep1(nameDisplay, currentCulture) {
    const nameSuggestions = {
        "Yorkshire": ["William", "John", "Thomas", "Richard", "Robert", "Henry", "Geoffrey", "Roger", "Edward", "Hugh", "Simon", "Walter", "Ralph", "Nicholas", "Peter"],
        "Kent": ["William", "John", "Thomas", "Richard", "Robert", "Henry", "Geoffrey", "Roger", "Edward", "Hugh", "Simon", "Walter", "Ralph", "Nicholas", "Peter"],
        "London": ["William", "John", "Thomas", "Richard", "Robert", "Henry", "Geoffrey", "Roger", "Edward", "Hugh", "Simon", "Walter", "Ralph", "Nicholas", "Peter"],
        "Cornwall": ["William", "John", "Thomas", "Richard", "Robert", "Henry", "Geoffrey", "Roger", "Edward", "Hugh", "Simon", "Walter", "Ralph", "Nicholas", "Peter"],
        "Lancashire": ["William", "John", "Thomas", "Richard", "Robert", "Henry", "Geoffrey", "Roger", "Edward", "Hugh", "Simon", "Walter", "Ralph", "Nicholas", "Peter"],
        "Essex": ["William", "John", "Thomas", "Richard", "Robert", "Henry", "Geoffrey", "Roger", "Edward", "Hugh", "Simon", "Walter", "Ralph", "Nicholas", "Peter"],
        "Norfolk": ["William", "John", "Thomas", "Richard", "Robert", "Henry", "Geoffrey", "Roger", "Edward", "Hugh", "Simon", "Walter", "Ralph", "Nicholas", "Peter"],
        "Somerset": ["William", "John", "Thomas", "Richard", "Robert", "Henry", "Geoffrey", "Roger", "Edward", "Hugh", "Simon", "Walter", "Ralph", "Nicholas", "Peter"]
    };
    
    const regionFlavor = {
        "Yorkshire": "You hail from the rugged moors and dales of Yorkshire. The longbow is your birthright, and you know the weight of honest labor. Your northern accent marks you among southerners, but your loyalty to the Crown is unquestioned. You are a Yorkshireman, and you will fight for King Edward and the realm.",
        "Kent": "You come from the fertile fields and bustling ports of Kent. The Channel is your neighbor, and you've seen French ships on the horizon. Your accent carries the weight of the south, and your loyalty to the Crown runs deep. You are a Kentishman, and you will fight for King Edward and the realm.",
        "London": "You are a son of London—the great city where merchants and nobles mix. You know the value of coin and the weight of reputation. Your speech marks you as a man of the capital, and your loyalty to the Crown is absolute. You are a Londoner, and you will fight for King Edward and the realm.",
        "Cornwall": "You hail from the wild coasts and tin mines of Cornwall. The sea is in your blood, and you know the ways of both land and water. Your Cornish heritage sets you apart, but your loyalty to the Crown is steadfast. You are a Cornishman, and you will fight for King Edward and the realm.",
        "Lancashire": "You come from the rolling hills and wool towns of Lancashire. The trade routes run through your land, and you know the value of hard work. Your northern roots shape you, and your loyalty to the Crown is unwavering. You are a Lancastrian, and you will fight for King Edward and the realm.",
        "Essex": "You hail from the rich farmlands and ports of Essex. The Thames flows near, and you've seen the wealth of London. Your eastern accent marks you, and your loyalty to the Crown is true. You are an Essex man, and you will fight for King Edward and the realm.",
        "Norfolk": "You come from the fens and ports of Norfolk. The sea and the land are both your home, and you know the ways of both. Your eastern roots shape you, and your loyalty to the Crown is resolute. You are a Norfolk man, and you will fight for King Edward and the realm.",
        "Somerset": "You hail from the green hills and cider country of Somerset. The West Country is your home, and you know the value of honest toil. Your western accent marks you, and your loyalty to the Crown is firm. You are a Somerset man, and you will fight for King Edward and the realm."
    };
    
    return '<div style="margin-bottom: 30px; padding: 20px; background: rgba(212, 175, 55, 0.15); border: 2px solid #d4af37; border-radius: 8px;">' +
        '<div style="margin-bottom: 20px; padding: 15px; background: rgba(139, 105, 20, 0.3); border: 2px solid #8b6914; border-radius: 5px; text-align: center;">' +
            '<div style="color: #f4d03f; font-weight: bold; margin-bottom: 10px; font-size: 1.1em;">Want to jump right in?</div>' +
            '<button onclick="window.generateQuickStartCharacter()" style="padding: 12px 24px; background: #8b6914; border: 2px solid #d4af37; color: #f4d03f; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; transition: all 0.3s;" onmouseover="this.style.background=\'#d4af37\'; this.style.color=\'#1a0f08\';" onmouseout="this.style.background=\'#8b6914\'; this.style.color=\'#f4d03f\';">⚡ Quick Start</button>' +
            '<div style="color: #888; font-size: 12px; margin-top: 8px; font-style: italic;">We will randomly generate a character for you</div>' +
        '</div>' +
        '<h3 style="color: #f4d03f; margin-bottom: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">Step 1 — Identity</h3>' +
        '<div style="margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 5px;">' +
            '<label style="display: block; color: #d4af37; margin-bottom: 8px; font-weight: bold;">Your Name:</label>' +
            '<input type="text" id="character-name-input" placeholder="Enter your name" ' +
                   'value="' + (nameDisplay || "William Thatcher") + '" ' +
                   'list="name-suggestions" ' +
                   'style="width: 100%; padding: 10px; background: #2a2a2a; border: 2px solid #d4af37; color: #d4af37; border-radius: 5px; font-size: 16px; font-family: \'Crimson Text\', serif; margin-bottom: 15px;" ' +
                   'onfocus="if(this.value === \'William Thatcher\') { this.value = \'\'; }" ' +
                   'onblur="if(this.value.trim() === \'\') { this.value = \'William Thatcher\'; }" ' +
                   'onchange="window.gameState.characterName = this.value.trim() || \'William Thatcher\'; window.updateDisplay();">' +
            '<datalist id="name-suggestions">' +
                (currentCulture && nameSuggestions[currentCulture] ? nameSuggestions[currentCulture].map(function(n) { return '<option value="' + n + '">'; }).join('') : '') +
            '</datalist>' +
        '</div>' +
        '<div style="margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 5px;">' +
            '<label style="display: block; color: #d4af37; margin-bottom: 10px; font-weight: bold;">Your Region:</label>' +
            '<div style="position: relative; margin-bottom: 15px; display: inline-block; width: 100%; max-width: 800px;">' +
                '<img id="uk-map-image" src="artwork/map.jpg" alt="Map of England" style="width: 100%; max-width: 800px; height: auto; border: 2px solid #d4af37; border-radius: 5px; display: block; margin: 0 auto; background: rgba(26, 15, 8, 0.8);" />' +
                '<button id="region-marker-Lancashire" onclick="window.selectCulture(\'Lancashire\')" onmouseover="window.showRegionTooltip(event, \'Lancashire\')" onmouseout="window.hideRegionTooltip()" style="position: absolute; left: calc(44.8% + 45px); top: 25.2%; transform: translate(-50%, -50%); width: 28px; height: 28px; border-radius: 50%; border: 4px solid ' + (currentCulture === 'Lancashire' ? '#ffd700' : '#ff6b35') + '; background: ' + (currentCulture === 'Lancashire' ? 'rgba(255, 215, 0, 0.95)' : 'rgba(255, 107, 53, 0.9)') + '; cursor: pointer; z-index: 10; box-shadow: 0 0 12px rgba(255, 107, 53, 1), 0 0 6px rgba(255, 215, 0, 0.8), inset 0 0 8px rgba(255, 255, 255, 0.3); transition: all 0.3s;" title="Lancashire"></button>' +
                '<button id="region-marker-Yorkshire" onclick="window.selectCulture(\'Yorkshire\')" onmouseover="window.showRegionTooltip(event, \'Yorkshire\')" onmouseout="window.hideRegionTooltip()" style="position: absolute; left: calc(57.2% + 45px); top: 47.5%; transform: translate(-50%, -50%); width: 28px; height: 28px; border-radius: 50%; border: 4px solid ' + (currentCulture === 'Yorkshire' ? '#ffd700' : '#ff6b35') + '; background: ' + (currentCulture === 'Yorkshire' ? 'rgba(255, 215, 0, 0.95)' : 'rgba(255, 107, 53, 0.9)') + '; cursor: pointer; z-index: 10; box-shadow: 0 0 12px rgba(255, 107, 53, 1), 0 0 6px rgba(255, 215, 0, 0.8), inset 0 0 8px rgba(255, 255, 255, 0.3); transition: all 0.3s;" title="Yorkshire"></button>' +
                '<button id="region-marker-Norfolk" onclick="window.selectCulture(\'Norfolk\')" onmouseover="window.showRegionTooltip(event, \'Norfolk\')" onmouseout="window.hideRegionTooltip()" style="position: absolute; left: calc(69.2% + 45px); top: 69.8%; transform: translate(-50%, -50%); width: 28px; height: 28px; border-radius: 50%; border: 4px solid ' + (currentCulture === 'Norfolk' ? '#ffd700' : '#ff6b35') + '; background: ' + (currentCulture === 'Norfolk' ? 'rgba(255, 215, 0, 0.95)' : 'rgba(255, 107, 53, 0.9)') + '; cursor: pointer; z-index: 10; box-shadow: 0 0 12px rgba(255, 107, 53, 1), 0 0 6px rgba(255, 215, 0, 0.8), inset 0 0 8px rgba(255, 255, 255, 0.3); transition: all 0.3s;" title="Norfolk"></button>' +
                '<button id="region-marker-Essex" onclick="window.selectCulture(\'Essex\')" onmouseover="window.showRegionTooltip(event, \'Essex\')" onmouseout="window.hideRegionTooltip()" style="position: absolute; left: calc(66.4% + 45px); top: 76.2%; transform: translate(-50%, -50%); width: 28px; height: 28px; border-radius: 50%; border: 4px solid ' + (currentCulture === 'Essex' ? '#ffd700' : '#ff6b35') + '; background: ' + (currentCulture === 'Essex' ? 'rgba(255, 215, 0, 0.95)' : 'rgba(255, 107, 53, 0.9)') + '; cursor: pointer; z-index: 10; box-shadow: 0 0 12px rgba(255, 107, 53, 1), 0 0 6px rgba(255, 215, 0, 0.8), inset 0 0 8px rgba(255, 255, 255, 0.3); transition: all 0.3s;" title="Essex"></button>' +
                '<button id="region-marker-London" onclick="window.selectCulture(\'London\')" onmouseover="window.showRegionTooltip(event, \'London\')" onmouseout="window.hideRegionTooltip()" style="position: absolute; left: calc(61.8% + 45px); top: 78.4%; transform: translate(-50%, -50%); width: 32px; height: 32px; border-radius: 50%; border: 5px solid ' + (currentCulture === 'London' ? '#ffd700' : '#ff6b35') + '; background: ' + (currentCulture === 'London' ? 'rgba(255, 215, 0, 0.95)' : 'rgba(255, 107, 53, 0.9)') + '; cursor: pointer; z-index: 10; box-shadow: 0 0 15px rgba(255, 107, 53, 1.2), 0 0 8px rgba(255, 215, 0, 1), inset 0 0 10px rgba(255, 255, 255, 0.4); transition: all 0.3s; font-weight: bold; font-size: 16px; line-height: 32px;" title="London">⚔</button>' +
                '<button id="region-marker-Kent" onclick="window.selectCulture(\'Kent\')" onmouseover="window.showRegionTooltip(event, \'Kent\')" onmouseout="window.hideRegionTooltip()" style="position: absolute; left: calc(70.5% + 45px); top: 83.8%; transform: translate(-50%, -50%); width: 28px; height: 28px; border-radius: 50%; border: 4px solid ' + (currentCulture === 'Kent' ? '#ffd700' : '#ff6b35') + '; background: ' + (currentCulture === 'Kent' ? 'rgba(255, 215, 0, 0.95)' : 'rgba(255, 107, 53, 0.9)') + '; cursor: pointer; z-index: 10; box-shadow: 0 0 12px rgba(255, 107, 53, 1), 0 0 6px rgba(255, 215, 0, 0.8), inset 0 0 8px rgba(255, 255, 255, 0.3); transition: all 0.3s;" title="Kent"></button>' +
                '<button id="region-marker-Somerset" onclick="window.selectCulture(\'Somerset\')" onmouseover="window.showRegionTooltip(event, \'Somerset\')" onmouseout="window.hideRegionTooltip()" style="position: absolute; left: calc(44.2% + 45px); top: 72.8%; transform: translate(-50%, -50%); width: 28px; height: 28px; border-radius: 50%; border: 4px solid ' + (currentCulture === 'Somerset' ? '#ffd700' : '#ff6b35') + '; background: ' + (currentCulture === 'Somerset' ? 'rgba(255, 215, 0, 0.95)' : 'rgba(255, 107, 53, 0.9)') + '; cursor: pointer; z-index: 10; box-shadow: 0 0 12px rgba(255, 107, 53, 1), 0 0 6px rgba(255, 215, 0, 0.8), inset 0 0 8px rgba(255, 255, 255, 0.3); transition: all 0.3s;" title="Somerset"></button>' +
                '<button id="region-marker-Cornwall" onclick="window.selectCulture(\'Cornwall\')" onmouseover="window.showRegionTooltip(event, \'Cornwall\')" onmouseout="window.hideRegionTooltip()" style="position: absolute; left: calc(36.2% + 45px); top: 89.5%; transform: translate(-50%, -50%); width: 28px; height: 28px; border-radius: 50%; border: 4px solid ' + (currentCulture === 'Cornwall' ? '#ffd700' : '#ff6b35') + '; background: ' + (currentCulture === 'Cornwall' ? 'rgba(255, 215, 0, 0.95)' : 'rgba(255, 107, 53, 0.9)') + '; cursor: pointer; z-index: 10; box-shadow: 0 0 12px rgba(255, 107, 53, 1), 0 0 6px rgba(255, 215, 0, 0.8), inset 0 0 8px rgba(255, 255, 255, 0.3); transition: all 0.3s;" title="Cornwall"></button>' +
                '<div id="region-tooltip" style="position: absolute; display: none; background: rgba(0, 0, 0, 0.95); border: 2px solid #d4af37; border-radius: 5px; padding: 12px; max-width: 300px; z-index: 1000; pointer-events: none; color: #d4af37; font-size: 13px; line-height: 1.5; box-shadow: 0 4px 12px rgba(0,0,0,0.8);"></div>' +
            '</div>' +
            (currentCulture && regionFlavor[currentCulture] ? 
                '<div style="padding: 12px; background: rgba(212, 175, 55, 0.15); border: 2px solid #d4af37; border-radius: 5px; margin-top: 10px;">' +
                    '<div style="color: #f4d03f; font-weight: bold; margin-bottom: 8px;">Selected: ' + currentCulture + '</div>' +
                    '<div style="color: #d4af37; font-style: italic; font-size: 13px; line-height: 1.5;">' + regionFlavor[currentCulture] + '</div>' +
                '</div>' :
                '<div style="padding: 10px; background: rgba(139, 105, 20, 0.1); border: 1px dashed #8b6914; border-radius: 5px; margin-top: 10px; text-align: center; color: #888; font-size: 12px;">Click a region on the map above to select your origin</div>') +
        '</div>' +
    '</div>';
}

function renderCharacterCreationStep2(currentAgeRange) {
    const ageRanges = [
        { id: 'youth', name: 'Youth (16-19)', description: 'Fresh-faced and eager, but untested in the ways of war.', advantages: ['+2 Initiative', '+1 Agility', 'Quick to learn'], drawbacks: ['-1 Endurance', '-1 Wits', 'Less respect from veterans'], statMods: { initiative: 2, agility: 1, endurance: -1, wits: -1 }, numericAge: 18 },
        { id: 'young_adult', name: 'Young Adult (20-24)', description: 'In your prime, strong and fast with growing experience.', advantages: ['+1 Strength', '+1 Agility', 'Peak physical condition'], drawbacks: ['-1 Wits', 'Still learning tactics'], statMods: { strength: 1, agility: 1, wits: -1 }, numericAge: 22 },
        { id: 'prime', name: 'Prime (25-30)', description: 'The perfect balance of strength, speed, and wisdom.', advantages: ['+1 Strength', '+1 Wits', 'Balanced capabilities'], drawbacks: ['None - the ideal age for a soldier'], statMods: { strength: 1, wits: 1 }, numericAge: 27 },
        { id: 'veteran', name: 'Veteran (31-35)', description: 'Seasoned by years of service, wise but slower.', advantages: ['+2 Wits', '+1 Endurance', 'Respected by peers'], drawbacks: ['-1 Agility', 'Slower reflexes'], statMods: { wits: 2, endurance: 1, agility: -1 }, numericAge: 33 },
        { id: 'old_hand', name: 'Old Hand (36-40)', description: 'A grizzled veteran with hard-won wisdom, but age takes its toll.', advantages: ['+2 Wits', '+1 Endurance', '+1 Charisma', 'Greatly respected'], drawbacks: ['-2 Agility', '-1 Strength', 'Slower in combat'], statMods: { wits: 2, endurance: 1, charisma: 1, agility: -2, strength: -1 }, numericAge: 38 }
    ];
    
    return '<div style="margin-bottom: 30px; padding: 20px; background: rgba(212, 175, 55, 0.15); border: 2px solid #d4af37; border-radius: 8px;">' +
        '<h3 style="color: #f4d03f; margin-bottom: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">Step 2 — Age Range</h3>' +
        '<p style="color: #888; font-size: 14px; margin-bottom: 20px;">Choose the age range that best describes your character. Each has unique advantages and drawbacks.</p>' +
        '<div style="display: grid; grid-template-columns: 1fr; gap: 12px;">' +
            ageRanges.map(function(range) {
                const isSelected = currentAgeRange === range.id;
                return '<button onclick="window.selectAgeRange(\'' + range.id + '\')" style="padding: 15px; background: ' + (isSelected ? '#d4af37' : '#2a2a2a') + '; border: 2px solid #d4af37; color: ' + (isSelected ? '#1a0f08' : '#d4af37') + '; border-radius: 5px; cursor: pointer; text-align: left; transition: all 0.2s;">' +
                    '<strong style="font-size: 1.1em; display: block; margin-bottom: 5px;">' + range.name + '</strong>' +
                    '<div style="font-size: 13px; font-style: italic; color: ' + (isSelected ? '#1a0f08' : '#888') + '; margin-bottom: 10px;">' + range.description + '</div>' +
                    '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">' +
                        '<div style="padding: 8px; background: rgba(0, 150, 0, ' + (isSelected ? '0.3' : '0.1') + '); border-radius: 3px;">' +
                            '<div style="font-size: 11px; font-weight: bold; color: ' + (isSelected ? '#0a5a0a' : '#0f0') + '; margin-bottom: 5px;">Advantages:</div>' +
                            '<ul style="margin: 0; padding-left: 20px; font-size: 12px; color: ' + (isSelected ? '#1a0f08' : '#0f0') + ';">' +
                                range.advantages.map(function(adv) { return '<li>' + adv + '</li>'; }).join('') +
                            '</ul>' +
                        '</div>' +
                        '<div style="padding: 8px; background: rgba(150, 0, 0, ' + (isSelected ? '0.3' : '0.1') + '); border-radius: 3px;">' +
                            '<div style="font-size: 11px; font-weight: bold; color: ' + (isSelected ? '#5a0a0a' : '#f00') + '; margin-bottom: 5px;">Drawbacks:</div>' +
                            '<ul style="margin: 0; padding-left: 20px; font-size: 12px; color: ' + (isSelected ? '#1a0f08' : '#f66') + ';">' +
                                range.drawbacks.map(function(draw) { return '<li>' + draw + '</li>'; }).join('') +
                            '</ul>' +
                        '</div>' +
                    '</div>' +
                '</button>';
            }).join('') +
        '</div>' +
    '</div>';
}

function renderCharacterCreationStep3() {
    return '<div style="margin-bottom: 30px; padding: 20px; background: rgba(212, 175, 55, 0.15); border: 2px solid #d4af37; border-radius: 8px;">' +
        '<h3 style="color: #f4d03f; margin-bottom: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">Step 3 — Origin Story</h3>' +
        '<p style="color: #888; font-size: 14px; margin-bottom: 20px;">Your origin unlocks unique story paths, advantages, and challenges that shape your journey.</p>' +
        '<div style="display: grid; grid-template-columns: 1fr; gap: 15px;">' +
            '<button onclick="window.selectOrigin(\'rural_peasant\')" style="padding: 20px; background: ' + (window.gameState.origin === 'rural_peasant' ? '#d4af37' : '#2a2a2a') + '; border: 2px solid #d4af37; color: ' + (window.gameState.origin === 'rural_peasant' ? '#1a0f08' : '#d4af37') + '; border-radius: 5px; cursor: pointer; text-align: left;">' +
                '<strong style="font-size: 1.1em;">Rural Peasant</strong>' +
                '<div style="font-size: 14px; margin-top: 8px; color: ' + (window.gameState.origin === 'rural_peasant' ? '#1a0f08' : '#888') + ';">' +
                    '<div style="margin-bottom: 5px;"><strong>Advantages:</strong> +Endurance, Insight into rural networks</div>' +
                    '<div style="margin-bottom: 5px;"><strong>Challenges:</strong> Low coin, no formal training</div>' +
                '</div>' +
            '</button>' +
            '<button onclick="window.selectOrigin(\'manor_retainer\')" style="padding: 20px; background: ' + (window.gameState.origin === 'manor_retainer' ? '#d4af37' : '#2a2a2a') + '; border: 2px solid #d4af37; color: ' + (window.gameState.origin === 'manor_retainer' ? '#1a0f08' : '#d4af37') + '; border-radius: 5px; cursor: pointer; text-align: left;">' +
                '<strong style="font-size: 1.1em;">Manor Retainer</strong>' +
                '<div style="font-size: 14px; margin-top: 8px; color: ' + (window.gameState.origin === 'manor_retainer' ? '#1a0f08' : '#888') + ';">' +
                    '<div style="margin-bottom: 5px;"><strong>Advantages:</strong> +Strength, +Charisma in village contexts</div>' +
                    '<div style="margin-bottom: 5px;"><strong>Challenges:</strong> Fealty binds your options, owe service</div>' +
                '</div>' +
            '</button>' +
            '<button onclick="window.selectOrigin(\'craftsman_apprentice\')" style="padding: 20px; background: ' + (window.gameState.origin === 'craftsman_apprentice' ? '#d4af37' : '#2a2a2a') + '; border: 2px solid #d4af37; color: ' + (window.gameState.origin === 'craftsman_apprentice' ? '#1a0f08' : '#d4af37') + '; border-radius: 5px; cursor: pointer; text-align: left;">' +
                '<strong style="font-size: 1.1em;">Craftsman\'s Apprentice</strong>' +
                '<div style="font-size: 14px; margin-top: 8px; color: ' + (window.gameState.origin === 'craftsman_apprentice' ? '#1a0f08' : '#888') + ';">' +
                    '<div style="margin-bottom: 5px;"><strong>Advantages:</strong> +Wits, +Agility when crafting/repairing</div>' +
                    '<div style="margin-bottom: 5px;"><strong>Challenges:</strong> No noble allies, urban ties pull into guild politics</div>' +
                '</div>' +
            '</button>' +
            '<button onclick="window.selectOrigin(\'squire\')" style="padding: 20px; background: ' + (window.gameState.origin === 'squire' ? '#d4af37' : '#2a2a2a') + '; border: 2px solid #d4af37; color: ' + (window.gameState.origin === 'squire' ? '#1a0f08' : '#d4af37') + '; border-radius: 5px; cursor: pointer; text-align: left;">' +
                '<strong style="font-size: 1.1em;">Squire to a Knight</strong>' +
                '<div style="font-size: 14px; margin-top: 8px; color: ' + (window.gameState.origin === 'squire' ? '#1a0f08' : '#888') + ';">' +
                    '<div style="margin-bottom: 5px;"><strong>Advantages:</strong> +Strength, +Wits, Access to basic gear</div>' +
                    '<div style="margin-bottom: 5px;"><strong>Challenges:</strong> Bound by knight\'s agenda, must prove worth</div>' +
                '</div>' +
            '</button>' +
            '<button onclick="window.selectOrigin(\'minor_noble\')" style="padding: 20px; background: ' + (window.gameState.origin === 'minor_noble' ? '#d4af37' : '#2a2a2a') + '; border: 2px solid #d4af37; color: ' + (window.gameState.origin === 'minor_noble' ? '#1a0f08' : '#d4af37') + '; border-radius: 5px; cursor: pointer; text-align: left;">' +
                '<strong style="font-size: 1.1em;">Minor Noble or Garrison\'s Son/Daughter</strong>' +
                '<div style="font-size: 14px; margin-top: 8px; color: ' + (window.gameState.origin === 'minor_noble' ? '#1a0f08' : '#888') + ';">' +
                    '<div style="margin-bottom: 5px;"><strong>Advantages:</strong> +Charisma, +Wits, Political network</div>' +
                    '<div style="margin-bottom: 5px;"><strong>Challenges:</strong> Political stakes — errors are punished</div>' +
                '</div>' +
            '</button>' +
        '</div>' +
    '</div>';
}

function renderCharacterCreationStep5() {
    if (!window.gameState.priorities) {
        window.gameState.priorities = { might: null, finesse: null, wits: null, presence: null, fortune: null };
    }
    if (!window.gameState.kitTier) {
        window.gameState.kitTier = "Standard";
    }
    
    const categories = [
        { id: 'might', name: '💪 Might', desc: 'Strength + Endurance' },
        { id: 'finesse', name: '🏃 Finesse', desc: 'Agility' },
        { id: 'wits', name: '🧠 Wits', desc: 'Intelligence & Tactics' },
        { id: 'presence', name: '💬 Presence', desc: 'Charisma & Leadership' },
        { id: 'fortune', name: '💰 Fortune', desc: 'Luck, Wealth & Starting Kit' }
    ];
    
    const usedPriorities = Object.values(window.gameState.priorities || {}).filter(function(p) { return p !== null; });
    
    return '<div style="margin-bottom: 30px; padding: 20px; background: rgba(212, 175, 55, 0.15); border: 2px solid #d4af37; border-radius: 8px;">' +
        '<h3 style="color: #f4d03f; margin-bottom: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">Step 5 — Priorities</h3>' +
        '<p style="color: #888; font-size: 14px; margin-bottom: 20px;">Assign each priority (A, B, C, D, E) exactly once across the five categories. Your choices determine your starting capabilities and equipment.</p>' +
        '<div style="display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 20px;">' +
            categories.map(function(cat) {
                const currentPriority = (window.gameState.priorities || {})[cat.id] || '';
                const priorityOptions = ['A', 'B', 'C', 'D', 'E'];
                
                return '<div style="padding: 12px; background: rgba(0,0,0,0.3); border-radius: 5px; border: 2px solid ' + (currentPriority ? '#d4af37' : '#555') + ';">' +
                    '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">' +
                        '<div><div style="color: #d4af37; font-weight: bold; font-size: 1.05em;">' + cat.name + '</div><div style="color: #888; font-size: 12px;">' + cat.desc + '</div></div>' +
                        '<select onchange="window.setPriority(\'' + cat.id + '\', this.value);" style="padding: 6px 10px; background: #2a2a2a; border: 2px solid #d4af37; color: #d4af37; border-radius: 4px; font-size: 14px; font-weight: bold; min-width: 60px;">' +
                            '<option value="">--</option>' +
                            priorityOptions.map(function(letter) {
                                const isUsed = usedPriorities.includes(letter) && letter !== currentPriority;
                                return '<option value="' + letter + '" ' + (currentPriority === letter ? 'selected' : '') + (isUsed ? 'disabled' : '') + '>' + letter + (isUsed ? ' (used)' : '') + '</option>';
                            }).join('') +
                        '</select>' +
                    '</div>' +
                '</div>';
            }).join('') +
        '</div>' +
        '<div style="margin-bottom: 15px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 5px;">' +
            '<div style="color: #d4af37; font-weight: bold; margin-bottom: 8px; font-size: 13px;">Quick Presets:</div>' +
            '<div style="display: flex; flex-wrap: wrap; gap: 8px;">' +
                '<button onclick="window.applyPriorityPreset(\'brawny\')" style="padding: 6px 12px; background: #2a2a2a; border: 1px solid #d4af37; color: #d4af37; border-radius: 3px; cursor: pointer; font-size: 12px;">💪 Brawny Footman</button>' +
                '<button onclick="window.applyPriorityPreset(\'cunning\')" style="padding: 6px 12px; background: #2a2a2a; border: 1px solid #d4af37; color: #d4af37; border-radius: 3px; cursor: pointer; font-size: 12px;">🧠 Cunning Scout</button>' +
                '<button onclick="window.applyPriorityPreset(\'court\')" style="padding: 6px 12px; background: #2a2a2a; border: 1px solid #d4af37; color: #d4af37; border-radius: 3px; cursor: pointer; font-size: 12px;">👑 Court-Leaned</button>' +
                '<button onclick="window.applyPriorityPreset(\'lucky\')" style="padding: 6px 12px; background: #2a2a2a; border: 1px solid #d4af37; color: #d4af37; border-radius: 3px; cursor: pointer; font-size: 12px;">🎲 Lucky Bastard</button>' +
            '</div>' +
        '</div>' +
        (function() {
            try {
                if (typeof window.recalculateFromPriorities === 'function') {
                    window.recalculateFromPriorities();
                }
                const validation = typeof window.validatePrioritiesCompleteAndUnique === 'function' ? window.validatePrioritiesCompleteAndUnique() : { ok: false, message: "Priority system not initialized" };
                const kitTier = window.gameState.kitTier || "Standard";
                const startingSilver = (window.gameState.stats && window.gameState.stats.wealth) ? window.gameState.stats.wealth : 10;
                
                return '<div style="padding: 15px; background: rgba(212, 175, 55, 0.15); border: 2px solid #d4af37; border-radius: 5px; margin-top: 15px;">' +
                    '<div style="color: #f4d03f; font-weight: bold; margin-bottom: 10px; font-size: 1.1em;">Computed Stats & Resources</div>' +
                    '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-bottom: 10px;">' +
                        '<div><strong style="color: #d4af37;">Strength:</strong> <span style="color: #f4d03f;">' + ((window.gameState.stats && window.gameState.stats.strength) ? window.gameState.stats.strength : 5) + '</span></div>' +
                        '<div><strong style="color: #d4af37;">Agility:</strong> <span style="color: #f4d03f;">' + ((window.gameState.stats && window.gameState.stats.agility) ? window.gameState.stats.agility : 5) + '</span></div>' +
                        '<div><strong style="color: #d4af37;">Endurance:</strong> <span style="color: #f4d03f;">' + ((window.gameState.stats && window.gameState.stats.endurance) ? window.gameState.stats.endurance : 5) + '</span></div>' +
                        '<div><strong style="color: #d4af37;">Charisma:</strong> <span style="color: #f4d03f;">' + ((window.gameState.stats && window.gameState.stats.charisma) ? window.gameState.stats.charisma : 5) + '</span></div>' +
                        '<div><strong style="color: #d4af37;">Wits:</strong> <span style="color: #f4d03f;">' + ((window.gameState.stats && window.gameState.stats.wits) ? window.gameState.stats.wits : 5) + '</span></div>' +
                        '<div><strong style="color: #d4af37;">Luck:</strong> <span style="color: #f4d03f;">' + ((window.gameState.stats && window.gameState.stats.luck) ? window.gameState.stats.luck : 5) + '</span></div>' +
                    '</div>' +
                    '<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #555;">' +
                        '<div><strong style="color: #d4af37;">Starting Silver:</strong> <span style="color: #f4d03f;">' + startingSilver + '</span></div>' +
                        '<div><strong style="color: #d4af37;">Kit Tier:</strong> <span style="color: #f4d03f;">' + kitTier + '</span></div>' +
                    '</div>' +
                    (!validation.ok ? '<div style="margin-top: 10px; padding: 8px; background: rgba(139, 0, 0, 0.3); border-left: 3px solid #8b0000; color: #ff6666; font-size: 12px;">⚠️ ' + validation.message + '</div>' : '') +
                '</div>';
            } catch (e) {
                return '<div style="padding: 15px; background: rgba(139, 0, 0, 0.2); border: 2px solid #8b0000; border-radius: 5px; margin-top: 15px; color: #ff6666;">Error loading priority system.</div>';
            }
        })() +
    '</div>';
}

function renderCharacterCreationStep6() {
    const currentPatronId = window.gameState.patronId;
    let patronSelectionHtml = '<div style="margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 5px;">' +
        '<div style="color: #d4af37; font-weight: bold; margin-bottom: 15px; font-size: 16px;">Choose Your Patron</div>' +
        '<p style="color: #888; font-size: 14px; margin-bottom: 15px;">Select a lord or captain to serve under. Your choice affects your starting stats, equipment, and future opportunities.</p>' +
        '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">';
    
    // Render patron cards
    Object.keys(window.PATRONS).forEach(function(patronId) {
        const patron = window.PATRONS[patronId];
        const isSelected = currentPatronId === patronId;
        const statModsText = Object.entries(patron.statMods || {}).map(([stat, mod]) => {
            return (mod > 0 ? '+' : '') + mod + ' ' + stat;
        }).join(', ');
        
        patronSelectionHtml += '<div id="patron-card-' + patronId + '" onclick="window.setPatron(\'' + patronId + '\')" ' +
            'style="padding: 15px; background: ' + (isSelected ? 'rgba(212, 175, 55, 0.3)' : 'rgba(42, 42, 42, 0.8)') + '; ' +
            'border: 2px solid ' + (isSelected ? '#f4d03f' : '#8b6914') + '; ' +
            'border-radius: 8px; cursor: pointer; transition: all 0.3s;" ' +
            'onmouseover="this.style.borderColor=\'#d4af37\'; this.style.background=\'rgba(212, 175, 55, 0.2)\';" ' +
            'onmouseout="this.style.borderColor=\'' + (isSelected ? '#f4d03f' : '#8b6914') + '\'; this.style.background=\'' + (isSelected ? 'rgba(212, 175, 55, 0.3)' : 'rgba(42, 42, 42, 0.8)') + '\';">' +
            '<div style="color: ' + (isSelected ? '#f4d03f' : '#d4af37') + '; font-weight: bold; font-size: 15px; margin-bottom: 8px;">' + window.escapeHTML(patron.name) + '</div>' +
            '<div style="color: #888; font-size: 12px; margin-bottom: 5px; font-style: italic;">' + window.escapeHTML(patron.type) + '</div>' +
            '<div style="color: #aaa; font-size: 13px; margin-bottom: 8px;">' + window.escapeHTML(patron.blurb) + '</div>' +
            '<div style="color: #d4af37; font-size: 12px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #555;">' +
                '<strong>Stat Modifiers:</strong> ' + (statModsText || 'None') +
            '</div>' +
            (isSelected ? '<div style="color: #f4d03f; font-size: 12px; margin-top: 5px; font-weight: bold;">✓ Selected</div>' : '') +
        '</div>';
    });
    
    patronSelectionHtml += '</div></div>';
    
    // Character summary
    const patronName = currentPatronId && window.PATRONS[currentPatronId] ? window.PATRONS[currentPatronId].name : 'Not selected';
    
    return '<div style="margin-bottom: 30px; padding: 20px; background: rgba(212, 175, 55, 0.15); border: 2px solid #d4af37; border-radius: 8px;">' +
        '<h3 style="color: #f4d03f; margin-bottom: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">Step 6 — Choose Patron & Review</h3>' +
        patronSelectionHtml +
        '<div style="padding: 15px; background: rgba(0,0,0,0.3); border-radius: 5px; margin-top: 20px;">' +
            '<div style="color: #d4af37; font-weight: bold; margin-bottom: 10px;">Character Summary:</div>' +
            '<div style="color: #f4d03f; margin-bottom: 5px;"><strong>Name:</strong> ' + window.escapeHTML(window.gameState.characterName || 'Unnamed') + '</div>' +
            '<div style="color: #f4d03f; margin-bottom: 5px;"><strong>Region:</strong> ' + window.escapeHTML(window.gameState.culture || 'Not selected') + '</div>' +
            '<div style="color: #f4d03f; margin-bottom: 5px;"><strong>Age Range:</strong> ' + window.escapeHTML(window.gameState.ageRange || 'Not selected') + '</div>' +
            '<div style="color: #f4d03f; margin-bottom: 5px;"><strong>Origin:</strong> ' + window.escapeHTML(window.gameState.origin || 'Not selected') + '</div>' +
            '<div style="color: #f4d03f; margin-bottom: 5px;"><strong>Patron:</strong> ' + window.escapeHTML(patronName) + '</div>' +
        '</div>' +
    '</div>';
}

// Quick Start Character Generation
function generateQuickStartCharacter() {
    // Ensure stats are initialized
    if (!window.gameState.stats) {
        window.gameState.stats = {
            strength: 5,
            agility: 5,
            endurance: 5,
            charisma: 5,
            luck: 5,
            wits: 5,
            wealth: 10,
            reputation: 0,
            morale: 5,
            stress: 0,
            experience: 0,
            patronFavor: 0,
            initiative: 5
        };
    }
    
    // Random name from common names
    const firstNames = ["William", "John", "Thomas", "Richard", "Robert", "Henry", "Geoffrey", "Roger", "Edward", "Hugh", "Simon", "Walter", "Ralph", "Nicholas", "Peter", "James", "David", "Michael", "Stephen", "Alan"];
    const lastNames = ["Thatcher", "Smith", "Miller", "Baker", "Taylor", "Cooper", "Wright", "Carter", "Turner", "Parker", "Clark", "Hill", "Green", "Wood", "Brown"];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    window.gameState.characterName = firstName + " " + lastName;
    
    // Random region
    const regions = ["Yorkshire", "Kent", "London", "Cornwall", "Lancashire", "Essex", "Norfolk", "Somerset"];
    window.gameState.culture = regions[Math.floor(Math.random() * regions.length)];
    
    // Random age range (weighted toward prime/young_adult)
    const ageRanges = [
        { id: 'youth', weight: 1 },
        { id: 'young_adult', weight: 3 },
        { id: 'prime', weight: 4 },
        { id: 'veteran', weight: 2 },
        { id: 'old_hand', weight: 1 }
    ];
    const totalWeight = ageRanges.reduce((sum, r) => sum + r.weight, 0);
    let random = Math.random() * totalWeight;
    for (let range of ageRanges) {
        random -= range.weight;
        if (random <= 0) {
            window.gameState.ageRange = range.id;
            break;
        }
    }
    
    // Random origin
    const origins = ["rural_peasant", "manor_retainer", "craftsman_apprentice", "squire", "minor_noble"];
    window.gameState.origin = origins[Math.floor(Math.random() * origins.length)];
    
    // Random priority preset
    const priorityPresets = ['brawny', 'cunning', 'court', 'lucky'];
    const preset = priorityPresets[Math.floor(Math.random() * priorityPresets.length)];
    const presets = {
        brawny: { might: 'A', finesse: 'C', wits: 'D', presence: 'E', fortune: 'B' },
        cunning: { might: 'D', finesse: 'A', wits: 'B', presence: 'C', fortune: 'E' },
        court: { might: 'C', finesse: 'D', wits: 'B', presence: 'A', fortune: 'E' },
        lucky: { might: 'C', finesse: 'C', wits: 'C', presence: 'C', fortune: 'A' }
    };
    if (!window.gameState.priorities) {
        window.gameState.priorities = { might: null, finesse: null, wits: null, presence: null, fortune: null };
    }
    Object.assign(window.gameState.priorities, presets[preset]);
    window.gameState.quickStartPreset = preset;
    
    // Recalculate stats from priorities first (this resets to base and applies priority bonuses)
    if (typeof recalculateFromPriorities === 'function') {
        window.recalculateFromPriorities();
    }
    
    // Set age based on age range
    const ageMap = {
        'youth': 18,
        'young_adult': 22,
        'prime': 27,
        'veteran': 33,
        'old_hand': 38
    };
    window.gameState.age = ageMap[window.gameState.ageRange] || 27;
    
    // Apply age range stat mods (after priorities)
    const ageStatMods = {
        'youth': { initiative: 2, agility: 1, endurance: -1, wits: -1 },
        'young_adult': { strength: 1, agility: 1, wits: -1 },
        'prime': { strength: 1, wits: 1 },
        'veteran': { wits: 2, endurance: 1, agility: -1 },
        'old_hand': { wits: 2, endurance: 1, charisma: 1, agility: -2, strength: -1 }
    };
    const ageMods = ageStatMods[window.gameState.ageRange];
    if (ageMods && typeof applyStatChange === 'function') {
        Object.keys(ageMods).forEach(function(stat) {
            window.applyStatChange(stat, ageMods[stat]);
        });
    }
    
    // Background is now selected by player, not random
    
    // Random patron
    const patrons = ['james_olooney', 'lord_david', 'duke_caley', 'count_charles', 'ashkhan'];
    const selectedPatron = patrons[Math.floor(Math.random() * patrons.length)];
    window.gameState.patronId = selectedPatron;
    window.gameState.patron = selectedPatron; // Legacy compatibility
    if (window.PATRONS[selectedPatron]) {
        window.gameState.patronEventPath = window.PATRONS[selectedPatron].eventPath;
    }
    
    // Apply origin stat bonuses (same as start.onEnter does)
    if (!window.gameState.flags.originApplied && typeof applyStatChange === 'function') {
        switch(window.gameState.origin) {
            case 'rural_peasant':
                window.applyStatChange('endurance', 2);
                window.applyStatChange('wealth', -5);
                break;
            case 'manor_retainer':
                window.applyStatChange('strength', 1);
                window.applyStatChange('charisma', 1);
                break;
            case 'craftsman_apprentice':
                window.applyStatChange('wits', 1);
                window.applyStatChange('agility', 1);
                break;
            case 'squire':
                window.applyStatChange('strength', 1);
                window.applyStatChange('wits', 1);
                break;
            case 'minor_noble':
                window.applyStatChange('charisma', 1);
                window.applyStatChange('wits', 1);
                window.applyStatChange('reputation', 5);
                break;
        }
        window.gameState.flags.originApplied = true;
    }
    
    // Mark character creation as complete
    window.gameState.characterCreationStep = 6;
    window.gameState.quickStartUsed = true;
    
    // Grant starting kit
    if (!window.gameState.startingKitGranted) {
        const kitTier = window.gameState.kitTier || "Standard";
        window.grantStartingKit(window.gameState.origin, kitTier);
    }
    
    // Go to quick start review scene
    window.gameState.currentScene = "quick_start_review";
    window.updateDisplay();
}

    // ============================================
    // Initialization
    // ============================================
    function initGame() {
    // Hide loading message immediately (redundant check, but safe)
    try {
        const loadingMsg = document.getElementById('loading-message');
        if (loadingMsg) {
            loadingMsg.style.display = 'none';
        }
    } catch (e) {
        console.error('Error hiding loading message in initGame:', e);
    }
    
    console.log("=== INIT GAME START ===");
    console.log("initGame called");
    console.log("window.gameState.currentScene:", window.gameState.currentScene);
    console.log("scenes object exists:", typeof window.scenes !== 'undefined');
    
    // Ensure we start at character creation if no save exists or if scene is invalid
    if (!window.gameState.currentScene || window.gameState.currentScene === 'start') {
        console.log("Forcing character creation scene (no scene or start)");
        window.gameState.currentScene = 'character_creation';
        window.gameState.characterName = window.gameState.characterName || "William Thatcher";
        window.gameState.background = window.gameState.background || null;
    } else if (typeof window.scenes !== 'undefined' && !window.scenes[window.gameState.currentScene]) {
        console.log("Forcing character creation scene (invalid scene:", window.gameState.currentScene + ")");
        window.gameState.currentScene = 'character_creation';
        window.gameState.characterName = window.gameState.characterName || "William Thatcher";
        window.gameState.background = window.gameState.background || null;
    }
    
    console.log("Final currentScene:", window.gameState.currentScene);
    console.log("Scene exists:", typeof window.scenes !== 'undefined' && window.scenes[window.gameState.currentScene] ? 'YES' : 'NO');
    
    // Initialize equipment manager if not already done (consolidated to single function)
    window.initializeEquipmentSystem();
    
    // Update debug UI visibility (if function exists)
    if (typeof window.updateDebugUI === 'function') {
        window.updateDebugUI();
    }
    
    console.log("Calling updateDisplay");
    try {
        window.updateDisplay();
        console.log("updateDisplay completed");
    } catch (e) {
        console.error("updateDisplay threw error:", e);
        const storyEl = document.getElementById('story');
        if (storyEl) {
            const safeError = window.escapeHTML(String(e.message || 'Unknown error'));
            storyEl.innerHTML = '<p style="color: red;">Error initializing game. Check console for details.</p><p>Error: ' + safeError + '</p>';
        }
    }
    console.log("=== INIT GAME END ===");
}
// Equipment adapter functions for old/new format compatibility
function getEquippedItem(slot, layer) {
    const slotData = window.gameState.equipment[slot];
    if (!slotData) return null;
    
    // New format: slotData[layer]
    if (layer && slotData[layer] && slotData[layer].id) {
        return slotData[layer];
    }
    
    // Old format: slotData.item
    if (slotData.item && slotData.item.id) {
        return slotData.item;
    }
    
    // Legacy weapon.primary fallback
    if (slot === 'weapon' && slotData.primary && slotData.primary.id) {
        return slotData.primary;
    }
    
    return null;
}

function getEquipmentQuality(slot) {
    const slotData = window.gameState.equipment[slot];
    
    // Old format: direct quality
    if (slotData && slotData.quality !== undefined) {
        return slotData.quality; // 0-3
    }
    
    // New format: derive from condition (map to 0-3 scale)
    const item = window.getEquippedItem(slot, 'primary') || window.getEquippedItem(slot);
    if (item && item.condition !== undefined) {
        // Map 0-100 condition to 0-3 quality (aligned with old system)
        if (item.condition >= 75) return 3;
        if (item.condition >= 50) return 2;
        if (item.condition >= 25) return 1;
        return 0;
    }
    
    return 0;
}

function getEquipmentName(slot) {
    const slotData = window.gameState.equipment[slot];
    
    // Old format: direct name
    if (slotData && slotData.name) {
        return slotData.name;
    }
    
    // New format: get from database
    const item = window.getEquippedItem(slot, 'primary') || window.getEquippedItem(slot);
    if (item && item.id && typeof EQUIPMENT_DATABASE !== 'undefined') {
        const itemSpec = window.EQUIPMENT_DATABASE[item.id];
        return itemSpec ? itemSpec.name : item.id;
    }
    
    return null;
}

function setEquipmentQuality(slot, quality) {
    const slotData = window.gameState.equipment[slot];
    if (!slotData) return false;
    
    // Old format: direct quality
    if (slotData.quality !== undefined) {
        slotData.quality = Math.max(0, Math.min(3, quality));
        return true;
    }
    
    // New format: update condition (map 0-3 quality to 0-100 condition)
    const item = window.getEquippedItem(slot, 'primary') || window.getEquippedItem(slot);
    if (item) {
        // Map 0-3 quality to 0-100 condition
        const conditionMap = { 0: 0, 1: 33, 2: 66, 3: 100 };
        item.condition = conditionMap[Math.max(0, Math.min(3, quality))] || 0;
        return true;
    }
    
    return false;
}
function initializeEquipmentSystem() {
    // Initialize equipment manager - check if already initialized to prevent duplicates
    if (typeof EquipmentManager !== 'undefined' && 
        typeof EQUIPMENT_DATABASE !== 'undefined' && 
        !equipmentManager && !window.equipmentManager) {
        try {
            equipmentManager = new EquipmentManager(gameState);
            window.equipmentManager = equipmentManager; // Ensure window reference
            
            // Initialize equipment UI
            if (typeof EquipmentUI !== 'undefined' && !equipmentUI) {
                equipmentUI = new EquipmentUI(gameState, equipmentManager);
                window.equipmentUI = equipmentUI; // Make globally accessible
            }
            
            // Reset retry count on successful initialization
            window._equipmentInitRetryCount = 0;
        } catch (e) {
            console.error("Failed to initialize equipment system:", e);
            // Gracefully degrade - game still playable without equipment
        }
    } else if (window.equipmentManager && !equipmentManager) {
        // If window.equipmentManager exists but local doesn't, sync them
        equipmentManager = window.equipmentManager;
    } else if (typeof EQUIPMENT_DATABASE === 'undefined') {
        // Bounded retry: only retry once, then show error
        if (!window._equipmentInitRetryCount) {
            window._equipmentInitRetryCount = 1;
            console.warn('EQUIPMENT_DATABASE not loaded, retrying once...');
            setTimeout(initializeEquipmentSystem, 200);
        } else {
            console.error('EQUIPMENT_DATABASE failed to load after retry');
            window.showNotification('Equipment System', 
                'Equipment database failed to load. Please refresh the page.', 
                'error');
        }
    }
    
    // Handle partial init: equipmentManager exists but equipmentUI doesn't
    if (equipmentManager && !equipmentUI && typeof EquipmentUI !== 'undefined') {
        try {
            equipmentUI = new EquipmentUI(gameState, equipmentManager);
            window.equipmentUI = equipmentUI;
            // Reset retry count on successful UI initialization
            window._equipmentInitRetryCount = 0;
        } catch (e) {
            console.error("Failed to initialize equipment UI:", e);
        }
    }
}

function openEquipmentScreen() {
    console.log('Opening equipment screen...');
    console.log('EquipmentUI available:', typeof EquipmentUI !== 'undefined');
    console.log('EquipmentManager available:', typeof EquipmentManager !== 'undefined');
    console.log('EQUIPMENT_DATABASE available:', typeof EQUIPMENT_DATABASE !== 'undefined');
    console.log('Current inventory:', window.gameState.inventory);
    
    if (!equipmentUI) {
        console.log('Initializing equipment system...');
        window.initializeEquipmentSystem();
    }
    if (equipmentUI) {
        try {
            equipmentUI.open();
            console.log('Equipment screen opened successfully');
        } catch (error) {
            console.error('Error opening equipment screen:', error);
            window.showNotification('Equipment Error', 'Could not open equipment screen. Check console (F12) for details.');
        }
    } else {
        console.error('Equipment UI not initialized');
        window.showNotification('Equipment System', 'Equipment system not loaded. Please refresh the page.');
    }
}

function closeEquipmentScreen() {
    if (equipmentUI) {
        equipmentUI.close();
    }
}

// Check required modules before initialization (defined at top level of IIFE)
function checkRequiredModules() {
    const missing = [];
    
    // Check EquipmentManager
    if (typeof EquipmentManager === 'undefined') {
        missing.push('Equipment system not loaded');
    }
    
    // Check EquipmentUI
    if (typeof EquipmentUI === 'undefined') {
        missing.push('Equipment UI not loaded');
    }
    
    // Check EQUIPMENT_DATABASE (global constant)
    try {
        if (typeof EQUIPMENT_DATABASE === 'undefined') {
            missing.push('Equipment database not loaded');
        }
    } catch (e) {
        missing.push('Equipment database not loaded');
    }
    
    // Check ENEMY_PROFILES (global constant)
    try {
        if (typeof ENEMY_PROFILES === 'undefined') {
            missing.push('Enemy profiles not loaded');
        }
    } catch (e) {
        missing.push('Enemy profiles not loaded');
    }
    
    if (missing.length > 0) {
        if (typeof window.showNotification === 'function') {
            window.showNotification('Missing Modules', 
                'Some game files failed to load:\n' + missing.join('\n') + 
                '\n\nPlease refresh the page.', 
                'error'
            );
        }
        return false;
    }
    return true;
}

// Initialize on load
window.addEventListener('load', function() {
    // Hide loading message immediately, even if initialization fails
    try {
        const loadingMsg = document.getElementById('loading-message');
        if (loadingMsg) {
            loadingMsg.style.display = 'none';
        }
    } catch (e) {
        console.error('Error hiding loading message:', e);
    }
    
    // Check modules, but still try to initialize (game may be partially playable)
    const modulesOk = checkRequiredModules();
    
    // Initialize game with error handling
    // Even if modules are missing, try to start the game (it may be playable without equipment)
    try {
        // Small delay to ensure DOM is fully ready
        setTimeout(function() {
            try {
                initGame();
            } catch (error) {
                console.error('Fatal error during initialization:', error);
                const storyEl = document.getElementById('story');
                const loadingMsg = document.getElementById('loading-message');
                if (loadingMsg) {
                    loadingMsg.style.display = 'none';
                }
                if (storyEl) {
                    storyEl.innerHTML = '<p style="color: red; padding: 20px;">Error initializing game. Please check the browser console for details.</p><p style="color: #d4af37;">Error: ' + window.escapeHTML(String(error.message || 'Unknown error')) + '</p><p style="margin-top: 20px;"><button onclick="location.reload()" style="padding: 10px 20px; background: #d4af37; border: none; color: #1a0f08; border-radius: 5px; cursor: pointer; font-weight: bold;">Reload Page</button></p>';
                }
            }
        }, 100);
    } catch (error) {
        console.error('Fatal error setting up initialization:', error);
        const storyEl = document.getElementById('story');
        const loadingMsg = document.getElementById('loading-message');
        if (loadingMsg) {
            loadingMsg.style.display = 'none';
        }
        if (storyEl) {
            storyEl.innerHTML = '<p style="color: red; padding: 20px;">Critical error. Please refresh the page.</p><p>Error: ' + window.escapeHTML(String(error.message || 'Unknown error')) + '</p>';
        }
    }
    // Equipment system will be initialized by window.initGame() or on first use
});

    // ============================================
    // Level Up Menu
    // ============================================
function showLevelUpMenu() {
    const points = window.gameState.levelUpPoints || 0;
    if (points <= 0) {
        window.showNotification("No Points", "You have no unspent stat points.");
        return;
    }
    
    const statOptions = [
        { key: 'strength', label: '⚔️ Strength', current: window.gameState.stats.strength || 0 },
        { key: 'agility', label: '🏃 Agility', current: window.gameState.stats.agility || 0 },
        { key: 'endurance', label: '❤️ Endurance', current: window.gameState.stats.endurance || 0 },
        { key: 'charisma', label: '💬 Charisma', current: window.gameState.stats.charisma || 0 },
        { key: 'wits', label: '🧠 Wits', current: window.gameState.stats.wits || 0 },
        { key: 'luck', label: '🍀 Luck', current: window.gameState.stats.luck || 0 }
    ];
    
    const modal = document.createElement('div');
    modal.className = 'stats-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    let selectedStat = null;
    let pointsToSpend = 1;
    
    function updateModal() {
        const remaining = points - (pointsToSpend - 1);
        modal.innerHTML = `
            <div style="
                background: #1a0f08;
                border: 3px solid #d4af37;
                border-radius: 10px;
                padding: 30px;
                max-width: 500px;
                color: #d4af37;
                font-family: 'Crimson Text', serif;
            ">
                <h2 style="color: #f4d03f; margin-bottom: 20px; text-align: center;">📈 Level Up - Spend Stat Points</h2>
                <p style="text-align: center; margin-bottom: 20px; font-size: 1.1em;">
                    You have <strong style="color: #f4d03f;">${remaining}</strong> point${remaining !== 1 ? 's' : ''} remaining
                </p>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 10px; font-weight: bold;">Points to spend:</label>
                    <div style="display: flex; gap: 10px; align-items: center; justify-content: center;">
                        <button id="decrease-btn" style="padding: 5px 15px; background: #d4af37; color: #1a0f08; border: none; border-radius: 3px; cursor: pointer; font-size: 1.2em; font-weight: bold;">-</button>
                        <span id="points-display" style="font-size: 1.5em; min-width: 50px; text-align: center; display: inline-block;">${pointsToSpend}</span>
                        <button id="increase-btn" style="padding: 5px 15px; background: #d4af37; color: #1a0f08; border: none; border-radius: 3px; cursor: pointer; font-size: 1.2em; font-weight: bold;">+</button>
                    </div>
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 10px; font-weight: bold;">Select stat to improve:</label>
                    ${statOptions.map((stat, idx) => {
                        const canIncrease = stat.current < 10;
                        const isSelected = selectedStat === stat.key;
                        return `
                            <div id="stat-option-${idx}" style="
                                padding: 10px;
                                margin: 5px 0;
                                background: ${isSelected ? 'rgba(212, 175, 55, 0.3)' : 'rgba(212, 175, 55, 0.1)'};
                                border: 2px solid ${isSelected ? '#f4d03f' : '#d4af37'};
                                border-radius: 5px;
                                cursor: ${canIncrease ? 'pointer' : 'not-allowed'};
                                opacity: ${canIncrease ? '1' : '0.5'};
                            ">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span>${stat.label}</span>
                                    <span>${stat.current}/10 ${isSelected ? '✓' : ''}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="apply-btn" style="
                        padding: 10px 20px;
                        background: ${selectedStat ? '#d4af37' : '#666'};
                        color: ${selectedStat ? '#1a0f08' : '#fff'};
                        border: none;
                        border-radius: 5px;
                        cursor: ${selectedStat ? 'pointer' : 'not-allowed'};
                        font-weight: bold;
                        font-size: 1.1em;
                        opacity: ${selectedStat ? '1' : '0.5'};
                    ">
                        Apply
                    </button>
                    <button id="cancel-btn" style="
                        padding: 10px 20px;
                        background: #666;
                        color: #fff;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: bold;
                    ">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        // Attach event listeners
        document.getElementById('decrease-btn').onclick = () => {
            pointsToSpend = Math.max(1, pointsToSpend - 1);
            updateModal();
        };
        
        document.getElementById('increase-btn').onclick = () => {
            pointsToSpend = Math.min(remaining + 1, pointsToSpend + 1);
            updateModal();
        };
        
        statOptions.forEach((stat, idx) => {
            const elem = document.getElementById(`stat-option-${idx}`);
            if (elem && stat.current < 10) {
                elem.onclick = () => {
                    selectedStat = stat.key;
                    updateModal();
                };
            }
        });
        
        document.getElementById('apply-btn').onclick = () => {
            if (selectedStat && pointsToSpend > 0) {
                const current = window.gameState.stats[selectedStat] || 0;
                const maxIncrease = Math.min(pointsToSpend, 10 - current);
                if (maxIncrease > 0) {
                    window.applyStatChange(selectedStat, maxIncrease);
                    window.gameState.levelUpPoints = (window.gameState.levelUpPoints || 0) - maxIncrease;
                    window.updateStats();
                    document.body.removeChild(modal);
                    const statLabel = statOptions.find(s => s.key === selectedStat).label;
                    window.showNotification('Stat Increased', `${statLabel} increased by ${maxIncrease}!`);
                }
            }
        };
        
        document.getElementById('cancel-btn').onclick = () => {
            document.body.removeChild(modal);
        };
    }
    
    document.body.appendChild(modal);
    updateModal();
}

function showStats() {
    try {
        const statLabels = {
            strength: '⚔️ Strength',
            agility: '🏃 Agility',
            endurance: '❤️ Endurance',
            charisma: '💬 Charisma',
            wits: '🧠 Wits',
            luck: '🍀 Luck',
            wealth: '💰 Wealth',
            reputation: '⭐ Reputation',
            morale: '💪 Morale',
            stress: '😰 Stress',
            experience: '📜 Experience',
            patronFavor: '👑 Patron Favor'
        };
        
        const stats = Object.entries(window.gameState.stats)
            .map(([key, value]) => {
                const effective = getEffectiveStat(key);
                const label = statLabels[key] || key;
                return effective !== value 
                    ? `${label}: ${value} (Effective: ${effective})`
                    : `${label}: ${value}`;
            })
            .join('\n');
        
        const conditions = window.gameState.conditions.length > 0 
            ? window.gameState.conditions.map(c => `• ${c.name}${c.duration ? ` (${c.duration} turns remaining)` : ''}`).join('\n')
            : 'None';
        
        const career = `Battles: ${window.gameState.career.battles}\nWounds: ${window.gameState.career.wounds}\nPromotions: ${window.gameState.career.promotions}`;
        
        // Handle equipment display for both old and new format using adapters
        let equipment = 'None equipped';
        try {
            const weaponName = window.getEquipmentName('weapon');
            const weaponQuality = window.getEquipmentQuality('weapon');
            const armorName = window.getEquipmentName('armor') || window.getEquipmentName('torso');
            const armorQuality = window.getEquipmentQuality('armor') || window.getEquipmentQuality('torso');
            
            if (weaponName || armorName) {
                const parts = [];
                if (weaponName) {
                    parts.push(`Weapon: ${weaponName} (+${weaponQuality})`);
                }
                if (armorName) {
                    parts.push(`Armor: ${armorName} (+${armorQuality})`);
                }
                equipment = parts.length > 0 ? parts.join('\n') : 'None equipped';
            } else {
                // Try new format direct access as fallback
                const equipped = [];
                const weaponItem = window.getEquippedItem('weapon', 'primary');
                const torsoItem = window.getEquippedItem('torso', 'plate');
                const headItem = window.getEquippedItem('head', 'plate');
                
                if (weaponItem && weaponItem.id) equipped.push(`Weapon: ${weaponItem.id}`);
                if (torsoItem && torsoItem.id) equipped.push(`Torso: ${torsoItem.id}`);
                if (headItem && headItem.id) equipped.push(`Head: ${headItem.id}`);
                equipment = equipped.length > 0 ? equipped.join('\n') : 'None equipped';
            }
        } catch (e) {
            console.error("Error formatting equipment:", e);
            equipment = 'Error loading equipment';
        }
        
        const inventoryCount = window.gameState.inventory ? window.gameState.inventory.length : 0;
        
        // Create modal instead of alert
        const modal = document.createElement('div');
        modal.className = 'stats-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        modal.innerHTML = `
            <div style="
                background: #1a0f08;
                border: 3px solid #d4af37;
                border-radius: 10px;
                padding: 30px;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                color: #d4af37;
                font-family: 'Crimson Text', serif;
            ">
                <h2 style="color: #f4d03f; margin-bottom: 20px; text-align: center;">📊 Full Character Stats</h2>
                <div style="line-height: 1.8; font-size: 1.1em;">
                    <h3 style="color: #f4d03f; margin-top: 15px;">Stats:</h3>
                    <pre style="color: #d4af37; white-space: pre-wrap; font-family: inherit; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;">${stats}</pre>
                    
                    <h3 style="color: #f4d03f; margin-top: 15px;">Character Info:</h3>
                    <p>Name: ${window.escapeHTML(window.gameState.characterName || 'Unnamed')}</p>
                    <p>Age: ${window.gameState.age}</p>
                    <p>Year: ${window.gameState.year}</p>
                    <p>Location: ${window.gameState.location}</p>
                    <p>Region: ${window.gameState.region || 'Unknown'}</p>
                    <p>Rank: ${window.gameState.rank || 'Common Soldier'}</p>
                    <p>Background: ${window.gameState.background ? window.gameState.background.charAt(0).toUpperCase() + window.gameState.background.slice(1) : 'None'}</p>
                    
                    <h3 style="color: #f4d03f; margin-top: 15px;">Equipment:</h3>
                    <pre style="color: #d4af37; white-space: pre-wrap; font-family: inherit; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;">${equipment}</pre>
                    <p>Inventory Items: ${inventoryCount}</p>
                    
                    <h3 style="color: #f4d03f; margin-top: 15px;">Conditions:</h3>
                    <pre style="color: #d4af37; white-space: pre-wrap; font-family: inherit; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;">${conditions}</pre>
                    
                    <h3 style="color: #f4d03f; margin-top: 15px;">Career:</h3>
                    <pre style="color: #d4af37; white-space: pre-wrap; font-family: inherit; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;">${career}</pre>
                </div>
                <button onclick="this.closest('.stats-modal').remove()" 
                        style="
                            margin-top: 20px;
                            padding: 10px 20px;
                            background: #8b0000;
                            border: 2px solid #d4af37;
                            color: #d4af37;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 16px;
                            font-family: inherit;
                            width: 100%;
                        ">
                    Close
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        // Close on Escape key
        const closeHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', closeHandler);
            }
        };
        document.addEventListener('keydown', closeHandler);
        
    } catch (error) {
        console.error("Error in showStats:", error);
        window.showNotification('Error', `Error displaying stats: ${error.message}`);
    }
}

    // ============================================
    // Initialization
    // ============================================

    // ============================================
    // Expose Functions Globally
    // ============================================
    window.SAVE_KEY = SAVE_KEY;
    window.SAVE_VERSION = SAVE_VERSION;
    window.RANDOM_ENCOUNTER_CHANCE = RANDOM_ENCOUNTER_CHANCE;
    window.RANDOM_ENCOUNTER_COOLDOWN_SCENES = RANDOM_ENCOUNTER_COOLDOWN_SCENES;
    window.RANDOM_ENCOUNTERS = RANDOM_ENCOUNTERS;
    
    window.asNumber = asNumber;
    window.hydrateLoadedState = hydrateLoadedState;
    window.normalizeRegion = normalizeRegion;
    window.saveGame = saveGame;
    window.loadGame = loadGame;
    window.resetGame = resetGame;
    
    window.returnFromRandomEncounter = returnFromRandomEncounter;
    window.isCriticalSceneKey = isCriticalSceneKey;
    window.shouldInsertRandomEncounter = shouldInsertRandomEncounter;
    window.tickRandomEncounterCooldown = tickRandomEncounterCooldown;
    window.maybeInsertRandomEncounter = maybeInsertRandomEncounter;
    window.maybeInsertSkirmish = maybeInsertSkirmish;
    
    window.getPriorityBonuses = getPriorityBonuses;
    window.validatePrioritiesCompleteAndUnique = validatePrioritiesCompleteAndUnique;
    window.recalculateFromPriorities = recalculateFromPriorities;
    window.applyPriorityPreset = applyPriorityPreset;
    window.grantStartingKit = grantStartingKit;
    window.recalculateCharacterCreationDerivedStats = recalculateCharacterCreationDerivedStats;
    window.setPriority = setPriority;
    window.selectBackground = selectBackground;
    window.nextCharacterCreationStep = nextCharacterCreationStep;
    window.prevCharacterCreationStep = prevCharacterCreationStep;
    window.goToCharacterCreationStep = goToCharacterCreationStep;
    window.renderStepNavigation = renderStepNavigation;
    window.generateQuickStartCharacter = generateQuickStartCharacter;
    window.completeCharacterCreation = completeCharacterCreation;
    
    window.getEquippedItem = getEquippedItem;
    window.getEquipmentQuality = getEquipmentQuality;
    window.getEquipmentName = getEquipmentName;
    window.setEquipmentQuality = setEquipmentQuality;
    window.initializeEquipmentSystem = initializeEquipmentSystem;
    window.openEquipmentScreen = openEquipmentScreen;
    window.closeEquipmentScreen = closeEquipmentScreen;
    
    window.showLevelUpMenu = showLevelUpMenu;
    window.checkRequiredModules = checkRequiredModules;
    window.initGame = initGame;
    
    // Character Creation Step Render Functions
    window.renderCharacterCreationStep1 = renderCharacterCreationStep1;
    window.renderCharacterCreationStep2 = renderCharacterCreationStep2;
    window.renderCharacterCreationStep3 = renderCharacterCreationStep3;
    window.renderCharacterCreationStep4 = renderCharacterCreationStep4;
    window.renderCharacterCreationStep5 = renderCharacterCreationStep5;
    window.renderCharacterCreationStep6 = renderCharacterCreationStep6;
    
    
    // Flag management functions
    function setFlag(name, value = true) {
        if (!window.gameState.flags) {
            window.gameState.flags = {};
        }
        window.gameState.flags[name] = value;
    }
    
    function getFlag(name) {
        if (!window.gameState.flags) {
            window.gameState.flags = {};
        }
        return window.gameState.flags[name] || false;
    }
    
    function hasFlag(name) {
        if (!window.gameState.flags) {
            window.gameState.flags = {};
        }
        return window.gameState.flags[name] === true;
    }
    
    window.setFlag = setFlag;
    window.getFlag = getFlag;
    window.hasFlag = hasFlag;
    
    // Equipment UI Integration (declared once at top level)
    var equipmentUI = null;
    var equipmentManager = null;
    
    // Expose equipment variables (will be set by initializeEquipmentSystem)
    Object.defineProperty(window, 'equipmentUI', {
        get: function() { return equipmentUI; },
        set: function(val) { equipmentUI = val; }
    });
    Object.defineProperty(window, 'equipmentManager', {
        get: function() { return equipmentManager; },
        set: function(val) { equipmentManager = val; }
    });
    
    // ============================================
    // Ink.js Initialization - REMOVED
    // ============================================
    
    // Ink system has been removed from project
    
    // Global combat state flag
    window.isCombatActive = false;
    
    // Debug tools shortcut removed
    window.addEventListener('keydown', (event) => {
        // Debug functionality removed
    });
    
})();
