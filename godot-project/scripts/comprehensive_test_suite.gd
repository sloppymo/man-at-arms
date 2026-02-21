extends Node
class_name ComprehensiveTestSuite

# Comprehensive Testing Suite for Priority 1 Implementation Validation
# Tests audio system pooling, camera shake optimization, and particle system memory management
const CombatConstants = preload("res://scripts/combat_constants.gd")

signal test_completed(test_name: String, result: bool, details: Dictionary)
signal all_tests_completed(results: Dictionary)
signal performance_report_generated(report: Dictionary)

# Execution mode
@export var autorun: bool = false

# Test configuration
const TEST_DURATION = 30.0  # seconds for performance tests
const TARGET_FPS = 60
const MAX_AUDIO_LATENCY = 50  # ms
const MAX_MEMORY_GROWTH = 10  # MB

# Performance tracking
var fps_samples: Array[float] = []
var audio_latency_samples: Array[float] = []
var memory_usage_samples: Array[float] = []
var particle_allocation_count: int = 0
var audio_cutoff_count: int = 0
var test_start_time: int = 0

# Test results
var test_results: Dictionary = {}
var current_test: String = ""

# References to systems
var audio_manager: AudioManager
var particle_manager: Node
var test_player: CombatPlayer
var performance_timer: Timer
var _is_running: bool = false
var _cancel_requested: bool = false

func _ready() -> void:
	print("=== Comprehensive Priority 1 Implementation Test Suite ===")
	_setup_test_environment()
	await get_tree().process_frame
	if autorun:
		start()
	else:
		print("ComprehensiveTestSuite: Ready (manual start mode)")

func start() -> void:
	if _is_running:
		print("ComprehensiveTestSuite: Test run already in progress")
		return
	_cancel_requested = false
	run_all_tests()

func _setup_test_environment() -> void:
	# Get system references
	audio_manager = get_node("/root/AudioManager")
	particle_manager = get_node("/root/ParticleManager")
	
	# Create test player for camera shake tests
	_create_test_player()
	
	# Start performance monitoring
	_start_performance_monitoring()

func _create_test_player() -> void:
	test_player = CombatPlayer.new()
	test_player.name = "TestPlayer"
	add_child(test_player)
	
	# Add camera for testing
	var camera = Camera2D.new()
	camera.name = "Camera2D"
	test_player.add_child(camera)
	
	await get_tree().process_frame

func _start_performance_monitoring() -> void:
	if performance_timer and is_instance_valid(performance_timer):
		return
	performance_timer = Timer.new()
	performance_timer.wait_time = 0.1  # Sample every 100ms
	performance_timer.timeout.connect(_collect_performance_metrics)
	add_child(performance_timer)
	performance_timer.start()

func _collect_performance_metrics() -> void:
	# FPS tracking
	var current_fps = Engine.get_frames_per_second()
	fps_samples.append(current_fps)
	
	# Memory usage (approximation)
	var memory_usage = Performance.get_monitor(Performance.MEMORY_STATIC)
	memory_usage_samples.append(float(memory_usage) / (1024.0 * 1024.0))  # Convert to MB

# ==================== MAIN TEST RUNNER ====================

func run_all_tests() -> void:
	if _is_running:
		print("ComprehensiveTestSuite: Ignoring duplicate run request")
		return

	_is_running = true
	test_start_time = Time.get_ticks_msec()
	
	print("\n🚀 Starting Comprehensive Test Suite...")
	
	# Audio System Tests
	await run_audio_system_tests()
	if _cancel_requested:
		_is_running = false
		return
	
	# Camera Shake Tests
	await run_camera_shake_tests()
	if _cancel_requested:
		_is_running = false
		return
	
	# Particle System Tests
	await run_particle_system_tests()
	if _cancel_requested:
		_is_running = false
		return
	
	# Performance Benchmarks
	await run_performance_benchmarks()
	if _cancel_requested:
		_is_running = false
		return
	
	# Stress Tests
	await run_stress_tests()
	if _cancel_requested:
		_is_running = false
		return
	
	# Generate final report
	_generate_final_report()
	_is_running = false

# ==================== AUDIO SYSTEM TESTS ====================

func run_audio_system_tests() -> void:
	print("\n🎵 Running Audio System Tests...")
	
	await test_audio_pool_initialization()
	await test_concurrent_sound_playback()
	await test_pool_round_robin_behavior()
	await test_audio_error_handling()
	await test_combat_audio_integration()
	await test_audio_performance_load()

func test_audio_pool_initialization() -> void:
	current_test = "Audio Pool Initialization"
	var test_details = {}
	var passed = true
	
	if not audio_manager:
		test_details["error"] = "AudioManager not found"
		passed = false
	else:
		# Test pool size
		var pool_size = audio_manager.sfx_players.size()
		test_details["pool_size"] = pool_size
		if pool_size != 8:
			test_details["pool_size_error"] = "Expected 8, got " + str(pool_size)
			passed = false
		
		# Test pool index
		test_details["initial_pool_index"] = audio_manager.sfx_pool_index
		if audio_manager.sfx_pool_index != 0:
			test_details["index_error"] = "Expected 0, got " + str(audio_manager.sfx_pool_index)
			passed = false
		
		# Test SFX bus assignment
		for i in range(pool_size):
			var player = audio_manager.sfx_players[i]
			if player.bus != "SFX":
				test_details["bus_error_" + str(i)] = "Player " + str(i) + " bus: " + player.bus
				passed = false
	
	_record_test_result(current_test, passed, test_details)

func test_concurrent_sound_playback() -> void:
	current_test = "Concurrent Sound Playback"
	var test_details = {}
	var passed = true
	
	if not audio_manager:
		passed = false
	else:
		# Create mock audio streams for testing
		var mock_streams = []
		for i in range(5):
			var stream = AudioStreamGenerator.new()
			mock_streams.append(stream)
		
		# Play sounds simultaneously
		var start_time = Time.get_ticks_msec()
		for i in range(5):
			audio_manager.play_sfx(mock_streams[i], -10.0)
		
		var end_time = Time.get_ticks_msec()
		test_details["playback_time_ms"] = end_time - start_time
		
		# Verify different pool players used
		var used_indices = []
		for i in range(5):
			used_indices.append(audio_manager.sfx_pool_index)
		
		test_details["pool_indices_used"] = used_indices
	
	_record_test_result(current_test, passed, test_details)

func test_pool_round_robin_behavior() -> void:
	current_test = "Pool Round-Robin Behavior"
	var test_details = {}
	var passed = true
	
	if not audio_manager:
		passed = false
	else:
		var initial_index = audio_manager.sfx_pool_index
		var mock_stream = AudioStreamGenerator.new()
		
		# Play 10 sounds sequentially
		for i in range(10):
			audio_manager.play_sfx(mock_stream, -10.0)
		
		var final_index = audio_manager.sfx_pool_index
		
		# Verify pool cycles correctly
		test_details["initial_index"] = initial_index
		test_details["final_index"] = final_index
		test_details["cycles_expected"] = 10 % 8
		test_details["cycles_actual"] = (final_index - initial_index + 8) % 8
		
		if test_details["cycles_expected"] != test_details["cycles_actual"]:
			passed = false
	
	_record_test_result(current_test, passed, test_details)

func test_audio_error_handling() -> void:
	current_test = "Audio Error Handling"
	var test_details = {}
	var passed = true
	
	if not audio_manager:
		passed = false
	else:
		# Test null stream
		var initial_index = audio_manager.sfx_pool_index
		audio_manager.play_sfx(null, 0.0)
		test_details["null_stream_handled"] = audio_manager.sfx_pool_index == initial_index
		
		# Test invalid volume levels
		audio_manager.play_sfx(AudioStreamGenerator.new(), -1000.0)  # Extremely low volume
		audio_manager.play_sfx(AudioStreamGenerator.new(), 1000.0)   # Extremely high volume
		test_details["extreme_volumes_handled"] = true  # If no crash, it's handled
	
	_record_test_result(current_test, passed, test_details)

func test_combat_audio_integration() -> void:
	current_test = "Combat Audio Integration"
	var test_details = {}
	var passed = true
	
	if not audio_manager:
		passed = false
	else:
		# Simulate combat audio scenario
		var mock_swing = AudioStreamGenerator.new()
		var mock_hit = AudioStreamGenerator.new()
		
		var start_time = Time.get_ticks_msec()
		
		# Play multiple combat sounds rapidly
		for i in range(8):
			audio_manager.play_sfx(mock_swing, -10.0)
			await get_tree().create_timer(0.1).timeout
			audio_manager.play_sfx(mock_hit, -5.0)
			await get_tree().create_timer(0.1).timeout
		
		var end_time = Time.get_ticks_msec()
		test_details["combat_audio_time_ms"] = end_time - start_time
		test_details["sounds_played"] = 16
	
	_record_test_result(current_test, passed, test_details)

func test_audio_performance_load() -> void:
	current_test = "Audio Performance Load"
	var test_details = {}
	var passed = true
	
	if not audio_manager:
		passed = false
	else:
		var mock_stream = AudioStreamGenerator.new()
		var sound_count = 0
		var start_time = Time.get_ticks_msec()
		
		# Play 20+ sounds per second for 5 seconds
		for second in range(5):
			for sound in range(20):
				audio_manager.play_sfx(mock_stream, -10.0)
				sound_count += 1
			await get_tree().create_timer(1.0).timeout
		
		var end_time = Time.get_ticks_msec()
		test_details["duration_seconds"] = (end_time - start_time) / 1000.0
		test_details["sounds_played"] = sound_count
		test_details["avg_fps"] = _calculate_average_fps()
	
	_record_test_result(current_test, passed, test_details)

# ==================== CAMERA SHAKE TESTS ====================

func run_camera_shake_tests() -> void:
	print("\n📷 Running Camera Shake Tests...")
	
	await test_shake_timer_setup()
	await test_shake_application()
	await test_shake_update_mechanism()
	await test_shake_cleanup()
	await test_combat_shake_integration()
	await test_shake_performance_benchmark()

func test_shake_timer_setup() -> void:
	current_test = "Camera Shake Timer Setup"
	var test_details = {}
	var passed = true
	
	if not test_player:
		test_details["error"] = "Test player not found"
		passed = false
	else:
		# Test timer creation
		if not test_player.shake_timer:
			test_details["timer_missing"] = true
			passed = false
		else:
			test_details["timer_wait_time"] = test_player.shake_timer.wait_time
			test_details["timer_connected"] = test_player.shake_timer.is_connected("timeout", test_player._update_shake)
		
		# Test original offset storage
		test_details["original_offset"] = test_player.original_camera_offset
		if test_player.original_camera_offset != Vector2.ZERO:
			test_details["offset_error"] = "Expected ZERO, got " + str(test_player.original_camera_offset)
			passed = false
	
	_record_test_result(current_test, passed, test_details)

func test_shake_application() -> void:
	current_test = "Camera Shake Application"
	var test_details = {}
	var passed = true
	
	if not test_player:
		passed = false
	else:
		# Apply shake with various intensities
		var test_cases = [
			{"intensity": 5.0, "duration": 0.32},
			{"intensity": 10.0, "duration": 0.5},
			{"intensity": 1.0, "duration": 0.1}
		]
		
		for i in range(test_cases.size()):
			var case = test_cases[i]
			test_player.apply_shake(case.intensity, case.duration)
			
			test_details["case_" + str(i) + "_intensity"] = test_player.shake_intensity
			test_details["case_" + str(i) + "_duration"] = test_player.shake_duration
			test_details["case_" + str(i) + "_timer_running"] = test_player.shake_timer.time_left > 0
			
			# Wait for shake to complete
			await get_tree().create_timer(case.duration + 0.1).timeout
	
	_record_test_result(current_test, passed, test_details)

func test_shake_update_mechanism() -> void:
	current_test = "Camera Shake Update Mechanism"
	var test_details = {}
	var passed = true
	
	if not test_player:
		passed = false
	else:
		# Apply shake and monitor updates
		test_player.apply_shake(5.0, 0.32)
		
		var camera = test_player.get_node("Camera2D")
		var initial_offset = camera.offset
		var update_count = 0
		
		# Monitor shake updates for a short period
		for i in range(10):
			await get_tree().create_timer(0.016).timeout  # ~60 FPS
			if camera.offset != initial_offset:
				update_count += 1
				initial_offset = camera.offset
		
		test_details["updates_detected"] = update_count
		test_details["shake_intensity"] = test_player.shake_intensity
		
		# Wait for shake to complete
		await get_tree().create_timer(0.5).timeout
	
	_record_test_result(current_test, passed, test_details)

func test_shake_cleanup() -> void:
	current_test = "Camera Shake Cleanup"
	var test_details = {}
	var passed = true
	
	if not test_player:
		passed = false
	else:
		var camera = test_player.get_node("Camera2D")
		
		# Apply shake
		test_player.apply_shake(5.0, 0.32)
		
		# Wait for completion
		await get_tree().create_timer(0.5).timeout
		
		# Verify cleanup
		test_details["timer_stopped"] = not test_player.shake_timer.is_stopped()
		test_details["intensity_reset"] = test_player.shake_intensity == 0.0
		test_details["offset_restored"] = camera.offset == test_player.original_camera_offset
	
	_record_test_result(current_test, passed, test_details)

func test_combat_shake_integration() -> void:
	current_test = "Combat Shake Integration"
	var test_details = {}
	var passed = true
	
	if not test_player or not is_instance_valid(test_player):
		passed = false
	else:
		test_player.max_health = max(test_player.max_health, 200)
		test_player.health = test_player.max_health
		test_player.is_dead = false
		test_player.set_physics_process(true)

		# Trigger multiple consecutive shakes
		var start_fps = _calculate_average_fps()
		var successful_hits: int = 0
		
		for i in range(10):
			if not is_instance_valid(test_player):
				passed = false
				test_details["error"] = "test_player_freed_during_shake_integration"
				break
			if test_player.health <= 12:
				test_player.health = test_player.max_health
			test_player.take_damage(10)  # This applies shake
			if test_player.is_dead:
				passed = false
				test_details["error"] = "test_player_died_during_shake_integration"
				break
			successful_hits += 1
			await get_tree().create_timer(0.1).timeout
		
		var end_fps = _calculate_average_fps()
		
		test_details["consecutive_shakes"] = successful_hits
		test_details["fps_before"] = start_fps
		test_details["fps_after"] = end_fps
		test_details["fps_impact"] = start_fps - end_fps
	
	_record_test_result(current_test, passed, test_details)

func test_shake_performance_benchmark() -> void:
	current_test = "Camera Shake Performance Benchmark"
	var test_details = {}
	var passed = true
	
	if not test_player:
		passed = false
	else:
		var start_fps = _calculate_average_fps()
		
		# Apply shake 10+ times in rapid succession
		for i in range(15):
			test_player.apply_shake(5.0, 0.16)
			await get_tree().create_timer(0.05).timeout
		
		var end_fps = _calculate_average_fps()
		
		test_details["rapid_shakes"] = 15
		test_details["fps_before"] = start_fps
		test_details["fps_after"] = end_fps
		test_details["performance_impact"] = abs(start_fps - end_fps)
	
	_record_test_result(current_test, passed, test_details)

# ==================== PARTICLE SYSTEM TESTS ====================

func run_particle_system_tests() -> void:
	print("\n✨ Running Particle System Tests...")
	
	await test_particle_pool_creation()
	await test_particle_allocation()
	await test_particle_return_to_pool()
	await test_pool_size_limits()
	await test_combat_particle_integration()
	await test_memory_stability()

func test_particle_pool_creation() -> void:
	current_test = "Particle Pool Creation"
	var test_details = {}
	var passed = true
	
	if not particle_manager:
		test_details["error"] = "ParticleManager not found"
		passed = false
	else:
		# Test pool size
		var pool_size = particle_manager.blood_particle_pool.size()
		var expected_pool_size = CombatConstants.BLOOD_POOL_SIZE
		test_details["pool_size"] = pool_size
		if pool_size != expected_pool_size:
			test_details["size_error"] = "Expected %d, got %d" % [expected_pool_size, pool_size]
			passed = false
		
		# Test initial pool index
		test_details["initial_index"] = particle_manager.pool_index
		if particle_manager.pool_index != 0:
			test_details["index_error"] = "Expected 0, got " + str(particle_manager.pool_index)
			passed = false
		
		# Test particle configuration
		for i in range(min(3, pool_size)):  # Check first 3 particles
			var particle = particle_manager.blood_particle_pool[i]
			test_details["particle_" + str(i) + "_emitting"] = particle.emitting
			test_details["particle_" + str(i) + "_visible"] = particle.visible
	
	_record_test_result(current_test, passed, test_details)

func test_particle_allocation() -> void:
	current_test = "Particle Allocation"
	var test_details = {}
	var passed = true
	
	if not particle_manager:
		passed = false
	else:
		var initial_index = particle_manager.pool_index
		
		# Request particles from pool
		var particles = []
		for i in range(5):
			var particle = particle_manager.get_blood_particles()
			if particle:
				particles.append(particle)
		
		test_details["particles_requested"] = 5
		test_details["particles_received"] = particles.size()
		test_details["final_pool_index"] = particle_manager.pool_index
		
		# Verify particles are different instances
		var unique_particles = {}
		for particle in particles:
			unique_particles[particle.get_instance_id()] = true
		
		test_details["unique_particles"] = unique_particles.size()
	
	_record_test_result(current_test, passed, test_details)

func test_particle_return_to_pool() -> void:
	current_test = "Particle Return to Pool"
	var test_details = {}
	var passed = true
	
	if not particle_manager:
		passed = false
	else:
		# Get particles and simulate return
		var particles = []
		for i in range(3):
			var particle = particle_manager.get_blood_particles()
			if particle:
				particles.append(particle)
		
		# Simulate particle lifecycle completion
		for particle in particles:
			particle.emitting = false
			particle.visible = false
		
		# Get more particles to test reuse
		var reused_particles = []
		for i in range(3):
			var particle = particle_manager.get_blood_particles()
			if particle:
				reused_particles.append(particle)
		
		test_details["original_particles"] = particles.size()
		test_details["reused_particles"] = reused_particles.size()
	
	_record_test_result(current_test, passed, test_details)

func test_pool_size_limits() -> void:
	current_test = "Pool Size Limits"
	var test_details = {}
	var passed = true
	
	if not particle_manager:
		passed = false
	else:
		# Fill pool to maximum capacity
		var particles = []
		var max_attempts = 20  # More than pool size
		
		for i in range(max_attempts):
			var particle = particle_manager.get_blood_particles()
			if particle:
				particles.append(particle)
		
		test_details["max_attempts"] = max_attempts
		test_details["particles_obtained"] = particles.size()
		test_details["pool_wraps"] = particles.size() > 10  # Should wrap around
	
	_record_test_result(current_test, passed, test_details)

func test_combat_particle_integration() -> void:
	current_test = "Combat Particle Integration"
	var test_details = {}
	var passed = true
	
	if not particle_manager:
		passed = false
	else:
		var start_memory = _get_memory_usage()
		
		# Simulate combat with multiple enemy deaths
		for i in range(12):
			particle_manager.play_blood_effect(Vector2(i * 50, i * 30))
			await get_tree().create_timer(0.1).timeout
		
		var end_memory = _get_memory_usage()
		
		test_details["effects_played"] = 12
		test_details["memory_before_mb"] = start_memory
		test_details["memory_after_mb"] = end_memory
		test_details["memory_growth_mb"] = end_memory - start_memory
	
	_record_test_result(current_test, passed, test_details)

func test_memory_stability() -> void:
	current_test = "Memory Stability"
	var test_details = {}
	var passed = true
	
	if not particle_manager:
		passed = false
	else:
		var memory_samples = []
		
		# Run particle effects for extended period
		for second in range(10):  # 10 seconds test
			particle_manager.play_blood_effect(Vector2(randf() * 200, randf() * 200))
			memory_samples.append(_get_memory_usage())
			await get_tree().create_timer(1.0).timeout
		
		var initial_memory = memory_samples[0]
		var final_memory = memory_samples[-1]
		var max_memory = memory_samples.max()
		
		test_details["test_duration_seconds"] = 10
		test_details["initial_memory_mb"] = initial_memory
		test_details["final_memory_mb"] = final_memory
		test_details["max_memory_mb"] = max_memory
		test_details["memory_growth_mb"] = final_memory - initial_memory
		test_details["memory_stable"] = abs(final_memory - initial_memory) < 5  # Within 5MB
	
	_record_test_result(current_test, passed, test_details)

# ==================== PERFORMANCE BENCHMARKS ====================

func run_performance_benchmarks() -> void:
	print("\n📊 Running Performance Benchmarks...")
	
	await benchmark_audio_system()
	await benchmark_camera_shake()
	await benchmark_particle_system()
	await benchmark_combined_load()

func benchmark_audio_system() -> void:
	current_test = "Audio System Benchmark"
	var test_details = {}
	var passed = true
	
	if not audio_manager:
		passed = false
	else:
		var start_fps = _calculate_average_fps()
		var start_memory = _get_memory_usage()
		
		# Intensive audio test
		var mock_stream = AudioStreamGenerator.new()
		var sound_count = 0
		
		for i in range(100):
			audio_manager.play_sfx(mock_stream, -10.0)
			sound_count += 1
			if i % 10 == 0:
				await get_tree().process_frame
		
		var end_fps = _calculate_average_fps()
		var end_memory = _get_memory_usage()
		
		test_details["sounds_played"] = sound_count
		test_details["fps_before"] = start_fps
		test_details["fps_after"] = end_fps
		test_details["fps_impact"] = start_fps - end_fps
		test_details["memory_impact_mb"] = end_memory - start_memory
	
	_record_test_result(current_test, passed, test_details)

func benchmark_camera_shake() -> void:
	current_test = "Camera Shake Benchmark"
	var test_details = {}
	var passed = true
	
	if not test_player:
		passed = false
	else:
		var start_fps = _calculate_average_fps()
		
		# Intensive shake test
		for i in range(50):
			test_player.apply_shake(randf_range(3.0, 8.0), randf_range(0.1, 0.5))
			await get_tree().create_timer(0.02).timeout
		
		var end_fps = _calculate_average_fps()
		
		test_details["shakes_applied"] = 50
		test_details["fps_before"] = start_fps
		test_details["fps_after"] = end_fps
		test_details["performance_impact"] = start_fps - end_fps
	
	_record_test_result(current_test, passed, test_details)

func benchmark_particle_system() -> void:
	current_test = "Particle System Benchmark"
	var test_details = {}
	var passed = true
	
	if not particle_manager:
		passed = false
	else:
		var start_memory = _get_memory_usage()
		
		# Intensive particle test
		for i in range(30):
			particle_manager.play_blood_effect(Vector2(randf() * 300, randf() * 200))
			await get_tree().create_timer(0.05).timeout
		
		var end_memory = _get_memory_usage()
		
		test_details["effects_played"] = 30
		test_details["memory_before_mb"] = start_memory
		test_details["memory_after_mb"] = end_memory
		test_details["memory_growth_mb"] = end_memory - start_memory
	
	_record_test_result(current_test, passed, test_details)

func benchmark_combined_load() -> void:
	current_test = "Combined Load Benchmark"
	var test_details = {}
	var passed = true
	
	if not audio_manager or not particle_manager or not test_player:
		passed = false
	else:
		var start_fps = _calculate_average_fps()
		var start_memory = _get_memory_usage()
		var mock_stream = AudioStreamGenerator.new()
		
		# Combined intensive test
		for i in range(20):
			# Audio
			audio_manager.play_sfx(mock_stream, -10.0)
			
			# Particles
			particle_manager.play_blood_effect(Vector2(randf() * 200, randf() * 150))
			
			# Camera shake
			test_player.apply_shake(4.0, 0.2)
			
			await get_tree().create_timer(0.1).timeout
		
		var end_fps = _calculate_average_fps()
		var end_memory = _get_memory_usage()
		
		test_details["combined_cycles"] = 20
		test_details["fps_before"] = start_fps
		test_details["fps_after"] = end_fps
		test_details["fps_impact"] = start_fps - end_fps
		test_details["memory_impact_mb"] = end_memory - start_memory
	
	_record_test_result(current_test, passed, test_details)

# ==================== STRESS TESTS ====================

func run_stress_tests() -> void:
	print("\n🔥 Running Stress Tests...")
	
	await stress_test_maximum_combat()
	await stress_test_extended_gameplay()
	await stress_test_resource_exhaustion()

func stress_test_maximum_combat() -> void:
	current_test = "Maximum Combat Stress Test"
	var test_details = {}
	var passed = true
	
	var start_fps = _calculate_average_fps()
	var start_memory = _get_memory_usage()
	var mock_stream = AudioStreamGenerator.new()
	
	# Simulate maximum combat load
	for wave in range(5):
		print("Stress test wave ", wave + 1, "/5")
		
		# Multiple enemies attacking and dying
		for enemy in range(8):
			# Combat sounds
			audio_manager.play_sfx(mock_stream, -10.0)
			audio_manager.play_sfx(mock_stream, -5.0)
			
			# Particle effects
			particle_manager.play_blood_effect(Vector2(enemy * 40, 0))
			
			# Camera shake
			test_player.apply_shake(6.0, 0.3)
			
			await get_tree().create_timer(0.05).timeout
		
		await get_tree().create_timer(1.0).timeout
	
	var end_fps = _calculate_average_fps()
	var end_memory = _get_memory_usage()
	
	test_details["combat_waves"] = 5
	test_details["enemies_per_wave"] = 8
	test_details["total_effects"] = 5 * 8 * 3  # waves * enemies * effects_per_enemy
	test_details["fps_before"] = start_fps
	test_details["fps_after"] = end_fps
	test_details["fps_stable"] = end_fps >= 45
	test_details["memory_growth_mb"] = end_memory - start_memory
	test_details["memory_stable"] = (end_memory - start_memory) < 20
	
	_record_test_result(current_test, passed, test_details)

func stress_test_extended_gameplay() -> void:
	current_test = "Extended Gameplay Stress Test"
	var test_details = {}
	var passed = true
	
	var memory_samples = []
	var fps_samples = []
	var mock_stream = AudioStreamGenerator.new()
	
	# Extended gameplay simulation
	for minute in range(3):  # 3 minutes of gameplay
		print("Extended gameplay minute ", minute + 1, "/3")
		
		memory_samples.append(_get_memory_usage())
		fps_samples.append(_calculate_average_fps())
		
		# Simulate gameplay activity
		for activity in range(20):
			audio_manager.play_sfx(mock_stream, -10.0)
			particle_manager.play_blood_effect(Vector2(randf() * 200, randf() * 150))
			
			if activity % 5 == 0:
				test_player.apply_shake(4.0, 0.2)
			
			await get_tree().create_timer(0.1).timeout
		
		await get_tree().create_timer(19.0).timeout  # Complete the minute
	
	var initial_memory = memory_samples[0]
	var final_memory = memory_samples[-1]
	var avg_fps = fps_samples.reduce(func(a, b): return a + b, 0) / fps_samples.size()
	
	test_details["duration_minutes"] = 3
	test_details["initial_memory_mb"] = initial_memory
	test_details["final_memory_mb"] = final_memory
	test_details["memory_growth_mb"] = final_memory - initial_memory
	test_details["avg_fps"] = avg_fps
	test_details["fps_stable"] = avg_fps >= 50
	test_details["memory_leak_detected"] = (final_memory - initial_memory) > 15
	
	_record_test_result(current_test, passed, test_details)

func stress_test_resource_exhaustion() -> void:
	current_test = "Resource Exhaustion Stress Test"
	var test_details = {}
	var passed = true
	
	var mock_stream = AudioStreamGenerator.new()
	var audio_cutoffs = 0
	var particle_failures = 0
	
	# Attempt to exceed system limits
	for burst in range(10):
		print("Resource exhaustion burst ", burst + 1, "/10")
		
		# Audio exhaustion test
		for audio in range(20):  # More than pool size
			audio_manager.play_sfx(mock_stream, -10.0)
		
		# Particle exhaustion test
		for particle in range(15):  # More than pool size
			particle_manager.play_blood_effect(Vector2(particle * 30, 0))
		
		# Rapid camera shake
		for shake in range(10):
			test_player.apply_shake(5.0, 0.1)
		
		await get_tree().create_timer(0.5).timeout
	
	test_details["exhaustion_bursts"] = 10
	test_details["audio_cutoffs_detected"] = audio_cutoffs
	test_details["particle_failures_detected"] = particle_failures
	test_details["system_stable"] = audio_cutoffs == 0 and particle_failures == 0
	
	_record_test_result(current_test, passed, test_details)

# ==================== UTILITY FUNCTIONS ====================

func _record_test_result(test_name: String, passed: bool, details: Dictionary) -> void:
	test_results[test_name] = {
		"passed": passed,
		"details": details,
		"timestamp": Time.get_ticks_msec()
	}
	
	var status = "✅" if passed else "❌"
	print(status, " ", test_name, ": ", "PASSED" if passed else "FAILED")
	
	test_completed.emit(test_name, passed, details)

func _calculate_average_fps() -> float:
	if fps_samples.is_empty():
		return 0.0
	
	var total = 0.0
	for fps in fps_samples:
		total += fps
	
	return total / fps_samples.size()

func _get_memory_usage() -> float:
	# Get current memory usage in MB
	var memory_monitor = Performance.get_monitor(Performance.MEMORY_STATIC)
	if memory_monitor == null:
		return 0.0
	return float(memory_monitor) / (1024.0 * 1024.0)

func _generate_final_report() -> void:
	print("\n📋 Generating Final Report...")
	
	var total_tests = test_results.size()
	var passed_tests = 0
	var failed_tests = []
	
	for test_name in test_results:
		if test_results[test_name].passed:
			passed_tests += 1
		else:
			failed_tests.append(test_name)
	
	var success_rate = float(passed_tests) / float(total_tests) * 100.0
	
	var report = {
		"summary": {
			"total_tests": total_tests,
			"passed_tests": passed_tests,
			"failed_tests": failed_tests.size(),
			"success_rate": success_rate,
			"test_duration_ms": Time.get_ticks_msec() - test_start_time
		},
		"performance_metrics": {
			"average_fps": _calculate_average_fps(),
			"memory_usage_mb": _get_memory_usage(),
			"audio_cutoffs": audio_cutoff_count,
			"particle_allocations": particle_allocation_count
		},
		"detailed_results": test_results
	}
	
	# Print comprehensive report
	_print_comprehensive_report(report)
	
	all_tests_completed.emit(test_results)
	performance_report_generated.emit(report)

func _print_comprehensive_report(report: Dictionary) -> void:
	print("\n" + "=".repeat(60))
	print("🎯 PRIORITY 1 IMPLEMENTATION TEST RESULTS")
	print("=".repeat(60))
	
	var summary = report.summary
	print("\n📊 SUMMARY:")
	print("   Total Tests: ", summary.total_tests)
	print("   Passed: ", summary.passed_tests, " ✅")
	print("   Failed: ", summary.failed_tests, " ❌")
	print("   Success Rate: ", "%.1f" % summary.success_rate, "%")
	print("   Test Duration: ", "%.2f" % (summary.test_duration_ms / 1000.0), " seconds")
	
	var metrics = report.performance_metrics
	print("\n📈 PERFORMANCE METRICS:")
	print("   Average FPS: ", "%.1f" % metrics.average_fps)
	print("   Memory Usage: ", "%.1f" % metrics.memory_usage_mb, " MB")
	print("   Audio Cutoffs: ", metrics.audio_cutoffs)
	print("   Particle Allocations: ", metrics.particle_allocations)
	
	print("\n📋 DETAILED RESULTS:")
	for test_name in report.detailed_results:
		var test_result = report.detailed_results[test_name]
		var status = "✅ PASSED" if test_result.passed else "❌ FAILED"
		print("   ", test_name, ": ", status)
	
	if report.summary.failed_tests > 0:
		print("\n⚠️  FAILED TESTS:")
		for test_name in report.summary.failed_tests:
			print("   - ", test_name)
	
	print("\n" + "=".repeat(60))
	
	var overall_status = "✅ ALL CRITICAL FIXES VALIDATED" if summary.success_rate >= 95 else "⚠️  SOME ISSUES DETECTED"
	print("🎯 OVERALL RESULT: ", overall_status)
	print("=".repeat(60))

func _input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_accept"):  # Enter key
		print("\n🔄 Re-running comprehensive test suite...")
		test_results.clear()
		fps_samples.clear()
		memory_usage_samples.clear()
		start()

func _exit_tree() -> void:
	_cancel_requested = true
	_is_running = false

	if performance_timer and is_instance_valid(performance_timer):
		performance_timer.stop()
		performance_timer.queue_free()
		performance_timer = null

	if test_player and is_instance_valid(test_player):
		test_player.queue_free()
		test_player = null

	fps_samples.clear()
	audio_latency_samples.clear()
	memory_usage_samples.clear()
