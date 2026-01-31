# Comprehensive Prompt: Generate Combat Encounters for "A Man-at-Arms' Life"

## Game Context

You are creating combat encounters for **"A Man-at-Arms' Life"**, an interactive fiction game set during the Hundred Years' War (1337-1453). The game follows a soldier's life through decades of warfare, from raw recruit to veteran, with choices that shape their fate.

### Setting & Atmosphere
- **Period**: Medieval warfare, 14th-15th century
- **Tone**: Gritty, realistic, minimalist, anti-heroic
- **Perspective**: Third-person limited, closely tied to the player character's experience
- **Themes**: Survival, duty, the cost of war, the banality of violence

### Writing Style
- **Influence**: Subtle McCarthy-esque minimalism (NOT full McCarthy—emulate, don't replicate)
- **Sentence Structure**: Mostly complete sentences with occasional short fragments for emphasis
- **Voice**: Direct, spare, unadorned prose
- **Avoid**: Excessive fragmentation (e.g., "That kills. That breaks. That destroys." is too much)
- **Prefer**: Natural flow with strategic minimalism (e.g., "The clash of steel rings in your ears. The sound is terrible. Beautiful. Terrifying.")

## Combat System Mechanics

### Resolution System
Combat encounters use a **dice-based resolution system**:

1. **Player Choice**: Player selects a combat action (e.g., "Fight with all your might", "Hold the line", "Flank the enemy")
2. **Dice Roll**: System rolls `1d10 + [relevant stat]` vs `difficulty`
3. **Success/Failure**: Result determines outcome (victory, injury, death risk)
4. **Consequences**: Stat changes, conditions, story progression

### Key Components

#### Choice Structure
```javascript
{
    text: "Action description",
    effects: {}, // Optional stat changes before resolution
    nextScene: "result_scene_id",
    requiresResolution: true,
    resolutionStat: "strength", // or "agility", "wits", "endurance", "luck"
    resolutionDifficulty: 8 // 1-10 scale, typically 6-9
}
```

#### Result Scene Structure
```javascript
result_scene_id: {
    title: "Scene Title",
    year: 1338,
    age: 19,
    location: "Northern France",
    text: function() {
        const result = gameState.lastResolution;
        if (!result) return `<p>Fallback text if no resolution data.</p>`;
        
        // Display dice roll result
        const rollDisplay = `<div class="dice-roll">
            <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
            <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
        </div>`;
        
        if (result.success) {
            return `${rollDisplay}<p>Success narrative...</p>`;
        } else {
            return `${rollDisplay}<p>Failure narrative...</p>`;
        }
    },
    onEnter: function() {
        const result = gameState.lastResolution;
        if (result && result.success) {
            // Success rewards
            applyStatChange('experience', 10);
            applyStatChange('reputation', 1);
            applyStatChange('morale', 1);
            applyStatChange('stress', 1);
            gameState.career.battles++;
        } else if (result) {
            // Failure consequences
            addCondition('Wounded', 'negative', 2); // Duration in years
            applyStatChange('endurance', -1);
            applyStatChange('stress', 2);
            gameState.career.wounds++;
        }
    },
    choices: [
        {
            text: "Continue",
            effects: {},
            nextScene: "next_scene_id"
        }
    ]
}
```

### Available Stats
- **strength**: Physical power, melee combat
- **agility**: Speed, dodging, archery
- **endurance**: Stamina, resistance to fatigue/injury
- **wits**: Tactical thinking, strategy
- **luck**: Random chance, fortune
- **morale**: Mental state, will to fight
- **stress**: Psychological burden
- **reputation**: Standing among peers
- **experience**: Overall skill growth
- **patronFavor**: Standing with lord/commander

### Available Conditions
- **Wounded**: Minor injury, -1 to physical stats, duration 1-3 years
- **Seriously Wounded**: Major injury, -2 to physical stats, higher death risk, duration 2-5 years
- **Shaken**: Psychological trauma, -1 to morale, duration 1-2 years
- **Exhausted**: Fatigue, -1 to all stats, duration 0-1 years

### Difficulty Guidelines
- **6**: Easy encounter (80%+ success for average character)
- **7**: Moderate encounter (60-70% success)
- **8**: Hard encounter (40-50% success)
- **9**: Very hard encounter (20-30% success)
- **10**: Extreme encounter (10-20% success, high death risk)

## Combat Encounter Requirements

### 1. Variety & Context
Create encounters that vary by:
- **Scale**: Individual duels, small skirmishes, large battles
- **Type**: Melee combat, archery, siege defense, ambush, cavalry charge
- **Location**: Open field, bridge, town, forest, castle walls
- **Enemy**: French knights, archers, peasants, bandits, other English soldiers
- **Stakes**: Low-risk training, medium-risk skirmish, high-risk battle, extreme-risk desperate fight

### 2. Player Agency
Each encounter should offer **2-4 meaningful choices** that:
- Use different stats (strength vs agility vs wits)
- Have different risk/reward profiles
- Reflect different tactical approaches
- Have distinct narrative outcomes

### 3. Consequences
- **Success**: Should feel earned, with appropriate rewards
- **Failure**: Should have real consequences (injury, stat loss, death risk)
- **Balance**: Not every failure should be fatal, but all should matter
- **Death Risk**: Only in extreme encounters (difficulty 9-10, or special circumstances)

### 4. Narrative Integration
- **Context**: Encounters should fit the year/location/campaign context
- **Progression**: Early encounters (1337-1340) should be simpler than later ones (1350+)
- **Character Development**: Encounters should reflect player's growing experience
- **Themes**: Reinforce the game's themes of survival, duty, cost of war

## Example Combat Encounters

### Example 1: First Battle (Simple)
```javascript
first_battle_brave: {
    title: "First Battle",
    year: 1338,
    age: 19,
    location: "Northern France",
    artworkCaption: "The clash of arms on the field of battle",
    text: `<p>You charge into battle. With courage. Or what passes for it. Or what you hope is courage. But might be fear. Might be desperation. Might be everything that makes men run toward death. But you charge anyway. Because you have to. Because there's no other choice.</p>
           <p>The clash of steel rings in your ears. The sound is terrible. Beautiful. Terrifying. Men scream. Die. Fall around you. But you keep going. Keep charging. Keep fighting. Because that's what you do. That's what you're trained to do. The first battle. The first blood. It changes you. Breaks you. Makes you into what you'll become. What war makes you.</p>`,
    choices: [
        {
            text: "Fight with all your might",
            effects: {},
            nextScene: "first_battle_brave_resolve",
            requiresResolution: true,
            resolutionStat: "strength",
            resolutionDifficulty: 8
        }
    ]
},
first_battle_brave_resolve: {
    title: "First Blood",
    year: 1338,
    age: 19,
    location: "Northern France",
    text: function() {
        const result = gameState.lastResolution;
        if (!result) return `<p>The battle rages around you...</p>`;
        
        const rollDisplay = `<div class="dice-roll">
            <strong>Roll:</strong> 1d10 + ${result.effectiveStat} = ${result.roll} (vs ${result.difficulty})
            <br><strong>${result.success ? 'SUCCESS' : 'FAILURE'}</strong>
        </div>`;
        
        if (result.success) {
            return `${rollDisplay}<p>You fight well. Drive back the French. Hold your ground. Your bravery shows. Is noted. By your comrades. By your captain. You take a minor wound. But you survive. The French retreat. The battle ends. For now. That's something. That's enough.</p>
                   <p>You've survived your first battle. Your first blood. It changes you. Breaks you. Makes you into what you'll become. What war makes you. Your comrades respect you. Your courage. Your skill. That matters. That helps.</p>`;
        } else {
            return `${rollDisplay}<p>The battle is fierce. Terrible. Deadly. You take a serious wound. But manage to survive. Barely. The French retreat. But you're left bleeding. Hurting. Broken. By the wound. By the battle. By everything.</p>
                   <p>You've learned. That war is not glorious. Not like the songs. Not like the stories. Not like anything you imagined. It's brutal. Terrible. Deadly. Real. You've learned the hard way. The only way that matters.</p>`;
        }
    },
    onEnter: function() {
        const result = gameState.lastResolution;
        if (result && result.success) {
            applyStatChange('experience', 10);
            applyStatChange('reputation', 1);
            applyStatChange('morale', 1);
            applyStatChange('stress', 1);
            gameState.career.battles++;
        } else if (result) {
            addCondition('Wounded', 'negative', 2);
            applyStatChange('endurance', -1);
            applyStatChange('stress', 2);
            gameState.career.wounds++;
        }
    },
    choices: [
        {
            text: "Continue to winter quarters",
            effects: {},
            nextScene: "winter_quarters"
        }
    ]
}
```

### Example 2: Bridge Assault (Multiple Choices)
```javascript
caen_bridge_assault: {
    title: "The Bridge at Caen",
    year: 1346,
    age: function() { return gameState.age; },
    location: "Caen",
    text: `<p>The bridge chokes with bodies. Men pushing. Shoving. Fighting. Dying. The crush is terrible. The noise is worse. Steel on steel. Screams. Curses. Prayers. Everything mixed. Everything loud.</p>
           <p>You push forward. Hold your file. Keep formation. Keep discipline. Keep moving. Because that's what you do. That's what you're trained to do. That's what keeps you alive. Keeps your men alive.</p>`,
    choices: [
        {
            text: "Lead the charge across the bridge",
            effects: {},
            nextScene: "caen_bridge_resolve",
            requiresResolution: true,
            resolutionStat: "strength",
            resolutionDifficulty: 8
        },
        {
            text: "Hold the line and wait for support",
            effects: {},
            nextScene: "caen_bridge_resolve",
            requiresResolution: true,
            resolutionStat: "endurance",
            resolutionDifficulty: 7
        },
        {
            text: "Find a way around the bridge",
            effects: {},
            nextScene: "caen_bridge_resolve",
            requiresResolution: true,
            resolutionStat: "wits",
            resolutionDifficulty: 7
        }
    ]
},
caen_bridge_resolve: {
    title: "Across the Bridge",
    year: 1346,
    age: function() { return gameState.age; },
    location: "Caen",
    text: function() {
        const result = gameState.lastResolution;
        if (!result) return `<p>The bridge chokes with bodies...</p>`;
        if (result.success) {
            return `<p>You hold. Push. Break through. Your unit follows. Your discipline holds. Your courage shows. Your leadership matters. You break through. Get across. Get to the other side. Get to safety. Or what passes for safety.</p>
                   <p>Your leadership earns favor. Significant favor. Your men respect you. Trust you. Follow you. Because you did it. You got them through. You kept them alive. For now. That's something. That's enough.</p>`;
        } else {
            return `<p>You push forward. Try to hold. Try to break through. But the crush is too much. Bodies everywhere. Weapons everywhere. Death everywhere. Something finds you. A blade. A spear. A piece of metal. It doesn't matter what. Just that it does. Just that you're wounded.</p>
                   <p>You've taken a serious injury. In the chaos. In the fight. In the bridge. You're bleeding. Hurting. Broken. But you're alive. For now. That's something. That's enough. Sometimes that's all you get.</p>`;
        }
    },
    onEnter: function() {
        const result = gameState.lastResolution;
        if (result && result.success) {
            applyStatChange('patronFavor', 2);
            applyStatChange('morale', 1);
            applyStatChange('stress', 1);
        } else if (result) {
            addCondition('Wounded', 'negative', 2);
            applyStatChange('stress', 2);
            gameState.career.wounds++;
        }
    },
    choices: [
        {
            text: "Continue",
            effects: {},
            nextScene: "prisoner_argument"
        }
    ]
}
```

## Output Format

For each combat encounter, provide:

### 1. Encounter Scene
- **Scene ID**: Unique identifier (e.g., `skirmish_forest_1340`)
- **Title**: Descriptive title
- **Year**: Specific year or function
- **Age**: Player age or function
- **Location**: Geographic location
- **Text**: Narrative description (2-4 paragraphs, minimalist style)
- **Choices**: 2-4 combat action choices with different stats/difficulties

### 2. Resolution Scene
- **Scene ID**: Matching resolution scene (e.g., `skirmish_forest_1340_resolve`)
- **Title**: Result title
- **Text Function**: Dynamic text based on success/failure
- **onEnter Function**: Stat changes and conditions
- **Choices**: Continuation to next scene

### 3. Metadata
- **Difficulty Level**: Easy/Moderate/Hard/Very Hard/Extreme
- **Recommended Year Range**: When this encounter should appear
- **Stat Focus**: Primary stat(s) tested
- **Risk Level**: Low/Medium/High/Extreme (death risk)
- **Narrative Theme**: What this encounter explores

## Quality Checklist

Each encounter should:
- [ ] Offer meaningful player choice (2-4 options)
- [ ] Use different stats for different approaches
- [ ] Have appropriate difficulty for the year/context
- [ ] Include both success and failure narratives
- [ ] Apply appropriate consequences (rewards/penalties)
- [ ] Fit the minimalist writing style (not overly fragmented)
- [ ] Reflect the game's themes (survival, duty, cost of war)
- [ ] Be historically plausible for the period
- [ ] Include dice roll display in resolution text
- [ ] Have proper scene transitions (nextScene properties)

## Special Considerations

### Death Risk
- Only include death risk in extreme encounters (difficulty 9-10)
- Death should be rare but possible
- Use `gameState.career.deathRate` for context
- Consider player's accumulated wounds/conditions

### Progression
- Early encounters (1337-1340): Simpler, lower difficulty, more forgiving
- Mid-game (1341-1350): Moderate difficulty, varied challenges
- Late game (1351+): Higher difficulty, more complex choices, higher stakes

### Variety
Create encounters for:
- Open field battles
- Siege warfare
- Skirmishes and raids
- Ambushes
- Cavalry engagements
- Archery duels
- Bridge/river crossings
- Town fighting
- Forest combat
- Night raids

## Instructions

Generate **5-10 new combat encounters** following the above guidelines. Each encounter should:

1. Be unique in context and challenge
2. Offer meaningful tactical choices
3. Have appropriate difficulty for its context
4. Include complete scene definitions (encounter + resolution)
5. Follow the minimalist writing style (complete sentences with occasional fragments)
6. Include proper stat changes and consequences
7. Be historically plausible for the Hundred Years' War period

Provide the encounters as JavaScript scene objects ready to be integrated into the game's `scenes` object.
