# Equipment System Integration Guide

This guide explains how to integrate the historically grounded equipment system into the main game.

## File Structure

- `man-at-arms-equipment-system.js` - Core equipment database and manager
- `man-at-arms.html` - Main game file (needs integration)

## Integration Steps

### 1. Include the Equipment System

Add to `<head>` of `man-at-arms.html`:

```html
<script src="man-at-arms-equipment-system.js"></script>
```

### 2. Initialize Equipment Manager

In the game initialization section:

```javascript
// Initialize equipment manager
const equipmentManager = new EquipmentManager(gameState);

// Set initial equipment based on starting background
if (gameState.background === 'noble') {
    equipmentManager.equipItem('bascinet_visored', 'head');
    equipmentManager.equipItem('pairs_of_plates', 'torso');
    equipmentManager.equipItem('arming_sword', 'weapon');
} else if (gameState.background === 'merchant') {
    equipmentManager.equipItem('bascinet_open', 'head');
    equipmentManager.equipItem('mail_haubergeon', 'torso');
    equipmentManager.equipItem('arming_sword', 'weapon');
} else {
    equipmentManager.equipItem('kettle_hat', 'head');
    equipmentManager.equipItem('padded_jack', 'torso');
    equipmentManager.equipItem('arming_sword', 'weapon');
}
```

### 3. Update Combat System Integration

Modify `getEquipmentBonus` function:

```javascript
function getEquipmentBonus(stat) {
    let bonus = 0;
    
    // Get weapon stats
    const weaponStats = equipmentManager.getWeaponStats();
    if (stat === 'strength' || stat === 'agility') {
        bonus += weaponStats.quality;
    }
    
    // Get armor protection (affects endurance/defense)
    if (stat === 'endurance') {
        const torsoProtection = equipmentManager.getProtectionForRegion('chest', 'cut');
        bonus += Math.floor(torsoProtection / 2); // Convert protection to stat bonus
    }
    
    return bonus;
}
```

### 4. Add Fatigue from Equipment

In combat, apply equipment fatigue:

```javascript
// In combat round
const mobilityPenalties = equipmentManager.getMobilityPenalties();
combatState.playerState.fatigue += mobilityPenalties.fatiguePerRound;

// Apply agility penalty
const effectiveAgility = gameState.stats.agility + mobilityPenalties.agilityPenalty;
```

### 5. Equipment Degradation

Add to scene `onEnter` functions for weather/combat scenes:

```javascript
onEnter: function() {
    // Degrade equipment in rain/mud
    if (scene.location.includes('rain') || scene.location.includes('mud')) {
        equipmentManager.degradeEquipment({
            rain: true,
            mud: true,
            wet: true
        });
    }
}
```

### 6. Equipment Purchase Scenes

Create equipment shop scenes:

```javascript
equipment_shop: {
    title: "Armorer's Shop",
    year: 1346,
    location: "Portsmouth",
    text: function() {
        const availableItems = equipmentManager.getAvailableItems(
            gameState.year,
            gameState.location,
            gameState.rank
        );
        
        let shopText = '<p>The armorer shows you his wares:</p><ul>';
        availableItems.forEach(item => {
            const price = item.priceDWU * (gameState.rank === 'man-at-arms' ? 12 : 6);
            shopText += `<li>${item.name} - ${price} silver (${item.priceDWU} DWU)</li>`;
        });
        shopText += '</ul>';
        
        return shopText;
    },
    choices: [
        // Dynamic choices based on available items
    ]
}
```

### 7. Equipment Display in UI

Update status bar to show equipped items:

```javascript
function updateStatusBar() {
    // ... existing code ...
    
    // Add equipment summary
    let equipmentSummary = '';
    const head = equipmentManager.inventory.head;
    const torso = equipmentManager.inventory.torso;
    const weapon = equipmentManager.inventory.weapon;
    
    if (head || torso || weapon) {
        equipmentSummary = '<div style="font-size: 0.9em; margin-top: 5px;">';
        if (head) equipmentSummary += `Head: ${head.item.name} `;
        if (torso) equipmentSummary += `Torso: ${torso.item.name} `;
        if (weapon) equipmentSummary += `Weapon: ${weapon.item.name}`;
        equipmentSummary += '</div>';
    }
    
    // Add to status bar HTML
}
```

## Combat System Integration

### Protection Calculation

In the combat demo, modify damage calculation:

```javascript
// Calculate damage reduction from armor
const hitLocation = determineHitLocation(); // Random or targeted
const protection = equipmentManager.getProtectionForRegion(hitLocation, damageType);
const reducedDamage = Math.max(1, damage - protection);
```

### Gap Targeting

For weapons with 'gap-target' property:

```javascript
if (weaponStats.properties.includes('gap-target')) {
    // Check if attack targets gap
    const gapChance = 0.3; // 30% chance to hit gap
    if (Math.random() < gapChance) {
        // Gap hit ignores armor
        damage = baseDamage;
    } else {
        // Normal armor calculation
        damage = baseDamage - protection;
    }
}
```

## Economy Integration

### Daily Wage Units

Convert DWU to silver based on rank:

```javascript
function getPriceInSilver(item) {
    const dailyWage = gameState.rank === 'man-at-arms' ? 12 : 6; // pence per day
    return item.priceDWU * dailyWage;
}
```

### Purchase Checks

```javascript
function canAffordItem(itemId) {
    const item = EQUIPMENT_DATABASE[itemId];
    const price = getPriceInSilver(item);
    return gameState.stats.wealth >= price;
}
```

## Equipment Condition & Maintenance

### Display Condition

```javascript
function getEquipmentConditionDisplay() {
    let display = '<div class="equipment-condition">';
    for (const slot in equipmentManager.inventory) {
        const equipped = equipmentManager.inventory[slot];
        if (equipped) {
            const condition = equipped.condition;
            const status = condition > 75 ? 'good' : condition > 50 ? 'fair' : condition > 25 ? 'poor' : 'ruined';
            display += `<div>${equipped.item.name}: ${status} (${condition}%)</div>`;
        }
    }
    display += '</div>';
    return display;
}
```

### Repair Scenes

```javascript
repair_equipment: {
    title: "Repair Equipment",
    text: function() {
        return '<p>You find a blacksmith willing to repair your gear...</p>';
    },
    choices: [
        {
            text: "Repair weapon (5 silver)",
            effects: { wealth: -5 },
            nextScene: "continue",
            onChoose: function() {
                const weapon = equipmentManager.inventory.weapon;
                if (weapon) {
                    weapon.condition = Math.min(100, weapon.condition + 30);
                }
            }
        }
    ]
}
```

## Historical Accuracy Notes

- Items are gated by year, region, and social class
- Prices reflect actual wage structures (6d/day archer, 12d/day man-at-arms)
- Protection values reflect real armor effectiveness
- Maintenance reflects period-appropriate concerns (rust, mail ring loss, padding rot)

## Next Steps

1. Create equipment shop UI
2. Add equipment comparison tooltips
3. Implement repair mechanics
4. Add equipment salvage from battlefields
5. Create equipment upgrade paths (tailoring, quality improvements)
