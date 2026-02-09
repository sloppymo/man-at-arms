// Quick test to verify the version fix
console.log('🧪 Testing Ink.js version fix...');

// Test loading the recompiled story
fetch('js/ink/ink-stories/character-creation.json')
    .then(response => response.json())
    .then(jsonData => {
        console.log('✅ JSON loaded successfully');
        console.log('Version:', jsonData.inkVersion);
        
        // Try to create story
        try {
            const story = new inkjs.Story(jsonData);
            console.log('✅ Story created successfully');
            
            // Try to get content
            const content = story.Continue();
            console.log('✅ Content generated:', content.substring(0, 100) + '...');
            console.log('🎉 Version fix successful!');
        } catch (error) {
            console.error('❌ Story creation failed:', error.message);
        }
    })
    .catch(error => {
        console.error('❌ JSON loading failed:', error.message);
    });
