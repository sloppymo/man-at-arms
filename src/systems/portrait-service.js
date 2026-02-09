// ============================================
// Portrait Service - Ship Quality Version
// Character portrait management with emotion states and preloading
// ============================================

import { EVENT_TYPES } from '../core/dispatcher.js';

/**
 * Portrait Service class for managing character portraits
 */
export class PortraitService {
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
    this.portraits = new Map();
    this.currentPortrait = null;
    this.currentEmotion = 'neutral';
    this.loadedImages = new Map();
    this.preloadPromises = new Map();
    this.fallbackPortrait = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMxYTBmMDgiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOGI2OTE0Ij5Qb3J0cmFpdDwvdGV4dD48L3N2Zz4=';
    
    this.setupEventListeners();
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    this.dispatcher.subscribe('SHOW_PORTRAIT', (event) => {
      const { character, emotion } = event.payload;
      this.showPortrait(character, emotion);
    });

    this.dispatcher.subscribe('HIDE_PORTRAIT', () => {
      this.hidePortrait();
    });

    this.dispatcher.subscribe('UPDATE_PORTRAIT_EMOTION', (event) => {
      const { emotion } = event.payload;
      this.updateEmotion(emotion);
    });
  }

  /**
   * Register a character's portrait configuration
   * @param {string} characterId - Character identifier
   * @param {Object} portraitConfig - Portrait configuration
   */
  registerCharacter(characterId, portraitConfig) {
    this.portraits.set(characterId, portraitConfig);
    
    // Preload all emotion portraits for this character
    this.preloadCharacterPortraits(characterId, portraitConfig);
  }

  /**
   * Preload all portrait images for a character
   * @param {string} characterId - Character identifier
   * @param {Object} portraitConfig - Portrait configuration
   */
  preloadCharacterPortraits(characterId, portraitConfig) {
    const emotions = portraitConfig.emotions || {};
    const basePath = portraitConfig.basePath;
    
    // Create preload promises for all emotions
    const preloadPromises = [];
    
    Object.entries(emotions).forEach(([emotion, imagePath]) => {
      const fullPath = imagePath.startsWith('http') ? imagePath : `${basePath}/${imagePath}`;
      const promise = this.preloadImage(characterId, emotion, fullPath);
      preloadPromises.push(promise);
    });
    
    // Also preload default emotion if not already included
    const defaultEmotion = portraitConfig.defaultEmotion || 'neutral';
    if (!emotions[defaultEmotion]) {
      const defaultPath = `${basePath}/${defaultEmotion}.png`;
      const promise = this.preloadImage(characterId, defaultEmotion, defaultPath);
      preloadPromises.push(promise);
    }
    
    // Store combined promise
    this.preloadPromises.set(characterId, Promise.all(preloadPromises));
  }

  /**
   * Preload a single portrait image
   * @param {string} characterId - Character identifier
   * @param {string} emotion - Emotion identifier
   * @param {string} imagePath - Path to image
   */
  preloadImage(characterId, emotion, imagePath) {
    const cacheKey = `${characterId}_${emotion}`;
    
    // Return existing promise if already loading
    if (this.preloadPromises.has(cacheKey)) {
      return this.preloadPromises.get(cacheKey);
    }
    
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.loadedImages.set(cacheKey, img);
        console.log(`Preloaded portrait: ${cacheKey}`);
        resolve(img);
      };
      
      img.onerror = () => {
        console.warn(`Failed to load portrait: ${imagePath}, using fallback`);
        // Use fallback portrait on error
        const fallbackImg = new Image();
        fallbackImg.src = this.fallbackPortrait;
        this.loadedImages.set(cacheKey, fallbackImg);
        resolve(fallbackImg);
      };
      
      img.src = imagePath;
    });
    
    this.preloadPromises.set(cacheKey, promise);
    return promise;
  }

  /**
   * Wait for character portraits to finish preloading
   * @param {string} characterId - Character identifier
   */
  async waitForPreload(characterId) {
    const promise = this.preloadPromises.get(characterId);
    if (promise) {
      try {
        await promise;
        console.log(`All portraits preloaded for: ${characterId}`);
      } catch (error) {
        console.warn(`Some portraits failed to preload for ${characterId}:`, error);
      }
    }
  }

  /**
   * Get preloaded image for character and emotion
   * @param {string} characterId - Character identifier
   * @param {string} emotion - Emotion identifier
   */
  getPreloadedImage(characterId, emotion) {
    const cacheKey = `${characterId}_${emotion}`;
    return this.loadedImages.get(cacheKey) || null;
  }

  /**
   * Show character portrait
   * @param {string} characterId - Character identifier
   * @param {string} emotion - Emotion to display
   */
  async showPortrait(characterId, emotion = 'neutral') {
    const portraitConfig = this.portraits.get(characterId);
    if (!portraitConfig) {
      console.warn(`No portrait configuration found for character: ${characterId}`);
      return;
    }

    // Wait for preloading to complete
    await this.waitForPreload(characterId);

    this.currentPortrait = characterId;
    this.currentEmotion = emotion;

    // Get preloaded image
    const image = this.getPreloadedImage(characterId, emotion);
    
    // Dispatch portrait update event
    this.dispatcher.dispatch('PORTRAIT_UPDATED', {
      character: characterId,
      emotion: emotion,
      image: image,
      config: portraitConfig
    });
  }

  /**
   * Hide current portrait
   */
  hidePortrait() {
    this.currentPortrait = null;
    this.currentEmotion = 'neutral';
    
    this.dispatcher.dispatch('PORTRAIT_UPDATED', {
      character: null,
      emotion: null,
      image: null,
      config: null
    });
  }

  /**
   * Update emotion of current portrait
   * @param {string} emotion - New emotion
   */
  async updateEmotion(emotion) {
    if (!this.currentPortrait) {
      console.warn('No current portrait to update emotion');
      return;
    }

    await this.showPortrait(this.currentPortrait, emotion);
  }

  /**
   * Get current portrait state
   */
  getCurrentPortrait() {
    return {
      character: this.currentPortrait,
      emotion: this.currentEmotion,
      config: this.currentPortrait ? this.portraits.get(this.currentPortrait) : null
    };
  }

  /**
   * Check if character portraits are loaded
   * @param {string} characterId - Character identifier
   */
  isCharacterLoaded(characterId) {
    return this.preloadPromises.has(characterId);
  }

  /**
   * Get loading status for all characters
   */
  getLoadingStatus() {
    const status = {};
    this.portraits.forEach((config, characterId) => {
      status[characterId] = {
        loaded: this.isCharacterLoaded(characterId),
        preloading: this.preloadPromises.has(characterId),
        emotions: Object.keys(config.emotions || {})
      };
    });
    return status;
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.loadedImages.clear();
    this.preloadPromises.clear();
    this.portraits.clear();
    this.currentPortrait = null;
    this.currentEmotion = 'neutral';
  }
}

/**
 * Create and initialize portrait service
 */
export function createPortraitService(dispatcher) {
  return new PortraitService(dispatcher);
}
