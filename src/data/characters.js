// ============================================
// Character Definitions
// Character data and portrait configurations
// ============================================

/**
 * Character definitions for dialog system
 */
export const CHARACTERS = {
  // Main patron characters
  james_olooney: {
    id: 'james_olooney',
    name: 'Sir James "The Reaver" de Looney',
    title: 'Free Company Captain',
    description: 'A brutal but effective mercenary captain known for his ruthless tactics and questionable morality.',
    portrait: {
      basePath: 'portraits/james',
      emotions: {
        neutral: 'neutral.png',
        happy: 'smirk.png',
        angry: 'furious.png',
        sad: 'disappointed.png',
        surprised: 'intrigued.png',
        fearful: 'wary.png',
        contempt: 'disgusted.png'
      },
      defaultEmotion: 'neutral'
    },
    personality: {
      traits: ['ruthless', 'pragmatic', 'opportunistic', 'charismatic'],
      speechPattern: 'direct and blunt, uses military terminology',
      voice: 'gravelly, confident'
    },
    relationships: {
      default: 0,
      max: 100,
      min: -100
    },
    dialogTopics: ['military_strategy', 'loot', 'reputation', 'combat']
  },

  lord_david: {
    id: 'lord_david',
    name: 'Sir David de Montfort',
    title: 'Noble Lord',
    description: 'A compassionate but timid noble who values the lives of his men above all else.',
    portrait: {
      basePath: 'portraits/david',
      emotions: {
        neutral: 'neutral.png',
        happy: 'gentle_smile.png',
        angry: 'stern.png',
        sad: 'worried.png',
        surprised: 'shocked.png',
        fearful: 'anxious.png',
        contempt: 'disappointed.png'
      },
      defaultEmotion: 'neutral'
    },
    personality: {
      traits: ['compassionate', 'cautious', 'honorable', 'indecisive'],
      speechPattern: 'formal and polite, uses noble language',
      voice: 'soft, measured'
    },
    relationships: {
      default: 0,
      max: 100,
      min: -100
    },
    dialogTopics: ['honor', 'duty', 'safety', 'strategy']
  },

  duke_caley: {
    id: 'duke_caley',
    name: 'Baron Caley of Tournai',
    title: 'Feudal Lord',
    description: 'An ambitious and indifferent noble who sees men as tools for achieving glory.',
    portrait: {
      basePath: 'portraits/baroncaley',
      emotions: {
        neutral: 'neutral.png',
        happy: 'satisfied.png',
        angry: 'imperious.png',
        sad: 'impatient.png',
        surprised: 'intrigued.png',
        fearful: 'annoyed.png',
        contempt: 'scornful.png'
      },
      defaultEmotion: 'neutral'
    },
    personality: {
      traits: ['ambitious', 'arrogant', 'strategic', 'indifferent'],
      speechPattern: 'authoritative and commanding',
      voice: 'booming, confident'
    },
    relationships: {
      default: 0,
      max: 100,
      min: -100
    },
    dialogTopics: ['glory', 'wealth', 'power', 'conquest']
  },

  count_charles: {
    id: 'count_charles',
    name: 'Count Charles "The Grim" of Suffolk',
    title: 'Veteran Commander',
    description: 'A battle-hardened veteran whose cynicism is matched only by his experience.',
    portrait: {
      basePath: 'portraits/charles',
      emotions: {
        neutral: 'neutral.png',
        happy: 'rare_smile.png',
        angry: 'furious.png',
        sad: 'melancholy.png',
        surprised: 'surprised.png',
        fearful: 'concerned.png',
        contempt: 'cynical.png'
      },
      defaultEmotion: 'neutral'
    },
    personality: {
      traits: ['cynical', 'experienced', 'harsh', 'protective'],
      speechPattern: 'gruff and direct, uses military slang',
      voice: 'rough, weary'
    },
    relationships: {
      default: 0,
      max: 100,
      min: -100
    },
    dialogTopics: ['war', 'survival', 'tactics', 'reality']
  },

  ashkhan: {
    id: 'ashkhan',
    name: 'Ashkhan of Mamluk Guard',
    title: 'Mercenary Captain',
    description: 'A disciplined and respected mercenary commander from Levant with tactical expertise.',
    portrait: {
      basePath: 'portraits/cook', 
      emotions: {
        neutral: 'neutral.png',
        happy: 'smile.png',
        angry: 'frown.png',
        sad: 'worried.png',
        surprised: 'surprised.png',
        fearful: 'scared.png',
        contempt: 'annoyed.png'
      },
      defaultEmotion: 'neutral'
    },
    personality: {
      traits: ['disciplined', 'wise', 'strategic', 'respectful'],
      speechPattern: 'measured and thoughtful, uses tactical terminology',
      voice: 'calm, authoritative'
    },
    relationships: {
      default: 0,
      max: 100,
      min: -100
    },
    dialogTopics: ['tactics', 'discipline', 'strategy', 'honor']
  },

  // NPC characters for encounters
  merchant: {
    id: 'merchant',
    name: 'Traveling Merchant',
    title: 'Trader',
    description: 'A shrewd merchant who deals in goods and information.',
    portrait: {
      basePath: 'portraits/merchant',
      emotions: {
        neutral: 'neutral.svg',
        happy: 'happy.svg'
      },
      defaultEmotion: 'neutral'
    },
    personality: {
      traits: ['shrewd', 'opportunistic', 'talkative', 'greedy'],
      speechPattern: 'friendly but business-focused',
      voice: 'pleasant, persuasive'
    },
    relationships: {
      default: 0,
      max: 50,
      min: -50
    },
    dialogTopics: ['trade', 'rumors', 'prices', 'goods']
  },

  peasant: {
    id: 'peasant',
    name: 'Local Peasant',
    title: 'Commoner',
    description: 'A simple peasant trying to survive the times.',
    portrait: {
      basePath: 'portraits/granny', // Using granny portrait as placeholder
      emotions: {
        neutral: 'neutral.png',
        happy: 'smile.png',
        angry: 'frown.png',
        sad: 'worried.png',
        surprised: 'surprised.png',
        fearful: 'scared.png',
        contempt: 'annoyed.png'
      },
      defaultEmotion: 'neutral'
    },
    personality: {
      traits: ['simple', 'survival-focused', 'cautious', 'resilient'],
      speechPattern: 'simple and direct',
      voice: 'rough, hesitant'
    },
    relationships: {
      default: 0,
      max: 30,
      min: -30
    },
    dialogTopics: ['survival', 'local_news', 'fear', 'hope']
  },

  patrol_guard: {
    id: 'patrol_guard',
    name: 'Patrol Guard',
    title: 'Royal Guard',
    description: 'A soldier tasked with maintaining order in the region.',
    portrait: {
      basePath: 'portraits/blacksmith', // Using blacksmith portrait as placeholder
      emotions: {
        neutral: 'neutral.png',
        happy: 'smile.png',
        angry: 'frown.png',
        sad: 'worried.png',
        surprised: 'surprised.png',
        fearful: 'scared.png',
        contempt: 'annoyed.png'
      },
      defaultEmotion: 'neutral'
    },
    personality: {
      traits: ['authoritative', 'suspicious', 'dutiful', 'harsh'],
      speechPattern: 'official and commanding',
      voice: 'loud, clear'
    },
    relationships: {
      default: 0,
      max: 40,
      min: -40
    },
    dialogTopics: ['authority', 'law', 'suspicion', 'orders']
  },

  bandit_leader: {
    id: 'bandit_leader',
    name: 'Bandit Leader',
    title: 'Outlaw',
    description: 'A dangerous criminal who preys on travelers.',
    portrait: {
      basePath: 'portraits/bandit_leader',
      emotions: {
        neutral: 'neutral.svg',
        happy: 'cruel_smile.svg'
      },
      defaultEmotion: 'neutral'
    },
    personality: {
      traits: ['cruel', 'opportunistic', 'desperate', 'intimidating'],
      speechPattern: 'threatening and direct',
      voice: 'harsh, menacing'
    },
    relationships: {
      default: -20,
      max: 20,
      min: -100
    },
    dialogTopics: ['threats', 'demands', 'violence', 'survival']
  }
};

/**
 * Character relationship levels
 */
export const RELATIONSHIP_LEVELS = {
  hated: { min: -100, max: -50, description: 'Hated' },
  hostile: { min: -50, max: -20, description: 'Hostile' },
  unfriendly: { min: -20, max: -5, description: 'Unfriendly' },
  neutral: { min: -5, max: 5, description: 'Neutral' },
  friendly: { min: 5, max: 20, description: 'Friendly' },
  ally: { min: 20, max: 50, description: 'Ally' },
  friend: { min: 50, max: 80, description: 'Friend' },
  loyal: { min: 80, max: 100, description: 'Loyal' }
};

/**
 * Get character by ID
 */
export function getCharacter(characterId) {
  return CHARACTERS[characterId] || null;
}

/**
 * Get relationship level description
 */
export function getRelationshipLevel(value) {
  for (const [level, config] of Object.entries(RELATIONSHIP_LEVELS)) {
    if (value >= config.min && value <= config.max) {
      return config.description;
    }
  }
  return 'Unknown';
}

/**
 * Get all patron characters
 */
export function getPatronCharacters() {
  return [
    CHARACTERS.james_olooney,
    CHARACTERS.lord_david,
    CHARACTERS.duke_caley,
    CHARACTERS.count_charles,
    CHARACTERS.ashkhan
  ];
}

/**
 * Get all NPC characters
 */
export function getNPCCharacters() {
  return [
    CHARACTERS.merchant,
    CHARACTERS.peasant,
    CHARACTERS.patrol_guard,
    CHARACTERS.bandit_leader
  ];
}

/**
 * Character dialog templates
 */
export const DIALOG_TEMPLATES = {
  greeting: {
    friendly: ["Greetings, friend.", "Well met!", "Good day to you."],
    neutral: ["Hello.", "Greetings.", "Well met."],
    hostile: ["What do you want?", "State your business.", "Speak quickly."]
  },
  farewell: {
    friendly: ["Farewell, friend.", "Until we meet again.", "Safe travels."],
    neutral: ["Goodbye.", "Farewell.", "Until next time."],
    hostile: ["Get out of my sight.", "Leave now.", "Don't come back."]
  },
  trade: {
    interested: ["I have some fine goods for sale.", "Looking to buy or sell?", "Let's talk business."],
    neutral: ["What do you need?", "I might have what you're looking for.", "Show me your coin."],
    unwilling: ["I'm not trading right now.", "Come back later.", "I have nothing for you."]
  }
};

// ============================================
// Backward Compatibility
// ============================================

if (typeof window !== 'undefined') {
  window.CHARACTERS = CHARACTERS;
  window.RELATIONSHIP_LEVELS = RELATIONSHIP_LEVELS;
  window.getCharacter = getCharacter;
  window.getRelationshipLevel = getRelationshipLevel;
  window.getPatronCharacters = getPatronCharacters;
  window.getNPCCharacters = getNPCCharacters;
  window.DIALOG_TEMPLATES = DIALOG_TEMPLATES;
}
