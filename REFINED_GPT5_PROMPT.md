# 🎭 Refined GPT-5.2 Content Creation Prompt for "A Man-At-Arms' Life"

## 🎯 Your Mission
Create immersive, historically authentic narrative content for a medieval military RPG using Ink.js. Write three complete story files that replace placeholder content with rich, choice-driven narratives.

## 🏰 Game Context
- **Setting**: 1415, Hundred Years' War, Henry V's French campaign
- **Player Role**: Man-at-arms serving English lords
- **Tone**: Gritty realism, immersive first-person, historically authentic

## 📁 Files to Create

### 1. Character Creation: js/ink/ink-stories/character-creation.json
**Target**: 6-step immersive character creation (500-800 words total)

### 2. Main Campaign: js/ink/ink-stories/main.json
**Target**: 4 major chapters with branching paths (1000-1500 words per chapter)

### 3. Training Scenes: js/ink/ink-stories/training.json
**Target**: Progressive skill development scenarios (300-500 words per training type)

## 🔧 Technical Requirements (STRICT)

### JSON Structure (MUST FOLLOW EXACTLY)
```json
{
  "inkVersion": 19,
  "root": [
    [
      "Your story content here with * [choices] and ~ variables",
      null
    ]
  ]
}
```

### Available External Functions
- `EXTERNAL applyStatChange(stat, amount)` - Modify character stats
- `EXTERNAL formatCurrency(pence)` - Display money properly
- `EXTERNAL resolveAction(stat, difficulty, bonus)` - Skill checks
- `EXTERNAL triggerCombat(enemyId)` - Start battles
- `EXTERNAL addCondition(name, type, duration)` - Add status effects

### Game Variables You Can Use
**Character Info**: `characterName`, `ageRange`, `background`, `patronId` 
**Core Stats**: `strength`, `agility`, `endurance`, `charisma`, `wits`, `luck` 
**Resources**: `wealth`, `reputation`, `morale`, `stress`, `experience`, `patronFavor` 

### Ink Syntax Commands
- **Choices**: `* [Choice text]` - Player decisions
- **Variables**: `~ variableName = "value"` - Track story state
- **Conditionals**: `{stat > 5 : You feel strong}` - Dynamic text

## 📖 Content Requirements

### Character Creation (6 Steps)
**Step 1**: Welcome + Name (1415 context, why you're here)
**Step 2**: Age Selection (Young 18-25, Prime 26-35, Veteran 36-45)
**Step 3**: Background Choice:
- `rural_peasant` - Strong but poor, high endurance
- `manor_retainer` - Balanced stats, some wealth
- `craftsman_apprentice` - High wits, skilled with hands
- `squire` - Good equipment, high reputation
- `minor_noble` - Wealthy but inexperienced
**Step 4**: Priority Selection (which stat gets +3 bonus)
**Step 5**: Patron Selection:
- `james_olooney` - "The Reaver" - brutal, high risk/reward
- `lord_david` - Fair commander, steady rewards
- `duke_caley` - Powerful lord, expendable but rich
- `count_charles` - "The Grim" - drunk but brilliant
- `ashkhan` - Mamluk mercenary, professional
**Step 6**: Character summary + final confirmation

### Main Campaign (4 Chapters)
**Chapter 1: The March Begins** (`chevauchée`)
- Scavenging vs. honorable conduct
- Interactions with local peasants
- First combat encounters
- Equipment maintenance decisions

**Chapter 2: Siege of Calais**
- Siege warfare choices
- Camp life and morale
- Opportunities for plunder
- Relationship building with comrades

**Chapter 3: Plague and Hardship**
- Disease outbreak management
- Resource scarcity decisions
- Moral dilemmas about survival
- Leadership challenges

**Chapter 4: Battle of Poitiers**
- Tactical combat decisions
- Heroic vs. survival choices
- Leadership opportunities
- Battle aftermath consequences

### Training Scenes (5 Types)
**Sword Training**: Strength/agility focus, combat tutorials
**Archery Practice**: Agility/wits focus, skill progression
**Formation Training**: Endurance/charisma focus, tactical learning
**Camp Life Skills**: Survival, maintenance, social skills
**Equipment Preparation**: Wealth/luck focus, resource management

## 🎭 Writing Style Guide

### Voice & Tone
- **First-person present**: "You grip your sword..."
- **Medieval authenticity**: Use appropriate terms but stay accessible
- **Gritty realism**: War is brutal, not romanticized
- **Sensory details**: Blood, mud, fear, camaraderie

### Choice Design
- **Meaningful consequences**: Each choice affects stats or story
- **Character consistency**: Choices should reflect background
- **Risk/reward balance**: Some choices dangerous with high payoff
- **Clear implications**: Player should understand choice impact

## ✨ Quality Standards

### Narrative Excellence
- **Engaging opening**: Hook player immediately
- **Emotional depth**: Fear, hope, doubt, triumph
- **Character development**: Growth through choices
- **Memorable moments**: Scenes players remember

### Technical Excellence
- **Valid JSON**: Must parse correctly
- **Proper Ink syntax**: No syntax errors
- **Stat integration**: All choices affect game state
- **External function calls**: Use available functions appropriately

---

**Key improvements in this refined prompt:**
- More concise and actionable
- Clear technical requirements upfront
- Specific content structure for each file
- Focused writing style guidelines
- Emphasis on historical authenticity and player choice consequences

This refined prompt is designed to help GPT-5.2 create high-quality, integrated narrative content that works seamlessly with your existing Ink.js implementation.
