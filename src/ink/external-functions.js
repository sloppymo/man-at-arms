// ============================================
// External Functions Registry
// Centralized definitions for all Ink.js external function bindings
// Used by DialogueService for clean separation
// ============================================

/**
 * External function definitions for Ink.js integration
 * These define the contract between Ink stories and the game engine
 */
export const EXTERNAL_FUNCTIONS = {
  // Stat and attribute operations
  changeStat: {
    description: 'Change a character stat by delta value',
    parameters: ['stat: string', 'delta: number'],
    returns: 'boolean',
    category: 'stats'
  },

  applyStatChange: {
    description: 'Apply stat change with validation and clamping',
    parameters: ['stat: string', 'amount: number', 'opts: object'],
    returns: 'number',
    category: 'stats'
  },

  getEffectiveStat: {
    description: 'Get effective stat value including equipment modifiers',
    parameters: ['stat: string'],
    returns: 'number',
    category: 'stats'
  },

  // Currency and economy
  formatCurrency: {
    description: 'Format pence value into currency string',
    parameters: ['pence: number'],
    returns: 'string',
    category: 'economy'
  },

  // Conditions and status effects
  addCondition: {
    description: 'Add a condition to the character',
    parameters: ['name: string', 'type: string', 'duration: number'],
    returns: 'void',
    category: 'conditions'
  },

  removeCondition: {
    description: 'Remove a condition from the character',
    parameters: ['name: string'],
    returns: 'void',
    category: 'conditions'
  },

  hasCondition: {
    description: 'Check if character has a specific condition',
    parameters: ['name: string'],
    returns: 'boolean',
    category: 'conditions'
  },

  // Combat system
  triggerCombat: {
    description: 'Trigger combat encounter with enemy',
    parameters: ['enemyId: string'],
    returns: 'Promise',
    category: 'combat'
  },

  triggerSkirmish: {
    description: 'Trigger skirmish encounter',
    parameters: ['skirmishType: string'],
    returns: 'Promise',
    category: 'combat'
  },

  // User interface
  showNotification: {
    description: 'Show notification to user',
    parameters: ['title: string', 'message: string', 'type: string'],
    returns: 'void',
    category: 'ui'
  },

  openEquipment: {
    description: 'Open equipment management screen',
    parameters: [],
    returns: 'void',
    category: 'ui'
  },

  // Dice and resolution
  rollDice: {
    description: 'Roll a d10 with optional modifier',
    parameters: ['modifier: number'],
    returns: 'number',
    category: 'dice'
  },

  resolveAction: {
    description: 'Resolve skill check against difficulty',
    parameters: ['stat: string', 'difficulty: number', 'bonus: number'],
    returns: 'object',
    category: 'dice'
  },

  doCheck: {
    description: 'Perform skill check (boolean result for authoring)',
    parameters: ['stat: string', 'difficulty: number', 'bonus: number'],
    returns: 'boolean',
    category: 'dice'
  },

  // Equipment queries
  hasShieldEquipped: {
    description: 'Check if character has a shield equipped',
    parameters: [],
    returns: 'boolean',
    category: 'equipment'
  },

  // Chapter and story progress
  markChapterStarted: {
    description: 'Mark a chapter as started',
    parameters: ['chapterId: string'],
    returns: 'void',
    category: 'story'
  },

  markChapterCompleted: {
    description: 'Mark a chapter as completed',
    parameters: ['chapterId: string'],
    returns: 'void',
    category: 'story'
  }
};

/**
 * Get external functions by category
 */
export function getFunctionsByCategory(category) {
  return Object.entries(EXTERNAL_FUNCTIONS)
    .filter(([_, config]) => config.category === category)
    .map(([name, config]) => ({ name, ...config }));
}

/**
 * Get all external function names
 */
export function getAllFunctionNames() {
  return Object.keys(EXTERNAL_FUNCTIONS);
}

/**
 * Validate function signature
 */
export function validateFunctionSignature(name, parameters) {
  const definition = EXTERNAL_FUNCTIONS[name];
  if (!definition) {
    return { valid: false, error: `Unknown function: ${name}` };
  }

  // Basic parameter count validation
  const expectedCount = definition.parameters.length;
  const actualCount = parameters ? parameters.length : 0;

  if (actualCount !== expectedCount) {
    return {
      valid: false,
      error: `Function ${name} expects ${expectedCount} parameters, got ${actualCount}`
    };
  }

  return { valid: true };
}

/**
 * Get function documentation
 */
export function getFunctionDocs(name) {
  const definition = EXTERNAL_FUNCTIONS[name];
  if (!definition) return null;

  return {
    name,
    description: definition.description,
    parameters: definition.parameters,
    returns: definition.returns,
    category: definition.category,
    signature: `${name}(${definition.parameters.join(', ')}) -> ${definition.returns}`
  };
}

/**
 * Get all function documentation
 */
export function getAllFunctionDocs() {
  return Object.keys(EXTERNAL_FUNCTIONS).map(getFunctionDocs);
}

// ============================================
// Legacy compatibility mapping
// Map old function names to new standardized names
// ============================================

export const LEGACY_FUNCTION_MAPPING = {
  // Old names -> new names
  'statChange': 'changeStat',
  'modifyStat': 'applyStatChange',
  'checkStat': 'getEffectiveStat',
  'formatMoney': 'formatCurrency',
  'addStatus': 'addCondition',
  'removeStatus': 'removeCondition',
  'checkStatus': 'hasCondition',
  'startCombat': 'triggerCombat',
  'startSkirmish': 'triggerSkirmish',
  'notify': 'showNotification',
  'equipScreen': 'openEquipment',
  'diceRoll': 'rollDice',
  'skillCheck': 'resolveAction',
  'abilityCheck': 'doCheck',
  'hasShield': 'hasShieldEquipped',
  'chapterStart': 'markChapterStarted',
  'chapterEnd': 'markChapterCompleted'
};

/**
 * Get canonical function name
 */
export function getCanonicalName(functionName) {
  return LEGACY_FUNCTION_MAPPING[functionName] || functionName;
}

// ============================================
// Validation and testing
// ============================================

/**
 * Validate external function implementation
 */
export function validateFunctionImplementation(name, implementation) {
  const definition = EXTERNAL_FUNCTIONS[name];
  if (!definition) {
    return { valid: false, error: `Unknown function: ${name}` };
  }

  if (typeof implementation !== 'function') {
    return { valid: false, error: `Implementation must be a function` };
  }

  return { valid: true };
}

/**
 * Test function binding on a story instance
 */
export function testFunctionBinding(story, functionName) {
  if (!story || !story.BindExternalFunction) {
    return { success: false, error: 'Invalid story instance' };
  }

  try {
    // Test binding (will fail if function doesn't exist in registry)
    const definition = EXTERNAL_FUNCTIONS[functionName];
    if (!definition) {
      return { success: false, error: `Function not in registry: ${functionName}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// Backward Compatibility
// ============================================

if (typeof window !== 'undefined') {
  window.EXTERNAL_FUNCTIONS = EXTERNAL_FUNCTIONS;
  window.getFunctionsByCategory = getFunctionsByCategory;
  window.getAllFunctionNames = getAllFunctionNames;
  window.validateFunctionSignature = validateFunctionSignature;
  window.getFunctionDocs = getFunctionDocs;
  window.getAllFunctionDocs = getAllFunctionDocs;
  window.getCanonicalName = getCanonicalName;
  window.validateFunctionImplementation = validateFunctionImplementation;
  window.testFunctionBinding = testFunctionBinding;
}
