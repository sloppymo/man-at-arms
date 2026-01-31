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
