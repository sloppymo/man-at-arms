(function() {
    'use strict';

    // Stubs for dependencies (will be available globally from other modules)
    function getConditionEffects() {
        if (typeof window.getConditionEffects === 'function') {
            return window.getConditionEffects();
        }
        return {};
    }
    function getEffectiveStat(stat) {
        if (typeof window.getEffectiveStat === 'function') {
            return window.getEffectiveStat(stat);
        }
        return window.gameState.stats[stat] || 0;
    }
    function formatCurrency(pence) {
        if (typeof window.formatCurrency === 'function') {
            return window.formatCurrency(pence);
        }
        return pence + 'd';
    }
    function showNotification(title, message, type) {
        if (typeof window.showNotification === 'function') {
            window.showNotification(title, message, type);
        }
    }
    function showLevelUpMenu() {
        if (typeof window.showLevelUpMenu === 'function') {
            window.showLevelUpMenu();
        }
    }

    // Calculate level based on experience
    // Level formula: Level = floor(sqrt(experience / 10)) + 1
    function calculateLevel() {
        const xp = window.gameState.stats.experience || 0;
        return Math.floor(Math.sqrt(xp / 10)) + 1;
    }

    // Calculate experience needed for next level
    function getExperienceForNextLevel() {
        const currentLevel = window.gameState.level || 1;
        const nextLevel = currentLevel + 1;
        // Reverse the formula: XP = (level - 1)^2 * 10
        return Math.pow(nextLevel - 1, 2) * 10;
    }

    // Check for level up and grant bonuses
    function checkLevelUp() {
        const newLevel = calculateLevel();
        const oldLevel = window.gameState.level || 1;
        
        if (newLevel > oldLevel) {
            const levelsGained = newLevel - oldLevel;
            window.gameState.level = newLevel;
            
            // Grant stat points for each level gained
            // Level 2-5: 1 point per level
            // Level 6-10: 2 points per level
            // Level 11+: 3 points per level
            let pointsGained = 0;
            for (let i = oldLevel + 1; i <= newLevel; i++) {
                if (i <= 5) {
                    pointsGained += 1;
                } else if (i <= 10) {
                    pointsGained += 2;
                } else {
                    pointsGained += 3;
                }
            }
            
            window.gameState.levelUpPoints = (window.gameState.levelUpPoints || 0) + pointsGained;
            
            // Show level up notification
            const levelText = levelsGained > 1 ? `Level ${oldLevel} → Level ${newLevel}` : `Level ${newLevel}`;
            showNotification(
                `🎉 Level Up!`,
                `You have reached ${levelText}! You have gained ${pointsGained} stat point${pointsGained > 1 ? 's' : ''} to distribute. Visit your stats panel to allocate them.`
            );
            
            // Update stats display to show new level and available points
            updateStats();
        }
    }

    // Calculate rank based on experience (kept for compatibility)
    function calculateRank() {
        const xp = window.gameState.stats.experience || 0;
        if (xp >= 500) return "Knight";
        if (xp >= 301) return "Sergeant";
        if (xp >= 151) return "Veteran";
        if (xp >= 51) return "Common Soldier";
        return "Raw Recruit";
    }

    // Update stats display
    function updateStats() {
        const statsContainer = document.getElementById('stats');
        
        // Hide stats panel on character creation screen
        if (window.gameState.currentScene === 'character_creation') {
            if (statsContainer) {
                statsContainer.style.display = 'none';
            }
            return; // Exit early, don't update anything
        } else {
            if (statsContainer) {
                statsContainer.style.display = 'block'; // Show it for other scenes
            }
        }
        
        const stats = window.gameState.stats;
        
        // Apply condition effects for display
        const conditionEffects = getConditionEffects();
        
        // Initialize level if not set
        if (!window.gameState.level) {
            window.gameState.level = calculateLevel();
        }
        
        // Check for level up
        checkLevelUp();
        
        const level = window.gameState.level || 1;
        const levelUpPoints = window.gameState.levelUpPoints || 0;
        const xp = window.gameState.stats.experience || 0;
        const xpForNext = getExperienceForNextLevel();
        const xpForCurrent = Math.pow(level - 1, 2) * 10; // XP needed for current level
        const xpNeeded = xpForNext - xpForCurrent; // XP needed to go from current to next
        const xpProgress = xpNeeded > 0 ? Math.max(0, Math.min(100, ((xp - xpForCurrent) / xpNeeded) * 100)) : 100;
        
        const statItems = [
            { key: 'strength', label: '⚔️ Strength', max: 10 },
            { key: 'agility', label: '🏃 Agility', max: 10 },
            { key: 'endurance', label: '❤️ Endurance', max: 10 },
            { key: 'charisma', label: '💬 Charisma', max: 10 },
            { key: 'luck', label: '🍀 Luck', max: 10 },
            { key: 'wits', label: '🧠 Wits', max: 10 },
            { key: 'morale', label: '💪 Morale', max: 10, tooltip: 'Affected by social choices and relationships' },
            { key: 'stress', label: '😰 Stress', max: 10 },
            { key: 'wealth', label: '💰 Wealth', max: 24000, isSpecial: true }, // Max 100 pounds (24000 pence)
            { key: 'reputation', label: '⭐ Reputation', max: 50, isSpecial: true },
            { key: 'experience', label: '⭐ Experience', max: 1000, isSpecial: true },
            { key: 'patronFavor', label: '👑 Patron Favor', max: 20, isSpecial: true }
        ];
        
        // Add level display at the top
        let levelDisplay = `
            <div class="stat-item" style="border-bottom: 2px solid #d4af37; padding-bottom: 10px; margin-bottom: 10px;">
                <div class="stat-label" style="font-size: 1.2em; font-weight: bold;">⚔️ Level ${level}</div>
                <div style="margin-top: 5px; font-size: 0.9em; color: #d4af37;">
                    ${xp}/${xpForNext} XP to next level
                    <div class="stat-bar" style="margin-top: 5px;">
                        <div class="stat-fill" style="width: ${Math.max(0, Math.min(100, xpProgress))}%"></div>
                    </div>
                </div>
        `;
        
        if (levelUpPoints > 0) {
            levelDisplay += `
                <div style="margin-top: 8px; padding: 8px; background: rgba(212, 175, 55, 0.2); border: 1px solid #d4af37; border-radius: 5px;">
                    <strong style="color: #f4d03f;">${levelUpPoints} unspent stat point${levelUpPoints > 1 ? 's' : ''}!</strong>
                    <button onclick="showLevelUpMenu()" style="margin-top: 5px; padding: 5px 10px; background: #d4af37; color: #1a0f08; border: none; border-radius: 3px; cursor: pointer; font-weight: bold;">Spend Points</button>
                </div>
            `;
        }
        
        levelDisplay += `</div>`;
        
        if (statsContainer) {
            statsContainer.innerHTML = levelDisplay + statItems.map(stat => {
                let value = stats[stat.key] || 0;
                // Apply condition effects (but not equipment - that's situational)
                if (conditionEffects[stat.key]) {
                    value += conditionEffects[stat.key];
                }
                value = Math.max(0, Math.min(stat.max, value));
                const percentage = (value / stat.max) * 100;
                
                if (stat.isSpecial) {
                    return `
                        <div class="stat-item">
                            <div class="stat-label">${stat.label}</div>
                            <div class="stat-special">${stat.key === 'wealth' ? formatCurrency(value) : stat.key === 'experience' ? value + ' XP' : value + ' points'}</div>
                        </div>
                    `;
                }
                
                // Show effective stat if different from base
                const effectiveValue = getEffectiveStat(stat.key);
                const effectiveDisplay = effectiveValue !== value ? ` (Effective: ${effectiveValue})` : '';
                
                const tooltip = stat.tooltip ? `<span title="${stat.tooltip}" style="cursor: help; margin-left: 5px; color: #d4af37; font-size: 0.8em;">ℹ️</span>` : '';
                return `
                    <div class="stat-item">
                        <div class="stat-label">${stat.label}${tooltip}${effectiveDisplay}</div>
                        <div class="stat-bar">
                            <div class="stat-fill" style="width: ${percentage}%"></div>
                            <div class="stat-value">${value}/${stat.max}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // Add relationship display after stats
        updateRelationshipDisplay();
    }

    // Update relationship display
    function updateRelationshipDisplay() {
        if (window.gameState.currentScene === 'character_creation') return;

        const host = document.getElementById('sidebar') || document.getElementById('stats');
        if (!host) return;

        let relContainer = document.getElementById('relationships-container');
        if (!relContainer) {
            relContainer = document.createElement('div');
            relContainer.id = 'relationships-container';
            host.appendChild(relContainer);
        } else if (relContainer.parentElement !== host) {
            host.appendChild(relContainer);
        }

        const rels = window.gameState.relationships || { wat: 0, cook: 0, oana: 0 };
        const npcNames = { wat: "Wat", cook: "Cook", oana: "Oana" };

        const knownKeys = ['wat', 'cook', 'oana'];
        const otherKeys = Object.keys(rels).filter(k => !knownKeys.includes(k)).sort();
        const orderedKeys = [...knownKeys.filter(k => k in rels), ...otherKeys];

        relContainer.innerHTML = orderedKeys.map((key) => {
            const value = rels[key] || 0;
            const clamped = Math.max(-5, Math.min(5, value));
            const pct = ((clamped + 5) / 10) * 100;
            const name = npcNames[key] || key.charAt(0).toUpperCase() + key.slice(1);

            return `
                <div class="relationship-item">
                    <div class="relationship-name">
                        <span>${name}</span>
                        <span class="relationship-value">${clamped > 0 ? '+' : ''}${clamped}</span>
                    </div>
                    <div class="relationship-bar">
                        <div class="relationship-fill" style="width: ${pct}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Update status bar
    function updateStatusBar() {
        const statusBar = document.getElementById('status-bar');
        if (!statusBar) return;

        if (window.gameState.currentScene === 'character_creation') {
            statusBar.style.display = 'none';
            return;
        } else {
            statusBar.style.display = '';
        }

        const yearEl = document.getElementById('year');
        if (yearEl) yearEl.textContent = window.gameState.year || 1337;

        const ageEl = document.getElementById('age');
        if (ageEl) {
            const ageValue = typeof window.gameState.age === 'function' ? window.gameState.age() : (window.gameState.age || 18);
            ageEl.textContent = ageValue;
        }

        const locationEl = document.getElementById('location');
        if (locationEl) locationEl.textContent = window.gameState.location || 'Unknown';

        // Rank display (top)
        let rankElement = document.getElementById('status-rank');
        if (!rankElement) {
            rankElement = document.createElement('div');
            rankElement.id = 'status-rank';
            rankElement.className = 'status-item';
            statusBar.insertBefore(rankElement, statusBar.firstChild);
        }
        const rank = window.gameState.rank || 'Common Soldier';
        rankElement.innerHTML = `<span>🎖️</span><span>Rank: <strong>${rank}</strong></span>`;

        // Conditions display (bottom)
        let conditionsElement = document.getElementById('status-conditions');
        if (!conditionsElement) {
            conditionsElement = document.createElement('div');
            conditionsElement.id = 'status-conditions';
            conditionsElement.className = 'status-item';
            conditionsElement.style.cssText = 'display: flex; gap: 6px; flex-wrap: wrap; align-items: center;';
            statusBar.appendChild(conditionsElement);
        }

        if (Array.isArray(window.gameState.conditions) && window.gameState.conditions.length > 0) {
            const colors = {
                'Wounded': '#8b0000',
                'Seriously Wounded': '#ff0000',
                'Fatigued': '#8b6914',
                'Shaken': '#8b4513',
                'Diseased': '#654321',
                'Exhausted': '#4a4a4a'
            };

            conditionsElement.innerHTML =
                '<span style="color: #d4af37; font-weight: bold;">Status:</span>' +
                window.gameState.conditions.map(c => {
                    const name = (typeof c === 'string') ? c : (c && c.name ? c.name : String(c));
                    return `<span style="color: ${colors[name] || '#d4af37'};">${name}</span>`;
                }).join(' ');
        } else {
            conditionsElement.innerHTML = '';
        }
    }

    // Expose globally
    window.calculateLevel = calculateLevel;
    window.getExperienceForNextLevel = getExperienceForNextLevel;
    window.checkLevelUp = checkLevelUp;
    window.calculateRank = calculateRank;
    window.updateStats = updateStats;
    window.updateRelationshipDisplay = updateRelationshipDisplay;
    window.updateStatusBar = updateStatusBar;
})();
