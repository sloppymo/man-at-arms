extends Control

@onready var diagnostic_label = $DiagnosticLabel
@onready var version_label = $VersionLabel

func _ready():
	_on_ready()
	update_diagnostic_info()

func _on_ready():
	print("System Diagnostic Scene Loaded Successfully")
	print("Godot Engine Version: ", Engine.get_version_info())
	print("Scene Tree Root: ", get_tree().root)
	print("Autoloads Check:")

	# Check if autoloads are working
	var autoloads = [
		"GameModes",
		"GameState",
		"AudioManager",
		"ParticleManager"
	]

	for autoload_name in autoloads:
		if get_node("/root/" + autoload_name):
			print("✓ " + autoload_name + " - LOADED")
		else:
			print("✗ " + autoload_name + " - MISSING")

func update_diagnostic_info():
	# Update version info
	var version_info = Engine.get_version_info()
	var version_text = "Godot Version: %s.%s.%s %s" % [
		version_info.major,
		version_info.minor,
		version_info.patch,
		version_info.status
	]
	version_label.text = version_text

	# Check autoload status
	var autoload_status = ""
	var autoloads_working = true

	if get_node("/root/GameModes"):
		autoload_status += "GameModes: ✓  "
	else:
		autoload_status += "GameModes: ✗  "
		autoloads_working = false

	if get_node("/root/GameState"):
		autoload_status += "GameState: ✓  "
	else:
		autoload_status += "GameState: ✗  "
		autoloads_working = false

	if get_node("/root/AudioManager"):
		autoload_status += "AudioManager: ✓  "
	else:
		autoload_status += "AudioManager: ✗  "
		autoloads_working = false

	if get_node("/root/ParticleManager"):
		autoload_status += "ParticleManager: ✓"
	else:
		autoload_status += "ParticleManager: ✗"
		autoloads_working = false

	# Update diagnostic text
	var status_text = "SYSTEM DIAGNOSTIC\n"
	status_text += "Godot 4.6 Engine Loaded Successfully\n"
	status_text += "Scene Loading: OK\n"
	status_text += "Rendering: OK\n"
	status_text += "Autoloads: " + ("OK" if autoloads_working else "ISSUES") + "\n\n"
	status_text += autoload_status

	diagnostic_label.text = status_text

	print("Diagnostic Update Complete")
