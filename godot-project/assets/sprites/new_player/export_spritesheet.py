#!/usr/bin/env python3
"""
Export player animations as Godot-ready spritesheets.

Usage:
    python3 export_spritesheet.py --input-dir ./frames --output ../player_spritesheet.png
"""

import argparse
import os
from PIL import Image
import json

def collect_frames(input_dir):
    """Collect all frame PNGs organized by animation."""
    animations = {}
    
    for filename in sorted(os.listdir(input_dir)):
        if not filename.endswith('.png'):
            continue
            
        # Parse filename: player_attack_01.png -> animation: attack, frame: 01
        parts = filename.replace('.png', '').split('_')
        if len(parts) < 3:
            continue
            
        anim_name = parts[1]  # idle, walk, attack, etc.
        frame_num = int(parts[2]) if parts[2].isdigit() else 0
        
        if anim_name not in animations:
            animations[anim_name] = []
            
        img_path = os.path.join(input_dir, filename)
        img = Image.open(img_path)
        animations[anim_name].append((frame_num, img))
    
    # Sort frames by number
    for anim in animations:
        animations[anim].sort(key=lambda x: x[0])
        animations[anim] = [img for _, img in animations[anim]]
    
    return animations

def create_spritesheet(animations, frame_size=(64, 64)):
    """Create a horizontal spritesheet with all animations."""
    
    # Calculate dimensions
    total_frames = sum(len(frames) for frames in animations.values())
    sheet_width = total_frames * frame_size[0]
    sheet_height = frame_size[1]
    
    # Create canvas
    spritesheet = Image.new('RGBA', (sheet_width, sheet_height), (0, 0, 0, 0))
    
    # Metadata for Godot
    atlas_data = {
        "frames": {},
        "meta": {
            "app": "Man-at-Arms Sprite Exporter",
            "version": "1.0",
            "format": "RGBA8888",
            "size": {"w": sheet_width, "h": sheet_height},
            "scale": "1"
        }
    }
    
    x_offset = 0
    for anim_name, frames in sorted(animations.items()):
        for i, frame in enumerate(frames):
            # Paste frame
            spritesheet.paste(frame, (x_offset, 0))
            
            # Record frame data
            frame_key = f"{anim_name}_{i:02d}"
            atlas_data["frames"][frame_key] = {
                "frame": {"x": x_offset, "y": 0, "w": frame_size[0], "h": frame_size[1]},
                "rotated": False,
                "trimmed": False,
                "spriteSourceSize": {"x": 0, "y": 0, "w": frame_size[0], "h": frame_size[1]},
                "sourceSize": {"w": frame_size[0], "h": frame_size[1]},
                "duration": 83 if anim_name == "attack" else 125  # ms
            }
            
            x_offset += frame_size[0]
    
    return spritesheet, atlas_data

def create_godot_spriteframes(atlas_data, output_path):
    """Create Godot .tres SpriteFrames resource."""
    
    tres_content = """[gd_resource type="SpriteFrames" load_steps=1 format=3]

"""
    
    # Group frames by animation
    anims = {}
    for frame_key, data in atlas_data["frames"].items():
        anim_name = frame_key.rsplit('_', 1)[0]
        if anim_name not in anims:
            anims[anim_name] = []
        anims[anim_name].append((frame_key, data))
    
    # Generate animation entries
    for anim_name, frames in sorted(anims.items()):
        tres_content += f'[resource]\n\n'
        for frame_key, data in sorted(frames, key=lambda x: x[0]):
            x, y, w, h = data["frame"]["x"], data["frame"]["y"], data["frame"]["w"], data["frame"]["h"]
            duration = data.get("duration", 100)
            # Convert ms to Godot's 0-1.0 timing (at 12fps = ~83ms per frame)
            godot_duration = duration / 1000.0 * 12  # normalized to 12fps
            tres_content += f'animation_{anim_name}/{frame_key} = "{anim_name}"\n'
    
    # Save tres file
    tres_path = output_path.replace('.png', '.tres')
    with open(tres_path, 'w') as f:
        f.write(tres_content)
    
    print(f"  Generated: {tres_path}")

def main():
    parser = argparse.ArgumentParser(description='Export player spritesheet')
    parser.add_argument('--input-dir', '-i', required=True, help='Directory containing frame PNGs')
    parser.add_argument('--output', '-o', required=True, help='Output spritesheet PNG path')
    parser.add_argument('--frame-size', type=int, nargs=2, default=[64, 64], help='Frame size (w h)')
    
    args = parser.parse_args()
    
    print(f"Collecting frames from: {args.input_dir}")
    animations = collect_frames(args.input_dir)
    
    if not animations:
        print("ERROR: No frame files found!")
        print("Expected format: player_<animation>_<frame>.png (e.g., player_idle_01.png)")
        return
    
    print(f"Found animations: {list(animations.keys())}")
    for anim, frames in animations.items():
        print(f"  {anim}: {len(frames)} frames")
    
    print(f"\nCreating spritesheet: {args.output}")
    spritesheet, atlas_data = create_spritesheet(animations, tuple(args.frame_size))
    
    # Save spritesheet
    spritesheet.save(args.output)
    print(f"  Saved: {args.output} ({spritesheet.size[0]}x{spritesheet.size[1]})")
    
    # Save atlas JSON (for reference)
    json_path = args.output.replace('.png', '.json')
    with open(json_path, 'w') as f:
        json.dump(atlas_data, f, indent=2)
    print(f"  Saved: {json_path}")
    
    # Generate Godot resource
    create_godot_spriteframes(atlas_data, args.output)
    
    print("\nExport complete!")
    print("Import into Godot:")
    print("  1. Copy .png to assets/sprites/")
    print("  2. Set import settings: 2D Pixel, no filter")
    print("  3. Use AnimatedSprite2D with SpriteFrames resource")

if __name__ == '__main__':
    main()
