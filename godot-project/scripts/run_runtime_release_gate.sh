#!/usr/bin/env bash
set -u -o pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARTIFACT_DIR="${RUNTIME_GATE_ARTIFACT_DIR:-$ROOT_DIR/artifacts/runtime-gate}"
LOG_DIR="$ARTIFACT_DIR/logs"
SUMMARY_JSON="$ARTIFACT_DIR/runtime_gate_summary.json"
REPORT_MD="$ARTIFACT_DIR/runtime_gate_report.md"

mkdir -p "$LOG_DIR"

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

declare -a STEP_IDS=()
declare -a STEP_DESCRIPTIONS=()
declare -a STEP_COMMANDS=()
declare -a STEP_STATUSES=()
declare -a STEP_DURATIONS=()
declare -a STEP_LOGS=()

OVERALL_STATUS="pass"
RUN_STARTED_AT_UTC="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
STEP_TIMEOUT_SEC="${RUNTIME_GATE_STEP_TIMEOUT_SEC:-900}"

run_step() {
	local step_id="$1"
	local description="$2"
	local command_string="$3"
	shift 3

	local log_file="$LOG_DIR/${step_id}.log"
	local start_epoch
	start_epoch="$(date +%s)"

	{
		echo "=== ${description} ==="
		echo "Command: ${command_string}"
		echo "Started: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
	} > "$log_file"

	local exit_code=0
	if command -v timeout >/dev/null 2>&1; then
		timeout --signal=TERM "${STEP_TIMEOUT_SEC}" "$@" >> "$log_file" 2>&1
		exit_code=$?
		if [[ $exit_code -eq 124 ]]; then
			echo "Step timed out after ${STEP_TIMEOUT_SEC}: ${description}" >> "$log_file"
		fi
	else
		"$@" >> "$log_file" 2>&1
		exit_code=$?
	fi

	local end_epoch
	end_epoch="$(date +%s)"
	local duration_sec=$((end_epoch - start_epoch))

	local status="pass"
	if [[ $exit_code -ne 0 ]]; then
		status="fail"
		OVERALL_STATUS="fail"
	fi

	STEP_IDS+=("$step_id")
	STEP_DESCRIPTIONS+=("$description")
	STEP_COMMANDS+=("$command_string")
	STEP_STATUSES+=("$status")
	STEP_DURATIONS+=("$duration_sec")
	STEP_LOGS+=("$log_file")

	echo "[${status}] ${description} (${duration_sec}s)"
}

run_step \
	"headless_smoke" \
	"Headless Smoke Suite" \
	"bash $ROOT_DIR/scripts/run_headless_smoke.sh" \
	bash "$ROOT_DIR/scripts/run_headless_smoke.sh"

run_step \
	"combat_improvements_validation" \
	"Combat Improvements Validation" \
	"${GODOT_CMD[*]} --script res://scripts/combat_improvements_validation.gd" \
	"${GODOT_CMD[@]}" --script res://scripts/combat_improvements_validation.gd

run_step \
	"combat_performance_harness" \
	"Combat Performance Harness" \
	"${GODOT_CMD[*]} --script res://scripts/combat_performance_harness.gd" \
	"${GODOT_CMD[@]}" --script res://scripts/combat_performance_harness.gd

run_step \
	"combat_metrics_regression_check" \
	"Combat Metrics Regression Check" \
	"${GODOT_CMD[*]} --script res://scripts/combat_metrics_regression_check.gd" \
	"${GODOT_CMD[@]}" --script res://scripts/combat_metrics_regression_check.gd

run_step \
	"runtime_regression_harness" \
	"Runtime Regression Harness" \
	"${GODOT_CMD[*]} --script res://scripts/runtime_regression_harness.gd" \
	"${GODOT_CMD[@]}" --script res://scripts/runtime_regression_harness.gd

run_step \
	"runtime_regression_compare" \
	"Runtime Regression Baseline Compare" \
	"${GODOT_CMD[*]} --script res://scripts/runtime_regression_compare.gd" \
	"${GODOT_CMD[@]}" --script res://scripts/runtime_regression_compare.gd

PROJECT_APPDATA_NAME="Man-At-Arms Godot Migration"
USER_DATA_DIR_CANDIDATES=(
	"$HOME/.var/app/org.godotengine.Godot/data/godot/app_userdata/$PROJECT_APPDATA_NAME"
	"$HOME/.local/share/godot/app_userdata/$PROJECT_APPDATA_NAME"
)

copy_user_artifact() {
	local relative_path="$1"
	local destination_name="$2"
	local copied="false"

	for base_dir in "${USER_DATA_DIR_CANDIDATES[@]}"; do
		local source_path="$base_dir/$relative_path"
		if [[ -f "$source_path" ]]; then
			cp "$source_path" "$ARTIFACT_DIR/$destination_name"
			echo "Copied artifact: $source_path -> $ARTIFACT_DIR/$destination_name"
			copied="true"
			break
		fi
	done

	if [[ "$copied" != "true" ]]; then
		echo "Missing artifact: $relative_path"
		OVERALL_STATUS="fail"
	fi
}

copy_user_artifact "combat_metrics/combat_metrics_latest.json" "combat_metrics_latest.json"
copy_user_artifact "runtime_regression/runtime_regression_metrics_latest.json" "runtime_regression_metrics_latest.json"
copy_user_artifact "runtime_regression/runtime_regression_comparison_latest.json" "runtime_regression_comparison_latest.json"

for idx in "${!STEP_LOGS[@]}"; do
	if [[ ! -s "${STEP_LOGS[$idx]}" ]]; then
		echo "Missing or empty step log: ${STEP_LOGS[$idx]}"
		OVERALL_STATUS="fail"
	fi
done

json_escape() {
	printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

{
	echo "{"
	echo "  \"generated_at_utc\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\","
	echo "  \"run_started_at_utc\": \"$RUN_STARTED_AT_UTC\","
	echo "  \"overall_status\": \"$OVERALL_STATUS\","
	echo "  \"godot_command\": \"$(json_escape "${GODOT_CMD[*]}")\","
	echo "  \"steps\": ["
	for idx in "${!STEP_IDS[@]}"; do
		comma=","
		if [[ "$idx" -eq "$((${#STEP_IDS[@]} - 1))" ]]; then
			comma=""
		fi
		echo "    {"
		echo "      \"id\": \"$(json_escape "${STEP_IDS[$idx]}")\","
		echo "      \"description\": \"$(json_escape "${STEP_DESCRIPTIONS[$idx]}")\","
		echo "      \"status\": \"${STEP_STATUSES[$idx]}\","
		echo "      \"duration_sec\": ${STEP_DURATIONS[$idx]},"
		echo "      \"command\": \"$(json_escape "${STEP_COMMANDS[$idx]}")\","
		echo "      \"log\": \"$(json_escape "${STEP_LOGS[$idx]}")\""
		echo "    }${comma}"
	done
	echo "  ],"
	echo "  \"artifacts\": {"
	echo "    \"combat_metrics\": \"$ARTIFACT_DIR/combat_metrics_latest.json\","
	echo "    \"runtime_regression_metrics\": \"$ARTIFACT_DIR/runtime_regression_metrics_latest.json\","
	echo "    \"runtime_regression_comparison\": \"$ARTIFACT_DIR/runtime_regression_comparison_latest.json\","
	echo "    \"report_markdown\": \"$REPORT_MD\""
	echo "  }"
	echo "}"
} > "$SUMMARY_JSON"

{
	echo "# Runtime Release Gate Report"
	echo
	echo "- Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
	echo "- Overall status: **$OVERALL_STATUS**"
	echo "- Godot command: \`${GODOT_CMD[*]}\`"
	echo
	echo "## Step Results"
	echo
	echo "| Step | Status | Duration (s) | Log |"
	echo "| --- | --- | ---: | --- |"
	for idx in "${!STEP_IDS[@]}"; do
		echo "| ${STEP_DESCRIPTIONS[$idx]} | ${STEP_STATUSES[$idx]} | ${STEP_DURATIONS[$idx]} | \`${STEP_LOGS[$idx]}\` |"
	done
	echo
	echo "## Artifacts"
	echo
	echo "- Summary JSON: \`$SUMMARY_JSON\`"
	echo "- Combat metrics: \`$ARTIFACT_DIR/combat_metrics_latest.json\`"
	echo "- Runtime regression metrics: \`$ARTIFACT_DIR/runtime_regression_metrics_latest.json\`"
	echo "- Runtime regression comparison: \`$ARTIFACT_DIR/runtime_regression_comparison_latest.json\`"
	echo "- Logs directory: \`$LOG_DIR\`"
} > "$REPORT_MD"

echo "Runtime release gate summary: $SUMMARY_JSON"
echo "Runtime release gate report: $REPORT_MD"

if [[ "$OVERALL_STATUS" == "pass" ]]; then
	exit 0
fi
exit 1
