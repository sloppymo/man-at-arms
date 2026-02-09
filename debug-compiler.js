#!/usr/bin/env node
// Debug the Ink compiler to see what's happening

import fs from 'fs';
import path from 'path';

function debugInkFile(inkFilePath) {
    const inkContent = fs.readFileSync(inkFilePath, 'utf8');
    const lines = inkContent.split('\n');
    
    console.log(`\n=== DEBUG: ${inkFilePath} ===`);
    console.log(`Total lines: ${lines.length}`);
    console.log(`First 10 lines:`);
    
    for (let i = 0; i < Math.min(10, lines.length); i++) {
        const line = lines[i];
        const trimmed = line.trim();
        console.log(`${i + 1}: "${line}" -> trimmed: "${trimmed}"`);
        
        if (trimmed.match(/^==\s+\w+\s*$/)) {
            console.log(`   ^^ KNOT HEADER DETECTED`);
        }
        if (trimmed.startsWith('EXTERNAL')) {
            console.log(`   ^^ EXTERNAL DETECTED`);
        }
        if (trimmed.startsWith('*')) {
            console.log(`   ^^ CHOICE DETECTED`);
        }
        if (trimmed.startsWith('->')) {
            console.log(`   ^^ DIVERT DETECTED`);
        }
    }
    
    // Look for knot headers
    const knotHeaders = [];
    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (trimmed.match(/^==\s+.+\s*$/)) {
            knotHeaders.push({ line: i + 1, content: trimmed });
        }
    }
    
    console.log(`\nFound ${knotHeaders.length} knot headers:`);
    knotHeaders.forEach(k => console.log(`  Line ${k.line}: ${k.content}`));
}

// Test with one file
debugInkFile('stories/chevauchee/00_arrival.ink');
