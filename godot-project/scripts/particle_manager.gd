extends Node

const CombatConstants = preload("res://scripts/combat_constants.gd")
const RuntimeLog = preload("res://scripts/runtime_log.gd")
const BLOOD_PARTICLE_TEXTURE: Texture2D = preload("res://assets/effects/blood_particle.png")

# Particle pool configuration
const MAX_POOL_SIZE: int = CombatConstants.BLOOD_POOL_SIZE
const IMPACT_POOL_SIZE: int = 12
const DRIP_POOL_SIZE: int = CombatConstants.BLOOD_DRIP_POOL_SIZE
const DECAL_POOL_SIZE: int = CombatConstants.BLOOD_DECAL_POOL_SIZE
const BLOOD_EFFECT_Z_INDEX: int = 8
const IMPACT_EFFECT_Z_INDEX: int = 9
const BLOOD_DECAL_Z_INDEX: int = -1

# Particle pools
var blood_particle_pool: Array[CPUParticles2D] = []
var pool_index: int = 0
var impact_particle_pool: Array[CPUParticles2D] = []
var impact_pool_index: int = 0
var drip_particle_pool: Array[CPUParticles2D] = []
var drip_pool_index: int = 0
var blood_decal_pool: Array[Sprite2D] = []
var decal_pool_index: int = 0
var active_decal_states: Array[Dictionary] = []

var _active_effect_ids: Dictionary = {}
var _effect_tokens: Dictionary = {}
var _rng: RandomNumberGenerator = RandomNumberGenerator.new()
var _blood_spray_color_ramp: Gradient = Gradient.new()
var _blood_drip_color_ramp: Gradient = Gradient.new()
var _effect_root: Node = null

func _ready() -> void:
	_effect_root = self
	_rng.randomize()
	_blood_spray_color_ramp = _create_blood_spray_color_ramp()
	_blood_drip_color_ramp = _create_blood_drip_color_ramp()
	_initialize_blood_particle_pool()
	_initialize_impact_particle_pool()
	_initialize_drip_particle_pool()
	_initialize_blood_decal_pool()
	set_process(true)

	RuntimeLog.info(
		"ParticleManager: Initialized with %d blood particles and %d impact particles"
		% [MAX_POOL_SIZE, IMPACT_POOL_SIZE]
	)

func _process(_delta: float) -> void:
	_update_active_decals()

func bind_effect_root(new_root: Node) -> void:
	_set_effect_root(new_root)

func unbind_effect_root(expected_root: Node = null) -> void:
	if expected_root != null and _effect_root != expected_root:
		return
	_set_effect_root(self)

func clear_all_effects() -> void:
	_active_effect_ids.clear()
	_effect_tokens.clear()

	for particles in blood_particle_pool:
		if not is_instance_valid(particles):
			continue
		particles.emitting = false
		particles.visible = false
		particles.remove_from_group("combat_effects")

	for particles in impact_particle_pool:
		if not is_instance_valid(particles):
			continue
		particles.emitting = false
		particles.visible = false
		particles.remove_from_group("combat_effects")

	for particles in drip_particle_pool:
		if not is_instance_valid(particles):
			continue
		particles.emitting = false
		particles.visible = false
		particles.remove_from_group("combat_effects")

	for state_variant in active_decal_states:
		if not (state_variant is Dictionary):
			continue
		var state: Dictionary = state_variant
		var decal_variant: Variant = state.get("node", null)
		if decal_variant is Sprite2D:
			var decal: Sprite2D = decal_variant as Sprite2D
			if is_instance_valid(decal):
				decal.visible = false
	active_decal_states.clear()

func _set_effect_root(new_root: Node) -> void:
	var target_root: Node = new_root
	if target_root == null or not is_instance_valid(target_root):
		target_root = self
	if _effect_root == target_root:
		return

	_effect_root = target_root
	_reparent_effect_nodes()

func _resolve_effect_root() -> Node:
	if _effect_root == null or not is_instance_valid(_effect_root):
		_effect_root = self
	return _effect_root

func _reparent_effect_nodes() -> void:
	var target_root: Node = _resolve_effect_root()

	for particles in blood_particle_pool:
		_reparent_effect_node(particles, target_root)
	for particles in impact_particle_pool:
		_reparent_effect_node(particles, target_root)
	for particles in drip_particle_pool:
		_reparent_effect_node(particles, target_root)
	for decal in blood_decal_pool:
		_reparent_effect_node(decal, target_root)

func _reparent_effect_node(effect_node: Node, target_root: Node) -> void:
	if effect_node == null or not is_instance_valid(effect_node):
		return
	if target_root == null or not is_instance_valid(target_root):
		return
	if effect_node.get_parent() == target_root:
		return
	effect_node.reparent(target_root, true)

func _initialize_blood_particle_pool() -> void:
	var target_root: Node = _resolve_effect_root()
	for _i in range(MAX_POOL_SIZE):
		var particles: CPUParticles2D = _create_blood_particles()
		particles.emitting = false
		particles.visible = false
		target_root.add_child(particles)
		blood_particle_pool.append(particles)

func _initialize_impact_particle_pool() -> void:
	var target_root: Node = _resolve_effect_root()
	for _i in range(IMPACT_POOL_SIZE):
		var particles: CPUParticles2D = _create_impact_particles()
		particles.emitting = false
		particles.visible = false
		target_root.add_child(particles)
		impact_particle_pool.append(particles)

func _initialize_drip_particle_pool() -> void:
	var target_root: Node = _resolve_effect_root()
	for _i in range(DRIP_POOL_SIZE):
		var particles: CPUParticles2D = _create_blood_drip_particles()
		particles.emitting = false
		particles.visible = false
		target_root.add_child(particles)
		drip_particle_pool.append(particles)

func _initialize_blood_decal_pool() -> void:
	var target_root: Node = _resolve_effect_root()
	for _i in range(DECAL_POOL_SIZE):
		var decal := Sprite2D.new()
		decal.texture = BLOOD_PARTICLE_TEXTURE
		decal.visible = false
		_configure_effect_draw_order(decal, BLOOD_DECAL_Z_INDEX)
		decal.modulate = Color(1.0, 1.0, 1.0, 0.0)
		target_root.add_child(decal)
		blood_decal_pool.append(decal)

func _create_blood_particles() -> CPUParticles2D:
	var particles := CPUParticles2D.new()
	_apply_shared_blood_visuals(particles)
	_configure_effect_draw_order(particles, BLOOD_EFFECT_Z_INDEX)
	_configure_blood_particles(particles, Vector2.UP, 1.0, CombatConstants.BLOOD_BASE_COLOR, 1.0)
	return particles

func _create_blood_drip_particles() -> CPUParticles2D:
	var particles := CPUParticles2D.new()
	_apply_shared_blood_visuals(particles)
	_configure_effect_draw_order(particles, BLOOD_EFFECT_Z_INDEX)
	_configure_drip_particles(particles, CombatConstants.BLOOD_BASE_COLOR, 1.0, 1.0)
	return particles

func _create_impact_particles() -> CPUParticles2D:
	var particles := CPUParticles2D.new()
	_configure_effect_draw_order(particles, IMPACT_EFFECT_Z_INDEX)
	particles.explosiveness = 1.0
	particles.one_shot = true
	particles.amount = CombatConstants.IMPACT_PARTICLE_AMOUNT
	particles.lifetime = CombatConstants.IMPACT_PARTICLE_LIFETIME
	particles.direction = Vector2.RIGHT
	particles.spread = CombatConstants.IMPACT_PARTICLE_SPREAD
	particles.initial_velocity_min = CombatConstants.IMPACT_PARTICLE_VELOCITY_MIN
	particles.initial_velocity_max = CombatConstants.IMPACT_PARTICLE_VELOCITY_MAX
	particles.color = CombatConstants.IMPACT_PARTICLE_COLOR
	particles.gravity = CombatConstants.IMPACT_PARTICLE_GRAVITY
	return particles

func _configure_effect_draw_order(item: CanvasItem, z_index: int) -> void:
	item.z_as_relative = false
	item.z_index = z_index

func _apply_shared_blood_visuals(particles: CPUParticles2D) -> void:
	particles.texture = BLOOD_PARTICLE_TEXTURE
	particles.one_shot = true
	particles.local_coords = false

func get_blood_particles() -> CPUParticles2D:
	if blood_particle_pool.is_empty():
		push_error("ParticleManager: Blood particle pool not initialized")
		return null

	var particles: CPUParticles2D = blood_particle_pool[pool_index]
	pool_index = (pool_index + 1) % MAX_POOL_SIZE
	_prepare_particle_for_reuse(particles)
	return particles

func get_impact_particles() -> CPUParticles2D:
	if impact_particle_pool.is_empty():
		push_error("ParticleManager: Impact particle pool not initialized")
		return null

	var particles: CPUParticles2D = impact_particle_pool[impact_pool_index]
	impact_pool_index = (impact_pool_index + 1) % IMPACT_POOL_SIZE
	_prepare_particle_for_reuse(particles)
	return particles

func get_drip_particles() -> CPUParticles2D:
	if drip_particle_pool.is_empty():
		push_error("ParticleManager: Drip particle pool not initialized")
		return null

	var particles: CPUParticles2D = drip_particle_pool[drip_pool_index]
	drip_pool_index = (drip_pool_index + 1) % DRIP_POOL_SIZE
	_prepare_particle_for_reuse(particles)
	return particles

func _prepare_particle_for_reuse(particles: CPUParticles2D) -> void:
	particles.emitting = false
	particles.visible = true
	particles.restart()

func play_blood_effect(
	position: Vector2,
	direction: Vector2 = Vector2.UP,
	intensity: float = 1.0,
	burst_count: int = 1,
	blood_tint: Color = CombatConstants.BLOOD_BASE_COLOR
) -> void:
	var quality_scale: float = _get_effect_quality_scale()
	if quality_scale <= 0.0:
		return

	var safe_burst_count: int = maxi(1, burst_count)
	if quality_scale < 0.7:
		safe_burst_count = maxi(1, int(round(float(safe_burst_count) * quality_scale)))

	var base_direction: Vector2 = direction.normalized() if direction != Vector2.ZERO else Vector2.UP
	for _i in range(safe_burst_count):
		var particles: CPUParticles2D = get_blood_particles()
		if not particles:
			push_error("ParticleManager: Failed to get blood particles")
			return

		var emit_direction: Vector2 = _get_jittered_direction(base_direction)
		_configure_blood_particles(particles, emit_direction, intensity, blood_tint, quality_scale)
		var offset: Vector2 = _random_burst_offset() if safe_burst_count > 1 else Vector2.ZERO
		_play_effect(particles, position + offset, emit_direction, particles.lifetime)

	_spawn_blood_decals(position, blood_tint, intensity, quality_scale)
	if intensity >= CombatConstants.BLOOD_DRIP_INTENSITY_THRESHOLD:
		_play_blood_drip(position, blood_tint, intensity, quality_scale)

func play_blood_spray(
	position: Vector2,
	direction: Vector2 = Vector2.RIGHT,
	intensity: float = CombatConstants.BLOOD_HIT_INTENSITY,
	blood_tint: Color = CombatConstants.BLOOD_BASE_COLOR,
	burst_count_override: int = -1
) -> void:
	var burst_count: int = burst_count_override if burst_count_override > 0 else CombatConstants.BLOOD_HIT_BURST_COUNT
	play_blood_effect(position, direction, intensity, burst_count, blood_tint)

func play_blood_explosion(
	position: Vector2,
	direction: Vector2 = Vector2.UP,
	blood_tint: Color = CombatConstants.BLOOD_BASE_COLOR
) -> void:
	play_blood_effect(position, direction, CombatConstants.BLOOD_DEATH_INTENSITY, CombatConstants.BLOOD_DEATH_BURST_COUNT, blood_tint)

func play_impact_effect(position: Vector2, direction: Vector2 = Vector2.RIGHT) -> void:
	var particles: CPUParticles2D = get_impact_particles()
	if not particles:
		push_error("ParticleManager: Failed to get impact particles")
		return

	var emit_direction: Vector2 = direction.normalized() if direction != Vector2.ZERO else Vector2.RIGHT
	particles.direction = emit_direction
	_play_effect(particles, position, emit_direction, CombatConstants.IMPACT_PARTICLE_LIFETIME)

func _play_effect(particles: CPUParticles2D, position: Vector2, _direction: Vector2, lifetime: float) -> void:
	var instance_id: int = particles.get_instance_id()
	var token: int = int(_effect_tokens.get(instance_id, 0)) + 1
	_effect_tokens[instance_id] = token
	_active_effect_ids[instance_id] = true

	particles.global_position = position
	particles.visible = true
	particles.emitting = false
	particles.restart()
	particles.emitting = true
	particles.add_to_group("combat_effects")

	await get_tree().create_timer(lifetime).timeout
	if not is_instance_valid(particles):
		return

	# Ignore stale cleanup callbacks if this pooled instance was reused.
	if int(_effect_tokens.get(instance_id, 0)) != token:
		return

	particles.visible = false
	particles.emitting = false
	particles.remove_from_group("combat_effects")
	_active_effect_ids.erase(instance_id)

func _configure_blood_particles(
	particles: CPUParticles2D,
	emit_direction: Vector2,
	intensity: float,
	blood_tint: Color,
	quality_scale: float
) -> void:
	var clamped_intensity: float = clampf(intensity, 0.3, 6.0)
	var intensity_t: float = clampf((clamped_intensity - 1.0) / 4.0, 0.0, 1.0)
	particles.explosiveness = 1.0
	particles.amount = maxi(1, int(round(CombatConstants.BLOOD_PARTICLE_AMOUNT * clamped_intensity * quality_scale)))
	particles.lifetime = CombatConstants.BLOOD_PARTICLE_LIFETIME * (0.85 + intensity_t * 0.70) * (0.85 + quality_scale * 0.25)
	particles.direction = emit_direction
	particles.spread = clampf(CombatConstants.BLOOD_PARTICLE_SPREAD + clamped_intensity * 8.0, 8.0, 180.0)
	particles.initial_velocity_min = CombatConstants.BLOOD_PARTICLE_VELOCITY_MIN * (0.7 + clamped_intensity * 0.25)
	particles.initial_velocity_max = CombatConstants.BLOOD_PARTICLE_VELOCITY_MAX * (0.75 + clamped_intensity * 0.3)
	particles.gravity = CombatConstants.BLOOD_PARTICLE_GRAVITY * (0.9 + clamped_intensity * 0.12)
	particles.scale_amount_min = CombatConstants.BLOOD_PARTICLE_SCALE_MIN
	particles.scale_amount_max = CombatConstants.BLOOD_PARTICLE_SCALE_MAX * (0.85 + intensity_t * 0.5)
	particles.color = blood_tint.darkened(_rng.randf_range(0.0, 0.08))
	particles.color_ramp = _blood_spray_color_ramp

func _configure_drip_particles(
	particles: CPUParticles2D,
	blood_tint: Color,
	intensity: float,
	quality_scale: float
) -> void:
	var clamped_intensity: float = clampf(intensity, 0.3, 6.0)
	particles.explosiveness = 1.0
	particles.amount = maxi(1, int(round(CombatConstants.BLOOD_DRIP_PARTICLE_AMOUNT * (0.55 + clamped_intensity * 0.2) * quality_scale)))
	particles.lifetime = CombatConstants.BLOOD_DRIP_PARTICLE_LIFETIME * (0.9 + minf(1.0, clamped_intensity * 0.15))
	particles.direction = Vector2.DOWN
	particles.spread = CombatConstants.BLOOD_DRIP_SPREAD
	particles.initial_velocity_min = CombatConstants.BLOOD_DRIP_VELOCITY_MIN
	particles.initial_velocity_max = CombatConstants.BLOOD_DRIP_VELOCITY_MAX
	particles.gravity = CombatConstants.BLOOD_DRIP_GRAVITY
	particles.scale_amount_min = CombatConstants.BLOOD_DRIP_SCALE_MIN
	particles.scale_amount_max = CombatConstants.BLOOD_DRIP_SCALE_MAX
	particles.color = blood_tint.darkened(_rng.randf_range(0.08, 0.16))
	particles.color_ramp = _blood_drip_color_ramp

func _play_blood_drip(position: Vector2, blood_tint: Color, intensity: float, quality_scale: float) -> void:
	if quality_scale < 0.45:
		return

	var particles: CPUParticles2D = get_drip_particles()
	if not particles:
		return

	_configure_drip_particles(particles, blood_tint, intensity, quality_scale)
	var offset := Vector2(_rng.randf_range(-8.0, 8.0), _rng.randf_range(2.0, 10.0))
	_play_effect(particles, position + offset, Vector2.DOWN, particles.lifetime)

func _spawn_blood_decals(position: Vector2, blood_tint: Color, intensity: float, quality_scale: float) -> void:
	if blood_decal_pool.is_empty() or quality_scale < 0.35:
		return

	var clamped_intensity: float = clampf(intensity, 0.4, 6.0)
	var decal_count: int = 2
	if clamped_intensity >= 1.6 and _rng.randf() < 0.8:
		decal_count = 3
	if clamped_intensity >= 3.2 and quality_scale >= 0.85 and _rng.randf() < 0.6:
		decal_count = 4
	if quality_scale < 0.55:
		decal_count = 1
	elif quality_scale < 0.8:
		decal_count = mini(decal_count, 2)
	elif quality_scale < 0.9:
		decal_count = mini(decal_count, 3)

	var now_ms: int = Time.get_ticks_msec()
	var fade_start_ms: int = now_ms + int(round(CombatConstants.BLOOD_DECAL_FADE_DELAY_SEC * 1000.0))
	var expire_ms: int = now_ms + int(round(CombatConstants.BLOOD_DECAL_LIFETIME_SEC * 1000.0))

	for _i in range(decal_count):
		var decal: Sprite2D = _get_next_decal()
		if decal == null:
			continue

		var offset_radius: float = CombatConstants.BLOOD_DECAL_OFFSET_RADIUS * _rng.randf_range(0.15, 1.0)
		decal.global_position = position + Vector2.RIGHT.rotated(_rng.randf_range(0.0, TAU)) * offset_radius
		decal.rotation = _rng.randf_range(0.0, TAU)
		var intensity_t: float = clampf((clamped_intensity - 1.0) / 4.0, 0.0, 1.0)
		var decal_scale: float = _rng.randf_range(
			CombatConstants.BLOOD_DECAL_SCALE_MIN,
			CombatConstants.BLOOD_DECAL_SCALE_MAX
		) * (0.85 + intensity_t * 0.45)
		decal.scale = Vector2.ONE * decal_scale
		var decal_tint: Color = blood_tint.lerp(CombatConstants.BLOOD_DECAL_DRY_TINT, _rng.randf_range(0.12, 0.38))
		var alpha_boost: float = lerpf(0.0, 0.14, intensity_t)
		decal_tint.a = clampf(CombatConstants.BLOOD_DECAL_ALPHA + alpha_boost, 0.0, 1.0)
		decal.modulate = decal_tint
		decal.visible = true
		active_decal_states.append({
			"id": decal.get_instance_id(),
			"node": decal,
			"fade_start_ms": fade_start_ms,
			"expire_ms": expire_ms,
			"base_alpha": decal_tint.a
		})

func _get_next_decal() -> Sprite2D:
	if blood_decal_pool.is_empty():
		return null

	var decal: Sprite2D = blood_decal_pool[decal_pool_index]
	decal_pool_index = (decal_pool_index + 1) % blood_decal_pool.size()
	_remove_active_decal_state(decal)
	return decal

func _remove_active_decal_state(decal: Sprite2D) -> void:
	var target_id: int = decal.get_instance_id()
	for i in range(active_decal_states.size() - 1, -1, -1):
		var state: Dictionary = active_decal_states[i]
		if int(state.get("id", -1)) == target_id:
			active_decal_states.remove_at(i)
	decal.visible = false

func _update_active_decals() -> void:
	if active_decal_states.is_empty():
		return

	var now_ms: int = Time.get_ticks_msec()
	for i in range(active_decal_states.size() - 1, -1, -1):
		var state: Dictionary = active_decal_states[i]
		var decal_variant: Variant = state.get("node", null)
		if not (decal_variant is Sprite2D):
			active_decal_states.remove_at(i)
			continue

		var decal: Sprite2D = decal_variant as Sprite2D
		if not is_instance_valid(decal):
			active_decal_states.remove_at(i)
			continue

		var expire_ms: int = int(state.get("expire_ms", 0))
		if now_ms >= expire_ms:
			decal.visible = false
			active_decal_states.remove_at(i)
			continue

		var fade_start_ms: int = int(state.get("fade_start_ms", expire_ms))
		if now_ms < fade_start_ms:
			continue

		var fade_window_ms: int = maxi(1, expire_ms - fade_start_ms)
		var fade_t: float = clampf(float(now_ms - fade_start_ms) / float(fade_window_ms), 0.0, 1.0)
		var base_alpha: float = clampf(float(state.get("base_alpha", CombatConstants.BLOOD_DECAL_ALPHA)), 0.0, 1.0)
		var color: Color = decal.modulate
		color.a = base_alpha * (1.0 - fade_t)
		decal.modulate = color

func _get_effect_quality_scale() -> float:
	var active_effects: int = get_active_effect_count()
	if active_effects >= CombatConstants.BLOOD_MAX_ACTIVE_EFFECTS:
		return 0.0

	if active_effects <= CombatConstants.BLOOD_SOFT_ACTIVE_EFFECTS:
		return 1.0

	var overflow: float = float(active_effects - CombatConstants.BLOOD_SOFT_ACTIVE_EFFECTS)
	var range_size: float = maxf(
		1.0,
		float(CombatConstants.BLOOD_MAX_ACTIVE_EFFECTS - CombatConstants.BLOOD_SOFT_ACTIVE_EFFECTS)
	)
	var t: float = clampf(overflow / range_size, 0.0, 1.0)
	return lerpf(1.0, CombatConstants.BLOOD_MIN_QUALITY_SCALE, t)

func _create_blood_spray_color_ramp() -> Gradient:
	var ramp := Gradient.new()
	ramp.colors = PackedColorArray([
		Color(0.62, 0.04, 0.04, 0.96),
		Color(0.36, 0.02, 0.02, 0.72),
		Color(0.12, 0.01, 0.01, 0.0)
	])
	ramp.offsets = PackedFloat32Array([0.0, 0.58, 1.0])
	return ramp

func _create_blood_drip_color_ramp() -> Gradient:
	var ramp := Gradient.new()
	ramp.colors = PackedColorArray([
		Color(0.52, 0.03, 0.03, 0.9),
		Color(0.26, 0.01, 0.01, 0.45),
		Color(0.10, 0.01, 0.01, 0.0)
	])
	ramp.offsets = PackedFloat32Array([0.0, 0.7, 1.0])
	return ramp

func _get_jittered_direction(base_direction: Vector2) -> Vector2:
	var safe_direction: Vector2 = base_direction.normalized() if base_direction != Vector2.ZERO else Vector2.UP
	var jitter_radians: float = deg_to_rad(_rng.randf_range(
		-CombatConstants.BLOOD_BURST_DIRECTION_JITTER_DEG,
		CombatConstants.BLOOD_BURST_DIRECTION_JITTER_DEG
	))
	return safe_direction.rotated(jitter_radians).normalized()

func _random_burst_offset() -> Vector2:
	var radius: float = CombatConstants.BLOOD_BURST_OFFSET_RADIUS * _rng.randf_range(0.15, 1.0)
	return Vector2.RIGHT.rotated(_rng.randf_range(0.0, TAU)) * radius

func get_active_effect_count() -> int:
	return _active_effect_ids.size()

func get_pool_stats() -> Dictionary:
	return {
		"blood_pool_size": blood_particle_pool.size(),
		"drip_pool_size": drip_particle_pool.size(),
		"impact_pool_size": impact_particle_pool.size(),
		"decal_pool_size": blood_decal_pool.size(),
		"current_pool_index": pool_index,
		"impact_pool_index": impact_pool_index,
		"drip_pool_index": drip_pool_index,
		"max_pool_size": MAX_POOL_SIZE,
		"active_effects": get_active_effect_count(),
		"active_decals": active_decal_states.size()
	}
