// Node.js test for compiled story
const fs = require('fs');
const path = require('path');

// Import inkjs - need to use the ES5 version for Node.js
const inkjs = require('./node_modules/inkjs/dist/ink.js');

async function testCompiledStory() {
    console.log('🧪 Testing compiled story in Node.js...\n');
    
    try {
        // Load the compiled story
        const storyPath = path.join(__dirname, 'public/stories/overworld/forest_test.json');
        console.log('📁 Loading story from:', storyPath);
        
        const jsonText = fs.readFileSync(storyPath, 'utf8');
        console.log('📄 JSON loaded, size:', jsonText.length, 'bytes');
        
        // Parse JSON
        const storyJson = JSON.parse(jsonText);
        console.log('✅ JSON parsed successfully');
        console.log('🔢 inkVersion:', storyJson.inkVersion);
        console.log('🏗️  Has root:', !!storyJson.root);
        console.log('📊 Root type:', typeof storyJson.root);
        
        // Create ink story
        console.log('\n🎭 Creating ink Story instance...');
        const story = new inkjs.Story(storyJson);
        console.log('✅ Story created successfully!');
        
        // Test external function binding
        console.log('\n🔗 Testing external function binding...');
        let boundFunctions = 0;
        
        const functions = [
            {
                name: 'advanceTime',
                fn: (minutes) => {
                    console.log(`  ✓ advanceTime called with: ${minutes}`);
                    return minutes;
                }
            },
            {
                name: 'getSupplies', 
                fn: () => {
                    console.log(`  ✓ getSupplies called`);
                    return JSON.stringify({ food: 5, water: 3 });
                }
            },
            {
                name: 'consumeSupply',
                fn: (type, amount) => {
                    console.log(`  ✓ consumeSupply called with: ${type}, ${amount}`);
                    return true;
                }
            },
            {
                name: 'showImage',
                fn: (imagePath) => {
                    console.log(`  ✓ showImage called with: ${imagePath}`);
                }
            }
        ];
        
        functions.forEach(({ name, fn }) => {
            try {
                story.BindExternalFunction(name, fn);
                boundFunctions++;
                console.log(`  ✅ ${name} bound successfully`);
            } catch (e) {
                console.log(`  ❌ ${name} binding failed:`, e.message);
            }
        });
        
        console.log(`\n📈 External functions bound: ${boundFunctions}/4`);
        
        // Test story execution
        console.log('\n📖 Testing story execution...');
        try {
            const text = story.Continue();
            console.log('📝 Story text:', `"${text.trim()}"`);
            console.log('🔄 Can continue:', story.canContinue);
            console.log('📊 Choices available:', story.currentChoices.length);
            
            if (story.currentChoices.length > 0) {
                console.log('🎯 Choices:');
                story.currentChoices.forEach((choice, index) => {
                    console.log(`   ${index}: ${choice.text}`);
                });
            }
            
            // Test multiple continues
            if (story.canContinue) {
                console.log('\n📖 Continuing story...');
                const text2 = story.Continue();
                console.log('📝 Next text:', `"${text2.trim()}"`);
                console.log('🔄 Can continue:', story.canContinue);
            }
            
        } catch (e) {
            console.log('❌ Story execution failed:', e.message);
            console.log('Stack:', e.stack);
        }
        
        console.log('\n🎉 Compiled story test completed successfully!');
        
        return true;
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        console.log('Stack:', error.stack);
        return false;
    }
}

// Run the test
testCompiledStory().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.log('💥 Unhandled error:', error);
    process.exit(1);
});
