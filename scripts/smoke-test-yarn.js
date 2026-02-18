#!/usr/bin/env node
// ============================================
// Active Yarn Story Smoke Test Harness
// Validates runtime-referenced stories against parser shape contracts
// ============================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const ENCOUNTER_SERVICE_PATH = path.join(projectRoot, 'src/systems/encounter-service.js');
const NARRATIVE_SERVICE_PATH = path.join(projectRoot, 'src/narrative/narrative-service.js');
const OVERWORLD_SCENE_PATH = path.join(projectRoot, 'src/phaser/OverworldScene.js');
const SKIPLIST_PATH = path.join(projectRoot, 'scripts/smoke-story-skiplist.json');

const SHAPE_CONTRACTS = [
  { id: 'title header', test: (text) => /^title:\s*.+$/m.test(text) },
  { id: 'node separator', test: (text) => /^---$/m.test(text) },
  { id: 'start node', test: (text) => /^==\s+start\b/m.test(text) },
  { id: 'story terminator', test: (text) => /^===$/m.test(text) }
];

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function extractValuesFromObjectBlocks(text, objectRegex) {
  const values = new Set();
  let blockMatch;

  while ((blockMatch = objectRegex.exec(text)) !== null) {
    const block = blockMatch[1];
    const entryPattern = /'[^']+'\s*:\s*'([^']+)'/g;
    let entryMatch;
    while ((entryMatch = entryPattern.exec(block)) !== null) {
      values.add(entryMatch[1]);
    }
  }

  return values;
}

function extractEncounterStories(filePath) {
  const text = readText(filePath);
  return extractValuesFromObjectBlocks(
    text,
    /const\s+ENCOUNTER_STORIES\s*=\s*\{([\s\S]*?)\};/g
  );
}

function extractNarrativeStories(filePath) {
  const text = readText(filePath);
  return extractValuesFromObjectBlocks(
    text,
    /const\s+storyMap\s*=\s*\{([\s\S]*?)\};/g
  );
}

function extractDialogStories(filePath) {
  const text = readText(filePath);
  const storyValues = new Set();
  const dialogIdPattern = /dialogId:\s*'([^']+)'/g;
  let match;

  while ((match = dialogIdPattern.exec(text)) !== null) {
    storyValues.add(`overworld/${match[1]}`);
  }

  return storyValues;
}

function loadSkiplist() {
  if (!fs.existsSync(SKIPLIST_PATH)) {
    return {};
  }
  const raw = readText(SKIPLIST_PATH);
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Skiplist must be a JSON object keyed by story id.');
  }
  return parsed;
}

function getActiveStoryIds() {
  const active = new Set();

  for (const story of extractEncounterStories(ENCOUNTER_SERVICE_PATH)) {
    active.add(story);
  }
  for (const story of extractNarrativeStories(NARRATIVE_SERVICE_PATH)) {
    active.add(story);
  }
  for (const story of extractDialogStories(OVERWORLD_SCENE_PATH)) {
    active.add(story);
  }

  return [...active].sort();
}

function validateStoryShape(storyId, storyPath) {
  if (!fs.existsSync(storyPath)) {
    return [`missing file: stories-yarn/${storyId}.yarn`];
  }

  const text = readText(storyPath);
  const failures = [];
  for (const contract of SHAPE_CONTRACTS) {
    if (!contract.test(text)) {
      failures.push(`missing ${contract.id}`);
    }
  }
  return failures;
}

class ActiveStorySmokeTester {
  constructor() {
    this.activeStories = getActiveStoryIds();
    this.skiplist = loadSkiplist();
    this.results = {
      total: this.activeStories.length,
      passed: 0,
      failed: 0,
      skipped: 0,
      failures: []
    };
  }

  async runAllTests() {
    console.log('🧪 Running active-story Yarn smoke tests...\n');
    console.log(`Discovered ${this.activeStories.length} active story IDs.`);

    for (const storyId of this.activeStories) {
      const skipReason = this.skiplist[storyId];
      if (skipReason) {
        console.log(`⏭️  ${storyId} (skipped: ${skipReason})`);
        this.results.skipped++;
        continue;
      }

      const storyPath = path.join(projectRoot, 'stories-yarn', `${storyId}.yarn`);
      console.log(`📖 ${storyId}`);
      try {
        const failures = validateStoryShape(storyId, storyPath);
        if (failures.length > 0) {
          this.results.failed++;
          this.results.failures.push({ storyId, failures });
          console.log(`❌ ${storyId} failed`);
          for (const failure of failures) {
            console.log(`   - ${failure}`);
          }
          continue;
        }
        this.results.passed++;
        console.log(`✅ ${storyId} passed`);
      } catch (error) {
        this.results.failed++;
        this.results.failures.push({
          storyId,
          failures: [error.message]
        });
        console.log(`💥 ${storyId} crashed: ${error.message}`);
      }
    }

    this.printSummary();
    return this.results.failed === 0;
  }

  printSummary() {
    console.log('\n📊 Smoke Test Results:');
    console.log(`Total active stories: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Skipped: ${this.results.skipped}`);
    console.log(`Failed: ${this.results.failed}`);

    if (this.results.failures.length > 0) {
      console.log('\n💥 Failures:');
      this.results.failures.forEach(({ storyId, failures }) => {
        console.log(`  ${storyId}`);
        for (const failure of failures) {
          console.log(`    - ${failure}`);
        }
      });
    }

    const success = this.results.failed === 0;
    console.log(`\n${success ? '🎉 Active story smoke tests passed!' : '⚠️  Active story smoke tests failed'}`);
  }
}

// Export for testing
export { ActiveStorySmokeTester };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new ActiveStorySmokeTester();
  const success = await tester.runAllTests();
  process.exit(success ? 0 : 1);
}
