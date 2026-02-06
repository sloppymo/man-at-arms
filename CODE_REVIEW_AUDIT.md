# Man-at-Arms Equipment System: Code Review & Integration Audit

**Date:** 2024  
**Reviewer:** Senior JavaScript/Game-Systems Engineer  
**Scope:** Equipment system integration between `man-at-arms.html` and `man-at-arms-equipment-ui.js`

---

## 1. High-Level Architecture Map

### Major Subsystems

1. **Scene/Story Engine** (`man-at-arms.html`)
   - Manages game narrative flow, scene transitions, choices
   - Updates `gameState` based on player decisions
   - Handles save/load via `localStorage`

2. **State Model** (`gameState` object)
   - Central game state object (declared at line ~1023)
   - Contains: stats, inventory, equipment, flags, relationships, etc.
   - Persisted to `localStorage` via `saveGame()` / `loadGame()`

3. **Combat/Skirmish System** (`man-at-arms.html`)
   - Uses equipment stats for combat calculations
   - References `gameState.equipment` directly in some places
   - Calls `equipmentManager.getWeaponStats()` and `getStatModifiers()` when available

4. **Save/Load System** (`man-at-arms.html`)
   - `saveGame()` serializes `gameState` to JSON
   - `loadGame()` deserializes and calls `hydrateLoadedState()` (line ~17535)
   - **Issue:** `Set` objects (e.g., `enteredScenes`) converted to arrays for JSON

5. **Notifications** (`showNotification()` function)
   - Displays modal dialogs for errors/info
   - Used when equipment system fails to initialize

6. **Equipment/Inventory System** (3 components):
   - **EquipmentManager** (`man-at-arms-equipment-system.js`)
     - Manages layered equipment structure
     - Calculates protection, mobility, kit profiles
     - Handles migration from old format
   - **EquipmentUI** (`man-at-arms-equipment-ui.js`)
     - Paper-doll visualization
     - Drag/drop inventory management
     - Keyboard accessibility handlers
   - **EQUIPMENT_DATABASE** (`man-at-arms-equipment-system.js`)
     - Global constant with all item definitions (`ItemSpec` objects)

### Key Global Variables/Functions

| Variable/Function | Location | Purpose | Owner |
|-------------------|----------|---------|-------|
| `gameState` | `man-at-arms.html:1023` | Central game state | Story engine |
| `equipmentManager` | `man-at-arms.html:17928` | EquipmentManager instance | `initializeEquipmentSystem()` |
| `equipmentUI` | `man-at-arms.html:17927` | EquipmentUI instance | `initializeEquipmentSystem()` |
| `window.equipmentManager` | Both files | Global reference | Set by `initializeEquipmentSystem()` |
| `window.equipmentUI` | Both files | Global reference | Set by `initializeEquipmentSystem()` |
| `EQUIPMENT_DATABASE` | `equipment-system.js:149` | Item definitions | Global constant |
| `openEquipmentScreen()` | `man-at-arms.html:17954` | Opens equipment UI | Story engine |
| `initializeEquipmentSystem()` | `man-at-arms.html:17930` | Initializes manager + UI | Story engine |

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    gameState (HTML)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ equipment: {                                         │   │
│  │   head: { plate: {id, condition, fit}, ... },       │   │
│  │   torso: { padding: {...}, mail: {...}, ... },       │   │
│  │   weapon: { primary: {...}, secondary: {...} },     │   │
│  │   ...                                                 │   │
│  │ }                                                     │   │
│  │ inventory: [{id, condition, fit, stackCount}, ...]   │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ (references)
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌──────────────────┐          ┌──────────────────────┐
│ EquipmentManager │          │  EquipmentUI         │
│ (equipment-      │          │  (equipment-ui.js)   │
│  system.js)      │          │                      │
│                  │          │  ┌────────────────┐  │
│ - equipItem()    │◄─────────┤  │ PaperDollPanel │  │
│ - getKitProfile()│          │  │ InventoryPanel │  │
│ - getStatMods()  │          │  │ KitStatsPanel │  │
│ - migrateOld()   │          │  └────────────────┘  │
└──────────────────┘          └──────────────────────┘
        │                               │
        │                               │ (reads/writes)
        │                               │
        └───────────────┬───────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │ EQUIPMENT_       │
              │ DATABASE         │
              │ (ItemSpec objs)  │
              └──────────────────┘
```

**Critical Path:** `openEquipmentScreen()` → `initializeEquipmentSystem()` → `EquipmentUI.open()` → `PaperDollPanel.render()` → reads `gameState.equipment`

---

## 2. Game State + Data-Model Audit

### Current `gameState.equipment` Structure

#### **New Layered Format** (Expected by EquipmentManager/EquipmentUI)

```javascript
gameState.equipment = {
    head: {
        textile: { id: 'hood', condition: 100, fit: 'off-the-rack' },
        padding: { id: 'padded_arming_cap', condition: 95, fit: 'tailored' },
        mail: { id: 'mail_coif', condition: 80, fit: 'off-the-rack' },
        plate: { id: 'bascinet_visored', condition: 90, fit: 'tailored' }
    },
    torso: {
        textile: { id: 'linen_shirt', condition: 100, fit: 'off-the-rack' },
        padding: { id: 'padded_jack', condition: 85, fit: 'off-the-rack' },
        mail: { id: 'mail_haubergeon', condition: 75, fit: 'tailored' },
        plate: { id: 'pairs_of_plates', condition: 90, fit: 'tailored' },
        surcoat: { id: 'surcoat', condition: 100, fit: 'off-the-rack' }
    },
    arms: { /* textile, padding, mail, plate layers */ },
    legs: { /* textile, padding, mail, plate layers */ },
    weapon: {
        primary: { id: 'arming_sword', condition: 95, fit: 'tailored' },
        secondary: { id: 'rondel_dagger', condition: 100, fit: 'off-the-rack' }
    },
    missile: {
        bow: { id: 'longbow', condition: 80, fit: 'off-the-rack' },
        ammo: { id: 'arrows_bodkin', condition: 100, fit: 'off-the-rack' }
    },
    accessory: { /* shields, tools, etc. */ },
    bag: [] // Unequipped items (legacy, not used by UI)
}
```

**Layer keys:** `textile`, `padding`, `mail`, `plate`, `surcoat`, `primary`, `secondary`, `item`, `bow`, `ammo`

#### **Old Format** (Still referenced in HTML)

```javascript
gameState.equipment = {
    weapon: {
        item: { id: 'arming_sword' },
        quality: 2,  // 0-3 quality level
        name: 'Arming Sword'
    },
    armor: {
        item: { id: 'mail_haubergeon' },
        quality: 1,
        name: 'Mail Haubergeon'
    },
    head: {
        item: { id: 'kettle_hat' }
    },
    torso: {
        item: { id: 'pairs_of_plates' }
    },
    accessory: {
        item: { id: 'buckler' }
    }
}
```

### Inventory Structure

**Current format (both systems expect):**
```javascript
gameState.inventory = [
    {
        id: 'arming_sword',
        condition: 95,
        fit: 'tailored',
        stackCount: 1  // For consumables
    },
    {
        id: 'arrows_bodkin',
        condition: 100,
        stackCount: 24  // Stackable items
    }
]
```

### Schema Mismatches

| Location | Expects | Actual Format | Issue |
|----------|---------|---------------|-------|
| `equipment-ui.js:155` | `gameState.equipment[slot][layer]` | Old: `gameState.equipment.weapon.item` | **Mismatch** |
| `equipment-ui.js:351` | `gameState.equipment[slot][layer]` | Old: `gameState.equipment.torso.item` | **Mismatch** |
| `man-at-arms.html:1598` | `gameState.equipment.weapon.item` | New: `gameState.equipment.weapon.primary` | **Mismatch** |
| `man-at-arms.html:16073` | `gameState.equipment.weapon.item` | New: `gameState.equipment.weapon.primary` | **Mismatch** |
| `man-at-arms.html:5345` | `gameState.equipment.weapon.quality` | New: No `quality` field | **Mismatch** |
| `man-at-arms.html:14070` | `gameState.equipment.weapon.name` | New: No `name` field | **Mismatch** |

### Canonical Schema Recommendation

**Adopt the layered format as canonical.** Structure:

```typescript
interface EquipmentSlot {
    [layer: string]: {
        id: string;           // Item ID from EQUIPMENT_DATABASE
        condition: number;     // 0-100
        fit: 'off-the-rack' | 'tailored' | 'salvage';
    };
}

interface Equipment {
    head: EquipmentSlot;
    neck: EquipmentSlot;      // Missing in current HTML default
    torso: EquipmentSlot;
    shoulders: EquipmentSlot; // Missing in current HTML default
    arms: EquipmentSlot;
    hands: EquipmentSlot;     // Missing in current HTML default
    legs: EquipmentSlot;
    feet: EquipmentSlot;      // Missing in current HTML default
    weapon: EquipmentSlot;    // Uses 'primary', 'secondary' layers
    offhand: EquipmentSlot;   // Uses 'item' layer (EquipmentUI expects this)
    back: EquipmentSlot;      // Uses 'item' layer (EquipmentUI expects this)
    missile: EquipmentSlot;   // Uses 'bow', 'ammo' layers
    accessory: EquipmentSlot;  // Legacy slot, maps to offhand/back
    bag: Array<InventoryItem>; // Deprecated, use inventory[]
}

interface InventoryItem {
    id: string;
    condition?: number;       // Default 100
    fit?: string;             // Default 'off-the-rack'
    stackCount?: number;      // Default 1
}
```

**Slot Name Mapping:**
- EquipmentUI uses: `head`, `neck`, `torso`, `shoulders`, `arms`, `hands`, `legs`, `feet`, `weapon`, `offhand`, `back`, `missile`
- HTML default uses: `head`, `torso`, `arms`, `legs`, `weapon`, `missile`, `accessory`
- **Gap:** `neck`, `shoulders`, `hands`, `feet`, `offhand`, `back` missing in HTML default

### Migration/Adapter Strategy

**Phase 1: Adapter Functions** (Immediate)

Create adapter functions in `man-at-arms.html`:

```javascript
// Adapter: Get item from old or new format
function getEquippedItem(slot, layer = null) {
    const slotData = gameState.equipment[slot];
    if (!slotData) return null;
    
    // New format: slotData[layer]
    if (layer && slotData[layer] && slotData[layer].id) {
        return slotData[layer];
    }
    
    // Old format: slotData.item
    if (slotData.item && slotData.item.id) {
        return slotData.item;
    }
    
    // Legacy weapon.primary fallback
    if (slot === 'weapon' && slotData.primary && slotData.primary.id) {
        return slotData.primary;
    }
    
    return null;
}

// Adapter: Get quality (derived from condition in new format)
function getEquipmentQuality(slot) {
    const slotData = gameState.equipment[slot];
    if (slotData && slotData.quality !== undefined) {
        return slotData.quality; // Old format
    }
    
    // New format: derive from condition
    const item = getEquippedItem(slot, 'primary') || getEquippedItem(slot);
    if (item && item.condition !== undefined) {
        return Math.floor(item.condition / 20); // 0-5 quality from 0-100 condition
    }
    
    return 0;
}
```

**Phase 2: Migration on Load** (Next)

Enhance `hydrateLoadedState()` (line ~17550) to fully migrate old saves:

```javascript
// In hydrateLoadedState(), after line 17566
if (loaded.equipment && !isLayeredFormat(loaded.equipment)) {
    // Migrate old format
    const migrated = migrateEquipmentFormat(loaded.equipment);
    base.equipment = migrated;
}
```

**Phase 3: Update All References** (Later)

Replace all `gameState.equipment.weapon.item` → `getEquippedItem('weapon', 'primary')`  
Replace all `gameState.equipment.weapon.quality` → `getEquipmentQuality('weapon')`

---

## 3. Equipment System Integration Review (Deep Dive)

### Flow: Opening Equipment Screen

```
1. User clicks "🛡️ Equipment" button (line 931)
   ↓
2. Calls openEquipmentScreen() (line 17954)
   ↓
3. Checks if equipmentUI exists (line 17961)
   ↓
4. If not, calls initializeEquipmentSystem() (line 17963)
   ↓
5. initializeEquipmentSystem() (line 17930):
   - Checks EquipmentManager, EQUIPMENT_DATABASE exist (line 17932-17933)
   - Creates EquipmentManager instance (line 17936)
   - Sets window.equipmentManager (line 17937)
   - Creates EquipmentUI instance (line 17941)
   - Sets window.equipmentUI (line 17942)
   ↓
6. equipmentUI.open() (equipment-ui.js:702)
   - Checks for #equipment-screen DOM element (line 707)
   - Creates PaperDollPanel, InventoryPanel, KitStatsPanel (lines 718-720)
   - Calls render() on all panels (line 722)
   - Shows equipment screen (line 723)
   ↓
7. PaperDollPanel.render() (equipment-ui.js:282)
   - Calls controller.getKitProfile() (line 283)
   - Renders SVG silhouette (line 289)
   - Renders slot zones (line 290)
   - Renders layer display (line 293)
   - Attaches event listeners (line 298)
```

**Potential Failure Points:**
- ❌ `EQUIPMENT_DATABASE` not loaded → `initializeEquipmentSystem()` fails silently
- ❌ `EquipmentManager` class not defined → `initializeEquipmentSystem()` fails silently
- ❌ `#equipment-screen` missing → `equipmentUI.open()` shows alert, returns early
- ❌ `gameState.equipment` in old format → `getKitProfile()` may return incorrect data

### Flow: Equipping Item via Drag/Drop

```
1. User drags item from inventory (equipment-ui.js:533)
   ↓
2. handleInventoryDragStart() (line 789)
   - Sets dataTransfer data to itemId (line 790)
   ↓
3. User drops on slot/layer (equipment-ui.js:435)
   ↓
4. handleDrop() (line 435)
   - Gets itemId from dataTransfer (line 441)
   - Gets slot/layer from target element (lines 439-440)
   - Calls controller.equipItem(itemId, slot, layer) (line 444)
   ↓
5. EquipmentUIController.equipItem() (line 148)
   - Calls canDrop() to validate (line 149)
   - Gets current item in slot/layer (line 155)
   - Calls equipmentManager.equipItem() (line 163)
   - Adds swapped item to inventory (line 170)
   - Removes item from inventory (line 174)
   - Returns success/error (line 176)
   ↓
6. EquipmentManager.equipItem() (equipment-system.js:1739)
   - Looks up item in EQUIPMENT_DATABASE (line 1740)
   - Determines layer if not provided (line 1744)
   - Checks availability (year/region/rank) (line 1750)
   - Initializes slot if needed (line 1759)
   - Stores {id, condition, fit} in gameState.equipment[slot][layer] (line 1764)
   - Returns true/false (line 1770)
   ↓
7. PaperDollPanel.handleDrop() continues (line 445)
   - If success, calls render() to refresh UI (line 450)
   - Calls window.equipmentUI.refreshAll() (line 451)
```

**Potential Failure Points:**
- ❌ `EQUIPMENT_DATABASE[itemId]` undefined → `equipItem()` returns false, no error message
- ❌ Slot/layer mismatch → `canDrop()` returns invalid, but error shown
- ❌ Availability check fails → Silent failure, no user feedback
- ❌ `gameState.equipment[slot]` not initialized → `equipItem()` initializes it, but old code may break

### Flow: Equipping Item via Keyboard

```
1. User focuses inventory item, presses Enter/Space (equipment-ui.js:532)
   ↓
2. handleInventoryKeydown() (line 809)
   - Calls window.equipmentUI.showEquipMenu(itemId) (line 813)
   ↓
3. EquipmentUI.showEquipMenu() (line 763)
   - Gets slot compatibility (line 764)
   - If 0 options: alert (line 766)
   - If 1 option: auto-equip (line 772)
   - If 2+ options: prompt() (line 782) ← **BAD UX**
   ↓
4. If auto-equip, calls controller.equipItem() (line 773)
   - Same flow as drag/drop (steps 5-7 above)
```

**Issues:**
- ❌ Uses `prompt()` for multiple slot options (line 782) - blocking, poor UX
- ❌ No proper menu UI for keyboard users
- ❌ `showSlotMenu()` referenced but not implemented (line 804)

### Missing Functions

| Function | Referenced In | Expected Behavior | Status |
|----------|---------------|-------------------|--------|
| `showSlotMenu(slotId)` | `equipment-ui.js:804` | Show context menu for unequipping/viewing slot | **MISSING** |
| `handleSlotKeydown()` | `equipment-ui.js:338` | Keyboard handler for slot zones | **PARTIAL** (only Enter/Space, no menu) |

### Slot/Layer Naming Inconsistencies

| System | Slot Name | Layer Name | Notes |
|--------|-----------|------------|-------|
| EquipmentUI | `offhand` | `item` | For shields, tools |
| EquipmentUI | `back` | `item` | For back items |
| HTML default | `accessory` | N/A | Legacy slot, no layer |
| EquipmentManager | `accessory` | N/A | Still uses accessory slot |
| EquipmentUI mapping | `accessory` → `offhand` | Maps in `getSlotCompatibility()` | **Inconsistent** |

**Issue:** `equipment-ui.js:115-121` maps `accessory` items to `offhand` slot, but `EquipmentManager.equipItem()` accepts `accessory` as a slot. This creates confusion.

### Direct State Mutations (Risks)

**Found direct `gameState.equipment` mutations:**

1. **Line 5345:** `gameState.equipment.weapon.quality = 1;`
   - **Risk:** Old format only, breaks if migrated
   - **Fix:** Use adapter or `EquipmentManager` method

2. **Line 5348:** `gameState.equipment.armor.quality = 1;`
   - **Risk:** `armor` slot doesn't exist in new format
   - **Fix:** Map to `torso.plate` or create adapter

3. **Line 6593:** `gameState.equipment.weapon.quality = Math.min(2, ...)`
   - **Risk:** Old format only
   - **Fix:** Update condition instead: `gameState.equipment.weapon.primary.condition = Math.min(100, ...)`

4. **Line 193:** `delete this.gameState.equipment[slot][layer];` (equipment-ui.js)
   - **Risk:** Bypasses `EquipmentManager`, may break kit calculations
   - **Fix:** Add `EquipmentManager.unequipItem(slot, layer)` method

5. **Line 170:** `this.addToInventory(swappedItem);` (equipment-ui.js)
   - **Risk:** Direct inventory mutation, may not trigger save hooks
   - **Fix:** Use centralized inventory manager or emit events

---

## 4. Bug/Issue List (Prioritized)

### 🔴 BLOCKER

#### B1: Equipment Screen Fails to Open if EQUIPMENT_DATABASE Not Loaded
- **Where:** `man-at-arms.html:17930-17947`, `equipment-ui.js:88-90`
- **Symptom:** Clicking "Equipment" button shows "Equipment system not loaded" notification
- **Root Cause:** `initializeEquipmentSystem()` checks for `EQUIPMENT_DATABASE` but script may load after HTML
- **Reproduce:** Load HTML without loading `equipment-system.js` script tag
- **Minimal Fix:**
  ```javascript
  // In initializeEquipmentSystem(), add retry logic
  if (typeof EQUIPMENT_DATABASE === 'undefined') {
      console.warn('EQUIPMENT_DATABASE not loaded, retrying in 100ms...');
      setTimeout(initializeEquipmentSystem, 100);
      return;
  }
  ```

#### B2: Old Format Equipment Breaks EquipmentUI Rendering
- **Where:** `equipment-ui.js:351`, `equipment-ui.js:155`
- **Symptom:** Equipment screen shows empty slots even when items are equipped (old format)
- **Root Cause:** `PaperDollPanel.renderLayerDisplay()` expects `gameState.equipment[slot][layer]`, but old format uses `gameState.equipment[slot].item`
- **Reproduce:** Load save with old equipment format, open equipment screen
- **Minimal Fix:**
  ```javascript
  // In renderLayerDisplay(), add adapter
  const slotData = this.controller.gameState.equipment[slot] || {};
  // Adapter: handle old format
  if (slotData.item && !slotData[layer]) {
      const oldItem = slotData.item;
      const itemSpec = EQUIPMENT_DATABASE[oldItem.id];
      if (itemSpec) {
          const mappedLayer = itemSpec.layer || (slot === 'weapon' ? 'primary' : 'plate');
          slotData[mappedLayer] = { id: oldItem.id, condition: oldItem.condition || 100, fit: oldItem.fit || 'off-the-rack' };
      }
  }
  ```

#### B3: Missing Slot Initialization Causes TypeError
- **Where:** `equipment-ui.js:155`, `equipment-ui.js:181`
- **Symptom:** `Cannot read property 'plate' of undefined` when accessing `gameState.equipment.torso.plate`
- **Root Cause:** `gameState.equipment.torso` may be `{}` (empty object), but code accesses `[layer]` without checking
- **Reproduce:** Open equipment screen with empty equipment slots
- **Minimal Fix:**
  ```javascript
  // In equipItem() and unequipItem(), add null checks
  const current = (this.gameState.equipment[slot] || {})[layer];
  ```

### 🟠 HIGH

#### H1: Direct Equipment Mutations Break Save/Load
- **Where:** `man-at-arms.html:5345`, `5348`, `6593`, `7803`
- **Symptom:** Equipment quality changes don't persist or break after migration
- **Root Cause:** Code writes to `gameState.equipment.weapon.quality` which doesn't exist in new format
- **Reproduce:** Play game, gain equipment quality, save, reload → quality lost
- **Minimal Fix:** Use adapter function (see Section 2)

#### H2: Missing showSlotMenu() Causes Runtime Error
- **Where:** `equipment-ui.js:804`
- **Symptom:** Pressing Enter/Space on slot zone throws `TypeError: window.equipmentUI.showSlotMenu is not a function`
- **Root Cause:** Function referenced but not implemented
- **Reproduce:** Open equipment screen, focus slot zone, press Enter
- **Minimal Fix:**
  ```javascript
  // Add to EquipmentUI class
  showSlotMenu(slotId) {
      const slotData = this.gameState.equipment[slotId] || {};
      const layers = Object.keys(slotData).filter(l => slotData[l] && slotData[l].id);
      if (layers.length === 0) {
          alert('No items equipped in this slot');
          return;
      }
      // Show menu (simplified - would need proper UI)
      const choice = prompt(`Unequip item from layer: ${layers.join(', ')}`);
      // ... implement unequip logic
  }
  ```

#### H3: Slot Name Mismatch: accessory vs offhand
- **Where:** `equipment-ui.js:115-121`, `equipment-system.js:1665`
- **Symptom:** Shields can't be equipped via EquipmentManager (expects `accessory`), but UI expects `offhand`
- **Root Cause:** Inconsistent slot naming between systems
- **Reproduce:** Try to equip buckler via `equipmentManager.equipItem('buckler', 'accessory')` → works, but UI shows in `offhand` slot
- **Minimal Fix:**
  ```javascript
  // In EquipmentUIController.getSlotCompatibility(), normalize
  if (item.subSlot === 'shield') {
      targets.push({ slot: EQUIPMENT_SLOTS.OFFHAND, layer: 'item' });
      // Also support legacy accessory slot
      targets.push({ slot: 'accessory', layer: 'item' });
  }
  ```

#### H4: Inventory Item Removal Doesn't Check Stack Count
- **Where:** `equipment-ui.js:224-236`
- **Symptom:** Removing stackable items removes entire stack instead of one
- **Root Cause:** `removeFromInventory()` checks `stackCount` but `equipItem()` always removes item without checking
- **Reproduce:** Have 24 arrows in inventory, equip one → all 24 removed
- **Minimal Fix:**
  ```javascript
  // In equipItem(), line 174
  this.removeFromInventory(itemId, 1); // Pass count parameter
  ```

### 🟡 MEDIUM

#### M1: Prompt() Used for Multi-Option Equipment Menu
- **Where:** `equipment-ui.js:782`
- **Symptom:** Blocking prompt dialog for keyboard users, poor UX
- **Root Cause:** No proper menu UI implemented
- **Reproduce:** Equip item with multiple slot options via keyboard
- **Minimal Fix:** Create simple dropdown menu or use first compatible slot

#### M2: Missing DOM Element: equipment-aria-live
- **Where:** `equipment-ui.js:459`
- **Symptom:** `announceChange()` fails silently if element missing
- **Root Cause:** Element exists in HTML (line 979) but may not be present if HTML structure changes
- **Reproduce:** Remove `#equipment-aria-live` from HTML
- **Minimal Fix:**
  ```javascript
  announceChange(message) {
      const liveRegion = document.getElementById('equipment-aria-live');
      if (liveRegion) {
          liveRegion.textContent = message;
          setTimeout(() => liveRegion.textContent = '', 1000);
      } else {
          console.warn('equipment-aria-live element not found');
      }
  }
  ```

#### M3: Direct State Mutation in unequipItem()
- **Where:** `equipment-ui.js:193`
- **Symptom:** Unequipping bypasses EquipmentManager, may break kit calculations
- **Root Cause:** Direct `delete` instead of calling manager method
- **Reproduce:** Unequip item, check kit profile → may show stale data
- **Minimal Fix:** Add `EquipmentManager.unequipItem(slot, layer)` method

#### M4: Missing Slot Initialization in Default gameState
- **Where:** `man-at-arms.html:1061-1069`
- **Symptom:** `neck`, `shoulders`, `hands`, `feet`, `offhand`, `back` slots missing
- **Root Cause:** HTML default doesn't match EquipmentUI expectations
- **Reproduce:** New game, open equipment screen → some slots not initialized
- **Minimal Fix:**
  ```javascript
  equipment: {
      head: {}, neck: {}, torso: {}, shoulders: {},
      arms: {}, hands: {}, legs: {}, feet: {},
      weapon: {}, offhand: {}, back: {}, missile: {},
      accessory: {}, bag: []
  }
  ```

### 🟢 LOW

#### L1: Inline Event Handlers Reduce Maintainability
- **Where:** `equipment-ui.js:338`, `532`, `533`, `487`, `506`
- **Symptom:** Hard to test, violates separation of concerns
- **Root Cause:** Using `onclick="..."` and `onkeydown="..."` attributes
- **Minimal Fix:** Use `addEventListener()` in `attachEventListeners()`

#### L2: No Error Handling for EQUIPMENT_DATABASE Lookups
- **Where:** `equipment-ui.js:93`, `358`, `518`
- **Symptom:** Missing items cause silent failures or undefined errors
- **Root Cause:** No try/catch or null checks
- **Minimal Fix:** Add null checks and fallback values

#### L3: Condition Effects Not Integrated
- **Where:** `equipment-ui.js:80-83`
- **Symptom:** `getConditionEffects()` returns empty object, stats not affected by conditions
- **Root Cause:** Placeholder implementation
- **Minimal Fix:** Integrate with game's condition system (requires gameState.conditions structure)

---

## 5. Security + Robustness Notes

### XSS/HTML Injection Risks

1. **InnerHTML Usage** (Multiple locations)
   - **Risk:** `equipment-ui.js:285`, `479`, `606` - Uses `innerHTML` with item names
   - **Mitigation:** Item names come from `EQUIPMENT_DATABASE` (controlled source), but user-controlled `gameState.inventory` items could have malicious `id` values
   - **Fix:** Escape HTML in `renderItem()`:
     ```javascript
     const itemName = escapeHTML(item.name || invItem.id);
     ```

2. **Template Literals with User Data** (equipment-ui.js:388)
   - **Risk:** `aria-label="${item.name || equipped.id}"` - If `item.name` contains quotes, breaks HTML
   - **Fix:** Use `textContent` or escape attributes:
     ```javascript
     aria-label="${escapeHTML(item.name || equipped.id)}"
     ```

### Unsafe User Input

1. **Prompt() Usage** (equipment-ui.js:782)
   - **Risk:** User can input arbitrary text, but it's only used for menu selection (limited impact)
   - **Fix:** Replace with proper menu UI

2. **Alert() for Errors** (equipment-ui.js:766)
   - **Risk:** Blocking, but acceptable for errors
   - **Fix:** Use non-blocking notification system

### Performance Issues

1. **Re-render Frequency**
   - **Risk:** `refreshAll()` re-renders all panels on every equip/unequip (line 451, 756-759)
   - **Impact:** Low (panels are small), but could be optimized with incremental updates
   - **Fix:** Only re-render affected panels

2. **Repeated EQUIPMENT_DATABASE Lookups**
   - **Risk:** `getSlotCompatibility()` called multiple times per item (line 86, 133)
   - **Impact:** Low (database is small), but could cache results
   - **Fix:** Cache compatibility results per item ID

3. **Event Listener Attachment**
   - **Risk:** `attachEventListeners()` called on every render (line 298, 499)
   - **Impact:** Medium - may attach duplicate listeners if not cleaned up
   - **Fix:** Remove old listeners before attaching new ones, or use event delegation

---

## 6. Refactor Plan (Incremental, Minimal-Risk)

### "Fix Now" (1-2 hours) - Essential Blockers

1. **Add Slot Initialization Checks**
   - Fix B3: Add null checks in `equipItem()` and `unequipItem()`
   - File: `equipment-ui.js`
   - Lines: 155, 181

2. **Add Old Format Adapter in Render**
   - Fix B2: Detect old format in `renderLayerDisplay()` and adapt
   - File: `equipment-ui.js`
   - Lines: 351-356

3. **Implement Missing showSlotMenu()**
   - Fix H2: Add basic implementation
   - File: `equipment-ui.js`
   - Lines: 786-785 (add method)

4. **Fix Inventory Stack Removal**
   - Fix H4: Pass count parameter in `equipItem()`
   - File: `equipment-ui.js`
   - Line: 174

5. **Add Retry Logic for EQUIPMENT_DATABASE**
   - Fix B1: Retry initialization if database not loaded
   - File: `man-at-arms.html`
   - Lines: 17930-17947

### "Next" (1-2 days) - Schema Unification + Adapter Layer

1. **Create Adapter Functions**
   - Add `getEquippedItem()`, `getEquipmentQuality()` helpers
   - File: `man-at-arms.html`
   - Location: After `initializeEquipmentSystem()`

2. **Update All Direct Mutations**
   - Replace `gameState.equipment.weapon.quality` with adapter calls
   - Files: `man-at-arms.html`
   - Lines: 5345, 5348, 6593, 7803, 14070

3. **Enhance Migration in hydrateLoadedState()**
   - Fully migrate old format on load
   - File: `man-at-arms.html`
   - Lines: 17550-17568

4. **Add EquipmentManager.unequipItem()**
   - Centralize unequip logic
   - File: `equipment-system.js`
   - Location: After `equipItem()` method

5. **Fix Slot Name Mapping**
   - Normalize `accessory` → `offhand` in EquipmentManager
   - File: `equipment-system.js`
   - Lines: 1739-1771

6. **Add Missing Slots to Default gameState**
   - Add `neck`, `shoulders`, `hands`, `feet`, `offhand`, `back`
   - File: `man-at-arms.html`
   - Lines: 1061-1069, 17467-17476

### "Later" (1+ weeks) - Modularization + Architecture

1. **Extract Equipment Adapter Module**
   - Create `equipment-adapter.js` with all format conversion logic
   - Reduces coupling between HTML and equipment system

2. **Replace Inline Event Handlers**
   - Move all `onclick`, `onkeydown` to `addEventListener()`
   - Files: `equipment-ui.js`

3. **Add Event System**
   - Emit events on equip/unequip for other systems to listen
   - Enables decoupled inventory/combat updates

4. **Implement Proper Menu UI**
   - Replace `prompt()` with dropdown/modal menu
   - File: `equipment-ui.js`

5. **Add Unit Tests**
   - Test schema adapters, equip/unequip operations
   - Use lightweight test framework (e.g., QUnit)

6. **Reduce Global Dependencies**
   - Pass `EQUIPMENT_DATABASE` as parameter instead of global
   - Makes testing easier

---

## 7. Suggested Automated Tests

### Unit Tests (Lightweight - Can use QUnit or plain JS)

```javascript
// test-equipment-adapter.js
QUnit.test('getEquippedItem() handles old format', function(assert) {
    const oldFormat = { weapon: { item: { id: 'arming_sword' } } };
    const item = getEquippedItem.call({ gameState: { equipment: oldFormat } }, 'weapon');
    assert.equal(item.id, 'arming_sword');
});

QUnit.test('getEquippedItem() handles new format', function(assert) {
    const newFormat = { weapon: { primary: { id: 'arming_sword', condition: 95 } } };
    const item = getEquippedItem.call({ gameState: { equipment: newFormat } }, 'weapon', 'primary');
    assert.equal(item.id, 'arming_sword');
});

QUnit.test('EquipmentManager.equipItem() stores correct structure', function(assert) {
    const gameState = { equipment: {}, inventory: [], year: 1346, region: 'England', rank: 'retainer' };
    const manager = new EquipmentManager(gameState);
    const success = manager.equipItem('arming_sword', 'weapon', 'primary');
    assert.ok(success);
    assert.equal(gameState.equipment.weapon.primary.id, 'arming_sword');
    assert.equal(gameState.equipment.weapon.primary.condition, 100);
});
```

### Integration Test Steps (Manual Script)

```javascript
// test-equipment-integration.js
// Run in browser console after loading game

async function testEquipmentFlow() {
    console.log('=== Equipment Integration Test ===');
    
    // 1. Initialize
    console.log('1. Initializing equipment system...');
    initializeEquipmentSystem();
    assert(window.equipmentManager, 'EquipmentManager initialized');
    assert(window.equipmentUI, 'EquipmentUI initialized');
    
    // 2. Add item to inventory
    console.log('2. Adding item to inventory...');
    gameState.inventory.push({ id: 'arming_sword', condition: 100, fit: 'off-the-rack' });
    assert(gameState.inventory.length > 0, 'Item added to inventory');
    
    // 3. Open equipment screen
    console.log('3. Opening equipment screen...');
    openEquipmentScreen();
    const screen = document.getElementById('equipment-screen');
    assert(screen && !screen.classList.contains('hidden'), 'Equipment screen visible');
    
    // 4. Equip item (simulate drag/drop)
    console.log('4. Equipping item...');
    const result = window.equipmentUI.controller.equipItem('arming_sword', 'weapon', 'primary');
    assert(result.success, 'Item equipped successfully');
    assert(gameState.equipment.weapon.primary.id === 'arming_sword', 'Item in equipment slot');
    
    // 5. Verify inventory updated
    console.log('5. Verifying inventory...');
    const inInventory = gameState.inventory.find(i => i.id === 'arming_sword');
    assert(!inInventory, 'Item removed from inventory');
    
    // 6. Unequip item
    console.log('6. Unequipping item...');
    const unequipResult = window.equipmentUI.controller.unequipItem('weapon', 'primary');
    assert(unequipResult.success, 'Item unequipped successfully');
    assert(!gameState.equipment.weapon.primary, 'Item removed from equipment');
    
    // 7. Save/Load test
    console.log('7. Testing save/load...');
    saveGame();
    const saved = localStorage.getItem('manAtArmsSave');
    assert(saved, 'Save data stored');
    
    // Reset gameState
    Object.keys(gameState).forEach(k => delete gameState[k]);
    Object.assign(gameState, makeDefaultGameState());
    
    loadGame();
    assert(gameState.equipment.weapon.primary.id === 'arming_sword', 'Equipment loaded correctly');
    
    console.log('=== All tests passed ===');
}

function assert(condition, message) {
    if (!condition) {
        throw new Error('Assertion failed: ' + message);
    }
    console.log('✓ ' + message);
}

// Run: testEquipmentFlow();
```

### Test Checklist

- [ ] Equipment screen opens without errors
- [ ] Items can be equipped via drag/drop
- [ ] Items can be equipped via keyboard
- [ ] Equipped items appear in paper doll
- [ ] Unequipped items return to inventory
- [ ] Stackable items handle stack counts correctly
- [ ] Old format saves load and display correctly
- [ ] New format saves persist correctly
- [ ] Kit profile calculates correctly
- [ ] Stat modifiers apply correctly

---

## Summary

**Critical Issues:** 3 blockers (B1-B3) prevent equipment screen from working reliably  
**High Priority:** 4 issues (H1-H4) cause data loss or runtime errors  
**Medium Priority:** 4 issues (M1-M4) affect UX and maintainability  
**Low Priority:** 3 issues (L1-L3) are code quality improvements

**Recommended Immediate Actions:**
1. Fix slot initialization checks (B3)
2. Add old format adapter (B2)
3. Add retry logic for EQUIPMENT_DATABASE (B1)
4. Implement showSlotMenu() (H2)
5. Fix inventory stack removal (H4)

**Estimated Time to Stable:** 4-6 hours for blockers + high priority fixes

**Risk Level:** Medium - Equipment system is functional but fragile. Old format compatibility is critical for existing saves.
