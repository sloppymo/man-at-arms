# Equipment System Integration - Fixed Version

This guide provides the corrected integration with all critical bugs fixed.

## Critical Fixes Applied

### 1. Persistence - Equipment stored in gameState only as primitives

Equipment is now stored as `{id, condition, fit}` - no full item objects. The manager reads from `EQUIPMENT_DATABASE` when needed.

### 2. Layered Inventory Structure

Equipment uses layered slots:
```javascript
gameState.equipment = {
    head: { plate: {id, condition, fit}, mail: {...}, padding: {...} },
    torso: { padding: {...}, mail: {...}, plate: {...}, surcoat: {...} },
    arms: { padding: {...}, mail: {...}, plate: {...} },
    legs: { padding: {...}, mail: {...}, plate: {...} },
    weapon: { primary: {...}, secondary: {...} },
    missile: { bow: {...}, ammo: {...} },
    accessory: {...},
    bag: [] // Unequipped items
};
```

### 3. Region vs Location

- `gameState.location` = specific place ("Portsmouth", "Caen")
- `gameState.region` = normalized tag ("England", "France", "Flanders")
- Equipment availability checks use `region`, not `location`

### 4. Condition Actually Affects Protection

Protection calculations now use equipped condition/fit, not template values.

## Integration Code

### Step 1: Initialize Equipment in gameState

```javascript
// In gameState initialization
gameState.equipment = gameState.equipment ?? {
    head: {},
    torso: {},
    arms: {},
    legs: {},
    weapon: {},
    missile: {},
    accessory: {},
    bag: []
};

// Add region tracking
gameState.region = gameState.region || 'England'; // Normalize from location
```

### Step 2: Initialize EquipmentManager

```javascript
// After gameState is created
const equipmentManager = new EquipmentManager(gameState);

// Set initial equipment based on background
if (gameState.background === 'noble') {
    equipmentManager.equipItem('bascinet_visored', 'head', LAYER_TYPES.PLATE);
    equipmentManager.equipItem('pairs_of_plates', 'torso', LAYER_TYPES.PLATE);
    equipmentManager.equipItem('mail_haubergeon', 'torso', LAYER_TYPES.MAIL);
    equipmentManager.equipItem('padded_jack', 'torso', LAYER_TYPES.PADDING);
    equipmentManager.equipItem('arming_sword', 'weapon', 'primary');
} else if (gameState.background === 'merchant') {
    equipmentManager.equipItem('bascinet_open', 'head', LAYER_TYPES.PLATE);
    equipmentManager.equipItem('mail_haubergeon', 'torso', LAYER_TYPES.MAIL);
    equipmentManager.equipItem('padded_jack', 'torso', LAYER_TYPES.PADDING);
    equipmentManager.equipItem('arming_sword', 'weapon', 'primary');
} else {
    equipmentManager.equipItem('kettle_hat', 'head', LAYER_TYPES.PLATE);
    equipmentManager.equipItem('padded_jack', 'torso', LAYER_TYPES.PADDING);
    equipmentManager.equipItem('arming_sword', 'weapon', 'primary');
}
```

### Step 3: Resource Management Helper

```javascript
// Separate resource mutator (for patronFavor, etc.)
function applyResourceChange(key, delta) {
    if (key === 'patronFavor') {
        gameState.stats.patronFavor = (gameState.stats.patronFavor || 0) + delta;
        gameState.stats.patronFavor = clampStat('patronFavor', gameState.stats.patronFavor);
    } else if (key === 'wealth') {
        applyStatChange('wealth', delta);
    } else if (key.startsWith('flag:')) {
        const flagName = key.substring(5);
        if (delta > 0) {
            gameState.flags[flagName] = true;
        } else {
            delete gameState.flags[flagName];
        }
    } else {
        // Fall back to stat change
        applyStatChange(key, delta);
    }
}

// Update choice effect processing
function processChoiceEffects(effects) {
    for (const [key, delta] of Object.entries(effects)) {
        if (key === 'patronFavor' || key.startsWith('flag:')) {
            applyResourceChange(key, delta);
        } else {
            applyStatChange(key, delta);
        }
    }
}
```

### Step 4: Effective Stats Function

```javascript
// Replace getEquipmentBonus with comprehensive effective stats
function getEffectiveStats() {
    const base = gameState.stats;
    const mods = equipmentManager.getStatModifiers();
    const conditionEffects = getConditionEffects();
    
    return {
        strength: base.strength + (conditionEffects.strength || 0),
        agility: base.agility + (mods.agility || 0) + (conditionEffects.agility || 0),
        endurance: base.endurance + (mods.endurance || 0) + (conditionEffects.endurance || 0),
        wits: base.wits + (conditionEffects.wits || 0),
        charisma: base.charisma + (conditionEffects.charisma || 0),
        stealth: (base.agility || 0) + (mods.stealth || 0) // Derived stat
    };
}

// Update getEffectiveStat to use new system
function getEffectiveStat(stat) {
    const effective = getEffectiveStats();
    return effective[stat] || gameState.stats[stat] || 0;
}
```

### Step 5: Combat Integration - Hit Location & Protection

```javascript
// Determine hit location
function determineHitLocation() {
    const locations = [
        'skull', 'face', 'throat', 'chest', 'ribs', 'back', 'belly',
        'shoulder', 'upperArm', 'elbow', 'forearm', 'hand',
        'thigh', 'knee', 'shin', 'foot'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
}

// Calculate damage with protection
function calculateDamageWithProtection(baseDamage, damageType, attackerWeapon) {
    const hitLocation = determineHitLocation();
    const protection = equipmentManager.getProtectionForRegion(hitLocation, damageType);
    
    // Gap targeting
    let gapHit = false;
    if (attackerWeapon.properties && attackerWeapon.properties.includes('gap-target')) {
        const gapExposure = equipmentManager.getGapExposure();
        const gapChance = 0.1 + (gapExposure / 20); // 10-60% based on exposure
        if (Math.random() < gapChance) {
            gapHit = true;
            // Gap hit ignores plate/mail, but padding still applies
            const paddingProtection = equipmentManager.getProtectionForRegion(hitLocation, damageType);
            // Only count padding layer
            return Math.max(1, baseDamage - Math.floor(paddingProtection * 0.3));
        }
    }
    
    // Normal hit - full protection
    return Math.max(1, baseDamage - protection);
}
```

### Step 6: Fatigue from Equipment

```javascript
// In combat, apply equipment fatigue
function applyCombatFatigue() {
    const kit = equipmentManager.getKitProfile();
    combatState.playerState.fatigue += kit.fatiguePerRound;
    
    // Heat penalty in hot weather
    if (scene.weather === 'hot' || scene.weather === 'summer') {
        combatState.playerState.fatigue += Math.floor(kit.heatPenalty / 2);
    }
}
```

### Step 7: Equipment Degradation with Scene Tags

```javascript
// Update scene structure to include tags
const scenes = {
    channel_crossing: {
        title: "Channel Crossing",
        year: 1346,
        location: "At sea",
        weather: 'rain', // Add weather tag
        terrain: null,
        context: 'sea', // Add context tag
        text: function() { /* ... */ },
        onEnter: function() {
            // Degrade equipment based on scene tags
            equipmentManager.degradeEquipment({
                wet: this.weather === 'rain',
                saltAir: this.context === 'sea',
                mud: this.terrain === 'mud',
                siege: this.context === 'siege'
            });
        }
    },
    siege_calais: {
        title: "Siege of Calais",
        year: 1346,
        location: "Calais",
        weather: 'winter',
        terrain: 'mud',
        context: 'siege',
        onEnter: function() {
            equipmentManager.degradeEquipment({
                wet: true,
                mud: true,
                siege: true
            });
        }
    }
};
```

### Step 8: Save/Load Compatibility

```javascript
// Update saveGame - equipment is already in gameState, just ensure it's valid
function saveGame() {
    // Ensure equipment structure is valid
    if (!gameState.equipment || typeof gameState.equipment !== 'object') {
        gameState.equipment = {
            head: {}, torso: {}, arms: {}, legs: {},
            weapon: {}, missile: {}, accessory: {}, bag: []
        };
    }
    
    const saveData = {
        ...gameState,
        enteredScenes: Array.from(gameState.enteredScenes)
    };
    localStorage.setItem('manAtArmsGame', JSON.stringify(saveData));
    showNotification('Game Saved', 'Your progress has been saved!');
}

// Update loadGame - equipment manager will migrate old format
function loadGame() {
    const saved = localStorage.getItem('manAtArmsGame');
    if (saved) {
        const loaded = JSON.parse(saved);
        
        // Restore Set
        if (loaded.enteredScenes && Array.isArray(loaded.enteredScenes)) {
            loaded.enteredScenes = new Set(loaded.enteredScenes);
        } else {
            loaded.enteredScenes = new Set();
        }
        
        Object.assign(gameState, loaded);
        
        // Reinitialize equipment manager (will migrate old format)
        const equipmentManager = new EquipmentManager(gameState);
        
        // Normalize region from location if missing
        if (!gameState.region) {
            gameState.region = equipmentManager.normalizeRegion(gameState.location);
        }
        
        updateDisplay();
        showNotification('Game Loaded', 'Your progress has been restored!');
    }
}
```

### Step 9: onEnter Guard System

```javascript
// Guard onEnter to run once per entry
gameState.enteredScenes = gameState.enteredScenes || {};

function runOnEnterOnce(sceneId, scene) {
    if (!scene.onEnter) return;
    if (gameState.enteredScenes[sceneId]) return;
    gameState.enteredScenes[sceneId] = true;
    scene.onEnter.call(scene); // Call with scene as context
}

// In updateStory or scene transition
function transitionToScene(sceneId) {
    const scene = scenes[sceneId];
    if (!scene) return;
    
    gameState.currentScene = sceneId;
    runOnEnterOnce(sceneId, scene); // Run onEnter once
    updateDisplay();
}
```

### Step 10: Economy - Daily Wage Units

```javascript
// Daily wage calculation
function dailyWagePence() {
    return (gameState.rank === 'man-at-arms' || gameState.rank.includes('man-at-arms')) ? 12 : 6;
}

// Price in pence
function pricePence(item) {
    return Math.round(item.priceDWU * dailyWagePence());
}

// Price in silver (if wealth is in silver)
function priceSilver(item) {
    return Math.round(pricePence(item) / 12); // 12 pence = 1 shilling = 1 silver
}

// Check affordability
function canAffordItem(itemId) {
    const item = EQUIPMENT_DATABASE[itemId];
    if (!item) return false;
    const price = priceSilver(item);
    return gameState.stats.wealth >= price;
}
```

## UI: Equipment Display

### Minimal Summary (Always Visible)

```javascript
function getEquipmentSummary() {
    const head = equipmentManager.gameState.equipment.head;
    const torso = equipmentManager.gameState.equipment.torso;
    const weapon = equipmentManager.gameState.equipment.weapon;
    
    let summary = '';
    
    // Head
    const headPlate = head?.[LAYER_TYPES.PLATE];
    if (headPlate) {
        const item = EQUIPMENT_DATABASE[headPlate.id];
        summary += `Head: ${item.name} `;
    }
    
    // Torso (show top layer)
    const torsoPlate = torso?.[LAYER_TYPES.PLATE];
    const torsoMail = torso?.[LAYER_TYPES.MAIL];
    const torsoPadding = torso?.[LAYER_TYPES.PADDING];
    if (torsoPlate) {
        const item = EQUIPMENT_DATABASE[torsoPlate.id];
        summary += `Torso: ${item.name} `;
    } else if (torsoMail) {
        const item = EQUIPMENT_DATABASE[torsoMail.id];
        summary += `Torso: ${item.name} `;
    } else if (torsoPadding) {
        const item = EQUIPMENT_DATABASE[torsoPadding.id];
        summary += `Torso: ${item.name} `;
    }
    
    // Weapon
    const weaponPrimary = weapon?.primary;
    if (weaponPrimary) {
        const item = EQUIPMENT_DATABASE[weaponPrimary.id];
        summary += `Weapon: ${item.name}`;
    }
    
    return summary || 'No equipment';
}
```

### Expandable Harness Panel (Optional)

```javascript
function getEquipmentDetails() {
    const kit = equipmentManager.getKitProfile();
    let details = '<div class="equipment-details">';
    
    // Protection summary
    details += '<h4>Protection</h4>';
    details += `<div>Chest: ${kit.protection.chest?.cut || 0} cut, ${kit.protection.chest?.thrust || 0} thrust</div>`;
    details += `<div>Head: ${kit.protection.skull?.cut || 0} cut</div>`;
    
    // Condition
    details += '<h4>Condition</h4>';
    for (const slot of ['head', 'torso', 'arms', 'legs', 'weapon']) {
        const slotData = equipmentManager.gameState.equipment[slot] || {};
        for (const layer in slotData) {
            const equipped = slotData[layer];
            if (equipped && equipped.id) {
                const item = EQUIPMENT_DATABASE[equipped.id];
                const condition = equipped.condition || 100;
                const status = condition > 75 ? 'good' : condition > 50 ? 'fair' : condition > 25 ? 'poor' : 'ruined';
                details += `<div>${item.name}: ${status} (${condition}%)</div>`;
            }
        }
    }
    
    // Provenance notes (for hardcore buffs)
    details += '<h4>Notes</h4>';
    const headPlate = equipmentManager.gameState.equipment.head?.[LAYER_TYPES.PLATE];
    if (headPlate) {
        const item = EQUIPMENT_DATABASE[headPlate.id];
        if (item.provenance) {
            details += `<div class="provenance">${item.provenance}</div>`;
        }
    }
    
    details += '</div>';
    return details;
}
```

## Testing Checklist

- [ ] Equipment persists through save/load
- [ ] Old save format migrates correctly
- [ ] Condition affects protection
- [ ] Layered armor stacks correctly
- [ ] Gap targeting works with equipment
- [ ] Fatigue applies from equipment
- [ ] Degradation works with scene tags
- [ ] Region vs location handled correctly
- [ ] Effective stats include equipment modifiers
