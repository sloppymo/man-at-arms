---
description: Comprehensive prompt for AI assistance with Godot migration
---

# Godot Migration Prompt for AI Assistant

## Context

You are helping migrate the Man-at-Arms RPG from JavaScript/Phaser.js to Godot 4.x. This is a comprehensive 5-6 week migration project involving:

- **Current Tech Stack**: JavaScript, Phaser.js 3, Ink.js narrative, custom event system
- **Target Tech Stack**: Godot 4.x, GDScript, Godot signals, native physics
- **Project Size**: ~50 JavaScript modules, 1076-line combat system, 739-line overworld
- **Key Challenge**: Maintaining combat responsiveness while leveraging Godot's superior 2D features

## Current Codebase Analysis

### Core Architecture
- **Game Modes**: 215-line state machine with transition validation
- **Event System**: 182-line custom pub/sub dispatcher  
- **State Management**: 659-line gameState with migration system
- **Combat System**: 1076-line MeleeCombatScene with player controller, enemy AI, physics
- **Overworld**: 739-line hex-based exploration with hotspots

### Combat System Details
- **Player**: WASD + mouse controls, attack/dodge/special abilities, combo system
- **Enemies**: 3 types (grunt, heavy, archer) with different behaviors
- **Physics**: Phaser Arcade physics, collision detection
- **UI**: Health bars, timers, combo counters, minimap
- **Effects**: Blood splatter particles, attack animations

### Assets
- PNG sprites (32x32, ~163 bytes each)
- JSON particle configuration
- Minimal audio setup

## Migration Requirements

### Technical Requirements
1. **Performance Target**: 60 FPS in combat scenes
2. **Feature Parity**: All current mechanics must be preserved
3. **Platform Support**: Web, desktop, mobile export capability
4. **Code Quality**: Clean, maintainable GDScript with proper documentation

### Architectural Requirements
1. **Scene Structure**: Godot's scene tree hierarchy
2. **Event System**: Replace custom dispatcher with Godot signals
3. **State Management**: Autoload singletons for global state
4. **Input System**: Godot input actions and mapping
5. **Physics**: Godot's native 2D physics system

### Gameplay Requirements
1. **Combat Feel**: Maintain tight, responsive controls
2. **Enemy AI**: Preserve current enemy behaviors
3. **Visual Effects**: Recreate particle systems and animations
4. **Audio**: Implement proper sound effects and music
5. **UI**: Recreate all combat and overworld interfaces

## Implementation Strategy

### Phase-Based Approach
1. **Phase 1 (Week 1)**: Foundation - project setup, core systems
2. **Phase 2 (Week 2-3)**: Combat system implementation
3. **Phase 3 (Week 4-5)**: Overworld migration and integration
4. **Phase 4 (Week 6)**: Polish, optimization, testing

### Key Implementation Decisions
- **Full Migration**: Not hybrid - complete Godot conversion
- **Autoload Pattern**: Use Godot singletons for global state
- **Signal-Based Events**: Replace custom dispatcher
- **CharacterBody2D**: For player and enemy physics
- **GPUParticles2D**: For visual effects

## Specific Migration Tasks

### 1. Core Systems (Week 1)
```gdscript
# Create autoload scripts for:
- res://scripts/game_modes.gd
- res://scripts/game_state.gd  
- res://scripts/event_bus.gd
```

### 2. Combat Scene (Week 2-3)
```gdscript
# Create scene structure:
res://scenes/combat/
├── combat_scene.tscn
├── player.tscn
├── enemy_grunt.tscn
├── enemy_heavy.tscn
├── enemy_archer.tscn
└── combat_ui.tscn
```

### 3. Overworld Scene (Week 4-5)
```gdscript
# Create scene structure:
res://scenes/overworld/
├── overworld_scene.tscn
├── player_overworld.tscn
├── hotspot_system.tscn
└── overworld_ui.tscn
```

### 4. Asset Migration
```gdscript
# Import and organize:
res://assets/
├── sprites/
├── particles/
├── audio/
└── fonts/
```

## Code Examples for Reference

### Game Modes Autoload
```gdscript
# res://scripts/game_modes.gd
extends Node

enum GameMode {
    TITLE, CHARACTER_CREATION, DIALOGUE, CAMP, EQUIPMENT,
    ENCOUNTER, OVERWORLD, COMBAT, DEATH, ENDING, LOADING
}

var current_mode: GameMode = GameMode.TITLE
signal mode_changed(from: GameMode, to: GameMode)

func set_mode(new_mode: GameMode, force: bool = false) -> bool:
    # Implementation with transition validation
    pass
```

### Player Controller
```gdscript
# res://scripts/combat_player.gd
extends CharacterBody2D
class_name CombatPlayer

@export var speed: float = 200.0
@export var attack_damage: int = 25
@export var max_health: int = 100

var health: int = max_health
var is_attacking: bool = false
var attack_cooldown: float = 0.0

func _physics_process(delta: float) -> void:
    # Movement implementation
    pass

func _input(event: InputEvent) -> void:
    # Input handling
    pass
```

### Enemy AI
```gdscript
# res://scripts/combat_enemy.gd
extends CharacterBody2D
class_name CombatEnemy

enum EnemyType { GRUNT, HEAVY, ARCHER }

@export var enemy_type: EnemyType = EnemyType.GRUNT
@export var health: int = 75
@export var speed: float = 80.0

var player: CombatPlayer
var is_alive: bool = true

func _physics_process(delta: float) -> void:
    # AI behavior implementation
    pass
```

## Testing Requirements

### Unit Tests
- Game mode transitions
- State management operations
- Event system functionality
- Save/load operations

### Integration Tests
- Scene transitions
- Combat flow
- Overworld interactions
- Data persistence

### Performance Tests
- 60 FPS target in combat
- Scene transition times
- Memory usage monitoring
- Platform compatibility

## Risk Areas and Mitigation

### High Risk
1. **Combat Responsiveness**: Early prototyping, iterative tuning
2. **Performance**: Continuous profiling, optimization
3. **State Integrity**: Comprehensive testing

### Medium Risk  
1. **Visual Effects**: Custom particle systems if needed
2. **Audio Timing**: Godot audio bus system

### Low Risk
1. **Asset Import**: Straightforward conversion
2. **Basic UI**: Godot Control nodes

## Success Criteria

### Technical Success
- [ ] 60 FPS sustained performance
- [ ] All original mechanics preserved
- [ ] Clean, maintainable codebase
- [ ] Multi-platform export capability

### Quality Success
- [ ] Responsive controls and combat feel
- [ ] Stable performance
- [ ] No critical bugs
- [ ] Feature parity with original

## Development Guidelines

### Code Standards
- Use GDScript with strong typing
- Follow Godot naming conventions
- Document complex functions
- Use signals for decoupling
- Implement proper error handling

### Asset Guidelines
- Organize assets in logical folders
- Use Godot's import settings
- Optimize textures for performance
- Create particle systems in Godot

### Testing Guidelines
- Test each component individually
- Verify scene transitions work
- Check performance targets
- Validate save/load functionality

## Next Steps

1. **Review this prompt**: Ensure all requirements are understood
2. **Start Phase 1**: Begin with project initialization
3. **Follow the migration plan**: Use the structured approach
4. **Track progress**: Monitor daily completion against timeline
5. **Adjust as needed**: Modify approach based on discoveries

This prompt provides comprehensive guidance for migrating Man-at-Arms to Godot while maintaining the core gameplay experience and professional quality standards.
