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

	await _test_queue_latest_transition(game_modes)
	await _test_idempotent_transitions(game_modes)
	await _test_dialogue_round_trip(game_modes)

	_cleanup_save_file()
	_finish()

func _test_queue_latest_transition(game_modes: Node) -> void:
	game_modes.current_mode = game_modes.GameMode.LOADING

	var first_request_ok: bool = game_modes.set_mode(game_modes.GameMode.CAMP, true)
	var second_request_ok: bool = game_modes.set_mode(game_modes.GameMode.EQUIPMENT, true)
	_assert(first_request_ok and second_request_ok, "Queued transition requests should be accepted")

	await _wait_frames(4)
	_assert(game_modes.current_mode == game_modes.GameMode.EQUIPMENT, "Latest queued transition should win")

func _test_idempotent_transitions(game_modes: Node) -> void:
	game_modes.current_mode = game_modes.GameMode.OVERWORLD
	var idempotent_overworld_ok: bool = game_modes.set_mode(game_modes.GameMode.OVERWORLD, false)
	_assert(idempotent_overworld_ok, "Overworld idempotent transition should return true")
	_assert(not game_modes.is_transitioning, "Overworld idempotent transition should not enter transitioning state")

	game_modes.current_mode = game_modes.GameMode.DIALOGUE
	game_modes.current_dialogue_scene = "town_square"
	var idempotent_dialogue_ok: bool = game_modes.set_mode(game_modes.GameMode.DIALOGUE, false, "town_square")
	_assert(idempotent_dialogue_ok, "Dialogue idempotent transition should return true")
	_assert(not game_modes.is_transitioning, "Dialogue idempotent transition should not enter transitioning state")

func _test_dialogue_round_trip(game_modes: Node) -> void:
	game_modes.current_mode = game_modes.GameMode.OVERWORLD
	game_modes.current_dialogue_scene = ""

	var to_dialogue_ok: bool = game_modes.set_mode(game_modes.GameMode.DIALOGUE, true, "town_square")
	_assert(to_dialogue_ok, "Should transition to dialogue scene")

	var reached_dialogue := await _wait_for_scene("res://scenes/dialogue/town_square.tscn", 40)
	_assert(reached_dialogue, "Dialogue scene should load")
	_assert(game_modes.current_mode == game_modes.GameMode.DIALOGUE, "Mode should be DIALOGUE while dialogue scene is active")

	var dialogue_scene: Node = current_scene
	if dialogue_scene and dialogue_scene.has_method("_on_exit_pressed"):
		dialogue_scene.call("_on_exit_pressed")
	else:
		_assert(false, "Dialogue scene must implement _on_exit_pressed")
		return

	var returned_to_overworld := await _wait_for_scene("res://scenes/overworld/overworld_scene.tscn", 40)
	_assert(returned_to_overworld, "Dialogue exit should return to overworld scene")
	_assert(game_modes.current_mode == game_modes.GameMode.OVERWORLD, "Mode should be OVERWORLD after dialogue exit")

	var to_combat_ok: bool = game_modes.set_mode(game_modes.GameMode.COMBAT, false)
	_assert(to_combat_ok, "Should transition from overworld to combat")

	var reached_combat := await _wait_for_scene("res://scenes/combat/combat_scene.tscn", 40)
	_assert(reached_combat, "Combat scene should load")
	_assert(game_modes.current_mode == game_modes.GameMode.COMBAT, "Mode should be COMBAT while combat scene is active")

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
	push_error("TransitionSmokeTest: %s" % message)

func _finish() -> void:
	if failures.is_empty():
		print("TransitionSmokeTest: PASS")
		quit(0)
		return

	print("TransitionSmokeTest: FAIL (%d)" % failures.size())
	for failure in failures:
		print(" - ", failure)
	quit(1)
