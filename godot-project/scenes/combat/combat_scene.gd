extends Node2D
class_name CombatScene

# Import combat constants
const CombatConstants = preload("res://scripts/combat_constants.gd")
const RuntimeServices = preload("res://scripts/runtime_services.gd")

@export var difficulty: String = "normal"
@export var time_limit: float = 90.0

var player: CombatPlayer = null
var enemies_node: Node2D = null
var ui_node: CanvasLayer = null
var particles_node: Node2D = null
var background: Sprite2D = null

var enemy_count: int = 4
var enemies_killed: int = 0
var time_remaining: float = 0.0
var is_game_over: bool = false
var tracked_enemies: Array[CombatEnemy] = []
var combat_start_payload: Dictionary = {}
var combat_id: int = -1

# UI elements
var health_bar: ProgressBar = null
var timer_label: Label = null
var combo_label: Label = null
var minimap: Control = null

# Enemy scene
var enemy_scene: PackedScene = preload("res://scenes/combat/enemy.tscn")

var event_bus: Node = null
var audio_manager: Node = null
var hit_stop_timer: Timer = null
var hit_stop_end_ms: int = 0
var hit_stop_active: bool = false

const ENEMY_TYPE_ORDER: Array[String] = ["grunt", "heavy", "archer"]

# Audio loading handled by AudioManager

func _ready() -> void:
	event_bus = _get_event_bus()
	audio_manager = _get_audio_manager()
	_setup_hit_stop()
	_sync_mode_with_scene()
	
	# Get references with error checking
	player = $Player
	if not player:
		push_error("CombatScene: Player node not found!")
		return
	
	enemies_node = $Enemies
	if not enemies_node:
		push_error("CombatScene: Enemies node not found!")
		return
	
	ui_node = $UI
	particles_node = $Particles
	background = $Background
	
	# Load background map
	_load_background_map()

	# Apply queued encounter payload before difficulty setup.
	_consume_combat_start_payload()
	_ensure_combat_id()

	# Setup base difficulty first, then apply stat-based scaling.
	setup_difficulty()
	scale_difficulty_from_stats()
	
	# Spawn enemies
	spawn_enemies()
	
	# Position player at center of combat area
	if player:
		player.global_position = Vector2(800, 600)  # Center of 1600x1200 combat area
	
	# Spawn enemies complete
	
	# Create UI
	create_ui()
	
	# Start timer
	time_remaining = time_limit

	# Connect signals
	if player and player.has_signal("died"):
		var on_player_died_callable := Callable(self, "_on_player_died")
		if not player.died.is_connected(on_player_died_callable):
			player.died.connect(on_player_died_callable)

func _sync_mode_with_scene() -> void:
	var game_modes = _get_game_modes()
	if game_modes and game_modes.has_method("sync_mode_without_scene_change"):
		game_modes.sync_mode_without_scene_change(game_modes.GameMode.COMBAT)

func _consume_combat_start_payload() -> void:
	if not event_bus or not event_bus.has_method("consume_combat_start"):
		return

	var payload: Dictionary = event_bus.consume_combat_start()
	if payload.is_empty():
		return

	combat_start_payload = payload
	if payload.has("difficulty"):
		difficulty = str(payload["difficulty"])
	if payload.has("combat_id"):
		combat_id = int(payload["combat_id"])

func _ensure_combat_id() -> void:
	if combat_id >= 0:
		return
	if event_bus and event_bus.has_method("allocate_combat_id"):
		combat_id = int(event_bus.allocate_combat_id())

func scale_difficulty_from_stats() -> void:
	var game_state = _get_game_state()
	if not game_state or not game_state.game_state.has("stats"):
		return
	
	var stats = game_state.game_state["stats"]
	
	# Scale enemy count based on agility
	var agility_bonus = max(0, floori((stats["agility"] - 5) / CombatConstants.AGILITY_SCALING_THRESHOLD))
	enemy_count += agility_bonus
	
	# Scale player health based on endurance
	var endurance_bonus = max(0, stats["endurance"] - CombatConstants.ENDURANCE_SCALING_THRESHOLD)
	player.max_health += endurance_bonus * CombatConstants.PLAYER_HEALTH_ENDURANCE_BONUS
	player.health = player.max_health

func spawn_enemies() -> void:
	var enemy_type_plan: Array[String] = _build_enemy_type_plan()

	for i in range(enemy_count):
		if not enemy_scene:
			push_error("CombatScene: Enemy scene not loaded!")
			return
			
		var enemy = enemy_scene.instantiate()
		if not enemy:
			push_error("CombatScene: Failed to instantiate enemy!")
			continue

		if enemy is CombatEnemy and i < enemy_type_plan.size():
			var typed_enemy := enemy as CombatEnemy
			typed_enemy.enemy_type = enemy_type_plan[i]
			
		var spawn_point = CombatConstants.SPAWN_POINTS[i % CombatConstants.SPAWN_POINTS.size()]
		enemy.position = spawn_point
		
		# Connect death signal
		if enemy.has_signal("died"):
			var on_enemy_killed_callable := Callable(self, "_on_enemy_killed")
			if not enemy.died.is_connected(on_enemy_killed_callable):
				enemy.died.connect(on_enemy_killed_callable)
		
		enemies_node.add_child(enemy)
		if enemy is CombatEnemy:
			tracked_enemies.append(enemy as CombatEnemy)

func _process(delta: float) -> void:
	if is_game_over:
		return
	
	# Update timer
	time_remaining -= delta
	
	# Update UI
	update_ui()
	
	# Check win/lose
	check_game_end()

func request_hit_stop(duration_sec: float) -> void:
	if not CombatConstants.HIT_STOP_ENABLED:
		return
	if duration_sec <= 0.0:
		return

	var clamped_duration: float = minf(duration_sec, CombatConstants.HIT_STOP_MAX_DURATION_SEC)
	var now: int = Time.get_ticks_msec()
	var requested_end: int = now + int(clamped_duration * 1000.0)
	hit_stop_end_ms = maxi(hit_stop_end_ms, requested_end)
	hit_stop_active = true

	if hit_stop_timer == null:
		_setup_hit_stop()

	var remaining: float = maxf(0.001, float(hit_stop_end_ms - now) / 1000.0)
	hit_stop_timer.stop()
	hit_stop_timer.wait_time = remaining
	hit_stop_timer.start()

func is_hit_stop_active() -> bool:
	if not hit_stop_active:
		return false

	if Time.get_ticks_msec() >= hit_stop_end_ms:
		hit_stop_active = false
		hit_stop_end_ms = 0
		if hit_stop_timer:
			hit_stop_timer.stop()
		return false

	return true

func setup_difficulty() -> void:
	var setting = CombatConstants.DIFFICULTY_SETTINGS.get(difficulty, CombatConstants.DIFFICULTY_SETTINGS["normal"])
	enemy_count = setting["count"]
	time_limit = setting["time"]
	time_remaining = time_limit

func _build_enemy_type_plan() -> Array[String]:
	var counts: Dictionary = _calculate_enemy_type_counts(enemy_count, _get_enemy_type_weights())
	var plan: Array[String] = []

	for enemy_type in ENEMY_TYPE_ORDER:
		var type_count: int = int(counts.get(enemy_type, 0))
		for _i in range(type_count):
			plan.append(enemy_type)

	if plan.size() < enemy_count:
		for _i in range(enemy_count - plan.size()):
			plan.append("grunt")
	elif plan.size() > enemy_count:
		plan.resize(enemy_count)

	_shuffle_enemy_type_plan(plan)
	return plan

func _get_enemy_type_weights() -> Dictionary:
	var fallback: Dictionary = CombatConstants.ENEMY_TYPE_WEIGHTS_BY_DIFFICULTY["normal"]
	var weights: Dictionary = CombatConstants.ENEMY_TYPE_WEIGHTS_BY_DIFFICULTY.get(difficulty, fallback)
	return weights.duplicate(true)

func _calculate_enemy_type_counts(total_count: int, weights: Dictionary) -> Dictionary:
	var counts := {"grunt": 0, "heavy": 0, "archer": 0}
	if total_count <= 0:
		return counts

	var normalized_weights: Dictionary = {}
	var total_weight: float = 0.0
	for enemy_type in ENEMY_TYPE_ORDER:
		var weight: float = maxf(0.0, float(weights.get(enemy_type, 0.0)))
		normalized_weights[enemy_type] = weight
		total_weight += weight

	if total_weight <= 0.0:
		counts["grunt"] = total_count
		return counts

	var remainders: Dictionary = {}
	var assigned: int = 0
	for enemy_type in ENEMY_TYPE_ORDER:
		var normalized: float = float(normalized_weights[enemy_type]) / total_weight
		var raw_count: float = normalized * float(total_count)
		var floor_count: int = int(floor(raw_count))
		counts[enemy_type] = floor_count
		remainders[enemy_type] = raw_count - float(floor_count)
		assigned += floor_count

	var remaining: int = total_count - assigned
	while remaining > 0:
		var selected_type: String = "grunt"
		var best_remainder: float = -1.0
		for enemy_type in ENEMY_TYPE_ORDER:
			var candidate_remainder: float = float(remainders.get(enemy_type, 0.0))
			if candidate_remainder > best_remainder:
				best_remainder = candidate_remainder
				selected_type = enemy_type
		counts[selected_type] = int(counts[selected_type]) + 1
		remainders[selected_type] = float(remainders[selected_type]) - 1.0
		remaining -= 1

	return counts

func _shuffle_enemy_type_plan(plan: Array[String]) -> void:
	if plan.size() <= 1:
		return

	var rng := RandomNumberGenerator.new()
	rng.seed = int(combat_id if combat_id >= 0 else 1)

	for i in range(plan.size() - 1, 0, -1):
		var j: int = rng.randi_range(0, i)
		var temp: String = plan[i]
		plan[i] = plan[j]
		plan[j] = temp

func create_ui() -> void:
	# Health bar
	health_bar = ProgressBar.new()
	health_bar.size = CombatConstants.HEALTH_BAR_SIZE
	health_bar.position = CombatConstants.UI_HEALTH_BAR_POS
	health_bar.max_value = player.max_health
	health_bar.value = player.health
	ui_node.add_child(health_bar)
	
	# Timer label
	timer_label = Label.new()
	timer_label.position = CombatConstants.UI_TIMER_POS
	timer_label.text = "Time: 90"
	ui_node.add_child(timer_label)
	
	# Combo label
	combo_label = Label.new()
	combo_label.position = CombatConstants.UI_COMBO_POS
	combo_label.text = "Combo: 0"
	ui_node.add_child(combo_label)
	
	# Minimap
	minimap = Control.new()
	minimap.size = CombatConstants.UI_MINIMAP_SIZE
	minimap.position = CombatConstants.UI_MINIMAP_POS
	minimap.draw.connect(Callable(self, "_draw_minimap"))
	ui_node.add_child(minimap)

func update_ui() -> void:
	if health_bar:
		health_bar.value = player.health
	
	if timer_label:
		var seconds = max(0, int(time_remaining))
		timer_label.text = "Time: " + str(seconds)
	
	if combo_label:
		var combo_count: int = player.get_combo()
		var combo_tier: int = player.get_combo_tier() if player.has_method("get_combo_tier") else 0
		combo_label.text = "Combo: " + str(combo_count)
		if combo_tier > 0:
			combo_label.text += "  T" + str(combo_tier)
		combo_label.modulate = _get_combo_tier_label_color(combo_tier)

func _get_combo_tier_label_color(combo_tier: int) -> Color:
	match combo_tier:
		3:
			return Color(1.0, 0.56, 0.25, 1.0)
		2:
			return Color(1.0, 0.74, 0.30, 1.0)
		1:
			return Color(1.0, 0.86, 0.46, 1.0)
		_:
			return Color.WHITE

func _draw_minimap() -> void:
	# Draw minimap background
	var rect = Rect2(Vector2.ZERO, minimap.size)
	minimap.draw_rect(rect, Color.BLACK, true)
	minimap.draw_rect(rect, Color.WHITE, false, 2)
	
	# Draw player
	if player:
		var player_pos = (player.position / CombatConstants.COMBAT_AREA_SIZE) * minimap.size
		minimap.draw_circle(player_pos, 2, Color.GREEN)
	
	# Draw enemies
	for enemy in enemies_node.get_children():
		if enemy.is_alive:
			var enemy_pos = (enemy.position / CombatConstants.COMBAT_AREA_SIZE) * minimap.size
			minimap.draw_circle(enemy_pos, 1, Color.RED)

func check_game_end() -> void:
	# Win condition
	if enemies_killed >= enemy_count:
		end_combat(true)
		return
	
	# Lose conditions
	if player and player.health <= 0:
		end_combat(false)
		return
		
	if time_remaining <= 0:
		end_combat(false)
		return

func end_combat(victory: bool) -> void:
	if is_game_over:
		return
	
	is_game_over = true
	set_process(false)
	
	# Emit event
	if event_bus:
		var result := {
			"victory": victory,
			"enemies_killed": enemies_killed,
			"time_remaining": max(0, time_remaining),
			"time_limit": time_limit,
			"difficulty": difficulty,
			"combat_id": combat_id
		}
		if event_bus.has_method("submit_combat_result"):
			event_bus.submit_combat_result(result)
		elif event_bus.has_signal("combat_end"):
			event_bus.combat_end.emit(result)
	
	_cleanup_combat_connections()

	# Change mode on completion branch.
	var game_modes = _get_game_modes()
	if game_modes:
		if victory:
			game_modes.set_mode(GameModes.GameMode.OVERWORLD)
		else:
			game_modes.set_mode(GameModes.GameMode.DEATH)

func _load_background_map() -> void:
	# Try to load a map background from common locations
	var map_paths = [
		"res://assets/map.png"
	]
	
	for map_path in map_paths:
		if FileAccess.file_exists(map_path):
			var texture = load(map_path)
			if texture:
				background.texture = texture
				# Center and scale the background
				background.position = CombatConstants.COMBAT_AREA_CENTER
				var scale_x = CombatConstants.COMBAT_AREA_SIZE.x / texture.get_width()
				var scale_y = CombatConstants.COMBAT_AREA_SIZE.y / texture.get_height()
				var scale = min(scale_x, scale_y)
				background.scale = Vector2(scale, scale)
				return

func _on_enemy_killed() -> void:
	if is_game_over:
		return

	enemies_killed += 1
	
	# Play death sound
	if audio_manager:
		var death_sfx = audio_manager.get_sfx("death")
		if death_sfx:
			audio_manager.play_sfx(death_sfx, CombatConstants.AUDIO_VOLUME_DEATH)
	
	# Camera shake on kill
	var camera = $Player/Camera2D if $Player else null
	if camera and camera.has_method("apply_shake"):
			camera.apply_shake(CombatConstants.CAMERA_SHAKE_INTENSITY, CombatConstants.CAMERA_SHAKE_DURATION)
	elif camera:
		# Simple camera shake using tween
		var tween = create_tween()
		var original_offset = camera.offset
		for i in range(5):
			tween.tween_property(camera, "offset", original_offset + Vector2(randf_range(-CombatConstants.CAMERA_SHAKE_INTENSITY, CombatConstants.CAMERA_SHAKE_INTENSITY), randf_range(-CombatConstants.CAMERA_SHAKE_INTENSITY, CombatConstants.CAMERA_SHAKE_INTENSITY)), 0.03)
		tween.tween_property(camera, "offset", original_offset, 0.03)

func _on_player_died() -> void:
	end_combat(false)

func _cleanup_combat_connections() -> void:
	if player and player.has_signal("died"):
		var on_player_died_callable := Callable(self, "_on_player_died")
		if player.died.is_connected(on_player_died_callable):
			player.died.disconnect(on_player_died_callable)

	var on_enemy_killed_callable := Callable(self, "_on_enemy_killed")
	for enemy in tracked_enemies:
		if is_instance_valid(enemy) and enemy.has_signal("died") and enemy.died.is_connected(on_enemy_killed_callable):
			enemy.died.disconnect(on_enemy_killed_callable)
	tracked_enemies.clear()

func _exit_tree() -> void:
	_cleanup_combat_connections()
	if hit_stop_timer and is_instance_valid(hit_stop_timer):
		hit_stop_timer.stop()

func _setup_hit_stop() -> void:
	if hit_stop_timer and is_instance_valid(hit_stop_timer):
		return
	hit_stop_timer = Timer.new()
	hit_stop_timer.one_shot = true
	hit_stop_timer.autostart = false
	hit_stop_timer.timeout.connect(_on_hit_stop_timeout)
	add_child(hit_stop_timer)

func _on_hit_stop_timeout() -> void:
	var now: int = Time.get_ticks_msec()
	if now < hit_stop_end_ms:
		var remaining: float = maxf(0.001, float(hit_stop_end_ms - now) / 1000.0)
		hit_stop_timer.wait_time = remaining
		hit_stop_timer.start()
		return
	hit_stop_active = false
	hit_stop_end_ms = 0

func _get_event_bus() -> Node:
	var bus = RuntimeServices.event_bus(self)
	if not bus:
		push_error("CombatScene: EventBus singleton not found")
	return bus

func _get_audio_manager() -> Node:
	var manager = RuntimeServices.audio_manager(self)
	if not manager:
		push_error("CombatScene: AudioManager singleton not found")
	return manager

func _get_game_state() -> Node:
	var state = RuntimeServices.game_state(self)
	if not state:
		push_error("CombatScene: GameState singleton not found")
	return state

func _get_game_modes() -> Node:
	var modes = RuntimeServices.game_modes(self)
	if not modes:
		push_error("CombatScene: GameModes singleton not found")
	return modes
