extends CharacterBody2D
class_name CombatEnemy

# Import combat constants
const CombatConstants = preload("res://scripts/combat_constants.gd")
const ENEMY_TEXTURES := {
	"grunt": preload("res://assets/sprites/enemy_grunt.png"),
	"heavy": preload("res://assets/sprites/enemy_heavy.png"),
	"archer": preload("res://assets/sprites/enemy_archer.png")
}
const PROJECTILE_SCENE: PackedScene = preload("res://scenes/combat/projectile.tscn")

signal died

@export var speed: float = CombatConstants.ENEMY_DEFAULT_SPEED
@export var health: int = CombatConstants.ENEMY_DEFAULT_HEALTH
@export var max_health: int = CombatConstants.ENEMY_DEFAULT_HEALTH
@export var damage: int = CombatConstants.ENEMY_DEFAULT_DAMAGE
@export var enemy_type: String = "grunt"
@export var attack_range: float = CombatConstants.ENEMY_DEFAULT_ATTACK_RANGE
@export var attack_cooldown: float = CombatConstants.ENEMY_DEFAULT_ATTACK_COOLDOWN
@export var enable_dialog_barks: bool = true

var player: Node2D = null
var is_alive: bool = true
var last_attack_ms: int = 0
var attack_windup_remaining: float = 0.0
var attack_windup_duration: float = CombatConstants.ENEMY_ATTACK_WINDUP
var attack_min_read_duration: float = CombatConstants.ENEMY_ATTACK_WINDUP
var attack_windup_elapsed: float = 0.0
var attack_telegraph_color: Color = CombatConstants.ENEMY_ATTACK_TELEGRAPH_COLOR
var attack_telegraph_pulse_hz: float = 0.0
var attack_telegraph_pulse_strength: float = 0.0
var attack_telegraph_finish_window: float = 0.0
var attack_telegraph_finish_mix: float = 0.0
var attack_telegraph_sfx_name: String = ""
var attack_telegraph_sfx_volume_db: float = CombatConstants.ENEMY_ATTACK_TELEGRAPH_SFX_VOLUME_DB
var pending_attack: bool = false
var has_attack_slot: bool = false
var attack_gate_delay_remaining: float = 0.0
var stagger_time_remaining: float = 0.0
var stagger_velocity: Vector2 = Vector2.ZERO
var external_push_velocity: Vector2 = Vector2.ZERO
var hurt_tween: Tween = null
var bark_label: Label = null
var bark_rng: RandomNumberGenerator = RandomNumberGenerator.new()
var bark_display_time_remaining: float = 0.0
var bark_interval_remaining: float = 0.0
var last_bark_line: String = ""

@onready var audio_manager = get_node("/root/AudioManager")
@onready var particle_manager = get_node("/root/ParticleManager")
@onready var sprite: Sprite2D = get_node_or_null("Sprite2D") as Sprite2D

func _ready() -> void:
	# Find player in scene
	player = get_tree().get_first_node_in_group("player")
	if not player:
		push_error("CombatEnemy: No player found in scene")

	# Apply type-specific adjustments
	apply_type_modifiers()
	_configure_attack_readability_profile()
	_apply_enemy_visuals()
	set_collision_mask_value(CombatConstants.SHIELD_COLLISION_LAYER_BIT, true)
	_setup_dialog_bark_label()
	_reset_ambient_bark_interval(true)
	_try_emit_dialog_bark("spawn", CombatConstants.ENEMY_BARK_SPAWN_CHANCE)

	add_to_group("enemies")

func apply_type_modifiers() -> void:
	match enemy_type:
		"heavy":
			health = int(max_health * CombatConstants.ENEMY_HEAVY_HEALTH_MULTIPLIER)
			max_health = health
			speed *= CombatConstants.ENEMY_HEAVY_SPEED_MULTIPLIER
			damage = int(damage * CombatConstants.ENEMY_HEAVY_DAMAGE_MULTIPLIER)
		"archer":
			speed *= CombatConstants.ENEMY_ARCHER_SPEED_MULTIPLIER
			attack_range = CombatConstants.ENEMY_ARCHER_ATTACK_RANGE
			attack_cooldown = CombatConstants.ENEMY_ARCHER_ATTACK_COOLDOWN
		_:
			pass # grunt is default

func _configure_attack_readability_profile() -> void:
	attack_windup_duration = CombatConstants.get_enemy_attack_readability_windup(enemy_type)
	attack_min_read_duration = CombatConstants.get_enemy_attack_readability_min_read(enemy_type)
	attack_windup_duration = maxf(attack_windup_duration, attack_min_read_duration)
	attack_telegraph_color = CombatConstants.get_enemy_attack_readability_color(enemy_type)
	attack_telegraph_pulse_hz = CombatConstants.get_enemy_attack_readability_pulse_hz(enemy_type)
	attack_telegraph_pulse_strength = CombatConstants.get_enemy_attack_readability_pulse_strength(enemy_type)
	attack_telegraph_finish_window = CombatConstants.get_enemy_attack_readability_finish_window(enemy_type)
	attack_telegraph_finish_mix = CombatConstants.get_enemy_attack_readability_finish_mix(enemy_type)
	attack_telegraph_sfx_name = CombatConstants.get_enemy_attack_readability_sfx_name(enemy_type)
	attack_telegraph_sfx_volume_db = CombatConstants.get_enemy_attack_readability_sfx_volume_db(enemy_type)

func _apply_enemy_visuals() -> void:
	if sprite == null:
		return
	var texture: Texture2D = ENEMY_TEXTURES.get(enemy_type, ENEMY_TEXTURES["grunt"])
	if texture:
		sprite.texture = texture

func _update_facing_visual() -> void:
	if sprite == null or player == null:
		return

	var to_player: Vector2 = player.global_position - global_position
	if absf(to_player.x) <= 0.05:
		return

	sprite.flip_h = to_player.x < 0.0

func _setup_dialog_bark_label() -> void:
	if not enable_dialog_barks:
		return

	bark_rng.randomize()
	bark_label = Label.new()
	bark_label.name = "DialogBarkLabel"
	bark_label.top_level = true
	bark_label.visible = false
	bark_label.z_index = 120
	bark_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	bark_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	bark_label.add_theme_font_size_override("font_size", CombatConstants.ENEMY_BARK_FONT_SIZE)
	bark_label.add_theme_constant_override("outline_size", CombatConstants.ENEMY_BARK_FONT_OUTLINE_SIZE)
	bark_label.add_theme_color_override("font_color", CombatConstants.ENEMY_BARK_FONT_COLOR)
	bark_label.add_theme_color_override("font_outline_color", CombatConstants.ENEMY_BARK_FONT_OUTLINE_COLOR)
	add_child(bark_label)

func _update_dialog_barks(delta: float) -> void:
	if bark_label == null:
		return

	if bark_label.visible:
		_sync_dialog_bark_position()

	if bark_display_time_remaining > 0.0:
		bark_display_time_remaining = maxf(0.0, bark_display_time_remaining - delta)
		if bark_display_time_remaining <= 0.0:
			_hide_dialog_bark()
		elif bark_label.visible:
			var alpha: float = 1.0
			if bark_display_time_remaining <= CombatConstants.ENEMY_BARK_FADE_SEC:
				alpha = bark_display_time_remaining / CombatConstants.ENEMY_BARK_FADE_SEC
			bark_label.modulate = Color(1.0, 1.0, 1.0, clampf(alpha, 0.0, 1.0))

	if not is_alive:
		return

	bark_interval_remaining = maxf(0.0, bark_interval_remaining - delta)
	if bark_interval_remaining > 0.0:
		return

	_reset_ambient_bark_interval()
	if player == null:
		return

	var distance_to_player: float = global_position.distance_to(player.global_position)
	if distance_to_player > CombatConstants.ENEMY_BARK_MAX_PLAYER_DISTANCE:
		return

	_try_emit_dialog_bark("ambient", CombatConstants.ENEMY_BARK_AMBIENT_CHANCE)

func _try_emit_dialog_bark(bark_kind: String, trigger_chance: float = 1.0, duration_sec: float = CombatConstants.ENEMY_BARK_DEFAULT_DURATION_SEC) -> void:
	if not enable_dialog_barks:
		return
	if bark_label == null or not is_alive:
		return
	if bark_kind == "ambient" and bark_display_time_remaining > 0.0:
		return

	var chance: float = clampf(trigger_chance, 0.0, 1.0)
	if chance <= 0.0:
		return
	if bark_rng.randf() > chance:
		return

	var bark_line: String = _pick_dialog_bark_line(bark_kind)
	if bark_line.is_empty():
		return
	_show_dialog_bark(bark_line, duration_sec)
	_reset_ambient_bark_interval()

func _pick_dialog_bark_line(bark_kind: String) -> String:
	var lines: Array[String] = CombatConstants.get_enemy_dialog_bark_lines(enemy_type, bark_kind)
	if lines.is_empty():
		return ""

	var selected: String = lines[bark_rng.randi_range(0, lines.size() - 1)]
	if lines.size() > 1 and selected == last_bark_line:
		for _i in range(3):
			selected = lines[bark_rng.randi_range(0, lines.size() - 1)]
			if selected != last_bark_line:
				break

	last_bark_line = selected
	return selected

func _show_dialog_bark(bark_line: String, duration_sec: float) -> void:
	if bark_label == null:
		return
	if bark_line.is_empty():
		return

	bark_label.text = bark_line
	var min_size: Vector2 = bark_label.get_minimum_size() + Vector2(12.0, 6.0)
	bark_label.size = Vector2(
		maxf(CombatConstants.ENEMY_BARK_MIN_WIDTH, min_size.x),
		maxf(CombatConstants.ENEMY_BARK_MIN_HEIGHT, min_size.y)
	)
	bark_label.visible = true
	bark_label.modulate = Color.WHITE
	bark_display_time_remaining = maxf(0.1, duration_sec)
	_sync_dialog_bark_position()

func _sync_dialog_bark_position() -> void:
	if bark_label == null:
		return
	if not bark_label.visible:
		return
	bark_label.global_position = global_position + Vector2(
		-bark_label.size.x * 0.5,
		CombatConstants.ENEMY_BARK_VERTICAL_OFFSET_PX - bark_label.size.y
	)

func _hide_dialog_bark() -> void:
	if bark_label == null:
		return
	bark_display_time_remaining = 0.0
	bark_label.visible = false
	bark_label.text = ""

func _reset_ambient_bark_interval(use_quick_start: bool = false) -> void:
	var min_interval: float = CombatConstants.ENEMY_BARK_MIN_INTERVAL_SEC
	var max_interval: float = CombatConstants.ENEMY_BARK_MAX_INTERVAL_SEC
	if use_quick_start:
		min_interval *= 0.6
		max_interval *= 0.8
	if max_interval < min_interval:
		max_interval = min_interval
	bark_interval_remaining = bark_rng.randf_range(min_interval, max_interval)

func _physics_process(delta: float) -> void:
	_update_dialog_barks(delta)
	if not is_alive or not player:
		return

	_update_facing_visual()

	if _is_hit_stop_active():
		velocity = Vector2.ZERO
		return

	var base_velocity: Vector2 = Vector2.ZERO
	var shield_barrier: Dictionary = _get_shield_barrier_context()

	if stagger_time_remaining > 0.0:
		stagger_time_remaining = maxf(0.0, stagger_time_remaining - delta)
		base_velocity = stagger_velocity
		stagger_velocity = stagger_velocity.move_toward(Vector2.ZERO, CombatConstants.ENEMY_STAGGER_DAMPING * delta)
		if stagger_time_remaining <= 0.0:
			stagger_velocity = Vector2.ZERO
	else:
		if pending_attack and attack_windup_remaining > 0.0:
			attack_windup_elapsed += delta
			attack_windup_remaining = maxf(0.0, attack_windup_remaining - delta)
			_update_attack_telegraph_visual()
			if attack_windup_remaining <= 0.0:
				attack_player()
		else:
			var distance_to_player: float = global_position.distance_to(player.global_position)
			if distance_to_player > attack_range:
				var direction: Vector2 = (player.global_position - global_position).normalized()
				base_velocity = direction * speed
			else:
				if attack_gate_delay_remaining > 0.0:
					attack_gate_delay_remaining = maxf(0.0, attack_gate_delay_remaining - delta)
				else:
					var now: int = Time.get_ticks_msec()
					if not pending_attack and now - last_attack_ms >= int(attack_cooldown * 1000):
						_start_attack_windup()
						last_attack_ms = now

	base_velocity = _apply_shield_barrier_to_velocity(base_velocity, shield_barrier)
	velocity = base_velocity + external_push_velocity
	move_and_slide()
	_resolve_shield_barrier_penetration(shield_barrier)
	_apply_external_push_resistance(delta)

func _start_attack_windup() -> void:
	if not _try_consume_attack_slot():
		return
	pending_attack = true
	attack_windup_elapsed = 0.0
	attack_windup_remaining = attack_windup_duration
	_try_emit_dialog_bark("attack", CombatConstants.ENEMY_BARK_ATTACK_CHANCE, CombatConstants.ENEMY_BARK_ATTACK_DURATION_SEC)
	_play_attack_telegraph_sfx()
	_update_attack_telegraph_visual()

func _play_attack_telegraph_sfx() -> void:
	if attack_telegraph_sfx_name.is_empty():
		return
	if audio_manager == null:
		return
	if not audio_manager.has_method("get_sfx") or not audio_manager.has_method("play_sfx"):
		return
	var cue: AudioStream = audio_manager.get_sfx(attack_telegraph_sfx_name)
	if cue:
		audio_manager.play_sfx(cue, attack_telegraph_sfx_volume_db)

func _clear_attack_windup() -> void:
	pending_attack = false
	attack_windup_remaining = 0.0
	attack_windup_elapsed = 0.0
	_release_attack_slot()
	if is_alive:
		modulate = Color.WHITE

func _update_attack_telegraph_visual() -> void:
	if not pending_attack or not is_alive:
		return

	var read_color: Color = attack_telegraph_color
	if attack_windup_duration > 0.0:
		var progress_ratio: float = clampf(1.0 - (attack_windup_remaining / attack_windup_duration), 0.0, 1.0)
		read_color = read_color.lerp(Color.WHITE, progress_ratio * CombatConstants.ENEMY_ATTACK_TELEGRAPH_PROGRESS_BRIGHTEN)

	if attack_telegraph_finish_window > 0.0 and attack_windup_remaining <= attack_telegraph_finish_window:
		var finish_ratio: float = clampf(1.0 - (attack_windup_remaining / attack_telegraph_finish_window), 0.0, 1.0)
		read_color = read_color.lerp(Color.WHITE, finish_ratio * attack_telegraph_finish_mix)

	var pulse_gain: float = 1.0
	if attack_telegraph_pulse_hz > 0.0 and attack_telegraph_pulse_strength > 0.0:
		pulse_gain += sin(attack_windup_elapsed * attack_telegraph_pulse_hz * TAU) * attack_telegraph_pulse_strength

	modulate = Color(
		clampf(read_color.r * pulse_gain, 0.0, 1.0),
		clampf(read_color.g * pulse_gain, 0.0, 1.0),
		clampf(read_color.b * pulse_gain, 0.0, 1.0),
		1.0
	)

func attack_player() -> void:
	if not pending_attack:
		return
	if attack_windup_elapsed + 0.0001 < attack_min_read_duration:
		attack_windup_remaining = maxf(0.001, attack_min_read_duration - attack_windup_elapsed)
		return
	_clear_attack_windup()
	if not is_alive:
		return
	if not player:
		return
	if global_position.distance_to(player.global_position) > attack_range:
		return
	if enemy_type == "archer":
		_fire_projectile()
		return
	if player.has_method("take_damage"):
		player.take_damage(damage, global_position, null, self)
	if audio_manager:
		var hit_sfx = audio_manager.get_sfx("hit")
		if hit_sfx:
			audio_manager.play_sfx(hit_sfx, CombatConstants.AUDIO_VOLUME_ENEMY_HIT)

func _fire_projectile() -> void:
	if PROJECTILE_SCENE == null:
		return
	var projectile_instance: Node = PROJECTILE_SCENE.instantiate()
	if projectile_instance == null:
		return
	var to_player: Vector2 = player.global_position - global_position
	var direction: Vector2 = to_player.normalized() if to_player != Vector2.ZERO else Vector2.RIGHT
	if projectile_instance.has_method("initialize"):
		projectile_instance.call(
			"initialize",
			direction,
			self,
			CombatConstants.PROJECTILE_DAMAGE,
			CombatConstants.PROJECTILE_SPEED,
			CombatConstants.PROJECTILE_LIFETIME_SEC,
			CombatConstants.PROJECTILE_MAX_RANGE
		)
	var spawn_parent: Node = get_tree().current_scene
	if spawn_parent == null:
		spawn_parent = get_parent()
	if spawn_parent == null:
		projectile_instance.queue_free()
		return
	spawn_parent.add_child(projectile_instance)
	if projectile_instance is Node2D:
		var projectile_node: Node2D = projectile_instance as Node2D
		projectile_node.global_position = global_position + direction * CombatConstants.PROJECTILE_SPAWN_OFFSET

func set_attack_gate_delay(delay_sec: float) -> void:
	attack_gate_delay_remaining = maxf(0.0, delay_sec)

func _try_consume_attack_slot() -> bool:
	if has_attack_slot:
		return true
	var combat_scene: CombatScene = _get_combat_scene()
	if combat_scene != null and combat_scene.has_method("request_enemy_attack_slot"):
		has_attack_slot = bool(combat_scene.call("request_enemy_attack_slot", self))
		return has_attack_slot
	has_attack_slot = true
	return true

func _release_attack_slot() -> void:
	if not has_attack_slot:
		return
	has_attack_slot = false
	var combat_scene: CombatScene = _get_combat_scene()
	if combat_scene != null and combat_scene.has_method("release_enemy_attack_slot"):
		combat_scene.call("release_enemy_attack_slot", self)

func apply_shield_push(push_velocity_delta: Vector2) -> void:
	if not is_alive:
		return
	if push_velocity_delta == Vector2.ZERO:
		return

	var push_direction: Vector2 = push_velocity_delta.normalized()
	var reverse_component: float = -external_push_velocity.dot(push_direction)
	if reverse_component > 0.0:
		# Remove any velocity opposing the current shield push so a "push" never reads as pull.
		external_push_velocity += push_direction * reverse_component

	external_push_velocity += push_velocity_delta
	var max_speed: float = CombatConstants.SHIELD_PUSH_MAX_ENEMY_SPEED
	var max_speed_sq: float = max_speed * max_speed
	if external_push_velocity.length_squared() > max_speed_sq:
		external_push_velocity = external_push_velocity.normalized() * max_speed
	if pending_attack:
		_clear_attack_windup()

func _apply_external_push_resistance(delta: float) -> void:
	if external_push_velocity == Vector2.ZERO:
		return
	external_push_velocity = external_push_velocity.move_toward(Vector2.ZERO, CombatConstants.ENEMY_PUSH_RESISTANCE * delta)
	if external_push_velocity.length_squared() <= 1.0:
		external_push_velocity = Vector2.ZERO

func _get_shield_barrier_context() -> Dictionary:
	if not (player is CombatPlayer):
		return {}

	var combat_player: CombatPlayer = player as CombatPlayer
	if not combat_player.is_shield_active():
		return {}

	var facing: Vector2 = combat_player.get_shield_facing_direction()
	if facing == Vector2.ZERO:
		return {}

	return {
		"origin": combat_player.global_position,
		"facing": facing.normalized(),
		"distance": combat_player.get_shield_barrier_distance(),
		"half_width": CombatConstants.SHIELD_COLLISION_WIDTH * 0.5 + CombatConstants.SHIELD_PUSH_CONTACT_PADDING + 20.0
	}

func _apply_shield_barrier_to_velocity(base_velocity: Vector2, shield_barrier: Dictionary) -> Vector2:
	if shield_barrier.is_empty():
		return base_velocity

	var facing: Vector2 = shield_barrier["facing"]
	var origin: Vector2 = shield_barrier["origin"]
	var relative: Vector2 = global_position - origin
	var forward: float = relative.dot(facing)
	if forward < 0.0:
		return base_velocity

	var lateral_axis: Vector2 = facing.orthogonal().normalized()
	var lateral: float = absf(relative.dot(lateral_axis))
	var max_lateral: float = float(shield_barrier["half_width"])
	if lateral > max_lateral:
		return base_velocity

	var barrier_distance: float = float(shield_barrier["distance"])
	if forward > barrier_distance + 2.0:
		return base_velocity

	var inward_speed: float = -base_velocity.dot(facing)
	if inward_speed <= 0.0:
		return base_velocity
	return base_velocity + facing * inward_speed

func _resolve_shield_barrier_penetration(shield_barrier: Dictionary) -> void:
	if shield_barrier.is_empty():
		return

	var facing: Vector2 = shield_barrier["facing"]
	var origin: Vector2 = shield_barrier["origin"]
	var relative: Vector2 = global_position - origin
	var forward: float = relative.dot(facing)
	if forward < 0.0:
		return

	var lateral_axis: Vector2 = facing.orthogonal().normalized()
	var lateral: float = absf(relative.dot(lateral_axis))
	var max_lateral: float = float(shield_barrier["half_width"])
	if lateral > max_lateral:
		return

	var barrier_distance: float = float(shield_barrier["distance"])
	if forward >= barrier_distance:
		return

	global_position += facing * (barrier_distance - forward)

	var inward_velocity: float = -velocity.dot(facing)
	if inward_velocity > 0.0:
		velocity += facing * inward_velocity

	var inward_push_velocity: float = -external_push_velocity.dot(facing)
	if inward_push_velocity > 0.0:
		external_push_velocity += facing * inward_push_velocity

	if pending_attack:
		_clear_attack_windup()

func take_damage(amount: int, attacker_direction: Vector2 = Vector2.ZERO, attack_context: Dictionary = {}) -> void:
	if not is_alive:
		return

	var damage_multiplier: float = maxf(1.0, float(attack_context.get("damage_multiplier", 1.0)))
	var armor_break_level: int = maxi(0, int(attack_context.get("armor_break_level", 0)))
	var applied_damage: int = _calculate_combo_adjusted_damage(amount, damage_multiplier, armor_break_level)
	health -= applied_damage
	if health <= 0:
		die()
		return

	var stagger_force_multiplier: float = maxf(1.0, float(attack_context.get("stagger_force_multiplier", 1.0)))
	var stagger_duration_multiplier: float = maxf(1.0, float(attack_context.get("stagger_duration_multiplier", 1.0)))
	var hit_direction: Vector2 = attacker_direction.normalized() if attacker_direction != Vector2.ZERO else Vector2.LEFT
	_apply_stagger(hit_direction, stagger_duration_multiplier, stagger_force_multiplier)

	if particle_manager:
		if particle_manager.has_method("play_blood_spray"):
			var blood_tint: Color = CombatConstants.get_enemy_blood_tint(enemy_type)
			var blood_tier: String = "light"
			if applied_damage >= 3:
				blood_tier = "heavy"
			elif applied_damage >= 2:
				blood_tier = "medium"
			var blood_intensity: float = CombatConstants.get_blood_intensity_for_tier(blood_tier) + float(applied_damage) * CombatConstants.BLOOD_HIT_INTENSITY_PER_DAMAGE
			var burst_count: int = CombatConstants.get_blood_burst_for_tier(blood_tier)
			particle_manager.play_blood_spray(global_position, hit_direction, blood_intensity, blood_tint, burst_count)
		elif particle_manager.has_method("play_blood_effect"):
			particle_manager.play_blood_effect(global_position)

	if particle_manager and particle_manager.has_method("play_impact_effect"):
		particle_manager.play_impact_effect(global_position, hit_direction)

	_play_hurt_flash()
	_try_emit_dialog_bark("hurt", CombatConstants.ENEMY_BARK_HURT_CHANCE, CombatConstants.ENEMY_BARK_HURT_DURATION_SEC)

func _calculate_combo_adjusted_damage(base_damage: int, damage_multiplier: float, armor_break_level: int) -> int:
	var scaled_damage: float = float(maxi(1, base_damage)) * damage_multiplier
	var armor_points: int = CombatConstants.get_enemy_combo_armor(enemy_type)
	var effective_armor: int = maxi(0, armor_points - armor_break_level)
	if effective_armor > 0:
		var reduction: float = float(effective_armor) * CombatConstants.ENEMY_COMBO_ARMOR_DAMAGE_REDUCTION_PER_POINT
		var armor_scale: float = maxf(CombatConstants.ENEMY_COMBO_MIN_DAMAGE_SCALE, 1.0 - reduction)
		scaled_damage *= armor_scale
	return maxi(1, int(round(scaled_damage)))

func _apply_stagger(hit_direction: Vector2, duration_multiplier: float = 1.0, force_multiplier: float = 1.0) -> void:
	_clear_attack_windup()
	stagger_time_remaining = CombatConstants.ENEMY_STAGGER_DURATION * clampf(duration_multiplier, 1.0, 2.0)
	stagger_velocity = hit_direction.normalized() * CombatConstants.ENEMY_STAGGER_FORCE * clampf(force_multiplier, 1.0, 2.5)

func apply_perfect_block_counter(counter_direction: Vector2, force_multiplier: float = 1.0, duration_multiplier: float = 1.0) -> void:
	if not is_alive:
		return
	var resolved_direction: Vector2 = counter_direction.normalized() if counter_direction != Vector2.ZERO else Vector2.LEFT
	_apply_stagger(resolved_direction, duration_multiplier, force_multiplier)
	if particle_manager and particle_manager.has_method("play_impact_effect"):
		particle_manager.play_impact_effect(global_position, resolved_direction)
	_play_hurt_flash()

func _play_hurt_flash() -> void:
	if hurt_tween and is_instance_valid(hurt_tween):
		hurt_tween.kill()

	modulate = Color(1.0, 0.35, 0.35, 1.0)
	hurt_tween = create_tween()
	hurt_tween.tween_property(self, "modulate", Color.WHITE, CombatConstants.EFFECT_DURATION_ENEMY_HURT)

func die() -> void:
	if not is_alive:
		return

	is_alive = false
	_clear_attack_windup()
	_hide_dialog_bark()
	visible = false
	velocity = Vector2.ZERO
	stagger_time_remaining = 0.0
	stagger_velocity = Vector2.ZERO
	external_push_velocity = Vector2.ZERO

	# Blood effect using particle pool
	if particle_manager and particle_manager.has_method("play_blood_explosion"):
		particle_manager.play_blood_explosion(global_position, Vector2.UP, CombatConstants.get_enemy_blood_tint(enemy_type))
	elif particle_manager and particle_manager.has_method("play_blood_effect"):
		particle_manager.play_blood_effect(global_position)
	else:
		# Fallback to dynamic creation if particle manager not available
		_create_fallback_blood_effect()

	died.emit()
	queue_free()

func _create_fallback_blood_effect() -> void:
	var blood_particles := CPUParticles2D.new()
	blood_particles.emitting = true
	blood_particles.explosiveness = 1.0
	blood_particles.amount = CombatConstants.BLOOD_PARTICLE_AMOUNT
	blood_particles.lifetime = CombatConstants.BLOOD_PARTICLE_LIFETIME
	blood_particles.direction = Vector2.UP
	blood_particles.spread = CombatConstants.BLOOD_PARTICLE_SPREAD
	blood_particles.initial_velocity_min = CombatConstants.BLOOD_PARTICLE_VELOCITY_MIN
	blood_particles.initial_velocity_max = CombatConstants.BLOOD_PARTICLE_VELOCITY_MAX
	blood_particles.color = CombatConstants.get_enemy_blood_tint(enemy_type)
	blood_particles.gravity = CombatConstants.BLOOD_PARTICLE_GRAVITY
	blood_particles.z_as_relative = false
	blood_particles.z_index = 8
	blood_particles.add_to_group("combat_effects")
	get_parent().add_child(blood_particles)
	blood_particles.global_position = global_position

	# Auto-remove particles after emission
	await get_tree().create_timer(CombatConstants.EFFECT_DURATION_BLOOD).timeout
	if is_instance_valid(blood_particles):
		blood_particles.queue_free()

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
