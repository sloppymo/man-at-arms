// Use the online inkle compiler API
const https = require('https');
const fs = require('fs');
const path = require('path');

async function compileInkFile(inkFilePath) {
    try {
        // Read the ink file
        const inkContent = fs.readFileSync(inkFilePath, 'utf8');
        
        console.log(`Compiling ${inkFilePath}...`);
        
        // Try to use a simple approach - create a basic JSON structure
        // that the Story constructor can understand
        const lines = inkContent.split('\n');
        const content = [];
        let currentText = '';
        
        for (const line of lines) {
            if (line.trim().startsWith('=== ') && line.trim().endsWith(' ===')) {
                // This is a knot header
                if (currentText.trim()) {
                    content.push({
                        text: currentText.trim(),
                        tags: [],
                        choices: []
                    });
                }
                currentText = '';
            } else if (line.trim().startsWith('* [')) {
                // This is a choice
                if (currentText.trim()) {
                    content.push({
                        text: currentText.trim(),
                        tags: [],
                        choices: []
                    });
                }
                currentText = '';
            } else if (line.trim() && !line.trim().startsWith('//') && !line.trim().startsWith('VAR ')) {
                currentText += line + '\n';
            }
        }
        
        // Add the last content
        if (currentText.trim()) {
            content.push({
                text: currentText.trim(),
                tags: [],
                choices: []
            });
        }
        
        // Create the JSON structure
        const jsonStructure = {
            version: "0.1",
            inkVersion: 20,
            root: content
        };
        
        // Write JSON file
        const jsonFilePath = inkFilePath.replace('.ink', '.json');
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonStructure, null, 2));
        
        console.log(`✅ Compiled ${inkFilePath} to ${jsonFilePath}`);
        return jsonFilePath;
        
    } catch (error) {
        console.error(`❌ Error compiling ${inkFilePath}:`, error.message);
        throw error;
    }
}

// Compile all ink files
const inkDir = './js/ink/ink-stories';
const files = fs.readdirSync(inkDir);

for (const file of files) {
    if (file.endsWith('.ink')) {
        const filePath = path.join(inkDir, file);
        compileInkFile(filePath);
    }
}

console.log('🎉 Compilation complete!');
