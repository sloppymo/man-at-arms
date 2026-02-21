#!/usr/bin/env python3
"""
Upscale pixel art sprites using multiple methods.

Methods:
1. Nearest Neighbor (4x) - Pure pixel art, no smoothing
2. HQ4x-style (smart edge detection) - Smoother but keeps pixel feel
3. AI-based (if available) - Best quality but requires external tools
"""

from PIL import Image, ImageFilter, ImageDraw
import os
import subprocess
import sys

def upscale_nearest(image_path, scale=4):
    """Simple nearest neighbor upscale - preserves pixel edges."""
    img = Image.open(image_path)
    new_size = (img.size[0] * scale, img.size[1] * scale)
    upscaled = img.resize(new_size, Image.NEAREST)
    return upscaled

def upscale_hqx(image_path, scale=4):
    """
    HQX-style upscale with smart edge preservation.
    Uses PIL's simple smoothing then sharpens.
    """
    img = Image.open(image_path)
    new_size = (img.size[0] * scale, img.size[1] * scale)
    
    # Start with nearest neighbor
    upscaled = img.resize(new_size, Image.NEAREST)
    
    # Slight box blur to reduce pixel grid visibility
    smoothed = upscaled.filter(ImageFilter.SMOOTH_MORE)
    
    # Sharpen to bring back edges
    sharpened = smoothed.filter(ImageFilter.SHARPEN)
    
    # Blend 70% sharpened with 30% original nearest to keep pixel feel
    result = Image.blend(upscaled, sharpened, 0.3)
    
    return result

def upscale_crt_style(image_path, scale=4):
    """
    CRT-style upscale with scanlines and glow.
    Good for retro aesthetic games.
    """
    img = Image.open(image_path)
    new_size = (img.size[0] * scale, img.size[1] * scale)
    
    # Nearest neighbor base
    base = img.resize(new_size, Image.NEAREST)
    
    # Add slight glow/blur
    glow = base.filter(ImageFilter.GaussianBlur(radius=1))
    
    # Composite: base over glow
    result = Image.alpha_composite(glow, base)
    
    # Add scanlines (optional, subtle)
    overlay = Image.new('RGBA', new_size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    for y in range(0, new_size[1], 4):
        draw.line([(0, y), (new_size[0], y)], fill=(0, 0, 0, 15))
    
    result = Image.alpha_composite(result, overlay)
    
    return result

def upscale_with_realesrgan(image_path, output_path):
    """
    Use Real-ESRGAN if available.
    This gives the best quality but requires the tool to be installed.
    """
    try:
        # Check if realesrgan is available
        result = subprocess.run(['realesrgan-ncnn-vulkan', '-h'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode != 0:
            return None
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return None
    
    # Run Real-ESRGAN with anime model (works well for pixel art)
    cmd = [
        'realesrgan-ncnn-vulkan',
        '-i', image_path,
        '-o', output_path,
        '-n', 'realesr-animevideov3',  # Good for stylized art
        '-s', '4'
    ]
    
    try:
        subprocess.run(cmd, check=True, capture_output=True, timeout=30)
        return Image.open(output_path)
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError):
        return None

def create_comparison_sheet(directions, method_name, method_func):
    """Create a comparison sheet showing all directions upscaled."""
    
    scale = 4
    base_size = 64
    margin = 20
    label_h = 25
    
    upscaled_size = base_size * scale
    cols = 4
    rows = 2
    
    sheet_w = (upscaled_size + margin) * cols + margin
    sheet_h = (upscaled_size + label_h + margin) * rows + margin
    
    sheet = Image.new('RGBA', (sheet_w, sheet_h), (35, 38, 45, 255))
    
    try:
        from PIL import ImageFont
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
    except:
        font = ImageFont.load_default()
    
    positions = [
        ('N', 1, 0), ('NE', 2, 0), ('E', 3, 0), ('SE', 3, 1),
        ('S', 1, 1), ('SW', 0, 1), ('W', 0, 0), ('NW', 0, 0),
    ]
    
    # Correct position mapping for 8-direction display
    dir_positions = {
        'N': (1, 0),
        'NE': (2, 0),
        'E': (3, 0),
        'SE': (3, 1),
        'S': (1, 1),
        'SW': (0, 1),
        'W': (0, 0),
        'NW': (0, 0),  # NW and W share left column, but let's adjust
    }
    
    # Better 3x3 grid layout
    grid_positions = {
        'NW': (0, 0),
        'N': (1, 0),
        'NE': (2, 0),
        'W': (0, 1),
        'S': (1, 1),  # Center is S (front view, most important)
        'E': (2, 1),
        'SW': (0, 2),
        'SE': (2, 2),
    }
    
    sheet_w = (upscaled_size + margin) * 3 + margin
    sheet_h = (upscaled_size + label_h + margin) * 3 + margin
    sheet = Image.new('RGBA', (sheet_w, sheet_h), (35, 38, 45, 255))
    draw = ImageDraw.Draw(sheet)
    
    for dir_name, img_path in directions.items():
        if dir_name not in grid_positions:
            continue
        
        col, row = grid_positions[dir_name]
        
        # Upscale
        upscaled = method_func(img_path)
        
        # Position
        x = margin + col * (upscaled_size + margin)
        y = margin + row * (upscaled_size + label_h + margin)
        
        # Paste
        sheet.paste(upscaled, (x, y))
        
        # Label
        draw.text((x + upscaled_size//2 - 10, y + upscaled_size + 5), 
                  dir_name, fill=(255, 255, 255, 255), font=font)
    
    return sheet

def main():
    """Upscale all directions with multiple methods."""
    
    output_dir = os.path.dirname(os.path.abspath(__file__))
    
    directions = {
        'N': 'dir_north.png',
        'NE': 'dir_northeast.png',
        'E': 'dir_east.png',
        'SE': 'dir_southeast.png',
        'S': 'dir_south.png',
        'SW': 'dir_southwest.png',
        'W': 'dir_west.png',
        'NW': 'dir_northwest.png',
    }
    
    print("=" * 60)
    print("Pixel Art Upscaler for Man-at-Arms")
    print("=" * 60)
    print()
    
    # Method 1: Nearest Neighbor (pure pixel art)
    print("Method 1: Nearest Neighbor (4x)")
    print("-" * 40)
    nn_dir = os.path.join(output_dir, 'upscaled_nearest')
    os.makedirs(nn_dir, exist_ok=True)
    
    for dir_name, filename in directions.items():
        input_path = os.path.join(output_dir, filename)
        if os.path.exists(input_path):
            upscaled = upscale_nearest(input_path)
            output_path = os.path.join(nn_dir, f'{dir_name}_4x.png')
            upscaled.save(output_path)
            print(f"  ✓ {dir_name}: {upscaled.size[0]}x{upscaled.size[1]} -> {output_path}")
    
    print()
    
    # Method 2: HQX-style
    print("Method 2: HQX-style (smoothed edges)")
    print("-" * 40)
    hqx_dir = os.path.join(output_dir, 'upscaled_hqx')
    os.makedirs(hqx_dir, exist_ok=True)
    
    for dir_name, filename in directions.items():
        input_path = os.path.join(output_dir, filename)
        if os.path.exists(input_path):
            upscaled = upscale_hqx(input_path)
            output_path = os.path.join(hqx_dir, f'{dir_name}_4x.png')
            upscaled.save(output_path)
            print(f"  ✓ {dir_name}: {upscaled.size[0]}x{upscaled.size[1]} -> {output_path}")
    
    print()
    
    # Method 3: CRT-style
    print("Method 3: CRT-style (retro glow)")
    print("-" * 40)
    crt_dir = os.path.join(output_dir, 'upscaled_crt')
    os.makedirs(crt_dir, exist_ok=True)
    
    for dir_name, filename in directions.items():
        input_path = os.path.join(output_dir, filename)
        if os.path.exists(input_path):
            upscaled = upscale_crt_style(input_path)
            output_path = os.path.join(crt_dir, f'{dir_name}_4x.png')
            upscaled.save(output_path)
            print(f"  ✓ {dir_name}: {upscaled.size[0]}x{upscaled.size[1]} -> {output_path}")
    
    print()
    
    # Create comparison sheets
    print("Creating comparison sheets...")
    print("-" * 40)
    
    dir_paths = {k: os.path.join(output_dir, v) for k, v in directions.items()}
    
    # Nearest neighbor comparison
    sheet_nn = create_comparison_sheet(dir_paths, "Nearest", upscale_nearest)
    sheet_nn.save(os.path.join(output_dir, 'comparison_nearest.png'))
    print("  ✓ comparison_nearest.png")
    
    # HQX comparison
    sheet_hqx = create_comparison_sheet(dir_paths, "HQX", upscale_hqx)
    sheet_hqx.save(os.path.join(output_dir, 'comparison_hqx.png'))
    print("  ✓ comparison_hqx.png")
    
    print()
    print("=" * 60)
    print("Upscale complete!")
    print()
    print("Output folders:")
    print(f"  - upscaled_nearest/   (Pure pixel art, sharp edges)")
    print(f"  - upscaled_hqx/       (Smoothed, blended pixels)")
    print(f"  - upscaled_crt/       (Retro scanline effect)")
    print()
    print("Comparison sheets:")
    print(f"  - comparison_nearest.png")
    print(f"  - comparison_hqx.png")
    print()
    print("Recommendation:")
    print("  - For true pixel art game: Use upscaled_nearest/")
    print("  - For modern smooth look: Use upscaled_hqx/")
    print("  - For retro CRT aesthetic: Use upscaled_crt/")
    print()
    print("Next: Import chosen style to Aseprite for animation frames!")

if __name__ == '__main__':
    main()
