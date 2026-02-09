// Test different JSON structures to find what inkjs actually expects
console.log('🔍 Testing different JSON structures for inkjs...');

// Test 1: Empty root array
const emptyStory = {
    version: "0.1",
    inkVersion: 19,
    root: []
};

// Test 2: Root with different structure
const simpleStory = {
    version: "0.1", 
    inkVersion: 19,
    root: [
        "Hello world."
    ]
};

// Test 3: Try the structure from the original error
const originalStyle = {
    version: "0.1",
    inkVersion: 19,
    root: [
        {
            "->": "done",
            "temp": {}
        }
    ],
    "done": [
        "Hello world."
    ]
};

// Test each structure
const testStructures = [
    { name: "Empty", data: emptyStory },
    { name: "Simple Array", data: simpleStory },
    { name: "Original Style", data: originalStyle }
];

async function testStructure(name, data) {
    console.log(`\n🧪 Testing ${name} structure...`);
    
    try {
        const story = new inkjs.Story(data);
        console.log(`✅ ${name}: Story created successfully`);
        
        if (story.canContinue) {
            const content = story.Continue();
            console.log(`✅ ${name}: Content = "${content}"`);
        } else {
            console.log(`ℹ️  ${name}: No content to continue`);
        }
        
        return true;
    } catch (error) {
        console.log(`❌ ${name}: ${error.message}`);
        return false;
    }
}

// Test all structures
async function runTests() {
    let workingStructure = null;
    
    for (const test of testStructures) {
        const works = await testStructure(test.name, test.data);
        if (works && !workingStructure) {
            workingStructure = test.name;
        }
    }
    
    if (workingStructure) {
        console.log(`\n🎉 Working structure found: ${workingStructure}`);
    } else {
        console.log(`\n❌ No working structure found`);
    }
}

// Run the tests
runTests();
