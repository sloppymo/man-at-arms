# Man-at-Arms: Player Sprite Art Direction

## Style Reference

**Primary:** Hotline Miami clarity + Medieval manuscript aesthetic  
**Secondary:** Nuclear Throne readability, Enter the Gungeon detail density

## Technical Specs

| Spec | Value |
|------|-------|
| Base Resolution | 64x64px per frame |
| Animation FPS | 12 fps (combat), 8 fps (idle) |
| Color Depth | Index color, 32-color palette max |
| Outline | 1px black/dark outline on all sprites |

## Color Palette: "Man-at-Arms"

```
Player Blue (Surcoat):     #3C5078 / #283755 (shadow)
Chainmail Grey:           #787882 / #505A5A (shadow)  
Steel Silver:            #B4BEC8 / #78828C (shadow)
Leather Brown:           #644632 / #3C2A1E (shadow)
Skin Tone:               #D2AA8C / #B08A6E (shadow)
Helmet Dark:             #5A5A64 / #32323C (shadow)
Blood Red:               #8C2A2A / #5A1A1A (shadow)
Gold Accent:             #C8A43C / #8C7028 (shadow)
```

## Animation Sets Required

### 1. IDLE (4 frames, loop)
- Breathing animation - chest expands/contracts
- Weapon sways slightly
- Head bobs with breath
- **Timing:** 0.25s per frame (slow, alive)

### 2. WALK (8 frames, loop)
- Purposeful stride - medieval combat walk
- Shield stays stable, weapon arm swings
- Body bob: -2px to +0px
- Footwork visible (boots)
- **Timing:** 0.08s per frame

### 3. ATTACK (8 frames, one-shot)
```
Frame 1-2:  Windup     - Sword draws back, body twists
Frame 3-4:  Commit     - Weight shifts forward
Frame 5-6:  Strike     - Sword arc FLASH FRAME (white trail)
Frame 7-8:  Recovery   - Follow-through, return to stance
```
- **Timing:** 0.06s per frame (fast, impactful)
- **Arc Indicator:** 1-frame white/silver weapon trail on frame 5-6

### 4. BLOCK (4 frames, holdable)
- Frame 1: Shield raise (fast, 0.1s)
- Frame 2-3: Hold position (loopable)
- Frame 4: Shield drop (fast, 0.1s)

### 5. HIT REACT (3 frames, one-shot)
- Frame 1: Impact - blood spray, body jerks
- Frame 2: Stagger - body leans away from hit
- Frame 3: Recovery - returning to stance

### 6. DEATH (8 frames, one-shot, then static)
- Frame 1-2: Collapse begins
- Frame 3-4: Falling (ragdoll physics hint)
- Frame 5-6: Ground impact
- Frame 7-8: Still corpse (loop final frame)

## Directional System (8-Way)

Use the template as "SOUTH" facing, then create:

```
NORTH  - Back view (surcoat back, helmet rear)
NORTHEAST - 3/4 back right
EAST  - Side view (facing right)
SOUTHEAST - 3/4 front right
SOUTH - Front view (template base)
SOUTHWEST - 3/4 front left (mirror of SE)
WEST  - Side view (facing left, mirror of E)
NORTHWEST - 3/4 back left (mirror of NE)
```

**Priority Order:** (Do these first)
1. SOUTH (front) - Most common combat view
2. EAST/WEST (side) - Movement visibility
3. SOUTHEAST/SOUTHWEST - Angled combat
4. NORTH (back) - Running away
5. NORTHEAST/NORTHWEST - Rare

## Aseprite Workflow

### Setup
1. Create new file: 64x64, RGB color mode
2. Load palette: Import `man-at-arms-palette.gpl`
3. Grid: 64x64, no gap

### Animation Tags
```
idle (0-3, loop)
walk (4-11, loop)  
attack (12-19, ping-pong if needed)
block_start (20)
block_hold (21-22, loop)
block_end (23)
hit (24-26)
death (27-34)
```

### Export Settings
- **Sprite Sheet:** Horizontal strip, 1px padding
- **Format:** PNG-8 indexed (if possible) or PNG-24
- **Scale:** 1x (game scales up if needed)

## Quality Checklist

- [ ] Readable at 32x32 (50% scale)
- [ ] Silhouette is distinct (test by filling black)
- [ ] Animation reads clearly at 12fps
- [ ] Weapon arc is visible in attack
- [ ] Shield position is consistent across anims
- [ ] Color count under 32 per frame

## Enemy Variations (Same Template)

Apply palette swaps for enemy types:

| Enemy | Surcoat Color | Helmet Style |
|-------|---------------|--------------|
| Grunt | #783C3C (Red) | Open faced |
| Heavy | #3C783C (Green) | Great helm |
| Archer| #785A3C (Brown) | Cap with nose guard |
