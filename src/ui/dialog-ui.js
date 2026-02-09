// ============================================
// Dialog UI - Ship Quality Version
// Enhanced dialog interface with portrait support, typewriter effect, and UX polish
// ============================================

import { EVENT_TYPES } from '../core/dispatcher.js';

/**
 * Dialog UI class for managing dialog interface
 */
export class DialogUI {
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
    this.isVisible = false;
    this.currentCharacter = null;
    this.currentEmotion = 'neutral';
    this.dialogHistory = [];
    this.typewriterTimeout = null;
    this.currentText = '';
    this.isTypewriterActive = false;
    this.currentChoiceIndex = 0;
    this.choices = [];
    
    this.createDialogElements();
    this.setupEventListeners();
  }

  /**
   * Create dialog DOM elements with enhanced UI
   */
  createDialogElements() {
    console.log('DialogUI: Creating dialog elements...');
    
    // Create main dialog container
    this.dialogContainer = document.createElement('div');
    this.dialogContainer.className = 'dialog-container hidden';
    this.dialogContainer.innerHTML = `
      <div class="dialog-panel">
        <div class="dialog-portrait-section">
          <div class="character-portrait-container">
            <div class="portrait-frame">
              <img id="dialog-portrait" class="character-portrait" src="" alt="">
              <div class="portrait-safety-area"></div>
            </div>
            <div class="character-nameplate">
              <div class="speaker-info">
                <span id="character-name" class="character-name"></span>
                <span id="character-role" class="character-role"></span>
              </div>
              <span id="character-subtitle" class="character-subtitle"></span>
            </div>
          </div>
        </div>
        
        <div class="dialog-content-section">
          <div class="dialog-text-container">
            <div id="dialog-text" class="dialog-text"></div>
            <div id="dialog-history" class="dialog-history hidden"></div>
          </div>
          
          <div class="dialog-choices-container">
            <div id="dialog-choices" class="dialog-choices"></div>
          </div>
        </div>
        
        <div class="dialog-controls">
          <button id="dialog-skip-btn" class="dialog-button secondary">Skip</button>
          <button id="dialog-history-btn" class="dialog-button secondary">History</button>
          <button id="dialog-close-btn" class="dialog-button secondary">×</button>
        </div>
      </div>
    `;

    // Add enhanced styles
    this.addDialogStyles();

    // Append to body
    document.body.appendChild(this.dialogContainer);
    console.log('DialogUI: Dialog container appended to body');
    console.log('DialogUI: Dialog container in DOM:', document.body.contains(this.dialogContainer));
    console.log('DialogUI: Dialog container initial classes:', this.dialogContainer.className);

    // Get element references
    this.portraitElement = document.getElementById('dialog-portrait');
    this.characterNameElement = document.getElementById('character-name');
    this.characterRoleElement = document.getElementById('character-role');
    this.characterSubtitleElement = document.getElementById('character-subtitle');
    this.dialogTextElement = document.getElementById('dialog-text');
    this.dialogHistoryElement = document.getElementById('dialog-history');
    this.choicesElement = document.getElementById('dialog-choices');
    this.skipButton = document.getElementById('dialog-skip-btn');
    this.historyButton = document.getElementById('dialog-history-btn');
    this.closeButton = document.getElementById('dialog-close-btn');
    
    console.log('DialogUI: All element references obtained');
  }

  /**
   * Add enhanced dialog styles
   */
  addDialogStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Dialog Container */
      .dialog-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .dialog-container.visible {
        opacity: 1;
      }

      .dialog-container.hidden {
        display: none;
      }

      /* Dialog Panel */
      .dialog-panel {
        background: linear-gradient(135deg, #2a1810 0%, #1a0f08 100%);
        border: 3px solid #8b6914;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
        max-width: 900px;
        width: 90%;
        max-height: 80vh;
        display: flex;
        padding: 20px;
        gap: 20px;
        position: relative;
      }

      /* Portrait Section */
      .dialog-portrait-section {
        flex: 0 0 200px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .character-portrait-container {
        position: relative;
        width: 100%;
      }

      .portrait-frame {
        position: relative;
        width: 164px;
        height: 164px;
        border: 4px solid #8b6914;
        border-radius: 8px;
        background: #1a0f08;
        overflow: hidden;
        margin: 0 auto;
      }

      .portrait-safety-area {
        position: absolute;
        top: 8px;
        left: 8px;
        right: 8px;
        bottom: 8px;
        border: 2px dashed rgba(139, 105, 20, 0.3);
        border-radius: 4px;
        pointer-events: none;
      }

      .character-portrait {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center top;
        transition: filter 0.3s ease;
      }

      .character-portrait.emotion-neutral { filter: none; }
      .character-portrait.emotion-happy { filter: brightness(1.1) saturate(1.2); }
      .character-portrait.emotion-angry { filter: brightness(0.9) saturate(1.3) hue-rotate(-10deg); }
      .character-portrait.emotion-sad { filter: brightness(0.8) saturate(0.8); }
      .character-portrait.emotion-cruel_smile { filter: brightness(0.95) saturate(1.1) contrast(1.1); }

      /* Character Nameplate */
      .character-nameplate {
        margin-top: 12px;
        text-align: center;
        background: rgba(0, 0, 0, 0.6);
        border: 1px solid #8b6914;
        border-radius: 6px;
        padding: 8px 12px;
      }

      .speaker-info {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 4px;
      }

      .character-name {
        color: #d4af37;
        font-size: 16px;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
      }

      .character-role {
        background: #8b6914;
        color: #1a0f08;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 3px;
        font-weight: bold;
      }

      .character-subtitle {
        color: #8b7355;
        font-size: 12px;
        font-style: italic;
        display: block;
      }

      /* Content Section */
      .dialog-content-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }

      .dialog-text-container {
        flex: 1;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid #8b6914;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        position: relative;
        min-height: 80px;
        max-height: 200px;
        overflow-y: auto;
      }

      .dialog-text {
        color: #f4e4c1;
        font-size: 16px;
        line-height: 1.6;
        font-family: 'Georgia', serif;
        max-width: 100%;
        word-wrap: break-word;
      }

      /* Dialog History */
      .dialog-history {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.95);
        border: 1px solid #8b6914;
        border-radius: 8px;
        padding: 16px;
        overflow-y: auto;
        z-index: 10;
      }

      .dialog-history-entry {
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(139, 105, 20, 0.3);
      }

      .dialog-history-speaker {
        color: #d4af37;
        font-weight: bold;
        margin-bottom: 4px;
      }

      .dialog-history-text {
        color: #f4e4c1;
        font-size: 14px;
        line-height: 1.4;
      }

      /* Choices */
      .dialog-choices-container {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid #8b6914;
        border-radius: 8px;
        padding: 12px;
      }

      .dialog-choices {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .dialog-choice {
        background: linear-gradient(135deg, #3a2818 0%, #2a1810 100%);
        border: 2px solid #8b6914;
        border-radius: 6px;
        padding: 12px 16px;
        color: #f4e4c1;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
        text-align: left;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .dialog-choice:hover {
        background: linear-gradient(135deg, #4a3828 0%, #3a2818 100%);
        border-color: #d4af37;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
      }

      .dialog-choice.selected {
        background: linear-gradient(135deg, #8b6914 0%, #6b4904 100%);
        border-color: #d4af37;
        box-shadow: 0 0 12px rgba(212, 175, 55, 0.5);
      }

      .dialog-choice.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        filter: grayscale(0.8);
      }

      .dialog-choice.disabled:hover {
        transform: none;
        box-shadow: none;
        border-color: #8b6914;
      }

      .dialog-choice.focus {
        outline: 2px solid #d4af37;
        outline-offset: 2px;
      }

      .choice-number {
        background: #8b6914;
        color: #1a0f08;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 12px;
        flex-shrink: 0;
      }

      /* Controls */
      .dialog-controls {
        position: absolute;
        top: 12px;
        right: 12px;
        display: flex;
        gap: 8px;
      }

      .dialog-button {
        background: rgba(0, 0, 0, 0.7);
        border: 1px solid #8b6914;
        border-radius: 4px;
        padding: 6px 12px;
        color: #f4e4c1;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .dialog-button:hover {
        background: rgba(139, 105, 20, 0.3);
        border-color: #d4af37;
      }

      .dialog-button.secondary {
        background: rgba(0, 0, 0, 0.5);
        border-color: #666;
        color: #999;
      }

      .dialog-button.secondary:hover {
        background: rgba(102, 102, 102, 0.3);
        border-color: #999;
        color: #ccc;
      }

      /* Animations */
      @keyframes fadeInText {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes typewriter {
        from { width: 0; }
        to { width: 100%; }
      }

      .typewriter-text {
        overflow: hidden;
        white-space: pre-wrap;
        animation: typewriter 0.5s steps(40, end);
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .dialog-panel {
          flex-direction: column;
          padding: 16px;
          max-height: 90vh;
        }

        .dialog-portrait-section {
          flex: none;
          width: 100%;
        }

        .portrait-frame {
          width: 120px;
          height: 120px;
        }

        .dialog-text {
          font-size: 14px;
        }

        .dialog-choice {
          font-size: 13px;
          padding: 10px 12px;
        }
      }

      /* Accessibility */
      .dialog-choice:focus-visible {
        outline: 2px solid #d4af37;
        outline-offset: 2px;
      }

      .dialog-button:focus-visible {
        outline: 2px solid #d4af37;
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Setup event listeners with enhanced input handling
   */
  setupEventListeners() {
    // Dialog events
    this.dispatcher.subscribe('DIALOG_STARTED', (event) => {
      this.showDialog(event.payload);
    });

    // Listen for mode changes to dialogue
    this.dispatcher.subscribe('MODE_CHANGE', (event) => {
      console.log('DialogUI received MODE_CHANGE:', event.payload);
      if (event.payload === 'dialogue') {
        // Show dialogue when mode changes to dialogue
        console.log('DialogUI showing dialogue');
        this.showDialog({
          character: 'Unknown',
          emotion: 'neutral',
          text: 'Loading story...',
          choices: []
        });
      } else {
        // Hide dialogue when leaving dialogue mode
        console.log('DialogUI hiding dialogue');
        this.hideDialog();
      }
    });

    this.dispatcher.subscribe('DIALOG_UPDATED', (event) => {
      console.log('DialogUI received DIALOG_UPDATED:', event.payload);
      this.updateDialog(event.payload);
    });

    this.dispatcher.subscribe('DIALOG_ENDED', () => {
      this.hideDialog();
    });

    // Portrait events
    this.dispatcher.subscribe('PORTRAIT_UPDATED', (event) => {
      this.updatePortrait(event.payload);
    });

    // Button events
    this.skipButton.addEventListener('click', () => this.skipTypewriter());
    this.historyButton.addEventListener('click', () => this.toggleHistory());
    this.closeButton.addEventListener('click', () => this.closeDialog());

    // Keyboard events
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  /**
   * Handle keyboard input with controller support
   */
  handleKeyboard(event) {
    if (!this.isVisible) return;

    // Number keys for choices
    if (event.key >= '1' && event.key <= '9') {
      const choiceIndex = parseInt(event.key) - 1;
      if (choiceIndex < this.choices.length) {
        this.selectChoice(choiceIndex);
      }
      return;
    }

    // Arrow keys for navigation
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.navigateChoices(event.key === 'ArrowUp' ? -1 : 1);
      return;
    }

    // Enter to select
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (this.currentChoiceIndex >= 0 && this.currentChoiceIndex < this.choices.length) {
        this.selectChoice(this.currentChoiceIndex);
      }
      return;
    }

    // Escape to close
    if (event.key === 'Escape') {
      this.closeDialog();
      return;
    }

    // Space to skip typewriter
    if (event.key === ' ' && this.isTypewriterActive) {
      event.preventDefault();
      this.skipTypewriter();
    }
  }

  /**
   * Navigate choices with keyboard
   */
  navigateChoices(direction) {
    if (this.choices.length === 0) return;

    const oldIndex = this.currentChoiceIndex;
    this.currentChoiceIndex = Math.max(0, Math.min(this.choices.length - 1, this.currentChoiceIndex + direction));

    // Update focus
    if (oldIndex >= 0 && oldIndex < this.choices.length) {
      this.choices[oldIndex].classList.remove('focus');
    }
    this.choices[this.currentChoiceIndex].classList.add('focus');
    this.choices[this.currentChoiceIndex].focus();
  }

  /**
   * Show dialog with enhanced features
   */
  showDialog(dialogData) {
    console.log('DialogUI showDialog called with:', dialogData);
    this.currentCharacter = dialogData.character;
    this.currentEmotion = dialogData.emotion || 'neutral';
    
    // Update character info
    this.updateCharacterInfo(dialogData);
    
    // Show dialog with animation
    console.log('DialogUI: Removing hidden class, adding visible');
    this.dialogContainer.classList.remove('hidden');
    setTimeout(() => {
      this.dialogContainer.classList.add('visible');
      console.log('DialogUI: Dialog container classes:', this.dialogContainer.className);
      console.log('DialogUI: Dialog container element:', this.dialogContainer);
      console.log('DialogUI: Dialog container computed style:', window.getComputedStyle(this.dialogContainer));
    }, 10);
    
    this.isVisible = true;
    
    // Add to history
    this.addToHistory(dialogData);
    
    console.log('DialogUI: showDialog complete, isVisible =', this.isVisible);
  }

  /**
   * Update character information with role and subtitle
   */
  updateCharacterInfo(dialogData) {
    const character = getCharacter(dialogData.character);
    
    if (character) {
      this.characterNameElement.textContent = character.name;
      this.characterRoleElement.textContent = this.getRoleIcon(character.role || 'npc');
      this.characterSubtitleElement.textContent = character.subtitle || '';
      
      if (this.characterSubtitleElement.textContent === '') {
        this.characterSubtitleElement.style.display = 'none';
      } else {
        this.characterSubtitleElement.style.display = 'block';
      }
    }
  }

  /**
   * Get role icon for character
   */
  getRoleIcon(role) {
    const icons = {
      merchant: '🛒',
      bandit: '⚔️',
      guard: '🛡️',
      noble: '👑',
      peasant: '👤',
      npc: '💬'
    };
    return icons[role] || icons.npc;
  }

  /**
   * Update dialog with typewriter effect
   */
  updateDialog(dialogData) {
    const { text, choices } = dialogData;
    
    // Clear previous content
    this.choices = [];
    this.currentChoiceIndex = 0;
    
    // Start typewriter effect
    this.startTypewriter(text);
    
    // Update choices after a delay
    setTimeout(() => {
      this.updateChoices(choices || []);
    }, text.length * 20 + 500); // Wait for typewriter to finish
    
    // Add to history
    this.addToHistory(dialogData);
  }

  /**
   * Start typewriter effect
   */
  startTypewriter(text) {
    if (this.typewriterTimeout) {
      clearTimeout(this.typewriterTimeout);
    }
    
    this.currentText = text;
    this.isTypewriterActive = true;
    this.dialogTextElement.textContent = '';
    
    let currentIndex = 0;
    const typeSpeed = 20; // ms per character
    
    const typeNextChar = () => {
      if (currentIndex < text.length) {
        this.dialogTextElement.textContent += text[currentIndex];
        currentIndex++;
        this.typewriterTimeout = setTimeout(typeNextChar, typeSpeed);
      } else {
        this.isTypewriterActive = false;
      }
    };
    
    typeNextChar();
  }

  /**
   * Skip typewriter effect
   */
  skipTypewriter() {
    if (!this.isTypewriterActive) return;
    
    if (this.typewriterTimeout) {
      clearTimeout(this.typewriterTimeout);
    }
    
    this.dialogTextElement.textContent = this.currentText;
    this.isTypewriterActive = false;
  }

  /**
   * Update choices with enhanced styling
   */
  updateChoices(choices) {
    this.choicesElement.innerHTML = '';
    this.choices = [];
    
    choices.forEach((choice, index) => {
      const choiceElement = document.createElement('button');
      choiceElement.className = 'dialog-choice';
      choiceElement.innerHTML = `
        <span class="choice-number">${index + 1}</span>
        <span class="choice-text">${choice.text}</span>
      `;
      
      // Check if choice is disabled
      if (choice.disabled) {
        choiceElement.classList.add('disabled');
        choiceElement.disabled = true;
      }
      
      // Add click handler
      choiceElement.addEventListener('click', () => {
        if (!choice.disabled) {
          this.selectChoice(index);
        }
      });
      
      // Add keyboard navigation
      choiceElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!choice.disabled) {
            this.selectChoice(index);
          }
        }
      });
      
      this.choicesElement.appendChild(choiceElement);
      this.choices.push(choiceElement);
    });
    
    // Set initial focus
    if (this.choices.length > 0) {
      this.currentChoiceIndex = 0;
      this.choices[0].classList.add('focus');
      this.choices[0].focus();
    }
  }

  /**
   * Select a choice
   */
  selectChoice(index) {
    if (index < 0 || index >= this.choices.length) return;
    
    const choice = this.choices[index];
    if (choice.classList.contains('disabled')) return;
    
    // Add selection effect
    choice.classList.add('selected');
    
    // Dispatch choice event
    this.dispatcher.dispatch('DIALOG_CHOICE', { choiceIndex: index });
  }

  /**
   * Update portrait with emotion
   */
  updatePortrait(portraitData) {
    const { character, emotion } = portraitData;
    
    if (character !== this.currentCharacter) return;
    
    this.currentEmotion = emotion || 'neutral';
    
    // Update portrait image
    const characterData = getCharacter(character);
    if (characterData && characterData.portrait) {
      const portraitPath = `${characterData.portrait.basePath}/${emotion || characterData.portrait.defaultEmotion}.png`;
      this.portraitElement.src = portraitPath;
      
      // Update emotion class
      this.portraitElement.className = `character-portrait emotion-${this.currentEmotion}`;
    }
  }

  /**
   * Add dialog to history
   */
  addToHistory(dialogData) {
    const entry = {
      speaker: dialogData.character,
      text: dialogData.text,
      timestamp: new Date().toISOString()
    };
    
    this.dialogHistory.push(entry);
    
    // Keep only last 20 entries
    if (this.dialogHistory.length > 20) {
      this.dialogHistory.shift();
    }
  }

  /**
   * Toggle dialog history
   */
  toggleHistory() {
    if (this.dialogHistoryElement.classList.contains('hidden')) {
      this.showHistory();
    } else {
      this.hideHistory();
    }
  }

  /**
   * Show dialog history
   */
  showHistory() {
    this.dialogHistoryElement.innerHTML = '';
    
    this.dialogHistory.forEach(entry => {
      const historyEntry = document.createElement('div');
      historyEntry.className = 'dialog-history-entry';
      
      const speaker = document.createElement('div');
      speaker.className = 'dialog-history-speaker';
      speaker.textContent = entry.speaker;
      
      const text = document.createElement('div');
      text.className = 'dialog-history-text';
      text.textContent = entry.text;
      
      historyEntry.appendChild(speaker);
      historyEntry.appendChild(text);
      this.dialogHistoryElement.appendChild(historyEntry);
    });
    
    this.dialogHistoryElement.classList.remove('hidden');
  }

  /**
   * Hide dialog history
   */
  hideHistory() {
    this.dialogHistoryElement.classList.add('hidden');
  }

  /**
   * Hide dialog
   */
  hideDialog() {
    this.dialogContainer.classList.remove('visible');
    setTimeout(() => {
      this.dialogContainer.classList.add('hidden');
    }, 300);
    
    this.isVisible = false;
    this.hideHistory();
  }

  /**
   * Close dialog immediately
   */
  closeDialog() {
    console.log('DialogUI: closeDialog called - dispatching DIALOG_ENDED');
    this.dispatcher.dispatch('DIALOG_ENDED');
    
    // Also try to resume the overworld scene directly
    if (window.overworldGame && window.overworldGame.resume) {
      console.log('DialogUI: Force resuming overworld scene');
      window.overworldGame.resume();
    }
  }

  /**
   * Destroy dialog UI
   */
  destroy() {
    if (this.typewriterTimeout) {
      clearTimeout(this.typewriterTimeout);
    }
    
    if (this.dialogContainer && this.dialogContainer.parentNode) {
      this.dialogContainer.parentNode.removeChild(this.dialogContainer);
    }
    
    this.isVisible = false;
  }
}

// Helper function to get character data
function getCharacter(characterId) {
  // This would be imported from characters.js in a real implementation
  return window.CHARACTERS?.[characterId] || null;
}

/**
 * Create and initialize dialog UI
 */
export function createDialogUI(dispatcher) {
  return new DialogUI(dispatcher);
}
