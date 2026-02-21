#!/usr/bin/env python3
"""
Generate base player sprite template for Man-at-Arms.
Style: Medieval top-down, Hotline Miami-inspired clarity.
Resolution: 64x64 per frame
"""

from PIL import Image, ImageDraw
import os

def create_base_sprite():
    """Create a 64x64 base player sprite template."""
    
    # Canvas setup - 64x64 with transparency
    img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Color palette (medieval realistic)
    colors = {
        'skin': (210, 170, 140, 255),
        'chainmail': (120, 120, 130, 255),
        'chainmail_dark': (80, 80, 90, 255),
        'surcoat': (60, 80, 120, 255),  # Blue - player color
        'surcoat_dark': (40, 55, 85, 255),
        'helmet': (90, 90, 100, 255),
        'helmet_highlight': (130, 130, 140, 255),
        'leather': (100, 70, 50, 255),
        'steel': (180, 190, 200, 255),
        'steel_dark': (120, 130, 140, 255),
        'gambeson': (140, 120, 90, 255),  # Padded armor
    }
    
    center_x, center_y = 32, 32
    
    # === BODY (Chainmail + Surcoat) ===
    # Surcoat (tabard) - diamond shape from shoulders to waist
    surcoat_points = [
        (center_x, center_y - 10),  # Neck
        (center_x + 14, center_y + 2),  # Right shoulder
        (center_x + 10, center_y + 18),  # Right waist
        (center_x, center_y + 22),  # Bottom point
        (center_x - 10, center_y + 18),  # Left waist
        (center_x - 14, center_y + 2),  # Left shoulder
    ]
    draw.polygon(surcoat_points, fill=colors['surcoat'])
    draw.polygon(surcoat_points, outline=colors['surcoat_dark'], width=1)
    
    # Chainmail visible at edges (arms, neck gap)
    # Left arm
    draw.ellipse([center_x - 20, center_y - 2, center_x - 8, center_y + 10], 
                 fill=colors['chainmail'], outline=colors['chainmail_dark'])
    # Right arm  
    draw.ellipse([center_x + 8, center_y - 2, center_x + 20, center_y + 10],
                 fill=colors['chainmail'], outline=colors['chainmail_dark'])
    
    # Chainmail texture dots (simple pattern)
    for i in range(-18, -8, 3):
        for j in range(0, 8, 3):
            draw.point([center_x + i, center_y + j], fill=colors['chainmail_dark'])
            draw.point([center_x - i, center_y + j], fill=colors['chainmail_dark'])
    
    # === HEAD (Helmet) ===
    # Helmet base - rounded top
    helmet_rect = [center_x - 10, center_y - 22, center_x + 10, center_y - 2]
    draw.ellipse(helmet_rect, fill=colors['helmet'], outline=colors['helmet_highlight'])
    
    # Helmet nasal guard (center bar)
    draw.rectangle([center_x - 2, center_y - 14, center_x + 2, center_y - 6], 
                   fill=colors['steel_dark'])
    
    # Eye slit
    draw.rectangle([center_x - 6, center_y - 12, center_x + 6, center_y - 8],
                   fill=(20, 20, 20, 255))
    
    # Helmet highlight (top shine)
    draw.arc([center_x - 8, center_y - 20, center_x + 4, center_y - 10],
             start=30, end=150, fill=colors['helmet_highlight'], width=2)
    
    # === HANDS/GLOVES ===
    # Left hand (holding shield)
    draw.ellipse([center_x - 22, center_y + 6, center_x - 14, center_y + 14],
                 fill=colors['leather'], outline=(60, 40, 30, 255))
    
    # Right hand (holding weapon)
    draw.ellipse([center_x + 14, center_y + 6, center_x + 22, center_y + 14],
                 fill=colors['leather'], outline=(60, 40, 30, 255))
    
    # === LEGS (Partial, top-down view) ===
    # Thighs visible below surcoat
    # Left leg
    draw.ellipse([center_x - 10, center_y + 18, center_x - 2, center_y + 30],
                 fill=colors['chainmail'], outline=colors['chainmail_dark'])
    # Right leg
    draw.ellipse([center_x + 2, center_y + 18, center_x + 10, center_y + 30],
                 fill=colors['chainmail'], outline=colors['chainmail_dark'])
    
    # === EQUIPMENT ===
    # Shield on left arm (heater shield shape)
    shield_points = [
        (center_x - 24, center_y + 2),   # Top left
        (center_x - 14, center_y + 2),   # Top right
        (center_x - 14, center_y + 14),  # Mid right
        (center_x - 19, center_y + 22),  # Bottom point
        (center_x - 24, center_y + 14),  # Mid left
    ]
    draw.polygon(shield_points, fill=colors['surcoat_dark'], outline=colors['steel'])
    # Shield boss (metal center)
    draw.ellipse([center_x - 22, center_y + 8, center_x - 16, center_y + 14],
                 fill=colors['steel'], outline=colors['steel_dark'])
    
    # Weapon handle (sword) in right hand
    draw.rectangle([center_x + 18, center_y - 4, center_x + 22, center_y + 16],
                   fill=colors['leather'], outline=(60, 40, 30, 255))
    # Crossguard
    draw.rectangle([center_x + 14, center_y - 6, center_x + 26, center_y - 2],
                   fill=colors['steel'], outline=colors['steel_dark'])
    # Blade (pointing up, ready position)
    blade_points = [
        (center_x + 18, center_y - 6),
        (center_x + 22, center_y - 6),
        (center_x + 24, center_y - 28),
        (center_x + 16, center_y - 28),
    ]
    draw.polygon(blade_points, fill=colors['steel'], outline=colors['steel_dark'])
    # Blade shine
    draw.line([(center_x + 19, center_y - 8), (center_x + 18, center_y - 24)],
              fill=(220, 230, 240, 255), width=1)
    
    # === SHADOW ===
    # Ground shadow (ellipse beneath feet)
    shadow = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.ellipse([center_x - 14, center_y + 24, center_x + 14, center_y + 34],
                        fill=(0, 0, 0, 60))
    
    # Composite shadow under character
    img = Image.alpha_composite(shadow, img)
    
    return img

def create_attack_frame_1(base):
    """Frame 1: Windup - sword drawn back, preparing to strike."""
    img = base.copy()
    draw = ImageDraw.Draw(img)
    
    colors = {
        'steel': (180, 190, 200, 255),
        'steel_dark': (120, 130, 140, 255),
        'leather': (100, 70, 50, 255),
    }
    
    center_x, center_y = 32, 32
    
    # Clear right arm area for redraw
    draw.rectangle([center_x + 8, center_y - 10, center_x + 30, center_y + 20],
                   fill=(0, 0, 0, 0))
    
    # Extended right arm (winding back)
    draw.ellipse([center_x + 6, center_y - 4, center_x + 18, center_y + 8],
                 fill=(120, 120, 130, 255), outline=(80, 80, 90, 255))
    
    # Sword held back, angled up-right
    # Handle
    draw.rectangle([center_x + 24, center_y - 8, center_x + 28, center_y + 12],
                   fill=colors['leather'])
    # Crossguard
    draw.rectangle([center_x + 20, center_y - 10, center_x + 32, center_y - 6],
                   fill=colors['steel'], outline=colors['steel_dark'])
    # Blade pointing up-right
    blade_points = [
        (center_x + 24, center_y - 10),
        (center_x + 28, center_y - 10),
        (center_x + 36, center_y - 30),
        (center_x + 32, center_y - 32),
    ]
    draw.polygon(blade_points, fill=colors['steel'], outline=colors['steel_dark'])
    
    return img

def create_attack_frame_2(base):
    """Frame 2: Strike - sword swinging forward."""
    img = base.copy()
    draw = ImageDraw.Draw(img)
    
    colors = {
        'steel': (180, 190, 200, 255),
        'steel_dark': (120, 130, 140, 255),
        'leather': (100, 70, 50, 255),
        'surcoat': (60, 80, 120, 255),
    }
    
    center_x, center_y = 32, 32
    
    # Clear right side
    draw.rectangle([center_x, center_y - 20, center_x + 40, center_y + 25],
                   fill=(0, 0, 0, 0))
    
    # Torso twisted (surcoat redraw with rotation hint)
    # This is a simplified representation - full rotation needs proper art
    draw.ellipse([center_x + 2, center_y - 2, center_x + 16, center_y + 10],
                 fill=(120, 120, 130, 255), outline=(80, 80, 90, 255))
    
    # Sword extended forward in swing
    # Handle in hand
    draw.rectangle([center_x + 18, center_y + 4, center_x + 22, center_y + 24],
                   fill=colors['leather'])
    # Crossguard
    draw.rectangle([center_x + 14, center_y + 2, center_x + 26, center_y + 6],
                   fill=colors['steel'], outline=colors['steel_dark'])
    # Blade horizontal strike
    blade_points = [
        (center_x + 16, center_y + 2),
        (center_x + 20, center_y + 2),
        (center_x + 44, center_y - 4),
        (center_x + 44, center_y - 8),
        (center_x + 20, center_y - 2),
        (center_x + 16, center_y - 2),
    ]
    draw.polygon(blade_points, fill=colors['steel'], outline=colors['steel_dark'])
    # Motion blur/speed line
    draw.line([(center_x + 24, center_y - 3), (center_x + 40, center_y - 6)],
              fill=(200, 210, 220, 180), width=2)
    
    return img

def create_walk_frame(base, offset_x, offset_y):
    """Create a walking frame with body offset."""
    # Simple implementation: shift the sprite slightly
    img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    img.paste(base, (offset_x, offset_y))
    return img

def main():
    """Generate all base templates."""
    output_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Create base idle sprite
    print("Generating base sprite template...")
    base = create_base_sprite()
    base.save(os.path.join(output_dir, 'template_idle.png'))
    print(f"  Saved: template_idle.png")
    
    # Create attack frames
    print("Generating attack frames...")
    attack_1 = create_attack_frame_1(base)
    attack_1.save(os.path.join(output_dir, 'template_attack_01_windup.png'))
    print(f"  Saved: template_attack_01_windup.png")
    
    attack_2 = create_attack_frame_2(base)
    attack_2.save(os.path.join(output_dir, 'template_attack_02_strike.png'))
    print(f"  Saved: template_attack_02_strike.png")
    
    # Create simple walk bob frames
    print("Generating walk frames...")
    walk_1 = create_walk_frame(base, 0, 0)
    walk_1.save(os.path.join(output_dir, 'template_walk_01.png'))
    print(f"  Saved: template_walk_01.png")
    
    walk_2 = create_walk_frame(base, 0, -2)  # Bob up
    walk_2.save(os.path.join(output_dir, 'template_walk_02.png'))
    print(f"  Saved: template_walk_02.png")
    
    print("\nTemplate generation complete!")
    print("These are BASE TEMPLATES - import into Aseprite/PyxelEdit for refinement.")
    print("Recommended next steps:")
    print("  1. Import templates into Aseprite")
    print("  2. Add proper shading and detail")
    print("  3. Create full 8-directional rotation set")
    print("  4. Animate with proper timing (attack: 8 frames @ 12fps)")

if __name__ == '__main__':
    main()
