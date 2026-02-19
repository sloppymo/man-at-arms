extends CharacterBody2D
class_name OverworldPlayer

@export var speed: float = 200.0

func _ready() -> void:
	add_to_group("player")

func _physics_process(_delta: float) -> void:
	# Overworld player doesn't move continuously, only on hex inputs
	# Movement is handled by the overworld scene
	pass
