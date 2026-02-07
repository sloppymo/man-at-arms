# Phase 0: Baseline Validation Instructions

## Current Status
✅ Phase 0 setup complete - validation infrastructure in place
⏳ Awaiting manual validation in browser

## Instructions for Manual Validation

1. **Open the game in browser:**
   - Server running at: http://localhost:8001
   - Or open index.html directly

2. **Run smoke tests:**
   - Open browser console (F12)
   - Type: `smokeSuite.run()`
   - Copy results to tests/baseline-results.json

3. **Run comprehensive validation:**
   - In console: `InkBatchRunner.runComprehensiveValidation()`
   - Document any failures in baseline results

4. **Manual gameplay test:**
   - Start new game
   - Complete character creation
   - Test first scene transition
   - Save game, then load game
   - Verify state preserved

5. **Check console for errors:**
   - Look for red error messages on page load
   - Test all UI buttons work
   - Verify equipment screen opens/closes

## Expected Results

- All smoke tests should pass (8/8)
- No console errors on page load
- Character creation flows correctly
- Save/load round-trip preserves all data
- Equipment UI functions properly

## Files Created/Modified

- ✅ tests/baseline-results.json (template)
- ✅ tests/smoke-suite.js (smoke test runner)
- ✅ package.json (updated for Phase 0)
- ✅ index.html (added smoke suite script)

## Next Steps

After manual validation complete:
1. Update baseline-results.json with actual results
2. Commit changes as "PHASE0-BASELINE"
3. Tag with git tag PHASE0
4. Proceed to Phase 1: Vite Scaffolding
