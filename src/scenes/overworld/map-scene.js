// ============================================
// Man-at-Arms Map Scene
// Orchestrates map display and game integration
// ============================================

import { MapRenderer } from './map-renderer.js';
import { MAP_NODES, getNodeById } from './nodes.js';

/**
 * Map scene component that manages the overworld map display
 * Integrates with game state and event system
 */
export class MapScene {
  constructor(container, gameState, dispatcher) {
    this.container = container;
    this.gameState = gameState;
    this.dispatcher = dispatcher;

    this.mapRenderer = null;
    this.isActive = false;

    this.initialize();
  }

  /**
   * Initialize the map scene
   */
  initialize() {
    // Create map renderer
    this.mapRenderer = new MapRenderer(this.container, {
      width: 800,
      height: 600,
      backgroundImage: '/assets/map-background.jpg'
    });

    // Set up event handlers
    this.setupEventHandlers();

    // Set initial player position
    this.updatePlayerPosition();
  }

  /**
   * Set up event handlers for map interactions
   */
  setupEventHandlers() {
    // Handle node entry (when player moves near a node)
    this.mapRenderer.on('enterNode', (data) => {
      const { node } = data;
      console.log(`Player entered node: ${node.name}`);

      // Dispatch encounter event
      if (this.dispatcher) {
        this.dispatcher.dispatch('ARRIVE_NODE', {
          nodeId: node.id,
          node: node,
          encounter: node.encounter
        }, 'map-scene');
      }

      // Auto-transition to encounter if available
      if (node.encounter) {
        this.handleEncounter(node);
      }
    });

    // Handle node clicks
    this.mapRenderer.on('nodeClick', (data) => {
      const { node } = data;
      console.log(`Node clicked: ${node.name}`);

      if (this.dispatcher) {
        this.dispatcher.dispatch('NODE_CLICK', {
          nodeId: node.id,
          node: node
        }, 'map-scene');
      }
    });

    // Handle player movement
    this.mapRenderer.on('playerMove', (data) => {
      // Update game state with new position
      this.gameState.playerPosition = data.to;

      if (this.dispatcher) {
        this.dispatcher.dispatch('PLAYER_MOVE', {
          from: data.from,
          to: data.to
        }, 'map-scene');
      }
    });

    // Listen for game state changes
    if (this.dispatcher) {
      this.dispatcher.subscribe('MODE_CHANGE', this.handleModeChange.bind(this));
      this.dispatcher.subscribe('GAME_LOAD', this.handleGameLoad.bind(this));
    }
  }

  /**
   * Handle mode changes
   */
  handleModeChange(event) {
    if (event.type === 'MODE_CHANGE') {
      if (event.to === 'overworld') {
        this.show();
      } else if (event.from === 'overworld') {
        this.hide();
      }
    }
  }

  /**
   * Handle game load events
   */
  handleGameLoad(event) {
    // Update player position from loaded state
    this.updatePlayerPosition();
  }

  /**
   * Handle encounter at a node
   */
  handleEncounter(node) {
    if (!node.encounter) return;

    console.log(`Starting encounter: ${node.encounter}`);

    // Transition to encounter mode
    if (this.dispatcher && window.setMode) {
      window.setMode(this.gameState, 'encounter');

      // Dispatch encounter start event
      this.dispatcher.dispatch('ENCOUNTER_START', {
        encounterId: node.encounter,
        nodeId: node.id,
        node: node
      }, 'map-scene');
    }
  }

  /**
   * Update player position from game state
   */
  updatePlayerPosition() {
    if (this.gameState.playerPosition) {
      this.mapRenderer.setPlayerPosition(
        this.gameState.playerPosition.x,
        this.gameState.playerPosition.y
      );
    } else {
      // Default to starting position
      this.setPlayerAtNode('portsmouth');
    }
  }

  /**
   * Set player position at a specific node
   */
  setPlayerAtNode(nodeId) {
    const node = getNodeById(nodeId);
    if (node) {
      this.gameState.playerPosition = { x: node.x, y: node.y };
      this.mapRenderer.setPlayerPosition(node.x, node.y);
    }
  }

  /**
   * Move player to a specific node with animation
   */
  movePlayerToNode(nodeId, smooth = true) {
    const node = getNodeById(nodeId);
    if (node) {
      this.gameState.playerPosition = { x: node.x, y: node.y };
      this.mapRenderer.movePlayer(node.x, node.y, smooth);
    }
  }

  /**
   * Show the map scene
   */
  show() {
    this.isActive = true;
    this.container.style.display = 'block';
    this.updatePlayerPosition();

    if (this.dispatcher) {
      this.dispatcher.dispatch('MAP_SHOWN', {}, 'map-scene');
    }
  }

  /**
   * Hide the map scene
   */
  hide() {
    this.isActive = false;
    this.container.style.display = 'none';

    if (this.dispatcher) {
      this.dispatcher.dispatch('MAP_HIDDEN', {}, 'map-scene');
    }
  }

  /**
   * Check if map scene is currently active
   */
  isVisible() {
    return this.isActive && this.container.style.display !== 'none';
  }

  /**
   * Get current player position
   */
  getPlayerPosition() {
    return { ...this.gameState.playerPosition };
  }

  /**
   * Load a different map
   */
  loadMap(mapData) {
    if (mapData.backgroundImage) {
      this.mapRenderer.loadMap(mapData.backgroundImage, mapData.nodes);
    }

    // Reset player position
    this.updatePlayerPosition();
  }

  /**
   * Enable/disable player movement
   */
  setMovementEnabled(enabled) {
    // Could disable click handlers on map
    this.movementEnabled = enabled;
  }

  /**
   * Highlight a specific node
   */
  highlightNode(nodeId, highlight = true) {
    const element = this.mapRenderer.nodeElements.get(nodeId);
    if (element) {
      const circle = element.querySelector('circle');
      if (circle) {
        if (highlight) {
          circle.setAttribute('stroke', '#ffff00');
          circle.setAttribute('stroke-width', '4');
        } else {
          const node = getNodeById(nodeId);
          const nodeType = node ? window.NODE_TYPES?.[node.type] : null;
          circle.setAttribute('stroke', '#ffffff');
          circle.setAttribute('stroke-width', nodeType ? '3' : '2');
        }
      }
    }
  }

  /**
   * Get map renderer instance (for advanced operations)
   */
  getRenderer() {
    return this.mapRenderer;
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.mapRenderer) {
      this.mapRenderer.destroy();
    }

    if (this.dispatcher) {
      this.dispatcher.subscribe('MODE_CHANGE', this.handleModeChange.bind(this));
      this.dispatcher.subscribe('GAME_LOAD', this.handleGameLoad.bind(this));
    }
  }
}

// ============================================
// Integration helpers
// ============================================

/**
 * Create and initialize map scene for the game
 */
export function createMapScene(container, gameState, dispatcher) {
  return new MapScene(container, gameState, dispatcher);
}

/**
 * Initialize map system in game
 */
export function initializeMapSystem(gameState, dispatcher) {
  // Add player position to game state if not present
  if (!gameState.playerPosition) {
    gameState.playerPosition = { x: 50, y: 150 }; // Portsmouth
  }

  // Listen for overworld mode changes
  if (dispatcher) {
    dispatcher.subscribe('MODE_CHANGE', (event) => {
      if (event.to === 'overworld') {
        // Map mode activated
        console.log('Map system: Overworld mode activated');
      }
    });
  }

  console.log('Map system initialized');
}

// ============================================
// Backward Compatibility
// ============================================

if (typeof window !== 'undefined') {
  window.MapScene = MapScene;
  window.createMapScene = createMapScene;
  window.initializeMapSystem = initializeMapSystem;
}
