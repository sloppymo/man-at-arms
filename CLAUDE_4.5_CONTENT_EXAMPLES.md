# Three Examples of McCarthy-Style Content
## Generated Using the Claude 4.5 Content Prompt

---

## Example 1: Campaign Event - The Rain

```javascript
march_in_rain: {
    title: "The Rain",
    year: 1346,
    age: function() { return gameState.age; },
    location: "Normandy",
    text: function() {
        const name = gameState.characterName || "Soldier";
        return `<p>The rain came. Not the gentle rain of spring but the cold relentless rain of late autumn. It fell in sheets. Drove into your face. Soaked through your tunic. Through your mail. The weight of it pressed down. Each step was a labor. The mud sucked at your boots. Held you. Released you. Held you again.</p>
               
               <p>You could hear the column ahead. The sound of men moving through water. Through mud. The creak of leather. The jingle of harness. The low curses. The rain made everything louder. And everything quieter. The world had narrowed to this. The rain. The mud. The next step.</p>
               
               <p>Your hands were numb. You couldn't feel your fingers. The cold had worked its way into your bones. Into your joints. Every movement was an effort. The mail shirt was a weight. A burden. It chafed where it was wet. Where it had rubbed raw. You could feel the blood. Warm against the cold. A small comfort.</p>
               
               <p>Wat walked beside you. His head down. His shoulders hunched against the rain. He didn't speak. No one spoke. What was there to say. The rain would stop. Or it wouldn't. The march would continue. Or it wouldn't. These were the only truths that mattered.</p>
               
               <p>Ahead the column had stopped. The word passed back. Hold. Hold in place. You stopped. Wat stopped. The rain didn't stop. It fell. It fell on your head. On your shoulders. Down your back. Into your boots. You stood there. In the mud. In the rain. Waiting. For what you didn't know. But you waited.</p>
               
               <p>The water pooled around your feet. Your boots were full of it. You could feel it. Cold. Slopping with each step. If you took a step. You didn't. You stood. The rain fell. Time passed. Or it didn't. In the rain time had no meaning. There was only the rain. The mud. The waiting.</p>`;
    },
    choices: [
        {
            text: "Push forward through the column to see what's wrong",
            effects: { initiative: 1, endurance: -1 },
            requiresResolution: true,
            resolutionStat: "endurance",
            resolutionDifficulty: 7,
            nextScene: "column_delay_investigation"
        },
        {
            text: "Stay in place and wait",
            effects: { endurance: 1 },
            nextScene: "march_continues_rain"
        },
        {
            text: "Find what shelter you can",
            requiresResolution: true,
            resolutionStat: "wits",
            resolutionDifficulty: 6,
            effects: { wits: 1 },
            nextScene: "shelter_found"
        }
    ]
}
```

---

## Example 2: Camp Life Event - The Wound

```javascript
camp_wound_care: {
    title: "The Wound",
    year: function() { return gameState.year; },
    age: function() { return gameState.age; },
    location: function() { return gameState.location; },
    text: function() {
        const name = gameState.characterName || "Soldier";
        return `<p>The wound had festered. You could smell it. The sweet sick smell of rot. Of decay. It was on your arm. Where the French blade had found you. Three days ago. Or was it four. Time blurred. The days ran together. But the wound remained. A constant. A reminder.</p>
               
               <p>You sat by the fire. The light was poor. But you could see it. The red angry flesh. The yellow pus. The black edges where the skin had died. You touched it. Gently. The pain was sharp. Immediate. It made you catch your breath. Made your eyes water. You pulled your hand away. Looked at your fingers. They came away wet. Sticky. The smell was stronger now.</p>
               
               <p>Geoffrey watched you. He'd seen wounds before. Too many. He knew what they meant. Knew what came next. He didn't speak. Didn't need to. The wound would heal. Or it wouldn't. If it didn't. Well. There were worse ways to die. But not many.</p>
               
               <p>You had a knife. A small one. For eating. For cutting rope. You held it in the fire. Watched the metal heat. Turn red. You pulled it out. The blade glowed. In the darkness it was like a star. A small star. Burning. You looked at your arm. At the wound. At the knife. You knew what you had to do. Knew what came next.</p>
               
               <p>The pain would be terrible. You knew that. But the alternative was worse. The rot would spread. Would kill you. Slowly. Painfully. This way was quick. Relatively. You pressed the hot blade to the wound. The flesh sizzled. The smell changed. From rot to burning meat. Your own meat. Your own flesh. You bit down. Hard. Tasted blood. Your own blood. From where you'd bitten your lip. The pain was everything. Was the world. Was all there was.</p>
               
               <p>When it was done you sat there. Shaking. Sweating. The wound was black now. Seared. Closed. It would heal. Or it wouldn't. But you'd done what you could. You'd fought the rot. The decay. The death that came with it. You'd won. For now. Tomorrow. Well. Tomorrow would come. Or it wouldn't.</p>`;
    },
    choices: [
        {
            text: "Cauterize the wound yourself",
            effects: { endurance: -2, stress: 2 },
            requiresResolution: true,
            resolutionStat: "endurance",
            resolutionDifficulty: 8,
            nextScene: "wound_cauterized"
        },
        {
            text: "Ask Geoffrey to help",
            requiresResolution: true,
            resolutionStat: "charisma",
            resolutionDifficulty: 5,
            effects: { charisma: 1, endurance: -1 },
            nextScene: "wound_treated_help"
        },
        {
            text: "Leave it and hope it heals",
            effects: { stress: 1 },
            nextScene: function() {
                // Risk of infection
                if (Math.random() < 0.3) {
                    applyStatChange('endurance', -3);
                    return "wound_infected";
                }
                return "wound_heals_slowly";
            }
        }
    ]
}
```

---

## Example 3: French Countryside Event - The Orchard

```javascript
french_orchard: {
    title: "The Orchard",
    year: function() { return gameState.year; },
    age: function() { return gameState.age; },
    location: "Normandy",
    text: function() {
        const name = gameState.characterName || "Soldier";
        return `<p>The orchard stood at the edge of the village. Apple trees. Old. Gnarled. Their branches twisted. Reaching. Like old men's hands. The fruit hung heavy. Red and gold. Ripe. Ready to fall. The smell was sweet. Overwhelming. After weeks of camp food. Of hardtack. Of salted meat. The smell of apples was like a promise. A memory of something better.</p>
               
               <p>You stood at the edge. Looking in. The trees were planted in rows. Neat. Orderly. Someone had cared for this place. Had tended it. Had loved it. You could see the care. The attention. The years of work. But no one was here now. The village was empty. The people gone. But the trees remained. The fruit remained. Waiting.</p>
               
               <p>You reached up. Plucked an apple. It came away easily. The stem snapped. You held it in your hand. Felt its weight. Its smooth skin. You brought it to your nose. Inhaled. The smell was intoxicating. Sweet. Clean. You bit into it. The flesh was crisp. Juicy. The taste exploded in your mouth. Sweet. Tart. Perfect. You closed your eyes. For a moment. Just a moment. You were somewhere else. Somewhere better. Somewhere the war hadn't reached.</p>
               
               <p>But the moment passed. You opened your eyes. You were still here. Still in France. Still at war. The apple was just an apple. But it was something. A small thing. A good thing. In a world of bad things. You ate it. Slowly. Savoring each bite. Making it last. When it was gone you looked at the tree. At the other apples. Hanging there. Waiting. You could take them. Fill your pack. Share them with the men. Or you could leave them. Let them rot. Fall to the ground. Feed the worms. The choice was yours. But it felt like more than that. It felt like a test. Of what you were. Of what you'd become.</p>
               
               <p>Wat appeared beside you. He'd been scouting ahead. His eyes took in the orchard. The trees. The fruit. He didn't speak. Didn't need to. You both knew what this was. A gift. A small mercy. In a world that showed little mercy. He reached up. Took an apple. Bit into it. The sound was loud in the silence. The crunch of teeth on flesh. He chewed. Swallowed. Looked at you. What do you think, he said. Do we take them. Or do we leave them.</p>
               
               <p>You looked at the orchard. At the trees. At the fruit. At the empty village beyond. You thought of the people who'd planted these trees. Who'd tended them. Who'd waited for the harvest. Who were gone now. Because of the war. Because of you. Because of men like you. The apples were just apples. But they were also something else. A reminder. Of what was. Of what could be. Of what the war had taken. And what it hadn't. Not yet.</p>`;
    },
    choices: [
        {
            text: "Take what you can carry",
            effects: { wealth: 1, morale: 1 },
            nextScene: "orchard_plundered"
        },
        {
            text: "Take only what you need",
            effects: { morale: 1 },
            nextScene: "orchard_respectful"
        },
        {
            text: "Leave them be",
            effects: { wits: 1, stress: 1 },
            nextScene: "orchard_left"
        },
        {
            text: "Share them with the men",
            requiresResolution: true,
            resolutionStat: "charisma",
            resolutionDifficulty: 6,
            effects: { charisma: 1, reputation: 1, morale: 1 },
            nextScene: "orchard_shared"
        }
    ]
}
```

---

## Notes on Style

These examples demonstrate:

1. **Sparse, powerful prose** - Short sentences mixed with longer, flowing passages
2. **No quotation marks** - Dialogue flows naturally without punctuation
3. **Visceral physicality** - Focus on what things feel like, smell like, taste like
4. **Atmospheric density** - Weather, light, sound, silence used to build mood
5. **Biblical/poetic quality** - Elevated language grounded in the physical
6. **Stream of consciousness** - Thoughts flow into narrative
7. **Flexible length** - Each example is substantial but not rigidly fixed
8. **Period authenticity** - Historically grounded in 14th century France
9. **Gritty realism** - Shows the harsh reality without romanticizing
10. **Meaningful choices** - Each choice has clear consequences and moral weight

Each scene is ready to paste into the game's JavaScript code structure.
