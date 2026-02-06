(function() {
    'use strict';

    // Stubs for dependencies
    function escapeHTML(text) {
        if (typeof text !== 'string') return text;
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    function getEffectiveStat(stat) { return window.gameState.stats[stat] || 0; }
    function getEquipmentName(slot) { 
        if (typeof window.getEquipmentName === 'function') return window.getEquipmentName(slot);
        return null;
    }
    function getEquipmentQuality(slot) { 
        if (typeof window.getEquipmentQuality === 'function') return window.getEquipmentQuality(slot);
        return 0;
    }
    function getEquippedItem(slot, type) { 
        if (typeof window.getEquippedItem === 'function') return window.getEquippedItem(slot, type);
        return null;
    }
    function formatCurrency(pence) {
        if (typeof window.formatCurrency === 'function') return window.formatCurrency(pence);
        return pence + 'd';
    }

    function showNotification(title, message, type = 'info') {
        const notification = document.getElementById('notification');
        if (!notification) {
            console.warn('Notification element not found');
            return;
        }
        
        // Type-based styling
        const typeColors = {
            success: { bg: '#4CAF50', border: '#2e7d32', icon: '✓' },
            error: { bg: '#f44336', border: '#c62828', icon: '✗' },
            info: { bg: '#2196F3', border: '#1565C0', icon: 'ℹ' },
            warning: { bg: '#FF9800', border: '#E65100', icon: '⚠' }
        };
        
        const colors = typeColors[type] || typeColors.info;
        
        // Sanitize title and message to prevent XSS
        const safeTitle = escapeHTML(String(title));
        const safeMessage = escapeHTML(String(message));
        notification.innerHTML = `<h3 style="color: white; margin: 0 0 5px 0; display: flex; align-items: center; gap: 8px;"><span style="font-size: 1.2em;">${colors.icon}</span> ${safeTitle}</h3><p style="color: #e0e0e0; margin: 0;">${safeMessage}</p>`;
        notification.style.backgroundColor = colors.bg;
        notification.style.borderColor = colors.border;
        notification.classList.remove('hidden');
        
        // Make it more prominent
        notification.style.display = 'block';
        notification.style.opacity = '1';
        notification.style.zIndex = '10000';
        
        // Auto-hide after 3 seconds with fade
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                notification.classList.add('hidden');
                notification.style.display = 'none';
                notification.style.opacity = '1';
                notification.style.transform = 'translateX(0)';
            }, 300);
        }, 3000);
    }

    function showStats() {
        try {
            const statLabels = {
                strength: '⚔️ Strength',
                agility: '🏃 Agility',
                endurance: '❤️ Endurance',
                charisma: '💬 Charisma',
                wits: '🧠 Wits',
                luck: '🍀 Luck',
                wealth: '💰 Wealth',
                reputation: '⭐ Reputation',
                morale: '💪 Morale',
                stress: '😰 Stress',
                experience: '📜 Experience',
                patronFavor: '👑 Patron Favor'
            };
            
            const stats = Object.entries(window.gameState.stats)
                .map(([key, value]) => {
                    const effective = getEffectiveStat(key);
                    const label = statLabels[key] || key;
                    return effective !== value 
                        ? `${label}: ${value} (Effective: ${effective})`
                        : `${label}: ${value}`;
                })
                .join('\n');
            
            const conditions = window.gameState.conditions.length > 0 
                ? window.gameState.conditions.map(c => `• ${c.name}${c.duration ? ` (${c.duration} turns remaining)` : ''}`).join('\n')
                : 'None';
            
            const career = `Battles: ${window.gameState.career.battles}\nWounds: ${window.gameState.career.wounds}\nPromotions: ${window.gameState.career.promotions}`;
            
            // Handle equipment display for both old and new format using adapters
            let equipment = 'None equipped';
            try {
                const weaponName = getEquipmentName('weapon');
                const weaponQuality = getEquipmentQuality('weapon');
                const armorName = getEquipmentName('armor') || getEquipmentName('torso');
                const armorQuality = getEquipmentQuality('armor') || getEquipmentQuality('torso');
                
                if (weaponName || armorName) {
                    const parts = [];
                    if (weaponName) {
                        parts.push(`Weapon: ${weaponName} (+${weaponQuality})`);
                    }
                    if (armorName) {
                        parts.push(`Armor: ${armorName} (+${armorQuality})`);
                    }
                    equipment = parts.length > 0 ? parts.join('\n') : 'None equipped';
                } else {
                    // Try new format direct access as fallback
                    const equipped = [];
                    const weaponItem = getEquippedItem('weapon', 'primary');
                    const torsoItem = getEquippedItem('torso', 'plate');
                    const headItem = getEquippedItem('head', 'plate');
                    
                    if (weaponItem && weaponItem.id) equipped.push(`Weapon: ${weaponItem.id}`);
                    if (torsoItem && torsoItem.id) equipped.push(`Torso: ${torsoItem.id}`);
                    if (headItem && headItem.id) equipped.push(`Head: ${headItem.id}`);
                    equipment = equipped.length > 0 ? equipped.join('\n') : 'None equipped';
                }
            } catch (e) {
                console.error("Error formatting equipment:", e);
                equipment = 'Error loading equipment';
            }
            
            const inventoryCount = window.gameState.inventory ? window.gameState.inventory.length : 0;
            
            // Create modal instead of alert
            const modal = document.createElement('div');
            modal.className = 'stats-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            modal.innerHTML = `
                <div style="
                    background: #1a0f08;
                    border: 3px solid #d4af37;
                    border-radius: 10px;
                    padding: 30px;
                    max-width: 600px;
                    max-height: 80vh;
                    overflow-y: auto;
                    color: #d4af37;
                    font-family: 'Crimson Text', serif;
                ">
                    <h2 style="color: #f4d03f; margin-bottom: 20px; text-align: center;">📊 Full Character Stats</h2>
                    <div style="line-height: 1.8; font-size: 1.1em;">
                        <h3 style="color: #f4d03f; margin-top: 15px;">Stats:</h3>
                        <pre style="color: #d4af37; white-space: pre-wrap; font-family: inherit; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;">${stats}</pre>
                        
                        <h3 style="color: #f4d03f; margin-top: 15px;">Character Info:</h3>
                        <p>Name: ${escapeHTML(window.gameState.characterName || 'Unnamed')}</p>
                        <p>Age: ${window.gameState.age}</p>
                        <p>Year: ${window.gameState.year}</p>
                        <p>Location: ${window.gameState.location}</p>
                        <p>Region: ${window.gameState.region || 'Unknown'}</p>
                        <p>Rank: ${window.gameState.rank || 'Common Soldier'}</p>
                        <p>Background: ${window.gameState.background ? window.gameState.background.charAt(0).toUpperCase() + window.gameState.background.slice(1) : 'None'}</p>
                        
                        <h3 style="color: #f4d03f; margin-top: 15px;">Equipment:</h3>
                        <pre style="color: #d4af37; white-space: pre-wrap; font-family: inherit; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;">${equipment}</pre>
                        <p>Inventory Items: ${inventoryCount}</p>
                        
                        <h3 style="color: #f4d03f; margin-top: 15px;">Conditions:</h3>
                        <pre style="color: #d4af37; white-space: pre-wrap; font-family: inherit; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;">${conditions}</pre>
                        
                        <h3 style="color: #f4d03f; margin-top: 15px;">Career:</h3>
                        <pre style="color: #d4af37; white-space: pre-wrap; font-family: inherit; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;">${career}</pre>
                    </div>
                    <button onclick="this.closest('.stats-modal').remove()" 
                            style="
                                margin-top: 20px;
                                padding: 10px 20px;
                                background: #8b0000;
                                border: 2px solid #d4af37;
                                color: #d4af37;
                                border-radius: 5px;
                                cursor: pointer;
                                font-size: 16px;
                                font-family: inherit;
                                width: 100%;
                            ">
                        Close
                    </button>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Close on background click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });
            
            // Close on Escape key
            const closeHandler = (e) => {
                if (e.key === 'Escape') {
                    modal.remove();
                    document.removeEventListener('keydown', closeHandler);
                }
            };
            document.addEventListener('keydown', closeHandler);
            
        } catch (error) {
            console.error("Error in showStats:", error);
            showNotification('Error', `Error displaying stats: ${error.message}`);
        }
    }

    // Expose globally
    window.showNotification = showNotification;
    window.showStats = showStats;
})();
