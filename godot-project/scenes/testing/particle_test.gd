extends Control
class_name ParticleTest

@onready var test_button = $UI/VBoxContainer/TestButton
@onready var status_label = $UI/VBoxContainer/StatusLabel
@onready var particle_container = $ParticleContainer

func _ready() -> void:
	print("ParticleTest: Initializing particle test scene")
	test_button.pressed.connect(_on_test_button_pressed)
	status_label.text = "Particle system ready. Click test button to spawn effects."

func _on_test_button_pressed() -> void:
	print("ParticleTest: Testing particle effects...")
	status_label.text = "Testing particle effects..."
	
	# Test blood particles
	_test_blood_effect()
	await get_tree().create_timer(1.0).timeout
	
	# Test explosion effect
	_test_explosion_effect()
	await get_tree().create_timer(1.0).timeout
	
	# Test multiple effects
	_test_multiple_effects()
	
	status_label.text = "Particle test complete!"

func _test_blood_effect() -> void:
	status_label.text = "Testing blood effect..."
	var particle_manager = get_node_or_null("/root/ParticleManager")
	
	if particle_manager and particle_manager.has_method("play_blood_effect"):
		var pos = Vector2(400, 300) + Vector2(randf_range(-100, 100), randf_range(-50, 50))
		particle_manager.play_blood_effect(pos)
		print("ParticleTest: Blood effect at", pos)
	else:
		# Fallback: Create simple blood particles
		_create_simple_blood_particles(Vector2(400, 300))

func _test_explosion_effect() -> void:
	status_label.text = "Testing explosion effect..."
	# Create simple explosion particles
	_create_simple_explosion_particles(Vector2(400, 300))

func _test_multiple_effects() -> void:
	status_label.text = "Testing multiple effects..."
	for i in range(5):
		var pos = Vector2(300 + i * 50, 250 + randf_range(-50, 50))
		_create_simple_blood_particles(pos)
		await get_tree().create_timer(0.2).timeout

func _create_simple_blood_particles(position: Vector2) -> void:
	var particles = CPUParticles2D.new()
	particles.emitting = true
	particles.explosiveness = 1.0
	particles.amount = 20
	particles.lifetime = 1.0
	particles.direction = Vector2.UP
	particles.spread = 30.0
	particles.initial_velocity_min = 50.0
	particles.initial_velocity_max = 100.0
	particles.color = Color.RED
	particles.gravity = Vector2(0, 98)
	
	particle_container.add_child(particles)
	particles.global_position = position
	
	# Auto-remove
	await get_tree().create_timer(2.0).timeout
	particles.queue_free()

func _create_simple_explosion_particles(position: Vector2) -> void:
	var particles = CPUParticles2D.new()
	particles.emitting = true
	particles.explosiveness = 1.0
	particles.amount = 50
	particles.lifetime = 1.5
	particles.direction = Vector2.ZERO
	particles.spread = 180.0
	particles.initial_velocity_min = 100.0
	particles.initial_velocity_max = 300.0
	particles.color = Color.ORANGE
	particles.gravity = Vector2(0, 50)
	
	particle_container.add_child(particles)
	particles.global_position = position
	
	# Auto-remove
	await get_tree().create_timer(2.5).timeout
	particles.queue_free()

func _input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"):  # ESC
		_return_to_landing()

func _return_to_landing() -> void:
	print("ParticleTest: Returning to landing page...")
	var game_modes = get_node_or_null("/root/GameModes")
	if game_modes:
		game_modes.set_mode(GameModes.GameMode.TITLE)
