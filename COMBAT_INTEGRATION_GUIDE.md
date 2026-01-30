# Combat System Integration Guide

## Overview

This guide provides the complete, enhanced prompt for integrating the interactive QTE combat system from `man-at-arms-combat-demo.html` into the main narrative engine in `man-at-arms.html`.

## Prerequisites

Before starting, ensure you have:
- `man-at-arms.html` (main game file)
- `man-at-arms-equipment-system.js` (equipment database)
- `man-at-arms-equipment-ui.js` (equipment UI)
- `man-at-arms-combat-demo.html` (combat system prototype)
- `man-at-arms-enemy-profiles.js` (enemy database - optional but recommended)

**IMPORTANT:** Save a backup of `man-at-arms.html` before proceeding!

## Complete Cursor Integration Prompt

Copy and paste this entire prompt into Cursor with all files open:

---

"I need to integrate the interactive combat system from `man-at-arms-combat-demo.html` into the main narrative engine in `man-at-arms.html`. Please perform the following steps carefully:

### 1. UI Integration

**CSS:**
- Copy all CSS styles from `man-at-arms-combat-demo.html` (specifically `.qte-bar-container`, `.minigame-overlay`, `.health-bars`, `.combat-log`, `.action-button`, etc.) into the `<style>` block of `man-at-arms.html`.
- Ensure `#minigame-overlay` has `z-index: 2000` or higher to appear above the equipment screen (which uses `z-index: 2000`).
- Keep all existing styles in `man-at-arms.html` - do not remove or overwrite them.

**HTML:**
- Copy the `#minigame-overlay` HTML structure and all its children from `man-at-arms-combat-demo.html` into the `<body>` of `man-at-arms.html`.
- Place it after the equipment screen but before the closing `</body>` tag.
- Ensure it is hidden by default: `style="display: none;"` or add `class="hidden"` if that class exists.

### 2. Logic & State Mapping

**Create `triggerCombat()` function:**
- Create an async function: `async function triggerCombat(enemyProfile, winScene, loseScene)`
- This function must:
  1. **Hide the main story container:**
     ```javascript
     const gameContainer = document.querySelector('.game-container');
     if (gameContainer) gameContainer.style.display = 'none';
     ```
  
  2. **Initialize combat state from game state:**
     - Map `gameState.stats.stress` (0-10) to `combatState.playerState.fatigue` (0-100):
       ```javascript
       const stressMax = statLimits.stress?.max || 10;
       combatState.playerState.fatigue = Math.floor((gameState.stats.stress / stressMax) * 100);
       ```
     - Set player stats using `getEffectiveStat()`:
       ```javascript
       combatState.playerStats.strength = getEffectiveStat('strength');
       combatState.playerStats.agility = getEffectiveStat('agility');
       combatState.playerStats.initiative = getEffectiveStat('agility'); // Initiative based on agility
       ```
     - Get weapon stats from equipment manager:
       ```javascript
       if (window.equipmentManager) {
           const weaponStats = window.equipmentManager.getWeaponStats();
           combatState.playerStats.weaponQuality = weaponStats.quality || 0;
           // Apply weapon quality to combat modifiers
       }
       ```
  
  3. **Map enemy profile to combat state:**
     ```javascript
     combatState.enemyStats = {
         initiative: enemyProfile.initiative || 5,
         strength: enemyProfile.strength || 5,
         agility: enemyProfile.agility || 5,
         archetype: enemyProfile.archetype || 'balanced',
         health: enemyProfile.health || 100
     };
     combatState.enemyHealth = enemyProfile.health || 100;
     ```
  
  4. **Reset combat state:**
     ```javascript
     combatState.playerHealth = 100;
     combatState.currentRound = 1;
     combatState.actionsRemaining = 2;
     combatState.playerState.stance = 'balanced';
     combatState.playerState.counterReady = false;
     combatState.conditions.enemyStunned = 0;
     combatState.conditions.playerStunned = 0;
     combatState.combatHistory = [];
     ```

### 3. Combat Execution

**Modify `startCombat()` function:**
- Copy the entire `startCombat()` function from `man-at-arms-combat-demo.html`.
- Modify it to return a Promise that resolves when combat ends:
  ```javascript
  async function startCombat() {
      // ... existing combat logic ...
      
      // When combat ends (victory or defeat), return result:
      if (combatState.enemyHealth <= 0) {
          addLogEntry('Victory! You have defeated your enemy!', 'success');
          setTimeout(() => {
              document.getElementById('minigame-overlay').style.display = 'none';
          }, 2000);
          return { victory: true, playerHealth: combatState.playerHealth, fatigue: combatState.playerState.fatigue };
      }
      if (combatState.playerHealth <= 0) {
          addLogEntry('Defeat! You have been struck down...', 'failure');
          setTimeout(() => {
              document.getElementById('minigame-overlay').style.display = 'none';
          }, 2000);
          return { victory: false, playerHealth: 0, fatigue: combatState.playerState.fatigue };
      }
  }
  ```

**In `triggerCombat()`:**
- Call `startCombat()` and await the result:
  ```javascript
  const result = await startCombat();
  
  // Restore story container
  const gameContainer = document.querySelector('.game-container');
  if (gameContainer) gameContainer.style.display = 'block';
  
  // Update game state based on combat result
  // (See Step 4 for details)
  
  // Transition to appropriate scene
  gameState.currentScene = result.victory ? winScene : loseScene;
  updateDisplay();
  ```

### 4. Resolution & Cleanup

**After combat ends in `triggerCombat()`:**
- Update `gameState.stats.stress` based on final fatigue:
  ```javascript
  const stressMax = statLimits.stress?.max || 10;
  gameState.stats.stress = Math.min(stressMax, Math.floor((result.fatigue / 100) * stressMax));
  gameState.stats.stress = clampStat('stress', gameState.stats.stress);
  ```

- Apply wounds based on damage taken:
  ```javascript
  if (result.playerHealth < 50) {
      addCondition('Wounded', 'negative', 2);
  }
  if (result.playerHealth <= 0) {
      addCondition('Seriously Wounded', 'negative', 3);
      // Player may need to be captured or rescued
  }
  ```

- Track combat in career stats:
  ```javascript
  gameState.career.battles++;
  if (result.victory) {
      // Optional: grant experience or reputation
      applyStatChange('experience', 1);
  }
  ```

- Clean up any running animations:
  ```javascript
  if (window.combatAnimationId) {
      cancelAnimationFrame(window.combatAnimationId);
      window.combatAnimationId = null;
  }
  ```

### 5. Engine Bridge

**Modify `makeChoice()` function:**
- In the `makeChoice(choiceIndex)` function, add a check for combat type choices:
  ```javascript
  const choice = scene.choices[choiceIndex];
  
  // Handle combat type choices
  if (choice.type === 'combat') {
      // Trigger combat instead of normal resolution
      triggerCombat(choice.enemy, choice.winScene, choice.loseScene).catch(error => {
          console.error('Combat error:', error);
          // Fallback to normal scene transition on error
          gameState.currentScene = choice.winScene;
          updateDisplay();
      });
      return; // Exit early, combat will handle scene transition
  }
  
  // ... rest of existing makeChoice logic ...
  ```

### 6. Copy Combat Functions

**Copy all combat-related functions from the demo:**
- `showCombatQTE()` - QTE minigame handler
- `showActionSelection()` - Action choice UI
- `showInitiativeCheck()` - Initiative phase QTE
- `enemyAttack()` - Enemy AI and attack logic
- `calculateZoneSize()` - QTE zone calculation
- `calculateFatigueGain()` - Fatigue system
- `updateHealthBars()` - Health bar updates
- `addLogEntry()` - Combat log entries
- All helper functions and event handlers

**Important:** Ensure all these functions are available in the global scope or properly namespaced.

### 7. Initialization

**In `initGame()` function:**
- Ensure EquipmentManager is initialized:
  ```javascript
  function initGame() {
      // ... existing initGame code ...
      
      // Initialize equipment manager if not already done
      if (typeof EquipmentManager !== 'undefined' && !window.equipmentManager) {
          window.equipmentManager = new EquipmentManager(gameState);
      }
      
      updateDisplay();
  }
  ```

**Initialize combat state:**
- Copy the `combatState` object initialization from the demo into `man-at-arms.html`.
- Place it near the top of the script section, after `gameState` initialization.

### 8. Testing & Validation

**After integration:**
- Test that combat can be triggered from a scene choice
- Verify that equipment stats affect combat (weapon quality, armor, etc.)
- Ensure stress/fatigue mapping works correctly
- Test victory and defeat paths
- Verify scene transitions work after combat
- Check that save/load doesn't break (combat state should not be saved)

---

## Example Scene Usage

After integration, you can use combat in scenes like this:

```javascript
crecy_battle: {
    title: "The Battle of Crécy",
    year: 1346,
    age: 28,
    location: "Crécy, France",
    text: `<p><strong>26 August 1346</strong></p>
           <p>The French charge comes on. You see a French knight dismounting, his banner held high. The chaos of battle surrounds you.</p>`,
    choices: [
        {
            text: "Engage the French Knight",
            type: "combat",
            enemy: {
                name: "French Knight",
                health: 120,
                initiative: 6,
                strength: 7,
                agility: 5,
                archetype: "aggressive"
            },
            winScene: "crecy_victory",
            loseScene: "crecy_defeat"
        },
        {
            text: "Target the Genoese Crossbowmen",
            type: "combat",
            enemy: {
                name: "Genoese Crossbowman",
                health: 85,
                initiative: 8,
                strength: 5,
                agility: 7,
                archetype: "skilled"
            },
            winScene: "crossbowman_defeated",
            loseScene: "wounded_by_crossbow"
        },
        {
            text: "Hold position and wait",
            effects: {},
            nextScene: "crecy_wait"
        }
    ]
}
```

## Using Enemy Profiles Database

If you've included `man-at-arms-enemy-profiles.js`, you can reference enemies by ID:

```javascript
{
    text: "Fight the French Knight",
    type: "combat",
    enemy: "french_knight", // Reference by ID
    winScene: "victory",
    loseScene: "defeat"
}
```

Then in `triggerCombat()`, check if enemy is a string ID:
```javascript
if (typeof enemyProfile === 'string') {
    enemyProfile = getEnemyProfile(enemyProfile) || enemyProfile;
}
```

## Troubleshooting

**Combat overlay doesn't show:**
- Check z-index is higher than equipment screen
- Verify `#minigame-overlay` exists in DOM
- Check console for JavaScript errors

**Stats don't affect combat:**
- Verify `equipmentManager` is initialized
- Check `getEffectiveStat()` is working
- Ensure weapon stats are being applied

**Scene doesn't transition after combat:**
- Check `triggerCombat()` is async and awaiting `startCombat()`
- Verify `updateDisplay()` is called after scene change
- Check console for errors in combat resolution

**Animation errors:**
- Ensure `requestAnimationFrame` IDs are stored and cancelled
- Check that animations are cleaned up on combat end

## Notes

- Combat state is temporary and should NOT be saved to gameState
- Only combat results (wounds, stress, experience) should persist
- Equipment changes during combat should be reflected in real-time
- Consider adding a "Flee" option that exits combat without victory/defeat

---

**End of Integration Prompt**"

---

## Additional Resources

### Enemy Profile Reference

See `man-at-arms-enemy-profiles.js` for a complete database of historically accurate enemies including:
- French Knights and Men-at-Arms
- Genoese Crossbowmen
- Scottish Highlanders
- Calais Garrison Soldiers
- Norman Bandits
- And more...

### Historical Context

All enemies are based on:
- Crécy campaign (1346)
- Calais siege (1346-47)
- Hundred Years' War era (1337-1453)
- Historical accounts and military records

### Archetype Behaviors

- **Aggressive**: High damage, charges often, vulnerable to counters
- **Cautious**: Defensive, punishes mistakes, lower damage
- **Skilled**: High defense, precise attacks, weak stamina
- **Balanced**: Versatile, adapts to situation

---

Good luck with the integration!
