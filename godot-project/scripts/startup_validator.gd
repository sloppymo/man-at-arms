extends RefCounted

const RuntimeLog = preload("res://scripts/runtime_log.gd")
const RuntimeServices = preload("res://scripts/runtime_services.gd")

const REQUIRED_ASSETS: Array[String] = [
	"res://assets/audio/swing.wav",
	"res://assets/audio/hit.wav",
	"res://assets/audio/death.wav",
	"res://assets/sprites/player_idle.png",
	"res://assets/sprites/enemy_grunt.png",
	"res://assets/sprites/enemy_heavy.png",
	"res://assets/sprites/enemy_archer.png",
	"res://assets/effects/weapon_trail.png",
	"res://assets/effects/blood_particle.png",
	"res://assets/map.png"
]

static var _has_validated: bool = false

static func validate_once(context: Node) -> Dictionary:
	if _has_validated:
		return {"ran": false, "ok": true, "autoload_failures": [], "asset_failures": []}

	_has_validated = true

	var autoload_failures: Array[String] = _validate_autoloads(context)
	var asset_failures: Array[String] = _validate_assets()
	var ok: bool = autoload_failures.is_empty() and asset_failures.is_empty()

	if ok:
		RuntimeLog.info("StartupValidator: Startup validation passed")
	else:
		RuntimeLog.warn(
			"StartupValidator: Startup validation completed with %d issues"
			% [autoload_failures.size() + asset_failures.size()]
		)

	return {
		"ran": true,
		"ok": ok,
		"autoload_failures": autoload_failures,
		"asset_failures": asset_failures
	}

static func _validate_autoloads(context: Node) -> Array[String]:
	var failures: Array[String] = []
	var autoloads := {
		"GameModes": RuntimeServices.game_modes(context),
		"GameState": RuntimeServices.game_state(context),
		"EventBus": RuntimeServices.event_bus(context),
		"AudioManager": RuntimeServices.audio_manager(context),
		"ParticleManager": RuntimeServices.particle_manager(context)
	}

	for autoload_name in autoloads.keys():
		if autoloads[autoload_name] == null:
			var message := "StartupValidator: Missing autoload %s" % autoload_name
			RuntimeLog.error(message)
			failures.append(message)

	return failures

static func _validate_assets() -> Array[String]:
	var failures: Array[String] = []

	for path in REQUIRED_ASSETS:
		# In exported builds (especially Web), resources are resolved from the packed
		# virtual filesystem and may not be detectable via FileAccess.file_exists().
		if not ResourceLoader.exists(path):
			var missing_message := "StartupValidator: Missing runtime asset %s" % path
			RuntimeLog.error(missing_message)
			failures.append(missing_message)
			continue

		var resource: Resource = ResourceLoader.load(path)
		if resource == null:
			var load_message := "StartupValidator: Failed to load runtime asset %s" % path
			RuntimeLog.error(load_message)
			failures.append(load_message)

	return failures
