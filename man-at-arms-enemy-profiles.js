/**
 * Enemy Profile Database for Man-at-Arms Game
 * 
 * Historically accurate mid-14th century (Hundred Years' War era) enemy profiles
 * Based on Crécy (1346) and Calais (1346-47) campaign context
 */

const ENEMY_PROFILES = {
    // French Forces
    french_knight: {
        name: "French Knight",
        description: "A heavily armored French man-at-arms, sworn to the Valois crown. His plate and mail mark him as nobility.",
        health: 120,
        initiative: 6,
        strength: 7,
        agility: 5,
        archetype: "aggressive", // Charges recklessly, high damage, vulnerable to counters
        equipment: "Full plate harness, lance, arming sword",
        period: { earliest: 1337, latest: 1453 },
        socialClass: "knightly",
        tactics: "Heavy cavalry charge, relies on armor for defense",
        historicalNote: "French knights at Crécy were heavily armored but often dismounted to fight on foot."
    },
    
    french_man_at_arms: {
        name: "French Man-at-Arms",
        description: "A professional French soldier, well-equipped but not of noble birth. His experience shows in his stance.",
        health: 100,
        initiative: 5,
        strength: 6,
        agility: 5,
        archetype: "balanced", // Versatile fighter, adapts to situation
        equipment: "Mail haubergeon, bascinet, poleaxe",
        period: { earliest: 1337, latest: 1453 },
        socialClass: "retainer",
        tactics: "Formation fighting, uses polearms effectively",
        historicalNote: "French men-at-arms formed the core of the Valois army, often serving under contract."
    },
    
    french_crossbowman: {
        name: "French Crossbowman",
        description: "A professional crossbowman, likely Genoese mercenary. His weapon is deadly at range.",
        health: 80,
        initiative: 7,
        strength: 4,
        agility: 6,
        archetype: "cautious", // Keeps distance, punishes mistakes
        equipment: "Crossbow, pavise, dagger",
        period: { earliest: 1337, latest: 1453 },
        socialClass: "mercenary",
        tactics: "Ranged combat, uses pavise for cover",
        historicalNote: "Genoese crossbowmen were elite mercenaries, highly valued for their skill with the crossbow."
    },
    
    french_peasant_militia: {
        name: "French Peasant Militia",
        description: "A hastily armed French commoner, pressed into service. Fear and desperation drive him.",
        health: 60,
        initiative: 4,
        strength: 5,
        agility: 4,
        archetype: "cautious", // Frightened, defensive, but can be dangerous if cornered
        equipment: "Spear, padded jack, kettle hat",
        period: { earliest: 1337, latest: 1453 },
        socialClass: "peasant",
        tactics: "Formation fighting, relies on numbers",
        historicalNote: "French peasants were often pressed into service but lacked training and equipment."
    },
    
    // Genoese Mercenaries (serving French)
    genoese_crossbowman: {
        name: "Genoese Crossbowman",
        description: "A professional Genoese mercenary crossbowman. His skill with the weapon is legendary.",
        health: 85,
        initiative: 8,
        strength: 5,
        agility: 7,
        archetype: "skilled", // High defense, precise attacks, weak stamina
        equipment: "Heavy crossbow, pavise, rondel dagger",
        period: { earliest: 1337, latest: 1453 },
        socialClass: "mercenary",
        tactics: "Ranged superiority, uses pavise effectively",
        historicalNote: "Genoese crossbowmen at Crécy were among the best in Europe, but were overwhelmed by English longbow volleys."
    },
    
    // Scottish Allies (serving French)
    scottish_highlander: {
        name: "Scottish Highlander",
        description: "A fierce Scottish warrior, fighting in French service. His two-handed sword is a terror.",
        health: 110,
        initiative: 6,
        strength: 8,
        agility: 4,
        archetype: "aggressive", // High damage, relentless attacks, vulnerable to ranged
        equipment: "Claymore, targe, padded jack",
        period: { earliest: 1337, latest: 1453 },
        socialClass: "retainer",
        tactics: "Close combat, overwhelming offense",
        historicalNote: "Scottish forces often served as mercenaries in French armies during the Hundred Years' War."
    },
    
    // English Deserters/Traitors (rare)
    english_deserter: {
        name: "English Deserter",
        description: "A former English soldier who has turned coat. Desperation and guilt make him unpredictable.",
        health: 90,
        initiative: 5,
        strength: 5,
        agility: 6,
        archetype: "cautious", // Defensive, knows English tactics
        equipment: "Longbow, arming sword, padded jack",
        period: { earliest: 1337, latest: 1453 },
        socialClass: "deserter",
        tactics: "Uses English longbow tactics against former comrades",
        historicalNote: "Desertion was common in medieval armies, especially during long sieges like Calais."
    },
    
    // Siege Defenders (Calais context)
    calais_garrison_soldier: {
        name: "Calais Garrison Soldier",
        description: "A defender of Calais, weakened by months of siege but determined to hold the walls.",
        health: 70,
        initiative: 4,
        strength: 4,
        agility: 4,
        archetype: "cautious", // Weakened by starvation, fights defensively
        equipment: "Spear, worn mail, kettle hat",
        period: { earliest: 1346, latest: 1347 },
        socialClass: "garrison",
        tactics: "Defensive positions, uses walls and obstacles",
        historicalNote: "Calais defenders were severely weakened by the 11-month siege before surrender in August 1347."
    },
    
    // Bandits/Raiders (campaign context)
    norman_bandit: {
        name: "Norman Bandit",
        description: "A desperate raider preying on the war-torn countryside. Quick and ruthless.",
        health: 75,
        initiative: 7,
        strength: 5,
        agility: 7,
        archetype: "aggressive", // Hit-and-run tactics, high mobility
        equipment: "Short sword, buckler, leather armor",
        period: { earliest: 1337, latest: 1453 },
        socialClass: "outlaw",
        tactics: "Ambush, quick strikes, flees if outmatched",
        historicalNote: "War-torn regions saw a rise in banditry as displaced peasants turned to raiding."
    },
    
    // Elite Opponents (boss-level)
    french_captain: {
        name: "French Captain",
        description: "An experienced French military commander, leading by example. His skill is matched only by his determination.",
        health: 130,
        initiative: 7,
        strength: 7,
        agility: 6,
        archetype: "skilled", // Balanced, high stats, tactical awareness
        equipment: "Full harness, poleaxe, rondel dagger",
        period: { earliest: 1337, latest: 1453 },
        socialClass: "knightly",
        tactics: "Adapts to opponent, uses terrain, commands respect",
        historicalNote: "French captains at Crécy included experienced commanders like the Constable of France."
    },
    
    // Special: Crécy Context
    crecy_french_noble: {
        name: "French Noble at Crécy",
        description: "A high-ranking French noble, dismounted and fighting on foot. His pride drives him forward despite the chaos.",
        health: 140,
        initiative: 5,
        strength: 8,
        agility: 4,
        archetype: "aggressive", // Overconfident, charges recklessly
        equipment: "Full plate, oriflamme banner, war hammer",
        period: { earliest: 1346, latest: 1346 },
        socialClass: "knightly",
        tactics: "Direct assault, ignores tactical disadvantage",
        historicalNote: "Many French nobles at Crécy dismounted to fight on foot, leading to their destruction by English archers."
    }
};

/**
 * Get enemy profile by ID
 * @param {string} enemyId - The enemy profile ID
 * @returns {Object|null} The enemy profile or null if not found
 */
function getEnemyProfile(enemyId) {
    return ENEMY_PROFILES[enemyId] || null;
}

/**
 * Get all enemy profiles
 * @returns {Object} All enemy profiles
 */
function getAllEnemyProfiles() {
    return ENEMY_PROFILES;
}

/**
 * Get enemies available in a specific year
 * @param {number} year - The game year
 * @returns {Array} Array of enemy profile IDs available in that year
 */
function getEnemiesByYear(year) {
    return Object.keys(ENEMY_PROFILES).filter(id => {
        const enemy = ENEMY_PROFILES[id];
        return year >= enemy.period.earliest && year <= enemy.period.latest;
    });
}

/**
 * Get enemies by archetype
 * @param {string} archetype - 'aggressive', 'cautious', 'skilled', or 'balanced'
 * @returns {Array} Array of enemy profile IDs matching the archetype
 */
function getEnemiesByArchetype(archetype) {
    return Object.keys(ENEMY_PROFILES).filter(id => {
        return ENEMY_PROFILES[id].archetype === archetype;
    });
}

// Export for use in main game
if (typeof window !== 'undefined') {
    window.ENEMY_PROFILES = ENEMY_PROFILES;
    window.getEnemyProfile = getEnemyProfile;
    window.getAllEnemyProfiles = getAllEnemyProfiles;
    window.getEnemiesByYear = getEnemiesByYear;
    window.getEnemiesByArchetype = getEnemiesByArchetype;
}
