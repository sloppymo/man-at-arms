extends "res://scenes/dialogue/dialogue_base.gd"

func _ready() -> void:
	encounter_type = "castle_gate"
	super._ready()

func start_dialogue() -> void:
	show_text("You approach the imposing castle gates. Armed guards stand watch, and a sergeant-at-arms oversees the comings and goings. The castle represents authority and safety in these troubled times.")

	show_choices([
		"Speak with the sergeant-at-arms",
		"Request an audience with the lord",
		"Ask about joining the garrison",
		"Deliver a message (if you have one)",
		"Leave the castle gate"
	])

func _on_choice_selected(choice_index: int) -> void:
	match choice_index:
		0:  # Sergeant-at-arms
			show_text("\"State your business, soldier. The castle is on high alert with reports of bandits in the region. What brings you to our gates?\"")
			show_choices([
				"I'm part of the chevauchee forces",
				"I'm here to report bandit activity",
				"I'm seeking shelter for the night",
				"Go back"
			])
		1:  # Audience with lord
			show_text("The sergeant eyes you critically. \"The lord is busy with matters of state. Unless you bring urgent news of the chevauchee or a direct message from your commander, you'll need to make an appointment through proper channels.\"")
			show_continue()
		2:  # Join garrison
			show_text("\"We can always use experienced soldiers like yourself. However, with the chevauchee ongoing, most of our forces are committed. You could speak to the captain about temporary assignment or mercenary work.\"")
			show_continue()
		3:  # Deliver message
			show_text("You don't currently have any messages to deliver to the castle authorities. If you acquire important intelligence during your chevauchee, this would be the place to bring it.")
			show_continue()
		4:  # Leave
			_on_exit_pressed()

func _on_continue_pressed() -> void:
	# Return to main castle gate choices
	start_dialogue()
