// ============================================================================
// NEW COMBAT ENCOUNTERS - Generated following COMBAT_ENCOUNTER_GENERATION_PROMPT.md
// ============================================================================

// ENCOUNTER 1: Forest Ambush (Early Game - Moderate Difficulty)
// Year: 1340, Location: Northern France, Type: Ambush/Skirmish
// Difficulty: Moderate (7), Risk: Medium, Stat Focus: Agility/Wits/Strength

forest_ambush_1340: {
    title: "Ambush in the Woods",
    year: 1340,
    age: 22,
    location: "Northern France",
    artworkCaption: "French archers emerge from the trees",
    text: `<p>The forest is quiet. Too quiet. The birds have stopped. The wind stills. Your column moves through the trees. Boots crunch on leaves. Mail jingles. Men talk in low voices. But something is wrong. Something is watching.</p>
           <p>An arrow strikes the man beside you. He falls. Doesn't make a sound. Just drops. The forest erupts. French archers. Dozens of them. Hidden in the trees. Shooting from cover. Your column breaks. Men scatter. Take cover. Or try to.</p>
           <p>You're exposed. In the open. Arrows fly. Whistle past. Strike around you. You need to move. Need to act. Need to survive. Because if you don't, you'll die here. In the woods. Alone. Forgotten.</p>`,
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
    age: 22,
    location: "Northern France",
    text: function() {
        const result = gameState.lastResolution;
        if (!result) return `<p>The forest is quiet again. The fighting is done. For now.</p>`;
        
        const rollDisplay = `<div class="dice-roll">
            <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
            <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
        </div>`;
        
        if (result.success) {
            return `${rollDisplay}<p>You survive. The archers break. Run deeper into the woods. Or die where they stand. Your action worked. Your choice mattered. Your skill showed. The column reforms. Men check wounds. Count the dead. The living move on. Because that's what you do. That's what you always do.</p>
                   <p>You've learned. Ambushes are common. The French know the land. Know the woods. Know where to hide. You'll remember this. Remember to watch. Remember to listen. Remember that quiet can mean death. That's something. That's enough.</p>`;
        } else {
            return `${rollDisplay}<p>You're hit. An arrow finds you. Strikes your shoulder. Or your leg. Or somewhere that bleeds. That hurts. That might kill you. But you keep moving. Keep fighting. Keep trying. Because stopping means death. Means giving up. Means letting them win.</p>
                   <p>You survive. Barely. The column breaks the ambush. But you're wounded. Bleeding. Hurting. The wound will heal. Or it won't. That's the risk. That's the cost. That's what war does. To you. To everyone. To everything.</p>`;
        }
    },
    onEnter: function() {
        const result = gameState.lastResolution;
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

// ENCOUNTER 2: Siege Defense (Mid Game - Hard Difficulty)
// Year: 1345, Location: Gascony, Type: Siege Defense
// Difficulty: Hard (8), Risk: High, Stat Focus: Endurance/Strength/Wits

siege_defense_1345: {
    title: "The Walls Hold",
    year: 1345,
    age: 26,
    location: "Gascony",
    artworkCaption: "French forces assault the castle walls",
    text: `<p>The siege has lasted weeks. The French pound the walls. Day and night. Stones fly. Men die. The walls hold. For now. But they're weakening. Cracking. Breaking. The French will come. Soon. They'll scale the walls. Break through the gates. Kill everyone inside.</p>
           <p>You stand on the ramparts. Watch them prepare. Ladders. Siege towers. Men in armor. Ready to die. Ready to kill. Ready to take what's yours. What you've defended. What you've bled for. The captain calls. Hold the walls. Hold the gates. Hold everything. Or die trying.</p>
           <p>The assault begins. Ladders hit the walls. Men climb. You're ready. Or you think you are. But ready isn't enough. Not always. Not when death comes calling. Not when the walls fall.</p>`,
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
    age: 26,
    location: "Gascony",
    text: function() {
        const result = gameState.lastResolution;
        if (!result) return `<p>The walls hold. For now. The assault continues.</p>`;
        
        const rollDisplay = `<div class="dice-roll">
            <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
            <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
        </div>`;
        
        if (result.success) {
            return `${rollDisplay}<p>The French break. Retreat. Leave their dead. Leave their wounded. Leave everything behind. The walls hold. The gates hold. You hold. Your defense worked. Your choice mattered. Your skill showed. The siege continues. But you've won this day. This battle. This moment.</p>
                   <p>Your captain notices. Your men respect you. Your defense was key. Was crucial. Was everything. You've earned favor. Earned respect. Earned your place. That matters. That helps. That keeps you alive. For now. That's something. That's enough.</p>`;
        } else {
            return `${rollDisplay}<p>The French break through. Your section. Your wall. Your defense. They pour in. Kill. Destroy. Take what they want. You fight. Keep fighting. But it's not enough. Never enough. You're overwhelmed. Outnumbered. Outmatched.</p>
                   <p>You take a serious wound. A blade finds you. Or a spear. Or something that cuts deep. That bleeds. That might kill you. But you survive. Barely. The French are driven back. Eventually. But you're left broken. Wounded. Changed. By the fight. By the siege. By everything.</p>`;
        }
    },
    onEnter: function() {
        const result = gameState.lastResolution;
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

// ENCOUNTER 3: Cavalry Skirmish (Early-Mid Game - Moderate Difficulty)
// Year: 1342, Location: Aquitaine, Type: Cavalry Engagement
// Difficulty: Moderate (7), Risk: Medium, Stat Focus: Agility/Luck/Strength

cavalry_skirmish_1342: {
    title: "Horsemen on the Road",
    year: 1342,
    age: 23,
    location: "Aquitaine",
    artworkCaption: "French cavalry charges across the field",
    text: `<p>You're on the road. Marching. Like always. Like every day. The column stretches ahead. Behind. A long line of men. Moving. Always moving. Toward something. Away from something. It doesn't matter what. Just that you move.</p>
           <p>Then you hear it. Hoofbeats. Many of them. Coming fast. Coming hard. Coming to kill. French cavalry. Dozens of riders. Armor gleaming. Lances lowered. Charging straight at you. At your column. At everything you are.</p>
           <p>There's no time. No warning. No chance to prepare. Just the charge. Just the horses. Just the death that comes with them. You need to act. Now. Before they hit. Before you die. Before everything ends.</p>`,
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
    age: 23,
    location: "Aquitaine",
    text: function() {
        const result = gameState.lastResolution;
        if (!result) return `<p>The cavalry passes. The dust settles. The dead remain.</p>`;
        
        const rollDisplay = `<div class="dice-roll">
            <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
            <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
        </div>`;
        
        if (result.success) {
            return `${rollDisplay}<p>The charge breaks. The horses turn. The riders retreat. Your action worked. Your choice was right. Your skill showed. The column reforms. Men check wounds. Count the dead. The living move on. Because that's what you do.</p>
                   <p>You've learned. Cavalry is fast. Is deadly. Is everything you fear. But it can be beaten. Can be stopped. Can be turned. If you're smart. If you're brave. If you're lucky. You were all three. That's something. That's enough.</p>`;
        } else {
            return `${rollDisplay}<p>The charge hits. Horses crash into you. Into your comrades. Into everything. Lances find targets. Men die. Scream. Fall. You're knocked down. Trampled. Broken. But you survive. Barely. Crawl out from under. Check your wounds. Count your blessings. If you have any.</p>
                   <p>You're hurt. Badly. But alive. The French ride on. Leave you behind. Leave the dead. Leave the wounded. You'll heal. Or you won't. That's the risk. That's the cost. That's what war does.</p>`;
        }
    },
    onEnter: function() {
        const result = gameState.lastResolution;
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

// ENCOUNTER 4: Night Raid (Mid Game - Hard Difficulty)
// Year: 1347, Location: Normandy, Type: Night Raid/Ambush
// Difficulty: Hard (8), Risk: High, Stat Focus: Agility/Wits/Luck

night_raid_1347: {
    title: "Darkness and Steel",
    year: 1347,
    age: 28,
    location: "Normandy",
    artworkCaption: "Shadows move in the darkness",
    text: `<p>Night falls. The camp settles. Fires burn low. Men sleep. Or try to. You're on watch. Standing guard. Looking into the darkness. Listening. Waiting. For something. For nothing. For whatever comes.</p>
           <p>Then you see them. Shadows. Moving. In the dark. Between the tents. Between the fires. French raiders. Dozens of them. Knives drawn. Swords ready. Coming to kill. Coming to burn. Coming to destroy everything.</p>
           <p>You need to act. Now. Before they strike. Before men die. Before everything is lost. You can sound the alarm. Or fight them alone. Or try something else. Something desperate. Something that might work. Or might get you killed.</p>`,
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
    age: 28,
    location: "Normandy",
    text: function() {
        const result = gameState.lastResolution;
        if (!result) return `<p>The night passes. The darkness lifts. The dead remain.</p>`;
        
        const rollDisplay = `<div class="dice-roll">
            <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
            <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
        </div>`;
        
        if (result.success) {
            return `${rollDisplay}<p>The raid fails. The French break. Run into the darkness. Leave their dead. Leave their wounded. Leave everything. Your action worked. Your choice was right. Your skill showed. The camp is saved. Men live. Because of you. Because of what you did.</p>
                   <p>Your captain notices. Your men respect you. Your watch was key. Was crucial. Was everything. You've earned favor. Earned respect. Earned your place. That matters. That helps. That keeps you alive. For now. That's something. That's enough.</p>`;
        } else {
            return `${rollDisplay}<p>The raid succeeds. The French strike. Kill. Burn. Destroy. Men die. Scream. Fall. You fight. Keep fighting. But it's not enough. Never enough. You're overwhelmed. Outnumbered. Outmatched. Something finds you. A blade. A knife. Something that cuts deep.</p>
                   <p>You're wounded. Badly. But alive. The French retreat. Eventually. But you're left broken. Wounded. Changed. By the fight. By the night. By everything. The camp is saved. But at a cost. Always at a cost.</p>`;
        }
    },
    onEnter: function() {
        const result = gameState.lastResolution;
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

// ENCOUNTER 5: Town Fighting (Mid Game - Hard Difficulty)
// Year: 1348, Location: Calais, Type: Urban Combat
// Difficulty: Hard (8), Risk: High, Stat Focus: Strength/Agility/Wits

town_fighting_1348: {
    title: "Streets of Calais",
    year: 1348,
    age: 29,
    location: "Calais",
    artworkCaption: "Combat in the narrow streets",
    text: `<p>The town is a maze. Narrow streets. Tight alleys. Dead ends. The French hold it. Or try to. You're taking it back. Or trying to. House by house. Street by street. Room by room. It's slow. It's deadly. It's everything war shouldn't be. But is.</p>
           <p>You're in the streets. Fighting. Always fighting. French soldiers. Behind windows. On rooftops. In doorways. Everywhere. Nowhere. You need to clear this block. This street. This section. Or die trying. Because that's what you do. That's what you're here for.</p>
           <p>The fighting is close. Personal. Face to face. Blade to blade. No room to maneuver. No space to think. Just fight. Just kill. Just survive. Because if you don't, you'll die here. In the streets. Alone. Forgotten.</p>`,
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
    age: 29,
    location: "Calais",
    text: function() {
        const result = gameState.lastResolution;
        if (!result) return `<p>The fighting continues. The streets run red.</p>`;
        
        const rollDisplay = `<div class="dice-roll">
            <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
            <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
        </div>`;
        
        if (result.success) {
            return `${rollDisplay}<p>The street clears. The French break. Run. Die. Or surrender. Your action worked. Your choice was right. Your skill showed. The block is yours. The street is yours. The town is closer to being yours. That's something. That's enough.</p>
                   <p>Your captain notices. Your men respect you. Your fighting was key. Was crucial. Was everything. You've earned favor. Earned respect. Earned your place. That matters. That helps. That keeps you alive. For now. That's something. That's enough.</p>`;
        } else {
            return `${rollDisplay}<p>The fighting is fierce. Terrible. Deadly. The French hold. Fight back. Push you. Break you. Something finds you. A blade. A spear. Something that cuts deep. That bleeds. That might kill you. But you survive. Barely. Keep fighting. Keep trying. Because stopping means death.</p>
                   <p>You're wounded. Badly. But alive. The French retreat. Eventually. But you're left broken. Wounded. Changed. By the fight. By the streets. By everything. The block is yours. But at a cost. Always at a cost.</p>`;
        }
    },
    onEnter: function() {
        const result = gameState.lastResolution;
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

// ENCOUNTER 6: Archery Duel (Early Game - Easy-Moderate Difficulty)
// Year: 1339, Location: Northern France, Type: Archery/Skirmish
// Difficulty: Moderate (7), Risk: Low-Medium, Stat Focus: Agility/Wits/Luck

archery_duel_1339: {
    title: "The Archers' Stand",
    year: 1339,
    age: 20,
    location: "Northern France",
    artworkCaption: "Arrows fly across the field",
    text: `<p>The French archers hold the ridge. Dozens of them. Bows drawn. Arrows ready. They've been shooting all day. Picking off your men. One by one. Slowly. Methodically. Like they have all the time in the world. Like you don't matter. Like your lives don't matter.</p>
           <p>You're ordered forward. With the archers. To return fire. To make them pay. To make them stop. Or die trying. You take your bow. String an arrow. Draw. Aim. Release. The arrow flies. Finds a target. Or misses. It doesn't matter. Just that you try. Just that you fight back.</p>
           <p>The exchange is deadly. Arrows fly both ways. Men fall. Die. Scream. The ridge is far. The targets are small. The wind is wrong. Everything is against you. But you keep shooting. Keep trying. Keep fighting. Because that's what you do. That's what you're here for.</p>`,
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
    age: 20,
    location: "Northern France",
    text: function() {
        const result = gameState.lastResolution;
        if (!result) return `<p>The archers continue. The exchange goes on.</p>`;
        
        const rollDisplay = `<div class="dice-roll">
            <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
            <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
        </div>`;
        
        if (result.success) {
            return `${rollDisplay}<p>The French archers break. Retreat. Leave the ridge. Leave their dead. Leave their wounded. Your fire worked. Your choice was right. Your skill showed. The ridge is yours. The field is yours. The day is closer to being yours. That's something. That's enough.</p>
                   <p>You've learned. Archery is skill. Is patience. Is everything that makes war precise. Deadly. Real. You're getting better. Getting skilled. Getting dangerous. That matters. That helps. That keeps you alive. For now. That's something. That's enough.</p>`;
        } else {
            return `${rollDisplay}<p>An arrow finds you. Strikes your arm. Or your leg. Or somewhere that bleeds. That hurts. That might kill you. But you keep shooting. Keep fighting. Keep trying. Because stopping means death. Means giving up. Means letting them win.</p>
                   <p>You're wounded. But alive. The French retreat. Eventually. But you're left bleeding. Hurting. Changed. By the arrow. By the fight. By everything. You'll heal. Or you won't. That's the risk. That's the cost. That's what war does.</p>`;
        }
    },
    onEnter: function() {
        const result = gameState.lastResolution;
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

// ENCOUNTER 7: River Crossing (Mid Game - Hard Difficulty)
// Year: 1344, Location: Gascony, Type: River Crossing/Assault
// Difficulty: Hard (8), Risk: High, Stat Focus: Strength/Endurance/Wits

river_crossing_1344: {
    title: "The River Runs Red",
    year: 1344,
    age: 25,
    location: "Gascony",
    artworkCaption: "Men struggle across the river under fire",
    text: `<p>The river is wide. Deep. Cold. The French hold the far bank. Archers. Dozens of them. Shooting. Killing. Making the water run red. Your column needs to cross. Needs to get to the other side. Needs to take that bank. Or die trying.</p>
           <p>You're ordered forward. Into the water. Into the arrows. Into the death that waits. The current is strong. The bottom is muddy. The arrows fly. Men fall. Die. Float away. The crossing is slow. Is deadly. Is everything war shouldn't be. But is.</p>
           <p>You need to get across. Need to reach the bank. Need to fight. Or die in the water. Because that's what you do. That's what you're here for. That's what war demands.</p>`,
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
    age: 25,
    location: "Gascony",
    text: function() {
        const result = gameState.lastResolution;
        if (!result) return `<p>The river flows. The dead float. The living struggle.</p>`;
        
        const rollDisplay = `<div class="dice-roll">
            <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
            <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
        </div>`;
        
        if (result.success) {
            return `${rollDisplay}<p>You make it across. Reach the bank. Fight. Drive the French back. Break their line. Take the position. Your action worked. Your choice was right. Your skill showed. The crossing is yours. The bank is yours. The river is behind you. That's something. That's enough.</p>
                   <p>Your captain notices. Your men respect you. Your crossing was key. Was crucial. Was everything. You've earned favor. Earned respect. Earned your place. That matters. That helps. That keeps you alive. For now. That's something. That's enough.</p>`;
        } else {
            return `${rollDisplay}<p>An arrow finds you. Strikes you in the water. Or you're hit on the bank. Or something happens. Something bad. Something that cuts deep. That bleeds. That might kill you. But you make it across. Reach the bank. Fight. Keep fighting. Because stopping means death.</p>
                   <p>You're wounded. Badly. But alive. The French retreat. Eventually. But you're left broken. Wounded. Changed. By the arrow. By the water. By the fight. By everything. The bank is yours. But at a cost. Always at a cost.</p>`;
        }
    },
    onEnter: function() {
        const result = gameState.lastResolution;
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

// ENCOUNTER 8: Desperate Last Stand (Late Game - Very Hard Difficulty)
// Year: 1350, Location: Northern France, Type: Desperate Defense
// Difficulty: Very Hard (9), Risk: Extreme, Stat Focus: Endurance/Strength/Wits

last_stand_1350: {
    title: "No Retreat",
    year: 1350,
    age: 31,
    location: "Northern France",
    artworkCaption: "Outnumbered and surrounded",
    text: `<p>You're surrounded. Cut off. Alone. Or as alone as you can be with a handful of men. The French close in. Hundreds of them. Maybe thousands. It doesn't matter. Just that they're coming. Just that they're going to kill you. Just that this might be the end.</p>
           <p>Your captain is dead. Your unit is broken. Your hope is gone. But you're still here. Still fighting. Still alive. For now. You can make a stand. Or try to break through. Or do something desperate. Something that might work. Or might get you killed. But everything might get you killed. That's the risk. That's the cost. That's what war does.</p>
           <p>This is it. This is everything. This is all you have. All you are. All you'll ever be. Make it count. Make it matter. Make it mean something. Or die trying. Because that's what you do. That's what you've always done. That's what war demands.</p>`,
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
    age: 31,
    location: "Northern France",
    text: function() {
        const result = gameState.lastResolution;
        if (!result) return `<p>The French close in. The end draws near.</p>`;
        
        const rollDisplay = `<div class="dice-roll">
            <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
            <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
        </div>`;
        
        if (result.success) {
            return `${rollDisplay}<p>You survive. Somehow. Someway. You break through. Or hold them off. Or do something impossible. Something that shouldn't work. But does. The French break. Retreat. Leave you. Leave the dead. Leave everything. You're alive. For now. That's something. That's enough.</p>
                   <p>You've learned. Desperation is a weapon. Is a tool. Is everything that keeps you alive when nothing else will. You're a survivor. A fighter. A man who won't quit. That matters. That helps. That keeps you alive. For now. That's something. That's enough.</p>`;
        } else {
            return `${rollDisplay}<p>You're hit. Badly. Seriously. Something finds you. A blade. A spear. Something that cuts deep. That bleeds. That might kill you. But you survive. Barely. Crawl out. Get away. Live. For now. That's something. That's enough.</p>
                   <p>You're seriously wounded. Broken. Changed. By the fight. By the desperation. By everything. But you're alive. For now. That's something. That's enough. Sometimes that's all you get. All you can hope for. All you can ask for. In war. In life. In everything.</p>`;
        }
    },
    onEnter: function() {
        const result = gameState.lastResolution;
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
            // High death risk in extreme encounters
            if (Math.random() < 0.15) {
                // 15% chance of death on failure in extreme encounter
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
}
