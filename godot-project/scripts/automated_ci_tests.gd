extends Node
class_name AutomatedCITests

# Automated CI Testing for Priority 1 Implementation
# Provides continuous integration testing capabilities with automated validation
const CombatConstants = preload("res://scripts/combat_constants.gd")

signal ci_test_completed(test_suite: String, results: Dictionary)
signal ci_pipeline_completed(results: Dictionary)
signal ci_failure_detected(failure_type: String, details: Dictionary)

# CI Configuration
const CI_TEST_TIMEOUT = 300.0  # 5 minutes max
const CI_PERFORMANCE_THRESHOLDS = {
	"min_fps": 45,
	"max_memory_growth_mb": 15,
	"max_audio_cutoffs": 0,
	"min_test_coverage": 95.0
}
const INTEGRATION_RNG_SEED: int = 90210
const EXPECTED_BENCHMARK_NAMES: Array[String] = [
	"Audio System Performance",
	"Camera Shake Performance",
	"Particle System Performance",
	"Combined Performance",
	"Memory Efficiency",
	"Scalability Test"
]

# CI Test state
var ci_running = false
var ci_start_time = 0
var current_test_suite = ""
var test_results = {}
var failure_log = []
var edge_case_result_buffer: Dictionary = {}
var benchmark_result_buffer: Dictionary = {}
var integration_rng: RandomNumberGenerator = RandomNumberGenerator.new()

# System references
var comprehensive_tests: ComprehensiveTestSuite
var edge_case_tests: EdgeCaseTests
var performance_benchmark: PerformanceBenchmark
var _owns_comprehensive_tests := false
var _owns_edge_case_tests := false
var _owns_performance_benchmark := false

func _ready() -> void:
	print("=== Automated CI Testing Framework ===")
	_setup_ci_environment()

func _setup_ci_environment() -> void:
	var root = get_parent()
	
	# Reuse existing shared test nodes when present.
	comprehensive_tests = get_node_or_null("../ComprehensiveTests") as ComprehensiveTestSuite
	if not comprehensive_tests:
		comprehensive_tests = ComprehensiveTestSuite.new()
		comprehensive_tests.name = "ComprehensiveTests"
		_owns_comprehensive_tests = true
		_attach_test_node(root, comprehensive_tests)
	comprehensive_tests.autorun = false
	
	edge_case_tests = get_node_or_null("../EdgeCaseTests") as EdgeCaseTests
	if not edge_case_tests:
		edge_case_tests = EdgeCaseTests.new()
		edge_case_tests.name = "EdgeCaseTests"
		_owns_edge_case_tests = true
		_attach_test_node(root, edge_case_tests)
	edge_case_tests.autorun = false
	
	performance_benchmark = get_node_or_null("../PerformanceBenchmark") as PerformanceBenchmark
	if not performance_benchmark:
		performance_benchmark = PerformanceBenchmark.new()
		performance_benchmark.name = "PerformanceBenchmark"
		_owns_performance_benchmark = true
		_attach_test_node(root, performance_benchmark)
	
	# Connect signals
	if comprehensive_tests and not comprehensive_tests.all_tests_completed.is_connected(_on_comprehensive_tests_completed):
		comprehensive_tests.all_tests_completed.connect(_on_comprehensive_tests_completed)
	if edge_case_tests and not edge_case_tests.edge_case_test_completed.is_connected(_on_edge_case_test_completed):
		edge_case_tests.edge_case_test_completed.connect(_on_edge_case_test_completed)
	if performance_benchmark and not performance_benchmark.benchmark_completed.is_connected(_on_benchmark_completed):
		performance_benchmark.benchmark_completed.connect(_on_benchmark_completed)

func _attach_test_node(root: Node, node: Node) -> void:
	if not node or not is_instance_valid(node):
		return
	var parent := root if root else self
	if not parent or not is_instance_valid(parent):
		return
	if node.get_parent() == parent:
		return
	if node.get_parent():
		node.get_parent().remove_child(node)
	# Defer to avoid "Parent node is busy setting up children" during _ready().
	parent.call_deferred("add_child", node)

# ==================== CI PIPELINE MAIN ====================

func run_ci_pipeline() -> void:
	print("\n🚀 Starting Automated CI Pipeline...")
	
	ci_running = true
	ci_start_time = Time.get_ticks_msec()
	test_results.clear()
	failure_log.clear()
	edge_case_result_buffer.clear()
	benchmark_result_buffer.clear()
	_reset_integration_rng()
	
	# CI Pipeline stages
	var pipeline_success = true
	
	# Stage 1: System Health Check
	pipeline_success = await _run_system_health_check()
	if not pipeline_success:
		_ci_failure("System Health", {"error": "System health check failed"})
		return
	
	# Stage 2: Comprehensive Tests
	pipeline_success = await _run_comprehensive_test_suite()
	if not pipeline_success:
		_ci_failure("Comprehensive Tests", {"error": "Comprehensive tests failed"})
		return
	
	# Stage 3: Edge Case Tests
	pipeline_success = await _run_edge_case_tests()
	if not pipeline_success:
		_ci_failure("Edge Cases", {"error": "Edge case tests failed"})
		return
	
	# Stage 4: Performance Benchmarks
	pipeline_success = await _run_performance_benchmarks()
	if not pipeline_success:
		_ci_failure("Performance", {"error": "Performance benchmarks failed"})
		return
	
	# Stage 5: Integration Tests
	pipeline_success = await _run_integration_tests()
	if not pipeline_success:
		_ci_failure("Integration", {"error": "Integration tests failed"})
		return
	
	# Stage 6: Final Validation
	pipeline_success = await _run_final_validation()
	if not pipeline_success:
		_ci_failure("Final Validation", {"error": "Final validation failed"})
		return
	
	# CI Pipeline completed successfully
	_complete_ci_pipeline(true)

# ==================== CI PIPELINE STAGES ====================

func _run_system_health_check() -> bool:
	current_test_suite = "System Health Check"
	print("\n🏥 Running System Health Check...")
	
	var health_results = {}
	var all_healthy = true
	
	# Check AudioManager
	var audio_manager = get_node("/root/AudioManager")
	if audio_manager:
		health_results["audio_manager"] = {
			"exists": true,
			"pool_initialized": audio_manager.sfx_players.size() == 8,
			"pool_size": audio_manager.sfx_players.size()
		}
		if audio_manager.sfx_players.size() != 8:
			all_healthy = false
			failure_log.append("AudioManager pool size incorrect")
	else:
		health_results["audio_manager"] = {"exists": false}
		all_healthy = false
		failure_log.append("AudioManager not found")
	
	# Check ParticleManager
	var particle_manager = get_node("/root/ParticleManager")
	if particle_manager:
		health_results["particle_manager"] = {
			"exists": true,
			"pool_initialized": particle_manager.blood_particle_pool.size() == CombatConstants.BLOOD_POOL_SIZE,
			"pool_size": particle_manager.blood_particle_pool.size()
		}
		if particle_manager.blood_particle_pool.size() != CombatConstants.BLOOD_POOL_SIZE:
			all_healthy = false
			failure_log.append("ParticleManager pool size incorrect")
	else:
		health_results["particle_manager"] = {"exists": false}
		all_healthy = false
		failure_log.append("ParticleManager not found")
	
	# Check system resources
	health_results["system_resources"] = {
		"memory_mb": _get_memory_usage_bytes() / (1024.0 * 1024.0),
		"processor_count": OS.get_processor_count(),
		"platform": OS.get_name()
	}
	
	# Lightweight startup perf sanity only; detailed perf checks run in benchmark stage.
	await get_tree().create_timer(0.1).timeout
	var sampled_fps: float = Engine.get_frames_per_second()
	var performance_healthy: bool = sampled_fps > 0.0
	if not performance_healthy:
		all_healthy = false
		failure_log.append("System performance monitor unavailable")
	
	health_results["performance_healthy"] = performance_healthy
	health_results["sampled_fps"] = sampled_fps
	
	test_results["system_health"] = health_results
	ci_test_completed.emit(current_test_suite, health_results)
	
	var status_icon := "✅" if all_healthy else "❌"
	print(status_icon, " System Health Check: ", "PASSED" if all_healthy else "FAILED")
	return all_healthy

func _run_comprehensive_test_suite() -> bool:
	current_test_suite = "Comprehensive Tests"
	print("\n🧪 Running Comprehensive Test Suite...")
	if not comprehensive_tests:
		failure_log.append("Comprehensive test suite not available")
		return false
	
	# Run comprehensive tests with timeout
	var timeout_timer = Timer.new()
	timeout_timer.wait_time = CI_TEST_TIMEOUT
	timeout_timer.timeout.connect(func(): 
		_ci_failure("Timeout", {"test_suite": current_test_suite})
	)
	add_child(timeout_timer)
	timeout_timer.start()
	
	comprehensive_tests.start()
	
	# Wait for comprehensive tests to complete
	await comprehensive_tests.all_tests_completed
	
	timeout_timer.queue_free()
	
	# Check results
	var comprehensive_results = comprehensive_tests.test_results
	var passed_count = 0
	var total_count = comprehensive_results.size()
	
	for test_name in comprehensive_results:
		if comprehensive_results[test_name].passed:
			passed_count += 1
		else:
			failure_log.append("Comprehensive test failed: " + test_name)
	
	var success_rate = float(passed_count) / float(total_count) * 100.0
	var passed = success_rate >= CI_PERFORMANCE_THRESHOLDS.min_test_coverage
	
	var results = {
		"total_tests": total_count,
		"passed_tests": passed_count,
		"success_rate": success_rate,
		"meets_threshold": passed,
		"detailed_results": comprehensive_results
	}
	
	test_results["comprehensive_tests"] = results
	ci_test_completed.emit(current_test_suite, results)
	
	print(passed and "✅" or "❌", " Comprehensive Tests: ", "%.1f" % success_rate, "% passed")
	return passed

func _run_edge_case_tests() -> bool:
	current_test_suite = "Edge Case Tests"
	print("\n🔍 Running Edge Case Tests...")
	
	var edge_case_results = {}
	var passed_count = 0
	var total_count = 0
	edge_case_result_buffer.clear()
	
	# Wait for edge case tests to complete and collect emitted per-test results.
	await edge_case_tests.run_edge_case_tests()
	
	if edge_case_result_buffer.is_empty():
		failure_log.append("Edge case tests produced no results")
		return false

	var edge_test_names: Array = edge_case_result_buffer.keys()
	edge_test_names.sort()
	
	for test_name_variant in edge_test_names:
		var test_name: String = str(test_name_variant)
		var result_entry: Dictionary = edge_case_result_buffer.get(test_name, {})
		var passed: bool = bool(result_entry.get("passed", false))
		total_count += 1
		if passed:
			passed_count += 1
		else:
			failure_log.append("Edge case test failed: " + test_name)
		
		edge_case_results[test_name] = result_entry
	
	var success_rate = float(passed_count) / float(total_count) * 100.0
	var passed = success_rate >= 90.0  # Edge cases can have slightly lower threshold
	
	var results = {
		"total_tests": total_count,
		"passed_tests": passed_count,
		"success_rate": success_rate,
		"meets_threshold": passed,
		"detailed_results": edge_case_results
	}
	
	test_results["edge_case_tests"] = results
	ci_test_completed.emit(current_test_suite, results)
	
	print(passed and "✅" or "❌", " Edge Case Tests: ", "%.1f" % success_rate, "% passed")
	return passed

func _run_performance_benchmarks() -> bool:
	current_test_suite = "Performance Benchmarks"
	print("\n📊 Running Performance Benchmarks...")

	if not performance_benchmark:
		failure_log.append("Performance benchmark runner not available")
		return false

	benchmark_result_buffer.clear()
	await performance_benchmark.run_all_benchmarks()
	await get_tree().process_frame

	if benchmark_result_buffer.is_empty():
		failure_log.append("Performance benchmark stage produced no benchmark data")
		return false

	# Check performance against thresholds from actual benchmark output.
	var performance_results = {}
	var all_benchmarks_passed = true

	for benchmark_name in EXPECTED_BENCHMARK_NAMES:
		if not benchmark_result_buffer.has(benchmark_name):
			all_benchmarks_passed = false
			failure_log.append("Missing benchmark result: " + benchmark_name)
			performance_results[benchmark_name] = {
				"overall_passed": false,
				"missing_result": true
			}
			continue

		var benchmark_data: Dictionary = benchmark_result_buffer[benchmark_name]
		var fps_passed: bool = true
		if benchmark_data.has("avg_fps"):
			fps_passed = float(benchmark_data.get("avg_fps", 0.0)) >= CI_PERFORMANCE_THRESHOLDS.min_fps
			if not fps_passed:
				all_benchmarks_passed = false
				failure_log.append("Performance benchmark failed FPS threshold: " + benchmark_name)

		var memory_passed: bool = true
		var memory_growth_mb: float = float(benchmark_data.get(
			"total_memory_growth_mb",
			benchmark_data.get("memory_growth_mb", 0.0)
		))
		if benchmark_name == "Memory Efficiency":
			memory_passed = memory_growth_mb <= CI_PERFORMANCE_THRESHOLDS.max_memory_growth_mb
			if not memory_passed:
				all_benchmarks_passed = false
				failure_log.append("Memory growth exceeded threshold: " + benchmark_name)

		var benchmark_grade: String = str(benchmark_data.get(
			"performance_grade",
			benchmark_data.get("grade", "N/A")
		))
		performance_results[benchmark_name] = {
			"avg_fps": benchmark_data.get("avg_fps", null),
			"memory_growth_mb": memory_growth_mb,
			"grade": benchmark_grade,
			"fps_passed": fps_passed,
			"memory_passed": memory_passed,
			"overall_passed": fps_passed and memory_passed
		}
	
	var results = {
		"all_benchmarks_passed": all_benchmarks_passed,
		"performance_thresholds_met": all_benchmarks_passed,
		"detailed_results": performance_results
	}
	
	test_results["performance_benchmarks"] = results
	ci_test_completed.emit(current_test_suite, results)
	
	print(all_benchmarks_passed and "✅" or "❌", " Performance Benchmarks: ", "PASSED" if all_benchmarks_passed else "FAILED")
	return all_benchmarks_passed

func _run_integration_tests() -> bool:
	current_test_suite = "Integration Tests"
	print("\n🔗 Running Integration Tests...")
	_reset_integration_rng()
	
	var integration_results = {}
	var passed_count = 0
	var total_count = 0
	
	# Test real-world scenarios combining all systems
	var integration_scenarios = [
		"Combat Audio + Particles + Shake",
		"Rapid Scene Transitions",
		"Memory Pressure Scenarios",
		"High Load Combat Simulation",
		"Extended Gameplay Session"
	]
	
	for scenario in integration_scenarios:
		total_count += 1
		var scenario_result = await _run_integration_scenario(scenario)
		integration_results[scenario] = scenario_result
		
		if scenario_result.passed:
			passed_count += 1
		else:
			failure_log.append("Integration scenario failed: " + scenario)
	
	var success_rate = float(passed_count) / float(total_count) * 100.0
	var passed = success_rate >= 90.0
	
	var results = {
		"total_scenarios": total_count,
		"passed_scenarios": passed_count,
		"success_rate": success_rate,
		"meets_threshold": passed,
		"detailed_results": integration_results
	}
	
	test_results["integration_tests"] = results
	ci_test_completed.emit(current_test_suite, results)
	
	print(passed and "✅" or "❌", " Integration Tests: ", "%.1f" % success_rate, "% passed")
	return passed

func _run_integration_scenario(scenario_name: String) -> Dictionary:
	print("  Running scenario: ", scenario_name)
	
	var passed = true
	var details = {}
	var started_ms: int = Time.get_ticks_msec()
	
	match scenario_name:
		"Combat Audio + Particles + Shake":
			passed = await _test_combat_integration()
		"Rapid Scene Transitions":
			passed = await _test_scene_transitions()
		"Memory Pressure Scenarios":
			passed = await _test_memory_pressure()
		"High Load Combat Simulation":
			passed = await _test_high_load_combat()
		"Extended Gameplay Session":
			passed = await _test_extended_gameplay()
		_:
			passed = false
			details["error"] = "Unknown scenario: " + scenario_name
	
	return {
		"passed": passed,
		"details": details,
		"execution_time_ms": Time.get_ticks_msec() - started_ms
	}

func _test_combat_integration() -> bool:
	var audio_manager = get_node("/root/AudioManager")
	var particle_manager = get_node("/root/ParticleManager")
	
	if not audio_manager or not particle_manager:
		return false
	
	var mock_stream = AudioStreamGenerator.new()
	var start_fps = Engine.get_frames_per_second()
	
	# Simulate intense combat
	for i in range(20):
		audio_manager.play_sfx(mock_stream, -10.0)
		particle_manager.play_blood_effect(Vector2(i * 30, i * 20))
		
		if i % 5 == 0:
			# Camera shake would be tested here if we had a player instance
			pass
		
		await get_tree().process_frame
	
	var end_fps = Engine.get_frames_per_second()
	var fps_drop = start_fps - end_fps
	
	return fps_drop < 15  # Allow up to 15 FPS drop

func _test_scene_transitions() -> bool:
	# Test system behavior during simulated scene transitions
	var audio_manager = get_node("/root/AudioManager")
	var particle_manager = get_node("/root/ParticleManager")
	
	if not audio_manager or not particle_manager:
		return false
	
	# Simulate scene pause/resume
	get_tree().paused = true
	await get_tree().create_timer(0.1).timeout
	get_tree().paused = false
	
	# Test systems still work after resume
	var mock_stream = AudioStreamGenerator.new()
	audio_manager.play_sfx(mock_stream, -10.0)
	particle_manager.play_blood_effect(Vector2(50, 50))
	
	await get_tree().process_frame
	
	return true  # If we get here, systems survived the transition

func _test_memory_pressure() -> bool:
	var particle_manager = get_node("/root/ParticleManager")
	
	if not particle_manager:
		return false
	
	var initial_memory = _get_memory_usage_bytes()
	
	# Create memory pressure
	for i in range(50):
		particle_manager.play_blood_effect(Vector2(i * 10, i * 5))
		await get_tree().process_frame
	
	var final_memory = _get_memory_usage_bytes()
	var memory_growth = (final_memory - initial_memory) / (1024.0 * 1024.0)
	
	return memory_growth < 20  # Allow up to 20MB growth

func _test_high_load_combat() -> bool:
	var audio_manager = get_node("/root/AudioManager")
	var particle_manager = get_node("/root/ParticleManager")
	
	if not audio_manager or not particle_manager:
		return false
	
	var mock_stream = AudioStreamGenerator.new()
	var start_fps = Engine.get_frames_per_second()
	
	# High load simulation
	for wave in range(5):
		for enemy in range(8):
			audio_manager.play_sfx(mock_stream, -10.0)
			audio_manager.play_sfx(mock_stream, -5.0)
			particle_manager.play_blood_effect(Vector2(enemy * 40, 0))
			await get_tree().create_timer(0.01).timeout
		
		await get_tree().create_timer(0.5).timeout
	
	var end_fps = Engine.get_frames_per_second()
	var fps_drop = start_fps - end_fps
	
	return fps_drop < 20  # Allow up to 20 FPS drop for high load

func _test_extended_gameplay() -> bool:
	var audio_manager = get_node("/root/AudioManager")
	var particle_manager = get_node("/root/ParticleManager")
	
	if not audio_manager or not particle_manager:
		return false
	
	var mock_stream = AudioStreamGenerator.new()
	var initial_memory = _get_memory_usage_bytes()
	
	# Extended gameplay simulation (shortened for CI)
	for minute in range(2):  # 2 minutes instead of 10
		for second in range(60):
			if integration_rng.randf() < 0.3:
				audio_manager.play_sfx(mock_stream, -10.0)
			if integration_rng.randf() < 0.2:
				particle_manager.play_blood_effect(Vector2(
					integration_rng.randf_range(0.0, 200.0),
					integration_rng.randf_range(0.0, 150.0)
				))
			
			await get_tree().create_timer(0.016).timeout  # Simulate 60 FPS
	
	var final_memory = _get_memory_usage_bytes()
	var memory_growth = (final_memory - initial_memory) / (1024.0 * 1024.0)
	
	return memory_growth < 15  # Allow up to 15MB growth for extended session

func _run_final_validation() -> bool:
	current_test_suite = "Final Validation"
	print("\n✅ Running Final Validation...")
	
	var validation_results = {}
	var all_validations_passed = true
	
	# Validate all critical systems are still functional
	var validations = [
		{"name": "Audio System Functional", "check": _validate_audio_system},
		{"name": "Particle System Functional", "check": _validate_particle_system},
		{"name": "Performance Within Limits", "check": _validate_performance},
		{"name": "Memory Stable", "check": _validate_memory},
		{"name": "No Critical Errors", "check": _validate_no_errors}
	]
	
	for validation in validations:
		var result = await validation.check.call()
		validation_results[validation.name] = result
		
		if not result.passed:
			all_validations_passed = false
			failure_log.append("Final validation failed: " + validation.name)
	
	var results = {
		"all_validations_passed": all_validations_passed,
		"detailed_results": validation_results
	}
	
	test_results["final_validation"] = results
	ci_test_completed.emit(current_test_suite, results)
	
	print(all_validations_passed and "✅" or "❌", " Final Validation: ", "PASSED" if all_validations_passed else "FAILED")
	return all_validations_passed

# ==================== VALIDATION FUNCTIONS ====================

func _validate_audio_system() -> Dictionary:
	var audio_manager = get_node("/root/AudioManager")
	var passed = audio_manager != null and audio_manager.sfx_players.size() == 8
	return {"passed": passed, "details": {"pool_size": audio_manager.sfx_players.size() if audio_manager else 0}}

func _validate_particle_system() -> Dictionary:
	var particle_manager = get_node("/root/ParticleManager")
	var passed = particle_manager != null and particle_manager.blood_particle_pool.size() == CombatConstants.BLOOD_POOL_SIZE
	return {"passed": passed, "details": {"pool_size": particle_manager.blood_particle_pool.size() if particle_manager else 0}}

func _validate_performance() -> Dictionary:
	var current_fps = Engine.get_frames_per_second()
	var passed = current_fps >= CI_PERFORMANCE_THRESHOLDS.min_fps
	return {"passed": passed, "details": {"current_fps": current_fps}}

func _validate_memory() -> Dictionary:
	var memory_mb = _get_memory_usage_bytes() / (1024.0 * 1024.0)
	var passed = memory_mb < 500  # Reasonable memory limit
	return {"passed": passed, "details": {"memory_mb": memory_mb}}

func _validate_no_errors() -> Dictionary:
	# Check for recent critical errors
	var critical_error_frames: int = 0
	for i in range(60):  # Check last second (60 frames at 60 FPS)
		await get_tree().process_frame
		if Engine.get_frames_per_second() < 20:
			critical_error_frames += 1
	
	var recorded_runtime_errors: int = _count_recorded_runtime_errors()
	var passed = critical_error_frames < 5 and recorded_runtime_errors == 0
	return {
		"passed": passed,
		"details": {
			"critical_error_frames": critical_error_frames,
			"recorded_runtime_errors": recorded_runtime_errors
		}
	}

# ==================== CI COMPLETION ====================

func _complete_ci_pipeline(success: bool) -> void:
	ci_running = false
	var duration = (Time.get_ticks_msec() - ci_start_time) / 1000.0
	
	var pipeline_results = {
		"success": success,
		"duration_seconds": duration,
		"test_results": test_results,
		"failure_log": failure_log,
		"summary": _generate_ci_summary()
	}
	
	print("\n" + "=".repeat(60))
	print("🎯 CI PIPELINE COMPLETED")
	print("=".repeat(60))
	print("Result: ", success and "✅ SUCCESS" or "❌ FAILURE")
	print("Duration: ", "%.2f" % duration, " seconds")
	print("Test Suites: ", test_results.size())
	print("Failures: ", failure_log.size())
	
	if failure_log.size() > 0:
		print("\n⚠️  Failures:")
		for failure in failure_log:
			print("   - ", failure)
	
	print("=".repeat(60))
	
	ci_pipeline_completed.emit(pipeline_results)

func _generate_ci_summary() -> Dictionary:
	var total_tests = 0
	var passed_tests = 0
	
	for suite_name in test_results:
		var suite_results = test_results[suite_name]
		if suite_results.has("total_tests"):
			total_tests += suite_results.total_tests
			passed_tests += suite_results.passed_tests
		elif suite_results.has("all_validations_passed"):
			total_tests += 5  # Approximate
			passed_tests += 5 if suite_results.all_validations_passed else 0

	return {
		"total_tests": total_tests,
		"passed_tests": passed_tests,
		"success_rate": float(passed_tests) / float(total_tests) * 100.0 if total_tests > 0 else 0.0,
		"failure_count": failure_log.size()
	}

func _ci_failure(failure_type: String, details: Dictionary) -> void:
	failure_log.append("CI Failure: " + failure_type)
	ci_failure_detected.emit(failure_type, details)
	_complete_ci_pipeline(false)

# ==================== SIGNAL HANDLERS ====================

func _on_comprehensive_tests_completed(results: Dictionary) -> void:
	# Results already collected in _run_comprehensive_test_suite
	pass

func _on_edge_case_test_completed(test_name: String, result: bool, details: Dictionary) -> void:
	edge_case_result_buffer[test_name] = {
		"passed": result,
		"details": details
	}

func _on_benchmark_completed(benchmark_name: String, results: Dictionary) -> void:
	benchmark_result_buffer[benchmark_name] = results.duplicate(true)

# ==================== UTILITY FUNCTIONS ====================

func _get_memory_usage_bytes() -> float:
	var memory_monitor = Performance.get_monitor(Performance.MEMORY_STATIC)
	return float(memory_monitor) if memory_monitor != null else 0.0

func _reset_integration_rng() -> void:
	integration_rng.seed = INTEGRATION_RNG_SEED

func _count_recorded_runtime_errors() -> int:
	var count: int = 0
	for suite_name in test_results:
		count += _count_runtime_errors_in_variant(test_results[suite_name])
	return count

func _count_runtime_errors_in_variant(value: Variant) -> int:
	var count: int = 0
	if value is Dictionary:
		var dict_value: Dictionary = value as Dictionary
		if dict_value.has("error"):
			var error_text: String = str(dict_value.get("error", ""))
			if not error_text.is_empty():
				count += 1
		for key in dict_value.keys():
			if str(key) == "error":
				continue
			count += _count_runtime_errors_in_variant(dict_value[key])
	elif value is Array:
		var array_value: Array = value as Array
		for entry in array_value:
			count += _count_runtime_errors_in_variant(entry)
	return count

func _input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_page_up"):  # Page Up key
		print("\n🔄 Starting CI Pipeline...")
		await run_ci_pipeline()

func _exit_tree() -> void:
	ci_running = false
	
	if comprehensive_tests and comprehensive_tests.all_tests_completed.is_connected(_on_comprehensive_tests_completed):
		comprehensive_tests.all_tests_completed.disconnect(_on_comprehensive_tests_completed)
	if edge_case_tests and edge_case_tests.edge_case_test_completed.is_connected(_on_edge_case_test_completed):
		edge_case_tests.edge_case_test_completed.disconnect(_on_edge_case_test_completed)
	if performance_benchmark and performance_benchmark.benchmark_completed.is_connected(_on_benchmark_completed):
		performance_benchmark.benchmark_completed.disconnect(_on_benchmark_completed)
	
	_cleanup_owned_node(comprehensive_tests, _owns_comprehensive_tests)
	_cleanup_owned_node(edge_case_tests, _owns_edge_case_tests)
	_cleanup_owned_node(performance_benchmark, _owns_performance_benchmark)
	
	comprehensive_tests = null
	edge_case_tests = null
	performance_benchmark = null

func _cleanup_owned_node(node: Node, owned: bool) -> void:
	if not owned or not node or not is_instance_valid(node):
		return
	if node.get_parent():
		node.queue_free()
	else:
		node.free()
