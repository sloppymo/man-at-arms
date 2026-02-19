extends Node

func _ready():
	print("SIMPLE TEST: Scene loaded successfully!")
	
	var label = Label.new()
	label.text = "SIMPLE TEST WORKS!"
	label.position = Vector2(0, 0)
	add_child(label)
