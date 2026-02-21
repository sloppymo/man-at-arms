#!/usr/bin/env python3
"""
Generate 8-directional player sprites from base template.
Directions: N, NE, E, SE, S, SW, W, NW

Strategy:
- SOUTH: Use enhanced_idle.png as base
- NORTH: Mirror/flip with helmet back view
- EAST: Side profile (most work)
- WEST: Flip of EAST
- Diagonals: Blend between cardinals
"""

from PIL import Image, ImageDraw
import os

def create_south():
    """SOUTH: Front view - our enhanced base."""
    return Image.open('enhanced_idle.png')

def create_north(south_img):
    """NORTH: Back view - surcoat back, helmet rear."""
    img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    cx, cy = 32, 32
    
    # Colors
    c = {
        'mail': (140, 140, 150),
        'mail_shadow': (80, 80, 90),
        'blue': (60, 80, 120),
        'blue_shadow': (28, 43, 65),
        'leather': (120, 80, 50),
        'outline': (30, 30, 35),
    }
    
    # Shadow
    draw.ellipse([cx-14, cy+26, cx+14, cy+34], fill=(0, 0, 0, 50))
    
    # Legs
    draw.ellipse([cx-10, cy+18, cx-2, cy+28], fill=c['mail_shadow'], outline=c['outline'])
    draw.ellipse([cx+2, cy+18, cx+10, cy+28], fill=c['mail'], outline=c['outline'])
    
    # Surcoat BACK (no shield/sword visible from behind)
    surcoat = [
        (cx, cy-8),      
        (cx+12, cy+2),    
        (cx+9, cy+16),    
        (cx, cy+20),      
        (cx-9, cy+16),    
        (cx-12, cy+2),    
    ]
    draw.polygon(surcoat, fill=c['blue'], outline=c['outline'])
    
    # Surcoat folds/crease down center
    draw.line([(cx, cy-6), (cx, cy+18)], fill=c['blue_shadow'], width=1)
    
    # Arms (hanging at sides, holding weapon behind)
    draw.ellipse([cx-18, cy, cx-10, cy+10], fill=c['mail_shadow'], outline=c['outline'])
    draw.ellipse([cx+10, cy, cx+18, cy+10], fill=c['mail'], outline=c['outline'])
    
    # Gloves
    draw.ellipse([cx-20, cy+8, cx-12, cy+16], fill=c['leather'], outline=c['outline'])
    draw.ellipse([cx+12, cy+8, cx+20, cy+16], fill=c['leather'], outline=c['outline'])
    
    # Helmet BACK (round dome, no face visible)
    draw.ellipse([cx-9, cy-22, cx+9, cy-4], fill=c['mail'], outline=c['outline'])
    # Helmet shine on back
    draw.arc([cx-7, cy-20, cx+3, cy-10], 30, 150, fill=(160, 160, 170), width=2)
    
    return img

def create_east():
    """EAST: Side view facing right - full profile."""
    img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    cx, cy = 32, 32
    
    # Colors
    c = {
        'skin': (210, 170, 140),
        'skin_shadow': (178, 138, 110),
        'mail': (140, 140, 150),
        'mail_mid': (110, 110, 120),
        'mail_shadow': (80, 80, 90),
        'blue': (60, 80, 120),
        'blue_mid': (44, 60, 92),
        'blue_shadow': (28, 43, 65),
        'steel': (180, 190, 200),
        'steel_mid': (140, 150, 160),
        'steel_shadow': (100, 110, 120),
        'leather': (120, 80, 50),
        'leather_shadow': (80, 55, 35),
        'helmet': (100, 100, 110),
        'outline': (30, 30, 35),
    }
    
    # Shadow
    draw.ellipse([cx-8, cy+26, cx+16, cy+34], fill=(0, 0, 0, 50))
    
    # Legs (one behind, one forward)
    # Back leg (left, darker)
    draw.ellipse([cx-6, cy+18, cx+2, cy+28], fill=c['mail_shadow'], outline=c['outline'])
    # Front leg (right, lighter)
    draw.ellipse([cx+2, cy+18, cx+10, cy+28], fill=c['mail'], outline=c['outline'])
    
    # Surcoat - side view (narrower, shows profile)
    surcoat = [
        (cx+2, cy-10),    # Shoulder top
        (cx+10, cy+2),    # Shoulder front
        (cx+8, cy+18),    # Waist front
        (cx+2, cy+22),    # Bottom point
        (cx-4, cy+16),    # Waist back
        (cx-2, cy-2),     # Shoulder back
    ]
    draw.polygon(surcoat, fill=c['blue'], outline=c['outline'])
    
    # Surcoat shading
    draw.polygon([
        (cx+2, cy-8),
        (cx+8, cy+2),
        (cx+6, cy+16),
        (cx+2, cy+20),
        (cx-2, cy+14),
        (cx, cy),
    ], fill=c['blue_mid'])
    
    # Arm (right arm forward, holding sword prominently)
    draw.ellipse([cx+8, cy-2, cx+18, cy+10], fill=c['mail'], outline=c['outline'])
    # Chainmail texture
    for i in range(10, 16, 2):
        for j in range(0, 8, 2):
            draw.point([cx+i, cy+j], fill=c['mail_mid'])
    
    # Glove (on right hand)
    draw.ellipse([cx+16, cy+6, cx+24, cy+14], fill=c['leather'], outline=c['outline'])
    
    # Sword (prominent in side view, pointing forward/up)
    # Handle
    draw.rectangle([cx+20, cy+2, cx+23, cy+18], fill=c['leather_shadow'], outline=c['outline'])
    # Crossguard
    draw.rectangle([cx+16, cy+0, cx+27, cy+4], fill=c['steel'], outline=c['outline'])
    # Blade (pointing up and slightly forward)
    blade = [
        (cx+19, cy+0),
        (cx+24, cy+0),
        (cx+26, cy-24),
        (cx+17, cy-24),
    ]
    draw.polygon(blade, fill=c['steel'], outline=c['outline'])
    # Blade fuller
    draw.polygon([
        (cx+20, cy-2),
        (cx+23, cy-2),
        (cx+24, cy-22),
        (cx+19, cy-22),
    ], fill=c['steel_mid'])
    # Blade shine
    draw.line([(cx+20, cy-4), (cx+18, cy-22)], fill=(220, 230, 240), width=1)
    
    # Shield (on back/left side, partially visible)
    shield = [
        (cx-8, cy+4),
        (cx-2, cy+4),
        (cx-2, cy+12),
        (cx-5, cy+18),
        (cx-8, cy+12),
    ]
    draw.polygon(shield, fill=c['blue_shadow'], outline=c['outline'])
    draw.ellipse([cx-7, cy+8, cx-3, cy+12], fill=c['steel_shadow'], outline=c['outline'])
    
    # Helmet - side profile
    draw.ellipse([cx, cy-22, cx+10, cy-4], fill=c['helmet'], outline=c['outline'])
    # Helmet highlight
    draw.arc([cx+2, cy-20, cx+8, cy-10], 30, 150, fill=(130, 130, 140), width=2)
    # Visor slit (side view - narrow)
    draw.rectangle([cx+6, cy-14, cx+10, cy-10], fill=(20, 20, 25), outline=c['outline'])
    # Nasal guard (side)
    draw.rectangle([cx+4, cy-16, cx+6, cy-8], fill=c['steel_shadow'], outline=c['outline'])
    
    # Face hint (nose/chin visible under helmet)
    draw.ellipse([cx+2, cy-10, cx+6, cy-6], fill=c['skin_shadow'], outline=c['outline'])
    
    return img

def create_west(east_img):
    """WEST: Mirror of EAST."""
    return east_img.transpose(Image.FLIP_LEFT_RIGHT)

def create_southeast():
    """SOUTHEAST: 3/4 view between SOUTH and EAST."""
    img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    cx, cy = 32, 32
    
    # Colors
    c = {
        'skin': (210, 170, 140),
        'mail': (140, 140, 150),
        'mail_mid': (110, 110, 120),
        'mail_shadow': (80, 80, 90),
        'blue': (60, 80, 120),
        'blue_mid': (44, 60, 92),
        'blue_shadow': (28, 43, 65),
        'steel': (180, 190, 200),
        'steel_mid': (140, 150, 160),
        'steel_shadow': (100, 110, 120),
        'leather': (120, 80, 50),
        'helmet': (100, 100, 110),
        'outline': (30, 30, 35),
    }
    
    # Shadow
    draw.ellipse([cx-10, cy+26, cx+14, cy+34], fill=(0, 0, 0, 50))
    
    # Legs (angled)
    draw.ellipse([cx-8, cy+18, cx, cy+28], fill=c['mail_shadow'], outline=c['outline'])
    draw.ellipse([cx+2, cy+18, cx+10, cy+28], fill=c['mail_mid'], outline=c['outline'])
    
    # Surcoat - 3/4 view
    surcoat = [
        (cx+2, cy-10),
        (cx+12, cy+1),
        (cx+9, cy+17),
        (cx+2, cy+21),
        (cx-8, cy+16),
        (cx-10, cy+1),
    ]
    draw.polygon(surcoat, fill=c['blue'], outline=c['outline'])
    draw.polygon([
        (cx+1, cy-8),
        (cx+9, cy+1),
        (cx+7, cy+15),
        (cx+1, cy+19),
        (cx-6, cy+14),
        (cx-8, cy+1),
    ], fill=c['blue_mid'])
    
    # Left arm (shield side, back)
    draw.ellipse([cx-18, cy-1, cx-10, cy+9], fill=c['mail_shadow'], outline=c['outline'])
    # Shield - 3/4 view (slightly angled)
    shield = [
        (cx-22, cy+3),
        (cx-14, cy+3),
        (cx-14, cy+11),
        (cx-18, cy+18),
        (cx-22, cy+11),
    ]
    draw.polygon(shield, fill=c['blue_shadow'], outline=c['outline'])
    draw.ellipse([cx-20, cy+7, cx-16, cy+11], fill=c['steel_mid'], outline=c['outline'])
    
    # Right arm (sword side, forward)
    draw.ellipse([cx+8, cy-1, cx+17, cy+9], fill=c['mail'], outline=c['outline'])
    
    # Glove
    draw.ellipse([cx+15, cy+5, cx+22, cy+12], fill=c['leather'], outline=c['outline'])
    
    # Sword - angled forward
    draw.rectangle([cx+18, cy-2, cx+21, cy+14], fill=c['leather'], outline=c['outline'])
    draw.rectangle([cx+14, cy-4, cx+25, cy-1], fill=c['steel'], outline=c['outline'])
    # Blade angled SE
    blade = [
        (cx+17, cy-4),
        (cx+22, cy-4),
        (cx+32, cy-20),
        (cx+27, cy-22),
    ]
    draw.polygon(blade, fill=c['steel'], outline=c['outline'])
    draw.line([(cx+19, cy-6), (cx+28, cy-20)], fill=c['steel_mid'], width=1)
    
    # Helmet - 3/4 view
    draw.ellipse([cx-6, cy-22, cx+9, cy-4], fill=c['helmet'], outline=c['outline'])
    # Visor angled
    draw.polygon([
        (cx, cy-14),
        (cx+8, cy-12),
        (cx+8, cy-8),
        (cx, cy-10),
    ], fill=(20, 20, 25), outline=c['outline'])
    # Nasal guard
    draw.rectangle([cx-1, cy-16, cx+2, cy-8], fill=c['steel_shadow'], outline=c['outline'])
    
    return img

def create_southwest(se_img):
    """SOUTHWEST: Mirror of SOUTHEAST."""
    return se_img.transpose(Image.FLIP_LEFT_RIGHT)

def create_northeast():
    """NORTHEAST: Back 3/4 view."""
    img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    cx, cy = 32, 32
    
    c = {
        'mail': (140, 140, 150),
        'mail_shadow': (80, 80, 90),
        'blue': (60, 80, 120),
        'blue_shadow': (28, 43, 65),
        'leather': (120, 80, 50),
        'steel': (180, 190, 200),
        'outline': (30, 30, 35),
    }
    
    # Shadow
    draw.ellipse([cx-8, cy+26, cx+14, cy+34], fill=(0, 0, 0, 50))
    
    # Legs
    draw.ellipse([cx-6, cy+18, cx+2, cy+28], fill=c['mail_shadow'], outline=c['outline'])
    draw.ellipse([cx+4, cy+18, cx+12, cy+28], fill=c['mail'], outline=c['outline'])
    
    # Surcoat back 3/4
    surcoat = [
        (cx+2, cy-8),
        (cx+11, cy+2),
        (cx+8, cy+16),
        (cx+2, cy+20),
        (cx-6, cy+14),
        (cx-8, cy+2),
    ]
    draw.polygon(surcoat, fill=c['blue'], outline=c['outline'])
    draw.line([(cx+2, cy-6), (cx+2, cy+18)], fill=c['blue_shadow'], width=1)
    
    # Arms (both hanging back)
    draw.ellipse([cx-16, cy, cx-8, cy+9], fill=c['mail_shadow'], outline=c['outline'])
    draw.ellipse([cx+10, cy, cx+18, cy+9], fill=c['mail'], outline=c['outline'])
    
    # Shield (on left side, partially visible)
    shield = [
        (cx-10, cy+4),
        (cx-4, cy+4),
        (cx-4, cy+11),
        (cx-7, cy+16),
        (cx-10, cy+11),
    ]
    draw.polygon(shield, fill=c['blue_shadow'], outline=c['outline'])
    
    # Sword (hanging back on right)
    draw.rectangle([cx+16, cy+6, cx+19, cy+18], fill=c['leather'], outline=c['outline'])
    draw.rectangle([cx+13, cy+4, cx+22, cy+7], fill=c['steel'], outline=c['outline'])
    # Blade pointing back/up
    blade = [
        (cx+16, cy+4),
        (cx+19, cy+4),
        (cx+22, cy-14),
        (cx+17, cy-14),
    ]
    draw.polygon(blade, fill=c['steel'], outline=c['outline'])
    
    # Helmet back 3/4
    draw.ellipse([cx-5, cy-22, cx+9, cy-5], fill=c['mail'], outline=c['outline'])
    draw.arc([cx-3, cy-20, cx+7, cy-10], 30, 150, fill=(160, 160, 170), width=2)
    
    return img

def create_northwest(ne_img):
    """NORTHWEST: Mirror of NORTHEAST."""
    return ne_img.transpose(Image.FLIP_LEFT_RIGHT)

def main():
    """Generate all 8 directions."""
    output_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("Generating 8-directional sprites...")
    print()
    
    # SOUTH (base)
    print("Creating SOUTH (front view)...")
    south = create_south()
    south.save(os.path.join(output_dir, 'dir_south.png'))
    print("  ✓ dir_south.png")
    
    # NORTH (back)
    print("Creating NORTH (back view)...")
    north = create_north(south)
    north.save(os.path.join(output_dir, 'dir_north.png'))
    print("  ✓ dir_north.png")
    
    # EAST (side)
    print("Creating EAST (side view, facing right)...")
    east = create_east()
    east.save(os.path.join(output_dir, 'dir_east.png'))
    print("  ✓ dir_east.png")
    
    # WEST (mirror of east)
    print("Creating WEST (side view, facing left)...")
    west = create_west(east)
    west.save(os.path.join(output_dir, 'dir_west.png'))
    print("  ✓ dir_west.png")
    
    # SOUTHEAST (3/4 front)
    print("Creating SOUTHEAST (3/4 front right)...")
    se = create_southeast()
    se.save(os.path.join(output_dir, 'dir_southeast.png'))
    print("  ✓ dir_southeast.png")
    
    # SOUTHWEST (mirror of SE)
    print("Creating SOUTHWEST (3/4 front left)...")
    sw = create_southwest(se)
    sw.save(os.path.join(output_dir, 'dir_southwest.png'))
    print("  ✓ dir_southwest.png")
    
    # NORTHEAST (3/4 back)
    print("Creating NORTHEAST (3/4 back right)...")
    ne = create_northeast()
    ne.save(os.path.join(output_dir, 'dir_northeast.png'))
    print("  ✓ dir_northeast.png")
    
    # NORTHWEST (mirror of NE)
    print("Creating NORTHWEST (3/4 back left)...")
    nw = create_northwest(ne)
    nw.save(os.path.join(output_dir, 'dir_northwest.png'))
    print("  ✓ dir_northwest.png")
    
    print()
    print("=" * 50)
    print("All 8 directions generated!")
    print()
    print("Next steps:")
    print("  1. Review each direction PNG")
    print("  2. Run upscale_directions.py to AI-upscale 4x")
    print("  3. Import to Aseprite for polish")
    print("  4. Create animation frames for each direction")

if __name__ == '__main__':
    main()
