// ============================================
// Dialog System
// Core dialog tree management with branching choices and consequences
// ============================================

import { EVENT_TYPES } from '../core/dispatcher.js';

/**
 * Dialog Node class representing a single dialog entry
 */
class DialogNode {
  constructor(id, data) {
    this.id = id;
    this.character = data.character || null;
    this.text = data.text || '';
    this.portrait = data.portrait || null;
    this.emotion = data.emotion || 'neutral';
    this.choices = data.choices || [];
    this.conditions = data.conditions || [];
    this.consequences = data.consequences || [];
    this.nextNode = data.nextNode || null;
    this.isEntry = data.isEntry || false;
  }

  /**
   * Check if this node can be accessed based on conditions
   */
  canAccess(gameState) {
    return this.conditions.every(condition => {
      switch (condition.type) {
        case 'stat':
          const statValue = gameState.stats[condition.stat] || 0;
          return this.compareValue(statValue, condition.operator, condition.value);
        case 'relationship':
          const relValue = gameState.relationships?.[condition.character] || 0;
          return this.compareValue(relValue, condition.operator, condition.value);
        case 'flag':
          return gameState.flags?.[condition.flag] === condition.value;
        case 'item':
          return gameState.inventory?.includes(condition.item);
        default:
          return true;
      }
    });
  }

  /**
   * Compare values for condition checking
   */
  compareValue(actual, operator, expected) {
    switch (operator) {
      case 'gte': return actual >= expected;
      case 'lte': return actual <= expected;
      case 'gt': return actual > expected;
      case 'lt': return actual < expected;
      case 'eq': return actual === expected;
      case 'neq': return actual !== expected;
      default: return true;
    }
  }

  /**
   * Apply consequences when this node is visited
   */
  applyConsequences(gameState, dispatcher) {
    this.consequences.forEach(consequence => {
      switch (consequence.type) {
        case 'stat_change':
          dispatcher.dispatch(EVENT_TYPES.STAT_CHANGE, {
            stat: consequence.stat,
            delta: consequence.value,
            source: 'dialog'
          });
          break;
        case 'relationship_change':
          if (!gameState.relationships) gameState.relationships = {};
          gameState.relationships[consequence.character] = 
            (gameState.relationships[consequence.character] || 0) + consequence.value;
          break;
        case 'flag':
          if (!gameState.flags) gameState.flags = {};
          gameState.flags[consequence.flag] = consequence.value;
          break;
        case 'add_item':
          if (!gameState.inventory) gameState.inventory = [];
          gameState.inventory.push(consequence.item);
          break;
        case 'remove_item':
          if (gameState.inventory) {
            const index = gameState.inventory.indexOf(consequence.item);
            if (index > -1) gameState.inventory.splice(index, 1);
          }
          break;
        case 'trigger_event':
          dispatcher.dispatch(consequence.event, consequence.payload || {});
          break;
      }
    });
  }

  /**
   * Get available choices based on conditions
   */
  getAvailableChoices(gameState) {
    return this.choices.filter(choice => {
      if (!choice.conditions) return true;
      return choice.conditions.every(condition => {
        switch (condition.type) {
          case 'stat':
            const statValue = gameState.stats[condition.stat] || 0;
            return this.compareValue(statValue, condition.operator, condition.value);
          case 'relationship':
            const relValue = gameState.relationships?.[condition.character] || 0;
            return this.compareValue(relValue, condition.operator, condition.value);
          default:
            return true;
        }
      });
    });
  }
}

/**
 * Dialog Tree class managing conversation flow
 */
class DialogTree {
  constructor(dialogData) {
    this.nodes = new Map();
    this.currentNodeId = null;
    this.history = [];
    this.variables = {};
    
    this.parseDialogData(dialogData);
  }

  /**
   * Parse dialog data and create nodes
   */
  parseDialogData(data) {
    Object.entries(data.nodes).forEach(([id, nodeData]) => {
      const node = new DialogNode(id, nodeData);
      this.nodes.set(id, node);
      
      if (node.isEntry) {
        this.currentNodeId = id;
      }
    });
  }

  /**
   * Get the current dialog node
   */
  getCurrentNode() {
    return this.nodes.get(this.currentNodeId);
  }

  /**
   * Move to a specific node
   */
  moveToNode(nodeId, gameState, dispatcher) {
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    if (!node.canAccess(gameState)) {
      console.warn(`Cannot access node ${nodeId}: conditions not met`);
      return false;
    }

    // Add to history
    this.history.push({
      nodeId: this.currentNodeId,
      timestamp: Date.now()
    });

    this.currentNodeId = nodeId;
    
    // Apply consequences
    node.applyConsequences(gameState, dispatcher);

    return true;
  }

  /**
   * Make a choice and move to the corresponding node
   */
  makeChoice(choiceIndex, gameState, dispatcher) {
    const currentNode = this.getCurrentNode();
    if (!currentNode) return false;

    const availableChoices = currentNode.getAvailableChoices(gameState);
    if (choiceIndex < 0 || choiceIndex >= availableChoices.length) {
      return false;
    }

    const choice = availableChoices[choiceIndex];
    
    // Apply choice consequences
    if (choice.consequences) {
      choice.consequences.forEach(consequence => {
        switch (consequence.type) {
          case 'stat_change':
            dispatcher.dispatch(EVENT_TYPES.STAT_CHANGE, {
              stat: consequence.stat,
              delta: consequence.value,
              source: 'dialog_choice'
            });
            break;
          case 'relationship_change':
            if (!gameState.relationships) gameState.relationships = {};
            gameState.relationships[consequence.character] = 
              (gameState.relationships[consequence.character] || 0) + consequence.value;
            break;
        }
      });
    }

    // Move to next node
    if (choice.nextNode) {
      return this.moveToNode(choice.nextNode, gameState, dispatcher);
    }

    return true;
  }

  /**
   * Check if dialog can continue
   */
  canContinue(gameState) {
    const currentNode = this.getCurrentNode();
    if (!currentNode) return false;

    const availableChoices = currentNode.getAvailableChoices(gameState);
    return availableChoices.length > 0 || currentNode.nextNode !== null;
  }

  /**
   * Get dialog history
   */
  getHistory() {
    return this.history.map(entry => ({
      nodeId: entry.nodeId,
      node: this.nodes.get(entry.nodeId),
      timestamp: entry.timestamp
    }));
  }

  /**
   * Reset dialog to entry point
   */
  reset() {
    const entryNode = Array.from(this.nodes.values()).find(node => node.isEntry);
    if (entryNode) {
      this.currentNodeId = entryNode.id;
    }
    this.history = [];
  }
}

/**
 * Dialog System main class
 */
export class DialogSystem {
  constructor(dispatcher, gameState) {
    this.dispatcher = dispatcher;
    this.gameState = gameState;
    this.dialogs = new Map();
    this.currentDialog = null;
    this.isActive = false;

    this.setupEventListeners();
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    this.dispatcher.subscribe('START_DIALOG', (event) => {
      const { dialogId, character } = event.payload;
      this.startDialog(dialogId, character);
    });

    this.dispatcher.subscribe('DIALOG_CHOICE', (event) => {
      const { choiceIndex } = event.payload;
      this.makeChoice(choiceIndex);
    });

    this.dispatcher.subscribe('END_DIALOG', () => {
      this.endDialog();
    });
  }

  /**
   * Load a dialog from data
   */
  loadDialog(dialogId, dialogData) {
    const dialogTree = new DialogTree(dialogData);
    this.dialogs.set(dialogId, dialogTree);
    return dialogTree;
  }

  /**
   * Start a dialog
   */
  startDialog(dialogId, character) {
    const dialog = this.dialogs.get(dialogId);
    if (!dialog) {
      console.error(`Dialog not found: ${dialogId}`);
      return false;
    }

    this.currentDialog = dialog;
    this.isActive = true;

    // Reset dialog to entry point
    dialog.reset();

    // Notify UI
    this.dispatcher.dispatch('DIALOG_STARTED', {
      dialogId,
      character,
      node: dialog.getCurrentNode()
    });

    return true;
  }

  /**
   * Make a choice in the current dialog
   */
  makeChoice(choiceIndex) {
    if (!this.isActive || !this.currentDialog) return false;

    const success = this.currentDialog.makeChoice(choiceIndex, this.gameState, this.dispatcher);
    
    if (success) {
      const currentNode = this.currentDialog.getCurrentNode();
      
      // Notify UI of update with correct data structure
      this.dispatcher.dispatch('DIALOG_UPDATED', {
        text: currentNode.text,
        choices: currentNode.getAvailableChoices(this.gameState).map(choice => ({
          text: choice.text,
          disabled: false
        })),
        canContinue: this.currentDialog.canContinue(this.gameState),
        character: currentNode.character,
        emotion: currentNode.emotion
      });

      // Check if dialog should end
      if (!this.currentDialog.canContinue(this.gameState)) {
        this.endDialog();
      }
    }

    return success;
  }

  /**
   * End the current dialog
   */
  endDialog() {
    if (!this.isActive) return;

    this.isActive = false;
    
    // Notify UI
    this.dispatcher.dispatch('DIALOG_ENDED', {
      history: this.currentDialog?.getHistory() || []
    });

    this.currentDialog = null;
  }

  /**
   * Get current dialog state
   */
  getCurrentState() {
    if (!this.isActive || !this.currentDialog) return null;

    return {
      dialogId: this.currentDialog.dialogId,
      node: this.currentDialog.getCurrentNode(),
      canContinue: this.currentDialog.canContinue(this.gameState),
      history: this.currentDialog.getHistory()
    };
  }

  /**
   * Check if a dialog is active
   */
  isDialogActive() {
    return this.isActive;
  }
}

/**
 * Create dialog system instance
 */
export function createDialogSystem(dispatcher, gameState) {
  return new DialogSystem(dispatcher, gameState);
}

// ============================================
// Backward Compatibility
// ============================================

if (typeof window !== 'undefined') {
  window.DialogSystem = DialogSystem;
  window.createDialogSystem = createDialogSystem;
}
