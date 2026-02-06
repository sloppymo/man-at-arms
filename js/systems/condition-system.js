(function() {
    'use strict';
    
    // Add condition (wounds, fatigue, etc.)
    function addCondition(name, type = 'negative', duration = -1) {
        gameState.conditions.push({
            name,
            type,
            duration,
            added: gameState.year
        });
    }
    
    // Remove condition
    function removeCondition(name) {
        gameState.conditions = gameState.conditions.filter(c => c.name !== name);
    }
    
    // Check if has condition
    function hasCondition(name) {
        return gameState.conditions.some(c => c.name === name);
    }
    
    // Update conditions (heal over time, etc.)
    function updateConditions() {
        gameState.conditions = gameState.conditions.filter(condition => {
            if (condition.duration === -1) return true; // Permanent
            const yearsPassed = gameState.year - condition.added;
            return yearsPassed < condition.duration;
        });
    }
    
    // Get condition effects on stats
    function getConditionEffects() {
        let effects = {};
        gameState.conditions.forEach(condition => {
            if (condition.name === 'Wounded') {
                effects.strength = (effects.strength || 0) - 1;
                effects.endurance = (effects.endurance || 0) - 1;
            } else if (condition.name === 'Fatigued') {
                effects.endurance = (effects.endurance || 0) - 1;
                effects.agility = (effects.agility || 0) - 1;
            } else if (condition.name === 'Inspired') {
                effects.morale = (effects.morale || 0) + 1;
            } else if (condition.name === 'Seriously Wounded') {
                effects.strength = (effects.strength || 0) - 2;
                effects.endurance = (effects.endurance || 0) - 2;
                effects.agility = (effects.agility || 0) - 1;
            } else if (condition.name === 'Shaken') {
                effects.morale = (effects.morale || 0) - 1;
                effects.wits = (effects.wits || 0) - 1;
            } else if (condition.name === 'Sick') {
                effects.endurance = (effects.endurance || 0) - 2;
                effects.strength = (effects.strength || 0) - 1;
            }
        });
        return effects;
    }
    
    // Make available globally
    window.addCondition = addCondition;
    window.removeCondition = removeCondition;
    window.hasCondition = hasCondition;
    window.updateConditions = updateConditions;
    window.getConditionEffects = getConditionEffects;
})();
