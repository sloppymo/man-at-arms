#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -n "${GODOT_BIN:-}" ]]; then
	GODOT_CMD=("$GODOT_BIN" --headless --path "$ROOT_DIR")
elif command -v flatpak >/dev/null 2>&1 && flatpak info org.godotengine.Godot >/dev/null 2>&1; then
	GODOT_CMD=(flatpak run org.godotengine.Godot --headless --path "$ROOT_DIR")
elif command -v godot4 >/dev/null 2>&1; then
	GODOT_CMD=(godot4 --headless --path "$ROOT_DIR")
elif command -v godot >/dev/null 2>&1; then
	GODOT_CMD=(godot --headless --path "$ROOT_DIR")
else
	echo "No Godot executable found. Install Flatpak Godot, godot4, or set GODOT_BIN."
	exit 1
fi

echo "Using Godot command: ${GODOT_CMD[*]}"

run_step() {
	local name="$1"
	shift
	echo "=== ${name} ==="
	"${GODOT_CMD[@]}" "$@"
}

run_step "Cleanup Save File" --script res://scripts/cleanup_save_file.gd
run_step "Project Startup Smoke" --quit --verbose
run_step "Overworld Scene Smoke" --scene res://scenes/overworld/overworld_scene.tscn --quit-after 20 --verbose
run_step "Combat Scene Smoke" --scene res://scenes/combat/combat_scene.tscn --quit-after 10 --verbose
run_step "Dialogue Scene Smoke" --scene res://scenes/dialogue/town_square.tscn --quit-after 10 --verbose
run_step "Transition Smoke Harness" --script res://scripts/transition_smoke_test.gd
run_step "Overworld Edge Harness" --script res://scripts/overworld_transition_edge_tests.gd
run_step "Combat Lifecycle Harness" --script res://scripts/combat_lifecycle_smoke_test.gd

echo "All headless smoke checks passed."
