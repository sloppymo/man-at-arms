/**
 * Ink Validation Suite for Vite Build
 * Simplified version for development validation
 */

export class InkValidationSuite {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      errors: []
    };
  }

  /**
   * Run basic validation tests
   */
  async run() {
    console.log('🧪 Running Ink Validation Suite...');

    this.results = { passed: 0, failed: 0, total: 0, errors: [] };

    // Test 1: Ink.js availability
    this.test('Ink.js Available', () => {
      return typeof window.inkjs !== 'undefined' && window.inkjs.Story;
    });

    // Test 2: Ink stories loaded
    this.test('Stories Loaded', () => {
      return window.inkStory && typeof window.inkStory.canContinue === 'boolean';
    });

    // Test 3: External functions bound
    this.test('External Functions Bound', () => {
      if (!window.inkStory) return false;
      try {
        // Test a simple external function
        const result = window.inkStory.BindExternalFunction('testFunction', () => 'test');
        return result !== undefined;
      } catch (e) {
        return false;
      }
    });

    // Test 4: InkReady promise
    this.test('InkReady Promise', () => {
      return window.inkReady instanceof Promise;
    });

    console.log(`✅ Validation complete: ${this.results.passed}/${this.results.total} tests passed`);

    if (this.results.failed > 0) {
      console.log('❌ Failed tests:', this.results.errors);
    }

    return this.results;
  }

  /**
   * Run individual test
   */
  test(name, testFn) {
    this.results.total++;
    try {
      const result = testFn();
      if (result) {
        this.results.passed++;
        console.log(`✅ ${name}`);
        return true;
      } else {
        this.results.failed++;
        const error = `❌ ${name}: Test failed`;
        console.error(error);
        this.results.errors.push(error);
        return false;
      }
    } catch (error) {
      this.results.failed++;
      const errorMsg = `❌ ${name}: ${error.message}`;
      console.error(errorMsg);
      this.results.errors.push(errorMsg);
      return false;
    }
  }

  /**
   * Get validation status
   */
  getStatus() {
    return {
      ...this.results,
      isReady: this.results.failed === 0
    };
  }
}

/**
 * Create and run validation suite (dev-only)
 */
export function createInkValidationSuite() {
  const suite = new InkValidationSuite();

  // Only attach to window in development
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    window.InkValidationSuite = suite;
    window.InkBatchRunner = { run: () => suite.run() }; // Simplified batch runner
  }

  return suite;
}
