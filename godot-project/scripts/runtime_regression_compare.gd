extends SceneTree

const METRICS_PATH: String = "user://runtime_regression/runtime_regression_metrics_latest.json"
const BASELINE_PATH: String = "res://tests/runtime_gate/baselines/runtime_regression_baseline.json"
const OUTPUT_DIR: String = "user://runtime_regression"
const OUTPUT_PATH: String = "user://runtime_regression/runtime_regression_comparison_latest.json"

const THRESHOLDS: Dictionary = {
	"startup.autoload_present_count": {"tolerance": 0.0, "min": 5.0},
	"startup.missing_autoload_count": {"tolerance": 0.0, "max": 0.0},
	"startup.startup_validator_ok": {"exact": true},
	"overworld.move_apply_frames": {"tolerance": 4.0, "max": 12.0},
	"overworld.move_hex_delta_q": {"tolerance": 0.0},
	"overworld.move_hex_delta_r": {"tolerance": 0.0},
	"overworld.player_position_synced": {"exact": true},
	"overworld.encounter_transition_frames": {"tolerance": 24.0, "max": 120.0},
	"overworld.encounter_mode_combat": {"exact": true},
	"overworld.combat_payload_has_source": {"exact": true},
	"overworld.combat_payload_has_encounter_hex": {"exact": true},
	"overworld.combat_payload_has_combat_id": {"exact": true},
	"overworld.combat_payload_time_limit_default": {"exact": true},
	"overworld.combat_payload_encounter_hex_matches": {"exact": true},
	"overworld.encounter_transition_within_budget": {"exact": true},
	"combat.movement.hotline_style_enabled": {"exact": true},
	"combat.movement.hotline_dodge_blocked": {"exact": true},
	"combat.movement.frames_to_reach_80pct_speed": {"tolerance": 3.0, "max": 40.0},
	"combat.movement.frames_to_decelerate_to_stop": {"tolerance": 4.0, "max": 40.0},
	"combat.attack.accepted_attack_count": {"tolerance": 0.0, "min": 3.0},
	"combat.attack.cooldown_reject_count": {"tolerance": 0.0, "min": 1.0},
	"combat.attack.damage_dealt_total": {"tolerance": 12.0, "min": 1.0},
	"combat.attack.first_attack_response_ms": {"tolerance": 4.0, "max": 12.0},
	"combat.attack.avg_interval_ms": {"tolerance": 30.0, "min": 80.0, "max": 320.0},
	"combat.attack.min_interval_ms": {"tolerance": 30.0, "min": 70.0, "max": 300.0},
	"combat.attack.cadence_monotonic": {"exact": true},
	"combat.attack.rapid_spam_accept_count": {"tolerance": 2.0, "min": 2.0},
	"combat.attack.rapid_spam_reject_count": {"tolerance": 3.0, "min": 1.0},
	"combat.attack.rapid_spam_min_interval_ms": {"tolerance": 35.0, "min": 70.0, "max": 320.0},
	"combat.attack.rapid_spam_interval_respected": {"exact": true},
	"combat.attack.attack_queue_registered": {"exact": true},
	"combat.attack.attack_queue_executed": {"exact": true},
	"combat.attack.attack_queue_execute_frames": {"tolerance": 6.0, "min": 1.0, "max": 24.0},
	"combat.attack.attack_queue_interval_ms": {"tolerance": 35.0, "min": 120.0, "max": 320.0},
	"combat.attack.attack_queue_no_early_fire": {"exact": true},
	"combat.attack.combo_hits_recorded": {"tolerance": 2.0, "min": 9.0},
	"combat.attack.combo_tier_reached_1": {"exact": true},
	"combat.attack.combo_tier_reached_2": {"exact": true},
	"combat.attack.combo_tier_reached_3": {"exact": true},
	"combat.attack.combo_base_avg_damage": {"tolerance": 8.0, "min": 1.0},
	"combat.attack.combo_tier3_avg_damage": {"tolerance": 10.0, "min": 1.0},
	"combat.attack.combo_tier3_stronger_than_base": {"exact": true},
	"combat.attack.combo_max_armor_break_level": {"tolerance": 1.0, "min": 1.0, "max": 2.0},
	"combat.attack.combo_max_counter": {"tolerance": 2.0, "min": 9.0},
	"combat.shield.activate_frames": {"tolerance": 2.0, "max": 12.0},
	"combat.shield.release_frames": {"tolerance": 2.0, "max": 12.0},
	"combat.shield.collision_active_while_blocking": {"exact": true},
	"combat.shield.collision_inactive_after_release": {"exact": true},
	"combat.shield.rapid_toggle_cycles": {"tolerance": 0.0, "min": 6.0, "max": 6.0},
	"combat.shield.rapid_toggle_mismatch_count": {"tolerance": 0.0, "max": 0.0},
	"combat.shield.rapid_toggle_final_inactive": {"exact": true},
	"combat.shield.base_block_release_flow_ok": {"exact": true},
	"combat.shield.normal_block_outside_perfect_window": {"exact": true},
	"combat.shield.normal_block_window_age_ms": {"tolerance": 140.0, "min": 121.0, "max": 900.0},
	"combat.shield.perfect_block_within_window": {"exact": true},
	"combat.shield.perfect_block_window_age_ms": {"tolerance": 30.0, "min": 0.0, "max": 120.0},
	"combat.projectile.blocked_projectile_consumed": {"exact": true},
	"combat.projectile.shield_active_for_block_test": {"exact": true},
	"combat.projectile.unblocked_projectile_consumed": {"exact": true},
	"combat.projectile.blocked_health_delta": {"tolerance": 0.0, "max": 0.0},
	"combat.projectile.blocked_shield_delta": {"tolerance": 5.0, "min": 1.0},
	"combat.projectile.unblocked_health_delta": {"tolerance": 5.0, "min": 1.0},
	"combat.projectile.normal_block_projectile_reflected": {"exact": false},
	"combat.projectile.perfect_block_projectile_reflected": {"exact": true},
	"combat.projectile.perfect_block_projectile_survived_initial_frames": {"exact": true},
	"combat.projectile.perfect_block_projectile_consumed": {"exact": true},
	"combat.projectile.perfect_block_health_delta": {"tolerance": 0.0, "max": 0.0},
	"combat.projectile.perfect_block_shield_delta": {"tolerance": 4.0, "min": 1.0, "max": 12.0},
	"combat.projectile.perfect_block_shield_delta_reduced": {"exact": true},
	"combat.projectile.perfect_block_vs_normal_shield_delta_gap": {"tolerance": 4.0, "min": 1.0},
	"combat.transitions.victory_transition_frames": {"tolerance": 20.0, "max": 120.0},
	"combat.transitions.defeat_transition_frames": {"tolerance": 20.0, "max": 120.0},
	"combat.transitions.victory_mode_overworld": {"exact": true},
	"combat.transitions.defeat_mode_death": {"exact": true},
	"combat.transitions.victory_result_flag": {"exact": true},
	"combat.transitions.defeat_result_flag": {"exact": true},
	"combat.transitions.combat_end_events_observed": {"tolerance": 0.0, "min": 2.0},
	"save_load.roundtrip_load_success": {"exact": true},
	"save_load.roundtrip_wealth_restored": {"exact": true},
	"save_load.corrupt_load_returns_false": {"exact": true},
	"save_load.corrupt_quarantine_delta": {"tolerance": 0.0, "min": 1.0},
	"save_load.corrupt_resets_defaults": {"exact": true}
}

var failures: Array[String] = []

func _init() -> void:
	call_deferred("_run")

func _run() -> void:
	var metrics_report: Dictionary = _read_json_file(METRICS_PATH)
	if metrics_report.is_empty():
		_finish({}, {}, {})
		return

	var baseline_report: Dictionary = _read_json_file(BASELINE_PATH)
	if baseline_report.is_empty():
		_finish(metrics_report, {}, {})
		return

	var actual_flat: Dictionary = _read_flat_metrics(metrics_report, "metrics report")
	var baseline_flat: Dictionary = _read_flat_metrics(baseline_report, "baseline report")
	if actual_flat.is_empty() or baseline_flat.is_empty():
		_finish(metrics_report, baseline_report, {})
		return

	var comparison_results: Dictionary = {}

	for metric_key in THRESHOLDS.keys():
		var result: Dictionary = _compare_metric(metric_key, actual_flat, baseline_flat, THRESHOLDS[metric_key])
		comparison_results[metric_key] = result
		if not bool(result.get("pass", false)):
			failures.append(_build_failure_context(metric_key, result))

	_finish(metrics_report, baseline_report, comparison_results)

func _read_json_file(path: String) -> Dictionary:
	var file: FileAccess = FileAccess.open(path, FileAccess.READ)
	if file == null:
		failures.append("Could not open JSON file at %s" % path)
		return {}
	var raw: String = file.get_as_text()
	file.close()
	if raw.is_empty():
		failures.append("JSON file is empty at %s" % path)
		return {}
	var parsed: Variant = JSON.parse_string(raw)
	if not (parsed is Dictionary):
		failures.append("JSON file root is not an object at %s" % path)
		return {}
	return parsed as Dictionary

func _read_flat_metrics(report: Dictionary, label: String) -> Dictionary:
	if not report.has("flat_metrics"):
		failures.append("%s missing flat_metrics" % label)
		return {}
	var flat_variant: Variant = report["flat_metrics"]
	if not (flat_variant is Dictionary):
		failures.append("%s flat_metrics must be a dictionary" % label)
		return {}
	return flat_variant as Dictionary

func _compare_metric(metric_key: String, actual_flat: Dictionary, baseline_flat: Dictionary, threshold: Dictionary) -> Dictionary:
	if not baseline_flat.has(metric_key):
		return {
			"pass": false,
			"message": "Baseline is missing metric",
			"metric_key": metric_key,
			"rule": _describe_rule(threshold),
			"actual": actual_flat.get(metric_key, null),
			"expected": null
		}
	if not actual_flat.has(metric_key):
		return {
			"pass": false,
			"message": "Current run is missing metric",
			"metric_key": metric_key,
			"rule": _describe_rule(threshold),
			"actual": null,
			"expected": baseline_flat[metric_key]
		}

	var actual_value: Variant = actual_flat[metric_key]
	var expected_value: Variant = baseline_flat[metric_key]

	if bool(threshold.get("exact", false)):
		var exact_pass: bool = actual_value == expected_value
		return {
			"pass": exact_pass,
			"message": "exact match" if exact_pass else "expected %s but got %s" % [str(expected_value), str(actual_value)],
			"metric_key": metric_key,
			"rule": _describe_rule(threshold),
			"actual": actual_value,
			"expected": expected_value
		}

	if _is_number(actual_value) and _is_number(expected_value):
		var expected_num: float = float(expected_value)
		var actual_num: float = float(actual_value)
		var tolerance: float = maxf(0.0, float(threshold.get("tolerance", 0.0)))
		var min_allowed: float = expected_num - tolerance
		var max_allowed: float = expected_num + tolerance

		if threshold.has("min"):
			min_allowed = maxf(min_allowed, float(threshold["min"]))
		if threshold.has("max"):
			max_allowed = minf(max_allowed, float(threshold["max"]))

		var numeric_pass: bool = actual_num >= min_allowed and actual_num <= max_allowed
		var message: String = "within threshold"
		if not numeric_pass:
			message = "expected %.4f within [%.4f, %.4f], got %.4f" % [expected_num, min_allowed, max_allowed, actual_num]

		return {
			"pass": numeric_pass,
			"message": message,
			"metric_key": metric_key,
			"rule": _describe_rule(threshold),
			"actual": actual_num,
			"expected": expected_num,
			"min_allowed": min_allowed,
			"max_allowed": max_allowed,
			"tolerance": tolerance,
			"delta": actual_num - expected_num
		}

	var variant_pass: bool = actual_value == expected_value
	return {
		"pass": variant_pass,
		"message": "exact variant match" if variant_pass else "expected %s but got %s" % [str(expected_value), str(actual_value)],
		"metric_key": metric_key,
		"rule": _describe_rule(threshold),
		"actual": actual_value,
		"expected": expected_value
	}

func _is_number(value: Variant) -> bool:
	var value_type: int = typeof(value)
	return value_type == TYPE_INT or value_type == TYPE_FLOAT

func _describe_rule(threshold: Dictionary) -> String:
	if bool(threshold.get("exact", false)):
		return "exact match"
	var parts: Array[String] = []
	if threshold.has("tolerance"):
		parts.append("baseline±%.4f" % float(threshold["tolerance"]))
	if threshold.has("min"):
		parts.append("min>=%.4f" % float(threshold["min"]))
	if threshold.has("max"):
		parts.append("max<=%.4f" % float(threshold["max"]))
	if parts.is_empty():
		return "baseline numeric equality"
	return ", ".join(parts)

func _build_failure_context(metric_key: String, result: Dictionary) -> String:
	var message: String = str(result.get("message", "unknown comparison failure"))
	var rule: String = str(result.get("rule", "unspecified rule"))
	var actual: String = str(result.get("actual", "null"))
	var expected: String = str(result.get("expected", "null"))
	var bounds: String = ""
	if result.has("min_allowed") and result.has("max_allowed"):
		bounds = ", allowed=[%s..%s]" % [str(result["min_allowed"]), str(result["max_allowed"])]
	var delta: String = ""
	if result.has("delta"):
		delta = ", delta=%s" % str(result["delta"])
	return "%s: %s (rule=%s, expected=%s, actual=%s%s%s)" % [metric_key, message, rule, expected, actual, bounds, delta]

func _finish(metrics_report: Dictionary, baseline_report: Dictionary, comparison_results: Dictionary) -> void:
	var summary := {
		"meta": {
			"compared_at_unix": Time.get_unix_time_from_system(),
			"godot_version": Engine.get_version_info(),
			"platform": OS.get_name()
		},
		"status": "pass" if failures.is_empty() else "fail",
		"metrics_path": METRICS_PATH,
		"baseline_path": BASELINE_PATH,
		"threshold_count": THRESHOLDS.size(),
		"regression_count": failures.size(),
		"regressions": failures.duplicate(),
		"comparison_results": comparison_results,
		"metrics_report_status": str(metrics_report.get("status", "unknown")) if not metrics_report.is_empty() else "missing",
		"baseline_schema_version": int(baseline_report.get("schema_version", -1)) if not baseline_report.is_empty() else -1
	}

	DirAccess.make_dir_recursive_absolute(OUTPUT_DIR)
	var file: FileAccess = FileAccess.open(OUTPUT_PATH, FileAccess.WRITE)
	if file == null:
		push_error("RuntimeRegressionCompare: Failed to write comparison report to %s" % OUTPUT_PATH)
	else:
		file.store_string(JSON.stringify(summary))
		file.close()

	print("RuntimeRegressionCompare: OUTPUT_PATH=%s" % OUTPUT_PATH)
	print("RuntimeRegressionCompare: STATUS=%s" % summary["status"])

	if failures.is_empty():
		print("RuntimeRegressionCompare: PASS")
		quit(0)
		return

	print("RuntimeRegressionCompare: FAIL (%d)" % failures.size())
	for failure in failures:
		print(" - ", failure)
	quit(1)
