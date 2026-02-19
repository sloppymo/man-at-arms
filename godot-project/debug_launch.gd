extends Node

func _init():
	print("DEBUG: _init() called")

func _enter_tree():
	print("DEBUG: _enter_tree() called")

func _ready():
	print("DEBUG: _ready() called")
	print("DEBUG: Scene tree root:", get_tree())
	print("DEBUG: Current scene:", get_tree().current_scene)
	print("DEBUG: Scene file path:", get_tree().current_scene.scene_file_path if get_tree().current_scene else "NO SCENE")
	
	# Create a visible test
	var timer = Timer.new()
	timer.wait_time = 2.0
	timer.one_shot = true
	timer.timeout.connect(_show_test)
	add_child(timer)
	timer.start()

func _show_test():
	print("DEBUG: Timer fired - creating test UI")
	
	# Force create a visual element
	var test_node = ColorRect.new()
	test_node.color = Color.RED
	test_node.size = Vector2(200, 200)
	test_node.position = Vector2(100, 100)
	add_child(test_node)
	
	print("DEBUG: Test UI created and visible")
