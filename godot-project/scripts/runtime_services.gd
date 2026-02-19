extends RefCounted

static func game_modes(context: Node) -> Node:
	return _autoload(context, "GameModes")

static func game_state(context: Node) -> Node:
	return _autoload(context, "GameState")

static func event_bus(context: Node) -> Node:
	return _autoload(context, "EventBus")

static func audio_manager(context: Node) -> Node:
	return _autoload(context, "AudioManager")

static func particle_manager(context: Node) -> Node:
	return _autoload(context, "ParticleManager")

static func _autoload(context: Node, name: String) -> Node:
	if context == null:
		return null

	var tree: SceneTree = context.get_tree()
	if tree == null or tree.root == null:
		return null

	return tree.root.get_node_or_null(name)
