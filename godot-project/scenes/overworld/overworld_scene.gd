extends Node2D
# Scene script intentionally not globally registered to avoid class-name collisions.

const RuntimeLog = preload("res://scripts/runtime_log.gd")
const RuntimeServices = preload("res://scripts/runtime_services.gd")

# Hex grid constants (pointy-top hex)
const HEX_SIZE: float = 30.0
const HEX_HORIZONTAL_MULTIPLIER: float = 3.0 / 2.0
const HEX_VERTICAL_OFFSET_MULTIPLIER: float = sqrt(3) / 2.0

# Chevauchee zone boundaries
const CHEVAUCHEE_ZONE = {"qMin": -10, "qMax": 10, "rMin": -10, "rMax": 10}

# Encounter settings
const ENCOUNTER_CHANCE: float = 0.3
const ENCOUNTER_COOLDOWN: int = 30

# Player and camera references
var player: Node2D = null
var camera: Camera2D = null

# Current hex position
var current_hex: Dictionary = {"q": 0, "r": 0}

# Hotspots
var hotspots: Array[Dictionary] = []

# Encounter tracking
var last_encounter_time: int = 0

func _get_game_modes() -> Node:
	var game_modes = RuntimeServices.game_modes(self)
	if not game_modes:
		push_error("OverworldScene: GameModes singleton not found")
	return game_modes

func _get_game_state() -> Node:
	var game_state = RuntimeServices.game_state(self)
	if not game_state:
		push_error("OverworldScene: GameState singleton not found")
	return game_state

func _get_event_bus() -> Node:
	var event_bus = RuntimeServices.event_bus(self)
	if not event_bus:
		push_error("OverworldScene: EventBus singleton not found")
	return event_bus

func _ready() -> void:
	player = $Player
	if not player:
		push_error("OverworldScene: Player node not found")
		return

	camera = get_node_or_null("Camera2D")
	if not camera:
		camera = Camera2D.new()
		add_child(camera)
		camera.position = Vector2.ZERO

	var game_state = _get_game_state()
	if game_state and game_state.game_state.has("overworld"):
		current_hex = game_state.game_state["overworld"]["position"].duplicate()
		update_player_position()

	setup_hotspots()

	var game_modes = _get_game_modes()
	if game_modes and game_modes.has_method("sync_mode_without_scene_change"):
		game_modes.sync_mode_without_scene_change(game_modes.GameMode.OVERWORLD)

	if OS.is_debug_build():
		RuntimeLog.debug("OverworldScene: Ready at hex %s" % str(current_hex))

func _process(_delta: float) -> void:
	handle_movement_input()

func handle_movement_input() -> void:
	var moved := false

	if Input.is_action_just_pressed("move_left"):
		current_hex["q"] -= 1
		moved = true
	elif Input.is_action_just_pressed("move_right"):
		current_hex["q"] += 1
		moved = true
	elif Input.is_action_just_pressed("move_up"):
		current_hex["r"] -= 1
		moved = true
	elif Input.is_action_just_pressed("move_down"):
		current_hex["r"] += 1
		moved = true

	if moved:
		update_player_position()
		check_for_encounters()
		check_hotspots()

func update_player_position() -> void:
	var world_pos = hex_to_world(int(current_hex["q"]), int(current_hex["r"]))
	if player:
		player.position = world_pos

	var game_state = _get_game_state()
	if game_state and game_state.game_state.has("overworld"):
		game_state.game_state["overworld"]["position"] = current_hex.duplicate()

func hex_to_world(q: int, r: int) -> Vector2:
	# Pointy-top hex to world coordinates
	var x = HEX_SIZE * (HEX_HORIZONTAL_MULTIPLIER * q)
	var y = HEX_SIZE * (HEX_VERTICAL_OFFSET_MULTIPLIER * q + sqrt(3) * r)
	return Vector2(x, y)

func check_for_encounters() -> void:
	if not is_in_chevauchee_zone(int(current_hex["q"]), int(current_hex["r"])):
		return

	var current_time: int = Time.get_unix_time_from_system()
	if current_time - last_encounter_time < ENCOUNTER_COOLDOWN:
		return

	if randf() < ENCOUNTER_CHANCE:
		trigger_combat_encounter()

func is_in_chevauchee_zone(q: int, r: int) -> bool:
	return q >= CHEVAUCHEE_ZONE["qMin"] and q <= CHEVAUCHEE_ZONE["qMax"] and r >= CHEVAUCHEE_ZONE["rMin"] and r <= CHEVAUCHEE_ZONE["rMax"]

func trigger_combat_encounter() -> void:
	last_encounter_time = Time.get_unix_time_from_system()
	var difficulty := "normal"

	var event_bus = _get_event_bus()
	if event_bus:
		if event_bus.has_method("queue_combat_start"):
			event_bus.queue_combat_start({
				"difficulty": difficulty,
				"source": "overworld",
				"encounter_hex": current_hex.duplicate()
			})
		elif event_bus.has_signal("combat_start"):
			event_bus.combat_start.emit(difficulty)

	var game_modes = _get_game_modes()
	if game_modes:
		game_modes.set_mode(game_modes.GameMode.COMBAT)

func setup_hotspots() -> void:
	hotspots = [
		{
			"name": "town_square",
			"hex": {"q": 2, "r": 2},
			"radius": 1,
			"scene": "town_square"
		},
		{
			"name": "castle_gate",
			"hex": {"q": -3, "r": 1},
			"radius": 1,
			"scene": "castle_gate"
		},
		{
			"name": "blacksmith",
			"hex": {"q": 1, "r": -2},
			"radius": 1,
			"scene": "blacksmith"
		}
	]

func check_hotspots() -> void:
	for hotspot in hotspots:
		var distance = hex_distance(current_hex, hotspot["hex"])
		if distance <= int(hotspot["radius"]):
			trigger_hotspot(hotspot)
			return

func hex_distance(a: Dictionary, b: Dictionary) -> int:
	var q1: int = int(a["q"])
	var r1: int = int(a["r"])
	var q2: int = int(b["q"])
	var r2: int = int(b["r"])
	return int((abs(q1 - q2) + abs(q1 + r1 - q2 - r2) + abs(r1 - r2)) / 2)

func trigger_hotspot(hotspot: Dictionary) -> void:
	var game_modes = _get_game_modes()
	if game_modes:
		game_modes.set_mode(game_modes.GameMode.DIALOGUE, false, String(hotspot["scene"]))

# Backward-compatible helper retained for existing test harnesses.
func _on_combat_end(result: Dictionary) -> void:
	var event_bus = _get_event_bus()
	if event_bus and event_bus.has_method("submit_combat_result"):
		event_bus.submit_combat_result(result)
	else:
		_apply_combat_result_fallback(result)

	var game_modes = _get_game_modes()
	if game_modes:
		var force_transition: bool = game_modes.current_mode != game_modes.GameMode.COMBAT
		game_modes.set_mode(game_modes.GameMode.OVERWORLD, force_transition)

func _apply_combat_result_fallback(result: Dictionary) -> void:
	var game_state = _get_game_state()
	if not game_state:
		return

	if not game_state.game_state.has("stats") or not game_state.game_state.has("overworld"):
		return

	if bool(result.get("victory", false)):
		game_state.game_state["stats"]["experience"] += 10
	else:
		game_state.game_state["stats"]["endurance"] = maxi(1, int(game_state.game_state["stats"]["endurance"]) - 1)

	var time_limit := float(result.get("time_limit", 90.0))
	var time_remaining := float(result.get("time_remaining", time_limit))
	var time_spent := maxf(0.0, time_limit - time_remaining)
	game_state.game_state["overworld"]["time"] += time_spent
