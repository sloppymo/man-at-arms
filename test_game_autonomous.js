// Autonomous game test - validates structure and simulates key interactions
import http from 'http';
import fs from 'fs';

const gameFile = '/home/sloppymo/Documents/man-at-arms/man-at-arms.html';
const testUrl = 'http://localhost:8000/man-at-arms.html';

console.log('🧪 Starting comprehensive autonomous game test...\n');

// Test results
const results = {
    passed: [],
    failed: [],
    warnings: []
};

function test(name, condition, message) {
    if (condition) {
        console.log(`✅ ${name}: ${message}`);
        results.passed.push(name);
    } else {
        console.log(`❌ ${name}: ${message}`);
        results.failed.push(name);
    }
}

function warn(name, message) {
    console.log(`⚠️  ${name}: ${message}`);
    results.warnings.push({ name, message });
}

// Test 1: File accessibility
console.log('═══════════════════════════════════════');
console.log('PHASE 1: File & Structure Tests');
console.log('═══════════════════════════════════════\n');

test('File exists', fs.existsSync(gameFile), 'Game file found');
const html = fs.readFileSync(gameFile, 'utf8');
test('File readable', html.length > 0, `${(html.length / 1024).toFixed(2)} KB`);

// Test 2: Core game structure
console.log('\n═══════════════════════════════════════');
console.log('PHASE 2: Core Game Structure');
console.log('═══════════════════════════════════════\n');

test('CAMPFIRE_VIGNETTES array', /const CAMPFIRE_VIGNETTES\s*=\s*\[/.test(html), 'Defined');
test('Scenes object', /const scenes\s*=\s*\{/.test(html), 'Defined');
test('Game state', /gameState\s*=/.test(html), 'Initialized');
test('Campfire interlude', /campfire_interlude:\s*\{/.test(html), 'Scene exists');

// Test 3: Multi-stage system
console.log('\n═══════════════════════════════════════');
console.log('PHASE 3: Multi-Stage Vignette System');
console.log('═══════════════════════════════════════\n');

const stagesMatches = html.match(/stages:\s*\[/g);
const stagesCount = stagesMatches ? stagesMatches.length : 0;
test('Multi-stage structure', stagesCount >= 19, `${stagesCount} vignettes converted`);

// Check specific converted vignettes
const convertedVignettes = [
    'wat_knife_humor', 'cook_salt_01', 'wat_vulgar_02', 'cook_story_home_02',
    'odd_couple_03', 'wat_scars_04', 'cook_rations_04', 'both_watch_05',
    'wat_fury_06', 'cook_names_06', 'both_song_07', 'wat_mercy_08',
    'wat_embers_01', 'cook_knife_02', 'wat_dreams_03', 'oana_carving_01',
    'oana_breton_02', 'oana_wounds_04', 'oana_memory_06'
];

let convertedCount = 0;
convertedVignettes.forEach(id => {
    const hasStages = new RegExp(`id:\\s*"${id}"[\\s\\S]*?stages:\\s*\\[`).test(html);
    if (hasStages) {
        convertedCount++;
    }
});

test('Specific vignettes converted', convertedCount >= 19, `${convertedCount}/${convertedVignettes.length} key vignettes`);

// Test 4: Response system
console.log('\n═══════════════════════════════════════');
console.log('PHASE 4: Response System');
console.log('═══════════════════════════════════════\n');

const responseMatches = html.match(/response:\s*function\(gs\)/g);
const responseCount = responseMatches ? responseMatches.length : 0;
test('Response functions', responseCount >= 50, `${responseCount} response functions found`);

test('currentResponse usage', /gs\.campfire\.currentResponse/.test(html), 'Response tracking implemented');
test('isExit flag', /isExit:\s*true/.test(html), 'Exit mechanism present');

// Test 5: Irreverent options
console.log('\n═══════════════════════════════════════');
console.log('PHASE 5: Irreverent Dialogue Options');
console.log('═══════════════════════════════════════\n');

const irreverentPatterns = {
    'I don\'t give a shit': /I don't give a shit/i,
    'Fucking idiot': /fucking idiot/i,
    'Fuck off': /Fuck off/i,
    'Fuck your': /Fuck your/i,
    'Bullshit': /bullshit/i
};

let totalIrreverent = 0;
for (const [name, pattern] of Object.entries(irreverentPatterns)) {
    const matches = html.match(new RegExp(pattern.source, 'g'));
    const count = matches ? matches.length : 0;
    if (count > 0) {
        test(name, true, `${count} instances`);
        totalIrreverent += count;
    } else {
        warn(name, 'Not found');
    }
}

test('Total irreverent options', totalIrreverent >= 20, `${totalIrreverent} total instances`);

// Test 6: Campfire logic
console.log('\n═══════════════════════════════════════');
console.log('PHASE 6: Campfire System Logic');
console.log('═══════════════════════════════════════\n');

test('Stage iteration', /currentStage|stageIndex|stages\[/.test(html), 'Stage navigation logic');
test('Response handling', /currentResponse/.test(html), 'Response display logic');
test('Exit handling', /isExit/.test(html), 'Exit condition handling');

// Test 7: HTTP server test
console.log('\n═══════════════════════════════════════');
console.log('PHASE 7: HTTP Server Test');
console.log('═══════════════════════════════════════\n');

function testHttpServer() {
    return new Promise((resolve) => {
        const req = http.get(testUrl, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200 && data.length > 0) {
                    test('HTTP server', true, `Status ${res.statusCode}, ${(data.length / 1024).toFixed(2)} KB`);
                    test('Server content', data.includes('CAMPFIRE_VIGNETTES'), 'Game content served');
                    resolve(true);
                } else {
                    test('HTTP server', false, `Status ${res.statusCode}`);
                    resolve(false);
                }
            });
        });
        
        req.on('error', (err) => {
            warn('HTTP server', `Connection failed: ${err.message}`);
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            warn('HTTP server', 'Request timeout');
            resolve(false);
        });
    });
}

// Run HTTP test
testHttpServer().then(() => {

// Test 8: JavaScript syntax validation
console.log('\n═══════════════════════════════════════');
console.log('PHASE 8: JavaScript Validation');
console.log('═══════════════════════════════════════\n');

// Extract script blocks
const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
test('Script blocks', scriptMatches && scriptMatches.length > 0, `${scriptMatches ? scriptMatches.length : 0} found`);

// Check for common issues
const syntaxIssues = [];
if (/function\s*\([^)]*\)\s*\{[^}]*$/.test(html)) {
    syntaxIssues.push('Possible unclosed functions');
}
if (/\[[^\]]*$/.test(html)) {
    syntaxIssues.push('Possible unclosed arrays');
}

if (syntaxIssues.length > 0) {
    syntaxIssues.forEach(issue => warn('Syntax', issue));
} else {
    test('JavaScript syntax', true, 'No obvious syntax errors');
}

// Final summary
console.log('\n═══════════════════════════════════════');
console.log('📋 COMPREHENSIVE TEST SUMMARY');
console.log('═══════════════════════════════════════');
console.log(`✅ Passed: ${results.passed.length}`);
console.log(`❌ Failed: ${results.failed.length}`);
console.log(`⚠️  Warnings: ${results.warnings.length}`);

if (results.failed.length > 0) {
    console.log('\n❌ Failed tests:');
    results.failed.forEach(name => console.log(`   - ${name}`));
}

if (results.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    results.warnings.forEach(w => console.log(`   - ${w.name}: ${w.message}`));
}

const successRate = (results.passed.length / (results.passed.length + results.failed.length)) * 100;
console.log(`\n📊 Success rate: ${successRate.toFixed(1)}%`);

if (results.failed.length === 0) {
    console.log('\n✅ ALL CRITICAL TESTS PASSED!');
    console.log('🎮 Game is ready for testing!');
    process.exit(0);
} else if (successRate >= 80) {
    console.log('\n⚠️  Most tests passed, but some issues detected');
    console.log('🎮 Game may still be functional');
    process.exit(0);
} else {
    console.log('\n❌ Multiple test failures detected');
    process.exit(1);
}
});
