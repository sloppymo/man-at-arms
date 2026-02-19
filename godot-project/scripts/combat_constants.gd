class_name CombatConstants
extends Resource

# Combat area and positioning
const COMBAT_AREA_SIZE = Vector2(1600, 1200)
const COMBAT_AREA_CENTER = Vector2(800, 600)
const SPAWN_POINTS = [
	Vector2(200, 200),
	Vector2(1400, 200),
	Vector2(200, 1000),
	Vector2(1400, 1000),
	Vector2(400, 600),
	Vector2(1200, 600)
]

# Player combat constants
const HOTLINE_STYLE_MOVEMENT = true
const DODGE_SPEED = 760.0
const DODGE_DISTANCE = 82.0
const DODGE_INVINCIBILITY_TIME = 190  # milliseconds
const PLAYER_MOVE_ACCELERATION = 4200.0
const PLAYER_MOVE_DECELERATION = 5200.0
const PLAYER_MOVE_TURN_ACCEL_MULTIPLIER = 1.35
const SHIELD_BLOCK_ARC = PI / 2  # 90 degrees frontal block cone
const SHIELD_BLOCK_COLOR = Color(0.45, 0.75, 1.0, 0.9)
const SHIELD_BLOCK_WIDTH = 3.0
const SHIELD_VISUAL_ALWAYS_ON = true
const SHIELD_VISUAL_IDLE_OUTLINE_ALPHA = 0.72
const SHIELD_VISUAL_IDLE_FILL_ALPHA = 0.16
const SHIELD_VISUAL_ACTIVE_FILL_ALPHA = 0.34
const SHIELD_BLOCK_RANGE = 72.0
const SHIELD_MOVE_SPEED_MULTIPLIER = 0.82
const SHIELD_MAX_HEALTH = 100.0
const SHIELD_BREAK_RECOVERY_SEC = 1.2
const SHIELD_REGEN_DELAY_SEC = 1.0
const SHIELD_REGEN_PER_SEC = 24.0
const SHIELD_ENEMY_BARRIER_DISTANCE = 44.0
const SHIELD_COLLISION_OFFSET = 42.0
const SHIELD_COLLISION_RADIUS = 8.0
const SHIELD_COLLISION_WIDTH = 78.0
const SHIELD_COLLISION_LAYER_BIT = 4
const SHIELD_PUSH_BASE_FORCE = 240.0
const SHIELD_PUSH_FORCE_MULTIPLIER = 3.0
const SHIELD_PUSH_MIN_FORWARD_SPEED = 8.0
const SHIELD_PUSH_MAX_ENEMY_SPEED = 360.0
const SHIELD_PUSH_CONTACT_PADDING = 10.0
const SHIELD_PUSH_FRONT_DOT_MIN = 0.12
const SHIELD_PUSH_SIDE_DAMP_MIN = 0.42
const SHIELD_PUSH_CLOSE_CONTACT_DISTANCE = 24.0
const SHIELD_PUSH_CLOSE_CONTACT_BOOST = 1.55
const SHIELD_BLOCK_VFX_ENABLED = true
const SHIELD_BLOCK_SFX_ENABLED = true
const SHIELD_BLOCK_PROJECTILE_HIT_STOP_SEC = 0.015
const SHIELD_BLOCK_MIN_DAMAGE = 1.0
const SHIELD_PERFECT_BLOCK_WINDOW_MS = 90
const SHIELD_PERFECT_BLOCK_DAMAGE_MULTIPLIER = 0.35
const SHIELD_PERFECT_BLOCK_PROJECTILE_REFLECT_ENABLED = true
const SHIELD_PERFECT_BLOCK_REFLECT_SHIELD_IGNORE_FRAMES = 2
const SHIELD_PERFECT_BLOCK_MIN_REFLECT_ALIGNMENT = 0.2
const ATTACK_ARC_STEPS = 20
const ATTACK_ARC_WIDTH = 2
const ATTACK_ARC_COLOR = Color.YELLOW
const ATTACK_ARC_DURATION = 0.2
const ATTACK_TRAIL_DURATION = 0.12
const ATTACK_TRAIL_ALPHA = 0.85
const ATTACK_TRAIL_SCALE = Vector2(0.6, 0.22)
const COMBO_RESET_THRESHOLD = 3
const COMBO_TIMEOUT_MS = 900
const COMBO_DAMAGE_MULTIPLIER = 1.1
const COMBO_TIER_1_THRESHOLD = 3
const COMBO_TIER_2_THRESHOLD = 6
const COMBO_TIER_3_THRESHOLD = 9
const COMBO_TIER_DAMAGE_MULTIPLIERS = {
	0: 1.0,
	1: COMBO_DAMAGE_MULTIPLIER,
	2: 1.24,
	3: 1.38
}
const COMBO_TIER_STAGGER_FORCE_MULTIPLIERS = {
	0: 1.0,
	1: 1.05,
	2: 1.16,
	3: 1.30
}
const COMBO_TIER_STAGGER_DURATION_MULTIPLIERS = {
	0: 1.0,
	1: 1.04,
	2: 1.12,
	3: 1.20
}
const COMBO_TIER_ARMOR_BREAK_LEVELS = {
	0: 0,
	1: 0,
	2: 1,
	3: 2
}
const ENEMY_COMBO_ARMOR_BY_TYPE = {
	"grunt": 0,
	"heavy": 2,
	"archer": 1
}
const ENEMY_COMBO_ARMOR_DAMAGE_REDUCTION_PER_POINT = 0.08
const ENEMY_COMBO_MIN_DAMAGE_SCALE = 0.60
const BASE_DAMAGE = 35
const SPECIAL_ABILITY_MULTIPLIER = 1.5
const SPECIAL_ABILITY_DURATION = 5.0
const HURT_EFFECT_DURATION = 0.2
const KNOCKBACK_SPEED = 200.0
const CAMERA_SHAKE_DAMAGE_INTENSITY = 5.0
const CAMERA_SHAKE_DAMAGE_DURATION = 0.32
const SWING_SOUND_VOLUME = -10.0
const HIT_SOUND_VOLUME = -5.0

# Player default stats
const PLAYER_DEFAULT_SPEED = 320.0
const PLAYER_DEFAULT_HEALTH = 1
const PLAYER_DEFAULT_DAMAGE = 35
const PLAYER_DEFAULT_ATTACK_RANGE = 110.0
const PLAYER_DEFAULT_ATTACK_ARC = PI / 2  # 90 degrees
const PLAYER_DEFAULT_ATTACK_COOLDOWN = 0.14
const PLAYER_DEFAULT_DODGE_COOLDOWN = 0.32
const PLAYER_DEFAULT_SPECIAL_COOLDOWN = 4.0

# Enemy constants
const ENEMY_DEFAULT_SPEED = 130.0
const ENEMY_DEFAULT_HEALTH = 1
const ENEMY_DEFAULT_DAMAGE = 15
const ENEMY_DEFAULT_ATTACK_RANGE = 48.0
const ENEMY_DEFAULT_ATTACK_COOLDOWN = 0.55
const ENEMY_BARK_DEFAULT_DURATION_SEC = 1.45
const ENEMY_BARK_ATTACK_DURATION_SEC = 1.05
const ENEMY_BARK_HURT_DURATION_SEC = 0.95
const ENEMY_BARK_FADE_SEC = 0.18
const ENEMY_BARK_MIN_INTERVAL_SEC = 2.2
const ENEMY_BARK_MAX_INTERVAL_SEC = 4.8
const ENEMY_BARK_AMBIENT_CHANCE = 0.34
const ENEMY_BARK_ATTACK_CHANCE = 0.62
const ENEMY_BARK_HURT_CHANCE = 0.44
const ENEMY_BARK_SPAWN_CHANCE = 0.50
const ENEMY_BARK_MAX_PLAYER_DISTANCE = 420.0
const ENEMY_BARK_FONT_SIZE = 14
const ENEMY_BARK_FONT_OUTLINE_SIZE = 2
const ENEMY_BARK_FONT_COLOR = Color(1.0, 0.96, 0.90, 1.0)
const ENEMY_BARK_FONT_OUTLINE_COLOR = Color(0.08, 0.07, 0.05, 1.0)
const ENEMY_BARK_MIN_WIDTH = 68.0
const ENEMY_BARK_MIN_HEIGHT = 22.0
const ENEMY_BARK_VERTICAL_OFFSET_PX = -42.0
const ENEMY_DIALOG_BARKS_COMMON = {
	"spawn": [
		"There!",
		"Eyes sharp."
	],
	"ambient": [
		"Hold the line.",
		"Spread out!",
		"Keep moving."
	],
	"attack": [
		"Now!",
		"Take him!"
	],
	"hurt": [
		"Ugh!",
		"Still standing."
	]
}
const ENEMY_DIALOG_BARKS_BY_TYPE = {
	"grunt": {
		"spawn": [
			"On your feet.",
			"Ready blades."
		],
		"ambient": [
			"Watch the flank.",
			"Don't blink.",
			"He's close."
		],
		"attack": [
			"Cut him down!",
			"Forward!"
		],
		"hurt": [
			"I'm hit!",
			"Not done yet."
		]
	},
	"heavy": {
		"spawn": [
			"I break shields.",
			"You face iron."
		],
		"ambient": [
			"Come test your steel.",
			"Stand and fight.",
			"I hold this ground."
		],
		"attack": [
			"Crush!",
			"Break!"
		],
		"hurt": [
			"Hnh!",
			"Need more than that."
		]
	},
	"archer": {
		"spawn": [
			"Bow up.",
			"I see you."
		],
		"ambient": [
			"Loose on my mark.",
			"Range is mine.",
			"Keep him in sight."
		],
		"attack": [
			"Loose!",
			"Arrow away!"
		],
		"hurt": [
			"Ah!",
			"Not my arm."
		]
	}
}

# Enemy type modifiers
const ENEMY_HEAVY_HEALTH_MULTIPLIER = 1.5
const ENEMY_HEAVY_SPEED_MULTIPLIER = 0.7
const ENEMY_HEAVY_DAMAGE_MULTIPLIER = 1.2
const ENEMY_ARCHER_SPEED_MULTIPLIER = 0.9
const ENEMY_ARCHER_ATTACK_RANGE = 200.0
const ENEMY_STAGGER_DURATION = 0.12
const ENEMY_STAGGER_FORCE = 220.0
const ENEMY_STAGGER_DAMPING = 900.0
const ENEMY_PUSH_RESISTANCE = 280.0
const ENEMY_ATTACK_WINDUP = 0.2
const ENEMY_ATTACK_TELEGRAPH_COLOR = Color(1.0, 0.45, 0.3, 1.0)
const ENEMY_ATTACK_TELEGRAPH_PROGRESS_BRIGHTEN = 0.18
const ENEMY_ATTACK_TELEGRAPH_SFX_NAME = "swing"
const ENEMY_ATTACK_TELEGRAPH_SFX_VOLUME_DB = -12.0
const ENEMY_ATTACK_READABILITY_FALLBACK_TYPE = "grunt"
const ENEMY_ATTACK_READABILITY_BY_TYPE = {
	"grunt": {
		"windup_sec": 0.18,
		"telegraph_color": Color(1.0, 0.56, 0.27, 1.0),
		"pulse_hz": 5.5,
		"pulse_strength": 0.12,
		"finish_window_sec": 0.06,
		"finish_mix": 0.32,
		"telegraph_sfx": "swing",
		"telegraph_sfx_volume_db": -13.0
	},
	"heavy": {
		"windup_sec": 0.32,
		"telegraph_color": Color(1.0, 0.26, 0.22, 1.0),
		"pulse_hz": 3.8,
		"pulse_strength": 0.20,
		"finish_window_sec": 0.10,
		"finish_mix": 0.42,
		"telegraph_sfx": "swing",
		"telegraph_sfx_volume_db": -9.0
	},
	"archer": {
		"windup_sec": 0.26,
		"telegraph_color": Color(1.0, 0.86, 0.28, 1.0),
		"pulse_hz": 7.2,
		"pulse_strength": 0.16,
		"finish_window_sec": 0.08,
		"finish_mix": 0.38,
		"telegraph_sfx": "swing",
		"telegraph_sfx_volume_db": -11.0
	}
}
const PROJECTILE_COLLISION_LAYER_BIT = 3
const PROJECTILE_SPEED = 520.0
const PROJECTILE_DAMAGE = 14
const PROJECTILE_LIFETIME_SEC = 2.0
const PROJECTILE_MAX_RANGE = 720.0
const PROJECTILE_RADIUS = 6.0
const PROJECTILE_SPAWN_OFFSET = 20.0

static func get_combo_tier(combo_count: int) -> int:
	if combo_count >= COMBO_TIER_3_THRESHOLD:
		return 3
	if combo_count >= COMBO_TIER_2_THRESHOLD:
		return 2
	if combo_count >= COMBO_TIER_1_THRESHOLD:
		return 1
	return 0

static func get_combo_tier_damage_multiplier(combo_tier: int) -> float:
	return maxf(1.0, float(COMBO_TIER_DAMAGE_MULTIPLIERS.get(combo_tier, 1.0)))

static func get_combo_tier_stagger_force_multiplier(combo_tier: int) -> float:
	return maxf(1.0, float(COMBO_TIER_STAGGER_FORCE_MULTIPLIERS.get(combo_tier, 1.0)))

static func get_combo_tier_stagger_duration_multiplier(combo_tier: int) -> float:
	return maxf(1.0, float(COMBO_TIER_STAGGER_DURATION_MULTIPLIERS.get(combo_tier, 1.0)))

static func get_combo_tier_armor_break_level(combo_tier: int) -> int:
	return maxi(0, int(COMBO_TIER_ARMOR_BREAK_LEVELS.get(combo_tier, 0)))

static func get_enemy_combo_armor(type_name: String) -> int:
	return maxi(0, int(ENEMY_COMBO_ARMOR_BY_TYPE.get(type_name, 0)))

static func get_enemy_attack_readability_profile(type_name: String) -> Dictionary:
	var fallback_profile: Dictionary = ENEMY_ATTACK_READABILITY_BY_TYPE[ENEMY_ATTACK_READABILITY_FALLBACK_TYPE]
	var selected_profile: Variant = ENEMY_ATTACK_READABILITY_BY_TYPE.get(type_name, fallback_profile)
	if selected_profile is Dictionary:
		return (selected_profile as Dictionary).duplicate(true)
	return fallback_profile.duplicate(true)

static func get_enemy_attack_readability_windup(type_name: String) -> float:
	var profile: Dictionary = get_enemy_attack_readability_profile(type_name)
	return maxf(0.01, float(profile.get("windup_sec", ENEMY_ATTACK_WINDUP)))

static func get_enemy_attack_readability_color(type_name: String) -> Color:
	var profile: Dictionary = get_enemy_attack_readability_profile(type_name)
	var color_variant: Variant = profile.get("telegraph_color", ENEMY_ATTACK_TELEGRAPH_COLOR)
	if color_variant is Color:
		return color_variant as Color
	return ENEMY_ATTACK_TELEGRAPH_COLOR

static func get_enemy_attack_readability_pulse_hz(type_name: String) -> float:
	var profile: Dictionary = get_enemy_attack_readability_profile(type_name)
	return maxf(0.0, float(profile.get("pulse_hz", 0.0)))

static func get_enemy_attack_readability_pulse_strength(type_name: String) -> float:
	var profile: Dictionary = get_enemy_attack_readability_profile(type_name)
	return clampf(float(profile.get("pulse_strength", 0.0)), 0.0, 0.95)

static func get_enemy_attack_readability_finish_window(type_name: String) -> float:
	var profile: Dictionary = get_enemy_attack_readability_profile(type_name)
	return maxf(0.0, float(profile.get("finish_window_sec", 0.0)))

static func get_enemy_attack_readability_finish_mix(type_name: String) -> float:
	var profile: Dictionary = get_enemy_attack_readability_profile(type_name)
	return clampf(float(profile.get("finish_mix", 0.0)), 0.0, 1.0)

static func get_enemy_attack_readability_sfx_name(type_name: String) -> String:
	var profile: Dictionary = get_enemy_attack_readability_profile(type_name)
	return str(profile.get("telegraph_sfx", ENEMY_ATTACK_TELEGRAPH_SFX_NAME))

static func get_enemy_attack_readability_sfx_volume_db(type_name: String) -> float:
	var profile: Dictionary = get_enemy_attack_readability_profile(type_name)
	return clampf(float(profile.get("telegraph_sfx_volume_db", ENEMY_ATTACK_TELEGRAPH_SFX_VOLUME_DB)), -40.0, 6.0)

static func get_enemy_dialog_bark_lines(type_name: String, bark_kind: String) -> Array[String]:
	var lines: Array[String] = []

	var common_lines_variant: Variant = ENEMY_DIALOG_BARKS_COMMON.get(bark_kind, [])
	if common_lines_variant is Array:
		for bark_line in common_lines_variant:
			lines.append(str(bark_line))

	var type_barks_variant: Variant = ENEMY_DIALOG_BARKS_BY_TYPE.get(type_name, ENEMY_DIALOG_BARKS_BY_TYPE.get("grunt", {}))
	if type_barks_variant is Dictionary:
		var type_barks: Dictionary = type_barks_variant as Dictionary
		var typed_lines_variant: Variant = type_barks.get(bark_kind, [])
		if typed_lines_variant is Array:
			for bark_line in typed_lines_variant:
				lines.append(str(bark_line))

	return lines

# Combat scene constants
const UI_HEALTH_BAR_POS = Vector2(10, 10)
const UI_TIMER_POS = Vector2(10, 40)
const UI_COMBO_POS = Vector2(10, 70)
const UI_MINIMAP_POS = Vector2(700, 10)
const UI_MINIMAP_SIZE = Vector2(100, 100)
const HEALTH_BAR_SIZE = Vector2(300, 20)
const CAMERA_SHAKE_INTENSITY = 3.0
const CAMERA_SHAKE_DURATION = 0.15
const DEATH_SOUND_VOLUME = -5.0
const PLAYER_HEALTH_ENDURANCE_BONUS = 0

# Difficulty settings
const DIFFICULTY_SETTINGS = {
	"easy": {"count": 3, "time": 120.0},
	"normal": {"count": 4, "time": 90.0},
	"hard": {"count": 5, "time": 60.0},
	"extreme": {"count": 6, "time": 45.0}
}

const ENEMY_TYPE_WEIGHTS_BY_DIFFICULTY = {
	"easy": {"grunt": 0.75, "heavy": 0.15, "archer": 0.10},
	"normal": {"grunt": 0.55, "heavy": 0.25, "archer": 0.20},
	"hard": {"grunt": 0.40, "heavy": 0.30, "archer": 0.30},
	"extreme": {"grunt": 0.30, "heavy": 0.30, "archer": 0.40}
}

# Camera shake optimization
const SHAKE_UPDATE_RATE = 0.016  # ~60 FPS update rate

# Audio volumes
const AUDIO_VOLUME_SWING = -10.0
const AUDIO_VOLUME_HIT = -5.0
const AUDIO_VOLUME_DEATH = -5.0
const AUDIO_VOLUME_ENEMY_HIT = -8.0

# Visual effect durations
const EFFECT_DURATION_ATTACK_ARC = 0.2
const EFFECT_DURATION_HURT = 0.2
const EFFECT_DURATION_ENEMY_HURT = 0.1
const EFFECT_DURATION_SPECIAL = 5.0
const EFFECT_DURATION_BLOOD = 1.0

# Hit stop constants
const HIT_STOP_ENABLED = true
const HIT_STOP_ON_PLAYER_HIT = true
const HIT_STOP_ON_PLAYER_DAMAGED = false
const HIT_STOP_PLAYER_HIT_DURATION_SEC = 0.04
const HIT_STOP_PLAYER_DAMAGED_DURATION_SEC = 0.035
const HIT_STOP_MAX_DURATION_SEC = 0.10

# Particle system constants
const BLOOD_POOL_SIZE = 28
const BLOOD_PARTICLE_AMOUNT = 40
const BLOOD_PARTICLE_LIFETIME = 0.78
const BLOOD_PARTICLE_SPREAD = 72.0
const BLOOD_PARTICLE_VELOCITY_MIN = 170.0
const BLOOD_PARTICLE_VELOCITY_MAX = 430.0
const BLOOD_PARTICLE_GRAVITY = Vector2(0, 460.0)
const BLOOD_HIT_BURST_COUNT = 3
const BLOOD_HIT_INTENSITY = 1.75
const BLOOD_HIT_INTENSITY_PER_DAMAGE = 0.08
const BLOOD_DEATH_BURST_COUNT = 7
const BLOOD_DEATH_INTENSITY = 3.8
const BLOOD_BURST_OFFSET_RADIUS = 15.0
const BLOOD_BURST_DIRECTION_JITTER_DEG = 24.0
const IMPACT_PARTICLE_AMOUNT = 12
const IMPACT_PARTICLE_LIFETIME = 0.22
const IMPACT_PARTICLE_SPREAD = 55.0
const IMPACT_PARTICLE_VELOCITY_MIN = 110.0
const IMPACT_PARTICLE_VELOCITY_MAX = 220.0
const IMPACT_PARTICLE_GRAVITY = Vector2(0, 120)
const IMPACT_PARTICLE_COLOR = Color(1.0, 0.91, 0.45, 1.0)

# Combat balance constants
const AGILITY_SCALING_THRESHOLD = 10.0
const STRENGTH_SCALING_THRESHOLD = 10.0
const ENDURANCE_SCALING_THRESHOLD = 5
const DIFFICULTY_MULTIPLIER = 1.2

# Input thresholds
const INPUT_DEADZONE = 0.5
const MOUSE_DISTANCE_THRESHOLD = 1000.0
