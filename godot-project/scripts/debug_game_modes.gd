extends Node
class_name DebugGameModes

# Debug script to test game mode transitions
const GameModesScript = preload("res://scripts/game_modes.gd")

func _ready() -> void:
	print("=== Debug Game Modes Test ===")
	await test_valid_transitions()
	await test_invalid_transitions()

func test_valid_transitions() -> void:
	print("\n🧪 Testing Valid Transitions:")

	var game_modes: Node = GameModesScript.new()
	add_child(game_modes)
	await get_tree().process_frame

	# Test COMBAT -> OVERWORLD (should be valid)
	game_modes.current_mode = game_modes.GameMode.COMBAT
	var combat_to_overworld_ok: bool = game_modes.set_mode(game_modes.GameMode.OVERWORLD)
	print("COMBAT -> OVERWORLD: ", "✅" if combat_to_overworld_ok else "❌")

	# Test COMBAT -> DEATH (should be valid)
	game_modes.current_mode = game_modes.GameMode.COMBAT
	var combat_to_death_ok: bool = game_modes.set_mode(game_modes.GameMode.DEATH)
	print("COMBAT -> DEATH: ", "✅" if combat_to_death_ok else "❌")

	game_modes.queue_free()

func test_invalid_transitions() -> void:
	print("\n❌ Testing Invalid Transitions:")

	var game_modes: Node = GameModesScript.new()
	add_child(game_modes)
	await get_tree().process_frame

	# Test COMBAT -> EQUIPMENT (should be invalid)
	game_modes.current_mode = game_modes.GameMode.COMBAT
	var combat_to_equipment_ok: bool = game_modes.set_mode(game_modes.GameMode.EQUIPMENT)
	print("COMBAT -> EQUIPMENT: ", "❌" if not combat_to_equipment_ok else "✅", " (Expected to fail)")

	# Test DEATH -> COMBAT (should be invalid)
	game_modes.current_mode = game_modes.GameMode.DEATH
	var death_to_combat_ok: bool = game_modes.set_mode(game_modes.GameMode.COMBAT)
	print("DEATH -> COMBAT: ", "❌" if not death_to_combat_ok else "✅", " (Expected to fail)")

	game_modes.queue_free()

func _input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_accept"):  # Enter key
		print("\n🔄 Re-running debug tests...")
		_ready()
	elif event.is_action_pressed("ui_cancel"):  # Escape key
		get_tree().change_scene_to_file("res://scenes/overworld/overworld_scene.tscn")

func _on_timer_timeout() -> void:
	# Auto-run tests after scene loads
	_ready()
