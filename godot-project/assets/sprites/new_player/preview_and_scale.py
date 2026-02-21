#!/usr/bin/env python3
"""
Preview sprite at different scales and generate scaled versions for testing.
"""

from PIL import Image, ImageDraw, ImageFont
import os
import sys

def create_preview_sheet(sprite_path, scales=[1, 2, 4, 8]):
    """Create a preview sheet showing sprite at different scales."""
    
    sprite = Image.open(sprite_path)
    base_w, base_h = sprite.size
    
    # Calculate sheet dimensions
    margin = 20
    label_height = 30
    col_width = max(base_w * max(scales) + margin * 2, 200)
    row_height = base_h * max(scales) + label_height + margin * 2
    
    sheet_width = col_width * len(scales)
    sheet_height = row_height
    
    sheet = Image.new('RGBA', (sheet_width, sheet_height), (40, 44, 52, 255))
    draw = ImageDraw.Draw(sheet)
    
    # Try to load a font, fallback to default
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
    except:
        font = ImageFont.load_default()
    
    x_offset = 0
    for scale in scales:
        scaled = sprite.resize((base_w * scale, base_h * scale), Image.NEAREST)
        
        # Center in column
        col_center = x_offset + col_width // 2
        img_x = col_center - (base_w * scale) // 2
        img_y = margin
        
        # Paste scaled sprite
        sheet.paste(scaled, (img_x, img_y))
        
        # Draw label
        label = f"{base_w}x{base_h} @ {scale}x = {base_w*scale}x{base_h*scale}"
        bbox = draw.textbbox((0, 0), label, font=font)
        text_w = bbox[2] - bbox[0]
        text_x = col_center - text_w // 2
        text_y = img_y + base_h * scale + 10
        
        draw.text((text_x, text_y), label, fill=(200, 200, 200, 255), font=font)
        
        x_offset += col_width
    
    return sheet

def create_comparison_sheet(template_paths, labels=None):
    """Create a comparison of multiple sprites side-by-side."""
    
    if labels is None:
        labels = [os.path.basename(p) for p in template_paths]
    
    sprites = [Image.open(p) for p in template_paths]
    base_h = max(s.size[1] for s in sprites)
    
    margin = 20
    col_width = 100 + margin * 2
    row_height = base_h + 60
    
    sheet_width = col_width * len(sprites)
    sheet_height = row_height
    
    sheet = Image.new('RGBA', (sheet_width, sheet_height), (40, 44, 52, 255))
    draw = ImageDraw.Draw(sheet)
    
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 12)
    except:
        font = ImageFont.load_default()
    
    x_offset = 0
    for i, (sprite, label) in enumerate(zip(sprites, labels)):
        # Scale up 2x for visibility
        scaled = sprite.resize((sprite.size[0] * 2, sprite.size[1] * 2), Image.NEAREST)
        
        col_center = x_offset + col_width // 2
        img_x = col_center - scaled.size[0] // 2
        img_y = 10
        
        sheet.paste(scaled, (img_x, img_y))
        
        # Draw label
        bbox = draw.textbbox((0, 0), label, font=font)
        text_w = bbox[2] - bbox[0]
        text_x = col_center - text_w // 2
        text_y = img_y + scaled.size[1] + 8
        
        draw.text((text_x, text_y), label, fill=(200, 200, 200, 255), font=font)
        
        x_offset += col_width
    
    return sheet

def test_in_game_scale(sprite_path):
    """Show what the sprite looks like at likely game resolutions."""
    
    sprite = Image.open(sprite_path)
    
    # Common game viewport sizes
    scenarios = [
        ("1080p (small player)", 1920, 1080, 4),
        ("720p (medium player)", 1280, 720, 3),
        ("480p (large player)", 854, 480, 2),
    ]
    
    margin = 40
    preview_w, preview_h = 300, 200
    
    sheet_width = (preview_w + margin) * len(scenarios)
    sheet_height = preview_h + margin * 3
    
    sheet = Image.new('RGBA', (sheet_width, sheet_height), (30, 34, 40, 255))
    draw = ImageDraw.Draw(sheet)
    
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
        small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 10)
    except:
        font = ImageFont.load_default()
        small_font = ImageFont.load_default()
    
    x_offset = margin // 2
    for name, game_w, game_h, scale in scenarios:
        # Create a "viewport" preview
        viewport = Image.new('RGBA', (preview_w, preview_h), (60, 70, 80, 255))
        vp_draw = ImageDraw.Draw(viewport)
        
        # Draw some "ground"
        vp_draw.rectangle([0, preview_h - 40, preview_w, preview_h], fill=(50, 60, 45, 255))
        
        # Place scaled sprite in center-bottom
        scaled = sprite.resize((sprite.size[0] * scale, sprite.size[1] * scale), Image.NEAREST)
        sprite_x = (preview_w - scaled.size[0]) // 2
        sprite_y = preview_h - 40 - scaled.size[1] + 10  # Slightly sunk into ground
        
        viewport.paste(scaled, (sprite_x, sprite_y), scaled)
        
        # Paste viewport onto sheet
        sheet.paste(viewport, (x_offset, margin + 20))
        
        # Draw labels
        draw.text((x_offset, 10), name, fill=(255, 255, 255, 255), font=font)
        draw.text((x_offset, margin + preview_h + 25), 
                  f"{game_w}x{game_h} @ {scale}x scale", 
                  fill=(180, 180, 180, 255), font=small_font)
        
        x_offset += preview_w + margin
    
    return sheet

def main():
    """Generate all preview images."""
    
    output_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("Generating preview sheets...")
    
    # Preview idle template at different scales
    if os.path.exists(os.path.join(output_dir, 'template_idle.png')):
        print("  Creating scale preview for template_idle.png...")
        preview = create_preview_sheet(os.path.join(output_dir, 'template_idle.png'))
        preview.save(os.path.join(output_dir, 'preview_scales.png'))
        print("    Saved: preview_scales.png")
    
    # Comparison of animation frames
    templates = [
        'template_idle.png',
        'template_walk_01.png', 
        'template_walk_02.png',
        'template_attack_01_windup.png',
        'template_attack_02_strike.png'
    ]
    template_paths = [os.path.join(output_dir, t) for t in templates if os.path.exists(os.path.join(output_dir, t))]
    
    if len(template_paths) >= 2:
        print("  Creating animation comparison...")
        comparison = create_comparison_sheet(template_paths)
        comparison.save(os.path.join(output_dir, 'preview_comparison.png'))
        print("    Saved: preview_comparison.png")
    
    # In-game scale test
    if os.path.exists(os.path.join(output_dir, 'template_idle.png')):
        print("  Creating in-game scale preview...")
        ingame = test_in_game_scale(os.path.join(output_dir, 'template_idle.png'))
        ingame.save(os.path.join(output_dir, 'preview_ingame_scale.png'))
        print("    Saved: preview_ingame_scale.png")
    
    print("\nPreviews generated!")
    print("Check these files to evaluate sprite readability at different scales.")

if __name__ == '__main__':
    main()
