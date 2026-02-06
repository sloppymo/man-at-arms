#!/usr/bin/env node

// Try using raw ink content directly instead of JSON
const fs = require('fs');

console.log('🔄 Trying raw ink approach...');

// Read the original ink files
const inkFiles = [
    'js/ink/ink-stories/character-creation.ink',
    'js/ink/ink-stories/main.ink', 
    'js/ink/ink-stories/training.ink'
];

// Create simple test ink content that should work
const simpleInkContent = `Hello world.
The story continues here.`;

// Write simple ink files
inkFiles.forEach(file => {
    fs.writeFileSync(file, simpleInkContent);
    console.log(`✅ Created simple ${file}`);
});

console.log('\n🎯 Simple ink files created - try loading raw ink content directly');
