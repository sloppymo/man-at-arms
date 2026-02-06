(function() {
    'use strict';
    
    // ============================================
    // Infrastructure Validation Tests
    // ============================================
    
    async function runInfrastructureValidation() {
        const suite = window.InkValidationSuite;
        if (!suite) {
            console.error('Ink validation suite not available');
            return;
        }
        
        suite.startTestGroup('Infrastructure Validation');
        
        // Test 1: Directory Structure and CDN Loading
        console.log('Testing directory structure and CDN loading...');
        
        // Check if inkjs is available from CDN
        suite.assert(typeof window.inkjs !== 'undefined', 'Ink.js CDN loaded successfully');
        suite.assert(window.inkjs && typeof window.inkjs.Story === 'function', 'Ink.js Story class available');
        suite.assert(window.inkjs && typeof window.inkjs.Compiler === 'function', 'Ink.js Compiler class available');
        
        // Check if ink directory exists (by checking if our modules loaded)
        suite.assert(typeof window.inkIntegration !== 'undefined', 'Ink integration module loaded');
        suite.assert(typeof window.narrativeBridge !== 'undefined', 'Narrative bridge module loaded');
        suite.assert(typeof window.storyLoader !== 'undefined', 'Story loader module loaded');
        suite.assert(typeof window.inkDebugTools !== 'undefined', 'Debug tools module loaded');
        
        // Test 2: Core Initialization
        console.log('Testing core initialization...');
        
        // Check inkReady promise
        suite.assert(typeof window.inkReady === 'object' && typeof window.inkReady.then === 'function', 'inkReady promise available');
        
        // Wait for initialization if needed
        if (window.inkReady) {
            try {
                await window.inkReady;
                suite.assert(true, 'Ink initialization completed successfully');
            } catch (error) {
                suite.assert(false, `Ink initialization failed: ${error.message}`);
            }
        }
        
        // Check global objects after initialization
        suite.assert(window.inkStory !== null, 'Ink story object initialized');
        suite.assert(window.narrativeBridge !== null, 'Narrative bridge object created');
        
        // Test 3: Story Loader Functionality
        console.log('Testing story loader functionality...');
        
        // Check story loader methods
        suite.assert(typeof window.storyLoader.loadStory === 'function', 'Story loader loadStory method available');
        suite.assert(typeof window.storyLoader.preloadStories === 'function', 'Story loader preloadStories method available');
        suite.assert(typeof window.storyLoader.clearCache === 'function', 'Story loader clearCache method available');
        suite.assert(typeof window.storyLoader.getCacheStats === 'function', 'Story loader getCacheStats method available');
        
        // Test cache stats
        const cacheStats = window.storyLoader.getCacheStats();
        suite.assert(typeof cacheStats === 'object', 'Cache stats returns object');
        suite.assert(typeof cacheStats.size === 'number', 'Cache size available');
        suite.assert(Array.isArray(cacheStats.cachedStories), 'Cached stories array available');
        
        // Test 4: Ink Integration Methods
        console.log('Testing ink integration methods...');
        
        suite.assert(typeof window.inkIntegration.loadStory === 'function', 'Ink integration loadStory available');
        suite.assert(typeof window.inkIntegration.isInkReady === 'function', 'Ink integration isInkReady available');
        suite.assert(typeof window.inkIntegration.getInkStory === 'function', 'Ink integration getInkStory available');
        suite.assert(typeof window.inkIntegration.getNarrativeBridge === 'function', 'Ink integration getNarrativeBridge available');
        suite.assert(typeof window.inkIntegration.validateInkState === 'function', 'Ink integration validateInkState available');
        
        // Test 5: Debug Tools Availability
        console.log('Testing debug tools availability...');
        
        suite.assert(typeof window.inkDebugTools.setDebugMode === 'function', 'Debug tools setDebugMode available');
        suite.assert(typeof window.inkDebugTools.debugInkState === 'function', 'Debug tools debugInkState available');
        suite.assert(typeof window.inkDebugTools.debugStateSync === 'function', 'Debug tools debugStateSync available');
        suite.assert(typeof window.inkDebugTools.debugNarrativeBridge === 'function', 'Debug tools debugNarrativeBridge available');
        suite.assert(typeof window.inkDebugTools.runFullDebug === 'function', 'Debug tools runFullDebug available');
        
        // Test 6: Error Boundaries
        console.log('Testing error boundaries...');
        
        // Test validation with invalid story
        suite.assertThrows(() => {
            window.inkIntegration.validateInkState();
        }, 'Ink state validation handles errors gracefully');
        
        // Test 7: Story File Access
        console.log('Testing story file access...');
        
        try {
            const testStory = await window.storyLoader.loadStory('character-creation');
            suite.assert(testStory && typeof testStory === 'object', 'Character creation story loads successfully');
        } catch (error) {
            suite.assert(false, `Failed to load character creation story: ${error.message}`);
        }
        
        try {
            const mainStory = await window.storyLoader.loadStory('main');
            suite.assert(mainStory && typeof mainStory === 'object', 'Main story loads successfully');
        } catch (error) {
            suite.assert(false, `Failed to load main story: ${error.message}`);
        }
        
        try {
            const trainingStory = await window.storyLoader.loadStory('training');
            suite.assert(trainingStory && typeof trainingStory === 'object', 'Training story loads successfully');
        } catch (error) {
            suite.assert(false, `Failed to load training story: ${error.message}`);
        }
        
        // Test 8: Integration Readiness
        console.log('Testing integration readiness...');
        
        // Check if gameState is available
        suite.assert(typeof window.gameState === 'object', 'Game state object available');
        suite.assert(typeof window.gameState.stats === 'object', 'Game state stats available');
        
        // Check critical stats
        const criticalStats = ['strength', 'agility', 'endurance', 'charisma', 'luck', 'wits', 'wealth', 'reputation', 'morale', 'stress'];
        criticalStats.forEach(stat => {
            suite.assert(typeof window.gameState.stats[stat] === 'number', `Stat ${stat} is numeric`);
        });
        
        // Check if UI elements exist
        suite.assert(document.getElementById('story') !== null, 'Story element exists');
        suite.assert(document.getElementById('choices-container') !== null, 'Choices container exists');
        suite.assert(document.getElementById('stats') !== null, 'Stats element exists');
        suite.assert(document.getElementById('status-bar') !== null, 'Status bar exists');
        
        // Test 9: Performance Baseline
        console.log('Testing performance baseline...');
        
        suite.startPerformanceTimer('initialization-check');
        
        // Test basic story loading performance
        const startTime = performance.now();
        try {
            await window.storyLoader.loadStory('character-creation');
            const loadTime = performance.now() - startTime;
            suite.assert(loadTime < 1000, `Story loading under 1 second (actual: ${loadTime.toFixed(2)}ms)`);
        } catch (error) {
            suite.assert(false, `Story loading performance test failed: ${error.message}`);
        }
        
        suite.endPerformanceTimer('initialization-check');
        
        // Test 10: Memory Baseline
        console.log('Testing memory baseline...');
        
        suite.startMemoryTest('infrastructure-baseline');
        
        // Get initial memory state
        const initialMemory = suite.getMemoryUsage();
        if (initialMemory) {
            suite.assert(initialMemory.used > 0, 'Memory usage tracking available');
            console.log(`Initial memory usage: ${(initialMemory.used / 1024 / 1024).toFixed(2)}MB`);
        }
        
        suite.endMemoryTest('infrastructure-baseline', 5); // Allow 5MB for infrastructure
        
        suite.endTestGroup();
        
        console.log('Infrastructure validation complete');
        return suite.getResults();
    }
    
    // ============================================
    // Public API
    // ============================================
    
    window.InfrastructureValidation = {
        run: runInfrastructureValidation
    };
    
    console.log('Infrastructure validation module loaded');
    
})();
