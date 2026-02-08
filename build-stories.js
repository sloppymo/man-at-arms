#!/usr/bin/env node

/**
 * Ink Story Compiler - Node-only version
 * Compiles .ink files from stories/ to .json in public/stories/
 * Handles basic Ink syntax: text and {external()} calls
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORIES_DIR = 'stories';
const OUTPUT_DIR = 'public/stories';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Template for compiled JSON structure
function createStoryJSON(content) {
  return {
    inkVersion: 19,
    root: [
      [
        content,
        null
      ]
    ],
    listDefs: {}
  };
}

// Process a single .ink file
function compileStory(inkPath, jsonPath) {
  try {
    const inkContent = fs.readFileSync(inkPath, 'utf8');

    // Try to use inklecate if available
    try {
      console.log(`Compiling with inklecate: ${inkPath}`);
      execSync(`inklecate -o "${jsonPath}" "${inkPath}"`, { stdio: 'inherit' });
      console.log(`✅ Compiled with inklecate: ${inkPath} -> ${jsonPath}`);
      return true;
    } catch (inklecateError) {
      // Fallback: basic processing (dev-only, warn loudly)
      console.warn('⚠️  WARNING: Using fallback Ink processing. Install inklecate for proper compilation!');
      console.warn('⚠️  Hand-structured Ink JSON is fragile and may break as stories grow.');
      console.warn('⚠️  Install: npm install -g inklecate (or download from https://github.com/inkle/ink/releases)');
      console.warn('Falling back to basic processing...');
    }

    // Fallback: basic processing
    console.log(`Compiling with custom processor: ${inkPath}`);

    // Basic processing: remove knot declarations, keep text and externals
    let processedContent = inkContent
      .replace(/^== .+$/gm, '') // Remove knot lines
      .replace(/^\s*-> END\s*$/gm, '') // Remove end diverts
      .trim();

    // Ensure content has basic structure
    if (!processedContent) {
      processedContent = 'Story content not found.';
    }

    const storyJSON = createStoryJSON(processedContent);
    fs.writeFileSync(jsonPath, JSON.stringify(storyJSON, null, 2));

    console.log(`✅ Compiled with custom processor: ${inkPath} -> ${jsonPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to compile ${inkPath}:`, error.message);
    return false;
  }
}

// Find and compile all .ink files
function buildAllStories() {
  const storiesDir = path.resolve(STORIES_DIR);

  if (!fs.existsSync(storiesDir)) {
    console.error(`Stories directory not found: ${storiesDir}`);
    return;
  }

  const inkFiles = [];

  // Recursively find .ink files
  function findInkFiles(dir, relativePath = '') {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relPath = path.join(relativePath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        findInkFiles(fullPath, relPath);
      } else if (item.endsWith('.ink')) {
        inkFiles.push({
          inkPath: fullPath,
          relPath: relPath.replace('.ink', '.json'),
          outputPath: path.join(OUTPUT_DIR, relPath.replace('.ink', '.json'))
        });
      }
    }
  }

  findInkFiles(storiesDir);

  if (inkFiles.length === 0) {
    console.log('No .ink files found in stories/ directory');
    return;
  }

  console.log(`Found ${inkFiles.length} .ink file(s). Compiling...`);

  let successCount = 0;
  for (const file of inkFiles) {
    // Ensure output subdirectory exists
    const outputDir = path.dirname(file.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    if (compileStory(file.inkPath, file.outputPath)) {
      successCount++;
    }
  }

  console.log(`Compilation complete: ${successCount}/${inkFiles.length} files successful`);
}

// Run the build
buildAllStories();

export { buildAllStories, compileStory, createStoryJSON };
