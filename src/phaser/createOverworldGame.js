import Phaser from 'phaser';
import { OverworldScene } from './OverworldScene.js';

/**
 * Creates and manages a Phaser overworld game instance
 * @param {Object} config
 * @param {string} config.parentId - DOM element ID to attach Phaser to
 * @param {Function} config.dispatch - Game state dispatch function
 * @param {Function} config.getGameState - Function to get current game state
 * @param {Function} config.setMode - Function to set game mode
 * @param {boolean} config.isEnabled - Whether overworld should be active
 * @returns {Object|null} Game control object with destroy/pause/resume methods, or null if disabled
 */
export function createOverworldGame({ parentId, dispatch, getGameState, setMode, isEnabled }) {
    // Feature flag: return null if overworld is disabled
    if (!isEnabled) {
        console.log('Overworld Phaser disabled by feature flag');
        return null;
    }

    try {
        // Verify parent element exists
        const parentElement = document.getElementById(parentId);
        if (!parentElement) {
            throw new Error(`Phaser parent element #${parentId} not found`);
        }

        console.log('Initializing Phaser overworld game...');

        // Phaser game configuration optimized for Vite + GitHub Pages
        const config = {
            type: Phaser.AUTO,
            parent: parentElement,
            backgroundColor: 'transparent', // Allow CSS background to show through
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 0 },
                    debug: false,
                    fps: 60,
                    fixedStep: false, // Allow variable timestep for smoother movement
                    // Reduce physics timestep precision and add damping to prevent shaking
                    timeStep: 1 / 60,
                    maxStep: 1 / 60,
                    velocityDecay: 0.99
                }
            },
            scale: {
                mode: Phaser.Scale.RESIZE, // Responsive scaling for mobile/desktop
                autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game canvas
                width: window.innerWidth,
                height: window.innerHeight,
                parent: parentElement, // Use the parent element for proper containment
                expandParent: false // Don't expand parent, let CSS handle layout
            },
            scene: [new OverworldScene({ dispatch, getGameState, setMode })]
        };

        // Create the Phaser game instance
        const game = new Phaser.Game(config);

        // Handle window resize for responsive scaling (debounced)
        let resizeTimeout;
        const resizeHandler = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (game.scale) {
                    game.scale.resize(window.innerWidth, window.innerHeight);
                }
            }, 100); // Debounce for 100ms
        };
        window.addEventListener('resize', resizeHandler);

        // Add global debug key to return to overworld mode (works even when scene is paused)
        const debugKeyHandler = (event) => {
            console.log('Global key handler called:', event.key);
            if (event.key === 'r' || event.key === 'R') {
                console.log('Global R key detected - returning to overworld mode');
                // Get gameState from window since scene might be paused
                if (window.gameState) {
                    const { setMode, GameMode } = window;
                    if (setMode && GameMode) {
                        console.log('Calling setMode with OVERWORLD...');
                        // Use force option to allow invalid transitions for debugging
                        setMode(window.gameState, GameMode.OVERWORLD, { force: true });
                    } else {
                        console.log('ERROR: setMode or GameMode not available');
                    }
                } else {
                    console.log('ERROR: window.gameState not available');
                }
            }
        };
        window.addEventListener('keydown', debugKeyHandler);

        // Return control object with lifecycle methods
        return {
            game,

            /**
             * Completely destroy the Phaser game and clean up
             */
            destroy: () => {
                console.log('Destroying Phaser overworld game...');
                window.removeEventListener('resize', resizeHandler);
                window.removeEventListener('keydown', debugKeyHandler);
                game.destroy(true);
            },

            /**
             * Pause the Phaser game (scene remains loaded)
             */
            pause: () => {
                if (game.scene && game.scene.isActive('OverworldScene')) {
                    game.scene.pause('OverworldScene');
                    console.log('Paused Phaser overworld');
                }
            },

            /**
             * Resume Phaser game
             */
            resume: () => {
                console.log('=== RESUME DEBUG START ===');
                console.log('game.scene exists:', !!game.scene);
                console.log('OverworldScene exists:', !!game.scene.getScene('OverworldScene'));
                console.log('Scene isPaused:', game.scene.isPaused('OverworldScene'));
                console.log('Scene isActive:', game.scene.isActive('OverworldScene'));
                
                if (game.scene && game.scene.getScene('OverworldScene')) {
                    // Position player before resuming to avoid hotspot triggers on first update frame
                    const scene = game.scene.getScene('OverworldScene');
                    console.log('Resume: scene found:', !!scene);
                    if (scene) {
                        console.log('Resume: scene.player exists:', !!scene.player);
                        console.log('Resume: scene isPaused:', game.scene.isPaused('OverworldScene'));
                        console.log('Resume: scene isActive:', game.scene.isActive('OverworldScene'));
                        console.log('Resume: scene.input enabled:', scene.input?.enabled);
                        
                        // Re-enable input if disabled
                        if (scene.input && !scene.input.enabled) {
                            scene.input.enabled = true;
                            console.log('Re-enabled scene input');
                        }
                        
                        // Check keyboard input status
                        if (scene.input && scene.input.keyboard) {
                            console.log('Keyboard input status:', scene.input.keyboard.enabled);
                            if (!scene.input.keyboard.enabled) {
                                scene.input.keyboard.enabled = true;
                                console.log('Re-enabled keyboard input');
                            }
                        }
                    }
                    if (scene && scene.player) {
                        // Find all hotspots and move player to a safe location
                        const hotspots = scene.hotspots || [];
                        let needsMove = false;
                        
                        // Check if player is near any hotspot
                        console.log('Checking hotspot distances for repositioning...');
                        for (const hotspot of hotspots) {
                            const distance = Phaser.Math.Distance.Between(
                                scene.player.x, scene.player.y,
                                hotspot.x, hotspot.y
                            );
                            console.log(`Distance to ${hotspot.id}: ${distance.toFixed(1)} (radius: ${hotspot.radius})`);
                            
                            // Only move if player is actually INSIDE the hotspot, not just near it
                            if (distance <= hotspot.radius) {
                                console.log(`Player is inside hotspot ${hotspot.id}, needs to move`);
                                needsMove = true;
                                break;
                            }
                        }
                        
                        if (needsMove) {
                            console.log('Moving player to safe position outside hotspot...');
                            
                            // Instead of moving to center, move player just outside hotspot
                            // Find the hotspot we're inside
                            for (const hotspot of hotspots) {
                                const distance = Phaser.Math.Distance.Between(
                                    scene.player.x, scene.player.y,
                                    hotspot.x, hotspot.y
                                );
                                if (distance <= hotspot.radius) {
                                    // Calculate direction from hotspot center to player
                                    const angle = Math.atan2(
                                        scene.player.y - hotspot.y,
                                        scene.player.x - hotspot.x
                                    );
                                    
                                    // Move player just outside hotspot radius
                                    const safeDistance = hotspot.radius + 20; // 20 pixels outside for safety
                                    scene.player.x = hotspot.x + Math.cos(angle) * safeDistance;
                                    scene.player.y = hotspot.y + Math.sin(angle) * safeDistance;
                                    
                                    console.log(`Moved player to safe position (${scene.player.x.toFixed(1)}, ${scene.player.y.toFixed(1)}) outside ${hotspot.id}`);
                                    
                                    // Clear any ongoing movement to prevent immediate re-entry
                                    if (scene.targetPosition) {
                                        scene.targetPosition = null;
                                        console.log('Cleared target position to prevent hotspot re-entry');
                                    }
                                    break;
                                }
                            }
                        } else {
                            console.log('Player is not inside any hotspot, no repositioning needed');
                        }
                    }
                    
                    // Always attempt to resume, regardless of what isPaused says
                    console.log('Attempting to resume scene...');
                    game.scene.resume('OverworldScene');
                    console.log('Resume called, checking if scene is now active:', game.scene.isActive('OverworldScene'));
                    console.log('Resume called, checking if scene is now paused:', game.scene.isPaused('OverworldScene'));
                    console.log('Resumed Phaser overworld');
                } else {
                    console.log('Cannot resume: OverworldScene not found');
                }
                console.log('=== RESUME DEBUG END ===');
            }
        };

    } catch (error) {
        console.error('Failed to initialize Phaser overworld:', error);
        // Return null on failure to maintain game stability
        return null;
    }
}
