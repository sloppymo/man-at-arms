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
                    debug: false, // Set to true for development physics debugging
                    gravity: { x: 0, y: 0 } // Top-down, no gravity
                }
            },
            scale: {
                mode: Phaser.Scale.RESIZE, // Responsive scaling for mobile/desktop
                autoCenter: Phaser.Scale.NO_CENTER, // Let CSS handle centering
                width: window.innerWidth,
                height: window.innerHeight
            },
            scene: [new OverworldScene({ dispatch, getGameState, setMode })]
        };

        // Create the Phaser game instance
        const game = new Phaser.Game(config);

        // Handle window resize for responsive scaling
        const resizeHandler = () => {
            if (game.scale) {
                game.scale.resize(window.innerWidth, window.innerHeight);
            }
        };
        window.addEventListener('resize', resizeHandler);

        // Add global debug key to return to overworld mode (works even when scene is paused)
        const debugKeyHandler = (event) => {
            if (event.key === 'r' || event.key === 'R') {
                console.log('Debug: Returning to overworld mode');
                // Get gameState from window since scene might be paused
                if (window.gameState) {
                    const { setMode, GameMode } = window;
                    if (setMode && GameMode) {
                        // Use force option to allow invalid transitions for debugging
                        setMode(window.gameState, GameMode.OVERWORLD, { force: true });
                    }
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
             * Resume the Phaser game
             */
            resume: () => {
                if (game.scene && game.scene.isPaused('OverworldScene')) {
                    // Position player before resuming to avoid hotspot triggers on first update frame
                    const scene = game.scene.getScene('OverworldScene');
                    console.log('Resume: scene found:', !!scene);
                    if (scene) {
                        console.log('Resume: scene.player exists:', !!scene.player);
                    }
                    if (scene && scene.player) {
                        // Find all hotspots and move player to a safe location
                        const hotspots = scene.hotspots || [];
                        let needsMove = false;
                        
                        // Check if player is near any hotspot
                        for (const hotspot of hotspots) {
                            const distance = Phaser.Math.Distance.Between(
                                scene.player.x, scene.player.y,
                                hotspot.x, hotspot.y
                            );
                            if (distance <= hotspot.radius + 30) { // Increased buffer
                                needsMove = true;
                                break;
                            }
                        }
                        
                        if (needsMove) {
                            // Move to a safe default position (center of map, away from hotspots)
                            const mapWidth = scene.mapImage ? scene.mapImage.width : 1024;
                            const mapHeight = scene.mapImage ? scene.mapImage.height : 768;
                            
                            // Place player in center area, avoiding hotspot locations
                            scene.player.x = mapWidth / 2;
                            scene.player.y = mapHeight / 2;
                            
                            // Stop player movement to prevent momentum
                            scene.player.setVelocity(0, 0);
                            
                            // Ensure not too close to any hotspot
                            for (const hotspot of hotspots) {
                                const distance = Phaser.Math.Distance.Between(
                                    scene.player.x, scene.player.y,
                                    hotspot.x, hotspot.y
                                );
                                if (distance <= hotspot.radius + 50) {
                                    // Move to a different safe spot
                                    scene.player.x = 100;
                                    scene.player.y = 100;
                                    break;
                                }
                            }
                            
                            console.log(`Moved player to safe position (${scene.player.x}, ${scene.player.y}) and stopped velocity to prevent hotspot re-triggering`);
                            
                            // Debug: Check distances to all hotspots
                            hotspots.forEach(hotspot => {
                                const distance = Phaser.Math.Distance.Between(
                                    scene.player.x, scene.player.y,
                                    hotspot.x, hotspot.y
                                );
                                console.log(`Distance to ${hotspot.id}: ${distance.toFixed(1)} (radius: ${hotspot.radius})`);
                            });
                        }
                    }
                    
                    game.scene.resume('OverworldScene');
                    console.log('Resumed Phaser overworld');
                }
            }
        };

    } catch (error) {
        console.error('Failed to initialize Phaser overworld:', error);
        // Return null on failure to maintain game stability
        return null;
    }
}
