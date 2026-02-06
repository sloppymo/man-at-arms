(function() {
    'use strict';
    
    // ============================================
    // Story Loader - Dynamic Ink Compilation
    // ============================================
    
    const storyCache = new Map();
    const loadingPromises = new Map();
    
    /**
     * Load and cache an Ink story
     * @param {string} storyName - Name of the story file
     * @returns {Promise<Object>} - Compiled story JSON
     */
    async function loadStory(storyName) {
        // Check cache first
        if (storyCache.has(storyName)) {
            console.log(`Loading ${storyName} from cache`);
            return storyCache.get(storyName);
        }
        
        // Check if already loading
        if (loadingPromises.has(storyName)) {
            console.log(`Waiting for ${storyName} to load`);
            return loadingPromises.get(storyName);
        }
        
        // Load and compile
        const loadingPromise = compileStory(storyName);
        loadingPromises.set(storyName, loadingPromise);
        
        try {
            const storyJson = await loadingPromise;
            storyCache.set(storyName, storyJson);
            loadingPromises.delete(storyName);
            return storyJson;
        } catch (error) {
            loadingPromises.delete(storyName);
            throw error;
        }
    }
    
    /**
     * Compile an Ink story from file
     * @param {string} storyName - Name of the story file
     * @returns {Promise<Object>} - Compiled story JSON
     */
    async function compileStory(storyName) {
        try {
            const jsonPath = `js/ink/ink-stories/${storyName}.json`;
            console.log(`Loading story JSON: ${jsonPath}`);
            
            const response = await fetch(jsonPath);
            if (!response.ok) {
                throw new Error(`Failed to load story JSON: ${response.status} ${response.statusText}`);
            }
            
            const jsonContent = await response.text();
            
            // Validate content
            if (!jsonContent.trim()) {
                throw new Error(`Story JSON file ${storyName} is empty`);
            }
            
            // Parse JSON and create story
            let parsedJson;
            try {
                parsedJson = JSON.parse(jsonContent);
            } catch (parseError) {
                throw new Error(`Failed to parse story JSON: ${parseError.message}`);
            }
            
            // Create story from JSON
            const story = new inkjs.Story(parsedJson);
            
            if (!story) {
                throw new Error(`Failed to create story from JSON`);
            }
            
            console.log(`Successfully loaded story ${storyName} from JSON`);
            return story;
            
        } catch (error) {
            console.error(`Failed to load story ${storyName}:`, error);
            throw error;
        }
    }
    
    /**
     * Load a pre-compiled Ink story from JSON
     * @param {string} storyName - Name of story to load
     * @returns {Promise<inkjs.Story>} - Ink story object
     */
    async function loadStoryJson(storyName) {
        try {
            const jsonPath = `js/ink/ink-stories/${storyName}.json`;
            const response = await fetch(jsonPath);
            
            if (!response.ok) {
                throw new Error(`Failed to load story JSON: ${response.status} ${response.statusText}`);
            }
            
            const jsonContent = await response.text();
            
            // Validate content
            if (!jsonContent.trim()) {
                throw new Error(`Story JSON file ${storyName} is empty`);
            }
            
            // Parse JSON and create story
            let parsedJson;
            try {
                parsedJson = JSON.parse(jsonContent);
            } catch (parseError) {
                throw new Error(`Failed to parse story JSON: ${parseError.message}`);
            }
            
            // Create story from JSON
            const story = new inkjs.Story(parsedJson);
            
            if (!story) {
                throw new Error(`Failed to create story from JSON`);
            }
            
            console.log(`Successfully loaded story ${storyName} from JSON`);
            return story;
            
        } catch (error) {
            console.error(`Failed to load story ${storyName}:`, error);
            throw error;
        }
    }
    
    /**
     * Preload multiple stories
     * @param {string[]} storyNames - Array of story names to preload
     * @returns {Promise<Object>} - Map of loaded stories
     */
    async function preloadStories(storyNames) {
        console.log('Preloading stories:', storyNames);
        
        const loadPromises = storyNames.map(name => 
            loadStory(name).then(json => ({ name, json }))
                .catch(error => ({ name, error }))
        );
        
        const results = await Promise.all(loadPromises);
        
        const loadedStories = {};
        const errors = [];
        
        results.forEach(({ name, json, error }) => {
            if (error) {
                errors.push({ name, error });
            } else {
                loadedStories[name] = json;
            }
        });
        
        if (errors.length > 0) {
            console.warn('Some stories failed to preload:', errors);
        }
        
        console.log(`Preloaded ${Object.keys(loadedStories).length} stories`);
        return loadedStories;
    }
    
    /**
     * Clear story cache
     * @param {string} [storyName] - Specific story to clear, or clear all if not provided
     */
    function clearCache(storyName) {
        if (storyName) {
            storyCache.delete(storyName);
            console.log(`Cleared cache for ${storyName}`);
        } else {
            storyCache.clear();
            console.log('Cleared all story cache');
        }
    }
    
    /**
     * Get cache statistics
     * @returns {Object} - Cache statistics
     */
    function getCacheStats() {
        return {
            size: storyCache.size,
            loading: loadingPromises.size,
            cachedStories: Array.from(storyCache.keys())
        };
    }
    
    /**
     * Validate story JSON structure
     * @param {Object} storyJson - Compiled story JSON to validate
     * @returns {boolean} - True if valid
     */
    function validateStoryJson(storyJson) {
        try {
            // Basic structure validation
            if (!storyJson || typeof storyJson !== 'object') {
                return false;
            }
            
            // Check for required properties
            if (!storyJson.root || !storyJson.root.length) {
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Story JSON validation failed:', error);
            return false;
        }
    }
    
    /**
     * Get story metadata
     * @param {Object} storyJson - Compiled story JSON
     * @returns {Object} - Story metadata
     */
    function getStoryMetadata(storyJson) {
        const metadata = {
            knotCount: 0,
            stitchCount: 0,
            lineCount: 0,
            hasChoices: false
        };
        
        try {
            // Count knots and stitches (simplified)
            const jsonString = JSON.stringify(storyJson);
            metadata.knotCount = (jsonString.match(/"knot":/g) || []).length;
            metadata.stitchCount = (jsonString.match(/"stitch":/g) || []).length;
            metadata.lineCount = (jsonString.match(/\n/g) || []).length;
            metadata.hasChoices = jsonString.includes('"choice"');
            
            return metadata;
        } catch (error) {
            console.error('Failed to extract story metadata:', error);
            return metadata;
        }
    }
    
    /**
     * Hot reload story for development
     * @param {string} storyName - Name of story to reload
     * @returns {Promise<Object>} - Recompiled story JSON
     */
    async function hotReloadStory(storyName) {
        console.log(`Hot reloading ${storyName}`);
        
        // Clear cache for this story
        storyCache.delete(storyName);
        
        // Reload and recompile
        return loadStory(storyName);
    }
    
    // ============================================
    // Development Tools
    // ============================================
    
    /**
     * Enable hot reload in development
     */
    function enableHotReload() {
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            console.log('Enabling Ink story hot reload');
            
            // Set up file watching (simplified - would need server support)
            setInterval(() => {
                // This would need proper file system access
                // For now, just log that hot reload is active
            }, 1000);
        }
    }
    
    /**
     * Debug story loading
     * @param {string} storyName - Story name to debug
     */
    function debugStory(storyName) {
        loadStory(storyName)
            .then(storyJson => {
                console.log(`Debug info for ${storyName}:`);
                console.log('Metadata:', getStoryMetadata(storyJson));
                console.log('Validation:', validateStoryJson(storyJson));
                console.log('JSON preview:', JSON.stringify(storyJson).substring(0, 500) + '...');
            })
            .catch(error => {
                console.error(`Debug failed for ${storyName}:`, error);
            });
    }
    
    // ============================================
    // Public API
    // ============================================
    
    window.storyLoader = {
        loadStory,
        preloadStories,
        clearCache,
        getCacheStats,
        validateStoryJson,
        getStoryMetadata,
        hotReloadStory,
        enableHotReload,
        debugStory
    };
    
    console.log('Story loader module loaded');
    
})();
