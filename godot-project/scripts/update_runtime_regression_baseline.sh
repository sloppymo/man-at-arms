#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASELINE_PATH="$ROOT_DIR/tests/runtime_gate/baselines/runtime_regression_baseline.json"

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

echo "Running runtime regression harness to generate fresh metrics..."
"${GODOT_CMD[@]}" --script res://scripts/runtime_regression_harness.gd

PROJECT_APPDATA_NAME="Man-At-Arms Godot Migration"
USER_DATA_DIR_CANDIDATES=(
	"$HOME/.var/app/org.godotengine.Godot/data/godot/app_userdata/$PROJECT_APPDATA_NAME"
	"$HOME/.local/share/godot/app_userdata/$PROJECT_APPDATA_NAME"
)

LATEST_METRICS_PATH=""
for base_dir in "${USER_DATA_DIR_CANDIDATES[@]}"; do
	candidate="$base_dir/runtime_regression/runtime_regression_metrics_latest.json"
	if [[ -f "$candidate" ]]; then
		LATEST_METRICS_PATH="$candidate"
		break
	fi
done

if [[ -z "$LATEST_METRICS_PATH" ]]; then
	echo "Could not locate runtime_regression_metrics_latest.json under expected user data locations."
	exit 1
fi

mkdir -p "$(dirname "$BASELINE_PATH")"
cp "$LATEST_METRICS_PATH" "$BASELINE_PATH"

echo "Updated baseline from: $LATEST_METRICS_PATH"
echo "Baseline written to: $BASELINE_PATH"
