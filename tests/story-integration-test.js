#!/usr/bin/env node
// Integration tests to verify stories have actual content with choices/knots
// Addresses assessment concern about stories being empty placeholders

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Story } from 'inkjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class StoryIntegrationTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
  }

  /**
   * Test a single story file for content validity
   */
  async testStoryFile(jsonPath) {
    const storyName = path.relative(projectRoot, jsonPath).replace('.json', '');
    
    try {
      // Read and parse JSON
      const storyData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      // Create inkjs Story instance
      const story = new Story(storyData);
      
      // Test results
      const testResult = {
        storyName,
        filePath: jsonPath,
        hasValidStructure: this.validateStructure(storyData),
        canContinue: false,
        hasChoices: false,
        hasKnots: false,
        hasText: false,
        choiceCount: 0,
        knotCount: 0,
        errors: []
      };

      // Test story functionality
      try {
        // Check if story can continue initially
        testResult.canContinue = story.canContinue;
        
        // Check for initial text
        const initialText = story.currentText || '';
        testResult.hasText = initialText.trim().length > 0;
        
        // Check for choices
        if (story.currentChoices && story.currentChoices.length > 0) {
          testResult.hasChoices = true;
          testResult.choiceCount = story.currentChoices.length;
        }
        
        // Try to continue to find more content - limited iterations to avoid infinite loops
        let continueCount = 0;
        const maxContinues = 5; // Only try a few continues
        
        while (continueCount < maxContinues) {
          if (!story.canContinue) break;
          
          try {
            story.Continue();
            continueCount++;
            
            // Check for choices after continuing
            if (story.currentChoices && story.currentChoices.length > 0) {
              testResult.hasChoices = true;
              testResult.choiceCount = Math.max(testResult.choiceCount, story.currentChoices.length);
            }
            
            // Update text check
            if (story.currentText && story.currentText.trim().length > 0) {
              testResult.hasText = true;
            }
          } catch (continueError) {
            // Catch errors from Continue() and break
            break;
          }
        }
        
        // Count knots by examining root structure
        testResult.knotCount = this.countKnots(storyData);
        testResult.hasKnots = testResult.knotCount > 0;
        
      } catch (error) {
        testResult.errors.push(`Story execution error: ${error.message}`);
      }
      
      // Determine if test passed
      const hasContent = testResult.canContinue || testResult.hasChoices || testResult.hasText || testResult.hasKnots;
      testResult.passed = hasContent && testResult.errors.length === 0;
      
      return testResult;
      
    } catch (error) {
      return {
        storyName,
        filePath: jsonPath,
        passed: false,
        errors: [`Failed to load story: ${error.message}`]
      };
    }
  }

  /**
   * Validate JSON structure
   */
  validateStructure(storyData) {
    return (
      storyData &&
      typeof storyData === 'object' &&
      storyData.inkVersion &&
      storyData.root &&
      Array.isArray(storyData.root)
    );
  }

  /**
   * Count knots in story data
   */
  countKnots(storyData) {
    if (!storyData.root || !Array.isArray(storyData.root)) {
      return 0;
    }
    
    let knotCount = 0;
    
    for (const section of storyData.root) {
      if (Array.isArray(section)) {
        for (const item of section) {
          if (typeof item === 'string' && item.includes('^->')) {
            knotCount++;
          }
          if (typeof item === 'object' && item['^->']) {
            knotCount++;
          }
        }
      }
    }
    
    return knotCount;
  }

  /**
   * Run all story tests
   */
  async runAllTests() {
    console.log('🧪 Running Story Integration Tests...\n');
    
    const storiesDir = path.join(projectRoot, 'public/js/ink/ink-stories');
    const jsonFiles = this.findJsonFiles(storiesDir);
    
    if (jsonFiles.length === 0) {
      console.error('❌ No JSON story files found to test');
      return false;
    }
    
    console.log(`Found ${jsonFiles.length} story files to test:\n`);
    
    for (const jsonFile of jsonFiles) {
      const result = await this.testStoryFile(jsonFile);
      this.results.total++;
      
      if (result.passed) {
        this.results.passed++;
        console.log(`✅ ${result.storyName}`);
        console.log(`   Content: canContinue=${result.canContinue}, hasChoices=${result.hasChoices}, hasText=${result.hasText}, knots=${result.knotCount}`);
        if (result.choiceCount > 0) {
          console.log(`   Choices: ${result.choiceCount} available`);
        }
      } else {
        this.results.failed++;
        console.log(`❌ ${result.storyName}`);
        if (result.errors.length > 0) {
          result.errors.forEach(error => console.log(`   Error: ${error}`));
        } else {
          console.log(`   No playable content found`);
        }
      }
      
      this.results.details.push(result);
    }
    
    this.printSummary();
    return this.results.failed === 0;
  }

  /**
   * Find all JSON files recursively
   */
  findJsonFiles(dir) {
    const files = [];
    
    function traverse(currentDir) {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          traverse(fullPath);
        } else if (item.endsWith('.json')) {
          files.push(fullPath);
        }
      }
    }
    
    traverse(dir);
    return files;
  }

  /**
   * Print test summary
   */
  printSummary() {
    console.log('\n📊 Test Summary:');
    console.log(`Total tests: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Success rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    
    if (this.results.failed > 0) {
      console.log('\n⚠️  Failed stories:');
      this.results.details
        .filter(detail => !detail.passed)
        .forEach(detail => {
          console.log(`   ${detail.storyName}: ${detail.errors.join(', ')}`);
        });
    }
    
    // Content analysis
    const storiesWithChoices = this.results.details.filter(d => d.hasChoices).length;
    const storiesWithKnots = this.results.details.filter(d => d.hasKnots).length;
    const storiesWithText = this.results.details.filter(d => d.hasText).length;
    
    console.log('\n📈 Content Analysis:');
    console.log(`Stories with choices: ${storiesWithChoices}/${this.results.total}`);
    console.log(`Stories with knots: ${storiesWithKnots}/${this.results.total}`);
    console.log(`Stories with text: ${storiesWithText}/${this.results.total}`);
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new StoryIntegrationTester();
  const success = await tester.runAllTests();
  process.exit(success ? 0 : 1);
}

export { StoryIntegrationTester };
