class GameFixed {
    constructor() {
        this.player1Canvas = document.getElementById('player1-canvas');
        this.player2Canvas = document.getElementById('player2-canvas');
        
        this.renderer1 = new Renderer3D(this.player1Canvas);
        this.renderer2 = new Renderer3D(this.player2Canvas);
        
        this.inputManager = new InputManager();
        this.controls = new Controls(this.inputManager);
        
        this.ship1 = new Ship(-30, 0, 50, 1);
        this.ship2 = new Ship(30, 0, 50, 2);
        
        this.gameState = 'playing';
        this.winner = null;
        
        this.stars = this.generateStars(200);
        
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
        console.log('Game initialized');
        console.log('Ship 1 initial position:', this.ship1.position);
        console.log('Ship 2 initial position:', this.ship2.position);
        this.updateLifeDisplay();
        this.gameLoop();
    }

    updateLifeDisplay() {
        // Update health bars
        const health1 = document.getElementById('health1');
        const health2 = document.getElementById('health2');
        const lives1 = document.getElementById('lives1');
        const lives2 = document.getElementById('lives2');
        
        if (health1) health1.style.width = `${(this.ship1.lives / 5) * 100}%`;
        if (health2) health2.style.width = `${(this.ship2.lives / 5) * 100}%`;
        if (lives1) lives1.textContent = this.ship1.lives;
        if (lives2) lives2.textContent = this.ship2.lives;
    }

    updateDebugDisplay() {
        // Ship 1 debug info
        const pos1x = document.getElementById('pos1x');
        const pos1y = document.getElementById('pos1y');
        const pos1z = document.getElementById('pos1z');
        const rot1x = document.getElementById('rot1x');
        const rot1y = document.getElementById('rot1y');
        const rot1z = document.getElementById('rot1z');
        const vel1 = document.getElementById('vel1');
        const thrust1 = document.getElementById('thrust1');
        
        if (pos1x) pos1x.textContent = Math.round(this.ship1.position.x);
        if (pos1y) pos1y.textContent = Math.round(this.ship1.position.y);
        if (pos1z) pos1z.textContent = Math.round(this.ship1.position.z);
        if (rot1x) rot1x.textContent = (this.ship1.rotation.x * 180 / Math.PI).toFixed(1);
        if (rot1y) rot1y.textContent = (this.ship1.rotation.y * 180 / Math.PI).toFixed(1);
        if (rot1z) rot1z.textContent = (this.ship1.rotation.z * 180 / Math.PI).toFixed(1);
        if (vel1) vel1.textContent = this.ship1.velocity.magnitude().toFixed(1);
        if (thrust1) thrust1.textContent = this.ship1.thrust.toFixed(1);

        // Ship 2 debug info
        const pos2x = document.getElementById('pos2x');
        const pos2y = document.getElementById('pos2y');
        const pos2z = document.getElementById('pos2z');
        const rot2x = document.getElementById('rot2x');
        const rot2y = document.getElementById('rot2y');
        const rot2z = document.getElementById('rot2z');
        const vel2 = document.getElementById('vel2');
        const thrust2 = document.getElementById('thrust2');
        
        if (pos2x) pos2x.textContent = Math.round(this.ship2.position.x);
        if (pos2y) pos2y.textContent = Math.round(this.ship2.position.y);
        if (pos2z) pos2z.textContent = Math.round(this.ship2.position.z);
        if (rot2x) rot2x.textContent = (this.ship2.rotation.x * 180 / Math.PI).toFixed(1);
        if (rot2y) rot2y.textContent = (this.ship2.rotation.y * 180 / Math.PI).toFixed(1);
        if (rot2z) rot2z.textContent = (this.ship2.rotation.z * 180 / Math.PI).toFixed(1);
        if (vel2) vel2.textContent = this.ship2.velocity.magnitude().toFixed(1);
        if (thrust2) thrust2.textContent = this.ship2.thrust.toFixed(1);

        // Distance and bearing info
        const distance = this.ship1.distanceTo(this.ship2);
        const distance1 = document.getElementById('distance1');
        const distance2 = document.getElementById('distance2');
        if (distance1) distance1.textContent = Math.round(distance);
        if (distance2) distance2.textContent = Math.round(distance);

        // Calculate bearing (simplified 2D bearing for now)
        const dx = this.ship2.position.x - this.ship1.position.x;
        const dy = this.ship2.position.y - this.ship1.position.y;
        const bearing1 = Math.atan2(dy, dx) * 180 / Math.PI;
        const bearing2 = Math.atan2(-dy, -dx) * 180 / Math.PI;
        
        const bearing1El = document.getElementById('bearing1');
        const bearing2El = document.getElementById('bearing2');
        if (bearing1El) bearing1El.textContent = Math.round(bearing1) + '°';
        if (bearing2El) bearing2El.textContent = Math.round(bearing2) + '°';
        
        // Display currently pressed keys
        const keys1El = document.getElementById('keys1');
        const keys2El = document.getElementById('keys2');
        const pressedKeys = Object.keys(this.inputManager.keys).filter(key => this.inputManager.keys[key]);
        const keyDisplay = pressedKeys.length > 0 ? pressedKeys.join(', ') : 'NONE';
        if (keys1El) keys1El.textContent = keyDisplay;
        if (keys2El) keys2El.textContent = keyDisplay;
    }

    updateTargetingArrows() {
        const arrow1 = document.getElementById('arrow1');
        const arrow2 = document.getElementById('arrow2');
        
        if (arrow1 && arrow2) {
            // Calculate direction to enemy for each player
            const dx1 = this.ship2.position.x - this.ship1.position.x;
            const dy1 = this.ship2.position.y - this.ship1.position.y;
            const angle1 = Math.atan2(dy1, dx1);
            
            const dx2 = this.ship1.position.x - this.ship2.position.x;
            const dy2 = this.ship1.position.y - this.ship2.position.y;
            const angle2 = Math.atan2(dy2, dx2);
            
            // Position arrows at edge of screen pointing toward enemy
            const canvas1 = this.player1Canvas;
            const canvas2 = this.player2Canvas;
            
            const distance = 100; // Distance from center
            const x1 = canvas1.width / 2 + Math.cos(angle1) * distance;
            const y1 = canvas1.height / 2 + Math.sin(angle1) * distance;
            const x2 = canvas2.width / 2 + Math.cos(angle2) * distance;
            const y2 = canvas2.height / 2 + Math.sin(angle2) * distance;
            
            arrow1.style.left = x1 + 'px';
            arrow1.style.top = y1 + 'px';
            arrow1.style.transform = `rotate(${angle1}rad)`;
            
            arrow2.style.left = x2 + 'px';
            arrow2.style.top = y2 + 'px';
            arrow2.style.transform = `rotate(${angle2}rad)`;
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

    update() {
        if (this.gameState !== 'playing') return;

        // Debug: Log every 60 frames (about once per second)
        if (!this.frameCount) this.frameCount = 0;
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
            console.log('Update cycle running, frame:', this.frameCount);
            console.log('Keys currently pressed:', this.inputManager.keys);
        }

        this.controls.updateShip(this.ship1, 1);
        this.controls.updateShip(this.ship2, 2);
        
        this.ship1.update();
        this.ship2.update();

        // Update all debug displays
        this.updateDebugDisplay();
        this.updateTargetingArrows();

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
                this.endGame(0);
            } else if (this.ship1.lives <= 0) {
                this.endGame(2);
            } else if (this.ship2.lives <= 0) {
                this.endGame(1);
            }
        }
    }

    render() {
        this.renderer1.clear();
        this.renderer2.clear();

        // Simple camera positions behind each ship  
        const camera1 = this.ship1.position.add(new Vector3D(0, -30, -50));
        const camera2 = this.ship2.position.add(new Vector3D(0, -30, -50));

        // Render starfield
        this.stars.forEach(star => {
            this.renderer1.drawPoint(star, camera1, '#333', 1);
            this.renderer2.drawPoint(star, camera2, '#333', 1);
        });

        // Draw origin point for reference
        this.renderer1.drawPoint(new Vector3D(0, 0, 0), camera1, '#fff', 3);
        this.renderer2.drawPoint(new Vector3D(0, 0, 0), camera2, '#fff', 3);

        // Draw both ships as points for debugging visibility
        this.renderer1.drawPoint(this.ship1.position, camera1, '#0f0', 8);
        this.renderer1.drawPoint(this.ship2.position, camera1, '#f0f', 8);
        this.renderer2.drawPoint(this.ship1.position, camera2, '#0f0', 8);
        this.renderer2.drawPoint(this.ship2.position, camera2, '#f0f', 8);

        // Try to render ships as wireframes
        try {
            this.ship1.render(this.renderer1, camera1, true); // Force wireframe
            this.ship2.render(this.renderer1, camera1, true);
            this.ship1.render(this.renderer2, camera2, true);
            this.ship2.render(this.renderer2, camera2, true);
        } catch (error) {
            console.log('Ship rendering failed:', error);
        }

        // Draw velocity vectors for debugging
        const vel1End = this.ship1.position.add(this.ship1.velocity.multiply(10));
        const vel2End = this.ship2.position.add(this.ship2.velocity.multiply(10));
        this.renderer1.drawLine(this.ship1.position, vel1End, camera1, '#ff0');
        this.renderer1.drawLine(this.ship2.position, vel2End, camera1, '#f80');
        this.renderer2.drawLine(this.ship1.position, vel1End, camera2, '#ff0');
        this.renderer2.drawLine(this.ship2.position, vel2End, camera2, '#f80');

        // Cockpit and HUD
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
        this.ship1 = new Ship(-30, 0, 50, 1);
        this.ship2 = new Ship(30, 0, 50, 2);
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
    console.log('Starting fixed game...');
    game = new GameFixed();
}

function restartGame() {
    if (game) {
        game.restart();
    }
}