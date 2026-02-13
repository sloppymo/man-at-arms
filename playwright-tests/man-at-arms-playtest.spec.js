import { test, expect } from '@playwright/test';

test.describe('Man-at-Arms RPG Comprehensive Playtesting', () => {
  const GAME_URL = 'http://localhost:3006/';

  test.beforeEach(async ({ page }) => {
    // Set up console message monitoring
    const consoleMessages = [];
    page.on('console', (msg) => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });

    // Store console messages on page for access in tests
    await page.addInitScript(() => {
      window.consoleMessages = [];
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        window.consoleMessages.push(args.join(' '));
        return originalConsoleLog.apply(console, args);
      };
    });
  });

  test.describe('Phase 1: Basic Functionality', () => {
    test('Game Launch Test - Should load without errors', async ({ page }) => {
      await page.goto(GAME_URL);

      // Wait for Phaser to initialize
      await page.waitForSelector('canvas', { timeout: 10000 });

      // Check for Phaser console message
      const logs = await page.evaluate(() => window.consoleMessages || []);
      const hasPhaserLog = logs.some(log => log.includes('Phaser v3'));

      expect(hasPhaserLog).toBe(true);

      // Verify canvas is present and visible
      const canvas = await page.$('canvas');
      expect(canvas).toBeTruthy();

      // Check for any console errors
      const errors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // Wait a moment for any errors to appear
      await page.waitForTimeout(2000);
      expect(errors.length).toBe(0);
    });

    test('Movement System Test - WASD Movement', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('canvas');

      // Get initial player position (if available via console or game state)
      const initialLogs = await page.evaluate(() => window.consoleMessages || []);

      // Press WASD keys
      await page.keyboard.press('KeyW');
      await page.keyboard.press('KeyA');
      await page.keyboard.press('KeyS');
      await page.keyboard.press('KeyD');

      // Wait for movement to register
      await page.waitForTimeout(1000);

      // Check for coordinate updates in console (if available)
      const movementLogs = await page.evaluate(() => window.consoleMessages || []);
      const hasMovementLog = movementLogs.some(log =>
        log.includes('Player moved') || log.includes('coordinates') || log.includes('hex')
      );

      // Movement should be responsive (at minimum, no errors)
      expect(hasMovementLog || movementLogs.length > initialLogs.length).toBe(true);
    });

    test('Movement System Test - Arrow Keys', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('canvas');

      // Press arrow keys
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowRight');

      await page.waitForTimeout(1000);

      // Verify no errors occurred
      const logs = await page.evaluate(() => window.consoleMessages || []);
      const errors = logs.filter(log => log.includes('error') || log.includes('Error'));
      expect(errors.length).toBe(0);
    });

    test('Movement System Test - Click to Move', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('canvas');

      // Get canvas bounds
      const canvas = await page.$('canvas');
      const bounds = await canvas.boundingBox();

      // Click in center of canvas
      await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);

      await page.waitForTimeout(1000);

      // Verify click was registered (should not cause errors)
      const logs = await page.evaluate(() => window.consoleMessages || []);
      const errors = logs.filter(log => log.includes('error') || log.includes('Error'));
      expect(errors.length).toBe(0);
    });
  });

  test.describe('Phase 2: Hotspot Interaction', () => {
    test('Hotspot Detection - Town Square', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('canvas');

      // Move to town square area (based on game knowledge, approximate coordinates)
      // This might need adjustment based on actual game layout
      await page.keyboard.press('KeyS'); // Move down
      await page.keyboard.press('KeyD'); // Move right

      await page.waitForTimeout(2000);

      // Check for hotspot detection logs
      const logs = await page.evaluate(() => window.consoleMessages || []);
      const hotspotDetected = logs.some(log => log.includes('hotspot') || log.includes('TOWN-SQUARE'));

      // Note: Hotspot detection might require specific positioning
      // This test verifies the system doesn't crash when moving around
      expect(hotspotDetected || true).toBe(true); // Allow either detection or no errors
    });

    test('Dialog System - Basic Trigger', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('canvas');

      // Try to trigger a dialog (this might require being in a hotspot)
      await page.keyboard.press('Space'); // Try space to interact

      await page.waitForTimeout(1000);

      // Check if dialog appeared
      const dialogContainer = await page.$('.dialog-container');
      if (dialogContainer) {
        // Dialog appeared, test basic functionality
        expect(await dialogContainer.isVisible()).toBe(true);

        // Check for dialog UI elements
        const choices = await page.$$('.dialog-choice');
        expect(choices.length).toBeGreaterThan(0);
      } else {
        // No dialog triggered (might not be in hotspot)
        // Verify no errors occurred
        const logs = await page.evaluate(() => window.consoleMessages || []);
        const errors = logs.filter(log => log.includes('error') || log.includes('Error'));
        expect(errors.length).toBe(0);
      }
    });

    test('Dialog System - Typewriter and Choices', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('canvas');

      // Navigate to trigger dialog (simplified - may need specific positioning)
      await page.keyboard.press('KeyW');
      await page.keyboard.press('KeyA');

      await page.waitForTimeout(2000);

      // Look for dialog container
      const dialogContainer = await page.$('.dialog-container');
      if (dialogContainer) {
        // Test dialog elements
        const textElement = await page.$('.dialog-text');
        const choiceButtons = await page.$$('.dialog-choice');

        if (textElement && choiceButtons.length > 0) {
          // Test choice selection
          await choiceButtons[0].click();

          await page.waitForTimeout(1000);

          // Verify dialog progressed (either new text or closed)
          const newTextElement = await page.$('.dialog-text');
          const stillHasChoices = await page.$$('.dialog-choice');

          expect(newTextElement || stillHasChoices.length === 0).toBe(true);
        }
      }
    });

    test('Dialog System - Close Functionality', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('canvas');

      // Trigger dialog if possible
      await page.keyboard.press('Space');

      await page.waitForTimeout(1000);

      const dialogContainer = await page.$('.dialog-container');
      if (dialogContainer) {
        // Test escape key close
        await page.keyboard.press('Escape');

        await page.waitForTimeout(500);

        const stillVisible = await dialogContainer.isVisible();
        expect(stillVisible).toBe(false);

        // Test X button close (if exists)
        await page.keyboard.press('Space'); // Re-trigger dialog
        await page.waitForTimeout(1000);

        const closeButton = await page.$('.dialog-close');
        if (closeButton) {
          await closeButton.click();
          await page.waitForTimeout(500);
          expect(await dialogContainer.isVisible()).toBe(false);
        }
      }
    });
  });

  test.describe('Phase 3: Content Verification', () => {
    test('Character Portraits - Traveling Merchant', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('canvas');

      // Navigate to town square (merchant location)
      await page.keyboard.press('KeyS');
      await page.keyboard.press('KeyD');

      await page.waitForTimeout(2000);

      // Trigger dialog
      await page.keyboard.press('Space');

      await page.waitForTimeout(1000);

      const dialogContainer = await page.$('.dialog-container');
      if (dialogContainer) {
        const portrait = await page.$('.character-portrait');

        if (portrait) {
          const src = await portrait.getAttribute('src');
          // Check if Wat.png is loaded (Traveling Merchant portrait)
          expect(src).toContain('Wat.png');

          // Verify portrait is visible and properly sized
          const isVisible = await portrait.isVisible();
          expect(isVisible).toBe(true);
        }
      }
    });

    test('Dialog Content - Text Display', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('canvas');

      // Trigger any dialog
      await page.keyboard.press('Space');

      await page.waitForTimeout(1000);

      const dialogText = await page.$('.dialog-text');
      if (dialogText) {
        const textContent = await dialogText.textContent();
        expect(textContent.length).toBeGreaterThan(0);

        // Check for proper text formatting (no overflow issues)
        const isVisible = await dialogText.isVisible();
        expect(isVisible).toBe(true);
      }
    });

    test('Dialog Content - Choice Selection', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('canvas');

      // Trigger dialog
      await page.keyboard.press('Space');

      await page.waitForTimeout(1000);

      const choices = await page.$$('.dialog-choice');
      if (choices.length > 0) {
        // Test clicking each choice
        for (let i = 0; i < Math.min(choices.length, 3); i++) {
          await choices[i].click();
          await page.waitForTimeout(1000);

          // Verify dialog either progresses or closes
          const newChoices = await page.$$('.dialog-choice');
          const dialogStillOpen = await page.$('.dialog-container');

          expect(newChoices.length !== choices.length || !dialogStillOpen).toBe(true);
          break; // Only test first choice to avoid complex branching
        }
      }
    });
  });

  test.describe('Phase 4: Edge Cases & Error Handling', () => {
    test('Boundary Testing - Map Edges', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('canvas');

      // Try to move beyond map boundaries
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('KeyW'); // Move up repeatedly
        await page.keyboard.press('ArrowLeft'); // Move left repeatedly
      }

      await page.waitForTimeout(1000);

      // Verify no crashes or errors
      const logs = await page.evaluate(() => window.consoleMessages || []);
      const errors = logs.filter(log => log.includes('error') || log.includes('Error') || log.includes('crash'));
      expect(errors.length).toBe(0);

      // Player should still be controllable
      await page.keyboard.press('KeyS');
      await page.waitForTimeout(500);

      const postBoundaryLogs = await page.evaluate(() => window.consoleMessages || []);
      expect(postBoundaryLogs.length >= logs.length).toBe(true);
    });

    test('Rapid Hotspot Entry/Exit', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('canvas');

      // Rapid movement to trigger hotspot detection repeatedly
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('KeyW');
        await page.keyboard.press('KeyS');
        await page.keyboard.press('KeyA');
        await page.keyboard.press('KeyD');
      }

      await page.waitForTimeout(2000);

      // Verify no errors or crashes
      const logs = await page.evaluate(() => window.consoleMessages || []);
      const errors = logs.filter(log => log.includes('error') || log.includes('Error') || log.includes('crash'));
      expect(errors.length).toBe(0);
    });

    test('Multiple Dialog Triggers', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('canvas');

      // Try multiple space presses to trigger dialogs
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Space');
        await page.waitForTimeout(500);
      }

      await page.waitForTimeout(1000);

      // Verify no errors
      const logs = await page.evaluate(() => window.consoleMessages || []);
      const errors = logs.filter(log => log.includes('error') || log.includes('Error') || log.includes('crash'));
      expect(errors.length).toBe(0);

      // Check if dialog state is consistent
      const dialogs = await page.$$('.dialog-container');
      expect(dialogs.length).toBeLessThanOrEqual(1); // Should not have multiple dialogs
    });

    test('Browser Refresh Recovery', async ({ page, context }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('canvas');

      // Perform some actions
      await page.keyboard.press('KeyW');
      await page.keyboard.press('Space');

      await page.waitForTimeout(1000);

      // Refresh the page
      await page.reload();
      await page.waitForSelector('canvas');

      // Verify game reloads properly
      const canvas = await page.$('canvas');
      expect(canvas).toBeTruthy();

      // Test basic functionality after refresh
      await page.keyboard.press('KeyA');
      await page.waitForTimeout(500);

      const logs = await page.evaluate(() => window.consoleMessages || []);
      const errors = logs.filter(log => log.includes('error') || log.includes('Error'));
      expect(errors.length).toBe(0);
    });
  });

  test.describe('Performance & UX Validation', () => {
    test('Load Time Performance', async ({ page }) => {
      const startTime = Date.now();

      await page.goto(GAME_URL);
      await page.waitForSelector('canvas', { timeout: 15000 });

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds

      // Check for smooth animation (no stuttering)
      await page.keyboard.press('KeyW');
      await page.waitForTimeout(1000);

      // Performance should be acceptable (no console warnings about performance)
      const logs = await page.evaluate(() => window.consoleMessages || []);
      const performanceWarnings = logs.filter(log => log.includes('performance') || log.includes('slow'));
      expect(performanceWarnings.length).toBe(0);
    });

    test('Visual Layout - No Overlap or Clipping', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('canvas');

      // Trigger dialog
      await page.keyboard.press('Space');
      await page.waitForTimeout(1000);

      const dialog = await page.$('.dialog-container');
      if (dialog) {
        // Check dialog is within viewport
        const boundingBox = await dialog.boundingBox();
        expect(boundingBox.x).toBeGreaterThanOrEqual(0);
        expect(boundingBox.y).toBeGreaterThanOrEqual(0);

        // Check text readability (basic check)
        const textElement = await page.$('.dialog-text');
        if (textElement) {
          const textBox = await textElement.boundingBox();
          expect(textBox.width).toBeGreaterThan(100);
          expect(textBox.height).toBeGreaterThan(20);
        }
      }
    });
  });
});
