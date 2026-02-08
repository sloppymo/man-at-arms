(function() {
    'use strict';
    
    if (typeof window.scenes === 'undefined') {
        window.scenes = {};
    }
    
    // Define renderCharacterCreationStep4 function first
    function renderCharacterCreationStep4() {
        const backgroundQuestions = [
            { id: 'hard_father', text: "Your father was a hard, cruel man. Your entire life you have woken before the dawn to break hard Earth, scratching a living out of the frozen soil to appease him. You learned hard lessons from those days, but each day in that house is a stain of black misery in your memories.", effects: { strength: 1, endurance: 1, charisma: -1 } },
            { id: 'mangled_hand', text: "Your hand was mangled as a youth. It wasn't ruined, but it bears the twisted scars of that old trauma and has never been quite the same. Your hand excused you from some of the chores that would have been assigned to a healthy boy. Instead, you often helped in the homestead with women's work, and learned to read at the local Abbey.", effects: { agility: -1, endurance: -1, wits: 3 } },
            { id: 'lost_sibling', text: "You had a sibling who died young—fever, accident, or the simple cruelty of a world that takes children. Their absence shaped you. You learned to be careful, to watch for danger, but also to value what remains.", effects: { wits: 1, endurance: 1, morale: -1 } },
            { id: 'village_hero', text: "When bandits came to your village, you stood with the others. You weren't the strongest or the fastest, but you were there when it mattered. The respect you earned that day still follows you.", effects: { charisma: 1, reputation: 2, strength: -1 } },
            { id: 'apprentice_master', text: "Your master was a harsh teacher, but fair. Every mistake was a lesson, every success earned a nod. You learned discipline and precision, but also learned to fear failure.", effects: { wits: 2, agility: 1, stress: 1 } },
            { id: 'first_love', text: "There was someone once—a first love, a promise made, a promise broken. Whether by war, by family, or by your own choices, it ended. The memory of what was lost makes you careful with new bonds.", effects: { charisma: -1, wits: 1, morale: 1 } }
        ];
        
        const selectedBackground = gameState.selectedBackground;
        
        return '<div style="margin-bottom: 30px; padding: 20px; background: rgba(212, 175, 55, 0.15); border: 2px solid #d4af37; border-radius: 8px;">' +
            '<h3 style="color: #f4d03f; margin-bottom: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">Step 4 — Choose Your Past</h3>' +
            '<p style="color: #888; font-size: 14px; margin-bottom: 20px;">Choose one background that shaped you before the war. This will affect your starting attributes. <em style="color: #d4af37;">(Required)</em></p>' +
            '<button onclick="console.log(\'Test button clicked\')" style="margin-bottom: 15px; padding: 10px; background: #8b6914; border: 1px solid #d4af37; color: #d4af37; border-radius: 3px; cursor: pointer;">Test Click Handler</button>' +
            '<div style="display: grid; grid-template-columns: 1fr; gap: 15px;">' +
                backgroundQuestions.map(function(q) {
                    const isSelected = selectedBackground === q.id;
                    const effectText = Object.entries(q.effects).map(function([stat, val]) {
                        const sign = val > 0 ? '+' : '';
                        const statName = stat.charAt(0).toUpperCase() + stat.slice(1);
                        return sign + val + ' ' + statName;
                    }).join(', ');
                    
                    return '<div style="padding: 15px; background: rgba(0,0,0,0.3); border-radius: 5px; border: 2px solid ' + (isSelected ? '#d4af37' : '#555') + '; cursor: pointer;" onclick="window.selectBackground(\'' + q.id + '\')">' +
                        '<div style="color: #d4af37; font-style: italic; margin-bottom: 10px; line-height: 1.6;">"' + q.text + '"</div>' +
                        '<div style="color: #888; font-size: 12px; margin-top: 8px; font-style: italic;">Attribute changes: ' + effectText + '</div>' +
                        (isSelected ? 
                            '<div style="color: #0f0; font-size: 12px; margin-top: 8px;">✓ Chosen Background</div>' :
                            '') +
                    '</div>';
                }).join('') +
            '</div>' +
            (selectedBackground ? 
                '<div style="margin-top: 20px; text-align: center;">' +
                    '<button onclick="window.characterCreationNext()" style="padding: 10px 20px; background: #8b6914; border: 1px solid #d4af37; color: #d4af37; border-radius: 3px; cursor: pointer; font-size: 14px;">Continue to Next Step</button>' +
                '</div>' :
                '<div style="margin-top: 20px; text-align: center; color: #888; font-size: 14px;">Please select a background to continue</div>'
            ) +
        '</div>';
    }
    
    // Make the function globally available
    window.renderCharacterCreationStep4 = renderCharacterCreationStep4;
    
    // Define handleBackgroundClick globally
    window.handleBackgroundClick = function(id) {
        console.log('handleBackgroundClick called with:', id);
        if (window.selectCharacterBackground) {
            console.log('Calling window.selectCharacterBackground');
            window.selectCharacterBackground(id);
        } else {
            console.error('window.selectCharacterBackground not available yet');
        }
    };
    
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
                    // Inline the background selection HTML to avoid function scope issues
                    const backgroundQuestions = [
                        { id: 'hard_father', text: "Your father was a hard, cruel man. Your entire life you have woken before the dawn to break hard Earth, scratching a living out of the frozen soil to appease him. You learned hard lessons from those days, but each day in that house is a stain of black misery in your memories.", effects: { strength: 1, endurance: 1, charisma: -1 } },
                        { id: 'mangled_hand', text: "Your hand was mangled as a youth. It wasn't ruined, but it bears the twisted scars of that old trauma and has never been quite the same. Your hand excused you from some of the chores that would have been assigned to a healthy boy. Instead, you often helped in the homestead with women's work, and learned to read at the local Abbey.", effects: { agility: -1, endurance: -1, wits: 3 } },
                        { id: 'lost_sibling', text: "You had a sibling who died young—fever, accident, or the simple cruelty of a world that takes children. Their absence shaped you. You learned to be careful, to watch for danger, but also to value what remains.", effects: { wits: 1, endurance: 1, morale: -1 } },
                        { id: 'village_hero', text: "When bandits came to your village, you stood with the others. You weren't the strongest or the fastest, but you were there when it mattered. The respect you earned that day still follows you.", effects: { charisma: 1, reputation: 2, strength: -1 } },
                        { id: 'apprentice_master', text: "Your master was a harsh teacher, but fair. Every mistake was a lesson, every success earned a nod. You learned discipline and precision, but also learned to fear failure.", effects: { wits: 2, agility: 1, stress: 1 } },
                        { id: 'first_love', text: "There was someone once—a first love, a promise made, a promise broken. Whether by war, by family, or by your own choices, it ended. The memory of what was lost makes you careful with new bonds.", effects: { charisma: -1, wits: 1, morale: 1 } }
                    ];
                    
                    const selectedBackground = window.gameState.selectedBackground;
                    console.log('selectedBackground in HTML generation:', selectedBackground);
                    
                    stepContent = '<div style="margin-bottom: 30px; padding: 20px; background: rgba(212, 175, 55, 0.15); border: 2px solid #d4af37; border-radius: 8px;">' +
                        '<h3 style="color: #f4d03f; margin-bottom: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">Step 4 — Choose Your Past</h3>' +
                        '<p style="color: #888; font-size: 14px; margin-bottom: 20px;">Choose one background that shaped you before the war. This will affect your starting attributes. <em style="color: #d4af37;">(Required)</em></p>' +
                        '<button onclick="console.log(\'Test button clicked\'); console.log(\'selectBackground exists:\', typeof window.selectBackground);" style="margin-bottom: 15px; padding: 10px; background: #8b6914; border: 1px solid #d4af37; color: #d4af37; border-radius: 3px; cursor: pointer;">Test Click Handler</button>' +
                        '<div style="display: grid; grid-template-columns: 1fr; gap: 15px;">' +
                            backgroundQuestions.map(function(q) {
                                const isSelected = selectedBackground === q.id;
                                const effectText = Object.entries(q.effects).map(function([stat, val]) {
                                    const sign = val > 0 ? '+' : '';
                                    const statName = stat.charAt(0).toUpperCase() + stat.slice(1);
                                    return sign + val + ' ' + statName;
                                }).join(', ');
                                
                                return '<button style="padding: 15px; background: rgba(0,0,0,0.3); border-radius: 5px; border: 2px solid ' + (isSelected ? '#d4af37' : '#555') + '; cursor: pointer; width: 100%; text-align: left; font-family: inherit; color: inherit;" onclick="window.handleBackgroundClick(\'' + q.id + '\')">' +
                                    '<div style="color: #d4af37; font-style: italic; margin-bottom: 10px; line-height: 1.6;">"' + q.text + '"</div>' +
                                    '<div style="color: #888; font-size: 12px; margin-top: 8px; font-style: italic;">Attribute changes: ' + effectText + '</div>' +
                                    (isSelected ? 
                                        '<div style="color: #0f0; font-size: 12px; margin-top: 8px;">✓ Chosen Background</div>' :
                                        '') +
                                '</button>';
                            }).join('') +
                        '</div>' +
                        (selectedBackground ? 
                            '<div style="margin-top: 20px; text-align: center;">' +
                                '<button onclick="window.nextCharacterCreationStep()" style="padding: 10px 20px; background: #8b6914; border: 1px solid #d4af37; color: #d4af37; border-radius: 3px; cursor: pointer; font-size: 14px;">Continue to Next Step</button>' +
                            '</div>' :
                            '<div style="margin-top: 20px; text-align: center; color: #888; font-size: 14px;">Please select a background to continue</div>'
                        ) +
                    '</div>';
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
                    
                    // Validate background is selected
                    if (!gameState.selectedBackground) {
                        showNotification('Character Creation', 'Please select a background before continuing.');
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
