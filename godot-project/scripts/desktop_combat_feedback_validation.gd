extends SceneTree

const CombatConstants = preload("res://scripts/combat_constants.gd")

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
	_assert(to_combat_ok, "Should enter combat mode for desktop feedback validation")
	if not to_combat_ok:
		_finish()
		return

	var reached_combat: bool = await _wait_for_scene("res://scenes/combat/combat_scene.tscn", 180)
	_assert(reached_combat, "Combat scene should load for desktop feedback validation")
	if not reached_combat:
		_finish()
		return

	var combat_scene: CombatScene = current_scene as CombatScene
	_assert(combat_scene != null and combat_scene.player != null, "Combat scene and player must initialize")
	if combat_scene == null or combat_scene.player == null:
		_finish()
		return

	var enemy: CombatEnemy = _get_first_alive_enemy(combat_scene)
	_assert(enemy != null, "Desktop feedback validation requires at least one alive enemy")
	if enemy == null:
		_finish()
		return

	enemy.global_position = combat_scene.player.global_position + Vector2(40, 0)
	enemy.health = maxi(enemy.health, 250)
	enemy.max_health = maxi(enemy.max_health, enemy.health)
	await _wait_physics_frames(2)

	combat_scene.player.update_nearby_enemies()
	var particle_manager: Node = root.get_node_or_null("ParticleManager")
	var effects_before: int = _count_active_effects(particle_manager)
	combat_scene.player.handle_attack()
	await _wait_frames(1)

	_assert(combat_scene.is_hit_stop_active(), "Player hit should trigger local hit stop")
	_assert(enemy.stagger_time_remaining > 0.0, "Enemy hit should apply stagger reaction")
	_assert(_count_combat_effect_nodes() > 0, "Attack should create transient combat VFX nodes")

	var impact_seen: bool = await _wait_for_effect_growth(particle_manager, effects_before, 30)
	_assert(impact_seen, "Impact effect pool should activate on non-lethal hit")

	var hit_stop_cleared: bool = await _wait_for_hit_stop_clear(
		combat_scene,
		int((CombatConstants.HIT_STOP_MAX_DURATION_SEC + 0.35) * 1000.0)
	)
	_assert(hit_stop_cleared, "Hit stop should clear quickly and never lock combat")

	var timer_before: float = combat_scene.time_remaining
	await create_timer(0.25).timeout
	_assert(combat_scene.time_remaining < timer_before, "Combat timer should continue after hit stop")

	await create_timer(combat_scene.player.attack_cooldown + 0.1).timeout
	combat_scene.player.update_nearby_enemies()
	combat_scene.player.handle_attack()
	await _wait_frames(1)
	_assert(combat_scene.is_hit_stop_active(), "Combat flow should continue and allow subsequent hit stop triggers")
	var second_hit_stop_cleared: bool = await _wait_for_hit_stop_clear(
		combat_scene,
		int((CombatConstants.HIT_STOP_MAX_DURATION_SEC + 0.35) * 1000.0)
	)
	_assert(second_hit_stop_cleared, "Subsequent hit stop should clear quickly")

	await create_timer(maxf(CombatConstants.ATTACK_ARC_DURATION, CombatConstants.ATTACK_TRAIL_DURATION) + 0.2).timeout
	await _cleanup_runtime_scene()

	_cleanup_save_file()
	_finish()

func _wait_for_effect_growth(particle_manager: Node, baseline: int, max_frames: int) -> bool:
	for _i in range(max_frames):
		if _count_active_effects(particle_manager) > baseline:
			return true
		await process_frame
	return false

func _wait_for_hit_stop_clear(combat_scene: CombatScene, timeout_ms: int) -> bool:
	var start_ms: int = Time.get_ticks_msec()
	while Time.get_ticks_msec() - start_ms < timeout_ms:
		if not combat_scene.is_hit_stop_active():
			return true
		await process_frame
	return not combat_scene.is_hit_stop_active()

func _get_first_alive_enemy(combat_scene: CombatScene) -> CombatEnemy:
	if combat_scene == null or combat_scene.enemies_node == null:
		return null
	for child in combat_scene.enemies_node.get_children():
		if child is CombatEnemy and child.is_alive:
			return child as CombatEnemy
	return null

func _count_active_effects(particle_manager: Node) -> int:
	if particle_manager and particle_manager.has_method("get_active_effect_count"):
		return int(particle_manager.get_active_effect_count())
	return get_nodes_in_group("combat_effects").size()

func _count_combat_effect_nodes() -> int:
	return get_nodes_in_group("combat_effects").size()

func _wait_for_scene(scene_path: String, max_frames: int) -> bool:
	for _i in range(max_frames):
		if current_scene and current_scene.scene_file_path == scene_path:
			return true
		await process_frame
	return false

func _wait_frames(frame_count: int) -> void:
	for _i in range(frame_count):
		await process_frame

func _wait_physics_frames(frame_count: int) -> void:
	for _i in range(frame_count):
		await physics_frame

func _cleanup_save_file() -> void:
	DirAccess.remove_absolute("user://savegame.json")

func _cleanup_runtime_scene() -> void:
	var scene: Node = current_scene
	if is_instance_valid(scene):
		scene.free()
	await _wait_frames(5)

func _assert(condition: bool, message: String) -> void:
	if condition:
		return
	failures.append(message)
	push_error("DesktopCombatFeedbackValidation: %s" % message)

func _finish() -> void:
	if failures.is_empty():
		print("DesktopCombatFeedbackValidation: PASS")
		quit(0)
		return

	print("DesktopCombatFeedbackValidation: FAIL (%d)" % failures.size())
	for failure in failures:
		print(" - ", failure)
	quit(1)
