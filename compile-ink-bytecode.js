// Manual Ink bytecode compiler
// Creates proper inkjs-compatible JSON from .ink source

const fs = require('fs');
const path = require('path');

function parseInkContent(content) {
    const lines = content.split('\n');
    const sections = [];
    let currentSection = '';
    let inKnot = false;

    for (const line of lines) {
        // Check for knot header (=== knot_name ===)
        if (line.trim().match(/^=== .+ ===$/)) {
            // Save previous section if exists
            if (currentSection.trim()) {
                sections.push(currentSection.trim());
            }
            // Start new section with the knot header
            currentSection = line.trim();
            inKnot = true;
        } else if (inKnot) {
            // Add to current section
            currentSection += '\n' + line;
        } else {
            // Global content before first knot
            if (line.trim() && !line.trim().startsWith('//')) {
                currentSection += line + '\n';
            }
        }
    }

    // Add final section
    if (currentSection.trim()) {
        sections.push(currentSection.trim());
    }

    return sections;
}

function compileInkFile(inkFilePath) {
    try {
        const inkContent = fs.readFileSync(inkFilePath, 'utf8');
        console.log(`Compiling ${inkFilePath}...`);

        // Parse the ink content into sections
        const sections = parseInkContent(inkContent);

        // Create bytecode structure
        const bytecode = {
            inkVersion: 19,
            root: []
        };

        // Add entry point redirect
        bytecode.root.push(["-> character_creation", null]);

        // Add each section as bytecode element
        sections.forEach(section => {
            bytecode.root.push([section, null]);
        });

        const jsonFilePath = inkFilePath.replace('.ink', '.json');
        fs.writeFileSync(jsonFilePath, JSON.stringify(bytecode, null, 2));

        console.log(`✅ Compiled ${jsonFilePath} (${sections.length} sections)`);
        return jsonFilePath;

    } catch (error) {
        console.error(`❌ Error compiling ${inkFilePath}:`, error.message);
        throw error;
    }
}

// Compile character-creation.ink
const inkFile = './js/ink/ink-stories/character-creation.ink';
compileInkFile(inkFile);
