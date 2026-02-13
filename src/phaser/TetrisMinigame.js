import { Scene } from 'phaser';

/**
 * Tetris clone minigame scene
 * Classic falling blocks with line clearing
 */
export class TetrisMinigame extends Scene {
    constructor() {
        super({ key: 'TetrisMinigame' });
    }

    init(data) {
        this.onComplete = data.onComplete;
        this.difficulty = data.difficulty || 'normal';
    }

    preload() {
        // Create simple colored textures for blocks
        this.load.on('filecomplete', (key) => {
            console.log(`Loaded tetris asset: ${key}`);
        });
    }

    create() {
        console.log('Creating Tetris minigame scene...');

        // Game area
        const gameWidth = 800;
        const gameHeight = 600;

        // Background
        this.add.rectangle(gameWidth/2, gameHeight/2, gameWidth, gameHeight, 0x000000);

        // Game constants
        this.BLOCK_SIZE = 30;
        this.GRID_WIDTH = 10;
        this.GRID_HEIGHT = 20;
        this.GAME_DURATION = 30000; // 30 seconds

        // Initialize grid
        this.grid = Array(this.GRID_HEIGHT).fill().map(() => Array(this.GRID_WIDTH).fill(0));

        // Tetromino shapes
        this.shapes = {
            I: [[1, 1, 1, 1]],
            O: [[1, 1], [1, 1]],
            T: [[0, 1, 0], [1, 1, 1]],
            S: [[0, 1, 1], [1, 1, 0]],
            Z: [[1, 1, 0], [0, 1, 1]],
            J: [[1, 0, 0], [1, 1, 1]],
            L: [[0, 0, 1], [1, 1, 1]]
        };

        this.colors = {
            I: 0x00ffff,
            O: 0xffff00,
            T: 0x800080,
            S: 0x00ff00,
            Z: 0xff0000,
            J: 0x0000ff,
            L: 0xffa500
        };

        // Game state
        this.currentPiece = null;
        this.currentX = 0;
        this.currentY = 0;
        this.currentShape = null;
        this.gameTime = 0;
        this.score = 0;
        this.linesCleared = 0;
        this.fallSpeed = 500; // milliseconds
        this.lastFall = 0;

        // UI
        this.scoreText = this.add.text(650, 50, `Score: ${this.score}`, {
            fontSize: '20px',
            color: '#ffffff'
        });

        this.linesText = this.add.text(650, 80, `Lines: ${this.linesCleared}`, {
            fontSize: '20px',
            color: '#ffffff'
        });

        this.timeText = this.add.text(650, 110, `Time: 0s`, {
            fontSize: '20px',
            color: '#ffffff'
        });

        // Instructions
        this.add.text(gameWidth/2, 50, 'TETRIS\nA/D: Move\nS: Soft Drop\nW: Rotate\nClear lines to score!', {
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

        // Start game
        this.spawnPiece();

        // Game timer
        this.gameTimer = this.time.addEvent({
            delay: this.GAME_DURATION,
            callback: this.endGame,
            callbackScope: this,
            args: [true]
        });

        console.log('Tetris minigame created successfully');
    }

    update(time, delta) {
        // Update game time
        this.gameTime += delta;
        const seconds = Math.floor(this.gameTime / 1000);
        this.timeText.setText(`Time: ${seconds}s`);

        // Handle input
        this.handleInput(delta);

        // Auto-fall
        this.lastFall += delta;
        if (this.lastFall >= this.fallSpeed) {
            this.moveDown();
            this.lastFall = 0;
        }

        // Render grid
        this.renderGrid();
    }

    handleInput(delta) {
        if (!this.currentPiece) return;

        // Move left
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.wasdKeys.A)) {
            if (this.canMove(this.currentX - 1, this.currentY, this.currentShape)) {
                this.currentX--;
            }
        }

        // Move right
        if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.wasdKeys.D)) {
            if (this.canMove(this.currentX + 1, this.currentY, this.currentShape)) {
                this.currentX++;
            }
        }

        // Rotate
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.wasdKeys.W)) {
            const rotated = this.rotatePiece(this.currentShape);
            if (this.canMove(this.currentX, this.currentY, rotated)) {
                this.currentShape = rotated;
            }
        }

        // Soft drop
        if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
            this.moveDown();
        }
    }

    spawnPiece() {
        const shapeKeys = Object.keys(this.shapes);
        const randomShape = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
        this.currentShape = this.shapes[randomShape];
        this.currentPiece = randomShape;
        this.currentX = Math.floor(this.GRID_WIDTH / 2) - Math.floor(this.currentShape[0].length / 2);
        this.currentY = 0;

        // Check game over
        if (!this.canMove(this.currentX, this.currentY, this.currentShape)) {
            this.endGame(false);
        }
    }

    moveDown() {
        if (this.canMove(this.currentX, this.currentY + 1, this.currentShape)) {
            this.currentY++;
        } else {
            // Place piece
            this.placePiece();
            this.clearLines();
            this.spawnPiece();
        }
    }

    canMove(x, y, shape) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = x + col;
                    const newY = y + row;

                    if (newX < 0 || newX >= this.GRID_WIDTH || newY >= this.GRID_HEIGHT ||
                        (newY >= 0 && this.grid[newY][newX])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    rotatePiece(shape) {
        const rows = shape.length;
        const cols = shape[0].length;
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                rotated[col][rows - 1 - row] = shape[row][col];
            }
        }
        return rotated;
    }

    placePiece() {
        for (let row = 0; row < this.currentShape.length; row++) {
            for (let col = 0; col < this.currentShape[row].length; col++) {
                if (this.currentShape[row][col]) {
                    const gridX = this.currentX + col;
                    const gridY = this.currentY + row;
                    if (gridY >= 0) {
                        this.grid[gridY][gridX] = this.currentPiece;
                    }
                }
            }
        }
    }

    clearLines() {
        let linesCleared = 0;

        for (let row = this.GRID_HEIGHT - 1; row >= 0; row--) {
            if (this.grid[row].every(cell => cell !== 0)) {
                // Clear line
                this.grid.splice(row, 1);
                this.grid.unshift(Array(this.GRID_WIDTH).fill(0));
                linesCleared++;
                row++; // Check the same row again
            }
        }

        if (linesCleared > 0) {
            this.linesCleared += linesCleared;
            this.score += linesCleared * 100 * linesCleared; // Bonus for multiple lines
            this.scoreText.setText(`Score: ${this.score}`);
            this.linesText.setText(`Lines: ${this.linesCleared}`);
        }
    }

    renderGrid() {
        // Clear previous blocks
        if (this.blockGraphics) {
            this.blockGraphics.destroy();
        }

        this.blockGraphics = this.add.graphics();

        // Draw grid
        for (let row = 0; row < this.GRID_HEIGHT; row++) {
            for (let col = 0; col < this.GRID_WIDTH; col++) {
                if (this.grid[row][col]) {
                    const color = this.colors[this.grid[row][col]];
                    this.blockGraphics.fillStyle(color, 1);
                    this.blockGraphics.fillRect(
                        200 + col * this.BLOCK_SIZE,
                        100 + row * this.BLOCK_SIZE,
                        this.BLOCK_SIZE,
                        this.BLOCK_SIZE
                    );
                    this.blockGraphics.lineStyle(2, 0xffffff, 0.5);
                    this.blockGraphics.strokeRect(
                        200 + col * this.BLOCK_SIZE,
                        100 + row * this.BLOCK_SIZE,
                        this.BLOCK_SIZE,
                        this.BLOCK_SIZE
                    );
                }
            }
        }

        // Draw current piece
        if (this.currentPiece && this.currentShape) {
            const color = this.colors[this.currentPiece];
            this.blockGraphics.fillStyle(color, 1);

            for (let row = 0; row < this.currentShape.length; row++) {
                for (let col = 0; col < this.currentShape[row].length; col++) {
                    if (this.currentShape[row][col]) {
                        this.blockGraphics.fillRect(
                            200 + (this.currentX + col) * this.BLOCK_SIZE,
                            100 + (this.currentY + row) * this.BLOCK_SIZE,
                            this.BLOCK_SIZE,
                            this.BLOCK_SIZE
                        );
                        this.blockGraphics.lineStyle(2, 0xffffff, 0.5);
                        this.blockGraphics.strokeRect(
                            200 + (this.currentX + col) * this.BLOCK_SIZE,
                            100 + (this.currentY + row) * this.BLOCK_SIZE,
                            this.BLOCK_SIZE,
                            this.BLOCK_SIZE
                        );
                    }
                }
            }
        }
    }

    endGame(success) {
        // Stop timer
        if (this.gameTimer) this.gameTimer.destroy();

        // Show result
        const resultText = success ? 'TIME UP!' : 'GAME OVER!';
        const scoreText = `Final Score: ${this.score}\nLines: ${this.linesCleared}`;

        this.add.text(400, 300, resultText, {
            fontSize: '48px',
            color: success ? '#00ff00' : '#ff0000'
        }).setOrigin(0.5);

        this.add.text(400, 350, scoreText, {
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Return after delay
        this.time.delayedCall(3000, () => {
            if (this.onComplete) {
                this.onComplete({ success, score: this.score, lines: this.linesCleared, timeSurvived: Math.floor(this.gameTime / 1000) });
            }
            this.scene.stop();
        });
    }
}
