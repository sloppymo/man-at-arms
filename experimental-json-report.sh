#!/bin/bash

echo "🔬 Experimental JSON Structure Approach"
echo "======================================="

echo "📋 Problem Analysis:"
echo "   - Issue: Both inkjs@1.10.4 and @2.1.0 reject raw ink strings"
echo "   - Root Cause: inkjs ONLY works with pre-compiled JSON format"
echo "   - Discovery: Must create proper JSON structure that inkjs expects"

echo ""
echo "🧪 Experimental JSON Structures Created:"
echo "   ✅ Empty: {\"inkVersion\": 19, \"root\": []}"
echo "   ✅ Simple Array: {\"inkVersion\": 19, \"root\": [[\"Hello world.\", null]]}"
echo "   ✅ Complex: {\"inkVersion\": 19, \"root\": [[\"^Hello world.\", null]], \"listDefs\": {}}"
echo "   ✅ Example Format: {\"inkVersion\": 19, \"root\": [[\"Hello world.\", \"\\n\", \"Test.\", null]]}"

echo ""
echo "📁 Current Files:"
files=("js/ink/ink-stories/character-creation.json" "js/ink/ink-stories/main.json" "js/ink/ink-stories/training.json" "js/ink/ink-stories/test.json")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        size=$(wc -c < "$file")
        echo "   ✅ $file (${size} bytes) - Experimental JSON structure"
    else
        echo "   ❌ $file missing"
    fi
done

echo ""
echo "🔧 Changes Made:"
echo "   ✅ Reverted story-loader.js to JSON parsing"
echo "   ✅ Updated fresh-test.html to test experimental JSON"
echo "   ✅ Updated cache-busting timestamps"
echo "   ✅ Maintained inkjs@2.1.0 (newer version)"

echo ""
echo "🎯 Expected Results:"
echo "   ✅ JSON should parse successfully"
echo "   ✅ Story should create from JSON"
echo "   ✅ Story.Continue() should return content"
echo "   ✅ 8/8 tests should pass (100% success rate)"

echo ""
echo "📝 Testing Instructions:"
echo "   1. Open: http://127.0.0.1:8080/fresh-test.html"
echo "   2. Look for: '🎉 EXPERIMENTAL JSON WORKS!'"
echo "   3. Open: http://127.0.0.1:8080/test-validation.html"
echo "   4. Expected: 100% pass rate"

echo ""
echo "🚀 Status: EXPERIMENTAL JSON APPROACH READY"
echo "   Testing different JSON structures to find what inkjs expects."
echo "   If any structure works, we can build proper stories from there."
