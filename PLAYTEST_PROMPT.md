# Playtest Prompt for GPT 5.2 Background Agent

## Game Information
**Title:** A Man-at-Arms' Life - 100 Years War  
**URL:** https://sloppymo.github.io/man-at-arms/man-at-arms.html  
**Type:** Browser-based text RPG / career simulation game  
**Genre:** Historical fiction, interactive narrative, stat-based progression  
**Inspiration:** "A Legionary's Life" (Roman career sim)

## Your Mission
Play through the game as a test player and provide comprehensive feedback on gameplay, mechanics, narrative, UI/UX, and overall experience. Your goal is to identify what works well, what needs improvement, and what's missing or broken.

## How to Access
1. Open a web browser (Chrome, Firefox, Safari, or Edge)
2. Navigate to: `https://sloppymo.github.io/man-at-arms/man-at-arms.html`
3. The game should load automatically. If you see "Loading..." that persists, note this as a critical bug.

## Playtest Scope

### Phase 1: Character Creation (REQUIRED)
1. **Name Entry:** Enter a character name. Does the input work? Does it persist?
2. **Stat Allocation:** 
   - You have 20 points to distribute across 5 stats (Strength, Agility, Endurance, Charisma, Wits)
   - All stats start at 5, can go up to 10
   - Test edge cases: Can you go below 5? Above 10? What happens if you try to spend more than 20 points? Less than 20?
   - Do the +/- buttons work correctly?
   - Is the "points remaining" counter accurate?
3. **Background Selection:**
   - Test all three backgrounds: Peasant, Merchant, Noble
   - Does selection highlight correctly?
   - Do the bonuses make sense?
4. **Begin Journey Button:**
   - What happens if you click without a name? Without a background? Without spending exactly 20 points?
   - Does it transition correctly to the training scene?

### Phase 2: Early Gameplay (REQUIRED)
1. **Scene Transitions:**
   - After character creation, you should land on a training scene (training_peasant, training_merchant, or training_noble based on background)
   - Does the correct scene load?
   - Does the narrative text make sense?
2. **Choice System:**
   - Click through several choices
   - Do choices have clear consequences?
   - Are stat changes visible?
   - Do choices branch meaningfully?
3. **Stat System:**
   - Watch how stats change
   - Do conditions (Wounded, Fatigued, etc.) apply correctly?
   - Are stat bars updating visually?
4. **Save/Load:**
   - Click "Save Game" button
   - Refresh the page
   - Click "Load Game"
   - Does your progress restore correctly?

### Phase 3: Equipment System (IF AVAILABLE)
1. **Access Equipment UI:**
   - Click the "🛡️ Equipment" button
   - Does the paper-doll inventory open?
2. **Inventory Management:**
   - Can you see starter items?
   - Try dragging items onto the paper doll
   - Does equipment affect stats?
   - Can you unequip items?

### Phase 4: Combat System (IF TRIGGERED)
1. **Combat Triggers:**
   - If you encounter a combat choice, select it
   - Does the combat overlay appear?
   - Does it hide the story correctly?
2. **Combat Mechanics:**
   - Test QTE (Quick Time Event) mechanics
   - Try different actions (Attack, Defend, Shield Bash, etc.)
   - Does fatigue/stance system work?
   - Do enemy attacks work?
   - Can you win/lose combat?
3. **Post-Combat:**
   - Does the game return to narrative correctly?
   - Are combat consequences applied (wounds, stress, etc.)?

### Phase 5: Extended Playthrough (OPTIONAL BUT RECOMMENDED)
1. **Play for at least 5-10 scenes**
2. **Test multiple paths:**
   - Try different choice combinations
   - See if the narrative branches meaningfully
3. **Check for bugs:**
   - Do any scenes fail to load?
   - Are there broken links or missing content?
   - Do stat calculations seem correct?

## Areas to Evaluate

### 1. Narrative & Writing
- **Quality:** Is the writing engaging? Historically accurate? Does it create immersion?
- **Pacing:** Does the story flow well? Are scenes too short/long?
- **Branching:** Do choices create meaningful narrative divergence?
- **Historical Context:** Does the 100 Years War setting come through?

### 2. Gameplay Mechanics
- **Stat System:** Are stats meaningful? Do they affect outcomes noticeably?
- **Resolution System:** When dice rolls/checks occur, do they feel fair? Are difficulties appropriate?
- **Conditions:** Do wounds, fatigue, etc. create interesting tradeoffs?
- **Progression:** Does the character feel like they're developing?

### 3. UI/UX
- **Visual Design:** Is the medieval aesthetic consistent? Is it readable?
- **Layout:** Is information easy to find? Are buttons clearly labeled?
- **Feedback:** Do you understand what's happening? Are stat changes visible?
- **Accessibility:** Can you navigate with keyboard? Is text readable?

### 4. Technical Quality
- **Performance:** Does the game load quickly? Any lag or stuttering?
- **Bugs:** List any errors, broken features, or unexpected behavior
- **Browser Compatibility:** Does it work in your browser?
- **Save/Load:** Does persistence work correctly?

### 5. Balance & Difficulty
- **Challenge:** Is the game too easy/hard?
- **Choices:** Do choices have meaningful consequences?
- **Stats:** Are stat allocations meaningful? Can you "break" the game with min/max?

### 6. Missing Features
- What would you expect to see that's not there?
- What would make the game more engaging?
- Are there obvious gaps in the experience?

## Specific Bugs to Watch For

1. **Character Creation:**
   - Does it get stuck on "Loading..."?
   - Can you bypass validation?
   - Do stat changes persist?

2. **Scene Transitions:**
   - Does "Begin Training" route to the correct scene?
   - Do function-based nextScene values work?
   - Are there any "Scene not found" errors?

3. **State Management:**
   - Do stats persist correctly?
   - Do conditions apply and expire?
   - Does equipment affect gameplay?

4. **Combat Integration:**
   - Does combat trigger from narrative choices?
   - Does it return to narrative correctly?
   - Are combat stats calculated correctly?

## Feedback Format

Please provide your feedback in the following structure:

### Executive Summary
- Overall impression (1-2 paragraphs)
- Would you play this game? Why or why not?
- What's the strongest aspect? Weakest?

### Detailed Findings

#### Narrative & Writing
- [Your observations]

#### Gameplay Mechanics
- [Your observations]

#### UI/UX
- [Your observations]

#### Technical Issues
- [List bugs, errors, broken features]

#### Balance & Design
- [Your observations]

#### Suggestions for Improvement
- [Specific, actionable recommendations]

### Bug Report
- **Critical Bugs:** [List any game-breaking issues]
- **Major Bugs:** [List significant issues that affect gameplay]
- **Minor Bugs:** [List small issues, typos, etc.]

### Playthrough Log
- Document your path: What choices did you make? What happened?
- Note any unexpected outcomes or interesting moments

## Testing Checklist

Before submitting feedback, verify you've tested:

- [ ] Character creation (all steps)
- [ ] Scene transitions (at least 3 scenes)
- [ ] Stat changes and conditions
- [ ] Save/Load functionality
- [ ] Equipment system (if accessible)
- [ ] Combat system (if triggered)
- [ ] Multiple choice paths
- [ ] Browser console for errors (F12)

## Notes

- **Be Honest:** Don't sugarcoat issues, but be constructive
- **Be Specific:** "The stat bars don't update" is better than "UI is broken"
- **Be Actionable:** Suggest fixes, not just problems
- **Consider the Audience:** This is a historical RPG for history buffs - does it serve that audience?

## Submission

After completing your playtest, provide:
1. A comprehensive written report (using the format above)
2. A list of all bugs encountered (with steps to reproduce)
3. Screenshots of any visual issues (if possible)
4. Browser/OS information
5. Overall rating (1-10) with justification

---

**Remember:** The goal is to help make this game better. Your feedback should be thorough, honest, and constructive. Focus on what matters most to players: fun, engagement, and a smooth experience.
