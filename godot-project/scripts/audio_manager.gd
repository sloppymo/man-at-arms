extends Node

const RuntimeLog = preload("res://scripts/runtime_log.gd")

# Audio buses
const MASTER_BUS = "Master"
const SFX_BUS = "SFX"
const MUSIC_BUS = "Music"

# Audio file paths
const AUDIO_PATHS = {
	"swing": "res://assets/audio/swing.wav",
	"hit": "res://assets/audio/hit.wav",
	"death": "res://assets/audio/death.wav"
}

# Audio players
var sfx_players: Array[AudioStreamPlayer] = []
var sfx_pool_index: int = 0
var music_player: AudioStreamPlayer

# Audio cache for centralized loading
var _audio_cache: Dictionary = {}

# Pool configuration
const SFX_POOL_SIZE: int = 8

func _ready() -> void:
	# Initialize SFX player pool
	_initialize_sfx_pool()
	
	# Create music player
	music_player = AudioStreamPlayer.new()
	music_player.bus = MUSIC_BUS
	add_child(music_player)
	
	# Set up buses if not exist
	_setup_audio_buses()

func _initialize_sfx_pool() -> void:
	for i in range(SFX_POOL_SIZE):
		var player = AudioStreamPlayer.new()
		player.bus = SFX_BUS
		add_child(player)
		sfx_players.append(player)
		RuntimeLog.debug("AudioManager: Created SFX player %d in pool" % i)

func _setup_audio_buses() -> void:
	var buses = AudioServer.get_bus_count()
	
	# Ensure SFX bus exists
	if AudioServer.get_bus_index(SFX_BUS) == -1:
		AudioServer.add_bus()
		AudioServer.set_bus_name(buses, SFX_BUS)
		buses += 1
	
	# Ensure Music bus exists
	if AudioServer.get_bus_index(MUSIC_BUS) == -1:
		AudioServer.add_bus()
		AudioServer.set_bus_name(buses, MUSIC_BUS)

func play_sfx(stream: AudioStream, volume_db: float = 0.0) -> void:
	if not stream:
		push_error("AudioManager: Attempted to play null audio stream")
		return
	
	if sfx_players.is_empty():
		push_error("AudioManager: SFX pool not initialized")
		return
	
	# Get next available player from pool (round-robin)
	var player = sfx_players[sfx_pool_index]
	sfx_pool_index = (sfx_pool_index + 1) % SFX_POOL_SIZE
	
	# Configure and play sound
	player.stream = stream
	player.volume_db = volume_db
	player.play()
	
	# Debug logging for pool usage (can be conditionally compiled)
	if OS.is_debug_build():
		RuntimeLog.debug(
			"AudioManager: Playing SFX on pool player %d with volume %.2fdB"
			% [sfx_pool_index - 1, volume_db]
		)

func play_music(stream: AudioStream, volume_db: float = -10.0, loop: bool = true) -> void:
	if music_player and stream:
		music_player.stream = stream
		music_player.volume_db = volume_db
		music_player.play()
		if loop:
			music_player.finished.connect(func(): music_player.play())

func stop_music() -> void:
	if music_player:
		music_player.stop()

func set_master_volume(volume_db: float) -> void:
	AudioServer.set_bus_volume_db(AudioServer.get_bus_index(MASTER_BUS), volume_db)

func set_sfx_volume(volume_db: float) -> void:
	AudioServer.set_bus_volume_db(AudioServer.get_bus_index(SFX_BUS), volume_db)

func set_music_volume(volume_db: float) -> void:
	AudioServer.set_bus_volume_db(AudioServer.get_bus_index(MUSIC_BUS), volume_db)

# Centralized audio stream loading with caching
func get_sfx(name: String) -> AudioStream:
	if _audio_cache.has(name):
		return _audio_cache[name]
	
	if AUDIO_PATHS.has(name):
		var path = AUDIO_PATHS[name]
		if FileAccess.file_exists(path):
			var stream = load(path)
			_audio_cache[name] = stream
			return stream
		else:
			RuntimeLog.warn("AudioManager: Audio file not found: %s" % path)
	else:
		RuntimeLog.warn("AudioManager: Unknown audio name: %s" % name)
	
	return null
