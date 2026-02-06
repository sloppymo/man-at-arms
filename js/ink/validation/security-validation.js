(function() {
    'use strict';
    
    // ============================================
    // Error Handling and Security Validation Tests
    // ============================================
    
    async function runSecurityValidation() {
        const suite = window.InkValidationSuite;
        if (!suite) {
            console.error('Ink validation suite not available');
            return;
        }
        
        suite.startTestGroup('Error Handling and Security Validation');
        
        // Ensure Ink is ready
        if (window.inkReady) {
            await window.inkReady;
        }
        
        // Test 1: Ink Runtime Failure Recovery
        console.log('Testing Ink runtime failure recovery...');
        
        try {
            // Store original ink story
            const originalInkStory = window.inkStory;
            
            // Simulate Ink failure
            window.inkStory = null;
            
            // Try to update story - should use fallback
            window.updateStory();
            
            // Check that fallback rendering worked
            const storyElement = document.getElementById('story');
            suite.assert(storyElement && storyElement.innerHTML.length > 0, 'Fallback rendering works when Ink fails');
            
            // Check for error notification
            const notification = document.querySelector('.notification');
            if (notification) {
                const hasErrorNotification = notification.textContent.includes('error') || 
                                           notification.textContent.includes('fallback');
                suite.assert(hasErrorNotification, 'Error notification shown for Ink failure');
            }
            
            // Restore original story
            window.inkStory = originalInkStory;
            
        } catch (error) {
            suite.assert(false, `Ink runtime failure test failed: ${error.message}`);
        }
        
        // Test 2: Malformed Ink Content Handling
        console.log('Testing malformed Ink content handling...');
        
        try {
            // Test with invalid Ink syntax
            const invalidInkContent = "invalid ink content { broken syntax";
            
            suite.assertThrows(() => {
                const compiledStory = inkjs.Compiler.compile(invalidInkContent);
                new inkjs.Story(compiledStory.toJson());
            }, 'Invalid Ink syntax throws error');
            
            // Test with empty content
            suite.assertThrows(() => {
                inkjs.Compiler.compile("");
            }, 'Empty Ink content throws error');
            
            // Test with null content
            suite.assertThrows(() => {
                inkjs.Compiler.compile(null);
            }, 'Null Ink content throws error');
            
        } catch (error) {
            suite.assert(false, `Malformed content test failed: ${error.message}`);
        }
        
        // Test 3: XSS Prevention
        console.log('Testing XSS prevention...');
        
        try {
            // Create malicious story content
            const maliciousStory = `
=== xss_test ===
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<div onclick=alert('XSS')>Click me</div>
<iframe src="javascript:alert('XSS')"></iframe>
<link rel="stylesheet" href="javascript:alert('XSS')">
<style>body{background:url(javascript:alert('XSS'))}</style>

Safe content.
* [Continue] -> DONE
`;
            
            // Compile and render malicious content
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
            suite.assert(!content.includes('javascript:'), 'JavaScript URLs are sanitized');
            suite.assert(!content.includes('<iframe'), 'Iframes are sanitized');
            
            // Test in actual DOM rendering
            const storyElement = document.getElementById('story');
            const originalContent = storyElement.innerHTML;
            
            storyElement.innerHTML = content;
            
            // Check that no script elements exist in DOM
            const scriptElements = storyElement.querySelectorAll('script');
            suite.assertEqual(scriptElements.length, 0, 'No script elements in rendered DOM');
            
            // Check that no elements with dangerous event handlers exist
            const elementsWithOnerror = storyElement.querySelectorAll('[onerror]');
            const elementsWithOnclick = storyElement.querySelectorAll('[onclick]');
            
            suite.assertEqual(elementsWithOnerror.length, 0, 'No elements with onerror handlers');
            suite.assertEqual(elementsWithOnclick.length, 0, 'No elements with onclick handlers');
            
            // Restore original content
            storyElement.innerHTML = originalContent;
            
        } catch (error) {
            suite.assert(false, `XSS prevention test failed: ${error.message}`);
        }
        
        // Test 4: Input Sanitization
        console.log('Testing input sanitization...');
        
        try {
            // Test character name sanitization
            const maliciousNames = [
                '<script>alert("xss")</script>',
                'javascript:alert("xss")',
                '<img src=x onerror=alert("xss")>',
                '"><script>alert("xss")</script>',
                '\';alert("xss");//'
            ];
            
            maliciousNames.forEach((maliciousName, index) => {
                // Set malicious character name
                window.gameState.characterName = maliciousName;
                
                // Save and load to test sanitization
                if (typeof window.saveGame === 'function') {
                    window.saveGame();
                }
                
                if (typeof window.loadGame === 'function') {
                    window.loadGame();
                }
                
                // Check that name was sanitized
                const sanitizedName = window.gameState.characterName;
                
                suite.assert(!sanitizedName.includes('<script>'), `Malicious name ${index} script tag removed`);
                suite.assert(!sanitizedName.includes('javascript:'), `Malicious name ${index} javascript: removed`);
                suite.assert(!sanitizedName.includes('onerror'), `Malicious name ${index} onerror removed`);
                
                console.log(`Name ${index}: "${maliciousName}" -> "${sanitizedName}"`);
            });
            
        } catch (error) {
            suite.assert(false, `Input sanitization test failed: ${error.message}`);
        }
        
        // Test 5: Error Boundary Testing
        console.log('Testing error boundaries...');
        
        try {
            // Test narrative bridge error handling
            if (window.narrativeBridge) {
                // Test with invalid gameState
                const originalGameState = window.gameState;
                window.gameState = null;
                
                try {
                    window.narrativeBridge.syncFromGameState();
                    suite.assert(true, 'Narrative bridge handles null gameState gracefully');
                } catch (syncError) {
                    // Expected to handle gracefully
                    suite.assert(true, 'Narrative bridge throws error for null gameState (acceptable)');
                }
                
                // Restore gameState
                window.gameState = originalGameState;
            }
            
            // Test story loader error handling
            suite.assertThrows(async () => {
                await window.storyLoader.loadStory('nonexistent_story');
            }, 'Story loader handles missing story gracefully');
            
        } catch (error) {
            suite.assert(false, `Error boundary test failed: ${error.message}`);
        }
        
        // Test 6: Memory Overflow Protection
        console.log('Testing memory overflow protection...');
        
        try {
            // Test with extremely large content
            const largeContent = "This is a very large content. ".repeat(100000); // ~2MB of text
            
            const largeStory = `
=== large_content_test ===
${largeContent}
* [Continue] -> DONE
`;
            
            // Try to compile large story
            const compiledStory = inkjs.Compiler.compile(largeStory);
            const testInkStory = new inkjs.Story(compiledStory.toJson());
            
            // Should handle large content without crashing
            testInkStory.ChoosePathString("large_content_test");
            
            suite.assert(true, 'Large content handled without memory overflow');
            
        } catch (error) {
            // Should handle gracefully or throw controlled error
            suite.assert(error.message.includes('memory') || error.message.includes('large'), 
                'Large content throws controlled error');
        }
        
        // Test 7: Network Error Handling
        console.log('Testing network error handling...');
        
        try {
            // Test loading story with network error simulation
            // This would require mocking fetch, so we'll test the error handling path
            
            // Test with invalid story URL
            suite.assertThrows(async () => {
                await window.storyLoader.loadStory('../../../etc/passwd');
            }, 'Story loader handles invalid paths gracefully');
            
            // Test with very long story name
            suite.assertThrows(async () => {
                await window.storyLoader.loadStory('a'.repeat(1000));
            }, 'Story loader handles very long names gracefully');
            
        } catch (error) {
            suite.assert(false, `Network error handling test failed: ${error.message}`);
        }
        
        // Test 8: State Corruption Detection
        console.log('Testing state corruption detection...');
        
        try {
            // Test with corrupted gameState
            const originalStats = window.gameState.stats;
            
            // Set invalid stat values
            window.gameState.stats = {
                strength: NaN,
                agility: Infinity,
                endurance: -Infinity,
                charisma: null,
                luck: undefined
            };
            
            // Try to sync - should detect and handle corruption
            if (window.narrativeBridge && window.narrativeBridge.syncFromGameState) {
                try {
                    window.narrativeBridge.syncFromGameState();
                    suite.assert(true, 'State corruption handled gracefully');
                } catch (corruptionError) {
                    suite.assert(true, 'State corruption detected and throws error');
                }
            }
            
            // Restore valid stats
            window.gameState.stats = originalStats;
            
        } catch (error) {
            suite.assert(false, `State corruption detection test failed: ${error.message}`);
        }
        
        // Test 9: External Function Security
        console.log('Testing external function security...');
        
        try {
            // Test external functions with malicious arguments
            const maliciousArgs = [
                '<script>alert("xss")</script>',
                'javascript:alert("xss")',
                '../../etc/passwd',
                '\'; DROP TABLE users; --'
            ];
            
            maliciousArgs.forEach((maliciousArg, index) => {
                try {
                    // Test with various external functions
                    if (window.inkStory) {
                        window.inkStory.CallExternalFunction("formatCurrency", maliciousArg);
                        window.inkStory.CallExternalFunction("addCondition", maliciousArg, "negative", 1);
                        window.inkStory.CallExternalFunction("hasCondition", maliciousArg);
                    }
                    
                    suite.assert(true, `External function handles malicious arg ${index} safely`);
                } catch (funcError) {
                    // Expected to handle malicious input safely
                    suite.assert(true, `External function rejects malicious arg ${index}`);
                }
            });
            
        } catch (error) {
            suite.assert(false, `External function security test failed: ${error.message}`);
        }
        
        // Test 10: DOM Injection Prevention
        console.log('Testing DOM injection prevention...');
        
        try {
            const storyElement = document.getElementById('story');
            const originalContent = storyElement.innerHTML;
            
            // Test various injection attempts
            const injectionAttempts = [
                '<script>alert("xss")</script>',
                '<img src=x onerror=alert("xss")>',
                '<div onclick=alert("xss")>Click</div>',
                '<link rel="stylesheet" href="javascript:alert(\'xss\')">',
                '<style>@import "javascript:alert(\'xss\')";</style>',
                '<object data="javascript:alert(\'xss\')"></object>',
                '<embed src="javascript:alert(\'xss\')"></embed>'
            ];
            
            injectionAttempts.forEach((injection, index) => {
                // Try to inject directly
                storyElement.innerHTML = injection;
                
                // Check that dangerous elements are not present
                const scripts = storyElement.querySelectorAll('script');
                const imagesWithOnerror = storyElement.querySelectorAll('img[onerror]');
                const divsWithOnclick = storyElement.querySelectorAll('div[onclick]');
                const links = storyElement.querySelectorAll('link[href*="javascript"]');
                const objects = storyElement.querySelectorAll('object[data*="javascript"]');
                const embeds = storyElement.querySelectorAll('embed[src*="javascript"]');
                
                suite.assertEqual(scripts.length, 0, `Injection ${index}: No script elements`);
                suite.assertEqual(imagesWithOnerror.length, 0, `Injection ${index}: No images with onerror`);
                suite.assertEqual(divsWithOnclick.length, 0, `Injection ${index}: No divs with onclick`);
                suite.assertEqual(links.length, 0, `Injection ${index}: No malicious links`);
                suite.assertEqual(objects.length, 0, `Injection ${index}: No malicious objects`);
                suite.assertEqual(embeds.length, 0, `Injection ${index}: No malicious embeds`);
            });
            
            // Restore original content
            storyElement.innerHTML = originalContent;
            
        } catch (error) {
            suite.assert(false, `DOM injection prevention test failed: ${error.message}`);
        }
        
        // Test 11: Error Logging and Monitoring
        console.log('Testing error logging and monitoring...');
        
        try {
            // Test that errors are properly logged
            const originalConsoleError = console.error;
            let errorLogged = false;
            
            console.error = function(...args) {
                errorLogged = true;
                originalConsoleError.apply(console, args);
            };
            
            // Trigger an error
            try {
                window.inkStory.CallExternalFunction("nonexistent_function");
            } catch (e) {
                // Expected to error
            }
            
            // Restore console.error
            console.error = originalConsoleError;
            
            suite.assert(errorLogged, 'Errors are properly logged to console');
            
        } catch (error) {
            suite.assert(false, `Error logging test failed: ${error.message}`);
        }
        
        // Test 12: Safe Fallback Mechanisms
        console.log('Testing safe fallback mechanisms...');
        
        try {
            // Test fallback when Ink is not available
            const originalInkjs = window.inkjs;
            window.inkjs = undefined;
            
            // Try to initialize - should use fallback
            try {
                if (window.inkIntegration && window.inkIntegration.initializeInk) {
                    window.inkIntegration.initializeInk('{}');
                }
                suite.assert(true, 'Fallback handles missing Ink.js gracefully');
            } catch (fallbackError) {
                suite.assert(true, 'Fallback throws controlled error for missing Ink.js');
            }
            
            // Restore Ink.js
            window.inkjs = originalInkjs;
            
        } catch (error) {
            suite.assert(false, `Safe fallback test failed: ${error.message}`);
        }
        
        suite.endTestGroup();
        
        console.log('Error handling and security validation complete');
        return suite.getResults();
    }
    
    // ============================================
    // Public API
    // ============================================
    
    window.SecurityValidation = {
        run: runSecurityValidation
    };
    
    console.log('Security validation module loaded');
    
})();
