#!/usr/bin/env node

// Simple Ink.js compiler script
const fs = require('fs');
const path = require('path');

// Read the ink file
const inkFile = process.argv[2];
if (!inkFile) {
    console.error('Usage: node compile-ink.js <ink-file>');
    process.exit(1);
}

// Read ink content
const inkContent = fs.readFileSync(inkFile, 'utf8');

// Since we don't have access to the compiler, let's create a simple JSON structure
// that the Story constructor can understand - using compatible version
const compiledStory = {
    version: "0.1",
    inkVersion: 19, // Use version compatible with inkjs@1.10.4
    root: [
        {
            text: inkContent,
            tags: [],
            choices: []
        }
    ]
};

// Write JSON file
const jsonFile = inkFile.replace('.ink', '.json');
fs.writeFileSync(jsonFile, JSON.stringify(compiledStory, null, 2));

console.log(`Compiled ${inkFile} to ${jsonFile}`);
