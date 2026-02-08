// ============================================
// Man-at-Arms Equipment UI
// ES module implementation for equipment management
// ============================================

import { gameState } from '../core/gameState.js';
import { GameMode, setMode } from '../core/game-modes.js';
import { dispatcher, EVENT_TYPES } from '../core/dispatcher.js';
import { getErrorHandler } from '../core/error-handler.js';

/**
 * Open equipment management interface
 * Sets game mode to EQUIPMENT and shows equipment UI
 */
export function openEquipmentScreen() {
  try {
    // Set game mode to equipment
    const modeChanged = setMode(gameState, GameMode.EQUIPMENT);

    if (!modeChanged) {
      console.warn('Failed to change mode to EQUIPMENT');
      return false;
    }

    // Create equipment modal
    const modalHTML = `
      <div class="equipment-modal-overlay" style="
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
        <div class="equipment-modal-content" style="
          background: #1a0f08;
          border: 3px solid #d4af37;
          border-radius: 10px;
          padding: 30px;
          max-width: 800px;
          max-height: 80vh;
          overflow-y: auto;
          color: #d4af37;
          font-family: 'Crimson Text', serif;
        ">
          <h2 style="color: #f4d03f; margin-bottom: 20px; text-align: center;">⚔️ Equipment Management</h2>

          <div style="display: flex; gap: 20px;">
            <div class="paper-doll" style="flex: 1;">
              <h3 style="color: #f4d03f;">Paper Doll</h3>
              <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 5px; min-height: 300px;">
                <p>Equipment slots will be displayed here.</p>
                <p>Current equipment structure: v2 layered format</p>
              </div>
            </div>

            <div class="inventory" style="flex: 1;">
              <h3 style="color: #f4d03f;">Inventory</h3>
              <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 5px; min-height: 300px;">
                <p>Inventory items: ${gameState.inventory ? gameState.inventory.length : 0}</p>
                <p>Equipment bag: ${gameState.equipment?.bag ? gameState.equipment.bag.length : 0} items</p>
              </div>
            </div>
          </div>

          <div style="margin-top: 20px; text-align: center; color: #888; font-size: 14px;">
            <p>Equipment management system - Phase 2 implementation pending</p>
          </div>

          <button class="equipment-modal-close" style="
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
            Close Equipment
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
    const closeButton = modal.querySelector('.equipment-modal-close');
    const closeModal = () => {
      modal.remove();
      document.removeEventListener('keydown', keyHandler);
      // Return to previous mode (assuming camp for now)
      setMode(gameState, GameMode.CAMP);
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
    dispatcher.dispatch(EVENT_TYPES.OPEN_EQUIPMENT, {
      timestamp: new Date().toISOString(),
      equipmentFormat: 'v2'
    });

    console.log('Equipment screen opened');
    return true;

  } catch (error) {
    console.error('Error in openEquipmentScreen:', error);

    // Report error
    const errorHandler = getErrorHandler();
    if (errorHandler) {
      errorHandler.reportError(error, {
        source: 'ui',
        operation: 'openEquipmentScreen'
      });
    }

    return false;
  }
}
