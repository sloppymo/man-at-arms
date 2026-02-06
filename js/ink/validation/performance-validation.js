(function() {
    'use strict';
    
    // ============================================
    // Performance and Memory Validation Tests
    // ============================================
    
    async function runPerformanceValidation() {
        const suite = window.InkValidationSuite;
        if (!suite) {
            console.error('Ink validation suite not available');
            return;
        }
        
        suite.startTestGroup('Performance and Memory Validation');
        
        // Ensure Ink is ready
        if (window.inkReady) {
            await window.inkReady;
        }
        
        // Test 1: Initial Load Performance
        console.log('Testing initial load performance...');
        
        suite.startPerformanceTimer('initial-load');
        
        try {
            // Test story loading performance
            const startTime = performance.now();
            
            await window.storyLoader.loadStory('character-creation');
            await window.storyLoader.loadStory('main');
            await window.storyLoader.loadStory('training');
            
            const loadTime = performance.now() - startTime;
            console.log(`All stories loaded in ${loadTime.toFixed(2)}ms`);
            
            suite.assert(loadTime < 2000, `All stories load under 2 seconds (actual: ${loadTime.toFixed(2)}ms)`);
            
        } catch (error) {
            suite.assert(false, `Initial load performance test failed: ${error.message}`);
        }
        
        suite.endPerformanceTimer('initial-load');
        
        // Test 2: Scene Transition Performance
        console.log('Testing scene transition performance...');
        
        suite.startPerformanceTimer('scene-transitions');
        
        try {
            const testScenes = ['start', 'character_creation', 'training_brawny'];
            
            for (const scene of testScenes) {
                const transitionStart = performance.now();
                
                // Simulate scene transition
                window.gameState.currentScene = scene;
                window.updateStory();
                
                // Allow transition to complete
                await new Promise(resolve => setTimeout(resolve, 100));
                
                const transitionTime = performance.now() - transitionStart;
                console.log(`Scene ${scene} transition: ${transitionTime.toFixed(2)}ms`);
                
                suite.assert(transitionTime < 500, `Scene ${scene} transition under 500ms (actual: ${transitionTime.toFixed(2)}ms)`);
            }
            
        } catch (error) {
            suite.assert(false, `Scene transition performance test failed: ${error.message}`);
        }
        
        suite.endPerformanceTimer('scene-transitions');
        suite.checkPerformanceThreshold('scene-transitions', 1500); // All transitions under 1.5 seconds
        
        // Test 3: Rendering Performance
        console.log('Testing rendering performance...');
        
        suite.startPerformanceTimer('rendering-performance');
        
        try {
            // Test multiple rapid renders
            for (let i = 0; i < 20; i++) {
                const renderStart = performance.now();
                
                window.updateStory();
                
                await new Promise(resolve => setTimeout(resolve, 10));
                
                const renderTime = performance.now() - renderStart;
                
                // Individual renders should be fast
                if (renderTime > 100) {
                    console.warn(`Slow render detected: ${renderTime.toFixed(2)}ms on iteration ${i}`);
                }
            }
            
        } catch (error) {
            suite.assert(false, `Rendering performance test failed: ${error.message}`);
        }
        
        suite.endPerformanceTimer('rendering-performance');
        suite.checkPerformanceThreshold('rendering-performance', 2000); // 20 renders under 2 seconds
        
        // Test 4: Choice Response Time
        console.log('Testing choice response time...');
        
        suite.startPerformanceTimer('choice-response');
        
        try {
            // Get choice buttons if available
            const choiceButtons = document.querySelectorAll('.choice-button');
            
            if (choiceButtons.length > 0) {
                for (let i = 0; i < Math.min(5, choiceButtons.length); i++) {
                    const responseStart = performance.now();
                    
                    suite.simulateClick(choiceButtons[i]);
                    
                    // Allow choice processing
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    const responseTime = performance.now() - responseStart;
                    console.log(`Choice ${i} response: ${responseTime.toFixed(2)}ms`);
                    
                    suite.assert(responseTime < 200, `Choice ${i} response under 200ms (actual: ${responseTime.toFixed(2)}ms)`);
                }
            } else {
                console.log('No choice buttons available for response time test');
                suite.assert(true, 'Choice response test skipped gracefully');
            }
            
        } catch (error) {
            suite.assert(false, `Choice response time test failed: ${error.message}`);
        }
        
        suite.endPerformanceTimer('choice-response');
        suite.checkPerformanceThreshold('choice-response', 1000); // All choices under 1 second
        
        // Test 5: Memory Leak Detection
        console.log('Testing memory leak detection...');
        
        suite.startMemoryTest('memory-leak-detection');
        
        try {
            const initialMemory = suite.getMemoryUsage();
            if (initialMemory) {
                console.log(`Initial memory: ${(initialMemory.used / 1024 / 1024).toFixed(2)}MB`);
            }
            
            // Perform intensive operations that could leak memory
            for (let i = 0; i < 50; i++) {
                // Load and unload stories
                try {
                    await window.storyLoader.loadStory('character-creation');
                    await window.storyLoader.loadStory('main');
                } catch (e) {
                    // Ignore loading errors in memory test
                }
                
                // Create and destroy DOM elements
                const testElement = document.createElement('div');
                testElement.innerHTML = 'Test content for memory leak detection';
                document.body.appendChild(testElement);
                
                // Add event listeners
                testElement.addEventListener('click', () => {});
                
                // Remove element
                testElement.remove();
                
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            // Force garbage collection if available
            if (window.gc) {
                window.gc();
            }
            
            const finalMemory = suite.getMemoryUsage();
            if (finalMemory && initialMemory) {
                const memoryIncrease = finalMemory.used - initialMemory.used;
                const increaseMB = memoryIncrease / (1024 * 1024);
                
                console.log(`Final memory: ${(finalMemory.used / 1024 / 1024).toFixed(2)}MB`);
                console.log(`Memory increase: ${increaseMB.toFixed(2)}MB`);
                
                suite.assert(increaseMB < 10, `Memory increase under 10MB (actual: ${increaseMB.toFixed(2)}MB)`);
            }
            
        } catch (error) {
            suite.assert(false, `Memory leak detection test failed: ${error.message}`);
        }
        
        suite.endMemoryTest('memory-leak-detection', 10); // Allow 10MB for intensive operations
        
        // Test 6: State Sync Performance
        console.log('Testing state synchronization performance...');
        
        suite.startPerformanceTimer('state-sync-performance');
        
        try {
            const criticalStats = ['strength', 'agility', 'endurance', 'charisma', 'luck', 'wits', 'wealth', 'reputation', 'morale', 'stress'];
            
            // Perform rapid state changes
            for (let i = 0; i < 100; i++) {
                const syncStart = performance.now();
                
                // Change multiple stats
                criticalStats.forEach(stat => {
                    const testValue = Math.floor(Math.random() * 10) + 1;
                    window.gameState.stats[stat] = testValue;
                });
                
                // Trigger sync
                if (window.narrativeBridge && window.narrativeBridge.syncFromGameState) {
                    window.narrativeBridge.syncFromGameState();
                }
                
                await new Promise(resolve => setTimeout(resolve, 5));
                
                const syncTime = performance.now() - syncStart;
                
                // Individual syncs should be very fast
                if (syncTime > 50) {
                    console.warn(`Slow sync detected: ${syncTime.toFixed(2)}ms on iteration ${i}`);
                }
            }
            
        } catch (error) {
            suite.assert(false, `State sync performance test failed: ${error.message}`);
        }
        
        suite.endPerformanceTimer('state-sync-performance');
        suite.checkPerformanceThreshold('state-sync-performance', 3000); // 100 syncs under 3 seconds
        
        // Test 7: External Function Performance
        console.log('Testing external function performance...');
        
        suite.startPerformanceTimer('external-function-performance');
        
        try {
            const functionTests = [
                { name: "applyStatChange", args: ["strength", 1] },
                { name: "formatCurrency", args: [240] },
                { name: "hasCondition", args: ["exhausted"] },
                { name: "getEffectiveStat", args: ["strength"] },
                { name: "rollDice", args: [2] }
            ];
            
            // Test each function multiple times
            for (const test of functionTests) {
                const funcStart = performance.now();
                
                for (let i = 0; i < 20; i++) {
                    try {
                        window.inkStory.CallExternalFunction(test.name, ...test.args);
                    } catch (e) {
                        // Ignore function errors in performance test
                    }
                }
                
                const funcTime = performance.now() - funcStart;
                console.log(`Function ${test.name} (20 calls): ${funcTime.toFixed(2)}ms`);
                
                suite.assert(funcTime < 500, `Function ${test.name} 20 calls under 500ms (actual: ${funcTime.toFixed(2)}ms)`);
            }
            
        } catch (error) {
            suite.assert(false, `External function performance test failed: ${error.message}`);
        }
        
        suite.endPerformanceTimer('external-function-performance');
        suite.checkPerformanceThreshold('external-function-performance', 2000); // All functions under 2 seconds
        
        // Test 8: Cache Performance
        console.log('Testing cache performance...');
        
        suite.startPerformanceTimer('cache-performance');
        
        try {
            // Test story cache performance
            const cacheStatsBefore = window.storyLoader.getCacheStats();
            console.log('Cache stats before:', cacheStatsBefore);
            
            // Load same story multiple times to test cache
            const storyName = 'character-creation';
            
            const firstLoadStart = performance.now();
            await window.storyLoader.loadStory(storyName);
            const firstLoadTime = performance.now() - firstLoadStart;
            
            const secondLoadStart = performance.now();
            await window.storyLoader.loadStory(storyName);
            const secondLoadTime = performance.now() - secondLoadStart;
            
            const thirdLoadStart = performance.now();
            await window.storyLoader.loadStory(storyName);
            const thirdLoadTime = performance.now() - thirdLoadStart;
            
            console.log(`First load: ${firstLoadTime.toFixed(2)}ms`);
            console.log(`Second load: ${secondLoadTime.toFixed(2)}ms`);
            console.log(`Third load: ${thirdLoadTime.toFixed(2)}ms`);
            
            // Cached loads should be faster
            suite.assert(secondLoadTime < firstLoadTime, 'Second load (cached) faster than first');
            suite.assert(thirdLoadTime < firstLoadTime, 'Third load (cached) faster than first');
            
            const cacheStatsAfter = window.storyLoader.getCacheStats();
            console.log('Cache stats after:', cacheStatsAfter);
            
        } catch (error) {
            suite.assert(false, `Cache performance test failed: ${error.message}`);
        }
        
        suite.endPerformanceTimer('cache-performance');
        suite.checkPerformanceThreshold('cache-performance', 1000); // Cache operations under 1 second
        
        // Test 9: DOM Performance
        console.log('Testing DOM performance...');
        
        suite.startPerformanceTimer('dom-performance');
        
        try {
            const storyElement = document.getElementById('story');
            const choicesContainer = document.getElementById('choices-container');
            
            if (storyElement && choicesContainer) {
                // Test rapid DOM updates
                for (let i = 0; i < 50; i++) {
                    const domStart = performance.now();
                    
                    // Update story content
                    storyElement.textContent = `Test content ${i}`;
                    
                    // Update choices
                    choicesContainer.innerHTML = '';
                    for (let j = 0; j < 5; j++) {
                        const button = document.createElement('button');
                        button.className = 'choice-button';
                        button.textContent = `Choice ${j}`;
                        choicesContainer.appendChild(button);
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, 5));
                    
                    const domTime = performance.now() - domStart;
                    
                    // DOM updates should be fast
                    if (domTime > 100) {
                        console.warn(`Slow DOM update: ${domTime.toFixed(2)}ms on iteration ${i}`);
                    }
                }
                
                // Clean up
                choicesContainer.innerHTML = '';
            }
            
        } catch (error) {
            suite.assert(false, `DOM performance test failed: ${error.message}`);
        }
        
        suite.endPerformanceTimer('dom-performance');
        suite.checkPerformanceThreshold('dom-performance', 2000); // DOM operations under 2 seconds
        
        // Test 10: Memory Usage Patterns
        console.log('Testing memory usage patterns...');
        
        suite.startMemoryTest('memory-patterns');
        
        try {
            // Test memory usage during different operations
            const operations = [
                'story-loading',
                'state-sync',
                'rendering',
                'choice-handling'
            ];
            
            for (const operation of operations) {
                const operationMemory = suite.getMemoryUsage();
                if (operationMemory) {
                    console.log(`${operation} memory: ${(operationMemory.used / 1024 / 1024).toFixed(2)}MB`);
                }
                
                // Perform operation-specific tasks
                switch (operation) {
                    case 'story-loading':
                        await window.storyLoader.loadStory('main');
                        break;
                    case 'state-sync':
                        window.gameState.stats.strength = Math.floor(Math.random() * 10) + 1;
                        if (window.narrativeBridge && window.narrativeBridge.syncFromGameState) {
                            window.narrativeBridge.syncFromGameState();
                        }
                        break;
                    case 'rendering':
                        window.updateStory();
                        break;
                    case 'choice-handling':
                        const choices = document.querySelectorAll('.choice-button');
                        if (choices.length > 0) {
                            suite.simulateClick(choices[0]);
                        }
                        break;
                }
                
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
        } catch (error) {
            suite.assert(false, `Memory usage patterns test failed: ${error.message}`);
        }
        
        suite.endMemoryTest('memory-patterns', 5); // Allow 5MB for pattern testing
        
        // Test 11: Performance Benchmarks Summary
        console.log('Testing performance benchmarks summary...');
        
        try {
            // Collect all performance data
            const results = suite.getResults();
            const performanceData = results.performance;
            
            console.log('Performance Summary:');
            Object.keys(performanceData).forEach(testName => {
                const perf = performanceData[testName];
                if (perf.duration) {
                    console.log(`  ${testName}: ${perf.duration.toFixed(2)}ms`);
                }
            });
            
            // Check that all critical benchmarks are within limits
            const criticalBenchmarks = [
                { name: 'initial-load', limit: 2000 },
                { name: 'scene-transitions', limit: 1500 },
                { name: 'rendering-performance', limit: 2000 },
                { name: 'choice-response', limit: 1000 },
                { name: 'state-sync-performance', limit: 3000 }
            ];
            
            let benchmarksPassed = 0;
            criticalBenchmarks.forEach(benchmark => {
                const perf = performanceData[benchmark.name];
                if (perf && perf.duration && perf.duration < benchmark.limit) {
                    benchmarksPassed++;
                    console.log(`✓ ${benchmark.name}: ${perf.duration.toFixed(2)}ms < ${benchmark.limit}ms`);
                } else {
                    console.log(`✗ ${benchmark.name}: ${perf ? perf.duration.toFixed(2) : 'N/A'}ms >= ${benchmark.limit}ms`);
                }
            });
            
            suite.assert(benchmarksPassed >= criticalBenchmarks.length * 0.8, 
                `At least 80% of benchmarks passed (${benchmarksPassed}/${criticalBenchmarks.length})`);
            
        } catch (error) {
            suite.assert(false, `Performance benchmarks summary failed: ${error.message}`);
        }
        
        suite.endTestGroup();
        
        console.log('Performance and memory validation complete');
        return suite.getResults();
    }
    
    // ============================================
    // Public API
    // ============================================
    
    window.PerformanceValidation = {
        run: runPerformanceValidation
    };
    
    console.log('Performance validation module loaded');
    
})();
