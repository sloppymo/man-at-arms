extends Control
class_name DeathScene

const RuntimeServices = preload("res://scripts/runtime_services.gd")

@onready var title_label: Label = $CenterContainer/VBoxContainer/TitleLabel
@onready var body_label: Label = $CenterContainer/VBoxContainer/BodyLabel
@onready var return_button: Button = $CenterContainer/VBoxContainer/ReturnToTitleButton

func _ready() -> void:
	title_label.text = "Defeat"
	body_label.text = "Your force has been broken. Press R to retry combat instantly, or Enter/Esc to return to title."
	return_button.pressed.connect(_on_return_to_title_pressed)

func _restart_combat_pressed() -> void:
	var game_modes = RuntimeServices.game_modes(self)
	if game_modes:
		game_modes.set_mode(game_modes.GameMode.COMBAT, true)

func _on_return_to_title_pressed() -> void:
	var game_modes = RuntimeServices.game_modes(self)
	if game_modes:
		game_modes.set_mode(game_modes.GameMode.TITLE, true)

func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_R:
		_restart_combat_pressed()
		return
	if event.is_action_pressed("ui_accept") or event.is_action_pressed("ui_cancel"):
		_on_return_to_title_pressed()
