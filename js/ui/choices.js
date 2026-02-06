(function() {
    'use strict';

    // Stubs for dependencies that will be available in Phase 7
    function validatePrioritiesCompleteAndUnique() {
        if (typeof window.validatePrioritiesCompleteAndUnique === 'function') {
            return window.validatePrioritiesCompleteAndUnique();
        }
        return { ok: true, message: '' };
    }
    function resetGame() {
        if (typeof window.resetGame === 'function') {
            window.resetGame();
        }
    }
    function triggerCombat(enemy, winScene, loseScene) {
        if (typeof window.triggerCombat === 'function') {
            return window.triggerCombat(enemy, winScene, loseScene);
        }
        return Promise.resolve();
    }
    function maybeInsertSkirmish(nextScene) {
        if (typeof window.maybeInsertSkirmish === 'function') {
            return window.maybeInsertSkirmish(nextScene);
        }
        return nextScene;
    }
    function tickRandomEncounterCooldown(scene) {
        if (typeof window.tickRandomEncounterCooldown === 'function') {
            window.tickRandomEncounterCooldown(scene);
        }
    }
    function maybeInsertRandomEncounter(currentScene, nextScene) {
        if (typeof window.maybeInsertRandomEncounter === 'function') {
            return window.maybeInsertRandomEncounter(currentScene, nextScene);
        }
        return nextScene;
    }

function updateChoices() {
    const scene = window.scenes[window.gameState.currentScene];
    if (!scene) return;
    
    const choicesContainer = document.getElementById('choices-container');
    
    // Handle both function and array choices
    let choices = scene.choices;
    if (typeof choices === 'function') {
        try {
            choices = choices();
        } catch (error) {
            console.error('Error getting choices from function:', error);
            choices = [];
        }
    }
    
    if (!Array.isArray(choices) || choices.length === 0) {
        choicesContainer.innerHTML = '<p style="color: #888; font-style: italic;">No choices available.</p>';
        return;
    }
    
    // Build indexed pairs, then filter out custom-hidden choices
    const indexedChoices = choices.map((choice, idx) => ({ choice, originalIndex: idx }))
        .filter(({ choice }) => {
            if (choice.requires && choice.requires.custom && typeof choice.requires.custom === 'function') {
                return choice.requires.custom();
            }
            return true;
        });
    
    choicesContainer.innerHTML = indexedChoices.map(({ choice, originalIndex: index }) => {
        let effectsText = '';
        if (choice.effects) {
            effectsText = Object.entries(choice.effects)
                .map(([key, value]) => {
                    const sign = value > 0 ? '+' : '';
                    // Highlight morale changes with special styling
                    if (key === 'morale') {
                        return `<span style="color: #4a9; font-weight: bold;">${sign}${value} ${key} (social choice)</span>`;
                    }
                    return `${sign}${value} ${key}`;
                })
                .join(', ');
        }
        
        // Consequence tags
        let consequenceTags = '';
        if (choice.consequences) {
            const tags = [];
            
            if (choice.consequences.risk) {
                const riskColors = { 
                    low: { bg: '#4CAF50', text: 'SAFE' }, 
                    medium: { bg: '#FF9800', text: 'MODERATE RISK' }, 
                    high: { bg: '#f44336', text: 'HIGH RISK' } 
                };
                const risk = riskColors[choice.consequences.risk] || riskColors.medium;
                tags.push(`<span style="background: ${risk.bg}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.75em; font-weight: bold; margin-left: 5px;">[${risk.text}]</span>`);
            }
            
            if (choice.consequences.reward) {
                tags.push(`<span style="background: #d4af37; color: #1a0f08; padding: 2px 6px; border-radius: 3px; font-size: 0.75em; font-weight: bold; margin-left: 5px;">[${choice.consequences.reward}]</span>`);
            }
            
            if (choice.consequences.statChanges) {
                const statText = Object.entries(choice.consequences.statChanges)
                    .map(([stat, val]) => `${val > 0 ? '+' : ''}${val} ${stat}`)
                    .join(', ');
                tags.push(`<span style="background: #2a2a2a; color: #d4af37; padding: 2px 6px; border-radius: 3px; font-size: 0.75em; margin-left: 5px;">[${statText}]</span>`);
            }
            
            if (tags.length > 0) {
                consequenceTags = `<div style="margin-top: 5px; display: flex; flex-wrap: wrap; gap: 5px; align-items: center;">${tags.join('')}</div>`;
            }
        }
        
        // Check requirements
        let disabled = false;
        let disabledReason = '';
        if (choice.requires) {
            if (choice.requires.stat) {
                const statValue = window.gameState.stats[choice.requires.stat] || 0;
                if (statValue < choice.requires.min) {
                    disabled = true;
                    disabledReason = `Requires ${choice.requires.stat} ≥ ${choice.requires.min}`;
                }
            }
        }
        
        return `
            <button class="choice-button" onclick="makeChoice(${index})" ${disabled ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                <div style="text-align: left;">
                    <div>${choice.text}</div>
                    ${consequenceTags}
                    ${effectsText ? `<span class="choice-effects">${effectsText}</span>` : ''}
                    ${disabledReason ? `<span class="choice-effects" style="color: #8b0000;">${disabledReason}</span>` : ''}
                </div>
            </button>
        `;
    }).join('');
}
function makeChoice(choiceIndex) {
    const scene = window.scenes[window.gameState.currentScene];
    if (!scene) return;
    
    // Handle both function and array choices
    let choices = scene.choices;
    if (typeof choices === 'function') {
        try {
            choices = choices();
        } catch (error) {
            console.error('Error getting choices from function:', error);
            window.showNotification('Error', 'Failed to get choices. Please refresh the page.');
            return;
        }
    }
    
    if (!Array.isArray(choices) || !choices[choiceIndex]) {
        console.error('Invalid choice index or choices not an array:', choiceIndex, choices);
        return;
    }
    
    const choice = choices[choiceIndex];
    
    // Handle character creation validation
    if (window.gameState.currentScene === 'character_creation') {
        if (choice.requiresOrigin && !window.gameState.origin) {
            window.showNotification('Character Creation', 'Please select an origin before continuing.');
            return;
        }
        if (choice.requiresPatron && !window.gameState.patronId && !window.gameState.patron) {
            window.showNotification('Character Creation', 'Please select a patron before continuing.');
            return;
        }
        const nameInput = document.getElementById('character-name-input');
        if (nameInput) {
            const trimmedName = nameInput.value.trim();
            // Sanitize user input to prevent XSS
            window.gameState.characterName = window.escapeHTML(trimmedName) || "William Thatcher";
        }
        if (!window.gameState.characterName || window.gameState.characterName === '') {
            window.gameState.characterName = "William Thatcher";
        }
        
        // Validate priorities
        const priorityValidation = window.validatePrioritiesCompleteAndUnique();
        if (!priorityValidation.ok) {
            window.showNotification('Character Creation', priorityValidation.message);
            return;
        }
        // Validate region is selected
        if (!window.gameState.culture || window.gameState.culture === '') {
            window.showNotification('Character Creation', 'Please select your region.');
            return;
        }
        if (!window.gameState.ageRange) {
            window.showNotification('Character Creation', 'Please select your age range.');
            return;
        }
    }
    
    // Handle reset as direct action
    if (choice.nextScene === 'reset') {
        if (confirm('Are you sure you want to start a new game? All progress will be lost.')) {
            window.resetGame();
        }
        return;
    }
    
    // Handle combat type choices
    if (choice.type === 'combat') {
        window.triggerCombat(choice.enemy, choice.winScene, choice.loseScene).catch(error => {
            console.error('Combat error:', error);
            // Fallback to normal scene transition on error
            window.gameState.currentScene = choice.winScene;
            window.updateDisplay();
        });
        return; // Exit early, combat will handle scene transition
    }
    
    // Apply stress cost for smart actions (BEFORE bad outcome check)
    if (choice.stressCost && choice.stressCost > 0) {
        window.applyStatChange('stress', choice.stressCost);
    }
    
    // Check for bad outcomes (if choice has bad outcome chance)
    let badOutcomeTriggered = false;
    let badOutcomeScene = null;
    if (choice.badOutcomeChance && choice.badOutcomes && choice.badOutcomes.length > 0) {
        const badChance = window.calculateBadOutcomeChance(
            choice.badOutcomeChance,
            choice.badOutcomeStupidity || 'neutral',
            window.gameState.stats.luck,
            window.gameState.equipment
        );
        
        const roll = Math.random() * 100;
        if (roll < badChance) {
            const outcome = window.selectBadOutcome(choice.badOutcomes, badChance);
            if (outcome) {
                window.applyBadOutcome(outcome);
                badOutcomeTriggered = true;
                badOutcomeScene = outcome.nextScene;
            }
        }
    }
    
    // Handle resolution system
    if (choice.requiresResolution) {
        const result = window.resolveAction(
            choice.resolutionStat,
            choice.resolutionDifficulty,
            choice.resolutionBonus || 0
        );
        window.gameState.lastResolution = result;
        
        // Only apply generic consequences if explicitly requested
        // Most scenes handle their own consequences in onEnter
        if (choice.applyGenericResolution) {
            if (!result.success) {
                // Failure consequences - worse if margin is large
                const woundSeverity = result.margin <= -3 ? 'Seriously Wounded' : 'Wounded';
                if (choice.resolutionStat === 'strength' || choice.resolutionStat === 'endurance') {
                    window.addCondition(woundSeverity, 'negative', woundSeverity === 'Seriously Wounded' ? 3 : 2);
                    window.applyStatChange('endurance', woundSeverity === 'Seriously Wounded' ? -2 : -1);
                    window.gameState.career.wounds++;
                }
                window.addCondition('Fatigued', 'negative', 1);
                window.applyStatChange('morale', -1);
                window.applyStatChange('stress', 1);
            } else {
                // Success bonuses
                window.applyStatChange('experience', 10);
                window.applyStatChange('reputation', 1);
                window.applyStatChange('morale', 1);
                // NOTE: Success no longer automatically reduces stress
                // Stress reduction should be explicit in choice effects
                window.gameState.career.battles++;
                // Small chance of patron favor on great success
                if (result.margin >= 3) {
                    window.applyStatChange('patronFavor', 1);
                }
            }
        }
    }
    
    // Call onChoose callback if present (for kit granting, etc.)
    if (choice.onChoose && typeof choice.onChoose === 'function') {
        const onChooseResult = choice.onChoose();
        // If onChoose returns false, validation failed - don't proceed
        if (onChooseResult === false) {
            return;
        }
    }
    
    // Apply effects with clamping (supports both object and function effects)
    if (choice.effects) {
        if (typeof choice.effects === 'function') {
            // Function-based effects (used by campfire vignettes)
            try {
                    choice.effects(window.gameState);
                // Notification is handled inside the function for campfire scenes
            } catch (error) {
                console.error('Error applying function effects:', error);
            }
        } else if (typeof choice.effects === 'object') {
            // Object-based effects (standard format)
            const effects = [];
            Object.entries(choice.effects).forEach(([key, value]) => {
                const actualChange = window.applyStatChange(key, value);
                if (actualChange !== 0) {
                    effects.push(`${actualChange > 0 ? '+' : ''}${actualChange} ${key}`);
                }
            });
            
            if (effects.length > 0) {
                window.showNotification('Stat Changes', effects.join(', '));
            }
        }
    }
    
    // Track scene visited (before moving) - limit to last 100 to prevent unbounded growth
    window.gameState.scenesVisited.push(window.gameState.currentScene);
    if (window.gameState.scenesVisited.length > 100) {
        window.gameState.scenesVisited = window.gameState.scenesVisited.slice(-100);
    }
    
    // Move to next scene - bad outcome scene takes priority
    let nextSceneName;
    if (badOutcomeTriggered && badOutcomeScene) {
        // Bad outcome scene overrides normal next scene
        nextSceneName = badOutcomeScene;
    } else if (typeof choice.nextScene === 'function') {
        try {
            const result = choice.nextScene();
            // Handle async nextScene functions
            if (result && typeof result.then === 'function') {
                result.then((sceneName) => {
                    if (sceneName && typeof sceneName === 'string') {
                        window.gameState.currentScene = sceneName;
                        window.updateDisplay();
                    }
                }).catch((error) => {
                    console.error("Error executing async nextScene function:", error);
                    window.showNotification('Error', 'Failed to determine next scene. Please refresh the page.');
                });
                return; // Exit early, async will update display
            }
            nextSceneName = result;
            console.log("nextScene function returned:", nextSceneName);
            console.log("window.gameState.background:", window.gameState.background);
        } catch (error) {
            console.error("Error executing nextScene function:", error);
            console.error("Error stack:", error.stack);
            window.showNotification('Error', 'Failed to determine next scene. Please refresh the page.');
            return;
        }
    } else {
        nextSceneName = choice.nextScene;
    }
    
    // Validate that the next scene exists
    if (!nextSceneName || typeof nextSceneName !== 'string') {
        console.error("Invalid nextScene value:", nextSceneName);
        console.error("Type:", typeof nextSceneName);
        console.error("Choice:", choice);
        window.showNotification('Error', 'Invalid scene transition. Please refresh the page.');
        return;
    }
    
    if (!window.scenes[nextSceneName]) {
        console.warn("[FALLBACK] Scene not found:", nextSceneName, "— using arc-aware fallback");
        // Route to the best available scene based on current chapter/year
        const fallbackMap = {
            'chevauchée': 'march_through_normandy_1',
            'calais': 'calais_siege',
            'plague': 'start',
            'poitiers': 'start'
        };
        const fallback = fallbackMap[window.gameState.chapter] || 'march_through_normandy_1';
        if (window.scenes[fallback]) {
            nextSceneName = fallback;
            window.showNotification('Narrative', 'The road continues...', 'info');
        } else {
            // Last resort
            window.gameState.currentScene = 'character_creation';
            window.showNotification('Error', 'Scene not found. Resetting.');
            window.updateDisplay();
            return;
        }
    }
    
    // Scene insertion pipeline (skirmish → campfire → random encounter)
    // NOTE: skirmish_roadside_resolve has its own carefully controlled exit flow
    // (Option 1: resolve → maybe interludes → travel). Do NOT run the global insertion
    // pipeline again here or you'll double-insert and can bounce back into skirmish.
    let finalNextScene = nextSceneName;
    if (window.gameState.currentScene !== 'skirmish_roadside_resolve') {
        // QA: Log when global insertion pipeline runs
        if (window.gameState.debug && window.gameState.debug.enabled) {
            console.log('[QA] Running global insertion pipeline from:', window.gameState.currentScene, '→', nextSceneName);
        }
        
        // Mutual exclusion: only one insertion per transition
        const afterSkirmish = window.maybeInsertSkirmish(nextSceneName);
        if (afterSkirmish !== nextSceneName) {
            // Skirmish was inserted — skip campfire and random encounter
            finalNextScene = afterSkirmish;
        } else {
            const afterCampfire = window.maybeInsertCampfire(nextSceneName);
            if (afterCampfire !== nextSceneName) {
                // Campfire was inserted — skip random encounter
                finalNextScene = afterCampfire;
            } else {
                // No skirmish or campfire — try random encounter
                window.tickRandomEncounterCooldown(window.gameState.currentScene);
                finalNextScene = window.maybeInsertRandomEncounter(window.gameState.currentScene, nextSceneName);
            }
        }
    } else {
        // QA: Log when global insertion pipeline is skipped
        if (window.gameState.debug && window.gameState.debug.enabled) {
            console.log('[QA] SKIPPED global insertion pipeline (exiting skirmish_roadside_resolve)');
        }
    }
    
    window.gameState.currentScene = finalNextScene;
    
    // Check for arbitrary death events ONLY on entering travel scenes
    if (window.shouldCheckArbitraryDeathOnEnter(finalNextScene)) {
        const deathEvent = window.checkArbitraryDeath();
        if (deathEvent) {
            // Check if player can spend to avoid death (if avoidScene and avoidCost are defined)
            if (deathEvent.avoidScene && deathEvent.avoidCost !== undefined) {
                const wealth = window.gameState.stats.wealth || 0;
                if (wealth >= deathEvent.avoidCost) {
                    // Player can afford to avoid death - go to avoidance scene
                    window.gameState.currentScene = deathEvent.avoidScene;
                } else {
                    // Player cannot afford - go to death scene
                    window.gameState.currentScene = deathEvent.nextScene;
                }
            } else {
                // No avoidance option - go straight to death
                window.gameState.currentScene = deathEvent.nextScene;
            }
            // Remove fade-in class and re-add for animation
            document.getElementById('story').classList.remove('fade-in');
            setTimeout(() => {
                window.updateDisplay();
            }, 100);
            return;
        }
    }
    
    // Check for stress cap psychological disorders
    window.checkStressCapDisorders();
    
    // Check for chapter transitions
    window.checkChapterTransition();
    
    // Remove fade-in class and re-add for animation
    document.getElementById('story').classList.remove('fade-in');
    setTimeout(() => {
        window.updateDisplay();
    }, 100);
}

    // Expose globally
    window.updateChoices = updateChoices;
    window.makeChoice = makeChoice;
})();
