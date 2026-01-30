# Combat Integration Quick Start

## Files Created

1. **`man-at-arms-enemy-profiles.js`** - Complete enemy database with 11 historically accurate enemies
2. **`COMBAT_INTEGRATION_GUIDE.md`** - Full detailed integration prompt for Cursor
3. **`COMBAT_INTEGRATION_QUICK_START.md`** - This file (quick reference)

## Quick Integration Steps

### Step 1: Include Enemy Profiles (Optional but Recommended)

Add to `man-at-arms.html` before the main script:

```html
<script src="man-at-arms-enemy-profiles.js"></script>
```

### Step 2: Use the Integration Guide

Open `COMBAT_INTEGRATION_GUIDE.md` and copy the complete prompt into Cursor with all files open.

### Step 3: Test with Example Scene

Add this test scene to verify integration:

```javascript
test_combat: {
    title: "Combat Test",
    year: 1346,
    age: 28,
    location: "Test Field",
    text: `<p>This is a test of the combat system.</p>`,
    choices: [
        {
            text: "Fight a French Knight",
            type: "combat",
            enemy: {
                name: "French Knight",
                health: 120,
                initiative: 6,
                strength: 7,
                agility: 5,
                archetype: "aggressive"
            },
            winScene: "combat_test_victory",
            loseScene: "combat_test_defeat"
        }
    ]
},
combat_test_victory: {
    title: "Victory!",
    year: 1346,
    age: 28,
    location: "Test Field",
    text: `<p>You have won the combat!</p>`,
    choices: [{ text: "Continue", nextScene: "start" }]
},
combat_test_defeat: {
    title: "Defeat",
    year: 1346,
    age: 28,
    location: "Test Field",
    text: `<p>You have been defeated in combat.</p>`,
    choices: [{ text: "Continue", nextScene: "start" }]
}
```

## Enemy Profile Quick Reference

### Using Enemy IDs (if using enemy-profiles.js)

```javascript
{
    text: "Fight the French Knight",
    type: "combat",
    enemy: "french_knight", // Use ID from enemy-profiles.js
    winScene: "victory",
    loseScene: "defeat"
}
```

### Available Enemy IDs

- `french_knight` - Heavy armored knight (aggressive)
- `french_man_at_arms` - Professional soldier (balanced)
- `french_crossbowman` - Crossbowman (cautious)
- `genoese_crossbowman` - Elite mercenary (skilled)
- `scottish_highlander` - Two-handed sword fighter (aggressive)
- `french_peasant_militia` - Weak but numerous (cautious)
- `calais_garrison_soldier` - Weakened defender (cautious)
- `norman_bandit` - Quick raider (aggressive)
- `french_captain` - Elite commander (skilled)
- `crecy_french_noble` - Boss-level opponent (aggressive)

### Inline Enemy Definition

```javascript
{
    text: "Fight Custom Enemy",
    type: "combat",
    enemy: {
        name: "Custom Enemy",
        health: 100,
        initiative: 5,
        strength: 6,
        agility: 5,
        archetype: "balanced" // or "aggressive", "cautious", "skilled"
    },
    winScene: "victory",
    loseScene: "defeat"
}
```

## Archetype Behaviors

- **aggressive**: High damage, charges often, vulnerable to counters
- **cautious**: Defensive, punishes mistakes, lower damage  
- **skilled**: High defense, precise attacks, weak stamina
- **balanced**: Versatile, adapts to situation

## Important Notes

1. **Backup First**: Always backup `man-at-arms.html` before integration
2. **Z-Index**: Combat overlay must have `z-index: 2000+` to appear above equipment screen
3. **Async/Await**: `triggerCombat()` must be async and await `startCombat()`
4. **State Cleanup**: Combat state is temporary - only results persist
5. **Equipment Integration**: Weapon stats from `equipmentManager.getWeaponStats()` affect combat

## Troubleshooting

**Combat doesn't start:**
- Check browser console (F12) for errors
- Verify `#minigame-overlay` exists in HTML
- Ensure all combat functions are copied

**Stats don't work:**
- Verify `equipmentManager` is initialized
- Check `getEffectiveStat()` function exists
- Ensure weapon stats are being read

**Scene doesn't transition:**
- Check `triggerCombat()` returns properly
- Verify `updateDisplay()` is called
- Check console for async/await errors

## Next Steps After Integration

1. Test combat with different enemy types
2. Verify equipment affects combat stats
3. Test victory and defeat paths
4. Add combat to existing battle scenes (Crécy, Calais, etc.)
5. Balance enemy difficulty based on player progression

---

For complete details, see `COMBAT_INTEGRATION_GUIDE.md`
