// ============================================
// Dialog System Test Script
// Quick verification that all components are working
// ============================================

console.log('🧪 Testing Dialog System Components...\n');

// Test 1: Check if all modules are available
try {
  console.log('📦 Testing module imports...');
  
  // These should be available if the build is working
  const modules = [
    'DialogUI',
    'PortraitService', 
    'DialogSystem',
    'TagRouter',
    'DialogueService'
  ];
  
  modules.forEach(moduleName => {
    if (window[moduleName]) {
      console.log(`✅ ${moduleName} - Available`);
    } else {
      console.log(`❌ ${moduleName} - Missing`);
    }
  });
  
} catch (error) {
  console.error('❌ Module test failed:', error);
}

// Test 2: Check if global services are initialized
try {
  console.log('\n🔧 Testing global services...');
  
  if (window.dialogueService) {
    console.log('✅ DialogueService - Initialized');
    
    // Test dialog system status
    const status = window.dialogueService.getDialogSystemStatus();
    console.log('📊 Dialog System Status:', status);
    
    // Test tag router
    if (window.dialogueService.tagRouter) {
      console.log('✅ TagRouter - Available');
      
      const registeredTags = window.dialogueService.tagRouter.getRegisteredTags();
      console.log('🏷️ Registered Tags:', registeredTags);
    } else {
      console.log('❌ TagRouter - Missing');
    }
  } else {
    console.log('❌ DialogueService - Not initialized');
  }
  
} catch (error) {
  console.error('❌ Service test failed:', error);
}

// Test 3: Check character data
try {
  console.log('\n👥 Testing character data...');
  
  if (window.CHARACTERS) {
    const characterCount = Object.keys(window.CHARACTERS).length;
    console.log(`✅ Characters - ${characterCount} loaded`);
    
    Object.entries(window.CHARACTERS).forEach(([id, character]) => {
      console.log(`  📝 ${character.name} (${id})`);
    });
  } else {
    console.log('❌ Characters - Not loaded');
  }
  
} catch (error) {
  console.error('❌ Character test failed:', error);
}

// Test 4: Check debug controls
try {
  console.log('\n🐛 Testing debug controls...');
  
  const debugButtons = document.querySelectorAll('button');
  const hasDialogButtons = Array.from(debugButtons).some(button => 
    button.textContent.includes('DIALOG') || 
    button.textContent.includes('MERCHANT') || 
    button.textContent.includes('BANDIT')
  );
  
  if (hasDialogButtons) {
    console.log('✅ Debug Controls - Available');
  } else {
    console.log('⚠️ Debug Controls - Not visible (may be disabled in production)');
  }
  
} catch (error) {
  console.error('❌ Debug test failed:', error);
}

console.log('\n🎉 Dialog System Test Complete!');
console.log('📚 See SHIP_QUALITY_DIALOG_SYSTEM.md for full documentation');
console.log('🎮 Use debug buttons to test dialog functionality');
