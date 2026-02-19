extends Node

const RuntimeLog = preload("res://scripts/runtime_log.gd")

const SAVE_FILE_PATH: String = "user://savegame.json"
const SAVE_FILE_NAME: String = "savegame.json"
const CORRUPT_SUFFIX_PREFIX: String = ".corrupt-"

var game_state: Dictionary = {}
var schema_version: int = 2

func _ready() -> void:
	reset_to_default()

func reset_to_default() -> void:
	game_state = {
		"schema_version": 2,
		"stats": {
			"strength": 5,
			"agility": 5,
			"endurance": 5,
			"charisma": 5,
			"luck": 5,
			"wits": 5,
			"wealth": 120,
			"reputation": 0,
			"morale": 5,
			"stress": 0,
			"experience": 0,
			"patron_favor": 0
		},
		"faction": "English",
		"age": 27,
		"age_range": null,
		"year": 1337,
		"location": "England",
		"region": "England",
		"mode": "title",
		"level": 1,
		"level_up_points": 0,
		"rank": "Common Soldier",
		"current_scene": "landing",
		"chapter": null,
		"chapter_progress": {
			"chevauchee": {"started": false, "completed": false},
			"calais": {"started": false, "completed": false},
			"plague": {"started": false, "completed": false},
			"poitiers": {"started": false, "completed": false}
		},
		"character_creation_step": 1,
		"character_name": "",
		"patron_id": null,
		"patron": null,
		"patron_event_path": null,
		"starting_kit_tier": null,
		"background": null,
		"selected_background": null,
		"culture": "",
		"origin": null,
		"scenes_visited": [],
		"entered_scenes": [],  # Array instead of Set
		"inventory": [],
		"equipment": {
			"head": {
				"base": null,
				"padding": null,
				"mail": null,
				"plate": null
			},
			"torso": {
				"base": null,
				"padding": null,
				"mail": null,
				"plate": null,
				"surcoat": null
			},
			"arms": {
				"base": null,
				"padding": null,
				"mail": null,
				"plate": null
			},
			"legs": {
				"base": null,
				"padding": null,
				"mail": null,
				"plate": null
			},
			"weapon": {
				"main": null,
				"offhand": null
			},
			"missile": {
				"main": null
			},
			"accessory": {
				"primary": null
			},
			"bag": []
		},
		"kit_tier": "Standard",
		"starting_kit_granted": false,
		"priorities": {
			"might": null,
			"finesse": null,
			"wits": null,
			"presence": null,
			"fortune": null
		},
		"conditions": [],
		"flags": {},
		"relationships": {
			"wat": 0,
			"cook": 0,
			"oana": 0
		},
		"campfire": {
			"cooldown_scenes": 2,
			"chance": 0.35,
			"last_inserted_at_index": 0,
			"seen_ids": [],
			"return_scene": null,
			"current_vignette_id": null,
			"current_step": 0,
			"step_history": [],
			"mode": null,
			"micro_seen_ids": [],
			"last_mode": null
		},
		"random_encounter": {
			"active": false,
			"return_scene": null,
			"cooldown": 0
		},
		"career": {
			"battles": 0,
			"wounds": 0,
			"promotions": 0
		},
		"exertion": 0,
		"wear": 0,
		"last_skirmish": null,
		"overworld": {
			"time": 480,
			"heat": 0,
			"supplies": {
				"food": 10,
				"water": 10,
				"forage": 5
			},
			"discovered": [],
			"position": {"q": 0, "r": 0},
			"chevauchee": {
				"raids_completed": 0,
				"wealth_accumulated": 0,
				"days_in_field": 0,
				"last_encounter_time": null
			}
		}
	}

func save_game() -> void:
	var file := FileAccess.open(SAVE_FILE_PATH, FileAccess.WRITE)
	if file == null:
		RuntimeLog.error("GameState: Failed to open save file for write")
		return

	file.store_string(JSON.stringify(game_state))
	file.close()
	RuntimeLog.info("GameState: Game saved successfully")

func load_game() -> bool:
	if not FileAccess.file_exists(SAVE_FILE_PATH):
		RuntimeLog.info("GameState: No save file found")
		return false

	var file := FileAccess.open(SAVE_FILE_PATH, FileAccess.READ)
	if file == null:
		RuntimeLog.error("GameState: Failed to open save file")
		reset_to_default()
		return false

	var json_string: String = file.get_as_text()
	file.close()

	var json := JSON.new()
	var parse_error: Error = json.parse(json_string)
	if parse_error != OK:
		RuntimeLog.error(
			"GameState: Failed to parse save JSON: %s (line %d)"
			% [json.get_error_message(), json.get_error_line()]
		)
		_quarantine_corrupt_save_file()
		reset_to_default()
		return false

	if not (json.data is Dictionary):
		RuntimeLog.error("GameState: Invalid save root type %s" % type_string(typeof(json.data)))
		_quarantine_corrupt_save_file()
		reset_to_default()
		return false

	var loaded_data: Dictionary = json.data

	# Check schema version compatibility
	var loaded_version: int = int(loaded_data.get("schema_version", 0))
	if loaded_version != schema_version:
		push_warning("Save file schema version mismatch: expected %d, got %d" % [schema_version, loaded_version])

	# Start with defaults, then merge loaded data over them.
	reset_to_default()
	game_state = _merge_with_defaults(game_state, loaded_data) as Dictionary
	RuntimeLog.info("GameState: Game loaded successfully")
	return true

func _quarantine_corrupt_save_file() -> void:
	var user_dir := DirAccess.open("user://")
	if user_dir == null:
		RuntimeLog.error("GameState: Failed to open user:// for corrupt save quarantine")
		return

	var timestamp: String = _build_timestamp()
	var base_name: String = "%s%s%s" % [SAVE_FILE_NAME, CORRUPT_SUFFIX_PREFIX, timestamp]
	var target_name: String = base_name
	var counter: int = 1

	while user_dir.file_exists(target_name):
		target_name = "%s-%d" % [base_name, counter]
		counter += 1

	var rename_error: Error = user_dir.rename(SAVE_FILE_NAME, target_name)
	if rename_error != OK:
		RuntimeLog.error("GameState: Failed to quarantine corrupt save file (error %d)" % rename_error)
		return

	RuntimeLog.warn("GameState: Corrupt save quarantined as user://%s" % target_name)

func _build_timestamp() -> String:
	var timestamp := Time.get_datetime_dict_from_system()
	return "%04d%02d%02d-%02d%02d%02d" % [
		int(timestamp.get("year", 1970)),
		int(timestamp.get("month", 1)),
		int(timestamp.get("day", 1)),
		int(timestamp.get("hour", 0)),
		int(timestamp.get("minute", 0)),
		int(timestamp.get("second", 0))
	]

func _merge_with_defaults(default_value: Variant, loaded_value: Variant) -> Variant:
	if default_value is Dictionary:
		if not (loaded_value is Dictionary):
			return (default_value as Dictionary).duplicate(true)

		var default_dict: Dictionary = default_value
		var loaded_dict: Dictionary = loaded_value
		var merged: Dictionary = default_dict.duplicate(true)

		for key in loaded_dict.keys():
			if merged.has(key):
				merged[key] = _merge_with_defaults(merged[key], loaded_dict[key])
			else:
				# Preserve unknown fields for forward/backward compatibility.
				merged[key] = loaded_dict[key]
		return merged

	if default_value is Array:
		if loaded_value is Array:
			return (loaded_value as Array).duplicate(true)
		return (default_value as Array).duplicate(true)

	return _coerce_scalar(default_value, loaded_value)

func _coerce_scalar(default_value: Variant, loaded_value: Variant) -> Variant:
	if default_value == null:
		return loaded_value
	if loaded_value == null:
		return default_value

	match typeof(default_value):
		TYPE_INT:
			if loaded_value is int:
				return int(loaded_value)
			if loaded_value is float:
				return int(round(loaded_value))
			return default_value
		TYPE_FLOAT:
			if loaded_value is int or loaded_value is float:
				return float(loaded_value)
			return default_value
		TYPE_STRING:
			return str(loaded_value) if loaded_value is String else default_value
		TYPE_BOOL:
			return bool(loaded_value) if loaded_value is bool else default_value
		_:
			return loaded_value if typeof(loaded_value) == typeof(default_value) else default_value

func _deep_merge(base: Dictionary, overlay: Dictionary) -> Dictionary:
	# Retained for backward compatibility with existing scripts/tests.
	return _merge_with_defaults(base, overlay) as Dictionary
