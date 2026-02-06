(function() {
    'use strict';
    
    if (typeof window.scenes === 'undefined') {
        window.scenes = {};
    }
    
    Object.assign(window.scenes, {
    between_years_1341: {
        title: "The Years Pass",
        year: 1341,
        age: function() { return gameState.age; },
        location: "Northern France",
        artwork: "artwork/campfire.jpg",
        artworkCaption: "The years blur - seasons into months, months into days",
        text: function() {
            let base = `<p>Winter quarters. Spring campaign. Summer raids. The rhythm becomes familiar. Predictable almost. You march. You fight. You survive. The years blur into seasons. Seasons into months. Months into days.</p>
               <p>You've learned the patterns. When to push forward. When to hold back. When to keep your head down. Your lord notices. Your comrades trust you. Experience is the only teacher that matters.</p>
               <p>But each season takes something. A friend. A piece of yourself. The man you were fades. The man you're becoming takes shape. Harder. Colder. More careful.</p>`;
            if (window.hasFlag('Heartbroken')) {
                const response = gameState.flags.MarieResponse;
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
        age: function() { return gameState.age; },
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
        age: function() { return gameState.age; },
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
        age: function() { return gameState.age; },
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
                onChoose: function() { if (typeof setFlag === 'function') setFlag('visitedKin', true); },
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
    }
    });
})();
