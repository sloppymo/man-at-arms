extends Control
class_name LandingScene

const RuntimeLog = preload("res://scripts/runtime_log.gd")
const RuntimeServices = preload("res://scripts/runtime_services.gd")
const StartupValidator = preload("res://scripts/startup_validator.gd")

# UI References
@onready var title_label: Label = $UI/VBoxContainer/Title
@onready var version_label: Label = $UI/VBoxContainer/Version
@onready var main_container: VBoxContainer = $UI/ScrollContainer/VBoxContainer

# Test buttons
var test_buttons: Array[Button] = []

func _get_game_modes() -> Node:
	return RuntimeServices.game_modes(self)

func _get_game_state() -> Node:
	return RuntimeServices.game_state(self)

func _get_performance_monitor() -> Node:
	var tree: SceneTree = get_tree()
	if tree == null or tree.root == null:
		return null
	return tree.root.get_node_or_null("PerformanceMonitor")

func _ready() -> void:
	RuntimeLog.info("LandingScene: Initializing landing page")
	StartupValidator.validate_once(self)
	
	# Set up title and version
	title_label.text = "Man-at-Arms RPG"
	version_label.text = "v1.0 - Godot Migration"
	
	# Create test sections
	create_system_tests()
	create_game_modes()
	create_debug_tools()
	
	# Set up input handling
	set_process_input(true)

func _input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"):  # ESC key
		_on_exit_pressed()

func create_system_tests() -> void:
	# System Tests Section
	var section = create_section("System Tests")
	
	add_test_button(section, "Audio System Test", _test_audio_system)
	add_test_button(section, "Particle System Test", _test_particle_system)
	add_test_button(section, "Camera Shake Test", _test_camera_shake)
	add_test_button(section, "Input System Test", _test_input_system)
	add_test_button(section, "Save/Load Test", _test_save_load)

func create_game_modes() -> void:
	# Game Modes Section
	var section = create_section("Game Modes")
	
	add_test_button(section, "Overworld Mode", _launch_overworld)
	add_test_button(section, "Combat Mode", _launch_combat)
	add_test_button(section, "Dialogue System", _launch_dialogue)
	add_test_button(section, "Character Creation", _launch_character_creation)
	add_test_button(section, "Full Game Loop", _launch_full_game)

func create_debug_tools() -> void:
	# Debug Tools Section
	var section = create_section("Debug Tools")
	
	add_test_button(section, "Performance Monitor", _open_performance_monitor)
	add_test_button(section, "Collision Debug", _open_collision_debug)
	add_test_button(section, "Network Test", _test_network)
	add_test_button(section, "Memory Profiler", _open_memory_profiler)
	add_test_button(section, "Load Saved Game", _load_saved_game)

func create_section(title: String) -> VBoxContainer:
	# Create section container
	var section_container = VBoxContainer.new()
	section_container.add_theme_constant_override("separation", 10)
	main_container.add_child(section_container)
	
	# Section title
	var section_label = Label.new()
	section_label.text = title
	section_label.add_theme_font_size_override("font_size", 18)
	section_label.add_theme_color_override("font_color", Color.YELLOW)
	section_container.add_child(section_label)
	
	# Separator
	var separator = HSeparator.new()
	section_container.add_child(separator)
	
	return section_container

func add_test_button(parent: VBoxContainer, text: String, callback: Callable) -> void:
	var button = Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(400, 40)
	button.pressed.connect(callback)
	parent.add_child(button)
	test_buttons.append(button)

# Test Functions
func _test_audio_system() -> void:
	RuntimeLog.info("LandingScene: Testing audio system")
	var game_modes = _get_game_modes()
	if game_modes:
		game_modes.set_mode(GameModes.GameMode.LOADING, true)
		# Load audio test scene
		get_tree().change_scene_to_file("res://scenes/testing/audio_test.tscn")

func _test_particle_system() -> void:
	RuntimeLog.info("LandingScene: Testing particle system")
	var game_modes = _get_game_modes()
	if game_modes:
		game_modes.set_mode(GameModes.GameMode.LOADING, true)
		get_tree().change_scene_to_file("res://scenes/testing/particle_test.tscn")

func _test_camera_shake() -> void:
	RuntimeLog.info("LandingScene: Testing camera shake")
	var game_modes = _get_game_modes()
	if game_modes:
		game_modes.set_mode(GameModes.GameMode.LOADING, true)
		get_tree().change_scene_to_file("res://scenes/testing/camera_test.tscn")

func _test_input_system() -> void:
	RuntimeLog.info("LandingScene: Testing input system")
	var game_modes = _get_game_modes()
	if game_modes:
		game_modes.set_mode(GameModes.GameMode.LOADING, true)
		get_tree().change_scene_to_file("res://scenes/testing/input_test.tscn")

func _test_save_load() -> void:
	RuntimeLog.info("LandingScene: Testing save/load system")
	var game_state = _get_game_state()
	if game_state:
		# Test save
		game_state.game_state["test_data"] = {"timestamp": Time.get_unix_time_from_system()}
		game_state.save_game()
		RuntimeLog.info("LandingScene: Game saved successfully")
		
		# Test load
		game_state.load_game()
		if game_state.game_state.has("test_data"):
			RuntimeLog.info("LandingScene: Game loaded successfully")

# Game Mode Launchers
func _launch_overworld() -> void:
	RuntimeLog.info("LandingScene: Launching overworld mode")
	var game_modes = _get_game_modes()
	if game_modes:
		game_modes.set_mode(GameModes.GameMode.OVERWORLD, true)

func _launch_combat() -> void:
	RuntimeLog.info("LandingScene: Launching combat mode")
	var game_modes = _get_game_modes()
	if game_modes:
		game_modes.set_mode(GameModes.GameMode.COMBAT, true)

func _launch_dialogue() -> void:
	RuntimeLog.info("LandingScene: Launching dialogue system")
	var game_modes = _get_game_modes()
	if game_modes:
		game_modes.set_mode(GameModes.GameMode.DIALOGUE, true, "town_square")

func _launch_character_creation() -> void:
	RuntimeLog.info("LandingScene: Launching character creation")
	var game_modes = _get_game_modes()
	if game_modes:
		game_modes.set_mode(GameModes.GameMode.CHARACTER_CREATION, true)

func _launch_full_game() -> void:
	RuntimeLog.info("LandingScene: Launching full game loop")
	var game_modes = _get_game_modes()
	if game_modes:
		game_modes.set_mode(GameModes.GameMode.CHARACTER_CREATION, true)

# Debug Tools
func _open_performance_monitor() -> void:
	RuntimeLog.info("LandingScene: Opening performance monitor")
	# Toggle performance monitor
	var performance_monitor = _get_performance_monitor()
	if not performance_monitor:
		# Create performance monitor
		performance_monitor = preload("res://scripts/performance_benchmark.gd").new()
		get_tree().root.add_child(performance_monitor)
		performance_monitor.name = "PerformanceMonitor"
		RuntimeLog.info("LandingScene: Performance monitor created")
	else:
		performance_monitor.queue_free()
		RuntimeLog.info("LandingScene: Performance monitor removed")

func _open_collision_debug() -> void:
	RuntimeLog.info("LandingScene: Opening collision debug")
	# Toggle collision debug shapes
	get_tree().debug_collisions_hint = not get_tree().debug_collisions_hint
	RuntimeLog.info(
		"LandingScene: Collision debug: %s" % ("ON" if get_tree().debug_collisions_hint else "OFF")
	)

func _test_network() -> void:
	RuntimeLog.info("LandingScene: Testing network systems")
	# Basic network connectivity test
	var http_request = HTTPRequest.new()
	add_child(http_request)
	http_request.request_completed.connect(_on_network_test_completed)
	http_request.request("https://httpbin.org/get")

func _on_network_test_completed(result: int, response_code: int, _headers: PackedStringArray, _body: PackedByteArray) -> void:
	if result == HTTPRequest.RESULT_SUCCESS and response_code == 200:
		RuntimeLog.info("LandingScene: Network test successful")
	else:
		RuntimeLog.warn("LandingScene: Network test failed - Code: %d" % response_code)

func _open_memory_profiler() -> void:
	RuntimeLog.info("LandingScene: Memory profiler is disabled for Godot 4.6 compatibility")

func _load_saved_game() -> void:
	RuntimeLog.info("LandingScene: Loading saved game")
	var game_modes = _get_game_modes()
	if game_modes:
		game_modes.load_game_on_startup()
		# Force transition to whatever mode was saved
		var game_state = _get_game_state()
		if game_state and game_state.game_state.has("current_mode"):
			var saved_mode = game_state.game_state["current_mode"]
			RuntimeLog.info("LandingScene: Transitioning to saved mode: %s" % str(saved_mode))
			game_modes.set_mode(saved_mode, true)

func _on_exit_pressed() -> void:
	RuntimeLog.info("LandingScene: Exiting game")
	get_tree().quit()
