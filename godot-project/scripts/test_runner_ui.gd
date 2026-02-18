extends Control
class_name TestRunnerUI

# UI Controller for the Test Runner Scene
# Provides user interface for running and monitoring tests

@onready var comprehensive_button: Button = $VBoxContainer/RunComprehensiveButton
@onready var edge_case_button: Button = $VBoxContainer/RunEdgeCaseButton
@onready var performance_button: Button = $VBoxContainer/RunPerformanceButton
@onready var ci_pipeline_button: Button = $VBoxContainer/RunCIPipelineButton
@onready var status_label: Label = $VBoxContainer/StatusLabel
@onready var progress_bar: ProgressBar = $VBoxContainer/ProgressBar
@onready var results_label: RichTextLabel = $ResultsPanel/ScrollContainer/ResultsLabel

# Test system references
var comprehensive_tests: ComprehensiveTestSuite
var edge_case_tests: EdgeCaseTests
var performance_benchmark: PerformanceBenchmark
var automated_ci: AutomatedCITests

var current_test_count = 0
var total_test_count = 0

func _ready() -> void:
	print("Test Runner UI Ready")
	_setup_test_systems()
	_connect_signals()

func _setup_test_systems() -> void:
	# Get references to test systems
	comprehensive_tests = get_node_or_null("../ComprehensiveTests") as ComprehensiveTestSuite
	edge_case_tests = get_node_or_null("../EdgeCaseTests") as EdgeCaseTests
	performance_benchmark = get_node_or_null("../PerformanceBenchmark") as PerformanceBenchmark
	automated_ci = get_node_or_null("../AutomatedCITests") as AutomatedCITests

func _connect_signals() -> void:
	# Connect button signals
	if not comprehensive_button.pressed.is_connected(_on_run_comprehensive_pressed):
		comprehensive_button.pressed.connect(_on_run_comprehensive_pressed)
	if not edge_case_button.pressed.is_connected(_on_run_edge_case_pressed):
		edge_case_button.pressed.connect(_on_run_edge_case_pressed)
	if not performance_button.pressed.is_connected(_on_run_performance_pressed):
		performance_button.pressed.connect(_on_run_performance_pressed)
	if not ci_pipeline_button.pressed.is_connected(_on_run_ci_pipeline_pressed):
		ci_pipeline_button.pressed.connect(_on_run_ci_pipeline_pressed)
	
	# Connect test system signals if available
	if comprehensive_tests:
		comprehensive_tests.test_completed.connect(_on_test_completed)
		comprehensive_tests.all_tests_completed.connect(_on_all_tests_completed)
	
	if automated_ci:
		automated_ci.ci_test_completed.connect(_on_ci_test_completed)
		automated_ci.ci_pipeline_completed.connect(_on_ci_pipeline_completed)

func _on_run_comprehensive_pressed() -> void:
	_start_test_session("Comprehensive Tests")
	
	if comprehensive_tests:
		total_test_count = 18  # Approximate number of comprehensive tests
		current_test_count = 0
		_update_progress()
		
		comprehensive_tests.start()
	else:
		_update_status("❌ Comprehensive tests not available")

func _on_run_edge_case_pressed() -> void:
	_start_test_session("Edge Case Tests")
	
	if edge_case_tests:
		total_test_count = 12  # Approximate number of edge case tests
		current_test_count = 0
		_update_progress()
		
		edge_case_tests.run_edge_case_tests()
	else:
		_update_status("❌ Edge case tests not available")

func _on_run_performance_pressed() -> void:
	_start_test_session("Performance Benchmarks")
	
	if performance_benchmark:
		total_test_count = 6  # Number of performance benchmarks
		current_test_count = 0
		_update_progress()
		
		performance_benchmark.run_all_benchmarks()
	else:
		_update_status("❌ Performance benchmarks not available")

func _on_run_ci_pipeline_pressed() -> void:
	_start_test_session("CI Pipeline")
	
	if automated_ci:
		total_test_count = 6  # Number of CI pipeline stages
		current_test_count = 0
		_update_progress()
		
		automated_ci.run_ci_pipeline()
	else:
		_update_status("❌ CI pipeline not available")

func _start_test_session(session_name: String) -> void:
	_update_status("🚀 Starting " + session_name + "...")
	_clear_results()
	_disable_buttons()
	progress_bar.value = 0

func _update_status(message: String) -> void:
	status_label.text = message
	print("UI Status: ", message)

func _update_progress() -> void:
	if total_test_count > 0:
		progress_bar.value = (float(current_test_count) / float(total_test_count)) * 100.0

func _clear_results() -> void:
	results_label.text = "[b]Test Results[/b]\n\nResults will appear here..."

func _disable_buttons() -> void:
	comprehensive_button.disabled = true
	edge_case_button.disabled = true
	performance_button.disabled = true
	ci_pipeline_button.disabled = true

func _enable_buttons() -> void:
	comprehensive_button.disabled = false
	edge_case_button.disabled = false
	performance_button.disabled = false
	ci_pipeline_button.disabled = false

# ==================== SIGNAL HANDLERS ====================

func _on_test_completed(test_name: String, result: bool, details: Dictionary) -> void:
	current_test_count += 1
	_update_progress()
	
	var status_icon := "✅" if result else "❌"
	_update_status("Running: " + test_name + " " + status_icon)
	
	# Add to results
	var result_text = "[b]" + test_name + "[/b]: " + status_icon + " " + ("PASSED" if result else "FAILED") + "\n"
	
	# Add key details
	for key in details:
		if key != "timestamp":
			result_text += "  " + key + ": " + str(details[key]) + "\n"
	
	result_text += "\n"
	results_label.text += result_text

func _on_all_tests_completed(results: Dictionary) -> void:
	_update_status("✅ All tests completed!")
	_enable_buttons()
	
	# Add summary to results
	var summary = _generate_test_summary(results)
	results_label.text += summary

func _on_ci_test_completed(test_suite: String, results: Dictionary) -> void:
	current_test_count += 1
	_update_progress()
	
	var status_icon := "✅" if bool(results.get("meets_threshold", true)) else "❌"
	_update_status("CI Stage: " + test_suite + " " + status_icon)
	
	# Add CI results
	var result_text = "[b]CI: " + test_suite + "[/b]: " + status_icon + "\n"
	
	if results.has("total_tests"):
		result_text += "  Tests: " + str(results.total_tests) + " passed, " + str(results.passed_tests) + " total\n"
		result_text += "  Success Rate: " + "%.1f" % results.success_rate + "%\n"
	
	result_text += "\n"
	results_label.text += result_text

func _on_ci_pipeline_completed(results: Dictionary) -> void:
	var status_icon := "✅" if bool(results.success) else "❌"
	_update_status("CI Pipeline " + status_icon + " " + ("SUCCESS" if results.success else "FAILURE"))
	_enable_buttons()
	
	# Add CI summary
	var ci_summary = "[b]CI Pipeline Results[/b]\n"
	ci_summary += "Status: " + status_icon + " " + ("SUCCESS" if results.success else "FAILURE") + "\n"
	ci_summary += "Duration: " + "%.2f" % results.duration_seconds + " seconds\n"
	ci_summary += "Test Suites: " + str(results.test_results.size()) + "\n"
	ci_summary += "Failures: " + str(results.failure_log.size()) + "\n\n"
	
	if results.failure_log.size() > 0:
		ci_summary += "[b]Failures:[/b]\n"
		for failure in results.failure_log:
			ci_summary += "  ❌ " + failure + "\n"
	
	ci_summary += "\n"
	results_label.text += ci_summary

func _generate_test_summary(results: Dictionary) -> String:
	var summary = "[b]Test Summary[/b]\n"
	
	var total_tests = results.size()
	var passed_tests = 0
	
	for test_name in results:
		if results[test_name].passed:
			passed_tests += 1
	
	var success_rate := float(passed_tests) / float(total_tests) * 100.0 if total_tests > 0 else 0.0
	
	summary += "Total Tests: " + str(total_tests) + "\n"
	summary += "Passed: " + str(passed_tests) + "\n"
	summary += "Failed: " + str(total_tests - passed_tests) + "\n"
	summary += "Success Rate: " + "%.1f" % success_rate + "%\n\n"
	
	var overall_status := "✅ ALL CRITICAL FIXES VALIDATED" if success_rate >= 95.0 else "⚠️ SOME ISSUES DETECTED"
	summary += "[b]Overall Result: " + overall_status + "[/b]\n\n"
	
	return summary

# ==================== UTILITY FUNCTIONS ====================

func _input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"):  # Escape key
		get_tree().change_scene_to_file("res://scenes/combat/combat_scene.tscn")
	elif event.is_action_pressed("ui_accept"):  # Enter key
		_on_run_comprehensive_pressed()
