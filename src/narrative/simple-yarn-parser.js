/**
 * Simple Yarn Parser - Alternative to YarnBound
 * Handles basic Yarn syntax for choice-based narratives
 */
export default class SimpleYarnParser {
  constructor(dialogueText) {
    this.dialogueText = dialogueText;
    this.nodes = {};
    this.currentNode = null;
    this.variables = {};
    this.commandHistory = [];

    this.parse();
  }

  parse() {
    const lines = this.dialogueText.split('\n');
    let currentNode = null;
    let currentContent = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('title:')) {
        // Skip title
        continue;
      } else if (line === '---') {
        // Start of node content
        continue;
      } else if (line.startsWith('== ')) {
        // Save previous node
        if (currentNode && currentContent.length > 0) {
          this.nodes[currentNode] = currentContent.join('\n');
        }

        // Start new node
        currentNode = line.substring(3).trim();
        currentContent = [];
      } else if (line === '===') {
        // End of node
        if (currentNode && currentContent.length > 0) {
          this.nodes[currentNode] = currentContent.join('\n');
        }
        currentNode = null;
        currentContent = [];
      } else if (currentNode) {
        // Add content to current node
        currentContent.push(line);
      }
    }

    // Save last node
    if (currentNode && currentContent.length > 0) {
      this.nodes[currentNode] = currentContent.join('\n');
    }
  }

  startAt(nodeName) {
    if (this.nodes[nodeName]) {
      this.currentNode = nodeName;
      return this.getCurrentResult();
    }
    throw new Error(`Node "${nodeName}" not found`);
  }

  advance(choiceIndex = 0) {
    const content = this.nodes[this.currentNode];
    if (!content) return null;

    const lines = content.split('\n');
    const choices = [];
    let text = '';

    // Parse content for text and choices
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('-> ')) {
        // Found a choice
        const choiceText = line.substring(3).trim();
        let jumpTarget = null;

        // Check if next line is a jump
        if (i + 1 < lines.length && lines[i + 1].trim().startsWith('<<jump ')) {
          const jumpLine = lines[i + 1].trim();
          jumpTarget = jumpLine.match(/<<jump (.+?)>>/)?.[1];
          i++; // Skip the jump line
        }

        choices.push({
          text: choiceText,
          jumpTarget: jumpTarget,
          isAvailable: true
        });
      } else if (!line.startsWith('<<') && line.length > 0) {
        // Regular text
        if (text) text += '\n';
        text += line;
      }
    }

    if (choices.length > 0) {
      // Has choices - return options result
      return {
        text: text,
        options: choices.map((choice, index) => ({
          text: choice.text,
          isAvailable: choice.isAvailable,
          index: index
        })),
        hasChoices: true
      };
    } else {
      // No choices - story continues or ends
      const hasMoreContent = lines.some(line => line.trim() && !line.startsWith('<<'));
      const isEnd = !hasMoreContent;
      
      if (isEnd) {
        // End of story, add goodbye choice
        return {
          text: text,
          options: [{
            text: "Goodbye",
            isAvailable: true,
            index: 0
          }],
          hasChoices: true
        };
      } else {
        // Story continues
        return {
          text: text,
          hasChoices: false,
          isEnd: false
        };
      }
    }
  }

  advanceWithChoice(choiceIndex) {
    const result = this.advance();
    if (result && result.options && result.options[choiceIndex]) {
      const choice = result.options[choiceIndex];
      const originalChoice = this.getChoicesFromCurrentNode()[choiceIndex];

      if (originalChoice && originalChoice.jumpTarget) {
        this.currentNode = originalChoice.jumpTarget;
      }
    }
    return this.advance();
  }

  getChoicesFromCurrentNode() {
    const content = this.nodes[this.currentNode];
    if (!content) return [];

    const lines = content.split('\n');
    const choices = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('-> ')) {
        const choiceText = line.substring(3).trim();
        let jumpTarget = null;

        if (i + 1 < lines.length && lines[i + 1].trim().startsWith('<<jump ')) {
          const jumpLine = lines[i + 1].trim();
          jumpTarget = jumpLine.match(/<<jump (.+?)>>/)?.[1];
          i++;
        }

        choices.push({
          text: choiceText,
          jumpTarget: jumpTarget,
          isAvailable: true
        });
      }
    }

    return choices;
  }

  getCurrentResult() {
    return this.advance();
  }

  canContinue() {
    return !this.getCurrentResult()?.isEnd;
  }
}
