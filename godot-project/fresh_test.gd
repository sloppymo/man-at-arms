extends Control

func _ready():
	var label = Label.new()
	label.text = "FRESH TEST
If you see this, Godot works!"
	label.position = Vector2(100, 100)
	add_child(label)
