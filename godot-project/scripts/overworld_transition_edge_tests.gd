extends SceneTree

var failures: Array[String] = []

func _init() -> void:
	call_deferred("_run")

func _run() -> void:
	_cleanup_save_file()
	await _wait_frames(2)

	var game_modes: Node = root.get_node_or_null("GameModes")
	var game_state: Node = root.get_node_or_null("GameState")
	_assert(game_modes != null, "GameModes singleton must exist")
	_assert(game_state != null, "GameState singleton must exist")
	if game_modes == null or game_state == null:
		_finish()
		return

	var to_overworld_ok: bool = game_modes.set_mode(game_modes.GameMode.OVERWORLD, true)
	_assert(to_overworld_ok, "Should enter overworld for edge-case tests")
	var reached_overworld := await _wait_for_scene("res://scenes/overworld/overworld_scene.tscn", 40)
	_assert(reached_overworld, "Overworld scene should load before running edge tests")
	if not reached_overworld:
		_finish()
		return

	await _test_hotspot_dialogue_return(game_modes)
	await _test_combat_result_return_flow(game_modes, game_state)
	await _test_direct_encounter_trigger(game_modes)

	_cleanup_save_file()
	_finish()

func _test_hotspot_dialogue_return(game_modes: Node) -> void:
	var overworld: Node = current_scene
	_assert(overworld != null, "Current scene should be overworld before hotspot test")
	if overworld == null:
		return

	overworld.current_hex = {"q": 2, "r": 2}
	overworld.check_hotspots()

	var reached_dialogue := await _wait_for_scene("res://scenes/dialogue/town_square.tscn", 40)
	_assert(reached_dialogue, "Hotspot at (2,2) should open town_square dialogue")
	_assert(game_modes.current_mode == game_modes.GameMode.DIALOGUE, "Mode should be DIALOGUE after hotspot trigger")
	if not reached_dialogue:
		return

	var dialogue_scene: Node = current_scene
	_assert(dialogue_scene.has_method("_on_exit_pressed"), "Dialogue scene should expose _on_exit_pressed")
	if dialogue_scene.has_method("_on_exit_pressed"):
		dialogue_scene.call("_on_exit_pressed")

	var returned_overworld := await _wait_for_scene("res://scenes/overworld/overworld_scene.tscn", 40)
	_assert(returned_overworld, "Dialogue exit should return to overworld")
	_assert(game_modes.current_mode == game_modes.GameMode.OVERWORLD, "Mode should return to OVERWORLD after dialogue exit")

func _test_combat_result_return_flow(game_modes: Node, game_state: Node) -> void:
	var overworld: Node = current_scene
	_assert(overworld != null, "Current scene should be overworld before combat result flow test")
	if overworld == null:
		return

	var before_xp: int = int(game_state.game_state["stats"]["experience"])
	var before_endurance: int = int(game_state.game_state["stats"]["endurance"])
	var before_time: float = float(game_state.game_state["overworld"]["time"])

	overworld._on_combat_end({"victory": true, "time_remaining": 30})
	await _wait_frames(2)

	var after_victory_xp: int = int(game_state.game_state["stats"]["experience"])
	var after_victory_time: float = float(game_state.game_state["overworld"]["time"])
	_assert(after_victory_xp == before_xp + 10, "Victory flow should award +10 experience")
	_assert(int(after_victory_time) == int(before_time + 60.0), "Victory flow should advance overworld time by spent combat time")
	_assert(game_modes.current_mode == game_modes.GameMode.OVERWORLD, "Victory return flow should keep mode in OVERWORLD")

	overworld._on_combat_end({"victory": false, "time_remaining": 60})
	await _wait_frames(2)

	var after_defeat_endurance: int = int(game_state.game_state["stats"]["endurance"])
	var expected_endurance: int = maxi(1, before_endurance - 1)
	_assert(after_defeat_endurance == expected_endurance, "Defeat flow should apply endurance penalty with floor at 1")
	_assert(game_modes.current_mode == game_modes.GameMode.OVERWORLD, "Defeat return flow should keep mode in OVERWORLD")

func _test_direct_encounter_trigger(game_modes: Node) -> void:
	var overworld: Node = current_scene
	_assert(overworld != null, "Current scene should be overworld before encounter trigger test")
	if overworld == null:
		return

	overworld.trigger_combat_encounter()
	var reached_combat := await _wait_for_scene("res://scenes/combat/combat_scene.tscn", 40)
	_assert(reached_combat, "Encounter trigger should transition to combat scene")
	_assert(game_modes.current_mode == game_modes.GameMode.COMBAT, "Encounter trigger should set mode to COMBAT")

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
	push_error("OverworldTransitionEdgeTests: %s" % message)

func _finish() -> void:
	if failures.is_empty():
		print("OverworldTransitionEdgeTests: PASS")
		quit(0)
		return

	print("OverworldTransitionEdgeTests: FAIL (%d)" % failures.size())
	for failure in failures:
		print(" - ", failure)
	quit(1)
