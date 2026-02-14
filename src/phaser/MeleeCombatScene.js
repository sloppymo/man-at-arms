// ============================================
// Melee Combat Scene
// Fast-paced top-down melee combat inspired by Hotline Miami
// Integrated into the Man-at-Arms RPG framework
// ============================================

import { Scene, Math as PhaserMath, Input } from 'phaser';

/**
 * MeleeCombatScene - Top-down melee combat minigame
 * Replaces old bullet-hell system with intense sword fighting
 */
export class MeleeCombatScene extends Scene {
    constructor() {
        super({ key: 'MeleeCombatScene' });

        // Core dependencies (set from init data)
        this.dispatch = null;
        this.gameState = null;
        this.onComplete = null;
        this.difficulty = 'normal';
        this.equippedWeapon = null;

        // Scene state
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.particles = null;
        this.mainCamera = null;

        // Game mechanics
        this.playerHealth = 100;
        this.playerMaxHealth = 100;
        this.comboCounter = 0;
        this.specialCooldown = 0;
        this.specialMaxCooldown = 5000; // 5 seconds
        this.dodgeCooldown = 0;
        this.dodgeMaxCooldown = 2000; // 2 seconds

        // Combat state
        this.enemiesKilled = 0;
        this.totalEnemies = 0;
        this.waveNumber = 1;
        this.timeRemaining = 90000; // 90 seconds default
        this.isGameOver = false;
        this.isVictory = false;

        // Input state
        this.cursors = null;
        this.mousePointer = null;
        this.keys = null;

        // UI elements
        this.healthBar = null;
        this.timerText = null;
        this.comboText = null;
        this.minimap = null;

        // Audio
        this.swingSound = null;
        this.hitSound = null;
        this.deathSound = null;
        this.gruntSound = null;
        this.combatMusic = null;

        // Performance tracking
        this.lastTime = 0;
        this.frameCount = 0;
        this.fps = 0;
    }

    /**
     * Initialize scene with data from encounter system
     */
    init(data) {
        console.log('MeleeCombatScene: Initializing with data:', data);

        if (data) {
            this.dispatch = data.dispatch;
            this.gameState = data.gameState;
            this.onComplete = data.onComplete;
            this.difficulty = data.difficulty || 'normal';
            this.equippedWeapon = data.weapon || this.gameState.equipment.weapon.main;

            // Scale difficulty based on stats
            this.scaleDifficultyFromStats();
        }

        // Set up scene properties based on difficulty
        this.setupDifficultySettings();

        // Dispatch combat start event
        if (this.dispatch) {
            this.dispatch({
                type: 'COMBAT_START',
                payload: {
                    type: 'melee',
                    difficulty: this.difficulty,
                    weapon: this.equippedWeapon
                }
            });
        }
    }

    /**
     * Scale difficulty based on player stats
     */
    scaleDifficultyFromStats() {
        if (!this.gameState || !this.gameState.stats) return;

        const { strength, agility, endurance } = this.gameState.stats;

        // Agility affects enemy count (+1 enemy per 10 agility above 5)
        const agilityBonus = Math.max(0, Math.floor((agility - 5) / 10));
        this.enemyCountModifier = 1 + agilityBonus;

        // Strength affects enemy toughness (+20% health/damage per 10 strength above 5)
        const strengthBonus = Math.max(0, Math.floor((strength - 5) / 10));
        this.enemyToughnessModifier = 1 + (strengthBonus * 0.2);

        // Endurance affects player health (+10 health per point above 5)
        const enduranceBonus = Math.max(0, endurance - 5);
        this.playerMaxHealth += enduranceBonus * 10;
        this.playerHealth = this.playerMaxHealth;

        console.log(`MeleeCombatScene: Stats scaling - Enemies: ${this.enemyCountModifier}x count, ${this.enemyToughnessModifier}x toughness, Player health: ${this.playerMaxHealth}`);
    }

    /**
     * Set up difficulty-specific settings
     */
    setupDifficultySettings() {
        const settings = {
            easy: {
                enemyCount: 3,
                enemyHealth: 50,
                enemySpeed: 60,
                timeLimit: 120000, // 2 minutes
                playerDamage: 25,
                enemyDamage: 10
            },
            normal: {
                enemyCount: 4,
                enemyHealth: 75,
                enemySpeed: 80,
                timeLimit: 90000, // 1.5 minutes
                playerDamage: 35,
                enemyDamage: 15
            },
            hard: {
                enemyCount: 5,
                enemyHealth: 100,
                enemySpeed: 100,
                timeLimit: 60000, // 1 minute
                playerDamage: 45,
                enemyDamage: 20
            },
            extreme: {
                enemyCount: 6,
                enemyHealth: 125,
                enemySpeed: 120,
                timeLimit: 45000, // 45 seconds
                playerDamage: 55,
                enemyDamage: 25
            }
        };

        const baseSettings = settings[this.difficulty] || settings.normal;
        this.enemyCount = Math.floor(baseSettings.enemyCount * this.enemyCountModifier);
        this.enemyHealth = Math.floor(baseSettings.enemyHealth * this.enemyToughnessModifier);
        this.enemySpeed = baseSettings.enemySpeed;
        this.timeRemaining = baseSettings.timeLimit;
        this.playerDamage = baseSettings.playerDamage;
        this.enemyDamage = baseSettings.enemyDamage;

        console.log(`MeleeCombatScene: ${this.difficulty} difficulty - ${this.enemyCount} enemies, ${this.enemyHealth} health each, ${this.timeRemaining/1000}s time limit`);
    }

    /**
     * Preload assets
     */
    preload() {
        console.log('MeleeCombatScene: Preloading assets...');

        // Player sprites
        this.load.image('player_idle', '/assets/player_idle.png');
        this.load.image('player_walk', '/assets/player_walk.png');
        this.load.image('player_attack', '/assets/player_attack.png');
        this.load.image('player_dodge', '/assets/player_dodge.png');

        // Enemy sprites
        this.load.image('enemy_grunt', '/assets/enemy_grunt.png');
        this.load.image('enemy_heavy', '/assets/enemy_heavy.png');
        this.load.image('enemy_archer', '/assets/enemy_archer.png');

        // Weapons
        this.load.image('sword', '/assets/sword.png');
        this.load.image('axe', '/assets/axe.png');
        this.load.image('mace', '/assets/mace.png');

        // Effects
        this.load.image('blood_particle', '/assets/blood_particle.png');
        this.load.image('weapon_trail', '/assets/weapon_trail.png');

        // Audio
        this.load.audio('swing', '/assets/audio/swing.wav');
        this.load.audio('hit', '/assets/audio/hit.wav');
        this.load.audio('death', '/assets/audio/death.wav');
        this.load.audio('grunt', '/assets/audio/grunt.wav');
        this.load.audio('combat_music', '/assets/audio/combat_music.mp3');

        // Particle config
        this.load.json('blood_particles', '/assets/particles/blood_splatter.json');
    }

    /**
     * Create game objects and setup
     */
    create() {
        console.log('MeleeCombatScene: Creating scene...');

        // Set up world bounds (larger than camera for proper movement)
        this.physics.world.setBounds(0, 0, 1600, 1200);

        // Set up camera
        this.cameras.main.setBounds(0, 0, 1600, 1200);
        this.cameras.main.setZoom(1);

        // Create background (simple colored rectangle for now)
        const background = this.add.rectangle(800, 600, 1600, 1200, 0x2c3e50);
        background.setScrollFactor(0);

        // Create player
        this.createPlayer();

        // Create enemies
        this.createEnemies();

        // Set up input
        this.setupInput();

        // Create particles
        this.setupParticles();

        // Create UI
        this.createUI();

        // Create audio
        this.setupAudio();

        // Start combat music
        if (this.combatMusic) {
            this.combatMusic.play({ loop: true, volume: 0.5 });
        }

        console.log('MeleeCombatScene: Scene created successfully');
    }

    /**
     * Create player character
     */
    createPlayer() {
        // Create player sprite at center
        this.player = this.physics.add.sprite(800, 600, 'player_idle');
        this.player.setCollideWorldBounds(true);
        this.player.setDrag(800, 800); // Friction for smooth movement

        // Player stats
        this.player.speed = 160;
        this.player.attackRange = 60;
        this.player.attackArc = Math.PI / 2; // 90 degrees
        this.player.isAttacking = false;
        this.player.attackCooldown = 0;
        this.player.isDodging = false;
        this.player.dodgeTimer = 0;
        this.player.invincible = false;
        this.player.invincibleTimer = 0;

        // Set camera to follow player
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    }

    /**
     * Create enemy waves
     */
    createEnemies() {
        this.enemies = [];
        this.totalEnemies = this.enemyCount;

        // Create enemy group
        this.enemyGroup = this.physics.add.group();

        for (let i = 0; i < this.enemyCount; i++) {
            this.spawnEnemy();
        }

        console.log(`MeleeCombatScene: Created ${this.enemyCount} enemies`);
    }

    /**
     * Spawn a single enemy
     */
    spawnEnemy() {
        const spawnPoints = [
            { x: 200, y: 200 },
            { x: 1400, y: 200 },
            { x: 200, y: 1000 },
            { x: 1400, y: 1000 },
            { x: 400, y: 600 },
            { x: 1200, y: 600 }
        ];

        const spawnPoint = PhaserMath.RND.pick(spawnPoints);

        // Random enemy type (weighted towards grunts)
        const enemyTypes = ['grunt', 'grunt', 'grunt', 'heavy', 'archer'];
        const enemyType = PhaserMath.RND.pick(enemyTypes);

        const enemy = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, `enemy_${enemyType}`);
        enemy.enemyType = enemyType;
        enemy.health = this.enemyHealth;
        enemy.maxHealth = this.enemyHealth;
        enemy.speed = this.enemySpeed;
        enemy.damage = this.enemyDamage;
        enemy.isAlive = true;
        enemy.lastAttack = 0;
        enemy.attackCooldown = 1000; // 1 second between attacks

        // Type-specific adjustments
        if (enemyType === 'heavy') {
            enemy.health *= 1.5;
            enemy.maxHealth = enemy.health;
            enemy.speed *= 0.7;
            enemy.damage *= 1.2;
        } else if (enemyType === 'archer') {
            enemy.speed *= 0.9;
            enemy.range = 200;
        }

        this.enemies.push(enemy);
        this.enemyGroup.add(enemy);
    }

    /**
     * Set up input handlers
     */
    setupInput() {
        // Keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            W: Input.Keyboard.KeyCodes.W,
            A: Input.Keyboard.KeyCodes.A,
            S: Input.Keyboard.KeyCodes.S,
            D: Input.Keyboard.KeyCodes.D,
            SPACE: Input.Keyboard.KeyCodes.SPACE
        });

        // Mouse input
        this.mousePointer = this.input.activePointer;

        // Mouse click handlers
        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.handleAttack();
            } else if (pointer.rightButtonDown()) {
                this.handleDodge();
            }
        });
    }

    /**
     * Set up particle effects
     */
    setupParticles() {
        // Blood particle emitter
        this.bloodEmitter = this.add.particles(0, 0, 'blood_particle', {
            speed: { min: 50, max: 200 },
            scale: { start: 0.5, end: 0 },
            lifespan: 1000,
            gravityY: 200,
            quantity: 5,
            emitZone: {
                type: 'edge',
                source: new Phaser.Geom.Circle(0, 0, 10),
                quantity: 20
            }
        });
        this.bloodEmitter.stop();
    }

    /**
     * Create UI elements
     */
    createUI() {
        // Health bar (fixed to camera)
        this.healthBar = this.add.graphics();
        this.healthBar.setScrollFactor(0);
        this.updateHealthBar();

        // Timer text
        this.timerText = this.add.text(10, 40, 'Time: 90', {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.timerText.setScrollFactor(0);

        // Combo counter
        this.comboText = this.add.text(10, 70, 'Combo: 0', {
            fontSize: '20px',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.comboText.setScrollFactor(0);

        // Minimap (simple representation)
        this.minimap = this.add.graphics();
        this.minimap.setScrollFactor(0);
        this.minimap.fillStyle(0x000000, 0.5);
        this.minimap.fillRect(700, 10, 100, 100);
        this.minimap.lineStyle(2, 0xffffff);
        this.minimap.strokeRect(700, 10, 100, 100);
    }

    /**
     * Set up audio
     */
    setupAudio() {
        if (this.sound.get('swing')) {
            this.swingSound = this.sound.get('swing');
        }
        if (this.sound.get('hit')) {
            this.hitSound = this.sound.get('hit');
        }
        if (this.sound.get('death')) {
            this.deathSound = this.sound.get('death');
        }
        if (this.sound.get('grunt')) {
            this.gruntSound = this.sound.get('grunt');
        }
        if (this.sound.get('combat_music')) {
            this.combatMusic = this.sound.get('combat_music');
        }
    }

    /**
     * Main update loop
     */
    update(time, delta) {
        if (this.isGameOver) return;

        // Update FPS counter
        this.frameCount++;
        if (time - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = time;
        }

        // Update player
        this.updatePlayer(delta);

        // Update enemies
        this.updateEnemies(delta);

        // Update timers
        this.updateTimers(delta);

        // Update UI
        this.updateUI();

        // Check win/lose conditions
        this.checkGameEnd();
    }

    /**
     * Update player state
     */
    updatePlayer(delta) {
        if (!this.player || this.player.isDodging) return;

        // Movement
        const moveX = (this.keys.D.isDown || this.cursors.right.isDown ? 1 : 0) -
                     (this.keys.A.isDown || this.cursors.left.isDown ? 1 : 0);
        const moveY = (this.keys.S.isDown || this.cursors.down.isDown ? 1 : 0) -
                     (this.keys.W.isDown || this.cursors.up.isDown ? 1 : 0);

        if (moveX !== 0 || moveY !== 0) {
            const angle = Math.atan2(moveY, moveX);
            this.player.setVelocity(
                Math.cos(angle) * this.player.speed,
                Math.sin(angle) * this.player.speed
            );

            // Update sprite based on movement (simple animation)
            this.player.setTexture('player_walk');
        } else {
            this.player.setVelocity(0, 0);
            this.player.setTexture('player_idle');
        }

        // Update attack cooldown
        if (this.player.attackCooldown > 0) {
            this.player.attackCooldown -= delta;
        }

        // Update dodge
        if (this.player.isDodging) {
            this.player.dodgeTimer -= delta;
            if (this.player.dodgeTimer <= 0) {
                this.player.isDodging = false;
                this.player.invincible = false;
                this.player.setTexture('player_idle');
            }
        }

        // Update invincibility
        if (this.player.invincible) {
            this.player.invincibleTimer -= delta;
            if (this.player.invincibleTimer <= 0) {
                this.player.invincible = false;
            }
        }

        // Special ability cooldown
        if (this.specialCooldown > 0) {
            this.specialCooldown -= delta;
        }
    }

    /**
     * Handle player attack
     */
    handleAttack() {
        if (this.player.isAttacking || this.player.attackCooldown > 0 || this.player.isDodging) return;

        this.player.isAttacking = true;
        this.player.attackCooldown = 500; // 0.5 second cooldown

        // Calculate attack direction from player to mouse
        const angle = PhaserMath.Angle.Between(
            this.player.x, this.player.y,
            this.mousePointer.worldX, this.mousePointer.worldY
        );

        // Play swing sound
        if (this.swingSound) {
            this.swingSound.play({ volume: 0.3 });
        }

        // Check for hits
        let hitCount = 0;
        this.enemies.forEach(enemy => {
            if (!enemy.isAlive) return;

            const distance = PhaserMath.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );

            if (distance <= this.player.attackRange) {
                const enemyAngle = PhaserMath.Angle.Between(
                    this.player.x, this.player.y,
                    enemy.x, enemy.y
                );

                // Check if enemy is within attack arc
                const angleDiff = Math.abs(PhaserMath.Angle.ShortestBetween(angle, enemyAngle));
                if (angleDiff <= this.player.attackArc / 2) {
                    this.damageEnemy(enemy, this.playerDamage);
                    hitCount++;

                    // Screen shake on hit
                    this.cameras.main.shake(100, 0.005);
                }
            }
        });

        // Update combo
        if (hitCount > 0) {
            this.comboCounter += hitCount;
            // Combo bonus: every 3 hits increases damage
            if (this.comboCounter % 3 === 0) {
                this.playerDamage = Math.floor(this.playerDamage * 1.1);
            }
        } else {
            this.comboCounter = 0;
            this.playerDamage = this.getBasePlayerDamage();
        }

        // Reset attack state after animation time
        this.time.delayedCall(200, () => {
            this.player.isAttacking = false;
        });
    }

    /**
     * Handle player dodge
     */
    handleDodge() {
        if (this.player.isDodging || this.dodgeCooldown > 0) return;

        this.player.isDodging = true;
        this.player.invincible = true;
        this.player.invincibleTimer = 300; // 0.3 seconds invincibility
        this.player.dodgeTimer = 300;
        this.dodgeCooldown = this.dodgeMaxCooldown;

        // Calculate dodge direction
        const moveX = (this.keys.D.isDown || this.cursors.right.isDown ? 1 : 0) -
                     (this.keys.A.isDown || this.cursors.left.isDown ? 1 : 0);
        const moveY = (this.keys.S.isDown || this.cursors.down.isDown ? 1 : 0) -
                     (this.keys.W.isDown || this.cursors.up.isDown ? 1 : 0);

        let angle = 0;
        if (moveX !== 0 || moveY !== 0) {
            angle = Math.atan2(moveY, moveX);
        } else {
            // Dodge backward if no movement input
            angle = this.player.body.velocity.angle() + Math.PI;
        }

        // Dodge dash
        const dodgeSpeed = 400;
        const dodgeDistance = 100;
        const dodgeTime = dodgeDistance / dodgeSpeed * 1000;

        this.player.setVelocity(
            Math.cos(angle) * dodgeSpeed,
            Math.sin(angle) * dodgeSpeed
        );

        // Stop after dash distance
        this.time.delayedCall(dodgeTime, () => {
            this.player.setVelocity(0, 0);
        });

        this.player.setTexture('player_dodge');
    }

    /**
     * Handle special ability
     */
    handleSpecialAbility() {
        if (this.specialCooldown > 0) return;

        // Berserk mode: temporary speed and damage boost
        this.specialCooldown = this.specialMaxCooldown;
        this.player.speed *= 1.5;
        this.playerDamage = Math.floor(this.playerDamage * 1.5);

        // Visual effect (red tint)
        this.player.setTint(0xff0000);

        // Reset after 5 seconds
        this.time.delayedCall(5000, () => {
            this.player.speed = 160;
            this.playerDamage = this.getBasePlayerDamage();
            this.player.clearTint();
        });
    }

    /**
     * Get base player damage (resets combo bonuses)
     */
    getBasePlayerDamage() {
        const baseDamage = 35; // Base for normal difficulty
        const difficultyMultiplier = { easy: 0.7, normal: 1.0, hard: 1.3, extreme: 1.6 };
        return Math.floor(baseDamage * (difficultyMultiplier[this.difficulty] || 1.0));
    }

    /**
     * Update enemy AI
     */
    updateEnemies(delta) {
        this.enemies.forEach(enemy => {
            if (!enemy.isAlive) return;

            // Simple AI: move towards player
            const distance = PhaserMath.Distance.Between(
                enemy.x, enemy.y,
                this.player.x, this.player.y
            );

            if (distance > 50) { // Don't get too close
                const angle = PhaserMath.Angle.Between(
                    enemy.x, enemy.y,
                    this.player.x, this.player.y
                );

                enemy.setVelocity(
                    Math.cos(angle) * enemy.speed,
                    Math.sin(angle) * enemy.speed
                );
            } else {
                enemy.setVelocity(0, 0);

                // Attack if in range and cooldown ready
                if (this.time.now - enemy.lastAttack > enemy.attackCooldown) {
                    this.enemyAttack(enemy);
                    enemy.lastAttack = this.time.now;
                }
            }
        });
    }

    /**
     * Enemy attack logic
     */
    enemyAttack(enemy) {
        // Only attack if player is not invincible
        if (this.player.invincible) return;

        this.playerHealth -= enemy.damage;

        // Knockback
        const angle = PhaserMath.Angle.Between(
            enemy.x, enemy.y,
            this.player.x, this.player.y
        );

        this.player.setVelocity(
            Math.cos(angle) * 200,
            Math.sin(angle) * 200
        );

        // Hurt effect
        this.player.setTint(0xff0000);
        this.time.delayedCall(200, () => {
            this.player.clearTint();
        });

        // Play hit sound
        if (this.hitSound) {
            this.hitSound.play({ volume: 0.5 });
        }

        // Update health bar
        this.updateHealthBar();
    }

    /**
     * Damage enemy
     */
    damageEnemy(enemy, damage) {
        enemy.health -= damage;

        // Blood effect
        this.bloodEmitter.setPosition(enemy.x, enemy.y);
        this.bloodEmitter.explode(10);

        if (enemy.health <= 0) {
            this.killEnemy(enemy);
        } else {
            // Hurt effect
            enemy.setTint(0xff0000);
            this.time.delayedCall(100, () => {
                enemy.clearTint();
            });
        }

        // Play hit sound
        if (this.hitSound) {
            this.hitSound.play({ volume: 0.4 });
        }
    }

    /**
     * Kill enemy
     */
    killEnemy(enemy) {
        enemy.isAlive = false;
        enemy.setVelocity(0, 0);
        enemy.setVisible(false);
        this.enemiesKilled++;

        // More blood on death
        this.bloodEmitter.setPosition(enemy.x, enemy.y);
        this.bloodEmitter.explode(20);

        // Screen shake
        this.cameras.main.shake(200, 0.01);

        // Play death sound
        if (this.deathSound) {
            this.deathSound.play({ volume: 0.6 });
        }

        // Slow motion effect briefly
        this.time.timeScale = 0.5;
        this.time.delayedCall(100, () => {
            this.time.timeScale = 1.0;
        });

        console.log(`Enemy killed! ${this.enemiesKilled}/${this.totalEnemies} defeated`);
    }

    /**
     * Update timers and cooldowns
     */
    updateTimers(delta) {
        this.timeRemaining -= delta;

        // Dodge cooldown
        if (this.dodgeCooldown > 0) {
            this.dodgeCooldown -= delta;
        }
    }

    /**
     * Update UI elements
     */
    updateUI() {
        // Health bar
        this.updateHealthBar();

        // Timer
        const seconds = Math.ceil(this.timeRemaining / 1000);
        this.timerText.setText(`Time: ${seconds}`);

        // Combo
        this.comboText.setText(`Combo: ${this.comboCounter}`);

        // Minimap
        this.updateMinimap();
    }

    /**
     * Update health bar
     */
    updateHealthBar() {
        if (!this.healthBar) return;

        this.healthBar.clear();

        // Background
        this.healthBar.fillStyle(0x000000);
        this.healthBar.fillRect(10, 10, 304, 24);

        // Health fill
        const healthPercent = this.playerHealth / this.playerMaxHealth;
        const color = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffff00 : 0xff0000;
        this.healthBar.fillStyle(color);
        this.healthBar.fillRect(12, 12, 300 * healthPercent, 20);

        // Border
        this.healthBar.lineStyle(2, 0xffffff);
        this.healthBar.strokeRect(10, 10, 304, 24);
    }

    /**
     * Update minimap
     */
    updateMinimap() {
        if (!this.minimap) return;

        this.minimap.clear();
        this.minimap.fillStyle(0x000000, 0.5);
        this.minimap.fillRect(700, 10, 100, 100);
        this.minimap.lineStyle(2, 0xffffff);
        this.minimap.strokeRect(700, 10, 100, 100);

        // Player position (scaled to minimap)
        const playerX = 700 + (this.player.x / 1600) * 100;
        const playerY = 10 + (this.player.y / 1200) * 100;
        this.minimap.fillStyle(0x00ff00);
        this.minimap.fillRect(playerX - 2, playerY - 2, 4, 4);

        // Enemy positions
        this.enemies.forEach(enemy => {
            if (!enemy.isAlive) return;
            const enemyX = 700 + (enemy.x / 1600) * 100;
            const enemyY = 10 + (enemy.y / 1200) * 100;
            this.minimap.fillStyle(0xff0000);
            this.minimap.fillRect(enemyX - 1, enemyY - 1, 2, 2);
        });
    }

    /**
     * Check win/lose conditions
     */
    checkGameEnd() {
        // Win condition: all enemies killed
        if (this.enemiesKilled >= this.totalEnemies) {
            this.endCombat(true);
            return;
        }

        // Lose conditions
        if (this.playerHealth <= 0 || this.timeRemaining <= 0) {
            this.endCombat(false);
            return;
        }
    }

    /**
     * End combat and return to overworld
     */
    endCombat(victory) {
        if (this.isGameOver) return;

        this.isGameOver = true;
        this.isVictory = victory;

        console.log(`Combat ended! Victory: ${victory}, Enemies killed: ${this.enemiesKilled}/${this.totalEnemies}`);

        // Stop music
        if (this.combatMusic) {
            this.combatMusic.stop();
        }

        // Calculate results
        const results = {
            victory: victory,
            enemiesKilled: this.enemiesKilled,
            totalEnemies: this.totalEnemies,
            timeRemaining: Math.max(0, this.timeRemaining),
            playerHealthRemaining: Math.max(0, this.playerHealth),
            comboMax: this.comboCounter,
            difficulty: this.difficulty
        };

        // Update game state
        this.updateGameState(results);

        // Dispatch combat end event
        if (this.dispatch) {
            this.dispatch({
                type: 'COMBAT_END',
                payload: results
            });
        }

        // Call onComplete callback
        if (this.onComplete) {
            this.onComplete(results);
        }

        // Return to overworld scene
        this.scene.stop();
        this.scene.resume('OverworldScene');
    }

    /**
     * Update game state with combat results
     */
    updateGameState(results) {
        if (!this.gameState) return;

        // Health loss
        const healthLoss = this.playerMaxHealth - results.playerHealthRemaining;
        if (healthLoss > 0) {
            this.gameState.stats.endurance = Math.max(1, this.gameState.stats.endurance - 1);
        }

        // XP gain
        const xpGain = results.enemiesKilled * 10;
        this.gameState.stats.experience += xpGain;

        // Weapon durability loss
        if (this.equippedWeapon && this.equippedWeapon.condition) {
            this.equippedWeapon.condition = Math.max(0, this.equippedWeapon.condition - 5);
        }

        // Time advancement (combat takes time)
        const timeSpent = (90000 - results.timeRemaining) / 1000 / 60; // minutes
        this.gameState.overworld.time += Math.floor(timeSpent * 60); // add minutes in seconds

        console.log(`Game state updated: -${healthLoss} health, +${xpGain} XP, ${timeSpent.toFixed(1)} minutes passed`);
    }
}
