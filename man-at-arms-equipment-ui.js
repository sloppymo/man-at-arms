/**
 * Paper-Doll Equipment UI System
 * 
 * Provides drag/drop inventory management with layered armor visualization
 * Integrates with EquipmentManager for all state changes
 */

// Slot and Layer Definitions
const EQUIPMENT_SLOTS = {
    HEAD: 'head',
    NECK: 'neck',
    TORSO: 'torso',
    SHOULDERS: 'shoulders',
    ARMS: 'arms',
    HANDS: 'hands',
    LEGS: 'legs',
    FEET: 'feet',
    MAINHAND: 'weapon',
    OFFHAND: 'offhand',
    BACK: 'back',
    AMMO: 'missile'
};

const ARMOR_LAYERS = {
    PADDING: 'padding',
    MAIL: 'mail',
    PLATE: 'plate',
    SURCOAT: 'surcoat',
    TEXTILE: 'textile'
};

// Slot to Layer Mapping
const SLOT_LAYER_MAP = {
    head: [ARMOR_LAYERS.TEXTILE, ARMOR_LAYERS.PADDING, ARMOR_LAYERS.MAIL, ARMOR_LAYERS.PLATE],
    neck: [ARMOR_LAYERS.MAIL, ARMOR_LAYERS.PLATE],
    torso: [ARMOR_LAYERS.TEXTILE, ARMOR_LAYERS.PADDING, ARMOR_LAYERS.MAIL, ARMOR_LAYERS.PLATE, ARMOR_LAYERS.SURCOAT],
    shoulders: [ARMOR_LAYERS.PADDING, ARMOR_LAYERS.MAIL, ARMOR_LAYERS.PLATE],
    arms: [ARMOR_LAYERS.TEXTILE, ARMOR_LAYERS.PADDING, ARMOR_LAYERS.MAIL, ARMOR_LAYERS.PLATE],
    hands: [ARMOR_LAYERS.TEXTILE, ARMOR_LAYERS.PADDING, ARMOR_LAYERS.PLATE],
    legs: [ARMOR_LAYERS.TEXTILE, ARMOR_LAYERS.PADDING, ARMOR_LAYERS.MAIL, ARMOR_LAYERS.PLATE],
    feet: [ARMOR_LAYERS.TEXTILE, ARMOR_LAYERS.PADDING, ARMOR_LAYERS.PLATE],
    weapon: ['primary', 'secondary'],
    offhand: ['item'],
    back: ['item'],
    missile: ['bow', 'ammo']
};

// Equipment UI Controller
class EquipmentUIController {
    constructor(gameState, equipmentManager) {
        this.gameState = gameState;
        this.equipmentManager = equipmentManager;
        this.draggedItem = null;
        this.dragSource = null;
        this.selectedSlot = null;
        this.selectedLayer = null;
    }
    
    // Get kit profile for display
    getKitProfile() {
        return this.equipmentManager.getKitProfile();
    }
    
    // Get effective stats
    getEffectiveStats() {
        const base = this.gameState.stats;
        const mods = this.equipmentManager.getStatModifiers();
        const conditionEffects = this.getConditionEffects();
        
        return {
            strength: base.strength + (conditionEffects.strength || 0),
            agility: base.agility + (mods.agility || 0) + (conditionEffects.agility || 0),
            endurance: base.endurance + (mods.endurance || 0) + (conditionEffects.endurance || 0),
            wits: base.wits + (conditionEffects.wits || 0),
            charisma: base.charisma + (conditionEffects.charisma || 0),
            stealth: (base.agility || 0) + (mods.stealth || 0)
        };
    }
    
    getConditionEffects() {
        // Simplified - would need to integrate with game's condition system
        return {};
    }
    
    // Get slot compatibility for an item
    getSlotCompatibility(itemId) {
        // Ensure EQUIPMENT_DATABASE is available
        if (typeof EQUIPMENT_DATABASE === 'undefined') {
            console.warn('EQUIPMENT_DATABASE not loaded');
            return [];
        }
        
        const item = EQUIPMENT_DATABASE[itemId];
        if (!item) return [];
        
        const targets = [];
        const slot = item.slot;
        const layer = item.layer;
        
        if (slot === 'weapon') {
            targets.push({ slot: EQUIPMENT_SLOTS.MAINHAND, layer: 'primary' });
            if (item.properties && item.properties.includes('two-handed')) {
                // Two-handed weapons might block offhand
            }
        } else if (slot === 'missile') {
            targets.push({ slot: EQUIPMENT_SLOTS.AMMO, layer: item.subSlot === 'bow' ? 'bow' : 'ammo' });
        } else if (slot === 'head') {
            targets.push({ slot: EQUIPMENT_SLOTS.HEAD, layer: layer || ARMOR_LAYERS.PLATE });
        } else if (slot === 'torso') {
            targets.push({ slot: EQUIPMENT_SLOTS.TORSO, layer: layer || ARMOR_LAYERS.PLATE });
        } else if (slot === 'arms') {
            targets.push({ slot: EQUIPMENT_SLOTS.ARMS, layer: layer || ARMOR_LAYERS.PLATE });
        } else if (slot === 'legs') {
            targets.push({ slot: EQUIPMENT_SLOTS.LEGS, layer: layer || ARMOR_LAYERS.PLATE });
        } else if (slot === 'accessory') {
            // Accessories can go in various slots based on subSlot
            if (item.subSlot === 'shield') {
                targets.push({ slot: EQUIPMENT_SLOTS.OFFHAND, layer: 'item' });
            } else if (item.subSlot === 'footwear') {
                targets.push({ slot: EQUIPMENT_SLOTS.FEET, layer: ARMOR_LAYERS.TEXTILE });
            }
        }
        
        return targets;
    }
    
    // Check if item can be dropped in target
    canDrop(itemId, targetSlot, targetLayer) {
        if (typeof EQUIPMENT_DATABASE === 'undefined') {
            return { valid: false, reason: 'Equipment database not loaded' };
        }
        
        const compat = this.getSlotCompatibility(itemId);
        const match = compat.find(t => t.slot === targetSlot && t.layer === targetLayer);
        if (!match) return { valid: false, reason: 'Item not compatible with this slot/layer' };
        
        // Check availability
        const item = EQUIPMENT_DATABASE[itemId];
        const region = this.gameState.region || 'England';
        if (!item.isAvailable(this.gameState.year || 1346, region, this.gameState.rank || 'retainer')) {
            return { valid: false, reason: 'Item not available in current region/year/rank' };
        }
        
        return { valid: true };
    }
    
    // Equip item
    equipItem(itemId, slot, layer) {
        const result = this.canDrop(itemId, slot, layer);
        if (!result.valid) {
            return { success: false, error: result.reason };
        }
        
        // Get current item in slot/layer for swap
        const current = this.gameState.equipment[slot]?.[layer];
        let swappedItem = null;
        
        if (current && current.id) {
            swappedItem = { id: current.id, condition: current.condition, fit: current.fit };
        }
        
        // Equip new item
        const success = this.equipmentManager.equipItem(itemId, slot, layer);
        if (!success) {
            return { success: false, error: 'Failed to equip item' };
        }
        
        // Return swapped item to inventory if any
        if (swappedItem) {
            this.addToInventory(swappedItem);
        }
        
        // Remove from inventory
        this.removeFromInventory(itemId);
        
        return { success: true, swapped: swappedItem };
    }
    
    // Unequip item
    unequipItem(slot, layer) {
        const equipped = this.gameState.equipment[slot]?.[layer];
        if (!equipped || !equipped.id) {
            return { success: false, error: 'No item equipped' };
        }
        
        const itemData = {
            id: equipped.id,
            condition: equipped.condition || 100,
            fit: equipped.fit || 'off-the-rack'
        };
        
        // Remove from equipment
        delete this.gameState.equipment[slot][layer];
        
        // Add to inventory
        this.addToInventory(itemData);
        
        return { success: true, item: itemData };
    }
    
    // Inventory management
    addToInventory(itemData) {
        if (!this.gameState.inventory) {
            this.gameState.inventory = [];
        }
        
        // Check if stackable
        const item = EQUIPMENT_DATABASE[itemData.id];
        if (item && item.properties && item.properties.includes('consumable')) {
            // Find existing stack
            const existing = this.gameState.inventory.find(i => i.id === itemData.id);
            if (existing) {
                existing.stackCount = (existing.stackCount || 1) + 1;
                return;
            }
        }
        
        this.gameState.inventory.push({
            ...itemData,
            stackCount: 1
        });
    }
    
    removeFromInventory(itemId, count = 1) {
        if (!this.gameState.inventory) return;
        
        const index = this.gameState.inventory.findIndex(i => i.id === itemId);
        if (index === -1) return;
        
        const item = this.gameState.inventory[index];
        if (item.stackCount && item.stackCount > count) {
            item.stackCount -= count;
        } else {
            this.gameState.inventory.splice(index, 1);
        }
    }
    
    // Get inventory items
    getInventoryItems() {
        if (typeof EQUIPMENT_DATABASE === 'undefined') {
            return [];
        }
        
        return (this.gameState.inventory || []).map(invItem => {
            const template = EQUIPMENT_DATABASE[invItem.id];
            return {
                ...invItem,
                name: template?.name || invItem.id,
                category: this.getItemCategory(invItem.id),
                slotHints: this.getSlotCompatibility(invItem.id),
                provenance: template?.provenance
            };
        });
    }
    
    getItemCategory(itemId) {
        if (typeof EQUIPMENT_DATABASE === 'undefined') return 'misc';
        
        const item = EQUIPMENT_DATABASE[itemId];
        if (!item) return 'misc';
        
        if (item.slot === 'weapon') return 'weapons';
        if (item.slot === 'missile') return 'archery';
        if (item.slot === 'head' || item.slot === 'torso' || item.slot === 'arms' || item.slot === 'legs') return 'armor';
        if (item.slot === 'accessory') {
            if (item.subSlot === 'shield') return 'shields';
            if (item.subSlot === 'tool') return 'tools';
            return 'accessories';
        }
        return 'misc';
    }
}

// Paper Doll Panel
class PaperDollPanel {
    constructor(controller, containerId) {
        this.controller = controller;
        this.container = document.getElementById(containerId);
        this.dragOverSlot = null;
    }
    
    render() {
        const kit = this.controller.getKitProfile();
        
        this.container.innerHTML = `
            <div class="paper-doll-container">
                <h3>Equipment</h3>
                <div class="paper-doll-figure" id="paper-doll-figure">
                    ${this.renderSilhouette()}
                    ${this.renderSlotZones()}
                </div>
                <div class="equipment-layers" id="equipment-layers">
                    ${this.renderLayerDisplay()}
                </div>
            </div>
        `;
        
        this.attachEventListeners();
    }
    
    renderSilhouette() {
        // SVG silhouette of a human figure
        return `
            <svg class="paper-doll-svg" viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg">
                <!-- Head -->
                <ellipse cx="100" cy="50" rx="25" ry="30" fill="rgba(212,175,55,0.1)" stroke="#d4af37" stroke-width="1"/>
                <!-- Torso -->
                <rect x="75" y="80" width="50" height="80" fill="rgba(212,175,55,0.1)" stroke="#d4af37" stroke-width="1"/>
                <!-- Arms -->
                <rect x="50" y="85" width="20" height="70" fill="rgba(212,175,55,0.1)" stroke="#d4af37" stroke-width="1"/>
                <rect x="130" y="85" width="20" height="70" fill="rgba(212,175,55,0.1)" stroke="#d4af37" stroke-width="1"/>
                <!-- Legs -->
                <rect x="80" y="160" width="25" height="100" fill="rgba(212,175,55,0.1)" stroke="#d4af37" stroke-width="1"/>
                <rect x="95" y="160" width="25" height="100" fill="rgba(212,175,55,0.1)" stroke="#d4af37" stroke-width="1"/>
            </svg>
        `;
    }
    
    renderSlotZones() {
        const slots = [
            { id: 'head', label: 'Head', x: 100, y: 50, width: 50, height: 60 },
            { id: 'neck', label: 'Neck', x: 100, y: 75, width: 30, height: 15 },
            { id: 'torso', label: 'Torso', x: 100, y: 120, width: 50, height: 80 },
            { id: 'shoulders', label: 'Shoulders', x: 100, y: 85, width: 80, height: 20 },
            { id: 'arms', label: 'Arms', x: 100, y: 120, width: 80, height: 70 },
            { id: 'hands', label: 'Hands', x: 100, y: 150, width: 40, height: 20 },
            { id: 'legs', label: 'Legs', x: 100, y: 210, width: 50, height: 100 },
            { id: 'feet', label: 'Feet', x: 100, y: 310, width: 40, height: 20 }
        ];
        
        return slots.map(slot => `
            <div class="slot-zone" 
                 data-slot="${slot.id}"
                 style="position: absolute; left: ${slot.x - slot.width/2}px; top: ${slot.y - slot.height/2}px; width: ${slot.width}px; height: ${slot.height}px;"
                 role="button"
                 tabindex="0"
                 aria-label="${slot.label} slot"
                 onkeydown="handleSlotKeydown(event, '${slot.id}')">
                <div class="slot-label">${slot.label}</div>
            </div>
        `).join('');
    }
    
    renderLayerDisplay() {
        const slots = ['head', 'neck', 'torso', 'shoulders', 'arms', 'hands', 'legs', 'feet', 'weapon', 'offhand', 'missile'];
        const layers = ['textile', 'padding', 'mail', 'plate', 'surcoat', 'primary', 'secondary', 'item', 'bow', 'ammo'];
        
        let html = '<div class="layer-display-grid">';
        
        for (const slot of slots) {
            const slotData = this.controller.gameState.equipment[slot] || {};
            html += `<div class="slot-layers" data-slot="${slot}">`;
            html += `<div class="slot-name">${slot.charAt(0).toUpperCase() + slot.slice(1)}</div>`;
            
            for (const layer of layers) {
                const equipped = slotData[layer];
                if (equipped && equipped.id) {
                    const item = EQUIPMENT_DATABASE[equipped.id];
                    html += this.renderEquippedItem(slot, layer, equipped, item);
                } else {
                    html += `<div class="layer-slot empty" data-slot="${slot}" data-layer="${layer}" 
                             role="button" tabindex="0" aria-label="Empty ${layer} layer on ${slot}"></div>`;
                }
            }
            
            html += '</div>';
        }
        
        html += '</div>';
        return html;
    }
    
    renderEquippedItem(slot, layer, equipped, item) {
        if (!item) return '';
        
        const condition = equipped.condition || 100;
        const fit = equipped.fit || 'off-the-rack';
        const conditionClass = condition > 75 ? 'good' : condition > 50 ? 'fair' : condition > 25 ? 'poor' : 'ruined';
        
        return `
            <div class="layer-slot equipped ${conditionClass}" 
                 data-slot="${slot}" 
                 data-layer="${layer}"
                 data-item-id="${equipped.id}"
                 role="button"
                 tabindex="0"
                 aria-label="${item.name || equipped.id} (${fit}, ${condition}% condition)"
                 title="${item.name || equipped.id} - ${fit} fit, ${condition}% condition">
                <div class="item-icon">${this.getItemIcon(item)}</div>
                <div class="item-name">${item.name || equipped.id}</div>
                <div class="condition-bar">
                    <div class="condition-fill" style="width: ${condition}%"></div>
                </div>
                <div class="fit-tag">${fit}</div>
            </div>
        `;
    }
    
    getItemIcon(item) {
        if (!item) return '📦';
        
        // Simple icon mapping
        if (item.slot === 'head') return '🪖';
        if (item.slot === 'torso') return '🛡️';
        if (item.slot === 'weapon') return '⚔️';
        if (item.slot === 'missile') return '🏹';
        return '📦';
    }
    
    attachEventListeners() {
        // Drag and drop handlers
        const slots = this.container.querySelectorAll('.slot-zone, .layer-slot');
        slots.forEach(slot => {
            slot.addEventListener('dragover', (e) => this.handleDragOver(e));
            slot.addEventListener('drop', (e) => this.handleDrop(e));
            slot.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        });
    }
    
    handleDragOver(e) {
        e.preventDefault();
        const slot = e.currentTarget.dataset.slot;
        const layer = e.currentTarget.dataset.layer;
        
        if (slot && layer) {
            e.currentTarget.classList.add('drag-over');
            this.dragOverSlot = { slot, layer };
        }
    }
    
    handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }
    
    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        const slot = e.currentTarget.dataset.slot;
        const layer = e.currentTarget.dataset.layer;
        const itemId = e.dataTransfer.getData('text/plain');
        
        if (slot && layer && itemId) {
            const result = this.controller.equipItem(itemId, slot, layer);
            if (result.success) {
                const itemName = (typeof EQUIPMENT_DATABASE !== 'undefined' && EQUIPMENT_DATABASE[itemId]) 
                    ? EQUIPMENT_DATABASE[itemId].name 
                    : itemId;
                this.announceChange(`Equipped ${itemName} to ${slot} (${layer} layer)`);
                this.render();
                if (window.equipmentUI) window.equipmentUI.refreshAll();
            } else {
                this.announceChange(`Cannot equip: ${result.error}`);
            }
        }
    }
    
    announceChange(message) {
        const liveRegion = document.getElementById('equipment-aria-live');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => liveRegion.textContent = '', 1000);
        }
    }
}

// Inventory Panel
class InventoryPanel {
    constructor(controller, containerId) {
        this.controller = controller;
        this.container = document.getElementById(containerId);
        this.filter = 'all';
        this.searchText = '';
    }
    
    render() {
        const items = this.getFilteredItems();
        
        this.container.innerHTML = `
            <div class="inventory-panel">
                <h3>Inventory</h3>
                <div class="inventory-controls">
                    <input type="text" 
                           id="inventory-search" 
                           placeholder="Search items..."
                           aria-label="Search inventory"
                           oninput="window.equipmentUI.inventoryPanel.handleSearch(event)">
                    <div class="inventory-filters">
                        ${this.renderFilters()}
                    </div>
                </div>
                <div class="inventory-list" role="list" aria-label="Inventory items">
                    ${items.length > 0 ? items.map(item => this.renderItem(item)).join('') : 
                      '<div class="inventory-empty"><p>No items in inventory</p><p style="font-size: 0.8em; margin-top: 10px;">Items will appear here when you acquire them during gameplay.</p></div>'}
                </div>
            </div>
        `;
        
        this.attachEventListeners();
    }
    
    renderFilters() {
        const categories = ['all', 'armor', 'weapons', 'archery', 'shields', 'tools', 'accessories', 'misc'];
        return categories.map(cat => `
            <button class="filter-button ${this.filter === cat ? 'active' : ''}"
                    onclick="window.equipmentUI.inventoryPanel.setFilter('${cat}')"
                    aria-pressed="${this.filter === cat}">
                ${cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
        `).join('');
    }
    
    renderItem(invItem) {
        if (typeof EQUIPMENT_DATABASE === 'undefined') {
            return `<div class="inventory-item">${invItem.id} (database not loaded)</div>`;
        }
        
        const item = EQUIPMENT_DATABASE[invItem.id];
        if (!item) return '';
        
        const stackCount = invItem.stackCount || 1;
        const condition = invItem.condition || 100;
        const itemName = item.name || invItem.id;
        
        return `
            <div class="inventory-item" 
                 draggable="true"
                 data-item-id="${invItem.id}"
                 role="listitem"
                 tabindex="0"
                 aria-label="${itemName}${stackCount > 1 ? ` (${stackCount})` : ''}"
                 onkeydown="handleInventoryKeydown(event, '${invItem.id}')"
                 ondragstart="handleInventoryDragStart(event, '${invItem.id}')"
                 ondragend="handleInventoryDragEnd(event)">
                <div class="item-icon">${this.getItemIcon(item)}</div>
                <div class="item-info">
                    <div class="item-name">${itemName}</div>
                    ${stackCount > 1 ? `<div class="item-stack">×${stackCount}</div>` : ''}
                    ${condition < 100 ? `<div class="item-condition">${condition}%</div>` : ''}
                </div>
                <button class="equip-button" 
                        onclick="window.equipmentUI.showEquipMenu('${invItem.id}')"
                        aria-label="Equip ${itemName}">
                    Equip
                </button>
            </div>
        `;
    }
    
    getItemIcon(item) {
        if (item.slot === 'head') return '🪖';
        if (item.slot === 'torso') return '🛡️';
        if (item.slot === 'weapon') return '⚔️';
        if (item.slot === 'missile') return '🏹';
        if (item.subSlot === 'shield') return '🛡️';
        return '📦';
    }
    
    getFilteredItems() {
        let items = this.controller.getInventoryItems();
        
        // Category filter
        if (this.filter !== 'all') {
            items = items.filter(item => item.category === this.filter);
        }
        
        // Search filter
        if (this.searchText) {
            const search = this.searchText.toLowerCase();
            items = items.filter(item => 
                item.name.toLowerCase().includes(search) ||
                (item.provenance && item.provenance.toLowerCase().includes(search))
            );
        }
        
        return items;
    }
    
    setFilter(category) {
        this.filter = category;
        this.render();
    }
    
    handleSearch(event) {
        this.searchText = event.target.value;
        this.render();
    }
    
    attachEventListeners() {
        // Additional listeners if needed
    }
}

// Kit Stats Panel
class KitStatsPanel {
    constructor(controller, containerId) {
        this.controller = controller;
        this.container = document.getElementById(containerId);
    }
    
    render() {
        const kit = this.controller.getKitProfile();
        const effectiveStats = this.controller.getEffectiveStats();
        const baseStats = this.controller.gameState.stats;
        
        this.container.innerHTML = `
            <div class="kit-stats-panel">
                <h3>Kit Profile</h3>
                
                <div class="effective-stats">
                    <h4>Effective Stats</h4>
                    ${this.renderStatsComparison(baseStats, effectiveStats)}
                </div>
                
                <div class="protection-matrix">
                    <h4>Protection by Region</h4>
                    ${this.renderProtectionMatrix(kit.protection)}
                </div>
                
                <div class="mobility-info">
                    <h4>Mobility & Environment</h4>
                    ${this.renderMobilityInfo(kit)}
                </div>
                
                <div class="gap-exposure">
                    <h4>Gap Exposure: ${kit.gapExposure}/10</h4>
                    ${kit.gapExposure > 5 ? '<div class="warning">High gap exposure - vulnerable to gap-targeting attacks!</div>' : ''}
                </div>
            </div>
        `;
    }
    
    renderStatsComparison(base, effective) {
        const stats = ['strength', 'agility', 'endurance', 'wits', 'charisma'];
        return stats.map(stat => {
            const baseVal = base[stat] || 0;
            const effVal = effective[stat] || baseVal;
            const diff = effVal - baseVal;
            return `
                <div class="stat-comparison">
                    <span class="stat-name">${stat}:</span>
                    <span class="stat-value">${baseVal}</span>
                    ${diff !== 0 ? `<span class="stat-mod ${diff > 0 ? 'positive' : 'negative'}">${diff > 0 ? '+' : ''}${diff}</span>` : ''}
                    <span class="stat-effective">→ ${effVal}</span>
                </div>
            `;
        }).join('');
    }
    
    renderProtectionMatrix(protection) {
        const regions = ['chest', 'skull', 'face', 'throat', 'forearm', 'thigh', 'shin'];
        const damageTypes = ['cut', 'thrust', 'blunt', 'missile'];
        
        let html = '<table class="protection-table"><thead><tr><th>Region</th>';
        damageTypes.forEach(type => {
            html += `<th>${type}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        regions.forEach(region => {
            if (protection[region]) {
                html += `<tr><td>${region}</td>`;
                damageTypes.forEach(type => {
                    const prot = protection[region][type] || 0;
                    html += `<td>${prot}</td>`;
                });
                html += '</tr>';
            }
        });
        
        html += '</tbody></table>';
        return html;
    }
    
    renderMobilityInfo(kit) {
        return `
            <div class="mobility-details">
                <div>Agility Penalty: ${kit.mobility.agilityPenalty}</div>
                <div>Fatigue per Round: ${kit.fatiguePerRound}</div>
                <div>Sprint Penalty: ${kit.mobility.sprintPenalty}</div>
                <div>Heat Penalty: ${kit.heatPenalty}</div>
                <div>Recovery Penalty: ${kit.recoveryPenalty}</div>
                <div>Stealth Penalty: ${kit.stealthPenalty}</div>
            </div>
        `;
    }
}

// Main Equipment UI Manager
class EquipmentUI {
    constructor(gameState, equipmentManager) {
        this.gameState = gameState;
        this.equipmentManager = equipmentManager;
        this.controller = new EquipmentUIController(gameState, equipmentManager);
        this.paperDoll = null;
        this.inventoryPanel = null;
        this.statsPanel = null;
        this.isOpen = false;
    }
    
    // Open equipment screen
    open() {
        console.log('EquipmentUI.open() called');
        this.isOpen = true;
        
        // Ensure equipment screen exists
        const screen = document.getElementById('equipment-screen');
        if (!screen) {
            console.error('Equipment screen element not found in DOM');
            alert('Equipment screen HTML element not found. Please refresh the page.');
            return;
        }
        
        console.log('Rendering equipment UI...');
        console.log('Inventory items:', this.controller.getInventoryItems());
        
        // Always re-initialize panels to ensure fresh state
        this.paperDoll = new PaperDollPanel(this.controller, 'paper-doll-container');
        this.inventoryPanel = new InventoryPanel(this.controller, 'inventory-container');
        this.statsPanel = new KitStatsPanel(this.controller, 'kit-stats-container');
        
        this.render();
        screen.style.display = 'block';
        screen.classList.remove('hidden');
        console.log('Equipment screen displayed');
    }
    
    // Close equipment screen
    close() {
        this.isOpen = false;
        const screen = document.getElementById('equipment-screen');
        if (screen) {
            screen.style.display = 'none';
            screen.classList.add('hidden');
        }
    }
    
    // Render full UI
    render() {
        if (!this.paperDoll) {
            this.paperDoll = new PaperDollPanel(this.controller, 'paper-doll-container');
        }
        if (!this.inventoryPanel) {
            this.inventoryPanel = new InventoryPanel(this.controller, 'inventory-container');
        }
        if (!this.statsPanel) {
            this.statsPanel = new KitStatsPanel(this.controller, 'kit-stats-container');
        }
        
        this.paperDoll.render();
        this.inventoryPanel.render();
        this.statsPanel.render();
    }
    
    // Refresh all panels
    refreshAll() {
        if (this.paperDoll) this.paperDoll.render();
        if (this.inventoryPanel) this.inventoryPanel.render();
        if (this.statsPanel) this.statsPanel.render();
    }
    
    // Show equip menu for keyboard users
    showEquipMenu(itemId) {
        const compat = this.controller.getSlotCompatibility(itemId);
        if (compat.length === 0) {
            alert('This item cannot be equipped');
            return;
        }
        
        if (compat.length === 1) {
            // Auto-equip if only one option
            const target = compat[0];
            const result = this.controller.equipItem(itemId, target.slot, target.layer);
            if (result.success) {
                this.refreshAll();
            } else {
                alert(result.error);
            }
        } else {
            // Show menu for multiple options
            const options = compat.map(t => `${t.slot} (${t.layer})`).join('\n');
            const choice = prompt(`Choose slot/layer:\n${options}`);
            // Simplified - would need proper menu UI
        }
    }
}

// Global handlers for drag/drop
function handleInventoryDragStart(event, itemId) {
    event.dataTransfer.setData('text/plain', itemId);
    event.dataTransfer.effectAllowed = 'move';
    event.currentTarget.classList.add('dragging');
}

function handleInventoryDragEnd(event) {
    event.currentTarget.classList.remove('dragging');
}

function handleSlotKeydown(event, slotId) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        // Open context menu for slot
        if (window.equipmentUI) {
            window.equipmentUI.showSlotMenu(slotId);
        }
    }
}

function handleInventoryKeydown(event, itemId) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (window.equipmentUI) {
            window.equipmentUI.showEquipMenu(itemId);
        }
    }
}

// Export for use in main game
if (typeof window !== 'undefined') {
    window.EquipmentUI = EquipmentUI;
    window.EQUIPMENT_SLOTS = EQUIPMENT_SLOTS;
    window.ARMOR_LAYERS = ARMOR_LAYERS;
}
