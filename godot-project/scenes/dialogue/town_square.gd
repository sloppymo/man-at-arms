extends "res://scenes/dialogue/dialogue_base.gd"

func _ready() -> void:
	encounter_type = "town_square"
	super._ready()

func start_dialogue() -> void:
	show_text("You arrive in the bustling town square. Merchants hawk their wares and townsfolk go about their business. A notice board catches your eye with various postings.")

	show_choices([
		"Check the notice board for quests",
		"Visit the local tavern for rumors",
		"Speak with the town guard",
		"Leave the town square"
	])

func _on_choice_selected(choice_index: int) -> void:
	match choice_index:
		0:  # Notice board
			show_text("The notice board has several postings:\n\n• Wanted: Bandits in the northern woods (Reward: 50 gold)\n• Help needed: Missing livestock on Farmer Giles' property\n• Town guard recruiting: Join the militia\n\nYou could take on one of these tasks.")
			show_choices([
				"Accept the bandit quest",
				"Help with the missing livestock",
				"Join the town militia",
				"Go back"
			])
		1:  # Tavern
			show_text("The tavern is lively with patrons sharing stories. You overhear rumors of:\n\n• Strange lights in the old ruins to the east\n• A merchant caravan that never arrived\n• Bandits becoming bolder in their raids\n\nThe barkeep offers you a drink on the house for your service to the realm.")
			give_experience(5)  # Small experience for gathering rumors
			show_continue()
		2:  # Town guard
			show_text("\"Hail, soldier! We've been hearing reports of increased bandit activity. The chevauchee forces could use more men like you. If you're interested in joining a patrol, speak to the captain at the castle gate.\"")
			show_continue()
		3:  # Leave
			_on_exit_pressed()

func _on_continue_pressed() -> void:
	# Return to main town square choices
	start_dialogue()
