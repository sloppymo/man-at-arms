#!/usr/bin/env node

// ============================================
// Ink Story Validation Script
// Automated validation of Ink stories for production readiness
// ============================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class InkStoryValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.storiesValidated = 0;
    this.storiesPath = path.join(__dirname, '../stories');
  }

  /**
   * Validate all Ink stories in the stories directory
   */
  async validateAllStories() {
    console.log('🔍 Starting Ink story validation...\n');

    try {
      const storyFiles = this.findStoryFiles(this.storiesPath);
      
      for (const filePath of storyFiles) {
        await this.validateStoryFile(filePath);
      }

      this.printValidationResults();
      process.exit(this.errors.length > 0 ? 1 : 0);
    } catch (error) {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    }
  }

  /**
   * Find all Ink story files
   */
  findStoryFiles(dir) {
    const files = [];
    
    const scanDir = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (item.endsWith('.ink')) {
          files.push(fullPath);
        }
      }
    };
    
    scanDir(dir);
    return files;
  }

  /**
   * Validate a single Ink story file
   */
  async validateStoryFile(filePath) {
    const relativePath = path.relative(this.storiesPath, filePath);
    console.log(`📖 Validating: ${relativePath}`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      this.validateSyntax(content, relativePath);
      this.validateStructure(lines, relativePath);
      this.validateTags(lines, relativePath);
      this.validateKnots(lines, relativePath);
      this.validateChoices(lines, relativePath);
      
      this.storiesValidated++;
    } catch (error) {
      this.addError(`Failed to read file: ${error.message}`, relativePath);
    }
  }

  /**
   * Validate basic Ink syntax
   */
  validateSyntax(content, filePath) {
    // Check for common syntax errors
    const syntaxChecks = [
      { pattern: /^=\s*==>/m, error: 'Invalid choice syntax, should be *' },
      { pattern: /->\s*$/, error: 'Incomplete divert, missing target' },
      { pattern: /\[\s*\]/, error: 'Empty condition brackets' },
      { pattern: /{.*}/, error: 'Invalid variable syntax, use {variable}' }
    ];

    syntaxChecks.forEach(check => {
      if (check.pattern.test(content)) {
        this.addError(check.error, filePath);
      }
    });
  }

  /**
   * Validate story structure
   */
  validateStructure(lines, filePath) {
    let hasKnot = false;
    let hasContent = false;
    let knotCount = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('=== ') || trimmed.startsWith('== ')) {
        hasKnot = true;
        knotCount++;
      }
      
      if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('===') && !trimmed.startsWith('==')) {
        hasContent = true;
      }
    }

    if (!hasKnot) {
      this.addError('Story has no knots (=== knot_name)', filePath);
    }

    if (!hasContent) {
      this.addWarning('Story appears to be empty', filePath);
    }

    if (knotCount > 50) {
      this.addWarning(`Story has ${knotCount} knots, consider splitting`, filePath);
    }
  }

  /**
   * Validate tag usage
   */
  validateTags(lines, filePath) {
    const tagPattern = /#\s*([a-zA-Z_][a-zA-Z0-9_:.-]*)/g;
    const foundTags = [];
    let tagCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const matches = line.match(tagPattern);
      
      if (matches) {
        tagCount += matches.length;
        matches.forEach(match => {
          const tag = match.replace(/#\s*/, '');
          foundTags.push({ tag, line: i + 1 });
        });
      }
    }

    // Validate tag formats
    foundTags.forEach(({ tag, line }) => {
      if (tag.includes(' ')) {
        this.addError(`Tag contains spaces: ${tag} (line ${line})`, filePath);
      }
      
      if (tag.length > 50) {
        this.addWarning(`Very long tag: ${tag} (line ${line})`, filePath);
      }
    });

    if (tagCount > 100) {
      this.addWarning(`Story has ${tagCount} tags, consider reducing`, filePath);
    }
  }

  /**
   * Validate knot definitions and references
   */
  validateKnots(lines, filePath) {
    const knotDefs = [];
    const knotRefs = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Find knot definitions
      if (line.startsWith('=== ')) {
        const knotName = line.substring(4).trim();
        knotDefs.push(knotName);
      }
      
      // Find knot references
      const refMatches = line.match(/->\s*([a-zA-Z_][a-zA-Z0-9_]*)/g);
      if (refMatches) {
        refMatches.forEach(match => {
          const refName = match.replace(/->\s*/, '');
          if (!refName.includes('DONE') && !refName.includes('END')) {
            knotRefs.push(refName);
          }
        });
      }
    }

    // Check for undefined references
    knotRefs.forEach(ref => {
      if (!knotDefs.includes(ref) && !knotDefs.includes(`${ref}_encounter`)) {
        this.addError(`Undefined knot reference: ${ref}`, filePath);
      }
    });

    // Check for unused knots
    knotDefs.forEach(def => {
      if (!knotRefs.includes(def) && def !== 'START' && def !== 'END' && def !== 'DONE') {
        this.addWarning(`Unused knot: ${def}`, filePath);
      }
    });
  }

  /**
   * Validate choice structure
   */
  validateChoices(lines, filePath) {
    let inChoice = false;
    let choiceDepth = 0;
    let choiceCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('* ')) {
        inChoice = true;
        choiceCount++;
        
        // Check choice content
        const choiceText = line.substring(2).trim();
        if (choiceText.length === 0) {
          this.addError(`Empty choice at line ${i + 1}`, filePath);
        }
        
        if (choiceText.length > 100) {
          this.addWarning(`Very long choice at line ${i + 1}: ${choiceText.substring(0, 50)}...`, filePath);
        }
      } else if (line && !line.startsWith('*') && !line.startsWith('//') && inChoice) {
        // Choice content continues
        if (choiceDepth === 0) {
          choiceDepth = 1;
        }
      } else if (line.startsWith('*') || line.startsWith('===') || line.startsWith('==')) {
        choiceDepth = 0;
        inChoice = false;
      }
    }

    if (choiceCount === 0) {
      this.addWarning('Story has no choices', filePath);
    }

    if (choiceCount > 20) {
      this.addWarning(`Story has ${choiceCount} choices, consider reducing`, filePath);
    }
  }

  /**
   * Add validation error
   */
  addError(message, filePath) {
    this.errors.push({ file: filePath, message, type: 'error' });
  }

  /**
   * Add validation warning
   */
  addWarning(message, filePath) {
    this.warnings.push({ file: filePath, message, type: 'warning' });
  }

  /**
   * Print validation results
   */
  printValidationResults() {
    console.log('\n📊 Validation Results:');
    console.log(`========================`);
    console.log(`Stories validated: ${this.storiesValidated}`);
    console.log(`Errors: ${this.errors.length}`);
    console.log(`Warnings: ${this.warnings.length}\n`);

    if (this.errors.length > 0) {
      console.log('❌ ERRORS FOUND:');
      this.errors.forEach(error => {
        console.log(`  📁 ${error.file}: ${error.message}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS:');
      this.warnings.forEach(warning => {
        console.log(`  📁 ${warning.file}: ${warning.message}`);
      });
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All stories passed validation!');
    } else {
      console.log('\n💡 Recommendations:');
      console.log('  - Fix all errors before production deployment');
      console.log('  - Review warnings for potential improvements');
      console.log('  - Consider adding more tags for better content control');
      console.log('  - Ensure all choices have meaningful content');
    }
  }
}

// Run validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new InkStoryValidator();
  validator.validateAllStories().catch(console.error);
}

export default InkStoryValidator;
