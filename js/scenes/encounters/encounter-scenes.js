(function() {
    'use strict';
    
    if (typeof window.scenes === 'undefined') {
        window.scenes = {};
    }
    
    Object.assign(window.scenes, {
    marsh_crossing: {
        title: "The Marshlands",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/Passages_faiz_oultre_mer_SEBASTIEN_MAMEROT_143r.png",
        artworkCaption: "The long march through difficult terrain",
        text: function() {
            return `<p>Water. Everywhere water. The ground had turned to marsh two miles back. Now you waded through it. Knee-deep in places. The water was brown. Thick with sediment. It smelled of rot. Of things long dead. Insects swarmed. Biting. Relentless. You swatted at them but more came.</p>
                   
                   <p>The horses struggled. Their hooves sucked at the mud. Some had already foundered. Left behind. Their riders walking now. Carrying what gear they could. The rest abandoned. Sinking slowly into the mire. The column had stretched out. Men finding their own paths. Seeking firmer ground. But there was none.</p>
                   
                   <p>Your legs burned. Each step an effort. Lifting your foot. The mud fighting to keep it. Then forward. Then down. Then again. The water soaked through your boots. Your feet were numb. Cold. The padding under your mail was sodden. The weight doubled. Tripled. Your shoulders ached. Your back. Everything.</p>
                   
                   <p>A man fell ahead. Just disappeared. One moment walking. The next gone. Swallowed by the marsh. Others rushed to him. Grabbed his arms. Hauled him up. He came out coughing. Gasping. Covered in mud. They dragged him to shallower water. He sat there. Shaking. The look in his eyes said he'd seen something down there. In the dark water. Something he didn't want to remember.</p>
                   
                   <p>The sergeant called out. Keep moving. Don't stop. If you stop you sink. It was true. You could feel it. The mud beneath your feet. Always pulling. Always trying to drag you down. The marsh wanted you. All of you. It would take what it could get.</p>`;
        },
        choices: [
            {
                text: "Help others through the worst sections",
                effects: { reputation: 1, endurance: -1 },
                nextScene: "marsh_exit"
            },
            {
                text: "Focus on getting yourself through",
                effects: { endurance: 1 },
                requiresResolution: true,
                resolutionStat: "endurance",
                resolutionDifficulty: 7,
                nextScene: "marsh_exit"
            },
            {
                text: "Try to find a better path",
                effects: { wits: 1 },
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 8,
                nextScene: "better_route"
            }
        ]
    },
    
    better_route: {
        title: "A Clearer Path",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/Passages_faiz_oultre_mer_SEBASTIEN_MAMEROT_143r.png",
        artworkCaption: "Finding a better way through the marsh",
        text: function() {
            const result = gameState.lastResolution;
            if (!result) return `<p>You look for another path...</p>`;
            if (result.success) {
                return `<p>You leave the main path. Strike out on your own. Looking. Thinking. The marsh stretches in all directions. But you've seen patterns. Learned to read the land. You look for higher ground. For firmer soil. For anything that might make the crossing easier.</p>
                       <p>There. To the north. A slight rise. The ground looks different. Less waterlogged. You head that way. Your boots sink less. The going is easier. Not easy. Never easy. But better. You've found something. A way through. A better way.</p>
                       <p>You signal to others. Point the way. They follow. The column shifts. Moves to your path. Your discovery. The crossing becomes easier. Not easy. But better. Fewer men struggle. Fewer sink. You've saved time. Saved effort. Saved lives maybe. Through thinking. Through looking. Through finding what others missed.</p>
                       <p>The marsh is behind you. The solid ground ahead. You've done it. Found a better way. Made a difference. Small. But real. The men know it. You can see it in their eyes. The gratitude. The respect. You've earned it. Not through strength. Through wits.</p>`;
            } else {
                return `<p>You leave the main path. Strike out. Looking. Searching. But there's nothing. No better way. No easier path. Just more marsh. More water. More mud. You waste time. Precious time. The column waits. The French might be coming. Every moment matters.</p>
                       <p>You return. Empty-handed. No better route. No alternative. Just the same difficult crossing. The same struggle. You've gained nothing. Lost time. The sergeant's eyes show his frustration. You tried. But trying isn't enough. Not always.</p>
                       <p>You rejoin the column. Take your place. The crossing begins. The same as it would have been. Hard. Exhausting. Dangerous. You've learned nothing. Gained nothing. But you're still here. Still moving. That's something. That's enough.</p>`;
            }
        },
        onEnter: function() {
            const result = gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('wits', 1);
                applyStatChange('reputation', 1);
                applyStatChange('stress', -1);
            } else if (result) {
                applyStatChange('stress', 1);
                applyStatChange('endurance', -1);
            }
        },
        choices: [
            {
                text: "Continue the march",
                effects: {},
                nextScene: "march_through_normandy_1"
            }
        ]
    },
    
    night_march: {
        title: "March Under Stars",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/march.jpg",
        artworkCaption: "The column moves through darkness - only the sound of boots",
        text: function() {
            return `<p>Darkness. The column moved through it like a blind thing. Feeling its way. The moon was new. No light except the stars. Cold and distant. They gave just enough to see the man ahead. His shape. Nothing more. You followed that shape. Trusted it knew where to go.</p>
                   
                   <p>No talking. The order had come down at dusk. Silence. The French were close. Maybe watching. Maybe waiting. Sound carried at night. A voice. The jingle of harness. The cough of a sick man. All of it could give you away. So you walked in silence. The only sounds your breathing. Your footsteps. The creak of leather. The whisper of mail.</p>
                   
                   <p>You stumbled. A rut in the road. Caught your foot. Nearly went down. Caught yourself. Your heart pounded. The fear of falling. Of being left behind. Of being alone in the dark with the enemy out there. Somewhere. You kept walking. Faster now. Catching up.</p>
                   
                   <p>The air was cold. Your breath misted. You couldn't see it but you felt it. The moisture on your face. In your lungs. The chill worked its way through your clothes. Your mail. Into your bones. You shivered. Tried not to. Tried to stay warm through movement. It didn't work.</p>
                   
                   <p>Hours passed. Or maybe minutes. Time had no meaning in the dark. There was only the walking. The following. The trying not to fall. The trying not to be left. Ahead someone tripped. You heard the clatter. Metal on stone. Then cursing. Quickly silenced. The sergeant's voice. Low. Harsh. Watch your step you fool. Then silence again. Just the walking. Just the dark.</p>`;
        },
        choices: [
            {
                text: "Stay alert—watch for danger",
                effects: { wits: 1, stress: 1 },
                nextScene: "dawn_arrival"
            },
            {
                text: "Focus on keeping pace",
                effects: { endurance: 1 },
                nextScene: "dawn_arrival"
            },
            {
                text: "Help the man who fell",
                effects: { reputation: 1, initiative: -1 },
                nextScene: "dawn_arrival"
            }
        ]
    },
    
    supply_shortage: {
        title: "Empty Wagons",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/supplyshortage.jpg",
        artworkCaption: "Empty wagons and hungry men - the supply train hasn't arrived",
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>The wagons came up empty. No bread. No ale. No salted meat. The quartermaster stood before angry men. His hands spread. Nothing, he said. The supply train hasn't arrived. We wait or we forage. Those were the options. Neither good.</p>
                   
                   <p>Your stomach was hollow. Aching. You'd had nothing since dawn. Stale bread. Moldy cheese. That was twelve hours ago. Now the sun was setting. The cold coming. And no food. Around you men muttered. Dark words. Dangerous words. Some looked at the quartermaster like they might take what he claimed he didn't have. By force if necessary.</p>
                   
                   <p>The sergeant stepped forward. His voice cut through the murmuring. Any man who touches the quartermaster answers to me, he said. His hand was on his sword. Not threatening. Just ready. The men fell silent. But the anger remained. You could see it. In their eyes. In the set of their jaws. Hungry men were dangerous men. Even to each other.</p>
                   
                   <p>Will dispersed the crowd. A man-at-arms from Devon. He walked toward the woods. I'm going hunting, he called back. Anyone who wants to come is welcome. Several men followed. They disappeared into the trees. Their voices fading. You looked at the empty wagons. At the quartermaster. At the remaining men. All of them calculating. How long can we go without food. How long before discipline breaks. How long before someone does something stupid.</p>
                   
                   <p>Your stomach growled. The sound loud in the quiet. Someone laughed. Bitter. Humorless. We all feel it ${name}, a voice said. We all feel it. The question is what we do about it. You had choices. None of them good. But that was the nature of war. No good choices. Only degrees of bad.</p>`;
        },
        choices: [
            {
                text: "Join the hunting party",
                effects: { initiative: 1 },
                requiresResolution: true,
                resolutionStat: "agility",
                resolutionDifficulty: 6,
                nextScene: "hunting_expedition"
            },
            {
                text: "Raid a nearby village for supplies",
                effects: { wealth: 2, reputation: -2, stress: 1 },
                nextScene: "village_raid"
            },
            {
                text: "Wait it out—ration what you have",
                effects: { endurance: 1, morale: -1 },
                nextScene: "supply_arrives"
            },
            {
                text: "Gamble for someone else's rations",
                effects: { wealth: -1 },
                requiresResolution: true,
                resolutionStat: "luck",
                resolutionDifficulty: 7,
                nextScene: "gambling_outcome"
            }
        ]
    },
    
    hunting_expedition: {
        title: "The Hunt",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/supplyshortage.jpg",
        artworkCaption: "Into the woods - hunting for food",
        text: function() {
            const result = gameState.lastResolution;
            if (!result) return `<p>You follow Will into the trees...</p>`;
            if (result.success) {
                return `<p>The woods are quiet. Too quiet. But you move carefully. Watchful. Will knows what he's doing. He's done this before. You follow his lead. Stay low. Stay quiet. Wait. Watch. Listen.</p>
                       <p>There. Movement. A deer. Young. Thin. But meat. Will signals. You move. Slow. Careful. The deer doesn't see you. Doesn't hear you. You're close. Close enough. Will's arrow flies. True. The deer falls. Quick. Clean. Dead.</p>
                       <p>You dress it. Fast. Efficient. The meat is lean. But it's food. Real food. You carry it back. The men see it. Their eyes light up. Hope. Real hope. You've done it. Found food. When there was none. When everyone was hungry. You've made a difference.</p>
                       <p>The meat is divided. Shared. Everyone gets something. Not much. But something. It's enough. For now. The hunger fades. The morale lifts. You've saved the day. Through skill. Through luck. Through being in the right place at the right time.</p>`;
            } else {
                return `<p>The woods are empty. Or the game is too smart. Too wary. You walk for hours. See nothing. Hear nothing. The forest gives you nothing. You return empty-handed. Tired. Frustrated. Hungry. Still hungry.</p>
                       <p>The men see you come back. See your empty hands. Their faces fall. The hope dies. You've failed. Not through lack of trying. But trying isn't enough. Not always. The hunger remains. The morale sinks. You've let them down. Let yourself down.</p>`;
            }
        },
        onEnter: function() {
            const result = gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('morale', 2);
                applyStatChange('stress', -1);
                applyStatChange('reputation', 1);
            } else if (result) {
                applyStatChange('morale', -1);
                applyStatChange('stress', 1);
            }
        },
        choices: [
            {
                text: "Return to camp",
                effects: {},
                nextScene: "march_through_normandy_1"
            }
        ]
    },
    
    village_raid: {
        title: "Taking What You Need",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/burninglooting.jpg",
        artworkCaption: "The village - taking what the army needs",
        text: function() {
            return `<p>The village is small. Poor. Like most villages. But it has food. Grain. Chickens. Maybe a pig. Things you need. Things they won't give willingly. But you're soldiers. You take. That's how it works. That's how it's always worked.</p>
                   <p>You move through the village. Taking. Demanding. Threatening. The villagers watch. Fearful. Resigned. They've seen this before. They know what to expect. They give what they have. Or you take it. Either way, you get what you need.</p>
                   <p>You find grain. Bread. Some cheese. A few chickens. Not much. But something. You take it. Load it. Carry it back. The men eat. The hunger fades. But something else grows. Shame. Guilt. The knowledge of what you've done. What you've become.</p>
                   <p>The villagers will remember. They'll tell others. Your reputation suffers. But you're fed. The men are fed. That's what matters. That's what you tell yourself. But the look in their eyes. The fear. The hatred. That stays with you. Long after the food is gone.</p>`;
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "march_through_normandy_1"
            }
        ]
    },
    
    supply_arrives: {
        title: "Waiting",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/supplyshortage.jpg",
        artworkCaption: "Empty wagons and hungry men - waiting",
        text: function() {
            return `<p>You wait. Ration what you have. Make it last. One meal becomes two. Two becomes three. You stretch it. Make it work. The hunger grows. But you endure. You've done this before. You can do it again.</p>
                   <p>Days pass. Maybe. Time blurs when you're hungry. The days and nights run together. You wait. Hope. Pray. That the supply train will come. That food will arrive. That this will end.</p>
                   <p>Then. Finally. Wagons. On the horizon. The supply train. Late. But here. The food arrives. Bread. Meat. Ale. Real food. The men eat. Greedily. Desperately. The hunger fades. The morale lifts. You've made it. Endured. Survived.</p>
                   <p>But the waiting took something from you. The hunger. The uncertainty. The fear. It wears you down. Makes you weaker. Less sure. But you're alive. You're fed. That's enough. For now.</p>`;
        },
        choices: [
            {
                text: "Continue",
                effects: {},
                nextScene: "march_through_normandy_1"
            }
        ]
    },
    
    gambling_outcome: {
        title: "The Wager",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/campfire.jpg",
        artworkCaption: "Dice and desperation - gambling for food",
        text: function() {
            const result = gameState.lastResolution;
            if (!result) return `<p>You find a game. Men betting rations...</p>`;
            if (result.success) {
                return `<p>The dice roll. You watch. Wait. Hope. The numbers come up. In your favor. You've won. The rations are yours. The other man hands them over. Reluctantly. But fairly. You've won them. Fair and square.</p>
                       <p>You eat. The food tastes better. Because you won it. Because you earned it. Through luck. Through chance. Through the roll of the dice. It's not much. But it's yours. You've fed yourself. When others couldn't. When the army couldn't. You've survived. Through luck. Through skill. Through whatever it takes.</p>`;
            } else {
                return `<p>The dice roll. You watch. Wait. Hope. The numbers come up. Against you. You've lost. The rations are gone. Your coin is gone. You've lost everything. And gained nothing. The other man takes it. Smiles. You've been beaten. Outplayed. Outlucked.</p>
                       <p>You're still hungry. Still empty. But now you're poorer. You've lost coin. Lost rations. Lost everything. The gamble didn't pay off. It rarely does. You should have known. Should have been smarter. But you weren't. And now you pay the price.</p>`;
            }
        },
        onEnter: function() {
            const result = gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('morale', 1);
                applyStatChange('wealth', 2);
            } else if (result) {
                applyStatChange('morale', -1);
                applyStatChange('stress', 1);
            }
        },
        choices: [
            {
                text: "Return to camp",
                effects: {},
                nextScene: "march_through_normandy_1"
            }
        ]
    },
    
    river_crossing: {
        title: "The Swollen River",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/bridgerain.png",
        artworkCaption: "The swollen river - a dangerous crossing",
        text: function() {
            return `<p>The river ran fast. Brown water churning. It had rained for three days. Upstream somewhere. Now the river was high. Angry. The ford that should have been passable was gone. Drowned beneath six feet of rushing water. The column halted at the bank. Men looked at the water. At each other. No one wanted to be first.</p>
                   
                   <p>The current was strong. You could see it in the way debris moved. Whole trees torn from somewhere upstream. Tumbling past. Branches breaking. Roots exposed like grasping hands. A dead cow floated by. Bloated. Revolving slowly. Its legs stuck out stiff. The smell reached you even over the water. Sweet. Rotten. Wrong.</p>
                   
                   <p>The captain called for volunteers. Men to test the crossing. To find the old ford beneath the flood. A few stepped forward. Brave or foolish. Maybe both. They stripped their mail. Their weapons. Anything heavy. They waded in. The water rose to their waists. Their chests. They struggled against the current. Feeling with their feet for the solid ground that should be there.</p>
                   
                   <p>One of them went under. Just like that. His foot found a hole. Or the current took him. He disappeared. Came up twenty yards downstream. Thrashing. The others tried to reach him but the current was too strong. He went under again. This time he didn't come back up. The men at the bank watched. Silent. Another one gone. The river had taken its price.</p>
                   
                   <p>The remaining volunteers came back. Shaking. Cold. They'd found the ford. Barely. It was there but treacherous. The water deep. The current strong. Crossing would be dangerous. But staying meant delay. And delay meant the French might catch up. The captain made his decision. We cross, he said. Now. While we still can.</p>`;
        },
        choices: [
            {
                text: "Cross with the first group—get it over with",
                effects: { initiative: 1, stress: 1 },
                requiresResolution: true,
                resolutionStat: "strength",
                resolutionDifficulty: 7,
                nextScene: "successful_crossing"
            },
            {
                text: "Wait for others to go first—learn from them",
                effects: { wits: 1 },
                nextScene: "safer_crossing"
            },
            {
                text: "Help rope the crossing to make it safer",
                effects: { reputation: 2, endurance: -1 },
                nextScene: "organized_crossing"
            },
            {
                text: "Look for another crossing point",
                effects: { initiative: -1 },
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 8,
                nextScene: "alternate_ford"
            }
        ]
    },
    
    successful_crossing: {
        title: "Across the River",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/bridgerain.png",
        artworkCaption: "The river behind you - cold and wet but alive",
        text: function() {
            const result = gameState.lastResolution;
            if (!result) return `<p>You step into the water...</p>`;
            if (result.success) {
                return `<p>The water is cold. Colder than you expected. It seeps through your clothes. Through your mail. The weight doubles. Triples. But you push forward. One step. Then another. Your feet find the ford. The solid ground beneath the flood. You move carefully. Deliberately. The current pulls at you. Tries to take you. But you're strong. You've done this before. Or something like it.</p>
                       <p>You reach the far bank. Your legs shake. From the cold. From the effort. From the fear that's only now leaving you. You look back. Others are crossing. Some struggle. Some make it. Some don't. But you did. You're across. The river is behind you. Ahead is the march. The war. Everything that comes next.</p>`;
            } else {
                return `<p>You step into the water. The current is stronger than you thought. Much stronger. Your foot slips. The river takes you. You go under. Cold. Dark. Panic. You fight. Thrash. Come up gasping. Someone grabs you. Hauls you back. You're on the bank. Shaking. Soaked. Alive. Barely.</p>
                       <p>You'll try again. When you're ready. When the fear has passed. But for now, you're here. On this side. With the others who couldn't make it. The river won. This time.</p>`;
            }
        },
        onEnter: function() {
            const result = gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('endurance', 1);
                applyStatChange('stress', -1);
            } else if (result) {
                applyStatChange('stress', 2);
                if (hasCondition('Fatigued')) {
                    // Already fatigued, no change
                } else {
                    addCondition('Fatigued', 'negative', 1);
                }
            }
        },
        choices: [
            {
                text: "Continue the march",
                effects: {},
                nextScene: "march_through_normandy_1"
            }
        ]
    },
    
    safer_crossing: {
        title: "Learning from Others",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/bridgerain.png",
        artworkCaption: "Watching others cross - learning the way",
        text: function() {
            return `<p>You wait. Watch. The first group goes. You see where they struggle. Where the current is strongest. Where the ford dips. Where it rises. You mark it in your mind. The safe path. The dangerous spots. Knowledge. That's what waiting gives you.</p>
                   <p>When it's your turn, you know where to step. Where to avoid. The crossing is still hard. The water still cold. The current still pulls. But you're prepared. You've seen it. You know what to expect. That makes all the difference.</p>
                   <p>You reach the far bank. Wet. Cold. But safe. You look back. Others are still crossing. Some will make it. Some won't. But you did. Because you waited. Because you learned. Because you were smart enough not to be first.</p>`;
        },
        choices: [
            {
                text: "Continue the march",
                effects: {},
                nextScene: "march_through_normandy_1"
            }
        ]
    },
    
    organized_crossing: {
        title: "Roping the Crossing",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/bridgerain.png",
        artworkCaption: "A rope across the river - making it safer for all",
        text: function() {
            return `<p>You find rope. Old. Worn. But strong enough. You tie one end to a tree on this bank. Strip your gear. Wade into the water. The current pulls. But you hold the rope. Use it to guide you. To steady you. You reach the far side. Tie the other end. Secure it. The rope stretches across. A lifeline. A guide. Something to hold onto.</p>
                   <p>Others see it. Use it. The crossing becomes easier. Safer. Not safe. Never safe. But better. Men grab the rope. Pull themselves across. Some still slip. Still struggle. But fewer. The rope helps. Your rope. Your idea. Your work.</p>
                   <p>You see the gratitude in their eyes. The relief. You've made a difference. Small. But real. The captain nods. Good work, he says. Simple words. But they mean something. You've earned respect. Not through killing. Through helping. Through thinking. Through doing what needed doing.</p>`;
        },
        choices: [
            {
                text: "Continue the march",
                effects: {},
                nextScene: "march_through_normandy_1"
            }
        ]
    },
    
    alternate_ford: {
        title: "Finding Another Way",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/bridgerain.png",
        artworkCaption: "A different path - upstream, looking for another crossing",
        text: function() {
            const result = gameState.lastResolution;
            if (!result) return `<p>You look upstream...</p>`;
            if (result.success) {
                return `<p>You walk upstream. Away from the column. Away from the chaos. You look for another way. Another ford. A fallen tree. Anything. The river curves. Follows the land. You follow it. Looking. Searching. Thinking.</p>
                       <p>There. Up ahead. A narrower point. The water still runs fast. But it's shallower. The ford is clearer. More visible. Less treacherous. You mark it. Remember it. Head back. Report to the captain. He listens. Nods. Sends scouts to verify. They come back. Confirm it. The column shifts. Moves upstream. To your ford. Your discovery.</p>
                       <p>The crossing is easier here. Still dangerous. Still cold. But better. Men make it across. More of them. Fewer lost. You've saved lives. Not through strength. Through wits. Through looking. Through finding what others missed.</p>`;
            } else {
                return `<p>You walk upstream. Looking. Searching. But there's nothing. No better ford. No easier crossing. Just more river. More water. More danger. You waste time. Precious time. The column waits. The French might be coming. Every moment matters.</p>
                       <p>You return. Empty-handed. No better way. No alternative. Just the same dangerous crossing. The same risk. You've gained nothing. Lost time. The captain's eyes show his disappointment. You tried. But trying isn't enough. Not always.</p>`;
            }
        },
        onEnter: function() {
            const result = gameState.lastResolution;
            if (result && result.success) {
                applyStatChange('wits', 1);
                applyStatChange('reputation', 1);
            } else if (result) {
                applyStatChange('stress', 1);
            }
        },
        choices: [
            {
                text: "Return to the crossing",
                effects: {},
                nextScene: "march_through_normandy_1"
            }
        ]
    },
    
    enemy_scouts: {
        title: "Eyes in the Trees",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/standoff.jpg",
        artworkCaption: "Movement in the treeline - French scouts watching",
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>Movement. There. In the treeline. Brief. Gone. But you saw it. Or thought you did. You stopped. Stared at the trees. The shadows between them. Nothing. Maybe you imagined it. The mind playing tricks. Too many days of marching. Too little sleep. But then you saw it again. Definitely something.</p>
                   
                   <p>You called out. Low. Urgent. The men around you stopped. Looked where you pointed. Some saw it. Others didn't. But everyone went quiet. Hands moved to weapons. Eyes scanned the treeline. The column ahead kept moving. Unaware. Or maybe they'd seen nothing. Maybe there was nothing to see.</p>
                   
                   <p>Robin moved up beside you. A tracker from the Welsh marches. His eyes narrowed. Aye, he said. Someone's there. Watching. He counted under his breath. His lips moving. Three at least. Maybe more. French scouts. Has to be. They're tracking the column. Reporting back. His hand was on his bow. Not drawn. Not yet. But ready.</p>
                   
                   <p>The sergeant came back. What's the delay, he demanded. Robin explained. Pointed to the trees. The sergeant looked. Saw nothing. But he believed. He'd been a soldier too long not to trust his men's eyes. Alright, he said. ${name}. Robin. Two others. Go check it out. But quiet. If they're there we want them alive. Information is worth more than bodies.</p>
                   
                   <p>You looked at the trees. At the shadows. Somewhere in there French eyes watched. French ears listened. They knew you were coming. They knew how many. They'd report it all. Unless you stopped them. But stopping them meant going into those trees. Into their ground. Their country. Where they had all the advantages. Your mouth was dry. Fear or anticipation. Maybe both.</p>`;
        },
        choices: [
            {
                text: "Lead the hunt for the scouts",
                effects: { initiative: 2, reputation: 1 },
                requiresResolution: true,
                resolutionStat: "agility",
                resolutionDifficulty: 8,
                nextScene: "scout_pursuit"
            },
            {
                text: "Follow Robin's lead—he's the tracker",
                effects: { wits: 1 },
                nextScene: "robin_tracks"
            },
            {
                text: "Set up an ambush instead",
                effects: { wits: 2 },
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 7,
                nextScene: "counter_ambush"
            },
            {
                text: "Report to captain—let him decide",
                effects: { reputation: -1 },
                nextScene: "captain_orders"
            }
        ]
    },
    
    scorched_earth: {
        title: "The Blackened Land",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/burninglooting.jpg",
        artworkCaption: "The blackened land - what war leaves behind",
        text: function() {
            return `<p>Nothing grew here anymore. The fields were ash. Black stubble where wheat should have been. The trees were burned. Skeletal. Their branches reaching up like prayers to an uncaring sky. This was chevauchée. The English way of war. Destroy everything. Leave nothing for the enemy. Leave nothing for anyone.</p>
                   
                   <p>You marched through the devastation. Your own making. The column had come through three days ago. Burning. Pillaging. Taking what could be carried. Destroying what couldn't. Now you were coming back. Retreating. The French army was behind you. Larger. Better equipped. You were running. Through the wasteland you'd created.</p>
                   
                   <p>Smoke still rose in places. Embers that wouldn't die. The smell was everywhere. Wood smoke. Burned grain. Something else. Sweeter. More terrible. You tried not to think about what it might be. A farmhouse had collapsed. Just a heap of charred timber. A well stood nearby. Its bucket burned to nothing. The rope a blackened strand hanging into darkness.</p>
                   
                   <p>A dog appeared. Ribs showing. Fur singed. It watched the column pass. Hoping for scraps. Knowing it would get none. This was what you'd done. What war did. It took the green land and made it black. It took the living places and made them dead. And then it moved on. Looking for new places to destroy.</p>
                   
                   <p>Thomas walked beside you. His face was grim. We did this, he said. It wasn't a question. You said nothing. What was there to say. The evidence was all around. Miles of it. Stretching back to the coast. A trail of destruction. Your trail. The column kept moving. Through the ashes. Through the silence. Through the proof of what men could do when war gave them license.</p>`;
        },
        choices: [
            {
                text: "Feel the weight of what you've done",
                effects: { stress: 2, wits: 1 },
                nextScene: "moral_reckoning"
            },
            {
                text: "This is war—don't dwell on it",
                effects: { stress: -1, morale: 1 },
                nextScene: "soldier_on"
            },
            {
                text: "Remember this—it matters",
                effects: { wits: 2, morale: -1 },
                nextScene: "memory_burden"
            }
        ]
    },
    
    french_cavalry_spotted: {
        title: "Horsemen on the Ridge",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            return `<p>They appeared on the ridgeline. Silhouettes against the sky. Mounted men. Twenty. Maybe more. Too far to see their faces but close enough to know what they were. French cavalry. Watching. Counting. Deciding whether to attack or report. Either way you were in trouble.</p>
                   
                   <p>The column stopped. No order needed. Men just halted. Looked up. At the riders on the ridge. Everyone calculating. Could we reach the trees. Could we form up in time. Could we fight them off if they charged. The answers weren't encouraging. The ground was open. The nearest cover half a mile. The horsemen had every advantage.</p>
                   
                   <p>One of them rode forward. Just a few paces. Looking down at the column. You could see his armor now. Mail haubergeon. Painted shield. The trappings of a minor noble. Maybe a knight. He raised his hand. Whether in greeting or warning you couldn't tell. Then he turned his horse. Rode back to the others. They conferred. Heads together. Pointing. Gesturing.</p>
                   
                   <p>Your sergeant was shouting orders. Form up. Pikes forward. Archers ready. The column contracted. Becoming a defensive formation. Bristling with spears. Bows drawn. But it was ragged. Hasty. You'd been marching. Not expecting battle. The formation had gaps. Weaknesses. The French would see them. If they charged they'd find them.</p>
                   
                   <p>The riders remained on the ridge. Watching. The tension stretched. Seconds became minutes. Your hands were sweating on your weapon. Your breath came quick. Shallow. This was the moment before. The calm before violence. It could break either way. Attack or withdrawal. Life or death. You waited. The whole column waited. And the horsemen just watched.</p>`;
        },
        choices: [
            {
                text: "Take position in the spear wall",
                effects: { endurance: 1 },
                nextScene: "cavalry_decision"
            },
            {
                text: "Ready your bow—try for a long shot",
                effects: { initiative: 1 },
                requiresResolution: true,
                resolutionStat: "agility",
                resolutionDifficulty: 9,
                nextScene: "arrow_flight"
            },
            {
                text: "Scout for better defensive ground",
                effects: { wits: 1 },
                nextScene: "defensive_position"
            },
            {
                text: "Stand ready—watch what they do",
                effects: { morale: 1 },
                nextScene: "cavalry_decision"
            }
        ]
    },
    
    rainstorm_march: {
        title: "Rain Like God's Anger",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            return `<p>Rain. Not the gentle kind. The kind that punished. That beat down like fists. It came with no warning. The sky had been gray all morning. Then the clouds opened. The world turned to water. Within moments you were soaked. Your clothes heavy. Your mail streaming. Water running down your neck. Down your back. Into your boots.</p>
                   
                   <p>The road became a river. Mud and water mixing. Flowing downhill. Taking everything with it. Your feet slipped. Each step uncertain. You fell twice in the first hour. Came up covered in mud. The rain kept falling. No sign of stopping. This could go on for days. You'd seen it before. French weather. Brutal. Uncaring.</p>
                   
                   <p>Visibility dropped. You could barely see ten yards ahead. The men in front were ghosts in the rain. Gray shapes moving through gray water under gray sky. The whole world reduced to shades of nothing. Sound was different too. The rain so loud it drowned everything. Voices. Orders. The creak of carts. All of it lost in the downpour.</p>
                   
                   <p>Someone went down hard. You heard the cry. Saw men gather. A broken ankle. Maybe worse. They tried to help him up. He screamed. The sound thin in the rain. They fashioned a litter. Two spears. A cloak. Laid him on it. Carried him. But he was just one. Others were falling. Sick. Exhausted. Injured. The rain was winning. Beating the column down. Mile by miserable mile.</p>
                   
                   <p>You kept walking. What else could you do. Stopping meant dying. Out here. In the rain. You kept moving. One foot in front of the other. The water streaming down. The mud sucking at your boots. Your body aching. Your mind numb. This was endurance. This was what it meant to be a soldier. Not the glory. Not the plunder. This. The rain. The mud. The endless walking.</p>`;
        },
        choices: [
            {
                text: "Push through—it's just rain",
                effects: { endurance: 2, stress: 1 },
                nextScene: "rain_continues"
            },
            {
                text: "Help carry the wounded",
                effects: { reputation: 2, endurance: -1 },
                nextScene: "burden_shared"
            },
            {
                text: "Look for shelter—even brief respite helps",
                effects: { wits: 1 },
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 7,
                nextScene: "brief_shelter"
            }
        ]
    },
    
    abandoned_camp: {
        title: "The French Camp",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>The French had left in a hurry. You could tell. Tents still standing. Fires still smoldering. Food half-eaten. They'd heard you coming. Fled before contact. Smart. Or cowardly. Depended how you looked at it. Either way they'd left things behind. Things you could use.</p>
                   
                   <p>The column spread through the camp. Men calling out their finds. Bread here. Wine there. A good sword. Decent mail. Some coins. The plunder was modest but welcome. Every scrap helped. Every coin counted. You moved between the tents. Looking. The ground was churned. Dozens of feet. Maybe a hundred men had been here. Not long ago. Hours maybe.</p>
                   
                   <p>One tent was larger than the rest. An officer's tent. You pushed inside. It was dim. Smelled of wine and sweat. A cot. A table. Maps spread across it. Papers. Seals. You couldn't read French but the maps made sense. Lines. Positions. Troop strengths marked in symbols. This was valuable. This was the kind of thing the captain would want to see.</p>
                   
                   <p>Something moved in the corner. You spun. Hand to sword. A man sat there. French. Young. His leg was bandaged. Blood soaking through. He raised his hands. Empty. Trembling. His eyes were wide. Terrified. The others left me, he said. In French. You caught enough to understand. Left me because I slowed them down. He looked at your sword. At your face. Waiting to see what you'd do.</p>
                   
                   <p>Outside men were laughing. Celebrating the easy plunder. Inside this tent there was just you and this wounded French soldier. This boy really. Couldn't be more than sixteen. He'd been left behind. Abandoned by his own side. Now his fate was in your hands. You could kill him. Take him prisoner. Let him go. Each choice meant something. About you. About what kind of man you were becoming.</p>`;
        },
        choices: [
            {
                text: "Take him prisoner—he's worth ransom",
                effects: { wealth: 3, reputation: 1 },
                nextScene: "prisoner_march"
            },
            {
                text: "Spare him—let him go",
                effects: { morale: 1, reputation: 1 },
                nextScene: "mercy_shown"
            },
            {
                text: "Question him about French movements",
                effects: { wits: 2 },
                requiresResolution: true,
                resolutionStat: "charisma",
                resolutionDifficulty: 6,
                nextScene: "intelligence_gathered"
            },
            {
                text: "Take the maps and leave him—not your problem",
                effects: { wits: 1 },
                nextScene: "maps_retrieved"
            }
        ]
    },
    
    dead_horse: {
        title: "The Warhorse",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            return `<p>The horse lay in the road. A destrier. Massive. Beautiful even in death. It had been a warhorse once. Trained for battle. Worth more than ten men. Now it was carrion. Flies already gathering. The smell just beginning. Fresh death. A few hours old at most.</p>
                   
                   <p>Its throat was cut. Clean. Efficient. Someone had done this deliberately. Not an accident. Not a wound from battle. Murder. You looked at the ground around it. Tracks. Boot prints. Someone had led it here. Killed it. Left it. But why. Why kill a valuable horse and leave it in the road. The answer came quickly. A message. A warning. The French were close. Watching. They wanted you to know.</p>
                   
                   <p>The saddle was gone. The bridle. Anything of value stripped away. But the horse itself remained. Too large to move. Too valuable to have been abandoned unless necessary. Whoever owned this animal had loved it. Trained it. Ridden it into battle. Now it was dead in a French road. One more casualty of a war that killed everything it touched.</p>
                   
                   <p>Men gathered around. Looking. Some crossed themselves. A warhorse was a noble beast. Killing it seemed wrong somehow. Worse than killing men. The horse hadn't chosen war. Hadn't chosen sides. It had only served. And this was its reward. Death in a foreign land. Food for flies and crows.</p>
                   
                   <p>The column would have to go around. The road was blocked. That meant delay. Meant extra time in enemy territory. Meant more danger. You looked at the dead horse. At its empty eyes. At the blood pooling beneath its throat. Someone had known. Known what this would cost you. Done it anyway. The war was getting meaner. More personal. You could feel it.</p>`;
        },
        choices: [
            {
                text: "Move it off the road—show respect",
                effects: { endurance: -1, morale: 1 },
                nextScene: "respect_shown"
            },
            {
                text: "Just go around—it's only a horse",
                effects: { stress: -1 },
                nextScene: "march_continues"
            },
            {
                text: "Examine the area—look for whoever did this",
                effects: { wits: 1 },
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 7,
                nextScene: "tracks_found"
            }
        ]
    },
    
    forest_ambush_avoided: {
        title: "The Dark Woods",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            return `<p>The forest closed in. Trees pressing close to the road. Old growth. Dense. The canopy blocked the sun. Made everything twilight. Shadow. The kind of place where anything could hide. Where anyone could wait. Your hand stayed near your sword. Not gripping it. Not yet. But ready.</p>
                   
                   <p>Birds had gone quiet. That was the first sign. The forest should be full of sound. Birdsong. Animals moving through brush. But there was nothing. Just silence. The kind of silence that meant predators. Men were predators. The worst kind. They could be anywhere. Behind any tree. In any shadow.</p>
                   
                   <p>The column tightened. Men moving closer together. Weapons loose in their sheaths. Everyone felt it. The wrongness. The watching. Eyes on you from the forest. Counting. Measuring. Deciding. Whether to attack. Whether to let you pass. Whether today was the day they'd try their luck against armed men.</p>
                   
                   <p>Something glinted in the trees. Sunlight on metal. There and gone. But you'd seen it. Others too. The sergeant called a halt. His voice low. Everyone quiet. Listen, he said. You listened. For a long moment nothing. Then you heard it. The creak of a bow being drawn. The whisper of men moving through undergrowth. Not one. Many. You were surrounded. Or about to be.</p>
                   
                   <p>The captain made his decision fast. He'd been a soldier long enough to know. Fighting in the forest favored the ambushers. Better to show strength. Move fast. Give no opening. Column forward, he called. Double pace. Archers to the flanks. Anyone attacks we don't stop. We go through them. The column surged forward. Moving fast. Daring the watchers to try something. They didn't. Cowards or smart. Didn't matter. You made it through.</p>`;
        },
        choices: [
            {
                text: "Keep watch on the flanks—stay alert",
                effects: { wits: 1, initiative: 1 },
                nextScene: "forest_exit"
            },
            {
                text: "Focus on moving fast—get out quickly",
                effects: { endurance: 1 },
                nextScene: "forest_exit"
            },
            {
                text: "Watch for an ambush site—where would you attack from",
                effects: { wits: 2 },
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 7,
                nextScene: "tactical_insight"
            }
        ]
    },
    
    village_ruins: {
        title: "The Empty Houses",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: "Gascony",
        text: function() {
            return `<p>The village lay empty. Low stone houses. Thatched roofs sagging. Some already collapsed. The doors hung open. Gaping mouths revealing darkness within. No smoke rose from hearths. No children played in the streets. No animals in the fields. The silence was profound. Broken only by wind. The harsh calling of crows.</p>
                   
                   <p>Signs of hasty departure everywhere. A cooking pot by a doorway. Its contents long spoiled. A child's wooden toy. Half-buried in mud. What was once a street. A door torn from hinges. Wood splintered. Broken. The gardens overgrown. Weeds choking what crops remained. The fields beyond showed stubble. A harvest never completed. Life interrupted. Abandoned to decay.</p>
                   
                   <p>In the center stood a well. Stone rim weathered. Cracked. The bucket still attached to its rope. Hanging motionless in darkness below. A few chickens pecked at dirt. The only living things. They scattered as you approached. Their clucking the only sound of life in this dead place. The smell of decay was faint. Present. Something died here. Recently enough that the scent remained. Rot. Things left to spoil.</p>
                   
                   <p>Your commander rode up. His horse's hooves loud in the silence. He surveyed the village. Practiced eye. Expression grim. Empty, he said. Not a question. They knew we were coming. He dismounted. Boots sinking into mud. Quick search, he called. Take what's useful. Food. Tools. Anything. But be quick. We're not staying.</p>
                   
                   <p>The men spread out. Moving cautiously. Some to houses. Weapons drawn. Others checking outbuildings. Fields beyond. You heard them calling. Voices echoing in empty spaces. Doors forced. Things moved. Examined. But there was tension. A sense that this place was wrong. That something bad happened here. Everyone felt it. This is what war does. Empties places. Leaves them hollow. Moves on to the next village. The next town. The next life to disrupt or destroy.</p>`;
        },
        choices: [
            {
                text: "Search the houses for supplies",
                effects: { wealth: 1 },
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 5,
                nextScene: "village_search"
            },
            {
                text: "Investigate the well—something might be in it",
                requiresResolution: true,
                resolutionStat: "endurance",
                resolutionDifficulty: 7,
                effects: { stress: 1 },
                nextScene: "well_discovery"
            },
            {
                text: "Stay with the column—this place feels wrong",
                effects: { wits: 1 },
                nextScene: "march_continues"
            },
            {
                text: "Check the church—they might have left offerings",
                effects: { wealth: 2, reputation: -1 },
                nextScene: "church_plunder"
            }
        ]
    },
    
    winter_march: {
        title: "The Frost Road",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/march.jpg",
        artworkCaption: "The frost road - cold that settles into bones",
        text: function() {
            const eq = gameState.equipment || {};
            const hasCloak = eq.cloak || (gameState.inventory && gameState.inventory.some && gameState.inventory.some(function(i) { return i && (i.id === 'cloak' || i.name === 'cloak'); }));
            const hasBoots = eq.wool_hose || eq.boots || (gameState.inventory && gameState.inventory.some && gameState.inventory.some(function(i) { return i && (i.id === 'wool_hose' || i.id === 'boots'); }));

            let gearNote = '';
            if (hasCloak && hasBoots) {
                gearNote = `<p>Thank God for your cloak and good boots. The wool holds what warmth there is. Your feet, at least, have feeling. You are better off than most.</p>`;
            } else if (hasCloak) {
                gearNote = `<p>Your cloak does its work — traps what warmth your body can make. But your feet are numb in their wrappings. No boots good enough for this.</p>`;
            } else if (hasBoots) {
                gearNote = `<p>Your boots keep the worst of the cold from your feet. But without a proper cloak, the wind cuts through you like a blade.</p>`;
            } else {
                gearNote = `<p>You have nothing against this cold. No proper cloak. No decent boots. Just what you stand in and whatever prayers God still listens to.</p>`;
            }

            return `<p>Cold. Not the kind you could fight with movement. The kind that settled into your bones. Made them ache. The frost had come in the night. Now everything was white. Crystalline. Beautiful and deadly. Your breath came in clouds. Each exhale a visible thing. Floating. Dissipating. Gone.</p>
                   
                   <p>The road was ice. Treacherous. Men slipped. Fell. Got up cursing. Fell again. The horses fared worse. Their hooves couldn't grip. Several had already gone lame. Left behind. Their riders walking now. Carrying what they could. The frost didn't care. It just kept biting. Finding every gap in your clothing. Every weakness in your defenses.</p>
                   ${gearNote}
                   <p>Your hands were numb. Even through gloves. Mittens of wool. Useless against this cold. You flexed your fingers. Trying to keep blood moving. Feeling nothing. That scared you. Couldn't fight if you couldn't feel your sword. Couldn't defend yourself. The cold was an enemy more dangerous than the French. You couldn't negotiate with it. Couldn't run from it. Could only endure.</p>
                   
                   <p>Someone fell and didn't get up. Men rushed to him. Shook him. Called his name. Nothing. He was breathing. But barely. His lips were blue. His skin pale. Frostbite. Exposure. Death by degrees. They carried him to a cart. Wrapped him in what blankets remained. He might live. He might not. The cold would decide. Not you. Not medicine. Just the cold and whether his body could fight it.</p>
                   
                   <p>The column kept moving. Had to. Stopping meant freezing. Meant dying. So you walked. Numb. Aching. Miserable. But alive. For now. The frost glittered around you. Beautiful. Pitiless. Caring nothing for your struggle. This was winter in France. This was war in the cold months. This was what it meant to serve. Not glory. Not honor. This. The frost. The numbness. The endless walking toward some destination that might not even matter.</p>`;
        },
        onEnter: function() {
            // Equipment protects you — or its absence hurts
            const eq = gameState.equipment || {};
            const hasCloak = eq.cloak || (gameState.inventory && gameState.inventory.some && gameState.inventory.some(function(i) { return i && (i.id === 'cloak' || i.name === 'cloak'); }));
            const hasBoots = eq.wool_hose || eq.boots || (gameState.inventory && gameState.inventory.some && gameState.inventory.some(function(i) { return i && (i.id === 'wool_hose' || i.id === 'boots'); }));
            if (!hasCloak && !hasBoots) {
                applyStatChange('endurance', -1, {silent: true});
                if (Math.random() < 0.3) addCondition('Frostbitten', 'negative', 2);
            } else if (hasCloak && hasBoots) {
                applyStatChange('stress', -1, {silent: true});
            }
        },
        choices: [
            {
                text: "Keep moving—don't stop for anything",
                effects: { endurance: 2, stress: 1 },
                nextScene: "frost_survival"
            },
            {
                text: "Help the frozen man—share your warmth",
                effects: { reputation: 2, endurance: -1 },
                nextScene: "compassion_shown"
            },
            {
                text: "Look for shelter—even a brief respite helps",
                effects: { wits: 1 },
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 8,
                nextScene: "shelter_found"
            },
            {
                text: "Burn something for heat—anything",
                effects: { wealth: -1, morale: 1 },
                nextScene: "desperate_warmth"
            }
        ]
    },
    
    camp_dice_game: {
        title: "A Game of Hazard",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/campfire.jpg",
        artworkCaption: "Evening around the fire - dice and ale and forgetting",
        text: function() {
            const name = gameState.characterName || "Soldier";
            const wealth = gameState.stats.wealth || 0;
            return `<p>Evening settled. Chill came with it. Around a small fire men huddled over a game of hazard. Faces lit by flames. Dice clattered. Wooden board. Crude markings. Coins changed hands. Metal on metal. The air thick with pipe smoke. Sweet. Earthy. Acrid scent of burning wood. Smell of ale. Fresh and spilled.</p>
                   
                   <p>Veterans with scars. Younger men learning the trade. All drawn together. The need to pass time. To forget. If only for a moment. What tomorrow might bring. Voices were low. Curses. Laughs. Eyes fixed on dice. Tumbling across the board. The game was simple. Roll. Bet. Win or lose. But stakes felt higher. As if each roll carried the weight of fate.</p>
                   
                   <p>Thomas looked up. A bowman from Kent. Ready smile. Quick hands. He grinned. Face flushed. From the fire. From the ale. From excitement. Eyes had that bright focused look. The look that comes with gambling. ${name}, he called. Come join us. The French haven't killed us yet. But this game might finish the job.</p>
                   
                   <p>Other men looked up. Expressions ranged from welcoming to calculating. A big man. Broken nose. Thick beard. He grunted. Shifted to make room. Aye come sit, he said. We could use fresh blood. There was something in his tone. He meant it. Fresh money. Fresh luck. Fresh opportunity to take what you have.</p>
                   
                   <p>You checked your purse. Felt the weight of coins. ${wealth} shillings. Hard-won. From plunder. From pay. The thought of risking it made your stomach tighten. But men were betting heavily. Pot grew with each roll. Silver coins gleaming in firelight. A small fortune. If you were lucky enough to win it.</p>
                   
                   <p>Dice clattered again. Someone groaned. Another laughed. Coins pushed across the board. Game continued. Thomas watched you. Expression expectant. Question in his eyes. Will you join. Or walk away. Fire crackled. Sparks into night sky. In the distance sounds of camp. Horses. Men talking. Noise of an army at rest. But here around this small fire the world had narrowed. To the roll of dice. To the turn of fortune.</p>`;
        },
        choices: [
            {
                text: "Join the game (bet 2 shillings)",
                effects: { wealth: -2, morale: 1 },
                requiresResolution: true,
                resolutionStat: "luck",
                resolutionDifficulty: 6,
                nextScene: function() {
                    if (Math.random() * 10 + gameState.stats.luck >= 6) {
                        applyStatChange('wealth', 4);
                        return "dice_game_win";
                    }
                    return "dice_game_lose";
                }
            },
            {
                text: "Watch but don't play",
                effects: { morale: 1 },
                nextScene: "camp_rest"
            },
            {
                text: "Leave—gambling is a fool's game",
                effects: { wits: 1 },
                nextScene: "camp_rest"
            },
            {
                text: "Try to cheat (risky)",
                effects: { wealth: 3, reputation: -2 },
                requiresResolution: true,
                resolutionStat: "agility",
                resolutionDifficulty: 9,
                nextScene: "caught_cheating"
            }
        ]
    },
    
    weapon_maintenance: {
        title: "Steel and Stone",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/blacksmith.png",
        artworkCaption: "The whetstone and the blade - maintaining the tools of war",
        text: function() {
            return `<p>Your sword was dull. Nicked. The edge that had been sharp three battles ago was now blunt. Useless against mail. Maybe useless against leather. You needed to fix it. Needed to sharpen it. Your life depended on your blade. A dull sword was a death sentence.</p>
                   
                   <p>You sat by your tent. Whetstone in hand. The stone was worn. Smooth. You'd used it a hundred times. A thousand. The motion was familiar. Comforting almost. Pull the blade across the stone. Listen to the sound. Feel the edge coming back. It was meditation. This simple act. This maintenance of the tool that kept you alive.</p>
                   
                   <p>Others were doing the same. All around camp. Men tending their weapons. Sharpening swords. Repairing mail. Checking straps on shields. This was the warrior's work. Not the glorious part. Not the part the minstrels sang about. But the real part. The necessary part. Steel required care. Required attention. Neglect it and it would fail you when you needed it most.</p>
                   
                   <p>Old Geoffrey sat nearby. Working on his spear. The shaft was cracked. He was binding it. Leather strips. Careful. Methodical. His hands were gnarled. Scarred. Decades of this work. He looked up. Caught you watching. A sword is like a woman, he said. Needs constant attention or it'll turn on you. He laughed. The others joined in. Crude humor. But there was truth in it. Everything needed care. Everything needed work.</p>
                   
                   <p>The scrape of stone on steel was soothing. Repetitive. Your mind wandered as your hands worked. Thinking about home. About what you'd left behind. About what you'd become. A killer. That's what a sharp sword made you. A more efficient killer. But that was the job. That was what you'd signed up for. So you kept sharpening. Kept working. Kept preparing for the next time you'd need to use this blade to take a life.</p>`;
        },
        choices: [
            {
                text: "Take your time—do it right",
                effects: { initiative: 1, morale: 1 },
                nextScene: "well_maintained"
            },
            {
                text: "Rush it—good enough",
                effects: { stress: -1 },
                nextScene: "adequate_edge"
            },
            {
                text: "Ask Geoffrey for advice",
                effects: { wits: 1, reputation: 1 },
                nextScene: "veterans_wisdom"
            },
            {
                text: "Offer to help others with their gear",
                effects: { reputation: 2, endurance: -1 },
                nextScene: "companionship_forged"
            }
        ]
    },
    
    night_watch: {
        title: "The Third Watch",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/campfire.jpg",
        artworkCaption: "The third watch - darkness and vigilance",
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>The third watch. The worst watch. The hours before dawn. When the world was darkest. When men were most vulnerable. When sleep pulled at you like a physical weight. But you had to stay awake. Had to stay alert. The camp depended on it. Lives depended on it.</p>
                   
                   <p>You walked the perimeter. Slow circuit. Eyes scanning the darkness beyond the firelight. Looking for movement. For shapes that didn't belong. For anything that might be a threat. The night was alive with sounds. Animals. Wind. The creak of trees. Your job was to know which sounds mattered. Which ones meant danger.</p>
                   
                   <p>Behind you the camp slept. Men wrapped in blankets. Snoring. Muttering in dreams. A few cried out. Nightmares. The war followed them even into sleep. You envied them. At least they got to rest. Got to escape for a few hours. You had to stay here. In the cold. In the dark. Watching. Always watching.</p>
                   
                   <p>Something moved. Out there. Beyond the light. You froze. Hand to sword. Staring into darkness. Trying to see. To identify. Was it a man. An animal. Your imagination. The darkness played tricks. Made shapes where there were none. Made threats out of shadows. You waited. Breathing shallow. Heart pounding. Ready.</p>
                   
                   <p>A deer stepped into view. Just a deer. Looking for food. It saw you. Froze. Then bounded away. Disappeared into the night. You released your breath. Relaxed your grip on your sword. False alarm. But you'd done your job. Stayed alert. Stayed ready. That was all you could do. Watch. Wait. Hope that when the real threat came you'd see it in time. That your vigilance would be enough.</p>`;
        },
        choices: [
            {
                text: "Stay focused—this is important",
                effects: { wits: 1, stress: 1 },
                nextScene: "watch_ends"
            },
            {
                text: "Try to stay warm—build up the fire",
                effects: { endurance: 1 },
                nextScene: "warmth_found"
            },
            {
                text: "Wake your relief early—you need sleep",
                effects: { stress: -1, reputation: -1 },
                nextScene: "early_relief"
            },
            {
                text: "Scout beyond the perimeter",
                effects: { initiative: 1 },
                requiresResolution: true,
                resolutionStat: "agility",
                resolutionDifficulty: 7,
                nextScene: "patrol_findings"
            }
        ]
    },
    
    camp_argument: {
        title: "Words and Steel",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>Voices raised. Angry. You looked up from your meal. Two men squared off. John from Cornwall. Big man. Mean drunk. And Peter. Younger. From somewhere in the Midlands. They were shouting. Something about dice. About cheating. The usual camp nonsense. But it was escalating. Fast.</p>
                   
                   <p>John shoved Peter. Peter stumbled back. His hand went to his knife. The crowd around them shifted. Some moved away. Others moved closer. Eager. Hoping for violence. Anything to break the boredom. To provide entertainment. Men were gathering. Forming a circle. This was going to happen. Unless someone stopped it.</p>
                   
                   <p>You were a blow from home lad, John snarled. Shouldn't play games you don't understand. His fists were clenched. Face red. Drunk or angry or both. Peter was white. Frightened but trying not to show it. He kept his hand on his knife. I saw you palm that die, he said. His voice shook. Everyone saw it. You're the cheat. Not me.</p>
                   
                   <p>The accusation hung in the air. Cheating at dice was serious. Could get you beaten. Could get you killed. John's face went darker. You calling me a liar, he said. It wasn't a question. He took a step forward. Peter backed up. The knife was out now. Glinting in the firelight. The crowd pressed closer. Some calling for blood. Others just watching. Waiting to see what would happen.</p>
                   
                   <p>The sergeant wasn't here. No officers nearby. Just you and the other soldiers. Someone needed to stop this. Or let it play out. Sometimes men needed to settle things. Sometimes intervention made it worse. You had to decide. Fast. Before steel found flesh. Before this turned into something that couldn't be undone.</p>`;
        },
        choices: [
            {
                text: "Step between them—stop this now",
                effects: { reputation: 1, stress: 1 },
                requiresResolution: true,
                resolutionStat: "charisma",
                resolutionDifficulty: 7,
                nextScene: "fight_prevented"
            },
            {
                text: "Let them fight—they're grown men",
                effects: { morale: -1 },
                nextScene: "fight_occurs"
            },
            {
                text: "Fetch the sergeant",
                effects: { reputation: -1 },
                nextScene: "authority_called"
            },
            {
                text: "Side with Peter—John was cheating",
                effects: { reputation: 1 },
                requiresResolution: true,
                resolutionStat: "strength",
                resolutionDifficulty: 8,
                nextScene: "confrontation"
            }
        ]
    },
    
    sick_tent: {
        title: "The Fevered and the Dying",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            return `<p>The sick tent stank. Sweat. Excrement. Rot. The smell hit you before you entered. Made your stomach turn. But you'd been ordered to help. The surgeon was overwhelmed. Too many sick. Too few hands. You pushed through the flap. Into hell.</p>
                   
                   <p>Men lay on pallets. Groaning. Some delirious with fever. Others silent. Too weak to make sound. The surgeon moved between them. Face grim. Doing what little he could. Which wasn't much. Medieval medicine was prayer and guesswork. Bleeding. Herbs. Hope. Most men who entered this tent didn't leave. Not alive anyway.</p>
                   
                   <p>A young man called out. Reached for you. His eyes were bright with fever. His skin burning. Mother, he said. Is that you mother. You weren't his mother. Weren't anyone's mother. But you knelt beside him. Took his hand. It's alright, you said. You're alright. The lies we tell the dying. The comfort we offer when there's no real comfort to give.</p>
                   
                   <p>The surgeon looked over. Saw you with the dying man. He'll be gone by morning, he said. Matter of fact. Clinical. Flux took his guts. Nothing to be done. He moved on. To the next patient. The next hopeless case. The young man squeezed your hand. His grip surprisingly strong. Don't leave, he whispered. Please don't leave me alone.</p>
                   
                   <p>You had a choice. Stay with him. Comfort him in his final hours. Or leave. Go back to the healthy camp. Where the air was clean and death wasn't so immediate. The surgeon had other tasks for you. Other men who might actually be saved. But this one. This boy. He just wanted someone there. When the end came.</p>`;
        },
        choices: [
            {
                text: "Stay with the dying man",
                effects: { morale: 2, stress: 2 },
                nextScene: "vigil_kept"
            },
            {
                text: "Help the surgeon with the living",
                effects: { wits: 1, reputation: 1 },
                nextScene: "medical_work"
            },
            {
                text: "Leave—you can't handle this",
                effects: { stress: -1, morale: -2 },
                nextScene: "tent_fled"
            },
            {
                text: "Pray for all of them",
                effects: { morale: 1 },
                nextScene: "prayers_offered"
            }
        ]
    },
    
    camp_sermon: {
        title: "Words of God",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            return `<p>The chaplain called for service. Sunday. Even in war some things continued. Some rituals maintained. Men gathered. Not everyone. Some stayed away. Too tired. Too cynical. Too angry at God to worship. But enough came. Enough to make a congregation. Enough to pretend that faith still mattered.</p>
                   
                   <p>The chaplain was an old man. Gray beard. Stooped shoulders. He'd been a soldier once. Before he found God. Or before God found him. He understood these men. Knew what they'd seen. What they'd done. His sermons didn't judge. Didn't condemn. Just offered what comfort faith could provide. Which wasn't much but was something.</p>
                   
                   <p>He spoke of the Prodigal Son. The parable. A man who left home. Squandered his inheritance. Lived in sin. Then came back. Begging forgiveness. And his father welcomed him. Killed the fatted calf. Celebrated his return. The chaplain's voice was soft. Gentle. You have all left home, he said. All sinned. But God's mercy is infinite. Return to Him and He will welcome you.</p>
                   
                   <p>Some men wept. Openly. The words touching something deep inside them. The guilt they carried. The things they'd done. In God's name. In the king's name. In no name at all. Others sat stone-faced. Unmoved. Either they'd heard it too many times or they'd stopped believing. Stopped hoping that forgiveness was possible for men like them.</p>
                   
                   <p>The service ended. The chaplain gave his blessing. Made the sign of the cross. Men dispersed. Back to their tents. Their fires. Their lives. You sat a moment longer. Thinking about home. About the person you were before the war. About whether that person still existed. Or if war had killed him. Replaced him with this. This killer. This soldier. This thing you'd become.</p>`;
        },
        choices: [
            {
                text: "Speak with the chaplain afterward",
                effects: { morale: 2, stress: -1 },
                nextScene: "confession"
            },
            {
                text: "Return to camp—actions matter more than words",
                effects: { wits: 1 },
                nextScene: "camp_life"
            },
            {
                text: "Pray alone—between you and God",
                effects: { morale: 1 },
                nextScene: "private_prayer"
            },
            {
                text: "Doubt everything—where was God at Crécy",
                effects: { stress: 1, wits: 1 },
                nextScene: "crisis_faith"
            }
        ]
    },
    
    french_peasant_encounter: {
        title: "A Local's Plea",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: "Normandy",
        artwork: "artwork/standoff.jpg",
        artworkCaption: "The old man approaches - hands raised in supplication",
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>The old man approached slowly. Steps hesitant. As if each one might be his last. He was thin. Gaunt almost. Clothes hung loose. A frame that spoke of hunger. Of hard work. His tunic was patched. Multiple places. Fabric worn thin. Boots were scraps of leather. Bound with twine. Hands were raised. Supplication. The universal gesture of someone who has nothing left but hope. Face was lined. Marks of age. Of worry.</p>
                   
                   <p>He spoke in the Norman dialect. Words tumbling out. Too fast to understand. Accent was thick. Vowels rounded. Different from the English you were used to. Voice was cracked with emotion. He gestured as he spoke. Pointing back the way he came. Toward fields. Village beyond. Movements were desperate. Pleading.</p>
                   
                   <p>Geoffrey stepped forward. A man who'd served in Gascony. Learned enough of the local tongue. He listened. Brow furrowed. Then began to translate. Haltingly. He says the French soldiers came three days ago. Took his son. Press-ganged him. Dragged him away. Boy didn't want to go. But what choice did he have.</p>
                   
                   <p>The old man continued speaking. Voice rising. Geoffrey listened. Nodded. Translated again. His daughter is sick. Fever. Can't get out of bed. Wife died last winter. Now he has no one to tend the fields. Harvest is coming. If he can't bring it in they'll starve. He begs for help. Any help.</p>
                   
                   <p>The old man's eyes were desperate. You could see the fear in them. Not just fear of you. English soldiers in his land. But fear of what will happen. If he can't get help. If he can't bring in harvest. If his daughter doesn't recover. He knows what English soldiers are capable of. What any soldiers are capable of in this war. He's seen the devastation. Burned fields. Empty villages. Bodies by the roadside. But he's come anyway. Because he has no other choice.</p>
                   
                   <p>Around you camp continued. Men tending fires. Checking equipment. Talking. Laughing. But here in this small space there was a moment of stillness. A pause. The old man stood before you. Hands still raised. Eyes fixed on your face. Waiting. Behind him the Norman countryside stretched away. Green and peaceful in the afternoon light. But you knew that peace was an illusion. War had come to this place. Left its mark on everyone it touched.</p>`;
        },
        choices: [
            {
                text: "Give him a few coins from your share of plunder",
                effects: { wealth: -1, reputation: 1, morale: 1 },
                nextScene: "peasant_grateful"
            },
            {
                text: "Question him about French troop movements",
                requiresResolution: true,
                resolutionStat: "charisma",
                resolutionDifficulty: 6,
                effects: { wits: 1 },
                nextScene: "peasant_information"
            },
            {
                text: "Turn him away—you can't help everyone",
                effects: { stress: 1 },
                nextScene: "camp_continues"
            },
            {
                text: "Offer to help find his son (if you have high reputation)",
                requiresResolution: true,
                resolutionStat: "reputation",
                resolutionDifficulty: 8,
                effects: { reputation: 2, stress: 2 },
                nextScene: function() {
                    if (gameState.stats.reputation >= 8) {
                        return "rescue_mission";
                    }
                    return "peasant_disappointed";
                }
            }
        ]
    },
    
    roadside_shrine: {
        title: "The Wayside Cross",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/unnamed.jpg",
        artworkCaption: "The wayside cross at the crossroads - a place of last resort",
        text: function() {
            return `<p>The shrine stood at a crossroads. Stone cross. Weathered by centuries. At its base offerings. Flowers. Wilted. Candles. Burned down to stubs. Small coins. Wooden figures. The devotions of travelers. Of locals. Of people seeking protection. Seeking mercy. Seeking something from God or the saints or whatever power might listen.</p>
                   
                   <p>The cross was old. Pre-Christian some said. A place of power long before Christ. The Church had claimed it. Put their symbol here. But the old power remained. You could feel it. In the way the air moved. In the silence that surrounded this place. As if the world held its breath here. Waiting. Watching.</p>
                   
                   <p>Someone had carved words into the base. Latin. You couldn't read them but you knew what they said. Prayers. Pleas. The desperate words of people at the end of hope. This was a place of last resort. Where you came when there was nowhere else to turn. When human aid had failed. When only divine intervention might help.</p>
                   
                   <p>The column had stopped for water. The crossroads had a well. Men were filling skins. Watering horses. Taking a moment's rest. But no one disturbed the shrine. No one took the offerings. Even the most cynical soldiers left such places alone. Maybe from respect. Maybe from fear. Some things you didn't touch. Some places you didn't defile. Not if you wanted to keep your soul.</p>
                   
                   <p>You stood before the cross. Thinking about what you'd done. What you'd become. The lives taken. The destruction wrought. The sins accumulated. This shrine offered forgiveness. Offered peace. All you had to do was ask. Make an offering. Say the words. But could forgiveness be that simple. Could absolution erase what you'd done. You didn't know. But the cross stood there. Waiting. If you wanted it.</p>`;
        },
        choices: [
            {
                text: "Make an offering—leave a coin",
                effects: { wealth: -1, morale: 2, stress: -1 },
                nextScene: "offering_made"
            },
            {
                text: "Pray silently—between you and God",
                effects: { morale: 1 },
                nextScene: "silent_prayer"
            },
            {
                text: "Move on—prayers won't change anything",
                effects: { stress: 1 },
                nextScene: "march_continues"
            },
            {
                text: "Carve your own plea into the stone",
                effects: { morale: 2, reputation: 1 },
                nextScene: "mark_left"
            }
        ]
    },
    
    french_merchant: {
        title: "The Wine Seller",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/map.jpg",
        artworkCaption: "The merchant's cart at the camp's edge",
        text: function() {
            const wealth = gameState.stats.wealth || 0;
            return `<p>The merchant appeared at the camp's edge. Cart pulled by a tired mule. He was rotund. Well-fed. Unusual in these times of hunger. His clothes were good quality. Wool. Dyed. This was a man who profited from war. Who knew how to survive. How to make coin from misery.</p>
                   
                   <p>He called out. In accented English. Good wine. Best in Gascony. Fair prices for brave soldiers. His smile was wide. Practiced. The smile of a man who'd sold to both sides. Who didn't care which army won. Just that they had coins to spend. War was good for business. His business anyway.</p>
                   
                   <p>Men gathered. Interested. Wine was a rare luxury. Most of the time you drank ale. Or water when there was nothing else. Wine meant celebration. Meant forgetting. Meant a few hours of something other than misery. The merchant knew this. Knew he could charge what he wanted. Supply and demand. He had supply. The soldiers had demand.</p>
                   
                   <p>He pulled back canvas. Revealed his cargo. Casks and bottles. The wine was genuine. You could smell it. Rich. Complex. From vineyards that had been making wine since Roman times. This was the real thing. Not the watered down swill you usually got. But the price. The merchant named it. Twice what it should be. Three times. But men were already reaching for their purses.</p>
                   
                   <p>You had ${wealth} shillings. Enough for a bottle. Maybe two if you haggled. The question was whether it was worth it. Wine wouldn't change anything. Wouldn't end the war. Wouldn't bring you home. But it would make tonight more bearable. Would give you a few hours of not thinking. Not remembering. Not feeling. Sometimes that was worth any price.</p>`;
        },
        choices: [
            {
                text: "Buy wine—you've earned it (2 shillings)",
                effects: { wealth: -2, morale: 2, stress: -1 },
                nextScene: "wine_purchased"
            },
            {
                text: "Try to haggle down the price",
                effects: { wealth: -1, morale: 1 },
                requiresResolution: true,
                resolutionStat: "charisma",
                resolutionDifficulty: 7,
                nextScene: "haggling_success"
            },
            {
                text: "Don't buy—save your coins",
                effects: { wits: 1 },
                nextScene: "coin_saved"
            },
            {
                text: "Threaten him—take it for free",
                effects: { wealth: 2, reputation: -2 },
                requiresResolution: true,
                resolutionStat: "strength",
                resolutionDifficulty: 6,
                nextScene: "merchant_robbed"
            }
        ]
    },
    
    letter_from_home: {
        title: "Word from England",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>The letter arrived with the supply train. Carried by a merchant who knew someone who knew someone. The chain of intermediaries that connected soldiers to home. The parchment was worn. Stained. It had traveled far. Passed through many hands. But it had arrived. That was what mattered.</p>
                   
                   <p>You recognized the hand. Your brother. He'd learned to write from the village priest. Never got good at it but good enough. The words were simple. Direct. Mother is well. The harvest was adequate. Your sister married. A blacksmith from the next village. They're asking when you'll come home.</p>
                   
                   <p>When will you come home. The question sat there on the page. Innocent. Impossible. You didn't know. Didn't know if you'd ever go home. If the war would end. If you'd survive it. If anything would be left of the person who'd left England all those years ago. Or if that person was already dead. Killed by the things you'd done. The things you'd seen.</p>
                   
                   <p>The letter continued. More news. Small things. Village gossip. Who had died. Who had been born. The rhythm of ordinary life. Going on without you. The world turning. People living. Loving. Dying. All of it happening while you were here. In France. Fighting someone else's war. For reasons that seemed less clear every day.</p>
                   
                   <p>You folded the letter. Put it with the others. Three now. Three letters in four years. Not much. But something. Proof that home still existed. That you weren't completely alone. That somewhere people remembered you. Cared whether you lived or died. It was a thin thread. But it was all you had. The only thing connecting you to the life you'd left behind.</p>`;
        },
        choices: [
            {
                text: "Write back—tell them you're well (even if you're not)",
                effects: { morale: 2, wealth: -1 },
                nextScene: "letter_sent"
            },
            {
                text: "Don't write back—what could you say",
                effects: { stress: 2 },
                nextScene: "silence_kept"
            },
            {
                text: "Ask to be sent home—request discharge",
                effects: { morale: -1, reputation: -2 },
                nextScene: "discharge_requested"
            },
            {
                text: "Keep the letter—read it when things get dark",
                effects: { morale: 1 },
                nextScene: "treasure_kept"
            }
        ]
    },
    
    local_church: {
        title: "The Country Church",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/Vigiles_du_roi_Charles_VII_32.jpg",
        artworkCaption: "A small stone church in the French countryside",
        text: function() {
            return `<p>The church was small. Stone. Ancient. It had stood here since before the Normans. Before William. Before England and France were separate things. The walls were thick. Windows narrow. Built to last. Built to endure. Wars. Plague. The passage of time. It had seen it all. Survived it all.</p>
                   
                   <p>Inside was cool. Dark. Light filtered through colored glass. Red. Blue. Gold. Painting the stone floor in shifting patterns. The air smelled of incense. Of candle wax. Of age. This was a holy place. You could feel it. The weight of centuries of prayer. Of devotion. Of people seeking something greater than themselves.</p>
                   
                   <p>The priest was old. Bent with age. He regarded you without fear. Without judgment. Just acceptance. English or French. Christian or heathen. In God's house all were welcome. He gestured to the altar. The votive candles. The collection box. Offering what every priest offered. A chance at redemption. A moment of peace. A respite from the world outside.</p>
                   
                   <p>Your men waited outside. Some had come in. Crossed themselves. Muttered prayers. Then left. Others stayed away. Uncomfortable in such places. Feeling unworthy. Or uncaring. You stood alone now. Looking at the altar. At the carved Christ hanging above it. His face serene. Forgiving. Despite the nails. Despite the crown of thorns. Despite everything.</p>
                   
                   <p>You thought about taking. There were silver candlesticks. Offering plates. Small treasures. The Church was rich. This little church probably had more wealth than the entire village. It would be easy. The priest was old. Couldn't stop you. No one would know. Except you. Except God. If He was watching. If He cared about what one soldier did in one small church in the middle of France.</p>`;
        },
        choices: [
            {
                text: "Make a proper offering",
                effects: { wealth: -1, morale: 2, reputation: 1 },
                nextScene: "blessing_received"
            },
            {
                text: "Pray for the dead—for those you've killed",
                effects: { morale: 1, stress: -1 },
                nextScene: "prayers_dead"
            },
            {
                text: "Leave—you don't belong here",
                effects: { stress: 1 },
                nextScene: "church_departed"
            },
            {
                text: "Take what you can—the Church has enough",
                effects: { wealth: 3, morale: -2, reputation: -2 },
                nextScene: "sacrilege"
            }
        ]
    },
    
    nightmare_memory: {
        title: "Dreams of Blood",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            return `<p>You woke gasping. Heart pounding. The dream still vivid. Still real. His face. The French soldier at Crécy. Young. Terrified. Begging. You couldn't understand the words but you understood the tone. Mercy. He was asking for mercy. You gave him steel instead. Watched his eyes go dim. Watched him fall.</p>
                   
                   <p>That was two years ago. But in dreams it was yesterday. Always yesterday. The memory fresh. The guilt immediate. You'd killed before. Would kill again. But that one stayed with you. Maybe because he reminded you of yourself. Maybe because you'd seen his humanity in that moment. And killed him anyway.</p>
                   
                   <p>Around you other men slept. Snoring. Muttering. Some crying out. Everyone had nightmares. Everyone carried ghosts. The dead didn't stay dead. They came back. In dreams. In quiet moments. In the faces of other men. The victims. The ones you'd killed. They haunted you. Would haunt you forever.</p>
                   
                   <p>You sat up. Unwilling to return to sleep. Unwilling to see that face again. That expression. That moment of recognition. When he knew he was going to die. When he accepted it. The resignation in his eyes. That was worse than the fear. The acceptance. As if he'd known this was how it would end. Known and accepted and waited for the blade.</p>
                   
                   <p>Dawn was still hours away. The night stretched before you. Dark. Empty. Full of memories you couldn't escape. This was the price. This was what killing did to you. It carved pieces from your soul. Left holes. Filled them with ghosts. With faces. With moments you could never take back. Never undo. Never escape. You just had to carry them. Until the weight became unbearable. Or until you died. Whichever came first.</p>`;
        },
        choices: [
            {
                text: "Accept it—this is who you are now",
                effects: { stress: -1, morale: -1 },
                nextScene: "acceptance"
            },
            {
                text: "Fight it—refuse to let it define you",
                effects: { wits: 1, stress: 1 },
                nextScene: "resistance"
            },
            {
                text: "Pray for forgiveness",
                effects: { morale: 2, stress: -1 },
                nextScene: "prayer_night"
            },
            {
                text: "Talk to someone about it",
                effects: { reputation: 1, morale: 1 },
                nextScene: "confession_peer"
            }
        ]
    },
    
    bandits_encounter: {
        title: "The Routiers",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/standoff.jpg",
        artworkCaption: "A dangerous standoff with routiers - pay or fight",
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>They stepped from the trees. A dozen men. Maybe more. Armed. Armored after a fashion. Piecemeal gear. Scavenged. Stolen. Taken from the dead. These were routiers. Mercenaries. Free Company men. Between contracts. Which made them bandits. Desperados. More dangerous than any French army because they had nothing to lose.</p>
                   
                   <p>Their leader stepped forward. Big man. Scarred face. He'd been a soldier once. A good one probably. Before the wars broke him. Before he decided robbery paid better than service. Now he led this rabble. This collection of killers and thieves. Making a living off the misery of others.</p>
                   
                   <p>You are a long way from your army, he called. His English was good. Better than your French. He smiled. Not friendly. Predatory. We could kill you. Take everything. Leave your bones for the crows. Or. He paused. Letting the word hang. You could pay. A toll. For using our road. Call it protection money.</p>
                   
                   <p>You were four men. They were twelve. Maybe fifteen. The odds weren't good. But running meant showing your back. Meant being cut down like rabbits. Fighting meant dying. Probably. But taking some of them with you. Or you could pay. Give them what they wanted. Live to see another day. Each option had consequences. Each carried risks.</p>
                   
                   <p>Your companions looked to you. Waiting for your call. ${name}, Will whispered. What do we do. His hand was on his sword. Ready to fight if that's what you chose. But hoping you'd find another way. Hoping there was a way out of this that didn't end with blood in the dirt.</p>`;
        },
        choices: [
            {
                text: "Pay the toll—live to fight another day",
                effects: { wealth: -3, stress: 1 },
                nextScene: "toll_paid"
            },
            {
                text: "Fight—you don't pay bandits",
                effects: { reputation: 2 },
                requiresResolution: true,
                resolutionStat: "strength",
                resolutionDifficulty: 9,
                nextScene: "bandit_fight"
            },
            {
                text: "Try to talk your way out",
                effects: { wits: 1 },
                requiresResolution: true,
                resolutionStat: "charisma",
                resolutionDifficulty: 8,
                nextScene: "negotiation"
            },
            {
                text: "Bluff—claim your army is right behind you",
                effects: { initiative: 1 },
                requiresResolution: true,
                resolutionStat: "charisma",
                resolutionDifficulty: 7,
                nextScene: "bluff_attempt"
            }
        ]
    },
    
    moral_choice: {
        title: "The Prisoner's Fate",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>The prisoner knelt before you. French. A common soldier like yourself. He'd surrendered after his unit broke. Thrown down his weapons. Raised his hands. Now he was yours. Your responsibility. Your problem. The question was what to do with him.</p>
                   
                   <p>The sergeant had been clear. No prisoners. Can't feed them. Can't guard them. Can't be bothered. Kill them or let them go. Those were your options. Killing was easier. Safer. A dead man couldn't report your position. Couldn't rejoin his unit. Couldn't come back to kill you later. It was the practical choice. The soldier's choice.</p>
                   
                   <p>But the man kneeling before you was pleading. In French you could barely understand. But the meaning was clear. Please. Mercy. Life. His eyes were desperate. Terrified. He was younger than you. Couldn't be more than twenty. Someone's son. Someone's brother. Maybe someone's husband. A person. Not just an enemy. A person who wanted to live.</p>
                   
                   <p>Your hand was on your sword. The other men had walked away. Giving you privacy. Giving you space to do what needed doing. They'd all done it. At some point. Killed a prisoner. Justified it however they could. Orders. Necessity. War. The reasons didn't matter. The act remained. Taking a life. A helpless life. A surrendered life. That was what being a soldier meant sometimes.</p>
                   
                   <p>You thought about the man you were before the war. Would he understand this. Would he recognize you. This person you'd become. Someone who could kill an unarmed man. Someone who had to make these choices. These impossible choices. Where mercy might mean death. For you. For your comrades. And cruelty might mean survival. You had to decide. Now. What kind of man you were. What kind of man you would be.</p>`;
        },
        choices: [
            {
                text: "Kill him—it's war, not murder",
                effects: { stress: 2, morale: -2 },
                nextScene: "prisoner_killed"
            },
            {
                text: "Let him go—you're not an executioner",
                effects: { morale: 2, reputation: 1, stress: 1 },
                nextScene: "prisoner_freed"
            },
            {
                text: "Take him to the captain—let someone else decide",
                effects: { wits: 1 },
                nextScene: "responsibility_shifted"
            },
            {
                text: "Question him first—get information",
                effects: { wits: 2 },
                requiresResolution: true,
                resolutionStat: "charisma",
                resolutionDifficulty: 6,
                nextScene: "interrogation"
            }
        ]
    },
    
    fellow_soldier_story: {
        title: "Tales by Firelight",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/campfire.jpg",
        artworkCaption: "Tales by firelight - stories of battles past",
        text: function() {
            return `<p>The fire burned low. Embers glowing. Men sat around it. Quiet. Reflective. The kind of quiet that comes after a long day. After exhaustion has set in. But before sleep takes you. Someone started talking. Old Robert. A veteran. Been soldiering since before most of you were born.</p>
                   
                   <p>I was at Bannockburn, he said. His voice was soft. Almost dreamy. As if remembering took him somewhere else. Somewhere far from this French field. We thought we'd win easy. English knights against Scottish rabble. But the Scots had pikes. And they had ground. And they had Bruce.</p>
                   
                   <p>He paused. Stared into the fire. Seeing things the rest of you couldn't see. Battles fought decades ago. Friends lost. Defeats suffered. We broke, he continued. The whole army. Just broke and ran. I was young then. Fast. I made it out. Many didn't. I can still hear them. Screaming. Dying. Under those Scottish pikes.</p>
                   
                   <p>The other men listened. Silent. Everyone had stories. Everyone had battles they'd survived. Or barely survived. But hearing them told. Hearing the pain in an old soldier's voice. That made it real. Made it human. Reminded you that beneath the armor. Beneath the weapons. You were all just men. Frightened men. Trying to survive.</p>
                   
                   <p>Robert looked up. His eyes met yours. You'll have your own stories soon enough, he said. If you live long enough. We all collect them. These memories. These ghosts. The faces of the men we killed. The friends we lost. They stay with you. Forever. That's the real price of being a soldier. Not the wounds. Not the scars. The memories. Those hurt worst of all.</p>`;
        },
        choices: [
            {
                text: "Share your own story",
                effects: { morale: 2, reputation: 1 },
                nextScene: "story_shared"
            },
            {
                text: "Listen—learn from his experience",
                effects: { wits: 2 },
                nextScene: "wisdom_gained"
            },
            {
                text: "Ask about Bannockburn—what went wrong",
                effects: { wits: 1, morale: 1 },
                nextScene: "tactical_lesson"
            },
            {
                text: "Stay silent—some things are better not spoken",
                effects: { stress: 1 },
                nextScene: "quiet_reflection"
            }
        ]
    },
    
    spring_landscape: {
        title: "Renewal",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            return `<p>Spring. The word seemed impossible. But there it was. Green shoots pushing through winter-dead earth. Trees budding. Birds returning. Life renewing itself. Indifferent to the war. Indifferent to the men who'd bled and died here. Nature didn't care. It just continued. Season after season. Growing. Dying. Growing again.</p>
                   
                   <p>The fields were mud. But different mud than winter. This mud smelled of growth. Of things coming alive. Not decay. Not death. For the first time in months something other than misery seemed possible. The sun was warmer. The air softer. The days longer. Everything was changing. Becoming what it was meant to be.</p>
                   
                   <p>Flowers appeared. Wildflowers. Blue and yellow. Scattered across the meadows like offerings. Like prayers. Like hope made visible. You stopped to look at them. Actually stopped. Let the column move on without you. Just stood there. Looking at flowers. Feeling the sun on your face. Remembering that beauty existed. That not everything was blood and mud and death.</p>
                   
                   <p>A lark sang. High above. Its song cascading down. Pure. Joyful. Unconcerned with human troubles. You listened. Really listened. Trying to remember the last time you'd heard birdsong. Trying to remember when you'd stopped noticing. When the world had narrowed to just survival. Just the next march. The next battle. The next day.</p>
                   
                   <p>The moment passed. The column was getting ahead. You had to move. Had to keep up. But something had shifted. Inside you. Something small. Fragile. Like those flowers. Like that birdsong. A reminder that the world was more than war. That spring came even to France. Even to battlefields. Even to places where men killed each other for reasons most of them couldn't explain.</p>`;
        },
        choices: [
            {
                text: "Embrace it—enjoy this moment",
                effects: { morale: 3, stress: -2 },
                nextScene: "peace_found"
            },
            {
                text: "Remember it—hold onto beauty",
                effects: { morale: 2, wits: 1 },
                nextScene: "memory_treasured"
            },
            {
                text: "Ignore it—stay focused on survival",
                effects: { stress: 1 },
                nextScene: "march_continues"
            }
        ]
    },
    
    crecy_preparation: {
        title: "Before Crécy",
        year: 1346,
        age: function() { return gameState.age; },
        location: "Crécy-en-Ponthieu",
        artwork: "artwork/battle-scene-2.jpg",
        artworkCaption: "The English position at Crécy - waiting for the French",
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>The order came at dawn. Form up. The French were coming. Everyone knew it. You'd been waiting for this. Days of marching. Maneuvering. Now it would end. Here. On this ridge. Either in victory or death. Those were the only options.</p>
                   
                   <p>The ground was good. King Edward had chosen well. A slope. Gradual but enough to matter. The French would have to charge uphill. Into arrows. Into stakes. Into death. The archers were already in position. Thousands of them. Longbowmen from Wales. From England. The best in the world. Their bows propped before them. Arrows stuck in the ground. Ready.</p>
                   
                   <p>You took your position in the line. Men-at-arms. The backbone. The ones who'd hold when the arrows stopped flying. When it came to steel and muscle and will. Your shield was heavy on your arm. Your sword loose in its sheath. Everything was ready. Everything was prepared. All that remained was waiting. Waiting for the French to come. Waiting to see if you'd live through this day.</p>
                   
                   <p>The sun climbed. Afternoon came. Still no French. The waiting was torture. Worse than fighting. At least in battle you didn't have time to think. To imagine. To fear. But waiting. That gave your mind time to work. To picture everything that could go wrong. Everything that could kill you. The arrows. The horses. The French knights in their fine armor. All of it coming for you.</p>
                   
                   <p>Then you saw them. On the horizon. A mass of men and horses. Banners. Thousands of banners. The French army. So many. Too many. They filled the valley. Edge to edge. Like a river of steel. Moving toward you. Coming to kill you. Or die trying. This was it. The moment. ${name}, Will whispered beside you. God help us all. You didn't answer. Just gripped your sword. And waited. For the battle. For history. For whatever came next.</p>`;
        },
        choices: [
            {
                text: "Stand firm—you're English, you don't break",
                effects: { morale: 2, endurance: 1 },
                nextScene: "battle_crecy"
            },
            {
                text: "Pray—you'll need God's help",
                effects: { morale: 1, stress: -1 },
                nextScene: "battle_crecy"
            },
            {
                text: "Check your gear one last time",
                effects: { initiative: 1 },
                nextScene: "battle_crecy"
            }
        ]
    },
    
    plunder_decision: {
        title: "The Undefended Manor",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>The manor stood alone. Stone walls. Tiled roof. Wealthy once. Maybe still. No signs of defenders. No smoke from fires. No sounds of occupation. Just an empty building. Full of possibilities. Full of plunder. If you were willing to take it.</p>
                   
                   <p>The others were already moving forward. Eager. Eyes bright with greed. This was what soldiers lived for. The chance at loot. At wealth beyond their station. A manor like this could hold silver. Tapestries. Jewelry. Things worth more than a year's wages. Things that could change your life. If you got to them first.</p>
                   
                   <p>But something felt wrong. Too easy. Too convenient. An undefended manor in the middle of a war zone. Either the owners had fled in panic. Leaving everything. Or this was a trap. Bait. Luring greedy soldiers into an ambush. Or maybe there was plague inside. That would explain the abandonment. The silence. The sense of wrongness.</p>
                   
                   <p>Thomas was already at the door. Pushing it open. Others following. You had seconds to decide. Go in. Take your chances. Maybe get rich. Maybe get killed. Maybe get sick. Or stay outside. Safe. Poor. Watching others claim what could have been yours. The choice was simple. But the consequences weren't.</p>
                   
                   <p>${name}, Will called. What are you doing. Come on. But you hesitated. That voice in your head. The one that kept you alive this long. It was screaming. Warning you. Something was wrong with this place. Something was very wrong. Whether you listened to that voice or ignored it. That would determine what happened next.</p>`;
        },
        choices: [
            {
                text: "Enter the manor—fortune favors the bold",
                effects: { wealth: 4 },
                requiresResolution: true,
                resolutionStat: "luck",
                resolutionDifficulty: 6,
                nextScene: function() {
                    if (Math.random() * 10 + gameState.stats.luck >= 6) {
                        return "plunder_success";
                    }
                    return "plunder_trap";
                }
            },
            {
                text: "Scout around first—check for danger",
                effects: { wits: 2 },
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 7,
                nextScene: "trap_discovered"
            },
            {
                text: "Stay outside—this feels like a trap",
                effects: { wits: 1 },
                nextScene: "caution_rewarded"
            },
            {
                text: "Wait for others to go first—see what happens",
                effects: { reputation: -1 },
                nextScene: "watch_unfold"
            }
        ]
    },
    
    // ===== NEW PILLAGING/CRUELTY EVENTS (Opportunities to be bad for money) =====
    peasant_extortion: {
        title: "The Desperate Farmer",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/unnamed.jpg",
        artworkCaption: "The desperate farmer - alone and defenseless",
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>The farmer stood in his field. Old. Bent. His hands shaking. He'd seen you coming. The whole column. Hundreds of men. Moving through his land. Through his crops. Trampling everything. Destroying what he'd spent a year growing.</p>
                   
                   <p>He approached. Hesitant. Fearful. Please, he said in broken English. My family. My farm. We have nothing. But you could see the lie in his eyes. The way he clutched his tunic. The bulge beneath it. He had something. Coin. Or jewelry. Or something worth taking.</p>
                   
                   <p>Your comrades were already looking. Calculating. A farmer like this. Alone. Defenseless. Easy prey. They'd take everything. Leave him with nothing. Maybe worse. You could join them. Get your share. Or you could walk away. Let him keep what little he had. But coin was coin. And you needed it. More than he did. Probably.</p>
                   
                   <p>The old man's eyes pleaded. But his hand moved to his tunic. Protecting something. Something valuable. Something that could mean the difference between life and death for you. Between having coin when you needed it and being broke. Being dead.</p>`;
        },
        choices: [
            {
                text: "Threaten him—make him hand over his valuables",
                effects: { wealth: 96, reputation: -3, morale: -1, stress: 1 }, // 8 shillings = 96 pence
                nextScene: "extortion_success"
            },
            {
                text: "Search him by force—take everything",
                effects: { wealth: 144, reputation: -4, morale: -2, stress: 2 }, // 12 shillings = 144 pence
                requiresResolution: true,
                resolutionStat: "strength",
                resolutionDifficulty: 5,
                nextScene: "brutal_theft"
            },
            {
                text: "Leave him alone—he's suffered enough",
                effects: { reputation: 1, morale: 1 },
                nextScene: "mercy_shown"
            },
            {
                text: "Take only what you need—leave him something",
                effects: { wealth: 36, reputation: -1 }, // 3 shillings = 36 pence
                nextScene: "partial_theft"
            }
        ]
    },
    
    village_pillage: {
        title: "The Undefended Village",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/unnamed.jpg",
        artworkCaption: "The undefended village - easy plunder",
        text: function() {
            return `<p>The village was empty. Or nearly. The inhabitants had fled. Seeing the column approach. Knowing what soldiers did to undefended villages. They'd taken what they could carry. Left the rest. Their homes. Their possessions. Their lives. All abandoned. All yours for the taking.</p>
                   
                   <p>Your comrades were already inside. Breaking doors. Overturning furniture. Looking for hidden valuables. For coin. For anything worth taking. The sound of destruction filled the air. Wood splintering. Glass breaking. The casual violence of men who'd learned that nothing was sacred. That everything was plunder.</p>
                   
                   <p>You could join them. Take your share. A village like this could have hidden wealth. Coins buried in gardens. Jewelry hidden in walls. Things people thought were safe. Things that weren't. You could be thorough. Methodical. Leave nothing. Or you could be quick. Take what was obvious. Move on. But thorough meant more coin. More wealth. More security against the day when coin meant life.</p>
                   
                   <p>In the distance you heard screams. Not everyone had fled. Some had stayed. Too old. Too sick. Too afraid to leave. They were learning now. Learning what soldiers did. What you could do. If you chose to. The choice was yours. But the screams were real. The fear was real. And the coin was real too.</p>`;
        },
        choices: [
            {
                text: "Pillage thoroughly—search every house",
                effects: { wealth: 180, reputation: -3, morale: -2, stress: 2 }, // 15 shillings = 180 pence
                nextScene: "thorough_pillage"
            },
            {
                text: "Be cruel—intimidate those who stayed for more coin",
                effects: { wealth: 240, reputation: -5, morale: -3, stress: 3 }, // 20 shillings = 240 pence = £1
                requiresResolution: true,
                resolutionStat: "charisma",
                resolutionDifficulty: 6,
                nextScene: "cruel_extraction"
            },
            {
                text: "Take only obvious valuables—leave quickly",
                effects: { wealth: 72, reputation: -1 }, // 6 shillings = 72 pence
                nextScene: "quick_pillage"
            },
            {
                text: "Refuse to pillage—this is wrong",
                effects: { reputation: 2, morale: 1, stress: -1 },
                nextScene: "refusal_honor"
            },
            {
                text: "Claim the village for your lord—secure it formally",
                requires: { custom: function() { return gameState.patronId === 'earl_northampton' || gameState.patronId === 'king_edward'; } },
                effects: { patronFavor: 3, reputation: 2, wealth: 60 },
                onChoose: function() {
                    showNotification('Patron', 'Your lord is pleased by your diligence. The village is claimed in his name.', 'info');
                },
                nextScene: "respect_shown"
            }
        ]
    },
    
    prisoner_ransom: {
        title: "The Wounded Noble",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            return `<p>The French noble lay in the mud. Wounded. His fine clothes torn. Blood soaking through. He was young. Maybe twenty. Rich. You could tell from his armor. From the rings on his fingers. From the way he carried himself even now. Even broken. Even dying.</p>
                   
                   <p>He looked up at you. Fear in his eyes. But also calculation. He knew what you were. What you could do. But he also knew what he was worth. His family would pay. Handsomely. For his safe return. Or you could kill him. Take what he had. Leave his body for the crows. But ransom was more. Much more. If you could keep him alive. If you could get him back to camp.</p>
                   
                   <p>Others were watching. Your comrades. They'd want a share. Or they'd take him from you. Claim the ransom for themselves. You'd need to be quick. Decisive. Claim him as your prisoner. Your prize. Your coin. But there was another option. He had valuables on him. Right now. Rings. A purse. Things you could take. Things worth coin. But less than ransom. Much less.</p>
                   
                   <p>The noble spoke. In French. Then in broken English. Ransom, he said. My family. They pay. Much coin. Please. The desperation in his voice was real. The fear was real. But so was the wealth. So was the opportunity. To be rich. To have coin. To never be broke again. To never die because you couldn't afford to live.</p>`;
        },
        choices: [
            {
                text: "Take him prisoner—claim the full ransom",
                effects: { wealth: 360, reputation: 1 }, // 30 shillings = 360 pence = £1 10s
                requiresResolution: true,
                resolutionStat: "endurance",
                resolutionDifficulty: 7,
                nextScene: "ransom_secured"
            },
            {
                text: "Kill him and take his valuables—quick coin",
                effects: { wealth: 12, reputation: -3, morale: -2, stress: 2 },
                nextScene: "noble_killed"
            },
            {
                text: "Strip him of valuables and leave him—compromise",
                effects: { wealth: 8, reputation: -1, morale: -1 },
                nextScene: "partial_theft_noble"
            },
            {
                text: "Help him—show mercy",
                effects: { reputation: 2, morale: 1 },
                nextScene: "mercy_noble"
            }
        ]
    },
    
    church_desecration: {
        title: "The Abandoned Church",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/Vigiles_du_roi_Charles_VII_32.jpg",
        artworkCaption: "The abandoned church - dark and empty",
        text: function() {
            return `<p>The church stood empty. The priest had fled. Or been killed. The doors were open. Inviting. Or warning. You couldn't tell. Inside was dark. Cool. The smell of incense and age. Of something sacred. Or something that had been sacred. Before the war. Before men like you came.</p>
                   
                   <p>Your comrades were already inside. Laughing. Calling out. Finding things. Silver candlesticks. Offering plates. A cross. Gold. Real gold. Worth a fortune. The Church was rich. Everyone knew that. Rich enough to spare. Rich enough that taking from it wasn't really theft. It was redistribution. From the wealthy Church to the poor soldiers. That's how you could justify it. If you needed to.</p>
                   
                   <p>But there was more. The altar. The reliquary. Things that might contain jewels. Things worth more than silver. Things that could make you rich. If you were willing to take them. To defile a church. To commit sacrilege. But coin was coin. And the Church had plenty. More than you'd ever have. More than you'd ever need. Unless you took it.</p>
                   
                   <p>Others were already taking. Filling sacks. Laughing. Joking about God's wrath. About damnation. But they had coin. They had wealth. They had security. And you had nothing. Nothing but the chance to take. To become like them. To have what they had. If you were willing to pay the price. If you were willing to damn yourself. For coin. For life.</p>`;
        },
        choices: [
            {
                text: "Take everything valuable—maximum profit",
                effects: { wealth: 25, reputation: -4, morale: -3, stress: 2 },
                nextScene: "complete_desecration"
            },
            {
                text: "Take only silver—leave the sacred items",
                effects: { wealth: 10, reputation: -2, morale: -1 },
                nextScene: "partial_desecration"
            },
            {
                text: "Take nothing—this is sacrilege",
                effects: { reputation: 2, morale: 1 },
                nextScene: "respect_shown"
            },
            {
                text: "Take the reliquary—it's worth the most",
                effects: { wealth: 35, reputation: -5, morale: -4, stress: 3 },
                requiresResolution: true,
                resolutionStat: "strength",
                resolutionDifficulty: 7,
                nextScene: "ultimate_sacrilege"
            }
        ]
    },
    
    merchant_robbery: {
        title: "The Traveling Merchant",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            return `<p>The merchant's cart was stuck. Wheel deep in mud. He was trying to free it. Pushing. Pulling. Desperate. His goods were valuable. Silks. Spices. Things worth coin. Things that could make him rich. Or make you rich. If you took them.</p>
                   
                   <p>He saw you coming. Saw the column. Saw the soldiers. His face went pale. He knew what happened to merchants caught alone. Knew what soldiers did. Knew he was vulnerable. Defenseless. Easy prey. He reached for his purse. Offering coin. Bribing. Trying to buy safety. Trying to buy his life.</p>
                   
                   <p>But you could take more. Much more. The cart. The goods. Everything. Leave him with nothing. Or kill him. Take it all. No witnesses. No one to tell. Just you. And the coin. And the wealth. And the security that came with it. The security of never being broke. Never dying because you couldn't afford to live.</p>
                   
                   <p>Your comrades were watching. Waiting. Seeing what you'd do. If you'd take the bribe. Or take everything. Or kill him. They'd want a share. Or they'd take it from you. But if you acted first. If you claimed it. It was yours. Your coin. Your wealth. Your life. Bought with his. If you were willing to pay that price.</p>`;
        },
        choices: [
            {
                text: "Take the bribe and move on—easy coin",
                effects: { wealth: 5, reputation: -1 },
                nextScene: "bribe_taken"
            },
            {
                text: "Rob him completely—take cart and goods",
                effects: { wealth: 20, reputation: -3, morale: -1, stress: 1 },
                requiresResolution: true,
                resolutionStat: "strength",
                resolutionDifficulty: 6,
                nextScene: "complete_robbery"
            },
            {
                text: "Kill him and take everything—no witnesses",
                effects: { wealth: 25, reputation: -5, morale: -3, stress: 3 },
                requiresResolution: true,
                resolutionStat: "agility",
                resolutionDifficulty: 7,
                nextScene: "murder_robbery"
            },
            {
                text: "Help him free the cart—show mercy",
                effects: { reputation: 2, morale: 1 },
                nextScene: "mercy_merchant"
            }
        ]
    },
    
    peasant_brutality: {
        title: "The Hiding Peasants",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            return `<p>You found them in the cellar. A family. Father. Mother. Three children. Hiding. Hoping you'd pass by. Hoping you wouldn't find them. But you did. You always did. Experience had taught you where people hid. Where they thought they were safe. Where they weren't.</p>
                   
                   <p>They were terrified. The father held a pitchfork. Useless. A farmer's tool against a soldier's sword. But he held it anyway. Protecting his family. Or trying to. The mother clutched the children. Pulled them close. Her eyes wide with fear. With desperation. With the knowledge that they were helpless. That you could do anything. Anything at all.</p>
                   
                   <p>They had things. Hidden. Buried. Things they thought were safe. Coins. Jewelry. Things worth taking. Things worth coin. You could make them tell you. Threaten. Hurt. Kill. They'd tell you. Eventually. Everyone did. Or you could just take what was obvious. Leave them. But thorough meant more coin. More wealth. More security. If you were willing to be cruel. If you were willing to be the thing the war had made you.</p>
                   
                   <p>The father spoke. In French. Pleading. Offering. Trying to buy safety. Trying to buy their lives. But you didn't understand. Or pretended not to. Language was just another weapon. Another way to have power. Another way to take what you wanted. What you needed. What would keep you alive when others died. Because they were broke. Because they had nothing. Because they couldn't buy their way out of death.</p>`;
        },
        choices: [
            {
                text: "Intimidate them into revealing hidden valuables",
                effects: { wealth: 10, reputation: -2, morale: -1, stress: 1 },
                requiresResolution: true,
                resolutionStat: "charisma",
                resolutionDifficulty: 6,
                nextScene: "intimidation_success"
            },
            {
                text: "Be brutal—hurt them until they tell",
                effects: { wealth: 18, reputation: -4, morale: -3, stress: 3 },
                requiresResolution: true,
                resolutionStat: "strength",
                resolutionDifficulty: 5,
                nextScene: "brutality_success"
            },
            {
                text: "Take only what's obvious—leave them",
                effects: { wealth: 4, reputation: -1 },
                nextScene: "partial_theft_peasants"
            },
            {
                text: "Leave them alone—they're just trying to survive",
                effects: { reputation: 2, morale: 1 },
                nextScene: "mercy_peasants"
            }
        ]
    },
    
    noblevisit: {
        title: "The Knight's Inspection",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/Vigiles_du_roi_Charles_VII_32.jpg",
        artworkCaption: "A noble's inspection - the business of war",
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>The knight rode through camp. Sir Edmund. One of the commanders. Full plate. War horse. Everything polished. Gleaming. He looked like something from a tapestry. Like something that wasn't quite real. Too perfect. Too clean. Nothing like the mud-stained soldiers he commanded.</p>
                   
                   <p>Men scrambled to attention. Standing straight. Trying to look presentable. The knight didn't seem to notice. Or care. His eyes swept over them. Assessing. Calculating. Seeing bodies. Numbers. Tools for war. Not men. Not individuals. Just resources to be deployed.</p>
                   
                   <p>He stopped before your section. Dismounted. His squire hurried to take the horse. The knight walked along the line. Inspecting. His gaze sharp. Critical. He stopped at you. Looked you up and down. Your name, he demanded. Not a question. A command. You gave it. ${name}, you said. The knight nodded. Once. Brief. Acknowledging your existence. Barely.</p>
                   
                   <p>Your equipment is acceptable, he said. Not a compliment. Just a statement. But maintain it better. A dull blade is worse than no blade at all. He moved on. Down the line. Stopping at others. Finding faults. Pointing out deficiencies. His voice was cold. Clipped. The voice of someone who'd never known what it was like to be afraid. To be hungry. To be anything other than noble.</p>
                   
                   <p>When he finished he addressed the whole group. You fight for England, he said. For your king. For God. Remember that. Remember why you're here. Then he mounted. Rode away. Back to his tent. His wine. His comfort. Leaving you standing in the mud. In the cold. In the place where men like you belonged. Separate from men like him. Always separate.</p>`;
        },
        choices: [
            {
                text: "Feel inspired—fight for something greater",
                effects: { morale: 2 },
                nextScene: "inspiration_found"
            },
            {
                text: "Feel resentment—he knows nothing of our struggle",
                effects: { stress: 1, wits: 1 },
                nextScene: "class_divide"
            },
            {
                text: "Maintain your gear better—prove him wrong",
                effects: { initiative: 1, reputation: 1 },
                nextScene: "improvement_made"
            },
            {
                text: "Forget him—nobles don't understand soldiers",
                effects: { morale: -1 },
                nextScene: "dismissed"
            }
        ]
    },
    
    camp_follower: {
        title: "The Washerwoman",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>She worked at the stream. Washing clothes. One of the camp followers. Women who traveled with the army. Doing the work soldiers couldn't or wouldn't do. Washing. Cooking. Mending. Other things. For coin. For protection. For survival in a world that offered few choices to women alone.</p>
                   
                   <p>Her hands were red. Raw from cold water. From lye soap. From endless scrubbing. But she worked without complaint. Methodical. Efficient. This was her trade. Her livelihood. She was good at it. Had to be. Competition was fierce. Too many women. Not enough soldiers with coin to pay them.</p>
                   
                   <p>She looked up. Saw you watching. Smiled. Not seductive. Just friendly. Professional. Clothes need washing, she asked. Her accent was French. But her English was good. Learned from necessity. From dealing with English soldiers for months. Maybe years. Three pence, she said. I do good work. Your clothes come back clean.</p>
                   
                   <p>You looked at your clothes. They were filthy. Stiff with dirt and sweat. The idea of clean clothes. Of something that didn't stink. It was tempting. Three pence wasn't much. You'd spent more on dice. On ale. On things with less value. But something made you hesitate. Maybe the way she looked. Tired. Worn. Like the work was eating her from inside.</p>
                   
                   <p>Or maybe it was just the transaction. The cold commerce of it. Money for service. Nothing more. No connection. No humanity. Just need and payment. The war had turned everything into transactions. Even something as simple as washing clothes. Even basic kindness came with a price.</p>`;
        },
        choices: [
            {
                text: "Pay her—you need clean clothes",
                effects: { wealth: -1, morale: 1 },
                nextScene: "clothes_washed"
            },
            {
                text: "Talk with her—learn her story",
                effects: { wits: 1, morale: 1 },
                nextScene: "conversation_shared"
            },
            {
                text: "Decline—save your coins",
                effects: { stress: 1 },
                nextScene: "walked_away"
            },
            {
                text: "Offer to help her instead",
                effects: { reputation: 1, endurance: -1 },
                nextScene: "kindness_shown"
            }
        ]
    },
    
    // ===== ADDITIONAL SPENDING OPPORTUNITIES =====
    blacksmith_visit: {
        title: "The Camp Blacksmith",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        artwork: "artwork/blacksmith.png",
        artworkCaption: "The forge glows in the evening - fire and metal",
        text: function() {
            const wealth = gameState.stats.wealth || 0;
            return `<p>The blacksmith's forge glowed in the evening. Fire and metal. The sound of hammer on anvil. Ringing. Constant. The rhythm of war. Of preparation. Of survival. The blacksmith was a big man. Arms like tree trunks. Face scarred by sparks. He'd been with the army for years. Knew what soldiers needed. Knew what they'd pay for.</p>
                   
                   <p>Better equipment. That's what kept you alive. A good sword. Proper armor. Things that turned a killing blow into a glancing strike. Things that meant the difference between life and death. The blacksmith had them. Forged them. Sold them. At a price. Everything had a price. Especially life.</p>
                   
                   <p>You had ${wealth} shillings. Enough for something. Maybe better mail. A sharper sword. A sturdier shield. Things that would make you harder to kill. Things that would give you an edge. In a world where edges mattered. Where every advantage counted. Where coin could buy you life itself.</p>
                   
                   <p>The blacksmith looked up. Saw you watching. Nodded. Come to buy, he asked. Or just looking. His voice was rough. Like gravel. Like someone who'd breathed too much smoke. Too much fire. But his eyes were sharp. Calculating. He knew what you wanted. What you needed. What you'd pay.</p>`;
        },
        choices: [
            {
                text: "Buy better mail armor (15 shillings)",
                effects: { wealth: -15, endurance: 2 },
                nextScene: "armor_purchased"
            },
            {
                text: "Buy a better sword (12 shillings)",
                effects: { wealth: -12, strength: 1, initiative: 1 },
                nextScene: "sword_purchased"
            },
            {
                text: "Buy a sturdy shield (10 shillings)",
                effects: { wealth: -10, endurance: 1 },
                nextScene: "shield_purchased"
            },
            {
                text: "Can't afford it—walk away",
                effects: { stress: 1 },
                nextScene: "blacksmith_departed"
            }
        ]
    },
    
    surgeon_preventive: {
        title: "The Camp Surgeon",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            const wealth = gameState.stats.wealth || 0;
            return `<p>The surgeon's tent smelled of blood. Of rot. Of things you didn't want to think about. But it also smelled of herbs. Of medicine. Of things that could save your life. If you could afford them. If you had coin.</p>
                   
                   <p>The surgeon was a practical man. He'd seen too much death. Too much suffering. He knew what worked. What didn't. And he knew what it cost. Medicine wasn't free. Care wasn't free. Life wasn't free. Everything had a price. Especially prevention. Especially staying alive.</p>
                   
                   <p>You had ${wealth} shillings. Enough for preventive care. For medicine to ward off sickness. For clean bandages. For things that would keep you healthy. Keep you alive. When others got sick. When others died. You could be different. If you had coin. If you spent it wisely.</p>
                   
                   <p>The surgeon looked at you. Assessing. Calculating. You look healthy, he said. But that can change. Fast. Sickness comes. Wounds fester. Men die. But not all men. Not the ones with coin. Not the ones who can afford prevention. Who can afford to stay alive.</p>`;
        },
        choices: [
            {
                text: "Buy preventive medicine (8 shillings)",
                effects: { wealth: -8, stress: -2 },
                nextScene: "medicine_purchased"
            },
            {
                text: "Buy clean bandages and supplies (5 shillings)",
                effects: { wealth: -5, endurance: 1 },
                nextScene: "supplies_purchased"
            },
            {
                text: "Pay for a full health check (12 shillings)",
                effects: { wealth: -12, stress: -1, morale: 1 },
                nextScene: "health_check"
            },
            {
                text: "Can't afford it—hope you stay healthy",
                effects: { stress: 1 },
                nextScene: "surgeon_departed"
            }
        ]
    },
    
    officer_bribe: {
        title: "The Captain's Favor",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            const wealth = gameState.stats.wealth || 0;
            return `<p>The captain was approachable. For a price. Officers always were. They had power. You had coin. It was a simple transaction. Coin for favor. Coin for safety. Coin for the chance to avoid the worst assignments. The most dangerous missions. The ones that got men killed.</p>
                   
                   <p>You had ${wealth} shillings. Enough for something. Maybe a better assignment. Maybe protection from the worst duties. Maybe just the captain's goodwill. The knowledge that when things got bad. When you needed help. He'd remember. He'd help. If you paid. If you had coin.</p>
                   
                   <p>But it was expensive. Officers didn't come cheap. Their favor had a price. A high price. But it was worth it. If it kept you alive. If it meant you didn't get sent on the suicide mission. If it meant you had someone to turn to when you needed help. When coin alone wasn't enough. When you needed someone with power. Someone who could make things happen.</p>
                   
                   <p>The captain looked at you. Waiting. He knew why you were here. Everyone came for the same reason. Coin. Favor. Safety. He'd take your money. Give you what you wanted. Or at least the promise of it. The hope that when you needed him. He'd be there. If you paid enough. If you had enough coin.</p>`;
        },
        choices: [
            {
                text: "Pay for better assignments (10 shillings)",
                effects: { wealth: -10, reputation: 1, stress: -1 },
                nextScene: "favor_purchased"
            },
            {
                text: "Pay for protection from dangerous missions (15 shillings)",
                effects: { wealth: -15, stress: -2, morale: 1 },
                nextScene: "protection_purchased"
            },
            {
                text: "Pay for the captain's goodwill (8 shillings)",
                effects: { wealth: -8, reputation: 1 },
                nextScene: "goodwill_purchased"
            },
            {
                text: "Can't afford it—take your chances",
                effects: { stress: 1 },
                nextScene: "officer_departed"
            }
        ]
    },
    
    information_broker: {
        title: "The Informant",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            const wealth = gameState.stats.wealth || 0;
            return `<p>The informant was a shadow. A man who knew things. Who sold knowledge. Who made coin from information. He knew where the French were. Where they weren't. Where the safe routes were. Where the ambushes waited. Information was power. Information was life. And he sold it. For coin.</p>
                   
                   <p>You had ${wealth} shillings. Enough for something. Maybe information about the next battle. About where the danger was. About how to avoid it. About how to stay alive. When others died. When others walked into traps. You could know. You could avoid. If you paid. If you had coin.</p>
                   
                   <p>But information was expensive. Knowledge had a price. A high price. But it was worth it. If it kept you alive. If it meant you didn't walk into an ambush. If it meant you knew where the enemy was. Where they weren't. If it meant you had an advantage. In a world where advantages meant life. Where knowledge meant survival.</p>
                   
                   <p>The informant looked at you. Smiled. A thin smile. A knowing smile. Information, he said. That's what you want. That's what I sell. For coin. For the right price. I know things. Things that could save your life. Things that could make you rich. If you're willing to pay. If you have coin.</p>`;
        },
        choices: [
            {
                text: "Buy information about enemy positions (12 shillings)",
                effects: { wealth: -12, wits: 1, stress: -1 },
                nextScene: "intel_purchased"
            },
            {
                text: "Buy information about safe routes (8 shillings)",
                effects: { wealth: -8, stress: -1 },
                nextScene: "route_intel"
            },
            {
                text: "Buy information about plunder opportunities (15 shillings)",
                effects: { wealth: -15, wits: 1 },
                nextScene: "plunder_intel"
            },
            {
                text: "Can't afford it—go in blind",
                effects: { stress: 1 },
                nextScene: "informant_departed"
            }
        ]
    },
    
    reflection_on_past: {
        title: "The Man You Were",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            const age = gameState.age || 25;
            const background = gameState.background || "common";
            return `<p>You sat alone. Watching the sun set over French fields. Golden light. Peaceful. Beautiful. As if the war didn't exist. As if the blood spilled on this soil hadn't stained it forever. You thought about home. About England. About the person you were before.</p>
                   
                   <p>You'd been ${age - 4} when you joined up. Young. Full of ideas about glory. About honor. About what it meant to be a soldier. The reality had been different. Harder. Crueler. The glory was horseshit. The honor questionable. And being a soldier meant doing things you never thought you'd do. Becoming someone you never thought you'd be.</p>
                   
                   <p>Your background was ${background}. That had shaped you. Given you certain skills. Certain perspectives. But war had reshaped you. Molded you into something else. A killer. An efficient one. You'd lost count of how many men you'd killed. Stopped trying to remember their faces. But they were there. In the dark. In the quiet. Waiting.</p>
                   
                   <p>The question was whether any of the old you remained. Whether the person you were before the war still existed. Somewhere inside. Buried beneath the scars and the memories and the things you'd done. Or if war had killed that person. Replaced him completely. Left nothing but this. This hollow shell. This weapon. This thing that killed and survived and kept killing.</p>
                   
                   <p>The sun touched the horizon. The light fading. Darkness coming. Always coming. You didn't have answers. Maybe there were no answers. Maybe you'd been asking the wrong questions. Maybe it didn't matter who you were before. Only who you were now. Only what you did next. The past was dead. Like so many other things. All you had was now. This moment. This choice. What to do with it.</p>`;
        },
        choices: [
            {
                text: "Try to hold onto who you were",
                effects: { morale: 2, stress: 1 },
                nextScene: "identity_preserved"
            },
            {
                text: "Accept what you've become",
                effects: { wits: 2, morale: -1 },
                nextScene: "transformation_accepted"
            },
            {
                text: "Vow to be better—to do better",
                effects: { reputation: 1, morale: 1 },
                nextScene: "redemption_sought"
            },
            {
                text: "Nothing matters—just survive",
                effects: { stress: -1, morale: -2 },
                nextScene: "nihilism"
            }
        ]
    },
    
    storm_approaching: {
        title: "The Coming Storm",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            return `<p>The sky darkened. Clouds rolling in from the west. Heavy. Threatening. The kind of clouds that meant rain. Lots of rain. The kind that turned roads to mud. Made camp miserable. Made everything harder. You could smell it coming. The wet. The cold. The misery.</p>
                   
                   <p>Men were already preparing. Tying down tents. Securing gear. Moving things under cover. The experienced ones. They'd seen storms before. Knew what was coming. The new ones. The green ones. They watched. Learned. Or didn't. Would pay for it later. When everything was soaked. When they were shivering. When they realized preparation mattered.</p>
                   
                   <p>The wind picked up. Cold. Biting. Pulling at your cloak. At your hair. At everything loose. The first drops fell. Fat. Heavy. Splashing in the dust. Then more. Faster. Harder. The storm was here. No turning back. No avoiding it. Just endure. Wait it out. Hope it passed quickly. Though you knew it wouldn't.</p>
                   
                   <p>Lightning flashed. Far off. But getting closer. Thunder followed. Deep. Rumbling. Like God's anger. Or maybe just nature. Indifferent. Uncaring. Just doing what storms do. Destroying. Washing away. Leaving everything changed. Everything different. The way storms always did.</p>
                   
                   <p>You found what shelter you could. Under a tree. Behind a cart. Anywhere that offered some protection. But you knew it wouldn't be enough. The storm would find you. Soak you. Chill you. Make you miserable. That was its nature. That was what storms did. And there was nothing you could do but endure. Wait. Hope for morning. Hope for it to end.</p>`;
        },
        choices: [
            {
                text: "Help others secure their gear",
                effects: { reputation: 2, endurance: -1 },
                nextScene: "storm_helpful"
            },
            {
                text: "Find the best shelter—look out for yourself",
                effects: { wits: 1 },
                requiresResolution: true,
                resolutionStat: "wits",
                resolutionDifficulty: 6,
                nextScene: "shelter_found"
            },
            {
                text: "Accept it—storms pass",
                effects: { morale: 1, stress: 1 },
                nextScene: "storm_endured"
            },
            {
                text: "Use it as cover—scout ahead",
                effects: { initiative: 1 },
                requiresResolution: true,
                resolutionStat: "agility",
                resolutionDifficulty: 7,
                nextScene: "storm_scout"
            }
        ]
    },
    
    siege_boredom: {
        title: "The Endless Siege",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            return `<p>Week three of the siege. Or was it four. Time had lost meaning. The days blended together. Waiting. Watching. Doing nothing. The town sat behind its walls. Defiant. Untouchable. And you sat outside. Staring at stone. Waiting for something. Anything. To happen.</p>
                   
                   <p>Boredom was worse than battle. At least battle ended. One way or another. But sieges dragged on. Weeks. Months. Sometimes years. Just sitting. Waiting. Starving them out or being starved yourself. Depending who had more food. More patience. More will to endure the tedium.</p>
                   
                   <p>The camp was a festering sore. Too many men. Too long in one place. Disease was spreading. Dysentery. Fever. Things with no names. Just symptoms. Shit and blood and death. The surgeon was overwhelmed. The graves multiplying. More men died of disease in sieges than ever died in battle. But there was no glory in that. No songs about the men who shit themselves to death outside some French town no one had heard of.</p>
                   
                   <p>You did what everyone did. Tried to pass time. Diced. Drank when there was anything to drink. Told stories. Fought over nothing. Just to feel something. Just to break the monotony. Some men deserted. Slipped away in the night. You didn't blame them. Sometimes leaving seemed smarter than staying. Smarter than waiting for disease or starvation or a random crossbow bolt to end you.</p>
                   
                   <p>Another day dawned. Identical to the one before. To the one that would come tomorrow. The walls still stood. The town still defiant. And you still sat here. Waiting. Watching. Dying slowly of boredom and disease and the crushing weight of having nothing to do but survive another day of absolutely nothing happening.</p>`;
        },
        choices: [
            {
                text: "Volunteer for dangerous duty—anything's better than this",
                effects: { initiative: 1, stress: -1 },
                nextScene: "siege_duty"
            },
            {
                text: "Endure—sieges end eventually",
                effects: { endurance: 2, morale: -1 },
                nextScene: "siege_continues"
            },
            {
                text: "Find ways to entertain yourself",
                effects: { morale: 1 },
                nextScene: "siege_entertainment"
            },
            {
                text: "Think about deserting",
                effects: { stress: 2 },
                nextScene: "desertion_considered"
            }
        ]
    },
    
    friendly_fire: {
        title: "The Mistake",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            return `<p>The arrow came from behind. From your own lines. You heard the thwock of impact. Then the scream. Peter fell. Clutching his shoulder. Blood between his fingers. Someone from your own side had shot him. Mistake. Accident. Incompetence. Didn't matter. Peter was bleeding. Might die. From English steel. Not French.</p>
                   
                   <p>Men rushed to him. Grabbed the arrow. Had to get it out. Peter screamed again. The sound cutting through everything. High. Terrified. Pain and fear mixed. They pulled. The arrow came free. Barbed head tearing flesh. More blood. Too much blood. Someone pressed cloth to the wound. Trying to stop it. But it kept coming. Pulsing. Red. Hot.</p>
                   
                   <p>The archer who'd shot came forward. Young. Pale. Shaking. I didn't mean. I thought. He couldn't finish. The words failing. What could he say. He'd shot a friend. Might have killed him. Sorry didn't cover it. Nothing covered it. This was the reality. More soldiers died from accidents than from enemy action. Friendly fire. Disease. Bad water. The war killed you in so many ways. The French were almost the least of your worries.</p>
                   
                   <p>Peter was conscious. Staring at the sky. His breathing shallow. Rapid. Going into shock. The surgeon would need to see him. If there was time. If he could be moved. If infection didn't set in first. Too many ifs. But this was it. The randomness. The chaos. The way everything could change in a heartbeat. One moment fine. Next moment bleeding. Dying. Because some fool couldn't tell friend from foe in the heat of movement.</p>
                   
                   <p>The sergeant was shouting. At the archer. At everyone. Demanding to know how this happened. But there was no good answer. Mistakes happened. In war they happened constantly. Usually they just weren't this costly. Usually they didn't nearly kill your friends. You looked at Peter. At the blood. At his pale face. And wondered when your own mistake would come. When you'd be the one bleeding in the dirt. From an arrow. From a blade. From anything. Everything. All of it waiting to kill you.</p>`;
        },
        choices: [
            {
                text: "Help with Peter—he needs you",
                effects: { reputation: 2, stress: 1 },
                nextScene: "comrade_aided"
            },
            {
                text: "Confront the archer—this can't happen again",
                effects: { reputation: 1 },
                requiresResolution: true,
                resolutionStat: "charisma",
                resolutionDifficulty: 6,
                nextScene: "discipline_enforced"
            },
            {
                text: "Report to the sergeant—let him handle it",
                effects: { wits: 1 },
                nextScene: "official_response"
            },
            {
                text: "Walk away—you can't handle this",
                effects: { stress: -1, morale: -2 },
                nextScene: "emotional_retreat"
            }
        ]
    },
    
    looted_church: {
        title: "The Desecrated Chapel",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            return `<p>The church had been looted. Recently. The doors hung open. Broken. Inside was chaos. Pews overturned. Altar stripped. Candlesticks gone. Everything of value taken. Everything sacred defiled. This was what soldiers did. When they got the chance. When there was no one to stop them.</p>
                   
                   <p>You stepped inside. The air was still. Heavy. As if the building itself mourned. As if God had abandoned this place. Or maybe He'd never been here. Maybe churches were just buildings. Stone and wood. No more sacred than any other structure. You didn't know. Didn't know what you believed anymore. About God. About faith. About anything.</p>
                   
                   <p>Someone had defecated on the altar. A final insult. A final desecration. You looked at it. At the mess. At the disrespect. And felt nothing. Or maybe you felt too much. Too many things. Guilt. Shame. Anger. Disgust. All of it mixed together. Indistinguishable. Just a weight. A burden. Another thing to carry.</p>
                   
                   <p>There was still value here. If you looked. Hidden things. Things the looters missed. Or things they left behind. Too heavy. Too obvious. Too risky. You could take them. Add to your plunder. Your wealth. Or you could leave them. Respect the place. Even if others hadn't. Even if it didn't matter. Even if God wasn't watching.</p>
                   
                   <p>You stood in the ruined church. Thinking about what it meant. About what you'd become. About whether you could still call yourself a Christian. After everything you'd done. After everything you'd seen. After standing in a looted church and considering taking what little remained. The answer didn't come. Maybe it never would.</p>`;
        },
        choices: [
            {
                text: "Take what remains—it's already been looted",
                effects: { wealth: 2, morale: -1, reputation: -1 },
                nextScene: "church_plundered"
            },
            {
                text: "Leave it—some things shouldn't be touched",
                effects: { morale: 1, reputation: 1 },
                nextScene: "respect_shown"
            },
            {
                text: "Try to restore some order",
                effects: { reputation: 2, endurance: -1 },
                nextScene: "restoration_attempted"
            },
            {
                text: "Pray for forgiveness—for all of us",
                effects: { morale: 2, stress: -1 },
                nextScene: "prayer_offered"
            }
        ]
    },
    
    cookfire_conversation: {
        title: "What We Fight For",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            return `<p>The question came out of nowhere. Jack asked it. Staring into the fire. His voice quiet. Why are we here. Really. What are we fighting for. The words hung in the air. Heavy. Dangerous. The kind of question that could get you beaten. Or worse. But no officers were around. Just soldiers. So the question remained. Unanswered. Waiting.</p>
                   
                   <p>For the king, someone said. Halfhearted. Not believing it. For England, another offered. But that rang hollow too. England was far away. Didn't know you existed. Didn't care what happened to you. For plunder then. That was honest at least. But even plunder seemed insufficient. Not enough to justify the misery. The death. Everything.</p>
                   
                   <p>Old Robert spoke up. His voice steady. Been through this before. We fight because we're here. Because we signed up. Because deserting means dying. Because the man next to you depends on you. Because tomorrow there'll be another battle. Another march. And we'll do it. Because that's what we do. That's all there is.</p>
                   
                   <p>The answer wasn't satisfying. But it was true. You didn't fight for grand ideas. For king or country or God. You fought because you were here. Because stopping meant death. Because the alternative to fighting was lying down. Giving up. And you weren't ready for that. Not yet. So you kept going. Kept fighting. Kept surviving. One day at a time.</p>
                   
                   <p>Jack nodded slowly. Accepting it. The fire crackled. Someone added wood. Sparks flew up into darkness. The conversation moved on. To other things. But the question remained. In your mind. In your heart. Why are you here. What are you fighting for. You didn't have a good answer. Maybe there wasn't one. Maybe you just had to keep going. Keep fighting. Until it ended. However it ended.</p>`;
        },
        choices: [
            {
                text: "For England—believe in something",
                effects: { morale: 2 },
                nextScene: "patriotism_affirmed"
            },
            {
                text: "For survival—that's all that matters",
                effects: { wits: 1, morale: -1 },
                nextScene: "pragmatism_accepted"
            },
            {
                text: "For your comrades—the only truth",
                effects: { reputation: 2, morale: 1 },
                nextScene: "brotherhood_found"
            },
            {
                text: "You don't know anymore",
                effects: { stress: 2 },
                nextScene: "purpose_lost"
            }
        ]
    },
    
    brewing_trouble: {
        title: "The Stolen Rations",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            const name = gameState.characterName || "Soldier";
            return `<p>Your rations were gone. You'd left them by your bedroll. Turned your back for five minutes. Now gone. Stolen. In a camp of thieves that shouldn't be surprising. But it was your food. Your survival. And someone had taken it. The anger came hot. Fast. Overwhelming.</p>
                   
                   <p>You looked around. Trying to see who. Trying to catch guilt on someone's face. But everyone was busy. Doing their own things. No one met your eyes. No one showed any sign. This was the problem with thieves. They looked like everyone else. Acted like everyone else. Until they took what wasn't theirs.</p>
                   
                   <p>Will came over. Saw your face. What's wrong, he asked. You told him. Stolen rations. His expression darkened. That's serious, he said. Men have been whipped for less. Hanged even. If you caught whoever did it. If you had proof. But proof was hard. Evidence scarce. Just your word against theirs.</p>
                   
                   <p>You had options. Accuse the most likely suspect. The new man. The one everyone distrusted. Whether he did it or not he'd be the easiest to blame. Or search. Go through everyone's gear. Demand to inspect. See who objected. Who resisted. Or let it go. Take the loss. Find food elsewhere. Avoid confrontation. Each choice had consequences. Each carried risks.</p>
                   
                   <p>${name}, Will said. His voice low. Serious. Be careful. Accusations in camp can turn ugly. Fast. Men are on edge. Hungry. Desperate. Push the wrong person. Say the wrong thing. It could explode. Could get someone hurt. Could get you hurt. Think before you act. But also. Also don't let people think you're soft. Can be stolen from. That brings its own problems.</p>`;
        },
        choices: [
            {
                text: "Accuse the new man—everyone suspects him anyway",
                effects: { wealth: 2, reputation: -1 },
                requiresResolution: true,
                resolutionStat: "charisma",
                resolutionDifficulty: 6,
                nextScene: "accusation_made"
            },
            {
                text: "Search everyone's gear",
                effects: { reputation: -2, wits: 1 },
                nextScene: "search_conducted"
            },
            {
                text: "Let it go—not worth the trouble",
                effects: { stress: 1, reputation: -1 },
                nextScene: "theft_accepted"
            },
            {
                text: "Set a trap—catch the thief next time",
                effects: { wits: 2 },
                nextScene: "trap_set"
            }
        ]
    },
    
    refugee_column: {
        title: "The Displaced",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            return `<p>They came down the road. Hundreds of them. French peasants. Fleeing. Carts piled high with belongings. Children crying. Old people struggling to keep up. Animals driven before them. Everything they owned. Everything they were. Reduced to what they could carry. What they could save. From the war. From you.</p>
                   
                   <p>They saw your column. English soldiers. Some stopped. Paralyzed by fear. Others tried to turn back. To run. But there was nowhere to go. The road was narrow. The forest thick. They were trapped. Between your army and whatever they were fleeing. Caught in the middle. Like so many others. Like everyone in France.</p>
                   
                   <p>The captain rode forward. Raised his hand. We're not here for you, he called. In broken French. Keep moving. We won't harm you. Keep moving. Some believed him. Continued forward. Others remained frozen. Certain this was a trap. Certain English soldiers meant death. They weren't entirely wrong. Your army had killed plenty of civilians. Burned their homes. Destroyed their lives. Why should these people trust you.</p>
                   
                   <p>A woman approached. Older. Gray hair. She carried a child. An infant. The baby was crying. Weak. Sick maybe. The woman's eyes were desperate. Please, she said. In French you could barely understand. Please help. The baby needs. She gestured. Made motions. Eating. Drinking. The baby needed food. Needed water. Needed help she couldn't provide.</p>
                   
                   <p>You had rations. Not much. But some. Enough to share. Enough to help one child. One family. But there were hundreds here. Thousands maybe. You couldn't help them all. Couldn't save everyone. But you could help one. This woman. This child. Or you could pass by. Save your rations. For yourself. For your own survival. The choice was yours. The woman waited. The baby cried. And the refugee column flowed past. Rivers of suffering. Displacement. The cost of war paid by those who never chose it.</p>`;
        },
        choices: [
            {
                text: "Give her food—help who you can",
                effects: { wealth: -1, morale: 2, reputation: 1 },
                nextScene: "mercy_given"
            },
            {
                text: "Share water at least",
                effects: { morale: 1 },
                nextScene: "small_kindness"
            },
            {
                text: "Keep moving—you can't help everyone",
                effects: { stress: 2 },
                nextScene: "hardened_heart"
            },
            {
                text: "Organize help from your unit",
                effects: { reputation: 3, wealth: -2 },
                requiresResolution: true,
                resolutionStat: "charisma",
                resolutionDifficulty: 7,
                nextScene: "collective_mercy"
            }
        ]
    },
    
    market_day: {
        title: "The Country Market",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            const wealth = gameState.stats.wealth || 0;
            return `<p>The village had a market. Small. But functioning. Despite the war. Despite everything. People still needed to trade. To buy. To sell. Life continued. In its small stubborn ways. The market was proof. That humanity endured. That commerce survived. That not everything was destroyed by war.</p>
                   
                   <p>Stalls lined the square. Selling what little there was. Bread. Cheese. Vegetables. Some cloth. Tools. The goods were meager. Prices inflated. War did that. Made everything scarce. Made everything expensive. But people came anyway. Needed these things. Would pay what they must.</p>
                   
                   <p>The vendors eyed you warily. English soldier. Foreigner. Potential troublemaker. But also potential customer. You had coins. ${wealth} shillings. Enough to buy. If prices were fair. If you wanted to trade with the enemy. If you could stomach the irony of buying French bread while burning French fields.</p>
                   
                   <p>One vendor was bolder. Called to you. Good prices for soldiers. Fair trade. No trouble. He spoke some English. Learned it from necessity. From months of English occupation. He wasn't friendly. But he was practical. Business was business. War or no war. Money was money. And he needed to eat too.</p>
                   
                   <p>You looked at his goods. Fresh bread. Real vegetables. Things you hadn't seen in weeks. The temptation was strong. Your rations were stale. Moldy. These were fresh. Real. But buying from them. Trading with the enemy. Supporting their economy. It felt wrong. Complicated. Everything was complicated in war. Even simple things like buying bread.</p>`;
        },
        choices: [
            {
                text: "Buy food—you're hungry (2 shillings)",
                effects: { wealth: -2, morale: 2 },
                nextScene: "food_purchased"
            },
            {
                text: "Try to haggle—war has made you poor",
                effects: { wits: 1 },
                requiresResolution: true,
                resolutionStat: "charisma",
                resolutionDifficulty: 6,
                nextScene: "bargain_struck"
            },
            {
                text: "Don't buy—stick with rations",
                effects: { morale: -1 },
                nextScene: "purchase_refused"
            },
            {
                text: "Take what you want—you're the one with the sword",
                effects: { wealth: 2, reputation: -3 },
                nextScene: "market_robbed"
            }
        ]
    },
    
    patron_camp_arrival: {
        title: "Arrival at Camp",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            const name = gameState.characterName || "Soldier";
            const patron = gameState.patron;
            
            if (patron === 'james_olooney') {
                return `<p>The camp was chaos. Men drinking. Fighting. Laughing. The smell of smoke. Of blood. Of unwashed bodies. O'Looney's company. You'd heard the stories. But seeing it. Being in it. That was different.</p>
                       
                       <p>Sir James sat on a barrel. A cup in his hand. Wine. Or blood. Hard to tell. He watched you. Grinned. Welcome to the company, he said. His voice was rough. Harsh. Like broken glass. You'll earn your keep. Or you'll die trying. Either way. We profit.</p>
                       
                       <p>Around you men sharpened blades. Counted coins. Argued over plunder. A man lay in the mud. Drunk. Or dead. No one checked. No one cared. This was what you'd signed up for. This was what you'd get.</p>`;
            } else if (patron === 'lord_david') {
                return `<p>The camp was orderly. Tents in rows. Fires controlled. Men at their duties. Sir David's household. Small. But well-run. You could see the care. The attention to detail. The concern for the men.</p>
                       
                       <p>Sir David approached. His manner was quiet. Reserved. But his eyes were kind. Welcome, he said. You'll find your place here. We look after our own. His words were simple. But they meant something. In a world where men were expendable. He saw you. As a person. Not just a number.</p>
                       
                       <p>Around you men worked. Trained. Prepared. There was discipline. But not fear. Respect. But not terror. This was different. This was something you could live with.</p>`;
            } else if (patron === 'duke_caley') {
                return `<p>The camp was large. Impressive. Baron Caley's household. You could see the wealth. The power. The influence. Tents of fine cloth. Horses well-fed. Men well-equipped. This was a lord who had resources. And he used them.</p>
                       
                       <p>The baron sat in his tent. Surrounded by maps. By advisors. By the trappings of command. He didn't look up when you entered. Didn't acknowledge you. You were a number. A tool. That was all. One of his men spoke. Explained your role. The baron nodded. Dismissed you. Without a word. Without a glance.</p>
                       
                       <p>You were useful. Or you weren't. That was all that mattered. That was all there was.</p>`;
            } else if (patron === 'count_charles') {
                return `<p>The camp smelled of wine. Of ale. Of men who'd given up on sobriety. Count Charles's household. English men. Far from home. In France. Looking for land. For glory. For something to call their own.</p>
                       
                       <p>The count sat by a fire. A cup in his hand. Always a cup. Wine. Ale. Something. He looked older than his years. Weathered. Worn. But his eyes still had fire. Still had the look of a man who'd seen battle. Who'd led men. Who'd won. And lost.</p>
                       
                       <p>Welcome, he said. His voice was rough. From drink. From years. From too much of everything. You're English. That's good. We stick together here. In this foreign land. We look after our own.</p>`;
            } else if (patron === 'ashkhan') {
                return `<p>The camp was different. Disciplined. Orderly. But not rigid. There was a rhythm. A purpose. Ashkhan's company. Men from the Levant. From the East. Where war was an art. Where tactics mattered. Where discipline was everything.</p>
                       
                       <p>Ashkhan approached. His bearing was confident. But not arrogant. His eyes were sharp. Intelligent. He looked at you. Really looked. Saw more than most would. You're new, he said. His accent was foreign. But his English was clear. You'll learn. If you're willing. If you can keep up.</p>
                       
                       <p>His men watched. Assessed. They were professionals. Veterans. They'd seen war. Real war. The kind that breaks men. The kind that makes them. They'd survived. Together. That meant something.</p>`;
            } else {
                return `<p>The camp stretched before you. Your new home. Your new life. Men moved about their duties. Preparing. Waiting. For whatever came next.</p>`;
            }
        },
        choices: [
            {
                text: "Find your place in the company",
                effects: { morale: 1 },
                nextScene: "camp_settled"
            },
            {
                text: "Observe the men and their ways",
                effects: { wits: 1 },
                nextScene: "camp_observed"
            },
            {
                text: "Introduce yourself to your comrades",
                effects: { reputation: 1 },
                nextScene: "introductions_made"
            }
        ]
    },
    
    patron_before_battle: {
        title: "The Order Comes",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            const patron = gameState.patron;
            
            if (patron === 'james_olooney') {
                return `<p>O'Looney stood before the company. His eyes were bright. Wild. The look of a man who's given up on everything but the taking. We ride at dawn, he said. The French have coin. They have goods. They have women. We'll take it all. Leave nothing but ash.</p>
                       
                       <p>His men cheered. Or growled. Hard to tell the difference. You felt your stomach tighten. This wasn't war. This was something else. Something darker. But you'd taken the coin. You'd made the choice. There was no going back now.</p>`;
            } else if (patron === 'lord_david') {
                return `<p>Sir David gathered his men. His voice was calm. Steady. We'll fight, he said. When we must. But we'll fight smart. We'll fight together. And we'll come home. Together.</p>
                       
                       <p>He looked at each man. Met each eye. You could see the weight on him. The responsibility. The care. He didn't want to lose anyone. But he knew he might. The knowledge was there. In his eyes. In the way he spoke. But he'd do everything he could. To bring them home.</p>`;
            } else if (patron === 'duke_caley') {
                return `<p>Baron Caley addressed the company. From his horse. High above. His voice carried. But there was no warmth. No care. Just orders. Just plans. Just the business of war.</p>
                       
                       <p>We march tomorrow, he said. The French hold lands that should be ours. We'll take them. By force. By fire. By whatever means necessary. Those who serve well will be rewarded. Those who don't will be replaced.</p>
                       
                       <p>Simple. Direct. Cold. That was his way. That was how he led. You were a tool. A weapon. Expendable. Replaceable. But if you were good. If you were useful. The rewards would be great.</p>`;
            } else if (patron === 'count_charles') {
                return `<p>The count stood before his men. For a moment. Just a moment. The drink was set aside. The old commander was there. In his eyes. In his bearing. In the way he spoke.</p>
                       
                       <p>We fight tomorrow, he said. For England. For ourselves. For the lands we'll claim. His voice was strong. Clear. The voice of the man he'd been. Before the drink. Before the years. Before the losses. We fight together. We win together. Or we die together.</p>
                       
                       <p>Then the moment passed. The cup was back in his hand. The drink took over. But the men remembered. The old commander. The man he'd been. They'd follow him. Out of respect. Out of loyalty. Out of memory.</p>`;
            } else if (patron === 'ashkhan') {
                return `<p>Ashkhan gathered his men. Not from a horse. Not from a tent. On the ground. With them. Equal. Or as equal as a commander could be. He spoke. Explained. The plan. The tactics. The why behind the what.</p>
                       
                       <p>We fight like this, he said. Drawing in the dirt. Showing movements. Positions. Not because it's how we've always done it. But because it works. Because it keeps men alive. Because it wins battles.</p>
                       
                       <p>His men listened. Nodded. Understood. This was how they fought. This was why they survived. Tactics. Discipline. Skill. Not just numbers. Not just brute force. But the art of war. The craft of it.</p>`;
            } else {
                return `<p>The order came down. Battle tomorrow. Men prepared. Checked weapons. Said prayers. Or didn't. Each in their own way. Getting ready for what was coming.</p>`;
            }
        },
        choices: [
            {
                text: "Prepare your weapons",
                effects: { initiative: 1 },
                nextScene: "battle_prepared"
            },
            {
                text: "Rest while you can",
                effects: { endurance: 1 },
                nextScene: "rest_taken"
            },
            {
                text: "Talk with your comrades",
                effects: { morale: 1 },
                nextScene: "comrades_comforted"
            }
        ]
    },
    
    patron_after_battle: {
        title: "After the Fighting",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            const patron = gameState.patron;
            
            if (patron === 'james_olooney') {
                return `<p>The plunder was rich. More than you'd seen in months. Gold. Silver. Goods. O'Looney laughed. Tossed you a purse. Heavy with coin. See, he said. This is what we do. This is who we are. You're one of us now. Whether you like it or not.</p>
                       
                       <p>The coin felt wrong in your hands. But it was real. It was yours. You'd earned it. In blood. In fire. In things you'd rather forget. But the coin was real. And that was something.</p>`;
            } else if (patron === 'lord_david') {
                return `<p>The battle was won. But men were wounded. Dead. Sir David moved among them. Checked on each. Spoke to each. His face was grim. But his manner was gentle. He'd lost men. But he'd saved more. That was the trade. That was the cost.</p>
                       
                       <p>He found you. Clapped your shoulder. You fought well, he said. I'm glad you're with us. The words were simple. But they meant something. In a world of death. Of loss. Of war. They meant something.</p>`;
            } else if (patron === 'duke_caley') {
                return `<p>The victory was won. The plunder was rich. Baron Caley's men shared in the spoils. As promised. The coin flowed. The goods were distributed. Fairly. According to service. According to worth.</p>
                       
                       <p>You received your share. More than you'd expected. The baron kept his word. When it suited him. When you were useful. That was the trade. That was the deal. Service for reward. Nothing more. Nothing less.</p>`;
            } else if (patron === 'count_charles') {
                return `<p>The battle was won. Men were dead. Wounded. The count sat by the fire. Drinking. Always drinking. His face was grim. Haunted. You could see the ghosts. In his eyes. The men he'd lost. The battles he'd fought. The things he'd seen.</p>
                       
                       <p>He raised his cup. To the dead, he said. To the living. To those who'll die tomorrow. His voice was bitter. Angry. At the war. At the drink. At himself. You could see the pain. The regret. The weight of it all.</p>
                       
                       <p>But he'd fight again. Tomorrow. Or the next day. He'd lead. He'd command. He'd drink. Until the drink took him. Or the war did. Or something else. Until then. He'd fight. He'd lead. He'd drink. That was his way.</p>`;
            } else if (patron === 'ashkhan') {
                return `<p>The battle was won. Cleanly. Efficiently. With minimal losses. Ashkhan moved among his men. Checked on each. Spoke to each. In their own language. Or in gestures. Or in the universal language of men who've fought together.</p>
                       
                       <p>You fought well, he said to you. In English. Clear. Direct. You learn quickly. That's good. We need men who learn. Who adapt. Who think. Not just men who swing swords.</p>
                       
                       <p>His approval meant something. More than coin. More than plunder. It was respect. From a man who'd earned it. Who'd proven himself. In war. In command. In the ways that mattered. That meant something. In this world. In this war. That meant everything.</p>`;
            } else {
                return `<p>The battle ended. Men tended wounds. Counted the dead. Shared what plunder there was. Life went on. As it always did. After the fighting.</p>`;
            }
        },
        choices: [
            {
                text: "Tend to the wounded",
                effects: { reputation: 1, morale: 1 },
                nextScene: "wounded_cared_for"
            },
            {
                text: "Collect your share of plunder",
                effects: { wealth: 2 },
                nextScene: "plunder_collected"
            },
            {
                text: "Rest and recover",
                effects: { endurance: 1, stress: -1 },
                nextScene: "rest_earned"
            }
        ]
    },
    
    patron_camp_discipline: {
        title: "The Way Things Are",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            const patron = gameState.patron;
            const name = gameState.characterName || "Soldier";
            
            if (patron === 'james_olooney') {
                return `<p>A man had broken the rules. Stolen from another. Not allowed. Even among thieves there were rules. O'Looney made an example of him. Public. Brutal. The man screamed. Then stopped. The message was clear. Break the rules. Pay the price.</p>
                       
                       <p>You watched. Felt sick. But you didn't look away. This was the company you'd joined. This was what they were. What you were becoming. The question was whether you could live with it. Whether you could become one of them. Or whether you'd break. And end up like that man. Screaming. Then silent.</p>`;
            } else if (patron === 'lord_david') {
                return `<p>Two men had fought. Over rations. Over nothing really. Sir David called them before the company. His voice was calm. But firm. We are brothers here, he said. We depend on each other. This cannot happen again.</p>
                       
                       <p>He didn't punish them harshly. Just made them work together. Share duties. Learn to trust. It was a different way. A better way. You could see the respect in the men's eyes. They followed him not from fear. But from something else. Something better.</p>`;
            } else if (patron === 'duke_caley') {
                return `<p>A man had failed. In battle. Let the enemy through. Baron Caley didn't care about excuses. Didn't care about reasons. Only results. The man was demoted. Stripped of privileges. Made an example. Others watched. Learned. Failure wasn't tolerated. Success was rewarded. That was the system. That was how it worked.</p>
                       
                       <p>You understood. The baron was fair. In his way. He rewarded service. Punished failure. No sentiment. No second chances. Just results. You'd do well to remember that. To never fail. To always be useful. Or you'd end up like that man. Demoted. Disgraced. Forgotten.</p>`;
            } else if (patron === 'count_charles') {
                return `<p>The count was drunk. Again. Shouting orders. Contradicting himself. The men looked to each other. Uncertain. The old commander was gone. Buried under wine. Under years. Under loss. What remained was this. A drunk. A shadow. A man who'd lost his way.</p>
                       
                       <p>But they followed him anyway. Out of loyalty. Out of memory. Out of the man he'd been. Before. They'd follow him to hell. If that's where he led them. Because once. Once he'd been great. Once he'd been worth following. And maybe. Maybe he could be again.</p>`;
            } else if (patron === 'ashkhan') {
                return `<p>A man had broken formation. Disobeyed orders. Put others at risk. Ashkhan didn't shout. Didn't threaten. Just explained. Calmly. Clearly. Why the formation mattered. Why discipline saved lives. Why his mistake could have killed them all.</p>
                       
                       <p>The man understood. Apologized. Not from fear. From understanding. From respect. Ashkhan accepted it. Gave him another chance. But made it clear. There wouldn't be a third. This was how he led. With respect. With teaching. But with firm boundaries. You learned. Or you left. That was the way.</p>`;
            } else {
                return `<p>Discipline was maintained. In whatever way your commander saw fit. Rules were rules. Orders were orders. You followed them. Or you didn't. And faced the consequences.</p>`;
            }
        },
        choices: [
            {
                text: "Learn from what you've seen",
                effects: { wits: 1 },
                nextScene: "lesson_learned"
            },
            {
                text: "Question the methods",
                effects: { stress: 1, wits: 1 },
                nextScene: "doubt_arises"
            },
            {
                text: "Accept it as the way things are",
                effects: { stress: -1 },
                nextScene: "acceptance"
            }
        ]
    },
    
    patron_plunder_distribution: {
        title: "Dividing the Spoils",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            const patron = gameState.patron;
            
            if (patron === 'james_olooney') {
                return `<p>The plunder was divided. O'Looney took his share. Largest. As was his right. Then the rest was split. Unevenly. Based on who he liked. Who'd fought hardest. Who'd killed most. Fairness wasn't the point. Power was. And he had it.</p>
                       
                       <p>You got your portion. Smaller than you'd hoped. But more than nothing. That was something. In this company you took what you could get. When you could get it. Tomorrow might be different. Tomorrow you might get more. Or you might get nothing. Or you might be dead. That was the way of it.</p>`;
            } else if (patron === 'lord_david') {
                return `<p>Sir David divided the plunder. Fairly. Equally. According to need as much as service. He took his share. But not more. Not like other lords. He believed in fairness. In treating his men right. Even when it cost him.</p>
                       
                       <p>You received your portion. Fair. Honest. What you'd earned. It wasn't as much as you might have gotten elsewhere. But it was yours. Earned. Deserved. And that meant something. More than coin. It meant respect. It meant you were valued. As a person. Not just a tool.</p>`;
            } else if (patron === 'duke_caley') {
                return `<p>Baron Caley's men shared in the spoils. As promised. The distribution was organized. Efficient. Based on rank. On service. On worth. Those who'd fought well got more. Those who hadn't got less. It was fair. In its way. Merit-based. Results-based.</p>
                       
                       <p>You received your share. Calculated precisely. Based on your contribution. Your performance. Your value. It was substantial. More than you'd expected. The baron rewarded service. As he'd said he would. He kept his word. When you were useful. That was the deal.</p>`;
            } else if (patron === 'count_charles') {
                return `<p>The plunder was divided. The count oversaw it. When he was sober enough. Which wasn't always. But his men were fair. They divided it themselves. According to custom. According to what was right. They'd been together long enough. To know how to do it. Without him.</p>
                       
                       <p>You got your share. Standard. Fair. What a man-at-arms could expect. Not more. Not less. Just what was due. The count's men looked after each other. Even when he couldn't. That was their way. Their bond. Forged over years. Over battles. Over shared hardship.</p>`;
            } else if (patron === 'ashkhan') {
                return `<p>Ashkhan divided the plunder. Methodically. Fairly. Based on contribution. On need. On what was right. He took his share. As commander. But not more than was fair. Not like some captains. He believed in fairness. In treating his men with respect.</p>
                       
                       <p>You received your portion. Calculated. Fair. Based on your service. Your skill. Your worth to the company. It was substantial. More than you'd expected. Ashkhan rewarded good service. As he'd said he would. His word was good. His methods fair. That was why men followed him. Why they stayed. Even when other companies offered more.</p>`;
            } else {
                return `<p>The plunder was divided. Each man received his share. According to custom. According to what was fair. Or what the commander decided. You took what you got. And were grateful for it.</p>`;
            }
        },
        choices: [
            {
                text: "Accept your share",
                effects: { morale: 1 },
                nextScene: "plunder_accepted"
            },
            {
                text: "Question the division",
                effects: { reputation: -1, stress: 1 },
                nextScene: "division_questioned"
            },
            {
                text: "Share with those who got less",
                effects: { reputation: 2, wealth: -1 },
                nextScene: "generosity_shown"
            }
        ]
    },
    
    patron_leadership_moment: {
        title: "A Test of Leadership",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location; },
        text: function() {
            const patron = gameState.patron;
            const name = gameState.characterName || "Soldier";
            
            if (patron === 'james_olooney') {
                return `<p>Crisis came. French cavalry. Outnumbered. Outflanked. The company could run. Or fight. O'Looney chose fight. Not from courage. From greed. The French had baggage. Coins. Goods. Worth dying for. Maybe.</p>
                       
                       <p>He rallied the men. Not with words. With promises. With the lure of plunder. Fight and we'll all be rich, he said. Run and we'll be poor. And dead anyway. The choice was simple. Fight. Or die running. They chose to fight.</p>
                       
                       <p>You fought. Because you had to. Because there was no choice. Because O'Looney had led you here. Into this. And now you'd see it through. Or die trying.</p>`;
            } else if (patron === 'lord_david') {
                return `<p>Crisis came. French forces. Larger. Better positioned. The company could fight. Or retreat. Sir David chose retreat. Not from cowardice. From wisdom. From care for his men. We'll fight another day, he said. On ground of our choosing. When the odds are better.</p>
                       
                       <p>Some men grumbled. Wanted glory. Wanted to fight. But they followed. Because they trusted him. Because he'd kept them alive this long. Because he'd earned that trust. Through care. Through wisdom. Through bringing them home.</p>
                       
                       <p>You retreated. With the others. Following Sir David's lead. Trusting his judgment. Hoping he was right. That there would be another day. Another fight. When the time was right.</p>`;
            } else if (patron === 'duke_caley') {
                return `<p>Crisis came. Opportunity. A French supply train. Vulnerable. Rich. The baron saw it. Calculated. Decided. We attack, he said. The risk is worth the reward. Those who fight well will be rewarded. Those who don't will be left behind.</p>
                       
                       <p>He didn't ask. Didn't consult. Just ordered. Just led. That was his way. Decisive. Confident. Right or wrong. He made the call. And men followed. Because he was the baron. Because he had power. Because he'd been right before. Often enough to trust.</p>
                       
                       <p>You followed. Into the attack. Into the risk. Because that was what you did. What you'd signed up for. To follow. To fight. To win. Or die trying.</p>`;
            } else if (patron === 'count_charles') {
                return `<p>Crisis came. French advance. Threatening the position. The count was drunk. Again. But something happened. The old commander surfaced. For a moment. Just a moment. But it was enough.</p>
                       
                       <p>He gave orders. Clear. Confident. The orders of a man who'd done this before. Who knew what to do. The men responded. Not to the drunk. To the commander. To the man he'd been. To the leader they remembered.</p>
                       
                       <p>You followed those orders. Because they were good. Because they made sense. Because for a moment. Just a moment. The count was himself again. The leader he'd been. Before the drink. Before the years. Before everything.</p>`;
            } else if (patron === 'ashkhan') {
                return `<p>Crisis came. Ambush. French forces. Hidden. Waiting. But Ashkhan saw it. Before it happened. His eyes. His experience. His tactical mind. He recognized the signs. The too-quiet road. The perfect ambush site. The trap.</p>
                       
                       <p>He didn't panic. Didn't rush. Just adjusted. Changed formation. Changed approach. Turned their trap into ours, he said. We'll hit them from the side. Where they're not expecting. Where they're vulnerable.</p>
                       
                       <p>You followed his lead. Trusted his judgment. His tactics. His experience. He'd been right before. Often. His methods worked. His leadership saved lives. You'd follow him. Into anything. Because you trusted him. Because he'd earned that trust.</p>`;
            } else {
                return `<p>Crisis came. Decisions had to be made. Orders given. Men led. You followed. As you always did. Hoping the leadership was sound. Hoping you'd survive. Hoping you'd see another day.</p>`;
            }
        },
        choices: [
            {
                text: "Follow the orders",
                effects: { reputation: 1 },
                nextScene: "orders_followed"
            },
            {
                text: "Question the decision",
                effects: { wits: 1, reputation: -1 },
                nextScene: "decision_questioned"
            },
            {
                text: "Trust your commander",
                effects: { morale: 1 },
                nextScene: "trust_shown"
            }
        ]
    },
    
    campfire_wat_01_the_sharpening: {
        title: "Campfire — The Sharpening",
        year: function() { return gameState.year; },
        age: function() { return gameState.age || 18; },
        location: "Camp",
        noCampfire: true, // Prevent recursion
        artwork: "artwork/campfire.jpg",
        artworkCaption: "Evening by the fire - a moment of rest and reflection",
        text: function () {
            const name = gameState.characterName || "Soldier";
            return `
                <p>The fire is low and mean. Smoke clings to your hair and the damp sits inside your sleeves like a second skin.</p>
                <p>Wat squats close to the coals with his sword across his knees. He works a whetstone along the edge in slow, patient strokes. The sound is small and ugly. Stone. Steel. A promise.</p>
                <p><strong>Wat:</strong> Keep your edge honest, ${name}. A blunt blade turns a clean kill into a wrestling match. A wrestling match turns into a grave.</p>
                <p>Across from him, The Cook watches the stew-pot as if it might try to escape. He stirs twice. Stops. Listens. Stirs once more.</p>
                <p><strong>The Cook:</strong> The fat is rising. That means it will taste like something, which is better than most days.</p>
                <p>Wat snorts without looking up.</p>
                <p><strong>Wat:</strong> Taste like ash, taste like pig, taste like nothing. It all turns to shit in your gut the same.</p>
            `;
        },
        choices: [
            { 
                text: "Ask Wat how he learned to fight like this.", 
                effects: { wits: 1, stress: 1 }, 
                nextScene: function() {
                    const next = (gameState.campfire && gameState.campfire.returnScene) || "start";
                    if (gameState.campfire) {
                        gameState.campfire.returnScene = null;
                    }
                    return next;
                }
            },
            { 
                text: "Say nothing. Warm your hands and listen.", 
                effects: { stress: -1 }, 
                nextScene: function() {
                    const next = (gameState.campfire && gameState.campfire.returnScene) || "start";
                    if (gameState.campfire) {
                        gameState.campfire.returnScene = null;
                    }
                    return next;
                }
            },
            { 
                text: "Trade a sharp remark with him, just to see if he bites.", 
                effects: { morale: 1, stress: 1 }, 
                nextScene: function() {
                    const next = (gameState.campfire && gameState.campfire.returnScene) || "start";
                    if (gameState.campfire) {
                        gameState.campfire.returnScene = null;
                    }
                    return next;
                }
            },
            { 
                text: "Watch The Cook instead. Ask what's in the pot.", 
                effects: { morale: 1 }, 
                nextScene: function() {
                    const next = (gameState.campfire && gameState.campfire.returnScene) || "start";
                    if (gameState.campfire) {
                        gameState.campfire.returnScene = null;
                    }
                    return next;
                }
            }
        ]
    },
    
    campfire_wat_02_the_rope: {
        title: "Campfire — The Rope",
        year: function() { return gameState.year; },
        age: function() { return gameState.age || 18; },
        location: "Camp",
        noCampfire: true, // Prevent recursion
        artwork: "artwork/campfire.jpg",
        artworkCaption: "Evening by the fire - a moment of rest and reflection",
        text: function () {
            const name = gameState.characterName || "Soldier";
            return `
                <p>Someone has strung a rope between two stakes near the wagons. Not for laundry. Not for tents. The knot is too careful for that.</p>
                <p>Men avoid looking at it. They glance and then look away, like it might look back.</p>
                <p>Wat spits into the dirt. He is always spitting, like the world keeps trying to crawl into his mouth.</p>
                <p><strong>Wat:</strong> Deserter's rope. Or thief's rope. Or unlucky bastard's rope. Doesn't matter. The rope's always hungry.</p>
                <p>The Cook kneels near the fire, mending a split in a canvas sack with neat, identical stitches.</p>
                <p><strong>The Cook:</strong> Hunger is predictable. Men are not.</p>
                <p>Wat laughs once. It is not a friendly sound.</p>
                <p><strong>Wat:</strong> You hear that, ${name}? Cook's got a philosophy. He'll stitch it into your ribs if you stand still.</p>
            `;
        },
        choices: [
            { 
                text: "Tell Wat a man runs when he has no other door.", 
                effects: { morale: 1, stress: 1 }, 
                nextScene: function() {
                    const next = (gameState.campfire && gameState.campfire.returnScene) || "start";
                    if (gameState.campfire) {
                        gameState.campfire.returnScene = null;
                    }
                    return next;
                }
            },
            { 
                text: "Agree with Wat: discipline is the only thing holding it together.", 
                effects: { morale: -1 }, 
                nextScene: function() {
                    const next = (gameState.campfire && gameState.campfire.returnScene) || "start";
                    if (gameState.campfire) {
                        gameState.campfire.returnScene = null;
                    }
                    return next;
                }
            },
            { 
                text: "Ask The Cook why he's so calm about it.", 
                effects: { wits: 1 }, 
                nextScene: function() {
                    const next = (gameState.campfire && gameState.campfire.returnScene) || "start";
                    if (gameState.campfire) {
                        gameState.campfire.returnScene = null;
                    }
                    return next;
                }
            },
            { 
                text: "Change the subject to tomorrow's march.", 
                effects: { stress: -1 }, 
                nextScene: function() {
                    const next = (gameState.campfire && gameState.campfire.returnScene) || "start";
                    if (gameState.campfire) {
                        gameState.campfire.returnScene = null;
                    }
                    return next;
                }
            }
        ]
    },
    
    campfire_wat_03_the_boy_king: {
        title: "Campfire — The Boy King",
        year: function() { return gameState.year; },
        age: function() { return gameState.age || 18; },
        location: "Camp",
        noCampfire: true, // Prevent recursion
        artwork: "artwork/campfire.jpg",
        artworkCaption: "Evening by the fire - a moment of rest and reflection",
        text: function () {
            const name = gameState.characterName || "Soldier";
            return `
                <p>A rider came through camp at dusk with news from somewhere important. You did not hear the message. You saw the way men leaned toward it anyway, thirsty for meaning.</p>
                <p>Wat pokes the fire until sparks leap and die.</p>
                <p><strong>Wat:</strong> They'll tell you it's for England. For the King. For God. They'll sing it pretty, like it's a hymn. But it's men with purses pointing men with spears.</p>
                <p>The Cook tastes the stew with the tip of a spoon. He frowns, adds a pinch of salt, and tastes again as if he is conducting a trial.</p>
                <p><strong>The Cook:</strong> Salt changes the whole pot. A little decision. A big outcome.</p>
                <p>Wat looks at him like he's seen a ghost.</p>
                <p><strong>Wat:</strong> Don't start, Cook. Don't start your little lessons.</p>
                <p><strong>The Cook:</strong> It is not a lesson. It is cooking.</p>
                <p>Wat looks back to you.</p>
                <p><strong>Wat:</strong> You still believe in it, ${name}? The grand story?</p>
            `;
        },
        choices: [
            { 
                text: "Say you believe. Better to have a story than none.", 
                effects: { morale: 1 }, 
                nextScene: function() {
                    const next = (gameState.campfire && gameState.campfire.returnScene) || "start";
                    if (gameState.campfire) {
                        gameState.campfire.returnScene = null;
                    }
                    return next;
                }
            },
            { 
                text: "Say Wat is right. It's about coin and power.", 
                effects: { wits: 1, morale: -1 }, 
                nextScene: function() {
                    const next = (gameState.campfire && gameState.campfire.returnScene) || "start";
                    if (gameState.campfire) {
                        gameState.campfire.returnScene = null;
                    }
                    return next;
                }
            },
            { 
                text: "Say you don't know. You're here now. That's enough.", 
                effects: { stress: -1 }, 
                nextScene: function() {
                    const next = (gameState.campfire && gameState.campfire.returnScene) || "start";
                    if (gameState.campfire) {
                        gameState.campfire.returnScene = null;
                    }
                    return next;
                }
            },
            { 
                text: "Ask what Wat thinks happens to men who stop believing.", 
                effects: { wits: 1, stress: 1 }, 
                nextScene: function() {
                    const next = (gameState.campfire && gameState.campfire.returnScene) || "start";
                    if (gameState.campfire) {
                        gameState.campfire.returnScene = null;
                    }
                    return next;
                }
            }
        ]
    },
    
    campfire_wat_04_the_dead_mules: {
        title: "Campfire — The Dead Mules",
        year: function() { return gameState.year; },
        age: function() { return gameState.age || 18; },
        location: "Camp",
        noCampfire: true, // Prevent recursion
        artwork: "artwork/campfire.jpg",
        artworkCaption: "Evening by the fire - a moment of rest and reflection",
        text: function () {
            return `
                <p>There is a smell near the picket line where the animals stand. Not all of them are standing. War eats beasts too.</p>
                <p>Wat sits with his back to a wagon wheel, chewing something that might be bread if you squint.</p>
                <p><strong>Wat:</strong> Men think battles decide wars. It's mules. It's oats. It's boots that don't rot off your feet. That's what decides it.</p>
                <p>The Cook holds up a strip of salted meat to the firelight, inspecting it like a jeweler.</p>
                <p><strong>The Cook:</strong> If you boil it long enough, you can pretend it is tender.</p>
                <p><strong>Wat:</strong> Pretend's all this is half the time.</p>
            `;
        },
        choices: [
            { 
                text: "Offer to help The Cook tomorrow. Fetch water, chop wood.", 
                effects: { morale: 1 }, 
                nextScene: function() {
                    const next = (gameState.campfire && gameState.campfire.returnScene) || "start";
                    if (gameState.campfire) {
                        gameState.campfire.returnScene = null;
                    }
                    return next;
                }
            },
            { 
                text: "Ask Wat how he keeps going when it's like this.", 
                effects: { stress: -1 }, 
                nextScene: function() {
                    const next = (gameState.campfire && gameState.campfire.returnScene) || "start";
                    if (gameState.campfire) {
                        gameState.campfire.returnScene = null;
                    }
                    return next;
                }
            },
            { 
                text: "Complain about rations and the march.", 
                effects: { morale: -1, stress: 1 }, 
                nextScene: function() {
                    const next = (gameState.campfire && gameState.campfire.returnScene) || "start";
                    if (gameState.campfire) {
                        gameState.campfire.returnScene = null;
                    }
                    return next;
                }
            },
            { 
                text: "Make a joke about mules outranking soldiers.", 
                effects: { morale: 1 }, 
                nextScene: function() {
                    const next = (gameState.campfire && gameState.campfire.returnScene) || "start";
                    if (gameState.campfire) {
                        gameState.campfire.returnScene = null;
                    }
                    return next;
                }
            }
        ]
    },
    
    campfire_wat_05_the_prayer: {
        title: "Campfire — The Prayer",
        year: function() { return gameState.year; },
        age: function() { return gameState.age || 18; },
        location: "Camp",
        noCampfire: true, // Prevent recursion
        artwork: "artwork/campfire.jpg",
        artworkCaption: "Evening by the fire - a moment of rest and reflection",
        text: function () {
            const name = gameState.characterName || "Soldier";
            return `
                <p>Somewhere down the line a man is praying. Quietly. Not for victory. Not for glory. Just for the morning.</p>
                <p>Wat watches the shadows as if they owe him money.</p>
                <p><strong>Wat:</strong> Prayer won't stop a blade. But men pray anyway. Like God's got time for the likes of us.</p>
                <p>The Cook is arranging pebbles in a careful little row beside the pot. Small. Medium. Small. Medium. Like a pattern that calms him.</p>
                <p><strong>The Cook:</strong> People do it because it gives their hands a place to go.</p>
                <p><strong>Wat:</strong> My hands go on a hilt.</p>
                <p><strong>The Cook:</strong> And mine go on a ladle. We all have our ritual.</p>
                <p>Wat turns to you.</p>
                <p><strong>Wat:</strong> What about you, ${name}? You got a ritual? Or are you just waiting to die?</p>
            `;
        },
        choices: [
            { 
                text: "Say you pray. Quietly. For the morning.", 
                effects: { morale: 1, stress: -1 }, 
                nextScene: function() {
                    const next = (gameState.campfire && gameState.campfire.returnScene) || "start";
                    if (gameState.campfire) {
                        gameState.campfire.returnScene = null;
                    }
                    return next;
                }
            },
            { 
                text: "Say you don't pray. You prepare.", 
                effects: { wits: 1 }, 
                nextScene: function() {
                    const next = (gameState.campfire && gameState.campfire.returnScene) || "start";
                    if (gameState.campfire) {
                        gameState.campfire.returnScene = null;
                    }
                    return next;
                }
            },
            { 
                text: "Say you don't know what you believe anymore.", 
                effects: { stress: 1 }, 
                nextScene: function() {
                    const next = (gameState.campfire && gameState.campfire.returnScene) || "start";
                    if (gameState.campfire) {
                        gameState.campfire.returnScene = null;
                    }
                    return next;
                }
            },
            { 
                text: "Deflect with humor. Better laughing than trembling.", 
                effects: { morale: 1, stress: 1 }, 
                nextScene: function() {
                    const next = (gameState.campfire && gameState.campfire.returnScene) || "start";
                    if (gameState.campfire) {
                        gameState.campfire.returnScene = null;
                    }
                    return next;
                }
            }
        ]
    },
    
    campfire_cook_01_onions_and_names: {
        title: "Campfire — Onions and Names",
        location: "Camp",
        text: function () {
            const name = gameState.characterName || "Soldier";
            return `
                <p>The Cook is cutting onions with a small knife that has seen too many hands. His slices are thin and identical, as if he is measuring time.</p>
                <p><strong>The Cook:</strong> Onions keep if you hang them. Not in damp. Damp makes everything soft.</p>
                <p>Wat is nearby, arguing with his own bootlaces.</p>
                <p><strong>Wat:</strong> This whole country's damp. France is damp. Normandy's damp. Hell's probably damp.</p>
                <p>The Cook looks up at you.</p>
                <p><strong>The Cook:</strong> ${name}. Is that your real name?</p>
                <p>Wat barks a laugh.</p>
                <p><strong>Wat:</strong> Don't answer him. He'll put it in the stew. He'll remember it forever.</p>
                <p><strong>The Cook:</strong> I remember things that are true. It helps with the cooking. It helps with people.</p>
            `;
        },
        choices: [
            { text: "Tell The Cook the name you were called at home.", effects: { morale: 1 }, nextScene: "start" },
            { text: "Lie. Give him a cleaner name than the one you earned.", effects: { stress: 1 }, nextScene: "start" },
            { text: "Ask The Cook where he learned to cook for soldiers.", effects: { wits: 1 }, nextScene: "start" },
            { text: "Tell Wat to stop heckling him.", effects: { morale: 1, stress: 1 }, nextScene: "start" }
        ]
    },
    
    campfire_cook_02_the_bread_story: {
        title: "Campfire — The Bread Story",
        location: "Camp",
        text: function () {
            return `
                <p>The Cook has managed bread. Not good bread. Camp bread. But bread all the same. It comes out dark and heavy, like a stone you can chew.</p>
                <p><strong>The Cook:</strong> It is not ruined. It is finished.</p>
                <p>Wat breaks a piece, tests it with his teeth, and makes a face.</p>
                <p><strong>Wat:</strong> Christ. You could build a wall with this.</p>
                <p><strong>The Cook:</strong> Walls are useful.</p>
                <p>He offers you a piece before he eats. That is a small kindness in a world that forgets kindness.</p>
            `;
        },
        choices: [
            { text: "Share your piece with Wat, even if he doesn't deserve it.", effects: { morale: 1 }, nextScene: "start" },
            { text: "Eat it yourself. You'll need the strength tomorrow.", effects: { stress: -1 }, nextScene: "start" },
            { text: "Trade it away for something better if you can.", effects: { wealth: 1 }, nextScene: "start" },
            { text: "Ask The Cook what bread was like where he came from.", effects: { wits: 1 }, nextScene: "start" }
        ]
    },
    
    campfire_cook_03_counting_buttons: {
        title: "Campfire — Counting Buttons",
        location: "Camp",
        text: function () {
            return `
                <p>The Cook sits with a shirt in his lap, counting buttons under his breath as he sews. One. Two. Three. Pause. Four. Five. He touches each one like it is an oath.</p>
                <p>Wat watches him and shakes his head, disgusted by any calm he doesn't understand.</p>
                <p><strong>Wat:</strong> Look at him. Counting like it'll save him. Like a button's going to stop a lance.</p>
                <p><strong>The Cook:</strong> Counting keeps my hands steady.</p>
                <p><strong>Wat:</strong> Your hands should be holding a spear.</p>
                <p><strong>The Cook:</strong> Your hands are already holding enough spears for the both of us.</p>
                <p>Wat's jaw tightens. He looks at you like you've been asked to judge a fight.</p>
            `;
        },
        choices: [
            { text: "Tell Wat to leave him be. The Cook keeps you alive too.", effects: { morale: 1, stress: 1 }, nextScene: "start" },
            { text: "Laugh along with Wat. Safer than being the target.", effects: { morale: -1 }, nextScene: "start" },
            { text: "Ask The Cook what he's counting for, exactly.", effects: { wits: 1 }, nextScene: "start" },
            { text: "Change the subject: ask Wat about his last campaign.", effects: { wits: 1, stress: 1 }, nextScene: "start" }
        ]
    },
    
    campfire_cook_04_the_simmer: {
        title: "Campfire — The Simmer",
        location: "Camp",
        text: function () {
            const name = gameState.characterName || "Soldier";
            return `
                <p>The stew simmers. The surface trembles and settles, trembles and settles, as if it is breathing.</p>
                <p><strong>The Cook:</strong> If you boil too hard, it tastes like panic. If you simmer, it tastes like patience.</p>
                <p>Wat snorts.</p>
                <p><strong>Wat:</strong> Panic keeps you alive.</p>
                <p><strong>The Cook:</strong> Panic makes you drop things.</p>
                <p>He looks at you as if you are a question he wants to solve carefully.</p>
                <p><strong>The Cook:</strong> What do you fear most, ${name}? Be specific. Not "death." That's lazy.</p>
                <p>Wat's eyes flick over you. Quick. Hungry. Like he wants the answer too.</p>
            `;
        },
        choices: [
            { text: "Admit something small and true. Heights. Horses. Blood.", effects: { stress: -1, morale: 1 }, nextScene: "start" },
            { text: "Refuse to answer. Some things stay behind your teeth.", effects: { stress: 1 }, nextScene: "start" },
            { text: "Deflect with a joke. Make it someone else's problem.", effects: { morale: 1, stress: 1 }, nextScene: "start" },
            { text: "Ask Wat what he fears most.", effects: { wits: 1, stress: 1 }, nextScene: "start" }
        ]
    },
    
    campfire_cook_05_the_old_recipe: {
        title: "Campfire — The Old Recipe",
        location: "Camp",
        text: function () {
            const name = gameState.characterName || "Soldier";
            return `
                <p>The Cook talks about a recipe from home as if naming it will summon it. A broth thickened with barley. A little herb if you can steal it from a hedge. A scrap of meat if fortune smiles.</p>
                <p><strong>The Cook:</strong> People think food is just fuel. It is not. It is memory you can swallow.</p>
                <p>Wat rolls his eyes.</p>
                <p><strong>Wat:</strong> Memory doesn't stop steel.</p>
                <p><strong>The Cook:</strong> No. But it stops men from turning into animals.</p>
                <p>Wat stares at the fire. Quiet for a moment. The flames paint his face like an old bruise.</p>
                <p><strong>Wat:</strong> Animals live longer.</p>
                <p>The Cook turns to you.</p>
                <p><strong>The Cook:</strong> When you think of home, ${name}, what is the first smell?</p>
            `;
        },
        choices: [
            { text: "Answer honestly. Smoke. Bread. Wet earth. Horses.", effects: { morale: 1 }, nextScene: "start" },
            { text: "Say you don't remember. Or pretend you don't.", effects: { stress: 1 }, nextScene: "start" },
            { text: "Ask The Cook what he misses most.", effects: { wits: 1 }, nextScene: "start" },
            { text: "Ask Wat, quietly, what he misses. If anything.", effects: { stress: 1, wits: 1 }, nextScene: "start" }
        ]
    },

    campfire_cook_06_the_complaint: {
        focus: "cook",
        title: "Campfire — The Complaint",
        minYear: 1337,
        maxYear: null,
        text: function(gs) {
            return `
                <p>Someone complained about the stew. Not to The Cook. To you. Like you're in charge of complaints.</p>
                <p>The Cook hears anyway. He always hears. The fire pops. Steam rises from the pot.</p>
                <p><em>"What did they say?"</em> he asks. Calm. Too calm.</p>
                <p>You tell him. The stew was thin. The meat was tough. The bread was hard.</p>
                <p>The Cook nods. <em>"All true. What else did they say?"</em></p>
                <p>Wat laughs from his corner. <em>"They said you cook like a Frenchman."</em></p>
                <p>The Cook stops stirring. Looks at Wat. Looks at the pot. Looks at you.</p>
                <p><em>"Frenchmen can cook,"</em> he says. <em>"The complaint is invalid."</em></p>
                <p>He goes back to stirring. The moment passes. But you remember it.</p>
            `;
        },
        choices: [
            {
                text: "Defend The Cook. The stew was fine.",
                effects: function(gs) {
                    changeRel("cook", 2);
                    applyStatChange("morale", 1, {silent:true});
                },
                nextScene: "start"
            },
            {
                text: "Agree with the complaint. It was thin.",
                effects: function(gs) {
                    changeRel("cook", -2);
                    applyStatChange("stress", 1, {silent:true});
                },
                nextScene: "start"
            },
            {
                text: "Say nothing. Let The Cook handle it.",
                effects: function(gs) {
                    applyStatChange("stress", -1, {silent:true});
                },
                nextScene: "start"
            },
            {
                text: "Ask Wat why he's stirring trouble",
                effects: function(gs) {
                    changeRel("wat", -1);
                    changeRel("cook", 1);
                },
                nextScene: "start"
            }
        ]
    },

    campfire_wat_06_three_knives: {
        focus: "wat",
        title: "Campfire — Three Knives",
        minYear: 1337,
        maxYear: null,
        text: function(gs) {
            return `
                <p>Wat has three knives. He's showing them to you. Not bragging. Explaining.</p>
                <p><em>"This one's for eating,"</em> he says, holding up a small blade. <em>"This one's for fighting."</em> A longer one. <em>"This one's for when the other two aren't enough."</em></p>
                <p>The third knife is very large. Very sharp. The edge catches firelight. You don't ask what it's for.</p>
                <p>The Cook looks over. <em>"That is a lot of knives for one man."</em></p>
                <p><em>"A man can never have too many knives,"</em> Wat says. <em>"That's a fact."</em></p>
                <p><em>"A man can have too many opinions about knives,"</em> The Cook says.</p>
                <p>Wat grins. It's not a nice grin. <em>"You want to test that theory, Cook?"</em></p>
                <p>The Cook goes back to his pot. <em>"I have enough knives. In the pot. For cutting vegetables."</em></p>
                <p>Wat sheathes his knives. One. Two. Three. <em>"Vegetables don't fight back."</em></p>
            `;
        },
        choices: [
            {
                text: "Ask to see the knives up close",
                effects: function(gs) {
                    changeRel("wat", 1);
                    applyStatChange("wits", 1, {silent:true});
                },
                nextScene: "start"
            },
            {
                text: "Tell Wat he has a problem",
                effects: function(gs) {
                    changeRel("wat", -1);
                    applyStatChange("morale", 1, {silent:true});
                },
                nextScene: "start"
            },
            {
                text: "Ask The Cook if he has a knife philosophy",
                effects: function(gs) {
                    changeRel("cook", 1);
                    changeRel("wat", -1);
                },
                nextScene: "start"
            },
            {
                text: "Say nothing. Knives are personal.",
                effects: function(gs) {
                    applyStatChange("stress", -1, {silent:true});
                },
                nextScene: "start"
            }
        ]
    },

    campfire_both_01_the_bet: {
        focus: "both",
        title: "Campfire — The Bet",
        minYear: 1337,
        maxYear: null,
        text: function(gs) {
            return `
                <p>Wat bets The Cook that it will rain before dawn. The Cook bets it won't.</p>
                <p><em>"What are we betting?"</em> Wat asks.</p>
                <p><em>"Your next meal,"</em> The Cook says. <em>"If you win, I make it better. If I win, you eat what I give you and say nothing."</em></p>
                <p>Wat grins. <em>"Deal. But I want extra meat if I win."</em></p>
                <p><em>"If you win, you get what you get,"</em> The Cook says. <em>"That is how bets work."</em></p>
                <p>They shake on it. Wat looks at the sky. The Cook looks at his pot. The fire pops between them.</p>
                <p><em>"It's going to rain,"</em> Wat says. <em>"I can smell it."</em></p>
                <p><em>"You can smell your own socks,"</em> The Cook says. <em>"That does not mean rain."</em></p>
                <p>You watch. The sky doesn't care about their bet. Neither does the war.</p>
            `;
        },
        choices: [
            {
                text: "Bet on Wat. Rain's coming.",
                effects: function(gs) {
                    changeRel("wat", 1);
                    changeRel("cook", -1);
                },
                nextScene: "start"
            },
            {
                text: "Bet on The Cook. The sky looks clear.",
                effects: function(gs) {
                    changeRel("cook", 1);
                    changeRel("wat", -1);
                },
                nextScene: "start"
            },
            {
                text: "Stay out of it. Bets are trouble.",
                effects: function(gs) {
                    applyStatChange("stress", -1, {silent:true});
                },
                nextScene: "start"
            },
            {
                text: "Make your own bet with both of them",
                effects: function(gs) {
                    applyStatChange("morale", 1, {silent:true});
                    applyStatChange("stress", 1, {silent:true});
                },
                nextScene: "start"
            }
        ]
    },

    // ============================================================================
    // STUB SCENES — Bridge scenes for previously undefined nextScene targets
    // These provide brief narrative text and route back to the main arc flow.
    // ============================================================================

    march_continues: {
        title: "The March Continues",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "France"; },
        noCampfire: true,
        text: function() {
            const fatigue = hasCondition('Fatigued') ? " Every step is a labor now." : "";
            return `<p>The column moves on.${fatigue} The road stretches ahead, rutted and muddied by the passage of thousands. You fall into the rhythm of it — boot, breath, boot, breath. Putting one foot before the other. The same as yesterday. The same as tomorrow.</p>
            <p>Wat walks beside you. Neither of you speaks. There's nothing to say that the road doesn't say for you.</p>`;
        },
        choices: [
            { text: "Keep marching", effects: { endurance: 1, stress: 1 }, nextScene: "march_through_normandy_1" }
        ]
    },

    dawn_arrival: {
        title: "Dawn",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "France"; },
        noCampfire: true,
        text: function() {
            return `<p>Dawn comes grey and cold. You wake stiff. Muscles aching. The fire is ash. Around you men stir. Cough. Spit. Begin the slow process of becoming soldiers again instead of sleeping men.</p>
            <p>The sergeant's voice cuts through the mist. <em>"On your feet. We march."</em> No one argues. No one asks where. You know where. Forward. Always forward.</p>`;
        },
        choices: [
            { text: "Fall in with the column", effects: { endurance: 1 }, nextScene: "march_through_normandy_1" }
        ]
    },

    forest_exit: {
        title: "Out of the Trees",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "France"; },
        noCampfire: true,
        text: function() {
            return `<p>The trees thin. Light breaks through. You emerge from the forest onto open ground. The relief is immediate — no more shadows, no more unseen threats behind every trunk. The column reforms on the road ahead.</p>`;
        },
        choices: [
            { text: "Rejoin the column", effects: { stress: -1 }, nextScene: "march_through_normandy_1" }
        ]
    },

    marsh_exit: {
        title: "Solid Ground",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "France"; },
        noCampfire: true,
        text: function() {
            return `<p>Your boots find solid ground. After hours in the mire, the feeling is almost holy. You scrape the worst of the mud off. Your legs tremble. Your feet are numb and wrinkled. But you're through. The marsh is behind you.</p>`;
        },
        choices: [
            { text: "Press on", effects: { endurance: 1, stress: -1 }, nextScene: "march_through_normandy_1" }
        ]
    },

    cavalry_decision: {
        title: "The Horsemen Pass",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "France"; },
        noCampfire: true,
        text: function() {
            return `<p>The cavalry thunders past. Hooves throwing up clods of earth. Knights in their finery, squires trailing behind. They barely glance at you. Foot soldiers. Beneath their notice. The dust settles. You keep walking.</p>`;
        },
        choices: [
            { text: "Continue the march", nextScene: "march_through_normandy_1" }
        ]
    },

    scout_discovery: {
        title: "What the Scout Found",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "France"; },
        noCampfire: true,
        text: function() {
            return `<p>You circle wide of the obstacle. Through a copse of trees. Over a low stone wall. And there — beyond the ridge — you see the road clear. Whatever blocked the column, it's passable from this side. You report back.</p>
            <p>The sergeant nods. <em>"Good eyes. We'll go around."</em> The column shifts. It costs time. But time is cheaper than blood.</p>`;
        },
        choices: [
            { text: "Fall back in with the column", effects: { experience: 5, reputation: 1 }, nextScene: "march_through_normandy_1" }
        ]
    },

    camp_rest: {
        title: "Rest in Camp",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "Camp"; },
        text: function() {
            const wounded = hasCondition('Wounded') || hasCondition('Seriously Wounded');
            const woundText = wounded ? " You ease yourself down carefully, mindful of your injuries." : "";
            return `<p>You find a spot near the fire.${woundText} The ground is hard but you've slept on worse. Around you, the camp settles into its evening routine — men eating, talking in low voices, sharpening blades.</p>`;
        },
        choices: [
            { text: "Sleep — you need it", effects: { stress: -1, endurance: 1 }, nextScene: "march_through_normandy_1" }
        ]
    },

    camp_life: {
        title: "Camp Life",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "Camp"; },
        text: function() {
            return `<p>Another evening in camp. The fire. The talk. The weight of your gear piled beside you. You eat what there is and drink what there is and try not to think too far ahead. Tomorrow will come. It always does.</p>`;
        },
        choices: [
            { text: "Get some sleep", effects: { stress: -1, endurance: 1 }, nextScene: "march_through_normandy_1" }
        ]
    },

    camp_continues: {
        title: "Camp Continues",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "Camp"; },
        text: function() {
            return `<p>The camp goes on around you. Fires burning. Men talking. The ordinary business of war when there is no fighting to be done. You find your place in it, as you always do.</p>`;
        },
        choices: [
            { text: "Settle in", effects: { stress: -1 }, nextScene: "march_through_normandy_1" }
        ]
    },

    camp_settled: {
        title: "Settled In",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "Camp"; },
        text: function() {
            return `<p>You settle into the camp. Your spot is claimed, your gear is stowed. The fire crackles. For a moment, there is something almost like peace.</p>`;
        },
        choices: [
            { text: "Rest", effects: { stress: -1 }, nextScene: "march_through_normandy_1" }
        ]
    },

    camp_observed: {
        title: "Observations",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "Camp"; },
        text: function() {
            return `<p>You watch the camp from your position. Men move with purpose or without it. Some laugh. Some stare at nothing. War does different things to different men. You're still trying to figure out what it's doing to you.</p>`;
        },
        choices: [
            { text: "Return to your duties", nextScene: "march_through_normandy_1" }
        ]
    },

    siege_continues: {
        title: "The Siege Drags On",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: "Calais",
        text: function() {
            return `<p>Another day before the walls of Calais. The routine is numbing — watch, eat, sleep, watch again. The French won't come out. You won't go in. Both sides waiting for the other to break.</p>`;
        },
        choices: [
            { text: "Return to your duties", effects: { stress: 1 }, nextScene: "calais_siege" }
        ]
    },

    respect_shown: {
        title: "Respect",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "France"; },
        noCampfire: true,
        text: function() {
            return `<p>You chose respect. Over cruelty. Over convenience. It cost you nothing but a moment's restraint. And perhaps gained you something harder to measure. The look in their eyes. Not fear. Something else. Something closer to recognition.</p>
            <p>Whether it matters in the end, who can say. But you can look at yourself and know what you did. That has to count for something.</p>`;
        },
        choices: [
            { text: "Move on", effects: { reputation: 1, morale: 1 }, nextScene: "march_through_normandy_1" }
        ]
    },

    mercy_shown: {
        title: "Mercy",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "France"; },
        noCampfire: true,
        text: function() {
            return `<p>Mercy. A strange word for a soldier. But you gave it. Stayed your hand when you could have struck. Let live what you could have killed. The world didn't change. The war didn't stop. But somewhere inside you, something held.</p>`;
        },
        choices: [
            { text: "Continue", effects: { reputation: 1, stress: -1 }, nextScene: "march_through_normandy_1" }
        ]
    },

    acceptance: {
        title: "Acceptance",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "France"; },
        noCampfire: true,
        text: function() {
            return `<p>You accept it. What happened. What you saw. What you did. Not forgiveness — that's too generous a word. Just acknowledgment. This is the war. This is what it does. To everyone. To you.</p>
            <p>You shoulder your pack and keep walking.</p>`;
        },
        choices: [
            { text: "Keep walking", effects: { stress: -1 }, nextScene: "march_through_normandy_1" }
        ]
    },

    lesson_learned: {
        title: "A Lesson",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "France"; },
        noCampfire: true,
        text: function() {
            return `<p>You won't forget this. What you learned. What it cost to learn it. War is the harshest teacher — but its lessons stick. Next time, you'll know better. Next time, you'll be ready.</p>`;
        },
        choices: [
            { text: "Press on", effects: { experience: 5 }, nextScene: "march_through_normandy_1" }
        ]
    },

    rest_earned: {
        title: "Rest Earned",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "Camp"; },
        text: function() {
            return `<p>You've earned this rest. The ground is hard, the blanket thin, but your body doesn't care. Sleep takes you fast and holds you like a mother holds a child. Dreamless. Deep. The kind of sleep only exhaustion can buy.</p>`;
        },
        choices: [
            { text: "Wake with the dawn", effects: { stress: -2, endurance: 1 }, nextScene: "march_through_normandy_1" }
        ]
    },

    confession: {
        title: "Confession",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "Camp"; },
        text: function() {
            return `<p>The priest listens. Nods. His face betrays nothing. He's heard worse. Much worse. Everyone confesses before battle. The words spill out — sins real and imagined, fears too heavy to carry alone. He offers absolution. Whether God hears, you can't know. But the weight lifts. A little.</p>`;
        },
        choices: [
            { text: "Return to camp", effects: { stress: -2, morale: 1 }, nextScene: "march_through_normandy_1" }
        ]
    },

    negotiation: {
        title: "Negotiation",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "France"; },
        noCampfire: true,
        text: function() {
            return `<p>Words instead of steel. Sometimes that's enough. Sometimes it isn't. Today it was. The matter is settled — not to everyone's satisfaction, but settled. That's more than most disputes in wartime can claim.</p>`;
        },
        choices: [
            { text: "Move on", effects: { wits: 1 }, nextScene: "march_through_normandy_1" }
        ]
    },

    battle_prepared: {
        title: "Ready",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "France"; },
        noCampfire: true,
        text: function() {
            return `<p>Your equipment is checked. Your blade is sharp. Your shield is tight on your arm. Your prayers are said. You're as ready as any man can be for what comes next. The waiting is the worst part. But even the waiting ends.</p>`;
        },
        choices: [
            { text: "To battle", effects: { morale: 1 }, nextScene: "battle_crecy" }
        ]
    },

    // --- Winter march outcome stubs ---
    frost_survival: {
        title: "Surviving the Frost",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "France"; },
        noCampfire: true,
        text: function() {
            return `<p>You kept moving. Didn't stop. Didn't sit. Didn't let the cold win. Your feet are numb, your hands like claws, but you're alive. Others weren't so lucky. You see them by the road — men who stopped. Men who sat down. Men who won't get up again.</p>
            <p>The column keeps moving. You keep moving with it. That's all there is.</p>`;
        },
        choices: [
            { text: "Press forward", effects: { endurance: 2, stress: 1 }, nextScene: "march_through_normandy_1" }
        ]
    },

    compassion_shown: {
        title: "A Moment of Warmth",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "France"; },
        noCampfire: true,
        text: function() {
            return `<p>You shared what warmth you had. Your cloak. Your body heat. The man looked at you with eyes that had given up — then didn't. He gripped your arm. Held on. You pulled him forward. One step. Then another.</p>
            <p>He'll live. Maybe. But he'll remember. And so will the others who watched. Kindness in the cold. It means something. Even here.</p>`;
        },
        choices: [
            { text: "Return to the column", effects: { reputation: 2, morale: 1 }, nextScene: "march_through_normandy_1" }
        ]
    },

    desperate_warmth: {
        title: "Desperate Measures",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "France"; },
        noCampfire: true,
        text: function() {
            return `<p>The fire caught. Barely. Wet wood smoking and sputtering. But it was heat. Real heat. Men crowded around it. Hands extended. Faces lit by the guttering flame. For ten precious minutes, you were warm. It cost you — time, material, the sergeant's disapproval. But your fingers work again. That's worth something.</p>`;
        },
        choices: [
            { text: "Rejoin the march", effects: { morale: 1, stress: -1 }, nextScene: "march_through_normandy_1" }
        ]
    },

    shelter_found: {
        title: "Shelter",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "France"; },
        noCampfire: true,
        text: function() {
            return `<p>A barn. Half-collapsed, missing its door. But the walls still stood and the roof mostly held. Out of the wind. Out of the rain. The column filed in — those who could fit. The rest huddled against the walls outside. For one night, you had shelter. Real shelter. The luxury of it was almost obscene.</p>`;
        },
        choices: [
            { text: "Rest and recover", effects: { stress: -2, endurance: 1 }, nextScene: "march_through_normandy_1" }
        ]
    },

    // --- Village pillage outcome stubs ---
    thorough_pillage: {
        title: "The Thorough Search",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "France"; },
        noCampfire: true,
        text: function() {
            return `<p>You searched every house. Every cellar. Every hidden space. Pried up floorboards. Dug in gardens. Found what was hidden — coins sewn into mattresses, silver buried under hearthstones. The village gave up its secrets. All of them.</p>
            <p>When you were done, there was nothing left worth taking. The village was a shell. Empty. Stripped. You tried not to think about who had lived here. What they'd come back to find.</p>`;
        },
        choices: [
            { text: "Rejoin the column", effects: { experience: 5 }, nextScene: "march_through_normandy_1" }
        ]
    },

    cruel_extraction: {
        title: "Cruelty's Wages",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "France"; },
        noCampfire: true,
        text: function() {
            return `<p>They told you where it was. Eventually. Fear is a reliable informant. The old man pointed with a shaking hand. The woman wouldn't stop crying. You found their hoard — more than expected. Enough to matter.</p>
            <p>You left them alive. That was your only mercy. Whether they'll survive the winter without their savings — that's not your problem. That's what you tell yourself.</p>`;
        },
        choices: [
            { text: "Move on", effects: { experience: 5 }, nextScene: "march_through_normandy_1" }
        ]
    },

    quick_pillage: {
        title: "Quick and Gone",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "France"; },
        noCampfire: true,
        text: function() {
            return `<p>You took what was obvious. What was easy. Didn't linger. Didn't search. Didn't look in the eyes of the people you were robbing. In and out. Professional. Quick. Like pulling a tooth — better done fast.</p>
            <p>It wasn't much. But it was something. And you didn't have to live with the memory of doing worse.</p>`;
        },
        choices: [
            { text: "Return to the column", effects: { experience: 5 }, nextScene: "march_through_normandy_1" }
        ]
    },

    refusal_honor: {
        title: "Honor's Price",
        year: function() { return gameState.year; },
        age: function() { return gameState.age; },
        location: function() { return gameState.location || "France"; },
        noCampfire: true,
        text: function() {
            return `<p>You refused. Stood apart while others looted. Kept your hands clean. Your comrades looked at you — some with contempt, some with something harder to name. Maybe respect. Maybe confusion. Who refuses plunder?</p>
            <p>You walked away poorer than you went in. But something in your chest felt lighter. Maybe that's worth more than silver. Maybe.</p>`;
        },
        choices: [
            { text: "Rejoin the march", effects: { experience: 5 }, nextScene: "march_through_normandy_1" }
        ]
    },

    // ============================================================================
    // END STUB SCENES
    // ============================================================================

    campfire_interlude: {
        title: function() {
            const cf = gameState.campfire || {};
            const vid = cf.currentVignetteId;
            if (vid) {
                const v = CAMPFIRE_VIGNETTES.find(function(vg) { return vg.id === vid; });
                if (v && v.title) return v.title;
            }
            return "Campfire";
        },
        year: function() { return gameState.year; },
        age: function() { return gameState.age || 18; },
        location: function() { return gameState.location || "Camp"; },
        noCampfire: true, // Prevent recursion
        artwork: "artwork/campfire.jpg",
        artworkCaption: "Evening by the fire - a moment of rest and reflection",
        text: function() {
            const cf = gameState.campfire || {};
            const step = cf.currentStep || 0;
            
            // Micro campfire mode: short maintenance description
            if (cf.mode === 'micro') {
                const descriptions = [
                    "The fire burns low. A moment to tend to yourself and your kit.",
                    "A brief pause. The column rests. You catch your breath.",
                    "Evening settles. Men huddle by the flames. Time for maintenance.",
                    "The march halts. You find a spot by the fire. Rest and repair."
                ];
                const desc = descriptions[Math.floor(Math.random() * descriptions.length)];
                const maintenanceText = "Your gear needs attention. Leather straps worn thin. Metal dulled by mud and clash. You work by firelight, hands moving with practiced rhythm.";
                return `<p>${desc}</p><h3 style="margin-top:0; color: #f4d03f;">Maintenance</h3><p>${maintenanceText}</p>`;
            }
            
            // Full vignette mode: existing behavior
            // Initialize vignette on step 0
            if (step === 0) {
                const seenIds = new Set(cf.seenIds || []);
                
                // Pick a vignette: prefer unseen, but allow repeats if all seen
                let available = CAMPFIRE_VIGNETTES.filter(v => {
                    // Check year range if specified
                    if (v.minYear && gameState.year < v.minYear) return false;
                    if (v.maxYear && gameState.year > v.maxYear) return false;
                    // P6: Check prereq field (flag name or function)
                    if (v.prereq) {
                        if (typeof v.prereq === 'function') {
                            if (!v.prereq(gameState)) return false;
                        } else if (typeof v.prereq === 'string') {
                            if (!window.hasFlag(v.prereq)) return false;
                        }
                    }
                    // P7: Check condition function (e.g., Oana location guard)
                    if (v.condition && typeof v.condition === 'function') {
                        if (!v.condition(gameState)) return false;
                    }
                    return true;
                });
                
                let selectedVignette = null;
                
                // Prefer unseen vignettes
                const unseen = available.filter(v => !seenIds.has(v.id));
                if (unseen.length > 0) {
                    selectedVignette = unseen[Math.floor(Math.random() * unseen.length)];
                } else {
                    // All seen - avoid last 3 seen
                    const recentSeen = cf.seenIds.slice(-3);
                    const notRecent = available.filter(v => !recentSeen.includes(v.id));
                    if (notRecent.length > 0) {
                        selectedVignette = notRecent[Math.floor(Math.random() * notRecent.length)];
                    } else {
                        // Fallback to any
                        selectedVignette = available[Math.floor(Math.random() * available.length)];
                    }
                }
                
                if (!selectedVignette) {
                    return `<p>The fire burns low. Men sleep. The night passes.</p>`;
                }
                
                // Store selected vignette and reset step
                cf.currentVignetteId = selectedVignette.id;
                cf.currentStep = 0;
                cf.stepHistory = [];
                
                // Add to seen list (limit to last 20)
                if (!cf.seenIds) cf.seenIds = [];
                cf.seenIds.push(selectedVignette.id);
                if (cf.seenIds.length > 20) {
                    cf.seenIds = cf.seenIds.slice(-20);
                }
            }
            
            const vignetteId = cf.currentVignetteId;
            const vignette = CAMPFIRE_VIGNETTES.find(v => v.id === vignetteId);
            
            if (!vignette) {
                return `<p>The fire burns low. Men sleep. The night passes.</p>`;
            }
            
            // Render header
            const header = vignette.focus === "wat" ? 
                `<p style="color: #d4af37; font-style: italic; margin-bottom: 10px;">Wat spits into the fire.</p>` :
                vignette.focus === "cook" ?
                `<p style="color: #d4af37; font-style: italic; margin-bottom: 10px;">The Cook stirs the pot.</p>` :
                `<p style="color: #d4af37; font-style: italic; margin-bottom: 10px;">Wat and The Cook sit by the fire.</p>`;
            
            const title = vignette.title || vignette.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            // Handle multi-stage vignettes
            if (vignette.stages && Array.isArray(vignette.stages)) {
                const currentStage = vignette.stages[step];
                if (currentStage) {
                    const stageText = typeof currentStage.text === 'function' ? currentStage.text(gameState) : currentStage.text;
                    if (step === 0) {
                        return header + `<h3 style="margin-top:0; color: #f4d03f;">${title}</h3>` + stageText;
                    } else {
                        return header + stageText;
                    }
                }
            }
            
            // Fallback to old format (single stage)
            const vignetteText = typeof vignette.text === 'function' ? vignette.text(gameState) : vignette.text;
            if (step === 0) {
                return header + `<h3 style="margin-top:0; color: #f4d03f;">${title}</h3>` + vignetteText;
            } else {
                // Show response from previous choice
                return header + (cf.currentResponse || '');
            }
        },
        choices: function() {
            const cf = gameState.campfire || {};
            const step = cf.currentStep || 0;
            
            // Micro campfire mode: maintenance choices
            if (cf.mode === 'micro') {
                return [
                    {
                        text: "Sleep — Rest and recover",
                        effects: function(gs) {
                            const state = gs || gameState;
                            // Exertion -1, stress -1
                            state.exertion = Math.max(0, Math.min(10, (state.exertion || 0) - 1));
                            applyStatChange('stress', -1, {silent: true});
                        },
                        nextScene: function() {
                            const next = cf.returnScene || "start";
                            cf.returnScene = null;
                            cf.mode = null;
                            cf.currentStep = 0;
                            return next;
                        }
                    },
                    {
                        text: "Tend Kit — Repair and maintain gear",
                        effects: function(gs) {
                            const state = gs || gameState;
                            // Wear -1
                            state.wear = Math.max(0, Math.min(10, (state.wear || 0) - 1));
                        },
                        nextScene: function() {
                            const next = cf.returnScene || "start";
                            cf.returnScene = null;
                            cf.mode = null;
                            cf.currentStep = 0;
                            return next;
                        }
                    },
                    {
                        text: "Share Words — Talk with companions",
                        effects: function(gs) {
                            const state = gs || gameState;
                            // Morale +1
                            applyStatChange('morale', 1, {silent: true});
                        },
                        nextScene: function() {
                            const next = cf.returnScene || "start";
                            cf.returnScene = null;
                            cf.mode = null;
                            cf.currentStep = 0;
                            return next;
                        }
                    },
                    {
                        text: "Keep Watch — Stay alert",
                        effects: function(gs) {
                            const state = gs || gameState;
                            // Initiative +1 (no meter recovery)
                            applyStatChange('initiative', 1, {silent: true});
                        },
                        nextScene: function() {
                            const next = cf.returnScene || "start";
                            cf.returnScene = null;
                            cf.mode = null;
                            cf.currentStep = 0;
                            return next;
                        }
                    }
                ];
            }
            
            // Full vignette mode: existing behavior
            const vignetteId = cf.currentVignetteId;
            const vignette = CAMPFIRE_VIGNETTES.find(v => v.id === vignetteId);
            
            if (!vignette) {
                // Fallback if no vignette selected
                return [{
                    text: "Turn in for the night.",
                    effects: { stress: -1 },
                    nextScene: function() {
                        const next = cf.returnScene || "start";
                        cf.returnScene = null;
                        cf.currentVignetteId = null;
                        cf.currentStep = 0;
                        return next;
                    }
                }];
            }
            
            // Handle multi-stage vignettes
            if (vignette.stages && Array.isArray(vignette.stages)) {
                const currentStage = vignette.stages[step];
                if (!currentStage) {
                    // No more stages, exit
                    return [{
                        text: "Turn in for the night.",
                        effects: { stress: -1 },
                        nextScene: function() {
                            const next = cf.returnScene || "start";
                            cf.returnScene = null;
                            cf.currentVignetteId = null;
                            cf.currentStep = 0;
                            return next;
                        }
                    }];
                }
                
                // Convert stage choices to scene choices format
                const choices = currentStage.choices.map((c, i) => {
                    return {
                        text: c.text,
                        effects: function(gs) {
                            const state = gs || gameState;
                            // Apply effects
                            if (typeof c.effects === 'function') {
                                c.effects(state);
                            } else if (typeof c.effects === 'object') {
                                Object.entries(c.effects).forEach(([key, value]) => {
                                    applyStatChange(key, value, {silent:true});
                                });
                            }
                        },
                        nextScene: function() {
                            // If this is an exit choice, return to next scene
                            if (c.isExit) {
                                const next = cf.returnScene || "start";
                                cf.returnScene = null;
                                cf.currentVignetteId = null;
                                cf.currentStep = 0;
                                return next;
                            }
                            
                            // Otherwise, advance to next stage
                            const nextStep = step + 1;
                            const nextStage = vignette.stages[nextStep];
                            
                            if (nextStage) {
                                // Store response for next stage
                                if (typeof c.response === 'function') {
                                    cf.currentResponse = c.response(gameState);
                                } else if (c.response) {
                                    cf.currentResponse = c.response;
                                }
                                cf.currentStep = nextStep;
                                cf.stepHistory.push({ step: step, choiceIndex: i });
                                return "campfire_interlude"; // Stay in campfire, show next stage
                            } else {
                                // No more stages, exit
                                const next = cf.returnScene || "start";
                                cf.returnScene = null;
                                cf.currentVignetteId = null;
                                cf.currentStep = 0;
                                return next;
                            }
                        }
                    };
                });
                
                return choices;
            }
            
            // Fallback to old format (single stage) - convert to multi-stage format on the fly
            let oldChoices = [];
            if (typeof vignette.choices === 'function') {
                try {
                    oldChoices = vignette.choices(gameState) || [];
                } catch (error) {
                    console.error('Error getting choices from vignette function:', error);
                    oldChoices = [];
                }
            } else if (Array.isArray(vignette.choices)) {
                oldChoices = vignette.choices;
            }
            const choices = oldChoices.map((c, i) => {
                return {
                    text: c.text,
                    effects: function(gs) {
                        const state = gs || gameState;
                        if (typeof c.effects === 'function') {
                            c.effects(state);
                        } else if (typeof c.effects === 'object') {
                            Object.entries(c.effects).forEach(([key, value]) => {
                                applyStatChange(key, value, {silent:true});
                            });
                        }
                    },
                    nextScene: function() {
                        // Old format: exit immediately
                        const next = cf.returnScene || "start";
                        cf.returnScene = null;
                        cf.currentVignetteId = null;
                        cf.currentStep = 0;
                        return next;
                    }
                };
            });
            
            // Always add "Turn in" option
            choices.push({
                text: "Turn in for the night.",
                effects: { stress: -1 },
                nextScene: function() {
                    const next = cf.returnScene || "start";
                    cf.returnScene = null;
                    cf.currentVignetteId = null;
                    cf.currentStep = 0;
                    return next;
                }
            });
            
            return choices;
        }
    }
    });
})();
