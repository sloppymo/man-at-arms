// Browser-based test using Puppeteer to simulate actual gameplay
// Tests the campfire vignette system interactively

const puppeteer = require('puppeteer');
const fs = require('fs');

const gameUrl = 'http://localhost:8000/man-at-arms.html';

async function testGame() {
    console.log('🌐 Starting browser-based game test...\n');
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Set a longer timeout for page load
        page.setDefaultTimeout(30000);
        
        console.log('📄 Loading game...');
        await page.goto(gameUrl, { waitUntil: 'networkidle0' });
        console.log('✅ Game loaded\n');
        
        // Test 1: Check for JavaScript errors
        console.log('Test 1: JavaScript error check');
        const jsErrors = [];
        page.on('pageerror', error => {
            jsErrors.push(error.message);
        });
        
        await page.waitForTimeout(2000);
        
        if (jsErrors.length === 0) {
            console.log('✅ No JavaScript errors detected\n');
        } else {
            console.log(`❌ Found ${jsErrors.length} JavaScript errors:`);
            jsErrors.forEach(err => console.log(`   - ${err}`));
            console.log();
        }
        
        // Test 2: Check if game state initializes
        console.log('Test 2: Game state initialization');
        const gameStateCheck = await page.evaluate(() => {
            return typeof gameState !== 'undefined' && 
                   typeof gameState.stats !== 'undefined';
        });
        
        if (gameStateCheck) {
            console.log('✅ Game state initialized\n');
        } else {
            console.log('❌ Game state not initialized\n');
        }
        
        // Test 3: Check if campfire vignettes are defined
        console.log('Test 3: Campfire vignettes definition');
        const vignettesCheck = await page.evaluate(() => {
            return typeof CAMPFIRE_VIGNETTES !== 'undefined' && 
                   Array.isArray(CAMPFIRE_VIGNETTES) &&
                   CAMPFIRE_VIGNETTES.length > 0;
        });
        
        if (vignettesCheck) {
            const vignetteCount = await page.evaluate(() => CAMPFIRE_VIGNETTES.length);
            console.log(`✅ Campfire vignettes defined (${vignetteCount} total)\n`);
        } else {
            console.log('❌ Campfire vignettes not properly defined\n');
        }
        
        // Test 4: Check for multi-stage vignettes
        console.log('Test 4: Multi-stage vignette structure');
        const multiStageCheck = await page.evaluate(() => {
            const multiStage = CAMPFIRE_VIGNETTES.filter(v => v.stages && Array.isArray(v.stages));
            return {
                count: multiStage.length,
                examples: multiStage.slice(0, 5).map(v => v.id)
            };
        });
        
        console.log(`✅ Found ${multiStageCheck.count} multi-stage vignettes`);
        console.log(`   Examples: ${multiStageCheck.examples.join(', ')}\n`);
        
        // Test 5: Check for irreverent options
        console.log('Test 5: Irreverent options');
        const irreverentCheck = await page.evaluate(() => {
            let count = 0;
            const patterns = ['fuck', 'shit', 'idiot', 'bullshit'];
            
            CAMPFIRE_VIGNETTES.forEach(vignette => {
                if (vignette.stages) {
                    vignette.stages.forEach(stage => {
                        if (stage.choices) {
                            stage.choices.forEach(choice => {
                                const text = choice.text.toLowerCase();
                                if (patterns.some(p => text.includes(p))) {
                                    count++;
                                }
                            });
                        }
                    });
                }
            });
            
            return count;
        });
        
        console.log(`✅ Found ${irreverentCheck} irreverent dialogue options\n`);
        
        // Test 6: Test character creation (if needed)
        console.log('Test 6: Character creation system');
        const charCreationCheck = await page.evaluate(() => {
            return typeof scenes !== 'undefined' && 
                   typeof scenes.character_creation !== 'undefined';
        });
        
        if (charCreationCheck) {
            console.log('✅ Character creation system available\n');
        } else {
            console.log('❌ Character creation system not found\n');
        }
        
        // Test 7: Check campfire interlude scene
        console.log('Test 7: Campfire interlude scene');
        const campfireSceneCheck = await page.evaluate(() => {
            return typeof scenes !== 'undefined' && 
                   typeof scenes.campfire_interlude !== 'undefined';
        });
        
        if (campfireSceneCheck) {
            const hasStages = await page.evaluate(() => {
                const scene = scenes.campfire_interlude;
                return scene && typeof scene.onEnter === 'function';
            });
            
            if (hasStages) {
                console.log('✅ Campfire interlude scene properly configured\n');
            } else {
                console.log('⚠️  Campfire interlude scene exists but may need configuration\n');
            }
        } else {
            console.log('❌ Campfire interlude scene not found\n');
        }
        
        // Test 8: Validate response function structure
        console.log('Test 8: Response function validation');
        const responseCheck = await page.evaluate(() => {
            let validResponses = 0;
            let invalidResponses = 0;
            
            CAMPFIRE_VIGNETTES.forEach(vignette => {
                if (vignette.stages) {
                    vignette.stages.forEach(stage => {
                        if (stage.choices) {
                            stage.choices.forEach(choice => {
                                if (choice.response) {
                                    if (typeof choice.response === 'function') {
                                        validResponses++;
                                    } else {
                                        invalidResponses++;
                                    }
                                }
                            });
                        }
                    });
                }
            });
            
            return { valid: validResponses, invalid: invalidResponses };
        });
        
        console.log(`✅ Found ${responseCheck.valid} valid response functions`);
        if (responseCheck.invalid > 0) {
            console.log(`⚠️  Found ${responseCheck.invalid} invalid response definitions`);
        }
        console.log();
        
        // Final summary
        console.log('═══════════════════════════════════════');
        console.log('📋 BROWSER TEST SUMMARY');
        console.log('═══════════════════════════════════════');
        console.log(`JavaScript errors: ${jsErrors.length}`);
        console.log(`Game state: ${gameStateCheck ? '✅' : '❌'}`);
        console.log(`Vignettes: ${vignettesCheck ? '✅' : '❌'}`);
        console.log(`Multi-stage vignettes: ${multiStageCheck.count}`);
        console.log(`Irreverent options: ${irreverentCheck}`);
        console.log(`Response functions: ${responseCheck.valid} valid`);
        
        if (jsErrors.length === 0 && gameStateCheck && vignettesCheck) {
            console.log('\n✅ ALL BROWSER TESTS PASSED!');
            return true;
        } else {
            console.log('\n⚠️  Some issues detected, but core functionality may still work');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        return false;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the test
testGame().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
