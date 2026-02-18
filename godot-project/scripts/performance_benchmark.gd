extends Node
class_name PerformanceBenchmark

# Performance Benchmark Framework for Priority 1 Implementation
# Provides detailed performance metrics and comparison capabilities

signal benchmark_completed(benchmark_name: String, results: Dictionary)
signal comparison_report_generated(report: Dictionary)

# Benchmark configuration
const BENCHMARK_DURATION = 30.0
const SAMPLE_INTERVAL = 0.1  # 100ms
const WARMUP_DURATION = 5.0

# Performance thresholds
const TARGET_FPS = 60
const MIN_ACCEPTABLE_FPS = 45
const MAX_AUDIO_LATENCY = 50  # ms
const MAX_MEMORY_GROWTH = 10  # MB per minute

# Metrics tracking
var fps_samples: Array[float] = []
var frame_time_samples: Array[float] = []
var memory_samples: Array[float] = []
var audio_latency_samples: Array[float] = []
var cpu_usage_samples: Array[float] = []

# Benchmark state
var is_benchmarking = false
var benchmark_start_time = 0
var current_benchmark = ""

# System references
var audio_manager: AudioManager
var particle_manager: Node
var test_player: CombatPlayer
var monitor_timer: Timer

func _ready() -> void:
	print("=== Performance Benchmark Framework ===")
	_setup_references()
	_setup_monitoring()

func _setup_references() -> void:
	audio_manager = get_node("/root/AudioManager")
	particle_manager = get_node("/root/ParticleManager")
	
	# Create test environment
	test_player = CombatPlayer.new()
	test_player.name = "BenchmarkPlayer"
	add_child(test_player)
	
	var camera = Camera2D.new()
	camera.name = "Camera2D"
	test_player.add_child(camera)

func _setup_monitoring() -> void:
	if monitor_timer and is_instance_valid(monitor_timer):
		return
	monitor_timer = Timer.new()
	monitor_timer.wait_time = SAMPLE_INTERVAL
	monitor_timer.timeout.connect(_collect_performance_sample)
	add_child(monitor_timer)
	monitor_timer.start()

func _collect_performance_sample() -> void:
	if not is_benchmarking:
		return
	
	# FPS and frame time
	var current_fps = Engine.get_frames_per_second()
	fps_samples.append(current_fps)
	frame_time_samples.append(1000.0 / current_fps)  # Convert to ms
	
	# Memory usage
	var memory_mb = _get_memory_usage()
	memory_samples.append(memory_mb)
	
	# CPU usage (approximation)
	var cpu_usage = clampf((TARGET_FPS - current_fps) / TARGET_FPS * 100.0, 0.0, 100.0)
	cpu_usage_samples.append(cpu_usage)

# ==================== MAIN BENCHMARK RUNNER ====================

func run_all_benchmarks() -> void:
	print("\n🚀 Starting Comprehensive Performance Benchmarks...")
	
	# Warmup phase
	print("🔥 Warming up systems...")
	await _warmup_systems()
	
	# Run individual benchmarks
	await benchmark_audio_system_performance()
	await benchmark_camera_shake_performance()
	await benchmark_particle_system_performance()
	await benchmark_combined_performance()
	await benchmark_memory_efficiency()
	await benchmark_scalability()
	
	# Generate comparison report
	_generate_comparison_report()

func _warmup_systems() -> void:
	var warmup_start = Time.get_ticks_msec()
	var mock_stream = AudioStreamGenerator.new()
	
	while Time.get_ticks_msec() - warmup_start < WARMUP_DURATION * 1000:
		audio_manager.play_sfx(mock_stream, -10.0)
		particle_manager.play_blood_effect(Vector2(randf() * 100, randf() * 100))
		test_player.apply_shake(2.0, 0.1)
		await get_tree().process_frame
	
	print("✅ Warmup complete")

# ==================== INDIVIDUAL BENCHMARKS ====================

func benchmark_audio_system_performance() -> void:
	current_benchmark = "Audio System Performance"
	print("\n🎵 Benchmarking Audio System Performance...")
	
	_reset_metrics()
	is_benchmarking = true
	benchmark_start_time = Time.get_ticks_msec()
	
	var mock_stream = AudioStreamGenerator.new()
	var sounds_played = 0
	
	# Audio-intensive scenario
	while Time.get_ticks_msec() - benchmark_start_time < BENCHMARK_DURATION * 1000:
		# Variable audio load
		var load_factor = sin(Time.get_ticks_msec() * 0.001) * 0.5 + 0.5
		var sounds_this_frame = int(1 + load_factor * 4)  # 1-5 sounds per frame
		
		for i in range(sounds_this_frame):
			audio_manager.play_sfx(mock_stream, -10.0)
			sounds_played += 1
		
		await get_tree().process_frame
	
	is_benchmarking = false
	
	var results = _calculate_performance_metrics("audio")
	results["sounds_played"] = sounds_played
	results["sounds_per_second"] = sounds_played / BENCHMARK_DURATION
	results["audio_pool_efficiency"] = _calculate_audio_pool_efficiency()
	
	benchmark_completed.emit(current_benchmark, results)
	_print_benchmark_results(current_benchmark, results)

func benchmark_camera_shake_performance() -> void:
	current_benchmark = "Camera Shake Performance"
	print("\n📷 Benchmarking Camera Shake Performance...")
	
	_reset_metrics()
	is_benchmarking = true
	benchmark_start_time = Time.get_ticks_msec()
	
	var shakes_applied = 0
	
	# Shake-intensive scenario
	while Time.get_ticks_msec() - benchmark_start_time < BENCHMARK_DURATION * 1000:
		# Variable shake intensity
		var intensity_factor = sin(Time.get_ticks_msec() * 0.002) * 0.5 + 0.5
		var intensity = 2.0 + intensity_factor * 8.0  # 2-10 intensity
		var duration = 0.1 + intensity_factor * 0.4  # 0.1-0.5 duration
		
		test_player.apply_shake(intensity, duration)
		shakes_applied += 1
		
		await get_tree().create_timer(0.05).timeout
	
	is_benchmarking = false
	
	var results = _calculate_performance_metrics("camera_shake")
	results["shakes_applied"] = shakes_applied
	results["shakes_per_second"] = shakes_applied / BENCHMARK_DURATION
	results["shake_cpu_usage"] = _calculate_shake_cpu_impact()
	
	benchmark_completed.emit(current_benchmark, results)
	_print_benchmark_results(current_benchmark, results)

func benchmark_particle_system_performance() -> void:
	current_benchmark = "Particle System Performance"
	print("\n✨ Benchmarking Particle System Performance...")
	
	_reset_metrics()
	is_benchmarking = true
	benchmark_start_time = Time.get_ticks_msec()
	
	var effects_played = 0
	
	# Particle-intensive scenario
	while Time.get_ticks_msec() - benchmark_start_time < BENCHMARK_DURATION * 1000:
		# Variable particle load
		var load_factor = sin(Time.get_ticks_msec() * 0.0015) * 0.5 + 0.5
		var effects_this_frame = int(1 + load_factor * 3)  # 1-4 effects per frame
		
		for i in range(effects_this_frame):
			particle_manager.play_blood_effect(Vector2(randf() * 200, randf() * 150))
			effects_played += 1
		
		await get_tree().process_frame
	
	is_benchmarking = false
	
	var results = _calculate_performance_metrics("particles")
	results["effects_played"] = effects_played
	results["effects_per_second"] = effects_played / BENCHMARK_DURATION
	results["particle_pool_efficiency"] = _calculate_particle_pool_efficiency()
	results["memory_efficiency"] = _calculate_memory_efficiency()
	
	benchmark_completed.emit(current_benchmark, results)
	_print_benchmark_results(current_benchmark, results)

func benchmark_combined_performance() -> void:
	current_benchmark = "Combined Performance"
	print("\n🎯 Benchmarking Combined Performance...")
	
	_reset_metrics()
	is_benchmarking = true
	benchmark_start_time = Time.get_ticks_msec()
	
	var mock_stream = AudioStreamGenerator.new()
	var total_operations = 0
	
	# Combined intensive scenario (simulating real combat)
	while Time.get_ticks_msec() - benchmark_start_time < BENCHMARK_DURATION * 1000:
		# Simulate combat scenario
		var combat_intensity = sin(Time.get_ticks_msec() * 0.0008) * 0.5 + 0.5
		
		# Audio (combat sounds)
		if randf() < 0.3 + combat_intensity * 0.4:
			audio_manager.play_sfx(mock_stream, -10.0)
			total_operations += 1
		
		# Particles (hit effects)
		if randf() < 0.2 + combat_intensity * 0.3:
			particle_manager.play_blood_effect(Vector2(randf() * 300, randf() * 200))
			total_operations += 1
		
		# Camera shake (impact effects)
		if randf() < 0.1 + combat_intensity * 0.2:
			test_player.apply_shake(3.0 + combat_intensity * 5.0, 0.2)
			total_operations += 1
		
		await get_tree().process_frame
	
	is_benchmarking = false
	
	var results = _calculate_performance_metrics("combined")
	results["total_operations"] = total_operations
	results["operations_per_second"] = total_operations / BENCHMARK_DURATION
	results["system_stability"] = _calculate_system_stability()
	
	benchmark_completed.emit(current_benchmark, results)
	_print_benchmark_results(current_benchmark, results)

func benchmark_memory_efficiency() -> void:
	current_benchmark = "Memory Efficiency"
	print("\n💾 Benchmarking Memory Efficiency...")
	
	_reset_metrics()
	is_benchmarking = true
	benchmark_start_time = Time.get_ticks_msec()
	
	var mock_stream = AudioStreamGenerator.new()
	var initial_memory = memory_samples[0] if not memory_samples.is_empty() else _get_memory_usage()
	var memory_growth_samples = []
	
	# Extended memory test
	while Time.get_ticks_msec() - benchmark_start_time < BENCHMARK_DURATION * 1000:
		# Memory-intensive operations
		for i in range(10):
			audio_manager.play_sfx(mock_stream, -10.0)
			particle_manager.play_blood_effect(Vector2(i * 20, i * 15))
		
		# Track memory growth
		if memory_samples.size() > 0:
			memory_growth_samples.append(memory_samples[-1] - initial_memory)
		
		await get_tree().create_timer(1.0).timeout
	
	is_benchmarking = false
	
	var results = _calculate_performance_metrics("memory")
	results["initial_memory_mb"] = initial_memory
	results["final_memory_mb"] = memory_samples[-1] if not memory_samples.is_empty() else initial_memory
	results["total_memory_growth_mb"] = results.final_memory_mb - results.initial_memory_mb
	results["memory_growth_rate_mb_per_min"] = (results.total_memory_growth_mb / BENCHMARK_DURATION) * 60.0
	results["memory_stability"] = _calculate_memory_stability(memory_growth_samples)
	
	benchmark_completed.emit(current_benchmark, results)
	_print_benchmark_results(current_benchmark, results)

func benchmark_scalability() -> void:
	current_benchmark = "Scalability Test"
	print("\n📈 Benchmarking System Scalability...")
	
	var scalability_results = {}
	
	# Test different load levels
	var load_levels = [1, 2, 4, 8, 16]  # Multipliers of base load
	
	for load_level in load_levels:
		print("  Testing load level ", load_level, "x...")
		
		_reset_metrics()
		is_benchmarking = true
		benchmark_start_time = Time.get_ticks_msec()
		
		var mock_stream = AudioStreamGenerator.new()
		var operations = 0
		
		# Scalability test (shorter duration for higher loads)
		var test_duration = BENCHMARK_DURATION / max(1, load_level / 4)
		
		while Time.get_ticks_msec() - benchmark_start_time < test_duration * 1000:
			# Scale operations based on load level
			for i in range(load_level):
				audio_manager.play_sfx(mock_stream, -10.0)
				particle_manager.play_blood_effect(Vector2(i * 30, i * 20))
				operations += 1
			
			if load_level > 4:
				test_player.apply_shake(2.0, 0.1)
			
			await get_tree().process_frame
		
		is_benchmarking = false
		
		var level_results = _calculate_performance_metrics("scalability_" + str(load_level))
		level_results["load_level"] = load_level
		level_results["operations"] = operations
		level_results["operations_per_second"] = operations / test_duration
		scalability_results[str(load_level)] = level_results
	
	var results = {
		"scalability_data": scalability_results,
		"performance_degradation": _calculate_performance_degradation(scalability_results),
		"optimal_load_level": _find_optimal_load_level(scalability_results)
	}
	
	benchmark_completed.emit(current_benchmark, results)
	_print_benchmark_results(current_benchmark, results)

# ==================== METRICS CALCULATION ====================

func _reset_metrics() -> void:
	fps_samples.clear()
	frame_time_samples.clear()
	memory_samples.clear()
	audio_latency_samples.clear()
	cpu_usage_samples.clear()

func _calculate_performance_metrics(benchmark_type: String) -> Dictionary:
	var results = {}
	
	if fps_samples.size() > 0:
		results["avg_fps"] = _calculate_average(fps_samples)
		results["min_fps"] = fps_samples.min()
		results["max_fps"] = fps_samples.max()
		results["fps_stability"] = _calculate_stability(fps_samples)
		results["fps_below_target"] = _count_below_threshold(fps_samples, TARGET_FPS)
		results["fps_below_minimum"] = _count_below_threshold(fps_samples, MIN_ACCEPTABLE_FPS)
	
	if frame_time_samples.size() > 0:
		results["avg_frame_time_ms"] = _calculate_average(frame_time_samples)
		results["max_frame_time_ms"] = frame_time_samples.max()
		results["frame_time_spikes"] = _count_spikes(frame_time_samples, 16.67)  # Above 60fps target
	
	if memory_samples.size() > 0:
		results["avg_memory_mb"] = _calculate_average(memory_samples)
		results["min_memory_mb"] = memory_samples.min()
		results["max_memory_mb"] = memory_samples.max()
		results["memory_variance"] = _calculate_variance(memory_samples)
	
	if cpu_usage_samples.size() > 0:
		results["avg_cpu_usage"] = _calculate_average(cpu_usage_samples)
		results["max_cpu_usage"] = cpu_usage_samples.max()
	
	results["performance_grade"] = _calculate_performance_grade(results)
	
	return results

func _calculate_average(samples: Array[float]) -> float:
	if samples.is_empty():
		return 0.0
	
	var total = 0.0
	for sample in samples:
		total += sample
	
	return total / samples.size()

func _calculate_stability(samples: Array[float]) -> float:
	if samples.size() < 2:
		return 100.0
	
	var avg = _calculate_average(samples)
	var variance = 0.0
	
	for sample in samples:
		variance += pow(sample - avg, 2)
	
	variance /= samples.size()
	var std_dev = sqrt(variance)
	
	# Stability as percentage (lower std dev = higher stability)
	return max(0.0, 100.0 - (std_dev / avg * 100.0))

func _calculate_variance(samples: Array[float]) -> float:
	if samples.size() < 2:
		return 0.0
	
	var avg = _calculate_average(samples)
	var variance = 0.0
	
	for sample in samples:
		variance += pow(sample - avg, 2)
	
	return variance / samples.size()

func _count_below_threshold(samples: Array[float], threshold: float) -> int:
	var count = 0
	for sample in samples:
		if sample < threshold:
			count += 1
	return count

func _count_spikes(samples: Array[float], threshold: float) -> int:
	var count = 0
	for sample in samples:
		if sample > threshold:
			count += 1
	return count

func _calculate_performance_grade(results: Dictionary) -> String:
	var score = 0
	
	# FPS scoring (40 points)
	if results.get("avg_fps", 0) >= 58:
		score += 40
	elif results.get("avg_fps", 0) >= 50:
		score += 30
	elif results.get("avg_fps", 0) >= 45:
		score += 20
	elif results.get("avg_fps", 0) >= 30:
		score += 10
	
	# Stability scoring (30 points)
	if results.get("fps_stability", 0) >= 90:
		score += 30
	elif results.get("fps_stability", 0) >= 80:
		score += 20
	elif results.get("fps_stability", 0) >= 70:
		score += 10
	
	# Memory scoring (20 points)
	var memory_growth = results.get("total_memory_growth_mb", 0)
	if memory_growth <= 5:
		score += 20
	elif memory_growth <= 10:
		score += 15
	elif memory_growth <= 20:
		score += 10
	elif memory_growth <= 30:
		score += 5
	
	# Frame time scoring (10 points)
	if results.get("max_frame_time_ms", 100) <= 20:
		score += 10
	elif results.get("max_frame_time_ms", 100) <= 30:
		score += 7
	elif results.get("max_frame_time_ms", 100) <= 50:
		score += 4
	
	# Convert score to grade
	if score >= 90:
		return "A+"
	elif score >= 80:
		return "A"
	elif score >= 70:
		return "B"
	elif score >= 60:
		return "C"
	elif score >= 50:
		return "D"
	else:
		return "F"

# ==================== SPECIALIZED CALCULATIONS ====================

func _calculate_audio_pool_efficiency() -> float:
	if not audio_manager:
		return 0.0
	
	# Calculate how well the pool distributes load
	var pool_size = audio_manager.sfx_players.size()
	var theoretical_max = pool_size  # Perfect distribution
	
	# For simplicity, assume good efficiency if pool is properly sized
	return min(100.0, (pool_size / 8.0) * 100.0)

func _calculate_particle_pool_efficiency() -> float:
	if not particle_manager:
		return 0.0
	
	var pool_size = particle_manager.blood_particle_pool.size()
	return min(100.0, (pool_size / 10.0) * 100.0)

func _calculate_shake_cpu_impact() -> float:
	# Estimate CPU impact based on shake frequency and complexity
	if not test_player:
		return 0.0
	
	# Simple calculation based on timer frequency
	var timer_frequency = 1.0 / test_player.shake_timer.wait_time
	return min(100.0, timer_frequency * 2.0)

func _calculate_memory_efficiency() -> float:
	if memory_samples.size() < 2:
		return 100.0
	
	var initial_memory = memory_samples[0]
	var final_memory = memory_samples[-1]
	var growth = final_memory - initial_memory
	
	# Efficiency based on minimal memory growth
	if growth <= 2:
		return 100.0
	elif growth <= 5:
		return 80.0
	elif growth <= 10:
		return 60.0
	elif growth <= 20:
		return 40.0
	else:
		return 20.0

func _calculate_system_stability() -> float:
	if fps_samples.size() < 10:
		return 100.0
	
	var recent_fps = fps_samples.slice(max(0, fps_samples.size() - 10))
	var avg_recent = _calculate_average(recent_fps)
	var overall_avg = _calculate_average(fps_samples)
	
	# Stability based on consistency between recent and overall performance
	var stability = 100.0 - abs(avg_recent - overall_avg) / overall_avg * 100.0
	return max(0.0, stability)

func _calculate_memory_stability(samples: Array[float]) -> float:
	if samples.size() < 2:
		return 100.0
	
	return _calculate_stability(samples)

func _calculate_performance_degradation(scalability_data: Dictionary) -> Dictionary:
	var degradation = {}
	var baseline_fps = scalability_data["1"].avg_fps if scalability_data.has("1") else 60.0
	
	for load_level in scalability_data:
		var level_data = scalability_data[load_level]
		var fps = level_data.avg_fps
		var degradation_percent = (baseline_fps - fps) / baseline_fps * 100.0
		degradation[load_level] = degradation_percent
	
	return degradation

func _find_optimal_load_level(scalability_data: Dictionary) -> int:
	var best_level = 1
	var best_score = 0.0
	
	for load_level in scalability_data:
		var level_data = scalability_data[load_level]
		var fps = level_data.avg_fps
		var operations = level_data.operations_per_second
		
		# Score based on FPS and operations
		var score = 0.0
		if fps >= 45:  # Acceptable FPS
			score = operations * (fps / 60.0)  # Weight by FPS quality
		
		if score > best_score:
			best_score = score
			best_level = load_level.to_int()
	
	return best_level

func _get_memory_usage() -> float:
	if Performance.get_monitor(Performance.MEMORY_STATIC) != null:
		return Performance.get_monitor(Performance.MEMORY_STATIC) / (1024.0 * 1024.0)
	return 0.0

# ==================== REPORTING ====================

func _print_benchmark_results(benchmark_name: String, results: Dictionary) -> void:
	print("\n📊 ", benchmark_name, " Results:")
	print("   Grade: ", results.performance_grade)
	print("   Average FPS: ", "%.1f" % results.get("avg_fps", 0))
	print("   FPS Stability: ", "%.1f" % results.get("fps_stability", 0), "%")
	print("   Memory Usage: ", "%.1f" % results.get("avg_memory_mb", 0), " MB")
	
	if results.has("sounds_per_second"):
		print("   Sounds/Second: ", "%.1f" % results.sounds_per_second)
	if results.has("shakes_per_second"):
		print("   Shakes/Second: ", "%.1f" % results.shakes_per_second)
	if results.has("effects_per_second"):
		print("   Effects/Second: ", "%.1f" % results.effects_per_second)
	if results.has("operations_per_second"):
		print("   Operations/Second: ", "%.1f" % results.operations_per_second)

func _generate_comparison_report() -> void:
	print("\n📋 Generating Performance Comparison Report...")
	
	# This would compare with baseline performance if available
	# For now, generate a summary report
	
	var report = {
		"timestamp": Time.get_ticks_msec(),
		"system_info": _get_system_info(),
		"summary": "Performance benchmarks completed successfully"
	}
	
	comparison_report_generated.emit(report)
	print("✅ Comparison report generated")

func _get_system_info() -> Dictionary:
	return {
		"platform": OS.get_name(),
		"processor_count": OS.get_processor_count(),
		"screen_size": DisplayServer.screen_get_size(),
		"godot_version": Engine.get_version_info()
	}

func _input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_select"):  # Space key
		print("\n🔄 Re-running performance benchmarks...")
		await run_all_benchmarks()

func _exit_tree() -> void:
	is_benchmarking = false
	if monitor_timer and is_instance_valid(monitor_timer):
		monitor_timer.stop()
		monitor_timer.queue_free()
		monitor_timer = null
	if test_player and is_instance_valid(test_player):
		test_player.queue_free()
		test_player = null
