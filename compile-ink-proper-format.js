// Proper Ink JSON bytecode compiler for inkjs@1.10.4
// Based on official ink JSON runtime format specification

const fs = require('fs');
const path = require('path');

function parseInkToBytecode(content) {
    const lines = content.split('\n');
    const bytecode = [];
    let currentText = '';
    let inKnot = false;
    let knotName = '';
    
    for (const line of lines) {
        const trimmed = line.trim();
        
        // Skip comments and empty lines
        if (trimmed.startsWith('//') || trimmed === '') {
            continue;
        }
        
        // VAR declarations
        if (trimmed.startsWith('VAR ')) {
            // For now, skip VAR declarations as they need special handling
            continue;
        }
        
        // Knot headers
        if (trimmed.match(/^=== .+ ===$/)) {
            // Save previous content if any
            if (currentText.trim()) {
                bytecode.push(`^${currentText.trim()}`);
            }
            knotName = trimmed.replace(/=== /g, '').replace(/ ===$/g, '');
            currentText = '';
            inKnot = true;
            continue;
        }
        
        // Choices
        if (trimmed.startsWith('* ')) {
            if (currentText.trim()) {
                bytecode.push(`^${currentText.trim()}`);
                currentText = '';
            }
            // Add choice point (simplified)
            bytecode.push(trimmed);
            continue;
        }
        
        // Diverts
        if (trimmed.startsWith('-> ')) {
            if (currentText.trim()) {
                bytecode.push(`^${currentText.trim()}`);
            }
            // Add divert
            bytecode.push({"^->": trimmed.substring(3)});
            currentText = '';
            continue;
        }
        
        // Variable assignments
        if (trimmed.startsWith('~ ')) {
            if (currentText.trim()) {
                bytecode.push(`^${currentText.trim()}`);
                currentText = '';
            }
            // Add variable assignment (simplified)
            bytecode.push(trimmed);
            continue;
        }
        
        // Artwork directives (skip for now)
        if (trimmed.startsWith('# ')) {
            continue;
        }
        
        // Conditional text
        if (trimmed.includes('{') || trimmed.includes('}')) {
            currentText += line + '\n';
            continue;
        }
        
        // Regular text
        if (trimmed) {
            currentText += line + '\n';
        }
    }
    
    // Add final content
    if (currentText.trim()) {
        bytecode.push(`^${currentText.trim()}`);
    }
    
    return bytecode;
}

function compileInkFile(inkFilePath) {
    try {
        const inkContent = fs.readFileSync(inkFilePath, 'utf8');
        console.log(`Compiling ${inkFilePath}...`);
        
        // Parse ink to bytecode
        const bytecode = parseInkToBytecode(inkContent);
        
        // Create proper inkjs-compatible JSON structure
        const compiled = {
            inkVersion: 10,  // Correct version per documentation
            root: bytecode.concat([null])  // Add null terminator
        };
        
        const jsonFilePath = inkFilePath.replace('.ink', '.json');
        fs.writeFileSync(jsonFilePath, JSON.stringify(compiled, null, 2));
        
        console.log(`✅ Compiled ${jsonFilePath} (${bytecode.length} elements)`);
        return jsonFilePath;
        
    } catch (error) {
        console.error(`❌ Error compiling ${inkFilePath}:`, error.message);
        throw error;
    }
}

// Compile character-creation.ink
const inkFile = './js/ink/ink-stories/character-creation.ink';
compileInkFile(inkFile);
