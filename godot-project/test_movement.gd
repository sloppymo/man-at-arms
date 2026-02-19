extends SceneTree

func _init():
	print("Starting movement system test...")
	
	# Load the overworld scene
	var overworld_scene = load("res://scenes/overworld/overworld_scene.tscn")
	if not overworld_scene:
		print("ERROR: Could not load overworld scene")
		quit(1)
		return
	
	# Instantiate the scene
	var scene_instance = overworld_scene.instantiate()
	if not scene_instance:
		print("ERROR: Could not instantiate overworld scene")
		quit(1)
		return
	
	# Add to scene tree
	get_root().add_child(scene_instance)
	
	# Wait for scene to initialize (simulate)
	print("Scene initialized, testing movement...")
	
	# Test WASD input simulation
	var input_events = [
		{"action": "move_right", "expected_hex_change": {"q": 1, "r": 0}},
		{"action": "move_left", "expected_hex_change": {"q": -1, "r": 0}},
		{"action": "move_up", "expected_hex_change": {"q": 0, "r": -1}},
		{"action": "move_down", "expected_hex_change": {"q": 0, "r": 1}},
	]
	
	var initial_hex = scene_instance.current_hex.duplicate()
	print("Initial hex position:", initial_hex)
	
	for test in input_events:
		var start_hex = scene_instance.current_hex.duplicate()
		
		# Simulate input press
		Input.action_press(test.action)
		
		# Process the scene manually
		var delta = 0.1
		if scene_instance.has_method("_process"):
			scene_instance._process(delta)
		
		# Release input
		Input.action_release(test.action)
		
		var end_hex = scene_instance.current_hex.duplicate()
		var expected_hex = {
			"q": start_hex.q + test.expected_hex_change.q,
			"r": start_hex.r + test.expected_hex_change.r
		}
		
		if end_hex.q == expected_hex.q and end_hex.r == expected_hex.r:
			print("✓ ", test.action, " movement works correctly")
		else:
			print("✗ ", test.action, " movement failed - expected:", expected_hex, " got:", end_hex)
	
	print("Movement system test completed")
	quit(0)
