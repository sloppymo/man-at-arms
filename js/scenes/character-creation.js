(function() {
    'use strict';
    
    if (typeof window.scenes === 'undefined') {
        window.scenes = {};
    }
    
    Object.assign(window.scenes, {
        character_creation: {
        title: "Character Creation",
        year: 1337,
        age: function() { return gameState.age; },
        location: "England",
        artwork: "artwork/opening-tapestry.jpg", // Medieval tapestry: "HIC MILITES VASTANT TERRAM" - soldiers laying waste to the land
        artworkCaption: "Here the soldiers lay waste to the land",
        text: function() {
            // Ensure gameState.stats exists (safety check)
            if (!gameState.stats) {
                console.error("gameState.stats is not defined in character creation!");
                return '<div style="padding: 20px; color: red;"><p>Error: Game state not initialized. Please refresh the page.</p></div>';
            }
            
            // Initialize step if not set
            if (!gameState.characterCreationStep) {
                gameState.characterCreationStep = 1;
            }
            
            const currentStep = gameState.characterCreationStep || 1;
            const nameDisplay = gameState.characterName || "William Thatcher";
            const currentAgeRange = gameState.ageRange || null;
            const currentCulture = gameState.culture || "";
            
            // Route to appropriate step renderer
            let stepContent = '';
            switch(currentStep) {
                case 1:
                    stepContent = renderCharacterCreationStep1(nameDisplay, currentCulture);
                    break;
                case 2:
                    stepContent = renderCharacterCreationStep2(currentAgeRange);
                    break;
                case 3:
                    stepContent = renderCharacterCreationStep3();
                    break;
                case 4:
                    stepContent = renderCharacterCreationStep4();
                    break;
                case 5:
                    stepContent = renderCharacterCreationStep5();
                    break;
                case 6:
                    stepContent = renderCharacterCreationStep6();
                    break;
                default:
                    stepContent = renderCharacterCreationStep1(nameDisplay, currentCulture);
            }
            
            // Add step navigation
            const navigation = renderStepNavigation(currentStep, 6);
            
            return '<div style="max-width: 800px; margin: 0 auto;">' +
                '<h2 style="color: #f4d03f; text-align: center; margin-bottom: 30px;">Create Your Character</h2>' +
                stepContent +
                navigation +
                '</div>';
        },
        choices: [
            {
                text: "Begin Your Journey",
                effects: {},
                nextScene: "start",
                requiresOrigin: true,
                requiresPatron: true,
                onChoose: function() {
                    // Only allow if on final step
                    if (gameState.characterCreationStep !== 6) {
                        showNotification('Character Creation', 'Please complete all steps before beginning your journey.');
                        return false;
                    }
                    
                    // Validate required fields
                    if (!gameState.characterName || gameState.characterName.trim() === '') {
                        gameState.characterName = "William Thatcher";
                    }
                    if (!gameState.culture) {
                        showNotification('Character Creation', 'Please select your region.');
                        return false;
                    }
                    if (!gameState.ageRange) {
                        showNotification('Character Creation', 'Please select your age range.');
                        return false;
                    }
                    if (!gameState.origin) {
                        showNotification('Character Creation', 'Please select your origin.');
                        return false;
                    }
                    if (!gameState.patronId) {
                        showNotification('Character Creation', 'Please select a patron before beginning your journey.');
                        return false;
                    }
                    
                    // Validate priorities
                    const priorityValidation = validatePrioritiesCompleteAndUnique();
                    if (!priorityValidation.ok) {
                        showNotification('Character Creation', priorityValidation.message);
                        return false;
                    }
                    
                    // Resolve final starting kit tier and grant kit if not already granted
                    if (!gameState.startingKitGranted) {
                        // Ensure all stats are recalculated (includes kit tier resolution)
                        recalculateCharacterCreationDerivedStats();
                        const origin = gameState.origin || 'rural_peasant';
                        grantStartingKit(origin, gameState.startingKitTier);
                    }
                }
            }
        ]
    },
    quick_start_review: {
        title: "Quick Start Character",
        year: 1337,
        age: function() { return gameState.age || 27; },
        location: "England",
        text: function() {
            const name = gameState.characterName || "Soldier";
            const region = gameState.culture || "Unknown";
            const ageRange = gameState.ageRange || 'prime';
            const origin = gameState.origin || 'rural_peasant';
            const patron = gameState.patron || 'lord_david';
            const preset = gameState.quickStartPreset || 'brawny';
            
            const ageLabels = {
                'youth': 'Youth (16-19)',
                'young_adult': 'Young Adult (20-24)',
                'prime': 'Prime (25-30)',
                'veteran': 'Veteran (31-35)',
                'old_hand': 'Old Hand (36-40)'
            };
            
            const originLabels = {
                'rural_peasant': 'Rural Peasant',
                'manor_retainer': 'Manor Retainer',
                'craftsman_apprentice': "Craftsman's Apprentice",
                'squire': 'Squire to a Knight',
                'minor_noble': 'Minor Noble or Garrison\'s Son/Daughter'
            };
            
            const patronLabels = {
                'james_olooney': 'Sir James "The Reaver" de Looney',
                'lord_david': 'Sir David de Montfort',
                'duke_caley': 'Baron Caley of Tournai',
                'count_charles': 'Count Charles "The Grim" of Suffolk',
                'ashkhan': 'Ashkhan of the Mamluk Guard'
            };
            
            const presetLabels = {
                'brawny': '💪 Brawny Footman',
                'cunning': '🧠 Cunning Scout',
                'court': '👑 Court-Leaned',
                'lucky': '🎲 Lucky Bastard'
            };
            
            const playstyleDescriptions = {
                'brawny': 'A physical powerhouse focused on strength and endurance. You excel in direct combat and can take punishment. Best for players who want to charge into battle and rely on raw power.',
                'cunning': 'A quick and intelligent fighter. You excel at tactics, agility, and outmaneuvering enemies. Best for players who prefer clever solutions and avoiding direct confrontation.',
                'court': 'A charismatic leader with political connections. You excel at social situations, leadership, and navigating noble circles. Best for players who want to influence others and build reputation.',
                'lucky': 'A well-rounded character with exceptional fortune. You have balanced stats but superior luck and wealth. Best for players who want flexibility and to rely on good fortune.'
            };
            
            const patronDescriptions = {
                'james_olooney': 'A wildcard free company known for murder and pillage. High risk, high reward. Expect brutal combat and rich plunder, but little regard for your safety.',
                'lord_david': 'A fair and even-handed commander who values his men\'s lives. Lower risk, steady rewards. Expect protection and care, but less opportunity for glory.',
                'duke_caley': 'A powerful lord who is indifferent to your wellbeing but offers great opportunities for plunder and advancement. High reward potential, but you\'re expendable.',
                'count_charles': 'A grizzled battlefield leader who has taken to drinking heavily. Unpredictable leadership, but strong in combat. Expect both chaos and moments of brilliance.',
                'ashkhan': 'A respected mercenary from the Levant with tactical expertise. Professional and disciplined. Expect well-planned operations and fair treatment, but strict standards.'
            };
            
            const stats = gameState.stats || {};
            
            return `
                <div style="max-width: 800px; margin: 0 auto;">
                    <h2 style="color: #f4d03f; text-align: center; margin-bottom: 30px;">Your Quick Start Character</h2>
                    
                    <div style="padding: 20px; background: rgba(212, 175, 55, 0.15); border: 2px solid #d4af37; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #f4d03f; margin-bottom: 15px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">Character Details</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div><strong style="color: #d4af37;">Name:</strong> <span style="color: #f4d03f;">${escapeHTML(name)}</span></div>
                            <div><strong style="color: #d4af37;">Region:</strong> <span style="color: #f4d03f;">${region}</span></div>
                            <div><strong style="color: #d4af37;">Age:</strong> <span style="color: #f4d03f;">${ageLabels[ageRange]}</span></div>
                            <div><strong style="color: #d4af37;">Origin:</strong> <span style="color: #f4d03f;">${originLabels[origin]}</span></div>
                            <div><strong style="color: #d4af37;">Patron:</strong> <span style="color: #f4d03f;">${patronLabels[patron]}</span></div>
                            <div><strong style="color: #d4af37;">Build:</strong> <span style="color: #f4d03f;">${presetLabels[preset]}</span></div>
                        </div>
                        
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #555;">
                            <div style="color: #d4af37; font-weight: bold; margin-bottom: 10px;">Starting Stats:</div>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 14px;">
                                <div><strong>Strength:</strong> <span style="color: #f4d03f;">${stats.strength || 5}</span></div>
                                <div><strong>Agility:</strong> <span style="color: #f4d03f;">${stats.agility || 5}</span></div>
                                <div><strong>Endurance:</strong> <span style="color: #f4d03f;">${stats.endurance || 5}</span></div>
                                <div><strong>Charisma:</strong> <span style="color: #f4d03f;">${stats.charisma || 5}</span></div>
                                <div><strong>Wits:</strong> <span style="color: #f4d03f;">${stats.wits || 5}</span></div>
                                <div><strong>Luck:</strong> <span style="color: #f4d03f;">${stats.luck || 5}</span></div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="padding: 20px; background: rgba(212, 175, 55, 0.15); border: 2px solid #d4af37; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #f4d03f; margin-bottom: 15px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">Playstyle</h3>
                        <div style="color: #d4af37; line-height: 1.6; margin-bottom: 15px;">
                            <p><strong style="color: #f4d03f;">Build:</strong> ${playstyleDescriptions[preset]}</p>
                        </div>
                        <div style="color: #d4af37; line-height: 1.6;">
                            <p><strong style="color: #f4d03f;">Patron:</strong> ${patronDescriptions[patron]}</p>
                        </div>
                    </div>
                    
                    <div style="padding: 15px; background: rgba(139, 105, 20, 0.2); border: 1px dashed #8b6914; border-radius: 5px; text-align: center; color: #888; font-size: 13px; font-style: italic;">
                        Ready to begin your journey? Click below to start the game.
                    </div>
                </div>
            `;
        },
        choices: [
            {
                text: "Begin Your Journey",
                effects: {},
                nextScene: "start"
            }
        ]
    }
    });
})();
