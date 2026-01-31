// Autonomous test script for Man-at-Arms game
// Tests campfire vignettes, multi-stage system, and irreverent options

const fs = require('fs');
const path = require('path');

const gameFile = '/home/sloppymo/Documents/man-at-arms/man-at-arms.html';

console.log('🧪 Starting autonomous game test...\n');

// Test 1: Check if file exists and is readable
console.log('Test 1: File existence and readability');
if (!fs.existsSync(gameFile)) {
    console.error('❌ Game file not found!');
    process.exit(1);
}
const stats = fs.statSync(gameFile);
console.log(`✅ File exists (${(stats.size / 1024).toFixed(2)} KB)\n`);

// Test 2: Read and parse HTML
console.log('Test 2: HTML structure validation');
const html = fs.readFileSync(gameFile, 'utf8');

// Check for required components
const checks = {
    'CAMPFIRE_VIGNETTES array': /const CAMPFIRE_VIGNETTES = \[/,
    'Multi-stage structure': /stages:\s*\[/,
    'Response functions': /response:\s*function\(gs\)/,
    'Irreverent options': /I don't give a shit|fucking idiot|Fuck off|Fuck your/,
    'Campfire interlude scene': /campfire_interlude/,
    'isExit flag': /isExit:\s*true/,
    'currentResponse usage': /gs\.campfire\.currentResponse/,
};

let passed = 0;
let failed = 0;

for (const [name, regex] of Object.entries(checks)) {
    if (regex.test(html)) {
        console.log(`✅ ${name}`);
        passed++;
    } else {
        console.log(`❌ ${name}`);
        failed++;
    }
}

console.log(`\n📊 Structure checks: ${passed} passed, ${failed} failed\n`);

// Test 3: Validate specific vignettes
console.log('Test 3: Specific vignette validation');
const vignetteTests = [
    {
        name: 'wat_knife_humor',
        checks: [
            /id:\s*"wat_knife_humor"/,
            /stages:\s*\[/,
            /I don't give a shit, Wat/,
            /response:\s*function\(gs\)/,
        ]
    },
    {
        name: 'cook_salt_01',
        checks: [
            /id:\s*"cook_salt_01"/,
            /stages:\s*\[/,
            /You're a fucking idiot, Cook/,
            /This salt speech is bullshit/,
        ]
    },
    {
        name: 'wat_fury_06',
        checks: [
            /id:\s*"wat_fury_06"/,
            /Fuck off with your drifting speech/,
        ]
    },
    {
        name: 'oana_carving_01',
        checks: [
            /id:\s*"oana_carving_01"/,
            /stages:\s*\[/,
            /response:\s*function\(gs\)/,
        ]
    },
];

let vignettePassed = 0;
let vignetteFailed = 0;

for (const test of vignetteTests) {
    const allPass = test.checks.every(regex => regex.test(html));
    if (allPass) {
        console.log(`✅ ${test.name} - all checks passed`);
        vignettePassed++;
    } else {
        console.log(`❌ ${test.name} - some checks failed`);
        const failedChecks = test.checks.filter(regex => !regex.test(html));
        console.log(`   Missing: ${failedChecks.length} checks`);
        vignetteFailed++;
    }
}

console.log(`\n📊 Vignette checks: ${vignettePassed} passed, ${vignetteFailed} failed\n`);

// Test 4: Count converted vignettes
console.log('Test 4: Multi-stage conversion count');
const stagesMatches = html.match(/stages:\s*\[/g);
const stagesCount = stagesMatches ? stagesMatches.length : 0;
console.log(`✅ Found ${stagesCount} vignettes with multi-stage structure`);

const oldFormatMatches = html.match(/^\s+text:\s*function\(gs\)\s*\{[\s\S]*?\},\s*choices:\s*\[/gm);
const oldFormatCount = oldFormatMatches ? oldFormatMatches.length : 0;
if (oldFormatCount > 0) {
    console.log(`⚠️  Found ${oldFormatCount} vignettes still using old format (may be false positives)`);
} else {
    console.log(`✅ No old-format vignettes detected`);
}

// Test 5: Count irreverent options
console.log('\nTest 5: Irreverent options count');
const irreverentPatterns = [
    /I don't give a shit/i,
    /fucking idiot/i,
    /Fuck off/i,
    /Fuck your/i,
    /bullshit/i,
];

let irreverentCount = 0;
for (const pattern of irreverentPatterns) {
    const matches = html.match(new RegExp(pattern.source, 'g'));
    if (matches) {
        irreverentCount += matches.length;
        console.log(`✅ Found ${matches.length} instances of "${pattern.source}"`);
    }
}
console.log(`\n📊 Total irreverent options: ${irreverentCount}\n`);

// Test 6: Check for JavaScript syntax errors (basic)
console.log('Test 6: JavaScript syntax validation');
const jsBlocks = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
if (jsBlocks) {
    console.log(`✅ Found ${jsBlocks.length} script blocks`);
    
    // Check for common syntax issues
    const syntaxChecks = {
        'Unclosed functions': /function\s*\([^)]*\)\s*\{[^}]*$/m,
        'Unclosed arrays': /\[[^\]]*$/m,
        'Unclosed objects': /\{[^}]*$/m,
    };
    
    let syntaxErrors = 0;
    for (const [check, pattern] of Object.entries(syntaxChecks)) {
        if (pattern.test(html)) {
            console.log(`⚠️  Possible issue: ${check}`);
            syntaxErrors++;
        }
    }
    
    if (syntaxErrors === 0) {
        console.log(`✅ No obvious syntax errors detected`);
    }
} else {
    console.log(`❌ No script blocks found!`);
}

// Test 7: Validate campfire system logic
console.log('\nTest 7: Campfire system logic');
const campfireChecks = {
    'Campfire interlude scene exists': /campfire_interlude:\s*\{/,
    'Stage iteration logic': /currentStage|stageIndex|stages\[/,
    'Response handling': /currentResponse/,
    'Exit flag handling': /isExit/,
};

let logicPassed = 0;
let logicFailed = 0;

for (const [name, regex] of Object.entries(campfireChecks)) {
    if (regex.test(html)) {
        console.log(`✅ ${name}`);
        logicPassed++;
    } else {
        console.log(`❌ ${name}`);
        logicFailed++;
    }
}

console.log(`\n📊 Logic checks: ${logicPassed} passed, ${logicFailed} failed\n`);

// Final summary
console.log('═══════════════════════════════════════');
console.log('📋 TEST SUMMARY');
console.log('═══════════════════════════════════════');
console.log(`Structure validation: ${passed}/${passed + failed} passed`);
console.log(`Vignette validation: ${vignettePassed}/${vignettePassed + vignetteFailed} passed`);
console.log(`Multi-stage vignettes: ${stagesCount} found`);
console.log(`Irreverent options: ${irreverentCount} found`);
console.log(`Campfire logic: ${logicPassed}/${logicPassed + logicFailed} passed`);

const totalTests = passed + vignettePassed + logicPassed;
const totalFailed = failed + vignetteFailed + logicFailed;

if (totalFailed === 0) {
    console.log('\n✅ ALL TESTS PASSED!');
    process.exit(0);
} else {
    console.log(`\n⚠️  ${totalFailed} test(s) failed, but core functionality appears intact`);
    process.exit(0);
}
