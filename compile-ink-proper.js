#!/usr/bin/env node
// Proper Ink compiler that creates inkjs-compatible JSON
// Format matches main-fixed.json: arrays of [content, null] pairs

const fs = require('fs');
const path = require('path');

function compileInkFile(inkFilePath) {
    try {
        const inkContent = fs.readFileSync(inkFilePath, 'utf8');
        console.log(`Compiling ${inkFilePath}...`);
        
        // Split content by knot declarations (=== name ===)
        // Each section becomes an array element
        const sections = [];
        
        // Add entry point redirect
        sections.push(["-> character_creation", null]);
        
        // Split by knot boundaries
        const knotRegex = /(===\s+\w+\s+===)/g;
        const parts = inkContent.split(knotRegex);
        
        // First part is globals/comments before first knot
        if (parts[0].trim()) {
            // Extract VAR declarations and initial content
            const globals = parts[0].trim();
            sections.push([globals, null]);
        }
        
        // Process remaining parts in pairs (knot header, content)
        for (let i = 1; i < parts.length; i += 2) {
            if (i < parts.length) {
                const knotHeader = parts[i];
                const knotContent = parts[i + 1] || '';
                const fullKnot = knotHeader + knotContent;
                sections.push([fullKnot.trim(), null]);
            }
        }
        
        // Create the compiled structure
        const compiled = {
            inkVersion: 19,
            root: sections
        };
        
        const jsonFilePath = inkFilePath.replace('.ink', '.json');
        fs.writeFileSync(jsonFilePath, JSON.stringify(compiled, null, 2));
        
        console.log(`✅ Compiled to ${jsonFilePath} (${sections.length} sections)`);
        return jsonFilePath;
        
    } catch (error) {
        console.error(`❌ Error compiling ${inkFilePath}:`, error.message);
        throw error;
    }
}

// Compile character-creation.ink
const inkFile = process.argv[2] || './js/ink/ink-stories/character-creation.ink';
compileInkFile(inkFile);
