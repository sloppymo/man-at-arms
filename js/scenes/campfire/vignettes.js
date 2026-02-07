(function() {
    'use strict';
    

const CAMPFIRE_VIGNETTES = [
    {
        id: "wat_knife_humor",
        focus: "wat",
        title: "Wat Watches the Fire",
        minYear: 1337,
        maxYear: null,
        stages: [
            {
                text: function(gs) {
                    const name = gs.characterName || "Soldier";
                    const region = gs.culture || '';
                    let regionLine = '';
                    if (region === 'Yorkshire') {
                        regionLine = `<p>He looks at you sideways. <em>"Yorkshire, are you? Aye, I can tell. You lot walk like the moors shaped you."</em></p>`;
                    } else if (region === 'Lancashire') {
                        regionLine = `<p>He squints at you. <em>"Lancashire, eh? We'll see if you're worth the name."</em></p>`;
                    } else if (region === 'Cornwall') {
                        regionLine = `<p>He eyes you. <em>"Cornish? Long way from home, lad. But then, so's everyone here."</em></p>`;
                    } else if (region === 'Welsh Marches') {
                        regionLine = `<p>He nods at you. <em>"Marcher country, is it? You'll know about raids then. That's something."</em></p>`;
                    } else if (region === 'Kent') {
                        regionLine = `<p>He grunts. <em>"Kent. Garden of England, they call it. Not much garden here though, is there?"</em></p>`;
                    } else if (region) {
                        regionLine = `<p>He looks at you appraisingly. <em>"${region}, is it? Everyone's from somewhere. Doesn't matter much out here."</em></p>`;
                    }
                    return `
                        <p>Wat sits with his back to a stump. Knife in hand. Not carving. Just holding it like a thought.</p>
                        <p>He spits into the coals. <em>"You keep your boots close. A man wakes barefoot, he wakes dead."</em></p>
                        ${regionLine}
                        <p>He looks at you without kindness. Without hate. Like weighing iron.</p>
                    `;
                },
                choices: [
                    { 
                        text: "Nod and check your boots anyway.", 
                        response: function(gs) {
                            return `<p>Wat grunts. <em>"Good. You listen. Most men don't. They think they know better. Then they wake up with their boots gone and their throat cut."</em></p>
                                    <p>He turns the knife in his hand. <em>"I've seen it happen. More than once. Men who thought they were safe. Men who thought the war wouldn't touch them."</em></p>
                                    <p><em>"The war touches everyone. Sooner or later."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); applyStatChange("morale", 1, {silent:true}); }
                    },
                    { 
                        text: "Ask him what happened to his first pair.", 
                        response: function(gs) {
                            return `<p>Wat's face darkens. <em>"First pair? I've lost more boots than I can count. But the first pair..."</em></p>
                                    <p>He pauses. The knife stops moving. <em>"That was at Bannockburn. The Scots came in the night. We were sleeping. I woke up to screaming. Grabbed my sword. Ran out of the tent."</em></p>
                                    <p><em>"Left my boots behind. Fought barefoot in the mud. The cold. The stones cutting my feet. But I lived. Others didn't."</em></p>
                                    <p>He looks at you. <em>"That's why I keep them close now. Always."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 2); if (!gs.flags) gs.flags = {}; gs.flags.wat_boot_story = true; }
                    },
                    { 
                        text: "Say nothing. Let him have his silence.", 
                        response: function(gs) {
                            return `<p>You sit in silence. Wat watches the fire. The knife moves in his hand. Slow. Methodical.</p>
                                    <p>After a while, he speaks. <em>"Silence is good. Most men talk too much. Give themselves away. Give their position away."</em></p>
                                    <p><em>"You learn to be quiet. You learn to listen. That's how you stay alive."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 0); applyStatChange("stress", -1, {silent:true}); }
                    },
                    { 
                        text: "\"I don't give a shit, Wat.\"", 
                        response: function(gs) {
                            return `<p>Wat stops. The knife stops. He looks at you. Really looks. For a long moment, you think he might gut you.</p>
                                    <p>Then he laughs. A harsh, barking laugh. <em>"You don't give a shit? Good. That's honest. Most men lie. Say they care when they don't."</em></p>
                                    <p>He spits. <em>"But here's the thing: the war gives a shit about you. Whether you care or not. It'll kill you just the same."</em></p>
                                    <p><em>"So you can not give a shit all you want. But keep your boots close anyway. Or don't. Your choice."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", -1); applyStatChange("stress", -2, {silent:true}); applyStatChange("morale", 1, {silent:true}); }
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Ask him about Bannockburn.",
                        response: function(gs) {
                            return `<p>Wat's eyes get distant. <em>"Bannockburn. That was a slaughter. The Scots knew the ground. We didn't. They had the high ground. We had mud."</em></p>
                                    <p><em>"The king's horse got stuck. The whole army got stuck. Then the Scots came down. Like wolves on sheep."</em></p>
                                    <p>He spits. <em>"I was young then. Thought I knew what war was. I didn't. Not really. Not until I saw what happened that day."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); if (!gs.flags) gs.flags = {}; gs.flags.wat_bannockburn = true; }
                    },
                    {
                        text: "Nod and let the silence return.",
                        response: function(gs) {
                            return `<p>The fire crackles. Wat watches it. You watch it too. Sometimes words aren't needed.</p>
                                    <p>After a moment, Wat speaks again. <em>"You're learning. That's good. Most men don't."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); applyStatChange("stress", -1, {silent:true}); }
                    },
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            }
        ]
    },
    {
        id: "cook_salt_01",
        focus: "cook",
        title: "The Cook Counts the Salt",
        minYear: 1337,
        maxYear: null,
        stages: [
            {
                text: function(gs) {
                    const region = gs.culture || '';
                    let regionLine = '';
                    if (region === 'Norfolk' || region === 'Essex') {
                        regionLine = `<p>He glances at you. <em>"East country. I know the marshes. Knew a cook from ${region} once. Made good eel pie."</em></p>`;
                    } else if (region === 'Somerset') {
                        regionLine = `<p>He looks you over. <em>"Somerset? Apple country. I could use some cider for this slop."</em></p>`;
                    } else if (region) {
                        regionLine = `<p>He looks at you. <em>"${region}, eh? Don't matter where you're from. Food tastes the same when you're starving."</em></p>`;
                    }
                    return `
                        <p>The Cook pours salt into his palm and counts it under his breath. Not prayer. Measure.</p>
                        <p><em>"Too little and men hate you. Too much and they thirst. Hunger is loud. Thirst is louder."</em></p>
                        ${regionLine}
                        <p>He offers you the pinch like it is evidence.</p>
                    `;
                },
                choices: [
                    { 
                        text: "Taste it and tell him it's right.", 
                        response: function(gs) {
                            return `<p>The Cook nods. <em>"Good. You have a tongue. Most men just swallow. Don't taste. Don't notice."</em></p>
                                    <p>He takes the salt back. Adds it to the pot. <em>"Cooking is balance. Too much of anything and it's ruined. Too little and it's nothing."</em></p>
                                    <p><em>"War is the same. Too much anger and you break. Too little and you die. Balance. Always balance."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", 2); applyStatChange("morale", 1, {silent:true}); }
                    },
                    { 
                        text: "Ask how he learned that.", 
                        response: function(gs) {
                            return `<p>The Cook smiles. A rare thing. <em>"I was an apprentice. In a kitchen. A real kitchen. Not this."</em></p>
                                    <p>He gestures at the camp. <em>"I learned from a master. A man who knew every herb. Every spice. Every measure. He taught me that cooking is mathematics. Precision. Not guesswork."</em></p>
                                    <p><em>"Then the war came. The master closed his kitchen. I took up the sword. But I kept what I learned. The precision. The balance."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", 2); if (!gs.flags) gs.flags = {}; gs.flags.cook_apprentice_hint = true; }
                    },
                    { 
                        text: "\"This salt speech is bullshit, Cook.\"", 
                        response: function(gs) {
                            return `<p>The Cook looks at you. Really looks. <em>"Bullshit? You think caring about food is bullshit?"</em></p>
                                    <p>He holds up the salt. <em>"This. This keeps men alive. Too little, they hate you. Too much, they thirst. You think that's bullshit?"</em></p>
                                    <p><em>"Fine. It's bullshit. But it's the bullshit that keeps you fed. That keeps you healthy. That keeps you alive."</em></p>
                                    <p>He throws the salt in the pot. <em>"You want to call it bullshit? Go ahead. But don't complain when the food tastes like shit. Because I stopped caring."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", -2); applyStatChange("stress", 1, {silent:true}); applyStatChange("morale", 1, {silent:true}); }
                    },
                    { 
                        text: "Joke about boiling your belt instead.", 
                        response: function(gs) {
                            return `<p>The Cook doesn't smile. <em>"I've done that. Boiled leather. Boiled roots. Boiled things you wouldn't believe."</em></p>
                                    <p><em>"When you're hungry enough, you'll eat anything. When you're desperate enough, you'll try anything."</em></p>
                                    <p>He stirs the pot. <em>"But that's not cooking. That's survival. There's a difference."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", 0); applyStatChange("morale", 1, {silent:true}); applyStatChange("stress", 1, {silent:true}); }
                    },
                    { 
                        text: "\"You're a fucking idiot, Cook.\"", 
                        response: function(gs) {
                            return `<p>The Cook stops. The spoon stops. Everything stops.</p>
                                    <p>He looks at you. Really looks. <em>"A fucking idiot? For counting salt? For caring about the food?"</em></p>
                                    <p>He sets the spoon down. Carefully. <em>"You know what? Fine. I'm a fucking idiot. But I'm the fucking idiot who keeps you fed. Who keeps you alive."</em></p>
                                    <p><em>"You want to call me names? Go ahead. But when you're hungry. When you're starving. When the food tastes like shit because I stopped caring—remember this moment."</em></p>
                                    <p>He picks up the spoon. Goes back to stirring. <em>"Your choice. Your stomach."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", -2); applyStatChange("stress", 1, {silent:true}); applyStatChange("morale", 2, {silent:true}); }
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Ask about the master's kitchen.",
                        response: function(gs) {
                            return `<p>The Cook's eyes get distant. <em>"It was in London. A big house. The master cooked for nobles. Rich men. Men who'd never known hunger."</em></p>
                                    <p><em>"I learned to make dishes that would make a king weep. Pastries. Sauces. Things that took days to prepare."</em></p>
                                    <p>He looks at the pot. <em>"Now I cook for soldiers. Men who'd eat their own boots if they were hungry enough. But I still use what I learned. The precision. The care."</em></p>
                                    <p><em>"Even in war, there's room for skill. For doing things right."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", 1); if (!gs.flags) gs.flags = {}; gs.flags.cook_master_kitchen = true; }
                    },
                    {
                        text: "Ask why he left the kitchen.",
                        response: function(gs) {
                            return `<p>The Cook is quiet for a long time. <em>"The master died. Plague. The kitchen closed. I had no place to go."</em></p>
                                    <p><em>"A man needs to eat. A man needs coin. The army offered both. So I took up the sword. But I kept the skills. The knowledge."</em></p>
                                    <p>He stirs the pot. <em>"Cooking is still cooking. Whether it's for nobles or soldiers. The principles are the same."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", 1); if (!gs.flags) gs.flags = {}; gs.flags.cook_left_kitchen = true; }
                    },
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            }
        ]
    },
    {
        id: "wat_vulgar_02",
        focus: "wat",
        title: "Wat on Officers",
        minYear: 1337,
        maxYear: null,
        stages: [
            {
                text: function(gs) {
                    return `
                        <p>Wat watches the dark beyond the tents. Like it owes him money.</p>
                        <p><em>"Officers talk about honor. Honor don't stop an arrow. You learn that early or you learn it bleeding."</em></p>
                        <p>He spits again. Angry at the world for being the world.</p>
                    `;
                },
                choices: [
                    { 
                        text: "Ask what he'd do differently in command.", 
                        response: function(gs) {
                            return `<p>Wat laughs. A harsh sound. <em>"In command? I'd keep men alive. That's what I'd do."</em></p>
                                    <p><em>"Officers send men to die for glory. For honor. For stupid reasons. I'd send them to live. To win. To come home."</em></p>
                                    <p><em>"But that's why I'll never be an officer. They don't want men who think. They want men who obey."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 2); if (!gs.flags) gs.flags = {}; gs.flags.wat_command_thoughts = true; }
                    },
                    { 
                        text: "Say you still want honor anyway.", 
                        response: function(gs) {
                            return `<p>Wat's eyes flash. <em>"Honor? You want honor? Honor is a word rich men use to make poor men die."</em></p>
                                    <p><em>"I've seen honorable men die. I've seen dishonorable men live. Which do you think matters more?"</em></p>
                                    <p>He spits. <em>"You want honor? Fine. But don't expect it to save you. It won't."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", -1); applyStatChange("morale", 1, {silent:true}); }
                    },
                    { 
                        text: "Change the subject to tomorrow's march.", 
                        response: function(gs) {
                            return `<p>Wat nods. <em>"Tomorrow. Always tomorrow. Another march. Another battle. Another day closer to home or closer to death."</em></p>
                                    <p><em>"The march will be hard. The ground is rough. The French are close. But we'll make it. We always do."</em></p>
                                    <p>He looks at you. <em>"Just keep your boots on. Keep your eyes open. That's all you need to do."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 0); applyStatChange("stress", -1, {silent:true}); }
                    },
                    { 
                        text: "\"I don't give a shit about your honor speech, Wat.\"", 
                        response: function(gs) {
                            return `<p>Wat's eyes flash. He stands. Towers over you. <em>"You don't give a shit? Fine. You don't have to."</em></p>
                                    <p>He sits back down. Hard. <em>"But I've seen men who didn't give a shit. Seen them die. Seen them bleed out in the mud because they thought they knew better."</em></p>
                                    <p><em>"You want to not give a shit? Go ahead. But don't come crying to me when an arrow finds you because you weren't paying attention."</em></p>
                                    <p>He spits. <em>"Your funeral."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", -2); applyStatChange("stress", 1, {silent:true}); applyStatChange("morale", 1, {silent:true}); }
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Ask him if he's ever been in command.",
                        response: function(gs) {
                            return `<p>Wat is quiet. <em>"Once. Small group. Ten men. We got cut off. Separated from the main force."</em></p>
                                    <p><em>"I got them back. All of them. Alive. But the officers didn't like it. I didn't follow orders. I followed sense."</em></p>
                                    <p><em>"That's the problem. Sense and orders don't always match. And when they don't, you have to choose."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); if (!gs.flags) gs.flags = {}; gs.flags.wat_commanded = true; }
                    },
                    {
                        text: "Nod and let the conversation end.",
                        response: function(gs) {
                            return `<p>You sit in silence. Wat watches the fire. Sometimes words aren't needed.</p>
                                    <p>After a while, Wat speaks. <em>"You're learning. That's good."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); applyStatChange("stress", -1, {silent:true}); }
                    },
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            }
        ]
    },
    {
        id: "cook_story_home_02",
        focus: "cook",
        title: "A Question Asked Plainly",
        minYear: 1337,
        maxYear: null,
        stages: [
            {
                text: function(gs) {
                    return `
                        <p>The Cook stirs the pot until it makes the same sound twice. Then he stops.</p>
                        <p><em>"Where did you sleep when you were small."</em> he says. Not <em>why</em>. Not <em>with whom</em>. Just the fact.</p>
                        <p>Wat snorts like the question insults him. The Cook waits anyway.</p>
                    `;
                },
                choices: [
                    { 
                        text: "\"In a crowded room. Always noise.\"", 
                        response: function(gs) {
                            return `<p>The Cook nods. <em>"Crowded. Many voices. Many sounds. You learned to sleep through it. To find peace in chaos."</em></p>
                                    <p><em>"That's useful. In war, there's always noise. Always chaos. Men who need quiet don't last long."</em></p>
                                    <p>He stirs the pot. <em>"You adapted. That's what matters. Adaptation. Survival."</em></p>`;
                        },
                        effects: function(gs) { if (!gs.flags) gs.flags = {}; gs.flags.backstory_home = "crowded"; changeRel("cook", 2); }
                    },
                    { 
                        text: "\"In a place that was quiet.\"", 
                        response: function(gs) {
                            return `<p>The Cook looks at you. Really looks. <em>"Quiet. That's rare. Most men never know quiet. Not really."</em></p>
                                    <p><em>"Quiet is a luxury. In war, you lose it. The noise. The chaos. It never stops."</em></p>
                                    <p><em>"But if you knew quiet once, you can find it again. Inside. Even when everything around you is loud."</em></p>`;
                        },
                        effects: function(gs) { if (!gs.flags) gs.flags = {}; gs.flags.backstory_home = "quiet"; changeRel("cook", 2); applyStatChange("stress", -1, {silent:true}); }
                    },
                    { 
                        text: "\"Does it matter.\"", 
                        response: function(gs) {
                            return `<p>The Cook is quiet. Wat snorts again. <em>"See? Some men don't want to talk. Don't want to remember."</em></p>
                                    <p>The Cook stirs. <em>"It matters. Everything matters. Where you came from. What you remember. It shapes who you are."</em></p>
                                    <p><em>"But if you don't want to talk, that's your choice. I won't force it."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", -1); changeRel("wat", 1); }
                    },
                    { 
                        text: "\"Fuck off with your questions, Cook.\"", 
                        response: function(gs) {
                            return `<p>The Cook stops. Wat looks at you. Really looks.</p>
                                    <p>The Cook speaks. Quietly. <em>"Fuck off? You want me to fuck off? Fine. I'll fuck off."</em></p>
                                    <p>He sets down the spoon. <em>"But remember. I'm the one who feeds you. I'm the one who keeps you alive. You want to tell me to fuck off? That's your choice."</em></p>
                                    <p>Wat grunts. <em>"That was stupid. But honest. I'll give you that."</em></p>
                                    <p>The Cook goes back to stirring. But something's changed. The warmth is gone.</p>`;
                        },
                        effects: function(gs) { changeRel("cook", -2); changeRel("wat", 0); applyStatChange("stress", 2, {silent:true}); applyStatChange("morale", 1, {silent:true}); }
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Ask the Cook where he slept.",
                        response: function(gs) {
                            return `<p>The Cook smiles. A sad smile. <em>"In the kitchen. On the floor. By the fire."</em></p>
                                    <p><em>"The master let me sleep there. Said the fire would keep me warm. Said I'd learn to cook in my sleep."</em></p>
                                    <p><em>"I did. I learned everything there. The sounds. The smells. The rhythm of it. It became home."</em></p>
                                    <p><em>"Then the war came. The kitchen closed. I lost my home. But I kept the knowledge. The skills."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", 2); if (!gs.flags) gs.flags = {}; gs.flags.cook_home_story = true; }
                    },
                    {
                        text: "Nod and let the silence return.",
                        response: function(gs) {
                            return `<p>The fire crackles. The Cook stirs. Wat watches the dark.</p>
                                    <p>Sometimes questions don't need answers. Sometimes the asking is enough.</p>`;
                        },
                        effects: function(gs) { changeRel("cook", 1); applyStatChange("stress", -1, {silent:true}); }
                    },
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            }
        ]
    },
    {
        id: "odd_couple_03",
        focus: "both",
        title: "Wat and the Cook Argue About Knives",
        minYear: 1337,
        maxYear: null,
        stages: [
            {
                text: function(gs) {
                    return `
                        <p>Wat sharpens his blade like he means to cut the whole war open and look inside it.</p>
                        <p>The Cook says, calm as a ledger: <em>"That edge will fold. You're rushing."</em></p>
                        <p>Wat growls. <em>"I've killed with worse."</em> The Cook nods. <em>"I know."</em></p>
                        <p>For a moment the fire is the only thing that speaks.</p>
                    `;
                },
                choices: [
                    { 
                        text: "Side with Wat: \"If it cuts, it cuts.\"", 
                        response: function(gs) {
                            return `<p>Wat grunts. <em>"See? He understands. A blade is a blade. If it cuts, it works."</em></p>
                                    <p>The Cook shakes his head. <em>"A blade that folds is a blade that fails. When you need it most. When your life depends on it."</em></p>
                                    <p>Wat stops sharpening. Looks at the Cook. <em>"I've never had a blade fail me. Not when it mattered."</em></p>
                                    <p><em>"Not yet,"</em> the Cook says quietly.</p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); changeRel("cook", -1); }
                    },
                    { 
                        text: "Side with the Cook: \"Let him show you.\"", 
                        response: function(gs) {
                            return `<p>The Cook nods. <em>"Thank you. A proper edge takes time. Takes care. Rushing ruins it."</em></p>
                                    <p>Wat scowls. <em>"I don't need lessons. I've been sharpening blades longer than you've been cooking."</em></p>
                                    <p>The Cook takes the blade. Examines it. <em>"Time doesn't mean skill. I've seen men who've done things wrong for years. Still wrong."</em></p>
                                    <p>He hands it back. <em>"But it's your blade. Your choice."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", 1); changeRel("wat", -1); }
                    },
                    { 
                        text: "Defuse it: \"Both of you are right.\"", 
                        response: function(gs) {
                            return `<p>Wat and the Cook both look at you. The tension breaks.</p>
                                    <p>Wat grunts. <em>"Maybe. Maybe we're both right. Maybe we're both wrong."</em></p>
                                    <p>The Cook stirs the pot. <em>"There's truth in that. Different methods. Different needs. Both valid."</em></p>
                                    <p>Wat resumes sharpening. Slower now. More careful. <em>"I'll think about it."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 0); changeRel("cook", 0); applyStatChange("morale", 1, {silent:true}); }
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Ask Wat why he sharpens so aggressively.",
                        response: function(gs) {
                            return `<p>Wat doesn't look up. <em>"Anger. That's why. I sharpen when I'm angry. When I need to do something. When I can't sit still."</em></p>
                                    <p><em>"The blade needs to be sharp. Always. But the sharpening? That's for me. Keeps my hands busy. Keeps my mind focused."</em></p>
                                    <p><em>"The Cook's right. I rush. But rushing is better than sitting. Better than thinking. Better than remembering."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); if (!gs.flags) gs.flags = {}; gs.flags.wat_sharpening_reason = true; }
                    },
                    {
                        text: "Ask the Cook about proper blade care.",
                        response: function(gs) {
                            return `<p>The Cook sets down his spoon. <em>"A blade is a tool. Like a pot. Like a fire. It needs care. Needs respect."</em></p>
                                    <p><em>"You don't rush a meal. You don't rush a blade. Both will fail you if you do."</em></p>
                                    <p><em>"Wat's method works. For him. But there's a better way. A way that preserves the blade. That makes it last."</em></p>
                                    <p><em>"But some men need the anger. Need the rush. I understand that."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", 1); if (!gs.flags) gs.flags = {}; gs.flags.cook_blade_care = true; }
                    },
                    {
                        text: "Let the silence return.",
                        response: function(gs) {
                            return `<p>The fire crackles. Wat sharpens. The Cook stirs. The tension fades.</p>
                                    <p>Sometimes peace comes from letting things be. From not forcing resolution.</p>`;
                        },
                        effects: function(gs) { changeRel("wat", 0); changeRel("cook", 0); applyStatChange("stress", -1, {silent:true}); }
                    },
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            }
        ]
    },
    {
        id: "wat_scars_04",
        focus: "wat",
        title: "Counting Scars",
        minYear: 1337,
        maxYear: null,
        stages: [
            {
                text: function(gs) {
                    return `
                        <p>Wat rolls his sleeve and there are old marks on him like tally lines.</p>
                        <p><em>"This one was a billhook. This one was a dog. This one was my own fault."</em></p>
                        <p>He puts the sleeve back down like shutting a door.</p>
                    `;
                },
                choices: [
                    { 
                        text: "Ask which one was 'your own fault.'", 
                        response: function(gs) {
                            return `<p>Wat is quiet. Then he rolls the sleeve back up. Points to a long scar on his forearm.</p>
                                    <p><em>"This one. I was drunk. Angry. Got into a fight I shouldn't have. With a man I shouldn't have."</em></p>
                                    <p><em>"He had a knife. I didn't. Stupid. But I was young. Thought I was invincible."</em></p>
                                    <p><em>"I learned. The hard way. But I learned."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 2); if (!gs.flags) gs.flags = {}; gs.flags.wat_fault = true; }
                    },
                    { 
                        text: "Say you're glad he's still here.", 
                        response: function(gs) {
                            return `<p>Wat looks at you. Really looks. <em>"Glad? You're glad I'm here?"</em></p>
                                    <p>He's quiet for a moment. <em>"Most men aren't glad. Most men are afraid. Of me. Of what I've done. Of what I've seen."</em></p>
                                    <p><em>"But you're glad. That's... that's something."</em></p>
                                    <p>He pulls the sleeve down. <em>"Thank you."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 2); applyStatChange("morale", 1, {silent:true}); }
                    },
                    { 
                        text: "Look away. Give him dignity.", 
                        response: function(gs) {
                            return `<p>You look away. At the fire. At the dark. Anywhere but at Wat's scars.</p>
                                    <p>After a moment, Wat speaks. <em>"Thank you. Most men stare. Ask questions. Want to know the stories."</em></p>
                                    <p><em>"But you looked away. Gave me my dignity. That's rare. That's... that's good."</em></p>
                                    <p>He pulls the sleeve down. <em>"I appreciate that."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); applyStatChange("stress", -1, {silent:true}); }
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Ask about the other scars.",
                        response: function(gs) {
                            return `<p>Wat considers. Then he points. <em>"The billhook. That was at a village. French farmer. Desperate. Fought like a demon."</em></p>
                                    <p><em>"The dog. That was in Scotland. Wild thing. Attacked me in the dark. Nearly took my arm."</em></p>
                                    <p><em>"Each one has a story. Each one taught me something. About war. About survival. About myself."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); if (!gs.flags) gs.flags = {}; gs.flags.wat_scar_stories = true; }
                    },
                    {
                        text: "Nod and let the silence return.",
                        response: function(gs) {
                            return `<p>You sit in silence. Wat watches the fire. The scars are hidden now. But they're still there. Still part of him.</p>
                                    <p>Sometimes silence is the right response. Sometimes it's the only response.</p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); applyStatChange("stress", -1, {silent:true}); }
                    },
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            }
        ]
    },
    {
        id: "cook_rations_04",
        focus: "cook",
        title: "Bread Like Stones",
        minYear: 1337,
        maxYear: null,
        stages: [
            {
                text: function(gs) {
                    return `
                        <p>The bread is hard enough to strike sparks. The Cook breaks it anyway.</p>
                        <p><em>"Men complain. Then they eat. Complaining is a habit. Eating is a law."</em></p>
                        <p>He hands you the larger piece without looking proud of it.</p>
                    `;
                },
                choices: [
                    { 
                        text: "Take it. Don't insult the gift.", 
                        response: function(gs) {
                            return `<p>The Cook nods. <em>"Good. You understand. A gift is a gift. Even if it's hard bread. Even if it's not much."</em></p>
                                    <p><em>"I've seen men refuse. Seen them throw it back. Seen them complain. But they still eat it. Eventually. When hunger wins."</em></p>
                                    <p><em>"Better to accept with grace. Better to be grateful. Even for little things."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", 2); applyStatChange("morale", 1, {silent:true}); }
                    },
                    { 
                        text: "Trade pieces anyway.", 
                        response: function(gs) {
                            return `<p>The Cook looks surprised. <em>"You'd trade? Give me the larger piece?"</em></p>
                                    <p>He takes it. Looks at it. <em>"That's... that's kind. Unnecessary. But kind."</em></p>
                                    <p><em>"Most men take what they can get. You give. That's rare. That's good."</em></p>
                                    <p>He breaks the bread. Shares it back. <em>"We'll share. Both of us. That's fair."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", 3); changeRel("wat", 0); }
                    },
                    { 
                        text: "Give it to Wat instead.", 
                        response: function(gs) {
                            return `<p>The Cook watches you give the bread to Wat. Wat looks surprised. Takes it. Nods.</p>
                                    <p>The Cook speaks. <em>"You gave it away. To him. Why?"</em></p>
                                    <p>Wat grunts. <em>"Because he's a good man. That's why."</em></p>
                                    <p>The Cook looks at you. <em>"Yes. Yes, he is."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 2); changeRel("cook", 0); }
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Ask why the bread is so hard.",
                        response: function(gs) {
                            return `<p>The Cook sighs. <em>"Old bread. Stale bread. Bread that's been carried for days. Weeks maybe."</em></p>
                                    <p><em>"I do what I can. Soak it. Soften it. But sometimes there's nothing to soak it in. No water. No broth. Nothing."</em></p>
                                    <p><em>"So it stays hard. Like stone. But it's still food. Still nourishment. Still life."</em></p>
                                    <p><em>"Hard bread is better than no bread. Always."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", 1); if (!gs.flags) gs.flags = {}; gs.flags.cook_bread_story = true; }
                    },
                    {
                        text: "Thank him for the bread.",
                        response: function(gs) {
                            return `<p>The Cook smiles. A rare thing. <em>"You're welcome. It's not much. But it's what I have."</em></p>
                                    <p><em>"Gratitude. That's rare too. Most men just take. Don't thank. Don't appreciate."</em></p>
                                    <p><em>"But you do. That means something. To me. It means something."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", 1); applyStatChange("morale", 1, {silent:true}); }
                    },
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            }
        ]
    },
    {
        id: "both_watch_05",
        focus: "both",
        title: "Night Watch",
        minYear: 1337,
        maxYear: null,
        stages: [
            {
                text: function(gs) {
                    return `
                        <p>You draw watch with Wat and the Cook. An odd draw. A hard man and a quiet man and you between them.</p>
                        <p>Wat listens for trouble. The Cook listens for the wind changing. Both kinds of listening feel useful.</p>
                    `;
                },
                choices: [
                    { 
                        text: "Ask Wat what he listens for.", 
                        response: function(gs) {
                            return `<p>Wat doesn't look at you. Keeps watching the dark. <em>"Footsteps. Voices. The sound of metal. The sound of men moving who shouldn't be moving."</em></p>
                                    <p><em>"I listen for the enemy. For danger. For anything that means we're not alone out here."</em></p>
                                    <p><em>"Most men don't listen. They hear. But they don't listen. There's a difference. Listening means understanding. Hearing is just noise."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 2); if (!gs.flags) gs.flags = {}; gs.flags.wat_listening = true; }
                    },
                    { 
                        text: "Ask the Cook what the wind means.", 
                        response: function(gs) {
                            return `<p>The Cook closes his eyes. Listens. <em>"The wind tells you things. Weather. Direction. Distance."</em></p>
                                    <p><em>"A change in wind means a change in weather. Rain coming. Or cold. Or clear skies."</em></p>
                                    <p><em>"The direction tells you where you are. Where you're going. The sound tells you how far things are. How close."</em></p>
                                    <p><em>"Everything speaks. If you know how to listen."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", 2); if (!gs.flags) gs.flags = {}; gs.flags.cook_wind = true; }
                    },
                    { 
                        text: "Say nothing. Just keep watch.", 
                        response: function(gs) {
                            return `<p>You keep watch. Silent. Listening. Watching.</p>
                                    <p>After a while, Wat speaks. <em>"Good. You're learning. Silence is a weapon. Listening is a skill."</em></p>
                                    <p>The Cook nods. <em>"You understand. Not everything needs words. Sometimes the watching is enough."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); changeRel("cook", 1); applyStatChange("morale", 1, {silent:true}); applyStatChange("stress", -1, {silent:true}); }
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Ask how they learned to listen so well.",
                        response: function(gs) {
                            return `<p>Wat grunts. <em>"Survival. That's how. You learn or you die. Simple."</em></p>
                                    <p>The Cook nods. <em>"Experience. Years of it. Paying attention. Noticing things others miss."</em></p>
                                    <p><em>"Wat listens for danger. I listen for change. Both are important. Both keep you alive."</em></p>
                                    <p>Wat looks at you. <em>"You'll learn. If you live long enough. If you pay attention."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); changeRel("cook", 1); }
                    },
                    {
                        text: "Continue keeping watch in silence.",
                        response: function(gs) {
                            return `<p>The three of you keep watch. Silent. Together. Each listening in your own way.</p>
                                    <p>There's comfort in that. In the shared silence. In the shared duty.</p>
                                    <p>After a while, the watch ends. But the memory of it remains. The peace of it.</p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); changeRel("cook", 1); applyStatChange("stress", -2, {silent:true}); }
                    },
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            }
        ]
    },
    {
        id: "wat_fury_06",
        focus: "wat",
        title: "Wat's Temper",
        minYear: 1337,
        maxYear: null,
        stages: [
            {
                text: function(gs) {
                    return `
                        <p>Wat curses at a loose strap. At damp wood. At a pot that won't boil.</p>
                        <p>Small things. But his anger is real. He stays sharp by staying angry. Complacency kills men. He's seen it.</p>
                        <p>He looks at you. <em>"Don't drift,"</em> he says. <em>"Drifting gets you killed."</em></p>
                    `;
                },
                choices: [
                    { 
                        text: "Promise you won't drift.", 
                        response: function(gs) {
                            return `<p>Wat grunts. <em>"Good. Keep that promise. Men who drift end up dead. Or worse. They end up broken."</em></p>
                                    <p>He adjusts his sword. The firelight catches the edge. <em>"You see that? Sharp. Always sharp. Because I check. Every day. Every night. That's not drifting."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); applyStatChange("morale", 1, {silent:true}); }
                    },
                    { 
                        text: "Tell him he's burning himself out.", 
                        response: function(gs) {
                            return `<p>Wat's eyes flash. <em>"Burning out? You think I'm burning out?"</em></p>
                                    <p>He stands. Towers over you. <em>"I've seen men who 'relaxed.' I've seen them die. You want to burn out? Fine. But don't tell me I'm wrong."</em></p>
                                    <p>He sits back down. The anger doesn't leave. It just settles deeper.</p>`;
                        },
                        effects: function(gs) { changeRel("wat", -1); if (!gs.flags) gs.flags = {}; gs.flags.wat_called_out = true; }
                    },
                    { 
                        text: "Make a small joke to break the edge.", 
                        response: function(gs) {
                            return `<p>Wat stares. Then a sound comes out. Not a laugh. Something between a cough and a curse.</p>
                                    <p><em>"Jokes,"</em> he says. <em>"Jokes are fine. But remember. The enemy doesn't joke. The enemy doesn't drift. The enemy kills."</em></p>
                                    <p>He looks back at the fire. <em>"Keep your edge. Even when you joke."</em></p>`;
                        },
                        effects: function(gs) { applyStatChange("morale", 1, {silent:true}); changeRel("wat", 0); applyStatChange("stress", 1, {silent:true}); }
                    },
                    { 
                        text: "\"Fuck off with your drifting speech, Wat.\"", 
                        response: function(gs) {
                            return `<p>Wat stops. Everything stops. The fire seems to hold its breath.</p>
                                    <p>He turns. Slowly. Looks at you. <em>"Fuck off? You want me to fuck off?"</em></p>
                                    <p>He stands. The knife is in his hand. You're not sure when it got there. <em>"Fine. I'll fuck off. But when you drift. When you get lazy. When you die because you weren't paying attention—don't say I didn't warn you."</em></p>
                                    <p>He sits. Hard. <em>"Your choice. Your funeral."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", -2); applyStatChange("stress", 2, {silent:true}); applyStatChange("morale", 2, {silent:true}); }
                    }
                ]
            },
            {
                text: function(gs) {
                    // This will be set by the previous choice's response
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    { 
                        text: "Ask him what happened to make him this way.", 
                        response: function(gs) {
                            return `<p>Wat is quiet for a long time. The fire pops. Sparks fly.</p>
                                    <p><em>"I watched my brother drift,"</em> he says. <em>"One moment he was there. Next moment he wasn't. Arrow through the throat. He'd stopped paying attention. Just for a second."</em></p>
                                    <p>He spits. <em>"That's all it takes. One second."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 2); if (!gs.flags) gs.flags = {}; gs.flags.wat_brother_story = true; }
                    },
                    { 
                        text: "Nod and say nothing.", 
                        response: function(gs) {
                            return `<p>You sit in silence. Wat watches the fire. The anger fades. Just a little.</p>
                                    <p>Sometimes silence is the right answer.</p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); applyStatChange("stress", -1, {silent:true}); }
                    },
                    { 
                        text: "Tell him you understand.", 
                        response: function(gs) {
                            return `<p>Wat looks at you. Really looks. Like he's measuring something.</p>
                                    <p><em>"Maybe you do,"</em> he says. <em>"Maybe you don't. Time will tell."</em></p>
                                    <p>He turns back to the fire. But something in his posture has changed. Slightly. Like a weight shifted.</p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); applyStatChange("morale", 1, {silent:true}); }
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            }
        ]
    },
    {
        id: "cook_names_06",
        focus: "cook",
        title: "Names and Reasons",
        minYear: 1337,
        maxYear: null,
        stages: [
            {
                text: function(gs) {
                    return `
                        <p>The Cook asks, very simply, <em>"Do you like your name."</em></p>
                        <p>Wat scoffs like names are luxuries. The Cook doesn't argue. He just waits.</p>
                    `;
                },
                choices: [
                    { 
                        text: "\"It's all I've got.\"", 
                        response: function(gs) {
                            return `<p>The Cook nods. <em>"A name is a name. It's yours. That's what matters."</em></p>
                                    <p><em>"Some men have grand names. Names that mean something. Names that carry weight."</em></p>
                                    <p><em>"But a simple name? A name that's just yours? That's enough. That's more than enough."</em></p>`;
                        },
                        effects: function(gs) { if (!gs.flags) gs.flags = {}; gs.flags.backstory_name = "only"; changeRel("cook", 2); }
                    },
                    { 
                        text: "\"I took it from someone.\"", 
                        response: function(gs) {
                            return `<p>The Cook looks at you. Really looks. <em>"You took it. From someone. That's... that's a story."</em></p>
                                    <p>Wat stops scoffing. Listens. <em>"A man takes a name, he takes a life. Or he takes a memory. Which is it?"</em></p>
                                    <p>The Cook waits. Wat waits. Both want to know.</p>`;
                        },
                        effects: function(gs) { if (!gs.flags) gs.flags = {}; gs.flags.backstory_name = "taken"; changeRel("cook", 1); changeRel("wat", 1); applyStatChange("stress", 1, {silent:true}); }
                    },
                    { 
                        text: "\"I don't think about it.\"", 
                        response: function(gs) {
                            return `<p>The Cook nods. <em>"Some men don't. Some men just are. Their name is just a sound. Nothing more."</em></p>
                                    <p>Wat grunts. <em>"Names don't matter. Actions do. What you do. Not what you're called."</em></p>
                                    <p>The Cook stirs the pot. <em>"Maybe. But a name can be a burden. Or a gift. Depends on the man."</em></p>`;
                        },
                        effects: function(gs) { if (!gs.flags) gs.flags = {}; gs.flags.backstory_name = "none"; changeRel("cook", 0); changeRel("wat", 1); }
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Ask the Cook about his name.",
                        response: function(gs) {
                            return `<p>The Cook smiles. A sad smile. <em>"My name? It was given to me. By the master. In the kitchen."</em></p>
                                    <p><em>"Before that, I had another name. A different name. But that man is gone. The kitchen man is who I am now."</em></p>
                                    <p><em>"Names change. Men change. That's how it is."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", 2); if (!gs.flags) gs.flags = {}; gs.flags.cook_name_story = true; }
                    },
                    {
                        text: "Ask Wat about his name.",
                        response: function(gs) {
                            return `<p>Wat spits. <em>"Wat. That's it. Just Wat. No more. No less."</em></p>
                                    <p><em>"I've had other names. Names men gave me. Names I earned. But Wat? That's the one that stuck."</em></p>
                                    <p><em>"It's short. Simple. Like me."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); if (!gs.flags) gs.flags = {}; gs.flags.wat_name_story = true; }
                    },
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            }
        ]
    },
    {
        id: "both_song_07",
        focus: "both",
        title: "A Song That Dies Early",
        minYear: 1337,
        maxYear: null,
        stages: [
            {
                text: function(gs) {
                    return `
                        <p>Someone tries to sing. It goes badly and ends fast.</p>
                        <p>Wat mutters something crude. The Cook, without judgment, says: <em>"Wrong key."</em></p>
                        <p>And that is the closest thing to laughter you get all week.</p>
                    `;
                },
                choices: [
                    { 
                        text: "Add a verse anyway.", 
                        response: function(gs) {
                            return `<p>You start singing. Badly. But you keep going. Wat stares. The Cook listens.</p>
                                    <p>After a moment, Wat grunts. <em>"That's... that's terrible. But I'll give you this: you've got guts."</em></p>
                                    <p>The Cook nods. <em>"The key is still wrong. But the spirit is right. That counts for something."</em></p>
                                    <p>Someone else joins in. Then another. The song gets worse. But the mood gets better.</p>`;
                        },
                        effects: function(gs) { applyStatChange("morale", 2, {silent:true}); changeRel("wat", 1); changeRel("cook", 1); }
                    },
                    { 
                        text: "Ask the Cook what key it should be.", 
                        response: function(gs) {
                            return `<p>The Cook looks surprised. <em>"You want to know? Really?"</em></p>
                                    <p>He thinks. <em>"It should be in a minor key. Something sad. Something that fits the war. The loss. The distance from home."</em></p>
                                    <p><em>"But most men don't care about keys. They just want to sing. To feel something. Even if it's wrong."</em></p>
                                    <p>Wat grunts. <em>"Keys. Notes. It's all noise to me. But if it matters to you, Cook, then it matters."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", 2); changeRel("wat", 0); if (!gs.flags) gs.flags = {}; gs.flags.cook_music = true; }
                    },
                    { 
                        text: "Sit it out. Rest your voice.", 
                        response: function(gs) {
                            return `<p>You sit. Watch. Listen. The song dies. The silence returns.</p>
                                    <p>Wat looks at you. <em>"Smart. Sometimes the best thing to do is nothing. Let others make fools of themselves."</em></p>
                                    <p>The Cook stirs the pot. <em>"Rest is good. Your voice will thank you. Your ears will thank you."</em></p>
                                    <p>The peace is welcome. The quiet is welcome.</p>`;
                        },
                        effects: function(gs) { applyStatChange("stress", -2, {silent:true}); changeRel("wat", 0); changeRel("cook", 0); }
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Ask the Cook if he can sing.",
                        response: function(gs) {
                            return `<p>The Cook smiles. A rare thing. <em>"I can. A little. Songs from the kitchen. Songs from home."</em></p>
                                    <p><em>"But I don't sing here. Not in the camp. The songs are too sad. Too full of memory."</em></p>
                                    <p><em>"Some things are better kept inside. Some memories are better left alone."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", 1); if (!gs.flags) gs.flags = {}; gs.flags.cook_singing = true; }
                    },
                    {
                        text: "Ask Wat if he knows any songs.",
                        response: function(gs) {
                            return `<p>Wat spits. <em>"Songs? I know drinking songs. Fighting songs. Songs that'll make your mother cry."</em></p>
                                    <p><em>"But I don't sing them. Not anymore. Songs remind you of things. Things you'd rather forget."</em></p>
                                    <p><em>"I'd rather forget. So I don't sing."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); if (!gs.flags) gs.flags = {}; gs.flags.wat_songs = true; }
                    },
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            }
        ]
    },
    {
        id: "wat_mercy_08",
        focus: "wat",
        title: "Mercy, Wat Says",
        minYear: 1337,
        maxYear: null,
        stages: [
            {
                text: function(gs) {
                    return `
                        <p>Wat stares at the dark and says, like it costs him: <em>"Sometimes you let a man run."</em></p>
                        <p><em>"Not for him,"</em> he adds. <em>"For you."</em></p>
                        <p>The Cook nods once, as if this is a rule in a book he's read.</p>
                    `;
                },
                choices: [
                    { 
                        text: "Agree. Keep your hands clean when you can.", 
                        response: function(gs) {
                            return `<p>Wat looks at you. Really looks. <em>"You understand. Good. Most men don't."</em></p>
                                    <p><em>"Killing is easy. Not killing? That's harder. That takes something. Takes strength."</em></p>
                                    <p><em>"Every man you kill, you carry. Every death, you remember. Let one go, you carry less. Remember less."</em></p>
                                    <p>The Cook nods. <em>"Mercy is a choice. A hard choice. But a good one."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 2); changeRel("cook", 1); applyStatChange("morale", 1, {silent:true}); }
                    },
                    { 
                        text: "Disagree. \"No loose ends.\"", 
                        response: function(gs) {
                            return `<p>Wat's eyes flash. <em>"Loose ends? You think letting a man go is a loose end?"</em></p>
                                    <p><em>"A man you let go, he remembers. He might come back. But he might not. A man you kill, he's gone. But so is a piece of you."</em></p>
                                    <p>The Cook shakes his head. <em>"Killing isn't always the answer. Sometimes mercy is stronger."</em></p>
                                    <p>Wat spits. <em>"Maybe. But loose ends get you killed. I've seen it."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 0); changeRel("cook", -1); applyStatChange("reputation", 1, {silent:true}); }
                    },
                    { 
                        text: "Ask who Wat let run.", 
                        response: function(gs) {
                            return `<p>Wat is quiet. For a long time. Then he speaks. <em>"A boy. Just a boy. Maybe sixteen. Maybe younger."</em></p>
                                    <p><em>"He came at me with a pitchfork. Desperate. Scared. I could have killed him. Easy. But I didn't."</em></p>
                                    <p><em>"I let him run. Watched him go. He looked back once. Then he was gone."</em></p>
                                    <p><em>"That was years ago. I still remember. But I don't regret it. Not for a second."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 2); changeRel("cook", 1); if (!gs.flags) gs.flags = {}; gs.flags.wat_mercy_story = true; }
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Ask if he's ever regretted showing mercy.",
                        response: function(gs) {
                            return `<p>Wat thinks. <em>"Regretted? No. Not really. Some men came back. Some didn't. But I don't regret letting them go."</em></p>
                                    <p><em>"Regret is for things you did wrong. Mercy isn't wrong. It's just... hard."</em></p>
                                    <p><em>"Harder than killing. But sometimes harder is better."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); applyStatChange("morale", 1, {silent:true}); }
                    },
                    {
                        text: "Ask the Cook about mercy.",
                        response: function(gs) {
                            return `<p>The Cook stirs the pot. <em>"Mercy. It's a choice. Like cooking. Like living."</em></p>
                                    <p><em>"You can choose to be hard. To be cruel. Or you can choose to be kind. To show mercy."</em></p>
                                    <p><em>"Both are valid. Both are necessary. But mercy? That's harder. That takes more."</em></p>
                                    <p><em>"Wat understands that. Not many men do."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", 1); changeRel("wat", 0); }
                    },
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            }
        ]
    },
    {
        id: "wat_embers_01",
        focus: "wat",
        title: "Wat Watches the Embers",
        minYear: 1337,
        maxYear: null,
        stages: [
            {
                text: function(gs) {
                    return `
                        <p>Wat watches the fire die. He doesn't feed it. Just watches.</p>
                        <p><em>"Fire's honest. Burns what you give it. Doesn't lie. Doesn't promise."</em></p>
                        <p>He spits. The embers hiss.</p>
                    `;
                },
                choices: [
                    { 
                        text: "Feed the fire yourself.", 
                        response: function(gs) {
                            return `<p>You add wood to the fire. The flames grow. The light returns.</p>
                                    <p>Wat watches. Doesn't stop you. Doesn't thank you. Just watches.</p>
                                    <p>After a moment, he speaks. <em>"You fed it. Good. Fire needs feeding. Like everything else."</em></p>
                                    <p><em>"But you understand. Fire doesn't thank you. It just burns. That's its nature. That's its honesty."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); applyStatChange("morale", 1, {silent:true}); }
                    },
                    { 
                        text: "Ask what he means.", 
                        response: function(gs) {
                            return `<p>Wat looks at you. Really looks. <em>"Fire is honest. It burns. It consumes. It dies. That's it. No lies. No promises."</em></p>
                                    <p><em>"Men lie. Men promise. Men break their word. But fire? Fire just is. It burns what you give it. Nothing more. Nothing less."</em></p>
                                    <p><em>"That's why I watch it. It reminds me. Of what's real. Of what matters."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); applyStatChange("wits", 1, {silent:true}); }
                    },
                    { 
                        text: "Say nothing. Watch with him.", 
                        response: function(gs) {
                            return `<p>You watch. Wat watches. The fire dies. The embers glow. Then fade.</p>
                                    <p>After a long time, Wat speaks. <em>"You watched. You understood. Most men don't. They want to talk. Want to do something."</em></p>
                                    <p><em>"But sometimes watching is enough. Sometimes silence is enough."</em></p>
                                    <p><em>"You're learning. That's good."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); applyStatChange("stress", -1, {silent:true}); }
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Ask if he's always been this way.",
                        response: function(gs) {
                            return `<p>Wat is quiet. <em>"Always? No. I learned. Over time. Over years."</em></p>
                                    <p><em>"I used to talk. Used to promise. Used to lie. Like everyone else."</em></p>
                                    <p><em>"But then I learned. Learned that words don't matter. Actions do. Fire taught me that."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); if (!gs.flags) gs.flags = {}; gs.flags.wat_fire_philosophy = true; }
                    },
                    {
                        text: "Nod and let the silence return.",
                        response: function(gs) {
                            return `<p>You nod. Wat nods. The fire dies. The night deepens.</p>
                                    <p>Sometimes understanding doesn't need words. Sometimes watching is enough.</p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); applyStatChange("stress", -1, {silent:true}); }
                    },
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            }
        ]
    },
    {
        id: "cook_knife_02",
        focus: "cook",
        title: "The Cook's Knife",
        minYear: 1337,
        maxYear: null,
        stages: [
            {
                text: function(gs) {
                    return `
                        <p>The Cook sharpens his knife. Slow. Methodical. Each stroke the same.</p>
                        <p><em>"A dull knife is dangerous. It slips. Cuts wrong. Hurts more than it should."</em></p>
                        <p>He tests the edge. Nods. Puts it away.</p>
                    `;
                },
                choices: [
                    { 
                        text: "Ask if you can borrow it to sharpen yours.", 
                        response: function(gs) {
                            return `<p>The Cook looks at you. Then at your blade. <em>"You want to sharpen yours? Good. A sharp blade is a safe blade."</em></p>
                                    <p>He hands you the stone. <em>"Use this. But watch. Learn. Sharpening is a skill. Like cooking. Like fighting."</em></p>
                                    <p><em>"Take your time. Don't rush. Rushing ruins the edge. Ruins the blade."</em></p>
                                    <p>He watches you work. Guides you. Shows you the right angle. The right pressure.</p>`;
                        },
                        effects: function(gs) { changeRel("cook", 2); applyStatChange("wits", 1, {silent:true}); }
                    },
                    { 
                        text: "Comment on his technique.", 
                        response: function(gs) {
                            return `<p>The Cook smiles. A rare thing. <em>"You noticed. Most men don't. They just see a knife. See sharpening."</em></p>
                                    <p><em>"But there's technique. There's skill. Every stroke matters. Every angle matters."</em></p>
                                    <p><em>"I learned this in the kitchen. From the master. He taught me that tools matter. That care matters."</em></p>
                                    <p><em>"A well-maintained tool is a reliable tool. A sharp knife is a safe knife."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", 2); if (!gs.flags) gs.flags = {}; gs.flags.cook_knife_technique = true; }
                    },
                    { 
                        text: "Watch silently.", 
                        response: function(gs) {
                            return `<p>You watch. The Cook sharpens. The stone moves. The blade glints.</p>
                                    <p>After a while, the Cook speaks. <em>"You watch. That's good. Most men don't. They look. But they don't see."</em></p>
                                    <p><em>"Watching is learning. Seeing is understanding. You're doing both."</em></p>
                                    <p>He finishes. Tests the edge. Nods. <em>"A good edge. A safe edge. That's what matters."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", 1); applyStatChange("stress", -1, {silent:true}); }
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Ask about the master's teaching.",
                        response: function(gs) {
                            return `<p>The Cook's eyes get distant. <em>"The master. He was strict. Demanding. But fair."</em></p>
                                    <p><em>"He taught me that everything has a purpose. Every tool. Every technique. Every moment."</em></p>
                                    <p><em>"A knife isn't just a knife. It's an extension of your hand. Of your will. It needs care. Needs respect."</em></p>
                                    <p><em>"I learned that. I never forgot it."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", 1); if (!gs.flags) gs.flags = {}; gs.flags.cook_master_teaching = true; }
                    },
                    {
                        text: "Ask if you can learn to sharpen like that.",
                        response: function(gs) {
                            return `<p>The Cook looks at you. <em>"You want to learn? Really learn?"</em></p>
                                    <p>He nods. <em>"Good. I can teach you. But it takes time. Takes practice. Takes patience."</em></p>
                                    <p><em>"Most men don't have patience. They want it fast. Want it easy. But sharpening isn't fast. Isn't easy."</em></p>
                                    <p><em>"If you're willing to learn, I'm willing to teach."</em></p>`;
                        },
                        effects: function(gs) { changeRel("cook", 2); applyStatChange("wits", 1, {silent:true}); }
                    },
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            }
        ]
    },
    {
        id: "wat_dreams_03",
        focus: "wat",
        title: "Wat's Dreams",
        minYear: 1337,
        maxYear: null,
        stages: [
            {
                text: function(gs) {
                    return `
                        <p>Wat wakes with a start. Hand on his knife. Eyes wild.</p>
                        <p>He sees you watching. Relaxes. Just a little.</p>
                        <p><em>"Dreams are lies your head tells you. Don't trust them."</em></p>
                    `;
                },
                choices: [
                    { 
                        text: "Ask what he dreamed.", 
                        response: function(gs) {
                            return `<p>Wat is quiet. For a long time. Then he speaks. <em>"I dreamed of Bannockburn. Of the mud. Of the blood. Of the screams."</em></p>
                                    <p><em>"I dreamed of my brother. Of the arrow. Of the moment he fell."</em></p>
                                    <p><em>"I dreamed of things I've done. Things I've seen. Things I can't forget."</em></p>
                                    <p><em>"Dreams are memories. Memories that won't leave. That's why they're lies. They show you what was. Not what is."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 2); if (!gs.flags) gs.flags = {}; gs.flags.wat_dreams = true; }
                    },
                    { 
                        text: "Say you have bad dreams too.", 
                        response: function(gs) {
                            return `<p>Wat looks at you. Really looks. <em>"You do? What do you dream of?"</em></p>
                                    <p>You tell him. The dreams. The nightmares. The things that won't leave.</p>
                                    <p>Wat nods. <em>"We all do. Every man here. Every soldier. Dreams are the price we pay."</em></p>
                                    <p><em>"But they're just dreams. Just memories. They can't hurt you. Not really. Not if you don't let them."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 2); applyStatChange("stress", -1, {silent:true}); }
                    },
                    { 
                        text: "Say nothing. Let him settle.", 
                        response: function(gs) {
                            return `<p>You say nothing. Just watch. Wait. Let Wat settle.</p>
                                    <p>After a while, he speaks. <em>"Thank you. For not asking. For not prying."</em></p>
                                    <p><em>"Most men want to know. Want to hear the stories. But you just... let it be."</em></p>
                                    <p><em>"That's rare. That's good."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); applyStatChange("stress", -1, {silent:true}); }
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Ask if the dreams ever stop.",
                        response: function(gs) {
                            return `<p>Wat shakes his head. <em>"Stop? No. They don't stop. They just... change. Get easier. Or harder. Depends on the day."</em></p>
                                    <p><em>"But they're always there. Always waiting. In the dark. In the quiet."</em></p>
                                    <p><em>"You learn to live with them. Learn to ignore them. But they never really go away."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 1); applyStatChange("stress", 1, {silent:true}); }
                    },
                    {
                        text: "Offer to keep watch so he can rest.",
                        response: function(gs) {
                            return `<p>Wat looks surprised. <em>"You'd do that? Keep watch so I can sleep?"</em></p>
                                    <p>He thinks. Nods. <em>"Thank you. That's... that's kind. Unnecessary. But kind."</em></p>
                                    <p><em>"I'll take you up on that. But just this once. I don't need charity."</em></p>`;
                        },
                        effects: function(gs) { changeRel("wat", 2); applyStatChange("stress", -1, {silent:true}); }
                    },
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            }
        ]
    },
    {
        id: "cook_memory_03",
        focus: "cook",
        title: "The Old Recipe",
        minYear: 1337,
        maxYear: null,
        text: function(gs) {
            return `
                <p>The Cook talks about a recipe from home. A broth. Barley. A little herb.</p>
                <p><em>"People think food is just fuel. It is not. It is memory you can swallow."</em></p>
                <p>Wat rolls his eyes but doesn't interrupt.</p>
            `;
        },
        choices: [
            { text: "Ask what home tastes like.", effects: function(gs) { changeRel("cook", 2); applyStatChange("morale", 1, {silent:true}); } },
            { text: "Say you miss home cooking.", effects: function(gs) { changeRel("cook", 1); applyStatChange("morale", 1, {silent:true}); } },
            { text: "Change the subject.", effects: function(gs) { changeRel("cook", -1); applyStatChange("stress", 1, {silent:true}); } },
            { text: "\"Fuck your memory food speech, Cook. It's just food.\"", effects: function(gs) { changeRel("cook", -2); applyStatChange("stress", 1, {silent:true}); applyStatChange("morale", 1, {silent:true}); } }
        ]
    },
    {
        id: "both_rain_04",
        focus: "both",
        title: "The Rain",
        minYear: 1337,
        maxYear: null,
        text: function(gs) {
            return `
                <p>Rain comes. Not hard. Just steady. The kind that soaks through.</p>
                <p>Wat curses. The Cook moves the pot to keep it dry. Practical.</p>
                <p>You huddle under what cover you can find.</p>
            `;
        },
        choices: [
            { text: "Help The Cook move things.", effects: function(gs) { changeRel("cook", 1); applyStatChange("morale", 1, {silent:true}); } },
            { text: "Share your cover with Wat.", effects: function(gs) { changeRel("wat", 1); } },
            { text: "Just endure it.", effects: function(gs) { applyStatChange("endurance", 1, {silent:true}); applyStatChange("stress", 1, {silent:true}); } }
        ]
    },
    {
        id: "wat_weapon_05",
        focus: "wat",
        title: "Wat's Blade",
        minYear: 1337,
        maxYear: null,
        text: function(gs) {
            return `
                <p>Wat shows you his blade. Old. Notched. But clean.</p>
                <p><em>"This has killed more men than I can count. Some deserved it. Some didn't. The blade don't care."</em></p>
                <p>He sheathes it. Like closing a book.</p>
            `;
        },
        choices: [
            { text: "Ask how long he's had it.", effects: function(gs) { changeRel("wat", 1); if (!gs.flags) gs.flags = {}; gs.flags.wat_weapon_story = true; } },
            { text: "Say it's a good blade.", effects: function(gs) { changeRel("wat", 1); } },
            { text: "Say nothing. Respect the moment.", effects: function(gs) { applyStatChange("stress", -1, {silent:true}); } },
            { text: "\"Fuck your blade speech, Wat. It's just a sword.\"", effects: function(gs) { changeRel("wat", -2); applyStatChange("stress", 1, {silent:true}); applyStatChange("morale", 1, {silent:true}); } }
        ]
    },
    {
        id: "cook_measure_05",
        focus: "cook",
        title: "The Measure",
        minYear: 1337,
        maxYear: null,
        text: function(gs) {
            return `
                <p>The Cook measures water. Counts. Measures again.</p>
                <p><em>"Too much water and it's thin. Too little and it burns. The measure matters."</em></p>
                <p>He looks at you. <em>"Everything has a measure. Even war."</em></p>
            `;
        },
        choices: [
            { text: "Ask what he means.", effects: function(gs) { changeRel("cook", 1); applyStatChange("wits", 1, {silent:true}); } },
            { text: "Nod. You understand.", effects: function(gs) { changeRel("cook", 1); applyStatChange("morale", 1, {silent:true}); } },
            { text: "Say war has no measure.", effects: function(gs) { changeRel("cook", -1); changeRel("wat", 1); } },
            { text: "\"This measure bullshit again? Fuck off, Cook.\"", effects: function(gs) { changeRel("cook", -2); changeRel("wat", 1); applyStatChange("stress", 1, {silent:true}); applyStatChange("morale", 1, {silent:true}); } }
        ]
    },
    {
        id: "wat_fear_06",
        focus: "wat",
        title: "Wat on Fear",
        minYear: 1337,
        maxYear: null,
        text: function(gs) {
            return `
                <p>Wat talks about fear. Not his. Yours.</p>
                <p><em>"Fear keeps you alive. Too much and you freeze. Too little and you die stupid."</em></p>
                <p>He spits. <em>"Find the middle. That's where you live."</em></p>
            `;
        },
        choices: [
            { text: "Ask how he found his middle.", effects: function(gs) { changeRel("wat", 1); applyStatChange("wits", 1, {silent:true}); } },
            { text: "Say you're not afraid.", effects: function(gs) { changeRel("wat", -1); applyStatChange("morale", 1, {silent:true}); } },
            { text: "Admit you're afraid sometimes.", effects: function(gs) { changeRel("wat", 1); applyStatChange("stress", -1, {silent:true}); } },
            { text: "\"Fuck your fear speech, Wat. I'm fine.\"", effects: function(gs) { changeRel("wat", -2); applyStatChange("stress", 1, {silent:true}); applyStatChange("morale", 2, {silent:true}); } }
        ]
    },
    {
        id: "cook_quiet_06",
        focus: "cook",
        title: "The Quiet",
        minYear: 1337,
        maxYear: null,
        text: function(gs) {
            return `
                <p>The Cook works in silence. Wat is loud. The Cook is not.</p>
                <p><em>"Noise doesn't help the cooking. Noise doesn't help the thinking."</em></p>
                <p>He stirs. Watches. Waits.</p>
            `;
        },
        choices: [
            { text: "Ask if he likes the quiet.", effects: function(gs) { changeRel("cook", 1); } },
            { text: "Say you prefer quiet too.", effects: function(gs) { changeRel("cook", 1); applyStatChange("stress", -1, {silent:true}); } },
            { text: "Say nothing. Match his silence.", effects: function(gs) { changeRel("cook", 0); applyStatChange("stress", -1, {silent:true}); } },
            { text: "\"Fuck your quiet speech, Cook. Sometimes noise is good.\"", effects: function(gs) { changeRel("cook", -2); applyStatChange("stress", 1, {silent:true}); applyStatChange("morale", 1, {silent:true}); } }
        ]
    },
    {
        id: "both_death_07",
        focus: "both",
        title: "The Dead Man",
        minYear: 1337,
        maxYear: null,
        text: function(gs) {
            return `
                <p>Someone died today. Not in battle. Sickness. The kind that takes men slow.</p>
                <p>Wat says nothing. The Cook says: <em>"He is done. We are not."</em></p>
                <p>The fire burns. The night passes.</p>
            `;
        },
        choices: [
            { text: "Say a prayer for him.", effects: function(gs) { applyStatChange("morale", 1, {silent:true}); changeRel("cook", 0); changeRel("wat", 0); } },
            { text: "Ask if you knew him.", effects: function(gs) { changeRel("cook", 1); applyStatChange("stress", 1, {silent:true}); } },
            { text: "Say nothing. Just sit.", effects: function(gs) { applyStatChange("stress", -1, {silent:true}); } }
        ]
    },
    {
        id: "wat_luck_08",
        focus: "wat",
        title: "Wat on Luck",
        minYear: 1337,
        maxYear: null,
        text: function(gs) {
            return `
                <p>Wat talks about luck. Spits.</p>
                <p><em>"Luck is for fools. Skill is for men. You want to live? Get skill."</em></p>
                <p>He looks at you. <em>"Luck runs out. Skill don't."</em></p>
            `;
        },
        choices: [
            { text: "Agree. Skill matters more.", effects: function(gs) { changeRel("wat", 1); applyStatChange("wits", 1, {silent:true}); } },
            { text: "Say luck has saved you before.", effects: function(gs) { changeRel("wat", -1); applyStatChange("morale", 1, {silent:true}); } },
            { text: "Ask how to get more skill.", effects: function(gs) { changeRel("wat", 1); applyStatChange("wits", 1, {silent:true}); } }
        ]
    },
    {
        id: "cook_time_08",
        focus: "cook",
        title: "Time and Patience",
        minYear: 1337,
        maxYear: null,
        text: function(gs) {
            return `
                <p>The Cook talks about time. How things take the time they take.</p>
                <p><em>"Rush the bread and it's raw inside. Rush the stew and it tastes like nothing. Rush the war and men die for no reason."</em></p>
                <p>Wat grunts. Doesn't disagree.</p>
            `;
        },
        choices: [
            { text: "Ask if war can be rushed.", effects: function(gs) { changeRel("cook", 1); applyStatChange("wits", 1, {silent:true}); } },
            { text: "Say sometimes you have to rush.", effects: function(gs) { changeRel("cook", -1); changeRel("wat", 1); } },
            { text: "\"Fuck your patience speech, Cook. Sometimes you need to move fast.\"", effects: function(gs) { changeRel("cook", -2); changeRel("wat", 1); applyStatChange("stress", 1, {silent:true}); applyStatChange("morale", 1, {silent:true}); } },
            { text: "Nod. You understand.", effects: function(gs) { changeRel("cook", 1); applyStatChange("stress", -1, {silent:true}); } }
        ]
    },
    {
        id: "both_fire_09",
        focus: "both",
        title: "Tending the Fire",
        minYear: 1337,
        maxYear: null,
        text: function(gs) {
            return `
                <p>The fire needs tending. Wat won't do it. The Cook does.</p>
                <p>Wat says: <em>"Fire's your job, Cook."</em></p>
                <p>The Cook says: <em>"Everything is my job. That is why you are still alive."</em></p>
                <p>Wat has no answer to that.</p>
            `;
        },
        choices: [
            { text: "Help The Cook tend the fire.", effects: function(gs) { changeRel("cook", 1); applyStatChange("morale", 1, {silent:true}); } },
            { text: "Tell Wat to help.", effects: function(gs) { changeRel("wat", -1); changeRel("cook", 1); } },
            { text: "Say nothing. Watch them work it out.", effects: function(gs) { applyStatChange("stress", -1, {silent:true}); } }
        ]
    },
    {
        id: "wat_truth_10",
        focus: "wat",
        title: "A Hard Truth",
        minYear: 1337,
        maxYear: null,
        text: function(gs) {
            return `
                <p>Wat tells you a truth. Hard. Uncomfortable.</p>
                <p><em>"Most men die because they believe lies. About honor. About glory. About what matters."</em></p>
                <p>He looks at you. <em>"Don't be one of them."</em></p>
            `;
        },
        choices: [
            { text: "Ask what the truth is.", effects: function(gs) { changeRel("wat", 1); applyStatChange("wits", 1, {silent:true}); } },
            { text: "Say you already know the truth.", effects: function(gs) { changeRel("wat", 0); applyStatChange("morale", 1, {silent:true}); } },
            { text: "Say nothing. Think on it.", effects: function(gs) { applyStatChange("wits", 1, {silent:true}); applyStatChange("stress", 1, {silent:true}); } },
            { text: "\"Fuck your truth speech, Wat. I'll figure it out myself.\"", effects: function(gs) { changeRel("wat", -2); applyStatChange("stress", 1, {silent:true}); applyStatChange("morale", 2, {silent:true}); } }
        ]
    },
    {
        id: "cook_hands_10",
        focus: "cook",
        title: "The Cook's Hands",
        minYear: 1337,
        maxYear: null,
        text: function(gs) {
            return `
                <p>The Cook shows you his hands. Scars. Burns. Old wounds.</p>
                <p><em>"These hands have done many things. Cooked. Mended. Held. Killed."</em></p>
                <p>He puts them back to work. Like it's nothing.</p>
            `;
        },
        choices: [
            { text: "Ask when he killed.", effects: function(gs) { changeRel("cook", 1); if (!gs.flags) gs.flags = {}; gs.flags.cook_killed = true; } },
            { text: "Say his hands have done good work.", effects: function(gs) { changeRel("cook", 2); applyStatChange("morale", 1, {silent:true}); } },
            { text: "Say nothing. Respect his past.", effects: function(gs) { changeRel("cook", 0); applyStatChange("stress", -1, {silent:true}); } }
        ]
    },
    {
        id: "oana_carving_01",
        focus: "oana",
        title: "Oana Carves",
        minYear: 1337,
        maxYear: null,
        stages: [
            {
                text: function(gs) {
                    return `
                        <p>Oana sits by the fire, a Breton girl with dark hair and quick hands. She carves a wooden bracelet, the knife moving in practiced strokes.</p>
                        <p><em>"They sell better than you'd think,"</em> she says without looking up. <em>"Men buy them for sweethearts back home. Or for themselves. Luck charms."</em></p>
                        <p>The wood curls away from her blade. She works like she's done this a thousand times. Maybe she has.</p>
                    `;
                },
                choices: [
                    { 
                        text: "Ask how she learned to carve.", 
                        response: function(gs) {
                            return `<p>Oana doesn't stop carving. <em>"My father. He was a woodworker. Made furniture. Made tools. Made things that lasted."</em></p>
                                    <p><em>"He taught me. Said a woman should have a trade. Something to fall back on. Something that couldn't be taken away."</em></p>
                                    <p><em>"He was right. When the war came. When everything else was taken. I still had this. The skill. The knowledge."</em></p>
                                    <p>She looks up. Just for a moment. <em>"It's kept me alive. This carving. This trade."</em></p>`;
                        },
                        effects: function(gs) { changeRel("oana", 2); if (!gs.flags) gs.flags = {}; gs.flags.oana_carving_story = true; }
                    },
                    { 
                        text: "Offer to buy one.", 
                        response: function(gs) {
                            return `<p>Oana looks up. Smiles. A small smile. <em>"You want one? Good. They bring luck. Or so men say."</em></p>
                                    <p>She finishes the bracelet. Holds it out. <em>"Here. This one's yours. May it bring you home safe."</em></p>
                                    <p>She takes your coin. Counts it. Nods. <em>"Fair price. Thank you."</em></p>`;
                        },
                        effects: function(gs) { changeRel("oana", 2); applyStatChange("wealth", -12, {silent:true}); applyStatChange("morale", 1, {silent:true}); } // 1 shilling = 12 pence
                    },
                    { 
                        text: "Watch in silence.", 
                        response: function(gs) {
                            return `<p>You watch. Oana carves. The fire crackles. The silence is comfortable. Not awkward.</p>
                                    <p>After a while, she speaks. <em>"You're quiet. I like that. Most men talk. Too much. About things that don't matter."</em></p>
                                    <p><em>"But you watch. You listen. That's rare. That's good."</em></p>`;
                        },
                        effects: function(gs) { changeRel("oana", 1); applyStatChange("stress", -1, {silent:true}); }
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Ask about her father.",
                        response: function(gs) {
                            return `<p>Oana's hands slow. <em>"My father. He's gone. The war took him. Or the plague. I don't know which."</em></p>
                                    <p><em>"But he left me this. The skill. The knowledge. The ability to make something from nothing."</em></p>
                                    <p><em>"That's more than most people have. More than most people get."</em></p>`;
                        },
                        effects: function(gs) { changeRel("oana", 1); if (!gs.flags) gs.flags = {}; gs.flags.oana_father = true; }
                    },
                    {
                        text: "Ask if the bracelets really bring luck.",
                        response: function(gs) {
                            return `<p>Oana laughs. A real laugh. <em>"Do they bring luck? I don't know. But men believe they do. That's what matters."</em></p>
                                    <p><em>"Belief is powerful. If a man thinks a bracelet will keep him safe, maybe it will. Maybe belief is enough."</em></p>
                                    <p><em>"Or maybe it's just wood. Just carving. Just something to hold onto when everything else is gone."</em></p>`;
                        },
                        effects: function(gs) { changeRel("oana", 1); applyStatChange("morale", 1, {silent:true}); }
                    },
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            }
        ]
    },
    {
        id: "oana_breton_02",
        focus: "oana",
        title: "Breton Words",
        minYear: 1337,
        maxYear: null,
        stages: [
            {
                text: function(gs) {
                    return `
                        <p>Oana hums something under her breath. The words are Breton. You don't understand them, but the melody is old. Sad.</p>
                        <p>She catches you listening. <em>"A lullaby,"</em> she says. <em>"My mother sang it. Her mother before her. Now I sing it to myself when the nights are long."</em></p>
                        <p>She goes back to carving. The knife doesn't stop. The song doesn't stop. Both keep her company.</p>
                    `;
                },
                choices: [
                    { 
                        text: "Ask what the words mean.", 
                        response: function(gs) {
                            return `<p>Oana stops carving. Looks at you. <em>"The words? They're about home. About family. About things that are gone."</em></p>
                                    <p><em>"My mother sang it to me. When I was small. When I was safe. When home was still home."</em></p>
                                    <p><em>"Now I sing it to remember. To keep the memory alive. Even if the home is gone. Even if the family is gone."</em></p>
                                    <p>She goes back to carving. The song continues. Quieter now.</p>`;
                        },
                        effects: function(gs) { changeRel("oana", 2); if (!gs.flags) gs.flags = {}; gs.flags.oana_breton_story = true; }
                    },
                    { 
                        text: "Say it sounds beautiful.", 
                        response: function(gs) {
                            return `<p>Oana smiles. A real smile. <em>"Thank you. Most men don't notice. Don't care. But you do."</em></p>
                                    <p><em>"It is beautiful. Even if it's sad. Even if it's about loss. There's beauty in memory. In remembering."</em></p>
                                    <p><em>"My mother had a beautiful voice. Like honey. Like home. I try to remember that. When I sing."</em></p>`;
                        },
                        effects: function(gs) { changeRel("oana", 3); applyStatChange("morale", 1, {silent:true}); }
                    },
                    { 
                        text: "Listen without speaking.", 
                        response: function(gs) {
                            return `<p>You listen. Oana sings. The words are foreign. But the feeling isn't. The sadness. The memory. That's universal.</p>
                                    <p>After a while, she stops. Looks at you. <em>"You listened. Really listened. Most men don't. They hear. But they don't listen."</em></p>
                                    <p><em>"Thank you. For listening. For hearing."</em></p>`;
                        },
                        effects: function(gs) { changeRel("oana", 1); applyStatChange("stress", -1, {silent:true}); }
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Ask about her mother.",
                        response: function(gs) {
                            return `<p>Oana is quiet for a long time. <em>"My mother. She was strong. Stronger than anyone I've ever known."</em></p>
                                    <p><em>"She raised three children. Alone. After my father died. She worked. She fought. She survived."</em></p>
                                    <p><em>"Then the war came. The plague. I don't know which took her. But she's gone. Like everything else."</em></p>
                                    <p><em>"But the song remains. The memory remains. That's something."</em></p>`;
                        },
                        effects: function(gs) { changeRel("oana", 2); if (!gs.flags) gs.flags = {}; gs.flags.oana_mother = true; }
                    },
                    {
                        text: "Ask her to sing it again.",
                        response: function(gs) {
                            return `<p>Oana looks surprised. Then she smiles. <em>"You want me to sing? Really?"</em></p>
                                    <p>She sets down the knife. Closes her eyes. Sings. The words are still foreign. But the melody is clear. Beautiful. Haunting.</p>
                                    <p>When she finishes, she opens her eyes. <em>"Thank you. For asking. For wanting to hear it."</em></p>`;
                        },
                        effects: function(gs) { changeRel("oana", 2); applyStatChange("morale", 2, {silent:true}); applyStatChange("stress", -1, {silent:true}); }
                    },
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            }
        ]
    },
    {
        id: "oana_trade_03",
        focus: "oana",
        title: "The Trade",
        minYear: 1337,
        maxYear: null,
        text: function(gs) {
            const hasWealth = (gs.stats && gs.stats.wealth && gs.stats.wealth > 0) || gs.wealth > 0;
            if (hasWealth) {
                return `
                    <p>Oana looks up from her carving. Her eyes are sharp. Assessing.</p>
                    <p><em>"I have other things to sell,"</em> she says. <em>"Not just bracelets. If you have coin."</em></p>
                    <p>She doesn't say what. She doesn't need to. You know what she means. The camp follows its own rules. Its own economy.</p>
                `;
            } else {
                return `
                    <p>Oana looks at you. Really looks. Then she shakes her head.</p>
                    <p><em>"You're broke,"</em> she says. Not unkind. Just fact. <em>"I can't help you. Not that way. But I can carve you something. For free. This once."</em></p>
                    <p>She picks up a new piece of wood. Starts working. The offer stands.</p>
                `;
            }
        },
        choices: function(gs) {
            const hasWealth = (gs.stats && gs.stats.wealth && gs.stats.wealth > 0) || gs.wealth > 0;
            if (hasWealth) {
                return [
                    { text: "Pay for her company.", effects: function(gs) { changeRel("oana", 1); applyStatChange("wealth", -2, {silent:true}); applyStatChange("morale", 2, {silent:true}); applyStatChange("stress", -1, {silent:true}); }, nextScene: "start" },
                    { text: "Just buy a bracelet.", effects: function(gs) { changeRel("oana", 0); applyStatChange("wealth", -1, {silent:true}); applyStatChange("morale", 1, {silent:true}); }, nextScene: "start" },
                    { text: "Decline politely.", effects: function(gs) { changeRel("oana", 0); }, nextScene: "start" }
                ];
            } else {
                return [
                    { text: "Accept the free bracelet.", effects: function(gs) { changeRel("oana", 2); applyStatChange("morale", 1, {silent:true}); }, nextScene: "start" },
                    { text: "Refuse. You don't need charity.", effects: function(gs) { changeRel("oana", -1); applyStatChange("stress", 1, {silent:true}); }, nextScene: "start" },
                    { text: "Ask why she's being kind.", effects: function(gs) { changeRel("oana", 1); if (!gs.flags) gs.flags = {}; gs.flags.oana_kindness = true; }, nextScene: "start" }
                ];
            }
        }
    },
    {
        id: "oana_wounds_04",
        focus: "oana",
        title: "Oana's Hands",
        minYear: 1337,
        maxYear: null,
        stages: [
            {
                text: function(gs) {
                    return `
                        <p>Oana shows you her hands. Calluses from the knife. Small scars. Old cuts that healed wrong.</p>
                        <p><em>"Every bracelet costs something,"</em> she says. <em>"Not just the wood. The time. The cuts. The nights I could have been sleeping."</em></p>
                        <p>She flexes her fingers. The joints are stiff. From carving. From cold. From work that never ends.</p>
                    `;
                },
                choices: [
                    { 
                        text: "Ask if it's worth it.", 
                        response: function(gs) {
                            return `<p>Oana looks at her hands. Really looks. <em>"Worth it? I don't know. Sometimes I think yes. Sometimes I think no."</em></p>
                                    <p><em>"The hands hurt. The fingers ache. The scars remind me of every mistake. Every cut. Every night I spent carving instead of sleeping."</em></p>
                                    <p><em>"But it's kept me alive. The carving. The selling. The coin. That's worth something. That's worth everything."</em></p>`;
                        },
                        effects: function(gs) { changeRel("oana", 2); if (!gs.flags) gs.flags = {}; gs.flags.oana_worth_it = true; }
                    },
                    { 
                        text: "Say her work is beautiful.", 
                        response: function(gs) {
                            return `<p>Oana looks surprised. Then she smiles. A real smile. <em>"Beautiful? You think so?"</em></p>
                                    <p>She holds up a bracelet. Turns it in the firelight. <em>"I try. I really try. To make them beautiful. To make them mean something."</em></p>
                                    <p><em>"But most men don't see that. They just see a trinket. A thing to buy. Not the work. Not the skill. Not the... the beauty."</em></p>
                                    <p><em>"Thank you. For seeing it. For saying it."</em></p>`;
                        },
                        effects: function(gs) { changeRel("oana", 3); applyStatChange("morale", 1, {silent:true}); }
                    },
                    { 
                        text: "Offer to help with the carving.", 
                        response: function(gs) {
                            return `<p>Oana looks at you. Really looks. <em>"You'd help? Really?"</em></p>
                                    <p>She considers. <em>"I appreciate the offer. But carving... it's not just skill. It's... it's personal. It's mine."</em></p>
                                    <p><em>"I've been doing this for years. Alone. It's how I survive. How I cope. I don't know if I could share that."</em></p>
                                    <p><em>"But thank you. For offering. That means something."</em></p>`;
                        },
                        effects: function(gs) { changeRel("oana", 1); applyStatChange("stress", 1, {silent:true}); }
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Ask if her hands will ever heal.",
                        response: function(gs) {
                            return `<p>Oana flexes her fingers. <em>"Heal? Some of them will. Some won't. The old cuts? They're scars now. They'll always be scars."</em></p>
                                    <p><em>"The stiffness? That might get better. If I stop carving. If I rest. But I can't stop. I can't rest."</em></p>
                                    <p><em>"So the hands will hurt. The fingers will ache. That's the price. That's what it costs."</em></p>`;
                        },
                        effects: function(gs) { changeRel("oana", 1); applyStatChange("stress", 1, {silent:true}); }
                    },
                    {
                        text: "Ask to see one of her bracelets up close.",
                        response: function(gs) {
                            return `<p>Oana picks up a bracelet. Holds it out. <em>"Here. Look at it. Really look."</em></p>
                                    <p>You examine it. The carving is intricate. Detailed. Beautiful. <em>"This is amazing. The detail. The skill."</em></p>
                                    <p>Oana smiles. <em>"Thank you. I put everything into each one. Every cut. Every stroke. It's all there. In the wood."</em></p>`;
                        },
                        effects: function(gs) { changeRel("oana", 2); applyStatChange("morale", 1, {silent:true}); }
                    },
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            }
        ]
    },
    {
        id: "oana_camp_life_05",
        focus: "oana",
        title: "Camp Life",
        minYear: 1337,
        maxYear: null,
        stages: [
            {
                text: function(gs) {
                    return `
                        <p>Oana sits by the fire, carving. Around her, the camp moves. Men. Women. The business of survival.</p>
                        <p><em>"You think this is hard?"</em> she asks. <em>"Try being a woman in a war camp. Try being Breton in an English army."</em></p>
                        <p>She doesn't look up. The knife keeps moving. Like it's the only thing that makes sense.</p>
                    `;
                },
                choices: [
                    {
                        text: "Ask what she means.",
                        response: function(gs) {
                            return `<p>Oana pauses. The knife stops. Just for a moment.</p>
                                   <p><em>"I mean I'm always a foreigner here. Always an outsider. Even when I'm useful. Even when I'm needed."</em></p>
                                   <p>She goes back to carving. The subject is closed.</p>`;
                        },
                        effects: function(gs) { changeRel("oana", 1); if (!gs.flags) gs.flags = {}; gs.flags.oana_outsider = true; }
                    },
                    {
                        text: "Say you understand.",
                        response: function(gs) {
                            return `<p>Oana looks at you. Really looks. Like she's measuring your words.</p>
                                   <p><em>"Do you?"</em> she says. <em>"Maybe. Maybe not. But it's nice that you say it."</em></p>`;
                        },
                        effects: function(gs) { changeRel("oana", 2); applyStatChange("morale", 1, {silent:true}); }
                    },
                    {
                        text: "Change the subject to her bracelets.",
                        response: function(gs) {
                            return `<p>Oana smiles. A real smile. The first you've seen.</p>
                                   <p><em>"Now that's a subject I can talk about,"</em> she says. <em>"Each one is different. Each one tells a story. Even if no one knows what the story is."</em></p>`;
                        },
                        effects: function(gs) { changeRel("oana", 1); applyStatChange("stress", -1, {silent:true}); }
                    }
                ]
            }
        ]
    },
    {
        id: "oana_memory_06",
        focus: "oana",
        title: "A Memory",
        minYear: 1337,
        maxYear: null,
        stages: [
            {
                text: function(gs) {
                    return `
                        <p>Oana carves a bracelet. This one is different. More careful. More deliberate.</p>
                        <p><em>"This one's for my sister,"</em> she says. <em>"Or it would be. If I could get it to her. If I knew where she was. If she's still alive."</em></p>
                        <p>She holds it up to the firelight. The wood glows. The carving catches the light. It's beautiful. And it will never be delivered.</p>
                    `;
                },
                choices: [
                    { 
                        text: "Ask about her sister.", 
                        response: function(gs) {
                            return `<p>Oana's hands slow. Stop. <em>"My sister. Her name was Elen. She was younger. Prettier. Smarter."</em></p>
                                    <p><em>"When the war came, we were separated. I went one way. She went another. I don't know where. I don't know if she's alive."</em></p>
                                    <p><em>"I carve these bracelets. For her. Even though I'll never give them to her. Even though she'll never see them."</em></p>
                                    <p><em>"It's stupid. I know it's stupid. But it's all I have. All I can do."</em></p>`;
                        },
                        effects: function(gs) { changeRel("oana", 2); if (!gs.flags) gs.flags = {}; gs.flags.oana_sister_story = true; applyStatChange("stress", 1, {silent:true}); }
                    },
                    { 
                        text: "Say you hope she finds her.", 
                        response: function(gs) {
                            return `<p>Oana looks at you. Really looks. <em>"You hope? Really?"</em></p>
                                    <p>She smiles. A sad smile. <em>"I hope too. Every day. Every night. I hope."</em></p>
                                    <p><em>"But hope doesn't find people. Hope doesn't bring them back. Hope is just... hope."</em></p>
                                    <p><em>"Still. It's nice to hear. Nice to know someone else hopes. Even if it's just words."</em></p>`;
                        },
                        effects: function(gs) { changeRel("oana", 2); applyStatChange("morale", 1, {silent:true}); }
                    },
                    { 
                        text: "Offer to help deliver it someday.", 
                        response: function(gs) {
                            return `<p>Oana looks surprised. <em>"You'd do that? Really? Help me find her? Deliver it?"</em></p>
                                    <p>She considers. <em>"That's... that's kind. More than kind. That's... that's something I never expected."</em></p>
                                    <p><em>"I don't know if it's possible. I don't know if she's alive. But the offer... the offer means something."</em></p>
                                    <p><em>"Thank you. For offering. For caring. That's rare. That's good."</em></p>`;
                        },
                        effects: function(gs) { changeRel("oana", 2); applyStatChange("stress", 1, {silent:true}); }
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Ask what Elen was like.",
                        response: function(gs) {
                            return `<p>Oana's eyes get distant. <em>"Elen. She was... she was everything. Bright. Happy. Full of life."</em></p>
                                    <p><em>"She could make anyone laugh. Could make anyone smile. Even in the worst times. Even when everything was falling apart."</em></p>
                                    <p><em>"She was my light. My hope. My reason to keep going. And then she was gone."</em></p>
                                    <p><em>"I miss her. Every day. Every night. I miss her."</em></p>`;
                        },
                        effects: function(gs) { changeRel("oana", 1); applyStatChange("stress", 1, {silent:true}); }
                    },
                    {
                        text: "Ask if there's any way to find her.",
                        response: function(gs) {
                            return `<p>Oana shakes her head. <em>"Find her? I don't know. The war scattered everyone. Families. Friends. Everyone."</em></p>
                                    <p><em>"I've asked. I've searched. I've looked. But there's nothing. No trace. No sign."</em></p>
                                    <p><em>"Maybe she's dead. Maybe she's alive. I don't know. I'll never know."</em></p>
                                    <p><em>"But I keep carving. Keep hoping. That's all I can do."</em></p>`;
                        },
                        effects: function(gs) { changeRel("oana", 1); if (!gs.flags) gs.flags = {}; gs.flags.oana_search_sister = true; }
                    },
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },
                        isExit: true
                    }
                ]
            },
            {
                text: function(gs) {
                    return gs.campfire.currentResponse || '';
                },
                choices: [
                    {
                        text: "Turn in for the night.",
                        effects: function(gs) { applyStatChange("stress", -1, {silent:true}); },

    // ===== COOK CAMPFIRE SCENES =====

    campfire_cook_01_the_stew: {
        title: "The Stew",
        year: 1346,
        age: function() { return gameState.age || 18; },
        location: "Near Caen",
        artwork: "artwork/campfire.jpg",
        artworkCaption: "A soldier shares a meal by the campfire",
        text: function(gs) {
            const cookRel = gs.relationships?.cook || 0;
            return `<p>The cook stirs a large pot over the fire, the rich aroma of stew filling the air. He glances up as you approach.</p>
                    <p><em>"Ah, ${gs.characterName || 'soldier'}. Come to sample my latest creation? It's a Normandy specialty - rabbit and root vegetables, slow-cooked to perfection."</em></p>
                    <p>The cook dips a wooden spoon into the pot and takes a taste, nodding approvingly.</p>
                    <p><em>"Not bad, if I do say so myself. Care for a bowl? It's good for the soul on a night like this."</em></p>`;
        },
        choices: [
            {
                text: "Accept the stew gratefully.",
                effects: function(gs) { 
                    changeRel("cook", 1); 
                    applyStatChange("morale", 1, {silent: true});
                },
                nextScene: "campfire_cook_01_response_1"
            },
            {
                text: "Ask about his cooking background.",
                effects: function(gs) { changeRel("cook", 1); },
                nextScene: "campfire_cook_01_response_2"
            },
            {
                text: "Decline politely and move on.",
                nextScene: "campfire_cook_01_response_3"
            }
        ]
    },

    // ... (rest of the code remains the same)

    // ===== OANA CAMPFIRE SCENES =====

    campfire_oana_01_the_song: {
        title: "The Song",
        year: 1347,
        age: function() { return gameState.age || 18; },
        location: "Near Calais",
        artwork: "artwork/campfire.jpg",
        artworkCaption: "A haunting melody by the campfire",
        text: function(gs) {
            const oanaRel = gs.relationships?.oana || 0;
            return `<p>Oana sits by the fire, her carving knife working rhythmically on a piece of wood. But tonight, instead of working in silence, she begins to sing softly.</p>
                    <p>Her voice is beautiful - clear and haunting, carrying a melody that speaks of loss and longing. The words are in her native tongue, but the emotion transcends language.</p>
                    <p><em>"...a leaver of the song, a dreamer of dreams..."</em></p>
                    <p>As she sings, you notice tears glistening in her eyes, reflecting the firelight. The other soldiers listen quietly, respecting this rare moment of vulnerability.</p>`;
        },
        choices: [
            {
                text: "Listen quietly and let her finish.",
                effects: function(gs) { 
                    changeRel("oana", 2); 
                    applyStatChange("morale", 1, {silent: true});
                },
                nextScene: "campfire_oana_01_response_1"
            },
            {
                text: "Ask about the song's meaning.",
                effects: function(gs) { changeRel("oana", 1); },
                nextScene: "campfire_oana_01_response_2"
            },
            {
                text: "Compliment her singing.",
                effects: function(gs) { changeRel("oana", 1); },
                nextScene: "campfire_oana_01_response_3"
            },
            {
                text: "Give her space and move away.",
                isExit: true
            }
        ]
    },

    // ... (rest of the code remains the same)

    // ===== MIXED CAMPFIRE SCENES =====

    campfire_both_01_the_argument: {
        title: "The Argument",
        year: 1347,
        age: function() { return gameState.age || 18; },
        location: "Near Calais",
        artwork: "artwork/campfire.jpg",
        artworkCaption: "A heated discussion by the campfire",
        text: function(gs) {
            return `<p>You arrive at the campfire to find Wat and the cook in a heated argument. The cook is gesturing wildly with a wooden spoon, while Wat stands with arms crossed, his face red.</p>
                    <p>Cook: <em>"I'm telling you, Wat, that stew was perfect! The herbs were balanced, the meat was tender!"</em></p>
                    <p>Wat: <em>"Balanced? It tasted like feet! You put too much thyme in it!"</em></p>
                    <p>Cook: <em>"Too much? That's the secret! The thyme is what makes it sing!"</em></p>
                    <p>Wat: <em>"Sing? It was caterwauling! I couldn't taste anything else!"</em></p>
                    <p>The argument continues, drawing amused glances from nearby soldiers. Oana watches from a distance, a small smile on her face.</p>`;
        },
        choices: [
            {
                text: "Try to mediate the argument.",
                effects: function(gs) { 
                    changeRel("wat", 1); 
                    changeRel("cook", 1); 
                },
                nextScene: "campfire_both_01_response_mediate"
            },
            {
                text: "Take Wat's side.",
                effects: function(gs) { 
                    changeRel("wat", 2); 
                    changeRel("cook", -1); 
                },
                nextScene: "campfire_both_01_response_wat"
            },
            {
                text: "Take the cook's side.",
                effects: function(gs) { 
                    changeRel("cook", 2); 
                    changeRel("wat", -1); 
                },
                nextScene: "campfire_both_01_response_cook"
            },
            {
                text: "Walk away from the argument.",
                isExit: true
            }
        ]
    },

    // ... (rest of the code remains the same)
};


    
window.CAMPFIRE_VIGNETTES = CAMPFIRE_VIGNETTES;
})();
