extends Control
class_name AudioTest

@onready var test_button = $UI/VBoxContainer/TestButton
@onready var status_label = $UI/VBoxContainer/StatusLabel
@onready var volume_slider = $UI/VBoxContainer/VolumeSlider

func _ready() -> void:
	print("AudioTest: Initializing audio test scene")
	
	# Connect signals
	test_button.pressed.connect(_on_test_button_pressed)
	volume_slider.value_changed.connect(_on_volume_changed)
	
	# Set initial status
	status_label.text = "Audio system ready. Click test button to play sounds."

func _on_test_button_pressed() -> void:
	print("AudioTest: Testing audio playback...")
	status_label.text = "Testing audio..."
	
	var audio_manager = get_node_or_null("/root/AudioManager")
	if not audio_manager:
		status_label.text = "ERROR: AudioManager not found!"
		return
	
	# Test each sound
	_test_sound("swing", "Swing sound")
	await get_tree().create_timer(0.5).timeout
	_test_sound("hit", "Hit sound")
	await get_tree().create_timer(0.5).timeout
	_test_sound("death", "Death sound")
	
	status_label.text = "Audio test complete!"

func _test_sound(sound_name: String, display_name: String) -> void:
	var audio_manager = get_node("/root/AudioManager")
	var sound_stream = audio_manager.get_sfx(sound_name)
	
	if sound_stream:
		audio_manager.play_sfx(sound_stream, -10.0)
		status_label.text = "Playing: " + display_name
		print("AudioTest: Playing", sound_name)
	else:
		status_label.text = "ERROR: " + display_name + " not found!"
		print("AudioTest: ERROR -", sound_name, "not found")

func _on_volume_changed(value: float) -> void:
	var audio_manager = get_node_or_null("/root/AudioManager")
	if audio_manager:
		audio_manager.set_sfx_volume(value)
		status_label.text = "Volume set to: " + str(value) + "dB"

func _input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"):  # ESC
		_return_to_landing()

func _return_to_landing() -> void:
	print("AudioTest: Returning to landing page...")
	var game_modes = get_node_or_null("/root/GameModes")
	if game_modes:
		game_modes.set_mode(GameModes.GameMode.TITLE)
