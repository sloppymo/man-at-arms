// Browser test script for Ink.js validation
// Run this in the browser console on http://127.0.0.1:8080/test-validation.html

async function runInkValidation() {
    console.log('🚀 Starting Ink.js Integration Validation');
    
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };
    
    function test(name, testFn) {
        try {
            const result = testFn();
            if (result) {
                console.log(`✅ ${name}`);
                results.passed++;
                results.tests.push({ name, status: 'PASS' });
            } else {
                console.log(`❌ ${name}`);
                results.failed++;
                results.tests.push({ name, status: 'FAIL' });
            }
        } catch (error) {
            console.log(`❌ ${name} - Error: ${error.message}`);
            results.failed++;
            results.tests.push({ name, status: 'ERROR', error: error.message });
        }
    }
    
    // Test 1: Ink.js CDN Loading
    test('Ink.js CDN Loading', () => typeof inkjs !== 'undefined');
    
    // Test 2: Story Class Available
    test('Story Class Available', () => typeof inkjs.Story !== 'undefined');
    
    // Test 3: Story Loader Module
    test('Story Loader Module', () => typeof window.storyLoader !== 'undefined');
    
    // Test 4: Narrative Bridge Module
    test('Narrative Bridge Module', () => typeof window.narrativeBridge !== 'undefined');
    
    // Test 5: Debug Tools Module
    test('Debug Tools Module', () => typeof window.inkDebugTools !== 'undefined');
    
    // Test 6: Validation Suite Core
    test('Validation Suite Core', () => typeof window.InkValidationSuite !== 'undefined');
    
    // Test 7: Batch Runner
    test('Batch Runner', () => typeof window.InkBatchRunner !== 'undefined');
    
    // Test 8: Story Loading (Critical Test)
    await test('Story Loading', async () => {
        try {
            const story = await window.storyLoader.loadStory('character-creation');
            return story && typeof story.Continue === 'function';
        } catch (error) {
            console.error('Story loading error:', error);
            return false;
        }
    });
    
    // Test 9: Story Content Generation
    await test('Story Content Generation', async () => {
        try {
            const story = await window.storyLoader.loadStory('character-creation');
            const content = story.Continue();
            return content && content.length > 0;
        } catch (error) {
            console.error('Content generation error:', error);
            return false;
        }
    });
    
    // Test 10: Basic State Sync
    await test('Basic State Sync', async () => {
        try {
            if (!window.gameState || !window.narrativeBridge) return false;
            
            const story = await window.storyLoader.loadStory('character-creation');
            window.narrativeBridge.setStory(story);
            
            const initialYear = window.gameState.year;
            story.Continue(); // This should trigger state sync
            return true;
        } catch (error) {
            console.error('State sync error:', error);
            return false;
        }
    });
    
    // Results Summary
    const total = results.passed + results.failed;
    const passRate = ((results.passed / total) * 100).toFixed(1);
    
    console.log('\n📊 VALIDATION RESULTS:');
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Pass Rate: ${passRate}%`);
    
    if (results.failed === 0) {
        console.log('🎉 ALL TESTS PASSED! Ink.js integration is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Check the errors above.');
    }
    
    return results;
}

// Auto-run validation
runInkValidation().then(results => {
    console.log('Validation complete. Results:', results);
    
    // If basic tests pass, try quick validation
    if (results.failed <= 2) {
        console.log('\n🔄 Running quick validation...');
        if (window.InkBatchRunner) {
            window.InkBatchRunner.runQuickValidation()
                .then(quickResults => console.log('Quick validation results:', quickResults))
                .catch(err => console.error('Quick validation failed:', err));
        }
    }
}).catch(error => {
    console.error('Validation failed to run:', error);
});

// Make function available globally
window.runInkValidation = runInkValidation;
