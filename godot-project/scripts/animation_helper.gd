extends Node

# Helper class for creating animated sprites
class_name AnimationHelper

static func create_player_animation():
	var sprite_frames = SpriteFrames.new()
	
	# Add animations
	sprite_frames.add_animation("idle")
	sprite_frames.add_animation("walk")
	sprite_frames.add_animation("attack")
	sprite_frames.add_animation("dodge")
	
	# Set frame durations (in seconds)
	sprite_frames.set_animation_speed("idle", 8.0)  # 8 FPS
	sprite_frames.set_animation_speed("walk", 12.0) # 12 FPS
	sprite_frames.set_animation_speed("attack", 15.0) # 15 FPS
	sprite_frames.set_animation_speed("dodge", 10.0) # 10 FPS
	
	# Add frames (you'll need to load actual textures)
	# This is a template - replace with your actual sprite paths
	var idle_texture = load("res://assets/sprites/player_idle.png")
	var walk_texture = load("res://assets/sprites/player_walk.png")
	var attack_texture = load("res://assets/sprites/player_attack.png")
	var dodge_texture = load("res://assets/sprites/player_dodge.png")
	
	# Add single frames for each animation
	sprite_frames.add_frame("idle", idle_texture)
	sprite_frames.add_frame("walk", walk_texture)
	sprite_frames.add_frame("attack", attack_texture)
	sprite_frames.add_frame("dodge", dodge_texture)
	
	return sprite_frames

static func create_enemy_animation(enemy_type: String):
	var sprite_frames = SpriteFrames.new()
	
	match enemy_type:
		"grunt":
			sprite_frames.add_animation("idle")
			sprite_frames.add_animation("attack")
			sprite_frames.set_animation_speed("idle", 6.0)
			sprite_frames.set_animation_speed("attack", 10.0)
			
			var idle_texture = load("res://assets/sprites/enemy_grunt.png")
			sprite_frames.add_frame("idle", idle_texture)
			sprite_frames.add_frame("attack", idle_texture)
			
		"archer":
			sprite_frames.add_animation("idle")
			sprite_frames.add_animation("shoot")
			sprite_frames.set_animation_speed("idle", 6.0)
			sprite_frames.set_animation_speed("shoot", 12.0)
			
			var idle_texture = load("res://assets/sprites/enemy_archer.png")
			sprite_frames.add_frame("idle", idle_texture)
			sprite_frames.add_frame("shoot", idle_texture)
			
		"heavy":
			sprite_frames.add_animation("idle")
			sprite_frames.add_animation("attack")
			sprite_frames.set_animation_speed("idle", 4.0)
			sprite_frames.set_animation_speed("attack", 8.0)
			
			var idle_texture = load("res://assets/sprites/enemy_heavy.png")
			sprite_frames.add_frame("idle", idle_texture)
			sprite_frames.add_frame("attack", idle_texture)
	
	return sprite_frames
