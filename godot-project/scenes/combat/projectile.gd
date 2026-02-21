extends Area2D
class_name CombatProjectile

const CombatConstants = preload("res://scripts/combat_constants.gd")

@export var speed: float = CombatConstants.PROJECTILE_SPEED
@export var damage: int = CombatConstants.PROJECTILE_DAMAGE
@export var lifetime_sec: float = CombatConstants.PROJECTILE_LIFETIME_SEC
@export var max_range: float = CombatConstants.PROJECTILE_MAX_RANGE

var direction: Vector2 = Vector2.RIGHT
var source_enemy: Node = null
var age_sec: float = 0.0
var distance_travelled: float = 0.0
var is_spent: bool = false
var reflected: bool = false
var reflect_count: int = 0
var ignored_shield_owner: Node = null
var ignore_shield_frames_remaining: int = 0

func initialize(
	projectile_direction: Vector2,
	shooter: Node,
	projectile_damage: int,
	projectile_speed: float,
	projectile_lifetime_sec: float,
	projectile_max_range: float = -1.0
) -> void:
	direction = projectile_direction
	source_enemy = shooter
	damage = projectile_damage
	speed = projectile_speed
	lifetime_sec = projectile_lifetime_sec
	if projectile_max_range > 0.0:
		max_range = projectile_max_range
	else:
		max_range = CombatConstants.PROJECTILE_MAX_RANGE
	distance_travelled = 0.0

func _ready() -> void:
	collision_layer = 0
	collision_mask = 0
	set_collision_layer_value(CombatConstants.PROJECTILE_COLLISION_LAYER_BIT, true)
	set_collision_mask_value(1, true)
	set_collision_mask_value(CombatConstants.SHIELD_COLLISION_LAYER_BIT, true)

	if direction == Vector2.ZERO:
		direction = Vector2.RIGHT
	else:
		direction = direction.normalized()
	rotation = direction.angle()

	body_entered.connect(_on_body_entered)
	queue_redraw()

func _physics_process(delta: float) -> void:
	if is_spent:
		return
	if delta <= 0.0:
		return

	if ignore_shield_frames_remaining > 0:
		ignore_shield_frames_remaining -= 1
		if ignore_shield_frames_remaining <= 0:
			ignored_shield_owner = null

	var remaining_range: float = maxf(0.0, max_range - distance_travelled)
	if remaining_range <= 0.0:
		_consume()
		return

	var start_position: Vector2 = global_position
	var step_distance: float = minf(speed * delta, remaining_range)
	var end_position: Vector2 = start_position + direction * step_distance
	if _resolve_travel_collision(start_position, end_position):
		distance_travelled += start_position.distance_to(global_position)
		return

	global_position = end_position
	distance_travelled += step_distance
	age_sec += delta
	if distance_travelled >= max_range or age_sec >= lifetime_sec:
		_consume()

func _draw() -> void:
	draw_circle(Vector2.ZERO, CombatConstants.PROJECTILE_RADIUS, Color(1.0, 0.72, 0.34, 1.0))

func _on_body_entered(body: Node) -> void:
	if is_spent:
		return
	_handle_collision_body(body)

func _resolve_travel_collision(from_position: Vector2, to_position: Vector2) -> bool:
	var ray_query := PhysicsRayQueryParameters2D.create(from_position, to_position)
	ray_query.collision_mask = 0
	ray_query.collide_with_bodies = true
	ray_query.collide_with_areas = false
	ray_query.collision_mask = (1 << (1 - 1)) | (1 << (CombatConstants.SHIELD_COLLISION_LAYER_BIT - 1))
	if source_enemy:
		ray_query.exclude = [source_enemy.get_rid()]

	var ray_hit: Dictionary = get_world_2d().direct_space_state.intersect_ray(ray_query)
	if ray_hit.is_empty():
		return false

	var collider: Variant = ray_hit.get("collider")
	if not (collider is Node):
		return false

	if not _handle_collision_body(collider as Node):
		return false

	global_position = Vector2(ray_hit.get("position", to_position))
	return true

func _handle_collision_body(body: Node) -> bool:
	if body == source_enemy:
		return false

	if body.is_in_group("enemies"):
		if body.has_method("take_damage"):
			body.call("take_damage", damage, direction)
		_consume()
		return true

	if body.is_in_group("player_shield"):
		var shield_owner: Node = body.get_parent()
		if ignored_shield_owner != null and shield_owner == ignored_shield_owner and ignore_shield_frames_remaining > 0:
			return false
		var projectile_reflected: bool = false
		if shield_owner and shield_owner.has_method("resolve_projectile_shield_collision"):
			projectile_reflected = bool(shield_owner.call("resolve_projectile_shield_collision", self, damage, global_position, true))
		elif shield_owner and shield_owner.has_method("take_shield_hit"):
			shield_owner.call("take_shield_hit", damage, global_position, true, self)
		if projectile_reflected:
			return true
		_consume()
		return true

	if body.is_in_group("player"):
		var reflect_count_before: int = reflect_count
		if body.has_method("take_damage"):
			var source_actor: CombatEnemy = source_enemy as CombatEnemy if source_enemy is CombatEnemy else null
			body.call("take_damage", damage, global_position, self, source_actor)
		if reflect_count > reflect_count_before:
			return true
		_consume()
		return true

	if body is StaticBody2D or body is TileMap or body is AnimatableBody2D:
		_consume()
		return true

	return false

func _consume() -> void:
	if is_spent:
		return
	is_spent = true
	set_deferred("monitoring", false)
	queue_free()

func reflect_from_shield(shield_owner: Node, shield_facing: Vector2, shield_origin: Vector2) -> void:
	if is_spent:
		return
	var facing: Vector2 = shield_facing.normalized() if shield_facing != Vector2.ZERO else Vector2.RIGHT
	var reflected_direction: Vector2 = direction.bounce(facing).normalized()
	if reflected_direction == Vector2.ZERO or reflected_direction.dot(facing) < CombatConstants.SHIELD_PERFECT_BLOCK_MIN_REFLECT_ALIGNMENT:
		reflected_direction = facing
	direction = reflected_direction
	rotation = direction.angle()
	reflected = true
	reflect_count += 1
	source_enemy = null
	ignored_shield_owner = shield_owner
	ignore_shield_frames_remaining = maxi(1, CombatConstants.SHIELD_PERFECT_BLOCK_REFLECT_SHIELD_IGNORE_FRAMES)
	global_position = shield_origin + direction * (CombatConstants.SHIELD_COLLISION_RADIUS + CombatConstants.PROJECTILE_RADIUS + 4.0)
