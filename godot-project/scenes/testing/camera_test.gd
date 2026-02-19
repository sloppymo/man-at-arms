extends Control
class_name CameraTest

@onready var test_button = $UI/VBoxContainer/TestButton
@onready var status_label = $UI/VBoxContainer/StatusLabel
@onready var intensity_slider = $UI/VBoxContainer/IntensitySlider
@onready var duration_slider = $UI/VBoxContainer/DurationSlider

var camera: Camera2D
var original_offset: Vector2

func _ready() -> void:
	print("CameraTest: Initializing camera test scene")
	
	# Create camera for testing
	camera = Camera2D.new()
	add_child(camera)
	camera.position = Vector2(400, 300)
	original_offset = camera.offset
	
	# Connect signals
	test_button.pressed.connect(_on_test_button_pressed)
	intensity_slider.value_changed.connect(_on_intensity_changed)
	duration_slider.value_changed.connect(_on_duration_changed)
	
	status_label.text = "Camera shake test ready. Click test button to shake camera."

func _on_test_button_pressed() -> void:
	print("CameraTest: Testing camera shake...")
	status_label.text = "Testing camera shake..."
	
	var intensity = intensity_slider.value
	var duration = duration_slider.value
	
	apply_camera_shake(intensity, duration)
	
	status_label.text = "Camera shake test complete!"

func apply_camera_shake(intensity: float, duration: float) -> void:
	print("CameraTest: Applying shake - intensity:", intensity, "duration:", duration)
	
	# Create shake effect using tween
	var tween = create_tween()
	var shake_count = int(duration * 60)  # 60 shakes per second
	
	for i in range(shake_count):
		var random_offset = Vector2(
			randf_range(-intensity, intensity),
			randf_range(-intensity, intensity)
		)
		tween.tween_property(camera, "offset", original_offset + random_offset, 0.016)
		tween.tween_property(camera, "offset", original_offset + random_offset * 0.5, 0.016)
	
	# Return to original position
	tween.tween_property(camera, "offset", original_offset, 0.1)

func _on_intensity_changed(value: float) -> void:
	status_label.text = "Intensity set to: " + str(value)

func _on_duration_changed(value: float) -> void:
	status_label.text = "Duration set to: " + str(value) + " seconds"

func _input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"):  # ESC
		_return_to_landing()

func _return_to_landing() -> void:
	print("CameraTest: Returning to landing page...")
	var game_modes = get_node_or_null("/root/GameModes")
	if game_modes:
		game_modes.set_mode(GameModes.GameMode.TITLE)
