class Game {
    constructor() {
        this.player1Canvas = document.getElementById('player1-canvas');
        this.player2Canvas = document.getElementById('player2-canvas');
        
        this.renderer1 = new Renderer3D(this.player1Canvas);
        this.renderer2 = new Renderer3D(this.player2Canvas);
        
        this.camera1 = new Camera3D();
        this.camera2 = new Camera3D();
        
        this.camera1.setAspect(this.player1Canvas.width, this.player1Canvas.height);
        this.camera2.setAspect(this.player2Canvas.width, this.player2Canvas.height);
        
        this.inputManager = new InputManager();
        this.controls = new Controls(this.inputManager);
        
        this.ship1 = new Ship(-50, 0, 100, 1);
        this.ship2 = new Ship(50, 0, -100, 2);
        
        this.gameState = 'playing'; // 'playing', 'gameOver'
        this.winner = null;
        
        this.stars = this.generateStars(300);
        
        this.init();
    }

    generateStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push(new Vector3D(
                (Math.random() - 0.5) * 1000,
                (Math.random() - 0.5) * 1000,
                (Math.random() - 0.5) * 1000
            ));
        }
        return stars;
    }

    init() {
        this.updateLifeDisplay();
        this.gameLoop();
    }

    updateLifeDisplay() {
        const player1Lives = document.querySelectorAll('.player1-section .life');
        const player2Lives = document.querySelectorAll('.player2-section .life');
        
        player1Lives.forEach((life, index) => {
            life.classList.toggle('active', index < this.ship1.lives);
            life.classList.toggle('inactive', index >= this.ship1.lives);
        });
        
        player2Lives.forEach((life, index) => {
            life.classList.toggle('active', index < this.ship2.lives);
            life.classList.toggle('inactive', index >= this.ship2.lives);
        });
    }

    update() {
        if (this.gameState !== 'playing') return;

        this.controls.updateShip(this.ship1, 1);
        this.controls.updateShip(this.ship2, 2);
        
        this.ship1.update();
        this.ship2.update();

        if (this.ship1.checkProjectileCollisions(this.ship2)) {
            this.updateLifeDisplay();
            if (this.ship2.lives <= 0) {
                this.endGame(1);
            }
        }

        if (this.ship2.checkProjectileCollisions(this.ship1)) {
            this.updateLifeDisplay();
            if (this.ship1.lives <= 0) {
                this.endGame(2);
            }
        }

        const shipDistance = this.ship1.distanceTo(this.ship2);
        if (shipDistance < (this.ship1.getCollisionRadius() + this.ship2.getCollisionRadius())) {
            this.ship1.takeDamage();
            this.ship2.takeDamage();
            this.updateLifeDisplay();
            
            const repelForce = this.ship1.position.subtract(this.ship2.position).normalize().multiply(2);
            this.ship1.velocity = this.ship1.velocity.add(repelForce);
            this.ship2.velocity = this.ship2.velocity.add(repelForce.multiply(-1));
            
            if (this.ship1.lives <= 0 && this.ship2.lives <= 0) {
                this.endGame(0); // Draw
            } else if (this.ship1.lives <= 0) {
                this.endGame(2);
            } else if (this.ship2.lives <= 0) {
                this.endGame(1);
            }
        }
    }

    renderCockpitFrame(renderer, color) {
        const ctx = renderer.ctx;
        const centerX = renderer.centerX;
        const centerY = renderer.centerY;
        const width = renderer.width;
        const height = renderer.height;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 5;

        ctx.beginPath();
        ctx.moveTo(0, height * 0.6);
        ctx.lineTo(width * 0.15, height * 0.4);
        ctx.lineTo(width * 0.15, height * 0.2);
        ctx.lineTo(width * 0.85, height * 0.2);
        ctx.lineTo(width * 0.85, height * 0.4);
        ctx.lineTo(width, height * 0.6);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(width * 0.15, height * 0.2);
        ctx.lineTo(centerX, height * 0.1);
        ctx.lineTo(width * 0.85, height * 0.2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX - 80, height * 0.2);
        ctx.lineTo(centerX - 80, height * 0.4);
        ctx.moveTo(centerX + 80, height * 0.2);
        ctx.lineTo(centerX + 80, height * 0.4);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
    }

    renderHUDElements(renderer, ship, color) {
        const ctx = renderer.ctx;
        const width = renderer.width;
        const height = renderer.height;

        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 1;
        ctx.font = '12px Courier New';

        ctx.beginPath();
        ctx.rect(10, height - 80, 60, 60);
        ctx.stroke();

        const radarCenterX = 40;
        const radarCenterY = height - 50;
        ctx.beginPath();
        ctx.arc(radarCenterX, radarCenterY, 25, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(radarCenterX - 25, radarCenterY);
        ctx.lineTo(radarCenterX + 25, radarCenterY);
        ctx.moveTo(radarCenterX, radarCenterY - 25);
        ctx.lineTo(radarCenterX, radarCenterY + 25);
        ctx.stroke();

        ctx.beginPath();
        ctx.rect(width - 120, height - 60, 110, 50);
        ctx.stroke();

        ctx.fillText('THRUST', width - 115, height - 45);
        const thrustBar = ship.thrust * 90;
        ctx.beginPath();
        ctx.rect(width - 115, height - 30, thrustBar, 8);
        ctx.fill();

        ctx.fillText('SPEED', width - 115, height - 15);
        const speedBar = (ship.velocity.magnitude() / ship.maxSpeed) * 90;
        ctx.beginPath();
        ctx.rect(width - 115, height - 5, speedBar, 8);
        ctx.fill();
    }

    render() {
        this.renderer1.clear();
        this.renderer2.clear();

        // Update cameras to follow ships
        this.camera1.followShip(this.ship1, new Vector3D(0, -20, -40));
        this.camera2.followShip(this.ship2, new Vector3D(0, -20, -40));

        // Render starfield
        this.stars.forEach(star => {
            this.renderer1.drawPoint(star, this.camera1, '#333', 1);
            this.renderer2.drawPoint(star, this.camera2, '#333', 1);
        });

        // Render ships with 3D models
        this.ship1.render(this.renderer1, this.camera1, false);
        this.ship2.render(this.renderer1, this.camera1, false);

        this.ship1.render(this.renderer2, this.camera2, false);
        this.ship2.render(this.renderer2, this.camera2, false);

        // Render distance info
        const distancePos1 = this.ship1.position.add(new Vector3D(-50, 40, 30));
        const distancePos2 = this.ship2.position.add(new Vector3D(-50, 40, 30));
        
        this.renderer1.drawText(`Distance: ${Math.round(this.ship1.distanceTo(this.ship2))}`, 
                               distancePos1, this.camera1, '#0f0');
        this.renderer2.drawText(`Distance: ${Math.round(this.ship1.distanceTo(this.ship2))}`, 
                               distancePos2, this.camera2, '#f0f');

        // Render cockpit frames and HUD
        this.renderCockpitFrame(this.renderer1, '#0f0');
        this.renderCockpitFrame(this.renderer2, '#f0f');

        this.renderHUDElements(this.renderer1, this.ship1, '#0f0');
        this.renderHUDElements(this.renderer2, this.ship2, '#f0f');
    }

    endGame(winnerPlayer) {
        this.gameState = 'gameOver';
        this.winner = winnerPlayer;
        
        const gameOverDiv = document.getElementById('gameOver');
        const winnerText = document.getElementById('winnerText');
        
        if (winnerPlayer === 0) {
            winnerText.textContent = 'DRAW!';
        } else {
            winnerText.textContent = `PLAYER ${winnerPlayer} WINS!`;
        }
        
        gameOverDiv.style.display = 'block';
    }

    restart() {
        this.ship1 = new Ship(-50, 0, 100, 1);
        this.ship2 = new Ship(50, 0, -100, 2);
        this.gameState = 'playing';
        this.winner = null;
        
        document.getElementById('gameOver').style.display = 'none';
        this.updateLifeDisplay();
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

let game;

function startGame() {
    game = new Game();
}

function restartGame() {
    if (game) {
        game.restart();
    }
}

document.addEventListener('DOMContentLoaded', startGame);