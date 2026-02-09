// ============================================
// Ink Tag Router System
// Handles standardized Ink tags for writers to extend behavior
// ============================================

import { EVENT_TYPES } from '../core/dispatcher.js';

/**
 * Tag Router - Processes Ink tags and routes them to appropriate handlers
 */
export class TagRouter {
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
    this.tagHandlers = new Map();
    this.setupDefaultHandlers();
  }

  /**
   * Setup default tag handlers for common conventions
   */
  setupDefaultHandlers() {
    // Speaker tag: #speaker:merchant
    this.registerHandler('speaker', (value) => {
      this.dispatcher.dispatch('SPEAKER_CHANGE', { speaker: value });
    });

    // Portrait tag: #portrait:merchant_happy or #portrait:merchant_neutral
    this.registerHandler('portrait', (value) => {
      const [character, emotion] = value.split('_');
      this.dispatcher.dispatch('PORTRAIT_UPDATE_REQUEST', {
        character: character,
        emotion: emotion || 'neutral'
      });
    });

    // Sound effect tag: #sfx:coin
    this.registerHandler('sfx', (value) => {
      this.dispatcher.dispatch('PLAY_SOUND_EFFECT', { sound: value });
    });

    // Music tag: #music:market_theme
    this.registerHandler('music', (value) => {
      this.dispatcher.dispatch('PLAY_MUSIC', { track: value });
    });

    // Flag setting tag: #setflag:met_merchant=true
    this.registerHandler('setflag', (value) => {
      const [flagName, flagValue] = value.split('=');
      const parsedValue = flagValue === 'true' ? true : 
                        flagValue === 'false' ? false : 
                        flagValue;
      
      this.dispatcher.dispatch('SET_FLAG', {
        flag: flagName,
        value: parsedValue
      });
    });

    // Relationship change tag: #relationship:merchant+5
    this.registerHandler('relationship', (value) => {
      const match = value.match(/^([a-zA-Z_]+)([+-]\d+)$/);
      if (match) {
        const [, character, change] = match;
        const amount = parseInt(change);
        
        this.dispatcher.dispatch('RELATIONSHIP_CHANGE', {
          character: character,
          delta: amount
        });
      }
    });

    // Stat change tag: #stat:wealth+10
    this.registerHandler('stat', (value) => {
      const match = value.match(/^([a-zA-Z_]+)([+-]\d+)$/);
      if (match) {
        const [, stat, change] = match;
        const amount = parseInt(change);
        
        this.dispatcher.dispatch('STAT_CHANGE', {
          stat: stat,
          delta: amount
        });
      }
    });

    // Item tag: #item:add:sword or #item:remove:coin
    this.registerHandler('item', (value) => {
      const [action, itemName] = value.split(':');
      
      this.dispatcher.dispatch('ITEM_CHANGE', {
        action: action,
        item: itemName
      });
    });

    // Quest tag: #quest:start:merchant_delivery
    this.registerHandler('quest', (value) => {
      const [action, questId] = value.split(':');
      
      this.dispatcher.dispatch('QUEST_UPDATE', {
        action: action,
        quest: questId
      });
    });

    // Scene tag: #scene:market or #scene:combat
    this.registerHandler('scene', (value) => {
      this.dispatcher.dispatch('SCENE_CHANGE', { scene: value });
    });

    // Wait tag: #wait:2.5 (wait 2.5 seconds)
    this.registerHandler('wait', (value) => {
      const duration = parseFloat(value) * 1000; // Convert to milliseconds
      this.dispatcher.dispatch('WAIT_REQUEST', { duration });
    });

    // Animation tag: #anim:shake or #anim:fade_in
    this.registerHandler('anim', (value) => {
      this.dispatcher.dispatch('PLAY_ANIMATION', { animation: value });
    });

    // Conditional tag: #if:met_merchant then #show:advanced_options
    this.registerHandler('if', (value) => {
      // This would be handled by the Ink story itself, but we can log for debugging
      console.log(`Conditional tag detected: ${value}`);
    });
  }

  /**
   * Register a custom tag handler
   * @param {string} tagName - The tag name (without #)
   * @param {Function} handler - Function to handle the tag value
   */
  registerHandler(tagName, handler) {
    this.tagHandlers.set(tagName.toLowerCase(), handler);
  }

  /**
   * Process tags from Ink content
   * @param {Array} tags - Array of tag strings from Ink
   */
  processTags(tags) {
    if (!tags || !Array.isArray(tags)) return;

    tags.forEach(tag => {
      this.processTag(tag);
    });
  }

  /**
   * Process a single tag
   * @param {string} tag - Tag string in format #tag:value or #tag
   */
  processTag(tag) {
    // Remove leading # and trim whitespace
    const cleanTag = tag.replace(/^#/, '').trim();
    
    // Split tag name and value
    const colonIndex = cleanTag.indexOf(':');
    
    if (colonIndex === -1) {
      // Tag without value (e.g., #pause)
      this.handleTagWithoutValue(cleanTag);
    } else {
      // Tag with value (e.g., #speaker:merchant)
      const tagName = cleanTag.substring(0, colonIndex).toLowerCase();
      const tagValue = cleanTag.substring(colonIndex + 1).trim();
      
      this.handleTagWithValue(tagName, tagValue);
    }
  }

  /**
   * Handle tag without value
   * @param {string} tagName - Tag name
   */
  handleTagWithoutValue(tagName) {
    const handler = this.tagHandlers.get(tagName);
    if (handler) {
      handler(null);
    } else {
      console.warn(`Unknown tag without value: #${tagName}`);
    }
  }

  /**
   * Handle tag with value
   * @param {string} tagName - Tag name
   * @param {string} tagValue - Tag value
   */
  handleTagWithValue(tagName, tagValue) {
    const handler = this.tagHandlers.get(tagName);
    if (handler) {
      try {
        handler(tagValue);
      } catch (error) {
        console.error(`Error handling tag #${tagName}:${tagValue}:`, error);
      }
    } else {
      console.warn(`Unknown tag: #${tagName}:${tagValue}`);
    }
  }

  /**
   * Get list of registered tag handlers
   */
  getRegisteredTags() {
    return Array.from(this.tagHandlers.keys());
  }

  /**
   * Validate tag format
   * @param {string} tag - Tag string to validate
   */
  validateTag(tag) {
    if (!tag || typeof tag !== 'string') {
      return { valid: false, error: 'Tag must be a non-empty string' };
    }

    if (!tag.startsWith('#')) {
      return { valid: false, error: 'Tag must start with #' };
    }

    const cleanTag = tag.replace(/^#/, '').trim();
    if (cleanTag.length === 0) {
      return { valid: false, error: 'Tag cannot be empty' };
    }

    // Check for valid characters (letters, numbers, underscore, colon, hyphen, plus, equals)
    const validPattern = /^[a-zA-Z0-9_:\-+=]+$/;
    if (!validPattern.test(cleanTag)) {
      return { valid: false, error: 'Tag contains invalid characters' };
    }

    return { valid: true };
  }

  /**
   * Get documentation for supported tags
   */
  getTagDocumentation() {
    return {
      speaker: '#speaker:merchant - Sets the current speaker',
      portrait: '#portrait:merchant_happy - Changes character portrait emotion',
      sfx: '#sfx:coin - Plays a sound effect',
      music: '#music:market_theme - Plays background music',
      setflag: '#setflag:met_merchant=true - Sets a game flag',
      relationship: '#relationship:merchant+5 - Changes relationship value',
      stat: '#stat:wealth+10 - Changes player stat',
      item: '#item:add:sword - Adds or removes inventory item',
      quest: '#quest:start:delivery - Updates quest status',
      scene: '#scene:market - Changes game scene',
      wait: '#wait:2.5 - Waits for specified seconds',
      anim: '#anim:shake - Plays UI animation'
    };
  }
}

/**
 * Create and initialize tag router
 */
export function createTagRouter(dispatcher) {
  return new TagRouter(dispatcher);
}
