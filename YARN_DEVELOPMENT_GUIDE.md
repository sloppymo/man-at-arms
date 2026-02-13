# Yarn Files Development Guide

## Overview
Yarn Spinner is a narrative scripting language designed for interactive fiction and game dialogue. This guide covers Yarn file syntax, common issues, best practices, and integration with YarnBound for web-based games.

## File Structure

### Basic Yarn File Format
```
title: StoryTitle
---
== node_name
Content and dialogue here.
-> Option 1
    Response to option 1
    <<jump next_node>>
-> Option 2
    Response to option 2
    <<jump other_node>>

== next_node
More content...
===
```

### Key Components
- **Title**: Story identifier (required)
- **Nodes**: Story sections marked with `== node_name`
- **Content**: Dialogue and narrative text
- **Options**: Player choices marked with `->`
- **Commands**: Special instructions in `<<command>>` format
- **Jumps**: Navigation between nodes with `<<jump node_name>>`

## Syntax Reference

### Node Structure
```yarn
title: MyStory
---
== start
Welcome to the story!
-> Continue
    <<jump introduction>>

== introduction
This is the introduction.
-> Next
    <<jump chapter1>>
===
```

### Options and Choices
```yarn
What do you do?
-> "I attack the goblin"
    You swing your sword!
    <<jump combat>>
-> "I try to talk to it"
    The goblin seems confused.
    <<jump dialogue>>
-> "I run away"
    You flee into the forest.
    <<jump escape>>
```

### Commands
```yarn
<<showImage background/forest.jpg>>
<<advanceTime 30>>
<<addItem sword, 1>>
<<changeStat health, -1>>
<<set $player_name = "Hero">>
```

### Variables
```yarn
<<set $gold = 100>>
<<set $health = $health - 10>>

Player has {$gold} gold coins.

<<if $health > 50>>
You feel strong and healthy.
<<else>>
You're feeling weak.
<<endif>>
```

### Conditional Options
```yarn
<<if $has_key>>
-> "Use the key"
    You unlock the door.
    <<jump unlocked>>
<<endif>>

-> "Leave"
    You walk away.
    <<jump exit>>
```

## Common Issues & Fixes

### Issue 1: Story Ends Immediately (`{isDialogueEnd: true}`)
**Symptoms:** Story loads but immediately ends without showing content
**Causes:**
- Incorrect choice syntax (`*` instead of `->`)
- Missing start node
- Malformed node structure
- Commands without proper spacing

**Fix:**
```yarn
# ❌ Wrong - uses * syntax
* "Choice 1"
* "Choice 2"

# ✅ Correct - uses -> with jumps
-> "Choice 1"
    <<jump node1>>
-> "Choice 2"
    <<jump node2>>
```

### Issue 2: Choices Not Appearing
**Symptoms:** Dialogue shows but no choice buttons
**Causes:**
- Wrong option format
- Missing jump commands
- Options not properly indented
- Story ending before choice point

**Fix:**
```yarn
# ❌ Wrong - no jumps
-> "Choice 1"
-> "Choice 2"

# ✅ Correct - with jumps
-> "Choice 1"
    <<jump choice1_result>>
-> "Choice 2"
    <<jump choice2_result>>
```

### Issue 3: Commands Not Executing
**Symptoms:** `<<command>>` instructions ignored
**Causes:**
- Incorrect command syntax
- Missing command handlers
- Wrong parameter format

**Fix:**
```yarn
# ✅ Correct command syntax
<<showImage background/forest.jpg>>
<<advanceTime 30>>
<<addItem sword, 1>>
<<changeStat health, -5>>
<<set $variable = "value">>
```

### Issue 4: Node Navigation Issues
**Symptoms:** Can't jump between nodes
**Causes:**
- Wrong node names in jumps
- Missing node definitions
- Case sensitivity issues

**Fix:**
```yarn
# ✅ Correct node jumping
== start
-> Continue
    <<jump introduction>>

== introduction  # Node name must match jump target
Content here.
===
```

### Issue 5: Variable Issues
**Symptoms:** Variables not working or persisting
**Causes:**
- Wrong variable syntax
- Missing variable initialization
- Scope issues

**Fix:**
```yarn
# ✅ Correct variable syntax
<<set $gold = 100>>
<<set $health = $health - 10>>

Player has {$gold} gold.
```

## YarnBound Integration

### Setup
```javascript
import { YarnBound } from 'yarn-bound';

const runner = new YarnBound({
  dialogue: yarnText,
  startAt: 'Start',
  handleCommand: (cmd, ...args) => {
    // Handle custom commands
    switch(cmd) {
      case 'showImage':
        showImage(args[0]);
        break;
      case 'advanceTime':
        advanceTime(parseInt(args[0]));
        break;
      case 'addItem':
        addItem(args[0], parseInt(args[1]));
        break;
    }
  },
  variableStorage: {
    get: (name) => gameState.variables[name],
    set: (name, value) => gameState.variables[name] = value
  }
});
```

### Result Types
- **TextResult**: `{ text: "dialogue text" }`
- **OptionsResult**: `{ text: "dialogue text", options: [{ text: "choice", isAvailable: true }] }`
- **CommandResult**: `{ command: "commandName", parameters: [...] }`

### Runner Methods
- `runner.advance()` - Progress story
- `runner.currentResult` - Get current story state
- `runner.canContinue` - Check if more content available

## Best Practices

### Story Structure
1. **Use descriptive node names**
   ```yarn
   == merchant_encounter_start  # Good
   == node1                    # Bad
   ```

2. **Keep nodes focused and concise**
   ```yarn
   == merchant_greeting
   "Welcome to my shop!"

   == merchant_options
   -> "Buy items"
   -> "Sell items"
   -> "Leave"
   ```

3. **Use consistent formatting**
   ```yarn
   # Consistent indentation
   -> "Choice"
       Response text here.
       <<jump next_node>>
   ```

### Command Usage
1. **Document custom commands**
   ```javascript
   // Available commands:
   // <<showImage path>> - Display background image
   // <<advanceTime minutes>> - Advance game time
   // <<addItem item, count>> - Add items to inventory
   // <<changeStat stat, amount>> - Modify character stats
   ```

2. **Validate command parameters**
   ```javascript
   handleCommand(cmd, ...args) {
     switch(cmd) {
       case 'addItem':
         if (args.length !== 2) {
           console.error('addItem requires item and count');
           return;
         }
         addItem(args[0], parseInt(args[1]));
         break;
     }
   }
   ```

### Variable Management
1. **Use consistent naming**
   ```yarn
   <<set $player_health = 100>>
   <<set $player_gold = 50>>
   ```

2. **Initialize variables**
   ```javascript
   const initialVariables = {
     player_health: 100,
     player_gold: 0,
     player_name: "Hero"
   };
   ```

3. **Handle undefined variables**
   ```javascript
   variableStorage: {
     get: (name) => gameState.variables[name] || 0,
     set: (name, value) => gameState.variables[name] = value
   }
   ```

## Testing & Debugging

### Common Debug Steps
1. **Check console for errors**
   - Story loading failures
   - Command execution errors
   - Variable access issues

2. **Verify story structure**
   ```javascript
   console.log('Story loaded:', yarnText.length, 'characters');
   console.log('Start node exists:', yarnText.includes('== start'));
   ```

3. **Test individual nodes**
   ```javascript
   // Manually advance and check results
   runner.advance();
   console.log('Current result:', runner.currentResult);
   ```

4. **Validate choice availability**
   ```javascript
   if (result.options) {
     result.options.forEach((opt, i) => {
       console.log(`Option ${i}: ${opt.text} (available: ${opt.isAvailable})`);
     });
   }
   ```

### Debug Commands
```javascript
// Check current story state
window.debugYarn = () => {
  console.log('Runner state:', window.narrativeService.runner);
  console.log('Current result:', window.narrativeService.runner.currentResult);
  console.log('Can continue:', window.narrativeService.runner.canContinue);
};

// Force advance story
window.advanceYarn = () => {
  window.narrativeService.runner.advance();
  window.narrativeService.updateUIFromCurrentResult();
};
```

## Integration Checklist

### Before Deploying Stories
- [ ] All nodes have valid names
- [ ] All jumps target existing nodes
- [ ] Choice syntax uses `->` not `*`
- [ ] Commands are properly formatted
- [ ] Variables are properly scoped
- [ ] Story has a valid start node
- [ ] No orphaned nodes

### Testing Checklist
- [ ] Story loads without errors
- [ ] All choices appear as buttons
- [ ] Commands execute correctly
- [ ] Variables persist properly
- [ ] Navigation works between nodes
- [ ] End conditions work properly

## Migration Guide

### From Old Ink Format
If migrating from Ink format:

1. **Convert choice syntax**
   ```ink
   * Choice 1
   * Choice 2
   ```
   ```yarn
   -> "Choice 1"
       <<jump choice1>>
   -> "Choice 2"
       <<jump choice2>>
   ```

2. **Convert commands**
   ```ink
   ~ showImage("background.jpg")
   ```
   ```yarn
   <<showImage background.jpg>>
   ```

3. **Update variable syntax**
   ```ink
   VAR gold = 100
   {gold}
   ```
   ```yarn
   <<set $gold = 100>>
   {$gold}
   ```

## Troubleshooting Quick Reference

| Issue | Symptom | Likely Cause | Solution |
|-------|---------|--------------|----------|
| Story ends immediately | `{isDialogueEnd: true}` | Wrong choice syntax | Use `->` with `<<jump>>` |
| No choices appear | Dialog shows but no buttons | Options not formatted correctly | Check indentation and jumps |
| Commands ignored | No effect from `<<command>>` | Wrong syntax or missing handler | Verify command format and handlers |
| Variables not working | Values don't persist | Wrong variable syntax | Use `$variable` format |
| Node not found | Story crashes on jump | Wrong node name | Check node names match exactly |

## Resources

- **Official Documentation**: https://docs.yarnspinner.dev
- **Try Yarn Online**: https://try.yarnspinner.dev
- **GitHub Repository**: https://github.com/YarnSpinnerTool/YarnSpinner
- **Community Discord**: https://discord.gg/yarnspinner

## Version Notes

This guide covers Yarn Spinner v2.x syntax and YarnBound integration for web applications. Syntax may vary slightly between versions.
