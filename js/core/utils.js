(function() {
    'use strict';
    
    // Stub functions for dependencies that will be implemented in later phases
    // These prevent errors during testing
    if (typeof window.checkLevelUp === 'undefined') {
        window.checkLevelUp = function() {
            // Will be implemented in later phase
        };
    }
    
    if (typeof window.getEffectiveStat === 'undefined') {
        window.getEffectiveStat = function(stat) {
            // Stub: return base stat value for now
            // Will be properly implemented in later phase with condition/equipment modifiers
            return window.gameState.stats[stat] || 0;
        };
    }
    
    // Clamp stat value to its limits
    function clampStat(key, value) {
        const limits = window.statLimits[key];
        if (!limits) return value;
        return Math.max(limits.min, Math.min(limits.max, value));
    }
    
    // Apply stat change with clamping
    function applyStatChange(key, delta, opts = {}) {
        if (window.gameState.stats[key] === undefined) return 0;
        const oldValue = window.gameState.stats[key];
        window.gameState.stats[key] = clampStat(key, oldValue + delta);
        const actualChange = window.gameState.stats[key] - oldValue;
        
        // Check for level up if experience changed
        if (key === 'experience' && actualChange > 0) {
            window.checkLevelUp();
        }
        
        // Only show notification if not silent and there was a change
        if (!opts.silent && actualChange !== 0) {
            // Notification logic can be added here if needed
            // Currently notifications are handled elsewhere in the codebase
        }
        
        return actualChange; // Return actual change
    }
    
    // Sanitize HTML to prevent XSS attacks
    function escapeHTML(text) {
        if (typeof text !== 'string') return text;
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    
    // Roll dice (1d10 + modifier)
    function rollDice(modifier = 0) {
        const roll = Math.floor(Math.random() * 10) + 1;
        return roll + modifier;
    }
    
    // Resolution system: roll against difficulty (uses effective stat)
    // Morale/stress can modify difficulty instead of stat for clearer feedback
    function resolveAction(stat, difficulty = 7, bonus = 0) {
        const effectiveStat = window.getEffectiveStat(stat);
        
        // Morale/stress modify difficulty (easier to succeed with high morale, harder with high stress)
        let adjustedDifficulty = difficulty;
        if (window.gameState.stats.morale >= 8) {
            adjustedDifficulty -= 1; // High morale makes checks easier
        } else if (window.gameState.stats.morale <= 2) {
            adjustedDifficulty += 1; // Low morale makes checks harder
        }
        if (window.gameState.stats.stress >= 7) {
            adjustedDifficulty += 1; // High stress makes checks harder
        }
        
        const roll = rollDice(effectiveStat + bonus);
        const success = roll >= adjustedDifficulty;
        return { 
            roll, 
            success, 
            margin: roll - adjustedDifficulty,
            effectiveStat: effectiveStat,
            baseStat: window.gameState.stats[stat] || 0,
            difficulty: adjustedDifficulty,
            baseDifficulty: difficulty
        };
    }
    
    // Normalization functions for consistent vocabulary across systems
    
    // Normalize location to region tag
    function normalizeRegion(location) {
        if (!location) return 'England';
        const loc = String(location).toLowerCase();
        if (loc.includes('england') || loc.includes('portsmouth') || loc.includes('london')) return 'England';
        if (loc.includes('france') || loc.includes('normandy') || loc.includes('caen') || loc.includes('calais')) return 'France';
        if (loc.includes('flanders')) return 'Flanders';
        if (loc.includes('italy') || loc.includes('milan')) return 'Northern Italy';
        return 'England';
    }
    
    // Normalize rank to social class for equipment availability
    function normalizeSocialClass(rank) {
        if (!rank) return 'retainer';
        const rankStr = String(rank).toLowerCase();
        
        // Map game ranks to equipment system social classes
        const rankMap = {
            'common soldier': 'retainer',
            'soldier': 'retainer',
            'sergeant': 'man-at-arms',
            'corporal': 'retainer',
            'lieutenant': 'man-at-arms',
            'captain': 'knightly',
            'knight': 'knightly',
            'squire': 'retainer',
            // Direct mappings if rank already matches
            'peasant': 'peasant',
            'militia': 'militia',
            'retainer': 'retainer',
            'man-at-arms': 'man-at-arms',
            'knightly': 'knightly'
        };
        
        return rankMap[rankStr] || 'retainer'; // Default fallback
    }
    
    // Normalize slot names to canonical form
    function normalizeSlot(slot) {
        if (!slot) return slot;
        const slotStr = String(slot).toLowerCase();
        
        // Canonical slot mapping - use 'offhand' as canonical for shields/offhand items
        const slotMap = {
            'offhand': 'offhand',
            'accessory': 'offhand', // Legacy → canonical
            'weapon': 'weapon',
            'mainhand': 'weapon',
            'primary': 'weapon',
            'secondary': 'weapon', // Secondary weapon slot → weapon
            'head': 'head',
            'torso': 'torso',
            'arms': 'arms',
            'legs': 'legs',
            'missile': 'missile',
            'ammo': 'missile'
        };
        
        return slotMap[slotStr] || slotStr; // Return normalized or original if not in map
    }
    
    // Check if player has a shield equipped (uses canonical slot names)
    function hasShieldEquipped() {
        if (!window.gameState || !window.gameState.equipment) return false;
        
        // Check canonical offhand slot
        const offhandSlot = window.gameState.equipment.offhand;
        if (offhandSlot && (offhandSlot.item?.id || offhandSlot.primary?.id || offhandSlot.secondary?.id)) {
            const itemId = offhandSlot.item?.id || offhandSlot.primary?.id || offhandSlot.secondary?.id;
            // Check if it's a shield (shields typically have 'shield' or 'buckler' in ID)
            if (itemId && (itemId.includes('shield') || itemId.includes('buckler'))) {
                return true;
            }
        }
        
        // Legacy check: accessory slot (for backward compatibility)
        const accessorySlot = window.gameState.equipment.accessory;
        if (accessorySlot && (accessorySlot.item?.id || accessorySlot.primary?.id)) {
            const itemId = accessorySlot.item?.id || accessorySlot.primary?.id;
            if (itemId && (itemId.includes('shield') || itemId.includes('buckler'))) {
                return true;
            }
        }
        
        // Check weapon secondary slot (legacy)
        const weaponSlot = window.gameState.equipment.weapon;
        if (weaponSlot && weaponSlot.secondary?.id) {
            const itemId = weaponSlot.secondary.id;
            if (itemId && (itemId.includes('shield') || itemId.includes('buckler'))) {
                return true;
            }
        }
        
        return false;
    }
    
    // Make available globally
    window.clampStat = clampStat;
    window.applyStatChange = applyStatChange;
    window.escapeHTML = escapeHTML;
    window.rollDice = rollDice;
    window.resolveAction = resolveAction;
    window.normalizeRegion = normalizeRegion;
    window.normalizeSocialClass = normalizeSocialClass;
    window.normalizeSlot = normalizeSlot;
    window.hasShieldEquipped = hasShieldEquipped;
})();
