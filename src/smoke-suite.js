/**
 * Minimal smoke test suite for MAN-AT-ARMS baseline validation
 * Run in browser console: smokeSuite.run()
 */

(function() {
    'use strict';
    
    const smokeSuite = {
        results: {
            passed: 0,
            failed: 0,
            errors: []
        },
        
        /**
         * Run all smoke tests
         */
        async run() {
            console.log('🚀 Starting MAN-AT-ARMS Smoke Tests');
            console.log('=' .repeat(50));
            
            this.results = { passed: 0, failed: 0, errors: [] };
            
            // Test 1: Core dependencies loaded
            this.test('Core Dependencies', () => {
                const required = [
                    'gameState',
                    'makeDefaultGameState', 
                    'CHAPTERS',
                    'EQUIPMENT_DATABASE'
                ];
                
                const missing = required.filter(name => window[name] === undefined);
                if (missing.length > 0) {
                    throw new Error(`Missing dependencies: ${missing.join(', ')}`);
                }
                
                return `All ${required.length} core dependencies loaded`;
            });
            
            // Test 2: Game state structure
            this.test('Game State Structure', () => {
                const state = window.gameState;
                if (!state) throw new Error('gameState not defined');
                
                const requiredFields = ['stats', 'equipment', 'currentScene', 'characterName'];
                const missing = requiredFields.filter(field => !(field in state));
                if (missing.length > 0) {
                    throw new Error(`Missing gameState fields: ${missing.join(', ')}`);
                }
                
                return `gameState has required structure`;
            });
            
            // Test 3: Equipment system
            this.test('Equipment System', () => {
                if (typeof EquipmentManager === 'undefined') {
                    throw new Error('EquipmentManager not defined');
                }
                
                const state = window.gameState;
                if (!state.equipment) throw new Error('equipment not in gameState');
                
                const slots = ['head', 'torso', 'arms', 'legs', 'weapon'];
                const missingSlots = slots.filter(slot => !(slot in state.equipment));
                if (missingSlots.length > 0) {
                    throw new Error(`Missing equipment slots: ${missingSlots.join(', ')}`);
                }
                
                return `Equipment system loaded with ${slots.length} slots`;
            });
            
            // Test 4: Ink integration
            this.test('Ink Integration', () => {
                if (typeof window.inkjs === 'undefined') {
                    throw new Error('inkjs not loaded');
                }
                
                if (typeof window.inkReady === 'undefined') {
                    throw new Error('inkReady promise not available');
                }
                
                return 'Ink.js integration available';
            });
            
            // Test 5: Save/Load functions
            this.test('Save/Load Functions', () => {
                const requiredFunctions = ['saveGame', 'loadGame', 'resetGame'];
                const missing = requiredFunctions.filter(name => typeof window[name] !== 'function');
                if (missing.length > 0) {
                    throw new Error(`Missing functions: ${missing.join(', ')}`);
                }
                
                return 'Save/Load functions available';
            });
            
            // Test 6: UI functions
            this.test('UI Functions', () => {
                const requiredFunctions = ['updateDisplay', 'showNotification'];
                const missing = requiredFunctions.filter(name => typeof window[name] !== 'function');
                if (missing.length > 0) {
                    throw new Error(`Missing UI functions: ${missing.join(', ')}`);
                }
                
                return 'UI functions available';
            });
            
            // Test 7: Validation suite
            this.test('Validation Suite', () => {
                if (typeof window.InkValidationSuite === 'undefined') {
                    throw new Error('InkValidationSuite not available');
                }
                
                if (typeof window.InkBatchRunner === 'undefined') {
                    throw new Error('InkBatchRunner not available');
                }
                
                return 'Validation suite loaded';
            });
            
            // Test 9: Save Schema Migration (Phase 2)
            this.test('Save Schema Migration', () => {
                if (typeof window.migrateSavePayload === 'undefined') {
                    throw new Error('migrateSavePayload not available');
                }
                
                // Create fake legacy save payload (no schemaVersion)
                const legacyPayload = {
                    stats: { strength: 5, agility: 5 },
                    equipment: {
                        weapon: { id: 'sword_basic' }, // Legacy flat format
                        head: { id: 'helmet_basic' },
                        bag: []
                    },
                    currentScene: 'character_creation'
                };
                
                // Migrate the payload
                const migratedPayload = window.migrateSavePayload(legacyPayload);
                
                // Verify schema version
                if (!migratedPayload.schemaVersion || migratedPayload.schemaVersion !== 2) {
                    throw new Error(`Expected schemaVersion 2, got ${migratedPayload.schemaVersion}`);
                }
                
                // Verify savedAt added
                if (!migratedPayload.savedAt) {
                    throw new Error('savedAt not added to migrated payload');
                }
                
                // Verify gameState wrapper
                if (!migratedPayload.gameState) {
                    throw new Error('gameState not wrapped in migrated payload');
                }
                
                // Verify equipment migrated to canonical format
                const equipment = migratedPayload.gameState.equipment;
                if (!equipment || typeof equipment !== 'object') {
                    throw new Error('Equipment not migrated properly');
                }
                
                // Check canonical slots exist
                const requiredSlots = ['head', 'torso', 'arms', 'legs', 'weapon', 'missile', 'accessory', 'bag'];
                const missingSlots = requiredSlots.filter(slot => !(slot in equipment));
                if (missingSlots.length > 0) {
                    throw new Error(`Missing canonical slots: ${missingSlots.join(', ')}`);
                }
                
                // Check weapon has main layer with migrated item
                if (!equipment.weapon.main || equipment.weapon.main.id !== 'sword_basic') {
                    throw new Error('Weapon not migrated to main layer correctly');
                }
                
                return 'Save schema migration working correctly';
            });
            
            // Results summary
            console.log('\n📊 Smoke Test Results:');
            console.log(`✅ Passed: ${this.results.passed}`);
            console.log(`❌ Failed: ${this.results.failed}`);
            
            if (this.results.errors.length > 0) {
                console.log('\n🚨 Errors:');
                this.results.errors.forEach(error => {
                    console.log(`  - ${error}`);
                });
            }
            
            console.log('\n📋 Summary:');
            const total = this.results.passed + this.results.failed;
            const passRate = total > 0 ? (this.results.passed / total * 100).toFixed(1) : 0;
            console.log(`Overall: ${passRate}% pass rate (${this.results.passed}/${total})`);
            
            return this.results;
        },
        
        /**
         * Run individual test
         */
        test(name, testFn) {
            try {
                const result = testFn();
                console.log(`✅ ${name}: ${result}`);
                this.results.passed++;
            } catch (error) {
                console.log(`❌ ${name}: ${error.message}`);
                this.results.failed++;
                this.results.errors.push(`${name}: ${error.message}`);
            }
        },
        
        /**
         * Save results to baseline file
         */
        saveResults() {
            const baseline = {
                timestamp: new Date().toISOString(),
                phase: '0',
                smokeTest: this.results,
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            console.log('\n💾 Copy this JSON to tests/baseline-results.json:');
            console.log(JSON.stringify(baseline, null, 2));
            
            return baseline;
        }
    };
    
    // Make available globally
    window.smokeSuite = smokeSuite;
    
    console.log('Smoke suite loaded. Run smokeSuite.run() to execute tests.');
})();
