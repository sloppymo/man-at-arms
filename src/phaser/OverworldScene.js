import { Scene, Math as PhaserMath, Input } from 'phaser';
import { setMode, GameMode } from '../core/game-modes.js';
import { OverworldHUD } from './OverworldHUD.js';
import { CHEVAUCHEE_ZONES } from '../core/constants.js';

/**
 * Phaser scene for the overworld map exploration
 */
export class OverworldScene extends Scene {
    constructor() {
        super({ key: 'OverworldScene' });
        
        // Dependencies will be set from game registry in init()
        this.dispatch = null;
        this.getGameState = null;
        this.setGameMode = null;

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
        this.isInDialogMode = false; // Track if player is in dialog to prevent movement

        // Hex tracking for event dispatch
        this.currentHex = { q: 0, r: 0 };

        // Chevauchée zone definition
        this.CHEVAUCHEE_ZONE = CHEVAUCHEE_ZONES.normandy_raids;

        // Timer tracking for cleanup (Issue #2)
        this._cooldownTimers = new Set();
    }

    init(data) {
        // Set dependencies from scene data
        if (data) {
            this.dispatch = data.dispatch;
            this.getGameState = data.getGameState;
            this.setGameMode = data.setGameMode;
        }
        
        // Fallback: get dependencies from global scope if not set
        if (!this.dispatch && window.dispatcher) {
            this.dispatch = window.dispatcher.dispatch.bind(window.dispatcher);
        }
        
        if (!this.getGameState && window.gameState) {
            this.getGameState = () => window.gameState;
        }
        
        if (!this.setGameMode && window.setMode) {
            this.setGameMode = window.setMode;
        }
        
        console.log('OverworldScene init() called with dependencies:', {
            dispatch: !!this.dispatch,
            getGameState: !!this.getGameState,
            setGameMode: !!this.setGameMode
        });
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
        const q = window.Math.round((window.Math.sqrt(3)/3 * x - 1/3 * y) / hexSize);
        const r = window.Math.round((2/3 * y) / hexSize);
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
        this.player.x = targetQ * hexSize * window.Math.sqrt(3);
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

        const N = window.Math.max(window.Math.abs(endX - startX), window.Math.abs(endY - startY), window.Math.abs(endZ - startZ));

        for (let i = 0; i <= N; i++) {
            const t = N === 0 ? 0 : i / N;
            const x = window.Math.round(startX + (endX - startX) * t);
            const y = window.Math.round(startY + (endY - startY) * t);
            const z = window.Math.round(startZ + (endZ - startZ) * t);
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
        
        // Load the actual map image
        this.load.image('overworld-map', './map.png');
        
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

        // Create a simple colored map background
        console.log('Creating map background...');
        
        // Add the loaded map image as background
        this.mapImage = this.add.image(512, 512, 'overworld-map');
        this.mapImage.setDepth(-100); // Very low depth to ensure it's behind everything

        console.log('Successfully loaded map image');

        // Set physics world bounds to match map dimensions
        const mapWidth = 1024;
        const mapHeight = 1024;
        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

        // Create player as a simple colored rectangle
        const graphics = this.add.graphics();
        graphics.fillStyle(0xffd700, 1); // Gold color
        graphics.fillRect(0, 0, 16, 16);
        graphics.generateTexture('simple-player', 16, 16);
        graphics.destroy();
        
        this.player = this.add.sprite(100, 100, 'simple-player'); // Start in safe area away from hotspots
        this.player.setDepth(10);

        // Setup camera to follow player
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        this.cameras.main.startFollow(this.player, false, 0.15, 0.15);

        console.log('Input setup complete:', {
            cursors: !!this.cursors,
            wasdKeys: !!this.wasdKeys,
            input: !!this.input,
            keyboard: !!this.input.keyboard
        });

        // Setup input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys({
            W: Input.Keyboard.KeyCodes.W,
            A: Input.Keyboard.KeyCodes.A,
            S: Input.Keyboard.KeyCodes.S,
            D: Input.Keyboard.KeyCodes.D
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
                const circle = this.add.circle(hotspot.x, hotspot.y, hotspot.radius, 0xffff00, 0.1);
                circle.setStrokeStyle(3, 0xff0000, 0.8);
                circle.setScrollFactor(1); // Scroll with the world
                
                // Add text label
                const displayText = hotspot.id === 'tavern' ? 'Forest' : hotspot.id.toUpperCase();
                const text = this.add.text(hotspot.x, hotspot.y - hotspot.radius - 20, displayText, {
                    fontSize: '14px',
                    color: '#ff0000',
                    backgroundColor: '#ffff00',
                    padding: { x: 4, y: 2 }
                }).setOrigin(0.5);
                text.setScrollFactor(1); // Scroll with the world
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
        // Don't move if in dialog mode
        if (this.isInDialogMode) return;
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
            this.player.x = PhaserMath.Clamp(this.player.x, 0, this.physics.world.bounds.width || 1024);
            this.player.y = PhaserMath.Clamp(this.player.y, 0, this.physics.world.bounds.height || 1024);
            
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
        // Don't move if in dialog mode
        if (this.isInDialogMode) return;
        if (!this.targetPosition) return;

        const distance = PhaserMath.Distance.Between(
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
        const angle = PhaserMath.Angle.Between(
            this.player.x, this.player.y,
            this.targetPosition.x, this.targetPosition.y
        );

        // Calculate movement delta for this frame
        const deltaX = window.Math.cos(angle) * this.moveSpeed * (this.game.loop.delta / 1000);
        const deltaY = window.Math.sin(angle) * this.moveSpeed * (this.game.loop.delta / 1000);

        // Apply direct position update
        this.player.x += deltaX;
        this.player.y += deltaY;

        // Keep player in bounds
        this.player.x = PhaserMath.Clamp(this.player.x, 0, this.physics.world.bounds.width || 1024);
        this.player.y = PhaserMath.Clamp(this.player.y, 0, this.physics.world.bounds.height || 1024);
    }

    /**
     * Check if player overlaps with any hotspots
     */
    checkHotspotOverlaps() {
        if (!this.player) return;

        this.hotspots.forEach(hotspot => {
            const distance = PhaserMath.Distance.Between(
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
                this.dispatch({ type: 'START_DIALOG', payload: { dialogId: 'town_square_quest', character: 'merchant' } });
                break;
            case 'castle-gate':
                console.log('Entering castle gate - triggering delivery encounter');
                this.dispatch({ type: 'START_DIALOG', payload: { dialogId: 'castle_gate_delivery', character: 'guard' } });
                break;
            case 'forest-entrance':
                // Dispatch encounter trigger for raid encounter
                this.dispatch({ type: 'START_DIALOG', payload: { dialogId: 'raid_encounter', character: 'bandit' } });
                break;
            case 'market':
                console.log('Entering market - triggering forest encounter');
                this.dispatch({ type: 'START_DIALOG', payload: { dialogId: 'forest_encounter', character: 'merchant' } });
                break;
            case 'tavern':
                console.log('Entering tavern - triggering quest encounter');
                this.dispatch({ type: 'START_DIALOG', payload: { dialogId: 'town_square_quest', character: 'innkeeper' } });
                break;
            case 'church':
                console.log('Entering church - triggering quest encounter');
                this.dispatch({ type: 'START_DIALOG', payload: { dialogId: 'town_square_quest', character: 'priest' } });
                break;
            case 'blacksmith':
                console.log('Entering blacksmith - triggering quest encounter');
                this.dispatch({ type: 'START_DIALOG', payload: { dialogId: 'town_square_quest', character: 'blacksmith' } });
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
                    W: Input.Keyboard.KeyCodes.W,
                    A: Input.Keyboard.KeyCodes.A,
                    S: Input.Keyboard.KeyCodes.S,
                    D: Input.Keyboard.KeyCodes.D
                });
            }
        }
        
        console.log('Overworld scene resumed successfully');
    }

    /**
     * Override pause to track dialog mode
     */
    pause() {
        super.pause();
        this.isInDialogMode = true;
        console.log('Overworld scene paused - entering dialog mode');
    }

    /**
     * Override resume to track dialog mode
     */
    resume() {
        super.resume();
        this.isInDialogMode = false;
        console.log('Overworld scene resumed - exiting dialog mode');
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
