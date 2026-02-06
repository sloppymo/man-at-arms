#!/usr/bin/env node

// Try the absolute simplest possible JSON structure
const fs = require('fs');

console.log('🔧 Trying ultra-minimal JSON structure...');

// Try 1: Completely empty structure
const emptyStory = {
    version: "0.1",
    inkVersion: 19,
    root: []
};

// Try 2: Just version info
const versionOnly = {
    version: "0.1",
    inkVersion: 19
};

// Try 3: Root with simple string (not object)
const simpleRoot = {
    version: "0.1",
    inkVersion: 19,
    root: ["Hello world."]
};

// Test each approach
const approaches = [
    { name: "Empty", data: emptyStory, file: "js/ink/ink-stories/character-creation.json" },
    { name: "Version Only", data: versionOnly, file: "js/ink/ink-stories/main.json" },
    { name: "Simple Root", data: simpleRoot, file: "js/ink/ink-stories/training.json" }
];

approaches.forEach(approach => {
    fs.writeFileSync(approach.file, JSON.stringify(approach.data, null, 2));
    console.log(`✅ Created ${approach.name} structure in ${approach.file}`);
});

console.log('\n🧪 Testing ultra-minimal approaches...');
console.log('If any of these work, we can build from there.');
