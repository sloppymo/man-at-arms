extends CanvasLayer
## Combat State Debug Overlay
## Visualizes current game mode and combat state for development/debugging
## Toggle with F12 or add to scene for always-on display

const RuntimeServices = preload("res://scripts/runtime_services.gd")
const CombatStateMachine = preload("res://scripts/combat_state_machine.gd")
const RuntimeLog = preload("res://scripts/runtime_log.gd")

# Cache enum values for type safety
const CS_INACTIVE: int = CombatStateMachine.CombatState.INACTIVE
const CS_ENTERING: int = CombatStateMachine.CombatState.ENTERING
const CS_ACTIVE: int = CombatStateMachine.CombatState.ACTIVE
const CS_EXITING_VICTORY: int = CombatStateMachine.CombatState.EXITING_VICTORY
const CS_EXITING_DEFEAT: int = CombatStateMachine.CombatState.EXITING_DEFEAT
const CS_EXITING_ABORT: int = CombatStateMachine.CombatState.EXITING_ABORT

@export var visible_by_default: bool = false
@export var show_transition_history: bool = true
@export var max_history_display: int = 5

var state_label: Label
var mode_label: Label
var transition_label: Label
var history_container: VBoxContainer
var integrity_label: Label

var game_modes: Node = null
var event_bus: Node = null
var combat_state_machine: Node = null

var update_interval_ms: int = 100
var last_update_ms: int = 0

func _ready() -> void:
	layer = 100  # Always on top
	visible = visible_by_default
	
	_create_ui()
	_resolve_services()
	
	RuntimeLog.info("CombatStateDebugOverlay: Initialized (F12 to toggle)")

func _input(event: InputEvent) -> void:
	if event is InputEventKey:
		if event.pressed and event.keycode == KEY_F12:
			visible = not visible
			var viewport_ref: Viewport = get_viewport()
			if viewport_ref != null:
				viewport_ref.set_input_as_handled()

func _process(_delta: float) -> void:
	if not visible:
		return
	
	var now: int = Time.get_ticks_msec()
	if now - last_update_ms < update_interval_ms:
		return
	last_update_ms = now
	
	_update_display()

func _create_ui() -> void:
	var panel := Panel.new()
	panel.name = "DebugPanel"
	panel.position = Vector2(10, 10)
	panel.size = Vector2(350, 200)
	
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0, 0, 0, 0.8)
	style.border_color = Color(0.5, 0.5, 0.5, 1)
	style.border_width_left = 2
	style.border_width_right = 2
	style.border_width_top = 2
	style.border_width_bottom = 2
	panel.add_theme_stylebox_override("panel", style)
	
	var vbox := VBoxContainer.new()
	vbox.name = "MainContainer"
	vbox.position = Vector2(10, 10)
	vbox.size = Vector2(330, 180)
	panel.add_child(vbox)
	
	# Title
	var title := Label.new()
	title.text = "🎮 COMBAT STATE DEBUG"
	title.add_theme_font_size_override("font_size", 14)
	title.add_theme_color_override("font_color", Color(1, 1, 0.5, 1))
	vbox.add_child(title)
	
	# Separator
	var sep1 := HSeparator.new()
	vbox.add_child(sep1)
	
	# Current Game Mode
	mode_label = Label.new()
	mode_label.name = "ModeLabel"
	mode_label.text = "Mode: --"
	vbox.add_child(mode_label)
	
	# Current Combat State
	state_label = Label.new()
	state_label.name = "StateLabel"
	state_label.text = "State: --"
	vbox.add_child(state_label)
	
	# Integrity check
	integrity_label = Label.new()
	integrity_label.name = "IntegrityLabel"
	integrity_label.text = "Integrity: --"
	vbox.add_child(integrity_label)
	
	# Separator
	var sep2 := HSeparator.new()
	vbox.add_child(sep2)
	
	# Recent transition
	transition_label = Label.new()
	transition_label.name = "TransitionLabel"
	transition_label.text = "Last: --"
	transition_label.add_theme_font_size_override("font_size", 10)
	vbox.add_child(transition_label)
	
	# History container
	if show_transition_history:
		var history_title := Label.new()
		history_title.text = "\nRecent Transitions:"
		history_title.add_theme_font_size_override("font_size", 10)
		history_title.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7, 1))
		vbox.add_child(history_title)
		
		history_container = VBoxContainer.new()
		history_container.name = "HistoryContainer"
		vbox.add_child(history_container)
	
	add_child(panel)

func _resolve_services() -> void:
	game_modes = RuntimeServices.game_modes(self)
	event_bus = RuntimeServices.event_bus(self)
	
	# Try to find existing CombatStateMachine or use GameModes reference
	combat_state_machine = _find_combat_state_machine()

func _find_combat_state_machine() -> Node:
	# Check if CombatStateMachine is already an autoload
	var root: Node = get_tree().root
	var csm: Node = root.get_node_or_null("CombatStateMachine")
	if csm != null:
		return csm
	
	# Check if it's a child of current scene
	var current: Node = get_tree().current_scene
	if current:
		for child in current.get_children():
			if child is CombatStateMachine:
				return child
	
	return null

func _update_display() -> void:
	if game_modes == null:
		game_modes = RuntimeServices.game_modes(self)
	
	# Update mode label
	if game_modes != null:
		var mode_name: String = _get_mode_name()
		var mode_color: Color = _get_mode_color()
		mode_label.text = "Mode: %s" % mode_name
		mode_label.add_theme_color_override("font_color", mode_color)
	
	# Update state label
	var state_name := "--"
	var state_color := Color.WHITE
	
	if combat_state_machine != null:
		var state: int = int(combat_state_machine.get("current_state"))
		state_name = _combat_state_name(state)
		state_color = _combat_state_color(state)
	else:
		# Infer from GameMode
		if game_modes != null:
			state_name = _infer_state_from_mode()
			state_color = Color.GRAY
	
	state_label.text = "State: %s" % state_name
	state_label.add_theme_color_override("font_color", state_color)
	
	# Update integrity
	var integrity: Dictionary = _check_integrity()
	integrity_label.text = "Integrity: %s" % str(integrity.get("status", "--"))
	var integrity_color_variant: Variant = integrity.get("color", Color.WHITE)
	var integrity_color: Color = integrity_color_variant as Color if integrity_color_variant is Color else Color.WHITE
	integrity_label.add_theme_color_override("font_color", integrity_color)
	
	# Update transition history
	_update_history_display()

func _get_mode_name() -> String:
	if game_modes == null:
		return "N/A"
	
	if game_modes.has_method("get_mode_name"):
		return str(game_modes.get_mode_name(game_modes.current_mode))
	
	# Fallback
	match game_modes.current_mode:
		game_modes.GameMode.TITLE:
			return "TITLE"
		game_modes.GameMode.COMBAT:
			return "COMBAT"
		game_modes.GameMode.OVERWORLD:
			return "OVERWORLD"
		game_modes.GameMode.DIALOGUE:
			return "DIALOGUE"
		game_modes.GameMode.DEATH:
			return "DEATH"
		_:
			return "MODE_%d" % game_modes.current_mode

func _get_mode_color() -> Color:
	if game_modes == null:
		return Color.GRAY
	
	match game_modes.current_mode:
		game_modes.GameMode.COMBAT:
			return Color(1, 0.3, 0.3, 1)  # Red
		game_modes.GameMode.OVERWORLD:
			return Color(0.3, 1, 0.3, 1)  # Green
		game_modes.GameMode.DIALOGUE:
			return Color(0.3, 0.7, 1, 1)  # Blue
		game_modes.GameMode.DEATH:
			return Color(0.5, 0.1, 0.1, 1)  # Dark red
		game_modes.GameMode.TITLE:
			return Color(0.8, 0.8, 0.8, 1)  # Gray
		_:
			return Color.WHITE

func _combat_state_name(state) -> String:
	if state is int:
		match state:
			CS_INACTIVE:
				return "INACTIVE"
			CS_ENTERING:
				return "ENTERING ⏳"
			CS_ACTIVE:
				return "ACTIVE ⚔️"
			CS_EXITING_VICTORY:
				return "EXIT_WIN ✓"
			CS_EXITING_DEFEAT:
				return "EXIT_LOSE ✗"
			CS_EXITING_ABORT:
				return "EXIT_ABORT ⚠"
	return str(state)

func _combat_state_color(state) -> Color:
	if state is int:
		match state:
			CS_INACTIVE:
				return Color.GRAY
			CS_ENTERING:
				return Color.YELLOW
			CS_ACTIVE:
				return Color.GREEN
			CS_EXITING_VICTORY:
				return Color(0.5, 1, 0.5, 1)
			CS_EXITING_DEFEAT:
				return Color.RED
			CS_EXITING_ABORT:
				return Color.ORANGE
	return Color.WHITE

func _infer_state_from_mode() -> String:
	if game_modes == null:
		return "UNKNOWN"
	
	match game_modes.current_mode:
		game_modes.GameMode.COMBAT:
			return "ACTIVE (inferred)"
		_:
			return "INACTIVE (inferred)"

func _check_integrity() -> Dictionary:
	var errors: Array[String] = []
	
	if game_modes == null:
		errors.append("No GameModes")
	
	if game_modes != null and game_modes.is_transitioning:
		# Check for stuck transition
		# (would need timing info from GameModes)
		pass
	
	# Check EventBus state
	if event_bus != null and event_bus.has_method("peek_combat_start"):
		var pending: Dictionary = event_bus.peek_combat_start()
		if not pending.is_empty():
			if game_modes != null and game_modes.current_mode != game_modes.GameMode.COMBAT:
				errors.append("Pending combat start outside COMBAT mode")
	
	if errors.is_empty():
		return {"status": "✓ OK", "color": Color.GREEN}
	else:
		return {"status": "✗ " + errors[0], "color": Color.RED}

func _update_history_display() -> void:
	if history_container == null:
		return
	
	# Clear existing
	for child in history_container.get_children():
		child.queue_free()
	
	var history: Array[Dictionary] = []
	if combat_state_machine != null and combat_state_machine.has_method("get_transition_history"):
		history = combat_state_machine.get_transition_history() as Array[Dictionary]
	
	if history.is_empty():
		var empty_label := Label.new()
		empty_label.text = "  (no transitions)"
		empty_label.add_theme_font_size_override("font_size", 9)
		empty_label.add_theme_color_override("font_color", Color(0.5, 0.5, 0.5, 1))
		history_container.add_child(empty_label)
		return
	
	# Show last N transitions
	var start_idx := maxi(0, history.size() - max_history_display)
	for i in range(start_idx, history.size()):
		var entry: Dictionary = history[i]
		var label := Label.new()
		
		var from_name: String = str(entry.get("from_name", "?"))
		var to_name: String = str(entry.get("to_name", "?"))
		var duration: int = int(entry.get("duration_ms", 0))
		
		label.text = "  %s → %s (%dms)" % [from_name, to_name, duration]
		label.add_theme_font_size_override("font_size", 9)
		history_container.add_child(label)

## Public API for external control

func show_overlay() -> void:
	visible = true

func hide_overlay() -> void:
	visible = false

func toggle_overlay() -> void:
	visible = not visible

func set_combat_state_machine(csm: Node) -> void:
	combat_state_machine = csm
