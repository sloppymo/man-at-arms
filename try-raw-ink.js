#!/usr/bin/env node

// Try using raw ink content directly
const fs = require('fs');

console.log('🔄 Testing raw ink approach...');

// Create simple ink content
const simpleInk = `Hello world.
This is a test.
The end.`;

// Write it as a .json file (but it's actually raw ink)
fs.writeFileSync('js/ink/ink-stories/character-creation.json', simpleInk);
console.log('✅ Created raw ink content in character-creation.json');

// Also create a simple test script
const testScript = `
console.log('🧪 Testing raw ink with inkjs...');

// Try raw ink directly
const inkContent = \`Hello world.
This is a test.
The end.\`;

try {
    const story = new inkjs.Story(inkContent);
    console.log('✅ Raw ink story created!');
    
    if (story.canContinue) {
        const content = story.Continue();
        console.log('✅ Content:', content);
    }
} catch (error) {
    console.log('❌ Raw ink failed:', error.message);
}
`;

fs.writeFileSync('test-raw-ink.js', testScript);
console.log('✅ Created test-raw-ink.js');

console.log('\n🎯 Raw ink approach ready for testing');
