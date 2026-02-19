extends SceneTree

func _init():
	print("Testing audio system...")
	
	# Test AudioManager autoload
	var audio_manager = get_root().get_node("/root/AudioManager")
	if not audio_manager:
		print("AudioManager autoload not found, creating instance for testing...")
		# Load the AudioManager script and create instance
		var audio_manager_script = load("res://scripts/audio_manager.gd")
		audio_manager = audio_manager_script.new()
		get_root().add_child(audio_manager)
	
	# Wait for initialization (simulate)
	print("AudioManager initialized")
	
	# Test SFX pool size
	var sfx_pool_size = audio_manager.sfx_players.size()
	print("SFX pool size:", sfx_pool_size)
	if sfx_pool_size == 8:
		print("✓ SFX pool size is correct (8 players)")
	else:
		print("✗ SFX pool size incorrect - expected 8, got", sfx_pool_size)
	
	# Test music player exists
	if audio_manager.music_player:
		print("✓ Music player exists")
	else:
		print("✗ Music player is null")
	
	# Test audio buses
	var master_bus = AudioServer.get_bus_index("Master")
	var sfx_bus = AudioServer.get_bus_index("SFX")
	var music_bus = AudioServer.get_bus_index("Music")
	
	if master_bus != -1:
		print("✓ Master bus exists")
	else:
		print("✗ Master bus missing")
	
	if sfx_bus != -1:
		print("✓ SFX bus exists")
	else:
		print("✗ SFX bus missing")
		
	if music_bus != -1:
		print("✓ Music bus exists")
	else:
		print("✗ Music bus missing")
	
	# Test volume controls
	print("\nTesting volume controls...")
	var original_master = AudioServer.get_bus_volume_db(master_bus)
	var original_sfx = AudioServer.get_bus_volume_db(sfx_bus)
	var original_music = AudioServer.get_bus_volume_db(music_bus)
	
	audio_manager.set_master_volume(-10.0)
	audio_manager.set_sfx_volume(-5.0)
	audio_manager.set_music_volume(-15.0)
	
	var new_master = AudioServer.get_bus_volume_db(master_bus)
	var new_sfx = AudioServer.get_bus_volume_db(sfx_bus)
	var new_music = AudioServer.get_bus_volume_db(music_bus)
	
	if abs(new_master - (-10.0)) < 0.1:
		print("✓ Master volume control works")
	else:
		print("✗ Master volume control failed - expected -10.0, got", new_master)
	
	if abs(new_sfx - (-5.0)) < 0.1:
		print("✓ SFX volume control works")
	else:
		print("✗ SFX volume control failed - expected -5.0, got", new_sfx)
		
	if abs(new_music - (-15.0)) < 0.1:
		print("✓ Music volume control works")
	else:
		print("✗ Music volume control failed - expected -15.0, got", new_music)
	
	# Restore original volumes
	audio_manager.set_master_volume(original_master)
	audio_manager.set_sfx_volume(original_sfx)
	audio_manager.set_music_volume(original_music)
	
	# Test SFX playing with null stream (should handle gracefully)
	print("\nTesting SFX playback with null stream...")
	audio_manager.play_sfx(null, 0.0)  # Should not crash
	
	# Test SFX playing with non-existent file
	print("Testing SFX playback with missing file...")
	var dummy_stream = load("res://nonexistent.wav")
	audio_manager.play_sfx(dummy_stream, 0.0)  # Should handle null gracefully
	
	print("\n✅ Audio system test completed!")
	quit(0)
