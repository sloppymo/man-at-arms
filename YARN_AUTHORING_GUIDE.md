# Yarn Spinner Authoring Rules for Man-at-Arms

## Overview

This document outlines the rules and best practices for authoring narrative content in Yarn Spinner format for the Man-at-Arms RPG. The narrative system uses `yarn-bound` runtime for story execution.

## Basic Yarn Syntax

### Node Structure
Every story segment is called a "node" and follows this structure:

```yarn
title: MyNodeName
---
Content goes here...

-> "Choice text"
    <<jump NextNode>>

===
```

**Rules:**
- Node titles should be descriptive and unique
- Use `---` to start node content
- Use `===` to end each node
- Keep node titles in PascalCase or snake_case

### Choices and Navigation

```yarn
-> "Choice text"
    <<jump TargetNode>>
```

**Rules:**
- Choices must be on their own line
- `<<jump TargetNode>>` must be on its own line inside the choice block
- Indent jump commands with 4 spaces
- Always use `<<jump>>`, never `->` for navigation within choices

## Commands for Game Integration

Use Yarn commands to interact with the game world:

### Time and State Management
```yarn
<<advanceTime 30>>          // Advance time by 30 minutes
<<changeStat "strength" 1>> // Modify character stat
<<addHeat 5>>               // Increase raid heat level
```

### Inventory and Items
```yarn
<<addItem "sword" 1>>       // Add item to inventory
<<consumeSupply "food" 2>>  // Consume supplies
```

### Combat and Encounters
```yarn
<<triggerCombat "bandits">>     // Start combat encounter
<<triggerSkirmish "ambush">>    // Start skirmish encounter
```

### UI and Presentation
```yarn
<<showImage "artwork/scene.jpg">>  // Display background image
<<wait 2.0>>                       // Pause typewriter for 2 seconds (Yarn built-in)
```

### Special Commands
```yarn
<<pause>>                          // Prevent lookahead, require explicit user advance (yarn-bound special)
```

**Rules:**
- Commands must be on their own lines
- Use quotes around string arguments with spaces
- Numbers don't need quotes

## Built-in vs Special Commands

**Yarn Spinner Built-ins:**
- `<<wait seconds>>` - Pause typewriter animation for specified duration
- `<<stop>>` - End the story

**yarn-bound Specials:**
- `<<pause>>` - Prevent lookahead side-effects, require explicit user advancement
- Use `<<pause>>` before conditionals that depend on variables set by preceding commands
- Distinct from `<<wait>>` - pause affects story flow, wait affects UI timing only
- All commands start with `<<` and end with `>>`

## Variables and Conditions

### Variable Access
Yarn variables are prefixed with `$` in conditions:

```yarn
<<if $stats.strength > 10>>
-> "Try the strong approach"
    <<jump CombatPath>>
<<endif>>

<<if $overworld.heat < 50>>
-> "Sneak quietly"
    <<jump StealthPath>>
<<endif>>
```

**Variable Mapping:**
- `$stats.strength` → `gameState.stats.strength`
- `$overworld.heat` → `gameState.overworld.heat`
- `$stats.charisma` → `gameState.stats.charisma`

**Rules:**
- Always use `$` prefix in Yarn code
- Variables are automatically synced with game state
- Unknown variables return 0

## Unavailable Options Behavior

**Design Choice: Hide Unavailable Options**

When an option has `isAvailable: false`, the UI **hides** the option completely rather than showing it as disabled. This creates a cleaner interface where players only see valid choices available to them.

**Rationale:**
- Reduces cognitive load by removing irrelevant options
- Maintains narrative flow without visual clutter
- Matches common RPG design patterns where invalid choices aren't presented

**Alternative:** Some Yarn implementations show disabled options with visual indicators (grayed out, strikethrough). If you prefer this behavior, modify the DialogUI to render disabled options instead of filtering them.

## Conditional Options - Canonical Pattern

**Use Inline Conditional Options for Simple Cases**

```yarn
-> "Intimidate" <<if $stats.strength > 8>>
    <<jump IntimidatePath>>

-> "Persuade" <<if $stats.charisma > 10>>
    <<jump PersuadePath>>

-> "Default choice"
    <<jump DefaultPath>>
```

**Use Block Conditionals for Complex Logic**

```yarn
<<if $stats.charisma > 12>>
-> "Sweet talk the guard"
    <<changeStat "reputation" 1>>
-> "Fight your way out"
    <<triggerCombat "guard">>
<<endif>>
```

**Rationale:**
- Inline conditionals keep simple logic readable
- Block conditionals handle complex branching clearly
- Consistent pattern reduces authoring errors

## Conditional Blocks

Use inline conditionals for simple cases:

```yarn
-> "Intimidate" <<if $stats.strength > 8>>
    <<jump IntimidatePath>>

-> "Persuade" <<if $stats.charisma > 10>>
    <<jump PersuadePath>>
```

Or use block conditionals for complex logic:

```yarn
<<if $stats.charisma > 12>>
-> "Sweet talk the guard"
    <<changeStat "reputation" 1>>
    <<jump SweetTalk>>

<<elseif $stats.strength > 10>>
-> "Bribe the guard"
    <<changeStat "wealth" -5>>
    <<jump Bribe>>

<<else>>
-> "Fight your way out"
    <<triggerCombat "guard">>
<<endif>>
```

## Lookahead Prevention

If you set variables immediately before conditionals, add `<<pause>>` to prevent lookahead issues:

```yarn
<<resolveAction "charisma" 12 0>>
<<pause>>
{
<<if $success>>
"Success! The guard lets you pass."
<<jump Pass>>
<<if $failure>>
"The guard is suspicious and calls for backup."
<<jump Combat>>
}
```

**When to use `<<pause>>`:**
- After commands that set variables used in immediate conditionals
- Before complex conditional blocks
- When command side-effects might interfere with variable evaluation

## File Organization

### Directory Structure
```
stories/
├── overworld/
│   ├── town_square_quest.yarn
│   ├── forest_test.yarn
│   └── castle_gate_delivery.yarn
├── chevauchee/
│   ├── 00_arrival.yarn
│   ├── 01_march_events.yarn
│   └── 02_raid_encounters.yarn
└── test_story.yarn
```

### Naming Conventions
- Use descriptive filenames
- Group related stories in subdirectories
- Use numbers for sequential stories (00_, 01_, etc.)
- End all files with `.yarn`

## Testing and Validation

### Smoke Testing
Run `npm run smoke-test` to validate:
- All stories can be loaded
- Basic Yarn syntax is valid
- No critical structural issues

### Manual Testing
- Test all choice paths in development
- Verify variable changes persist correctly
- Check that commands trigger expected game events
- Ensure no infinite loops in story flow

## Common Pitfalls

### ❌ Wrong
```yarn
-> "Choice" -> target  // Don't mix Ink and Yarn syntax
<<jump target>>        // Must be on separate line
"Text <<command>>"     // Commands on same line as text
```

### ✅ Correct
```yarn
-> "Choice"
    <<jump target>>

Text here...
<<command>>
```

### ❌ Avoid
```yarn
<<if $var > 5>>
-> "Choice" <<if $var > 10>>  // Confusing nested conditions
```

### ✅ Better
```yarn
<<if $var > 10>>
-> "Choice"
    <<jump Path>>
<<endif>>
```

## Content Guidelines

### Writing Style
- Keep choice text concise but descriptive
- Use present tense for actions
- Maintain consistent tone and voice
- Include sensory details for immersion

### Balance Considerations
- Ensure multiple viable paths through stories
- Balance difficulty with player skill variables
- Consider replayability through different choices
- Test edge cases (all stats at minimum/maximum)

### Performance
- Keep individual nodes reasonably sized
- Avoid extremely long choice lists
- Use variables efficiently
- Test on target platforms

## Migration from Ink

### Automatic Conversion
The `npm run migrate-stories` script converts Ink files to Yarn format, handling:
- `EXTERNAL` declarations → removed
- `* "Choice" -> target` → `-> "Choice"` + `<<jump target>>`
- `{command(args)}` → `<<command args>>`
- Conditional blocks → `<<if>>`/`<<endif>>`

### Manual Review Required
After migration, manually verify:
- Conditional logic is correct
- Variable references use proper `$` prefix
- Jump targets exist and are spelled correctly
- Command arguments are properly formatted

## Support

For questions about Yarn authoring:
- Reference the [Yarn Spinner documentation](https://docs.yarnspinner.dev)
- Check existing story files for examples
- Run `npm run smoke-test` to catch syntax errors
- Test stories in development mode with debug buttons
