# Player Sprite Creation Workflow

## What You Have Now

| File | Purpose |
|------|---------|
| `template_idle.png` | Base pose, 64x64 foundation |
| `template_walk_01/02.png` | Movement bob frames |
| `template_attack_01_windup.png` | Attack preparation |
| `template_attack_02_strike.png` | Strike pose |
| `man-at-arms-palette.gpl` | Aseprite color palette |
| `preview_*.png` | Scale/ingame visualization |

## Next Steps

### Step 1: Install Aseprite (or Pixelorama)

**Aseprite** (Paid, $20, best option):
```bash
# Option A: Steam
steam install aseprite

# Option B: Build from source
git clone https://github.com/aseprite/aseprite.git
cd aseprite
# Follow build instructions for Linux
```

**Pixelorama** (Free, open source):
```bash
# Flatpak
flatpak install flathub com.orama_interactive.Pixelorama
```

### Step 2: Import Template

1. Open Aseprite
2. File → Open → Select `template_idle.png`
3. Sprite → Color Mode → Indexed (to use palette)
4. File → Import Palette → `man-at-arms-palette.gpl`
5. Save as `player_master.aseprite`

### Step 3: Refine Base Sprite

Your template has the **structure** (pose, proportions, equipment placement). Now add:

- **Shading:** Use 3 tones per color (light/mid/shadow)
- **Detail:** Add chainmail rings, helmet rivets, surcoat folds
- **Outline:** 1px black/dark outline for readability
- **Anti-aliasing:** NO—keep hard edges for pixel art style

**Before/After Check:**
- [ ] Silhouette is clear at 32x32 (50% zoom)
- [ ] Weapon is readable without color
- [ ] Face/eyes visible through helmet slit

### Step 4: Animate

Add frames with these tags:

```
Frame 0-3:   idle (loop)
Frame 4-11:  walk (loop)
Frame 12-19: attack (one-shot)
Frame 20-21: block_start → block_hold (loop)
Frame 22:    block_end
Frame 23-25: hit (one-shot)
Frame 26-33: death (one-shot, stay on last)
```

**Timing (ms per frame):**
| Animation | Duration | FPS |
|-----------|----------|-----|
| idle | 250ms | 4 |
| walk | 125ms | 8 |
| attack | 83ms | 12 |
| block | 100ms | 10 |
| hit | 100ms | 10 |
| death | 150ms | 6 |

### Step 5: Create Directions

Duplicate your SOUTH-facing animations and modify for 8 directions:

**Priority Order:**
1. **SOUTH** (done—base template)
2. **EAST** (side view, facing right)
3. **WEST** (mirror of EAST)
4. **SOUTHEAST** (3/4 view, easier than full side)
5. **SOUTHWEST** (mirror of SE)
6. NORTH/NORTHEAST/NORTHWEST (lower priority)

**EAST View Changes:**
- Show full profile (one eye visible)
- Shield on left arm (away from camera)
- Sword arm more forward
- Legs show depth (one behind other)

### Step 6: Export

In Aseprite:
1. File → Export Sprite Sheet
2. Settings:
   - **Layout:** Horizontal Strip
   - **Padding:** 1px
   - **Format:** PNG
3. Save as `player_spritesheet.png`

Or use the Python export script:
```bash
# First, export frames from Aseprite as individual PNGs to ./frames/
python3 export_spritesheet.py --input-dir ./frames --output ../player_final.png
```

### Step 7: Godot Integration

1. Copy `player_final.png` to `assets/sprites/`
2. In Godot, select the file in FileSystem
3. Import tab → **2D Pixel** preset (nearest neighbor, no filter)
4. Reimport

**Create SpriteFrames:**
```gdscript
# In player scene
@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D

func _ready():
    # Load the spritesheet
    var frames = SpriteFrames.new()
    
    # Add animations (set up in editor, not code)
    # Animation frames should match your Aseprite tags
```

Better: Set up in Godot editor:
1. Create `AnimatedSprite2D` node
2. In SpriteFrames panel: Add animations matching your Aseprite tags
3. For each animation: Add frames, select region from spritesheet
4. Set FPS: idle=4, walk=8, attack=12

### Step 8: Direction Handling

Use **8 Sprite nodes** (one per direction) and show/hide based on facing:

```gdscript
extends CharacterBody2D

@onready var sprites = {
    "S": $Sprites/South,
    "SE": $Sprites/Southeast,
    "E": $Sprites/East,
    # ... etc
}

var facing: String = "S"

func _process(_delta):
    update_facing()
    
func update_facing():
    # Hide all
    for s in sprites.values():
        s.visible = false
    
    # Calculate facing from velocity
    var vel = velocity.normalized()
    var angle = rad_to_deg(vel.angle())
    
    # Snap to 8 directions
    facing = angle_to_direction(angle)
    sprites[facing].visible = true
    
func angle_to_direction(angle: float) -> String:
    # Normalize to 0-360
    angle = fposmod(angle, 360.0)
    
    if angle >= 337.5 or angle < 22.5:
        return "E"
    elif angle >= 22.5 and angle < 67.5:
        return "SE"
    elif angle >= 67.5 and angle < 112.5:
        return "S"
    # ... etc for all 8 directions
    return "S"
```

## Alternative: Hire/Commission

If pixel art isn't your strength, use these templates as **reference material** for an artist:

**What to provide:**
- These template PNGs (shows exact pose/proportions)
- `ART_DIRECTION_GUIDE.md` (color palette, animation specs)
- Reference: "Hotline Miami clarity + Medieval manuscript aesthetic"

**Expected cost:**
- 64x64 base + 8 directions + 6 animations ≈ $200-500 (freelance pixel artist)
- Fiverr/Itch.io pixel artists often do this work

## Quick Test

Want to test the templates RIGHT NOW without art skills?

Use an AI upscaler/enhancer:
```bash
# Install imagemagick if not present
sudo apt install imagemagick

# Upscale 4x with nearest neighbor (keeps pixel look)
convert template_idle.png -filter point -resize 256x256 template_idle_4x.png

# Use this upscaled version temporarily—better than 32x32 placeholder
```

Then in Godot, set texture filter to **Nearest** and scale down:
```gdscript
# Player sprite setup for testing
sprite.texture = load("res://assets/sprites/new_player/template_idle_4x.png")
sprite.scale = Vector2(0.25, 0.25)  # Back to 64x64 visual size
```

## File Structure Target

```
assets/sprites/
├── player/
│   ├── player_spritesheet.png      # Final spritesheet
│   ├── player_spritesheet.png.import
│   └── sources/                    # Aseprite files
│       ├── player_master.aseprite
│       ├── player_east.aseprite
│       ├── player_southeast.aseprite
│       └── ...
├── enemy/
│   └── (same structure, palette swap)
└── effects/
    └── (blood, sparks, etc)
```

## Success Criteria

Your sprites are ready when:

- [ ] **Readable:** At 50% scale (32x32), silhouette is distinct
- [ ] **Animated:** All 6 core animations present
- [ ] **Directional:** At least 4 directions (S, E, W, SE/SW)
- [ ] **Consistent:** Same style across all frames
- [ ] **Game-ready:** Properly imported in Godot with correct FPS

---

**Start here:** Open `template_idle.png` in Aseprite and add shading/detail. That's the foundation everything builds from.
