(function() {
    'use strict';
    
    if (typeof window.scenes === 'undefined') {
        window.scenes = {};
    }
    
    Object.assign(window.scenes, {
    winter_quarters: {
        title: "Winter Quarters",
        year: 1340,
        age: function() { return window.gameState.age; },
        location: "Northern France",
        artwork: "artwork/drunkfire.jpg",
        artworkCaption: "Winter in the camp - a moment of rest",
        text: function() {
            const pay = Math.floor(5 + gameState.stats.reputation / 5);
            return `<p>The war has quieted for the winter. You're billeted in a small village. Your pay arrives: ${pay} silver coins.</p>
                   <p>The local blacksmith's daughter, Marie, has been bringing you food. She's pretty, and you've noticed she's been making eyes at you. Your comrades joke about settling down. They laugh. You don't understand why. Not yet.</p>`;
        },
        choices: [
            {
                text: "Court Marie seriously",
                effects: { charisma: 1 },
                nextScene: "marriage_joke"
            },
            {
                text: "Keep it casual",
                effects: {},
                nextScene: "between_years_1341"
            },
            {
                text: "Focus on training",
                effects: { strength: 1, agility: 1 },
                nextScene: "between_years_1341"
            },
            {
                text: "Spend coin on better equipment",
                effects: { wealth: -10 },
                nextScene: "equipment_upgrade_1340"
            }
        ],
        onEnter: function() {
            // Grant winter pay
            const pay = Math.floor(5 + gameState.stats.reputation / 5);
            applyStatChange('wealth', pay);
            // Rest reduces stress
            applyStatChange('stress', -2);
        }
    },
    equipment_upgrade_1340: {
        title: "Better Gear",
        year: 1340,
        age: function() { return window.gameState.age; },
        location: "Northern France",
        artwork: "artwork/blacksmith.jpg",
        artworkCaption: "The forge glows - hammer on steel, like a heartbeat",
        text: `<p>The blacksmith's forge glows. Hot. Bright. The sound of hammer on steel rings. Steady. Rhythmic. Like a heartbeat. Like war.</p>
               <p>You invest. Coins on the table. Metal in your hands. A sturdier sword. Reinforced leather. Better gear. Better protection. Better chance of survival. Of victory. Of living through the next fight. The next battle.</p>
               <p>Your gear quality improves. The weight feels different. The balance. The confidence. This will serve you well. In future battles. In future dangers. In everything that comes.</p>`,
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "between_years_1341"
            }
        ],
        onEnter: function() {
            const sceneKey = `equipment_upgrade_1340_${gameState.year}`;
            if (!gameState.enteredScenes.has(sceneKey)) {
                // Add equipment to inventory
                if (!gameState.inventory) gameState.inventory = [];
                
                // Add mail haubergeon if not already in inventory
                if (!gameState.inventory.find(i => i.id === 'mail_haubergeon')) {
                    gameState.inventory.push({
                        id: 'mail_haubergeon',
                        condition: 85,
                        fit: 'off-the-rack',
                        stackCount: 1
                    });
                    showNotification('Equipment Acquired', 'You purchased a Mail Haubergeon!');
                }
                
                // Old format compatibility - use adapter
                if (gameState.equipment && gameState.equipment.weapon) {
                    setEquipmentQuality('weapon', 1);
                }
                // Note: 'armor' slot doesn't exist in new format, map to 'torso'
                if (gameState.equipment && gameState.equipment.armor) {
                    setEquipmentQuality('armor', 1);
                } else if (gameState.equipment && gameState.equipment.torso) {
                    // For new format, set torso quality if needed
                    const currentQuality = getEquipmentQuality('torso');
                    if (currentQuality === 0) {
                        setEquipmentQuality('torso', 1);
                    }
                }
                
                gameState.enteredScenes.add(sceneKey);
            }
        }
    },
    between_years_1341: {
        title: "The Years Pass",
        year: 1341,
        age: function() { return window.gameState.age; },
        location: "Northern France",
        artwork: "artwork/campfire.jpg",
        artworkCaption: "The years blur - seasons into months, months into days",
        text: function() {
            let base = `<p>Winter quarters. Spring campaign. Summer raids. The rhythm becomes familiar. Predictable almost. You march. You fight. You survive. The years blur into seasons. Seasons into months. Months into days.</p>
               <p>You've learned the patterns. When to push forward. When to hold back. When to keep your head down. Your lord notices. Your comrades trust you. Experience is the only teacher that matters.</p>
               <p>But each season takes something. A friend. A piece of yourself. The man you were fades. The man you're becoming takes shape. Harder. Colder. More careful.</p>`;
            if (window.hasFlag('Heartbroken')) {
                const response = window.gameState.flags.MarieResponse;
                if (response === 'silence') {
                    base += `<p>You still think of Marie sometimes. Of the silence you chose. Of the words you swallowed. It's easier now. The sting has faded to a dull ache. But on winter nights, when the fire burns low and the camp is quiet, you remember. And you wonder if silence was strength or cowardice.</p>`;
                } else if (response === 'confrontation') {
                    base += `<p>Marie's face still flashes unbidden. The anger you showed. The words you spat. They didn't change anything — she still laughed, the others still mocked — but you said what needed saying. The memory burns less now. Almost. On some nights you even believe you've let it go.</p>`;
                } else {
                    base += `<p>You laughed with them. Pretended it was nothing. Sometimes you almost believe it was. But at night, when the mask slips, you feel it. That hollow place where hope used to be. You've learned to fill it with drink, or duty, or the simple exhaustion of soldiering.</p>`;
                }
            }
            return base;
        },
        choices: [
            {
                text: "Drill relentlessly — become sharper",
                effects: { experience: 25, combat: 1 },
                nextScene: "between_years_1342"
            },
            {
                text: "Carouse with the lads — keep your spirits up",
                effects: { experience: 15, stress: -2, morale: 2 },
                nextScene: "between_years_1342"
            },
            {
                text: "Curry favour with your lord",
                effects: { experience: 15, patronFavor: 2, reputation: 1 },
                nextScene: "between_years_1342"
            }
        ],
        onEnter: function() {
            // Annual upkeep: equipment maintenance, food, etc.
            const upkeep = 2;
            if (gameState.stats.wealth >= upkeep) {
                applyStatChange('wealth', -upkeep, {silent: true});
                showNotification('Upkeep', `You spend ${formatCurrency(upkeep)} on gear maintenance and provisions.`, 'info');
            } else {
                showNotification('Broke', 'You cannot afford upkeep. Your gear degrades.', 'warning');
                applyStatChange('combat', -1, {silent: true});
            }
        }
    },
    between_years_1342: {
        title: "Rising Through the Ranks",
        year: 1342,
        age: function() { return window.gameState.age; },
        location: "Northern France",
        text: `<p>The captain calls you forward. Five men. That's what you get. Five faces looking to you for orders. For decisions. For leadership you're not sure you have.</p>
               <p>But you've earned this. Through service. Through survival. Through doing what needed doing when others wouldn't. The pay is better. Not much. But better. The responsibility is heavier. Much heavier.</p>
               <p>You look at your men. They look back. Waiting. Trusting. Or pretending to. Either way, they're yours now. Their lives. Their deaths. That weight settles on you. You carry it. Because you have to.</p>`,
        choices: [
            {
                text: "Drill your men hard — earn their respect",
                effects: { experience: 20, combat: 1, reputation: 2 },
                nextScene: "between_years_1343"
            },
            {
                text: "Look after them — build loyalty",
                effects: { experience: 15, morale: 2, wealth: 3 },
                onChoose: function() { changeRel('Wat', 1); },
                nextScene: "between_years_1343"
            },
            {
                text: "Focus on keeping coin flowing in",
                effects: { wealth: 8, reputation: 1, experience: 10 },
                nextScene: "between_years_1343"
            }
        ],
        onEnter: function() {
            // Promotion check
            if (gameState.stats.patronFavor >= 3 && gameState.rank === "Common Soldier") {
                gameState.rank = "Sergeant";
                gameState.career.promotions++;
                showNotification('Promotion!', 'You have been promoted to Sergeant!');
            }
            // Annual upkeep
            const upkeep = 3;
            if (gameState.stats.wealth >= upkeep) {
                applyStatChange('wealth', -upkeep, {silent: true});
                showNotification('Upkeep', `You spend ${formatCurrency(upkeep)} on gear and provisions.`, 'info');
            } else {
                showNotification('Broke', 'You cannot afford upkeep. Your gear degrades.', 'warning');
                applyStatChange('combat', -1, {silent: true});
            }
        }
    },
    between_years_1343: {
        title: "Minor Campaigns",
        year: 1343,
        age: function() { return window.gameState.age; },
        location: "Northern France",
        noCampfire: true, // Prevent campfire insertion before location transition
        text: `<p>Raids. Skirmishes. Patrols. The French come. You respond. They retreat. You advance. It's become routine. Almost comfortable. Almost.</p>
               <p>But routine doesn't mean safe. You've seen men die from arrows. From disease. From a horse that stumbled. From a blade that found a gap. From nothing at all. Just bad luck. Just being in the wrong place at the wrong time.</p>
               <p>Each death teaches you something. Each year makes you more careful. Or more resigned. You can't tell which anymore. Maybe both. Maybe that's what survival means. Learning to accept what you can't change. Learning to change what you can.</p>`,
        choices: [
            {
                text: "Take every fight offered — hone your edge",
                effects: { experience: 20, combat: 1, stress: 1 },
                nextScene: "return_to_england_1344"
            },
            {
                text: "Keep your head down — survive",
                effects: { experience: 10, endurance: 1, stress: -1 },
                nextScene: "return_to_england_1344"
            },
            {
                text: "Learn from the veterans around you",
                effects: { experience: 15, wits: 1 },
                onChoose: function() { changeRel('Wat', 1); },
                nextScene: "return_to_england_1344"
            }
        ],
        onEnter: function() {
            const upkeep = 3;
            if (gameState.stats.wealth >= upkeep) {
                applyStatChange('wealth', -upkeep, {silent: true});
                showNotification('Upkeep', `You spend ${formatCurrency(upkeep)} on gear and provisions.`, 'info');
            } else {
                showNotification('Broke', 'You cannot afford upkeep. Your gear degrades.', 'warning');
                applyStatChange('combat', -1, {silent: true});
            }
        }
    },
    return_to_england_1344: {
        title: "The Journey Home",
        year: 1344,
        age: function() { return window.gameState.age; },
        location: "At Sea / England",
        noCampfire: true,
        text: function() {
            const region = gameState.culture || 'England';
            const regionNote = (region && region !== 'England') ? `<p>You think of ${region}. Of home. Of the life you left behind. It feels further away than France ever did.</p>` : '';
            return `<p>The campaign in Northern France ends. Not with victory. Not with defeat. Just... done. Orders come down. Your unit is being rotated home. Back to England. Back to waiting.</p>
               <p>The crossing is rough. Cold. Wet. Men huddle below decks. Above, the sea churns. You've seen worse. But that doesn't make it easier. Just familiar. Just another thing to endure.</p>
               <p>When land appears—the white cliffs of Dover—you feel something. Relief? Maybe. Or just the weight of what comes next. Because you know. This isn't peace. This is preparation. Something bigger is coming. You can feel it in the air. In the way officers talk. In the way men look at maps.</p>
               <p>You're home. But not for long.</p>${regionNote}`;
        },
        choices: [
            {
                text: "Visit your kin — see what's left of home",
                effects: { stress: -3, morale: 2 },
                onChoose: function() { setFlag('visitedKin', true); },
                nextScene: "between_years_1344"
            },
            {
                text: "Stay in a tavern — drink and forget",
                effects: { stress: -2, morale: 1 },
                nextScene: "between_years_1344"
            },
            {
                text: "Remain in camp — this is your home now",
                effects: { experience: 10, endurance: 1 },
                onChoose: function() { changeRel('Wat', 1); },
                nextScene: "between_years_1344"
            }
        ]
    },
    between_years_1344: {
        title: "The Calm Before the Storm",
        year: 1344,
        age: function() { return window.gameState.age; },
        location: "England",
        text: `<p>Rumors. Always rumors. But these feel different. More urgent. More real. King Edward is gathering men. Real men. Real armies. Not the small bands you've been fighting with. Something big is coming.</p>
               <p>You hear it in taverns. In camps. In the way officers talk. Something is being planned. Something that will change everything. The war. Your life. The way you think about what you do.</p>
               <p>You prepare. Check your gear. Sharpen your blade. Say your prayers. Because you know. This won't be a skirmish. This won't be routine. This will be real. This will be history. And you'll be part of it. Whether you want to be or not.</p>`,
        choices: [
            {
                text: "Train obsessively — be ready for what's coming",
                effects: { combat: 1, endurance: 1, stress: 1 },
                nextScene: "between_years_1345"
            },
            {
                text: "Enjoy England while you can — drink, rest, live",
                effects: { stress: -3, morale: 2 },
                nextScene: "between_years_1345"
            },
            {
                text: "Invest in better equipment",
                effects: function(gs) { applyStatChange('wealth', -5, {silent:true}); },
                onChoose: function() {
                    if (gameState.stats.wealth >= 5) {
                        showNotification('Equipment', 'You purchase a good gambeson and new boots.', 'info');
                        if (!gameState.equipment) gameState.equipment = {};
                        gameState.equipment.gambeson = true;
                    } else {
                        showNotification('Too Poor', 'You cannot afford proper equipment.', 'warning');
                    }
                },
                nextScene: "between_years_1345"
            }
        ],
        onEnter: function() {
            const upkeep = 2;
            if (gameState.stats.wealth >= upkeep) {
                applyStatChange('wealth', -upkeep, {silent: true});
            } else {
                showNotification('Broke', 'You cannot afford upkeep. Your gear degrades.', 'warning');
                applyStatChange('combat', -1, {silent: true});
            }
        }
    },
    between_years_1345: {
        title: "Final Preparations",
        year: 1345,
        age: function() { return window.gameState.age; },
        location: "England",
        artwork: "artwork/march.jpg",
        artworkCaption: "The king's army gathers - final preparations",
        text: `<p>King Edward's army gathers. You check your equipment one last time.</p>
               <p>Preparations intensify. The king's plans are taking shape. A major campaign is being planned, but timing remains uncertain. The biggest campaign of your life awaits—when the orders finally come.</p>`,
        choices: [
            {
                text: "Wait for orders",
                effects: {},
                nextScene: "campaign_delayed_1345"
            }
        ]
    },
    campaign_delayed_1345: {
        title: "Waiting",
        year: 1345,
        age: function() { return window.gameState.age; },
        location: "England",
        artwork: "artwork/campfire.jpg",
        artworkCaption: "Tomorrow never comes - waiting for orders",
        text: `<p>Tomorrow never comes.</p>
               <p>Orders change. Plans shift. The king's attention turns elsewhere. A diplomatic mission. A border dispute. Something always comes up. Something that matters more than your unit. More than your plans.</p>
               <p>You wait. Train. Drill. Check your gear again. And again. Because you know. When it comes, it will come fast. No warning. No time to prepare. Just orders. Just movement. Just war.</p>
               <p>Months pass. Seasons change. The promise of France hangs in the air. Unfulfilled. Unforgotten. Just... waiting.</p>
               <p>Then spring arrives. And with it, new orders. Real orders. This time, it's different. This time, it's real.</p>`,
        choices: [
            {
                text: "The call comes",
                effects: {},
                nextScene: "spring_campaign"
            }
        ]
    },
    marriage_joke: {
        title: "The Joke",
        year: 1340,
        age: function() { return window.gameState.age; },
        location: "Northern France",
        artwork: "artwork/blacksmith.jpg",
        artworkCaption: "The blacksmith's daughter - a winter's cruel joke",
        text: `<p>You approach Marie. Speak to her. Tell her how you feel. What you want. What you hope for. She listens. Smiles. Nods. But there's something in her eyes. Something you don't see. Not yet.</p>
               <p>Her father watches. The blacksmith. Big man. Hard hands. He laughs. Not at you. With you. Or so you think. He approves. Offers his daughter's hand. You're happy. Proud. Foolish.</p>
               <p>Then you hear it. The laughter. Your comrades. Behind you. Around you. Everywhere. They're laughing. At you. At the joke. At everything you believed. Everything you hoped for.</p>
               <p>Marie laughs too. Not the kind laugh you thought. The cruel one. The mocking one. The one that cuts deeper than any blade. She was never interested. Never serious. It was all a game. A joke. A way to pass the winter. To amuse themselves. At your expense.</p>
               <p>You're a fool. A mark. A story they'll tell for years. The soldier who thought a blacksmith's daughter would marry him. Who thought he was special. Who thought he mattered. You don't. Not to them. Not to her. Not to anyone.</p>`,
        choices: [
            {
                text: "Walk away in silence",
                effects: { stress: 3, morale: -2 },
                onChoose: function() { window.setFlag('Heartbroken', true); window.setFlag('MarieResponse', 'silence'); },
                nextScene: "between_years_1341"
            },
            {
                text: "Confront them",
                effects: { stress: 2, reputation: -1 },
                onChoose: function() { window.setFlag('Heartbroken', true); window.setFlag('MarieResponse', 'confrontation'); },
                nextScene: "between_years_1341"
            },
            {
                text: "Laugh with them, pretend it doesn't hurt",
                effects: { stress: 4, morale: -1 },
                onChoose: function() { window.setFlag('Heartbroken', true); window.setFlag('MarieResponse', 'laughed'); },
                nextScene: "between_years_1341"
            }
        ]
    },
    // ============================================================================
    // COMBAT ENCOUNTERS - Batch 1: Forest Ambush & Siege Defense
    // ============================================================================
    forest_ambush_1340: {
        title: "Ambush in the Woods",
        year: 1340,
        age: function() { return window.gameState.age; },
        location: "Northern France",
        artwork: "artwork/battle-scene-2.jpg",
        artworkCaption: "French archers emerge from the trees",
        text: `<p>The forest goes still the wrong way. No birds. No chatter. Just boots on leaf-mold and the small clink of mail. Men keep walking anyway. Because marching is what you do until it isn't.</p>
               <p>An arrow hits the man beside you. He drops like his knees were cut out. Someone shouts. Then there's more arrows. French archers in the trees. Close. Higher than you. Hard to see until they move.</p>
               <p>Soot-Eyed Billy hisses, "Left side. Up. Don't bunch." He's already backing toward a trunk, eyes on the canopy.</p>
               <p>Fiddle Jack ducks low, gripping his bow like he wants to wring it. "I can't see them. I can hear them," he says, breath fast.</p>
               <p>Granny Six-Teeth is behind the line with the baggage, voice sharp as any captain's. "Heads down. If you stand there like a post, you'll get used like one."</p>
               <p>You're in the open. Leaves jump with impacts. Men shout names. Some stop shouting. You have a few heartbeats to pick a way through it.</p>`,
        choices: [
            {
                text: "Charge the archers in the trees",
                effects: {},
                nextScene: "forest_ambush_1340_resolve",
                requiresResolution: true,
                resolutionStat: "strength",
                resolutionDifficulty: 8
            },
            {
                text: "Take cover and return fire",
                effects: {},
                nextScene: "forest_ambush_1340_resolve",
                requiresResolution: true,
                resolutionStat: "agility",
                resolutionDifficulty: 7
            },
            {
                text: "Lead a retreat to better ground",
                effects: {},
                nextScene: "forest_ambush_1340_resolve",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 7
            }
        ]
    },
    forest_ambush_1340_resolve: {
        title: "After the Ambush",
        year: 1340,
        age: function() { return window.gameState.age; },
        location: "Northern France",
        artwork: "artwork/battle-aftermath.jpg",
        artworkCaption: "The forest settles - men breathe hard, someone coughs",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>The forest settles back down like it didn't do anything. Men breathe hard. Someone coughs and won't stop.</p>`;

            const rollDisplay = `<div class="dice-roll">
                <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
                <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
            </div>`;

            if (result.success) {
                return `${rollDisplay}
                    <p>You move when others freeze. You get under wood and root and shadow. You put steel where it needs to go, or you put arrows back into the trees until the shooting falters.</p>
                    <p>Billy points with two fingers. "There. One more." He's calm, like this is work he's done before. He probably has.</p>
                    <p>Harry barrels in from the right with a man at his shoulder, smashing through brush. "Keep moving," he grunts. "Don't stop to look."</p>
                    <p>The French break once it costs them. A few run deeper into the trees. A few don't get up. The column drags itself back together. Men check each other's straps, count heads, find the ones that are missing.</p>
                    <p>Jack exhales like he's been holding it since the first arrow. "I hate woods," he says. "Never trust woods."</p>
                    <p>You move on with the taste of leaves and fear in your mouth, and you keep Billy's warnings in your head the way you keep water when you're thirsty.</p>`;
            } else {
                return `${rollDisplay}
                    <p>You try to move and the forest punishes it. An arrow catches you—hard enough to make your arm go slack, or to make your leg forget what it's for. You stumble into cover more by luck than sense.</p>
                    <p>Jack grabs your belt and hauls. "Down. Down," he says, not loud, just urgent. He's shaking with it. He tries not to show.</p>
                    <p>Billy's voice comes through the noise. "Hold still. Let them waste shots."</p>
                    <p>Harry takes a hit off a shield and keeps going, jaw locked. "If you can breathe, you can crawl," he says, like he's giving you permission.</p>
                    <p>The ambush ends the ugly way most things end—by running out of will. The French peel off when your men stop panicking. The column survives. You survive. But you're leaking and sore and angry, and it's going to be a long march.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('experience', 8);
                applyStatChange('reputation', 1);
                applyStatChange('stress', 1);
                gameState.career.battles++;
            } else if (result) {
                addCondition('Wounded', 'negative', 2);
                applyStatChange('endurance', -1);
                applyStatChange('stress', 2);
                gameState.career.wounds++;
            }
        },
        choices: [
            {
                text: "Continue the march",
                effects: {},
                nextScene: "start"
            }
        ]
    },
    siege_defense_1345: {
        title: "The Walls Hold",
        year: 1345,
        age: function() { return window.gameState.age; },
        location: "Gascony",
        artwork: "artwork/seige.jpg",
        artworkCaption: "French forces assault the castle walls",
        text: `<p>The siege has gone on long enough that everyone's sick of the sound of stone. The French throw rocks. You throw rocks back. Men die in bits you don't want to look at too hard.</p>
               <p>Up on the ramparts the air smells of piss, smoke, and old sweat. The captain points where he wants bodies. "Gate. Wall. Anywhere they touch. Hold it."</p>
               <p>Hammer-Hand Harry pats his weapon like it's a tool. "Gate's a door," he says. "Doors break. Men break first."</p>
               <p>Soot-Eyed Billy peers out from behind a crenel. "They're stacking ladders on the left. Three at once," he says. "They're timing it."</p>
               <p>Fiddle Jack swallows and tightens his grip. "If they come over, it's close work," he says. "No room to be clever."</p>
               <p>Below, the first ladder slams into the stone. Wood scrapes. Men shout. The assault finally starts.</p>`,
        choices: [
            {
                text: "Defend the main gate with all your strength",
                effects: {},
                nextScene: "siege_defense_1345_resolve",
                requiresResolution: true,
                resolutionStat: "strength",
                resolutionDifficulty: 8
            },
            {
                text: "Hold your position on the walls",
                effects: {},
                nextScene: "siege_defense_1345_resolve",
                requiresResolution: true,
                resolutionStat: "endurance",
                resolutionDifficulty: 8
            },
            {
                text: "Coordinate the defense from a vantage point",
                effects: {},
                nextScene: "siege_defense_1345_resolve",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 7
            }
        ]
    },
    siege_defense_1345_resolve: {
        title: "The Assault Ends",
        year: 1345,
        age: function() { return window.gameState.age; },
        location: "Gascony",
        artwork: "artwork/battle-aftermath.jpg",
        artworkCaption: "The wall holds - bodies piled where the ladder was",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>The assault keeps coming in waves. Arms ache. Throats go raw. The wall shakes and holds.</p>`;

            const rollDisplay = `<div class="dice-roll">
                <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
                <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
            </div>`;

            if (result.success) {
                return `${rollDisplay}
                    <p>You do the job in front of you. You keep hands off the wall where hands shouldn't be. You shove ladders. You put steel into faces that pop up over stone. You keep the gate line tight.</p>
                    <p>Billy calls it clean: "Left ladder's empty. Next one's coming." He keeps feeding you the small facts that stop men from dying stupid.</p>
                    <p>Harry plants himself where the press is worst. "Here," he grunts. "Not back there." He takes the hit that would've taken another man's teeth.</p>
                    <p>Jack's breathing hard, but he stays. "Don't let them sit on the wall," he says, and it's the closest thing to advice he's got.</p>
                    <p>The French finally pull away, dragging their wounded, leaving their dead where they fell. The wall is slick and chipped and still yours. Men slump wherever they can. Someone laughs once, short and ugly, because it's over for the moment.</p>`;
            } else {
                return `${rollDisplay}
                    <p>They find the weak spot. A ladder lands where no one wanted it. A knot of French gets a foothold. For a minute the wall feels like it's tilting under you.</p>
                    <p>You fight close. Elbows, knife, shield edge. No space. No clean swings. Someone's breath in your face and you don't know whose it is.</p>
                    <p>You take a hard cut or a crushing hit. Your arm goes numb. Your legs wobble. Jack sees it and grabs you by the strap. "Stay up," he says through his teeth. "Stay up."</p>
                    <p>Harry shoulders into the crush and buys a few seconds. "Move," he barks. "Move now."</p>
                    <p>The French are driven off eventually, but it's not neat. It's not heroic. It's bodies piled where the ladder was and men staring at their own hands like they don't recognize them. When it's done you're left hurting and patched and quieter than you were.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('experience', 12);
                applyStatChange('reputation', 2);
                applyStatChange('patronFavor', 1);
                applyStatChange('stress', 2);
                gameState.career.battles++;
            } else if (result) {
                addCondition('Seriously Wounded', 'negative', 3);
                applyStatChange('endurance', -2);
                applyStatChange('stress', 3);
                gameState.career.wounds++;
            }
        },
        choices: [
            {
                text: "Tend to your wounds",
                effects: {},
                nextScene: "start"
            }
        ]
    },
    // ============================================================================
    // COMBAT ENCOUNTERS - Batch 2: Cavalry Skirmish & Night Raid
    // ============================================================================
    cavalry_skirmish_1342: {
        title: "Horsemen on the Road",
        year: 1342,
        age: function() { return window.gameState.age; },
        location: "Aquitaine",
        artwork: "artwork/battle-scene-1.jpg",
        artworkCaption: "French cavalry charges across the field",
        text: `<p>You're marching in a long column when the sound changes. Not boots. Not carts. Hooves. Fast. Many of them. It comes up from behind a low rise like a storm you can't step aside from.</p>
               <p>French cavalry—helmets bright, lances down. The men near you start shouting at once. Some start running. That makes it worse.</p>
               <p>Billy looks over his shoulder and spits. "Too close. If you run, they'll ride you down."</p>
               <p>Jack's hands are already on a strap. "Where do you want me?" he asks. No poetry. Just trying to live.</p>
               <p>Harry steps into the road like it belongs to him. "Get your shields up," he says. "Or get out of my way."</p>
               <p>The ground starts to shake under the hooves. There's no time to argue with it.</p>`,
        choices: [
            {
                text: "Form a shield wall with your comrades",
                effects: {},
                nextScene: "cavalry_skirmish_1342_resolve",
                requiresResolution: true,
                resolutionStat: "strength",
                resolutionDifficulty: 7
            },
            {
                text: "Scatter and take cover",
                effects: {},
                nextScene: "cavalry_skirmish_1342_resolve",
                requiresResolution: true,
                resolutionStat: "agility",
                resolutionDifficulty: 7
            },
            {
                text: "Stand your ground and hope for the best",
                effects: {},
                nextScene: "cavalry_skirmish_1342_resolve",
                requiresResolution: true,
                resolutionStat: "luck",
                resolutionDifficulty: 8
            }
        ]
    },
    cavalry_skirmish_1342_resolve: {
        title: "After the Charge",
        year: 1342,
        age: function() { return window.gameState.age; },
        location: "Aquitaine",
        artwork: "artwork/battle-aftermath.jpg",
        artworkCaption: "The dust settles - men breathe and count the cost",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>The dust hangs in the air. Men cough. Someone is crying and trying to hide it.</p>`;

            const rollDisplay = `<div class="dice-roll">
                <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
                <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
            </div>`;

            if (result.success) {
                return `${rollDisplay}
                    <p>You pick something that works and commit to it. Shields lock or men spill into ditches at the right moment. The first lance glances off wood instead of flesh.</p>
                    <p>Harry is a wall with hands. He shoves one man back into line. "Hold," he growls. "Hold or die." Simple as that.</p>
                    <p>Billy points past the riders. "They're turning wide. Don't chase." He's right. The moment you chase, you die tired.</p>
                    <p>The cavalry breaks off when it stops being easy. They wheel away, kicking up dust and curses. You're left with splintered shields, a few crushed bodies, and the sick relief of still standing.</p>
                    <p>Jack wipes his mouth with his sleeve. "I'm going to hear that sound in my sleep," he says, and no one laughs because it's true.</p>`;
            } else {
                return `${rollDisplay}
                    <p>The charge hits like a dropped cart. Horses slam into men. The road becomes screaming and dust and weight. You go down under it, not even sure how.</p>
                    <p>Something clips you—hoof, lance, shield rim. Pain blooms and then everything is just getting air back into your lungs.</p>
                    <p>Jack drags you by the collar into a shallow ditch. "Don't stand," he snaps. "Just breathe."</p>
                    <p>Harry hauls another man upright and shoves him forward. "Move," he says. "If you're alive, move."</p>
                    <p>The cavalry rides through and out the far side, leaving you in the churned mess. You're alive. You're hurt. The column regroups with a smaller count than it had a minute ago.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('experience', 10);
                applyStatChange('reputation', 1);
                applyStatChange('stress', 1);
                gameState.career.battles++;
            } else if (result) {
                addCondition('Wounded', 'negative', 2);
                applyStatChange('endurance', -1);
                applyStatChange('stress', 2);
                gameState.career.wounds++;
            }
        },
        choices: [
            {
                text: "Continue the march",
                effects: {},
                nextScene: "start"
            }
        ]
    },
    night_raid_1347: {
        title: "Darkness and Steel",
        year: 1347,
        age: function() { return window.gameState.age; },
        location: "Normandy",
        artwork: "artwork/campfire.jpg",
        artworkCaption: "Shadows move in the darkness",
        text: `<p>Night in camp is never quiet. Men cough. Horses shift. Someone argues in a whisper. The fire burns low because no one wants to be a beacon.</p>
               <p>You're on watch when you see movement where there shouldn't be any. Not a man going to piss. Not a dog. Shapes slipping between tents.</p>
               <p>Billy is already beside you, voice low. "Not ours," he says. "Too many. Knives."</p>
               <p>Jack's awake on the ground with his hand on his gear. "Tell me what to do," he whispers.</p>
               <p>Granny Six-Teeth sits up near the baggage like she never slept at all. "If you're going to shout, shout now," she says. "If you're going to stab, do that."</p>
               <p>Steel flashes once. A man grunts. Then everything starts at once.</p>`,
        choices: [
            {
                text: "Sound the alarm and rally the camp",
                effects: {},
                nextScene: "night_raid_1347_resolve",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 7
            },
            {
                text: "Engage them silently in the dark",
                effects: {},
                nextScene: "night_raid_1347_resolve",
                requiresResolution: true,
                resolutionStat: "agility",
                resolutionDifficulty: 8
            },
            {
                text: "Try to slip past and find help",
                effects: {},
                nextScene: "night_raid_1347_resolve",
                requiresResolution: true,
                resolutionStat: "luck",
                resolutionDifficulty: 8
            }
        ]
    },
    night_raid_1347_resolve: {
        title: "Dawn Breaks",
        year: 1347,
        age: function() { return window.gameState.age; },
        location: "Normandy",
        artwork: "artwork/campfire.jpg",
        artworkCaption: "Dawn comes slow and gray - the camp still stands",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>The night drags on. Men don't sleep. The dark keeps its teeth out for now.</p>`;

            const rollDisplay = `<div class="dice-roll">
                <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
                <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
            </div>`;

            if (result.success) {
                return `${rollDisplay}
                    <p>You do the right thing fast enough. You get men moving. You get blades out. You keep the raiders from turning the camp into a slaughter pen.</p>
                    <p>Billy puts you where you need to be. "There," he says, pointing into the gap between tents. "That's their path."</p>
                    <p>Harry comes in half-dressed, furious, and effective. He drops one man with a single ugly swing and then barks, "Back. Keep them out of the horses."</p>
                    <p>Jack doesn't do anything fancy. He stays close, follows orders, keeps his hands from shaking by staying busy.</p>
                    <p>The raiders run when they stop getting easy kills. Dawn comes slow and gray. The camp stinks of smoke and sweat and spilled blood, but it's still standing. You're still standing.</p>`;
            } else {
                return `${rollDisplay}
                    <p>It goes wrong fast. Someone shouts too late or in the wrong direction. The raiders get into the tents. Men wake up with knives already on them.</p>
                    <p>You fight in the dark with half-seen shapes. You catch a blade you didn't see coming, or you take a hit while dragging someone out of their blanket.</p>
                    <p>Jack's voice is close. "Hold on," he says, rough and scared. He ties something tight around you with shaking hands and swears at the knot.</p>
                    <p>Billy keeps moving, pulling men awake, pushing them toward light. "Wake up. Wake up," he repeats like it'll bring the dead back.</p>
                    <p>The raiders pull off before sunrise, carrying what they can. The camp survives, but it's thinner. Dawn shows what the dark took.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('experience', 12);
                applyStatChange('reputation', 2);
                applyStatChange('patronFavor', 1);
                applyStatChange('stress', 2);
                gameState.career.battles++;
            } else if (result) {
                addCondition('Wounded', 'negative', 2);
                applyStatChange('endurance', -1);
                applyStatChange('stress', 3);
                gameState.career.wounds++;
            }
        },
        choices: [
            {
                text: "Tend to the wounded",
                effects: {},
                nextScene: "start"
            }
        ]
    },
    // ============================================================================
    // COMBAT ENCOUNTERS - Batch 3: Town Fighting & Archery Duel
    // ============================================================================
    town_fighting_1348: {
        title: "Streets of Calais",
        year: 1348,
        age: function() { return window.gameState.age; },
        location: "Calais",
        artwork: "artwork/battle-scene-3.jpg",
        artworkCaption: "Combat in the narrow streets",
        text: `<p>Calais is tight stone and narrow lanes. The air is bad—smoke, rot, old fish. Everything echoes. A shout becomes ten shouts. A footstep becomes a warning.</p>
               <p>Your unit pushes into a street and the street pushes back. A bolt from a window. A man drops. A door bursts open and there's a Frenchman in it, just as surprised as you are.</p>
               <p>Billy presses himself to a wall and listens. "Two on the roof," he says. "One in that doorway. Don't stand in the open."</p>
               <p>Jack's breathing through his mouth. "I hate towns," he says. "Too many corners."</p>
               <p>Harry shoulders past, impatient. "Corners are fine," he grunts. "Men hiding in them aren't."</p>
               <p>You have to clear the block. Not because it matters. Because you've been told to. Because you'll be killed if you don't.</p>`,
        choices: [
            {
                text: "Charge forward and clear the street",
                effects: {},
                nextScene: "town_fighting_1348_resolve",
                requiresResolution: true,
                resolutionStat: "strength",
                resolutionDifficulty: 8
            },
            {
                text: "Move through the alleys and flank them",
                effects: {},
                nextScene: "town_fighting_1348_resolve",
                requiresResolution: true,
                resolutionStat: "agility",
                resolutionDifficulty: 8
            },
            {
                text: "Coordinate with your unit to clear buildings",
                effects: {},
                nextScene: "town_fighting_1348_resolve",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 7
            }
        ]
    },
    town_fighting_1348_resolve: {
        title: "The Street is Clear",
        year: 1348,
        age: function() { return window.gameState.age; },
        location: "Calais",
        artwork: "artwork/battle-aftermath.jpg",
        artworkCaption: "The street is yours - silence after the noise",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>The street is still contested. Men press forward by inches and fear.</p>`;

            const rollDisplay = `<div class="dice-roll">
                <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
                <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
            </div>`;

            if (result.success) {
                return `${rollDisplay}
                    <p>You clear it the hard way—door by door, corner by corner. You keep men together. You keep someone watching the roofs. You don't let panic split the line.</p>
                    <p>Billy taps your shoulder and points, quick. "Now," he says. You move on the cue and it saves you from a shot meant for your chest.</p>
                    <p>Harry takes a door with his shoulder and goes in like he's late to work. "Next," he says when he comes out, and his voice doesn't change.</p>
                    <p>Jack covers a window, hands steady enough. "Clear," he calls, and it sounds like relief trying not to show.</p>
                    <p>When it's done, the street is yours. The silence after is worse than the noise. Men look at walls like the walls might stab them.</p>`;
            } else {
                return `${rollDisplay}
                    <p>The town punishes mistakes. You take a corner too wide, or a door opens where you didn't expect it. A blade finds you, or a bolt takes you low.</p>
                    <p>You go down in the filth of the street and you taste old smoke and grit. Someone hauls you back by your straps.</p>
                    <p>Jack is there, face tight. "Stay awake," he says. "Just stay awake."</p>
                    <p>Harry plants himself between you and the doorway and takes the next swing meant for you. "Move him," he barks. "Move."</p>
                    <p>The block is cleared eventually, but you don't feel like a winner. You feel like a man who got lucky enough to keep breathing.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('experience', 12);
                applyStatChange('reputation', 2);
                applyStatChange('patronFavor', 1);
                applyStatChange('stress', 2);
                gameState.career.battles++;
            } else if (result) {
                addCondition('Wounded', 'negative', 2);
                applyStatChange('endurance', -1);
                applyStatChange('stress', 3);
                gameState.career.wounds++;
            }
        },
        choices: [
            {
                text: "Continue clearing the town",
                effects: {},
                nextScene: "start"
            }
        ]
    },
    archery_duel_1339: {
        title: "The Archers' Stand",
        year: 1339,
        age: function() { return window.gameState.age; },
        location: "Northern France",
        artwork: "artwork/battle-scene-1.jpg",
        artworkCaption: "Arrows fly across the field",
        text: `<p>The French hold a ridge and they won't stop shooting. All day it's been the same: a man steps out, a man drops. Your side curses the wind and keeps moving corpses off the line.</p>
               <p>You're ordered forward with the archers. Not to be brave. To be useful. You string an arrow. Your fingers are stiff. Your mouth is dry.</p>
               <p>Jack checks his string, then yours. "Your knot's loose," he says. "Fix it or it'll slap you bloody."</p>
               <p>Billy squints at the ridge. "They're aiming for movement," he says. "Don't dance around. Pick a spot and shoot."</p>
               <p>Granny Six-Teeth is behind you with the spare shafts, counting like it's bread. "Stop wasting arrows," she mutters. "We're not made of them."</p>
               <p>You draw. You aim. You try to make the ridge pay attention to someone else for a change.</p>`,
        choices: [
            {
                text: "Focus on accuracy and pick your targets",
                effects: {},
                nextScene: "archery_duel_1339_resolve",
                requiresResolution: true,
                resolutionStat: "agility",
                resolutionDifficulty: 7
            },
            {
                text: "Coordinate volleys with your unit",
                effects: {},
                nextScene: "archery_duel_1339_resolve",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 7
            },
            {
                text: "Rapid fire and hope for the best",
                effects: {},
                nextScene: "archery_duel_1339_resolve",
                requiresResolution: true,
                resolutionStat: "luck",
                resolutionDifficulty: 8
            }
        ]
    },
    archery_duel_1339_resolve: {
        title: "The Archers Break",
        year: 1339,
        age: function() { return window.gameState.age; },
        location: "Northern France",
        artwork: "artwork/battle-aftermath.jpg",
        artworkCaption: "The ridge is quieter - less dying",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>Arrows keep trading places in the air. Men keep falling. No one calls it fair.</p>`;

            const rollDisplay = `<div class="dice-roll">
                <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
                <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
            </div>`;

            if (result.success) {
                return `${rollDisplay}
                    <p>You slow down enough to hit what you're aiming at, or you keep your volley tight enough that the ridge starts to flinch. A Frenchman drops. Then another. Heads duck. Their shooting loses its rhythm.</p>
                    <p>Jack gives a short nod. "That one counted," he says, like he's marking a tally.</p>
                    <p>Billy points. "They're backing off the crest."</p>
                    <p>Granny hands you another shaft without looking at you. "Good. Keep doing that. Don't get proud."</p>
                    <p>The French archers pull back, not running, just deciding they've had enough for the day. The ridge is quieter. Your side breathes again. It's not a victory song. It's just less dying.</p>`;
            } else {
                return `${rollDisplay}
                    <p>You shoot and it doesn't matter enough. The ridge keeps biting. An arrow finds you—arm, thigh, anywhere that makes you swear and lose your grip.</p>
                    <p>Jack grabs your elbow. "Hold it still," he says, voice tight. "Don't yank it."</p>
                    <p>Granny is already there with cloth. "Sit," she snaps. "You're no use falling over."</p>
                    <p>Billy keeps shooting while you bleed. "Keep their heads down," he mutters, like he's talking to himself as much as anyone.</p>
                    <p>The French eventually ease off, but you pay for the time it took. You're alive. You're hurt. You're going to feel it every time you draw a string.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('experience', 8);
                applyStatChange('reputation', 1);
                applyStatChange('stress', 1);
                gameState.career.battles++;
            } else if (result) {
                addCondition('Wounded', 'negative', 1);
                applyStatChange('endurance', -1);
                applyStatChange('stress', 2);
                gameState.career.wounds++;
            }
        },
        choices: [
            {
                text: "Continue the advance",
                effects: {},
                nextScene: "start"
            }
        ]
    },
    // ============================================================================
    // COMBAT ENCOUNTERS - Batch 4: River Crossing & Last Stand
    // ============================================================================
    river_crossing_1344: {
        title: "The River Runs Red",
        year: 1344,
        age: function() { return window.gameState.age; },
        location: "Gascony",
        artwork: "artwork/bridgerain.jpg",
        artworkCaption: "Men struggle across the river under fire",
        text: `<p>The river is wide, cold, and fast. The far bank is lined with French archers. You can see the draw of their bows even before you hear the strings.</p>
               <p>Men step in and the water grabs them. Packs drag. Boots slip in the mud. An arrow hits a man midstream and he goes under like he's been pulled.</p>
               <p>Billy watches the ripples like he can read them. "Don't go where it looks smooth," he says. "That's the deep."</p>
               <p>Jack keeps his bow high and his mouth shut, saving breath. "Just tell me when," he says.</p>
               <p>Harry spits and steps in like he hates the river personally. "If we're crossing, we're crossing," he growls. "No standing around getting shot."</p>
               <p>The order comes. Forward. Into the water. Into the arrows. There's no clean way to do it.</p>`,
        choices: [
            {
                text: "Push through the current with all your strength",
                effects: {},
                nextScene: "river_crossing_1344_resolve",
                requiresResolution: true,
                resolutionStat: "strength",
                resolutionDifficulty: 8
            },
            {
                text: "Move slowly and carefully to avoid arrows",
                effects: {},
                nextScene: "river_crossing_1344_resolve",
                requiresResolution: true,
                resolutionStat: "endurance",
                resolutionDifficulty: 8
            },
            {
                text: "Find a better crossing point upstream",
                effects: {},
                nextScene: "river_crossing_1344_resolve",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 7
            }
        ]
    },
    river_crossing_1344_resolve: {
        title: "On the Far Bank",
        year: 1344,
        age: function() { return window.gameState.age; },
        location: "Gascony",
        artwork: "artwork/bridgerain.jpg",
        artworkCaption: "The far bank - wet and angry and alive",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>The river keeps taking what it can. Men keep trying anyway.</p>`;

            const rollDisplay = `<div class="dice-roll">
                <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
                <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
            </div>`;

            if (result.success) {
                return `${rollDisplay}
                    <p>You pick a line and stick to it. You keep your feet under you, keep your head down, keep your pack from dragging you sideways. You hit the far bank with your lungs on fire.</p>
                    <p>Billy is already there, grabbing wrists, hauling men up. "Don't stop in the shallows," he snaps. "Get up the bank."</p>
                    <p>Harry hits the mud like a bull and then climbs like he's offended by gravity. "Move," he growls at a man frozen on the slope. "Move now."</p>
                    <p>Jack gets across with his bow still usable, which feels like a miracle. He coughs and says, "Never doing that again."</p>
                    <p>You push into the French line and they give ground. Not because you're noble. Because you're wet and angry and right in front of them. The bank becomes yours. The river is behind you. You don't look back until it's done.</p>`;
            } else {
                return `${rollDisplay}
                    <p>You step wrong once and the river takes the rest. You slip. Your pack drags. Water fills your mouth. An arrow hits close enough to make you flinch and lose your footing again.</p>
                    <p>Something catches you—arrow, rock, boot. Pain and cold together. You claw forward because there's no other choice.</p>
                    <p>Jack grabs you when you reach the bank and yanks, nearly tearing you out of your own skin. "Up," he says. "Up."</p>
                    <p>Billy's face is tight with it. "Keep going," he says. "Don't sit down. You'll never stand back up."</p>
                    <p>You make the far side. You fight because you have to. You win the bank because the men behind you keep coming. Later, when the shaking starts, you realize how close it was.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('experience', 12);
                applyStatChange('reputation', 2);
                applyStatChange('patronFavor', 1);
                applyStatChange('stress', 2);
                gameState.career.battles++;
            } else if (result) {
                addCondition('Wounded', 'negative', 2);
                applyStatChange('endurance', -1);
                applyStatChange('stress', 3);
                gameState.career.wounds++;
            }
        },
        choices: [
            {
                text: "Continue the advance",
                effects: {},
                nextScene: "start"
            }
        ]
    },
    last_stand_1350: {
        title: "No Retreat",
        year: 1350,
        age: function() { return window.gameState.age; },
        location: "Northern France",
        artwork: "artwork/battle-scene-2.jpg",
        artworkCaption: "Outnumbered and surrounded",
        text: `<p>The day goes wrong and then keeps going wrong. Your unit gets cut off. The captain goes down. The line breaks. You end up with a handful of men and no clean way out.</p>
               <p>The French are everywhere. Not in a grand way. In a practical way. You turn your head and there's more of them. You step back and there's more of them. The ground feels smaller.</p>
               <p>Billy looks around once, quick, like he's counting exits. "We're boxed," he says. "There's a thin spot by that hedge, maybe."</p>
               <p>Jack's face is gray. "If we run, they'll cut us down," he says. Not a complaint. Just the math.</p>
               <p>Harry wipes his hand on his coat and nods at you like you're the only thing left that counts as a plan. "Say it," he says. "We're doing something or we're dying standing still."</p>
               <p>Granny Six-Teeth is nowhere near the fighting, but you can hear her voice behind the scramble of men—sharp, scolding, alive. "Don't drop the bandage bundle, you idiot. Hold it tight." Even now she's keeping someone from bleeding out.</p>
               <p>This is the moment where you pick a shape for the end.</p>`,
        choices: [
            {
                text: "Form a circle and fight to the last",
                effects: {},
                nextScene: "last_stand_1350_resolve",
                requiresResolution: true,
                resolutionStat: "endurance",
                resolutionDifficulty: 9
            },
            {
                text: "Lead a desperate charge to break through",
                effects: {},
                nextScene: "last_stand_1350_resolve",
                requiresResolution: true,
                resolutionStat: "strength",
                resolutionDifficulty: 9
            },
            {
                text: "Try to find a weak point and escape",
                effects: {},
                nextScene: "last_stand_1350_resolve",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 8
            }
        ]
    },
    last_stand_1350_resolve: {
        title: "Survival",
        year: 1350,
        age: function() { return window.gameState.age; },
        location: "Northern France",
        artwork: "artwork/battle-aftermath.jpg",
        artworkCaption: "You survive the moment - but at what cost",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>The French close in. Men tighten grips. Breath gets loud inside helmets.</p>`;

            const rollDisplay = `<div class="dice-roll">
                <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
                <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
            </div>`;

            if (result.success) {
                return `${rollDisplay}
                    <p>It works because you make it work. You keep men together, or you hit the thin spot before it thickens, or you turn a hedge and a ditch into a wall for a few minutes that matter.</p>
                    <p>Billy's voice is right in your ear. "Now. Now." He doesn't say why. He doesn't need to. You move on the cue and it's the gap you needed.</p>
                    <p>Harry breaks the first man in the way and keeps going, breathing like a bellows. "Keep up," he grunts. "Don't fall behind me."</p>
                    <p>Jack stays close and does exactly what he's told. When it's over he sits down hard, shaking. "That was… close," he says. Understatement of the year.</p>
                    <p>You get out with fewer men than you started with. You don't feel lucky. You feel used up. But you're alive. And that is, for now, enough.</p>`;
            } else {
                return `${rollDisplay}
                    <p>You try it and it doesn't come clean. The circle buckles, or the charge stalls, or the "weak spot" turns out to be wishful thinking. The French don't need poetry. They just need numbers.</p>
                    <p>You take a heavy wound. Not a scratch. Something that makes your arm stop working right, or makes your leg drag. You keep moving because stopping is the same as dying.</p>
                    <p>Harry grabs you and hauls. "Not here," he growls. "Not now." He's bleeding too. He doesn't mention it.</p>
                    <p>Jack is swearing as he pulls another man by the strap. "Move. Move," he repeats, like words can carry weight.</p>
                    <p>Billy gets you to cover the ugly way—crawling, dragging, stumbling. "Keep your eyes open," he says. "Just keep them open."</p>
                    <p>You survive the moment. You don't win it. Later you'll find out how much it cost.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('experience', 15);
                applyStatChange('reputation', 3);
                applyStatChange('patronFavor', 2);
                applyStatChange('stress', 3);
                gameState.career.battles++;
            } else if (result) {
                addCondition('Seriously Wounded', 'negative', 4);
                applyStatChange('endurance', -2);
                applyStatChange('stress', 4);
                gameState.career.wounds++;
                if (Math.random() < 0.15) {
                    gameState.career.deathRate += 0.1;
                }
            }
        },
        choices: [
            {
                text: "Tend to your wounds and regroup",
                effects: {},
                nextScene: "start"
            }
        ]
    },
    spring_campaign: {
        title: "The Campaign of 1346",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "England",
        artwork: "artwork/march.jpg",
        artworkCaption: "The campaign begins - England prepares for invasion",
        text: `<p>Spring arrives, and with it, the call to arms. After months of waiting, King Edward III's plans finally come to fruition. The invasion of France begins now.</p>
               <p>Your lord calls for all available men. This will be a major campaign. The ships gather in the harbor. The army assembles. The time for waiting is over.</p>`,
        choices: [
            {
                text: "Prepare for what's coming",
                effects: {},
                nextScene: "indenture_table"
            }
        ]
    },
    indenture_table: {
        title: "The Indenture Table",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Portsmouth, England",
        noCampfire: true, // Prevent campfire insertion during contract signing sequence
        artwork: "artwork/signup.jpg",
        artworkCaption: "Signing the indenture - the business of war",
        text: `<p><strong>June 1346 — Portsmouth</strong></p>
               <p>A clerk reads the contract terms aloud while your captain watches faces for hesitation. You're not swearing fealty for life—you're signing for a term, a wage, and a share of what can be lawfully taken. The ink smells like iron. Someone nearby is already drunk enough to mis-hear his own name.</p>`,
        choices: [
            {
                text: "Negotiate for clarity (not more pay)",
                effects: {},
                nextScene: "indenture_negotiate",
                requiresResolution: true,
                resolutionStat: "charisma",
                resolutionDifficulty: 9
            },
            {
                text: "Ask what happens to prisoners",
                effects: {},
                nextScene: "indenture_prisoners",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 9
            },
            {
                text: "Sign fast and shut up",
                effects: {},
                nextScene: "indenture_sign",
                requiresResolution: true,
                resolutionStat: "morale",
                resolutionDifficulty: 9
            }
        ]
    },
    indenture_negotiate: {
        title: "Negotiating Terms",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Portsmouth, England",
        artwork: "artwork/signup.jpg",
        artworkCaption: "Negotiating terms - the business of war",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You approach the clerk...</p>`;
            if (result.success) {
                return `<p>You ask careful questions about payment schedules and prize distribution. The captain nods—you're thinking like a professional, not a troublemaker.</p>
                       <p>You've earned respect and clarity. This will serve you well.</p>`;
            } else {
                return `<p>Your questions come across as challenging the captain's authority. His expression hardens.</p>
                       <p>You've marked yourself as difficult. This will cost you favor.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('patronFavor', 1);
                setFlag('Shorted Wages', false); // Clear risk flag
            } else if (result) {
                applyStatChange('patronFavor', -1);
            }
        },
        choices: [
            {
                text: "Continue to muster",
                effects: {},
                nextScene: "portsmouth_muster"
            }
        ]
    },
    indenture_prisoners: {
        title: "Prisoners and Ransoms",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Portsmouth, England",
        artwork: "artwork/signup.jpg",
        artworkCaption: "Learning the economics of war - prisoners and ransoms",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You consider the question...</p>`;
            if (result.success) {
                return `<p>You ask about prisoner rights and ransoms. The older hands nod—you're learning the real economics of war.</p>
                       <p>You understand the system now. This knowledge could be valuable.</p>`;
            } else {
                return `<p>Your question marks you as naïve. The veterans exchange knowing looks.</p>
                       <p>You'll learn the hard way, or not at all.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('wits', 1);
                setFlag('Ransom Claim', true);
            }
        },
        choices: [
            {
                text: "Continue to muster",
                effects: {},
                nextScene: "portsmouth_muster"
            }
        ]
    },
    indenture_sign: {
        title: "Signing the Contract",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Portsmouth, England",
        artwork: "artwork/signup.jpg",
        artworkCaption: "The quill and the contract - commitment to war",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You take the quill...</p>`;
            if (result.success) {
                return `<p>You sign with confidence. The terms are what they are—you've made your choice and you'll see it through.</p>
                       <p>Your certainty strengthens your resolve.</p>`;
            } else {
                return `<p>You sign quickly, but later you realize you missed a clause about wage deductions.</p>
                       <p>This oversight may cost you later.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('morale', 1);
            } else if (result) {
                setFlag('Shorted Wages', true);
            }
        },
        choices: [
            {
                text: "Continue to muster",
                effects: {},
                nextScene: "portsmouth_muster"
            }
        ]
    },
    portsmouth_muster: {
        title: "The Muster",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Portsmouth, England",
        noCampfire: true, // Prevent campfire insertion here
        artwork: "artwork/dock.jpg",
        artworkCaption: "The docks of Portsmouth - preparing for war",
        text: `<p><strong>Mid-June 1346 — Portsmouth</strong></p>
               <p>After signing the contract, you step out of the clerk's tent into the open air. The docks are a chaos of activity, but you're directed away from the harbor, up the hillside to the muster field.</p>
               <p>Tents stretch across the hillside. Men from a dozen lords. Archers. Men-at-arms. Sergeants. All waiting. All preparing. The transition from the quiet formality of contract signing to the sprawling military camp is jarring, but familiar. You've done this before. Just never on this scale.</p>
               <p>You find your unit's section. Set up your tent. Check your gear. The routine is familiar. But the scale is different. This isn't a raid. This isn't a skirmish. This is an army.</p>
               <p>Days pass. More men arrive. More ships. The harbor fills. The camp grows. You drill. You wait. You watch the horizon. Because you know. Soon, the order will come. Soon, you'll board those ships. Soon, you'll sail to France.</p>
               <p>But first, there's the matter of supplies. The army must eat. And that means purveyance.</p>`,
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "purveyance"
            }
        ]
    },
    purveyance: {
        title: "Purveyance",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Southern England",
        artwork: "artwork/supplyshortage.jpg",
        artworkCaption: "Empty wagons and hungry men - the supply train",
        text: `<p><strong>Late June 1346 — Southern England</strong></p>
               <p>Wagons arrive with hard bread and salted meat—then stop arriving. A royal warrant appears. "Purveyance," they call it: taking supplies at set prices (or less), and letting villagers complain to someone who isn't here. Your unit is told to "assist."</p>`,
        choices: [
            {
                text: "Pay fair and write receipts",
                effects: {},
                nextScene: "purveyance_fair",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 9
            },
            {
                text: "Take what's needed, quickly",
                effects: {},
                nextScene: "purveyance_take",
                requiresResolution: true,
                resolutionStat: "strength",
                resolutionDifficulty: 9
            },
            {
                text: "Refuse and let others do it",
                effects: {},
                nextScene: "purveyance_refuse",
                requiresResolution: true,
                resolutionStat: "morale",
                resolutionDifficulty: 9
            }
        ]
    },
    purveyance_fair: {
        title: "Fair Dealing",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Southern England",
        artwork: "artwork/market.jpg",
        artworkCaption: "Fair prices and proper receipts - small acts of kindness",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>The villagers watch you. Hands on tools. Faces hard. They've seen soldiers before. They know what to expect. Taking. Demanding. Threatening.</p>
                                   <p>You approach slowly. Show your hands. No weapons. Just coins. Just paper. Just the promise of fairness in a world that offers little.</p>`;
            if (result.success) {
                return `<p>You pay fair prices. Write proper receipts. The villagers stare. Disbelieving at first. Then grateful. One old woman weeps. You didn't expect that. Didn't expect how much a small kindness could mean.</p>
                       <p>Your integrity is noted. The captain sees. The villagers remember. This will matter. Later. When you need it. When they need it. Small acts. Small debts. They add up.</p>`;
            } else {
                return `<p>You try to be fair. Count coins carefully. Write receipts. But someone accuses you of skimming. Of taking more than you paid. The captain questions you. Your honesty. Your judgment.</p>
                       <p>Your reputation suffers. Even if you're innocent. Even if you did right. Perception matters. Trust matters. And you've lost both.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            const payCost = 5;
            if (result && result.success) {
                applyStatChange('wealth', -payCost);
                applyStatChange('patronFavor', 1);
                applyStatChange('morale', 1);
            } else if (result) {
                applyStatChange('patronFavor', -1);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "channel_crossing"
            }
        ]
    },
    purveyance_take: {
        title: "Taking What's Needed",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Southern England",
        artwork: "artwork/supplyshortage.jpg",
        artworkCaption: "Taking supplies - the harsh reality of war",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You move quickly. No time for negotiation. No time for fairness. The unit needs food. The unit needs supplies. That's what matters. That's all that matters.</p>
                                   <p>The villagers watch. Silent. Resigned. They've seen this before. They'll see it again. This is how war works. Taking. Always taking.</p>`;
            if (result.success) {
                return `<p>You take what's needed. Efficiently. Quickly. The unit is fed. Extra supplies secured. The job is done. No fuss. No delay.</p>
                       <p>But the villagers' eyes follow you. Their faces hard. Their hands clenched. Resentment grows. Hatred takes root. You've fed your men. But you've planted seeds. Seeds that will grow. That will bear fruit. Bitter fruit.</p>`;
            } else {
                return `<p>You take supplies. Clumsily. Too fast. Too rough. You break things. Spill things. Waste things. The villagers' anger is palpable. Their rage barely contained.</p>
                       <p>You've made enemies. Real enemies. People who will remember. Who will wait. Who will find ways to make you pay. This will come back. It always does.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('wealth', 3);
                applyStatChange('morale', 1);
            } else if (result) {
                setFlag('Resentment', true);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "channel_crossing"
            }
        ]
    },
    purveyance_refuse: {
        title: "Refusing the Order",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Southern England",
        artwork: "artwork/supplyshortage.jpg",
        artworkCaption: "The weight of conscience - refusing the order",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>The order comes. Take what's needed. Pay what you can. Or don't pay. The warrant covers it. The law allows it. But your conscience doesn't.</p>
                                   <p>You hesitate. Look at the villagers. Look at your men. Look at the captain. Everyone waiting. Everyone watching. What you do next will define you. To them. To yourself.</p>`;
            if (result.success) {
                return `<p>You refuse. Politely. Quietly. Let others handle it. Step back. Let the weight fall on someone else. You avoid the moral burden. The guilt. The shame.</p>
                       <p>But the captain notices. Your reluctance. Your hesitation. Your unwillingness to do what needs doing. You've avoided creating resentment. But you've lost favor. Lost trust. Lost respect. Sometimes the price of a clean conscience is everything else.</p>`;
            } else {
                return `<p>The captain forces you. No choice. No argument. You do it. Take the supplies. Ignore the protests. Pretend you don't see the tears. Pretend you don't hear the curses.</p>
                       <p>But something breaks. Inside you. A piece of who you were. A piece of who you wanted to be. You're shaken. Not by danger. Not by fear. By what you've been made to do. By what you've become.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('patronFavor', -1);
            } else if (result) {
                addCondition('Shaken', 'negative', 1);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "channel_crossing"
            }
        ]
    },
    channel_crossing: {
        title: "Channel Crossing: Vomit and Rope",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "English Channel",
        artwork: "artwork/naval-battle-1.jpg", // Naval battle scene with ships
        artworkCaption: "The crossing to France",
        text: `<p><strong>Early July 1346 — At sea</strong></p>
               <p>Men retch over the gunwale until there's nothing left to give. Horses scream when the deck shifts. The ship's bilge stinks. Someone drops a bow-case into seawater; someone else pretends not to see.</p>`,
        choices: [
            {
                text: "Guard the horses through the night",
                effects: {},
                nextScene: "channel_horses",
                requiresResolution: true,
                resolutionStat: "endurance",
                resolutionDifficulty: 9
            },
            {
                text: "Secure your gear against salt",
                effects: {},
                nextScene: "channel_gear",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 9
            },
            {
                text: "Help the sick and keep order",
                effects: {},
                nextScene: "channel_help",
                requiresResolution: true,
                resolutionStat: "charisma",
                resolutionDifficulty: 9
            }
        ]
    },
    channel_horses: {
        title: "Tending the Horses",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "English Channel",
        artwork: "artwork/BattleofSluys.jpeg",
        artworkCaption: "Tending the horses through the night - the crossing continues",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>The horses scream. Panic in their eyes. The deck rolls. They stumble. Fall. Get up. Fall again. They don't understand. Can't understand. This isn't their world. This isn't their war.</p>
                                   <p>You approach the stalls. The smell of fear. Of sweat. Of animal terror. They need someone. Someone to calm them. To steady them. To keep them alive until land. Until they can run again. Until they can be useful again.</p>`;
            if (result.success) {
                return `<p>You guard them through the night. Long hours. Dark hours. Talking. Soothing. Keeping them calm. Keeping them secure. They settle. Trust you. Or at least stop fighting you.</p>
                       <p>Dawn comes. The horses are ready. Calm. Steady. They'll carry you when you need them. They'll carry you into battle. Into death. But for now, they're alive. They're yours. Your dedication is noted. The captain sees. Reliable men are rare. You're one of them.</p>`;
            } else {
                return `<p>The night is endless. Exhausting. You do your best. Try to keep them calm. Try to keep them safe. But the ship rolls. One horse falls. Breaks a leg. Or maybe just panics. Either way, it's done. Can't be saved. Can't be fixed.</p>
                       <p>You're fatigued. Empty. And you'll be without a mount when you need one. When the fighting starts. When speed matters. When a horse could save your life. But you tried. That's something. Even if it doesn't feel like enough.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('patronFavor', 1);
            } else if (result) {
                addCondition('Fatigued', 'negative', 1);
                setFlag('Lame Mount', true);
                applyStatChange('stress', 1);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "saint_vaast_landing"
            }
        ]
    },
    channel_gear: {
        title: "Securing Your Gear",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "English Channel",
        artwork: "artwork/Bataille_de_la_Rochelle.jpg",
        artworkCaption: "Securing gear against saltwater - the crossing is harsh",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>Saltwater everywhere. Spray. Mist. Waves crashing over the side. Your gear is exposed. Vulnerable. Your bow. Your strings. Your arrows. Everything that keeps you alive. Everything that makes you useful.</p>
                                   <p>You check your equipment. Wrap it. Cover it. Protect it. Because you know. When you land. When the fighting starts. Your gear is all you have. All that stands between you and death. Between you and failure.</p>`;
            if (result.success) {
                return `<p>You protect it carefully. Wrap the bow. Cover the strings. Keep everything dry. Safe. Secure. Your gear will be ready. When you need it. When your life depends on it. When everything depends on it.</p>
                       <p>Your foresight preserves your equipment. Your quality. Your edge. In a world where everything breaks. Everything fails. Everything rusts. You've kept something whole. Something useful. Something that might save you.</p>`;
            } else {
                return `<p>You try. Wrap it. Cover it. Protect it. But saltwater finds a way. Always finds a way. Your bowstrings soak. Stretch. Weaken. Your equipment suffers. Your edge dulls. Your advantage fades.</p>
                       <p>You'll need to repair. Or replace. When you land. If you land. If you have time. If you have coin. If you have luck. But for now, you're weaker. Less ready. Less able. And you know it.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                const currentQuality = getEquipmentQuality('weapon');
                setEquipmentQuality('weapon', Math.min(2, currentQuality + 1));
            } else if (result) {
                const currentQuality = getEquipmentQuality('weapon');
                setEquipmentQuality('weapon', Math.max(0, currentQuality - 1));
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "saint_vaast_landing"
            }
        ]
    },
    channel_help: {
        title: "Helping the Sick",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "English Channel",
        artwork: "artwork/naval-battle-1.jpg",
        artworkCaption: "Helping the sick and keeping order on the crossing",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>Men retch. Over the side. On the deck. Everywhere. The smell is terrible. The sound is worse. Groans. Curses. Prayers. The ship rolls. They roll with it. Helpless. Hopeless. Just trying to survive.</p>
                                   <p>You move among them. The sick. The weak. The broken. Someone has to help. Someone has to keep order. Someone has to keep them from giving up. From giving in. From letting the sea take them.</p>`;
            if (result.success) {
                return `<p>You help them. Give them water. Keep them calm. Maintain order. Your leadership holds. Your voice steadies. The men focus. Despite the misery. Despite the fear. Despite everything.</p>
                       <p>Morale improves. Slowly. Gradually. But it improves. The risk of desertion decreases. The risk of panic fades. You've done something. Something small. Something important. Something that might save lives. Might save the mission. Might save yourself.</p>`;
            } else {
                return `<p>You try to help. Move among them. Give water. Offer comfort. But the chaos overwhelms you. Too many sick. Too much suffering. Too little you can do. Too little that matters.</p>
                       <p>You're shaken. Not by danger. Not by fear. By helplessness. By the weight of suffering you can't ease. By the faces of men you can't save. By the knowledge that sometimes trying isn't enough. Sometimes nothing is enough.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('morale', 1);
            } else if (result) {
                addCondition('Shaken', 'negative', 1);
                applyStatChange('stress', 1);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "saint_vaast_landing"
            }
        ]
    },
    saint_vaast_landing: {
        title: "Saint-Vaast Landing",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Saint-Vaast-la-Hougue, Normandy",
        artwork: "artwork/naval-battle-2.jpg", // Naval battle with ships and coastal city
        artworkCaption: "Landing at Saint-Vaast-la-Hougue",
        text: `<p><strong>12 July 1346 — Saint-Vaast-la-Hougue / Cotentin</strong></p>
               <p>The shoreline looks quiet until you notice how many doors are barred. Men spill out and form ranks. The order is simple: move inland, take what can be taken, and keep moving.</p>`,
        choices: [
            {
                text: "Scout the first mile inland",
                effects: {},
                nextScene: "landing_scout",
                requiresResolution: true,
                resolutionStat: "agility",
                resolutionDifficulty: 9
            },
            {
                text: "Join the first raid party",
                effects: {},
                nextScene: "landing_raid",
                requiresResolution: true,
                resolutionStat: "strength",
                resolutionDifficulty: 9
            },
            {
                text: "Stay with the banner",
                effects: {},
                nextScene: "landing_banner",
                requiresResolution: true,
                resolutionStat: "morale",
                resolutionDifficulty: 9
            }
        ]
    },
    landing_scout: {
        title: "Scouting Inland",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Normandy",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You move forward. Cautiously. Every step measured. Every sound noted. The land is foreign. Unknown. Dangerous. You don't know what's ahead. What's waiting. What's watching.</p>
                                   <p>You scout. Look for water. Look for threats. Look for anything that might help. Or hurt. Because in this land, everything can be either. Everything can be both.</p>`;
            if (result.success) {
                return `<p>You find it. A stream. Clean water. Good ground for a camp. Safe. Or safe enough. You mark the route. Remember the landmarks. The dangers. The advantages.</p>
                       <p>You return. Report. The unit benefits. Your reconnaissance saves time. Saves lives. Maybe. Your initiative improves morale. Keeps everyone safer. For now. For this moment. That's something. That's enough.</p>`;
            } else {
                return `<p>You stumble into them. French scouts. Three of them. Maybe four. You don't have time to count. Just fight. Just survive. You fight your way out. But not without cost. Not without blood.</p>
                       <p>You've learned. The land is not empty. Not safe. Not yours. The enemy is here. Watching. Waiting. Ready. You've learned the hard way. The only way that matters. The only way that sticks.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('morale', 1);
            } else if (result) {
                const woundRoll = Math.random();
                if (woundRoll < 0.4) {
                    addCondition('Wounded', 'negative', 2);
                }
                applyStatChange('stress', 1);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "chevauchée_burn"
            }
        ]
    },
    landing_raid: {
        title: "The First Raid",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Normandy",
        artwork: "artwork/naval-battle-3.jpg", // Another naval battle scene
        artworkCaption: "The first raid on French soil",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You join the raiders. Move fast. Move hard. No time for mercy. No time for thought. Just action. Just taking. Just doing what soldiers do. What you've been trained to do. What you're paid to do.</p>
                                   <p>The village ahead. Small. Defenseless. Full of things you need. Things you want. Things that will make you richer. Make you safer. Make you better. That's what you tell yourself. That's what you have to believe.</p>`;
            if (result.success) {
                return `<p>You take what you can. Silver. Food. Cloth. Anything of value. Anything that might help. Anything that might be worth something. You fill your pack. Fill your pockets. Fill your hands.</p>
                       <p>You're richer. Better equipped. Better prepared. But the villagers' hatred follows you. Their eyes. Their curses. Their silent promises. Resentment grows. Hatred takes root. You've fed yourself. But you've planted seeds. Seeds that will grow. That will bear fruit. Bitter fruit.</p>`;
            } else {
                return `<p>The chaos swallows you. Too many men. Too much noise. Too much confusion. You get separated. Lost. Alone in enemy land. You find your way back. Eventually. But you're shaken. The experience haunts you.</p>
                       <p>The raid was more chaotic than you expected. More brutal. More real. You thought you were ready. You weren't. You thought you understood. You didn't. War is always worse than you imagine. Always more. Always less.</p>`;
            }
        },
        onEnter: function() {
            const sceneKey = `landing_raid_${gameState.year}`;
            if (!gameState.enteredScenes.has(sceneKey)) {
                const result = window.gameState.lastResolution;
                if (result && result.success) {
                    applyStatChange('wealth', 5);
                    setFlag('Resentment', true);
                    applyStatChange('stress', 1);
                    
                    // Small chance to find equipment
                    if (Math.random() < 0.3) {
                        if (!gameState.inventory) gameState.inventory = [];
                        if (!gameState.inventory.find(i => i.id === 'buckler')) {
                            gameState.inventory.push({
                                id: 'buckler',
                                condition: 70,
                                fit: 'salvage',
                                stackCount: 1
                            });
                            showNotification('Equipment Found', 'You salvaged a Buckler from the raid!');
                        }
                    }
                } else if (result) {
                    addCondition('Shaken', 'negative', 1);
                    applyStatChange('stress', 1);
                }
                gameState.enteredScenes.add(sceneKey);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "chevauchée_burn"
            }
        ]
    },
    landing_banner: {
        title: "Staying with the Banner",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Normandy",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>The banner waves. Your anchor. Your guide. Your reason. You stay close. Stay disciplined. Stay where you're supposed to be. Where you're ordered to be. Where you're safe.</p>
                                   <p>Others break ranks. Run forward. Chase plunder. Chase glory. Chase death. But you stay. Hold your position. Do your duty. Because that's what soldiers do. That's what you do. That's who you are.</p>`;
            if (result.success) {
                return `<p>You stay disciplined. Stay close. Stay ready. The captain notices. Your reliability. Your steadiness. Your willingness to do what's needed. Not what's wanted. Not what's easy. What's needed.</p>
                       <p>You've earned favor. Avoided chaos. Avoided danger. Avoided the things that kill men. The things that break them. You've done right. Done well. Done what you should. That's something. That's enough.</p>`;
            } else {
                return `<p>They mock you. Call you timid. Call you coward. Call you names that cut. That hurt. That make you doubt. The taunts get under your skin. Into your head. Into your heart. You made the safe choice. The smart choice. But it doesn't feel that way.</p>
                       <p>Your morale suffers. Your confidence wavers. Your certainty fades. You did right. You know you did right. But knowing doesn't help. Doesn't stop the doubt. Doesn't stop the shame. Sometimes doing right feels wrong. Sometimes being safe feels like failure.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('patronFavor', 1);
            } else if (result) {
                applyStatChange('morale', -1);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "chevauchée_burn"
            }
        ]
    },
    chevauchée_burn: {
        title: "Chevauchée: The Burn Line",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Normandy",
        artwork: "artwork/burninglooting.jpg",
        artworkCaption: "The burn line - making the countryside bleed",
        text: `<p><strong>Mid-July 1346 — Normandy villages</strong></p>
               <p>You smell smoke before you see it. The raid is not "battle," it's pressure: make the countryside bleed wealth and confidence, force the enemy to respond, and keep the army fed while doing it.</p>
               <p>As you move through the village, you pass a small stone church. Its cross stands against the smoke-filled sky. Some of your men eye it with interest—churches hold silver, gold, offerings. Easy plunder. But something makes you pause. The building has stood here for generations. Sacred ground. Or so they say.</p>`,
        choices: [
            {
                text: "Torch barns to deny supplies",
                effects: {},
                nextScene: "chevauchée_torch",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 9
            },
            {
                text: "Take hostages for safe passage",
                effects: {},
                nextScene: "chevauchée_hostages",
                requiresResolution: true,
                resolutionStat: "charisma",
                resolutionDifficulty: 9
            },
            {
                text: "Encounter the church—spare it and move on",
                effects: {},
                nextScene: "chevauchée_spare",
                requiresResolution: true,
                resolutionStat: "morale",
                resolutionDifficulty: 9
            }
        ]
    },
    chevauchée_torch: {
        title: "The Burn Line",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Normandy",
        artwork: "artwork/burninglooting2.jpg",
        artworkCaption: "Burning barns to deny supplies",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>The barns stand ahead. Full of grain. Full of hay. Full of everything the enemy needs. Everything the villagers need. Everything that keeps people alive. Keeps them fed. Keeps them going.</p>
                                   <p>You approach. Torch in hand. Orders in mind. Duty in heart. But something else too. Something you don't want to name. Something you don't want to feel. But you feel it anyway. You always feel it.</p>`;
            if (result.success) {
                return `<p>You torch them. Efficiently. Quickly. The fire spreads. Takes hold. Burns bright. Burns hot. Burns everything. The grain. The hay. The hope. The future. You've denied supplies to the enemy. Done your job. Done what you were told.</p>
                       <p>The captain approves. Nods. Moves on. But you watched it burn. Watched the smoke rise. Watched the light fade. The weight of what you've done settles on you. Heavy. Real. Permanent. Your morale suffers. Your soul suffers. But you did it. You always do it.</p>`;
            } else {
                return `<p>You torch the barns. But the wind shifts. Changes direction. Turns against you. Your own baggage train catches fire. Your own supplies. Your own food. Your own hope. You've cost the unit. Cost yourself. Cost everything.</p>
                       <p>Your mistake is costly. In wealth. In reputation. In trust. In everything that matters. Everything you need. You tried to do right. Did what you were told. But it went wrong. It always goes wrong. Eventually. Always.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('patronFavor', 1);
                applyStatChange('morale', -1);
                applyStatChange('stress', 1);
            } else if (result) {
                applyStatChange('wealth', -3);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "caen_bridge"
            }
        ]
    },
    chevauchée_hostages: {
        title: "Taking Hostages",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Normandy",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>The villagers stand before you. Fearful. Resigned. Waiting. They know what's coming. They've seen it before. Heard the stories. Lived the nightmares. Now it's their turn. Their moment. Their fate.</p>
                                   <p>You approach. Sword in hand. Purpose in mind. But something else too. Something you don't want to think about. The faces. The eyes. The humanity. The people. Not enemies. Not targets. People. Just people.</p>`;
            if (result.success) {
                return `<p>You take them. Hostages. Bargaining chips. Currency. You negotiate. Safe passage. Their freedom. Their lives. They'll pay. They always pay. Because they have to. Because they want to live. Because there's no other choice.</p>
                       <p>You've established a network. A system. A way to profit from fear. From desperation. From the simple human need to survive. This could be profitable. Very profitable. But it comes with a cost. A weight. A burden. The knowledge of what you've done. What you've become.</p>`;
            } else {
                return `<p>You try to take them. Grab them. Hold them. But one escapes. Slippery. Fast. Desperate. He runs. Disappears. Gets away. He'll tell others. Warn them. Prepare them. Make them ready. Make them dangerous.</p>
                       <p>The risk of ambush increases. The risk of death grows. You've made enemies. Real enemies. People who know your face. Who remember. Who wait. Who plan. Who will find you. Eventually. Always. That's how it works. That's how it always works.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('wealth', 8);
                setFlag('Ransom Network', true);
            } else if (result) {
                setFlag('Ambush Risk', true);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "caen_bridge"
            }
        ]
    },
    chevauchée_spare: {
        title: "Sparing the Church",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Normandy",
        artwork: "artwork/monk.jpg",
        artworkCaption: "The ancient church stands against the smoke-filled sky",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You approach the church. The decision weighs on you. This is not a tactical choice. Not about supplies or hostages or military advantage. This is something else. Something deeper. A question of what you're willing to destroy. What you're willing to spare.</p>
                                   <p>The church stands. Stone. Ancient. Sacred. Or supposed to be. Supposed to mean something. Supposed to be protected. Respected. Left alone. But war doesn't respect. War doesn't protect. War doesn't care.</p>
                                   <p>You look at it. The cross. The walls. The silence. The peace. Or what's left of it. What war hasn't taken. What soldiers haven't destroyed. Yet. Because everything gets destroyed. Eventually. Everything gets taken. Everything gets broken.</p>`;
            if (result.success) {
                return `<p>You spare it. Order your men to move on. Leave it alone. Leave it whole. Leave it sacred. Some of your men respect the gesture. Nod. Understand. Or pretend to. Others don't. Others grumble. Others resent. But you did it. You made the choice. The right choice. The hard choice.</p>
                       <p>Your mercy improves morale. Reduces resentment. Makes you human. Makes you different. Makes you better. Or at least less worse. That's something. That's enough. Sometimes that's all you can hope for. All you can be.</p>`;
            } else {
                return `<p>You try to spare it. Give the order. Make the gesture. But your squad ignores you. Laughs. Moves past. Takes what they want. Does what they want. Does what soldiers do. What you're all supposed to do. What you're all trained to do.</p>
                       <p>You've lost control. Lost favor. Lost respect. The captain sees you as weak. Your men see you as weak. You see yourself as weak. Because you tried to be good. Tried to be better. Tried to be human. But in war, humanity is weakness. Mercy is failure. And you've failed. Again. Always.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('morale', 1);
                if (window.hasFlag('Resentment')) {
                    setFlag('Resentment', false);
                }
            } else if (result) {
                applyStatChange('patronFavor', -1);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "caen_bridge"
            }
        ]
    },
    caen_bridge: {
        title: "Caen: The Bridge Rush",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Caen, Normandy",
        text: `<p><strong>26 July 1346 — Caen</strong></p>
               <p>Orders exist. Then the first men sprint, and the town becomes a magnet for hunger, bravado, and unpaid grudges. Bridges choke with bodies. Someone shouts that the castle is still holding. Someone else shouts about silver in the new town.</p>`,
        choices: [
            {
                text: "Hold your file and push the bridge",
                effects: {},
                nextScene: "caen_bridge_hold",
                requiresResolution: true,
                resolutionStat: "morale",
                resolutionDifficulty: 9
            },
            {
                text: "Break ranks for loot",
                effects: {},
                nextScene: "caen_bridge_loot",
                requiresResolution: true,
                resolutionStat: "agility",
                resolutionDifficulty: 9
            },
            {
                text: "Take a noble prisoner instead of killing",
                effects: {},
                nextScene: "caen_bridge_prisoner",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 9
            }
        ]
    },
    caen_bridge_hold: {
        title: "Holding the Bridge",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Caen, Normandy",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>The bridge chokes with bodies. Men pushing. Shoving. Fighting. Dying. The crush is terrible. The noise is worse. Steel on steel. Screams. Curses. Prayers. Everything mixed. Everything loud.</p>
                                   <p>You push forward. Hold your file. Keep formation. Keep discipline. Keep moving. Because that's what you do. That's what you're trained to do. That's what keeps you alive. Keeps your men alive.</p>`;
            if (result.success) {
                return `<p>You hold. Push. Break through. Your unit follows. Your discipline holds. Your courage shows. Your leadership matters. You break through. Get across. Get to the other side. Get to safety. Or what passes for safety.</p>
                       <p>Your leadership earns favor. Significant favor. Your men respect you. Trust you. Follow you. Because you did it. You got them through. You kept them alive. For now. That's something. That's enough.</p>`;
            } else {
                return `<p>You push forward. Try to hold. Try to break through. But the crush is too much. Bodies everywhere. Weapons everywhere. Death everywhere. Something finds you. A blade. A spear. A piece of metal. It doesn't matter what. Just that it does. Just that you're wounded.</p>
                       <p>You've taken a serious injury. In the chaos. In the fight. In the bridge. You're bleeding. Hurting. Broken. But you're alive. For now. That's something. That's enough. Sometimes that's all you get.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('patronFavor', 2);
                applyStatChange('morale', 1);
                applyStatChange('stress', 1);
            } else if (result) {
                addCondition('Wounded', 'negative', 2);
                applyStatChange('stress', 2);
                gameState.career.wounds++;
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "prisoner_argument"
            }
        ]
    },
    caen_bridge_loot: {
        title: "Breaking for Loot",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Caen, Normandy",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>The town opens. Houses. Shops. Wealth. Everything you've been promised. Everything you've been fighting for. Everything that makes this worth it. Worth the risk. Worth the death. Worth the blood.</p>
                                   <p>You break ranks. Run forward. Grab what you can. Because you can. Because you want to. Because you need to. Because this is your chance. Your moment. Your reward. For everything. For all of it.</p>`;
            if (result.success) {
                return `<p>You grab it. Silver. Cloth. Jewelry. Anything valuable. Anything worth something. You fill your hands. Fill your pack. Fill your pockets. You're richer. Better off. Better equipped. Better prepared. For what comes next. For what always comes next.</p>
                       <p>But you've broken discipline. Broken formation. Broken trust. This will be remembered. Noted. Held against you. When you need it. When it matters. When the captain decides. When your fate is decided. You've gained wealth. But you've lost something. Something that might matter more. Eventually. Always.</p>`;
            } else {
                return `<p>You're caught. Breaking ranks. Grabbing loot. Doing what you're not supposed to do. What you're not allowed to do. The captain sees. Gets furious. Calls you out. Makes you pay. Makes you regret. Makes you remember.</p>
                       <p>You've lost favor. Significant favor. And maybe your health. Maybe your life. Because in the chaos, something happened. Something bad. Something that might kill you. Might break you. Might end you. All for loot. All for greed. All for nothing. Everything.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('wealth', 10);
                setFlag('Discipline', true);
                applyStatChange('stress', 1);
            } else if (result) {
                applyStatChange('patronFavor', -2);
                const woundChance = Math.random();
                if (woundChance < 0.5) {
                    addCondition('Wounded', 'negative', 2);
                    gameState.career.wounds++;
                }
                applyStatChange('stress', 2);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "prisoner_argument"
            }
        ]
    },
    caen_bridge_prisoner: {
        title: "Taking a Noble Prisoner",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Caen, Normandy",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You see him in the chaos. A noble. Fine armor. Rich clothes. Worth something. Worth everything. Worth a fortune. Worth your future. Worth your life. If you can take him. If you can keep him. If you can make him pay.</p>
                                   <p>The choice is simple. Kill him. Or take him. One ends a life. The other starts a fortune. One is final. The other is opportunity. One is war. The other is business. You have to decide. Now. Before someone else does. Before it's too late.</p>`;
            if (result.success) {
                return `<p>You take him. Prisoner. Captive. Currency. He's worth a fortune. In ransom. In connections. In everything that matters. In everything you need. You've secured him. Kept him alive. Kept him whole. For now. For later. For when you need him.</p>
                       <p>You've established yourself. In the ransom trade. In the business of war. In the economy of survival. This could change everything. Your wealth. Your status. Your future. If you can keep him. If you can make him pay. If you can survive long enough to collect.</p>`;
            } else {
                return `<p>You try to take him. Grab him. Hold him. But the chaos swallows you. Others grab him. Drag him away. Claim him. Take what's yours. What could have been yours. What should have been yours. But isn't. Not anymore. Not ever.</p>
                       <p>You're shaken. By the missed opportunity. By the violence. By the loss. By everything you've seen. Everything you've done. Everything you've failed to do. The chance is gone. The fortune is lost. The future is dimmer. But you're alive. That's something. That's all you have.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('wealth', 20);
                setFlag('Ransom Network', true);
            } else if (result) {
                addCondition('Shaken', 'negative', 1);
                applyStatChange('stress', 1);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "prisoner_argument"
            }
        ]
    },
    prisoner_argument: {
        title: "The Prisoner Argument",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Outside Caen, Normandy",
        text: `<p><strong>Late July 1346 — Outside Caen</strong></p>
               <p>A captured man-at-arms sits on the ground, helmet off, eyes flat. Two of your men both claim him. The law here is not clean. The stakes are not abstract: ransoms can change a life, and disputes can end in knives behind tents.</p>`,
        choices: [
            {
                text: "Demand a formal witness and division",
                effects: {},
                nextScene: "prisoner_formal",
                requiresResolution: true,
                resolutionStat: "charisma",
                resolutionDifficulty: 9
            },
            {
                text: "Split the claim",
                effects: {},
                nextScene: "prisoner_split",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 9
            },
            {
                text: "Steal the purse and walk away",
                effects: {},
                nextScene: "prisoner_steal",
                requiresResolution: true,
                resolutionStat: "agility",
                resolutionDifficulty: 9
            }
        ]
    },
    prisoner_formal: {
        title: "Formal Division",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Outside Caen, Normandy",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>Two men. One prisoner. Two claims. One truth. Or maybe no truth. Just greed. Just want. Just the need to profit from another man's capture. Another man's life.</p>
                                   <p>You step forward. Into the dispute. Into the danger. Because someone has to. Because if you don't, blood will flow. Lives will be lost. And you can't let that happen.</p>`;
            if (result.success) {
                return `<p>You demand it. Formal witnesses. Fair division. Proper law. Proper order. The dispute resolves. Without blood. Without death. Without everything that could have gone wrong.</p>
                       <p>Your leadership prevents a feud. Stops a war. Saves lives. The captain sees. Appreciates. Notices your judgment. Your courage. Your willingness to do what's right. Even when it's hard. Even when it's dangerous.</p>`;
            } else {
                return `<p>Both sides turn on you. Against you. Your attempt at fairness makes enemies. Your attempt at justice makes targets. Your attempt at right makes wrong. Everything backfires. Everything goes bad.</p>
                       <p>Your morale suffers. From the conflict. From the failure. From the knowledge that trying isn't enough. That doing right isn't enough. Sometimes nothing is enough. Sometimes everything fails.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('patronFavor', 1);
            } else if (result) {
                applyStatChange('morale', -1);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "denuded_country"
            }
        ]
    },
    prisoner_split: {
        title: "Splitting the Claim",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Outside Caen, Normandy",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>The solution is simple. Obvious. Split it. Divide it. Share it. Everyone gets something. No one gets everything. No one gets nothing. Fair. Or fair enough. Or as fair as war allows.</p>
                                   <p>You propose it. The split. The division. The compromise. Because compromise is better than conflict. Because sharing is better than fighting. Because something is better than nothing.</p>`;
            if (result.success) {
                return `<p>You split it. The claim. The ransom. The fortune. Between the two men. Everyone gets something. A share. A piece. The dispute ends. The conflict stops. The blood doesn't flow. For now. That's something. That's enough.</p>
                       <p>You've avoided escalation. Prevented death. Saved lives. And secured a share for yourself. Small. But something. A reward for doing right. For doing well. For doing what needed doing when no one else would.</p>`;
            } else {
                return `<p>The scuffle breaks out. Before you can resolve it. Before you can stop it. The prisoner dies. In the chaos. In the fight. In the greed. You're left with nothing. But guilt. But shame. But the knowledge of what you failed to prevent.</p>
                       <p>You're shaken. By the death. By the senselessness. By the waste. By everything that went wrong. Everything you couldn't stop. A man died. For nothing. For greed. For everything that makes war terrible.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('wealth', 3);
            } else if (result) {
                addCondition('Shaken', 'negative', 1);
                applyStatChange('stress', 1);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "denuded_country"
            }
        ]
    },
    prisoner_steal: {
        title: "Stealing the Purse",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Outside Caen, Normandy",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You see it. An opportunity. A chance. The purse. Full. Heavy. Valuable. Worth something. Worth taking. Worth stealing. If you're fast. If you're careful. If you're willing.</p>
                                   <p>The choice is simple. Take it. Or leave it. Steal it. Or respect it. Betray them. Or honor them. The purse calls. The greed calls. Louder than honor. Louder than loyalty. Louder than everything that should matter.</p>`;
            if (result.success) {
                return `<p>You steal it. Take it. Slip away. Fast. Quiet. Gone. You're richer. Better off. Better equipped. For what comes next.</p>
                       <p>But you've betrayed them. Your comrades. Your friends. Your brothers. The men who trust you. The men who depend on you. And you've stolen from them. Betrayed them. For wealth. For greed.</p>
                       <p>You've gained wealth. But lost honor. Lost trust. Lost everything that matters. Everything that makes you human. This will follow you. Haunt you. Define you. Until you die. Or until you make it right.</p>`;
            } else {
                return `<p>You're caught. Stealing. Taking. Betraying. The punishment is severe. The reputation is ruined. The trust is lost. Everything you've built. Everything you've earned. Everything you've become. Gone. In a moment. In a choice. In a mistake. That you can't take back. That you can't undo. That you can't fix.</p>
                       <p>You've lost favor. Significant favor. And trust. The trust of your unit. The trust of your captain. The trust of everyone who matters. Everyone who cared. Everyone who believed in you. They don't anymore. They won't. Not ever. Not again. You've broken it. Destroyed it. Killed it. For nothing. For greed. For everything that doesn't matter. But does. Always does.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('wealth', 5);
                setFlag('Dishonor', true);
                applyStatChange('stress', 1);
            } else if (result) {
                applyStatChange('patronFavor', -3);
                applyStatChange('stress', 2);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "denuded_country"
            }
        ]
    },
    denuded_country: {
        title: "Denuded Country",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Northern France",
        text: `<p><strong>Early–Mid August 1346 — Northward march</strong></p>
               <p>The French have stripped the land ahead: grain hauled off, wells fouled, bridges watched or broken. The army gets ragged. Men eat things they won't name. Someone suggests slaughtering baggage horses. Someone else suggests hanging thieves. Both are called "discipline."</p>`,
        choices: [
            {
                text: "Forage with restraint (pay or barter)",
                effects: {},
                nextScene: "denuded_forage",
                requiresResolution: true,
                resolutionStat: "charisma",
                resolutionDifficulty: 9
            },
            {
                text: "Slaughter a horse for the pot",
                effects: {},
                nextScene: "denuded_horse",
                requiresResolution: true,
                resolutionStat: "morale",
                resolutionDifficulty: 9
            },
            {
                text: "Make an example of a thief",
                effects: {},
                nextScene: "denuded_thief",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 9
            }
        ]
    },
    denuded_forage: {
        title: "Foraging with Restraint",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Northern France",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>The villagers watch you. Fearful. Resigned. They've seen soldiers before. They know what to expect. Taking. Demanding. Threatening. That's how it works.</p>
                                   <p>You approach slowly. Show your hands. No weapons. Just coins. Just barter. Just the promise of fairness. In a world that offers little. In a war that takes everything. You try to be different. Try to be better.</p>`;
            if (result.success) {
                return `<p>You forage with restraint. Pay. Barter. Trade fairly. The villagers stare. Disbelieving. Then grateful. One old man weeps. You didn't expect that. Didn't expect how much a small kindness could mean.</p>
                       <p>You've reduced resentment. Secured supplies. Without violence. Without blood. Without everything that makes war terrible. You've done right. Done well. That's something. That's enough.</p>`;
            } else {
                return `<p>They lie. About what they have. About what they need. You find nothing. Search. Look. Dig. But nothing. Empty. Barren. Stripped. Like the land. Like the people. Your unit goes hungry. You go hungry.</p>
                       <p>Your morale suffers. From the failure. From the hunger. From the knowledge that trying isn't enough. That being fair isn't enough. Sometimes nothing is enough. Sometimes everything fails.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                if (window.hasFlag('Resentment')) {
                    setFlag('Resentment', false);
                }
            } else if (result) {
                applyStatChange('morale', -1);
                applyStatChange('stress', 1);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "blanchetaque_ford"
            }
        ]
    },
    denuded_horse: {
        title: "Slaughtering a Horse",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Northern France",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>The horse stands. Tired. Thin. But alive. Still useful. Still valuable. Still a friend. Or supposed to be. Supposed to mean something. But hunger changes things. Changes priorities. Changes what you're willing to do.</p>
                                   <p>You look at it. The eyes. The trust. The bond. Or what's left of it. What war hasn't broken. What hunger hasn't destroyed. Yet. Because everything gets destroyed. Eventually. Everything gets used. For food. For survival.</p>`;
            if (result.success) {
                return `<p>You do it. Slaughter it. Kill it. For the pot. For the men. For survival. The men are fed. Morale improves. Hunger fades. For now. That's something. That's enough.</p>
                       <p>But you've lost a mount. A friend. A companion. You'll be on foot. When speed matters. When escape matters. You've traded one advantage for another. One life for others. That's how it works.</p>`;
            } else {
                return `<p>You can't do it. Can't bring yourself to kill it. To end it. Or you watch someone else do it. Someone else make the choice. Someone else bear the weight. The sight shakes you. The sound. The smell. It all shakes you. Breaks you.</p>
                       <p>You're shaken. By what you've seen. By what you've failed to do. By what you've allowed. The guilt. The shame. The knowledge that you're part of this. That you're complicit. For the death. For the waste. For everything that makes war terrible.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('morale', 1);
                setFlag('Lame Mount', true);
            } else if (result) {
                addCondition('Shaken', 'negative', 1);
                applyStatChange('stress', 1);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "blanchetaque_ford"
            }
        ]
    },
    denuded_thief: {
        title: "Making an Example",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Northern France",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>They catch him. A thief. Stealing rations. Taking what isn't his. What he needs. What everyone needs. But he took it. Stole it. Betrayed them. For hunger. For greed. For survival.</p>
                                   <p>You see him. Caught. Helpless. Waiting for judgment. For punishment. For death. Maybe. Or maybe something worse. Something that makes an example. Something that teaches. Something that's supposed to prevent. Supposed to stop. But never does.</p>`;
            if (result.success) {
                return `<p>You make an example. Harsh. Public. Terrible. Desertion decreases. Discipline improves. Fear grows. Respect fades. But order holds. For now. That's something. That's enough.</p>
                       <p>Your harsh justice earns favor. With the captain. With the officers. With everyone who matters. Everyone who decides. You've done what they wanted. What they needed. That's something.</p>`;
            } else {
                return `<p>Your attempt backfires. The squad turns cold. Sees you as a tyrant. As a monster. As everything they fear. Everything they hate. But you are. You've become. You've made yourself into this.</p>
                       <p>Your morale suffers. From the isolation. From the fear. From the knowledge that you've lost them. Lost their trust. Lost their respect. Lost everything that matters. You've gained favor. But lost yourself. For nothing. For order.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('patronFavor', 1);
            } else if (result) {
                applyStatChange('morale', -1);
                applyStatChange('stress', 1);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "blanchetaque_ford"
            }
        ]
    },
    blanchetaque_ford: {
        title: "Blanchetaque: Tidal Ford",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Blanchetaque, Somme River",
        artwork: "artwork/bridgerain.jpg",
        artworkCaption: "Crossing the Somme at Blanchetaque - the tide waits for no man",
        text: `<p><strong>24 August 1346 — Somme crossing at Blanchetaque</strong></p>
               <p>The ford is wide, the mud grabs ankles, and the tide is a clock you can't argue with. Crossbow bolts skip off the water like stones. Men try to keep powder-dry things dry in a world made of river.</p>`,
        choices: [
            {
                text: "Wade first with the forward file",
                effects: {},
                nextScene: "blanchetaque_wade",
                requiresResolution: true,
                resolutionStat: "endurance",
                resolutionDifficulty: 9
            },
            {
                text: "Hold formation and cover others",
                effects: {},
                nextScene: "blanchetaque_cover",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 9
            },
            {
                text: "Drag a drowning man out",
                effects: {},
                nextScene: "blanchetaque_rescue",
                requiresResolution: true,
                resolutionStat: "strength",
                resolutionDifficulty: 9
            }
        ]
    },
    blanchetaque_wade: {
        title: "Wading First",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Blanchetaque, Somme River",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>The water is cold. Deep. Dangerous. The mud grabs. Pulls. Holds. The tide is coming. Rising. Threatening. Crossbow bolts skip off the water. Off the mud. Death is everywhere. Waiting. Watching.</p>
                                   <p>You step into it. The water. The danger. Because someone has to. Because if you don't, no one will. And someone will die. That's certain. That's war.</p>`;
            if (result.success) {
                return `<p>You wade first. Lead the way. Across the ford. Through the danger. Through the death. The forward file follows. Your courage shows. Your leadership matters. Your example inspires. Your comrades follow. Trust you. Because you did it. You went first. You risked everything.</p>
                       <p>Your courage earns favor. Significant favor. And respect. And trust. You've done it. Done right. Done well. Done what needed doing when no one else would. That's something. That's enough.</p>`;
            } else {
                return `<p>The crossing is brutal. Terrible. Deadly. You take a bolt. Or fall in the mud. Or something else. Something bad. You're injured. Wounded. Broken. But you're alive. For now. That's something. That's all you have.</p>
                       <p>You've been wounded. In the crossing. In the danger. You're hurt. But you're across. On the other side. Safe. Or safe enough. As safe as war allows.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('patronFavor', 2);
                applyStatChange('morale', 1);
                applyStatChange('stress', 1);
            } else if (result) {
                const woundRoll = Math.random();
                if (woundRoll < 0.6) {
                    addCondition('Wounded', 'negative', 2);
                    gameState.career.wounds++;
                }
                applyStatChange('stress', 2);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "battle_crecy"
            }
        ]
    },
    blanchetaque_cover: {
        title: "Covering Others",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Blanchetaque, Somme River",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You take position. Shield raised. Eyes forward. Watching. Waiting. Ready. Others cross behind you. Trusting you. Depending on you. To hold. To cover. To protect. To keep them alive.</p>
                                   <p>The water churns. The mud grabs. The bolts fly. Death is everywhere. Waiting. Watching. But you hold. You cover. You do your job. Because that's what you do. That's what you're trained to do.</p>`;
            if (result.success) {
                return `<p>You hold formation. Cover others. Keep them safe. Your tactical sense shows. Reduces injuries. Saves lives. Makes a difference. In the chaos. In the danger. When only survival matters.</p>
                       <p>Your leadership improves morale. Saves lives. Makes you human. Makes you good. Or at least less bad. Less terrible. You've done right. Done well. That's something. That's enough.</p>`;
            } else {
                return `<p>Chaos erupts. Despite your efforts. Despite your best. The crossing becomes a disaster. Men fall. Die. Drown. In the water. In the mud. In the danger. You couldn't stop it. Couldn't prevent it. Couldn't save them.</p>
                       <p>You're shaken. By the failure. By the suffering. By everything you couldn't prevent. Everything you couldn't stop. The guilt. The shame. The knowledge that you failed. That you weren't enough. Sometimes nothing is enough.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('morale', 1);
            } else if (result) {
                addCondition('Shaken', 'negative', 1);
                applyStatChange('stress', 2);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "battle_crecy"
            }
        ]
    },
    blanchetaque_rescue: {
        title: "Rescuing a Drowning Man",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Blanchetaque, Somme River",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You see him. Struggling. In the water. In the mud. In the danger. Drowning. Dying. Fighting for air. For life. Just trying to survive. Like you. Like everyone.</p>
                                   <p>The choice is simple. Help him. Or leave him. Save him. Or let him die. Risk yourself. Or save yourself. The water is cold. The danger is real. The choice is yours.</p>`;
            if (result.success) {
                return `<p>You drag him to safety. To life. He'll remember. This moment. This choice. This debt. You've gained an ally. A friend. A brother. Someone who owes you. Someone who will help you when you need it.</p>
                       <p>Your heroism improves morale. Saves a life. Makes a difference. May help you later. May save you. In the future. In the danger. You've done right. Done well. That's something. That's enough.</p>`;
            } else {
                return `<p>You try to rescue him. To save him. To help him. But the effort exhausts you. Drains you. Breaks you. You lose time. Lose ground. The enemy pressure increases. The danger grows. The chance is gone.</p>
                       <p>You're fatigued. Empty. Broken. And the enemy is coming. The danger is growing. You tried. That's something. But trying isn't enough. Sometimes nothing is enough. Sometimes everything fails.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('morale', 1);
                setFlag('Ally', true);
            } else if (result) {
                addCondition('Fatigued', 'negative', 1);
                applyStatChange('stress', 1);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "battle_crecy"
            }
        ]
    },
    battle_crecy: {
        title: "The Battle of Crécy, 1346",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Crécy, Picardy",
        artwork: "artwork/battle-scene-2.jpg", // Mountainous battle scene with French vs English
        artworkCaption: "The Battle of Crécy - 26 August 1346",
        text: `<p><strong>⚠️ HISTORICAL EVENT: The Battle of Crécy - 26 August 1346</strong></p>
               <p>A sudden rain breaks, then stops. Bowstrings are handled like lifelines. The French come on late, crowded, impatient. You hear the word "oriflamme" and understand what that implies for anyone taken alive. The first line wavers; the second line steps on them.</p>`,
        choices: [
            {
                text: "Stay planted in the defensive line",
                effects: {},
                nextScene: "crecy_defensive",
                requiresResolution: true,
                resolutionStat: "morale",
                resolutionDifficulty: 9
            },
            {
                text: "Run forward to strip a fallen noble",
                effects: {},
                nextScene: "crecy_loot",
                requiresResolution: true,
                resolutionStat: "agility",
                resolutionDifficulty: 9
            },
            {
                text: "Pull wounded back under fire",
                effects: {},
                nextScene: "crecy_rescue",
                requiresResolution: true,
                resolutionStat: "strength",
                resolutionDifficulty: 9
            }
        ]
    },
    crecy_defensive: {
        title: "Holding the Line",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Crécy, Picardy",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You take your position. In the line. In the formation. The French come. Thousands. Too many. More than you can count. More than you can imagine. But you hold. You stand. You do your job. Because that's what you do. That's what you're trained to do.</p>
                                   <p>The longbowmen ready. Arrows nocked. Strings drawn. Waiting for the signal. For the order. For the moment when everything changes. When everything breaks.</p>`;
            const difficulty = result.baseDifficulty || 9;
            const neededRoll = difficulty - result.effectiveStat;
            const successChance = Math.max(0, Math.min(100, ((10 - neededRoll + 1) / 10) * 100));
            const rollDisplay = `<div class="dice-roll">
                <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
                <br><em>Chance to succeed: ${Math.round(successChance)}%</em>
                <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
            </div>`;
            if (result.success) {
                return `${rollDisplay}<p>You stay planted. In the line. In the formation. Holding your position. With discipline. With courage. With everything you have. The longbowmen do their work. Arrows fly. Death comes. But not for you. Not today. Not here.</p>
                       <p>You survive. The battle. The danger. Your courage earns favor. Significant favor. Your discipline shows. Your morale is strong. Your will holds. For now. That's something. That's enough.</p>`;
            } else {
                return `${rollDisplay}<p>The battle is fierce. Terrible. Deadly. You hold. As long as you can. As hard as you can. As well as you can. But something finds you. A blade. An arrow. A piece of metal. It doesn't matter what. Just that it does. Just that you're wounded. Just that you're hurt.</p>
                       <p>You've been wounded. But you survived. Crécy. The battle. The danger. You're alive. For now. That's something. That's all you have. Sometimes that's all you get.</p>`;
            }
        },
        onEnter: function() {
            setFlag('survivedCrecy', true);
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('patronFavor', 2);
                applyStatChange('morale', 1);
                applyStatChange('experience', 20);
                applyStatChange('stress', 2);
                gameState.career.battles++;
            } else if (result) {
                addCondition('Wounded', 'negative', 2);
                applyStatChange('stress', 3);
                gameState.career.wounds++;
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "crecy_night"
            }
        ]
    },
    crecy_loot: {
        title: "Stripping the Fallen",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Crécy, Picardy",
        artwork: "artwork/looting.jpg",
        artworkCaption: "Stripping the dead - the business of war",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You see him. A fallen noble. Rich armor. Fine clothes. Worth something. Worth everything. Worth a fortune. Worth your future. If you can take it. If you can keep it. If you can make it yours. Before someone else does. Before it's too late. Before the moment passes.</p>
                                   <p>The choice is simple. Strip him. Or leave him. Take his wealth. Or respect his death. Profit from his fall. Or honor his memory. The arrows still fly. The danger is real. But the opportunity calls. The greed calls. The need calls. Louder than honor. Louder than respect. Louder than everything that should matter. But doesn't. Not now. Not here. Not in this moment.</p>`;
            const difficulty = result.baseDifficulty || 9;
            const neededRoll = difficulty - result.effectiveStat;
            const successChance = Math.max(0, Math.min(100, ((10 - neededRoll + 1) / 10) * 100));
            const rollDisplay = `<div class="dice-roll">
                <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
                <br><em>Chance to succeed: ${Math.round(successChance)}%</em>
                <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
            </div>`;
            if (result.success) {
                return `${rollDisplay}<p>You run forward. Fast. Desperate. Greedy. Strip him. Take his valuables. His wealth. You're richer. Better off. Better equipped. For what comes next.</p>
                       <p>But you've dishonored yourself. Lost your honor. Lost your respect. Lost everything that makes you human. You've gained wealth. But lost honor. Lost trust. Lost yourself. This will follow you. Haunt you. Define you. Until you die. Or until you make it right.</p>`;
            } else {
                return `${rollDisplay}<p>You're nearly hit. By arrows. By danger. Or injured. In the attempt. In the greed. You're shaken. Possibly wounded. Definitely scared. By the risk. By the failure. By everything that went wrong.</p>
                       <p>You've risked everything. For nothing. For greed. For want. You tried. That's something. But trying isn't enough. Sometimes nothing is enough. Sometimes everything fails.</p>`;
            }
        },
        onEnter: function() {
            setFlag('survivedCrecy', true);
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('wealth', 15);
                setFlag('Dishonor', true);
                applyStatChange('stress', 2);
            } else if (result) {
                addCondition('Shaken', 'negative', 1);
                const woundChance = Math.random();
                if (woundChance < 0.4) {
                    addCondition('Wounded', 'negative', 2);
                    gameState.career.wounds++;
                }
                applyStatChange('stress', 3);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "crecy_night"
            }
        ]
    },
    crecy_rescue: {
        title: "Pulling Wounded Back",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Crécy, Picardy",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You see them. Wounded men. Bleeding. Dying. Calling. For help. For mercy. For someone. For you. Maybe. If you're willing. If you're able. If you're brave enough. Or stupid enough. Or human enough. To risk yourself. To save them. To do what's right. Even when it's wrong. Even when it's dangerous. Even when it costs you.</p>
                                   <p>The arrows still fly. The danger is real. The moment is now. The choice is yours. Help them. Or leave them. Save them. Or let them die. Risk yourself. Or save yourself. The decision is everything. Or nothing. Always.</p>`;
            const difficulty = result.baseDifficulty || 9;
            const neededRoll = difficulty - result.effectiveStat;
            const successChance = Math.max(0, Math.min(100, ((10 - neededRoll + 1) / 10) * 100));
            const rollDisplay = `<div class="dice-roll">
                <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
                <br><em>Chance to succeed: ${Math.round(successChance)}%</em>
                <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
            </div>`;
            if (result.success) {
                return `${rollDisplay}<p>You pull them back. Under fire. Through danger. Through death. Your heroism shows. Saves lives. Reduces losses. Makes a difference. In the chaos. When only survival matters.</p>
                       <p>Your courage improves morale. Earns respect. Makes you human. Makes you good. Or at least less bad. Less terrible. You've done right. Done well. That's something. That's enough.</p>`;
            } else {
                return `${rollDisplay}<p>You try to rescue them. To save them. To help them. But you're wounded. In the attempt. In the danger. And exhausted. Drained. Broken. By the effort. By the risk. By the knowledge that trying isn't enough.</p>
                       <p>You've been wounded. And fatigued. But you tried. To do the right thing. To be human. To be good. That's something. That's enough. Sometimes trying is enough. Sometimes being human is enough.</p>`;
            }
        },
        onEnter: function() {
            setFlag('survivedCrecy', true);
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('morale', 1);
                applyStatChange('experience', 15);
                applyStatChange('stress', 2);
                gameState.career.battles++;
            } else if (result) {
                addCondition('Wounded', 'negative', 2);
                addCondition('Fatigued', 'negative', 1);
                applyStatChange('stress', 3);
                gameState.career.wounds++;
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "crecy_night"
            }
        ]
    },
    crecy_night: {
        title: "Night on the Field",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Crécy, Picardy",
        text: `<p><strong>Night of 26 August 1346 — Outside Crécy</strong></p>
               <p>The field isn't quiet; it's busy in a different way. You can hear metal being unbuckled in the dark. Some men look for friends. Some look for profit. Some look for a way to sleep without dreaming.</p>`,
        choices: [
            {
                text: "Focus on wounded and water",
                effects: {},
                nextScene: "crecy_night_wounded",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 9
            },
            {
                text: "Strip gear carefully (not greedily)",
                effects: {},
                nextScene: "crecy_night_gear",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 9
            },
            {
                text: "Hunt for captives worth ransom",
                effects: {},
                nextScene: "crecy_night_ransom",
                requiresResolution: true,
                resolutionStat: "charisma",
                resolutionDifficulty: 9
            }
        ]
    },
    crecy_night_wounded: {
        title: "Tending the Wounded",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Crécy, Picardy",
        artwork: "artwork/afterbattle.jpg",
        artworkCaption: "Night on the field - tending the wounded",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You move among the wounded...</p>`;
            if (result.success) {
                return `<p>You focus on the wounded and securing water. Your care helps many, and you find some peace in useful work.</p>
                       <p>You've removed shaken or fatigued conditions and improved morale through service.</p>`;
            } else {
                return `<p>You try to help, but you miss a curable wound that becomes infected. Your failure haunts you.</p>
                       <p>Infection spreads. This will cause problems later.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                if (hasCondition('Shaken')) removeCondition('Shaken');
                if (hasCondition('Fatigued')) removeCondition('Fatigued');
                applyStatChange('morale', 1);
                applyStatChange('stress', -1);
            } else if (result) {
                setFlag('Infection', true);
                applyStatChange('stress', 1);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "march_to_calais"
            }
        ]
    },
    crecy_night_gear: {
        title: "Stripping Gear Carefully",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Crécy, Picardy",
        artwork: "artwork/battle-aftermath.jpg", // Post-battle scene with fallen soldiers
        artworkCaption: "The aftermath of battle",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You search the field...</p>`;
            if (result.success) {
                return `<p>You strip gear carefully from the fallen. Your careful approach pays off.</p>`;
            } else {
                return `<p>You're accused of theft. Your reputation suffers, even though you meant no harm.</p>
                       <p>You've lost favor through misunderstanding.</p>`;
            }
        },
        onEnter: function() {
            const sceneKey = `crecy_night_gear_${gameState.year}`;
            if (!gameState.enteredScenes.has(sceneKey)) {
                const result = window.gameState.lastResolution;
                if (result && result.success) {
                    // Add equipment to inventory
                    if (!gameState.inventory) gameState.inventory = [];
                    
                    // Chance to find various equipment
                    const equipmentChance = Math.random();
                    if (equipmentChance < 0.5) {
                        // Find a better weapon or armor piece
                        const items = ['arming_sword', 'padded_jack', 'kettle_hat'];
                        const foundItem = items[Math.floor(Math.random() * items.length)];
                        if (!gameState.inventory.find(i => i.id === foundItem)) {
                            gameState.inventory.push({
                                id: foundItem,
                                condition: 60 + Math.floor(Math.random() * 30),
                                fit: 'salvage',
                                stackCount: 1
                            });
                            const itemName = foundItem.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                            showNotification('Equipment Found', `You salvaged a ${itemName} from the battlefield!`);
                        }
                    }
                    
                    // Old format compatibility
                    const gearRoll = Math.random();
                    if (gearRoll < 0.5 && gameState.equipment && gameState.equipment.weapon) {
                        const currentQuality = getEquipmentQuality('weapon');
                        setEquipmentQuality('weapon', Math.min(3, currentQuality + 1));
                    } else {
                        applyStatChange('wealth', 8);
                    }
                } else if (result) {
                    applyStatChange('patronFavor', -1);
                }
                gameState.enteredScenes.add(sceneKey);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "march_to_calais"
            }
        ]
    },
    crecy_night_ransom: {
        title: "Hunting for Captives",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Crécy, Picardy",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You search for valuable captives...</p>`;
            if (result.success) {
                return `<p>You find a captive worth a fortune in ransom. Your network pays off.</p>
                       <p>You've secured significant wealth and established yourself in the ransom trade.</p>`;
            } else {
                return `<p>You're threatened by others hunting the same prize. The danger shakes you.</p>
                       <p>You're shaken by the close call.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('wealth', 25);
                setFlag('Ransom Network', true);
            } else if (result) {
                addCondition('Shaken', 'negative', 1);
                applyStatChange('stress', 1);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "march_to_calais"
            }
        ]
    },
    march_to_calais: {
        title: "The March to Calais",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Northern France",
        artwork: "artwork/march.jpg",
        artworkCaption: "The long march - eight days to Calais",
        text: `<p><strong>Late August–Early September 1346 — Northern France</strong></p>
               <p>The field at Crécy grows quiet. The dead are buried or left to the crows. The wounded are tended or abandoned. The living gather what they can and prepare to move.</p>
               <p>King Edward's decision comes down: we march north. To Calais. The port town that controls the Channel. Capture it, and England has a permanent foothold in France. A gateway. A base. A prize worth the risk.</p>
               <p>The French army is broken. Scattered. But not gone. They'll regroup. They'll pursue. You know this. Everyone knows this. But for now, the road north is open. The march begins.</p>
               <p>Eight days. That's how long it takes. Eight days of marching through French countryside. Past burned villages. Past fields stripped bare. Past the evidence of what war does to a land. The column moves steadily. Purposefully. Toward Calais.</p>
               <p>You march with the others. Your gear is heavier now. Your body aches. But you keep moving. Because that's what you do. That's what soldiers do. You march. You fight. You survive. And you keep marching.</p>
               <p>On the horizon, Calais appears. A walled town. A fortress. A prize. The siege will be long. Hard. But that's tomorrow's problem. Today, you've arrived. Today, the real work begins.</p>`,
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "calais_siege"
            }
        ]
    },
    calais_siege: {
        title: "Calais: The Siege Town",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Calais, France",
        artwork: "artwork/seige.jpg",
        artworkCaption: "The siege camp outside Calais - endless work and waiting",
        text: `<p><strong>4 September 1346 — Calais</strong></p>
               <p>The work is endless: ditches, stakes, palisades, watch rotations, and the slow mathematics of starvation. A whole little city of tents grows outside the walls. The first weeks feel almost orderly—until the latrines overflow and the water tastes wrong.</p>`,
        choices: [
            {
                text: "Dig proper latrines and enforce distance from water",
                effects: { reputation: 1 },
                stressCost: 2, // Smart action = costs stress
                badOutcomeChance: 8, // Low chance (smart action)
                badOutcomeStupidity: 'smart',
                badOutcomes: [
                    {
                        chance: 8,
                        condition: 'Infected Foot Cut',
                        statDebuffs: { strength: -2, endurance: -3 },
                        permanent: true,
                        text: "You cut your foot on a sharp stone while digging. The cut becomes infected. You're limping now. The pain is constant.",
                        nextScene: "calais_latrines"
                    }
                ],
                nextScene: "calais_latrines",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 9
            },
            {
                text: "Volunteer for dangerous night duty",
                effects: {},
                nextScene: "calais_night",
                requiresResolution: true,
                resolutionStat: "morale",
                resolutionDifficulty: 9
            },
            {
                text: "Skim from supply wagons",
                effects: { wealth: 5 },
                stressCost: 0, // Stupid action = no stress cost
                badOutcomeChance: 35, // High chance (stupid action)
                badOutcomeStupidity: 'stupid',
                badOutcomes: [
                    {
                        chance: 30,
                        condition: 'Caught Stealing',
                        statDebuffs: { reputation: -2, morale: -1 },
                        text: "You're caught. The quartermaster has you flogged. Your reputation suffers.",
                        nextScene: "calais_skim"
                    },
                    {
                        chance: 10,
                        condition: 'Severely Punished',
                        statDebuffs: { reputation: -3, morale: -2, endurance: -1 },
                        text: "You're caught and severely punished. The quartermaster makes an example of you.",
                        nextScene: "calais_skim"
                    }
                ],
                nextScene: "calais_skim",
                requiresResolution: true,
                resolutionStat: "agility",
                resolutionDifficulty: 9
            }
        ]
    },
    calais_latrines: {
        title: "Improving Sanitation",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Calais, France",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You look at the camp. The filth. The stench. The disease. The death. Everything that kills men. Slowly. Quietly. Without glory. Without honor. Just sickness. Just waste.</p>
                                   <p>The latrines overflow. The water tastes wrong. The air smells of death. Of decay. You know what needs doing. What should be done. What might save lives. If anyone listens. If anyone cares.</p>`;
            if (result.success) {
                return `<p>You dig them. Proper latrines. Deep. Far from water. Enforced. Maintained. Clean. Or clean enough. Or as clean as war allows. Disease decreases. In your area. In your section. Lives are saved. Health improves. Hope returns. For now. That's something. That's enough.</p>
                       <p>Your foresight reduces sickness. Earns favor. Makes a difference. In the chaos. In the death. You've done right. Done well. Done what needed doing when no one else would. That's something. That's enough.</p>`;
            } else {
                return `<p>They ignore you. Your suggestions. Your efforts. The camp remains unhealthy. Unclean. Unsafe. Men still die. Still get sick. Still suffer. Because no one listened. No one cared. No one was willing.</p>
                       <p>You've tried. That's something. But trying isn't enough. Sometimes nothing is enough. Sometimes everything fails. The knowledge weighs. Heavy. Real. Permanent. You did what you could. But it wasn't enough. It never is.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('patronFavor', 1);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "winter_flux"
            }
        ]
    },
    calais_night: {
        title: "Night Duty",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Calais, France",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>The conversation around the fire ends. Men drift to their tents. The night watch needs volunteers. Someone must stand guard in the dark, watching for French sorties, for enemy scouts, for anything that moves in the shadows.</p>
                                   <p>Night duty. Dangerous. Dark. Deadly. The enemy watches. Waits. Plans. Attacks. In the dark. In the silence. In the moment when you're weakest. When you're tired. When you're alone.</p>
                                   <p>You volunteer. Step forward. Take the risk. Because someone has to. Because if you don't, someone else will. And they might not be ready. Might not be able. Might not survive. But you might. You hope. You try.</p>`;
            if (result.success) {
                return `<p>You perform well on the duty, in the danger. Your courage shows and is noted, is remembered by the captain, by your men, by everyone who matters. You've done right, done well. That's something. That's enough.</p>
                       <p>You've earned significant favor and improved morale through service, through courage, through everything that makes you human and good. Or at least less bad, less terrible. You've done right, done well. That's something. That's enough.</p>`;
            } else {
                return `<p>Night duty is dangerous. Terrible. Deadly. You're wounded. In a skirmish. Or an accident. Or something else. Something bad. You're hurt. But you're alive. For now. That's something. That's all you have.</p>
                       <p>You've been wounded. But you tried. To serve. To do right. To be good. That's something. That's enough. Sometimes trying is enough. Sometimes being human is enough.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('patronFavor', 2);
                applyStatChange('morale', 1);
                applyStatChange('stress', 1);
            } else if (result) {
                addCondition('Wounded', 'negative', 2);
                applyStatChange('stress', 2);
                gameState.career.wounds++;
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "winter_flux"
            }
        ]
    },
    calais_skim: {
        title: "Skimming Supplies",
        year: 1346,
        age: function() { return window.gameState.age; },
        location: "Calais, France",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You watch them. The wagons. Full. Heavy. Valuable. Worth something. Worth taking. Worth stealing. If you're fast. If you're careful. If you're willing. To risk everything. For nothing. For greed.</p>
                                   <p>The opportunity calls. The greed calls. Louder than honor. Louder than loyalty. Louder than everything that should matter. The choice is simple. Take it. Or leave it. Steal it. Or respect it. The decision is yours.</p>`;
            if (result.success) {
                return `<p>You skim from them. The wagons. The supplies. Without being caught. Fast. Quiet. Gone. You're richer. Better off. Better equipped. For what comes next.</p>
                       <p>But you've dishonored yourself. Lost your honor. Lost your respect. Lost everything that makes you human. You've gained wealth. But lost honor. Lost trust. Lost yourself. This will follow you. Haunt you. Define you. Until you die. Or until you make it right.</p>`;
            } else {
                return `<p>You're caught. Stealing. Taking. Betraying. The punishment is severe. The reputation is ruined. The trust is lost. Everything you've built. Everything you've earned. Everything you've become. Gone. In a moment. In a choice. In a mistake. That you can't take back. That you can't undo. That you can't fix.</p>
                       <p>You've lost favor. Significant favor. And trust. The trust of your unit. The trust of your captain. The trust of everyone who matters. Everyone who cared. Everyone who believed in you. They don't anymore. They won't. Not ever. Not again. You've broken it. Destroyed it. Killed it. For nothing. For greed. For everything that doesn't matter. But does. Always does.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('wealth', 10);
                setFlag('Dishonor', true);
                applyStatChange('stress', 1);
            } else if (result) {
                applyStatChange('patronFavor', -3);
                applyStatChange('stress', 2);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "winter_flux"
            }
        ]
    },
    winter_flux: {
        title: "Winter 1346–47: The Flux",
        year: 1347,
        age: function() { return window.gameState.age; },
        location: "Calais, France",
        text: `<p><strong>Winter 1346–47 — Calais lines / Neuville area</strong></p>
               <p>Men call it "bad water" until it isn't a joke. The camp shrinks. Rotations get longer. A cook is found watering the stew. A man hangs himself from a wagon frame before dawn and no one claims to have heard anything.</p>`,
        choices: [
            {
                text: "Boil water, enforce cleanliness",
                effects: {},
                nextScene: "flux_clean",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 9
            },
            {
                text: "Buy better food at ruinous prices",
                effects: {},
                nextScene: "flux_food"
            },
            {
                text: "Look away and survive",
                effects: {},
                nextScene: "flux_survive",
                requiresResolution: true,
                resolutionStat: "morale",
                resolutionDifficulty: 9
            }
        ]
    },
    flux_clean: {
        title: "Enforcing Cleanliness",
        year: 1347,
        age: function() { return window.gameState.age; },
        location: "Calais, France",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You start boiling it. The water. Because you know what happens if you don't. What happens when men drink bad water. When they get sick. When they die. Slowly. Quietly. Without glory. Without honor. Just sickness. Just waste.</p>
                                   <p>You enforce it. Cleanliness. Distance. Order. Everything that might help. Everything that might save lives. Health. Hope. If anyone listens. If anyone cares.</p>`;
            if (result.success) {
                return `<p>You boil it. Enforce it. Maintain it. The water. The cleanliness. The order. You avoid the sickness. That claims so many. That kills so many. You survive. Stay healthy. Stay whole. For now. That's something. That's enough.</p>
                       <p>Your discipline saves you. From the flux. From the death. And earns favor. From the captain. From your men. From everyone who matters. You've done right. Done well. Done what needed doing. That's something. That's enough.</p>`;
            } else {
                return `<p>You try to boil it. To enforce it. To maintain it. But you get sick anyway. The flux finds you. Weakens you. Breaks you. Despite your efforts. Despite your best. You're sick. Tired. Broken. By the illness. By the failure. By the knowledge that trying isn't enough.</p>
                       <p>You're fatigued. From the illness. From the weakness. You tried. That's something. But trying isn't enough. Sometimes nothing is enough. Sometimes everything fails. The knowledge weighs. Heavy. Real. Permanent. You did what you could. But it wasn't enough. It never is.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('patronFavor', 1);
            } else if (result) {
                addCondition('Fatigued', 'negative', 2);
                addCondition('Sick', 'negative', 2);
                applyStatChange('stress', 2);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "calais_keys"
            }
        ]
    },
    flux_food: {
        title: "Buying Better Food",
        year: 1347,
        age: function() { return window.gameState.age; },
        location: "Calais, France",
        text: function() {
            const cost = 15;
            if (gameState.stats.wealth >= cost) {
                return `<p>You buy it. Better food at ruinous prices—three times what it should cost, four times, five. But you pay because you have to, because you need to. Hunger kills slowly, quietly, without glory or honor. Just weakness. Just waste.</p>
                       <p>You're fed. Your morale improves. Your health holds for now. That's something. That's enough. You've spent wealth to prevent fatigue, to maintain health, to stay alive and whole and human. Or what's left of it. What war hasn't broken yet.</p>`;
            } else {
                return `<p>You can't afford it. Better food. Better health. Better chance of survival. Of living. The hunger grows. The despair deepens. The weakness spreads. Through you. Through your men. The knowledge weighs. Heavy. Real. Permanent. You don't have enough. You never do.</p>
                       <p>You're shaken. By your poverty. By the suffering. By everything you can't change. Everything you can't fix. The guilt. The shame. The knowledge that you're part of this. That you're complicit. For the hunger. For the death. For everything that makes war terrible.</p>`;
            }
        },
        onEnter: function() {
            const cost = 15;
            if (gameState.stats.wealth >= cost) {
                applyStatChange('wealth', -cost);
                applyStatChange('morale', 1);
                applyStatChange('stress', -1);
            } else {
                addCondition('Shaken', 'negative', 1);
                applyStatChange('stress', 1);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "calais_keys"
            }
        ]
    },
    flux_survive: {
        title: "Looking Away",
        year: 1347,
        age: function() { return window.gameState.age; },
        location: "Calais, France",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You try to ignore it. The suffering. The death. Because you have to. Because you need to. Because looking means seeing. Seeing means feeling. Feeling means breaking. And you can't break. Not now. Not here. Not when you need to survive. When you need to stay whole. When you need to stay human. Or what's left of it. What war hasn't broken. Yet.</p>
                                   <p>The choice is simple. Look away. Or look. Ignore it. Or see it. Survive through numbness. Or break through feeling. The decision is yours. But you know. Deep down. You know. That looking away costs something. That numbness has a price. That survival comes with a burden. A weight. A debt. That you'll pay. Eventually.</p>`;
            if (result.success) {
                return `<p>You look away. Ignore it. Survive through numbness. Through distance. Through everything that keeps you whole. Keeps you alive. Keeps you going. You've hardened yourself. Made yourself cold. Made yourself strong. Or at least strong enough. To survive. To endure. When everything breaks. When everyone dies. When nothing matters but survival.</p>
                       <p>Your emotional distance improves morale. Keeps you whole. Keeps you alive. But at a cost. To your humanity. To your soul. To everything that makes you human. Makes you good. Makes you real. You've gained survival. But lost yourself. Lost your humanity. Lost everything that matters. This will follow you. Haunt you. Define you. Until you die. Or until you make it right.</p>`;
            } else {
                return `<p>You can't look away. Can't ignore it. Can't distance yourself. The suffering shakes you. To your core. To your soul. To everything that makes you human. Makes you good. Makes you real. You see it. Feel it. Break from it. The guilt. The shame. The knowledge that you're part of this. That you're complicit. For the suffering. For the death. For everything that makes war terrible.</p>
                       <p>You're shaken. By what you've witnessed. By what you've seen. By what you've felt. The knowledge weighs. Heavy. Real. Permanent. You can't unsee it. Can't undo it. The suffering. The death. It's part of you now. Until you die. Or until you make it right.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('morale', 1);
                setFlag('Hardness', true);
            } else if (result) {
                addCondition('Shaken', 'negative', 1);
                applyStatChange('stress', 2);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "calais_keys"
            }
        ]
    },
    calais_keys: {
        title: "The Keys of Calais",
        year: 1347,
        age: function() { return window.gameState.age; },
        location: "Calais, France",
        text: `<p><strong>3–4 August 1347 — Calais surrenders</strong></p>
               <p>Months have passed since the siege began. The town has held. Starved. Suffered. But held. Now word spreads through the camp: negotiations have concluded. The terms are set. Calais will surrender.</p>
               <p>The gates open on terms. Six citizens step out with the keys. You see what starvation does to a wealthy city: not dramatic collapse, just thinning. The king's anger is a thing you can feel in your teeth—then it turns, because a queen speaks.</p>`,
        choices: [
            {
                text: "Stay disciplined and silent",
                effects: {},
                nextScene: "keys_disciplined",
                requiresResolution: true,
                resolutionStat: "morale",
                resolutionDifficulty: 9
            },
            {
                text: "Offer water to a citizen",
                effects: {},
                nextScene: "keys_water",
                requiresResolution: true,
                resolutionStat: "morale",
                resolutionDifficulty: 9
            },
            {
                text: "Grab a souvenir (keys/cloth/coin)",
                effects: {},
                nextScene: "keys_souvenir",
                requiresResolution: true,
                resolutionStat: "agility",
                resolutionDifficulty: 9
            }
        ]
    },
    keys_disciplined: {
        title: "Staying Disciplined",
        year: 1347,
        age: function() { return window.gameState.age; },
        location: "Calais, France",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You stand at attention. Silent. Still. Professional. Because that's what you do. That's what you're trained to do. That's what keeps you alive. Keeps you whole. Keeps you human. Or what's left of it. What war hasn't broken. Yet.</p>
                                   <p>The citizens step forward. With keys. With surrender. They're thin. Starved. Broken. By the siege. By the hunger. You watch. Silent. Respectful. Or trying to be. Trying to be human. Trying to be good. In a moment. In a world that makes it hard.</p>`;
            if (result.success) {
                return `<p>You stay disciplined and silent during the surrender. Your professionalism shows and is noted, is remembered by the captain, by your men, by everyone who matters. You've done right, done well. That's something. That's enough.</p>
                       <p>You've earned favor and maintained honor, kept your respect and humanity, kept yourself whole and good and human. Or what's left of it, what war hasn't broken yet. You've done right, done well. That's something. That's enough.</p>`;
            } else {
                return `<p>You join them. The jeering crowd. The mocking voices. Your lack of discipline shows. Is noted. Is remembered. By the captain. By your men. By everyone who matters. You've done wrong. Done poorly. That's something.</p>
                       <p>You've dishonored yourself. Through poor behavior. Through lack of respect. Through everything that makes you less. Less human. Less good. You've lost honor. Lost respect. Lost yourself. This will follow you. Haunt you. Define you. Until you die. Or until you make it right.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('patronFavor', 1);
                applyStatChange('morale', 1);
            } else if (result) {
                setFlag('Dishonor', true);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "after_calais"
            }
        ]
    },
    keys_water: {
        title: "Offering Water",
        year: 1347,
        age: function() { return window.gameState.age; },
        location: "Calais, France",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You see him. A citizen. Thin. Starved. Broken. By the siege. By the hunger. He stands. With keys. With surrender. Waiting for judgment. For mercy. For death. Maybe. Or maybe something else. Something better. Something human. If you're willing. If you're able. To risk yourself. To help him. To do what's right. Even when it's wrong. Even when it's dangerous.</p>
                                   <p>The choice is simple. Offer water. Or don't. Help him. Or leave him. Show mercy. Or show nothing. The decision is yours. But you know. Deep down. You know. That mercy costs something. That kindness has a price. That humanity comes with a burden. A weight. A debt. That you'll pay. Eventually.</p>`;
            if (result.success) {
                return `<p>You offer it—water, life, mercy—to a citizen, to a stranger, to a human. The small act matters, improves morale, makes you human and good. Or at least less bad, less terrible. You've done right, done well. That's something. That's enough.</p>
                       <p>You've reduced hardness, maintained humanity, kept yourself whole and good and human. Or what's left of it, what war hasn't broken yet. You've done right, done well. That's something. That's enough.</p>`;
            } else {
                return `<p>You're mocked. For showing mercy. For being human. For doing right. The taunts get under your skin. Into your head. Into your heart. They call you weak. Call you soft. Call you names that cut. That hurt. That make you doubt. You did right. You know you did right. But knowing doesn't help. Doesn't stop the doubt. Sometimes doing right feels wrong. Sometimes being human feels like failure.</p>
                       <p>Your morale suffers. From the mockery. From the doubt. The knowledge weighs. Heavy. Real. Permanent. You tried. To be human. To be good. To do right. But it wasn't enough. It never is. Sometimes trying isn't enough. Sometimes being human isn't enough.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('morale', 1);
                if (window.hasFlag('Hardness')) {
                    setFlag('Hardness', false);
                }
            } else if (result) {
                applyStatChange('morale', -1);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "after_calais"
            }
        ]
    },
    keys_souvenir: {
        title: "Taking a Souvenir",
        year: 1347,
        age: function() { return window.gameState.age; },
        location: "Calais, France",
        text: function() {
            const result = window.gameState.lastResolution;
            if (!result) return `<p>You see it. An opportunity. A chance. Keys. Cloth. Coin. Worth something. Worth taking. Worth stealing. If you're fast. If you're careful. If you're willing. To risk everything. For nothing. For greed.</p>
                                   <p>The surrender is happening. The moment is now. The opportunity is here. The choice is simple. Take it. Or leave it. Steal it. Or respect it. The decision is yours. But you know. Deep down. You know. That taking costs something. That greed has a price. That dishonor comes with a burden. A weight. A debt. That you'll pay. Eventually.</p>`;
            if (result.success) {
                return `<p>You grab it—a souvenir. Keys, cloth, coin, something, anything worth taking. You're richer now, better off, better equipped for what comes next.</p>
                       <p>But you've dishonored yourself. Lost your honor and respect, lost everything that makes you human. You've gained wealth but lost honor, lost trust, lost yourself. This will follow you, haunt you, define you until you die or until you make it right.</p>`;
            } else {
                return `<p>You're caught. Taking. Stealing. Betraying. The punishment is severe. The reputation is ruined. The trust is lost. Everything you've built. Everything you've earned. Gone. In a moment. In a choice. In a mistake you can't take back.</p>
                       <p>You've lost favor. Through your greed. Through your want. The knowledge weighs. Heavy. Real. Permanent. You tried. To take. To steal. To profit. But it went wrong. It always goes wrong. Eventually. You've lost everything. For nothing. For greed.</p>`;
            }
        },
        onEnter: function() {
            const result = window.gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('wealth', 12);
                setFlag('Dishonor', true);
            } else if (result) {
                applyStatChange('patronFavor', -2);
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "after_calais"
            }
        ]
    },
    after_calais: {
        title: "After Calais",
        year: 1347,
        age: function() { return window.gameState.age; },
        location: "Calais, France",
        text: `<p>Calais has fallen. After months of siege. After starvation. After everything. The gates opened. The keys surrendered. The town is yours. England's. The king's. Yours. For now.</p>
               <p>The siege was long. Hard. Brutal. Men died. Of disease. Of hunger. Of wounds. But you survived. You're alive. For now. That's something. That's all you have. Sometimes that's all you get.</p>
               <p>The war continues. Always continues. Never ends. You've learned. That sieges are won. Not just by courage. But by patience. By endurance. By outlasting. By surviving. One day at a time. One week at a time. Until it ends. However it ends.</p>
               <p>Your journey continues. As a man-at-arms. As a soldier. As a survivor. The war has only begun. The years stretch ahead. Full of battles. Full of sieges. Full of everything that makes war terrible. You'll face it. Endure it. Survive it. That's all you can do. All you can be.</p>`,
        choices: [
            {
                text: "Your story continues...",
                effects: {},
                nextScene: "end_game"
            }
        ]
    },
    end_game: {
        title: "Your Legacy",
        year: 1347,
        age: function() { return window.gameState.age; },
        text: `<p>This is but the beginning. Of your story. Of the war. The 100 Years War will span your lifetime. And beyond. Decades. Generations. Until it ends. Or doesn't.</p>
               <p>You have survived the siege of Calais. Months of waiting. Of disease. Of hunger. Of watching men die. Your choices have shaped you. Made you. Broken you. Into what you are. Into what you've become.</p>
               <p><strong>Your Final Stats:</strong></p>
               <p>You have become a veteran. Of war. Of death. Your story is written. In the choices you made. In the battles you fought. In the men you killed. In the men you saved. The war continues. Without you. With you. Around you. Through you. Until it ends. Or doesn't.</p>`,
        choices: [
            {
                text: "Start a New Game",
                effects: {},
                nextScene: "restart"
            }
        ]
    },
    // ===== DEATH AVOIDANCE SCENES (Spend Money to Avoid Death) =====
    avoid_camp_fever: {
        title: "Buying Your Life",
        year: function() { return gameState.year; },
        age: function() { return gameState.age || 18; },
        location: function() { return gameState.location || "Camp"; },
        text: function() {
            const cost = 240; // 20 shillings = 240 pence
            const wealth = gameState.stats.wealth || 0;
            return `<p>The fever takes hold. You're burning up. The flux. The fever. It doesn't matter what you call it. You're dying.</p>
                    <p>But you have coin. ${formatCurrency(wealth)}. Enough to buy medicine. To pay a surgeon. To get clean water and food. To buy your way out of death.</p>
                    <p>The merchant has what you need. Herbs. Clean bandages. Wine to clean wounds. But it costs. Everything costs. ${formatCurrency(cost)}. A fortune. But less than your life.</p>
                    <p>You pay. You don't hesitate. Coin for life. The simplest trade there is.</p>`;
        },
        onEnter: function() {
            const cost = 240; // 20 shillings = 240 pence
            applyStatChange('wealth', -cost);
            applyStatChange('stress', -2);
            applyStatChange('morale', 1);
            // Remove any conditions that might have caused this
            if (hasCondition('Fatigued')) {
                removeCondition('Fatigued');
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "start"
            }
        ]
    },
    avoid_sepsis: {
        title: "The Surgeon's Price",
        year: function() { return gameState.year; },
        age: function() { return gameState.age || 18; },
        location: function() { return gameState.location || "Camp"; },
        text: function() {
            const cost = 360; // 30 shillings = 360 pence
            return `<p>The wound turns black. The smell is wrong. Sepsis. Your arm swells. You need a surgeon. Now.</p>
                    <p>The surgeon looks at your coin. ${formatCurrency(cost)}, he says. For proper care. Clean tools. Good wine to clean the wound. A chance to live.</p>
                    <p>You pay. You have no choice. The alternative is death on his table. You pay and he works. Carefully. Methodically. The wound is cleaned. The rot cut away. You survive. But you're poorer. And you know how close you came.</p>`;
        },
        onEnter: function() {
            const cost = 360; // 30 shillings = 360 pence
            applyStatChange('wealth', -cost);
            applyStatChange('stress', -1);
            // Remove wound conditions
            gameState.conditions = gameState.conditions.filter(c => 
                !c.name.includes('Wound') && 
                !c.name.includes('Injury') && 
                !c.name.includes('Cut')
            );
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "start"
            }
        ]
    },
    avoid_horse_fall: {
        title: "Better Equipment",
        year: function() { return gameState.year; },
        age: function() { return gameState.age || 18; },
        location: function() { return gameState.location || "Camp"; },
        text: function() {
            const cost = 300; // 25 shillings = 300 pence
            return `<p>Your horse spooks. You're thrown. But you've spent coin on better tack. Better training. The fall is bad but not fatal. Your legs ache. You're bruised. But you're alive.</p>
                    <p>You spent ${formatCurrency(cost)} on better equipment. It saved your life. Others weren't so lucky. You see them. Broken. Left behind. You could have been one of them. But coin made the difference.</p>`;
        },
        onEnter: function() {
            const cost = 300; // 25 shillings = 300 pence
            applyStatChange('wealth', -cost);
            applyStatChange('endurance', 1);
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "start"
            }
        ]
    },
    avoid_dysentery: {
        title: "Clean Water",
        year: function() { return gameState.year; },
        age: function() { return gameState.age || 18; },
        location: function() { return gameState.location || "Camp"; },
        text: function() {
            const cost = 180; // 15 shillings = 180 pence
            return `<p>The shits. The bloody shits. You can't keep water down. You're dying. But you have coin.</p>
                    <p>You pay ${formatCurrency(cost)} for clean water. For food that hasn't spoiled. For a place away from the latrines. It's expensive. But it works. You recover. Slowly. But you recover.</p>
                    <p>Others aren't so lucky. They die in the latrines. No one comes to help. But you had coin. Coin bought you life.</p>`;
        },
        onEnter: function() {
            const cost = 180; // 15 shillings = 180 pence
            applyStatChange('wealth', -cost);
            applyStatChange('stress', -2);
            applyStatChange('endurance', 1);
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "start"
            }
        ]
    },
    avoid_pneumonia: {
        title: "Warm Shelter",
        year: function() { return gameState.year; },
        age: function() { return gameState.age || 18; },
        location: function() { return gameState.location || "Camp"; },
        text: function() {
            const cost = 216; // 18 shillings = 216 pence
            return `<p>The cough won't stop. Your chest burns. Pneumonia. You're dying. But you have coin.</p>
                    <p>You pay ${formatCurrency(cost)} for a warm place. For blankets. For medicine. For a chance to recover. It works. You survive. Others don't. They die in tents. Alone. Coughing blood. But you had coin.</p>`;
        },
        onEnter: function() {
            const cost = 216; // 18 shillings = 216 pence
            applyStatChange('wealth', -cost);
            applyStatChange('stress', -2);
            if (hasCondition('Fatigued')) {
                removeCondition('Fatigued');
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "start"
            }
        ]
    },
    avoid_plague: {
        title: "Fleeing the Plague",
        year: function() { return gameState.year; },
        age: function() { return gameState.age || 18; },
        location: function() { return gameState.location || "Camp"; },
        text: function() {
            const cost = 600; // 50 shillings = 600 pence (2 pounds 10 shillings)
            return `<p>The black boils appear. The fever. The coughing blood. The Black Death. You're dying. But you have coin.</p>
                    <p>You pay ${formatCurrency(cost)}. A fortune. To bribe guards. To buy passage away from the plague. To get medicine. To buy your way out of death itself.</p>
                    <p>It works. You survive. The plague takes others. Dozens. Hundreds. But you had coin. Coin bought you life when death was everywhere.</p>`;
        },
        onEnter: function() {
            const cost = 600; // 50 shillings = 600 pence (2 pounds 10 shillings)
            applyStatChange('wealth', -cost);
            applyStatChange('stress', -3);
            applyStatChange('morale', -1); // Surviving plague is traumatic
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "start"
            }
        ]
    },
    avoid_starvation: {
        title: "Buying Food",
        year: function() { return gameState.year; },
        age: function() { return gameState.age || 18; },
        location: function() { return gameState.location || "Calais"; },
        text: function() {
            const cost = 300; // 25 shillings = 300 pence (1 pound 5 shillings)
            return `<p>The rations run out. You're starving. Your body gives up. You're dying. But you have coin.</p>
                    <p>You pay ${formatCurrency(cost)} for food. At ruinous prices. But you pay. You eat. You survive. Others starve. They die in the siege lines. But you had coin. Coin bought you life.</p>`;
        },
        onEnter: function() {
            const cost = 300; // 25 shillings = 300 pence (1 pound 5 shillings)
            applyStatChange('wealth', -cost);
            applyStatChange('morale', 1);
            applyStatChange('stress', -1);
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "start"
            }
        ]
    },
    
    // ===== DEATH SCENES (Variable Length Based on Circumstances) =====
    death_camp_fever: {
        title: "Camp Fever",
        year: function() { return gameState.year; },
        age: function() { return gameState.age || 18; },
        location: function() { return gameState.location || "Camp"; },
        text: function() {
            const name = escapeHTML(gameState.characterName || "Soldier");
            return `<p>The fever takes you. The flux. The fever. It doesn't matter what you call it.</p>
                    <p>You're dead in three days. ${name} dies in a tent. Alone. No one remembers your name.</p>
                    <p style="color: #d4af37; font-style: italic; margin-top: 20px;">The campaign continues without you.</p>`;
        },
        choices: [
            {
                text: "Start a New Game",
                effects: {},
                nextScene: "restart"
            }
        ]
    },
    death_sepsis: {
        title: "Sepsis",
        year: function() { return gameState.year; },
        age: function() { return gameState.age || 18; },
        location: function() { return gameState.location || "Camp"; },
        text: function() {
            const name = escapeHTML(gameState.characterName || "Soldier");
            return `<p>The wound turns black. The smell is wrong. Sepsis.</p>
                    <p>Your arm swells. The surgeon takes it. You don't survive the amputation.</p>
                    <p>${name} dies on the surgeon's table. Screaming.</p>
                    <p style="color: #d4af37; font-style: italic; margin-top: 20px;">The war doesn't care.</p>`;
        },
        choices: [
            {
                text: "Start a New Game",
                effects: {},
                nextScene: "restart"
            }
        ]
    },
    death_dysentery: {
        title: "Dysentery",
        year: function() { return gameState.year; },
        age: function() { return gameState.age || 18; },
        location: function() { return gameState.location || "Camp"; },
        text: function() {
            const name = escapeHTML(gameState.characterName || "Soldier");
            return `<p>The shits. The bloody shits. You can't keep water down.</p>
                    <p>You're dead in a week. ${name} dies in the latrines. No one comes to help.</p>
                    <p style="color: #d4af37; font-style: italic; margin-top: 20px;">This is how most men die.</p>`;
        },
        choices: [
            {
                text: "Start a New Game",
                effects: {},
                nextScene: "restart"
            }
        ]
    },
    death_pneumonia: {
        title: "Pneumonia",
        year: function() { return gameState.year; },
        age: function() { return gameState.age || 18; },
        location: function() { return gameState.location || "Camp"; },
        text: function() {
            const name = escapeHTML(gameState.characterName || "Soldier");
            return `<p>The cough won't stop. Your chest burns. Pneumonia.</p>
                    <p>You're dead before the week is out. ${name} dies in a tent. Alone. Coughing blood.</p>
                    <p style="color: #d4af37; font-style: italic; margin-top: 20px;">The war continues.</p>`;
        },
        choices: [
            {
                text: "Start a New Game",
                effects: {},
                nextScene: "restart"
            }
        ]
    },
    death_pitchfork: {
        title: "Pitchfork",
        year: function() { return gameState.year; },
        age: function() { return gameState.age || 18; },
        location: function() { return gameState.location || "Countryside"; },
        text: function() {
            const name = escapeHTML(gameState.characterName || "Soldier");
            return `<p>The pitchfork finds your throat. You're dead before you hit the ground.</p>
                    <p>${name} dies in a French field. A farmer's tool in your neck.</p>
                    <p style="color: #d4af37; font-style: italic; margin-top: 20px;">This is not how you wanted to die.</p>`;
        },
        choices: [
            {
                text: "Start a New Game",
                effects: {},
                nextScene: "restart"
            }
        ]
    },
    forced_retirement_broken_legs: {
        title: "Broken Legs",
        year: function() { return gameState.year; },
        age: function() { return gameState.age || 18; },
        location: function() { return gameState.location || "Camp"; },
        text: function() {
            const name = escapeHTML(gameState.characterName || "Soldier");
            return `<p>Your horse spooks. You're thrown. Both legs break.</p>
                    <p>The campaign is over. You're left behind. ${name} will never walk again.</p>
                    <p style="color: #d4af37; font-style: italic; margin-top: 20px;">At least you're alive.</p>`;
        },
        choices: [
            {
                text: "Start a New Game",
                effects: {},
                nextScene: "restart"
            }
        ]
    },
    death_combat: {
        title: "Killed in Action",
        year: function() { return gameState.year; },
        age: function() { return gameState.age || 18; },
        location: function() { return gameState.location || "The Road"; },
        artwork: "artwork/Assassinat_louis_orleans.jpg",
        artworkCaption: "Death comes in many forms",
        text: function() {
            const name = escapeHTML(gameState.characterName || "Soldier");
            return `<p>You fail. Again. The enemy's blade finds you. Your guard drops. Your strength fails. Your last chance. Gone.</p>
                    <p>The steel cuts deep. Too deep. You fall. The ground rises to meet you. The world fades. The sounds of battle. The screams. The clash of steel. All of it. Fading. Gone.</p>
                    <p>${name} dies on the road. In the mud. In the blood. Your blood. The enemy moves on. The column moves on. You don't.</p>
                    <p style="color: #d4af37; font-style: italic; margin-top: 20px;">This is how soldiers die. Fast. Brutal. Final.</p>`;
        },
        choices: [
            {
                text: "Start a New Game",
                effects: {},
                nextScene: "restart"
            }
        ]
    },
    death_plague: {
        title: "The Black Death",
        year: function() { return gameState.year; },
        age: function() { return gameState.age || 18; },
        location: function() { return gameState.location || "Camp"; },
        text: function() {
            const name = escapeHTML(gameState.characterName || "Soldier");
            return `<p>The black boils appear. The fever. The coughing blood.</p>
                    <p>The Black Death. You're dead in days.</p>
                    <p>${name} dies in a tent. Alone. No one comes near. The plague takes you like it takes everyone.</p>
                    <p style="color: #d4af37; font-style: italic; margin-top: 20px;">This is how most men die now.</p>`;
        },
        choices: [
            {
                text: "Start a New Game",
                effects: {},
                nextScene: "restart"
            }
        ]
    },
    death_starvation: {
        title: "Starvation",
        year: function() { return gameState.year; },
        age: function() { return gameState.age || 18; },
        location: function() { return gameState.location || "Calais"; },
        text: function() {
            const name = escapeHTML(gameState.characterName || "Soldier");
            return `<p>The rations run out. You starve. Your body gives up.</p>
                    <p>You die in the siege lines. ${name} dies hungry. The siege continues.</p>
                    <p style="color: #d4af37; font-style: italic; margin-top: 20px;">The siege doesn't care.</p>`;
        },
        choices: [
            {
                text: "Start a New Game",
                effects: {},
                nextScene: "restart"
            }
        ]
    },
    death_broke: {
        title: "Broke and Dead",
        year: function() { return gameState.year; },
        age: function() { return gameState.age || 18; },
        location: function() { return gameState.location || "Camp"; },
        text: function() {
            const name = escapeHTML(gameState.characterName || "Soldier");
            return `<p>You have nothing. No coin. No favors. No way to buy your way out of trouble.</p>
                    <p>When sickness comes, when injury strikes, when hunger gnaws—you have no recourse. No medicine. No surgeon. No food. No shelter.</p>
                    <p>${name} dies broke. Alone. No one remembers your name.</p>
                    <p style="color: #d4af37; font-style: italic; margin-top: 20px;">Broke men die. This is the truth of war.</p>`;
        },
        choices: [
            {
                text: "Start a New Game",
                effects: {},
                nextScene: "restart"
            }
        ]
    },
    // ============================================================================
    // RANDOM ENCOUNTERS - Small events to break up the march
    // (Triggered by maybeInsertRandomEncounter; each returns to the stored scene.)
    // ============================================================================

    random_drunken_song: {
        title: "A Drunken Song",
        text: `<p>Porridge Tom is drunk again. He stands on a stump and bellows out a marching song with half the words missing. Men laugh. Men groan. A crust of bread sails past his ear.</p>
               <p>Fiddle Jack sits with his fiddle across his knees, not playing. Just watching. "If he finds the tune," he says, "I'll eat your missing boot."</p>
               <p>Tom hits a note that makes the horses sidestep. Somebody laughs until he starts coughing.</p>`,
        choices: [
            {
                text: "Join in and make it worse",
                effects: { morale: 1, stress: 1 },
                nextScene: "random_drunken_song_end"
            },
            {
                text: "Tell him to stop before someone throws a pot at him",
                effects: { stress: -1, morale: -1 },
                nextScene: "random_drunken_song_end"
            },
            {
                text: "Walk off and let the noise have them",
                effects: { stress: -1 },
                nextScene: "random_drunken_song_end"
            }
        ]
    },
    random_drunken_song_end: {
        title: "A Drunken Song",
        text: `<p>The moment passes. The noise fades. Tom stumbles off his stump. Men return to their tasks. Their thoughts. Their silence.</p>
               <p>The march continues. Boots on dirt. The rhythm of movement. The rhythm of war. Another moment. Another day. Nothing more. Nothing less.</p>`,
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: function() { return returnFromRandomEncounter(); }
            }
        ]
    },

    random_lost_boot: {
        title: "The Missing Boot",
        text: `<p>You wake with one boot. The other is gone. Your sock is wet through and black with mud.</p>
               <p>Hoary Bill squats by your bedroll and grins. "Somebody's got a fine foot tonight," he says. "Check the piss trench. Things turn up there."</p>
               <p>Soot-Eyed Billy looks over the camp like he's counting heads. "Or a lad's wearing it. Watch who limps."</p>`,
        choices: [
            {
                text: "Search the camp and the ditches",
                effects: { stress: 1 },
                nextScene: "random_lost_boot_end"
            },
            {
                text: "Ask around and take the laughter",
                effects: { stress: 1, reputation: -1 },
                nextScene: "random_lost_boot_end"
            },
            {
                text: "Find a replacement and swallow the cost",
                effects: { wealth: -2, stress: 1 },
                nextScene: "random_lost_boot_end"
            }
        ]
    },
    random_lost_boot_end: {
        title: "The Missing Boot",
        text: `<p>The matter is settled. One way or another. You have two boots again. Or you don't. Either way, the march doesn't wait. The column moves. You move with it.</p>
               <p>Small problems. Small solutions. Or no solutions. The war doesn't care about boots. About comfort. About anything but movement. Forward. Always forward.</p>`,
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: function() { return returnFromRandomEncounter(); }
            }
        ]
    },

    random_gambling_debt: {
        title: "A Debt Called In",
        text: `<p>Sixpence Tom finds you. The bowman with the dice cup and the easy grin. The grin is gone.</p>
               <p>"You owe me three shillings," he says. "From the bones. Don't look at me like that. You threw the same as me and you called it luck."</p>
               <p>Hammer-hand Harry stands behind him, arms folded, knuckles like stones. "Pay him or he'll follow you all day," Harry says. "That's worse than a French spear."</p>`,
        choices: [
            {
                text: "Pay the three and be done with it",
                effects: { wealth: -3, stress: -1 },
                nextScene: "random_gambling_debt_end"
            },
            {
                text: "Refuse and see what that buys you",
                effects: { stress: 2, reputation: -1 },
                nextScene: "random_gambling_debt_end"
            },
            {
                text: "Try to talk him down",
                effects: { stress: 1 },
                nextScene: "random_gambling_debt_resolve",
                requiresResolution: true,
                resolutionStat: "charisma",
                resolutionDifficulty: 7
            }
        ]
    },
    random_gambling_debt_end: {
        title: "A Debt Called In",
        text: `<p>The matter is settled. One way or another. Coins change hands. Or they don't. Words are exchanged. Or they aren't.</p>
               <p>Tom moves on. Harry moves on. You move on. The debt is paid. Or it isn't. Either way, the march continues. The war continues. Debts are small things in the face of that.</p>`,
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: function() { return returnFromRandomEncounter(); }
            }
        ]
    },

    random_gambling_debt_resolve: {
        title: "Terms",
        text: function() {
            const r = gameState.lastResolution;
            if (!r) return `<p>Sixpence Tom waits. Hammer-hand Harry watches.</p>`;

            const rollDisplay = `<div class="dice-roll">
                <strong>Roll:</strong> 1d10 + ${r.effectiveStat} = ${r.roll} (vs ${r.difficulty})
                <br><strong>${r.success ? 'SUCCESS' : 'FAILURE'}</strong>
            </div>`;

            if (r.success) {
                return `${rollDisplay}<p>You keep your voice low and your face plain. You remind him what he won off you last month. You remind him whose turn it is to be decent. He chews on that.</p>
                       <p>"Two, then," he says. "And don't play if you can't lose."</p>
                       <p>You pay. He nods. The matter is settled. The march continues. Debts. Payments. Settlements. All part of the life.</p>`;
            }

            return `${rollDisplay}<p>You try it. He shakes his head before you're finished. "Three," he says. "And you're not as clever as you think."</p>
                   <p>You pay. The coins leave your hand. The debt is settled. But the sting remains. The march continues. That's how it goes.</p>`;
        },
        onEnter: function() {
            const r = gameState.lastResolution;
            if (!r) return;
            if (r.success) {
                applyStatChange('wealth', -2);
                applyStatChange('stress', -1);
                applyStatChange('reputation', 1);
            } else {
                applyStatChange('wealth', -3);
                applyStatChange('stress', 1);
            }
        },
        choices: [
            {
                text: "Move on",
                effects: {},
                nextScene: function() { return returnFromRandomEncounter(); }
            }
        ]
    },

    random_the_wandering_chicken: {
        title: "The Wandering Chicken",
        minYear: 1337,
        maxYear: null,
        text: function(gs) {
            return `
                <p>A chicken wanders into camp. Not a camp chicken. A proper chicken. It walks like it owns the place. Feet click on packed mud.</p>
                <p>Wat watches it. <em>"That bird's got more sense than half the men here."</em></p>
                <p>The Cook looks up from his pot. <em>"It is looking for grain. Or a place to die. Hard to tell with chickens."</em></p>
                <p>The chicken pecks at Wat's boot. Wat doesn't move. The chicken pecks again. More insistent.</p>
                <p><em>"It wants something,"</em> The Cook says. <em>"Chickens always want something."</em></p>
                <p>Wat spits. The chicken doesn't flinch. <em>"Stupid bird. Or brave. Same thing, I suppose."</em></p>
            `;
        },
        choices: [
            {
                text: "Try to shoo it away",
                effects: function(gs) {
                    applyStatChange("stress", 1, {silent:true});
                    ensureFlags(gs).campChickenSeen = true;
                },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Ask The Cook if we should eat it",
                effects: function(gs) {
                    changeRel("cook", 1);
                    applyStatChange("morale", 1, {silent:true});
                    ensureFlags(gs).campChickenSeen = true;
                },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Watch and see what happens",
                effects: function(gs) {
                    applyStatChange("stress", -1, {silent:true});
                    ensureFlags(gs).campChickenSeen = true;
                },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Tell Wat the chicken is judging him",
                effects: function(gs) {
                    changeRel("wat", 1);
                    applyStatChange("morale", 1, {silent:true});
                    ensureFlags(gs).campChickenSeen = true;
                },
                nextScene: function() { return returnFromRandomEncounter(); }
            }
        ]
    },

    random_wat_vs_the_boot: {
        title: "Wat Versus the Boot",
        minYear: 1337,
        maxYear: null,
        text: function(gs) {
            return `
                <p>Wat's boot won't come off. He's been wrestling with it for half an hour. His face is red. His knuckles are white. The leather stinks of old sweat.</p>
                <p><em>"Stuck,"</em> he grunts. <em>"Like it's grown to my foot."</em></p>
                <p>The Cook watches from across the fire. <em>"Have you tried pulling it?"</em></p>
                <p>Wat stops. Looks at The Cook. Looks at the boot. Looks back at The Cook.</p>
                <p><em>"Yes,"</em> Wat says. <em>"I tried pulling it. That's what you do with boots."</em></p>
                <p><em>"Sometimes boots need persuasion,"</em> The Cook says. <em>"Like onions. They resist until they don't."</em></p>
                <p>Wat tries again. A lace snaps. The boot doesn't move. He swears. The boot doesn't care.</p>
            `;
        },
        choices: [
            {
                text: "Offer to help pull",
                effects: function(gs) {
                    changeRel("wat", 1);
                    applyStatChange("wits", 1, {silent:true});
                    if (gs.stats?.stress >= 3) {
                        applyStatChange("stress", 1, {silent:true});
                    }
                    ensureFlags(gs).watBootWar = true;
                },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Suggest cutting it off",
                effects: function(gs) {
                    changeRel("wat", -1);
                    applyStatChange("morale", 1, {silent:true});
                    ensureFlags(gs).watBootWar = true;
                },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Ask The Cook for his boot philosophy",
                effects: function(gs) {
                    changeRel("cook", 1);
                    changeRel("wat", -1);
                    applyStatChange("morale", 1, {silent:true});
                    ensureFlags(gs).watBootWar = true;
                },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Say nothing. This is between Wat and the boot.",
                effects: function(gs) {
                    applyStatChange("stress", -1, {silent:true});
                    ensureFlags(gs).watBootWar = true;
                },
                nextScene: function() { return returnFromRandomEncounter(); }
            }
        ]
    },

    random_dice_sermon: {
        title: "Dice Sermon",
        minYear: 1337,
        maxYear: null,
        text: function(gs) {
            return `
                <p>Lloyd the Welshman sits with Sixpence Tom, rolling dice. Not for coin. For meaning.</p>
                <p><em>"Every throw is fate,"</em> Lloyd says. <em>"Every number a message from God."</em></p>
                <p>Tom rolls. Three and two. The dice clatter on a flat stone. <em>"What's that mean, then?"</em></p>
                <p><em>"It means you rolled a five,"</em> Lloyd says. <em>"The message is: you rolled a five."</em></p>
                <p>Wat watches from his spot. <em>"That's not philosophy. That's stating the obvious."</em></p>
                <p><em>"All philosophy is stating the obvious,"</em> Lloyd says. <em>"The trick is saying it pretty."</em></p>
                <p>Tom rolls again. Snake eyes. <em>"What about this?"</em></p>
                <p><em>"That means you're unlucky,"</em> Lloyd says. <em>"Or lucky. Depends on what you're trying to do."</em></p>
                <p>Wat spits. <em>"That's not helpful."</em></p>
                <p><em>"Most philosophy isn't,"</em> Lloyd says. <em>"That's why it's philosophy."</em></p>
            `;
        },
        choices: [
            {
                text: "Ask Lloyd what your future holds",
                effects: function(gs) {
                    applyStatChange("morale", 1, {silent:true});
                    applyStatChange("stress", 1, {silent:true});
                },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Tell Wat he's missing the point",
                effects: function(gs) {
                    changeRel("wat", -1);
                    applyStatChange("morale", 1, {silent:true});
                },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Join the game. Roll for meaning.",
                effects: function(gs) {
                    applyStatChange("morale", 1, {silent:true});
                },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Walk away. Some conversations aren't worth having.",
                effects: function(gs) {
                    applyStatChange("stress", -1, {silent:true});
                },
                nextScene: function() { return returnFromRandomEncounter(); }
            }
        ]
    },

    random_the_singing_contest: {
        title: "The Singing Contest",
        minYear: 1337,
        maxYear: null,
        text: function(gs) {
            return `
                <p>Porridge Tom challenges Fiddle Jack to a singing contest. <em>"I'll sing better than you can play,"</em> Tom says.</p>
                <p>Jack doesn't look up from his fiddle. <em>"That's not a high bar."</em></p>
                <p>Tom starts. It's bad. Very bad. Men cover their ears. Horses shift nervously. A horse whinnies in protest.</p>
                <p>Jack plays. It's worse. The fiddle screeches. The strings protest. The wood groans.</p>
                <p>Wat stands up. <em>"Stop. Both of you. You're scaring the animals."</em></p>
                <p><em>"Who won?"</em> Tom asks.</p>
                <p><em>"The animals,"</em> Wat says. <em>"They won by not having to listen anymore."</em></p>
                <p>The Cook looks up from his pot. <em>"I think Tom won. His was louder."</em></p>
                <p><em>"Loud isn't good,"</em> Jack says.</p>
                <p><em>"In war, loud is everything,"</em> The Cook says. <em>"Ask the French."</em></p>
            `;
        },
        choices: [
            {
                text: "Declare Tom the winner",
                effects: function(gs) {
                    applyStatChange("morale", 1, {silent:true});
                },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Declare Jack the winner",
                effects: function(gs) {
                    applyStatChange("morale", 1, {silent:true});
                },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Agree with Wat. Nobody won.",
                effects: function(gs) {
                    changeRel("wat", 1);
                    applyStatChange("stress", -1, {silent:true});
                },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Start your own song. Make it worse.",
                effects: function(gs) {
                    applyStatChange("morale", 2, {silent:true});
                    applyStatChange("reputation", -1, {silent:true});
                },
                nextScene: function() { return returnFromRandomEncounter(); }
            }
        ]
    },

    random_the_missing_spoon: {
        title: "The Missing Spoon",
        minYear: 1337,
        maxYear: null,
        text: function(gs) {
            return `
                <p>The Cook is missing a spoon. Not just any spoon. <em>"The good one,"</em> he says. <em>"The one that doesn't bend."</em></p>
                <p>He's been looking for it all morning. Asking everyone. Getting angrier. The pot simmers. Unwatched.</p>
                <p>Wat sits nearby, eating with his hands. <em>"Use your fingers. Spoons are for nobles."</em></p>
                <p><em>"Spoons are for cooking,"</em> The Cook says. <em>"Fingers are for burning."</em></p>
                <p>Hoary Bill walks past. <em>"I saw Rat-Catcher Ned with a spoon. Might be yours."</em></p>
                <p>The Cook finds Ned. The spoon is his. The handle is stamped with a mark. Ned's been using it to dig. Grit of dirt still on it. <em>"It's good for digging,"</em> Ned says. <em>"Strong."</em></p>
                <p>The Cook takes it back. Washes it three times. Watches it like it might run away again.</p>
                <p><em>"Spoons have jobs,"</em> The Cook says. <em>"Digging is not a spoon's job."</em></p>
            `;
        },
        choices: [
            {
                text: "Help The Cook look for the spoon",
                effects: function(gs) {
                    changeRel("cook", 1);
                    applyStatChange("stress", 1, {silent:true});
                    ensureFlags(gs).cookGoodSpoon = true;
                },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Tell The Cook to use a stick instead",
                effects: function(gs) {
                    changeRel("cook", -1);
                    applyStatChange("morale", 1, {silent:true});
                    ensureFlags(gs).cookGoodSpoon = true;
                },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Ask Ned why he needed a spoon for digging",
                effects: function(gs) {
                    applyStatChange("wits", 1, {silent:true});
                    applyStatChange("morale", 1, {silent:true});
                    ensureFlags(gs).cookGoodSpoon = true;
                },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Stay out of it. Spoon drama isn't your problem.",
                effects: function(gs) {
                    applyStatChange("stress", -1, {silent:true});
                    ensureFlags(gs).cookGoodSpoon = true;
                },
                nextScene: function() { return returnFromRandomEncounter(); }
            }
        ]
    },

    random_campfire_tale: {
        title: "A Tall Tale",
        text: `<p>Rat-Catcher Ned is telling a story again. He swears he once saw a French knight fall off his horse and get beaten to death by a flock of geese.</p>
               <p>Men laugh into their bowls. Somebody says Ned should sell his stories to the king and buy the lot of you new boots.</p>
               <p>Ned spreads his hands. "I'm only saying what I saw," he says. "The geese were organized. Like soldiers."</p>`,
        choices: [
            {
                text: "Add a detail and make the geese sound braver than you",
                effects: { morale: 1, stress: -1 },
                nextScene: "random_campfire_tale_end"
            },
            {
                text: "Call him a liar and enjoy the shouting",
                effects: { morale: -1, stress: 1 },
                nextScene: "random_campfire_tale_end"
            },
            {
                text: "Just listen and let it be stupid for a moment",
                effects: { morale: 1 },
                nextScene: "random_campfire_tale_end"
            }
        ]
    },
    random_campfire_tale_end: {
        title: "A Tall Tale",
        text: `<p>The story ends. Or it doesn't. Ned keeps talking. Or he stops. Men laugh. Or they don't. The fire burns low.</p>
               <p>Stories. Tales. Lies. Truth. In camp, they all blur together. What matters is the moment. The warmth. The company. The brief escape from what's real. What's coming.</p>
               <p>The night passes. The march continues. Another day. Another story. Another moment of peace before the war finds you again.</p>`,
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: function() { return returnFromRandomEncounter(); }
            }
        ]
    },

    random_broken_sword: {
        title: "A Bad Blade",
        text: `<p>Your sword isn't right. The edge has a bite out of it. The hilt wiggles when you test it. You don't remember doing it. You just notice it now.</p>
               <p>Hammer-hand Harry looks it over and snorts. "That'll last one good hit," he says. "Maybe."</p>
               <p>Fiddle Jack says, "If it breaks, you can use the pieces as a dagger. That's what my uncle did. He died, but he did it."</p>`,
        choices: [
            {
                text: "Try to peen the hilt tight and hope",
                effects: { stress: 1 },
                nextScene: "random_broken_sword_end"
            },
            {
                text: "Pay for a better blade",
                effects: { wealth: -5, stress: -1 },
                nextScene: "random_broken_sword_end"
            },
            {
                text: "Find a replacement in the next pile of dead",
                effects: { stress: 1, reputation: -1 },
                nextScene: "random_broken_sword_end"
            }
        ]
    },
    random_broken_sword_end: {
        title: "A Bad Blade",
        text: `<p>The matter is settled. You've fixed it or replaced it or made your peace with what you have. The blade in your hand is what it is. Good enough or not, but it's yours for now.</p>
               <p>Steel breaks. Steel bends. Steel serves until it doesn't. You've learned that much. The march continues and the war continues and your blade will be tested soon enough.</p>`,
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: function() { return returnFromRandomEncounter(); }
            }
        ]
    },

    random_stolen_horse: {
        title: "Where's the Horse?",
        text: `<p>The horse you were meant to mind is gone. The rope is still there, neatly cut. No hoofprints you can trust in the churned mud.</p>
               <p>Lloyd the Welshman sucks his teeth. "Either a thief or a saint," he says. "A thief takes the horse. A saint takes the rope too."</p>
               <p>Soot-Eyed Billy says, "Captain's going to ask. Don't make up a pretty lie. Make up a fast one."</p>`,
        choices: [
            {
                text: "Search the hedges and fields",
                effects: { stress: 2 },
                nextScene: "random_stolen_horse_end"
            },
            {
                text: "Tell the captain and take what comes",
                effects: { reputation: -1, stress: -1 },
                nextScene: "random_stolen_horse_end"
            },
            {
                text: "Point at someone else and walk away",
                effects: { reputation: -2, stress: 1 },
                nextScene: "random_stolen_horse_end"
            }
        ]
    },
    random_stolen_horse_end: {
        title: "Where's the Horse?",
        text: `<p>The matter is handled. One way or another. The horse is found or it isn't. The captain is told or he isn't. The blame is placed or it isn't.</p>
               <p>Horses disappear. That's how it goes. In war, things go missing. Animals. Gear. Men. The march doesn't wait for explanations. The column moves forward and you move with it, whatever the cost.</p>`,
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: function() { return returnFromRandomEncounter(); }
            }
        ]
    },

    random_food_poisoning: {
        title: "Bad Stew",
        text: `<p>The stew tastes wrong. Sour at the back of the tongue. You eat it anyway because you're hungry and because hunger makes a man brave in stupid ways.</p>
               <p>An hour later you're bent over the ditch, heaving. The world sways. Your gut feels like it's trying to crawl out.</p>
               <p>Ladle Martin pats your shoulder like he's doing you a favor. "Should've waited," he says. "The rats always try it first."</p>`,
        choices: [
            {
                text: "Lie down and let it pass",
                effects: { stress: 1, endurance: -1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Ask someone for water and keep your pride quiet",
                effects: { stress: -1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Tough it out and rejoin the line",
                effects: { stress: 2, endurance: -2, morale: -1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            }
        ]
    },

    random_weather_complaint: {
        title: "The Weather",
        text: `<p>It's raining again. The camp is mud. Your socks are mud. The bread tastes like mud because someone dropped it and ate it anyway.</p>
               <p>Men complain like it's a job. One swears the sky over France is lower than in England. Another says the rain is French too and ought to be stabbed.</p>
               <p>Fiddle Jack tugs at a wet string and sighs. "If this keeps up," he says, "I'll be playing a puddle."</p>`,
        choices: [
            {
                text: "Join in and make it everybody's problem",
                effects: { morale: -1, stress: 1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Ignore it and keep your head down",
                effects: { stress: -1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Help someone rig a bit of cover",
                effects: { morale: 1, reputation: 1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            }
        ]
    },

    random_insult_battle: {
        title: "Words as Weapons",
        text: `<p>Two men are at it by the cookfire. Not blades. Tongues. They're close enough to smell each other.</p>
               <p>"Your mother sells turnips to pigs," one says.</p>
               <p>The other laughs too loud. "Better than your father, who couldn't sell a pisspot at a feast."</p>
               <p>The insults fly back and forth. Crude. Creative. Mean. But they stay words. No blades drawn. No blood spilled. Just men letting off steam. Passing time. Surviving the boredom. The tension. The everything that makes camp life what it is.</p>`,
        choices: [
            {
                text: "Watch and let it stay words",
                effects: { morale: 1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Throw in an insult and take a side",
                effects: { morale: 1, stress: 1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Break it up before somebody remembers he has a knife",
                effects: { reputation: 1, stress: 1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            }
        ]
    },

    random_misplaced_gear: {
        title: "Misplaced",
        text: `<p>You can't find your whetstone. You turned your pack inside out. You checked under your blanket twice. It's gone.</p>
               <p>Granny Six-Teeth is crouched by the ashes, warming her hands. She watches you look and look again.</p>
               <p>"If you want your stone," she says, "stop looking like you're about to cry and ask."</p>`,
        choices: [
            {
                text: "Ask her where it is",
                effects: { stress: -1, reputation: 1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Keep searching and pretend you didn't hear",
                effects: { stress: 1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Give up and accept the loss",
                effects: { stress: -1, reputation: -1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            }
        ]
    },

    random_dice_game: {
        title: "Bones",
        text: `<p>A board goes down on a barrel. Coins clink. A dice cup rattles like teeth in a skull.</p>
               <p>Sixpence Tom nods at you. "Two shillings to sit," he says. "If you haven't got two, you haven't got luck either."</p>
               <p>Men lean in. Not because they care who wins. Because watching someone lose is free.</p>`,
        choices: [
            {
                text: "Play (bet 2 shillings)",
                effects: { wealth: -2, stress: 1 },
                nextScene: function() {
                    const win = Math.random() > 0.5;
                    if (win) {
                        applyStatChange('wealth', 4);
                        applyStatChange('morale', 1);
                    } else {
                        applyStatChange('stress', 1);
                        applyStatChange('morale', -1);
                    }
                    return returnFromRandomEncounter();
                }
            },
            {
                text: "Watch but keep your coin",
                effects: { morale: 1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Walk away before you start thinking about home",
                effects: { stress: -1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            }
        ]
    },

    random_cooking_disaster: {
        title: "Spilled",
        text: `<p>Somebody trips. The pot tips. Stew goes into the dirt like a sacrifice.</p>
               <p>For a heartbeat nobody speaks. Then the shouting starts. Hungry men have good lungs.</p>
               <p>Ladle Martin stares at the mud where supper used to be. "That's it," he says. "We're eating regret."</p>`,
        choices: [
            {
                text: "Help scrape together what you can",
                effects: { reputation: 1, morale: 1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Join the complaints and make it louder",
                effects: { morale: -1, stress: 1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Stay out of it",
                effects: { stress: -1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            }
        ]
    },

    random_sleepwalking: {
        title: "Out Past the Lines",
        text: `<p>You come awake in the dark with cold grass under your hands. The camp is behind you. The sentries are somewhere to your left, talking low.</p>
               <p>You must have walked. You don't remember getting up. You don't remember anything between sleep and this.</p>
               <p>A voice calls softly. "Who's there?" The question is not friendly.</p>`,
        choices: [
            {
                text: "Answer and show your hands",
                effects: { stress: 1, reputation: 1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Try to creep back without being seen",
                effects: { stress: 2 },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Sit tight until you hear the watch pass",
                effects: { stress: 1, endurance: -1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            }
        ]
    },

    random_animal_encounter: {
        title: "An Unwanted Guest",
        text: `<p>A pig has wandered into camp. Or maybe it belongs to somebody and is trying to get home. It noses into packs and knocks over a bowl like it owns the place.</p>
               <p>Men chase it. It jukes like a trained fighter. Somebody falls in the mud and the pig squeals like it's laughing.</p>
               <p>Hoary Bill points. "Catch it," he says. "That's tomorrow's meat if the captain doesn't see."</p>`,
        choices: [
            {
                text: "Help catch it",
                effects: { reputation: 1, morale: 1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Ignore it and let fools run",
                effects: { stress: -1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Try to shoo it out quietly",
                effects: { morale: 1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            }
        ]
    },

    random_betrayal_joke: {
        title: "A Joke at Your Expense",
        text: `<p>Somebody's moved your kit. Not far. Just enough. Your belt is under another blanket. Your cup is hanging from a spear rack.</p>
               <p>A few men are watching too hard, waiting for you to notice. Waiting for you to give them a reason to laugh.</p>
               <p>Soot-Eyed Billy shrugs. "If you swing, swing at the right lad," he says. "Or you'll be paying for it twice."</p>`,
        choices: [
            {
                text: "Laugh it off",
                effects: { morale: 1, reputation: 1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Confront them and risk a real fight",
                effects: { stress: 1, reputation: -1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            },
            {
                text: "Plan something small and mean for later",
                effects: { morale: 1, stress: 1, reputation: -1 },
                nextScene: function() { return returnFromRandomEncounter(); }
            }
        ]
    },

    skirmish_roadside: {
        title: "Roadside Clash",
        text: `<p>Bandits. Or deserters. Or men who've lost their way. They block the road. Weapons drawn. Demanding coin or blood.</p>
               <p>Your column halts. Men reach for weapons. The moment hangs. Decision time.</p>`,
        choices: [
            {
                text: "Press Them (Aggressive) - 1d10 + Strength + Reach - Exertion vs DC 8",
                effects: {},
                nextScene: async function() {
                    window.gameState.lastSkirmishContext = { variantId: 'roadside' };
                    return await window.runSkirmish('press');
                }
            },
            {
                text: "Hold Formation (Controlled) - 1d10 + Wits + Armor - Exertion vs DC 7",
                effects: {},
                nextScene: async function() {
                    window.gameState.lastSkirmishContext = { variantId: 'roadside' };
                    return await window.runSkirmish('hold');
                }
            },
            {
                text: "Drive Them Off (Threaten) - 1d10 + Charisma + Morale - Exertion vs DC 6",
                effects: {},
                nextScene: async function() {
                    window.gameState.lastSkirmishContext = { variantId: 'roadside' };
                    return await window.runSkirmish('drive');
                }
            }
        ]
    },

    skirmish_roadside_mud: {
        title: "Mud & Ruts",
        text: `<p>The road is a quagmire. Mud clings to boots. Ruts trap wheels. The enemy blocks the way, but footing is treacherous.</p>
               <p>Every step is uncertain. Every move costs more. The clash comes anyway.</p>`,
        choices: [
            {
                text: "Press Them (Aggressive) - 1d10 + Strength + Reach - Exertion - 1 (mud) vs DC 8",
                effects: {},
                nextScene: async function() {
                    window.gameState.lastSkirmishContext = { variantId: 'mud' };
                    return await window.runSkirmish('press');
                }
            },
            {
                text: "Hold Formation (Controlled) - 1d10 + Wits + Armor - Exertion - 1 (mud) vs DC 7",
                effects: {},
                nextScene: async function() {
                    window.gameState.lastSkirmishContext = { variantId: 'mud' };
                    return await window.runSkirmish('hold');
                }
            },
            {
                text: "Drive Them Off (Threaten) - 1d10 + Charisma + Morale - Exertion - 1 (mud) vs DC 6",
                effects: {},
                nextScene: async function() {
                    window.gameState.lastSkirmishContext = { variantId: 'mud' };
                    return await window.runSkirmish('drive');
                }
            }
        ]
    },

    skirmish_roadside_lane: {
        title: "Narrow Lane",
        text: `<p>The patrol takes you down a narrow lane. Hedgerows press close on either side. French countryside. Or what's left of it. The lane is narrow. No room for grand gestures. Spears are awkward here—too long, too unwieldy.</p>
               <p>Movement ahead. Shadows in the hedgerows. French scouts. Or bandits. Or desperate men looking for plunder. It doesn't matter who. They're between you and your destination. This is close work. Inside reach. The enemy knows it.</p>`,
        choices: [
            {
                text: "Press Them (Aggressive) - 1d10 + Strength + Reach - Exertion vs DC 8",
                effects: {},
                nextScene: async function() {
                    window.gameState.lastSkirmishContext = { variantId: 'lane' };
                    return await window.runSkirmish('press');
                }
            },
            {
                text: "Hold Formation (Controlled) - 1d10 + Wits + Armor - Exertion vs DC 7",
                effects: {},
                nextScene: async function() {
                    window.gameState.lastSkirmishContext = { variantId: 'lane' };
                    return await window.runSkirmish('hold');
                }
            },
            {
                text: "Drive Them Off (Threaten) - 1d10 + Charisma + Morale - Exertion vs DC 6",
                effects: {},
                nextScene: async function() {
                    window.gameState.lastSkirmishContext = { variantId: 'lane' };
                    return await window.runSkirmish('drive');
                }
            }
        ]
    },

    skirmish_second_chance: {
        title: "A Second Chance",
        text: function() {
            const firstFailure = gameState.lastSkirmishFirstFailure;
            if (!firstFailure) {
                return `<p>Something went wrong. The system lost track of your failure.</p>`;
            }
            
            return `<p>The enemy presses hard. Your first attempt failed. They're on you. Close. Too close. Your gear strains. Your body aches. But you're not done yet. Not yet.</p>
                   <p>You have one more chance. One more moment. One more desperate attempt to turn this around. Fail now, and it's over. You'll be cut down. Killed. Dead. But succeed, and you'll survive. Wounded. Hurt. But alive.</p>
                   <p>This is it. Your last chance. Make it count.</p>`;
        },
        choices: [
            {
                text: "Fight for your life - Second chance check",
                effects: {},
                nextScene: async function() {
                    const firstFailure = window.gameState.lastSkirmishFirstFailure;
                    if (!firstFailure) {
                        return 'skirmish_roadside_resolve';
                    }
                    
                    // Run Tempo Strike again for the second chance
                    const timing = await window.startTempoStrike({
                        title: 'Tempo Strike - Second Chance',
                        subtitle: 'Your last chance. Stop the marker in the orange zone.'
                    });
                    
                    // Recalculate with current state (mods may have changed)
                    const mods = window.computeSkirmishModifiers(firstFailure.choiceId);
                    const exertion = window.gameState.exertion || 0;
                    
                    // Recalculate bonus (may have changed due to first failure effects)
                    let bonus;
                    if (firstFailure.choiceId === 'press') {
                        bonus = mods.reachBonus - exertion + timing.bonus + mods.variantModifier;
                    } else if (firstFailure.choiceId === 'hold') {
                        bonus = mods.armorDefenseBonus - exertion + timing.bonus + mods.variantModifier;
                    } else {
                        bonus = mods.moraleDeltaBonus - exertion + timing.bonus + mods.variantModifier;
                    }
                    
                    // Second check with same difficulty
                    const result = window.resolveAction(firstFailure.statKey, firstFailure.dc, bonus);
                    
                    if (result.success) {
                        // Second check succeeded - injured but alive
                        window.addCondition('Wounded', 'negative', 3);
                        window.applyStatChange('endurance', -2);
                        window.applyStatChange('stress', 2);
                        window.gameState.career.wounds++;
                        
                        // Create a success result for display
                        const d10 = result.roll - (result.effectiveStat + bonus);
                        const modifierSum = result.effectiveStat + bonus;
                        const neededRoll = result.difficulty - (result.effectiveStat + bonus);
                        const successChance = Math.max(0, Math.min(100, ((10 - neededRoll + 1) / 10) * 100));
                        
                        let formulaText = window.buildFormulaText(firstFailure.choiceId, mods, exertion, result.effectiveStat);
                        if (timing.bonus > 0) {
                            formulaText += ` + Tempo (+${timing.bonus})`;
                        }
                        
                        // Determine variant key for storage
                        let variantKey = 'roadside_clash';
                        const variantId = firstFailure.variantContext?.variantId || 'roadside';
                        if (variantId === 'mud') {
                            variantKey = 'mud_ruts';
                        } else if (variantId === 'lane') {
                            variantKey = 'narrow_lane';
                        }
                        
                        window.gameState.lastSkirmish = {
                            key: variantKey,
                            variantId: variantId,
                            choiceId: firstFailure.choiceId,
                            statKey: firstFailure.statKey,
                            dc: result.difficulty,
                            baseDc: firstFailure.dc,
                            formulaText: formulaText,
                            chancePct: Math.round(successChance),
                            d10: d10,
                            modifierSum: modifierSum,
                            total: result.roll,
                            margin: result.margin,
                            success: true,
                            partial: false,
                            mods: mods,
                            deltas: { stress: 2, endurance: -2 },
                            costs: ['Wounded (3 turns)', 'Endurance -2', 'Stress +2'],
                            gearCallouts: [],
                            insideReach: false,
                            timing: { bonus: timing.bonus, label: timing.label },
                            returnScene: window.gameState.randomEncounter?.returnScene || 
                                        (typeof window.scenes !== 'undefined' && window.scenes['march_through_normandy_1'] ? 'march_through_normandy_1' : null),
                            secondChance: true,
                            survived: true
                        };
                        
                        // Clear the first failure flag
                        window.gameState.lastSkirmishFirstFailure = null;
                        
                        return 'skirmish_roadside_resolve';
                    } else {
                        // Second check failed - death
                        window.gameState.lastSkirmishFirstFailure = null;
                        return 'death_combat';
                    }
                }
            }
        ]
    },
    
    skirmish_roadside_resolve: {
        title: "After the Clash",
        text: function() {
            const skirmish = window.gameState.lastSkirmish;
            if (!skirmish) return `<p>The clash ends. Dust settles.</p>`;
            
            // Build timing display (explicit Tempo Strike result)
            const timingDisplay = skirmish.timing && skirmish.timing.bonus !== undefined
                ? `<div class="tempo-result" style="margin-bottom: 10px;">
                    <strong>Tempo:</strong> ${skirmish.timing.label || 'SKIP'} ${skirmish.timing.bonus > 0 ? `(+${skirmish.timing.bonus})` : ''}
                </div>`
                : '';
            
            // Build dice display (reuse Crécy pattern exactly)
            // Format: "1d10 + X = TOTAL (vs DC)"
            const rollDisplay = `<div class="dice-roll">
                <strong>Roll:</strong> ${skirmish.formulaText} = ${skirmish.total} (vs ${skirmish.dc})
                <br><em>Chance to succeed: ${skirmish.chancePct}%</em>
                <br><strong>${skirmish.success ? 'SUCCESS' : 'FAILURE'}</strong>
                <br>Margin: ${skirmish.margin >= 0 ? '+' : ''}${skirmish.margin}
            </div>`;
            
            // Build cost display
            const costDisplay = skirmish.costs.length > 0 
                ? `<div class="costs"><strong>Costs:</strong><ul>${skirmish.costs.map(c => `<li>${c}</li>`).join('')}</ul></div>`
                : '';
            
            // Build gear callouts
            const gearDisplay = skirmish.gearCallouts.length > 0
                ? `<div class="gear-callouts">${skirmish.gearCallouts.map(c => `<p><em>${c}</em></p>`).join('')}</div>`
                : '';
            
            // Outcome prose (varies by margin/choice and second chance)
            let outcomeText = '';
            if (skirmish.secondChance && skirmish.survived) {
                outcomeText = `<p>You barely survive. Wounded. Bleeding. But alive. The enemy falls back. You've won. But at a cost. A heavy cost. Your body screams. Your wounds burn. But you're still standing. Still breathing. Still alive. That's something. That's everything.</p>`;
            } else if (skirmish.success) {
                if (skirmish.margin <= 1) {
                    outcomeText = `<p>You drive them back, but it's close. Too close. Your gear takes the strain. Your lungs burn.</p>`;
                } else if (skirmish.margin <= 4) {
                    outcomeText = `<p>You hold. They break. The road clears. But nothing comes free. Your kit shows the wear.</p>`;
                } else {
                    outcomeText = `<p>Clean work. They scatter. The column moves on. Still, the march takes its toll.</p>`;
                }
            } else {
                // This shouldn't happen now - failures go to second chance
                outcomeText = `<p>They push hard. You give ground. Your gear strains. Your morale dips. The cost shows.</p>`;
            }
            
            return `${timingDisplay}${rollDisplay}${costDisplay}${gearDisplay}${outcomeText}`;
        },
        onEnter: function() {
            // Check exertion threshold
            if (window.gameState.exertion >= 3 && !window.hasCondition('Fatigued')) {
                window.addCondition('Fatigued', 'negative', 2);
            }
            
            // Check wear threshold
            if (window.gameState.wear >= 3 && !window.hasCondition('Bruised')) {
                window.addCondition('Bruised', 'negative', 2);
            }
            
            // Alternative: use flag instead of condition
            if (window.gameState.wear >= 3) {
                window.gameState.flags.KitStrained = true;
            }
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: function() {
                    // Fix D: Guard - resolve scene should never route back into skirmish/resolve loop
                    const resolveScene = window.gameState.currentScene;
                    const invalidResolveRoutes = ['skirmish_roadside', 'skirmish_roadside_resolve',
                                                 'skirmish_roadside_mud', 'skirmish_roadside_lane'];

                    // Compute the travel scene we should return to
                    let nextScene = window.getPostSkirmishNextScene();

                    // Fix D: Assertion - verify we got a valid scene
                    if (!nextScene || invalidResolveRoutes.includes(nextScene)) {
                        console.error('[QA ROUTING GUARD] Invalid returnScene from resolve:', nextScene, 'using fallback');
                        nextScene = (typeof window.scenes !== 'undefined' && window.scenes['march_through_normandy_1'] ? 'march_through_normandy_1' : 'start');
                    }

                    // Store the travel scene for return routing (before any interludes)
                    const travelReturnScene = nextScene;

                    // Run campfire insertion (may return campfire_interlude or nextScene)
                    // maybeInsertCampfire already sets gameState.campfire.returnScene = nextSceneKey
                    nextScene = window.maybeInsertCampfire(nextScene);

                    // Ensure campfire returns to travel scene (not resolve scene)
                    if (nextScene === "campfire_interlude" && window.gameState.campfire) {
                        window.gameState.campfire.returnScene = travelReturnScene;
                    }

                    // Tick random encounter cooldown (from current scene: skirmish_roadside_resolve)
                    window.tickRandomEncounterCooldown(window.gameState.currentScene);

                    // Run random encounter insertion (may return encounter scene or nextScene)
                    // maybeInsertRandomEncounter already sets gameState.randomEncounter.returnScene = nextSceneKey
                    // This correctly chains: if campfire was inserted, random encounter returns to campfire
                    // which then returns to travel. If no campfire, random encounter returns to travel.
                    nextScene = maybeInsertRandomEncounter(gameState.currentScene, nextScene);

                    // Clean up stale randomEncounter.returnScene (even if inactive)
                    // Prevents stale returnScene from pointing back to resolve scene
                    if (gameState.randomEncounter) {
                        const staleResolveScenes = ['skirmish_roadside_resolve', 'skirmish_roadside'];
                        if (staleResolveScenes.includes(gameState.randomEncounter.returnScene)) {
                            // If encounter is active, maybeInsertRandomEncounter already set returnScene correctly
                            // But if it somehow still points to resolve, fix it
                            // If inactive, clean up stale reference
                            gameState.randomEncounter.returnScene = travelReturnScene;
                        }
                    }
                    
                    // Clear skirmish data only if we're actually leaving the resolve scene.
                    // If nextScene somehow points back here, keep lastSkirmish so the UI doesn't blank out.
                    if (nextScene !== 'skirmish_roadside_resolve') {
                        gameState.lastSkirmish = null;
                        window.gameState.lastSkirmishFirstFailure = null; // Clear first failure flag
                    }
                    
                    return nextScene;
                }
            }
        ]
    },

    restart: {
        title: "New Beginning",
        year: null,
        age: null,
        text: `<p>The war ends. Or you do. One way or another. The story closes. The journey stops. The life you lived. The choices you made. The man you became. All of it. Done. Finished. Over. Or supposed to be. Supposed to mean something. But does it. Does any of it.</p>
               <p>Would you like to start again. A new game. A new life. To try again. To be different. To make different choices. To become someone else. Or the same. Or something in between. The choice is yours.</p>`,
        choices: [
            {
                text: "Yes, start over",
                effects: {},
                nextScene: "reset"
            }
        ]
    },
    reset: {
        title: "Starting Over",
        year: 1337,
        age: function() { return window.gameState.age; },
        text: `<p>Your journey begins. Anew. Again. From the start. From the beginning. The year is 1337. The war is new. You are young. Or think you are. For what comes next.</p>
               <p>The path stretches ahead. Full of choices. Full of danger. Full of everything that makes war terrible. You'll face it. Endure it. Survive it. That's all you can do. All you can be. The journey begins. Again.</p>`,
        choices: [
            {
                text: "Begin",
                effects: {},
                nextScene: "start"
            }
        ]
    }
    });
})();
