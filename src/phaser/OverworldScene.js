import Phaser from 'phaser';
import { setMode, GameMode } from '../core/game-modes.js';
import { OverworldHUD } from './OverworldHUD.js';
import { CHEVAUCHEE_ZONES } from '../core/constants.js';

/**
 * Phaser scene for the overworld map exploration
 */
export class OverworldScene extends Phaser.Scene {
    constructor({ dispatch, getGameState, setMode }) {
        super({ key: 'OverworldScene' });
        this.dispatch = dispatch;
        this.getGameState = getGameState;
        this.setGameMode = setMode;

        // Scene state
        this.player = null;
        this.cursors = null;
        this.mapImage = null;
        this.hotspots = [];
        this.hudScene = null;
        this.activeHotspots = new Set(); // Track active hotspots to prevent repeated calls
        this.hotspotCooldown = new Set(); // Prevent immediate re-triggering after dialog
        this._cooldownTimers = new Set(); // Track setTimeout timers for cleanup

        // Movement state
        this.targetPosition = null;
        this.moveSpeed = 160; // pixels per second

        // Hex tracking for event dispatch
        this.currentHex = { q: 0, r: 0 };

        // Chevauchée zone definition
        this.CHEVAUCHEE_ZONE = CHEVAUCHEE_ZONES.normandy_raids;

        // Timer tracking for cleanup (Issue #2)
        this._cooldownTimers = new Set();
    }

    /**
     * Check if current hex is in chevauchée zone
     */
    isInChevaucheeZone(q, r) {
        return q >= this.CHEVAUCHEE_ZONE.qMin && 
               q <= this.CHEVAUCHEE_ZONE.qMax &&
               r >= this.CHEVAUCHEE_ZONE.rMin && 
               r <= this.CHEVAUCHEE_ZONE.rMax;
    }

    /**
     * Convert pixel coordinates to axial hex coordinates
     * Assumes hex size ~50px, pointy-top orientation
     */
    pixelToHex(x, y) {
        const hexSize = 50;
        const q = Math.round((Math.sqrt(3)/3 * x - 1/3 * y) / hexSize);
        const r = Math.round((2/3 * y) / hexSize);
        return { q, r };
    }

    /**
     * Teleport to a specific hex, dispatching ENTER_HEX for the destination only
     */
    teleportTo(targetQ, targetR) {
        // Update current hex to destination
        this.currentHex = { q: targetQ, r: targetR };

        // Dispatch single ENTER_HEX event for destination
        this.dispatch({
            type: 'ENTER_HEX',
            q: targetQ,
            r: targetR,
            x: 0, // Approximate, since teleport
            y: 0
        });

        // Update player position approximately
        const hexSize = 50;
        this.player.x = targetQ * hexSize * Math.sqrt(3);
        this.player.y = targetR * hexSize * 1.5 + (targetQ * hexSize * 1.5) / 2;
    }

    /**
     * Get all hexes in a straight line from start to end (inclusive)
     */
    getHexLine(startQ, startR, endQ, endR) {
        const hexes = [];

        // Convert axial to cube
        const startX = startQ;
        const startZ = startR;
        const startY = -startX - startZ;

        const endX = endQ;
        const endZ = endR;
        const endY = -endX - endZ;

        const N = Math.max(Math.abs(endX - startX), Math.abs(endY - startY), Math.abs(endZ - startZ));

        for (let i = 0; i <= N; i++) {
            const t = N === 0 ? 0 : i / N;
            const x = Math.round(startX + (endX - startX) * t);
            const y = Math.round(startY + (endY - startY) * t);
            const z = Math.round(startZ + (endZ - startZ) * t);
            // Convert back to axial
            const q = x;
            const r = z;
            hexes.push({ q, r });
        }

        // Remove duplicates
        const unique = [];
        hexes.forEach(hex => {
            if (!unique.some(h => h.q === hex.q && h.r === hex.r)) {
                unique.push(hex);
            }
        });

        return unique;
    }

    /**
     * Load game assets
     */
    preload() {
        console.log('Loading overworld assets...');
        
        // Load map image from public folder - use the hex forest region map
        this.load.image('overworld-map', '/maps/hex_forest_region.png');
        
        // Player token will be created programmatically to avoid missing file errors
        
        this.load.on('filecomplete', (key) => {
            console.log(`Loaded asset: ${key}`);
        });
        
        this.load.on('filecomplete-failed', (key, file) => {
            console.error(`Failed to load asset: ${key}`, file);
        });
    }

    /**
     * Create game objects and setup
     */
    create() {
        console.log('Creating overworld scene...');

        // Add the map background - directly load the map without temporary background
        console.log('Creating map background...');
        
        // Try to use the Phaser-loaded map image immediately
        console.log('Available textures:', this.textures.list);
        if (this.textures.exists('overworld-map')) {
            console.log('Using Phaser-loaded map texture');
            this.mapImage = this.add.image(0, 0, 'overworld-map').setOrigin(0, 0);
            this.mapImage.setDepth(-100); // Very low depth to ensure it's behind everything
            console.log('Successfully created map from Phaser texture');
        } else {
            console.log('Phaser map texture not available, creating minimal placeholder');
            console.log('Looking for any loaded textures...');
            const textureKeys = this.textures.getTextureKeys();
            console.log('Loaded texture keys:', textureKeys);
            
            // Create minimal placeholder
            this.mapImage = this.add.graphics();
            this.mapImage.fillStyle(0x000000, 1); // Black background
            this.mapImage.fillRect(0, 0, 1024, 1024);
            this.mapImage.setDepth(-100);
        }

        console.log('Final map object:', this.mapImage, 'position:', this.mapImage.x, this.mapImage.y, 'size:', this.mapImage.width, this.mapImage.height);

        // Set physics world bounds to match map dimensions
        const mapWidth = this.mapImage.width;
        const mapHeight = this.mapImage.height;
        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

        // Create player as a simple colored rectangle (skip the problematic player-token)
        const graphics = this.add.graphics();
        graphics.fillStyle(0xffd700, 1); // Gold color
        graphics.fillRect(0, 0, 16, 16);
        graphics.generateTexture('simple-player', 16, 16);
        graphics.destroy();
        
        this.player = this.add.sprite(100, 100, 'simple-player'); // Start in safe area away from hotspots
        this.player.setDepth(10);

        // Setup camera to follow player (disabled to test shaking)
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        // Temporarily disable camera following to stop shaking
        // this.cameras.main.startFollow(this.player, false, 0.15, 0.15);

        console.log('Input setup complete:', {
            cursors: !!this.cursors,
            wasdKeys: !!this.wasdKeys,
            input: !!this.input,
            keyboard: !!this.input.keyboard
        });

        // Setup input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Enable click-to-move
        this.input.on('pointerdown', this.handlePointerDown, this);

        // Add debug key to return to overworld (for testing)
        this.input.keyboard.on('keydown-R', () => {
            console.log('Debug: Returning to overworld mode');
            const gameState = this.getGameState();
            this.setGameMode(gameState, GameMode.OVERWORLD);
        });

        // Add debug key to teleport to town-square
        this.input.keyboard.on('keydown-T', () => {
            console.log('Debug: Teleporting to town-square');
            this.player.x = 200;
            this.player.y = 200;
            this.activeHotspots.clear();
            this.hotspotCooldown.clear();
        });

        // Define hotspots (example: simple circular areas)
        this.hotspots = [
            { id: 'town-square', x: 400, y: 300, radius: 80 }, // Town area - more central
            { id: 'castle-gate', x: 600, y: 200, radius: 60 }, // Castle - more visible
            { id: 'forest-entrance', x: 200, y: 400, radius: 50 }, // Forest entrance
            { id: 'market', x: 500, y: 450, radius: 45 }, // Market area
            { id: 'tavern', x: 350, y: 500, radius: 40 }, // Tavern
            { id: 'church', x: 650, y: 400, radius: 45 }, // Church
            { id: 'blacksmith', x: 250, y: 250, radius: 35 } // Blacksmith
        ];

        // Add visual indicators for hotspots (always enabled for now)
        const DEBUG_HOTSPOTS = true; // Always show hotspots for testing
        
        if (DEBUG_HOTSPOTS) {
            this.hotspots.forEach(hotspot => {
                // Add visible circle for hotspot
                const circle = this.add.circle(hotspot.x, hotspot.y, hotspot.radius, 0xffff00, 0.3);
                circle.setStrokeStyle(3, 0xff0000, 0.8);
                circle.setScrollFactor(0); // Keep fixed relative to camera
                
                // Add text label
                const text = this.add.text(hotspot.x, hotspot.y - hotspot.radius - 20, hotspot.id.toUpperCase(), {
                    fontSize: '14px',
                    color: '#ff0000',
                    backgroundColor: '#ffff00',
                    padding: { x: 4, y: 2 }
                }).setOrigin(0.5);
                text.setScrollFactor(0);
            });
        }

        console.log('Overworld scene created successfully');
        
        // Debug: Log all game objects in the scene
        console.log('=== SCENE OBJECTS DEBUG ===');
        const allChildren = this.children.list;
        console.log('Total objects in scene:', allChildren.length);
        allChildren.forEach((child, index) => {
            console.log(`Object ${index}:`, {
                type: child.type,
                name: child.name || 'unnamed',
                depth: child.depth,
                visible: child.visible,
                x: child.x,
                y: child.y,
                width: child.width || 'N/A',
                height: child.height || 'N/A',
                texture: child.texture ? child.texture.key : 'none'
            });
        });
        console.log('=== END SCENE DEBUG ===');

        // Launch HUD overlay (parallel scene) - TEMPORARILY DISABLED FOR DEBUGGING
        // this.hudScene = this.scene.get('OverworldHUD') || 
        //     this.scene.add('OverworldHUD', OverworldHUD, true, {
        //         dispatch: this.dispatch,
        //         getGameState: this.getGameState
        //     });
        // if (!this.hudScene.active) {
        //     this.scene.launch('OverworldHUD');
        // }
        
        // Ensure HUD renders above overworld
        // this.scene.bringToTop('OverworldHUD');
    }

    /**
     * Main game loop
     */
    update(time, delta) {
        if (!this.player) {
            return;
        }
        
        // Handle keyboard movement
        this.handleKeyboardMovement();

        // Handle click-to-move
        this.handleClickToMove();

        // Check hotspot overlaps
        this.checkHotspotOverlaps();

        // Check for hex entry
        const newHex = this.pixelToHex(this.player.x, this.player.y);
        if (newHex.q !== this.currentHex.q || newHex.r !== this.currentHex.r) {
            console.log(`Entering hex: (${newHex.q}, ${newHex.r}) at position (${this.player.x.toFixed(1)}, ${this.player.y.toFixed(1)})`);
            this.currentHex = newHex;

            // Check if entering chevauchée zone
            const inChevaucheeZone = this.isInChevaucheeZone(newHex.q, newHex.r);

            // Dispatch hex entry event with zone information
            this.dispatch({
                type: 'ENTER_HEX',
                q: newHex.q,
                r: newHex.r,
                x: this.player.x,
                y: this.player.y,
                zone: inChevaucheeZone ? this.CHEVAUCHEE_ZONE.name : null
            });
        }
    }

    /**
     * Handle WASD/Arrow key movement
     */
    handleKeyboardMovement() {
        // Debug: Check if input is working
        if (!this.cursors || !this.wasdKeys) {
            console.log('ERROR: cursors or wasdKeys not available');
            return;
        }
        
        const speed = 200; // pixels per second
        let deltaX = 0;
        let deltaY = 0;

        // Prevent conflicting inputs
        const leftPressed = this.cursors.left.isDown || this.wasdKeys.A.isDown;
        const rightPressed = this.cursors.right.isDown || this.wasdKeys.D.isDown;
        const upPressed = this.cursors.up.isDown || this.wasdKeys.W.isDown;
        const downPressed = this.cursors.down.isDown || this.wasdKeys.S.isDown;

        // Calculate movement delta
        if (leftPressed && !rightPressed) {
            deltaX = -speed * (this.game.loop.delta / 1000);
        } else if (rightPressed && !leftPressed) {
            deltaX = speed * (this.game.loop.delta / 1000);
        }

        if (upPressed && !downPressed) {
            deltaY = -speed * (this.game.loop.delta / 1000);
        } else if (downPressed && !upPressed) {
            deltaY = speed * (this.game.loop.delta / 1000);
        }

        // Debug: Log input state every frame
        if (leftPressed || rightPressed || upPressed || downPressed) {
            console.log('Movement input detected:', { leftPressed, rightPressed, upPressed, downPressed });
        }

        // Apply movement directly to position instead of velocity
        if (deltaX !== 0 || deltaY !== 0) {
            const oldX = this.player.x;
            const oldY = this.player.y;
            
            this.player.x += deltaX;
            this.player.y += deltaY;
            
            // Keep player in bounds
            this.player.x = Phaser.Math.Clamp(this.player.x, 0, this.physics.world.bounds.width || 1024);
            this.player.y = Phaser.Math.Clamp(this.player.y, 0, this.physics.world.bounds.height || 1024);
            
            console.log(`Player moved: (${oldX.toFixed(1)}, ${oldY.toFixed(1)}) -> (${this.player.x.toFixed(1)}, ${this.player.y.toFixed(1)})`);
        } else if (leftPressed || rightPressed || upPressed || downPressed) {
            console.log('Input detected but no movement calculated');
        }
    }

    /**
     * Handle click/tap-to-move functionality
     */
    handlePointerDown(pointer) {
        // Convert screen coordinates to world coordinates
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);

        // Set target position for click-to-move
        this.targetPosition = {
            x: worldPoint.x,
            y: worldPoint.y
        };
    }

    /**
     * Move toward click target position
     */
    handleClickToMove() {
        if (!this.targetPosition) return;

        const distance = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.targetPosition.x, this.targetPosition.y
        );

        // If close enough to target, stop moving
        if (distance < 10) {
            // No velocity to reset for non-physics sprite
            this.targetPosition = null;
            return;
        }

        // Move toward target using direct position updates
        const angle = Phaser.Math.Angle.Between(
            this.player.x, this.player.y,
            this.targetPosition.x, this.targetPosition.y
        );

        // Calculate movement delta for this frame
        const deltaX = Math.cos(angle) * this.moveSpeed * (this.game.loop.delta / 1000);
        const deltaY = Math.sin(angle) * this.moveSpeed * (this.game.loop.delta / 1000);

        // Apply direct position update
        this.player.x += deltaX;
        this.player.y += deltaY;

        // Keep player in bounds
        this.player.x = Phaser.Math.Clamp(this.player.x, 0, this.physics.world.bounds.width || 1024);
        this.player.y = Phaser.Math.Clamp(this.player.y, 0, this.physics.world.bounds.height || 1024);
    }

    /**
     * Check if player overlaps with any hotspots
     */
    checkHotspotOverlaps() {
        if (!this.player) return;

        this.hotspots.forEach(hotspot => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                hotspot.x, hotspot.y
            );

            const isInRange = distance <= hotspot.radius;
            const wasActive = this.activeHotspots.has(hotspot.id);
            const isOnCooldown = this.hotspotCooldown.has(hotspot.id);

            if (isInRange && !wasActive && !isOnCooldown) {
                // Entering hotspot for first time
                this.activeHotspots.add(hotspot.id);
                this.enterHotspot(hotspot);
            } else if (!isInRange && wasActive) {
                // Leaving hotspot
                this.activeHotspots.delete(hotspot.id);
                // Add cooldown when leaving to prevent immediate re-entry
                this.hotspotCooldown.add(hotspot.id);
                const timerId = setTimeout(() => {
                    this.hotspotCooldown.delete(hotspot.id);
                    console.log(`Cooldown ended for hotspot: ${hotspot.id}`);
                }, 2000); // 2 second cooldown
                this._cooldownTimers.add(timerId);
                this.exitHotspot(hotspot);
            }
        });
    }
    enterHotspot(hotspot) {
        console.log(`Player entered hotspot: ${hotspot.id}`);

        // Handle different hotspot types
        const gameState = this.getGameState();
        switch (hotspot.id) {
            case 'town-square':
                // Force simple quest story for testing
                const storyName = 'overworld/town_square_quest';
                
                console.log(`Entering town square - triggering: ${storyName}`);
                this.dispatch({ type: 'TRIGGER_ENCOUNTER', payload: { story: storyName } });
                break;
            case 'castle-gate':
                console.log('Entering castle gate - triggering delivery encounter');
                this.dispatch({ type: 'TRIGGER_ENCOUNTER', payload: { story: 'overworld/castle_gate_delivery' } });
                break;
            case 'forest-entrance':
                // Dispatch encounter trigger for forest_test story
                this.dispatch({ type: 'TRIGGER_ENCOUNTER', payload: { story: 'overworld/forest_test' } });
                break;
            case 'market':
                console.log('Entering market - triggering forest encounter');
                this.dispatch({ type: 'TRIGGER_ENCOUNTER', payload: { story: 'overworld/forest_test' } });
                break;
            case 'tavern':
                console.log('Entering tavern - triggering quest encounter');
                this.dispatch({ type: 'TRIGGER_ENCOUNTER', payload: { story: 'overworld/town_square_quest' } });
                break;
            case 'church':
                console.log('Entering church - triggering quest encounter');
                this.dispatch({ type: 'TRIGGER_ENCOUNTER', payload: { story: 'overworld/town_square_quest' } });
                break;
            case 'blacksmith':
                console.log('Entering blacksmith - triggering quest encounter');
                this.dispatch({ type: 'TRIGGER_ENCOUNTER', payload: { story: 'overworld/town_square_quest' } });
                break;
        }

        // Dispatch event to game state
        this.dispatch({
            type: 'OVERWORLD_NODE_ENTER',
            nodeId: hotspot.id,
            timestamp: Date.now()
        });
    }

    /**
     * Handle exiting a hotspot area
     */
    exitHotspot(hotspot) {
        console.log(`Player exited hotspot: ${hotspot.id}`);
        // Could add exit logic here if needed
    }

    /**
     * Resume overworld scene (called when leaving other modes)
     */
    resumeFromMode() {
        console.log('Resuming overworld scene');
        this.scene.resume();
        
        // Re-enable input systems
        if (this.input && this.input.keyboard) {
            console.log('Re-enabling keyboard input');
            // Re-add keyboard listeners if needed
            if (!this.cursors) {
                this.cursors = this.input.keyboard.createCursorKeys();
            }
            if (!this.wasdKeys) {
                this.wasdKeys = this.input.keyboard.addKeys({
                    W: Phaser.Input.Keyboard.KeyCodes.W,
                    A: Phaser.Input.Keyboard.KeyCodes.A,
                    S: Phaser.Input.Keyboard.KeyCodes.S,
                    D: Phaser.Input.Keyboard.KeyCodes.D
                });
            }
        }
        
        console.log('Overworld scene resumed successfully');
    }

    /**
     * Shut down HUD when scene stops
     */
    stop() {
        if (this.hudScene) {
            this.scene.stop('OverworldHUD');
            this.hudScene = null;
        }
    }

    /**
     * Clean up resources when scene is destroyed (Issue #2)
     */
    destroy() {
        super.destroy();
        // Clear all pending cooldown timers
        this._cooldownTimers.forEach(timerId => clearTimeout(timerId));
        this._cooldownTimers.clear();
    }
}
