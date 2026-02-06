(function() {
    'use strict';
    

// ===== BRUTAL ROGUELIKE MECHANICS =====

// Calculate armor protection (0-20, reduces bad outcome chance)
function calculateArmorProtection() {
    let protection = 0;
    const slots = ['head', 'torso', 'arms', 'legs'];
    slots.forEach(slot => {
        const item = gameState.equipment[slot]?.item;
        if (item) {
            // Get item quality/tier (0-10 scale, approximate from item data)
            // For now, assume better items have higher protection values
            // Equipment system should provide quality/defense values
            const quality = item.defense || item.quality || 0;
            protection += quality * 0.5; // Each armor piece adds protection
        }
    });
    return Math.min(20, Math.max(0, protection));
}

// Calculate bad outcome chance (modified by luck and equipment)
function calculateBadOutcomeChance(baseChance, stupidity, luck, equipment) {
    // Base chance: smart=5%, neutral=15%, stupid=40%
    let chance = baseChance || (stupidity === 'smart' ? 5 : stupidity === 'stupid' ? 40 : 15);
    
    // Luck reduces chance: -0.5% per luck point
    const luckMod = (gameState.stats.luck || 0) * 0.5;
    chance -= luckMod;
    
    // Equipment reduces chance: armor protection * 2%
    const armorProtection = calculateArmorProtection();
    chance -= armorProtection * 2; // Up to -40% from full plate
    
    // Clamp to 1-50%
    return Math.max(1, Math.min(50, chance));
}

// Select which bad outcome triggers (if any)
function selectBadOutcome(badOutcomes, baseChance) {
    if (!badOutcomes || badOutcomes.length === 0) return null;
    
    // Sort by chance (highest first) and check each
    const sorted = [...badOutcomes].sort((a, b) => (b.chance || 0) - (a.chance || 0));
    
    for (const outcome of sorted) {
        const outcomeChance = calculateBadOutcomeChance(
            outcome.chance || baseChance,
            outcome.stupidity || 'neutral',
            gameState.stats.luck,
            gameState.equipment
        );
        
        if (Math.random() * 100 < outcomeChance) {
            return outcome;
        }
    }
    
    return null;
}

// Apply bad outcome (permanent debuffs, conditions, etc.)
function applyBadOutcome(outcome) {
    if (!outcome) return;
    
    // Add condition (permanent if specified)
    if (outcome.condition) {
        const duration = outcome.permanent ? -1 : (outcome.duration || 2);
        addCondition(outcome.condition, 'negative', duration);
        
        // Apply permanent stat debuffs
        if (outcome.statDebuffs && outcome.permanent) {
            Object.entries(outcome.statDebuffs).forEach(([stat, debuff]) => {
                // Permanent stat reduction
                gameState.stats[stat] = Math.max(0, (gameState.stats[stat] || 0) + debuff);
                gameState.stats[stat] = clampStat(stat, gameState.stats[stat]);
            });
        }
        
        // Chance of infection for wounds
        if ((outcome.condition.includes('Wound') || outcome.condition.includes('Cut') || outcome.condition.includes('Injury')) && 
            !outcome.condition.includes('Infected')) {
            const infectionChance = 0.15; // 15% chance
            if (Math.random() < infectionChance) {
                const infectedCondition = outcome.condition + ' (Infected)';
                addCondition(infectedCondition, 'negative', -1); // Permanent
                // Additional permanent debuffs from infection
                applyStatChange('strength', -2, { silent: true });
                applyStatChange('endurance', -3, { silent: true });
                showNotification('Infection', 'The wound becomes infected. The pain is constant.', 'error');
            }
        }
    }
    
    // Apply temporary stat debuffs (if not permanent)
    if (outcome.statDebuffs && !outcome.permanent) {
        Object.entries(outcome.statDebuffs).forEach(([stat, debuff]) => {
            applyStatChange(stat, debuff);
        });
    }
    
    // Show outcome text
    if (outcome.text) {
        showNotification('Bad Outcome', outcome.text, 'error');
    }
}

// Arbitrary death events (camp fever, sepsis, etc.)
const ARBITRARY_DEATH_EVENTS = [
    {
        id: 'camp_fever',
        chance: 0.02, // 2% per scene if stress > 5
        condition: () => gameState.stats.stress > 5,
        text: "Camp fever takes you. The flux. The fever. It doesn't matter what you call it. You're dead in three days.",
        nextScene: 'death_camp_fever',
        avoidCost: 240, // Cost to avoid death (20 shillings = 240 pence)
        avoidScene: 'avoid_camp_fever'
    },
    {
        id: 'septic_wound',
        baseChance: 0.05, // 5% if wounded (modified by chapter)
        condition: () => {
            return gameState.conditions.some(c => 
                c.name.includes('Wound') || 
                c.name.includes('Injury') || 
                c.name.includes('Cut')
            );
        },
        text: "The wound turns black. The smell is wrong. Sepsis. Your arm swells. The surgeon takes it. You don't survive the amputation.",
        nextScene: 'death_sepsis',
        avoidCost: 360, // Cost for proper medical care (30 shillings = 360 pence)
        avoidScene: 'avoid_sepsis'
    },
    {
        id: 'horse_fall',
        baseChance: 0.03, // 3% if mounted (modified by chapter)
        condition: () => gameState.equipment.mount && gameState.equipment.mount.item,
        text: "Your horse spooks. You're thrown. Both legs break. The campaign is over. You're left behind.",
        nextScene: 'forced_retirement_broken_legs',
        avoidCost: 300, // Cost for better horse/equipment (25 shillings = 300 pence)
        avoidScene: 'avoid_horse_fall'
    },
    {
        id: 'dysentery',
        baseChance: 0.03, // 3% if stress > 7 (modified by chapter)
        condition: () => gameState.stats.stress > 7,
        text: "The shits. The bloody shits. You can't keep water down. You're dead in a week.",
        nextScene: 'death_dysentery',
        avoidCost: 180, // Cost for clean water/food (15 shillings = 180 pence)
        avoidScene: 'avoid_dysentery'
    },
    {
        id: 'pneumonia',
        baseChance: 0.02, // 2% if fatigued and stress > 6 (modified by chapter)
        condition: () => hasCondition('Fatigued') && gameState.stats.stress > 6,
        text: "The cough won't stop. Your chest burns. Pneumonia. You're dead before the week is out.",
        nextScene: 'death_pneumonia',
        avoidCost: 216, // Cost for shelter/medicine (18 shillings = 216 pence)
        avoidScene: 'avoid_pneumonia'
    },
    {
        id: 'plague',
        baseChance: 0.15, // 15% during plague chapter ONLY (modified by chapter = 30%!)
        condition: () => gameState.chapter === 'plague',
        text: "The black boils appear. The fever. The coughing blood. The Black Death. You're dead in days.",
        nextScene: 'death_plague',
        avoidCost: 600, // Very expensive to avoid plague (50 shillings = 600 pence = £2 10s)
        avoidScene: 'avoid_plague'
    },
    {
        id: 'starvation',
        baseChance: 0.04, // 4% during siege (modified by chapter)
        condition: () => gameState.chapter === 'calais' && gameState.stats.stress > 6,
        text: "The rations run out. You starve. Your body gives up. You die in the siege lines.",
        nextScene: 'death_starvation',
        avoidCost: 300, // Cost for food (25 shillings = 300 pence = £1 5s)
        avoidScene: 'avoid_starvation'
    },
    {
        id: 'broke_death',
        baseChance: 0.04, // 4% if completely broke (increased risk)
        condition: () => (gameState.stats.wealth || 0) <= 0,
        text: "You have nothing. No coin. No favors. No way to buy your way out of trouble. When sickness comes, when injury strikes, when hunger gnaws—you have no recourse. Broke men die.",
        nextScene: 'death_broke',
        avoidCost: 0, // Can't avoid if already broke
        avoidScene: null
    }
];

// Check for arbitrary death events
// Helper: Determine if arbitrary death should be checked when entering a scene
function shouldCheckArbitraryDeathOnEnter(sceneKey) {
    if (!sceneKey || typeof sceneKey !== 'string') return false;

    // Never death-check on these "UI wrapper" / encounter scenes
    const block = new Set([
        'character_creation',
        'quick_start_review',
        'campfire_interlude',
        'skirmish_roadside',
        'skirmish_roadside_resolve'
    ]);
    if (block.has(sceneKey)) return false;

    // Never check on death/retirement/avoidance scenes
    if (sceneKey.startsWith('death_') ||
        sceneKey.startsWith('forced_retirement_') ||
        sceneKey.startsWith('avoid_')) {
        return false;
    }

    // Only death-check on travel-ish scenes
    const prefixes = ['march_', 'marsh_', 'winter_', 'between_', 'siege_'];
    return prefixes.some(p => sceneKey.startsWith(p));
}

function checkArbitraryDeath() {
    // Never check during character creation, campfires, or death scenes
    if (gameState.currentScene === 'character_creation' || 
        gameState.currentScene === 'campfire_interlude' ||
        gameState.currentScene.startsWith('death_') ||
        gameState.currentScene.startsWith('forced_retirement_') ||
        gameState.currentScene.startsWith('avoid_')) {
        return null;
    }
    
    // Get chapter death modifier (plague = 2x, calais = 1.5x, etc.)
    const chapterModifier = getChapterDeathModifier();
    
    // Increase death risk if broke (wealth = 0)
    const wealth = gameState.stats.wealth || 0;
    const brokeModifier = wealth <= 0 ? 1.5 : 1.0; // 50% higher death risk when broke
    
    // Check each death event
    for (const event of ARBITRARY_DEATH_EVENTS) {
        if (event.condition && event.condition()) {
            // Use baseChance if available, otherwise fall back to chance (for backward compatibility)
            const baseChance = event.baseChance !== undefined ? event.baseChance : (event.chance || 0);
            const finalChance = baseChance * chapterModifier * brokeModifier;
            const roll = Math.random();
            if (roll < finalChance) {
                // Store the death event for potential avoidance
                gameState.pendingDeathEvent = event;
                return event;
            }
        }
    }
    return null;
}

// Psychological disorders at stress cap (10)
const PSYCHOLOGICAL_DISORDERS = [
    {
        id: 'nightmares',
        name: 'Nightmares',
        text: "You can't sleep. When you do, you see the dead. Every night. Every dream.",
        statDebuffs: { morale: -2, stress: 0 }, // Stress stays at 10
        condition: 'Nightmares'
    },
    {
        id: 'paranoia',
        name: 'Paranoia',
        text: "You trust no one. Every shadow is an enemy. Every whisper is a plot against you.",
        statDebuffs: { charisma: -2, wits: -1 },
        condition: 'Paranoia'
    },
    {
        id: 'rage',
        name: 'Uncontrollable Rage',
        text: "The anger comes without warning. You break things. You hurt people. You can't stop it.",
        statDebuffs: { charisma: -3, morale: -1 },
        condition: 'Uncontrollable Rage'
    },
    {
        id: 'despair',
        name: 'Despair',
        text: "Nothing matters. Not victory. Not survival. Not tomorrow. You're already dead.",
        statDebuffs: { morale: -3, initiative: -2 },
        condition: 'Despair'
    }
];

// Check for psychological disorders at stress cap
function checkStressCapDisorders() {
    if (gameState.stats.stress >= 10) {
        // Check if already has a disorder
        const hasDisorder = gameState.conditions.some(c => 
            c.name === 'Nightmares' || 
            c.name === 'Paranoia' || 
            c.name === 'Uncontrollable Rage' || 
            c.name === 'Despair'
        );
        
        if (!hasDisorder) {
            // Randomly assign a disorder
            const disorder = PSYCHOLOGICAL_DISORDERS[Math.floor(Math.random() * PSYCHOLOGICAL_DISORDERS.length)];
            addCondition(disorder.condition, 'negative', -1); // Permanent
            
            // Apply stat debuffs
            Object.entries(disorder.statDebuffs).forEach(([stat, debuff]) => {
                applyStatChange(stat, debuff, { silent: true });
            });
            
            showNotification('Psychological Disorder', disorder.text, 'error');
        }
    }
}

    
    // Make available globally
    window.calculateArmorProtection = calculateArmorProtection;
    window.calculateBadOutcomeChance = calculateBadOutcomeChance;
    window.selectBadOutcome = selectBadOutcome;
    window.applyBadOutcome = applyBadOutcome;
    window.ARBITRARY_DEATH_EVENTS = ARBITRARY_DEATH_EVENTS;
    window.shouldCheckArbitraryDeathOnEnter = shouldCheckArbitraryDeathOnEnter;
    window.checkArbitraryDeath = checkArbitraryDeath;
    window.PSYCHOLOGICAL_DISORDERS = PSYCHOLOGICAL_DISORDERS;
    window.checkStressCapDisorders = checkStressCapDisorders;
})();
