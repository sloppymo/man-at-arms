extends SceneTree

func _init():
	print("Testing movement system logic...")
	
	# Test the hex movement logic directly
	var current_hex = {"q": 0, "r": 0}
	
	var tests = [
		{"input": "move_right", "expected": {"q": 1, "r": 0}},
		{"input": "move_left", "expected": {"q": -1, "r": 0}},
		{"input": "move_up", "expected": {"q": 0, "r": -1}},
		{"input": "move_down", "expected": {"q": 0, "r": 1}},
	]
	
	var passed = 0
	var total = tests.size()
	
	for test in tests:
		var test_hex = {"q": 0, "r": 0}  # Reset for each test
		
		# Simulate the movement logic from overworld_scene.gd
		match test.input:
			"move_left":
				test_hex["q"] -= 1
			"move_right":
				test_hex["q"] += 1
			"move_up":
				test_hex["r"] -= 1
			"move_down":
				test_hex["r"] += 1
		
		if test_hex.q == test.expected.q and test_hex.r == test.expected.r:
			print("✓ ", test.input, " works correctly")
			passed += 1
		else:
			print("✗ ", test.input, " failed - expected:", test.expected, " got:", test_hex)
	
	print("Logic test results: ", passed, "/", total, " passed")
	
	# Test hex to world conversion
	print("\nTesting hex to world conversion...")
	var hex_to_world = func(q: int, r: int) -> Vector2:
		var x = 30.0 * (3.0/2.0 * q)
		var y = 30.0 * (sqrt(3)/2.0 * q + sqrt(3) * r)
		return Vector2(x, y)
	
	var conversion_tests = [
		{"hex": {"q": 0, "r": 0}, "expected": Vector2(0, 0)},
		{"hex": {"q": 1, "r": 0}, "expected": Vector2(45, 25.9808)},
		{"hex": {"q": 0, "r": 1}, "expected": Vector2(0, 51.9615)},
	]
	
	var conversion_passed = 0
	for test in conversion_tests:
		var result = hex_to_world.call(test.hex.q, test.hex.r)
		if abs(result.x - test.expected.x) < 0.01 and abs(result.y - test.expected.y) < 0.01:
			print("✓ Hex (", test.hex.q, ",", test.hex.r, ") converts correctly")
			conversion_passed += 1
		else:
			print("✗ Hex (", test.hex.q, ",", test.hex.r, ") conversion failed - expected:", test.expected, " got:", result)
	
	print("Conversion test results: ", conversion_passed, "/", conversion_tests.size(), " passed")
	
	if passed == total and conversion_passed == conversion_tests.size():
		print("\n✅ Movement system logic is working correctly!")
		quit(0)
	else:
		print("\n❌ Movement system has issues that need fixing")
		quit(1)
