// Simple test script to verify Ink.js JSON loading
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Ink.js JSON loading...');

// Test 1: Check if JSON files exist
const jsonFiles = [
    'js/ink/ink-stories/character-creation.json',
    'js/ink/ink-stories/main.json',
    'js/ink/ink-stories/training.json'
];

console.log('\n📁 Checking JSON files:');
jsonFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
    
    if (exists) {
        const content = fs.readFileSync(file, 'utf8');
        const parsed = JSON.parse(content);
        console.log(`   Size: ${content.length} chars, Root: ${parsed.root ? 'YES' : 'NO'}`);
    }
});

// Test 2: Check if story-loader.js is properly configured
console.log('\n📋 Checking story-loader.js:');
const storyLoader = fs.readFileSync('js/ink/story-loader.js', 'utf8');
const hasJsonLoading = storyLoader.includes('.json');
const hasInkJsStory = storyLoader.includes('new inkjs.Story(parsedJson)');

console.log(`${hasJsonLoading ? '✅' : '❌'} JSON loading configured`);
console.log(`${hasInkJsStory ? '✅' : '❌'} Story constructor uses JSON`);

// Test 3: Check validation files
console.log('\n🧪 Checking validation suite:');
const validationFiles = [
    'js/ink/ink-validation-suite.js',
    'js/ink/validation/batch-runner.js',
    'js/ink/validation/infrastructure-validation.js'
];

validationFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n🎯 Core fix verification complete!');
console.log('If all checks pass, the fresh-test.html should work in browser.');
