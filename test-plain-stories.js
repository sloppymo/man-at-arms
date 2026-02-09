// Test script for plain text stories
console.log('🧪 Testing plain text JSON stories...');

// Test the character creation story
fetch('js/ink/ink-stories/character-creation.json?t=' + Date.now())
    .then(response => response.json())
    .then(jsonData => {
        console.log('✅ JSON loaded successfully');
        console.log('Version:', jsonData.inkVersion);
        console.log('Text preview:', jsonData.root[0].text.substring(0, 100) + '...');
        
        // Try to create story
        try {
            const story = new inkjs.Story(jsonData);
            console.log('✅ Story created successfully');
            
            // Try to get content
            const content = story.Continue();
            console.log('✅ Content generated successfully');
            console.log('Content length:', content.length);
            console.log('Content preview:', content.substring(0, 200) + '...');
            console.log('🎉 PLAIN TEXT APPROACH WORKS!');
            
            // Test canContinue
            console.log('Can continue:', story.canContinue);
            
        } catch (error) {
            console.error('❌ Story creation failed:', error.message);
        }
    })
    .catch(error => {
        console.error('❌ JSON loading failed:', error.message);
    });
