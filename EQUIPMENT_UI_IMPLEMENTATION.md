# Equipment UI Implementation Summary

## Overview

A complete paper-doll inventory management system has been implemented for the Man-at-Arms game. The UI provides drag/drop equipment management with layered armor visualization, integrated with the EquipmentManager system.

## Architecture

### Files Created

1. **`man-at-arms-equipment-ui.js`** - Complete UI system
   - `EquipmentUIController` - Handles all equipment operations
   - `PaperDollPanel` - Visual character silhouette with slot zones
   - `InventoryPanel` - Item list with filtering and search
   - `KitStatsPanel` - Protection matrix and stat modifiers
   - `EquipmentUI` - Main manager class

2. **HTML Integration** - Added to `man-at-arms.html`:
   - Equipment screen modal overlay
   - CSS styling for all components
   - Button to open equipment screen
   - Script includes for equipment system

## Key Features

### 1. Paper Doll Panel
- SVG silhouette of human figure
- Clickable/drop zones for body slots (head, neck, torso, arms, legs, etc.)
- Visual layer display showing padding/mail/plate stacks
- Condition indicators (good/fair/poor/ruined)
- Fit tags (tailored/off-the-rack/salvage)

### 2. Inventory Panel
- Filterable by category (armor, weapons, archery, shields, tools, accessories, misc)
- Search functionality
- Stack support for consumables
- Drag/drop ready items
- Keyboard accessible

### 3. Kit Stats Panel
- Effective stats comparison (base vs modified)
- Protection matrix by region and damage type
- Mobility penalties (agility, fatigue, sprint)
- Environmental modifiers (heat, recovery, stealth)
- Gap exposure indicator

### 4. Drag & Drop
- Native HTML5 drag/drop API
- Visual feedback (highlight valid drop targets)
- Automatic swap when dropping on occupied slot
- Keyboard fallback (Enter/Space to pick up, then drop)

### 5. Accessibility
- ARIA labels and roles
- Keyboard navigation (Tab, Enter, Space)
- Screen reader announcements (aria-live region)
- Focus indicators
- Semantic HTML

## Data Flow

```
User Action (drag/click)
  ↓
EquipmentUIController
  ↓
EquipmentManager.equipItem() / unequipItem()
  ↓
gameState.equipment updated (primitives only)
  ↓
getKitProfile() recalculated
  ↓
All panels refresh
```

## Slot & Layer System

### Slots
- `head`, `neck`, `torso`, `shoulders`, `arms`, `hands`, `legs`, `feet`
- `weapon` (mainhand), `offhand`, `back`, `missile`

### Layers (for armor slots)
- `textile` - Base clothing
- `padding` - Gambeson, aketon, padded jack
- `mail` - Mail armor
- `plate` - Plate armor
- `surcoat` - Livery layer

### Layer Rules
- Multiple layers can stack (e.g., padding + mail + plate on torso)
- Protection sums across all layers
- Each layer has independent condition and fit

## Usage

### Opening Equipment Screen
Click the "🛡️ Equipment" button in the game controls, or call:
```javascript
openEquipmentScreen();
```

### Equipping Items
1. **Drag & Drop**: Drag item from inventory to paper doll slot
2. **Keyboard**: Tab to item, Enter to pick up, Tab to slot, Enter to drop
3. **Button**: Click "Equip" button, then select slot/layer from menu

### Unequipping Items
- Click equipped item in paper doll
- Context menu appears (or keyboard: Enter on equipped item)
- Select "Unequip"

## Integration Points

### Equipment Manager Methods Used
- `equipItem(itemId, slot, layer)` - Equip an item
- `getKitProfile()` - Get protection/mobility/environment data
- `getStatModifiers()` - Get stat changes from equipment
- `getProtectionForRegion(region, damageType)` - Calculate protection
- `getGapExposure()` - Calculate gap vulnerability

### Game State Structure
```javascript
gameState.equipment = {
    head: { padding: {id, condition, fit}, plate: {...} },
    torso: { padding: {...}, mail: {...}, plate: {...} },
    // ... etc
};
```

## Persistence

- Equipment state is stored in `gameState.equipment` as primitives only
- Save/load system automatically handles equipment
- Old format automatically migrates to layered format
- No ItemSpec objects in saved state

## Known Limitations & Future Enhancements

1. **Context Menu**: Currently simplified - full context menu (unequip, repair, inspect) needs implementation
2. **Visor Toggle**: Helmets with visors need toggle functionality
3. **Item Comparison**: Hover tooltips showing item stats
4. **Bulk Operations**: Equip/unequip sets
5. **Repair UI**: Visual repair interface
6. **Item Tooltips**: Provenance notes and historical details

## Testing Checklist

- [x] Equipment persists through save/load
- [x] Drag/drop works
- [x] Keyboard navigation works
- [x] Layered armor stacks correctly
- [x] Protection calculations update
- [x] Condition affects protection
- [x] Region gating works
- [x] No ItemSpec objects in gameState

## Adding New Items

To add a new equipment item:

1. Add to `EQUIPMENT_DATABASE` in `man-at-arms-equipment-system.js`
2. Set `slot`, `layer`, `coverage`, `protection`, etc.
3. Item automatically appears in inventory when added
4. UI automatically supports it if slot/layer mapping is correct

## Slot/Layer Mapping

The `getSlotCompatibility()` function maps items to slots. To add new mappings:

```javascript
// In EquipmentUIController.getSlotCompatibility()
if (slot === 'newslot') {
    targets.push({ slot: EQUIPMENT_SLOTS.NEWSLOT, layer: layer || 'default' });
}
```

## CSS Customization

All UI elements use CSS classes prefixed with:
- `.equipment-screen` - Main container
- `.paper-doll-` - Paper doll components
- `.inventory-` - Inventory panel
- `.kit-stats-` - Stats panel
- `.layer-slot` - Individual equipment slots

Modify styles in the `<style>` section of `man-at-arms.html`.
