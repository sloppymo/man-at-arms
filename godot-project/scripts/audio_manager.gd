extends Node
## AudioManager - Combat Audio System
## Day 6-7 Deliverable: All SFX bundled, normalized, anti-spam protected

const RuntimeLog = preload("res://scripts/runtime_log.gd")
const CombatConstants = preload("res://scripts/combat_constants.gd")

# Audio buses
const MASTER_BUS = "Master"
const SFX_BUS = "SFX"
const MUSIC_BUS = "Music"

# Audio file paths - ALL SFX for bundling
const AUDIO_PATHS = {
	"swing": "res://assets/audio/swing.wav",
	"hit": "res://assets/audio/hit.wav",
	"death": "res://assets/audio/death.wav",
	"block": "res://assets/audio/hit.wav",  # Placeholder - distinct block sound
	"projectile": "res://assets/audio/swing.wav",  # Placeholder - arrow/fire sound
	"shield_break": "res://assets/audio/hit.wav",  # Placeholder - shield break sound
	"perfect_block": "res://assets/audio/hit.wav"  # Placeholder - perfect block ding
}

# Preloaded streams - these get bundled in web export
const AUDIO_STREAMS := {
	"swing": preload("res://assets/audio/swing.wav"),
	"hit": preload("res://assets/audio/hit.wav"),
	"death": preload("res://assets/audio/death.wav")
}

# Runtime loaded streams (for placeholder fallbacks)
var _runtime_streams: Dictionary = {}

# Audio players
var sfx_players: Array[AudioStreamPlayer] = []
var sfx_pool_index: int = 0
var music_player: AudioStreamPlayer

# Audio cache for centralized loading
var _audio_cache: Dictionary = {}

# Anti-spam system
var _last_play_time_ms: Dictionary = {}
var _consecutive_play_count: Dictionary = {}

# Pool configuration
const SFX_POOL_SIZE: int = 12  # Increased for more concurrent sounds
const ENABLE_POOL_DEBUG_LOGS: bool = false

# Default anti-spam cooldowns per SFX type (ms)
const DEFAULT_SFX_COOLDOWN_MS: int = 50
const SFX_COOLDOWNS: Dictionary = {
	"swing": 80,      # Weapon swing - allow rapid but not frame-spam
	"hit": 30,        # Hit impact - can overlap slightly
	"death": 150,     # Death - distinct, don't overlap
	"block": 60,      # Shield block - moderate cooldown
	"projectile": 80, # Arrow/fire - distinct shots
	"shield_break": 200,  # Shield break - rare, important
	"perfect_block": 100   # Perfect block - distinct reward sound
}

# Max consecutive plays before forced cooldown
const MAX_CONSECUTIVE_PLAYS: int = 3
const CONSECUTIVE_PLAY_COOLDOWN_MS: int = 500

# Web export detection
var _is_web_export: bool = false

func _ready() -> void:
	# Detect web export
	_is_web_export = OS.get_name() == "Web"
	
	# Initialize SFX player pool
	_initialize_sfx_pool()
	
	# Create music player
	music_player = AudioStreamPlayer.new()
	music_player.bus = MUSIC_BUS
	add_child(music_player)
	
	# Set up buses if not exist
	_setup_audio_buses()
	
	# Load runtime streams (placeholder fallbacks)
	_load_runtime_streams()
	
	RuntimeLog.info("AudioManager: Initialized (web=%s)" % str(_is_web_export))

func _initialize_sfx_pool() -> void:
	for i in range(SFX_POOL_SIZE):
		var player = AudioStreamPlayer.new()
		player.bus = SFX_BUS
		add_child(player)
		sfx_players.append(player)
		if ENABLE_POOL_DEBUG_LOGS and OS.is_debug_build():
			RuntimeLog.debug("AudioManager: Created SFX player %d in pool" % i)

func _setup_audio_buses() -> void:
	var buses = AudioServer.get_bus_count()
	
	# Ensure SFX bus exists
	if AudioServer.get_bus_index(SFX_BUS) == -1:
		AudioServer.add_bus()
		AudioServer.set_bus_name(buses, SFX_BUS)
		AudioServer.set_bus_volume_db(buses, _get_combat_constant_float("AUDIO_VOLUME_SFX_BUS", 0.0))
		buses += 1
	
	# Ensure Music bus exists
	if AudioServer.get_bus_index(MUSIC_BUS) == -1:
		AudioServer.add_bus()
		AudioServer.set_bus_name(buses, MUSIC_BUS)
		AudioServer.set_bus_volume_db(buses, _get_combat_constant_float("AUDIO_VOLUME_MUSIC_BUS", -10.0))

func _get_combat_constant_float(constant_name: String, fallback: float) -> float:
	match constant_name:
		"AUDIO_VOLUME_SFX_BUS":
			return CombatConstants.AUDIO_VOLUME_SFX_BUS
		"AUDIO_VOLUME_MUSIC_BUS":
			return CombatConstants.AUDIO_VOLUME_MUSIC_BUS
		"AUDIO_VOLUME_BLOCK":
			return CombatConstants.AUDIO_VOLUME_BLOCK
		"AUDIO_VOLUME_PROJECTILE":
			return CombatConstants.AUDIO_VOLUME_PROJECTILE
		"AUDIO_VOLUME_PERFECT_BLOCK":
			return CombatConstants.AUDIO_VOLUME_PERFECT_BLOCK
		_:
			return fallback

func _load_runtime_streams() -> void:
	# Load placeholder fallbacks at runtime (don't fail if files don't exist yet)
	for name in ["block", "projectile", "shield_break", "perfect_block"]:
		if AUDIO_PATHS.has(name):
			var path: String = AUDIO_PATHS[name]
			if ResourceLoader.exists(path):
				var stream = load(path)
				if stream:
					_runtime_streams[name] = stream
					RuntimeLog.debug("AudioManager: Loaded runtime stream '%s' from '%s'" % [name, path])

## Play SFX with anti-spam protection and normalized levels
func play_sfx(stream: AudioStream, volume_db: float = 0.0, sfx_name: String = "") -> void:
	if not stream:
		RuntimeLog.warn("AudioManager: Ignoring null audio stream request")
		return
	
	if sfx_players.is_empty():
		push_error("AudioManager: SFX pool not initialized")
		return
	
	# Anti-spam check
	if sfx_name != "" and not _can_play_sfx(sfx_name):
		if ENABLE_POOL_DEBUG_LOGS and OS.is_debug_build():
			RuntimeLog.debug("AudioManager: Anti-spam blocked '%s'" % sfx_name)
		return
	
	# Normalize volume based on SFX type
	var normalized_volume := _normalize_volume(volume_db, sfx_name)
	
	# Get next available player from pool (round-robin)
	var player_index: int = sfx_pool_index
	var player = sfx_players[player_index]
	sfx_pool_index = (sfx_pool_index + 1) % SFX_POOL_SIZE
	
	# Stop current sound if playing (prevents muddy overlap)
	if player.playing:
		player.stop()
	
	# Configure and play sound
	player.stream = stream
	player.volume_db = normalized_volume
	player.play()
	
	# Track play for anti-spam
	if sfx_name != "":
		_track_sfx_play(sfx_name)
	
	# Optional verbose pool logging
	if ENABLE_POOL_DEBUG_LOGS and OS.is_debug_build():
		RuntimeLog.debug(
			"AudioManager: Playing SFX '%s' on pool player %d with volume %.2fdB"
			% [sfx_name, player_index, normalized_volume]
		)

## Get SFX by name with caching and fallback support
func get_sfx(name: String) -> AudioStream:
	# Check cache first
	if _audio_cache.has(name):
		return _audio_cache[name]
	
	# Check preloaded streams
	if AUDIO_STREAMS.has(name):
		var stream: AudioStream = AUDIO_STREAMS[name]
		if stream:
			_audio_cache[name] = stream
			return stream
		RuntimeLog.warn("AudioManager: Preloaded stream '%s' is null" % name)
	
	# Check runtime loaded streams (placeholders)
	if _runtime_streams.has(name):
		var runtime_stream: AudioStream = _runtime_streams[name]
		_audio_cache[name] = runtime_stream
		return runtime_stream
	
	# Fallback: try to load dynamically (web-safe if bundled)
	if AUDIO_PATHS.has(name):
		var path: String = AUDIO_PATHS[name]
		if ResourceLoader.exists(path):
			var loaded_stream = load(path)
			if loaded_stream:
				_audio_cache[name] = loaded_stream
				RuntimeLog.debug("AudioManager: Dynamically loaded '%s' from '%s'" % [name, path])
				return loaded_stream
		RuntimeLog.warn("AudioManager: Failed to load '%s' from '%s'" % [name, path])
	else:
		RuntimeLog.warn("AudioManager: Unknown audio name: '%s'" % name)
	
	return null

## Convenience method: get and play in one call
func play_sfx_by_name(name: String, volume_override_db: float = -999.0) -> void:
	var stream := get_sfx(name)
	if not stream:
		return
	
	var volume_db := volume_override_db
	if volume_override_db <= -999.0:
		# Use default volume for this SFX type
		volume_db = _get_default_volume_for_sfx(name)
	
	play_sfx(stream, volume_db, name)

## Check if SFX can play (anti-spam)
func _can_play_sfx(sfx_name: String) -> bool:
	var now := Time.get_ticks_msec()
	
	# Check individual cooldown
	if _last_play_time_ms.has(sfx_name):
		var last_time: int = int(_last_play_time_ms[sfx_name])
		var cooldown: int = int(SFX_COOLDOWNS.get(sfx_name, DEFAULT_SFX_COOLDOWN_MS))
		if now - last_time < cooldown:
			return false
	
	# Check consecutive play limit
	if _consecutive_play_count.has(sfx_name):
		var count: int = int(_consecutive_play_count[sfx_name])
		if count >= MAX_CONSECUTIVE_PLAYS:
			# Reset counter after cooldown
			var last_time: int = int(_last_play_time_ms.get(sfx_name, 0))
			if now - last_time < CONSECUTIVE_PLAY_COOLDOWN_MS:
				return false
			_consecutive_play_count[sfx_name] = 0
	
	return true

## Track SFX play for anti-spam
func _track_sfx_play(sfx_name: String) -> void:
	var now := Time.get_ticks_msec()
	_last_play_time_ms[sfx_name] = now
	
	if not _consecutive_play_count.has(sfx_name):
		_consecutive_play_count[sfx_name] = 0
	_consecutive_play_count[sfx_name] = int(_consecutive_play_count[sfx_name]) + 1

## Normalize volume based on SFX type
func _normalize_volume(requested_db: float, sfx_name: String) -> float:
	# If using default (0.0), apply type-specific normalization
	if requested_db == 0.0 and sfx_name != "":
		return _get_default_volume_for_sfx(sfx_name)
	
	# Otherwise apply the requested volume with clamping
	return clampf(requested_db, -40.0, 6.0)

## Get default normalized volume for SFX type
func _get_default_volume_for_sfx(sfx_name: String) -> float:
	match sfx_name:
		"swing":
			return CombatConstants.AUDIO_VOLUME_SWING
		"hit":
			return CombatConstants.AUDIO_VOLUME_HIT
		"death":
			return CombatConstants.AUDIO_VOLUME_DEATH
		"block", "shield_break":
			return _get_combat_constant_float("AUDIO_VOLUME_BLOCK", -8.0)
		"projectile":
			return _get_combat_constant_float("AUDIO_VOLUME_PROJECTILE", -10.0)
		"perfect_block":
			return _get_combat_constant_float("AUDIO_VOLUME_PERFECT_BLOCK", -5.0)
		_:
			return -10.0

## Music control
func play_music(stream: AudioStream, volume_db: float = -10.0, loop: bool = true) -> void:
	if music_player and stream:
		music_player.stream = stream
		music_player.volume_db = volume_db
		music_player.play()
		if loop:
			if not music_player.finished.is_connected(_on_music_finished):
				music_player.finished.connect(_on_music_finished)

func _on_music_finished() -> void:
	if music_player:
		music_player.play()

func stop_music() -> void:
	if music_player:
		music_player.stop()
		if music_player.finished.is_connected(_on_music_finished):
			music_player.finished.disconnect(_on_music_finished)

## Volume controls
func set_master_volume(volume_db: float) -> void:
	AudioServer.set_bus_volume_db(AudioServer.get_bus_index(MASTER_BUS), volume_db)

func set_sfx_volume(volume_db: float) -> void:
	AudioServer.set_bus_volume_db(AudioServer.get_bus_index(SFX_BUS), volume_db)

func set_music_volume(volume_db: float) -> void:
	AudioServer.set_bus_volume_db(AudioServer.get_bus_index(MUSIC_BUS), volume_db)

## Get current volume levels
func get_bus_volumes() -> Dictionary:
	return {
		"master": AudioServer.get_bus_volume_db(AudioServer.get_bus_index(MASTER_BUS)),
		"sfx": AudioServer.get_bus_volume_db(AudioServer.get_bus_index(SFX_BUS)),
		"music": AudioServer.get_bus_volume_db(AudioServer.get_bus_index(MUSIC_BUS))
	}

## Preload all SFX for web export (call during loading screen)
func preload_all_sfx() -> void:
	RuntimeLog.info("AudioManager: Preloading all SFX for web export...")
	
	var loaded_count := 0
	var failed_count := 0
	
	for name in AUDIO_PATHS.keys():
		var stream := get_sfx(name)
		if stream:
			loaded_count += 1
		else:
			failed_count += 1
			RuntimeLog.warn("AudioManager: Failed to preload SFX '%s'" % name)
	
	RuntimeLog.info("AudioManager: Preloaded %d SFX, %d failed" % [loaded_count, failed_count])

## Stop all SFX immediately
func stop_all_sfx() -> void:
	for player in sfx_players:
		if player.playing:
			player.stop()

## Reset anti-spam counters (e.g., on scene change)
func reset_anti_spam() -> void:
	_last_play_time_ms.clear()
	_consecutive_play_count.clear()
	RuntimeLog.debug("AudioManager: Anti-spam counters reset")

## Check if running in web export
func is_web_export() -> bool:
	return _is_web_export

## Get audio diagnostics
func get_diagnostics() -> Dictionary:
	return {
		"is_web_export": _is_web_export,
		"pool_size": SFX_POOL_SIZE,
		"cached_sfx": _audio_cache.keys(),
		"bus_volumes": get_bus_volumes(),
		"anti_spam_tracking": _last_play_time_ms.keys().size()
	}
