(function() {
    'use strict';

// Track current dialogue image
let currentDialogueImage = null;

// Prevent re-rendering during typewriter effect
let isTyping = false;

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
    
    // System initialization removed - render story content directly
    renderStoryContent();
}

function renderStoryContent() {
    console.log("=== RENDER STORY CONTENT START ===");

    // Narrative system removed - always use legacy content
    const currentScene = window.gameState.currentScene;
    console.log(`Scene: ${currentScene}, Using legacy content only`);
    
    console.log("Rendering legacy content for scene:", currentScene);
    renderLegacyContent();
}

async function renderInkContent() {
    // Narrative integration removed - this function now delegates to legacy content
    console.log(`renderInkContent called, delegating to legacy content for scene: ${window.gameState.currentScene}`);
    renderLegacyContent();
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
    
    if (scene.artwork && artworkElement && artworkImage && !document.body.classList.contains('overworld-mode')) {
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
        // No artwork for this scene or in overworld mode - hide it
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
// Legacy Helper Functions
// ============================================

function resolvePublicAsset(tagPath) {
  const base = import.meta.env.BASE_URL || "/";
  return base.replace(/\/?$/, "/") + tagPath.replace(/^\//, "");
}

function splitTag(tag) {
  const i = tag.indexOf(':');
  if (i === -1) return { key: tag.trim(), value: '' };
  return { key: tag.slice(0, i).trim(), value: tag.slice(i + 1).trim() };
}

function processTags(tags) {
    tags.forEach(tag => {
        const { key, value } = splitTag(tag);
        
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
            case 'speaker':
                updateSpeaker(value);
                break;
            case 'pl':
                updatePortraitLeft(value);
                break;
            case 'pr':
                updatePortraitRight(value);
                break;
            case 'poseL':
                updatePoseLeft(value);
                break;
            case 'poseR':
                updatePoseRight(value);
                break;
            case 'bg':
                updateBackground(value);
                break;
            case 'sfx':
                playSoundEffect(value);
                break;
            case 'mode':
                changeUIMode(value);
                break;
            case 'intent':
                handleIntent(value);
                break;
        }
    });
}

function updateArtwork(artworkPath) {
    console.log('Updating artwork to:', artworkPath);
    
    // Don't display artwork in overworld mode
    if (document.body.classList.contains('overworld-mode')) {
        console.log('Skipping artwork display in overworld mode');
        return;
    }
    
    const resolvedPath = resolvePublicAsset(artworkPath);
    const artworkElement = document.getElementById('scene-artwork');
    const artworkImage = document.getElementById('artwork-image');
    const artworkCaption = document.getElementById('artwork-caption');
    
    if (artworkElement && artworkImage) {
        artworkImage.src = resolvedPath;
        artworkImage.alt = 'Scene artwork';
        
        artworkImage.onerror = function() {
            console.warn('Failed to load artwork:', resolvedPath);
            artworkImage.style.display = 'none';
        };
        
        artworkImage.onload = function() {
            artworkImage.style.display = 'block';
        };
        
        artworkElement.classList.add('visible');
    }
}

function updateSpeaker(speakerName) {
    const speakerElement = document.getElementById('speaker-name');
    if (speakerElement) {
        speakerElement.textContent = speakerName;
        speakerElement.style.display = speakerName ? 'block' : 'none';
    }
}

function updatePortraitLeft(portraitPath) {
    const portraitElement = document.getElementById('portrait-left');
    if (portraitElement) {
        const resolvedPath = resolvePublicAsset(portraitPath);
        portraitElement.src = resolvedPath;
        portraitElement.style.display = portraitPath ? 'block' : 'none';
        portraitElement.onerror = function() {
            console.warn('Failed to load portrait left:', resolvedPath);
            portraitElement.style.display = 'none';
        };
    }
}

function updatePortraitRight(portraitPath) {
    const portraitElement = document.getElementById('portrait-right');
    if (portraitElement) {
        const resolvedPath = resolvePublicAsset(portraitPath);
        portraitElement.src = resolvedPath;
        portraitElement.style.display = portraitPath ? 'block' : 'none';
        portraitElement.onerror = function() {
            console.warn('Failed to load portrait right:', resolvedPath);
            portraitElement.style.display = 'none';
        };
    }
}

function updatePoseLeft(poseId) {
    const portraitElement = document.getElementById('portrait-left');
    if (portraitElement) {
        portraitElement.className = `portrait pose-${poseId}`;
    }
}

function updatePoseRight(poseId) {
    const portraitElement = document.getElementById('portrait-right');
    if (portraitElement) {
        portraitElement.className = `portrait pose-${poseId}`;
    }
}

function updateBackground(bgPath) {
    // Don't display background images in overworld mode
    if (document.body.classList.contains('overworld-mode')) {
        console.log('Skipping background update in overworld mode');
        return;
    }
    
    const resolvedPath = resolvePublicAsset(bgPath);
    document.body.style.backgroundImage = bgPath ? `url(${resolvedPath})` : 'none';
}

function playSoundEffect(sfxId) {
    // Assume there's an audio system
    if (window.playSound) {
        window.playSound(sfxId);
    } else {
        console.log('SFX:', sfxId);
    }
}

function changeUIMode(mode) {
    // Dispatch mode change event
    if (window.dispatcher) {
        window.dispatcher.dispatch('MODE_CHANGE', { mode }, 'renderer');
    } else {
        console.log('Mode change:', mode);
    }
}

function handleIntent(value) {
    const [action, ...rest] = value.split(':');
    const param = rest.join(':');
    switch (action) {
        case 'startCombat':
            if (window.dispatcher) {
                window.dispatcher.dispatch('TRIGGER_COMBAT', { enemyId: param }, 'renderer');
            }
            break;
        default:
            console.log('Intent:', value);
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
    // Choices removed - no longer needed
    console.log('renderInkChoices: Narrative system removed');
}

function selectInkChoice(index) {
    // Choice selection removed - no longer needed
    console.log('selectInkChoice: Narrative system removed');
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
    window.testNarrativeRendering = () => {
        console.log('=== TEST NARRATIVE RENDERING CALLED ===');
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
    window.debugNarrativeState = function() {
    console.log('=== NARRATIVE SYSTEM DEBUG ===');
    console.log('Narrative system has been removed from the project');
    
    try {
        const debugInfo = [
            '=== LEGACY SYSTEM DEBUG ===',
            `Current scene: ${window.gameState?.currentScene}`,
            `Story loader available: ${!!window.storyLoader}`,
            `Narrative integration available: false (removed)`
        ];
        
        const storyElement = document.getElementById('story');
        if (storyElement) {
            storyElement.innerHTML = `<div style="background: #333; color: white; padding: 10px; font-family: monospace;">${debugInfo.join('<br>')}</div>`;
        }
    } catch (error) {
        console.error('Error in debugNarrativeState:', error);
        const storyElement = document.getElementById('story');
        if (storyElement) {
            storyElement.innerHTML = `<div style="background: red; color: white; padding: 10px;">Error in debugNarrativeState: ${error.message}</div>`;
        }
    }
};
    
    // Subscribe to SHOW_NOTIFICATION for dialogue images
    if (window.dispatcher) {
        window.dispatcher.subscribe('SHOW_NOTIFICATION', (event) => {
            if (event.payload && event.payload.imagePath) {
                console.log('Image notification received:', event.payload);
                currentDialogueImage = event.payload.imagePath;
                updateArtwork(currentDialogueImage);
                // Trigger re-render to display the image
                updateDisplay();
            }
        });
    }
})();
