#!/usr/bin/env node
/**
 * Static Code Analysis for "A Man-at-Arms' Life"
 * 
 * This script analyzes the game code without running it in a browser.
 * It checks for common issues, verifies function definitions, and validates structure.
 * 
 * Usage:
 *   node static-analysis.js
 */

const fs = require('fs');
const path = require('path');

const gameFile = path.join(__dirname, 'man-at-arms.html');
const gameContent = fs.readFileSync(gameFile, 'utf8');

const issues = [];
const warnings = [];
const checks = [];

function addIssue(severity, category, description, location) {
    issues.push({ severity, category, description, location });
}

function addWarning(description, location) {
    warnings.push({ description, location });
}

function addCheck(name, passed, details = {}) {
    checks.push({ name, passed, details });
}

console.log('🔍 Starting static code analysis...\n');

// Check 1: Required functions exist
console.log('Checking required functions...');
const requiredFunctions = [
    'calculateBadOutcomeChance',
    'selectBadOutcome',
    'applyBadOutcome',
    'checkArbitraryDeath',
    'checkStressCapDisorders',
    'checkChapterTransition',
    'getChapterDeathModifier',
    'calculateArmorProtection',
    'makeChoice',
    'updateDisplay',
    'updateStatusBar',
    'updateStats'
];

requiredFunctions.forEach(funcName => {
    const regex = new RegExp(`function\\s+${funcName}\\s*\\(|const\\s+${funcName}\\s*=\\s*function|${funcName}\\s*:\\s*function`, 'i');
    if (regex.test(gameContent)) {
        addCheck(`Function exists: ${funcName}`, true);
    } else {
        addIssue('Critical', 'Code', `Required function missing: ${funcName}`, 'Function definitions');
        addCheck(`Function exists: ${funcName}`, false);
    }
});

// Check 2: Required constants exist
console.log('Checking required constants...');
const requiredConstants = [
    'ARBITRARY_DEATH_EVENTS',
    'PSYCHOLOGICAL_DISORDERS',
    'CHAPTERS',
    'PATRONS',
    'CAMPFIRE_VIGNETTES'
];

requiredConstants.forEach(constName => {
    // More flexible regex that handles multiline and different spacing
    const regex = new RegExp(`(const|var|let)\\s+${constName}\\s*[=:]`, 'i');
    if (regex.test(gameContent)) {
        addCheck(`Constant exists: ${constName}`, true);
    } else {
        addIssue('Critical', 'Data', `Required constant missing: ${constName}`, 'Constants');
        addCheck(`Constant exists: ${constName}`, false);
    }
});

// Check 3: Death events structure
console.log('Checking death events structure...');
const deathEventMatches = gameContent.match(/ARBITRARY_DEATH_EVENTS\s*[=:]\s*\[([\s\S]*?)\];/);
if (deathEventMatches) {
    const deathEventsContent = deathEventMatches[1];
    const expectedDeathIds = ['camp_fever', 'septic_wound', 'horse_fall', 'dysentery', 'pneumonia', 'plague', 'starvation'];
    
    expectedDeathIds.forEach(id => {
        if (deathEventsContent.includes(`id: '${id}'`) || deathEventsContent.includes(`id: "${id}"`)) {
            addCheck(`Death event exists: ${id}`, true);
        } else {
            addIssue('High', 'Data', `Missing death event: ${id}`, 'ARBITRARY_DEATH_EVENTS');
            addCheck(`Death event exists: ${id}`, false);
        }
    });
    
    // Check for baseChance property
    if (deathEventsContent.includes('baseChance')) {
        addCheck('Death events use baseChance', true);
    } else {
        addWarning('Death events may not use baseChance (chapter modifiers may not work)', 'ARBITRARY_DEATH_EVENTS');
    }
} else {
    addIssue('Critical', 'Data', 'ARBITRARY_DEATH_EVENTS array not found', 'Constants');
}

// Check 4: Chapter system structure
console.log('Checking chapter system...');
const chaptersMatch = gameContent.match(/(?:const|var|let)\s+CHAPTERS\s*[=:]\s*\{([\s\S]*?)\};/);
if (chaptersMatch) {
    const chaptersContent = chaptersMatch[1];
    const expectedChapters = ['chevauchée', 'calais', 'plague', 'poitiers'];
    
    expectedChapters.forEach(chapterId => {
        if (chaptersContent.includes(`id: "${chapterId}"`) || chaptersContent.includes(`id: '${chapterId}'`)) {
            addCheck(`Chapter defined: ${chapterId}`, true);
        } else {
            addIssue('High', 'Data', `Missing chapter: ${chapterId}`, 'CHAPTERS');
            addCheck(`Chapter defined: ${chapterId}`, false);
        }
    });
} else {
    addIssue('Critical', 'Data', 'CHAPTERS object not found', 'Constants');
}

// Check 5: Psychological disorders
console.log('Checking psychological disorders...');
const disordersMatch = gameContent.match(/(?:const|var|let)\s+PSYCHOLOGICAL_DISORDERS\s*[=:]\s*\[([\s\S]*?)\];/);
if (disordersMatch) {
    const disordersContent = disordersMatch[1];
    const expectedDisorders = ['nightmares', 'paranoia', 'rage', 'despair'];
    
    expectedDisorders.forEach(disorderId => {
        if (disordersContent.includes(`id: '${disorderId}'`) || disordersContent.includes(`id: "${disorderId}"`)) {
            addCheck(`Disorder defined: ${disorderId}`, true);
        } else {
            addIssue('High', 'Data', `Missing disorder: ${disorderId}`, 'PSYCHOLOGICAL_DISORDERS');
            addCheck(`Disorder defined: ${disorderId}`, false);
        }
    });
} else {
    addIssue('Critical', 'Data', 'PSYCHOLOGICAL_DISORDERS array not found', 'Constants');
}

// Check 6: makeChoice function handles bad outcomes
console.log('Checking makeChoice implementation...');
if (gameContent.includes('badOutcomeChance') && gameContent.includes('calculateBadOutcomeChance')) {
    addCheck('makeChoice handles bad outcomes', true);
} else {
    addIssue('Critical', 'Code', 'makeChoice may not handle bad outcomes', 'makeChoice function');
    addCheck('makeChoice handles bad outcomes', false);
}

// Check 7: Stress cost handling
if (gameContent.includes('stressCost') && gameContent.includes('applyStatChange(\'stress\'')) {
    addCheck('Stress cost system implemented', true);
} else {
    addIssue('High', 'Code', 'Stress cost may not be applied correctly', 'makeChoice function');
    addCheck('Stress cost system implemented', false);
}

// Check 8: Chapter transition in makeChoice
if (gameContent.includes('checkChapterTransition()')) {
    addCheck('Chapter transitions checked in makeChoice', true);
} else {
    addWarning('Chapter transitions may not be checked after scene changes', 'makeChoice function');
}

// Check 9: Death scene definitions
console.log('Checking death scenes...');
const deathScenes = ['death_camp_fever', 'death_sepsis', 'death_dysentery', 'death_pneumonia', 'death_plague', 'death_starvation', 'death_pitchfork'];
deathScenes.forEach(sceneId => {
    if (gameContent.includes(`${sceneId}:`)) {
        addCheck(`Death scene exists: ${sceneId}`, true);
    } else {
        addWarning(`Death scene may be missing: ${sceneId}`, 'Scenes object');
    }
});

// Check 10: Update functions hide UI on character creation
console.log('Checking UI hiding on character creation...');
if (gameContent.includes('currentScene === \'character_creation\'') && 
    gameContent.includes('style.display = \'none\'')) {
    addCheck('UI hiding on character creation implemented', true);
} else {
    addIssue('Medium', 'UI', 'UI elements may not be hidden on character creation', 'updateStatusBar/updateStats');
    addCheck('UI hiding on character creation implemented', false);
}

// Check 11: Save/Load includes new fields
console.log('Checking save/load system...');
const newFields = ['chapter', 'chapterProgress', 'relationships', 'campfire', 'patronId'];
newFields.forEach(field => {
    if (gameContent.includes(field)) {
        addCheck(`New field present: ${field}`, true);
    } else {
        addWarning(`New field may be missing: ${field}`, 'Game state');
    }
});

// Check 12: Campfire vignettes
console.log('Checking campfire vignettes...');
const vignettesMatch = gameContent.match(/(?:const|var|let)\s+CAMPFIRE_VIGNETTES\s*[=:]\s*\[([\s\S]*?)\];/);
if (vignettesMatch) {
    const vignettesContent = vignettesMatch[1];
    // Count vignettes (rough estimate by counting id:)
    const vignetteCount = (vignettesContent.match(/id:\s*["']/g) || []).length;
    if (vignetteCount >= 20) {
        addCheck(`Campfire vignettes defined (${vignetteCount} found)`, true);
    } else {
        addWarning(`Expected ~24 vignettes, found ${vignetteCount}`, 'CAMPFIRE_VIGNETTES');
    }
} else {
    addIssue('High', 'Data', 'CAMPFIRE_VIGNETTES array not found', 'Constants');
}

// Check 13: Patron definitions
console.log('Checking patron definitions...');
const patronsMatch = gameContent.match(/(?:const|var|let)\s+PATRONS\s*[=:]\s*\{([\s\S]*?)\};/);
if (patronsMatch) {
    const patronsContent = patronsMatch[1];
    const expectedPatrons = ['james_olooney', 'lord_david', 'duke_caley', 'count_charles', 'ashkhan'];
    
    expectedPatrons.forEach(patronId => {
        if (patronsContent.includes(`${patronId}:`)) {
            addCheck(`Patron defined: ${patronId}`, true);
            
            // Check for required properties
            const patronBlock = patronsContent.match(new RegExp(`${patronId}:\\s*\\{([\\s\\S]*?)\\}(?=\\s*[,\\}])`));
            if (patronBlock) {
                const patronProps = patronBlock[1];
                if (patronProps.includes('statMods') && patronProps.includes('kitTier') && patronProps.includes('eventPath')) {
                    addCheck(`Patron ${patronId} has required properties`, true);
                } else {
                    addWarning(`Patron ${patronId} may be missing required properties`, 'PATRONS');
                }
            }
        } else {
            addIssue('High', 'Data', `Missing patron: ${patronId}`, 'PATRONS');
            addCheck(`Patron defined: ${patronId}`, false);
        }
    });
} else {
    addIssue('Critical', 'Data', 'PATRONS object not found', 'Constants');
}

// Check 14: Example choices with bad outcomes
console.log('Checking example choices with bad outcomes...');
const exampleChoices = [
    { text: 'Dig proper latrines', hasBadOutcome: true, stressCost: true },
    { text: 'Skim from supply wagons', hasBadOutcome: true, stressCost: false }
];

exampleChoices.forEach(example => {
    if (gameContent.includes(example.text)) {
        const choiceBlock = gameContent.match(new RegExp(`${example.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]{0,500}`, 'i'));
        if (choiceBlock) {
            const choiceContent = choiceBlock[0];
            if (example.hasBadOutcome && choiceContent.includes('badOutcomeChance')) {
                addCheck(`Example choice "${example.text}" has bad outcomes`, true);
            } else if (example.hasBadOutcome) {
                addWarning(`Example choice "${example.text}" may be missing bad outcomes`, 'Choices');
            }
            
            if (example.stressCost && choiceContent.includes('stressCost')) {
                addCheck(`Example choice "${example.text}" has stress cost`, true);
            }
        }
    }
});

// Generate report
console.log('\n' + '='.repeat(80));
console.log('STATIC ANALYSIS REPORT');
console.log('='.repeat(80));

console.log(`\n✅ Checks Passed: ${checks.filter(c => c.passed).length}/${checks.length}`);
console.log(`❌ Issues Found: ${issues.length}`);
console.log(`⚠️  Warnings: ${warnings.length}`);

if (issues.length > 0) {
    console.log('\n❌ ISSUES:');
    issues.forEach((issue, i) => {
        console.log(`\n${i + 1}. [${issue.severity.toUpperCase()}] ${issue.description}`);
        console.log(`   Category: ${issue.category}`);
        console.log(`   Location: ${issue.location}`);
    });
}

if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach((warning, i) => {
        console.log(`\n${i + 1}. ${warning.description}`);
        console.log(`   Location: ${warning.location}`);
    });
}

console.log('\n' + '='.repeat(80));
console.log('Analysis complete!');
console.log('='.repeat(80));

// Save report
const report = {
    timestamp: new Date().toISOString(),
    checks: checks,
    issues: issues,
    warnings: warnings,
    summary: {
        totalChecks: checks.length,
        passed: checks.filter(c => c.passed).length,
        failed: checks.filter(c => !c.passed).length,
        issues: issues.length,
        warnings: warnings.length
    }
};

fs.writeFileSync(
    path.join(__dirname, 'static-analysis-report.json'),
    JSON.stringify(report, null, 2)
);

console.log('\n📄 Report saved to: static-analysis-report.json');

// Exit with error code if critical issues found
const criticalIssues = issues.filter(i => i.severity === 'Critical').length;
process.exit(criticalIssues > 0 ? 1 : 0);
