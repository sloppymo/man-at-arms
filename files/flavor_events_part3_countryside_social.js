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
