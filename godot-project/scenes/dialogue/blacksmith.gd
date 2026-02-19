extends "res://scenes/dialogue/dialogue_base.gd"

func _ready() -> void:
	encounter_type = "blacksmith"
	super._ready()

func start_dialogue() -> void:
	show_text("The blacksmith's forge is hot and busy. The smith, a burly man with arms like tree trunks, looks up from his anvil. Hammers clang against metal, and the air smells of hot iron and coal.")

	show_choices([
		"Ask about weapon repairs",
		"Inquire about custom work",
		"Buy supplies or equipment",
		"Ask for information about the area",
		"Leave the blacksmith"
	])

func _on_choice_selected(choice_index: int) -> void:
	match choice_index:
		0:  # Weapon repairs
			show_text("\"Weapons, eh? Show me what you've got. I can sharpen blades, repair hafts, and fix most battlefield damage. Good maintenance is the difference between life and death out there.\"")
			show_choices([
				"Repair your sword (if damaged)",
				"Sharpen your blade",
				"Check equipment condition",
				"Go back"
			])
		1:  # Custom work
			show_text("\"Custom work takes time and coin, soldier. What did you have in mind? I can modify weapons, add reinforcements, or even craft special pieces if you bring the materials.\"")
			show_continue()
		2:  # Buy supplies
			show_text("\"I've got basic supplies for soldiers on campaign. Nails, rope, spare horseshoes, that sort of thing. Also some field rations if you're running low.\"")
			show_choices([
				"Buy field rations",
				"Buy repair supplies",
				"Buy horse supplies",
				"Go back"
			])
		3:  # Local information
			show_text("\"Bandits have been getting bolder lately. They've hit several farms to the north. The town's been quiet, but everyone knows it won't last. Keep your wits about you on the roads.\"")
			give_experience(3)  # Small experience for gathering local knowledge
			show_continue()
		4:  # Leave
			_on_exit_pressed()

func _on_continue_pressed() -> void:
	# Return to main blacksmith choices
	start_dialogue()
