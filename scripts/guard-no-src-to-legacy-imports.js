#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const srcRoot = path.join(projectRoot, 'src');
const legacyRoot = path.join(projectRoot, 'js');

const IMPORT_PATTERN = /\bimport\s+(?:[^'"]*from\s+)?['"]([^'"]+)['"]|\bimport\(\s*['"]([^'"]+)['"]\s*\)|\brequire\(\s*['"]([^'"]+)['"]\s*\)/g;

function getSourceFiles(rootDir) {
  const files = [];

  function walk(currentDir) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (/\.(js|mjs|cjs)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  if (fs.existsSync(rootDir)) {
    walk(rootDir);
  }
  return files.sort();
}

function isLegacyImport(specifier, importingFile) {
  if (!specifier) return false;

  if (specifier.startsWith('/js/') || specifier === 'js' || specifier.startsWith('js/')) {
    return true;
  }

  if (specifier.startsWith('.')) {
    const resolved = path.resolve(path.dirname(importingFile), specifier);
    return resolved.startsWith(legacyRoot + path.sep) || resolved === legacyRoot;
  }

  return false;
}

function findViolations() {
  const violations = [];
  const files = getSourceFiles(srcRoot);

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    let match;

    while ((match = IMPORT_PATTERN.exec(text)) !== null) {
      const specifier = match[1] || match[2] || match[3];
      if (isLegacyImport(specifier, file)) {
        violations.push({
          file: path.relative(projectRoot, file),
          specifier
        });
      }
    }
  }

  return violations;
}

const violations = findViolations();

if (violations.length > 0) {
  console.error('Legacy boundary violation(s) detected: src/ cannot import from js/.');
  for (const violation of violations) {
    console.error(`- ${violation.file}: "${violation.specifier}"`);
  }
  process.exit(1);
}

console.log('Legacy boundary check passed: no src/ imports from js/.');
