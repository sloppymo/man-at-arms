extends Node
class_name TestRunnerCoordinator

func _ready() -> void:
	print("=== Test Runner Coordinator ===")
	var comprehensive = get_node_or_null("ComprehensiveTests") as ComprehensiveTestSuite
	if comprehensive:
		comprehensive.autorun = false
		print("TestRunnerCoordinator: Comprehensive tests are manual-start only.")
