extends SceneTree

var failures: Array[String] = []
var combat_end_events: Array[Dictionary] = []
var observed_player_died_count: int = 0

func _init() -> void:
	call_deferred("_run")

func _run() -> void:
	_cleanup_save_file()
	await _wait_frames(2)

	var game_modes: Node = root.get_node_or_null("GameModes")
	var event_bus: Node = root.get_node_or_null("EventBus")
	_assert(game_modes != null, "GameModes singleton must exist")
	_assert(event_bus != null, "EventBus singleton must exist")
	if game_modes == null or event_bus == null:
		_finish()
		return

	var on_combat_end_callable := Callable(self, "_on_combat_end")
	if event_bus.has_signal("combat_end") and not event_bus.combat_end.is_connected(on_combat_end_callable):
		event_bus.combat_end.connect(on_combat_end_callable)

	await _test_defeat_flow(game_modes)
	await _test_victory_flow(game_modes)

	if event_bus.has_signal("combat_end") and event_bus.combat_end.is_connected(on_combat_end_callable):
		event_bus.combat_end.disconnect(on_combat_end_callable)

	_cleanup_save_file()
	_finish()

func _test_defeat_flow(game_modes: Node) -> void:
	combat_end_events.clear()
	observed_player_died_count = 0

	var entered_combat := await _enter_scene_mode(game_modes, game_modes.GameMode.COMBAT, "res://scenes/combat/combat_scene.tscn", 60)
	_assert(entered_combat, "Defeat test should enter combat scene")
	if not entered_combat:
		return

	var combat_scene: CombatScene = current_scene as CombatScene
	_assert(combat_scene != null, "Current scene should be CombatScene during defeat test")
	if combat_scene == null:
		return

	var combat_player: CombatPlayer = combat_scene.player
	_assert(combat_player != null, "CombatScene should expose a player for defeat test")
	if combat_player == null:
		return

	_assert(combat_player.died.is_connected(Callable(combat_scene, "_on_player_died")), "CombatScene should listen to CombatPlayer.died")
	var on_player_died_callable := Callable(self, "_on_observed_player_died")
	if not combat_player.died.is_connected(on_player_died_callable):
		combat_player.died.connect(on_player_died_callable)

	combat_player.die()
	await _wait_frames(3)

	_assert(observed_player_died_count == 1, "CombatPlayer.died should fire exactly once")
	if is_instance_valid(combat_scene):
		_assert(combat_scene.is_game_over, "Defeat flow should mark combat as game over")
	_assert(game_modes.current_mode == game_modes.GameMode.DEATH, "Defeat flow should set mode to DEATH")
	_assert(combat_end_events.size() == 1, "Defeat flow should emit exactly one combat_end event")
	if combat_end_events.size() > 0:
		var result: Dictionary = combat_end_events[0]
		_assert(result.has("victory") and not bool(result["victory"]), "Defeat combat_end payload should set victory=false")

	if is_instance_valid(combat_player) and combat_player.died.is_connected(on_player_died_callable):
		combat_player.died.disconnect(on_player_died_callable)

func _test_victory_flow(game_modes: Node) -> void:
	combat_end_events.clear()

	var reached_overworld := await _enter_scene_mode(game_modes, game_modes.GameMode.OVERWORLD, "res://scenes/overworld/overworld_scene.tscn", 60)
	_assert(reached_overworld, "Victory test setup should return to overworld")
	if not reached_overworld:
		return

	var entered_combat := await _enter_scene_mode(game_modes, game_modes.GameMode.COMBAT, "res://scenes/combat/combat_scene.tscn", 60)
	_assert(entered_combat, "Victory test should enter combat scene")
	if not entered_combat:
		return

	var combat_scene: CombatScene = current_scene as CombatScene
	_assert(combat_scene != null, "Current scene should be CombatScene during victory test")
	if combat_scene == null:
		return

	combat_scene.end_combat(true)
	combat_scene.end_combat(true)

	_assert(combat_scene.is_game_over, "Victory flow should mark combat as game over")
	_assert(combat_end_events.size() == 1, "Victory flow should emit exactly one combat_end event")
	if combat_end_events.size() > 0:
		var result: Dictionary = combat_end_events[0]
		_assert(result.has("victory") and bool(result["victory"]), "Victory combat_end payload should set victory=true")

	await _wait_frames(3)
	_assert(game_modes.current_mode == game_modes.GameMode.OVERWORLD, "Victory flow should set mode to OVERWORLD")

func _enter_scene_mode(game_modes: Node, mode: int, scene_path: String, max_frames: int) -> bool:
	var transition_ok: bool = game_modes.set_mode(mode, true)
	_assert(transition_ok, "Mode transition request should succeed for %s" % scene_path)
	if not transition_ok:
		return false
	return await _wait_for_scene(scene_path, max_frames)

func _on_observed_player_died() -> void:
	observed_player_died_count += 1

func _on_combat_end(result: Dictionary) -> void:
	combat_end_events.append(result.duplicate(true))

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
	push_error("CombatLifecycleSmokeTest: %s" % message)

func _finish() -> void:
	if failures.is_empty():
		print("CombatLifecycleSmokeTest: PASS")
		quit(0)
		return

	print("CombatLifecycleSmokeTest: FAIL (%d)" % failures.size())
	for failure in failures:
		print(" - ", failure)
	quit(1)
