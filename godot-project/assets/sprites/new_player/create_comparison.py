#!/usr/bin/env python3
"""Create before/after comparison image."""

from PIL import Image, ImageDraw, ImageFont

def create_comparison():
    # Load images
    basic_idle = Image.open('template_idle.png')
    enhanced_idle = Image.open('enhanced_idle.png')
    basic_attack = Image.open('template_attack_02_strike.png')
    enhanced_attack = Image.open('enhanced_attack.png')
    
    # Canvas: side by side, scaled up 4x for visibility
    scale = 4
    img_w, img_h = 64 * scale, 64 * scale
    margin = 30
    label_h = 40
    
    width = img_w * 2 + margin * 3
    height = img_h * 2 + label_h * 2 + margin * 4
    
    canvas = Image.new('RGBA', (width, height), (35, 38, 45, 255))
    draw = ImageDraw.Draw(canvas)
    
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
        small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 12)
    except:
        font = ImageFont.load_default()
        small = ImageFont.load_default()
    
    def paste_scaled(dest, src, x, y, scale):
        scaled = src.resize((src.size[0] * scale, src.size[1] * scale), Image.NEAREST)
        dest.paste(scaled, (x, y))
    
    # Title
    title = "Man-at-Arms Sprite Quality Comparison"
    bbox = draw.textbbox((0, 0), title, font=font)
    draw.text(((width - (bbox[2]-bbox[0])) // 2, 15), title, fill=(255, 255, 255, 255), font=font)
    
    # Row 1: IDLE
    y = margin + label_h + 10
    
    # Basic idle
    paste_scaled(canvas, basic_idle, margin, y, scale)
    draw.text((margin, y - 25), "BASIC TEMPLATE", fill=(180, 180, 180, 255), font=small)
    draw.text((margin, y + img_h + 5), "Flat colors\nNo shading", fill=(150, 150, 150, 255), font=small)
    
    # Enhanced idle
    paste_scaled(canvas, enhanced_idle, margin * 2 + img_w, y, scale)
    draw.text((margin * 2 + img_w, y - 25), "ENHANCED (Target)", fill=(100, 200, 100, 255), font=small)
    draw.text((margin * 2 + img_w, y + img_h + 5), "3-tone shading\nHighlights & shadows\nChainmail detail", fill=(150, 150, 150, 255), font=small)
    
    # Row 2: ATTACK
    y = margin * 3 + label_h + img_h + 30
    
    # Basic attack
    paste_scaled(canvas, basic_attack, margin, y, scale)
    draw.text((margin, y - 25), "BASIC ATTACK", fill=(180, 180, 180, 255), font=small)
    
    # Enhanced attack
    paste_scaled(canvas, enhanced_attack, margin * 2 + img_w, y, scale)
    draw.text((margin * 2 + img_w, y - 25), "ENHANCED ATTACK", fill=(100, 200, 100, 255), font=small)
    draw.text((margin * 2 + img_w, y + img_h + 5), "Motion trail\nBetter proportions", fill=(150, 150, 150, 255), font=small)
    
    # Arrows showing improvement
    arrow_y1 = margin + label_h + 10 + img_h // 2
    arrow_y2 = margin * 3 + label_h + img_h + 30 + img_h // 2
    
    arrow_x = margin + img_w + margin // 2
    draw.polygon([
        (arrow_x - 10, arrow_y1 - 5),
        (arrow_x + 10, arrow_y1),
        (arrow_x - 10, arrow_y1 + 5),
    ], fill=(100, 200, 100, 255))
    
    draw.polygon([
        (arrow_x - 10, arrow_y2 - 5),
        (arrow_x + 10, arrow_y2),
        (arrow_x - 10, arrow_y2 + 5),
    ], fill=(100, 200, 100, 255))
    
    canvas.save('QUALITY_COMPARISON.png')
    print("Saved: QUALITY_COMPARISON.png")

if __name__ == '__main__':
    create_comparison()
