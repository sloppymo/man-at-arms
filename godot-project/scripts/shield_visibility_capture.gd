extends SceneTree

const CombatConstants = preload("res://scripts/combat_constants.gd")

func _init() -> void:
	call_deferred("_run")

func _run() -> void:
	var combat_scene_resource: PackedScene = load("res://scenes/combat/combat_scene.tscn")
	var combat_scene := combat_scene_resource.instantiate() as CombatScene
	root.add_child(combat_scene)
	await _wait_frames(6)

	if combat_scene == null or combat_scene.player == null:
		push_error("ShieldVisibilityCapture: combat scene/player failed to initialize")
		quit(1)
		return

	var player: CombatPlayer = combat_scene.player
	player.global_position = Vector2(800.0, 600.0)
	player.shield_direction = Vector2.RIGHT
	player.is_blocking = true
	player.shield_broken = false
	player.shield_health = CombatConstants.SHIELD_MAX_HEALTH
	player.call("_update_shield_transform")
	player.call("_sync_shield_collision_state")
	player.call("_update_shield_visual")
	var arc_node: Node = player.get("shield_arc_visual")
	var fill_node: Node = player.get("shield_fill_visual")
	var shield_body_node: Node = player.get("shield_body")
	var arc_point_count: int = 0
	var first_point: Vector2 = Vector2.ZERO
	if arc_node is Line2D:
		var arc_line: Line2D = arc_node as Line2D
		arc_point_count = arc_line.points.size()
		if arc_point_count > 0:
			first_point = arc_line.points[0]
		print(
			"ShieldVisibilityCapture: arc visible=%s width=%.2f points=%d first_point=%s top_level=%s z_index=%d" % [
				str(arc_line.visible),
				arc_line.width,
				arc_point_count,
				str(first_point),
				str(arc_line.top_level),
				arc_line.z_index
			]
		)
	if fill_node is Polygon2D:
		var fill_poly: Polygon2D = fill_node as Polygon2D
		print(
			"ShieldVisibilityCapture: fill visible=%s points=%d top_level=%s z_index=%d color=%s" % [
				str(fill_poly.visible),
				fill_poly.polygon.size(),
				str(fill_poly.top_level),
				fill_poly.z_index,
				str(fill_poly.color)
			]
		)
	if shield_body_node is Node2D:
		var body_2d: Node2D = shield_body_node as Node2D
		print(
			"ShieldVisibilityCapture: shield_body top_level=%s local=%s global=%s player_global=%s" % [
				str(body_2d.top_level),
				str(body_2d.position),
				str(body_2d.global_position),
				str(player.global_position)
			]
		)

	await process_frame
	await RenderingServer.frame_post_draw
	await process_frame
	await RenderingServer.frame_post_draw

	var viewport_texture: Texture2D = root.get_texture()
	if viewport_texture == null:
		push_error("ShieldVisibilityCapture: viewport texture unavailable")
		quit(1)
		return

	var image: Image = viewport_texture.get_image()
	if image == null:
		push_error("ShieldVisibilityCapture: failed to read viewport image")
		quit(1)
		return

	var capture_path: String = "user://shield_visibility_capture.png"
	var save_err: int = image.save_png(capture_path)
	print(
		"ShieldVisibilityCapture: save_err=%d path=%s" % [
			save_err,
			ProjectSettings.globalize_path(capture_path)
		]
	)

	quit(0 if save_err == OK else 1)

func _wait_frames(count: int) -> void:
	for _i in range(count):
		await process_frame
