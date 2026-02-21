extends SceneTree

const CombatConstants = preload("res://scripts/combat_constants.gd")
const ENEMY_SCENE: PackedScene = preload("res://scenes/combat/enemy.tscn")

const OUTPUT_DIR: String = "user://blood_validation"
const OUTPUT_FILE: String = "user://blood_validation/blood_feature_validation_latest.json"

var failures: Array[String] = []
var feature_results: Dictionary = {}

var _harness_root: Node2D = null
var _player_stub: Node2D = null
var _particle_manager: Node = null

func _init() -> void:
	call_deferred("_run")

func _run() -> void:
	_particle_manager = root.get_node_or_null("ParticleManager")
	_assert(_particle_manager != null, "ParticleManager singleton must exist for blood feature validation")
	if _particle_manager == null:
		_finish()
		return

	_harness_root = Node2D.new()
	_harness_root.name = "BloodFeatureHarnessRoot"
	root.add_child(_harness_root)

	_player_stub = Node2D.new()
	_player_stub.name = "BloodFeaturePlayerStub"
	_player_stub.add_to_group("player")
	_harness_root.add_child(_player_stub)
	await _wait_frames(3)

	await _test_spray_trigger_and_directionality()
	await _test_explosion_trigger_on_death()
	await _test_drip_threshold_behavior()
	await _test_decal_pool_and_fade_lifecycle()
	await _test_enemy_tint_integration()
	await _test_quality_scaling_and_hard_cap()

	await _drain_effects(3500)
	if is_instance_valid(_harness_root):
		_harness_root.queue_free()
	await _wait_frames(3)
	_finish()

func _test_spray_trigger_and_directionality() -> void:
	await _drain_effects(2200)
	var enemy: CombatEnemy = await _spawn_enemy("grunt", Vector2(180.0, 0.0))
	if enemy == null:
		_record_feature("spray_on_enemy_hit", false, {"error": "failed_to_spawn_enemy"})
		return

	enemy.max_health = max(enemy.max_health, 120)
	enemy.health = enemy.max_health

	var pool_size: int = _particle_manager.blood_particle_pool.size()
	var before_index: int = _particle_manager.pool_index
	var hit_direction: Vector2 = Vector2.RIGHT
	enemy.take_damage(4, hit_direction)
	await _wait_frames(2)

	var after_index: int = _particle_manager.pool_index
	var burst_count: int = _index_delta(before_index, after_index, pool_size)
	var used_particles: Array[CPUParticles2D] = _get_recent_blood_particles(before_index, burst_count)
	var direction_dots: Array[float] = []
	for particles in used_particles:
		direction_dots.append(particles.direction.normalized().dot(hit_direction))

	var avg_dot: float = _average(direction_dots)
	var min_dot: float = direction_dots.min() if not direction_dots.is_empty() else -1.0
	var passed_check: bool = burst_count > 0 and avg_dot > 0.6 and min_dot > 0.45
	_record_feature("spray_on_enemy_hit", passed_check, {
		"burst_count": burst_count,
		"avg_direction_dot": avg_dot,
		"min_direction_dot": min_dot,
		"expected_hit_direction": [hit_direction.x, hit_direction.y]
	})

	if is_instance_valid(enemy):
		enemy.queue_free()
	await _wait_frames(1)

func _test_explosion_trigger_on_death() -> void:
	await _drain_effects(2200)
	var enemy: CombatEnemy = await _spawn_enemy("grunt", Vector2(220.0, 0.0))
	if enemy == null:
		_record_feature("explosion_on_enemy_death", false, {"error": "failed_to_spawn_enemy"})
		return

	enemy.max_health = 1
	enemy.health = 1

	var pool_size: int = _particle_manager.blood_particle_pool.size()
	var before_index: int = _particle_manager.pool_index
	enemy.take_damage(999, Vector2.UP)
	await _wait_frames(2)

	var after_index: int = _particle_manager.pool_index
	var burst_count: int = _index_delta(before_index, after_index, pool_size)
	var expected_burst: int = CombatConstants.BLOOD_DEATH_BURST_COUNT
	var passed_check: bool = burst_count >= expected_burst
	_record_feature("explosion_on_enemy_death", passed_check, {
		"burst_count": burst_count,
		"expected_min_burst_count": expected_burst
	})

func _test_drip_threshold_behavior() -> void:
	await _drain_effects(2200)
	var pool_size: int = max(1, int(CombatConstants.BLOOD_DRIP_POOL_SIZE))
	var threshold: float = CombatConstants.BLOOD_DRIP_INTENSITY_THRESHOLD

	var low_before: int = _particle_manager.drip_pool_index
	_particle_manager.play_blood_effect(Vector2(20.0, 20.0), Vector2.RIGHT, threshold - 0.05, 1)
	await _wait_frames(2)
	var low_after: int = _particle_manager.drip_pool_index
	var low_delta: int = _index_delta(low_before, low_after, pool_size)

	var high_before: int = _particle_manager.drip_pool_index
	_particle_manager.play_blood_effect(Vector2(24.0, 20.0), Vector2.RIGHT, threshold + 0.4, 1)
	await _wait_frames(2)
	var high_after: int = _particle_manager.drip_pool_index
	var high_delta: int = _index_delta(high_before, high_after, pool_size)

	var passed_check: bool = low_delta == 0 and high_delta >= 1
	_record_feature("drip_threshold", passed_check, {
		"threshold": threshold,
		"low_intensity_delta": low_delta,
		"high_intensity_delta": high_delta
	})

func _test_decal_pool_and_fade_lifecycle() -> void:
	await _drain_effects(2200)
	_clear_active_decals()
	await _wait_frames(1)

	var decal_pool_size: int = _particle_manager.blood_decal_pool.size()
	var stress_calls: int = decal_pool_size * 3
	for i in range(stress_calls):
		_particle_manager.play_blood_effect(Vector2(float(i), 42.0), Vector2.UP, 4.0, 1)

	await _wait_frames(3)

	var active_decals: int = _particle_manager.active_decal_states.size()
	var bounded: bool = active_decals <= decal_pool_size
	var created: bool = active_decals > 0

	var fade_observed: bool = false
	var removed_after_expire: bool = false
	var alpha_before: float = -1.0
	var alpha_mid: float = -1.0

	if not _particle_manager.active_decal_states.is_empty():
		var state: Dictionary = _particle_manager.active_decal_states[0]
		var decal_variant: Variant = state.get("node", null)
		if decal_variant is Sprite2D:
			var decal: Sprite2D = decal_variant as Sprite2D
			alpha_before = decal.modulate.a
			var now_ms: int = Time.get_ticks_msec()
			state["fade_start_ms"] = now_ms - 100
			state["expire_ms"] = now_ms + 120
			state["base_alpha"] = alpha_before
			_particle_manager.active_decal_states[0] = state

			await create_timer(0.09).timeout
			alpha_mid = decal.modulate.a
			fade_observed = alpha_mid < alpha_before - 0.01

			await create_timer(0.20).timeout
			removed_after_expire = not _contains_active_decal(decal) and not decal.visible

	var passed_check: bool = created and bounded and fade_observed and removed_after_expire
	_record_feature("decal_pool_and_fade", passed_check, {
		"decal_pool_size": decal_pool_size,
		"active_decals_after_stress": active_decals,
		"created_decals": created,
		"bounded_by_pool": bounded,
		"alpha_before": alpha_before,
		"alpha_mid": alpha_mid,
		"fade_observed": fade_observed,
		"removed_after_expire": removed_after_expire
	})

func _test_enemy_tint_integration() -> void:
	await _drain_effects(2200)
	var sample_types: Array[String] = ["grunt", "heavy", "archer"]
	var captured: Dictionary = {}
	var passed_check: bool = true
	var expected_tints: Dictionary = {}

	for type_name in sample_types:
		var capture: Dictionary = await _capture_enemy_hit_sample(type_name)
		captured[type_name] = capture
		expected_tints[type_name] = _color_to_array(CombatConstants.get_enemy_blood_tint(type_name))
		if not bool(capture.get("ok", false)):
			passed_check = false

	var grunt_color: Color = _array_to_color(captured.get("grunt", {}).get("particle_color", []))
	var heavy_color: Color = _array_to_color(captured.get("heavy", {}).get("particle_color", []))
	var archer_color: Color = _array_to_color(captured.get("archer", {}).get("particle_color", []))
	var color_divergence_ok: bool = _color_distance(grunt_color, heavy_color) > 0.03 \
		and _color_distance(grunt_color, archer_color) > 0.015
	passed_check = passed_check and color_divergence_ok

	_record_feature("enemy_tint_integration", passed_check, {
		"captures": captured,
		"expected_tints": expected_tints,
		"color_divergence_ok": color_divergence_ok,
		"distance_grunt_heavy": _color_distance(grunt_color, heavy_color),
		"distance_grunt_archer": _color_distance(grunt_color, archer_color)
	})

func _test_quality_scaling_and_hard_cap() -> void:
	await _drain_effects(2200)
	_clear_active_decals()
	await _wait_frames(1)

	var pool_size: int = _particle_manager.blood_particle_pool.size()
	var soft_cap: int = CombatConstants.BLOOD_SOFT_ACTIVE_EFFECTS
	var hard_cap: int = CombatConstants.BLOOD_MAX_ACTIVE_EFFECTS

	var baseline_index: int = _particle_manager.pool_index
	_particle_manager.play_blood_effect(Vector2(-20.0, -20.0), Vector2.RIGHT, 1.0, 1)
	await _wait_frames(1)
	var baseline_delta: int = _index_delta(baseline_index, _particle_manager.pool_index, pool_size)
	var baseline_amount: int = _get_last_blood_particle_amount(baseline_index, baseline_delta)

	for i in range(soft_cap + 3):
		_particle_manager.play_blood_effect(Vector2(-50.0 + float(i), -18.0), Vector2.RIGHT, 1.0, 1)
	await _wait_frames(2)

	var active_after_soft: int = _particle_manager.get_active_effect_count()
	var quality_after_soft: float = _particle_manager._get_effect_quality_scale()

	var scaled_index: int = _particle_manager.pool_index
	_particle_manager.play_blood_effect(Vector2(-8.0, -20.0), Vector2.RIGHT, 1.0, 1)
	await _wait_frames(1)
	var scaled_delta: int = _index_delta(scaled_index, _particle_manager.pool_index, pool_size)
	var scaled_amount: int = _get_last_blood_particle_amount(scaled_index, scaled_delta)

	var guard: int = 0
	while _particle_manager.get_active_effect_count() < hard_cap and guard < 220:
		_particle_manager.play_blood_effect(Vector2(-80.0 + float(guard), -12.0), Vector2.RIGHT, 1.0, 1)
		guard += 1
	await _wait_frames(2)

	var active_at_cap: int = _particle_manager.get_active_effect_count()
	var quality_at_cap: float = _particle_manager._get_effect_quality_scale()
	var blocked_index: int = _particle_manager.pool_index
	_particle_manager.play_blood_effect(Vector2(6.0, -20.0), Vector2.RIGHT, 1.0, 1)
	await _wait_frames(1)
	var blocked_delta: int = _index_delta(blocked_index, _particle_manager.pool_index, pool_size)

	var scaling_engaged: bool = active_after_soft > soft_cap and quality_after_soft < 1.0 and scaled_amount < baseline_amount
	var hard_cap_blocked: bool = active_at_cap >= hard_cap and quality_at_cap <= 0.0 and blocked_delta == 0
	var passed_check: bool = baseline_delta >= 1 and scaling_engaged and hard_cap_blocked
	_record_feature("quality_scaling_and_hard_cap", passed_check, {
		"soft_cap": soft_cap,
		"hard_cap": hard_cap,
		"active_after_soft": active_after_soft,
		"quality_after_soft": quality_after_soft,
		"baseline_amount": baseline_amount,
		"scaled_amount": scaled_amount,
		"active_at_cap": active_at_cap,
		"quality_at_cap": quality_at_cap,
		"blocked_delta": blocked_delta,
		"loop_guard_iterations": guard
	})

func _capture_enemy_hit_sample(type_name: String) -> Dictionary:
	_set_particle_rng_seed(90210)
	var enemy: CombatEnemy = await _spawn_enemy(type_name, Vector2(280.0, 0.0))
	if enemy == null:
		return {"ok": false, "error": "spawn_failed"}

	enemy.max_health = max(enemy.max_health, 120)
	enemy.health = enemy.max_health

	var pool_size: int = _particle_manager.blood_particle_pool.size()
	var before_index: int = _particle_manager.pool_index
	enemy.take_damage(4, Vector2.RIGHT)
	await _wait_frames(2)
	var burst_count: int = _index_delta(before_index, _particle_manager.pool_index, pool_size)
	var particle_color: Color = Color.BLACK
	if burst_count > 0:
		var idx: int = before_index % pool_size
		var particle_variant: Variant = _particle_manager.blood_particle_pool[idx]
		if particle_variant is CPUParticles2D:
			particle_color = (particle_variant as CPUParticles2D).color

	if is_instance_valid(enemy):
		enemy.queue_free()
	await _wait_frames(1)

	var expected_tint: Color = CombatConstants.get_enemy_blood_tint(type_name)
	return {
		"ok": burst_count > 0,
		"burst_count": burst_count,
		"particle_color": _color_to_array(particle_color),
		"expected_tint": _color_to_array(expected_tint),
		"distance_to_expected": _color_distance(particle_color, expected_tint)
	}

func _spawn_enemy(type_name: String, position: Vector2) -> CombatEnemy:
	var enemy := ENEMY_SCENE.instantiate() as CombatEnemy
	if enemy == null:
		_assert(false, "Enemy scene should instantiate for type %s" % type_name)
		return null
	enemy.enable_dialog_barks = false
	enemy.enemy_type = type_name
	_harness_root.add_child(enemy)
	enemy.global_position = position
	await _wait_frames(2)
	return enemy

func _clear_active_decals() -> void:
	for state_variant in _particle_manager.active_decal_states:
		if not (state_variant is Dictionary):
			continue
		var state: Dictionary = state_variant as Dictionary
		var decal_variant: Variant = state.get("node", null)
		if decal_variant is Sprite2D:
			var decal: Sprite2D = decal_variant as Sprite2D
			decal.visible = false
			var color: Color = decal.modulate
			color.a = 0.0
			decal.modulate = color
	_particle_manager.active_decal_states.clear()

func _contains_active_decal(target: Sprite2D) -> bool:
	for state_variant in _particle_manager.active_decal_states:
		if not (state_variant is Dictionary):
			continue
		var state: Dictionary = state_variant as Dictionary
		var decal_variant: Variant = state.get("node", null)
		if decal_variant is Sprite2D and decal_variant == target:
			return true
	return false

func _drain_effects(max_wait_ms: int) -> void:
	var start_ms: int = Time.get_ticks_msec()
	while Time.get_ticks_msec() - start_ms < max_wait_ms:
		var active_effects: int = _particle_manager.get_active_effect_count()
		if active_effects <= 0:
			break
		await create_timer(0.05).timeout
	await create_timer(0.15).timeout

func _set_particle_rng_seed(seed_value: int) -> void:
	var rng_variant: Variant = _particle_manager.get("_rng")
	if rng_variant is RandomNumberGenerator:
		var rng: RandomNumberGenerator = rng_variant as RandomNumberGenerator
		rng.seed = seed_value

func _get_recent_blood_particles(start_index: int, count: int) -> Array[CPUParticles2D]:
	var particles: Array[CPUParticles2D] = []
	if count <= 0:
		return particles
	var pool_size: int = _particle_manager.blood_particle_pool.size()
	if pool_size <= 0:
		return particles
	for i in range(count):
		var idx: int = (start_index + i) % pool_size
		var particle_variant: Variant = _particle_manager.blood_particle_pool[idx]
		if particle_variant is CPUParticles2D:
			particles.append(particle_variant as CPUParticles2D)
	return particles

func _get_last_blood_particle_amount(start_index: int, burst_delta: int) -> int:
	if burst_delta <= 0:
		return 0
	var pool_size: int = _particle_manager.blood_particle_pool.size()
	if pool_size <= 0:
		return 0
	var idx: int = (start_index + burst_delta - 1) % pool_size
	var particle_variant: Variant = _particle_manager.blood_particle_pool[idx]
	if particle_variant is CPUParticles2D:
		return int((particle_variant as CPUParticles2D).amount)
	return 0

func _index_delta(before: int, after: int, modulo: int) -> int:
	if modulo <= 0:
		return max(0, after - before)
	var delta: int = (after - before) % modulo
	if delta < 0:
		delta += modulo
	return delta

func _color_distance(a: Color, b: Color) -> float:
	var dr: float = a.r - b.r
	var dg: float = a.g - b.g
	var db: float = a.b - b.b
	return sqrt(dr * dr + dg * dg + db * db)

func _color_to_array(color: Color) -> Array[float]:
	return [color.r, color.g, color.b, color.a]

func _array_to_color(raw: Variant) -> Color:
	if raw is Array and (raw as Array).size() >= 4:
		var values: Array = raw as Array
		return Color(float(values[0]), float(values[1]), float(values[2]), float(values[3]))
	return Color.BLACK

func _average(values: Array[float]) -> float:
	if values.is_empty():
		return 0.0
	var total: float = 0.0
	for value in values:
		total += value
	return total / float(values.size())

func _record_feature(feature_name: String, passed: bool, details: Dictionary) -> void:
	feature_results[feature_name] = {
		"passed": passed,
		"details": details
	}
	if not passed:
		failures.append("%s failed" % feature_name)
		push_error("BloodFeatureValidation: %s failed: %s" % [feature_name, JSON.stringify(details)])

func _assert(condition: bool, message: String) -> void:
	if condition:
		return
	failures.append(message)
	push_error("BloodFeatureValidation: %s" % message)

func _write_report(report: Dictionary) -> bool:
	DirAccess.make_dir_recursive_absolute(OUTPUT_DIR)
	var file: FileAccess = FileAccess.open(OUTPUT_FILE, FileAccess.WRITE)
	if file == null:
		push_error("BloodFeatureValidation: failed to open report file")
		return false
	file.store_string(JSON.stringify(report))
	file.close()
	return true

func _wait_frames(frame_count: int) -> void:
	for _i in range(frame_count):
		await process_frame

func _finish() -> void:
	var overall_pass: bool = failures.is_empty()
	var report := {
		"meta": {
			"captured_at_unix": Time.get_unix_time_from_system(),
			"godot_version": Engine.get_version_info(),
			"platform": OS.get_name()
		},
		"overall_status": "pass" if overall_pass else "fail",
		"failures": failures,
		"features": feature_results
	}

	var write_ok: bool = _write_report(report)
	if not write_ok:
		failures.append("failed_to_write_report")
		overall_pass = false

	print("BloodFeatureValidation: REPORT_PATH=%s" % OUTPUT_FILE)
	print("BloodFeatureValidation: SUMMARY_JSON=%s" % JSON.stringify({
		"overall_status": "pass" if overall_pass else "fail",
		"feature_count": feature_results.size(),
		"failure_count": failures.size()
	}))

	if overall_pass:
		print("BloodFeatureValidation: PASS")
		quit(0)
		return

	print("BloodFeatureValidation: FAIL (%d)" % failures.size())
	for failure in failures:
		print(" - ", failure)
	quit(1)
