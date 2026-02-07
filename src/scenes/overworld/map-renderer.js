// ============================================
// Man-at-Arms Map Renderer (DOM-based)
// SVG/CSS-based map rendering for Phase 4
// ============================================

import { MAP_NODES, NODE_TYPES, findNearestNode } from './nodes.js';

/**
 * DOM-based map renderer using SVG for scalable vector graphics
 * Provides player movement, node interaction, and event handling
 */
export class MapRenderer {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      width: options.width || 800,
      height: options.height || 600,
      backgroundImage: options.backgroundImage || '/assets/map-background.jpg',
      playerIcon: options.playerIcon || '👤',
      ...options
    };

    this.svg = null;
    this.playerElement = null;
    this.nodeElements = new Map();
    this.eventListeners = new Map();

    this.playerPosition = { x: 50, y: 150 }; // Start at Portsmouth
    this.scale = 1;
    this.offset = { x: 0, y: 0 };

    this.initialize();
  }

  /**
   * Initialize the SVG map structure
   */
  initialize() {
    // Create SVG element
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', this.options.width);
    this.svg.setAttribute('height', this.options.height);
    this.svg.setAttribute('viewBox', `0 0 ${this.options.width} ${this.options.height}`);
    this.svg.style.cssText = `
      border: 2px solid #d4af37;
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      cursor: crosshair;
    `;

    // Add background image if available
    if (this.options.backgroundImage) {
      const backgroundImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      backgroundImage.setAttribute('href', this.options.backgroundImage);
      backgroundImage.setAttribute('width', this.options.width);
      backgroundImage.setAttribute('height', this.options.height);
      backgroundImage.setAttribute('opacity', '0.3');
      this.svg.appendChild(backgroundImage);
    }

    // Add click handler for movement
    this.svg.addEventListener('click', this.handleMapClick.bind(this));

    // Clear container and add SVG
    this.container.innerHTML = '';
    this.container.appendChild(this.svg);

    // Render initial map
    this.renderMap();
  }

  /**
   * Render the complete map with nodes and player
   */
  renderMap() {
    // Clear existing nodes
    this.nodeElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.nodeElements.clear();

    // Remove existing player
    if (this.playerElement && this.playerElement.parentNode) {
      this.playerElement.parentNode.removeChild(this.playerElement);
    }

    // Render nodes
    MAP_NODES.forEach(node => {
      this.renderNode(node);
    });

    // Render player
    this.renderPlayer();
  }

  /**
   * Render a single map node
   */
  renderNode(node) {
    const nodeType = NODE_TYPES[node.type] || NODE_TYPES.city;
    const screenX = node.x * this.scale + this.offset.x;
    const screenY = node.y * this.scale + this.offset.y;

    // Create node group
    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodeGroup.setAttribute('class', 'map-node');
    nodeGroup.setAttribute('data-node-id', node.id);
    nodeGroup.style.cursor = 'pointer';

    // Node circle/background
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', screenX);
    circle.setAttribute('cy', screenY);
    circle.setAttribute('r', nodeType.size);
    circle.setAttribute('fill', nodeType.color);
    circle.setAttribute('stroke', '#ffffff');
    circle.setAttribute('stroke-width', '2');
    circle.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';

    // Node icon/text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', screenX);
    text.setAttribute('y', screenY + 4);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', nodeType.size * 0.8);
    text.setAttribute('fill', '#ffffff');
    text.style.pointerEvents = 'none';
    text.textContent = nodeType.icon;

    // Tooltip title
    nodeGroup.setAttribute('title', `${node.name}\n${node.description}`);

    // Event handlers
    nodeGroup.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleNodeClick(node, e);
    });

    nodeGroup.addEventListener('mouseenter', () => this.handleNodeHover(node, true));
    nodeGroup.addEventListener('mouseleave', () => this.handleNodeHover(node, false));

    // Assemble node
    nodeGroup.appendChild(circle);
    nodeGroup.appendChild(text);
    this.svg.appendChild(nodeGroup);

    this.nodeElements.set(node.id, nodeGroup);
  }

  /**
   * Render the player token
   */
  renderPlayer() {
    const screenX = this.playerPosition.x * this.scale + this.offset.x;
    const screenY = this.playerPosition.y * this.scale + this.offset.y;

    // Create player group
    this.playerElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.playerElement.setAttribute('class', 'player-token');

    // Player circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', screenX);
    circle.setAttribute('cy', screenY);
    circle.setAttribute('r', '12');
    circle.setAttribute('fill', '#ff6b6b');
    circle.setAttribute('stroke', '#ffffff');
    circle.setAttribute('stroke-width', '3');
    circle.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))';

    // Player icon
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', screenX);
    text.setAttribute('y', screenY + 4);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '14');
    text.setAttribute('fill', '#ffffff');
    text.style.pointerEvents = 'none';
    text.textContent = this.options.playerIcon;

    // Assemble player
    this.playerElement.appendChild(circle);
    this.playerElement.appendChild(text);
    this.svg.appendChild(this.playerElement);
  }

  /**
   * Handle map click (move player to location)
   */
  handleMapClick(event) {
    const rect = this.svg.getBoundingClientRect();
    const x = event.clientX - rect.left - this.offset.x;
    const y = event.clientY - rect.top - this.offset.y;

    const worldX = x / this.scale;
    const worldY = y / this.scale;

    this.movePlayer(worldX, worldY);
  }

  /**
   * Handle node click
   */
  handleNodeClick(node, event) {
    // Move player to node
    this.movePlayer(node.x, node.y);

    // Emit node click event
    this.emit('nodeClick', { node, event });
  }

  /**
   * Handle node hover effects
   */
  handleNodeHover(node, isHovering) {
    const element = this.nodeElements.get(node.id);
    if (!element) return;

    const circle = element.querySelector('circle');
    if (circle) {
      if (isHovering) {
        circle.setAttribute('r', (NODE_TYPES[node.type]?.size || 12) * 1.2);
        circle.setAttribute('stroke-width', '3');
      } else {
        circle.setAttribute('r', NODE_TYPES[node.type]?.size || 12);
        circle.setAttribute('stroke-width', '2');
      }
    }

    if (isHovering) {
      this.emit('nodeHover', { node, isHovering: true });
    } else {
      this.emit('nodeHover', { node, isHovering: false });
    }
  }

  /**
   * Move player to new position
   */
  movePlayer(x, y, smooth = true) {
    // Check if movement is valid (within map bounds)
    if (x < 0 || x > this.options.width || y < 0 || y > this.options.height) {
      return false;
    }

    const oldPosition = { ...this.playerPosition };
    this.playerPosition = { x, y };

    // Check for node proximity
    const nearestNode = findNearestNode(x, y, 30); // 30px proximity
    if (nearestNode) {
      this.emit('enterNode', { node: nearestNode, position: this.playerPosition });
    }

    // Update visual position
    if (this.playerElement) {
      const screenX = x * this.scale + this.offset.x;
      const screenY = y * this.scale + this.offset.y;

      if (smooth) {
        this.playerElement.style.transition = 'all 0.5s ease';
      }

      // Update circle position
      const circle = this.playerElement.querySelector('circle');
      const text = this.playerElement.querySelector('text');

      if (circle) {
        circle.setAttribute('cx', screenX);
        circle.setAttribute('cy', screenY);
      }

      if (text) {
        text.setAttribute('x', screenX);
        text.setAttribute('y', screenY + 4);
      }
    }

    this.emit('playerMove', {
      from: oldPosition,
      to: this.playerPosition,
      smooth
    });

    return true;
  }

  /**
   * Set player position instantly (no animation)
   */
  setPlayerPosition(x, y) {
    return this.movePlayer(x, y, false);
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  emit(event, data) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`MapRenderer event error for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Load new map background
   */
  loadMap(imagePath, nodes = MAP_NODES) {
    this.options.backgroundImage = imagePath;
    // Update background image if SVG exists
    if (this.svg) {
      const backgroundImage = this.svg.querySelector('image');
      if (backgroundImage) {
        backgroundImage.setAttribute('href', imagePath);
      }
    }
    // Could extend to load custom node sets
  }

  /**
   * Zoom map (for future enhancement)
   */
  zoom(factor) {
    this.scale = Math.max(0.5, Math.min(2, factor));
    this.renderMap();
  }

  /**
   * Pan map (for future enhancement)
   */
  pan(deltaX, deltaY) {
    this.offset.x += deltaX;
    this.offset.y += deltaY;
    this.renderMap();
  }

  /**
   * Destroy the map renderer
   */
  destroy() {
    if (this.svg && this.svg.parentNode) {
      this.svg.parentNode.removeChild(this.svg);
    }
    this.eventListeners.clear();
  }
}

// ============================================
// Backward Compatibility
// ============================================

if (typeof window !== 'undefined') {
  window.MapRenderer = MapRenderer;
}
