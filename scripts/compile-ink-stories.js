#!/usr/bin/env node
// Proper Ink compiler using inkjs to create valid JSON bytecode

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Story } from 'inkjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function compileInkFile(inkFilePath, outputPath) {
    try {
        console.log(`📖 Reading ${inkFilePath}...`);
        const inkContent = fs.readFileSync(inkFilePath, 'utf8');
        
        // Create a Story object to compile the ink content
        const story = new Story(inkContent);
        
        // Get the compiled JSON
        const compiledJson = story.toJson();
        
        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Write compiled JSON
        fs.writeFileSync(outputPath, JSON.stringify(compiledJson, null, 2));
        
        console.log(`✅ Compiled ${path.basename(inkFilePath)} -> ${path.relative(projectRoot, outputPath)}`);
        
        // Verify the story has content
        const testStory = new Story(compiledJson);
        const canContinue = testStory.canContinue;
        const choicesCount = testStory.currentChoices.length;
        
        console.log(`   📊 Story verification: canContinue=${canContinue}, choices=${choicesCount}`);
        
        if (!canContinue && choicesCount === 0) {
            console.warn(`   ⚠️  Warning: Story appears to have no playable content`);
        }
        
        return outputPath;
        
    } catch (error) {
        console.error(`❌ Error compiling ${inkFilePath}:`, error.message);
        throw error;
    }
}

function findInkFiles(dir) {
    const files = [];
    
    function traverse(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                traverse(fullPath);
            } else if (item.endsWith('.ink')) {
                files.push(fullPath);
            }
        }
    }
    
    traverse(dir);
    return files;
}

function main() {
    console.log('🔨 Compiling Ink stories to JSON bytecode...\n');
    
    const storiesDir = path.join(projectRoot, 'stories');
    const outputDir = path.join(projectRoot, 'public/js/ink/ink-stories');
    
    if (!fs.existsSync(storiesDir)) {
        console.error(`❌ Stories directory not found: ${storiesDir}`);
        process.exit(1);
    }
    
    const inkFiles = findInkFiles(storiesDir);
    
    if (inkFiles.length === 0) {
        console.log('No .ink files found in stories directory');
        return;
    }
    
    console.log(`Found ${inkFiles.length} .ink files to compile:\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const inkFile of inkFiles) {
        try {
            // Calculate relative path to maintain directory structure
            const relativePath = path.relative(storiesDir, inkFile);
            const outputPath = path.join(outputDir, relativePath.replace('.ink', '.json'));
            
            compileInkFile(inkFile, outputPath);
            successCount++;
            
        } catch (error) {
            console.error(`Failed to compile ${inkFile}:`, error.message);
            errorCount++;
        }
    }
    
    console.log(`\n📈 Compilation complete: ${successCount} succeeded, ${errorCount} failed`);
    
    if (errorCount > 0) {
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { compileInkFile, findInkFiles };
