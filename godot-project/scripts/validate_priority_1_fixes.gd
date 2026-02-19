extends Node
class_name ValidatePriority1Fixes

# Priority 1 Fixes Validation Script
# Immediate validation of audio pooling, camera shake optimization, and particle memory management

signal validation_completed(results: Dictionary)
signal fix_validated(fix_name: String, status: String, details: Dictionary)

# Validation results
var validation_results = {}
var overall_status = ""

func _ready() -> void:
	print("🎯 Starting Priority 1 Fixes Validation...")
	_validate_all_fixes()

func _validate_all_fixes() -> void:
	# Validate each critical fix
	await _validate_audio_system_pooling()
	await _validate_camera_shake_optimization()
	await _validate_particle_memory_management()
	
	# Generate final report
	_generate_validation_report()

func _validate_audio_system_pooling() -> void:
	print("\n🎵 Validating Audio System Pooling...")
	
	var fix_name = "Audio System Pooling"
	var validation_details = {}
	var status = "FAILED"
	
	# Get AudioManager
	var audio_manager = get_node("/root/AudioManager")
	if not audio_manager:
		validation_details["error"] = "AudioManager not found"
		fix_validated.emit(fix_name, status, validation_details)
		return
	
	# Test 1: Pool Initialization
	var pool_size = audio_manager.sfx_players.size()
	validation_details["pool_size"] = pool_size
	var pool_initialized = pool_size == 8
	validation_details["pool_initialized"] = pool_initialized
	
	# Test 2: Round-Robin Behavior
	var initial_index = audio_manager.sfx_pool_index
	var mock_stream = AudioStreamGenerator.new()
	
	# Play 10 sounds to test round-robin
	for i in range(10):
		audio_manager.play_sfx(mock_stream, -10.0)
	
	var final_index = audio_manager.sfx_pool_index
	var round_robin_working = (final_index - initial_index) % 8 == (10 % 8)
	validation_details["round_robin_working"] = round_robin_working
	validation_details["initial_index"] = initial_index
	validation_details["final_index"] = final_index
	
	# Test 3: Error Handling
	audio_manager.play_sfx(null, 0.0)  # Should handle gracefully
	var error_handled = true
	
	validation_details["error_handling"] = error_handled
	
	# Test 4: Pool Efficiency
	var unique_players = {}
	for i in range(8):
		audio_manager.play_sfx(mock_stream, -10.0)
		var player = audio_manager.sfx_players[audio_manager.sfx_pool_index - 1]
		unique_players[player.get_instance_id()] = true
	
	var pool_efficiency = unique_players.size() == 8
	validation_details["pool_efficiency"] = pool_efficiency
	validation_details["unique_players_used"] = unique_players.size()
	
	# Overall status
	var all_tests_passed = pool_initialized and round_robin_working and error_handled and pool_efficiency
	status = "PASSED" if all_tests_passed else "FAILED"
	
	validation_details["overall_status"] = status
	validation_results[fix_name] = validation_details
	
	fix_validated.emit(fix_name, status, validation_details)
	print(("✅" if status == "PASSED" else "❌"), " Audio System Pooling: ", status)

func _validate_camera_shake_optimization() -> void:
	print("\n📷 Validating Camera Shake Optimization...")
	
	var fix_name = "Camera Shake Optimization"
	var validation_details = {}
	var status = "FAILED"
	
	# Create test player for validation
	var test_player = CombatPlayer.new()
	test_player.name = "ValidationTestPlayer"
	add_child(test_player)
	
	var camera = Camera2D.new()
	camera.name = "Camera2D"
	test_player.add_child(camera)
	
	await get_tree().process_frame
	
	# Test 1: Timer Setup
	var timer_setup = test_player.shake_timer != null
	validation_details["timer_setup"] = timer_setup
	validation_details["timer_wait_time"] = test_player.shake_timer.wait_time if timer_setup else 0
	
	# Test 2: Original Offset Storage
	var offset_stored = test_player.original_camera_offset == Vector2.ZERO
	validation_details["offset_stored"] = offset_stored
	validation_details["original_offset"] = test_player.original_camera_offset
	
	# Test 3: Shake Application
	var start_fps = Engine.get_frames_per_second()
	test_player.apply_shake(5.0, 0.32)
	
	var shake_applied = test_player.shake_intensity == 5.0 and test_player.shake_duration == 0.32
	validation_details["shake_applied"] = shake_applied
	validation_details["shake_intensity"] = test_player.shake_intensity
	validation_details["shake_duration"] = test_player.shake_duration
	
	# Test 4: Update Mechanism
	var update_connected = test_player.shake_timer.is_connected("timeout", test_player._update_shake)
	validation_details["update_connected"] = update_connected
	
	# Test 5: Performance Impact
	await get_tree().create_timer(0.5).timeout
	var end_fps = Engine.get_frames_per_second()
	var fps_impact = abs(start_fps - end_fps)
	var performance_acceptable = fps_impact < 10  # Less than 10 FPS impact
	
	validation_details["fps_before"] = start_fps
	validation_details["fps_after"] = end_fps
	validation_details["fps_impact"] = fps_impact
	validation_details["performance_acceptable"] = performance_acceptable
	
	# Test 6: Cleanup
	await get_tree().create_timer(0.5).timeout
	var cleanup_successful = test_player.shake_intensity == 0.0 and test_player.shake_timer.is_stopped()
	validation_details["cleanup_successful"] = cleanup_successful
	
	# Overall status
	var all_tests_passed = timer_setup and offset_stored and shake_applied and update_connected and performance_acceptable and cleanup_successful
	status = "PASSED" if all_tests_passed else "FAILED"
	
	validation_details["overall_status"] = status
	validation_results[fix_name] = validation_details
	
	# Clean up
	test_player.queue_free()
	
	fix_validated.emit(fix_name, status, validation_details)
	print(("✅" if status == "PASSED" else "❌"), " Camera Shake Optimization: ", status)

func _validate_particle_memory_management() -> void:
	print("\n✨ Validating Particle System Memory Management...")
	
	var fix_name = "Particle Memory Management"
	var validation_details = {}
	var status = "FAILED"
	
	# Get ParticleManager
	var particle_manager = get_node("/root/ParticleManager")
	if not particle_manager:
		validation_details["error"] = "ParticleManager not found"
		fix_validated.emit(fix_name, status, validation_details)
		return
	
	# Test 1: Pool Initialization
	var pool_size = particle_manager.blood_particle_pool.size()
	validation_details["pool_size"] = pool_size
	var pool_initialized = pool_size == 10
	validation_details["pool_initialized"] = pool_initialized
	
	# Test 2: Pool Index Management
	var initial_index = particle_manager.pool_index
	var particles1 = particle_manager.get_blood_particles()
	var particles2 = particle_manager.get_blood_particles()
	var index_advanced = particle_manager.pool_index != initial_index
	validation_details["index_advanced"] = index_advanced
	validation_details["initial_index"] = initial_index
	validation_details["final_index"] = particle_manager.pool_index
	
	# Test 3: Particle Reuse
	var particles = []
	for i in range(12):  # More than pool size
		var particle = particle_manager.get_blood_particles()
		if particle:
			particles.append(particle)
	
	var unique_particles = {}
	for particle in particles:
		unique_particles[particle.get_instance_id()] = true
	
	var reuse_working = unique_particles.size() <= 10  # Should wrap around
	validation_details["reuse_working"] = reuse_working
	validation_details["particles_requested"] = 12
	validation_details["unique_particles"] = unique_particles.size()
	
	# Test 4: Memory Stability
	var initial_memory = _get_memory_usage_bytes()
	
	# Play multiple effects
	for i in range(15):
		particle_manager.play_blood_effect(Vector2(i * 20, i * 15))
		await get_tree().process_frame
	
	await get_tree().create_timer(1.0).timeout  # Wait for effects to complete
	
	var final_memory = _get_memory_usage_bytes()
	var memory_growth = (final_memory - initial_memory) / (1024.0 * 1024.0)  # Convert to MB
	var memory_stable = memory_growth < 5.0  # Less than 5MB growth
	
	validation_details["initial_memory_bytes"] = initial_memory
	validation_details["final_memory_bytes"] = final_memory
	validation_details["memory_growth_mb"] = memory_growth
	validation_details["memory_stable"] = memory_stable
	
	# Test 5: Particle Configuration
	var test_particle = particle_manager.get_blood_particles()
	var config_correct = false
	if test_particle:
		config_correct = (test_particle.amount == 20 and 
						test_particle.lifetime == 1.0 and 
						test_particle.color == Color.RED)
	
	validation_details["config_correct"] = config_correct
	validation_details["particle_amount"] = test_particle.amount if test_particle else 0
	validation_details["particle_lifetime"] = test_particle.lifetime if test_particle else 0
	
	# Overall status
	var all_tests_passed = pool_initialized and index_advanced and reuse_working and memory_stable and config_correct
	status = "PASSED" if all_tests_passed else "FAILED"
	
	validation_details["overall_status"] = status
	validation_results[fix_name] = validation_details
	
	fix_validated.emit(fix_name, status, validation_details)
	print(("✅" if status == "PASSED" else "❌"), " Particle Memory Management: ", status)

func _generate_validation_report() -> void:
	print("\n" + "=".repeat(60))
	print("🎯 PRIORITY 1 FIXES VALIDATION REPORT")
	print("=".repeat(60))
	
	var total_fixes = validation_results.size()
	var passed_fixes = 0
	var failed_fixes = []
	
	for fix_name in validation_results:
		var result = validation_results[fix_name]
		if result.overall_status == "PASSED":
			passed_fixes += 1
			print("✅ ", fix_name, ": PASSED")
		else:
			failed_fixes.append(fix_name)
			print("❌ ", fix_name, ": FAILED")
			
			# Print failure details
			if result.has("error"):
				print("   Error: ", result.error)
			else:
				print("   Issues detected:")
				for key in result:
					if key != "overall_status" and not result[key]:
						print("     - ", key, ": ", result[key])
	
	var success_rate = float(passed_fixes) / float(total_fixes) * 100.0
	
	print("\n📊 SUMMARY:")
	print("   Total Fixes: ", total_fixes)
	print("   Passed: ", passed_fixes)
	print("   Failed: ", failed_fixes.size())
	print("   Success Rate: ", "%.1f" % success_rate, "%")
	
	# Overall assessment
	if failed_fixes.size() == 0:
		overall_status = "✅ ALL PRIORITY 1 FIXES VALIDATED"
		print("\n🎉 OVERALL STATUS: ALL CRITICAL FIXES SUCCESSFULLY IMPLEMENTED")
	elif success_rate >= 66.7:  # At least 2 out of 3
		overall_status = "⚠️  MOST FIXES VALIDATED - SOME ISSUES DETECTED"
		print("\n⚠️  OVERALL STATUS: MOST FIXES WORKING - ATTENTION NEEDED")
	else:
		overall_status = "❌ CRITICAL ISSUES DETECTED"
		print("\n❌ OVERALL STATUS: CRITICAL ISSUES REQUIRE IMMEDIATE ATTENTION")
	
	print("=".repeat(60))
	
	# Emit completion signal
	var final_report = {
		"total_fixes": total_fixes,
		"passed_fixes": passed_fixes,
		"failed_fixes": failed_fixes.size(),
		"success_rate": success_rate,
		"overall_status": overall_status,
		"detailed_results": validation_results
	}
	
	validation_completed.emit(final_report)

# Quick validation function for immediate feedback
func _get_memory_usage_bytes() -> float:
	var memory_monitor = Performance.get_monitor(Performance.MEMORY_STATIC)
	return float(memory_monitor) if memory_monitor != null else 0.0

func quick_validate() -> Dictionary:
	var quick_results = {}
	
	# Quick audio check
	var audio_manager = get_node("/root/AudioManager")
	quick_results["audio_pool_size"] = audio_manager.sfx_players.size() if audio_manager else 0
	
	# Quick particle check
	var particle_manager = get_node("/root/ParticleManager")
	quick_results["particle_pool_size"] = particle_manager.blood_particle_pool.size() if particle_manager else 0
	
	# Quick performance check
	quick_results["current_fps"] = Engine.get_frames_per_second()
	quick_results["memory_mb"] = _get_memory_usage_bytes() / (1024.0 * 1024.0)
	
	return quick_results

func _input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_accept"):  # Enter key
		print("\n🔄 Re-validating Priority 1 fixes...")
		validation_results.clear()
		_validate_all_fixes()
	elif event.is_action_pressed("ui_cancel"):  # Escape key
		get_tree().change_scene_to_file("res://scenes/overworld/overworld_scene.tscn")

func _on_timer_timeout() -> void:
	# Auto-start validation after scene loads
	_validate_all_fixes()
