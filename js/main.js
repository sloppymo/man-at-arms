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
    base.backgroundQuestionsAnswered = Array.isArray(loaded.backgroundQuestionsAnswered) ? loaded.backgroundQuestionsAnswered : [];
    
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
        // Build a JSON-safe payload (no Sets)
        const saveData = {
            saveVersion: SAVE_VERSION,
            ...gameState,
            enteredScenes: Array.from(window.gameState.enteredScenes)
        };
        
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
    const rs = (gameState && window.gameState.randomEncounter && window.gameState.randomEncounter.returnScene) ? window.gameState.randomEncounter.returnScene : null;
    const target = (typeof rs === 'string' && rs.length) ? rs : fallback;
    if (window.gameState.randomEncounter) {
        window.gameState.randomEncounter.active = false;
        window.gameState.randomEncounter.returnScene = null;
    }
    return target;
}
function window.isCriticalSceneKey(sceneKey) {
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

function window.shouldInsertRandomEncounter(fromSceneKey, nextSceneKey) {
    // Never chain random encounters or interrupt a random return.
    if ((fromSceneKey || '').startsWith('random_')) return false;
    if ((nextSceneKey || '').startsWith('random_')) return false;

    // Cooldown
    if (window.gameState.randomEncounter && window.gameState.randomEncounter.cooldown > 0) return false;

    // Exclusions (important scenes / transitions)
    if (window.isCriticalSceneKey(fromSceneKey) || window.isCriticalSceneKey(nextSceneKey)) return false;

    return true;
}

function window.tickRandomEncounterCooldown(fromSceneKey) {
    if (!window.gameState.randomEncounter) return;
    if ((fromSceneKey || '').startsWith('random_')) return;
    if (window.gameState.randomEncounter.cooldown > 0) {
        window.gameState.randomEncounter.cooldown -= 1;
    }
}

function window.maybeInsertRandomEncounter(fromSceneKey, nextSceneKey) {
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
function window.setPriority(category, letter) {
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

/** Recalculate all character creation derived stats from scratch (anti-stacking fix) */
function window.recalculateCharacterCreationDerivedStats() {
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
    if (window.gameState.backgroundQuestionsAnswered && Array.isArray(window.gameState.backgroundQuestionsAnswered)) {
        const backgroundEffects = {
            hard_father: { strength: 1, endurance: 1, charisma: -1 },
            mangled_hand: { agility: -1, endurance: -1, wits: 3 },
            lost_sibling: { wits: 1, endurance: 1, morale: -1 },
            village_hero: { charisma: 1, reputation: 2, strength: -1 },
            apprentice_master: { wits: 2, agility: 1, stress: 1 },
            first_love: { charisma: -1, wits: 1, morale: 1 }
        };
        window.gameState.backgroundQuestionsAnswered.forEach(function(qId) {
            const effects = backgroundEffects[qId];
            if (effects) {
                Object.keys(effects).forEach(function(stat) {
                    window.applyStatChange(stat, effects[stat], {silent: true});
                });
            }
        });
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
function window.recalculateFromPriorities(targetState = null) {
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
function window.validatePrioritiesCompleteAndUnique() {
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
function window.applyPriorityPreset(presetId) {
    if (!window.gameState.priorities) {
        window.gameState.priorities = { might: null, finesse: null, wits: null, presence: null, fortune: null };
    }
    
    const presets = {
        brawny: { might: 'A', finesse: 'C', wits: 'D', presence: 'E', fortune: 'B' },
        cunning: { might: 'D', finesse: 'A', wits: 'A', presence: 'C', fortune: 'B' },
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
function window.grantStartingKit(origin, kitTier) {
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
                    // Check if accessory/offhand already equipped using adapter
                    const currentOffhand = window.getEquippedItem('offhand', 'item') || window.getEquippedItem('accessory', 'item');
                    if (!currentOffhand || !currentOffhand.id) {
                        const invItem = window.gameState.inventory.find(function(i) { return i.id === item.id; });
                        if (invItem) {
                            const equipSuccess = window.equipmentManager.equipItem(invItem.id, 'accessory');
                            if (equipSuccess === false || (equipSuccess !== true && !window.gameState.equipment.accessory.item)) {
                                console.warn('[QA] Auto-equip failed for:', invItem.id, 'slot: accessory');
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
function window.selectBackground(bg) {
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
function window.nextCharacterCreationStep() {
    const currentStep = window.gameState.characterCreationStep || 1;
    const maxStep = 6;
    if (currentStep < maxStep) {
        window.gameState.characterCreationStep = currentStep + 1;
        window.updateDisplay();
    } else if (currentStep === maxStep) {
        // On step 6, clicking Next creates the character
        window.window.completeCharacterCreation();
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
    
    // Validate priorities
    const priorityValidation = window.validatePrioritiesCompleteAndUnique();
    if (!priorityValidation.ok) {
        window.showNotification('Character Creation', priorityValidation.message);
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
function window.prevCharacterCreationStep() {
    const currentStep = window.gameState.characterCreationStep || 1;
    if (currentStep > 1) {
        window.gameState.characterCreationStep = currentStep - 1;
        window.updateDisplay();
    }
}

function window.goToCharacterCreationStep(step) {
    if (step >= 1 && step <= 6) {
        window.gameState.characterCreationStep = step;
        window.updateDisplay();
    }
}

// Render step navigation buttons
function window.renderStepNavigation(currentStep, maxStep) {
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

// Quick Start Character Generation
function window.generateQuickStartCharacter() {
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
        cunning: { might: 'D', finesse: 'A', wits: 'A', presence: 'C', fortune: 'B' },
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
    
    // Random 1-2 background questions (apply after priorities and age)
    const backgroundQuestions = ['hard_father', 'mangled_hand', 'lost_sibling', 'village_hero', 'apprentice_master', 'first_love'];
    window.gameState.backgroundQuestionsAnswered = [];
    const numQuestions = Math.random() < 0.5 ? 1 : 2;
    // Fisher-Yates shuffle for proper random distribution
    const shuffled = [...backgroundQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    for (let i = 0; i < numQuestions && i < shuffled.length; i++) {
        window.gameState.backgroundQuestionsAnswered.push(shuffled[i]);
    }
    
    // Apply background question effects
    const backgroundEffects = {
        hard_father: { strength: 1, endurance: 1, charisma: -1 },
        mangled_hand: { agility: -1, endurance: -1, wits: 3 },
        lost_sibling: { wits: 1, endurance: 1, morale: -1 },
        village_hero: { charisma: 1, reputation: 2, strength: -1 },
        apprentice_master: { wits: 2, agility: 1, stress: 1 },
        first_love: { charisma: -1, wits: 1, morale: 1 }
    };
    if (typeof applyStatChange === 'function') {
        window.gameState.backgroundQuestionsAnswered.forEach(function(qId) {
            const effects = backgroundEffects[qId];
            if (effects) {
                Object.keys(effects).forEach(function(stat) {
                    window.applyStatChange(stat, effects[stat]);
                });
            }
        });
    }
    
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

function window.getEquipmentName(slot) {
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

function window.setEquipmentQuality(slot, quality) {
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
function window.initializeEquipmentSystem() {
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

function window.openEquipmentScreen() {
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

function window.closeEquipmentScreen() {
    if (equipmentUI) {
        equipmentUI.close();
    }
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
    
    // Check required modules before initialization
    function window.checkRequiredModules() {
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
            window.showNotification('Missing Modules', 
                'Some game files failed to load:\n' + missing.join('\n') + 
                '\n\nPlease refresh the page.', 
                'error'
            );
            return false;
        }
        return true;
    }
    
    // Check modules, but still try to initialize (game may be partially playable)
    const modulesOk = window.checkRequiredModules();
    
    // Initialize game with error handling
    // Even if modules are missing, try to start the game (it may be playable without equipment)
    try {
        // Small delay to ensure DOM is fully ready
        setTimeout(function() {
            try {
                window.initGame();
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
    
    updateModal();
    document.body.appendChild(modal);
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
    window.initGame = initGame;
    
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
})();
