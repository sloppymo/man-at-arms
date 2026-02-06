// Debug test to isolate the JSON.parse issue
console.log('🔍 Debugging JSON.parse issue...');

// Test 1: Try creating story with empty string
try {
    const emptyStory = new inkjs.Story("");
    console.log('✅ Empty string works');
} catch (error) {
    console.log('❌ Empty string failed:', error.message);
}

// Test 2: Try creating story with simple text
try {
    const simpleStory = new inkjs.Story("Hello world.");
    console.log('✅ Simple text works');
    const content = simpleStory.Continue();
    console.log('   Content:', content);
} catch (error) {
    console.log('❌ Simple text failed:', error.message);
}

// Test 3: Try loading our file and checking what's actually in it
fetch('js/ink/ink-stories/character-creation.json?t=' + Date.now())
    .then(response => response.text())
    .then(inkContent => {
        console.log('File content length:', inkContent.length);
        console.log('First 100 chars:', inkContent.substring(0, 100));
        console.log('Last 100 chars:', inkContent.substring(inkContent.length - 100));
        
        // Test 4: Try with the actual file content
        try {
            const fileStory = new inkjs.Story(inkContent);
            console.log('✅ File content works');
            const fileContent = fileStory.Continue();
            console.log('   Content:', fileContent.substring(0, 50) + '...');
        } catch (error) {
            console.log('❌ File content failed:', error.message);
            console.log('   Error stack:', error.stack);
        }
    })
    .catch(error => {
        console.error('❌ Failed to load file:', error.message);
    });
