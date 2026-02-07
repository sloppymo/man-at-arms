(function() {
    'use strict';
    
    // ============================================
    // Ink.js Integration Core
    // ============================================
    
    let inkStory = null;
    let narrativeBridge = null;
    let isInitialized = false;
    
    // Promise for initialization sequencing
    window.inkReady = new Promise((resolve) => {
        window.inkInitialized = resolve;
    });
    
    // ============================================
    // Core Ink Runtime Management
    // ============================================
    
    /**
     * Initialize Ink.js with story JSON
     * @param {string} storyJson - Compiled Ink story JSON
     */
    function initializeInk(storyJson) {
        try {
            // Clean up existing story instance
            if (inkStory) {
                destroyInk();
            }
            
            // Create new story instance
            inkStory = new window.inkjs.Story(storyJson);
            
            // Initialize narrative bridge
            narrativeBridge = new NarrativeBridge(inkStory, window.gameState);
            
            // Mark as initialized
            isInitialized = true;
            window.inkInitialized();
            
            console.log('Ink.js initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Ink.js:', error);
            throw error;
        }
    }
    
    /**
     * Initialize Ink.js with story object
     * @param {inkjs.Story} story - Ink story object
     */
    function initializeInkWithStory(story) {
        try {
            // Clean up existing story instance
            if (inkStory) {
                destroyInk();
            }
            
            // Use the provided story object
            inkStory = story;
            
            // Initialize narrative bridge
            narrativeBridge = new NarrativeBridge(inkStory, window.gameState);
            
            // Mark as initialized
            isInitialized = true;
            window.inkInitialized();
            
            console.log('Ink.js initialized successfully with story object');
        } catch (error) {
            console.error('Failed to initialize Ink.js with story:', error);
            throw error;
        }
    }
    
    /**
     * Load and create an Ink story
     * @param {string} storyPath - Path to .ink file
     * @returns {Promise<inkjs.Story>} - Ink story object
     */
    async function loadStoryFile(storyPath) {
        try {
            const response = await fetch(storyPath);
            if (!response.ok) {
                throw new Error(`Failed to load story: ${response.status}`);
            }
            
            const inkContent = await response.text();
            
            // Create story directly from content (Ink.js 1.10.4 approach)
            const story = new inkjs.Story(inkContent);
            
            return story;
        } catch (error) {
            console.error(`Failed to load story file ${storyPath}:`, error);
            throw error;
        }
    }
    
    /**
     * Load and initialize a story by name
     * @param {string} storyName - Name of story to load
     */
    async function loadStory(storyName) {
        try {
            // First try to get the story from the story-loader cache
            if (window.storyLoader) {
                try {
                    const cachedStory = await window.storyLoader.loadStory(storyName);
                    if (cachedStory) {
                        initializeInkWithStory(cachedStory);
                        
                        // Set initial state from gameState
                        if (narrativeBridge) {
                            narrativeBridge.syncFromGameState();
                        }
                        
                        return true;
                    }
                } catch (cacheError) {
                    console.warn(`Story ${storyName} not in cache, trying direct load:`, cacheError.message);
                }
            }
            
            // Fallback: try loading from .ink file (though this won't work with current inkjs)
            const storyPath = `js/ink/ink-stories/${storyName}.ink`;
            const story = await loadStoryFile(storyPath);
            initializeInkWithStory(story);
            
            // Set initial state from gameState
            if (narrativeBridge) {
                narrativeBridge.syncFromGameState();
            }
            
            return true;
        } catch (error) {
            console.error(`Failed to load story ${storyName}:`, error);
            return false;
        }
    }
    
    /**
     * Clean up Ink story instance
     */
    function destroyInk() {
        if (narrativeBridge) {
            narrativeBridge.destroy();
            narrativeBridge = null;
        }
        
        inkStory = null;
        isInitialized = false;
    }
    
    /**
     * Check if Ink is ready and initialized
     * @returns {boolean}
     */
    function isInkReady() {
        return isInitialized && inkStory && narrativeBridge;
    }
    
    /**
     * Get current Ink story instance
     * @returns {inkjs.Story|null}
     */
    function getInkStory() {
        return inkStory;
    }
    
    /**
     * Get current narrative bridge instance
     * @returns {NarrativeBridge|null}
     */
    function getNarrativeBridge() {
        return narrativeBridge;
    }
    
    // ============================================
    // Error Handling and Recovery
    // ============================================
    
    /**
     * Handle Ink rendering errors with fallback
     * @param {Error} error - The error that occurred
     * @param {string} fallbackContent - Fallback content to display
     */
    function handleInkError(error, fallbackContent = '<p>An error occurred. Please try again.</p>') {
        console.error('Ink rendering error:', error);
        
        // Show error notification
        if (window.showNotification) {
            window.showNotification('Narrative Error', 'Using fallback content', 'warning');
        }
        
        // Return fallback content
        return fallbackContent;
    }
    
    /**
     * Validate Ink story state
     * @returns {boolean} - True if state is valid
     */
    function validateInkState() {
        if (!isInkReady()) {
            return false;
        }
        
        try {
            // Basic state checks
            if (typeof inkStory.canContinue !== 'boolean') {
                return false;
            }
            
            if (!Array.isArray(inkStory.currentChoices)) {
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Ink state validation failed:', error);
            return false;
        }
    }
    
    // ============================================
    // Public API
    // ============================================
    
    // Global access
    window.inkIntegration = {
        initializeInk,
        loadStory,
        loadStoryFile,
        destroyInk,
        isInkReady,
        getInkStory,
        getNarrativeBridge,
        handleInkError,
        validateInkState
    };
    
    // Direct access for convenience
    Object.defineProperty(window, 'inkStory', {
        get: () => inkStory,
        enumerable: true
    });
    
    Object.defineProperty(window, 'narrativeBridge', {
        get: () => narrativeBridge,
        enumerable: true
    });
    
    console.log('Ink integration module loaded');
    
})();
