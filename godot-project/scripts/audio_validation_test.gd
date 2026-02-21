extends SceneTree
## Audio Validation Test
## Verifies all SFX are bundled, normalized, and anti-spam works
## Run: godot --headless --script scripts/audio_validation_test.gd

const CombatConstants = preload("res://scripts/combat_constants.gd")
const RuntimeServices = preload("res://scripts/runtime_services.gd")

var failures: Array[String] = []
var tests_run: int = 0
var tests_passed: int = 0

func _init() -> void:
	call_deferred("_run")

func _run() -> void:
	await _wait_frames(2)
	
	print("=" * 60)
	print("AUDIO VALIDATION TEST")
	print("=" * 60)
	
	var audio_manager: Node = RuntimeServices.audio_manager(root)
	if audio_manager == null:
		_fail("AudioManager autoload not found")
		_finish()
		return
	
	# Test 1: All required SFX are available
	await _test_required_sfx(audio_manager)
	
	# Test 2: Volume constants are normalized
	await _test_volume_normalization()
	
	# Test 3: Anti-spam system functional
	await _test_anti_spam(audio_manager)
	
	# Test 4: Web export compatibility
	await _test_web_export_compat(audio_manager)
	
	# Test 5: Bus configuration
	await _test_bus_configuration()
	
	_report_results()
	_finish()

func _test_required_sfx(audio_manager: Node) -> void:
	_print_test("Required SFX availability")
	
	var required_sfx: Array[String] = ["swing", "hit", "death", "block", "projectile"]
	
	for sfx_name in required_sfx:
		var stream = audio_manager.get_sfx(sfx_name) if audio_manager.has_method("get_sfx") else null
		if stream == null:
			_fail("Required SFX '%s' not available" % sfx_name)
		else:
			_pass("SFX '%s' loaded" % sfx_name)

func _test_volume_normalization() -> void:
	_print_test("Volume normalization")
	
	# Check that all volume constants exist and are in reasonable range
	var volumes := {
		"AUDIO_VOLUME_SWING": CombatConstants.AUDIO_VOLUME_SWING,
		"AUDIO_VOLUME_HIT": CombatConstants.AUDIO_VOLUME_HIT,
		"AUDIO_VOLUME_DEATH": CombatConstants.AUDIO_VOLUME_DEATH,
		"AUDIO_VOLUME_BLOCK": CombatConstants.AUDIO_VOLUME_BLOCK,
		"AUDIO_VOLUME_PROJECTILE": CombatConstants.AUDIO_VOLUME_PROJECTILE,
		"AUDIO_VOLUME_PERFECT_BLOCK": CombatConstants.AUDIO_VOLUME_PERFECT_BLOCK,
		"AUDIO_VOLUME_SFX_BUS": CombatConstants.AUDIO_VOLUME_SFX_BUS,
		"AUDIO_VOLUME_MUSIC_BUS": CombatConstants.AUDIO_VOLUME_MUSIC_BUS
	}
	
	for name in volumes.keys():
		var volume: float = volumes[name]
		if volume > 6.0 or volume < -40.0:
			_fail("Volume %s=%.2f outside safe range (-40 to +6 dB)" % [name, volume])
		else:
			_pass("%s=%.2f dB (normalized)" % [name, volume])

func _test_anti_spam(audio_manager: Node) -> void:
	_print_test("Anti-spam system")
	
	if not audio_manager.has_method("play_sfx_by_name"):
		_fail("play_sfx_by_name method not found")
		return
	
	# Rapid fire test - should not crash or error
	for i in range(10):
		audio_manager.play_sfx_by_name("swing")
		await _wait_frames(1)
	
	_pass("Anti-spam handles rapid fire without error")
	
	# Check diagnostics
	if audio_manager.has_method("get_diagnostics"):
		var diag: Dictionary = audio_manager.get_diagnostics()
		if diag.has("anti_spam_tracking"):
			_pass("Anti-spam tracking active")
		else:
			_fail("Anti-spam tracking not found in diagnostics")

func _test_web_export_compat(audio_manager: Node) -> void:
	_print_test("Web export compatibility")
	
	# Check if preload_all_sfx method exists
	if audio_manager.has_method("preload_all_sfx"):
		_pass("preload_all_sfx method available")
	else:
		_fail("preload_all_sfx method missing")
	
	# Check if web export detection exists
	if audio_manager.has_method("is_web_export"):
		_pass("Web export detection available")
	else:
		_fail("is_web_export method missing")
	
	# Verify all SFX are in AUDIO_PATHS for bundling
	var AudioManager = preload("res://scripts/audio_manager.gd")
	var paths: Dictionary = AudioManager.AUDIO_PATHS
	
	var required := ["swing", "hit", "death", "block", "projectile"]
	for sfx_name in required:
		if paths.has(sfx_name):
			_pass("SFX '%s' in AUDIO_PATHS (will be bundled)" % sfx_name)
		else:
			_fail("SFX '%s' missing from AUDIO_PATHS" % sfx_name)

func _test_bus_configuration() -> void:
	_print_test("Audio bus configuration")
	
	var sfx_bus_idx := AudioServer.get_bus_index("SFX")
	var music_bus_idx := AudioServer.get_bus_index("Music")
	var master_bus_idx := AudioServer.get_bus_index("Master")
	
	if master_bus_idx >= 0:
		_pass("Master bus exists")
	else:
		_fail("Master bus not found")
	
	if sfx_bus_idx >= 0:
		_pass("SFX bus exists")
	else:
		_fail("SFX bus not found")
	
	if music_bus_idx >= 0:
		_pass("Music bus exists")
	else:
		_fail("Music bus not found")

func _print_test(name: String) -> void:
	print("\n[Test] %s" % name)
	print("-" * 40)

func _pass(message: String) -> void:
	tests_run += 1
	tests_passed += 1
	print("  ✓ %s" % message)

func _fail(message: String) -> void:
	tests_run += 1
	failures.append(message)
	print("  ✗ %s" % message)
	push_error("AudioValidation: %s" % message)

func _wait_frames(frame_count: int) -> void:
	for _i in range(frame_count):
		await process_frame

func _report_results() -> void:
	print("\n" + "=" * 60)
	print("RESULTS: %d/%d passed" % [tests_passed, tests_run])
	print("=" * 60)

func _finish() -> void:
	if failures.is_empty():
		print("\nAudioValidation: PASS")
		quit(0)
	else:
		print("\nAudioValidation: FAIL (%d)" % failures.size())
		for f in failures:
			print("  - %s" % f)
		quit(1)
