// ============================================
// Location Selection Functions
// ============================================

/**
 * Show tooltip for a region on the location select map
 * @param {Event} event - Mouse event
 * @param {string} regionName - Name of the region
 */
function showRegionTooltip(event, regionName) {
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
        tooltip.style.left = (event.pageX + 10) + 'px';
        tooltip.style.top = (event.pageY + 10) + 'px';
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

    // Update region marker button styles
    const regions = ['Lancashire', 'Yorkshire', 'Norfolk', 'Essex', 'London', 'Kent', 'Somerset', 'Cornwall'];
    regions.forEach(region => {
        const button = document.getElementById(`region-marker-${region}`);
        if (button) {
            const isSelected = region === cultureId;
            button.style.border = `4px solid ${isSelected ? '#ffd700' : '#ff6b35'}`;
            button.style.background = isSelected ? 'rgba(255, 215, 0, 0.95)' : 'rgba(255, 107, 53, 0.9)';
            if (region === 'London') {
                button.style.borderWidth = isSelected ? '5px' : '5px'; // London has thicker border
            }
        }
    });

    // Update UI to show selection (legacy code, may not be needed)
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

    // Refresh the display to show selected region flavor text
    window.updateDisplay();
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
        "Yorkshire": ["William", "John", "Thomas", "Richard", "Robert", "Henry", "Geoffrey", "Roger", "Edward", "Hugh", "Simon", "Walter", "Ralph", "Nicholas", "Peter"],
        "Kent": ["William", "John", "Thomas", "Richard", "Robert", "Henry", "Geoffrey", "Roger", "Edward", "Hugh", "Simon", "Walter", "Ralph", "Nicholas", "Peter"],
        "London": ["William", "John", "Thomas", "Richard", "Robert", "Henry", "Geoffrey", "Roger", "Edward", "Hugh", "Simon", "Walter", "Ralph", "Nicholas", "Peter"],
        "Cornwall": ["William", "John", "Thomas", "Richard", "Robert", "Henry", "Geoffrey", "Roger", "Edward", "Hugh", "Simon", "Walter", "Ralph", "Nicholas", "Peter"],
        "Lancashire": ["William", "John", "Thomas", "Richard", "Robert", "Henry", "Geoffrey", "Roger", "Edward", "Hugh", "Simon", "Walter", "Ralph", "Nicholas", "Peter"],
        "Essex": ["William", "John", "Thomas", "Richard", "Robert", "Henry", "Geoffrey", "Roger", "Edward", "Hugh", "Simon", "Walter", "Ralph", "Nicholas", "Peter"],
        "Norfolk": ["William", "John", "Thomas", "Richard", "Robert", "Henry", "Geoffrey", "Roger", "Edward", "Hugh", "Simon", "Walter", "Ralph", "Nicholas", "Peter"],
        "Somerset": ["William", "John", "Thomas", "Richard", "Robert", "Henry", "Geoffrey", "Roger", "Edward", "Hugh", "Simon", "Walter", "Ralph", "Nicholas", "Peter"]
    };

    const suggestions = nameSuggestions[cultureId] || nameSuggestions['Yorkshire'];
    const randomName = suggestions[Math.floor(Math.random() * suggestions.length)];

    // Update name input placeholder or suggestion
    const nameInput = document.getElementById('character-name-input');
    if (nameInput && !nameInput.value) {
        nameInput.placeholder = `e.g. ${randomName}`;
    }
}

// Make functions globally available
window.showRegionTooltip = showRegionTooltip;
window.hideRegionTooltip = hideRegionTooltip;
window.selectCulture = selectCulture;
