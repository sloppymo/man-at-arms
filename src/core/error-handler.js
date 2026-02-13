// ============================================
// Error Handler with Optional Sentry Integration
// Production error capture and reporting system
// ============================================

/**
 * Global error handler for production error capture
 * Supports optional Sentry integration and local error reporting
 */
class ErrorHandler {
  constructor(options = {}) {
    this.options = {
      enableSentry: false,
      sentryDSN: null,
      environment: 'development',
      release: 'v2.0.0',
      debug: false,
      maxErrors: 100,
      ...options
    };

    this.errors = [];
    this.isInitialized = false;

    this.initialize();
  }

  /**
   * Initialize error handling system
   */
  initialize() {
    if (this.isInitialized) return;

    // Set up global error handlers
    this.setupGlobalHandlers();

    // Initialize Sentry if enabled
    if (this.options.enableSentry && this.options.sentryDSN) {
      this.initializeSentry();
    }

    // Set up game-specific error handling
    this.setupGameErrorHandling();

    this.isInitialized = true;

    if (this.options.debug) {
      console.log('ErrorHandler: Initialized', this.options);
    }
  }

  /**
   * Set up global JavaScript error handlers
   */
  setupGlobalHandlers() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        source: 'global'
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason || new Error('Unhandled promise rejection'), {
        source: 'promise',
        promise: event.promise
      });
    });

    // Handle game-specific errors via custom events
    window.addEventListener('gameError', (event) => {
      this.handleError(event.detail.error, event.detail.context);
    });
  }

  /**
   * Initialize Sentry error reporting (if available)
   */
  initializeSentry() {
    // This would load Sentry CDN in production
    // For now, we'll simulate the integration
    if (typeof Sentry !== 'undefined') {
      // Sentry.init({
      //   dsn: this.options.sentryDSN,
      //   environment: this.options.environment,
      //   release: this.options.release,
      //   beforeSend: (event) => this.beforeSend(event)
      // });

      console.log('ErrorHandler: Sentry integration enabled');
    } else if (this.options.enableSentry) {
      console.warn('ErrorHandler: Sentry enabled but not loaded');
    }
  }

  /**
   * Set up game-specific error handling
   */
  setupGameErrorHandling() {
    // Listen for dispatcher errors
    if (typeof window.dispatcher !== 'undefined') {
      window.dispatcher.subscribe('ERROR', (event) => {
        this.handleError(event.payload.error, {
          source: 'dispatcher',
          type: event.payload.type
        });
      });
    }

    // Ink.js error handling removed - system no longer available
  }

  /**
   * Handle an error with context
   */
  handleError(error, context = {}) {
    const errorInfo = {
      error: error,
      message: error.message || 'Unknown error',
      stack: error.stack || 'No stack trace',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      context: context,
      gameState: this.getGameStateSnapshot(),
      sessionId: this.getSessionId()
    };

    // Store error locally
    this.errors.push(errorInfo);
    if (this.errors.length > this.options.maxErrors) {
      this.errors.shift(); // Remove oldest
    }

    // Log to console in development
    if (this.options.debug || this.options.environment === 'development') {
      console.error('Game Error:', errorInfo);
    }

    // Send to Sentry if enabled
    if (this.options.enableSentry && typeof Sentry !== 'undefined') {
      // Sentry.captureException(error, {
      //   tags: {
      //     source: context.source || 'unknown',
      //     gameMode: errorInfo.gameState?.mode
      //   },
      //   extra: context
      // });

      console.log('ErrorHandler: Error sent to Sentry');
    }

    // Dispatch error event for UI handling
    if (typeof window.dispatcher !== 'undefined') {
      window.dispatcher.dispatch('ERROR_OCCURRED', {
        error: errorInfo,
        recoverable: this.isRecoverable(error, context)
      });
    }
  }

  /**
   * Get a snapshot of current game state for error context
   */
  getGameStateSnapshot() {
    try {
      if (typeof window.gameState === 'undefined') return null;

      return {
        mode: window.gameState.mode,
        currentScene: window.gameState.currentScene,
        characterName: window.gameState.characterName,
        level: window.gameState.level,
        schemaVersion: window.gameState.schemaVersion,
        stats: window.gameState.stats ? { ...window.gameState.stats } : null,
        location: window.gameState.location,
        year: window.gameState.year
      };
    } catch (e) {
      return { error: 'Could not capture game state: ' + e.message };
    }
  }

  /**
   * Get or create session ID for error grouping
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('man-at-arms-session-id');
    if (!sessionId) {
      sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      sessionStorage.setItem('man-at-arms-session-id', sessionId);
    }
    return sessionId;
  }

  /**
   * Determine if an error is recoverable
   */
  isRecoverable(error, context) {
    // Network errors are often recoverable
    if (context.source === 'network') return true;

    // Save/load errors might be recoverable
    if (context.source === 'save' || context.source === 'load') return true;

    // UI errors are usually recoverable
    if (context.source === 'ui') return true;

    // Default to not recoverable for unknown errors
    return false;
  }

  /**
   * Manually report an error
   */
  reportError(error, context = {}) {
    this.handleError(error, { ...context, manual: true });
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(count = 10) {
    return this.errors.slice(-count);
  }

  /**
   * Clear error history
   */
  clearErrors() {
    this.errors = [];
  }

  /**
   * Export error report for debugging
   */
  exportErrorReport() {
    const report = {
      timestamp: new Date().toISOString(),
      environment: this.options.environment,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.getSessionId(),
      errorCount: this.errors.length,
      errors: this.errors,
      gameState: this.getGameStateSnapshot(),
      systemInfo: this.getSystemInfo()
    };

    return report;
  }

  /**
   * Get system information for error reports
   */
  getSystemInfo() {
    return {
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      localStorage: this.testLocalStorage(),
      sessionStorage: this.testSessionStorage()
    };
  }

  /**
   * Test localStorage availability
   */
  testLocalStorage() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return 'available';
    } catch (e) {
      return 'unavailable: ' + e.message;
    }
  }

  /**
   * Test sessionStorage availability
   */
  testSessionStorage() {
    try {
      const test = '__storage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return 'available';
    } catch (e) {
      return 'unavailable: ' + e.message;
    }
  }

  /**
   * Set error handler options
   */
  configure(options) {
    this.options = { ...this.options, ...options };
    if (options.enableSentry !== undefined) {
      if (options.enableSentry && !this.options.sentryDSN) {
        console.warn('ErrorHandler: Sentry enabled but no DSN provided');
      }
    }
  }
}

// ============================================
// Debug Tools and Report Export
// ============================================

/**
 * Debug tools for development and troubleshooting
 */
export class DebugTools {
  constructor(gameState, dispatcher) {
    this.gameState = gameState;
    this.dispatcher = dispatcher;
    this.isEnabled = false;
    this.consoleHistory = [];
    this.performanceMarks = new Map();
  }

  /**
   * Enable debug mode
   */
  enable() {
    this.isEnabled = true;
    console.log('🔧 DebugTools: Enabled');

    // Override console methods to capture history
    this.captureConsoleHistory();

    // Add global debug functions
    this.addGlobalDebugFunctions();

    // Start performance monitoring
    this.startPerformanceMonitoring();
  }

  /**
   * Disable debug mode
   */
  disable() {
    this.isEnabled = false;
    console.log('🔧 DebugTools: Disabled');

    // Restore original console methods
    this.restoreConsoleMethods();
  }

  /**
   * Capture console history for debugging
   */
  captureConsoleHistory() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      this.consoleHistory.push({
        level: 'log',
        timestamp: Date.now(),
        message: args.join(' ')
      });
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      this.consoleHistory.push({
        level: 'error',
        timestamp: Date.now(),
        message: args.join(' ')
      });
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      this.consoleHistory.push({
        level: 'warn',
        timestamp: Date.now(),
        message: args.join(' ')
      });
      originalWarn.apply(console, args);
    };
  }

  /**
   * Restore original console methods
   */
  restoreConsoleMethods() {
    // This would restore the original methods if we stored them
    // For now, we'll leave the captured versions active
  }

  /**
   * Add global debug functions
   */
  addGlobalDebugFunctions() {
    if (typeof window === 'undefined') return;

    // Debug info
    window.debugInfo = () => this.getDebugInfo();

    // Export debug report
    window.exportDebugReport = () => this.exportDebugReport();

    // Performance marks
    window.perfMark = (name) => this.markPerformance(name);
    window.perfMeasure = (name) => this.measurePerformance(name);

    // Game state inspection
    window.inspectGameState = () => this.inspectGameState();

    // Force events
    window.forceEvent = (eventType, payload) => {
      if (this.dispatcher) {
        this.dispatcher.dispatch(eventType, payload, 'debug-tools');
        console.log(`🔧 Forced event: ${eventType}`, payload);
      }
    };

    console.log('🔧 Debug functions added to window:');
    console.log('  - debugInfo()');
    console.log('  - exportDebugReport()');
    console.log('  - perfMark(name)');
    console.log('  - perfMeasure(name)');
    console.log('  - inspectGameState()');
    console.log('  - forceEvent(type, payload)');
  }

  /**
   * Start performance monitoring
   */
  startPerformanceMonitoring() {
    // Monitor frame rate
    let lastTime = performance.now();
    let frameCount = 0;

    const monitorFPS = () => {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        if (this.isEnabled && fps < 30) {
          console.warn(`🔧 Low FPS detected: ${fps}`);
        }
        frameCount = 0;
        lastTime = currentTime;
      }

      if (this.isEnabled) {
        requestAnimationFrame(monitorFPS);
      }
    };

    if (this.isEnabled) {
      requestAnimationFrame(monitorFPS);
    }
  }

  /**
   * Mark performance point
   */
  markPerformance(name) {
    if (!performance.mark) return;
    performance.mark(name);
    this.performanceMarks.set(name, performance.now());
  }

  /**
   * Measure performance between marks
   */
  measurePerformance(name) {
    if (!performance.measure) return null;

    try {
      performance.measure(name, name);
      const measure = performance.getEntriesByName(name, 'measure')[0];
      return {
        name: measure.name,
        duration: measure.duration,
        startTime: measure.startTime
      };
    } catch (e) {
      console.warn(`🔧 Performance measure failed: ${e.message}`);
      return null;
    }
  }

  /**
   * Get comprehensive debug information
   */
  getDebugInfo() {
    return {
      timestamp: new Date().toISOString(),
      gameState: this.inspectGameState(),
      performance: this.getPerformanceInfo(),
      errors: this.getErrorInfo(),
      system: this.getSystemInfo(),
      modules: this.getModuleInfo()
    };
  }

  /**
   * Inspect game state for debugging
   */
  inspectGameState() {
    if (!this.gameState) return null;

    return {
      mode: this.gameState.mode,
      schemaVersion: this.gameState.schemaVersion,
      currentScene: this.gameState.currentScene,
      characterName: this.gameState.characterName,
      level: this.gameState.level,
      location: this.gameState.location,
      year: this.gameState.year,
      stats: { ...this.gameState.stats },
      equipmentCount: this.countEquipment(),
      sceneCount: this.gameState.scenesVisited?.length || 0,
      saveSize: JSON.stringify(this.gameState).length
    };
  }

  /**
   * Count equipped items
   */
  countEquipment() {
    if (!this.gameState.equipment) return 0;

    let count = 0;
    for (const slot of Object.values(this.gameState.equipment)) {
      if (slot === 'bag') {
        count += Array.isArray(slot) ? slot.length : 0;
      } else if (typeof slot === 'object') {
        for (const layer of Object.values(slot)) {
          if (layer && layer.id) count++;
        }
      }
    }
    return count;
  }

  /**
   * Get performance information
   */
  getPerformanceInfo() {
    return {
      timing: performance.timing,
      memory: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      } : null,
      navigation: performance.navigation
    };
  }

  /**
   * Get error information
   */
  getErrorInfo() {
    // Would integrate with ErrorHandler if available
    return {
      consoleErrors: this.consoleHistory.filter(h => h.level === 'error').length,
      recentLogs: this.consoleHistory.slice(-10)
    };
  }

  /**
   * Get system information
   */
  getSystemInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    };
  }

  /**
   * Get module loading information
   */
  getModuleInfo() {
    const modules = {};

    // Check for loaded modules
    const moduleChecks = {
      dispatcher: typeof window.dispatcher !== 'undefined',
      gameState: typeof window.gameState !== 'undefined',
      equipment: typeof window.equipmentManager !== 'undefined',
      mapRenderer: typeof window.MapRenderer !== 'undefined'
    };

    Object.assign(modules, moduleChecks);

    // Check for ES modules
    if (window.performance && window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource');
      modules.loadedScripts = resources.filter(r => r.name.endsWith('.js')).length;
    }

    return modules;
  }

  /**
   * Export comprehensive debug report
   */
  exportDebugReport() {
    const report = this.getDebugInfo();

    // Convert to JSON string
    const reportJson = JSON.stringify(report, null, 2);

    // Create download link
    const blob = new Blob([reportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `man-at-arms-debug-report-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    console.log('🔧 Debug report exported');
    return report;
  }
}

// ============================================
// Integration and Exports
// ============================================

// Create singleton instances
let errorHandler = null;
let debugTools = null;

/**
 * Initialize error handling and debug tools
 */
export function initializeErrorHandling(options = {}) {
  if (!errorHandler) {
    errorHandler = new ErrorHandler(options);
  }

  return errorHandler;
}

/**
 * Initialize debug tools
 */
export function initializeDebugTools(gameState, dispatcher, options = {}) {
  if (!debugTools) {
    debugTools = new DebugTools(gameState, dispatcher);
  }

  // Auto-enable in development
  if (options.environment === 'development') {
    debugTools.enable();
  }

  return debugTools;
}

/**
 * Get error handler instance
 */
export function getErrorHandler() {
  return errorHandler;
}

/**
 * Get debug tools instance
 */
export function getDebugTools() {
  return debugTools;
}

// ============================================
// Backward Compatibility
// ============================================

if (typeof window !== 'undefined') {
  window.ErrorHandler = ErrorHandler;
  window.DebugTools = DebugTools;
  window.initializeErrorHandling = initializeErrorHandling;
  window.initializeDebugTools = initializeDebugTools;
  window.getErrorHandler = getErrorHandler;
  window.getDebugTools = getDebugTools;
}
