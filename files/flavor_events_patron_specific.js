// ============================================================================
// A MAN-AT-ARMS' LIFE - PATRON-SPECIFIC FLAVOR EVENTS
// Events that reference and reflect the player's chosen patron
// McCarthy-style historical narrative
// ============================================================================

// PATRON-SPECIFIC CAMP ARRIVAL EVENTS
// ============================================================================

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

// PATRON-SPECIFIC PRE-BATTLE EVENTS
// ============================================================================

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

// PATRON-SPECIFIC POST-BATTLE EVENTS
// ============================================================================

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

// PATRON-SPECIFIC CAMP LIFE EVENTS
// ============================================================================

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

// PATRON-SPECIFIC PLUNDER EVENTS
// ============================================================================

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

// PATRON-SPECIFIC LEADERSHIP EVENTS
// ============================================================================

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
}
