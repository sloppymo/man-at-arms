extends Node

# Simple bootstrap to force landing page to show
func _ready() -> void:
	print("LandingBootstrap: Forcing landing scene to load")
	
	# Wait for autoloads to initialize
	await get_tree().create_timer(0.5).timeout
	
	print("LandingBootstrap: Loading landing scene")
	# Force change to landing scene
	get_tree().change_scene_to_file("res://scenes/landing_scene.tscn")
