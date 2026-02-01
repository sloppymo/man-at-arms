# Combat Encounters Generation Summary

## Overview
Generated **8 new combat encounters** following the guidelines in `COMBAT_ENCOUNTER_GENERATION_PROMPT.md`. Each encounter includes both the encounter scene and resolution scene, with proper stat checks, consequences, and narrative integration.

## Encounters Generated

### 1. Forest Ambush (1340) - Moderate Difficulty
- **Type**: Ambush/Skirmish
- **Location**: Northern France
- **Difficulty**: 7
- **Risk**: Medium
- **Stats**: Strength (8), Agility (7), Wits (7)
- **Theme**: Learning to watch for ambushes, the danger of quiet forests
- **Rewards**: Experience +8, Reputation +1 on success
- **Consequences**: Wounded condition (2 years) on failure

### 2. Siege Defense (1345) - Hard Difficulty
- **Type**: Siege Defense
- **Location**: Gascony
- **Difficulty**: 8
- **Risk**: High
- **Stats**: Strength (8), Endurance (8), Wits (7)
- **Theme**: Holding walls under assault, the cost of defense
- **Rewards**: Experience +12, Reputation +2, Patron Favor +1 on success
- **Consequences**: Seriously Wounded condition (3 years) on failure

### 3. Cavalry Skirmish (1342) - Moderate Difficulty
- **Type**: Cavalry Engagement
- **Location**: Aquitaine
- **Difficulty**: 7-8
- **Risk**: Medium
- **Stats**: Strength (7), Agility (7), Luck (8)
- **Theme**: Facing mounted charges, the terror of cavalry
- **Rewards**: Experience +10, Reputation +1 on success
- **Consequences**: Wounded condition (2 years) on failure

### 4. Night Raid (1347) - Hard Difficulty
- **Type**: Night Raid/Ambush
- **Location**: Normandy
- **Difficulty**: 7-8
- **Risk**: High
- **Stats**: Wits (7), Agility (8), Luck (8)
- **Theme**: Fighting in darkness, the importance of watch
- **Rewards**: Experience +12, Reputation +2, Patron Favor +1 on success
- **Consequences**: Wounded condition (2 years) on failure

### 5. Town Fighting (1348) - Hard Difficulty
- **Type**: Urban Combat
- **Location**: Calais
- **Difficulty**: 7-8
- **Risk**: High
- **Stats**: Strength (8), Agility (8), Wits (7)
- **Theme**: Close-quarters combat, house-to-house fighting
- **Rewards**: Experience +12, Reputation +2, Patron Favor +1 on success
- **Consequences**: Wounded condition (2 years) on failure

### 6. Archery Duel (1339) - Easy-Moderate Difficulty
- **Type**: Archery/Skirmish
- **Location**: Northern France
- **Difficulty**: 7-8
- **Risk**: Low-Medium
- **Stats**: Agility (7), Wits (7), Luck (8)
- **Theme**: Long-range combat, developing archery skills
- **Rewards**: Experience +8, Reputation +1 on success
- **Consequences**: Wounded condition (1 year) on failure

### 7. River Crossing (1344) - Hard Difficulty
- **Type**: River Crossing/Assault
- **Location**: Gascony
- **Difficulty**: 7-8
- **Risk**: High
- **Stats**: Strength (8), Endurance (8), Wits (7)
- **Theme**: Crossing under fire, the danger of water obstacles
- **Rewards**: Experience +12, Reputation +2, Patron Favor +1 on success
- **Consequences**: Wounded condition (2 years) on failure

### 8. Desperate Last Stand (1350) - Very Hard Difficulty
- **Type**: Desperate Defense
- **Location**: Northern France
- **Difficulty**: 8-9
- **Risk**: Extreme
- **Stats**: Endurance (9), Strength (9), Wits (8)
- **Theme**: Survival against impossible odds, the will to live
- **Rewards**: Experience +15, Reputation +3, Patron Favor +2 on success
- **Consequences**: Seriously Wounded condition (4 years) + 15% death risk on failure

## Key Features

### Variety
- **Years**: 1339-1350 (early to mid-game progression)
- **Locations**: Northern France, Gascony, Aquitaine, Normandy, Calais
- **Types**: Ambush, siege, cavalry, night raid, urban combat, archery, river crossing, last stand
- **Scales**: Individual skirmishes to desperate battles

### Player Agency
Each encounter offers **3 meaningful choices** that:
- Use different stats (strength, agility, endurance, wits, luck)
- Have different difficulty levels for risk/reward balance
- Reflect different tactical approaches
- Have distinct narrative outcomes

### Consequences
- **Success**: Appropriate rewards (experience, reputation, patron favor)
- **Failure**: Real consequences (wounds, stat loss, stress)
- **Balance**: Not every failure is fatal, but all matter
- **Death Risk**: Only in extreme encounter (#8)

### Writing Style
- Follows minimalist McCarthy-esque style (not overly fragmented)
- Complete sentences with occasional strategic fragments
- Natural flow and readability
- Reflects game themes (survival, duty, cost of war)

### Technical Implementation
- All encounters include proper `requiresResolution` mechanics
- Resolution scenes display dice rolls
- `onEnter` functions apply appropriate stat changes and conditions
- All choices have proper `nextScene` transitions
- Follows existing game code structure

## Integration Notes

To integrate these encounters into the game:

1. Copy the scene objects from `NEW_COMBAT_ENCOUNTERS.js`
2. Add them to the `scenes` object in `man-at-arms.html`
3. Ensure scene IDs are unique (they are)
4. Connect them to existing scenes via `nextScene` properties
5. Test each encounter to verify dice rolls and consequences work correctly

## Progression Balance

- **Early Game (1339-1342)**: Easier encounters (difficulty 7), lower stakes, more forgiving
- **Mid Game (1344-1348)**: Harder encounters (difficulty 8), higher stakes, serious consequences
- **Late Game (1350)**: Very hard encounter (difficulty 9), extreme stakes, death risk

This progression matches the player's growing experience and the game's narrative arc.
