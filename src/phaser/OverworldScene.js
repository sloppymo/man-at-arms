import Phaser from 'phaser';
import { setMode, GameMode } from '../core/game-modes.js';
import { OverworldHUD } from './OverworldHUD.js';

/**
 * Phaser scene for the overworld map exploration
 */
export class OverworldScene extends Phaser.Scene {
    constructor({ dispatch, getGameState, setMode }) {
        super({ key: 'OverworldScene' });
        this.dispatch = dispatch;
        this.getGameState = getGameState;
        this.setGameMode = setMode; // Rename to avoid confusion with Phaser's setMode

        // Scene state
        this.player = null;
        this.cursors = null;
        this.mapImage = null;
        this.hotspots = [];
        this.hudScene = null;

        // Movement state
        this.targetPosition = null;
        this.moveSpeed = 160; // pixels per second

        // Hex tracking for event dispatch
        this.currentHex = { q: 0, r: 0 };
    }

    /**
     * Convert pixel coordinates to axial hex coordinates
     * Assumes hex size ~50px, pointy-top orientation
     */
    pixelToHex(x, y) {
        const hexSize = 50;
        const q = Math.floor(x / (hexSize * Math.sqrt(3)));
        const r = Math.floor((y / (hexSize * 1.5)) - (q / 2));
        return { q, r };
    }

    /**
     * Teleport to a specific hex, dispatching ENTER_HEX for all hexes in the path
     */
    teleportTo(targetQ, targetR) {
        const startQ = this.currentHex.q;
        const startR = this.currentHex.r;
        const hexes = this.getHexLine(startQ, startR, targetQ, targetR);

        hexes.forEach(hex => {
            this.currentHex = hex;
            this.dispatch({
                type: 'ENTER_HEX',
                q: hex.q,
                r: hex.r,
                x: 0, // Approximate, since teleport
                y: 0
            });
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
        // Load overworld assets
        console.log('Loading overworld assets...');
        
        // Try to load map image
        this.load.image('overworld-map', '/man-at-arms/overworld/map.png');
        
        // Try to load player token
        this.load.image('player-token', '/man-at-arms/overworld/token.png');
        
        this.load.on('filecomplete', (key) => {
            console.log(`Loaded asset: ${key}`);
        });
        
        this.load.on('filecomplete-failed', (key) => {
            console.error(`Failed to load asset: ${key}`);
        });
    }

    /**
     * Create game objects and setup
     */
    create() {
        console.log('Creating overworld scene...');

        // Add the map background
        this.mapImage = this.add.image(0, 0, 'overworld-map').setOrigin(0, 0);

        // If map didn't load, create a fallback colored rectangle
        if (!this.mapImage.texture.key.includes('overworld-map')) {
            console.warn('Map image failed to load, using fallback');
            this.mapImage = this.add.rectangle(0, 0, 1024, 768, 0x2a4d2a).setOrigin(0, 0);
        }

        // Set physics world bounds to match map dimensions
        const mapWidth = this.mapImage.width;
        const mapHeight = this.mapImage.height;
        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

        // Create player token sprite
        this.player = this.physics.add.sprite(100, 100, 'player-token');

        // If token didn't load, use a fallback colored rectangle
        if (!this.player.texture.key.includes('player-token')) {
            console.warn('Player token failed to load, using fallback');
            // Remove the failed sprite and create a proper fallback
            this.player.destroy();
            this.player = this.physics.add.sprite(100, 100, null);
            
            // Create a simple colored rectangle as fallback
            const graphics = this.add.graphics();
            graphics.fillStyle(0xffd700, 1); // Gold color
            graphics.fillRect(-8, -8, 16, 16); // 16x16 rectangle centered
            graphics.generateTexture('fallback-player', 16, 16);
            graphics.destroy();
            
            // Now create the sprite with the generated texture
            this.player = this.physics.add.sprite(100, 100, 'fallback-player');
        }

        // Configure player physics
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0);
        this.player.setDrag(800, 800); // Friction to stop sliding

        // Setup camera to follow player
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1); // Smooth follow

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
            setMode(gameState, GameMode.OVERWORLD);
        });

        // Define hotspots (example: simple circular areas)
        this.hotspots = [
            { id: 'town-square', x: 300, y: 200, radius: 50 },
            { id: 'castle-gate', x: 172, y: 884, radius: 40 },
            { id: 'forest-entrance', x: 800, y: 150, radius: 35 }
        ];

        // Add visual indicators for hotspots (always visible for testing)
        this.hotspots.forEach(hotspot => {
            const circle = this.add.circle(hotspot.x, hotspot.y, hotspot.radius, 0xff0000, 0.2);
            circle.setStrokeStyle(2, 0xff0000, 0.5);
        });

        console.log('Overworld scene created successfully');

        // Launch HUD overlay (parallel scene)
        this.hudScene = this.scene.get('OverworldHUD') || 
            this.scene.add('OverworldHUD', OverworldHUD, true, {
                dispatch: this.dispatch,
                getGameState: this.getGameState
            });
        if (!this.hudScene.active) {
            this.scene.launch('OverworldHUD');
        }
        
        // Ensure HUD renders above overworld
        this.scene.bringToTop('OverworldHUD');
    }

    /**
     * Main game loop
     */
    update(time, delta) {
        if (!this.player) return;

        // Handle keyboard movement
        this.handleKeyboardMovement();

        // Handle click-to-move
        this.handleClickToMove();

        // Check hotspot overlaps
        this.checkHotspotOverlaps();

        // Check for hex entry
        const newHex = this.pixelToHex(this.player.x, this.player.y);
        if (newHex.q !== this.currentHex.q || newHex.r !== this.currentHex.r) {
            this.currentHex = newHex;

            // Dispatch hex entry event
            this.dispatch({
                type: 'ENTER_HEX',
                q: newHex.q,
                r: newHex.r,
                x: this.player.x,
                y: this.player.y
            });

            // Trigger encounter on specific hex
            // if (newHex.q === 1 && newHex.r === 0) {
            //     this.dispatch({
            //         type: 'TRIGGER_ENCOUNTER',
            //         story: 'forest_test'
            //     });
            // }
        }
    }

    /**
     * Handle WASD/Arrow key movement
     */
    handleKeyboardMovement() {
        const speed = this.moveSpeed;
        let velocityX = 0;
        let velocityY = 0;

        // Horizontal movement
        if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
            velocityX = -speed;
        } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
            velocityX = speed;
        }

        // Vertical movement
        if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
            velocityY = -speed;
        } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
            velocityY = speed;
        }

        // Apply velocity (diagonal movement is allowed)
        this.player.setVelocity(velocityX, velocityY);
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
            this.player.setVelocity(0, 0);
            this.targetPosition = null;
            return;
        }

        // Move toward target
        const angle = Phaser.Math.Angle.Between(
            this.player.x, this.player.y,
            this.targetPosition.x, this.targetPosition.y
        );

        this.player.setVelocity(
            Math.cos(angle) * this.moveSpeed,
            Math.sin(angle) * this.moveSpeed
        );
    }

    /**
     * Check if player overlaps with any hotspots
     */
    checkHotspotOverlaps() {
        if (!this.player) return;

        // Debug: Log current player position
        console.log(`Checking hotspots at player position: (${this.player.x.toFixed(1)}, ${this.player.y.toFixed(1)})`);

        this.hotspots.forEach(hotspot => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                hotspot.x, hotspot.y
            );

            console.log(`Distance to ${hotspot.id}: ${distance.toFixed(1)} (radius: ${hotspot.radius})`);

            if (distance <= hotspot.radius) {
                this.enterHotspot(hotspot);
            }
        });
    }

    /**
     * Handle entering a hotspot area
     */
    enterHotspot(hotspot) {
        console.log(`Player entered hotspot: ${hotspot.id}`);

        // Dispatch event to game state
        this.dispatch({
            type: 'OVERWORLD_NODE_ENTER',
            nodeId: hotspot.id,
            timestamp: Date.now()
        });

        // Change game mode based on hotspot type
        const gameState = this.getGameState();
        switch (hotspot.id) {
            case 'town-square':
                setMode(gameState, GameMode.DIALOGUE);
                break;
            case 'castle-gate':
                setMode(gameState, GameMode.ENCOUNTER);
                break;
            case 'forest-entrance':
                // Dispatch encounter trigger for forest_test story
                this.dispatch({
                    type: 'TRIGGER_ENCOUNTER',
                    story: 'forest_test'
                });
                break;
            default:
                console.warn(`Unknown hotspot: ${hotspot.id}`);
        }

        // Pause this scene when entering hotspots
        this.scene.pause();
    }

    /**
     * Resume overworld scene (called when leaving other modes)
     */
    resumeFromMode() {
        console.log('Resuming overworld scene');
        this.scene.resume();
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
}
