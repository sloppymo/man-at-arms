extends Node

const RuntimeLog = preload("res://scripts/runtime_log.gd")
const RuntimeServices = preload("res://scripts/runtime_services.gd")

enum GameMode {
	TITLE,
	CHARACTER_CREATION,
	DIALOGUE,
	CAMP,
	EQUIPMENT,
	ENCOUNTER,
	OVERWORLD,
	COMBAT,
	DEATH,
	ENDING,
	LOADING
}

var current_mode: GameMode = GameMode.TITLE
var is_transitioning: bool = false

# Dialogue scene management
var current_dialogue_scene: String = ""
var queued_mode: int = -1
var queued_force: bool = false
var queued_dialogue_scene: String = ""

var allowed_transitions = {
	GameMode.TITLE: [GameMode.CHARACTER_CREATION, GameMode.DIALOGUE, GameMode.EQUIPMENT, GameMode.OVERWORLD, GameMode.COMBAT],
	GameMode.CHARACTER_CREATION: [GameMode.DIALOGUE, GameMode.CAMP],
	GameMode.DIALOGUE: [
		GameMode.CAMP,
		GameMode.EQUIPMENT,
		GameMode.ENCOUNTER,
		GameMode.OVERWORLD,
		GameMode.COMBAT,
		GameMode.DEATH,
		GameMode.ENDING
	],
	GameMode.CAMP: [GameMode.DIALOGUE, GameMode.EQUIPMENT],
	GameMode.EQUIPMENT: [GameMode.CAMP, GameMode.DIALOGUE],
	GameMode.ENCOUNTER: [GameMode.DIALOGUE, GameMode.COMBAT, GameMode.DEATH],
	GameMode.OVERWORLD: [GameMode.ENCOUNTER, GameMode.DIALOGUE, GameMode.COMBAT],
	GameMode.COMBAT: [GameMode.DIALOGUE, GameMode.DEATH, GameMode.CAMP, GameMode.OVERWORLD],
	GameMode.DEATH: [GameMode.TITLE],
	GameMode.ENDING: [GameMode.TITLE],
	GameMode.LOADING: [
		GameMode.TITLE, GameMode.CHARACTER_CREATION, GameMode.DIALOGUE,
		GameMode.CAMP, GameMode.EQUIPMENT, GameMode.ENCOUNTER,
		GameMode.OVERWORLD, GameMode.COMBAT, GameMode.DEATH,
		GameMode.ENDING
	]  # Loading can transition to anything
}

signal mode_changed(from: GameMode, to: GameMode, forced: bool)

func _ready() -> void:
	load_game_on_startup()
	RuntimeLog.info("GameModes: Initialized - current_mode: %d" % current_mode)
	RuntimeLog.info(
		"GameModes: Autoload ready - current scene: %s"
		% (get_tree().current_scene.scene_file_path if get_tree().current_scene else "NULL")
	)

func set_mode(new_mode: GameMode, force: bool = false, dialogue_scene: String = "") -> bool:
	if _is_same_mode_request(new_mode, dialogue_scene):
		return true

	# Debug logging
	if OS.is_debug_build():
		RuntimeLog.debug(
			"GameModes: Attempting transition from %d (%s) to %d (%s)"
			% [current_mode, get_mode_name(current_mode), new_mode, get_mode_name(new_mode)]
		)
		RuntimeLog.debug("GameModes: Call stack: %s" % str(get_stack()))

	if not force and not _is_transition_allowed(current_mode, new_mode):
		push_error("Invalid mode transition: %s -> %s" % [current_mode, new_mode])
		return false

	if is_transitioning:
		_queue_transition_request(new_mode, force, dialogue_scene)
		return true

	is_transitioning = true
	var old_mode = current_mode
	current_mode = new_mode

	# Set dialogue scene if provided
	if dialogue_scene != "":
		current_dialogue_scene = dialogue_scene

	mode_changed.emit(old_mode, new_mode, force)

	# Auto-save on mode transitions (except during loading)
	if new_mode != GameMode.LOADING:
		_auto_save()

	# Defer transition until after current tree updates settle.
	call_deferred("_apply_mode_scene", int(new_mode))

	return true

func _auto_save() -> void:
	# Auto-save game state on mode transitions
	var game_state = _get_game_state()
	if game_state and game_state.has_method("save_game"):
		# Save current mode for proper loading
		game_state.game_state["current_mode"] = current_mode
		game_state.save_game()
		if OS.is_debug_build():
			RuntimeLog.debug("GameModes: Auto-saved on mode transition to %s" % get_mode_name(current_mode))

func load_game_on_startup() -> void:
	# Load saved game on startup if available
	var game_state = _get_game_state()
	if game_state and game_state.has_method("load_game"):
		var load_success = game_state.load_game()
		if not load_success:
			if OS.is_debug_build():
				RuntimeLog.debug("GameModes: No save file loaded on startup")
			return
		
		if OS.is_debug_build():
			RuntimeLog.debug("GameModes: Loaded saved game on startup")
		
		if not game_state.game_state.has("current_mode"):
			return
		
		var saved_mode := int(game_state.game_state["current_mode"])
		if not _is_valid_game_mode(saved_mode):
			push_warning("GameModes: Invalid saved current_mode value: %s" % [str(game_state.game_state["current_mode"])])
			return
		
		if saved_mode != GameMode.TITLE:
			call_deferred("_resume_saved_mode", saved_mode)

func manual_save() -> bool:
	# Manual save function for user-initiated saves
	var game_state = _get_game_state()
	if game_state and game_state.has_method("save_game"):
		game_state.save_game()
		RuntimeLog.info("GameModes: Game saved manually")
		return true
	return false

func manual_load() -> bool:
	# Manual load function for user-initiated loads
	var game_state = _get_game_state()
	if game_state and game_state.has_method("load_game"):
		var load_success = game_state.load_game()
		if load_success:
			RuntimeLog.info("GameModes: Game loaded manually")
		return load_success
	return false

func _apply_mode_scene(mode_value: int) -> void:
	if not _is_valid_game_mode(mode_value):
		push_error("GameModes: Invalid mode value for scene transition: %d" % mode_value)
		_finalize_transition()
		return

	var new_mode: GameMode = mode_value
	var scene_path := _resolve_scene_path(new_mode)
	if scene_path == "":
		_finalize_transition()
		return

	var scene_tree = get_tree()
	if not scene_tree:
		push_error("GameModes: SceneTree unavailable during transition to %s" % get_mode_name(new_mode))
		_finalize_transition()
		return

	var current_scene = scene_tree.current_scene
	if current_scene and current_scene.scene_file_path == scene_path:
		if OS.is_debug_build():
			RuntimeLog.debug("GameModes: Scene already active for mode %s: %s" % [get_mode_name(new_mode), scene_path])
		_finalize_transition()
		return

	var err = scene_tree.change_scene_to_file(scene_path)
	if err != OK:
		push_error("GameModes: Failed to change scene to %s (error %d)" % [scene_path, err])

	_finalize_transition()

func _resolve_scene_path(new_mode: GameMode) -> String:
	match new_mode:
		GameMode.TITLE:
			return "res://scenes/landing_scene.tscn"
		GameMode.OVERWORLD:
			return "res://scenes/overworld/overworld_scene.tscn"
		GameMode.COMBAT:
			return "res://scenes/combat/combat_scene.tscn"
		GameMode.DIALOGUE:
			return _resolve_dialogue_scene_path()
		GameMode.CHARACTER_CREATION:
			RuntimeLog.info("GameModes: Character creation mode scene not implemented yet")
		GameMode.DEATH:
			return "res://scenes/death/death_scene.tscn"
		GameMode.ENDING:
			RuntimeLog.info("GameModes: Ending mode scene not implemented yet")
		GameMode.CAMP:
			RuntimeLog.info("GameModes: Camp mode scene not implemented yet")
		GameMode.EQUIPMENT:
			RuntimeLog.info("GameModes: Equipment mode scene not implemented yet")
		GameMode.ENCOUNTER:
			RuntimeLog.info("GameModes: Encounter mode scene not implemented yet")
		GameMode.LOADING:
			RuntimeLog.debug("GameModes: Loading mode, no scene transition needed")
		_:
			push_warning("GameModes: No scene transition for mode: %s" % get_mode_name(new_mode))
	return ""

func _resolve_dialogue_scene_path() -> String:
	match current_dialogue_scene:
		"town_square":
			return "res://scenes/dialogue/town_square.tscn"
		"castle_gate":
			return "res://scenes/dialogue/castle_gate.tscn"
		"blacksmith":
			return "res://scenes/dialogue/blacksmith.tscn"
		_:
			push_warning("GameModes: Unknown dialogue scene '%s'" % current_dialogue_scene)
			return ""

func _finalize_transition() -> void:
	is_transitioning = false
	if queued_mode == -1:
		return

	var next_mode := queued_mode
	var next_force := queued_force
	var next_dialogue_scene := queued_dialogue_scene
	queued_mode = -1
	queued_force = false
	queued_dialogue_scene = ""

	call_deferred("_apply_queued_transition", next_mode, next_force, next_dialogue_scene)

func _apply_queued_transition(mode_value: int, force: bool, dialogue_scene: String) -> void:
	if not _is_valid_game_mode(mode_value):
		push_warning("GameModes: Ignoring invalid queued mode %d" % mode_value)
		return
	set_mode(mode_value, force, dialogue_scene)

func _queue_transition_request(new_mode: GameMode, force: bool, dialogue_scene: String) -> void:
	queued_mode = int(new_mode)
	queued_force = force
	queued_dialogue_scene = dialogue_scene
	if OS.is_debug_build():
		RuntimeLog.debug(
			"GameModes: Queued transition to %s (force=%s, dialogue_scene='%s')"
			% [get_mode_name(new_mode), str(force), dialogue_scene]
		)

func _is_same_mode_request(new_mode: GameMode, dialogue_scene: String) -> bool:
	if new_mode != current_mode:
		return false
	if new_mode != GameMode.DIALOGUE:
		return true
	return dialogue_scene == "" or dialogue_scene == current_dialogue_scene

func _is_transition_allowed(from: GameMode, to: GameMode) -> bool:
	if from not in allowed_transitions:
		return false
	return to in allowed_transitions[from]

func _is_valid_game_mode(mode_value: int) -> bool:
	return mode_value >= GameMode.TITLE and mode_value <= GameMode.LOADING

func _resume_saved_mode(saved_mode: int) -> void:
	if saved_mode == current_mode:
		return
	set_mode(saved_mode, true)

func sync_mode_without_scene_change(new_mode: GameMode) -> void:
	if current_mode == new_mode:
		return
	if is_transitioning:
		push_warning("GameModes: sync_mode_without_scene_change ignored while transition is in progress")
		return
	current_mode = new_mode

func _get_game_state() -> Node:
	var game_state = RuntimeServices.game_state(self)
	if not game_state:
		push_error("GameModes: GameState singleton not found")
	return game_state

func get_current_mode() -> GameMode:
	return current_mode

func get_allowed_transitions(from: GameMode) -> Array:
	if from in allowed_transitions:
		return allowed_transitions[from]
	return []

func get_mode_name(mode: GameMode) -> String:
	match mode:
		GameMode.TITLE:
			return "Title"
		GameMode.CHARACTER_CREATION:
			return "Character Creation"
		GameMode.DIALOGUE:
			return "Dialogue"
		GameMode.CAMP:
			return "Camp"
		GameMode.EQUIPMENT:
			return "Equipment"
		GameMode.ENCOUNTER:
			return "Encounter"
		GameMode.OVERWORLD:
			return "Overworld"
		GameMode.COMBAT:
			return "Combat"
		GameMode.DEATH:
			return "Death"
		GameMode.ENDING:
			return "Ending"
		GameMode.LOADING:
			return "Loading"
		_:
			return "Unknown"

func _force_landing_scene() -> void:
	RuntimeLog.warn("GameModes: _force_landing_scene disabled, use set_mode(GameMode.TITLE) instead")
