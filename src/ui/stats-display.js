// ============================================
// Man-at-Arms Stats Display UI
// ES module implementation with modal display
// ============================================

import { gameState } from '../core/gameState.js';
import { dispatcher, EVENT_TYPES } from '../core/dispatcher.js';
import { getEffectiveStat, escapeHTML } from '../core/utils.js';
import { getErrorHandler } from '../core/error-handler.js';

/**
 * Display comprehensive character statistics in a modal
 * Uses gameState.stats as data source and creates modal overlay
 */
export function showStats() {
  try {
    // Get stat labels with emojis
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

    // Format stats with effective values
    const stats = Object.entries(gameState.stats || {})
      .map(([key, value]) => {
        const effective = getEffectiveStat(key);
        const label = statLabels[key] || key;
        return effective !== value
          ? `${label}: ${value} (Effective: ${effective})`
          : `${label}: ${value}`;
      })
      .join('\n');

    // Format conditions
    const conditions = (gameState.conditions && gameState.conditions.length > 0)
      ? gameState.conditions.map(c => `• ${c.name}${c.duration ? ` (${c.duration} turns remaining)` : ''}`).join('\n')
      : 'None';

    // Format career info
    const career = `Battles: ${gameState.career?.battles || 0}\nWounds: ${gameState.career?.wounds || 0}\nPromotions: ${gameState.career?.promotions || 0}`;

    // Format equipment (simplified for now)
    let equipment = 'None equipped';
    try {
      // Get inventory count
      const inventoryCount = gameState.inventory ? gameState.inventory.length : 0;

      // Basic equipment display - can be enhanced later
      equipment = `Inventory Items: ${inventoryCount}`;
    } catch (e) {
      console.warn('Error formatting equipment:', e);
      equipment = 'Error loading equipment';
    }

    // Create modal HTML
    const modalHTML = `
      <div class="stats-modal-overlay" style="
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
      ">
        <div class="stats-modal-content" style="
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
            <p>Name: ${escapeHTML(gameState.characterName || 'Unnamed')}</p>
            <p>Age: ${gameState.age || 18}</p>
            <p>Year: ${gameState.year || 1337}</p>
            <p>Location: ${gameState.location || 'England'}</p>
            <p>Region: ${gameState.region || 'England'}</p>
            <p>Rank: ${gameState.rank || 'Common Soldier'}</p>
            <p>Background: ${gameState.background ? gameState.background.charAt(0).toUpperCase() + gameState.background.slice(1) : 'None'}</p>

            <h3 style="color: #f4d03f; margin-top: 15px;">Equipment:</h3>
            <pre style="color: #d4af37; white-space: pre-wrap; font-family: inherit; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;">${equipment}</pre>

            <h3 style="color: #f4d03f; margin-top: 15px;">Conditions:</h3>
            <pre style="color: #d4af37; white-space: pre-wrap; font-family: inherit; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;">${conditions}</pre>

            <h3 style="color: #f4d03f; margin-top: 15px;">Career:</h3>
            <pre style="color: #d4af37; white-space: pre-wrap; font-family: inherit; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;">${career}</pre>
          </div>
          <button class="stats-modal-close" style="
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
      </div>
    `;

    // Create modal element
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    const modal = modalContainer.firstElementChild;

    // Add to document
    document.body.appendChild(modal);

    // Add close functionality
    const closeButton = modal.querySelector('.stats-modal-close');
    const closeModal = () => {
      modal.remove();
      document.removeEventListener('keydown', keyHandler);
    };

    closeButton.addEventListener('click', closeModal);

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Close on Escape key
    const keyHandler = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', keyHandler);

    // Dispatch event
    dispatcher.dispatch(EVENT_TYPES.STATS_DISPLAYED, {
      timestamp: new Date().toISOString(),
      characterName: gameState.characterName
    });

    console.log('Stats display opened');
    return true;

  } catch (error) {
    console.error('Error in showStats:', error);

    // Report error
    const errorHandler = getErrorHandler();
    if (errorHandler) {
      errorHandler.reportError(error, {
        source: 'ui',
        operation: 'showStats'
      });
    }

    // Fallback: console log basic stats
    console.log('Character Stats (fallback):', gameState.stats);

    return false;
  }
}
