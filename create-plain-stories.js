#!/usr/bin/env node

// Ultra-simple inkjs JSON - plain text that works
const fs = require('fs');

console.log('🔧 Creating ultra-simple inkjs JSON (plain text)...');

// Create the simplest possible story that inkjs can handle
function createPlainTextStory(title, content) {
    return {
        version: "0.1",
        inkVersion: 19,
        root: [
            {
                text: content,
                tags: [],
                choices: []
            }
        ]
    };
}

// Plain text stories (no ink syntax)
const stories = [
    {
        file: 'js/ink/ink-stories/character-creation.json',
        title: 'Character Creation',
        content: `Character Creation

Welcome to A Man-At-Arms' Life!

The year is 1415. You are a man-at-arms in service to the English crown.

Your name is William Thatcher.

You are 30 years old and in your prime.

Your character is ready to begin the adventure!`
    },
    {
        file: 'js/ink/ink-stories/main.json',
        title: 'Main Story',
        content: `The Campaign Begins

You march with your lord's army toward France.

The year is 1415, and King Henry V has claimed the French throne.

The road is long and difficult, but you and your fellow soldiers are in high spirits.

The campaign begins...`
    },
    {
        file: 'js/ink/ink-stories/training.json',
        title: 'Training',
        content: `Training Ground

You practice your combat skills at the training grounds.

You work on your sword technique and archery skills.

After a long day of training, you take a well-deserved rest.

Tomorrow you will be ready for battle.`
    }
];

// Write the stories
stories.forEach(story => {
    const jsonStory = createPlainTextStory(story.title, story.content);
    fs.writeFileSync(story.file, JSON.stringify(jsonStory, null, 2));
    console.log(`✅ Created ${story.file}`);
});

console.log('\n🎯 Ultra-simple stories created!');
console.log('These use plain text that inkjs can definitely handle.');
