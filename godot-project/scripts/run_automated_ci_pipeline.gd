extends SceneTree

const AUTOMATED_CI_TESTS_SCRIPT: Script = preload("res://scripts/automated_ci_tests.gd")
const PIPELINE_TIMEOUT_MS: int = 600000

var _completed: bool = false
var _exit_code: int = 1
var _failure_reason: String = ""
var _runner_root: Node = null
var _ci_node: Node = null

func _init() -> void:
	call_deferred("_run")

func _run() -> void:
	_runner_root = Node.new()
	_runner_root.name = "AutomatedCIPipelineRunner"
	root.add_child(_runner_root)

	_ci_node = AUTOMATED_CI_TESTS_SCRIPT.new()
	if _ci_node == null:
		push_error("RunAutomatedCIPipeline: failed to instantiate automated_ci_tests.gd")
		_finish(1)
		return

	_runner_root.add_child(_ci_node)

	if _ci_node.has_signal("ci_pipeline_completed"):
		_ci_node.connect("ci_pipeline_completed", Callable(self, "_on_ci_pipeline_completed"))
	if _ci_node.has_signal("ci_failure_detected"):
		_ci_node.connect("ci_failure_detected", Callable(self, "_on_ci_failure_detected"))

	await process_frame
	if not _ci_node.has_method("run_ci_pipeline"):
		push_error("RunAutomatedCIPipeline: run_ci_pipeline() not found")
		_finish(1)
		return

	print("RunAutomatedCIPipeline: starting...")
	_ci_node.call("run_ci_pipeline")

	var start_ms: int = Time.get_ticks_msec()
	while not _completed and Time.get_ticks_msec() - start_ms < PIPELINE_TIMEOUT_MS:
		await process_frame

	if not _completed:
		_failure_reason = "timeout_after_%d_ms" % PIPELINE_TIMEOUT_MS
		push_error("RunAutomatedCIPipeline: timed out waiting for CI completion")
		_finish(1)
		return

	_finish(_exit_code)

func _on_ci_failure_detected(failure_type: String, details: Dictionary) -> void:
	print("RunAutomatedCIPipeline: failure signal type=%s details=%s" % [failure_type, JSON.stringify(details)])

func _on_ci_pipeline_completed(results: Dictionary) -> void:
	var success: bool = bool(results.get("success", false))
	_exit_code = 0 if success else 1
	if not success:
		var failure_log_variant: Variant = results.get("failure_log", [])
		_failure_reason = JSON.stringify(failure_log_variant)
	print("RunAutomatedCIPipeline: results=%s" % JSON.stringify(results))
	_completed = true

func _finish(exit_code: int) -> void:
	if _runner_root != null and is_instance_valid(_runner_root):
		_runner_root.queue_free()
	print("RunAutomatedCIPipeline: %s" % ("PASS" if exit_code == 0 else "FAIL"))
	if exit_code != 0 and not _failure_reason.is_empty():
		print("RunAutomatedCIPipeline: failure_reason=%s" % _failure_reason)
	quit(exit_code)
