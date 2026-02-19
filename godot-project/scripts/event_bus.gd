extends Node

const RuntimeServices = preload("res://scripts/runtime_services.gd")

# warning-ignore:unused_signal
signal game_start
signal game_save
# warning-ignore:unused_signal
signal game_load
signal combat_start(difficulty: String)
signal combat_end(result: Dictionary)
# warning-ignore:unused_signal
signal stat_changed(stat_name: String, old_value, new_value)

const DEFAULT_COMBAT_TIME_LIMIT: float = 90.0

var _next_combat_id: int = 1
var _pending_combat_start: Dictionary = {}
var _pending_combat_result: Dictionary = {}
var _resolved_combat_ids: Dictionary = {}

func allocate_combat_id() -> int:
	var combat_id := _next_combat_id
	_next_combat_id += 1
	return combat_id

func queue_combat_start(payload: Dictionary) -> Dictionary:
	var normalized := payload.duplicate(true)
	var difficulty := str(normalized.get("difficulty", "normal"))
	normalized["difficulty"] = difficulty

	if not normalized.has("time_limit"):
		normalized["time_limit"] = DEFAULT_COMBAT_TIME_LIMIT

	if not normalized.has("combat_id"):
		normalized["combat_id"] = allocate_combat_id()
	else:
		_next_combat_id = maxi(_next_combat_id, int(normalized["combat_id"]) + 1)

	_pending_combat_start = normalized
	combat_start.emit(difficulty)
	return normalized.duplicate(true)

func peek_combat_start() -> Dictionary:
	return _pending_combat_start.duplicate(true)

func consume_combat_start() -> Dictionary:
	if _pending_combat_start.is_empty():
		return {}

	var payload := _pending_combat_start.duplicate(true)
	_pending_combat_start.clear()
	return payload

func submit_combat_result(result: Dictionary) -> bool:
	if result.is_empty():
		return false

	var normalized := result.duplicate(true)
	var combat_id := int(normalized.get("combat_id", -1))
	if combat_id < 0:
		combat_id = allocate_combat_id()
		normalized["combat_id"] = combat_id

	if _resolved_combat_ids.has(combat_id):
		return false
	_resolved_combat_ids[combat_id] = true

	_pending_combat_result = normalized
	_apply_combat_result_to_game_state(normalized)
	combat_end.emit(normalized.duplicate(true))
	return true

func consume_latest_combat_result() -> Dictionary:
	if _pending_combat_result.is_empty():
		return {}

	var result := _pending_combat_result.duplicate(true)
	_pending_combat_result.clear()
	return result

func clear_combat_flow_state() -> void:
	_pending_combat_start.clear()
	_pending_combat_result.clear()
	_resolved_combat_ids.clear()

func _apply_combat_result_to_game_state(result: Dictionary) -> void:
	var game_state := RuntimeServices.game_state(self)
	if game_state == null:
		return
	if not game_state.game_state.has("stats") or not game_state.game_state.has("overworld"):
		return

	var stats: Dictionary = game_state.game_state["stats"]
	var overworld: Dictionary = game_state.game_state["overworld"]

	if bool(result.get("victory", false)):
		if stats.has("experience"):
			stats["experience"] = int(stats["experience"]) + 10
	else:
		if stats.has("endurance"):
			stats["endurance"] = maxi(1, int(stats["endurance"]) - 1)

	if not overworld.has("time"):
		return

	var time_limit := float(result.get("time_limit", DEFAULT_COMBAT_TIME_LIMIT))
	var time_remaining := float(result.get("time_remaining", time_limit))
	var time_spent := maxf(0.0, time_limit - time_remaining)
	overworld["time"] = float(overworld["time"]) + time_spent
