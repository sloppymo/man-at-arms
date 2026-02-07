(function() {
    'use strict';
    

// ===== SKIRMISH SYSTEM =====

// Compute explicit gear bonuses for skirmish choices
function computeSkirmishModifiers(choiceId) {
    const mods = {
        reachBonus: 0,
        armorDefenseBonus: 0,
        moraleDeltaBonus: 0,
        variantModifier: 0 // Applied to all choices
    };
    
    // Apply variant-specific modifiers
    const variantContext = window.gameState.lastSkirmishContext || {};
    if (variantContext.variantId === 'mud') {
        // Mud & Ruts: -1 to all bonuses (worse footing)
        mods.variantModifier = -1;
    } else if (variantContext.variantId === 'lane') {
        // Narrow Lane: cramped space makes all actions harder
        // Spear reach is also reduced (handled below)
        mods.variantModifier = -1; // Same penalty as mud, but for different reason (cramped space)
    }
    
    // Reach bonus: Check if weapon is spear
    const weapon = window.gameState.equipment?.weapon?.item;
    if (weapon && weapon.id === 'spear') {
        mods.reachBonus = 2;
        // Narrow lane reduces spear effectiveness
        if (variantContext.variantId === 'lane') {
            mods.reachBonus -= 1; // Reduce by 1 in cramped space
        }
    }
    
    // Armor defense bonus: Check if torso has mail
    const torso = window.gameState.equipment?.torso?.item;
    if (torso && torso.id && (torso.id.includes('mail') || torso.id === 'mail_shirt')) {
        mods.armorDefenseBonus = 2;
    }
    
    // Morale delta bonus: Based on morale thresholds
    const morale = window.gameState.stats.morale || 5;
    if (morale >= 7) {
        mods.moraleDeltaBonus = 1;
    } else if (morale <= 3) {
        mods.moraleDeltaBonus = -1;
    }
    
    return mods;
}

// Calculate deltas based on margin bands, return metadata flags
function computeSkirmishCosts(result, choiceId, mods) {
    const margin = result.margin;
    const deltas = {exertion: 0, wear: 0, morale: 0, wealth: 0};
    const flags = {};
    
    // Success always costs something (tuned to prevent excessive stacking)
    if (margin >= 0) {
        if (margin <= 1) {
            // Close success - worse cost
            deltas.wear += 1; // Reduced from 2
            deltas.morale -= 1;
        } else if (margin <= 4) {
            // Normal success
            deltas.wear += 1;
        } else {
            // Clean win (margin 5+)
            deltas.wear += 1; // Still small cost
        }
    } else if (margin >= -2) {
        // Partial failure
        deltas.wear += 1; // Reduced from 2
        deltas.morale -= 1;
    } else {
        // Full failure (margin <= -3)
        deltas.wear += 2; // Reduced from 3
        deltas.morale -= 2;
    }
    
    // Mail always adds wear (heat/strain floor) - only if wearing mail
    if (mods.armorDefenseBonus > 0) {
        deltas.wear += 1;
    }
    
    // Spear "inside reach" downside (Press only, on failure/partial)
    if (choiceId === 'press' && mods.reachBonus > 0 && margin < 0 && margin >= -2) {
        deltas.wear += 1;
        flags.insideReach = true; // Return as metadata, don't mutate global state
    }

    // Fix B: Narrow Lane additional wear on Press (cramped fighting space)
    // Only trigger on partial failure (-2 to -1 margin) where strain shows
    const variantContext = gameState.lastSkirmishContext || {};
    if (variantContext.variantId === 'lane' && choiceId === 'press' && margin < 0 && margin >= -2) {
        deltas.wear += 1;
        flags.laneCramped = true;
    }

    // Cap total wear increase per fight to prevent excessive stacking
    deltas.wear = Math.min(deltas.wear, 3); // Cap at 3 per skirmish

    return { deltas, flags };
}

// Apply computed deltas to gameState
function applySkirmishDeltas(deltas) {
    // Apply morale change
    if (deltas.morale !== 0) {
        window.applyStatChange('morale', deltas.morale);
    }
    
    // Apply exertion (includes press cost + timing cost, all tracked in deltas)
    if (deltas.exertion !== 0) {
        window.gameState.exertion = Math.max(0, Math.min(10, (window.gameState.exertion || 0) + deltas.exertion));
    }
    
    // Apply wear
    if (deltas.wear !== 0) {
        window.gameState.wear = Math.max(0, Math.min(10, (window.gameState.wear || 0) + deltas.wear));
    }
    
    // Apply wealth (if any)
    if (deltas.wealth !== 0) {
        window.applyStatChange('wealth', deltas.wealth);
    }
}

// Generate display formula string reflecting actual computed mods
function buildFormulaText(choiceId, mods, exertion, effectiveStat) {
    let parts = ['1d10'];
    let bonusTotal = effectiveStat;
    
    if (choiceId === 'press') {
        parts.push(`+ Strength (${effectiveStat})`);
        if (mods.reachBonus > 0) {
            const variantContext = gameState.lastSkirmishContext || {};
            if (variantContext.variantId === 'lane' && mods.reachBonus === 1) {
                // Spear reach reduced from 2 to 1 in cramped lane
                parts.push(`+ Reach (+${mods.reachBonus}, cramped)`);
            } else {
                parts.push(`+ Reach (+${mods.reachBonus})`);
            }
            bonusTotal += mods.reachBonus;
        } else if (mods.reachBonus < 0) {
            // Handle reduced reach (e.g., in narrow lane)
            parts.push(`+ Reach (${mods.reachBonus})`);
            bonusTotal += mods.reachBonus;
        }
    } else if (choiceId === 'hold') {
        parts.push(`+ Wits (${effectiveStat})`);
        if (mods.armorDefenseBonus > 0) {
            parts.push(`+ Armor (+${mods.armorDefenseBonus})`);
            bonusTotal += mods.armorDefenseBonus;
        }
    } else if (choiceId === 'drive') {
        parts.push(`+ Charisma (${effectiveStat})`);
        if (mods.moraleDeltaBonus !== 0) {
            parts.push(`+ Morale (${mods.moraleDeltaBonus > 0 ? '+' : ''}${mods.moraleDeltaBonus})`);
            bonusTotal += mods.moraleDeltaBonus;
        }
    }
    
    if (exertion > 0) {
        parts.push(`- Exertion (${exertion})`);
        bonusTotal -= exertion;
    }
    
    // Add variant modifier if applicable (e.g., mud penalty, lane cramped space)
    if (mods.variantModifier !== 0) {
    const variantContext = window.gameState.lastSkirmishContext || {};
    if (variantContext.variantId === 'mud') {
            parts.push(`- Mud (-1)`);
            bonusTotal += mods.variantModifier; // Already negative
        } else if (variantContext.variantId === 'lane') {
            parts.push(`- Cramped Space (-1)`);
            bonusTotal += mods.variantModifier; // Already negative
        }
    }
    
    return parts.join(' ') + ` = 1d10 + ${bonusTotal}`;
}

// Generate array of cost strings for UI
function buildCostList(deltas, choiceId, mods, result, flags, timing) {
    const costs = [];
    
    if (deltas.exertion > 0) {
        const exertionReasons = [];
        if (choiceId === 'press') {
            exertionReasons.push('press');
        }
        // Use new timing data for exertion reasons
        if (timing && timing.grade === 'PERFECT') {
            exertionReasons.push('perfect tempo');
        } else if (timing && timing.grade === 'GOOD') {
            exertionReasons.push('good tempo');
        }
        if (timing && timing.tier === 'greedy') {
            exertionReasons.push('greedy tier');
        }
        const reasonText = exertionReasons.length > 0 ? ` (${exertionReasons.join(', ')})` : '';
        costs.push(`Exertion +${deltas.exertion}${reasonText}`);
    }
    
    if (deltas.wear > 0) {
        const wearReasons = [];
        const margin = result.margin;
        
        if (margin >= 0 && margin <= 1) {
            wearReasons.push('close success');
        } else if (margin >= 0 && margin <= 4) {
            wearReasons.push('normal success');
        } else if (margin >= 0) {
            wearReasons.push('clean win');
        } else if (margin >= -2) {
            wearReasons.push('partial failure');
        } else {
            wearReasons.push('full failure');
        }
        
        if (mods.armorDefenseBonus > 0) {
            wearReasons.push('mail heat');
        }
        
        if (flags.insideReach) {
            wearReasons.push('inside reach');
        }

        if (flags.laneCramped) {
            wearReasons.push('cramped lane');
        }

        const reasonText = wearReasons.length > 0 ? ` (${wearReasons.join(', ')})` : '';
        costs.push(`Wear +${deltas.wear}${reasonText}`);
    }
    
    if (deltas.morale < 0) {
        costs.push(`Morale ${deltas.morale}`);
    }
    
    if (deltas.wealth !== 0) {
        costs.push(`Wealth ${deltas.wealth > 0 ? '+' : ''}${deltas.wealth}`);
    }
    
    return costs;
}

// Generate gear-specific prose (only when relevant)
function buildGearCallouts(choiceId, mods, result, flags) {
    const callouts = [];
    
    // Spear inside reach callout
    if (flags.insideReach) {
        callouts.push('They got inside your reach; the spear was a staff for a moment.');
    }
    
    // Mail heat callout (only on certain outcomes)
    if (mods.armorDefenseBonus > 0 && result.margin < 0) {
        callouts.push('Mail turned the edge; the bruise blooms anyway.');
    }
    
    return callouts;
}

// Execute skirmish resolution, apply costs, store result
// Now async to support Tempo Strike timing minigame
async function runSkirmish(choiceId) {
    // Get variant context (set by scene choice)
    const variantContext = gameState.lastSkirmishContext || {};
    
    // Get equipped weapon for context
    const equippedWeapon = window.gameState.equipment?.weapon?.item;
    const weaponId = equippedWeapon?.id || null;
    
    // Map choiceId to profileId
    const profileMap = {
        'press': 'press',
        'hold': 'hold', 
        'drive': 'drive'
    };
    const profileId = profileMap[choiceId] || 'press';
    
    const mods = computeSkirmishModifiers(choiceId);
    const exertion = window.gameState.exertion || 0;
    
    // Run Tempo Strike timing minigame with profile context
    const timing = await window.startTempoStrike({
        title: 'Tempo Strike',
        subtitle: 'Tap to stop the marker in the orange zone for a timing bonus.',
        profileId: profileId,
        tierId: 'safe', // Default to safe tier
        weaponId: weaponId,
        statKey: null, // Will be determined by profile
        isRetry: false,
        opponentArmor: Math.floor(mods.armorDefenseBonus / 2), // Scale armor bonus to armor level
        skillLevel: Math.floor((window.gameState.stats?.agility || 0) / 5) + 1 // Scale agility to skill level
    });
    
    let statKey, dc, bonus;
    if (choiceId === 'press') {
        statKey = 'strength';
        dc = 12; // Drastically increased difficulty
        bonus = mods.reachBonus - exertion + timing.bonus + mods.variantModifier; // Include timing bonus and variant modifier
    } else if (choiceId === 'hold') {
        statKey = 'wits';
        dc = 11; // Drastically increased difficulty
        bonus = mods.armorDefenseBonus - exertion + timing.bonus + mods.variantModifier; // Include timing bonus and variant modifier
    } else if (choiceId === 'drive') {
        statKey = 'charisma';
        dc = 10; // Drastically increased difficulty
        bonus = mods.moraleDeltaBonus - exertion + timing.bonus + mods.variantModifier; // Include timing bonus and variant modifier
    }
    
    const result = window.resolveAction(statKey, dc, bonus);
    
    // Use exertion from QTE (single source of truth)
    const timingExertionCost = timing.exertionDelta || 0;
    
    // Calculate base exertion for action choice
    let baseExertionCost = 0;
    if (choiceId === 'press') {
        baseExertionCost = 1; // Press always costs 1
    }
    
    const totalExertionCost = baseExertionCost + timingExertionCost;
    
    // Compute costs based on margin (returns deltas + metadata flags)
    const costResult = computeSkirmishCosts(result, choiceId, mods);
    
    // Add exertion cost to deltas so it appears in costs list and is tracked in lastSkirmish
    // NOTE: Do NOT apply exertion directly here - applySkirmishDeltas() will handle it
    if (totalExertionCost > 0) {
        costResult.deltas.exertion = (costResult.deltas.exertion || 0) + totalExertionCost;
    }
    // Mud variant: add +1 wear on partial (worse footing cost)
    if (variantContext.variantId === 'mud' && result.margin >= -2 && result.margin < 0) {
        // Partial failure in mud: extra wear
        costResult.deltas.wear = Math.min(3, (costResult.deltas.wear || 0) + 1);
    }
    
    // Apply deltas
    applySkirmishDeltas(costResult.deltas);
    
    // RESOLVED: result.roll IS the total (d10 + effectiveStat + bonus)
    // rollDice() adds modifiers, so result.roll already includes everything
    const total = result.roll; // This is the total check value
    
    // Extract d10 for display if needed: d10 = result.roll - effectiveStat - bonus
    // But we can also compute it from the formula breakdown
    const d10 = result.roll - (result.effectiveStat + bonus); // For display purposes
    const modifierSum = result.effectiveStat + bonus; // For display breakdown
    
    // Compute chance using exact Crécy pattern
    // For display: neededRoll = adjustedDifficulty - (effectiveStat + bonus)
    // This is the number needed on the d10 to succeed
    const neededRoll = result.difficulty - (result.effectiveStat + bonus);
    const successChance = Math.max(0, Math.min(100, ((10 - neededRoll + 1) / 10) * 100));
    
    // Build formula text with actual computed mods (not generic)
    // Include timing bonus in formula text if non-zero
    let formulaText = buildFormulaText(choiceId, mods, exertion, result.effectiveStat);
    if (timing.bonus > 0) {
        // Append timing bonus to formula
        formulaText += ` + Tempo (+${timing.bonus})`;
    }
    
    // If first check failed, transition to second check scene instead
    if (!result.success) {
        // Clear any old first failure data and set new one
        // Store the mods object (will be recalculated in second chance, but keep for reference)
        window.gameState.lastSkirmishFirstFailure = {
            statKey: statKey,
            dc: dc,
            bonus: bonus,
            choiceId: choiceId,
            mods: mods,
            timing: timing,
            variantContext: variantContext
        };
        // Don't create lastSkirmish yet - wait for second chance result
        // Clear any existing lastSkirmish to avoid confusion
        window.gameState.lastSkirmish = null;
        return 'skirmish_second_chance';
    }
    
    // Success - clear any old first failure flag and create lastSkirmish data
    window.gameState.lastSkirmishFirstFailure = null;
    
    // Determine variant key for storage
    let variantKey = 'roadside_clash';
    if (variantContext.variantId === 'mud') {
        variantKey = 'mud_ruts';
    } else if (variantContext.variantId === 'lane') {
        variantKey = 'narrow_lane';
    }
    
    window.gameState.lastSkirmish = {
        key: variantKey,
        variantId: variantContext.variantId || 'roadside',
        choiceId: choiceId,
        statKey: statKey,
        dc: result.difficulty, // Use adjusted difficulty for display
        baseDc: dc, // Store base DC for reference
        formulaText: formulaText,
        chancePct: Math.round(successChance),
        d10: d10, // Store d10 separately for clarity
        modifierSum: modifierSum, // Store modifier sum
        total: total, // Correct total: result.roll
        margin: result.margin,
        success: result.margin >= 0,  // Use margin, not result.success
        partial: (result.margin === -1 || result.margin === -2),
        mods: mods,
        deltas: costResult.deltas,
        costs: buildCostList(costResult.deltas, choiceId, mods, result, costResult.flags, timing),
        gearCallouts: buildGearCallouts(choiceId, mods, result, costResult.flags),
        insideReach: costResult.flags.insideReach || false, // From cost calculation metadata
        timing: { 
            bonus: timing.bonus, 
            label: timing.label,
            grade: timing.grade,
            hitErrorMs: timing.hitErrorMs,
            direction: timing.direction,
            tier: timing.tier,
            effectTags: timing.effectTags || [],
            exertionDelta: timing.exertionDelta || 0,
            beats: timing.beats
        }, // Store enhanced timing data
        // Use same fallback logic as getPostSkirmishNextScene() to ensure consistency
        returnScene: window.gameState.randomEncounter?.returnScene || (typeof window.scenes !== 'undefined' && window.scenes['march_through_normandy_1'] ? 'march_through_normandy_1' : null) // Fallback: null is safer than 'start'; getPostSkirmishNextScene() will handle it
    };
    
    // Transition to resolve scene (only reached on success)
    return 'skirmish_roadside_resolve';
}

// Helper: Get the next scene after leaving skirmish resolve
function getPostSkirmishNextScene() {
    const fallback = (typeof window.scenes !== 'undefined' && window.scenes['march_through_normandy_1'] ? 'march_through_normandy_1' : 'start');
    const rs = (window.gameState.lastSkirmish && typeof window.gameState.lastSkirmish.returnScene === "string")
        ? window.gameState.lastSkirmish.returnScene
        : "";
    
    // Never route back into the skirmish loop from the resolve exit.
    // This can happen if an interlude previously set returnScene to the resolve scene.
    const invalidReturnScenes = [
        'skirmish_roadside_resolve', 'skirmish_roadside', 
        'skirmish_roadside_mud', 'skirmish_roadside_lane',
        'start', 'character_creation', 'quick_start_review'
    ];
    if (!rs || invalidReturnScenes.includes(rs)) {
        return fallback;
    }
    
    return rs;
}

    
    // Make available globally
    window.computeSkirmishModifiers = computeSkirmishModifiers;
    window.computeSkirmishCosts = computeSkirmishCosts;
    window.applySkirmishDeltas = applySkirmishDeltas;
    window.buildFormulaText = buildFormulaText;
    window.buildCostList = buildCostList;
    window.buildGearCallouts = buildGearCallouts;
    window.runSkirmish = runSkirmish;
    window.getPostSkirmishNextScene = getPostSkirmishNextScene;
})();
