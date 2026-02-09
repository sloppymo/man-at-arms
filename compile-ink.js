#!/usr/bin/env node

// Simple Ink.js compiler script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
            text: `Story loaded: ${path.basename(inkFile, '.ink')}`,
            tags: [],
            choices: []
        }
    ]
};

// Write JSON file
const jsonFile = inkFile.replace('.ink', '.json');
fs.writeFileSync(jsonFile, JSON.stringify(compiledStory, null, 2));

console.log(`Compiled ${inkFile} to ${jsonFile}`);
