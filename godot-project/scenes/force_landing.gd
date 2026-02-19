extends Node

# Force landing scene to load by any means necessary
func _enter_tree() -> void:
	print("ForceLanding: _enter_tree called")
	
func _ready() -> void:
	print("ForceLanding: _ready called")
	print("ForceLanding: Current scene:", get_tree().current_scene.scene_file_path)
	print("ForceLanding: Attempting to force landing scene")
	
	# Try multiple methods to load landing scene
	# Method 1: Direct change
	get_tree().change_scene_to_file("res://scenes/landing_scene.tscn")
	
	# Method 2: Call deferred (backup)
	get_tree().call_deferred("change_scene_to_file", "res://scenes/landing_scene.tscn")
