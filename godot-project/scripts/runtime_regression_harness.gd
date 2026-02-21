extends SceneTree

const CombatConstants = preload("res://scripts/combat_constants.gd")
const RuntimeServices = preload("res://scripts/runtime_services.gd")
const StartupValidator = preload("res://scripts/startup_validator.gd")

const REQUIRED_AUTOLOADS: Array[String] = [
	"GameModes",
	"GameState",
	"EventBus",
	"AudioManager",
	"ParticleManager"
]
const INPUT_ACTIONS_TO_RELEASE: Array[String] = [
	"move_left",
	"move_right",
	"move_up",
	"move_down",
	"special_ability"
]

const SAVE_FILE_PATH: String = "user://savegame.json"
const REGRESSION_DIR: String = "user://runtime_regression"
const METRICS_OUTPUT_PATH: String = "user://runtime_regression/runtime_regression_metrics_latest.json"

var failures: Array[String] = []
var metrics: Dictionary = {
	"startup": {},
	"overworld": {},
	"combat": {
		"movement": {},
		"attack": {},
		"shield": {},
		"projectile": {},
		"transitions": {}
	},
	"save_load": {}
}

func _init() -> void:
	call_deferred("_run")

func _run() -> void:
	seed(13371337)
	_release_all_inputs()
	_cleanup_save_file()
	await _wait_frames(2)

	await _test_startup_and_autoload_sanity()
	await _test_overworld_flow()
	await _test_combat_feel_invariants()
	await _test_save_load_resilience()

	_release_all_inputs()
	_write_metrics_report()
	_finish()

func _test_startup_and_autoload_sanity() -> void:
	var startup_metrics: Dictionary = {}
	var missing_autoloads: Array[String] = []
	var autoload_present_count: int = 0

	for autoload_name in REQUIRED_AUTOLOADS:
		var autoload_node: Node = root.get_node_or_null(autoload_name)
		if autoload_node == null:
			missing_autoloads.append(autoload_name)
		else:
			autoload_present_count += 1

	var validator_result: Dictionary = StartupValidator.validate_once(root)
	var validator_ok: bool = bool(validator_result.get("ok", false))

	startup_metrics["autoload_present_count"] = autoload_present_count
	startup_metrics["missing_autoload_count"] = missing_autoloads.size()
	startup_metrics["startup_validator_ok"] = validator_ok

	metrics["startup"] = startup_metrics

	_assert(missing_autoloads.is_empty(), "Startup sanity: missing autoloads %s" % str(missing_autoloads))
	_assert(validator_ok, "Startup sanity: StartupValidator should pass")

func _test_overworld_flow() -> void:
	var overworld_metrics: Dictionary = {}
	metrics["overworld"] = overworld_metrics

	var game_modes: Node = RuntimeServices.game_modes(root)
	var game_state: Node = RuntimeServices.game_state(root)
	var event_bus: Node = RuntimeServices.event_bus(root)

	_assert(game_modes != null, "Overworld flow: GameModes autoload is required")
	_assert(game_state != null, "Overworld flow: GameState autoload is required")
	_assert(event_bus != null, "Overworld flow: EventBus autoload is required")
	if game_modes == null or game_state == null or event_bus == null:
		return

	if event_bus.has_method("clear_combat_flow_state"):
		event_bus.clear_combat_flow_state()

	var enter_overworld: Dictionary = await _enter_mode_and_wait_for_scene(
		game_modes,
		game_modes.GameMode.OVERWORLD,
		"res://scenes/overworld/overworld_scene.tscn",
		120
	)
	overworld_metrics["enter_overworld_frames"] = int(enter_overworld.get("frames", -1))
	_assert(bool(enter_overworld.get("requested", false)), "Overworld flow: transition request to OVERWORLD should succeed")
	_assert(bool(enter_overworld.get("reached", false)), "Overworld flow: overworld scene should load")
	if not bool(enter_overworld.get("reached", false)):
		return

	var overworld_scene: Node = current_scene
	_assert(overworld_scene != null, "Overworld flow: current scene should be available")
	if overworld_scene == null:
		return

	var initial_hex: Dictionary = _read_overworld_hex(overworld_scene)
	_assert(not initial_hex.is_empty(), "Overworld flow: initial hex should be readable")
	if initial_hex.is_empty():
		return

	var move_frames: int = await _simulate_overworld_single_step(overworld_scene, "move_right", initial_hex, 10)
	var moved_hex: Dictionary = _read_overworld_hex(overworld_scene)
	var move_delta_q: int = int(moved_hex.get("q", 0)) - int(initial_hex.get("q", 0))
	var move_delta_r: int = int(moved_hex.get("r", 0)) - int(initial_hex.get("r", 0))

	overworld_metrics["move_apply_frames"] = move_frames
	overworld_metrics["move_hex_delta_q"] = move_delta_q
	overworld_metrics["move_hex_delta_r"] = move_delta_r
	overworld_metrics["player_position_synced"] = _is_overworld_position_synced(game_state, moved_hex)

	_assert(move_frames >= 1, "Overworld flow: movement input should update hex within 10 frames")
	_assert(move_delta_q == 1 and move_delta_r == 0, "Overworld flow: right-step should produce hex delta (1,0), got (%d,%d)" % [move_delta_q, move_delta_r])
	_assert(bool(overworld_metrics["player_position_synced"]), "Overworld flow: moved hex should sync into GameState")

	if event_bus.has_method("clear_combat_flow_state"):
		event_bus.clear_combat_flow_state()

	overworld_scene.call("trigger_combat_encounter")
	var encounter_frames: int = await _wait_for_scene("res://scenes/combat/combat_scene.tscn", 120)
	overworld_metrics["encounter_transition_frames"] = encounter_frames
	overworld_metrics["encounter_mode_combat"] = game_modes.current_mode == game_modes.GameMode.COMBAT
	_assert(encounter_frames >= 0, "Overworld flow: encounter should transition into combat")
	_assert(bool(overworld_metrics["encounter_mode_combat"]), "Overworld flow: mode should be COMBAT after encounter trigger")

	if encounter_frames < 0:
		return

	var combat_scene: Node = current_scene
	var payload_variant: Variant = combat_scene.get("combat_start_payload") if combat_scene != null else {}
	var payload: Dictionary = payload_variant as Dictionary if payload_variant is Dictionary else {}
	var payload_hex: Dictionary = payload.get("encounter_hex", {}) as Dictionary if payload.get("encounter_hex", {}) is Dictionary else {}
	overworld_metrics["combat_payload_has_source"] = payload.has("source") and str(payload["source"]) == "overworld"
	overworld_metrics["combat_payload_has_encounter_hex"] = payload.has("encounter_hex")
	overworld_metrics["combat_payload_has_combat_id"] = payload.has("combat_id") and int(payload.get("combat_id", -1)) > 0
	overworld_metrics["combat_payload_time_limit_default"] = payload.has("time_limit") and is_equal_approx(float(payload.get("time_limit", 0.0)), 90.0)
	overworld_metrics["combat_payload_encounter_hex_matches"] = _hex_matches(payload_hex, moved_hex)
	overworld_metrics["encounter_transition_within_budget"] = encounter_frames >= 0 and encounter_frames <= 60
	_assert(bool(overworld_metrics["combat_payload_has_source"]), "Overworld flow: combat payload source should be overworld")
	_assert(bool(overworld_metrics["combat_payload_has_encounter_hex"]), "Overworld flow: combat payload should include encounter_hex")
	_assert(bool(overworld_metrics["combat_payload_has_combat_id"]), "Overworld flow: combat payload should include combat_id > 0")
	_assert(bool(overworld_metrics["combat_payload_time_limit_default"]), "Overworld flow: combat payload should include default time_limit=90")
	_assert(bool(overworld_metrics["combat_payload_encounter_hex_matches"]), "Overworld flow: combat payload encounter_hex should match trigger hex")
	_assert(bool(overworld_metrics["encounter_transition_within_budget"]), "Overworld flow: encounter transition should complete within 60 frames")

func _test_combat_feel_invariants() -> void:
	var combat_metrics: Dictionary = metrics["combat"] as Dictionary
	var movement_metrics: Dictionary = combat_metrics["movement"] as Dictionary
	var attack_metrics: Dictionary = combat_metrics["attack"] as Dictionary
	var shield_metrics: Dictionary = combat_metrics["shield"] as Dictionary
	var projectile_metrics: Dictionary = combat_metrics["projectile"] as Dictionary
	var transition_metrics: Dictionary = combat_metrics["transitions"] as Dictionary

	var game_modes: Node = RuntimeServices.game_modes(root)
	var event_bus: Node = RuntimeServices.event_bus(root)
	_assert(game_modes != null, "Combat invariants: GameModes autoload is required")
	_assert(event_bus != null, "Combat invariants: EventBus autoload is required")
	if game_modes == null or event_bus == null:
		return

	if event_bus.has_method("clear_combat_flow_state"):
		event_bus.clear_combat_flow_state()

	var enter_combat: Dictionary = await _enter_mode_and_wait_for_scene(
		game_modes,
		game_modes.GameMode.COMBAT,
		"res://scenes/combat/combat_scene.tscn",
		120
	)
	movement_metrics["enter_combat_frames"] = int(enter_combat.get("frames", -1))
	_assert(bool(enter_combat.get("requested", false)), "Combat invariants: transition request to COMBAT should succeed")
	_assert(bool(enter_combat.get("reached", false)), "Combat invariants: combat scene should load")
	if not bool(enter_combat.get("reached", false)):
		return

	var combat_scene: CombatScene = current_scene as CombatScene
	_assert(combat_scene != null, "Combat invariants: current scene should be CombatScene")
	_assert(combat_scene != null and combat_scene.player != null, "Combat invariants: combat player should be present")
	if combat_scene == null or combat_scene.player == null:
		return

	_prepare_scene_for_deterministic_combat_checks(combat_scene)
	await _wait_physics_frames(2)

	# Hotline-style movement feel and dodge gate
	movement_metrics["hotline_style_enabled"] = CombatConstants.HOTLINE_STYLE_MOVEMENT
	combat_scene.player.handle_dodge()
	await _wait_physics_frames(1)
	movement_metrics["hotline_dodge_blocked"] = (not combat_scene.player.is_dodging) if CombatConstants.HOTLINE_STYLE_MOVEMENT else true

	combat_scene.player.velocity = Vector2.ZERO
	combat_scene.player.is_blocking = false
	combat_scene.player.call("_sync_shield_collision_state")

	Input.action_press("move_right")
	var frames_to_80pct_speed: int = -1
	for frame_idx in range(40):
		await physics_frame
		if combat_scene.player.velocity.x >= combat_scene.player.speed * 0.8:
			frames_to_80pct_speed = frame_idx + 1
			break
	Input.action_release("move_right")

	var frames_to_stop: int = -1
	for frame_idx in range(40):
		await physics_frame
		if absf(combat_scene.player.velocity.x) <= 5.0:
			frames_to_stop = frame_idx + 1
			break

	movement_metrics["frames_to_reach_80pct_speed"] = frames_to_80pct_speed
	movement_metrics["frames_to_decelerate_to_stop"] = frames_to_stop

	_assert(bool(movement_metrics["hotline_style_enabled"]), "Combat invariants: HOTLINE_STYLE_MOVEMENT must remain enabled")
	_assert(bool(movement_metrics["hotline_dodge_blocked"]), "Combat invariants: dodge should remain blocked in hotline movement mode")
	_assert(frames_to_80pct_speed >= 1, "Combat invariants: movement should accelerate to 80% speed")
	_assert(frames_to_stop >= 1, "Combat invariants: movement should decelerate back to stop")

	# LMB responsiveness and cadence
	var attack_target: CombatEnemy = _get_first_alive_enemy(combat_scene)
	_assert(attack_target != null, "Combat invariants: attack target enemy is required")
	if attack_target != null:
		attack_target.enemy_type = "grunt"
		attack_target.max_health = 999
		attack_target.health = 999
		attack_target.speed = 0.0
		attack_target.attack_range = 0.0
		attack_target.global_position = combat_scene.player.global_position + Vector2(56.0, 0.0)

	combat_scene.player.last_attack_direction = Vector2.RIGHT
	combat_scene.player.last_movement_direction = Vector2.RIGHT
	combat_scene.player.shield_direction = Vector2.RIGHT
	combat_scene.player.is_blocking = false
	combat_scene.player.call("_sync_shield_collision_state")
	combat_scene.player.is_attacking = false
	combat_scene.player.last_attack_ms = 0
	combat_scene.player.update_nearby_enemies()

	var accepted_attacks: int = 0
	var cooldown_rejects: int = 0
	var damage_total: int = 0
	var attack_intervals_ms: Array[float] = []
	var previous_attack_ms: int = 0
	var first_attack_response_ms: int = -1

	for attempt in range(18):
		if accepted_attacks > 0:
			var ready: bool = await _wait_until_attack_ready(combat_scene.player, 120)
			if not ready:
				break

		var health_before_attack: int = attack_target.health if attack_target != null else 0
		var before_tick: int = Time.get_ticks_msec()
		var previous_last_attack_ms: int = combat_scene.player.last_attack_ms
		combat_scene.player.handle_attack()
		var after_tick: int = Time.get_ticks_msec()
		await _wait_physics_frames(1)

		if combat_scene.player.last_attack_ms > previous_last_attack_ms:
			accepted_attacks += 1
			if accepted_attacks == 1:
				first_attack_response_ms = after_tick - before_tick
			if previous_attack_ms > 0:
				attack_intervals_ms.append(float(combat_scene.player.last_attack_ms - previous_attack_ms))
			previous_attack_ms = combat_scene.player.last_attack_ms
			if attack_target != null:
				damage_total += max(0, health_before_attack - attack_target.health)

			if accepted_attacks == 1:
				var immediate_attack_anchor: int = combat_scene.player.last_attack_ms
				combat_scene.player.handle_attack()
				if combat_scene.player.last_attack_ms == immediate_attack_anchor:
					cooldown_rejects += 1
		else:
			cooldown_rejects += 1

		if accepted_attacks >= 3:
			break

	attack_metrics["accepted_attack_count"] = accepted_attacks
	attack_metrics["cooldown_reject_count"] = cooldown_rejects
	attack_metrics["damage_dealt_total"] = damage_total
	attack_metrics["first_attack_response_ms"] = first_attack_response_ms
	attack_metrics["avg_interval_ms"] = _average(attack_intervals_ms)
	attack_metrics["min_interval_ms"] = _minimum(attack_intervals_ms)
	attack_metrics["cadence_monotonic"] = _intervals_respect_minimum(attack_intervals_ms, 70.0)

	_assert(accepted_attacks >= 3, "Combat invariants: should land at least 3 accepted attacks")
	_assert(cooldown_rejects >= 1, "Combat invariants: immediate post-attack input should be cooldown-gated")
	_assert(damage_total > 0, "Combat invariants: accepted attacks should deal damage")
	_assert(first_attack_response_ms >= 0 and first_attack_response_ms <= 8, "Combat invariants: first LMB attack should respond within 8ms")
	_assert(bool(attack_metrics["cadence_monotonic"]), "Combat invariants: accepted attack cadence should respect minimum cooldown interval")

	# Rapid LMB edge case: spam input each frame should preserve cadence.
	await _wait_until_attack_ready(combat_scene.player, 120)
	var rapid_spam_accepted: int = 0
	var rapid_spam_rejects: int = 0
	var rapid_spam_intervals: Array[float] = []
	var rapid_previous_attack_ms: int = combat_scene.player.last_attack_ms
	for _attempt in range(30):
		var previous_last_attack_ms: int = combat_scene.player.last_attack_ms
		combat_scene.player.handle_attack()
		await _wait_physics_frames(1)
		if combat_scene.player.last_attack_ms > previous_last_attack_ms:
			rapid_spam_accepted += 1
			if rapid_previous_attack_ms > 0:
				rapid_spam_intervals.append(float(combat_scene.player.last_attack_ms - rapid_previous_attack_ms))
			rapid_previous_attack_ms = combat_scene.player.last_attack_ms
		else:
			rapid_spam_rejects += 1

	attack_metrics["rapid_spam_accept_count"] = rapid_spam_accepted
	attack_metrics["rapid_spam_reject_count"] = rapid_spam_rejects
	attack_metrics["rapid_spam_min_interval_ms"] = _minimum(rapid_spam_intervals)
	attack_metrics["rapid_spam_interval_respected"] = _intervals_respect_minimum(rapid_spam_intervals, 70.0)

	_assert(rapid_spam_accepted >= 2, "Combat invariants: rapid LMB spam should still produce accepted attacks")
	_assert(rapid_spam_rejects >= 1, "Combat invariants: rapid LMB spam should include cooldown rejections")
	_assert(bool(attack_metrics["rapid_spam_interval_respected"]), "Combat invariants: rapid LMB spam must not bypass attack cooldown")

	# Attack queue: one buffered input during cooldown should fire once on the first legal frame.
	await _wait_until_attack_ready(combat_scene.player, 120)
	combat_scene.player.is_attacking = false
	combat_scene.player.call("_clear_buffered_attack")
	var cooldown_ms: int = int(combat_scene.player.attack_cooldown * 1000.0)
	var remaining_cooldown_ms: int = mini(cooldown_ms - 1, maxi(1, CombatConstants.INPUT_WINDOW_ATTACK_QUEUE_MS - 10))
	var attack_queue_anchor_ms: int = Time.get_ticks_msec() - (cooldown_ms - remaining_cooldown_ms)
	combat_scene.player.last_attack_ms = attack_queue_anchor_ms
	combat_scene.player.handle_attack()
	await _wait_physics_frames(1)

	var attack_queue_registered: bool = combat_scene.player.has_buffered_attack() if combat_scene.player.has_method("has_buffered_attack") else false
	var attack_queue_fired_early: bool = combat_scene.player.last_attack_ms > attack_queue_anchor_ms
	var attack_queue_execute_frames: int = -1
	for frame_idx in range(24):
		await physics_frame
		if combat_scene.player.last_attack_ms > attack_queue_anchor_ms:
			attack_queue_execute_frames = frame_idx + 1
			break

	var attack_queue_executed: bool = attack_queue_execute_frames >= 0
	var attack_queue_interval_ms: int = combat_scene.player.last_attack_ms - attack_queue_anchor_ms if attack_queue_executed else -1
	var cooldown_floor_ms: int = int(combat_scene.player.attack_cooldown * 1000.0) - 2
	var attack_queue_no_early_fire: bool = (
		not attack_queue_fired_early
		and (not attack_queue_executed or attack_queue_interval_ms >= cooldown_floor_ms)
	)

	attack_metrics["attack_queue_registered"] = attack_queue_registered
	attack_metrics["attack_queue_executed"] = attack_queue_executed
	attack_metrics["attack_queue_execute_frames"] = attack_queue_execute_frames
	attack_metrics["attack_queue_interval_ms"] = attack_queue_interval_ms
	attack_metrics["attack_queue_no_early_fire"] = attack_queue_no_early_fire

	_assert(attack_queue_registered, "Combat invariants: cooldown-time attack input should register in attack queue")
	_assert(not attack_queue_fired_early, "Combat invariants: queued attack should not fire before cooldown is ready")
	_assert(attack_queue_executed, "Combat invariants: queued attack should execute on first legal frame")
	_assert(attack_queue_no_early_fire, "Combat invariants: queued attack should preserve minimum attack cooldown interval")

	# Combo payoff: higher tiers should increase damage and unlock armor-break bonuses.
	await _wait_until_attack_ready(combat_scene.player, 120)
	combat_scene.player.combo_counter = 0
	combat_scene.player.last_combo_hit_ms = 0
	combat_scene.player.is_attacking = false

	var combo_hits_recorded: int = 0
	var combo_max_counter: int = 0
	var combo_max_armor_break_level: int = 0
	var combo_damage_tier0: Array[float] = []
	var combo_damage_tier1: Array[float] = []
	var combo_damage_tier2: Array[float] = []
	var combo_damage_tier3: Array[float] = []

	if attack_target != null:
		attack_target.enemy_type = "heavy"
		attack_target.max_health = 4000
		attack_target.health = 4000
		attack_target.speed = 0.0
		attack_target.attack_range = 0.0
		attack_target.global_position = combat_scene.player.global_position + Vector2(56.0, 0.0)
		attack_target.stagger_time_remaining = 0.0
		attack_target.stagger_velocity = Vector2.ZERO

	for _attempt in range(20):
		if attack_target == null:
			break
		var ready: bool = await _wait_until_attack_ready(combat_scene.player, 120)
		if not ready:
			break

		attack_target.global_position = combat_scene.player.global_position + Vector2(56.0, 0.0)
		attack_target.stagger_time_remaining = 0.0
		attack_target.stagger_velocity = Vector2.ZERO
		attack_target.external_push_velocity = Vector2.ZERO

		var health_before: int = attack_target.health
		var previous_last_attack_ms: int = combat_scene.player.last_attack_ms
		combat_scene.player.handle_attack()
		await _wait_physics_frames(1)
		if combat_scene.player.last_attack_ms <= previous_last_attack_ms:
			continue

		var damage_delta: int = max(0, health_before - attack_target.health)
		if damage_delta <= 0:
			continue

		combo_hits_recorded += 1
		combo_max_counter = maxi(combo_max_counter, combat_scene.player.get_combo())
		var combo_context: Dictionary = combat_scene.player.get_last_combo_attack_context() if combat_scene.player.has_method("get_last_combo_attack_context") else {}
		var combo_tier: int = int(combo_context.get("combo_tier", CombatConstants.get_combo_tier(combat_scene.player.get_combo())))
		var armor_break_level: int = int(combo_context.get("armor_break_level", 0))
		combo_max_armor_break_level = maxi(combo_max_armor_break_level, armor_break_level)

		match combo_tier:
			0:
				combo_damage_tier0.append(float(damage_delta))
			1:
				combo_damage_tier1.append(float(damage_delta))
			2:
				combo_damage_tier2.append(float(damage_delta))
			3:
				combo_damage_tier3.append(float(damage_delta))
			_:
				pass

		if combo_hits_recorded >= 9:
			break

	var combo_base_avg_damage: float = _average(combo_damage_tier0)
	var combo_tier3_avg_damage: float = _average(combo_damage_tier3)
	var combo_tier3_stronger_than_base: bool = combo_tier3_avg_damage > combo_base_avg_damage + 0.5

	attack_metrics["combo_hits_recorded"] = combo_hits_recorded
	attack_metrics["combo_tier_reached_1"] = not combo_damage_tier1.is_empty()
	attack_metrics["combo_tier_reached_2"] = not combo_damage_tier2.is_empty()
	attack_metrics["combo_tier_reached_3"] = not combo_damage_tier3.is_empty()
	attack_metrics["combo_base_avg_damage"] = combo_base_avg_damage
	attack_metrics["combo_tier3_avg_damage"] = combo_tier3_avg_damage
	attack_metrics["combo_tier3_stronger_than_base"] = combo_tier3_stronger_than_base
	attack_metrics["combo_max_armor_break_level"] = combo_max_armor_break_level
	attack_metrics["combo_max_counter"] = combo_max_counter

	_assert(combo_hits_recorded >= 9, "Combat invariants: combo payoff test should record at least 9 chained hits")
	_assert(bool(attack_metrics["combo_tier_reached_2"]), "Combat invariants: combo chain should reach tier 2 bonuses")
	_assert(bool(attack_metrics["combo_tier_reached_3"]), "Combat invariants: combo chain should reach tier 3 bonuses")
	_assert(combo_base_avg_damage >= 1.0, "Combat invariants: base combo tier should deal measurable damage")
	_assert(combo_tier3_avg_damage >= 1.0, "Combat invariants: tier 3 combo should deal measurable damage")
	_assert(combo_tier3_stronger_than_base, "Combat invariants: tier 3 combo should out-damage base combo tier")
	_assert(combo_max_armor_break_level >= 1, "Combat invariants: high combo tiers should apply armor-break bonuses")

	# RMB shield hold/release behavior
	await _wait_until_player_idle(combat_scene.player, 120)
	combat_scene.player.is_attacking = false
	combat_scene.player.is_dodging = false
	combat_scene.player.shield_broken = false
	combat_scene.player.shield_health = CombatConstants.SHIELD_MAX_HEALTH
	combat_scene.player.shield_direction = Vector2.RIGHT
	combat_scene.player.call("_stop_block")
	await _wait_physics_frames(2)

	combat_scene.player.call("_start_block")
	var activate_frames: int = -1
	for frame_idx in range(8):
		await physics_frame
		if combat_scene.player.is_shield_active() and bool(combat_scene.player.get("shield_collision_enabled")):
			activate_frames = frame_idx + 1
			break

	combat_scene.player.call("_stop_block")
	var release_frames: int = -1
	for frame_idx in range(8):
		await physics_frame
		if (not combat_scene.player.is_shield_active()) and (not bool(combat_scene.player.get("shield_collision_enabled"))):
			release_frames = frame_idx + 1
			break

	shield_metrics["activate_frames"] = activate_frames
	shield_metrics["release_frames"] = release_frames
	shield_metrics["collision_active_while_blocking"] = activate_frames >= 1
	shield_metrics["collision_inactive_after_release"] = release_frames >= 1

	_assert(activate_frames >= 1, "Combat invariants: RMB hold should activate shield + collision")
	_assert(release_frames >= 1, "Combat invariants: RMB release should deactivate shield + collision")

	# Rapid RMB edge case: repeated hold/release should keep shield + collision state coherent.
	var rapid_toggle_mismatch_count: int = 0
	var rapid_toggle_cycles: int = 6
	for _cycle in range(rapid_toggle_cycles):
		combat_scene.player.call("_start_block")
		await _wait_physics_frames(1)
		if combat_scene.player.is_shield_active() != bool(combat_scene.player.get("shield_collision_enabled")):
			rapid_toggle_mismatch_count += 1
		combat_scene.player.call("_stop_block")
		await _wait_physics_frames(1)
		if combat_scene.player.is_shield_active() != bool(combat_scene.player.get("shield_collision_enabled")):
			rapid_toggle_mismatch_count += 1

	var rapid_final_inactive: bool = (not combat_scene.player.is_shield_active()) and (not bool(combat_scene.player.get("shield_collision_enabled")))
	shield_metrics["rapid_toggle_cycles"] = rapid_toggle_cycles
	shield_metrics["rapid_toggle_mismatch_count"] = rapid_toggle_mismatch_count
	shield_metrics["rapid_toggle_final_inactive"] = rapid_final_inactive
	shield_metrics["base_block_release_flow_ok"] = activate_frames >= 1 and release_frames >= 1 and rapid_toggle_mismatch_count == 0 and rapid_final_inactive

	_assert(rapid_toggle_mismatch_count == 0, "Combat invariants: rapid RMB toggles should keep shield and collision states aligned")
	_assert(rapid_final_inactive, "Combat invariants: rapid RMB toggles should end with shield inactive after release")

	# Shield/projectile outcomes
	await _wait_until_player_idle(combat_scene.player, 120)
	combat_scene.player.is_attacking = false
	combat_scene.player.is_dodging = false
	_prepare_scene_for_deterministic_combat_checks(combat_scene)
	combat_scene.player.max_health = 100
	combat_scene.player.health = 100
	combat_scene.player.shield_health = CombatConstants.SHIELD_MAX_HEALTH
	combat_scene.player.shield_broken = false
	combat_scene.player.global_position = Vector2.ZERO
	combat_scene.player.shield_direction = Vector2.RIGHT
	combat_scene.player.last_attack_direction = Vector2.RIGHT
	combat_scene.player.last_movement_direction = Vector2.RIGHT
	combat_scene.player.call("_update_shield_transform")
	var perfect_window_wait_frames: int = int(ceil(float(CombatConstants.SHIELD_PERFECT_BLOCK_WINDOW_MS) / 16.6667)) + 2
	projectile_metrics["perfect_block_window_ms"] = CombatConstants.SHIELD_PERFECT_BLOCK_WINDOW_MS
	projectile_metrics["perfect_block_wait_frames_for_normal_test"] = perfect_window_wait_frames

	# Normal block test: hold block beyond the perfect window, then block projectile.
	combat_scene.player.call("_start_block")
	await _wait_physics_frames(perfect_window_wait_frames)
	var shield_active_for_block_test: bool = combat_scene.player.is_shield_active()
	projectile_metrics["shield_active_for_block_test"] = shield_active_for_block_test
	_assert(shield_active_for_block_test, "Combat invariants: projectile block setup requires active shield")

	var blocked_health_before: int = combat_scene.player.health
	var blocked_shield_before: float = combat_scene.player.shield_health
	var blocked_projectile: CombatProjectile = _spawn_projectile_toward_player_front(combat_scene)
	var blocked_consumed: bool = await _wait_for_node_to_leave_tree(blocked_projectile, 120)
	await _wait_physics_frames(2)

	var blocked_health_delta: int = blocked_health_before - combat_scene.player.health
	var blocked_shield_delta: float = blocked_shield_before - combat_scene.player.shield_health
	var blocked_event: Dictionary = combat_scene.player.get_last_block_event() if combat_scene.player.has_method("get_last_block_event") else {}
	var blocked_event_perfect: bool = bool(blocked_event.get("perfect_block", false))
	var blocked_event_reflected: bool = bool(blocked_event.get("projectile_reflected", false))
	var blocked_window_age_ms: int = int(blocked_event.get("block_window_age_ms", -1))

	# Perfect block test: press block and intercept almost immediately.
	combat_scene.player.call("_stop_block")
	await _wait_physics_frames(2)
	combat_scene.player.shield_health = CombatConstants.SHIELD_MAX_HEALTH
	combat_scene.player.call("_start_block")
	await _wait_physics_frames(1)

	var perfect_health_before: int = combat_scene.player.health
	var perfect_shield_before: float = combat_scene.player.shield_health
	var previous_block_event_timestamp: int = int(blocked_event.get("timestamp_ms", 0))
	var perfect_projectile: CombatProjectile = _spawn_projectile_toward_player_front(combat_scene, 18.0)
	await _wait_physics_frames(4)
	var perfect_projectile_survived_initial_frames: bool = (
		perfect_projectile != null
		and is_instance_valid(perfect_projectile)
		and perfect_projectile.get_tree() != null
	)
	var perfect_event: Dictionary = combat_scene.player.get_last_block_event() if combat_scene.player.has_method("get_last_block_event") else {}
	for _i in range(16):
		var event_timestamp: int = int(perfect_event.get("timestamp_ms", 0))
		if event_timestamp > previous_block_event_timestamp:
			break
		await physics_frame
		perfect_event = combat_scene.player.get_last_block_event() if combat_scene.player.has_method("get_last_block_event") else {}
	var perfect_event_perfect: bool = bool(perfect_event.get("perfect_block", false))
	var perfect_event_reflected: bool = bool(perfect_event.get("projectile_reflected", false))
	var perfect_window_age_ms: int = int(perfect_event.get("block_window_age_ms", -1))
	var perfect_health_delta: int = perfect_health_before - combat_scene.player.health
	var perfect_shield_delta: float = perfect_shield_before - combat_scene.player.shield_health
	var perfect_consumed: bool = await _wait_for_node_to_leave_tree(perfect_projectile, 160)
	await _wait_physics_frames(2)

	combat_scene.player.call("_stop_block")
	await _wait_physics_frames(2)
	combat_scene.player.is_invincible = false

	var unblocked_health_before: int = combat_scene.player.health
	var unblocked_projectile: CombatProjectile = _spawn_projectile_toward_player_front(combat_scene)
	var unblocked_consumed: bool = await _wait_for_node_to_leave_tree(unblocked_projectile, 120)
	await _wait_physics_frames(2)

	var unblocked_health_delta: int = unblocked_health_before - combat_scene.player.health

	projectile_metrics["blocked_projectile_consumed"] = blocked_consumed
	projectile_metrics["blocked_health_delta"] = blocked_health_delta
	projectile_metrics["blocked_shield_delta"] = blocked_shield_delta
	projectile_metrics["normal_block_projectile_reflected"] = blocked_event_reflected
	projectile_metrics["unblocked_projectile_consumed"] = unblocked_consumed
	projectile_metrics["unblocked_health_delta"] = unblocked_health_delta
	projectile_metrics["perfect_block_projectile_reflected"] = perfect_event_reflected
	projectile_metrics["perfect_block_projectile_survived_initial_frames"] = perfect_projectile_survived_initial_frames
	projectile_metrics["perfect_block_projectile_consumed"] = perfect_consumed
	projectile_metrics["perfect_block_health_delta"] = perfect_health_delta
	projectile_metrics["perfect_block_shield_delta"] = perfect_shield_delta
	projectile_metrics["perfect_block_shield_delta_reduced"] = perfect_shield_delta + 0.01 < blocked_shield_delta
	projectile_metrics["perfect_block_vs_normal_shield_delta_gap"] = blocked_shield_delta - perfect_shield_delta

	shield_metrics["normal_block_outside_perfect_window"] = not blocked_event_perfect
	shield_metrics["normal_block_window_age_ms"] = blocked_window_age_ms
	shield_metrics["perfect_block_within_window"] = perfect_event_perfect
	shield_metrics["perfect_block_window_age_ms"] = perfect_window_age_ms

	_assert(blocked_consumed, "Combat invariants: blocked projectile should be consumed")
	_assert(unblocked_consumed, "Combat invariants: unblocked projectile should be consumed")
	_assert(blocked_health_delta == 0, "Combat invariants: blocked projectile should not reduce player health")
	_assert(blocked_shield_delta >= 1.0, "Combat invariants: blocked projectile should reduce shield health")
	_assert(not blocked_event_perfect, "Combat invariants: normal hold block should resolve outside perfect window")
	_assert(blocked_window_age_ms > CombatConstants.SHIELD_PERFECT_BLOCK_WINDOW_MS, "Combat invariants: normal block window age should exceed perfect-block window")
	_assert(not blocked_event_reflected, "Combat invariants: normal block should consume projectile without reflect")
	_assert(perfect_event_perfect, "Combat invariants: tight timing block should register as perfect block")
	_assert(perfect_window_age_ms >= 0 and perfect_window_age_ms <= CombatConstants.SHIELD_PERFECT_BLOCK_WINDOW_MS, "Combat invariants: perfect block should resolve inside perfect window")
	_assert(perfect_event_reflected, "Combat invariants: perfect block should reflect projectile")
	_assert(perfect_projectile_survived_initial_frames, "Combat invariants: reflected projectile should survive initial frames (not immediate consume)")
	_assert(perfect_consumed, "Combat invariants: reflected projectile should still be eventually consumed")
	_assert(perfect_health_delta == 0, "Combat invariants: perfect block projectile should not damage health")
	_assert(perfect_shield_delta + 0.01 < blocked_shield_delta, "Combat invariants: perfect block should reduce shield HP loss versus normal block")
	_assert(unblocked_health_delta >= 1, "Combat invariants: unblocked projectile should damage player")

	# Death/victory transitions
	if event_bus.has_method("clear_combat_flow_state"):
		event_bus.clear_combat_flow_state()

	combat_scene.end_combat(true)
	var victory_frames: int = await _wait_for_scene("res://scenes/overworld/overworld_scene.tscn", 120)
	var victory_mode_overworld: bool = game_modes.current_mode == game_modes.GameMode.OVERWORLD and victory_frames >= 0
	var victory_result: Dictionary = event_bus.consume_latest_combat_result() if event_bus.has_method("consume_latest_combat_result") else {}

	var reenter_combat: Dictionary = await _enter_mode_and_wait_for_scene(
		game_modes,
		game_modes.GameMode.COMBAT,
		"res://scenes/combat/combat_scene.tscn",
		120
	)

	var defeat_frames: int = -1
	var defeat_result: Dictionary = {}
	if bool(reenter_combat.get("reached", false)):
		var defeat_scene: CombatScene = current_scene as CombatScene
		if defeat_scene != null and defeat_scene.player != null:
			if event_bus.has_method("clear_combat_flow_state"):
				event_bus.clear_combat_flow_state()
			defeat_scene.player.die()
			defeat_frames = await _wait_for_scene("res://scenes/death/death_scene.tscn", 120)
			if event_bus.has_method("consume_latest_combat_result"):
				defeat_result = event_bus.consume_latest_combat_result()

	var defeat_mode_death: bool = game_modes.current_mode == game_modes.GameMode.DEATH and defeat_frames >= 0

	transition_metrics["victory_transition_frames"] = victory_frames
	transition_metrics["defeat_transition_frames"] = defeat_frames
	transition_metrics["victory_mode_overworld"] = victory_mode_overworld
	transition_metrics["defeat_mode_death"] = defeat_mode_death
	transition_metrics["victory_result_flag"] = bool(victory_result.get("victory", false)) if not victory_result.is_empty() else false
	transition_metrics["defeat_result_flag"] = (not bool(defeat_result.get("victory", true))) if not defeat_result.is_empty() else false
	transition_metrics["combat_end_events_observed"] = int((1 if not victory_result.is_empty() else 0) + (1 if not defeat_result.is_empty() else 0))

	_assert(victory_frames >= 0, "Combat invariants: victory should transition to overworld")
	_assert(defeat_frames >= 0, "Combat invariants: defeat should transition to death scene")
	_assert(bool(transition_metrics["victory_mode_overworld"]), "Combat invariants: victory mode should resolve to OVERWORLD")
	_assert(bool(transition_metrics["defeat_mode_death"]), "Combat invariants: defeat mode should resolve to DEATH")
	_assert(bool(transition_metrics["victory_result_flag"]), "Combat invariants: victory result payload should report victory=true")
	_assert(bool(transition_metrics["defeat_result_flag"]), "Combat invariants: defeat result payload should report victory=false")

func _test_save_load_resilience() -> void:
	var save_metrics: Dictionary = {}
	metrics["save_load"] = save_metrics

	var game_state: Node = RuntimeServices.game_state(root)
	_assert(game_state != null, "Save/load: GameState autoload is required")
	if game_state == null:
		return

	_cleanup_save_file()
	await _wait_frames(1)

	game_state.reset_to_default()
	game_state.game_state["schema_version"] = 2
	game_state.game_state["stats"]["wealth"] = 4321
	game_state.game_state["flags"]["runtime_gate_roundtrip"] = true
	game_state.save_game()

	game_state.game_state["stats"]["wealth"] = 9
	game_state.game_state["flags"]["runtime_gate_roundtrip"] = false

	var roundtrip_success: bool = game_state.load_game()
	var roundtrip_wealth_restored: bool = int(game_state.game_state["stats"]["wealth"]) == 4321
	save_metrics["roundtrip_load_success"] = roundtrip_success
	save_metrics["roundtrip_wealth_restored"] = roundtrip_wealth_restored

	_assert(roundtrip_success, "Save/load: load_game should succeed for valid save")
	_assert(roundtrip_wealth_restored, "Save/load: valid load should restore saved wealth")

	var corrupt_count_before: int = _count_corrupt_save_files()
	var corrupt_file: FileAccess = FileAccess.open(SAVE_FILE_PATH, FileAccess.WRITE)
	if corrupt_file == null:
		_assert(false, "Save/load: failed to open save file for corrupt-write test")
		return
	corrupt_file.store_string("{ this is invalid JSON !!!")
	corrupt_file.close()

	var corrupt_load_result: bool = game_state.load_game()
	var corrupt_count_after: int = _count_corrupt_save_files()
	var corrupt_quarantine_delta: int = corrupt_count_after - corrupt_count_before
	var corrupt_reset_defaults: bool = int(game_state.game_state["stats"]["strength"]) == 5

	save_metrics["corrupt_load_returns_false"] = not corrupt_load_result
	save_metrics["corrupt_quarantine_delta"] = corrupt_quarantine_delta
	save_metrics["corrupt_resets_defaults"] = corrupt_reset_defaults

	_assert(not corrupt_load_result, "Save/load: corrupt save should fail to load")
	_assert(corrupt_quarantine_delta >= 1, "Save/load: corrupt save should be quarantined with +1 file")
	_assert(corrupt_reset_defaults, "Save/load: corrupt save should reset state to defaults")

func _prepare_scene_for_deterministic_combat_checks(combat_scene: CombatScene) -> void:
	if combat_scene == null or combat_scene.player == null:
		return

	combat_scene.player.global_position = CombatConstants.COMBAT_AREA_CENTER
	combat_scene.player.max_health = 100
	combat_scene.player.health = 100
	combat_scene.player.shield_health = CombatConstants.SHIELD_MAX_HEALTH
	combat_scene.player.shield_broken = false
	combat_scene.player.is_blocking = false
	combat_scene.player.is_invincible = false
	combat_scene.player.shield_direction = Vector2.RIGHT
	combat_scene.player.last_attack_direction = Vector2.RIGHT
	combat_scene.player.last_movement_direction = Vector2.RIGHT
	combat_scene.player.velocity = Vector2.ZERO
	combat_scene.player.call("_sync_shield_collision_state")

	for child in combat_scene.enemies_node.get_children():
		if child is CombatEnemy:
			var enemy: CombatEnemy = child as CombatEnemy
			enemy.global_position = Vector2(-10000.0, -10000.0)
			enemy.speed = 0.0
			enemy.attack_range = 0.0

func _spawn_projectile_toward_player_front(combat_scene: CombatScene, front_offset_from_shield: float = 140.0) -> CombatProjectile:
	var projectile_scene: PackedScene = load("res://scenes/combat/projectile.tscn")
	var projectile: CombatProjectile = projectile_scene.instantiate() as CombatProjectile
	combat_scene.add_child(projectile)
	var facing: Vector2 = combat_scene.player.get_shield_facing_direction()
	if facing == Vector2.ZERO:
		facing = Vector2.RIGHT
	facing = facing.normalized()
	var spawn_offset: float = maxf(8.0, front_offset_from_shield)
	projectile.global_position = combat_scene.player.global_position + facing * (CombatConstants.SHIELD_COLLISION_OFFSET + spawn_offset)
	projectile.initialize(
		-facing,
		null,
		CombatConstants.PROJECTILE_DAMAGE,
		CombatConstants.PROJECTILE_SPEED,
		CombatConstants.PROJECTILE_LIFETIME_SEC,
		CombatConstants.PROJECTILE_MAX_RANGE
	)
	return projectile

func _get_first_alive_enemy(combat_scene: CombatScene) -> CombatEnemy:
	if combat_scene == null or combat_scene.enemies_node == null:
		return null
	for child in combat_scene.enemies_node.get_children():
		if child is CombatEnemy and child.is_alive:
			return child as CombatEnemy
	return null

func _read_overworld_hex(overworld_scene: Node) -> Dictionary:
	if overworld_scene == null:
		return {}
	var hex_variant: Variant = overworld_scene.get("current_hex")
	if hex_variant is Dictionary:
		return (hex_variant as Dictionary).duplicate(true)
	return {}

func _is_overworld_position_synced(game_state: Node, moved_hex: Dictionary) -> bool:
	if game_state == null or moved_hex.is_empty():
		return false
	if not game_state.game_state.has("overworld"):
		return false
	var overworld_state: Variant = game_state.game_state["overworld"]
	if not (overworld_state is Dictionary):
		return false
	var position_variant: Variant = (overworld_state as Dictionary).get("position", {})
	if not (position_variant is Dictionary):
		return false
	var synced_hex: Dictionary = position_variant as Dictionary
	return int(synced_hex.get("q", 0)) == int(moved_hex.get("q", 0)) and int(synced_hex.get("r", 0)) == int(moved_hex.get("r", 0))

func _hex_matches(a: Dictionary, b: Dictionary) -> bool:
	if a.is_empty() or b.is_empty():
		return false
	return int(a.get("q", 0)) == int(b.get("q", 0)) and int(a.get("r", 0)) == int(b.get("r", 0))

func _simulate_overworld_single_step(overworld_scene: Node, action_name: String, start_hex: Dictionary, max_frames: int) -> int:
	if overworld_scene == null:
		return -1

	Input.action_release(action_name)
	Input.action_press(action_name)
	var applied_frame: int = -1

	for frame_idx in range(max_frames):
		await process_frame
		var current_hex: Dictionary = _read_overworld_hex(overworld_scene)
		if int(current_hex.get("q", 0)) != int(start_hex.get("q", 0)) or int(current_hex.get("r", 0)) != int(start_hex.get("r", 0)):
			applied_frame = frame_idx + 1
			break

	Input.action_release(action_name)
	await process_frame
	return applied_frame

func _enter_mode_and_wait_for_scene(game_modes: Node, mode_value: int, scene_path: String, max_frames: int) -> Dictionary:
	if game_modes == null:
		return {"requested": false, "reached": false, "frames": -1}
	var requested: bool = game_modes.set_mode(mode_value, true)
	var frames: int = await _wait_for_scene(scene_path, max_frames)
	return {
		"requested": requested,
		"reached": frames >= 0,
		"frames": frames
	}

func _wait_for_scene(scene_path: String, max_frames: int) -> int:
	for frame_idx in range(max_frames):
		if current_scene != null and current_scene.scene_file_path == scene_path:
			return frame_idx
		await process_frame
	return -1

func _wait_until_attack_ready(player: CombatPlayer, max_frames: int) -> bool:
	for _i in range(max_frames):
		await physics_frame
		var now_ms: int = Time.get_ticks_msec()
		var cooldown_ready: bool = now_ms - player.last_attack_ms >= int(player.attack_cooldown * 1000.0)
		if not player.is_attacking and cooldown_ready:
			return true
	return false

func _wait_until_player_idle(player: CombatPlayer, max_frames: int) -> bool:
	for _i in range(max_frames):
		await physics_frame
		if not player.is_attacking and not player.is_dodging:
			return true
	return false

func _wait_for_node_to_leave_tree(node: Node, max_frames: int) -> bool:
	for _i in range(max_frames):
		if node == null or not is_instance_valid(node) or node.get_tree() == null:
			return true
		await physics_frame
	return false

func _wait_frames(frame_count: int) -> void:
	for _i in range(frame_count):
		await process_frame

func _wait_physics_frames(frame_count: int) -> void:
	for _i in range(frame_count):
		await physics_frame

func _average(values: Array[float]) -> float:
	if values.is_empty():
		return 0.0
	var total: float = 0.0
	for value in values:
		total += value
	return total / float(values.size())

func _minimum(values: Array[float]) -> float:
	if values.is_empty():
		return 0.0
	var current_min: float = values[0]
	for value in values:
		if value < current_min:
			current_min = value
	return current_min

func _intervals_respect_minimum(intervals: Array[float], minimum_ms: float) -> bool:
	for interval in intervals:
		if interval + 0.001 < minimum_ms:
			return false
	return true

func _count_corrupt_save_files() -> int:
	var dir: DirAccess = DirAccess.open("user://")
	if dir == null:
		return 0

	var count: int = 0
	dir.list_dir_begin()
	while true:
		var file_name: String = dir.get_next()
		if file_name == "":
			break
		if dir.current_is_dir():
			continue
		if file_name.begins_with("savegame.json.corrupt-"):
			count += 1
	dir.list_dir_end()
	return count

func _cleanup_save_file() -> void:
	DirAccess.remove_absolute(SAVE_FILE_PATH)

func _release_all_inputs() -> void:
	for action_name in INPUT_ACTIONS_TO_RELEASE:
		Input.action_release(action_name)

func _flatten_metrics(prefix: String, value: Variant, output: Dictionary) -> void:
	if value is Dictionary:
		var dict_value: Dictionary = value
		for key in dict_value.keys():
			var next_prefix: String = str(key) if prefix == "" else "%s.%s" % [prefix, str(key)]
			_flatten_metrics(next_prefix, dict_value[key], output)
		return
	output[prefix] = value

func _write_metrics_report() -> void:
	var flat_metrics: Dictionary = {}
	_flatten_metrics("", metrics, flat_metrics)

	var report := {
		"schema_version": 1,
		"meta": {
			"captured_at_unix": Time.get_unix_time_from_system(),
			"godot_version": Engine.get_version_info(),
			"platform": OS.get_name()
		},
		"status": "pass" if failures.is_empty() else "fail",
		"failures": failures.duplicate(),
		"metrics": metrics.duplicate(true),
		"flat_metrics": flat_metrics
	}

	DirAccess.make_dir_recursive_absolute(REGRESSION_DIR)
	var output_file: FileAccess = FileAccess.open(METRICS_OUTPUT_PATH, FileAccess.WRITE)
	if output_file == null:
		push_error("RuntimeRegressionHarness: Failed to write metrics artifact: %s" % METRICS_OUTPUT_PATH)
		return
	output_file.store_string(JSON.stringify(report))
	output_file.close()

	print("RuntimeRegressionHarness: METRICS_PATH=%s" % METRICS_OUTPUT_PATH)
	print("RuntimeRegressionHarness: FLAT_METRICS_JSON=%s" % JSON.stringify(flat_metrics))

func _assert(condition: bool, message: String) -> void:
	if condition:
		return
	failures.append(message)
	push_error("RuntimeRegressionHarness: %s" % message)

func _finish() -> void:
	if failures.is_empty():
		print("RuntimeRegressionHarness: PASS")
		quit(0)
		return

	print("RuntimeRegressionHarness: FAIL (%d)" % failures.size())
	for failure in failures:
		print(" - ", failure)
	quit(1)
