// ============================================
// Man-at-Arms Map Nodes
// Historical locations and encounter points
// ============================================

/**
 * Map node definitions for the 1346-1347 campaign
 * Based on historical Hundred Years' War locations
 */

export const MAP_NODES = [
  // England starting locations
  {
    id: 'portsmouth',
    name: 'Portsmouth',
    x: 50,
    y: 150,
    type: 'city',
    encounter: 'portsmouth_departure',
    description: 'Major port city and naval base',
    region: 'England',
    available: true
  },

  // Normandy campaign
  {
    id: 'calais',
    name: 'Calais',
    x: 100,
    y: 200,
    type: 'siege',
    encounter: 'calais_siege',
    description: 'Strategic port city under siege',
    region: 'France',
    available: true
  },

  {
    id: 'cret',
    name: 'Crécy',
    x: 150,
    y: 180,
    type: 'battle',
    encounter: 'battle_crecy',
    description: 'Site of the decisive battle',
    region: 'France',
    available: true
  },

  {
    id: 'caen',
    name: 'Caen',
    x: 120,
    y: 160,
    type: 'city',
    encounter: 'caen_occupation',
    description: 'Norman city under English control',
    region: 'France',
    available: true
  },

  {
    id: 'rouen',
    name: 'Rouen',
    x: 140,
    y: 140,
    type: 'city',
    encounter: 'rouen_campaign',
    description: 'Major Norman city',
    region: 'France',
    available: true
  },

  // Loire campaign (Poitiers direction)
  {
    id: 'tours',
    name: 'Tours',
    x: 200,
    y: 220,
    type: 'city',
    encounter: 'tours_advance',
    description: 'Strategic city on the Loire',
    region: 'France',
    available: true
  },

  {
    id: 'poitiers',
    name: 'Poitiers',
    x: 220,
    y: 240,
    type: 'battle',
    encounter: 'poitiers_battle',
    description: 'Site of the great victory',
    region: 'France',
    available: true
  },

  // Return routes
  {
    id: 'brest',
    name: 'Brest',
    x: 80,
    y: 120,
    type: 'port',
    encounter: 'brest_departure',
    description: 'Atlantic port for return voyage',
    region: 'France',
    available: true
  },

  // Random encounter locations
  {
    id: 'normandy_road',
    name: 'Norman Road',
    x: 130,
    y: 170,
    type: 'road',
    encounter: 'random_encounter',
    description: 'Travel route through Normandy',
    region: 'France',
    available: true
  },

  {
    id: 'forest_path',
    name: 'Forest Path',
    x: 160,
    y: 200,
    type: 'forest',
    encounter: 'random_encounter',
    description: 'Woods near Crécy battlefield',
    region: 'France',
    available: true
  }
];

/**
 * Node type definitions
 */
export const NODE_TYPES = {
  city: {
    icon: '🏰',
    color: '#d4af37',
    size: 12,
    description: 'Major city or settlement'
  },
  battle: {
    icon: '⚔️',
    color: '#ff4444',
    size: 14,
    description: 'Battlefield or combat site'
  },
  siege: {
    icon: '🏰',
    color: '#ffaa00',
    size: 16,
    description: 'Siege location'
  },
  port: {
    icon: '⚓',
    color: '#4444ff',
    size: 12,
    description: 'Port or harbor'
  },
  road: {
    icon: '🛣️',
    color: '#888888',
    size: 8,
    description: 'Travel route'
  },
  forest: {
    icon: '🌲',
    color: '#228b22',
    size: 10,
    description: 'Forest or wilderness'
  }
};

/**
 * Get node by ID
 */
export function getNodeById(nodeId) {
  return MAP_NODES.find(node => node.id === nodeId);
}

/**
 * Get nodes by type
 */
export function getNodesByType(type) {
  return MAP_NODES.filter(node => node.type === type);
}

/**
 * Get nodes in region
 */
export function getNodesInRegion(region) {
  return MAP_NODES.filter(node => node.region === region);
}

/**
 * Get available nodes (not locked by story progress)
 */
export function getAvailableNodes() {
  return MAP_NODES.filter(node => node.available);
}

/**
 * Calculate distance between two nodes
 */
export function getDistanceBetweenNodes(nodeId1, nodeId2) {
  const node1 = getNodeById(nodeId1);
  const node2 = getNodeById(nodeId2);

  if (!node1 || !node2) return Infinity;

  const dx = node1.x - node2.x;
  const dy = node1.y - node2.y;

  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Find nearest node to coordinates
 */
export function findNearestNode(x, y, maxDistance = 50) {
  let nearest = null;
  let minDistance = maxDistance;

  for (const node of MAP_NODES) {
    const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = node;
    }
  }

  return nearest;
}

/**
 * Get connected nodes (for pathfinding)
 */
export function getConnectedNodes(nodeId) {
  // Simplified: return all nodes within reasonable distance
  // In a full implementation, this would use actual map connectivity
  const sourceNode = getNodeById(nodeId);
  if (!sourceNode) return [];

  return MAP_NODES.filter(node => {
    if (node.id === nodeId) return false;
    const distance = getDistanceBetweenNodes(nodeId, node.id);
    return distance < 100; // Arbitrary connection threshold
  });
}
