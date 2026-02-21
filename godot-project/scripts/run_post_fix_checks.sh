#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
GODOT_BIN="${ROOT_DIR}/tools/godot"
PROJECT_PATH="${ROOT_DIR}/godot-project"

if [[ ! -x "${GODOT_BIN}" ]]; then
  echo "Missing Godot wrapper: ${GODOT_BIN}" >&2
  exit 1
fi

echo "[1/3] Combat lifecycle smoke"
"${GODOT_BIN}" --headless --path "${PROJECT_PATH}" --script res://scripts/combat_lifecycle_smoke_test.gd

echo "[2/3] Blood feature validation"
"${GODOT_BIN}" --headless --path "${PROJECT_PATH}" --script res://scripts/blood_feature_validation.gd

echo "[3/3] Full automated CI pipeline"
"${GODOT_BIN}" --headless --path "${PROJECT_PATH}" --script res://scripts/run_automated_ci_pipeline.gd

echo "Post-fix checks: PASS"
