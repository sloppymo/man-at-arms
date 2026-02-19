#!/bin/bash

echo "=== GODOT LAUNCH FIX ==="
echo "Current directory: $(pwd)"
echo "Project file: $(ls -la project.godot | wc -l)"
echo "Godot version: $(godot --version 2>/dev/null || echo 'Unknown')"

# Try launching with different configurations
echo ""
echo "1. Testing OpenGL driver..."
godot --rendering-driver opengl --verbose --main-pack res://system_diagnostic.tscn

echo ""
echo "2. Testing windowed mode..."
godot --windowed --verbose --main-pack res://system_diagnostic.tscn

echo ""
echo "3. Testing with explicit project path..."
godot --path /home/sloppymo/Documents/man-at-arms/man-at-arms/godot-project --verbose --main-pack res://system_diagnostic.tscn

echo ""
echo "4. Testing headless mode..."
godot --headless --verbose --main-pack res://system_diagnostic.tscn

echo ""
echo "=== LAUNCH TEST COMPLETE ==="
