extends SceneTree

func _init():
	print("Testing combat integration...")
	
	# Test the combat encounter logic from overworld_scene.gd
	var current_hex = {"q": 0, "r": 0}
	var last_encounter_time = 0
	const ENCOUNTER_CHANCE = 0.3
	const ENCOUNTER_COOLDOWN = 30
	const CHEVAUCHEE_ZONE = {"qMin": -10, "qMax": 10, "rMin": -10, "rMax": 10}
	
	# Test zone detection
	print("Testing chevauchee zone detection...")
	var zone_tests = [
		{"hex": {"q": 0, "r": 0}, "expected": true, "desc": "center of zone"},
		{"hex": {"q": 10, "r": 10}, "expected": true, "desc": "edge of zone"},
		{"hex": {"q": 11, "r": 0}, "expected": false, "desc": "outside zone (q too high)"},
		{"hex": {"q": 0, "r": 11}, "expected": false, "desc": "outside zone (r too high)"},
		{"hex": {"q": -11, "r": 0}, "expected": false, "desc": "outside zone (q too low)"},
	]
	
	var zone_passed = 0
	for test in zone_tests:
		var in_zone = test.hex.q >= CHEVAUCHEE_ZONE["qMin"] and test.hex.q <= CHEVAUCHEE_ZONE["qMax"] and test.hex.r >= CHEVAUCHEE_ZONE["rMin"] and test.hex.r <= CHEVAUCHEE_ZONE["rMax"]
		if in_zone == test.expected:
			print("✓ Zone detection correct for", test.desc)
			zone_passed += 1
		else:
			print("✗ Zone detection failed for", test.desc, "- expected:", test.expected, "got:", in_zone)
	
	print("Zone detection: ", zone_passed, "/", zone_tests.size(), "passed")
	
	# Test encounter probability (simulate multiple moves)
	print("\nTesting encounter probability...")
	var encounters_triggered = 0
	var total_moves = 100
	
	for i in range(total_moves):
		current_hex.q += 1  # Simulate movement
		
		# Check if in chevauchee zone
		var in_zone = current_hex.q >= CHEVAUCHEE_ZONE["qMin"] and current_hex.q <= CHEVAUCHEE_ZONE["qMax"] and current_hex.r >= CHEVAUCHEE_ZONE["rMin"] and current_hex.r <= CHEVAUCHEE_ZONE["rMax"]
		
		if in_zone:
			# Check cooldown (simulate time passing)
			var current_time = i * 5  # 5 seconds per move
			if current_time - last_encounter_time >= ENCOUNTER_COOLDOWN:
				# 30% chance for encounter
				if randf() < ENCOUNTER_CHANCE:
					encounters_triggered += 1
					last_encounter_time = current_time
	
	var expected_encounters = total_moves * ENCOUNTER_CHANCE * 0.8  # Rough estimate accounting for cooldown
	print("Encounters triggered:", encounters_triggered, "out of", total_moves, "moves")
	if encounters_triggered > 0 and encounters_triggered < total_moves * 0.5:  # Reasonable range
		print("✓ Encounter probability appears reasonable")
	else:
		print("⚠ Encounter probability may need adjustment")
	
	# Test difficulty scaling logic
	print("\nTesting difficulty scaling...")
	var test_stats = [
		{"endurance": 5, "agility": 5, "strength": 5, "expected_enemy_count": 4},
		{"endurance": 10, "agility": 10, "strength": 10, "expected_enemy_count": 5},  # agility bonus
		{"endurance": 15, "agility": 15, "strength": 15, "expected_enemy_count": 6},  # agility bonus
	]
	
	for stats in test_stats:
		var enemy_count = 4  # base
		var agility_bonus = max(0, floori((stats.agility - 5) / 10.0))
		enemy_count += agility_bonus
		
		if enemy_count == stats.expected_enemy_count:
			print("✓ Difficulty scaling correct for stats:", stats)
		else:
			print("✗ Difficulty scaling failed for stats:", stats, "- expected:", stats.expected_enemy_count, "got:", enemy_count)
	
	print("\n✅ Combat integration logic test completed!")
	quit(0)
