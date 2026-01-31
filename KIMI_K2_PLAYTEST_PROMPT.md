# Comprehensive Playtest Prompt for Kimi K2 Agent
## Man-at-Arms: Interactive Fiction Game Testing & Review

### Game Overview
You are tasked with playtesting and reviewing "Man-at-Arms," an interactive fiction game set during the Hundred Years' War (1337-1453). The game follows a man-at-arms through historical campaigns, battles, and campfire conversations. The writing style is minimalist and McCarthy-esque, emphasizing gritty realism, moral choices, and anti-heroic themes.

**Game Location**: `/home/sloppymo/Documents/man-at-arms/man-at-arms.html`
**Game Type**: Browser-based interactive fiction (HTML/JavaScript)
**Primary Mechanics**: Text-based narrative with stat management, dice rolls, and branching choices

---

## Testing Objectives

### 1. **Functional Testing**
- Verify all scenes load correctly
- Test all choice paths and scene transitions
- Verify stat changes apply correctly
- Test dice roll mechanics and resolution systems
- Check for JavaScript errors in browser console
- Verify inventory and equipment systems work
- Test death/retirement conditions trigger properly
- Verify save/load functionality (if present)

### 2. **Gameplay Balance Testing**
- Test multiple character backgrounds (peasant, merchant, noble)
- Play through different choice paths (duty/mercy/self-interest)
- Verify stat requirements are reasonable
- Test difficulty progression across years (1338-1347)
- Check if wealth accumulation is balanced
- Verify stress/morale systems function meaningfully
- Test condition system (wounded, fatigued, etc.)

### 3. **Writing Quality Review**
- Verify all placeholder text has been replaced
- Check consistency of writing style across all scenes
- Verify McCarthy-esque minimalist style is maintained
- Check for anachronisms or modern language
- Review campfire vignettes for voice consistency
- Verify choice text matches narrative tone
- Check for typos, grammar errors, formatting issues

### 4. **Narrative Coherence**
- Verify story flows logically between scenes
- Check historical accuracy of events and timeline
- Verify character development is consistent
- Test that choices have meaningful consequences
- Review campfire scenes for character voice (Wat, Cook, Oana)
- Check that moral dilemmas are well-presented

### 5. **User Experience (UX)**
- Test game on different screen sizes
- Verify UI elements are clear and functional
- Check stat displays update correctly
- Verify notifications appear appropriately
- Test navigation and scene transitions feel smooth
- Check if game state persists correctly
- Verify any artwork/images load properly

---

## Testing Methodology

### Phase 1: Quick Functional Pass (15-20 minutes)
1. **Open the game** in a browser
2. **Create a character** using each background type (peasant, merchant, noble)
3. **Play through first 3-5 scenes** for each background
4. **Note any immediate bugs**: broken links, missing text, JavaScript errors
5. **Check browser console** for errors or warnings
6. **Test basic mechanics**: stat changes, dice rolls, scene transitions

### Phase 2: Deep Playthrough (30-45 minutes)
1. **Choose one background** (recommend peasant for "typical" experience)
2. **Play through complete campaign** from 1338 to 1347
3. **Make varied choices**: mix of duty, mercy, and self-interest
4. **Test different resolution paths**: success and failure outcomes
5. **Explore campfire scenes**: interact with Wat, Cook, and Oana
6. **Test edge cases**: low stats, high stress, various conditions
7. **Attempt to trigger death/retirement conditions**

### Phase 3: Writing & Narrative Review (20-30 minutes)
1. **Read through scenes systematically** (use ALL_DIALOG_SCENES.txt as reference)
2. **Check for placeholder text**: "Continue...", "Begin...", generic stubs
3. **Review writing style consistency**: sentence structure, vocabulary, tone
4. **Verify historical elements**: dates, locations, events, terminology
5. **Check character voices**: Wat (cynical), Cook (measured), Oana (quiet)
6. **Review choice text**: ensure they match narrative style

### Phase 4: Balance & Progression Testing (15-20 minutes)
1. **Track stat progression** across multiple playthroughs
2. **Test different choice strategies**: pure duty, pure self-interest, balanced
3. **Verify difficulty scaling**: early vs. late game challenges
4. **Check wealth economy**: earning vs. spending opportunities
5. **Test condition management**: wounded, fatigued, shaken effects
6. **Verify patron favor system** functions meaningfully

---

## Specific Areas to Test

### Critical Paths to Verify
1. **Character Creation → First Battle → Winter Quarters**
2. **Training Scenes → Equipment Upgrade → Between Years**
3. **Purveyance Scenes → Channel Crossing → Landing**
4. **Chevauchée → Caen Bridge → Blanchetaque → Crécy**
5. **Calais Siege → Flux → Keys of Calais → End Game**

### Key Scenes to Review
- **Campfire Vignettes** (33 scenes): Verify Wat, Cook, and Oana voices are distinct
- **Battle Scenes**: Crécy, first battle, various skirmishes
- **Moral Choice Scenes**: Purveyance, prisoners, refugees, hostages
- **Transition Scenes**: Between years, equipment upgrades, training
- **Death/Retirement Scenes**: All end-state conditions

### Mechanics to Stress Test
- **Resolution System**: Test with very low stats (should be challenging but not impossible)
- **Stress Accumulation**: Play aggressively to see if stress management is meaningful
- **Wealth Management**: Try both hoarding and spending strategies
- **Condition Stacking**: Test multiple negative conditions simultaneously
- **Flag System**: Verify flags (Dishonor, Hardness, etc.) affect gameplay

---

## Review Criteria

### Writing Style (McCarthy-esque Minimalism)
**Check for:**
- Short, declarative sentences and fragments
- Concrete nouns over abstractions
- Sensory details (smell, sound, texture)
- Understated moral weight
- Anti-heroic perspective
- No modern motivational language
- Period-appropriate vocabulary

**Red Flags:**
- Long, flowery prose
- Explicit emotional exposition
- Modern idioms or phrases
- Generic placeholder text
- Inconsistent voice between scenes

### Gameplay Balance
**Check for:**
- Meaningful choices (not obvious "right" answers)
- Reasonable difficulty curve
- Stats matter but don't gatekeep excessively
- Wealth has value but isn't required for survival
- Consequences feel appropriate to choices
- Multiple viable playstyles

**Red Flags:**
- Impossible stat requirements
- Wealth becomes mandatory
- Choices feel meaningless
- Difficulty spikes dramatically
- One strategy dominates

### Narrative Quality
**Check for:**
- Historical accuracy
- Character consistency
- Logical story progression
- Meaningful consequences
- Thematic coherence
- Emotional resonance

**Red Flags:**
- Anachronisms
- Character voice inconsistencies
- Plot holes or illogical transitions
- Choices with no consequences
- Thematic confusion

---

## Documentation Requirements

### Bug Report Format
For each bug found, document:
1. **Location**: Scene ID or scene name
2. **Steps to Reproduce**: Exact sequence of actions
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Severity**: Critical / High / Medium / Low
6. **Screenshot/Console Log**: If applicable

### Writing Issues Format
For each writing issue, document:
1. **Scene ID**: Which scene has the problem
2. **Issue Type**: Placeholder text / Style inconsistency / Anachronism / Typo / etc.
3. **Specific Text**: Quote the problematic text
4. **Suggested Fix**: How it should be written (if applicable)
5. **Severity**: Breaks immersion / Minor inconsistency / etc.

### Balance Issues Format
For each balance issue, document:
1. **System**: Stats / Wealth / Conditions / Difficulty / etc.
2. **Issue Description**: What feels unbalanced
3. **Evidence**: Specific examples from playthrough
4. **Impact**: How it affects gameplay
5. **Suggested Fix**: How to rebalance (if applicable)

---

## Final Report Structure

### Executive Summary
- Overall assessment (1-2 paragraphs)
- Key strengths
- Critical issues requiring immediate attention
- Recommended priority fixes

### Detailed Findings

#### 1. Functional Issues
- List all bugs found
- JavaScript errors
- Broken mechanics
- Missing content

#### 2. Writing Quality
- Placeholder text remaining (if any)
- Style inconsistencies
- Anachronisms or modern language
- Character voice issues
- Typos/grammar errors

#### 3. Gameplay Balance
- Stat balance issues
- Wealth economy problems
- Difficulty curve concerns
- Choice meaningfulness
- Progression pacing

#### 4. Narrative Coherence
- Story flow issues
- Historical accuracy concerns
- Character development problems
- Thematic inconsistencies

#### 5. User Experience
- UI/UX issues
- Navigation problems
- Clarity concerns
- Accessibility issues

### Recommendations
- Priority fixes (must fix before release)
- Nice-to-have improvements
- Future enhancement suggestions
- Writing style refinements

### Playthrough Summary
- Number of complete playthroughs
- Different paths tested
- Time spent testing
- Notable experiences or moments

---

## Testing Checklist

### Functional Checklist
- [ ] Game loads without errors
- [ ] Character creation works for all backgrounds
- [ ] All scenes transition correctly
- [ ] Stat changes apply properly
- [ ] Dice rolls function correctly
- [ ] Resolution system works (success/failure)
- [ ] Inventory system functions
- [ ] Equipment system works
- [ ] Conditions apply/remove correctly
- [ ] Flags set/unset properly
- [ ] Death conditions trigger
- [ ] Retirement conditions trigger
- [ ] No JavaScript console errors
- [ ] No broken image links
- [ ] Save/load works (if implemented)

### Writing Checklist
- [ ] No placeholder text ("Continue...", "Begin...", etc.)
- [ ] Consistent McCarthy-esque style throughout
- [ ] No anachronisms or modern language
- [ ] Character voices are distinct (Wat, Cook, Oana)
- [ ] Choice text matches narrative tone
- [ ] Historical accuracy maintained
- [ ] No typos or grammar errors
- [ ] Proper formatting (paragraphs, line breaks)
- [ ] Sensory details present
- [ ] Moral weight is understated, not explicit

### Balance Checklist
- [ ] Stats feel meaningful but not restrictive
- [ ] Wealth has value but isn't mandatory
- [ ] Difficulty scales appropriately
- [ ] Choices have meaningful consequences
- [ ] Multiple viable strategies exist
- [ ] Stress/morale systems matter
- [ ] Conditions are impactful but manageable
- [ ] Progression feels rewarding

### Narrative Checklist
- [ ] Story flows logically
- [ ] Character development is consistent
- [ ] Historical events are accurate
- [ ] Timeline makes sense
- [ ] Choices affect story meaningfully
- [ ] Themes are coherent
- [ ] Campfire scenes deepen relationships
- [ ] End states feel appropriate

---

## Special Instructions

### For Kimi K2 Agent:
1. **Open the HTML file directly in a browser** - The game is self-contained
2. **Use browser developer tools** - Check console for errors, inspect elements
3. **Take screenshots** - Document visual issues or interesting moments
4. **Play multiple times** - Different backgrounds, different choice paths
5. **Read carefully** - The writing style is intentionally sparse; don't mistake minimalism for placeholder text
6. **Test edge cases** - Low stats, high stress, multiple conditions
7. **Be thorough** - This is a comprehensive review, not a quick glance

### Important Notes:
- The game uses a minimalist writing style - short sentences and fragments are intentional
- "Continue" as a choice option is fine; "Continue..." as narrative text is a placeholder
- Historical accuracy is important - flag any anachronisms
- The game is anti-heroic - choices should feel morally gray, not clearly right/wrong
- Campfire scenes are character development moments - they should feel intimate and revealing

### Testing Tools:
- Browser: Chrome/Firefox with developer tools
- Console: Check for JavaScript errors
- Network tab: Verify all resources load
- Elements inspector: Check HTML structure if needed

---

## Expected Deliverables

1. **Comprehensive Playtest Report** (detailed findings in the format above)
2. **Bug List** (if any bugs found)
3. **Writing Issues List** (if any issues found)
4. **Balance Analysis** (assessment of game systems)
5. **Recommendations** (prioritized list of fixes/improvements)
6. **Playthrough Notes** (brief summary of testing sessions)

---

## Success Criteria

The playtest is successful if you can:
- ✅ Identify all functional bugs
- ✅ Verify writing quality and consistency
- ✅ Assess gameplay balance
- ✅ Provide actionable feedback
- ✅ Document findings clearly
- ✅ Prioritize issues appropriately

**Begin testing now. Be thorough, be critical, but also appreciate the game's strengths. Document everything systematically.**

---

## Quick Start Commands

If testing via command line or automated tools:
```bash
# Navigate to game directory
cd /home/sloppymo/Documents/man-at-arms

# Open game in browser (if headless testing)
# Or simply open man-at-arms.html in a browser

# Check for syntax errors (basic validation)
grep -n "text:.*Continue\.\.\." man-at-arms.html
grep -n "text:.*Begin\.\.\." man-at-arms.html
grep -n "text:.*Start a New Game\.\.\." man-at-arms.html
```

**Good luck with the playtest!**
