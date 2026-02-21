extends Node
## Combat State Integration
## Bridges GameModes and CombatStateMachine for deterministic combat flow
## Attaches to GameModes as a child node

const CombatStateMachine = preload("res://scripts/combat_state_machine.gd")
const RuntimeLog = preload("res://scripts/runtime_log.gd")

# Cache enum values for type safety
const CS_INACTIVE := CombatStateMachine.CombatState.INACTIVE
const CS_ENTERING := CombatStateMachine.CombatState.ENTERING
const CS_ACTIVE := CombatStateMachine.CombatState.ACTIVE
const CS_EXITING_VICTORY := CombatStateMachine.CombatState.EXITING_VICTORY
const CS_EXITING_DEFEAT := CombatStateMachine.CombatState.EXITING_DEFEAT
const CS_EXITING_ABORT := CombatStateMachine.CombatState.EXITING_ABORT

var csm: CombatStateMachine = null
var game_modes: Node = null
var event_bus: Node = null

# Validation
var last_integrity_check_ms: int = 0
var integrity_check_interval_ms: int = 500

func _ready() -> void:
	game_modes = get_parent()
	if game_modes == null or not game_modes.has_method("get_current_mode"):
		push_error("CombatStateIntegration: Must be child of GameModes node")
		return
	
	# Create CombatStateMachine
	csm = CombatStateMachine.new()
	csm.name = "CombatStateMachine"
	add_child(csm)
	
	# Connect to GameModes signals
	if game_modes.has_signal("mode_changed"):
		game_modes.mode_changed.connect(_on_mode_changed)
	
	# Connect to EventBus
	_event_bus_connect()
	
	RuntimeLog.info("CombatStateIntegration: Initialized")

func _process(_delta: float) -> void:
	if csm == null:
		return
	
	# Periodic integrity check
	var now: int = Time.get_ticks_msec()
	if now - last_integrity_check_ms >= integrity_check_interval_ms:
		last_integrity_check_ms = now
		_perform_integrity_check()

func _event_bus_connect() -> void:
	# Find EventBus
	var root: Node = get_tree().root if get_tree() else null
	if root:
		event_bus = root.get_node_or_null("EventBus")
	
	if event_bus == null:
		RuntimeLog.warn("CombatStateIntegration: EventBus not found")
		return
	
	# Connect to combat signals
	if event_bus.has_signal("combat_start"):
		event_bus.combat_start.connect(_on_combat_start)
	
	if event_bus.has_signal("combat_end"):
		event_bus.combat_end.connect(_on_combat_end)

func _on_mode_changed(from: int, to: int, forced: bool) -> void:
	if csm == null:
		return
	
	var from_name: String = str(game_modes.get_mode_name(from)) if game_modes.has_method("get_mode_name") else str(from)
	var to_name: String = str(game_modes.get_mode_name(to)) if game_modes.has_method("get_mode_name") else str(to)
	
	RuntimeLog.debug("CombatStateIntegration: Mode changed %s -> %s (forced=%s)" % [from_name, to_name, str(forced)])
	
	# Handle combat entry
	if to == game_modes.GameMode.COMBAT:
		if from != game_modes.GameMode.COMBAT:
			# Starting fresh combat
			var payload: Dictionary = (
				event_bus.peek_combat_start()
				if event_bus and event_bus.has_method("peek_combat_start")
				else {}
			)
			csm.enter_combat(payload)
	
	# Handle combat exit
	if from == game_modes.GameMode.COMBAT:
		if to == game_modes.GameMode.OVERWORLD:
			# Victory path
			csm.exit_combat(true, {})
			csm.mark_combat_exited()
		elif to == game_modes.GameMode.DEATH:
			# Defeat path
			csm.exit_combat(false, {})
			csm.mark_combat_exited()
		else:
			# Abort/other
			csm.abort_combat("Transition to %s" % to_name)
			csm.mark_combat_exited()

func _on_combat_start(_difficulty: String) -> void:
	if csm == null:
		return
	
	# Combat scene should be loading/loaded
	# If we're already in ENTERING or ACTIVE, this is a duplicate
	if csm.current_state == CS_INACTIVE:
		RuntimeLog.warn("CombatStateIntegration: combat_start signal but state is INACTIVE")
	elif csm.current_state == CS_ENTERING:
		# Expected - mark as active when scene is ready
		pass

func _on_combat_end(result: Dictionary) -> void:
	if csm == null:
		return
	
	var victory: bool = bool(result.get("victory", false))
	RuntimeLog.debug("CombatStateIntegration: combat_end victory=%s" % str(victory))

## Called by CombatScene when fully initialized
func mark_combat_active() -> bool:
	if csm == null:
		return false
	
	var success: bool = csm.mark_combat_active()
	if success:
		RuntimeLog.info("CombatStateIntegration: Combat marked ACTIVE")
	return success

## Called by CombatScene on exit cleanup
func mark_combat_exited() -> bool:
	if csm == null:
		return false
	
	var success: bool = csm.mark_combat_exited()
	return success

## Public API for other systems

func is_combat_active() -> bool:
	if csm == null:
		return false
	return csm.is_combat_active()

func is_in_combat() -> bool:
	if csm == null:
		return false
	return csm.is_in_combat()

func get_current_combat_state() -> int:
	if csm == null:
		return CS_INACTIVE
	return csm.current_state

func get_transition_history() -> Array[Dictionary]:
	if csm == null or not csm.has_method("get_transition_history"):
		return []
	return csm.get_transition_history()

func validate_integrity() -> Dictionary:
	if csm == null:
		return {"valid": false, "error": "CombatStateMachine not initialized"}
	
	return csm.validate_combat_flow_integrity(game_modes, event_bus)

func _perform_integrity_check() -> void:
	var result: Dictionary = validate_integrity()
	if not result.get("valid", true):
		var errors: Array = result.get("errors", [])
		for error in errors:
			RuntimeLog.error("CombatStateIntegration: Integrity check - %s" % error)

## Debug helper - add overlay to current scene
func add_debug_overlay() -> void:
	var DebugOverlay = preload("res://scripts/combat_state_debug_overlay.gd")
	var overlay: Node = DebugOverlay.new()
	overlay.name = "CombatStateDebugOverlay"
	
	# Inject our CSM reference
	overlay.combat_state_machine = csm
	
	var tree: SceneTree = get_tree()
	if tree and tree.current_scene:
		tree.current_scene.add_child(overlay)
		RuntimeLog.info("CombatStateIntegration: Added debug overlay to current scene")
