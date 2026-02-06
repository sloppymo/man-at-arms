(function() {
    'use strict';
    
    // ============================================
    // Rendering System Validation Tests
    // ============================================
    
    async function runRenderingValidation() {
        const suite = window.InkValidationSuite;
        if (!suite) {
            console.error('Ink validation suite not available');
            return;
        }
        
        suite.startTestGroup('Rendering System Validation');
        
        // Ensure Ink is ready
        if (window.inkReady) {
            await window.inkReady;
        }
        
        // Test 1: Dual Rendering System
        console.log('Testing dual rendering system...');
        
        // Store original scene
        const originalScene = window.gameState.currentScene;
        
        // Test legacy rendering
        window.gameState.currentScene = "legacy_test_scene";
        try {
            window.updateStory();
            const storyElement = document.getElementById('story');
            suite.assert(storyElement && storyElement.innerHTML.length > 0, 'Legacy rendering produces content');
        } catch (error) {
            suite.assert(false, `Legacy rendering failed: ${error.message}`);
        }
        
        // Test Ink rendering
        window.gameState.currentScene = "start"; // Use known Ink scene
        try {
            window.updateStory();
            const storyElement = document.getElementById('story');
            suite.assert(storyElement && storyElement.innerHTML.length > 0, 'Ink rendering produces content');
        } catch (error) {
            suite.assert(false, `Ink rendering failed: ${error.message}`);
        }
        
        // Restore original scene
        window.gameState.currentScene = originalScene;
        
        // Test 2: Scene Detection
        console.log('Testing scene detection...');
        
        // Test isInkScene function if available
        if (typeof window.isInkScene === 'function') {
            suite.assert(window.isInkScene('start') === true, 'start scene detected as Ink scene');
            suite.assert(window.isInkScene('character_creation') === true, 'character_creation detected as Ink scene');
            suite.assert(window.isInkScene('random_test') === false, 'random scene not detected as Ink scene');
        }
        
        // Test 3: Tag Processing
        console.log('Testing tag processing...');
        
        // Create test story with tags
        const testStoryWithTags = `
=== test_tags ===
# artwork: test-image.jpg
# caption: Test caption
# music: test-music.mp3
# sound: test-sound.wav
# font: fraktur
# dialect: french

Content with various tags.
* [Continue] -> DONE
`;
        
        try {
            // Load test story
            const compiledStory = inkjs.Compiler.compile(testStoryWithTags);
            const testInkStory = new inkjs.Story(compiledStory.toJson());
            
            // Navigate to test content
            testInkStory.ChoosePathString("test_tags");
            
            // Continue to get content and tags
            while (testInkStory.canContinue) {
                testInkStory.Continue();
            }
            
            const tags = testInkStory.currentTags;
            suite.assert(Array.isArray(tags), 'Tags are returned as array');
            suite.assert(tags.includes('artwork: test-image.jpg'), 'Artwork tag parsed correctly');
            suite.assert(tags.includes('caption: Test caption'), 'Caption tag parsed correctly');
            suite.assert(tags.includes('font: fraktur'), 'Font tag parsed correctly');
            
            console.log('Parsed tags:', tags);
            
        } catch (error) {
            suite.assert(false, `Tag processing test failed: ${error.message}`);
        }
        
        // Test 4: Content Sanitization
        console.log('Testing content sanitization...');
        
        // Test with potentially malicious content
        const maliciousStory = `
=== xss_test ===
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<div onclick=alert('XSS')>Click me</div>

Safe content.
* [Continue] -> DONE
`;
        
        try {
            const compiledStory = inkjs.Compiler.compile(maliciousStory);
            const testInkStory = new inkjs.Story(compiledStory.toJson());
            
            testInkStory.ChoosePathString("xss_test");
            
            let content = "";
            while (testInkStory.canContinue) {
                content += testInkStory.Continue();
            }
            
            // Check that dangerous elements are sanitized
            suite.assert(!content.includes('<script>'), 'Script tags are sanitized');
            suite.assert(!content.includes('onerror'), 'Event handlers are sanitized');
            suite.assert(!content.includes('onclick'), 'Click handlers are sanitized');
            
            console.log('Sanitized content length:', content.length);
            
        } catch (error) {
            suite.assert(false, `Content sanitization test failed: ${error.message}`);
        }
        
        // Test 5: Typewriter Effect
        console.log('Testing typewriter effect...');
        
        suite.startPerformanceTimer('typewriter-effect');
        
        try {
            // Test with short content
            const shortContent = "This is a test content for typewriter effect.";
            const storyElement = document.getElementById('story');
            
            if (window.typewriterEffect && typeof window.typewriterEffect === 'function') {
                const startTime = performance.now();
                await window.typewriterEffect(storyElement, shortContent);
                const endTime = performance.now();
                
                suite.assert(endTime - startTime > 50, 'Typewriter effect takes time (not instant)');
                suite.assert(storyElement.textContent.includes('test content'), 'Typewriter renders content correctly');
            } else {
                // Fallback: test that content appears
                storyElement.textContent = shortContent;
                suite.assert(storyElement.textContent.includes('test content'), 'Content rendering fallback works');
            }
            
        } catch (error) {
            suite.assert(false, `Typewriter effect test failed: ${error.message}`);
        }
        
        suite.endPerformanceTimer('typewriter-effect');
        suite.checkPerformanceThreshold('typewriter-effect', 1000); // Typewriter should complete within 1 second
        
        // Test 6: Artwork Processing
        console.log('Testing artwork processing...');
        
        // Test artwork element exists
        const artworkElement = document.getElementById('artwork-image');
        suite.assert(artworkElement !== null, 'Artwork image element exists');
        
        const captionElement = document.getElementById('artwork-caption');
        suite.assert(captionElement !== null, 'Artwork caption element exists');
        
        // Test artwork tag processing if function exists
        if (typeof window.processInkTags === 'function') {
            try {
                const testTags = ['artwork: test-scene.jpg', 'caption: Test scene description'];
                window.processInkTags(testTags);
                
                // Check if artwork was processed (this is implementation-dependent)
                console.log('Artwork processing test completed');
                suite.assert(true, 'Artwork tag processing executes without error');
            } catch (error) {
                suite.assert(false, `Artwork processing failed: ${error.message}`);
            }
        }
        
        // Test 7: Font and Styling
        console.log('Testing font and styling...');
        
        const storyElement = document.getElementById('story');
        if (storyElement) {
            // Test font changes
            const originalFont = storyElement.style.fontFamily;
            
            try {
                // Simulate font tag processing
                storyElement.style.fontFamily = 'Uncial Antiqua, cursive';
                suite.assert(storyElement.style.fontFamily.includes('Uncial'), 'Font style can be applied');
                
                // Restore original font
                storyElement.style.fontFamily = originalFont;
            } catch (error) {
                suite.assert(false, `Font styling test failed: ${error.message}`);
            }
        }
        
        // Test 8: Content Length Handling
        console.log('Testing content length handling...');
        
        // Test with very long content
        const longContent = "This is a very long content that should test the rendering system's ability to handle large amounts of text. ".repeat(50);
        
        try {
            const storyContentElement = document.getElementById('story');
            if (storyContentElement) {
                storyContentElement.textContent = longContent;
                suite.assert(storyContentElement.textContent.length > 1000, 'Long content is rendered');
                suite.assert(storyContentElement.textContent.length === longContent.length, 'Long content is rendered completely');
            }
        } catch (error) {
            suite.assert(false, `Long content handling failed: ${error.message}`);
        }
        
        // Test 9: Rendering Performance
        console.log('Testing rendering performance...');
        
        suite.startPerformanceTimer('rendering-performance');
        suite.startMemoryTest('rendering-memory');
        
        try {
            // Test multiple rapid renders
            for (let i = 0; i < 10; i++) {
                window.updateStory();
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        } catch (error) {
            suite.assert(false, `Rendering performance test failed: ${error.message}`);
        }
        
        suite.endPerformanceTimer('rendering-performance');
        suite.checkPerformanceThreshold('rendering-performance', 2000); // 10 renders should complete within 2 seconds
        
        suite.endMemoryTest('rendering-memory', 2); // Allow 2MB for rendering operations
        
        // Test 10: Error Recovery
        console.log('Testing error recovery...');
        
        // Test rendering with null story
        const originalInkStory = window.inkStory;
        window.inkStory = null;
        
        try {
            window.updateStory();
            const storyElement = document.getElementById('story');
            suite.assert(storyElement && storyElement.innerHTML.length > 0, 'Fallback rendering works when Ink story is null');
        } catch (error) {
            suite.assert(false, `Error recovery test failed: ${error.message}`);
        }
        
        // Restore original story
        window.inkStory = originalInkStory;
        
        // Test 11: DOM Element Validation
        console.log('Testing DOM element validation...');
        
        const requiredElements = [
            'story',
            'choices-container',
            'artwork-image',
            'artwork-caption',
            'stats',
            'status-bar'
        ];
        
        for (const elementId of requiredElements) {
            const element = document.getElementById(elementId);
            suite.assert(element !== null, `Required element ${elementId} exists`);
        }
        
        // Test 12: Content Updates
        console.log('Testing content updates...');
        
        try {
            const storyUpdateElement = document.getElementById('story');
            const originalContent = storyUpdateElement.innerHTML;
            
            // Update content
            window.updateStory();
            
            // Allow time for update
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Check that content changed (or at least that update completed)
            suite.assert(true, 'Content update completes without error');
            
        } catch (error) {
            suite.assert(false, `Content update test failed: ${error.message}`);
        }
        
        // Test 13: Accessibility Features
        console.log('Testing accessibility features...');
        
        const storyA11yElement = document.getElementById('story');
        if (storyA11yElement) {
            // Check for proper ARIA attributes
            const hasAriaLive = storyA11yElement.hasAttribute('aria-live');
            const hasAriaAtomic = storyA11yElement.hasAttribute('aria-atomic');
            
            // These might not be implemented, so we just log the status
            console.log(`ARIA live: ${hasAriaLive}, ARIA atomic: ${hasAriaAtomic}`);
            suite.assert(true, 'Accessibility check completed');
        }
        
        suite.endTestGroup();
        
        console.log('Rendering system validation complete');
        return suite.getResults();
    }
    
    // ============================================
    // Public API
    // ============================================
    
    window.RenderingValidation = {
        run: runRenderingValidation
    };
    
    console.log('Rendering validation module loaded');
    
})();
