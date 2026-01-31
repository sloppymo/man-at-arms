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
// ============================================================================
// A MAN-AT-ARMS' LIFE - FLAVOR EVENTS
// Part 2: Campaign Events (continued) + Camp Life Events
// ============================================================================

// MORE CAMPAIGN EVENTS
// ============================================================================

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
    text: function() {
        return `<p>Cold. Not the kind you could fight with movement. The kind that settled into your bones. Made them ache. The frost had come in the night. Now everything was white. Crystalline. Beautiful and deadly. Your breath came in clouds. Each exhale a visible thing. Floating. Dissipating. Gone.</p>
               
               <p>The road was ice. Treacherous. Men slipped. Fell. Got up cursing. Fell again. The horses fared worse. Their hooves couldn't grip. Several had already gone lame. Left behind. Their riders walking now. Carrying what they could. The frost didn't care. It just kept biting. Finding every gap in your clothing. Every weakness in your defenses.</p>
               
               <p>Your hands were numb. Even through gloves. Mittens of wool. Useless against this cold. You flexed your fingers. Trying to keep blood moving. Feeling nothing. That scared you. Couldn't fight if you couldn't feel your sword. Couldn't defend yourself. The cold was an enemy more dangerous than the French. You couldn't negotiate with it. Couldn't run from it. Could only endure.</p>
               
               <p>Someone fell and didn't get up. Men rushed to him. Shook him. Called his name. Nothing. He was breathing. But barely. His lips were blue. His skin pale. Frostbite. Exposure. Death by degrees. They carried him to a cart. Wrapped him in what blankets remained. He might live. He might not. The cold would decide. Not you. Not medicine. Just the cold and whether his body could fight it.</p>
               
               <p>The column kept moving. Had to. Stopping meant freezing. Meant dying. So you walked. Numb. Aching. Miserable. But alive. For now. The frost glittered around you. Beautiful. Pitiless. Caring nothing for your struggle. This was winter in France. This was war in the cold months. This was what it meant to serve. Not glory. Not honor. This. The frost. The numbness. The endless walking toward some destination that might not even matter.</p>`;
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

// CAMP LIFE EVENTS
// ============================================================================

camp_dice_game: {
    title: "A Game of Hazard",
    year: function() { return gameState.year; },
    age: function() { return gameState.age; },
    location: function() { return gameState.location; },
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
// ============================================================================
// A MAN-AT-ARMS' LIFE - FLAVOR EVENTS
// Part 3: French Countryside Events + Social Encounters
// ============================================================================

// FRENCH COUNTRYSIDE EVENTS
// ============================================================================

french_peasant_encounter: {
    title: "A Local's Plea",
    year: function() { return gameState.year; },
    age: function() { return gameState.age; },
    location: "Normandy",
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

local_church: {
    title: "The Country Church",
    year: function() { return gameState.year; },
    age: function() { return gameState.age; },
    location: function() { return gameState.location; },
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

bandits_encounter: {
    title: "The Routiers",
    year: function() { return gameState.year; },
    age: function() { return gameState.age; },
    location: function() { return gameState.location; },
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

// SOCIAL ENCOUNTER EVENTS
// ============================================================================

fellow_soldier_story: {
    title: "Tales by Firelight",
    year: function() { return gameState.year; },
    age: function() { return gameState.age; },
    location: function() { return gameState.location; },
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

noblevisit: {
    title: "The Knight's Inspection",
    year: function() { return gameState.year; },
    age: function() { return gameState.age; },
    location: function() { return gameState.location; },
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
// ============================================================================
// A MAN-AT-ARMS' LIFE - FLAVOR EVENTS
// Part 4: Personal Events + Environmental Events + Battle Events
// ============================================================================

// PERSONAL EVENTS - Character Development
// ============================================================================

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

// ENVIRONMENTAL EVENTS
// ============================================================================

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

storm_approaching: {
    title: "The Black Sky",
    year: function() { return gameState.year; },
    age: function() { return gameState.age; },
    location: function() { return gameState.location; },
    text: function() {
        return `<p>The sky went dark. Not the gentle dark of evening. The sudden dark of storm. Clouds rolling in. Black. Roiling. Angry. The wind picked up. Cold. Fierce. Bringing the smell of rain. Of lightning. Of violence about to be unleashed.</p>
               
               <p>The column halted. Men looking up. Assessing. Trying to gauge how bad it would be. Whether to seek shelter or push through. The captain rode forward. Shouted orders. Make camp. Now. Get the tents up. Secure everything. Move. The urgency in his voice was clear. This was going to be bad.</p>
               
               <p>You worked fast. Driving stakes. Raising canvas. Your hands numb with cold. The wind fighting you. Trying to tear the tent from your grip. Others struggled similarly. Cursing. Fighting their own battles with rope and canvas and wind. The first drops fell. Heavy. Warning of what was coming.</p>
               
               <p>Thunder rolled. Deep. Visceral. You felt it in your chest. In your bones. Lightning flashed. Illuminating everything. Stark. White. Gone. Then darkness again. Deeper than before. Your eyes adjusting. Readjusting. The storm was close now. Almost on you. The rain began in earnest. Not drops anymore. Sheets. Walls. The world disappearing into water.</p>
               
               <p>You dove into your tent. Barely secured. But better than nothing. The rain hammered the canvas. Deafening. The tent shook. Strained. Might not hold. Might tear apart. Might leave you exposed to the storm's fury. You huddled inside. Waiting. Hoping. This was nature's violence. Different from man's. But no less dangerous. No less capable of killing you.</p>`;
    },
    choices: [
        {
            text: "Stay in the tent—ride it out",
            effects: { endurance: 1, stress: 1 },
            nextScene: "storm_survival"
        },
        {
            text: "Help secure other tents",
            effects: { reputation: 2, endurance: -1 },
            nextScene: "camp_saved"
        },
        {
            text: "Move to sturdier shelter",
            effects: { wits: 1 },
            requiresResolution: true,
            resolutionStat: "wits",
            resolutionDifficulty: 6,
            nextScene: "better_shelter"
        }
    ]
},

// HISTORICAL BATTLE EVENTS
// ============================================================================

crecy_preparation: {
    title: "Before Crécy",
    year: 1346,
    age: function() { return gameState.age; },
    location: "Crécy-en-Ponthieu",
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
            nextScene: "crecy_battle"
        },
        {
            text: "Pray—you'll need God's help",
            effects: { morale: 1, stress: -1 },
            nextScene: "crecy_battle"
        },
        {
            text: "Check your gear one last time",
            effects: { initiative: 1 },
            nextScene: "crecy_battle"
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
// ============================================================================
// A MAN-AT-ARMS' LIFE - FLAVOR EVENTS
// Part 5: Additional Variety Events
// ============================================================================

// MORE CAMPAIGN EVENTS
// ============================================================================

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
    title: "God's House Defiled",
    year: function() { return gameState.year; },
    age: function() { return gameState.age; },
    location: function() { return gameState.location; },
    text: function() {
        return `<p>The church had been ransacked. You could see it from the road. Doors torn off. Windows broken. Inside would be worse. Someone had already been here. Taken what they wanted. Left destruction in their wake. This was common. Armies looted churches. French. English. Didn't matter. God's house was just another building. Another source of plunder.</p>
               
               <p>You entered anyway. Had to see. The interior was devastation. Benches overturned. Altar cloth torn. The crucifix pulled from the wall. Left on the floor. Someone had defecated in the corner. The ultimate sacrilege. The ultimate display of contempt. This wasn't just looting. This was desecration. Deliberate. Meant to wound. To violate.</p>
               
               <p>The priest lay in the nave. Dead. Throat cut. They'd killed him. For what. The few silver candlesticks. The offering box. Whatever pittance he'd collected from his impoverished flock. They'd killed a man of God for coins. Left him to rot in his own church. The smell was already starting. Sweet. Sickly. Death announcing itself.</p>
               
               <p>You should bury him. Should say words. Should do something. But you were just one man. With no tools. No time. The column was moving on. You could stay. Honor the dead. Or leave him. Like whoever killed him had left him. Another casualty. Another victim of a war that respected nothing. Not even God's house. Not even God's servants.</p>
               
               <p>The crucifix stared up at you from the floor. Christ's eyes. Accusing. Or maybe forgiving. You couldn't tell. The carved face was expressionless. But you felt judged anyway. By the symbol. By the dead priest. By your own conscience. This was what war did. It took sacred things. Made them profane. Turned churches into charnel houses. Turned men into monsters. And forced the rest of you to watch. To participate. To become complicit in the destruction of everything holy.</p>`;
    },
    choices: [
        {
            text: "Bury the priest—it's the right thing",
            effects: { morale: 2, endurance: -1 },
            nextScene: "burial_given"
        },
        {
            text: "Right the crucifix at least",
            effects: { morale: 1 },
            nextScene: "small_dignity"
        },
        {
            text: "Leave—you can't fix this",
            effects: { stress: 2 },
            nextScene: "guilt_carried"
        },
        {
            text: "Search for whoever did this",
            effects: { reputation: 1, initiative: 1 },
            nextScene: "justice_sought"
        }
    ]
},

// MORE CAMP LIFE EVENTS
// ============================================================================

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

// MORE COUNTRYSIDE EVENTS
// ============================================================================

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
