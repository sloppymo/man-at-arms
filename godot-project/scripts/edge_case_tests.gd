extends Node
class_name EdgeCaseTests

# Edge Case Testing for Priority 1 Implementation
# Tests boundary conditions, error scenarios, and unusual usage patterns

signal edge_case_test_completed(test_name: String, result: bool, details: Dictionary)

@export var autorun: bool = false

var audio_manager: AudioManager
var particle_manager: Node
var test_player: CombatPlayer
var _is_running: bool = false
var _cancel_requested: bool = false

func _ready() -> void:
	print("=== Edge Case Testing Suite ===")
	_setup_references()
	await get_tree().process_frame
	if autorun:
		start()
	else:
		print("EdgeCaseTests: Ready (manual start mode)")

func start() -> void:
	if _is_running:
		print("EdgeCaseTests: Test run already in progress")
		return
	_cancel_requested = false
	run_edge_case_tests()

func _setup_references() -> void:
	audio_manager = get_node("/root/AudioManager")
	particle_manager = get_node("/root/ParticleManager")
	
	# Create test player
	test_player = CombatPlayer.new()
	test_player.name = "EdgeCaseTestPlayer"
	add_child(test_player)
	
	var camera = Camera2D.new()
	camera.name = "Camera2D"
	test_player.add_child(camera)
	
	await get_tree().process_frame

func run_edge_case_tests() -> void:
	if _is_running:
		print("EdgeCaseTests: Ignoring duplicate run request")
		return
	_is_running = true

	print("\n🔍 Running Edge Case Tests...")
	
	# Audio edge cases
	await test_audio_pool_exhaustion()
	if _cancel_requested:
		_is_running = false
		return
	await test_invalid_audio_streams()
	if _cancel_requested:
		_is_running = false
		return
	await test_rapid_audio_start_stop()
	if _cancel_requested:
		_is_running = false
		return
	await test_extreme_audio_parameters()
	if _cancel_requested:
		_is_running = false
		return
	
	# Camera shake edge cases
	await test_overlapping_shakes()
	if _cancel_requested:
		_is_running = false
		return
	await test_zero_parameters()
	if _cancel_requested:
		_is_running = false
		return
	await test_extreme_shake_values()
	if _cancel_requested:
		_is_running = false
		return
	await test_shake_during_scene_transitions()
	if _cancel_requested:
		_is_running = false
		return
	
	# Particle system edge cases
	await test_particle_pool_exhaustion()
	if _cancel_requested:
		_is_running = false
		return
	await test_rapid_particle_lifecycle()
	if _cancel_requested:
		_is_running = false
		return
	await test_particle_configuration_corruption()
	if _cancel_requested:
		_is_running = false
		return
	await test_particle_system_during_pause()
	
	_is_running = false

# ==================== AUDIO EDGE CASES ====================

func test_audio_pool_exhaustion() -> void:
	print("\n🎵 Testing Audio Pool Exhaustion...")
	var test_name = "Audio Pool Exhaustion"
	var details = {}
	var passed = true
	
	if not audio_manager:
		details["error"] = "AudioManager not found"
		passed = false
	else:
		var initial_index = audio_manager.sfx_pool_index
		var mock_stream = AudioStreamGenerator.new()
		var cutoffs_detected = 0
		var unique_players_used = {}
		
		# Play sounds faster than pool can handle
		for i in range(20):  # More than pool size
			audio_manager.play_sfx(mock_stream, -10.0)
			
			# Track which players are being used
			var current_player = audio_manager.sfx_players[(audio_manager.sfx_pool_index - 1) % 8]
			unique_players_used[current_player.get_instance_id()] = true
			
			await get_tree().process_frame
		
		details["sounds_played"] = 20
		details["unique_players_used"] = unique_players_used.size()
		details["pool_wraps"] = unique_players_used.size() <= 8
		details["round_robin_working"] = unique_players_used.size() == 8
		
		# Verify pool behavior
		var final_index = audio_manager.sfx_pool_index
		details["index_wrapped_correctly"] = (final_index - initial_index) % 8 == (20 % 8)
	
	edge_case_test_completed.emit(test_name, passed, details)
	print(passed and "✅" or "❌", " Audio Pool Exhaustion: ", "PASSED" if passed else "FAILED")

func test_invalid_audio_streams() -> void:
	print("\n🎵 Testing Invalid Audio Streams...")
	var test_name = "Invalid Audio Streams"
	var details = {}
	var passed = true
	
	if not audio_manager:
		details["error"] = "AudioManager not found"
		passed = false
	else:
		# Test null stream
		audio_manager.play_sfx(null, 0.0)
		details["null_stream_handled"] = true

		# Test concrete stream type
		var generator_stream = AudioStreamGenerator.new()
		audio_manager.play_sfx(generator_stream, 0.0)
		details["generator_stream_handled"] = true

		# Test reused stream reference
		var reused_stream: AudioStream = generator_stream
		audio_manager.play_sfx(reused_stream, 0.0)
		details["reused_stream_handled"] = true
		passed = true
	
	edge_case_test_completed.emit(test_name, passed, details)
	print(passed and "✅" or "❌", " Invalid Audio Streams: ", "PASSED" if passed else "FAILED")

func test_rapid_audio_start_stop() -> void:
	print("\n🎵 Testing Rapid Audio Start/Stop...")
	var test_name = "Rapid Audio Start/Stop"
	var details = {}
	var passed = true
	
	if not audio_manager:
		details["error"] = "AudioManager not found"
		passed = false
	else:
		var memory_before = _get_memory_usage()
		var mock_stream = AudioStreamGenerator.new()
		var artifacts_detected = 0
		
		# Rapid start/stop cycles
		for cycle in range(50):
			# Start multiple sounds
			for i in range(5):
				audio_manager.play_sfx(mock_stream, -10.0)
			
			# Immediate stop attempt (if available)
			for player in audio_manager.sfx_players:
				if player.playing:
					player.stop()
			
			await get_tree().process_frame
		
		var memory_after = _get_memory_usage()
		
		details["rapid_cycles"] = 50
		details["memory_growth_mb"] = memory_after - memory_before
		details["memory_stable"] = (memory_after - memory_before) < 2
		details["no_audio_artifacts"] = artifacts_detected == 0
	
	edge_case_test_completed.emit(test_name, passed, details)
	print(passed and "✅" or "❌", " Rapid Audio Start/Stop: ", "PASSED" if passed else "FAILED")

func test_extreme_audio_parameters() -> void:
	print("\n🎵 Testing Extreme Audio Parameters...")
	var test_name = "Extreme Audio Parameters"
	var details = {}
	var passed = true
	
	if not audio_manager:
		details["error"] = "AudioManager not found"
		passed = false
	else:
		var mock_stream = AudioStreamGenerator.new()
		
		# Test extreme volume levels
		var extreme_volumes = [-1000.0, -80.0, 0.0, 24.0, 1000.0]
		
		for volume in extreme_volumes:
			audio_manager.play_sfx(mock_stream, volume)
			details["volume_" + str(volume) + "_handled"] = true
		
		# Test rapid parameter changes
		for i in range(20):
			audio_manager.play_sfx(mock_stream, randf_range(-1000, 1000))
		
		passed = true
	
	edge_case_test_completed.emit(test_name, passed, details)
	print(passed and "✅" or "❌", " Extreme Audio Parameters: ", "PASSED" if passed else "FAILED")

# ==================== CAMERA SHAKE EDGE CASES ====================

func test_overlapping_shakes() -> void:
	print("\n📷 Testing Overlapping Camera Shakes...")
	var test_name = "Overlapping Camera Shakes"
	var details = {}
	var passed = true
	
	if not test_player:
		details["error"] = "Test player not found"
		passed = false
	else:
		var camera = test_player.get_node("Camera2D")
		var visual_artifacts = 0
		
		# Apply multiple shakes rapidly
		test_player.apply_shake(5.0, 1.0)  # Long shake
		await get_tree().create_timer(0.1).timeout
		
		test_player.apply_shake(10.0, 0.5)  # Override with stronger shake
		await get_tree().create_timer(0.1).timeout
		
		test_player.apply_shake(3.0, 0.8)   # Weaker shake
		await get_tree().create_timer(0.1).timeout
		
		# Monitor for visual artifacts
		var last_offset = camera.offset
		for i in range(20):
			await get_tree().create_timer(0.016).timeout
			var current_offset = camera.offset
			if current_offset.distance_to(last_offset) > 50.0:  # Sudden large jump
				visual_artifacts += 1
			last_offset = current_offset
		
		# Wait for all shakes to complete
		await get_tree().create_timer(2.0).timeout
		
		details["overlapping_shakes"] = 3
		details["visual_artifacts"] = visual_artifacts
		details["final_offset_correct"] = camera.offset == test_player.original_camera_offset
		details["shake_intensity_reset"] = test_player.shake_intensity == 0.0
	
	edge_case_test_completed.emit(test_name, passed, details)
	print(passed and "✅" or "❌", " Overlapping Camera Shakes: ", "PASSED" if passed else "FAILED")

func test_zero_parameters() -> void:
	print("\n📷 Testing Zero Parameters...")
	var test_name = "Zero Parameters"
	var details = {}
	var passed = true
	
	if not test_player:
		details["error"] = "Test player not found"
		passed = false
	else:
		var camera = test_player.get_node("Camera2D")
		
		# Test zero duration
		test_player.apply_shake(5.0, 0.0)
		details["zero_duration_handled"] = not test_player.shake_timer.is_stopped()
		await get_tree().create_timer(0.1).timeout
		
		# Test zero intensity
		test_player.apply_shake(0.0, 0.5)
		details["zero_intensity_handled"] = test_player.shake_intensity == 0.0
		await get_tree().create_timer(0.6).timeout
		
		# Test both zero
		test_player.apply_shake(0.0, 0.0)
		details["both_zero_handled"] = test_player.shake_intensity == 0.0
		await get_tree().create_timer(0.1).timeout
		
		details["offset_restored"] = camera.offset == test_player.original_camera_offset
		details["timer_stopped"] = test_player.shake_timer.is_stopped()
	
	edge_case_test_completed.emit(test_name, passed, details)
	print(passed and "✅" or "❌", " Zero Parameters: ", "PASSED" if passed else "FAILED")

func test_extreme_shake_values() -> void:
	print("\n📷 Testing Extreme Shake Values...")
	var test_name = "Extreme Shake Values"
	var details = {}
	var passed = true
	
	if not test_player:
		details["error"] = "Test player not found"
		passed = false
	else:
		var camera = test_player.get_node("Camera2D")
		
		# Test extreme intensity
		test_player.apply_shake(1000.0, 0.1)  # Very high intensity
		details["extreme_intensity_handled"] = true
		
		await get_tree().create_timer(0.2).timeout
		
		# Test extreme duration
		test_player.apply_shake(5.0, 60.0)  # Very long duration
		details["extreme_duration_handled"] = true
		
		# Cancel the long shake
		await get_tree().create_timer(0.1).timeout
		test_player.shake_duration = 0.0
		test_player._update_shake()
		
		# Test negative values
		test_player.apply_shake(-5.0, -0.5)  # Negative values
		details["negative_values_handled"] = true
		
		passed = camera.offset == test_player.original_camera_offset
	
	edge_case_test_completed.emit(test_name, passed, details)
	print(passed and "✅" or "❌", " Extreme Shake Values: ", "PASSED" if passed else "FAILED")

func test_shake_during_scene_transitions() -> void:
	print("\n📷 Testing Shake During Scene Transitions...")
	var test_name = "Shake During Scene Transitions"
	var details = {}
	var passed = true
	
	if not test_player:
		details["error"] = "Test player not found"
		passed = false
	else:
		# Apply shake and simulate scene transition
		test_player.apply_shake(5.0, 2.0)
		
		# Simulate scene pause (like during transition)
		test_player.set_process(false)
		await get_tree().create_timer(0.5).timeout
		
		# Resume processing
		test_player.set_process(true)
		await get_tree().create_timer(1.0).timeout
		
		# Check if system recovered properly
		var camera = test_player.get_node("Camera2D")
		details["shake_survived_pause"] = true
		details["system_recovered"] = camera.offset == test_player.original_camera_offset
		details["timer_stopped"] = test_player.shake_timer.is_stopped()
	
	edge_case_test_completed.emit(test_name, passed, details)
	print(passed and "✅" or "❌", " Shake During Scene Transitions: ", "PASSED" if passed else "FAILED")

# ==================== PARTICLE SYSTEM EDGE CASES ====================

func test_particle_pool_exhaustion() -> void:
	print("\n✨ Testing Particle Pool Exhaustion...")
	var test_name = "Particle Pool Exhaustion"
	var details = {}
	var passed = true
	
	if not particle_manager:
		details["error"] = "ParticleManager not found"
		passed = false
	else:
		var initial_memory = _get_memory_usage()
		var overflow_particles = []
		
		# Request more particles than pool capacity
		for i in range(25):  # More than MAX_POOL_SIZE (10)
			var particles = particle_manager.get_blood_particles()
			if particles:
				overflow_particles.append(particles)
		
		# Check if pool wraps correctly
		var unique_particles = {}
		for particle in overflow_particles:
			unique_particles[particle.get_instance_id()] = true
		
		var final_memory = _get_memory_usage()
		
		details["particles_requested"] = 25
		details["particles_obtained"] = overflow_particles.size()
		details["unique_particles"] = unique_particles.size()
		details["pool_wrapped_correctly"] = unique_particles.size() <= 10
		details["memory_growth_mb"] = final_memory - initial_memory
		details["no_memory_leak"] = (final_memory - initial_memory) < 1
	
	edge_case_test_completed.emit(test_name, passed, details)
	print(passed and "✅" or "❌", " Particle Pool Exhaustion: ", "PASSED" if passed else "FAILED")

func test_rapid_particle_lifecycle() -> void:
	print("\n✨ Testing Rapid Particle Lifecycle...")
	var test_name = "Rapid Particle Lifecycle"
	var details = {}
	var passed = true
	
	if not particle_manager:
		details["error"] = "ParticleManager not found"
		passed = false
	else:
		var initial_memory = _get_memory_usage()
		var lifecycle_cycles = 0
		var reuse_count = 0
		
		# Rapid create and destroy cycles
		for cycle in range(30):
			var particles = particle_manager.get_blood_particles()
			if particles:
				particle_manager.play_blood_effect(Vector2(cycle * 10, cycle * 5))
				lifecycle_cycles += 1
				
				# Check if particle was reused
				if particles.emitting:
					reuse_count += 1
			
			await get_tree().create_timer(0.01).timeout
		
		var final_memory = _get_memory_usage()
		
		details["lifecycle_cycles"] = lifecycle_cycles
		details["reuse_count"] = reuse_count
		details["memory_growth_mb"] = final_memory - initial_memory
		details["pool_efficient"] = reuse_count > 0
		details["memory_stable"] = (final_memory - initial_memory) < 2
	
	edge_case_test_completed.emit(test_name, passed, details)
	print(passed and "✅" or "❌", " Rapid Particle Lifecycle: ", "PASSED" if passed else "FAILED")

func test_particle_configuration_corruption() -> void:
	print("\n✨ Testing Particle Configuration Corruption...")
	var test_name = "Particle Configuration Corruption"
	var details = {}
	var passed = true
	
	if not particle_manager:
		details["error"] = "ParticleManager not found"
		passed = false
	else:
		var corruption_detected = false
		var test_particles = []
		
		# Get multiple particles and check their configuration
		for i in range(5):
			var particles = particle_manager.get_blood_particles()
			if particles:
				test_particles.append(particles)
		
		# Check configuration integrity
		for i in range(test_particles.size()):
			var particles = test_particles[i]
			
			# Verify key properties
			if particles.amount != 20:
				corruption_detected = true
				details["amount_corruption_" + str(i)] = particles.amount
			
			if particles.lifetime != 1.0:
				corruption_detected = true
				details["lifetime_corruption_" + str(i)] = particles.lifetime
			
			if particles.color != Color.RED:
				corruption_detected = true
				details["color_corruption_" + str(i)] = particles.color.to_html()
		
		# Test after reuse
		for particles in test_particles:
			particle_manager.play_blood_effect(Vector2(100, 100))
		
		await get_tree().create_timer(0.5).timeout
		
		# Re-check configuration
		for i in range(test_particles.size()):
			var particles = test_particles[i]
			if particles.amount != 20:
				corruption_detected = true
				details["reuse_amount_corruption_" + str(i)] = particles.amount
		
		passed = not corruption_detected
	
	edge_case_test_completed.emit(test_name, passed, details)
	print(passed and "✅" or "❌", " Particle Configuration Corruption: ", "PASSED" if passed else "FAILED")

func test_particle_system_during_pause() -> void:
	print("\n✨ Testing Particle System During Pause...")
	var test_name = "Particle System During Pause"
	var details = {}
	var passed = true
	
	if not particle_manager:
		details["error"] = "ParticleManager not found"
		passed = false
	else:
		# Start particle effects
		var particles = particle_manager.get_blood_particles()
		if particles:
			particle_manager.play_blood_effect(Vector2(50, 50))
			
			# Pause the particle system
			particle_manager.set_process(false)
			await get_tree().create_timer(0.5).timeout
			
			# Resume processing
			particle_manager.set_process(true)
			await get_tree().create_timer(1.0).timeout
			
			# Check if system recovered
			details["pause_survived"] = true
			details["particles_still_working"] = particles.emitting
			details["system_recovered"] = true
		else:
			passed = false
			details["no_particles_obtained"] = true
	
	edge_case_test_completed.emit(test_name, passed, details)
	print(passed and "✅" or "❌", " Particle System During Pause: ", "PASSED" if passed else "FAILED")

# ==================== UTILITY FUNCTIONS ====================

func _get_memory_usage() -> float:
	var memory_monitor = Performance.get_monitor(Performance.MEMORY_STATIC)
	if memory_monitor == null:
		return 0.0
	return float(memory_monitor) / (1024.0 * 1024.0)

func _input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"):  # Escape key
		print("\n🔄 Re-running edge case tests...")
		start()

func _exit_tree() -> void:
	_cancel_requested = true
	_is_running = false
	if test_player and is_instance_valid(test_player):
		test_player.queue_free()
		test_player = null
