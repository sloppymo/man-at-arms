# New Artwork Needed: 5 DALL-E Prompts

## Overview
These are scenes that currently don't have appropriate artwork in the existing collection. Each prompt is designed for DALL-E to generate artwork that matches the game's atmospheric, McCarthy-esque tone set during the Hundred Years' War (1337-1453).

---

## 1. Medical Tent / Sick Tent Scene

**Scene:** `sick_tent` - "The Fevered and the Dying"

**Current Gap:** No artwork for medical treatment, wound care, or sick tents

**DALL-E Prompt:**
```
Medieval sick tent interior, Hundred Years' War, 14th century. Dark, cramped canvas tent with wounded soldiers lying on pallets. A medieval surgeon in simple robes tending to a feverish patient. Dim light from a single candle or small fire. Atmosphere of suffering and desperation. Sparse medieval medical supplies visible. Men groaning in pain, some delirious. Realistic, gritty, atmospheric lighting. Oil painting style, muted earth tones, browns and grays. No modern elements.
```

**Usage:** This artwork can be used for:
- `sick_tent` - The Fevered and the Dying
- `surgeon_preventive` - Preventive medical care
- Any scene involving wound treatment or medical care
- Death scenes from disease/illness

**Suggested filename:** `sick-tent.jpg` or `medical-tent.jpg`

---

## 2. Camp Follower / Washerwoman Scene

**Scene:** `camp_follower` - "The Washerwoman"

**Current Gap:** No artwork for camp followers, washerwomen, or women working at streams

**DALL-E Prompt:**
```
Medieval camp follower washing clothes at a stream, Hundred Years' War, 14th century. A woman in simple medieval dress kneeling by a shallow stream, scrubbing soldiers' clothes. Camp visible in background with tents and soldiers. She looks tired, worn, but determined. Red, raw hands from cold water and lye soap. Buckets and washing supplies nearby. Realistic, atmospheric, showing the harsh reality of camp life. Oil painting style, muted colors, earth tones. Period-accurate clothing and setting.
```

**Usage:** This artwork can be used for:
- `camp_follower` - The Washerwoman
- Any scene involving camp followers or women in camp
- Social encounters with non-combatants

**Suggested filename:** `washerwoman.jpg` or `camp-follower.jpg`

---

## 3. Dense Forest / Woodland Ambush Scene

**Scene:** `forest_ambush_avoided` - "The Dark Woods"

**Current Gap:** No artwork for dense forest/woodland scenes with ambush potential

**DALL-E Prompt:**
```
Dark, dense medieval forest, Hundred Years' War, 14th century. Thick old-growth trees with heavy canopy blocking sunlight. Twilight atmosphere, shadows and dappled light. A narrow road or path cutting through the forest. Sense of danger and potential ambush. Medieval soldiers visible in the distance, moving cautiously. Foreboding atmosphere. Realistic, atmospheric, showing the threat of hidden enemies. Oil painting style, dark greens and browns, dramatic shadows. No modern elements.
```

**Usage:** This artwork can be used for:
- `forest_ambush_avoided` - The Dark Woods
- `forest_exit` - Exiting the forest
- Any scene involving forest travel or woodland encounters
- Ambush or skirmish scenes in wooded areas

**Suggested filename:** `dark-forest.jpg` or `forest-ambush.jpg`

---

## 4. Abandoned / Ruined Village Scene

**Scene:** `village_ruins` - "The Empty Houses"

**Current Gap:** No artwork for abandoned, destroyed, or pillaged villages

**DALL-E Prompt:**
```
Abandoned medieval French village, Hundred Years' War, 14th century. Low stone houses with sagging thatched roofs, some collapsed. Open doorways revealing darkness within. Empty streets, overgrown gardens, signs of hasty abandonment. A stone well in the center. A few chickens pecking at dirt. Atmosphere of desolation and loss. No people visible. Realistic, atmospheric, showing the cost of war on civilians. Oil painting style, muted earth tones, grays and browns. Period-accurate architecture.
```

**Usage:** This artwork can be used for:
- `village_ruins` - The Empty Houses
- `abandoned_camp` - Abandoned camp scenes
- `scorched_earth` - Scorched earth scenes
- Any scene involving destroyed or abandoned settlements

**Suggested filename:** `village-ruins.jpg` or `abandoned-village.jpg`

---

## 5. Tavern / Inn Interior Scene

**Scene:** Various tavern scenes (referenced in `winter_quarters` and other scenes)

**Current Gap:** No artwork for taverns, inns, or drinking establishments

**DALL-E Prompt:**
```
Medieval tavern interior, Hundred Years' War, 14th century. Dark, smoky room with rough-hewn wooden tables and benches. Medieval soldiers drinking ale from tankards. A fireplace with a low fire. Barrels of ale visible. Atmosphere of weary soldiers seeking comfort and forgetfulness. Dim candlelight. Period-accurate medieval furniture and decor. Realistic, atmospheric, showing the social side of camp life. Oil painting style, warm earth tones, amber and brown lighting. No modern elements.
```

**Usage:** This artwork can be used for:
- Tavern scenes in `winter_quarters` - "Stay in a tavern — drink and forget"
- Any scene involving drinking, socializing, or seeking refuge in a tavern
- Random events involving gambling or drinking
- Social encounters in civilian settings

**Suggested filename:** `tavern.jpg` or `inn-interior.jpg`

---

## Implementation Notes

1. **Style Consistency:** All prompts specify "Oil painting style" and "Realistic, atmospheric" to maintain visual consistency with existing artwork.

2. **Period Accuracy:** All prompts emphasize "Hundred Years' War, 14th century" and "Period-accurate" elements to ensure historical accuracy.

3. **Atmospheric Tone:** All prompts include descriptors like "atmospheric," "gritty," "muted colors" to match the McCarthy-esque, sparse narrative tone.

4. **Reusability:** Each artwork can be used for multiple scenes if thematically appropriate (as noted in usage sections).

5. **File Naming:** Use descriptive, lowercase filenames with hyphens (e.g., `sick-tent.jpg`).

6. **File Size:** Remember to compress these images after generation to keep file sizes reasonable (as done with previous artwork).

---

## Priority Order

1. **Medical Tent** - High priority (used in multiple scenes, emotional impact)
2. **Tavern** - High priority (frequently referenced, social scenes)
3. **Forest** - Medium priority (atmospheric, used in multiple scenes)
4. **Village Ruins** - Medium priority (thematic importance, shows war's cost)
5. **Washerwoman** - Lower priority (specific scene, but can reuse other artwork)

---

## After Generation

Once these images are generated:
1. Compress them to reduce file size (as with previous artwork)
2. Save them in the `artwork/` directory
3. Update `ARTWORK_ASSIGNMENT_PROMPT.md` to include these new files
4. Assign them to the appropriate scenes in `man-at-arms.html`
