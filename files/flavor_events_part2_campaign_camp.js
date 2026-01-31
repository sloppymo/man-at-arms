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
