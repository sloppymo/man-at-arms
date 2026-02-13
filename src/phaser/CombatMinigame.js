import { Scene } from 'phaser';

/**
 * Undertale-like combat minigame scene
 * Player avoids projectiles in a bullet hell style
 */
export class CombatMinigame extends Scene {
    constructor() {
        super({ key: 'CombatMinigame' });
    }

    init(data) {
        this.dispatch = data.dispatch;
        this.onComplete = data.onComplete;
        this.difficulty = data.difficulty || 'normal';
        this.enemy = data.enemy || 'unknown';
    }

    preload() {
        // Create simple colored textures for the minigame
        this.load.on('filecomplete', (key) => {
            console.log(`Loaded minigame asset: ${key}`);
        });
    }

    create() {
        console.log('Creating combat minigame scene...');

        // Game area
        const gameWidth = 800;
        const gameHeight = 600;

        // Background
        this.add.rectangle(gameWidth/2, gameHeight/2, gameWidth, gameHeight, 0x000000);

        // Player (heart/soul like in Undertale)
        const graphics = this.add.graphics();
        graphics.fillStyle(0xff0000, 1);
        graphics.fillRect(0, 0, 16, 16);
        graphics.generateTexture('player-heart', 16, 16);
        graphics.destroy();

        this.player = this.add.sprite(gameWidth/2, gameHeight - 100, 'player-heart');
        this.player.setDepth(10);

        // Player stats
        this.playerHealth = 3;
        this.maxHealth = 3;
        this.gameTime = 0;
        this.gameDuration = 15000; // 15 seconds (reduced duration)
        this.projectileSpeed = 200; // pixels per second (faster projectiles)
        this.spawnRate = 1000; // milliseconds between spawns (increased frequency)

        // Projectiles group
        this.projectiles = this.add.group();

        // Health display
        this.healthText = this.add.text(10, 10, `Health: ${this.playerHealth}/${this.maxHealth}`, {
            fontSize: '20px',
            color: '#ffffff'
        });

        // Time display
        this.timeText = this.add.text(10, 40, `Time: 0s`, {
            fontSize: '20px',
            color: '#ffffff'
        });

        // Instructions
        this.add.text(gameWidth/2, 50, 'AVOID THE ATTACKS!\nUse WASD or Arrow Keys to move', {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Spawn projectiles
        this.spawnTimer = this.time.addEvent({
            delay: this.spawnRate,
            callback: this.spawnProjectile,
            callbackScope: this,
            loop: true
        });

        // Game timer
        this.gameTimer = this.time.addEvent({
            delay: this.gameDuration,
            callback: this.endGame,
            callbackScope: this,
            args: [true] // success
        });

        console.log('Combat minigame created successfully');
    }

    update(time, delta) {
        // Update game time
        this.gameTime += delta;
        const seconds = Math.floor(this.gameTime / 1000);
        this.timeText.setText(`Time: ${seconds}s`);

        // Player movement
        const speed = 200;
        let moveX = 0;
        let moveY = 0;

        if (this.cursors.left.isDown || this.wasdKeys.A.isDown) moveX = -speed;
        if (this.cursors.right.isDown || this.wasdKeys.D.isDown) moveX = speed;
        if (this.cursors.up.isDown || this.wasdKeys.W.isDown) moveY = -speed;
        if (this.cursors.down.isDown || this.wasdKeys.S.isDown) moveY = speed;

        // Apply movement
        this.player.x += moveX * (delta / 1000);
        this.player.y += moveY * (delta / 1000);

        // Keep player in bounds
        this.player.x = Phaser.Math.Clamp(this.player.x, 50, 750);
        this.player.y = Phaser.Math.Clamp(this.player.y, 100, 550);

        // Check collisions
        this.checkCollisions();

        // Move projectiles
        this.projectiles.children.each(projectile => {
            projectile.y += this.projectileSpeed * (delta / 1000);

            // Remove if off screen
            if (projectile.y > 600) {
                projectile.destroy();
            }
        });
    }

    spawnProjectile() {
        for (let i = 0; i < 3; i++) {
            const x = Phaser.Math.Between(50, 750);
            const projectile = this.add.circle(x, 0, 8, 0xff0000);
            this.projectiles.add(projectile);
        }
    }

    checkCollisions() {
        this.projectiles.children.each(projectile => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                projectile.x, projectile.y
            );

            if (distance < 20) { // Collision radius
                this.playerHit();
                projectile.destroy();
            }
        });
    }

    playerHit() {
        this.playerHealth--;
        this.healthText.setText(`Health: ${this.playerHealth}/${this.maxHealth}`);

        // Flash player red
        this.player.setTint(0xff0000);
        this.time.delayedCall(200, () => {
            this.player.clearTint();
        });

        if (this.playerHealth <= 0) {
            this.endGame(false); // failure
        }
    }

    endGame(success) {
        // Stop timers
        if (this.spawnTimer) this.spawnTimer.destroy();
        if (this.gameTimer) this.gameTimer.destroy();

        // Calculate score based on time survived and health remaining
        const timeBonus = Math.floor(this.gameTime / 1000);
        const healthBonus = this.playerHealth;
        const score = timeBonus + (healthBonus * 10);

        // Show result
        const resultText = success ? 'SUCCESS!' : 'DEFEATED!';
        const scoreText = `Score: ${score}`;

        this.add.text(400, 300, resultText, {
            fontSize: '48px',
            color: success ? '#00ff00' : '#ff0000'
        }).setOrigin(0.5);

        this.add.text(400, 350, scoreText, {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Return to previous scene after delay
        this.time.delayedCall(3000, () => {
            if (this.onComplete) {
                this.onComplete({ success, score, timeSurvived: Math.floor(this.gameTime / 1000) });
            }
            this.scene.stop();
        });
    }
}
