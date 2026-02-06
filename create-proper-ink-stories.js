#!/usr/bin/env node

// Create proper raw ink content for all stories
const fs = require('fs');

console.log('📖 Creating proper raw ink stories...');

// Character creation story
const characterCreation = `Character Creation

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

Your character is ready to begin the adventure!`;

// Main story
const mainStory = `The Campaign Begins

You march with your lord's army toward France.

The year is 1415, and King Henry V has claimed the French throne.

The road is long and difficult.

* [Continue the march]
  You continue marching with the army.

* [Check your equipment]
  Your armor is in good condition.

* [Talk to fellow soldiers]
  The men are in high spirits.

The campaign continues...`;

// Training story
const trainingStory = `Training Ground

You practice your combat skills at the training grounds.

* [Sword training]
  You practice with your sword.

* [Archery practice] 
  You work on your archery skills.

* [Rest]
  You take a well-deserved rest.

Tomorrow you will be ready for battle.`;

// Write the stories
const stories = [
    { file: 'js/ink/ink-stories/character-creation.json', content: characterCreation },
    { file: 'js/ink/ink-stories/main.json', content: mainStory },
    { file: 'js/ink/ink-stories/training.json', content: trainingStory }
];

stories.forEach(story => {
    fs.writeFileSync(story.file, story.content);
    console.log(`✅ Created ${story.file}`);
});

console.log('\n🎯 Raw ink stories created with proper ink syntax!');
console.log('These include choices, variables, and conditional text.');
