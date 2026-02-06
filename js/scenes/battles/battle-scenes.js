(function() {
    'use strict';
    
    if (typeof window.scenes === 'undefined') {
        window.scenes = {};
    }
    
    Object.assign(window.scenes, {
    first_battle_brave: {
        title: "First Blood",
        year: 1338,
        age: function() { return gameState.age; },
        location: "Northern France",
        artwork: "artwork/battle-scene-1.jpg", // French vs English battle scene
        artworkCaption: "The clash of arms on the field of battle",
        text: `<p>You charge into battle. With courage. Or what passes for it. Or what you hope is courage. But might be fear. Might be desperation. Might be everything that makes men run toward death. But you charge anyway. Because you have to. Because there's no other choice.</p>
               <p>The clash of steel rings in your ears. The sound is terrible. Beautiful. Terrifying. Men scream. Die. Fall around you. A French soldier breaks through the line. Coming at you. Sword raised. What do you do?</p>`,
        choices: [
            {
                text: "Meet him head-on - Strength against strength",
                effects: { stress: 1 },
                nextScene: "first_battle_brave_resolve",
                requiresResolution: true,
                resolutionStat: "strength",
                resolutionDifficulty: 8
            },
            {
                text: "Dodge and counter - Use agility",
                effects: { stress: 1 },
                nextScene: "first_battle_brave_resolve",
                requiresResolution: true,
                resolutionStat: "agility",
                resolutionDifficulty: 7
            },
            {
                text: "Fall back and let comrades help - Tactical retreat",
                effects: { stress: 1, morale: -1 },
                nextScene: "first_battle_brave_resolve",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 6
            }
        ]
    },
    first_battle_brave_resolve: {
        title: "First Blood",
        year: 1338,
        age: function() { return gameState.age; },
        location: "Northern France",
        artwork: "artwork/battle-aftermath.jpg",
        artworkCaption: "The first battle ends - blood and survival",
        text: function() {
            const result = gameState.lastResolution;
            if (!result) return `<p>The battle rages around you. The sound is terrible. The sight is worse. Men die. Scream. Fall everywhere. But you fight. Keep fighting. Keep going. Because you have to. Because there's no other choice.</p>
                                   <p>Your first battle. Your first blood. It changes you. Breaks you. Makes you into what you'll become. What war makes you. You fight with all your might. With everything you have. Because that's what you do. That's what you're trained to do.</p>`;
            
            const difficulty = result.baseDifficulty || 6;
            const neededRoll = difficulty - result.effectiveStat;
            const successChance = Math.max(0, Math.min(100, ((10 - neededRoll + 1) / 10) * 100));
            
            const rollDisplay = `<div class="dice-roll">
                <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
                <br><em>Chance to succeed: ${Math.round(successChance)}%</em>
                <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
            </div>`;
            
            if (result.success) {
                return `${rollDisplay}<p>You fight well. Drive back the French. Hold your ground. Your bravery shows. Is noted. By your comrades. By your captain. You take a minor wound. But you survive. The French retreat. The battle ends. For now. That's something. That's enough.</p>
                       <p>You've survived your first battle. Your first blood. It changes you. Breaks you. Makes you into what you'll become. What war makes you. Your comrades respect you. Your courage. Your skill. That matters. That helps.</p>`;
            } else {
                return `${rollDisplay}<p>The battle is fierce. Terrible. Deadly. You take a serious wound. But manage to survive. Barely. The French retreat. But you're left bleeding. Hurting. Broken. By the wound. By the battle. By everything. By nothing. By the knowledge that war is real. That death is real. That everything is real. And terrible. And permanent.</p>
                       <p>You've learned. That war is not glorious. Not like the songs. Not like the stories. Not like anything you imagined. It's brutal. Terrible. Deadly. Real. You've learned the hard way. The only way that matters. The only way that sticks. The knowledge weighs. Heavy. Real. Permanent. You did what you could. But it wasn't enough. It never is.</p>`;
            }
        },
        onEnter: function() {
            const result = gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('experience', 10);
                applyStatChange('reputation', 1);
                applyStatChange('morale', 1);
                applyStatChange('stress', 1); // Battle is stressful
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
                text: "Continue to winter quarters",
                effects: {},
                nextScene: "winter_quarters"
            }
        ]
    },
    first_battle_cautious: {
        title: "First Battle",
        year: 1338,
        age: function() { return gameState.age; },
        location: "Northern France",
        artwork: "artwork/battle-scene-3.jpg",
        artworkCaption: "The first battle - staying with the main force",
        text: `<p>You fight in formation. Stay close to your comrades. To your shield. To your safety. Or what passes for it. But you hold. Keep formation. Keep discipline. Keep going. Because that's what you do. That's what you're trained to do.</p>
               <p>The battle is fierce. Terrible. Deadly. But you emerge unscathed. For now. That's something. That's enough. Your caution served you well. Your discipline. Your care. You've learned the value of discipline and formation. Of staying together.</p>
               <p>Your first battle. Your first blood. It changes you. Breaks you. Makes you into what you'll become. What war makes you. But you survived. That's something. That's enough. Sometimes survival is enough.</p>`,
        onEnter: function() {
            applyStatChange('experience', 5);
            applyStatChange('stress', 1);
            gameState.career.battles++;
        },
        choices: [
            {
                text: "Continue to winter quarters",
                effects: {},
                nextScene: "winter_quarters"
            }
        ]
    },
    first_battle_tactical: {
        title: "A Tactical Mind",
        year: 1338,
        age: function() { return gameState.age; },
        location: "Northern France",
        artwork: "artwork/battle-scene-6.jpg",
        artworkCaption: "A tactical mind - seeing the field differently",
        text: `<p>Your suggestion works. To flank the French position. Attack from the side. From behind. Where they're not expecting it. Your lord takes notice of your thinking. Of your strategy. Not just another sword arm. Someone who sees the field. Who understands how battles are won.</p>
               <p>You've earned respect through intelligence. Through strategy. Not just force. Not just strength. But thinking and planning. Seeing what others miss. You've done right. Done well. Done what needed doing. That's something. That's enough.</p>
               <p>Your first battle. Your first blood. It changes you. Breaks you. Makes you into what you'll become. What war makes you. But you survived through thinking. Through strategy. Through everything that makes you different. Makes you more than just a soldier. More than just a killer.</p>`,
        onEnter: function() {
            applyStatChange('experience', 10);
            applyStatChange('reputation', 2);
            applyStatChange('wits', 1);
            applyStatChange('stress', 1);
            gameState.career.battles++;
        },
        choices: [
            {
                text: "Continue to winter quarters",
                effects: {},
                nextScene: "winter_quarters"
            }
        ]
    },
    first_battle_leader: {
        title: "Leading Men",
        year: 1338,
        age: function() { return gameState.age; },
        location: "Northern France",
        artwork: "artwork/battle-scene-4.jpg",
        artworkCaption: "Leading a unit in your first battle",
        text: `<p>You lead them into battle. Your unit. Your men. Your responsibility. The French line ahead. Your men look to you. For orders. For courage. For something to follow.</p>
               <p>The battle begins. Steel clashes. Men shout. The chaos of war surrounds you. Can you lead them through this? Can you keep them together? Can you make the right choices when everything is happening at once?</p>`,
        choices: [
            {
                text: "Charge the center - Break their line",
                effects: { stress: 1 },
                nextScene: "first_battle_leader_resolve",
                requiresResolution: true,
                resolutionStat: "strength",
                resolutionDifficulty: 7
            },
            {
                text: "Flank from the left - Tactical advantage",
                effects: { stress: 1 },
                nextScene: "first_battle_leader_resolve",
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 6
            },
            {
                text: "Hold the line - Defensive formation",
                effects: { stress: 1 },
                nextScene: "first_battle_leader_resolve",
                requiresResolution: true,
                resolutionStat: "charisma",
                resolutionDifficulty: 7
            }
        ]
    },
    first_battle_leader_resolve: {
        title: "The Price of Leadership",
        year: 1338,
        age: function() { return gameState.age; },
        location: "Northern France",
        text: function() {
            const result = gameState.lastResolution;
            if (!result) return `<p>The battle rages. Your men fight. You lead. Or try to. The outcome hangs in the balance.</p>`;
            
            const rollDisplay = `<div class="dice-roll">
                <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
                <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
            </div>`;
            
            if (result.success) {
                return `${rollDisplay}<p>You lead them well. Your unit holds. Fights. Wins. Together. As a team. The French break. Retreat. You've done right. Done well. Your leadership is recognized. By your lord. By your captain. By everyone who matters.</p>
                       <p>You're given more. Responsibility. Men. Trust. You've earned it through leadership and skill. Through everything that makes you different. Makes you more than just a soldier.</p>`;
            } else {
                return `${rollDisplay}<p>The battle goes wrong. Your orders are misunderstood. Or ignored. Or simply wrong. Men die. Your men. Good men. Because of you. Because of your choices. Because you failed them.</p>
                       <p>You survive. Barely. But the weight of failure sits heavy. Your reputation suffers. Your men look at you differently. With doubt. With blame. You led them into disaster. That knowledge burns. Permanent. Real.</p>
                       <p>You've learned. That leadership is not just giving orders. It's making the right choices. At the right time. When everything depends on it. You failed. But you survived. That's something. That's enough. For now.</p>`;
            }
        },
        onEnter: function() {
            const result = gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('experience', 15);
                applyStatChange('reputation', 2);
                applyStatChange('patronFavor', 1);
                applyStatChange('stress', 1);
                gameState.career.battles++;
            } else if (result) {
                // Failure consequences
                applyStatChange('experience', 5); // Less experience for failure
                applyStatChange('reputation', -2); // Reputation loss
                applyStatChange('morale', -1); // Morale loss
                applyStatChange('stress', 2); // Higher stress
                addCondition('Shaken', 'negative', 3); // Temporary condition
                gameState.career.battles++;
            }
        },
        choices: [
            {
                text: "Continue to winter quarters",
                effects: {},
                nextScene: "winter_quarters"
            }
        ]
    }
    });
})();
