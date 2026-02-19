extends Node2D
# Backup variant: do not register as global class.

# Hex grid constants (pointy-top hex)
const HEX_SIZE = 30.0
const HEX_WIDTH = HEX_SIZE * 2
const HEX_HEIGHT = HEX_SIZE * sqrt(3)

# Chevauchee zone boundaries
const CHEVAUCHEE_ZONE = {
	"qMin": -10,
	"qMax": 10,
	"rMin": -10,
	"rMax": 10
}

var player: Node2D = null
var camera: Camera2D = null
var background: Sprite2D = null

# Overworld state
var current_hex: Dictionary = {"q": 0, "r": 0}
var last_encounter_time: float = 0.0
var encounter_cooldown: float = 30.0  # 30 seconds

# Hotspots
var hotspots: Array = []

func _ready() -> void:
	print("OverworldScene: Initializing overworld")
	
	# Get references
	player = $Player
	if not player:
		push_error("OverworldScene: No player found")
		return
	
	camera = $Player/Camera2D
	
	# Set up player position from game state
	var game_state = get_node("/root/GameState")
	if game_state and game_state.game_state.has("overworld"):
		current_hex = game_state.game_state["overworld"]["position"].duplicate()
		update_player_position()
	
	# Create hotspots
	setup_hotspots()
	
	# Connect to event bus
	var event_bus = get_node("/root/EventBus")
	if event_bus:
		event_bus.combat_end.connect(_on_combat_end)
	
	# Set initial mode to overworld (direct assignment to avoid scene change during init)
	var game_modes = get_node("/root/GameModes")
	if game_modes:
		game_modes.current_mode = game_modes.GameMode.OVERWORLD
	
	print("OverworldScene: Overworld initialized at hex", current_hex)

func _process(_delta: float) -> void:
	# Handle input for hex movement
	handle_movement_input()

func handle_movement_input() -> void:
	var moved = false
	
	if Input.is_action_just_pressed("move_left"):
		print("OverworldScene: Move left pressed")
		current_hex["q"] -= 1
		moved = true
	elif Input.is_action_just_pressed("move_right"):
		print("OverworldScene: Move right pressed")
		current_hex["q"] += 1
		moved = true
	elif Input.is_action_just_pressed("move_up"):
		print("OverworldScene: Move up pressed")
		current_hex["r"] -= 1
		moved = true
	elif Input.is_action_just_pressed("move_down"):
		print("OverworldScene: Move down pressed")
		current_hex["r"] += 1
		moved = true
	
	if moved:
		print("OverworldScene: Moving to hex: ", current_hex)
		update_player_position()
		check_for_encounters()
		check_hotspots()

func update_player_position() -> void:
	# Convert hex coordinates to world position
	var world_pos = hex_to_world(current_hex["q"], current_hex["r"])
	print("OverworldScene: Converting hex (", current_hex["q"], ", ", current_hex["r"], ") to world position: ", world_pos)
	
	if player:
		player.position = world_pos
		print("OverworldScene: Player position updated to: ", player.position)
	else:
		print("OverworldScene: ERROR - Player reference is null!")
		return
	
	# Update game state
	var game_state = get_node("/root/GameState")
	if game_state:
		game_state.game_state["overworld"]["position"] = current_hex.duplicate()
		print("OverworldScene: Game state updated")
	else:
		print("OverworldScene: ERROR - GameState not found!")
	
	print("OverworldScene: Moved to hex", current_hex, "position", world_pos)

func hex_to_world(q: int, r: int) -> Vector2:
	# Pointy-top hex to world coordinates
	var x = HEX_SIZE * (3.0/2.0 * q)
	var y = HEX_SIZE * (sqrt(3)/2.0 * q + sqrt(3) * r)
	return Vector2(x, y)

func check_for_encounters() -> void:
	# Check if in chevauchee zone
	if not is_in_chevauchee_zone(current_hex["q"], current_hex["r"]):
		return
	
	# Check cooldown
	var current_time = Time.get_unix_time_from_system()
	if current_time - last_encounter_time < encounter_cooldown:
		return
	
	# 30% chance for encounter
	if randf() < 0.3:
		trigger_combat_encounter()

func is_in_chevauchee_zone(q: int, r: int) -> bool:
	return q >= CHEVAUCHEE_ZONE.qMin and q <= CHEVAUCHEE_ZONE.qMax and \
		   r >= CHEVAUCHEE_ZONE.rMin and r <= CHEVAUCHEE_ZONE.rMax

func trigger_combat_encounter() -> void:
	last_encounter_time = Time.get_unix_time_from_system()
	
	print("OverworldScene: Combat encounter triggered!")
	
	# Determine difficulty based on location
	var difficulty = "normal"
	
	# Emit event to trigger combat
	var event_bus = get_node("/root/EventBus")
	if event_bus:
		event_bus.combat_start.emit(difficulty)
	
	# Change to combat mode
	var game_modes = get_node("/root/GameModes")
	if game_modes:
		game_modes.set_mode(game_modes.GameMode.COMBAT)

func setup_hotspots() -> void:
	# Define hotspot locations and their properties
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
	
	print("OverworldScene: Hotspots set up:", hotspots.size())

func check_hotspots() -> void:
	print("OverworldScene: Checking hotspots at position: ", current_hex)
	for hotspot in hotspots:
		var distance = hex_distance(current_hex, hotspot["hex"])
		print("OverworldScene: Distance to ", hotspot["name"], ": ", distance)
		if distance <= hotspot["radius"]:
			print("OverworldScene: Triggering hotspot: ", hotspot["name"])
			trigger_hotspot(hotspot)
			break

func hex_distance(a: Dictionary, b: Dictionary) -> int:
	print("OverworldScene: Calculating distance between ", a, " and ", b)
	var result = (abs(a["q"] - b["q"]) + abs(a["q"] + a["r"] - b["q"] - b["r"]) + abs(a["r"] - b["r"])) / 2
	print("OverworldScene: Distance calculation result: ", result)
	return result

func trigger_hotspot(hotspot: Dictionary) -> void:
	print("OverworldScene: Hotspot triggered:", hotspot["name"])
	
	# Change to dialogue mode
	var game_modes = get_node("/root/GameModes")
	if game_modes:
		game_modes.set_mode(game_modes.GameMode.DIALOGUE)

func _on_combat_end(result: Dictionary) -> void:
	print("OverworldScene: Combat ended with result:", result)
	
	# Update game state with combat results
	var game_state = get_node("/root/GameState")
	if game_state:
		# Update stats based on combat result
		if result.has("victory") and result["victory"]:
			# Victory rewards
			game_state.game_state["stats"]["experience"] += 10
		else:
			# Defeat penalties
			game_state.game_state["stats"]["endurance"] = max(1, game_state.game_state["stats"]["endurance"] - 1)
		
		# Update time
		if result.has("time_remaining"):
			var time_spent = (90 - result["time_remaining"]) / 60.0  # minutes
			game_state.game_state["overworld"]["time"] += time_spent * 60  # add minutes in seconds
	
	# Return to overworld mode
	var game_modes = get_node("/root/GameModes")
	if game_modes:
		game_modes.set_mode(game_modes.GameMode.OVERWORLD)
