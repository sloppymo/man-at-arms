extends Control
class_name InputTest

@onready var status_label = $UI/VBoxContainer/StatusLabel
@onready var input_display = $UI/VBoxContainer/InputDisplay

var input_history: Array[String] = []

func _ready() -> void:
	print("InputTest: Initializing input test scene")
	status_label.text = "Input system test ready. Try different inputs!"
	set_process_input(true)

func _input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"):  # ESC
		_return_to_landing()
		return
	
	# Track various input types
	var input_info = ""
	
	if event is InputEventKey:
		if event.pressed:
			input_info = "Key pressed: " + OS.get_keycode_string(event.keycode)
		else:
			input_info = "Key released: " + OS.get_keycode_string(event.keycode)
	
	elif event is InputEventMouseButton:
		if event.pressed:
			input_info = "Mouse button " + str(event.button_index) + " pressed at " + str(event.position)
		else:
			input_info = "Mouse button " + str(event.button_index) + " released"
	
	elif event is InputEventMouseMotion:
		input_info = "Mouse moved to " + str(event.position)
	
	elif event is InputEventJoypadButton:
		if event.pressed:
			input_info = "Joypad button " + str(event.button_index) + " pressed"
		else:
			input_info = "Joypad button " + str(event.button_index) + " released"
	
	elif event is InputEventJoypadMotion:
		input_info = "Joypad axis " + str(event.axis) + " value: " + str(event.axis_value)
	
	# Test action mappings
	for action in ["move_left", "move_right", "move_up", "move_down", "special_ability"]:
		if event.is_action(action):
			input_info += " (ACTION: " + action + ")"
	
	# Display input info
	if input_info != "":
		add_input_to_history(input_info)

func add_input_to_history(input_info: String) -> void:
	input_history.append(input_info)
	
	# Keep only last 10 inputs
	if input_history.size() > 10:
		input_history.pop_front()
	
	# Update display
	input_display.text = "Recent Inputs:\n" + "\n".join(input_history)
	status_label.text = "Last input: " + input_info

func _process(_delta: float) -> void:
	# Test continuous input
	var input_vector = Input.get_vector("move_left", "move_right", "move_up", "move_down")
	if input_vector != Vector2.ZERO:
		var continuous_info = "Continuous movement: " + str(input_vector)
		if input_history.is_empty() or not input_history[-1].contains("Continuous movement"):
			add_input_to_history(continuous_info)

func _return_to_landing() -> void:
	print("InputTest: Returning to landing page...")
	var game_modes = get_node_or_null("/root/GameModes")
	if game_modes:
		game_modes.set_mode(GameModes.GameMode.TITLE)
