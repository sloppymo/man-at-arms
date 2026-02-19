extends SceneTree

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

	var to_overworld_ok: bool = game_modes.set_mode(game_modes.GameMode.OVERWORLD, true)
	_assert(to_overworld_ok, "Should enter overworld before desktop rapid-flow checks")
	var reached_overworld := await _wait_for_scene("res://scenes/overworld/overworld_scene.tscn", 120)
	_assert(reached_overworld, "Overworld scene should load for desktop rapid-flow checks")
	if not reached_overworld:
		_finish()
		return

	_suppress_random_encounters_for_hotspot_phase()
	await _drive_hotspot_dialogue_exit_flow(game_modes)
	await _drive_encounter_to_combat_flow(game_modes)

	_cleanup_save_file()
	_finish()

func _drive_hotspot_dialogue_exit_flow(game_modes: Node) -> void:
	await _tap_action("move_right")
	await _tap_action("move_right")
	await _tap_action("move_down")
	await _tap_action("move_down")

	var reached_dialogue := await _wait_for_scene("res://scenes/dialogue/town_square.tscn", 120)
	_assert(reached_dialogue, "Rapid movement to hotspot should open town_square dialogue")
	_assert(game_modes.current_mode == game_modes.GameMode.DIALOGUE, "Mode should be DIALOGUE after hotspot activation")
	if not reached_dialogue:
		return

	var dialogue_scene: Node = current_scene
	_assert(dialogue_scene.has_method("_on_exit_pressed"), "Dialogue scene must expose _on_exit_pressed")
	if dialogue_scene.has_method("_on_exit_pressed"):
		dialogue_scene.call("_on_exit_pressed")

	var returned_to_overworld := await _wait_for_scene("res://scenes/overworld/overworld_scene.tscn", 120)
	_assert(returned_to_overworld, "Dialogue exit should return to overworld scene")
	_assert(game_modes.current_mode == game_modes.GameMode.OVERWORLD, "Mode should be OVERWORLD after dialogue exit")

func _drive_encounter_to_combat_flow(game_modes: Node) -> void:
	var overworld: Node = current_scene
	_assert(overworld != null, "Current scene should be overworld before encounter trigger")
	if overworld == null:
		return

	_assert(overworld.has_method("trigger_combat_encounter"), "Overworld scene must expose trigger_combat_encounter")
	if overworld.has_method("trigger_combat_encounter"):
		overworld.call("trigger_combat_encounter")

	var reached_combat := await _wait_for_scene("res://scenes/combat/combat_scene.tscn", 120)
	_assert(reached_combat, "Encounter trigger should transition to combat scene in desktop run")
	_assert(game_modes.current_mode == game_modes.GameMode.COMBAT, "Mode should be COMBAT after encounter trigger")

func _suppress_random_encounters_for_hotspot_phase() -> void:
	var overworld: Node = current_scene
	if overworld == null:
		return
	if "last_encounter_time" in overworld:
		overworld.last_encounter_time = Time.get_unix_time_from_system()

func _tap_action(action_name: String) -> void:
	var pressed_event := InputEventAction.new()
	pressed_event.action = action_name
	pressed_event.pressed = true
	Input.parse_input_event(pressed_event)
	await process_frame

	var released_event := InputEventAction.new()
	released_event.action = action_name
	released_event.pressed = false
	Input.parse_input_event(released_event)
	await _wait_frames(2)

func _wait_for_scene(scene_path: String, max_frames: int) -> bool:
	for _i in range(max_frames):
		if current_scene and current_scene.scene_file_path == scene_path:
			return true
		await process_frame
	return false

func _wait_frames(frame_count: int) -> void:
	for _i in range(frame_count):
		await process_frame

func _cleanup_save_file() -> void:
	DirAccess.remove_absolute("user://savegame.json")

func _assert(condition: bool, message: String) -> void:
	if condition:
		return
	failures.append(message)
	push_error("DesktopRapidFlowValidation: %s" % message)

func _finish() -> void:
	if failures.is_empty():
		print("DesktopRapidFlowValidation: PASS")
		quit(0)
		return

	print("DesktopRapidFlowValidation: FAIL (%d)" % failures.size())
	for failure in failures:
		print(" - ", failure)
	quit(1)
