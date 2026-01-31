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
