// Unit Tests for Tempo Strike Timing Algorithm
// Tests the millisecond-based timing calculation and grading system

(function() {
    'use strict';

    // Test helper: Simulate timing calculation
    function testCalculateTiming(hitTimestamp, startMs, periodMs, windows, tier) {
        // Normalize to positive phase to handle JS remainder behavior
        const elapsedMs = hitTimestamp - startMs;
        const phaseMs = ((elapsedMs % periodMs) + periodMs) % periodMs;

        // Calculate actual center crossing times for triangle wave
        const crossing1 = periodMs * 0.25;
        const crossing2 = periodMs * 0.75;

        // Circular distance helper
        function circularDistance(current, target, period) {
            const raw = current - target;
            const abs = Math.abs(raw);
            return abs > period / 2 ? period - abs : abs;
        }

        const dist1 = circularDistance(phaseMs, crossing1, periodMs);
        const dist2 = circularDistance(phaseMs, crossing2, periodMs);
        const nearestDist = Math.min(dist1, dist2);
        const nearestCrossing = dist1 <= dist2 ? crossing1 : crossing2;
        const hitErrorMs = phaseMs - nearestCrossing; // Signed error

        const absError = Math.abs(hitErrorMs);
        let grade, bonus;

        if (absError <= windows.perfect) {
            grade = 'PERFECT';
            bonus = tier.rewardTable.PERFECT;
        } else if (absError <= windows.good) {
            grade = 'GOOD';
            bonus = tier.rewardTable.GOOD;
        } else {
            grade = 'MISS';
            bonus = tier.rewardTable.MISS;
        }

        const direction = hitErrorMs < 0 ? 'early' : 'late';

        return { grade, bonus, hitErrorMs, direction, absError };
    }

    // Test data
    const periodMs = 2000;
    const safeTier = { rewardTable: { MISS: 0, GOOD: 1, PERFECT: 2 } };
    const greedyTier = { rewardTable: { MISS: 0, GOOD: 2, PERFECT: 4 } };
    const windows = { perfect: 80, good: 200 };

    // Test cases
    const testCases = [
        {
            name: 'Perfect hit at center (0ms error)',
            startMs: 1000,
            hitTimestamp: 1000 + periodMs * 0.25, // Exactly at crossing1
            expected: { grade: 'PERFECT', bonus: 2, hitErrorMs: 0, direction: 'late' }
        },
        {
            name: 'Perfect hit early (within perfect window)',
            startMs: 1000,
            hitTimestamp: 1000 + periodMs * 0.25 - 40, // 40ms early
            expected: { grade: 'PERFECT', bonus: 2, direction: 'early' }
        },
        {
            name: 'Perfect hit late (within perfect window)',
            startMs: 1000,
            hitTimestamp: 1000 + periodMs * 0.25 + 40, // 40ms late
            expected: { grade: 'PERFECT', bonus: 2, direction: 'late' }
        },
        {
            name: 'Good hit (outside perfect, within good)',
            startMs: 1000,
            hitTimestamp: 1000 + periodMs * 0.25 + 120, // 120ms late
            expected: { grade: 'GOOD', bonus: 1, direction: 'late' }
        },
        {
            name: 'Miss (outside good window)',
            startMs: 1000,
            hitTimestamp: 1000 + periodMs * 0.25 + 300, // 300ms late
            expected: { grade: 'MISS', bonus: 0, direction: 'late' }
        },
        {
            name: 'Wrap-around early hit (near period end)',
            startMs: 1000,
            hitTimestamp: 1000 + periodMs * 0.75 + periodMs - 30, // 30ms before crossing2 (wraps to early)
            expected: { grade: 'PERFECT', bonus: 2, direction: 'early' }
        },
        {
            name: 'Greedy tier perfect',
            startMs: 1000,
            hitTimestamp: 1000 + periodMs * 0.25,
            tier: greedyTier,
            expected: { grade: 'PERFECT', bonus: 4, hitErrorMs: 0, direction: 'late' }
        }
    ];

    // Run tests
    function runTimingAlgorithmTests() {
        console.log('Running Tempo Strike Timing Algorithm Tests...');
        let passed = 0;
        let failed = 0;

        testCases.forEach((testCase, index) => {
            const tier = testCase.tier || safeTier;
            const result = testCalculateTiming(
                testCase.hitTimestamp,
                testCase.startMs,
                periodMs,
                windows,
                tier
            );

            const success = (
                result.grade === testCase.expected.grade &&
                result.bonus === testCase.expected.bonus &&
                result.direction === testCase.expected.direction &&
                (testCase.expected.hitErrorMs === undefined || Math.abs(result.hitErrorMs - testCase.expected.hitErrorMs) < 1)
            );

            if (success) {
                console.log(`✓ Test ${index + 1}: ${testCase.name}`);
                passed++;
            } else {
                console.log(`✗ Test ${index + 1}: ${testCase.name}`);
                console.log(`  Expected: ${JSON.stringify(testCase.expected)}`);
                console.log(`  Got: ${JSON.stringify(result)}`);
                failed++;
            }
        });

        console.log(`\nResults: ${passed} passed, ${failed} failed`);
        return { passed, failed };
    }

    // Test circular distance calculation
    function testCircularDistance() {
        console.log('\nTesting Circular Distance...');

        function circularDistance(current, target, period) {
            const raw = current - target;
            const abs = Math.abs(raw);
            return abs > period / 2 ? period - abs : abs;
        }

        const circularTests = [
            { current: 100, target: 100, period: 1000, expected: 0 },
            { current: 100, target: 200, period: 1000, expected: 100 },
            { current: 900, target: 100, period: 1000, expected: 200 }, // Wrap around
            { current: 50, target: 950, period: 1000, expected: 100 }, // Wrap around other way
        ];

        let passed = 0;
        circularTests.forEach((test, index) => {
            const result = circularDistance(test.current, test.target, test.period);
            if (Math.abs(result - test.expected) < 0.001) {
                console.log(`✓ Circular distance test ${index + 1}`);
                passed++;
            } else {
                console.log(`✗ Circular distance test ${index + 1}: expected ${test.expected}, got ${result}`);
            }
        });

        return passed === circularTests.length;
    }

    // Export for global access
    window.runTempoStrikeUnitTests = function() {
        const timingResults = runTimingAlgorithmTests();
        const circularResult = testCircularDistance();

        console.log('\n=== Tempo Strike Unit Test Summary ===');
        console.log(`Timing tests: ${timingResults.passed}/${timingResults.passed + timingResults.failed} passed`);
        console.log(`Circular distance: ${circularResult ? 'PASSED' : 'FAILED'}`);

        return {
            timing: timingResults,
            circularDistance: circularResult,
            overall: timingResults.failed === 0 && circularResult
        };
    };

    console.log('Tempo Strike unit tests loaded. Run window.runTempoStrikeUnitTests() to execute.');
})();
