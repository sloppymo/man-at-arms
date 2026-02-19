extends Node

# Comprehensive system diagnostic for Godot
func _init():
	print("=== GODOT SYSTEM DIAGNOSTIC ===")
	print("Engine version:", Engine.get_version_info())
	print("Rendering method:", ProjectSettings.get_setting("rendering/renderer/rendering_method"))
	print("=== DIAGNOSTIC START ===")

func _enter_tree():
	print("DIAG: Scene tree entered")
	print("DIAG: Current scene:", get_tree().current_scene)
	print("DIAG: Scene file path:", get_tree().current_scene.scene_file_path if get_tree().current_scene else "NULL")
	print("DIAG: Viewport size:", get_viewport().get_visible_rect().size)
	print("DIAG: Root node:", get_tree().current_scene.get_path())

func _ready():
	print("DIAG: _ready() called")
	
	# Test basic rendering
	var test_rect = ColorRect.new()
	test_rect.name = "TestRect"
	test_rect.color = Color.BLUE
	test_rect.size = Vector2(100, 100)
	test_rect.position = Vector2(50, 50)
	add_child(test_rect)
	
	# Test text rendering
	var test_label = Label.new()
	test_label.name = "TestLabel"
	test_label.text = "SYSTEM DIAGNOSTIC\nIf you see this, rendering works!"
	test_label.position = Vector2(50, 200)
	test_label.add_theme_font_size_override("font_size", 16)
	add_child(test_label)
	
	# Test input system
	var input_test = Label.new()
	input_test.name = "InputTest"
	input_test.text = "Press SPACE to test input system"
	input_test.position = Vector2(50, 250)
	add_child(input_test)
	
	print("DIAG: Test elements created")
	
	# Test timer for continuous checks
	var timer = Timer.new()
	timer.wait_time = 1.0
	timer.timeout.connect(_continuous_check)
	timer.autostart = true
	add_child(timer)
	
	print("DIAG: Diagnostic setup complete")

func _input(event):
	if event is InputEventKey and event.pressed:
		if event.keycode == KEY_SPACE:
			print("DIAG: SPACE key pressed - Input system working!")
			var input_test = get_node("InputTest")
			if input_test:
				input_test.text = "INPUT SYSTEM WORKS! ✓"
				input_test.modulate = Color.GREEN

func _continuous_check():
	var frame_count = Engine.get_frames_drawn()
	var viewport_size = get_viewport().get_visible_rect().size if get_viewport() else Vector2.ZERO
	print("DIAG: Frame:", frame_count, "Viewport:", viewport_size)
	
	# Check if our test elements are still visible
	var test_rect = get_node_or_null("TestRect")
	var test_label = get_node_or_null("TestLabel")
	
	if test_rect and test_label:
		print("DIAG: All systems operational")
	else:
		print("DIAG: WARNING - Test elements missing!")
