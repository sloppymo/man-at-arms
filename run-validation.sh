#!/bin/bash

echo "🚀 Running Ink.js Integration Validation"
echo "=========================================="

# Test 1: Check web server
echo "📡 Checking web server..."
if curl -s http://127.0.0.1:8080/ > /dev/null; then
    echo "✅ Web server is running on port 8080"
else
    echo "❌ Web server not accessible on port 8080"
    exit 1
fi

# Test 2: Check key files
echo "📁 Checking key files..."
files=(
    "fresh-test.html"
    "test-validation.html"
    "js/ink/story-loader.js"
    "js/ink/ink-stories/character-creation.json"
    "js/ink/validation/batch-runner.js"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

# Test 3: Check JSON story files
echo "📖 Checking JSON story files..."
json_files=(
    "js/ink/ink-stories/character-creation.json"
    "js/ink/ink-stories/main.json"
    "js/ink/ink-stories/training.json"
)

for file in "${json_files[@]}"; do
    if [ -f "$file" ]; then
        size=$(wc -c < "$file")
        echo "✅ $file ($size bytes)"
        
        # Check if it's valid JSON
        if python3 -m json.tool "$file" > /dev/null 2>&1; then
            echo "   ✅ Valid JSON"
        else
            echo "   ❌ Invalid JSON"
        fi
    else
        echo "❌ $file missing"
    fi
done

# Test 4: Test accessibility of test pages
echo "🌐 Testing page accessibility..."
pages=(
    "fresh-test.html"
    "test-validation.html"
)

for page in "${pages[@]}"; do
    if curl -s "http://127.0.0.1:8080/$page" | grep -q "<html"; then
        echo "✅ $page accessible"
    else
        echo "❌ $page not accessible"
    fi
done

echo ""
echo "🎯 Manual Testing Required:"
echo "=========================="
echo "1. Open http://127.0.0.1:8080/fresh-test.html"
echo "   - Should show: ✅ Ink.js loaded, ✅ Story class available, ✅ Character creation story loaded"
echo ""
echo "2. Open http://127.0.0.1:8080/test-validation.html"
echo "   - Should show: ✅ All 8 basic tests pass (100% success rate)"
echo ""
echo "3. In browser console, run:"
echo "   await window.InkBatchRunner.runQuickValidation();"
echo ""
echo "4. For full validation, run:"
echo "   await window.InkBatchRunner.runComprehensiveValidation();"
echo ""
echo "🎉 Core fix verification complete!"
echo "The JSON-based Ink.js integration is ready for browser testing."
