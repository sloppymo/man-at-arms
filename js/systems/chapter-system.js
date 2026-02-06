(function() {
    'use strict';
    
    // Note: CHAPTERS constant is already in constants.js
    
    // Check if player should transition to next chapter
    function checkChapterTransition() {
        // Chapter 1: Chevauchée (1346)
        if (gameState.year >= 1346 && gameState.year < 1347 && gameState.chapter !== 'chevauchée') {
            if (!gameState.chapterProgress.chevauchée.started) {
                gameState.chapter = 'chevauchée';
                gameState.chapterProgress.chevauchée.started = true;
                if (typeof showNotification === 'function') {
                    showNotification('Chapter 1', CHAPTERS.chevauchée.name + ': ' + CHAPTERS.chevauchée.description, 'info');
                }
            }
        }
        
        // Chapter 2: Siege of Calais (1346-1347)
        // Only transition when player actually enters the Calais arc (scene-based gating)
        if (gameState.year >= 1346 && gameState.year <= 1347 && gameState.chapter !== 'calais') {
            const calaisScenes = ['calais_siege', 'march_to_calais', 'calais_latrines', 'calais_night', 'calais_skim'];
            const inCalaisArc = calaisScenes.includes(gameState.currentScene);
            if (inCalaisArc || (gameState.year === 1347 && !gameState.chapterProgress.calais.started)) {
                gameState.chapter = 'calais';
                gameState.chapterProgress.chevauchée.completed = true;
                gameState.chapterProgress.calais.started = true;
                if (typeof showNotification === 'function') {
                    showNotification('Chapter 2', CHAPTERS.calais.name + ': ' + CHAPTERS.calais.description, 'info');
                }
            }
        }
        
        // Chapter 3: The Black Death (1348-1353)
        if (gameState.year >= 1348 && gameState.year <= 1353 && gameState.chapter !== 'plague') {
            if (!gameState.chapterProgress.plague.started) {
                gameState.chapter = 'plague';
                gameState.chapterProgress.calais.completed = true;
                gameState.chapterProgress.plague.started = true;
                if (typeof showNotification === 'function') {
                    showNotification('Chapter 3', CHAPTERS.plague.name + ': ' + CHAPTERS.plague.description, 'info');
                }
                // Increase arbitrary death chance during plague
                // This is handled by the arbitrary death system
            }
        }
        
        // Chapter 4: Poitiers/Tours (1356)
        if (gameState.year >= 1356 && gameState.chapter !== 'poitiers') {
            if (!gameState.chapterProgress.poitiers.started) {
                gameState.chapter = 'poitiers';
                gameState.chapterProgress.plague.completed = true;
                gameState.chapterProgress.poitiers.started = true;
                if (typeof showNotification === 'function') {
                    showNotification('Chapter 4', CHAPTERS.poitiers.name + ': ' + CHAPTERS.poitiers.description, 'info');
                }
            }
        }
    }
    
    // Get current chapter info
    function getCurrentChapter() {
        if (!gameState.chapter) return null;
        return CHAPTERS[gameState.chapter] || null;
    }
    
    // Modify arbitrary death chances based on chapter
    function getChapterDeathModifier() {
        const chapter = getCurrentChapter();
        if (!chapter) return 1.0;
        
        // Plague chapter has much higher death rates
        if (chapter.id === 'plague') {
            return 2.0; // Double all death chances
        }
        
        // Calais siege also increases death rates
        if (chapter.id === 'calais') {
            return 1.5; // 50% increase
        }
        
        return 1.0; // Normal rates for other chapters
    }
    
    // Make available globally
    window.checkChapterTransition = checkChapterTransition;
    window.getCurrentChapter = getCurrentChapter;
    window.getChapterDeathModifier = getChapterDeathModifier;
})();
