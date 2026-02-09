// ============================================
// End-to-End Dialog System Tests
// Tests complete dialog flow: enter → choose → consequence → exit → resume
// ============================================

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(import.meta.url);

class DialogE2ETest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.baseUrl = 'http://localhost:3007';
  }

  /**
   * Run all end-to-end tests
   */
  async runAllTests() {
    console.log('🧪 Starting End-to-End Dialog Tests...\n');

    try {
      await this.setup();
      
      // Test 1: Merchant Dialog Flow
      await this.testMerchantDialogFlow();
      
      // Test 2: Bandit Dialog Flow  
      await this.testBanditDialogFlow();
      
      // Test 3: Dialog History
      await this.testDialogHistory();
      
      // Test 4: Keyboard Navigation
      await this.testKeyboardNavigation();
      
      // Test 5: Autosave Integration
      await this.testAutosaveIntegration();
      
      this.printResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.addResult('Test Suite', false, error.message);
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Setup browser and page
   */
  async setup() {
    console.log('🔧 Setting up test environment...');
    
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for CI
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1200, height: 800 });
    
    // Wait for server to be ready
    await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
    await this.page.waitForTimeout(2000);
  }

  /**
   * Test complete merchant dialog flow
   */
  async testMerchantDialogFlow() {
    console.log('📝 Testing merchant dialog flow...');

    try {
      // Start merchant dialog
      await this.page.click('#merchant-button');
      await this.page.waitForTimeout(1000);
      
      // Check dialog is visible
      const dialogVisible = await this.page.$('.dialog-container.visible');
      if (!dialogVisible) {
        throw new Error('Dialog not visible after starting merchant dialog');
      }
      this.addResult('Merchant Dialog Start', true);

      // Check portrait is loaded
      const portrait = await this.page.$('#dialog-portrait');
      const portraitSrc = await portrait.getProperty('src');
      if (!portraitSrc._remoteObject.value.includes('merchant')) {
        throw new Error('Merchant portrait not loaded');
      }
      this.addResult('Merchant Portrait Load', true);

      // Check character name
      const characterName = await this.page.$eval('#character-name', el => el.textContent);
      if (!characterName.includes('Merchant')) {
        throw new Error('Character name not displayed correctly');
      }
      this.addResult('Character Name Display', true);

      // Make a choice
      await this.page.click('.dialog-choice');
      await this.page.waitForTimeout(500);
      
      // Check choice was processed
      const choicesAfter = await this.page.$$('.dialog-choice');
      if (choicesAfter.length === 0) {
        this.addResult('Choice Processing', true);
      } else {
        this.addResult('Choice Processing', false, 'Choices still visible after selection');
      }

      // Check dialog ended
      await this.page.waitForTimeout(1000);
      const dialogHidden = await this.page.$('.dialog-container.hidden');
      if (!dialogHidden) {
        this.addResult('Dialog End', false, 'Dialog not hidden after completion');
      } else {
        this.addResult('Dialog End', true);
      }

    } catch (error) {
      this.addResult('Merchant Dialog Flow', false, error.message);
    }
  }

  /**
   * Test complete bandit dialog flow
   */
  async testBanditDialogFlow() {
    console.log('⚔️ Testing bandit dialog flow...');

    try {
      // Start bandit dialog
      await this.page.click('#bandit-button');
      await this.page.waitForTimeout(1000);
      
      // Check dialog is visible
      const dialogVisible = await this.page.$('.dialog-container.visible');
      if (!dialogVisible) {
        throw new Error('Dialog not visible after starting bandit dialog');
      }
      this.addResult('Bandit Dialog Start', true);

      // Check bandit portrait
      const portrait = await this.page.$('#dialog-portrait');
      const portraitSrc = await portrait.getProperty('src');
      if (!portraitSrc._remoteObject.value.includes('bandit')) {
        throw new Error('Bandit portrait not loaded');
      }
      this.addResult('Bandit Portrait Load', true);

      // Make multiple choices to test flow
      const choices = await this.page.$$('.dialog-choice');
      if (choices.length === 0) {
        throw new Error('No choices available in bandit dialog');
      }
      this.addResult('Bandit Choices Available', true);

      // Select first choice
      await choices[0].click();
      await this.page.waitForTimeout(500);
      
      // Check for new choices or dialog end
      const newChoices = await this.page.$$('.dialog-choice');
      if (newChoices.length > 0) {
        this.addResult('Bandit Choice Flow', true);
        
        // Make another choice to complete dialog
        await newChoices[0].click();
        await this.page.waitForTimeout(500);
      }

      // Check dialog ended
      const dialogHidden = await this.page.$('.dialog-container.hidden');
      if (dialogHidden) {
        this.addResult('Bandit Dialog End', true);
      } else {
        this.addResult('Bandit Dialog End', false, 'Bandit dialog did not end properly');
      }

    } catch (error) {
      this.addResult('Bandit Dialog Flow', false, error.message);
    }
  }

  /**
   * Test dialog history functionality
   */
  async testDialogHistory() {
    console.log('📚 Testing dialog history...');

    try {
      // Start merchant dialog
      await this.page.click('#merchant-button');
      await this.page.waitForTimeout(1000);
      
      // Click history button
      await this.page.click('#dialog-history-btn');
      await this.page.waitForTimeout(500);
      
      // Check history is visible
      const historyVisible = await this.page.$('.dialog-history:not(.hidden)');
      if (!historyVisible) {
        throw new Error('Dialog history not visible');
      }
      this.addResult('History Toggle', true);

      // Check history has content
      const historyEntries = await this.page.$$('.dialog-history-entry');
      if (historyEntries.length === 0) {
        this.addResult('History Content', false, 'No history entries found');
      } else {
        this.addResult('History Content', true);
      }

      // Close history
      await this.page.click('#dialog-history-btn');
      await this.page.waitForTimeout(500);
      
      const historyHidden = await this.page.$('.dialog-history.hidden');
      if (historyHidden) {
        this.addResult('History Close', true);
      } else {
        this.addResult('History Close', false, 'History did not close');
      }

      // Close dialog
      await this.page.click('#dialog-close-btn');
      await this.page.waitForTimeout(500);

    } catch (error) {
      this.addResult('Dialog History', false, error.message);
    }
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation() {
    console.log('⌨️ Testing keyboard navigation...');

    try {
      // Start merchant dialog
      await this.page.click('#merchant-button');
      await this.page.waitForTimeout(1000);
      
      // Test number key navigation
      await this.page.keyboard.press('1');
      await this.page.waitForTimeout(500);
      
      // Check if choice was selected
      const selectedChoice = await this.page.$('.dialog-choice.selected');
      if (selectedChoice) {
        this.addResult('Number Key Navigation', true);
      } else {
        this.addResult('Number Key Navigation', false, 'Choice not selected with number key');
      }

      // Test arrow key navigation
      await this.page.keyboard.press('ArrowDown');
      await this.page.waitForTimeout(200);
      
      const focusedChoice = await this.page.$('.dialog-choice.focus');
      if (focusedChoice) {
        this.addResult('Arrow Key Navigation', true);
      } else {
        this.addResult('Arrow Key Navigation', false, 'Choice not focused with arrow key');
      }

      // Test Enter key selection
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(500);

      // Close dialog
      await this.page.click('#dialog-close-btn');
      await this.page.waitForTimeout(500);

    } catch (error) {
      this.addResult('Keyboard Navigation', false, error.message);
    }
  }

  /**
   * Test autosave integration
   */
  async testAutosaveIntegration() {
    console.log('💾 Testing autosave integration...');

    try {
      // Start merchant dialog
      await this.page.click('#merchant-button');
      await this.page.waitForTimeout(1000);
      
      // Listen for console events (autosave logs)
      let autosaveTriggered = false;
      this.page.on('console', msg => {
        if (msg.text().includes('Autosave triggered by:')) {
          autosaveTriggered = true;
        }
      });
      
      // Make a choice to trigger autosave
      await this.page.click('.dialog-choice');
      await this.page.waitForTimeout(1000);
      
      // Check if autosave was triggered
      if (autosaveTriggered) {
        this.addResult('Autosave Trigger', true);
      } else {
        this.addResult('Autosave Trigger', false, 'Autosave not triggered by choice');
      }

      // Close dialog
      await this.page.click('#dialog-close-btn');
      await this.page.waitForTimeout(500);

    } catch (error) {
      this.addResult('Autosave Integration', false, error.message);
    }
  }

  /**
   * Add test result
   */
  addResult(testName, passed, error = null) {
    this.testResults.push({
      test: testName,
      passed,
      error,
      timestamp: new Date().toISOString()
    });
    
    const status = passed ? '✅' : '❌';
    console.log(`  ${status} ${testName}${error ? `: ${error}` : ''}`);
  }

  /**
   * Print test results
   */
  printResults() {
    console.log('\n📊 Test Results:');
    console.log('==================');
    
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.filter(r => r.passed === false).length;
    
    console.log(`Total tests: ${this.testResults.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%\n`);

    if (failed > 0) {
      console.log('❌ Failed Tests:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(result => {
          console.log(`  📝 ${result.test}: ${result.error}`);
        });
    }

    if (passed === this.testResults.length) {
      console.log('🎉 All tests passed! Dialog system is ready for production.');
    }
  }

  /**
   * Cleanup browser resources
   */
  async cleanup() {
    console.log('🧹 Cleaning up test environment...');
    
    if (this.page) {
      await this.page.close();
    }
    
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new DialogE2ETest();
  tester.runAllTests().catch(console.error);
}

export default DialogE2ETest;
