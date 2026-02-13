import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { NarrativeService } from '../../src/narrative/narrative-service.js';
import { createMockDispatcher } from '../mocks/dispatcher.js';
import { createFakeGameState } from '../mocks/game-state.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Get all real Yarn story files
function getAllYarnFiles() {
  const storyDirs = [
    path.join(projectRoot, 'stories'),
    path.join(projectRoot, 'stories-yarn')
  ];
  
  const allFiles = [];
  
  for (const dir of storyDirs) {
    if (fs.existsSync(dir)) {
      const files = walkDirectory(dir);
      allFiles.push(...files);
    }
  }
  
  return allFiles;
}

function walkDirectory(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.yarn')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Mock story modules for testing real files
function createMockStoryModules(yarnFiles) {
  const modules = {};
  
  yarnFiles.forEach(filePath => {
    const relativePath = path.relative(projectRoot, filePath);
    const mockPath = `../../stories/${relativePath}`;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      modules[mockPath] = () => Promise.resolve(content);
    } catch (error) {
      console.warn(`Failed to read ${filePath}:`, error.message);
    }
  });
  
  return modules;
}

describe('Smoke Test All Yarn Stories', () => {
  let yarnFiles, mockStoryModules;
  
  beforeAll(() => {
    yarnFiles = getAllYarnFiles();
    mockStoryModules = createMockStoryModules(yarnFiles);
    
    // Mock import.meta.glob
    global.import = {
      meta: {
        glob: () => mockStoryModules
      }
    };
  });
  
  test('yarn files directory exists and has files', () => {
    expect(yarnFiles.length).toBeGreaterThan(0);
    console.log(`Found ${yarnFiles.length} Yarn files to test`);
  });
  
  yarnFiles.forEach(filePath => {
    const relativePath = path.relative(projectRoot, filePath);
    const storyName = relativePath.replace('.yarn', '').replace(/\\/g, '/');
    
    test(`${relativePath} loads without error`, async () => {
      const dispatcher = createMockDispatcher();
      const gameState = createFakeGameState();
      const service = new NarrativeService(dispatcher, gameState);
      service.storyModules = mockStoryModules;
      
      const result = await service.switchStory(storyName);
      expect(result).toBe(true);
      
      // Should have initialized runner
      expect(service.runner).toBeDefined();
      expect(service.currentStory).toBe(storyName);
    });
    
    test(`${relativePath} has valid Yarn syntax`, () => {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Basic Yarn syntax validation
      expect(content).toContain('title:');
      expect(content).toContain('---');
      expect(content).toContain('===');
      
      // Should not have obvious syntax errors
      expect(content).not.toContain('<<>>'); // Empty command
      expect(content).not.toContain('<<if>>'); // Empty if
    });
    
    test(`${relativePath} can create YarnBound runner`, async () => {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Test that YarnBound can parse the file
      const YarnBound = (await import('yarn-bound')).default;
      
      expect(() => {
        new YarnBound({
          dialogue: content,
          startAt: 'Start',
          handleCommand: () => {},
          variableStorage: { get: () => 0, set: () => {} },
          combineTextAndOptionsResults: true
        });
      }).not.toThrow();
    });
    
    test(`${relativePath} has reachable content`, async () => {
      const content = fs.readFileSync(filePath, 'utf8');
      const YarnBound = (await import('yarn-bound')).default;
      
      const runner = new YarnBound({
        dialogue: content,
        startAt: 'Start',
        handleCommand: () => {},
        variableStorage: { get: () => 0, set: () => {} },
        combineTextAndOptionsResults: true
      });
      
      // Should have initial result
      expect(runner.currentResult).toBeDefined();
      
      // Should be able to advance at least once
      expect(() => runner.advance()).not.toThrow();
    });
  });
  
  test('all story files have unique names', () => {
    const storyNames = yarnFiles.map(file => 
      path.basename(file, '.yarn')
    );
    
    const uniqueNames = new Set(storyNames);
    expect(uniqueNames.size).toBe(storyNames.length);
  });
  
  test('no story files are empty', () => {
    yarnFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content.trim().length).toBeGreaterThan(0);
    });
  });
  
  test('all story files use .yarn extension', () => {
    yarnFiles.forEach(filePath => {
      expect(path.extname(filePath)).toBe('.yarn');
    });
  });
  
  test('story files are in expected directories', () => {
    const allowedDirs = ['stories', 'stories-yarn'];
    
    yarnFiles.forEach(filePath => {
      const relativePath = path.relative(projectRoot, filePath);
      const firstDir = relativePath.split(path.sep)[0];
      
      expect(allowedDirs).toContain(firstDir);
    });
  });
});
