extends Node

const CombatConstants = preload("res://scripts/combat_constants.gd")
const RuntimeLog = preload("res://scripts/runtime_log.gd")

# Particle pool configuration
const MAX_POOL_SIZE: int = CombatConstants.BLOOD_POOL_SIZE
const IMPACT_POOL_SIZE: int = 12

# Particle pools
var blood_particle_pool: Array[CPUParticles2D] = []
var pool_index: int = 0
var impact_particle_pool: Array[CPUParticles2D] = []
var impact_pool_index: int = 0

var _active_effect_ids: Dictionary = {}
var _effect_tokens: Dictionary = {}
var _rng: RandomNumberGenerator = RandomNumberGenerator.new()

func _ready() -> void:
	_rng.randomize()
	_initialize_blood_particle_pool()
	_initialize_impact_particle_pool()

	RuntimeLog.info(
		"ParticleManager: Initialized with %d blood particles and %d impact particles"
		% [MAX_POOL_SIZE, IMPACT_POOL_SIZE]
	)

func _initialize_blood_particle_pool() -> void:
	for _i in range(MAX_POOL_SIZE):
		var particles: CPUParticles2D = _create_blood_particles()
		particles.emitting = false
		particles.visible = false
		add_child(particles)
		blood_particle_pool.append(particles)

func _initialize_impact_particle_pool() -> void:
	for _i in range(IMPACT_POOL_SIZE):
		var particles: CPUParticles2D = _create_impact_particles()
		particles.emitting = false
		particles.visible = false
		add_child(particles)
		impact_particle_pool.append(particles)

func _create_blood_particles() -> CPUParticles2D:
	var particles := CPUParticles2D.new()
	_configure_blood_particles(particles, Vector2.UP, 1.0)
	particles.color = Color.RED
	return particles

func _create_impact_particles() -> CPUParticles2D:
	var particles := CPUParticles2D.new()
	particles.explosiveness = 1.0
	particles.amount = CombatConstants.IMPACT_PARTICLE_AMOUNT
	particles.lifetime = CombatConstants.IMPACT_PARTICLE_LIFETIME
	particles.direction = Vector2.RIGHT
	particles.spread = CombatConstants.IMPACT_PARTICLE_SPREAD
	particles.initial_velocity_min = CombatConstants.IMPACT_PARTICLE_VELOCITY_MIN
	particles.initial_velocity_max = CombatConstants.IMPACT_PARTICLE_VELOCITY_MAX
	particles.color = CombatConstants.IMPACT_PARTICLE_COLOR
	particles.gravity = CombatConstants.IMPACT_PARTICLE_GRAVITY
	return particles

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

func _prepare_particle_for_reuse(particles: CPUParticles2D) -> void:
	particles.emitting = false
	particles.visible = true
	particles.restart()

func play_blood_effect(
	position: Vector2,
	direction: Vector2 = Vector2.UP,
	intensity: float = 1.0,
	burst_count: int = 1
) -> void:
	var safe_burst_count: int = maxi(1, burst_count)
	var base_direction: Vector2 = direction.normalized() if direction != Vector2.ZERO else Vector2.UP
	for _i in range(safe_burst_count):
		var particles: CPUParticles2D = get_blood_particles()
		if not particles:
			push_error("ParticleManager: Failed to get blood particles")
			return

		var emit_direction: Vector2 = _get_jittered_direction(base_direction)
		_configure_blood_particles(particles, emit_direction, intensity)
		var offset: Vector2 = _random_burst_offset() if safe_burst_count > 1 else Vector2.ZERO
		_play_effect(particles, position + offset, emit_direction, particles.lifetime)

func play_blood_spray(position: Vector2, direction: Vector2 = Vector2.RIGHT, intensity: float = CombatConstants.BLOOD_HIT_INTENSITY) -> void:
	play_blood_effect(position, direction, intensity, CombatConstants.BLOOD_HIT_BURST_COUNT)

func play_blood_explosion(position: Vector2, direction: Vector2 = Vector2.UP) -> void:
	play_blood_effect(position, direction, CombatConstants.BLOOD_DEATH_INTENSITY, CombatConstants.BLOOD_DEATH_BURST_COUNT)

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

func _configure_blood_particles(particles: CPUParticles2D, emit_direction: Vector2, intensity: float) -> void:
	var clamped_intensity: float = clampf(intensity, 0.3, 6.0)
	var intensity_t: float = clampf((clamped_intensity - 1.0) / 4.0, 0.0, 1.0)
	particles.explosiveness = 1.0
	particles.amount = maxi(1, int(round(CombatConstants.BLOOD_PARTICLE_AMOUNT * clamped_intensity)))
	particles.lifetime = CombatConstants.BLOOD_PARTICLE_LIFETIME * (0.9 + intensity_t * 0.75)
	particles.direction = emit_direction
	particles.spread = clampf(CombatConstants.BLOOD_PARTICLE_SPREAD + clamped_intensity * 8.0, 8.0, 180.0)
	particles.initial_velocity_min = CombatConstants.BLOOD_PARTICLE_VELOCITY_MIN * (0.7 + clamped_intensity * 0.25)
	particles.initial_velocity_max = CombatConstants.BLOOD_PARTICLE_VELOCITY_MAX * (0.75 + clamped_intensity * 0.3)
	particles.gravity = CombatConstants.BLOOD_PARTICLE_GRAVITY * (0.9 + clamped_intensity * 0.12)

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
		"impact_pool_size": impact_particle_pool.size(),
		"current_pool_index": pool_index,
		"impact_pool_index": impact_pool_index,
		"max_pool_size": MAX_POOL_SIZE,
		"active_effects": get_active_effect_count()
	}
