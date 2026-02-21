extends Node
## Hardened Combat State Machine
## Ensures deterministic transitions and validates combat state flow
## Day 1 deliverable: Eliminate invalid mode transitions and edge-case scene swaps

const RuntimeLog = preload("res://scripts/runtime_log.gd")

enum CombatState {
	INACTIVE,
	ENTERING,
	ACTIVE,
	EXITING_VICTORY,
	EXITING_DEFEAT,
	EXITING_ABORT
}

const VALID_COMBAT_TRANSITIONS = {
	CombatState.INACTIVE: [CombatState.ENTERING],
	CombatState.ENTERING: [CombatState.ACTIVE, CombatState.INACTIVE],
	CombatState.ACTIVE: [
		CombatState.EXITING_VICTORY,
		CombatState.EXITING_DEFEAT,
		CombatState.EXITING_ABORT
	],
	CombatState.EXITING_VICTORY: [CombatState.INACTIVE],
	CombatState.EXITING_DEFEAT: [CombatState.INACTIVE],
	CombatState.EXITING_ABORT: [CombatState.INACTIVE]
}

const GAME_MODE_TO_COMBAT_STATE = {
	# Maps GameModes.GameMode to expected CombatState
	"overworld": CombatState.INACTIVE,
	"dialogue": CombatState.INACTIVE,
	"combat": CombatState.ACTIVE,
	"death": CombatState.INACTIVE,
	"camp": CombatState.INACTIVE
}

var current_state: CombatState = CombatState.INACTIVE
var state_entry_time_ms: int = 0
var last_valid_state: CombatState = CombatState.INACTIVE

# Transition history for debugging/regression
var transition_history: Array[Dictionary] = []
const MAX_HISTORY_SIZE = 50

# Validation flags
var strict_mode: bool = true
var log_all_transitions: bool = true

# Signals
signal state_changed(from: CombatState, to: CombatState, duration_ms: int)
signal transition_rejected(from: CombatState, to: CombatState, reason: String)
signal combat_state_error(error_type: String, details: Dictionary)

func _ready() -> void:
	state_entry_time_ms = Time.get_ticks_msec()
	RuntimeLog.info("CombatStateMachine: Initialized in state %s" % _state_name(current_state))

## Attempt state transition with validation
func transition_to(new_state: CombatState, context: Dictionary = {}) -> bool:
	var from_state := current_state
	
	# Validate transition
	if not _is_transition_allowed(from_state, new_state):
		var reason := _get_rejection_reason(from_state, new_state)
		transition_rejected.emit(from_state, new_state, reason)
		
		if strict_mode:
			push_error("CombatStateMachine: Rejected transition %s -> %s: %s" % [
				_state_name(from_state), _state_name(new_state), reason
			])
			combat_state_error.emit("TRANSITION_REJECTED", {
				"from": from_state,
				"to": new_state,
				"reason": reason,
				"context": context
			})
			return false
		else:
			RuntimeLog.warn("CombatStateMachine: Allowed invalid transition %s -> %s (strict_mode=false)" % [
				_state_name(from_state), _state_name(new_state)
			])
	
	# Execute transition
	var now := Time.get_ticks_msec()
	var duration := now - state_entry_time_ms
	
	current_state = new_state
	last_valid_state = from_state
	state_entry_time_ms = now
	
	# Record in history
	_record_transition(from_state, new_state, duration, context)
	
	if log_all_transitions:
		RuntimeLog.info("CombatStateMachine: Transition %s -> %s (duration: %dms)" % [
			_state_name(from_state), _state_name(new_state), duration
		])
	
	state_changed.emit(from_state, new_state, duration)
	return true

## Validate GameMode is compatible with expected combat state
func validate_mode_sync(game_mode: int, game_modes_ref) -> bool:
	var expected_combat_state := _get_expected_combat_state_for_mode(game_mode, game_modes_ref)
	
	if expected_combat_state == -1:
		# Mode doesn't have combat state mapping (neutral modes)
		return true
	
	if current_state != expected_combat_state:
		var mode_name: String = str(game_modes_ref.get_mode_name(game_mode)) if game_modes_ref else str(game_mode)
		var details := {
			"game_mode": mode_name,
			"expected_combat_state": _state_name(expected_combat_state),
			"actual_combat_state": _state_name(current_state)
		}
		combat_state_error.emit("MODE_STATE_MISMATCH", details)
		
		if strict_mode:
			push_error("CombatStateMachine: Mode/state mismatch - mode=%s, expected=%s, actual=%s" % [
				mode_name, _state_name(expected_combat_state), _state_name(current_state)
			])
			return false
		else:
			RuntimeLog.warn("CombatStateMachine: Mode/state mismatch (strict_mode=false): %s" % details)
	
	return true

## Enter combat flow with full validation
func enter_combat(combat_payload: Dictionary = {}) -> bool:
	var context := {"payload": combat_payload, "action": "enter_combat"}
	
	# Can only enter from INACTIVE
	if current_state != CombatState.INACTIVE:
		RuntimeLog.error("CombatStateMachine: Cannot enter combat from state %s" % _state_name(current_state))
		return false
	
	if not transition_to(CombatState.ENTERING, context):
		return false
	
	# ENTERING -> ACTIVE should happen within reasonable time
	# This is typically triggered by combat_scene._ready()
	return true

## Mark combat as fully initialized
func mark_combat_active() -> bool:
	if current_state != CombatState.ENTERING:
		RuntimeLog.error("CombatStateMachine: Cannot mark active from state %s" % _state_name(current_state))
		return false
	
	return transition_to(CombatState.ACTIVE, {"action": "mark_active"})

## Exit combat with result validation
func exit_combat(victory: bool, result_data: Dictionary = {}) -> bool:
	if current_state != CombatState.ACTIVE:
		RuntimeLog.error("CombatStateMachine: Cannot exit combat from state %s" % _state_name(current_state))
		return false
	
	var exit_state := CombatState.EXITING_VICTORY if victory else CombatState.EXITING_DEFEAT
	var context := {
		"victory": victory,
		"result": result_data,
		"action": "exit_combat"
	}
	
	return transition_to(exit_state, context)

## Mark combat exit complete (return to inactive)
func mark_combat_exited() -> bool:
	if current_state not in [CombatState.EXITING_VICTORY, CombatState.EXITING_DEFEAT, CombatState.EXITING_ABORT]:
		RuntimeLog.error("CombatStateMachine: Cannot mark exited from state %s" % _state_name(current_state))
		return false
	
	return transition_to(CombatState.INACTIVE, {"action": "mark_exited"})

## Abort combat (emergency exit)
func abort_combat(reason: String) -> bool:
	RuntimeLog.warn("CombatStateMachine: Aborting combat - %s" % reason)
	return transition_to(CombatState.EXITING_ABORT, {"action": "abort", "reason": reason})

## Check if currently in combat (entering or active)
func is_in_combat() -> bool:
	return current_state in [CombatState.ENTERING, CombatState.ACTIVE]

## Check if combat is fully active (ready for gameplay)
func is_combat_active() -> bool:
	return current_state == CombatState.ACTIVE

## Get time spent in current state
func get_state_duration_ms() -> int:
	return Time.get_ticks_msec() - state_entry_time_ms

## Get transition history
func get_transition_history() -> Array[Dictionary]:
	return transition_history.duplicate()

## Clear transition history
func clear_history() -> void:
	transition_history.clear()

## Validate entire combat flow state (call periodically or on suspicious transitions)
func validate_combat_flow_integrity(game_modes_ref, event_bus_ref) -> Dictionary:
	var errors: Array[String] = []
	var warnings: Array[String] = []
	
	# Check GameModes sync
	if game_modes_ref:
		var current_mode = game_modes_ref.get_current_mode()
		if not validate_mode_sync(current_mode, game_modes_ref):
			errors.append("GameMode/CombatState desync detected")
	
	# Check EventBus sync
	if event_bus_ref:
		var pending_start = event_bus_ref.peek_combat_start() if event_bus_ref.has_method("peek_combat_start") else {}
		var pending_result = {}  # Can't peek result, but we can check flags
		
		# If we have pending combat start but we're not entering/active, that's a problem
		if not pending_start.is_empty() and not is_in_combat():
			warnings.append("EventBus has pending combat_start but combat state is %s" % _state_name(current_state))
	
	# Check for stuck states
	var state_duration := get_state_duration_ms()
	match current_state:
		CombatState.ENTERING:
			if state_duration > 10000:  # 10 seconds to load combat
				errors.append("Stuck in ENTERING state for %d ms" % state_duration)
		CombatState.EXITING_VICTORY, CombatState.EXITING_DEFEAT, CombatState.EXITING_ABORT:
			if state_duration > 5000:  # 5 seconds to exit
				errors.append("Stuck in EXITING state for %d ms" % state_duration)
	
	var result := {
		"valid": errors.is_empty(),
		"errors": errors,
		"warnings": warnings,
		"current_state": _state_name(current_state),
		"state_duration_ms": state_duration
	}
	
	if not errors.is_empty():
		combat_state_error.emit("INTEGRITY_CHECK_FAILED", result)
	
	return result

func _is_transition_allowed(from: CombatState, to: CombatState) -> bool:
	if from not in VALID_COMBAT_TRANSITIONS:
		return false
	return to in VALID_COMBAT_TRANSITIONS[from]

func _get_rejection_reason(from: CombatState, to: CombatState) -> String:
	if from not in VALID_COMBAT_TRANSITIONS:
		return "Unknown source state"
	if to not in VALID_COMBAT_TRANSITIONS[from]:
		return "Transition not in allowed set for %s" % _state_name(from)
	return "Unknown"

func _record_transition(from: CombatState, to: CombatState, duration_ms: int, context: Dictionary) -> void:
	var record := {
		"timestamp_ms": Time.get_ticks_msec(),
		"from": from,
		"to": to,
		"from_name": _state_name(from),
		"to_name": _state_name(to),
		"duration_ms": duration_ms,
		"context": context.duplicate()
	}
	
	transition_history.append(record)
	if transition_history.size() > MAX_HISTORY_SIZE:
		transition_history.pop_front()

func _get_expected_combat_state_for_mode(game_mode: int, game_modes_ref) -> int:
	# Map GameModes.GameMode enum values to expected CombatState
	if game_modes_ref == null:
		return -1
	
	# Use reflection to get mode names
	var mode_name := ""
	match game_mode:
		game_modes_ref.GameMode.OVERWORLD:
			mode_name = "overworld"
		game_modes_ref.GameMode.COMBAT:
			mode_name = "combat"
		game_modes_ref.GameMode.DIALOGUE:
			mode_name = "dialogue"
		game_modes_ref.GameMode.DEATH:
			mode_name = "death"
		game_modes_ref.GameMode.CAMP:
			mode_name = "camp"
		_:
			return -1  # Neutral modes
	
	if mode_name in GAME_MODE_TO_COMBAT_STATE:
		return GAME_MODE_TO_COMBAT_STATE[mode_name]
	return -1

func _state_name(state: CombatState) -> String:
	match state:
		CombatState.INACTIVE:
			return "INACTIVE"
		CombatState.ENTERING:
			return "ENTERING"
		CombatState.ACTIVE:
			return "ACTIVE"
		CombatState.EXITING_VICTORY:
			return "EXITING_VICTORY"
		CombatState.EXITING_DEFEAT:
			return "EXITING_DEFEAT"
		CombatState.EXITING_ABORT:
			return "EXITING_ABORT"
	return "UNKNOWN(%d)" % int(state)
