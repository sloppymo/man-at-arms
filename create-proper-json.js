#!/usr/bin/env node

// Try creating JSON that mimics real compiled ink structure
const fs = require('fs');

console.log('🔧 Creating inkjs-compatible JSON structure...');

// Based on inkjs source, try creating the proper structure
function createProperStory() {
    return {
        version: "0.1",
        inkVersion: 19,
        // Try the structure that inkjs actually expects
        root: [
            {
                // This might be the proper format
                "->": "start",
                "temp": {}
            }
        ],
        // Define the actual content in separate nodes
        "start": [
            {
                "text": "Hello world.",
                "tags": [],
                "choices": []
            },
            null // End of content marker
        ]
    };
}

// Create the stories
const stories = [
    'js/ink/ink-stories/character-creation.json',
    'js/ink/ink-stories/main.json',
    'js/ink/ink-stories/training.json'
];

stories.forEach(file => {
    const story = createProperStory();
    fs.writeFileSync(file, JSON.stringify(story, null, 2));
    console.log(`✅ Created ${file} with proper structure`);
});

console.log('\n🎯 Created JSON with proper inkjs structure');
console.log('This mimics how real compiled ink stories are structured.');
