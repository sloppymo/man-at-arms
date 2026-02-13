/**
 * Production-safe logging utility
 * Reduces console spam in production while maintaining debug info in development
 */

class Logger {
  constructor() {
    this.debugMode = process.env.NODE_ENV !== 'production';
    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    this.currentLevel = this.debugMode ? 3 : 1; // Debug in dev, warn+ in prod
  }

  /**
   * Log error messages (always shown)
   */
  error(...args) {
    if (this.currentLevel >= this.logLevels.error) {
      console.error('[ERROR]', ...args);
    }
  }

  /**
   * Log warning messages
   */
  warn(...args) {
    if (this.currentLevel >= this.logLevels.warn) {
      console.warn('[WARN]', ...args);
    }
  }

  /**
   * Log info messages
   */
  info(...args) {
    if (this.currentLevel >= this.logLevels.info) {
      console.info('[INFO]', ...args);
    }
  }

  /**
   * Log debug messages (development only)
   */
  debug(...args) {
    if (this.currentLevel >= this.logLevels.debug) {
      console.debug('[DEBUG]', ...args);
    }
  }

  /**
   * Set logging level
   * @param {string} level - 'error', 'warn', 'info', 'debug'
   */
  setLevel(level) {
    if (this.logLevels.hasOwnProperty(level)) {
      this.currentLevel = this.logLevels[level];
    }
  }

  /**
   * Enable/disable debug mode
   * @param {boolean} enabled
   */
  setDebug(enabled) {
    this.currentLevel = enabled ? this.logLevels.debug : this.logLevels.warn;
  }
}

// Singleton instance
export const logger = new Logger();

// Backward compatibility
if (typeof window !== 'undefined') {
  window.logger = logger;
}
