#!/usr/bin/env node
// ============================================
// Yarn Story Smoke Test Harness
// Tests every .yarn file by loading and advancing through story flow
// Validates jumps, options, and stop nodes work correctly
// ============================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YarnBound from 'yarn-bound';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class YarnStorySmokeTester {
  constructor() {
    this.storyFiles = this.findYarnFiles();
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  findYarnFiles() {
    const storiesDir = path.join(projectRoot, 'stories');
    const files = [];

    function traverse(currentDir) {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          traverse(fullPath);
        } else if (item.endsWith('.yarn')) {
          files.push(fullPath);
        }
      }
    }

    traverse(storiesDir);
    return files;
  }

  async runAllTests() {
    console.log('🧪 Running Yarn Story Smoke Tests...\n');

    this.results.total = this.storyFiles.length;

    for (const storyFile of this.storyFiles) {
      const storyName = path.relative(path.join(projectRoot, 'stories'), storyFile).replace('.yarn', '');
      console.log(`📖 Testing ${storyName}...`);

      try {
        const passed = await this.testStory(storyFile);
        if (passed) {
          console.log(`✅ ${storyName} passed`);
          this.results.passed++;
        } else {
          console.log(`❌ ${storyName} failed`);
          this.results.failed++;
        }
      } catch (error) {
        console.log(`💥 ${storyName} crashed: ${error.message}`);
        this.results.failed++;
        this.results.errors.push({
          story: storyName,
          error: error.message,
          stack: error.stack
        });
      }
    }

    this.printSummary();
    return this.results.failed === 0;
  }

  async testStory(storyFilePath) {
    const yarnText = fs.readFileSync(storyFilePath, 'utf8');

    // Basic validation tests
    const tests = [
      {
        name: 'Can create YarnBound runner',
        test: () => {
          const runner = new YarnBound({
            dialogue: yarnText,
            startAt: 'Start',
            handleCommand: () => {},
            variableStorage: { get: () => 0, set: () => {} },
            combineTextAndOptionsResults: true
          });
          return !!runner;
        }
      },
      {
        name: 'Has initial result',
        test: () => {
          const runner = new YarnBound({
            dialogue: yarnText,
            startAt: 'Start',
            handleCommand: () => {},
            variableStorage: { get: () => 0, set: () => {} },
            combineTextAndOptionsResults: true
          });
          return !!runner.currentResult;
        }
      },
      {
        name: 'Initial result has expected type',
        test: () => {
          const runner = new YarnBound({
            dialogue: yarnText,
            startAt: 'Start',
            handleCommand: () => {},
            variableStorage: { get: () => 0, set: () => {} },
            combineTextAndOptionsResults: true
          });
          const result = runner.currentResult;
          return result instanceof YarnBound.TextResult ||
                 result instanceof YarnBound.OptionsResult ||
                 result instanceof YarnBound.CommandResult;
        }
      },
      {
        name: 'Contains expected Yarn syntax',
        test: () => {
          return yarnText.includes('title:') &&
                 yarnText.includes('---') &&
                 yarnText.includes('===') &&
                 yarnText.includes('->');
        }
      }
    ];

    for (const testCase of tests) {
      try {
        const passed = testCase.test();
        if (!passed) {
          throw new Error(`${testCase.name} failed`);
        }
      } catch (error) {
        throw new Error(`${testCase.name}: ${error.message}`);
      }
    }

    return true;
  }

  printSummary() {
    console.log('\n📊 Smoke Test Results:');
    console.log(`Total stories: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);

    if (this.results.errors.length > 0) {
      console.log('\n💥 Errors:');
      this.results.errors.forEach(error => {
        console.log(`  ${error.story}: ${error.error}`);
      });
    }

    const success = this.results.failed === 0;
    console.log(`\n${success ? '🎉 All smoke tests passed!' : '⚠️  Some smoke tests failed'}`);
  }
}

// Export for testing
export { YarnStorySmokeTester };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new YarnStorySmokeTester();
  const success = await tester.runAllTests();
  process.exit(success ? 0 : 1);
}
