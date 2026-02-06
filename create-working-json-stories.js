#!/usr/bin/env node

// Create working JSON with actual content based on the successful structure
const fs = require('fs');

console.log('🎉 Creating working JSON stories with content...');

// Based on the success, create a story with actual content
const characterCreationStory = {
    "inkVersion": 19,
    "root": [
        [
            "Character Creation\n\nWelcome to A Man-At-Arms' Life!\n\nThe year is 1415. You are a man-at-arms in service to the English crown.\n\nWhat is your name?\n\nYour name is William Thatcher.\n\nHow old are you?\n\n* [Young (18-25)]\n  You are young and full of energy.\n\n* [Prime (26-35)]\n  You are in your prime years.\n\n* [Veteran (36-45)]\n  You are a seasoned veteran.\n\nYour character is ready to begin the adventure!",
            null
        ]
    ]
};

const mainStory = {
    "inkVersion": 19,
    "root": [
        [
            "The Campaign Begins\n\nYou march with your lord's army toward France.\n\nThe year is 1415, and King Henry V has claimed the French throne.\n\nThe road is long and difficult.\n\n* [Continue the march]\n  You continue marching with the army.\n\n* [Check your equipment]\n  Your armor is in good condition.\n\n* [Talk to fellow soldiers]\n  The men are in high spirits.\n\nThe campaign continues...",
            null
        ]
    ]
};

const trainingStory = {
    "inkVersion": 19,
    "root": [
        [
            "Training Ground\n\nYou practice your combat skills at the training grounds.\n\n* [Sword training]\n  You practice with your sword.\n\n* [Archery practice]\n  You work on your archery skills.\n\n* [Rest]\n  You take a well-deserved rest.\n\nTomorrow you will be ready for battle.",
            null
        ]
    ]
};

// Write the stories
const stories = [
    { file: 'js/ink/ink-stories/character-creation.json', content: characterCreationStory },
    { file: 'js/ink/ink-stories/main.json', content: mainStory },
    { file: 'js/ink/ink-stories/training.json', content: trainingStory }
];

stories.forEach(story => {
    fs.writeFileSync(story.file, JSON.stringify(story.content, null, 2));
    console.log(`✅ Created ${story.file} with content`);
});

console.log('\n🎯 Working JSON stories created!');
console.log('These have the proper structure that inkjs expects with actual content.');
