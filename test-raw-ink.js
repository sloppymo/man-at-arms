
console.log('🧪 Testing raw ink with inkjs...');

// Try raw ink directly
const inkContent = `Hello world.
This is a test.
The end.`;

try {
    const story = new inkjs.Story(inkContent);
    console.log('✅ Raw ink story created!');
    
    if (story.canContinue) {
        const content = story.Continue();
        console.log('✅ Content:', content);
    }
} catch (error) {
    console.log('❌ Raw ink failed:', error.message);
}
