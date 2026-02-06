(function() {
    'use strict';
    
    if (typeof window.scenes === 'undefined') {
        window.scenes = {};
    }
    
    Object.assign(window.scenes, {
    start: {
        title: "The Beginning",
        year: 1337,
        age: function() { return gameState.age || 18; },
        location: "England",
        text: function() {
            const name = gameState.characterName || "Soldier";
            const region = gameState.culture || "";
            const ageRange = gameState.ageRange || 'prime';
            const ageLabels = {
                'youth': 'young',
                'young_adult': 'young',
                'prime': '',
                'veteran': 'veteran',
                'old_hand': 'veteran'
            };
            const ageText = ageLabels[ageRange] || '';
            return `<p>It is the year 1337. The war between England and France has just begun.</p>
                   <p><strong>${name}</strong>, you are a ${ageText ? ageText + " " : ""}${region} man, ready to make your mark on history. The call to arms has reached you, and you've decided to join a lord's retinue.</p>
                   <p>Your training begins now...</p>`;
        },
        choices: [
            {
                text: "Begin Training",
                effects: {},
                nextScene: function() {
                    const origin = gameState.origin || 'rural_peasant';
                    const originMap = {
                        rural_peasant: "training_rural_peasant",
                        manor_retainer: "training_manor_retainer",
                        craftsman_apprentice: "training_craftsman_apprentice",
                        squire: "training_squire",
                        minor_noble: "training_minor_noble"
                    };
                    return originMap[origin] || "training_rural_peasant";
                }
            }
        ],
        onEnter: function() {
            const sceneKey = `start_${gameState.year}`;
            if (!gameState.enteredScenes.has(sceneKey)) {
                // Grant starting kit if not already granted (backward compatibility)
                if (!gameState.startingKitGranted) {
                    // Ensure kit tier is resolved
                    if (!gameState.startingKitTier) {
                        resolveStartingKitTier();
                    }
                    const origin = gameState.origin || 'rural_peasant';
                    grantStartingKit(origin, gameState.startingKitTier);
                }
                
                // Apply origin bonuses if not already applied
                if (!gameState.flags.originApplied) {
                    const origin = gameState.origin || 'rural_peasant';
                    
                    // Starting equipment by origin
                    const startingEquipment = {
                        rural_peasant: [
                            { id: 'rusty_sword', condition: 80, fit: 'off-the-rack', stackCount: 1 },
                            { id: 'padded_jack', condition: 75, fit: 'off-the-rack', stackCount: 1 }
                        ],
                        manor_retainer: [
                            { id: 'spear', condition: 85, fit: 'off-the-rack', stackCount: 1 },
                            { id: 'padded_jack', condition: 80, fit: 'off-the-rack', stackCount: 1 },
                            { id: 'kettle_hat', condition: 80, fit: 'off-the-rack', stackCount: 1 }
                        ],
                        craftsman_apprentice: [
                            { id: 'arming_sword', condition: 90, fit: 'off-the-rack', stackCount: 1 },
                            { id: 'padded_jack', condition: 85, fit: 'off-the-rack', stackCount: 1 },
                            { id: 'rondel_dagger', condition: 90, fit: 'off-the-rack', stackCount: 1 }
                        ],
                        squire: [
                            { id: 'arming_sword', condition: 95, fit: 'off-the-rack', stackCount: 1 },
                            { id: 'padded_jack', condition: 90, fit: 'off-the-rack', stackCount: 1 },
                            { id: 'kettle_hat', condition: 90, fit: 'off-the-rack', stackCount: 1 },
                            { id: 'buckler', condition: 85, fit: 'off-the-rack', stackCount: 1 }
                        ],
                        minor_noble: [
                            { id: 'arming_sword', condition: 100, fit: 'tailored', stackCount: 1 },
                            { id: 'padded_jack', condition: 95, fit: 'tailored', stackCount: 1 },
                            { id: 'kettle_hat', condition: 95, fit: 'tailored', stackCount: 1 },
                            { id: 'buckler', condition: 90, fit: 'tailored', stackCount: 1 }
                        ]
                    };
                    
                    // Give starting equipment
                    if (!gameState.inventory) gameState.inventory = [];
                    const equipment = startingEquipment[origin] || [];
                    equipment.forEach(function(item) {
                        if (!gameState.inventory.find(function(i) { return i.id === item.id; })) {
                            gameState.inventory.push(item);
                        }
                    });
                    
                    // Apply stat bonuses
                    switch(origin) {
                        case 'rural_peasant':
                            applyStatChange('endurance', 2);
                            applyStatChange('wealth', -5);
                            break;
                        case 'manor_retainer':
                            applyStatChange('strength', 1);
                            applyStatChange('charisma', 1);
                            break;
                        case 'craftsman_apprentice':
                            applyStatChange('wits', 1);
                            applyStatChange('agility', 1);
                            break;
                        case 'squire':
                            applyStatChange('strength', 1);
                            applyStatChange('wits', 1);
                            break;
                        case 'minor_noble':
                            applyStatChange('charisma', 1);
                            applyStatChange('wits', 1);
                            applyStatChange('reputation', 5);
                            break;
                    }
                    gameState.flags.originApplied = true;
                }
                
                // Apply patron stat modifiers if not already applied (final application at game start)
                // Note: Stats should already be correct from recalculateCharacterCreationDerivedStats(),
                // but we apply here as a final guard to ensure they're set
                if (!gameState.flags.patronApplied) {
                    // Recalculate to ensure all mods are applied (idempotent)
                    recalculateCharacterCreationDerivedStats();
                    gameState.flags.patronApplied = true;
                }
                
                gameState.enteredScenes.add(sceneKey);
            }
        }
    },
    training_rural_peasant: {
        title: "Training Begins",
        year: 1337,
        age: function() { return window.gameState.age || 18; },
        location: "England",
        artwork: "artwork/blacksmith.jpg",
        artworkCaption: "The training yard - where field hands become soldiers",
        text: function() {
            const name = window.gameState.characterName || "Soldier";
            return `<p>You've joined a lord's retinue. The training yard stretches before you, filled with men drilling, sparring, and learning the ways of war. The sergeant-at-arms, a grizzled veteran with scars across his face, calls the recruits to attention.</p>
                   <p>"You think you know hard work?" he barks. "The fields taught you nothing. War is different. War breaks men. War kills men. And if you're lucky, it makes you into something more. But first, you learn. You drill. You obey. Or you die."</p>
                   <p>Your endurance from the fields serves you well, but you lack the formal training of those born to higher stations. The first days will test everything you think you know.</p>`;
        },
        choices: [
            {
                text: "Focus on weapon training",
                effects: { strength: 1 },
                nextScene: "training_weapons"
            },
            {
                text: "Emphasize formation and discipline",
                effects: { endurance: 1 },
                nextScene: "training_formation"
            },
            {
                text: "Push yourself in physical conditioning",
                effects: { endurance: 1, strength: 1 },
                nextScene: "training_conditioning"
            }
        ]
    },
    training_weapons: {
        title: "Weapon Training",
        year: 1337,
        age: function() { return gameState.age || 18; },
        location: "England",
        artwork: "artwork/blacksmith.jpg",
        artworkCaption: "The forge glows in the evening - fire and metal",
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>The weapon master, a man named Thomas, pairs you with a training partner. Your sword feels heavy and awkward in your hands—nothing like the tools you knew from the fields.</p>
                   <p>"Most of you think a sword is just a sharp stick," Thomas says, demonstrating a basic guard. "You're wrong. A sword is an extension of your will. Your body. Your life. Learn to use it, or it'll be the last thing you hold."</p>
                   <p>Hours pass in drills. Thrust. Parry. Cut. Your arms ache. Your hands blister. But slowly, the movements become more natural. The weight becomes familiar.</p>
                   <p>Your training partner, a man named Will, grins through sweat-stained teeth. "Not bad for a field hand. You've got strength. Just need to learn how to use it."</p>`;
        },
        choices: [
            {
                text: "Practice sword techniques late into the evening",
                effects: { stress: 1 },
                nextScene: "training_weapons_resolve",
                requiresResolution: true,
                resolutionStat: "strength",
                resolutionDifficulty: 10
            },
            {
                text: "Learn spear work for formation fighting",
                effects: { stress: 1 },
                nextScene: "training_weapons_resolve",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 9
            },
            {
                text: "Focus on defensive techniques and shield work",
                effects: { stress: 1 },
                nextScene: "training_weapons_resolve",
                requiresResolution: true,
                resolutionStat: "endurance",
                resolutionDifficulty: 10
            }
        ]
    },
    training_formation: {
        title: "Formation and Discipline",
        year: 1337,
        age: function() { return gameState.age || 18; },
        location: "England",
        artwork: "artwork/training.png",
        artworkCaption: "Learning the patterns of war - formation and discipline",
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>The sergeant drills you in formation. "A single man is nothing," he shouts. "A formation is everything. Hold the line. Trust your comrades. Break, and you all die."</p>
                   <p>You learn to move as one. To hold your position. To trust the man beside you. The discipline is harsh—any mistake earns a beating or extra drills. But you understand. In the fields, you worked alone. Here, you're part of something larger.</p>
                   <p>Your endurance serves you well. While others falter, you hold. You keep formation. You learn the rhythm of battle—advance, hold, retreat, reform. The patterns become second nature.</p>
                   <p>After weeks of drilling, the sergeant nods in approval. "You've got discipline. That's rare. Most men think they're heroes. You know you're a soldier. That might keep you alive."</p>`;
        },
        choices: [
            {
                text: "Volunteer to help train newer recruits",
                effects: { stress: 1 },
                nextScene: "training_formation_resolve",
                requiresResolution: true,
                resolutionStat: "charisma",
                resolutionDifficulty: 10
            },
            {
                text: "Practice advanced formation maneuvers",
                effects: { stress: 1 },
                nextScene: "training_formation_resolve",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 9
            },
            {
                text: "Focus on your individual combat skills",
                effects: { stress: 1 },
                nextScene: "training_formation_resolve",
                requiresResolution: true,
                resolutionStat: "strength",
                resolutionDifficulty: 10
            }
        ]
    },
    training_conditioning: {
        title: "Physical Conditioning",
        year: 1337,
        age: function() { return gameState.age || 18; },
        location: "England",
        artwork: "artwork/march.jpg",
        artworkCaption: "The long days of training - building strength and endurance",
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>You push yourself harder than the others. Running. Lifting. Sparring until you can barely stand. The fields taught you endurance, but this is different. This is focused. This is purposeful.</p>
                   <p>Your muscles ache. Your body screams. But you keep going. Because you know what hard work means. Because you've spent your life doing it. The training yard becomes your second home. The weights, your companions.</p>
                   <p>Weeks pass. Your strength grows. Your endurance improves. You can march longer. Fight harder. Last when others fall. The sergeant notices. "You've got the body for this. Now you need the mind. The discipline. The will."</p>
                   <p>You're becoming something more than a field hand. Something more than a recruit. You're becoming a soldier.</p>`;
        },
        choices: [
            {
                text: "Challenge stronger recruits to sparring matches",
                effects: { stress: 1 },
                nextScene: "training_conditioning_resolve",
                requiresResolution: true,
                resolutionStat: "strength",
                resolutionDifficulty: 10
            },
            {
                text: "Help weaker recruits with their training",
                effects: { stress: 1 },
                nextScene: "training_conditioning_resolve",
                requiresResolution: true,
                resolutionStat: "endurance",
                resolutionDifficulty: 9
            },
            {
                text: "Focus on perfecting your technique",
                effects: { stress: 1 },
                nextScene: "training_conditioning_resolve",
                requiresResolution: true,
                resolutionStat: "agility",
                resolutionDifficulty: 10
            }
        ]
    },
    training_comrades: {
        title: "Brothers in Arms",
        year: 1337,
        age: function() { return gameState.age || 18; },
        location: "England",
        artwork: "artwork/campfire.jpg",
        artworkCaption: "Evenings around the fire - bonds forged in training",
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>Months pass. You've formed bonds with your fellow recruits. Will, the quick-witted man from the weapon drills. John, a former manor retainer who knows the ways of service. And others—men from all walks of life, united by the call to arms.</p>
                   <p>Evenings are spent around the fire, sharing stories, mending gear, and learning from each other. You discover that your field experience gives you insights others lack. You understand weather. Terrain. The importance of proper rest and food.</p>
                   <p>"You're not like the others," Will says one night. "You don't talk about glory. You talk about survival. That's smart. That's what keeps men alive."</p>
                   <p>Your comrades respect your endurance. Your practical knowledge. Your willingness to help. You're becoming part of something—a unit. A brotherhood. Something that matters.</p>`;
        },
        choices: [
            {
                text: "Share your knowledge of fieldcraft and survival",
                effects: { stress: 1 },
                nextScene: "training_comrades_resolve",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 9
            },
            {
                text: "Learn tactics and strategy from experienced soldiers",
                effects: { stress: 1 },
                nextScene: "training_comrades_resolve",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 10
            },
            {
                text: "Focus on building trust and camaraderie",
                effects: { stress: 1 },
                nextScene: "training_comrades_resolve",
                requiresResolution: true,
                resolutionStat: "charisma",
                resolutionDifficulty: 9
            }
        ]
    },
    training_final_assessment: {
        title: "Final Assessment",
        year: 1338,
        age: function() { return (gameState.age || 18) + 1; },
        location: "England",
        artwork: "artwork/training.png",
        artworkCaption: "The assessment - a year of training comes to an end",
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>A year has passed. The training is complete. The sergeant calls you before the assembled men.</p>
                   <p>"You came here a field hand," he says. "You leave here a soldier. Not a great one. Not yet. But a soldier. You've learned discipline. Endurance. The basics of war. The rest, you'll learn in battle. Or you won't. That's up to you."</p>
                   <p>Your lord's banner flies above the training yard. The call has come. The French are raiding the coast, burning villages, taking what they want. Your lord prepares to respond. To fight. To defend what's yours.</p>
                   <p>You've trained. You've learned. You've become something more than you were. But training is one thing. Battle is another. The real test approaches. The test that matters. The test that determines who lives and who dies.</p>
                   <p>Your first campaign begins now.</p>`;
        },
        onEnter: function() {
            applyStatChange('experience', 15);
            gameState.career.trainingComplete = true;
        },
        choices: [
            {
                text: "Volunteer for the vanguard",
                effects: { strength: 1, reputation: 1 },
                nextScene: "first_battle_brave"
            },
            {
                text: "Stay with the main force",
                effects: { endurance: 1 },
                nextScene: "first_battle_cautious"
            }
        ]
    },
    training_weapons_resolve: {
        title: "Weapon Training",
        year: 1337,
        age: function() { return gameState.age || 18; },
        location: "England",
        artwork: "artwork/blacksmith.jpg",
        artworkCaption: "The training yard - learning the weight of steel",
        text: function() {
            const result = gameState.lastResolution;
            if (!result) return `<p>The weapon training continues. Your arms ache. Your hands blister. But you keep going. Because you have to. Because there's no other choice.</p>`;
            
            const difficulty = result.baseDifficulty || 10;
            const neededRoll = difficulty - result.effectiveStat;
            const successChance = Math.max(0, Math.min(100, ((10 - neededRoll + 1) / 10) * 100));
            
            const rollDisplay = `<div class="dice-roll">
                <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
                <br><em>Chance to succeed: ${Math.round(successChance)}%</em>
                <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
            </div>`;
            
            if (result.success) {
                return `${rollDisplay}<p>You push through the exhaustion. The pain. The doubt. Your dedication pays off. The weapon master notices your improvement. "You're getting it," Thomas says. "Not many do. Most give up. You didn't. That matters."</p>
                       <p>Your technique improves. Your confidence grows. You're becoming more than a field hand with a sword. You're becoming a soldier who knows how to fight.</p>`;
            } else {
                return `${rollDisplay}<p>The training is brutal. Exhausting. You push yourself too hard. Your body rebels. Your technique suffers. The weapon master shakes his head. "You're trying too hard. Too fast. Slow down. Learn the basics. Master them. Then move on."</p>
                       <p>You've learned a hard lesson. Training isn't about pushing until you break. It's about steady progress. About building foundations. You'll need to work harder. Smarter. If you want to survive what's coming.</p>`;
            }
        },
        onEnter: function() {
            const result = gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('strength', 1);
                applyStatChange('agility', 1);
                applyStatChange('experience', 5);
            } else if (result) {
                applyStatChange('stress', 1);
                applyStatChange('experience', 2);
            }
        },
        choices: [
            {
                text: "Continue training",
                effects: {},
                nextScene: "training_comrades"
            }
        ]
    },
    training_formation_resolve: {
        title: "Formation and Discipline",
        year: 1337,
        age: function() { return gameState.age || 18; },
        location: "England",
        artwork: "artwork/training.png",
        artworkCaption: "Drills and discipline - learning to move as one",
        text: function() {
            const result = gameState.lastResolution;
            if (!result) return `<p>The formation drills continue. You learn to move as one. To hold your position. To trust the man beside you.</p>`;
            
            const difficulty = result.baseDifficulty || 9;
            const neededRoll = difficulty - result.effectiveStat;
            const successChance = Math.max(0, Math.min(100, ((10 - neededRoll + 1) / 10) * 100));
            
            const rollDisplay = `<div class="dice-roll">
                <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
                <br><em>Chance to succeed: ${Math.round(successChance)}%</em>
                <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
            </div>`;
            
            if (result.success) {
                return `${rollDisplay}<p>You excel in the drills. Your discipline shows. Your understanding deepens. The sergeant takes notice. "You've got the mind for this," he says. "Most men fight for themselves. You fight for the unit. That's what makes a soldier. That's what keeps men alive."</p>
                       <p>Your reputation grows among the recruits. They see your dedication. Your skill. Your willingness to help. You're becoming a leader. Not by birth. Not by name. But by action. By example.</p>`;
            } else {
                return `${rollDisplay}<p>The drills are harder than you expected. The formations are complex. The discipline is harsh. You struggle. Make mistakes. The sergeant's patience wears thin. "You're thinking too much. Or not enough. I can't tell which. But you need to figure it out. Fast."</p>
                       <p>You've learned that discipline isn't just about following orders. It's about understanding. About becoming part of something larger. You'll need to work harder. Focus more. If you want to be ready for what's coming.</p>`;
            }
        },
        onEnter: function() {
            const result = gameState.lastResolution;
            if (result && result.success) {
                if (result.resolutionStat === 'charisma') {
                    applyStatChange('charisma', 1);
                    applyStatChange('reputation', 1);
                } else if (result.resolutionStat === 'wits') {
                    applyStatChange('wits', 1);
                    applyStatChange('endurance', 1);
                } else {
                    applyStatChange('strength', 1);
                    applyStatChange('agility', 1);
                }
                applyStatChange('experience', 5);
            } else if (result) {
                applyStatChange('stress', 1);
                applyStatChange('experience', 2);
            }
        },
        choices: [
            {
                text: "Continue training",
                effects: {},
                nextScene: "training_comrades"
            }
        ]
    },
    training_conditioning_resolve: {
        title: "Physical Conditioning",
        year: 1337,
        age: function() { return gameState.age || 18; },
        location: "England",
        artwork: "artwork/march.jpg",
        artworkCaption: "Pushing past limits - building strength and endurance",
        text: function() {
            const result = gameState.lastResolution;
            if (!result) return `<p>You push yourself harder. Running. Lifting. Sparring until you can barely stand.</p>`;
            
            const difficulty = result.baseDifficulty || 10;
            const neededRoll = difficulty - result.effectiveStat;
            const successChance = Math.max(0, Math.min(100, ((10 - neededRoll + 1) / 10) * 100));
            
            const rollDisplay = `<div class="dice-roll">
                <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
                <br><em>Chance to succeed: ${Math.round(successChance)}%</em>
                <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
            </div>`;
            
            if (result.success) {
                return `${rollDisplay}<p>You push past your limits. Your body screams. But you keep going. And something changes. You break through. Your strength increases. Your endurance improves. You can do more. Last longer. Fight harder.</p>
                       <p>The sergeant watches with approval. "You've got the body for this. The will. Most men quit when it gets hard. You didn't. That's what separates soldiers from corpses."</p>
                       <p>You're becoming stronger. Harder. More capable. The training is working. You're becoming what you need to be.</p>`;
            } else {
                return `${rollDisplay}<p>You push too hard. Too fast. Your body breaks before your will does. You overextend. Pull a muscle. Strain something. The pain is sharp. Immediate. Real.</p>
                       <p>The sergeant shakes his head. "You've got heart. But heart without sense gets men killed. Learn your limits. Respect them. Then push them. Slowly. Steadily. That's how you get stronger. Not by breaking yourself."</p>
                       <p>You've learned a painful lesson. Training is about building. Not breaking. You'll need to be smarter. More careful. If you want to be ready.</p>`;
            }
        },
        onEnter: function() {
            const result = gameState.lastResolution;
            if (result && result.success) {
                if (result.resolutionStat === 'strength') {
                    applyStatChange('strength', 1);
                    applyStatChange('reputation', 1);
                } else if (result.resolutionStat === 'endurance') {
                    applyStatChange('charisma', 1);
                    applyStatChange('endurance', 1);
                } else {
                    applyStatChange('agility', 1);
                    applyStatChange('wits', 1);
                }
                applyStatChange('experience', 5);
            } else if (result) {
                addCondition('Strained', 'negative', 1);
                applyStatChange('stress', 1);
                applyStatChange('experience', 2);
            }
        },
        choices: [
            {
                text: "Continue training",
                effects: {},
                nextScene: "training_comrades"
            }
        ]
    },
    training_comrades_resolve: {
        title: "Brothers in Arms",
        year: 1337,
        age: function() { return gameState.age || 18; },
        location: "England",
        text: function() {
            const result = gameState.lastResolution;
            if (!result) return `<p>You spend time with your comrades. Sharing stories. Learning from each other.</p>`;
            
            const difficulty = result.baseDifficulty || 9;
            const neededRoll = difficulty - result.effectiveStat;
            const successChance = Math.max(0, Math.min(100, ((10 - neededRoll + 1) / 10) * 100));
            
            const rollDisplay = `<div class="dice-roll">
                <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
                <br><em>Chance to succeed: ${Math.round(successChance)}%</em>
                <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
            </div>`;
            
            if (result.success) {
                if (result.resolutionStat === 'wits') {
                    return `${rollDisplay}<p>Your knowledge proves valuable. Your insights help your comrades. They listen. Learn. Remember. You've earned their respect. Their trust. Their friendship.</p>
                           <p>"You know things," Will says. "Things that matter. Things that keep men alive. That's worth more than strength. More than skill. That's worth everything."</p>
                           <p>You've become more than a recruit. You've become a valued member of the unit. Someone others look to. Someone they trust. That matters. That will help when the real fighting begins.</p>`;
                } else {
                    return `${rollDisplay}<p>You build bonds. Real bonds. The kind that matter. The kind that last. Your comrades trust you. Respect you. They know you'll have their backs. And you know they'll have yours.</p>
                           <p>"You're one of us now," John says. "Not just a recruit. Not just a soldier. One of us. That means something. That matters."</p>
                           <p>You've found your place. Your people. Your brothers. That's worth more than training. More than skill. That's what keeps men alive. What makes them fight. What makes them win.</p>`;
                }
            } else {
                return `${rollDisplay}<p>You try to connect. To share. To learn. But something doesn't click. You're still an outsider. Still separate. Still alone in a crowd of men.</p>
                       <p>"You're trying too hard," Will says. "Or not hard enough. I can't tell. But you need to figure it out. We're going to war. We need to trust each other. To know each other. To be a unit. Not just individuals."</p>
                       <p>You've learned that camaraderie isn't forced. It's earned. Built. Over time. Through action. Through trust. You'll need to work on that. If you want to survive. If you want to belong.</p>`;
            }
        },
        onEnter: function() {
            const result = gameState.lastResolution;
            if (result && result.success) {
                if (result.resolutionStat === 'wits') {
                    applyStatChange('wits', 1);
                    if (result.difficulty === 10) {
                        applyStatChange('reputation', 1);
                    }
                    applyStatChange('charisma', 1);
                } else {
                    applyStatChange('charisma', 1);
                    applyStatChange('morale', 1);
                }
                applyStatChange('experience', 5);
            } else if (result) {
                applyStatChange('stress', 1);
                applyStatChange('experience', 2);
            }
        },
        choices: [
            {
                text: "Continue to final assessment",
                effects: {},
                nextScene: "training_final_assessment"
            }
        ]
    },
    training_manor_retainer: {
        title: "Service and Duty",
        year: 1338,
        age: function() { return (gameState.age || 18) + 1; },
        location: "England",
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>Your service on the manor has prepared you for this. You understand the bonds of fealty and duty, and your strength from years of labor serves you well.</p>
                   <p>After months of training, your first campaign approaches. The French are raiding the coast, and your lord prepares to respond.</p>`;
        },
        choices: [
            {
                text: "Serve faithfully in the ranks",
                effects: { charisma: 1, patronFavor: 1 },
                nextScene: "first_battle_cautious"
            },
            {
                text: "Prove your worth in the front",
                effects: { strength: 1, reputation: 1 },
                nextScene: "first_battle_brave"
            }
        ]
    },
    training_craftsman_apprentice: {
        title: "A Craftsman's War",
        year: 1338,
        age: function() { return (gameState.age || 18) + 1; },
        location: "England",
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>Your time as an apprentice has sharpened your wits and agility. You see problems others miss and can repair what others break.</p>
                   <p>After months of training, your first campaign approaches. The French are raiding the coast, and your lord prepares to respond.</p>`;
        },
        choices: [
            {
                text: "Use your skills to help the camp",
                effects: { wits: 1, patronFavor: 1 },
                nextScene: "first_battle_tactical"
            },
            {
                text: "Focus on combat training",
                effects: { strength: 1, agility: 1 },
                nextScene: "first_battle_brave"
            }
        ]
    },
    training_squire: {
        title: "A Knight's Service",
        year: 1338,
        age: function() { return (gameState.age || 18) + 1; },
        location: "England",
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>Your service as a squire has given you martial training and access to better gear. Your knight's reputation follows you, for good or ill.</p>
                   <p>After months of training, your first campaign approaches. The French are raiding the coast, and your lord prepares to respond.</p>`;
        },
        choices: [
            {
                text: "Lead a small unit",
                effects: { reputation: 2, strength: 1 },
                nextScene: "first_battle_leader"
            },
            {
                text: "Prove yourself in the front ranks",
                effects: { strength: 1, morale: 1 },
                nextScene: "first_battle_brave"
            }
        ]
    },
    training_minor_noble: {
        title: "Noble Expectations",
        year: 1338,
        age: function() { return (gameState.age || 18) + 1; },
        location: "England",
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>As a minor noble, much is expected of you. Your education and political connections give you advantages, but errors carry greater weight.</p>
                   <p>After months of training, your first campaign approaches. The French are raiding the coast, and your lord expects you to lead the response.</p>`;
        },
        choices: [
            {
                text: "Lead a small unit",
                effects: { reputation: 2, strength: 1 },
                nextScene: "first_battle_leader"
            },
            {
                text: "Prove yourself in the front ranks",
                effects: { strength: 1, morale: 1 },
                nextScene: "first_battle_brave"
            }
        ]
    },
    training_peasant: {
        title: "Training Begins",
        year: 1338,
        age: function() { return gameState.age; },
        location: "England",
        text: `<p>You've joined a lord's retinue. The training is harsh. Brutal. Endless. But you're used to hard work. The fields taught you that. Taught you endurance. Taught you to keep going when everything hurts. When nothing matters but survival.</p>
               <p>Months pass. Training. Drilling. Learning the ways of war. The ways of death. The ways of survival. Your endurance serves you well. Your strength grows. Your skill sharpens. You're ready. Or think you are. For what comes next.</p>
               <p>Your first campaign approaches. The French are raiding the coast. The villages. Your lord prepares to respond. To fight. You'll be part of it. Whether you want to be or not. Whether you're ready or not. That's how it works. In war. In life.</p>`,
        choices: [
            {
                text: "Volunteer for the vanguard",
                effects: { strength: 1, reputation: 1 },
                nextScene: "first_battle_brave"
            },
            {
                text: "Stay with the main force",
                effects: { endurance: 1 },
                nextScene: "first_battle_cautious"
            }
        ]
    },
    training_merchant: {
        title: "A Different Path",
        year: 1338,
        age: function() { return gameState.age; },
        location: "England",
        text: `<p>Your family's wealth has secured you better equipment. Better armor. Better weapons. And education. Books. Learning. Tactics. Strategy. The ways of war. The ways of thinking. You understand tactics better than most. Better than the peasants. Better than the common soldiers. But understanding isn't always enough.</p>
               <p>Your first campaign approaches. The French are raiding the coast. The villages. Your lord prepares to respond. To fight. You'll be part of it. Whether you want to be or not. Whether you're ready or not. That's how it works. But you have advantages. Education. Equipment. Tactics. They might help. Might save you. Or might not. In war, nothing is certain.</p>`,
        choices: [
            {
                text: "Suggest a tactical approach",
                effects: { charisma: 1, reputation: 2 },
                nextScene: "first_battle_tactical"
            },
            {
                text: "Follow orders like everyone else",
                effects: { strength: 1 },
                nextScene: "first_battle_cautious"
            }
        ]
    },
    training_noble: {
        title: "Noble Expectations",
        year: 1338,
        age: function() { return gameState.age; },
        location: "England",
        text: `<p>As a noble's son, much is expected of you. By your family. By your lord. By everyone. Your reputation precedes you. Your name. Your blood. But so do the expectations. The pressure. The weight of being noble. Of being better. Of being more than common men. But you're not. Not really. Not yet. Maybe never. But you have to try. Have to become what they expect.</p>
               <p>Your first campaign approaches. The French are raiding the coast. The villages. Your lord expects you to lead. To command. The pressure is real. The weight is heavy. You'll be part of it. Whether you want to be or not. Whether you're ready or not. That's how it works. But you have advantages. Name. Reputation. Training. They might help. Might save you. Or might not. In war, nothing is certain.</p>`,
        choices: [
            {
                text: "Lead a small unit",
                effects: { reputation: 2, strength: 1 },
                nextScene: "first_battle_leader"
            },
            {
                text: "Prove yourself in the front ranks",
                effects: { strength: 2, endurance: -1 },
                nextScene: "first_battle_brave"
            }
        ]
    }
    });
})();
