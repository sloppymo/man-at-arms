// ============================================
// Man-at-Arms Core Utilities
// ES Module with backward compatibility
// ============================================

import { statLimits } from './constants.js';

// Stub functions that will be properly implemented in later phases
export function checkLevelUp() {
  // Phase 2+ implementation
}

export function getEffectiveStat(stat) {
  // Phase 2+ implementation
  return window.gameState?.stats?.[stat] || 0;
}

/**
 * Clamp stat value to its defined limits
 * @param {string} key - Stat name
 * @param {number} value - Value to clamp
 * @returns {number} Clamped value
 */
export function clampStat(key, value) {
  const limits = statLimits[key];
  if (!limits) return value;
  return Math.max(limits.min, Math.min(limits.max, value));
}

/**
 * Apply stat change with clamping and side effects
 * @param {string} key - Stat name
 * @param {number} delta - Amount to change
 * @param {Object} opts - Options
 * @returns {number} Actual change applied
 */
export function applyStatChange(key, delta, opts = {}) {
  if (window.gameState?.stats?.[key] === undefined) return 0;
  
  const oldValue = window.gameState.stats[key];
  window.gameState.stats[key] = clampStat(key, oldValue + delta);
  const actualChange = window.gameState.stats[key] - oldValue;
  
  // Check for level up if experience changed
  if (key === 'experience' && actualChange > 0) {
    checkLevelUp();
  }
  
  return actualChange;
}

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
export function escapeHTML(text) {
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

/**
 * Roll dice (1d10 + modifier)
 * @param {number} modifier - Modifier to add
 * @returns {number} Roll result
 */
export function rollDice(modifier = 0) {
  const roll = Math.floor(Math.random() * 10) + 1;
  return roll + modifier;
}

/**
 * Resolution system: roll against difficulty with modifiers
 * @param {string} stat - Stat to use
 * @param {number} difficulty - Target difficulty (default 12)
 * @param {number} bonus - Additional bonus
 * @returns {Object} Resolution result
 */
export function resolveAction(stat, difficulty = 12, bonus = 0) {
  const effectiveStat = getEffectiveStat(stat);
  let adjustedDifficulty = difficulty;
  
  // Morale modifiers
  if (window.gameState?.stats) {
    const morale = window.gameState.stats.morale;
    if (morale >= 9) adjustedDifficulty -= 2;
    else if (morale >= 7) adjustedDifficulty -= 1;
    else if (morale <= 1) adjustedDifficulty += 3;
    else if (morale <= 3) adjustedDifficulty += 2;
    else if (morale <= 5) adjustedDifficulty += 1;
    
    // Stress modifiers
    const stress = window.gameState.stats.stress;
    if (stress >= 9) adjustedDifficulty += 3;
    else if (stress >= 7) adjustedDifficulty += 2;
    else if (stress >= 5) adjustedDifficulty += 1;
  }
  
  // Exertion penalty
  if (window.gameState?.exertion) {
    if (window.gameState.exertion >= 8) adjustedDifficulty += 2;
    else if (window.gameState.exertion >= 5) adjustedDifficulty += 1;
  }
  
  // Condition penalties
  if (window.gameState?.conditions && Array.isArray(window.gameState.conditions)) {
    const negativeConditions = window.gameState.conditions.filter(c => c.type === 'negative' || !c.type);
    adjustedDifficulty += negativeConditions.length;
  }
  
  // Clamp difficulty
  adjustedDifficulty = Math.max(3, Math.min(20, adjustedDifficulty));
  
  const roll = rollDice(effectiveStat + bonus);
  const success = roll >= adjustedDifficulty;
  
  return {
    roll,
    success,
    margin: roll - adjustedDifficulty,
    effectiveStat,
    baseStat: window.gameState?.stats?.[stat] || 0,
    difficulty: adjustedDifficulty,
    baseDifficulty: difficulty
  };
}

// ============================================
// Normalization Functions
// ============================================

/**
 * Normalize location string to region tag
 * @param {string} location - Location string
 * @returns {string} Region tag
 */
export function normalizeRegion(location) {
  if (!location) return 'England';
  const loc = String(location).toLowerCase();
  if (loc.includes('england') || loc.includes('portsmouth') || loc.includes('london')) return 'England';
  if (loc.includes('france') || loc.includes('normandy') || loc.includes('caen') || loc.includes('calais')) return 'France';
  if (loc.includes('flanders')) return 'Flanders';
  if (loc.includes('italy') || loc.includes('milan')) return 'Northern Italy';
  return 'England';
}

/**
 * Normalize rank to social class for equipment availability
 * @param {string} rank - Rank string
 * @returns {string} Social class
 */
export function normalizeSocialClass(rank) {
  if (!rank) return 'retainer';
  const rankStr = String(rank).toLowerCase();
  
  const rankMap = {
    'common soldier': 'retainer',
    'soldier': 'retainer',
    'sergeant': 'man-at-arms',
    'corporal': 'retainer',
    'lieutenant': 'man-at-arms',
    'captain': 'knightly',
    'knight': 'knightly',
    'squire': 'retainer',
    'peasant': 'peasant',
    'militia': 'militia',
    'retainer': 'retainer',
    'man-at-arms': 'man-at-arms',
    'knightly': 'knightly'
  };
  
  return rankMap[rankStr] || 'retainer';
}

/**
 * Normalize slot names to canonical form
 * @param {string} slot - Slot name
 * @returns {string} Canonical slot name
 */
export function normalizeSlot(slot) {
  if (!slot) return slot;
  const slotStr = String(slot).toLowerCase();
  
  const slotMap = {
    'offhand': 'offhand',
    'accessory': 'offhand',
    'weapon': 'weapon',
    'mainhand': 'weapon',
    'primary': 'weapon',
    'secondary': 'weapon',
    'head': 'head',
    'torso': 'torso',
    'arms': 'arms',
    'legs': 'legs',
    'missile': 'missile',
    'ammo': 'missile'
  };
  
  return slotMap[slotStr] || slotStr;
}

/**
 * Check if player has a shield equipped
 * @returns {boolean} True if shield equipped
 */
export function hasShieldEquipped() {
  if (!window.gameState?.equipment) return false;
  
  // Check offhand slot
  const offhandSlot = window.gameState.equipment.offhand;
  if (offhandSlot) {
    const itemId = offhandSlot.item?.id || offhandSlot.primary?.id || offhandSlot.secondary?.id;
    if (itemId && (itemId.includes('shield') || itemId.includes('buckler'))) return true;
  }
  
  // Legacy accessory slot
  const accessorySlot = window.gameState.equipment.accessory;
  if (accessorySlot) {
    const itemId = accessorySlot.item?.id || accessorySlot.primary?.id;
    if (itemId && (itemId.includes('shield') || itemId.includes('buckler'))) return true;
  }
  
  // Legacy weapon secondary
  const weaponSlot = window.gameState.equipment.weapon;
  if (weaponSlot?.secondary?.id) {
    const itemId = weaponSlot.secondary.id;
    if (itemId && (itemId.includes('shield') || itemId.includes('buckler'))) return true;
  }
  
  return false;
}

// ============================================
// Backward Compatibility
// ============================================
if (typeof window !== 'undefined') {
  window.clampStat = clampStat;
  window.applyStatChange = applyStatChange;
  window.escapeHTML = escapeHTML;
  window.rollDice = rollDice;
  window.resolveAction = resolveAction;
  window.normalizeRegion = normalizeRegion;
  window.normalizeSocialClass = normalizeSocialClass;
  window.normalizeSlot = normalizeSlot;
  window.hasShieldEquipped = hasShieldEquipped;
  window.checkLevelUp = checkLevelUp;
  window.getEffectiveStat = getEffectiveStat;
}
