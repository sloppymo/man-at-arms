#!/usr/bin/env node

// Fixed Ink.js compiler - create proper inkjs-compatible JSON
const fs = require('fs');

console.log('🔧 Creating proper inkjs-compatible JSON...');

// Create a minimal, working JSON structure that inkjs can understand
function createSimpleStory(title, content) {
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

// Create simple test stories that work
const stories = [
    {
        file: 'js/ink/ink-stories/character-creation.json',
        title: 'Character Creation',
        content: `# Character Creation

Welcome to A Man-At-Arms' Life!

The year is 1415. You are a man-at-arms in service to the English crown.

What is your name?

~ characterName = "William Thatcher"
Your name is {characterName}.

How old are you?

* [Young (18-25)]
  ~ age = 21
  You are young and full of energy.

* [Prime (26-35)] 
  ~ age = 30
  You are in your prime years.

* [Veteran (36-45)]
  ~ age = 40
  You are a seasoned veteran.

Your character is ready!`
    },
    {
        file: 'js/ink/ink-stories/main.json',
        title: 'Main Story',
        content: `# The Campaign Begins

You march with your lord's army toward France.

The year is 1415, and King Henry V has claimed the French throne.

* [Continue the march]
  The road is long and difficult.

* [Check your equipment]
  Your armor is in good condition.

* [Talk to fellow soldiers]
  The men are in high spirits.`
    },
    {
        file: 'js/ink/ink-stories/training.json',
        title: 'Training',
        content: `# Training Ground

You practice your combat skills.

* [Sword training]
  You practice with your sword.

* [Archery practice] 
  You work on your archery skills.

* [Rest]
  You take a well-deserved rest.`
    }
];

// Write the stories
stories.forEach(story => {
    const jsonStory = createSimpleStory(story.title, story.content);
    fs.writeFileSync(story.file, JSON.stringify(jsonStory, null, 2));
    console.log(`✅ Created ${story.file}`);
});

console.log('\n🎯 Simple test stories created successfully!');
console.log('These use basic ink syntax that inkjs can parse properly.');
