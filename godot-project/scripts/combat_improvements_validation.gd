extends SceneTree

const CombatConstants = preload("res://scripts/combat_constants.gd")
const GameModesScript = preload("res://scripts/game_modes.gd")
const SPAWN_SANITY_SEED_COUNT: int = 240
const SPAWN_RATIO_EPSILON: float = 0.01
const EXPECTED_CORE_RULE_LOCK_VERSION: String = "2026-02-21-day1"

var failures: Array[String] = []

func _init() -> void:
	_cleanup_save_file()
	call_deferred("_run")

func _run() -> void:
	await _stabilize_runtime_state()

	_test_core_combat_rules_lock()
	await _test_dodge_displacement()
	await _test_hit_stop_flow()
	await _test_attack_buffer_queue()
	await _test_melee_hit_detection_consistency()
	await _test_enemy_attack_readability_profiles()
	await _test_shield_push_directionality()
	await _test_shield_push_integration_path()
	await _test_shield_barrier_blocks_front_enemy()
	await _test_projectile_enemy_friendly_fire()
	await _test_projectile_max_range_limit()
	await _test_projectile_shield_intercept()
	await _test_enemy_zero_read_prevention()
	await _test_combo_payoff_tiers()
	await _test_perfect_block_outcomes()
	await _test_encounter_pacing_attack_slots()
	_test_spawn_variety_distribution()
	await _wait_frames(5)

	_cleanup_save_file()
	_finish()

func _test_core_combat_rules_lock() -> void:
	_assert(
		CombatConstants.CORE_COMBAT_RULES_LOCK_VERSION == EXPECTED_CORE_RULE_LOCK_VERSION,
		"Core combat lock version drift (expected %s, got %s)" % [
			EXPECTED_CORE_RULE_LOCK_VERSION,
			CombatConstants.CORE_COMBAT_RULES_LOCK_VERSION
		]
	)

	var rules: Dictionary = CombatConstants.get_core_combat_rules_snapshot()
	_assert(
		str(rules.get("damage_model", "")) == "lethal_one_hit",
		"Damage model lock should remain lethal_one_hit"
	)

	var player_rules: Dictionary = rules.get("player", {})
	_assert(int(player_rules.get("health", -1)) == CombatConstants.PLAYER_DEFAULT_HEALTH, "Player health lock mismatch")
	_assert(int(player_rules.get("damage", -1)) == CombatConstants.PLAYER_DEFAULT_DAMAGE, "Player damage lock mismatch")
	_assert(
		absf(float(player_rules.get("attack_cooldown_sec", -1.0)) - CombatConstants.PLAYER_DEFAULT_ATTACK_COOLDOWN) <= 0.0001,
		"Player attack cooldown lock mismatch"
	)

	var enemy_rules: Dictionary = rules.get("enemy", {})
	var base_enemy_rules: Dictionary = enemy_rules.get("base", {})
	_assert(int(base_enemy_rules.get("health", -1)) == CombatConstants.ENEMY_DEFAULT_HEALTH, "Enemy base health lock mismatch")
	_assert(int(base_enemy_rules.get("damage", -1)) == CombatConstants.ENEMY_DEFAULT_DAMAGE, "Enemy base damage lock mismatch")

	var archer_rules: Dictionary = enemy_rules.get("archer", {})
	_assert(
		absf(float(archer_rules.get("attack_cooldown_sec", -1.0)) - 5.0) <= 0.0001,
		"Archer cooldown lock should remain 5.0 seconds"
	)
	_assert(
		absf(CombatConstants.ENEMY_ARCHER_ATTACK_COOLDOWN - 5.0) <= 0.0001,
		"Archer cooldown constant should remain 5.0 seconds"
	)

	var win_rules: Dictionary = rules.get("win_conditions", {})
	_assert(
		bool(win_rules.get("enemies_killed_gte_enemy_count", false)),
		"Win condition lock should remain enemies_killed >= enemy_count"
	)

	var lose_rules: Dictionary = rules.get("lose_conditions", {})
	_assert(int(lose_rules.get("player_health_lte", 999)) == 0, "Lose condition player_health_lte should remain 0")
	_assert(
		absf(float(lose_rules.get("time_remaining_lte_sec", -1.0))) <= 0.0001,
		"Lose condition time_remaining_lte_sec should remain 0.0"
	)

	var cadence_targets: Dictionary = rules.get("cadence_targets", {})
	_assert(
		absf(float(cadence_targets.get("player_attack_cooldown_sec", -1.0)) - CombatConstants.PLAYER_DEFAULT_ATTACK_COOLDOWN) <= 0.0001,
		"Cadence lock mismatch for player attack cooldown"
	)
	_assert(
		absf(float(cadence_targets.get("archer_attack_cooldown_sec", -1.0)) - 5.0) <= 0.0001,
		"Cadence lock mismatch for archer attack cooldown"
	)
	_assert(
		float(cadence_targets.get("grunt_min_read_sec", 0.0)) >= 0.16,
		"Cadence lock mismatch for grunt minimum read window"
	)
	_assert(
		float(cadence_targets.get("heavy_min_read_sec", 0.0)) >= 0.30,
		"Cadence lock mismatch for heavy minimum read window"
	)
	_assert(
		float(cadence_targets.get("archer_min_read_sec", 0.0)) >= 0.30,
		"Cadence lock mismatch for archer minimum read window"
	)

	var done_metrics: Dictionary = CombatConstants.get_combat_done_feel_metrics_snapshot()
	var readability: Dictionary = done_metrics.get("readability", {})
	_assert(
		absf(float(readability.get("archer_cooldown_sec", -1.0)) - 5.0) <= 0.0001,
		"Done-feel metric archer_cooldown_sec should remain 5.0"
	)

	var responsiveness: Dictionary = done_metrics.get("responsiveness", {})
	_assert(
		int(responsiveness.get("input_attack_buffer_ms", -1)) == CombatConstants.INPUT_WINDOW_ATTACK_QUEUE_MS,
		"Done-feel metric input_attack_buffer_ms should match combat constant"
	)
	_assert(
		absf(float(responsiveness.get("player_attack_cooldown_sec", -1.0)) - CombatConstants.PLAYER_DEFAULT_ATTACK_COOLDOWN) <= 0.0001,
		"Done-feel metric player_attack_cooldown_sec should match combat constant"
	)

func _stabilize_runtime_state() -> void:
	_cleanup_save_file()
	await _wait_frames(3)

	var game_modes: Node = root.get_node_or_null("GameModes")
	if game_modes != null:
		game_modes.set("queued_mode", -1)
		game_modes.set("queued_force", false)
		game_modes.set("queued_dialogue_scene", "")
		game_modes.set("is_transitioning", false)
		if game_modes.has_method("sync_mode_without_scene_change"):
			game_modes.call("sync_mode_without_scene_change", GameModesScript.GameMode.LOADING)

	var active_scene: Node = current_scene
	if active_scene != null and is_instance_valid(active_scene):
		active_scene.free()

	await _wait_frames(2)
	_cleanup_save_file()

func _test_dodge_displacement() -> void:
	var combat_scene_resource: PackedScene = load("res://scenes/combat/combat_scene.tscn")
	var combat_scene := combat_scene_resource.instantiate() as CombatScene
	root.add_child(combat_scene)
	await _wait_frames(5)

	_assert(combat_scene != null and combat_scene.player != null, "Combat scene and player should initialize for dodge test")
	if combat_scene == null or combat_scene.player == null:
		return

	for child in combat_scene.enemies_node.get_children():
		if child is CombatEnemy:
			child.global_position = Vector2(-10000, -10000)

	var player: CombatPlayer = combat_scene.player
	if CombatConstants.HOTLINE_STYLE_MOVEMENT:
		_assert(not player.is_dodging, "Hotline mode should keep dodge disabled")
		await _dispose_node(combat_scene)
		return

	var start_position: Vector2 = player.global_position
	player.handle_dodge()

	var max_wait_frames: int = 180
	var dodge_finished: bool = false
	for _i in range(max_wait_frames):
		await physics_frame
		if not player.is_dodging:
			dodge_finished = true
			break

	var end_position: Vector2 = player.global_position
	var displacement: float = start_position.distance_to(end_position)
	var expected_distance: float = CombatConstants.DODGE_DISTANCE
	var distance_error: float = abs(displacement - expected_distance)

	_assert(dodge_finished, "Dodge should finish within %d physics frames" % max_wait_frames)
	_assert(distance_error <= 2.0, "Dodge displacement should be near %.2f, got %.2f" % [expected_distance, displacement])

	await create_timer(0.4).timeout
	await _wait_physics_frames(2)
	_assert(not player.is_invincible, "Dodge invincibility should clear after configured window")

	await _dispose_node(combat_scene)

func _test_hit_stop_flow() -> void:
	var combat_scene_resource: PackedScene = load("res://scenes/combat/combat_scene.tscn")
	var combat_scene := combat_scene_resource.instantiate() as CombatScene
	root.add_child(combat_scene)
	await _wait_frames(5)

	_assert(combat_scene != null and combat_scene.player != null, "Combat scene and player should initialize for hit stop test")
	if combat_scene == null or combat_scene.player == null:
		return

	var target_enemy: CombatEnemy = _get_first_alive_enemy(combat_scene)
	_assert(target_enemy != null, "Hit stop test requires at least one alive enemy")
	if target_enemy == null:
		await _dispose_node(combat_scene)
		return

	target_enemy.global_position = combat_scene.player.global_position + Vector2(40, 0)
	await _wait_physics_frames(2)

	combat_scene.player.update_nearby_enemies()
	var pre_hit_time_remaining: float = combat_scene.time_remaining
	combat_scene.player.handle_attack()
	await _wait_frames(1)

	_assert(combat_scene.is_hit_stop_active(), "Player hit should activate hit stop")

	var max_wait_ms: int = int((CombatConstants.HIT_STOP_MAX_DURATION_SEC + 0.4) * 1000.0)
	var start_wait_ms: int = Time.get_ticks_msec()
	while combat_scene.is_hit_stop_active() and (Time.get_ticks_msec() - start_wait_ms) < max_wait_ms:
		await process_frame

	_assert(not combat_scene.is_hit_stop_active(), "Hit stop should clear without locking combat")
	await create_timer(0.3).timeout
	_assert(combat_scene.time_remaining < pre_hit_time_remaining, "Combat timer should continue after hit stop")
	await create_timer(maxf(CombatConstants.ATTACK_ARC_DURATION, CombatConstants.ATTACK_TRAIL_DURATION) + 0.2).timeout

	await _dispose_node(combat_scene)

func _test_attack_buffer_queue() -> void:
	var combat_scene_resource: PackedScene = load("res://scenes/combat/combat_scene.tscn")
	var combat_scene := combat_scene_resource.instantiate() as CombatScene
	root.add_child(combat_scene)
	await _wait_frames(5)

	_assert(combat_scene != null and combat_scene.player != null, "Combat scene and player should initialize for attack buffer queue test")
	if combat_scene == null or combat_scene.player == null:
		return

	var player: CombatPlayer = combat_scene.player
	player.is_blocking = false
	player.is_dodging = false
	player.is_attacking = false
	player.call("_stop_block")
	player.call("_clear_buffered_attack")
	player.last_attack_direction = Vector2.RIGHT
	player.last_movement_direction = Vector2.RIGHT
	player.shield_direction = Vector2.RIGHT

	var cooldown_ms: int = int(player.attack_cooldown * 1000.0)
	var remaining_cooldown_ms: int = mini(cooldown_ms - 1, maxi(1, CombatConstants.INPUT_WINDOW_ATTACK_QUEUE_MS - 10))
	var cooldown_anchor_ms: int = Time.get_ticks_msec() - (cooldown_ms - remaining_cooldown_ms)
	player.last_attack_ms = cooldown_anchor_ms
	player.handle_attack()
	await _wait_physics_frames(1)

	_assert(player.has_method("has_buffered_attack") and player.has_buffered_attack(), "Attack queue should store cooldown-time attack input")
	_assert(player.last_attack_ms == cooldown_anchor_ms, "Queued attack should not execute on the same frame as cooldown-time input")

	var fired_early: bool = false
	for _i in range(4):
		await _wait_physics_frames(1)
		if player.last_attack_ms > cooldown_anchor_ms:
			fired_early = true
			break
	_assert(not fired_early, "Queued attack should not execute before cooldown has elapsed")

	var executed: bool = false
	var execute_interval_ms: int = -1
	for _i in range(24):
		await _wait_physics_frames(1)
		if player.last_attack_ms > cooldown_anchor_ms:
			executed = true
			execute_interval_ms = player.last_attack_ms - cooldown_anchor_ms
			break

	var cooldown_floor_ms: int = int(player.attack_cooldown * 1000.0) - 2
	_assert(executed, "Queued attack should execute once on the first legal frame")
	_assert(execute_interval_ms >= cooldown_floor_ms, "Queued attack should respect minimum cooldown interval")

	var first_execute_ms: int = player.last_attack_ms
	for _i in range(10):
		await _wait_physics_frames(1)
	_assert(player.last_attack_ms == first_execute_ms, "Single-slot attack queue should execute exactly once per buffered input")

	await _dispose_node(combat_scene)

func _test_melee_hit_detection_consistency() -> void:
	var combat_scene_resource: PackedScene = load("res://scenes/combat/combat_scene.tscn")
	var combat_scene := combat_scene_resource.instantiate() as CombatScene
	root.add_child(combat_scene)
	await _wait_frames(5)

	_assert(combat_scene != null and combat_scene.player != null, "Combat scene and player should initialize for melee consistency test")
	if combat_scene == null or combat_scene.player == null:
		return

	var target_enemy: CombatEnemy = _get_first_alive_enemy(combat_scene)
	_assert(target_enemy != null, "Melee consistency test requires an alive enemy")
	if target_enemy == null:
		await _dispose_node(combat_scene)
		return

	for child in combat_scene.enemies_node.get_children():
		if child is CombatEnemy and child != target_enemy:
			var spare_enemy: CombatEnemy = child as CombatEnemy
			spare_enemy.global_position = Vector2(-10000, -10000)
			spare_enemy.set_physics_process(false)

	var player: CombatPlayer = combat_scene.player
	player.set_physics_process(false)
	player.is_blocking = false
	player.is_dodging = false
	player.is_attacking = false
	player.call("_clear_buffered_attack")
	player.combo_counter = 0
	player.global_position = Vector2(800, 600)
	player.last_attack_direction = Vector2.RIGHT
	player.last_movement_direction = Vector2.RIGHT
	player.shield_direction = Vector2.RIGHT

	target_enemy.set_physics_process(false)
	target_enemy.speed = 0.0
	target_enemy.attack_range = 0.0
	target_enemy.max_health = 1000
	target_enemy.health = 1000
	target_enemy.is_alive = true
	target_enemy.global_position = player.global_position + Vector2(player.attack_range - 2.0, 0.0)

	var dedupe_registry: Dictionary = {}
	var first_dedupe_hit: int = player.perform_attack_detection(Vector2.RIGHT, dedupe_registry)
	var second_dedupe_hit: int = player.perform_attack_detection(Vector2.RIGHT, dedupe_registry)
	_assert(first_dedupe_hit == 1 and second_dedupe_hit == 0, "Melee swing should not double-hit the same enemy in one swing pass")

	var inside_hits_consistent: bool = true
	for _i in range(6):
		target_enemy.global_position = player.global_position + Vector2(player.attack_range - 2.0, 0.0)
		var inside_registry: Dictionary = {}
		if player.perform_attack_detection(Vector2.RIGHT, inside_registry) != 1:
			inside_hits_consistent = false
			break
	_assert(inside_hits_consistent, "Enemies clearly inside melee arc/range should be hit consistently")

	var outside_range_consistent: bool = true
	for _i in range(6):
		target_enemy.global_position = player.global_position + Vector2(player.attack_range + 18.0, 0.0)
		var outside_range_registry: Dictionary = {}
		if player.perform_attack_detection(Vector2.RIGHT, outside_range_registry) != 0:
			outside_range_consistent = false
			break
	_assert(outside_range_consistent, "Enemies clearly outside melee range should consistently miss")

	var inside_boundary_consistent: bool = true
	var outside_boundary_consistent: bool = true
	var boundary_distance: float = player.attack_range - 1.0
	var inside_boundary_angle: float = player.attack_arc * 0.5 - 0.02
	var outside_boundary_angle: float = player.attack_arc * 0.5 + 0.08
	for _i in range(6):
		target_enemy.global_position = player.global_position + Vector2(cos(inside_boundary_angle), sin(inside_boundary_angle)) * boundary_distance
		var inside_boundary_registry: Dictionary = {}
		if player.perform_attack_detection(Vector2.RIGHT, inside_boundary_registry) != 1:
			inside_boundary_consistent = false
			break
	for _i in range(6):
		target_enemy.global_position = player.global_position + Vector2(cos(outside_boundary_angle), sin(outside_boundary_angle)) * boundary_distance
		var outside_boundary_registry: Dictionary = {}
		if player.perform_attack_detection(Vector2.RIGHT, outside_boundary_registry) != 0:
			outside_boundary_consistent = false
			break

	_assert(inside_boundary_consistent, "Melee arc boundary just-inside samples should hit consistently")
	_assert(outside_boundary_consistent, "Melee arc boundary just-outside samples should miss consistently")

	target_enemy.global_position = player.global_position + Vector2(-10.0, 0.0)
	var overlap_registry: Dictionary = {}
	var overlap_hit: int = player.perform_attack_detection(Vector2.RIGHT, overlap_registry)
	_assert(overlap_hit == 1, "Near-overlap melee target should resolve as a hit to avoid phantom misses")

	await _dispose_node(combat_scene)

func _test_enemy_attack_readability_profiles() -> void:
	var enemy_scene: PackedScene = load("res://scenes/combat/enemy.tscn")
	var harness_root := Node2D.new()
	root.add_child(harness_root)

	var player_stub := Node2D.new()
	player_stub.add_to_group("player")
	harness_root.add_child(player_stub)
	await _wait_frames(2)

	var tested_types: Array[String] = ["grunt", "heavy", "archer"]
	var windup_by_type := {"grunt": 0.0, "heavy": 0.0, "archer": 0.0}

	for enemy_type in tested_types:
		var enemy := enemy_scene.instantiate() as CombatEnemy
		_assert(enemy != null, "Readability test should instantiate enemy type %s" % enemy_type)
		if enemy == null:
			continue

		enemy.enemy_type = enemy_type
		harness_root.add_child(enemy)
		enemy.global_position = Vector2(300.0, 0.0)
		await _wait_frames(2)

		enemy.call("_start_attack_windup")
		var expected_windup: float = CombatConstants.get_enemy_attack_readability_windup(enemy_type)
		windup_by_type[enemy_type] = expected_windup
		_assert(
			absf(enemy.attack_windup_remaining - expected_windup) <= 0.001,
			"Enemy %s windup should match profile (expected %.3f, got %.3f)" % [enemy_type, expected_windup, enemy.attack_windup_remaining]
		)

		var expected_color: Color = CombatConstants.get_enemy_attack_readability_color(enemy_type)
		_assert(
			_color_close(enemy.modulate, expected_color, 0.001),
			"Enemy %s telegraph start color should match profile" % enemy_type
		)
		var expected_sfx_name: String = CombatConstants.get_enemy_attack_readability_sfx_name(enemy_type)
		var expected_sfx_volume_db: float = CombatConstants.get_enemy_attack_readability_sfx_volume_db(enemy_type)
		_assert(
			not expected_sfx_name.is_empty(),
			"Enemy %s should define a telegraph SFX cue name" % enemy_type
		)
		_assert(
			enemy.attack_telegraph_sfx_name == expected_sfx_name,
			"Enemy %s should load telegraph SFX name from profile" % enemy_type
		)
		_assert(
			absf(enemy.attack_telegraph_sfx_volume_db - expected_sfx_volume_db) <= 0.001,
			"Enemy %s should load telegraph SFX volume from profile" % enemy_type
		)

		enemy.attack_windup_elapsed = 0.0
		enemy.attack_windup_remaining = expected_windup * 0.5
		enemy.call("_update_attack_telegraph_visual")
		var midpoint_color: Color = enemy.modulate
		_assert(
			not _color_close(midpoint_color, expected_color, 0.001),
			"Enemy %s telegraph should evolve mid-windup" % enemy_type
		)

		var pulse_hz: float = CombatConstants.get_enemy_attack_readability_pulse_hz(enemy_type)
		var pulse_strength: float = CombatConstants.get_enemy_attack_readability_pulse_strength(enemy_type)
		_assert(pulse_hz > 0.0, "Enemy %s telegraph pulse_hz should be positive" % enemy_type)
		_assert(pulse_strength > 0.0, "Enemy %s telegraph pulse_strength should be positive" % enemy_type)

		enemy.attack_windup_elapsed = 0.25 / maxf(0.001, pulse_hz)
		enemy.attack_windup_remaining = expected_windup * 0.5
		enemy.call("_update_attack_telegraph_visual")
		_assert(
			_color_luminance(enemy.modulate) > _color_luminance(midpoint_color) + 0.005,
			"Enemy %s telegraph pulse should brighten at quarter-cycle sample" % enemy_type
		)

		var finish_window: float = CombatConstants.get_enemy_attack_readability_finish_window(enemy_type)
		var near_finish_remaining: float = maxf(0.001, expected_windup * 0.1)
		if finish_window > 0.0:
			near_finish_remaining = minf(expected_windup * 0.2, maxf(0.001, finish_window * 0.5))

		enemy.attack_windup_elapsed = 0.0
		enemy.attack_windup_remaining = near_finish_remaining
		enemy.call("_update_attack_telegraph_visual")
		_assert(
			_color_luminance(enemy.modulate) > _color_luminance(expected_color) + 0.015,
			"Enemy %s telegraph should brighten near release window" % enemy_type
		)

		enemy.call("_clear_attack_windup")
		_assert(_color_close(enemy.modulate, Color.WHITE, 0.001), "Enemy %s should clear telegraph tint after windup" % enemy_type)
		enemy.queue_free()
		await _wait_frames(1)

	_assert(
		float(windup_by_type["heavy"]) > float(windup_by_type["grunt"]) + 0.05,
		"Heavy windup should be longer than grunt windup for readability"
	)
	_assert(
		float(windup_by_type["archer"]) > float(windup_by_type["grunt"]) + 0.05,
		"Archer windup should be longer than grunt windup for readability"
	)

	await _dispose_node(harness_root)

func _test_shield_push_directionality() -> void:
	var combat_scene_resource: PackedScene = load("res://scenes/combat/combat_scene.tscn")
	var combat_scene := combat_scene_resource.instantiate() as CombatScene
	root.add_child(combat_scene)
	await _wait_frames(5)

	_assert(combat_scene != null and combat_scene.player != null, "Combat scene and player should initialize for shield push test")
	if combat_scene == null or combat_scene.player == null:
		return

	var front_enemy: CombatEnemy = _get_first_alive_enemy(combat_scene)
	_assert(front_enemy != null, "Shield push test requires at least one alive enemy")
	if front_enemy == null:
		await _dispose_node(combat_scene)
		return

	for child in combat_scene.enemies_node.get_children():
		if child is CombatEnemy and child != front_enemy:
			var spare_enemy: CombatEnemy = child as CombatEnemy
			spare_enemy.global_position = Vector2(-10000, -10000)

	var player: CombatPlayer = combat_scene.player
	player.call("_setup_shield_collision")
	player.set_physics_process(false)
	player.is_blocking = true
	player.shield_broken = false
	player.shield_health = CombatConstants.SHIELD_MAX_HEALTH
	player.shield_direction = Vector2.RIGHT
	player.call("_update_shield_transform")
	player.call("_sync_shield_collision_state")

	front_enemy.speed = 0.0
	front_enemy.attack_range = 0.0
	front_enemy.external_push_velocity = Vector2.ZERO

	player.global_position = Vector2(800, 600)
	front_enemy.global_position = player.global_position + Vector2(
		CombatConstants.SHIELD_COLLISION_OFFSET + CombatConstants.SHIELD_COLLISION_RADIUS + 20.0,
		0.0
	)
	await _wait_physics_frames(2)

	var facing: Vector2 = Vector2.RIGHT
	_assert(player.is_shield_active(), "Shield should be active for push test")
	player.call("_update_shield_transform")
	var push_registry: Dictionary = {}
	player.call("_try_push_enemy", front_enemy, facing, player.global_position + facing * CombatConstants.SHIELD_COLLISION_OFFSET, facing * 22.0, push_registry)
	await _wait_physics_frames(1)

	var initial_push_velocity: float = front_enemy.external_push_velocity.dot(facing)
	_assert(initial_push_velocity > 0.01, "Shield push should add forward push velocity (got %.3f)" % initial_push_velocity)

	front_enemy.external_push_velocity = Vector2.ZERO
	front_enemy.global_position = player.global_position + Vector2(
		CombatConstants.SHIELD_COLLISION_OFFSET + CombatConstants.SHIELD_COLLISION_RADIUS + 6.0,
		0.0
	)
	var near_registry: Dictionary = {}
	player.call("_try_push_enemy", front_enemy, facing, player.global_position + facing * CombatConstants.SHIELD_COLLISION_OFFSET, facing * 22.0, near_registry)
	var near_push_velocity: float = front_enemy.external_push_velocity.dot(facing)

	front_enemy.external_push_velocity = Vector2.ZERO
	front_enemy.global_position = player.global_position + Vector2(
		CombatConstants.SHIELD_COLLISION_OFFSET + CombatConstants.SHIELD_COLLISION_RADIUS + 26.0,
		0.0
	)
	var far_registry: Dictionary = {}
	player.call("_try_push_enemy", front_enemy, facing, player.global_position + facing * CombatConstants.SHIELD_COLLISION_OFFSET, facing * 22.0, far_registry)
	var far_push_velocity: float = front_enemy.external_push_velocity.dot(facing)
	_assert(
		near_push_velocity > far_push_velocity + 0.25,
		"Close shield contact should push harder than far contact (near %.3f, far %.3f)" % [near_push_velocity, far_push_velocity]
	)

	front_enemy.external_push_velocity = -facing * 120.0
	var reverse_registry: Dictionary = {}
	player.call("_try_push_enemy", front_enemy, facing, player.global_position + facing * CombatConstants.SHIELD_COLLISION_OFFSET, facing * 22.0, reverse_registry)
	await _wait_physics_frames(1)
	var corrected_push_velocity: float = front_enemy.external_push_velocity.dot(facing)
	_assert(corrected_push_velocity >= 0.0, "Shield push should cancel pre-existing reverse velocity (got %.3f)" % corrected_push_velocity)

	var start_projection: float = (front_enemy.global_position - player.global_position).dot(facing)
	var previous_projection: float = start_projection
	var worst_reverse_step: float = 0.0

	for _i in range(12):
		var loop_registry: Dictionary = {}
		player.call("_try_push_enemy", front_enemy, facing, player.global_position + facing * CombatConstants.SHIELD_COLLISION_OFFSET, facing * 22.0, loop_registry)
		await _wait_physics_frames(1)

		var projection: float = (front_enemy.global_position - player.global_position).dot(facing)
		worst_reverse_step = minf(worst_reverse_step, projection - previous_projection)
		previous_projection = projection

	var front_gain: float = previous_projection - start_projection
	_assert(front_gain > 6.0, "Shield push should increase front enemy separation (gain %.2f)" % front_gain)
	_assert(worst_reverse_step >= -0.75, "Shield push should not pull front enemy backward per-step (worst %.2f)" % worst_reverse_step)

	front_enemy.external_push_velocity = Vector2.ZERO
	front_enemy.global_position = player.global_position - Vector2(
		CombatConstants.SHIELD_COLLISION_OFFSET + CombatConstants.SHIELD_COLLISION_RADIUS + 20.0,
		0.0
	)
	await _wait_physics_frames(2)
	player.call("_update_shield_transform")
	var rear_to_enemy: Vector2 = front_enemy.global_position - (player.global_position + facing * CombatConstants.SHIELD_COLLISION_OFFSET)
	if rear_to_enemy != Vector2.ZERO:
		var rear_dot: float = rear_to_enemy.normalized().dot(facing)
		_assert(
			rear_dot < CombatConstants.SHIELD_PUSH_FRONT_DOT_MIN,
			"Rear test enemy should be behind shield face (dot %.3f)" % rear_dot
		)

	var rear_registry: Dictionary = {}
	player.call("_try_push_enemy", front_enemy, facing, player.global_position + facing * CombatConstants.SHIELD_COLLISION_OFFSET, facing * 22.0, rear_registry)
	await _wait_physics_frames(1)
	var rear_velocity: float = front_enemy.external_push_velocity.dot(facing)
	_assert(rear_velocity <= 0.10, "Enemy behind shield should not receive forward push velocity (got %.3f)" % rear_velocity)

	var rear_start: float = (front_enemy.global_position - player.global_position).dot(facing)
	for _i in range(10):
		var rear_loop_registry: Dictionary = {}
		player.call("_try_push_enemy", front_enemy, facing, player.global_position + facing * CombatConstants.SHIELD_COLLISION_OFFSET, facing * 22.0, rear_loop_registry)
		await _wait_physics_frames(1)
	var rear_end: float = (front_enemy.global_position - player.global_position).dot(facing)
	var rear_delta: float = rear_end - rear_start
	_assert(rear_delta <= 1.5, "Enemy behind shield should not be pulled forward (delta %.2f)" % rear_delta)

	await _dispose_node(combat_scene)

func _test_shield_push_integration_path() -> void:
	var combat_scene_resource: PackedScene = load("res://scenes/combat/combat_scene.tscn")
	var combat_scene := combat_scene_resource.instantiate() as CombatScene
	root.add_child(combat_scene)
	await _wait_frames(5)

	_assert(combat_scene != null and combat_scene.player != null, "Combat scene and player should initialize for shield push integration test")
	if combat_scene == null or combat_scene.player == null:
		return

	var target_enemy: CombatEnemy = _get_first_alive_enemy(combat_scene)
	_assert(target_enemy != null, "Shield push integration test requires at least one alive enemy")
	if target_enemy == null:
		await _dispose_node(combat_scene)
		return

	for child in combat_scene.enemies_node.get_children():
		if child is CombatEnemy and child != target_enemy:
			var spare_enemy: CombatEnemy = child as CombatEnemy
			spare_enemy.global_position = Vector2(-10000, -10000)

	var player: CombatPlayer = combat_scene.player
	player.call("_setup_shield_collision")
	player.set_physics_process(false)
	player.is_blocking = true
	player.shield_broken = false
	player.shield_health = CombatConstants.SHIELD_MAX_HEALTH
	player.shield_direction = Vector2.RIGHT
	player.call("_update_shield_transform")
	player.call("_sync_shield_collision_state")

	target_enemy.speed = 0.0
	target_enemy.attack_range = 0.0
	target_enemy.external_push_velocity = Vector2.ZERO

	player.global_position = Vector2(800, 600)
	player.move_intent_velocity = Vector2.RIGHT * 300.0
	player.velocity = Vector2.RIGHT * 300.0
	player.call("_update_shield_transform")
	player.call("_sync_shield_collision_state")

	target_enemy.global_position = player.global_position + Vector2(
		CombatConstants.SHIELD_COLLISION_OFFSET + CombatConstants.SHIELD_COLLISION_RADIUS + 12.0,
		0.0
	)
	await _wait_physics_frames(2)

	var front_start: float = (target_enemy.global_position - player.global_position).dot(Vector2.RIGHT)
	for _i in range(10):
		player.move_intent_velocity = Vector2.RIGHT * 300.0
		player.velocity = Vector2.RIGHT * 300.0
		player.call("_update_shield_transform")
		player.call("_sync_shield_collision_state")
		player.call("_apply_shield_push", 1.0 / 60.0)
		await _wait_physics_frames(1)

	var front_end: float = (target_enemy.global_position - player.global_position).dot(Vector2.RIGHT)
	_assert(front_end - front_start > 2.5, "Integration push path should move front enemy away (gain %.2f)" % [front_end - front_start])

	target_enemy.external_push_velocity = Vector2.ZERO
	target_enemy.global_position = player.global_position - Vector2(
		CombatConstants.SHIELD_COLLISION_OFFSET + CombatConstants.SHIELD_COLLISION_RADIUS + 12.0,
		0.0
	)
	await _wait_physics_frames(2)

	var rear_start: float = (target_enemy.global_position - player.global_position).dot(Vector2.RIGHT)
	for _i in range(10):
		player.move_intent_velocity = Vector2.RIGHT * 300.0
		player.velocity = Vector2.RIGHT * 300.0
		player.call("_update_shield_transform")
		player.call("_sync_shield_collision_state")
		player.call("_apply_shield_push", 1.0 / 60.0)
		await _wait_physics_frames(1)

	var rear_end: float = (target_enemy.global_position - player.global_position).dot(Vector2.RIGHT)
	_assert(rear_end - rear_start <= 1.5, "Integration push path should not pull rear enemy forward (delta %.2f)" % [rear_end - rear_start])

	await _dispose_node(combat_scene)

func _test_shield_barrier_blocks_front_enemy() -> void:
	var combat_scene_resource: PackedScene = load("res://scenes/combat/combat_scene.tscn")
	var combat_scene := combat_scene_resource.instantiate() as CombatScene
	root.add_child(combat_scene)
	await _wait_frames(5)

	_assert(combat_scene != null and combat_scene.player != null, "Combat scene and player should initialize for shield barrier test")
	if combat_scene == null or combat_scene.player == null:
		return

	var target_enemy: CombatEnemy = _get_first_alive_enemy(combat_scene)
	_assert(target_enemy != null, "Shield barrier test requires at least one alive enemy")
	if target_enemy == null:
		await _dispose_node(combat_scene)
		return

	for child in combat_scene.enemies_node.get_children():
		if child is CombatEnemy and child != target_enemy:
			var spare_enemy: CombatEnemy = child as CombatEnemy
			spare_enemy.global_position = Vector2(-10000, -10000)

	var player: CombatPlayer = combat_scene.player
	player.set_physics_process(false)
	player.global_position = Vector2(800, 600)
	player.is_blocking = true
	player.shield_broken = false
	player.shield_health = CombatConstants.SHIELD_MAX_HEALTH
	player.shield_direction = Vector2.RIGHT
	player.call("_update_shield_transform")
	player.call("_sync_shield_collision_state")

	target_enemy.speed = 240.0
	target_enemy.attack_range = 0.0
	target_enemy.external_push_velocity = Vector2.ZERO
	target_enemy.global_position = player.global_position + Vector2(220.0, 0.0)

	var barrier_distance: float = player.get_shield_barrier_distance()
	var min_forward_distance: float = 99999.0
	var player_health_start: int = player.health

	for _i in range(90):
		await _wait_physics_frames(1)
		var forward: float = (target_enemy.global_position - player.global_position).dot(Vector2.RIGHT)
		min_forward_distance = minf(min_forward_distance, forward)

	_assert(
		min_forward_distance >= barrier_distance - 2.0,
		"Front enemy should not pass shield barrier distance (min %.2f, barrier %.2f)" % [min_forward_distance, barrier_distance]
	)
	_assert(player.health == player_health_start, "Shield barrier test should prevent direct health damage")

	await _dispose_node(combat_scene)

func _test_projectile_enemy_friendly_fire() -> void:
	var combat_scene_resource: PackedScene = load("res://scenes/combat/combat_scene.tscn")
	var combat_scene := combat_scene_resource.instantiate() as CombatScene
	root.add_child(combat_scene)
	await _wait_frames(5)

	_assert(combat_scene != null and combat_scene.player != null, "Combat scene and player should initialize for projectile enemy friendly-fire test")
	if combat_scene == null or combat_scene.player == null:
		return

	var alive_enemies: Array[CombatEnemy] = []
	for child in combat_scene.enemies_node.get_children():
		if child is CombatEnemy and child.is_alive:
			alive_enemies.append(child as CombatEnemy)
	if alive_enemies.size() < 2:
		_assert(false, "Projectile enemy friendly-fire test requires at least two alive enemies")
		await _dispose_node(combat_scene)
		return

	var shooter: CombatEnemy = alive_enemies[0]
	var target: CombatEnemy = alive_enemies[1]

	for enemy: CombatEnemy in alive_enemies:
		enemy.speed = 0.0
		enemy.attack_range = 0.0

	shooter.global_position = Vector2(600.0, 600.0)
	target.global_position = shooter.global_position + Vector2(90.0, 0.0)
	combat_scene.player.global_position = shooter.global_position + Vector2(420.0, 220.0)
	await _wait_physics_frames(2)

	var target_health_start: int = target.health
	var projectile_scene: PackedScene = load("res://scenes/combat/projectile.tscn")
	var projectile_instance: Node = projectile_scene.instantiate()
	combat_scene.add_child(projectile_instance)
	if projectile_instance.has_method("initialize"):
		projectile_instance.call("initialize", Vector2.RIGHT, shooter, 1, 800.0, 1.0)
	if projectile_instance is Node2D:
		var projectile_node: Node2D = projectile_instance as Node2D
		projectile_node.global_position = shooter.global_position + Vector2(CombatConstants.PROJECTILE_SPAWN_OFFSET, 0.0)

	await _wait_physics_frames(20)

	var target_damaged: bool = true
	if is_instance_valid(target):
		target_damaged = (target.health < target_health_start) or (not target.is_alive)
	_assert(target_damaged, "Enemy projectile should damage ally enemies in its path")
	_assert(not is_instance_valid(shooter) or shooter.is_alive, "Enemy projectile should not damage its shooter")

	var projectile_spent: bool = true
	if is_instance_valid(projectile_instance):
		projectile_spent = bool(projectile_instance.get("is_spent"))
	_assert(not is_instance_valid(projectile_instance) or projectile_spent, "Enemy-friendly-fire projectile should be consumed on ally hit")

	await _dispose_node(combat_scene)

func _test_projectile_max_range_limit() -> void:
	var projectile_scene: PackedScene = load("res://scenes/combat/projectile.tscn")
	var harness_root := Node2D.new()
	root.add_child(harness_root)

	var projectile_instance: Node = projectile_scene.instantiate()
	_assert(projectile_instance != null, "Projectile range-limit test should instantiate projectile")
	if projectile_instance == null:
		await _dispose_node(harness_root)
		return

	harness_root.add_child(projectile_instance)
	var configured_speed: float = 360.0
	var configured_lifetime: float = 5.0
	var configured_max_range: float = 180.0
	if projectile_instance.has_method("initialize"):
		projectile_instance.call("initialize", Vector2.RIGHT, null, 1, configured_speed, configured_lifetime, configured_max_range)
	if projectile_instance is Node2D:
		var projectile_node: Node2D = projectile_instance as Node2D
		projectile_node.global_position = Vector2(120.0, 120.0)

	var start_position: Vector2 = Vector2.ZERO
	if projectile_instance is Node2D:
		start_position = (projectile_instance as Node2D).global_position
	await _wait_physics_frames(1)

	var consumed_frame: int = -1
	var max_wait_frames: int = 120
	for i in range(max_wait_frames):
		await _wait_physics_frames(1)
		if not is_instance_valid(projectile_instance):
			consumed_frame = i + 1
			break
		if bool(projectile_instance.get("is_spent")):
			consumed_frame = i + 1
			break

	var expected_max_frames: int = int(ceil((configured_max_range / configured_speed) * 60.0)) + 8
	_assert(consumed_frame > 0, "Projectile should be consumed after reaching max range")
	_assert(
		consumed_frame > 0 and consumed_frame <= expected_max_frames,
		"Projectile should be consumed near max range timing window (frame %d, expected <= %d)" % [consumed_frame, expected_max_frames]
	)

	if is_instance_valid(projectile_instance) and projectile_instance is Node2D:
		var end_position: Vector2 = (projectile_instance as Node2D).global_position
		var travelled_distance: float = start_position.distance_to(end_position)
		_assert(
			travelled_distance <= configured_max_range + 6.0,
			"Projectile should not travel beyond configured max range (range %.2f, traveled %.2f)" % [configured_max_range, travelled_distance]
		)

	await _dispose_node(harness_root)

func _test_projectile_shield_intercept() -> void:
	var combat_scene_resource: PackedScene = load("res://scenes/combat/combat_scene.tscn")
	var combat_scene := combat_scene_resource.instantiate() as CombatScene
	root.add_child(combat_scene)
	await _wait_frames(5)

	_assert(combat_scene != null and combat_scene.player != null, "Combat scene and player should initialize for projectile shield test")
	if combat_scene == null or combat_scene.player == null:
		return

	for child in combat_scene.enemies_node.get_children():
		if child is CombatEnemy:
			var enemy: CombatEnemy = child as CombatEnemy
			enemy.global_position = Vector2(-10000, -10000)
			enemy.speed = 0.0
			enemy.attack_range = 0.0

	var player: CombatPlayer = combat_scene.player
	player.set_physics_process(false)
	player.global_position = Vector2(800, 600)
	player.is_blocking = true
	player.shield_broken = false
	player.shield_health = CombatConstants.SHIELD_MAX_HEALTH
	player.shield_direction = Vector2.LEFT
	player.call("_update_shield_transform")
	player.call("_sync_shield_collision_state")
	await _wait_physics_frames(2)

	_assert(player.is_shield_active(), "Shield should be active for projectile interception test")

	var health_start: int = player.health
	var shield_start: float = player.shield_health
	var projectile_scene: PackedScene = load("res://scenes/combat/projectile.tscn")
	var projectile_instance: Node = projectile_scene.instantiate()
	combat_scene.add_child(projectile_instance)
	if projectile_instance.has_method("initialize"):
		projectile_instance.call("initialize", Vector2.RIGHT, null, 20, 1200.0, 1.5)
	if projectile_instance is Node2D:
		var projectile_node: Node2D = projectile_instance as Node2D
		projectile_node.global_position = player.global_position + Vector2(-130.0, 0.0)

	await _wait_physics_frames(25)

	var projectile_spent: bool = true
	if is_instance_valid(projectile_instance):
		projectile_spent = bool(projectile_instance.get("is_spent"))

	_assert(player.health == health_start, "Projectile interception should prevent direct player damage")
	_assert(player.shield_health < shield_start, "Projectile interception should damage shield health")
	_assert(not is_instance_valid(projectile_instance) or projectile_spent, "Projectile should be consumed on shield impact")

	await _dispose_node(combat_scene)

func _test_enemy_zero_read_prevention() -> void:
	var enemy_scene: PackedScene = load("res://scenes/combat/enemy.tscn")
	var harness_root := Node2D.new()
	root.add_child(harness_root)

	var player_stub := Node2D.new()
	player_stub.add_to_group("player")
	harness_root.add_child(player_stub)
	await _wait_frames(2)

	var enemy := enemy_scene.instantiate() as CombatEnemy
	_assert(enemy != null, "Zero-read prevention test should instantiate enemy")
	if enemy == null:
		await _dispose_node(harness_root)
		return
	enemy.enemy_type = "heavy"
	harness_root.add_child(enemy)
	await _wait_frames(2)

	enemy.call("_start_attack_windup")
	var min_read: float = CombatConstants.get_enemy_attack_readability_min_read(enemy.enemy_type)
	enemy.attack_windup_elapsed = maxf(0.0, min_read - 0.02)
	enemy.attack_windup_remaining = 0.0
	enemy.attack_player()
	_assert(enemy.pending_attack, "Enemy should not execute attack before minimum read window elapses")

	enemy.attack_windup_elapsed = min_read + 0.01
	enemy.attack_windup_remaining = 0.0
	enemy.attack_player()
	_assert(not enemy.pending_attack, "Enemy should execute attack once minimum read window elapsed")

	await _dispose_node(harness_root)

func _test_combo_payoff_tiers() -> void:
	var enemy_scene: PackedScene = load("res://scenes/combat/enemy.tscn")
	var harness_root := Node2D.new()
	root.add_child(harness_root)

	var player_stub := Node2D.new()
	player_stub.add_to_group("player")
	harness_root.add_child(player_stub)
	await _wait_frames(2)

	var enemy := enemy_scene.instantiate() as CombatEnemy
	_assert(enemy != null, "Combo payoff test should instantiate enemy")
	if enemy == null:
		await _dispose_node(harness_root)
		return
	enemy.enemy_type = "heavy"
	harness_root.add_child(enemy)
	await _wait_frames(2)

	var base_damage: int = 10
	var tier0_damage: int = int(enemy.call("_calculate_combo_adjusted_damage", base_damage, 1.0, 0))
	var tier2_damage: int = int(enemy.call(
		"_calculate_combo_adjusted_damage",
		base_damage,
		CombatConstants.get_combo_tier_damage_multiplier(2),
		CombatConstants.get_combo_tier_armor_break_level(2)
	))
	var tier3_damage: int = int(enemy.call(
		"_calculate_combo_adjusted_damage",
		base_damage,
		CombatConstants.get_combo_tier_damage_multiplier(3),
		CombatConstants.get_combo_tier_armor_break_level(3)
	))
	_assert(tier2_damage > tier0_damage, "Combo tier 2 should increase applied damage versus tier 0")
	_assert(tier3_damage > tier2_damage, "Combo tier 3 should increase applied damage versus tier 2")

	enemy.health = 999
	enemy.take_damage(1, Vector2.RIGHT, {"stagger_force_multiplier": 1.0, "stagger_duration_multiplier": 1.0})
	var baseline_stagger_duration: float = enemy.stagger_time_remaining
	var baseline_stagger_velocity: float = enemy.stagger_velocity.length()

	enemy.take_damage(
		1,
		Vector2.RIGHT,
		{
			"stagger_force_multiplier": CombatConstants.get_combo_tier_stagger_force_multiplier(3),
			"stagger_duration_multiplier": CombatConstants.get_combo_tier_stagger_duration_multiplier(3)
		}
	)
	var boosted_stagger_duration: float = enemy.stagger_time_remaining
	var boosted_stagger_velocity: float = enemy.stagger_velocity.length()
	_assert(boosted_stagger_duration > baseline_stagger_duration, "Combo tier stagger duration should scale up")
	_assert(boosted_stagger_velocity > baseline_stagger_velocity, "Combo tier stagger force should scale up")

	await _dispose_node(harness_root)

func _test_perfect_block_outcomes() -> void:
	var combat_scene_resource: PackedScene = load("res://scenes/combat/combat_scene.tscn")
	var combat_scene := combat_scene_resource.instantiate() as CombatScene
	root.add_child(combat_scene)
	await _wait_frames(5)

	_assert(combat_scene != null and combat_scene.player != null, "Combat scene should initialize for perfect block test")
	if combat_scene == null or combat_scene.player == null:
		return

	var target_enemy: CombatEnemy = _get_first_alive_enemy(combat_scene)
	_assert(target_enemy != null, "Perfect block test requires an alive enemy")
	if target_enemy == null:
		await _dispose_node(combat_scene)
		return

	for child in combat_scene.enemies_node.get_children():
		if child is CombatEnemy and child != target_enemy:
			var spare_enemy: CombatEnemy = child as CombatEnemy
			spare_enemy.global_position = Vector2(-10000, -10000)

	var player: CombatPlayer = combat_scene.player
	player.set_physics_process(false)
	player.global_position = Vector2(800, 600)
	player.is_blocking = true
	player.shield_broken = false
	player.shield_health = CombatConstants.SHIELD_MAX_HEALTH
	player.shield_direction = Vector2.RIGHT
	player.call("_update_shield_transform")
	player.call("_sync_shield_collision_state")
	await _wait_physics_frames(2)

	target_enemy.global_position = player.global_position + Vector2(60.0, 0.0)
	target_enemy.external_push_velocity = Vector2.ZERO
	target_enemy.call("_clear_attack_windup")

	player.block_started_ms = Time.get_ticks_msec() - CombatConstants.SHIELD_PERFECT_BLOCK_WINDOW_MS - 20
	player.take_shield_hit(20, target_enemy.global_position, true, null, target_enemy)
	var normal_event: Dictionary = player.get_last_block_event()
	var normal_shield_loss: float = float(normal_event.get("shield_damage_applied", 0.0))
	var normal_counter: bool = bool(normal_event.get("melee_counter_applied", false))
	var normal_stagger_duration: float = target_enemy.stagger_time_remaining

	target_enemy.stagger_time_remaining = 0.0
	target_enemy.stagger_velocity = Vector2.ZERO
	player.shield_health = CombatConstants.SHIELD_MAX_HEALTH
	player.block_started_ms = Time.get_ticks_msec()
	player.take_shield_hit(20, target_enemy.global_position, true, null, target_enemy)
	var perfect_event: Dictionary = player.get_last_block_event()
	var perfect_shield_loss: float = float(perfect_event.get("shield_damage_applied", 0.0))
	var perfect_counter: bool = bool(perfect_event.get("melee_counter_applied", false))
	var perfect_stagger_duration: float = target_enemy.stagger_time_remaining

	_assert(not normal_counter, "Normal block should not apply melee counter stagger")
	_assert(perfect_counter, "Perfect block should apply melee counter stagger")
	_assert(perfect_shield_loss < normal_shield_loss, "Perfect block should reduce shield damage taken")
	_assert(perfect_stagger_duration > normal_stagger_duration + 0.01, "Perfect block should apply stronger stagger than normal block")
	_assert(str(perfect_event.get("block_quality_tier", "")) == "perfect", "Perfect block event should expose quality tier metadata")
	_assert(str(normal_event.get("block_quality_tier", "")) == "normal", "Normal block event should expose quality tier metadata")

	await _dispose_node(combat_scene)

func _test_encounter_pacing_attack_slots() -> void:
	var combat_scene_resource: PackedScene = load("res://scenes/combat/combat_scene.tscn")
	var combat_scene := combat_scene_resource.instantiate() as CombatScene
	root.add_child(combat_scene)
	await _wait_frames(5)

	_assert(combat_scene != null and combat_scene.player != null, "Combat scene should initialize for pacing-slot test")
	if combat_scene == null or combat_scene.player == null:
		return

	var snapshot: Dictionary = combat_scene.get_encounter_pacing_snapshot()
	var configured_max_attackers: int = int(snapshot.get("max_concurrent_attackers", 0))
	var expected_max_attackers: int = CombatConstants.get_encounter_max_concurrent_attackers(combat_scene.difficulty)
	_assert(
		configured_max_attackers == expected_max_attackers,
		"Encounter pacing max concurrent attackers should match constants for difficulty"
	)

	var attack_delays: Dictionary = snapshot.get("initial_attack_delays_by_enemy_id", {})
	_assert(attack_delays.size() == combat_scene.enemy_count, "Encounter pacing should assign a start delay for each enemy")
	for enemy in combat_scene.enemies_node.get_children():
		if enemy is CombatEnemy:
			var enemy_id: int = enemy.get_instance_id()
			var delay: float = float(attack_delays.get(enemy_id, -1.0))
			_assert(delay >= 0.0, "Encounter pacing delay should be non-negative for all enemies")
			_assert(
				delay <= CombatConstants.ENCOUNTER_PACING_MAX_INITIAL_DELAY_SEC + 0.001,
				"Encounter pacing delay should stay under anti-spike cap"
			)
			enemy.set_physics_process(false)

	var alive_enemies: Array[CombatEnemy] = []
	for child in combat_scene.enemies_node.get_children():
		if child is CombatEnemy and child.is_alive:
			alive_enemies.append(child as CombatEnemy)

	var granted_count: int = 0
	for enemy in alive_enemies:
		if combat_scene.request_enemy_attack_slot(enemy):
			granted_count += 1

	_assert(
		granted_count == mini(expected_max_attackers, alive_enemies.size()),
		"Encounter pacing should enforce max concurrent attack slots"
	)

	if not alive_enemies.is_empty():
		combat_scene.release_enemy_attack_slot(alive_enemies[0])
		var replacement_granted: bool = false
		for enemy in alive_enemies:
			if combat_scene.request_enemy_attack_slot(enemy):
				replacement_granted = true
				break
		_assert(replacement_granted, "Encounter pacing should release and re-grant attack slots")

	await _dispose_node(combat_scene)

func _test_spawn_variety_distribution() -> void:
	var planner := CombatScene.new()
	var allowed_types := {"grunt": true, "heavy": true, "archer": true}
	var difficulty_order: Array[String] = ["easy", "normal", "hard", "extreme"]

	for difficulty_name in difficulty_order:
		planner.difficulty = difficulty_name
		planner.enemy_count = int(CombatConstants.DIFFICULTY_SETTINGS[difficulty_name]["count"])
		planner.combat_id = 42

		var plan_a: Array[String] = planner._build_enemy_type_plan()
		var plan_b: Array[String] = planner._build_enemy_type_plan()
		var targets: Dictionary = CombatConstants.ENEMY_TYPE_WEIGHTS_BY_DIFFICULTY[difficulty_name]
		var expected_counts: Dictionary = planner._calculate_enemy_type_counts(planner.enemy_count, targets)

		_assert(plan_a == plan_b, "Spawn plan should be deterministic for fixed combat_id (%s)" % difficulty_name)
		_assert(plan_a.size() == planner.enemy_count, "Spawn plan size should match enemy_count for %s" % difficulty_name)

		for enemy_type in plan_a:
			_assert(allowed_types.has(enemy_type), "Spawn plan should contain only known enemy types")

		var aggregate := {"grunt": 0, "heavy": 0, "archer": 0}
		var total_spawned: int = 0
		var unique_plan_orders: Dictionary = {}
		var expected_total: int = int(expected_counts["grunt"]) + int(expected_counts["heavy"]) + int(expected_counts["archer"])
		_assert(expected_total == planner.enemy_count, "Expected composition should sum to enemy_count for %s" % difficulty_name)

		for seed in range(1, SPAWN_SANITY_SEED_COUNT + 1):
			planner.combat_id = seed
			var seeded_plan: Array[String] = planner._build_enemy_type_plan()
			unique_plan_orders[JSON.stringify(seeded_plan)] = true
			var wave_counts := {"grunt": 0, "heavy": 0, "archer": 0}

			for enemy_type in seeded_plan:
				aggregate[enemy_type] = int(aggregate[enemy_type]) + 1
				wave_counts[enemy_type] = int(wave_counts[enemy_type]) + 1
				total_spawned += 1

			for enemy_type in ["grunt", "heavy", "archer"]:
				_assert(
					int(wave_counts[enemy_type]) == int(expected_counts[enemy_type]),
					"Seeded composition should preserve weighted counts for %s/%s" % [difficulty_name, enemy_type]
				)

		_assert(unique_plan_orders.size() >= 2, "Seeded plans should vary ordering across seeds for %s" % difficulty_name)

		for enemy_type in ["grunt", "heavy", "archer"]:
			var observed_ratio: float = float(aggregate[enemy_type]) / float(total_spawned)
			var quantized_ratio: float = float(expected_counts[enemy_type]) / float(planner.enemy_count)
			var quantized_error: float = abs(observed_ratio - quantized_ratio)
			var expected_ratio: float = float(targets[enemy_type])
			var target_error: float = abs(observed_ratio - expected_ratio)
			var quantization_bound: float = (1.0 / float(planner.enemy_count)) + 0.02

			_assert(
				quantized_error <= SPAWN_RATIO_EPSILON,
				"Aggregate ratio should align with weighted-count composition for %s/%s (expected %.3f, got %.3f)" % [difficulty_name, enemy_type, quantized_ratio, observed_ratio]
			)
			_assert(
				target_error <= quantization_bound,
				"Aggregate ratio for %s/%s should stay within quantized bound (target %.3f, got %.3f, bound %.3f)" % [difficulty_name, enemy_type, expected_ratio, observed_ratio, quantization_bound]
			)

	planner.free()

func _get_first_alive_enemy(combat_scene: CombatScene) -> CombatEnemy:
	if combat_scene == null or combat_scene.enemies_node == null:
		return null
	for child in combat_scene.enemies_node.get_children():
		if child is CombatEnemy and child.is_alive:
			return child as CombatEnemy
	return null

func _wait_frames(frame_count: int) -> void:
	for _i in range(frame_count):
		await process_frame

func _wait_physics_frames(frame_count: int) -> void:
	for _i in range(frame_count):
		await physics_frame

func _dispose_node(node: Node) -> void:
	if is_instance_valid(node):
		node.free()
	await _wait_frames(3)

func _cleanup_save_file() -> void:
	DirAccess.remove_absolute("user://savegame.json")

func _color_close(a: Color, b: Color, tolerance: float = 0.001) -> bool:
	return (
		absf(a.r - b.r) <= tolerance
		and absf(a.g - b.g) <= tolerance
		and absf(a.b - b.b) <= tolerance
		and absf(a.a - b.a) <= tolerance
	)

func _color_luminance(color: Color) -> float:
	return color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722

func _assert(condition: bool, message: String) -> void:
	if condition:
		return
	failures.append(message)
	push_error("CombatImprovementsValidation: %s" % message)

func _finish() -> void:
	if failures.is_empty():
		print("CombatImprovementsValidation: PASS")
		quit(0)
		return

	print("CombatImprovementsValidation: FAIL (%d)" % failures.size())
	for failure in failures:
		print(" - ", failure)
	quit(1)
