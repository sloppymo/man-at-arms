(function() {
    'use strict';

function updateDisplay() {
    // Isolate each renderer so one failure doesn't block others
    try {
        window.updateStory();
    } catch (e) {
        console.error('updateStory failed:', e);
    }
    try {
        window.updateStats();
    } catch (e) {
        console.error('updateStats failed:', e);
    }
    try {
        window.updateChoices();
    } catch (e) {
        console.error('updateChoices failed:', e);
    }
    try {
        window.updateStatusBar();
    } catch (e) {
        console.error('updateStatusBar failed:', e);
    }
    
    // Hide controls footer on character creation screen
    const controls = document.querySelector('.controls');
    if (controls) {
        if (window.gameState.currentScene === 'character_creation') {
            controls.style.display = 'none';
        } else {
            controls.style.display = 'flex';
        }
    }
}
function updateStory() {
    console.log("=== UPDATE STORY START ===");
    
    // Wait for Ink initialization if available
    if (window.inkReady && window.inkStory) {
        window.inkReady.then(() => {
            renderStoryContent();
        }).catch(error => {
            console.error("Ink initialization failed:", error);
            renderLegacyContent();
        });
    } else {
        renderStoryContent();
    }
}

function renderStoryContent() {
    console.log("=== RENDER STORY CONTENT START ===");

    // Check if we should use Ink rendering
    const currentScene = window.gameState.currentScene;
    const isInkSceneResult = isInkScene(currentScene);
    console.log(`Scene: ${currentScene}, Is Ink Scene: ${isInkSceneResult}`);
    console.log(`window.inkStory exists: ${!!window.inkStory}`);
    console.log(`window.inkStory type: ${typeof window.inkStory}`);

    if (window.inkStory && isInkSceneResult) {
        console.log("Rendering Ink content for scene:", currentScene);
        renderInkContent();
    } else {
        console.log("Rendering legacy content for scene:", currentScene);
        console.log(`Reason: inkStory=${!!window.inkStory}, isInkScene=${isInkSceneResult}`);
        renderLegacyContent();
    }
}

function isInkScene(sceneId) {
    // Define which scenes use Ink rendering
    const inkScenes = ['training_brawny', 'simple_test_scene']; // Re-enabled simple_test_scene with fixed JSON
    return inkScenes.includes(sceneId);
}

async function renderInkContent() {
    try {
        console.log("Rendering Ink content for scene:", window.gameState.currentScene);

        // Ensure the correct Ink story is loaded for this scene
        const sceneName = window.gameState.currentScene;
        let storyToLoad = sceneName;
        
        // For testing, use the working 'training' story for simple_test_scene
        if (sceneName === 'simple_test_scene') {
            storyToLoad = 'training';
        }
        
        // For training_brawny, use the main story (which contains it)
        if (sceneName === 'training_brawny') {
            storyToLoad = 'main';
        }
        
        if (window.inkIntegration) {
            // Check if we need to load a different story
            const currentStoryName = window.inkStory ? window.inkStory._storyName || 'unknown' : null;
            if (currentStoryName !== storyToLoad) {
                console.log(`Loading Ink story: ${storyToLoad} for scene: ${sceneName}`);
                try {
                    await window.inkIntegration.loadStory(storyToLoad);
                    console.log(`Successfully loaded story: ${storyToLoad}`);
                    
                    // Navigate to the correct knot if this is a sub-scene
                    if (sceneName === 'training_brawny' && storyToLoad === 'main') {
                        try {
                            window.inkStory.ChoosePathString('training_brawny');
                            console.log(`Navigated to knot: training_brawny`);
                        } catch (navError) {
                            console.warn(`Could not navigate to knot training_brawny:`, navError);
                        }
                    }
                    
                } catch (loadError) {
                    console.error(`Failed to load story ${storyToLoad}:`, loadError);
                    throw new Error(`Could not load Ink story: ${storyToLoad}`);
                }
            }
        }

        if (!window.inkStory) {
            throw new Error("Ink story not initialized");
        }

        let fullText = "";
        let tags = [];

        // Collect all content until choices
        let iterationCount = 0;
        const maxIterations = 50; // Safety limit
        
        while (window.inkStory.canContinue && iterationCount < maxIterations) {
            const content = window.inkStory.Continue();
            fullText += sanitizeInkOutput(content);
            tags = tags.concat(window.inkStory.currentTags);
            iterationCount++;
            
            if (iterationCount >= maxIterations) {
                console.warn(`Ink rendering stopped after ${maxIterations} iterations to prevent infinite loop`);
                break;
            }
        }
        
        console.log(`Ink rendering completed in ${iterationCount} iterations`);

        // Process tags for artwork/metadata
        processInkTags(tags);

        // Apply typewriter effect
        const storyElement = document.getElementById('story');
        if (storyElement) {
            await typewriterEffect(storyElement, fullText);
        }

        // Render choices
        renderInkChoices();

        console.log("Successfully rendered Ink content");
    } catch (error) {
        console.error("Error rendering Ink content:", error);
        window.inkIntegration.handleInkError(error, renderLegacyContent);
    }
}

function renderLegacyContent() {
    console.log("Rendering legacy content for scene:", window.gameState.currentScene);
    
    // Get story element once at the start
    const storyElement = document.getElementById('story');
    if (!storyElement) {
        console.error("Story element not found!");
        return;
    }
    console.log("Story element found:", storyElement);
    
    // Declare scene in function scope so it's accessible throughout
    let scene;
    
    try {
        console.log("updateStory called, currentScene:", window.gameState.currentScene);
        console.log("scenes object exists:", typeof window.scenes !== 'undefined');
        
        if (typeof window.scenes === 'undefined') {
            console.error("scenes object is not defined!");
            storyElement.innerHTML = '<p>Error: Scenes not loaded. Please refresh the page.</p>';
            // Reset to safe state
            window.gameState.currentScene = 'character_creation';
            return;
        }
        
        console.log("scenes keys:", Object.keys(scenes).slice(0, 5));
        
        // Assign scene (not const, so it's accessible outside try block)
        scene = window.scenes[window.gameState.currentScene];
        if (!scene) {
            console.error("Scene not found:", window.gameState.currentScene);
            console.log("Available scenes:", Object.keys(scenes));
            // Reset to safe state instead of showing error
            console.warn("Resetting to character_creation scene");
            window.gameState.currentScene = 'character_creation';
            scene = window.scenes['character_creation'];
            if (!scene) {
                storyElement.innerHTML = '<p style="color: red;">Error: Game state corrupted. Please refresh the page.</p>';
                return;
            }
        }
        
        // Debug: log character creation scene
        if (window.gameState.currentScene === 'character_creation') {
            console.log("Rendering character creation scene");
        }
    } catch (error) {
        console.error("Error in updateStory:", error);
        const safeError = window.escapeHTML(String(error.message || 'Unknown error'));
        storyElement.innerHTML = `<p>Error loading scene: ${safeError}</p><p>Please check the console for details.</p>`;
        return;
    }
    
    // Now scene is guaranteed to be defined (or we've returned)
    // Update timeline if scene specifies it
    if (scene.year !== undefined && scene.year !== null) {
        window.gameState.year = typeof scene.year === 'function' ? scene.year() : scene.year;
    }
    if (scene.age !== undefined && scene.age !== null) {
        // Handle both function and number age values
        window.gameState.age = typeof scene.age === 'function' ? scene.age() : scene.age;
    }
    if (scene.location !== undefined && scene.location !== null) {
        window.gameState.location = typeof scene.location === 'function' ? scene.location() : scene.location;
        // Sync region when location changes
        if (typeof window.normalizeRegion === 'function') {
            window.gameState.region = window.normalizeRegion(window.gameState.location);
        }
    }
    
    // Update conditions
    window.updateConditions();
    
    // Run onEnter callback if present (only once per scene entry)
    if (scene.onEnter && typeof scene.onEnter === 'function') {
        const sceneKey = `${window.gameState.currentScene}_${window.gameState.year}`;
        if (!window.gameState.enteredScenes.has(sceneKey)) {
            scene.onEnter();
            window.gameState.enteredScenes.add(sceneKey);
        }
    }
    
    // Get story text (handle function-based text)
    let storyText = '';
    try {
        if (typeof scene.text === 'function') {
            storyText = scene.text();
        } else if (typeof scene.text === 'string') {
            storyText = scene.text;
        } else {
            console.error("Scene text is neither function nor string:", typeof scene.text);
            storyText = '<p>Error: Scene text format invalid.</p>';
        }
    } catch (error) {
        console.error("Error rendering scene text:", error);
        console.error("Error stack:", error.stack);
        storyText = `<p>Error loading scene content. Please refresh the page.</p><p>Error: ${error.message}</p><p>Check console for details.</p>`;
    }
    
    // Ensure we have some text to display
    if (!storyText || storyText.trim() === '') {
        console.error("storyText is empty after rendering!");
        storyText = '<p>Error: Scene rendered empty content.</p>';
    }
    
    // Add rank display
    let rankDisplay = '';
    if (window.gameState.rank) {
        rankDisplay = `<div class="rank-display">Rank: ${window.gameState.rank}</div>`;
    }
    
    // Add patron favor display
    let favorDisplay = '';
    if (window.gameState.stats.patronFavor > 0) {
        favorDisplay = `<div style="margin-top: 5px; color: #f4d03f;">Patron Favor: ${window.gameState.stats.patronFavor}</div>`;
    }
    
    // Handle scene artwork
    const artworkElement = document.getElementById('scene-artwork');
    const artworkImage = document.getElementById('artwork-image');
    const artworkCaption = document.getElementById('artwork-caption');
    
    if (scene.artwork && artworkElement && artworkImage) {
        // Scene has artwork - display it
        artworkImage.src = scene.artwork;
        artworkImage.alt = scene.artworkCaption || (typeof scene.title === 'function' ? scene.title() : scene.title) || 'Scene artwork';
        
        // Add error handling for broken images
        artworkImage.onerror = function() {
            console.warn('Failed to load image:', scene.artwork);
            // Hide the image but keep the caption if it exists
            artworkImage.style.display = 'none';
            if (artworkCaption && scene.artworkCaption) {
                artworkCaption.style.display = 'block';
                artworkCaption.textContent = scene.artworkCaption;
            }
        };
        
        artworkImage.onload = function() {
            // Image loaded successfully
            artworkImage.style.display = 'block';
        };
        
        if (artworkCaption && scene.artworkCaption) {
            artworkCaption.textContent = scene.artworkCaption;
            artworkCaption.style.display = 'block';
        } else if (artworkCaption) {
            artworkCaption.style.display = 'none';
        }
        artworkElement.classList.add('visible');
    } else if (artworkElement) {
        // No artwork for this scene - hide it
        artworkElement.classList.remove('visible');
    }
    
    // Add equipment display (skip for character creation)
    let equipmentDisplay = '';
    if (window.gameState.currentScene !== 'character_creation') {
        // Use adapter functions for old/new format compatibility
        try {
            const weaponQuality = window.getEquipmentQuality('weapon');
            if (weaponQuality > 0) {
                const weaponName = window.getEquipmentName('weapon') || 'Weapon';
                equipmentDisplay = `<div style="margin-top: 5px; font-size: 0.9em;">
                    Equipment: ${weaponName} (Quality +${weaponQuality})
                </div>`;
            }
        } catch (e) {
            // Equipment display is optional, ignore errors
        }
    }
    
    // Add conditions display
    let conditionsDisplay = '';
    if (window.gameState.conditions.length > 0) {
        conditionsDisplay = '<div style="margin-top: 10px;"><strong>Conditions:</strong> ';
        conditionsDisplay += window.gameState.conditions.map(c => 
            `<span class="condition-badge ${c.type}">${c.name}</span>`
        ).join('');
        conditionsDisplay += '</div>';
    }
    
    // Render the story - ensure we always set innerHTML even if something is undefined
    try {
        const title = (typeof scene.title === 'function' ? scene.title() : scene.title) || 'Untitled Scene';
        storyElement.innerHTML = 
            `<h2 style="margin-bottom: 15px; color: #f4d03f;">${title}</h2>
             ${rankDisplay || ''}
             ${favorDisplay || ''}
             ${equipmentDisplay || ''}
             ${storyText || '<p>No content available.</p>'}
             ${conditionsDisplay || ''}`;
        storyElement.classList.add('fade-in');
        console.log("Successfully rendered story for scene:", window.gameState.currentScene);
    } catch (error) {
        console.error("Error setting storyElement.innerHTML:", error);
        const safeError = window.escapeHTML(String(error.message || 'Unknown error'));
        const safeScene = window.escapeHTML(String(window.gameState.currentScene || 'unknown'));
        storyElement.innerHTML = `<p>Error rendering scene: ${safeError}</p><p>Scene: ${safeScene}</p>`;
    }
}

// ============================================
// Ink.js Helper Functions
// ============================================

function sanitizeInkOutput(text) {
    // Use existing escapeHTML from utils.js
    return window.escapeHTML ? window.escapeHTML(text) : 
        text.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

function processInkTags(tags) {
    tags.forEach(tag => {
        let [key, value] = tag.split(':').map(s => s.trim());
        
        switch(key) {
            case 'artwork':
                updateArtwork(value);
                break;
            case 'caption':
                updateCaption(value);
                break;
            case 'font':
                updateFontStyle(value);
                break;
            case 'dialect':
                updateDialect(value);
                break;
        }
    });
}

function updateArtwork(artworkPath) {
    const artworkElement = document.getElementById('scene-artwork');
    const artworkImage = document.getElementById('artwork-image');
    const artworkCaption = document.getElementById('artwork-caption');
    
    if (artworkElement && artworkImage) {
        artworkImage.src = artworkPath;
        artworkImage.alt = 'Scene artwork';
        
        artworkImage.onerror = function() {
            console.warn('Failed to load artwork:', artworkPath);
            artworkImage.style.display = 'none';
        };
        
        artworkImage.onload = function() {
            artworkImage.style.display = 'block';
        };
        
        artworkElement.classList.add('visible');
    }
}

function updateCaption(captionText) {
    const artworkCaption = document.getElementById('artwork-caption');
    if (artworkCaption) {
        artworkCaption.textContent = captionText;
        artworkCaption.style.display = 'block';
    }
}

function updateFontStyle(fontStyle) {
    const storyElement = document.getElementById('story');
    if (storyElement) {
        switch(fontStyle) {
            case 'fraktur':
                storyElement.style.fontFamily = 'Uncial Antiqua, serif';
                break;
            case 'norman':
                storyElement.style.fontFamily = 'Cinzel, serif';
                break;
            default:
                storyElement.style.fontFamily = 'Crimson Text, serif';
        }
    }
}

function updateDialect(dialect) {
    // Could be used for different language styling
    console.log('Dialect tag:', dialect);
}

function renderInkChoices() {
    console.log('=== RENDER INK CHOICES CALLED ===');
    const container = document.getElementById('choices-container');
    if (!container || !window.inkStory) {
        console.log('renderInkChoices: container or inkStory not found');
        return;
    }

    console.log('renderInkChoices: currentChoices =', window.inkStory.currentChoices);
    console.log('renderInkChoices: canContinue =', window.inkStory.canContinue);

    container.innerHTML = '';

    window.inkStory.currentChoices.forEach((choice, index) => {
        console.log(`renderInkChoices: rendering choice ${index}:`, choice.text);
        const button = document.createElement('button');
        button.className = 'choice-button';
        button.innerHTML = sanitizeInkOutput(choice.text);
        button.onclick = () => selectInkChoice(index);
        container.appendChild(button);
    });

    console.log(`renderInkChoices: rendered ${window.inkStory.currentChoices.length} choices`);
}

function selectInkChoice(index) {
    // Prevent accidental choice selection when modals are open
    if (document.querySelector('.equipment-screen:not(.hidden)') || 
        document.querySelector('.modal:not(.hidden)')) {
        return;
    }
    
    if (window.inkStory) {
        window.inkStory.ChooseChoiceIndex(index);
        // Update display after choice
        window.updateDisplay();
    }
}

async function typewriterEffect(element, text) {
    if (!element) return;
    
    element.innerHTML = '';
    element.classList.add('fade-in');
    
    for (let i = 0; i < text.length; i++) {
        element.innerHTML += text[i];
        await new Promise(resolve => setTimeout(resolve, 20)); // 20ms per character
    }
}

    // Expose globally
    window.updateDisplay = updateDisplay;
    window.updateStory = updateStory;
    window.testInkRendering = () => {
        console.log('=== TEST INK RENDERING CALLED ===');
        console.log('Current scene:', window.gameState.currentScene);
        renderStoryContent();
    };
    window.setSceneAndRender = (sceneName) => {
        console.log(`Setting scene to: ${sceneName}`);
        if (window.gameState) {
            window.gameState.currentScene = sceneName;
            console.log(`Scene set to: ${window.gameState.currentScene}`);
            window.updateDisplay();
        } else {
            console.error('window.gameState not available');
        }
    };
    window.debugInkState = () => {
        try {
            const debugInfo = [
                '=== INK SYSTEM DEBUG ===',
                `window.inkStory exists: ${!!window.inkStory}`,
                `window.inkStory type: ${typeof window.inkStory}`,
                `Current scene: ${window.gameState?.currentScene}`,
                `Is training_brawny Ink scene: ${isInkScene('training_brawny')}`,
                `Story loader available: ${!!window.storyLoader}`,
                `Ink integration available: ${!!window.inkIntegration}`
            ];
            
            if (window.inkStory) {
                debugInfo.push(`inkStory.canContinue: ${window.inkStory.canContinue}`);
                debugInfo.push(`inkStory.currentChoices: ${window.inkStory.currentChoices}`);
                debugInfo.push(`inkStory.currentChoices type: ${typeof window.inkStory.currentChoices}`);
                if (window.inkStory.currentChoices) {
                    debugInfo.push(`inkStory.currentChoices length: ${window.inkStory.currentChoices.length}`);
                    debugInfo.push(`inkStory.currentChoices isArray: ${Array.isArray(window.inkStory.currentChoices)}`);
                } else {
                    debugInfo.push(`inkStory.currentChoices is null/undefined`);
                }
            }
            
            debugInfo.push('=== DEBUG COMPLETE ===');
            
            // Log to console
            debugInfo.forEach(line => console.log(line));
            
            // Also show on page
            const storyElement = document.getElementById('story');
            if (storyElement) {
                const debugDiv = document.createElement('div');
                debugDiv.style.background = 'black';
                debugDiv.style.color = 'white';
                debugDiv.style.padding = '10px';
                debugDiv.style.fontFamily = 'monospace';
                debugDiv.innerHTML = debugInfo.join('<br>');
                storyElement.innerHTML = '';
                storyElement.appendChild(debugDiv);
            }
            
        } catch (error) {
            console.error('Error in debugInkState:', error);
            const storyElement = document.getElementById('story');
            if (storyElement) {
                storyElement.innerHTML = `<div style="background: red; color: white; padding: 10px;">Error in debugInkState: ${error.message}</div>`;
            }
        }
    };
})();
