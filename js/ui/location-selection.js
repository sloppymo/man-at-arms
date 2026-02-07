// ============================================
// Location Selection Functions
// ============================================

/**
 * Show tooltip for a region on the location select map
 * @param {string} regionName - Name of the region
 */
function showRegionTooltip(regionName) {
    // Create or update tooltip
    let tooltip = document.getElementById('region-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'region-tooltip';
        tooltip.className = 'tooltip';
        document.body.appendChild(tooltip);
    }

    // Get region info
    const regionInfo = getRegionInfo(regionName);
    if (regionInfo) {
        tooltip.innerHTML = `
            <h4>${regionInfo.name}</h4>
            <p>${regionInfo.description}</p>
            <div class="region-stats">
                <span class="stat">Difficulty: ${regionInfo.difficulty}</span>
                <span class="stat">Culture: ${regionInfo.culture}</span>
            </div>
        `;
        tooltip.style.display = 'block';
    }
}

/**
 * Hide the region tooltip
 */
function hideRegionTooltip() {
    const tooltip = document.getElementById('region-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

/**
 * Select a culture/region for the character
 * @param {string} cultureId - ID of the selected culture
 */
function selectCulture(cultureId) {
    console.log('Selected culture:', cultureId);

    // Update game state
    window.gameState.culture = cultureId;

    // Update UI to show selection
    const buttons = document.querySelectorAll('.culture-button');
    buttons.forEach(button => {
        button.classList.remove('selected');
    });

    const selectedButton = document.querySelector(`[data-culture="${cultureId}"]`);
    if (selectedButton) {
        selectedButton.classList.add('selected');
    }

    // Enable continue button if culture is selected
    const continueBtn = document.getElementById('culture-continue');
    if (continueBtn) {
        continueBtn.disabled = false;
        continueBtn.style.opacity = '1';
    }

    // Update character name based on culture
    updateCharacterNameForCulture(cultureId);
}

/**
 * Get information about a region
 * @param {string} regionName - Name of the region
 * @returns {object} Region information
 */
function getRegionInfo(regionName) {
    const regions = {
        'england': {
            name: 'England',
            description: 'The heart of the English kingdom. Familiar territory with established nobility and military tradition.',
            difficulty: 'Normal',
            culture: 'English'
        },
        'normandy': {
            name: 'Normandy',
            description: 'Recently conquered territory. The French population is hostile but the land is rich.',
            difficulty: 'Hard',
            culture: 'Norman French'
        },
        'flanders': {
            name: 'Flanders',
            description: 'Wealthy trading cities with powerful merchant guilds. Opportunity for advancement through commerce.',
            difficulty: 'Easy',
            culture: 'Flemish'
        },
        'aquitaine': {
            name: 'Aquitaine',
            description: 'Southern French territory with wine, culture, and complex politics.',
            difficulty: 'Normal',
            culture: 'Occitan'
        }
    };

    return regions[regionName.toLowerCase()] || {
        name: regionName,
        description: 'Unknown region',
        difficulty: 'Unknown',
        culture: 'Unknown'
    };
}

/**
 * Update character name suggestions based on selected culture
 * @param {string} cultureId - Selected culture ID
 */
function updateCharacterNameForCulture(cultureId) {
    const nameSuggestions = {
        'english': ['William', 'Thomas', 'John', 'Robert', 'Richard'],
        'french': ['Pierre', 'Jean', 'Philippe', 'Louis', 'Henri'],
        'flemish': ['Jan', 'Pieter', 'Karel', 'Hendrik', 'Willem'],
        'occitan': ['Bernard', 'Raymond', 'Ademar', 'Guillaume', 'Pons']
    };

    const suggestions = nameSuggestions[cultureId] || nameSuggestions['english'];
    const randomName = suggestions[Math.floor(Math.random() * suggestions.length)];

    // Update name input placeholder or suggestion
    const nameInput = document.getElementById('character-name');
    if (nameInput && !nameInput.value) {
        nameInput.placeholder = `e.g. ${randomName}`;
    }
}

// Make functions globally available
window.showRegionTooltip = showRegionTooltip;
window.hideRegionTooltip = hideRegionTooltip;
window.selectCulture = selectCulture;
