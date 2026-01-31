// ============================================================================
// A MAN-AT-ARMS' LIFE - FLAVOR EVENTS
// Part 1: Campaign Events (30 events)
// McCarthy-style historical narrative for the Hundred Years' War
// ============================================================================

// CAMPAIGN EVENTS - Marching and Military Operations
// ============================================================================

march_through_normandy_1: {
    title: "The Road to Caen",
    year: 1346,
    age: function() { return gameState.age; },
    location: "Normandy",
    text: function() {
        const name = gameState.characterName || "Soldier";
        return `<p>The sun beat down. The column moved through empty fields. The peasants had fled. What remained: a broken cart wheel. A child's toy in the mud. Blackened hayricks. Smoke rose ahead. The smell of burning thatch. Something fouler on the wind.</p>
               
               <p>Your boots were caked with mud. Each step a labor. The clay clung to your soles. The mail chafed where the padding had worn thin. You felt the weight of it all. Sword. Shield. The few things you'd kept. Wat walked beside you. A veteran from Yorkshire. He spat into the dust. French wine and English steel, he muttered. His face was weathered. Scars. Lines of hard living. His eyes never stopped moving.</p>
               
               <p>The column stretched ahead and behind. A snake of men and horses winding through the Norman landscape. The creak of leather. The jingle of harness. Low voices trying to pass the time. Someone sang a bawdy song. Others joined in. Rough. Off-key. It broke the monotony. Ahead the vanguard had stopped. The word passed back. Something blocks the road.</p>
               
               <p>You craned your neck. The press of men. The dust. Your view was obscured. Hold, the sergeant called. Hold in place. The column ground to a halt. In the sudden quiet you heard voices. French voices. Too fast to understand. But the tone was clear. Fear. Anger. Desperation.</p>
               
               <p>Wat shifted. His hand moved to his sword. Trouble, he said. It wasn't a question. Around you men checked weapons. Adjusted shields. The easy camaraderie was gone. Replaced by the tension that comes before violence. Your heart beat faster. The familiar mix. Fear and anticipation.</p>
               
               <p>The captain rode past. His horse's hooves kicked up dust. Stay alert, he called. We don't know what's ahead. But we'll find out. He didn't slow. Heading toward the vanguard. You looked at Wat. He gave you a grim smile. Well ${name}, he said. Looks like we might earn our pay today after all.</p>`;
    },
    choices: [
        {
            text: "Push forward to see what blocks the road",
            effects: { initiative: 1 },
            requiresResolution: true,
            resolutionStat: "agility",
            resolutionDifficulty: 6,
            nextScene: "road_block_encounter"
        },
        {
            text: "Wait with the main column",
            effects: { endurance: 1 },
            nextScene: "march_continues"
        },
        {
            text: "Scout around the obstacle",
            requiresResolution: true,
            resolutionStat: "wits",
            resolutionDifficulty: 7,
            effects: { wits: 1 },
            nextScene: "scout_discovery"
        }
    ]
},

marsh_crossing: {
    title: "The Marshlands",
    year: function() { return gameState.year; },
    age: function() { return gameState.age; },
    location: function() { return gameState.location; },
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

night_march: {
    title: "March Under Stars",
    year: function() { return gameState.year; },
    age: function() { return gameState.age; },
    location: function() { return gameState.location; },
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

river_crossing: {
    title: "The Swollen River",
    year: function() { return gameState.year; },
    age: function() { return gameState.age; },
    location: function() { return gameState.location; },
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

enemy_scouts: {
    title: "Eyes in the Trees",
    year: function() { return gameState.year; },
    age: function() { return gameState.age; },
    location: function() { return gameState.location; },
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

// Continue with more campaign events...
// (Due to length, I'll create multiple files)
