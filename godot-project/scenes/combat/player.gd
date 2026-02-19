extends CharacterBody2D
class_name CombatPlayer

# Import combat constants
const CombatConstants = preload("res://scripts/combat_constants.gd")
const WEAPON_TRAIL_TEXTURE: Texture2D = preload("res://assets/effects/weapon_trail.png")

signal died

@export var speed: float = CombatConstants.PLAYER_DEFAULT_SPEED
@export var health: int = CombatConstants.PLAYER_DEFAULT_HEALTH
@export var max_health: int = CombatConstants.PLAYER_DEFAULT_HEALTH
@export var damage: int = CombatConstants.PLAYER_DEFAULT_DAMAGE
@export var attack_range: float = CombatConstants.PLAYER_DEFAULT_ATTACK_RANGE
@export var attack_arc: float = CombatConstants.PLAYER_DEFAULT_ATTACK_ARC
@export var attack_cooldown: float = CombatConstants.PLAYER_DEFAULT_ATTACK_COOLDOWN
@export var dodge_cooldown: float = CombatConstants.PLAYER_DEFAULT_DODGE_COOLDOWN
@export var special_cooldown: float = CombatConstants.PLAYER_DEFAULT_SPECIAL_COOLDOWN

var combo_counter: int = 0
var last_combo_hit_ms: int = 0
var last_combo_tier_on_hit: int = 0
var last_combo_damage_multiplier: float = 1.0
var last_combo_stagger_force_multiplier: float = 1.0
var last_combo_stagger_duration_multiplier: float = 1.0
var last_combo_armor_break_level: int = 0
var last_attack_ms: int = 0
var last_dodge_ms: int = 0
var last_special_ms: int = 0
var is_attacking: bool = false
var is_dodging: bool = false
var is_invincible: bool = false
var is_blocking: bool = false
var shield_broken: bool = false
var is_dead: bool = false
var last_movement_direction: Vector2 = Vector2.RIGHT
var last_attack_direction: Vector2 = Vector2.RIGHT
var shield_direction: Vector2 = Vector2.RIGHT
var shield_arc_visual: Line2D = null
var shield_fill_visual: Polygon2D = null
var shield_body: AnimatableBody2D = null
var shield_collision_shape: CollisionShape2D = null
var shield_push_area: Area2D = null
var shield_push_shape: CollisionShape2D = null
var shield_collision_enabled: bool = false
var shield_health: float = CombatConstants.SHIELD_MAX_HEALTH
var shield_break_remaining: float = 0.0
var shield_regen_delay_remaining: float = 0.0
var block_started_ms: int = -1
var last_block_event: Dictionary = {
	"timestamp_ms": 0,
	"perfect_block": false,
	"projectile_block": false,
	"projectile_reflected": false,
	"shield_damage_applied": 0.0,
	"block_window_age_ms": -1
}
var move_intent_velocity: Vector2 = Vector2.ZERO

# Dodge state
var dodge_direction: Vector2 = Vector2.RIGHT
var dodge_remaining_distance: float = 0.0
var dodge_speed: float = 0.0

# Efficient enemy tracking
var nearby_enemies: Array[CombatEnemy] = []
var enemy_update_timer: float = 0.0
const ENEMY_UPDATE_INTERVAL = 0.1  # Update every 100ms

# Camera shake optimization variables
var shake_timer: Timer
var shake_intensity: float = 0.0
var shake_duration: float = 0.0
var original_camera_offset: Vector2 = Vector2.ZERO

@onready var audio_manager = get_node("/root/AudioManager")
@onready var particle_manager = get_node_or_null("/root/ParticleManager")
@onready var sprite: Sprite2D = get_node_or_null("Sprite2D") as Sprite2D

func _ready() -> void:
	add_to_group("player")
	_setup_camera_shake()
	_setup_shield_collision()
	_setup_shield_visual()
	shield_health = CombatConstants.SHIELD_MAX_HEALTH

func _physics_process(delta: float) -> void:
	if is_dead:
		return

	var now: int = Time.get_ticks_msec()
	_update_shield_direction()
	_update_sprite_facing()
	_update_shield_state(delta)
	_update_shield_transform()
	_sync_shield_collision_state()
	_update_shield_visual()

	if is_attacking and now - last_attack_ms > int(attack_cooldown * 1000.0):
		is_attacking = false

	if is_invincible and now - last_dodge_ms > CombatConstants.DODGE_INVINCIBILITY_TIME:
		is_invincible = false

	if combo_counter > 0 and now - last_combo_hit_ms > CombatConstants.COMBO_TIMEOUT_MS:
		combo_counter = 0
		_clear_combo_attack_context()

	enemy_update_timer += delta
	if enemy_update_timer >= ENEMY_UPDATE_INTERVAL:
		update_nearby_enemies()
		enemy_update_timer = 0.0

	if _is_hit_stop_active():
		velocity = Vector2.ZERO
		return

	if is_dodging:
		_apply_dodge_movement(delta)
	else:
		_apply_standard_movement(delta)

	move_and_slide()
	_apply_shield_push(delta)

func _apply_standard_movement(delta: float) -> void:
	var input_vector: Vector2 = Input.get_vector("move_left", "move_right", "move_up", "move_down")
	var target_velocity: Vector2 = Vector2.ZERO

	if input_vector != Vector2.ZERO:
		var speed_multiplier: float = CombatConstants.SHIELD_MOVE_SPEED_MULTIPLIER if is_blocking else 1.0
		target_velocity = input_vector.normalized() * speed * speed_multiplier
		last_movement_direction = input_vector.normalized()
	move_intent_velocity = target_velocity

	var acceleration: float = CombatConstants.PLAYER_MOVE_ACCELERATION
	if target_velocity != Vector2.ZERO:
		if velocity != Vector2.ZERO and velocity.dot(target_velocity) < 0.0:
			acceleration *= CombatConstants.PLAYER_MOVE_TURN_ACCEL_MULTIPLIER
		velocity = velocity.move_toward(target_velocity, acceleration * delta)
	else:
		velocity = velocity.move_toward(Vector2.ZERO, CombatConstants.PLAYER_MOVE_DECELERATION * delta)

func _apply_dodge_movement(delta: float) -> void:
	move_intent_velocity = Vector2.ZERO
	if dodge_remaining_distance <= 0.0:
		_finish_dodge(true)
		return

	var frame_distance: float = minf(dodge_speed * delta, dodge_remaining_distance)
	if delta <= 0.0:
		velocity = dodge_direction * dodge_speed
	else:
		velocity = dodge_direction * (frame_distance / delta)

	dodge_remaining_distance -= frame_distance
	if dodge_remaining_distance <= 0.0:
		_finish_dodge(false)

func _finish_dodge(reset_velocity: bool = true) -> void:
	is_dodging = false
	dodge_remaining_distance = 0.0
	dodge_speed = 0.0
	if reset_velocity:
		velocity = Vector2.ZERO

func _setup_camera_shake() -> void:
	shake_timer = Timer.new()
	shake_timer.wait_time = CombatConstants.SHAKE_UPDATE_RATE
	shake_timer.timeout.connect(_update_shake)
	add_child(shake_timer)

	var camera = get_node_or_null("Camera2D") as Camera2D
	if camera:
		original_camera_offset = camera.offset

func _setup_shield_collision() -> void:
	shield_body = get_node_or_null("ShieldBody") as AnimatableBody2D
	if shield_body == null:
		shield_body = AnimatableBody2D.new()
		shield_body.name = "ShieldBody"
		add_child(shield_body)
	shield_body.top_level = false

	shield_body.collision_layer = 0
	shield_body.collision_mask = 0
	shield_body.set_collision_layer_value(CombatConstants.SHIELD_COLLISION_LAYER_BIT, true)
	shield_body.add_to_group("player_shield")

	shield_collision_shape = shield_body.get_node_or_null("CollisionShape2D") as CollisionShape2D
	if shield_collision_shape == null:
		shield_collision_shape = CollisionShape2D.new()
		shield_collision_shape.name = "CollisionShape2D"
		shield_body.add_child(shield_collision_shape)
	_configure_shield_collision_shape(shield_collision_shape, false)

	shield_push_area = shield_body.get_node_or_null("PushArea") as Area2D
	if shield_push_area == null:
		shield_push_area = Area2D.new()
		shield_push_area.name = "PushArea"
		shield_body.add_child(shield_push_area)

	shield_push_area.collision_layer = 0
	shield_push_area.collision_mask = 0
	shield_push_area.set_collision_mask_value(1, true)
	shield_push_area.monitorable = false
	shield_push_area.monitoring = false

	shield_push_shape = shield_push_area.get_node_or_null("CollisionShape2D") as CollisionShape2D
	if shield_push_shape == null:
		shield_push_shape = CollisionShape2D.new()
		shield_push_shape.name = "CollisionShape2D"
		shield_push_area.add_child(shield_push_shape)
	_configure_shield_collision_shape(shield_push_shape, true)

	shield_collision_enabled = not is_shield_active()
	_update_shield_transform()
	_sync_shield_collision_state()

func _configure_shield_collision_shape(collision_shape: CollisionShape2D, expanded_for_push: bool) -> void:
	var capsule_shape: CapsuleShape2D = collision_shape.shape as CapsuleShape2D
	if capsule_shape == null:
		capsule_shape = CapsuleShape2D.new()
		collision_shape.shape = capsule_shape

	var padding: float = CombatConstants.SHIELD_PUSH_CONTACT_PADDING if expanded_for_push else 0.0
	capsule_shape.radius = CombatConstants.SHIELD_COLLISION_RADIUS + padding
	capsule_shape.height = maxf(
		CombatConstants.SHIELD_COLLISION_WIDTH + padding * 2.0,
		capsule_shape.radius * 2.0
	)

func _update_shield_transform() -> void:
	if shield_body == null:
		return
	var facing: Vector2 = get_shield_facing_direction()
	shield_body.global_position = global_position + facing * CombatConstants.SHIELD_COLLISION_OFFSET
	shield_body.global_rotation = facing.angle()

func _sync_shield_collision_state() -> void:
	var active: bool = is_shield_active()
	if active == shield_collision_enabled:
		return
	shield_collision_enabled = active
	if shield_collision_shape:
		shield_collision_shape.set_deferred("disabled", not active)
	if shield_push_shape:
		shield_push_shape.set_deferred("disabled", not active)
	if shield_push_area:
		shield_push_area.set_deferred("monitoring", active)

func _input(event: InputEvent) -> void:
	if is_dead:
		return

	if event is InputEventMouseButton and event.pressed:
		if event.button_index == MOUSE_BUTTON_LEFT:
			handle_attack()
		elif event.button_index == MOUSE_BUTTON_RIGHT:
			_start_block()
	elif event is InputEventMouseButton and not event.pressed and event.button_index == MOUSE_BUTTON_RIGHT:
		_stop_block()

	if event.is_action_pressed("special_ability"):
		handle_special_ability()

func get_attack_direction() -> Vector2:
	# Primary: Mouse-world aiming for precise directional control.
	var mouse_direction: Vector2 = _get_mouse_aim_direction()
	if mouse_direction != Vector2.ZERO:
		last_attack_direction = mouse_direction
		return mouse_direction

	# Secondary: Use movement input for direction
	var input_vector: Vector2 = Input.get_vector("move_left", "move_right", "move_up", "move_down")
	if input_vector != Vector2.ZERO:
		last_attack_direction = input_vector.normalized()
		return last_attack_direction

	# Tertiary: Use last remembered attack direction
	if last_attack_direction != Vector2.ZERO:
		return last_attack_direction.normalized()

	# Fallback: Use last movement direction
	if last_movement_direction != Vector2.ZERO:
		return last_movement_direction.normalized()

	# Final fallback
	return Vector2.RIGHT

func _get_mouse_aim_direction() -> Vector2:
	var to_mouse: Vector2 = get_global_mouse_position() - global_position
	if to_mouse.length_squared() <= 100.0:
		return Vector2.ZERO
	return to_mouse.normalized()

func handle_attack() -> void:
	if is_dead or _is_hit_stop_active():
		return

	var now: int = Time.get_ticks_msec()

	if is_attacking or is_dodging or is_blocking:
		return

	# Check cooldown
	if last_attack_ms > 0 and now - last_attack_ms < int(attack_cooldown * 1000):
		return

	is_attacking = true
	last_attack_ms = now

	# Play attack sound
	if audio_manager:
		var swing_sfx = audio_manager.get_sfx("swing")
		if swing_sfx:
			audio_manager.play_sfx(swing_sfx, CombatConstants.AUDIO_VOLUME_SWING)

	# Movement-based attack direction
	var attack_direction: Vector2 = get_attack_direction()
	var attack_angle: float = attack_direction.angle()

	# Create visual effect
	create_attack_arc(attack_angle)

	# Perform hit detection
	var hit_count: int = perform_attack_detection(attack_direction)
	if hit_count == 0 and CombatConstants.HOTLINE_STYLE_MOVEMENT:
		var assisted_direction: Vector2 = _get_melee_assist_direction()
		if assisted_direction != Vector2.ZERO:
			hit_count = perform_attack_detection(assisted_direction)

	# Update combo
	if hit_count > 0:
		combo_counter += hit_count
		last_combo_hit_ms = now

		if CombatConstants.HIT_STOP_ON_PLAYER_HIT:
			_request_hit_stop(CombatConstants.HIT_STOP_PLAYER_HIT_DURATION_SEC)

		# Play hit sound
		if audio_manager:
			var hit_sfx = audio_manager.get_sfx("hit")
			if hit_sfx:
				audio_manager.play_sfx(hit_sfx, CombatConstants.AUDIO_VOLUME_HIT)
	else:
		combo_counter = 0
		_clear_combo_attack_context()

func create_attack_arc(attack_angle: float) -> void:
	var arc_points: Array[Vector2] = []
	for i in range(CombatConstants.ATTACK_ARC_STEPS + 1):
		var angle: float = attack_angle - attack_arc / 2.0 + (attack_arc / CombatConstants.ATTACK_ARC_STEPS) * i
		var point: Vector2 = global_position + Vector2(cos(angle), sin(angle)) * attack_range
		arc_points.append(point)

	var line := Line2D.new()
	line.top_level = true
	line.points = arc_points
	line.width = CombatConstants.ATTACK_ARC_WIDTH
	line.default_color = CombatConstants.ATTACK_ARC_COLOR
	line.add_to_group("combat_effects")
	add_child(line)

	_create_attack_trail(attack_angle)

	await get_tree().create_timer(CombatConstants.ATTACK_ARC_DURATION).timeout
	if is_instance_valid(line):
		line.queue_free()

func _create_attack_trail(attack_angle: float) -> void:
	if WEAPON_TRAIL_TEXTURE == null:
		return

	var trail := Sprite2D.new()
	trail.texture = WEAPON_TRAIL_TEXTURE
	trail.centered = true
	trail.top_level = true
	trail.global_position = global_position + Vector2(cos(attack_angle), sin(attack_angle)) * attack_range * 0.55
	trail.rotation = attack_angle
	trail.scale = CombatConstants.ATTACK_TRAIL_SCALE
	trail.modulate = Color(1, 1, 1, CombatConstants.ATTACK_TRAIL_ALPHA)
	trail.add_to_group("combat_effects")
	add_child(trail)

	var fade_tween: Tween = create_tween()
	fade_tween.tween_property(trail, "modulate:a", 0.0, CombatConstants.ATTACK_TRAIL_DURATION)
	fade_tween.finished.connect(
		func() -> void:
			if is_instance_valid(trail):
				trail.queue_free()
	)

func update_nearby_enemies() -> void:
	nearby_enemies.clear()
	var candidates: Array[CombatEnemy] = _get_attack_candidates()
	for enemy in candidates:
		if global_position.distance_to(enemy.global_position) <= attack_range * 2.0:
			nearby_enemies.append(enemy)

func perform_attack_detection(attack_direction: Vector2) -> int:
	var hit_count: int = 0
	var projected_combo_count: int = combo_counter

	# Use a live query per swing to avoid stale cached target lists.
	for enemy in _get_attack_candidates():
		if not enemy.is_alive:
			continue

		var distance: float = global_position.distance_to(enemy.global_position)

		if distance <= attack_range:
			var to_enemy: Vector2 = (enemy.global_position - global_position).normalized()
			var dot_product: float = to_enemy.dot(attack_direction)

			# Enemy is within attack arc
			if dot_product > cos(attack_arc / 2.0):
				projected_combo_count += 1
				var combo_context: Dictionary = _build_combo_attack_context(projected_combo_count)
				enemy.take_damage(damage, attack_direction, combo_context)
				_record_last_combo_attack_context(combo_context)
				hit_count += 1

	return hit_count

func _build_combo_attack_context(projected_combo_count: int) -> Dictionary:
	var combo_tier: int = CombatConstants.get_combo_tier(projected_combo_count)
	return {
		"combo_count": projected_combo_count,
		"combo_tier": combo_tier,
		"damage_multiplier": CombatConstants.get_combo_tier_damage_multiplier(combo_tier),
		"stagger_force_multiplier": CombatConstants.get_combo_tier_stagger_force_multiplier(combo_tier),
		"stagger_duration_multiplier": CombatConstants.get_combo_tier_stagger_duration_multiplier(combo_tier),
		"armor_break_level": CombatConstants.get_combo_tier_armor_break_level(combo_tier)
	}

func _record_last_combo_attack_context(context: Dictionary) -> void:
	last_combo_tier_on_hit = int(context.get("combo_tier", 0))
	last_combo_damage_multiplier = float(context.get("damage_multiplier", 1.0))
	last_combo_stagger_force_multiplier = float(context.get("stagger_force_multiplier", 1.0))
	last_combo_stagger_duration_multiplier = float(context.get("stagger_duration_multiplier", 1.0))
	last_combo_armor_break_level = int(context.get("armor_break_level", 0))

func _clear_combo_attack_context() -> void:
	last_combo_tier_on_hit = 0
	last_combo_damage_multiplier = 1.0
	last_combo_stagger_force_multiplier = 1.0
	last_combo_stagger_duration_multiplier = 1.0
	last_combo_armor_break_level = 0

func _get_melee_assist_direction() -> Vector2:
	var closest_enemy: CombatEnemy = null
	var closest_distance: float = attack_range * 1.15
	for enemy in _get_attack_candidates():
		if not enemy.is_alive:
			continue
		var distance: float = global_position.distance_to(enemy.global_position)
		if distance <= closest_distance:
			closest_distance = distance
			closest_enemy = enemy
	if closest_enemy == null:
		return Vector2.ZERO
	return (closest_enemy.global_position - global_position).normalized()

func _get_attack_candidates() -> Array[CombatEnemy]:
	var candidates: Array[CombatEnemy] = []
	var all_enemies: Array = get_tree().get_nodes_in_group("enemies")
	for enemy in all_enemies:
		if enemy is CombatEnemy and enemy.is_alive:
			candidates.append(enemy as CombatEnemy)
	return candidates

func handle_dodge() -> void:
	if CombatConstants.HOTLINE_STYLE_MOVEMENT:
		return

	if is_dead or _is_hit_stop_active():
		return

	var now: int = Time.get_ticks_msec()

	if is_dodging:
		return

	if last_dodge_ms > 0 and now - last_dodge_ms < int(dodge_cooldown * 1000):
		return

	var input_direction: Vector2 = Input.get_vector("move_left", "move_right", "move_up", "move_down")
	if input_direction != Vector2.ZERO:
		dodge_direction = input_direction.normalized()
	elif last_movement_direction != Vector2.ZERO:
		dodge_direction = last_movement_direction.normalized()
	else:
		dodge_direction = Vector2.RIGHT

	last_movement_direction = dodge_direction
	dodge_speed = maxf(1.0, CombatConstants.DODGE_SPEED)
	dodge_remaining_distance = maxf(0.0, CombatConstants.DODGE_DISTANCE)
	is_dodging = dodge_remaining_distance > 0.0
	is_invincible = true
	last_dodge_ms = now

func _start_block() -> void:
	if is_dead:
		return
	if is_attacking or is_dodging:
		return
	if shield_broken:
		return
	var was_blocking: bool = is_blocking
	is_blocking = true
	if not was_blocking:
		block_started_ms = Time.get_ticks_msec()
	_sync_shield_collision_state()

func _stop_block() -> void:
	is_blocking = false
	block_started_ms = -1
	_sync_shield_collision_state()

func is_perfect_block_window_active() -> bool:
	if not is_shield_active():
		return false
	if block_started_ms < 0:
		return false
	var elapsed_ms: int = Time.get_ticks_msec() - block_started_ms
	return elapsed_ms >= 0 and elapsed_ms <= CombatConstants.SHIELD_PERFECT_BLOCK_WINDOW_MS

func handle_special_ability() -> void:
	if is_dead:
		return

	var now: int = Time.get_ticks_msec()

	if last_special_ms > 0 and now - last_special_ms < int(special_cooldown * 1000):
		return

	last_special_ms = now

	# Berserk mode
	speed *= CombatConstants.SPECIAL_ABILITY_MULTIPLIER
	damage = int(damage * CombatConstants.SPECIAL_ABILITY_MULTIPLIER)
	modulate = Color.RED

	await get_tree().create_timer(CombatConstants.SPECIAL_ABILITY_DURATION).timeout
	speed /= CombatConstants.SPECIAL_ABILITY_MULTIPLIER
	damage = int(damage / CombatConstants.SPECIAL_ABILITY_MULTIPLIER)
	modulate = Color.WHITE

func take_damage(amount: int, attack_source_position: Vector2 = Vector2.INF, source_projectile: CombatProjectile = null) -> void:
	if is_dead or is_invincible:
		return

	if is_blocking and _is_attack_blocked(attack_source_position):
		take_shield_hit(amount, attack_source_position, false, source_projectile)
		return

	combo_counter = 0
	_clear_combo_attack_context()

	if CombatConstants.HIT_STOP_ON_PLAYER_DAMAGED:
		_request_hit_stop(CombatConstants.HIT_STOP_PLAYER_DAMAGED_DURATION_SEC)

	health -= amount
	apply_shake(CombatConstants.CAMERA_SHAKE_DAMAGE_INTENSITY, CombatConstants.CAMERA_SHAKE_DAMAGE_DURATION)

	if health <= 0:
		die()
	else:
		# Knockback
		var knockback_direction: Vector2 = -last_movement_direction if last_movement_direction != Vector2.ZERO else Vector2.LEFT
		velocity = knockback_direction * CombatConstants.KNOCKBACK_SPEED

		modulate = Color.RED
		await get_tree().create_timer(CombatConstants.HURT_EFFECT_DURATION).timeout
		if is_instance_valid(self) and not is_dead:
				modulate = Color.WHITE

func _is_attack_blocked(attack_source_position: Vector2) -> bool:
	if not is_blocking:
		return false

	var from_attacker: Vector2
	if attack_source_position.is_finite():
		from_attacker = (attack_source_position - global_position).normalized()
	else:
		from_attacker = _get_mouse_aim_direction()

	if from_attacker == Vector2.ZERO:
		return true

	var facing: Vector2 = shield_direction.normalized() if shield_direction != Vector2.ZERO else Vector2.RIGHT
	return facing.dot(from_attacker) >= cos(CombatConstants.SHIELD_BLOCK_ARC / 2.0)

func take_shield_hit(
	amount: int,
	attack_source_position: Vector2 = Vector2.INF,
	apply_hit_stop: bool = false,
	source_projectile: CombatProjectile = null
) -> bool:
	if not is_shield_active():
		return false
	_resolve_shield_hit(amount, attack_source_position, apply_hit_stop, source_projectile)
	return true

func resolve_projectile_shield_collision(
	projectile: CombatProjectile,
	amount: int,
	attack_source_position: Vector2 = Vector2.INF,
	apply_hit_stop: bool = false
) -> bool:
	if not is_shield_active():
		return false
	var block_result: Dictionary = _resolve_shield_hit(amount, attack_source_position, apply_hit_stop, projectile)
	return bool(block_result.get("projectile_reflected", false))

func _resolve_shield_hit(
	amount: int,
	attack_source_position: Vector2,
	apply_hit_stop: bool,
	source_projectile: CombatProjectile
) -> Dictionary:
	var is_perfect_block: bool = is_perfect_block_window_active()
	var projectile_reflected: bool = false
	if (
		is_perfect_block
		and source_projectile != null
		and CombatConstants.SHIELD_PERFECT_BLOCK_PROJECTILE_REFLECT_ENABLED
	):
		var shield_facing: Vector2 = get_shield_facing_direction()
		var shield_origin: Vector2 = global_position + shield_facing * CombatConstants.SHIELD_COLLISION_OFFSET
		source_projectile.reflect_from_shield(self, shield_facing, shield_origin)
		projectile_reflected = true
	var shield_damage_multiplier: float = CombatConstants.SHIELD_PERFECT_BLOCK_DAMAGE_MULTIPLIER if is_perfect_block else 1.0
	var shield_damage_applied: float = _apply_shield_damage(amount, shield_damage_multiplier)
	_play_block_feedback(attack_source_position, is_perfect_block)
	if apply_hit_stop and CombatConstants.SHIELD_BLOCK_PROJECTILE_HIT_STOP_SEC > 0.0:
		_request_hit_stop(CombatConstants.SHIELD_BLOCK_PROJECTILE_HIT_STOP_SEC)
	_record_block_event(is_perfect_block, source_projectile != null, projectile_reflected, shield_damage_applied)
	return last_block_event

func _record_block_event(
	perfect_block: bool,
	projectile_block: bool,
	projectile_reflected: bool,
	shield_damage_applied: float
) -> void:
	var now_ms: int = Time.get_ticks_msec()
	var block_window_age_ms: int = now_ms - block_started_ms if block_started_ms >= 0 else -1
	last_block_event = {
		"timestamp_ms": now_ms,
		"perfect_block": perfect_block,
		"projectile_block": projectile_block,
		"projectile_reflected": projectile_reflected,
		"shield_damage_applied": shield_damage_applied,
		"block_window_age_ms": block_window_age_ms
	}

func get_last_block_event() -> Dictionary:
	return last_block_event.duplicate(true)

func _play_block_feedback(attack_source_position: Vector2 = Vector2.INF, perfect_block: bool = false) -> void:
	if CombatConstants.SHIELD_BLOCK_VFX_ENABLED and particle_manager and particle_manager.has_method("play_impact_effect"):
		var impact_direction: Vector2 = get_shield_facing_direction()
		if attack_source_position.is_finite():
			var source_direction: Vector2 = attack_source_position - global_position
			if source_direction != Vector2.ZERO:
				impact_direction = source_direction.normalized()
		var impact_position: Vector2 = global_position + impact_direction * CombatConstants.SHIELD_COLLISION_OFFSET
		particle_manager.play_impact_effect(impact_position, impact_direction)

	if CombatConstants.SHIELD_BLOCK_SFX_ENABLED and audio_manager:
		var block_sfx = audio_manager.get_sfx("hit")
		if block_sfx:
			audio_manager.play_sfx(block_sfx, CombatConstants.AUDIO_VOLUME_HIT)

	apply_shake(3.2 if perfect_block else 2.5, 0.08)
	modulate = Color(1.0, 0.95, 0.68, 1.0) if perfect_block else Color(0.7, 0.9, 1.0, 1.0)
	await get_tree().create_timer(0.06).timeout
	if is_instance_valid(self) and not is_dead:
		modulate = Color.WHITE

func _apply_shield_damage(amount: int, multiplier: float = 1.0) -> float:
	var scaled_damage: float = maxf(0.0, float(amount)) * maxf(0.0, multiplier)
	var damage_to_shield: float = maxf(CombatConstants.SHIELD_BLOCK_MIN_DAMAGE, scaled_damage)
	shield_health = maxf(0.0, shield_health - damage_to_shield)
	shield_regen_delay_remaining = CombatConstants.SHIELD_REGEN_DELAY_SEC
	if shield_health <= 0.0:
		_break_shield()
	return damage_to_shield

func _break_shield() -> void:
	shield_broken = true
	is_blocking = false
	block_started_ms = -1
	shield_break_remaining = CombatConstants.SHIELD_BREAK_RECOVERY_SEC
	_sync_shield_collision_state()
	modulate = Color(1.0, 0.5, 0.5, 1.0)
	var tween: Tween = create_tween()
	tween.tween_property(self, "modulate", Color.WHITE, 0.18)

func _update_shield_direction() -> void:
	var mouse_direction: Vector2 = _get_mouse_aim_direction()
	if mouse_direction != Vector2.ZERO:
		shield_direction = mouse_direction
	elif last_attack_direction != Vector2.ZERO:
		shield_direction = last_attack_direction.normalized()
	elif last_movement_direction != Vector2.ZERO:
		shield_direction = last_movement_direction.normalized()

func _update_sprite_facing() -> void:
	if sprite == null:
		return

	var facing: Vector2 = Vector2.ZERO
	if shield_direction != Vector2.ZERO:
		facing = shield_direction.normalized()
	elif move_intent_velocity != Vector2.ZERO:
		facing = move_intent_velocity.normalized()
	elif last_movement_direction != Vector2.ZERO:
		facing = last_movement_direction.normalized()

	if absf(facing.x) <= 0.05:
		return

	sprite.flip_h = facing.x < 0.0

func _update_shield_state(delta: float) -> void:
	if shield_broken:
		shield_break_remaining = maxf(0.0, shield_break_remaining - delta)
		if shield_break_remaining <= 0.0:
			shield_broken = false
			shield_health = maxf(shield_health, CombatConstants.SHIELD_MAX_HEALTH * 0.35)
			shield_regen_delay_remaining = CombatConstants.SHIELD_REGEN_DELAY_SEC
			if Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT) and not is_attacking and not is_dodging:
				_start_block()

	if shield_regen_delay_remaining > 0.0:
		shield_regen_delay_remaining = maxf(0.0, shield_regen_delay_remaining - delta)
	elif not is_blocking and not shield_broken and shield_health < CombatConstants.SHIELD_MAX_HEALTH:
		shield_health = minf(CombatConstants.SHIELD_MAX_HEALTH, shield_health + CombatConstants.SHIELD_REGEN_PER_SEC * delta)

func _apply_shield_push(delta: float) -> void:
	if delta <= 0.0:
		return
	if not is_shield_active():
		return
	if shield_push_area == null or shield_push_shape == null or shield_push_shape.shape == null:
		return

	var shield_facing: Vector2 = get_shield_facing_direction()
	var shield_origin: Vector2 = global_position + shield_facing * CombatConstants.SHIELD_COLLISION_OFFSET
	var forward_speed: float = maxf(0.0, maxf(move_intent_velocity.dot(shield_facing), velocity.dot(shield_facing)))
	if forward_speed < CombatConstants.SHIELD_PUSH_MIN_FORWARD_SPEED:
		return

	var push_magnitude: float = (CombatConstants.SHIELD_PUSH_BASE_FORCE + forward_speed * CombatConstants.SHIELD_PUSH_FORCE_MULTIPLIER) * delta
	var push_velocity_delta: Vector2 = shield_facing * push_magnitude
	var pushed_enemies: Dictionary = {}

	# Monitoring is toggled with deferred state updates and can lag one frame behind block state changes.
	if shield_push_area.monitoring:
		for body in shield_push_area.get_overlapping_bodies():
			if body is CombatEnemy:
				var enemy := body as CombatEnemy
				_try_push_enemy(enemy, shield_facing, shield_origin, push_velocity_delta, pushed_enemies)

	var query := PhysicsShapeQueryParameters2D.new()
	query.shape = shield_push_shape.shape
	query.transform = shield_push_shape.global_transform
	query.collide_with_bodies = true
	query.collide_with_areas = false
	query.collision_mask = 1
	query.exclude = [get_rid(), shield_body.get_rid()]
	var shape_hits: Array[Dictionary] = get_world_2d().direct_space_state.intersect_shape(query, 12)
	for hit in shape_hits:
		var collider: Variant = hit.get("collider")
		if collider is CombatEnemy:
			var enemy := collider as CombatEnemy
			_try_push_enemy(enemy, shield_facing, shield_origin, push_velocity_delta, pushed_enemies)

	for enemy in _get_attack_candidates():
		if not _is_enemy_in_shield_push_geometry(enemy, shield_origin, shield_facing):
			continue
		_try_push_enemy(enemy, shield_facing, shield_origin, push_velocity_delta, pushed_enemies)

func _try_push_enemy(
	enemy: CombatEnemy,
	shield_facing: Vector2,
	shield_origin: Vector2,
	push_velocity_delta: Vector2,
	pushed_enemies: Dictionary
) -> void:
	if enemy == null or not enemy.is_alive:
		return
	var enemy_id: int = enemy.get_instance_id()
	if pushed_enemies.has(enemy_id):
		return

	var to_enemy: Vector2 = enemy.global_position - shield_origin
	if to_enemy == Vector2.ZERO:
		return

	var forward_distance: float = to_enemy.dot(shield_facing)
	if forward_distance <= 0.0:
		return

	var front_dot: float = to_enemy.normalized().dot(shield_facing)
	if front_dot < CombatConstants.SHIELD_PUSH_FRONT_DOT_MIN:
		return

	var min_front_dot: float = CombatConstants.SHIELD_PUSH_FRONT_DOT_MIN
	var front_alignment: float = clampf(
		(front_dot - min_front_dot) / maxf(0.0001, 1.0 - min_front_dot),
		0.0,
		1.0
	)
	var side_damp: float = lerpf(CombatConstants.SHIELD_PUSH_SIDE_DAMP_MIN, 1.0, front_alignment)

	var close_contact_distance: float = CombatConstants.SHIELD_COLLISION_RADIUS + CombatConstants.SHIELD_PUSH_CONTACT_PADDING + CombatConstants.SHIELD_PUSH_CLOSE_CONTACT_DISTANCE
	close_contact_distance = maxf(1.0, close_contact_distance)
	var close_contact_ratio: float = 1.0 - clampf(forward_distance / close_contact_distance, 0.0, 1.0)
	var close_contact_boost: float = lerpf(1.0, CombatConstants.SHIELD_PUSH_CLOSE_CONTACT_BOOST, close_contact_ratio)

	enemy.apply_shield_push(push_velocity_delta * side_damp * close_contact_boost)
	pushed_enemies[enemy_id] = true

func _is_enemy_in_shield_push_geometry(enemy: CombatEnemy, shield_origin: Vector2, shield_facing: Vector2) -> bool:
	if enemy == null or not enemy.is_alive:
		return false

	var relative: Vector2 = enemy.global_position - shield_origin
	var forward: float = relative.dot(shield_facing)
	if forward < 0.0:
		return false

	var max_forward: float = CombatConstants.SHIELD_COLLISION_RADIUS + CombatConstants.SHIELD_PUSH_CONTACT_PADDING + 26.0
	if forward > max_forward:
		return false

	var lateral_axis: Vector2 = shield_facing.orthogonal().normalized()
	var lateral: float = absf(relative.dot(lateral_axis))
	var max_lateral: float = CombatConstants.SHIELD_COLLISION_WIDTH * 0.5 + CombatConstants.SHIELD_PUSH_CONTACT_PADDING + 20.0
	return lateral <= max_lateral

func _setup_shield_visual() -> void:
	if shield_arc_visual and is_instance_valid(shield_arc_visual):
		shield_arc_visual.queue_free()
	if shield_fill_visual and is_instance_valid(shield_fill_visual):
		shield_fill_visual.queue_free()

	shield_fill_visual = Polygon2D.new()
	shield_fill_visual.top_level = false
	shield_fill_visual.visible = false
	shield_fill_visual.color = Color(0.45, 0.75, 1.0, 0.22)
	shield_fill_visual.z_as_relative = false
	shield_fill_visual.z_index = 16
	add_child(shield_fill_visual)

	shield_arc_visual = Line2D.new()
	shield_arc_visual.top_level = false
	shield_arc_visual.width = maxf(4.0, CombatConstants.SHIELD_BLOCK_WIDTH)
	shield_arc_visual.closed = true
	shield_arc_visual.default_color = CombatConstants.SHIELD_BLOCK_COLOR
	shield_arc_visual.visible = false
	shield_arc_visual.z_as_relative = false
	shield_arc_visual.z_index = 17
	add_child(shield_arc_visual)

func _update_shield_visual() -> void:
	if shield_arc_visual == null or shield_fill_visual == null:
		_setup_shield_visual()
	if shield_arc_visual == null or shield_fill_visual == null:
		return
	var shield_active: bool = is_shield_active()
	if not shield_active and not CombatConstants.SHIELD_VISUAL_ALWAYS_ON:
		shield_arc_visual.visible = false
		shield_fill_visual.visible = false
		return

	var facing: Vector2 = get_shield_facing_direction()
	var lateral_axis: Vector2 = facing.orthogonal().normalized()
	var shield_center: Vector2 = facing * CombatConstants.SHIELD_COLLISION_OFFSET

	var radius: float = CombatConstants.SHIELD_COLLISION_RADIUS
	var height: float = CombatConstants.SHIELD_COLLISION_WIDTH
	if shield_collision_shape and shield_collision_shape.shape is CapsuleShape2D:
		var capsule_shape: CapsuleShape2D = shield_collision_shape.shape as CapsuleShape2D
		radius = capsule_shape.radius
		height = capsule_shape.height
	var half_segment: float = maxf(0.0, height * 0.5 - radius)

	var local_points: Array[Vector2] = []
	var arc_steps: int = maxi(6, CombatConstants.ATTACK_ARC_STEPS / 2)
	for i in range(arc_steps + 1):
		var top_angle: float = PI + PI * (float(i) / float(arc_steps))
		local_points.append(Vector2(cos(top_angle), sin(top_angle)) * radius + Vector2(0.0, -half_segment))
	for i in range(arc_steps + 1):
		var bottom_angle: float = PI * (float(i) / float(arc_steps))
		local_points.append(Vector2(cos(bottom_angle), sin(bottom_angle)) * radius + Vector2(0.0, half_segment))

	var points: PackedVector2Array = PackedVector2Array()
	for local_point in local_points:
		points.append(shield_center + facing * local_point.x + lateral_axis * local_point.y)

	var health_ratio: float = clampf(shield_health / CombatConstants.SHIELD_MAX_HEALTH, 0.0, 1.0)
	var outline_color: Color = CombatConstants.SHIELD_BLOCK_COLOR.lerp(Color(1.0, 0.35, 0.35, 0.95), 1.0 - health_ratio)
	var fill_color: Color = outline_color
	if shield_active:
		fill_color.a = maxf(CombatConstants.SHIELD_VISUAL_ACTIVE_FILL_ALPHA, fill_color.a)
	else:
		outline_color = Color(outline_color.r, outline_color.g, outline_color.b, CombatConstants.SHIELD_VISUAL_IDLE_OUTLINE_ALPHA)
		fill_color.a = CombatConstants.SHIELD_VISUAL_IDLE_FILL_ALPHA
	shield_arc_visual.default_color = outline_color
	shield_arc_visual.points = points
	shield_fill_visual.color = fill_color
	shield_fill_visual.polygon = points
	shield_arc_visual.visible = true
	shield_fill_visual.visible = true

func is_shield_active() -> bool:
	return is_blocking and not shield_broken and shield_health > 0.0

func get_shield_facing_direction() -> Vector2:
	if shield_direction != Vector2.ZERO:
		return shield_direction.normalized()
	return Vector2.RIGHT

func get_shield_barrier_distance() -> float:
	return CombatConstants.SHIELD_COLLISION_OFFSET + CombatConstants.SHIELD_COLLISION_RADIUS

func die() -> void:
	if is_dead:
		return

	is_dead = true
	velocity = Vector2.ZERO
	set_physics_process(false)
	set_process_input(false)
	died.emit()
	queue_free()

func get_combo() -> int:
	return combo_counter

func get_combo_tier() -> int:
	return CombatConstants.get_combo_tier(combo_counter)

func get_last_combo_attack_context() -> Dictionary:
	return {
		"combo_tier": last_combo_tier_on_hit,
		"damage_multiplier": last_combo_damage_multiplier,
		"stagger_force_multiplier": last_combo_stagger_force_multiplier,
		"stagger_duration_multiplier": last_combo_stagger_duration_multiplier,
		"armor_break_level": last_combo_armor_break_level
	}

func apply_shake(intensity: float, duration: float) -> void:
	shake_intensity = intensity
	shake_duration = duration
	shake_timer.start()

func _update_shake() -> void:
	var camera = get_node_or_null("Camera2D") as Camera2D
	if not camera:
		return

	if shake_duration > 0:
		var shake_offset = Vector2(
			randf_range(-shake_intensity, shake_intensity),
			randf_range(-shake_intensity, shake_intensity)
		)
		camera.offset = original_camera_offset + shake_offset
		shake_duration -= shake_timer.wait_time
	else:
		camera.offset = original_camera_offset
		shake_timer.stop()
		shake_intensity = 0.0

func _request_hit_stop(duration_sec: float) -> void:
	if not CombatConstants.HIT_STOP_ENABLED:
		return
	var combat_scene: CombatScene = _get_combat_scene()
	if combat_scene:
		combat_scene.request_hit_stop(duration_sec)

func _is_hit_stop_active() -> bool:
	var combat_scene: CombatScene = _get_combat_scene()
	return combat_scene != null and combat_scene.is_hit_stop_active()

func _get_combat_scene() -> CombatScene:
	var current_scene: Node = get_tree().current_scene
	if current_scene is CombatScene:
		return current_scene as CombatScene
	var parent_node: Node = get_parent()
	if parent_node is CombatScene:
		return parent_node as CombatScene
	return null
