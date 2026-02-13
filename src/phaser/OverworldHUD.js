import Phaser from 'phaser';

/**
 * Overworld HUD — Chevauchée Status Display
 * Tracks time, heat, and supplies during map exploration
 * Updates via dispatcher events for clean separation
 */
export class OverworldHUD extends Phaser.Scene {
    constructor() {
        super({ key: 'OverworldHUD', active: false });
        this.dispatch = null;
        this.getGameState = null;
        
        // UI elements
        this.container = null;
        this.timeText = null;
        this.heatBar = null;
        this.heatValue = null;
        this.heatAlertTween = null;
        this.suppliesContainer = null;
        this.supplyIcons = {};
        this._unsubscribeHandles = [];
        this._emojiSupported = null; // Cache emoji check
        
        // Layout config
        this.padding = 12;
        this.barWidth = 120;
        this.barHeight = 8;
        this.iconSize = 16;
    }

    /**
     * Initialize with dispatcher and game state access
     */
    init({ dispatch, getGameState }) {
        this.dispatch = dispatch;
        this.getGameState = getGameState;
    }

    /**
     * Preload HUD assets (retro pixel font, icons)
     */
    preload() {
        // Font already loaded via CSS; Phaser uses canvas text
        // Could add icon sprites here if needed
    }

    /**
     * Create HUD UI elements
     */
    create() {
        const width = this.scale.width;
        
        // Main container (top-right corner)
        this.container = this.add.container(width - this.padding - 200, this.padding);
        this.container.setScrollFactor(0); // Fixed to camera
        this.container.setDepth(1000); // Above everything
        
        // Background panel (semi-transparent parchment)
        const bg = this.add.rectangle(0, 0, 200, 90, 0x2a1f15, 0.85)
            .setOrigin(0, 0)
            .setStrokeStyle(2, 0x8b7355, 1);
        this.container.add(bg);
        
        // --- Time Display ---
        const timeIcon = this.emojiSupported() ? this.getTimeIcon('Dawn') : 'T:';
        const timeFallback = this.emojiSupported() ? ' Dawn (06:30)' : ' 06:30';
        this.timeText = this.add.text(10, 8, timeIcon + timeFallback, {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#e8dcc8'
        });
        this.container.add(this.timeText);
        
        // --- Heat Gauge ---
        const heatLabel = this.add.text(10, 30, 'HEAT', {
            fontFamily: 'Georgia, serif',
            fontSize: '10px',
            color: '#c4b99a'
        });
        this.container.add(heatLabel);
        
        // Heat bar background
        const heatBg = this.add.rectangle(50, 36, this.barWidth, this.barHeight, 0x3a2f25)
            .setOrigin(0, 0.5);
        this.container.add(heatBg);
        
        // Heat bar fill (starts empty)
        this.heatBar = this.add.rectangle(50, 36, 0, this.barHeight, 0xff4400)
            .setOrigin(0, 0.5);
        this.container.add(this.heatBar);
        
        // Heat percentage label
        this.heatValue = this.add.text(175, 30, '0%', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#888'
        });
        this.container.add(this.heatValue);
        
        // --- Supplies Row ---
        this.suppliesContainer = this.add.container(10, 52);
        this.container.add(this.suppliesContainer);
        
        // Supply slots (will be populated dynamically)
        this.refreshSupplies();
        
        // --- Event Listeners ---
        this.setupEventListeners();
        
        // --- Phaser Lifecycle Events ---
        this.setupLifecycleEvents();
        
        // Initial update
        this.updateDisplay();
    }

    /**
     * Setup Phaser lifecycle event handlers for proper cleanup
     */
    setupLifecycleEvents() {
        // Handle scene shutdown (pause/stop/switch away)
        this.events.on('shutdown', this.onShutdown, this);
        
        // Handle scene destroy (complete removal)
        this.events.on('destroy', this.onDestroy, this);
        
        // Handle window resize
        this.scale.on('resize', this.resize, this);
    }
    
    /**
     * Cleanup on scene shutdown
     */
    onShutdown() {
        this.stopHeatAlert();
        
        // Unsubscribe from dispatcher
        if (this.dispatch && this._unsubscribeHandles) {
            this._unsubscribeHandles.forEach(unsub => unsub());
            this._unsubscribeHandles = [];
        }
        
        // Stop resize listener
        this.scale.off('resize', this.resize, this);
    }
    
    /**
     * Final cleanup on scene destroy
     */
    onDestroy() {
        // Container already destroyed by Phaser, but ensure tweens stop
        this.stopHeatAlert();
        
        // Null out references
        this.container = null;
        this.timeText = null;
        this.heatBar = null;
        this.heatValue = null;
        this.suppliesContainer = null;
        this.supplyIcons = {};
        this._unsubscribeHandles = [];
    }

    /**
     * Check if emoji rendering is supported (improved detection)
     */
    emojiSupported() {
        if (this._emojiSupported !== null) return this._emojiSupported;

        try {
            // Method 1: Check if emoji renders as single character (more reliable than canvas)
            const emoji = '🌅';
            const text = 'test';

            // Create temporary elements to measure
            const div = document.createElement('div');
            div.style.fontSize = '16px';
            div.style.position = 'absolute';
            div.style.left = '-9999px';
            div.style.visibility = 'hidden';

            const emojiSpan = document.createElement('span');
            emojiSpan.textContent = emoji;
            emojiSpan.style.fontFamily = 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif';

            const textSpan = document.createElement('span');
            textSpan.textContent = text;
            textSpan.style.fontFamily = 'Georgia, serif';

            div.appendChild(emojiSpan);
            div.appendChild(textSpan);
            document.body.appendChild(div);

            // Check if emoji renders (width should be reasonable for a single emoji)
            const emojiWidth = emojiSpan.offsetWidth;
            const textWidth = textSpan.offsetWidth;

            document.body.removeChild(div);

            // Emoji should be roughly square-ish and not too wide compared to text
            const isEmoji = emojiWidth > 8 && emojiWidth < 24 && emojiWidth < textWidth * 2;

            this._emojiSupported = isEmoji;
            return isEmoji;

        } catch (error) {
            console.warn('Emoji detection failed, falling back to false:', error);
            this._emojiSupported = false;
            return false;
        }
    }

    /**
     * Subscribe to dispatcher events with tracking for cleanup
     */
    setupEventListeners() {
        if (!this.dispatch || !this.dispatch.subscribe) return;
        
        // Clear any existing handles
        this._unsubscribeHandles = [];
        
        const subs = [
            { event: 'OVERWORLD_STATE_CHANGED', handler: () => this.updateDisplay() },
            { event: 'OV_TIME_PASSED', handler: () => this.updateDisplay() },
            { event: 'SUPPLY_CONSUMED', handler: () => this.refreshSupplies() },
            { event: 'RESOURCE_UPDATE', handler: () => this.refreshSupplies() }
        ];
        
        subs.forEach(({ event, handler }) => {
            const handle = this.dispatch.subscribe(event, handler);
            if (handle) this._unsubscribeHandles.push(handle);
        });
    }

    /**
     * Refresh all display values from gameState
     */
    updateDisplay() {
        const state = this.getGameState();
        if (!state?.overworld) return;
        
        const ow = state.overworld;
        
        // Update time display
        const timeStr = this.formatTime(ow.time);
        const period = this.getPeriod(ow.time);
        const icon = this.emojiSupported() ? this.getTimeIcon(period) : this.getTimeCode(period);
        this.timeText.setText(`${icon} ${period} (${timeStr})`);
        this.timeText.setColor(this.getTimeColor(period));
        
        // Update heat bar
        const heat = Math.min(100, Math.max(0, ow.heat || 0));
        const heatWidth = (heat / 100) * this.barWidth;
        this.heatBar.setSize(heatWidth, this.barHeight);
        this.heatBar.setFillStyle(this.getHeatColor(heat));
        this.heatValue.setText(`${heat}%`);
        
        // Flash on high heat
        if (heat >= 75 && !this.heatAlertTween) {
            this.startHeatAlert();
        } else if (heat < 75 && this.heatAlertTween) {
            this.stopHeatAlert();
        }
    }

    /**
     * Refresh supply icons
     */
    refreshSupplies() {
        const state = this.getGameState();
        const supplies = state?.overworld?.supplies || {};
        
        // Clear old supply icons
        this.suppliesContainer.removeAll(true);
        this.supplyIcons = {};
        
        const useEmoji = this.emojiSupported();
        const supplyTypes = [
            { key: 'food', icon: useEmoji ? '🍖' : 'F:', label: 'Food' },
            { key: 'arrows', icon: useEmoji ? '🏹' : 'A:', label: 'Ammo' },
            { key: 'coin', icon: useEmoji ? '💰' : 'C:', label: 'Coin' }
        ];
        
        let x = 0;
        supplyTypes.forEach((type) => {
            const amount = supplies[type.key] || 0;
            
            // Icon
            const icon = this.add.text(x, 0, type.icon, {
                fontSize: '14px'
            });
            
            // Amount (red if low on food)
            const isLow = type.key === 'food' && amount < 3;
            const value = this.add.text(x + 18, 1, `${amount}`, {
                fontFamily: 'monospace',
                fontSize: '12px',
                color: isLow ? '#ff6666' : '#c4b99a'
            });
            
            this.suppliesContainer.add([icon, value]);
            this.supplyIcons[type.key] = value;
            
            x += 55;
        });
    }

    /**
     * Format minutes as HH:MM
     */
    formatTime(minutes) {
        const h = Math.floor(minutes / 60) % 24;
        const m = Math.floor(minutes % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    /**
     * Get time period name
     */
    getPeriod(minutes) {
        const h = Math.floor(minutes / 60) % 24;
        if (h < 5) return 'Night';
        if (h < 8) return 'Dawn';
        if (h < 17) return 'Day';
        if (h < 20) return 'Dusk';
        return 'Night';
    }

    /**
     * Get icon for time period (emoji)
     */
    getTimeIcon(period) {
        const icons = {
            'Dawn': '🌅',
            'Day': '☀️',
            'Dusk': '🌆',
            'Night': '🌙'
        };
        return icons[period] || '⏳';
    }

    /**
     * Get text code for time period (no emoji fallback)
     */
    getTimeCode(period) {
        const codes = {
            'Dawn': 'D:',
            'Day': 'N:',
            'Dusk': 'K:',
            'Night': '*:'
        };
        return codes[period] || 'T:';
    }

    /**
     * Get color for time text
     */
    getTimeColor(period) {
        const colors = {
            'Dawn': '#ffcc66',
            'Day': '#e8dcc8',
            'Dusk': '#ff9966',
            'Night': '#8899cc'
        };
        return colors[period] || '#e8dcc8';
    }

    /**
     * Get color for heat bar (intensifies with heat)
     */
    getHeatColor(heat) {
        if (heat < 25) return 0x44aa44; // Green (safe)
        if (heat < 50) return 0xffcc00; // Yellow (noticed)
        if (heat < 75) return 0xff8800; // Orange (hunted)
        return 0xff2200; // Red (peril)
    }

    /**
     * Start heat warning animation
     */
    startHeatAlert() {
        this.heatAlertTween = this.tweens.add({
            targets: this.heatBar,
            alpha: { from: 1, to: 0.3 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    /**
     * Stop heat warning animation
     */
    stopHeatAlert() {
        if (this.heatAlertTween) {
            this.heatAlertTween.stop();
            this.heatAlertTween = null;
            if (this.heatBar) this.heatBar.setAlpha(1);
        }
    }

    /**
     * Handle window resize
     */
    resize() {
        if (!this.container) return;
        const width = this.scale.width;
        this.container.setPosition(width - this.padding - 200, this.padding);
    }
}

/**
 * Factory for HUD creation
 */
export function createOverworldHUD(scene) {
    return new OverworldHUD(scene);
}
