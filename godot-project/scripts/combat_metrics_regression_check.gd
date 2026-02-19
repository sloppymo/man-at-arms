extends SceneTree

const METRICS_FILE: String = "user://combat_metrics/combat_metrics_latest.json"

const MIN_SAMPLE_COUNT: int = 60
const MIN_AVG_FPS: float = 55.0
const MIN_FPS_FLOOR: float = 25.0
const MAX_P95_FRAME_TIME_MS: float = 20.0
const MAX_MEMORY_DELTA_MB: float = 32.0
const MAX_MEMORY_PEAK_MB: float = 512.0
const MIN_AVG_ACTIVE_ENEMIES: float = 1.0
const MAX_AVG_ACTIVE_ENEMIES: float = 8.0
const MAX_AVG_ACTIVE_EFFECTS: float = 6.0

var failures: Array[String] = []

func _init() -> void:
	call_deferred("_run")

func _run() -> void:
	var report: Dictionary = _read_report()
	if report.is_empty():
		_finish()
		return

	var summary_variant: Variant = report.get("summary", null)
	_assert(summary_variant is Dictionary, "Performance report must contain summary dictionary")
	if not (summary_variant is Dictionary):
		_finish()
		return
	var summary: Dictionary = summary_variant as Dictionary

	var required_fields: Array[String] = [
		"sample_count",
		"avg_fps",
		"min_fps",
		"p95_frame_time_ms",
		"memory_delta_mb",
		"memory_peak_mb",
		"avg_active_enemies",
		"avg_active_effects"
	]
	for field_name in required_fields:
		_assert(summary.has(field_name), "Summary is missing required field '%s'" % field_name)

	if not failures.is_empty():
		_finish()
		return

	var sample_count: int = int(summary["sample_count"])
	var avg_fps: float = _as_float(summary["avg_fps"])
	var min_fps: float = _as_float(summary["min_fps"])
	var p95_frame_time_ms: float = _as_float(summary["p95_frame_time_ms"])
	var memory_delta_mb: float = _as_float(summary["memory_delta_mb"])
	var memory_peak_mb: float = _as_float(summary["memory_peak_mb"])
	var avg_active_enemies: float = _as_float(summary["avg_active_enemies"])
	var avg_active_effects: float = _as_float(summary["avg_active_effects"])

	_assert(sample_count >= MIN_SAMPLE_COUNT, "sample_count should be >= %d (got %d)" % [MIN_SAMPLE_COUNT, sample_count])
	_assert(avg_fps >= MIN_AVG_FPS, "avg_fps should be >= %.2f (got %.2f)" % [MIN_AVG_FPS, avg_fps])
	_assert(min_fps >= MIN_FPS_FLOOR, "min_fps should be >= %.2f (got %.2f)" % [MIN_FPS_FLOOR, min_fps])
	_assert(p95_frame_time_ms <= MAX_P95_FRAME_TIME_MS, "p95_frame_time_ms should be <= %.2f (got %.2f)" % [MAX_P95_FRAME_TIME_MS, p95_frame_time_ms])
	_assert(memory_delta_mb <= MAX_MEMORY_DELTA_MB, "memory_delta_mb should be <= %.2f (got %.2f)" % [MAX_MEMORY_DELTA_MB, memory_delta_mb])
	_assert(memory_peak_mb <= MAX_MEMORY_PEAK_MB, "memory_peak_mb should be <= %.2f (got %.2f)" % [MAX_MEMORY_PEAK_MB, memory_peak_mb])
	_assert(avg_active_enemies >= MIN_AVG_ACTIVE_ENEMIES, "avg_active_enemies should be >= %.2f (got %.2f)" % [MIN_AVG_ACTIVE_ENEMIES, avg_active_enemies])
	_assert(avg_active_enemies <= MAX_AVG_ACTIVE_ENEMIES, "avg_active_enemies should be <= %.2f (got %.2f)" % [MAX_AVG_ACTIVE_ENEMIES, avg_active_enemies])
	_assert(avg_active_effects <= MAX_AVG_ACTIVE_EFFECTS, "avg_active_effects should be <= %.2f (got %.2f)" % [MAX_AVG_ACTIVE_EFFECTS, avg_active_effects])

	print("CombatMetricsRegressionCheck: SUMMARY_JSON=%s" % JSON.stringify(summary))
	_finish()

func _read_report() -> Dictionary:
	var file: FileAccess = FileAccess.open(METRICS_FILE, FileAccess.READ)
	_assert(file != null, "Could not open metrics report at %s" % METRICS_FILE)
	if file == null:
		return {}

	var raw: String = file.get_as_text()
	file.close()
	_assert(not raw.is_empty(), "Metrics report is empty at %s" % METRICS_FILE)
	if raw.is_empty():
		return {}

	var parsed: Variant = JSON.parse_string(raw)
	_assert(parsed is Dictionary, "Metrics report root should be a dictionary")
	if not (parsed is Dictionary):
		return {}

	return parsed as Dictionary

func _as_float(value: Variant) -> float:
	match typeof(value):
		TYPE_FLOAT, TYPE_INT:
			return float(value)
		_:
			return 0.0

func _assert(condition: bool, message: String) -> void:
	if condition:
		return
	failures.append(message)
	push_error("CombatMetricsRegressionCheck: %s" % message)

func _finish() -> void:
	if failures.is_empty():
		print("CombatMetricsRegressionCheck: PASS")
		quit(0)
		return

	print("CombatMetricsRegressionCheck: FAIL (%d)" % failures.size())
	for failure in failures:
		print(" - ", failure)
	quit(1)
