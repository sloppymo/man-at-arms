(function() {
    'use strict';
    
    // ============================================
    // External Function Integration Validation Tests
    // ============================================
    
    async function runExternalFunctionValidation() {
        const suite = window.InkValidationSuite;
        if (!suite) {
            console.error('Ink validation suite not available');
            return;
        }
        
        suite.startTestGroup('External Function Integration Validation');
        
        // Ensure Ink is ready
        if (window.inkReady) {
            await window.inkReady;
        }
        
        // Test 1: Stat Modification Functions
        console.log('Testing stat modification functions...');
        
        // Test applyStatChange
        const originalStrength = window.gameState.stats.strength;
        try {
            const result = window.inkStory.CallExternalFunction("applyStatChange", "strength", 2);
            suite.assert(typeof result === 'number', 'applyStatChange returns number');
            suite.assert(window.gameState.stats.strength > originalStrength, 'applyStatChange modified strength stat');
            console.log(`Strength changed from ${originalStrength} to ${window.gameState.stats.strength}`);
        } catch (error) {
            suite.assert(false, `applyStatChange failed: ${error.message}`);
        }
        
        // Test 2: Currency Functions
        console.log('Testing currency functions...');
        
        // Test formatCurrency
        try {
            const result = window.inkStory.CallExternalFunction("formatCurrency", 240);
            suite.assert(typeof result === 'string', 'formatCurrency returns string');
            suite.assert(result.includes('£'), 'formatCurrency includes pound symbol');
            console.log(`Formatted currency: ${result}`);
        } catch (error) {
            suite.assert(false, `formatCurrency failed: ${error.message}`);
        }
        
        // Test 3: Condition Functions
        console.log('Testing condition functions...');
        
        // Test addCondition
        try {
            window.inkStory.CallExternalFunction("addCondition", "test_condition", "negative", 5);
            const hasCondition = window.inkStory.CallExternalFunction("hasCondition", "test_condition");
            suite.assert(hasCondition === true, 'addCondition and hasCondition work together');
        } catch (error) {
            suite.assert(false, `addCondition/hasCondition failed: ${error.message}`);
        }
        
        // Test removeCondition
        try {
            window.inkStory.CallExternalFunction("removeCondition", "test_condition");
            const hasCondition = window.inkStory.CallExternalFunction("hasCondition", "test_condition");
            suite.assert(hasCondition === false, 'removeCondition removes condition');
        } catch (error) {
            suite.assert(false, `removeCondition failed: ${error.message}`);
        }
        
        // Test 4: Stat Calculation Functions
        console.log('Testing stat calculation functions...');
        
        // Test getEffectiveStat
        try {
            const result = window.inkStory.CallExternalFunction("getEffectiveStat", "strength");
            suite.assert(typeof result === 'number', 'getEffectiveStat returns number');
            suite.assert(result >= 0, 'getEffectiveStat returns non-negative value');
        } catch (error) {
            suite.assert(false, `getEffectiveStat failed: ${error.message}`);
        }
        
        // Test rollDice
        try {
            const result = window.inkStory.CallExternalFunction("rollDice", 2);
            suite.assert(typeof result === 'number', 'rollDice returns number');
            suite.assert(result >= 3 && result <= 23, 'rollDice returns valid range (3-23 for 2d10+2)');
        } catch (error) {
            suite.assert(false, `rollDice failed: ${error.message}`);
        }
        
        // Test resolveAction
        try {
            const result = window.inkStory.CallExternalFunction("resolveAction", "strength", 5, 0);
            suite.assert(typeof result === 'object', 'resolveAction returns object');
            suite.assert(typeof result.success === 'boolean', 'resolveAction includes success boolean');
            suite.assert(typeof result.roll === 'number', 'resolveAction includes roll number');
        } catch (error) {
            suite.assert(false, `resolveAction failed: ${error.message}`);
        }
        
        // Test 5: Combat Functions
        console.log('Testing combat functions...');
        
        // Test triggerCombat (should return Promise or object)
        try {
            const result = window.inkStory.CallExternalFunction("triggerCombat", "bandit");
            suite.assert(result !== undefined, 'triggerCombat returns something');
            console.log('Combat trigger result type:', typeof result);
        } catch (error) {
            suite.assert(false, `triggerCombat failed: ${error.message}`);
        }
        
        // Test triggerSkirmish
        try {
            const result = window.inkStory.CallExternalFunction("triggerSkirmish", "roadside");
            suite.assert(result !== undefined, 'triggerSkirmish returns something');
        } catch (error) {
            suite.assert(false, `triggerSkirmish failed: ${error.message}`);
        }
        
        // Test 6: UI Functions
        console.log('Testing UI functions...');
        
        // Test showNotification
        try {
            window.inkStory.CallExternalFunction("showNotification", "Test Title", "Test Message", "info");
            suite.assert(true, 'showNotification executes without error');
        } catch (error) {
            suite.assert(false, `showNotification failed: ${error.message}`);
        }
        
        // Test 7: Equipment Functions
        console.log('Testing equipment functions...');
        
        // Test hasShieldEquipped
        try {
            const result = window.inkStory.CallExternalFunction("hasShieldEquipped");
            suite.assert(typeof result === 'boolean', 'hasShieldEquipped returns boolean');
        } catch (error) {
            suite.assert(false, `hasShieldEquipped failed: ${error.message}`);
        }
        
        // Test 8: Chapter Progress Functions
        console.log('Testing chapter progress functions...');
        
        // Test markChapterStarted
        try {
            window.inkStory.CallExternalFunction("markChapterStarted", "chapter_1");
            const startedVar = window.inkStory.variablesState.chapter_1_started;
            suite.assertEqual(startedVar, true, 'markChapterStarted sets chapter started variable');
        } catch (error) {
            suite.assert(false, `markChapterStarted failed: ${error.message}`);
        }
        
        // Test markChapterCompleted
        try {
            window.inkStory.CallExternalFunction("markChapterCompleted", "chapter_1");
            const completedVar = window.inkStory.variablesState.chapter_1_completed;
            suite.assertEqual(completedVar, true, 'markChapterCompleted sets chapter completed variable');
        } catch (error) {
            suite.assert(false, `markChapterCompleted failed: ${error.message}`);
        }
        
        // Test 9: Function Performance
        console.log('Testing function performance...');
        
        const functionTests = [
            { name: "applyStatChange", args: ["strength", 1] },
            { name: "formatCurrency", args: [240] },
            { name: "hasCondition", args: ["exhausted"] },
            { name: "getEffectiveStat", args: ["strength"] },
            { name: "rollDice", args: [2] },
            { name: "resolveAction", args: ["strength", 5, 0] }
        ];
        
        for (const test of functionTests) {
            suite.startPerformanceTimer(`function-${test.name}`);
            
            try {
                for (let i = 0; i < 10; i++) {
                    window.inkStory.CallExternalFunction(test.name, ...test.args);
                }
            } catch (error) {
                suite.assert(false, `Performance test for ${test.name} failed: ${error.message}`);
            }
            
            suite.endPerformanceTimer(`function-${test.name}`);
            suite.checkPerformanceThreshold(`function-${test.name}`, 100); // Each function should be < 100ms for 10 calls
        }
        
        // Test 10: Error Handling
        console.log('Testing error handling...');
        
        // Test with invalid arguments
        suite.assertThrows(() => {
            window.inkStory.CallExternalFunction("applyStatChange", "invalid_stat", 1);
        }, 'applyStatChange handles invalid stat name');
        
        suite.assertThrows(() => {
            window.inkStory.CallExternalFunction("formatCurrency", "not_a_number");
        }, 'formatCurrency handles invalid input');
        
        suite.assertThrows(() => {
            window.inkStory.CallExternalFunction("getEffectiveStat", "nonexistent_stat");
        }, 'getEffectiveStat handles invalid stat');
        
        // Test 11: Function Integration with State
        console.log('Testing function integration with state...');
        
        // Test that stat changes persist
        const originalWealth = window.gameState.stats.wealth;
        try {
            window.inkStory.CallExternalFunction("applyStatChange", "wealth", 10);
            const newWealth = window.gameState.stats.wealth;
            suite.assertEqual(newWealth, originalWealth + 10, 'Stat change persists from external function');
        } catch (error) {
            suite.assert(false, `Stat persistence test failed: ${error.message}`);
        }
        
        // Test that conditions are properly synchronized
        try {
            window.inkStory.CallExternalFunction("addCondition", "sync_test", "positive", 3);
            
            // Check if condition exists in gameState
            const conditionExists = window.gameState.conditions && 
                window.gameState.conditions.some(c => c.name === "sync_test");
            suite.assert(conditionExists, 'Condition added via external function syncs to gameState');
            
            // Clean up
            window.inkStory.CallExternalFunction("removeCondition", "sync_test");
        } catch (error) {
            suite.assert(false, `Condition sync test failed: ${error.message}`);
        }
        
        // Test 12: Memory Usage During Function Calls
        console.log('Testing memory usage during function calls...');
        
        suite.startMemoryTest('external-functions-memory');
        
        // Perform intensive function calls
        for (let i = 0; i < 100; i++) {
            try {
                window.inkStory.CallExternalFunction("rollDice", 1);
                window.inkStory.CallExternalFunction("getEffectiveStat", "strength");
                window.inkStory.CallExternalFunction("formatCurrency", i * 10);
            } catch (error) {
                // Ignore errors for memory test
            }
        }
        
        suite.endMemoryTest('external-functions-memory', 1); // Allow 1MB for function calls
        
        // Test 13: All Functions Available
        console.log('Testing all functions are available...');
        
        const allExpectedFunctions = [
            "applyStatChange", "formatCurrency", "addCondition", "removeCondition",
            "hasCondition", "triggerCombat", "triggerSkirmish", "showNotification",
            "getEffectiveStat", "rollDice", "resolveAction", "hasShieldEquipped",
            "markChapterStarted", "markChapterCompleted"
        ];
        
        for (const funcName of allExpectedFunctions) {
            try {
                // Just test that the function is bound and callable
                const result = window.inkStory.CallExternalFunction(funcName);
                suite.assert(true, `External function ${funcName} is bound and callable`);
            } catch (error) {
                // Some functions might require specific arguments, so we check if it's a "not bound" error
                if (error.message && error.message.includes('not bound')) {
                    suite.assert(false, `External function ${funcName} is not bound`);
                } else {
                    // Other errors are okay - just means the function is bound but has validation
                    suite.assert(true, `External function ${funcName} is bound (validation error expected)`);
                }
            }
        }
        
        suite.endTestGroup();
        
        console.log('External function integration validation complete');
        return suite.getResults();
    }
    
    // ============================================
    // Public API
    // ============================================
    
    window.ExternalFunctionValidation = {
        run: runExternalFunctionValidation
    };
    
    console.log('External function validation module loaded');
    
})();
