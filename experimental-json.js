#!/usr/bin/env node

// Try to create the absolute minimal JSON that inkjs might accept
const fs = require('fs');

console.log('🔬 Creating experimental JSON structures for inkjs...');

// Based on research, inkjs expects a very specific JSON format
// Let me try several approaches

// Approach 1: Empty story with just version info
const emptyStory = {
    "inkVersion": 19,
    "root": []
};

// Approach 2: Story with a single text node
const simpleStory = {
    "inkVersion": 19,
    "root": [
        [
            "Hello world.",
            null
        ]
    ]
};

// Approach 3: More complex structure based on ink compiler output
const complexStory = {
    "inkVersion": 19,
    "root": [
        [
            "^Hello world.",
            null
        ]
    ],
    "listDefs": {}
};

// Approach 4: Try the format from online examples
const exampleStory = {
    "inkVersion": 19,
    "root": [
        [
            "Hello world.",
            "\n",
            "This is a test.",
            null
        ]
    ]
};

// Test each approach
const approaches = [
    { name: "Empty", data: emptyStory, file: "js/ink/ink-stories/character-creation.json" },
    { name: "Simple Array", data: simpleStory, file: "js/ink/ink-stories/main.json" },
    { name: "Complex", data: complexStory, file: "js/ink/ink-stories/training.json" },
    { name: "Example Format", data: exampleStory, file: "js/ink/ink-stories/test.json" }
];

approaches.forEach(approach => {
    fs.writeFileSync(approach.file, JSON.stringify(approach.data, null, 2));
    console.log(`✅ Created ${approach.name}: ${approach.file}`);
});

console.log('\n🧪 Testing different JSON structures...');
console.log('If any of these work, we can build from there.');
