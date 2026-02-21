#!/usr/bin/env python3
"""
Enhance the base template with proper pixel art shading.
This demonstrates the target quality level.
"""

from PIL import Image, ImageDraw

def create_enhanced_idle():
    """Create a polished idle sprite with proper shading."""
    
    img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    cx, cy = 32, 32  # Center
    
    # Refined palette with proper shading
    c = {
        'skin': (210, 170, 140),
        'skin_shadow': (178, 138, 110),
        'mail': (140, 140, 150),
        'mail_mid': (110, 110, 120),
        'mail_shadow': (80, 80, 90),
        'mail_dark': (60, 60, 70),
        'blue': (60, 80, 120),
        'blue_mid': (44, 60, 92),
        'blue_shadow': (28, 43, 65),
        'steel': (180, 190, 200),
        'steel_mid': (140, 150, 160),
        'steel_shadow': (100, 110, 120),
        'leather': (120, 80, 50),
        'leather_shadow': (80, 55, 35),
        'helmet': (100, 100, 110),
        'helmet_mid': (80, 80, 90),
        'helmet_shadow': (60, 60, 70),
        'outline': (30, 30, 35),
    }
    
    def draw_outline(points, color, width=1):
        """Draw shape with outline."""
        draw.polygon(points, fill=color, outline=c['outline'])
    
    # === SHADOW (ground) ===
    draw.ellipse([cx-14, cy+26, cx+14, cy+34], fill=(0, 0, 0, 50))
    
    # === LEGS (back to front for layering) ===
    # Left leg (slightly back)
    draw.ellipse([cx-10, cy+18, cx-2, cy+28], fill=c['mail_shadow'], outline=c['outline'])
    # Right leg (slightly forward)
    draw.ellipse([cx+2, cy+18, cx+10, cy+28], fill=c['mail_mid'], outline=c['outline'])
    # Leg detail - knee
    draw.arc([cx-10, cy+20, cx-2, cy+28], 0, 180, fill=c['mail_dark'], width=1)
    draw.arc([cx+2, cy+20, cx+10, cy+28], 0, 180, fill=c['mail'], width=1)
    
    # === SURCOAT (tabard) - diamond shape ===
    surcoat = [
        (cx, cy-10),      # Neck
        (cx+13, cy+1),    # Right shoulder
        (cx+9, cy+17),    # Right waist
        (cx, cy+21),      # Bottom point
        (cx-9, cy+17),    # Left waist
        (cx-13, cy+1),    # Left shoulder
    ]
    draw_outline(surcoat, c['blue'])
    
    # Surcoat shading - highlight center, shadow edges
    surcoat_inner = [
        (cx, cy-8),
        (cx+10, cy+1),
        (cx+7, cy+16),
        (cx, cy+19),
        (cx-7, cy+16),
        (cx-10, cy+1),
    ]
    draw.polygon(surcoat_inner, fill=c['blue_mid'])
    
    # Center highlight
    draw.polygon([
        (cx, cy-6),
        (cx+6, cy+1),
        (cx, cy+17),
        (cx-6, cy+1),
    ], fill=c['blue'])
    
    # Surcoat fold line
    draw.line([(cx, cy-8), (cx, cy+19)], fill=c['blue_shadow'], width=1)
    
    # === ARMS ===
    # Left arm (holding shield)
    draw.ellipse([cx-19, cy-2, cx-9, cy+9], fill=c['mail_shadow'], outline=c['outline'])
    # Chainmail rings pattern
    for i in range(-17, -10, 2):
        for j in range(0, 7, 2):
            draw.point([cx+i, cy+j], fill=c['mail_dark'])
    
    # Right arm (holding sword)
    draw.ellipse([cx+9, cy-2, cx+19, cy+9], fill=c['mail_mid'], outline=c['outline'])
    for i in range(10, 17, 2):
        for j in range(0, 7, 2):
            draw.point([cx+i, cy+j], fill=c['mail'])
    
    # === GLOVES ===
    # Left glove
    draw.ellipse([cx-22, cy+5, cx-14, cy+13], fill=c['leather_shadow'], outline=c['outline'])
    # Right glove
    draw.ellipse([cx+14, cy+5, cx+22, cy+13], fill=c['leather'], outline=c['outline'])
    
    # === SHIELD (heater) ===
    shield = [
        (cx-24, cy+2),    # Top left
        (cx-15, cy+2),    # Top right
        (cx-15, cy+12),   # Mid right
        (cx-19, cy+20),   # Bottom point
        (cx-24, cy+12),   # Mid left
    ]
    draw_outline(shield, c['blue_shadow'])
    
    # Shield border
    shield_border = [
        (cx-23, cy+3),
        (cx-16, cy+3),
        (cx-16, cy+11),
        (cx-19, cy+18),
        (cx-23, cy+11),
    ]
    draw.polygon(shield_border, fill=c['steel_shadow'])
    
    # Shield boss (metal dome)
    draw.ellipse([cx-22, cy+7, cx-16, cy+13], fill=c['steel'], outline=c['outline'])
    draw.ellipse([cx-21, cy+8, cx-17, cy+11], fill=c['steel_mid'])
    draw.point([cx-20, cy+9], fill=c['steel_shadow'])
    
    # === SWORD ===
    # Handle in right hand
    draw.rectangle([cx+18, cy-3, cx+21, cy+15], fill=c['leather'], outline=c['outline'])
    # Handle wrap detail
    for y in range(0, 16, 3):
        draw.line([(cx+18, cy+y), (cx+21, cy+y)], fill=c['leather_shadow'], width=1)
    
    # Crossguard
    draw.rectangle([cx+14, cy-5, cx+25, cy-2], fill=c['steel'], outline=c['outline'])
    # Guard highlights
    draw.line([(cx+15, cy-4), (cx+24, cy-4)], fill=c['steel_mid'], width=1)
    
    # Blade
    blade = [
        (cx+17, cy-5),
        (cx+22, cy-5),
        (cx+23, cy-26),
        (cx+16, cy-26),
    ]
    draw_outline(blade, c['steel'])
    
    # Blade fuller (groove) - darker center
    fuller = [
        (cx+18, cy-7),
        (cx+21, cy-7),
        (cx+22, cy-24),
        (cx+17, cy-24),
    ]
    draw.polygon(fuller, fill=c['steel_mid'])
    
    # Blade shine (edge highlight)
    draw.line([(cx+17, cy-6), (cx+16, cy-25)], fill=(220, 230, 240), width=1)
    draw.line([(cx+22, cy-6), (cx+23, cy-25)], fill=c['steel_shadow'], width=1)
    
    # === HELMET ===
    # Main dome
    draw.ellipse([cx-9, cy-22, cx+9, cy-3], fill=c['helmet'], outline=c['outline'])
    
    # Helmet shading - highlight top, shadow bottom
    draw.ellipse([cx-8, cy-21, cx+8, cy-10], fill=c['helmet_mid'])
    draw.ellipse([cx-7, cy-20, cx+5, cy-12], fill=c['helmet'])
    draw.ellipse([cx-6, cy-19, cx+3, cy-14], fill=(130, 130, 140))
    
    # Eye slit (visor)
    draw.rectangle([cx-6, cy-13, cx+6, cy-9], fill=(20, 20, 25), outline=c['outline'])
    # Slit highlights (reflection)
    draw.line([(cx-5, cy-12), (cx+5, cy-12)], fill=(60, 60, 70), width=1)
    
    # Nasal guard
    draw.rectangle([cx-2, cy-15, cx+2, cy-7], fill=c['steel_shadow'], outline=c['outline'])
    draw.line([(cx-1, cy-14), (cx-1, cy-8)], fill=c['steel'], width=1)
    
    return img

def create_enhanced_attack_frame():
    """Create an enhanced attack strike frame."""
    
    # Start with enhanced idle and modify
    img = create_enhanced_idle()
    draw = ImageDraw.Draw(img)
    
    cx, cy = 32, 32
    
    # Clear right side for attack pose
    draw.rectangle([cx+5, cy-30, cx+40, cy+30], fill=(0, 0, 0, 0))
    
    # Colors
    c = {
        'mail': (140, 140, 150),
        'mail_mid': (110, 110, 120),
        'mail_shadow': (80, 80, 90),
        'blue': (60, 80, 120),
        'blue_mid': (44, 60, 92),
        'steel': (180, 190, 200),
        'steel_mid': (140, 150, 160),
        'leather': (120, 80, 50),
        'outline': (30, 30, 35),
        'trail': (220, 230, 240, 180),
    }
    
    # Extended right arm (lunging)
    draw.ellipse([cx+7, cy-3, cx+17, cy+10], fill=c['mail_mid'], outline=c['outline'])
    draw.ellipse([cx+8, cy-2, cx+15, cy+7], fill=c['mail'])
    
    # Glove
    draw.ellipse([cx+14, cy+5, cx+22, cy+13], fill=c['leather'], outline=c['outline'])
    
    # Sword extended forward in horizontal strike
    # Handle
    draw.rectangle([cx+19, cy+4, cx+22, cy+24], fill=c['leather'], outline=c['outline'])
    # Crossguard
    draw.rectangle([cx+15, cy+2, cx+26, cy+6], fill=c['steel'], outline=c['outline'])
    draw.line([(cx+16, cy+3), (cx+25, cy+3)], fill=c['steel_mid'], width=1)
    
    # Blade horizontal - SWING ARC
    blade = [
        (cx+17, cy+2),
        (cx+21, cy+2),
        (cx+44, cy-4),
        (cx+44, cy-8),
        (cx+21, cy-2),
        (cx+17, cy-2),
    ]
    draw.polygon(blade, fill=c['steel'], outline=c['outline'])
    
    # Motion trail (speed effect)
    trail = [
        (cx+25, cy-3),
        (cx+28, cy-3),
        (cx+42, cy-6),
        (cx+40, cy-8),
    ]
    draw.polygon(trail, fill=c['trail'])
    
    # Blade edge highlights
    draw.line([(cx+18, cy-1), (cx+42, cy-7)], fill=(240, 245, 250), width=1)
    
    return img

def main():
    import os
    output_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("Generating enhanced sprites with shading...")
    
    idle = create_enhanced_idle()
    idle.save(os.path.join(output_dir, 'enhanced_idle.png'))
    print("  Saved: enhanced_idle.png")
    
    attack = create_enhanced_attack_frame()
    attack.save(os.path.join(output_dir, 'enhanced_attack.png'))
    print("  Saved: enhanced_attack.png")
    
    print("\nThese enhanced versions show proper pixel art shading.")
    print("Compare template_idle.png vs enhanced_idle.png to see the difference.")

if __name__ == '__main__':
    main()
