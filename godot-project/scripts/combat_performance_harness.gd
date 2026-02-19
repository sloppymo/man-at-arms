extends SceneTree

const CombatConstants = preload("res://scripts/combat_constants.gd")

const SAMPLE_INTERVAL_SEC: float = 0.1
const WARMUP_DURATION_SEC: float = 1.5
const CAPTURE_DURATION_SEC: float = 8.0
const OUTPUT_DIR: String = "user://combat_metrics"
const OUTPUT_FILE: String = "user://combat_metrics/combat_metrics_latest.json"

var failures: Array[String] = []

func _init() -> void:
	call_deferred("_run")

func _run() -> void:
	_cleanup_save_file()
	await _wait_frames(2)

	var game_modes: Node = root.get_node_or_null("GameModes")
	_assert(game_modes != null, "GameModes singleton must exist")
	if game_modes == null:
		_finish()
		return

	var to_combat_ok: bool = game_modes.set_mode(game_modes.GameMode.COMBAT, true)
	_assert(to_combat_ok, "Mode transition to COMBAT should succeed")
	if not to_combat_ok:
		_finish()
		return

	var reached_combat: bool = await _wait_for_scene("res://scenes/combat/combat_scene.tscn", 90)
	_assert(reached_combat, "Combat scene should load for performance harness")
	if not reached_combat:
		_finish()
		return

	var combat_scene: CombatScene = current_scene as CombatScene
	_assert(combat_scene != null, "Current scene should be CombatScene")
	if combat_scene == null or combat_scene.player == null:
		_finish()
		return

	_prepare_close_combat_target(combat_scene)
	await _wait_frames(3)
	await _run_warmup(combat_scene)

	var samples: Array[Dictionary] = []
	var start_ms: int = Time.get_ticks_msec()
	var sample_index: int = 0

	while Time.get_ticks_msec() - start_ms < int(CAPTURE_DURATION_SEC * 1000.0):
		if not _is_combat_scene_usable(combat_scene):
			_assert(false, "Combat scene became unavailable during capture loop")
			break
		_drive_combat_activity(combat_scene, sample_index)
		samples.append(_collect_sample(combat_scene, start_ms))
		sample_index += 1
		await create_timer(SAMPLE_INTERVAL_SEC).timeout

	_assert(not samples.is_empty(), "Performance harness should capture at least one sample")
	if samples.is_empty():
		_finish()
		return

	var summary: Dictionary = _build_summary(samples)
	var report := {
		"meta": {
			"captured_at_unix": Time.get_unix_time_from_system(),
			"godot_version": Engine.get_version_info(),
			"platform": OS.get_name()
		},
		"config": {
			"warmup_duration_sec": WARMUP_DURATION_SEC,
			"duration_sec": CAPTURE_DURATION_SEC,
			"sample_interval_sec": SAMPLE_INTERVAL_SEC
		},
		"samples": samples,
		"summary": summary
	}

	var save_ok: bool = _write_report(report)
	_assert(save_ok, "Performance report should be written to %s" % OUTPUT_FILE)

	print("CombatPerformanceHarness: REPORT_PATH=%s" % OUTPUT_FILE)
	print("CombatPerformanceHarness: SUMMARY_JSON=%s" % JSON.stringify(summary))
	await _flush_transient_effects()
	await _cleanup_runtime_scene()
	_finish()

func _run_warmup(combat_scene: CombatScene) -> void:
	var warmup_start: int = Time.get_ticks_msec()
	var step: int = 0
	while Time.get_ticks_msec() - warmup_start < int(WARMUP_DURATION_SEC * 1000.0):
		if not _is_combat_scene_usable(combat_scene):
			_assert(false, "Combat scene became unavailable during warmup")
			break
		_drive_combat_activity(combat_scene, step)
		step += 1
		await create_timer(SAMPLE_INTERVAL_SEC).timeout

func _prepare_close_combat_target(combat_scene: CombatScene) -> void:
	if combat_scene.enemies_node == null or combat_scene.player == null:
		return

	combat_scene.player.max_health = max(combat_scene.player.max_health, 500)
	combat_scene.player.health = combat_scene.player.max_health

	var target_assigned: bool = false
	for child in combat_scene.enemies_node.get_children():
		if child is CombatEnemy and child.is_alive:
			var enemy: CombatEnemy = child as CombatEnemy
			enemy.speed = 0.0
			enemy.attack_range = 0.0
			enemy.damage = 0
			if not target_assigned:
				target_assigned = true
				enemy.global_position = combat_scene.player.global_position + Vector2(40, 0)
				enemy.max_health = max(enemy.max_health, 500)
				enemy.health = enemy.max_health
			else:
				enemy.global_position = Vector2(-10000, -10000)

func _drive_combat_activity(combat_scene: CombatScene, sample_index: int) -> void:
	if sample_index % 2 != 0:
		return
	if not _is_combat_scene_usable(combat_scene):
		return

	combat_scene.player.update_nearby_enemies()
	combat_scene.player.handle_attack()

func _collect_sample(combat_scene: CombatScene, start_ms: int) -> Dictionary:
	var now_ms: int = Time.get_ticks_msec()
	var fps: float = float(Engine.get_frames_per_second())
	var frame_time_ms: float = 0.0 if fps <= 0.0 else 1000.0 / fps

	return {
		"timestamp_ms": now_ms - start_ms,
		"fps": fps,
		"frame_time_ms": frame_time_ms,
		"memory_mb": _get_memory_mb(),
		"active_enemies": _count_active_enemies(combat_scene),
		"active_effects": _count_active_effects()
	}

func _build_summary(samples: Array[Dictionary]) -> Dictionary:
	var fps_values: Array[float] = []
	var frame_time_values: Array[float] = []
	var memory_values: Array[float] = []
	var enemy_counts: Array[float] = []
	var effect_counts: Array[float] = []

	for sample in samples:
		fps_values.append(float(sample["fps"]))
		frame_time_values.append(float(sample["frame_time_ms"]))
		memory_values.append(float(sample["memory_mb"]))
		enemy_counts.append(float(sample["active_enemies"]))
		effect_counts.append(float(sample["active_effects"]))

	return {
		"sample_count": samples.size(),
		"avg_fps": _average(fps_values),
		"min_fps": fps_values.min(),
		"max_fps": fps_values.max(),
		"avg_frame_time_ms": _average(frame_time_values),
		"p95_frame_time_ms": _percentile(frame_time_values, 0.95),
		"avg_memory_mb": _average(memory_values),
		"memory_start_mb": memory_values[0],
		"memory_end_mb": memory_values[-1],
		"memory_peak_mb": memory_values.max(),
		"memory_delta_mb": memory_values[-1] - memory_values[0],
		"avg_active_enemies": _average(enemy_counts),
		"avg_active_effects": _average(effect_counts)
	}

func _average(values: Array[float]) -> float:
	if values.is_empty():
		return 0.0
	var total: float = 0.0
	for value in values:
		total += value
	return total / float(values.size())

func _percentile(values: Array[float], q: float) -> float:
	if values.is_empty():
		return 0.0
	var sorted_values: Array[float] = values.duplicate()
	sorted_values.sort()
	var idx: int = int(ceil(float(sorted_values.size()) * q)) - 1
	idx = clampi(idx, 0, sorted_values.size() - 1)
	return sorted_values[idx]

func _count_active_enemies(combat_scene: CombatScene) -> int:
	if not _is_combat_scene_usable(combat_scene) or combat_scene.enemies_node == null:
		return 0
	var count: int = 0
	for child in combat_scene.enemies_node.get_children():
		if child is CombatEnemy and child.is_alive:
			count += 1
	return count

func _count_active_effects() -> int:
	var particle_manager: Node = root.get_node_or_null("ParticleManager")
	if particle_manager and particle_manager.has_method("get_active_effect_count"):
		return int(particle_manager.get_active_effect_count())
	return get_nodes_in_group("combat_effects").size()

func _get_memory_mb() -> float:
	var monitor = Performance.get_monitor(Performance.MEMORY_STATIC)
	if monitor == null:
		return 0.0
	return float(monitor) / (1024.0 * 1024.0)

func _write_report(report: Dictionary) -> bool:
	DirAccess.make_dir_recursive_absolute(OUTPUT_DIR)
	var file: FileAccess = FileAccess.open(OUTPUT_FILE, FileAccess.WRITE)
	if file == null:
		push_error("CombatPerformanceHarness: Failed to open report file for writing")
		return false
	file.store_string(JSON.stringify(report))
	file.close()
	return true

func _wait_for_scene(scene_path: String, max_frames: int) -> bool:
	for _i in range(max_frames):
		if current_scene and current_scene.scene_file_path == scene_path:
			return true
		await process_frame
	return false

func _wait_frames(frame_count: int) -> void:
	for _i in range(frame_count):
		await process_frame

func _is_combat_scene_usable(combat_scene: CombatScene) -> bool:
	if combat_scene == null or not is_instance_valid(combat_scene):
		return false
	if combat_scene.get_tree() == null:
		return false
	if combat_scene.player == null or not is_instance_valid(combat_scene.player):
		return false
	if combat_scene.is_game_over:
		return false
	return true

func _cleanup_save_file() -> void:
	DirAccess.remove_absolute("user://savegame.json")

func _cleanup_runtime_scene() -> void:
	var scene: Node = current_scene
	if is_instance_valid(scene):
		scene.free()
	await _wait_frames(5)

func _flush_transient_effects() -> void:
	var max_wait_ms: int = 1500
	var start_ms: int = Time.get_ticks_msec()
	while Time.get_ticks_msec() - start_ms < max_wait_ms:
		var effects_remaining: int = _count_active_effects()
		if effects_remaining <= 0:
			break
		await create_timer(0.05).timeout

	# Extra frame drain for queued timer/tween cleanup.
	await create_timer(0.25).timeout

func _assert(condition: bool, message: String) -> void:
	if condition:
		return
	failures.append(message)
	push_error("CombatPerformanceHarness: %s" % message)

func _finish() -> void:
	if failures.is_empty():
		print("CombatPerformanceHarness: PASS")
		quit(0)
		return

	print("CombatPerformanceHarness: FAIL (%d)" % failures.size())
	for failure in failures:
		print(" - ", failure)
	quit(1)
