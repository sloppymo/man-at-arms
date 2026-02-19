extends Control
class_name DialogueBase

const RuntimeLog = preload("res://scripts/runtime_log.gd")
const RuntimeServices = preload("res://scripts/runtime_services.gd")

@onready var dialogue_text: RichTextLabel = $DialoguePanel/DialogueText
@onready var choice_container: VBoxContainer = $DialoguePanel/ChoiceContainer
@onready var continue_button: Button = $DialoguePanel/ContinueButton
@onready var exit_button: Button = $ExitButton

var current_dialogue: Dictionary = {}
var current_choices: Array = []
var dialogue_step: int = 0
var encounter_type: String = ""

func _ready() -> void:
	RuntimeLog.info("DialogueBase: Initializing dialogue scene for %s" % encounter_type)

	# Connect buttons
	continue_button.connect("pressed", Callable(self, "_on_continue_pressed"))
	exit_button.connect("pressed", Callable(self, "_on_exit_pressed"))

	# Connect choice buttons
	for i in range(choice_container.get_child_count()):
		var button = choice_container.get_child(i)
		if button is Button:
			button.connect("pressed", Callable(self, "_on_choice_selected").bind(i))

	# Hide UI initially
	hide_choices()
	continue_button.hide()

	# Start the dialogue
	start_dialogue()

func start_dialogue() -> void:
	# Override in child classes to set up specific dialogue
	RuntimeLog.debug("DialogueBase: Starting dialogue - override in child class")
	_on_exit_pressed()

func show_text(text: String) -> void:
	dialogue_text.text = text
	RuntimeLog.debug("DialogueBase: Showing text: %s" % text)

func show_choices(choices: Array) -> void:
	hide_choices()

	for i in range(min(choices.size(), choice_container.get_child_count())):
		var button = choice_container.get_child(i)
		if button is Button:
			button.text = choices[i]
			button.show()

	continue_button.hide()

func hide_choices() -> void:
	for button in choice_container.get_children():
		if button is Button:
			button.hide()

func show_continue() -> void:
	continue_button.show()
	hide_choices()

func _on_choice_selected(choice_index: int) -> void:
	RuntimeLog.debug("DialogueBase: Choice selected: %d" % choice_index)
	# Override in child classes to handle choice selection

func _on_continue_pressed() -> void:
	RuntimeLog.debug("DialogueBase: Continue pressed")
	# Override in child classes to handle continue

func _on_exit_pressed() -> void:
	RuntimeLog.info("DialogueBase: Exiting dialogue, returning to overworld")
	var gm = _get_game_modes()
	if gm:
		gm.set_mode(gm.GameMode.OVERWORLD)

func add_to_inventory(item: String, quantity: int = 1) -> void:
	var gs = _get_game_state()
	if gs and gs.game_state.has("inventory"):
		# Check if item already exists
		var found = false
		for inv_item in gs.game_state["inventory"]:
			if inv_item["name"] == item:
				inv_item["quantity"] += quantity
				found = true
				break

		if not found:
			gs.game_state["inventory"].append({
				"name": item,
				"quantity": quantity
			})

		RuntimeLog.info("DialogueBase: Added to inventory: %s x%d" % [item, quantity])

func modify_stat(stat: String, amount: int) -> void:
	var gs = _get_game_state()
	if gs and gs.game_state.has("stats") and gs.game_state["stats"].has(stat):
		gs.game_state["stats"][stat] += amount
		gs.game_state["stats"][stat] = max(0, gs.game_state["stats"][stat])  # Don't go below 0
		RuntimeLog.info(
			"DialogueBase: Modified stat %s by %d -> %s"
			% [stat, amount, str(gs.game_state["stats"][stat])]
		)

func give_experience(amount: int) -> void:
	modify_stat("experience", amount)

func play_sound(sound_name: String) -> void:
	var audio_manager = _get_audio_manager()
	if audio_manager:
		# Try to find the sound in the audio manager
		var sound_stream = audio_manager.get(sound_name)
		if sound_stream and sound_stream is AudioStream:
			audio_manager.play_sfx(sound_stream)
		else:
			RuntimeLog.warn("DialogueBase: Sound not found: %s" % sound_name)

# Null-safety wrapper methods for singleton access
func _get_game_modes() -> Node:
	var gm = RuntimeServices.game_modes(self)
	if not gm:
		push_error("DialogueBase: GameModes singleton not found")
	return gm

func _get_game_state() -> Node:
	var gs = RuntimeServices.game_state(self)
	if not gs:
		push_error("DialogueBase: GameState singleton not found")
	return gs

func _get_audio_manager() -> Node:
	var am = RuntimeServices.audio_manager(self)
	if not am:
		push_error("DialogueBase: AudioManager singleton not found")
	return am
