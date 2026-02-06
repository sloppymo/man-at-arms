// Check inkjs version and capabilities
console.log('🔍 Checking inkjs capabilities...');

console.log('Inkjs version info:');
console.log('Available methods:', Object.getOwnPropertyNames(inkjs.Story.prototype));
console.log('Story constructor length:', inkjs.Story.length);

// Check if there are different ways to create a story
console.log('\n🧪 Testing different story creation methods:');

// Method 1: Raw ink string
const rawInk = "Hello world.";
try {
    const story1 = new inkjs.Story(rawInk);
    console.log('✅ Method 1 (raw ink): Works');
    console.log('   Can continue:', story1.canContinue);
    if (story1.canContinue) {
        console.log('   Content:', story1.Continue());
    }
} catch (error) {
    console.log('❌ Method 1 (raw ink):', error.message);
}

// Method 2: Check if there's a compiler
if (inkjs.Compiler) {
    console.log('✅ Compiler available');
    try {
        const compiled = inkjs.Compiler.compile(rawInk);
        console.log('Compiled result type:', typeof compiled);
        console.log('Compiled result keys:', Object.keys(compiled));
        
        if (compiled.toJson) {
            const json = compiled.toJson();
            console.log('JSON type:', typeof json);
            const story2 = new inkjs.Story(json);
            console.log('✅ Method 2 (compiled): Works');
        }
    } catch (error) {
        console.log('❌ Method 2 (compiled):', error.message);
    }
} else {
    console.log('❌ No compiler available');
}

// Method 3: Check if Story has static methods
console.log('\nStory static methods:', Object.getOwnPropertyNames(inkjs.Story));
