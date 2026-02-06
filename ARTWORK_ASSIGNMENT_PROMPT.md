# Artwork Assignment Prompt for Man-at-Arms Game

## Mission
Assign artwork to as many game scenes as possible to enhance visual immersion. Currently, only 40 out of 237 scenes have artwork (17% coverage). Your goal is to increase this significantly by intelligently matching available artwork to appropriate scenes, reusing artwork where thematically appropriate.

## Game Context
"Man-at-Arms" is a browser-based roguelike game set during the Hundred Years' War (1337-1453). The game follows a soldier's life through various historical events, battles, camp life, and personal encounters. The narrative style is McCarthy-esque: sparse, visceral, atmospheric.

## Scene Structure
Each scene in `man-at-arms.html` follows this structure:
```javascript
scene_name: {
    title: "Scene Title",
    year: 1338, // or function() { return gameState.year; }
    age: 19,    // or function() { return gameState.age; }
    location: "Northern France",
    artwork: "artwork/filename.jpg",        // ADD THIS
    artworkCaption: "Descriptive caption",  // ADD THIS
    text: `<p>Scene narrative text...</p>`,
    choices: [ /* ... */ ]
}
```

## Available Artwork Files (34 total)

### Battle Scenes (6 files)
- `battle-scene-1.jpg` - French vs English battle scene
- `battle-scene-2.jpg` - Mountainous battle scene
- `battle-scene-3.jpg` - Battle scene (formation)
- `battle-scene-4.jpg` - Battle scene (leadership)
- `battle-scene-6.jpg` - Battle scene (tactical)
- `battle-aftermath.jpg` - Post-battle scene with fallen soldiers
- `afterbattle.jpg` - Aftermath scene

### Naval/Sea Travel (4 files)
- `naval-battle-1.jpg` - Naval battle with ships
- `naval-battle-2.jpg` - Naval battle with ships and coastal city
- `naval-battle-3.jpg` - Another naval battle scene
- `BattleofSluys.jpeg` - Historical naval battle
- `Bataille_de_la_Rochelle.jpg` - Naval battle scene

### Camp Life & Social (6 files)
- `campfire.jpg` - Campfire scene
- `drunkfire.jpg` - Campfire/winter scene
- `blacksmith.jpg` - Blacksmith/forge scene
- `market.jpg` - Market/merchant scene
- `signup.jpg` - Contract/indenture signing
- `supplyshortage.jpg` - Empty wagons/supply shortage

### Environmental & Travel (5 files)
- `bridgerain.jpg` - River crossing in rain
- `march.jpg` - Marching scene
- `map.jpg` - Map/strategic overview
- `Passages_faiz_oultre_mer_SEBASTIEN_MAMEROT_143r.jpg` - Travel/manuscript scene
- `roadsideshrine.jpg` - Wayside cross/shrine

### Religious & Ceremonial (2 files)
- `monk.jpg` - Church/monastery scene
- `Vigiles_du_roi_Charles_VII_32.jpg` - Royal/ceremonial scene

### Siege & Conflict (4 files)
- `seige.jpg` - Siege scene
- `standoff.jpg` - Confrontation/standoff
- `burninglooting.jpg` - Burning and looting
- `burninglooting2.jpg` - Burning and looting (alternative)

### Other (7 files)
- `character-creation.jpg` - Character creation scene
- `dock.jpg` - Docks/harbor scene
- `looting.jpg` - Looting scene
- `unnamed.jpg` - Generic scene (use for village/pillage)
- `Assassinat_louis_orleans.jpg` - Assassination/death scene
- `map.jpg` - Map/strategic scene

## Assignment Guidelines

### 1. Match by Theme
- **Battle scenes** → Use battle-scene-*.jpg or battle-aftermath.jpg
- **Naval/sea travel** → Use naval-battle-*.jpg or BattleofSluys.jpeg
- **Camp life** → Use campfire.jpg, blacksmith.jpg, market.jpg
- **River crossings** → Use bridgerain.jpg
- **Marching/travel** → Use march.jpg or Passages_faiz_oultre_mer_SEBASTIEN_MAMEROT_143r.jpg
- **Church/religious** → Use monk.jpg
- **Siege** → Use seige.jpg
- **Looting/pillage** → Use looting.jpg, burninglooting.jpg, or unnamed.jpg
- **Supply issues** → Use supplyshortage.jpg
- **Confrontations** → Use standoff.jpg
- **Noble/ceremonial** → Use Vigiles_du_roi_Charles_VII_32.jpg

### 2. Reuse Artwork Strategically
The same artwork can be used in multiple scenes if thematically appropriate:
- `bridgerain.jpg` can be used for ANY river crossing scene
- `battle-scene-*.jpg` can be reused for different battle encounters
- `campfire.jpg` can be used for multiple campfire/interlude scenes
- `monk.jpg` can be used for any church/religious scene
- `march.jpg` can be used for any marching/travel scene

### 3. Priority Scenes to Assign Artwork
Focus on scenes that are:
- **High-visibility**: Early game scenes, major story beats
- **Atmospheric**: Night scenes, weather scenes, emotional moments
- **Currently unassigned**: Check which scenes lack artwork
- **Narrative important**: Key battles, character moments, transitions

### 4. Scene Categories to Target

**Training Scenes** (currently mostly unassigned):
- `training_rural_peasant`, `training_weapons`, `training_formation`, etc.
- Use: `blacksmith.jpg` for weapons training, `map.jpg` for strategic training

**Camp Life Scenes**:
- `winter_quarters`, `camp_dice_game`, `weapon_maintenance`, `night_watch`
- Use: `campfire.jpg`, `drunkfire.jpg`, `blacksmith.jpg`

**Travel/March Scenes**:
- `night_march`, `rainstorm_march`, `winter_march`, `march_to_calais`
- Use: `march.jpg`, `bridgerain.jpg` (for rain), `Passages_faiz_oultre_mer_SEBASTIEN_MAMEROT_143r.jpg`

**Environmental Challenges**:
- `marsh_crossing`, `river_crossing`, `scorched_earth`, `abandoned_camp`
- Use: `bridgerain.jpg`, `Passages_faiz_oultre_mer_SEBASTIEN_MAMEROT_143r.jpg`, `supplyshortage.jpg`

**Social/Encounter Scenes**:
- `french_peasant_encounter`, `french_merchant`, `bandits_encounter`
- Use: `market.jpg`, `standoff.jpg`, `roadsideshrine.jpg`

**Battle-Related Scenes**:
- `crecy_defensive`, `crecy_rescue`, `skirmish_roadside`, `enemy_scouts`
- Use: `battle-scene-*.jpg`, `battle-aftermath.jpg`

**Pillage/Looting Scenes**:
- `village_pillage`, `peasant_extortion`, `church_desecration`
- Use: `looting.jpg`, `burninglooting.jpg`, `unnamed.jpg`

## Implementation Instructions

### Step 1: Find Unassigned Scenes
Search for scenes that don't have `artwork:` property:
```bash
grep -B 5 "^            [a-z_]+:.*{$" man-at-arms.html | grep -v "artwork:"
```

### Step 2: Add Artwork to Scene
For each scene, add two lines after the `location:` property:
```javascript
scene_name: {
    title: "Scene Title",
    year: 1338,
    age: 19,
    location: "Northern France",
    artwork: "artwork/filename.jpg",        // ADD THIS LINE
    artworkCaption: "Descriptive caption",  // ADD THIS LINE
    text: `<p>...</p>`,
    // ...
}
```

### Step 3: Write Appropriate Captions
Captions should be:
- **Atmospheric**: Match the McCarthy-esque tone
- **Descriptive**: Help set the scene
- **Concise**: 5-15 words typically
- **Period-appropriate**: Medieval/Hundred Years' War context

**Good caption examples:**
- "The forge glows in the evening - fire and metal"
- "Men struggle across the river under fire"
- "The long march - eight days to Calais"
- "Empty wagons and hungry men - the supply train hasn't arrived"
- "The wayside cross at the crossroads - a place of last resort"

**Bad captions:**
- "A picture" (too generic)
- "This is a battle scene" (too obvious)
- "Medieval soldiers fighting in the Hundred Years' War during the 14th century in France" (too long)

## Example Assignments

### Example 1: Training Scene
```javascript
training_weapons: {
    title: "Weapons Training",
    year: 1337,
    age: 18,
    location: "Training Grounds",
    artwork: "artwork/blacksmith.jpg",
    artworkCaption: "The training yard - learning the weight of steel",
    text: `<p>...</p>`,
    // ...
}
```

### Example 2: March Scene
```javascript
night_march: {
    title: "March Under Stars",
    year: function() { return gameState.year; },
    age: function() { return gameState.age; },
    location: function() { return gameState.location; },
    artwork: "artwork/march.jpg",
    artworkCaption: "The column moves through darkness - only the sound of boots",
    text: function() {
        // ...
    },
    // ...
}
```

### Example 3: River Crossing
```javascript
river_crossing: {
    title: "The Swollen River",
    year: function() { return gameState.year; },
    age: function() { return gameState.age; },
    location: function() { return gameState.location; },
    artwork: "artwork/bridgerain.jpg",
    artworkCaption: "The swollen river - a dangerous crossing",
    text: function() {
        // ...
    },
    // ...
}
```

## Quality Checklist

Before finalizing each assignment, verify:
- [ ] Artwork file exists in `artwork/` folder
- [ ] Artwork matches scene theme/tone
- [ ] Caption is atmospheric and appropriate
- [ ] No syntax errors (proper comma placement)
- [ ] Artwork path is correct: `"artwork/filename.jpg"`
- [ ] Scene already doesn't have artwork (don't duplicate)

## Target Goals

- **Minimum**: Assign artwork to 100+ scenes (42% coverage)
- **Ideal**: Assign artwork to 150+ scenes (63% coverage)
- **Stretch**: Assign artwork to 180+ scenes (76% coverage)

Focus on scenes that players will encounter frequently and that would benefit most from visual enhancement.

## Notes

- Some artwork files can be reused 5-10 times if thematically appropriate
- Don't assign artwork to very short transition scenes or technical scenes
- Prioritize player-facing narrative scenes
- Consider the emotional tone of the scene when matching artwork
- Battle aftermath artwork can be used for wounded/tending scenes
- Campfire artwork can be used for any camp interlude scene

---

**Ready to begin?** Start by identifying unassigned scenes, then systematically assign artwork using the guidelines above. Work through the file methodically, ensuring each assignment makes thematic sense and enhances the player's visual experience.
