/**
 * UI Glue Functions for Vite Build
 * Provides backward compatibility functions for the game interface
 */

/**
 * Update all display elements
 */
export function updateDisplay() {
    // Isolate each renderer so one failure doesn't block others
    try {
        updateStory();
    } catch (e) {
        console.error('updateStory failed:', e);
    }
    try {
        updateStats();
    } catch (e) {
        console.error('updateStats failed:', e);
    }
    try {
        updateChoices();
    } catch (e) {
        console.error('updateChoices failed:', e);
    }
    try {
        updateStatusBar();
    } catch (e) {
        console.error('updateStatusBar failed:', e);
    }

    // Hide controls footer on character creation screen
    const controls = document.querySelector('.controls');
    if (controls) {
        if (window.gameState?.currentScene === 'character_creation') {
            controls.style.display = 'none';
        } else {
            controls.style.display = 'flex';
        }
    }
}

/**
 * Show a notification to the user
 */
export function showNotification(message, type = 'info', duration = 3000) {
    const notificationEl = document.getElementById('notification');
    if (!notificationEl) {
        console.warn('Notification element not found');
        return;
    }

    // Clear existing timeout
    if (notificationEl._timeoutId) {
        clearTimeout(notificationEl._timeoutId);
    }

    // Set message and type
    notificationEl.textContent = message;
    notificationEl.className = `notification ${type}`;

    // Show notification
    notificationEl.classList.remove('hidden');

    // Auto-hide after duration
    notificationEl._timeoutId = setTimeout(() => {
        notificationEl.classList.add('hidden');
    }, duration);
}

/**
 * Reset the game state and re-render the UI
 */
export function resetGame() {
    try {
        // Reinitialize game state
        const defaultState = window.makeDefaultGameState();
        Object.assign(window.gameState, defaultState);

        // Clear entered scenes for fresh start
        window.gameState.enteredScenes = new Set();

        // Re-render the display
        updateDisplay();

        // Show confirmation
        showNotification('Game reset successfully', 'success');

        console.log('Game reset complete');
    } catch (error) {
        console.error('Failed to reset game:', error);
        showNotification('Failed to reset game', 'error');
    }
}

/**
 * Update the story display area
 */
function updateStory() {
    console.log("=== UPDATE STORY START ===");

    // Wait for Ink initialization if available
    if (window.inkReady && window.inkStory) {
        window.inkReady.then(() => {
            renderStoryContent();
        }).catch(error => {
            console.error("Ink initialization failed:", error);
            renderLegacyContent();
        });
    } else {
        renderStoryContent();
    }
}

/**
 * Update the stats panel
 */
function updateStats() {
    const statsEl = document.getElementById('stats');
    if (!statsEl || !window.gameState) return;

    const stats = window.gameState.stats;
    if (!stats) return;

    statsEl.innerHTML = `
        <div class="stat-item">
            <div class="stat-name">Strength</div>
            <div class="stat-value">${stats.strength || 0}</div>
        </div>
        <div class="stat-item">
            <div class="stat-name">Agility</div>
            <div class="stat-value">${stats.agility || 0}</div>
        </div>
        <div class="stat-item">
            <div class="stat-name">Endurance</div>
            <div class="stat-value">${stats.endurance || 0}</div>
        </div>
        <div class="stat-item">
            <div class="stat-name">Stealth</div>
            <div class="stat-value">${stats.stealth || 0}</div>
        </div>
        <div class="stat-item">
            <div class="stat-name">Morale</div>
            <div class="stat-value">${stats.morale || 0}</div>
        </div>
    `;
}

/**
 * Update the choices display
 */
function updateChoices() {
    // Placeholder - will be implemented when Ink integration is complete
    const choicesEl = document.getElementById('choices-container');
    if (choicesEl) {
        choicesEl.innerHTML = '<p>Choices will appear here...</p>';
    }
}

/**
 * Update the status bar
 */
function updateStatusBar() {
    if (!window.gameState) return;

    const yearEl = document.getElementById('year');
    const ageEl = document.getElementById('age');
    const locationEl = document.getElementById('location');

    if (yearEl) yearEl.textContent = window.gameState.year || 1337;
    if (ageEl) ageEl.textContent = window.gameState.age || 18;
    if (locationEl) locationEl.textContent = window.gameState.location || 'England';
}

/**
 * Render story content (placeholder)
 */
function renderStoryContent() {
    const storyEl = document.getElementById('story');
    if (storyEl) {
        storyEl.innerHTML = '<p>Story content will appear here...</p>';
    }
}

/**
 * Render legacy content (fallback)
 */
function renderLegacyContent() {
    const storyEl = document.getElementById('story');
    if (storyEl) {
        storyEl.innerHTML = '<p>Legacy content fallback...</p>';
    }
}
