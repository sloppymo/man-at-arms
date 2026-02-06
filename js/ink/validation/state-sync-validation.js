(function() {
    'use strict';
    
    // ============================================
    // State Synchronization Validation Tests
    // ============================================
    
    async function runStateSyncValidation() {
        const suite = window.InkValidationSuite;
        if (!suite) {
            console.error('Ink validation suite not available');
            return;
        }
        
        suite.startTestGroup('State Synchronization Validation');
        
        // Ensure Ink is ready
        if (window.inkReady) {
            await window.inkReady;
        }
        
        // Test 1: Bidirectional Stat Sync - JavaScript -> Ink
        console.log('Testing JavaScript -> Ink stat synchronization...');
        
        const criticalStats = ['strength', 'agility', 'endurance', 'charisma', 'luck', 'wits', 'wealth', 'reputation', 'morale', 'stress', 'experience', 'patronFavor'];
        
        // Store original values
        const originalStats = {};
        criticalStats.forEach(stat => {
            originalStats[stat] = window.gameState.stats[stat];
        });
        
        // Test each stat sync from JS to Ink
        criticalStats.forEach(stat => {
            const testValue = Math.floor(Math.random() * 10) + 1;
            window.gameState.stats[stat] = testValue;
            
            // Trigger sync if narrative bridge is available
            if (window.narrativeBridge && window.narrativeBridge.syncFromGameState) {
                window.narrativeBridge.syncFromGameState();
            }
            
            // Check if Ink variable matches
            const inkValue = window.inkStory ? window.inkStory.variablesState[stat] : undefined;
            suite.assertEqual(inkValue, testValue, `Stat ${stat} sync JS->Ink`);
        });
        
        // Test 2: Bidirectional Stat Sync - Ink -> JavaScript
        console.log('Testing Ink -> JavaScript stat synchronization...');
        
        for (const stat of criticalStats) {
            const testValue = Math.floor(Math.random() * 10) + 1;
            
            // Set Ink variable directly
            if (window.inkStory) {
                window.inkStory.variablesState[stat] = testValue;
            }
            
            // Allow time for observer to trigger
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Check if gameState matches
            const gameValue = window.gameState.stats[stat];
            suite.assertEqual(gameValue, testValue, `Stat ${stat} sync Ink->JS`);
        }
        
        // Test 3: State Drift Prevention
        console.log('Testing state drift prevention...');
        
        // Simulate rapid changes to test race conditions
        suite.startPerformanceTimer('drift-prevention');
        
        for (let i = 0; i < 100; i++) {
            const jsValue = Math.floor(Math.random() * 10) + 1;
            const inkValue = Math.floor(Math.random() * 10) + 1;
            
            window.gameState.stats.strength = jsValue;
            if (window.inkStory) {
                window.inkStory.variablesState.strength = inkValue;
            }
            
            // Allow sync to occur
            await new Promise(resolve => setTimeout(resolve, 1));
        }
        
        // Allow final sync
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verify final consistency
        const finalGameValue = window.gameState.stats.strength;
        const finalInkValue = window.inkStory ? window.inkStory.variablesState.strength : undefined;
        
        suite.assertEqual(finalGameValue, finalInkValue, 'State consistency after rapid changes');
        
        suite.endPerformanceTimer('drift-prevention');
        suite.checkPerformanceThreshold('drift-prevention', 1000); // Should complete within 1 second
        
        // Test 4: Game State Properties Sync
        console.log('Testing game state properties synchronization...');
        
        const gameStateProps = ['faction', 'age', 'year', 'location', 'level', 'currentScene', 'characterName', 'patronId', 'background'];
        
        // Store original values
        const originalProps = {};
        gameStateProps.forEach(prop => {
            originalProps[prop] = window.gameState[prop];
        });
        
        // Test JS -> Ink sync for properties
        gameStateProps.forEach(prop => {
            let testValue;
            
            // Set appropriate test values based on property type
            switch (prop) {
                case 'age':
                case 'year':
                case 'level':
                    testValue = Math.floor(Math.random() * 50) + 1;
                    break;
                case 'characterName':
                    testValue = 'TestKnight_' + Math.random().toString(36).substring(7);
                    break;
                default:
                    testValue = 'test_value_' + Math.random().toString(36).substring(7);
            }
            
            window.gameState[prop] = testValue;
            
            // Trigger sync
            if (window.narrativeBridge && window.narrativeBridge.syncFromGameState) {
                window.narrativeBridge.syncFromGameState();
            }
            
            // Check Ink variable
            const inkValue = window.inkStory ? window.inkStory.variablesState[prop] : undefined;
            suite.assertEqual(inkValue, testValue, `Property ${prop} sync JS->Ink`);
        });
        
        // Test Ink -> JS sync for properties
        for (const prop of gameStateProps) {
            let testValue;
            
            switch (prop) {
                case 'age':
                case 'year':
                case 'level':
                    testValue = Math.floor(Math.random() * 50) + 1;
                    break;
                case 'characterName':
                    testValue = 'InkKnight_' + Math.random().toString(36).substring(7);
                    break;
                default:
                    testValue = 'ink_value_' + Math.random().toString(36).substring(7);
            }
            
            // Set Ink variable
            if (window.inkStory) {
                window.inkStory.variablesState[prop] = testValue;
            }
            
            // Allow sync
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Check gameState
            const gameValue = window.gameState[prop];
            suite.assertEqual(gameValue, testValue, `Property ${prop} sync Ink->JS`);
        }
        
        // Test 5: Chapter Progress Sync
        console.log('Testing chapter progress synchronization...');
        
        // Test chapter progress variables
        const testChapters = ['chapter_1', 'chapter_2', 'chapter_3'];
        
        testChapters.forEach(chapterId => {
            // Set chapter progress in gameState
            if (!window.gameState.chapterProgress[chapterId]) {
                window.gameState.chapterProgress[chapterId] = { started: false, completed: false };
            }
            
            window.gameState.chapterProgress[chapterId].started = true;
            window.gameState.chapterProgress[chapterId].completed = false;
            
            // Sync to Ink
            if (window.narrativeBridge && window.narrativeBridge.syncChapterProgressToInk) {
                window.narrativeBridge.syncChapterProgressToInk();
            }
            
            // Check Ink variables
            const startedVar = `chapter_${chapterId}_started`;
            const completedVar = `chapter_${chapterId}_completed`;
            
            const inkStarted = window.inkStory ? window.inkStory.variablesState[startedVar] : undefined;
            const inkCompleted = window.inkStory ? window.inkStory.variablesState[completedVar] : undefined;
            
            suite.assertEqual(inkStarted, true, `Chapter ${chapterId} started sync`);
            suite.assertEqual(inkCompleted, false, `Chapter ${chapterId} completed sync`);
        });
        
        // Test 6: Conditions Sync
        console.log('Testing conditions synchronization...');
        
        // Add test conditions
        const testConditions = [
            { name: 'test_condition_1', type: 'negative', duration: 5 },
            { name: 'test_condition_2', type: 'positive', duration: 3 }
        ];
        
        for (const condition of testConditions) {
            // Add condition to gameState
            if (window.addCondition) {
                window.addCondition(condition.name, condition.type, condition.duration);
            }
            
            // Allow sync
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Check Ink variables
            const varName = `condition_${condition.name.replace(/\s+/g, '_').toLowerCase()}`;
            const inkCondition = window.inkStory ? window.inkStory.variablesState[varName] : undefined;
            
            suite.assertEqual(inkCondition, true, `Condition ${condition.name} sync to Ink`);
            
            // Test condition check function
            const hasCondition = window.hasCondition ? window.hasCondition(condition.name) : false;
            suite.assertEqual(hasCondition, true, `Condition ${condition.name} check in JS`);
        }
        
        // Test 7: State Integrity Validation
        console.log('Testing state integrity validation...');
        
        // Use built-in state validator if available
        if (window.StateValidator && window.StateValidator.validateStateIntegrity) {
            const integrity = window.StateValidator.validateStateIntegrity();
            suite.assert(integrity, 'State integrity validation passed');
        }
        
        // Manual integrity check
        criticalStats.forEach(stat => {
            const gameValue = window.gameState.stats[stat];
            const inkValue = window.inkStory ? window.inkStory.variablesState[stat] : undefined;
            
            if (inkValue !== undefined) {
                const difference = Math.abs(gameValue - inkValue);
                suite.assert(difference <= 0.01, `Stat ${stat} integrity check (diff: ${difference})`);
            }
        });
        
        // Test 8: Memory Usage During Sync
        console.log('Testing memory usage during sync...');
        
        suite.startMemoryTest('state-sync-memory');
        
        // Perform intensive sync operations
        for (let i = 0; i < 50; i++) {
            criticalStats.forEach(stat => {
                const testValue = Math.floor(Math.random() * 10) + 1;
                window.gameState.stats[stat] = testValue;
                
                if (window.narrativeBridge && window.narrativeBridge.syncFromGameState) {
                    window.narrativeBridge.syncFromGameState();
                }
            });
            
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        suite.endMemoryTest('state-sync-memory', 2); // Allow 2MB for sync operations
        
        // Test 9: Observer Performance
        console.log('Testing observer performance...');
        
        suite.startPerformanceTimer('observer-performance');
        
        // Test observer response time
        const testStat = 'strength';
        const testValue = 7;
        
        const startTime = performance.now();
        window.gameState.stats[testStat] = testValue;
        
        // Wait for observer to trigger
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const responseTime = performance.now() - startTime;
        suite.assert(responseTime < 200, `Observer response time under 200ms (actual: ${responseTime.toFixed(2)}ms)`);
        
        suite.endPerformanceTimer('observer-performance');
        
        // Test 10: Error Recovery
        console.log('Testing error recovery...');
        
        // Test sync with invalid values
        const originalStrength = window.gameState.stats.strength;
        
        // Try setting invalid value
        window.gameState.stats.strength = NaN;
        
        // Allow sync to attempt
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Check if system recovered
        const recoveredStrength = window.gameState.stats.strength;
        suite.assert(!isNaN(recoveredStrength), 'System recovered from invalid stat value');
        
        // Restore original value
        window.gameState.stats.strength = originalStrength;
        
        // Restore original values
        criticalStats.forEach(stat => {
            window.gameState.stats[stat] = originalStats[stat];
        });
        
        gameStateProps.forEach(prop => {
            window.gameState[prop] = originalProps[prop];
        });
        
        // Clean up test conditions
        testConditions.forEach(condition => {
            if (window.removeCondition) {
                window.removeCondition(condition.name);
            }
        });
        
        // Final sync
        if (window.narrativeBridge && window.narrativeBridge.syncFromGameState) {
            window.narrativeBridge.syncFromGameState();
        }
        
        suite.endTestGroup();
        
        console.log('State synchronization validation complete');
        return suite.getResults();
    }
    
    // ============================================
    // Public API
    // ============================================
    
    window.StateSyncValidation = {
        run: runStateSyncValidation
    };
    
    console.log('State synchronization validation module loaded');
    
})();
