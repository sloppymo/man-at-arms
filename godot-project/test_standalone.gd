extends Node

# Standalone test that doesn't rely on project settings
func _init() -> void:
	print("StandaloneTest: _init called - this should appear before any scene loads")

func _enter_tree() -> void:
	print("StandaloneTest: _enter_tree called")

func _ready() -> void:
	print("StandaloneTest: _ready called")
	print("StandaloneTest: Creating simple UI to verify this works")
	
	# Create a simple UI to verify this scene is loading
	var ui = Control.new()
	add_child(ui)
	
	var label = Label.new()
	label.text = "STANDALONE TEST WORKS!
If you see this, scene loading is working.
The landing page issue is elsewhere."
	label.position = Vector2(100, 100)
	ui.add_child(label)
	
	var timer = Timer.new()
	timer.wait_time = 3.0
	timer.one_shot = true
	timer.timeout.connect(_on_timer_timeout)
	add_child(timer)
	timer.start()
	
	print("StandaloneTest: UI created, timer started")

func _on_timer_timeout() -> void:
	print("StandaloneTest: Timer finished - attempting to load landing scene")
	get_tree().change_scene_to_file("res://scenes/landing_scene.tscn")
