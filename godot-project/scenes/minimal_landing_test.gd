extends Control

# Minimal landing test - bypass everything
func _init() -> void:
	print("MinimalLandingTest: _init() called")

func _enter_tree() -> void:
	print("MinimalLandingTest: _enter_tree() called")

func _ready() -> void:
	print("MinimalLandingTest: _ready() called")
	
	# Create simple UI
	var label = Label.new()
	label.text = "MINIMAL LANDING TEST
If you see this, scene loading works!
Landing page issue is elsewhere."
	label.position = Vector2(50, 50)
	label.size = Vector2(400, 100)
	add_child(label)
	
	var button = Button.new()
	button.text = "Test Combat"
	button.position = Vector2(50, 150)
	button.size = Vector2(100, 40)
	button.pressed.connect(_test_combat)
	add_child(button)
	
	print("MinimalLandingTest: UI created successfully")

func _test_combat() -> void:
	print("MinimalLandingTest: Testing combat...")
	get_tree().change_scene_to_file("res://scenes/combat/combat_scene.tscn")
