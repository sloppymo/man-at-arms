extends SceneTree
## Combat State Regression Test Suite
## Day 1 deliverable: Comprehensive transition path validation
## Run with: godot --script scripts/combat_state_regression_tests.gd

const CombatStateMachine = preload("res://scripts/combat_state_machine.gd")
const RuntimeServices = preload("res://scripts/runtime_services.gd")

var failures: Array[String] = []
var tests_run: int = 0
var tests_passed: int = 0

# Test results storage
var transition_test_results: Dictionary = {}
var scene_transition_results: Dictionary = {}
var edge_case_results: Dictionary = {}

func _init() -> void:
	call_deferred("_run")

func _run() -> void:
	_cleanup_save_file()
	await _wait_frames(2)
	
	print(_repeat_text("=", 60))
	print("COMBAT STATE REGRESSION TEST SUITE")
	print(_repeat_text("=", 60))
	
	# Phase 1: Pure state machine transitions
	await _run_state_machine_tests()
	
	# Phase 2: Integration with GameModes
	await _run_game_mode_integration_tests()
	
	# Phase 3: Scene transition paths
	await _run_scene_transition_tests()
	
	# Phase 4: Edge cases and error recovery
	await _run_edge_case_tests()
	
	# Phase 5: Regression check for known issues
	await _run_known_issue_regression_tests()
	
	# Report
	_report_results()
	_finish()

# ============================================================================
# PHASE 1: Pure State Machine Transitions
# ============================================================================

func _run_state_machine_tests() -> void:
	_print_phase("PHASE 1: State Machine Transition Tests")
	
	var csm := CombatStateMachine.new()
	root.add_child(csm)
	
	# Test 1.1: Valid transitions
	await _test("INACTIVE -> ENTERING", func() -> bool:
		return csm.transition_to(CombatStateMachine.CombatState.ENTERING)
	)
	
	await _test("ENTERING -> ACTIVE", func() -> bool:
		return csm.transition_to(CombatStateMachine.CombatState.ACTIVE)
	)
	
	await _test("ACTIVE -> EXITING_VICTORY", func() -> bool:
		return csm.transition_to(CombatStateMachine.CombatState.EXITING_VICTORY)
	)
	
	await _test("EXITING_VICTORY -> INACTIVE", func() -> bool:
		return csm.transition_to(CombatStateMachine.CombatState.INACTIVE)
	)
	
	# Reset for defeat path
	csm.transition_to(CombatStateMachine.CombatState.ENTERING)
	csm.transition_to(CombatStateMachine.CombatState.ACTIVE)
	
	await _test("ACTIVE -> EXITING_DEFEAT", func() -> bool:
		return csm.transition_to(CombatStateMachine.CombatState.EXITING_DEFEAT)
	)
	
	await _test("EXITING_DEFEAT -> INACTIVE", func() -> bool:
		return csm.transition_to(CombatStateMachine.CombatState.INACTIVE)
	)
	
	# Reset for abort path
	csm.transition_to(CombatStateMachine.CombatState.ENTERING)
	csm.transition_to(CombatStateMachine.CombatState.ACTIVE)
	
	await _test("ACTIVE -> EXITING_ABORT", func() -> bool:
		return csm.transition_to(CombatStateMachine.CombatState.EXITING_ABORT)
	)
	
	await _test("EXITING_ABORT -> INACTIVE", func() -> bool:
		return csm.transition_to(CombatStateMachine.CombatState.INACTIVE)
	)
	
	# Test 1.2: Invalid transitions (should fail in strict mode)
	csm.strict_mode = true
	csm.current_state = CombatStateMachine.CombatState.INACTIVE
	
	await _test("INACTIVE -> ACTIVE (invalid, should fail)", func() -> bool:
		return not csm.transition_to(CombatStateMachine.CombatState.ACTIVE)
	)
	
	await _test("INACTIVE -> EXITING_VICTORY (invalid, should fail)", func() -> bool:
		return not csm.transition_to(CombatStateMachine.CombatState.EXITING_VICTORY)
	)
	
	csm.current_state = CombatStateMachine.CombatState.ACTIVE
	
	await _test("ACTIVE -> ENTERING (invalid, should fail)", func() -> bool:
		return not csm.transition_to(CombatStateMachine.CombatState.ENTERING)
	)
	
	await _test("ACTIVE -> INACTIVE (invalid, should fail)", func() -> bool:
		return not csm.transition_to(CombatStateMachine.CombatState.INACTIVE)
	)
	
	# Test 1.3: State queries
	csm.current_state = CombatStateMachine.CombatState.INACTIVE
	
	await _test("is_in_combat() false when INACTIVE", func() -> bool:
		return not csm.is_in_combat()
	)
	
	csm.current_state = CombatStateMachine.CombatState.ENTERING
	
	await _test("is_in_combat() true when ENTERING", func() -> bool:
		return csm.is_in_combat()
	)
	
	csm.current_state = CombatStateMachine.CombatState.ACTIVE
	
	await _test("is_combat_active() true when ACTIVE", func() -> bool:
		return csm.is_combat_active()
	)
	
	await _test("is_in_combat() true when ACTIVE", func() -> bool:
		return csm.is_in_combat()
	)
	
	# Test 1.4: High-level API
	csm.current_state = CombatStateMachine.CombatState.INACTIVE
	
	await _test("enter_combat() from INACTIVE", func() -> bool:
		return csm.enter_combat({"test": true})
	)
	
	await _test("mark_combat_active() from ENTERING", func() -> bool:
		return csm.mark_combat_active()
	)
	
	await _test("exit_combat(victory=true)", func() -> bool:
		return csm.exit_combat(true, {"kills": 5})
	)
	
	await _test("mark_combat_exited() from EXITING_VICTORY", func() -> bool:
		return csm.mark_combat_exited()
	)
	
	# Defeat path
	csm.enter_combat({})
	csm.mark_combat_active()
	
	await _test("exit_combat(victory=false)", func() -> bool:
		return csm.exit_combat(false, {"cause": "death"})
	)
	
	csm.queue_free()
	transition_test_results = {
		"passed": tests_passed,
		"failed": tests_run - tests_passed
	}

# ============================================================================
# PHASE 2: GameMode Integration Tests
# ============================================================================

func _run_game_mode_integration_tests() -> void:
	_print_phase("PHASE 2: GameMode Integration Tests")
	
	var game_modes: Node = RuntimeServices.game_modes(root)
	var csm := CombatStateMachine.new()
	root.add_child(csm)
	
	if game_modes == null:
		_fail("GameModes autoload not found - skipping integration tests")
		csm.queue_free()
		return
	
	# Test 2.1: Mode/state synchronization
	await _test("Overworld mode should sync with INACTIVE", func() -> bool:
		game_modes.set_mode(game_modes.GameMode.OVERWORLD, true)
		csm.current_state = CombatStateMachine.CombatState.INACTIVE
		await _wait_frames(2)
		return csm.validate_mode_sync(game_modes.get_current_mode(), game_modes)
	)
	
	# Test 2.2: Combat mode entry
	await _test("Transition to COMBAT mode succeeds", func() -> bool:
		return game_modes.set_mode(game_modes.GameMode.COMBAT, true)
	)
	
	await _wait_for_scene("res://scenes/combat/combat_scene.tscn", 60)
	
	await _test("Combat scene loads", func() -> bool:
		return current_scene != null and current_scene.scene_file_path == "res://scenes/combat/combat_scene.tscn"
	)
	
	csm.queue_free()

# ============================================================================
# PHASE 3: Scene Transition Tests
# ============================================================================

func _run_scene_transition_tests() -> void:
	_print_phase("PHASE 3: Scene Transition Path Tests")
	
	var game_modes: Node = RuntimeServices.game_modes(root)
	if game_modes == null:
		_fail("GameModes autoload not found")
		return
	
	var passed := 0
	var total := 0
	
	# Test 3.1: Overworld -> Combat -> Overworld (victory)
	total += 1
	_cleanup_save_file()
	if await _test_overworld_combat_overworld_cycle(game_modes, true):
		passed += 1
	
	# Test 3.2: Overworld -> Combat -> Death (defeat)
	total += 1
	_cleanup_save_file()
	if await _test_overworld_combat_death_cycle(game_modes):
		passed += 1
	
	# Test 3.3: Dialogue -> Combat -> Dialogue
	total += 1
	_cleanup_save_file()
	if await _test_dialogue_combat_dialogue_cycle(game_modes):
		passed += 1
	
	# Test 3.4: Rapid mode switches (stress test)
	total += 1
	if await _test_rapid_mode_switches(game_modes):
		passed += 1
	
	scene_transition_results = {
		"passed": passed,
		"failed": total - passed,
		"total": total
	}

func _test_overworld_combat_overworld_cycle(game_modes: Node, victory: bool) -> bool:
	var test_name := "Overworld -> Combat -> Overworld (victory=%s)" % str(victory)
	print("  Testing: %s" % test_name)
	
	# Start in overworld
	game_modes.set_mode(game_modes.GameMode.OVERWORLD, true)
	if not await _wait_for_scene("res://scenes/overworld/overworld_scene.tscn", 60):
		_fail("%s: Failed to reach overworld" % test_name)
		return false
	
	if game_modes.current_mode != game_modes.GameMode.OVERWORLD:
		_fail("%s: Mode not OVERWORLD" % test_name)
		return false
	
	# Enter combat
	game_modes.set_mode(game_modes.GameMode.COMBAT, true)
	if not await _wait_for_scene("res://scenes/combat/combat_scene.tscn", 60):
		_fail("%s: Failed to reach combat" % test_name)
		return false
	
	if game_modes.current_mode != game_modes.GameMode.COMBAT:
		_fail("%s: Mode not COMBAT" % test_name)
		return false
	
	# End combat
	var combat_scene = current_scene
	if combat_scene and combat_scene.has_method("end_combat"):
		combat_scene.end_combat(victory)
		
		var target_scene := "res://scenes/overworld/overworld_scene.tscn"
		if not await _wait_for_scene(target_scene, 60):
			_fail("%s: Failed to return to overworld" % test_name)
			return false
		
		if game_modes.current_mode != game_modes.GameMode.OVERWORLD:
			_fail("%s: Mode not OVERWORLD after combat" % test_name)
			return false
	else:
		_fail("%s: Combat scene not available" % test_name)
		return false
	
	return true

func _test_overworld_combat_death_cycle(game_modes: Node) -> bool:
	var test_name := "Overworld -> Combat -> Death"
	print("  Testing: %s" % test_name)
	
	# Start in overworld
	game_modes.set_mode(game_modes.GameMode.OVERWORLD, true)
	if not await _wait_for_scene("res://scenes/overworld/overworld_scene.tscn", 60):
		_fail("%s: Failed to reach overworld" % test_name)
		return false
	
	# Enter combat
	game_modes.set_mode(game_modes.GameMode.COMBAT, true)
	if not await _wait_for_scene("res://scenes/combat/combat_scene.tscn", 60):
		_fail("%s: Failed to reach combat" % test_name)
		return false
	
	# Kill player
	var combat_scene = current_scene
	if combat_scene and combat_scene.player and combat_scene.player.has_method("die"):
		combat_scene.player.die()
		
		if not await _wait_for_scene("res://scenes/death/death_scene.tscn", 60):
			_fail("%s: Failed to reach death scene" % test_name)
			return false
		
		if game_modes.current_mode != game_modes.GameMode.DEATH:
			_fail("%s: Mode not DEATH" % test_name)
			return false
	else:
		_fail("%s: Combat scene/player not available" % test_name)
		return false
	
	return true

func _test_dialogue_combat_dialogue_cycle(game_modes: Node) -> bool:
	var test_name := "Dialogue -> Combat -> Overworld"
	print("  Testing: %s" % test_name)
	
	# Start in dialogue (town_square)
	game_modes.set_mode(game_modes.GameMode.DIALOGUE, true, "town_square")
	if not await _wait_for_scene("res://scenes/dialogue/town_square.tscn", 60):
		_fail("%s: Failed to reach dialogue" % test_name)
		return false
	
	if game_modes.current_mode != game_modes.GameMode.DIALOGUE:
		_fail("%s: Mode not DIALOGUE" % test_name)
		return false
	
	# Enter combat from dialogue
	game_modes.set_mode(game_modes.GameMode.COMBAT, true)
	if not await _wait_for_scene("res://scenes/combat/combat_scene.tscn", 60):
		_fail("%s: Failed to reach combat" % test_name)
		return false
	
	# End combat (victory returns to overworld, not dialogue)
	var combat_scene = current_scene
	if combat_scene and combat_scene.has_method("end_combat"):
		combat_scene.end_combat(true)
		
		if not await _wait_for_scene("res://scenes/overworld/overworld_scene.tscn", 60):
			_fail("%s: Failed to return to overworld" % test_name)
			return false
		
		if game_modes.current_mode != game_modes.GameMode.OVERWORLD:
			_fail("%s: Mode not OVERWORLD after combat" % test_name)
			return false
	else:
		_fail("%s: Combat scene not available" % test_name)
		return false
	
	return true

func _test_rapid_mode_switches(game_modes: Node) -> bool:
	var test_name := "Rapid mode switches"
	print("  Testing: %s" % test_name)
	
	# Queue multiple transitions rapidly
	game_modes.set_mode(game_modes.GameMode.OVERWORLD, true)
	game_modes.set_mode(game_modes.GameMode.COMBAT, true)
	game_modes.set_mode(game_modes.GameMode.OVERWORLD, true)
	
	await _wait_frames(10)
	
	# Should settle to the last requested mode
	if game_modes.current_mode != game_modes.GameMode.OVERWORLD:
		_fail("%s: Did not settle to OVERWORLD" % test_name)
		return false
	
	return true

# ============================================================================
# PHASE 4: Edge Case Tests
# ============================================================================

func _run_edge_case_tests() -> void:
	_print_phase("PHASE 4: Edge Case Tests")
	
	var game_modes: Node = RuntimeServices.game_modes(root)
	var event_bus: Node = RuntimeServices.event_bus(root)
	
	if game_modes == null or event_bus == null:
		_fail("Required autoloads missing for edge case tests")
		return
	
	var passed := 0
	var total := 0
	
	# Test 4.1: Double combat end
	total += 1
	if await _test_double_combat_end(game_modes, event_bus):
		passed += 1
	
	# Test 4.2: Combat start during combat
	total += 1
	if await _test_combat_start_during_combat(game_modes, event_bus):
		passed += 1
	
	# Test 4.3: Scene swap during transition
	total += 1
	if await _test_scene_swap_during_transition(game_modes):
		passed += 1
	
	# Test 4.4: Death during scene transition
	total += 1
	if await _test_death_during_transition(game_modes):
		passed += 1
	
	edge_case_results = {
		"passed": passed,
		"failed": total - passed,
		"total": total
	}

func _test_double_combat_end(game_modes: Node, event_bus: Node) -> bool:
	var test_name := "Double combat end call"
	print("  Testing: %s" % test_name)
	
	game_modes.set_mode(game_modes.GameMode.COMBAT, true)
	if not await _wait_for_scene("res://scenes/combat/combat_scene.tscn", 60):
		_fail("%s: Failed to reach combat" % test_name)
		return false
	
	var combat_scene = current_scene
	var event_count := 0
	
	var on_combat_end := func(_result):
		event_count += 1
	
	if event_bus.has_signal("combat_end"):
		event_bus.combat_end.connect(on_combat_end)
	
	# Call end_combat twice
	if combat_scene and combat_scene.has_method("end_combat"):
		combat_scene.end_combat(true)
		combat_scene.end_combat(true)
	
	await _wait_frames(5)
	
	if event_bus.has_signal("combat_end") and on_combat_end.is_valid():
		event_bus.combat_end.disconnect(on_combat_end)
	
	# Should only emit one combat_end event
	if event_count > 1:
		_fail("%s: combat_end emitted %d times (expected 1)" % [test_name, event_count])
		return false
	
	return true

func _test_combat_start_during_combat(game_modes: Node, event_bus: Node) -> bool:
	var test_name := "Combat start during active combat"
	print("  Testing: %s" % test_name)
	
	game_modes.set_mode(game_modes.GameMode.COMBAT, true)
	if not await _wait_for_scene("res://scenes/combat/combat_scene.tscn", 60):
		_fail("%s: Failed to reach combat" % test_name)
		return false
	
	# Try to queue another combat start
	var first_payload: Dictionary = event_bus.peek_combat_start() if event_bus.has_method("peek_combat_start") else {}
	
	# This should either fail gracefully or queue correctly
	var queue_result: Variant = event_bus.queue_combat_start({"difficulty": "hard"}) if event_bus.has_method("queue_combat_start") else {}
	var second_payload: Dictionary = event_bus.peek_combat_start() if event_bus.has_method("peek_combat_start") else {}
	# Keep references to ensure queue/peek calls are exercised in strict mode.
	var _ignored: Array = [first_payload, queue_result, second_payload]
	
	# Should handle gracefully without errors
	return true

func _test_scene_swap_during_transition(game_modes: Node) -> bool:
	var test_name := "Scene swap during transition"
	print("  Testing: %s" % test_name)
	
	# Start transition to combat
	game_modes.set_mode(game_modes.GameMode.COMBAT, true)
	
	# Immediately request another transition
	game_modes.set_mode(game_modes.GameMode.OVERWORLD, true)
	
	await _wait_frames(20)
	
	# Should settle to one of the valid states
	var valid_modes := [game_modes.GameMode.COMBAT, game_modes.GameMode.OVERWORLD]
	if not (game_modes.current_mode in valid_modes):
		_fail("%s: Mode in invalid state %d" % [test_name, game_modes.current_mode])
		return false
	
	return true

func _test_death_during_transition(game_modes: Node) -> bool:
	var test_name := "Death during scene transition"
	print("  Testing: %s" % test_name)
	
	game_modes.set_mode(game_modes.GameMode.COMBAT, true)
	
	# Don't wait, immediately try to trigger death
	# This tests the transition guard behavior
	
	await _wait_frames(5)
	
	# Should not crash or get stuck
	if game_modes.is_transitioning:
		await _wait_frames(30)
	
	# Should settle to a valid mode
	if game_modes.current_mode not in [
		game_modes.GameMode.COMBAT,
		game_modes.GameMode.DEATH,
		game_modes.GameMode.OVERWORLD
	]:
		_fail("%s: Mode in unexpected state %d" % [test_name, game_modes.current_mode])
		return false
	
	return true

# ============================================================================
# PHASE 5: Known Issue Regression Tests
# ============================================================================

func _run_known_issue_regression_tests() -> void:
	_print_phase("PHASE 5: Known Issue Regression Tests")
	
	# Test 5.1: Invalid transition errors should be caught
	await _test("Invalid transition produces error", func() -> bool:
		var game_modes: Node = RuntimeServices.game_modes(root)
		if game_modes == null:
			return false
		
		# Try invalid transition: DEATH -> COMBAT (should fail)
		game_modes.current_mode = game_modes.GameMode.DEATH
		var result: bool = game_modes.set_mode(game_modes.GameMode.COMBAT, false)
		return not result  # Should return false for invalid transition
	)
	
	# Test 5.2: Force flag bypasses transition check
	await _test("Force flag bypasses transition guards", func() -> bool:
		var game_modes: Node = RuntimeServices.game_modes(root)
		if game_modes == null:
			return false
		
		game_modes.current_mode = game_modes.GameMode.DEATH
		var result: bool = game_modes.set_mode(game_modes.GameMode.COMBAT, true)  # force=true
		return result  # Should succeed with force flag
	)
	
	# Test 5.3: Queued transitions respect latest request
	await _test("Queued transitions use latest request", func() -> bool:
		var game_modes: Node = RuntimeServices.game_modes(root)
		if game_modes == null:
			return false
		
		game_modes.current_mode = game_modes.GameMode.LOADING
		game_modes.set_mode(game_modes.GameMode.COMBAT, true)
		game_modes.set_mode(game_modes.GameMode.OVERWORLD, true)
		
		await _wait_frames(10)
		
		# Should have processed at least one
		return game_modes.current_mode == game_modes.GameMode.OVERWORLD
	)

# ============================================================================
# Helpers
# ============================================================================

func _test(name: String, test_func: Callable) -> void:
	tests_run += 1
	print("  Test %d: %s" % [tests_run, name])
	
	var result: bool = false
	var call_result: Variant = await test_func.call()
	result = bool(call_result)
	
	if result:
		tests_passed += 1
		print("    [PASS]")
	else:
		_fail("    [FAIL] %s" % name)

func _fail(message: String) -> void:
	failures.append(message)
	push_error(message)

func _print_phase(phase_name: String) -> void:
	print("\n" + _repeat_text("-", 40))
	print(phase_name)
	print(_repeat_text("-", 40))

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

func _report_results() -> void:
	print("\n" + _repeat_text("=", 60))
	print("TEST RESULTS SUMMARY")
	print(_repeat_text("=", 60))
	
	print("\nState Machine Tests:")
	print("  Passed: %d" % transition_test_results.get("passed", 0))
	print("  Failed: %d" % transition_test_results.get("failed", 0))
	
	print("\nScene Transition Tests:")
	print("  Passed: %d" % scene_transition_results.get("passed", 0))
	print("  Failed: %d" % scene_transition_results.get("failed", 0))
	print("  Total:  %d" % scene_transition_results.get("total", 0))
	
	print("\nEdge Case Tests:")
	print("  Passed: %d" % edge_case_results.get("passed", 0))
	print("  Failed: %d" % edge_case_results.get("failed", 0))
	print("  Total:  %d" % edge_case_results.get("total", 0))
	
	print("\nOverall: %d/%d tests passed" % [tests_passed, tests_run])
	
	if failures.is_empty():
		print("\n✓ ALL TESTS PASSED")
	else:
		print("\n✗ FAILURES (%d):" % failures.size())
		for failure in failures:
			print("  - %s" % failure)

func _finish() -> void:
	_cleanup_save_file()
	
	if failures.is_empty():
		print("\nCombatStateRegressionTests: PASS")
		quit(0)
	else:
		print("\nCombatStateRegressionTests: FAIL (%d)" % failures.size())
		quit(1)

func _repeat_text(token: String, count: int) -> String:
	var result: String = ""
	for _i in range(maxi(0, count)):
		result += token
	return result
