# Playtesting Guide for "A Man-at-Arms' Life"

This directory contains automated playtesting tools for the game.

## Available Tools

### 1. Static Code Analysis (`static-analysis.js`)
**What it does:** Analyzes the game code without running it in a browser. Checks for:
- Required functions and constants
- Code structure and patterns
- Missing implementations
- Data structure validation

**Usage:**
```bash
node static-analysis.js
```

**Output:** `static-analysis-report.json` with detailed findings

**Status:** ✅ **PASSING** - All 58 checks passed, 0 critical issues

---

### 2. Automated Browser Playtesting (`playtest.js`)
**What it does:** Uses Puppeteer to automate browser testing. Tests:
- Character creation flow
- Quick Start functionality
- UI element visibility
- Save/Load system
- Core mechanics (bad outcomes, stress, chapters, death events)

**Setup:**
```bash
npm install
```

**Usage:**
```bash
node playtest.js
# or
npm test
```

**Output:** 
- Console output with real-time results
- `playtest-report.json` with detailed test report

**Note:** Requires Node.js and Puppeteer (includes Chromium)

---

### 3. GPT 5.2 Playtesting Prompt (`GPT_5.2_PLAYTEST_PROMPT.md`)
**What it is:** Comprehensive prompt for an autonomous AI agent to playtest the game.

**Usage:** Copy the prompt and provide it to a GPT 5.2 model with browser automation capabilities.

**Coverage:**
- All core mechanics
- 10 detailed test cases
- Bug reporting format
- Success metrics

---

## Quick Start

### Run Static Analysis (Fast, No Setup)
```bash
node static-analysis.js
```

### Run Browser Playtesting (Requires Setup)
```bash
npm install
node playtest.js
```

---

## Test Results Summary

### Static Analysis Results
- ✅ **58/58 checks passed**
- ❌ **0 critical issues**
- ⚠️ **5 warnings** (false positives - patron property detection)

### What Was Tested
1. ✅ All required functions exist
2. ✅ All required constants exist
3. ✅ Death events structure correct
4. ✅ Chapter system implemented
5. ✅ Psychological disorders defined
6. ✅ Bad outcome system functions exist
7. ✅ Death scenes defined
8. ✅ UI hiding on character creation
9. ✅ Save/Load includes new fields
10. ✅ Campfire vignettes defined (24 found)
11. ✅ All 5 patrons defined with required properties

---

## Known Limitations

1. **Browser Playtesting:**
   - Requires manual interaction for some character creation steps
   - Cannot test visual appearance
   - Limited combat testing

2. **Static Analysis:**
   - Cannot test runtime behavior
   - Cannot verify game logic flow
   - Some false positives (patron property detection)

---

## Next Steps

1. **Run Browser Playtesting:**
   - Install dependencies: `npm install`
   - Run: `node playtest.js`
   - Review `playtest-report.json`

2. **Use GPT 5.2 Prompt:**
   - Copy `GPT_5.2_PLAYTEST_PROMPT.md`
   - Provide to GPT 5.2 with browser automation
   - Review generated test report

3. **Manual Testing:**
   - Follow `TESTING_SUMMARY.md` checklist
   - Document any bugs found
   - Test edge cases and unusual scenarios

---

## Files Created

- `playtest.js` - Automated browser playtesting script
- `static-analysis.js` - Static code analysis script
- `package.json` - Node.js dependencies
- `README_PLAYTEST.md` - Detailed playtesting documentation
- `GPT_5.2_PLAYTEST_PROMPT.md` - Comprehensive AI agent prompt
- `PLAYTESTING_GUIDE.md` - This file

---

## Recommendations

1. **Run static analysis regularly** - Fast, catches structural issues
2. **Run browser playtesting before releases** - Catches runtime bugs
3. **Use GPT 5.2 prompt for comprehensive testing** - Best for thorough coverage
4. **Combine all three approaches** - Maximum coverage

---

**Last Updated:** 2025-01-30  
**Game Version:** 1.3.0+
