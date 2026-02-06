(function() {
    'use strict';
    
    // ============================================
    // Debug Tools for Ink.js Integration
    // ============================================
    
    let debugMode = false;
    let logLevel = 'info'; // 'debug', 'info', 'warn', 'error'
    
    /**
     * Enable/disable debug mode
     * @param {boolean} enabled - Whether to enable debug mode
     */
    function setDebugMode(enabled) {
        debugMode = enabled;
        console.log(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Set log level
     * @param {string} level - Log level ('debug', 'info', 'warn', 'error')
     */
    function setLogLevel(level) {
        const validLevels = ['debug', 'info', 'warn', 'error'];
        if (validLevels.includes(level)) {
            logLevel = level;
            console.log(`Log level set to: ${level}`);
        } else {
            console.warn(`Invalid log level: ${level}. Valid levels: ${validLevels.join(', ')}`);
        }
    }
    
    /**
     * Log message with level filtering
     * @param {string} level - Log level
     * @param {string} message - Message to log
     * @param {*} data - Additional data to log
     */
    function log(level, message, data = null) {
        const levels = ['debug', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(logLevel);
        const messageLevelIndex = levels.indexOf(level);
        
        if (messageLevelIndex >= currentLevelIndex) {
            const timestamp = new Date().toISOString();
            const prefix = `[${timestamp}] [INK-DEBUG] [${level.toUpperCase()}]`;
            
            if (data) {
                console.log(prefix, message, data);
            } else {
                console.log(prefix, message);
            }
        }
    }
    
    /**
     * Debug Ink story state
     */
    function debugInkState() {
        if (!window.inkStory) {
            log('error', 'Ink story not initialized');
            return;
        }
        
        log('info', '=== Ink Story State Debug ===');
        log('info', 'Can Continue:', window.inkStory.canContinue);
        log('info', 'Current Choices:', window.inkStory.currentChoices.length);
        log('info', 'Current Tags:', window.inkStory.currentTags);
        log('info', 'Current Path:', window.inkStory.currentPathString);
        
        // Debug variables
        const variables = {};
        Object.keys(window.inkStory.variablesState).forEach(key => {
            if (key.startsWith('gameState.') || !key.includes('.')) {
                variables[key] = window.inkStory.variablesState[key];
            }
        });
        log('info', 'Variables:', variables);
        
        // Debug state integrity
        if (window.StateValidator) {
            const integrity = window.StateValidator.validateStateIntegrity();
            log('info', 'State Integrity:', integrity ? 'PASS' : 'FAIL');
        }
    }
    
    /**
     * Debug gameState vs Ink variables
     */
    function debugStateSync() {
        if (!window.gameState || !window.inkStory) {
            log('error', 'gameState or inkStory not available');
            return;
        }
        
        log('info', '=== State Synchronization Debug ===');
        
        // Compare stats
        log('info', 'Stats Comparison:');
        ['strength', 'agility', 'endurance', 'charisma', 'luck', 'wits', 'wealth', 'reputation', 'morale', 'stress'].forEach(stat => {
            const gameValue = window.gameState.stats[stat];
            const inkValue = window.inkStory.variablesState[stat];
            const match = gameValue === inkValue;
            const status = match ? '✓' : '✗';
            
            log('info', `  ${stat}: ${status} game=${gameValue} ink=${inkValue}`);
        });
        
        // Compare game state properties
        log('info', 'Game State Comparison:');
        ['faction', 'age', 'year', 'location', 'level', 'currentScene', 'characterName', 'patronId', 'background'].forEach(prop => {
            const gameValue = window.gameState[prop];
            const inkValue = window.inkStory.variablesState[prop];
            const match = gameValue === inkValue;
            const status = match ? '✓' : '✗';
            
            log('info', `  ${prop}: ${status} game=${gameValue} ink=${inkValue}`);
        });
    }
    
    /**
     * Debug narrative bridge
     */
    function debugNarrativeBridge() {
        if (!window.narrativeBridge) {
            log('error', 'Narrative bridge not available');
            return;
        }
        
        log('info', '=== Narrative Bridge Debug ===');
        log('info', 'Bridge initialized:', !!window.narrativeBridge);
        
        if (window.narrativeBridge.getEventTarget) {
            const eventTarget = window.narrativeBridge.getEventTarget();
            log('info', 'Event target available:', !!eventTarget);
        }
        
        // Debug external functions
        const externalFunctions = [
            'applyStatChange', 'formatCurrency', 'addCondition', 'removeCondition',
            'hasCondition', 'triggerCombat', 'triggerSkirmish', 'showNotification',
            'getEffectiveStat', 'rollDice', 'resolveAction', 'hasShieldEquipped',
            'markChapterStarted', 'markChapterCompleted'
        ];
        
        log('info', 'External Functions:');
        externalFunctions.forEach(funcName => {
            const isBound = window.inkStory && typeof window.inkStory.EvaluateFunction === 'function';
            log('info', `  ${funcName}: ${isBound ? '✓' : '✗'}`);
        });
    }
    
    /**
     * Debug story loader
     */
    function debugStoryLoader() {
        if (!window.storyLoader) {
            log('error', 'Story loader not available');
            return;
        }
        
        log('info', '=== Story Loader Debug ===');
        const stats = window.storyLoader.getCacheStats();
        log('info', 'Cache size:', stats.size);
        log('info', 'Loading operations:', stats.loading);
        log('info', 'Cached stories:', stats.cachedStories);
    }
    
    /**
     * Debug rendering pipeline
     */
    function debugRendering() {
        log('info', '=== Rendering Pipeline Debug ===');
        
        // Check DOM elements
        const storyElement = document.getElementById('story');
        const choicesElement = document.getElementById('choices-container');
        const artworkElement = document.getElementById('artwork-image');
        const captionElement = document.getElementById('artwork-caption');
        
        log('info', 'DOM Elements:');
        log('info', '  Story element:', !!storyElement);
        log('info', '  Choices element:', !!choicesElement);
        log('info', '  Artwork element:', !!artworkElement);
        log('info', '  Caption element:', !!captionElement);
        
        // Check CSS classes
        if (storyElement) {
            log('info', 'Story element classes:', storyElement.className);
        }
        if (choicesElement) {
            log('info', 'Choices element classes:', choicesElement.className);
        }
        
        // Check for active modals
        const activeModals = document.querySelectorAll('.modal:not(.hidden), .equipment-screen:not(.hidden)');
        log('info', 'Active modals:', activeModals.length);
    }
    
    /**
     * Run comprehensive debug check
     */
    function runFullDebug() {
        log('info', '=== Full Ink Integration Debug ===');
        debugInkState();
        debugStateSync();
        debugNarrativeBridge();
        debugStoryLoader();
        debugRendering();
        log('info', '=== Debug Complete ===');
    }
    
    /**
     * Create debug UI panel
     */
    function createDebugPanel() {
        if (document.getElementById('ink-debug-panel')) {
            return; // Panel already exists
        }
        
        const panel = document.createElement('div');
        panel.id = 'ink-debug-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        panel.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: #f4d03f;">Ink Debug Panel</h3>
            <div style="margin-bottom: 10px;">
                <button onclick="window.inkDebugTools.runFullDebug()" style="margin: 2px; padding: 5px;">Full Debug</button>
                <button onclick="window.inkDebugTools.debugInkState()" style="margin: 2px; padding: 5px;">Ink State</button>
                <button onclick="window.inkDebugTools.debugStateSync()" style="margin: 2px; padding: 5px;">State Sync</button>
            </div>
            <div style="margin-bottom: 10px;">
                <button onclick="window.inkDebugTools.debugNarrativeBridge()" style="margin: 2px; padding: 5px;">Bridge</button>
                <button onclick="window.inkDebugTools.debugStoryLoader()" style="margin: 2px; padding: 5px;">Loader</button>
                <button onclick="window.inkDebugTools.debugRendering()" style="margin: 2px; padding: 5px;">Rendering</button>
            </div>
            <div style="margin-bottom: 10px;">
                <label>
                    <input type="checkbox" id="ink-debug-mode" onchange="window.inkDebugTools.setDebugMode(this.checked)">
                    Debug Mode
                </label>
            </div>
            <div id="ink-debug-output" style="background: black; padding: 10px; border-radius: 3px; height: 200px; overflow-y: auto; white-space: pre-wrap;"></div>
        `;
        
        document.body.appendChild(panel);
        
        // Override console.log for debug output
        const originalLog = log;
        window.inkDebugTools.log = function(level, message, data) {
            originalLog(level, message, data);
            
            if (debugMode) {
                const output = document.getElementById('ink-debug-output');
                if (output) {
                    const timestamp = new Date().toLocaleTimeString();
                    const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
                    output.textContent += logLine + '\n';
                    output.scrollTop = output.scrollHeight;
                }
            }
        };
    }
    
    /**
     * Remove debug panel
     */
    function removeDebugPanel() {
        const panel = document.getElementById('ink-debug-panel');
        if (panel) {
            panel.remove();
        }
    }
    
    /**
     * Performance monitoring
     */
    function startPerformanceMonitoring() {
        const performanceData = {
            renderCalls: 0,
            stateSyncs: 0,
            choiceSelections: 0,
            errors: 0,
            startTime: Date.now()
        };
        
        // Override functions to collect metrics
        const originalUpdateDisplay = window.updateDisplay;
        window.updateDisplay = function() {
            performanceData.renderCalls++;
            return originalUpdateDisplay.apply(this, arguments);
        };
        
        window.inkDebugTools.getPerformanceData = function() {
            const elapsed = Date.now() - performanceData.startTime;
            return {
                ...performanceData,
                elapsedMs: elapsed,
                rendersPerSecond: (performanceData.renderCalls / elapsed * 1000).toFixed(2)
            };
        };
        
        log('info', 'Performance monitoring started');
    }
    
    // ============================================
    // Public API
    // ============================================
    
    window.inkDebugTools = {
        setDebugMode,
        setLogLevel,
        debugInkState,
        debugStateSync,
        debugNarrativeBridge,
        debugStoryLoader,
        debugRendering,
        runFullDebug,
        createDebugPanel,
        removeDebugPanel,
        startPerformanceMonitoring,
        getPerformanceData: () => ({}),
        log
    };
    
    // Auto-enable debug mode in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setDebugMode(true);
        setLogLevel('debug');
        log('info', 'Debug tools auto-enabled for localhost');
    }
    
    console.log('Ink debug tools module loaded');
    
})();
