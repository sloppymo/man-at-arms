extends Node

# Legacy Test Script for Critical Fixes Implementation
# DEPRECATED: Use ComprehensiveTestSuite instead
# This file is kept for backward compatibility

# Redirect to comprehensive test suite
func _ready() -> void:
	print("⚠️  Legacy test script detected. Redirecting to comprehensive test suite...")
	
	# Try to find and run the comprehensive test suite
	var comprehensive_suite = ComprehensiveTestSuite.new()
	add_child(comprehensive_suite)
	
	# Wait for initialization and run tests
	await get_tree().process_frame
	comprehensive_suite.run_all_tests()
	
	# Clean up after tests complete
	await comprehensive_suite.all_tests_completed
	comprehensive_suite.queue_free()
	
	print("✅ Legacy test redirect complete")

# Legacy test methods (no longer used)
func test_audio_pooling() -> void:
	print("⚠️  test_audio_pooling() is deprecated. Use ComprehensiveTestSuite instead")

func test_camera_shake() -> void:
	print("⚠️  test_camera_shake() is deprecated. Use ComprehensiveTestSuite instead")

func test_particle_pooling() -> void:
	print("⚠️  test_particle_pooling() is deprecated. Use ComprehensiveTestSuite instead")

func _input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_accept"):  # Enter key
		print("\n🔄 Running tests again...")
		_ready()
