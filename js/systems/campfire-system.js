(function() {
    'use strict';
    
    // ===== CAMPFIRE SYSTEM FUNCTIONS =====
    
    /** Clamp relationship value to -5..+5 */
    function clampRel(n) {
        return Math.max(-5, Math.min(5, Number(n) || 0));
    }
    
    /** Change relationship with Wat or Cook */
    function changeRel(who, delta) {
        if (!window.gameState.relationships) {
            window.gameState.relationships = { wat: 0, cook: 0, oana: 0 };
        }
        const oldValue = window.gameState.relationships[who] || 0;
        window.gameState.relationships[who] = clampRel(oldValue + delta);
        
        // Immediate feedback - show relationship change
        if (delta !== 0) {
            const npcNames = {
                wat: "Wat",
                cook: "Cook",
                oana: "Oana"
            };
            const npcName = npcNames[who] || who;
            const newValue = window.gameState.relationships[who];
            
            let feedback = "";
            if (delta > 0) {
                if (newValue >= 3) {
                    feedback = `${npcName} looks at you with respect.`;
                } else if (newValue > 0) {
                    feedback = `${npcName} seems more friendly.`;
                } else {
                    feedback = `${npcName} seems less hostile.`;
                }
            } else {
                if (newValue <= -3) {
                    feedback = `${npcName} glares at you with suspicion.`;
                } else if (newValue < 0) {
                    feedback = `${npcName} seems displeased.`;
                } else {
                    feedback = `${npcName} seems less friendly.`;
                }
            }
            
            // Add feedback to story text if possible
            const storyElement = document.getElementById('story');
            if (storyElement && feedback) {
                const feedbackDiv = document.createElement('div');
                feedbackDiv.className = 'relationship-feedback';
                feedbackDiv.style.cssText = 'margin-top: 15px; padding: 10px; background: rgba(212,175,55,0.1); border-left: 3px solid #d4af37; font-style: italic; color: #d4af37;';
                feedbackDiv.textContent = feedback;
                storyElement.appendChild(feedbackDiv);
                
                // Remove after 5 seconds
                setTimeout(() => {
                    if (feedbackDiv.parentNode) {
                        feedbackDiv.style.opacity = '0';
                        feedbackDiv.style.transition = 'opacity 0.5s';
                        setTimeout(() => feedbackDiv.remove(), 500);
                    }
                }, 5000);
            }
            
            // Update relationship display
            if (typeof updateRelationshipDisplay === 'function') {
                updateRelationshipDisplay();
            }
        }
    }
    
    /** Ensure flags object exists and return it */
    const ensureFlags = (gs) => (gs.flags ??= {});
    
    /** Check if campfire should be inserted */
    // M5: Emotional pacing — tracks scene intensity to prevent tonal whiplash
    function getSceneIntensity(sceneKey) {
        if (!sceneKey) return 0;
        // High-intensity scenes (combat, death, key narrative moments)
        if (sceneKey.startsWith('battle_') || sceneKey.startsWith('crecy_') ||
            sceneKey.startsWith('death_') || sceneKey.startsWith('skirmish_') ||
            sceneKey.startsWith('blanchetaque_') || sceneKey.startsWith('caen_bridge')) {
            return 3;
        }
        // Medium intensity (siege, encounter resolution)
        if (sceneKey.includes('resolve') || sceneKey.startsWith('calais_') ||
            sceneKey.startsWith('siege_') || sceneKey === 'village_pillage' ||
            sceneKey === 'prisoner_ransom') {
            return 2;
        }
        // Low intensity (travel, camp, between_years)
        return 0;
    }
    
    function shouldInsertCampfire(nextSceneKey) {
        // Never interrupt:
        // - character creation scenes
        // - combat overlay/active combat
        // - already-a-campfire scene
        // - explicit "noCampfire" flagged scenes/choices
        // - critical scenes like death/ending
        // - early game scenes (training, between_years, winter_quarters)
        
        // Check if current scene is a campfire scene
        const currentSceneStr = String(window.gameState.currentScene || '');
        const isCurrentCampfire = window.gameState.currentScene === 'character_creation' || 
            window.gameState.currentScene === 'campfire_interlude' ||
            currentSceneStr.startsWith('campfire_wat_') ||
            currentSceneStr.startsWith('campfire_cook_') ||
            currentSceneStr.startsWith('campfire_both_');
        
        // Check if next scene is a campfire scene
        const nextSceneStr = String(nextSceneKey || '');
        const isNextCampfire = nextSceneKey === 'character_creation' ||
            nextSceneKey === 'campfire_interlude' ||
            nextSceneStr.startsWith('campfire_wat_') ||
            nextSceneStr.startsWith('campfire_cook_') ||
            nextSceneStr.startsWith('campfire_both_');
        
        if (isCurrentCampfire || isNextCampfire) {
            return false;
        }
        
        // Never interrupt early game scenes
        if (nextSceneKey.startsWith('training_') ||
            nextSceneKey.startsWith('between_years_') ||
            nextSceneKey.startsWith('winter_quarters_') ||
            nextSceneKey.startsWith('equipment_upgrade_') ||
            nextSceneKey === 'marriage_joke' ||
            nextSceneKey === 'quick_start_review') {
            return false;
        }
        
        // Check if scene has noCampfire flag
        if (typeof window.scenes !== 'undefined' && window.scenes[nextSceneKey] && window.scenes[nextSceneKey].noCampfire) {
            return false;
        }
        
        // M5: Skip insertion if exiting high-intensity scene (emotional cooldown)
        const currentIntensity = getSceneIntensity(window.gameState.currentScene);
        if (currentIntensity >= 2) {
            return false;
        }
        
        // Don't insert during early game (first 10 scenes)
        const idx = window.gameState.scenesVisited ? window.gameState.scenesVisited.length : 0;
        if (idx < 10) {
            return false;
        }
        
        const cf = window.gameState.campfire || {};
        const since = idx - (cf.lastInsertedAtIndex || 0);
        
        // Must pass cooldown (increased to 3 for better pacing)
        if (since < (cf.cooldownScenes || 3)) {
            return false;
        }
        
        // Chance check
        return Math.random() < (cf.chance || 0.35);
    }
    
    /** Insert campfire interlude if conditions are met */
    function maybeInsertCampfire(nextSceneKey) {
        // Fix D: Guard - campfire should never return to campfire
        const nextSceneStr = String(nextSceneKey || '');
        const isCampfireScene = nextSceneKey === 'campfire_interlude' ||
            nextSceneStr.startsWith('campfire_wat_') ||
            nextSceneStr.startsWith('campfire_cook_') ||
            nextSceneStr.startsWith('campfire_both_');
        
        if (isCampfireScene) {
            console.warn('[QA ROUTING GUARD] maybeInsertCampfire called with campfire scene as nextScene:', nextSceneKey);
            return nextSceneKey; // Don't insert another campfire
        }

        if (!shouldInsertCampfire(nextSceneKey)) {
            return nextSceneKey;
        }

        // Guard: campfire should never return to itself or resolve scenes
        const invalidReturnScenes = ['campfire_interlude', 'skirmish_roadside_resolve',
                                    'skirmish_roadside', 'skirmish_roadside_mud', 'skirmish_roadside_lane'];
        const isCampfireReturnScene = nextSceneKey === 'campfire_interlude' ||
            nextSceneStr.startsWith('campfire_wat_') ||
            nextSceneStr.startsWith('campfire_cook_') ||
            nextSceneStr.startsWith('campfire_both_');
        
        let safeReturnScene = nextSceneKey;

        if (invalidReturnScenes.includes(nextSceneKey) || isCampfireReturnScene) {
            // Fallback to a safe travel scene
            safeReturnScene = (typeof window.scenes !== 'undefined' && window.scenes['march_through_normandy_1'] ? 'march_through_normandy_1' : 'start');
            if (window.gameState.debug && window.gameState.debug.enabled) {
                console.warn('[QA] Campfire returnScene was invalid:', nextSceneKey, 'using fallback:', safeReturnScene);
            }
        }

        // Fix D: Assertion - verify we're not routing to ourselves
        const safeReturnStr = String(safeReturnScene || '');
        const isStillCampfire = safeReturnScene === 'campfire_interlude' ||
            safeReturnStr.startsWith('campfire_wat_') ||
            safeReturnStr.startsWith('campfire_cook_') ||
            safeReturnStr.startsWith('campfire_both_');
        
        if (isStillCampfire) {
            console.error('[QA ASSERTION FAILED] Campfire would return to campfire! Using fallback.');
            safeReturnScene = (typeof window.scenes !== 'undefined' && window.scenes['march_through_normandy_1'] ? 'march_through_normandy_1' : 'start');
        }

        // Set return scene and mark insertion
        if (!window.gameState.campfire) {
            window.gameState.campfire = {};
        }
        window.gameState.campfire.returnScene = safeReturnScene;
        window.gameState.campfire.lastInsertedAtIndex = (window.gameState.scenesVisited ? window.gameState.scenesVisited.length : 0);

        // Decide mode: 30% full vignette, 70% micro campfire
        window.gameState.campfire.lastMode = window.gameState.campfire.mode;
        window.gameState.campfire.mode = (Math.random() < 0.30) ? 'full' : 'micro';

        // If micro mode, use micro campfire
        if (window.gameState.campfire.mode === 'micro') {
            return "campfire_interlude";
        }

        // For full mode, randomly select from 5 different campfire scenes
        const availableCampfireScenes = [
            'campfire_wat_01_the_sharpening',
            'campfire_wat_02_the_rope',
            'campfire_wat_03_the_boy_king',
            'campfire_wat_04_the_dead_mules',
            'campfire_wat_05_the_prayer'
        ];

        // Track seen campfire scenes to avoid immediate repetition
        if (!window.gameState.campfire.seenScenes) {
            window.gameState.campfire.seenScenes = [];
        }

        // Filter out recently seen scenes (last 2)
        const recentSeen = window.gameState.campfire.seenScenes.slice(-2);
        const available = availableCampfireScenes.filter(scene => !recentSeen.includes(scene));

        // Select from available scenes, or fall back to all if all were recently seen
        const scenePool = available.length > 0 ? available : availableCampfireScenes;
        const selectedScene = scenePool[Math.floor(Math.random() * scenePool.length)];

        // Track this selection
        window.gameState.campfire.seenScenes.push(selectedScene);
        if (window.gameState.campfire.seenScenes.length > 5) {
            window.gameState.campfire.seenScenes = window.gameState.campfire.seenScenes.slice(-5);
        }

        return selectedScene;
    }
    
    // Make available globally
    window.clampRel = clampRel;
    window.changeRel = changeRel;
    window.ensureFlags = ensureFlags;
    window.getSceneIntensity = getSceneIntensity;
    window.shouldInsertCampfire = shouldInsertCampfire;
    window.maybeInsertCampfire = maybeInsertCampfire;
})();
