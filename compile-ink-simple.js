// Manual Ink compiler that wraps .ink source for inkjs runtime
// This creates a compatible JSON structure that inkjs@1.10.4 can parse

const fs = require('fs');
const path = require('path');

function compileInkFile(inkFilePath) {
    try {
        const inkContent = fs.readFileSync(inkFilePath, 'utf8');
        console.log(`Compiling ${inkFilePath}...`);
        
        // Create inkjs-compatible structure
        // The runtime expects the raw ink as the first element of root array
        const compiled = {
            inkVersion: 19,
            root: [
                [inkContent, null]  // Raw ink text as first element
            ],
            listDefs: {}
        };
        
        const jsonFilePath = inkFilePath.replace('.ink', '.json');
        fs.writeFileSync(jsonFilePath, JSON.stringify(compiled, null, 2));
        
        console.log(`✅ Compiled to ${jsonFilePath}`);
        return jsonFilePath;
        
    } catch (error) {
        console.error(`❌ Error compiling ${inkFilePath}:`, error.message);
        throw error;
    }
}

// Compile all .ink files in the directory
const inkDir = './js/ink/ink-stories';
const files = fs.readdirSync(inkDir);

for (const file of files) {
    if (file.endsWith('.ink') && !file.includes('fixed')) {
        const filePath = path.join(inkDir, file);
        compileInkFile(filePath);
    }
}

console.log('🎉 Compilation complete!');
