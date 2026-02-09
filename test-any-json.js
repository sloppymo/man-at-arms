// Test if inkjs can handle ANY JSON structure
console.log('🔍 Testing if inkjs can handle any JSON...');

// Test the empty story first
fetch('js/ink/ink-stories/character-creation.json?t=' + Date.now())
    .then(response => response.json())
    .then(jsonData => {
        console.log('Testing empty structure:', JSON.stringify(jsonData, null, 2));
        
        try {
            const story = new inkjs.Story(jsonData);
            console.log('✅ Empty structure works!');
            console.log('Can continue:', story.canContinue);
            
            if (story.canContinue) {
                const content = story.Continue();
                console.log('Content:', content);
            } else {
                console.log('No content to continue');
            }
            
        } catch (error) {
            console.log('❌ Empty structure failed:', error.message);
            
            // Try the version only
            return fetch('js/ink/ink-stories/main.json?t=' + Date.now());
        }
    })
    .then(response => response.json())
    .then(jsonData => {
        console.log('Testing version only:', JSON.stringify(jsonData, null, 2));
        
        try {
            const story = new inkjs.Story(jsonData);
            console.log('✅ Version only works!');
        } catch (error) {
            console.log('❌ Version only failed:', error.message);
            
            // Try simple root
            return fetch('js/ink/ink-stories/training.json?t=' + Date.now());
        }
    })
    .then(response => response.json())
    .then(jsonData => {
        console.log('Testing simple root:', JSON.stringify(jsonData, null, 2));
        
        try {
            const story = new inkjs.Story(jsonData);
            console.log('✅ Simple root works!');
            
            if (story.canContinue) {
                const content = story.Continue();
                console.log('Content:', content);
            }
        } catch (error) {
            console.log('❌ Simple root failed:', error.message);
            console.log('🚨 All JSON approaches failed - inkjs may not support JSON loading');
        }
    })
    .catch(error => {
        console.error('❌ Test failed:', error.message);
    });
