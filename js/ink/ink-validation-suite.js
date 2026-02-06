(function() {
    'use strict';
    
    // ============================================
    // Ink.js Integration Validation Suite
    // ============================================
    
    let testResults = {
        passed: 0,
        failed: 0,
        total: 0,
        errors: [],
        performance: {},
        memory: {}
    };
    
    let currentTestGroup = '';
    let testStartTime = 0;
    
    // ============================================
    // Assertion Framework
    // ============================================
    
    function assert(condition, message) {
        testResults.total++;
        if (condition) {
            testResults.passed++;
            console.log(`✓ ${message}`);
            return true;
        } else {
            testResults.failed++;
            const errorMessage = `✗ ${message}`;
            console.error(errorMessage);
            testResults.errors.push({
                group: currentTestGroup,
                message: errorMessage,
                timestamp: new Date().toISOString()
            });
            return false;
        }
    }
    
    function assertEqual(actual, expected, message) {
        return assert(actual === expected, `${message} (expected: ${expected}, actual: ${actual})`);
    }
    
    function assertNotEqual(actual, expected, message) {
        return assert(actual !== expected, `${message} (should not be: ${expected})`);
    }
    
    function assertThrows(fn, message) {
        try {
            fn();
            return assert(false, `${message} (should have thrown error)`);
        } catch (error) {
            return assert(true, message);
        }
    }
    
    function assertContains(container, item, message) {
        const contains = Array.isArray(container) ? container.includes(item) : 
                        typeof container === 'string' ? container.includes(item) :
                        container && typeof container === 'object' ? item in container : false;
        return assert(contains, `${message} (container: ${JSON.stringify(container)}, item: ${item})`);
    }
    
    // ============================================
    // Performance Monitoring
    // ============================================
    
    function startPerformanceTimer(testName) {
        testResults.performance[testName] = { startTime: performance.now() };
    }
    
    function endPerformanceTimer(testName) {
        if (testResults.performance[testName]) {
            const endTime = performance.now();
            testResults.performance[testName].endTime = endTime;
            testResults.performance[testName].duration = endTime - testResults.performance[testName].startTime;
        }
    }
    
    function checkPerformanceThreshold(testName, thresholdMs) {
        const perf = testResults.performance[testName];
        if (perf && perf.duration) {
            return assert(perf.duration < thresholdMs, 
                `${testName} performance < ${thresholdMs}ms (actual: ${perf.duration.toFixed(2)}ms)`);
        }
        return false;
    }
    
    // ============================================
    // Memory Monitoring
    // ============================================
    
    function getMemoryUsage() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }
    
    function startMemoryTest(testName) {
        const memory = getMemoryUsage();
        if (memory) {
            testResults.memory[testName] = { startMemory: memory.used };
        }
    }
    
    function endMemoryTest(testName, maxIncreaseMB = 10) {
        const memory = getMemoryUsage();
        if (memory && testResults.memory[testName]) {
            const startMemory = testResults.memory[testName].startMemory;
            const increase = memory.used - startMemory;
            const increaseMB = increase / (1024 * 1024);
            
            testResults.memory[testName].endMemory = memory.used;
            testResults.memory[testName].increase = increase;
            testResults.memory[testName].increaseMB = increaseMB;
            
            return assert(increaseMB < maxIncreaseMB, 
                `${testName} memory increase < ${maxIncreaseMB}MB (actual: ${increaseMB.toFixed(2)}MB)`);
        }
        return true; // Skip test if memory monitoring unavailable
    }
    
    // ============================================
    // Test Group Management
    // ============================================
    
    function startTestGroup(groupName) {
        currentTestGroup = groupName;
        testStartTime = performance.now();
        console.log(`\n=== Running ${groupName} Tests ===`);
    }
    
    function endTestGroup() {
        const duration = performance.now() - testStartTime;
        console.log(`=== ${currentTestGroup} Complete (${duration.toFixed(2)}ms) ===\n`);
        currentTestGroup = '';
    }
    
    // ============================================
    // DOM Utilities for Testing
    // ============================================
    
    function waitForElement(selector, timeout = 5000) {
        return new Promise((resolve) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }
            
            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            setTimeout(() => {
                observer.disconnect();
                resolve(null);
            }, timeout);
        });
    }
    
    function simulateClick(element) {
        if (element) {
            const event = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            element.dispatchEvent(event);
        }
    }
    
    // ============================================
    // Test Data and Mocks
    // ============================================
    
    const mockInkStory = `
=== test_basic ===
Test content for basic rendering.
* [Choice 1] -> test_choice1
* [Choice 2] -> test_choice2

=== test_choice1 ===
You chose choice 1.
* [Continue] -> DONE

=== test_choice2 ===
You chose choice 2.
* [Continue] -> DONE

=== test_tags ===
# artwork: test-image.jpg
# caption: Test caption
# music: test-music.mp3
# sound: test-sound.wav
# font: fraktur
# dialect: french

Content with various tags.
* [Continue] -> DONE

=== test_stats ===
Testing stat modifications.
* [Increase Strength] -> test_stats_increase
* [Decrease Agility] -> test_stats_decrease
* [Continue] -> DONE

=== test_stats_increase ===
Strength increased!
* [Continue] -> DONE

=== test_stats_decrease ===
Agility decreased!
* [Continue] -> DONE
`;
    
    // ============================================
    // Public API
    // ============================================
    
    window.InkValidationSuite = {
        // Core testing functions
        assert,
        assertEqual,
        assertNotEqual,
        assertThrows,
        assertContains,
        
        // Performance and memory
        startPerformanceTimer,
        endPerformanceTimer,
        checkPerformanceThreshold,
        startMemoryTest,
        endMemoryTest,
        
        // Test group management
        startTestGroup,
        endTestGroup,
        
        // Utilities
        waitForElement,
        simulateClick,
        
        // Test data
        mockInkStory,
        
        // Results
        getResults: () => ({ ...testResults }),
        resetResults: () => {
            testResults = {
                passed: 0,
                failed: 0,
                total: 0,
                errors: [],
                performance: {},
                memory: {}
            };
        },
        
        // Reporting
        generateReport: function() {
            const report = {
                summary: {
                    total: testResults.total,
                    passed: testResults.passed,
                    failed: testResults.failed,
                    successRate: testResults.total > 0 ? (testResults.passed / testResults.total * 100).toFixed(2) + '%' : '0%'
                },
                errors: testResults.errors,
                performance: testResults.performance,
                memory: testResults.memory,
                timestamp: new Date().toISOString()
            };
            
            console.log('\n=== VALIDATION REPORT ===');
            console.log(`Total Tests: ${report.summary.total}`);
            console.log(`Passed: ${report.summary.passed}`);
            console.log(`Failed: ${report.summary.failed}`);
            console.log(`Success Rate: ${report.summary.successRate}`);
            
            if (report.errors.length > 0) {
                console.log('\nErrors:');
                report.errors.forEach(error => {
                    console.log(`  ${error.group}: ${error.message}`);
                });
            }
            
            return report;
        }
    };
    
    console.log('Ink validation suite loaded');
    
})();
