#!/usr/bin/env node

// Create the absolute minimal JSON that inkjs can handle
const fs = require('fs');

console.log('🔧 Creating minimal inkjs JSON...');

// Start with the most basic possible structure
function createMinimalStory(content) {
    return {
        version: "0.1",
        inkVersion: 19,
        root: [
            {
                // Try different approaches for the content
                text: content || "Hello world.",
                tags: [],
                choices: []
            }
        ]
    };
}

// Test different content approaches
const testStories = [
    {
        file: 'js/ink/ink-stories/character-creation.json',
        content: "Hello world."
    },
    {
        file: 'js/ink/ink-stories/main.json', 
        content: "The story begins."
    },
    {
        file: 'js/ink/ink-stories/training.json',
        content: "Training day."
    }
];

testStories.forEach(story => {
    const jsonStory = createMinimalStory(story.content);
    fs.writeFileSync(story.file, JSON.stringify(jsonStory, null, 2));
    console.log(`✅ Created ${story.file} with minimal content`);
});

console.log('\n🧪 Testing with absolute minimal content...');
